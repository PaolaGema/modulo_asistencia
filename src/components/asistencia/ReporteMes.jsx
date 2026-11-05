import { useMemo } from 'react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import ReportePDF from './ReportePDF'
import { cifrasDelMes } from '../../utils/cifrasMes'
import { MODALIDADES, diasDelMes, duracion, hhmm, fechaLarga, minutosAhora } from '../../data/asistenciaData'

/* EL REPORTE DEL MES EN PDF, PARA UNA PERSONA. Lo bajan RR.HH. desde la ficha del colaborador y la propia
   persona desde Mi asistencia (5 nov 2026: «debería poder imprimir mi reporte del mes, así como el que le
   sale a RR.HH.»). Es el mismo documento con las mismas cifras: lo que firma RR.HH. y lo que guarda la
   persona no pueden decir cosas distintas.
   Se monta para armar el PDF y avisa con `onListo(error)` al terminar. */

export default function ReporteMes({ p, mes, conMarcas = false, onListo }) {
  const at = useAsistencia()
  const { empresa } = useOnboardingData()
  const dias = useMemo(() => diasDelMes(mes).map(d => ({ d, j: d <= at.hoy ? at.jornadaDe(p, d) : null })), [p, mes, at])
  const c = cifrasDelMes(dias, at.hoy)
  return (
    <ReportePDF p={p} mes={mes} dias={dias} conMarcas={conMarcas} empresa={empresa}
      lugar={p.lugar ? `${p.lugar.nombre}${p.lugar.tipo === 'centro' ? ` · ${at.lugarPorId.get(p.lugar.sucursalId)?.nombre || ''}` : ''}${p.asig ? ` · ${MODALIDADES[p.asig.modalidad].label}` : ''}` : ''}
      generado={`${fechaLarga(at.hoy).toLowerCase()}, ${hhmm(minutosAhora())}`}
      cifras={[
        { t: 'Días trabajados', v: c.conJornada ? `${c.trabajados} de ${c.conJornada}` : '—' },
        { t: 'Retrasos', v: c.tardes.length || '—', s: c.tardes.length ? (c.tardes.length === 1 ? 'vez' : 'veces') : '', tono: c.tardes.length ? 'tarde' : '' },
        { t: 'Tiempo de retraso', v: c.tardes.length ? duracion(c.tardanza) : '—', s: c.tardes.length ? (c.tardanzaInj <= 0 ? 'justificado' : c.tardanzaInj >= c.tardanza ? 'sin justificar' : `${duracion(c.tardanza - c.tardanzaInj)} justificados`) : '', tono: c.tardes.length ? 'tarde' : '' },
        { t: 'Faltas', v: c.faltas || (c.justificadas ? 0 : '—'), s: c.justificadas ? `+ ${c.justificadas} con permiso` : c.faltas ? 'sin justificar' : '', tono: c.faltas ? 'falta' : '' },
        { t: 'Horas del mes', v: c.programado ? duracion(c.trabajado, { corto: true }) : '—', s: c.programado ? `de ${duracion(c.programado, { corto: true })} · ${c.saldo >= 0 ? 'completas' : `faltan ${duracion(-c.saldo, { corto: true })}`}` : '' },
        { t: 'Puntualidad', v: c.puntualidad == null ? '—' : `${c.puntualidad} %`, s: `tolerancia de ${p.politica?.tolerancia ?? 10} min`, tono: c.puntualidad != null && c.puntualidad >= 90 ? 'bien' : c.puntualidad != null ? 'tarde' : '' },
      ]}
      pie={<><b>Horas extra:</b> {duracion(c.extraTrabajada)} de {duracion(c.extraAutorizada)} autorizadas · <b>Fuera de horario, sin autorización:</b> {duracion(c.fueraHorario)}</>}
      onListo={onListo} />
  )
}
