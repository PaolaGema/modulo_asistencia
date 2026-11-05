import { hhmm } from '../data/asistenciaData'

/* «LO QUE LA APP YA SABE» (aprobada el 5 nov 2026): la línea verde de estado del Inicio y de Mi asistencia
   cuando hoy la app ya sabe algo que cambia su jornada, para que la persona sepa a qué hora se la espera y
   no piense que llega tarde o que falta:
   · un permiso por horas aprobado (en la mañana corre la entrada, en la tarde adelanta la salida);
   · un día libre de la empresa (Configuración › Días libres): el día entero o la tarde de su cumpleaños.
   `h` es el horario de hoy ya corrido (`at.horarioDe`) y `j` su jornada. */
export function textoPermiso(h, j) {
  const libre = j?.justificacion?.diaLibre ? j.justificacion : null
  if (libre) return libre.tipo === 'Cumpleaños'
    ? { titulo: '¡Feliz cumpleaños!', sub: 'Hoy es su día libre: no necesita marcar' }
    : { titulo: `${libre.tipo}: día libre`, sub: 'Hoy no necesita marcar' }
  const p = h?.permisoHoras
  if (!p) return null
  if (p.inicio && j.entrada == null) {
    const hasta = p.inicio.hasta
    return { titulo: hasta <= 13 * 60 ? 'Su permiso cubre la mañana' : `Su permiso cubre hasta las ${hhmm(hasta)}`, sub: `${p.inicio.label} · su entrada de hoy es a las ${h.entrada}` }
  }
  if (p.fin?.diaLibre && j.salida == null) {
    return p.fin.label === 'Cumpleaños'
      ? { titulo: '¡Feliz cumpleaños!', sub: `Trabaja hasta las ${h.salida}; la tarde es suya` }
      : { titulo: `${p.fin.label}: tarde libre`, sub: `Trabaja hasta las ${h.salida}; la tarde es suya` }
  }
  if (p.fin && j.entrada != null && j.salida == null) {
    return { titulo: `Su permiso empieza a las ${hhmm(p.fin.desde)}`, sub: `${p.fin.label} · su salida de hoy es a las ${h.salida}` }
  }
  return null
}
