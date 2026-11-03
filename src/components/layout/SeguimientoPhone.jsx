import { useState } from 'react'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { buildDetalleEtapas } from '../../utils/detalleEtapas'
import AvatarPhone from './AvatarPhone'
import BarraVolver from './BarraVolver'
import RecorridoPhone, { TareaPhone } from './RecorridoPhone'

const ETIQUETA = {
  'atrasado': 'Atrasado',
  'en-riesgo': 'En riesgo',
  'pendiente': 'Programado',
  'en-curso': 'En curso',
  'completado': 'Completado',
  'pausado': 'Pausado',
}

/* Las etiquetas de estado de siempre, como Mis acompañados: rojo lo que necesita atención, verde lo
   terminado, gris lo demás. Antes cada estado tenía su color (azul, ámbar, rojo, verde). */
const TONO = {
  'atrasado': ['var(--in-rojo)', 'var(--in-rojo-bg)'],
  'en-riesgo': ['var(--in-rojo)', 'var(--in-rojo-bg)'],
  'completado': ['var(--tx-verde)', 'var(--tn-verde)'],
}

/* Orden por urgencia, no alfabético: en un celular solo se leen las primeras filas, así que
   arriba va lo que necesita acción hoy y al fondo lo que ya se resolvió. */
const URGENCIA = { 'atrasado': 0, 'en-riesgo': 1, 'pendiente': 2, 'en-curso': 3, 'pausado': 4, 'completado': 5 }

/* La lista se agrupa por MOTIVO y no se lista persona por persona: con un equipo grande, el líder
   escanea los rótulos y decide dónde mirar. Con las piezas de Mis acompañados (opción S1): lo que
   necesita atención arriba, con el aviso de por qué. */
const GRUPOS = [
  { key: 'atencion', label: 'Necesitan atención', estados: ['atrasado', 'en-riesgo'] },
  { key: 'comenzar', label: 'Por comenzar', estados: ['pendiente'] },
  { key: 'curso', label: 'En curso', estados: ['en-curso'] },
  { key: 'pausado', label: 'Pausados', estados: ['pausado'] },
  { key: 'completado', label: 'Completados', estados: ['completado'] },
]

// Tope por grupo y no sobre el total: si no, los urgentes se comen los lugares.
const POR_GRUPO = 5

const barraColor = status => (status === 'atrasado' || status === 'en-riesgo' ? '#D92D20' : '#00E091')

function Badge({ status }) {
  const [c, bg] = TONO[status] || ['var(--tx-gris)', 'var(--tn-gris)']
  const alerta = status === 'atrasado' || status === 'en-riesgo'
  return (
    <em style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontStyle: 'normal', whiteSpace: 'nowrap', background: bg, color: c, fontSize: 6, fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>
      {alerta && <AlertTriangle size={7} />}
      {ETIQUETA[status] || status}
    </em>
  )
}

/* Una fila por persona, como Mis acompañados: toda la tarjeta se toca y abre su recorrido. */
function Card({ a, onVerDetalles }) {
  const linea = a.status === 'completado' ? `${a.cargo} · terminó su ruta` : `${a.cargo} · día ${a.dia} de ${a.totalDias}`
  return (
    <button type="button" onClick={() => onVerDetalles(a)} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', cursor: 'pointer',
      background: 'var(--in-carta)', border: 'none', borderRadius: 14, boxShadow: 'var(--in-sombra)',
      padding: '9px 10px', fontFamily: 'inherit', color: 'var(--in-texto)',
    }}>
      <AvatarPhone nombre={a.nombre} color={a.color} size={28} />
      <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
        <b style={{ fontSize: 9.2, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.nombre}</b>
        <small style={{ fontSize: 7.4, color: 'var(--in-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{linea}</small>
        <span style={{ display: 'block', height: 4, background: 'var(--in-linea)', borderRadius: 99, overflow: 'hidden', marginTop: 5 }}>
          <span style={{ display: 'block', width: `${a.pct}%`, height: '100%', background: barraColor(a.status), borderRadius: 99 }} />
        </span>
      </span>
      <span style={{ display: 'grid', justifyItems: 'end', gap: 4, flexShrink: 0 }}>
        <Badge status={a.status} />
        <small style={{ fontSize: 7, fontWeight: 600, color: 'var(--in-mute)' }}>{a.pct} %</small>
      </span>
      <ChevronRight size={11} style={{ color: 'var(--in-suave)', flexShrink: 0 }} />
    </button>
  )
}

/* Por qué necesita atención, en una línea que se pueda leer de un vistazo. */
const motivo = a => (a.status === 'atrasado'
  ? `${a.nombre.split(' ')[0]} va atrasada o atrasado: día ${a.dia} de ${a.totalDias} con ${a.pct} % hecho.`
  : `${a.nombre.split(' ')[0]} lleva más de 3 días sin actividad. Un mensaje suyo puede destrabarlo.`)

function Detalle({ a, plantillas, onVolver }) {
  const etapas = buildDetalleEtapas(a, plantillas)
  const [tarea, setTarea] = useState(null)

  /* La tarea reemplaza la pantalla en vez de abrirse en un modal: en 280 px una capa encima
     deja el contenido en una ventanita, y la barra de volver ya da la salida. */
  if (tarea) {
    return <TareaPhone tarea={tarea} nombre={a.nombre.split(' ')[0]} onVolver={() => setTarea(null)} />
  }

  return (
    <div style={{ padding: '2px 2px' }}>
      <BarraVolver texto="Seguimiento" onVolver={onVolver} conTema />

      {/* La persona en la tarjeta blanca destacada, con los círculos menta: la franja navy es solo del Inicio. */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--in-carta)', borderRadius: 18, boxShadow: 'var(--in-sombra)', padding: '12px 13px', marginBottom: 11, color: 'var(--in-texto)' }}>
        <i aria-hidden="true" style={{ position: 'absolute', width: 110, height: 110, right: -40, top: -50, borderRadius: '50%', background: 'rgba(0,224,145,.09)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9 }}>
          <AvatarPhone nombre={a.nombre} color={a.color} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 600 }}>{a.nombre}</div>
            <div style={{ fontSize: 7.5, color: 'var(--in-mute)', marginTop: 1 }}>{a.cargo} · {a.ruta}</div>
          </div>
          <Badge status={a.status} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <span style={{ flex: 1, height: 5, background: 'var(--in-linea)', borderRadius: 100, overflow: 'hidden' }}>
            <span style={{ display: 'block', width: `${a.pct}%`, height: '100%', background: barraColor(a.status), borderRadius: 100 }} />
          </span>
          <span style={{ fontSize: 9, fontWeight: 700 }}>{a.pct} %</span>
        </div>
      </div>

      <div style={{ fontSize: 7.4, color: 'var(--in-mute)', margin: '-4px 2px 12px' }}>
        Día {a.dia} de {a.totalDias} · empezó el {a.fechaInicio}{a.buddy ? ` · buddy: ${a.buddy.name}` : ''}
      </div>
      <div style={{ fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)', marginBottom: 2 }}>Su recorrido</div>
      <RecorridoPhone etapas={etapas} onVerTarea={setTarea} />
    </div>
  )
}

export default function SeguimientoPhone({ currentUser, onVolver }) {
  const { asignaciones, asignacionesEjemplo, plantillas } = useOnboardingData()
  const [expandidos, setExpandidos] = useState({})
  const [detalle, setDetalle] = useState(null)
  const area = currentUser.area
  // Sin asignaciones cargadas (la demo recién empezada), las de ejemplo: si no, se abría vacía.
  const fuente = asignaciones?.length ? asignaciones : asignacionesEjemplo || []
  const mios = fuente
    .filter(a => a.area === area)
    .sort((x, y) => (URGENCIA[x.status] ?? 9) - (URGENCIA[y.status] ?? 9) || x.pct - y.pct)

  if (detalle) {
    return <Detalle a={detalle} plantillas={plantillas} onVolver={() => setDetalle(null)} />
  }

  const enAlerta = mios.filter(a => a.status === 'atrasado' || a.status === 'en-riesgo').length
  const completados = mios.filter(a => a.status === 'completado').length
  // Los grupos vacíos no se dibujan: la tarjeta de arriba ya dice que están en cero.
  const grupos = GRUPOS
    .map(g => ({ ...g, items: mios.filter(a => g.estados.includes(a.status)) }))
    .filter(g => g.items.length > 0)
  const rotulo = { fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', margin: '4px 2px -2px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--in-texto)' }}>
      {onVolver && <BarraVolver texto="Onboarding" onVolver={onVolver} conTema />}
      <span style={{ display: 'grid', margin: '-2px 2px 0' }}>
        <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>Seguimiento</b>
        <small style={{ fontSize: 8, color: 'var(--in-mute)' }}>Su área: {area}</small>
      </span>

      {/* Las tres cifras en una tarjeta, en navy: el color queda para las etiquetas de cada persona. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: 'var(--in-carta)', borderRadius: 15, boxShadow: 'var(--in-sombra)', padding: '10px 4px' }}>
        {[[mios.length, 'en onboarding'], [enAlerta, enAlerta === 1 ? 'necesita atención' : 'necesitan atención'], [completados, completados === 1 ? 'completado' : 'completados']].map(([n, t], i) => (
          <span key={t} style={{ display: 'grid', justifyItems: 'center', textAlign: 'center', gap: 1, borderLeft: i ? '1px solid var(--in-linea)' : 'none' }}>
            <b style={{ fontSize: 14, fontWeight: 600 }}>{n}</b>
            <small style={{ fontSize: 6.8, color: 'var(--in-mute)' }}>{t}</small>
          </span>
        ))}
      </div>

      {mios.length === 0 ? (
        <div style={{ background: 'var(--in-carta)', borderRadius: 15, boxShadow: 'var(--in-sombra)', padding: '18px 12px', textAlign: 'center', fontSize: 8, color: 'var(--in-mute)' }}>
          Nadie de {area} está en onboarding ahora.
        </div>
      ) : grupos.map(g => {
        const todos = !!expandidos[g.key]
        const visibles = todos ? g.items : g.items.slice(0, POR_GRUPO)
        const ocultos = g.items.length - visibles.length
        return (
          <div key={g.key} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span style={rotulo}>{g.label}<small style={{ fontSize: 7.4, fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--in-mute)' }}>{g.items.length}</small></span>
            {visibles.map(a => <Card key={a.id} a={a} onVerDetalles={setDetalle} />)}
            {g.key === 'atencion' && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 12, background: 'var(--in-rojo-bg)', color: 'var(--in-rojo)', fontSize: 7.6, fontWeight: 600, lineHeight: 1.4 }}>
                <AlertTriangle size={11} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{g.items.length === 1 ? motivo(g.items[0]) : `${g.items.length} personas van atrasadas o llevan días sin actividad. Un mensaje suyo puede destrabarlas.`}</span>
              </div>
            )}
            {/* El truncado se dice y dice de qué grupo es. */}
            {ocultos > 0 && (
              <button type="button" onClick={() => setExpandidos(p => ({ ...p, [g.key]: true }))} style={{ border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 8, fontWeight: 600, color: 'var(--in-acento-txt)', cursor: 'pointer', padding: 4 }}>
                Ver {ocultos} más de «{g.label.toLowerCase()}»
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
