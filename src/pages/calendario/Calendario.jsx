import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, Flag, Palmtree, Clock, House } from 'lucide-react'
import {
  HOY, MESES, DIAS_SEMANA, buildCalendarCells, buildEventosDelMes, CALENDAR_LEGEND, avatarUrl,
} from '../../utils/calendarEvents'
import { colaboradores } from '../inicio/homeData'
import { useUser } from '../../context/UserContext'
import { useAsistencia } from '../../context/AsistenciaContext'
import { FERIADOS, SUBTIPOS_PERMISO, incluyeDia } from '../../data/asistenciaData'

/* DOS CALENDARIOS, UNA PANTALLA. En Inicio es el de TODA la empresa —cumpleaños, aniversarios,
   evaluaciones y publicaciones de la plantilla—, la agenda de quien administra. Con `mio` es el de
   la persona, en Mi espacio: sus vacaciones y permisos (aprobados o por aprobar), los feriados, los
   cumpleaños y aniversarios de su área y las evaluaciones que le tocan. Quien es de RR.HH. tiene
   los dos, cada uno en su puerta, sin botones según el rol. */
const LEYENDA_MIA = [
  { label: 'Mis vacaciones', color: '#00B876' },
  { label: 'Mis permisos', color: '#7C5AD6' },
  { label: 'Feriado', color: '#64748b' },
  { label: 'Cumpleaños de su área', color: '#ec4899' },
  { label: 'Aniversario', color: 'var(--green)' },
  { label: 'Evaluación', color: 'var(--yellow)' },
]
const ESTADO_MIO = { aprobada: 'Aprobada', pendiente: 'Por aprobar' }
const aISO = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

function eventosMios(year, month, { nombre, area, yoId, solicitudes }) {
  const base = buildEventosDelMes(year, month)
  const mios = {}
  const sumar = (d, e) => { (mios[d] = mios[d] || []).push(e) }
  const ultimo = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= ultimo; d++) {
    const dia = aISO(year, month, d)
    if (FERIADOS[dia]) sumar(d, { kind: 'feriado', titulo: FERIADOS[dia], subtitulo: 'No se trabaja', tipo: 'Feriado', color: '#64748b', Icon: Flag })
    solicitudes
      .filter(x => String(x.personaId) === String(yoId) && ESTADO_MIO[x.estado] && ['vacaciones', 'permiso', 'remoto'].includes(x.tipo) && incluyeDia(x, dia))
      .forEach(x => {
        const vac = x.tipo === 'vacaciones'
        const titulo = vac ? 'De vacaciones' : x.tipo === 'remoto' ? 'Trabajo remoto' : SUBTIPOS_PERMISO.find(p => p.key === x.subtipo)?.label || 'Permiso'
        sumar(d, { kind: 'mio', titulo, subtitulo: x.horaDesde ? `${x.horaDesde} – ${x.horaHasta}` : (x.motivo && x.motivo !== 'Vacaciones' ? x.motivo : 'Todo el día'), tipo: ESTADO_MIO[x.estado], color: vac ? '#00B876' : '#7C5AD6', Icon: vac ? Palmtree : x.tipo === 'remoto' ? House : Clock })
      })
    for (const e of base[d] || []) {
      if (e.kind === 'persona' && !(e.titulo === nombre || e.subtitulo.startsWith(`${area} ·`))) continue
      if (e.kind === 'publicacion' || (e.kind === 'reconocimiento' && e.titulo !== nombre)) continue
      sumar(d, e)
    }
  }
  return mios
}

export default function Calendario({ mio = false }) {
  const { currentUser } = useUser()
  const at = useAsistencia()
  const area = colaboradores.find(c => c.nombre === currentUser.name)?.area || currentUser.area || at.yo?.unidad
  // El de la empresa es una agenda de demo fija; el propio va con el día de hoy de Asistencia.
  const hoy = mio ? new Date(`${at.hoy}T00:00`) : HOY
  const [searchParams] = useSearchParams()
  const mesOffset = Number(searchParams.get('mes')) || 0
  const diaInicial = Number(searchParams.get('dia')) || null

  const [viewDate, setViewDate] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth() + mesOffset, 1))
  const [selectedDay, setSelectedDay] = useState(diaInicial)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const isCurrentMonth = year === hoy.getFullYear() && month === hoy.getMonth()
  const activeDay = selectedDay ?? (isCurrentMonth ? hoy.getDate() : 1)
  const isTodaySelected = isCurrentMonth && activeDay === hoy.getDate()

  const calendarCells = buildCalendarCells(year, month)
  const eventosPorDia = mio
    ? eventosMios(year, month, { nombre: currentUser.name, area, yoId: at.yo?.id, solicitudes: at.solicitudes })
    : buildEventosDelMes(year, month)
  const eventosDelDia = eventosPorDia[activeDay] || []

  function goMonth(delta) {
    setViewDate(new Date(year, month + delta, 1))
    setSelectedDay(null)
  }

  return (
    <div className="content-scroll">
      <div className="two-col" style={{ alignItems: 'start' }}>

        {/* CALENDARIO */}
        <div className="sec-card">
          <div className="sc-hd">
            <CalendarDays size={15} style={{ color: 'var(--blue)' }} />
            <h3>{MESES[month]} {year}</h3>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => goMonth(-1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border-soft)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => goMonth(1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border-soft)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="sc-body" style={{ padding: '20px 26px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {DIAS_SEMANA.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '0 0 10px' }}>{d}</div>
              ))}
              {calendarCells.map((cell, i) => {
                const isToday = cell.inMonth && isCurrentMonth && cell.day === hoy.getDate()
                const isSelected = cell.inMonth && cell.day === activeDay
                const eventos = cell.inMonth ? eventosPorDia[cell.day] : null
                return (
                  <button
                    key={i}
                    onClick={() => cell.inMonth && setSelectedDay(cell.day)}
                    disabled={!cell.inMonth}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0',
                      background: 'none', border: 'none', fontFamily: 'inherit', cursor: cell.inMonth ? 'pointer' : 'default',
                    }}
                  >
                    <span style={{
                      width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: isSelected || isToday ? 700 : 500,
                      background: isSelected ? 'var(--navy)' : 'transparent',
                      border: !isSelected && isToday ? '1.5px solid var(--navy)' : 'none',
                      color: !cell.inMonth ? 'var(--border-dark)' : isSelected ? '#fff' : isToday ? 'var(--navy)' : 'var(--text-heading)',
                    }}>{cell.day}</span>
                    <span style={{ display: 'flex', gap: 2, height: 4 }}>
                      {eventos && eventos.slice(0, 4).map((e, j) => (
                        <span key={j} style={{ width: 4, height: 4, borderRadius: '50%', background: e.color }} />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-soft)', flexWrap: 'wrap' }}>
              {(mio ? LEYENDA_MIA : CALENDAR_LEGEND).map(l => (
                <span key={l.label} style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: l.color, display: 'inline-block' }} /> {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* DETALLE DEL DÍA */}
        <div className="sec-card">
          <div className="sc-hd">
            <h3>{activeDay} de {MESES[month]}{isTodaySelected ? ' · Hoy' : ''} <span className="sc-hd-count">{eventosDelDia.length}</span></h3>
          </div>
          <div className="sc-body" style={{ padding: '8px 22px 18px', maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
            {eventosDelDia.length > 0 ? eventosDelDia.map((e, i) => (
              <div key={i} className="upcoming-item">
                <div className="ui-date">
                  <div className="ui-day">{String(activeDay).padStart(2, '0')}</div>
                  <div className="ui-month">{MESES[month].slice(0, 3).toUpperCase()}</div>
                </div>
                <div className="ui-info">
                  <div className="ui-name">{e.titulo}</div>
                  <div className="ui-sub">{e.subtitulo}</div>
                  <div className="ui-sub">{e.tipo}</div>
                </div>
                {e.kind === 'persona' ? (
                  <div className="ui-av"><img src={avatarUrl(e.titulo)} alt={e.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={ev => { ev.currentTarget.style.display = 'none' }} /></div>
                ) : (
                  <div className="ui-av" style={{ background: `${e.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <e.Icon size={14} style={{ color: e.color }} />
                  </div>
                )}
              </div>
            )) : (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <CheckCircle2 size={24} style={{ color: 'var(--green)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin actividades este día</div>
              </div>
            )}
          </div>
        </div>

      </div>

      <div style={{ height: '8px' }} />

    </div>
  )
}
