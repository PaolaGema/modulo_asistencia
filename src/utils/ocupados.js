import { sumarDias, diasDeSolicitud } from '../data/asistenciaData'

/* LO QUE LA PERSONA YA TIENE PEDIDO O APROBADO (vacación, permiso, trabajo remoto), día por día. Lo usan los
   tres calendarios de pedir —vacación, permiso y trabajo remoto— para pintar esos días con el color de su
   estado (ámbar por aprobar, verde aprobado, como las etiquetas de Mis solicitudes), no dejar tocarlos y
   mostrar debajo las fichas «Ya tiene pedido» (opción A de «Lo que ya pidió», 5 nov 2026). */
export const QUE_ES = { vacaciones: ['Vacación', 'a'], permiso: ['Permiso', 'o'], remoto: ['Trabajo remoto', 'o'] }
export const TONO_OCUPADO = { pendiente: ['var(--tn-ambar)', 'var(--tx-ambar)'], aprobada: ['var(--tn-verde)', 'var(--tx-verde)'] }
export const nombreOcupado = s => { const [que, g] = QUE_ES[s.tipo]; return `${que} ${s.estado === 'aprobada' ? `aprobad${g}` : 'por aprobar'}` }

export function ocupadosDe(solicitudes, pid) {
  const lista = (solicitudes || []).filter(s => QUE_ES[s.tipo] && ['pendiente', 'aprobada'].includes(s.estado) && String(s.personaId) === String(pid))
  const dias = new Map()
  lista.forEach(s => diasDeSolicitud(s).forEach(d => { if (!dias.has(d)) dias.set(d, s) }))
  // El primero que ya tiene entre dos días (cuando el rango elegido pasa por encima de algo pedido).
  const entre = (a, b) => { for (let d = a; a && d <= b; d = sumarDias(d, 1)) if (dias.has(d)) return dias.get(d); return null }
  return { lista, dias, entre }
}
