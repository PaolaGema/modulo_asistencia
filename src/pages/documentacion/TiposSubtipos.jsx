import { useState } from 'react'
import { Ban, FileStack, Pencil, Plus, Power, Trash2, AlertTriangle, Info } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera, Etiqueta, Modal, Vacio } from '../../components/documentacion/comunes'
import Desplegable from '../../components/layout/Desplegable'
import { DESTINATARIOS, SENSIBILIDAD } from '../../data/documentacionData'
import './configuracion.css'

/* ── TIPOS Y SUBTIPOS (pantalla 2, RF-01 a RF-06, RF-08) ──────────────────
   Dos niveles, como el Salar, porque es el punto justo (2.2): tres niveles nadie los mantiene y
   uno solo no agrupa. El tipo casi no tiene atributos; todo se configura en el SUBTIPO, y por
   eso su tabla es la pieza central de la pantalla, con los atributos en columnas como la del
   Salar —la mejor pantalla de su módulo— más los cuatro que le faltaban: vigencia, formatos,
   sensibilidad e hitos propios. */

const FORMATOS = ['pdf', 'jpg', 'png', 'docx', 'xlsx']

/* El Sí/No de la ficha del colaborador, el mismo dibujo: dos botones y no un interruptor. */
function SiNo({ label, valor, onCambio, ayuda }) {
  return (
    <div className="xd-binario">
      <span>{label}</span>
      <div className="sn-grupo" role="group" aria-label={label}>
        {[{ v: true, t: 'Sí' }, { v: false, t: 'No' }].map(o => (
          <button key={o.t} type="button" className={`sn-op${valor === o.v ? ' on' : ''}`} aria-pressed={valor === o.v} onClick={() => onCambio(o.v)}>{o.t}</button>
        ))}
      </div>
      {ayuda && <span className="xd-ayuda">{ayuda}</span>}
    </div>
  )
}

const siNo = v => (v ? <span className="xd-si">Sí</span> : <span className="xd-no">No</span>)

const SUBTIPO_VACIO = {
  tipoId: '', nombre: '', persona: '', codigoErp: '', varios: false, visibleColab: true, editableColab: true,
  notificaRegistro: false, notificaVencer: false, vence: false, vigenciaMeses: null, formatos: ['pdf', 'jpg', 'png'],
  tamanoMaxMB: 10, sensibilidad: 'restringido', hitos: null, destinatarios: null, activo: true,
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
  if (propios && !hitosLimpios.length) errores.push('Escriba al menos un hito propio, o use los generales.')

  const guardar = () => {
    setIntento(true)
    if (errores.length) return
    onGuardar({
      ...s,
      nombre: s.nombre.trim(),
      persona: s.persona.trim() || s.nombre.trim(),
      vigenciaMeses: s.vence ? Number(s.vigenciaMeses) : null,
      notificaVencer: s.vence ? s.notificaVencer : false,
      tamanoMaxMB: Number(s.tamanoMaxMB) || 10,
      hitos: propios ? [...new Set(hitosLimpios)].sort((a, b) => b - a).slice(0, 3) : null,
      destinatarios: s.destinatarios?.length ? s.destinatarios : null,
    })
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
        <label className="pl-label">Tipo
          <Desplegable valor={s.tipoId} onCambio={v => set('tipoId', v)} ariaLabel="Tipo" opciones={tipos.filter(t => t.activo || t.id === s.tipoId).map(t => ({ valor: t.id, etiqueta: t.nombre }))} />
        </label>
        <label className="pl-label">Código ERP
          <input className="pl-input" value={s.codigoErp} onChange={e => set('codigoErp', e.target.value)} placeholder="DP-07" />
        </label>
        <label className="pl-label">Nombre
          <input className="pl-input" value={s.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Carnet de sanidad" />
        </label>
        <label className="pl-label">Nombre para el colaborador
          <input className="pl-input" value={s.persona} onChange={e => set('persona', e.target.value)} placeholder="Su carnet de sanidad" />
          <span className="xd-ayuda">Lo que lee el colaborador en la app. En lenguaje de persona, no de sistema.</span>
        </label>

        <div className="xd-grupo xd-ancho">
          <p className="xd-grupo-tit">Comportamiento</p>
          <div className="xd-binarios">
            <SiNo label="¿Admite varios documentos?" valor={s.varios} onCambio={v => set('varios', v)} ayuda="El carnet es uno; el historial de vacunas son muchos." />
            <SiNo label="¿Visible para el colaborador?" valor={s.visibleColab} onCambio={v => set('visibleColab', v)} />
            <SiNo label="¿Lo puede subir el colaborador?" valor={s.editableColab} onCambio={v => set('editableColab', v)} ayuda="Lo que sube entra en revisión hasta que RR.HH. lo aprueba." />
            <SiNo label="¿Notifica al registrar o editar?" valor={s.notificaRegistro} onCambio={v => set('notificaRegistro', v)} />
          </div>
        </div>

        <div className="xd-grupo xd-ancho">
          <p className="xd-grupo-tit">Vigencia y avisos</p>
          <div className="xd-binarios">
            <SiNo label="¿Vence?" valor={s.vence} onCambio={v => { set('vence', v); if (v) set('notificaVencer', true) }} />
            {s.vence && (
              <label className="pl-label">Vigencia por defecto (meses)
                <input className="pl-input xd-num" inputMode="numeric" value={s.vigenciaMeses ?? ''} onChange={e => set('vigenciaMeses', e.target.value.replace(/\D/g, ''))} placeholder="12" />
                <span className="xd-ayuda">Con esto se propone la fecha de vencimiento al cargarlo.</span>
              </label>
            )}
            {s.vence && <SiNo label="¿Avisa antes de vencer?" valor={s.notificaVencer} onCambio={v => set('notificaVencer', v)} />}
          </div>
          {s.vence && s.notificaVencer && (
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
        </div>

        <div className="xd-grupo xd-ancho">
          <p className="xd-grupo-tit">Archivo y sensibilidad</p>
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
          <div className="xd-binarios">
            <label className="pl-label">Tamaño máximo (MB)
              <input className="pl-input xd-num" inputMode="numeric" value={s.tamanoMaxMB} onChange={e => set('tamanoMaxMB', e.target.value.replace(/\D/g, ''))} />
            </label>
            <label className="pl-label">Sensibilidad
              <Desplegable valor={s.sensibilidad} onCambio={v => set('sensibilidad', v)} ariaLabel="Sensibilidad" opciones={Object.entries(SENSIBILIDAD).map(([k, v]) => ({ valor: k, etiqueta: v.label }))} />
              <span className="xd-ayuda">{SENSIBILIDAD[s.sensibilidad]?.desc}. Se declara acá y no documento por documento (5.3).</span>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function TiposSubtipos() {
  const { tipos, subtipos, documentos, parametros, setTipos, setSubtipos, setConjuntos, anotarConfig } = useDocumentacion()
  const [filtroTipo, setFiltroTipo] = useState('')
  const [editando, setEditando] = useState(null)
  const [tipoModal, setTipoModal] = useState(null)
  const [bloqueo, setBloqueo] = useState(null)
  const [borrar, setBorrar] = useState(null)

  const docsDe = id => documentos.filter(d => d.subtipoId === id).length
  const subDe = id => subtipos.filter(s => s.tipoId === id)
  const tipoNom = id => tipos.find(t => t.id === id)?.nombre || '—'
  const visibles = subtipos.filter(s => !filtroTipo || s.tipoId === filtroTipo)

  const guardarSubtipo = s => {
    if (s.id) {
      setSubtipos(prev => prev.map(x => (x.id === s.id ? s : x)))
      anotarConfig(`Editó el subtipo «${s.nombre}»`)
    } else {
      const nuevo = { ...s, id: `s-${Date.now().toString(36)}` }
      setSubtipos(prev => [...prev, nuevo])
      anotarConfig(`Creó el subtipo «${s.nombre}»`)
    }
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
    if (tipoModal.id) {
      setTipos(prev => prev.map(x => (x.id === tipoModal.id ? { ...x, nombre } : x)))
      anotarConfig(`Renombró el tipo «${tipoModal.original}» a «${nombre}»`)
    } else {
      setTipos(prev => [...prev, { id: `t-${Date.now().toString(36)}`, nombre, activo: true, retencionAnios: 5 }])
      anotarConfig(`Creó el tipo «${nombre}»`)
    }
    setTipoModal(null)
  }

  /* RF-08: NADA CON HISTORIA SE ELIMINA. El botón no se apaga en silencio: al pulsarlo explica por
     qué no, con el conteo, y ofrece lo que sí se puede hacer, que es desactivar. */
  const intentarBorrar = s => {
    const n = docsDe(s.id)
    if (n > 0) setBloqueo({ s, n })
    else setBorrar(s)
  }

  return (
    <div className="content-scroll">
      <Cabecera titulo="Tipos y subtipos" sub="La taxonomía de documentos. El tipo agrupa; en el subtipo se configura todo lo demás.">
        <button type="button" className="dc-btn" onClick={() => setTipoModal({ nombre: '' })}><Plus size={14} /> Nuevo tipo</button>
        <button type="button" className="pl-btn-new" onClick={() => setEditando({ ...SUBTIPO_VACIO, tipoId: filtroTipo || '' })}><Plus size={14} color="#00E091" /> Nuevo subtipo</button>
      </Cabecera>

      <section className="dc-tarjeta">
        <div className="dc-tarjeta-cab"><h2>Tipos de documento</h2><span className="xd-nota">Un tipo desactivado no aparece al cargar; lo ya cargado sigue visible.</span></div>
        <div className="dc-tarjeta-cuerpo xd-tipos">
          {tipos.map(t => {
            const n = subDe(t.id).length
            return (
              <span key={t.id} className={`xd-tipo${t.activo ? '' : ' inactivo'}`}>
                <b style={{ fontWeight: 600 }}>{t.nombre}</b>
                <span className="xd-tipo-n">{n} {n === 1 ? 'subtipo' : 'subtipos'}{t.activo ? '' : ' · inactivo'}</span>
                <button type="button" aria-label={`Renombrar ${t.nombre}`} title="Renombrar" onClick={() => setTipoModal({ id: t.id, nombre: t.nombre, original: t.nombre })}><Pencil size={13} /></button>
                <button type="button" aria-label={`${t.activo ? 'Desactivar' : 'Activar'} ${t.nombre}`} title={t.activo ? 'Desactivar' : 'Activar'} onClick={() => alternarTipo(t)}><Power size={13} /></button>
              </span>
            )
          })}
        </div>
      </section>

      <div className="xd-fila">
        <div style={{ width: 240 }}>
          <Desplegable valor={filtroTipo} onCambio={setFiltroTipo} ariaLabel="Filtrar por tipo" opciones={[{ valor: '', etiqueta: 'Todos los tipos' }, ...tipos.map(t => ({ valor: t.id, etiqueta: t.nombre }))]} />
        </div>
        <span className="xd-nota">{visibles.length} subtipos · la tabla se desplaza a los costados</span>
      </div>

      <div className="as-table-wrap xd-scroll">
        {visibles.length === 0 ? (
          <Vacio Icono={FileStack} titulo="Este tipo todavía no tiene subtipos" texto="El subtipo es el documento concreto —carnet de identidad, fiebre amarilla— y es donde se configura todo.">
            <button type="button" className="pl-btn-new" onClick={() => setEditando({ ...SUBTIPO_VACIO, tipoId: filtroTipo })}><Plus size={14} color="#00E091" /> Nuevo subtipo</button>
          </Vacio>
        ) : (
          <table className="as-table xd-tabla">
            <thead>
              <tr>
                <th>Subtipo</th><th>Tipo</th><th>Cód. ERP</th><th>¿Varios?</th><th>¿Visible colab.?</th><th>¿Sube colab.?</th>
                <th>¿Notifica registro?</th><th>¿Notifica vencer?</th><th>Vigencia</th><th>Formatos</th><th>Máx.</th>
                <th>Sensibilidad</th><th>Hitos</th><th>Avisa a</th><th>Estado</th><th><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map(s => (
                <tr key={s.id} style={s.activo ? undefined : { opacity: 0.6 }}>
                  <td><span className="xd-nomsub"><b>{s.nombre}</b><span>{s.persona}</span></span></td>
                  <td>{tipoNom(s.tipoId)}</td>
                  <td>{s.codigoErp || <span className="xd-no">—</span>}</td>
                  <td>{siNo(s.varios)}</td>
                  <td>{siNo(s.visibleColab)}</td>
                  <td>{siNo(s.editableColab)}</td>
                  <td>{siNo(s.notificaRegistro)}</td>
                  <td>{siNo(s.notificaVencer)}</td>
                  <td>{s.vence ? `${s.vigenciaMeses || '¿?'} meses` : <span className="xd-no">No vence</span>}</td>
                  <td>{s.formatos.map(f => f.toUpperCase()).join(', ')}</td>
                  <td>{s.tamanoMaxMB} MB</td>
                  <td><Etiqueta tono={s.sensibilidad === 'confidencial' ? 'violeta' : s.sensibilidad === 'restringido' ? 'azul' : 'gris'}>{SENSIBILIDAD[s.sensibilidad]?.label}</Etiqueta></td>
                  <td>{s.vence && s.notificaVencer ? (s.hitos?.length ? `${s.hitos.join(' / ')} d` : <span className="xd-no">Generales</span>) : <span className="xd-no">—</span>}</td>
                  <td>{s.vence && s.notificaVencer ? (s.destinatarios?.length ? s.destinatarios.map(d => DESTINATARIOS[d]).join(', ') : <span className="xd-no">Generales</span>) : <span className="xd-no">—</span>}</td>
                  <td>{s.activo ? <Etiqueta tono="verde">Activo</Etiqueta> : <Etiqueta tono="gris">Inactivo</Etiqueta>}</td>
                  <td>
                    <div className="xd-acc">
                      <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={() => setEditando({ ...SUBTIPO_VACIO, ...s })}><Pencil size={13} /> Editar</button>
                      <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={() => alternarSubtipo(s)}><Power size={13} /> {s.activo ? 'Desactivar' : 'Activar'}</button>
                      <button
                        type="button"
                        className="dc-btn dc-btn-sm dc-btn-texto dc-btn-peligro"
                        aria-label={docsDe(s.id) > 0 ? `Eliminar ${s.nombre}: no disponible, tiene ${docsDe(s.id)} documentos` : `Eliminar ${s.nombre}`}
                        style={docsDe(s.id) > 0 ? { opacity: 0.55 } : undefined}
                        title={docsDe(s.id) > 0 ? `No se puede eliminar: tiene ${docsDe(s.id)} documentos` : 'Eliminar'}
                        onClick={() => intentarBorrar(s)}
                      >
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editando && <ModalSubtipo inicial={editando} tipos={tipos} parametros={parametros} onGuardar={guardarSubtipo} onCerrar={() => setEditando(null)} />}

      {tipoModal && (
        <Modal
          titulo={tipoModal.id ? 'Renombrar tipo' : 'Nuevo tipo'}
          Icono={FileStack}
          onCerrar={() => setTipoModal(null)}
          ancho={440}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setTipoModal(null)}>Cancelar</button>
            <button type="button" className="pl-btn-save" disabled={!tipoModal.nombre.trim()} onClick={guardarTipo}>{tipoModal.id ? 'Guardar' : 'Crear tipo'}</button>
          </>}
        >
          <label className="pl-label" style={{ fontSize: 13 }}>Nombre del tipo
            <input className="pl-input" autoFocus value={tipoModal.nombre} onChange={e => setTipoModal({ ...tipoModal, nombre: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') guardarTipo() }} placeholder="Documentos personales" />
          </label>
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
            <button type="button" className="pl-btn-save" style={{ background: 'var(--dc-rojo)' }} onClick={() => { setSubtipos(prev => prev.filter(x => x.id !== borrar.id)); setConjuntos(prev => prev.map(c => ({ ...c, requisitos: c.requisitos.filter(r => r.subtipoId !== borrar.id) }))); anotarConfig(`Eliminó el subtipo «${borrar.nombre}», sin documentos`); setBorrar(null) }}>Eliminar</button>
          </>}
        >
          <p className="xd-nota">«<b>{borrar.nombre}</b>» no tiene documentos cargados, así que se puede eliminar. Si algún conjunto de requisitos lo pide, ese requisito se quita del conjunto.</p>
        </Modal>
      )}
    </div>
  )
}
