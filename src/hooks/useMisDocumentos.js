import { useCallback, useMemo } from 'react'
import { useDocumentacion } from '../context/DocumentacionContext'
import {
  ESTADOS, CATEGORIAS, MODALIDADES, carpetasRecibidas, carpetaRecibida, versionActual, estadoVersion, estadoContrato, normalizarNombre,
  sumarMeses, iso, hoy, rellenar, fechaCorta, completitud,
  plazoSolicitudDe,
} from '../data/documentacionData'
import { extensionDe } from '../components/documentacion/deducir'
import { seEnsena } from '../data/fichaColaborador'
import { guardarArchivo, leerArchivo, nuevaClaveArchivo } from '../utils/archivosLocales'

/* ── «MIS DOCUMENTOS»: EL MÓDULO VISTO DESDE EL COLABORADOR ──────────────────
   Lo mismo para el celular (`MisDocumentosPhone`) y para la web (`MisDocumentos`): las dos
   pantallas dibujan distinto y deciden lo mismo, porque lo deciden acá. Nada de esto guarda
   nada propio: lee el estado del módulo y llama a sus acciones, así que lo que el colaborador sube
   es lo que RR.HH. revisa, y lo que RR.HH. emite es lo que él recibe.

   QUÉ VE: sólo lo suyo, y de lo suyo sólo los subtipos marcados «visible para el colaborador»
   (`visibleColab`). QUÉ SUBE: sólo lo que el subtipo deja subir (`editableColab`); lo demás —un
   acta de entrega, el documento del garante— lo carga RR.HH. y él lo ve. Lo que sube entra «en
   revisión» y no cuenta hasta que RR.HH. lo aprueba (RN-05). NO FIRMA: el contrato firmado lo
   sigue cargando RR.HH.; él lo consulta. */

// El orden de urgencia de la lista de pendientes: lo que ya le rechazaron, primero.
const URGENCIA = { rechazado: 0, vencido: 1, faltante: 2, por_vencer: 3 }
const QUE_HACER = { rechazado: 'Volver a subir', vencido: 'Renovar', faltante: 'Subir', por_vencer: 'Renovar' }

/* Por qué algo está en sus pendientes, en una línea. */
export function textoMotivo(p) {
  if (p.estado === 'rechazado') return `RR.HH. lo rechazó: ${p.motivo || 'sin motivo escrito'}`
  if (p.estado === 'vencido') return `Venció el ${fechaCorta(p.version?.vencimiento)}. Envíe el renovado.`
  if (p.estado === 'por_vencer') return `Vence el ${fechaCorta(p.version?.vencimiento)}. Envíe el renovado antes de esa fecha.`
  if (p.pedido) return `RR.HH. se lo pidió el ${fechaCorta(p.pedido)}.`
  if (p.limite && !p.exigible) return `Tiene plazo hasta el ${fechaCorta(p.limite)}.`
  return 'RR.HH. lo necesita para completar su expediente.'
}

/* LA CARPETA «PERFIL PROFESIONAL» SIGUE AL PASO DE LA FICHA: se ve en local y no en Vercel, donde
   ese paso todavía no se enseña (`SOLO_EN_LOCAL` de fichaColaborador). Sin la carpeta, tampoco
   sus documentos ni lo que se pida de ella. */
const OCULTAS = seEnsena('perfil') ? [] : ['t-perfil']
const seVe = s => !!s && !OCULTAS.includes(s.tipoId)

export const DISPOSITIVO ={ app: 'Celular · app SoulyHR', web: 'Navegador · SoulyHR web' }

export function useMisDocumentos(nombre, canal = 'web') {
  const ctx = useDocumentacion()
  const {
    documentos, subtipos, tipos, parametros, emitidos, contratos, solicitudes, modelos, pedidos,
    personaDeUsuario, checklist, cargarDocumento, acusarRecibo, crearSolicitud, registrarDescarga,
  } = ctx
  const persona = personaDeUsuario(nombre)

  const datos = useMemo(() => {
    if (!persona) return null
    const sub = id => subtipos.find(s => s.id === id)

    /* SU EXPEDIENTE: cada documento con su estado deducido, como lo ve RR.HH. */
    const propios = documentos
      .filter(d => d.colaboradorId === persona.id && !d.eliminado)
      .map(d => {
        const s = sub(d.subtipoId)
        const v = versionActual(d)
        return { doc: d, subtipo: s, version: v, estado: estadoVersion(v, s, parametros), nombre: (d.origen === 'ficha' && v?.info) || v?.info || s?.nombre || 'Documento' }
      })
      .filter(x => x.subtipo?.activo && x.subtipo.visibleColab && seVe(x.subtipo))

    /* LO QUE TIENE QUE HACER. De la checklist —lo que se le exige—, lo que falta, lo rechazado y lo
       vencido o por vencer; y fuera de ella, lo que ya tiene y se le está venciendo (una licencia
       que nadie le exige pero que el día que caduque deja de valer). Lo que ya renovó y está en
       revisión no se le vuelve a pedir: un subtipo con varios —dos licencias— suma un documento
       nuevo y el viejo vencido sigue ahí, así que se mira si hay uno más nuevo esperando. */
    const lista = checklist(persona)
    const yaRenovado = x => propios.some(o => o.doc.id !== x.doc?.id && o.subtipo.id === x.subtipo.id
      && ['en_revision', 'vigente'].includes(o.estado) && (o.version?.fecha || '') >= (x.version?.fecha || ''))
    const pendientes = []
    for (const i of lista) {
      if (!i.subtipo?.visibleColab || !seVe(i.subtipo) || !(i.estado in URGENCIA)) continue
      const v = versionActual(i.documento)
      pendientes.push({
        clave: `r-${i.subtipo.id}`, subtipo: i.subtipo, estado: i.estado, doc: i.documento, version: v,
        obligatorio: i.requisito.obligatorio, limite: i.limite, exigible: i.exigible,
        pedido: pedidos[`${persona.id}|${i.subtipo.id}`] || null,
        motivo: i.estado === 'rechazado' ? v?.motivoRechazo : null,
      })
    }
    for (const x of propios) {
      if (!['vencido', 'por_vencer'].includes(x.estado)) continue
      if (pendientes.some(p => p.doc?.id === x.doc.id || (!x.subtipo.varios && p.subtipo.id === x.subtipo.id))) continue
      pendientes.push({ clave: `d-${x.doc.id}`, subtipo: x.subtipo, estado: x.estado, doc: x.doc, version: x.version, nombre: x.nombre, obligatorio: false, pedido: null, motivo: null })
    }
    const porHacer = pendientes
      .filter(p => !yaRenovado(p))
      .map(p => ({ ...p, accion: QUE_HACER[p.estado], subeEl: !!p.subtipo.editableColab }))
      .sort((a, b) => URGENCIA[a.estado] - URGENCIA[b.estado])

    const enRevision = propios.filter(x => x.estado === 'en_revision')

    const carpetas = tipos
      .filter(t => t.activo && !OCULTAS.includes(t.id))
      .map(t => ({ tipo: t, docs: propios.filter(x => x.subtipo.tipoId === t.id) }))
      .filter(c => c.docs.length)

    const misContratos = contratos
      .filter(c => c.colaboradorId === persona.id && c.versiones?.length)
      .map(c => {
        const v = c.versiones[c.versiones.length - 1]
        return { contrato: c, version: v, estado: estadoContrato(c, parametros, contratos), nombre: `${c.tipo === 'adenda' ? 'Adenda' : 'Contrato'} ${MODALIDADES[c.modalidad]?.toLowerCase() || ''}`.trim() }
      })
      .sort((a, b) => (a.contrato.inicio < b.contrato.inicio ? 1 : -1))

    /* LO QUE RECIBIÓ: lo emitido que RR.HH. ya le entregó. Lo generado y no entregado todavía no es
       suyo, y lo anulado deja de estar. El texto es el que quedó congelado al emitir (RN-16). */
    const recibidos = emitidos
      .filter(e => e.colaboradorId === persona.id && ['entregado', 'acusado'].includes(e.estado))
      .map(e => {
        const m = modelos.find(x => x.id === e.modeloId)
        const plantilla = m?.versiones.find(v => v.v === e.versionPlantilla) || m?.versiones[m.versiones.length - 1]
        return { emitido: e, nombre: e.nombre || m?.nombre || CATEGORIAS[e.categoria]?.label || 'Documento', texto: e.texto || (e.archivo ? '' : rellenar(plantilla?.texto, e.datos)) }
      })
      .sort((a, b) => (a.emitido.fecha < b.emitido.fecha ? 1 : -1))

    const misSolicitudes = solicitudes
      .filter(q => q.colaboradorId === persona.id)
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))

    // Los certificados que puede pedir: los modelos que RR.HH. habilitó para solicitud.
    const certificables = modelos.filter(m => m.disponibleSolicitud && m.estado === 'activo' && m.categoria === 'certificado')

    /* LO QUE SE PUEDE PEDIR, ya como opciones de la lista de cada tipo. `carpeta` es lo que la
       bandeja de RR.HH. mira para dejar elegida la copia correcta cuando la atiende. */
    const opciones = {
      certificacion: certificables.map(m => ({ clave: m.id, nombre: m.nombre, modeloId: m.id })),
      // Copia, sólo del contrato: lo demás ya lo ve y lo descarga él mismo en Mis documentos.
      copia: misContratos.map(c => ({ clave: `c-${c.contrato.id}`, nombre: `${c.nombre} · ${c.contrato.numero}`, carpeta: 'contratos' })),
      correccion: recibidos.map(r => ({ clave: r.emitido.id, nombre: `${r.nombre} · ${r.emitido.numero}`, modeloId: r.emitido.modeloId, emitidoId: r.emitido.id })),
    }

    /* Para el celular (v3), que muestra todas las carpetas aunque estén vacías y deja subir desde
       cada una: las carpetas activas, y qué documentos puede subir el colaborador. */
    const tiposActivos = tipos.filter(t => t.activo && !OCULTAS.includes(t.id))
    const subibles = subtipos.filter(s => s.activo && s.visibleColab && s.editableColab && seVe(s))

    /* LO QUE LE ENVÍA RR.HH., EN CARPETAS: certificados, memorándums, una por cada tipo que creó la
       empresa —«Constancias»— y «Otros» para lo demás. */
    const carpetaDe = e => carpetaRecibida(e, parametros)
    /* «Otros» sólo si tiene algo —un archivo propio que se le envió—: no es un tipo que se haya creado. */
    const carpetasRrhh = carpetasRecibidas(parametros).filter(([k]) => k !== 'otro' || recibidos.some(r => carpetaDe(r.emitido) === 'otro'))
    return { carpetasRrhh, carpetaDe, propios, porHacer, enRevision, carpetas, misContratos, recibidos, misSolicitudes, opciones, tiposActivos, subibles, avance: completitud(lista.filter(i => seVe(i.subtipo))) }
  }, [persona, documentos, subtipos, tipos, parametros, emitidos, contratos, solicitudes, modelos, pedidos, checklist])

  /* SUBIR. El formato y el tamaño se controlan acá, con las reglas del subtipo, y se avisa en
     palabras. La emisión es la de hoy y el vencimiento el que propone el subtipo: RR.HH. las
     corrige al revisar si el documento es de antes (`cambiarFechas`). Devuelve el error o null. */
  const subir = useCallback(async (pendiente, file) => {
    const s = pendiente.subtipo
    const formato = extensionDe(file.name)
    if (!s.formatos.includes(formato)) return `Este documento se recibe en ${s.formatos.map(f => f.toUpperCase()).join(', ')}.`
    if (file.size > s.tamanoMaxMB * 1024 * 1024) return `El archivo pesa más de ${s.tamanoMaxMB} MB. Envíe uno más liviano.`
    const clave = nuevaClaveArchivo()
    const guardado = await guardarArchivo(clave, file).catch(() => false)
    const emision = iso(hoy())
    // Un subtipo con varios renueva EL documento que vencía, no suma uno suelto; los de la ficha no se versionan acá.
    const propio = pendiente.doc && pendiente.doc.origen !== 'ficha' && documentos.some(d => d.id === pendiente.doc.id)
    cargarDocumento({
      colaboradorId: persona.id,
      subtipoId: s.id,
      porColaborador: true,
      canal,
      documentoId: s.varios && propio ? pendiente.doc.id : null,
      motivo: pendiente.doc ? (pendiente.estado === 'rechazado' ? 'Lo volvió a subir el colaborador' : 'Lo renovó el colaborador') : '',
      version: {
        archivo: {
          nombre: normalizarNombre(persona, s, emision, formato),
          original: file.name, formato, tamanoKB: Math.round(file.size / 1024),
          clave: guardado === false ? null : clave, tipoMime: file.type,
        },
        emision,
        vencimiento: s.vence ? sumarMeses(emision, s.vigenciaMeses) : null,
        info: '',
      },
    })
    return null
  }, [persona, documentos, cargarDocumento, canal])

  const acusar = useCallback(emitidoId => acusarRecibo(emitidoId, DISPOSITIVO[canal]), [acusarRecibo, canal])

  /* PEDIR: el tipo, la opción elegida de su lista y, si hace falta, el detalle. El asunto se arma
     solo, con las mismas palabras que ya usa la bandeja de RR.HH. */
  const solicitar = useCallback(({ tipo, opcion, detalle = '' }) => {
    const asunto = tipo === 'certificacion' ? opcion.nombre
      : tipo === 'copia' ? `Copia de ${opcion.nombre.split(' · ')[0].toLowerCase()}`
        : `${opcion.nombre.split(' · ')[0]} con un error`
    const extra = Object.fromEntries(['modeloId', 'carpeta', 'emitidoId', 'docId'].filter(k => opcion[k]).map(k => [k, opcion[k]]))
    return crearSolicitud({ colaboradorId: persona.id, tipo, asunto, detalle: detalle.trim(), canal, ...extra })
  }, [crearSolicitud, persona, canal])

  /* ABRIR EL ARCHIVO, si está en este navegador. Lo que vino de la ficha o de la semilla de la demo
     no tiene archivo de verdad: devuelve false y la pantalla lo dice. */
  const abrir = useCallback(async (version, docId) => {
    const clave = version?.archivo?.clave
    const blob = clave ? await leerArchivo(clave) : null
    if (!blob) return false
    window.open(URL.createObjectURL(blob), '_blank', 'noopener')
    registrarDescarga('documento', docId, persona.id, `Abrió ${version.archivo.nombre} desde Mis documentos (${canal})`)
    return true
  }, [registrarDescarga, persona, canal])

  return { persona, ...(datos || {}), subir, acusar, solicitar, abrir, ESTADOS, plazoSolicitud: plazoSolicitudDe(parametros) }
}
