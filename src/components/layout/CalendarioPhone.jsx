import { useState } from 'react'
import { ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react'
import BarraVolver from './BarraVolver'
import { EVENTOS_INICIO } from '../../data/eventosInicio'
import { avatarUrl } from '../../utils/calendarEvents'
import { useAsistencia } from '../../context/AsistenciaContext'
import { DIAS_LARGOS, MESES, aFecha, diaISO, mesDe, mesVecino, nombreMes, semanasDe } from '../../data/asistenciaData'

/* ── EVENTOS Y CUMPLEAÑOS (opción C1 «El calendario de la vacación, y el día debajo») ──
   Lo abren «Ver más» y el botón de calendario del Inicio, un cumpleaños tocado en el Inicio (ya en
   ese día) y «Calendario» de Zona HR. La misma tarjeta de calendario que la vacación y el permiso
   —semanas completas, «lu ma mi», hoy con aro menta— con un punto menta por cumpleaños y uno navy
   por evento. Tocar un día muestra debajo quién cumple o qué pasa; sin día elegido, la lista del mes.
   Sin botones de saludar ni agendar: se pidió que la lista solo cuente. */

const C = {
  texto: 'var(--in-texto)', mute: 'var(--in-mute)', carta: 'var(--in-carta)', sombra: 'var(--in-sombra)',
  vCarta: 'var(--in-vac-carta)', vBorde: 'var(--in-vac-borde)', punta: 'var(--in-vac-punta)', puntaTxt: 'var(--in-vac-punta-txt)', puntaSombra: 'var(--in-vac-punta-sombra)',
}
const DIAS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do']
const ROTULO = { fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', margin: '6px 2px -2px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }
const largo = s => { const t = `${DIAS_LARGOS[diaISO(s)]} ${aFecha(s).getDate()} de ${MESES[aFecha(s).getMonth()]}`; return t[0].toUpperCase() + t.slice(1) }
const corto = s => `${DIAS_LARGOS[diaISO(s)].slice(0, 3)} ${aFecha(s).getDate()} ${MESES[aFecha(s).getMonth()].slice(0, 3)}`

export default function CalendarioPhone({ onVolver, volverA = 'Inicio', diaInicial = null }) {
  const at = useAsistencia()
  const [ym, setYm] = useState(mesDe(diaInicial || at.hoy))
  const [dia, setDia] = useState(diaInicial)
  const porDia = EVENTOS_INICIO.reduce((m, e) => ({ ...m, [e.fecha]: [...(m[e.fecha] || []), e] }), {})
  const delMes = EVENTOS_INICIO.filter(e => e.fecha.startsWith(ym)).sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
  const lista = dia ? porDia[dia] || [] : delMes
  const mover = n => { setYm(mesVecino(ym, n)); setDia(null) }
  // Tocar un día del mes vecino lleva a ese mes: lo de ese día se lee con su mes.
  const tocar = d => { if (!d.startsWith(ym)) setYm(mesDe(d)); setDia(dia === d ? null : d) }
  const nombre = nombreMes(ym)
  const flecha = { width: 22, height: 22, display: 'grid', placeItems: 'center', border: 'none', borderRadius: '50%', background: 'none', color: 'inherit', opacity: 0.6, cursor: 'pointer', padding: 0 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: C.texto }}>
      <BarraVolver texto={volverA} onVolver={onVolver} conTema />
      <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em', margin: '-2px 2px 0' }}>Eventos y cumpleaños</b>

      <div style={{ background: C.vCarta, border: `1px solid ${C.vBorde}`, borderRadius: 22, boxShadow: C.sombra, padding: '9px 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" aria-label="Mes anterior" onClick={() => mover(-1)} style={flecha}><ChevronLeft size={12} /></button>
          <b style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-.02em' }}>
            {nombre[0].toUpperCase() + nombre.slice(1, -5)} <span style={{ fontWeight: 400, opacity: 0.45 }}>{ym.slice(0, 4)}</span>
          </b>
          <button type="button" aria-label="Mes siguiente" onClick={() => mover(1)} style={flecha}><ChevronRight size={12} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2, textAlign: 'center' }}>
          {DIAS.map(d => <span key={d} style={{ fontSize: 7, fontWeight: 600, letterSpacing: '.06em', opacity: 0.45, paddingBottom: 2 }}>{d}</span>)}
          {semanasDe(ym).map((d, i) => {
            const ev = porDia[d] || []
            const sel = d === dia
            const hoy = d === at.hoy
            const vecino = !d.startsWith(ym)
            const cumple = ev.some(e => e.tipo !== 'Evento')
            const evento = ev.some(e => e.tipo === 'Evento')
            return (
              <button key={d} type="button" onClick={() => tocar(d)} aria-pressed={sel} aria-label={`${corto(d)}${ev.length ? `, ${ev.map(e => e.completo).join(', ')}` : ''}`}
                style={{ height: 31, border: 'none', background: 'none', padding: 0, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, color: C.texto }}>
                <span style={{
                  width: 23, height: 23, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 8.8, fontVariantNumeric: 'tabular-nums',
                  fontWeight: sel ? 700 : hoy ? 600 : 400, background: sel ? C.punta : 'transparent', color: sel ? C.puntaTxt : C.texto,
                  boxShadow: sel ? C.puntaSombra : hoy ? 'inset 0 0 0 1.5px #00E091' : 'none',
                  opacity: sel || hoy ? 1 : vecino ? 0.3 : i % 7 >= 5 ? 0.55 : 1,
                }}>{aFecha(d).getDate()}</span>
                <span style={{ display: 'flex', gap: 2, height: 4, opacity: vecino ? 0.4 : 1 }}>
                  {cumple && <i style={{ width: 4, height: 4, borderRadius: '50%', background: '#00E091' }} />}
                  {evento && <i style={{ width: 4, height: 4, borderRadius: '50%', background: C.texto }} />}
                </span>
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 7, color: C.mute }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i style={{ width: 5, height: 5, borderRadius: '50%', background: '#00E091' }} />Cumpleaños</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i style={{ width: 5, height: 5, borderRadius: '50%', background: C.texto }} />Evento</span>
        </div>
      </div>

      <span style={ROTULO}>
        {dia ? largo(dia) : `En ${nombre.slice(0, -5)}`}
        {!dia && <small style={{ fontSize: 7.4, fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: C.mute }}>{delMes.length}</small>}
      </span>
      {lista.length ? (
        <div style={{ background: C.carta, borderRadius: 15, boxShadow: C.sombra, overflow: 'hidden' }}>
          {lista.map((e, i) => {
            const esEvento = e.tipo === 'Evento'
            const cuando = dia ? null : corto(e.fecha)
            const linea = esEvento ? [cuando, e.detalle].filter(Boolean).join(' · ') : [cuando, e.fecha === at.hoy ? 'Cumple hoy' : 'Cumpleaños'].filter(Boolean).join(' · ')
            return (
              <div key={`${e.fecha}-${e.completo}`} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderTop: i ? '1px solid var(--in-linea)' : 'none' }}>
                {esEvento
                  ? <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#0C2D40', color: '#00E091', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 0 0 1.4px var(--in-carta), 0 0 0 2.6px #0C2D40' }}><PartyPopper size={13} strokeWidth={1.8} /></span>
                  : <img src={avatarUrl(e.completo, 80)} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 0 0 1.4px var(--in-carta), 0 0 0 2.6px #00E091' }} />}
                <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
                  <b style={{ fontSize: 9, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.completo}</b>
                  <span style={{ fontSize: 7.2, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{linea}</span>
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <span style={{ fontSize: 8, color: C.mute, textAlign: 'center', padding: '10px 0' }}>{dia ? 'Nada este día.' : 'Nada este mes.'}</span>
      )}
    </div>
  )
}
