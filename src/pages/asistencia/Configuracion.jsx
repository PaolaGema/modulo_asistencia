import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, Clock, ScanFace, MapPin, MapPinOff, Star, Building2, Warehouse, Users, CheckCircle2, AlertTriangle,
  ShieldCheck, Search, House, Laptop, ArrowUpRight, Timer, Ruler, CalendarClock, RotateCcw, Check, Copy, Coffee, LogOut, BellRing, Smartphone,
  LayoutGrid, Table2,
} from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Modal, Vacio, MenuAcciones } from '../../components/documentacion/comunes'
import Desplegable from '../../components/layout/Desplegable'
import Paginacion from '../../components/layout/Paginacion'
import { PersonaAt, FiltrosOrg, FILTRO_VACIO, filtrar } from '../../components/asistencia/comunes'
import MapaGeocerca from '../../components/asistencia/MapaGeocerca'
import { MODALIDADES, DIAS_CORTOS, SIN_PAUSA, REDONDEOS, reglasDe, franjaPausa, aMin, hhmm, duracion, minutosProgramados, fechaCorta, hoyISO } from '../../data/asistenciaData'

/* ── CONFIGURACIÓN DE ASISTENCIA ───────────────────────────────────────────
   Cinco partes, en el orden en que se arma el módulo la primera vez: los HORARIOS (cuándo), las
   POLÍTICAS (qué se exige al marcar), los LUGARES (dónde: la geocerca de cada sucursal y centro de
   trabajo de Organización), las ASIGNACIONES (a quién le toca qué) y la BIOMETRÍA.

   ARRIBA, LA PUESTA A PUNTO: el `readiness` del backend —sin sede, sin horario, sin política,
   consentimiento pendiente— dicho como una lista de lo que falta, con su enlace. */

const SECCIONES = ['horarios', 'politicas', 'avisos', 'lugares', 'asignaciones', 'biometria']
const COLORES = ['#00B876', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#EF4444', '#0C2D40']

export default function Configuracion() {
  const at = useAsistencia()
  const [params, setParams] = useSearchParams()
  const ver = SECCIONES.includes(params.get('ver')) ? params.get('ver') : 'horarios'
  const ir = v => setParams({ ver: v }, { replace: true })

  const sinGeo = at.lugares.filter(l => !l.geo)
  const sinHorario = at.personas.filter(p => !p.asig)
  const sinConsent = at.personas.filter(p => !p.bio?.consentimiento)
  const sinRostro = at.personas.filter(p => p.bio?.consentimiento && !p.bio?.enrolado)
  const checks = [
    { ok: !sinGeo.length, tit: 'Lugares con geocerca', txt: sinGeo.length ? `${sinGeo.length} sin ubicación` : `${at.lugares.length} listos`, ver: 'lugares' },
    { ok: !sinHorario.length, tit: 'Personas con horario', txt: sinHorario.length ? `${sinHorario.length} sin asignar` : 'Todas asignadas', ver: 'asignaciones' },
    { ok: !!at.politicas.find(p => p.porDefecto), tit: 'Política por defecto', txt: at.politicaDefecto?.nombre || 'Falta elegir una', ver: 'politicas' },
    { ok: !sinConsent.length, tit: 'Consentimiento biométrico', txt: sinConsent.length ? `${sinConsent.length} por aceptar` : 'Todos aceptaron', ver: 'biometria' },
    { ok: !sinRostro.length, tit: 'Rostros enrolados', txt: sinRostro.length ? `${sinRostro.length} sin enrolar` : 'Todos enrolados', ver: 'biometria' },
  ]
  const listos = checks.filter(c => c.ok).length

  const titulos = {
    horarios: ['Horarios', 'Cuándo trabaja cada quien. Un horario fijo calcula tardanzas y horas extra; uno flexible sólo pide cumplir la meta del día.'],
    politicas: ['Políticas de marcación', 'Qué se exige en cada marcación y cómo se calcula el día: rostro, ubicación, tolerancias de entrada, descanso y salida, y redondeo. La de por defecto se aplica a quien no tenga otra.'],
    avisos: ['Avisos al colaborador', 'Qué le avisa la app a cada persona cuando su día sale con una alerta, y cuánto tiempo tiene para mandar su motivo.'],
    lugares: ['Lugares de marcación', 'Las sucursales y los centros de trabajo de Organización, con la geocerca dentro de la cual se puede marcar.'],
    asignaciones: ['Asignaciones', 'Qué horario, qué lugar y qué política tiene cada persona. Se puede asignar a toda una unidad o sucursal de una vez.'],
    biometria: ['Biometría y privacidad', 'Quién aceptó el consentimiento y enroló su rostro, y cuánto tiempo se guardan las selfies.'],
  }

  return (
    <div className="content-scroll">
      <Cabecera titulo={titulos[ver][0]} sub={titulos[ver][1]} />

      {listos < checks.length && (
        <section className="at-puesta" aria-label="Puesta a punto">
          <div style={{ textAlign: 'center', minWidth: 96 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-heading)' }}>{listos}/{checks.length}</div>
            <div className="dc-muted" style={{ fontSize: 12, fontWeight: 600 }}>Puesta a punto</div>
          </div>
          <div className="at-puesta-lista">
            {checks.map(c => (
              <button key={c.tit} type="button" className={`at-puesta-item ${c.ok ? 'ok' : 'pend'}`} onClick={() => ir(c.ver)}>
                <span className="ico">{c.ok ? <Check size={14} /> : <AlertTriangle size={13} />}</span>
                <span><b>{c.tit}</b><span>{c.txt}</span></span>
              </button>
            ))}
          </div>
        </section>
      )}

      {ver === 'horarios' && <Horarios />}
      {ver === 'politicas' && <Politicas />}
      {ver === 'avisos' && <Avisos />}
      {ver === 'lugares' && <Lugares />}
      {ver === 'asignaciones' && <Asignaciones />}
      {ver === 'biometria' && <Biometria />}
    </div>
  )
}

/* ── HORARIOS ── */
/* TARJETAS O TABLA: las tarjetas dibujan el día; la tabla compara los horarios lado a lado. Eliminar
   pide confirmación, como toda acción con consecuencias. */
function Horarios() {
  const at = useAsistencia()
  const [params, setParams] = useSearchParams()
  const enTabla = params.get('forma') === 'tabla'
  const ponForma = v => { const n = new URLSearchParams(params); if (v) n.set('forma', v); else n.delete('forma'); setParams(n, { replace: true }) }
  const [editar, setEditar] = useState(null)
  const [borrar, setBorrar] = useState(null)
  const uso = id => Object.values(at.asignaciones).filter(a => a?.horarioId === id).length
  const acciones = (h, n, fr) => [
    { label: 'Editar', Icono: Pencil, onClick: () => setEditar({ ...h, conPausa: !!fr, pausaDesde: fr ? hhmm(fr.desde) : '13:00', pausaHasta: fr ? hhmm(fr.hasta) : '14:00' }) },
    { label: 'Duplicar', Icono: Copy, onClick: () => at.setHorarios(prev => [...prev, { ...h, id: `h-${Date.now().toString(36)}`, nombre: `${h.nombre} (copia)` }]) },
    { label: 'Eliminar', Icono: Trash2, peligro: true, disabled: n > 0, titulo: n > 0 ? 'Está asignado a colaboradores: reasígnelos primero' : undefined, onClick: () => setBorrar(h) },
  ]
  return (
    <>
      <div className="at-hor-barra">
        <button type="button" className="pl-btn-new" onClick={() => setEditar({ id: null, nombre: '', modo: 'fijo', dias: [1, 2, 3, 4, 5], entrada: '08:30', salida: '18:00', conPausa: true, pausaDesde: '13:00', pausaHasta: '14:00', meta: 480, color: COLORES[at.horarios.length % COLORES.length] })}><Plus size={14} /> Nuevo horario</button>
        <div className="at-segmento at-modo" role="tablist" aria-label="Forma de ver">
          <button type="button" role="tab" aria-selected={!enTabla} aria-label="Tarjetas" title="Tarjetas" className={!enTabla ? 'on' : ''} onClick={() => ponForma(null)}><LayoutGrid size={15} aria-hidden="true" /></button>
          <button type="button" role="tab" aria-selected={enTabla} aria-label="Tabla" title="Tabla" className={enTabla ? 'on' : ''} onClick={() => ponForma('tabla')}><Table2 size={15} aria-hidden="true" /></button>
        </div>
      </div>
      {enTabla ? (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table at-tabla at-tabla-sol at-hor-tabla">
            <thead><tr><th>Horario</th><th>Entrada y salida</th><th>Descanso</th><th>Días</th><th className="r">Al día</th><th className="r">A la semana</th><th className="r">Colaboradores</th><th aria-label="Acciones" /></tr></thead>
            <tbody>
              {at.horarios.map(h => {
                const n = uso(h.id)
                const fr = franjaPausa(h)
                const dia = minutosProgramados(h)
                return (
                  <tr key={h.id}>
                    <td><span className="at-hor-nom"><span className="at-item-color" style={{ background: h.color }} /><b>{h.nombre}</b>{h.modo === 'flexible' && <span className="dc-chip dc-chip-sm dc-t-violeta">Flexible</span>}</span></td>
                    <td className="num">{h.modo === 'fijo' ? `${h.entrada} a ${h.salida}` : <span className="dc-muted">Libre</span>}</td>
                    <td className="num">{h.modo === 'fijo' ? (fr ? `${hhmm(fr.desde)} a ${hhmm(fr.hasta)}` : <span className="dc-muted">Sin descanso</span>) : '—'}</td>
                    <td><span className="at-semana-chips at-semana-chips-sm">{[1, 2, 3, 4, 5, 6, 7].map(d => <span key={d} className={h.dias.includes(d) ? 'on' : ''}>{DIAS_CORTOS[d].slice(0, 2)}</span>)}</span></td>
                    <td className="num r">{duracion(dia)}</td>
                    <td className="num r">{duracion(dia * h.dias.length)}</td>
                    <td className="num r">{n}</td>
                    <td style={{ textAlign: 'right' }}><MenuAcciones items={acciones(h, n, fr)} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
      <div className="at-config-grid">
        {at.horarios.map(h => {
          const n = uso(h.id)
          const e = h.modo === 'fijo' ? aMin(h.entrada) : 0; const s = h.modo === 'fijo' ? aMin(h.salida) : 0
          const pos = m => `${(m / 1440) * 100}%`
          const fr = franjaPausa(h)
          return (
            <article key={h.id} className="at-item">
              <div className="at-item-cab">
                <span className="at-item-color" style={{ background: h.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="at-item-nom">{h.nombre} {h.modo === 'flexible' && <span className="dc-chip dc-chip-sm dc-t-violeta">Flexible</span>}</h3>
                  <div className="at-item-sub">{h.modo === 'fijo' ? `${h.entrada} a ${h.salida}${fr ? ` · descanso de ${hhmm(fr.desde)} a ${hhmm(fr.hasta)}` : ' · sin descanso'}` : `Meta de ${duracion(h.meta)} al día, a la hora que quiera`}</div>
                </div>
                <MenuAcciones items={acciones(h, n, fr)} />
              </div>
              <div className="at-semana-chips" aria-label="Días">
                {[1, 2, 3, 4, 5, 6, 7].map(d => <span key={d} className={h.dias.includes(d) ? 'on' : ''}>{DIAS_CORTOS[d]}</span>)}
              </div>
              {h.modo === 'fijo' ? (
                <div>
                  <div className="at-dia-24">
                    <span className="trab" style={{ left: pos(e), width: `calc(${pos(s)} - ${pos(e)})`, background: h.color }} />
                    {fr && <span className="pausa" style={{ left: pos(fr.desde), width: `${(fr.largo / 1440) * 100}%` }} title={`Descanso ${hhmm(fr.desde)}–${hhmm(fr.hasta)}`} />}
                    <span className="lbl" style={{ left: pos(e) }}>{h.entrada}</span>
                  </div>
                  <div className="at-dia-24-esc"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
                </div>
              ) : (
                <div className="at-aviso-linea" style={{ background: 'var(--dc-violeta-bg)', color: 'var(--dc-violeta)' }}><Clock size={14} /> Sin tardanzas ni geocerca: sólo cuenta que cumpla su meta.</div>
              )}
              <div className="at-item-pie">
                <span>{duracion(minutosProgramados(h))} programadas al día</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Users size={13} /> {n} {n === 1 ? 'colaborador' : 'colaboradores'}</span>
              </div>
            </article>
          )
        })}
      </div>
      )}
      {editar && <ModalHorario inicial={editar} onCerrar={() => setEditar(null)} />}
      {borrar && (
        <Modal titulo="Eliminar horario" Icono={Trash2} onCerrar={() => setBorrar(null)} ancho={460}
          pie={<><button type="button" className="pl-btn-cancel" onClick={() => setBorrar(null)}>Cancelar</button><button type="button" className="at-btn-peligro" style={{ height: 38 }} onClick={() => { at.setHorarios(prev => prev.filter(x => x.id !== borrar.id)); setBorrar(null) }}>Sí, eliminar</button></>}>
          <p style={{ margin: 0, lineHeight: 1.55 }}>¿Eliminar el horario <b>{borrar.nombre}</b>? Nadie lo tiene asignado, así que no cambia la jornada de ningún colaborador. No se puede deshacer.</p>
        </Modal>
      )}
    </>
  )
}

function ModalHorario({ inicial, onCerrar }) {
  const at = useAsistencia()
  const [h, setH] = useState(inicial)
  const pon = (k, v) => setH(prev => ({ ...prev, [k]: v }))
  const [, setParams] = useSearchParams()
  const tol = at.politicaDefecto?.tolerancia ?? 10
  const otras = at.politicas.filter(p => p.id !== at.politicaDefecto?.id && p.tolerancia !== tol)
  const irPoliticas = () => { onCerrar(); setParams({ ver: 'politicas' }, { replace: true }) }
  const cruza = h.modo === 'fijo' && aMin(h.salida) <= aMin(h.entrada)
  /* La franja de descanso tiene que caer dentro de la jornada y terminar después de empezar. */
  const pd = aMin(h.pausaDesde); const ph = aMin(h.pausaHasta)
  const pausaMal = h.modo === 'fijo' && h.conPausa && !cruza && (ph <= pd || pd <= aMin(h.entrada) || ph >= aMin(h.salida))
  const valido = h.nombre.trim() && h.dias.length && (h.modo === 'flexible' ? h.meta > 0 : !cruza && !pausaMal)
  const vista = { ...h, pausa: h.conPausa ? ph - pd : 0, pausaDesde: h.conPausa ? h.pausaDesde : null, pausaHasta: h.conPausa ? h.pausaHasta : null }
  const guardar = () => {
    const { conPausa, ...resto } = vista // eslint-disable-line no-unused-vars
    const limpio = { ...resto, nombre: h.nombre.trim(), meta: Number(h.meta) || 0 }
    if (h.id) at.setHorarios(prev => prev.map(x => (x.id === h.id ? limpio : x)))
    else at.setHorarios(prev => [...prev, { ...limpio, id: `h-${Date.now().toString(36)}` }])
    onCerrar()
  }
  return (
    <Modal titulo={h.id ? 'Editar horario' : 'Nuevo horario'} Icono={Clock} onCerrar={onCerrar} ancho={560}
      pie={<><button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button><button type="button" className="pl-btn-save" disabled={!valido} onClick={guardar}>Guardar</button></>}>
      <div className="at-modal-campos">
        <label className="at-campo"><span>Nombre</span><input className="pl-input" value={h.nombre} onChange={e => pon('nombre', e.target.value)} placeholder="Ej.: Turno tarde de tienda" autoFocus /></label>
        <div className="at-campo"><span>Tipo</span>
          <div className="at-segmento" role="radiogroup">
            <button type="button" role="radio" aria-checked={h.modo === 'fijo'} className={h.modo === 'fijo' ? 'on' : ''} onClick={() => pon('modo', 'fijo')}>Fijo · con hora de entrada</button>
            <button type="button" role="radio" aria-checked={h.modo === 'flexible'} className={h.modo === 'flexible' ? 'on' : ''} onClick={() => pon('modo', 'flexible')}>Flexible · por meta de horas</button>
          </div>
        </div>
        <div className="at-campo"><span>Días que trabaja</span>
          <div className="at-semana-chips">
            {[1, 2, 3, 4, 5, 6, 7].map(d => <button key={d} type="button" aria-pressed={h.dias.includes(d)} className={h.dias.includes(d) ? 'on' : ''} onClick={() => pon('dias', h.dias.includes(d) ? h.dias.filter(x => x !== d) : [...h.dias, d].sort())}>{DIAS_CORTOS[d]}</button>)}
          </div>
        </div>
        {h.modo === 'fijo' ? (
          <>
            <div className="at-dos">
              <label className="at-campo"><span>Entrada</span><input type="time" className="pl-input" value={h.entrada} onChange={e => pon('entrada', e.target.value)} /></label>
              <label className="at-campo"><span>Salida</span><input type="time" className="pl-input" value={h.salida} onChange={e => pon('salida', e.target.value)} /></label>
            </div>
            {/* LA TOLERANCIA NO ES DEL HORARIO sino de la política (un mismo 08:30 puede tener 10 min para
                unos y 20 para otros). Pero quien arma el horario la busca acá, así que se le dice cuánto es
                y dónde se cambia. */}
            {!cruza && (
              <div className="at-aviso-linea" style={{ alignItems: 'flex-start', lineHeight: 1.45 }}>
                <Timer size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ flex: 1 }}>
                  Tolerancia de entrada: <b>{tol} min</b> ({at.politicaDefecto.nombre}), así que cuenta como atraso después de las <b>{hhmm(aMin(h.entrada) + tol)}</b>.
                  {otras.length > 0 && <> {otras.map(p => `${p.nombre}: ${p.tolerancia} min`).join(' · ')}.</>}
                  {' '}<button type="button" onClick={irPoliticas} style={{ border: 'none', background: 'none', padding: 0, font: 'inherit', fontWeight: 600, color: 'var(--text-heading)', textDecoration: 'underline', cursor: 'pointer' }}>Cambiar en Políticas</button>
                </span>
              </div>
            )}
            {/* EL DESCANSO ES UNA FRANJA (#2), no una cantidad de minutos: así se sabe si salió antes,
                si volvió tarde o si se excedió. La tolerancia de cada cosa va en la política. */}
            <Interruptor on={h.conPausa} onCambio={v => pon('conPausa', v)} titulo="Tiene descanso" texto="Una franja fija para almorzar o descansar. Se marca al salir y al volver, y no cuenta como trabajada." />
            {h.conPausa && (
              <div className="at-dos">
                <label className="at-campo"><span>Descanso desde</span><input type="time" className="pl-input" value={h.pausaDesde} onChange={e => pon('pausaDesde', e.target.value)} /></label>
                <label className="at-campo"><span>Hasta</span><input type="time" className="pl-input" value={h.pausaHasta} onChange={e => pon('pausaHasta', e.target.value)} /></label>
              </div>
            )}
          </>
        ) : (
          <label className="at-campo"><span>Meta diaria (horas)</span><input type="number" min="1" max="12" step="0.5" className="pl-input" value={h.meta / 60} onChange={e => pon('meta', Math.round(Number(e.target.value) * 60))} /></label>
        )}
        {pausaMal && <div className="at-aviso-linea" style={{ background: 'var(--dc-ambar-bg)', color: 'var(--dc-ambar)' }}><AlertTriangle size={14} /> El descanso tiene que empezar después de la entrada, terminar antes de la salida y durar algo.</div>}
        {cruza && <div className="at-aviso-linea" style={{ background: 'var(--dc-ambar-bg)', color: 'var(--dc-ambar)' }}><AlertTriangle size={14} /> La salida es antes que la entrada. Los turnos que cruzan la medianoche todavía no se calculan bien (riesgo K1): divídalo en dos días por ahora.</div>}
        <div className="at-campo"><span>Color</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORES.map(c => <button key={c} type="button" aria-label={`Color ${c}`} aria-pressed={h.color === c} onClick={() => pon('color', c)} style={{ width: 26, height: 26, borderRadius: 8, border: 'none', background: c, cursor: 'pointer', boxShadow: h.color === c ? '0 0 0 2px var(--surface-card), 0 0 0 4px var(--text-heading)' : 'none' }} />)}
          </div>
        </div>
        <p className="at-ayuda">{h.modo === 'fijo' && !cruza && !pausaMal ? `${duracion(minutosProgramados(vista))} programadas al día${vista.pausa ? ` (sin contar ${duracion(vista.pausa)} de descanso)` : ''}, ${duracion(minutosProgramados(vista) * h.dias.length)} a la semana.` : h.modo === 'flexible' ? `${duracion(h.meta * h.dias.length)} a la semana.` : ''}</p>
      </div>
    </Modal>
  )
}

/* ── POLÍTICAS ── */
function Politicas() {
  const at = useAsistencia()
  const [editar, setEditar] = useState(null)
  const uso = id => at.personas.filter(p => p.politica?.id === id).length
  return (
    <>
      <div><button type="button" className="pl-btn-new" onClick={() => setEditar({ id: null, nombre: '', desc: '', rostro: true, geocerca: true, umbral: 0.78, ...reglasDe(null), radio: null, porDefecto: false })}><Plus size={14} /> Nueva política</button></div>
      <div className="at-config-grid">
        {at.politicas.map(p => (
          <article key={p.id} className="at-item">
            <div className="at-item-cab">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 className="at-item-nom">{p.nombre} {p.porDefecto && <span className="at-defecto"><Star size={10} /> Por defecto</span>}</h3>
                <div className="at-item-sub">{p.desc}</div>
              </div>
              <MenuAcciones items={[
                { label: 'Editar', Icono: Pencil, onClick: () => setEditar({ ...reglasDe(p), ...p }) },
                !p.porDefecto && { label: 'Usar por defecto', Icono: Star, onClick: () => at.setPoliticas(prev => prev.map(x => ({ ...x, porDefecto: x.id === p.id }))) },
                { label: 'Eliminar', Icono: Trash2, peligro: true, disabled: p.porDefecto || uso(p.id) > 0, titulo: p.porDefecto ? 'Es la de por defecto' : uso(p.id) ? 'Está en uso' : undefined, onClick: () => at.setPoliticas(prev => prev.filter(x => x.id !== p.id)) },
              ]} />
            </div>
            <div className="at-reglas">
              <span className={`at-regla${p.rostro ? '' : ' off'}`}><ScanFace size={15} style={{ color: p.rostro ? 'var(--dc-verde)' : undefined }} /> {p.rostro ? `Rostro ≥ ${Math.round(p.umbral * 100)}%` : 'Sin rostro'}</span>
              <span className={`at-regla${p.geocerca ? '' : ' off'}`}>{p.geocerca ? <MapPin size={15} style={{ color: 'var(--dc-verde)' }} /> : <MapPinOff size={15} />} {p.geocerca ? 'Con geocerca' : 'Sin geocerca'}</span>
              <span className="at-regla"><Timer size={15} style={{ color: 'var(--dc-ambar)' }} /> Entrada: {p.tolerancia} min de tolerancia</span>
              <span className="at-regla"><Coffee size={15} style={{ color: 'var(--dc-ambar)' }} /> Descanso: {reglasDe(p).toleranciaPausa} min · sin marcar, {SIN_PAUSA[reglasDe(p).sinPausa].label.toLowerCase()}</span>
              <span className="at-regla"><LogOut size={15} style={{ color: 'var(--dc-ambar)' }} /> Salida: {reglasDe(p).toleranciaSalida} min antes</span>
              <span className="at-regla"><Clock size={15} style={{ color: 'var(--dc-azul)' }} /> {REDONDEOS.find(r => r.valor === reglasDe(p).redondeo)?.label}</span>
              <span className="at-regla"><Ruler size={15} style={{ color: 'var(--dc-azul)' }} /> {p.radio ? `Radio de ${p.radio} m` : 'Radio del lugar'}</span>
            </div>
            <div className="at-item-pie"><span>Horario flexible: nunca pide geocerca</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Users size={13} /> {uso(p.id)}</span></div>
          </article>
        ))}
      </div>
      {editar && <ModalPolitica inicial={editar} onCerrar={() => setEditar(null)} />}
    </>
  )
}

function Interruptor({ on, onCambio, titulo, texto }) {
  return (
    <div className="at-interruptor" onClick={() => onCambio(!on)}>
      <div><b>{titulo}</b><span>{texto}</span></div>
      <button type="button" role="switch" aria-checked={on} aria-label={titulo} className={`at-switch${on ? ' on' : ''}`} onClick={e => { e.stopPropagation(); onCambio(!on) }} />
    </div>
  )
}

function ModalPolitica({ inicial, onCerrar }) {
  const at = useAsistencia()
  const [p, setP] = useState(inicial)
  const pon = (k, v) => setP(prev => ({ ...prev, [k]: v }))
  const guardar = () => {
    const limpio = { ...p, nombre: p.nombre.trim(), tolerancia: Number(p.tolerancia) || 0, toleranciaPausa: Number(p.toleranciaPausa) || 0, toleranciaSalida: Number(p.toleranciaSalida) || 0, redondeo: Number(p.redondeo) || 0, radio: p.radio ? Number(p.radio) : null }
    at.setPoliticas(prev => {
      let lista = p.id ? prev.map(x => (x.id === p.id ? limpio : x)) : [...prev, { ...limpio, id: `p-${Date.now().toString(36)}` }]
      if (limpio.porDefecto) { const id = limpio.id || lista[lista.length - 1].id; lista = lista.map(x => ({ ...x, porDefecto: x.id === id })) }
      return lista
    })
    onCerrar()
  }
  return (
    <Modal titulo={p.id ? 'Editar política' : 'Nueva política'} Icono={ShieldCheck} onCerrar={onCerrar} ancho={560}
      pie={<><button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button><button type="button" className="pl-btn-save" disabled={!p.nombre.trim()} onClick={guardar}>Guardar</button></>}>
      <div className="at-modal-campos">
        <label className="at-campo"><span>Nombre</span><input className="pl-input" value={p.nombre} onChange={e => pon('nombre', e.target.value)} placeholder="Ej.: Vendedores en ruta" autoFocus /></label>
        <label className="at-campo"><span>Para qué sirve</span><input className="pl-input" value={p.desc} onChange={e => pon('desc', e.target.value)} placeholder="Una línea que explique cuándo usarla" /></label>
        <Interruptor on={p.rostro} onCambio={v => pon('rostro', v)} titulo="Pedir el rostro" texto="Prueba quién marca. Sin rostro, cualquiera con la sesión abierta podría marcar." />
        {p.rostro && (
          <label className="at-campo"><span>Similitud mínima del rostro: {Math.round(p.umbral * 100)}%</span>
            <input type="range" className="at-rango" min="0.6" max="0.95" step="0.01" value={p.umbral} onChange={e => pon('umbral', Number(e.target.value))} />
            <span className="at-ayuda">Más alto, más seguro y más rechazos. Nunca baja de 60%: con 0 el rostro deja de comprobarse (riesgo B4).</span>
          </label>
        )}
        <Interruptor on={p.geocerca} onCambio={v => pon('geocerca', v)} titulo="Exigir estar en el lugar" texto="Si está apagado, la ubicación se guarda pero no bloquea la marcación." />
        <label className="at-campo"><span>Radio propio (m) <em>opcional</em></span><input type="number" min="30" max="2000" className="pl-input" value={p.radio || ''} placeholder="El del lugar" onChange={e => pon('radio', e.target.value)} disabled={!p.geocerca} /></label>

        {/* CÓMO SE CALCULA EL DÍA (#2, #5, #6, #7, #8, #26). */}
        <div className="at-form-sep">Cómo se calcula el día</div>
        <div className="at-tres">
          <label className="at-campo"><span>Tolerancia de entrada (min)</span><input type="number" min="0" max="60" className="pl-input" value={p.tolerancia} onChange={e => pon('tolerancia', e.target.value)} /></label>
          <label className="at-campo"><span>Tolerancia de descanso (min)</span><input type="number" min="0" max="30" className="pl-input" value={p.toleranciaPausa} onChange={e => pon('toleranciaPausa', e.target.value)} /></label>
          <label className="at-campo"><span>Tolerancia de salida (min)</span><input type="number" min="0" max="60" className="pl-input" value={p.toleranciaSalida} onChange={e => pon('toleranciaSalida', e.target.value)} /></label>
        </div>
        <p className="at-ayuda" style={{ marginTop: -6 }}>Descanso: minutos de gracia al salir antes de la franja, al volver después o al excederse. Salida: minutos antes de la hora de salida que todavía no son «salida anticipada».</p>
        <div className="at-campo"><span>Si no marca el descanso</span>
          <div className="at-segmento" role="radiogroup">
            {Object.entries(SIN_PAUSA).map(([k, v]) => <button key={k} type="button" role="radio" aria-checked={p.sinPausa === k} className={p.sinPausa === k ? 'on' : ''} onClick={() => pon('sinPausa', k)}>{v.label}</button>)}
          </div>
          <span className="at-ayuda">{SIN_PAUSA[p.sinPausa]?.desc}</span>
        </div>
        <div className="at-campo"><span>Redondeo de la tardanza y la salida anticipada</span>
          <div className="at-segmento" role="radiogroup">
            {REDONDEOS.map(r => <button key={r.valor} type="button" role="radio" aria-checked={Number(p.redondeo) === r.valor} className={Number(p.redondeo) === r.valor ? 'on' : ''} onClick={() => pon('redondeo', r.valor)}>{r.label}</button>)}
          </div>
          <span className="at-ayuda">{REDONDEOS.find(r => r.valor === Number(p.redondeo))?.desc} Las marcaciones siempre se guardan al segundo, con la hora del servidor.</span>
        </div>
        <Interruptor on={p.porDefecto} onCambio={v => pon('porDefecto', v)} titulo="Usar por defecto" texto="Se aplica a quien no tenga otra política asignada. Sólo puede haber una." />
      </div>
    </Modal>
  )
}

/* ── AVISOS AL COLABORADOR (#14, #15) ──
   Cuando el día de alguien sale con una alerta, la app se lo avisa en el momento —«Hoy llegaste
   45 min tarde»— con un botón para agregar el motivo. Lo que mande llega a Solicitudes ›
   Justificaciones; su jefe o RR.HH. lo acepta o no. */
const AVISOS = [
  { key: 'tarde', tit: 'Llegó tarde', ejemplo: 'Hoy llegaste 45 min tarde. ¿Quieres contarnos qué pasó?' },
  { key: 'pausa', tit: 'Descanso excedido o fuera de su franja', ejemplo: 'Volviste 18 min tarde de tu descanso. ¿Agregas el motivo?' },
  { key: 'anticipada', tit: 'Salida anticipada', ejemplo: 'Marcaste tu salida 25 min antes de tu horario. ¿Agregas el motivo?' },
  { key: 'sinPausa', tit: 'No marcó su descanso', ejemplo: 'Hoy no marcaste tu descanso de 13:00 a 14:00. ¿Lo tomaste?' },
  { key: 'ausente', tit: 'Faltó sin aviso', ejemplo: 'Ayer no registramos tu asistencia. ¿Nos cuentas el motivo?' },
]
function Avisos() {
  const at = useAsistencia()
  const g = at.ajustesGenerales
  const pon = (k, v) => at.setAjustesGenerales({ ...g, [k]: v })
  return (
    <div className="at-config-grid at-avisos">
      <article className="at-item" style={{ gridColumn: '1 / -1' }}>
        <div className="at-item-cab"><div><h3 className="at-item-nom"><BellRing size={16} /> Qué se le avisa</h3><div className="at-item-sub">Una notificación en su teléfono, en el momento, con el botón «Agregar motivo».</div></div></div>
        {AVISOS.map(a => (
          <div key={a.key} className="at-aviso-fila">
            <Interruptor on={g.avisar?.[a.key] !== false} onCambio={v => pon('avisar', { ...g.avisar, [a.key]: v })} titulo={a.tit} texto="" />
            <div className="at-aviso-ejemplo"><Smartphone size={13} aria-hidden="true" /> «{a.ejemplo}» <b>Agregar motivo</b></div>
          </div>
        ))}
      </article>
      <article className="at-item">
        <div className="at-item-cab"><div><h3 className="at-item-nom"><Timer size={16} /> Desde cuánto se avisa</h3><div className="at-item-sub">Para no avisar por un minuto suelto. Lo que quede debajo igual se calcula y se ve en el día.</div></div></div>
        <label className="at-campo"><span>Avisar desde {g.avisarDesde} min</span>
          <input type="range" className="at-rango" min="0" max="30" step="1" value={g.avisarDesde} onChange={e => pon('avisarDesde', Number(e.target.value))} />
        </label>
      </article>
      <article className="at-item">
        <div className="at-item-cab"><div><h3 className="at-item-nom"><CalendarClock size={16} /> Plazo para justificar</h3><div className="at-item-sub">Si no manda su motivo en este plazo, se le recuerda una vez y queda como injustificado. Se puede aceptar después mientras el mes no esté cerrado.</div></div></div>
        <label className="at-campo"><span>{g.plazoJustificar} {g.plazoJustificar === 1 ? 'día hábil' : 'días hábiles'}</span>
          <input type="range" className="at-rango" min="1" max="10" step="1" value={g.plazoJustificar} onChange={e => pon('plazoJustificar', Number(e.target.value))} />
        </label>
      </article>
    </div>
  )
}

/* ── LUGARES ── */
function Lugares() {
  const at = useAsistencia()
  const navigate = useNavigate()
  const [editar, setEditar] = useState(null)
  const sucursales = at.lugares.filter(l => l.tipo === 'sucursal')
  const huerfanos = at.lugares.filter(l => l.tipo === 'centro' && !l.sucursalId)
  const gente = id => at.personas.filter(p => p.lugar?.id === id).length
  const fila = (l, hijo) => {
    const Ico = l.tipo === 'centro' ? Warehouse : Building2
    return (
      <div key={l.id} className={`at-fila-lugar${hijo ? ' hijo' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span className={`at-lugar-ico${l.tipo === 'centro' ? ' centro' : ''}`}><Ico size={16} /></span>
          <div style={{ minWidth: 0 }}>
            <div className="at-lugar-nom">{l.nombre}</div>
            <div className="at-lugar-sub">{l.tipo === 'centro' ? `Centro de trabajo · ${l.tipoCentro}` : `Sucursal · ${l.ciudad}`}{l.respaldo ? ' · de ejemplo' : ''}</div>
          </div>
        </div>
        <div className="opc">
          {l.geo
            ? <span className="dc-chip dc-t-verde"><MapPin size={11} /> Radio de {l.geo.radio} m</span>
            : <span className="dc-chip dc-t-ambar"><MapPinOff size={11} /> Sin ubicación</span>}
        </div>
        <div className="opc dc-muted" style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Users size={13} /> {gente(l.id)} marcan aquí</div>
        <button type="button" className={l.geo ? 'dc-btn dc-btn-sm' : 'at-btn-ok'} style={l.geo ? undefined : { height: 28 }} onClick={() => setEditar(l)}>{l.geo ? <><Pencil size={13} /> Geocerca</> : <><MapPin size={13} /> Ubicar</>}</button>
      </div>
    )
  }
  return (
    <>
      <div className="at-aviso-linea">
        <Building2 size={14} /> Los lugares salen de Organización › Estructura física. Para crear una sucursal o un centro de trabajo, hágalo allí; aquí sólo se dibuja su geocerca.
        <button type="button" className="dc-btn dc-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/organizacion/distribucion')}>Ir a Organización <ArrowUpRight size={12} /></button>
      </div>
      <section className="at-card at-arbol-lugar">
        {sucursales.map(s => [fila(s, false), ...at.lugares.filter(c => c.tipo === 'centro' && c.sucursalId === s.id).map(c => fila(c, true))])}
        {huerfanos.map(c => fila(c, false))}
      </section>
      {editar && <ModalLugar lugar={editar} onCerrar={() => setEditar(null)} />}
    </>
  )
}

function ModalLugar({ lugar, onCerrar }) {
  const at = useAsistencia()
  const [geo, setGeo] = useState(lugar.geo || null)
  const radio = geo?.radio || 150
  return (
    <Modal titulo={`Geocerca · ${lugar.nombre}`} Icono={MapPin} onCerrar={onCerrar} ancho={640}
      pie={<><button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button><button type="button" className="pl-btn-save" disabled={!geo} onClick={() => { at.setGeocerca(lugar.id, geo); onCerrar() }}>Guardar geocerca</button></>}>
      <div className="at-modal-campos">
        <p className="at-ayuda">{lugar.direccion || 'Sin dirección registrada en Organización'}. Toque el mapa para poner el centro, o arrastre el punto.</p>
        <MapaGeocerca geo={geo} onCambio={pt => setGeo(g => ({ ...(g || { radio: 150 }), ...pt }))} />
        <label className="at-campo"><span>Radio permitido: {radio} m</span>
          <input type="range" className="at-rango" min="30" max="1000" step="10" value={radio} disabled={!geo} onChange={e => setGeo(g => ({ ...g, radio: Number(e.target.value) }))} />
          <span className="at-ayuda">Muy chico rechaza a quien está en la puerta con mal GPS; muy grande deja marcar desde el café de la esquina. Entre 100 y 200 m suele andar bien en ciudad.</span>
        </label>
        {geo && <div className="dc-muted" style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}</div>}
      </div>
    </Modal>
  )
}

/* ── ASIGNACIONES ── */
const POR_PAGINA = 12
function Asignaciones() {
  const at = useAsistencia()
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [busca, setBusca] = useState('')
  const [soloSin, setSoloSin] = useState(false)
  const [sel, setSel] = useState(() => new Set())
  const [pag, setPag] = useState(1)
  const [asignar, setAsignar] = useState(false)
  const texto = busca.trim().toLowerCase()
  const lista = filtrar(at.personas, filtro).filter(p => (!soloSin || !p.asig) && (!texto || `${p.name} ${p.cargo} ${p.unidad}`.toLowerCase().includes(texto)))
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)
  const todos = lista.length > 0 && lista.every(p => sel.has(p.id))
  const alternar = id => setSel(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const sinCuenta = at.personas.filter(p => !p.asig).length

  return (
    <>
      <div className="at-barra-herr">
        <div className="at-barra-herr-izq">
          <div className="pl-search-wrap" style={{ width: 260 }}>
            <Search size={13} className="pl-search-ico" />
            <input type="search" className="pl-search" placeholder="Buscar persona…" value={busca} onChange={e => { setBusca(e.target.value); setPag(1) }} aria-label="Buscar persona" />
          </div>
          <button type="button" className={`at-pestana${soloSin ? ' on' : ''}`} onClick={() => { setSoloSin(!soloSin); setPag(1) }}><AlertTriangle size={12} /> Sin horario <b>{sinCuenta}</b></button>
        </div>
        <button type="button" className="dc-btn" onClick={() => { setSel(new Set(lista.map(p => p.id))) }}>Seleccionar los {lista.length} filtrados</button>
      </div>
      <FiltrosOrg valor={filtro} onCambio={v => { setFiltro(v); setPag(1) }} lugares={at.lugares} personas={at.personas} />

      {lista.length ? (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table at-tabla">
            <thead><tr>
              <th style={{ width: 36 }}><input type="checkbox" className="at-check" checked={todos} onChange={() => setSel(todos ? new Set() : new Set(lista.map(p => p.id)))} aria-label="Seleccionar todos" /></th>
              <th>Colaborador</th><th>Horario</th><th>Lugar de trabajo</th><th>Modalidad</th><th>Política de marcación</th>
            </tr></thead>
            <tbody>
              {lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(p => (
                <tr key={p.id} onClick={() => alternar(p.id)} style={{ background: sel.has(p.id) ? 'var(--green-bg)' : undefined }}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" className="at-check" checked={sel.has(p.id)} onChange={() => alternar(p.id)} aria-label={`Seleccionar a ${p.name}`} /></td>
                  <td><PersonaAt persona={p} size={30} sub={`${p.cargo} · ${p.unidad}`} /></td>
                  <td>{p.horario ? <span className="at-lugar-chip"><i style={{ width: 8, height: 8, borderRadius: 3, background: p.horario.color, display: 'inline-block' }} /> {p.horario.nombre}</span> : <span className="dc-chip dc-t-ambar"><AlertTriangle size={11} /> Sin horario</span>}</td>
                  <td>{p.lugar ? <span className="at-lugar-chip">{p.lugar.tipo === 'centro' ? <Warehouse size={13} /> : <Building2 size={13} />} {p.lugar.nombre}</span> : <span className="dc-muted">—</span>}</td>
                  <td>{p.asig ? <span className="at-lugar-chip">{p.asig.modalidad === 'remoto' ? <House size={13} /> : p.asig.modalidad === 'hibrido' ? <Laptop size={13} /> : <MapPin size={13} />} {MODALIDADES[p.asig.modalidad].label}{p.asig.modalidad === 'hibrido' && <small>&nbsp;· {p.asig.diasOficina.map(d => DIAS_CORTOS[d]).join(' ')}</small>}</span> : <span className="dc-muted">—</span>}</td>
                  <td>{p.asig ? <span className="dc-muted" style={{ fontSize: 12.5 }}>{p.asig.politicaId ? p.politica?.nombre : `${p.politica?.nombre} (por defecto)`}</span> : <span className="dc-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginacion page={pagina} setPage={setPag} total={lista.length} perPage={POR_PAGINA} nombre="personas" nombreUno="persona" />
        </div>
      ) : <div className="dc-tarjeta"><Vacio Icono={Users} titulo={soloSin ? 'Todos tienen horario' : 'Nadie coincide'} texto={soloSin ? 'No queda nadie sin asignar con estos filtros.' : 'Pruebe con otros filtros.'} /></div>}

      {sel.size > 0 && (
        <div className="at-seleccion">
          <b>{sel.size} {sel.size === 1 ? 'persona seleccionada' : 'personas seleccionadas'}</b>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="dc-btn" onClick={() => setSel(new Set())}>Quitar selección</button>
            <button type="button" className="at-btn-ok" onClick={() => setAsignar(true)}><CalendarClock size={14} /> Asignar horario y lugar</button>
          </div>
        </div>
      )}
      {asignar && <ModalAsignar ids={[...sel]} onCerrar={() => setAsignar(false)} onListo={() => { setAsignar(false); setSel(new Set()) }} />}
    </>
  )
}

function ModalAsignar({ ids, onCerrar, onListo }) {
  const at = useAsistencia()
  const primera = at.personas.find(p => p.id === ids[0])
  const [d, setD] = useState({
    horarioId: primera?.asig?.horarioId || at.horarios[0]?.id,
    lugarId: primera?.asig?.lugarId || primera?.sucursalId || at.lugares[0]?.id,
    modalidad: primera?.asig?.modalidad || 'presencial',
    diasOficina: primera?.asig?.diasOficina?.length ? primera.asig.diasOficina : [2, 4],
    politicaId: primera?.asig?.politicaId || '',
    desde: hoyISO(),
  })
  const pon = (k, v) => setD(prev => ({ ...prev, [k]: v }))
  const lugaresOps = useMemo(() => at.lugares.filter(l => l.tipo === 'sucursal').flatMap(s => [
    { valor: s.id, etiqueta: `${s.nombre} · ${s.ciudad}` },
    ...at.lugares.filter(c => c.tipo === 'centro' && c.sucursalId === s.id).map(c => ({ valor: c.id, etiqueta: `   ↳ ${c.nombre}` })),
  ]), [at.lugares])
  const reemplaza = ids.filter(id => at.asignaciones[id]).length
  return (
    <Modal titulo={`Asignar a ${ids.length} ${ids.length === 1 ? 'persona' : 'personas'}`} Icono={CalendarClock} onCerrar={onCerrar} ancho={580}
      pie={<><button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button><button type="button" className="pl-btn-save" onClick={() => { at.asignar(ids, { ...d, politicaId: d.politicaId || null, diasOficina: d.modalidad === 'hibrido' ? d.diasOficina : [] }); onListo() }}>Asignar</button></>}>
      <div className="at-modal-campos">
        <div className="at-dos">
          <label className="at-campo"><span>Horario</span><Desplegable valor={d.horarioId} onCambio={v => pon('horarioId', v)} opciones={at.horarios.map(h => ({ valor: h.id, etiqueta: h.nombre }))} ariaLabel="Horario" /></label>
          <label className="at-campo"><span>Lugar de marcación</span><Desplegable valor={d.lugarId} onCambio={v => pon('lugarId', v)} opciones={lugaresOps} ariaLabel="Lugar" conBuscador /></label>
        </div>
        <div className="at-campo"><span>Modalidad</span>
          <div className="at-segmento" role="radiogroup">
            {Object.entries(MODALIDADES).map(([k, m]) => <button key={k} type="button" role="radio" aria-checked={d.modalidad === k} className={d.modalidad === k ? 'on' : ''} onClick={() => pon('modalidad', k)}>{m.label}</button>)}
          </div>
          <span className="at-ayuda">{MODALIDADES[d.modalidad].desc}</span>
        </div>
        {d.modalidad === 'hibrido' && (
          <div className="at-campo"><span>Días de oficina</span>
            <div className="at-semana-chips">
              {[1, 2, 3, 4, 5, 6, 7].map(x => <button key={x} type="button" aria-pressed={d.diasOficina.includes(x)} className={d.diasOficina.includes(x) ? 'on' : ''} onClick={() => pon('diasOficina', d.diasOficina.includes(x) ? d.diasOficina.filter(y => y !== x) : [...d.diasOficina, x].sort())}>{DIAS_CORTOS[x]}</button>)}
            </div>
          </div>
        )}
        <div className="at-dos">
          <label className="at-campo"><span>Política</span><Desplegable valor={d.politicaId} onCambio={v => pon('politicaId', v)} opciones={[{ valor: '', etiqueta: `La de por defecto (${at.politicaDefecto?.nombre})` }, ...at.politicas.map(p => ({ valor: p.id, etiqueta: p.nombre }))]} ariaLabel="Política" /></label>
          <label className="at-campo"><span>Desde</span><input type="date" className="pl-input" value={d.desde} onChange={e => pon('desde', e.target.value)} /></label>
        </div>
        {reemplaza > 0 && <div className="at-aviso-linea"><RotateCcw size={14} /> {reemplaza === ids.length ? 'Todas tienen' : `${reemplaza} tienen`} una asignación vigente: se cierra y se abre esta, en un solo paso.</div>}
      </div>
    </Modal>
  )
}

/* ── BIOMETRÍA ── */
function Biometria() {
  const at = useAsistencia()
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [pag, setPag] = useState(1)
  const lista = filtrar(at.personas, filtro)
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)
  const g = at.ajustesGenerales
  const enrolados = at.personas.filter(p => p.bio?.enrolado).length
  return (
    <>
      <div className="at-config-grid">
        <article className="at-item">
          <div className="at-item-cab"><div><h3 className="at-item-nom"><ScanFace size={16} /> Enrolamiento</h3><div className="at-item-sub">Cada persona registra su rostro una vez, desde la app, después de aceptar el consentimiento.</div></div></div>
          <div className="at-saldo"><b className="pos">{enrolados}</b><span className="dc-muted">de {at.personas.length} enrolados</span></div>
          <div className="at-progreso" style={{ margin: 0 }}><span style={{ width: `${(enrolados / Math.max(1, at.personas.length)) * 100}%` }} /></div>
        </article>
        <article className="at-item">
          <div className="at-item-cab"><div><h3 className="at-item-nom"><ShieldCheck size={16} /> Privacidad</h3><div className="at-item-sub">El servidor nunca compara imágenes: recibe un vector del rostro. La selfie de cada marcación se guarda sólo como evidencia, y se borra sola.</div></div></div>
          <label className="at-campo"><span>Borrar las selfies después de {g.retencionSelfies} días</span>
            <input type="range" className="at-rango" min="30" max="365" step="15" value={g.retencionSelfies} onChange={e => at.setAjustesGenerales({ ...g, retencionSelfies: Number(e.target.value) })} />
          </label>
          <div className="at-item-pie"><span>Consentimiento vigente</span><span className="dc-chip dc-t-gris">versión 2026-08-v1</span></div>
        </article>
      </div>

      <FiltrosOrg valor={filtro} onCambio={v => { setFiltro(v); setPag(1) }} lugares={at.lugares} personas={at.personas} />
      <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
        <table className="as-table at-tabla">
          <thead><tr><th>Colaborador</th><th>Consentimiento</th><th>Rostro registrado</th><th /></tr></thead>
          <tbody>
            {lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(p => {
              const b = p.bio || {}
              return (
                <tr key={p.id} style={{ cursor: 'default' }}>
                  <td><PersonaAt persona={p} size={30} /></td>
                  <td>{b.consentimiento ? <span className="dc-chip dc-t-verde"><CheckCircle2 size={11} /> Aceptó el {fechaCorta(b.consentimiento.aceptado)}</span> : <span className="dc-chip dc-t-ambar"><AlertTriangle size={11} /> Pendiente</span>}</td>
                  <td>
                    {b.reenrolar ? <span className="dc-chip dc-t-violeta"><RotateCcw size={11} /> Pidió volver a enrolarse</span>
                      : b.enrolado ? <span className="dc-chip dc-t-verde"><ScanFace size={11} /> Enrolado el {fechaCorta(b.enrolado)}</span>
                        : <span className="dc-chip dc-t-gris">Sin enrolar</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {b.reenrolar
                      ? <button type="button" className="at-btn-ok" style={{ height: 28 }} onClick={() => at.actualizarBio(p.id, { reenrolar: null, enrolado: null })}><Check size={13} /> Aprobar</button>
                      : b.enrolado
                        ? <button type="button" className="dc-btn dc-btn-sm" onClick={() => at.actualizarBio(p.id, { enrolado: null })} title="Borra su rostro: la próxima vez que marque, se enrola de nuevo"><RotateCcw size={13} /> Pedir nuevo enrolamiento</button>
                        : <span className="dc-muted" style={{ fontSize: 12 }}>Se enrola desde la app</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Paginacion page={pagina} setPage={setPag} total={lista.length} perPage={POR_PAGINA} nombre="personas" nombreUno="persona" />
      </div>
    </>
  )
}
