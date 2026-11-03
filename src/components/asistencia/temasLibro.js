import { ALERTAS, hhmm, descargarCSV } from '../../data/asistenciaData'

/* ── LOS TEMAS DEL LIBRO, COMO FILTRO ──────────────────────────────────────
   Faltas, Retrasos y descansos, Salidas sin marcar, Marcaciones rechazadas y Fuera de horario ya no son
   páginas aparte (con su submenú): son un filtro del Libro en la Semana y el Mes (Ronda 15 · T2). Con un
   tema elegido, la grilla apaga lo demás y una lista muestra cada caso con su motivo. */

export const TEMAS = {
  faltas: { titulo: 'Faltas', sub: 'Quién tenía jornada y no marcó en todo el día. Las que tienen vacación, permiso o licencia aprobados se ven como justificadas.', nombre: 'faltas', uno: 'falta', situacion: true, punto: '#E5484D' },
  retrasos: { titulo: 'Retrasos y descansos', sub: 'Llegadas tarde, descansos fuera de su franja o excedidos, descansos sin marcar y salidas anticipadas. Lo justificado deja de contar en contra.', nombre: 'días', uno: 'día', situacion: true, punto: '#F5B04F' },
  salidas: { titulo: 'Salidas sin marcar', sub: 'Marcaron la entrada y nunca la salida. Sin salida no se pueden contar las horas del día: se completa desde el detalle, con el motivo.', nombre: 'jornadas', uno: 'jornada', punto: '#B79CF0' },
  rechazos: { titulo: 'Marcaciones rechazadas', sub: 'El rostro no coincidió o estaban lejos de su lugar. La selfie y la distancia están en el detalle: puede ser la luz de la entrada o un intento indebido.', nombre: 'marcaciones', uno: 'marcación', punto: '#94A3B8' },
  fuera: { titulo: 'Fuera de horario', sub: 'Se quedaron 30 minutos o más después de su jornada sin horas extra autorizadas. No cuenta como hora extra, salvo que se autorice desde el detalle.', nombre: 'días', uno: 'día', punto: '#7C8CF0' },
}
export const SITUACIONES = [{ valor: '', etiqueta: 'Sin justificar' }, { valor: 'con', etiqueta: 'Justificadas' }, { valor: 'todas', etiqueta: 'Todas' }]

/* Los hechos de cada tema en unas fechas, para unas personas: una sola pasada para los cinco, así el
   desplegable cuenta cada uno sin recorrer cinco veces el mes. Hoy entra solo en lo que ya se sabe
   —un retraso, una marca rechazada—: una falta o una salida sin marcar recién se sabe mañana. */
export function hechosPorTema(at, fechas, personas) {
  const out = Object.fromEntries(Object.keys(TEMAS).map(k => [k, []]))
  for (const fecha of fechas) {
    if (fecha > at.hoy) break
    const hoy = fecha === at.hoy
    for (const p of personas) {
      if (!p.asig) continue
      const j = at.jornadaDe(p, fecha)
      const k = `${p.id}|${fecha}`
      if (!hoy && (j.estado === 'ausente' || j.estado === 'justificada')) out.faltas.push({ id: k, persona: p, fecha, jornada: j, justificada: j.estado === 'justificada' })
      if (!hoy && j.estado === 'incompleta') out.salidas.push({ id: k, persona: p, fecha, jornada: j })
      if (j.fueraDeHorario >= 30 && (!hoy || j.salida != null)) out.fuera.push({ id: k, persona: p, fecha, jornada: j })
      for (const r of j.rechazadas) out.rechazos.push({ id: r.id, persona: p, fecha, jornada: j, marca: r })
      if (j.alertas.length) {
        const pedido = (at.solicitudes || []).find(s => s.tipo === 'justificacion' && s.fecha === fecha && String(s.personaId) === String(p.id) && s.estado !== 'cancelada')
        const grupo = x => (x.startsWith('pausa') ? 'pausa' : x)
        const avisada = j.alertas.some(a => at.ajustesGenerales.avisar?.[grupo(a.tipo)] !== false)
        out.retrasos.push({ id: k, persona: p, fecha, jornada: j, alertas: j.alertas, pedido, avisada, justificada: j.alertas.every(a => a.justificacion) })
      }
    }
  }
  for (const k of Object.keys(out)) out[k].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
  return out
}

/* Lo justificado o no, según el filtro de situación. */
export const segunSituacion = (tema, lista, situacion) => (!TEMAS[tema]?.situacion || situacion === 'todas' ? lista : lista.filter(i => (situacion === 'con' ? i.justificada : !i.justificada)))

export function exportarTema(tema, periodo, lista) {
  const cab = { faltas: ['Situación'], retrasos: ['Qué pasó', 'Justificado'], salidas: ['Entró', 'Debía salir'], rechazos: ['Hora', 'Por qué', 'Distancia (m)', 'Similitud del rostro'], fuera: ['Debía salir', 'Salió', 'Tiempo de más (min)'] }[tema]
  const fila = i => {
    const j = i.jornada; const h = i.persona.horario
    if (tema === 'faltas') return [i.justificada ? `Justificada · ${j.justificacion?.tipo || ''}` : 'Sin justificar']
    if (tema === 'retrasos') return [i.alertas.map(a => `${ALERTAS[a.tipo].label} ${Math.round(a.min)} min`).join(' · '), i.justificada ? 'Sí' : 'No']
    if (tema === 'salidas') return [hhmm(j.entrada), h?.salida || '']
    if (tema === 'rechazos') return [hhmm(i.marca.min), i.marca.rechazada === 'rostro' ? 'Rostro' : 'Fuera de su lugar', i.marca.distancia ?? '', i.marca.score != null ? `${Math.round(i.marca.score * 100)} %` : '']
    return [h?.salida || '', hhmm(j.salida), Math.round(j.fueraDeHorario)]
  }
  descargarCSV(`${tema}_${periodo}.csv`, [['Fecha', 'Colaborador', 'Código', 'Unidad organizacional', 'Lugar', ...cab], ...lista.map(i => [i.fecha, i.persona.name, i.persona.codigo, i.persona.unidad, i.persona.lugar?.nombre || '', ...fila(i)])])
}
