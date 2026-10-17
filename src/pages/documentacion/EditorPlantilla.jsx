import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CircleCheck, Download, Eye, FileText, History, PenLine, RotateCcw, Save, TriangleAlert, Upload, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { useUser } from '../../context/UserContext'
import { miFichaDe } from '../../data/miFicha'
import { COLORES_TIPO, VARIABLES, CLAVES_VARIABLES, datosPara, dias, fechaCorta, rellenar, tiposDoc, validarPlantilla, PLANTILLAS_SOULY, aMarcadores, deMarcadores, aplicarMarcadores, textoDePartida } from '../../data/documentacionData'
import { Cabecera, Etiqueta, Modal, Vacio } from '../../components/documentacion/comunes'
import { crearDocx, descargarBlob, nombreSeguro, textoDeDocx } from '../../components/documentacion/zip'
import Desplegable from '../../components/layout/Desplegable'
import HojaDocumento from './HojaDocumento'
import { contratoVigenteDe, ultimaVersion, versionPublicada } from './emisionUtil'
import './emision.css'
import './plantilla.css'

/* ── EL EDITOR DE PLANTILLA, UNO SOLO PARA TODO (propuesta CE · 15 oct 2026) ──
   Certificados, memorándums, contratos y los tipos que cree la empresa se editan igual:
   · a la izquierda, los AJUSTES: nombre, el TIPO —en pantalla nunca «categoría»— con «+ Crear un
     tipo nuevo» al final de la lista, y lo demás con interruptores;
   · al centro, LA HOJA, y se escribe sobre ella. Los datos de la persona no se ven como
     {{colaborador.nombre}} sino como pastillas celestes con su nombre de siempre;
   · a la derecha, LOS DATOS PARA INSERTAR: un toque lo pone donde está el cursor.
   «Vista previa» muestra la hoja como le llegaría a una persona real, en páginas (RF-45).

   El texto se sigue guardando con sus variables entre llaves dobles: las pastillas son sólo la
   forma de mostrarlas. PUBLICAR VALIDA (RF-46) Y CREA UNA VERSIÓN; no pisa la anterior (RF-47).

   «NUEVO MODELO» ENTRA DIRECTO ACÁ (`/plantillas/nuevo`), sin ventana previa: el modelo se crea
   al guardarlo o publicarlo por primera vez. Lo que hacía esa ventana —subir un .docx o .txt— es
   un botón de la barra de la hoja.

   LOS DE FÁBRICA SE VEN IGUAL pero no se editan: se duplican (RF-50). */

const nuevoId = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`

const ETIQ = Object.fromEntries(VARIABLES.flatMap(g => g.items.map(i => [i.clave, i.label])))
const RX_SI = /\{\{#si\s+([a-z0-9_.]+)\s*\}\}([\s\S]*?)\{\{\/si\}\}/g

export default function EditorPlantilla() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { modelo: buscar, modelos } = useDocumentacion()
  const nuevo = id === 'nuevo'
  /* «USAR» UNA DE SOULY (16 oct 2026) abre una plantilla nueva con su nombre, su tipo y su texto
     ya puestos (`?desde=souly-…`). No se crea nada hasta que se guarda: si se sale sin guardar,
     no queda una copia suelta en la lista. El nombre lleva «(copia)» para que se vea que la de
     Souly no se toca; si ya hay una copia con ese nombre, la nueva lleva su número. */
  const souly = nuevo ? PLANTILLAS_SOULY.find(s => s.id === params.get('desde')) : null
  const nombreCopia = souly && (() => {
    const libre = n => !modelos.some(m => m.nombre === n)
    for (let i = 1; ; i++) { const n = `${souly.nombre} (copia${i > 1 ? ` ${i}` : ''})`; if (libre(n)) return n }
  })()
  const modelo = souly
    ? { id: 'nuevo', nuevo: true, nombre: nombreCopia, categoria: souly.categoria, disponibleSolicitud: !!souly.disponibleSolicitud, sensible: !!souly.sensible, estado: 'activo', base: false, origenSouly: souly.id, versiones: souly.versiones }
    : nuevo
      ? { id: 'nuevo', nuevo: true, nombre: '', categoria: params.get('tipo') || 'certificado', disponibleSolicitud: false, estado: 'activo', base: false, versiones: [] }
      : buscar(id)
  if (!modelo) {
    return (
      <div className="content-scroll">
        <Cabecera titulo="Plantilla no encontrada" />
        <div className="dc-tarjeta">
          <Vacio Icono={FileText} titulo="Esta plantilla no existe" texto="Puede que se haya eliminado, o que el enlace esté incompleto.">
            <Link className="dc-btn" to="/documentos/configuracion">Volver a las plantillas</Link>
          </Vacio>
        </div>
      </div>
    )
  }
  /* La clave remonta el editor al cambiar de modelo —al guardar uno nuevo—. */
  return <Editor key={souly ? `nuevo-${souly.id}` : modelo.id} modelo={modelo} />
}

function Editor({ modelo }) {
  const { personas, contratos, parametros, setParametros, empresa, setModelos, anotarConfig, usuario } = useDocumentacion()
  const navigate = useNavigate()
  const location = useLocation()
  /* LAS DE FÁBRICA TAMBIÉN SE EDITAN (16 oct 2026). Antes no se tocaban y se duplicaban (RF-50):
     eso dejaba dos plantillas casi iguales. Ahora se editan como cualquiera —lo ya emitido no
     cambia, el historial guarda cada texto— y «Volver al texto original» deshace lo propio. */
  const soloLectura = false
  // La que salió de una plantilla de Souly puede volver al texto de Souly.
  const original = modelo.origenSouly ? PLANTILLAS_SOULY.find(s => s.id === modelo.origenSouly)?.versiones[0]?.texto ?? null : null
  const ultima = ultimaVersion(modelo)
  const publicada = versionPublicada(modelo)
  const tipos = tiposDoc(parametros)

  const [meta, setMeta] = useState({
    nombre: modelo.nombre, categoria: modelo.categoria, disponibleSolicitud: !!modelo.disponibleSolicitud,
    estado: modelo.estado,
    tamano: modelo.tamano || 'carta',
  })
  const [texto, setTexto] = useState(ultima?.texto || '')
  const [vista, setVista] = useState('escribir') // 'escribir' | 'ver'
  const [errores, setErrores] = useState(null)
  /* Al guardar una plantilla nueva se cambia de dirección y el editor se remonta: el aviso llega
     en el estado de la navegación. */
  const [aviso, setAviso] = useState(location.state?.aviso || null)
  const [viendo, setViendo] = useState(null)
  /* El Word subido con marcadores que no coinciden: espera a que se diga qué es cada uno. */
  const [revisar, setRevisar] = useState(null) // { nombreArchivo, texto, reconocidos, desconocidos }
  const activos = personas.filter(p => p.status !== 'desvinculado')
  const hoja = useRef(null)

  /* LA VISTA PREVIA SE ARMA CON LOS DATOS DE QUIEN ESTÁ USANDO EL SISTEMA —su propia ficha—; no
     hace falta elegir a nadie. Si no tiene ficha, con la de la primera persona activa. */
  const { currentUser } = useUser()
  const persona = useMemo(() => {
    const enLista = activos.find(p => p.name === currentUser?.name)
    if (enLista) return enLista
    /* Quien administra no siempre figura entre los colaboradores de este módulo: se arma su
       persona con lo que dice su ficha. */
    const ficha = miFichaDe(currentUser?.name)
    if (!ficha) return activos[0]
    const [d, m, a] = String(ficha.ingreso || '').split(' ')
    const MES = { Ene: '01', Feb: '02', Mar: '03', Abr: '04', May: '05', Jun: '06', Jul: '07', Ago: '08', Sep: '09', Oct: '10', Nov: '11', Dic: '12' }
    return {
      id: 'yo', name: currentUser.name, cargo: currentUser.cargo, depto: ficha.area, sedeNombre: ficha.sucursal,
      sedeCiudad: String(ficha.sucursal || '').replace(/^Sucursal\s+/, ''),
      documento: [ficha.form?.['1.11'], ficha.form?.['1.12']].filter(Boolean).join(' '),
      ingreso: a && MES[m] ? `${a}-${MES[m]}-${String(d).padStart(2, '0')}` : undefined,
      status: 'activo',
    }
  }, [activos, currentUser])
  const datos = useMemo(
    () => (persona ? datosPara(persona, { empresa, contrato: contratoVigenteDe(persona.id, contratos, parametros) }) : {}),
    [persona, empresa, contratos, parametros],
  )
  const problemas = useMemo(() => validarPlantilla(texto, datos), [texto, datos])
  const cambiado = modelo.nuevo
    ? !!(texto.trim() || meta.nombre.trim())
    : texto !== (ultima?.texto || '')
      || meta.nombre !== modelo.nombre || meta.categoria !== modelo.categoria || meta.disponibleSolicitud !== !!modelo.disponibleSolicitud
      || meta.estado !== modelo.estado
      || meta.tamano !== (modelo.tamano || 'carta')
  const setM = (k, v) => { setMeta(prev => ({ ...prev, [k]: v })); setAviso(null) }

  function insertar(raw) {
    if (soloLectura) return
    if (vista !== 'escribir') { setVista('escribir'); requestAnimationFrame(() => hoja.current?.insertar(raw)); return }
    hoja.current?.insertar(raw)
  }

  async function cargarArchivo(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const crudo = /\.docx$/i.test(f.name) ? await textoDeDocx(f) : await f.text()
      // Los marcadores del Word —[NOMBRE COMPLETO], [CARGO]— vuelven a ser datos.
      const { texto: t, reconocidos, desconocidos } = deMarcadores(crudo)
      if (!t.trim()) throw new Error('vacío')
      /* LO QUE NO COINCIDE SE PREGUNTA ANTES DE CARGAR (16 oct 2026): un marcador mal escrito
         —«[FECHA INI]»— no se cuela como texto en la plantilla; se muestra con el dato que más
         se le parece, y se carga recién cuando se dijo qué es cada uno. */
      if (desconocidos.length) { setRevisar({ nombreArchivo: f.name, texto: t, reconocidos, desconocidos }); return }
      cargarTexto(f.name, t, reconocidos.length)
    } catch {
      setAviso({ tono: 'ambar', texto: 'No se pudo leer el archivo. Use un .docx o un .txt con texto.' })
    }
  }

  function cargarTexto(nombreArchivo, t, cuantos, comoTexto = 0) {
    setTexto(t)
    if (!meta.nombre.trim()) setM('nombre', nombreArchivo.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '))
    setVista('escribir')
    const datosTxt = cuantos ? ` Reconocimos ${cuantos === 1 ? '1 dato' : `${cuantos} datos`} de la persona.` : ''
    const textoTxt = comoTexto ? ` ${comoTexto === 1 ? 'Un marcador quedó' : `${comoTexto} marcadores quedaron`} como texto, tal como estaba escrito.` : ''
    setAviso({ tono: comoTexto ? 'ambar' : 'verde', texto: `Se cargó «${nombreArchivo}».${datosTxt}${textoTxt} Revise que los datos estén como pastillas celestes antes de guardar.` })
  }

  /* DESCARGAR PLANTILLA (16 oct 2026): el texto de la hoja en un Word, con cada dato escrito como
     marcador, para completarlo en Word y subirlo de vuelta. Con la hoja vacía, un texto de partida
     que ya muestra cómo se usan. Abajo va la lista de marcadores, que al subir se ignora. */
  async function descargarPlantilla() {
    const titulo = (meta.nombre.trim() || tipos[meta.categoria]?.label || 'Documento').toUpperCase()
    const blob = await crearDocx(aMarcadores(texto.trim() ? texto : textoDePartida(meta.categoria, titulo)))
    descargarBlob(`${nombreSeguro(meta.nombre.trim() || 'Plantilla')}.docx`, blob)
  }

  const hoyISO = dias(0)
  /* GUARDAR Y ACTIVA, NADA MÁS (16 oct 2026). Ya no hay «borrador» ni «publicar»: una plantilla
     INACTIVA es el borrador —no aparece en Emitir— y una ACTIVA es la que se usa. Guardar con
     otro texto crea una versión nueva (RF-47): lo ya emitido conserva el texto con que salió.
     Sólo una plantilla activa se valida al guardar (RF-46): la inactiva puede quedar a medias.
     UNA NUEVA SE GUARDA DE DOS MODOS (16 oct 2026): «Guardar borrador» la deja inactiva y «Guardar
     y activar», lista para emitir. `estado` es ése; sin él, manda el interruptor «Activa». */
  function guardar(estado = meta.estado) {
    const nombre = meta.nombre.trim()
    if (!nombre) { setAviso({ tono: 'ambar', texto: 'Póngale un nombre a la plantilla, a la izquierda.' }); return }
    const activa = estado === 'activo'
    if (activa) {
      const errs = validarPlantilla(texto, datos)
      if (!texto.trim()) errs.unshift({ tipo: 'vacia', texto: 'La hoja está vacía' })
      if (errs.length) { setErrores(errs); setVista('escribir'); return }
    }
    const version = { texto, estado: 'publicada', publicadaPor: usuario, fecha: hoyISO }
    const avisoListo = activa
      ? 'Guardada. Está activa: aparece en Emitir, y lo que se emita desde ahora sale con este texto.'
      : modelo.nuevo ? 'Borrador guardado. No aparece en Emitir hasta que la active.'
        : 'Guardada. Está inactiva: no aparece en Emitir hasta que la active.'
    if (modelo.nuevo) {
      const id = nuevoId()
      setModelos(prev => [...prev, { id, ...meta, estado, nombre, sensible: !!modelo.sensible, base: false, ...(modelo.origenSouly ? { origenSouly: modelo.origenSouly } : {}), versiones: [{ v: 1, ...version }] }])
      anotarConfig(`${modelo.origenSouly ? 'Agregó desde Souly' : 'Creó'} la plantilla «${nombre}»${activa ? '' : ' como borrador'}`)
      navigate(`/documentos/configuracion/plantillas/${id}`, { replace: true, state: { aviso: { tono: 'verde', texto: avisoListo } } })
      return
    }
    setModelos(prev => prev.map(m => {
      if (m.id !== modelo.id) return m
      const vs = [...m.versiones]
      const ult = vs[vs.length - 1]
      /* Un borrador viejo (de antes de este cambio) se convierte en versión; un texto nuevo, en
         la siguiente. Una versión ya usada no se reescribe nunca. */
      if (ult?.estado === 'borrador') vs[vs.length - 1] = { ...ult, ...version }
      else if (texto !== ult?.texto) vs.push({ v: vs.length + 1, ...version })
      return { ...m, ...meta, nombre, versiones: vs }
    }))
    anotarConfig(`Guardó la plantilla «${nombre}»`)
    setErrores(null)
    setAviso({ tono: 'verde', texto: avisoListo })
  }

  function crearTipo({ label, plural, prefijo, color }) {
    const base = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const key = `t-${base}-${Date.now().toString(36).slice(-3)}`
    setParametros(prev => ({
      ...prev,
      tiposPropios: [...(prev.tiposPropios || []), { key, label, plural, color }],
      numeracion: { ...prev.numeracion, [key]: { prefijo, formato: '{prefijo}-{n}/{gestion}', reinicioAnual: true, digitos: 4 } },
    }))
    anotarConfig(`Creó el tipo de documento «${label}» (${prefijo})`)
    setM('categoria', key)
  }

  const tipo = tipos[meta.categoria] || tipos.otro
  const estadoTxt = modelo.nuevo ? (modelo.origenSouly ? 'Desde Souly, sin guardar: revísela y guárdela para usarla' : 'Plantilla nueva, sin guardar')
    : cambiado ? 'Cambios sin guardar'
      : modelo.estado === 'activo' ? 'Guardada · activa' : 'Guardada · inactiva'

  return (
    <div className="content-scroll xpl">
      <div className="xpl-barra">
        <Link to="/documentos/configuracion" className="xpl-volver"><ArrowLeft size={14} aria-hidden="true" /> Plantillas</Link>
        <div className="xpl-titulo">
          <span className="xpl-punto" style={{ background: tipo.color }} aria-hidden="true" />
          <h1>{meta.nombre.trim() || 'Plantilla nueva'}</h1>
          {modelo.origenSouly && <Etiqueta tono="verde" titulo="Se hizo a partir de una plantilla de Souly. «Volver al texto original» la deja como la de Souly.">De Souly</Etiqueta>}
          <span className={`xpl-estado${cambiado ? ' cambios' : ''}`}>{estadoTxt}</span>
        </div>
        {modelo.nuevo ? (
          <span className="xpl-guardar-dos">
            <button type="button" className="dc-btn" onClick={() => guardar('inactivo')} title="Queda inactiva: no aparece en Emitir y puede quedar a medias">Guardar borrador</button>
            <button type="button" className="pl-btn-new" onClick={() => guardar('activo')} title="Queda activa: aparece en Emitir"><Save size={14} color="#00E091" /> Guardar y activar</button>
          </span>
        ) : (
          <button type="button" className="pl-btn-new" onClick={() => guardar()} disabled={!cambiado && ultima?.estado !== 'borrador'} title={!cambiado && ultima?.estado !== 'borrador' ? 'No hay cambios para guardar' : undefined}><Save size={14} color="#00E091" /> Guardar cambios</button>
        )}
      </div>

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
            <b>No se guardó: {errores.length === 1 ? 'hay un problema' : `hay ${errores.length} problemas`} en la hoja.</b>
            <ul>{errores.map((e, i) => <li key={i}>{e.texto}</li>)}</ul>
          </div>
        </div>
      )}

      <div className="xpl-grid">
        {/* ── AJUSTES ── */}
        <aside className="xpl-lado dc-tarjeta" aria-label="Ajustes de la plantilla">
          <fieldset disabled={soloLectura} className="xpl-ajustes">
            <h2 className="xpl-tit">Ajustes</h2>
            <label className="pl-label" htmlFor="xpl-nombre">
              Nombre
              <input id="xpl-nombre" className="pl-input" value={meta.nombre} onChange={e => setM('nombre', e.target.value)} placeholder="Constancia de vacaciones" autoFocus={modelo.nuevo} />
            </label>
            <SelectorTipo valor={meta.categoria} tipos={tipos} numeracion={parametros.numeracion} onCambio={v => setM('categoria', v)} onCrear={crearTipo} />
            <Interruptor valor={meta.disponibleSolicitud} onCambio={v => setM('disponibleSolicitud', v)} texto="El colaborador lo puede pedir" ayuda="Aparece en «Pedir un documento» de su app." />
            {/* SIN «NECESITA APROBACIÓN» (16 oct 2026): lo emitido se genera, se imprime y se firma a
                mano; no hay firma digital ni un paso de aprobación en el sistema que tenga sentido. */}
            {/* En una nueva lo deciden los dos botones de guardar; el interruptor, en una que ya existe. */}
            {!modelo.nuevo && <Interruptor valor={meta.estado === 'activo'} onCambio={v => setM('estado', v ? 'activo' : 'inactivo')} texto="Activa" ayuda={meta.estado === 'activo' ? 'Aparece en Emitir.' : 'No aparece en Emitir: queda como borrador.'} />}
          </fieldset>

          {!modelo.nuevo && (
            /* EL HISTORIAL: cada vez que se guardó con otro texto. Lo ya emitido salió con el texto
               de su día y no cambia; acá se ve cómo era. */
            <div className="xpl-versiones">
              <h2 className="xpl-tit"><History size={13} aria-hidden="true" /> Historial</h2>
              <ul>
                {[...modelo.versiones].reverse().map((v, i, lista) => {
                  const actual = publicada && v.v === publicada.v
                  const primera = i === lista.length - 1
                  return (
                    <li key={v.v} className={actual ? 'vigente' : undefined}>
                      <span className="xpl-v-punto" aria-hidden="true" />
                      <span className="xpl-v-txt"><b>{primera ? 'Creada' : 'Editada'} el {fechaCorta(v.fecha)}{actual ? ' · actual' : ''}</b><small>por {v.publicadaPor}</small></span>
                      <button type="button" className="xw-enlace" onClick={() => setViendo(v)}>Ver cómo era</button>
                    </li>
                  )
                })}
              </ul>
              {original != null && texto !== original && (
                <button type="button" className="xpl-original" onClick={() => { setTexto(original); setVista('escribir'); setAviso({ tono: 'ambar', texto: 'Se puso el texto original. Guarde para dejarlo así; lo ya emitido no cambia.' }) }}>
                  <RotateCcw size={13} aria-hidden="true" /> Volver al texto original
                </button>
              )}
            </div>
          )}
        </aside>

        {/* ── LA HOJA ── */}
        <section className="xpl-mesa" aria-label="La hoja">
          <div className="xpl-herr">
            <div className="xe-modo xpl-modo" role="group" aria-label="Qué ver">
              <button type="button" className={vista === 'escribir' ? 'on' : ''} aria-pressed={vista === 'escribir'} onClick={() => setVista('escribir')}><PenLine size={13} aria-hidden="true" /> {soloLectura ? 'Texto' : 'Escribir'}</button>
              <button type="button" className={vista === 'ver' ? 'on' : ''} aria-pressed={vista === 'ver'} onClick={() => setVista('ver')}><Eye size={13} aria-hidden="true" /> Vista previa</button>
            </div>
            {/* EL TAMAÑO DE LA HOJA es de la plantilla: carta u oficio, como se imprime. */}
            <div className="xe-modo xpl-modo" role="group" aria-label="Tamaño de la hoja">
              {Object.entries(TAMANOS).map(([k, t]) => (
                <button key={k} type="button" className={meta.tamano === k ? 'on' : ''} aria-pressed={meta.tamano === k} disabled={soloLectura} onClick={() => setM('tamano', k)} title={t.medida}>{t.label}</button>
              ))}
            </div>
            {vista === 'escribir' && !soloLectura && (
              <button type="button" className="xpl-herr-btn" onClick={descargarPlantilla} title="Bájela en Word con los datos marcados, complétela y súbala">
                <Download size={13} aria-hidden="true" /> Descargar plantilla
              </button>
            )}
            {vista === 'escribir' && !soloLectura && (
              <label className="xpl-herr-btn" style={{ cursor: 'pointer' }}>
                <Upload size={13} aria-hidden="true" /> Subir plantilla
                <input type="file" accept=".txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={cargarArchivo} hidden />
              </label>
            )}
          </div>

          {vista === 'escribir' ? (
            <HojaChips ref={hoja} texto={texto} editable={!soloLectura} onCambio={t => { setTexto(t); setErrores(null); setAviso(null) }} />
          ) : (
            <HojaLlena texto={texto} datos={datos} tamano={meta.tamano} />
          )}

          <p className={`xpl-pie${problemas.length ? ' falta' : ''}`}>
            {!texto.trim() ? 'Escriba el texto del documento y toque un dato de la derecha para ponerlo donde está el cursor.'
              : problemas.length === 0 ? (vista === 'ver' ? `Hoja ${TAMANOS[meta.tamano].label.toLowerCase()} · ${TAMANOS[meta.tamano].medida}. Así le llega a cada persona, con sus datos.` : 'Todos los datos están bien puestos.')
                : `${problemas.length} ${problemas.length === 1 ? 'aviso' : 'avisos'}: ${problemas.slice(0, 2).map(p => p.texto).join(' · ')}${problemas.length > 2 ? '…' : ''}`}
          </p>
        </section>

        {/* ── LOS DATOS PARA INSERTAR ── */}
        <aside className="xpl-lado dc-tarjeta" aria-label="Datos para insertar">
          <h2 className="xpl-tit">Datos para insertar</h2>
          <p className="xpl-ayuda">{soloLectura ? 'Los datos que toma de la ficha de cada persona.' : 'Toque uno y se pone en la hoja donde está el cursor. Al emitir, cada persona recibe los suyos.'}</p>
          {VARIABLES.map(g => (
            <div key={g.grupo} className="xpl-grupo">
              <span className="xpl-grupo-tit">{g.grupo}</span>
              <div className="xpl-chips">
                {g.items.map(i => (
                  <button key={i.clave} type="button" className={`xpl-dato${i.clave === 'memo.observaciones' ? ' texto' : ''}`} disabled={soloLectura}
                    onClick={() => insertar(`{{${i.clave}}}`)} title={datos[i.clave] ? `Por ejemplo: ${datos[i.clave]}` : undefined}>
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>

      {viendo && (
        <Modal titulo={`Cómo era el ${fechaCorta(viendo.fecha)}`} Icono={History} onCerrar={() => setViendo(null)} ancho={760}>
          <p className="xc-ayuda" style={{ margin: 0 }}>Guardada por {viendo.publicadaPor}. Lo que se emitió con este texto sigue diciendo esto.</p>
          <HojaDocumento texto={rellenar(viendo.texto, datos)} compacta />
        </Modal>
      )}

      {revisar && (
        <ModalMarcadores
          {...revisar}
          onCerrar={() => setRevisar(null)}
          onAplicar={elecciones => {
            const comoTexto = Object.values(elecciones).filter(k => !k).length
            const cuantos = new Set([...revisar.reconocidos, ...Object.values(elecciones).filter(Boolean)]).size
            cargarTexto(revisar.nombreArchivo, aplicarMarcadores(revisar.texto, elecciones), cuantos, comoTexto)
            setRevisar(null)
          }}
        />
      )}
    </div>
  )
}

/* ── LOS MARCADORES QUE NO SE RECONOCIERON (16 oct 2026) ─────────────────
   Uno por fila, con un pedazo del texto donde aparece para ubicarlo, y el dato que más se le
   parece ya elegido. Se puede elegir otro o dejarlo como texto, tal como está escrito. Hasta
   «Cargar la plantilla» no cambia nada: «Cancelar» deja la hoja como estaba. */
const TODOS_LOS_DATOS = VARIABLES.flatMap(g => g.items.map(i => ({ valor: i.clave, etiqueta: `${i.label} · ${g.grupo}` })))

export function ModalMarcadores({ nombreArchivo, reconocidos, desconocidos, onCerrar, onAplicar }) {
  const [elecciones, setElecciones] = useState(() => Object.fromEntries(desconocidos.map(d => [d.marcador, d.sugerencias[0]?.clave || ''])))
  const pie = (
    <>
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
      <button type="button" className="pl-btn-save" onClick={() => onAplicar(elecciones)}>Cargar la plantilla</button>
    </>
  )
  return (
    <Modal titulo="Revise estos marcadores" Icono={TriangleAlert} onCerrar={onCerrar} pie={pie} ancho={720}>
      <p className="xc-ayuda" style={{ margin: '0 0 14px' }}>
        En «{nombreArchivo}» {reconocidos.length ? <>reconocimos {reconocidos.length === 1 ? '1 dato' : `${reconocidos.length} datos`}, pero </> : null}
        {desconocidos.length === 1 ? 'un marcador no coincide' : `${desconocidos.length} marcadores no coinciden`} con ningún dato. Elija qué va en {desconocidos.length === 1 ? 'él' : 'cada uno'}:
      </p>
      <ul className="xpl-marcas">
        {desconocidos.map(d => {
          const sugeridas = d.sugerencias.map(s => s.clave)
          const opciones = [
            ...d.sugerencias.map((s, i) => ({ valor: s.clave, etiqueta: `${i === 0 ? '¿Quiso decir…? ' : ''}${s.label}` })),
            ...TODOS_LOS_DATOS.filter(o => !sugeridas.includes(o.valor)),
            { valor: '', etiqueta: 'Dejarlo como texto, tal como está escrito' },
          ]
          return (
            <li key={d.marcador} className="xpl-marca">
              <div className="xpl-marca-txt">
                <code className="xpl-marca-cod">{d.marcador}</code>
                <span className="xpl-marca-ctx">«…{d.contexto.antes}<b>{d.marcador}</b>{d.contexto.despues}…»</span>
                {!d.sugerencias.length && <span className="xpl-marca-sin">No se parece a ningún dato: elija uno o déjelo como texto.</span>}
              </div>
              <div className="xpl-marca-sel">
                <Desplegable valor={elecciones[d.marcador]} onCambio={v => setElecciones(prev => ({ ...prev, [d.marcador]: v }))} ariaLabel={`Qué dato va en ${d.marcador}`} opciones={opciones} conBuscador />
              </div>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}

/* ── EL TIPO, CON «CREAR UNO NUEVO» EN LA MISMA LISTA (propuesta CI) ──
   Sin ventana: elegir «+ Crear un tipo nuevo» abre debajo un recuadro del color que se elige, con
   el nombre y, sobre todo, «ASÍ SE VA A VER»: los tres lugares donde aparece el tipo —el riel de
   Emitir, el número que sale y la carpeta en la app del colaborador—. Así se entiende para qué
   sirve crear un tipo, no sólo cómo. La sigla se arma sola y se puede cambiar ahí mismo. */
const sinTildes = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
/* «Constancia» → «Constancias», «Carta de recomendación» → «Cartas de recomendación». */
const plural = nombre => {
  const [primera, ...resto] = nombre.trim().split(/\s+/)
  if (!primera) return ''
  const p = /[aeiouáéó]$/i.test(primera) ? `${primera}s` : /z$/i.test(primera) ? `${primera.slice(0, -1)}ces` : `${primera}es`
  return [p, ...resto].join(' ')
}

function SelectorTipo({ valor, tipos, numeracion, onCambio, onCrear }) {
  const usados = Object.values(tipos).map(t => t.color)
  const [creando, setCreando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [sigla, setSigla] = useState('')
  const [color, setColor] = useState(() => COLORES_TIPO.find(c => !usados.includes(c)) || COLORES_TIPO[0])
  const palabras = sinTildes(nombre).replace(/[^A-Za-z ]/g, '').trim().split(/\s+/).filter(p => p.length > 2 || /^[A-Z]/.test(p))
  const siglaAuto = (palabras.length > 1 ? palabras.map(p => p[0]).join('') : (palabras[0] || '').slice(0, 3)).slice(0, 4).toUpperCase()
  const siglaFinal = (sigla || siglaAuto).toUpperCase().replace(/[^A-Z0-9]/g, '')
  const listo = nombre.trim().length > 2 && siglaFinal.length > 1
  const nombreVisto = nombre.trim() || 'Tipo nuevo'

  const opciones = [
    /* «Otro documento» no se ofrece: para eso se crea un tipo con su nombre. Sigue existiendo por
       dentro —numera los archivos propios que se envían— y se ve sólo si una plantilla vieja lo usa. */
    ...Object.entries(tipos).filter(([k]) => k !== 'otro' || valor === 'otro').map(([k, t]) => ({ valor: k, etiqueta: t.label, lateral: numeracion?.[k]?.prefijo || '' })),
    { valor: '__nuevo', etiqueta: '+ Crear un tipo nuevo' },
  ]
  const cerrar = () => { setCreando(false); setNombre(''); setSigla('') }
  const crear = () => { if (!listo) return; onCrear({ label: nombre.trim(), plural: plural(nombre), prefijo: siglaFinal, color }); cerrar() }

  return (
    <div className="pl-label">
      Tipo
      <div className="xpl-tipo">
        <Desplegable valor={creando ? '__nuevo' : valor} onCambio={v => (v === '__nuevo' ? setCreando(true) : (cerrar(), onCambio(v)))} ariaLabel="Tipo" opciones={opciones} />
      </div>
      {creando && (
        <div className="xpl-nuevo" style={{ '--xpl-c': color }}>
          <div className="xpl-nuevo-cab">
            <b>Tipo nuevo</b>
            <button type="button" className="xpl-nuevo-x" aria-label="Cancelar el tipo nuevo" onClick={cerrar}><X size={14} /></button>
          </div>
          <input className="pl-input xpl-nuevo-nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Constancia" aria-label="Nombre del tipo nuevo" autoFocus onKeyDown={e => { if (e.key === 'Enter') crear() }} />
          <div className="xpl-colores" role="radiogroup" aria-label="Color del tipo">
            {COLORES_TIPO.map(c => (
              <button key={c} type="button" role="radio" aria-checked={color === c} aria-label={`Color ${c}`} className={`xpl-color${color === c ? ' on' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
          <span className="xpl-asi">Así se va a ver</span>
          <div className="xpl-vista">
            <div className="xpl-vista-fila"><span className="xpl-vista-et">Emitir</span><span className="xpl-punto" style={{ background: color }} aria-hidden="true" /><b>{plural(nombreVisto)}</b></div>
            <div className="xpl-vista-fila">
              <span className="xpl-vista-et">Número</span>
              <input className="xpl-sigla" value={sigla} onChange={e => setSigla(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} placeholder={siglaAuto || 'SIG'} aria-label="Sigla del número" title="La sigla con que se numera. Se puede cambiar." />
              <b>-0001/{new Date().getFullYear()}</b>
            </div>
            <div className="xpl-vista-fila"><span className="xpl-vista-et">En la app</span><span className="xpl-carpeta" aria-hidden="true" /><span>Carpeta «{plural(nombreVisto)}»</span></div>
          </div>
          <button type="button" className="xpl-nuevo-crear" disabled={!listo} onClick={crear}>Crear</button>
        </div>
      )}
    </div>
  )
}

function Interruptor({ valor, onCambio, texto, ayuda }) {
  return (
    <label className="xpl-interruptor">
      <span className="xpl-int-txt">{texto}{ayuda && <small>{ayuda}</small>}</span>
      <input type="checkbox" role="switch" checked={valor} onChange={e => onCambio(e.target.checked)} />
      <span className="xpl-int-riel" aria-hidden="true" />
    </label>
  )
}

/* ── LA HOJA CON PASTILLAS ──────────────────────────────────────────────────
   Un área editable con forma de hoja. Cada {{…}} del texto se dibuja como una pastilla que no se
   edita por dentro —se borra entera— y al escribir se vuelve a leer el texto con sus llaves. La
   hoja sólo se redibuja cuando el texto cambia desde afuera (subir un archivo), nunca mientras se
   escribe: así el cursor no salta. */
const TOKEN = /(\{\{[^}]*\}\})/g
const escapar = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function etiquetaDe(raw) {
  const t = raw.slice(2, -2).trim()
  if (/^#si\s/.test(t)) { const c = t.replace(/^#si\s+/, ''); return { label: `Si hay ${(ETIQ[c] || c).toLowerCase()}:`, clase: 'si', ok: CLAVES_VARIABLES.includes(c) } }
  if (t === '/si') return { label: 'fin del párrafo condicional', clase: 'si', ok: true }
  return { label: ETIQ[t] || t, clase: t === 'memo.observaciones' ? 'texto' : 'dato', ok: CLAVES_VARIABLES.includes(t) }
}
const pastilla = raw => {
  const e = etiquetaDe(raw)
  return `<span class="xpl-chip ${e.clase}${e.ok ? '' : ' mal'}" contenteditable="false" data-raw="${escapar(raw)}" title="${e.ok ? '' : 'Este dato no existe en el catálogo'}">${escapar(e.label)}</span>`
}
const aHtml = texto => String(texto || '').split(TOKEN).map(p => (/^\{\{[^}]*\}\}$/.test(p) ? pastilla(p) : escapar(p))).join('')

function aTexto(nodo) {
  let s = ''
  nodo.childNodes.forEach(n => {
    if (n.nodeType === 3) s += n.nodeValue.replace(/\u00a0/g, ' ').replace(/\u200b/g, '')
    else if (n.nodeType === 1) {
      if (n.dataset?.raw) s += n.dataset.raw
      else if (n.tagName === 'BR') s += '\n'
      else if (n.tagName === 'DIV' || n.tagName === 'P') s += (s && !s.endsWith('\n') ? '\n' : '') + aTexto(n)
      else s += aTexto(n)
    }
  })
  return s
}

const HojaChips = forwardRef(function HojaChips({ texto, onCambio, editable }, ref) {
  const caja = useRef(null)
  const ultimo = useRef(null)
  const rango = useRef(null)

  useLayoutEffect(() => {
    if (texto === ultimo.current) return
    caja.current.innerHTML = aHtml(texto)
    ultimo.current = texto
  }, [texto])

  const leer = () => { const t = aTexto(caja.current); ultimo.current = t; onCambio(t) }
  const recordar = () => {
    const sel = window.getSelection()
    if (sel.rangeCount && caja.current?.contains(sel.anchorNode)) rango.current = sel.getRangeAt(0).cloneRange()
  }
  const ponerCursor = () => {
    const el = caja.current
    el.focus()
    const sel = window.getSelection()
    sel.removeAllRanges()
    if (rango.current && el.contains(rango.current.startContainer)) sel.addRange(rango.current)
    else { const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); sel.addRange(r) }
    return sel
  }

  useImperativeHandle(ref, () => ({
    insertar(raw) {
      ponerCursor()
      document.execCommand('insertHTML', false, `${pastilla(raw)}\u200b`)
      leer(); recordar()
    },
    envolver(abre, cierra) {
      const sel = ponerCursor()
      const elegido = sel.toString() || 'Texto que sólo aparece si hay ese dato'
      document.execCommand('insertHTML', false, `${pastilla(abre)}${escapar(elegido)}${pastilla(cierra)}\u200b`)
      leer(); recordar()
    },
  }))

  return (
    <div className="xpl-papel">
      <div
        ref={caja}
        className={`xpl-hoja${texto.trim() ? '' : ' vacia'}`}
        contentEditable={editable}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Texto de la plantilla"
        data-ph="Escriba aquí el texto del documento…"
        spellCheck
        onInput={leer}
        onKeyUp={recordar}
        onMouseUp={recordar}
        onBlur={recordar}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.execCommand('insertLineBreak'); leer() } }}
        onPaste={e => {
          e.preventDefault()
          document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
          /* Lo pegado puede traer {{…}}: se redibuja para que salgan como pastillas. */
          const t = aTexto(caja.current)
          ultimo.current = null
          onCambio(t)
        }}
      />
    </div>
  )
})

/* ── LA VISTA PREVIA, EN PÁGINAS ───────────────────────────────────────────
   La hoja como le llega a la persona de prueba —sus datos en verde, lo que falta en rojo— y
   repartida en páginas tamaño carta, como se imprime. Un Word largo ya no es una tira sin fin.

   CÓMO SE CORTA. El texto se divide en párrafos y cada párrafo en palabras; se miden en un
   medidor escondido con el mismo ancho y la misma letra que la página, y se llena cada página
   hasta su alto. Un párrafo que no entra se parte entre palabras: lo que sobra pasa a la siguiente.
   Las medidas salen del navegador, así que el corte es el mismo que se ve. */
/* Carta (8,5 × 11 pulgadas) y oficio (8,5 × 13), a 640 px de ancho. El alto útil es la hoja menos
   los márgenes de arriba y abajo (56 + 56). */
const TAMANOS = {
  carta: { label: 'Carta', medida: '21,6 × 27,9 cm', alto: 828 },
  oficio: { label: 'Oficio', medida: '21,6 × 33 cm', alto: 979 },
}

/* Un párrafo como lista de piezas que se pueden cortar: palabras con su espacio, y los datos. */
function piezasDe(linea, datos) {
  const piezas = []
  linea.split(TOKEN).forEach(p => {
    if (!p) return
    if (/^\{\{[^}]*\}\}$/.test(p)) {
      const c = p.slice(2, -2).trim()
      if (c === 'memo.observaciones') piezas.push({ t: 'obs' })
      else if (datos[c]) piezas.push({ t: 'valor', v: String(datos[c]) })
      else piezas.push({ t: 'hueco', v: ETIQ[c] || c })
      return
    }
    p.split(/(?<=\s)/).forEach(w => w && piezas.push({ t: 'txt', v: w }))
  })
  return piezas
}
const htmlDe = piezas => (piezas.length ? piezas.map(x => (
  x.t === 'txt' ? escapar(x.v)
    : x.t === 'valor' ? `<mark class="xpl-valor">${escapar(x.v)}</mark>`
      : x.t === 'hueco' ? `<mark class="xc-hueco">${escapar(x.v)}</mark>`
        : '<span class="xpl-chip texto">Lo que escriba quien envía</span>'
)).join('') : '&nbsp;')

let medidor = null
function medir(piezas) {
  if (!medidor) {
    medidor = document.createElement('div')
    medidor.className = 'xpl-medidor'
    medidor.setAttribute('aria-hidden', 'true')
    document.body.appendChild(medidor)
  }
  medidor.innerHTML = htmlDe(piezas)
  return medidor.offsetHeight
}

function paginar(parrafos, PAGINA_ALTO) {
  const paginas = []
  let actual = []
  let usado = 0
  for (const par of parrafos) {
    let resto = par
    for (;;) {
      const alto = medir(resto)
      if (usado + alto <= PAGINA_ALTO) { actual.push(resto); usado += alto; break }
      /* No entra entero: cuántas piezas caben en lo que queda de la página. */
      let lo = 0
      let hi = resto.length
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2)
        if (usado + medir(resto.slice(0, mid)) <= PAGINA_ALTO) lo = mid
        else hi = mid - 1
      }
      if (lo === 0 && actual.length) { paginas.push(actual); actual = []; usado = 0; continue }
      const k = Math.max(lo, 1)
      actual.push(resto.slice(0, k))
      paginas.push(actual)
      actual = []
      usado = 0
      resto = resto.slice(k)
      if (resto[0]?.t === 'txt') resto = [{ ...resto[0], v: resto[0].v.replace(/^\s+/, '') }, ...resto.slice(1)]
      if (!resto.length) break
    }
  }
  if (actual.length || !paginas.length) paginas.push(actual)
  return paginas
}

function Pieza({ x }) {
  if (x.t === 'txt') return x.v
  if (x.t === 'valor') return <mark className="xpl-valor">{x.v}</mark>
  if (x.t === 'hueco') return <mark className="xc-hueco" title="Esta persona no tiene este dato">{x.v}</mark>
  return <span className="xpl-chip texto">Lo que escriba quien envía</span>
}

function HojaLlena({ texto, datos, tamano = 'carta' }) {
  const alto = TAMANOS[tamano]?.alto || TAMANOS.carta.alto
  const conBloques = String(texto || '').replace(RX_SI, (_, c, cuerpo) => (datos[c] ? cuerpo : ''))
  const paginas = useMemo(() => paginar(conBloques.split('\n').map(l => piezasDe(l, datos)), alto - 112), [conBloques, datos, alto])
  /* La página mide siempre lo mismo —así el corte no cambia con la pantalla— y se achica para
     entrar en la columna, como el zoom de un visor de PDF. */
  const caja = useRef(null)
  const [escala, setEscala] = useState(1)
  useEffect(() => {
    const el = caja.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setEscala(Math.min(1, e.contentRect.width / 660)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={caja} className="xpl-paginas-marco">
    <div className="xpl-paginas" style={{ zoom: escala }}>
      {paginas.map((pag, i) => (
        <div key={i} className="xpl-pagina-caja">
          <div className="xpl-pagina" style={{ height: alto }} aria-label={`Página ${i + 1} de ${paginas.length}`}>
            {pag.map((par, j) => (
              <div key={j} className="xpl-par">{par.length ? par.map((x, k) => <Pieza key={k} x={x} />) : '\u00a0'}</div>
            ))}
          </div>
          <span className="xpl-pagina-num">Página {i + 1} de {paginas.length}</span>
        </div>
      ))}
    </div>
    </div>
  )
}
