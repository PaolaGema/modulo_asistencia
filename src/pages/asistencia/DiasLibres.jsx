import { useEffect, useState } from 'react'
import { CalendarHeart, Plus, Pencil, Trash2, CheckCircle2, Table2, CalendarDays, ChevronLeft, ChevronRight, Cake, X } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Modal, MenuAcciones, Vacio } from '../../components/documentacion/comunes'
import ConfirmarEliminar from '../../components/asistencia/ConfirmarEliminar'
import CampoHora from '../../components/asistencia/CampoHora'
import { MESES, FERIADOS } from '../../data/asistenciaData'

/* ── CONFIGURACIÓN › DÍAS LIBRES (propuesta «Lo que la app ya sabe · parte 2», aplicada el 5 nov 2026) ──
   Los días libres que da la empresa además de los feriados: el cumpleaños de cada persona, el aniversario…
   Una fila por día libre —escala con «Agregar un día libre»— que dice cuándo, cuánto (medio o entero), cómo
   se toma (automático o lo pide la persona) y a quién. Ese día no se espera marca, o la salida se adelanta, y
   no cuenta como falta ni como salida antes: en el Libro sale en gris con su nombre, como una vacación.
   La tabla solo muestra; se cambia en la ventana de «Editar», que es la que confirma (regla de la casa). */

const cuandoTxt = r => (r.cuando?.tipo === 'cumple' ? 'El día de su cumpleaños' : r.cuando?.mmdd ? `${Number(r.cuando.mmdd.slice(3))} de ${MESES[Number(r.cuando.mmdd.slice(0, 2)) - 1]}` : '—')
const NUEVO = { nombre: '', cuando: { tipo: 'fecha', mmdd: '01-01' }, cuanto: 'entero', desde: '13:00', forma: 'automatico', aQuien: { tipo: 'todos' }, correr: true }

export default function DiasLibres() {
  const at = useAsistencia()
  const lista = at.diasLibres || []
  const [editando, setEditando] = useState(null)
  const [borrando, setBorrando] = useState(null)
  const [aviso, setAviso] = useState(null)
  /* TABLA O CALENDARIO (Ronda 10 · A «El año entero»): se abre en la tabla, como el resto de SoulyHR. */
  const [ver, setVer] = useState('tabla')
  useEffect(() => { if (!aviso) return; const t = setTimeout(() => setAviso(null), 4000); return () => clearTimeout(t) }, [aviso])
  const sucursales = at.lugares.filter(l => l.tipo === 'sucursal')
  const unidades = [...new Set(at.personas.map(p => p.unidad).filter(Boolean))].sort()
  const aQuienTxt = r => (r.aQuien?.tipo === 'sucursal' ? (r.aQuien.ids || []).map(id => sucursales.find(s => String(s.id) === String(id))?.nombre).filter(Boolean).join(', ') || 'Una sucursal'
    : r.aQuien?.tipo === 'unidad' ? (r.aQuien.nombres || []).join(', ') || 'Una unidad' : 'Todos')

  const guardar = r => {
    const nuevo = !r.id
    const fila = nuevo ? { ...r, id: `dl-${Date.now().toString(36)}` } : r
    at.setDiasLibres(prev => (nuevo ? [...(prev || []), fila] : (prev || []).map(x => (x.id === r.id ? fila : x))))
    setEditando(null)
    setAviso(nuevo ? `Se agregó «${fila.nombre}»` : `Se guardó «${fila.nombre}»`)
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
        <div className="at-segmento at-modo" role="tablist" aria-label="Forma de ver">
          <button type="button" role="tab" aria-selected={ver === 'tabla'} aria-label="Tabla" title="Tabla" className={ver === 'tabla' ? 'on' : ''} onClick={() => setVer('tabla')}><Table2 size={16} aria-hidden="true" /></button>
          <button type="button" role="tab" aria-selected={ver === 'calendario'} aria-label="Calendario" title="Calendario" className={ver === 'calendario' ? 'on' : ''} onClick={() => setVer('calendario')}><CalendarDays size={16} aria-hidden="true" /></button>
        </div>
        <button type="button" className="pl-btn-new" onClick={() => setEditando({ ...NUEVO })}><Plus size={15} /> Agregar un día libre</button>
      </div>
      {ver === 'calendario' ? (
        <AnioDiasLibres lista={lista} hoy={at.hoy} aQuienTxt={aQuienTxt}
          onNuevo={mmdd => setEditando({ ...NUEVO, cuando: { tipo: 'fecha', mmdd } })}
          onEditar={r => setEditando(r)} />
      ) : lista.length ? (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table at-tabla">
            <thead><tr><th>Día libre</th><th>Cuánto</th><th>Cómo se toma</th><th>A quién</th><th aria-label="Acciones" /></tr></thead>
            <tbody>
              {lista.map(r => (
                <tr key={r.id}>
                  <td>
                    <b style={{ display: 'block', fontWeight: 600 }}>{r.nombre}</b>
                    <small className="dc-muted">{cuandoTxt(r)}{r.correr ? ' · si no trabaja ese día, el siguiente' : ''}</small>
                  </td>
                  <td>
                    <span className={`dc-chip dc-chip-sm dc-t-${r.cuanto === 'entero' ? 'verde' : 'azul'}`}>{r.cuanto === 'entero' ? 'Día entero' : 'Medio día'}</span>
                    {r.cuanto === 'medio' && <small className="dc-muted" style={{ display: 'block', marginTop: 3 }}>Libre desde las {r.desde}</small>}
                  </td>
                  <td>{r.forma === 'automatico' ? <><b style={{ fontWeight: 600 }}>Automático</b><small className="dc-muted" style={{ display: 'block' }}>Cae solo, sin pedirlo</small></> : <><b style={{ fontWeight: 600 }}>Lo pide la persona</b><small className="dc-muted" style={{ display: 'block' }}>Desde Mis beneficios</small></>}</td>
                  <td>{aQuienTxt(r)}</td>
                  <td style={{ textAlign: 'right', width: 1 }}>
                    <MenuAcciones items={[
                      { label: 'Editar', Icono: Pencil, onClick: () => setEditando(r) },
                      { label: 'Eliminar', Icono: Trash2, peligro: true, onClick: () => setBorrando(r) },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="dc-tarjeta"><Vacio Icono={CalendarHeart} titulo="Sin días libres" texto="Agregue el cumpleaños, el aniversario de la empresa o el día que quiera regalar." /></div>
      )}
      <p className="at-ayuda" style={{ margin: 0 }}>Ese día no se espera marca (o la salida se adelanta, si es medio día) y no cuenta como falta ni como salida antes. En el Libro sale en gris con su nombre, como una vacación. La fecha de cumpleaños sale de la ficha de cada persona.</p>

      {editando && <Editor inicial={editando} sucursales={sucursales} unidades={unidades} onGuardar={guardar} onCerrar={() => setEditando(null)} />}
      {borrando && (
        <ConfirmarEliminar que="día libre" nombre={borrando.nombre}
          texto="Desde hoy deja de aplicarse: ese día se vuelve a esperar marca. Lo que ya pasó no cambia."
          onConfirmar={() => { at.setDiasLibres(prev => (prev || []).filter(x => x.id !== borrando.id)); setAviso(`Se eliminó «${borrando.nombre}»`); setBorrando(null) }}
          onCerrar={() => setBorrando(null)} />
      )}
      {aviso && <div className="md-aviso" role="status"><CheckCircle2 size={15} aria-hidden="true" /> {aviso}</div>}
    </div>
  )
}

/* EL AÑO ENTERO (Ronda 10 · A, elegida el 5 nov 2026): los doce meses de una vez, para ver qué cae en
   fin de semana, qué queda pegado a un feriado y dónde falta algo. Rojo: feriado nacional. Verde: de la
   empresa, día entero; medio verde: medio día. Lo pasado se apaga y hoy lleva un aro. Un clic en una
   fecha vacía abre la ventana de siempre con ese día ya elegido; en un día marcado, dice qué es y deja
   editarlo. Los personales (el cumpleaños) no tienen una fecha común: van al costado. */
const pad = n => String(n).padStart(2, '0')
const LETRAS = ['l', 'm', 'm', 'j', 'v', 's', 'd']
const DIAS_SEM = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function AnioDiasLibres({ lista, hoy, aQuienTxt, onNuevo, onEditar }) {
  const [anio, setAnio] = useState(Number(String(hoy).slice(0, 4)) || 2026)
  const [abierto, setAbierto] = useState(null) // { fecha, top, left }
  const deEmpresa = lista.filter(r => r.cuando?.tipo === 'fecha' && r.cuando.mmdd)
  const personales = lista.filter(r => r.cuando?.tipo !== 'fecha')
  const empresaEn = mmdd => deEmpresa.filter(r => r.cuando.mmdd === mmdd)
  const feriadosDelAnio = Object.keys(FERIADOS).filter(f => f.startsWith(`${anio}-`))
  const anios = [...new Set(Object.keys(FERIADOS).map(f => Number(f.slice(0, 4))))].sort()
  useEffect(() => {
    if (!abierto) return
    const cerrar = e => { if (e.key === 'Escape') setAbierto(null) }
    window.addEventListener('keydown', cerrar)
    return () => window.removeEventListener('keydown', cerrar)
  }, [abierto])

  const tocar = (fecha, el) => {
    const mmdd = fecha.slice(5)
    if (!FERIADOS[fecha] && !empresaEn(mmdd).length) { setAbierto(null); onNuevo(mmdd); return }
    const r = el.getBoundingClientRect()
    setAbierto({ fecha, top: r.bottom + 8, left: Math.max(12, Math.min(r.left - 140, window.innerWidth - 332)) })
  }

  const mes = m => {
    const primero = (new Date(anio, m, 1).getDay() + 6) % 7
    const n = new Date(anio, m + 1, 0).getDate()
    return (
      <div key={m} className="at-dla-mes">
        <b>{MESES[m][0].toUpperCase() + MESES[m].slice(1)}</b>
        <div className="at-dla-grilla">
          {LETRAS.map((l, i) => <em key={i} aria-hidden="true">{l}</em>)}
          {Array.from({ length: primero }, (_, i) => <span key={`v${i}`} />)}
          {Array.from({ length: n }, (_, i) => {
            const d = i + 1, fecha = `${anio}-${pad(m + 1)}-${pad(d)}`
            const dw = new Date(anio, m, d).getDay()
            const emp = empresaEn(fecha.slice(5))
            const tipo = FERIADOS[fecha] ? 'fer' : emp.length ? (emp.some(r => r.cuanto === 'entero') ? 'ent' : 'med') : ''
            const nombre = FERIADOS[fecha] || emp.map(r => r.nombre).join(' · ')
            const cls = [tipo, !tipo && (dw === 0 || dw === 6) ? 'fin' : '', fecha === hoy ? 'hoy' : '', fecha < hoy ? 'pas' : '', abierto?.fecha === fecha ? 'sel' : ''].filter(Boolean).join(' ')
            return (
              <button key={d} type="button" className={cls} title={nombre || 'Agregar un día libre aquí'}
                aria-label={`${d} de ${MESES[m]}${nombre ? `: ${nombre}` : ', sin día libre'}`}
                onClick={e => tocar(fecha, e.currentTarget)}>{d}</button>
            )
          })}
        </div>
      </div>
    )
  }

  let detalle = null
  if (abierto) {
    const [a, m, d] = abierto.fecha.split('-').map(Number)
    const emp = empresaEn(abierto.fecha.slice(5))
    detalle = (
      <>
        <div className="at-dla-velo" onClick={() => setAbierto(null)} />
        <div className="at-dla-pop" role="dialog" aria-label="Día libre" style={{ top: abierto.top, left: abierto.left }}>
          <div className="at-dla-pop-cab"><b>{DIAS_SEM[new Date(a, m - 1, d).getDay()]} {d} de {MESES[m - 1]}</b>
            <button type="button" aria-label="Cerrar" onClick={() => setAbierto(null)}><X size={14} /></button></div>
          {FERIADOS[abierto.fecha] && <div className="at-dla-item"><i className="fer" /><span><b>{FERIADOS[abierto.fecha]}</b><small>Feriado nacional · no se espera marca</small></span></div>}
          {emp.map(r => (
            <div key={r.id} className="at-dla-item"><i className={r.cuanto === 'entero' ? 'ent' : 'med'} />
              <span><b>{r.nombre}</b><small>{r.cuanto === 'entero' ? 'Día entero' : `Libre desde las ${r.desde}`} · {aQuienTxt(r)}</small></span>
              <button type="button" className="at-dla-link" onClick={() => { setAbierto(null); onEditar(r) }}>Editar</button>
            </div>
          ))}
          {!emp.length && <button type="button" className="at-dla-link" style={{ justifySelf: 'start' }} onClick={() => { setAbierto(null); onNuevo(abierto.fecha.slice(5)) }}>+ Agregar un día libre de la empresa</button>}
        </div>
      </>
    )
  }

  return (
    <div className="at-dla">
      <div className="at-dla-arriba">
        <div className="at-dla-ley">
          <span><i className="fer" />Feriado nacional</span>
          <span><i className="ent" />De la empresa · día entero</span>
          <span><i className="med" />De la empresa · medio día</span>
          <span><i className="hoy" />Hoy</span>
        </div>
        <div className="at-dla-anio">
          <button type="button" aria-label="Año anterior" disabled={anio <= anios[0]} onClick={() => { setAnio(anio - 1); setAbierto(null) }}><ChevronLeft size={15} /></button>
          <b>{anio}</b>
          <button type="button" aria-label="Año siguiente" disabled={anio >= anios[anios.length - 1]} onClick={() => { setAnio(anio + 1); setAbierto(null) }}><ChevronRight size={15} /></button>
        </div>
      </div>
      <div className="at-dla-cuerpo">
        <div className="at-dla-meses">{Array.from({ length: 12 }, (_, m) => mes(m))}</div>
        <aside className="at-dla-lado">
          <span className="at-hz-rot">Personales</span>
          {personales.length ? personales.map(r => (
            <button key={r.id} type="button" className="at-dla-per" onClick={() => onEditar(r)}>
              <Cake size={16} aria-hidden="true" />
              <span><b>{r.nombre}</b><small>{r.cuanto === 'entero' ? 'Día entero' : `Libre desde las ${r.desde}`} · {r.forma === 'automatico' ? 'cae solo' : 'lo pide la persona'}</small></span>
            </button>
          )) : <small className="at-ayuda">Ninguno todavía.</small>}
          <small className="at-ayuda">Cada persona tiene su fecha, la de su ficha; por eso no se marcan en el año.</small>
          <span className="at-hz-rot" style={{ marginTop: 6 }}>{anio} en números</span>
          <div className="at-dla-num">
            <span><b>{feriadosDelAnio.length}</b>feriados</span>
            <span><b>{deEmpresa.length}</b>de la empresa</span>
            <span><b>{personales.length}</b>{personales.length === 1 ? 'personal' : 'personales'}</span>
          </div>
          <small className="at-ayuda">Toque una fecha vacía para agregar un día libre ese día.</small>
        </aside>
      </div>
      {detalle}
    </div>
  )
}

/* LA VENTANA DE UN DÍA LIBRE, COMO LA DE «NUEVO HORARIO» (pedido del 5 nov 2026): arriba los campos simples
   (nombre, cuándo y la fecha), a la izquierda las reglas en filas (cuánto, cómo se toma, a quién, si cae en un
   día que no trabaja), a la derecha «Así queda su día» —un día normal al lado del día libre, con las mismas
   barras de la semana del horario— y al pie el resumen en etiquetas, como «6 días de trabajo · …». */
const ESCALA = [6 * 60, 22 * 60]
const enEscala = m => Math.max(0, Math.min(100, ((m - ESCALA[0]) / (ESCALA[1] - ESCALA[0])) * 100))
const aM = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0) }
const ENTRADA = '08:30', SALIDA = '18:00', PAUSA = ['13:00', '14:00']

function Editor({ inicial, sucursales, unidades, onGuardar, onCerrar }) {
  const at = useAsistencia()
  const [r, setR] = useState(inicial)
  const pon = cambios => setR(x => ({ ...x, ...cambios }))
  const [mes, dia] = (r.cuando?.mmdd || '01-01').split('-').map(Number)
  const diasDelMes = new Date(2026, mes, 0).getDate()
  const valido = r.nombre.trim().length >= 3 && (r.aQuien.tipo === 'todos' || (r.aQuien.tipo === 'sucursal' ? r.aQuien.ids?.length : r.aQuien.nombres?.length))
  const seg = (valor, opciones, onCambio, etiqueta) => (
    <div className="at-segmento" role="radiogroup" aria-label={etiqueta}>
      {opciones.map(([v, t]) => <button key={v} type="button" role="radio" aria-checked={valor === v} className={valor === v ? 'on' : ''} onClick={() => onCambio(v)}>{t}</button>)}
    </div>
  )
  /* A cuántos alcanza, para el resumen del pie. */
  const alcance = at.personas.filter(p => p.asig && (r.aQuien.tipo === 'todos'
    || (r.aQuien.tipo === 'sucursal' && (r.aQuien.ids || []).includes(String(p.sucursalId || p.lugar?.sucursalId || p.lugar?.id)))
    || (r.aQuien.tipo === 'unidad' && (r.aQuien.nombres || []).includes(p.unidad)))).length
  const cuando = r.cuando.tipo === 'cumple' ? 'el día de su cumpleaños' : `el ${dia} de ${MESES[mes - 1]}`
  const fila = (titulo, ayuda, control) => (
    <div style={{ display: 'grid', gridTemplateColumns: '150px minmax(0, 1fr)', gap: 14, alignItems: 'center', background: 'var(--surface-card)', borderRadius: 10, padding: '10px 12px' }}>
      <span style={{ display: 'grid' }}><b style={{ fontSize: 13, color: 'var(--text-heading)' }}>{titulo}</b>{ayuda && <small style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{ayuda}</small>}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>{control}</div>
    </div>
  )
  const libreDesde = r.cuanto === 'medio' ? aM(r.desde) : aM(ENTRADA)

  return (
    <Modal titulo={inicial.id ? 'Editar día libre' : 'Nuevo día libre'} Icono={CalendarHeart} onCerrar={onCerrar} ancho={1000}
      pie={<><button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button><button type="button" className="pl-btn-save" disabled={!valido} onClick={() => onGuardar({ ...r, nombre: r.nombre.trim() })}>Guardar día libre</button></>}>
      <div className="at-modal-campos">
        <div className="at-hz-cab">
          <label className="at-campo"><span>Nombre</span><input className="pl-input" value={r.nombre} onChange={e => pon({ nombre: e.target.value })} placeholder="Ej.: Aniversario de la empresa" autoFocus /></label>
          <div className="at-campo"><span>Cuándo</span>
            {seg(r.cuando.tipo, [['cumple', 'Su cumpleaños'], ['fecha', 'Una fecha']], v => pon({ cuando: v === 'cumple' ? { tipo: 'cumple' } : { tipo: 'fecha', mmdd: r.cuando.mmdd || '01-01' } }), 'Cuándo')}
          </div>
          <div className="at-campo"><span>Fecha</span>
            {r.cuando.tipo === 'fecha' ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <select className="pl-input" aria-label="Día" value={dia} style={{ width: 70 }} onChange={e => pon({ cuando: { tipo: 'fecha', mmdd: `${String(mes).padStart(2, '0')}-${String(e.target.value).padStart(2, '0')}` } })}>
                  {Array.from({ length: diasDelMes }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="pl-input" aria-label="Mes" value={mes} style={{ width: 130 }} onChange={e => pon({ cuando: { tipo: 'fecha', mmdd: `${String(e.target.value).padStart(2, '0')}-${String(Math.min(dia, new Date(2026, Number(e.target.value), 0).getDate())).padStart(2, '0')}` } })}>
                  {MESES.map((m, i) => <option key={m} value={i + 1}>{m[0].toUpperCase() + m.slice(1)}</option>)}
                </select>
              </div>
            ) : <span className="pl-input" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', width: 206 }}>La de su ficha</span>}
          </div>
        </div>

        <div className="at-hz-lado">
          <div className="at-hz-filas" style={{ gap: 8 }}>
            {fila('Cuánto', r.cuanto === 'entero' ? 'Ese día no viene a trabajar' : 'Trabaja hasta la hora elegida', <>
              {seg(r.cuanto, [['entero', 'Día entero'], ['medio', 'Medio día']], v => pon({ cuanto: v }), 'Cuánto')}
              {r.cuanto === 'medio' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Libre desde <span style={{ width: 120 }}><CampoHora value={r.desde} onChange={v => pon({ desde: v })} ariaLabel="Libre desde" /></span></span>}
            </>)}
            {fila('Cómo se toma', r.forma === 'automatico' ? 'Cae solo: nadie lo pide ni lo aprueba' : 'La persona lo pide en Mis beneficios', seg(r.forma, [['automatico', 'Automático'], ['pide', 'Lo pide la persona']], v => pon({ forma: v }), 'Cómo se toma'))}
            {fila('A quién', null, <>
              {seg(r.aQuien.tipo, [['todos', 'Todos'], ['sucursal', 'Una sucursal'], ['unidad', 'Una unidad']], v => pon({ aQuien: v === 'todos' ? { tipo: 'todos' } : v === 'sucursal' ? { tipo: 'sucursal', ids: [] } : { tipo: 'unidad', nombres: [] } }), 'A quién')}
              {r.aQuien.tipo === 'sucursal' && (
                <select className="pl-input" style={{ width: 220 }} value={r.aQuien.ids?.[0] || ''} onChange={e => pon({ aQuien: { tipo: 'sucursal', ids: e.target.value ? [e.target.value] : [] } })}>
                  <option value="">Elija la sucursal…</option>
                  {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              )}
              {r.aQuien.tipo === 'unidad' && (
                <select className="pl-input" style={{ width: 220 }} value={r.aQuien.nombres?.[0] || ''} onChange={e => pon({ aQuien: { tipo: 'unidad', nombres: e.target.value ? [e.target.value] : [] } })}>
                  <option value="">Elija la unidad…</option>
                  {unidades.map(u => <option key={u}>{u}</option>)}
                </select>
              )}
            </>)}
            {fila('Si no trabaja ese día', 'Fin de semana o feriado', <>
              <button type="button" role="switch" aria-checked={!!r.correr} aria-label="Pasarlo al siguiente día de trabajo" className={`at-switch at-switch-sm${r.correr ? ' on' : ''}`} onClick={() => pon({ correr: !r.correr })} />
              <span style={{ fontSize: 13, color: 'var(--text-heading)' }}>{r.correr ? 'Pasa al siguiente día de trabajo' : 'Se pierde ese año'}</span>
            </>)}
          </div>

          {/* ASÍ QUEDA SU DÍA: un día normal y el día libre, con las barras de la semana del horario. */}
          <div className="at-hz-semana" aria-hidden="true">
            <span className="at-hz-rot">Así queda su día</span>
            <div className="at-hz-cal" style={{ gridTemplateColumns: '22px repeat(2, minmax(0, 1fr))', height: 300 }}>
              <div className="at-hz-horas">{[6, 9, 12, 15, 18, 21].map(x => <span key={x} style={{ top: `${enEscala(x * 60)}%` }}>{String(x).padStart(2, '0')}</span>)}</div>
              <div className="at-hz-col"><b>Un día normal</b>
                <div className="at-hz-pista">
                  <i style={{ top: `${enEscala(aM(ENTRADA))}%`, height: `${enEscala(aM(SALIDA)) - enEscala(aM(ENTRADA))}%`, background: '#9AABBB' }} />
                  <i className="p" style={{ top: `${enEscala(aM(PAUSA[0]))}%`, height: `${enEscala(aM(PAUSA[1])) - enEscala(aM(PAUSA[0]))}%` }} />
                </div>
              </div>
              <div className="at-hz-col"><b>Día libre</b>
                <div className="at-hz-pista">
                  {r.cuanto === 'medio' && libreDesde > aM(ENTRADA) && <i style={{ top: `${enEscala(aM(ENTRADA))}%`, height: `${enEscala(Math.min(libreDesde, aM(SALIDA))) - enEscala(aM(ENTRADA))}%`, background: '#9AABBB' }} />}
                  <i style={{ top: `${enEscala(Math.max(libreDesde, aM(ENTRADA)))}%`, height: `${enEscala(aM(SALIDA)) - enEscala(Math.max(libreDesde, aM(ENTRADA)))}%`, background: '#00E091' }} />
                  <em style={{ top: `${(enEscala(Math.max(libreDesde, aM(ENTRADA))) + enEscala(aM(SALIDA))) / 2 - 3}%`, color: '#0C2D40', fontWeight: 600 }}>Libre</em>
                </div>
              </div>
            </div>
            <div className="at-hz-ley"><span><i style={{ background: '#9AABBB' }} />Trabaja</span><span><i style={{ background: '#00E091' }} />Libre</span><span><i className="p" />Descanso</span></div>
            <small style={{ fontSize: 11, color: 'var(--text-muted)' }}>Con un horario de {ENTRADA} a {SALIDA}, como ejemplo.</small>
          </div>
        </div>

        <div className="at-hz-tot">
          <span><b>{r.cuanto === 'entero' ? 'Día entero' : `Tarde libre desde las ${r.desde}`}</b></span>
          <span><b>{cuando[0].toUpperCase() + cuando.slice(1)}</b>{r.correr ? ' · o el siguiente día de trabajo' : ''}</span>
          <span><b>{r.forma === 'automatico' ? 'Cae solo' : 'Lo pide la persona'}</b></span>
          <span><b>{alcance}</b> {alcance === 1 ? 'colaborador' : 'colaboradores'}</span>
        </div>
      </div>
    </Modal>
  )
}
