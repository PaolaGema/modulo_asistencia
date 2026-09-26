import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Braces, CircleCheck, Copy, Eye, FileText, History, Lock, Save, Send, TriangleAlert, Upload } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { CATEGORIAS, VARIABLES, CLAVES_VARIABLES, datosPara, dias, fechaCorta, rellenar, validarPlantilla } from '../../data/documentacionData'
import { Cabecera, Etiqueta, Modal, Vacio } from '../../components/documentacion/comunes'
import Desplegable from '../../components/layout/Desplegable'
import HojaDocumento from './HojaDocumento'
import { CIRCUITOS, contratoVigenteDe, ultimaVersion, versionPublicada } from './emisionUtil'
import './emision.css'

/* ── EL EDITOR DE PLANTILLA (pantalla 10 · RF-44 a RF-48) ─────────────────
   La respuesta a la duda de la reunión del 11 de agosto: la plantilla es texto fijo con huecos
   declarados, y lo que ve el colaborador es el resultado de rellenarlos. Por eso esta pantalla
   hace tres cosas juntas —o no sirve ninguna—: las variables se ELIGEN de un catálogo (RF-44),
   el resultado se VE con una persona real antes de publicar (RF-45), y publicar VALIDA y bloquea
   si algo queda sin rellenar (RF-46).

   PUBLICAR CREA UNA VERSIÓN; no pisa la anterior (RF-47). Lo ya emitido guarda con qué versión
   salió, así que cambiar la plantilla hoy no altera ningún certificado de ayer. */

const nuevoId = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`

export default function EditorPlantilla() {
  const { id } = useParams()
  const { modelo: buscar } = useDocumentacion()
  const modelo = buscar(id)
  if (!modelo) {
    return (
      <div className="content-scroll">
        <Cabecera titulo="Modelo no encontrado" />
        <div className="dc-tarjeta">
          <Vacio Icono={FileText} titulo="Este modelo no existe" texto="Puede que se haya eliminado, o que el enlace esté incompleto.">
            <Link className="dc-btn" to="/documentos/configuracion/modelos">Volver a la biblioteca</Link>
          </Vacio>
        </div>
      </div>
    )
  }
  /* La clave remonta el editor al cambiar de modelo —por ejemplo, al duplicar desde acá—, así el
     borrador en pantalla nunca es el del modelo anterior. */
  return <Editor key={modelo.id} modelo={modelo} />
}

function Editor({ modelo }) {
  const { personas, contratos, parametros, empresa, setModelos, anotarConfig, usuario } = useDocumentacion()
  const navigate = useNavigate()
  const soloLectura = !!modelo.base
  const ultima = ultimaVersion(modelo)
  const publicada = versionPublicada(modelo)

  const [meta, setMeta] = useState({
    nombre: modelo.nombre, categoria: modelo.categoria, disponibleSolicitud: modelo.disponibleSolicitud,
    circuito: modelo.circuito, aprobador: modelo.aprobador || '', estado: modelo.estado,
  })
  const [texto, setTexto] = useState(ultima?.texto || '')
  const [vista, setVista] = useState('editar') // 'editar' | 'previa'
  const [errores, setErrores] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [bloque, setBloque] = useState(false)
  const [viendo, setViendo] = useState(null)
  const activos = personas.filter(p => p.status !== 'desvinculado')
  const [pruebaId, setPruebaId] = useState(String(activos[0]?.id || ''))
  const area = useRef(null)

  const persona = personas.find(p => String(p.id) === pruebaId)
  const datos = useMemo(
    () => (persona ? datosPara(persona, { empresa, contrato: contratoVigenteDe(persona.id, contratos, parametros) }) : {}),
    [persona, empresa, contratos, parametros],
  )
  const problemas = useMemo(() => validarPlantilla(texto, datos), [texto, datos])
  const cambiado = texto !== (ultima?.texto || '')
    || meta.nombre !== modelo.nombre || meta.categoria !== modelo.categoria || meta.disponibleSolicitud !== modelo.disponibleSolicitud
    || meta.circuito !== modelo.circuito || meta.aprobador !== (modelo.aprobador || '') || meta.estado !== modelo.estado

  /* INSERTAR EN EL CURSOR, no al final. Quien arma un certificado está parado en la frase donde
     falta el cargo; mandarle la variable al pie del documento es obligarlo a cortarla y pegarla. */
  function insertar(fragmento, envolver = null) {
    const el = area.current
    const ini = el ? el.selectionStart : texto.length
    const fin = el ? el.selectionEnd : texto.length
    const elegido = texto.slice(ini, fin)
    const pieza = envolver ? `${envolver[0]}${elegido || 'Texto que sólo aparece si hay dato'}${envolver[1]}` : fragmento
    const nuevo = texto.slice(0, ini) + pieza + texto.slice(fin)
    setTexto(nuevo)
    setErrores(null)
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      const pos = ini + pieza.length
      el.setSelectionRange(pos, pos)
    })
  }

  function cargarArchivo(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (/\.docx?$/i.test(f.name)) {
      setAviso({ tono: 'ambar', texto: 'La conversión de Word (.docx) llega en una próxima versión. Por ahora copie el texto del documento y péguelo aquí, o cárguelo como .txt.' })
      return
    }
    const r = new FileReader()
    r.onload = () => { setTexto(String(r.result || '')); setAviso({ tono: 'verde', texto: `Se cargó «${f.name}». Revise dónde van las variables antes de publicar.` }) }
    r.readAsText(f, 'utf-8')
  }

  const hoyISO = dias(0)
  function guardar(publicar) {
    if (publicar) {
      const errs = validarPlantilla(texto, datos)
      if (!texto.trim()) errs.unshift({ tipo: 'vacia', texto: 'La plantilla está vacía' })
      if (errs.length) { setErrores(errs); setVista('editar'); return }
    }
    const nombre = meta.nombre.trim() || modelo.nombre
    setModelos(prev => prev.map(m => {
      if (m.id !== modelo.id) return m
      const vs = [...m.versiones]
      const ult = vs[vs.length - 1]
      const version = { texto, estado: publicar ? 'publicada' : 'borrador', publicadaPor: usuario, fecha: hoyISO }
      /* El borrador es uno solo y va al final: guardar lo reescribe, publicar lo convierte en
         versión. Una versión publicada no se reescribe nunca. */
      if (ult?.estado === 'borrador') vs[vs.length - 1] = { ...ult, ...version }
      else if (publicar || texto !== ult?.texto) vs.push({ v: vs.length + 1, ...version })
      return { ...m, ...meta, nombre, versiones: vs }
    }))
    const v = ultima?.estado === 'borrador' ? ultima.v : (publicar || texto !== ultima?.texto ? (ultima?.v || 0) + 1 : ultima?.v)
    anotarConfig(publicar ? `Publicó la versión ${v} de «${nombre}»` : `Guardó cambios en «${nombre}»`)
    setErrores(null)
    setAviso({ tono: 'verde', texto: publicar ? `Se publicó la versión ${v}. Los documentos que se emitan desde ahora usan esta versión; los anteriores no cambian.` : 'Cambios guardados. El borrador no se usa para emitir hasta que se publique.' })
  }

  function duplicar() {
    const nid = nuevoId()
    setModelos(prev => [...prev, {
      ...modelo, id: nid, nombre: `${modelo.nombre} (copia)`, base: false, origenId: modelo.id,
      versiones: [{ v: 1, texto: (publicada || ultima)?.texto || '', estado: 'borrador', publicadaPor: usuario, fecha: hoyISO }],
    }])
    anotarConfig(`Duplicó el modelo «${modelo.nombre}»`)
    navigate(`/documentos/configuracion/modelos/${nid}`)
  }

  const setM = (k, v) => setMeta(prev => ({ ...prev, [k]: v }))

  return (
    <div className="content-scroll">
      <Link to="/documentos/configuracion/modelos" className="xc-volver"><ArrowLeft size={13} aria-hidden="true" /> Biblioteca de modelos</Link>
      <Cabecera
        titulo={modelo.nombre}
        sub={`${CATEGORIAS[modelo.categoria]?.label} · ${publicada ? `versión ${publicada.v} publicada el ${fechaCorta(publicada.fecha)}` : 'sin plantilla publicada'}`}
      >
        {soloLectura ? (
          <button type="button" className="pl-btn-new" onClick={duplicar}><Copy size={14} color="#00E091" /> Duplicar para adaptar</button>
        ) : (
          <>
            <button type="button" className="dc-btn" onClick={() => guardar(false)} disabled={!cambiado}><Save size={13} aria-hidden="true" /> Guardar borrador</button>
            <button type="button" className="pl-btn-new" onClick={() => guardar(true)}><Send size={14} color="#00E091" /> Publicar versión</button>
          </>
        )}
      </Cabecera>

      {soloLectura && (
        <div className="xc-aviso xc-aviso-azul">
          <Lock size={15} aria-hidden="true" />
          <p><b>Modelo de fábrica.</b> No se edita para que siga igual para todas las empresas (RF-50). Duplíquelo y adapte la copia: la copia es suya y puede cambiarla cuanto quiera.</p>
        </div>
      )}
      {aviso && (
        <div className={`xc-aviso xc-aviso-${aviso.tono}`} role="status">
          {aviso.tono === 'verde' ? <CircleCheck size={15} aria-hidden="true" /> : <TriangleAlert size={15} aria-hidden="true" />}
          <p>{aviso.texto}</p>
        </div>
      )}
      {errores && (
        <div className="xc-aviso xc-aviso-rojo" role="alert">
          <TriangleAlert size={15} aria-hidden="true" />
          <div className="xc-aviso-cuerpo">
            <b>No se publicó: {errores.length === 1 ? 'hay un problema' : `hay ${errores.length} problemas`} en la plantilla.</b>
            <ul>{errores.map((e, i) => <li key={i}>{e.texto}</li>)}</ul>
            <p>En la vista previa, lo que no se pudo rellenar aparece marcado en su lugar.</p>
          </div>
        </div>
      )}

      <div className="xc-editor">
        <div className="xc-col">
          <section className="dc-tarjeta">
            <div className="dc-tarjeta-cab"><h2>Datos del modelo</h2></div>
            <div className="dc-tarjeta-cuerpo">
              <fieldset disabled={soloLectura} style={{ border: 'none', margin: 0, padding: 0 }}>
                <div className="xc-campos">
                  <label className="pl-label xc-campo-ancho" htmlFor="xc-ed-nombre">
                    Nombre
                    <input id="xc-ed-nombre" className="pl-input" value={meta.nombre} onChange={e => setM('nombre', e.target.value)} />
                  </label>
                  <div className="pl-label">
                    Categoría
                    <Desplegable valor={meta.categoria} onCambio={v => setM('categoria', v)} ariaLabel="Categoría" opciones={Object.entries(CATEGORIAS).map(([k, c]) => ({ valor: k, etiqueta: c.label }))} />
                  </div>
                  <div className="pl-label">
                    Estado
                    <Desplegable valor={meta.estado} onCambio={v => setM('estado', v)} ariaLabel="Estado" opciones={[{ valor: 'activo', etiqueta: 'Activo' }, { valor: 'inactivo', etiqueta: 'Inactivo' }]} />
                  </div>
                  <div className="pl-label">
                    ¿Se puede pedir desde la app?
                    <Desplegable valor={meta.disponibleSolicitud ? 'si' : 'no'} onCambio={v => setM('disponibleSolicitud', v === 'si')} ariaLabel="Disponible para solicitudes" opciones={[{ valor: 'si', etiqueta: 'Sí, el colaborador lo puede pedir' }, { valor: 'no', etiqueta: 'No, solo lo emite RR.HH.' }]} />
                  </div>
                  <div className="pl-label">
                    Circuito de aprobación
                    <Desplegable valor={meta.circuito} onCambio={v => setM('circuito', v)} ariaLabel="Circuito de aprobación" opciones={Object.entries(CIRCUITOS).map(([k, t]) => ({ valor: k, etiqueta: t }))} />
                  </div>
                  {meta.circuito !== 'sin_aprobacion' && (
                    <label className="pl-label" htmlFor="xc-ed-aprob">
                      Quién aprueba
                      <input id="xc-ed-aprob" className="pl-input" value={meta.aprobador} onChange={e => setM('aprobador', e.target.value)} placeholder="Responsable de RR.HH." />
                    </label>
                  )}
                </div>
              </fieldset>
            </div>
          </section>

          <section className="dc-tarjeta">
            <div className="dc-tarjeta-cab">
              <div className="dc-tabs" role="tablist" aria-label="Plantilla" style={{ borderBottom: 'none' }}>
                <button type="button" role="tab" aria-selected={vista === 'editar'} className={`dc-tab${vista === 'editar' ? ' on' : ''}`} onClick={() => setVista('editar')}><FileText size={13} aria-hidden="true" /> Plantilla</button>
                <button type="button" role="tab" aria-selected={vista === 'previa'} className={`dc-tab${vista === 'previa' ? ' on' : ''}`} onClick={() => setVista('previa')}><Eye size={13} aria-hidden="true" /> Vista previa</button>
              </div>
              {vista === 'editar' && !soloLectura && (
                <div className="xc-barra">
                  <label className="dc-btn dc-btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={12} aria-hidden="true" /> Cargar .txt o .docx
                    <input type="file" accept=".txt,.docx,.doc,text/plain" onChange={cargarArchivo} hidden />
                  </label>
                  <button type="button" className="dc-btn dc-btn-sm" onClick={() => setBloque(true)}><Braces size={12} aria-hidden="true" /> Bloque condicional</button>
                </div>
              )}
            </div>
            <div className="dc-tarjeta-cuerpo">
              {vista === 'editar' ? (
                <>
                  <textarea
                    ref={area}
                    className="xc-texto"
                    value={texto}
                    readOnly={soloLectura}
                    onChange={e => { setTexto(e.target.value); setErrores(null) }}
                    aria-label="Texto de la plantilla"
                    spellCheck
                    placeholder="Escriba el texto fijo del documento. Para los datos de la persona, use el catálogo de la derecha: la variable se inserta donde está el cursor."
                  />
                  <p className="xc-ayuda">
                    {problemas.length === 0
                      ? 'Sin problemas con los datos de la persona de prueba.'
                      : `${problemas.length} ${problemas.length === 1 ? 'aviso' : 'avisos'} con los datos de ${persona?.name || 'la persona de prueba'}: ${problemas.slice(0, 2).map(p => p.texto).join(' · ')}${problemas.length > 2 ? '…' : ''}`}
                  </p>
                </>
              ) : (
                <HojaDocumento texto={rellenar(texto, datos)} etiqueta={`Vista previa con los datos de ${persona?.name || ''}`} />
              )}
            </div>
          </section>

          <section className="dc-tarjeta">
            <div className="dc-tarjeta-cab"><h2><History size={14} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 6 }} />Versiones</h2></div>
            <div className="dc-tarjeta-cuerpo">
              <ul className="xc-versiones">
                {[...modelo.versiones].reverse().map(v => {
                  const vigente = publicada && v.v === publicada.v
                  return (
                    <li key={v.v} className={`xc-version${!vigente && v.estado === 'publicada' ? ' antigua' : ''}`}>
                      <span className="xc-version-v">v{v.v}</span>
                      <span className="xc-version-txt">
                        <b>
                          {v.estado === 'borrador' ? 'Borrador' : 'Publicada'}
                          {vigente && <Etiqueta tono="verde">Vigente</Etiqueta>}
                          {v.estado === 'publicada' && !vigente && <Etiqueta tono="gris">Anterior</Etiqueta>}
                          {v.estado === 'borrador' && <Etiqueta tono="ambar">No se usa para emitir</Etiqueta>}
                        </b>
                        <small>{fechaCorta(v.fecha)} · {v.publicadaPor}</small>
                      </span>
                      <button type="button" className="dc-btn dc-btn-sm" onClick={() => setViendo(v)}><Eye size={12} aria-hidden="true" /> Ver</button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        </div>

        <aside className="xc-col">
          <section className="dc-tarjeta">
            <div className="dc-tarjeta-cab"><h3>Persona de prueba</h3></div>
            <div className="dc-tarjeta-cuerpo">
              <Desplegable valor={pruebaId} onCambio={setPruebaId} ariaLabel="Persona de prueba" opciones={activos.map(p => ({ valor: String(p.id), etiqueta: `${p.name} · ${p.cargo}` }))} />
              <p className="xc-ayuda">La vista previa y la validación usan sus datos reales: así se ve el documento que le llegaría.</p>
            </div>
          </section>
          <section className="dc-tarjeta">
            <div className="dc-tarjeta-cab"><h3>Variables</h3></div>
            <div className="dc-tarjeta-cuerpo xc-vars">
              {!soloLectura && <p className="xc-ayuda" style={{ margin: 0 }}>Haga clic para insertarla donde está el cursor.</p>}
              {VARIABLES.map(g => (
                <div key={g.grupo} className="xc-vars-grupo">
                  <h4>{g.grupo}</h4>
                  <p>Sale de {g.origen}</p>
                  {g.items.map(i => (
                    <button key={i.clave} type="button" className="xc-var" disabled={soloLectura} onClick={() => { setVista('editar'); insertar(`{{${i.clave}}}`) }} title={soloLectura ? undefined : `Insertar {{${i.clave}}}`}>
                      <span>{i.label}</span>
                      <code>{`{{${i.clave}}}`}{datos[i.clave] ? ` → ${String(datos[i.clave]).slice(0, 28)}` : ' → (vacía)'}</code>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {bloque && <ModalBloque onCerrar={() => setBloque(false)} onInsertar={clave => { setBloque(false); setVista('editar'); insertar(null, [`{{#si ${clave}}}`, '{{/si}}']) }} />}

      {viendo && (
        <Modal titulo={`Versión ${viendo.v} · ${viendo.estado === 'borrador' ? 'borrador' : 'publicada'}`} Icono={History} onCerrar={() => setViendo(null)} ancho={760}>
          <p className="xc-ayuda" style={{ margin: 0 }}>{fechaCorta(viendo.fecha)} · {viendo.publicadaPor}. Se muestra con los datos de {persona?.name}.</p>
          <HojaDocumento texto={rellenar(viendo.texto, datos)} compacta />
        </Modal>
      )}
    </div>
  )
}

/* EL BLOQUE CONDICIONAL (RF-48): un párrafo que sólo sale si el dato existe. Se elige la
   variable de la lista —igual que las otras— y el texto seleccionado queda adentro. */
function ModalBloque({ onCerrar, onInsertar }) {
  const [clave, setClave] = useState('contrato.fecha_fin')
  return (
    <Modal
      titulo="Insertar bloque condicional"
      Icono={Braces}
      onCerrar={onCerrar}
      ancho={480}
      pie={<>
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="pl-btn-save" onClick={() => onInsertar(clave)}>Insertar</button>
      </>}
    >
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--text-heading)' }}>
        El texto del bloque sólo aparece en el documento si la persona tiene este dato. Por ejemplo, la cláusula de plazo fijo no sale en un contrato indefinido, que no tiene fecha de fin.
      </p>
      <div className="pl-label">
        Mostrar sólo si hay
        <Desplegable valor={clave} onCambio={setClave} ariaLabel="Variable de la condición" opciones={CLAVES_VARIABLES.map(c => ({ valor: c, etiqueta: VARIABLES.flatMap(g => g.items).find(i => i.clave === c)?.label + ` · ${c}` }))} />
      </div>
      <p className="xc-ayuda">Si tenía texto seleccionado en la plantilla, queda dentro del bloque.</p>
    </Modal>
  )
}
