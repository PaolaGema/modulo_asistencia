import { useRef, useState } from 'react'
import { Baby, ChevronRight, Clock, Dumbbell, Eye, FileText, Gift, Globe, HeartPulse, Paperclip, QrCode, Stethoscope, Store, TrendingUp } from 'lucide-react'
import BarraVolver from './BarraVolver'
import SolicitarPermisoPhone from './PermisoPhone'
import { useAsistencia } from '../../context/AsistenciaContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { useMiFicha } from '../../hooks/useMiFicha'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { BENEFICIOS, GRUPOS, FONDO_ANUAL, USOS_FONDO } from '../../data/beneficiosData'
import { MESES, aFecha } from '../../data/asistenciaData'

/* ── MIS BENEFICIOS (opción B1 «Lo suyo primero») ──
   Se abre desde «Ver beneficios» del Inicio y desde «Mis beneficios» de Zona HR. Arriba, en la tarjeta
   destacada, lo que conviene usar ahora —calculado para cada persona: su día de cumpleaños si se acerca,
   lo que le queda del fondo antes de fin de año, o su viernes corto—. Debajo, los saldos que importan y
   todos los beneficios por grupo, filtrables. Cada uno abre su vista: qué es, cómo se usa, sus
   condiciones y el botón para usarlo. */

const C = { texto: 'var(--in-texto)', mute: 'var(--in-mute)', suave: 'var(--in-suave)', carta: 'var(--in-carta)', sombra: 'var(--in-sombra)' }
const ICONOS = { salud: HeartPulse, chequeo: Stethoscope, regalo: Gift, reloj: Clock, crecer: TrendingUp, mundo: Globe, familia: Baby, tienda: Store, pesa: Dumbbell, ojo: Eye }
const ROTULO = { fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', margin: '6px 2px -2px' }
const PILDORA = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, height: 28, padding: '0 14px', borderRadius: 99, border: 'none', background: '#00E091', color: '#0C2D40', fontFamily: 'inherit', fontSize: 8.4, fontWeight: 600, cursor: 'pointer' }
const bs = n => `Bs ${n.toLocaleString('es-BO')}`
const arriba = () => document.querySelector('#marco-telefono .phone-scroll')?.scrollTo(0, 0)

function Aro({ icono, size = 28 }) {
  const I = ICONOS[icono] || Gift
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px #00E091', background: C.carta, display: 'grid', placeItems: 'center', flexShrink: 0, color: C.texto }}>
      <I size={size * 0.43} strokeWidth={1.8} />
    </span>
  )
}

function Etiqueta({ t, verde }) {
  return <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 7px', whiteSpace: 'nowrap', flexShrink: 0, color: verde ? 'var(--tx-verde)' : 'var(--tx-gris)', background: verde ? 'var(--tn-verde)' : 'var(--tn-gris)' }}>{t}</em>
}

function Barra({ parte }) {
  return <i style={{ display: 'block', height: 4, borderRadius: 99, background: 'var(--in-plomo)', overflow: 'hidden', marginTop: 5 }}><i style={{ display: 'block', height: '100%', width: `${Math.round(parte * 100)}%`, background: '#00E091', borderRadius: 99 }} /></i>
}

/* La tarjeta blanca destacada con los círculos menta, la misma de Perfil y Mis documentos. */
function Destacada({ children, centro }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: C.carta, borderRadius: 18, boxShadow: C.sombra, padding: '12px 13px', display: 'grid', gap: 2, justifyItems: centro ? 'center' : 'stretch', textAlign: centro ? 'center' : 'left' }}>
      <i aria-hidden="true" style={{ position: 'absolute', width: 120, height: 120, right: -40, top: -50, borderRadius: '50%', background: 'rgba(0,224,145,.09)' }} />
      <i aria-hidden="true" style={{ position: 'absolute', width: 70, height: 70, right: -12, top: 34, borderRadius: '50%', background: 'rgba(0,224,145,.12)' }} />
      {children}
    </div>
  )
}
const ETI = { position: 'relative', fontSize: 7.2, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: '#0A7F55' }
const TIT = { position: 'relative', fontSize: 12, fontWeight: 600, letterSpacing: '-.01em' }
const LIN = { position: 'relative', fontSize: 7.6, color: C.mute, lineHeight: 1.45 }

/* Un código QR dibujado a partir del texto: no se escanea, pero se ve como el que se mostraría en caja. */
function Qr({ texto }) {
  const n = 21
  const semilla = [...texto].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7)
  // Las tres esquinas con su cuadro de siempre; el resto, puntos que salen del texto.
  const esquina = (i, j) => {
    for (const [a, b] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
      if (i >= a && i < a + 7 && j >= b && j < b + 7) { const y = i - a, z = j - b; return y === 0 || y === 6 || z === 0 || z === 6 || (y >= 2 && y <= 4 && z >= 2 && z <= 4) }
    }
    return null
  }
  const celdas = Array.from({ length: n * n }, (_, k) => {
    const e = esquina(Math.floor(k / n), k % n)
    return e ?? ((semilla * (k + 13) * 37 + k * 11) % 9973) % 3 === 0
  })
  return (
    <div style={{ position: 'relative', width: 116, height: 116, padding: 8, margin: '10px 0 6px', background: '#fff', borderRadius: 12, boxShadow: '0 0 0 1px #E3EAF0', display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)` }}>
      {celdas.map((lleno, k) => <i key={k} style={{ background: lleno ? '#0C2D40' : '#fff' }} />)}
    </div>
  )
}

export default function BeneficiosPhone({ currentUser, onVolver, volverA = 'Inicio' }) {
  const at = useAsistencia()
  const { empresa } = useOnboardingData()
  const { ficha } = useMiFicha(currentUser.name)
  const [usosGuardados, setUsos] = useLocalStorage('beneficios_fondo', {})
  const [grupo, setGrupo] = useState('Todos')
  const [vista, setVista] = useState(null)
  const [aviso, setAviso] = useState(null)
  const ir = v => { setVista(v); arriba() }

  /* El fondo: lo pagado y lo que espera respuesta reservan su parte. */
  const usos = [...(USOS_FONDO[currentUser.name] || []), ...(usosGuardados[currentUser.name] || [])]
  const usado = usos.reduce((s, u) => s + u.monto, 0)
  const libre = Math.max(0, FONDO_ANUAL - usado)
  const finAnio = `${at.hoy.slice(0, 4)}-12-31`
  const diasAlFin = Math.round((aFecha(finAnio) - aFecha(at.hoy)) / 864e5)

  /* Su cumpleaños de este año (o del próximo, si ya pasó), de la ficha. */
  const nacio = ficha?.form?.['1.21']
  let cumple = nacio ? `${at.hoy.slice(0, 4)}${nacio.slice(4)}` : null
  if (cumple && cumple < at.hoy && cumple.slice(5, 7) !== at.hoy.slice(5, 7)) cumple = `${+at.hoy.slice(0, 4) + 1}${nacio.slice(4)}`
  const enSuMes = !!cumple && cumple.slice(0, 7) === at.hoy.slice(0, 7)
  const faltan = cumple ? Math.round((aFecha(cumple) - aFecha(at.hoy)) / 864e5) : null
  const mesCumple = cumple ? MESES[aFecha(cumple).getMonth()] : null
  const fechaLarga = s => `${['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][aFecha(s).getDay()]} ${aFecha(s).getDate()} de ${MESES[aFecha(s).getMonth()]}`

  const estadoDe = b => {
    if (b.id === 'cumple') return enSuMes || (faltan != null && faltan <= 30) ? ['Disponible', true] : mesCumple ? [mesCumple[0].toUpperCase() + mesCumple.slice(1), false] : null
    if (b.id === 'fondo') return libre ? ['Disponible', true] : ['Usado', false]
    return { activo: ['Activo', true], disponible: ['Disponible', true], uno: ['Uno este mes', true], inscrito: ['Inscrito', false], diciembre: ['Diciembre', false], convenio: ['Convenio', false] }[b.estado] || null
  }
  const lineaDe = b => (b.id === 'fondo' ? `${bs(libre)} libres de ${bs(FONDO_ANUAL)}` : b.id === 'cumple' && cumple ? `Su cumpleaños: ${fechaLarga(cumple)}` : b.linea)

  /* LO QUE CONVIENE USAR AHORA, en orden: su cumpleaños si se acerca; lo que le queda del fondo en los
     últimos tres meses del año; si no, su viernes corto. */
  /* Si en Configuración › Días libres el cumpleaños es automático, no hay nada que pedir: el día cae solo. */
  const cumpleAuto = (at.diasLibres || []).some(r => r.cuando?.tipo === 'cumple' && r.forma === 'automatico')
  const ahora = faltan != null && faltan <= 30
    ? { id: 'cumple', titulo: 'Su día libre de cumpleaños', linea: `${fechaLarga(cumple)[0].toUpperCase()}${fechaLarga(cumple).slice(1)} · ${faltan === 0 ? 'es hoy' : `faltan ${faltan} días`}${cumpleAuto ? ' · es libre, no hace falta pedirlo' : ''}`, boton: cumpleAuto ? null : 'Pedir mi día', icono: Gift }
    : libre && diasAlFin <= 90
      ? { id: 'fondo', titulo: `Le quedan ${bs(libre)} de su fondo de capacitación`, linea: `Se usa hasta el 31 de diciembre · faltan ${diasAlFin} días`, boton: 'Pedir un reembolso', icono: FileText }
      : { id: 'viernes', titulo: 'Su viernes corto de este mes', linea: 'Salga a las 16:00 un viernes, acordándolo con su jefe', boton: 'Ver cómo', icono: Clock }
  const usar = id => (id === 'cumple' ? ir({ p: 'dia' }) : id === 'fondo' ? ir({ p: 'reembolso' }) : ir({ p: 'detalle', id }))

  /* ── El día de cumpleaños: el permiso con su día ya puesto. ── */
  if (vista?.p === 'dia') {
    return <SolicitarPermisoPhone inicial={{ tipo: 'cumpleanos', desde: cumple && cumple >= at.hoy ? cumple : at.hoy }} volverA="Mis beneficios"
      onVolver={() => ir({ p: 'detalle', id: 'cumple' })} onListo={() => ir(null)} listoTexto="Volver a Mis beneficios" />
  }

  /* ── Pedir un reembolso del fondo ── */
  if (vista?.p === 'reembolso') {
    return <Reembolso libre={libre} onVolver={() => ir({ p: 'detalle', id: 'fondo' })} onEnviar={u => {
      setUsos(prev => ({ ...prev, [currentUser.name]: [...(prev[currentUser.name] || []), u] }))
      setAviso('Pidió el reembolso. RR.HH. se lo paga con el sueldo del mes siguiente.')
      setTimeout(() => setAviso(null), 3200)
      ir({ p: 'detalle', id: 'fondo' })
    }} />
  }

  /* ── El código para mostrar en caja ── */
  if (vista?.p === 'codigo') {
    const b = BENEFICIOS.find(x => x.id === 'descuento')
    const codigo = `${(currentUser.initials || 'XX').slice(0, 2)}-${ficha?.form?.['1.11'] || String(currentUser.id).padStart(7, '0')}`
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: C.texto }}>
        <BarraVolver texto={b.titulo} onVolver={() => ir({ p: 'detalle', id: 'descuento' })} conTema />
        <Destacada centro>
          <span style={ETI}>Su código</span>
          <b style={TIT}>{b.titulo}</b>
          <span style={LIN}>Muéstrelo en caja antes de pagar.</span>
          <span style={{ position: 'relative' }}><Qr texto={codigo} /></span>
          <b style={{ position: 'relative', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', fontVariantNumeric: 'tabular-nums' }}>{codigo}</b>
        </Destacada>
      </div>
    )
  }

  /* ── Un beneficio ── */
  if (vista?.p === 'detalle') {
    const b = BENEFICIOS.find(x => x.id === vista.id)
    const est = estadoDe(b)
    const boton = b.accion === 'dia' ? (!cumpleAuto && (enSuMes || (faltan != null && faltan <= 30)) ? 'Pedir mi día' : null)
      : b.accion === 'reembolso' ? (libre ? 'Pedir un reembolso' : null) : b.accion === 'codigo' ? 'Mostrar mi código' : null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: C.texto }}>
        <BarraVolver texto="Mis beneficios" onVolver={() => ir(null)} conTema />
        <Destacada>
          <span style={{ position: 'relative', marginBottom: 6 }}><Aro icono={b.icono} size={40} /></span>
          <span style={ETI}>{b.grupo}</span>
          <b style={{ ...TIT, fontSize: 13 }}>{b.titulo}</b>
          <span style={LIN}>{b.que}</span>
          {b.saldo && (
            <span style={{ position: 'relative', marginTop: 8 }}>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}><b style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>{bs(libre)}</b><span style={{ fontSize: 7.6, color: C.mute }}>libres en {at.hoy.slice(0, 4)}</span></span>
              <Barra parte={libre / FONDO_ANUAL} />
            </span>
          )}
          {b.id === 'cumple' && cumple && !boton && <span style={{ ...LIN, marginTop: 6 }}>Su cumpleaños es el {fechaLarga(cumple)}: lo podrá pedir en {mesCumple}.</span>}
          {(boton || est) && (
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
              {boton
                ? <button type="button" onClick={() => (b.accion === 'codigo' ? ir({ p: 'codigo' }) : usar(b.id))} style={PILDORA}>{b.accion === 'codigo' ? <QrCode size={11} strokeWidth={2.2} /> : b.accion === 'dia' ? <Gift size={11} strokeWidth={2.2} /> : <FileText size={11} strokeWidth={2.2} />}{boton}</button>
                : <span />}
              {est && <Etiqueta t={est[0]} verde={est[1]} />}
            </span>
          )}
        </Destacada>

        <span style={ROTULO}>Cómo se usa</span>
        <div style={{ background: C.carta, borderRadius: 15, boxShadow: C.sombra, padding: '4px 10px' }}>
          {b.pasos.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', borderTop: i ? '1px solid var(--in-linea)' : 'none' }}>
              <i style={{ width: 16, height: 16, borderRadius: '50%', background: '#0C2D40', color: '#fff', display: 'grid', placeItems: 'center', fontStyle: 'normal', fontSize: 7.4, fontWeight: 700, flexShrink: 0 }}>{i + 1}</i>
              <span style={{ fontSize: 8, lineHeight: 1.45 }}>{t}</span>
            </div>
          ))}
        </div>

        <span style={ROTULO}>Condiciones</span>
        <div style={{ background: C.carta, borderRadius: 15, boxShadow: C.sombra, overflow: 'hidden' }}>
          {b.datos.map(([k, v], i) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '42% 1fr', gap: 8, padding: '7px 10px', alignItems: 'baseline', borderTop: i ? '1px solid var(--in-linea)' : 'none' }}>
              <small style={{ fontSize: 7.2, color: C.mute }}>{k}</small><b style={{ fontSize: 8.4, fontWeight: 600 }}>{v}</b>
            </div>
          ))}
        </div>

        {b.saldo && !!usos.length && (
          <>
            <span style={ROTULO}>Lo que ya usó</span>
            <div style={{ background: C.carta, borderRadius: 15, boxShadow: C.sombra, overflow: 'hidden' }}>
              {usos.map((u, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderTop: i ? '1px solid var(--in-linea)' : 'none' }}>
                  <Aro icono="crecer" size={26} />
                  <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
                    <b style={{ fontSize: 9, fontWeight: 500 }}>{u.curso}</b>
                    <span style={{ fontSize: 7.2, color: C.mute }}>{bs(u.monto)} · {u.estado === 'pagado' ? `reembolsado en ${u.cuando}` : 'enviado hoy'}</span>
                  </span>
                  <Etiqueta t={u.estado === 'pagado' ? 'Pagado' : 'Por aprobar'} verde={u.estado === 'pagado'} />
                </div>
              ))}
            </div>
          </>
        )}
        {aviso && <Aviso texto={aviso} />}
      </div>
    )
  }

  /* ── La portada ── */
  const lista = grupo === 'Todos' ? GRUPOS : [grupo]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: C.texto }}>
      <BarraVolver texto={volverA} onVolver={onVolver} conTema />
      <span style={{ display: 'grid', margin: '-2px 2px 0' }}>
        <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>Mis beneficios</b>
        <small style={{ fontSize: 8, color: C.mute }}>{empresa?.razonSocial || empresa?.nombre || 'La empresa'} · {BENEFICIOS.length} beneficios</small>
      </span>

      <Destacada>
        <span style={ETI}>Para usar ahora</span>
        <b style={TIT}>{ahora.titulo}</b>
        <span style={LIN}>{ahora.linea}</span>
        <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
          {ahora.boton && <button type="button" onClick={() => usar(ahora.id)} style={PILDORA}><ahora.icono size={11} strokeWidth={2.2} />{ahora.boton}</button>}
          <button type="button" onClick={() => ir({ p: 'detalle', id: ahora.id })} style={{ border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 8, fontWeight: 600, color: '#0A7F55', cursor: 'pointer' }}>Ver más</button>
        </span>
      </Destacada>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        <button type="button" onClick={() => ir({ p: 'detalle', id: 'fondo' })} style={{ textAlign: 'left', border: 'none', fontFamily: 'inherit', color: C.texto, cursor: 'pointer', background: C.carta, borderRadius: 14, boxShadow: C.sombra, padding: '9px 10px', display: 'grid', gap: 1, alignContent: 'start' }}>
          <small style={{ fontSize: 6.8, color: C.mute }}>Fondo de capacitación</small>
          <b style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-.02em' }}>{bs(libre)}</b>
          <span style={{ fontSize: 6.8, color: C.mute }}>de {bs(FONDO_ANUAL)} · {at.hoy.slice(0, 4)}</span>
          <Barra parte={libre / FONDO_ANUAL} />
        </button>
        <button type="button" onClick={() => ir({ p: 'codigo' })} style={{ textAlign: 'left', border: 'none', fontFamily: 'inherit', color: C.texto, cursor: 'pointer', background: C.carta, borderRadius: 14, boxShadow: C.sombra, padding: '9px 10px', display: 'grid', gap: 1, alignContent: 'start' }}>
          <small style={{ fontSize: 6.8, color: C.mute }}>Descuento en FarmaVida</small>
          <b style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-.02em' }}>20 %</b>
          <span style={{ fontSize: 6.8, color: C.mute }}>en todas las sucursales</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 7.2, fontWeight: 600, color: '#0A7F55', marginTop: 5 }}><QrCode size={10} strokeWidth={2} />Su código</span>
        </button>
      </div>

      <div role="group" aria-label="Filtrar por grupo" style={{ display: 'flex', gap: 5, overflowX: 'auto', scrollbarWidth: 'none', margin: '2px -10px 0 0', padding: '2px 10px 4px 0' }}>
        {['Todos', ...GRUPOS].map(g => (
          <button key={g} type="button" aria-pressed={grupo === g} onClick={() => setGrupo(g)} style={{
            flexShrink: 0, height: 24, padding: '0 11px', borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 7.8, cursor: 'pointer',
            fontWeight: grupo === g ? 600 : 500, background: grupo === g ? '#0C2D40' : C.carta, color: grupo === g ? '#fff' : C.texto, boxShadow: grupo === g ? 'none' : C.sombra,
          }}>{g}</button>
        ))}
      </div>

      {lista.map(g => (
        <div key={g} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={ROTULO}>{g}</span>
          <div style={{ background: C.carta, borderRadius: 15, boxShadow: C.sombra, overflow: 'hidden' }}>
            {BENEFICIOS.filter(b => b.grupo === g).map((b, i) => {
              const est = estadoDe(b)
              return (
                <button key={b.id} type="button" onClick={() => ir({ p: 'detalle', id: b.id })} style={{
                  display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 10px', border: 'none', borderTop: i ? '1px solid var(--in-linea)' : 'none',
                  background: 'none', fontFamily: 'inherit', textAlign: 'left', color: C.texto, cursor: 'pointer',
                }}>
                  <Aro icono={b.icono} />
                  <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
                    <b style={{ fontSize: 9, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.titulo}</b>
                    <span style={{ fontSize: 7.2, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lineaDe(b)}</span>
                  </span>
                  {est && <Etiqueta t={est[0]} verde={est[1]} />}
                  <ChevronRight size={11} style={{ color: C.suave, flexShrink: 0 }} />
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function Aviso({ texto }) {
  return <div role="status" style={{ position: 'sticky', bottom: 6, marginTop: 10, padding: '7px 10px', borderRadius: 12, background: '#0C2D40', color: '#fff', fontSize: 7.6, fontWeight: 600, boxShadow: '0 4px 14px rgba(12,45,64,.25)' }}>{texto}</div>
}

/* PEDIR UN REEMBOLSO del fondo: el curso, cuánto pagó y la factura. No pasa de lo que le queda. */
function Reembolso({ libre, onVolver, onEnviar }) {
  const [curso, setCurso] = useState('')
  const [monto, setMonto] = useState('')
  const [factura, setFactura] = useState(null)
  const archivo = useRef(null)
  const n = Number(String(monto).replace(',', '.')) || 0
  const listo = curso.trim().length > 2 && n > 0 && n <= libre && !!factura
  const campo = { width: '100%', boxSizing: 'border-box', height: 28, padding: '0 9px', borderRadius: 10, border: 'none', background: 'var(--in-fondo)', fontFamily: 'inherit', fontSize: 8.6, color: C.texto, outline: 'none' }
  const rotulo = { display: 'grid', gap: 3, fontSize: 7.2, color: C.mute }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: C.texto }}>
      <BarraVolver texto="Fondo de capacitación" onVolver={onVolver} conTema />
      <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em', margin: '-2px 2px 0' }}>Pedir un reembolso</b>
      <span style={{ fontSize: 7.4, color: C.mute, margin: '-5px 2px 0', lineHeight: 1.5 }}>Le quedan {bs(libre)} este año. RR.HH. se lo paga con el sueldo del mes siguiente.</span>
      <div style={{ background: C.carta, borderRadius: 13, boxShadow: C.sombra, padding: '10px 11px', display: 'grid', gap: 8 }}>
        <label style={rotulo}>Curso o capacitación<input value={curso} onChange={e => setCurso(e.target.value)} placeholder="Por ejemplo: Diplomado en UX" style={campo} /></label>
        <label style={rotulo}>Cuánto pagó (Bs)<input value={monto} onChange={e => setMonto(e.target.value.replace(/[^\d.,]/g, ''))} inputMode="decimal" placeholder="0" style={campo} /></label>
        {n > libre && <span style={{ fontSize: 7, color: 'var(--in-rojo)' }}>Pasa de lo que le queda ({bs(libre)}).</span>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px', borderRadius: 12, background: 'var(--in-calendario)' }}>
          <Paperclip size={13} style={{ color: '#0A7F55', flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
            <b style={{ fontSize: 8.4, fontWeight: 600 }}>Factura a nombre de FarmaVida</b>
            <small style={{ fontSize: 6.8, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{factura || 'Foto o PDF'}</small>
          </span>
          <input ref={archivo} type="file" accept="image/*,application/pdf" hidden onChange={e => setFactura(e.target.files?.[0]?.name || null)} />
          <button type="button" onClick={() => archivo.current?.click()} style={{ height: 22, padding: '0 10px', borderRadius: 99, border: 'none', background: C.carta, boxShadow: '0 0 0 1.2px #00E091', fontFamily: 'inherit', fontSize: 7.6, fontWeight: 600, color: '#0A7F55', cursor: 'pointer', flexShrink: 0 }}>{factura ? 'Cambiar' : 'Subir'}</button>
        </div>
      </div>
      <button type="button" disabled={!listo} onClick={() => onEnviar({ curso: curso.trim(), monto: n, estado: 'pendiente', factura })} style={{ height: 30, borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 8.6, fontWeight: 600, background: listo ? '#00E091' : 'var(--in-plomo)', color: listo ? '#0C2D40' : C.suave, cursor: listo ? 'pointer' : 'default' }}>Enviar a RR.HH.</button>
    </div>
  )
}
