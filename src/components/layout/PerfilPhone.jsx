import { useEffect, useRef, useState } from 'react'
import {
  HelpCircle, LogOut, Network, Settings, User, Briefcase, FileText, Monitor, ChevronRight,
  ChevronDown, Gift, Sparkles, Plus, Info, Download, AlertTriangle, Pencil, Eye, EyeOff, Check, X,
  GraduationCap, Image as ImageIcon, Trash2, Upload, Search,
} from 'lucide-react'
import BarraVolver from './BarraVolver'
import ConfiguracionPhone from './ConfiguracionPhone'
import HojaDocumento from '../personas/HojaDocumento'
import { useMiFicha } from '../../hooks/useMiFicha'
import { useEdicionPerfil } from '../../hooks/useEdicionPerfil'
import {
  pestanasCon, partesDe, documentosDe, agrupar, lineas, titularDe, resumenDe, porRenovar,
  pestanaConEditables, preferenciasVisibles, preferenciasEditables,
} from '../../data/miFichaLectura'
import { cuantosHay, tarjetasDe } from '../../data/fichaColaborador'
import { CODIGOS_PAIS, paisPorSigla, partirTelefono } from '../../data/codigosPais'
import { useFotoPerfil } from '../../hooks/useFotoPerfil'
import { guardarArchivo, nuevaClaveArchivo } from '../../utils/archivosLocales'
import logoClaro from '../../assets/imagenes/logo_souly_claro.png'

/* LA PESTAÑA «PERFIL» DEL TELÉFONO: el perfil de siempre —banda, foto, nombre, cargo— con
   «Mi ficha» debajo. Cada fila abre una pestaña de la ficha en pantalla propia; la barra de
   abajo sigue visible porque no se sale de «Perfil». Mi ficha sólo se lee: su Información
   Personal, con sus documentos, y sus preferencias las edita en Configuración › Editar perfil
   de usuario (`EditarPerfil`). Lo que se enseña y cómo se lee sale de `miFichaLectura`, el mismo
   módulo que usa la web. */

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

const tituloPref = (I, t, arriba) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, fontWeight: 700, color: 'var(--text-heading)', marginTop: arriba ? 11 : 0 }}>
    <I size={11} /> {t}
  </div>
)
const vacioPref = t => <div style={{ fontSize: 7, fontStyle: 'italic', color: 'var(--icon-muted)', marginTop: 5 }}>{t}</div>

/* Regalos y experiencias en la portada: para mirar. Se cambian en Configuración. */
function PreferenciasPhone({ form }) {
  const regalos = lineas(form['ra.f1'])
  const experiencias = lineas(form['ra.f4'])
  return (
    <div style={{ margin: '14px 2px 0' }}>
      {tituloPref(Gift, 'Regalos que le gustaría recibir')}
      {regalos.length ? <Chips lista={regalos} /> : vacioPref('Sin regalos agregados')}
      {tituloPref(Sparkles, 'Experiencias que le gustaría vivir', true)}
      {experiencias.length ? <Chips lista={experiencias} /> : vacioPref('Sin experiencias agregadas')}
    </div>
  )
}

function Portada({ currentUser, ficha, onAbrir, onConfiguracion }) {
  const form = ficha?.form
  const [sinFoto, setSinFoto] = useState(false)
  const foto = useFotoPerfil(currentUser.name, form?.['1.9'], 120)
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
        <img src={logoClaro} alt="SoulyHR" style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', height: 15, width: 'auto', opacity: .95,
        }} />
      </div>

      <div style={{
        margin: '-42px 2px 0', background: 'var(--surface-card)', borderRadius: 14, padding: '34px 10px 12px',
        textAlign: 'center', position: 'relative', border: '1px solid var(--border-soft)',
      }}>
        <div style={{
          position: 'absolute', top: -28, left: '50%', marginLeft: -28, width: 56, height: 56,
          borderRadius: '50%', border: '2.5px solid #19D992', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxSizing: 'border-box',
        }}>
          {sinFoto ? (
            <span style={{ width: '100%', height: '100%', background: currentUser.color, color: '#fff', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {currentUser.initials}
            </span>
          ) : (
            <img src={foto} alt={currentUser.name} onError={() => setSinFoto(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}
        </div>
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

          {preferenciasVisibles() && <PreferenciasPhone form={form} />}
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

/* Una sección de la ficha, para leer. Acordeón con cabecera verde abierta / gris plegada,
   igual que el de la ficha de RR.HH. Los montos reservados se destapan a pedido. */
function Seccion({ s, abierta, onAlternar }) {
  const [ver, setVer] = useState(false)
  return (
    <div style={{ ...TARJETA, borderStyle: s.vacia ? 'dashed' : 'solid' }}>
      <button onClick={onAlternar} aria-expanded={abierta} className={`mf-sec-cab${abierta && !s.vacia ? ' on' : ''}`} style={{
        display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '8px 9px', border: 'none',
        fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
        borderRadius: abierta && !s.vacia ? '11px 11px 0 0' : 11,
      }}>
        <ChevronDown size={10} style={{ flexShrink: 0, opacity: .7, transform: abierta ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        <span style={{ flex: 1, fontSize: 8, fontWeight: 600 }}>{s.titulo}</span>
        {s.vacia && <span style={{ fontSize: 6.5, opacity: .7 }}>Sin asignaciones</span>}
      </button>
      {abierta && !s.vacia && (
        <div>
          {s.reservada && (
            <div style={{ display: 'flex', alignItems: 'center', padding: '5px 9px', borderBottom: '1px solid var(--border)' }}>
              <button onClick={() => setVer(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 99, border: 'none', background: 'var(--surface-card)', color: 'var(--text-heading)', fontSize: 6, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                {ver ? <EyeOff size={7} /> : <Eye size={7} />} {ver ? 'Ocultar montos' : 'Mostrar montos'}
              </button>
            </div>
          )}
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
        </div>
      )}
    </div>
  )
}

function Datos({ pestana, form }) {
  // Lo que la empresa le deja editar (`configFicha`): el aviso le dice dónde cambiarlo.
  const suya = pestanaConEditables(pestana)
  const partes = partesDe(pestana, form)
  const recursos = pestana === 'recursos'
  const [abiertas, setAbiertas] = useState(() => new Set([0]))
  let idx = 0
  const alternar = i => setAbiertas(a => { const n = new Set(a); n.has(i) ? n.delete(i) : n.add(i); return n })
  return (
    <>
      <div style={{ display: 'flex', gap: 5, padding: '6px 8px', borderRadius: 8, background: 'var(--mf-info-bg)', color: 'var(--mf-info-txt)', fontSize: 6.5, lineHeight: 1.45 }}>
        <Info size={9} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{suya
          ? 'Estos datos los mantiene usted al día. Para cambiarlos, entre a Configuración › Editar perfil de usuario.'
          : recursos
            ? 'Lo que la empresa le entregó para trabajar.'
            : 'Estos datos los registró RR.HH.'}</span>
      </div>
      {partes.map(parte => (
        <div key={parte.key}>
          {parte.titulo && <div style={{ margin: '10px 0 5px', fontSize: 8, fontWeight: 700, color: 'var(--text-heading)' }}>{parte.titulo}</div>}
          {parte.secciones.map(s => {
            const i = idx++
            return <Seccion key={s.id} s={s} abierta={abiertas.has(i)} onAlternar={() => alternar(i)} />
          })}
        </div>
      ))}
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
   Bottom sheet dentro del teléfono: fondo oscuro arriba, tarjeta blanca con la vista previa,
   los datos del documento y la descarga. */
function VisorPhone({ doc, titular, onVolver }) {
  const e = ESTADO[doc.estado]
  const dato = (t, v) => v && (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0', borderTop: '1px solid var(--border)' }}>
      <span style={{ fontSize: 6.5, color: 'var(--text-muted)' }}>{t}</span>
      <span style={{ fontSize: 7, fontWeight: 500, color: 'var(--text-heading)' }}>{v}</span>
    </div>
  )
  return (
    <div className="mf-sheet-velo" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', margin: '-10px -10px 0' }}>
      <div onClick={onVolver} style={{ flex: '0 0 30px', background: 'rgba(12,45,64,.55)', cursor: 'pointer' }} />
      <div className="mf-sheet-panel" style={{ flex: 1, background: 'var(--surface-card)', borderRadius: '14px 14px 0 0', padding: '0 10px 10px', marginTop: -4 }}>
        <div style={{ width: 28, height: 3, borderRadius: 2, background: 'var(--border-dark)', margin: '6px auto 8px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.3 }}>{doc.nombre}</div>
            <div style={{ fontSize: 6.5, color: 'var(--text-muted)', marginTop: 1 }}>{doc.grupo}</div>
          </div>
          <button onClick={onVolver} style={{ width: 20, height: 20, borderRadius: 6, border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0 }}>
            <X size={10} />
          </button>
        </div>
        <div style={{ borderRadius: 8, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
          <HojaDocumento doc={doc} titular={titular} chico />
        </div>
        <div style={{ padding: '6px 0' }}>
          {dato('Archivo', doc.archivo)}
          {dato('Fecha de emisión', doc.emite)}
          {dato('Fecha de vencimiento', doc.vence)}
          {e && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 6.5, color: 'var(--text-muted)' }}>Estado</span>
              <span style={{ padding: '1px 6px', borderRadius: 99, background: e.bg, color: e.c, fontWeight: 600, fontSize: 6.5 }}>{e.t}</span>
            </div>
          )}
        </div>
        <button style={{ ...BOTON, width: '100%', height: 24, gap: 4, border: 'none', background: '#00E091', color: '#0C2D40' }}>
          <Download size={9} /> Descargar
        </button>
      </div>
    </div>
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
        Los documentos de su Información Personal puede cambiarlos en Configuración › Editar perfil de usuario. Los demás los sube RR.HH.
      </p>
    </>
  )
}

/* ── CONFIGURACIÓN › EDITAR PERFIL DE USUARIO ──────────────────────────────
   Su Información Personal —la suya y la de su familia— con los documentos que van en ella, y sus
   preferencias. Los campos están abiertos desde que se entra; los cambios se juntan y se guardan
   todos con «Guardar cambios», que aparece abajo apenas hay uno. Lo que vive en `useEdicionPerfil`
   es lo mismo que usa la web. */
const ROTULO_CAMPO = { display: 'block', fontSize: 6.5, color: 'var(--text-muted)', marginTop: 6 }

/* ── LAS LISTAS DEL TELÉFONO ─────────────────────────────────────────────────
   El desplegable de «Nuevo colaborador» (`Desplegable`) a la escala del teléfono: la lista se abre
   pegada debajo de su caja —o encima, si abajo no cabe—, con la elegida resaltada y su ✓, y un
   buscador arriba cuando las opciones ya no caben de un vistazo —el mismo umbral, ocho—. Se cierra
   eligiendo, tocando fuera o con Escape. Un `<select>` nativo aquí abría la lista de Windows,
   enorme y fuera del teléfono. */
const CON_BUSCADOR = 8
const ALTO_MENU = 150
const sinTildes = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/* Abierto, cerrado y hacia dónde: abajo si cabe antes de lo que tapa el fondo del teléfono —la
   barra de «Guardar cambios» cuando está, si no la de pestañas—; si no cabe, arriba. */
function useMenuPhone(caja) {
  const [abierto, setAbierto] = useState(false)
  const [arriba, setArriba] = useState(false)
  useEffect(() => {
    if (!abierto) return
    const fuera = e => { if (!caja.current?.contains(e.target)) setAbierto(false) }
    const tecla = e => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', tecla) }
  }, [abierto, caja])
  const alternar = () => {
    if (!abierto) {
      const r = caja.current?.getBoundingClientRect()
      const marco = document.getElementById('marco-telefono')
      const m = marco?.getBoundingClientRect()
      // 70: la barra de pestañas de abajo, que tapa lo que cae detrás.
      const suelo = marco?.querySelector('[data-barra-guardar]')?.getBoundingClientRect().top ?? (m && m.bottom - 70)
      setArriba(!!(r && m && suelo - r.bottom < ALTO_MENU && r.top - m.top > ALTO_MENU))
    }
    setAbierto(a => !a)
  }
  return { abierto, arriba, alternar, cerrar: () => setAbierto(false) }
}

function MenuPhone({ opciones, valor, onElegir, arriba, quitable, buscaPh = 'Buscar…' }) {
  const [busca, setBusca] = useState('')
  const lista = useRef(null)
  // La elegida a la vista al abrir: entre doscientos países, Bolivia no está arriba.
  useEffect(() => {
    const l = lista.current, o = l?.querySelector('[aria-selected="true"]')
    if (o) l.scrollTop = o.offsetTop - l.clientHeight / 2 + o.offsetHeight / 2
  }, [])
  const q = sinTildes(busca.trim())
  const vistas = q ? opciones.filter(o => sinTildes(`${o.t} ${o.lateral || ''}`).includes(q)) : opciones
  return (
    <div className={`mf-dd-menu${arriba ? ' arriba' : ''}`}>
      {opciones.length > CON_BUSCADOR && (
        <label className="mf-dd-busca">
          <Search size={8} />
          <input autoFocus value={busca} onChange={e => setBusca(e.target.value)} placeholder={buscaPh} />
        </label>
      )}
      <div ref={lista} role="listbox" className="mf-dd-lista">
        {quitable && valor && !q && (
          <button type="button" className="mf-dd-op vacia" onClick={() => onElegir('')}>Sin elegir</button>
        )}
        {vistas.map(o => {
          const on = o.v === valor
          return (
            <button key={o.v} type="button" role="option" aria-selected={on} className={`mf-dd-op${on ? ' on' : ''}`} onClick={() => onElegir(o.v)}>
              {o.sigla && <span className="mf-dd-sigla">{o.sigla}</span>}
              <span className="mf-dd-txt">{o.t}</span>
              {o.lateral && <span className="mf-dd-lateral">{o.lateral}</span>}
              {on && <Check size={9} className="mf-dd-check" />}
            </button>
          )
        })}
        {!vistas.length && <p className="mf-dd-nada">Sin resultados para «{busca.trim()}».</p>}
      </div>
    </div>
  )
}

/* El disparador de una lista: se ve como las demás cajas, con lo elegido o «Elegir…» en gris. */
function ListaPhone({ campo, valor, onCambiar }) {
  const caja = useRef(null)
  const m = useMenuPhone(caja)
  const ops = (campo.opciones || []).map(o => (typeof o === 'string' ? { v: o, t: o } : { v: o.valor, t: o.etiqueta ?? o.valor }))
  const elegida = ops.find(o => o.v === valor)
  return (
    <div ref={caja} style={{ position: 'relative' }}>
      <button type="button" onClick={m.alternar} aria-haspopup="listbox" aria-expanded={m.abierto} aria-label={`${campo.label}: ${elegida ? elegida.t : 'sin elegir'}`}
        className={`mf-dd-caja${m.abierto ? ' abierta' : ''}`} style={{
          ...CAMPO, display: 'flex', alignItems: 'center', gap: 4, textAlign: 'left', cursor: 'pointer',
          color: elegida || valor ? 'var(--text-heading)' : 'var(--icon-muted)',
        }}>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{elegida ? elegida.t : (valor || 'Elegir…')}</span>
        <ChevronDown size={9} style={{ flexShrink: 0, opacity: .6, transform: m.abierto ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </button>
      {m.abierto && <MenuPhone opciones={ops} valor={valor} arriba={m.arriba} quitable={!campo.requerido} onElegir={v => { onCambiar(v); m.cerrar() }} />}
    </div>
  )
}

/* Sí / No en dos botones, como en la ficha de RR.HH.: ninguno marcado es «todavía no contestó». */
function SiNoPhone({ campo, valor, onCambiar }) {
  return (
    <div role="group" aria-label={campo.label} style={{ display: 'flex', gap: 4, marginTop: 2 }}>
      {[{ v: 'si', t: 'Sí' }, { v: 'no', t: 'No' }].map(o => {
        const on = valor === o.v
        return (
          <button key={o.v} type="button" aria-pressed={on} onClick={() => onCambiar(o.v)} style={{
            flex: 1, height: 24, borderRadius: 6, fontFamily: 'inherit', fontSize: 8, fontWeight: on ? 600 : 500, cursor: 'pointer',
            border: `1px solid ${on ? 'var(--mf-verde-txt)' : 'var(--border-dark)'}`,
            background: on ? 'var(--green-bg)' : 'var(--surface-card)', color: on ? 'var(--mf-verde-txt)' : 'var(--text-heading)',
          }}>{o.t}</button>
        )
      })}
    </div>
  )
}

/* EL CELULAR, COMO EN LA FICHA DE RR.HH.: el código de país a la izquierda —«BO +591 ▾»— y el
   número a la derecha, en la misma caja. Se guarda igual que allá —«+591 71244890» y el país en
   `<clave>pais`— con las mismas funciones (`partirTelefono`), así que lo que se escribe aquí se lee
   bien en la web y en RR.HH. Ver `CampoTelefono`. El código abre la lista de países debajo. */
const PAISES = CODIGOS_PAIS.map(p => ({ v: p.sigla, t: p.pais, sigla: p.sigla, lateral: p.codigo }))
function TelefonoPhone({ campo, form, set }) {
  const caja = useRef(null)
  const m = useMenuPhone(caja)
  const porDefecto = paisPorSigla(campo.paisPorDefecto) || paisPorSigla('BO')
  const { pais, numero } = partirTelefono(form[campo.key], form[`${campo.key}pais`], porDefecto)
  const guardar = (p, n) => set(campo.key, n ? `${p.codigo} ${n}` : '')
  return (
    <div ref={caja} style={{ position: 'relative' }}>
      <span className={`mf-dd-caja${m.abierto ? ' abierta' : ''}`} style={{ ...CAMPO, display: 'flex', alignItems: 'center', padding: 0, overflow: 'hidden' }}>
        <button type="button" onClick={m.alternar} aria-haspopup="listbox" aria-expanded={m.abierto} aria-label={`Código de país: ${pais.pais}, ${pais.codigo}`} style={{
          display: 'flex', alignItems: 'center', gap: 3, height: '100%', padding: '0 5px 0 6px', flexShrink: 0,
          border: 'none', borderRight: '1px solid var(--border-dark)', background: 'none', fontFamily: 'inherit', fontSize: 8, color: 'var(--text-heading)', cursor: 'pointer',
        }}>
          <span className="mf-dd-sigla">{pais.sigla}</span>
          <span>{pais.codigo}</span>
          <ChevronDown size={8} style={{ opacity: .6, transform: m.abierto ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
        </button>
        <input
          type="tel"
          inputMode="tel"
          aria-label={campo.label}
          value={numero}
          placeholder={campo.ph || 'Número'}
          onChange={e => {
            let v = e.target.value
            if (v.trim().startsWith(pais.codigo)) v = v.trim().slice(pais.codigo.length)
            guardar(pais, v.replace(/[^\d ]/g, '').replace(/^ +/, '').slice(0, 20))
          }}
          style={{ flex: 1, minWidth: 0, height: '100%', padding: '0 7px', border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 8, color: 'var(--text-heading)', outline: 'none' }}
        />
      </span>
      {m.abierto && (
        <MenuPhone opciones={PAISES} valor={pais.sigla} arriba={m.arriba} buscaPh="Buscar país o código…" onElegir={sigla => {
          const nuevo = paisPorSigla(sigla)
          set(`${campo.key}pais`, nuevo.sigla)
          guardar(nuevo, numero)
          m.cerrar()
        }} />
      )}
    </div>
  )
}

/* Un campo abierto, con las reglas de la ficha de RR.HH. (`CampoFicha`): lista desplegable, sí/no
   en dos botones, fecha con su calendario, el celular con su código de país, descripción en
   varias líneas, cifras solas donde el campo es un número, y el resto a texto libre. */
function Entrada({ campo, valor, onCambiar, form, set }) {
  if (campo.telefono) return <TelefonoPhone campo={campo} form={form} set={set} />
  if (campo.tipo === 'siNo') return <SiNoPhone campo={campo} valor={valor} onCambiar={onCambiar} />
  if (campo.tipo === 'lista') return <ListaPhone campo={campo} valor={valor} onCambiar={onCambiar} />
  if (campo.tipo === 'texto') {
    return <textarea value={valor} rows={2} onChange={e => onCambiar(e.target.value)} placeholder={campo.ph} style={{ ...CAMPO, height: 'auto', padding: '5px 7px', resize: 'none' }} />
  }
  if (campo.html === 'date') return <input type="date" value={valor} onChange={e => onCambiar(e.target.value)} style={CAMPO} />
  const cifras = campo.max != null || campo.numero
  return (
    <input
      type={campo.html === 'email' || campo.html === 'tel' ? campo.html : 'text'}
      inputMode={cifras ? 'numeric' : campo.html === 'tel' ? 'tel' : undefined}
      value={valor}
      onChange={e => onCambiar(cifras
        ? (v => (v === '' || campo.max == null ? v : String(Math.min(Number(v), campo.max))))(e.target.value.replace(/\D/g, '').replace(/^0+/, ''))
        : e.target.value)}
      placeholder={campo.ph}
      style={CAMPO}
    />
  )
}

/* Un documento de la sección: el archivo que hay, o que falta, y el botón para subir otro. En la
   demo se guarda su nombre, que es lo que la vista previa necesita. */
function EntradaArchivo({ campo, valor, onCambiar, onVer }) {
  const nombre = valor?.nombre
  const esImg = nombre && /\.(jpe?g|png|webp)$/i.test(nombre)
  const esPdf = nombre && /\.pdf$/i.test(nombre)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, padding: '6px 7px', borderRadius: 8, border: '1px dashed var(--border-dark)' }}>
      {nombre ? (
        <button onClick={() => onVer({ nombre: campo.label, archivo: nombre, grupo: 'Documentos personales' })} style={{
          flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6,
          padding: 0, border: 'none', background: 'none', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: esImg ? 'var(--green-bg)' : esPdf ? '#fef2f2' : 'var(--bg-secondary)',
            color: esImg ? 'var(--mf-verde-txt)' : esPdf ? '#dc2626' : 'var(--text-muted)',
          }}>
            {esImg ? <ImageIcon size={12} /> : esPdf ? <span style={{ fontSize: 6, fontWeight: 800 }}>PDF</span> : <FileText size={11} />}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 7, fontWeight: 600, color: 'var(--text-heading)', lineHeight: 1.3 }}>{campo.label}</span>
            <span style={{ display: 'block', fontSize: 6.5, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</span>
          </span>
        </button>
      ) : (
        <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={11} />
          </span>
          <span>
            <span style={{ display: 'block', fontSize: 7, fontWeight: 600, color: 'var(--text-heading)', lineHeight: 1.3 }}>{campo.label}</span>
            <span style={{ display: 'block', fontSize: 6.5, color: 'var(--icon-muted)', fontStyle: 'italic', marginTop: 1 }}>Sin archivo</span>
          </span>
        </span>
      )}
      <label style={{ ...BOTON, height: 20, padding: '0 8px', gap: 3, border: '1px solid var(--mf-verde-txt)', color: 'var(--mf-verde-txt)', background: 'var(--surface-card)', flexShrink: 0 }}>
        <Upload size={8} /> {nombre ? 'Cambiar' : 'Subir'}
        <input type="file" accept=".pdf,image/*" hidden onChange={e => { const a = e.target.files?.[0]; if (a) onCambiar({ nombre: a.name }); e.target.value = '' }} />
      </label>
    </div>
  )
}

function SeccionEditable({ s, ed, abierta, onAlternar, onVerDoc }) {
  return (
    <div style={{ ...TARJETA, overflow: 'visible' }}>
      <button onClick={onAlternar} aria-expanded={abierta} className={`mf-sec-cab${abierta ? ' on' : ''}`} style={{
        display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '8px 9px', border: 'none',
        fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
        borderRadius: abierta ? '11px 11px 0 0' : 11,
      }}>
        <ChevronDown size={10} style={{ flexShrink: 0, opacity: .7, transform: abierta ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        <span style={{ flex: 1, fontSize: 8, fontWeight: 600 }}>{s.titulo}</span>
      </button>
      {abierta && (
        <div style={{ padding: '8px 9px 10px' }}>
          {s.campos.map(c => {
            if (c.tipo === 'rotulo') {
              return (
                <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 11, paddingTop: 7, borderTop: '1px solid var(--border)' }}>
                  <span style={{ flex: 1, fontSize: 6.5, fontWeight: 700, color: 'var(--mf-verde-txt)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{c.label}</span>
                  {c.instancia && c.total > c.minimo && (
                    <button onClick={() => ed.quitar(s, c)} aria-label={`Quitar ${c.label}`} style={{ width: 18, height: 18, borderRadius: 5, border: 'none', background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer' }}>
                      <Trash2 size={9} />
                    </button>
                  )}
                </div>
              )
            }
            if (c.tipo === 'repetir') {
              const cuantos = cuantosHay(ed.vivo, c.grupo)
              if (cuantos >= (c.max || Infinity)) return null
              return (
                <button key={c.key} onClick={() => ed.agregar(c)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, width: '100%', marginTop: 9, height: 22, borderRadius: 7, border: '1px dashed var(--mf-verde-txt)', background: 'none', color: 'var(--mf-verde-txt)', fontSize: 7, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                  <Plus size={8} /> {cuantos === 0 && c.labelPrimero ? c.labelPrimero : c.label}
                </button>
              )
            }
            if (c.tipo === 'archivo') return <EntradaArchivo key={c.key} campo={c} valor={ed.vivo[c.key]} onCambiar={v => ed.set(c.key, v)} onVer={onVerDoc} />
            const falta = ed.faltan.some(x => x.key === c.key)
            /* Con botones dentro —lista, sí/no, celular— el rótulo no puede ser `<label>`: tocar
               su texto pulsaría el primer botón, y «¿Tiene alergias?» quedaría en «Sí». */
            const Rotulo = c.tipo === 'siNo' || c.tipo === 'lista' || c.telefono ? 'div' : 'label'
            return (
              <Rotulo key={c.key} style={ROTULO_CAMPO}>
                {c.label}{c.requerido && <span style={{ color: 'var(--mf-ven-txt)' }}> *</span>}
                <Entrada campo={c} valor={ed.vivo[c.key] ?? ''} onCambiar={v => ed.set(c.key, v)} form={ed.vivo} set={ed.set} />
                {falta && <span style={{ display: 'block', fontSize: 6, color: 'var(--mf-ven-txt)', marginTop: 2 }}>Este dato es obligatorio.</span>}
              </Rotulo>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* Una tablita de la ficha de RR.HH. (tipo `filas`) a la escala del teléfono: una fila numerada
   por elemento, se guarda como en la web, un renglón por fila. */
function TablaPhone({ campo, valor, onCambiar }) {
  const texto = String(valor || '')
  const filas = texto ? texto.split('\n') : ['']
  const guardar = nuevas => onCambiar(nuevas.join('\n'))
  return (
    <div style={{ marginTop: 9 }}>
      <div style={{ fontSize: 7, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>{campo.label}</div>
      <div style={{ border: '1px solid var(--border-soft)', borderRadius: 7, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 6, padding: '4px 7px', background: 'var(--bg-secondary)', fontSize: 6, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          <span style={{ width: 9 }}>#</span><span>{campo.columna}</span>
        </div>
        {filas.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 5px 3px 7px', borderTop: '1px solid var(--border-soft)' }}>
            <span style={{ width: 9, fontSize: 7, color: 'var(--text-muted)' }}>{i + 1}</span>
            <input value={f} placeholder={campo.ph} aria-label={`${campo.columna} ${i + 1}`}
              onChange={e => guardar(filas.map((x, j) => (j === i ? e.target.value : x)))}
              style={{ ...CAMPO, marginTop: 0, height: 20, flex: 1, border: 'none', padding: '0 2px', background: 'transparent' }} />
            {filas.length > 1 && (
              <button onClick={() => guardar(filas.filter((_, j) => j !== i))} aria-label={`Quitar ${campo.columna.toLowerCase()} ${i + 1}`}
                style={{ width: 16, height: 16, border: 'none', background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer' }}>
                <Trash2 size={8} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => guardar([...filas, ''])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, width: '100%', marginTop: 5, height: 22, borderRadius: 7, border: '1px dashed var(--mf-verde-txt)', background: 'none', color: 'var(--mf-verde-txt)', fontSize: 7, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
        <Plus size={8} /> {campo.agregar}
      </button>
    </div>
  )
}

// La misma sección «Preferencias» que llena RR.HH., con su cuenta como en la web.
function PreferenciasEditables({ ed }) {
  const [abierta, setAbierta] = useState(true)
  const t = tarjetasDe('quien', ed.vivo, {}).find(x => x.id === 'preferencias')
  if (!t) return null
  const llenos = t.campos.filter(c => lineas(ed.vivo[c.key]).length).length
  return (
    <div style={{ ...TARJETA, overflow: 'visible' }}>
      <button onClick={() => setAbierta(a => !a)} aria-expanded={abierta} className={`mf-sec-cab${abierta ? ' on' : ''}`} style={{
        display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '8px 9px', border: 'none',
        fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', borderRadius: abierta ? '11px 11px 0 0' : 11,
      }}>
        <ChevronDown size={10} style={{ flexShrink: 0, opacity: .7, transform: abierta ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        <span style={{ flex: 1, fontSize: 8, fontWeight: 600 }}>{t.titulo}</span>
        <span style={{ fontSize: 6.5, fontWeight: 600, padding: '2px 6px', borderRadius: 99, background: llenos === t.campos.length ? 'var(--green)' : 'var(--bg-secondary)', color: llenos === t.campos.length ? '#0C2D40' : 'var(--text-muted)' }}>
          {llenos} de {t.campos.length}
        </span>
      </button>
      {abierta && (
        <div style={{ padding: '8px 9px 10px' }}>
          <div style={{ fontSize: 6.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>{t.desc}</div>
          {t.campos.map(c => <TablaPhone key={c.key} campo={c} valor={ed.vivo[c.key]} onCambiar={v => ed.set(c.key, v)} />)}
        </div>
      )}
    </div>
  )
}

const ICONOS_ED = { quien: User, entorno: User, perfil: GraduationCap }
const PISTAS_ED = {
  quien: 'Nombre, CI, contacto, residencia, salud',
  entorno: 'Hijos y contactos de emergencia',
  perfil: 'Su formación y trayectoria',
}

function EditarPerfil({ form, onGuardar, onVolver, currentUser }) {
  const ed = useEdicionPerfil(form, onGuardar)
  const [parte, setParte] = useState(null)
  const [guardado, avisar] = useAvisoGuardado()
  const [abiertas, setAbiertas] = useState(() => new Set([0]))
  const [sinFoto, setSinFoto] = useState(false)
  const foto = useFotoPerfil(currentUser?.name, ed.vivo['1.9'], 80)
  const [docViendo, setDocViendo] = useState(null)
  const arriba = () => document.querySelector('.phone-scroll')?.scrollTo(0, 0)
  const entrar = i => { setParte(i); setAbiertas(new Set([0])); arriba() }
  const alternar = i => setAbiertas(a => { const n = new Set(a); n.has(i) ? n.delete(i) : n.add(i); return n })

  // Las partes que la empresa le deja editar (`configFicha`), y las preferencias si también.
  const categorias = [...ed.partes.map((p, i) => ({ titulo: p.titulo, pista: PISTAS_ED[p.key], I: ICONOS_ED[p.key] || User, idx: i })),
    ...(preferenciasEditables() ? [{ titulo: 'Preferencias', pista: 'Regalos y experiencias que le gustaría', I: Gift, idx: ed.partes.length }] : [])]

  const barraGuardar = (ed.hayCambios || guardado) && (
    <div data-barra-guardar style={{ position: 'sticky', bottom: 0, margin: '10px -2px 0', padding: '7px 8px', borderRadius: 10, background: 'var(--surface-card)', border: '1px solid var(--border-soft)', boxShadow: '0 -2px 10px rgba(12,45,64,.12)', display: 'flex', alignItems: 'center', gap: 6 }}>
      {ed.hayCambios ? (
        <>
          <span style={{ flex: 1, fontSize: 6.5, color: ed.faltan.length ? 'var(--mf-ven-txt)' : 'var(--text-muted)', lineHeight: 1.35 }}>
            {ed.faltan.length
              ? `Complete ${ed.faltan.length === 1 ? 'el dato obligatorio' : `los ${ed.faltan.length} datos obligatorios`}`
              : ed.cuantos === 1 ? '1 cambio sin guardar' : ed.cuantos ? `${ed.cuantos} cambios sin guardar` : 'Cambios sin guardar'}
          </span>
          <GuardarCancelar textoGuardar="Guardar cambios" desactivado={ed.faltan.length > 0}
            onCancelar={ed.descartar} onGuardar={() => { if (ed.guardar()) avisar() }} />
        </>
      ) : <Guardado />}
    </div>
  )

  if (docViendo) {
    const doc = docViendo
    return (
      <VisorPhone doc={doc} titular={currentUser?.name} onVolver={() => setDocViendo(null)} />
    )
  }

  if (parte !== null) {
    const actual = ed.partes[parte]
    const cat = categorias.find(c => c.idx === parte)
    const verDoc = d => { setDocViendo(d); arriba() }
    return (
      <div style={{ padding: '2px 2px' }}>
        <BarraVolver conTema texto="Editar perfil" onVolver={() => { setParte(null); arriba() }} />
        <div style={{ fontSize: 6.5, color: 'var(--text-muted)' }}>Editar perfil de usuario</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 8 }}>{cat?.titulo}</div>

        {actual?.secciones.some(s => s.id === 'nombre') && currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '8px 9px', background: 'var(--surface-card)', borderRadius: 11, border: '1px solid var(--border-soft)' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', border: '2px solid #19D992', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {sinFoto ? (
                  <span style={{ width: '100%', height: '100%', background: currentUser.color, color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentUser.initials}
                  </span>
                ) : (
                  <img src={foto} alt={currentUser.name} onError={() => setSinFoto(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
              </div>
              <label style={{
                position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: '50%',
                background: 'var(--phone-green, #00E091)', border: '1.5px solid var(--surface-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <Pencil size={7} style={{ color: '#0C2D40' }} />
                <input type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={e => {
                  const a = e.target.files?.[0]; e.target.value = ''
                  if (!a) return
                  // Se guarda el archivo de verdad, para que la foto nueva se vea aquí y en Mis documentos.
                  const clave = nuevaClaveArchivo()
                  guardarArchivo(clave, a).then(ok => { ed.set('1.9', { nombre: a.name, tipo: a.type, peso: a.size, clave: ok ? clave : null }); setSinFoto(false) })
                }} />
              </label>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--text-heading)' }}>{currentUser.name}</div>
              <div style={{ fontSize: 6.5, color: 'var(--text-muted)', marginTop: 1 }}>{currentUser.cargo}</div>
            </div>
          </div>
        )}

        {actual
          ? actual.secciones.map((s, i) => {
              // En una columna no hay mapa ni calculados que enseñar: se escribe lo que se puede escribir.
              const sec = { ...s, campos: s.campos.filter(c => c.key !== '1.9' && c.tipo !== 'mapa' && c.deducido === undefined) }
              return <SeccionEditable key={s.id} s={sec} ed={ed} abierta={abiertas.has(i)} onAlternar={() => alternar(i)} onVerDoc={verDoc} />
            })
          : <PreferenciasEditables ed={ed} />}
        {barraGuardar}
      </div>
    )
  }

  return (
    <div style={{ padding: '2px 2px' }}>
      <BarraVolver conTema texto="Configuración" onVolver={() => ed.salir(onVolver)} />
      <div style={{ fontSize: 6.5, color: 'var(--text-muted)' }}>Configuración</div>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 8 }}>Editar perfil de usuario</div>

      <div style={{ display: 'flex', gap: 5, padding: '6px 8px', borderRadius: 8, background: 'var(--mf-info-bg)', color: 'var(--mf-info-txt)', fontSize: 6.5, lineHeight: 1.45 }}>
        <Info size={9} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Mantenga al día su información personal y sus documentos. Lo laboral lo registra RR.HH.</span>
      </div>

      <div style={{ marginTop: 6, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--border-soft)' }}>
        {categorias.map((cat, i) => (
          <button key={cat.idx} onClick={() => entrar(cat.idx)} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 9px',
            border: 'none', borderTop: i ? '1px solid var(--border)' : 'none', background: 'none',
            fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
          }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--green-bg)', color: 'var(--mf-verde-txt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <cat.I size={11} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 8, fontWeight: 600, color: 'var(--text-heading)' }}>{cat.titulo}</span>
              <span style={{ display: 'block', fontSize: 6.5, color: 'var(--text-muted)', marginTop: 1 }}>{cat.pista}</span>
            </span>
            <ChevronRight size={10} style={{ color: 'var(--icon-muted)' }} />
          </button>
        ))}
      </div>
      {barraGuardar}
    </div>
  )
}

export default function PerfilPhone({ currentUser }) {
  const { ficha, guardar } = useMiFicha(currentUser.name)
  const [vista, setVista] = useState('portada')
  const arriba = () => document.querySelector('.phone-scroll')?.scrollTo(0, 0)
  const abrir = v => { setVista(v); arriba() }

  if (vista === 'config') {
    return <ConfiguracionPhone onVolver={() => abrir('portada')} onPerfilUsuario={ficha ? () => abrir('misdatos') : undefined} />
  }
  if (vista === 'misdatos' && ficha) {
    return <EditarPerfil form={ficha.form} onGuardar={guardar} onVolver={() => abrir('config')} currentUser={currentUser} />
  }
  if (vista === 'portada' || !ficha) {
    return <Portada currentUser={currentUser} ficha={ficha} onAbrir={abrir} onConfiguracion={() => abrir('config')} />
  }

  const p = pestanasCon(ficha.form).find(x => x.key === vista)
  return (
    <div style={{ padding: '2px 2px' }}>
      <BarraVolver conTema texto="Mi perfil" onVolver={() => abrir('portada')} />
      <div style={{ fontSize: 6.5, color: 'var(--text-muted)' }}>Mi ficha</div>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 8 }}>{p?.titulo}</div>
      {vista === 'documentos'
        ? <Documentos form={ficha.form} />
        : <Datos key={vista} pestana={vista} form={ficha.form} />}
    </div>
  )
}
