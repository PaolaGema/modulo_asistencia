import { useState } from 'react'
import {
  HelpCircle, LogOut, Network, Settings, User, Briefcase, FileText, Monitor, ChevronRight,
  ChevronDown, Gift, Sparkles, Plus, Info, Lock, Download, AlertTriangle, Pencil, Eye, EyeOff, Check, X,
  GraduationCap, Send, Clock, ChevronLeft, Image as ImageIcon,
} from 'lucide-react'
import BarraVolver from './BarraVolver'
import ConfiguracionPhone from './ConfiguracionPhone'
import HojaDocumento from '../personas/HojaDocumento'
import { useMiFicha } from '../../hooks/useMiFicha'
import {
  pestanasCon, partesDe, documentosDe, camposEditables, agrupar, lineas, titularDe,
  resumenDe, porRenovar, seccionesEditables,
} from '../../data/miFichaLectura'

/* LA PESTAÑA «PERFIL» DEL TELÉFONO: el perfil de siempre —banda, foto, nombre, cargo— con
   «Mi ficha» debajo. Cada fila abre una pestaña de la ficha en pantalla propia; la barra de
   abajo sigue visible porque no se sale de «Perfil». Mi ficha sólo se lee: lo que el
   colaborador mantiene al día lo edita en Configuración › Perfil de usuario (`MisDatos`). Lo que
   se enseña y cómo se lee sale de `miFichaLectura`, el mismo módulo que usa la web. */

const ICONOS = { personal: User, laboral: Briefcase, perfil: GraduationCap, documentos: FileText, recursos: Monitor }
const BOTON = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 24, padding: '0 11px', borderRadius: 7, fontFamily: 'inherit', fontSize: 7.5, fontWeight: 600, cursor: 'pointer' }
const CAMPO = {
  width: '100%', boxSizing: 'border-box', height: 24, marginTop: 2, padding: '0 7px', borderRadius: 6,
  border: '1px solid var(--border-dark)', background: 'var(--surface-card)', fontFamily: 'inherit', fontSize: 8, color: 'var(--text-heading)', outline: 'none',
}
const TARJETA = { background: 'var(--surface-card)', borderRadius: 11, marginTop: 6, border: '1px solid var(--border-soft)', overflow: 'hidden' }

function GuardarCancelar({ onGuardar, onCancelar, textoGuardar = 'Guardar', desactivado }) {
  return (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
      <button onClick={onCancelar} style={{ ...BOTON, border: '1px solid var(--border-dark)', background: 'var(--surface-card)', color: 'var(--text-heading)' }}>Cancelar</button>
      <button onClick={onGuardar} disabled={desactivado} style={{
        ...BOTON, border: 'none', background: desactivado ? 'var(--bg-secondary)' : '#00E091', color: desactivado ? 'var(--icon-muted)' : '#0C2D40',
        cursor: desactivado ? 'default' : 'pointer',
      }}>{textoGuardar}</button>
    </div>
  )
}

function Guardado() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 6.5, fontWeight: 600, color: 'var(--mf-vig-txt)' }}>
      <Check size={8} /> Cambios guardados
    </span>
  )
}

/* «Cambios guardados» se ve un par de segundos después de guardar y se va solo. */
function useAvisoGuardado() {
  const [visto, setVisto] = useState(false)
  const avisar = () => { setVisto(true); setTimeout(() => setVisto(false), 2200) }
  return [visto, avisar]
}

function Chips({ lista }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
      {lista.map(x => (
        <span key={x} style={{ fontSize: 7, padding: '3px 7px', borderRadius: 99, background: 'var(--surface-card)', border: '1px solid var(--border-dark)', color: 'var(--text-heading)' }}>{x}</span>
      ))}
    </div>
  )
}

/* Una lista de preferencias en edición: cada una se quita con su ×, y se agrega escribiendo
   y tocando «Agregar» o Enter. Repetidas y en blanco no entran. */
function ListaEditable({ lista, setLista, placeholder }) {
  const [nuevo, setNuevo] = useState('')
  const agregar = () => {
    const t = nuevo.trim()
    if (t && !lista.includes(t)) setLista([...lista, t])
    setNuevo('')
  }
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
        {lista.map(x => (
          <span key={x} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 7, padding: '2px 3px 2px 7px', borderRadius: 99, background: 'var(--surface-card)', border: '1px solid var(--border-dark)', color: 'var(--text-heading)' }}>
            {x}
            <button onClick={() => setLista(lista.filter(y => y !== x))} aria-label={`Quitar ${x}`} style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer' }}>
              <X size={8} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
        <input value={nuevo} onChange={e => setNuevo(e.target.value)} onKeyDown={e => e.key === 'Enter' && agregar()}
          placeholder={placeholder} style={{ ...CAMPO, marginTop: 0, flex: 1 }} />
        <button onClick={agregar} style={{ ...BOTON, border: '1px solid var(--mf-verde-txt)', background: 'var(--surface-card)', color: 'var(--mf-verde-txt)' }}>Agregar</button>
      </div>
    </>
  )
}

const tituloPref = (I, t, arriba) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, fontWeight: 700, color: 'var(--text-heading)', marginTop: arriba ? 11 : 0 }}>
    <I size={11} /> {t}
  </div>
)
const vacioPref = t => <div style={{ fontSize: 7, fontStyle: 'italic', color: 'var(--icon-muted)', marginTop: 5 }}>{t}</div>

/* Regalos y experiencias en la portada: para mirar. Se cambian en Configuración. */
function PreferenciasPhone({ form, onEditar }) {
  const regalos = lineas(form['ra.f1'])
  const experiencias = lineas(form['ra.f4'])
  return (
    <div style={{ margin: '14px 2px 0' }}>
      {tituloPref(Gift, 'Regalos que le gustaría recibir')}
      {regalos.length ? <Chips lista={regalos} /> : vacioPref('Sin regalos agregados')}
      {tituloPref(Sparkles, 'Experiencias que le gustaría vivir', true)}
      {experiencias.length ? <Chips lista={experiencias} /> : vacioPref('Sin experiencias agregadas')}
      <button onClick={onEditar} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 8, padding: '5px 9px', borderRadius: 7, border: '1px dashed var(--mf-verde-txt)', background: 'none', color: 'var(--mf-verde-txt)', fontSize: 7, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
        <Settings size={8} /> Editar en Configuración
      </button>
    </div>
  )
}

/* Regalos y experiencias en edición, en Configuración › Perfil de usuario. */
function PreferenciasEditables({ form, onGuardar }) {
  const [edicion, setEdicion] = useState(null)
  const [guardado, avisar] = useAvisoGuardado()
  const regalos = lineas(form['ra.f1'])
  const experiencias = lineas(form['ra.f4'])
  const titulo = tituloPref
  if (edicion) {
    return (
      <div style={{ margin: '14px 2px 0', padding: '9px 9px 10px', borderRadius: 12, background: 'var(--surface-card)', boxShadow: '0 0 0 1.5px #00E091' }}>
        {titulo(Gift, 'Regalos que le gustaría recibir')}
        <ListaEditable lista={edicion.regalos} setLista={r => setEdicion(e => ({ ...e, regalos: r }))} placeholder="Ej.: Un libro" />
        {titulo(Sparkles, 'Experiencias que le gustaría vivir', true)}
        <ListaEditable lista={edicion.experiencias} setLista={x => setEdicion(e => ({ ...e, experiencias: x }))} placeholder="Ej.: Un viaje" />
        <div style={{ marginTop: 10 }}>
          <GuardarCancelar
            onCancelar={() => setEdicion(null)}
            onGuardar={() => { onGuardar({ 'ra.f1': edicion.regalos.join('\n'), 'ra.f4': edicion.experiencias.join('\n') }); setEdicion(null); avisar() }} />
        </div>
      </div>
    )
  }
  const vacio = vacioPref
  return (
    <div style={{ ...TARJETA, marginTop: 10, padding: '9px 9px 10px' }}>
      {titulo(Gift, 'Regalos que le gustaría recibir')}
      {regalos.length ? <Chips lista={regalos} /> : vacio('Sin regalos agregados')}
      {titulo(Sparkles, 'Experiencias que le gustaría vivir', true)}
      {experiencias.length ? <Chips lista={experiencias} /> : vacio('Sin experiencias agregadas')}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <button onClick={() => setEdicion({ regalos, experiencias })} style={{ padding: '5px 9px', borderRadius: 7, border: '1px dashed var(--mf-verde-txt)', background: 'none', color: 'var(--mf-verde-txt)', fontSize: 7, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
          Editar preferencias
        </button>
        {guardado && <Guardado />}
      </div>
    </div>
  )
}

function Portada({ currentUser, ficha, onAbrir, onConfiguracion }) {
  const form = ficha?.form
  return (
    <div>
      <div style={{
        height: 92, margin: '-10px -10px 0', borderRadius: '0 0 16px 16px', position: 'relative',
        background: 'linear-gradient(160deg, #0B3B3A 0%, #0E8F63 55%, #19D992 100%)',
      }}>
        {[{ I: HelpCircle, l: 'Ayuda', lado: 'left' }, { I: LogOut, l: 'Cerrar sesión', lado: 'right' }].map(({ I, l, lado }) => (
          <span key={l} aria-label={l} style={{
            position: 'absolute', top: 10, [lado]: 10, width: 22, height: 22, borderRadius: 7,
            background: 'var(--surface-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I size={11} style={{ color: 'var(--text-heading)' }} /></span>
        ))}
      </div>

      <div style={{
        margin: '-42px 2px 0', background: 'var(--surface-card)', borderRadius: 14, padding: '34px 10px 12px',
        textAlign: 'center', position: 'relative', border: '1px solid var(--border-soft)',
      }}>
        <div style={{
          position: 'absolute', top: -28, left: '50%', marginLeft: -28, width: 56, height: 56,
          borderRadius: '50%', border: '2.5px solid #19D992', background: currentUser.color, color: '#fff',
          fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxSizing: 'border-box',
        }}>{currentUser.initials}</div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-heading)' }}>{currentUser.name}</div>
        <div style={{
          display: 'inline-block', marginTop: 5, padding: '3px 10px', borderRadius: 99, background: 'var(--green-bg)',
          border: '1px solid #19D992', fontSize: 7.5, fontWeight: 600, color: 'var(--text-heading)',
        }}>{currentUser.cargo}</div>
        <div style={{ marginTop: 5, fontSize: 7.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {[currentUser.area || ficha?.area, ficha?.sucursal].filter(Boolean).join(' · ')}
          {ficha && <div style={{ color: 'var(--text-muted)' }}>{ficha.antiguedad}</div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 9 }}>
          <span style={{ height: 24, borderRadius: 8, border: '1.5px solid var(--mf-verde-txt)', color: 'var(--mf-verde-txt)', fontSize: 7.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Network size={9} /> Organigrama
          </span>
          <button onClick={onConfiguracion} style={{ height: 24, borderRadius: 8, border: 'none', background: '#00E091', color: '#0C2D40', fontSize: 7.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Settings size={9} /> Configuración
          </button>
        </div>
      </div>

      {ficha ? (
        <>
          <div style={{ margin: '14px 2px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
            <div>
              <div style={{ fontSize: 6.5, letterSpacing: '.12em', fontWeight: 700, color: 'var(--text-muted)' }}>MI FICHA</div>
              <div style={{ fontSize: 7, color: 'var(--text-muted)', marginTop: 2 }}>Revise sus datos registrados por RR.HH.</div>
            </div>
            <span style={{ fontSize: 6.5, fontWeight: 600, color: 'var(--mf-verde-txt)', whiteSpace: 'nowrap' }}>Actualizada {ficha.actualizada}</span>
          </div>
          <div style={{ margin: '6px 2px 0', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--border-soft)' }}>
            {pestanasCon(form).map((p, i) => {
              const I = ICONOS[p.key] || FileText
              const aviso = p.key === 'documentos' && porRenovar(form).length > 0
              return (
                <button key={p.key} onClick={() => onAbrir(p.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 9px',
                  border: 'none', borderTop: i ? '1px solid var(--border)' : 'none', background: 'none',
                  fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
                }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--green-bg)', color: 'var(--mf-verde-txt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <I size={11} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 8, fontWeight: 600, color: 'var(--text-heading)' }}>{p.titulo}</span>
                    <span style={{ display: 'block', fontSize: 6.5, color: 'var(--text-muted)', marginTop: 1 }}>{resumenDe(form, p.key)}</span>
                  </span>
                  {aviso && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--mf-punto)' }} />}
                  <ChevronRight size={10} style={{ color: 'var(--icon-muted)' }} />
                </button>
              )
            })}
          </div>

          <PreferenciasPhone form={form} onEditar={onConfiguracion} />
        </>
      ) : (
        <div style={{ margin: '14px 2px 0', padding: 10, borderRadius: 10, background: 'var(--surface-card)', fontSize: 7.5, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
          RR.HH. todavía no registró su ficha.
        </div>
      )}

      <div style={{ margin: '14px 2px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 6.5, letterSpacing: '.12em', fontWeight: 700, color: 'var(--text-muted)' }}>MIS PUBLICACIONES</div>
        <span aria-label="Nueva publicación" style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={11} />
        </span>
      </div>
    </div>
  )
}

/* Un campo en edición: lista y sí/no con sus opciones, el resto a texto libre. */
function Entrada({ campo, valor, onCambiar }) {
  if (campo.tipo === 'siNo' || campo.tipo === 'lista') {
    const ops = campo.tipo === 'siNo'
      ? [{ v: 'si', t: 'Sí' }, { v: 'no', t: 'No' }]
      : (campo.opciones || []).map(o => (typeof o === 'string' ? { v: o, t: o } : { v: o.valor, t: o.etiqueta ?? o.valor }))
    return (
      <select value={valor} onChange={e => onCambiar(e.target.value)} style={CAMPO}>
        <option value="">Elegir…</option>
        {ops.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
      </select>
    )
  }
  return <input value={valor} onChange={e => onCambiar(e.target.value)} style={CAMPO} />
}

/* Una sección de la ficha. En Mi ficha sólo se lee; con `onGuardar` —desde Configuración ›
   Perfil de usuario— se puede editar. */
function Seccion({ s, form, abierta, onAlternar, onGuardar }) {
  const puedeEditar = Boolean(onGuardar)
  const [ver, setVer] = useState(false)
  const [valores, setValores] = useState(null)
  const [guardado, avisar] = useAvisoGuardado()
  const editables = camposEditables(s)
  const editar = () => setValores(Object.fromEntries(editables.filter(c => c.tipo !== 'rotulo').map(c => [c.key, form[c.key] ?? ''])))
  const guardar = () => { onGuardar(valores); setValores(null); avisar() }

  if (valores) {
    return (
      <div style={{ ...TARJETA, overflow: 'visible', boxShadow: '0 0 0 1.5px #00E091', padding: '8px 9px' }}>
        <div style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 2 }}>{s.titulo}</div>
        {editables.map(c => c.tipo === 'rotulo' ? (
          <div key={c.key} style={{ fontSize: 7, fontWeight: 700, color: 'var(--mf-verde-txt)', marginTop: 9, textTransform: 'uppercase', letterSpacing: '.06em' }}>{c.label}</div>
        ) : (
          <label key={c.key} style={{ display: 'block', fontSize: 6.5, color: 'var(--text-muted)', marginTop: 5 }}>
            {c.label}
            <Entrada campo={c} valor={valores[c.key]} onCambiar={v => setValores(x => ({ ...x, [c.key]: v }))} />
          </label>
        ))}
        <div style={{ marginTop: 9 }}>
          <GuardarCancelar onGuardar={guardar} onCancelar={() => setValores(null)} />
        </div>
      </div>
    )
  }

  return (
    <div style={TARJETA}>
      {/* La cabecera con los colores de la ficha de RR.HH.: gris plegada, verde abierta. */}
      <button onClick={onAlternar} aria-expanded={abierta} className={`mf-sec-cab${abierta && !s.vacia ? ' on' : ''}`} style={{
        display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '8px 9px', border: 'none',
        fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
      }}>
        <span style={{ flex: 1, fontSize: 8, fontWeight: 600 }}>{s.titulo}</span>
        {s.privada && <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 6, opacity: .75 }}><Lock size={7} /> Solo usted y RR.HH.</span>}
        {s.vacia && !puedeEditar && <span style={{ fontSize: 6.5, opacity: .7 }}>Sin asignaciones</span>}
        {!s.vacia && <ChevronDown size={10} style={{ opacity: .7, transform: abierta ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}
      </button>
      {abierta && (!s.vacia || puedeEditar) && (
        <div>
          {s.bloques.map((b, bi) => (
            <div key={bi}>
              {b.titulo && (
                <div style={{ padding: '6px 9px 2px', borderTop: '1px solid var(--border)', fontSize: 6.5, fontWeight: 700, color: 'var(--mf-verde-txt)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{b.titulo}</div>
              )}
              {b.datos.map(d => (
                <div key={d.key} style={{ padding: '5px 9px', borderTop: b.titulo ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ fontSize: 6.5, color: 'var(--text-muted)' }}>{d.label}</div>
                  <div style={{ fontSize: 8, fontWeight: 500, color: 'var(--text-heading)', marginTop: 1 }}>{d.reservado && !ver ? '••••••' : d.valor}</div>
                </div>
              ))}
            </div>
          ))}
          {(puedeEditar || s.reservada) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 9px 8px', borderTop: '1px solid var(--border)' }}>
              {puedeEditar && (
                <button onClick={editar} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 99, border: 'none', background: 'var(--green-bg)', color: 'var(--mf-verde-txt)', fontSize: 6.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                  <Pencil size={7} /> Editar
                </button>
              )}
              {guardado && <Guardado />}
              {s.reservada && (
                <button onClick={() => setVer(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 99, border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-heading)', fontSize: 6.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                  {ver ? <EyeOff size={7} /> : <Eye size={7} />} {ver ? 'Ocultar montos' : 'Mostrar montos'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MisSolicitudes({ lista }) {
  if (!lista.length) return null
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 6, letterSpacing: '.1em', fontWeight: 700, color: 'var(--text-muted)', margin: '0 2px 4px' }}>MIS SOLICITUDES DE CORRECCIÓN</div>
      <div style={{ background: 'var(--surface-card)', borderRadius: 11, border: '1px solid var(--border-soft)' }}>
        {lista.map((x, i) => (
          <div key={x.id} style={{ padding: '7px 9px', borderTop: i ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ flex: 1, fontSize: 7.5, fontWeight: 600, color: 'var(--text-heading)' }}>{x.dato}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 6, fontWeight: 600, padding: '1px 6px', borderRadius: 99, background: 'var(--mf-pend-bg)', color: 'var(--mf-pend-txt)' }}>
                <Clock size={7} /> {x.estado}
              </span>
            </div>
            <div style={{ fontSize: 6.5, color: 'var(--text-muted)', marginTop: 2 }}>{x.seccion} · Correcto: <b style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{x.correcto}</b></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Datos({ pestana, form, solicitudes, onCorregir }) {
  const partes = partesDe(pestana, form)
  const [parte, setParte] = useState(0)
  const [abiertas, setAbiertas] = useState(() => new Set([0]))
  const alternar = i => setAbiertas(a => { const n = new Set(a); n.has(i) ? n.delete(i) : n.add(i); return n })
  const actual = partes[Math.min(parte, partes.length - 1)]
  const titulosDePestana = new Set(partes.flatMap(p => p.secciones.map(s => s.titulo)))
  const mias = solicitudes.filter(x => titulosDePestana.has(x.seccion))
  const recursos = pestana === 'recursos'
  return (
    <>
      {partes.length > 1 && (
        <div style={{ display: 'flex', gap: 3, background: 'var(--bg-secondary)', borderRadius: 8, padding: 2.5, marginBottom: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {partes.map((p, i) => (
            <button key={p.key} onClick={() => { setParte(i); setAbiertas(new Set([0])) }} style={{
              flex: '1 0 auto', padding: '5px 7px', borderRadius: 6, border: 'none', fontFamily: 'inherit', cursor: 'pointer',
              fontSize: 7, fontWeight: parte === i ? 700 : 500, whiteSpace: 'nowrap',
              background: parte === i ? 'var(--surface-card)' : 'transparent', color: parte === i ? 'var(--text-heading)' : 'var(--text-muted)',
              boxShadow: parte === i ? '0 1px 3px rgba(12,45,64,.12)' : 'none',
            }}>{p.titulo.replace('Información ', '').replace(', Nómina y Afiliaciones', '')}</button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 5, padding: '6px 8px', borderRadius: 8, background: 'var(--mf-info-bg)', color: 'var(--mf-info-txt)', fontSize: 6.5, lineHeight: 1.45 }}>
        <Info size={9} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{recursos
          ? 'Lo que la empresa le entregó para trabajar. Si algo no coincide, solicite su corrección.'
          : 'Estos datos los registró RR.HH. Si alguno no es correcto, solicite su corrección.'}</span>
      </div>
      {actual?.secciones.map((s, i) => (
        <Seccion key={`${actual.key}-${s.id}`} s={s} form={form} abierta={abiertas.has(i)} onAlternar={() => alternar(i)} />
      ))}
      <button onClick={onCorregir} style={{
        width: '100%', marginTop: 10, height: 28, borderRadius: 8, border: '1.5px solid var(--text-heading)', background: 'var(--surface-card)',
        color: 'var(--text-heading)', fontSize: 7.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
      }}>Solicitar corrección de un dato</button>
      <MisSolicitudes lista={mias} />
    </>
  )
}

const ESTADO = {
  vigente: { t: 'Vigente', bg: 'var(--green-bg)', c: 'var(--mf-vig-txt)' },
  'por-vencer': { t: 'Por vencer', bg: 'var(--mf-por-bg)', c: 'var(--mf-por-txt)' },
  vencido: { t: 'Vencido', bg: 'var(--mf-ven-bg)', c: 'var(--mf-ven-txt)' },
}

const esImagen = d => /\.(jpe?g|png|webp)$/i.test(d.archivo)

/* ── VER UN DOCUMENTO ──────────────────────────────────────────────────────
   A pantalla completa del teléfono: la hoja arriba, sus datos debajo y la descarga al final. */
function VisorPhone({ doc, titular, onVolver }) {
  const e = ESTADO[doc.estado]
  const dato = (t, v) => v && (
    <div style={{ padding: '5px 9px', borderTop: '1px solid var(--border)' }}>
      <div style={{ fontSize: 6.5, color: 'var(--text-muted)' }}>{t}</div>
      <div style={{ fontSize: 8, fontWeight: 500, color: 'var(--text-heading)', marginTop: 1 }}>{v}</div>
    </div>
  )
  return (
    <>
      <button onClick={onVolver} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: 0, border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 7.5, fontWeight: 600, color: 'var(--mf-verde-txt)', cursor: 'pointer', marginBottom: 6 }}>
        <ChevronLeft size={10} /> Todos los documentos
      </button>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.3 }}>{doc.nombre}</div>
      <div style={{ marginTop: 8, borderRadius: 10, background: 'var(--bg-secondary)' }}>
        <HojaDocumento doc={doc} titular={titular} chico />
      </div>
      <div style={{ ...TARJETA, marginTop: 8 }}>
        <div style={{ padding: '6px 9px', fontSize: 6, letterSpacing: '.1em', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{doc.grupo}</div>
        {dato('Archivo', doc.archivo)}
        {dato('Fecha de emisión', doc.emite)}
        {dato('Fecha de vencimiento', doc.vence)}
        {e && (
          <div style={{ padding: '5px 9px 7px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 6.5, color: 'var(--text-muted)' }}>Estado</div>
            <span style={{ display: 'inline-block', marginTop: 2, padding: '1px 6px', borderRadius: 99, background: e.bg, color: e.c, fontWeight: 600, fontSize: 6.5 }}>{e.t}</span>
          </div>
        )}
      </div>
      <button style={{ ...BOTON, width: '100%', height: 28, marginTop: 10, gap: 4, border: 'none', background: '#00E091', color: '#0C2D40' }}>
        <Download size={9} /> Descargar
      </button>
    </>
  )
}

function Documentos({ form }) {
  const [filtro, setFiltro] = useState('todos')
  const [viendo, setViendo] = useState(null)
  const ver = d => { setViendo(d); document.querySelector('.phone-scroll')?.scrollTo(0, 0) }
  const docs = documentosDe(form)
  const renovar = docs.filter(d => d.estado === 'por-vencer' || d.estado === 'vencido')
  const lista = filtro === 'todos' ? docs : renovar
  if (viendo) return <VisorPhone doc={viendo} titular={titularDe(form)} onVolver={() => setViendo(null)} />
  return (
    <>
      <div style={{ display: 'flex', gap: 4 }}>
        {[['todos', `Todos · ${docs.length}`], ['renovar', `Por renovar · ${renovar.length}`]].map(([k, t]) => (
          <button key={k} onClick={() => setFiltro(k)} style={{
            padding: '4px 9px', borderRadius: 99, fontFamily: 'inherit', fontSize: 7, cursor: 'pointer',
            border: `1px solid ${filtro === k ? 'var(--navy)' : 'var(--border-dark)'}`,
            background: filtro === k ? 'var(--navy)' : 'var(--surface-card)', color: filtro === k ? '#fff' : 'var(--text-heading)',
          }}>{t}</button>
        ))}
      </div>
      {renovar.map(d => (
        <div key={d.key} style={{ display: 'flex', gap: 5, marginTop: 8, padding: '6px 8px', borderRadius: 8, background: d.estado === 'vencido' ? 'var(--mf-ven-bg)' : 'var(--mf-por-bg)', color: d.estado === 'vencido' ? 'var(--mf-ven-aviso)' : 'var(--mf-por-aviso)', fontSize: 6.5, lineHeight: 1.45 }}>
          <AlertTriangle size={9} style={{ flexShrink: 0, marginTop: 1 }} />
          <span><b>{d.nombre.split(' · ').pop()}</b> {d.estado === 'vencido' ? 'venció' : 'vence'} el {d.vence}. Renuévelo y envíe la copia a RR.HH.</span>
        </div>
      ))}
      {agrupar(lista, 'grupo').map(g => (
        <div key={g.titulo}>
          <div style={{ fontSize: 6, letterSpacing: '.1em', fontWeight: 700, color: 'var(--text-muted)', margin: '11px 2px 4px', textTransform: 'uppercase' }}>{g.titulo}</div>
          <div style={{ background: 'var(--surface-card)', borderRadius: 11, border: '1px solid var(--border-soft)' }}>
            {g.items.map((d, i) => {
              const e = ESTADO[d.estado]
              return (
                <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 8px', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                  {/* Tocar la fila abre la vista previa; la descarga va aparte. */}
                  <button onClick={() => ver(d)} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 7, padding: 0, border: 'none', background: 'none', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {esImagen(d) ? <ImageIcon size={10} /> : <FileText size={10} />}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 7.5, fontWeight: 600, color: 'var(--text-heading)', lineHeight: 1.3 }}>{d.nombre}</span>
                    <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, fontSize: 6.5, color: 'var(--text-muted)', marginTop: 2 }}>
                      {d.vence ? `Vence ${d.vence}` : d.emite ? `Emitido ${d.emite}` : d.archivo}
                      {e && <span style={{ padding: '1px 5px', borderRadius: 99, background: e.bg, color: e.c, fontWeight: 600, fontSize: 6 }}>{e.t}</span>}
                    </span>
                  </span>
                  </button>
                  <button onClick={() => ver(d)} aria-label={`Ver ${d.nombre}`} style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0 }}>
                    <Eye size={11} />
                  </button>
                  <Download size={10} aria-label={`Descargar ${d.nombre}`} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              )
            })}
          </div>
        </div>
      ))}
      <p style={{ margin: '10px 2px 0', fontSize: 6.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Los documentos los sube RR.HH. Si necesita agregar uno, envíelo desde Zona HR.
      </p>
    </>
  )
}

/* ── SOLICITAR LA CORRECCIÓN DE UN DATO ────────────────────────────────────
   Se elige la sección y el dato de la pestaña donde se estaba, se ve lo que está registrado y
   se escribe el valor correcto. RR.HH. recibe el pedido; el dato no cambia hasta que lo atienda. */
function Correccion({ pestana, form, onEnviar, onVolver }) {
  const secciones = partesDe(pestana, form).flatMap(p => p.secciones).filter(s => !s.vacia)
  const [seccionId, setSeccionId] = useState('')
  const [datoKey, setDatoKey] = useState('')
  const [correcto, setCorrecto] = useState('')
  const [comentario, setComentario] = useState('')
  const [enviada, setEnviada] = useState(false)
  const seccion = secciones.find(s => s.id === seccionId)
  const datos = seccion ? seccion.bloques.flatMap(b => b.datos.map(d => ({ ...d, nombre: b.titulo ? `${d.label} (${b.titulo})` : d.label }))) : []
  const dato = datos.find(d => d.key === datoKey)
  const listo = dato && correcto.trim()

  if (enviada) {
    return (
      <div style={{ textAlign: 'center', padding: '28px 8px 10px' }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-bg)', color: 'var(--mf-vig-txt)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={18} />
        </span>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-heading)', marginTop: 10 }}>Solicitud enviada</div>
        <p style={{ fontSize: 7.5, color: 'var(--text-muted)', lineHeight: 1.5, margin: '6px 6px 14px' }}>
          RR.HH. revisará su pedido para corregir «{dato.label}». El dato se actualizará cuando lo apruebe.
        </p>
        <button onClick={onVolver} style={{ ...BOTON, height: 28, border: 'none', background: '#00E091', color: '#0C2D40' }}>Volver a mi ficha</button>
      </div>
    )
  }

  const rotulo = t => <div style={{ fontSize: 6.5, color: 'var(--text-muted)', marginTop: 8 }}>{t}</div>
  return (
    <>
      <p style={{ fontSize: 7, color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 4px' }}>
        Indique qué dato está mal y cuál es el correcto. RR.HH. lo revisará y lo actualizará.
      </p>
      <label>
        {rotulo('Sección')}
        <select value={seccionId} onChange={e => { setSeccionId(e.target.value); setDatoKey('') }} style={CAMPO}>
          <option value="">Elija la sección…</option>
          {secciones.map(s => <option key={s.id} value={s.id}>{s.titulo}</option>)}
        </select>
      </label>
      <label>
        {rotulo('Dato a corregir')}
        <select value={datoKey} onChange={e => setDatoKey(e.target.value)} disabled={!seccion} style={{ ...CAMPO, opacity: seccion ? 1 : .5 }}>
          <option value="">Elija el dato…</option>
          {datos.map(d => <option key={d.key} value={d.key}>{d.nombre}</option>)}
        </select>
      </label>
      {dato && (
        <div style={{ marginTop: 8, padding: '6px 8px', borderRadius: 7, background: 'var(--bg-secondary)' }}>
          <div style={{ fontSize: 6.5, color: 'var(--text-muted)' }}>Registrado actualmente</div>
          <div style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>{dato.reservado ? '••••••' : dato.valor}</div>
        </div>
      )}
      <label>
        {rotulo('¿Cuál es el dato correcto?')}
        <input value={correcto} onChange={e => setCorrecto(e.target.value)} placeholder="Escriba el dato correcto" style={CAMPO} />
      </label>
      <label>
        {rotulo('Comentario (opcional)')}
        <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={3}
          placeholder="Ej.: Adjuntaré la copia del documento en Zona HR"
          style={{ ...CAMPO, height: 'auto', padding: '5px 7px', resize: 'none' }} />
      </label>
      <div style={{ marginTop: 12 }}>
        <GuardarCancelar
          textoGuardar={<><Send size={8} style={{ marginRight: 3, verticalAlign: '-1px' }} />Enviar a RR.HH.</>}
          desactivado={!listo}
          onCancelar={onVolver}
          onGuardar={() => {
            if (!listo) return
            onEnviar({ seccion: seccion.titulo, dato: dato.nombre, registrado: dato.valor, correcto: correcto.trim(), comentario: comentario.trim() })
            setEnviada(true)
          }} />
      </div>
    </>
  )
}

/* ── CONFIGURACIÓN › PERFIL DE USUARIO ─────────────────────────────────────
   Lo único que el colaborador cambia por su cuenta: su contacto, sus contactos de emergencia y
   sus preferencias. Se guarda al momento y Mi ficha lo muestra en seguida. */
function MisDatos({ form, onGuardar }) {
  return (
    <>
      <div style={{ display: 'flex', gap: 5, padding: '6px 8px', borderRadius: 8, background: 'var(--mf-info-bg)', color: 'var(--mf-info-txt)', fontSize: 6.5, lineHeight: 1.45 }}>
        <Info size={9} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Mantenga al día estos datos. El resto de su ficha lo registra RR.HH.; si algo no es correcto, solicite su corrección desde Mi ficha.</span>
      </div>
      {seccionesEditables(form).map(s => (
        <Seccion key={s.id} s={s} form={form} abierta onAlternar={() => {}} onGuardar={onGuardar} />
      ))}
      <PreferenciasEditables form={form} onGuardar={onGuardar} />
    </>
  )
}

export default function PerfilPhone({ currentUser }) {
  const { ficha, guardar, solicitudes, solicitar } = useMiFicha(currentUser.name)
  const [vista, setVista] = useState('portada')
  const [corrigiendo, setCorrigiendo] = useState(false)
  /* Cada pantalla nueva arranca arriba: sin esto, abrir la corrección desde el pie de la ficha
     dejaba el formulario fuera de la vista. */
  const arriba = () => document.querySelector('.phone-scroll')?.scrollTo(0, 0)
  const abrir = v => { setCorrigiendo(false); setVista(v); arriba() }
  const corregir = si => { setCorrigiendo(si); arriba() }

  if (vista === 'config') {
    return <ConfiguracionPhone onVolver={() => abrir('portada')} onPerfilUsuario={ficha ? () => abrir('misdatos') : undefined} />
  }
  if (vista === 'misdatos' && ficha) {
    return (
      <div style={{ padding: '2px 2px' }}>
        <BarraVolver conTema texto="Configuración" onVolver={() => abrir('config')} />
        <div style={{ fontSize: 6.5, color: 'var(--text-muted)' }}>Configuración</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 8 }}>Perfil de usuario</div>
        <MisDatos form={ficha.form} onGuardar={guardar} />
      </div>
    )
  }
  if (vista === 'portada' || !ficha) {
    return <Portada currentUser={currentUser} ficha={ficha} onAbrir={abrir} onConfiguracion={() => abrir('config')} />
  }

  const p = pestanasCon(ficha.form).find(x => x.key === vista)
  return (
    <div style={{ padding: '2px 2px' }}>
      <BarraVolver conTema texto={corrigiendo ? p?.titulo : 'Mi perfil'} onVolver={() => (corrigiendo ? corregir(false) : abrir('portada'))} />
      <div style={{ fontSize: 6.5, color: 'var(--text-muted)' }}>{corrigiendo ? 'Mi ficha · ' + p?.titulo : 'Mi ficha'}</div>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 8 }}>{corrigiendo ? 'Solicitar corrección' : p?.titulo}</div>
      {corrigiendo
        ? <Correccion pestana={vista} form={ficha.form} onEnviar={solicitar} onVolver={() => corregir(false)} />
        : vista === 'documentos'
          ? <Documentos form={ficha.form} />
          : <Datos key={vista} pestana={vista} form={ficha.form} solicitudes={solicitudes} onCorregir={() => corregir(true)} />}
    </div>
  )
}
