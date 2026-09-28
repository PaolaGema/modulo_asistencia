import { useState } from 'react'
import { Handshake, Plus, Search, Pencil, X, Power } from 'lucide-react'
import EmptyState from '../../components/layout/EmptyState'
import { useLocalStorage } from '../../hooks/useLocalStorage'

/* CLIENTES EXTERNOS.
   Personas de afuera de la empresa —clientes— que participan en las evaluaciones. No son
   colaboradores: no tienen ficha, ni puesto, ni vínculo con la empresa. Por eso viven en su propia
   lista y no en el directorio, y su registro es corto: quién es, cómo se lo contacta, de dónde
   viene y qué papel cumple.

   NO SE BORRAN, SE DESACTIVAN. Un cliente que ya evaluó a alguien deja su nombre en esas
   evaluaciones; borrarlo las dejaría sin autor. Inactivo deja de ofrecerse para evaluaciones
   nuevas y conserva lo que ya hizo. */

const ROLES = ['Evaluador']

const VACIO = { nombre: '', paterno: '', materno: '', telefono: '', correo: '', empresa: '', rol: ROLES[0], activo: true }

/* Los campos del formulario, en su orden, con su tope de caracteres y su ejemplo. */
const CAMPOS = [
  { k: 'nombre', rotulo: 'Nombre', ej: 'Ej. Juan', max: 50, obligatorio: true },
  { k: 'paterno', rotulo: 'Apellido paterno', ej: 'Ej. Pérez', max: 50, obligatorio: true },
  { k: 'materno', rotulo: 'Apellido materno', ej: 'Ej. Gómez', max: 50 },
  { k: 'telefono', rotulo: 'Teléfono', ej: 'Ej. +591 70000000', max: 20, tipo: 'tel' },
  { k: 'correo', rotulo: 'Correo electrónico', ej: 'Ej. juan@empresa.com', max: 100, obligatorio: true, tipo: 'email' },
  { k: 'empresa', rotulo: 'Empresa/organización', ej: 'Ej. Consultora XYZ', max: 150 },
]

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* Un registro guardado con la forma de antes —nombres y apellidos en un solo campo— se lee con
   la de ahora, para que nada de lo cargado desaparezca de la lista. */
function normalizar(c) {
  return {
    ...VACIO,
    ...c,
    nombre: c.nombre ?? c.nombres ?? '',
    paterno: c.paterno ?? c.apellidos ?? '',
    rol: c.rol || ROLES[0],
  }
}

const nombreCompleto = c => [c.nombre, c.paterno, c.materno].filter(Boolean).join(' ')
const iniciales = c => `${c.nombre.trim()[0] || ''}${c.paterno.trim()[0] || ''}`.toUpperCase() || '?'

/* Lo que falta, con su motivo: el aviso nombra el dato y dice para qué hace falta. */
function faltaDe(k, f) {
  if (k === 'nombre' && !f.nombre.trim()) return 'Falta el nombre.'
  if (k === 'paterno' && !f.paterno.trim()) return 'Falta el apellido paterno.'
  if (k === 'correo') {
    if (!f.correo.trim()) return 'Falta el correo: es por donde le llega la evaluación.'
    if (!CORREO_VALIDO.test(f.correo.trim())) return 'El correo no parece válido.'
  }
  return null
}
const hayFaltas = f => CAMPOS.some(c => faltaDe(c.k, f))

function FormularioCliente({ inicial, onGuardar, onCerrar }) {
  const [f, setF] = useState(inicial)
  const [intento, setIntento] = useState(false)
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))

  function guardar() {
    setIntento(true)
    if (hayFaltas(f)) return
    const limpio = { ...f }
    CAMPOS.forEach(c => { limpio[c.k] = f[c.k].trim() })
    onGuardar(limpio)
  }

  return (
    <div className="pl-overlay" onClick={onCerrar}>
      <div className="pl-modal jb-modal" role="dialog" aria-modal="true" aria-labelledby="ce-titulo"
        style={{ width: 640, maxWidth: '94vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => { if (e.key === 'Escape') onCerrar() }}>
        <div className="pl-modal-header">
          <div style={{ flex: 1 }}>
            <h2 id="ce-titulo">{inicial.id ? 'Editar cliente externo' : 'Nuevo cliente externo'}</h2>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
              {inicial.id ? 'Corrija los datos de este cliente externo' : 'Registra un nuevo cliente externo'}
            </span>
          </div>
          <button className="pl-modal-close" onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
        </div>

        <div className="pl-modal-body ce-form" style={{ overflowY: 'auto' }}>
          {CAMPOS.map((c, i) => {
            const falta = intento ? faltaDe(c.k, f) : null
            return (
              <label key={c.k} className="pl-label ce-campo" style={{ fontSize: 13 }}>
                <span>{c.rotulo}{c.obligatorio ? <span style={{ color: 'var(--red)' }}>*</span> : null}</span>
                <input
                  className="pl-input"
                  type={c.tipo || 'text'}
                  value={f[c.k]}
                  maxLength={c.max}
                  placeholder={c.ej}
                  onChange={e => set(c.k, e.target.value)}
                  aria-invalid={falta ? 'true' : undefined}
                  autoFocus={i === 0}
                  style={falta ? { borderColor: 'var(--red)' } : undefined}
                />
                <span className="ce-pie-campo">
                  <span className="ce-falta">{falta}</span>
                  <span className="ce-cuenta">{f[c.k].length}/{c.max}</span>
                </span>
              </label>
            )
          })}
          <label className="pl-label ce-campo" style={{ fontSize: 13 }}>
            <span>Rol del cliente</span>
            <select className="pl-input" value={f.rol} onChange={e => set('rol', e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>

        <div className="pl-modal-footer">
          <button className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
          <button className="pl-btn-save" onClick={guardar}>Guardar cliente</button>
        </div>
      </div>
    </div>
  )
}

export default function ClientesExternos() {
  const [guardados, setClientes] = useLocalStorage('clientesExternos', [])
  const clientes = guardados.map(normalizar)
  const [buscar, setBuscar] = useState('')
  const [editando, setEditando] = useState(null)

  const filas = clientes.filter(c => {
    const q = buscar.trim().toLowerCase()
    if (!q) return true
    return `${nombreCompleto(c)} ${c.empresa} ${c.correo}`.toLowerCase().includes(q)
  })
  const activos = clientes.filter(c => c.activo).length

  function guardar(datos) {
    if (datos.id) setClientes(prev => prev.map(c => (c.id === datos.id ? datos : normalizar(c))))
    else setClientes(prev => [...prev.map(normalizar), { ...datos, id: Math.max(0, ...prev.map(c => c.id)) + 1 }])
    setEditando(null)
  }
  const alternarActivo = id => setClientes(prev => prev.map(c => (c.id === id ? { ...normalizar(c), activo: !c.activo } : c)))

  return (
    <div className="content-scroll">
      <div className="pl-header">
        <div>
          <h1 className="pl-title">Clientes externos</h1>
          <p className="pl-subtitle">Personas de afuera de la empresa que participan en las evaluaciones</p>
        </div>
      </div>

      {/* LA TABLA ESTÁ SIEMPRE, aunque vacía: así la pantalla se ve igual el primer día que el
          día cien, y el botón de crear está donde va a estar siempre. */}
      <div className="pl-toolbar">
        <div className="pl-search-wrap">
          <Search size={13} className="pl-search-ico" />
          <input type="text" className="pl-search" placeholder="Buscar por nombre, empresa o correo…"
            value={buscar} onChange={e => setBuscar(e.target.value)} aria-label="Buscar cliente externo" />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{clientes.length} registrados · {activos} activos</span>
        <button className="pl-btn-new" style={{ padding: '0 14px', height: 34, fontSize: 11.5, marginLeft: 'auto' }}
          onClick={() => setEditando(VACIO)}>
          <Plus size={14} color="#00E091" />
          Nuevo cliente externo
        </button>
      </div>

      <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
        <table className="as-table" style={{ minWidth: 820 }}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Empresa/organización</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th aria-label="Acciones"></th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 && (
              <tr><td colSpan={6}>
                <EmptyState
                  icon={Handshake}
                  title="Todavía no hay clientes externos"
                  description="Registre aquí a las personas que no trabajan en la empresa y que participan en las evaluaciones."
                />
              </td></tr>
            )}
            {clientes.length > 0 && filas.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Ningún cliente coincide con «{buscar}».</td></tr>
            )}
            {filas.map(c => (
              <tr key={c.id} style={c.activo ? undefined : { opacity: 0.6 }}>
                <td>
                  <div className="as-person">
                    <span className="ce-avatar" aria-hidden="true">{iniciales(c)}</span>
                    <div>
                      <div className="as-name">{nombreCompleto(c)}</div>
                      <div className="as-area" style={{ fontSize: 11.5 }}>{c.correo}</div>
                    </div>
                  </div>
                </td>
                <td><span className="as-ruta">{c.empresa || '—'}</span></td>
                <td><span className="as-ruta" style={{ whiteSpace: 'nowrap' }}>{c.telefono || '—'}</span></td>
                <td><span className="as-ruta">{c.rol}</span></td>
                <td><span className={`ce-badge${c.activo ? ' on' : ''}`}>{c.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button className="ce-accion" onClick={() => setEditando(c)} aria-label={`Editar a ${nombreCompleto(c)}`} title="Editar">
                      <Pencil size={14} />
                    </button>
                    <button className="ce-accion" onClick={() => alternarActivo(c.id)}
                      aria-label={`${c.activo ? 'Desactivar' : 'Activar'} a ${nombreCompleto(c)}`}
                      title={c.activo ? 'Desactivar' : 'Activar'}>
                      <Power size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && (
        <FormularioCliente inicial={editando} onGuardar={guardar} onCerrar={() => setEditando(null)} />
      )}
    </div>
  )
}
