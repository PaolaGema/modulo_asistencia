import { useState } from 'react'
import { Bell, Users, Plus, X, Send, Archive, ArchiveRestore } from 'lucide-react'
import Desplegable from '../../components/layout/Desplegable'
import { useCanales } from '../../hooks/useCanales'
import { colaboradoresData } from '../personas/colaboradoresData'

/* CANALES Y GRUPOS — lo que RR.HH. ADMINISTRA de los chats (decisión «dividir», 30 oct 2026).
   Aquí se crean los canales oficiales (publica RR.HH., la gente reacciona) y los grupos de la
   empresa (todos escriben), se elige a quién le llegan y se publica en los canales. Lo que se arma
   aquí aparece en los chats de cada persona, en Mi espacio y en la app. Los chats propios de quien
   es de RR.HH. no están aquí: están en su Mi espacio, como los de cualquiera. */

const AREAS = [...new Set(colaboradoresData.filter(p => p.status === 'activo' && p.depto && p.depto !== 'Sin asignar').map(p => p.depto))].sort()
const PARA = [{ valor: 'Toda la empresa', etiqueta: 'Toda la empresa' }, ...AREAS.map(a => ({ valor: a, etiqueta: `Área · ${a}` }))]
const personasDe = para => colaboradoresData.filter(p => p.status === 'activo' && (para === 'Toda la empresa' || p.depto === para)).length

function NuevoModal({ onCerrar, onCrear }) {
  const [tipo, setTipo] = useState('canal')
  const [nombre, setNombre] = useState('')
  const [para, setPara] = useState('Toda la empresa')
  const listo = nombre.trim().length > 1
  return (
    <div className="pl-overlay" onClick={onCerrar}>
      <div className="pl-modal pl-modal-sm" role="dialog" aria-modal="true" aria-labelledby="cg-nuevo" onClick={e => e.stopPropagation()}>
        <div className="pl-modal-header">
          <h2 id="cg-nuevo">{tipo === 'canal' ? 'Nuevo canal' : 'Nuevo grupo'}</h2>
          <button type="button" className="pl-modal-close" onClick={onCerrar} aria-label="Cerrar"><X size={14} /></button>
        </div>
        <div className="pl-modal-body" style={{ display: 'grid', gap: 14 }}>
          <div className="pl-tipo-tabs" role="tablist">
            {[['canal', 'Canal', Bell], ['grupo', 'Grupo', Users]].map(([k, t, I]) => (
              <button key={k} type="button" role="tab" aria-selected={tipo === k} className="pl-tipo-tab"
                style={tipo === k ? { background: 'var(--surface-card)', color: 'var(--text-heading)', boxShadow: '0 1px 3px rgba(12,45,64,.12)' } : undefined}
                onClick={() => setTipo(k)}><I size={13} />{t}</button>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {tipo === 'canal' ? 'Solo Recursos Humanos publica. La gente lee y reacciona, no responde.' : 'Todos los que están en el grupo pueden escribir.'}
          </p>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="pl-label">Nombre</span>
            <input className="pl-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder={tipo === 'canal' ? 'Ej.: Bienestar' : 'Ej.: Comité de aniversario'} autoFocus />
          </label>
          <div style={{ display: 'grid', gap: 6 }}>
            <span className="pl-label">A quién le llega</span>
            <Desplegable valor={para} onCambio={setPara} opciones={PARA} ariaLabel="A quién le llega" />
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{personasDe(para)} personas lo verán en sus chats.</span>
          </div>
        </div>
        <div className="pl-modal-footer">
          <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
          <button type="button" className="pl-btn-save" disabled={!listo} onClick={() => onCrear({ tipo, nombre: nombre.trim(), para })}>
            {tipo === 'canal' ? 'Crear canal' : 'Crear grupo'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PublicarModal({ canal, onCerrar, onPublicar }) {
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const listo = titulo.trim() && texto.trim()
  return (
    <div className="pl-overlay" onClick={onCerrar}>
      <div className="pl-modal pl-modal-sm" role="dialog" aria-modal="true" aria-labelledby="cg-pub" onClick={e => e.stopPropagation()}>
        <div className="pl-modal-header">
          <h2 id="cg-pub">Publicar en {canal.nombre}</h2>
          <button type="button" className="pl-modal-close" onClick={onCerrar} aria-label="Cerrar"><X size={14} /></button>
        </div>
        <div className="pl-modal-body" style={{ display: 'grid', gap: 14 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="pl-label">Título</span>
            <input className="pl-input" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej.: Uniformes nuevos" autoFocus />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="pl-label">Mensaje</span>
            <textarea className="pl-input" rows={4} value={texto} onChange={e => setTexto(e.target.value)} style={{ height: 'auto', padding: '9px 12px', resize: 'vertical' }}
              placeholder="Lo que la gente necesita saber, en pocas líneas." />
          </label>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Le llega a {canal.para === 'Toda la empresa' ? 'toda la empresa' : `el área ${canal.para}`} ({personasDe(canal.para)} personas).</span>
        </div>
        <div className="pl-modal-footer">
          <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
          <button type="button" className="pl-btn-save" disabled={!listo} onClick={() => onPublicar({ titulo: titulo.trim(), texto: texto.trim() })}>Publicar</button>
        </div>
      </div>
    </div>
  )
}

export default function CanalesGrupos() {
  const [canales, setCanales] = useCanales()
  const [nuevo, setNuevo] = useState(false)
  const [publicando, setPublicando] = useState(null)
  const [verArchivados, setVerArchivados] = useState(false)
  const lista = canales.filter(c => !!c.archivado === verArchivados)
  const archivados = canales.filter(c => c.archivado).length
  const cambiar = (id, f) => setCanales(cs => cs.map(c => (c.id === id ? f(c) : c)))
  const ahora = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }

  return (
    <div className="content-scroll">
      <div className="pl-header">
        <div>
          <h1 className="pl-title">Canales y grupos</h1>
          <p className="pl-subtitle">Los canales oficiales donde publica RR.HH. y los grupos de la empresa. Cada persona los ve en sus chats.</p>
        </div>
        <button type="button" className="pl-btn-new" onClick={() => setNuevo(true)}><Plus size={14} /> Nuevo canal o grupo</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[[false, 'Activos', canales.length - archivados], [true, 'Archivados', archivados]].map(([v, t, n]) => (
          <button key={t} type="button" aria-pressed={verArchivados === v} onClick={() => setVerArchivados(v)} style={{
            height: 32, padding: '0 14px', borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 12.5, cursor: 'pointer',
            fontWeight: verArchivados === v ? 700 : 500, background: verArchivados === v ? 'var(--navy)' : 'var(--surface-card)',
            color: verArchivados === v ? '#fff' : 'var(--text-heading)', boxShadow: verArchivados === v ? 'none' : '0 0 0 1px var(--border-soft)',
          }}>{t} · {n}</button>
        ))}
      </div>

      <div className="sec-card" style={{ overflow: 'hidden' }}>
        {!lista.length ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            {verArchivados ? 'No hay canales ni grupos archivados.' : 'Todavía no hay canales ni grupos. Cree el primero.'}
          </div>
        ) : lista.map((c, i) => {
          const canal = c.tipo === 'canal'
          const ultima = c.publicaciones?.at(-1)
          return (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderTop: i ? '1px solid var(--border-soft)' : 'none' }}>
              <span style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
                background: canal ? 'var(--navy)' : 'rgba(0,224,145,.12)', color: canal ? '#00E091' : '#0A7F55', boxShadow: '0 0 0 2px #00E091',
              }}>{canal ? <Bell size={17} /> : <Users size={17} />}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <b style={{ fontSize: 14, color: 'var(--text-heading)' }}>{c.nombre}</b>
                  <span className={`pl-status ${canal ? 'pl-st-activa' : 'pl-st-inactiva'}`}>{canal ? 'Canal · publica RR.HH.' : 'Grupo · todos escriben'}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                  {c.para === 'Toda la empresa' ? 'Toda la empresa' : `Área · ${c.para}`} · {personasDe(c.para)} personas
                  {canal && ` · ${c.publicaciones?.length || 0} publicaciones${ultima ? ` · la última: «${ultima.titulo}»` : ''}`}
                </div>
              </div>
              {!c.archivado && canal && (
                <button type="button" className="pl-btn-save" onClick={() => setPublicando(c)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Send size={13} /> Publicar</button>
              )}
              <button type="button" className="pl-btn-cancel" onClick={() => cambiar(c.id, x => ({ ...x, archivado: !x.archivado }))} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {c.archivado ? <><ArchiveRestore size={13} /> Reactivar</> : <><Archive size={13} /> Archivar</>}
              </button>
            </div>
          )
        })}
      </div>

      {nuevo && (
        <NuevoModal onCerrar={() => setNuevo(false)} onCrear={x => {
          setCanales(cs => [...cs, { id: `c-${Date.now()}`, ...x, personas: personasDe(x.para), publicaciones: [], archivado: false }])
          setNuevo(false)
          setVerArchivados(false)
        }} />
      )}
      {publicando && (
        <PublicarModal canal={publicando} onCerrar={() => setPublicando(null)} onPublicar={p => {
          cambiar(publicando.id, c => ({ ...c, publicaciones: [...(c.publicaciones || []), { ...p, dia: 'Hoy', hora: ahora(), reacciones: {} }] }))
          setPublicando(null)
        }} />
      )}
    </div>
  )
}
