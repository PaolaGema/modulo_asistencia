import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Copy, Download, Eye, FileText, Library, Pencil, Plus, Power, Search, Trash2, TriangleAlert, Upload, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { dias, fechaCorta, numeracionDe, tiposDoc, PLANTILLAS_SOULY, aMarcadores, deMarcadores, aplicarMarcadores, textoDePartida } from '../../data/documentacionData'
import { Etiqueta, MenuAcciones, Modal, Vacio } from '../../components/documentacion/comunes'
import { crearDocx, descargarBlob, textoDeDocx } from '../../components/documentacion/zip'
import Desplegable from '../../components/layout/Desplegable'
import Paginacion from '../../components/layout/Paginacion'
import HojaDocumento from './HojaDocumento'
import { ModalMarcadores } from './EditorPlantilla'
import { versionPublicada } from './emisionUtil'
import './emision.css'
import './configuracion.css'

/* ── MODELOS Y PLANTILLAS (pantalla 9, revisada · RF-42, RF-43, RF-50) ────
   UNA sola lista para certificados, memorándums, contratos y otros documentos, donde el Salar
   tiene tres pantallas casi iguales. La tabla se quedó con lo esencial —qué es, qué plantilla
   tiene publicada, si está activo— y las acciones van en el menú de cada fila.

   UN MODELO NUEVO PUEDE NACER DE UN ARCHIVO: quien ya tiene su certificado en Word lo sube, y
   el sistema le dice qué campos variables reconoció y cuáles no existen en el catálogo, antes de
   abrir el editor.

   LAS DE SOULY SON UN CATÁLOGO (16 oct 2026, antes «de fábrica»): no tienen estado ni se emiten.
   Se ven, se «usan» —se copian a las de la empresa, activas— o se «personalizan» —se copian y se
   abre el editor—. Un filtro elige qué mirar: todas, las de Souly o las suyas. La NUMERACIÓN vive
   acá, en su pestaña, porque es de los modelos y no de los tipos de documento. */

/* Diez por página, como Expedientes: las plantillas propias pueden ser muchas. */
const POR_PAGINA = 10

const nuevoId = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`

/* La pantalla es una pestaña de Configuración (`Configuracion.jsx`). */
export function Modelos() {
  const { modelos, setModelos, emitidos, contratos, parametros, anotarConfig, usuario } = useDocumentacion()
  const CATEGORIAS = tiposDoc(parametros)
  const navigate = useNavigate()
  const [categoria, setCategoria] = useState('')
  const [estado, setEstado] = useState('todos')
  const [origen, setOrigen] = useState('')  // '' todas · 'souly' · 'mias'
  const [busca, setBusca] = useState('')
  const [borrando, setBorrando] = useState(null)
  const [bloqueado, setBloqueado] = useState(null)
  const [viendo, setViendo] = useState(null)  // una plantilla de Souly abierta para leerla
  const [cargando, setCargando] = useState(false)  // el modal de «Cargar plantillas»
  const [aviso, setAviso] = useState('')
  const [pag, setPag] = useState(1)

  /* Cuántos documentos salieron de cada modelo: decide si se puede eliminar (RF-08). */
  const usos = useMemo(() => {
    const n = {}
    for (const e of emitidos) n[e.modeloId] = (n[e.modeloId] || 0) + 1
    for (const c of contratos) n[c.modeloId] = (n[c.modeloId] || 0) + 1
    return n
  }, [emitidos, contratos])

  /* Las de Souly no tienen estado: con «Activos» o «Inactivos» sólo se ven las de la empresa. */
  const deSouly = PLANTILLAS_SOULY.map(s => ({ ...s, souly: true, enUso: modelos.some(m => m.origenSouly === s.id) }))
  const visibles = [
    ...(origen !== 'mias' && estado === 'todos' ? deSouly : []),
    ...(origen !== 'souly' ? modelos.filter(m => estado === 'todos' || m.estado === estado) : []),
  ].filter(m => (!categoria || m.categoria === categoria) && m.nombre.toLowerCase().includes(busca.trim().toLowerCase()))
  const paginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)
  const deLaPagina = visibles.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  function duplicar(m) {
    const pub = versionPublicada(m) || m.versiones[m.versiones.length - 1]
    const copia = {
      ...m,
      id: nuevoId(),
      nombre: `${m.nombre} (copia)`,
      base: false,
      origenId: m.id,
      /* La copia arranca INACTIVA, que es el borrador: activarla sin mirarla sería tener dos
         plantillas iguales con nombres distintos. */
      estado: 'inactivo',
      versiones: [{ v: 1, texto: pub?.texto || '', estado: 'publicada', publicadaPor: usuario, fecha: dias(0) }],
    }
    setModelos(prev => [...prev, copia])
    anotarConfig(`Duplicó el modelo «${m.nombre}»`)
    navigate(`/documentos/configuracion/plantillas/${copia.id}`)
  }

  /* USAR UNA DE SOULY abre el editor con ella cargada, como plantilla nueva: ahí se revisa o se
     cambia, y recién al guardar queda en las de la empresa. Nada se crea con un solo clic. */
  const usarSouly = s => navigate(`/documentos/configuracion/plantillas/nuevo?desde=${s.id}`)

  /* CARGAR PLANTILLAS (16 oct 2026): un solo botón abre el modal donde se sueltan los Word y,
     para quien todavía no tiene uno, se descarga la plantilla modelo. Ver `ModalCargarPlantillas`. */
  function guardarSubidas(filas, estadoNuevo) {
    const nuevas = filas.filter(f => !f.error).map(f => ({
      id: nuevoId(), nombre: f.nombre.trim() || f.archivo, categoria: f.categoria, disponibleSolicitud: false, sensible: false,
      estado: estadoNuevo, base: false,
      versiones: [{ v: 1, texto: f.texto, estado: 'publicada', publicadaPor: usuario, fecha: dias(0) }],
    }))
    setModelos(prev => [...prev, ...nuevas])
    for (const m of nuevas) anotarConfig(`Subió la plantilla «${m.nombre}» desde Word${estadoNuevo === 'activo' ? '' : ' como borrador'}`)
    setCargando(false)
    setOrigen('mias'); setEstado('todos'); setPag(1)
    setAviso(`${nuevas.length === 1 ? 'Se guardó 1 plantilla' : `Se guardaron ${nuevas.length} plantillas`} ${estadoNuevo === 'activo' ? 'activas: ya aparecen en Emitir' : 'como borrador: actívelas cuando estén listas'}.`)
    setTimeout(() => setAviso(''), 5000)
  }

  function alternar(m) {
    setModelos(prev => prev.map(x => (x.id === m.id ? { ...x, estado: x.estado === 'activo' ? 'inactivo' : 'activo' } : x)))
    anotarConfig(`${m.estado === 'activo' ? 'Desactivó' : 'Activó'} el modelo «${m.nombre}»`)
  }

  function eliminar(m) {
    setModelos(prev => prev.filter(x => x.id !== m.id))
    anotarConfig(`Eliminó el modelo «${m.nombre}», que no tenía documentos emitidos`)
    setBorrando(null)
  }

  return (
    <>
      <div className="xc-herramientas">
        <label className="xc-buscar">
          <Search size={14} aria-hidden="true" />
          <input className="pl-input" type="search" placeholder="Buscar por nombre…" value={busca} onChange={e => { setBusca(e.target.value); setPag(1) }} aria-label="Buscar modelo" />
        </label>
        <div style={{ width: 220 }}>
          <Desplegable valor={categoria} onCambio={v => { setCategoria(v); setPag(1) }} ariaLabel="Tipo" opciones={[{ valor: '', etiqueta: 'Todos los tipos' }, ...Object.entries(CATEGORIAS).filter(([k]) => k !== 'otro' || modelos.some(m => m.categoria === 'otro')).map(([k, c]) => ({ valor: k, etiqueta: `${c.plural} (${modelos.filter(m => m.categoria === k).length})` }))]} />
        </div>
        <div style={{ width: 220 }}>
          <Desplegable valor={origen} onCambio={v => { setOrigen(v); setPag(1) }} ariaLabel="De quién es la plantilla" opciones={[
            { valor: '', etiqueta: 'Todas las plantillas' },
            { valor: 'souly', etiqueta: `Plantillas de Souly (${PLANTILLAS_SOULY.length})` },
            { valor: 'mias', etiqueta: `Mis plantillas (${modelos.length})` },
          ]} />
        </div>
        <div className="xc-seg" role="group" aria-label="Estado">
          {[['todos', 'Todos'], ['activo', 'Activos'], ['inactivo', 'Inactivos']].map(([k, t]) => (
            <button key={k} type="button" className={estado === k ? 'on' : ''} aria-pressed={estado === k} onClick={() => { setEstado(k); setPag(1) }}>{t}</button>
          ))}
        </div>
        <button type="button" className="dc-btn" style={{ marginLeft: 'auto' }} onClick={() => setCargando(true)} title="Suba uno o varios Word: cada uno se vuelve una plantilla">
          <Upload size={14} aria-hidden="true" /> Cargar plantillas
        </button>
        <button type="button" className="pl-btn-new" onClick={() => navigate('/documentos/configuracion/plantillas/nuevo')}>
          <Plus size={14} color="#00E091" /> Nuevo modelo
        </button>
      </div>
      {aviso && <p className="xd-guardado" role="status" style={{ margin: '0 0 12px' }}><CheckCircle2 size={15} /> {aviso}</p>}

      {visibles.length === 0 ? (
        <div className="dc-tarjeta">
          <Vacio Icono={Library} titulo="Ningún modelo coincide" texto={`Se buscó «${busca || 'todo'}» en ${categoria ? CATEGORIAS[categoria]?.plural.toLowerCase() : 'todos los tipos'}, con estado ${estado === 'todos' ? 'cualquiera' : estado}.`}>
            <button type="button" className="dc-btn" onClick={() => { setBusca(''); setCategoria(''); setEstado('todos'); setOrigen('') }}>Limpiar filtros</button>
          </Vacio>
        </div>
      ) : (
        <div className="as-table-wrap xd-con-menu">
          <table className="as-table xc-tabla xd-tabla">
            <thead>
              <tr><th>Modelo</th><th>Tipo</th><th>Última edición</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr>
            </thead>
            <tbody>
              {deLaPagina.map(m => {
                if (m.souly) return (
                  <tr key={m.id} className="xd-fila-link" onClick={() => setViendo(m)}>
                    <td data-etq="Modelo">
                      <div className="xc-nombre">
                        <b>{m.nombre}</b>
                        <small><span className="xd-souly">Souly</span> Lista para usar o personalizar</small>
                      </div>
                    </td>
                    <td data-etq="Tipo"><span className="xd-tipo"><span style={{ background: CATEGORIAS[m.categoria]?.color }} aria-hidden="true" />{CATEGORIAS[m.categoria]?.label || 'Otro documento'}</span></td>
                    <td data-etq="Última edición"><span className="xc-nombre"><small>La mantiene Souly</small></span></td>
                    {/* Las de Souly no tienen estado: en su lugar, lo que se hace con ellas. */}
                    <td data-etq="Estado" onClick={e => e.stopPropagation()}>
                      <span className="xd-souly-acc">
                        <button type="button" className="dc-btn dc-btn-sm" onClick={() => setViendo(m)}><Eye size={13} aria-hidden="true" /> Ver</button>
                        <button type="button" className="dc-btn dc-btn-sm xd-souly-usar" onClick={() => usarSouly(m)} title="La abre en el editor: revísela, cámbiela si quiere y guárdela en sus plantillas"><Plus size={13} aria-hidden="true" /> Usar</button>
                      </span>
                    </td>
                    <td className="xd-acc" />
                  </tr>
                )
                const pub = versionPublicada(m)
                const n = usos[m.id] || 0
                const abrir = () => navigate(`/documentos/configuracion/plantillas/${m.id}`)
                return (
                  <tr key={m.id} className={`xd-fila-link${m.estado === 'activo' ? '' : ' inactivo'}`} onClick={abrir}>
                    <td data-etq="Modelo">
                      <div className="xc-nombre">
                        <b>{m.nombre}</b>
                        <small>
                          {m.origenSouly ? 'Desde Souly · ' : 'Propia · '}
                          {n === 0 ? 'sin emitidos' : `${n} ${n === 1 ? 'emitido' : 'emitidos'}`}
                        </small>
                      </div>
                    </td>
                    <td data-etq="Tipo"><span className="xd-tipo"><span style={{ background: CATEGORIAS[m.categoria]?.color }} aria-hidden="true" />{CATEGORIAS[m.categoria]?.label || 'Otro documento'}</span></td>
                    <td data-etq="Última edición">
                      {pub
                        ? <span className="xc-nombre"><b>{fechaCorta(pub.fecha)}</b><small>{pub.publicadaPor}</small></span>
                        : <Etiqueta tono="ambar" titulo="Ábrala y guárdela para poder usarla">Sin guardar</Etiqueta>}
                    </td>
                    <td data-etq="Estado"><Etiqueta tono={m.estado === 'activo' ? 'verde' : 'gris'}>{m.estado === 'activo' ? 'Activo' : 'Inactivo'}</Etiqueta></td>
                    <td className="xd-acc" onClick={e => e.stopPropagation()}>
                      <MenuAcciones etiqueta={`Acciones de ${m.nombre}`} items={[
                        { label: 'Editar', Icono: Pencil, onClick: abrir },
                        { label: 'Duplicar', Icono: Copy, titulo: 'Crea otra plantilla a partir de esta, para una variante', onClick: () => duplicar(m) },
                        { label: m.estado === 'activo' ? 'Desactivar' : 'Activar', Icono: Power, titulo: m.estado === 'activo' ? 'Un modelo inactivo no aparece al emitir' : 'Vuelve a aparecer al emitir', onClick: () => alternar(m) },
                        /* ELIMINAR SÓLO LO QUE NO TIENE HISTORIA (RF-08), y al pulsarlo dice por
                           qué no: un botón apagado sin explicación se lee como una falla. */
                        { label: 'Eliminar', Icono: Trash2, peligro: true, onClick: () => (n > 0 ? setBloqueado({ m, n }) : setBorrando(m)) },
                      ]} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Paginacion page={pagina} setPage={setPag} total={visibles.length} perPage={POR_PAGINA} nombre="plantillas" nombreUno="plantilla" />
        </div>
      )}

      {viendo && (
        <Modal titulo={viendo.nombre} Icono={Eye} onCerrar={() => setViendo(null)} ancho={720}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setViendo(null)}>Cerrar</button>
            <button type="button" className="pl-btn-save" onClick={() => usarSouly(viendo)}><Plus size={13} /> Usar esta plantilla</button>
          </>}
        >
          <p className="xd-nota" style={{ marginTop: 0 }}>
            Plantilla de Souly. «Usar» la abre en el editor: puede dejarla como está o cambiarla, y al guardar queda en sus plantillas.
            {viendo.enUso && ' Ya tiene una copia en sus plantillas.'}
          </p>
          <HojaDocumento texto={(versionPublicada(viendo) || viendo.versiones[0])?.texto} compacta etiqueta={`Texto de ${viendo.nombre}`} />
        </Modal>
      )}

      {cargando && <ModalCargarPlantillas tipos={CATEGORIAS} onCerrar={() => setCargando(false)} onGuardar={guardarSubidas} />}

      {bloqueado && (
        <Modal titulo="No se puede eliminar" Icono={Trash2} onCerrar={() => setBloqueado(null)} ancho={460}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setBloqueado(null)}>Cerrar</button>
            {bloqueado.m.estado === 'activo' && <button type="button" className="pl-btn-save" onClick={() => { alternar(bloqueado.m); setBloqueado(null) }}>Desactivarlo</button>}
          </>}
        >
          <p className="xd-nota">«<b>{bloqueado.m.nombre}</b>» tiene {bloqueado.n} {bloqueado.n === 1 ? 'documento emitido' : 'documentos emitidos'}. Borrarlo los dejaría sin origen (RF-08); puede desactivarlo para que no aparezca al emitir.</p>
        </Modal>
      )}

      {borrando && (
        <Modal titulo="Eliminar modelo" Icono={Trash2} onCerrar={() => setBorrando(null)} ancho={440}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setBorrando(null)}>Cancelar</button>
            <button type="button" className="pl-btn-save" onClick={() => eliminar(borrando)}>Eliminar</button>
          </>}
        >
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--text-heading)' }}>
            Se eliminará «{borrando.nombre}». No tiene documentos emitidos, así que no deja nada sin origen. El cambio queda registrado en la bitácora.
          </p>
        </Modal>
      )}
    </>
  )
}

/* EL TIPO DE UN WORD SUBIDO, ADIVINADO por su nombre y su comienzo: «Certificado de trabajo.docx»
   es un certificado. Un tipo propio se reconoce por su nombre; si nada coincide, «otro». Se puede
   cambiar en la fila antes de guardar. */
const plano = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
function adivinarTipo(texto, tipos) {
  const t = plano(texto)
  const propio = Object.entries(tipos).find(([k, c]) => !['certificado', 'memorandum', 'contrato', 'otro'].includes(k) && t.includes(plano(c.label)))
  if (propio) return propio[0]
  if (t.includes('CERTIFIC') || t.includes('CONSTANCIA')) return 'certificado'
  if (t.includes('MEMOR')) return 'memorandum'
  if (t.includes('CONTRATO') || t.includes('ADENDA')) return 'contrato'
  return tipos.otro ? 'otro' : 'certificado'
}

/* ── CARGAR PLANTILLAS (16 oct 2026) ──────────────────────────────────────
   Un solo modal para todo el camino del Word. Primero, dónde soltar los archivos —uno o varios—
   y, para quien todavía no tiene uno, «Descargar plantilla modelo» del tipo que elija: trae un
   texto de ejemplo y los datos de la persona como marcadores. Después, una fila por archivo con
   el nombre (sale del archivo), el tipo adivinado y lo que se reconoció; lo que no coincide se
   revisa con el mismo modal del editor. «Guardar y activar» espera a que no quede nada por
   revisar; «Guardar como borradores» no, y lo pendiente queda como texto. */
const ACEPTA = '.docx,.txt,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function ModalCargarPlantillas({ tipos, onCerrar, onGuardar }) {
  const [filas, setFilas] = useState([])
  const [leyendo, setLeyendo] = useState(false)
  const [arrastrando, setArrastrando] = useState(false)
  const [modelo, setModelo] = useState('certificado')
  const [revisando, setRevisando] = useState(null) // id de la fila
  const cambiar = (id, cambios) => setFilas(prev => prev.map(f => (f.id === id ? { ...f, ...cambios } : f)))
  const validas = filas.filter(f => !f.error)
  const pendientes = validas.filter(f => f.desconocidos.length).length
  const fila = filas.find(f => f.id === revisando)
  const opcionesTipo = Object.entries(tipos).map(([k, c]) => ({ valor: k, etiqueta: c.label }))

  async function leer(lista) {
    const archivos = [...(lista || [])]
    if (!archivos.length) return
    setLeyendo(true)
    const nuevas = await Promise.all(archivos.map(async f => {
      const base = { id: nuevoId(), archivo: f.name, nombre: f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() }
      try {
        const crudo = /\.docx$/i.test(f.name) ? await textoDeDocx(f) : await f.text()
        const r = deMarcadores(crudo)
        if (!r.texto.trim()) throw new Error('vacío')
        return { ...base, categoria: adivinarTipo(`${f.name} ${r.texto.slice(0, 300)}`, tipos), texto: r.texto, reconocidos: r.reconocidos, desconocidos: r.desconocidos, comoTexto: 0 }
      } catch {
        return { ...base, error: true }
      }
    }))
    setFilas(prev => [...prev, ...nuevas])
    setLeyendo(false)
  }

  async function bajarModelo() {
    const c = tipos[modelo]
    const blob = await crearDocx(aMarcadores(textoDePartida(modelo, c.label.toUpperCase())))
    descargarBlob(`Plantilla modelo de ${c.label.toLowerCase()}.docx`, blob)
  }

  const soltar = {
    onDragOver: e => { e.preventDefault(); setArrastrando(true) },
    onDragLeave: () => setArrastrando(false),
    onDrop: e => { e.preventDefault(); setArrastrando(false); leer(e.dataTransfer.files) },
  }
  const elegir = <input type="file" multiple accept={ACEPTA} onChange={e => { leer(e.target.files); e.target.value = '' }} hidden />

  const pie = filas.length ? (
    <>
      <span className="xu-pie-nota">{pendientes ? `${pendientes === 1 ? 'Una plantilla tiene' : `${pendientes} plantillas tienen`} marcadores por revisar.` : validas.length ? 'Todo listo.' : ''}</span>
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
      <button type="button" className="dc-btn" disabled={!validas.length} onClick={() => onGuardar(filas, 'inactivo')}>Guardar como borradores</button>
      <button type="button" className="pl-btn-save" disabled={!validas.length || pendientes > 0} title={pendientes ? 'Revise primero los marcadores que no coinciden' : undefined} onClick={() => onGuardar(filas, 'activo')}>Guardar y activar</button>
    </>
  ) : <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>

  return (
    <>
      <Modal titulo={filas.length ? `Cargar plantillas · ${filas.length === 1 ? '1 archivo' : `${filas.length} archivos`}` : 'Cargar plantillas'} Icono={Upload} onCerrar={onCerrar} ancho={filas.length ? 900 : 640} pie={pie}>
        {!filas.length ? (
          <div className="xd-cargar">
            <label className={`xd-cargar-zona${arrastrando ? ' on' : ''}`} {...soltar}>
              <span className="xd-cargar-ico" aria-hidden="true"><Upload size={24} /></span>
              <b>{leyendo ? 'Leyendo los archivos…' : 'Arrastre aquí sus plantillas en Word'}</b>
              <span>o haga clic para elegirlas · puede subir varias a la vez · .docx o .txt</span>
              {elegir}
            </label>
            <div className="xd-cargar-modelo">
              <span className="xd-cargar-modelo-ico" aria-hidden="true"><FileText size={18} /></span>
              <div className="xd-cargar-modelo-txt">
                <b>¿Todavía no tiene la plantilla?</b>
                <span>Descargue la plantilla modelo: trae un texto de ejemplo y los datos de la persona marcados, como [NOMBRE COMPLETO]. Escriba su texto en Word y súbala aquí.</span>
              </div>
              <div className="xd-cargar-modelo-acc">
                <div style={{ width: 170 }}><Desplegable valor={modelo} onCambio={setModelo} ariaLabel="Tipo de la plantilla modelo" opciones={opcionesTipo} /></div>
                <button type="button" className="dc-btn" onClick={bajarModelo}><Download size={14} aria-hidden="true" /> Descargar plantilla modelo</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="xd-nota" style={{ marginTop: 0 }}>Cada Word se guarda como una plantilla en Mis plantillas. Revise el nombre y el tipo; los marcadores como [NOMBRE COMPLETO] ya se convirtieron en datos.</p>
            <ul className="xd-subidas">
              {filas.map(f => (
                <li key={f.id} className={`xd-subida${f.error ? ' error' : ''}`}>
                  <span className="xd-subida-ico" aria-hidden="true"><FileText size={18} /></span>
                  <div className="xd-subida-datos">
                    <input className="pl-input" value={f.nombre} onChange={e => cambiar(f.id, { nombre: e.target.value })} aria-label={`Nombre de la plantilla de ${f.archivo}`} disabled={f.error} />
                    <small>{f.archivo}</small>
                  </div>
                  <div className="xd-subida-tipo">
                    {!f.error && <Desplegable valor={f.categoria} onCambio={v => cambiar(f.id, { categoria: v })} ariaLabel={`Tipo de ${f.nombre}`} opciones={opcionesTipo} />}
                  </div>
                  <div className="xd-subida-estado">
                    {f.error ? <span className="xd-subida-mal"><TriangleAlert size={13} aria-hidden="true" /> No se pudo leer: use un .docx o .txt con texto</span>
                      : f.desconocidos.length ? (
                        <>
                          <span className="xd-subida-ambar"><TriangleAlert size={13} aria-hidden="true" /> {f.desconocidos.length === 1 ? '1 marcador' : `${f.desconocidos.length} marcadores`} por revisar</span>
                          <button type="button" className="dc-btn dc-btn-sm" onClick={() => setRevisando(f.id)}>Revisar</button>
                        </>
                      ) : <span className="xd-subida-ok"><CheckCircle2 size={13} aria-hidden="true" /> {f.reconocidos.length === 1 ? '1 dato reconocido' : `${f.reconocidos.length} datos reconocidos`}{f.comoTexto ? ` · ${f.comoTexto} como texto` : ''}</span>}
                  </div>
                  <button type="button" className="xd-subida-quitar" onClick={() => setFilas(prev => prev.filter(x => x.id !== f.id))} aria-label={`No subir ${f.archivo}`} title="No subir este archivo"><X size={15} /></button>
                </li>
              ))}
            </ul>
            <label className={`xd-cargar-mas${arrastrando ? ' on' : ''}`} {...soltar}>
              <Plus size={14} aria-hidden="true" /> {leyendo ? 'Leyendo…' : 'Agregar más archivos'}
              {elegir}
            </label>
          </>
        )}
      </Modal>

      {fila && (
        <ModalMarcadores
          nombreArchivo={fila.archivo}
          reconocidos={fila.reconocidos}
          desconocidos={fila.desconocidos}
          onCerrar={() => setRevisando(null)}
          onAplicar={elecciones => {
            const elegidos = Object.values(elecciones).filter(Boolean)
            cambiar(fila.id, {
              texto: aplicarMarcadores(fila.texto, elecciones),
              reconocidos: [...new Set([...fila.reconocidos, ...elegidos])],
              desconocidos: [],
              comoTexto: Object.values(elecciones).length - elegidos.length,
            })
            setRevisando(null)
          }}
        />
      )}
    </>
  )
}

/* ── LA NUMERACIÓN CORRELATIVA (RF-07, RN-15) ─────────────────────────────
   Un prefijo y una cantidad de dígitos por categoría. Se edita un borrador y se guarda de una vez:
   cambiar un prefijo a medio escribir no puede dejar un CITE a medias en el próximo certificado. */
const soloNumero = v => v.replace(/\D/g, '')
const ejemplo = cfg => (cfg.formato || '{prefijo}-{n}/{gestion}')
  .replace('{prefijo}', cfg.prefijo || '¿?')
  .replace('{n}', '1'.padStart(Number(cfg.digitos) || 1, '0'))
  .replace('{gestion}', new Date().getFullYear())

export function Numeracion() {
  const { parametros, setParametros, anotarConfig } = useDocumentacion()
  const CATEGORIAS = tiposDoc(parametros)
  const base = () => Object.fromEntries(Object.keys(CATEGORIAS).map(c => [c, { ...numeracionDe(parametros, c) }]))
  const [num, setNum] = useState(base)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')

  const setCampo = (cat, k, v) => { setNum(prev => ({ ...prev, [cat]: { ...prev[cat], [k]: v } })); setGuardado(false) }
  const normal = Object.fromEntries(Object.entries(num).map(([k, v]) => [k, { ...v, prefijo: v.prefijo.trim().toUpperCase(), digitos: Math.min(8, Math.max(1, Number(v.digitos) || 4)) }]))
  const sucio = JSON.stringify(normal) !== JSON.stringify(base())

  const guardar = () => {
    if (Object.values(normal).some(c => !c.prefijo)) return setError('Cada tipo necesita su prefijo: sin él no hay CITE.')
    setError('')
    setParametros(prev => ({ ...prev, numeracion: { ...prev.numeracion, ...normal } }))
    anotarConfig('Cambió la numeración de los documentos emitidos')
    setNum(normal)
    setGuardado(true)
  }

  return (
    <>
      <section className="dc-tarjeta" style={{ maxWidth: 760 }}>
        <div className="dc-tarjeta-cab"><h2>Numeración correlativa</h2></div>
        <div className="dc-tarjeta-cuerpo" style={{ gap: 0 }}>
          {Object.entries(CATEGORIAS).map(([cat, c]) => {
            const cfg = num[cat]
            return (
              <div key={cat} className="xd-numeracion">
                <b style={{ fontSize: 12.5, color: 'var(--text-heading)' }}>{c.plural}</b>
                <span className="xd-fila" style={{ gap: 6, flexWrap: 'nowrap' }}>
                  <span className="xd-ayuda">Prefijo</span>
                  <input className="pl-input" style={{ width: 90 }} aria-label={`Prefijo de ${c.plural}`} value={cfg.prefijo} onChange={e => setCampo(cat, 'prefijo', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} />
                  <span className="xd-ayuda">Dígitos</span>
                  <input className="pl-input" style={{ width: 52 }} inputMode="numeric" aria-label={`Dígitos de ${c.plural}`} value={cfg.digitos} onChange={e => setCampo(cat, 'digitos', soloNumero(e.target.value).slice(0, 1))} />
                </span>
                <label className="xd-mini" title="Empieza en 1 cada gestión"><input type="checkbox" checked={cfg.reinicioAnual} onChange={e => setCampo(cat, 'reinicioAnual', e.target.checked)} /> Reinicia cada año</label>
                <span className="xd-ejemplo" aria-label={`El próximo ${c.label.toLowerCase()} de una gestión nueva saldría con`}>{ejemplo(cfg)}</span>
              </div>
            )
          })}
          <p className="xd-nota" style={{ marginTop: 10 }}>Un número no se reutiliza nunca, ni siquiera si el documento se anula (RN-15).</p>
        </div>
      </section>
      <div className="xd-guardar">
        {error ? <span className="xd-sucio" role="alert">{error}</span>
          : guardado && !sucio ? <span className="xd-guardado" role="status"><CheckCircle2 size={15} /> Cambios guardados</span>
            : sucio ? <span className="xd-sucio">Hay cambios sin guardar</span> : <span style={{ marginRight: 'auto' }} />}
        <button type="button" className="pl-btn-save" disabled={!sucio} onClick={guardar}>Guardar numeración</button>
      </div>
    </>
  )
}
