import { ESTADOS, duracion, hhmm, franjaPausa } from '../../data/asistenciaData'

/* ── EL ESTADO, EN UNA PÍLDORA Y UNA LÍNEA (S2) ──
   El color avisa y la línea explica: desde cuándo trabaja, cuánto llegó tarde, cuándo vuelve del
   descanso, a qué hora debía entrar. Las palabras dicen lo que pasa, no cómo lo guarda el sistema:
   «No ha llegado» y no «Sin marcar»; lo justificado dice su motivo —«De vacaciones»—. */
export function motivoJustificado(j) {
  const t = `${j.justificacion?.tipo || ''}`.toLowerCase()
  if (t.includes('vacac')) return 'De vacaciones'
  if (t.includes('licencia')) return 'Con licencia'
  return 'Con permiso'
}
export function estadoDelDia(p, j, ahora) {
  const h = p.horario
  const fijo = h?.modo === 'fijo'
  const tarde = j.tardanza > 0 ? `${duracion(j.tardanza)} tarde` : ''
  /* Hoy, quien ya salió terminó su jornada aunque haya llegado tarde: el atraso ya va en la entrada. */
  if (ahora != null && j.salida != null && ['tarde', 'anticipada', 'extra'].includes(j.estado)) return { tono: 'gris', label: 'Terminó su jornada', linea: `salió ${hhmm(j.salida)}${j.anticipada > 0 ? ` · ${duracion(j.anticipada)} antes` : ''}` }
  switch (j.estado) {
    case 'trabajando': return { tono: 'verde', label: 'Trabajando', linea: `desde ${hhmm(j.entrada)}` }  // El atraso ya va en ámbar en la entrada.
    case 'pausa': {
      const fr = fijo ? franjaPausa(h) : null
      if (fr && ahora != null && ahora > fr.hasta) return { tono: 'ambar', label: 'En descanso', linea: `se pasó ${duracion(ahora - fr.hasta)}` }
      return { tono: 'azul', label: 'En descanso', linea: fr ? `vuelve ${hhmm(fr.hasta)}` : '' }
    }
    case 'termino': return { tono: 'gris', label: 'Terminó su jornada', linea: `salió ${hhmm(j.salida)}${j.anticipada > 0 ? ` · ${duracion(j.anticipada)} antes` : ''}` }
    case 'presente': return { tono: 'verde', label: 'Terminó su jornada', linea: `de ${hhmm(j.entrada)} a ${hhmm(j.salida)}` }
    case 'tarde': return { tono: 'ambar', label: 'Llegó tarde', linea: tarde }
    case 'anticipada': return { tono: 'ambar', label: 'Salió antes', linea: `${duracion(j.anticipada)} antes de su hora` }
    case 'extra': return { tono: 'azul', label: 'Horas extra', linea: `+${duracion(j.extra)} autorizadas` }
    case 'incompleta': return { tono: 'violeta', label: 'Salida sin marcar', linea: `entró ${hhmm(j.entrada)} · falta completarla` }
    case 'sinMarcar': return { tono: 'rojo', label: 'No ha llegado', linea: fijo ? `debía entrar ${h.entrada}` : 'todavía no marca' }
    case 'ausente': return { tono: 'rojo', label: 'Faltó', linea: 'no marcó en todo el día' }
    case 'porLlegar': return { tono: 'gris', label: 'Aún no le toca', linea: fijo ? `entra a las ${h.entrada}` : '' }
    case 'justificada': {
      const m = motivoJustificado(j)
      const tipo = j.justificacion?.tipo || ''
      return { tono: 'gris', label: m, linea: tipo && !tipo.toLowerCase().startsWith('vacac') ? tipo : '' }
    }
    default: return { tono: 'gris', label: ESTADOS[j.estado]?.label || '—', linea: '' }
  }
}
