import { useState } from 'react'
import { X, Search, Layers, Route, Copy, ArrowRight, AlertTriangle } from 'lucide-react'
import { rutaPlantillas } from '../../data/rutaPlantillas'
import { useConfig } from '../../context/ConfigContext'
import { RutaPath, TaskPreviewModal } from './RutaPreviewModal'
import ReemplazarContenidoModal from './ReemplazarContenidoModal'
import { nombrarCargos } from '../../utils/rutaEstados'

/* De dónde sale el contenido de una ruta: una plantilla del catálogo o una copia de otra ruta
   ya armada.

   Vive dentro del constructor y no antes de crear la ruta. Antes lo primero que se preguntaba
   al tocar "Nueva ruta" era "¿desde cero o desde plantilla?", y esa pregunta llegaba a ciegas:
   todavía no habías puesto el nombre ni visto qué trae cada plantilla. Peor, era una puerta de
   un solo sentido — quien elegía "desde cero" ya no volvía a ver el catálogo.

   Acá la oferta aparece cuando el lienzo vacío la vuelve evidente, sigue disponible después
   desde la barra superior, y sobre todo se puede *mirar* antes de traer: elegir una plantilla
   por su nombre y su conteo de tareas seguía siendo elegir a ciegas. La lista queda a la
   izquierda y el camino completo de la seleccionada a la derecha, con las tareas abribles.

   Copiar otra ruta no estaba en el flujo viejo y es lo que más se usa en la práctica: la
   segunda ruta de una empresa casi siempre se parece a la primera. */

/* Las etapas de la ruta general no viajan en la copia: el constructor vuelve a anteponer las
   suyas. Se descuentan también aquí para que la vista previa muestre exactamente lo que llega. */
const propias = (etapas = []) => etapas.filter(e => !e.locked)

const cuenta = (etapas = []) => ({
  etapas: etapas.length,
  actividades: etapas.reduce((s, e) => s + (e.actividades?.length || 0), 0),
  tareas: etapas.reduce((s, e) => s + (e.actividades || []).reduce((ss, a) => ss + (a.tareas?.length || 0), 0), 0),
})

export default function ElegirBaseRutaModal({ rutaActualId, rutas = [], etapasActuales = [], enCurso = 0, onUsar, onCerrar }) {
  const { gamificacion } = useConfig()
  const [pestana, setPestana] = useState('plantillas')
  const [busca, setBusca] = useState('')
  const [selId, setSelId] = useState(null)
  const [tareaAbierta, setTareaAbierta] = useState(null)
  const [confirmando, setConfirmando] = useState(false)

  const q = busca.trim().toLowerCase()
  const coincide = (nombre, area) => !q || nombre.toLowerCase().includes(q) || (area || '').toLowerCase().includes(q)

  const plantillasBase = rutaPlantillas
    .filter(t => t.etapasData?.length && coincide(t.name, t.area))
    .map(t => ({ id: `tpl-${t.id ?? t.name}`, nombre: t.name, area: t.area, etapas: propias(t.etapasData) }))
    .filter(t => t.etapas.length)

  /* Solo rutas con contenido y nunca la que se está editando: copiarse a sí misma no hace
     nada y ofrecerlo obliga a descartar la opción a mano. */
  const copiables = rutas
    .filter(r => r.id !== rutaActualId && r.etapasData?.length && !r.esGlobal && coincide(r.name, r.area))
    .map(r => ({ id: `ruta-${r.id}`, nombre: r.name, area: r.area, cargo: nombrarCargos(r), etapas: propias(r.etapasData) }))
    .filter(r => r.etapas.length)

  const lista = pestana === 'plantillas' ? plantillasBase : copiables
  /* Siempre hay algo en el panel derecho: si nadie eligió todavía, o el filtro dejó fuera lo
     elegido, manda el primero de la lista. */
  const sel = lista.find(i => i.id === selId) || lista[0] || null

  function elegir(id) {
    setSelId(id)
    setConfirmando(false)
  }

  function cambiarPestana(key) {
    setPestana(key)
    setSelId(null)
    setConfirmando(false)
  }

  const reemplaza = etapasActuales.length > 0

  return (
    <>
      <div className="pl-overlay" onClick={onCerrar}>
        <div
          className="pl-modal"
          style={{ width: 980, maxWidth: '96vw', height: '84vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="pl-modal-header" style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={16} style={{ color: '#fff' }} />
              </div>
              <h2>Empezar desde algo hecho</h2>
            </div>
            <button className="pl-modal-close" onClick={onCerrar}><X size={18} /></button>
          </div>

          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            {/* IZQUIERDA: qué hay disponible */}
            <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-soft)' }}>
              <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 4, background: 'var(--surface-hover)', borderRadius: 9, padding: 3, marginBottom: 12 }}>
                  {[
                    { key: 'plantillas', icon: Route, label: 'Plantillas', n: plantillasBase.length },
                    { key: 'copiar', icon: Copy, label: 'Copiar otra ruta', n: copiables.length },
                  ].map(t => {
                    const TIcon = t.icon
                    const on = pestana === t.key
                    return (
                      <button
                        key={t.key}
                        onClick={() => cambiarPestana(t.key)}
                        style={{
                          flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '8px 8px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                          background: on ? 'var(--surface-card)' : 'transparent',
                          color: on ? 'var(--text-heading)' : 'var(--text-muted)',
                          fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap',
                          boxShadow: on ? 'var(--sh-sm)' : 'none',
                        }}
                      >
                        <TIcon size={13} /> {t.label}
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)' }}>{t.n}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="pl-search-wrap" style={{ marginBottom: 12, maxWidth: 'none' }}>
                  <Search size={13} className="pl-search-ico" />
                  <input
                    type="text"
                    className="pl-search"
                    placeholder={pestana === 'plantillas' ? 'Buscar plantilla…' : 'Buscar ruta…'}
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
                {lista.length === 0 ? (
                  <div style={{ padding: '40px 10px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {pestana === 'copiar' && !q
                      ? 'Todavía no hay otra ruta con contenido para copiar. Cuando armes una, va a aparecer aquí.'
                      : 'No hay resultados para esa búsqueda.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {lista.map(item => {
                      const c = cuenta(item.etapas)
                      const on = sel?.id === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => elegir(item.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
                            padding: '11px 12px', borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit',
                            border: on ? '1.5px solid var(--green)' : '1px solid var(--border-soft)',
                            background: on ? 'var(--green-tint)' : 'var(--surface-card)',
                            transition: 'background .12s, border-color .12s',
                          }}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                            background: on ? 'var(--green)' : 'var(--green-tint)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Route size={15} style={{ color: on ? '#fff' : 'var(--green)' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.nombre}
                            </div>
                            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.area}{item.cargo ? ` · ${item.cargo}` : ''} — {c.etapas} {c.etapas === 1 ? 'etapa' : 'etapas'} · {c.tareas} {c.tareas === 1 ? 'tarea' : 'tareas'}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* DERECHA: cómo se ve lo que vas a traer */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              {!sel ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40, textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Route size={22} style={{ color: '#94a3b8' }} />
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.6 }}>
                    Elige una plantilla o una ruta de la izquierda para ver su contenido aquí.
                  </div>
                </div>
              ) : (
                <>
                  {/* Sin barra de título sobre el camino, igual que la Vista previa: el camino
                      ocupa el panel entero y por eso se lee como una ruta y no como el
                      contenido de un recuadro. Nombre y conteos ya están en la tarjeta
                      resaltada de la izquierda; repetirlos aquí costaba una banda de alto
                      completo para no decir nada nuevo. */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '18px 0', background: 'linear-gradient(180deg, #f0f4f8 0%, #e8eef4 100%)' }}>
                    <RutaPath etapas={sel.etapas} gamificacion={gamificacion} onSelectTask={setTareaAbierta} />
                  </div>

                  {/* Más angosto que el pie estándar: aquí lleva un botón y, cuando reemplaza,
                      un aviso — no la fila de Cancelar/Guardar para la que está pensado. */}
                  <div className="pl-modal-footer" style={{ flexShrink: 0, gap: 10, padding: '10px 16px' }}>
                    {/* Traer una base pisa lo que ya está armado. Con el lienzo vacío no hay nada
                        que perder y el botón va directo; con contenido, el aviso y el segundo
                        toque son la única red que hay: esta acción no tiene deshacer. */}
                    {reemplaza ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginRight: 'auto', fontSize: 11, color: '#92400e', fontWeight: 600, lineHeight: 1.4 }}>
                        <AlertTriangle size={14} style={{ color: '#d97706', flexShrink: 0 }} />
                        Reemplaza el contenido actual de la ruta
                      </span>
                    ) : (
                      /* El pie ya existe por el botón, así que la pista viaja aquí y no cuesta
                         alto propio. Cede el lugar al aviso de reemplazo, que pesa más. */
                      <span style={{ marginRight: 'auto', fontSize: 10.5, color: '#94a3b8' }}>
                        Clic en una tarea para ver su contenido
                      </span>
                    )}
                    <button
                      className="pl-btn-save"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={() => (reemplaza ? setConfirmando(true) : onUsar(sel.etapas, sel.nombre))}
                    >
                      {reemplaza ? 'Reemplazar con esta' : 'Usar esta base'} <ArrowRight size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {tareaAbierta && (
        <TaskPreviewModal task={tareaAbierta} onClose={() => setTareaAbierta(null)} />
      )}

      {/* La confirmación es un diálogo aparte y no un segundo estado del mismo pie.

          Antes el pie se transformaba: el mismo botón que decía "Reemplazar con esta" pasaba a
          decir "Sí, reemplazar" en el mismo lugar exacto. Quien venía haciendo clic seguido
          confirmaba sin haber leído nada — la confirmación caía justo debajo del cursor, que es
          la única posición donde no protege de nada.

          Acá el diálogo aparece centrado, lejos del botón que se acaba de tocar, y obliga a
          mover el mouse para responder. El lienzo vacío sigue sin preguntar nada: no hay qué
          perder y la acción va directa. */}
      {/* Los que están en curso no se ven afectados por este botón: conservan la versión con la
          que empezaron y la decisión que sí los alcanza llega al guardar, en el modal de
          alcance. Decirlo aquí es la diferencia entre que quien reemplaza sepa que hay gente
          adentro —y vaya con cuidado a esa segunda pregunta— o se entere recién cuando la
          pregunta aparece, con la ruta ya reemplazada. */}
      {confirmando && sel && (
        <ReemplazarContenidoModal
          actual={cuenta(etapasActuales)}
          entrante={cuenta(sel.etapas)}
          nombreEntrante={sel.nombre}
          enCurso={enCurso}
          onConfirmar={() => onUsar(sel.etapas, sel.nombre)}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </>
  )
}
