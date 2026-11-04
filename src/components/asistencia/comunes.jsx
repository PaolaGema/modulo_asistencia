import { Search, ScanFace, MapPinCheck, MapPinX, House, Building2, Warehouse, X } from 'lucide-react'
import Avatar from '../personas/Avatar'
import Desplegable from '../layout/Desplegable'
import { fotoDe } from '../../pages/personas/colaboradoresData'
import { ESTADOS, aMin, hhmm } from '../../data/asistenciaData'
import { estadoDelDia } from './estadoDia'
import './asistencia.css'

/* ── ASISTENCIA · EL VOCABULARIO VISUAL ────────────────────────────────────
   Las piezas que se repiten en todas las pantallas del módulo. Prefijo `at-`; los tonos son los de
   Documentación (`--dc-*`), que ya tienen su versión oscura y contraste AA. */


/* El estado solo, en la píldora de color: calendarios, listas cortas y leyendas. */
export function EstadoChip({ estado, pequeno }) {
  const e = ESTADOS[estado]
  if (!e) return null
  return <span className={`at-pl t-${e.tono}${pequeno ? ' at-pl-sm' : ''}`} title={e.desc}><i aria-hidden="true" />{e.label}</span>
}

export function EstadoDia({ persona, jornada, ahora }) {
  const est = estadoDelDia(persona, jornada, ahora)
  return (
    <div className="at-estado-s2">
      <span className={`at-pl t-${est.tono}`}><i aria-hidden="true" />{est.label}</span>
      {est.linea && <small className={est.tono === 'ambar' || est.tono === 'rojo' ? `t-${est.tono}` : ''}>{est.linea}</small>}
    </div>
  )
}

/* La persona con lo que importa en asistencia: su unidad y dónde marca. */
export function PersonaAt({ persona, size = 32, sub, onClick }) {
  if (!persona) return <span className="dc-muted">—</span>
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} className={`dc-persona${onClick ? ' dc-persona-link' : ''}`} onClick={onClick}>
      <Avatar persona={persona} size={size} />
      <span className="dc-persona-txt">
        <span className="dc-persona-nom">{persona.name}</span>
        <span className="dc-persona-sub">{sub ?? `${persona.unidad} · ${persona.lugar?.nombre || persona.sedeNombre || 'Sin lugar'}`}</span>
      </span>
    </Tag>
  )
}

/* LA SELFIE DE LA MARCACIÓN. En la maqueta es el retrato de la persona; el aro dice si el rostro
   coincidió. Nunca va sola: al lado va el puntaje. */
export function Selfie({ persona, marca, size = 40 }) {
  const foto = fotoDe(persona)
  const tono = marca?.rechazada === 'rostro' ? 'rojo' : marca?.score != null ? 'verde' : 'gris'
  return (
    <span className={`at-selfie at-selfie-${tono}`} style={{ width: size, height: size }}>
      {foto
        ? <img src={foto} alt={`Selfie de ${persona.name}`} style={marca?.rechazada === 'rostro' ? { filter: 'grayscale(.6) blur(.4px)' } : undefined} />
        : <span style={{ background: persona.color, fontSize: size * 0.36 }}>{persona.initials}</span>}
    </span>
  )
}

/* Rostro y ubicación de una marca, en dos chips que se leen sin color. */
export function Verificacion({ marca, compacto }) {
  if (!marca) return null
  const piezas = []
  if (marca.origen === 'panel') piezas.push(<span key="m" className="dc-chip dc-chip-sm dc-t-violeta" title={marca.motivo}>Manual</span>)
  if (marca.score != null) {
    const ok = marca.rechazada !== 'rostro'
    piezas.push(
      <span key="r" className={`dc-chip dc-chip-sm dc-t-${ok ? 'verde' : 'rojo'}`} title="Parecido con su rostro registrado">
        <ScanFace size={11} aria-hidden="true" /> {compacto ? `${Math.round(marca.score * 100)}%` : `Rostro ${Math.round(marca.score * 100)}%`}
      </span>,
    )
  }
  if (marca.remoto) piezas.push(<span key="g" className="dc-chip dc-chip-sm dc-t-azul"><House size={11} aria-hidden="true" /> Remoto</span>)
  else if (marca.dentro != null) {
    const Ico = marca.dentro ? MapPinCheck : MapPinX
    piezas.push(
      <span key="g" className={`dc-chip dc-chip-sm dc-t-${marca.dentro ? 'verde' : 'rojo'}`} title="Distancia al centro de la geocerca">
        <Ico size={11} aria-hidden="true" /> {marca.distancia} m
      </span>,
    )
  }
  return <span className="at-verif">{piezas}</span>
}

/* ── LA BARRA DEL DÍA ──
   De 06:00 a 22:00. Lo programado es la banda rayada; lo trabajado, el tramo verde; las pausas, los
   huecos; y cada marca, un punto. Con eso se lee de un golpe si llegó tarde, si se fue antes y si
   se quedó de más, sin leer una sola hora. */
const INI = 6 * 60; const FIN = 22 * 60
const pct = m => `${Math.min(100, Math.max(0, ((m - INI) / (FIN - INI)) * 100))}%`
export function BarraDia({ jornada, horario, ahora, grande, onMarca }) {
  const marcas = jornada.marcas.filter(m => !m.rechazada && !m.anulada)
  const tramos = []
  let abierto = null
  for (const m of marcas) {
    if (m.tipo === 'entrada' || m.tipo === 'pausa_fin') abierto = m.min
    if ((m.tipo === 'pausa_inicio' || m.tipo === 'salida') && abierto != null) { tramos.push([abierto, m.min]); abierto = null }
  }
  if (abierto != null && ahora != null) tramos.push([abierto, ahora, true])
  const prog = horario?.modo === 'fijo' && jornada.laboral ? [aMin(horario.entrada), aMin(horario.salida)] : null
  return (
    <div className={`at-barra${grande ? ' grande' : ''}`} role="img" aria-label={`Entrada ${hhmm(jornada.entrada)}, salida ${hhmm(jornada.salida)}`}>
      <div className="at-barra-pista">
        {prog && <span className="at-barra-prog" style={{ left: pct(prog[0]), width: `calc(${pct(prog[1])} - ${pct(prog[0])})` }} />}
        {tramos.map(([a, b, vivo], i) => (
          <span key={i} className={`at-barra-tramo${vivo ? ' vivo' : ''}${jornada.llegoTarde && i === 0 ? ' tarde' : ''}`} style={{ left: pct(a), width: `calc(${pct(b)} - ${pct(a)})` }} />
        ))}
        {grande && marcas.map(m => (
          <button key={m.id} type="button" className={`at-barra-punto t-${m.tipo}`} style={{ left: pct(m.min) }} title={`${hhmm(m.min)}`} onClick={() => onMarca?.(m)} tabIndex={onMarca ? 0 : -1} />
        ))}
        {ahora != null && <span className="at-barra-ahora" style={{ left: pct(ahora) }} />}
      </div>
      {grande && (
        <div className="at-barra-escala" aria-hidden="true">
          {[6, 8, 10, 12, 14, 16, 18, 20, 22].map(h => <span key={h} style={{ left: pct(h * 60) }}>{String(h).padStart(2, '0')}</span>)}
        </div>
      )}
    </div>
  )
}

/* ── EL RADAR DE LA GEOCERCA ──
   Un círculo es el radio permitido y el punto es donde estaba la persona. El ángulo es de mentira
   —sale del id— pero la distancia es la de verdad, y es lo único que se lee. */
export function Radar({ distancia, radio = 150, dentro, size = 120, animado }) {
  const c = size / 2
  const escala = Math.max(radio * 1.6, (distancia || 0) * 1.15)
  const rCerca = (radio / escala) * (c - 6)
  const rPunto = distancia != null ? Math.min(c - 6, (distancia / escala) * (c - 6)) : null
  const ang = 2.3
  return (
    <svg className={`at-radar${animado ? ' animado' : ''}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={distancia != null ? `A ${distancia} metros; radio permitido ${radio} metros` : 'Sin ubicación'}>
      <circle cx={c} cy={c} r={c - 2} className="at-radar-fondo" />
      <circle cx={c} cy={c} r={(c - 6) * 0.66} className="at-radar-anillo" />
      <circle cx={c} cy={c} r={(c - 6) * 0.33} className="at-radar-anillo" />
      <circle cx={c} cy={c} r={rCerca} className={`at-radar-cerca${dentro === false ? ' fuera' : ''}`} />
      {animado && <circle cx={c} cy={c} r={rCerca} className="at-radar-onda" />}
      <circle cx={c} cy={c} r={3} className="at-radar-centro" />
      {rPunto != null && (
        <g className={`at-radar-punto${dentro === false ? ' fuera' : ''}`}>
          <circle cx={c + rPunto * Math.cos(ang)} cy={c - rPunto * Math.sin(ang)} r={9} className="halo" />
          <circle cx={c + rPunto * Math.cos(ang)} cy={c - rPunto * Math.sin(ang)} r={4.5} />
        </g>
      )}
    </svg>
  )
}

/* ── EL ANILLO ── una proporción grande y legible. */
export function Anillo({ partes, total, size = 168, grosor = 14, children }) {
  const r = (size - grosor) / 2
  const C = 2 * Math.PI * r
  const arcos = partes.filter(p => p.valor > 0).reduce((acc, p) => {
    const desde = acc.length ? acc[acc.length - 1].hasta : 0
    return [...acc, { ...p, desde, hasta: desde + (total ? (p.valor / total) * C : 0) }]
  }, [])
  return (
    <div className="at-anillo" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-canal)" strokeWidth={grosor} />
        {arcos.map(p => (
          <circle key={p.key} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.color} strokeWidth={grosor}
            strokeDasharray={`${Math.max(0, p.hasta - p.desde - 2)} ${C}`} strokeDashoffset={-p.desde} strokeLinecap="butt"
            transform={`rotate(-90 ${size / 2} ${size / 2})`} className="at-anillo-arco" />
        ))}
      </svg>
      <div className="at-anillo-centro">{children}</div>
    </div>
  )
}

/* ── LOS FILTROS DE LA ORGANIZACIÓN ──
   Sucursal, centro de trabajo y unidad organizacional: los mismos tres ejes que define el módulo
   de Organización, y en ese orden —de lo físico a lo organizacional—. El centro se acota a la
   sucursal elegida. */
// eslint-disable-next-line react-refresh/only-export-components
export const FILTRO_VACIO = { sucursal: '', centro: '', unidad: '' }
// eslint-disable-next-line react-refresh/only-export-components
export function filtrar(personas, f) {
  return personas.filter(p =>
    (!f.sucursal || p.sucursalId === f.sucursal)
    && (!f.centro || p.centroId === f.centro)
    && (!f.unidad || p.unidad === f.unidad))
}
export function FiltrosOrg({ valor, onCambio, lugares, personas }) {
  const sucursales = lugares.filter(l => l.tipo === 'sucursal')
  const centros = lugares.filter(l => l.tipo === 'centro' && (!valor.sucursal || l.sucursalId === valor.sucursal))
  const unidades = [...new Set(personas.map(p => p.unidad))].sort()
  const defs = [
    { k: 'sucursal', ph: 'Todas las sucursales', Icono: Building2, ops: sucursales.map(s => ({ valor: s.id, etiqueta: s.nombre })) },
    { k: 'centro', ph: 'Todos los centros de trabajo', Icono: Warehouse, ops: centros.map(c => ({ valor: c.id, etiqueta: c.nombre })) },
    { k: 'unidad', ph: 'Todas las unidades', Icono: null, ops: unidades.map(u => ({ valor: u, etiqueta: u })) },
  ]
  const cambiar = (k, v) => {
    const n = { ...valor, [k]: v }
    if (k === 'sucursal' && n.centro && !lugares.some(l => l.id === n.centro && l.sucursalId === v)) n.centro = ''
    onCambio(n)
  }
  return (
    <div className="dc-filtros at-filtros" role="group" aria-label="Filtrar por la organización">
      {defs.map(d => (
        <div key={d.k} className={`dc-filtro${valor[d.k] ? ' on' : ''}`}>
          {valor[d.k] && (
            <button type="button" className="dc-filtro-quitar" aria-label={`Quitar el filtro: ${d.ph.toLowerCase()}`} onClick={() => cambiar(d.k, '')}>
              <X size={13} aria-hidden="true" />
            </button>
          )}
          <Desplegable valor={valor[d.k] || ''} opciones={[{ valor: '', etiqueta: d.ph }, ...d.ops]} placeholder={d.ph} ariaLabel={d.ph} onCambio={v => cambiar(d.k, v)} conBuscador={d.ops.length > 8} />
        </div>
      ))}
    </div>
  )
}

/* ── LA BARRA DE BUSCAR Y FILTRAR ──
   La misma estructura que el resto del producto (Documentación › Expedientes): el buscador SIEMPRE a
   la izquierda y los filtros a su lado, en una sola fila. Buscar y acotar son un solo gesto. */
export function BarraBusqueda({ busca, onBusca, placeholder = 'Buscar persona…', filtro, onFiltro, lugares, personas, children }) {
  return (
    <div className="at-barra-busca">
      <div className="pl-search-wrap at-busca">
        <Search size={13} className="pl-search-ico" />
        <input type="search" className="pl-search" placeholder={placeholder} value={busca} onChange={e => onBusca(e.target.value)} aria-label={placeholder.replace('…', '')} />
      </div>
      {filtro && <FiltrosOrg valor={filtro} onCambio={onFiltro} lugares={lugares} personas={personas} />}
      {children}
    </div>
  )
}

/* Un número grande con su rótulo, y opcionalmente un delta. */
export function Cifra({ valor, rotulo, detalle, tono, Icono, onClick, activo }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} className={`at-cifra${tono ? ` t-${tono}` : ''}${onClick ? ' clic' : ''}${activo ? ' on' : ''}`} onClick={onClick}>
      <span className="at-cifra-top">
        {Icono && <span className="at-cifra-ico"><Icono size={15} aria-hidden="true" /></span>}
        <span className="at-cifra-rot">{rotulo}</span>
      </span>
      <span className="at-cifra-val">{valor}</span>
      {detalle && <span className="at-cifra-det">{detalle}</span>}
    </Tag>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const COLOR_ESTADO = {
  trabajando: 'var(--at-verde)', termino: 'var(--at-verde-2)', presente: 'var(--at-verde)', pausa: 'var(--at-azul)', extra: 'var(--at-azul)',
  tarde: 'var(--at-ambar)', anticipada: 'var(--at-ambar)', porLlegar: 'var(--at-gris)', sinMarcar: 'var(--at-rojo)', ausente: 'var(--at-rojo)',
  justificada: 'var(--at-violeta)', incompleta: 'var(--at-violeta)', libre: 'var(--bg-canal)',
}
