import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, ChevronRight, Folder, LayoutGrid, List as ListIcon, Upload, Download, FilePlus2, Eye, RefreshCw, ShieldCheck, Check, X, Trash2, Search,
  FolderOpen, Lock, FileText, History, Undo2, FileSignature, Archive, ListPlus, MinusCircle,
} from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import {
  EstadoChip, EstadoContratoChip, EstadoEmitidoChip, SensibilidadChip, BarraAvance, Modal, Vacio, MenuAcciones,
} from '../../components/documentacion/comunes'
import { descargarTexto } from '../../components/documentacion/utilidades'
import { zipDeExpedientes } from '../../components/documentacion/expedienteZip'
import { descargarBlob, nombreSeguro } from '../../components/documentacion/zip'
import Avatar from '../../components/personas/Avatar'
import Desplegable from '../../components/layout/Desplegable'
import SelectorDocumento from '../../components/documentacion/SelectorDocumento'
import SelectorFecha from '../../components/layout/SelectorFecha'
import { useArchivoLocal } from '../../hooks/useArchivoLocal'
import PaginasPdf from '../../components/documentacion/PaginasPdf'
import { leerArchivo, guardarArchivo, nuevaClaveArchivo } from '../../utils/archivosLocales'
import { deducirSubtipo, extensionDe } from '../../components/documentacion/deducir'
import {
  ESTADOS, CATEGORIAS, MODALIDADES, ACCIONES_BITACORA, fechaCorta, fechaNum, diasHasta,
  estadoVersion, versionActual, estadoContrato, rellenar, normalizarNombre, sumarMeses, iso, hoy, nombreEmitido,
} from '../../data/documentacionData'
import CargarDocumentoModal from './CargarDocumentoModal'
import PanelEmision from './PanelEmision'
import HojaEmitido from '../../components/documentacion/HojaEmitido'
import './expediente.css'

/* ── EL EXPEDIENTE DEL COLABORADOR (pantalla 5 · RF-17 a RF-25, revisada) ─
   CARPETAS EN FILA (propuesta A3). Al abrir a una persona se ven sus carpetas —una por tipo de
   documento, más contratos, emitidos y papelera—, compactas, y cada una dice desde afuera cuántos
   documentos tiene y, en su insignia, cuántos necesitan atención. Un clic la abre en su propia
   ventana, con cada documento como una hoja.
   Buscar o filtrar salta las carpetas y muestra lo que coincide en todas a la vez. El historial,
   que se consulta de vez en cuando, se abre aparte con un botón.

   LA AUSENCIA ES UN DATO (principio 1): un requisito sin cumplir es una fila visible con su botón
   de cargar, no un hueco que hay que deducir (RF-17).

   LOS REQUISITOS SE DECIDEN ACÁ. Lo que el subtipo exige a todo el personal ya viene; lo que se
   le pide sólo a esta persona se agrega con «Agregar requisito». Ya no hay perfiles que configurar
   en otra pantalla para que algo aparezca en esta.

   EMITIR NO SACA DE LA PANTALLA: se abre la emisión en un modal con la persona ya puesta.

   EL ESTADO SE LEE DE `checklistDe` y de `estadoVersion`, nunca se calcula acá: si esta pantalla
   y la bandeja dijeran cosas distintas del mismo carnet, el módulo dejaría de servir.

   LOS MODALES DE CARGAR Y VER VIVEN EN LA URL (`?cargar=`, `?doc=`) porque la bandeja y los
   reportes llegan hasta acá con la acción ya elegida (historia 1). */

/* ── LAS CARPETAS ─────────────────────────────────────────────────────────
   Nadie las crea a mano para cada persona: CADA CARPETA ES UN TIPO DE DOCUMENTO de la empresa
   (Configuración › Tipos de documento), en el mismo orden, y un tipo nuevo aparece como carpeta
   en todos los expedientes. Se suman tres que pone el sistema: contratos, lo emitido y la
   papelera. El color sale del orden del tipo y no se guarda: es para distinguirlas de un
   vistazo, no un dato que alguien tenga que elegir. */
const PALETA = [
  { osc: '#3E6FC4', cla: '#D4E2F8', tin: '#2D579E' },
  { osc: '#7A55C8', cla: '#E4DBF8', tin: '#5B3DA0' },
  { osc: '#169A86', cla: '#CDEFE8', tin: '#0F7062' },
  { osc: '#C27A12', cla: '#F6E3C2', tin: '#8A5608' },
  { osc: '#2E8B57', cla: '#D1EEDD', tin: '#1F6B41' },
  { osc: '#B04A3A', cla: '#F5DCD6', tin: '#8A3326' },
]
const FIJAS = {
  contratos: { osc: '#0C2D40', cla: '#D5DEE7', tin: '#0C2D40' },
  emitidos: { osc: '#B5487A', cla: '#F2D6E3', tin: '#8E3360' },
  historial: { osc: '#5A6B7C', cla: '#E1E7ED', tin: '#3E4D5B' },
  papelera: { osc: '#8A97A5', cla: '#E3E8EE', tin: '#4B5B6B' },
  porclasificar: { osc: '#C27A12', cla: '#FBF1E0', tin: '#8A5608' },
}
/* LA INSIGNIA de la esquina dice desde afuera si la carpeta pide algo: cuántos documentos
   necesitan atención (en rojo), un ✓ si está al día, una raya si no se le exige nada. El detalle
   en palabras va en el `title` y en la etiqueta para lectores de pantalla (RNF-21). */
const insignia = pend => (pend === null ? { insignia: '—', insigniaTono: 'gris' }
  : pend > 0 ? { insignia: String(pend), insigniaTono: 'rojo' }
    : { insignia: '✓', insigniaTono: 'verde' })

/* Los números de arriba también filtran: un clic en «Faltan» muestra justo eso. */
const FILTROS_RAPIDOS = {
  _faltan: { label: 'Faltan', estados: ['faltante', 'rechazado'] },
  _revision: { label: 'Por revisar', estados: ['en_revision'] },
  _vencen: { label: 'Vencidos o por vencer', estados: ['vencido', 'por_vencer'] },
}
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`

/* Qué acción principal corresponde a cada estado. El botón dice lo que hay que hacer, no
   «Editar»: un faltante se carga, un vencido se renueva, uno en revisión se revisa. */
const ACCION = {
  faltante: { label: 'Subir', Icono: Upload },
  vencido: { label: 'Renovar', Icono: RefreshCw },
  por_vencer: { label: 'Renovar', Icono: RefreshCw },
  rechazado: { label: 'Subir otro', Icono: Upload },
}

export default function Expediente() {
  const { id, carpeta: carpetaRuta } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const doc = useDocumentacion()
  const {
    persona: personaDe, tipos, subtipos, documentos, emitidos, contratos, bitacora, parametros, modelos,
    checklist, avanceDe, revisar, exonerar, cargarDocumento, sinClasificar, subirSinClasificar, clasificar, descartarSinClasificar, eliminarDocumento, recuperarDocumento, registrarDescarga, quitarRequisito,
  } = doc
  const persona = personaDe(id)

  const [busca, setBusca] = useState('')
  const [filtroEstado, setFiltroEstado] = useState(() => params.get('estado') || '')
  const [rechazo, setRechazo] = useState(null)       // docId
  const [exonera, setExonera] = useState(null)       // subtipoId
  const [papelera, setPapelera] = useState(null)     // docId
  const [emitiendo, setEmitiendo] = useState(null)   // { categoria? }
  const [verEmitido, setVerEmitido] = useState(null) // emitido
  const [requisito, setRequisito] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [aviso, setAviso] = useState('')
  /* Lo que la carga directa no pudo resolver sola: abre el formulario con esos archivos puestos. */
  /* Lo recién subido, para el aviso con «Revisar fechas» y para la ventana que las corrige. */
  const [subida, setSubida] = useState(null)
  const [fechasDe, setFechasDe] = useState(null)
  const elegirArchivos = useRef(null)
  const subtipoElegido = useRef(null)
  /* Cada aviso de subida lleva su número, para que el que vence a los 9 s no borre a uno más nuevo. */
  const marcas = useRef(0)

  const abrir = (k, v) => { const q = Object.fromEntries(params.entries()); q[k] = v; setParams(q) }
  const cerrar = k => { const q = Object.fromEntries(params.entries()); delete q[k]; setParams(q, { replace: true }) }
  /* De la vista de un documento a cargar su versión nueva: un solo cambio de URL. Hecho en dos
     pasos, el segundo leía los parámetros de antes y dejaba la vista abierta debajo. */
  const pasarACargar = subtipoId => { const q = Object.fromEntries(params.entries()); delete q.doc; q.cargar = subtipoId; setParams(q, { replace: true }) }
  const cargarParam = params.get('cargar')
  const docParam = params.get('doc')

  /* Las filas: un requisito con o sin documento, más los documentos que no responden a ningún
     requisito (un certificado de curso que nadie exigió también es parte del expediente). */
  const filas = useMemo(() => {
    if (!persona) return []
    const cl = checklist(persona)
    const propios = documentos.filter(d => d.colaboradorId === persona.id && !d.eliminado)
    const out = cl.map(i => ({ key: `r-${i.subtipo.id}`, subtipo: i.subtipo, requisito: i.requisito, documento: i.documento, estado: i.estado, limite: i.limite, exigible: i.exigible, exoneracion: i.exoneracion }))
    for (const d of propios) {
      if (out.some(f => f.documento?.id === d.id)) continue
      const s = subtipos.find(x => x.id === d.subtipoId)
      out.push({ key: `d-${d.id}`, subtipo: s, requisito: null, documento: d, estado: estadoVersion(versionActual(d), s, parametros) })
    }
    return out.filter(f => f.subtipo)
  }, [persona, checklist, documentos, subtipos, parametros])

  if (!persona) {
    return (
      <div className="content-scroll">
        <div className="dc-tarjeta">
          <Vacio Icono={FolderOpen} titulo="No encontramos a este colaborador" texto="La persona no existe o ya no figura en el directorio.">
            <button type="button" className="dc-btn" onClick={() => navigate('/documentos/expedientes')}>Volver a Expedientes</button>
          </Vacio>
        </div>
      </div>
    )
  }

  /* RF-24 / RN-21: el expediente de quien se fue se cierra en solo lectura. Se consulta, se
     descarga y se audita; no se carga ni se edita. */
  const cerrado = persona.status === 'desvinculado'
  const avance = avanceDe(persona)
  const enPapelera = documentos.filter(d => d.colaboradorId === persona.id && d.eliminado)
  const susEmitidos = emitidos.filter(e => e.colaboradorId === persona.id)
  const susContratos = contratos.filter(c => c.colaboradorId === persona.id)
  const susEventos = bitacora.filter(b => b.colaboradorId === persona.id)
  const susSinConfirmar = susEmitidos.filter(e => e.estado === 'entregado').length
  const exigidos = new Set(filas.filter(f => f.requisito).map(f => f.subtipo.id))

  const texto = busca.trim().toLowerCase()
  const estadosFiltro = FILTROS_RAPIDOS[filtroEstado]?.estados || (filtroEstado ? [filtroEstado] : null)
  const visibles = filas.filter(f => {
    if (estadosFiltro && !estadosFiltro.includes(f.estado)) return false
    /* Un faltante con plazo corriendo no está en falta (RN-07): no cuenta en «Faltan». */
    if (filtroEstado === '_faltan' && f.estado === 'faltante' && !f.exigible) return false
    if (!texto) return true
    const v = versionActual(f.documento)
    return [f.subtipo.nombre, v?.archivo?.nombre, v?.archivo?.original, ESTADOS[f.estado]?.label, tipos.find(t => t.id === f.subtipo.tipoId)?.nombre]
      .some(x => String(x || '').toLowerCase().includes(texto))
  })
  const grupos = tipos
    .map(t => ({ tipo: t, filas: visibles.filter(f => f.subtipo.tipoId === t.id) }))
    .filter(g => g.filas.length)
    .map(g => ({ ...g, filas: [...g.filas].sort((a, b) => orden(a) - orden(b)) }))

  const cuantos = e => filas.filter(f => f.estado === e).length
  const filaDoc = docParam ? documentos.find(d => d.id === docParam) : null

  /* ── LAS CARPETAS DE ESTA PERSONA ── */
  const vigente = susContratos.find(c => c.tipo === 'contrato' && ['vigente', 'por_vencer'].includes(estadoContrato(c, parametros, contratos)))
  const misPendientes = sinClasificar.filter(x => x.colaboradorId === persona.id)
  const carpetas = [
    ...(misPendientes.length ? [{
      clave: 'porclasificar', nombre: 'Por clasificar', color: FIJAS.porclasificar,
      cuenta: plural(misPendientes.length, 'archivo', 'archivos'),
      insignia: String(misPendientes.length), insigniaTono: 'ambar',
      aviso: 'Falta indicar qué documento es', tono: 'ambar',
    }] : []),
    ...tipos
      .filter(t => t.activo || filas.some(f => f.subtipo.tipoId === t.id))
      .map((t, i) => {
        const fs = filas.filter(f => f.subtipo.tipoId === t.id).sort((a, b) => orden(a) - orden(b))
        const oblig = fs.filter(f => f.requisito?.obligatorio && f.estado !== 'exonerado')
        const cumplen = oblig.filter(f => ESTADOS[f.estado].cumple).length
        const conDoc = fs.filter(f => f.documento).length
        const faltan = fs.filter(f => f.estado === 'rechazado' || (f.estado === 'faltante' && f.exigible)).length
        const vencidos = fs.filter(f => f.estado === 'vencido').length
        const revision = fs.filter(f => f.estado === 'en_revision').length
        const pronto = fs.filter(f => f.estado === 'por_vencer')
          .map(f => ({ f, d: diasHasta(versionActual(f.documento).vencimiento) }))
          .sort((a, b) => a.d - b.d)[0]
        let aviso = 'Al día', tono = 'verde'
        if (!fs.length) { aviso = 'No se le exige'; tono = 'muted' }
        else if (faltan || vencidos || revision) {
          aviso = [faltan && plural(faltan, 'faltante', 'faltantes'), vencidos && plural(vencidos, 'vencido', 'vencidos'), revision && `${revision} por revisar`].filter(Boolean).join(' · ')
          tono = faltan || vencidos ? 'rojo' : 'azul'
        } else if (pronto) { aviso = `${pronto.f.subtipo.nombre} vence en ${plural(pronto.d, 'día', 'días')}`; tono = 'ambar' }
        const porClasificar = misPendientes.filter(x => x.tipoId === t.id).length
        if (porClasificar) { aviso = [`${porClasificar} por clasificar`, ...(fs.length && aviso !== 'Al día' && aviso !== 'No se le exige' ? [aviso] : [])].join(' · '); if (tono !== 'rojo') tono = 'ambar' }
        const pend = faltan + vencidos + revision + porClasificar
        return {
          clave: t.id, nombre: t.nombre, color: PALETA[i % PALETA.length],
          cuenta: !fs.length ? 'No se le exige' : oblig.length ? `${cumplen} de ${oblig.length} al día` : plural(conDoc, 'documento', 'documentos'),
          ...insignia(fs.length || porClasificar ? pend : null),
          aviso, tono, filas: fs,
        }
      }),
    {
      clave: 'contratos', nombre: 'Contratos', color: FIJAS.contratos,
      cuenta: plural(susContratos.length, 'contrato', 'contratos'),
      ...(vigente || cerrado ? insignia(susContratos.length ? 0 : null) : { insignia: '!', insigniaTono: 'rojo' }),
      aviso: vigente ? `${MODALIDADES[vigente.modalidad]}${vigente.fin ? ` hasta el ${fechaCorta(vigente.fin)}` : ''}` : cerrado ? 'Sin contrato vigente' : 'Sin contrato vigente',
      tono: vigente ? 'muted' : cerrado ? 'muted' : 'rojo',
    },
    /* LO QUE LA EMPRESA LE ENTREGÓ (Documentación v2): todo lo emitido a esta persona se archiva
       acá solo, con su estado y su confirmación. La clave sigue siendo «emitidos» por los enlaces. */
    {
      clave: 'emitidos', nombre: 'Recibidos', color: FIJAS.emitidos,
      cuenta: plural(susEmitidos.length, 'documento', 'documentos'),
      ...(susSinConfirmar ? { insignia: String(susSinConfirmar), insigniaTono: 'ambar' } : { insignia: String(susEmitidos.length), insigniaTono: 'gris' }),
      aviso: susEmitidos.length
        ? [Object.keys(CATEGORIAS).map(k => { const n = susEmitidos.filter(e => e.categoria === k).length; return n ? `${n} ${(n === 1 ? CATEGORIAS[k].label : CATEGORIAS[k].plural).toLowerCase()}` : null }).filter(Boolean).join(' · '), susSinConfirmar ? `${susSinConfirmar} sin confirmar` : null].filter(Boolean).join(' · ')
        : 'Todavía no se le emitió nada',
      tono: 'muted',
    },
    /* SU HISTORIA: la bitácora de esta persona leída como línea de tiempo. Era una ventana que se
       abría con un botón; ahora es una carpeta más, que se enlaza y se filtra. */
    {
      clave: 'historial', nombre: 'Historial', color: FIJAS.historial,
      cuenta: plural(susEventos.length, 'movimiento', 'movimientos'),
      insignia: String(susEventos.length), insigniaTono: 'gris',
      aviso: susEventos.length ? `Último: ${fechaCorta(susEventos[0].fecha)}` : 'Sin movimientos todavía',
      tono: 'muted',
    },
    {
      clave: 'papelera', nombre: 'Papelera', color: FIJAS.papelera,
      cuenta: enPapelera.length ? plural(enPapelera.length, 'documento', 'documentos') : 'Vacía',
      insignia: String(enPapelera.length), insigniaTono: 'gris',
      aviso: enPapelera.length ? `Se recuperan durante ${parametros.papeleraDias} días` : 'Vacía',
      tono: 'muted',
    },
  ]
  /* La carpeta va en la ruta; `?carpeta=` se sigue leyendo para los enlaces que ya existían. */
  const carpetaParam = carpetaRuta || params.get('carpeta')
  const carpeta = carpetas.find(c => c.clave === carpetaParam) || null
  const filtrando = !!texto || !!filtroEstado

  /* Los cuatro números de arriba, de la misma checklist que la barra de avance. */
  const nFaltan = filas.filter(f => f.estado === 'rechazado' || (f.estado === 'faltante' && f.exigible)).length
  const nRevision = cuantos('en_revision')
  const nVencen = cuantos('vencido') + cuantos('por_vencer')
  const rapidos = [
    { clave: '', titulo: 'Al día', valor: avance.pct === null ? '—' : `${avance.pct}%`, tono: 'navy' },
    { clave: '_revision', titulo: 'Por revisar', valor: nRevision, tono: 'azul' },
    { clave: '_faltan', titulo: 'Faltan', valor: nFaltan, tono: 'rojo' },
    { clave: '_vencen', titulo: 'Vencidos o por vencer', valor: nVencen, tono: 'ambar' },
  ]

  /* Las opciones para clasificar, ordenadas como el expediente: carpeta por carpeta con su color,
     la carpeta donde se está primero, y arriba de todo lo que le falta a la persona —es lo más
     probable que se esté subiendo—. «Documento agregado» no va en la lista: es «Otro», con nombre. */
  const opcionesClasificar = tipoId => {
    const activosSub = subtipos.filter(x => x.activo && x.id !== SUB_OTRO && tipos.find(t => t.id === x.tipoId)?.activo)
    const falta = new Set(filas.filter(f => ['faltante', 'rechazado'].includes(f.estado)).map(f => f.subtipo.id))
    const tiposConDocs = tipos.filter(t => t.activo && activosSub.some(x => x.tipoId === t.id))
    const ordenados = [...tiposConDocs.filter(t => t.id === tipoId), ...tiposConDocs.filter(t => t.id !== tipoId)]
    const grupos = ordenados.map(t => ({
      clave: t.id, nombre: t.nombre, color: carpetas.find(c => c.clave === t.id)?.color,
      items: activosSub.filter(x => x.tipoId === t.id).map(x => ({ id: x.id, nombre: x.nombre, falta: falta.has(x.id) })),
    }))
    const faltan = grupos.flatMap(g => g.items.filter(x => x.falta).map(x => ({ ...x, carpeta: g.nombre, color: g.color })))
    const otro = !!subtipos.find(x => x.id === SUB_OTRO && x.activo) && !!tipos.find(t => t.id === 't-agregados')?.activo
    return { grupos, faltan, otro }
  }
  const alClasificar = (pendienteId, subtipoId, nombre = '') => {
    const docId = clasificar(pendienteId, subtipoId, nombre)
    const sub = subtipos.find(x => x.id === subtipoId)
    if (!docId || !sub) return
    const emision = iso(hoy())
    const marca = ++marcas.current
    setSubida({ items: [{ docId, sub: nombre ? { ...sub, nombre } : sub, emision, vencimiento: sub.vence ? sumarMeses(emision, sub.vigenciaMeses) : '' }], marca, clasificado: true })
    setTimeout(() => setSubida(a => (a?.marca === marca ? null : a)), 9000)
    // Clasificado el último pendiente, la carpeta «Por clasificar» deja de existir: se vuelve a las carpetas.
    if (carpeta?.clave === 'porclasificar' && misPendientes.length <= 1) navigate(`/documentos/expedientes/${persona.id}`)
  }

  const avisar = t => { setAviso(t); setTimeout(() => setAviso(''), 3200) }

  /* ── CARGAR SIN FORMULARIO ────────────────────────────────────────────────
     «Subir documento» —en la cabecera y en el recuadro de la carpeta—, «Subir» y «Renovar» abren
     directo el selector
     de archivos del equipo y el archivo se carga al momento: la carpeta ya dice dónde va, y qué
     documento es se deduce —el de la tarjeta, el que nombra el archivo o el primero que falta—.
     La emisión queda con la fecha de hoy y el vencimiento con la vigencia del documento.
     SE SUBE PRIMERO Y SE CLASIFICA DESPUÉS. Lo que no se reconoce no abre ninguna ventana: queda
     «por clasificar», como una tarjeta más de la carpeta, y ahí mismo se elige qué documento es. */
  const elegirArchivo = subtipoId => {
    if (cerrado) return
    subtipoElegido.current = subtipoId || null
    elegirArchivos.current?.click()
  }
  const subirDirecto = async (files, subtipoFijo) => {
    const tipoId = carpeta?.filas ? carpeta.clave : ''
    const candidatos = subtipos.filter(x => x.activo && (!tipoId || x.tipoId === tipoId))
    /* Un archivo que no dice qué es sólo completa lo que FALTA. Una renovación —vencido, por
       vencer— no se adivina: se hace desde «Renovar» de su tarjeta, que sabe cuál es. */
    /* Fuera de una carpeta no se adivina entre todo lo que falta: un archivo anónimo subido desde
       la cabecera queda por clasificar. Dentro de una, sí: lo que falta ahí es lo esperable. */
    const queFaltan = (carpeta?.filas || []).filter(f => ['faltante', 'rechazado'].includes(f.estado)).map(f => f.subtipo.id)
    const listos = [], dudosos = [], usados = new Set()
    for (const file of files) {
      const sid = subtipoFijo || deducirSubtipo(file.name, candidatos) || queFaltan.find(x => !usados.has(x)) || (candidatos.length === 1 ? candidatos[0].id : '')
      const sub = subtipos.find(x => x.id === sid)
      const ext = extensionDe(file.name)
      if (!sub || !sub.formatos.includes(ext) || file.size / 1048576 > sub.tamanoMaxMB) { dudosos.push(file); continue }
      usados.add(sid)
      listos.push({ file, sub, ext })
    }
    const subidos = []
    for (const { file, sub, ext } of listos) {
      const clave = nuevaClaveArchivo()
      const guardado = await guardarArchivo(clave, file)
      const emision = iso(hoy())
      const yaEsta = !sub.varios && documentos.some(d => d.colaboradorId === persona.id && d.subtipoId === sub.id && !d.eliminado && d.origen !== 'ficha')
      const docId = cargarDocumento({
        colaboradorId: persona.id,
        subtipoId: sub.id,
        motivo: yaEsta ? 'Se cargó una versión nueva' : '',
        version: {
          archivo: { nombre: normalizarNombre(persona, sub, emision, ext), original: file.name, formato: ext, tamanoKB: Math.round(file.size / 1024), clave: guardado ? clave : null, tipoMime: file.type },
          emision,
          vencimiento: sub.vence ? sumarMeses(emision, sub.vigenciaMeses) : null,
          info: '',
        },
      })
      subidos.push({ docId, sub, emision, vencimiento: sub.vence ? sumarMeses(emision, sub.vigenciaMeses) : '' })
    }
    if (subidos.length) {
      const marca = ++marcas.current
      setSubida({ items: subidos, marca })
      setTimeout(() => setSubida(a => (a?.marca === marca ? null : a)), 9000)
    }
    if (dudosos.length) {
      const archivos = []
      for (const file of dudosos) {
        const clave = nuevaClaveArchivo()
        const guardado = await guardarArchivo(clave, file)
        archivos.push({ nombre: file.name, original: file.name, formato: extensionDe(file.name), tamanoKB: Math.round(file.size / 1024), clave: guardado ? clave : null, tipoMime: file.type })
      }
      subirSinClasificar(persona.id, tipoId || null, archivos)
      avisar(dudosos.length === 1 ? 'Subido. Falta indicar qué documento es: elíjalo en su tarjeta.' : `${dudosos.length} subidos. Falta indicar qué documento es cada uno: elíjalo en su tarjeta.`)
      if (!carpeta) navigate(`/documentos/expedientes/${persona.id}/porclasificar`)
    }
  }

  /* RF-22: EL EXPEDIENTE COMPLETO EN UN ZIP, con su índice. Una carpeta por tipo, el archivo real
     de lo que se cargó en la demo y una constancia en texto de lo que es de ejemplo. */
  const descargarExpediente = async () => {
    setDescargando(true)
    try {
      const { blob, archivos } = await zipDeExpedientes([persona], doc)
      descargarBlob(`expediente_${nombreSeguro(persona.codigo)}.zip`, blob)
      registrarDescarga('expediente', persona.id, persona.id, `Descargó el expediente completo (ZIP, ${archivos} archivos)`)
      avisar(`Expediente descargado: ${archivos} ${archivos === 1 ? 'archivo' : 'archivos'} y su índice.`)
    } finally {
      setDescargando(false)
    }
  }

  /* Abrir un emitido confidencial deja rastro aunque no se descargue (RF-90). */
  const abrirEmitido = e => {
    setVerEmitido(e)
    if (modelos.find(m => m.id === e.modeloId)?.sensible) registrarDescarga('emitido', e.id, persona.id, `Abrió ${e.numero}`, true)
  }

  const hayAlgo = filas.length > 0 || susContratos.length > 0 || susEmitidos.length > 0

  /* Las filas de documentos, iguales en una carpeta abierta y en los resultados de una búsqueda. */
  const listaDeFilas = fs => (
    <ul className="xa-filas">
      {fs.map(f => (
        <FilaDocumento
          key={f.key}
          fila={f}
          cerrado={cerrado}
          onVer={() => abrir('doc', f.documento.id)}
          onCargar={() => elegirArchivo(f.subtipo.id)}
          onAprobar={() => { revisar(f.documento.id, true); avisar(`«${f.subtipo.nombre}» aprobado: ya cuenta como cumplido.`) }}
          onRechazar={() => setRechazo(f.documento.id)}
          onExonerar={() => setExonera(f.subtipo.id)}
          onQuitar={() => { quitarRequisito(persona.id, f.subtipo.id); avisar(`Ya no se le exige «${f.subtipo.nombre}».`) }}
          onPapelera={() => setPapelera(f.documento.id)}
          onDescargar={() => descargarVersion(persona, f.subtipo, versionActual(f.documento), f.documento, registrarDescarga)}
        />
      ))}
    </ul>
  )

  return (
    <div className="content-scroll">
      {/* ── UNA SOLA RUTA, EN LAS DOS VISTAS: la flecha sube un nivel y cada paso se puede
          tocar. Antes había un «← Colaboradores» en las carpetas y otra ruta, con otro dibujo,
          dentro de una carpeta: dos maneras de decir dónde se está en la misma pantalla. ── */}
      <nav className="xa-migas" aria-label="Ruta">
        <button
          type="button"
          className="xa-migas-subir"
          onClick={() => navigate(carpeta ? `/documentos/expedientes/${persona.id}` : '/documentos/expedientes')}
          aria-label={carpeta ? `Volver a las carpetas de ${persona.name}` : 'Volver a Expedientes'}
          title="Volver"
        >
          <ArrowLeft size={14} />
        </button>
        <button type="button" onClick={() => navigate('/documentos/expedientes')}>Expedientes</button>
        <ChevronRight size={13} className="xa-migas-sep" aria-hidden="true" />
        {carpeta ? (
          <>
            <button type="button" onClick={() => navigate(`/documentos/expedientes/${persona.id}`)}>{persona.name}</button>
            <ChevronRight size={13} className="xa-migas-sep" aria-hidden="true" />
            <span className="xa-migas-actual" aria-current="page">{carpeta.nombre}</span>
          </>
        ) : (
          <span className="xa-migas-actual" aria-current="page">{persona.name}</span>
        )}
      </nav>

      {/* ── DE QUIÉN ES Y CUÁNTO TIENE (RF-19). Los datos vienen de Gestión de Personas y acá no se
          editan. Una sola franja: lo que importa en esta pantalla está debajo. ── */}
      <section className="dc-tarjeta xa-ficha xa-ficha-compacta">
        <Avatar persona={persona} size={56} clase="og-av xa-ficha-foto" />
        <div className="xa-ficha-quien">
          <h1 className="xa-ficha-nombre">{persona.name}</h1>
          <p className="xa-ficha-cargo">
            {[persona.cargo || 'Sin cargo', persona.depto || 'Sin unidad', persona.sedeNombre || 'Sin sucursal', persona.codigo].join(' · ')}
          </p>
          <div className="xa-ficha-avance-linea">
            {cerrado
              ? <span className="dc-chip dc-t-gris"><Archive size={12} /> Expediente cerrado</span>
              : <BarraAvance pct={avance.pct} ancho={140} />}
            {!cerrado && avance.pct !== null && <span className="dc-muted xa-ficha-n">{avance.cumplidos} de {avance.total} obligatorios exigibles</span>}
          </div>
        </div>
        <div className="xa-ficha-acc">
          {!cerrado && (
            <button type="button" className="pl-btn-new" onClick={() => elegirArchivo(null)}>
              <Upload size={14} /> Subir documento
            </button>
          )}
          {!cerrado && (
            <button type="button" className="dc-btn" onClick={() => setEmitiendo({})}>
              <FilePlus2 size={14} /> Enviar documento
            </button>
          )}
          <button type="button" className="dc-btn" onClick={descargarExpediente} disabled={descargando}>
            <Download size={14} /> {descargando ? 'Preparando…' : 'Descargar expediente'}
          </button>
          <button type="button" className="dc-btn xa-btn-icono" onClick={() => navigate(`/documentos/expedientes/${persona.id}/historial`)} aria-label="Ver el historial del expediente" title="Historial">
            <History size={15} />
          </button>
        </div>
      </section>

      {cerrado && (
        <div className="xa-cerrado" role="status">
          <Lock size={16} aria-hidden="true" />
          <div>
            <b>Expediente cerrado en solo lectura.</b> {persona.name} ya no forma parte de la empresa: se puede consultar,
            descargar y auditar, pero no cargar ni modificar documentos. Corre la política de retención de cada tipo.
          </div>
        </div>
      )}

      {aviso && <div className="xa-toast" role="status"><Check size={14} /> {aviso}</div>}
      {subida && !aviso && (
        <div className="xa-toast xa-toast-accion" role="status">
          <Check size={14} />
          <span>{subida.items.length === 1 ? `${subida.clasificado ? 'Guardado como' : 'Subido:'} «${subida.items[0].sub.nombre}», con fecha de hoy.` : `${subida.items.length} documentos subidos, con fecha de hoy.`}</span>
          <button type="button" onClick={() => { setFechasDe(subida.items); setSubida(null) }}>Revisar fechas</button>
        </div>
      )}
      {fechasDe && <ModalFechas items={fechasDe} onCerrar={() => setFechasDe(null)} onGuardado={() => { setFechasDe(null); avisar('Fechas corregidas.') }} />}

      {/* ── LO PENDIENTE, EN UNA LÍNEA (v3): sólo lo que pide algo, y un toque muestra justo eso. Eran
          cuatro recuadros grandes que repetían el porcentaje de arriba. ── */}
      {!cerrado && (
        <div className="xg-chips" role="group" aria-label="Lo pendiente de este expediente">
          {rapidos.filter(r => r.clave && r.valor > 0).length === 0
            ? <span className="dc-muted" style={{ fontSize: 13 }}>No tiene nada pendiente.</span>
            : rapidos.filter(r => r.clave && r.valor > 0).map(r => {
              const activo = filtroEstado === r.clave
              return (
                <button key={r.clave} type="button" className={`xg-chip xg-${r.tono}${activo ? ' on' : ''}`} aria-pressed={activo}
                  onClick={() => (carpeta
                    ? (setFiltroEstado(r.clave), navigate(`/documentos/expedientes/${persona.id}?estado=${r.clave}`))
                    : setFiltroEstado(activo ? '' : r.clave))}>
                  {r.titulo} <b>{r.valor}</b>
                </button>
              )
            })}
        </div>
      )}

      {carpeta?.clave === 'historial' ? (
        <Historial eventos={susEventos} />
      ) : carpeta ? (
        <PaginaCarpeta
          carpeta={carpeta}
          cerrado={cerrado}
          contratos={susContratos}
          emitidos={susEmitidos}
          papelera={enPapelera}
          lista={listaDeFilas}
          pendientes={carpeta.clave === 'porclasificar' ? misPendientes : misPendientes.filter(x => x.tipoId === carpeta.clave)}
          opciones={opcionesClasificar(carpeta.filas ? carpeta.clave : null)}
          onClasificar={alClasificar}
          onDescartar={id => { descartarSinClasificar(id); avisar('Archivo eliminado.') }}
          onVer={docId => abrir('doc', docId)}
          onCargar={subtipoId => elegirArchivo(subtipoId === 'nuevo' ? null : subtipoId)}
          onExonerar={subtipoId => setExonera(subtipoId)}
          onQuitar={f => { quitarRequisito(persona.id, f.subtipo.id); avisar(`Ya no se le exige «${f.subtipo.nombre}».`) }}
          onPapelera={docId => setPapelera(docId)}
          onDescargar={f => descargarVersion(persona, f.subtipo, versionActual(f.documento), f.documento, registrarDescarga)}
          onContrato={cid => navigate(`/documentos/expedientes/contrato/${cid}`)}
          onVerEmitido={abrirEmitido}
          onRecuperar={docId => { recuperarDocumento(docId); avisar('Documento recuperado.') }}
        />
      ) : (
        <>
      <div className="xa-barra">
        <div className="pl-search-wrap xa-busca">
          <Search size={13} className="pl-search-ico" />
          <input type="search" className="pl-search" placeholder="Buscar en todas sus carpetas…" value={busca} onChange={e => setBusca(e.target.value)} aria-label="Buscar en sus documentos" />
        </div>
        <div className="xa-filtro-estado">
          <Desplegable
            valor={filtroEstado}
            opciones={[
              { valor: '', etiqueta: 'Todos los estados' },
              ...Object.entries(FILTROS_RAPIDOS).map(([k, f]) => ({ valor: k, etiqueta: f.label })),
              ...Object.keys(ESTADOS).filter(e => cuantos(e)).map(e => ({ valor: e, etiqueta: `${ESTADOS[e].label} (${cuantos(e)})` })),
            ]}
            placeholder="Todos los estados"
            ariaLabel="Filtrar por estado"
            onCambio={setFiltroEstado}
          />
        </div>
        {!cerrado && (
          <button type="button" className="dc-btn xa-barra-der" onClick={() => setRequisito(true)}>
            <ListPlus size={14} /> Agregar requisito
          </button>
        )}
      </div>

      {!hayAlgo ? (
        <div className="dc-tarjeta">
          <Vacio
            Icono={FolderOpen}
            titulo="No tiene documentos ni requisitos"
            texto={cerrado ? 'Su expediente se cerró sin documentos.' : 'Agregue los documentos que se le exigen, o cargue directamente los que ya entregó.'}
          >
            {!cerrado && <button type="button" className="dc-btn" onClick={() => setRequisito(true)}><ListPlus size={14} /> Agregar requisito</button>}
            {!cerrado && <button type="button" className="pl-btn-new" onClick={() => elegirArchivo(null)}><Upload size={14} /> Subir documento</button>}
          </Vacio>
        </div>
      ) : filtrando ? (
        /* ── BUSCANDO O FILTRANDO: los documentos que coinciden, de todas las carpetas a la vez.
            Buscar carpeta por carpeta sería obligar a saber de antemano dónde está algo. ── */
        <>
          <div className="xa-resultado-cab">
            <span>{plural(grupos.reduce((a, g) => a + g.filas.length, 0), 'documento coincide', 'documentos coinciden')}{filtroEstado ? ` · ${FILTROS_RAPIDOS[filtroEstado]?.label || ESTADOS[filtroEstado]?.label}` : ''}</span>
            <button type="button" className="dc-btn dc-btn-sm" onClick={() => { setBusca(''); setFiltroEstado('') }}><FolderOpen size={13} /> Volver a las carpetas</button>
          </div>
          {grupos.length === 0 ? (
            <div className="dc-tarjeta">
              <Vacio Icono={Search} titulo="Ningún documento coincide" texto={busca ? `Se buscó «${busca}».` : 'No hay documentos en ese estado.'} />
            </div>
          ) : grupos.map(g => (
            <section key={g.tipo.id} className="dc-tarjeta xa-grupo">
              <header className="dc-tarjeta-cab">
                <h2>{g.tipo.nombre}</h2>
                <span className="dc-muted xa-grupo-n">{plural(g.filas.length, 'documento', 'documentos')}</span>
              </header>
              {listaDeFilas(g.filas)}
            </section>
          ))}
        </>
      ) : (
        /* ── TODAS LAS CARPETAS ── */
        <div className="xa-carpetas">
          {/* El historial se abre desde su botón de arriba; la papelera sólo se ve si tiene algo. */}
          {carpetas.filter(c => c.clave !== 'historial' && (c.clave !== 'papelera' || enPapelera.length)).map(c => (
            <button
              key={c.clave}
              type="button"
              className="xa-carpeta"
              style={{ '--c-osc': c.color.osc, '--c-cla': c.color.cla, '--c-tin': c.color.tin }}
              onClick={() => navigate(`/documentos/expedientes/${persona.id}/${c.clave}`)}
              title={c.aviso}
              aria-label={`Abrir la carpeta ${c.nombre}: ${c.aviso}`}
            >
              <span className="xa-carpeta-pestana" aria-hidden="true" />
              <span className="xa-carpeta-cuerpo">
                <span className="xa-carpeta-fila">
                  <Folder size={20} aria-hidden="true" />
                  <span className={`xa-insignia xa-insignia-${c.insigniaTono}`}>{c.insignia}</span>
                </span>
                <b className="xa-carpeta-nom">{c.nombre}</b>
                <span className="xa-carpeta-cuenta">{c.cuenta}</span>
              </span>
            </button>
          ))}
        </div>
      )}

        </>
      )}

      {/* ── MODALES ── */}
      <input
        ref={elegirArchivos}
        type="file"
        multiple
        hidden
        accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
        onChange={e => { const lista = [...(e.target.files || [])]; e.target.value = ''; if (lista.length) subirDirecto(lista, subtipoElegido.current) }}
      />
      {cargarParam && !cerrado && (
        <CargarDocumentoModal
          persona={persona}
          subtipoInicial={cargarParam === 'nuevo' ? '' : cargarParam}
          tipoInicial={carpeta?.filas ? carpeta.clave : ''}
          onCerrar={() => cerrar('cargar')}
          onCargado={n => avisar(n > 1 ? `${n} documentos subidos.` : 'Documento subido.')}
        />
      )}

      {filaDoc && (
        <VistaDocumento
          documento={filaDoc}
          persona={persona}
          cerrado={cerrado}
          onCerrar={() => cerrar('doc')}
          onRechazar={() => setRechazo(filaDoc.id)}
          onAprobar={() => { revisar(filaDoc.id, true); avisar('Documento aprobado.') }}
          onRenovar={() => pasarACargar(filaDoc.subtipoId)}
        />
      )}

      {emitiendo && (
        <Modal titulo={`Enviar a ${persona.name}`} Icono={FilePlus2} onCerrar={() => setEmitiendo(null)} ancho={1100}>
          <PanelEmision preset={{ colaboradorId: persona.id, categoria: emitiendo.categoria }} personaFija enModal />
        </Modal>
      )}

      {verEmitido && (
        <VistaEmitido emitido={verEmitido} modelo={modelos.find(m => m.id === verEmitido.modeloId)} onCerrar={() => setVerEmitido(null)} />
      )}

      {requisito && (
        <ModalRequisito
          persona={persona}
          exigidos={exigidos}
          onCerrar={() => setRequisito(false)}
          onAgregado={nombre => { setRequisito(false); avisar(`Se le exige «${nombre}».`) }}
        />
      )}

      {rechazo && (
        <ModalMotivo
          titulo="Rechazar documento"
          Icono={X}
          texto="El motivo le llega al colaborador y queda en la bitácora para siempre. Dígale qué tiene que corregir."
          placeholder="La foto está cortada: no se lee el número de documento."
          accion="Rechazar"
          peligro
          onCerrar={() => setRechazo(null)}
          onConfirmar={m => { revisar(rechazo, false, m); setRechazo(null); avisar('Documento rechazado. Se notificó el motivo.') }}
        />
      )}

      {exonera && (
        <ModalMotivo
          titulo={`Exonerar «${subtipos.find(s => s.id === exonera)?.nombre}»`}
          Icono={ShieldCheck}
          texto="El requisito deja de contar como faltante para esta persona. Queda registrado quién lo exoneró, cuándo y por qué, y eso no se borra (RN-09)."
          placeholder="Extranjero con residencia temporal: presenta pasaporte en lugar de carnet."
          accion="Exonerar"
          onCerrar={() => setExonera(null)}
          onConfirmar={m => { exonerar(persona.id, exonera, m); setExonera(null); avisar('Requisito exonerado.') }}
        />
      )}

      {papelera && (
        <ModalPapelera
          nombre={subtipos.find(s => s.id === documentos.find(d => d.id === papelera)?.subtipoId)?.nombre}
          dias={parametros.papeleraDias}
          onCerrar={() => setPapelera(null)}
          onConfirmar={m => { eliminarDocumento(papelera, m); setPapelera(null); avisar('Enviado a la papelera. Se puede recuperar desde la carpeta Papelera.') }}
        />
      )}
    </div>
  )
}

/* Orden dentro de un tipo: lo que pide atención primero. */
const PRIORIDAD = { vencido: 0, rechazado: 1, faltante: 2, en_revision: 3, por_vencer: 4, vigente: 5, exonerado: 6 }
const orden = f => PRIORIDAD[f.estado] ?? 9

/* De dónde sale que se le pida: dicho en la fila, porque decide qué se puede hacer con ella. Lo
   exigido a todos se exonera; lo agregado a esta persona, además, se puede dejar de exigir. */
function origenDe(requisito) {
  if (!requisito) return 'no exigido'
  if (!requisito.obligatorio) return 'opcional'
  return requisito.origen === 'personal' ? 'exigido a esta persona' : 'exigido a todos'
}

/* ── UNA FILA DEL EXPEDIENTE ──────────────────────────────────────────────
   A la vista, lo que se hace seguido: cargar, renovar, revisar, ver y descargar. Lo que se hace
   rara vez —exonerar, dejar de exigir, mandar a la papelera— va en el menú de tres puntos. */
function FilaDocumento({ fila, cerrado, onVer, onCargar, onAprobar, onRechazar, onExonerar, onQuitar, onPapelera, onDescargar }) {
  const { subtipo, requisito, documento, estado, limite, exigible, exoneracion } = fila
  const v = versionActual(documento)
  const accion = ACCION[estado]
  const d = v?.vencimiento ? diasHasta(v.vencimiento) : null

  let detalle
  if (estado === 'exonerado') detalle = `Exonerado por ${exoneracion.por} el ${fechaCorta(exoneracion.fecha)}: ${exoneracion.motivo}`
  else if (estado === 'faltante') detalle = limite ? (exigible ? `Debió entregarse hasta el ${fechaCorta(limite)}` : `Plazo hasta el ${fechaCorta(limite)} · aún no descuenta`) : 'Sin plazo'
  else if (estado === 'rechazado') detalle = `Rechazado: ${v.motivoRechazo}`
  else if (v) detalle = `${v.archivo.nombre}${v.v > 1 ? ` · versión ${v.v}` : ''}`

  const menu = cerrado ? [] : [
    requisito && ['faltante', 'vencido', 'rechazado'].includes(estado) && { label: 'Exonerar', Icono: ShieldCheck, onClick: onExonerar },
    requisito?.origen === 'personal' && !documento && { label: 'Dejar de exigir', Icono: MinusCircle, onClick: onQuitar },
    documento && documento.origen !== 'ficha' && { label: 'Enviar a la papelera', Icono: Trash2, onClick: onPapelera, peligro: true },
  ].filter(Boolean)

  return (
    <li className={`xa-fila xa-e-${estado}`}>
      <div className="xa-fila-doc">
        <span className="xa-fila-nom">
          {subtipo.nombre}
          <SensibilidadChip nivel={subtipo.sensibilidad} />
          <span className={`xa-opcional${requisito?.origen === 'personal' ? ' xa-personal' : ''}`}>{origenDe(requisito)}</span>
          {documento?.origen === 'ficha' && <span className="xa-opcional xa-de-ficha" title="Se registró en la ficha del colaborador: se cambia allá">de la ficha</span>}
        </span>
        <span className="xa-fila-arch" title={v?.archivo?.original ? `Nombre original: ${v.archivo.original}` : undefined}>{detalle}</span>
      </div>
      <div className="xa-fila-estado">
        <EstadoChip estado={estado} />
      </div>
      <div className="xa-fila-venc">
        {v?.vencimiento ? (
          <>
            <span>{fechaCorta(v.vencimiento)}</span>
            {d !== null && <small className={d < 0 ? 'xa-rojo' : d <= 60 ? 'xa-ambar' : ''}>{d < 0 ? `hace ${-d} días` : d === 0 ? 'vence hoy' : `en ${d} días`}</small>}
          </>
        ) : <span className="dc-muted">{v ? 'No vence' : '—'}</span>}
      </div>
      <div className="xa-fila-acc">
        {estado === 'en_revision' && !cerrado && (
          <>
            <button type="button" className="dc-btn dc-btn-sm xa-btn-ok" onClick={onAprobar}><Check size={13} /> Aprobar</button>
            <button type="button" className="dc-btn dc-btn-sm dc-btn-peligro" onClick={onRechazar}><X size={13} /> Rechazar</button>
          </>
        )}
        {accion && !cerrado && (
          <button type="button" className={estado === 'faltante' ? 'pl-btn-new xa-btn-cargar' : 'dc-btn dc-btn-sm'} onClick={onCargar}>
            <accion.Icono size={13} /> {accion.label}
          </button>
        )}
        {documento && (
          <>
            <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={onVer} aria-label={`Ver ${subtipo.nombre}`} title="Ver"><Eye size={14} /></button>
            <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={onDescargar} aria-label={`Descargar ${subtipo.nombre}`} title="Descargar"><Download size={14} /></button>
          </>
        )}
        {menu.length > 0 ? <MenuAcciones items={menu} etiqueta={`Más acciones para ${subtipo.nombre}`} /> : <span className="xa-menu-hueco" aria-hidden="true" />}
      </div>
    </li>
  )
}

/* ── LA CARPETA, EN SU PROPIA PÁGINA ───────────────────────────────────────
   LA PÁGINA DEL EXPEDIENTE NO CAMBIA AL ENTRAR: arriba siguen la persona, su avance y los
   números; sólo lo de abajo pasa de las carpetas a los documentos de la carpeta elegida. Dónde se
   está lo dice la ruta de arriba, y por ella se vuelve: una franja más con el nombre de la
   carpeta repetía lo mismo y hacía ruido.

   Fue un modal, y un modal no escala: con los años un expediente junta decenas de documentos por
   carpeta —licencias renovadas, actas de cada entrega, documentos agregados— y una ventana
   flotante no tiene dónde poner buscar, ordenar ni paginar. Ahora la carpeta es una página con
   su dirección (`/documentos/expedientes/:id/:carpeta`): se enlaza, se comparte, la flecha del
   navegador vuelve a las carpetas y lo que se abre desde ella (ver, cargar) va encima como
   siempre.

   PARA CUANDO SON MUCHOS: búsqueda dentro de la carpeta, dos vistas —gráfica, para mirar; lista,
   para trabajar rápido— y de a 24, con «Mostrar más». Siempre va lo urgente primero: vencido,
   rechazado, faltante, en revisión. Tuvo además filtros por estado y un selector de orden, y se
   quitaron: repetían lo que ya hacen los números de arriba y lo que el orden ya pone adelante.
   La vista elegida se recuerda en este navegador.

   CADA DOCUMENTO ES UNA HOJA: la miniatura es el archivo real cuando existe, la etiqueta dice su
   estado y el botón dice lo que hay que hacer con él. Lo que falta es una hoja vacía con un «+».
   Lo que se hace rara vez va en el menú de tres puntos. */
const DE_A = 24
const leerVista = () => { try { return localStorage.getItem('doc_vista_carpeta') || 'hojas' } catch { return 'hojas' } }
const guardarVista = v => { try { localStorage.setItem('doc_vista_carpeta', v) } catch { /* sin almacenamiento: se queda en esta visita */ } }

function PaginaCarpeta({carpeta, cerrado, contratos, emitidos, papelera, lista, pendientes = [], opciones, onClasificar, onDescartar, onVer, onCargar, onExonerar, onQuitar, onPapelera, onDescargar, onContrato, onVerEmitido, onRecuperar }) {
  const { modelos, subtipos, parametros, contratos: todos } = useDocumentacion()
  const [busca, setBusca] = useState('')
  const [vista, setVista] = useState(leerVista)
  const [cuantos, setCuantos] = useState(DE_A)
  const esTipo = !!carpeta.filas
  const filas = carpeta.filas || []
  const texto = busca.trim().toLowerCase()
  const coincide = (...xs) => !texto || xs.some(x => String(x || '').toLowerCase().includes(texto))

  const docsVisibles = filas
    .filter(f => { const v = versionActual(f.documento); return coincide(f.subtipo.nombre, v?.archivo?.nombre, v?.info, ESTADOS[f.estado]?.label) })
    .sort((a, b) => orden(a) - orden(b))
  const contratosVisibles = contratos.filter(c => coincide(c.numero, MODALIDADES[c.modalidad], c.tipo))
  const emitidosVisibles = emitidos.filter(e => coincide(e.numero, modelos.find(m => m.id === e.modeloId)?.nombre))
  const papeleraVisible = papelera.filter(d => coincide(subtipos.find(x => x.id === d.subtipoId)?.nombre, d.eliminado.motivo))
  const pendientesVisibles = pendientes.filter(x => coincide(x.archivo.original))
  const total = carpeta.clave === 'porclasificar' ? pendientesVisibles.length : esTipo ? docsVisibles.length : carpeta.clave === 'contratos' ? contratosVisibles.length : carpeta.clave === 'emitidos' ? emitidosVisibles.length : papeleraVisible.length
  const cambiarVista = v => { setVista(v); guardarVista(v) }

  const accionDe = f => {
    if (cerrado) return f.documento ? { label: 'Ver', onClick: () => onVer(f.documento.id), principal: false } : null
    if (f.estado === 'faltante') return { label: 'Subir', onClick: () => onCargar(f.subtipo.id), principal: true }
    if (f.estado === 'rechazado') return { label: 'Subir otro', onClick: () => onCargar(f.subtipo.id), principal: true }
    if (f.estado === 'vencido' || f.estado === 'por_vencer') return { label: 'Renovar', onClick: () => onCargar(f.subtipo.id), principal: true }
    if (f.estado === 'en_revision') return { label: 'Revisar', onClick: () => onVer(f.documento.id), principal: true }
    return f.documento ? { label: 'Ver', onClick: () => onVer(f.documento.id), principal: false } : null
  }
  const menuDe = (f, accion) => [
    f.documento && accion?.label !== 'Ver' && accion?.label !== 'Revisar' && { label: 'Ver', Icono: Eye, onClick: () => onVer(f.documento.id) },
    f.documento && { label: 'Descargar', Icono: Download, onClick: () => onDescargar(f) },
    !cerrado && f.requisito && ['faltante', 'vencido', 'rechazado'].includes(f.estado) && { label: 'Exonerar', Icono: ShieldCheck, onClick: () => onExonerar(f.subtipo.id) },
    !cerrado && f.requisito?.origen === 'personal' && !f.documento && { label: 'Dejar de exigir', Icono: MinusCircle, onClick: () => onQuitar(f) },
    !cerrado && f.documento && f.documento.origen !== 'ficha' && { label: 'Enviar a la papelera', Icono: Trash2, onClick: () => onPapelera(f.documento.id), peligro: true },
  ].filter(Boolean)

  return (
    <div className="xa-pagina-carpeta" style={{ '--c-osc': carpeta.color.osc, '--c-cla': carpeta.color.cla, '--c-tin': carpeta.color.tin }}>
      <div className="xa-carpeta-barra">
        <div className="pl-search-wrap xa-busca">
          <Search size={13} className="pl-search-ico" />
          <input type="search" className="pl-search" placeholder={`Buscar en ${carpeta.nombre.toLowerCase()}…`} value={busca} onChange={e => { setBusca(e.target.value); setCuantos(DE_A) }} aria-label={`Buscar en ${carpeta.nombre}`} />
        </div>
        {esTipo && filas.length > 0 && (
          <div className="xa-modo-vista" role="group" aria-label="Vista">
            <button type="button" className={vista === 'hojas' ? 'on' : ''} aria-pressed={vista === 'hojas'} onClick={() => cambiarVista('hojas')} title="Ver los documentos en tarjetas"><LayoutGrid size={15} aria-hidden="true" /> Gráfica</button>
            <button type="button" className={vista === 'lista' ? 'on' : ''} aria-pressed={vista === 'lista'} onClick={() => cambiarVista('lista')} title="Ver los documentos en una lista"><ListIcon size={15} aria-hidden="true" /> Lista</button>
          </div>
        )}
      </div>

      {pendientesVisibles.length > 0 && (
        /* Lo que se subió y todavía no se sabe qué es va primero, aparte: es lo único de la carpeta
           que pide algo a quien la está mirando. */
        <section className="xa-pendientes" aria-label="Por clasificar">
          {carpeta.clave !== 'porclasificar' && <h2 className="xa-pendientes-tit">Por clasificar · {pendientesVisibles.length}</h2>}
          <div className="xa-hojas">
            {pendientesVisibles.map(x => (
              <TarjetaPorClasificar key={x.id} pendiente={x} opciones={opciones} cerrado={cerrado} onClasificar={onClasificar} onDescartar={onDescartar} />
            ))}
          </div>
        </section>
      )}

      {esTipo && vista === 'lista' && docsVisibles.length > 0 && (
        <section className="dc-tarjeta xa-grupo">{lista(docsVisibles.slice(0, cuantos))}</section>
      )}

      {(!esTipo || vista === 'hojas') && (
        <div className="xa-hojas">
          {esTipo && docsVisibles.slice(0, cuantos).map(f => {
            const v = versionActual(f.documento)
            const accion = accionDe(f)
            const menu = menuDe(f, accion)
            return (
              <article key={f.key} className="xa-hoja-card">
                <div className="xa-hoja-mini">
                  <Miniatura version={v} titulo={f.subtipo.nombre} />
                  <span className="xa-hoja-chip"><EstadoChip estado={f.estado} pequeno /></span>
                </div>
                <div className="xa-hoja-info">
                  <b className="xa-hoja-nombre">{f.subtipo.nombre} <SensibilidadChip nivel={f.subtipo.sensibilidad} /></b>
                  <span className="xa-hoja-detalle">{detalleCorto(f)}</span>
                  <span className="xa-hoja-tags">
                    <span className={`xa-opcional${f.requisito?.origen === 'personal' ? ' xa-personal' : ''}`}>{origenDe(f.requisito)}</span>
                    {f.documento?.origen === 'ficha' && <span className="xa-opcional xa-de-ficha" title="Se registró en la ficha del colaborador: se cambia allá">de la ficha</span>}
                  </span>
                  <div className="xa-hoja-acc">
                    {accion && <button type="button" className={accion.principal ? 'xa-hoja-btn principal' : 'xa-hoja-btn'} onClick={accion.onClick}>{accion.label}</button>}
                    {menu.length > 0 && <MenuAcciones items={menu} etiqueta={`Más acciones para ${f.subtipo.nombre}`} />}
                  </div>
                </div>
              </article>
            )
          })}

          {carpeta.clave === 'contratos' && contratosVisibles.slice(0, cuantos).map(c => (
            <article key={c.id} className="xa-hoja-card">
              <div className="xa-hoja-mini"><Miniatura titulo={c.tipo === 'adenda' ? 'Adenda' : 'Contrato de trabajo'} detalle={c.numero} /><span className="xa-hoja-chip"><EstadoContratoChip estado={estadoContrato(c, parametros, todos)} /></span></div>
              <div className="xa-hoja-info">
                <b className="xa-hoja-nombre">{c.tipo === 'adenda' ? 'Adenda' : `Contrato ${MODALIDADES[c.modalidad].toLowerCase()}`}</b>
                <span className="xa-hoja-detalle">{c.numero} · desde {fechaCorta(c.inicio)}{c.fin ? ` hasta ${fechaCorta(c.fin)}` : ''}</span>
                <div className="xa-hoja-acc"><button type="button" className="xa-hoja-btn" onClick={() => onContrato(c.id)}>Abrir</button></div>
              </div>
            </article>
          ))}

          {carpeta.clave === 'emitidos' && emitidosVisibles.slice(0, cuantos).map(e => {
            const m = modelos.find(x => x.id === e.modeloId)
            return (
              <article key={e.id} className="xa-hoja-card">
                <div className="xa-hoja-mini"><Miniatura titulo={nombreEmitido(e, modelos)} detalle={e.numero} emitido /><span className="xa-hoja-chip"><EstadoEmitidoChip estado={e.estado} /></span></div>
                <div className="xa-hoja-info">
                  <b className="xa-hoja-nombre">{nombreEmitido(e, modelos)} {m?.sensible && <SensibilidadChip nivel="confidencial" />}</b>
                  <span className="xa-hoja-detalle">{e.numero} · {fechaCorta(e.fecha)} · {e.acuse ? `confirmó el ${fechaCorta(e.acuse.fecha)}` : e.estado === 'entregado' ? 'sin confirmar' : e.estado === 'generado' ? 'falta entregarlo' : ''}</span>
                  <div className="xa-hoja-acc"><button type="button" className="xa-hoja-btn" onClick={() => onVerEmitido(e)}>Ver</button></div>
                </div>
              </article>
            )
          })}

          {carpeta.clave === 'papelera' && papeleraVisible.slice(0, cuantos).map(d => (
            <article key={d.id} className="xa-hoja-card xa-hoja-borrada">
              <div className="xa-hoja-mini"><Miniatura version={versionActual(d)} titulo={subtipos.find(x => x.id === d.subtipoId)?.nombre} /></div>
              <div className="xa-hoja-info">
                <b className="xa-hoja-nombre">{subtipos.find(x => x.id === d.subtipoId)?.nombre}</b>
                <span className="xa-hoja-detalle">El {fechaCorta(d.eliminado.fecha)}: {d.eliminado.motivo}</span>
                {!cerrado && <div className="xa-hoja-acc"><button type="button" className="xa-hoja-btn" onClick={() => onRecuperar(d.id)}><Undo2 size={13} /> Recuperar</button></div>}
              </div>
            </article>
          ))}

          {esTipo && !cerrado && !texto && filas.length > 0 && cuantos >= total && (
            <button type="button" className="xa-hoja-nueva" onClick={() => onCargar('nuevo')}>
              <span className="xa-hoja-nueva-ico" aria-hidden="true"><Upload size={22} /></span>
              <b>Subir documento</b>
              <small>PDF o imagen · se carga al instante en esta carpeta</small>
            </button>
          )}
        </div>
      )}

      {total > cuantos && (
        <button type="button" className="dc-btn xa-mostrar-mas" onClick={() => setCuantos(c => c + DE_A)}>
          Mostrar {Math.min(DE_A, total - cuantos)} más · quedan {total - cuantos}
        </button>
      )}

      {total === 0 && !pendientesVisibles.length && (
        <div className="dc-tarjeta">
          {texto ? <Vacio Icono={Search} titulo="Nada coincide en esta carpeta" texto={`Se buscó «${busca}».`}><button type="button" className="dc-btn" onClick={() => setBusca('')}>Limpiar la búsqueda</button></Vacio>
              : esTipo ? <Vacio Icono={FolderOpen} titulo="Esta carpeta está vacía" texto="No se le exige ningún documento de este tipo y no tiene ninguno cargado." />
                : carpeta.clave === 'contratos' ? <Vacio Icono={FileSignature} titulo="Sin contratos registrados" texto="Un colaborador activo sin contrato vigente es una inconsistencia para Planillas (3.5)." />
                  : carpeta.clave === 'emitidos' ? <Vacio Icono={FileText} titulo="Todavía no se le emitió nada" texto="Los certificados, memorándums y otros documentos que se le emitan se archivan aquí solos." />
                    : <Vacio Icono={Trash2} titulo="La papelera está vacía" texto={`Un documento eliminado se puede recuperar durante ${parametros.papeleraDias} días.`} />}
        </div>
      )}
    </div>
  )
}

/* «Otro»: el documento agregado de la ficha, que lleva el nombre que se le escribe. */
const SUB_OTRO = 's-agregado'

/* ── UN ARCHIVO POR CLASIFICAR ─────────────────────────────────────────────
   Ya está subido: se ve como cualquier documento —su miniatura real— y pide una sola cosa, qué
   documento es. Al elegirlo queda guardado; no hay botón «Guardar» que olvidar. */
function TarjetaPorClasificar({ pendiente, opciones, cerrado, onClasificar, onDescartar }) {
  return (
    <article className="xa-hoja-card xa-hoja-pendiente">
      <div className="xa-hoja-mini">
        <Miniatura version={{ v: 1, archivo: pendiente.archivo }} titulo={pendiente.archivo.original} />
        <span className="xa-hoja-chip"><span className="dc-chip dc-chip-sm dc-t-ambar">Por clasificar</span></span>
      </div>
      <div className="xa-hoja-info">
        <b className="xa-hoja-nombre" title={pendiente.archivo.original}>{pendiente.archivo.original}</b>
        <span className="xa-hoja-detalle">Subido el {fechaCorta(pendiente.fecha)}</span>
        {!cerrado && (
          <div className="xa-clasificar">
            <span className="xa-clasificar-tit">¿Qué documento es?</span>
            <div className="xa-clasificar-fila">
              <SelectorDocumento
                {...opciones}
                ariaLabel={`Qué documento es ${pendiente.archivo.original}`}
                onElegir={id => onClasificar(pendiente.id, id)}
                onOtro={nombre => onClasificar(pendiente.id, SUB_OTRO, nombre)}
              />
              <button type="button" className="xa-clasificar-borrar" onClick={() => onDescartar(pendiente.id)} aria-label={`Eliminar ${pendiente.archivo.original}`} title="Eliminar archivo">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

/* Una línea por hoja: lo que hace falta saber sin abrirla. */
function detalleCorto(f) {
  const v = versionActual(f.documento)
  /* Un documento agregado en la ficha trae su nombre propio —«Memorándum de designación»—: es lo
     que dice qué es, más que el nombre genérico del subtipo. */
  if ((f.documento?.origen === 'ficha' || f.subtipo?.id === SUB_OTRO) && v?.info) return v.info
  if (f.estado === 'exonerado') return `Exonerado: ${f.exoneracion.motivo}`
  if (f.estado === 'faltante') return f.limite ? (f.exigible ? `Debió entregarse el ${fechaCorta(f.limite)}` : `Plazo hasta el ${fechaCorta(f.limite)}`) : 'Sin plazo'
  if (f.estado === 'rechazado') return `Rechazado: ${v.motivoRechazo}`
  if (f.estado === 'en_revision') return `Subido el ${fechaCorta(v.fecha)}${v.canal === 'app' ? ' desde la app' : ''}`
  if (v?.vencimiento) {
    const d = diasHasta(v.vencimiento)
    return d < 0 ? `Venció hace ${plural(-d, 'día', 'días')}` : `Vence el ${fechaCorta(v.vencimiento)}`
  }
  return v ? 'No vence' : '—'
}

/* LA MINIATURA: la imagen real si el archivo se cargó en esta demo; si es PDF o de los datos de
   ejemplo, una hoja dibujada con su formato. Sin versión, la hoja vacía punteada de lo que falta. */
function Miniatura({ version, titulo = '', detalle = '', emitido = false }) {
  const url = useArchivoLocal(version?.archivo?.clave || null)
  const formato = (version?.archivo?.formato || '').toLowerCase()
  const esPdf = formato === 'pdf' || version?.archivo?.tipoMime === 'application/pdf'
  if (version === null) return <span className="xa-mini-hoja xa-mini-falta" aria-hidden="true">+</span>
  if (url && ['jpg', 'jpeg', 'png', 'webp'].includes(formato)) return <img className="xa-mini-img" src={url} alt="" />
  /* UN PDF CARGADO SE VE COMO ES: su primera página, del archivo guardado en este navegador. Antes
     salía la hoja dibujada de los datos de ejemplo, y quien acababa de subir su carnet no lo
     reconocía en la tarjeta. Se dibuja con pdf.js (`PaginasPdf`), no con el visor del navegador.
     La tarjeta es para mirar; para leer está «Ver». */
  if (url && esPdf) {
    return (
      <div className="xa-mini-pdf" aria-hidden="true">
        <PaginasPdf url={url} primera />
      </div>
    )
  }
  /* SIN ARCHIVO PARA MOSTRAR —los datos de ejemplo de la demo, o lo emitido, que es texto— la
     tarjeta igual se ve como un documento: una página entera con su título y su número, como
     saldría un PDF, y no un ícono de hoja suelto. Lo de ejemplo lleva la marca «Ejemplo»: quien
     revisa el prototipo tiene que poder distinguirlo de lo que subió. */
  const deEjemplo = !emitido && !version?.archivo?.clave
  return (
    <div className="xa-mini-pagina" aria-hidden="true">
      <b className="xa-mini-pagina-tit">{titulo || 'Documento'}</b>
      <span className="xa-mini-pagina-det">{detalle || version?.archivo?.original || version?.archivo?.nombre || ''}</span>
      <span className="xa-mini-pagina-lineas">
        <i style={{ width: '94%' }} /><i style={{ width: '88%' }} /><i style={{ width: '91%' }} /><i style={{ width: '62%' }} />
        <i style={{ width: '90%', marginTop: 6 }} /><i style={{ width: '84%' }} /><i style={{ width: '70%' }} />
      </span>
      <span className="xa-mini-pagina-pie">
        {formato && <em>{formato.toUpperCase()}</em>}
        {deEjemplo && <span className="xa-mini-ejemplo">Ejemplo</span>}
      </span>
    </div>
  )
}

/* ── REVISAR LAS FECHAS DE LO RECIÉN SUBIDO ────────────────────────────────
   La subida directa no pregunta fechas: pone la emisión de hoy y el vencimiento por la vigencia
   del documento. Si se emitió antes —un carnet de 2022—, acá se corrige, sin volver a subirlo. */
function ModalFechas({ items, onCerrar, onGuardado }) {
  const { cambiarFechas } = useDocumentacion()
  const [valores, setValores] = useState(() => items.map(i => ({ emision: i.emision, vencimiento: i.vencimiento || '', tocado: false })))
  const cambiar = (n, cambios) => setValores(prev => prev.map((v, i) => {
    if (i !== n) return v
    const nuevo = { ...v, ...cambios }
    /* El vencimiento sigue a la emisión mientras nadie lo haya escrito a mano. */
    if ('emision' in cambios && !v.tocado && items[n].sub.vence && nuevo.emision) nuevo.vencimiento = sumarMeses(nuevo.emision, items[n].sub.vigenciaMeses)
    return nuevo
  }))
  const errores = valores.map((v, i) => (!v.emision ? 'Falta la emisión'
    : items[i].sub.vence && !v.vencimiento ? 'Este documento vence: indique hasta cuándo'
      : v.vencimiento && v.vencimiento <= v.emision ? 'El vencimiento tiene que ser posterior a la emisión' : ''))
  const guardar = () => {
    if (errores.some(Boolean)) return
    items.forEach((it, i) => cambiarFechas(it.docId, { emision: valores[i].emision, vencimiento: it.sub.vence ? valores[i].vencimiento : null }))
    onGuardado()
  }
  return (
    <Modal titulo="Revisar fechas" Icono={History} onCerrar={onCerrar} ancho={560} pie={<>
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cerrar</button>
      <button type="button" className="pl-btn-save" disabled={errores.some(Boolean)} onClick={guardar}>Guardar fechas</button>
    </>}>
      <p className="xa-modal-txt">Se subieron con la fecha de hoy. Si el documento se emitió antes, corríjala: el vencimiento se recalcula solo.</p>
      {items.map((it, i) => (
        <div key={it.docId} className="xa-fechas-item">
          <b>{it.sub.nombre}</b>
          <div className="xa-fechas-campos">
            <div className="xa-campo"><span className="pl-label">Emisión</span><SelectorFecha valor={valores[i].emision} onCambio={v => cambiar(i, { emision: v })} ariaLabel={`Emisión de ${it.sub.nombre}`} /></div>
            {it.sub.vence
              ? <div className="xa-campo"><span className="pl-label">Vencimiento</span><SelectorFecha valor={valores[i].vencimiento} onCambio={v => cambiar(i, { vencimiento: v, tocado: true })} ariaLabel={`Vencimiento de ${it.sub.nombre}`} /></div>
              : <div className="xa-campo"><span className="pl-label">Vencimiento</span><span className="dc-muted xa-fechas-novence">No vence</span></div>}
          </div>
          {errores[i] && <small className="xa-rojo">{errores[i]}</small>}
        </div>
      ))}
    </Modal>
  )
}

/* ── VER UN EMITIDO ───────────────────────────────────────────────────────
   El texto congelado del día de emisión (RN-16). Los emitidos de los datos de ejemplo no lo
   guardan: se rehace con la versión de plantilla con que salieron y los datos que se congelaron. */
function VistaEmitido({ emitido: e, modelo, onCerrar }) {
  const version = modelo?.versiones.find(x => x.v === e.versionPlantilla) || modelo?.versiones[modelo.versiones.length - 1]
  const texto = e.texto || rellenar(version?.texto || '', { ...e.datos, 'documento.numero': e.numero, 'memo.observaciones': e.observaciones || e.datos?.['memo.observaciones'] || '' })
  return (
    <Modal titulo={`${e.numero} · ${e.nombre || modelo?.nombre || 'Documento enviado'}`} Icono={FileText} onCerrar={onCerrar} ancho={780}>
      <div className="xa-emitido-cab">
        <EstadoEmitidoChip estado={e.estado} />
        {modelo?.sensible && <SensibilidadChip nivel="confidencial" />}
        <span className="dc-muted">Emitido el {fechaCorta(e.fecha)} por {e.emitidoPor} · plantilla versión {e.versionPlantilla}</span>
      </div>
      {e.anulado && <p className="xa-modal-txt xa-rojo">Anulado el {fechaCorta(e.anulado.fecha)} por {e.anulado.por}: {e.anulado.motivo}</p>}
      <HojaEmitido emitido={{ ...e, texto }} />
    </Modal>
  )
}

/* ── AGREGAR UN REQUISITO A ESTA PERSONA ──────────────────────────────────
   Reemplaza a los «requisitos por perfil»: en vez de armar un perfil en otra pantalla para que
   a alguien se le pida su licencia, se le pide acá, a ella. El plazo cuenta desde su ingreso,
   igual que el de los requisitos generales: si ya pasó, el faltante descuenta desde hoy. */
function ModalRequisito({ persona, exigidos, onCerrar, onAgregado }) {
  const { tipos, subtipos, agregarRequisito } = useDocumentacion()
  const [subtipoId, setSubtipoId] = useState('')
  const [obligatorio, setObligatorio] = useState(true)
  const [plazo, setPlazo] = useState('30')
  const opciones = subtipos
    .filter(s => s.activo && !exigidos.has(s.id) && tipos.find(t => t.id === s.tipoId)?.activo !== false)
    .map(s => ({ valor: s.id, etiqueta: `${tipos.find(t => t.id === s.tipoId)?.nombre || ''} · ${s.nombre}` }))
    .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta))
  const listo = !!subtipoId && plazo !== ''

  const confirmar = () => {
    if (!listo) return
    agregarRequisito(persona.id, { subtipoId, obligatorio, plazoDias: Number(plazo) || 0 })
    onAgregado(subtipos.find(s => s.id === subtipoId)?.nombre)
  }

  return (
    <Modal
      titulo={`Agregar requisito a ${persona.name}`}
      Icono={ListPlus}
      onCerrar={onCerrar}
      ancho={500}
      pie={<>
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="pl-btn-save" disabled={!listo} onClick={confirmar}>Agregar requisito</button>
      </>}
    >
      <p className="xa-modal-txt">Indique qué documento se le exige a esta persona. Lo que se exige a todo el personal ya figura en su lista y se configura en Tipos de documento.</p>
      <div className="xa-campo">
        <span className="pl-label">Documento</span>
        <Desplegable
          valor={subtipoId}
          onCambio={setSubtipoId}
          ariaLabel="Documento que se le exige"
          placeholder="Elija el documento"
          conBuscador
          nota={opciones.length ? undefined : 'Ya se le exigen todos los documentos activos.'}
          opciones={opciones}
        />
      </div>
      <div className="xa-campo">
        <span className="pl-label">¿Es obligatorio?</span>
        <div className="sn-grupo" role="group" aria-label="¿Es obligatorio?" style={{ alignSelf: 'flex-start' }}>
          {[{ v: true, t: 'Sí' }, { v: false, t: 'No' }].map(o => (
            <button key={o.t} type="button" className={`sn-op${obligatorio === o.v ? ' on' : ''}`} aria-pressed={obligatorio === o.v} onClick={() => setObligatorio(o.v)}>{o.t}</button>
          ))}
        </div>
        <span className="xa-ayuda">Un requisito opcional se muestra en su lista pero no cuenta para la completitud.</span>
      </div>
      <label className="xa-campo">
        <span className="pl-label">Plazo de entrega (días)</span>
        <input className="pl-input" style={{ maxWidth: 120 }} inputMode="numeric" value={plazo} onChange={e => setPlazo(e.target.value.replace(/\D/g, ''))} />
        <span className="xa-ayuda">Días desde su ingreso para entregarlo. Si ya pasaron, el documento cuenta como faltante desde hoy.</span>
      </label>
    </Modal>
  )
}

/* Descargar una versión: el archivo de verdad si se subió en esta demo; si es de los datos de
   ejemplo, una constancia en texto que dice qué se habría bajado. Siempre deja rastro (RF-85). */
// eslint-disable-next-line react-refresh/only-export-components
export async function descargarVersion(persona, subtipo, v, documento, registrarDescarga) {
  if (!v) return
  const archivo = v.archivo?.clave ? await leerArchivo(v.archivo.clave) : null
  if (archivo) {
    const url = URL.createObjectURL(archivo)
    const a = document.createElement('a')
    a.href = url; a.download = v.archivo.nombre; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } else {
    descargarTexto(`${v.archivo.nombre}.txt`, `Muestra de la demo: este documento no tiene archivo real.\n\n${subtipo.nombre} de ${persona.name}\nArchivo: ${v.archivo.nombre}\nNombre original: ${v.archivo.original || '—'}\nVersión ${v.v} · cargada el ${fechaNum(v.fecha)} por ${v.subidoPor}`)
  }
  registrarDescarga('documento', documento.id, persona.id, `Descargó ${v.archivo.nombre} (v${v.v})`, subtipo.sensibilidad === 'confidencial')
}

/* ── VER UN DOCUMENTO (RF-21) ─────────────────────────────────────────────
   Vista previa sin descargar y todas sus versiones: reemplazar no borra (RN-13), así que la
   versión 1 de un carnet renovado sigue ahí, marcada como reemplazada.

   ABRIR UN CONFIDENCIAL DEJA RASTRO aunque no se descargue (RF-90). Se anota al montar, venga de
   un clic o de un enlace con `?doc=`, una sola vez por apertura: la guarda del ref evita el
   doble registro del modo estricto de React. */
function VistaDocumento({ documento, persona, cerrado, onCerrar, onAprobar, onRechazar, onRenovar }) {
  const { subtipos, parametros, registrarDescarga } = useDocumentacion()
  const subtipo = subtipos.find(s => s.id === documento.subtipoId)
  const versiones = [...documento.versiones].reverse()
  const [elegida, setElegida] = useState(versiones[0].v)
  const anotado = useRef(null)
  const v = documento.versiones.find(x => x.v === elegida)
  const estado = estadoVersion(versionActual(documento), subtipo, parametros)
  const confidencial = subtipo?.sensibilidad === 'confidencial'

  useEffect(() => {
    if (!confidencial || anotado.current === documento.id) return
    anotado.current = documento.id
    registrarDescarga('documento', documento.id, persona.id, `Abrió ${subtipo.nombre} (confidencial)`, true)
  }, [confidencial, documento.id, persona.id, subtipo, registrarDescarga])

  const pie = (
    <>
      {estado === 'en_revision' && !cerrado && (
        <>
          <button type="button" className="pl-btn-cancel xa-pie-rechazar" onClick={onRechazar}>Rechazar</button>
          <button type="button" className="pl-btn-save" onClick={() => { onAprobar(); onCerrar() }}>Aprobar</button>
        </>
      )}
      {estado !== 'en_revision' && !cerrado && <button type="button" className="pl-btn-cancel" onClick={onRenovar}><RefreshCw size={13} /> Subir nueva versión</button>}
      <button type="button" className="pl-btn-save" onClick={() => descargarVersion(persona, subtipo, v, documento, registrarDescarga)}><Download size={13} /> Descargar</button>
    </>
  )

  return (
    <Modal titulo={subtipo?.nombre || 'Documento'} Icono={Eye} onCerrar={onCerrar} pie={pie} ancho={820}>
      <div className="xa-vista">
        <div className="xa-vista-hoja">
          <Previa version={v} persona={persona} subtipo={subtipo} />
        </div>
        <aside className="xa-vista-lado">
          <div className="xa-vista-estado">
            <EstadoChip estado={estado} />
            <SensibilidadChip nivel={subtipo?.sensibilidad} />
          </div>
          <dl className="xa-vista-datos">
            <div><dt>Archivo</dt><dd>{v.archivo.nombre}</dd></div>
            {v.archivo.original && <div><dt>Nombre original</dt><dd>{v.archivo.original}</dd></div>}
            <div><dt>Emisión</dt><dd>{fechaCorta(v.emision)}</dd></div>
            <div><dt>Vencimiento</dt><dd>{v.vencimiento ? fechaCorta(v.vencimiento) : 'No vence'}</dd></div>
            <div><dt>Cargado</dt><dd>{fechaCorta(v.fecha)} · {v.subidoPor} · {v.canal === 'app' ? 'desde la app' : v.canal === 'lote' ? 'por lote' : v.canal === 'ficha' ? 'en la ficha del colaborador' : 'web'}</dd></div>
            {v.info && <div><dt>Información adicional</dt><dd>{v.info}</dd></div>}
            {v.motivoRechazo && <div><dt>Motivo del rechazo</dt><dd className="xa-rojo">{v.motivoRechazo}</dd></div>}
            {v.motivoCambio && <div><dt>Motivo del cambio</dt><dd>{v.motivoCambio}</dd></div>}
          </dl>
          <h3 className="xa-vista-sub">Versiones</h3>
          <ol className="xa-versiones">
            {versiones.map((x, i) => (
              <li key={x.v}>
                <button type="button" className={x.v === elegida ? 'on' : ''} onClick={() => setElegida(x.v)} aria-pressed={x.v === elegida}>
                  <span className="xa-ver-1"><b>v{x.v}</b> · {fechaCorta(x.fecha)}</span>
                  <span className="xa-ver-2">{i === 0 ? 'Actual' : 'Reemplazada'} · {x.subidoPor}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </Modal>
  )
}

/* La vista previa: el archivo real si se subió en la demo; si no, una hoja de muestra que dice
   que lo es. Un recuadro vacío se leería como un error. */
export function Previa({ version, persona, subtipo }) {
  const url = useArchivoLocal(version.archivo?.clave || null)
  if (url) {
    const esPdf = version.archivo.formato === 'pdf' || version.archivo.tipoMime === 'application/pdf'
    return esPdf
      ? <PaginasPdf url={url} className="xa-previa-pdf" />
      : <img className="xa-previa-img" src={url} alt={`Vista previa de ${version.archivo.nombre}`} />
  }
  return (
    <div className="xa-hoja" aria-label="Hoja de muestra">
      <span className="xa-hoja-sello">Muestra</span>
      <p className="xa-hoja-tit">{subtipo?.nombre}</p>
      <p className="xa-hoja-nom">{persona.name}</p>
      <p className="xa-hoja-doc">{persona.documento}</p>
      <div className="xa-hoja-lineas" aria-hidden="true">
        {[92, 78, 85, 60, 88, 70].map((w, i) => <span key={i} style={{ width: `${w}%` }} />)}
      </div>
      <p className="xa-hoja-pie">
        Emitido {fechaNum(version.emision)}{version.vencimiento ? ` · válido hasta ${fechaNum(version.vencimiento)}` : ''}
      </p>
      <p className="xa-hoja-nota">Documento de los datos de ejemplo: no tiene archivo real. Los que se carguen en esta demo se ven aquí tal cual.</p>
    </div>
  )
}

/* Un motivo obligatorio antes de confirmar: rechazo y exoneración. */
function ModalMotivo({ titulo, Icono, texto, placeholder, accion, peligro, onCerrar, onConfirmar }) {
  const [m, setM] = useState('')
  const [intento, setIntento] = useState(false)
  const ok = m.trim().length >= 5
  const pie = (
    <>
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
      <button type="button" className={`pl-btn-save${peligro ? ' xa-btn-peligro' : ''}`} onClick={() => { setIntento(true); if (ok) onConfirmar(m.trim()) }}>{accion}</button>
    </>
  )
  return (
    <Modal titulo={titulo} Icono={Icono} onCerrar={onCerrar} pie={pie} ancho={480}>
      <p className="xa-modal-txt">{texto}</p>
      <label className="xa-campo">
        <span className="pl-label">Motivo <span className="pl-req" aria-hidden="true">*</span></span>
        <textarea className="pl-input xa-textarea" rows={3} value={m} onChange={e => setM(e.target.value)} placeholder={placeholder} autoFocus />
        {intento && !ok && <small className="xa-rojo">Escriba el motivo (al menos unas palabras).</small>}
      </label>
    </Modal>
  )
}

/* ENVIAR A LA PAPELERA PIDE DOS CONFIRMACIONES Y UN MOTIVO (RF-88), y aun así no borra: el
   documento sale de las vistas y se puede recuperar durante el plazo de la papelera (RF-89). */
function ModalPapelera({ nombre, dias, onCerrar, onConfirmar }) {
  const [m, setM] = useState('')
  const [paso, setPaso] = useState(1)
  const ok = m.trim().length >= 5
  const pie = (
    <>
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
      {paso === 1
        ? <button type="button" className="pl-btn-save xa-btn-peligro" disabled={!ok} onClick={() => setPaso(2)}>Continuar</button>
        : <button type="button" className="pl-btn-save xa-btn-peligro" onClick={() => onConfirmar(m.trim())}>Sí, enviar a la papelera</button>}
    </>
  )
  return (
    <Modal titulo="Enviar a la papelera" Icono={Trash2} onCerrar={onCerrar} pie={pie} ancho={480}>
      {paso === 1 ? (
        <>
          <p className="xa-modal-txt">«{nombre}» dejará de verse en el expediente y dejará de contar para sus requisitos. No se borra: queda en la papelera {dias} días y se puede recuperar.</p>
          <label className="xa-campo">
            <span className="pl-label">¿Por qué se elimina? <span className="pl-req" aria-hidden="true">*</span></span>
            <textarea className="pl-input xa-textarea" rows={3} value={m} onChange={e => setM(e.target.value)} placeholder="Se cargó en el expediente equivocado." autoFocus />
          </label>
        </>
      ) : (
        <div className="xa-confirma">
          <Trash2 size={20} aria-hidden="true" />
          <p><b>¿Confirma que desea enviar «{nombre}» a la papelera?</b></p>
          <p className="dc-muted">Motivo: {m.trim()}</p>
        </div>
      )}
    </Modal>
  )
}

/* ── EL HISTORIAL DE LA PERSONA (Documentación v2) ─────────────────────────
   La bitácora de esta persona leída como su historia documental: qué entregó, qué se le pidió, qué
   recibió, qué pidió ella. Se filtra por tipo de movimiento y se exporta. Sigue siendo la misma
   bitácora inmutable: nadie puede editarla ni borrarla (RF-85). */
const GRUPOS_HISTORIAL = [
  { clave: '', label: 'Todo' },
  { clave: 'documentos', label: 'Documentos', entidades: ['documento', 'pendiente', 'requisito', 'expediente'] },
  { clave: 'emisiones', label: 'Recibidos de la empresa', entidades: ['emitido'] },
  { clave: 'contratos', label: 'Contratos', entidades: ['contrato'] },
  { clave: 'solicitudes', label: 'Solicitudes', entidades: ['solicitud'] },
]
const MESES_HIST = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function Historial({ eventos }) {
  const [grupo, setGrupo] = useState('')
  const g = GRUPOS_HISTORIAL.find(x => x.clave === grupo)
  const lista = [...eventos]
    .filter(ev => !g?.entidades || g.entidades.includes(ev.entidad))
    .sort((a, b) => (`${a.fecha} ${a.hora || ''}` < `${b.fecha} ${b.hora || ''}` ? 1 : -1))
  const porMes = []
  for (const ev of lista) {
    const k = ev.fecha.slice(0, 7)
    const ultimo = porMes[porMes.length - 1]
    if (ultimo?.k === k) ultimo.eventos.push(ev)
    else porMes.push({ k, titulo: `${MESES_HIST[Number(k.slice(5)) - 1]} ${k.slice(0, 4)}`, eventos: [ev] })
  }
  const cuantos = clave => (clave ? eventos.filter(ev => GRUPOS_HISTORIAL.find(x => x.clave === clave).entidades.includes(ev.entidad)).length : eventos.length)
  return (
    <section className="dc-tarjeta xa-historial">
      <div className="dc-tarjeta-cab">
        <div className="xa-segmento" role="group" aria-label="Tipo de movimiento">
          {GRUPOS_HISTORIAL.map(x => (
            <button key={x.clave} type="button" className={grupo === x.clave ? 'on' : ''} aria-pressed={grupo === x.clave} onClick={() => setGrupo(x.clave)}>
              {x.label} <span className="xa-ver-n">{cuantos(x.clave)}</span>
            </button>
          ))}
        </div>
        <span className="dc-muted xa-grupo-n">Bitácora inmutable: nadie puede editarla ni borrarla.</span>
      </div>
      <div className="dc-tarjeta-cuerpo">
        {lista.length === 0 ? (
          <Vacio Icono={History} titulo="Sin movimientos de este tipo" />
        ) : porMes.map(m => (
          <div key={m.k} className="xa-hist-mes">
            <h3 className="xa-hist-mes-tit">{m.titulo}</h3>
            <ol className="xa-linea">
              {m.eventos.map(ev => (
                <li key={ev.id} className={`xa-evento xa-ev-${ev.accion}`}>
                  <span className="xa-evento-punto" aria-hidden="true" />
                  <div>
                    <p className="xa-evento-tit"><b>{ACCIONES_BITACORA[ev.accion] || ev.accion}</b> · {ev.detalle}</p>
                    <p className="xa-evento-meta">{fechaCorta(ev.fecha)}{ev.hora ? ` · ${ev.hora}` : ''} · {ev.usuario}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  )
}
