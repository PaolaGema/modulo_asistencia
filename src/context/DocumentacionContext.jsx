import { createContext, useCallback, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useOnboardingData } from './OnboardingDataContext'
import { useUser } from './UserContext'
import { cargoDe, sedesDe } from '../data/organigramaData'
import { colaboradoresData } from '../pages/personas/colaboradoresData'
import {
  TIPOS_SEED, SUBTIPOS_SEED, PARAMETROS_SEED, CONJUNTOS_SEED, MODELOS_SEED,
  documentosSeed, contratosSeed, emitidosSeed, bitacoraSeed,
  sedeDemoDe, ingresoISO, iso, hoy, fechaLarga, checklistDe, completitud, siguienteNumero, datosPara, rellenar,
  estadoContrato,
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
    documento: `${4800000 + c.id * 13337} ${['LP', 'SC', 'CB'][c.id % 3]}`,
  }
}

/* Las semillas se calculan una vez, con el directorio de fábrica: son el punto de partida de la
   demo, no una función del directorio vivo. Quien se dé de alta después arranca sin documentos,
   que es lo que le pasaría en la vida real. */
let SEMILLAS = null
function semillas(sucursales) {
  if (SEMILLAS) return SEMILLAS
  const personas = colaboradoresData.map(c => enriquecer(c, null, sucursales))
  const documentos = documentosSeed(personas, CONJUNTOS_SEED, SUBTIPOS_SEED)
  const emitidos = emitidosSeed(personas)
  SEMILLAS = { documentos, emitidos, contratos: contratosSeed(personas), bitacora: bitacoraSeed(documentos, emitidos) }
  return SEMILLAS
}

const nuevoId = p => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

export function DocumentacionProvider({ children }) {
  const { colaboradores, organigrama, sucursales, empresa } = useOnboardingData()
  const { currentUser } = useUser()
  const s = semillas(sucursales)

  const [tipos, setTipos] = useLocalStorage('doc_tipos', TIPOS_SEED)
  const [subtipos, setSubtipos] = useLocalStorage('doc_subtipos', SUBTIPOS_SEED)
  const [parametros, setParametros] = useLocalStorage('doc_parametros', PARAMETROS_SEED)
  const [conjuntos, setConjuntos] = useLocalStorage('doc_conjuntos', CONJUNTOS_SEED)
  const [modelos, setModelos] = useLocalStorage('doc_modelos', MODELOS_SEED)
  const [documentos, setDocumentos] = useLocalStorage('doc_documentos', s.documentos)
  const [exoneraciones, setExoneraciones] = useLocalStorage('doc_exoneraciones', [])
  const [emitidos, setEmitidos] = useLocalStorage('doc_emitidos', s.emitidos)
  const [contratos, setContratos] = useLocalStorage('doc_contratos', s.contratos)
  const [lotes, setLotes] = useLocalStorage('doc_lotes', [])
  /* Los pedidos de documento hechos desde la bandeja: `${colaboradorId}|${subtipoId}` → fecha. */
  const [pedidos, setPedidos] = useLocalStorage('doc_pedidos', {})
  const [bitacora, setBitacora] = useLocalStorage('doc_bitacora', s.bitacora)
  /* La puesta en marcha (pantalla 1) recuerda qué pasos se revisaron. */
  const [puesta, setPuesta] = useLocalStorage('doc_puesta', { revisados: [] })

  const personas = useMemo(
    () => colaboradores.map(c => enriquecer(c, organigrama, sucursales)),
    [colaboradores, organigrama, sucursales],
  )

  const usuario = currentUser?.name || 'Sistema'

  const anotar = useCallback((accion, entidad, entidadId, colaboradorId, detalle) => {
    setBitacora(prev => [{ id: nuevoId('b'), fecha: iso(hoy()), hora: new Date().toTimeString().slice(0, 5), usuario, accion, entidad, entidadId, colaboradorId, detalle }, ...prev])
  }, [setBitacora, usuario])

  const estado = useMemo(
    () => ({ tipos, subtipos, parametros, conjuntos, modelos, documentos, exoneraciones, emitidos, contratos, lotes, bitacora }),
    [tipos, subtipos, parametros, conjuntos, modelos, documentos, exoneraciones, emitidos, contratos, lotes, bitacora],
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
  const emitir = useCallback(({ modeloId, colaboradorId, observaciones = '', pendiente = false, fecha = null }) => {
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
      estado: pendiente ? 'pendiente' : 'generado', datos, texto: rellenar(version.texto, datos), observaciones, entregas: [], acuse: null,
    }
    setEmitidos(prev => [nuevo, ...prev])
    anotar('emision', 'emitido', nuevo.id, colaboradorId, `Emitió ${nuevo.numero} · ${modelo.nombre}`)
    return nuevo
  }, [modelos, personas, contratos, emitidos, parametros, empresa, usuario, setEmitidos, anotar])

  const entregar = useCallback((emitidoId, canal) => {
    const colab = emitidos.find(e => e.id === emitidoId)?.colaboradorId ?? null
    setEmitidos(prev => prev.map(e => { if (e.id !== emitidoId) return e; return { ...e, estado: e.estado === 'acusado' ? 'acusado' : 'entregado', entregas: [...e.entregas, { canal, fecha: iso(hoy()), por: usuario }] } }))
    anotar('entrega', 'emitido', emitidoId, colab, `Entregó por ${canal}`)
  }, [emitidos, setEmitidos, anotar, usuario])

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
  const subtipo = useCallback(id => subtipos.find(x => x.id === id) || null, [subtipos])
  const tipo = useCallback(id => tipos.find(x => x.id === id) || null, [tipos])
  const modelo = useCallback(id => modelos.find(x => x.id === id) || null, [modelos])

  const valor = {
    ...estado,
    personas, sucursales, empresa, usuario,
    setTipos, setSubtipos, setParametros, setConjuntos, setModelos, setPuesta, puesta,
    cargarDocumento, revisar, eliminarDocumento, recuperarDocumento, exonerar, registrarDescarga, registrarLote,
    pedidos, pedirDocumentos,
    emitir, entregar, anular,
    registrarContrato, versionarContrato, finalizarContrato,
    anotarConfig,
    checklist, avanceDe, persona, subtipo, tipo, modelo,
  }
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDocumentacion = () => useContext(Ctx)
