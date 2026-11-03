import { Award, Gift, Baby, BookOpen, FileText, Heart, HeartHandshake, Stethoscope, Users } from 'lucide-react'
import { SUBTIPOS_PERMISO, diasHabiles, habilSiguiente, aFecha } from '../data/asistenciaData'

/* La papeleta de un permiso o una licencia: lo que la app sabe de cada tipo y cómo se vuelve a armar
   la hoja de una solicitud ya guardada (para «Revisar» en Asistencia › Solicitudes). */

/* Lo que la app sabe de cada tipo: su ícono, una línea, los días que da la ley (`habiles` cuenta solo
   días de trabajo; si no, corridos) y el papel que lo respalda. Sin `dias`, el rango lo elige la persona. */
export const INFO = {
  medico: { Icono: Stethoscope, linea: 'Unas horas, el día o varios días' },
  tramite: { Icono: FileText, linea: 'Banco, notaría, carnet…' },
  familiar: { Icono: Users, linea: 'Reunión del colegio, un familiar…' },
  estudio: { Icono: BookOpen, linea: 'Clases o un examen' },
  /* El reposo médico corre en días corridos, fines de semana y feriados incluidos. */
  'lic-medica': { Icono: Heart, linea: 'Los días que indique el médico', corridos: true, respaldo: 'Certificado médico' },
  maternidad: { Icono: Baby, linea: '90 días corridos', dias: 90, respaldo: 'Certificado médico prenatal' },
  paternidad: { Icono: Baby, linea: '3 días hábiles', dias: 3, habiles: true, respaldo: 'Certificado de nacimiento' },
  duelo: { Icono: HeartHandshake, linea: '3 días hábiles', dias: 3, habiles: true, respaldo: 'Certificado de defunción' },
  matrimonio: { Icono: Award, linea: '3 días hábiles', dias: 3, habiles: true, respaldo: 'Certificado de matrimonio' },
  cumpleanos: { Icono: Gift, linea: 'Un día libre en su mes de cumpleaños' },
}

/* La hoja de una solicitud ya guardada, para que RR.HH. vea en Solicitudes el mismo papel que firmó la persona. */
export function armarHojaPermiso(s, { persona, empresa, lugarPorId, numero }) {
  const sub = SUBTIPOS_PERMISO.find(x => x.key === s.subtipo) || SUBTIPOS_PERMISO[0]
  const info = INFO[sub.key] || {}
  const licencia = !!sub.licencia
  const corridos = licencia && !info.habiles && (info.dias || info.corridos)
  const n = corridos ? Math.round((aFecha(s.hasta) - aFecha(s.desde)) / 864e5) + 1 : diasHabiles(s.desde, s.hasta, persona.horario)
  return {
    numero: s.papeleta || numero, yo: persona, empresa, sucursal: lugarPorId.get(persona.sucursalId)?.nombre || persona.sedeNombre,
    sub, licencia, desde: s.desde, fin: s.hasta, n, regreso: licencia ? habilSiguiente(s.hasta, persona.horario) : null,
    porHoras: !!s.horaDesde, corridos, horaDesde: s.horaDesde, horaHasta: s.horaHasta, respaldo: s.respaldo || null, info,
    motivo: s.motivo && s.motivo !== sub.label ? s.motivo : '',
  }
}
export const numeroPermiso = at => `${at.hoy.slice(0, 4)}-${String(at.solicitudes.filter(s => s.tipo === 'permiso').length + 1).padStart(4, '0')}`

