import { Check, ShieldOff, Calendar, UserCheck } from 'lucide-react'
import { useConfig } from '../../context/ConfigContext'
import { infoTipo } from '../../utils/tareaTipos'
import BarraVolver from './BarraVolver'
import { MapaRutaOnb } from '../../pages/colaborador/OnboardingPhonePiezas'

/* El recorrido de una persona en el teléfono, de solo lectura: el mismo camino de nodos que
   ve el colaborador en su onboarding y Recursos Humanos en la ficha de la asignación. Vive
   aquí y no dentro de una pantalla porque lo miran el buddy y el líder, y una lista de etapas
   en un lado y un camino en el otro serían dos rutas distintas para la misma persona.

   Quien mira no actúa: los nodos abren la tarea para saber de qué se trata, nada más. */

// Tipos cuyo contenido responde el colaborador: lo que contestó no se muestra aquí.
const CON_RESPUESTAS = ['quiz', 'completar-perfil', 'form-custom', 'pulso', 'perfil']

function Dato({ Icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 7, color: '#64748b' }}>
      <Icon size={9} style={{ color: '#94a3b8', flexShrink: 0 }} />
      {children}
    </div>
  )
}

/* Sub-pantalla de una tarea. Responde "de qué se trata", que es lo que necesita quien
   acompaña para poder ayudar: qué hay que hacer, cuándo y quién la hace. El contenido en sí
   —las preguntas de una prueba, los campos de un formulario— no se abre: es material del
   colaborador, y mostrarlo aquí convertiría el acompañamiento en supervisión. */
export function TareaPhone({ tarea, nombre, volverA = 'Su recorrido', onVolver }) {
  const { gamificacion } = useConfig()
  const tipo = infoTipo(tarea.tipo)
  const TIcon = tipo.icon
  const pasos = (tarea.checklist || []).filter(i => i.text?.trim())
  const paradas = (tarea.paradas || []).map(p => p.lugar).filter(Boolean)
  const preguntas = tarea.quizPreguntas?.length || tarea.formCampos?.length || 0

  return (
    <div style={{ padding: '2px 2px' }}>
      <BarraVolver texto={volverA} onVolver={onVolver} />

      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 9,
        background: '#fff', border: '1px solid #e8ecf0', borderRadius: 11,
        boxShadow: '0 4px 14px rgba(12,45,64,.07)', padding: 11, marginBottom: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: `${tipo.color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TIcon size={15} style={{ color: tipo.color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0C2D40', lineHeight: 1.3 }}>{tarea.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <span style={{ fontSize: 7, fontWeight: 700, color: tipo.color }}>{tipo.label}</span>
            {gamificacion && tarea.puntos > 0 && (
              <span style={{ fontSize: 7, fontWeight: 800, color: '#16a34a' }}>+{tarea.puntos} pts</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginBottom: 10 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 7, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
          background: tarea.done ? '#f0fdf4' : '#f1f5f9',
          color: tarea.done ? '#16a34a' : '#64748b',
        }}>
          {tarea.done && <Check size={8} strokeWidth={3} />}
          {tarea.done ? 'Completada' : 'Pendiente'}
        </span>
        {tarea.obligatoria && (
          <span style={{
            fontSize: 6.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: '#fef3c7', color: '#b45309', textTransform: 'uppercase',
          }}>
            Obligatoria
          </span>
        )}
      </div>

      {tarea.desc && (
        <div style={{
          background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10,
          padding: '9px 10px', marginBottom: 8,
          fontSize: 7.5, color: '#475569', lineHeight: 1.55,
        }}>
          {tarea.desc}
        </div>
      )}

      <div style={{
        background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10,
        padding: '9px 10px', marginBottom: 8,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {tarea.fechaRel && <Dato Icon={Calendar}>{tarea.fechaRel} de la ruta</Dato>}
        {tarea.responsable && (
          <Dato Icon={UserCheck}>
            La hace <strong style={{ color: '#334155' }}>
              {Array.isArray(tarea.responsable) ? tarea.responsable.join(', ') : tarea.responsable}
            </strong>
          </Dato>
        )}
      </div>

      {/* Los pasos de una tarea supervisada y las paradas de un recorrido sí se muestran: no
          son respuestas de nadie, son en qué consiste la tarea. */}
      {(pasos.length > 0 || paradas.length > 0) && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 7.5, fontWeight: 700, color: '#0C2D40', marginBottom: 5 }}>
            {pasos.length > 0 ? 'Qué incluye' : 'Paradas del recorrido'}
          </div>
          {(pasos.length > 0 ? pasos.map(p => p.text) : paradas).map((texto, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: '#fff', border: '1px solid #e8ecf0', borderRadius: 8,
              padding: '7px 9px', marginBottom: 5,
              fontSize: 7.5, color: '#475569',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 3, border: '1.5px solid #cbd5e1', flexShrink: 0 }} />
              {texto}
            </div>
          ))}
        </div>
      )}

      {CON_RESPUESTAS.includes(tarea.tipo) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 7,
          background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10,
          padding: '9px 10px',
        }}>
          <ShieldOff size={11} style={{ color: '#94a3b8', flexShrink: 0, marginTop: 1 }} />
          {/* En presente y no en pasado: la tarea puede estar pendiente, y "lo que respondió"
              daría por hecho que ya la contestó. */}
          <span style={{ fontSize: 6.5, color: '#94a3b8', lineHeight: 1.5 }}>
            {preguntas > 0 && `${preguntas} ${preguntas === 1 ? 'pregunta' : 'preguntas'}. `}
            Las respuestas {nombre ? `de ${nombre}` : 'del colaborador'} las ve solo Recursos Humanos.
          </span>
        </div>
      )}
    </div>
  )
}

/* El camino: cabecera de etapa, divisor de actividad y un nodo por tarea. Verde relleno es
   una tarea hecha; el círculo hueco, una pendiente. */
/* EL MAPA DE MI ONBOARDING (opción R1): el buddy y el líder ven el recorrido igual que lo ve la
   persona —el mismo `MapaRutaOnb`, con sus etapas y nodos—, solo para mirar. Lo hecho con check, lo
   que le toca ahora con halo menta, lo que falta en gris. Tocar un nodo abre la tarea, de lectura.
   Antes era otro mapa (círculos menta rellenos sobre un fondo gris, etapas en píldoras grises). */
export default function RecorridoPhone({ etapas, onVerTarea }) {
  const siguiente = etapas.flatMap(e => e.tareas).find(t => !t.done)
  return (
    <div style={{ marginTop: 4 }}>
      <MapaRutaOnb etapas={etapas} flatTareas={e => e.tareas} iconoDe={tipo => infoTipo(tipo).icon} siguienteId={siguiente?.id}
        onAbrir={t => onVerTarea(t)} />
    </div>
  )
}
