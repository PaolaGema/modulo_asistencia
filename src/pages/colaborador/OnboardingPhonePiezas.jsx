import { History, Network, ArrowLeft, Check, Play, Bot } from 'lucide-react'
import { BOTON_REDONDO, PILDORA, TIPO_TEXTO } from './onboardingPhone'

/* ── PIEZAS DEL ONBOARDING EN EL TELÉFONO (auditoría heurística, 2026-10-30) ──
   Onboarding se veía como otra app: franja navy, botones cuadrados, fichas naranjas, tuteo. Estas
   piezas lo ponen en la línea del Inicio (DISENO_MOBILE.md): botones redondos blancos, tarjeta destacada
   con píldora menta, rótulos de sección, colores solo para estados y trato de usted. La ruta quedó como
   mapa (opción A elegida): el zigzag de siempre, con los círculos de aro menta de Zona HR. */

const TARJETA = { background: 'var(--in-carta)', borderRadius: 18, boxShadow: 'var(--in-sombra)', padding: '13px 14px' }
const ETI = { fontSize: 7.2, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--in-acento-txt)' }
const ROTULO = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)', margin: '4px 0 6px' }

/* Título de la pantalla con los botones redondos (historial, organigrama y, en la ruta, el agente),
   como el Inicio. El agente vivía en un botón flotante de 48 px que tapaba tareas del mapa. */
export function CabeceraOnb({ titulo, sub, onHistorial, onOrganigrama, onAgente }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <span style={{ flex: 1, display: 'grid', minWidth: 0 }}>
        <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--in-texto)' }}>{titulo}</b>
        {sub && <small style={{ fontSize: 8.2, color: 'var(--in-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</small>}
      </span>
      {onHistorial && <button type="button" onClick={onHistorial} aria-label="Mi historial de onboarding" title="Historial" style={BOTON_REDONDO}><History size={12} strokeWidth={2.2} /></button>}
      {onOrganigrama && <button type="button" onClick={onOrganigrama} aria-label="Ver el organigrama" title="Organigrama" style={BOTON_REDONDO}><Network size={12} strokeWidth={2.2} /></button>}
      {onAgente && <button type="button" onClick={onAgente} aria-label="Preguntar al asistente de onboarding" title="Asistente" style={{ ...BOTON_REDONDO, background: '#0C2D40', color: '#00E091' }}><Bot size={13} strokeWidth={2.2} /></button>}
    </div>
  )
}

/* «‹ Mi onboarding»: el botón de volver redondo de todas las pantallas. */
export function VolverOnb({ texto, onVolver, derecha }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <button type="button" onClick={onVolver} aria-label={`Volver a ${texto}`} style={{ ...BOTON_REDONDO, width: 26, height: 26 }}><ArrowLeft size={11} strokeWidth={2.2} /></button>
      <span style={{ flex: 1, fontSize: 8.6, fontWeight: 500, color: 'var(--in-texto)' }}>{texto}</span>
      {derecha}
    </div>
  )
}

/* Portada (bienvenida, de vuelta, graduado): la mascota, el saludo, tres cifras en una tarjeta y un botón. */
export function PortadaOnb({ cabecera, mascota, titulo, texto, cifras, tarjeta, boton }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)', padding: '2px 2px' }}>
      {cabecera}
      <div style={{ flex: 1, display: 'grid', justifyItems: 'center', alignContent: 'center', textAlign: 'center', gap: 6, paddingBottom: 12 }}>
        <img src={mascota} alt="" style={{ width: 96, height: 'auto' }} />
        <b style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.01em', marginTop: 4 }}>{titulo}</b>
        <span style={{ fontSize: 8.4, color: 'var(--in-mute)', maxWidth: 210, lineHeight: 1.45 }}>{texto}</span>
        {cifras && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cifras.length}, 1fr)`, width: '100%', background: 'var(--in-carta)', borderRadius: 14, boxShadow: 'var(--in-sombra)', padding: '10px 4px', margin: '8px 0 2px' }}>
            {cifras.map(([n, txt], i) => (
              <span key={txt} style={{ display: 'grid', justifyItems: 'center', gap: 1, borderLeft: i ? '1px solid var(--in-linea)' : 'none' }}>
                <b style={{ fontSize: 14, fontWeight: 600 }}>{n}</b>
                <small style={{ fontSize: 7, color: 'var(--in-mute)' }}>{txt}</small>
              </span>
            ))}
          </div>
        )}
        {tarjeta}
        {boton}
      </div>
    </div>
  )
}

/* La tarjeta destacada de arriba de la ruta: el avance y el siguiente paso con su botón. */
export function SiguientePaso({ siguiente, etapa, hechas, total, puntos, onAbrir }) {
  const pct = total ? Math.round((hechas / total) * 100) : 0
  return (
    <div style={{ ...TARJETA, marginBottom: 12, textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
      <span style={ETI}>{siguiente ? 'Su siguiente paso' : 'Su avance'}</span>
      <b style={{ display: 'block', fontSize: 11.5, fontWeight: 600, letterSpacing: '-.01em', margin: '3px 0 2px' }}>{siguiente ? siguiente.name : '¡Terminó todas las tareas!'}</b>
      {siguiente && <span style={{ fontSize: 7.6, color: 'var(--in-mute)' }}>{[etapa, TIPO_TEXTO[siguiente.tipo], siguiente.obligatoria && 'obligatoria'].filter(Boolean).join(' · ')}</span>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', height: 5, borderRadius: 99, background: 'var(--in-linea)', overflow: 'hidden' }}>
            <span style={{ display: 'block', height: '100%', width: `${pct}%`, background: '#00E091', borderRadius: 99, transition: 'width .4s' }} />
          </span>
          <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7.6, color: 'var(--in-mute)', marginTop: 4 }}>
            <span><b style={{ color: 'var(--in-texto)', fontWeight: 600 }}>{hechas} de {total}</b> tareas</span>
            <span>{puntos} pts</span>
          </span>
        </span>
        {siguiente && onAbrir && <button type="button" onClick={() => onAbrir(siguiente)} style={PILDORA}><Play size={10} strokeWidth={2.4} />Empezar</button>}
      </div>
    </div>
  )
}

/* ── LA RUTA COMO MAPA (opción A) ──
   El zigzag de siempre, con las piezas de Zona HR: círculo blanco con aro menta e ícono navy. Hecha =
   menta con check; la de ahora, más grande y con halo menta; lo de etapas que todavía no empiezan, en
   gris. El rótulo de cada etapa es el rótulo de sección del Inicio y la etapa actual nunca lleva candado. */
const DESVIO = [0, 46, 68, 46, 0, -46, -68, -46]
const ANCHO = 246
const ALTO_NODO = 74
const ALTO_ACTIVIDAD = 26

export function MapaRutaOnb({ etapas, flatTareas, iconoDe, siguienteId, onAbrir }) {
  const actual = etapas.findIndex(e => flatTareas(e).some(t => !t.done))
  return etapas.map((etapa, ei) => {
    const tareas = flatTareas(etapa)
    const hechas = tareas.filter(t => t.done).length
    const futura = actual >= 0 && ei > actual
    /* Las filas del mapa: un rótulo por actividad y un nodo por tarea, cada uno con su alto. */
    const filas = []
    let y = 0
    let n = 0
    etapa.actividades.forEach((actividad, ai) => {
      if (etapa.actividades.length > 1 || actividad.name) { filas.push({ tipo: 'act', key: `a${ai}`, y, texto: actividad.name }); y += ALTO_ACTIVIDAD }
      actividad.tareas.forEach(tarea => {
        filas.push({ tipo: 'nodo', key: tarea.id, y, x: ANCHO / 2 + DESVIO[n % DESVIO.length], tarea, actividad })
        y += ALTO_NODO; n++
      })
    })
    const nodos = filas.filter(f => f.tipo === 'nodo')
    const camino = nodos.map((f, i) => `${i ? 'L' : 'M'} ${f.x} ${f.y + 22}`).join(' ')
    return (
      <div key={ei} style={{ marginBottom: 6 }}>
        <div style={ROTULO}>
          <span>{etapa.name}</span>
          <small style={{ fontSize: 7.4, fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--in-mute)' }}>
            {futura ? `Se abre ${etapa.days?.split('—')[0]?.trim().toLowerCase() || 'después'}` : `${etapa.days} · ${hechas} de ${tareas.length}`}
          </small>
        </div>
        <div style={{ position: 'relative', height: y, width: ANCHO, margin: '0 auto', maxWidth: '100%' }}>
          <svg viewBox={`0 0 ${ANCHO} ${y}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
            <path d={camino} fill="none" stroke="#C5D3DD" strokeWidth="2" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
          </svg>
          {filas.map(f => f.tipo === 'act' ? (
            <span key={f.key} style={{ position: 'absolute', top: f.y + 4, left: '50%', transform: 'translateX(-50%)', fontSize: 7, fontWeight: 600, color: 'var(--in-mute)', background: 'var(--in-fondo)', padding: '1px 8px', borderRadius: 99, whiteSpace: 'nowrap' }}>{f.texto}</span>
          ) : (
            <Nodo key={f.key} f={f} Icono={iconoDe(f.tarea.tipo)} ahora={f.tarea.id === siguienteId} futura={futura}
              onAbrir={() => onAbrir(f.tarea, { etapa: etapa.name, actividad: f.actividad.name, days: etapa.days })} />
          ))}
        </div>
      </div>
    )
  })
}

function Nodo({ f, Icono, ahora, futura, onAbrir }) {
  const { tarea } = f
  const lado = ahora ? 44 : 36
  const aro = tarea.done ? 'var(--in-sombra)'
    : ahora ? 'inset 0 0 0 2px #00E091, 0 0 0 5px rgba(0,224,145,.18), var(--in-sombra)'
      : futura ? 'inset 0 0 0 1.4px var(--in-linea)' : 'inset 0 0 0 1.6px #00E091, var(--in-sombra)'
  const linea = tarea.done ? 'Hecha' : ahora ? 'Ahora' : [tarea.obligatoria && 'Obligatoria', tarea.puntos > 0 && `${tarea.puntos} pts`].filter(Boolean).join(' · ')
  return (
    <div style={{ position: 'absolute', top: f.y + 22 - lado / 2, left: f.x - 50, width: 100, display: 'grid', justifyItems: 'center', gap: 3, textAlign: 'center' }}>
      <button type="button" onClick={onAbrir} aria-label={tarea.name} title={tarea.name} style={{
        width: lado, height: lado, borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer', display: 'grid', placeItems: 'center',
        background: tarea.done ? '#00E091' : futura ? 'var(--in-fondo)' : 'var(--in-carta)', boxShadow: aro,
        color: tarea.done ? '#0C2D40' : futura ? 'var(--in-suave)' : 'var(--in-texto)',
      }}>
        {tarea.done ? <Check size={15} strokeWidth={2.8} /> : <Icono size={ahora ? 17 : 15} strokeWidth={1.8} />}
      </button>
      <b style={{ fontSize: 7.4, fontWeight: 500, lineHeight: 1.25, color: futura ? 'var(--in-mute)' : 'var(--in-texto)' }}>{tarea.name}</b>
      {linea && <small style={{ fontSize: 6.6, color: ahora ? 'var(--in-acento-txt)' : 'var(--in-mute)', fontWeight: ahora ? 600 : 400, marginTop: -2 }}>{linea}</small>}
    </div>
  )
}
