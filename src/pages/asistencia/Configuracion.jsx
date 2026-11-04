import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, Clock, ScanFace, MapPin, MapPinOff, Building2, Warehouse, Users, AlertTriangle,
  ShieldCheck, House, Laptop, ArrowUpRight, Timer, CalendarClock, RotateCcw, Check, Copy, Coffee, BellRing, Smartphone,
  LayoutGrid, Table2, X,
} from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Modal, Vacio, MenuAcciones } from '../../components/documentacion/comunes'
import Desplegable from '../../components/layout/Desplegable'
import Paginacion from '../../components/layout/Paginacion'
import { PersonaAt, FILTRO_VACIO, filtrar, BarraBusqueda } from '../../components/asistencia/comunes'
import MapaGeocerca from '../../components/asistencia/MapaGeocerca'
import CampoHora from '../../components/asistencia/CampoHora'
import ConfirmarEliminar from '../../components/asistencia/ConfirmarEliminar'
import ModalAsignar from '../../components/asistencia/ModalAsignar'
import Avatar from '../../components/personas/Avatar'
import { MODALIDADES, DIAS_CORTOS, reglasDe, franjaPausa, aMin, hhmm, duracion, minutosProgramados, fechaCorta, horarioDeDia, otrosDias, minutosSemana, franjasPausa } from '../../data/asistenciaData'

/* ── CONFIGURACIÓN DE ASISTENCIA ───────────────────────────────────────────
   Cinco partes, en el orden en que se arma el módulo la primera vez: los HORARIOS (cuándo), las
   POLÍTICAS (qué se exige al marcar), los LUGARES (dónde: la geocerca de cada sucursal y centro de
   trabajo de Organización), las ASIGNACIONES (a quién le toca qué) y la BIOMETRÍA.

   ARRIBA, LA PUESTA A PUNTO: el `readiness` del backend —sin sede, sin horario, sin política,
   consentimiento pendiente— dicho como una lista de lo que falta, con su enlace. */

const SECCIONES = ['horarios', 'modalidades', 'avisos', 'lugares', 'asignaciones']
const COLORES = ['#00B876', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#EF4444', '#0C2D40']

export default function Configuracion() {
  const [params] = useSearchParams()
  /* «politicas» era el nombre de antes: los enlaces viejos abren Modalidades. */
  const pedido = ['politicas', 'reglas'].includes(params.get('ver')) ? 'modalidades' : params.get('ver') === 'biometria' ? 'asignaciones' : params.get('ver')
  const ver = SECCIONES.includes(pedido) ? pedido : 'horarios'

  const titulos = {
    horarios: ['Horarios', 'Cuándo trabaja cada quien. Un horario fijo calcula tardanzas y horas extra; uno flexible sólo pide cumplir la meta del día.'],
    modalidades: ['Modalidades', 'Qué se le pide al colaborador al marcar, según cómo trabaja: presencial, híbrido o remoto.'],
    avisos: ['Avisos al colaborador', 'Qué le avisa la app a cada persona cuando su día sale con una alerta, y cuánto tiempo tiene para mandar su motivo.'],
    lugares: ['Lugares de marcación', 'Las sucursales y los centros de trabajo de Organización, con la geocerca dentro de la cual se puede marcar.'],
    asignaciones: ['Asignaciones', 'Qué horario, qué lugar y qué modalidad tiene cada colaborador, y si registró su rostro. Para asignar a toda una unidad o sucursal, fíltrela y marque la casilla de arriba de la tabla.'],
  }

  return (
    <div className="content-scroll">
      <Cabecera titulo={titulos[ver][0]} sub={titulos[ver][1]} />

      {ver === 'horarios' && <Horarios />}
      {ver === 'modalidades' && <Reglas />}
      {ver === 'avisos' && <Avisos />}
      {ver === 'lugares' && <Lugares />}
      {ver === 'asignaciones' && <Asignaciones />}
    </div>
  )
}

/* ── HORARIOS ── */
/* TARJETAS O TABLA: las tarjetas dibujan el día; la tabla compara los horarios lado a lado. Eliminar
   pide confirmación, como toda acción con consecuencias. */
function Horarios() {
  const at = useAsistencia()
  const [params, setParams] = useSearchParams()
  /* Primero la tabla (se abre así); las tarjetas, la forma gráfica, después. */
  const enTabla = params.get('forma') !== 'tarjetas'
  const ponForma = v => { const n = new URLSearchParams(params); if (v) n.set('forma', v); else n.delete('forma'); setParams(n, { replace: true }) }
  const [editar, setEditar] = useState(null)
  const [borrar, setBorrar] = useState(null)
  const [duplicar, setDuplicar] = useState(null)
  const uso = id => Object.values(at.asignaciones).filter(a => a?.horarioId === id).length
  const acciones = (h, n, fr) => [
    { label: 'Editar', Icono: Pencil, onClick: () => setEditar({ ...h, conPausa: !!fr, pausaDesde: fr ? hhmm(fr.desde) : '13:00', pausaHasta: fr ? hhmm(fr.hasta) : '14:00' }) },
    { label: 'Duplicar', Icono: Copy, onClick: () => setDuplicar({ h, nombre: `${h.nombre} (copia)` }) },
    { label: 'Eliminar', Icono: Trash2, peligro: true, disabled: n > 0, titulo: n > 0 ? 'Está asignado a colaboradores: reasígnelos primero' : undefined, onClick: () => setBorrar(h) },
  ]
  return (
    <>
      <div className="at-hor-barra">
        <div className="at-segmento at-modo" role="tablist" aria-label="Forma de ver">
          <button type="button" role="tab" aria-selected={enTabla} aria-label="Tabla" title="Tabla" className={enTabla ? 'on' : ''} onClick={() => ponForma(null)}><Table2 size={15} aria-hidden="true" /></button>
          <button type="button" role="tab" aria-selected={!enTabla} aria-label="Tarjetas" title="Tarjetas" className={!enTabla ? 'on' : ''} onClick={() => ponForma('tarjetas')}><LayoutGrid size={15} aria-hidden="true" /></button>
        </div>
        <button type="button" className="pl-btn-new" onClick={() => setEditar({ id: null, nombre: '', modo: 'fijo', dias: [1, 2, 3, 4, 5, 6], entrada: '08:30', salida: '18:00', descansos: [{ desde: '13:00', hasta: '14:00' }], porDia: { 6: { entrada: '08:30', salida: '12:30', descansos: [] } }, conPausa: true, pausaDesde: '13:00', pausaHasta: '14:00', meta: 480, color: COLORES[at.horarios.length % COLORES.length] })}><Plus size={14} /> Nuevo horario</button>
      </div>
      {enTabla ? (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table at-tabla at-tabla-sol at-hor-tabla">
            <thead><tr><th>Horario</th><th>Entrada y salida</th><th>Descansos</th><th>Días</th><th className="r">Al día</th><th className="r">A la semana</th><th className="r">Colaboradores</th><th aria-label="Acciones" /></tr></thead>
            <tbody>
              {at.horarios.map(h => {
                const n = uso(h.id)
                const fr = franjaPausa(h)
                const dia = minutosProgramados(h)
                return (
                  <tr key={h.id}>
                    <td><span className="at-hor-nom"><span className="at-item-color" style={{ background: h.color }} /><b>{h.nombre}</b>{h.modo === 'flexible' && <span className="dc-chip dc-chip-sm dc-t-violeta">Flexible</span>}</span></td>
                    <td className="num">{h.modo === 'fijo' ? <>{h.entrada} a {h.salida}{otrosDias(h).map(t => <small key={t} className="at-hor-otro">{t}</small>)}<small className="at-hor-otro">{reglasDe(h).tolerancia} min de tolerancia</small></> : <span className="dc-muted">Libre{h.ventanaDesde ? ` · ${h.ventanaDesde} a ${h.ventanaHasta}` : ''}{otrosDias(h).map(t => <small key={t} className="at-hor-otro">{t}</small>)}</span>}</td>
                    <td className="num">{h.modo === 'fijo' ? (fr ? franjasPausa(h).map(x => <span key={x.desde} style={{ display: 'block' }}>{hhmm(x.desde)} a {hhmm(x.hasta)}</span>) : <span className="dc-muted">Sin descanso</span>) : '—'}</td>
                    <td><span className="at-semana-chips at-semana-chips-sm">{[1, 2, 3, 4, 5, 6, 7].map(d => <span key={d} className={h.dias.includes(d) ? 'on' : ''}>{DIAS_CORTOS[d].slice(0, 2)}</span>)}</span></td>
                    <td className="num r">{duracion(dia)}</td>
                    <td className="num r">{duracion(minutosSemana(h))}</td>
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
                  <div className="at-item-sub">{h.modo === 'fijo' ? `${h.entrada} a ${h.salida}${fr ? ` · ${franjasPausa(h).length > 1 ? 'descansos' : 'descanso'} ${franjasPausa(h).map(x => `de ${hhmm(x.desde)} a ${hhmm(x.hasta)}`).join(' y ')}` : ' · sin descanso'}${otrosDias(h).length ? ` · ${otrosDias(h).join(' · ')}` : ''}` : `Meta de ${duracion(h.meta)} al día, a la hora que quiera`}</div>
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
                <span>{duracion(minutosProgramados(h))} al día · {duracion(minutosSemana(h))} a la semana</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Users size={13} /> {n} {n === 1 ? 'colaborador' : 'colaboradores'}</span>
              </div>
            </article>
          )
        })}
      </div>
      )}
      {editar && <ModalHorario inicial={editar} onCerrar={() => setEditar(null)} />}
      {/* Duplicar también se confirma: se elige el nombre de la copia antes de crearla. */}
      {duplicar && (
        <Modal titulo="Duplicar horario" Icono={Copy} onCerrar={() => setDuplicar(null)} ancho={480}
          pie={<><button type="button" className="pl-btn-cancel" onClick={() => setDuplicar(null)}>Cancelar</button><button type="button" className="pl-btn-save" disabled={!duplicar.nombre.trim()} onClick={() => { at.setHorarios(prev => [...prev, { ...duplicar.h, id: `h-${Date.now().toString(36)}`, nombre: duplicar.nombre.trim() }]); setDuplicar(null) }}>Sí, duplicar</button></>}>
          <p style={{ margin: '0 0 12px', lineHeight: 1.55 }}>Se crea un horario nuevo igual a <b>{duplicar.h.nombre}</b>, sin colaboradores asignados. Después puede cambiarle los días o las horas.</p>
          <label className="at-campo"><span>Nombre de la copia</span><input className="pl-input" value={duplicar.nombre} onChange={e => setDuplicar({ ...duplicar, nombre: e.target.value })} autoFocus /></label>
        </Modal>
      )}
      {borrar && (
        <ConfirmarEliminar que="horario" nombre={borrar.nombre} onCerrar={() => setBorrar(null)} onConfirmar={() => at.setHorarios(prev => prev.filter(x => x.id !== borrar.id))}
          texto="No se puede deshacer. Nadie lo tiene asignado, así que ningún colaborador cambia de jornada, y las jornadas que ya pasaron quedan como están." />
      )}
    </>
  )
}

const DIAS_LARGOS_CAP = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const SEMANA = [1, 2, 3, 4, 5, 6, 7]
const ESCALA_H = [6 * 60, 22 * 60]
const enEscala = m => Math.max(0, Math.min(100, ((m - ESCALA_H[0]) / (ESCALA_H[1] - ESCALA_H[0])) * 100))
const descansoNuevo = (fila, k) => {
  const e = aMin(fila.entrada); const s = aMin(fila.salida)
  if (k === 0 && s - e <= 300) { const d = e + Math.round((s - e) / 2 / 15) * 15; return { desde: hhmm(d), hasta: hhmm(d + 15) } }
  if (k === 0) { const d = Math.max(e + 60, Math.min(13 * 60, s - 90)); return { desde: hhmm(d), hasta: hhmm(d + 60) } }
  const d = Math.max(e + 60, Math.min(16 * 60, s - 45)); return { desde: hhmm(d), hasta: hhmm(d + 15) }
}

/* ── LA VENTANA DEL HORARIO (Ronda 19 · X1) ─────────────────────────────────
   Ancha: a la izquierda un renglón por día, de lunes a domingo —si trabaja, su entrada y su salida,
   sus descansos (hasta dos) como etiquetas que se tocan para editarlas y
   sus horas—; a la derecha, la semana dibujada. Un horario nuevo arranca de lunes a sábado, con el
   sábado más corto; cada empresa lo cambia.

   Se guarda con el modelo de siempre: el día más repetido es la base y los demás van en `porDia`, cada
   uno con sus `descansos`. */
function ModalHorario({ inicial, onCerrar }) {
  const at = useAsistencia()
  const [h, setH] = useState(inicial)
  const pon = (k, v) => setH(prev => ({ ...prev, [k]: v }))
  /* CÓMO SE CUENTA: las tolerancias, el descanso sin marcar y el redondeo son del horario. */
  const reglas = reglasDe(h)
  const ponRegla = (k, v) => pon(k, v)

  const [filas, setFilas] = useState(() => Object.fromEntries(SEMANA.map(d => {
    const hd = inicial.modo === 'fijo' ? horarioDeDia(inicial, d) : inicial
    const descansos = inicial.modo === 'fijo' ? franjasPausa(hd).map(f => ({ desde: hhmm(f.desde), hasta: hhmm(f.hasta) })) : []
    const meta = (inicial.modo === 'flexible' ? horarioDeDia(inicial, d).meta : inicial.meta) || 480
    return [d, { on: inicial.dias.includes(d), entrada: hd.entrada || '08:30', salida: hd.salida || '18:00', descansos, meta }]
  })))
  const [editando, setEditando] = useState(null) // { d, k, top, left }
  const abrirEn = (d, k, el) => { const r = el.getBoundingClientRect(); setEditando({ d, k, top: r.bottom + 10, left: Math.min(r.left, window.innerWidth - 330), flecha: Math.max(16, Math.min(r.left - Math.min(r.left, window.innerWidth - 330) + 20, 290)) }) }
  const ponFila = (d, cambios) => setFilas(prev => ({ ...prev, [d]: { ...prev[d], ...cambios } }))
  const ponDescanso = (d, k, cambios) => setFilas(prev => ({ ...prev, [d]: { ...prev[d], descansos: prev[d].descansos.map((x, i) => (i === k ? { ...x, ...cambios } : x)) } }))
  const agregarDescanso = (d, el) => { const k = filas[d].descansos.length; ponFila(d, { descansos: [...filas[d].descansos, descansoNuevo(filas[d], k)] }); abrirEn(d, k, el) }
  const quitarDescanso = (d, k) => { ponFila(d, { descansos: filas[d].descansos.filter((_, i) => i !== k) }); setEditando(null) }
  const copiar = (de, a) => setFilas(prev => Object.fromEntries(SEMANA.map(d => [d, a.includes(d) && d !== de ? { ...prev[d], on: true, entrada: prev[de].entrada, salida: prev[de].salida, descansos: prev[de].descansos.map(x => ({ ...x })) } : prev[d]])))
  const activos = SEMANA.filter(d => filas[d].on)

  /* Qué está mal en un día: la salida antes de la entrada, o un descanso fuera de la jornada, al revés
     o encimado con el otro. */
  const errorDe = d => {
    const f = filas[d]; const e = aMin(f.entrada); const s = aMin(f.salida)
    if (s <= e) return 'La salida es antes que la entrada'
    const ds = f.descansos.map(x => [aMin(x.desde), aMin(x.hasta)]).sort((a, b) => a[0] - b[0])
    if (ds.some(([a, b]) => b <= a)) return 'Un descanso termina antes de empezar'
    if (ds.some(([a, b]) => a <= e || b >= s)) return 'Un descanso cae fuera de la jornada'
    if (ds.length === 2 && ds[1][0] < ds[0][1]) return 'Los dos descansos se pisan'
    return null
  }
  const minutosDe = d => { const f = filas[d]; return Math.max(0, aMin(f.salida) - aMin(f.entrada) - f.descansos.reduce((t, x) => t + Math.max(0, aMin(x.hasta) - aMin(x.desde)), 0)) }
  const conError = activos.filter(errorDe)
  const semanaMin = activos.reduce((t, d) => t + minutosDe(d), 0)

  const armar = () => {
    if (h.modo === 'flexible') {
      /* La meta más repetida es la del horario; los días distintos van en `metaPorDia`. */
      const cuentaM = {}
      activos.forEach(d => { cuentaM[filas[d].meta] = (cuentaM[filas[d].meta] || 0) + 1 })
      const meta = Number([...activos].sort((a, b) => cuentaM[filas[b].meta] - cuentaM[filas[a].meta]).map(d => filas[d].meta)[0]) || 480
      const metaPorDia = Object.fromEntries(activos.filter(d => filas[d].meta !== meta).map(d => [d, filas[d].meta]))
      return { ...h, dias: activos, meta, metaPorDia, porDia: {}, descansos: [], pausa: 0, pausaDesde: null, pausaHasta: null, ventanaDesde: h.ventanaDesde || '07:00', ventanaHasta: h.ventanaHasta || '20:00' }
    }
    const clave = d => JSON.stringify([filas[d].entrada, filas[d].salida, filas[d].descansos.map(x => [x.desde, x.hasta])])
    const cuenta = {}
    activos.forEach(d => { cuenta[clave(d)] = (cuenta[clave(d)] || 0) + 1 })
    const baseDia = [...activos].sort((a, b) => cuenta[clave(b)] - cuenta[clave(a)])[0]
    const base = filas[baseDia]
    const primero = base.descansos[0]
    const porDia = Object.fromEntries(activos.filter(d => clave(d) !== clave(baseDia)).map(d => [d, { entrada: filas[d].entrada, salida: filas[d].salida, descansos: filas[d].descansos.map(x => ({ ...x })) }]))
    return {
      ...h, ...reglasDe(h), dias: activos, entrada: base.entrada, salida: base.salida, descansos: base.descansos.map(x => ({ ...x })), porDia,
      pausa: primero ? aMin(primero.hasta) - aMin(primero.desde) : 0, pausaDesde: primero?.desde || null, pausaHasta: primero?.hasta || null,
    }
  }
  const ventanaMal = h.modo === 'flexible' && aMin(h.ventanaHasta || '20:00') <= aMin(h.ventanaDesde || '07:00')
  const valido = h.nombre.trim() && (h.modo === 'flexible' ? activos.length && !ventanaMal : activos.length && !conError.length)
  const guardar = () => {
    const { conPausa, ...resto } = armar() // eslint-disable-line no-unused-vars
    const limpio = { ...resto, nombre: h.nombre.trim(), meta: Number(h.meta) || 0 }
    if (h.id) at.setHorarios(prev => prev.map(x => (x.id === h.id ? limpio : x)))
    else at.setHorarios(prev => [...prev, { ...limpio, id: `h-${Date.now().toString(36)}` }])
    onCerrar()
  }

  const grupos = []
  activos.forEach(d => { const m = minutosDe(d); const g = grupos.find(x => x.m === m); if (g) g.dias.push(d); else grupos.push({ m, dias: [d] }) })
  const nombreDias = ds => (ds.join() === '1,2,3,4,5' ? 'lunes a viernes' : ds.join() === '1,2,3,4,5,6' ? 'lunes a sábado' : ds.map(d => DIAS_LARGOS_CAP[d].toLowerCase()).join(', '))
  const libres = SEMANA.filter(d => !filas[d].on)
  const primero = activos[0]

  return (
    <Modal titulo={h.id ? 'Editar horario' : 'Nuevo horario'} Icono={Clock} onCerrar={onCerrar} ancho={1080}
      pie={<><button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button><button type="button" className="pl-btn-save" disabled={!valido} onClick={guardar}>Guardar horario</button></>}>
      <div className="at-modal-campos">
        <div className="at-hz-cab">
          <label className="at-campo"><span>Nombre</span><input className="pl-input" value={h.nombre} onChange={e => pon('nombre', e.target.value)} placeholder="Ej.: Turno tarde de tienda" autoFocus /></label>
          <div className="at-campo"><span>Tipo</span>
            <div className="at-segmento" role="radiogroup">
              <button type="button" role="radio" aria-checked={h.modo === 'fijo'} className={h.modo === 'fijo' ? 'on' : ''} onClick={() => pon('modo', 'fijo')}>Fijo</button>
              <button type="button" role="radio" aria-checked={h.modo === 'flexible'} className={h.modo === 'flexible' ? 'on' : ''} onClick={() => pon('modo', 'flexible')}>Flexible</button>
            </div>
          </div>
          <div className="at-campo"><span>Color</span>
            <div style={{ display: 'flex', gap: 7, height: 40, alignItems: 'center' }}>
              {COLORES.map(c => <button key={c} type="button" aria-label={`Color ${c}`} aria-pressed={h.color === c} onClick={() => pon('color', c)} style={{ width: 24, height: 24, borderRadius: 7, border: 'none', background: c, cursor: 'pointer', boxShadow: h.color === c ? '0 0 0 2px var(--surface-card), 0 0 0 4px var(--text-heading)' : 'none' }} />)}
            </div>
          </div>
        </div>

        {h.modo === 'fijo' ? (
          <>
            <div className="at-hz-lado">
              <div className="at-hz-filas">
                {SEMANA.map(d => {
                  const f = filas[d]
                  const err = f.on ? errorDe(d) : null
                  const ed = editando?.d === d ? editando.k : null
                  return (
                    <div key={d} className={`at-hz-fila${f.on ? '' : ' off'}${err ? ' mal' : ''}`}>
                      <button type="button" role="switch" aria-checked={f.on} aria-label={`${DIAS_LARGOS_CAP[d]}: ${f.on ? 'trabaja' : 'no trabaja'}`} className={`at-switch at-switch-sm${f.on ? ' on' : ''}`} onClick={() => { ponFila(d, { on: !f.on }); setEditando(null) }} />
                      <b title={DIAS_LARGOS_CAP[d]}>{DIAS_CORTOS[d]}</b>
                      {f.on ? (
                        <>
                          <CampoHora ariaLabel={`Entrada del ${DIAS_LARGOS_CAP[d].toLowerCase()}`} value={f.entrada} onChange={v => ponFila(d, { entrada: v })} />
                          <CampoHora ariaLabel={`Salida del ${DIAS_LARGOS_CAP[d].toLowerCase()}`} value={f.salida} onChange={v => ponFila(d, { salida: v })} />
                          <div className="at-hz-paus">
                            {f.descansos.map((x, k) => (
                              <button key={k} type="button" className={`at-hz-pau${ed === k ? ' on' : ''}`} onClick={e => (ed === k ? setEditando(null) : abrirEn(d, k, e.currentTarget))} title="Editar el descanso"><Coffee size={12} aria-hidden="true" /> {x.desde}–{x.hasta}</button>
                            ))}
                            {f.descansos.length < 2 && <button type="button" className="at-hz-pau add" onClick={e => agregarDescanso(d, e.currentTarget)}><Plus size={12} aria-hidden="true" /> descanso</button>}
                          </div>
                          <span className="at-hz-h">{err ? '—' : duracion(minutosDe(d), { corto: true })}</span>
                          <MenuAcciones etiqueta={`Copiar el ${DIAS_LARGOS_CAP[d].toLowerCase()}`} items={[
                            { label: 'Copiar a todos los días de trabajo', Icono: Copy, onClick: () => copiar(d, activos) },
                            { label: 'Copiar de lunes a viernes', Icono: Copy, onClick: () => copiar(d, [1, 2, 3, 4, 5]) },
                            ...libres.map(l => ({ label: `Copiar al ${DIAS_LARGOS_CAP[l].toLowerCase()}`, Icono: Plus, onClick: () => copiar(d, [l]) })),
                          ]} />
                          {err && <span className="at-hz-err"><AlertTriangle size={12} aria-hidden="true" /> {err}</span>}
                        </>
                      ) : (
                        <><span className="at-hz-libre">Día de descanso</span><span className="at-hz-h">—</span><span /></>
                      )}
                    </div>
                  )
                })}
                <span className="at-ayuda" style={{ margin: '2px 4px 0', fontSize: 12 }}>Hasta dos descansos por día. Toque uno para cambiarlo; ⋯ copia el día a otros.</span>
              </div>

              {/* LA SEMANA DIBUJADA: un bloque por día en el color del horario y los descansos rayados. */}
              <div className="at-hz-semana" aria-hidden="true">
                <span className="at-hz-rot">Así queda su semana</span>
                <div className="at-hz-cal">
                  <div className="at-hz-horas">{[6, 9, 12, 15, 18, 21].map(x => <span key={x} style={{ top: `${enEscala(x * 60)}%` }}>{String(x).padStart(2, '0')}</span>)}</div>
                  {SEMANA.map(d => {
                    const f = filas[d]; const ok = f.on && !errorDe(d)
                    return (
                      <div key={d} className={`at-hz-col${f.on ? '' : ' libre'}`}>
                        <b>{DIAS_CORTOS[d]}</b>
                        <div className="at-hz-pista">
                          {ok && <i className="t" style={{ top: `${enEscala(aMin(f.entrada))}%`, height: `${enEscala(aMin(f.salida)) - enEscala(aMin(f.entrada))}%`, background: h.color }} />}
                          {ok && f.descansos.map((x, k) => <i key={k} className="p" style={{ top: `${enEscala(aMin(x.desde))}%`, height: `${Math.max(1.2, enEscala(aMin(x.hasta)) - enEscala(aMin(x.desde)))}%` }} />)}
                          {!f.on && <em>Libre</em>}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="at-hz-ley"><span><i style={{ background: h.color }} />Trabaja</span><span><i className="p" />Descanso</span></div>
              </div>
            </div>

            {/* CÓMO SE CUENTA (lo que antes era la política): tolerancias, descanso sin marcar y redondeo. */}
            <div className="at-hz-cuenta">
              <span className="at-hz-rot">Tolerancias</span>
              <div className="at-hz-tols">
                {[['tolerancia', 'Tolerancia de entrada', primero ? `Atraso desde las ${hhmm(aMin(filas[primero].entrada) + reglas.tolerancia)}` : ''], ['toleranciaPausa', 'Tolerancia del descanso', 'Al salir, al volver o al excederse'], ['toleranciaSalida', 'Tolerancia de salida', primero ? `Salida anticipada antes de las ${hhmm(aMin(filas[primero].salida) - reglas.toleranciaSalida)}` : '']].map(([k, t, ayuda]) => (
                  <div key={k} className="at-hz-tol">
                    <small>{t}</small>
                    <span className="at-hz-step">
                      <button type="button" aria-label={`Menos ${t.toLowerCase()}`} disabled={reglas[k] <= 0} onClick={() => ponRegla(k, Math.max(0, reglas[k] - 1))}>−</button>
                      <span>{reglas[k]} min</span>
                      <button type="button" aria-label={`Más ${t.toLowerCase()}`} disabled={reglas[k] >= 60} onClick={() => ponRegla(k, Math.min(60, reglas[k] + 1))}>+</button>
                    </span>
                    <em>{ayuda}</em>
                  </div>
                ))}
              </div>
            </div>
            {activos.length > 0 && !conError.length && (
              <div className="at-hz-tot">
                <span><b>{activos.length}</b> {activos.length === 1 ? 'día' : 'días'} de trabajo{libres.length ? <> · descansa {libres.map(d => DIAS_LARGOS_CAP[d].toLowerCase()).join(' y ')}</> : ''}</span>
                {grupos.map(g => <span key={g.m}><b>{duracion(g.m, { corto: true })}</b> {nombreDias(g.dias)}</span>)}
                <span><b>{duracion(semanaMin, { corto: true })}</b> a la semana</span>
              </div>
            )}
          </>
        ) : (
          <>
            {/* FLEXIBLE (Ronda 21 · G1): los mismos renglones, con la meta de horas de cada día. */}
            <div className="at-hz-lado">
              <div className="at-hz-filas flex">
                {SEMANA.map(d => {
                  const f = filas[d]
                  return (
                    <div key={d} className={`at-hz-fila flex${f.on ? '' : ' off'}`}>
                      <button type="button" role="switch" aria-checked={f.on} aria-label={`${DIAS_LARGOS_CAP[d]}: ${f.on ? 'trabaja' : 'no trabaja'}`} className={`at-switch at-switch-sm${f.on ? ' on' : ''}`} onClick={() => ponFila(d, { on: !f.on })} />
                      <b title={DIAS_LARGOS_CAP[d]}>{DIAS_CORTOS[d]}</b>
                      {f.on ? (
                        <>
                          <span className="at-hz-step">
                            <button type="button" aria-label={`Menos horas el ${DIAS_LARGOS_CAP[d].toLowerCase()}`} disabled={f.meta <= 30} onClick={() => ponFila(d, { meta: Math.max(30, f.meta - 30) })}>−</button>
                            <span>{duracion(f.meta)}</span>
                            <button type="button" aria-label={`Más horas el ${DIAS_LARGOS_CAP[d].toLowerCase()}`} disabled={f.meta >= 720} onClick={() => ponFila(d, { meta: Math.min(720, f.meta + 30) })}>+</button>
                          </span>
                          <div className="at-hz-barra" aria-hidden="true"><i className="trab" style={{ left: 0, width: `${(f.meta / 720) * 100}%`, background: h.color }} /></div>
                          <span className="at-hz-h">{duracion(f.meta, { corto: true })}</span>
                          <MenuAcciones etiqueta={`Copiar el ${DIAS_LARGOS_CAP[d].toLowerCase()}`} items={[
                            { label: 'Copiar a todos los días de trabajo', Icono: Copy, onClick: () => setFilas(prev => Object.fromEntries(SEMANA.map(x => [x, prev[x].on ? { ...prev[x], meta: prev[d].meta } : prev[x]]))) },
                            { label: 'Copiar de lunes a viernes', Icono: Copy, onClick: () => setFilas(prev => Object.fromEntries(SEMANA.map(x => [x, x <= 5 ? { ...prev[x], on: true, meta: prev[d].meta } : prev[x]]))) },
                          ]} />
                        </>
                      ) : (
                        <><span className="at-hz-libre">Día de descanso</span><span className="at-hz-h">—</span><span /></>
                      )}
                    </div>
                  )
                })}
                <div className="at-hz-ventana">
                  <span className="at-hz-rot">Cuándo puede marcar</span>
                  <span style={{ width: 110 }}><CampoHora ariaLabel="Puede marcar desde" value={h.ventanaDesde || '07:00'} onChange={v => pon('ventanaDesde', v)} /></span>
                  <span>a</span>
                  <span style={{ width: 110 }}><CampoHora ariaLabel="Puede marcar hasta" value={h.ventanaHasta || '20:00'} onChange={v => pon('ventanaHasta', v)} /></span>
                  <small>{ventanaMal ? 'El «hasta» tiene que ser después del «desde».' : 'Fuera de esa franja, la marca queda como fuera de horario.'}</small>
                </div>
              </div>

              <div className="at-hz-semana" aria-hidden="true">
                <span className="at-hz-rot">Así queda su semana</span>
                <div className="at-hz-metas">
                  {SEMANA.map(d => {
                    const f = filas[d]
                    return (
                      <div key={d} className={`at-hz-mc${f.on ? '' : ' libre'}`}>
                        <div className="at-hz-mp">{f.on ? <i style={{ height: `${(f.meta / 720) * 100}%`, background: h.color }}><small>{duracion(f.meta, { corto: true })}</small></i> : <em>Libre</em>}</div>
                        <b>{DIAS_CORTOS[d]}</b>
                      </div>
                    )
                  })}
                </div>
                <div className="at-hz-chipventana">Puede marcar entre <b>{h.ventanaDesde || '07:00'}</b> y <b>{h.ventanaHasta || '20:00'}</b></div>
                <div className="at-hz-notaflex">Sin tardanzas: no tiene hora de entrada. Cuenta que cumpla la meta de cada día.</div>
              </div>
            </div>
            {activos.length > 0 && (
              <div className="at-hz-tot">
                <span><b>{activos.length}</b> {activos.length === 1 ? 'día' : 'días'} de trabajo{libres.length ? <> · descansa {libres.map(d => DIAS_LARGOS_CAP[d].toLowerCase()).join(' y ')}</> : ''}</span>
                {(() => { const gs = []; activos.forEach(d => { const g = gs.find(x => x.m === filas[d].meta); if (g) g.dias.push(d); else gs.push({ m: filas[d].meta, dias: [d] }) }); return gs.map(g => <span key={g.m}><b>{duracion(g.m, { corto: true })}</b> {nombreDias(g.dias)}</span>) })()}
                <span><b>{duracion(activos.reduce((t, d) => t + filas[d].meta, 0), { corto: true })}</b> a la semana</span>
              </div>
            )}
          </>
        )}
      </div>
      {editando && filas[editando.d]?.descansos[editando.k] && (
        <TarjetaDescanso pos={editando} fila={filas[editando.d]} k={editando.k} color={h.color}
          onCambio={c => ponDescanso(editando.d, editando.k, c)} onQuitar={() => quitarDescanso(editando.d, editando.k)} onCerrar={() => setEditando(null)} />
      )}
    </Modal>
  )
}

/* LA TARJETA DE UN DESCANSO (Ronda 20 · E2): flota sobre su etiqueta. Desde → hasta en grande,
   duraciones rápidas que calculan el «hasta», y la barra del día con dónde cae (el que se edita, en
   oscuro). Se cierra con Listo, con la ✕, con Escape o tocando afuera. */
const DURACIONES = [15, 30, 45, 60]
function TarjetaDescanso({ pos, fila, k, color, onCambio, onQuitar, onCerrar }) {
  const ref = useRef(null)
  useEffect(() => {
    const fuera = e => { if (ref.current && !ref.current.contains(e.target) && !e.target.closest?.('.at-hz-pau')) onCerrar() }
    const tecla = e => { if (e.key === 'Escape') { e.stopPropagation(); onCerrar() } }
    document.addEventListener('mousedown', fuera); document.addEventListener('keydown', tecla, true)
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', tecla, true) }
  }, [onCerrar])
  const x = fila.descansos[k]
  const dura = Math.max(0, aMin(x.hasta) - aMin(x.desde))
  const e = aMin(fila.entrada); const s = aMin(fila.salida)
  const alto = window.innerHeight - pos.top < 300
  const titulo = fila.descansos.length > 1 ? (k === 0 ? 'Primer descanso' : 'Segundo descanso') : 'Descanso'
  return createPortal(
    <div ref={ref} className={`at-tdes${alto ? ' arriba' : ''}`} role="dialog" aria-label={titulo}
      style={alto ? { bottom: window.innerHeight - pos.top + 52, left: pos.left, '--flecha': `${pos.flecha}px` } : { top: pos.top, left: pos.left, '--flecha': `${pos.flecha}px` }}>
      <div className="at-tdes-cab"><b>{titulo}</b><button type="button" aria-label="Cerrar" onClick={onCerrar}><X size={15} /></button></div>
      <div className="at-tdes-horas">
        <label>Desde<CampoHora ariaLabel="Desde" value={x.desde} onChange={v => onCambio({ desde: v, hasta: hhmm(aMin(v) + (dura || 15))  })} autoFocus grande /></label>
        <span aria-hidden="true">→</span>
        <label>Hasta<CampoHora ariaLabel="Hasta" grande value={x.hasta} onChange={v => onCambio({ hasta: v })} /></label>
      </div>
      <div className="at-tdes-dur"><span>Dura</span>
        {DURACIONES.map(m => <button key={m} type="button" className={dura === m ? 'on' : ''} aria-pressed={dura === m} onClick={() => onCambio({ hasta: hhmm(aMin(x.desde) + m) })}>{m === 60 ? '1 h' : `${m} min`}</button>)}
        {!DURACIONES.includes(dura) && dura > 0 && <em>{duracion(dura)}</em>}
      </div>
      <div className="at-tdes-barra" aria-hidden="true">
        {s > e && <i className="t" style={{ left: `${enEscala(e)}%`, width: `${enEscala(s) - enEscala(e)}%`, background: color }} />}
        {fila.descansos.map((y, i) => <i key={i} className={i === k ? 'yo' : 'otro'} style={{ left: `${enEscala(aMin(y.desde))}%`, width: `${Math.max(1.5, enEscala(aMin(y.hasta)) - enEscala(aMin(y.desde)))}%` }} />)}
        <small style={{ left: `${enEscala(e)}%` }}>{fila.entrada}</small><small style={{ left: `${enEscala(s)}%` }}>{fila.salida}</small>
      </div>
      <div className="at-tdes-pie">
        <button type="button" className="quitar" onClick={onQuitar}><Trash2 size={13} aria-hidden="true" /> Quitar descanso</button>
        <button type="button" className="pl-btn-save" style={{ height: 34 }} onClick={onCerrar}>Listo</button>
      </div>
    </div>,
    document.body,
  )
}

/* ── MODALIDADES ───────────────────────────────────────────────────────────
   Antes eran «Políticas de marcación»: una lista de reglas para asignar a cada persona. Ahora es una sola página,
   más sencilla: qué se le pide al marcar, según cómo trabaja —presencial, remoto o híbrido—, y el
   parecido mínimo del rostro. Las tolerancias, qué pasa si no marca el descanso y el redondeo son de
   cada horario. */
const MODOS = [
  { k: 'presencial', Icono: MapPin, titulo: 'Presencial', sub: 'Marca en su sucursal o centro de trabajo.', lugar: 'Estar en su lugar', lugarTxt: 'Dentro de la geocerca de su lugar. Si no, la marcación se rechaza.' },
  { k: 'hibrido', Icono: Laptop, titulo: 'Híbrido', sub: 'Unos días en la oficina y otros desde casa.', lugar: 'Estar en su lugar los días de oficina', lugarTxt: 'Los otros días marca desde donde esté.' },
  { k: 'remoto', Icono: House, titulo: 'Remoto', sub: 'Trabaja desde casa o donde esté.', lugar: null, lugarTxt: 'Marca desde donde esté: la ubicación se guarda, pero no bloquea.' },
]
function Reglas() {
  const at = useAsistencia()
  const g = at.ajustesGenerales
  const m = g.marcacion
  const pon = (modo, cambios) => at.setAjustesGenerales({ ...g, marcacion: { ...m, [modo]: { ...m[modo], ...cambios } } })
  const cuantos = k => at.personas.filter(p => p.asig?.modalidad === k).length
  const [, setParams] = useSearchParams()
  return (
    <>
      <div className="at-reglas-modos">
        {MODOS.map(({ k, Icono, titulo, sub, lugar, lugarTxt }) => (
          <article key={k} className="at-regla-modo">
            <div className="at-regla-cab">
              <span className="ico"><Icono size={18} /></span>
              <div><b>{titulo}</b><small>{sub}</small></div>
              <span className="n"><Users size={13} /> {cuantos(k)}</span>
            </div>
            <Interruptor on={m[k].rostro} onCambio={v => pon(k, { rostro: v })} titulo="Pedir el rostro" texto={m[k].rostro ? 'Una selfie que se parezca a su rostro registrado.' : 'Cualquiera con su sesión abierta podría marcar por él.'} />
            {lugar
              ? <Interruptor on={m[k].lugar} onCambio={v => pon(k, { lugar: v })} titulo={lugar} texto={m[k].lugar ? lugarTxt : 'La ubicación se guarda, pero no bloquea.'} />
              : <div className="at-regla-fijo"><MapPinOff size={15} /> {lugarTxt}</div>}
          </article>
        ))}
      </div>

      <section className="at-card at-regla-parecido">
        <div className="at-regla-cab">
          <span className="ico"><ScanFace size={18} /></span>
          <div><b>Parecido mínimo del rostro</b><small>Para todos los que marcan con rostro.</small></div>
          <span className="valor">{Math.round(m.umbral * 100)} %</span>
        </div>
        <input type="range" className="at-rango" min="60" max="95" step="1" value={Math.round(m.umbral * 100)} onChange={e => at.setAjustesGenerales({ ...g, marcacion: { ...m, umbral: Number(e.target.value) / 100 } })} aria-label="Parecido mínimo del rostro" />
        <div className="at-regla-ext"><span>60 % · menos rechazos</span><span>95 % · más seguro</span></div>
        <div className="at-regla-priv">
          <span><b>{at.personas.filter(p => p.bio?.enrolado).length}</b> de {at.personas.length} registraron su rostro · <b>{at.personas.filter(p => !p.bio?.consentimiento).length}</b> sin aceptar el consentimiento <button type="button" className="at-link-inline" onClick={() => setParams({ ver: 'asignaciones' }, { replace: true })}>Ver en Asignaciones</button></span>
        </div>
        <p className="at-ayuda" style={{ margin: 0 }}>Con {Math.round(m.umbral * 100)} %, una selfie con poca luz suele pasar; una con el rostro tapado se rechaza y queda en el Libro como marcación rechazada. Nunca baja de 60 %: con menos, el rostro deja de comprobarse.</p>
      </section>

      <section className="at-card at-regla-parecido">
        <div className="at-regla-cab">
          <span className="ico"><ShieldCheck size={18} /></span>
          <div><b>Privacidad del rostro</b><small>El sistema no guarda la foto del rostro: guarda una huella en números. La selfie de cada marcación es solo evidencia y se borra sola.</small></div>
          <span className="valor">{g.retencionSelfies} días</span>
        </div>
        <input type="range" className="at-rango" min="30" max="365" step="15" value={g.retencionSelfies} onChange={e => at.setAjustesGenerales({ ...g, retencionSelfies: Number(e.target.value) })} aria-label="Días que se guardan las selfies" />
        <div className="at-regla-ext"><span>Borrar las selfies después de {g.retencionSelfies} días</span><span>Consentimiento vigente: versión 2026-08-v1</span></div>
      </section>

      <div className="at-aviso-linea" style={{ alignItems: 'flex-start', lineHeight: 1.5 }}>
        <Timer size={14} style={{ flexShrink: 0, marginTop: 3 }} />
        <span>Las <b>tolerancias</b> de entrada, descanso y salida están en cada horario. El horario flexible nunca pide estar en el lugar. {' '}
          <button type="button" onClick={() => setParams({ ver: 'horarios' }, { replace: true })} style={{ border: 'none', background: 'none', padding: 0, font: 'inherit', fontWeight: 600, color: 'var(--text-heading)', textDecoration: 'underline', cursor: 'pointer' }}>Ir a Horarios</button>
        </span>
      </div>
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
  /* Qué mostrar: todos, los que no tienen horario o los que no registraron su rostro. */
  const [mostrar, setMostrar] = useState('')
  const soloSin = mostrar === 'horario'
  const [sel, setSel] = useState(() => new Set())
  const [pag, setPag] = useState(1)
  const [asignar, setAsignar] = useState(false)
  const soloRostro = mostrar === 'rostro'
  const [confirmar, setConfirmar] = useState(null)
  const sinRostro = p => !p.bio?.enrolado || !!p.bio?.reenrolar
  const texto = busca.trim().toLowerCase()
  const lista = filtrar(at.personas, filtro).filter(p => (!soloSin || !p.asig) && (!soloRostro || sinRostro(p)) && (!texto || `${p.name} ${p.cargo} ${p.unidad}`.toLowerCase().includes(texto)))
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)
  const todos = lista.length > 0 && lista.every(p => sel.has(p.id))
  const alternar = id => setSel(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const sinCuenta = at.personas.filter(p => !p.asig).length

  return (
    <>
      {/* Una sola fila: buscador, los filtros de lugar y unidad y qué mostrar. Para asignar a todos los
          filtrados, la casilla de la cabecera de la tabla. */}
      <BarraBusqueda busca={busca} onBusca={v => { setBusca(v); setPag(1) }} placeholder="Buscar colaborador…" filtro={filtro} onFiltro={v => { setFiltro(v); setPag(1) }} lugares={at.lugares} personas={at.personas}>
        <div className={`dc-filtro at-filtro-estado${mostrar ? ' on' : ''}`} style={{ width: 220 }}>
          <Desplegable valor={mostrar} ariaLabel="Qué mostrar" placeholder="Todos" anchoMenu={240} claseBoton="at-dd-estados"
            opciones={[
              { valor: '', etiqueta: 'Todos', lateral: String(at.personas.length), separada: true },
              { valor: 'horario', etiqueta: 'Sin horario', punto: '#F5B04F', lateral: String(sinCuenta), apagada: !sinCuenta },
              { valor: 'rostro', etiqueta: 'Sin rostro', punto: '#94A3B8', lateral: String(at.personas.filter(sinRostro).length), apagada: !at.personas.filter(sinRostro).length },
            ]}
            contenido={o => (
              <span className="pl-dd-trigger-estado">
                {o?.punto && <i style={{ background: o.punto }} aria-hidden="true" />}
                <span>{o ? o.etiqueta : 'Todos'}</span>
                <b>{o ? o.lateral : at.personas.length}</b>
              </span>
            )}
            onCambio={v => { setMostrar(v); setPag(1) }} />
        </div>
      </BarraBusqueda>

      {lista.length ? (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table at-tabla at-asig-tabla">
            <thead><tr>
              <th style={{ width: 36 }}><input type="checkbox" className="at-check" checked={todos} onChange={() => setSel(todos ? new Set() : new Set(lista.map(p => p.id)))} aria-label="Seleccionar todos" /></th>
              <th>Colaborador</th><th>Horario</th><th>Lugar de trabajo</th><th>Modalidad</th><th>Rostro</th><th aria-label="Acciones" />
            </tr></thead>
            <tbody>
              {lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(p => (
                <tr key={p.id} onClick={() => alternar(p.id)} style={{ background: sel.has(p.id) ? 'var(--green-bg)' : undefined }}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" className="at-check" checked={sel.has(p.id)} onChange={() => alternar(p.id)} aria-label={`Seleccionar a ${p.name}`} /></td>
                  <td><PersonaAt persona={p} size={30} sub={`${p.cargo} · ${p.unidad}`} /></td>
                  <td>{p.horario ? <span className="at-lugar-chip"><i style={{ width: 8, height: 8, borderRadius: 3, background: p.horario.color, display: 'inline-block' }} /> {p.horario.nombre}</span> : <span className="dc-chip dc-t-ambar"><AlertTriangle size={11} /> Sin horario</span>}</td>
                  <td>{p.lugar ? <span className="at-lugar-chip">{p.lugar.tipo === 'centro' ? <Warehouse size={13} /> : <Building2 size={13} />} {p.lugar.nombre}{p.lugares?.length > 1 && <b className="at-mas-lugares" title={`También marca en ${p.lugares.slice(1).map(l => l.nombre).join(', ')}`}>+{p.lugares.length - 1}</b>}</span> : <span className="dc-muted">—</span>}</td>
                  <td>{p.asig ? <span className="at-lugar-chip">{p.asig.modalidad === 'remoto' ? <House size={13} /> : p.asig.modalidad === 'hibrido' ? <Laptop size={13} /> : <MapPin size={13} />} {MODALIDADES[p.asig.modalidad].label}{p.asig.modalidad === 'hibrido' && <small>&nbsp;· {p.asig.diasOficina.map(d => DIAS_CORTOS[d]).join(' ')}</small>}</span> : <span className="dc-muted">—</span>}</td>
                  <td>{(() => {
                    const b = p.bio || {}
                    if (!b.consentimiento) return <span className="at-pl t-ambar" title="Todavía no aceptó que se use su rostro"><i aria-hidden="true" />Sin consentimiento</span>
                    if (b.reenrolar) return <span className="at-pl t-violeta"><i aria-hidden="true" />Pidió registrarlo otra vez</span>
                    if (b.enrolado) return <span className="at-pl t-verde" title={`Aceptó el consentimiento el ${fechaCorta(b.consentimiento.aceptado)} y registró su rostro el ${fechaCorta(b.enrolado)}`}><i aria-hidden="true" />Registrado</span>
                    return <span className="at-pl t-gris" title="Lo registra desde la app la primera vez que marca"><i aria-hidden="true" />Sin registrar</span>
                  })()}</td>
                  <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <MenuAcciones items={[
                      { label: 'Asignar horario y lugar', Icono: CalendarClock, onClick: () => { setSel(new Set([p.id])); setAsignar(true) } },
                      p.bio?.reenrolar && { label: 'Aprobar el nuevo registro', Icono: Check, onClick: () => setConfirmar({ p, tipo: 'aprobar' }) },
                      p.bio?.enrolado && !p.bio?.reenrolar && { label: 'Pedir que registre su rostro de nuevo', Icono: RotateCcw, onClick: () => setConfirmar({ p, tipo: 'pedir' }) },
                    ].filter(Boolean)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginacion page={pagina} setPage={setPag} total={lista.length} perPage={POR_PAGINA} nombre="colaboradores" nombreUno="colaborador" />
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
      {/* Borrar un rostro tiene consecuencias: se confirma. */}
      {confirmar && (
        <ConfirmarEliminar
          titulo={<>¿Borrar el rostro de {confirmar.p.name}?</>}
          texto={confirmar.tipo === 'pedir'
            ? 'La próxima vez que marque, la app le pedirá registrarlo de nuevo. Hasta entonces, sus marcaciones no se comparan con ningún rostro.'
            : 'Pidió registrar su rostro otra vez. Al aprobarlo se borra el que tiene y lo registra de nuevo la próxima vez que marque.'}
          pasos={['Se borra su rostro guardado', 'Le llega un aviso a su app', 'Lo registra de nuevo al marcar']}
          palabra="BORRAR" accion={confirmar.tipo === 'pedir' ? 'Borrar su rostro' : 'Aprobar y borrar su rostro'}
          cabeza={<span className="at-elim-caras" aria-hidden="true"><Avatar persona={confirmar.p} size={54} /><span className="flecha">→</span><span className="at-elim-cara"><ScanFace size={26} /></span></span>}
          onCerrar={() => setConfirmar(null)}
          onConfirmar={() => at.actualizarBio(confirmar.p.id, confirmar.tipo === 'pedir' ? { enrolado: null } : { reenrolar: null, enrolado: null })} />
      )}
    </>
  )
}


