import { leerArchivo } from '../../utils/archivosLocales'
import {
  ESTADOS, MODALIDADES, checklistDe, estadoVersion, fechaNum, rellenar, versionActual,
} from '../../data/documentacionData'
import { crearZip, nombreSeguro } from './zip'

/* ── EL EXPEDIENTE EN UN ZIP ──────────────────────────────────────────────
   Lo usan el expediente de una persona («Descargar expediente») y la descarga por lote de
   Reportes. Cada persona es una carpeta con un índice y sus documentos ordenados por tipo; lo
   emitido y los contratos van en su propia carpeta.

   EL ARCHIVO DE VERDAD SI EXISTE. Lo cargado en esta demo está guardado en el navegador y viaja
   tal cual; lo de los datos de ejemplo no tiene archivo, y en su lugar va una constancia en texto
   que dice qué habría ahí. Mejor eso que un ZIP con huecos sin explicar.

   LO CONFIDENCIAL NO VIAJA EN UNA DESCARGA MASIVA (RNF-12): con `confidenciales: false` se omite y
   el índice dice qué quedó fuera. */

async function entradasDe(persona, ctx, { confidenciales = true } = {}) {
  const { tipos, subtipos, documentos, emitidos, contratos, parametros, modelos } = ctx
  const raiz = nombreSeguro(`${persona.codigo} ${persona.name}`)
  const entradas = []
  const indice = []
  const omitidos = []

  indice.push(`EXPEDIENTE DE ${persona.name.toUpperCase()}`)
  indice.push(`Código ${persona.codigo} · ${persona.cargo || 'Sin cargo'} · ${persona.depto || 'Sin unidad'} · ${persona.sedeNombre || 'Sin sucursal'}`)
  indice.push(`Generado el ${new Date().toLocaleString('es-BO')}`)
  indice.push('')

  const cl = checklistDe(persona, ctx)
  const propios = documentos.filter(d => d.colaboradorId === persona.id && !d.eliminado)
  for (const t of tipos) {
    const delTipo = subtipos.filter(s => s.tipoId === t.id)
    const filas = []
    for (const s of delTipo) {
      const docs = propios.filter(d => d.subtipoId === s.id)
      const req = cl.find(i => i.subtipo.id === s.id)
      if (!docs.length && req) filas.push(`  ${s.nombre.padEnd(40)} ${ESTADOS[req.estado].label}`)
      for (const d of docs) {
        const v = versionActual(d)
        const est = estadoVersion(v, s, parametros)
        if (s.sensibilidad === 'confidencial' && !confidenciales) {
          omitidos.push(s.nombre)
          filas.push(`  ${s.nombre.padEnd(40)} ${ESTADOS[est].label.padEnd(12)} (confidencial: no se incluye)`)
          continue
        }
        const real = v.archivo?.clave ? await leerArchivo(v.archivo.clave) : null
        const ext = real ? (v.archivo.nombre.split('.').pop() || v.archivo.formato) : 'txt'
        const nombre = `${raiz}/${nombreSeguro(t.nombre)}/${nombreSeguro(s.nombre)}${docs.length > 1 ? ` ${d.id}` : ''}.${ext}`
        entradas.push({
          nombre,
          datos: real || `Muestra de la demo: este documento no tiene archivo real.\n\n${s.nombre} de ${persona.name}\nArchivo: ${v.archivo.nombre}\nVersión ${v.v} · cargada el ${fechaNum(v.fecha)} por ${v.subidoPor}\nEstado: ${ESTADOS[est].label}${v.vencimiento ? `\nVence: ${fechaNum(v.vencimiento)}` : ''}`,
        })
        filas.push(`  ${s.nombre.padEnd(40)} ${ESTADOS[est].label.padEnd(12)} ${v.vencimiento ? `vence ${fechaNum(v.vencimiento)}` : ''}`)
      }
    }
    if (filas.length) indice.push(`— ${t.nombre.toUpperCase()}`, ...filas, '')
  }

  const susEmitidos = emitidos.filter(e => e.colaboradorId === persona.id)
  if (susEmitidos.length) {
    indice.push('— DOCUMENTOS EMITIDOS')
    for (const e of susEmitidos) {
      const m = modelos.find(x => x.id === e.modeloId)
      indice.push(`  ${e.numero.padEnd(18)} ${(m?.nombre || '').padEnd(40)} ${fechaNum(e.fecha)}  ${e.estado}`)
      if (m?.sensible && !confidenciales) { omitidos.push(e.numero); continue }
      const v = m?.versiones.find(x => x.v === e.versionPlantilla)
      const texto = e.texto || rellenar(v?.texto || '', { ...e.datos, 'documento.numero': e.numero })
      entradas.push({ nombre: `${raiz}/Emitidos/${nombreSeguro(e.numero)}.txt`, datos: texto })
    }
    indice.push('')
  }

  const susContratos = contratos.filter(c => c.colaboradorId === persona.id)
  if (susContratos.length) {
    indice.push('— CONTRATOS Y ADENDAS')
    for (const c of susContratos) {
      indice.push(`  ${c.numero.padEnd(18)} ${(c.tipo === 'adenda' ? 'Adenda' : MODALIDADES[c.modalidad]).padEnd(22)} ${fechaNum(c.inicio)} a ${c.fin ? fechaNum(c.fin) : 'sin fecha de fin'}`)
      const ult = c.versiones[c.versiones.length - 1]
      entradas.push({ nombre: `${raiz}/Contratos/${nombreSeguro(c.numero)}.txt`, datos: `${c.tipo === 'adenda' ? 'Adenda' : 'Contrato'} ${c.numero}\n${MODALIDADES[c.modalidad]} · desde ${fechaNum(c.inicio)}${c.fin ? ` hasta ${fechaNum(c.fin)}` : ''}\nÚltima versión: v${ult?.v} (${ult?.tipo}) · ${ult?.archivo}` })
    }
    indice.push('')
  }

  if (omitidos.length) indice.push(`No se incluyeron ${omitidos.length} documentos confidenciales: ${omitidos.join(', ')}.`)
  entradas.unshift({ nombre: `${raiz}/00 Índice.txt`, datos: indice.join('\n') })
  return { entradas, archivos: entradas.length - 1, omitidos: omitidos.length }
}

/* Uno o varios expedientes en el mismo ZIP. Devuelve el archivo y cuántos documentos lleva. */
export async function zipDeExpedientes(personas, ctx, opciones) {
  const todas = []
  let archivos = 0, omitidos = 0
  for (const p of personas) {
    const r = await entradasDe(p, ctx, opciones)
    todas.push(...r.entradas)
    archivos += r.archivos
    omitidos += r.omitidos
  }
  return { blob: await crearZip(todas), archivos, omitidos }
}
