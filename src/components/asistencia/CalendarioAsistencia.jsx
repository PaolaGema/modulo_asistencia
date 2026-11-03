import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, PartyPopper, Luggage, UserX, TrendingUp, Lock, Clock } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { MESES, DIAS_SEMANA, buildCalendarCells } from '../../utils/calendarEvents'
import { sumarDias, hoyISO, mesDe, esAutorizada } from '../../data/asistenciaData'

/* ── EL CALENDARIO DE ASISTENCIA ───────────────────────────────────────────
   El mismo dibujo que el calendario del dashboard de Inicio —la cuadrícula, los puntos de color, la
   leyenda y el detalle del día elegido— pero con lo que le importa a asistencia: los feriados, quién
   sale de vacaciones o con permiso, los días con faltas sin justificar o con horas extra por aprobar,
   y el cierre del mes para nómina.

   LOS FERIADOS SON LOS DE FECHA FIJA de Bolivia. Los que se mueven (Carnaval, Viernes Santo, Corpus
   Christi) los tendrá que cargar cada empresa cuando exista el catálogo de feriados. */

const FERIADOS = {
  '01-01': 'Año Nuevo', '01-22': 'Día del Estado Plurinacional', '05-01': 'Día del Trabajo',
  '06-21': 'Año Nuevo Andino', '08-06': 'Día de la Independencia', '11-02': 'Todos Santos', '12-25': 'Navidad',
}
const TIPOS = {
  feriado: { label: 'Feriado', color: 'var(--at-violeta)', Icon: PartyPopper },
  aviso: { label: 'Vacaciones y permisos', color: 'var(--at-azul)', Icon: Luggage },
  falta: { label: 'Faltas', color: 'var(--at-rojo)', Icon: UserX },
  extra: { label: 'Horas extra', color: 'var(--at-ambar)', Icon: TrendingUp },
  cierre: { label: 'Cierre', color: 'var(--navy)', Icon: Lock },
}
const MAX_LISTA = 5
const flecha = { width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border-soft)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }

export default function CalendarioAsistencia({ gente }) {
  const at = useAsistencia()
  const navigate = useNavigate()
  const hoy = hoyISO()
  const [desplazo, setDesplazo] = useState(0)
  const [elegido, setElegido] = useState(hoy)
  const base = new Date(Number(hoy.slice(0, 4)), Number(hoy.slice(5, 7)) - 1 + desplazo, 1)
  const anio = base.getFullYear(); const mes = base.getMonth()
  const iso = dia => `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  const ultimo = new Date(anio, mes + 1, 0).getDate()
  const { jornadaDe, justificacionDe, cierres, horasExtra, personaPorId } = at
  const ids = useMemo(() => new Set(gente.map(p => String(p.id))), [gente])

  /* Los eventos de cada día del mes, calculados una vez por mes y por recorte de la organización. */
  const eventos = useMemo(() => {
    const porDia = {}
    for (let dia = 1; dia <= ultimo; dia++) {
      const fecha = iso(dia)
      const lista = []
      const feriado = FERIADOS[fecha.slice(5)]
      if (feriado) lista.push({ tipo: 'feriado', titulo: feriado, sub: 'Feriado nacional: nadie debería figurar como falta' })

      const empiezan = gente.filter(p => { const j = justificacionDe(p.id, fecha); return j && !justificacionDe(p.id, sumarDias(fecha, -1)) })
      if (empiezan.length) {
        lista.push({
          tipo: 'aviso',
          titulo: empiezan.length === 1 ? `${empiezan[0].name} sale con ${justificacionDe(empiezan[0].id, fecha).tipo.toLowerCase()}` : `${empiezan.length} personas salen de vacaciones o con permiso`,
          sub: empiezan.length === 1 ? `${empiezan[0].unidad} · ${empiezan[0].lugar?.nombre || ''}` : empiezan.slice(0, 3).map(p => p.name.split(' ')[0]).join(', ') + (empiezan.length > 3 ? ' y más' : ''),
        })
      }

      if (fecha < hoy) {
        let faltas = 0
        for (const p of gente) if (jornadaDe(p, fecha).estado === 'ausente') faltas++
        if (faltas) lista.push({ tipo: 'falta', titulo: `${faltas} ${faltas === 1 ? 'falta' : 'faltas'} sin justificar`, sub: 'Tenían jornada y no marcaron', ir: `/asistencia/registro?fecha=${fecha}` })
      }

      /* Horas extra del día: las autorizadas (programadas o ya trabajadas) y las que esperan respuesta. */
      const delDia = horasExtra.filter(x => x.fecha === fecha && ids.has(String(x.personaId)))
      const autorizadas = delDia.filter(esAutorizada)
      const esperan = delDia.filter(x => x.estado === 'pendiente' || x.estado === 'asignada')
      if (autorizadas.length) lista.push({ tipo: 'extra', titulo: `${autorizadas.length} ${autorizadas.length === 1 ? 'persona con' : 'personas con'} horas extra autorizadas`, sub: autorizadas.slice(0, 3).map(x => `${personaPorId.get(String(x.personaId))?.name.split(' ')[0]} ${x.desde}–${x.hasta}`).join(' · '), ir: '/asistencia/solicitudes?ver=horas-extra' })
      if (esperan.length) lista.push({ tipo: 'extra', titulo: `${esperan.length} ${esperan.length === 1 ? 'hora extra espera' : 'horas extra esperan'} respuesta`, sub: 'Una solicitud por aprobar o una asignación por aceptar', ir: '/asistencia/solicitudes?ver=horas-extra' })

      if (lista.length) porDia[dia] = lista
    }
    return porDia
  }, [anio, mes, ultimo, gente, ids, jornadaDe, justificacionDe, cierres, horasExtra, personaPorId, hoy]) // eslint-disable-line react-hooks/exhaustive-deps

  const celdas = buildCalendarCells(anio, mes)
  const diaElegido = elegido.slice(0, 7) === iso(1).slice(0, 7) ? Number(elegido.slice(8)) : null
  const delDia = diaElegido ? eventos[diaElegido] || [] : []
  const esHoy = elegido === hoy
  const mesCorto = MESES[mes].slice(0, 3).toUpperCase()

  return (
    <div className="sec-card">
      <div className="sc-hd">
        <CalendarDays size={15} style={{ color: 'var(--blue)' }} aria-hidden="true" />
        <h3>{MESES[mes]} {anio}</h3>
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" aria-label="Mes anterior" onClick={() => setDesplazo(d => d - 1)} style={flecha}><ChevronLeft size={13} /></button>
          <button type="button" aria-label="Mes siguiente" onClick={() => setDesplazo(d => d + 1)} style={flecha}><ChevronRight size={13} /></button>
        </div>
      </div>
      <div className="sc-body" style={{ padding: '14px 18px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {DIAS_SEMANA.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', padding: '0 0 8px' }}>{d}</div>)}
          {celdas.map((c, i) => {
            const fecha = c.inMonth ? iso(c.day) : null
            const esteHoy = fecha === hoy
            const sel = fecha && fecha === elegido
            const ev = c.inMonth ? eventos[c.day] : null
            return (
              <button key={i} type="button" disabled={!c.inMonth} onClick={() => fecha && setElegido(fecha)} aria-pressed={!!sel}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '3px 0', background: 'none', border: 'none', fontFamily: 'inherit', cursor: c.inMonth ? 'pointer' : 'default' }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: sel || esteHoy ? 700 : 500,
                  background: sel ? 'var(--navy)' : 'transparent',
                  border: !sel && esteHoy ? '1.5px solid var(--navy)' : 'none',
                  color: !c.inMonth ? 'var(--border-dark)' : sel ? '#fff' : esteHoy ? 'var(--navy)' : 'var(--text-heading)',
                }}>{c.day}</span>
                <span style={{ display: 'flex', gap: 2, height: 4 }}>
                  {ev && ev.slice(0, 3).map((e, j) => <span key={j} style={{ width: 4, height: 4, borderRadius: '50%', background: TIPOS[e.tipo].color }} />)}
                </span>
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 10, paddingTop: 12, borderTop: '1px solid var(--border-soft)', flexWrap: 'wrap' }}>
          {Object.values(TIPOS).map(t => (
            <span key={t.label} style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, display: 'inline-block' }} /> {t.label}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-heading)', flex: 1 }}>
              {diaElegido ? `${diaElegido} de ${MESES[mes]}${esHoy ? ' · Hoy' : ''}` : 'Elige un día'}
              {delDia.length > 0 && <span className="sc-hd-count">{delDia.length}</span>}
            </div>
            {diaElegido && elegido <= hoy && (
              <a href="#" className="chip-link" onClick={e => { e.preventDefault(); navigate(`/asistencia/registro${esHoy ? '' : `?fecha=${elegido}`}`) }}>Ver el día →</a>
            )}
          </div>
          {delDia.length > 0 ? delDia.slice(0, MAX_LISTA).map((e, i) => {
            const t = TIPOS[e.tipo]
            const Fila = e.ir ? 'button' : 'div'
            return (
              <Fila key={i} type={e.ir ? 'button' : undefined} className="upcoming-item" onClick={e.ir ? () => navigate(e.ir) : undefined}
                style={e.ir ? { width: '100%', border: 'none', background: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer' } : undefined}>
                <div className="ui-date">
                  <div className="ui-day">{String(diaElegido).padStart(2, '0')}</div>
                  <div className="ui-month">{mesCorto}</div>
                </div>
                <div className="ui-info">
                  <div className="ui-name">{e.titulo}</div>
                  <div className="ui-sub">{e.sub}</div>
                  <div className="ui-sub">{t.label}</div>
                </div>
                <div className="ui-av" style={{ background: `color-mix(in srgb, ${t.color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <t.Icon size={14} style={{ color: t.color }} aria-hidden="true" />
                </div>
              </Fila>
            )
          }) : (
            <div style={{ padding: '10px 0', fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={13} aria-hidden="true" /> {elegido > hoy ? 'Nada programado para este día' : 'Sin novedades este día'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
