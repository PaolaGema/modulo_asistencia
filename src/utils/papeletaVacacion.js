import { habilesDeSolicitud, habilSiguiente, saldoVacaciones } from '../data/asistenciaData'

/* LA PAPELETA DE UNA SOLICITUD YA GUARDADA (para «Ver papeleta» en Mis solicitudes): los mismos datos
   que al pedirla. El saldo es el que tenía al pedirla; las solicitudes de antes de guardarlo lo
   calculan sin contarse a sí mismas. */
export function armarPapeleta(s, { yo, empresa, solicitudes, lugarPorId, hoy }) {
  const h = yo.horario
  const n = habilesDeSolicitud(s, h)
  const saldo = s.saldoAntes ?? saldoVacaciones(yo, solicitudes.filter(x => x.id !== s.id), hoy).disponible
  return {
    numero: s.papeleta || '—', empresa: empresa?.razonSocial || empresa?.nombre || 'FarmaVida S.A.', nit: empresa?.nit,
    persona: yo, desde: s.desde, hasta: s.hasta, dias: s.dias || null, regreso: habilSiguiente(s.hasta, h), n, saldo,
    motivo: s.motivo && s.motivo !== 'Vacaciones' ? s.motivo : '', horario: h, solicitada: s.solicitada || null,
    sucursal: lugarPorId.get(yo.sucursalId)?.nombre || yo.sedeNombre, centro: yo.lugar?.tipo === 'centro' ? yo.lugar.nombre : null,
  }
}
