/* LAS CIFRAS DE UN PERÍODO (un mes o una semana), EN UN SOLO LUGAR. Las usan el reporte del mes en PDF
   y el resumen del celular («Mi asistencia»): lo que firma RR.HH. y lo que ve la persona en su teléfono no
   pueden decir cosas distintas (5 nov 2026: el celular contaba las vacaciones como «días a tiempo» y las
   faltas en el total).
   `dias` es una lista de { d: 'AAAA-MM-DD', j: jornada o null }. Lo acumulado cuenta días cerrados: el de
   hoy suma cuando marca la salida. «Días a tiempo» son los días que vino (con entrada) y no llegó tarde,
   sobre los días que vino. Lo justificado no tiene horas programadas (no «faltan» horas a quien estuvo de
   vacaciones). */
export function cifrasDelMes(dias, hoy) {
  const pasados = dias.filter(x => x.j && x.j.estado !== 'libre')
  const cerrados = pasados.filter(x => x.d !== hoy || x.j.salida != null)
  const sum = (lista, k) => lista.reduce((s, x) => s + (x.j[k] || 0), 0)
  const tardes = cerrados.filter(x => x.j.llegoTarde)
  const conEntrada = pasados.filter(x => x.j.entrada != null)
  const aTiempo = conEntrada.filter(x => !x.j.llegoTarde).length
  const trabajado = sum(cerrados, 'trabajado')
  const programado = sum(cerrados, 'programado')
  return {
    pasados, cerrados, tardes, conEntrada, aTiempo, trabajado, programado,
    tardanza: sum(tardes, 'tardanza'), tardanzaInj: sum(tardes, 'tardanzaInjustificada'),
    extraTrabajada: sum(cerrados, 'extra'), extraAutorizada: sum(cerrados, 'autorizado'), fueraHorario: sum(cerrados, 'fueraDeHorario'),
    faltas: cerrados.filter(x => x.j.estado === 'ausente').length,
    justificadas: cerrados.filter(x => x.j.estado === 'justificada').length,
    trabajados: cerrados.filter(x => x.j.entrada != null).length,
    conJornada: cerrados.filter(x => x.j.programado > 0).length,
    puntualidad: conEntrada.length ? Math.round((aTiempo / conEntrada.length) * 100) : null,
    saldo: trabajado - programado,
  }
}
