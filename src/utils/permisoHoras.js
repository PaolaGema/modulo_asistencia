import { hhmm } from '../data/asistenciaData'

/* «LO QUE LA APP YA SABE» (aprobada el 5 nov 2026): con un permiso por horas aprobado para hoy, la línea de
   estado del Inicio y de Mi asistencia lo dice en verde, para que la persona sepa a qué hora se la espera y
   no piense que llega tarde. `h` es el horario de hoy ya corrido por el permiso (`at.horarioDe`). */
export function textoPermiso(h, j) {
  const p = h?.permisoHoras
  if (!p) return null
  if (p.inicio && j.entrada == null) {
    const hasta = p.inicio.hasta
    return { titulo: hasta <= 13 * 60 ? 'Su permiso cubre la mañana' : `Su permiso cubre hasta las ${hhmm(hasta)}`, sub: `${p.inicio.label} · su entrada de hoy es a las ${h.entrada}` }
  }
  if (p.fin && j.entrada != null && j.salida == null) {
    return { titulo: `Su permiso empieza a las ${hhmm(p.fin.desde)}`, sub: `${p.fin.label} · su salida de hoy es a las ${h.salida}` }
  }
  return null
}
