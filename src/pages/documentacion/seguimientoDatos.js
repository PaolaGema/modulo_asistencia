import { checklistDe, estadoVersion, versionActual, diasHasta, estadoContrato, finEfectivo, completitud, hitosDe } from '../../data/documentacionData'

/* ── LO QUE COMPARTEN LA BANDEJA, EL PANEL Y LOS REPORTES ───────────────────
   Las tres pantallas cuentan lo mismo —qué está vencido, qué falta, qué espera revisión— y si
   cada una lo contara a su manera, el «12 vencidos» del panel no coincidiría con la pestaña de
   la bandeja a la que lleva. Se calcula una vez, acá. */

/* Solo la gente con vínculo vigente. Un expediente cerrado no se persigue (RF-24, 7.9 paso 4):
   sus pendientes quedan registrados como no cumplidos al cierre, no en la bandeja de nadie. */
export const activos = personas => personas.filter(p => p.status !== 'desvinculado')

const exonerado = (exos, d) => exos.some(e => e.colaboradorId === d.colaboradorId && e.subtipoId === d.subtipoId)

/* LAS CUATRO PILAS (RF-39), más la de contratos (RF-40).
   VENCIDOS Y POR VENCER SALEN DE LOS DOCUMENTOS, NO DE LOS REQUISITOS: un curso con vencimiento
   que nadie exige igual vence, y quien tiene que renovarlo quiere enterarse.
   FALTANTES SÓLO LOS EXIGIBLES (RN-07): alguien que entró ayer y tiene treinta días para traer su
   certificado de nacimiento no está en falta. Un rechazado sí va, venza o no su plazo: ya hubo un intento
   y hay que volver a pedirlo. */
export function pilas(estado, personas) {
  const { documentos, subtipos, parametros, exoneraciones, contratos } = estado
  const porId = new Map(personas.map(p => [p.id, p]))
  const vencidos = [], porVencer = [], revision = [], faltantes = []

  for (const d of documentos) {
    if (d.eliminado || exonerado(exoneraciones, d)) continue
    const persona = porId.get(d.colaboradorId)
    const subtipo = subtipos.find(s => s.id === d.subtipoId)
    if (!persona || !subtipo) continue
    const version = versionActual(d)
    const est = estadoVersion(version, subtipo, parametros)
    const base = { clave: d.id, persona, subtipo, documento: d, version, estado: est }
    if (est === 'vencido') vencidos.push({ ...base, dias: -diasHasta(version.vencimiento) })
    else if (est === 'por_vencer') porVencer.push({ ...base, dias: diasHasta(version.vencimiento) })
    else if (est === 'en_revision') revision.push({ ...base, dias: Math.max(0, -diasHasta(version.fecha)) })
  }

  for (const p of personas) {
    for (const i of checklistDe(p, estado)) {
      if (!i.requisito.obligatorio) continue
      if (i.estado === 'rechazado' || (i.estado === 'faltante' && i.exigible)) {
        faltantes.push({
          clave: `${p.id}-${i.subtipo.id}`, persona: p, subtipo: i.subtipo, documento: i.documento,
          version: versionActual(i.documento), estado: i.estado, limite: i.limite,
          dias: i.limite ? Math.max(0, -diasHasta(i.limite)) : 0,
        })
      }
    }
  }

  /* UN CONTRATO POR PERSONA: el último de su cadena. Una adenda amplía el plazo del contrato
     origen, así que avisar por los dos sería avisar dos veces del mismo vencimiento. */
  const ultimo = new Map()
  for (const c of contratos) {
    if (c.finalizado || c.reemplazado || !porId.has(c.colaboradorId)) continue
    const ya = ultimo.get(c.colaboradorId)
    if (!ya || (c.inicio || '') > (ya.inicio || '')) ultimo.set(c.colaboradorId, c)
  }
  const contratosPorVencer = [...ultimo.values()]
    .map(c => ({ clave: c.id, persona: porId.get(c.colaboradorId), contrato: c, estado: estadoContrato(c, parametros, contratos), dias: diasHasta(finEfectivo(c, contratos)) }))
    .filter(x => x.estado === 'por_vencer' || x.estado === 'vencido')

  /* ORDEN POR URGENCIA: lo que más tiempo lleva vencido arriba; lo que vence antes, arriba; el
     faltante con el plazo más atrasado, arriba; la revisión que más espera, arriba. */
  vencidos.sort((a, b) => b.dias - a.dias)
  porVencer.sort((a, b) => a.dias - b.dias)
  faltantes.sort((a, b) => b.dias - a.dias)
  revision.sort((a, b) => b.dias - a.dias)
  contratosPorVencer.sort((a, b) => (a.dias ?? 0) - (b.dias ?? 0))
  return { vencidos, por_vencer: porVencer, faltantes, revision, contratos: contratosPorVencer }
}

/* El próximo vencimiento fuera de la ventana de aviso, para el estado vacío (11.3): «no hay
   nada por vencer» sin decir cuándo es lo siguiente deja la pregunta abierta. */
export function proximoVencimiento(estado, personas) {
  const ids = new Set(personas.map(p => p.id))
  let min = null
  for (const d of estado.documentos) {
    if (d.eliminado || !ids.has(d.colaboradorId)) continue
    const v = versionActual(d)
    if (!v?.vencimiento || v.revision !== 'aprobado' || diasHasta(v.vencimiento) < 0) continue
    if (!min || v.vencimiento < min) min = v.vencimiento
  }
  return min
}

/* La ventana más larga configurada: es la que da sentido a «en los próximos N días». */
export const ventanaMaxima = estado => Math.max(...estado.subtipos.map(s => Math.max(...hitosDe(s, estado.parametros))))

/* Completitud agregada: se suman cumplidos y exigibles de cada persona, no se promedian
   porcentajes. Promediar haría pesar igual a quien debe un documento de cinco que a quien debe
   uno de uno. */
export function agregado(personas, estado) {
  let cumplidos = 0, total = 0, alDia = 0, conReq = 0
  const detalle = []
  for (const p of personas) {
    const cl = checklistDe(p, estado)
    const c = completitud(cl)
    cumplidos += c.cumplidos; total += c.total
    if (c.pct !== null) { conReq += 1; if (c.pct === 100) alDia += 1 }
    detalle.push({ persona: p, checklist: cl, ...c })
  }
  return { pct: total ? Math.round((cumplidos / total) * 100) : null, cumplidos, total, alDia, conReq, detalle }
}

/* SEMÁFORO CON PALABRA (RNF-21): el tono va acompañado de su nombre. */
export const nivelDe = pct => (pct === null ? { tono: 'gris', label: 'Sin requisitos' }
  : pct >= 90 ? { tono: 'verde', label: 'Al día' }
    : pct >= 60 ? { tono: 'ambar', label: 'Con atención' }
      : { tono: 'rojo', label: 'Crítico' })

export const textoDias = (estado, dias) => {
  if (estado === 'vencido') return dias === 0 ? 'Venció hoy' : `Venció hace ${dias} ${dias === 1 ? 'día' : 'días'}`
  if (estado === 'por_vencer') return dias === 0 ? 'Vence hoy' : `Vence en ${dias} ${dias === 1 ? 'día' : 'días'}`
  return ''
}
