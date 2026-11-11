import { useMemo, useState } from 'react'
import { CalendarClock, MapPin, House, Laptop, ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Modal } from '../documentacion/comunes'
import Desplegable from '../layout/Desplegable'
import Avatar from '../personas/Avatar'
import SelectorHorario, { Semanita } from './SelectorHorario'
import { MODALIDADES, DIAS_CORTOS, hoyISO, sumarDias, diaISO, fechaLarga, minutosSemana, franjasPausa, reglasDe, duracion, hhmm } from '../../data/asistenciaData'

/* ── ASIGNAR HORARIO Y LUGAR (Ronda 25 bis · A1+, con el horario en lista desplegable) ──
   Pensado en grande: 50 horarios, 30 lugares, 47 colaboradores a la vez.
     · El HORARIO se elige en una lista desplegable con buscador y filtros (fijos, flexibles, con
       sábado, con domingo), los más usados primero; cada uno con su color, sus horas, su semana en
       barritas y cuántos lo tienen. Debajo, la semana del elegido en grande.
     · DÓNDE MARCA, con buscador; la MODALIDAD en tres tarjetas; DESDE con atajos.
     · A la derecha, «Así quedan»: cuántos cambian, cuántos ya lo tenían y cuántos son nuevos,
       agrupado por el horario de antes, y la lista uno por uno si se quiere ver. */

export default function ModalAsignar({ ids, onCerrar, onListo }) {
  const at = useAsistencia()
  const gente = useMemo(() => ids.map(id => at.personas.find(p => p.id === id)).filter(Boolean), [ids, at.personas])
  const primera = gente[0]
  const [d, setD] = useState({
    horarioId: primera?.asig?.horarioId || at.horarios[0]?.id,
    lugarId: primera?.asig?.lugarId || primera?.sucursalId || at.lugares[0]?.id,
    modalidad: primera?.asig?.modalidad || 'presencial',
    diasOficina: primera?.asig?.diasOficina?.length ? primera.asig.diasOficina : [2, 4],
    lugaresExtra: primera?.asig?.lugaresExtra || [],
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
  const igual = p => p.asig && p.asig.horarioId === d.horarioId && p.asig.lugarId === d.lugarId && p.asig.modalidad === d.modalidad && (p.asig.lugaresExtra || []).join() === d.lugaresExtra.join()
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
  const asignar = () => { at.asignar(ids, { ...d, politicaId: null, diasOficina: d.modalidad === 'hibrido' ? d.diasOficina : [], lugaresExtra: d.modalidad === 'remoto' ? [] : d.lugaresExtra.filter(x => x !== d.lugarId) }); onListo() }
  const n = ids.length

  return (
    <Modal titulo={gente.every(p => p.asig) ? 'Cambiar horario y lugar' : 'Asignar horario y lugar'} Icono={CalendarClock} onCerrar={onCerrar} ancho={1060}
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
            <Desplegable valor={d.lugarId} onCambio={v => { pon('lugarId', v); pon('lugaresExtra', d.lugaresExtra.filter(x => x !== v)) }} opciones={lugaresOps} ariaLabel="Dónde marca" conBuscador />
            {/* VARIOS LUGARES: para quien rota entre sucursales (supervisores, técnicos, reemplazos). Puede
                marcar en cualquiera; el Libro dice en cuál marcó cada día. */}
            {d.modalidad !== 'remoto' && (
              <div className="at-as-extra">
                <span className="tit">También puede marcar en</span>
                {d.lugaresExtra.map(id => { const l = at.lugarPorId.get(id); return l ? <span key={id} className="chip"><MapPin size={12} />{l.nombre}<button type="button" aria-label={`Quitar ${l.nombre}`} onClick={() => pon('lugaresExtra', d.lugaresExtra.filter(x => x !== id))}><X size={12} /></button></span> : null })}
                <span className="agregar">
                  <Desplegable valor="" placeholder="+ Agregar otro lugar" onCambio={v => v && v !== d.lugarId && !d.lugaresExtra.includes(v) && pon('lugaresExtra', [...d.lugaresExtra, v])} opciones={lugaresOps.filter(o => o.valor !== d.lugarId && !d.lugaresExtra.includes(o.valor))} ariaLabel="Agregar otro lugar" conBuscador />
                </span>
                {d.lugaresExtra.length > 0 && <small>Puede marcar en cualquiera de los {d.lugaresExtra.length + 1}. El Libro dice dónde marcó cada día.</small>}
              </div>
            )}
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
              {h && lugar ? <>Quedan con <b>{h.nombre}</b>, en <b>{lugar.nombre}</b>{d.lugaresExtra.length && d.modalidad !== 'remoto' ? <> (o en {d.lugaresExtra.map(id => at.lugarPorId.get(id)?.nombre).filter(Boolean).join(' o ')})</> : null}, <b>{MODALIDADES[d.modalidad].label.toLowerCase()}</b>, desde el <b>{fechaLarga(d.desde).toLowerCase()}</b>.</> : 'Elija el horario y el lugar.'}
              {cambian.length > 0 && <> A {cambian.length === 1 ? 'quien cambia' : `los ${cambian.length} que cambian`} se le{cambian.length === 1 ? '' : 's'} cierra su asignación de hoy y se abre esta, en un solo paso.</>}
            </div>
            {!at.horarios.length && <span className="at-ayuda"><Plus size={12} /> Primero cree un horario.</span>}
          </div>
        </div>
      </div>
    </Modal>
  )
}
