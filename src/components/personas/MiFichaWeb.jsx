import { useState } from 'react'
import {
  User, Briefcase, FileText, Monitor, GraduationCap, Info, Lock, Pencil, Eye, EyeOff, Download,
  AlertTriangle, Gift, Sparkles, Check, X, Send, Clock, Image, ChevronRight, ChevronLeft, Settings,
} from 'lucide-react'
import {
  pestanasCon, partesDe, documentosDe, camposEditables, agrupar, lineas, titularDe,
  resumenDe, porRenovar, seccionesEditables,
} from '../../data/miFichaLectura'
import HojaDocumento from './HojaDocumento'

/* «MI FICHA» EN LA WEB, IGUAL QUE EN EL TELÉFONO: una lista con las secciones de la ficha, y cada
   una se abre en su propia pantalla con «Volver a Mi perfil». Se lee y no se edita: lo que el
   colaborador mantiene al día lo cambia en Configuración › Mis datos personales (`EditarMisDatos`).
   Lo que se enseña y cómo se lee sale de `miFichaLectura`, el mismo módulo que usa el teléfono. */

const ICONOS = { personal: User, laboral: Briefcase, perfil: GraduationCap, documentos: FileText, recursos: Monitor }
const ESTADO = {
  vigente: { t: 'Vigente', cls: 'mf-est vig' },
  'por-vencer': { t: 'Por vencer', cls: 'mf-est por' },
  vencido: { t: 'Vencido', cls: 'mf-est ven' },
}

function Guardado() {
  return <span className="mf-guardado"><Check size={13} /> Cambios guardados</span>
}

/* «Cambios guardados» se ve un par de segundos después de guardar y se va solo. */
function useAvisoGuardado() {
  const [visto, setVisto] = useState(false)
  const avisar = () => { setVisto(true); setTimeout(() => setVisto(false), 2200) }
  return [visto, avisar]
}

/* Un campo en edición: lista y sí/no con sus opciones, el resto a texto libre. */
function Entrada({ campo, valor, onCambiar }) {
  if (campo.tipo === 'siNo' || campo.tipo === 'lista') {
    const ops = campo.tipo === 'siNo'
      ? [{ v: 'si', t: 'Sí' }, { v: 'no', t: 'No' }]
      : (campo.opciones || []).map(o => (typeof o === 'string' ? { v: o, t: o } : { v: o.valor, t: o.etiqueta ?? o.valor }))
    return (
      <select value={valor} onChange={e => onCambiar(e.target.value)}>
        <option value="">Elegir…</option>
        {ops.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
      </select>
    )
  }
  return <input value={valor} onChange={e => onCambiar(e.target.value)} />
}

/* Los datos de una sección, como se leen en las dos pantallas. */
function Datos({ s, ver }) {
  if (s.vacia) return <p className="mf-nota" style={{ fontStyle: 'italic' }}>Sin datos registrados.</p>
  return s.bloques.map((b, i) => (
    <div key={i}>
      {b.titulo && <p className="mf-bloque">{b.titulo}</p>}
      <dl className="mf-datos">
        {b.datos.map(d => (
          <div key={d.key}>
            <dt>{d.label}</dt>
            <dd>{d.reservado && !ver ? '••••••' : d.valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  ))
}

/* Una sección de Mi ficha: sólo para mirar. Los montos reservados se destapan a pedido. */
function Tarjeta({ s }) {
  const [ver, setVer] = useState(false)
  return (
    <section className={`mf-tarjeta${s.vacia ? ' vacia' : ''}`}>
      <header className="mf-tarjeta-cab">
        <h4>{s.titulo}</h4>
        {s.privada && <span className="mf-privada"><Lock size={12} /> Solo usted y RR.HH.</span>}
        {s.reservada && (
          <button type="button" className="mf-mini gris" onClick={() => setVer(v => !v)}>
            {ver ? <EyeOff size={12} /> : <Eye size={12} />} {ver ? 'Ocultar montos' : 'Mostrar montos'}
          </button>
        )}
      </header>
      {s.vacia
        ? <p className="mf-nota" style={{ fontStyle: 'italic' }}>Sin asignaciones en esta categoría.</p>
        : <Datos s={s} ver={ver} />}
    </section>
  )
}

/* Una sección que el colaborador mantiene al día, en Configuración › Mis datos personales. */
function TarjetaEditable({ s, form, onGuardar }) {
  const [valores, setValores] = useState(null)
  const [guardado, avisar] = useAvisoGuardado()
  const editables = camposEditables(s)

  if (valores) {
    return (
      <section className="mf-tarjeta editando">
        <header className="mf-tarjeta-cab"><h4>{s.titulo}</h4></header>
        <div className="mf-form">
          {editables.map(c => c.tipo === 'rotulo'
            ? <p key={c.key} className="mf-bloque">{c.label}</p>
            : (
              <label key={c.key}>
                <span>{c.label}</span>
                <Entrada campo={c} valor={valores[c.key]} onCambiar={v => setValores(x => ({ ...x, [c.key]: v }))} />
              </label>
            ))}
        </div>
        <div className="mf-acciones">
          <button type="button" className="mf-btn" onClick={() => setValores(null)}>Cancelar</button>
          <button type="button" className="mf-btn primario" onClick={() => { onGuardar(valores); setValores(null); avisar() }}>Guardar</button>
        </div>
      </section>
    )
  }

  return (
    <section className="mf-tarjeta">
      <header className="mf-tarjeta-cab">
        <h4>{s.titulo}</h4>
        {guardado && <Guardado />}
        <button type="button" className="mf-mini" onClick={() => setValores(Object.fromEntries(editables.filter(c => c.tipo !== 'rotulo').map(c => [c.key, form[c.key] ?? ''])))}>
          <Pencil size={12} /> Editar
        </button>
      </header>
      <Datos s={s} ver />
    </section>
  )
}

/* ── SOLICITAR LA CORRECCIÓN DE UN DATO ─────────────────────────────────────
   Se elige la sección y el dato de la pestaña abierta, se ve lo registrado y se escribe el valor
   correcto. RR.HH. recibe el pedido; el dato no cambia hasta que lo atienda. */
function Correccion({ pestana, form, onEnviar, onCerrar }) {
  const secciones = partesDe(pestana, form).flatMap(p => p.secciones).filter(s => !s.vacia)
  const [seccionId, setSeccionId] = useState('')
  const [datoKey, setDatoKey] = useState('')
  const [correcto, setCorrecto] = useState('')
  const [comentario, setComentario] = useState('')
  const [enviada, setEnviada] = useState(false)
  const seccion = secciones.find(s => s.id === seccionId)
  const datos = seccion ? seccion.bloques.flatMap(b => b.datos.map(d => ({ ...d, nombre: b.titulo ? `${d.label} (${b.titulo})` : d.label }))) : []
  const dato = datos.find(d => d.key === datoKey)
  const listo = dato && correcto.trim()

  return (
    <div className="mf-velo" onClick={onCerrar}>
      <div className="mf-modal" role="dialog" aria-modal="true" aria-labelledby="mf-corr-tit" onClick={e => e.stopPropagation()}>
        <button type="button" className="mf-cerrar" aria-label="Cerrar" onClick={onCerrar}><X size={18} /></button>
        {enviada ? (
          <div className="mf-enviada">
            <span className="mf-enviada-ico"><Check size={24} /></span>
            <h3 id="mf-corr-tit">Solicitud enviada</h3>
            <p>RR.HH. revisará su pedido para corregir «{dato.label}». El dato se actualizará cuando lo apruebe.</p>
            <button type="button" className="mf-btn primario" onClick={onCerrar}>Volver a mi ficha</button>
          </div>
        ) : (
          <>
            <h3 id="mf-corr-tit">Solicitar corrección</h3>
            <p className="mf-nota">Indique qué dato está mal y cuál es el correcto. RR.HH. lo revisará y lo actualizará.</p>
            <div className="mf-form" style={{ marginTop: 14 }}>
              <label>
                <span>Sección</span>
                <select value={seccionId} onChange={e => { setSeccionId(e.target.value); setDatoKey('') }}>
                  <option value="">Elija la sección…</option>
                  {secciones.map(s => <option key={s.id} value={s.id}>{s.titulo}</option>)}
                </select>
              </label>
              <label>
                <span>Dato a corregir</span>
                <select value={datoKey} onChange={e => setDatoKey(e.target.value)} disabled={!seccion}>
                  <option value="">Elija el dato…</option>
                  {datos.map(d => <option key={d.key} value={d.key}>{d.nombre}</option>)}
                </select>
              </label>
              {dato && (
                <div className="mf-registrado">
                  <span>Registrado actualmente</span>
                  <strong>{dato.reservado ? '••••••' : dato.valor}</strong>
                </div>
              )}
              <label>
                <span>¿Cuál es el dato correcto?</span>
                <input value={correcto} onChange={e => setCorrecto(e.target.value)} placeholder="Escriba el dato correcto" />
              </label>
              <label>
                <span>Comentario (opcional)</span>
                <textarea rows={3} value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Ej.: Adjuntaré la copia del documento en Zona HR" />
              </label>
            </div>
            <div className="mf-acciones">
              <button type="button" className="mf-btn" onClick={onCerrar}>Cancelar</button>
              <button type="button" className="mf-btn primario" disabled={!listo} onClick={() => {
                onEnviar({ seccion: seccion.titulo, dato: dato.nombre, registrado: dato.valor, correcto: correcto.trim(), comentario: comentario.trim() })
                setEnviada(true)
              }}><Send size={14} /> Enviar a RR.HH.</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Solicitudes({ lista }) {
  if (!lista.length) return null
  return (
    <div className="mf-grupo">
      <h4 className="mf-grupo-tit">Mis solicitudes de corrección</h4>
      <div className="mf-lista">
        {lista.map(x => (
          <div key={x.id} className="mf-item">
            <span className="mf-item-txt">
              <strong>{x.dato}</strong>
              <span>{x.seccion} · Correcto: <b>{x.correcto}</b>{x.comentario ? ` · «${x.comentario}»` : ''}</span>
            </span>
            <span className="mf-est pend"><Clock size={12} /> {x.estado}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const esImagen = d => /\.(jpe?g|png|webp)$/i.test(d.archivo)

/* ── VER UN DOCUMENTO ──────────────────────────────────────────────────────
   La hoja a la izquierda y lo que se sabe de ella a la derecha, con la descarga a mano. */
function Visor({ doc, titular, onCerrar }) {
  const e = ESTADO[doc.estado]
  return (
    <div className="mf-velo" onClick={onCerrar}>
      <div className="mf-modal mf-visor" role="dialog" aria-modal="true" aria-labelledby="mf-visor-tit" onClick={ev => ev.stopPropagation()}>
        <button type="button" className="mf-cerrar" aria-label="Cerrar" onClick={onCerrar}><X size={18} /></button>
        <div className="mf-visor-hoja"><HojaDocumento doc={doc} titular={titular} /></div>
        <aside className="mf-visor-datos">
          <p className="mf-grupo-tit">{doc.grupo}</p>
          <h3 id="mf-visor-tit">{doc.nombre}</h3>
          <dl className="mf-datos">
            <div><dt>Archivo</dt><dd>{doc.archivo}</dd></div>
            {doc.emite && <div><dt>Fecha de emisión</dt><dd>{doc.emite}</dd></div>}
            {doc.vence && <div><dt>Fecha de vencimiento</dt><dd>{doc.vence}</dd></div>}
            {e && <div><dt>Estado</dt><dd><span className={e.cls}>{e.t}</span></dd></div>}
          </dl>
          <button type="button" className="mf-btn primario" style={{ marginTop: 16 }}><Download size={14} /> Descargar</button>
        </aside>
      </div>
    </div>
  )
}

function Documentos({ form }) {
  const [viendo, setViendo] = useState(null)
  const docs = documentosDe(form)
  const renovar = docs.filter(d => d.estado === 'por-vencer' || d.estado === 'vencido')
  return (
    <>
      {renovar.map(d => (
        <div key={d.key} className={`mf-aviso${d.estado === 'vencido' ? ' rojo' : ''}`}>
          <AlertTriangle size={15} />
          <span><b>{d.nombre.split(' · ').pop()}</b> {d.estado === 'vencido' ? 'venció' : 'vence'} el {d.vence}. Renuévelo y envíe la copia a RR.HH.</span>
        </div>
      ))}
      {agrupar(docs, 'grupo').map(g => (
        <div key={g.titulo} className="mf-grupo">
          <h4 className="mf-grupo-tit">{g.titulo}</h4>
          <div className="mf-lista">
            {g.items.map(d => {
              const e = ESTADO[d.estado]
              return (
                <div key={d.key} className="mf-item">
                  {/* La fila entera abre la vista previa; la descarga va aparte, a la derecha. */}
                  <button type="button" className="mf-item-abrir" onClick={() => setViendo(d)}>
                  <span className="mf-item-ico">{esImagen(d) ? <Image size={16} /> : <FileText size={16} />}</span>
                  <span className="mf-item-txt">
                    <strong>{d.nombre}</strong>
                    <span>
                      {d.archivo}
                      {d.emite && ` · Emitido ${d.emite}`}
                      {d.vence && ` · Vence ${d.vence}`}
                      {e && <span className={e.cls}>{e.t}</span>}
                    </span>
                  </span>
                  </button>
                  <button type="button" className="mf-ver" onClick={() => setViendo(d)}><Eye size={15} /> Ver</button>
                  <button type="button" className="mf-descargar" aria-label={`Descargar ${d.nombre}`}><Download size={16} /></button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      <p className="mf-nota">Los documentos los sube RR.HH. Si necesita agregar uno, envíelo desde Zona HR.</p>
      {viendo && <Visor doc={viendo} titular={titularDe(form)} onCerrar={() => setViendo(null)} />}
    </>
  )
}

/* ── MI FICHA EN «MI PERFIL»: LA LISTA ────────────────────────────────────
   Una fila por sección, con lo que tiene dentro dicho en una línea. El punto naranja avisa que
   hay un documento por renovar, igual que en el teléfono. */
export default function MiFichaWeb({ ficha, onAbrir }) {
  const form = ficha.form
  const renovar = porRenovar(form).length > 0
  return (
    <div className="mf">
      <div className="mf-cab">
        <div>
          <h2>Mi ficha</h2>
          <p>Revise sus datos registrados por RR.HH.</p>
        </div>
        <span className="mf-fecha">Actualizada {ficha.actualizada}</span>
      </div>
      <div className="mf-filas">
        {pestanasCon(form).map(p => {
          const I = ICONOS[p.key] || FileText
          return (
            <button key={p.key} type="button" className="mf-fila" onClick={() => onAbrir(p.key)}>
              <span className="mf-fila-ico"><I size={18} /></span>
              <span className="mf-fila-txt">
                <strong>{p.titulo}</strong>
                <span>{resumenDe(form, p.key)}</span>
              </span>
              {p.key === 'documentos' && renovar && <span className="mf-punto" aria-label="Hay documentos por renovar" />}
              <ChevronRight size={18} className="mf-fila-flecha" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* El «volver» de las pantallas que se abren desde Mi perfil. */
export function Volver({ texto, onVolver }) {
  return (
    <button type="button" className="mf-volver" onClick={onVolver}>
      <span><ChevronLeft size={16} /></span> {texto}
    </button>
  )
}

/* ── UNA SECCIÓN DE MI FICHA, EN SU PROPIA PANTALLA ───────────────────────── */
export function SeccionMiFicha({ ficha, pestana, solicitudes, onSolicitar }) {
  const form = ficha.form
  const [corrigiendo, setCorrigiendo] = useState(false)
  if (pestana === 'documentos') return <div className="mf-cuerpo"><Documentos form={form} /></div>
  const partes = partesDe(pestana, form)
  const titulos = new Set(partes.flatMap(p => p.secciones.map(s => s.titulo)))
  return (
    <div className="mf-cuerpo">
      <div className="mf-info">
        <Info size={15} />
        <span>{pestana === 'recursos'
          ? 'Lo que la empresa le entregó para trabajar. Si algo no coincide, solicite su corrección.'
          : 'Estos datos los registró RR.HH. Si alguno no es correcto, solicite su corrección.'}</span>
      </div>
      {partes.map(parte => (
        <div key={parte.key} className="mf-parte">
          {parte.titulo && <h3>{parte.titulo}</h3>}
          <div className="mf-rejilla">
            {parte.secciones.map(s => <Tarjeta key={s.id} s={s} />)}
          </div>
        </div>
      ))}
      <div className="mf-pie">
        <Info size={15} />
        <span>¿Algún dato no es correcto?</span>
        <button type="button" className="mf-corregir" onClick={() => setCorrigiendo(true)}>Solicitar corrección</button>
      </div>
      <Solicitudes lista={solicitudes.filter(x => titulos.has(x.seccion))} />
      {corrigiendo && <Correccion pestana={pestana} form={form} onEnviar={onSolicitar} onCerrar={() => setCorrigiendo(false)} />}
    </div>
  )
}

/* ── CONFIGURACIÓN › MIS DATOS PERSONALES ─────────────────────────────────
   Lo único que el colaborador cambia por su cuenta: su contacto, sus contactos de emergencia y
   sus preferencias. Se guarda al momento y Mi ficha lo muestra en seguida. */
export function EditarMisDatos({ ficha, onGuardar }) {
  return (
    <div className="mf-cuerpo">
      <div className="mf-info">
        <Info size={15} />
        <span>Mantenga al día estos datos. El resto de su ficha lo registra RR.HH.; si algo no es correcto, solicite su corrección desde Mi ficha.</span>
      </div>
      <div className="mf-rejilla">
        {seccionesEditables(ficha.form).map(s => <TarjetaEditable key={s.id} s={s} form={ficha.form} onGuardar={onGuardar} />)}
      </div>
      <PreferenciasEditables ficha={ficha} onGuardar={onGuardar} />
    </div>
  )
}

function ListaEditable({ lista, setLista, placeholder }) {
  const [nuevo, setNuevo] = useState('')
  const agregar = () => {
    const t = nuevo.trim()
    if (t && !lista.includes(t)) setLista([...lista, t])
    setNuevo('')
  }
  return (
    <>
      <div className="mf-chips">
        {lista.map(x => (
          <span key={x} className="con-x">
            {x}
            <button type="button" aria-label={`Quitar ${x}`} onClick={() => setLista(lista.filter(y => y !== x))}><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="mf-agregar">
        <input value={nuevo} placeholder={placeholder} onChange={e => setNuevo(e.target.value)} onKeyDown={e => e.key === 'Enter' && agregar()} />
        <button type="button" className="mf-btn" onClick={agregar}>Agregar</button>
      </div>
    </>
  )
}

const GRUPOS_PREF = [
  ['regalos', Gift, 'Regalos que le gustaría recibir', 'Sin regalos agregados', 'Ej.: Un libro'],
  ['experiencias', Sparkles, 'Experiencias que le gustaría vivir', 'Sin experiencias agregadas', 'Ej.: Un viaje'],
]
const prefDe = form => ({ regalos: lineas(form['ra.f1']), experiencias: lineas(form['ra.f4']) })

/* Regalos y experiencias en Mi perfil: para mirar. Se cambian en Configuración. */
export function Preferencias({ ficha, onEditar }) {
  const actual = prefDe(ficha.form)
  return (
    <div className="mf-pref">
      {GRUPOS_PREF.map(([k, I, t, vacio]) => (
        <div key={k} style={{ width: '100%' }}>
          <h2 className="mf-pref-tit"><I size={18} /> {t}</h2>
          {actual[k].length
            ? <div className="mf-chips">{actual[k].map(x => <span key={x}>{x}</span>)}</div>
            : <p className="mf-nota" style={{ fontStyle: 'italic' }}>{vacio}</p>}
        </div>
      ))}
      <button type="button" className="mf-editar-pref" onClick={onEditar}>
        <Settings size={14} /> Editar en Configuración
      </button>
    </div>
  )
}

/* Regalos y experiencias en edición: los dos se editan juntos y se guardan juntos, como las
   tablitas de Preferencias en la ficha de RR.HH. (una por línea). */
function PreferenciasEditables({ ficha, onGuardar }) {
  const [edicion, setEdicion] = useState(null)
  const [guardado, avisar] = useAvisoGuardado()
  const actual = prefDe(ficha.form)
  const grupos = GRUPOS_PREF
  return (
    <div className={`mf-pref${edicion ? ' editando' : ''}`}>
      {grupos.map(([k, I, t, vacio, ej]) => (
        <div key={k} style={{ width: '100%' }}>
          <h2 className="mf-pref-tit"><I size={18} /> {t}</h2>
          {edicion
            ? <ListaEditable lista={edicion[k]} setLista={l => setEdicion(e => ({ ...e, [k]: l }))} placeholder={ej} />
            : actual[k].length
              ? <div className="mf-chips">{actual[k].map(x => <span key={x}>{x}</span>)}</div>
              : <p className="mf-nota" style={{ fontStyle: 'italic' }}>{vacio}</p>}
        </div>
      ))}
      {edicion ? (
        <div className="mf-acciones" style={{ width: '100%' }}>
          <button type="button" className="mf-btn" onClick={() => setEdicion(null)}>Cancelar</button>
          <button type="button" className="mf-btn primario" onClick={() => {
            onGuardar({ 'ra.f1': edicion.regalos.join('\n'), 'ra.f4': edicion.experiencias.join('\n') })
            setEdicion(null); avisar()
          }}>Guardar</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="mf-editar-pref" onClick={() => setEdicion(actual)}>Editar preferencias</button>
          {guardado && <Guardado />}
        </div>
      )}
    </div>
  )
}
