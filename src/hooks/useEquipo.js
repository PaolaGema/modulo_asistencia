import { useAsistencia } from '../context/AsistenciaContext'
import { useUser } from '../context/UserContext'

/* Su equipo: quienes trabajan en su área, si es líder de área (en la demo, Ana Martínez Ruiz con Marketing).
   Lo usan «Pedir horas extra para mi equipo» (el «+» de Mi asistencia) y «¿Qué necesita?» de Mis solicitudes. */
export function useEquipo() {
  const at = useAsistencia()
  const { currentUser } = useUser()
  if (currentUser?.role !== 'manager' || !currentUser.area) return []
  return at.personas.filter(p => p.unidad === currentUser.area && String(p.id) !== String(at.yo?.id) && p.asig && p.horario)
}
