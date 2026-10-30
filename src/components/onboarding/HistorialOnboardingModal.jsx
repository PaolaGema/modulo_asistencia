import { useState } from 'react'
import { X, Route, RefreshCw, Clock, ChevronDown, ChevronUp, FileText, Eye } from 'lucide-react'
import { ESTADO_HISTORIAL, contarTareas } from '../../data/historialIncorporaciones'
import { tipoMap } from '../../utils/tareaTipos'
import { useConfig } from '../../context/ConfigContext'
import { RutaPath } from './RutaPreviewModal'
import BarraVolver from '../layout/BarraVolver'

/* En el teléfono, las etiquetas de estado de siempre (DISENO_MOBILE.md): verde = listo, gris = lo demás. */
const ETIQUETA_TEL = { completado: ['var(--tx-verde)', 'var(--tn-verde)'] }

/* Línea de tiempo de las incorporaciones de una persona.
   `compact` es para el marco del teléfono: ahí no puede ser un modal `fixed`, porque
   taparía el escritorio entero en vez del celular. Se dibuja como panel dentro del marco. */

/* En el teléfono el camino de nodos no entra: 280px no alcanzan para las píldoras de etapa
   ni para los nodos alternados. Ahí el recorrido se lee como lista. */
function RecorridoCompacto({ etapas }) {
  return (
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {etapas.map((e, i) => (
        <div key={i}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 4 }}>
            <span style={{ fontSize: 7, fontWeight: 700, color: '#0C2D40' }}>{e.name}</span>
            <span style={{ fontSize: 5.5, color: '#94a3b8' }}>{e.duracion} días</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {e.actividades.flatMap(a => a.tareas).map(t => {
              const meta = tipoMap[t.tipo] || { icon: FileText, color: '#94a3b8' }
              const Ico = meta.icon
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#f8fafc', border: '1px solid #eef2f6', borderRadius: 7, padding: '5px 7px',
                }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                    background: `${meta.color}18`, color: meta.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ico size={8} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 6.5, fontWeight: 600, color: '#0C2D40', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* Detalle de una tarea del recorrido. Solo lectura: no se marca ni se desmarca nada de un
   proceso cerrado, pero sí se vuelve a abrir el material — que es a lo que se entra aquí. */
function TareaVista({ tarea, onCerrar }) {
  const meta = tipoMap[tarea.tipo] || { icon: FileText, color: '#94a3b8', label: 'Tarea' }
  const Ico = meta.icon
  const conMaterial = ['documento', 'video', 'audio'].includes(tarea.tipo)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 11, marginTop: 14,
      background: '#fff', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '12px 14px',
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: `${meta.color}18`, color: meta.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Ico size={16} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>{tarea.name}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
          {meta.label}{tarea.obligatoria ? ' · Obligatoria' : ''}
        </div>
      </div>
      {conMaterial && (
        <button className="og-btn-ghost" style={{ flexShrink: 0 }}>
          <Eye size={13} /> Abrir material
        </button>
      )}
      <button
        onClick={onCerrar}
        style={{ border: 'none', background: 'none', color: 'var(--icon-muted)', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
      >
        <X size={15} />
      </button>
    </div>
  )
}

function Entrada({ p, compact, ultimo }) {
  const [abierto, setAbierto] = useState(false)
  const [tareaVista, setTareaVista] = useState(null)
  const { gamificacion } = useConfig()
  const est = ESTADO_HISTORIAL[p.estado] || ESTADO_HISTORIAL['completado']
  const activo = p.estado === 'en-curso'
  const Icono = p.tipo === 'Onboarding' ? Route : RefreshCw
  const etapas = p.etapas || []
  const totalTareas = contarTareas(p)
  const s = compact
    ? { punto: 26, icono: 11, titulo: 9.6, meta: 7.4, chip: 6, gap: 9 }
    : { punto: 26, icono: 12, titulo: 13, meta: 11, chip: 10, gap: 14 }
  /* En el teléfono: el círculo con aro menta de Zona HR (relleno menta el proceso en curso) y la etiqueta
     de estado del sistema, sin el azul de escritorio. */
  const [chipTxt, chipFondo] = compact ? (ETIQUETA_TEL[p.estado] || ['var(--tx-gris)', 'var(--tn-gris)']) : [est.color, est.fondo]

  return (
    <div style={{ display: 'flex', gap: s.gap }}>
      {/* Riel: punto + línea hacia la entrada siguiente */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={compact ? {
          width: s.punto, height: s.punto, borderRadius: '50%', background: activo ? '#00E091' : 'var(--in-carta)',
          boxShadow: activo ? 'none' : 'inset 0 0 0 1.4px #00E091', color: '#0C2D40',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        } : {
          width: s.punto, height: s.punto, borderRadius: '50%',
          background: activo ? '#0C2D40' : '#f1f5f9',
          color: activo ? '#fff' : '#7C93A6',
          border: activo ? 'none' : '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icono size={s.icono} />
        </div>
        {!ultimo && <div style={{ flex: 1, width: compact ? 2 : 1.5, background: compact ? 'var(--in-linea)' : '#e2e8f0', marginTop: 3, minHeight: compact ? 14 : 20 }} />}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingBottom: compact ? 12 : 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: s.titulo, fontWeight: compact ? 600 : 700, color: compact ? 'var(--in-texto)' : '#0C2D40' }}>{p.ruta}</span>
          <span style={{
            background: chipFondo, color: chipTxt,
            fontSize: s.chip, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
          }}>
            {est.label}
          </span>
        </div>

        <div style={{ fontSize: s.meta, color: '#64748b', marginTop: 3 }}>{p.motivo}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, fontSize: s.meta, color: '#94a3b8' }}>
          <Clock size={compact ? 7 : 11} style={{ flexShrink: 0 }} />
          {p.fin ? `${p.inicio} — ${p.fin}` : `Desde ${p.inicio} · en curso`}
        </div>

        {activo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <div style={{ flex: 1, height: compact ? 4 : 6, background: '#edf2f7', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ width: `${p.pct}%`, height: '100%', background: '#00E091', borderRadius: 100 }} />
            </div>
            <span style={{ fontSize: s.meta, fontWeight: 700, color: '#0C2D40' }}>{p.pct}%</span>
          </div>
        )}

        {etapas.length > 0 && (
          <>
            <button
              onClick={() => setAbierto(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, marginTop: compact ? 6 : 9,
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: s.meta, fontWeight: 700, color: '#0C2D40',
              }}
            >
              {abierto ? 'Ocultar recorrido' : 'Ver recorrido'}
              <span style={{ fontWeight: 500, color: '#94a3b8' }}>
                · {etapas.length} {etapas.length === 1 ? 'etapa' : 'etapas'} · {totalTareas} {totalTareas === 1 ? 'tarea' : 'tareas'}
              </span>
              {abierto ? <ChevronUp size={compact ? 8 : 13} /> : <ChevronDown size={compact ? 8 : 13} />}
            </button>

            {abierto && (compact ? (
              <RecorridoCompacto etapas={etapas} />
            ) : (
              <>
                {/* Mismo camino de nodos que el constructor y que la vista previa de la
                    ruta, pero sin nada que tocar: aquí el recorrido ya ocurrió. */}
                <div style={{
                  marginTop: 14, padding: '20px 0',
                  borderRadius: 12, background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef4 100%)',
                }}>
                  <RutaPath etapas={etapas} gamificacion={gamificacion} onSelectTask={setTareaVista} />
                </div>
                {tareaVista && <TareaVista tarea={tareaVista} onCerrar={() => setTareaVista(null)} />}
              </>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function Cuerpo({ procesos, compact }) {
  if (procesos.length === 0) {
    return (
      <p style={{ fontSize: compact ? 7.6 : 12.5, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
        {compact
          ? 'Todavía no tiene procesos registrados. Aquí van a quedar su incorporación y cada reboarding que haga más adelante: por un ascenso, un cambio de área o una actualización obligatoria.'
          : 'Todavía no tienes procesos registrados. Aquí van a quedar tu incorporación y cada reboarding que hagas más adelante — por un ascenso, un cambio de área o una actualización obligatoria.'}
      </p>
    )
  }

  const cerrados = procesos.filter(p => p.estado !== 'en-curso').length
  return (
    <>
      <p style={{ fontSize: compact ? 7.4 : 11.5, color: compact ? 'var(--in-mute)' : '#94a3b8', margin: `0 0 ${compact ? 12 : 18}px` }}>
        {procesos.length} {procesos.length === 1 ? 'proceso' : 'procesos'} en total
        {cerrados > 0 && ` · ${cerrados} ${cerrados === 1 ? 'completado' : 'completados'}`}
      </p>
      {procesos.map((p, i) => (
        <Entrada key={p.id} p={p} compact={compact} ultimo={i === procesos.length - 1} />
      ))}
    </>
  )
}

export default function HistorialOnboardingModal({ procesos, nombre, compact = false, onCerrar }) {
  /* En el teléfono es una pantalla del módulo con «‹ Mi onboarding» para volver, no una ventana con
     «×» (auditoría heurística: la «×» hacía sentir que se había salido a otro lugar). */
  if (compact) {
    return (
      <div style={{ padding: '2px 2px', fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
        <BarraVolver texto="Mi onboarding" onVolver={onCerrar} />
        <div style={{ display: 'grid', marginBottom: 10 }}>
          <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>Mi trayectoria</b>
          <small style={{ fontSize: 8.2, color: 'var(--in-mute)' }}>Sus incorporaciones en la empresa</small>
        </div>
        <Cuerpo procesos={procesos} compact />
      </div>
    )
  }

  return (
    <div className="og-modal-back" onClick={onCerrar}>
      <div className="og-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="og-modal-hd">
          <div>
            <h3>Mi trayectoria</h3>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Incorporaciones de {nombre} en la empresa
            </div>
          </div>
          <button onClick={onCerrar}><X size={16} /></button>
        </div>
        <div className="og-modal-body">
          <Cuerpo procesos={procesos} compact={false} />
        </div>
      </div>
    </div>
  )
}
