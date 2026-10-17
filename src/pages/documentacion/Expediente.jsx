import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, ChevronRight, LayoutGrid, List as ListIcon, Upload, Download, FilePlus2, Eye, RefreshCw, Check, X, Trash2, Search,
  FolderOpen, Lock, FileText, History, Ban, FileSignature, Archive, MinusCircle,
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
import Paginacion from '../../components/layout/Paginacion'
import SelectorDocumento from '../../components/documentacion/SelectorDocumento'
import SelectorFecha from '../../components/layout/SelectorFecha'
import { useArchivoLocal } from '../../hooks/useArchivoLocal'
import PaginasPdf from '../../components/documentacion/PaginasPdf'
import { leerArchivo, guardarArchivo, nuevaClaveArchivo } from '../../utils/archivosLocales'
import { extensionDe } from '../../components/documentacion/deducir'
import {
  ESTADOS, CATEGORIAS, MODALIDADES, ACCIONES_BITACORA, fechaCorta, fechaNum, diasHasta,
  estadoVersion, versionActual, estadoContrato, rellenar, normalizarNombre, sumarMeses, iso, hoy, nombreEmitido,
  carpetasRecibidas, carpetaRecibida, siguienteNumero,
} from '../../data/documentacionData'
import PanelEmision from './PanelEmision'
import HojaEmitido from '../../components/documentacion/HojaEmitido'
import { Mosaico, IconoCarpeta } from '../colaborador/MisDocumentos'
import '../colaborador/misDocumentos.css'
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

   LOS REQUISITOS VIENEN DE LA CONFIGURACIÓN: lo que el subtipo exige a todo el personal ya figura.
   «Agregar requisito» a una sola persona se quitó (16 oct 2026).

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
    checklist, avanceDe, revisar, sinClasificar, clasificar, descartarSinClasificar, eliminarDocumento, registrarDescarga, quitarRequisito,
  } = doc
  const persona = personaDe(id)

  const [busca, setBusca] = useState('')
  const [filtroEstado, setFiltroEstado] = useState(() => params.get('estado') || '')
  const [rechazo, setRechazo] = useState(null)       // docId
  const [papelera, setPapelera] = useState(null)     // docId
  const [anulado, setAnulado] = useState(false)      // recién anulado: muestra el sello de éxito
  const [emitiendo, setEmitiendo] = useState(null)   // { categoria? }
  const [verEmitido, setVerEmitido] = useState(null) // emitido
  const [descargando, setDescargando] = useState(false)
  const [aviso, setAviso] = useState('')
  /* Lo que la carga directa no pudo resolver sola: abre el formulario con esos archivos puestos. */
  /* Lo recién subido, para el aviso con «Revisar fechas» y para la ventana que las corrige. */
  const [subida, setSubida] = useState(null)
  const [fechasDe, setFechasDe] = useState(null)
  /* Cada aviso de subida lleva su número, para que el que vence a los 9 s no borre a uno más nuevo. */
  const marcas = useRef(0)

  const abrir = (k, v) => { const q = Object.fromEntries(params.entries()); q[k] = v; setParams(q) }
  const cerrar = k => { const q = Object.fromEntries(params.entries()); delete q[k]; setParams(q, { replace: true }) }
  /* De la vista de un documento a cargar su versión nueva: un solo cambio de URL. Hecho en dos
     pasos, el segundo leía los parámetros de antes y dejaba la vista abierta debajo. */
  const pasarACargar = (subtipoId, docId) => { const q = Object.fromEntries(params.entries()); delete q.doc; q.cargar = subtipoId; if (docId) q.reemplaza = docId; setParams(q, { replace: true }) }
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
       acá solo, con su estado. La clave sigue siendo «emitidos» por los enlaces. */
    {
      clave: 'emitidos', nombre: 'Recibidos', color: FIJAS.emitidos,
      cuenta: plural(susEmitidos.length, 'documento', 'documentos'),
      insignia: String(susEmitidos.length), insigniaTono: 'gris',
      aviso: susEmitidos.length
        ? Object.keys(CATEGORIAS).map(k => { const n = susEmitidos.filter(e => e.categoria === k).length; return n ? `${n} ${(n === 1 ? CATEGORIAS[k].label : CATEGORIAS[k].plural).toLowerCase()}` : null }).filter(Boolean).join(' · ')
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
      /* ANULADOS, NO PAPELERA (16 oct 2026): un documento no se borra ni se recupera; se anula con
         su motivo y queda acá para siempre. La clave sigue siendo «papelera» por los enlaces. */
      clave: 'papelera', nombre: 'Anulados', color: FIJAS.papelera,
      cuenta: enPapelera.length ? plural(enPapelera.length, 'documento', 'documentos') : 'Ninguno',
      insignia: String(enPapelera.length), insigniaTono: 'gris',
      aviso: enPapelera.length ? plural(enPapelera.length, 'anulado', 'anulados') : 'Ninguno',
      tono: 'muted',
    },
  ]
  /* La carpeta va en la ruta; `?carpeta=` se sigue leyendo para los enlaces que ya existían. */
  const carpetaParam = carpetaRuta || params.get('carpeta')
  /* LO RECIBIDO, POR TIPO (16 oct 2026): como en Mis documentos, «De RR.HH.» tiene una carpeta por
     tipo —Certificados, Memorándums, los que creó la empresa y Otros—. Todas son la carpeta
     «emitidos» filtrada con `?de=`; el nombre que se ve es el del tipo. */
  const deParam = params.get('de')
  /* «Otros» sólo si tiene algo —un archivo propio que se le envió—: no es un tipo que se haya creado. */
  const carpetasRrhh = carpetasRecibidas(parametros).filter(([k]) => k !== 'otro' || susEmitidos.some(e => carpetaRecibida(e, parametros) === 'otro'))
  const deNombre = deParam ? carpetasRrhh.find(([k]) => k === deParam)?.[1] : null
  const carpetaBase = carpetas.find(c => c.clave === carpetaParam) || null
  const carpeta = carpetaBase?.clave === 'emitidos' && deNombre ? { ...carpetaBase, nombre: deNombre } : carpetaBase
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

  /* SUBIR ABRE EL MODAL GRANDE (16 oct 2026): «Subir documento», «Subir», «Renovar» y «Subir otro»
     abren `ModalSubir` con ese documento ya elegido —o lo primero que falta— y la dirección lo
     recuerda (`?cargar=`). Ya no se sube a ciegas ni queda nada «por clasificar» desde aquí. */
  /* QUÉ SE SUBE DEPENDE DE LA CARPETA: en Contratos se registra un contrato; en lo recibido
     (Certificados, Memorándums…), un archivo de ese tipo; en el resto, el modal grande. */
  const elegirArchivo = (subtipoId, docId) => {
    if (cerrado) return
    const q = Object.fromEntries(params.entries())
    q.cargar = subtipoId || 'nuevo'
    if (docId) q.reemplaza = docId; else delete q.reemplaza
    setParams(q)
  }
  const cerrarSubir = () => { const q = Object.fromEntries(params.entries()); delete q.cargar; delete q.reemplaza; delete q.en; setParams(q, { replace: true }) }

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
          onCargar={() => elegirArchivo(f.subtipo.id, f.documento?.id)}
          onAprobar={() => { revisar(f.documento.id, true); avisar(`«${f.subtipo.nombre}» aprobado: ya cuenta como cumplido.`) }}
          onRechazar={() => setRechazo(f.documento.id)}
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

      {/* ── LO PENDIENTE, COMO EN MIS DOCUMENTOS (16 oct 2026): la misma franja oscura que ve el
          colaborador —el anillo con lo cumplido y cuánto debe—, con sus botones para ver justo eso.
          Dentro de una carpeta siguen las pastillas, que filtran. ── */}
      {!cerrado && !carpeta && !filtrando && hayAlgo && (
        <FranjaPendiente avance={avance} revision={nRevision} faltan={nFaltan} vencen={nVencen}
          onVer={clave => setFiltroEstado(clave)} />
      )}
      {!cerrado && (carpeta || filtrando) && (
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
          emitidos={deParam ? susEmitidos.filter(e => carpetaRecibida(e, parametros) === deParam) : susEmitidos}
          papelera={enPapelera}
          lista={listaDeFilas}
          pendientes={carpeta.clave === 'porclasificar' ? misPendientes : misPendientes.filter(x => x.tipoId === carpeta.clave)}
          opciones={opcionesClasificar(carpeta.filas ? carpeta.clave : null)}
          onClasificar={alClasificar}
          onDescartar={id => { descartarSinClasificar(id); avisar('Archivo eliminado.') }}
          onVer={docId => abrir('doc', docId)}
          onCargar={(subtipoId, docId) => elegirArchivo(subtipoId === 'nuevo' ? null : subtipoId, docId)}
          onQuitar={f => { quitarRequisito(persona.id, f.subtipo.id); avisar(`Ya no se le exige «${f.subtipo.nombre}».`) }}
          onPapelera={docId => setPapelera(docId)}
          onDescargar={f => descargarVersion(persona, f.subtipo, versionActual(f.documento), f.documento, registrarDescarga)}
          onContrato={cid => navigate(`/documentos/expedientes/contrato/${cid}`)}
          onVerEmitido={abrirEmitido}
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
      </div>

      {!hayAlgo ? (
        <div className="dc-tarjeta">
          <Vacio
            Icono={FolderOpen}
            titulo="No tiene documentos ni requisitos"
            texto={cerrado ? 'Su expediente se cerró sin documentos.' : 'Cargue los documentos que ya entregó.'}
          >
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
        /* ── TODAS LAS CARPETAS, COMO EN MIS DOCUMENTOS (16 oct 2026): las mismas carpetas amarillas
            que ve el colaborador, con el punto de lo más urgente y una palabra en su línea. «Sus
            carpetas» son lo que la persona entrega y sus contratos; «De RR.HH.», lo que la empresa le
            envió. El historial se abre desde su botón de arriba; los anulados, sólo si hay alguno. ── */
        <>
          <div className="md-seccion"><h2>Sus carpetas</h2><span className="dc-muted">Lo que entrega y sus contratos</span></div>
          <div className="md-grilla">
            {carpetas.filter(c => !['historial', 'papelera', 'emitidos'].includes(c.clave)).map(c => (
              <Mosaico key={c.clave} titulo={c.nombre}
                sub={['rojo', 'ambar', 'azul'].includes(c.tono) ? `${c.cuenta === c.aviso ? '' : `${c.cuenta} · `}${c.aviso}` : c.cuenta}
                punto={{ rojo: 'rojo', ambar: 'ambar', azul: 'azul' }[c.tono]}
                onClick={() => navigate(`/documentos/expedientes/${persona.id}/${c.clave}`)} />
            ))}
          </div>
          <div className="md-seccion"><h2>De RR.HH.</h2><span className="dc-muted">Lo que la empresa le emitió</span></div>
          <div className="md-grilla">
            {carpetasRrhh.map(([cat, nombre]) => {
              const suyos = susEmitidos.filter(e => carpetaRecibida(e, parametros) === cat)
              return (
                <Mosaico key={cat} titulo={nombre}
                  sub={plural(suyos.length, 'documento', 'documentos')}
                  onClick={() => navigate(`/documentos/expedientes/${persona.id}/emitidos?de=${cat}`)} />
              )
            })}
            {carpetas.filter(c => c.clave === 'papelera' && enPapelera.length).map(c => (
              <Mosaico key={c.clave} titulo={c.nombre} sub={c.aviso} onClick={() => navigate(`/documentos/expedientes/${persona.id}/${c.clave}`)} />
            ))}
          </div>
        </>
      )}

        </>
      )}

      {/* ── MODALES ── */}
      {/* SUBIR DEPENDE DE DÓNDE SE ESTÁ (16 oct 2026): dentro de una carpeta, su modal; desde la
          vista general, primero «¿En qué carpeta?» y la elegida queda en `?en=`, para volver. */}
      {cargarParam && !cerrado && (() => {
        const enParam = params.get('en') || ''
        const elegirEn = v => { const q = Object.fromEntries(params.entries()); q.en = v; setParams(q, { replace: true }) }
        const volver = enParam ? () => { const q = Object.fromEntries(params.entries()); delete q.en; delete q.reemplaza; setParams(q, { replace: true }) } : null
        const hecho = t => { cerrarSubir(); avisar(t) }
        let modo = 'elegir', tipoId = '', cat = ''
        if (cargarParam !== 'nuevo') { modo = 'doc'; tipoId = subtipos.find(x => x.id === cargarParam)?.tipoId || '' }
        else if (carpeta?.filas) { modo = 'doc'; tipoId = carpeta.clave }
        else if (carpeta?.clave === 'emitidos') { modo = 'rrhh'; cat = deParam && carpetasRrhh.some(([k]) => k === deParam) ? deParam : '' }
        else if (carpeta?.clave === 'contratos' || enParam === 'contrato') modo = 'contrato'
        else if (enParam.startsWith('rrhh:')) { modo = 'rrhh'; cat = enParam.slice(5) }
        else if (enParam) { modo = 'doc'; tipoId = enParam }

        if (modo === 'elegir') return <ElegirCarpeta persona={persona} filas={filas} emitidos={susEmitidos} contratos={susContratos} onElegir={elegirEn} onCerrar={cerrarSubir} />
        if (modo === 'rrhh') return <ModalSubirRecibido key={cat} persona={persona} categoria={cat} opciones={carpetasRecibidas(parametros)} emitidosDe={susEmitidos} onCerrar={cerrarSubir} onSubido={hecho} onVolver={volver} />
        if (modo === 'contrato') return <ModalSubirContrato persona={persona} contratos={susContratos} onCerrar={cerrarSubir} onSubido={hecho} onNuevo={() => { cerrarSubir(); setEmitiendo({ categoria: 'contrato' }) }} onVolver={volver} />
        return (
          <ModalSubir
            key={tipoId}
            persona={persona}
            filas={filas}
            inicial={cargarParam === 'nuevo' ? '' : cargarParam}
            inicialDoc={params.get('reemplaza') || ''}
            tipoInicial={tipoId}
            onVolver={volver}
            onCerrar={cerrarSubir}
            onSubido={({ nombre, reemplazo }) => hecho(reemplazo ? `«${nombre}» se reemplazó. El anterior quedó como versión anterior.` : `«${nombre}» se subió.`)}
          />
        )
      })()}

      {filaDoc && (
        <VistaDocumento
          documento={filaDoc}
          persona={persona}
          cerrado={cerrado || !!filaDoc.eliminado}
          onCerrar={() => cerrar('doc')}
          onRechazar={() => setRechazo(filaDoc.id)}
          onAprobar={() => { revisar(filaDoc.id, true); avisar('Documento aprobado.') }}
          onRenovar={() => pasarACargar(filaDoc.subtipoId, filaDoc.id)}
        />
      )}

      {emitiendo && (
        <Modal titulo={emitiendo.categoria === 'contrato' ? `Registrar contrato · ${persona.name}` : `Enviar a ${persona.name}`} Icono={emitiendo.categoria === 'contrato' ? FileSignature : FilePlus2} onCerrar={() => setEmitiendo(null)} ancho={1100}>
          <PanelEmision preset={{ colaboradorId: persona.id, categoria: emitiendo.categoria }} personaFija enModal />
        </Modal>
      )}

      {verEmitido && (
        <VistaEmitido emitido={verEmitido} modelo={modelos.find(m => m.id === verEmitido.modeloId)} onCerrar={() => setVerEmitido(null)} />
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

      {papelera && (
        <ModalPapelera
          nombre={subtipos.find(s => s.id === documentos.find(d => d.id === papelera)?.subtipoId)?.nombre}
          onCerrar={() => setPapelera(null)}
          onReemplazar={() => { const d = documentos.find(x => x.id === papelera); setPapelera(null); pasarACargar(d?.subtipoId, papelera) }}
          onConfirmar={m => {
            eliminarDocumento(papelera, m)
            setPapelera(null)
            setAnulado(true)
          }}
        />
      )}

      {anulado && <ModalAnulado onCerrar={() => setAnulado(false)} />}
    </div>
  )
}

/* Orden dentro de un tipo: lo que pide atención primero. */
const PRIORIDAD = { vencido: 0, rechazado: 1, faltante: 2, en_revision: 3, por_vencer: 4, vigente: 5, exonerado: 6 }
const orden = f => PRIORIDAD[f.estado] ?? 9

/* De dónde sale que se le pida: dicho en la fila, porque decide qué se puede hacer con ella. Lo
   exigido a todos ya no se exonera (16 oct 2026); lo agregado a esta persona, además, se puede dejar de exigir. */
function origenDe(requisito) {
  if (!requisito) return 'no exigido'
  if (!requisito.obligatorio) return 'opcional'
  return requisito.origen === 'personal' ? 'exigido a esta persona' : 'exigido a todos'
}

/* ── UNA FILA DEL EXPEDIENTE ──────────────────────────────────────────────
   A la vista, lo que se hace seguido: cargar, renovar, revisar, ver y descargar. Lo que se hace
   rara vez —dejar de exigir, anular— va en el menú de tres puntos. */
function FilaDocumento({ fila, cerrado, onVer, onCargar, onAprobar, onRechazar, onQuitar, onPapelera, onDescargar }) {
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
    requisito?.origen === 'personal' && !documento && { label: 'Dejar de exigir', Icono: MinusCircle, onClick: onQuitar },
    documento && documento.origen !== 'ficha' && { label: 'Anular', Icono: Ban, onClick: onPapelera, peligro: true },
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
/* LA LISTA PAGINA (16 oct 2026), como la tabla de Expedientes: de a 10, con su encabezado. La
   gráfica sigue de a 24 con «Mostrar más», que es como se recorren tarjetas. */
const POR_PAGINA_LISTA = 10
// Lista primero (16 oct 2026): es la vista de entrada; la gráfica, la segunda opción.
const leerVista = () => { try { return localStorage.getItem('doc_vista_carpeta') || 'lista' } catch { return 'lista' } }
const guardarVista = v => { try { localStorage.setItem('doc_vista_carpeta', v) } catch { /* sin almacenamiento: se queda en esta visita */ } }

function PaginaCarpeta({carpeta, cerrado, contratos, emitidos, papelera, lista, pendientes = [], opciones, onClasificar, onDescartar, onVer, onCargar, onQuitar, onPapelera, onDescargar, onContrato, onVerEmitido }) {
  const { modelos, subtipos, parametros, contratos: todos } = useDocumentacion()
  const [busca, setBusca] = useState('')
  const [vista, setVista] = useState(leerVista)
  const [cuantos, setCuantos] = useState(DE_A)
  const [pagina, setPagina] = useState(1)
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
    if (f.estado === 'rechazado') return { label: 'Subir otro', onClick: () => onCargar(f.subtipo.id, f.documento?.id), principal: true }
    if (f.estado === 'vencido' || f.estado === 'por_vencer') return { label: 'Renovar', onClick: () => onCargar(f.subtipo.id, f.documento?.id), principal: true }
    if (f.estado === 'en_revision') return { label: 'Revisar', onClick: () => onVer(f.documento.id), principal: true }
    return f.documento ? { label: 'Ver', onClick: () => onVer(f.documento.id), principal: false } : null
  }
  const menuDe = (f, accion) => [
    f.documento && accion?.label !== 'Ver' && accion?.label !== 'Revisar' && { label: 'Ver', Icono: Eye, onClick: () => onVer(f.documento.id) },
    f.documento && { label: 'Descargar', Icono: Download, onClick: () => onDescargar(f) },
    !cerrado && f.requisito?.origen === 'personal' && !f.documento && { label: 'Dejar de exigir', Icono: MinusCircle, onClick: () => onQuitar(f) },
    !cerrado && f.documento && f.documento.origen !== 'ficha' && { label: 'Anular', Icono: Ban, onClick: () => onPapelera(f.documento.id), peligro: true },
  ].filter(Boolean)

  return (
    <div className="xa-pagina-carpeta" style={{ '--c-osc': carpeta.color.osc, '--c-cla': carpeta.color.cla, '--c-tin': carpeta.color.tin }}>
      <div className="xa-carpeta-barra">
        <div className="pl-search-wrap xa-busca">
          <Search size={13} className="pl-search-ico" />
          <input type="search" className="pl-search" placeholder={`Buscar en ${carpeta.nombre.toLowerCase()}…`} value={busca} onChange={e => { setBusca(e.target.value); setCuantos(DE_A); setPagina(1) }} aria-label={`Buscar en ${carpeta.nombre}`} />
        </div>
        {esTipo && filas.length > 0 && (
          <div className="xa-modo-vista" role="group" aria-label="Vista">
            <button type="button" className={vista === 'lista' ? 'on' : ''} aria-pressed={vista === 'lista'} onClick={() => cambiarVista('lista')} title="Ver los documentos en una lista"><ListIcon size={15} aria-hidden="true" /> Lista</button>
            <button type="button" className={vista === 'hojas' ? 'on' : ''} aria-pressed={vista === 'hojas'} onClick={() => cambiarVista('hojas')} title="Ver los documentos en tarjetas"><LayoutGrid size={15} aria-hidden="true" /> Gráfica</button>
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

      {esTipo && vista === 'lista' && docsVisibles.length > 0 && (() => {
        const paginas = Math.max(1, Math.ceil(docsVisibles.length / POR_PAGINA_LISTA))
        const pag = Math.min(pagina, paginas)
        return (
          <section className="dc-tarjeta xa-grupo">
            <div className="xa-fila xa-fila-cab" aria-hidden="true">
              <span>Documento</span><span>Estado</span><span>Vencimiento</span><span className="xa-fila-cab-acc">Acciones</span>
            </div>
            {lista(docsVisibles.slice((pag - 1) * POR_PAGINA_LISTA, pag * POR_PAGINA_LISTA))}
            <Paginacion page={pag} setPage={n => setPagina(typeof n === 'function' ? n(pag) : n)} total={docsVisibles.length} perPage={POR_PAGINA_LISTA} nombre="documentos" nombreUno="documento" />
          </section>
        )
      })()}

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
                  <span className="xa-hoja-detalle">{e.numero} · {fechaCorta(e.fecha)}{e.firmado ? <> · <span className="dc-chip dc-t-verde xu-chip">Firmado</span></> : e.estado === 'generado' ? <> · <span className="dc-chip dc-t-ambar xu-chip">Sin firmar</span></> : null}</span>
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
                <span className="xa-hoja-detalle">Anulado el {fechaCorta(d.eliminado.fecha)}{d.eliminado.por ? ` por ${d.eliminado.por}` : ''}: {d.eliminado.motivo}</span>
                <div className="xa-hoja-acc"><button type="button" className="xa-hoja-btn" onClick={() => onVer(d.id)}><Eye size={13} /> Ver</button></div>
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

      {total > cuantos && !(esTipo && vista === 'lista') && (
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
                    : <Vacio Icono={Ban} titulo="No tiene documentos anulados" texto="Un documento anulado se guarda aquí con su motivo. No se borra." />}
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
/* CON FIRMADO (16 oct 2026), se abre en el escaneado firmado y se puede ver el que generó el sistema. */
function VistaEmitido({ emitido: e, modelo, onCerrar }) {
  const [ver, setVer] = useState(e.firmado ? 'firmado' : 'original')
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
      {e.firmado && (
        <div className="xa-segmento" role="group" aria-label="Qué versión ver" style={{ alignSelf: 'flex-start' }}>
          <button type="button" className={ver === 'firmado' ? 'on' : ''} aria-pressed={ver === 'firmado'} onClick={() => setVer('firmado')}>Firmado · {fechaCorta(e.firmado.fecha)}</button>
          <button type="button" className={ver === 'original' ? 'on' : ''} aria-pressed={ver === 'original'} onClick={() => setVer('original')}>El que generó el sistema</button>
        </div>
      )}
      {ver === 'firmado' && e.firmado
        ? <HojaEmitido emitido={{ ...e, archivo: e.firmado.archivo }} />
        : <HojaEmitido emitido={{ ...e, texto }} />}
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
  const { subtipos, parametros, registrarDescarga, personas, bitacora, documentos } = useDocumentacion()
  const subtipo = subtipos.find(s => s.id === documento.subtipoId)
  /* LOS ANULADOS SON PARTE DEL HISTORIAL (16 oct 2026): anular y subir el correcto crea otro
     documento, pero para quien lo mira es el mismo croquis. Debajo de las versiones del actual van
     los anulados del mismo documento, con su motivo, y se previsualizan igual. Un subtipo de
     varios (vacunas, cursos) no: cada uno es un documento distinto. */
  const anulados = subtipo?.varios ? [] : documentos
    .filter(d => d.id !== documento.id && d.eliminado && d.colaboradorId === persona.id && d.subtipoId === documento.subtipoId)
    .sort((a, b) => (a.eliminado.fecha < b.eliminado.fecha ? 1 : -1))
  const versiones = [
    ...[...documento.versiones].reverse().map((x, i) => ({ ...x, clave: `${documento.id}-${x.v}`, doc: documento, etiqueta: documento.eliminado ? 'Anulado' : i === 0 ? 'Actual' : 'Reemplazada' })),
    ...anulados.flatMap(d => [...d.versiones].reverse().map(x => ({ ...x, clave: `${d.id}-${x.v}`, doc: d, etiqueta: `Anulado el ${fechaCorta(d.eliminado.fecha)}` }))),
  ]
  /* QUIÉN, CON NOMBRE Y CARGO (16 oct 2026): «lo aprobó RR.HH.» no alcanza cuando RR.HH. son
     cinco personas. Cada versión dice quién la subió y quién la aprobó o rechazó, y cuándo. Si la
     versión no lo guardó (datos viejos), se busca en la bitácora del documento; lo que carga
     RR.HH. entra aprobado por quien lo cargó. */
  const cargoDe = nombre => personas.find(p => p.name === nombre)?.cargo
  // Por la app sólo sube el propio colaborador: es él quien lo subió, diga lo que diga el dato viejo.
  const subio = x => (x.canal === 'app' ? persona.name : x.subidoPor)
  const quien = nombre => (nombre ? <>{nombre}{cargoDe(nombre) ? <small className="xa-quien-cargo"> · {cargoDe(nombre)}</small> : null}</> : null)
  const revisionDe = x => {
    if (x.revision === 'pendiente') return null
    if (x.revisadoPor) return { por: x.revisadoPor, fecha: x.revisado || x.fecha }
    const ev = (bitacora || []).find(b => b.entidad === 'documento' && b.entidadId === (x.doc || documento).id && b.accion === (x.revision === 'rechazado' ? 'rechazo' : 'aprobacion'))
    if (ev) return { por: ev.usuario, fecha: ev.fecha }
    if (x.revision === 'aprobado' && x.canal !== 'app') return { por: x.subidoPor, fecha: x.fecha, alSubir: true }
    return null
  }
  const [elegida, setElegida] = useState(versiones[0].clave)
  const anotado = useRef(null)
  const v = versiones.find(x => x.clave === elegida) || versiones[0]
  const anuladoV = v.doc.eliminado
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
      <button type="button" className="pl-btn-save" onClick={() => descargarVersion(persona, subtipo, v, v.doc, registrarDescarga)}><Download size={13} /> Descargar</button>
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
            <div><dt>Subido por</dt><dd>{quien(subio(v))}<span className="xa-quien-cuando">{fechaCorta(v.fecha)} · {v.canal === 'app' ? 'desde la app' : v.canal === 'lote' ? 'por lote' : v.canal === 'ficha' ? 'en la ficha del colaborador' : 'web'}</span></dd></div>
            {(() => {
              const r = revisionDe(v)
              if (v.revision === 'pendiente') return <div><dt>Revisión</dt><dd>Todavía nadie lo revisó</dd></div>
              if (!r) return null
              return <div><dt>{v.revision === 'rechazado' ? 'Rechazado por' : 'Aprobado por'}</dt><dd>{quien(r.por)}<span className="xa-quien-cuando">{fechaCorta(r.fecha)}{r.alSubir ? ' · al subirlo, porque lo cargó RR.HH.' : ''}</span></dd></div>
            })()}
            {v.info && <div><dt>Información adicional</dt><dd>{v.info}</dd></div>}
            {v.motivoRechazo && <div><dt>Motivo del rechazo</dt><dd className="xa-rojo">{v.motivoRechazo}</dd></div>}
            {v.motivoCambio && <div><dt>Motivo del cambio</dt><dd>{v.motivoCambio}</dd></div>}
            {anuladoV && <div><dt>Anulado por</dt><dd>{quien(anuladoV.por)}<span className="xa-quien-cuando">{fechaCorta(anuladoV.fecha)}</span></dd></div>}
            {anuladoV && <div><dt>Motivo de la anulación</dt><dd className="xa-rojo">{anuladoV.motivo}</dd></div>}
          </dl>
          <h3 className="xa-vista-sub">{anulados.length ? 'Historial' : 'Versiones'}</h3>
          <ol className="xa-versiones">
            {versiones.map(x => (
              <li key={x.clave}>
                <button type="button" className={`${x.clave === elegida ? 'on' : ''}${x.doc.eliminado ? ' xa-ver-anulada' : ''}`} onClick={() => setElegida(x.clave)} aria-pressed={x.clave === elegida}>
                  <span className="xa-ver-1"><b>v{x.v}</b> · {fechaCorta(x.fecha)}</span>
                  <span className="xa-ver-2">{x.etiqueta} · subió {subio(x)}{(() => { const r = revisionDe(x); return r ? ` · ${x.revision === 'rechazado' ? 'rechazó' : 'aprobó'} ${r.por}` : x.revision === 'pendiente' ? ' · en revisión' : '' })()}</span>
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

/* Un motivo obligatorio antes de confirmar: el rechazo. */
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

/* ANULAR PIDE DOS CONFIRMACIONES Y UN MOTIVO (16 oct 2026, antes «enviar a la papelera»). Un
   documento no se borra: se anula, deja de contar para sus requisitos —así se puede subir el
   correcto— y queda en la carpeta Anulados con quién, cuándo y por qué. No se deshace. */
/* «¿SÓLO TIENE UNA VERSIÓN MÁS NUEVA?» (16 oct 2026): anular es para lo que nunca debió contar;
   un carnet renovado se reemplaza. El enlace lleva a reemplazar, para que no se anule por error
   lo que sólo quedó viejo. */
function ModalPapelera({ nombre, onCerrar, onConfirmar, onReemplazar }) {
  const [m, setM] = useState('')
  const [paso, setPaso] = useState(1)
  const ok = m.trim().length >= 5
  const pie = (
    <>
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
      {paso === 1
        ? <button type="button" className="pl-btn-save xa-btn-peligro" disabled={!ok} onClick={() => setPaso(2)}>Continuar</button>
        : <button type="button" className="pl-btn-save xa-btn-peligro" onClick={() => onConfirmar(m.trim())}>Sí, anular</button>}
    </>
  )
  return (
    <Modal titulo="Anular documento" Icono={Ban} onCerrar={onCerrar} pie={pie} ancho={480}>
      {paso === 1 ? (
        <>
          <p className="xa-modal-txt">«{nombre}» queda anulado: deja de contar para sus requisitos y se guarda en la carpeta Anulados con su motivo. No se borra y no se puede deshacer. Después puede subir el documento correcto.</p>
          <label className="xa-campo">
            <span className="pl-label">¿Por qué se anula? <span className="pl-req" aria-hidden="true">*</span></span>
            <textarea className="pl-input xa-textarea" rows={3} value={m} onChange={e => setM(e.target.value)} placeholder="Se cargó en el expediente equivocado." autoFocus />
          </label>
          {onReemplazar && (
            <p className="xa-modal-txt xa-alt-reemplazar">
              ¿Sólo tiene una versión más nueva? <button type="button" className="xa-enlace-reemplazar" onClick={onReemplazar}>Use «Subir nueva versión»</button>: el actual queda en el historial como versión anterior, sin anularlo.
            </p>
          )}
        </>
      ) : (
        <div className="xa-confirma">
          <Ban size={20} aria-hidden="true" />
          <p><b>¿Confirma que desea anular «{nombre}»?</b></p>
          <p className="dc-muted">Motivo: {m.trim()}</p>
        </div>
      )}
    </Modal>
  )
}

/* ANULADO CON ÉXITO (16 oct 2026): un aviso que se va solo en tres segundos es poco para algo
   que no se deshace. Un sello centrado y un solo botón: no tiene cabecera de `Modal` porque el
   sello ya dice lo que pasó. Escape cierra, como en los demás. */
function ModalAnulado({ onCerrar }) {
  useEffect(() => {
    const tecla = e => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])
  return (
    <div className="pl-overlay" onClick={onCerrar}>
      <div className="pl-modal xa-sello" role="alertdialog" aria-modal="true" aria-labelledby="xa-sello-tit" onClick={e => e.stopPropagation()}>
        <span className="xa-sello-halo" aria-hidden="true"><span><Check size={26} strokeWidth={2.6} /></span></span>
        <h2 id="xa-sello-tit">Documento anulado con éxito</h2>
        <button type="button" className="pl-btn-save xa-sello-btn" onClick={onCerrar} autoFocus>Cerrar</button>
      </div>
    </div>
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

/* ── SUBIR UN DOCUMENTO (propuesta E, 16 oct 2026) ─────────────────────────
   Antes «Subir documento» abría el explorador y subía en el acto: lo que no se reconocía quedaba
   «por clasificar» y lo que ya existía se reemplazaba sin preguntar. Ahora es un modal grande:
   A LA IZQUIERDA, todos los documentos de la persona por carpeta, con su estado —lo que falta
   primero—; A LA DERECHA, el elegido. Siempre hay uno elegido, así que nada queda sin clasificar.
   SI YA TIENE UNO, SE PREGUNTA: el actual y el nuevo lado a lado y «¿Desea reemplazar…?». El
   actual no se borra: queda como versión anterior. Si el actual vino de la ficha, el nuevo pasa a
   ser el que vale en el expediente (manda el más nuevo, ver `todosLosDocumentos`); la ficha
   conserva el suyo. Un subtipo que admite varios no reemplaza: se guarda además.
   DESDE EL «SUBIR» DE UNA FILA (16 oct 2026) ya se sabe qué documento es: el modal se abre sólo
   con ése, sin la lista de la izquierda ni otras opciones. La lista queda para la cabecera y
   las carpetas, donde todavía hay que elegir. */
const URGENCIA_SUBIR = { vencido: 0, rechazado: 1, faltante: 2, por_vencer: 3, en_revision: 4, vigente: 5, exonerado: 6, no_exigido: 7 }
const minuscula = s => s.charAt(0).toLowerCase() + s.slice(1)
// «el documento de identidad», «la certificación profesional», «el acta de entrega»: por la primera palabra.
const conArticulo = nombre => { const w = nombre.split(' ')[0].toLowerCase(); return `${w !== 'acta' && /(a|ción|sión|dad|tad|ie)$/.test(w) ? 'la' : 'el'} ${minuscula(nombre)}` }
const peso = b => (b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1).replace('.', ',')} MB`)

function ModalSubir({ persona, filas, inicial, inicialDoc = '', tipoInicial, onCerrar, onSubido, onVolver }) {
  const { tipos, subtipos, parametros, cargarDocumento } = useDocumentacion()
  const [busca, setBusca] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const input = useRef(null)

  // Una entrada por documento posible: lo exigido, lo que ya tiene y lo demás de cada carpeta.
  const entradas = useMemo(() => subtipos
    .filter(s => s.activo && tipos.find(t => t.id === s.tipoId)?.activo !== false)
    .map(s => {
      const suyas = filas.filter(f => f.subtipo.id === s.id)
      const req = suyas.find(f => f.requisito)
      const docs = suyas.filter(f => f.documento).map(f => f.documento)
      const fila = req || suyas[0] || null
      return { subtipo: s, estado: fila?.estado || 'no_exigido', limite: fila?.limite, docs }
    }), [subtipos, tipos, filas])
  // Dentro de una carpeta se ve sólo esa carpeta; desde la vista general, todas.
  const grupos = tipos.filter(t => t.activo !== false && (!tipoInicial || t.id === tipoInicial)).map(t => ({
    tipo: t,
    entradas: entradas.filter(e => e.subtipo.tipoId === t.id)
      .sort((a, b) => URGENCIA_SUBIR[a.estado] - URGENCIA_SUBIR[b.estado] || a.subtipo.nombre.localeCompare(b.subtipo.nombre, 'es')),
  })).filter(g => g.entradas.length)

  // Lo que se pidió desde una fila; si no, lo primero que falta (de la carpeta abierta, si hay una).
  const [elegido, setElegido] = useState(() => {
    if (inicial && entradas.some(e => e.subtipo.id === inicial)) return inicial
    const todas = grupos.flatMap(g => g.entradas)
    return (todas.find(e => URGENCIA_SUBIR[e.estado] <= 2) || todas[0])?.subtipo.id || ''
  })
  const entrada = entradas.find(e => e.subtipo.id === elegido)
  const sub = entrada?.subtipo
  const fijo = !!inicial && sub?.id === inicial
  /* LOS QUE ADMITEN VARIOS —títulos, certificaciones, actas— no se reemplazan solos: si ya tiene
     alguno, se elige agregar uno nuevo o cuál de los que tiene se reemplaza. Desde «Renovar» de
     una fila llega ya elegido ése. */
  const [destino, setDestino] = useState(inicialDoc)
  const actual = !sub ? null : sub.varios ? entrada.docs.find(d => d.id === destino) || null : entrada.docs[0] || null
  const vActual = versionActual(actual)
  const deFicha = actual?.origen === 'ficha'

  const [emision, setEmision] = useState(iso(hoy()))
  const [vencimiento, setVencimiento] = useState('')
  const [vencTocado, setVencTocado] = useState(false)
  const venc = vencTocado ? vencimiento : (sub?.vence && emision ? sumarMeses(emision, sub.vigenciaMeses) : '')

  const ext = archivo ? extensionDe(archivo.name) : ''
  const error = !archivo || !sub ? ''
    : !sub.formatos.includes(ext) ? `«${sub.nombre}» acepta ${sub.formatos.map(f => f.toUpperCase()).join(', ')}. Este archivo es ${ext.toUpperCase() || 'de otro tipo'}.`
      : archivo.size / 1048576 > sub.tamanoMaxMB ? `El archivo pesa ${peso(archivo.size)} y el máximo es ${sub.tamanoMaxMB} MB.`
        : deFicha && vActual?.emision && emision < vActual.emision ? `La fecha de emisión es anterior a la del actual (${fechaCorta(vActual.emision)}): seguiría valiendo el de la ficha.`
          : ''
  const listo = !!archivo && !error && !!emision && (!sub?.vence || !!venc) && !guardando

  // La vista previa del archivo nuevo sale del navegador y se suelta al cambiarlo o al cerrar.
  const url = useMemo(() => (archivo ? URL.createObjectURL(archivo) : null), [archivo])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  const esImagen = ['jpg', 'jpeg', 'png', 'webp'].includes(ext)
  const previaNueva = url && esImagen ? <img src={url} alt="" />
    : url && ext === 'pdf' ? <div className="xa-mini-pdf"><PaginasPdf url={url} primera /></div>
      : <FileText size={26} aria-hidden="true" />

  const elegir = id => { setElegido(id); setVencTocado(false); setDestino('') }
  const tomar = files => { const f = [...(files || [])][0]; if (f) setArchivo(f) }

  const guardar = async () => {
    if (!listo) return
    setGuardando(true)
    const clave = nuevaClaveArchivo()
    const ok = await guardarArchivo(clave, archivo).catch(() => false)
    cargarDocumento({
      colaboradorId: persona.id,
      subtipoId: sub.id,
      documentoId: sub.varios && actual ? actual.id : null,
      motivo: actual ? 'Se reemplazó desde el expediente' : '',
      version: {
        archivo: { nombre: normalizarNombre(persona, sub, emision, ext), original: archivo.name, formato: ext, tamanoKB: Math.round(archivo.size / 1024), clave: ok === false ? null : clave, tipoMime: archivo.type },
        emision,
        vencimiento: sub.vence ? venc : null,
        info: '',
      },
    })
    onSubido({ nombre: sub.nombre, reemplazo: !!actual })
  }

  const texto = busca.trim().toLowerCase()
  const vigencia = sub?.vence ? (sub.vigenciaMeses % 12 ? `${sub.vigenciaMeses} meses` : plural(sub.vigenciaMeses / 12, 'año', 'años')) : ''
  const reglas = sub ? [
    sub.formatos.map(f => f.toUpperCase()).join(', '),
    `hasta ${sub.tamanoMaxMB} MB`,
    sub.vence ? `vence a los ${vigencia}` : 'no vence',
  ].join(' · ') : ''
  const pie = <>
    {!fijo && <VolverCarpetas onVolver={onVolver} />}
    <span className="xu-pie-nota">{actual ? 'El actual no se borra: queda como versión anterior.' : fijo ? '' : 'Elija a la izquierda a qué documento corresponde.'}</span>
    <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
    <button type="button" className={`pl-btn-save${actual ? ' xu-btn-reemplazar' : ''}`} disabled={!listo} onClick={guardar}>
      {guardando ? 'Guardando…' : actual ? <><RefreshCw size={14} aria-hidden="true" /> Sí, reemplazar</> : <><Upload size={14} aria-hidden="true" /> Subir documento</>}
    </button>
  </>
  const soltar = {
    onDragOver: e => { e.preventDefault(); setArrastrando(true) },
    onDragLeave: () => setArrastrando(false),
    onDrop: e => { e.preventDefault(); setArrastrando(false); tomar(e.dataTransfer.files) },
  }
  const elegirArchivo = <input ref={input} type="file" hidden accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx" onChange={e => { tomar(e.target.files); e.target.value = '' }} />

  /* UNO NUEVO DESDE SU FILA (propuesta C, 16 oct 2026): la vista previa grande a la izquierda y, a
     la derecha, la revisión del archivo —formato, tamaño y con qué nombre se guarda— y las
     fechas. Se ve qué se sube y que está bien antes de confirmar. */
  if (fijo && !actual) {
    const formatoOk = archivo && sub.formatos.includes(ext)
    const tamanoOk = archivo && archivo.size / 1048576 <= sub.tamanoMaxMB
    const revisado = (ok, txt, dato) => (
      <li className={`xv-check${!archivo ? ' espera' : ok ? ' ok' : ' mal'}`}>
        <span className="xv-check-ico" aria-hidden="true">{!archivo ? null : ok ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}</span>
        <span className="xv-check-txt">{txt}</span>
        {dato && <span className="xv-check-dato">{dato}</span>}
      </li>
    )
    return (
      <Modal titulo={`Subir ${minuscula(sub.nombre)} · ${persona.name}`} Icono={Upload} onCerrar={onCerrar} ancho={940} pie={pie}>
        <div className="xv-dos">
          <div className="xv-izq">
            <div className={`xv-previa${archivo ? '' : ' vacia'}${arrastrando ? ' on' : ''}`} {...soltar}>
              {!archivo ? (
                <button type="button" className="xv-soltar" onClick={() => input.current?.click()}>
                  <Upload size={26} aria-hidden="true" />
                  <b>Arrastre aquí el archivo</b>
                  <span>o haga clic para elegirlo · {reglas}</span>
                </button>
              ) : esImagen ? <img src={url} alt={`Vista previa de ${archivo.name}`} />
                : ext === 'pdf' ? <div className="xv-pdf"><PaginasPdf url={url} /></div>
                  : <div className="xv-sin-previa"><FileText size={34} aria-hidden="true" /><span>Este formato no tiene vista previa</span></div>}
            </div>
            {archivo && (
              <div className="xv-archivo">
                <span className="xv-archivo-nom"><b>{archivo.name}</b> · {peso(archivo.size)}</span>
                <button type="button" className="dc-btn dc-btn-sm" onClick={() => input.current?.click()}><RefreshCw size={13} aria-hidden="true" /> Cambiar archivo</button>
              </div>
            )}
          </div>
          <aside className="xv-der">
            <div className="xv-bloque">
              <span className="xv-tit">Revisión del archivo</span>
              <ul className="xv-checks">
                {revisado(formatoOk, 'Formato aceptado', archivo ? ext.toUpperCase() : sub.formatos.map(f => f.toUpperCase()).join(', '))}
                {revisado(tamanoOk, 'Tamaño dentro del límite', archivo ? `${peso(archivo.size)} de ${sub.tamanoMaxMB} MB` : `hasta ${sub.tamanoMaxMB} MB`)}
                {revisado(formatoOk && tamanoOk, 'Se guardará como')}
              </ul>
              <span className="xv-nombre">{archivo ? normalizarNombre(persona, sub, emision || iso(hoy()), ext) : 'Elija el archivo para verlo'}</span>
            </div>
            <div className="xv-sep" />
            <div className="xv-bloque">
              <span className="xv-tit">Fechas</span>
              <label className="xa-campo"><span className="pl-label">Fecha de emisión</span><SelectorFecha valor={emision} onCambio={setEmision} ariaLabel="Fecha de emisión" /></label>
              {sub.vence && <label className="xa-campo"><span className="pl-label">Vence</span><SelectorFecha valor={venc} onCambio={v => { setVencimiento(v); setVencTocado(true) }} ariaLabel="Fecha de vencimiento" /></label>}
              <span className="xv-nota">{sub.vence ? (vencTocado ? 'Vencimiento corregido a mano.' : `Calculado: este documento vale ${vigencia}.`) : 'Este documento no vence.'}</span>
            </div>
            {error && <p className="xu-error" role="alert">{error}</p>}
          </aside>
        </div>
        {elegirArchivo}
      </Modal>
    )
  }

  return (
    <Modal titulo={fijo ? `Subir ${minuscula(sub.nombre)} · ${persona.name}` : `Subir documento · ${persona.name}`} Icono={Upload} onCerrar={onCerrar} ancho={fijo ? 720 : 1000} pie={pie}>
      <div className={`xu-dos${fijo ? ' xu-fijo' : ''}`}>
        {!fijo && <aside className="xu-izq" aria-label="Documentos de la persona">
          <div className="pl-search-wrap">
            <Search size={13} className="pl-search-ico" />
            <input type="search" className="pl-search" placeholder="Buscar documento…" value={busca} onChange={e => setBusca(e.target.value)} aria-label="Buscar documento" />
          </div>
          {grupos.map(g => {
            const visibles = g.entradas.filter(e => !texto || e.subtipo.nombre.toLowerCase().includes(texto))
            if (!visibles.length) return null
            const exigidos = g.entradas.filter(e => e.estado !== 'no_exigido' && e.estado !== 'exonerado')
            const cumplidos = exigidos.filter(e => ESTADOS[e.estado]?.cumple).length
            return (
              <div key={g.tipo.id} className="xu-grupo">
                <div className="xu-grupo-tit"><IconoCarpeta size={20} /><span>{g.tipo.nombre}</span>{exigidos.length > 0 && <span className="xu-grupo-n">{cumplidos} de {exigidos.length}</span>}</div>
                {visibles.map(e => {
                  const v = versionActual(e.docs[0])
                  // Lo no exigido no se ve apagado: es opcional, y si lo trae se guarda igual.
                  const det = e.estado === 'no_exigido' ? (e.docs.length ? plural(e.docs.length, 'documento', 'documentos') : 'Si lo trae, se guarda')
                    : e.estado === 'faltante' ? (e.limite ? `Hasta el ${fechaCorta(e.limite)}` : 'Sin plazo')
                      : v?.vencimiento ? `Vence ${fechaCorta(v.vencimiento)}` : v ? 'No vence' : ''
                  const on = e.subtipo.id === elegido
                  return (
                    <button key={e.subtipo.id} type="button" className={`xu-doc${on ? ' on' : ''}`} aria-pressed={on} onClick={() => elegir(e.subtipo.id)}>
                      <span className="xu-doc-txt"><b>{e.subtipo.nombre}</b><small>{det}{e.docs[0]?.origen === 'ficha' ? ' · de la ficha' : ''}</small></span>
                      {e.estado !== 'no_exigido'
                        ? <span className={`dc-chip dc-t-${ESTADOS[e.estado]?.tono || 'gris'} xu-chip`}>{ESTADOS[e.estado]?.label}</span>
                        : <span className="dc-chip dc-t-gris xu-chip">Opcional</span>}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </aside>}

        <section className="xu-der" aria-label="Documento elegido">
          {!sub ? <Vacio Icono={FolderOpen} titulo="Elija un documento" texto="A la izquierda están los documentos de esta persona." /> : <>
            <div className="xu-der-cab"><h3>{sub.nombre}</h3><span>{reglas}</span></div>

            {sub.varios && entrada.docs.length > 0 && !(fijo && inicialDoc) && (
              <div className="xu-varios" role="radiogroup" aria-label="Qué hacer con el nuevo">
                <span className="pl-label">Ya tiene {plural(entrada.docs.length, 'documento', 'documentos')} de este tipo. ¿Qué desea hacer?</span>
                <button type="button" role="radio" aria-checked={!destino} className={`xu-op${!destino ? ' on' : ''}`} onClick={() => setDestino('')}>
                  <span className="xu-radio" aria-hidden="true" />
                  <span><b>Agregar uno nuevo</b><small>Se guarda además de los que tiene.</small></span>
                </button>
                {entrada.docs.map(d => {
                  const v = versionActual(d)
                  const on = destino === d.id
                  return (
                    <button key={d.id} type="button" role="radio" aria-checked={on} className={`xu-op${on ? ' on' : ''}`} onClick={() => setDestino(d.id)}>
                      <span className="xu-radio" aria-hidden="true" />
                      <span><b>Reemplazar {v?.archivo?.nombre || sub.nombre}</b><small>{v?.vencimiento ? `Vence ${fechaCorta(v.vencimiento)}` : 'No vence'} · {ESTADOS[estadoVersion(v, sub, parametros)]?.label}</small></span>
                    </button>
                  )
                })}
              </div>
            )}

            {actual && <>
              <div className="xu-previas">
                <figure className="xu-previa">
                  <span className="xu-previa-et">Actual</span>
                  <div className="xu-previa-hoja"><Miniatura version={vActual} titulo={sub.nombre} /></div>
                  <figcaption><b>{vActual?.archivo?.nombre}</b><span>{vActual?.vencimiento ? `Vence ${fechaCorta(vActual.vencimiento)}` : 'No vence'}{deFicha ? ' · de la ficha' : ''}</span></figcaption>
                </figure>
                <figure className={`xu-previa nueva${archivo ? '' : ' vacia'}`}>
                  <span className="xu-previa-et">Nuevo</span>
                  <div className="xu-previa-hoja"
                    onDragOver={e => { e.preventDefault(); setArrastrando(true) }} onDragLeave={() => setArrastrando(false)}
                    onDrop={e => { e.preventDefault(); setArrastrando(false); tomar(e.dataTransfer.files) }}>
                    {archivo ? previaNueva : (
                      <button type="button" className={`xu-elegir${arrastrando ? ' on' : ''}`} onClick={() => input.current?.click()}>
                        <Upload size={18} aria-hidden="true" /> Arrastre el nuevo o haga clic
                      </button>
                    )}
                  </div>
                  <figcaption>{archivo
                    ? <><b>{archivo.name}</b><span>{peso(archivo.size)} · <button type="button" className="xu-cambiar" onClick={() => input.current?.click()}>Cambiar</button></span></>
                    : <span>Todavía no eligió el archivo</span>}</figcaption>
                </figure>
              </div>
              <div className="xu-pregunta" role="status">
                <RefreshCw size={16} aria-hidden="true" />
                <span><b>¿Desea reemplazar {conArticulo(sub.nombre)}?</b>
                  {deFicha ? 'Se registró en su ficha. Desde ahora vale el nuevo en el expediente; la ficha conserva el suyo.' : 'El actual queda como versión anterior y deja de contar.'}</span>
              </div>
            </>}


            {!actual && (archivo ? (
              <div className="xu-archivo">
                <span className="xu-archivo-mini">{previaNueva}</span>
                <span className="xu-archivo-txt"><b>{archivo.name}</b><small>{peso(archivo.size)}</small></span>
                <button type="button" className="dc-btn dc-btn-sm" onClick={() => input.current?.click()}>Cambiar</button>
              </div>
            ) : (
              <button type="button" className={`xu-soltar${arrastrando ? ' on' : ''}`} onClick={() => input.current?.click()}
                onDragOver={e => { e.preventDefault(); setArrastrando(true) }} onDragLeave={() => setArrastrando(false)}
                onDrop={e => { e.preventDefault(); setArrastrando(false); tomar(e.dataTransfer.files) }}>
                <Upload size={22} aria-hidden="true" />
                <b>Arrastre aquí el archivo</b>
                <span>o haga clic para elegirlo</span>
              </button>
            ))}

            {error && <p className="xu-error" role="alert">{error}</p>}

            {archivo && (
              <div className="xu-fechas">
                <label className="xa-campo"><span className="pl-label">Fecha de emisión</span><SelectorFecha valor={emision} onCambio={setEmision} ariaLabel="Fecha de emisión" /></label>
                {sub.vence && <label className="xa-campo"><span className="pl-label">Vence</span><SelectorFecha valor={venc} onCambio={v => { setVencimiento(v); setVencTocado(true) }} ariaLabel="Fecha de vencimiento" /></label>}
              </div>
            )}
          </>}
          <input ref={input} type="file" hidden accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx" onChange={e => { tomar(e.target.files); e.target.value = '' }} />
        </section>
      </div>
    </Modal>
  )
}

/* ── ¿EN QUÉ CARPETA? (propuesta B, 16 oct 2026) ───────────────────────────
   Desde la vista general del expediente todavía no se sabe adónde va el documento, y la lista de
   todo junto era larga. Se pregunta primero, con las mismas carpetas amarillas del expediente:
   las suyas arriba, con lo que falta en cada una, y las de RR.HH. abajo. Al elegir, se abre el
   modal de esa carpeta, con «Cambiar carpeta» para volver aquí. */
function ElegirCarpeta({ persona, filas, emitidos, contratos, onElegir, onCerrar }) {
  const { tipos, parametros } = useDocumentacion()
  const suyas = tipos.filter(t => t.activo !== false).map(t => {
    const fs = filas.filter(f => f.subtipo.tipoId === t.id)
    const deben = fs.filter(f => ['faltante', 'vencido', 'rechazado'].includes(f.estado)).length
    const conDoc = fs.filter(f => f.documento).length
    return { clave: t.id, nombre: t.nombre, sub: deben ? `${deben === 1 ? 'Falta 1' : `Faltan ${deben}`}` : conDoc ? plural(conDoc, 'documento', 'documentos') : 'Vacía', punto: deben ? 'rojo' : undefined }
  })
  const deRrhh = [
    ...carpetasRecibidas(parametros).map(([k, nombre]) => {
      const n = emitidos.filter(e => e.estado !== 'anulado' && carpetaRecibida(e, parametros) === k).length
      return { clave: `rrhh:${k}`, nombre, sub: n ? plural(n, 'documento', 'documentos') : 'Vacía' }
    }),
    { clave: 'contrato', nombre: 'Contratos', sub: contratos.length ? plural(contratos.length, 'contrato', 'contratos') : 'Vacía' },
  ]
  return (
    <Modal titulo="¿En qué carpeta va el documento?" Icono={Upload} onCerrar={onCerrar} ancho={760}>
      <p className="xa-modal-txt">Elija dónde guardar el documento de {persona.name}.</p>
      <div className="md-seccion"><h2>Sus carpetas</h2><span className="dc-muted">Lo que entrega el colaborador</span></div>
      <div className="md-grilla xu-grilla">
        {suyas.map(c => <Mosaico key={c.clave} titulo={c.nombre} sub={c.sub} punto={c.punto} onClick={() => onElegir(c.clave)} />)}
      </div>
      <div className="md-seccion"><h2>De RR.HH.</h2><span className="dc-muted">Lo que la empresa emite: suba aquí el firmado o uno hecho afuera</span></div>
      <div className="md-grilla xu-grilla">
        {deRrhh.map(c => <Mosaico key={c.clave} titulo={c.nombre} sub={c.sub} onClick={() => onElegir(c.clave)} />)}
      </div>
    </Modal>
  )
}

/* El botón para volver al paso de las carpetas, en el pie de cada modal de subir. */
function VolverCarpetas({ onVolver }) {
  if (!onVolver) return null
  return <button type="button" className="dc-btn dc-btn-texto xu-volver" onClick={onVolver}><ArrowLeft size={14} aria-hidden="true" /> Cambiar carpeta</button>
}

/* Un archivo elegido o la zona para soltarlo: la misma pieza en los modales de RR.HH. y contratos. */
function ZonaArchivo({ archivo, onArchivo, texto, accept = 'application/pdf,image/*,.doc,.docx' }) {
  const [arrastrando, setArrastrando] = useState(false)
  const input = useRef(null)
  const tomar = files => { const f = [...(files || [])][0]; if (f) onArchivo(f) }
  return (
    <>
      {archivo ? (
        <div className="xu-archivo">
          <span className="xu-archivo-mini"><FileText size={22} aria-hidden="true" /></span>
          <span className="xu-archivo-txt"><b>{archivo.name}</b><small>{peso(archivo.size)}</small></span>
          <button type="button" className="dc-btn dc-btn-sm" onClick={() => input.current?.click()}>Cambiar</button>
        </div>
      ) : (
        <button type="button" className={`xu-soltar${arrastrando ? ' on' : ''}`} style={{ padding: '28px 20px' }} onClick={() => input.current?.click()}
          onDragOver={e => { e.preventDefault(); setArrastrando(true) }} onDragLeave={() => setArrastrando(false)}
          onDrop={e => { e.preventDefault(); setArrastrando(false); tomar(e.dataTransfer.files) }}>
          <Upload size={22} aria-hidden="true" />
          <b>{texto}</b>
          <span>o haga clic para elegirlo · PDF, imagen o Word</span>
        </button>
      )}
      <input ref={input} type="file" hidden accept={accept} onChange={e => { tomar(e.target.files); e.target.value = '' }} />
    </>
  )
}
const FORMATOS_RRHH = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
const guardarEscaneado = async archivo => {
  const clave = nuevaClaveArchivo()
  const ok = await guardarArchivo(clave, archivo).catch(() => false)
  const formato = extensionDe(archivo.name)
  return { nombre: archivo.name, clave: ok === false ? null : clave, formato, tipoMime: archivo.type, tamanoKB: Math.round(archivo.size / 1024) }
}

/* ── SUBIR A UNA CARPETA DE RR.HH. (16 oct 2026) ───────────────────────────
   En Certificados, Memorándums u otro tipo de lo que la empresa le dio no se muestran los
   documentos de la ficha. Lo que se sube aquí es una de dos cosas:
   · EL FIRMADO DE UNO YA EMITIDO. El sistema genera el documento, pero RR.HH. lo imprime, lo hace
     firmar y sube el escaneado. Se elige cuál —MEM-0003/2026— y el firmado queda pegado a él.
   · UNO NUEVO, hecho fuera del sistema, con su nombre, su fecha y el número de su serie.
   Viene elegido «el firmado» si hay alguno emitido que todavía no lo tiene. */
function ModalSubirRecibido({ persona, categoria, opciones, emitidosDe, onCerrar, onSubido, onVolver }) {
  const { emitidos, parametros, contratos, modelos, enviarArchivo, adjuntarFirmado } = useDocumentacion()
  const [tipo, setTipo] = useState(categoria || opciones[0]?.[0] || 'otro')
  const deTipo = emitidosDe.filter(e => e.estado !== 'anulado' && carpetaRecibida(e, parametros) === tipo)
  const sinFirmar = deTipo.filter(e => !e.firmado)
  const [modo, setModo] = useState(sinFirmar.length ? 'firmado' : 'nuevo')
  const [emitidoId, setEmitidoId] = useState(sinFirmar[0]?.id || deTipo[0]?.id || '')
  const [nombre, setNombre] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [fecha, setFecha] = useState(iso(hoy()))
  const [guardando, setGuardando] = useState(false)

  const singular = { certificado: 'Certificado', memorandum: 'Memorándum', otro: 'Documento' }[tipo]
    || (parametros?.tiposPropios || []).find(t => t.key === tipo)?.label || 'Documento'
  const carpetaNombre = opciones.find(([k]) => k === tipo)?.[1] || 'Recibidos'
  const numero = siguienteNumero(tipo, emitidos, parametros, contratos).texto
  const elegido = deTipo.find(e => e.id === emitidoId)
  const ext = archivo ? extensionDe(archivo.name) : ''
  const valido = !archivo || FORMATOS_RRHH.includes(ext)
  const listo = !!archivo && valido && !guardando && (modo === 'firmado' ? !!elegido : nombre.trim().length >= 3 && !!fecha)

  const cambiarTipo = k => {
    setTipo(k)
    const otros = emitidosDe.filter(e => e.estado !== 'anulado' && carpetaRecibida(e, parametros) === k)
    const sin = otros.filter(e => !e.firmado)
    setModo(sin.length ? 'firmado' : 'nuevo')
    setEmitidoId(sin[0]?.id || otros[0]?.id || '')
  }
  const alArchivo = f => { setArchivo(f); if (modo === 'nuevo' && !nombre.trim()) setNombre(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()) }

  const guardar = async () => {
    if (!listo) return
    setGuardando(true)
    const datos = await guardarEscaneado(archivo)
    if (modo === 'firmado') {
      adjuntarFirmado(elegido.id, datos)
      onSubido(`Se guardó el firmado de ${elegido.numero}.`)
    } else {
      enviarArchivo({ nombre: nombre.trim(), archivo: datos, colaboradorIds: [persona.id], categoria: tipo, fecha })
      onSubido(`«${nombre.trim()}» se subió a ${carpetaNombre}.`)
    }
  }

  return (
    <Modal titulo={`${carpetaNombre} · ${persona.name}`} Icono={Upload} onCerrar={onCerrar} ancho={620} pie={<>
      <VolverCarpetas onVolver={onVolver} />
      <span className="xu-pie-nota">{modo === 'nuevo' ? <>Sale con el número <b style={{ whiteSpace: 'nowrap' }}>{numero}</b></> : elegido ? <>Queda junto a <b style={{ whiteSpace: 'nowrap' }}>{elegido.numero}</b></> : ''}</span>
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
      <button type="button" className="pl-btn-save" disabled={!listo} onClick={guardar}><Upload size={14} aria-hidden="true" /> {guardando ? 'Guardando…' : modo === 'firmado' ? 'Subir firmado' : `Subir ${singular.toLowerCase()}`}</button>
    </>}>
      {!categoria && (
        <div className="xa-campo">
          <span className="pl-label">Tipo</span>
          <div className="xa-segmento" role="group" aria-label="Tipo de documento">
            {opciones.map(([k, n]) => <button key={k} type="button" className={tipo === k ? 'on' : ''} aria-pressed={tipo === k} onClick={() => cambiarTipo(k)}>{n}</button>)}
          </div>
        </div>
      )}

      <div className="xu-varios" role="radiogroup" aria-label="Qué va a subir">
        <span className="pl-label">¿Qué va a subir?</span>
        <button type="button" role="radio" aria-checked={modo === 'firmado'} disabled={!deTipo.length} className={`xu-op${modo === 'firmado' ? ' on' : ''}`} onClick={() => setModo('firmado')}>
          <span className="xu-radio" aria-hidden="true" />
          <span><b>El firmado de un {singular.toLowerCase()} ya emitido</b><small>{deTipo.length ? 'Lo imprimió, lo hizo firmar y ahora sube el escaneado.' : `Todavía no se le emitió ningún ${singular.toLowerCase()}.`}</small></span>
        </button>
        <button type="button" role="radio" aria-checked={modo === 'nuevo'} className={`xu-op${modo === 'nuevo' ? ' on' : ''}`} onClick={() => setModo('nuevo')}>
          <span className="xu-radio" aria-hidden="true" />
          <span><b>Uno nuevo, hecho fuera del sistema</b><small>Se guarda con su nombre, su fecha y el número que sigue.</small></span>
        </button>
      </div>

      {modo === 'firmado' && deTipo.length > 0 && (
        <div className="xa-campo">
          <span className="pl-label">¿De cuál?</span>
          <div className="xu-emitidos">
            {deTipo.map(e => (
              <button key={e.id} type="button" className={`xu-doc${emitidoId === e.id ? ' on' : ''}`} aria-pressed={emitidoId === e.id} onClick={() => setEmitidoId(e.id)}>
                <span className="xu-doc-txt"><b>{nombreEmitido(e, modelos)}</b><small>{e.numero} · {fechaCorta(e.fecha)}</small></span>
                {e.firmado ? <span className="dc-chip dc-t-verde xu-chip">Firmado</span> : <span className="dc-chip dc-t-ambar xu-chip">Sin firmar</span>}
              </button>
            ))}
          </div>
          {elegido?.firmado && <p className="xu-nota">Ya tiene un firmado del {fechaCorta(elegido.firmado.fecha)}. El nuevo lo reemplaza; el anterior queda en el historial.</p>}
        </div>
      )}

      {modo === 'nuevo' && (
        <label className="xa-campo">
          <span className="pl-label">Nombre del documento <span className="pl-req" aria-hidden="true">*</span></span>
          <input className="pl-input" value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder={tipo === 'memorandum' ? 'Memorándum de llamada de atención' : tipo === 'certificado' ? 'Certificado de trabajo' : 'Carta de recomendación'} />
        </label>
      )}

      <ZonaArchivo archivo={archivo} onArchivo={alArchivo} texto={modo === 'firmado' ? 'Arrastre aquí el escaneado firmado' : `Arrastre aquí el ${singular.toLowerCase()}`} />
      {!valido && <p className="xu-error" role="alert">Este archivo es {ext.toUpperCase() || 'de otro tipo'}. Se aceptan PDF, imágenes (JPG, PNG) y Word.</p>}

      {modo === 'nuevo' && (
        <label className="xa-campo" style={{ maxWidth: 260 }}>
          <span className="pl-label">Fecha del documento</span>
          <SelectorFecha valor={fecha} onCambio={setFecha} ariaLabel="Fecha del documento" />
        </label>
      )}
    </Modal>
  )
}

/* ── SUBIR A CONTRATOS (16 oct 2026) ───────────────────────────────────────
   Lo mismo que con lo emitido: el contrato se genera en el sistema, se firma en papel y se sube
   el escaneado, que queda como una versión «firmado» del mismo contrato (RF-63: la generada sigue
   ahí). Para un contrato que todavía no existe, «Registrar un contrato nuevo» abre el registro. */
function ModalSubirContrato({ persona, contratos, onCerrar, onSubido, onNuevo, onVolver }) {
  const { versionarContrato } = useDocumentacion()
  const vigentes = contratos.filter(c => !c.finalizado && !c.reemplazado)
  const lista = vigentes.length ? vigentes : contratos
  const firmado = c => c.versiones.some(v => v.tipo === 'firmado')
  const [contratoId, setContratoId] = useState((lista.find(c => !firmado(c)) || lista[0])?.id || '')
  const [archivo, setArchivo] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const elegido = contratos.find(c => c.id === contratoId)
  const ext = archivo ? extensionDe(archivo.name) : ''
  const valido = !archivo || ['pdf', 'jpg', 'jpeg', 'png'].includes(ext)
  const listo = !!elegido && !!archivo && valido && !guardando

  const guardar = async () => {
    if (!listo) return
    setGuardando(true)
    const datos = await guardarEscaneado(archivo)
    versionarContrato(elegido.id, { tipo: 'firmado', motivo: 'Se cargó el escaneado firmado', archivo: datos.nombre, clave: datos.clave })
    onSubido(`Se guardó el firmado de ${elegido.numero}.`)
  }

  return (
    <Modal titulo={`Contratos · ${persona.name}`} Icono={FileSignature} onCerrar={onCerrar} ancho={620} pie={<>
      <VolverCarpetas onVolver={onVolver} />
      <span className="xu-pie-nota" />
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
      <button type="button" className="pl-btn-save" disabled={!listo} onClick={guardar}><Upload size={14} aria-hidden="true" /> {guardando ? 'Guardando…' : 'Subir firmado'}</button>
    </>}>
      {lista.length ? (
        <div className="xa-campo">
          <span className="pl-label">¿De qué contrato es el firmado?</span>
          <div className="xu-emitidos">
            {lista.map(c => (
              <button key={c.id} type="button" className={`xu-doc${contratoId === c.id ? ' on' : ''}`} aria-pressed={contratoId === c.id} onClick={() => setContratoId(c.id)}>
                <span className="xu-doc-txt"><b>{c.tipo === 'adenda' ? 'Adenda' : 'Contrato'} {c.numero}</b><small>{MODALIDADES[c.modalidad]} · desde {fechaCorta(c.inicio)}{c.fin ? ` hasta ${fechaCorta(c.fin)}` : ''}</small></span>
                {firmado(c) ? <span className="dc-chip dc-t-verde xu-chip">Firmado</span> : <span className="dc-chip dc-t-ambar xu-chip">Sin firmar</span>}
              </button>
            ))}
          </div>
          {elegido && firmado(elegido) && <p className="xu-nota">Ya tiene un firmado. El nuevo queda como su última versión; los anteriores no se borran.</p>}
        </div>
      ) : <p className="xa-modal-txt">{persona.name.split(' ')[0]} todavía no tiene contratos registrados.</p>}

      {lista.length > 0 && <ZonaArchivo archivo={archivo} onArchivo={setArchivo} texto="Arrastre aquí el contrato firmado" accept="application/pdf,image/*" />}
      {!valido && <p className="xu-error" role="alert">Este archivo es {ext.toUpperCase() || 'de otro tipo'}. Se aceptan PDF e imágenes (JPG, PNG).</p>}

      <div className="xu-otra">
        <span>¿Es un contrato que todavía no está en el sistema?</span>
        <button type="button" className="dc-btn dc-btn-sm" onClick={onNuevo}><FileSignature size={13} aria-hidden="true" /> Registrar un contrato nuevo</button>
      </div>
    </Modal>
  )
}

/* ── LA FRANJA DE LO PENDIENTE, la misma de Mis documentos ──
   El anillo dice cuántos obligatorios exigibles cumple; al lado, cuánto le falta y de qué tipo, y un
   botón por cada cosa que se puede ver: lo que espera revisión y lo que falta o vence. */
function FranjaPendiente({ avance, revision, faltan, vencen, onVer }) {
  const debe = faltan + vencen
  const partes = [faltan && `${faltan} falta${faltan > 1 ? 'n' : ''}`, vencen && `${vencen} vencido${vencen > 1 ? 's' : ''} o por vencer`, revision && `${revision} por revisar`].filter(Boolean)
  const [titulo, sub] = debe || revision
    ? [debe ? `${debe} documento${debe === 1 ? '' : 's'} pendiente${debe === 1 ? '' : 's'}` : `${revision} por revisar`, partes.join(' · ')]
    : ['Está al día', 'No le falta nada de lo que se le exige.']
  const p = avance.pct ?? 100
  return (
    <div className="md-franja">
      <span className="md-anillo" style={{ '--p': `${p}%` }} aria-label={avance.total ? `${avance.cumplidos} de ${avance.total} obligatorios al día` : 'Al día'}>
        <span>{avance.total ? `${avance.cumplidos}/${avance.total}` : <Check size={16} />}</span>
      </span>
      <div className="md-franja-txt">
        <b>{titulo}</b>
        <span>{sub}</span>
      </div>
      {revision > 0 && <button type="button" className={debe ? 'md-franja-btn md-franja-btn-suave' : 'md-franja-btn'} onClick={() => onVer('_revision')}>Revisar {revision}</button>}
      {debe > 0 && <button type="button" className="md-franja-btn" onClick={() => onVer(faltan ? '_faltan' : '_vencen')}>Ver qué falta</button>}
    </div>
  )
}
