import { useState } from 'react'
import { AlertTriangle, ShieldOff, ChevronDown, ChevronRight, HeartHandshake } from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { buildDetalleEtapas } from '../../utils/detalleEtapas'
import { colaboradoresData, ESTADOS_ONBOARDING } from '../../pages/personas/colaboradoresData'
import AvatarPhone from './AvatarPhone'
import BarraVolver from './BarraVolver'
import RecorridoPhone, { TareaPhone } from './RecorridoPhone'

/* Orden por urgencia, no alfabético: en el celular solo se leen las primeras filas, así que
   arriba va quien está atascado y al fondo quien ya se graduó. Mismo criterio que
   SeguimientoPhone, con el vocabulario de estados del directorio. */
const URGENCIA = { 'en-riesgo': 0, 'sin-iniciar': 1, 'en-curso': 2, 'graduado': 3 }

/* Tope declarado: un buddy puede acompañar a muchas personas y la lista no puede crecer sin
   fin. Lo que se corta se dice, no se esconde. */
const TOPE = 6

/* Las etiquetas de estado de siempre (DISENO_MOBILE.md), no los tonos del directorio de escritorio
   (azul, naranja): rojo = en riesgo, verde = graduado, gris = lo demás. El nombre del estado sí sale de
   `ESTADOS_ONBOARDING`, así dice lo mismo en los dos dispositivos. La barra de avance va en menta, roja
   si está en riesgo. */
const TONO_ESTADO = {
  'en-riesgo': ['var(--in-rojo)', 'var(--in-rojo-bg)'],
  graduado: ['var(--tx-verde)', 'var(--tn-verde)'],
}
const barraDe = onb => onb === 'en-riesgo' ? '#D92D20' : '#00E091'

function Badge({ onb }) {
  const estado = ESTADOS_ONBOARDING[onb]
  if (!estado) return null
  const [c, bg] = TONO_ESTADO[onb] || ['var(--tx-gris)', 'var(--tn-gris)']
  return (
    <em style={{
      display: 'inline-flex', alignItems: 'center', gap: 3, fontStyle: 'normal', whiteSpace: 'nowrap',
      background: bg, color: c, fontSize: 6, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
    }}>
      {onb === 'en-riesgo' && <AlertTriangle size={7} />}
      {estado.label}
    </em>
  )
}

/* Nota de privacidad. Va en la lista y en el detalle porque es la regla que define el rol:
   el buddy acompaña, no supervisa, y en el celular cada pantalla se lee sola. */
function NotaPrivacidad({ nombre }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '4px 4px 0', marginTop: 6 }}>
      <ShieldOff size={10} style={{ color: 'var(--in-suave)', flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 7, color: 'var(--in-mute)', lineHeight: 1.5 }}>
        Usted ve el avance general y el recorrido. Las respuestas, las evaluaciones y los datos
        personales {nombre ? `de ${nombre}` : 'de cada colaborador'} solo los ve Recursos Humanos.
      </span>
    </div>
  )
}

/* Una fila por persona, como las tarjetas de Mis solicitudes: toda la tarjeta se toca. Antes cada una
   llevaba un botón navy «Ver detalles» a todo lo ancho y entraba una persona y media por pantalla. */
function Card({ c, onVerDetalles }) {
  return (
    <button type="button" onClick={() => onVerDetalles(c)} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', cursor: 'pointer',
      background: 'var(--in-carta)', border: 'none', borderRadius: 14, boxShadow: 'var(--in-sombra)',
      padding: '9px 10px', marginBottom: 7, fontFamily: 'inherit', color: 'var(--in-texto)',
    }}>
      <AvatarPhone nombre={c.name} color={c.color} size={28} />
      <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
        <b style={{ fontSize: 9.2, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</b>
        <small style={{ fontSize: 7.4, color: 'var(--in-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.cargo} · {c.depto}</small>
        <span style={{ display: 'block', height: 4, background: 'var(--in-linea)', borderRadius: 99, overflow: 'hidden', marginTop: 5 }}>
          <span style={{ display: 'block', width: `${c.onbPct}%`, height: '100%', background: barraDe(c.onb), borderRadius: 99 }} />
        </span>
      </span>
      <span style={{ display: 'grid', justifyItems: 'end', gap: 4, flexShrink: 0 }}>
        <Badge onb={c.onb} />
        <small style={{ fontSize: 7, fontWeight: 600, color: 'var(--in-mute)' }}>{c.onbPct} %</small>
      </span>
      <ChevronRight size={11} style={{ color: 'var(--in-suave)', flexShrink: 0 }} />
    </button>
  )
}

/* Quién es, cómo va y por dónde va: el detalle del acompañado es de mirar, no de hacer. El
   buddy acompaña y no administra el proceso; lo único que abre una tarea es su contenido, y
   de solo lectura. */
function Detalle({ c, plantillas, onVolver }) {
  const etapas = buildDetalleEtapas({ pct: c.onbPct }, plantillas)
  const nombre = c.name.split(' ')[0]
  const [tarea, setTarea] = useState(null)

  /* La tarea reemplaza la pantalla en vez de abrirse en un modal: en 280 px una capa encima
     deja el contenido en una ventanita, y la barra de volver ya da la salida. */
  if (tarea) {
    return <TareaPhone tarea={tarea} nombre={nombre} onVolver={() => setTarea(null)} />
  }

  return (
    <div style={{ padding: '2px 2px' }}>
      <BarraVolver texto="Mis acompañados" onVolver={onVolver} />

      {/* La tarjeta destacada blanca de los módulos, no una franja navy (esa es solo del Inicio). */}
      <div style={{ background: 'var(--in-carta)', borderRadius: 18, boxShadow: 'var(--in-sombra)', padding: '13px 14px', marginBottom: 11, color: 'var(--in-texto)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <AvatarPhone nombre={c.name} color={c.color} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: 7.6, color: 'var(--in-mute)', marginTop: 1 }}>{c.cargo} · {c.depto}</div>
          </div>
          <Badge onb={c.onb} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
          <span style={{ flex: 1, height: 5, background: 'var(--in-linea)', borderRadius: 99, overflow: 'hidden' }}>
            <span style={{ display: 'block', width: `${c.onbPct}%`, height: '100%', background: barraDe(c.onb), borderRadius: 99 }} />
          </span>
          <span style={{ fontSize: 9, fontWeight: 600 }}>{c.onbPct} %</span>
        </div>
        <div style={{ fontSize: 7.4, color: 'var(--in-mute)', marginTop: 5 }}>Ingresó {c.ingreso}</div>
      </div>

      {/* El aviso es el mismo de escritorio: nombra el motivo y propone la acción del buddy. */}
      {c.onb === 'en-riesgo' && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 7,
          background: 'var(--in-rojo-bg)', borderRadius: 12, padding: '9px 10px', marginBottom: 11,
        }}>
          <AlertTriangle size={11} style={{ color: 'var(--in-rojo)', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 7.4, color: 'var(--in-rojo)', fontWeight: 600, lineHeight: 1.45 }}>
            Lleva más de 3 días sin actividad. Un mensaje suyo puede destrabar el proceso.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)', marginBottom: 2 }}>
        Su recorrido <span style={{ fontWeight: 500, fontSize: 7.4, textTransform: 'none', letterSpacing: 0, color: 'var(--in-mute)' }}>solo lectura</span>
      </div>
      <RecorridoPhone etapas={etapas} onVerTarea={setTarea} />

      <NotaPrivacidad nombre={nombre} />
    </div>
  )
}

export default function AcompanadosPhone({ currentUser, onVolver }) {
  const { plantillas } = useOnboardingData()
  const [detalle, setDetalle] = useState(null)
  const [todos, setTodos] = useState(false)

  /* La relación vive en el colaborador acompañado, igual que en escritorio: no hay una lista
     de "los acompañados de Diego", hay personas cuyo buddy es Diego. */
  const acompanados = colaboradoresData
    .filter(c => c.buddy?.name === currentUser.name)
    .sort((x, y) => (URGENCIA[x.onb] ?? 9) - (URGENCIA[y.onb] ?? 9) || x.onbPct - y.onbPct)

  if (detalle) {
    return <Detalle c={detalle} plantillas={plantillas} onVolver={() => setDetalle(null)} />
  }

  const enRiesgo = acompanados.filter(c => c.onb === 'en-riesgo').length

  const visibles = todos ? acompanados : acompanados.slice(0, TOPE)
  const ocultos = acompanados.length - visibles.length

  return (
    <div style={{ padding: '2px 2px', fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
      {onVolver && <BarraVolver texto="Onboarding" onVolver={onVolver} />}

      <div style={{ display: 'grid', marginBottom: 10 }}>
        <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>Mis acompañados</b>
        <small style={{ fontSize: 8.2, color: 'var(--in-mute)' }}>Las personas que acompaña como buddy</small>
      </div>

      {acompanados.length === 0 ? (
        <div style={{
          background: 'var(--in-carta)', boxShadow: 'var(--in-sombra)', borderRadius: 14,
          padding: '22px 14px', textAlign: 'center',
        }}>
          <HeartHandshake size={18} style={{ color: 'var(--in-suave)', margin: '0 auto 7px' }} />
          <div style={{ fontSize: 9, fontWeight: 600 }}>Todavía no acompaña a nadie</div>
          <div style={{ fontSize: 7.4, color: 'var(--in-mute)', marginTop: 4, lineHeight: 1.5 }}>
            Cuando Recursos Humanos lo asigne como buddy de alguien, esa persona aparecerá aquí.
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 7, marginBottom: 12 }}>
            {[
              { n: acompanados.length, t: 'acompañados', c: 'var(--in-texto)' },
              { n: enRiesgo, t: 'en riesgo', c: enRiesgo ? 'var(--in-rojo)' : 'var(--in-texto)' },
            ].map(k => (
              <div key={k.t} style={{
                flex: 1, background: 'var(--in-carta)', borderRadius: 14, boxShadow: 'var(--in-sombra)',
                padding: '9px 11px', display: 'grid',
              }}>
                <b style={{ fontSize: 14, fontWeight: 600, color: k.c, lineHeight: 1.2 }}>{k.n}</b>
                <small style={{ fontSize: 7.2, color: 'var(--in-mute)' }}>{k.t}</small>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', marginBottom: 7 }}>
            Su gente <span style={{ fontWeight: 500, fontSize: 7.4, textTransform: 'none', letterSpacing: 0, color: 'var(--in-mute)' }}>por urgencia</span>
          </div>

          {visibles.map(c => <Card key={c.id} c={c} onVerDetalles={setDetalle} />)}

          {ocultos > 0 && (
            <div
              onClick={() => setTodos(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                background: 'var(--in-carta)', boxShadow: 'var(--in-sombra)', borderRadius: 99,
                padding: '8px 0', cursor: 'pointer',
                fontSize: 8.5, fontWeight: 600, color: 'var(--in-texto)',
              }}
            >
              Ver {ocultos} acompañado{ocultos > 1 ? 's' : ''} más
              <ChevronDown size={9} />
            </div>
          )}

          <NotaPrivacidad />
        </>
      )}
    </div>
  )
}
