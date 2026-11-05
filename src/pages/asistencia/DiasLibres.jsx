import { useEffect, useState } from 'react'
import { CalendarHeart, Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Modal, MenuAcciones, Vacio } from '../../components/documentacion/comunes'
import ConfirmarEliminar from '../../components/asistencia/ConfirmarEliminar'
import { MESES } from '../../data/asistenciaData'

/* ── CONFIGURACIÓN › DÍAS LIBRES (propuesta «Lo que la app ya sabe · parte 2», aplicada el 5 nov 2026) ──
   Los días libres que da la empresa además de los feriados: el cumpleaños de cada persona, el aniversario…
   Una fila por día libre —escala con «Agregar un día libre»— que dice cuándo, cuánto (medio o entero), cómo
   se toma (automático o lo pide la persona) y a quién. Ese día no se espera marca, o la salida se adelanta, y
   no cuenta como falta ni como salida antes: en el Libro sale en gris con su nombre, como una vacación.
   La tabla solo muestra; se cambia en la ventana de «Editar», que es la que confirma (regla de la casa). */

const HORAS = ['09:00', '10:00', '11:00', '12:00', '12:30', '13:00', '14:00', '15:00', '16:00']
const cuandoTxt = r => (r.cuando?.tipo === 'cumple' ? 'El día de su cumpleaños' : r.cuando?.mmdd ? `${Number(r.cuando.mmdd.slice(3))} de ${MESES[Number(r.cuando.mmdd.slice(0, 2)) - 1]}` : '—')
const NUEVO = { nombre: '', cuando: { tipo: 'fecha', mmdd: '01-01' }, cuanto: 'entero', desde: '13:00', forma: 'automatico', aQuien: { tipo: 'todos' }, correr: true }

export default function DiasLibres() {
  const at = useAsistencia()
  const lista = at.diasLibres || []
  const [editando, setEditando] = useState(null)
  const [borrando, setBorrando] = useState(null)
  const [aviso, setAviso] = useState(null)
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
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="pl-btn-new" onClick={() => setEditando({ ...NUEVO })}><Plus size={15} /> Agregar un día libre</button>
      </div>
      {lista.length ? (
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

function Editor({ inicial, sucursales, unidades, onGuardar, onCerrar }) {
  const [r, setR] = useState(inicial)
  const pon = cambios => setR(x => ({ ...x, ...cambios }))
  const [mes, dia] = (r.cuando?.mmdd || '01-01').split('-').map(Number)
  const diasDelMes = new Date(2026, mes, 0).getDate()
  const valido = r.nombre.trim().length >= 3 && (r.aQuien.tipo === 'todos' || (r.aQuien.tipo === 'sucursal' ? r.aQuien.ids?.length : r.aQuien.nombres?.length))
  const seg = (valor, opciones, onCambio) => (
    <div className="at-segmento" role="radiogroup">
      {opciones.map(([v, t]) => <button key={v} type="button" role="radio" aria-checked={valor === v} className={valor === v ? 'on' : ''} onClick={() => onCambio(v)}>{t}</button>)}
    </div>
  )
  const campo = { display: 'grid', gap: 6 }
  const rot = { fontSize: 12.5, fontWeight: 600 }
  return (
    <Modal titulo={inicial.id ? `Editar · ${inicial.nombre}` : 'Agregar un día libre'} Icono={CalendarHeart} onCerrar={onCerrar} ancho={560}
      pie={<>
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="pl-btn-save" disabled={!valido} onClick={() => onGuardar({ ...r, nombre: r.nombre.trim() })}>{inicial.id ? 'Guardar cambios' : 'Agregar día libre'}</button>
      </>}>
      <div style={{ display: 'grid', gap: 16 }}>
        <label style={campo}><span style={rot}>Nombre</span>
          <input className="pl-input" value={r.nombre} onChange={e => pon({ nombre: e.target.value })} placeholder="Ej.: Aniversario de la empresa" />
        </label>
        <div style={campo}><span style={rot}>Cuándo</span>
          {seg(r.cuando.tipo, [['cumple', 'El cumpleaños de cada persona'], ['fecha', 'Una fecha del año']], v => pon({ cuando: v === 'cumple' ? { tipo: 'cumple' } : { tipo: 'fecha', mmdd: r.cuando.mmdd || '01-01' } }))}
          {r.cuando.tipo === 'fecha' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="pl-input" aria-label="Día" value={dia} onChange={e => pon({ cuando: { tipo: 'fecha', mmdd: `${String(mes).padStart(2, '0')}-${String(e.target.value).padStart(2, '0')}` } })} style={{ width: 90 }}>
                {Array.from({ length: diasDelMes }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="pl-input" aria-label="Mes" value={mes} onChange={e => pon({ cuando: { tipo: 'fecha', mmdd: `${String(e.target.value).padStart(2, '0')}-${String(Math.min(dia, new Date(2026, Number(e.target.value), 0).getDate())).padStart(2, '0')}` } })}>
                {MESES.map((m, i) => <option key={m} value={i + 1}>{m[0].toUpperCase() + m.slice(1)}</option>)}
              </select>
            </div>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={!!r.correr} onChange={e => pon({ correr: e.target.checked })} />
            Si cae en un día que la persona no trabaja (fin de semana o feriado), pasarlo al siguiente día de trabajo
          </label>
        </div>
        <div style={campo}><span style={rot}>Cuánto</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {seg(r.cuanto, [['entero', 'Día entero'], ['medio', 'Medio día']], v => pon({ cuanto: v }))}
            {r.cuanto === 'medio' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>Libre desde las
                <select className="pl-input" value={r.desde} onChange={e => pon({ desde: e.target.value })} style={{ width: 100 }}>{HORAS.map(h => <option key={h}>{h}</option>)}</select>
              </label>
            )}
          </div>
        </div>
        <div style={campo}><span style={rot}>Cómo se toma</span>
          {seg(r.forma, [['automatico', 'Automático'], ['pide', 'Lo pide la persona']], v => pon({ forma: v }))}
          <small className="dc-muted">{r.forma === 'automatico' ? 'El día cae solo: nadie tiene que pedirlo ni aprobarlo.' : 'La persona lo pide desde Mis beneficios y RR.HH. lo aprueba, como cualquier permiso.'}</small>
        </div>
        <div style={campo}><span style={rot}>A quién</span>
          {seg(r.aQuien.tipo, [['todos', 'Todos'], ['sucursal', 'Una sucursal'], ['unidad', 'Una unidad']], v => pon({ aQuien: v === 'todos' ? { tipo: 'todos' } : v === 'sucursal' ? { tipo: 'sucursal', ids: [] } : { tipo: 'unidad', nombres: [] } }))}
          {r.aQuien.tipo === 'sucursal' && (
            <select className="pl-input" value={r.aQuien.ids?.[0] || ''} onChange={e => pon({ aQuien: { tipo: 'sucursal', ids: e.target.value ? [e.target.value] : [] } })}>
              <option value="">Elija la sucursal…</option>
              {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          )}
          {r.aQuien.tipo === 'unidad' && (
            <select className="pl-input" value={r.aQuien.nombres?.[0] || ''} onChange={e => pon({ aQuien: { tipo: 'unidad', nombres: e.target.value ? [e.target.value] : [] } })}>
              <option value="">Elija la unidad organizacional…</option>
              {unidades.map(u => <option key={u}>{u}</option>)}
            </select>
          )}
        </div>
      </div>
    </Modal>
  )
}
