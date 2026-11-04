import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { DIAS_CORTOS, horarioDeDia, minutosProgramados, otrosDias, duracion } from '../../data/asistenciaData'

/* ── ELEGIR UN HORARIO, AUNQUE HAYA 50 ─────────────────────────────────────
   Una lista desplegable con buscador y filtros (fijos, flexibles, con sábado, con domingo), los más
   usados primero; cada horario con su color, sus horas, su semana en barritas y cuántos lo tienen.
   Se usa en Asignar horario y lugar y en el alta del colaborador. */

const FILTROS = [
  ['', 'Todos'], ['fijo', 'Fijos'], ['flexible', 'Flexibles'], ['sabado', 'Con sábado'], ['domingo', 'Con domingo'],
]
const rangoDias = dias => {
  const t = dias.join()
  if (t === '1,2,3,4,5') return 'Lu a Vi'
  if (t === '1,2,3,4,5,6') return 'Lu a Sá'
  if (t === '1,2,3,4,5,6,7') return 'Todos los días'
  return dias.map(d => DIAS_CORTOS[d]).join(' ')
}
const textoHorario = h => (h.modo === 'flexible'
  ? `${rangoDias(h.dias)} · meta de ${duracion(h.meta, { corto: true })}, a la hora que quiera`
  : `${rangoDias(h.dias)} · ${h.entrada} a ${h.salida}${otrosDias(h).length ? ` · ${otrosDias(h).join(' · ')}` : ''}`)

export function Semanita({ h, grande }) {
  return (
    <span className={`at-as-sem${grande ? ' grande' : ''}`} aria-hidden="true">
      {[1, 2, 3, 4, 5, 6, 7].map(d => {
        const on = h.dias.includes(d)
        const alto = on ? Math.max(.25, Math.min(1, minutosProgramados(horarioDeDia(h, d)) / 600)) : 0
        return <span key={d}><i style={on ? { height: `${alto * 100}%`, background: h.color } : undefined} />{grande && <small>{DIAS_CORTOS[d]}</small>}</span>
      })}
    </span>
  )
}

function OpcionHorario({ h, uso, on, onElegir }) {
  return (
    <button type="button" role="option" aria-selected={on} className={`at-as-op${on ? ' on' : ''}`} onClick={onElegir}>
      <span className="col" style={{ background: h.color }} />
      <span className="txt"><b>{h.nombre}</b><small>{textoHorario(h)}</small></span>
      <Semanita h={h} />
      <span className="uso">{uso} {uso === 1 ? 'col.' : 'col.'}</span>
      {on && <em><Check size={11} /></em>}
    </button>
  )
}

/* La lista desplegable de horarios: con buscador y filtros, los más usados primero. */
export default function SelectorHorario({ valor, onCambio, uso }) {
  const at = useAsistencia()
  const [pos, setPos] = useState(null)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('')
  const boton = useRef(null)
  const caja = useRef(null)
  const elegido = at.horarios.find(h => h.id === valor)
  useEffect(() => {
    if (!pos) return
    const fuera = e => { if (!caja.current?.contains(e.target) && !boton.current?.contains(e.target)) setPos(null) }
    const tecla = e => { if (e.key === 'Escape') { e.stopPropagation(); setPos(null) } }
    document.addEventListener('mousedown', fuera); document.addEventListener('keydown', tecla, true)
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', tecla, true) }
  }, [pos])
  const abrir = () => { const r = boton.current.getBoundingClientRect(); setPos({ top: r.bottom + 6, left: r.left, width: r.width, maxHeight: Math.max(260, window.innerHeight - r.bottom - 24) }) }
  const t = busca.trim().toLowerCase()
  const lista = at.horarios
    .filter(h => !t || `${h.nombre} ${textoHorario(h)}`.toLowerCase().includes(t))
    .filter(h => !filtro || (filtro === 'fijo' ? h.modo === 'fijo' : filtro === 'flexible' ? h.modo === 'flexible' : filtro === 'sabado' ? h.dias.includes(6) : h.dias.includes(7)))
    .sort((a, b) => (uso(b.id) - uso(a.id)) || a.nombre.localeCompare(b.nombre))
  return (
    <>
      <button ref={boton} type="button" className={`at-as-campo${pos ? ' abierto' : ''}`} aria-haspopup="listbox" aria-expanded={!!pos} onClick={() => (pos ? setPos(null) : abrir())}>
        {elegido ? <><span className="col" style={{ background: elegido.color }} /><span className="txt"><b>{elegido.nombre}</b><small>{textoHorario(elegido)}</small></span><Semanita h={elegido} /></> : <span className="txt"><small>Elija un horario</small></span>}
        {pos ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {pos && createPortal(
        <div ref={caja} className="at-as-menu" style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }} role="listbox" aria-label="Horarios">
          <div className="at-as-buscar"><Search size={14} /><input autoFocus value={busca} onChange={e => setBusca(e.target.value)} placeholder={`Buscar entre ${at.horarios.length} horarios…`} aria-label="Buscar horario" /></div>
          <div className="at-as-filtros">{FILTROS.map(([k, l]) => <button key={k} type="button" className={filtro === k ? 'on' : ''} aria-pressed={filtro === k} onClick={() => setFiltro(k)}>{l}</button>)}</div>
          <small className="at-as-sub">{t || filtro ? `${lista.length} ${lista.length === 1 ? 'coincide' : 'coinciden'}` : 'Los más usados primero'}</small>
          <div className="at-as-lista">
            {lista.map(h => <OpcionHorario key={h.id} h={h} uso={uso(h.id)} on={h.id === valor} onElegir={() => { onCambio(h.id); setPos(null) }} />)}
            {!lista.length && <span className="at-as-vacio">Ningún horario coincide. Créelo en Configuración › Horarios.</span>}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

