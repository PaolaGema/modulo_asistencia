import { useState } from 'react'
import { Ban, CheckCircle2, FileStack, Pencil, Plus, Power, Trash2, AlertTriangle, Info } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Etiqueta, MenuAcciones, Modal, Vacio } from '../../components/documentacion/comunes'
import Desplegable from '../../components/layout/Desplegable'
import { DESTINATARIOS, SENSIBILIDAD } from '../../data/documentacionData'
import './configuracion.css'

/* ── TIPOS DE DOCUMENTO (pantalla 2, revisada) ────────────────────────────
   Dos niveles, como el Salar: el tipo agrupa y en el SUBTIPO se configura todo.

   ERA UNA TABLA DE DIECISÉIS COLUMNAS que pedía desplazarse a los costados. Ahora es maestro y
   detalle: a la izquierda los tipos, a la derecha los subtipos del elegido con lo esencial —vigencia,
   visibilidad, qué hace el colaborador, si se exige—, y el resto vive en el formulario del subtipo.
   Las acciones van en el menú de tres puntos de cada fila.

   LOS PARÁMETROS GENERALES VIVEN ACÁ, en su pestaña: son el valor por defecto de los avisos de cada
   subtipo y no merecían una entrada propia en el menú. La retención va con su tipo, y la numeración,
   con los modelos que la usan. */

const FORMATOS = ['pdf', 'jpg', 'png', 'docx', 'xlsx']

/* El Sí/No de la ficha del colaborador, el mismo dibujo: dos botones y no un interruptor. */
function SiNo({ label, valor, onCambio, ayuda }) {
  return (
    <div className="xd-binario">
      {label && <span>{label}</span>}
      <div className="sn-grupo" role="group" aria-label={label}>
        {[{ v: true, t: 'Sí' }, { v: false, t: 'No' }].map(o => (
          <button key={o.t} type="button" className={`sn-op${valor === o.v ? ' on' : ''}`} aria-pressed={valor === o.v} onClick={() => onCambio(o.v)}>{o.t}</button>
        ))}
      </div>
      {ayuda && <span className="xd-ayuda">{ayuda}</span>}
    </div>
  )
}

const SUBTIPO_VACIO = {
  tipoId: '', nombre: '', persona: '', codigoErp: '', varios: false, visibleColab: true, editableColab: true,
  notificaVencer: false, vence: false, vigenciaMeses: null, formatos: ['pdf', 'jpg', 'png'],
  tamanoMaxMB: 10, sensibilidad: 'restringido', hitos: null, destinatarios: null,
  exigidoATodos: false, plazoDias: 30, activo: true,
}

const TONO_VIS = { confidencial: 'violeta', restringido: 'azul', general: 'gris' }

/* Una sección del formulario del subtipo: título y lo suyo. Van en el orden en que se piensa un
   documento —qué es, cómo se carga, quién lo ve, cuánto dura, a quién se avisa, a quién se exige. */
function Seccion({ titulo, children }) {
  return (
    <div className="xd-grupo xd-ancho">
      <p className="xd-grupo-tit">{titulo}</p>
      {children}
    </div>
  )
}

function ModalSubtipo({ inicial, tipos, parametros, onGuardar, onCerrar }) {
  const [s, setS] = useState(inicial)
  const [propios, setPropios] = useState(!!inicial.hitos?.length)
  const [intento, setIntento] = useState(false)
  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }))

  const errores = []
  if (!s.tipoId) errores.push('Elija el tipo al que pertenece.')
  if (!s.nombre.trim()) errores.push('Escriba el nombre del subtipo.')
  if (s.vence && !(Number(s.vigenciaMeses) > 0)) errores.push('Si vence, indique su vigencia en meses: sin ella no se puede proponer la fecha ni avisar (RF-03).')
  if (!s.formatos.length) errores.push('Marque al menos un formato aceptado.')
  const hitosLimpios = (s.hitos || []).map(Number).filter(n => n > 0)
  if (s.vence && s.notificaVencer && propios && !hitosLimpios.length) errores.push('Escriba al menos un hito propio, o use los generales.')

  const guardar = () => {
    setIntento(true)
    if (errores.length) return
    const limpio = {
      ...s,
      nombre: s.nombre.trim(),
      persona: s.persona.trim() || s.nombre.trim(),
      vigenciaMeses: s.vence ? Number(s.vigenciaMeses) : null,
      notificaVencer: s.vence ? s.notificaVencer : false,
      tamanoMaxMB: Number(s.tamanoMaxMB) || 10,
      hitos: propios ? [...new Set(hitosLimpios)].sort((a, b) => b - a).slice(0, 3) : null,
      destinatarios: s.destinatarios?.length ? s.destinatarios : null,
      plazoDias: Number(s.plazoDias) || 0,
    }
    delete limpio.notificaRegistro
    onGuardar(limpio)
  }

  const hito = (i, v) => { const h = [...(s.hitos || ['', '', ''])]; while (h.length < 3) h.push(''); h[i] = v.replace(/\D/g, ''); set('hitos', h) }
  const alternarEn = (k, v) => { const l = s[k] || []; set(k, l.includes(v) ? l.filter(x => x !== v) : [...l, v]) }

  return (
    <Modal
      titulo={inicial.id ? `Editar «${inicial.nombre}»` : 'Nuevo subtipo'}
      Icono={FileStack}
      onCerrar={onCerrar}
      ancho={720}
      pie={<>
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="pl-btn-save" onClick={guardar}>{inicial.id ? 'Guardar cambios' : 'Crear subtipo'}</button>
      </>}
    >
      {intento && errores.length > 0 && (
        <div className="xd-aviso" role="alert"><AlertTriangle size={15} /><div>{errores.map(e => <div key={e}>{e}</div>)}</div></div>
      )}
      <div className="xd-form">
        <Seccion titulo="Información general">
          <div className="xd-binarios">
            <label className="pl-label">Tipo
              <Desplegable valor={s.tipoId} onCambio={v => set('tipoId', v)} ariaLabel="Tipo" opciones={tipos.filter(t => t.activo || t.id === s.tipoId).map(t => ({ valor: t.id, etiqueta: t.nombre }))} />
            </label>
            <label className="pl-label">Código ERP
              <input className="pl-input" value={s.codigoErp} onChange={e => set('codigoErp', e.target.value)} placeholder="IP-09" />
            </label>
            <label className="pl-label">Nombre
              <input className="pl-input" value={s.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Certificado de antecedentes" />
            </label>
            <label className="pl-label">Nombre para el colaborador
              <input className="pl-input" value={s.persona} onChange={e => set('persona', e.target.value)} placeholder="Su certificado de antecedentes" />
              <span className="xd-ayuda">Lo que lee el colaborador en la app, en lenguaje de persona.</span>
            </label>
          </div>
        </Seccion>

        <Seccion titulo="Carga">
          <div className="xd-binarios">
            <SiNo label="¿Admite varios documentos?" valor={s.varios} onCambio={v => set('varios', v)} ayuda="El documento de identidad es uno; los títulos o las actas de entrega pueden ser varios." />
            <SiNo label="¿Lo puede subir el colaborador?" valor={s.editableColab} onCambio={v => set('editableColab', v)} ayuda="Lo que sube entra en revisión hasta que RR.HH. lo aprueba." />
          </div>
          <div>
            <span className="xd-ayuda">Formatos aceptados (RF-04)</span>
            <div className="xd-casillas" style={{ marginTop: 6 }}>
              {FORMATOS.map(f => (
                <label key={f} className={`xd-casilla${s.formatos.includes(f) ? ' on' : ''}`}>
                  <input type="checkbox" checked={s.formatos.includes(f)} onChange={() => alternarEn('formatos', f)} /> {f.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
          <label className="pl-label">Tamaño máximo (MB)
            <input className="pl-input xd-num" inputMode="numeric" value={s.tamanoMaxMB} onChange={e => set('tamanoMaxMB', e.target.value.replace(/\D/g, ''))} />
          </label>
          <p className="xd-nota"><Info size={12} aria-hidden="true" style={{ display: 'inline', verticalAlign: -2 }} /> RR.HH. recibe siempre un aviso cuando se registra o se edita un documento.</p>
        </Seccion>

        <Seccion titulo="Visibilidad">
          <div className="xd-binarios">
            <SiNo label="¿Lo ve el colaborador?" valor={s.visibleColab} onCambio={v => set('visibleColab', v)} />
            <label className="pl-label">Quién puede consultarlo
              <Desplegable valor={s.sensibilidad} onCambio={v => set('sensibilidad', v)} ariaLabel="Visibilidad" opciones={Object.entries(SENSIBILIDAD).map(([k, v]) => ({ valor: k, etiqueta: v.label }))} />
              <span className="xd-ayuda">{SENSIBILIDAD[s.sensibilidad]?.desc}.</span>
            </label>
          </div>
        </Seccion>

        <Seccion titulo="Vigencia">
          <div className="xd-binarios">
            <SiNo label="¿Vence?" valor={s.vence} onCambio={v => { set('vence', v); if (v) set('notificaVencer', true) }} />
            {s.vence && (
              <label className="pl-label">Vigencia por defecto (meses)
                <input className="pl-input xd-num" inputMode="numeric" value={s.vigenciaMeses ?? ''} onChange={e => set('vigenciaMeses', e.target.value.replace(/\D/g, ''))} placeholder="12" />
                <span className="xd-ayuda">Con esto se propone la fecha de vencimiento al cargarlo.</span>
              </label>
            )}
          </div>
        </Seccion>

        {s.vence && (
          <Seccion titulo="Avisos de vencimiento">
            <SiNo label="¿Avisa antes de vencer?" valor={s.notificaVencer} onCambio={v => set('notificaVencer', v)} />
            {s.notificaVencer && (
              <div className="xd-pila" style={{ gap: 10 }}>
                <div className="xd-casillas" role="group" aria-label="Hitos de aviso">
                  <label className={`xd-casilla${!propios ? ' on' : ''}`}><input type="radio" checked={!propios} onChange={() => setPropios(false)} /> Usar los generales ({parametros.hitos.join(', ')} días)</label>
                  <label className={`xd-casilla${propios ? ' on' : ''}`}><input type="radio" checked={propios} onChange={() => { setPropios(true); if (!s.hitos?.length) set('hitos', ['60', '30', '7']) }} /> Hitos propios</label>
                </div>
                {propios && (
                  <div className="xd-hitos">
                    {[0, 1, 2].map(i => (
                      <input key={i} className="pl-input" inputMode="numeric" aria-label={`Hito ${i + 1} en días`} value={(s.hitos || [])[i] ?? ''} onChange={e => hito(i, e.target.value)} placeholder="días" />
                    ))}
                    <span className="xd-ayuda">días antes. Hasta tres avisos (RF-06).</span>
                  </div>
                )}
                <div>
                  <span className="xd-ayuda">A quién avisar {s.destinatarios?.length ? '' : `(sin marcar, los generales: ${parametros.destinatarios.map(d => DESTINATARIOS[d]).join(', ')})`}</span>
                  <div className="xd-casillas" style={{ marginTop: 6 }}>
                    {Object.entries(DESTINATARIOS).map(([k, l]) => (
                      <label key={k} className={`xd-casilla${s.destinatarios?.includes(k) ? ' on' : ''}`}>
                        <input type="checkbox" checked={!!s.destinatarios?.includes(k)} onChange={() => alternarEn('destinatarios', k)} /> {l}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Seccion>
        )}

        <Seccion titulo="Requisito">
          <div className="xd-binarios">
            <SiNo label="¿Se exige a todo el personal?" valor={!!s.exigidoATodos} onCambio={v => set('exigidoATodos', v)} />
            {s.exigidoATodos && (
              <label className="pl-label">Plazo desde el ingreso (días)
                <input className="pl-input xd-num" inputMode="numeric" value={s.plazoDias ?? ''} onChange={e => set('plazoDias', e.target.value.replace(/\D/g, ''))} placeholder="30" />
                <span className="xd-ayuda">Mientras corre el plazo, que falte no descuenta del cumplimiento.</span>
              </label>
            )}
          </div>
          <p className="xd-nota">Lo que se exige solo a alguien se agrega desde su expediente.</p>
        </Seccion>
      </div>
    </Modal>
  )
}

/* La pantalla es una pestaña de Configuración (`Configuracion.jsx`). */
export function Taxonomia() {
  const { tipos, subtipos, documentos, parametros, setTipos, setSubtipos, setRequisitos, anotarConfig } = useDocumentacion()
  const [elegido, setElegido] = useState(() => tipos[0]?.id || '')
  const [editando, setEditando] = useState(null)
  const [tipoModal, setTipoModal] = useState(null)
  const [bloqueo, setBloqueo] = useState(null)
  const [borrar, setBorrar] = useState(null)

  const tipo = tipos.find(t => t.id === elegido) || tipos[0] || null
  const docsDe = id => documentos.filter(d => d.subtipoId === id).length
  const subDe = id => subtipos.filter(s => s.tipoId === id)
  const visibles = tipo ? subDe(tipo.id) : []

  const guardarSubtipo = s => {
    if (s.id) {
      setSubtipos(prev => prev.map(x => (x.id === s.id ? s : x)))
      anotarConfig(`Editó el subtipo «${s.nombre}»`)
    } else {
      const nuevo = { ...s, id: `s-${Date.now().toString(36)}` }
      setSubtipos(prev => [...prev, nuevo])
      anotarConfig(`Creó el subtipo «${s.nombre}»`)
    }
    setElegido(s.tipoId)
    setEditando(null)
  }

  /* RF-01: un tipo desactivado no aparece al cargar, pero sus documentos siguen visibles. */
  const alternarTipo = t => {
    setTipos(prev => prev.map(x => (x.id === t.id ? { ...x, activo: !x.activo } : x)))
    anotarConfig(`${t.activo ? 'Desactivó' : 'Activó'} el tipo «${t.nombre}»`)
  }
  const alternarSubtipo = s => {
    setSubtipos(prev => prev.map(x => (x.id === s.id ? { ...x, activo: !x.activo } : x)))
    anotarConfig(`${s.activo ? 'Desactivó' : 'Activó'} el subtipo «${s.nombre}»`)
    setBloqueo(null)
  }

  const guardarTipo = () => {
    const nombre = tipoModal.nombre.trim()
    if (!nombre) return
    const retencionAnios = Number(tipoModal.retencion) || 0
    if (tipoModal.id) {
      setTipos(prev => prev.map(x => (x.id === tipoModal.id ? { ...x, nombre, retencionAnios } : x)))
      anotarConfig(`Editó el tipo «${nombre}» (retención: ${retencionAnios} años)`)
    } else {
      const id = `t-${Date.now().toString(36)}`
      setTipos(prev => [...prev, { id, nombre, activo: true, retencionAnios }])
      setElegido(id)
      anotarConfig(`Creó el tipo «${nombre}»`)
    }
    setTipoModal(null)
  }

  /* RF-08: NADA CON HISTORIA SE ELIMINA. Al pulsar explica por qué no, con el conteo, y ofrece lo
     que sí se puede hacer, que es desactivar. */
  const intentarBorrar = s => {
    const n = docsDe(s.id)
    if (n > 0) setBloqueo({ s, n })
    else setBorrar(s)
  }

  const eliminar = () => {
    setSubtipos(prev => prev.filter(x => x.id !== borrar.id))
    setRequisitos(prev => prev.filter(r => r.subtipoId !== borrar.id))
    anotarConfig(`Eliminó el subtipo «${borrar.nombre}», sin documentos`)
    setBorrar(null)
  }

  return (
    <div className="xd-maestro">
      {/* ── Los tipos ── */}
      <section className="dc-tarjeta xd-tipos-lista">
        <div className="dc-tarjeta-cab">
          <h2>Tipos</h2>
          <button type="button" className="dc-btn dc-btn-sm" onClick={() => setTipoModal({ nombre: '', retencion: '5' })}><Plus size={13} /> Nuevo tipo</button>
        </div>
        <ul>
          {tipos.map(t => {
            const n = subDe(t.id).length
            return (
              <li key={t.id} className={`xd-tipo-item${t.id === tipo?.id ? ' on' : ''}${t.activo ? '' : ' inactivo'}`}>
                <button type="button" className="xd-tipo-sel" aria-pressed={t.id === tipo?.id} onClick={() => setElegido(t.id)}>
                  <b>{t.nombre}</b>
                  <span>{n} {n === 1 ? 'subtipo' : 'subtipos'}{t.activo ? '' : ' · inactivo'}</span>
                </button>
                <MenuAcciones etiqueta={`Acciones de ${t.nombre}`} items={[
                  { label: 'Editar', Icono: Pencil, onClick: () => setTipoModal({ id: t.id, nombre: t.nombre, retencion: String(t.retencionAnios ?? '') }) },
                  { label: t.activo ? 'Desactivar' : 'Activar', Icono: Power, onClick: () => alternarTipo(t) },
                ]} />
              </li>
            )
          })}
        </ul>
      </section>

      {/* ── Los subtipos del tipo elegido ── */}
      <section className="dc-tarjeta xd-detalle">
        <div className="dc-tarjeta-cab">
          <div>
            <h2>{tipo?.nombre || 'Sin tipos'}</h2>
            {tipo && <span className="xd-nota">Se conserva {tipo.retencionAnios || 0} años después de la desvinculación{tipo.activo ? '' : ' · tipo inactivo: no aparece al cargar'}</span>}
          </div>
          {tipo && <button type="button" className="pl-btn-new" onClick={() => setEditando({ ...SUBTIPO_VACIO, tipoId: tipo.id })}><Plus size={14} color="#00E091" /> Nuevo subtipo</button>}
        </div>
        {visibles.length === 0 ? (
          <Vacio Icono={FileStack} titulo="Este tipo todavía no tiene subtipos" texto="El subtipo es el documento concreto —documento de identidad, título o diploma— y es donde se configura todo." />
        ) : (
          <table className="as-table xd-tabla">
            <thead>
              <tr>
                <th>Subtipo</th><th>Vigencia</th><th>Visibilidad</th><th>Colaborador</th><th>Exigido</th><th>Estado</th><th><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map(s => (
                <tr key={s.id} className={`xd-fila-link${s.activo ? '' : ' inactivo'}`} onClick={() => setEditando({ ...SUBTIPO_VACIO, ...s })}>
                  <td data-etq="Subtipo"><span className="xd-nomsub"><b>{s.nombre}</b><span>{s.codigoErp || 'Sin código'}{s.campoFicha ? ' · enlazado con la ficha' : ''}</span></span></td>
                  <td data-etq="Vigencia">{s.vence ? `${s.vigenciaMeses || '¿?'} meses` : <span className="xd-no">No vence</span>}</td>
                  <td data-etq="Visibilidad"><Etiqueta tono={TONO_VIS[s.sensibilidad]}>{SENSIBILIDAD[s.sensibilidad]?.label}</Etiqueta></td>
                  <td data-etq="Colaborador">
                    {!s.visibleColab ? <span className="xd-no">No lo ve</span> : s.editableColab ? 'Lo ve · Lo sube' : 'Lo ve'}
                  </td>
                  <td data-etq="Exigido">{s.exigidoATodos ? `A todos · ${s.plazoDias ?? 0} d` : <span className="xd-no">—</span>}</td>
                  <td data-etq="Estado">{s.activo ? <Etiqueta tono="verde">Activo</Etiqueta> : <Etiqueta tono="gris">Inactivo</Etiqueta>}</td>
                  <td className="xd-acc" onClick={e => e.stopPropagation()}>
                    <MenuAcciones etiqueta={`Acciones de ${s.nombre}`} items={[
                      { label: 'Editar', Icono: Pencil, onClick: () => setEditando({ ...SUBTIPO_VACIO, ...s }) },
                      { label: s.activo ? 'Desactivar' : 'Activar', Icono: Power, onClick: () => alternarSubtipo(s) },
                      { label: 'Eliminar', Icono: Trash2, peligro: true, titulo: docsDe(s.id) > 0 ? `Tiene ${docsDe(s.id)} documentos: solo se puede desactivar` : undefined, onClick: () => intentarBorrar(s) },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {editando && <ModalSubtipo inicial={editando} tipos={tipos} parametros={parametros} onGuardar={guardarSubtipo} onCerrar={() => setEditando(null)} />}

      {tipoModal && (
        <Modal
          titulo={tipoModal.id ? 'Editar tipo' : 'Nuevo tipo'}
          Icono={FileStack}
          onCerrar={() => setTipoModal(null)}
          ancho={460}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setTipoModal(null)}>Cancelar</button>
            <button type="button" className="pl-btn-save" disabled={!tipoModal.nombre.trim()} onClick={guardarTipo}>{tipoModal.id ? 'Guardar' : 'Crear tipo'}</button>
          </>}
        >
          <label className="pl-label" style={{ fontSize: 13 }}>Nombre del tipo
            <input className="pl-input" autoFocus value={tipoModal.nombre} onChange={e => setTipoModal({ ...tipoModal, nombre: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') guardarTipo() }} placeholder="Documentos personales" />
          </label>
          <label className="pl-label" style={{ fontSize: 13 }}>Años de retención después de la desvinculación
            <span className="xd-fila"><input className="pl-input xd-num" inputMode="numeric" value={tipoModal.retencion} onChange={e => setTipoModal({ ...tipoModal, retencion: e.target.value.replace(/\D/g, '') })} /> años</span>
          </label>
          <div className="xd-aviso info"><Info size={15} /><span>Al cumplirse el plazo el sistema <b>avisa y no borra</b>: la eliminación la decide una persona, con motivo (RN-22, RF-87).</span></div>
          <p className="xd-nota">Evite los cajones como «Otros»: todo lo que nadie clasifica termina ahí y deja de poder exigirse.</p>
        </Modal>
      )}

      {bloqueo && (
        <Modal
          titulo="No se puede eliminar"
          Icono={Ban}
          onCerrar={() => setBloqueo(null)}
          ancho={460}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setBloqueo(null)}>Cerrar</button>
            {bloqueo.s.activo && <button type="button" className="pl-btn-save" onClick={() => alternarSubtipo(bloqueo.s)}>Desactivarlo</button>}
          </>}
        >
          <div className="xd-aviso info"><Info size={15} />
            <div>
              <b>«{bloqueo.s.nombre}» tiene {bloqueo.n} {bloqueo.n === 1 ? 'documento cargado' : 'documentos cargados'}.</b> Un subtipo con historia no se elimina (RF-08): borrarlo dejaría esos documentos sin saber qué son.
              {bloqueo.s.activo ? ' Lo que sí puede hacer es desactivarlo: deja de ofrecerse al cargar y lo ya cargado sigue visible.' : ' Ya está desactivado.'}
            </div>
          </div>
        </Modal>
      )}

      {borrar && (
        <Modal
          titulo="Eliminar subtipo"
          Icono={Trash2}
          onCerrar={() => setBorrar(null)}
          ancho={440}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setBorrar(null)}>Cancelar</button>
            <button type="button" className="pl-btn-save" style={{ background: 'var(--dc-rojo)' }} onClick={eliminar}>Eliminar</button>
          </>}
        >
          <p className="xd-nota">«<b>{borrar.nombre}</b>» no tiene documentos cargados, así que se puede eliminar. Si se le exige a alguien en su expediente, ese requisito se quita.</p>
        </Modal>
      )}
    </div>
  )
}

/* ── AVISOS GENERALES (antes «Parámetros y avisos») ───────────────────────
   El valor POR DEFECTO de los subtipos que no declaran los suyos (RF-06, RF-35), más el aviso de
   fin de contrato (RF-40), y el resumen al responsable (RF-41). La papelera se quitó (16 oct 2026): un documento se anula.

   SE EDITA UN BORRADOR Y SE GUARDA DE UNA VEZ: hasta pulsar «Guardar» nada toca lo que el resto
   del módulo lee. */
const numero = v => v.replace(/\D/g, '')

export function AvisosGenerales() {
  const { parametros, setParametros, anotarConfig } = useDocumentacion()
  const [p, setP] = useState(() => ({ ...parametros, hitos: [...parametros.hitos, '', '', ''].slice(0, 3).map(String) }))
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => { setP(prev => ({ ...prev, [k]: v })); setGuardado(false) }
  const alternarDest = d => set('destinatarios', p.destinatarios.includes(d) ? p.destinatarios.filter(x => x !== d) : [...p.destinatarios, d])

  const hitosLimpios = [...new Set(p.hitos.map(Number).filter(n => n > 0))].sort((a, b) => b - a)
  /* Lo que se guardaría, ya normalizado: comparar el borrador crudo daría «cambios sin guardar»
     por un 45 escrito como texto. */
  const normal = {
    ...p,
    hitos: hitosLimpios,
    avisoContratoDias: Number(p.avisoContratoDias) || 45,
    papeleraDias: Number(p.papeleraDias) || 30,
  }
  const sucio = JSON.stringify(normal) !== JSON.stringify(parametros)

  const guardar = () => {
    if (p.notificarVencimiento && !hitosLimpios.length) return setError('Con los avisos encendidos hace falta al menos un hito.')
    if (p.notificarVencimiento && !p.destinatarios.length) return setError('Elija al menos a quién avisar.')
    setError('')
    setParametros(normal)
    anotarConfig('Cambió los avisos generales del módulo')
    setP({ ...normal, hitos: [...hitosLimpios, '', '', ''].slice(0, 3).map(String) })
    setGuardado(true)
  }

  return (
    <>
      <p className="xd-nota">Son los valores por defecto: cada subtipo puede tener sus propios avisos en su formulario.</p>
      <div className="xd-params">
        <section className="dc-tarjeta">
          <div className="dc-tarjeta-cab"><h2>Avisos de vencimiento</h2></div>
          <div className="dc-tarjeta-cuerpo">
            <div className="xd-campo">¿Avisar antes de que un documento venza?
              <SiNo label="" valor={p.notificarVencimiento} onCambio={v => set('notificarVencimiento', v)} />
            </div>
            {p.notificarVencimiento && <>
              <div className="xd-campo">Hitos por defecto
                <div className="xd-hitos">
                  {[0, 1, 2].map(i => (
                    <input key={i} className="pl-input xd-num" style={{ width: 78 }} inputMode="numeric" aria-label={`Hito ${i + 1} en días`} placeholder="días" value={p.hitos[i]} onChange={e => set('hitos', p.hitos.map((h, j) => (j === i ? numero(e.target.value) : h)))} />
                  ))}
                </div>
                <span className="xd-ayuda">Días antes del vencimiento. Hasta tres: una alerta que llega el mismo día llegó tarde.</span>
              </div>
              <div className="xd-campo">A quién avisar por defecto
                <div className="xd-casillas">
                  {Object.entries(DESTINATARIOS).map(([k, l]) => (
                    <label key={k} className={`xd-casilla${p.destinatarios.includes(k) ? ' on' : ''}`}><input type="checkbox" checked={p.destinatarios.includes(k)} onChange={() => alternarDest(k)} /> {l}</label>
                  ))}
                </div>
              </div>
              <div className="xd-campo">Canales
                <div className="xd-casillas">
                  {[['correo', 'Correo'], ['app', 'Notificación en la app']].map(([k, l]) => (
                    <label key={k} className={`xd-casilla${p.canales[k] ? ' on' : ''}`}><input type="checkbox" checked={!!p.canales[k]} onChange={e => set('canales', { ...p.canales, [k]: e.target.checked })} /> {l}</label>
                  ))}
                </div>
                <span className="xd-ayuda">El colaborador elige el suyo dentro de estos. Un aviso llega una vez por canal (RF-37).</span>
              </div>
            </>}
            <div className="xd-campo">Resumen al responsable
              <div style={{ maxWidth: 240 }}>
                <Desplegable valor={p.resumen} onCambio={v => set('resumen', v)} ariaLabel="Resumen periódico" opciones={[{ valor: 'semanal', etiqueta: 'Semanal' }, { valor: 'mensual', etiqueta: 'Mensual' }, { valor: 'nunca', etiqueta: 'No enviar' }]} />
              </div>
              <span className="xd-ayuda">Un solo correo con lo vencido, lo que está por vencer y lo que falta (RF-41).</span>
            </div>
          </div>
        </section>

        <section className="dc-tarjeta">
          <div className="dc-tarjeta-cab"><h2>Contratos</h2></div>
          <div className="dc-tarjeta-cuerpo">
            <label className="xd-campo">Aviso de fin de contrato
              <span className="xd-fila"><input className="pl-input xd-num" inputMode="numeric" value={p.avisoContratoDias} onChange={e => set('avisoContratoDias', numero(e.target.value))} /> días antes</span>
              <span className="xd-ayuda">Un plazo fijo avisa al responsable con esta anticipación, con tiempo para renovar o finalizar (RF-40).</span>
            </label>
            <p className="xd-nota">RR.HH. recibe siempre un aviso cuando se registra o se edita un documento: no se puede apagar.</p>
          </div>
        </section>
      </div>

      <div className="xd-guardar">
        {error ? <span className="xd-sucio" role="alert">{error}</span>
          : guardado && !sucio ? <span className="xd-guardado" role="status"><CheckCircle2 size={15} /> Cambios guardados</span>
            : sucio ? <span className="xd-sucio">Hay cambios sin guardar</span> : <span style={{ marginRight: 'auto' }} />}
        <button type="button" className="pl-btn-save" disabled={!sucio} onClick={guardar}>Guardar avisos</button>
      </div>
    </>
  )
}
