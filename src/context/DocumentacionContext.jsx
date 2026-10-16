import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useOnboardingData } from './OnboardingDataContext'
import { useUser } from './UserContext'
import { cargoDe, sedesDe } from '../data/organigramaData'
import { colaboradoresData } from '../pages/personas/colaboradoresData'
import {
  TIPOS_SEED, SUBTIPOS_SEED, PARAMETROS_SEED, MODELOS_SEED,
  documentosSeed, contratosSeed, emitidosSeed, bitacoraSeed, requisitosSeed, solicitudesSeed, documentosDeFicha,
  sedeDemoDe, ingresoISO, iso, hoy, fechaLarga, checklistDe, completitud, siguienteNumero, datosPara, rellenar,
  estadoContrato, normalizarNombre, sumarMeses, COLABORADORES_APP, semillaColaboradoresApp, semillaLoteDemo, fechaCorta,
} from '../data/documentacionData'

/* ── EL ESTADO DEL MÓDULO DE DOCUMENTACIÓN ────────────────────────────────
   Un solo lugar guarda y todas las pantallas leen. Cada acción que cambia algo deja su evento
   en la bitácora en la MISMA operación (RF-85, principio 8): no hay un camino que cambie un
   documento y se olvide de anotarlo, porque no hay otro camino.

   LA BITÁCORA SÓLO CRECE. No hay acción que edite o borre un evento (RNF-13), y por eso tampoco
   se expone su `set`. */

const Ctx = createContext(null)

/* Las personas del módulo son las del directorio, con lo que Documentación necesita leer ya
   resuelto: cargo y sede salen del organigrama (3.2, 3.3), el ingreso pasa a fecha ISO y se les
   pone un código de colaborador. Documentación no guarda su propia copia de nada de esto. */
// eslint-disable-next-line react-refresh/only-export-components
export function enriquecer(c, organigrama, sucursales) {
  const sedes = organigrama ? sedesDe(c, organigrama) : null
  const sedeId = sedes?.length ? sedes[0].id : sedeDemoDe(c.id)
  const suc = sucursales.find(s => s.id === sedeId)
  return {
    ...c,
    cargo: (organigrama && cargoDe(c, organigrama)) || c.cargo,
    sede: sedeId,
    sedeNombre: suc?.nombre || '',
    sedeCiudad: suc?.ciudad || '',
    ingreso: ingresoISO(c.ingreso),
    codigo: String(1000000 + c.id * 7919).slice(0, 7),
    // El de la persona si ya lo tiene registrado; si no, uno de ejemplo.
    documento: c.documento || `${4800000 + c.id * 13337} ${['LP', 'SC', 'CB'][c.id % 3]}`,
  }
}

/* Las semillas se calculan una vez, con el directorio de fábrica: son el punto de partida de la
   demo, no una función del directorio vivo. Quien se dé de alta después arranca sin documentos,
   que es lo que le pasaría en la vida real. */
let SEMILLAS = null
function semillas(sucursales) {
  if (SEMILLAS) return SEMILLAS
  const personas = colaboradoresData.map(c => enriquecer(c, null, sucursales))
  const requisitos = requisitosSeed(personas)
  const documentos = documentosSeed(personas, SUBTIPOS_SEED, requisitos)
  const emitidos = emitidosSeed(personas)
  SEMILLAS = {
    requisitos, documentos, emitidos,
    contratos: contratosSeed(personas), bitacora: bitacoraSeed(documentos, emitidos), solicitudes: solicitudesSeed(personas),
  }
  return SEMILLAS
}

const nuevoId = p => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

export function DocumentacionProvider({ children }) {
  const { colaboradores, organigrama, sucursales, empresa } = useOnboardingData()
  const { currentUser } = useUser()
  const s = semillas(sucursales)

  /* LAS CLAVES CON VERSIÓN son de las reestructuras del módulo. La «_v3» es la de la taxonomía
     de la ficha: los tipos y los subtipos pasaron a ser los de la sección «Archivos» de la ficha
     del colaborador. Con las claves de antes, una demo ya abierta seguiría con las carpetas
     inventadas y con documentos de subtipos que ya no existen. */
  const [tipos, setTipos] = useLocalStorage('doc_tipos_v3', TIPOS_SEED)
  const [subtipos, setSubtipos] = useLocalStorage('doc_subtipos_v3', SUBTIPOS_SEED)
  const [parametros, setParametros] = useLocalStorage('doc_parametros_v2', PARAMETROS_SEED)
  /* Lo que se le exige a cada persona además de lo general: se agrega desde su expediente. */
  const [requisitos, setRequisitos] = useLocalStorage('doc_requisitos_v3', s.requisitos)
  const [solicitudes, setSolicitudes] = useLocalStorage('doc_solicitudes_v4', s.solicitudes)
  const [modelos, setModelos] = useLocalStorage('doc_modelos', MODELOS_SEED)
  const [documentos, setDocumentos] = useLocalStorage('doc_documentos_v3', s.documentos)
  /* Lo subido que todavía no se sabe qué documento es (ver «Subir primero, clasificar después»). */
  const [sinClasificar, setSinClasificar] = useLocalStorage('doc_sin_clasificar', [])
  const [exoneraciones, setExoneraciones] = useLocalStorage('doc_exoneraciones_v3', [])
  const [emitidos, setEmitidos] = useLocalStorage('doc_emitidos', s.emitidos)
  const [contratos, setContratos] = useLocalStorage('doc_contratos', s.contratos)
  const [lotes, setLotes] = useLocalStorage('doc_lotes', [])
  /* Los lotes de EMISIÓN —lo emitido a un grupo de una vez—, que no son los de carga masiva de arriba. */
  const [lotesEmision, setLotesEmision] = useLocalStorage('doc_lotes_emision', [])
  /* Los pedidos de documento hechos desde la bandeja: `${colaboradorId}|${subtipoId}` → fecha. */
  const [pedidos, setPedidos] = useLocalStorage('doc_pedidos', {})
  const [bitacora, setBitacora] = useLocalStorage('doc_bitacora_v3', s.bitacora)

  /* Con Carlos y María, que se demuestran desde su lado y no están en el directorio
     (`COLABORADORES_APP`). Si algún día se los da de alta, manda el directorio. */
  const personas = useMemo(
    () => [...colaboradores, ...COLABORADORES_APP.filter(d => !colaboradores.some(c => c.id === d.id || c.name === d.name))]
      .map(c => enriquecer(c, organigrama, sucursales)),
    [colaboradores, organigrama, sucursales],
  )

  /* LO SUYO SE SUMA UNA SOLA VEZ, sobre lo que la demo ya tenga guardado: las semillas de arriba
     se escribieron en el navegador el primer día y no se vuelven a leer. Después de sumarlo manda
     la demo —si RR.HH. aprueba o borra algo, no reaparece—. Cada cosa entra por su id, así que el
     doble montaje de desarrollo no la duplica. */
  const [appSembrada, setAppSembrada] = useLocalStorage('doc_colab_app_v1', false)
  useEffect(() => {
    if (appSembrada) return
    const gente = personas.filter(p => COLABORADORES_APP.some(c => c.id === p.id))
    if (!gente.length) return
    const n = semillaColaboradoresApp(gente, { emitidos, contratos, parametros, modelos })
    const sumar = (antes, nuevos, alFrente = false) => {
      const faltan = nuevos.filter(x => !antes.some(y => y.id === x.id))
      if (!faltan.length) return antes
      return alFrente ? [...faltan, ...antes] : [...antes, ...faltan]
    }
    setDocumentos(prev => sumar(prev, n.documentos))
    setEmitidos(prev => sumar(prev, n.emitidos, true))
    setContratos(prev => sumar(prev, n.contratos))
    setSolicitudes(prev => sumar(prev, n.solicitudes, true))
    setBitacora(prev => sumar(prev, n.bitacora, true))
    setRequisitos(prev => [...prev, ...n.requisitos.filter(r => !prev.some(x => x.colaboradorId === r.colaboradorId && x.subtipoId === r.subtipoId))])
    setPedidos(prev => ({ ...n.pedidos, ...prev }))
    setAppSembrada(true)
  }, [appSembrada]) // eslint-disable-line react-hooks/exhaustive-deps

  /* JUAN, EL QUE ADMINISTRA, LLEGÓ DESPUÉS (16 oct 2026): en una demo que ya sembró a Carlos y María
     se suma solo lo suyo, una vez y por id, con los números que siguen a los que ya hay. */
  const [juanSembrado, setJuanSembrado] = useLocalStorage('doc_colab_app_juan_v1', false)
  useEffect(() => {
    if (juanSembrado || !appSembrada) return
    const gente = personas.filter(p => p.id === 1001)
    if (!gente.length) return
    const n = semillaColaboradoresApp(gente, { emitidos, contratos, parametros, modelos })
    const sumar = (antes, nuevos, alFrente = false) => {
      const faltan = nuevos.filter(x => !antes.some(y => y.id === x.id))
      if (!faltan.length) return antes
      return alFrente ? [...faltan, ...antes] : [...antes, ...faltan]
    }
    setEmitidos(prev => sumar(prev, n.emitidos, true))
    setContratos(prev => sumar(prev, n.contratos))
    setBitacora(prev => sumar(prev, n.bitacora, true))
    setRequisitos(prev => [...prev, ...n.requisitos.filter(r => !prev.some(x => x.colaboradorId === r.colaboradorId && x.subtipoId === r.subtipoId))])
    setJuanSembrado(true)
  }, [juanSembrado, appSembrada]) // eslint-disable-line react-hooks/exhaustive-deps

  /* EL LOTE DE EJEMPLO, con la misma regla: una vez, sobre lo guardado, entrando por su id. */
  const [loteSembrado, setLoteSembrado] = useLocalStorage('doc_lote_demo_v1', false)
  useEffect(() => {
    // Después de lo de Carlos y María: los dos numeran memorándums, y leyendo la misma lista se pisarían.
    if (loteSembrado || !appSembrada) return
    const n = semillaLoteDemo(personas, { emitidos, parametros, modelos })
    if (n) {
      setEmitidos(prev => [...n.emitidos.filter(e => !prev.some(x => x.id === e.id)), ...prev])
      setLotesEmision(prev => (prev.some(l => l.id === n.lote.id) ? prev : [n.lote, ...prev]))
    }
    setLoteSembrado(true)
  }, [loteSembrado, appSembrada]) // eslint-disable-line react-hooks/exhaustive-deps

  /* LOS DOCUMENTOS QUE SE VEN: los cargados en este módulo más los archivos de la ficha de cada
     persona (`documentosDeFicha`). Los de la ficha se leen en cada render y no se guardan acá:
     la ficha es su dueña.
     SI UN SUBTIPO DE UNO SOLO ESTÁ EN LOS DOS LADOS, MANDA EL MÁS NUEVO —el de fecha de emisión
     más reciente—, venga de donde venga: un carnet renovado en la ficha reemplaza al viejo
     cargado acá, y uno cargado acá después de la ficha reemplaza al de la ficha. El otro no se
     muestra, para que el mismo documento no aparezca dos veces con estados distintos.
     Las acciones (cargar, revisar, eliminar) trabajan sólo sobre los propios: `documentos`. */
  const todosLosDocumentos = useMemo(() => {
    const deFicha = personas.flatMap(p => documentosDeFicha(p, subtipos))
    const fechaDe = d => { const v = d.versiones[d.versiones.length - 1]; return v?.emision || v?.fecha || '' }
    const uno = d => !subtipos.find(x => x.id === d.subtipoId)?.varios
    const par = (a, b) => a.colaboradorId === b.colaboradorId && a.subtipoId === b.subtipoId
    const propios = documentos.filter(d => d.eliminado || !uno(d)
      || !deFicha.some(f => par(f, d) && fechaDe(f) > fechaDe(d)))
    const ajenos = deFicha.filter(f => !uno(f)
      || !documentos.some(d => !d.eliminado && par(f, d) && fechaDe(d) >= fechaDe(f)))
    return [...propios, ...ajenos]
  }, [personas, subtipos, documentos])

  const usuario = currentUser?.name || 'Sistema'

  const anotar = useCallback((accion, entidad, entidadId, colaboradorId, detalle) => {
    setBitacora(prev => [{ id: nuevoId('b'), fecha: iso(hoy()), hora: new Date().toTimeString().slice(0, 5), usuario, accion, entidad, entidadId, colaboradorId, detalle }, ...prev])
  }, [setBitacora, usuario])

  const estado = useMemo(
    () => ({ tipos, subtipos, parametros, requisitos, solicitudes, modelos, documentos: todosLosDocumentos, exoneraciones, emitidos, contratos, lotes, lotesEmision, bitacora }),
    [tipos, subtipos, parametros, requisitos, solicitudes, modelos, todosLosDocumentos, exoneraciones, emitidos, contratos, lotes, lotesEmision, bitacora],
  )

  /* ── DOCUMENTOS DEL EXPEDIENTE ── */

  /* CARGAR (RF-26, 7.4). Si el documento lógico ya existe, se agrega una VERSIÓN: reemplazar no
     borra (RN-13). Lo que sube el colaborador entra en revisión (RF-31); lo que sube RR.HH., ya
     aprobado. `version` trae archivo, emision, vencimiento e info. */
  /* UN SUBTIPO QUE SOPORTA VARIOS (RN-02) —vacunas, cursos— no versiona: cada carga es un
     documento más del historial. Para renovar uno en particular se pasa su `documentoId`.
     `esReemplazo` lo decide quien llama cuando ya lo sabe (el lote, que carga varias filas en la
     misma pasada y no puede fiarse de la lista de antes). */
  const cargarDocumento = useCallback(({ colaboradorId, subtipoId, version, porColaborador = false, canal = 'web', motivo = '', documentoId = null, esReemplazo }) => {
    const varios = subtipos.find(x => x.id === subtipoId)?.varios
    const buscar = lista => (documentoId
      ? lista.find(d => d.id === documentoId)
      : varios ? null : lista.find(d => d.colaboradorId === colaboradorId && d.subtipoId === subtipoId && !d.eliminado))
    const previo = buscar(documentos)
    const destino = previo?.id || nuevoId('d')
    setDocumentos(prev => {
      const existe = buscar(prev)
      const v = {
        ...version,
        subidoPor: usuario,
        canal,
        fecha: iso(hoy()),
        revision: porColaborador ? 'pendiente' : 'aprobado',
        motivoRechazo: null,
        motivoCambio: motivo,
      }
      if (existe) return prev.map(d => (d.id === existe.id ? { ...d, versiones: [...d.versiones, { ...v, v: d.versiones.length + 1 }] } : d))
      return [...prev, { id: destino, colaboradorId, subtipoId, versiones: [{ ...v, v: 1 }] }]
    })
    anotar((esReemplazo ?? !!previo) ? 'reemplazo' : 'alta', 'documento', destino, colaboradorId, `Cargó ${version.archivo?.nombre || 'un archivo'} (${canal})`)
    return destino
  }, [documentos, subtipos, setDocumentos, anotar, usuario])

  /* ── SUBIR PRIMERO, CLASIFICAR DESPUÉS ──────────────────────────────────
     Un archivo que el sistema no reconoce no frena la subida: queda guardado como «por
     clasificar», con su archivo ya en el navegador, y se le dice qué documento es después, sobre
     su propia tarjeta. Recién al clasificarlo pasa a ser un documento del expediente y cuenta para
     sus requisitos. `tipoId` es la carpeta desde la que se subió (o null, desde la cabecera). */
  const subirSinClasificar = useCallback((colaboradorId, tipoId, archivos) => {
    const nuevos = archivos.map(archivo => ({ id: nuevoId('p'), colaboradorId, tipoId: tipoId || null, archivo, fecha: iso(hoy()), por: usuario }))
    setSinClasificar(prev => [...nuevos, ...prev])
    for (const n of nuevos) anotar('alta', 'pendiente', n.id, colaboradorId, `Subió ${n.archivo.original} sin clasificar`)
    return nuevos
  }, [setSinClasificar, anotar, usuario])

  /* nombre: sólo para «Otro», el documento agregado que lleva el nombre que RR.HH. le pone. */
  const clasificar = useCallback((pendienteId, subtipoId, nombre = '') => {
    const p = sinClasificar.find(x => x.id === pendienteId)
    const sub = subtipos.find(x => x.id === subtipoId)
    const persona = personas.find(x => x.id === p?.colaboradorId)
    if (!p || !sub || !persona) return null
    const emision = iso(hoy())
    const yaEsta = !sub.varios && documentos.some(d => d.colaboradorId === p.colaboradorId && d.subtipoId === sub.id && !d.eliminado)
    const docId = cargarDocumento({
      colaboradorId: p.colaboradorId,
      subtipoId: sub.id,
      motivo: yaEsta ? 'Se cargó una versión nueva' : '',
      version: {
        archivo: { ...p.archivo, nombre: normalizarNombre(persona, sub, emision, p.archivo.formato) },
        emision,
        vencimiento: sub.vence ? sumarMeses(emision, sub.vigenciaMeses) : null,
        info: nombre.trim(),
      },
    })
    setSinClasificar(prev => prev.filter(x => x.id !== pendienteId))
    return docId
  }, [sinClasificar, subtipos, personas, documentos, cargarDocumento, setSinClasificar])

  const descartarSinClasificar = useCallback(pendienteId => {
    const p = sinClasificar.find(x => x.id === pendienteId)
    setSinClasificar(prev => prev.filter(x => x.id !== pendienteId))
    if (p) anotar('baja', 'pendiente', pendienteId, p.colaboradorId, `Quitó ${p.archivo.original}, que no se había clasificado`)
  }, [sinClasificar, setSinClasificar, anotar])

  /* CORREGIR LAS FECHAS de la versión actual. La subida directa pone la emisión de hoy y el
     vencimiento propuesto; si el documento se emitió antes, se corrige acá sin subirlo de nuevo.
     No crea versión —el archivo es el mismo— pero queda en la bitácora qué se cambió. */
  const cambiarFechas = useCallback((docId, { emision, vencimiento }) => {
    const colab = documentos.find(d => d.id === docId)?.colaboradorId ?? null
    setDocumentos(prev => prev.map(d => {
      if (d.id !== docId) return d
      const vs = [...d.versiones]
      vs[vs.length - 1] = { ...vs[vs.length - 1], emision, vencimiento: vencimiento || null }
      return { ...d, versiones: vs }
    }))
    anotar('edicion', 'documento', docId, colab, `Corrigió las fechas: emisión ${emision}${vencimiento ? `, vencimiento ${vencimiento}` : ''}`)
  }, [documentos, setDocumentos, anotar])

  /* REVISAR (RF-32). El rechazo exige motivo y el motivo no se borra nunca (5.4). */
  const revisar = useCallback((docId, aprobado, motivo = '') => {
    const colab = documentos.find(d => d.id === docId)?.colaboradorId ?? null
    setDocumentos(prev => prev.map(d => {
      if (d.id !== docId) return d
      const vs = [...d.versiones]
      vs[vs.length - 1] = { ...vs[vs.length - 1], revision: aprobado ? 'aprobado' : 'rechazado', motivoRechazo: aprobado ? null : motivo, revisadoPor: usuario, revisado: iso(hoy()) }
      return { ...d, versiones: vs }
    }))
    anotar(aprobado ? 'aprobacion' : 'rechazo', 'documento', docId, colab, aprobado ? 'Aprobó el documento' : `Rechazó: ${motivo}`)
  }, [documentos, setDocumentos, anotar, usuario])

  /* ELIMINAR (RF-88): doble confirmación en la pantalla, motivo acá, y nunca borra físicamente:
     el documento pasa a la papelera y sigue existiendo. */
  const eliminarDocumento = useCallback((docId, motivo) => {
    const colab = documentos.find(d => d.id === docId)?.colaboradorId ?? null
    setDocumentos(prev => prev.map(d => { if (d.id !== docId) return d; return { ...d, eliminado: { fecha: iso(hoy()), por: usuario, motivo } } }))
    anotar('baja', 'documento', docId, colab, `Envió a la papelera: ${motivo}`)
  }, [documentos, setDocumentos, anotar, usuario])

  const recuperarDocumento = useCallback(docId => {
    const colab = documentos.find(d => d.id === docId)?.colaboradorId ?? null
    setDocumentos(prev => prev.map(d => { if (d.id !== docId) return d; const resto = { ...d }; delete resto.eliminado; return resto }))
    anotar('edicion', 'documento', docId, colab, 'Recuperó el documento de la papelera')
  }, [documentos, setDocumentos, anotar])

  /* EXONERAR (RF-15, RN-09): con motivo, responsable y fecha, para siempre. */
  const exonerar = useCallback((colaboradorId, subtipoId, motivo) => {
    setExoneraciones(prev => [...prev.filter(e => !(e.colaboradorId === colaboradorId && e.subtipoId === subtipoId)), { colaboradorId, subtipoId, motivo, por: usuario, fecha: iso(hoy()) }])
    anotar('exoneracion', 'requisito', subtipoId, colaboradorId, `Exoneró el requisito: ${motivo}`)
  }, [setExoneraciones, anotar, usuario])

  /* REQUISITOS DE UNA PERSONA, DESDE SU EXPEDIENTE. Agregar pide subtipo y plazo; quitar sólo
     alcanza a lo que se le agregó a ella: lo que el subtipo exige a todos se exonera, con motivo. */
  const agregarRequisito = useCallback((colaboradorId, { subtipoId, obligatorio = true, plazoDias = 30 }) => {
    const nombre = subtipos.find(x => x.id === subtipoId)?.nombre || 'un documento'
    const plazo = Number(plazoDias) || 0
    setRequisitos(prev => [
      ...prev.filter(r => !(r.colaboradorId === colaboradorId && r.subtipoId === subtipoId)),
      { colaboradorId, subtipoId, obligatorio, plazoDias: plazo, exigeVigencia: false, por: usuario, fecha: iso(hoy()) },
    ])
    anotar('requisito', 'requisito', subtipoId, colaboradorId, `Le exigió ${nombre}${obligatorio ? '' : ' (opcional)'}, con ${plazo} días de plazo`)
  }, [subtipos, setRequisitos, anotar, usuario])

  const quitarRequisito = useCallback((colaboradorId, subtipoId) => {
    const nombre = subtipos.find(x => x.id === subtipoId)?.nombre || 'un documento'
    setRequisitos(prev => prev.filter(r => !(r.colaboradorId === colaboradorId && r.subtipoId === subtipoId)))
    anotar('requisito', 'requisito', subtipoId, colaboradorId, `Dejó de exigirle ${nombre}`)
  }, [subtipos, setRequisitos, anotar])

  /* SOLICITUDES. Se ATIENDEN con lo que piden —emitiendo, enviando la copia, reemitiendo— o se
     rechazan con motivo, como un documento.
     `vinculo` guarda CON QUÉ se atendió —el emitido nuevo, la copia enviada, el anulado de una
     corrección—: el pedido y su documento quedan unidos, y el colaborador lo ve (Documentación v2). */
  const resolverSolicitud = useCallback((id, estadoNuevo, nota = '', vinculo = {}) => {
    const q = solicitudes.find(x => x.id === id)
    setSolicitudes(prev => prev.map(x => (x.id === id ? { ...x, estado: estadoNuevo, resuelto: { fecha: iso(hoy()), por: usuario, nota, ...vinculo } } : x)))
    const verbo = { atendida: 'Atendió', aprobada: 'Aprobó', rechazada: 'Rechazó' }[estadoNuevo] || 'Resolvió'
    anotar('solicitud', 'solicitud', id, q?.colaboradorId ?? null, `${verbo} la solicitud «${q?.asunto || ''}»${nota ? `: ${nota}` : ''}`)
  }, [solicitudes, setSolicitudes, anotar, usuario])

  /* PEDIR, DESDE EL LADO DEL COLABORADOR («Mis documentos»). Llega a la bandeja de Solicitudes
     como cualquier otra, con el canal por el que entró. `extra` lleva lo que cada tipo necesita
     para atenderse: el modelo del certificado, la carpeta de la copia, lo emitido a corregir. */
  const crearSolicitud = useCallback(({ colaboradorId, tipo, asunto, detalle = '', canal = 'app', ...extra }) => {
    const id = nuevoId('q')
    setSolicitudes(prev => [{ id, tipo, colaboradorId, fecha: iso(hoy()), asunto, detalle, estado: 'pendiente', canal, ...extra }, ...prev])
    anotar('solicitud', 'solicitud', id, colaboradorId, `Solicitó «${asunto}» (${canal})`)
    return id
  }, [setSolicitudes, anotar])

  const registrarDescarga = useCallback((entidad, entidadId, colaboradorId, detalle, confidencial = false) => {
    anotar(confidencial ? 'lectura' : 'descarga', entidad, entidadId, colaboradorId, detalle)
  }, [anotar])

  /* CARGA POR LOTE (RF-30): las filas buenas se cargan aunque otras fallen, y el lote queda
     registrado con su reporte fila por fila. */
  const registrarLote = useCallback((filas, errores) => {
    const id = nuevoId('l')
    const vistos = new Set()
    for (const f of filas) {
      const k = `${f.colaboradorId}|${f.subtipoId}`
      const yaEstaba = documentos.some(d => d.colaboradorId === f.colaboradorId && d.subtipoId === f.subtipoId && !d.eliminado)
      cargarDocumento({ ...f, canal: 'lote', esReemplazo: yaEstaba || vistos.has(k) })
      vistos.add(k)
    }
    setLotes(prev => [{ id, fecha: iso(hoy()), por: usuario, ok: filas.length, errores }, ...prev])
    return id
  }, [documentos, cargarDocumento, setLotes, usuario])

  /* PEDIR UN DOCUMENTO (bandeja, propuesta 6). El envío es del motor de Comunicación (3.8), que
     la demo no tiene; lo que sí queda es el pedido, con fecha, y su evento en la bitácora. */
  const pedirDocumentos = useCallback(items => {
    const fecha = iso(hoy())
    setPedidos(prev => { const n = { ...prev }; for (const i of items) n[`${i.colaboradorId}|${i.subtipoId}`] = fecha; return n })
    for (const i of items) anotar('pedido', 'requisito', i.subtipoId, i.colaboradorId, `Pidió ${i.nombre || 'el documento'}`)
  }, [setPedidos, anotar])

  /* ── EMISIÓN (4.7, 4.8) ── */

  /* EMITIR: número automático que no se repite (RF-53, RN-15), datos congelados del momento
     (RN-16) y texto rellenado con la versión de plantilla vigente. Si el modelo requiere
     aprobación y lo pide una solicitud, queda pendiente. */
  /* ENVIAR ES EMITIR Y ENTREGAR EN UN SOLO GESTO (Documentación v3, como Humand y Talana): lo que se
     emite le llega al colaborador por la app en el mismo momento. `pideAcuse` dice si se le pide
     confirmar que lo recibió; sin eso, el documento queda entregado y nada más. */
  const entregaInicial = (enviar, pendiente) => (enviar && !pendiente
    ? { estado: 'entregado', entregas: [{ canal: 'app', fecha: iso(hoy()), por: usuario }] }
    : { estado: pendiente ? 'pendiente' : 'generado', entregas: [] })

  const emitir = useCallback(({ modeloId, colaboradorId, observaciones = '', pendiente = false, fecha = null, enviar = true, pideAcuse = true }) => {
    const modelo = modelos.find(m => m.id === modeloId)
    const persona = personas.find(p => p.id === colaboradorId)
    const version = [...modelo.versiones].reverse().find(v => v.estado === 'publicada')
    const contrato = contratos.find(c => c.colaboradorId === colaboradorId && c.tipo === 'contrato' && ['vigente', 'por_vencer'].includes(estadoContrato(c, parametros, contratos)))
    const num = siguienteNumero(modelo.categoria, emitidos, parametros, contratos)
    const datos = datosPara(persona, { empresa, contrato, numero: num.texto, observaciones })
    // Un memorándum puede llevar otra fecha que la de hoy; el certificado, no.
    if (fecha) datos['documento.fecha'] = fechaLarga(fecha)
    const nuevo = {
      id: nuevoId('e'), modeloId, categoria: modelo.categoria, colaboradorId, versionPlantilla: version.v,
      numero: num.texto, n: num.n, gestion: num.gestion, fecha: fecha || iso(hoy()), emitidoPor: usuario,
      ...entregaInicial(enviar, pendiente), pideAcuse, datos, texto: rellenar(version.texto, datos), observaciones, acuse: null,
    }
    setEmitidos(prev => [nuevo, ...prev])
    anotar('emision', 'emitido', nuevo.id, colaboradorId, `Emitió ${nuevo.numero} · ${modelo.nombre}`)
    return nuevo
  }, [modelos, personas, contratos, emitidos, parametros, empresa, usuario, setEmitidos, anotar]) // eslint-disable-line react-hooks/exhaustive-deps

  /* EMITIR A VARIOS: el mismo modelo para un grupo, un documento por persona, cada uno con su
     número y los datos de SU ficha congelados (RN-16). Los números se calculan en serie sobre la
     lista que va creciendo: llamar a `emitir` en un ciclo leería la misma lista vieja cada vez y
     repetiría el número, que es justo lo que RN-15 prohíbe. Un solo cambio de estado al final. */
  /* CADA EMISIÓN A VARIOS DEJA UN LOTE (Documentación v2): el nombre, el modelo, quién y cuándo, y
     sus documentos. Es a lo que se vuelve para saber quién de los cuarenta confirmó y a quién
     recordarle. Cada emitido sigue siendo uno por persona, con su número; el lote sólo los junta. */
  const emitirVarios = useCallback(({ modeloId, colaboradorIds, observaciones = '', fecha = null, nombreLote = '', enviar = true, pideAcuse = true }) => {
    const modelo = modelos.find(m => m.id === modeloId)
    const version = [...modelo.versiones].reverse().find(v => v.estado === 'publicada')
    const acumulado = [...emitidos]
    const nuevos = []
    const loteId = nuevoId('le')
    for (const cid of colaboradorIds) {
      const persona = personas.find(p => p.id === cid)
      if (!persona) continue
      const contrato = contratos.find(c => c.colaboradorId === cid && c.tipo === 'contrato' && ['vigente', 'por_vencer'].includes(estadoContrato(c, parametros, contratos)))
      const num = siguienteNumero(modelo.categoria, acumulado, parametros, contratos)
      const datos = datosPara(persona, { empresa, contrato, numero: num.texto, observaciones })
      if (fecha) datos['documento.fecha'] = fechaLarga(fecha)
      const nuevo = {
        id: nuevoId('e'), modeloId, categoria: modelo.categoria, colaboradorId: cid, versionPlantilla: version.v,
        numero: num.texto, n: num.n, gestion: num.gestion, fecha: fecha || iso(hoy()), emitidoPor: usuario,
        ...entregaInicial(enviar, false), pideAcuse, datos, texto: rellenar(version.texto, datos), observaciones, acuse: null, lote: true, loteId,
      }
      acumulado.unshift(nuevo)
      nuevos.push(nuevo)
    }
    if (!nuevos.length) return nuevos
    const fechaLote = fecha || iso(hoy())
    const nombre = nombreLote.trim() || `${modelo.nombre} · ${nuevos.length} personas · ${fechaCorta(fechaLote)}`
    setEmitidos(prev => [...[...nuevos].reverse(), ...prev])
    setLotesEmision(prev => [{ id: loteId, nombre, modeloId, fecha: fechaLote, por: usuario, ids: nuevos.map(n => n.id) }, ...prev])
    for (const n of nuevos) anotar('emision', 'emitido', n.id, n.colaboradorId, `Emitió ${n.numero} · ${modelo.nombre} (lote «${nombre}», ${nuevos.length} personas)`)
    return nuevos
  }, [modelos, personas, contratos, emitidos, parametros, empresa, usuario, setEmitidos, setLotesEmision, anotar]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ENVIAR UN ARCHIVO PROPIO —un reglamento, una política, un comunicado en PDF— a una o a varias
     personas. No sale de una plantilla: es el mismo archivo para todos, guardado una vez. Igual que
     lo emitido, queda en «Recibidos» de cada uno, con su número de la serie «otro documento». */
  const enviarArchivo = useCallback(({ nombre, archivo, colaboradorIds, pideAcuse = true }) => {
    const acumulado = [...emitidos]
    const loteId = colaboradorIds.length > 1 ? nuevoId('le') : null
    const nuevos = []
    for (const cid of colaboradorIds) {
      if (!personas.some(p => p.id === cid)) continue
      const num = siguienteNumero('otro', acumulado, parametros, contratos)
      const nuevo = {
        id: nuevoId('e'), modeloId: null, nombre, archivo, categoria: 'otro', colaboradorId: cid, versionPlantilla: null,
        numero: num.texto, n: num.n, gestion: num.gestion, fecha: iso(hoy()), emitidoPor: usuario,
        ...entregaInicial(true, false), pideAcuse, datos: {}, texto: '', observaciones: '', acuse: null, ...(loteId ? { lote: true, loteId } : {}),
      }
      acumulado.unshift(nuevo)
      nuevos.push(nuevo)
    }
    if (!nuevos.length) return nuevos
    setEmitidos(prev => [...[...nuevos].reverse(), ...prev])
    if (loteId) setLotesEmision(prev => [{ id: loteId, nombre, modeloId: null, fecha: iso(hoy()), por: usuario, ids: nuevos.map(n => n.id) }, ...prev])
    for (const n of nuevos) anotar('emision', 'emitido', n.id, n.colaboradorId, `Envió ${n.numero} · ${nombre}`)
    return nuevos
  }, [emitidos, personas, parametros, contratos, usuario, setEmitidos, setLotesEmision, anotar]) // eslint-disable-line react-hooks/exhaustive-deps

  const renombrarLote = useCallback((loteId, nombre) => {
    setLotesEmision(prev => prev.map(l => (l.id === loteId ? { ...l, nombre: nombre.trim() || l.nombre } : l)))
  }, [setLotesEmision])

  /* RECORDAR A QUIEN NO CONFIRMÓ. El envío es del motor de Comunicación, que la demo no tiene; lo
     que sí queda es el recordatorio en cada documento —con fecha y quién— y en la bitácora. */
  const recordarAcuse = useCallback(ids => {
    const fecha = iso(hoy())
    const pendientes = emitidos.filter(e => ids.includes(e.id) && e.estado === 'entregado' && e.pideAcuse !== false)
    const destino = new Set(pendientes.map(e => e.id))
    setEmitidos(prev => prev.map(e => (destino.has(e.id) ? { ...e, recordatorios: [...(e.recordatorios || []), { fecha, por: usuario }] } : e)))
    for (const e of pendientes) anotar('recordatorio', 'emitido', e.id, e.colaboradorId, `Le recordó confirmar la recepción de ${e.numero}`)
    return pendientes.length
  }, [emitidos, setEmitidos, anotar, usuario])

  /* Entregar varios de una vez: la misma constancia de entrega en cada uno (RF-55). */
  const entregarVarios = useCallback((ids, canal) => {
    const colabs = new Map(emitidos.filter(e => ids.includes(e.id)).map(e => [e.id, e.colaboradorId]))
    setEmitidos(prev => prev.map(e => (!ids.includes(e.id) || e.estado === 'anulado' ? e : { ...e, estado: e.estado === 'acusado' ? 'acusado' : 'entregado', entregas: [...e.entregas, { canal, fecha: iso(hoy()), por: usuario }] })))
    for (const id of ids) anotar('entrega', 'emitido', id, colabs.get(id) ?? null, `Entregó por ${canal}`)
  }, [emitidos, setEmitidos, anotar, usuario])

  const entregar = useCallback((emitidoId, canal) => {
    const colab = emitidos.find(e => e.id === emitidoId)?.colaboradorId ?? null
    setEmitidos(prev => prev.map(e => { if (e.id !== emitidoId || e.estado === 'anulado') return e; return { ...e, estado: e.estado === 'acusado' ? 'acusado' : 'entregado', entregas: [...e.entregas, { canal, fecha: iso(hoy()), por: usuario }] } }))
    anotar('entrega', 'emitido', emitidoId, colab, `Entregó por ${canal}`)
  }, [emitidos, setEmitidos, anotar, usuario])

  /* EL ACUSE DE RECIBO lo da el colaborador, una vez y para siempre: confirma que lo recibió, no
     que está de acuerdo. Queda con la fecha y desde dónde (RF-55). */
  const acusarRecibo = useCallback((emitidoId, dispositivo) => {
    const e = emitidos.find(x => x.id === emitidoId)
    if (!e || e.acuse || e.estado === 'anulado') return
    setEmitidos(prev => prev.map(x => (x.id !== emitidoId || x.acuse ? x : { ...x, estado: 'acusado', acuse: { fecha: iso(hoy()), dispositivo } })))
    anotar('acuse', 'emitido', emitidoId, e.colaboradorId, `Acusó recibo de ${e.numero} desde ${dispositivo}`)
  }, [emitidos, setEmitidos, anotar])

  /* ANULAR (RN-14): un emitido no se edita; se anula con motivo y el número queda quemado. */
  const anular = useCallback((emitidoId, motivo) => {
    const colab = emitidos.find(e => e.id === emitidoId)?.colaboradorId ?? null
    setEmitidos(prev => prev.map(e => { if (e.id !== emitidoId) return e; return { ...e, estado: 'anulado', anulado: { fecha: iso(hoy()), por: usuario, motivo } } }))
    anotar('anulacion', 'emitido', emitidoId, colab, `Anuló: ${motivo}`)
  }, [emitidos, setEmitidos, anotar, usuario])

  /* ── CONTRATOS (4.9) ── */

  /* REGISTRAR: si hay uno vigente, la pantalla obliga a decidir antes —`decision` dice qué pasa
     con el anterior— porque dos vigentes dejan a Planillas sin saber cuál aplicar (RN-18). */
  const registrarContrato = useCallback(({ colaboradorId, modalidad, inicio, fin, modeloId, comentarios = '', origenId = null, camino = 'generar', archivo = null, decision = null, anteriorId = null }) => {
    const num = siguienteNumero('contrato', emitidos, parametros, contratos)
    const persona = personas.find(p => p.id === colaboradorId)
    const id = nuevoId('k')
    const nuevo = {
      id, colaboradorId, tipo: origenId ? 'adenda' : 'contrato', origenId, modalidad, inicio, fin: modalidad === 'indefinido' ? null : fin,
      modeloId, numero: num.texto, gestion: num.gestion, comentarios,
      versiones: [{ v: 1, tipo: camino === 'cargar' ? 'firmado' : 'generado', fecha: iso(hoy()), por: usuario, motivo: camino === 'cargar' ? 'Se cargó el firmado' : 'Generado desde plantilla', archivo: archivo || `${persona?.codigo}_${origenId ? 'adenda' : 'contrato'}_${iso(hoy())}.pdf` }],
    }
    setContratos(prev => {
      let lista = prev
      if (anteriorId && decision) {
        lista = prev.map(c => (c.id !== anteriorId ? c : decision === 'finalizar'
          ? { ...c, finalizado: { fecha: iso(hoy()), por: usuario, motivo: 'Finalizado al registrar un contrato nuevo' } }
          : { ...c, reemplazado: { fecha: iso(hoy()), por: usuario, por_id: id } }))
      }
      return [nuevo, ...lista]
    })
    anotar('alta', 'contrato', id, colaboradorId, `Registró ${origenId ? 'adenda' : 'contrato'} ${num.texto}`)
    return nuevo
  }, [emitidos, parametros, contratos, personas, usuario, setContratos, anotar])

  /* REEMPLAZAR VERSIONA (RF-63, RN-13): la anterior sigue descargable. */
  const versionarContrato = useCallback((contratoId, { tipo, motivo, archivo }) => {
    const colab = contratos.find(c => c.id === contratoId)?.colaboradorId ?? null
    setContratos(prev => prev.map(c => { if (c.id !== contratoId) return c; return { ...c, versiones: [...c.versiones, { v: c.versiones.length + 1, tipo, fecha: iso(hoy()), por: usuario, motivo, archivo }] } }))
    anotar('reemplazo', 'contrato', contratoId, colab, `Nueva versión: ${motivo}`)
  }, [contratos, setContratos, anotar, usuario])

  const finalizarContrato = useCallback((contratoId, motivo) => {
    const colab = contratos.find(c => c.id === contratoId)?.colaboradorId ?? null
    setContratos(prev => prev.map(c => { if (c.id !== contratoId) return c; return { ...c, finalizado: { fecha: iso(hoy()), por: usuario, motivo } } }))
    anotar('baja', 'contrato', contratoId, colab, `Finalizó el contrato: ${motivo}`)
  }, [contratos, setContratos, anotar, usuario])

  /* ── CONFIGURACIÓN (4.1, 4.2, 4.6) ──
     Se exponen los `set` porque las pantallas de configuración editan listas enteras; cada una
     llama a `anotarConfig` al guardar para que el cambio quede en la bitácora. */
  const anotarConfig = useCallback(detalle => anotar('configuracion', 'configuracion', null, null, detalle), [anotar])

  /* ── CONSULTAS ── */
  const checklist = useCallback(persona => checklistDe(persona, estado), [estado])
  const avanceDe = useCallback(persona => completitud(checklistDe(persona, estado)), [estado])
  const persona = useCallback(id => personas.find(p => p.id === Number(id)) || null, [personas])
  /* El usuario de la demo es una persona del módulo por su nombre, como en su ficha (`useMiFicha`). */
  const personaDeUsuario = useCallback(nombre => personas.find(p => p.name === nombre) || null, [personas])
  const subtipo = useCallback(id => subtipos.find(x => x.id === id) || null, [subtipos])
  const tipo = useCallback(id => tipos.find(x => x.id === id) || null, [tipos])
  const modelo = useCallback(id => modelos.find(x => x.id === id) || null, [modelos])

  const valor = {
    ...estado,
    personas, sucursales, empresa, usuario,
    setTipos, setSubtipos, setParametros, setModelos, setRequisitos,
    cargarDocumento, cambiarFechas, revisar, eliminarDocumento,
    sinClasificar, subirSinClasificar, clasificar, descartarSinClasificar, recuperarDocumento, exonerar, registrarDescarga, registrarLote,
    agregarRequisito, quitarRequisito, resolverSolicitud, crearSolicitud,
    pedidos, pedirDocumentos,
    emitir, emitirVarios, enviarArchivo, renombrarLote, recordarAcuse, entregar, entregarVarios, acusarRecibo, anular,
    registrarContrato, versionarContrato, finalizarContrato,
    anotarConfig,
    checklist, avanceDe, persona, personaDeUsuario, subtipo, tipo, modelo,
  }
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDocumentacion = () => useContext(Ctx)
