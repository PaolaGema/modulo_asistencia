import { useEffect, useState } from 'react'
import { CalendarHeart, Plus, Pencil, Trash2, CheckCircle2, Table2, CalendarDays, ChevronLeft, ChevronRight, Cake, Gift, PartyPopper, Clock } from 'lucide-react'
import { MESES as MESES_CAL, DIAS_SEMANA, buildCalendarCells } from '../../utils/calendarEvents'
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

/* EL AÑO ENTERO (Ronda 10 · A, elegida el 5 nov 2026), con el mismo dibujo que el calendario de
   Asistencia › Hoy y el de Inicio: el número en un círculo de 24 px (el elegido en azul marino, hoy con
   aro), los puntos de color debajo, la leyenda de puntos y, al costado, el detalle del día elegido con
   las mismas filas de «Próximos» (fecha, título, ícono). Los feriados en violeta, como en Asistencia.
   Doce meses de una vez para ver qué cae en fin de semana y qué queda pegado a un feriado. Un clic elige
   el día; si está libre, el detalle ofrece agregar uno ahí, y si tiene uno de la empresa, editarlo. Los
   personales (el cumpleaños) no tienen una fecha común: van en su propia tarjeta. */
const TIPOS_DL = {
  feriado: { label: 'Feriado', color: 'var(--at-violeta)', Icon: PartyPopper },
  empresa: { label: 'Día libre de la empresa', color: 'var(--at-verde)', Icon: Gift },
}
const pad = n => String(n).padStart(2, '0')
const flechaDL = { width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border-soft)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }

function AnioDiasLibres({ lista, hoy, aQuienTxt, onNuevo, onEditar }) {
  const [anio, setAnio] = useState(Number(String(hoy).slice(0, 4)) || 2026)
  const [elegido, setElegido] = useState(hoy)
  const deEmpresa = lista.filter(r => r.cuando?.tipo === 'fecha' && r.cuando.mmdd)
  const personales = lista.filter(r => r.cuando?.tipo !== 'fecha')
  const anios = [...new Set(Object.keys(FERIADOS).map(f => Number(f.slice(0, 4))))].sort()
  const cuantoTxt = r => (r.cuanto === 'entero' ? 'Día entero' : `Libre desde las ${r.desde}`)

  /* Lo de cada fecha: el feriado y los días libres de la empresa. */
  const eventosDe = fecha => {
    const ev = []
    if (FERIADOS[fecha]) ev.push({ tipo: 'feriado', titulo: FERIADOS[fecha], sub: 'Feriado nacional · no se espera marca' })
    deEmpresa.filter(r => r.cuando.mmdd === fecha.slice(5)).forEach(r => ev.push({ tipo: 'empresa', titulo: r.nombre, sub: `${cuantoTxt(r)} · ${aQuienTxt(r)}`, regla: r }))
    return ev
  }

  const mes = m => (
    <div key={m}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 6 }}>{MESES_CAL[m]}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {DIAS_SEMANA.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', padding: '0 0 6px' }}>{d}</div>)}
        {buildCalendarCells(anio, m).map((c, i) => {
          if (!c.inMonth) return <span key={i} />
          const fecha = `${anio}-${pad(m + 1)}-${pad(c.day)}`
          const sel = fecha === elegido, esteHoy = fecha === hoy
          const ev = eventosDe(fecha)
          return (
            <button key={i} type="button" onClick={() => setElegido(fecha)} aria-pressed={sel}
              aria-label={`${c.day} de ${MESES[m]}${ev.length ? `: ${ev.map(e => e.titulo).join(', ')}` : ''}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '3px 0', background: 'none', border: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: sel || esteHoy ? 700 : 500,
                background: sel ? 'var(--navy)' : 'transparent',
                border: !sel && esteHoy ? '1.5px solid var(--navy)' : 'none',
                color: sel ? '#fff' : esteHoy ? 'var(--navy)' : 'var(--text-heading)',
              }}>{c.day}</span>
              <span style={{ display: 'flex', gap: 2, height: 4 }}>
                {ev.slice(0, 3).map((e, j) => <span key={j} style={{ width: 4, height: 4, borderRadius: '50%', background: TIPOS_DL[e.tipo].color }} />)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )

  const [, mE, dE] = elegido.split('-').map(Number)
  const delDia = eventosDe(elegido)
  const mesCorto = MESES_CAL[mE - 1].slice(0, 3).toUpperCase()
  const fila = (e, i) => {
    const t = TIPOS_DL[e.tipo]
    const Fila = e.regla ? 'button' : 'div'
    return (
      <Fila key={i} type={e.regla ? 'button' : undefined} className="upcoming-item" onClick={e.regla ? () => onEditar(e.regla) : undefined}
        style={e.regla ? { width: '100%', border: 'none', background: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer' } : undefined}>
        <div className="ui-date"><div className="ui-day">{pad(dE)}</div><div className="ui-month">{mesCorto}</div></div>
        <div className="ui-info"><div className="ui-name">{e.titulo}</div><div className="ui-sub">{e.sub}</div><div className="ui-sub">{t.label}{e.regla ? ' · toque para editar' : ''}</div></div>
        <div className="ui-av" style={{ background: `color-mix(in srgb, ${t.color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <t.Icon size={14} style={{ color: t.color }} aria-hidden="true" />
        </div>
      </Fila>
    )
  }

  return (
    <div className="at-dla">
      <div className="sec-card">
        <div className="sc-hd">
          <CalendarDays size={15} style={{ color: 'var(--blue)' }} aria-hidden="true" />
          <h3>{anio}</h3>
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" aria-label="Año anterior" disabled={anio <= anios[0]} onClick={() => setAnio(anio - 1)} style={{ ...flechaDL, opacity: anio <= anios[0] ? 0.4 : 1 }}><ChevronLeft size={13} /></button>
            <button type="button" aria-label="Año siguiente" disabled={anio >= anios[anios.length - 1]} onClick={() => setAnio(anio + 1)} style={{ ...flechaDL, opacity: anio >= anios[anios.length - 1] ? 0.4 : 1 }}><ChevronRight size={13} /></button>
          </div>
        </div>
        <div className="sc-body" style={{ padding: '14px 18px 18px' }}>
          <div className="at-dla-meses">{Array.from({ length: 12 }, (_, m) => mes(m))}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-soft)', flexWrap: 'wrap' }}>
            {Object.values(TIPOS_DL).map(t => (
              <span key={t.label} style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, display: 'inline-block' }} /> {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
        <div className="sec-card">
          <div className="sc-hd">
            <h3>{dE} de {MESES[mE - 1]}{elegido === hoy ? ' · Hoy' : ''}{delDia.length > 0 && <span className="sc-hd-count">{delDia.length}</span>}</h3>
            {!delDia.some(e => e.tipo === 'empresa') && <a href="#" className="chip-link" onClick={e => { e.preventDefault(); onNuevo(elegido.slice(5)) }}>+ Agregar aquí</a>}
          </div>
          <div className="sc-body" style={{ padding: '6px 22px 12px' }}>
            {delDia.length ? delDia.map(fila) : (
              <div style={{ padding: '10px 0', fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} aria-hidden="true" /> Sin día libre este día
              </div>
            )}
          </div>
        </div>

        <div className="sec-card">
          <div className="sc-hd"><h3>Personales{personales.length > 0 && <span className="sc-hd-count">{personales.length}</span>}</h3></div>
          <div className="sc-body" style={{ padding: '6px 22px 12px' }}>
            {personales.map(r => (
              <button key={r.id} type="button" className="upcoming-item" onClick={() => onEditar(r)} style={{ width: '100%', border: 'none', background: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
                <div className="ui-av" style={{ background: 'color-mix(in srgb, var(--at-verde) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cake size={14} style={{ color: 'var(--at-verde)' }} aria-hidden="true" />
                </div>
                <div className="ui-info"><div className="ui-name">{r.nombre}</div><div className="ui-sub">{cuantoTxt(r)} · {r.forma === 'automatico' ? 'cae solo' : 'lo pide la persona'}</div></div>
              </button>
            ))}
            <div style={{ padding: '10px 0 2px', fontSize: 11.5, color: 'var(--text-muted)' }}>Cada persona tiene su fecha, la de su ficha; por eso no se marcan en el año.</div>
          </div>
        </div>
      </div>
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
