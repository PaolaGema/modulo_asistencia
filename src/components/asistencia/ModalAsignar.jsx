import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarClock, Search, Check, MapPin, House, Laptop, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Modal } from '../documentacion/comunes'
import Desplegable from '../layout/Desplegable'
import Avatar from '../personas/Avatar'
import { MODALIDADES, DIAS_CORTOS, hoyISO, sumarDias, diaISO, fechaLarga, horarioDeDia, minutosProgramados, minutosSemana, otrosDias, franjasPausa, reglasDe, duracion, hhmm } from '../../data/asistenciaData'

/* ── ASIGNAR HORARIO Y LUGAR (Ronda 25 bis · A1+, con el horario en lista desplegable) ──
   Pensado en grande: 50 horarios, 30 lugares, 47 colaboradores a la vez.
     · El HORARIO se elige en una lista desplegable con buscador y filtros (fijos, flexibles, con
       sábado, con domingo), los más usados primero; cada uno con su color, sus horas, su semana en
       barritas y cuántos lo tienen. Debajo, la semana del elegido en grande.
     · DÓNDE MARCA, con buscador; la MODALIDAD en tres tarjetas; DESDE con atajos.
     · A la derecha, «Así quedan»: cuántos cambian, cuántos ya lo tenían y cuántos son nuevos,
       agrupado por el horario de antes, y la lista uno por uno si se quiere ver. */

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

function Semanita({ h, grande }) {
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
function SelectorHorario({ valor, onCambio, uso }) {
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

export default function ModalAsignar({ ids, onCerrar, onListo }) {
  const at = useAsistencia()
  const gente = useMemo(() => ids.map(id => at.personas.find(p => p.id === id)).filter(Boolean), [ids, at.personas])
  const primera = gente[0]
  const [d, setD] = useState({
    horarioId: primera?.asig?.horarioId || at.horarios[0]?.id,
    lugarId: primera?.asig?.lugarId || primera?.sucursalId || at.lugares[0]?.id,
    modalidad: primera?.asig?.modalidad || 'presencial',
    diasOficina: primera?.asig?.diasOficina?.length ? primera.asig.diasOficina : [2, 4],
    desde: hoyISO(),
  })
  const [verTodos, setVerTodos] = useState(false)
  const pon = (k, v) => setD(prev => ({ ...prev, [k]: v }))
  const lugaresOps = useMemo(() => at.lugares.filter(l => l.tipo === 'sucursal').flatMap(s => [
    { valor: s.id, etiqueta: `${s.nombre} · ${s.ciudad}` },
    ...at.lugares.filter(c => c.tipo === 'centro' && c.sucursalId === s.id).map(c => ({ valor: c.id, etiqueta: `   ↳ ${c.nombre}` })),
  ]), [at.lugares])
  const usoDe = useMemo(() => { const m = {}; at.personas.forEach(p => { if (p.asig) m[p.asig.horarioId] = (m[p.asig.horarioId] || 0) + 1 }); return id => m[id] || 0 }, [at.personas])
  const h = at.horarios.find(x => x.id === d.horarioId)
  const lugar = at.lugarPorId.get(d.lugarId)

  /* Así quedan: quién cambia, quién ya lo tenía, quién es nuevo, agrupado por el horario de antes. */
  const igual = p => p.asig && p.asig.horarioId === d.horarioId && p.asig.lugarId === d.lugarId && p.asig.modalidad === d.modalidad
  const nuevos = gente.filter(p => !p.asig)
  const yaLoTenian = gente.filter(igual)
  const cambian = gente.filter(p => p.asig && !igual(p))
  const grupos = useMemo(() => {
    const m = new Map()
    for (const p of cambian) { const k = p.asig.horarioId === d.horarioId ? 'mismo' : (p.horarioBase?.nombre || 'Otro horario'); m.set(k, (m.get(k) || 0) + 1) }
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [cambian, d.horarioId])
  const desdeHoy = hoyISO()
  const lunes = sumarDias(desdeHoy, ((8 - diaISO(desdeHoy)) % 7) || 7)
  const Ico = { presencial: MapPin, remoto: House, hibrido: Laptop }
  const asignar = () => { at.asignar(ids, { ...d, politicaId: null, diasOficina: d.modalidad === 'hibrido' ? d.diasOficina : [] }); onListo() }
  const n = ids.length

  return (
    <Modal titulo="Asignar horario y lugar" Icono={CalendarClock} onCerrar={onCerrar} ancho={1060}
      pie={<><button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button><button type="button" className="pl-btn-save" disabled={!h || !lugar} onClick={asignar}>Asignar a {n} {n === 1 ? 'colaborador' : 'colaboradores'}</button></>}>
      <div className="at-modal-campos">
        <div className="at-as-quienes">
          <span className="avs">{gente.slice(0, 4).map(p => <Avatar key={p.id} persona={p} size={34} />)}{n > 4 && <span className="mas">+{n - 4}</span>}</span>
          <span><b>{n} {n === 1 ? 'colaborador' : 'colaboradores'}</b><small>{n <= 3 ? gente.map(p => p.name).join(', ') : [...new Set(gente.map(p => p.unidad))].slice(0, 3).join(' · ')}</small></span>
        </div>
        <div className="at-as-lado">
          <div className="at-as-izq">
            <span className="at-hz-rot">1 · Horario</span>
            <SelectorHorario valor={d.horarioId} onCambio={v => pon('horarioId', v)} uso={usoDe} />
            {h && (
              <div className="at-as-prev">
                <Semanita h={h} grande />
                <small>{h.modo === 'fijo'
                  ? `${franjasPausa(h).length ? `Descanso ${franjasPausa(h).map(f => `${hhmm(f.desde)} a ${hhmm(f.hasta)}`).join(' y ')} · ` : 'Sin descanso · '}${duracion(minutosSemana(h), { corto: true })} a la semana · ${reglasDe(h).tolerancia} min de tolerancia`
                  : `${duracion(minutosSemana(h), { corto: true })} a la semana · sin tardanzas`}</small>
              </div>
            )}

            <span className="at-hz-rot">2 · Dónde marca y cómo</span>
            <Desplegable valor={d.lugarId} onCambio={v => pon('lugarId', v)} opciones={lugaresOps} ariaLabel="Dónde marca" conBuscador />
            <div className="at-as-modos" role="radiogroup" aria-label="Modalidad">
              {Object.entries(MODALIDADES).map(([k, m]) => {
                const I = Ico[k] || MapPin
                return <button key={k} type="button" role="radio" aria-checked={d.modalidad === k} className={d.modalidad === k ? 'on' : ''} onClick={() => pon('modalidad', k)}><I size={17} /><b>{m.label}</b><small>{m.desc}</small></button>
              })}
            </div>
            {d.modalidad === 'hibrido' && (
              <div className="at-campo"><span>Días de oficina</span>
                <div className="at-semana-chips">
                  {[1, 2, 3, 4, 5, 6, 7].map(x => <button key={x} type="button" aria-pressed={d.diasOficina.includes(x)} className={d.diasOficina.includes(x) ? 'on' : ''} onClick={() => pon('diasOficina', d.diasOficina.includes(x) ? d.diasOficina.filter(y => y !== x) : [...d.diasOficina, x].sort())}>{DIAS_CORTOS[x]}</button>)}
                </div>
              </div>
            )}

            <span className="at-hz-rot">3 · Desde</span>
            <div className="at-as-fechas">
              <button type="button" className={d.desde === desdeHoy ? 'on' : ''} onClick={() => pon('desde', desdeHoy)}>Hoy · {fechaLarga(desdeHoy).split(' ').slice(0, 2).join(' ').toLowerCase()}</button>
              <button type="button" className={d.desde === lunes ? 'on' : ''} onClick={() => pon('desde', lunes)}>{fechaLarga(lunes).split(' de ')[0]}</button>
              <label className={d.desde !== desdeHoy && d.desde !== lunes ? 'on' : ''}>Otra fecha<input type="date" value={d.desde} onChange={e => e.target.value && pon('desde', e.target.value)} /></label>
            </div>
          </div>

          <div className="at-as-der">
            <span className="at-hz-rot">Así quedan</span>
            <div className="at-as-cifras">
              <div><b>{cambian.length}</b><small>cambian</small></div>
              <div><b>{yaLoTenian.length}</b><small>ya lo tenían</small></div>
              <div><b>{nuevos.length}</b><small>sin asignación, nuevos</small></div>
            </div>
            {(grupos.length > 0 || nuevos.length > 0) && (
              <div className="at-as-grupos">
                {grupos.map(([k, c]) => <div key={k}><span>{k === 'mismo' ? `Ya tienen ${h?.nombre}: cambia el lugar o la modalidad` : `${k} → ${h?.nombre}`}</span><b>{c}</b></div>)}
                {nuevos.length > 0 && <div><span>Sin asignación → {h?.nombre}</span><b>{nuevos.length}</b></div>}
                <button type="button" onClick={() => setVerTodos(!verTodos)}>{verTodos ? 'Ocultar la lista' : `Ver ${n === 1 ? 'el detalle' : `los ${n}, uno por uno`}`} {verTodos ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</button>
              </div>
            )}
            {verTodos && (
              <div className="at-as-uno">
                {gente.map(p => (
                  <div key={p.id}>
                    <Avatar persona={p} size={26} />
                    <span><b>{p.name}</b><small>{p.asig ? <s>{p.horarioBase?.nombre} · {MODALIDADES[p.asig.modalidad]?.label}</s> : 'Sin asignación'}</small></span>
                    <em className={!p.asig ? 'nue' : igual(p) ? 'igual' : 'cam'}>{!p.asig ? 'Nuevo' : igual(p) ? 'Igual' : 'Cambia'}</em>
                  </div>
                ))}
              </div>
            )}
            <div className="at-as-nota">
              {h && lugar ? <>Quedan con <b>{h.nombre}</b>, en <b>{lugar.nombre}</b>, <b>{MODALIDADES[d.modalidad].label.toLowerCase()}</b>, desde el <b>{fechaLarga(d.desde).toLowerCase()}</b>.</> : 'Elija el horario y el lugar.'}
              {cambian.length > 0 && <> A {cambian.length === 1 ? 'quien cambia' : `los ${cambian.length} que cambian`} se le{cambian.length === 1 ? '' : 's'} cierra su asignación de hoy y se abre esta, en un solo paso.</>}
            </div>
            {!at.horarios.length && <span className="at-ayuda"><Plus size={12} /> Primero cree un horario.</span>}
          </div>
        </div>
      </div>
    </Modal>
  )
}
