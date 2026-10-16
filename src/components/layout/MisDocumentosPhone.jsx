import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Upload, FileText, FileImage, Clock, ScrollText, CheckCircle2, MessageSquarePlus, Send, FolderOpen, Folder, Check,
  IdCard, GraduationCap, Package, Paperclip, Inbox, Search, ChevronRight, Plus, X, History, Flag, Award, Megaphone, Download, Maximize2,
} from 'lucide-react'
import BarraVolver from './BarraVolver'
import { useMisDocumentos, textoMotivo } from '../../hooks/useMisDocumentos'
import {
  ESTADOS, ESTADOS_CONTRATO, ESTADOS_SOLICITUD, TIPOS_SOLICITUD, PLAZO_SOLICITUD_DIAS, MODALIDADES, fechaCorta,
  responderAntes,
} from '../../data/documentacionData'
import { leerArchivo } from '../../utils/archivosLocales'
import { useMiFicha } from '../../hooks/useMiFicha'
import { useFotoPerfil } from '../../hooks/useFotoPerfil'
import { useArchivoLocal } from '../../hooks/useArchivoLocal'
import PaginasPdf from '../documentacion/PaginasPdf'
import '../documentacion/documentacion.css'

/* ── MIS DOCUMENTOS (CELULAR) ─────────────────────────────────────────────
   Lo mismo decidido en el mismo lugar que la web (`useMisDocumentos`), pero ordenado como se
   busca un papel en el teléfono: POR CARPETAS. Arriba, una sola franja dice si debe algo; abajo,
   las carpetas de su expediente —todas, aunque estén vacías, para que sepa dónde va cada cosa—,
   sus contratos y lo que RR.HH. le envió. Cada carpeta es una pantalla con sus archivos, lo que le
   falta entregar y un «+» para subir ahí mismo; cada archivo, otra con sus datos y sus versiones.

   Cada paso es una sub-pantalla con su «volver», no una ventana flotante: en un teléfono tapan
   todo y no tienen dónde cerrarse. Las pantallas se apilan, así «volver» regresa a donde estaba. */

const NAVY = '#0C2D40'
const TONOS = {
  verde: ['#0F7A4F', '#E6F7EF'], ambar: ['#9A5B06', '#FFF4DE'], rojo: ['#B42318', '#FDECEA'],
  azul: ['#1D5FBF', '#E8F0FC'], violeta: ['#6A3FC0', '#F1ECFC'], gris: ['#4B5B6B', '#EDF1F5'],
  cian: ['#0E7490', '#E0F5F9'], rosa: ['#B4236C', '#FCE8F2'],
}
const TARJETA = { background: '#fff', borderRadius: 11, boxShadow: '0 1px 4px rgba(12,45,64,.07)', overflow: 'hidden' }
const BOTON = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 22, padding: '0 9px',
  borderRadius: 7, border: 'none', background: '#00E091', color: NAVY, fontFamily: 'inherit', fontSize: 7, fontWeight: 700,
  cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
}
const SECUNDARIO = { ...BOTON, background: '#f1f5f9' }
const ROTULO = { fontSize: 6, letterSpacing: '.1em', fontWeight: 700, color: '#94a3b8', margin: '11px 2px 4px', textTransform: 'uppercase' }
const TITULO = { fontSize: 11, fontWeight: 800, color: NAVY }

/* Cada carpeta con su ícono y su color, para reconocerla sin leer. Lo que RR.HH. cree después
   cae en una carpeta común. */
const CARPETA = {
  't-personal': [IdCard, 'azul'],
  't-perfil': [GraduationCap, 'violeta'],
  't-recursos': [Package, 'ambar'],
  't-agregados': [Paperclip, 'cian'],
  contratos: [ScrollText, 'verde'],
  recibidos: [Inbox, 'rosa'],
}
/* LO QUE ENVÍA RR.HH., EN CARPETAS POR LO QUE ES. La categoría ya viene con cada emitido; lo que no
   es certificado ni memorándum (un comunicado, un reglamento) cae en «Otros». */
/* Las carpetas de lo recibido las arma `useMisDocumentos` (`md.carpetasRrhh`, `md.carpetaDe`): incluyen los tipos que cree la empresa. */
const avisoSolicitud = 'Enviado a RR.HH. Siga su avance en Zona HR › Mis solicitudes.'

const iconoCarpeta = id => CARPETA[id] || [Folder, 'gris']
const esImagen = v => ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes((v?.archivo?.formato || '').toLowerCase())
const archivos = n => (n ? `${n} archivo${n === 1 ? '' : 's'}` : 'Vacía')
const sinTildes = t => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function Chip({ tono = 'gris', children }) {
  const [c, bg] = TONOS[tono] || TONOS.gris
  return <span style={{ padding: '1px 6px', borderRadius: 99, background: bg, color: c, fontWeight: 700, fontSize: 6, whiteSpace: 'nowrap' }}>{children}</span>
}

function Cuadro({ Icono, tono, size = 20 }) {
  const [c, bg] = tono ? TONOS[tono] : ['#64748b', '#f1f5f9']
  return (
    <span style={{ width: size, height: size, borderRadius: size * 0.3, background: bg, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icono size={size / 2} />
    </span>
  )
}

function Fila({ Icono, tono, titulo, sub, extra, children, primera, onClick, flecha, lead }) {
  const Caja = onClick ? 'button' : 'div'
  return (
    <Caja onClick={onClick} style={{
      display: 'flex', alignItems: onClick && !extra ? 'center' : 'flex-start', gap: 7, width: '100%', padding: '8px 9px',
      border: 'none', borderTop: primera ? 'none' : '1px solid #f1f5f9', background: '#fff',
      fontFamily: 'inherit', textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
    }}>
      {lead || <Cuadro Icono={Icono} tono={tono} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 7.5, fontWeight: 700, color: NAVY, lineHeight: 1.3 }}>{titulo}</div>
        {sub && <div style={{ fontSize: 6.5, color: '#64748b', lineHeight: 1.45, marginTop: 2 }}>{sub}</div>}
        {extra}
      </div>
      {children && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>{children}</div>}
      {flecha && <ChevronRight size={10} style={{ color: '#cbd5e1', flexShrink: 0, alignSelf: 'center' }} />}
    </Caja>
  )
}

/* El «+» redondo de arriba a la derecha: subir algo a esta carpeta. */
function Mas({ onClick, etiqueta }) {
  return (
    <button onClick={onClick} aria-label={etiqueta} title={etiqueta} style={{
      width: 24, height: 24, borderRadius: '50%', border: 'none', background: '#00E091', color: NAVY, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,184,118,.35)',
    }}>
      <Plus size={13} strokeWidth={2.6} />
    </button>
  )
}

function Cabecera({ titulo, sub, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={TITULO}>{titulo}</div>
        {sub && <div style={{ fontSize: 6.5, color: '#94a3b8', lineHeight: 1.45, marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

const arriba = () => document.querySelector('.phone-scroll')?.scrollTo(0, 0)

export default function MisDocumentosPhone({ currentUser, onVolver }) {
  const md = useMisDocumentos(currentUser.name, 'app')
  const { ficha } = useMiFicha(currentUser.name)
  const fotoUrl = useFotoPerfil(currentUser.name, ficha?.form?.['1.9'], 400)
  const perfil = { url: fotoUrl, archivo: ficha?.form?.['1.9']?.clave ? ficha.form['1.9'] : null }
  const [pila, setPila] = useState([{ p: 'inicio' }])
  const [aviso, setAviso] = useState(null)
  const actual = pila[pila.length - 1]
  const ir = x => { setPila(s => [...s, x]); arriba() }
  const volver = () => { setPila(s => (s.length > 1 ? s.slice(0, -1) : s)); arriba() }
  const cambiar = x => { setPila(s => [...s.slice(0, -1), x]); arriba() }

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 3200)
    return () => clearTimeout(t)
  }, [aviso])

  if (!md.persona) {
    return (
      <div>
        <BarraVolver texto="Zona HR" onVolver={onVolver} />
        <div style={{ ...TARJETA, padding: '22px 14px', textAlign: 'center' }}>
          <FolderOpen size={20} style={{ color: '#00B876' }} />
          <div style={{ fontSize: 8.5, fontWeight: 800, color: NAVY, marginTop: 6 }}>Su expediente todavía no está en Documentación</div>
          <div style={{ fontSize: 6.5, color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>Cuando RR.HH. lo abra, aquí verá sus documentos y lo que le falte entregar.</div>
        </div>
      </div>
    )
  }

  // El texto del «volver» es el nombre de la pantalla de abajo.
  const debajo = pila[pila.length - 2]
  const nombreDe = x => {
    if (!x) return 'Zona HR'
    if (x.p === 'inicio') return 'Mis documentos'
    if (x.p === 'carpeta') return md.tiposActivos.find(t => t.id === x.id)?.nombre || 'Carpeta'
    if (x.p === 'archivo') return md.propios.find(d => d.doc.id === x.id)?.nombre || 'Documento'
    if (x.p === 'recibidos') return md.carpetasRrhh.find(([k]) => k === x.cat)?.[1] || 'Recibidos'
    if (x.p === 'leer') return md.recibidos.find(y => y.emitido.id === x.id)?.nombre || 'Documento'
    return { contratos: 'Contratos', contrato: 'Contrato', pendientes: 'Por entregar' }[x.p] || 'Volver'
  }
  const atras = <BarraVolver texto={nombreDe(debajo)} onVolver={pila.length > 1 ? volver : onVolver} />
  const leer = id => ir({ p: 'leer', id })
  const subido = (subtipo, err) => {
    if (err) return
    setAviso('Enviado. Quedó en revisión hasta que RR.HH. lo apruebe.')
    cambiar({ p: 'carpeta', id: subtipo.tipoId })
  }

  let pantalla
  switch (actual.p) {
    case 'carpeta': pantalla = <CarpetaPhone md={md} tipoId={actual.id} atras={atras} ir={ir} onAviso={setAviso} perfil={perfil} />; break
    case 'archivo': pantalla = <ArchivoPhone md={md} docId={actual.id} atras={atras} onAviso={setAviso} ir={ir} perfil={perfil} />; break
    case 'ver': pantalla = <VerPhone md={md} docId={actual.id} atras={atras} perfil={perfil} />; break
    case 'contratos': pantalla = <ContratosPhone md={md} atras={atras} ir={ir} />; break
    case 'contrato': pantalla = <ContratoPhone md={md} id={actual.id} atras={atras} ir={ir} />; break
    case 'recibidos': pantalla = <RecibidosPhone md={md} cat={actual.cat} atras={atras} onLeer={leer} onPedir={() => ir({ p: 'pedir', inicial: { tipo: 'certificacion' }, fijo: true })} />; break
    case 'leer': {
      const r = md.recibidos.find(x => x.emitido.id === actual.id)
      pantalla = r
        ? <LeerPhone r={r} atras={atras}
          onReportar={() => ir({ p: 'pedir', inicial: { tipo: 'correccion', clave: r.emitido.id }, fijo: true })} />
        : <div>{atras}</div>
      break
    }
    case 'pendientes': pantalla = <PendientesPhone md={md} atras={atras} onSubido={setAviso} />; break
    case 'subir': pantalla = <SubirPhone md={md} tipoId={actual.id} atras={atras} onSubido={subido} />; break
    case 'pedir':
      pantalla = <PedirPhone md={md} atras={atras} inicial={actual.inicial} fijo={actual.fijo}
        onEnviada={() => { setAviso(avisoSolicitud); volver() }} />
      break
    default: pantalla = <InicioPhone md={md} atras={atras} ir={ir} />
  }

  return (
    <div>
      {pantalla}
      <Aviso texto={aviso} />
    </div>
  )
}

function Aviso({ texto }) {
  if (!texto) return null
  return (
    <div role="status" style={{
      position: 'sticky', bottom: 6, marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px',
      borderRadius: 9, background: NAVY, color: '#fff', fontSize: 7, fontWeight: 600, boxShadow: '0 4px 14px rgba(12,45,64,.25)',
    }}>
      <CheckCircle2 size={10} style={{ color: '#00E091', flexShrink: 0 }} /> {texto}
    </div>
  )
}

function Vacio({ Icono, titulo, texto, children }) {
  return (
    <div style={{ ...TARJETA, marginTop: 8, padding: '18px 14px', textAlign: 'center' }}>
      <Icono size={18} style={{ color: '#00B876', display: 'block', margin: '0 auto' }} />
      <div style={{ fontSize: 8, fontWeight: 800, color: NAVY, marginTop: 5 }}>{titulo}</div>
      <div style={{ fontSize: 6.5, color: '#64748b', marginTop: 3, lineHeight: 1.5 }}>{texto}</div>
      {children}
    </div>
  )
}

/* ── INICIO (propuesta A, «carpetas en grilla») ────────────────────────────
   Arriba, una franja oscura con el avance en un anillo y lo que debe en una línea; debajo, las
   carpetas como mosaicos de dos en dos, todas amarillas como las de Windows, con un punto
   cuando adentro hay algo que atender. Se sube desde el «+» de cada carpeta o desde
   «Resolver»; buscar, con una lupa arriba que abre el buscador sólo cuando se lo pide. */

// Todas las carpetas del mismo color: el amarillo de carpeta de Windows, la solapa de atrás y el frente.
const COLOR_CARPETA = ['#E8A82A', '#FFCB4C']
const PUNTO = { rojo: '#D92D20', ambar: '#E5A13A', azul: '#1D5FBF' }

function Carpeta() {
  const [atras, frente] = COLOR_CARPETA
  return (
    <svg width="24" height="20" viewBox="0 0 40 34" aria-hidden="true">
      <path d="M2 6a4 4 0 0 1 4-4h10l4 5h14a4 4 0 0 1 4 4v17a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill={atras} />
      <path d="M2 12h36v16a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill={frente} />
    </svg>
  )
}

function Mosaico({ titulo, sub, punto, insignia, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '9px 9px 8px', borderRadius: 12,
      border: 'none', background: '#fff', boxShadow: '0 1px 4px rgba(12,45,64,.07)', fontFamily: 'inherit', color: NAVY, textAlign: 'left', cursor: 'pointer',
    }}>
      {punto && <span aria-hidden="true" style={{ position: 'absolute', top: 9, right: 9, width: 6, height: 6, borderRadius: '50%', background: PUNTO[punto] }} />}
      {insignia > 0 && <span style={{ position: 'absolute', top: 7, right: 7, minWidth: 11, height: 11, padding: '0 3px', boxSizing: 'border-box', borderRadius: 6, background: PUNTO.ambar, color: '#fff', fontSize: 6, fontWeight: 800, lineHeight: '11px', textAlign: 'center' }}>{insignia}</span>}
      <Carpeta />
      <span style={{ fontSize: 7.5, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>{titulo}</span>
      <span style={{ fontSize: 6.5, color: '#64748b', marginTop: 1, lineHeight: 1.35 }}>{sub}</span>
    </button>
  )
}

function InicioPhone({ md, atras, ir }) {
  const [buscando, setBuscando] = useState(false)
  const [q, setQ] = useState('')
  const total = md.propios.length + md.misContratos.length

  /* Lo más urgente de adentro de cada carpeta: el punto del mosaico y una palabra en su línea.
     Así se sabe a qué carpeta entrar sin abrirlas todas. */
  const pista = tipoId => {
    const docs = md.propios.filter(x => x.subtipo.tipoId === tipoId)
    const deben = md.porHacer.filter(p => p.subtipo.tipoId === tipoId)
    const n = e => docs.filter(x => x.estado === e).length
    const cuenta = e => deben.filter(p => p.estado === e).length
    if (cuenta('rechazado')) return [`${cuenta('rechazado')} rechazado${cuenta('rechazado') > 1 ? 's' : ''}`, 'rojo']
    if (n('vencido')) return [`${n('vencido')} vencido${n('vencido') > 1 ? 's' : ''}`, 'rojo']
    if (cuenta('faltante')) return [`falta${cuenta('faltante') > 1 ? 'n' : ''} ${cuenta('faltante')}`, 'ambar']
    if (n('por_vencer')) return [`${n('por_vencer')} por vencer`, 'ambar']
    if (n('en_revision')) return [`${n('en_revision')} en revisión`, 'azul']
    return null
  }
  const sub = (n, p) => (p ? `${archivos(n)} · ${p[0]}` : archivos(n))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {atras}
        <button onClick={() => { setBuscando(b => !b); setQ('') }} aria-label={buscando ? 'Cerrar la búsqueda' : 'Buscar un documento'} style={{
          width: 20, height: 20, borderRadius: 7, border: '1px solid #e2e8f0', background: buscando ? NAVY : '#fff', color: buscando ? '#fff' : NAVY,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        }}>
          {buscando ? <X size={10} /> : <Search size={10} />}
        </button>
      </div>
      <div style={{ ...TITULO, fontSize: 13, lineHeight: 1.1 }}>Mis documentos</div>

      {buscando && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '0 8px', height: 26, borderRadius: 9, background: '#fff', border: '1px solid #e2e8f0' }}>
          <Search size={9} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Carnet, contrato, certificado…"
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'none', fontFamily: 'inherit', fontSize: 7, color: NAVY }} />
        </div>
      )}

      {buscando && q.trim() ? <Resultados md={md} q={q} ir={ir} /> : <>
        <Franja md={md} onClick={() => ir({ p: 'pendientes' })} />

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '12px 2px 6px' }}>
          <span style={{ fontSize: 8.5, fontWeight: 700, color: NAVY }}>Mis carpetas</span>
          <span style={{ fontSize: 6.5, color: '#64748b' }}>{archivos(total)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6 }}>
          {md.tiposActivos.map(t => {
            const n = md.propios.filter(x => x.subtipo.tipoId === t.id).length
            const p = pista(t.id)
            return <Mosaico key={t.id} titulo={t.nombre} sub={sub(n, p)} punto={p?.[1]} onClick={() => ir({ p: 'carpeta', id: t.id })} />
          })}
          <Mosaico titulo="Contratos" onClick={() => ir({ p: 'contratos' })}
            sub={md.misContratos.some(c => c.estado === 'vigente') ? `${md.misContratos.filter(c => c.estado === 'vigente').length} vigente${md.misContratos.filter(c => c.estado === 'vigente').length > 1 ? 's' : ''}` : archivos(md.misContratos.length)} />
        </div>

        <div style={{ margin: '12px 2px 6px', fontSize: 8.5, fontWeight: 700, color: NAVY }}>De RR.HH.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
          {md.carpetasRrhh.map(([cat, nombre]) => {
            const lista = md.recibidos.filter(x => md.carpetaDe(x.emitido) === cat)
            return <Mosaico key={cat} titulo={nombre} onClick={() => ir({ p: 'recibidos', cat })}
              sub={archivos(lista.length)} />
          })}
        </div>

        <button onClick={() => ir({ p: 'pedir', inicial: { tipo: 'certificacion' }, fijo: true })} style={{
          display: 'flex', alignItems: 'center', gap: 7, width: '100%', marginTop: 8, padding: '8px 9px', borderRadius: 11,
          border: '1px dashed #cbd5e1', background: '#fff', fontFamily: 'inherit', color: NAVY, textAlign: 'left', cursor: 'pointer',
        }}>
          <MessageSquarePlus size={11} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 7.5, fontWeight: 600 }}>Pedir un certificado</span>
          <ChevronRight size={10} style={{ color: '#cbd5e1' }} />
        </button>

      </>}
    </div>
  )
}

/* La franja oscura de arriba: el avance en un anillo y, si debe algo, cuánto y de qué tipo, con
   «Resolver». Si sólo espera a RR.HH. o está al día, lo dice y no pide nada. */
function Franja({ md, onClick }) {
  const n = md.porHacer.length
  const { pct, cumplidos, total } = md.avance
  const cuenta = e => md.porHacer.filter(p => p.estado === e).length
  const partes = [
    cuenta('rechazado') && `${cuenta('rechazado')} rechazado${cuenta('rechazado') > 1 ? 's' : ''}`,
    cuenta('vencido') && `${cuenta('vencido')} vencido${cuenta('vencido') > 1 ? 's' : ''}`,
    cuenta('faltante') && `${cuenta('faltante')} falta${cuenta('faltante') > 1 ? 'n' : ''}`,
    cuenta('por_vencer') && `${cuenta('por_vencer')} por vencer`,
  ].filter(Boolean)
  const [titulo, sub] = n
    ? [`${n} documento${n === 1 ? '' : 's'} por entregar`, partes.join(' · ')]
    : md.enRevision.length
      ? [`${md.enRevision.length} en revisión`, 'RR.HH. los está mirando. No tiene que hacer nada.']
      : ['Está al día', 'No le falta entregar nada.']
  const p = pct ?? 100
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginTop: 9, padding: '8px 9px', borderRadius: 12,
      border: 'none', background: NAVY, color: '#fff', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
    }}>
      <span aria-label={total ? `${cumplidos} de ${total} requisitos al día` : 'Al día'} style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `conic-gradient(#00E091 0 ${p}%, rgba(255,255,255,.15) ${p}% 100%)`,
      }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6.5, fontWeight: 800 }}>
          {total ? `${cumplidos}/${total}` : <Check size={10} style={{ color: '#00E091' }} />}
        </span>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 7.5, fontWeight: 700 }}>{titulo}</span>
        <span style={{ display: 'block', fontSize: 6.5, color: '#B6C6D1', marginTop: 1 }}>{sub}</span>
      </span>
      {n > 0 && <span style={{ ...BOTON, height: 20 }}>Resolver</span>}
    </button>
  )
}

const DICHOS = { carnet: 'identidad', ci: 'identidad', cedula: 'identidad', carne: 'identidad', diploma: 'titulo', foto: 'fotografia', licencia: 'licencia' }

/* Lo que se busca, en todas las carpetas a la vez: sus documentos, sus contratos y lo recibido. */
function Resultados({ md, q, ir }) {
  /* Como lo dice la gente: «carnet» o «CI» es el documento de identidad; «título», el diploma. */
  const t = sinTildes(q.trim())
  const dicho = t.length > 1 && Object.entries(DICHOS).find(([k]) => k.startsWith(t) || t.startsWith(k))?.[1]
  const hay = (...xs) => xs.some(x => sinTildes(x).includes(t) || (dicho && sinTildes(x).includes(dicho)))
  const docs = md.propios.filter(x => hay(x.nombre, x.subtipo.nombre, x.subtipo.persona, x.version?.archivo?.nombre))
  const contratos = md.misContratos.filter(c => hay(c.nombre, c.contrato.numero, 'contrato'))
  const recibidos = md.recibidos.filter(r => hay(r.nombre, r.emitido.numero))
  if (!docs.length && !contratos.length && !recibidos.length) {
    return <Vacio Icono={Search} titulo="No encontramos nada" texto={`Ningún documento suyo se llama «${q.trim()}».`} />
  }
  return (
    <>
      <div style={ROTULO}>{docs.length + contratos.length + recibidos.length === 1 ? '1 resultado' : `${docs.length + contratos.length + recibidos.length} resultados`}</div>
      <div style={TARJETA}>
        {docs.map((x, i) => (
          <Fila key={x.doc.id} primera={!i} Icono={esImagen(x.version) ? FileImage : FileText} tono={iconoCarpeta(x.subtipo.tipoId)[1]} titulo={x.nombre}
            sub={md.tiposActivos.find(tp => tp.id === x.subtipo.tipoId)?.nombre} flecha onClick={() => ir({ p: 'archivo', id: x.doc.id })} />
        ))}
        {contratos.map((c, i) => (
          <Fila key={c.contrato.id} primera={!docs.length && !i} Icono={ScrollText} tono="verde" titulo={c.nombre} sub={`Contratos · ${c.contrato.numero}`} flecha onClick={() => ir({ p: 'contrato', id: c.contrato.id })} />
        ))}
        {recibidos.map((r, i) => (
          <Fila key={r.emitido.id} primera={!docs.length && !contratos.length && !i} Icono={Inbox} tono="rosa" titulo={r.nombre} sub={`Recibidos · ${r.emitido.numero}`} flecha onClick={() => ir({ p: 'leer', id: r.emitido.id })} />
        ))}
      </div>
    </>
  )
}

/* ── UNA CARPETA: sus archivos, lo que falta en ella y el «+» para subir ahí ── */
function CarpetaPhone({ md, tipoId, atras, ir, onAviso, perfil }) {
  const tipo = md.tiposActivos.find(t => t.id === tipoId)
  const [Icono, tono] = iconoCarpeta(tipoId)
  const docs = md.propios.filter(x => x.subtipo.tipoId === tipoId)
    .sort((a, b) => ((a.version?.fecha || '') < (b.version?.fecha || '') ? 1 : -1))
  // Lo que se le pide en esta carpeta y todavía no tiene ningún archivo: se ve como un hueco.
  const faltan = md.porHacer.filter(p => p.subtipo.tipoId === tipoId && !p.doc)
  const subibles = md.subibles.filter(s => s.tipoId === tipoId)
  if (!tipo) return <div>{atras}</div>
  return (
    <div>
      {atras}
      <Cabecera titulo={tipo.nombre} sub={docs.length ? archivos(docs.length) : 'Todavía no hay archivos en esta carpeta.'}>
        {subibles.length > 0 && <Mas etiqueta={`Subir a ${tipo.nombre}`} onClick={() => ir({ p: 'subir', id: tipoId })} />}
      </Cabecera>

      {faltan.length > 0 && (
        <>
          <div style={ROTULO}>Le falta entregar</div>
          <div style={{ ...TARJETA, border: '1px dashed #f3c26b', boxShadow: 'none' }}>
            {faltan.map((p, i) => (
              <Fila key={p.clave} primera={!i} Icono={Upload} tono="ambar" titulo={p.subtipo.persona} sub={textoMotivo(p)}>
                {p.subeEl ? <SubirBoton p={p} md={md} onSubido={err => { if (!err) onAviso('Enviado. Quedó en revisión.') }} /> : <span style={{ fontSize: 6, color: '#94a3b8' }}>Lo carga RR.HH.</span>}
              </Fila>
            ))}
          </div>
        </>
      )}

      {docs.length > 0 ? (
        <>
          <div style={ROTULO}>Archivos</div>
          <div style={TARJETA}>
            {docs.map((x, i) => (
              <Fila key={x.doc.id} primera={!i} Icono={esImagen(x.version) ? FileImage : FileText} tono={tono} titulo={x.nombre}
                lead={<Miniatura x={x} perfil={perfil} tono={tono} />}
                sub={x.version?.fecha ? `Subido el ${fechaCorta(x.version.fecha)}${x.version.vencimiento ? ` · vence el ${fechaCorta(x.version.vencimiento)}` : ''}` : x.version?.archivo?.nombre}
                flecha onClick={() => ir({ p: 'archivo', id: x.doc.id })}>
                {x.estado !== 'vigente' && <Chip tono={ESTADOS[x.estado].tono}>{ESTADOS[x.estado].label}</Chip>}
              </Fila>
            ))}
          </div>
        </>
      ) : !faltan.length && (
        <Vacio Icono={Icono} titulo="Carpeta vacía" texto={subibles.length ? 'Toque «+» para subir un documento a esta carpeta.' : 'Los documentos de esta carpeta los carga RR.HH.; cuando lo haga, aparecerán aquí.'} />
      )}
    </div>
  )
}

/* El botón que abre la cámara o los archivos y sube. Compartido por la carpeta y por la lista de
   pendientes. */
function SubirBoton({ p, md, onSubido, texto, suave }) {
  const input = useRef(null)
  const [error, setError] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const elegir = async e => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setSubiendo(true)
    const err = await md.subir(p, file)
    setSubiendo(false)
    setError(err || '')
    onSubido(err)
  }
  return (
    <>
      <input ref={input} type="file" hidden accept={[...p.subtipo.formatos.map(f => `.${f}`), 'image/*'].join(',')} onChange={elegir} />
      <button onClick={() => input.current?.click()} disabled={subiendo} style={suave ? SECUNDARIO : BOTON}>
        <Upload size={8} /> {subiendo ? 'Enviando…' : texto || p.accion || 'Subir'}
      </button>
      {error && <div role="alert" style={{ fontSize: 6.5, fontWeight: 700, color: TONOS.rojo[0], maxWidth: 110, textAlign: 'right' }}>{error}</div>}
    </>
  )
}

/* ── UN ARCHIVO: verlo, sus datos, sus versiones y renovarlo ── */
function ArchivoPhone({ md, docId, atras, onAviso, ir, perfil }) {
  const x = md.propios.find(d => d.doc.id === docId)
  if (!x) return <div>{atras}</div>
  const { doc, subtipo, version: v, estado } = x
  const accion = { rechazado: 'Volver a subir', vencido: 'Renovar', por_vencer: 'Renovar' }[estado] || 'Subir una versión nueva'
  const datos = [
    ['Documento', subtipo.nombre],
    v?.emision && ['Emitido el', fechaCorta(v.emision)],
    v?.vencimiento && ['Vence el', fechaCorta(v.vencimiento)],
    subtipo.id === 's-foto' && perfil?.archivo && !v?.archivo?.clave ? ['Cambiada', 'Desde su perfil'] : v?.fecha && ['Subido el', `${fechaCorta(v.fecha)}${v.subidoPor ? ` · ${v.canal === 'app' ? 'desde el celular' : v.subidoPor}` : ''}`],
    archivoDe(x, perfil) && ['Archivo', `${archivoDe(x, perfil).nombre}${archivoDe(x, perfil).tamanoKB ? ` · ${archivoDe(x, perfil).tamanoKB} KB` : ''}`],
  ].filter(Boolean)
  const versiones = [...(doc.versiones || [])].reverse()
  return (
    <div>
      {atras}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...TITULO, fontSize: 10, lineHeight: 1.25 }}>{x.nombre}</div>
          <div style={{ marginTop: 4 }}><Chip tono={ESTADOS[estado].tono}>{ESTADOS[estado].label}</Chip></div>
        </div>
      </div>
      <Visor x={x} md={md} perfil={perfil} onGrande={() => ir({ p: 'ver', id: doc.id })} onAviso={onAviso} />

      {estado === 'rechazado' && v?.motivoRechazo && (
        <div style={{ marginTop: 8, padding: '7px 9px', borderRadius: 8, background: TONOS.rojo[1], color: TONOS.rojo[0], fontSize: 6.5, lineHeight: 1.5 }}>
          <b>RR.HH. lo rechazó:</b> {v.motivoRechazo}
        </div>
      )}
      {estado === 'en_revision' && (
        <div style={{ marginTop: 8, padding: '7px 9px', borderRadius: 8, background: TONOS.azul[1], color: TONOS.azul[0], fontSize: 6.5, lineHeight: 1.5 }}>
          RR.HH. lo está revisando. Cuenta cuando lo apruebe.
        </div>
      )}

      <div style={ROTULO}>Datos</div>
      <div style={TARJETA}>
        {datos.map(([k, val], i) => (
          <div key={k} style={{ display: 'flex', gap: 8, padding: '6px 9px', borderTop: i ? '1px solid #f1f5f9' : 'none', fontSize: 6.5 }}>
            <span style={{ width: 52, flexShrink: 0, color: '#94a3b8' }}>{k}</span>
            <span style={{ flex: 1, minWidth: 0, color: NAVY, fontWeight: 600, wordBreak: 'break-word' }}>{val}</span>
          </div>
        ))}
      </div>

      {versiones.length > 1 && (
        <>
          <div style={ROTULO}>Versiones</div>
          <div style={TARJETA}>
            {versiones.map((ver, i) => (
              <Fila key={ver.v} primera={!i} Icono={History} titulo={`Versión ${ver.v}${i === 0 ? ' · la actual' : ''}`}
                sub={`${fechaCorta(ver.fecha)}${ver.motivoCambio ? ` · ${ver.motivoCambio}` : ''}`} />
            ))}
          </div>
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 11 }}>
        {subtipo.editableColab && estado !== 'en_revision' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <SubirBoton p={{ subtipo, doc, estado }} md={md} texto={accion} onSubido={err => { if (!err) onAviso('Enviado. Quedó en revisión.') }} />
          </div>
        )}
        {!subtipo.editableColab && <p style={{ margin: 0, fontSize: 6.5, color: '#94a3b8', textAlign: 'center' }}>Este documento lo carga RR.HH.</p>}
      </div>
    </div>
  )
}

/* ── SUBIR: qué documento va a entregar. Lo que le piden, primero ── */
function SubirPhone({ md, tipoId, atras, onSubido }) {
  const lista = md.subibles.filter(s => !tipoId || s.tipoId === tipoId)
  const pedidos = lista.filter(s => md.porHacer.some(p => p.subtipo.id === s.id))
  const otros = lista.filter(s => !pedidos.includes(s))
  /* Lo que se sube para un subtipo: su pendiente si lo hay (así renueva el que vence); si no, el
     documento que ya tiene —uno solo por subtipo se reemplaza— o uno nuevo. */
  const comoPendiente = s => md.porHacer.find(p => p.subtipo.id === s.id) || (() => {
    const ya = !s.varios && md.propios.find(x => x.subtipo.id === s.id)
    return { subtipo: s, doc: ya ? ya.doc : null, estado: ya ? ya.estado : 'faltante', accion: 'Subir', ya: !!ya }
  })()
  const grupo = (titulo, ss) => ss.length > 0 && (
    <>
      <div style={ROTULO}>{titulo}</div>
      <div style={TARJETA}>
        {ss.map((s, i) => {
          const p = comoPendiente(s)
          const [Icono, tono] = iconoCarpeta(s.tipoId)
          return (
            <Fila key={s.id} primera={!i} Icono={Icono} tono={tono} titulo={s.persona}
              sub={p.ya ? 'Ya lo tiene; lo que suba lo reemplaza.' : `${s.formatos.map(f => f.toUpperCase()).join(', ')} · hasta ${s.tamanoMaxMB} MB${!tipoId ? ` · ${md.tiposActivos.find(t => t.id === s.tipoId)?.nombre || ''}` : ''}`}>
              <SubirBoton p={p} md={md} suave={!pedidos.includes(s)} onSubido={err => onSubido(s, err)} />
            </Fila>
          )
        })}
      </div>
    </>
  )
  return (
    <div>
      {atras}
      <Cabecera titulo="Subir un documento" sub="Elija qué va a entregar. Puede tomar una foto o elegir un archivo." />
      {grupo('RR.HH. se lo pide', pedidos)}
      {grupo(pedidos.length ? 'Otros documentos' : 'Documentos', otros)}
      {!lista.length && <Vacio Icono={FolderOpen} titulo="Nada para subir aquí" texto="Los documentos de esta carpeta los carga RR.HH." />}
      <p style={{ margin: '9px 2px 0', fontSize: 6.5, color: '#94a3b8', lineHeight: 1.5 }}>
        Lo que envía queda en revisión hasta que RR.HH. lo apruebe.
      </p>
    </div>
  )
}

/* ── POR ENTREGAR ── */
function PendientesPhone({ md, atras, onSubido }) {
  return (
    <div>
      {atras}
      <Cabecera titulo="Por entregar" sub="Lo que RR.HH. necesita de usted, lo más urgente primero." />
      {!md.porHacer.length && !md.enRevision.length && (
        <Vacio Icono={CheckCircle2} titulo="No tiene nada pendiente" texto="Todo lo que RR.HH. le pidió está entregado y al día." />
      )}
      {md.porHacer.length > 0 && (
        <>
          <div style={ROTULO}>Para entregar</div>
          <div style={TARJETA}>
            {md.porHacer.map((p, i) => {
              const tono = { rechazado: 'rojo', vencido: 'rojo', por_vencer: 'ambar', faltante: 'gris' }[p.estado]
              return (
                <Fila key={p.clave} primera={!i} Icono={FileText} tono={tono} titulo={p.nombre || p.subtipo.persona} sub={textoMotivo(p)}>
                  <Chip tono={ESTADOS[p.estado].tono}>{ESTADOS[p.estado].label}</Chip>
                  {p.subeEl
                    ? <SubirBoton p={p} md={md} onSubido={err => { if (!err) onSubido('Enviado. Quedó en revisión.') }} />
                    : <span style={{ fontSize: 6, color: '#94a3b8' }}>Lo gestiona RR.HH.</span>}
                </Fila>
              )
            })}
          </div>
        </>
      )}
      {md.enRevision.length > 0 && (
        <>
          <div style={ROTULO}>En revisión</div>
          <div style={TARJETA}>
            {md.enRevision.map((x, i) => (
              <Fila key={x.doc.id} primera={!i} Icono={Clock} tono="azul" titulo={x.subtipo.persona} sub={`Lo envió el ${fechaCorta(x.version.fecha)}. No tiene que hacer nada más.`}>
                <Chip tono="azul">En revisión</Chip>
              </Fila>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── CONTRATOS ── */
function ContratosPhone({ md, atras, ir }) {
  return (
    <div>
      {atras}
      <Cabecera titulo="Contratos" sub="Sus contratos firmados. Los carga RR.HH." />
      {!md.misContratos.length ? (
        <Vacio Icono={ScrollText} titulo="Todavía no hay contratos" texto="Cuando RR.HH. registre su contrato, lo verá aquí." />
      ) : (
        <div style={{ ...TARJETA, marginTop: 9 }}>
          {md.misContratos.map((c, i) => (
            <Fila key={c.contrato.id} primera={!i} Icono={ScrollText} tono="verde" titulo={c.nombre}
              sub={`${c.contrato.numero} · desde el ${fechaCorta(c.contrato.inicio)}`} flecha onClick={() => ir({ p: 'contrato', id: c.contrato.id })}>
              <Chip tono={ESTADOS_CONTRATO[c.estado]?.tono}>{ESTADOS_CONTRATO[c.estado]?.label}</Chip>
            </Fila>
          ))}
        </div>
      )}
    </div>
  )
}

function ContratoPhone({ md, id, atras, ir }) {
  const c = md.misContratos.find(x => x.contrato.id === id)
  if (!c) return <div>{atras}</div>
  const k = c.contrato
  const copia = md.opciones.copia.find(o => o.clave === `c-${k.id}`)
  const datos = [
    ['Número', k.numero],
    ['Modalidad', MODALIDADES[k.modalidad] || '—'],
    ['Desde', fechaCorta(k.inicio)],
    ['Hasta', k.fin ? fechaCorta(k.fin) : 'Sin fecha de fin'],
    ['Archivo', typeof c.version?.archivo === 'string' ? c.version.archivo : c.version?.archivo?.nombre],
  ].filter(([, v]) => v)
  return (
    <div>
      {atras}
      <div style={{ ...TARJETA, padding: '14px 11px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Cuadro Icono={ScrollText} tono="verde" size={34} />
        <div style={{ fontSize: 9, fontWeight: 800, color: NAVY, marginTop: 7 }}>{c.nombre}</div>
        <div style={{ marginTop: 4 }}><Chip tono={ESTADOS_CONTRATO[c.estado]?.tono}>{ESTADOS_CONTRATO[c.estado]?.label}</Chip></div>
      </div>
      <div style={ROTULO}>Datos</div>
      <div style={TARJETA}>
        {datos.map(([n, v], i) => (
          <div key={n} style={{ display: 'flex', gap: 8, padding: '6px 9px', borderTop: i ? '1px solid #f1f5f9' : 'none', fontSize: 6.5 }}>
            <span style={{ width: 52, flexShrink: 0, color: '#94a3b8' }}>{n}</span>
            <span style={{ flex: 1, minWidth: 0, color: NAVY, fontWeight: 600, wordBreak: 'break-word' }}>{v}</span>
          </div>
        ))}
      </div>
      <p style={{ margin: '9px 2px 0', fontSize: 6.5, color: '#94a3b8', lineHeight: 1.5 }}>El original firmado lo guarda RR.HH.</p>
      {copia && (
        <button onClick={() => ir({ p: 'pedir', inicial: { tipo: 'copia', clave: copia.clave }, fijo: true })} style={{ ...SECUNDARIO, width: '100%', height: 24, marginTop: 6 }}>
          Pedir una copia a RR.HH.
        </button>
      )}
    </div>
  )
}

/* ── RECIBIDOS ── */
const SOBRE = {
  certificado: [Award, 'Los certificados que RR.HH. le emitió.', 'Cuando RR.HH. le emita un certificado, llegará aquí.'],
  memorandum: [ScrollText, 'Los memorándums que RR.HH. le envió.', 'No recibió memorándums.'],
  otro: [Megaphone, 'Comunicados, reglamentos y otros documentos de RR.HH.', 'No recibió otros documentos.'],
}
function RecibidosPhone({ md, cat, atras, onLeer, onPedir }) {
  const lista = md.recibidos.filter(x => !cat || md.carpetaDe(x.emitido) === cat)
  const [Icono, sub, vacio] = SOBRE[cat] || SOBRE.otro
  return (
    <div>
      {atras}
      <Cabecera titulo={md.carpetasRrhh.find(([k]) => k === cat)?.[1] || 'Recibidos'} sub={sub}>
        {cat === 'certificado' && <Mas etiqueta="Pedir un certificado" onClick={onPedir} />}
      </Cabecera>
      {!lista.length ? (
        <Vacio Icono={Icono} titulo="Todavía no hay nada aquí" texto={vacio}>
          {cat === 'certificado' && <button onClick={onPedir} style={{ ...BOTON, marginTop: 9, height: 24 }}><Plus size={9} /> Pedir un certificado</button>}
        </Vacio>
      ) : (
        <div style={{ ...TARJETA, marginTop: 9 }}>
          {lista.map((r, i) => (
            <Fila key={r.emitido.id} primera={!i} Icono={Icono} tono="rosa" titulo={r.nombre}
              sub={`${r.emitido.numero} · ${fechaCorta(r.emitido.fecha)}`} flecha onClick={() => onLeer(r.emitido.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

/* Ya no se confirma la recepción (16 oct 2026): se lee y, si tiene un error, se reporta. */
function LeerPhone({ r, atras, onReportar }) {
  /* Un archivo propio (un reglamento en PDF) se abre aparte: en el teléfono no se dibuja. */
  const abrirArchivo = async () => {
    const blob = r.emitido.archivo?.clave ? await leerArchivo(r.emitido.archivo.clave) : null
    if (blob) window.open(URL.createObjectURL(blob), '_blank', 'noopener')
  }
  return (
    <div>
      {atras}
      <div style={{ fontSize: 9.5, fontWeight: 800, color: NAVY }}>{r.nombre}</div>
      <div style={{ fontSize: 6.5, color: '#94a3b8', marginTop: 2 }}>{r.emitido.numero} · {fechaCorta(r.emitido.fecha)}</div>
      <div style={{
        ...TARJETA, marginTop: 8, padding: '12px 11px', whiteSpace: 'pre-wrap',
        fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 7, lineHeight: 1.6, color: '#1F2933',
      }}>
        {r.emitido.archivo
          ? <button onClick={abrirArchivo} style={SECUNDARIO}>Abrir {r.emitido.archivo.nombre}</button>
          : r.texto}
      </div>
      {onReportar && (
        <button onClick={onReportar} style={{ ...SECUNDARIO, width: '100%', height: 24, marginTop: 8, color: TONOS.rojo[0] }}>
          <Flag size={9} /> Reportar un error
        </button>
      )}
    </div>
  )
}

const QUE_PIDE = {
  certificacion: { label: 'Un certificado', titulo: 'Pedir un certificado', pregunta: '¿Qué certificado necesita?', detalle: '¿Para qué lo necesita? (opcional)' },
  copia: { label: 'Copia del contrato', titulo: 'Pedir una copia', pregunta: '¿De qué contrato?', detalle: '¿Para qué la necesita? (opcional)' },
  correccion: { label: 'Una corrección', titulo: 'Reportar un error', pregunta: '¿Qué documento tiene el error?', detalle: '¿Qué está mal?' },
}

/* Pedir, en una pantalla: qué, cuál —una lista que se toca, no un desplegable, que en el teléfono
   abría la lista del sistema fuera del marco— y para qué. Desde un contrato llega con la copia de
   ese archivo ya elegida (`inicial`). */
function PedirPhone({ md, atras, inicial, fijo, onEnviada }) {
  const [tipo, setTipo] = useState(inicial?.tipo || 'certificacion')
  const [clave, setClave] = useState(inicial?.clave || '')
  const [detalle, setDetalle] = useState('')
  const opciones = md.opciones[tipo]
  const opcion = opciones.find(o => o.clave === clave)
  const q = QUE_PIDE[tipo]
  const listo = !!opcion && (tipo !== 'correccion' || detalle.trim().length > 3)
  // La elegida, arriba: si llegó desde un archivo, que no tenga que buscarla en la lista.
  const ordenadas = useMemo(() => [...opciones].sort((a, b) => (b.clave === inicial?.clave) - (a.clave === inicial?.clave)), [opciones, inicial])
  return (
    <div>
      {atras}
      <Cabecera titulo={fijo ? q.titulo : 'Nueva solicitud'} sub={`RR.HH. responde dentro de ${PLAZO_SOLICITUD_DIAS} días hábiles.`} />

      {!fijo && <div style={{ display: 'flex', gap: 4, marginTop: 9 }}>
        {Object.entries(QUE_PIDE).map(([k, t]) => (
          <button key={k} onClick={() => { setTipo(k); setClave(''); setDetalle('') }} style={{
            flex: 1, padding: '6px 4px', borderRadius: 8, fontFamily: 'inherit', fontSize: 6.5, fontWeight: 700, cursor: 'pointer',
            border: `1px solid ${tipo === k ? NAVY : '#e2e8f0'}`, background: tipo === k ? NAVY : '#fff', color: tipo === k ? '#fff' : NAVY,
          }}>{t.label}</button>
        ))}
      </div>}

      <div style={ROTULO}>{q.pregunta}</div>
      {opciones.length ? (
        <div style={TARJETA}>
          {ordenadas.map((o, i) => (
            <button key={o.clave} onClick={() => setClave(o.clave)} style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '7px 9px', border: 'none', borderTop: i ? '1px solid #f1f5f9' : 'none',
              background: clave === o.clave ? '#ecfdf5' : '#fff', fontFamily: 'inherit', fontSize: 7, color: NAVY, textAlign: 'left', cursor: 'pointer',
            }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${clave === o.clave ? '#00B876' : '#cbd5e1'}`, background: clave === o.clave ? '#00E091' : '#fff' }} />
              {o.nombre}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 6.5, color: '#64748b', padding: '0 2px' }}>
          {tipo === 'correccion' ? 'Todavía no recibió documentos que se puedan corregir.' : 'No hay opciones disponibles por ahora.'}
        </div>
      )}

      <div style={ROTULO}>{q.detalle}</div>
      <textarea value={detalle} onChange={e => setDetalle(e.target.value)} rows={3}
        placeholder={tipo === 'correccion' ? 'Por ejemplo: mi segundo apellido figura mal escrito.' : 'Por ejemplo: para un trámite en el banco.'}
        style={{ width: '100%', boxSizing: 'border-box', padding: '6px 7px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', fontFamily: 'inherit', fontSize: 7, color: NAVY, outline: 'none', resize: 'none' }} />

      <button disabled={!listo} onClick={() => { md.solicitar({ tipo, opcion, detalle }); onEnviada() }} style={{
        ...BOTON, width: '100%', height: 26, marginTop: 10, fontSize: 7.5,
        background: listo ? '#00E091' : '#e2e8f0', color: listo ? NAVY : '#94a3b8', cursor: listo ? 'pointer' : 'default',
      }}>
        <Send size={9} /> Enviar a RR.HH.
      </button>
    </div>
  )
}

/* ── LA VISTA PREVIA ──────────────────────────────────────────────────────
   Lo que se subió en esta demo se guarda en el navegador y se ve tal cual: la imagen, o el PDF
   dibujado con pdf.js. La fotografía es la del perfil —la misma que se cambia en «Editar
   perfil»—. Lo demás viene de los datos de ejemplo y no tiene archivo: se dibuja una muestra con
   la forma del documento —un carnet, una hoja— y sus datos, marcada como muestra. */
const CARNETS = ['s-ci', 's-ci2', 's-garante']

function useFuente(x, perfil) {
  const archivo = x.version?.archivo
  const url = useArchivoLocal(archivo?.clave || null)
  if (url) return { url, pdf: archivo.formato === 'pdf' || archivo.tipoMime === 'application/pdf', nombre: archivo.nombre }
  if (x.subtipo.id === 's-foto' && perfil?.url) return { url: perfil.url, foto: true, nombre: archivoDe(x, perfil)?.nombre }
  return { muestra: true }
}

// El archivo que se muestra en «Datos»: el de la foto es el del perfil si lo cambió ahí.
function archivoDe(x, perfil) {
  if (x.subtipo.id === 's-foto' && perfil?.archivo && !x.version?.archivo?.clave) {
    return { nombre: perfil.archivo.nombre, tamanoKB: perfil.archivo.peso ? Math.round(perfil.archivo.peso / 1024) : null }
  }
  return x.version?.archivo || null
}

/* La vista previa sola, para la web (`pages/colaborador/MisDocumentos`): la misma foto, carnet u
   hoja que el celular, sin el marco ni los botones. La web la agranda con `zoom`. */
export function PreviaDocumento({ x, md, perfil, grande, alto = 190 }) {
  const f = useFuente(x, perfil)
  return <Previa x={x} f={f} perfil={perfil} md={md} alto={alto} grande={grande} />
}

export function Miniatura({ x, perfil, tono }) {
  const f = useFuente(x, perfil)
  if (f.url && !f.pdf) {
    return <img src={f.url} alt="" style={{ width: 20, height: 20, borderRadius: 6, objectFit: 'cover', flexShrink: 0, background: '#f1f5f9' }} />
  }
  const Icono = CARNETS.includes(x.subtipo.id) ? IdCard : esImagen(x.version) ? FileImage : FileText
  return <Cuadro Icono={Icono} tono={tono} />
}

function Visor({ x, md, perfil, onGrande, onAviso }) {
  const f = useFuente(x, perfil)
  const descargar = async () => {
    // Lo guardado en el navegador se abre y queda anotado; la foto del directorio se abre aparte.
    if (f.foto && !x.version?.archivo?.clave) { window.open(f.url, '_blank', 'noopener'); return }
    const ok = await md.abrir(x.version, x.doc.id)
    if (!ok) onAviso('No se pudo abrir el archivo en este navegador.')
  }
  return (
    <div style={{ ...TARJETA, marginTop: 9 }}>
      <button onClick={onGrande} aria-label="Ver en grande" style={{
        display: 'block', width: '100%', padding: 12, border: 'none', cursor: 'zoom-in',
        background: 'repeating-linear-gradient(45deg, #f4f7fa 0 6px, #eef2f6 6px 12px)',
      }}>
        <Previa x={x} f={f} perfil={perfil} md={md} alto={190} />
      </button>
      <div style={{ display: 'flex', gap: 6, padding: '8px 9px', borderTop: '1px solid #f1f5f9', alignItems: 'center' }}>
        {f.muestra
          ? <span style={{ flex: 1, fontSize: 6.5, color: '#94a3b8', lineHeight: 1.4 }}>Vista de ejemplo. El original lo guarda RR.HH.</span>
          : <span style={{ flex: 1, fontSize: 6.5, color: '#64748b', lineHeight: 1.4 }}>{f.foto ? 'Es la foto de su perfil.' : f.pdf ? 'PDF' : 'Imagen'}</span>}
        <button onClick={onGrande} style={SECUNDARIO}><Maximize2 size={8} /> Ver en grande</button>
        {!f.muestra && <button onClick={descargar} style={SECUNDARIO} aria-label="Descargar"><Download size={9} /></button>}
      </div>
    </div>
  )
}

function Previa({ x, f, perfil, md, alto, grande }) {
  if (f.url && f.pdf) {
    return (
      <div style={{ maxHeight: grande ? 'none' : alto, overflow: 'hidden', borderRadius: 4, boxShadow: '0 2px 8px rgba(12,45,64,.15)', background: '#fff' }}>
        <PaginasPdf url={f.url} primera={!grande} />
      </div>
    )
  }
  if (f.url) {
    return <img src={f.url} alt={`Vista previa de ${x.nombre}`} style={{
      display: 'block', margin: '0 auto', maxWidth: '100%', maxHeight: grande ? 'none' : alto, borderRadius: f.foto ? 10 : 4,
      objectFit: 'contain', boxShadow: '0 2px 8px rgba(12,45,64,.18)', background: '#fff',
    }} />
  }
  if (CARNETS.includes(x.subtipo.id)) return <Carnet x={x} persona={md.persona} foto={x.subtipo.id === 's-garante' ? null : perfil?.url} />
  return <Hoja x={x} persona={md.persona} foto={esImagen(x.version)} />
}

const MUESTRA = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-18deg)', pointerEvents: 'none',
  fontSize: 15, fontWeight: 900, letterSpacing: '.25em', color: 'rgba(12,45,64,.07)', whiteSpace: 'nowrap',
}

/* Un documento de identidad de muestra: foto, nombre, número y fechas, con la franja de lectura
   de abajo. Se dibuja sólo cuando no hay archivo. */
function Carnet({ x, persona, foto }) {
  const v = x.version || {}
  const partes = (persona?.name || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(' ')
  const garante = x.subtipo.id === 's-garante'
  const linea = garante ? 'ID<<GARANTE<<<<<<<<<<<<<<<<<<<<' : `ID<<${partes.slice(1).join('<')}<<${partes[0] || ''}`.padEnd(30, '<').slice(0, 30)
  const dato = (k, val) => (
    <div style={{ marginTop: 3 }}>
      <div style={{ fontSize: 4.5, letterSpacing: '.08em', color: '#5b7083', fontWeight: 700 }}>{k}</div>
      <div style={{ fontSize: 6.5, fontWeight: 700, color: NAVY, lineHeight: 1.2 }}>{val}</div>
    </div>
  )
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '1.586', borderRadius: 9, overflow: 'hidden', textAlign: 'left',
      background: 'radial-gradient(circle at 85% 20%, rgba(255,255,255,.7) 0 18%, transparent 19%), repeating-radial-gradient(circle at 80% 110%, #dcefe9 0 2px, #e6f1f8 2px 5px)',
      boxShadow: '0 3px 10px rgba(12,45,64,.2)', border: '1px solid rgba(12,45,64,.08)',
    }}>
      <div style={{ padding: '5px 9px', background: 'linear-gradient(90deg, #0E8F63, #1D5FBF)', color: '#fff', fontSize: 6, fontWeight: 800, letterSpacing: '.14em' }}>
        {garante ? 'DOCUMENTO DEL GARANTE' : 'CÉDULA DE IDENTIDAD'}
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '7px 9px 0' }}>
        <div style={{ width: '28%', aspectRatio: '3 / 4', borderRadius: 5, overflow: 'hidden', background: '#cbd5e1', flexShrink: 0, display: 'flex' }}>
          {foto
            ? <img src={foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.85)' }} />
            : <IdCard size={22} style={{ color: '#94a3b8', margin: 'auto' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {dato('NOMBRE', garante ? `Garante de ${(persona?.name || '').split(' ')[0]}` : persona?.name)}
          {dato('N.º DE DOCUMENTO', garante ? '—' : persona?.documento || '—')}
          <div style={{ display: 'flex', gap: 10 }}>
            {dato('EMITIDA', v.emision ? fechaCorta(v.emision) : '—')}
            {dato('VENCE', v.vencimiento ? fechaCorta(v.vencimiento) : '—')}
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, padding: '3px 9px', background: 'rgba(255,255,255,.6)',
        fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 5.5, letterSpacing: '.12em', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden',
      }}>
        {linea}
      </div>
      <span style={MUESTRA}>MUESTRA</span>
    </div>
  )
}

/* Una hoja de muestra con el nombre del documento y sus datos. Si lo que se subió era una foto
   (un certificado fotografiado con el celular), la hoja se ve como una foto: sobre la mesa y algo
   torcida. */
function Hoja({ x, persona, foto }) {
  const v = x.version || {}
  const [c] = TONOS[iconoCarpeta(x.subtipo.tipoId)[1]] || TONOS.gris
  const hoja = (
    <div style={{
      position: 'relative', width: foto ? '78%' : '86%', margin: '0 auto', aspectRatio: '1 / 1.18', background: '#fff', borderRadius: 3,
      boxShadow: '0 3px 10px rgba(12,45,64,.18)', padding: '10px 11px', boxSizing: 'border-box', textAlign: 'left', overflow: 'hidden',
      transform: foto ? 'rotate(-2.5deg)' : 'none',
    }}>
      <div style={{ height: 3, margin: '-10px -11px 8px', background: c }} />
      <div style={{ fontSize: 5, letterSpacing: '.14em', fontWeight: 800, color: '#94a3b8' }}>{(x.subtipo.nombre || '').toUpperCase()}</div>
      <div style={{ fontSize: 8, fontWeight: 800, color: NAVY, marginTop: 4, lineHeight: 1.2 }}>{x.nombre}</div>
      <div style={{ fontSize: 6, color: '#475569', marginTop: 3 }}>{persona?.name} · {persona?.documento}</div>
      {x.subtipo.id === 's-croquis' ? <Mapa color={c} /> : <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[94, 80, 88, 62, 90, 74, 84, 55].map((w, i) => <span key={i} style={{ height: 3, width: `${w}%`, borderRadius: 2, background: '#e8edf2' }} />)}
      </div>}
      <div style={{ position: 'absolute', left: 11, right: 11, bottom: 9, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 5.5, color: '#64748b', lineHeight: 1.4 }}>
          {v.emision && <>Emitido el {fechaCorta(v.emision)}<br /></>}
          {v.vencimiento && <>Válido hasta el {fechaCorta(v.vencimiento)}</>}
        </span>
        <span style={{
          width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${c}`, color: c, opacity: 0.55, fontSize: 4, fontWeight: 900,
          letterSpacing: '.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-14deg)',
        }}>MUESTRA</span>
      </div>
      <span style={MUESTRA}>MUESTRA</span>
    </div>
  )
  if (!foto) return hoja
  return <div style={{ padding: '10px 0', borderRadius: 6, background: 'linear-gradient(160deg, #3b4652, #232b33)' }}>{hoja}</div>
}

/* ── EN GRANDE: el documento a todo el ancho, con todas sus páginas ── */
function VerPhone({ md, docId, atras, perfil }) {
  const x = md.propios.find(d => d.doc.id === docId)
  if (!x) return <div>{atras}</div>
  return <VerGrande x={x} md={md} atras={atras} perfil={perfil} />
}

function VerGrande({ x, md, atras, perfil }) {
  const f = useFuente(x, perfil)
  return (
    <div>
      {atras}
      <div style={{ ...TARJETA, padding: f.url ? 0 : 12, background: f.url ? '#fff' : '#eef2f6' }}>
        <Previa x={x} f={f} perfil={perfil} md={md} grande />
      </div>
      {f.url && (
        <a href={f.url} download={f.nombre || x.nombre} target={f.foto ? '_blank' : undefined} rel="noopener noreferrer"
          style={{ ...BOTON, width: '100%', boxSizing: 'border-box', height: 26, marginTop: 10, fontSize: 7.5, textDecoration: 'none' }}>
          <Download size={10} /> Descargar
        </a>
      )}
      {f.muestra && <p style={{ margin: '8px 2px 0', fontSize: 6.5, color: '#94a3b8', lineHeight: 1.5, textAlign: 'center' }}>Vista de ejemplo con sus datos. El original lo guarda RR.HH.</p>}
    </div>
  )
}

/* El croquis del domicilio, dibujado: unas calles y el punto de la casa. */
function Mapa({ color }) {
  return (
    <svg viewBox="0 0 100 56" style={{ display: 'block', width: '100%', marginTop: 7, borderRadius: 3, background: '#f3f6f4' }} aria-hidden="true">
      <rect x="58" y="30" width="22" height="14" rx="2" fill="#dcefe3" />
      <g stroke="#ffffff" strokeWidth="5" strokeLinecap="round">
        <path d="M-2 18 H102" /><path d="M-2 46 C30 40 60 50 102 40" /><path d="M30 -2 V58" /><path d="M74 -2 L64 58" />
      </g>
      <g stroke="#d5dde4" strokeWidth="0.6" fill="none">
        <path d="M-2 18 H102" /><path d="M-2 46 C30 40 60 50 102 40" /><path d="M30 -2 V58" /><path d="M74 -2 L64 58" />
      </g>
      <path d="M30 18 H52 V31" stroke={color} strokeWidth="1.2" strokeDasharray="2 1.6" fill="none" />
      <path d="M52 22 c-4 0 -6 3 -6 6 c0 4 6 9 6 9 s6 -5 6 -9 c0 -3 -2 -6 -6 -6z" fill={color} />
      <circle cx="52" cy="28" r="2" fill="#fff" />
    </svg>
  )
}

/* ── MIS SOLICITUDES (ZONA HR) ───────────────────────────────────────────
   Una sección propia, no una carpeta de Mis documentos: una solicitud es un trámite que se sigue
   —la pidió, RR.HH. la tiene, se la atendieron o no y por qué—. Hoy son las de Documentación
   (certificados, copias del contrato, correcciones); mañana caen aquí también vacaciones,
   permisos o anticipos, y el colaborador sigue todo en un solo lugar. Desde Mis documentos se
   pide con un atajo; el seguimiento se hace aquí. */
const ICONO_SOLICITUD = { certificacion: Award, copia: ScrollText, correccion: Flag }

export function MisSolicitudesPhone({ currentUser, onVolver }) {
  const md = useMisDocumentos(currentUser.name, 'app')
  const [pila, setPila] = useState([{ p: 'lista' }])
  const [aviso, setAviso] = useState(null)
  const actual = pila[pila.length - 1]
  const ir = x => { setPila(s => [...s, x]); arriba() }
  const volver = () => { setPila(s => (s.length > 1 ? s.slice(0, -1) : s)); arriba() }

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 3200)
    return () => clearTimeout(t)
  }, [aviso])

  if (!md.persona) {
    return (
      <div>
        <BarraVolver texto="Zona HR" onVolver={onVolver} />
        <Vacio Icono={MessageSquarePlus} titulo="Todavía no puede hacer solicitudes" texto="Cuando RR.HH. abra su expediente, podrá pedir certificados y seguir sus pedidos aquí." />
      </div>
    )
  }

  const atras = <BarraVolver texto={pila.length > 1 ? 'Mis solicitudes' : 'Zona HR'} onVolver={pila.length > 1 ? volver : onVolver} />
  let pantalla
  if (actual.p === 'pedir') {
    pantalla = <PedirPhone md={md} atras={atras} inicial={actual.inicial} fijo={actual.fijo} onEnviada={() => { setAviso('Solicitud enviada a RR.HH.'); volver() }} />
  } else if (actual.p === 'leer') {
    const r = md.recibidos.find(x => x.emitido.id === actual.id)
    pantalla = r
      ? <LeerPhone r={r} atras={atras} />
      : <div>{atras}</div>
  } else {
    pantalla = <ListaSolicitudes md={md} atras={atras} onNueva={() => ir({ p: 'pedir' })} onLeer={id => ir({ p: 'leer', id })} />
  }
  return (
    <div>
      {pantalla}
      <Aviso texto={aviso} />
    </div>
  )
}

function ListaSolicitudes({ md, atras, onNueva, onLeer }) {
  const [vista, setVista] = useState('curso')
  const enCurso = md.misSolicitudes.filter(q => q.estado === 'pendiente')
  const resueltas = md.misSolicitudes.filter(q => q.estado !== 'pendiente')
  const lista = vista === 'curso' ? enCurso : resueltas
  return (
    <div>
      {atras}
      <Cabecera titulo="Mis solicitudes" sub="Lo que pidió a RR.HH. y en qué va.">
        <Mas etiqueta="Nueva solicitud" onClick={onNueva} />
      </Cabecera>

      <div style={{ display: 'flex', gap: 3, marginTop: 9, padding: 2, borderRadius: 9, background: '#eef2f6' }}>
        {[['curso', 'En curso', enCurso.length], ['resueltas', 'Resueltas', resueltas.length]].map(([k, t, n]) => (
          <button key={k} onClick={() => setVista(k)} style={{
            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '5px 6px', borderRadius: 7, border: 'none',
            fontFamily: 'inherit', fontSize: 7.5, fontWeight: 700, cursor: 'pointer', color: NAVY,
            background: vista === k ? '#fff' : 'transparent', boxShadow: vista === k ? '0 1px 3px rgba(12,45,64,.12)' : 'none',
          }}>
            {t} <span style={{ color: '#94a3b8', fontWeight: 600 }}>{n}</span>
          </button>
        ))}
      </div>

      {!lista.length ? (
        <Vacio Icono={MessageSquarePlus} titulo={vista === 'curso' ? 'No tiene pedidos en curso' : 'Todavía no hay pedidos resueltos'}
          texto={vista === 'curso' ? 'Pida un certificado, la copia de su contrato o la corrección de un documento.' : 'Cuando RR.HH. responda sus pedidos, quedarán aquí.'}>
          {vista === 'curso' && <button onClick={onNueva} style={{ ...BOTON, marginTop: 9, height: 24 }}><Plus size={9} /> Nueva solicitud</button>}
        </Vacio>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 9 }}>
          {lista.map(q => <TarjetaSolicitud key={q.id} q={q} md={md} onLeer={onLeer} />)}
        </div>
      )}

      <p style={{ margin: '11px 2px 0', fontSize: 6.5, color: '#94a3b8', lineHeight: 1.5, textAlign: 'center' }}>
        Pronto podrá pedir aquí también vacaciones, permisos y anticipos.
      </p>
    </div>
  )
}

/* Cada pedido con su recorrido en tres pasos: enviado, en RR.HH. y la respuesta. */
function TarjetaSolicitud({ q, md, onLeer }) {
  const Icono = ICONO_SOLICITUD[q.tipo] || MessageSquarePlus
  const resuelta = q.estado !== 'pendiente'
  const rechazada = q.estado === 'rechazada'
  const fin = rechazada ? TONOS.rojo[0] : TONOS.verde[0]
  const pasos = [
    ['Enviada', fechaCorta(q.fecha), true],
    ['En RR.HH.', resuelta ? 'Revisada' : `Responde hasta el ${fechaCorta(responderAntes(q.fecha))}`, true],
    [rechazada ? 'Rechazada' : 'Atendida', resuelta ? fechaCorta(q.resuelto?.fecha) : '—', resuelta],
  ]
  const recibido = md.recibidos.some(x => x.emitido.id === q.resuelto?.emitidoId)
  return (
    <div style={{ ...TARJETA, padding: '9px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
        <Cuadro Icono={Icono} tono={TIPOS_SOLICITUD[q.tipo]?.tono || 'gris'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 7.5, fontWeight: 700, color: NAVY, lineHeight: 1.3 }}>{q.asunto}</div>
          <div style={{ fontSize: 6.5, color: '#64748b', marginTop: 1 }}>{TIPOS_SOLICITUD[q.tipo]?.singular}{q.detalle ? ` · ${q.detalle}` : ''}</div>
        </div>
        <Chip tono={ESTADOS_SOLICITUD[q.estado]?.tono}>{ESTADOS_SOLICITUD[q.estado]?.label}</Chip>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 9 }}>
        {pasos.map(([t, f, hecho], i) => {
          const color = i === 2 && resuelta ? fin : hecho ? '#00B876' : '#cbd5e1'
          return (
            <div key={t} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {i > 0 && <span aria-hidden="true" style={{ position: 'absolute', top: 4, right: '50%', width: '100%', height: 2, background: hecho ? '#00B876' : '#e2e8f0' }} />}
              <span style={{ position: 'relative', width: 10, height: 10, borderRadius: '50%', background: hecho ? color : '#fff', border: `2px solid ${color}`, boxSizing: 'border-box' }} />
              <span style={{ fontSize: 6.5, fontWeight: 700, color: hecho ? NAVY : '#94a3b8', marginTop: 3 }}>{t}</span>
              <span style={{ fontSize: 5.5, color: '#94a3b8', lineHeight: 1.3 }}>{f}</span>
            </div>
          )
        })}
      </div>

      {q.resuelto?.nota && (
        <div style={{ marginTop: 8, padding: '6px 8px', borderRadius: 7, fontSize: 6.5, lineHeight: 1.45, color: NAVY, background: rechazada ? TONOS.rojo[1] : TONOS.verde[1] }}>
          <b>RR.HH.:</b> {q.resuelto.nota}
        </div>
      )}
      {recibido && (
        <button onClick={() => onLeer(q.resuelto.emitidoId)} style={{ ...BOTON, width: '100%', height: 24, marginTop: 8 }}>
          <FileText size={9} /> Ver el documento
        </button>
      )}
    </div>
  )
}
