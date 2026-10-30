import { useState } from 'react'
import { ChevronLeft, ChevronRight, Cake, PartyPopper } from 'lucide-react'
import BarraVolver from './BarraVolver'
import { EVENTOS_INICIO } from '../../data/eventosInicio'
import { avatarUrl } from '../../utils/calendarEvents'

/* ── EL CALENDARIO DEL TELÉFONO (lo abre «Ver más» de los cumpleaños) ──
   El mes con un puntito en cada día que tiene algo (menta = cumpleaños, navy = evento) y, debajo, la
   lista de ese mes. Tocar un día deja solo lo de ese día. Mismos colores y tarjetas que el inicio. */

const C = { texto: '#0C2D40', mute: '#62788A', menta: '#00E091', mentaT: '#0A7F55', mentaBg: '#E3FAF0', linea: '#EEF2F6', navy: '#0C2D40', sombra: '0 6px 16px -8px rgba(12,45,64,.22), 0 1px 2px rgba(12,45,64,.06)' }
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

export default function CalendarioPhone({ onVolver }) {
  const hoy = new Date()
  const hoyIso = iso(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const [mes, setMes] = useState({ y: hoy.getFullYear(), m: hoy.getMonth() })
  const [dia, setDia] = useState(null)

  const primero = new Date(mes.y, mes.m, 1).getDay()
  const vacios = (primero + 6) % 7 // la semana empieza el lunes
  const dias = new Date(mes.y, mes.m + 1, 0).getDate()
  const delMes = EVENTOS_INICIO.filter(e => e.fecha.startsWith(iso(mes.y, mes.m, 1).slice(0, 7)))
  const lista = dia ? delMes.filter(e => e.fecha === dia) : delMes
  const mover = n => { const d = new Date(mes.y, mes.m + n, 1); setMes({ y: d.getFullYear(), m: d.getMonth() }); setDia(null) }

  return (
    <div style={{ padding: '2px 2px' }}>
      <BarraVolver texto="Inicio" onVolver={onVolver} />
      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.texto, margin: '2px 0 10px' }}>Eventos y cumpleaños</div>

      <div style={{ background: '#fff', borderRadius: 16, boxShadow: C.sombra, padding: '10px 10px 8px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <button type="button" onClick={() => mover(-1)} aria-label="Mes anterior" style={btn}><ChevronLeft size={12} /></button>
          <b style={{ fontSize: 10, color: C.texto }}>{MESES[mes.m]} {mes.y}</b>
          <button type="button" onClick={() => mover(1)} aria-label="Mes siguiente" style={btn}><ChevronRight size={12} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 3, textAlign: 'center' }}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={i} style={{ fontSize: 7, fontWeight: 700, color: '#9AABBB', paddingBottom: 2 }}>{d}</span>)}
          {Array.from({ length: vacios }, (_, i) => <span key={`v${i}`} />)}
          {Array.from({ length: dias }, (_, i) => {
            const f = iso(mes.y, mes.m, i + 1)
            const ev = delMes.filter(e => e.fecha === f)
            const esHoy = f === hoyIso; const sel = f === dia
            return (
              <button key={f} type="button" onClick={() => setDia(sel ? null : f)} disabled={!ev.length && !esHoy} style={{ border: 'none', background: 'none', padding: 0, cursor: ev.length ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, fontFamily: 'inherit' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 8.5, fontWeight: esHoy || sel ? 700 : 500, background: sel ? C.menta : esHoy ? C.navy : 'transparent', color: esHoy && !sel ? '#fff' : C.texto }}>{i + 1}</span>
                <span style={{ display: 'flex', gap: 1.5, height: 4 }}>{ev.map(e => <i key={e.nombre} style={{ width: 4, height: 4, borderRadius: '50%', background: e.tipo === 'Evento' ? C.navy : C.menta }} />)}</span>
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 6, fontSize: 7, color: C.mute }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><i style={{ width: 5, height: 5, borderRadius: '50%', background: C.menta }} /> Cumpleaños</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><i style={{ width: 5, height: 5, borderRadius: '50%', background: C.navy }} /> Evento</span>
        </div>
      </div>

      <div style={{ fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: C.texto, marginBottom: 6 }}>
        {dia ? `El ${Number(dia.slice(8))} de ${MESES[mes.m].toLowerCase()}` : `En ${MESES[mes.m].toLowerCase()}`}
      </div>
      {lista.length === 0 && <div style={{ background: '#fff', borderRadius: 14, boxShadow: C.sombra, padding: 14, textAlign: 'center', fontSize: 8.6, color: C.mute }}>No hay cumpleaños ni eventos este mes.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {lista.map(e => {
          const esEvento = e.tipo === 'Evento'
          return (
            <div key={e.nombre + e.fecha} style={{ background: '#fff', borderRadius: 14, boxShadow: C.sombra, padding: '9px 10px', display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 30, textAlign: 'center', flexShrink: 0 }}>
                <b style={{ display: 'block', fontSize: 12, lineHeight: 1, color: C.texto }}>{Number(e.fecha.slice(8))}</b>
                <span style={{ fontSize: 6.5, fontWeight: 700, color: C.mute }}>{MESES[mes.m].slice(0, 3).toUpperCase()}</span>
              </span>
              {esEvento
                ? <span style={{ width: 28, height: 28, borderRadius: '50%', background: C.navy, display: 'grid', placeItems: 'center', flexShrink: 0 }}><PartyPopper size={13} style={{ color: C.menta }} /></span>
                : <img src={avatarUrl(e.nombre, 60)} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', boxShadow: `0 0 0 2px ${C.menta}`, flexShrink: 0 }} />}
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: 9.4, color: C.texto }}>{e.completo}</b>
                <span style={{ fontSize: 7.6, color: C.mute, display: 'inline-flex', alignItems: 'center', gap: 3 }}>{esEvento ? e.detalle : <><Cake size={9} style={{ color: C.mentaT }} /> Cumpleaños</>}</span>
              </span>
              {!esEvento && <span style={{ fontSize: 7.6, fontWeight: 700, color: C.mentaT, background: C.mentaBg, padding: '4px 8px', borderRadius: 99 }}>Saludar</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const btn = { width: 22, height: 22, borderRadius: '50%', border: 'none', background: '#F2F5FC', color: '#0C2D40', display: 'grid', placeItems: 'center', cursor: 'pointer' }
