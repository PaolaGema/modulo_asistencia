import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Upload, FileText, FileImage, Clock, ScrollText, CheckCircle2, MessageSquarePlus, FolderOpen, Folder, Check,
  IdCard, GraduationCap, Package, Paperclip, Inbox, Search, ChevronRight, Plus, X, History, Flag, Award, Megaphone, Download,
  Palmtree, PencilLine, House, Repeat, CalendarX, ChevronDown, Layers, Timer,
  Banknote,
  Copy,
} from 'lucide-react'
import BarraVolver from './BarraVolver'
import { useMisDocumentos, textoMotivo } from '../../hooks/useMisDocumentos'
import { useMisPedidos } from '../../hooks/useMisPedidos'
import { useAsistencia } from '../../context/AsistenciaContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { VerPapeleta } from './VacacionPhone'
import { armarPapeleta } from '../../utils/papeletaVacacion'
import SolicitarVacacionPhone from './VacacionPhone'
import SolicitarPermisoPhone from './PermisoPhone'
import { PedirExtraCel, CorregirMarcaCel } from '../asistencia/Marcador'
import { habilSiguiente, diaISO, DIAS_LARGOS, MESES, saldoVacaciones, aFecha, fechaCorta as fechaCortaAt } from '../../data/asistenciaData'
import {
  ESTADOS, ESTADOS_CONTRATO, TIPOS_SOLICITUD, MODALIDADES, fechaCorta,
  responderAntes, limiteSolicitud, iso,
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
/* Los mismos tonos con las variables del tema, para las pantallas que ya siguen el modo oscuro. */
const TONOS_CEL = {
  verde: ['var(--tx-verde)', 'var(--tn-verde)'], ambar: ['var(--tx-ambar)', 'var(--tn-ambar)'], rojo: ['var(--in-rojo)', 'var(--in-rojo-bg)'],
  azul: ['var(--tx-azul)', 'var(--tn-azul)'], violeta: ['var(--tx-violeta)', 'var(--tn-violeta)'], gris: ['var(--tx-gris)', 'var(--tn-gris)'],
  cian: ['var(--tx-cian)', 'var(--tn-cian)'], rosa: ['var(--tx-rosa)', 'var(--tn-rosa)'],
}
const TONOS = {
  verde: ['#0F7A4F', '#E6F7EF'], ambar: ['#9A5B06', '#FFF4DE'], rojo: ['#B42318', '#FDECEA'],
  azul: ['#1D5FBF', '#E8F0FC'], violeta: ['#6A3FC0', '#F1ECFC'], gris: ['#4B5B6B', '#EDF1F5'],
  cian: ['#0E7490', '#E0F5F9'], rosa: ['#B4236C', '#FCE8F2'],
}
/* Con las piezas del Inicio (auditoría general, Mis documentos): tarjeta blanca con la sombra del Inicio,
   botones en píldora, el rótulo de sección navy y títulos en 600. */
const TARJETA = { background: 'var(--in-carta)', borderRadius: 15, boxShadow: 'var(--in-sombra)', overflow: 'hidden' }
const BOTON = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 22, padding: '0 11px',
  borderRadius: 99, border: 'none', background: '#00E091', color: NAVY, fontFamily: 'inherit', fontSize: 7.6, fontWeight: 600,
  cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
}
const SECUNDARIO = { ...BOTON, background: 'var(--in-fondo)' }
const ROTULO = { fontSize: 8.3, letterSpacing: '.02em', fontWeight: 600, color: 'var(--in-texto)', margin: '13px 2px 7px', textTransform: 'uppercase' }
const TITULO = { fontSize: 12.5, fontWeight: 600, color: NAVY, letterSpacing: '-.01em' }

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

function Cuadro({ Icono, size = 28 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px #00E091', color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icono size={Math.round(size * 0.43)} strokeWidth={1.8} />
    </span>
  )
}

function Fila({ Icono, tono, titulo, sub, extra, children, primera, onClick, flecha, lead, etiqueta }) {
  const Caja = onClick ? 'button' : 'div'
  return (
    <Caja onClick={onClick} style={{
      display: 'flex', alignItems: onClick && !extra ? 'center' : 'flex-start', gap: 8, width: '100%', padding: '9px 10px',
      border: 'none', borderTop: primera ? 'none' : '1px solid var(--in-linea)', background: 'var(--in-carta)',
      fontFamily: 'inherit', textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
    }}>
      {lead || <Cuadro Icono={Icono} tono={tono} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 500, color: NAVY, lineHeight: 1.3 }}>{titulo}</span>
          {etiqueta}
        </div>
        {sub && <div style={{ fontSize: 7.1, color: 'var(--in-mute)', lineHeight: 1.45, marginTop: 2 }}>{sub}</div>}
        {extra}
      </div>
      {children && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>{children}</div>}
      {flecha && <ChevronRight size={11} style={{ color: 'var(--in-suave)', flexShrink: 0, alignSelf: 'center' }} />}
    </Caja>
  )
}

/* El «+» redondo de arriba a la derecha: subir algo a esta carpeta. */
function Mas({ onClick, etiqueta }) {
  return (
    <button onClick={onClick} aria-label={etiqueta} title={etiqueta} style={{
      width: 26, height: 26, borderRadius: '50%', border: 'none', background: '#00E091', color: NAVY, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
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
        {sub && <div style={{ fontSize: 7.4, color: 'var(--in-mute)', lineHeight: 1.45, marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

const arriba = () => document.querySelector('.phone-scroll')?.scrollTo(0, 0)

/* `inicio`: pantallas que se abren ya apiladas encima de la portada (el buscador de Zona HR lleva directo a una carpeta o a un documento). */
export default function MisDocumentosPhone({ currentUser, onVolver, inicio, onPerfilDocs }) {
  const md = useMisDocumentos(currentUser.name, 'app')
  const pedidos = useMisPedidos(currentUser.name)
  // Las papeletas: vacaciones y permisos que RR.HH. ya aprobó.
  const papeletas = pedidos.todos.filter(p => p.origen === 'asistencia' && ['vacaciones', 'permiso'].includes(p.tipo) && p.estado === 'ok')
  const nuevas = pedidos.nuevas.filter(p => papeletas.some(x => x.id === p.id)).length
  const { ficha } = useMiFicha(currentUser.name)
  const fotoUrl = useFotoPerfil(currentUser.name, ficha?.form?.['1.9'], 400)
  const perfil = { url: fotoUrl, archivo: ficha?.form?.['1.9']?.clave ? ficha.form['1.9'] : null }
  const [pila, setPila] = useState(() => [{ p: 'inicio' }, ...(inicio || [])])
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
    if (x.p === 'elegir') return DOCUMENTO_PEDIDO[x.tipo].nombre
    if (x.p === 'leer') return md.recibidos.find(y => y.emitido.id === x.id)?.nombre || 'Documento'
    return { contratos: 'Contratos', contrato: 'Contrato', pendientes: 'Por entregar', papeletas: 'Papeletas', detalle: 'Papeleta' }[x.p] || 'Volver'
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
    case 'archivo': pantalla = <ArchivoPhone md={md} docId={actual.id} atras={atras} onAviso={setAviso} perfil={perfil} />; break
    case 'ver': pantalla = <VerPhone md={md} docId={actual.id} atras={atras} perfil={perfil} />; break
    case 'contratos': pantalla = <ContratosPhone md={md} atras={atras} ir={ir} />; break
    case 'contrato': pantalla = <ContratoPhone md={md} id={actual.id} atras={atras} ir={ir} />; break
    case 'recibidos': pantalla = <RecibidosPhone md={md} cat={actual.cat} atras={atras} onLeer={leer} onPedir={() => ir({ p: 'elegir', tipo: 'certificacion' })} />; break
    case 'leer': {
      const r = md.recibidos.find(x => x.emitido.id === actual.id)
      pantalla = r
        ? <LeerPhone r={r} atras={atras}
          onReportar={() => ir({ p: 'revisar', tipo: 'correccion', clave: r.emitido.id })} />
        : <div>{atras}</div>
      break
    }
    case 'pendientes': pantalla = <PendientesPhone md={md} atras={atras} onSubido={setAviso} />; break
    case 'papeletas': pantalla = <PapeletasPhone papeletas={papeletas} atras={atras} ir={ir} />; break
    case 'detalle': pantalla = <DetallePedido nombre={currentUser.name} id={actual.id} md={md} atras={atras} onLeer={leer} onAviso={setAviso} onCancelada={volver} />; break
    case 'subir': pantalla = <SubirPhone md={md} tipoId={actual.id} atras={atras} onSubido={subido} />; break
    case 'elegir': pantalla = <ElegirDocumento md={md} tipo={actual.tipo} atras={atras} onElegir={clave => ir({ p: 'revisar', tipo: actual.tipo, clave })} />; break
    // Al enviar vuelve a donde se pidió: si pasó por «elegir», salta también esa pantalla.
    case 'revisar':
      pantalla = <RevisarDocumento md={md} tipo={actual.tipo} clave={actual.clave} atras={atras}
        onEnviada={() => { setAviso(avisoSolicitud); setPila(s => s.slice(0, s[s.length - 2]?.p === 'elegir' ? -2 : -1)); arriba() }} />
      break
    default: pantalla = <InicioPhone md={md} papeletas={papeletas} nuevas={nuevas} atras={atras} ir={ir} onPerfilDocs={onPerfilDocs} />
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
      borderRadius: 12, background: NAVY, color: '#fff', fontSize: 7.6, fontWeight: 600, boxShadow: '0 4px 14px rgba(12,45,64,.25)',
    }}>
      <CheckCircle2 size={10} style={{ color: '#00E091', flexShrink: 0 }} /> {texto}
    </div>
  )
}

function Vacio({ Icono, titulo, texto, children }) {
  return (
    <div style={{ ...TARJETA, marginTop: 8, padding: '18px 14px', textAlign: 'center' }}>
      <Icono size={18} style={{ color: '#00B876', display: 'block', margin: '0 auto' }} />
      <div style={{ fontSize: 9, fontWeight: 600, color: NAVY, marginTop: 5 }}>{titulo}</div>
      <div style={{ fontSize: 7.4, color: 'var(--in-mute)', marginTop: 3, lineHeight: 1.5 }}>{texto}</div>
      {children}
    </div>
  )
}

/* ── INICIO (propuesta A, «carpetas en grilla») ────────────────────────────
   Arriba, una franja oscura con el avance en un anillo y lo que debe en una línea; debajo, las
   carpetas como mosaicos de dos en dos, todas amarillas como las de Windows, con un punto
   cuando adentro hay algo que atender. Se sube desde el «+» de cada carpeta o desde
   «Resolver»; buscar, con una lupa arriba que abre el buscador sólo cuando se lo pide. */

/* LA CARPETA (opción C2 elegida): una carpeta de verdad —pestaña, una hoja asomando y el frente— en el
   menta de la marca en vez del amarillo. Lisa, sin sello: lo que guarda lo dice su nombre. */
function Carpeta() {
  return (
    <span aria-hidden="true" style={{ position: 'relative', width: 40, height: 30, display: 'block', flexShrink: 0 }}>
      <span style={{ position: 'absolute', left: 0, top: 0, width: 16, height: 7, borderRadius: '3px 5px 0 0', background: '#5FDCA6' }} />
      <span style={{ position: 'absolute', left: 0, right: 0, top: 4, bottom: 0, borderRadius: '3px 6px 6px 6px', background: 'linear-gradient(180deg, #8DE8C0, #74E0B1)' }} />
      <span style={{ position: 'absolute', left: 6, right: 6, top: 2, height: 8, borderRadius: 2, background: '#fff', boxShadow: '0 1px 2px rgba(12,45,64,.12)' }} />
      <span style={{ position: 'absolute', left: 0, right: 0, top: 9, bottom: 0, borderRadius: '4px 6px 6px 6px', background: 'linear-gradient(180deg, #B4F1D6, #93E9C4)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6)' }} />
    </span>
  )
}

/* El mosaico de una carpeta (opción MD2, como la cuadrícula de Zona HR): lo que hay que atender va como la
   etiqueta de estado de siempre arriba a la derecha, no como un puntito. */
const TONO_PISTA = { rojo: 'rojo', ambar: 'ambar', azul: 'gris', verde: 'verde' }
function Mosaico({ titulo, sub, pista, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, padding: '11px 10px 10px', borderRadius: 15,
      border: 'none', background: 'var(--in-carta)', boxShadow: 'var(--in-sombra)', fontFamily: 'inherit', color: NAVY, textAlign: 'left', cursor: 'pointer',
    }}>
      {pista && <span style={{ position: 'absolute', top: 9, right: 9 }}><Chip tono={TONO_PISTA[pista[1]] || 'gris'}>{pista[0]}</Chip></span>}
      <Carpeta />
      <span style={{ fontSize: 8.8, fontWeight: 600, lineHeight: 1.25 }}>{titulo}</span>
      <span style={{ fontSize: 7, color: 'var(--in-mute)', lineHeight: 1.35, marginTop: -3 }}>{sub}</span>
    </button>
  )
}

/* LA PORTADA (opción DC1, «carpetas en mosaico»): aquí solo se acumula lo que RR.HH. le entrega —las
   papeletas de vacaciones y permisos aprobados, sus contratos, certificados, cartas y memorándums—.
   Lo que entrega usted (lo de su ficha: carnet, títulos, licencias) vive en Perfil › Documentación,
   y la tarjeta menta del final lleva allá. Así ningún archivo aparece en los dos lugares. */
function InicioPhone({ md, papeletas, nuevas, atras, ir, onPerfilDocs }) {
  const [buscando, setBuscando] = useState(false)
  const [q, setQ] = useState('')
  const total = papeletas.length + md.misContratos.length + md.recibidos.length
  const vigentes = md.misContratos.filter(c => c.estado === 'vigente').length

  return (
    <div>
      {atras}
      {/* Título con su línea y la lupa redonda del Inicio a la derecha. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1, display: 'grid', minWidth: 0 }}>
          <span style={TITULO}>Mis documentos</span>
          <small style={{ fontSize: 8.2, color: 'var(--in-mute)' }}>Lo que RR.HH. le entrega · {archivos(total).toLowerCase()}</small>
        </span>
        <button onClick={() => { setBuscando(b => !b); setQ('') }} aria-label={buscando ? 'Cerrar la búsqueda' : 'Buscar un documento'} style={{
          width: 29, height: 29, borderRadius: '50%', border: 'none', background: buscando ? NAVY : 'var(--in-carta)', color: buscando ? '#fff' : NAVY, boxShadow: 'var(--in-sombra)',
          display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0, padding: 0,
        }}>
          {buscando ? <X size={12} /> : <Search size={12} strokeWidth={2.2} />}
        </button>
      </div>

      {buscando && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 9, padding: '0 10px', height: 30, borderRadius: 99, background: 'var(--in-carta)', boxShadow: '0 0 0 1.4px var(--in-texto), var(--in-sombra)' }}>
          <Search size={12} style={{ color: 'var(--in-mute)', flexShrink: 0 }} />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Papeleta, contrato, certificado…"
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'none', fontFamily: 'inherit', fontSize: 9, color: NAVY }} />
        </div>
      )}

      {buscando && q.trim() ? <Resultados md={md} papeletas={papeletas} q={q} ir={ir} /> : <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 7, marginTop: 11 }}>
          <Mosaico titulo="Papeletas" sub={`${archivos(papeletas.length)} · vacaciones y permisos`} onClick={() => ir({ p: 'papeletas' })}
            pista={nuevas ? [`${nuevas} nueva${nuevas > 1 ? 's' : ''}`, 'verde'] : null} />
          <Mosaico titulo="Contratos" onClick={() => ir({ p: 'contratos' })}
            sub={vigentes ? `${archivos(md.misContratos.length)} · ${vigentes} vigente${vigentes > 1 ? 's' : ''}` : archivos(md.misContratos.length)} />
          {md.carpetasRrhh.map(([cat, nombre]) => (
            <Mosaico key={cat} titulo={nombre} onClick={() => ir({ p: 'recibidos', cat })}
              sub={archivos(md.recibidos.filter(x => md.carpetaDe(x.emitido) === cat).length)} />
          ))}
        </div>

        <button onClick={() => ir({ p: 'elegir', tipo: 'certificacion' })} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginTop: 10, padding: '9px 10px', borderRadius: 15,
          border: 'none', background: 'var(--in-carta)', boxShadow: 'var(--in-sombra)', fontFamily: 'inherit', color: NAVY, textAlign: 'left', cursor: 'pointer',
        }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#00E091', color: NAVY, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Plus size={13} strokeWidth={2.6} /></span>
          <span style={{ flex: 1, fontSize: 9, fontWeight: 500 }}>Pedir un certificado</span>
          <ChevronRight size={11} style={{ color: 'var(--in-suave)' }} />
        </button>

        {onPerfilDocs && <Puente titulo="Sus documentos personales" sub="Carnet, títulos, licencias: están en Perfil › Documentación" onClick={onPerfilDocs} />}
      </>}
    </div>
  )
}

/* LA TARJETA MENTA que une Mis documentos con Perfil › Documentación. */
export function Puente({ titulo, sub, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginTop: 12, padding: '9px 11px', borderRadius: 14,
      border: 'none', background: 'var(--in-ok-bg)', boxShadow: 'inset 0 0 0 1.2px rgba(0,224,145,.45)', fontFamily: 'inherit', color: 'var(--in-texto)', textAlign: 'left', cursor: 'pointer',
    }}>
      <span style={{ flex: 1, display: 'grid', minWidth: 0 }}>
        <b style={{ fontSize: 8.6, fontWeight: 600 }}>{titulo}</b>
        <span style={{ fontSize: 7.2, color: 'var(--in-mute)' }}>{sub}</span>
      </span>
      <ChevronRight size={11} style={{ color: '#0A7F55', flexShrink: 0 }} />
    </button>
  )
}

/* Agrupa por año, el más nuevo primero. */
const porAnio = (lista, fecha) => {
  const grupos = new Map()
  for (const x of lista) {
    const a = String(fecha(x) || '').slice(0, 4) || '—'
    if (!grupos.has(a)) grupos.set(a, [])
    grupos.get(a).push(x)
  }
  return [...grupos.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
}

/* PAPELETAS: las vacaciones y permisos que RR.HH. aprobó, por año. Cada una abre su detalle, con la
   papeleta para ver. */
function PapeletasPhone({ papeletas, atras, ir }) {
  return (
    <div>
      {atras}
      <Cabecera titulo="Papeletas" sub="Sus vacaciones y permisos aprobados. Se suman aquí cuando RR.HH. los aprueba." />
      {!papeletas.length ? (
        <Vacio Icono={Palmtree} titulo="Todavía no hay papeletas" texto="Cuando RR.HH. apruebe una vacación o un permiso, su papeleta llegará aquí." />
      ) : porAnio(papeletas, p => p.original?.desde || p.fecha).map(([anio, lista]) => (
        <div key={anio}>
          <div style={ROTULO}>{anio}</div>
          <div style={TARJETA}>
            {lista.map((p, i) => {
              const [Icono] = tipoDe(p)
              return (
                <Fila key={p.id} primera={!i} Icono={Icono} titulo={p.titulo} flecha onClick={() => ir({ p: 'detalle', id: p.id })}
                  sub={p.respondida ? `Aprobada el ${fechaCorta(p.respondida)}` : 'Aprobada'}>
                  <Chip tono="verde">Aprobada</Chip>
                </Fila>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const DICHOS = { carnet: 'identidad', ci: 'identidad', cedula: 'identidad', carne: 'identidad', diploma: 'titulo', foto: 'fotografia', licencia: 'licencia' }

/* Lo que se busca, en todas las carpetas a la vez: sus documentos, sus contratos y lo recibido. */
function Resultados({ md, papeletas, q, ir }) {
  /* Como lo dice la gente: «carnet» o «CI» es el documento de identidad; «título», el diploma. */
  const t = sinTildes(q.trim())
  const dicho = t.length > 1 && Object.entries(DICHOS).find(([k]) => k.startsWith(t) || t.startsWith(k))?.[1]
  const hay = (...xs) => xs.some(x => sinTildes(x).includes(t) || (dicho && sinTildes(x).includes(dicho)))
  const docs = papeletas.filter(p => hay(p.titulo, 'papeleta'))
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
          <Fila key={x.id} primera={!i} Icono={tipoDe(x)[0]} titulo={x.titulo}
            sub="Papeletas" flecha onClick={() => ir({ p: 'detalle', id: x.id })} />
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
          <div style={TARJETA}>
            {faltan.map((p, i) => (
              <Fila key={p.clave} primera={!i} Icono={Icono} titulo={p.subtipo.persona} sub={textoMotivo(p)}
                etiqueta={<Chip tono="gris">Falta</Chip>}
                extra={<div style={{ marginTop: 6 }}>{p.subeEl ? <SubirBoton p={p} md={md} onSubido={err => { if (!err) onAviso('Enviado. Quedó en revisión.') }} /> : <span style={{ fontSize: 7, color: 'var(--in-mute)' }}>Lo carga RR.HH.</span>}</div>} />
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
function SubirBoton({ p, md, onSubido, texto, suave, grande }) {
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
      <button onClick={() => input.current?.click()} disabled={subiendo} style={grande ? PILDORA_MENTA : suave ? SECUNDARIO : BOTON}>
        <Upload size={grande ? 10 : 8} /> {subiendo ? 'Enviando…' : texto || p.accion || 'Subir'}
      </button>
      {error && <div role="alert" style={{ fontSize: 6.5, fontWeight: 700, color: TONOS.rojo[0], maxWidth: 110, textAlign: 'right' }}>{error}</div>}
    </>
  )
}

/* ── UN ARCHIVO: verlo, sus datos, sus versiones y renovarlo ── */
/* ── VER UN DOCUMENTO (opción V1: la vista W2 de Perfil en todas) ──
   Un archivo, un contrato y lo que manda RR.HH. se ven igual, y igual que en Perfil › Documentación:
   arriba la tarjeta destacada con los círculos de Perfil —tipo, nombre, estado (y los días si vence) y
   sus acciones en píldora—; debajo la hoja recortada con «Ver entero» y los datos en dos columnas. Lo raro
   o peligroso («Reportar un error») va al final como fila roja. */
const diasHasta = iso => {
  if (!iso) return null
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  return Math.round((new Date(iso.slice(0, 10) + 'T00:00:00') - hoy) / 864e5)
}
const PILDORA_BLANCA = { ...BOTON, height: 28, background: 'var(--in-carta)', boxShadow: 'var(--in-sombra)', fontSize: 8.2 }
const PILDORA_MENTA = { ...BOTON, height: 28, fontSize: 8.2 }

function TarjetaDoc({ tipo, titulo, estado, linea, dias, vence, acciones = [] }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--in-carta)', borderRadius: 18, boxShadow: 'var(--in-sombra)', padding: '13px 13px 12px', marginBottom: 10 }}>
      <span aria-hidden="true" style={{ position: 'absolute', width: 150, height: 150, top: -70, right: -50, borderRadius: '50%', background: 'rgba(0,224,145,.10)' }} />
      <span aria-hidden="true" style={{ position: 'absolute', width: 80, height: 80, top: 30, right: -40, borderRadius: '50%', background: 'rgba(0,224,145,.07)' }} />
      <div style={{ position: 'relative', display: 'grid', gap: 2 }}>
        <span style={{ fontSize: 7.2, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--in-acento-txt)' }}>{tipo}</span>
        <b style={{ fontSize: 12, fontWeight: 600, letterSpacing: '-.01em', color: NAVY }}>{titulo}</b>
        {dias !== null && dias !== undefined ? (
          <div style={{ display: 'grid', justifyItems: 'start', gap: 2, marginTop: 6 }}>
            {estado}
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.02em', lineHeight: 1.1, color: NAVY }}>{Math.abs(dias)} {Math.abs(dias) === 1 ? 'día' : 'días'}</span>
            <small style={{ fontSize: 7.6, color: 'var(--in-mute)' }}>{dias < 0 ? 'desde que venció' : 'para que venza'} · {vence}</small>
          </div>
        ) : (
          <>
            {estado && <span style={{ marginTop: 5 }}>{estado}</span>}
            {linea && <small style={{ fontSize: 7.6, color: 'var(--in-mute)', marginTop: 3 }}>{linea}</small>}
          </>
        )}
        {acciones.filter(Boolean).length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: acciones.filter(Boolean).length > 1 ? '1fr 1fr' : '1fr', gap: 7, marginTop: 10 }}>
            {acciones.filter(Boolean)}
          </div>
        )}
      </div>
    </div>
  )
}

/* Los datos en las dos columnas fijas de la ficha. */
function DatosDoc({ datos }) {
  return (
    <div style={TARJETA}>
      {datos.map(([k, v], i) => (
        <div key={k} style={{ display: 'grid', gridTemplateColumns: '42% 1fr', gap: 8, alignItems: 'baseline', padding: '6px 10px', borderTop: i ? '1px solid var(--in-linea)' : 'none' }}>
          <span style={{ fontSize: 7.2, color: 'var(--in-mute)' }}>{k}</span>
          <span style={{ fontSize: 8.4, fontWeight: 500, color: NAVY, overflowWrap: 'anywhere' }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

/* La hoja recortada: se ve qué es; «Ver entero» la abre completa. */
function HojaRecortada({ x, md, perfil }) {
  const [entera, setEntera] = useState(false)
  const fte = useFuente(x, perfil)
  return (
    <button type="button" onClick={() => setEntera(v => !v)} aria-label={entera ? 'Achicar el documento' : 'Ver el documento entero'} style={{
      position: 'relative', display: 'block', width: '100%', padding: 12, border: 'none', borderRadius: 15, cursor: 'pointer', overflow: 'hidden',
      background: 'var(--in-carta)', boxShadow: 'var(--in-sombra)', maxHeight: entera ? 'none' : 180, marginBottom: 10,
    }}>
      <Previa x={x} f={fte} perfil={perfil} md={md} alto={entera ? 9999 : 190} grande={entera} />
      {!entera && <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 36, background: 'linear-gradient(transparent, var(--in-carta) 70%)', display: 'grid', placeItems: 'end center', paddingBottom: 6, fontSize: 7.4, fontWeight: 600, color: 'var(--in-acento-txt)' }}>Ver entero</span>}
    </button>
  )
}

function ArchivoPhone({ md, docId, atras, onAviso, perfil }) {
  const x = md.propios.find(d => d.doc.id === docId)
  if (!x) return <div>{atras}</div>
  const { doc, subtipo, version: v, estado } = x
  const accion = { rechazado: 'Volver a subir', vencido: 'Renovar', por_vencer: 'Renovar' }[estado] || 'Subir una nueva'
  const carpeta = md.tiposActivos.find(t => t.id === subtipo.tipoId)?.nombre || subtipo.nombre
  const datos = [
    v?.emision && ['Emitido', fechaCorta(v.emision)],
    v?.vencimiento && ['Vence', fechaCorta(v.vencimiento)],
    subtipo.id === 's-foto' && perfil?.archivo && !v?.archivo?.clave ? ['Cambiada', 'Desde su perfil'] : v?.fecha && ['Subido', `${fechaCorta(v.fecha)}${v.subidoPor ? ` · ${v.canal === 'app' ? 'desde el celular' : v.subidoPor}` : ''}`],
    archivoDe(x, perfil) && ['Archivo', `${archivoDe(x, perfil).nombre}${archivoDe(x, perfil).tamanoKB ? ` · ${archivoDe(x, perfil).tamanoKB} KB` : ''}`],
  ].filter(Boolean)
  const versiones = [...(doc.versiones || [])].reverse()
  const descargar = async () => {
    if (!v?.archivo?.clave) { onAviso('Es una vista de ejemplo: el original lo guarda RR.HH.'); return }
    const ok = await md.abrir(v, doc.id)
    if (!ok) onAviso('No se pudo abrir el archivo en este navegador.')
  }
  const puedeSubir = subtipo.editableColab && estado !== 'en_revision'
  return (
    <div>
      {atras}
      <TarjetaDoc tipo={carpeta} titulo={x.nombre} estado={<Chip tono={ESTADOS[estado].tono}>{ESTADOS[estado].label}</Chip>}
        dias={v?.vencimiento && (estado === 'por_vencer' || estado === 'vencido') ? diasHasta(v.vencimiento) : null} vence={v?.vencimiento && fechaCorta(v.vencimiento)}
        linea={!subtipo.editableColab ? 'Este documento lo carga RR.HH.' : null}
        acciones={[
          <button key="d" type="button" onClick={descargar} style={puedeSubir ? PILDORA_BLANCA : PILDORA_MENTA}><Download size={10} /> Descargar</button>,
          puedeSubir && <SubirBoton key="s" p={{ subtipo, doc, estado }} md={md} texto={accion} grande onSubido={err => { if (!err) onAviso('Enviado. Quedó en revisión.') }} />,
        ]} />

      {estado === 'rechazado' && v?.motivoRechazo && (
        <div style={{ marginBottom: 10, padding: '8px 10px', borderRadius: 12, background: 'var(--in-rojo-bg)', color: 'var(--in-rojo)', fontSize: 7.4, lineHeight: 1.5 }}>
          <b>RR.HH. lo rechazó:</b> {v.motivoRechazo}
        </div>
      )}
      {estado === 'en_revision' && (
        <div style={{ marginBottom: 10, fontSize: 7.4, color: 'var(--in-mute)', lineHeight: 1.5, padding: '0 2px' }}>
          RR.HH. lo está revisando. Cuenta cuando lo apruebe.
        </div>
      )}

      <HojaRecortada x={x} md={md} perfil={perfil} />
      <DatosDoc datos={datos} />

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
              return (
                <Fila key={p.clave} primera={!i} Icono={iconoCarpeta(p.subtipo.tipoId)[0]} titulo={p.nombre || p.subtipo.persona} sub={textoMotivo(p)}
                  etiqueta={<Chip tono={ESTADOS[p.estado].tono}>{ESTADOS[p.estado].label}</Chip>}
                  extra={<div style={{ marginTop: 6 }}>{p.subeEl
                    ? <SubirBoton p={p} md={md} onSubido={err => { if (!err) onSubido('Enviado. Quedó en revisión.') }} />
                    : <span style={{ fontSize: 7, color: 'var(--in-mute)' }}>Lo gestiona RR.HH.</span>}</div>} />
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
              <Fila key={x.doc.id} primera={!i} Icono={Clock} titulo={x.subtipo.persona} sub={`Lo envió el ${fechaCorta(x.version.fecha)}. No tiene que hacer nada más.`}
                etiqueta={<Chip tono="gris">En revisión</Chip>} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── CONTRATOS ── */
/* CONTRATOS (DC1): el vigente arriba, destacado; debajo quedan guardados los anteriores y las adendas. */
function ContratosPhone({ md, atras, ir }) {
  const esAdenda = c => c.contrato.tipo === 'adenda'
  const vigente = md.misContratos.find(c => !esAdenda(c) && ['vigente', 'por_vencer'].includes(c.estado))
  const anteriores = md.misContratos.filter(c => !esAdenda(c) && c !== vigente)
  const adendas = md.misContratos.filter(esAdenda)
  const lista = (titulo, items) => items.length > 0 && (
    <>
      <div style={ROTULO}>{titulo}</div>
      <div style={TARJETA}>
        {items.map((c, i) => (
          <Fila key={c.contrato.id} primera={!i} Icono={esAdenda(c) ? FileText : ScrollText} titulo={c.nombre}
            sub={c.contrato.fin ? `${fechaCorta(c.contrato.inicio)} – ${fechaCorta(c.contrato.fin)}` : `Desde el ${fechaCorta(c.contrato.inicio)}`} flecha onClick={() => ir({ p: 'contrato', id: c.contrato.id })}>
            <Chip tono={ESTADOS_CONTRATO[c.estado]?.tono}>{ESTADOS_CONTRATO[c.estado]?.label}</Chip>
          </Fila>
        ))}
      </div>
    </>
  )
  return (
    <div>
      {atras}
      <Cabecera titulo="Contratos" sub={`${archivos(md.misContratos.length)} · los carga RR.HH.`} />
      {!md.misContratos.length ? (
        <Vacio Icono={ScrollText} titulo="Todavía no hay contratos" texto="Cuando RR.HH. registre su contrato, lo verá aquí." />
      ) : <>
        {vigente && (
          <button type="button" onClick={() => ir({ p: 'contrato', id: vigente.contrato.id })} style={{
            position: 'relative', overflow: 'hidden', display: 'grid', gap: 1, width: '100%', marginTop: 11, padding: '11px 12px', borderRadius: 16, border: 'none',
            background: 'var(--in-carta)', boxShadow: 'var(--in-sombra), inset 0 0 0 1.4px #00E091', fontFamily: 'inherit', color: NAVY, textAlign: 'left', cursor: 'pointer',
          }}>
            <span aria-hidden="true" style={{ position: 'absolute', width: 90, height: 90, right: -30, top: -40, borderRadius: '50%', background: 'rgba(0,224,145,.10)' }} />
            <span style={{ position: 'relative', fontSize: 6.8, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#0A7F55' }}>{ESTADOS_CONTRATO[vigente.estado]?.label}</span>
            <b style={{ position: 'relative', fontSize: 11, fontWeight: 600 }}>{vigente.nombre}</b>
            <span style={{ position: 'relative', fontSize: 7.4, color: 'var(--in-mute)' }}>{vigente.contrato.numero} · desde el {fechaCorta(vigente.contrato.inicio)}{vigente.contrato.fin ? ` hasta el ${fechaCorta(vigente.contrato.fin)}` : ''}</span>
            <span style={{ ...BOTON, position: 'relative', justifySelf: 'start', height: 22, marginTop: 7, fontSize: 7.6 }}><FileText size={10} /> Ver contrato</span>
          </button>
        )}
        {lista(vigente ? 'Anteriores' : 'Contratos', anteriores)}
        {lista('Adendas', adendas)}
      </>}
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
      <TarjetaDoc tipo="Contrato" titulo={c.nombre} estado={<Chip tono={ESTADOS_CONTRATO[c.estado]?.tono}>{ESTADOS_CONTRATO[c.estado]?.label}</Chip>}
        linea={`Desde el ${fechaCorta(k.inicio)} · ${k.fin ? `hasta el ${fechaCorta(k.fin)}` : 'sin fecha de fin'}`}
        acciones={[copia && (
          <button key="c" type="button" onClick={() => ir({ p: 'revisar', tipo: 'copia', clave: copia.clave })} style={PILDORA_MENTA}>
            <Copy size={10} /> Pedir una copia
          </button>
        )]} />
      <DatosDoc datos={datos} />
      <p style={{ margin: '9px 2px 0', fontSize: 7.2, color: 'var(--in-mute)', lineHeight: 1.5 }}>El original firmado lo guarda RR.HH.</p>
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
        porAnio(lista, r => r.emitido.fecha).map(([anio, deAnio]) => (
          <div key={anio}>
            <div style={ROTULO}>{anio}</div>
            <div style={TARJETA}>
              {deAnio.map((r, i) => (
                <Fila key={r.emitido.id} primera={!i} Icono={Icono} tono="rosa" titulo={r.nombre}
                  sub={`${r.emitido.numero} · ${fechaCorta(r.emitido.fecha)}`} flecha onClick={() => onLeer(r.emitido.id)} />
              ))}
            </div>
          </div>
        ))
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
      <TarjetaDoc tipo={`De RR.HH. · ${r.emitido.numero}`} titulo={r.nombre} linea={`Lo emitió RR.HH. el ${fechaCorta(r.emitido.fecha)}`}
        acciones={[r.emitido.archivo && <button key="a" type="button" onClick={abrirArchivo} style={PILDORA_MENTA}><Download size={10} /> Abrir {r.emitido.archivo.nombre}</button>]} />
      {/* El documento es papel: se queda con su letra. */}
      <div style={{
        ...TARJETA, padding: '12px 11px', whiteSpace: 'pre-wrap',
        fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 7, lineHeight: 1.6, color: '#1F2933',
      }}>
        {r.emitido.archivo ? 'Este documento es un archivo: ábralo con el botón de arriba.' : r.texto}
      </div>
      {onReportar && (
        <button onClick={onReportar} style={{ ...BOTON, width: '100%', height: 32, marginTop: 10, borderRadius: 15, background: 'var(--in-carta)', boxShadow: 'var(--in-sombra)', color: 'var(--in-rojo)', fontSize: 8.6 }}>
          <Flag size={10} /> Reportar un error
        </button>
      )}
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

/* `inicio`, igual que en Mis documentos: el buscador de Zona HR abre directo un pedido o «¿Qué necesita?». */
export function MisSolicitudesPhone({ currentUser, onVolver, inicio }) {
  const [filtro, setFiltro] = useState({ tipo: null, estado: null })
  const md = useMisDocumentos(currentUser.name, 'app')
  const [pila, setPila] = useState(() => [{ p: 'lista' }, ...(inicio || [])])
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

  const atras = <BarraVolver conTema texto={pila.length < 2 ? 'Zona HR' : pila[pila.length - 2].p === 'nueva' ? '¿Qué necesita?' : pila[pila.length - 2].p === 'elegir' ? DOCUMENTO_PEDIDO[pila[pila.length - 2].tipo].nombre : 'Mis solicitudes'} onVolver={pila.length > 1 ? volver : onVolver} />
  let pantalla
  if (actual.p === 'leer') {
    const r = md.recibidos.find(x => x.emitido.id === actual.id)
    pantalla = r
      ? <LeerPhone r={r} atras={atras} />
      : <div>{atras}</div>
  } else if (actual.p === 'nueva') {
    pantalla = <NuevaSolicitud atras={atras} onVacacion={() => ir({ p: 'vacacion' })} onPermiso={() => ir({ p: 'permiso' })} onExtra={() => ir({ p: 'extra' })} onCorregir={() => ir({ p: 'corregir' })} onDocumento={tipo => ir({ p: 'elegir', tipo })} />
  } else if (actual.p === 'elegir') {
    pantalla = <ElegirDocumento md={md} tipo={actual.tipo} atras={atras} onElegir={clave => ir({ p: 'revisar', tipo: actual.tipo, clave })} />
  } else if (actual.p === 'revisar') {
    pantalla = <RevisarDocumento md={md} tipo={actual.tipo} clave={actual.clave} atras={atras} onEnviada={() => { setAviso('Solicitud enviada a RR.HH.'); setPila([{ p: 'lista' }]); arriba() }} />
  } else if (actual.p === 'extra') {
    pantalla = <PedirExtraCel volverA="¿Qué necesita?" onVolver={volver} onEnviada={() => { setAviso('Pidió horas extra a RR.HH.'); setPila([{ p: 'lista' }]); arriba() }} />
  } else if (actual.p === 'corregir') {
    pantalla = <CorregirMarcaCel volverA="¿Qué necesita?" onVolver={volver} onEnviada={() => { setAviso('Solicitud enviada a RR.HH.'); setPila([{ p: 'lista' }]); arriba() }} />
  } else if (actual.p === 'permiso') {
    pantalla = <SolicitarPermisoPhone volverA="¿Qué necesita?" onVolver={volver} onListo={() => { setPila([{ p: 'lista' }]); arriba() }} listoTexto="Ver mis solicitudes" />
  } else if (actual.p === 'vacacion') {
    pantalla = <SolicitarVacacionPhone volverA="¿Qué necesita?" onVolver={volver} onListo={() => { setPila([{ p: 'lista' }]); arriba() }} listoTexto="Ver mis solicitudes" />
  } else if (actual.p === 'detalle') {
    pantalla = <DetallePedido nombre={currentUser.name} id={actual.id} md={md} atras={atras} onLeer={id => ir({ p: 'leer', id })} onAviso={setAviso} onCancelada={volver} />
  } else {
    pantalla = <ListaSolicitudes nombre={currentUser.name} filtro={filtro} setFiltro={setFiltro} atras={atras} onNueva={() => ir({ p: 'nueva' })} onAbrir={id => ir({ p: 'detalle', id })} />
  }
  return (
    <div>
      {pantalla}
      <Aviso texto={aviso} />
    </div>
  )
}

/* ── NUEVA SOLICITUD (opción A2 del lienzo «Pedir algo nuevo»): todo lo que se le puede pedir a
   RR.HH., en filas y en dos grupos, cada tipo con el ícono y el color de la lista y una línea que lo
   explica. Un tipo nuevo es una fila más. Permiso, trabajo remoto y corrección de marcación todavía
   no tienen formulario en el teléfono: se ven, marcados «Pronto», para que se sepa que vendrán. */
function NuevaSolicitud({ atras, onVacacion, onPermiso, onExtra, onCorregir, onDocumento }) {
  const at = useAsistencia()
  const libres = saldoVacaciones(at.yo, at.solicitudes, at.hoy).disponible
  const grupos = [
    ['Su tiempo', [
      [Palmtree, 'verde', 'Vacación', libres ? `Le ${libres === 1 ? 'queda 1 día' : `quedan ${libres} días`}` : 'No le quedan días por ahora', onVacacion],
      [Clock, 'violeta', 'Permiso o licencia', 'Por horas, por días o con respaldo', onPermiso],
      [House, 'cian', 'Trabajo remoto', 'Un día desde casa'],
      [Timer, 'azul', 'Horas extra', 'Para quedarse más tarde', onExtra],
      [PencilLine, 'ambar', 'Corregir una marcación', 'Olvidó marcar o marcó mal', onCorregir],
    ]],
    ['Documentos', [
      [Award, 'azul', 'Certificado de trabajo', 'Con o sin sueldo', () => onDocumento('certificacion')],
      [ScrollText, 'gris', 'Copia del contrato', 'Su contrato firmado', () => onDocumento('copia')],
      [Flag, 'ambar', 'Corregir un documento', 'Un dato está mal', () => onDocumento('correccion')],
    ]],
  ]
  /* Con las piezas de Configuración (opción S2): rótulo del Inicio, una tarjeta por grupo con filas
     separadas por una línea y el ícono en el círculo con aro menta. Lo que todavía no existe, apagado con «Pronto». */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {atras}
      <b style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--in-texto)', letterSpacing: '-.01em', margin: '-2px 2px 0' }}>¿Qué necesita?</b>
      {grupos.map(([titulo, filas]) => (
        <div key={titulo} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span style={ROTULO_SOL}>{titulo}</span>
          <div style={{ background: 'var(--in-carta)', borderRadius: 15, boxShadow: SOMBRA, overflow: 'hidden' }}>
            {filas.map(([Icono, , nombre, linea, onClick], i) => (
              <button key={nombre} type="button" disabled={!onClick} onClick={onClick} style={{
                width: '100%', display: 'grid', gridTemplateColumns: '30px 1fr auto', alignItems: 'center', gap: 9, padding: '9px 10px',
                border: 'none', borderTop: i ? '1px solid var(--in-linea)' : 'none', background: 'none', fontFamily: 'inherit', textAlign: 'left',
                cursor: onClick ? 'pointer' : 'default', color: 'var(--in-texto)',
              }}>
                <span style={{ opacity: onClick ? 1 : 0.5 }}><Aro Icono={Icono} /></span>
                <span style={{ display: 'grid', minWidth: 0, opacity: onClick ? 1 : 0.5 }}>
                  <b style={{ fontSize: 9.2, fontWeight: 500 }}>{nombre}</b>
                  <span style={{ fontSize: 7.2, color: 'var(--in-mute)' }}>{linea}</span>
                </span>
                {onClick
                  ? <ChevronRight size={11} style={{ color: 'var(--in-suave)' }} />
                  : <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, color: 'var(--tx-gris)', background: 'var(--tn-gris)', borderRadius: 99, padding: '2px 7px' }}>Pronto</em>}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── PEDIR UN DOCUMENTO (lienzo «Del menú al documento» con los cuadros T3): primero la opción, en
   cuadros anchos con una hojita dibujada y una línea que explica qué trae; al tocar uno se arma la
   solicitud como documento, igual que la papeleta de vacación, para revisarla y enviarla. Sin firma
   digital: la línea de RR.HH. queda «Pendiente». */
const DOCUMENTO_PEDIDO = {
  certificacion: { nombre: 'Certificado', titulo: 'Solicitud de certificado', pregunta: '¿Qué certificado necesita?', detalle: '¿Para qué lo necesita? (opcional)', ejemplo: 'Por ejemplo: para un trámite en el banco.', vacio: 'Por ahora no hay certificados para pedir.' },
  copia: { nombre: 'Copia del contrato', titulo: 'Solicitud de copia', pregunta: '¿De qué contrato?', detalle: '¿Para qué la necesita? (opcional)', ejemplo: 'Por ejemplo: para presentarla en la AFP.', vacio: 'Todavía no tiene contratos registrados.' },
  correccion: { nombre: 'Corregir un documento', titulo: 'Solicitud de corrección', pregunta: '¿Qué documento tiene el error?', detalle: '¿Qué está mal?', ejemplo: 'Por ejemplo: mi segundo apellido figura mal escrito.', vacio: 'Todavía no recibió documentos que se puedan corregir.' },
}
/* Cómo se ve cada opción: nombre, la línea que la explica y el sello de su hojita. */
function verOpcion(tipo, o) {
  const [nombre, numero] = o.nombre.split(' · ')
  if (tipo === 'certificacion') {
    return /sueldo|salario|haber/i.test(o.nombre)
      ? { nombre, linea: 'Lo mismo, más su sueldo básico. Lo piden bancos y alquileres.', sello: 'Bs', tono: 'verde' }
      : { nombre, linea: 'Dice su cargo, su área y desde cuándo trabaja.', sello: Award, tono: 'azul' }
  }
  if (tipo === 'copia') return { nombre, linea: numero ? `N° ${numero} · firmado` : 'Su contrato firmado', sello: ScrollText, tono: 'gris' }
  return { nombre, linea: numero ? `N° ${numero}` : 'Un documento que recibió', sello: Flag, tono: 'ambar' }
}


function ElegirDocumento({ md, tipo, atras, onElegir }) {
  const q = DOCUMENTO_PEDIDO[tipo]
  const opciones = md.opciones[tipo] || []
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {atras}
      <b style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--in-texto)', letterSpacing: '-.01em', margin: '-2px 2px 0' }}>{q.pregunta}</b>
      {opciones.length
        ? <span style={{ fontSize: 7.4, color: 'var(--in-mute)', margin: '-4px 2px 2px' }}>Toque uno para ver su solicitud.</span>
        : <Vacio Icono={FileText} titulo="Nada para elegir" texto={q.vacio} />}
      {/* Las opciones en una tarjeta con filas y el círculo con aro menta, como «¿Qué necesita?». */}
      {!!opciones.length && (
        <div style={{ background: 'var(--in-carta)', borderRadius: 15, boxShadow: SOMBRA, overflow: 'hidden' }}>
          {opciones.map((o, i) => {
            const v = verOpcion(tipo, o)
            return (
              <button key={o.clave} type="button" onClick={() => onElegir(o.clave)} style={{
                display: 'grid', gridTemplateColumns: '30px 1fr 10px', gap: 9, alignItems: 'center', width: '100%', padding: '9px 10px',
                border: 'none', borderTop: i ? '1px solid var(--in-linea)' : 'none', background: 'none', fontFamily: 'inherit', textAlign: 'left', color: 'var(--in-texto)', cursor: 'pointer',
              }}>
                <Aro Icono={typeof v.sello === 'string' ? Banknote : v.sello} />
                <span style={{ display: 'grid', gap: 1, minWidth: 0 }}>
                  <b style={{ fontSize: 9.2, fontWeight: 500 }}>{v.nombre}</b>
                  <span style={{ fontSize: 7.2, color: 'var(--in-mute)', lineHeight: 1.4 }}>{v.linea}</span>
                </span>
                <ChevronRight size={11} style={{ color: 'var(--in-suave)' }} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RevisarDocumento({ md, tipo, clave, atras, onEnviada }) {
  const q = DOCUMENTO_PEDIDO[tipo]
  const opcion = (md.opciones[tipo] || []).find(o => o.clave === clave)
  const at = useAsistencia()
  const { empresa } = useOnboardingData()
  const [detalle, setDetalle] = useState('')
  if (!opcion) return <div>{atras}</div>
  const v = verOpcion(tipo, opcion)
  const listo = tipo !== 'correccion' || detalle.trim().length > 3
  const per = at.yo
  const hoy = iso(new Date())
  const limite = responderAntes(hoy, md.plazoSolicitud)
  const largo = x => `${DIAS_LARGOS[diaISO(x)]} ${aFecha(x).getDate()} de ${MESES[aFecha(x).getMonth()]}`
  const nombreEmpresa = empresa?.razonSocial || empresa?.nombre || 'FarmaVida S.A.'
  const sigla = (nombreEmpresa.split(' ')[0].match(/[A-ZÁÉÍÓÚÑ]/g) || ['S']).slice(0, 2).join('')
  const sucursal = at.lugarPorId.get(per.sucursalId)?.nombre || per.sedeNombre
  const gris = 'var(--in-mute)'
  const enPalabras = x => { const t = largo(x); return t[0].toUpperCase() + t.slice(1) }
  const escrito = detalle.trim()
  const filas = [
    ['Documento', tipo === 'copia' ? `Copia de ${v.nombre.toLowerCase()}` : v.nombre],
    ...(tipo === 'correccion'
      ? [['Qué está mal', escrito || 'Escríbalo abajo.', false, !escrito]]
      : [[tipo === 'copia' ? 'Cuál' : 'Qué dice', v.linea.replace(/^Dice s/, 'S').replace(/\.$/, '')]]),
    ...(tipo === 'certificacion'
      ? [['Cómo lo recibe', 'Firmado, lo recoge en RR.HH.', true], ['A más tardar', enPalabras(limite)]]
      : [['RR.HH. le responde', `A más tardar el ${largo(limite)}`, true]]),
    ...(tipo !== 'correccion' && escrito ? [['Para qué', escrito]] : []),
  ]
  const celda = (k, val, ancho, destacado) => (
    <div style={{ gridColumn: ancho ? '1 / -1' : undefined, display: 'flex', flexDirection: 'column', padding: '4px 7px', borderBottom: '1px solid var(--in-linea)', background: destacado ? 'var(--in-calendario)' : 'transparent', minWidth: 0 }}>
      <span style={{ fontSize: 6.2, color: gris }}>{k}</span>
      <b style={{ fontSize: destacado ? 9 : 8, fontWeight: destacado ? 700 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</b>
    </div>
  )
  const seccion = (n, t) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 6.8, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
      <i style={{ width: 13, height: 13, borderRadius: '50%', background: 'var(--in-pill)', color: '#fff', display: 'grid', placeItems: 'center', fontStyle: 'normal', fontSize: 6.8, letterSpacing: 0 }}>{n}</i>
      {t}<span style={{ flex: 1, height: 1, background: 'var(--in-linea)' }} />
    </span>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: '100%' }}>
      {atras}
      <b style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--in-texto)', letterSpacing: '-.01em', margin: '-2px 2px 0' }}>Revise su solicitud</b>

      <article className="papel-claro" style={{ background: '#fff', color: NAVY, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 0 #E3EAF0, 0 18px 32px -24px rgba(12,45,64,.6)' }}>
        <header style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 7, alignItems: 'center', padding: '10px 11px', borderBottom: '1px solid #EEF2F5' }}>
          <span style={{ width: 25, height: 25, borderRadius: 7, background: NAVY, color: '#00E091', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 8.4 }}>{sigla}</span>
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <b style={{ fontSize: 8.8, letterSpacing: '-.01em' }}>{nombreEmpresa}</b>
            <span style={{ fontSize: 6.2, color: gris }}>{empresa?.nit ? `NIT ${empresa.nit} · ` : ''}Recursos Humanos</span>
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 6.2, color: gris }}>Fecha</span>
            <b style={{ fontSize: 8.4, color: '#0A7F55', whiteSpace: 'nowrap' }}>{fechaCorta(hoy)}</b>
          </span>
        </header>

        <div style={{ padding: '10px 11px 4px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          <b style={{ textAlign: 'center', fontSize: 8.4, letterSpacing: '.14em', textTransform: 'uppercase' }}>{q.titulo}</b>
          {seccion(1, 'Datos del trabajador')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #E6ECF1', borderRadius: 7, overflow: 'hidden', marginTop: -3 }}>
            {celda('Nombre completo', per.name, true, true)}
            {celda('CI', per.documento || '—')}
            {celda('Fecha de ingreso', per.ingreso ? `${fechaCortaAt(per.ingreso)} ${per.ingreso.slice(0, 4)}` : '—')}
            {celda('Cargo', per.cargo || '—', true)}
            {celda('Unidad organizacional', per.unidad || '—')}
            {celda('Sucursal', sucursal || '—')}
          </div>

          {/* Lo que pide en filas, con las dos columnas de Mi ficha, igual que la papeleta de vacación
              (opción R1): la entrega va en la fila menta, y lo que escribe abajo entra como una fila más.
              Antes era una caja gris y una franja navy que pesaba más que todo. */}
          {seccion(2, { certificacion: 'Certificado solicitado', copia: 'Copia solicitada', correccion: 'Corrección solicitada' }[tipo])}
          <div style={{ border: '1px solid #E6ECF1', borderRadius: 7, overflow: 'hidden', marginTop: -3 }}>
            {filas.map(([k, val, menta, vacio], i) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '42% 1fr', gap: 8, alignItems: 'baseline', padding: '5px 8px', borderTop: i ? '1px solid #EEF2F5' : 'none', background: menta ? '#F3FBF7' : 'transparent' }}>
                <span style={{ fontSize: 6.6, color: '#6B7C8A' }}>{k}</span>
                <b style={{ fontSize: 8, fontWeight: 600, color: menta ? '#0A7F55' : vacio ? '#9AABBB' : NAVY, overflowWrap: 'anywhere' }}>{val}</b>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 6 }}>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
              <span style={{ alignSelf: 'stretch', height: 20, borderBottom: `1px solid ${NAVY}` }} />
              <b style={{ fontSize: 7.6, marginTop: 3 }}>{per.name}</b>
              <span style={{ fontSize: 6.2, color: gris }}>Solicitante</span>
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
              <span style={{ alignSelf: 'stretch', height: 20, borderBottom: `1px solid ${NAVY}`, display: 'grid', placeItems: 'center' }}>
                <em style={{ fontStyle: 'normal', fontSize: 6.2, fontWeight: 700, color: '#9A5B06', background: '#FFF4DE', padding: '1px 6px', borderRadius: 99 }}>Pendiente</em>
              </span>
              <b style={{ fontSize: 7.6, marginTop: 3 }}>Recursos Humanos</b>
              <span style={{ fontSize: 6.2, color: gris }}>{tipo === 'certificacion' ? 'Entrega' : 'Respuesta'}</span>
            </span>
          </div>
        </div>
        <footer style={{ padding: '7px 11px 9px', marginTop: 6, borderTop: '1px solid #F0F3F6', fontSize: 5.8, color: '#9AABBB' }}>Generado por SoulyHR con los datos del expediente</footer>
      </article>

      {/* Abajo, como en la vacación: el campo en una línea y «Solicitar» fijo al pie. */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
        <span style={{ fontSize: 7.6, color: 'var(--in-mute)' }}>{q.detalle}</span>
        <input value={detalle} onChange={e => setDetalle(e.target.value)} placeholder={q.ejemplo}
          style={{ border: 'none', borderBottom: '1px solid var(--in-campo)', background: 'none', padding: '3px 0 5px', fontFamily: 'inherit', fontSize: 9, color: 'var(--in-texto)', outline: 'none' }} />
      </label>
      <div style={{ position: 'sticky', bottom: -10, marginTop: 'auto', paddingTop: 8, paddingBottom: 2, background: 'var(--in-fondo)', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <button type="button" disabled={!listo} onClick={() => { md.solicitar({ tipo, opcion, detalle }); onEnviada() }} style={{
          ...BOTON, width: '100%', height: 34, fontSize: 8.6, fontWeight: 600, borderRadius: 99,
          ...(listo ? { background: '#00E091', color: NAVY, cursor: 'pointer', boxShadow: '0 8px 16px -10px rgba(0,184,118,.9)' } : { background: 'var(--in-plomo)', color: 'var(--in-suave)', cursor: 'default' }),
        }}>Solicitar</button>
        <span style={{ fontSize: 7.4, color: 'var(--in-mute)', textAlign: 'center' }}>Se envía a RR.HH.</span>
      </div>
    </div>
  )
}

/* ── LA LISTA (opción C del lienzo «Cuatro propuestas más»): cada pedido en su tarjeta, todas iguales
   para cualquier tipo, con una barrita de tres tramos (Enviada · En RR.HH. · Aprobada o Lista) que
   dice en qué va sin leer. Primero lo que espera respuesta y debajo lo resuelto (las últimas tres y
   «Ver todas»), sin pestañas. Aquí caen también las de Asistencia (vacaciones, permisos…), que se piden
   desde el inicio. Tocar una tarjeta abre el detalle: ahí están la papeleta y «Cancelar solicitud». */

/* Cada tipo con su ícono y su color, siempre los mismos, para reconocerlo sin leer. */
const TIPO_PEDIDO = {
  'asistencia:vacaciones': [Palmtree, 'verde', 'Vacación', 'Vacaciones'],
  'asistencia:permiso': [Clock, 'violeta', 'Permiso', 'Permisos'],
  'asistencia:correccion': [PencilLine, 'ambar', 'Corrección de marcación', 'Correcciones de marcación'],
  'asistencia:remoto': [House, 'cian', 'Trabajo remoto', 'Trabajo remoto'],
  'asistencia:cambio': [Repeat, 'gris', 'Cambio de turno', 'Cambios de turno'],
  'asistencia:extra': [Timer, 'azul', 'Horas extra', 'Horas extra'],
  'documentos:certificacion': [Award, 'azul', 'Certificado', 'Certificados'],
  'documentos:copia': [ScrollText, 'gris', 'Copia de documento', 'Copias de documentos'],
  'documentos:correccion': [Flag, 'ambar', 'Corrección de documento', 'Correcciones de documentos'],
}
const claveTipo = p => `${p.origen}:${p.tipo}`
/* Los estados del filtro, con el color de su tramo en la barrita. */
const ESTADOS_FILTRO = [
  ['pendiente', 'Esperan respuesta', '#F5B544'], ['ok', 'Aprobadas', '#00B876'],
  ['no', 'No aprobadas', '#E5484D'], ['cancelada', 'Canceladas', 'var(--in-campo)'],
]
const tipoDe = p => TIPO_PEDIDO[`${p.origen}:${p.tipo}`] || [MessageSquarePlus, 'gris', 'Solicitud']
const SOMBRA = 'var(--in-sombra)'
const cuandoEnvio = (fecha, hoy) => {
  if (!fecha) return ''
  const d = Math.round((new Date(hoy) - new Date(fecha.slice(0, 10))) / 864e5)
  return d <= 0 ? 'enviada hoy' : d === 1 ? 'enviada ayer' : `enviada el ${fechaCorta(fecha.slice(0, 10))}`
}
/* El título grande: las fechas en vacaciones y permisos; el asunto en los pedidos de documentos. */
const tituloDe = p => (p.origen === 'asistencia' ? (p.fechas || p.titulo) : p.titulo)
const subtituloDe = (p, hoy) => {
  const partes = p.origen === 'asistencia'
    ? [p.detalle, p.estado === 'cancelada' ? 'cancelada por usted' : cuandoEnvio(p.fecha, hoy)]
    : [cuandoEnvio(p.fecha, hoy), p.estado === 'pendiente' && `responde hasta el ${fechaCortaAt(limiteSolicitud(p.original))}`]
  return partes.filter(Boolean).join(' · ')
}

/* FILTROS: dos desplegables lado a lado, «Tipo» y «Estado» (opción B del lienzo). Cada opción dice
   cuántas hay con el otro filtro ya puesto, así se ve antes de tocar si hay, por ejemplo, vacaciones
   aprobadas. Con un filtro puesto se muestran todas las resueltas, sin cortar en tres. */
function ListaSolicitudes({ nombre, filtro, setFiltro, atras, onNueva, onAbrir }) {
  const { todos } = useMisPedidos(nombre)
  const at = useAsistencia()
  const [todasResueltas, setTodasResueltas] = useState(false)
  const [abierto, setAbierto] = useState(null)
  const filtros = useRef(null)
  useEffect(() => {
    if (!abierto) return
    const fuera = e => { if (!filtros.current?.contains(e.target)) setAbierto(null) }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [abierto])

  const deTipo = (p, t = filtro.tipo) => !t || claveTipo(p) === t
  const deEstado = (p, e = filtro.estado) => !e || p.estado === e
  const lista = todos.filter(p => deTipo(p) && deEstado(p))
  const filtrando = !!(filtro.tipo || filtro.estado)
  const enCurso = lista.filter(p => p.estado === 'pendiente')
  const resueltas = lista.filter(p => p.estado !== 'pendiente')
  const visibles = todasResueltas || filtrando ? resueltas : resueltas.slice(0, 3)

  /* Solo los tipos que la persona pidió alguna vez. */
  const tipos = Object.keys(TIPO_PEDIDO).filter(k => todos.some(p => claveTipo(p) === k))
  const opcionesTipo = [[null, 'Todos', todos.filter(p => deEstado(p)).length, Layers, 'gris'],
    ...tipos.map(k => [k, TIPO_PEDIDO[k][3], todos.filter(p => claveTipo(p) === k && deEstado(p)).length, TIPO_PEDIDO[k][0], TIPO_PEDIDO[k][1]])]
  const opcionesEstado = [[null, 'Todos', todos.filter(p => deTipo(p)).length, null, NAVY],
    ...ESTADOS_FILTRO.map(([k, t, c]) => [k, t, todos.filter(p => p.estado === k && deTipo(p)).length, null, c])]
  const elegir = (campo, v) => { setFiltro(f => ({ ...f, [campo]: v })); setAbierto(null) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {atras}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '-2px 2px 2px' }}>
        <b style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--in-texto)', letterSpacing: '-.01em' }}>Mis solicitudes</b>
        <Mas etiqueta="Nueva solicitud" onClick={onNueva} />
      </div>

      {!todos.length ? (
        <Vacio Icono={MessageSquarePlus} titulo="Todavía no tiene solicitudes" texto="Pida vacaciones desde el inicio, o un certificado o la copia de su contrato con el botón +.">
          <button onClick={onNueva} style={{ ...BOTON, marginTop: 9, height: 24 }}><Plus size={9} /> Nueva solicitud</button>
        </Vacio>
      ) : (
        <>
          <div ref={filtros} style={{ position: 'relative', zIndex: 5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            <Desplegable etiqueta="Tipo" valor={opcionesTipo.find(o => o[0] === filtro.tipo)?.[1]} activo={!!filtro.tipo} abierto={abierto === 'tipo'} onClick={() => setAbierto(v => (v === 'tipo' ? null : 'tipo'))} />
            <Desplegable etiqueta="Estado" valor={opcionesEstado.find(o => o[0] === filtro.estado)?.[1]} activo={!!filtro.estado} abierto={abierto === 'estado'} onClick={() => setAbierto(v => (v === 'estado' ? null : 'estado'))} />
            {abierto && (
              <MenuFiltro
                opciones={abierto === 'tipo' ? opcionesTipo : opcionesEstado}
                elegida={filtro[abierto]}
                onElegir={v => elegir(abierto, v)}
              />
            )}
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {abierto && <div style={{ position: 'absolute', inset: -4, zIndex: 3, background: 'rgba(242,245,252,.65)', borderRadius: 12 }} />}
            {filtrando && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 2px' }}>
                <span style={{ fontSize: 7, color: 'var(--in-mute)' }}><b style={{ color: 'var(--in-texto)' }}>{lista.length}</b> {lista.length === 1 ? 'solicitud' : 'solicitudes'}</span>
                <button type="button" onClick={() => setFiltro({ tipo: null, estado: null })} style={{ border: 'none', background: 'none', padding: 0, fontFamily: 'inherit', fontSize: 7, fontWeight: 700, color: 'var(--tx-verde)', cursor: 'pointer' }}>Quitar filtros</button>
              </div>
            )}
            {!lista.length && (
              <div style={{ background: 'var(--in-carta)', borderRadius: 12, padding: '16px 12px', textAlign: 'center', fontSize: 7.6, color: 'var(--in-mute)', lineHeight: 1.5, boxShadow: SOMBRA }}>
                No hay solicitudes con estos filtros.
              </div>
            )}
            {enCurso.map(p => <TarjetaPedido key={p.id} p={p} hoy={at.hoy} onAbrir={() => onAbrir(p.id)} />)}
            {!!resueltas.length && filtro.estado !== 'ok' && filtro.estado !== 'no' && filtro.estado !== 'cancelada' && <span style={ROTULO_SOL}>Resueltas</span>}
            {visibles.map(p => <TarjetaPedido key={p.id} p={p} hoy={at.hoy} onAbrir={() => onAbrir(p.id)} />)}
            {!filtrando && resueltas.length > 3 && (
              <button type="button" onClick={() => setTodasResueltas(v => !v)} style={{ alignSelf: 'center', border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 7.4, fontWeight: 700, color: 'var(--tx-verde)', cursor: 'pointer', padding: 4 }}>
                {todasResueltas ? 'Ver menos' : `Ver las ${resueltas.length} resueltas`}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/* El botón de un filtro: «Tipo: Todos ▾». Con algo elegido se pinta de navy. */
function Desplegable({ etiqueta, valor, activo, abierto, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={abierto} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, minWidth: 0, height: 24, padding: '0 8px',
      borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 7.2, fontWeight: 600,
      background: activo ? 'var(--in-pill)' : 'var(--in-carta)', color: activo ? 'var(--in-pill-txt)' : 'var(--in-texto)',
      /* Sin borde: blancos con la sombra suave de las tarjetas del Inicio. Abierto, el aro navy dice cuál es. */
      boxShadow: activo ? 'none' : abierto ? '0 0 0 1.2px var(--in-texto)' : 'var(--in-sombra)',
    }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{etiqueta}: {valor}</span>
      <ChevronDown size={9} style={{ flexShrink: 0, opacity: 0.7, transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
    </button>
  )
}

function MenuFiltro({ opciones, elegida, onElegir }) {
  return (
    <div role="listbox" style={{ position: 'absolute', top: 28, left: 0, right: 0, background: 'var(--in-carta)', borderRadius: 11, padding: 4, display: 'grid', boxShadow: '0 0 0 1px var(--in-linea), 0 18px 32px -16px rgba(12,45,64,.55)', animation: 'vac-aparecer .15s ease-out' }}>
      {opciones.map(([v, t, n, Icono, tono], i) => {
        const sel = v === elegida
        const c = TONOS_CEL[tono] ? null : tono
        return (
          <div key={v || 'todos'}>
            <button type="button" role="option" aria-selected={sel} disabled={!n && !sel} onClick={() => onElegir(v)} style={{
              width: '100%', display: 'grid', gridTemplateColumns: '17px 1fr auto 10px', alignItems: 'center', gap: 6, padding: '5px 6px',
              border: 'none', borderRadius: 7, cursor: n || sel ? 'pointer' : 'default', fontFamily: 'inherit', textAlign: 'left',
              background: sel ? 'var(--in-fondo)' : 'transparent', color: 'var(--in-texto)', opacity: n || sel ? 1 : 0.4,
            }}>
              {Icono
                ? <Aro Icono={Icono} size={17} />
                : <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, justifySelf: 'center' }} />}
              <span style={{ fontSize: 7.6, fontWeight: sel ? 700 : 500 }}>{t}</span>
              <span style={{ fontSize: 6.8, fontWeight: 600, color: 'var(--in-suave)' }}>{n}</span>
              {sel ? <Check size={9} style={{ color: 'var(--tx-verde)' }} strokeWidth={2.6} /> : <span />}
            </button>
            {i === 0 && <div style={{ height: 1, background: 'var(--tn-gris)', margin: '2px 5px' }} />}
          </div>
        )
      })}
    </div>
  )
}

/* El recorrido de un pedido en tres tramos. El último dice cómo terminó. */
function pasosDe(p) {
  const final = p.origen === 'documentos' ? 'Lista' : 'Aprobada'
  if (p.estado === 'pendiente') return [['Enviada', 'hecho'], ['En RR.HH.', 'actual'], [final, 'falta']]
  if (p.estado === 'ok') return [['Enviada', 'hecho'], ['En RR.HH.', 'hecho'], [final, 'hecho']]
  if (p.estado === 'no') return [['Enviada', 'hecho'], ['En RR.HH.', 'hecho'], ['No aprobada', 'no']]
  return [['Enviada', 'hecho'], ['Cancelada', 'cancelada'], [final, 'falta']]
}
const COLOR_PASO = { hecho: ['#00B876', 'var(--tx-verde)'], actual: ['#F5B544', 'var(--tx-ambar)'], falta: ['var(--in-linea)', 'var(--in-suave)'], no: ['#E5484D', 'var(--in-rojo)'], cancelada: ['var(--in-campo)', 'var(--in-mute)'] }

function Recorrido({ p }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
      {pasosDe(p).map(([t, e]) => (
        <span key={t} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <i style={{ height: 3, borderRadius: 3, background: COLOR_PASO[e][0] }} />
          <span style={{ fontSize: 5.8, fontWeight: 600, color: COLOR_PASO[e][1], whiteSpace: 'nowrap' }}>{t}</span>
        </span>
      ))}
    </div>
  )
}

/* EL ÍCONO DE CADA SOLICITUD (opción S2 elegida, auditoría general): el tipo en el círculo con aro menta
   de Zona HR, Perfil y Documentación. Antes cada tipo tenía su calendarito o su hojita pintados de un
   color propio (ámbar, verde, cian, violeta…) que se confundían con los colores de estado, y el
   calendarito repetía la fecha que ya está en el título. Ahora la solicitud se reconoce por la forma
   del ícono y el único color de la tarjeta es el estado. */
function Aro({ Icono, size = 30 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px #00E091', color: 'var(--in-texto)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <Icono size={Math.round(size * 0.43)} strokeWidth={1.8} />
    </span>
  )
}
const ROTULO_SOL = { fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)', margin: '8px 2px 0' }

/* El estado de la tarjeta, en una etiqueta (opción B del lienzo). La barrita de tres tramos queda en el detalle. */
const ETIQUETA_ESTADO = {
  pendiente: ['var(--tx-ambar)', 'var(--tn-ambar)'], ok: ['var(--tx-verde)', 'var(--tn-verde)'], no: ['var(--in-rojo)', 'var(--in-rojo-bg)'], cancelada: ['var(--tx-gris)', 'var(--tn-gris)'],
}
const textoEstado = p => p.estado === 'pendiente' ? (p.origen === 'documentos' ? 'En RR.HH.' : 'Por aprobar')
  : p.estado === 'ok' ? (p.origen === 'documentos' ? 'Lista' : 'Aprobada') : p.estado === 'no' ? 'No aprobada' : 'Cancelada'

function TarjetaPedido({ p, hoy, onAbrir }) {
  const tipo = tipoDe(p)[2]
  const etiqueta = p.tipo === 'permiso' && p.corto !== 'permiso' ? `${tipo} · ${p.corto}` : tipo
  return (
    <button type="button" onClick={onAbrir} style={{
      display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'left', border: 'none', cursor: 'pointer',
      background: 'var(--in-carta)', borderRadius: 15, padding: '9px 10px', boxShadow: SOMBRA, fontFamily: 'inherit', opacity: p.estado === 'cancelada' ? 0.75 : 1,
    }}>
      <span style={{ display: 'grid', gridTemplateColumns: '30px 1fr 10px', alignItems: 'center', gap: 9 }}>
        <Aro Icono={tipoDe(p)[0]} />
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: 6.2, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--in-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{etiqueta}</span>
          <b style={{ fontSize: 9.6, fontWeight: 600, color: 'var(--in-texto)', letterSpacing: '-.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tituloDe(p)}</b>
          <span style={{ fontSize: 7.2, color: 'var(--in-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtituloDe(p, hoy)}</span>
          <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 7px', marginTop: 3, width: 'fit-content', color: ETIQUETA_ESTADO[p.estado][0], background: ETIQUETA_ESTADO[p.estado][1] }}>{textoEstado(p)}</em>
        </span>
        <ChevronRight size={10} style={{ color: 'var(--in-suave)' }} />
      </span>
    </button>
  )
}

/* ── EL DETALLE DE UN PEDIDO: qué es, en qué va, sus datos y lo que se puede hacer. La papeleta de las
   vacaciones, el documento ya entregado y, si todavía espera respuesta, «Cancelar solicitud» al pie
   (con su confirmación). Lo aprobado se cambia hablando con RR.HH. */
function DetallePedido({ nombre, id, md, atras, onLeer, onAviso, onCancelada }) {
  const { todos } = useMisPedidos(nombre)
  const at = useAsistencia()
  const { empresa } = useOnboardingData()
  const [cancelando, setCancelando] = useState(false)
  const [viendo, setViendo] = useState(null)
  const marco = typeof document !== 'undefined' ? document.getElementById('marco-telefono') : null
  const p = todos.find(x => x.id === id)
  if (!p) return <div>{atras}</div>

  const [Icono, , tipo] = tipoDe(p)
  const s = p.original
  const vacacion = p.origen === 'asistencia' && p.tipo === 'vacaciones'
  const recibido = p.origen === 'documentos' && md.recibidos.some(x => x.emitido.id === s.resuelto?.emitidoId)
  const datos = p.origen === 'asistencia'
    ? [
        vacacion && ['De vacaciones', p.fechas],
        vacacion && ['Días hábiles', p.dias],
        vacacion && ['Vuelve a trabajar', (r => `${DIAS_LARGOS[diaISO(r)].slice(0, 3)} ${fechaCortaAt(r)}`)(habilSiguiente(s.hasta, at.yo.horario))],
        p.tipo === 'permiso' && ['Día', p.fechas],
        s.horaDesde && ['Horario', `${s.horaDesde} – ${s.horaHasta}`],
        p.tipo === 'extra' && ['Día', p.fechas],
        p.tipo === 'extra' && ['Horario', `${s.desde} – ${s.hasta}`],
        s.motivo && s.motivo !== 'Vacaciones' && ['Motivo', s.motivo],
        ['Enviada', fechaCorta(s.cuando)],
      ]
    : [
        ['Tipo', TIPOS_SOLICITUD[s.tipo]?.singular],
        s.detalle && ['Detalle', s.detalle],
        ['Enviada', fechaCorta(s.fecha)],
        p.estado === 'pendiente' && ['Responde hasta', fechaCorta(limiteSolicitud(s))],
      ]
  const cancelar = () => {
    at.cancelarSolicitud(s.id)
    setCancelando(false)
    onAviso(p.dias ? `Solicitud cancelada · ${p.dias} ${p.dias === 1 ? 'día vuelve' : 'días vuelven'} a su saldo` : 'Solicitud cancelada')
    onCancelada()
  }
  const accion = { display: 'flex', alignItems: 'center', gap: 8, width: '100%', boxSizing: 'border-box', background: 'var(--in-carta)', border: 'none', borderRadius: 12, padding: '8px 10px', boxShadow: SOMBRA, fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: '100%' }}>
      {atras}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Aro Icono={Icono} size={34} />
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: 6.8, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--in-mute)' }}>{tipo}</span>
          <b style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--in-texto)', letterSpacing: '-.01em' }}>{tituloDe(p)}</b>
        </span>
      </div>
      <div style={{ background: 'var(--in-carta)', borderRadius: 13, padding: '9px 10px', boxShadow: SOMBRA }}><Recorrido p={p} /></div>
      {p.nota && (
        <div style={{ padding: '7px 9px', borderRadius: 10, fontSize: 7, lineHeight: 1.45, color: 'var(--in-texto)', background: p.estado === 'no' ? TONOS.rojo[1] : TONOS.verde[1] }}>
          <b>RR.HH.:</b> {p.nota}
        </div>
      )}
      {/* Los datos en las dos columnas fijas de la ficha (F3). */}
      <div style={{ background: 'var(--in-carta)', borderRadius: 15, boxShadow: SOMBRA, overflow: 'hidden' }}>
        {datos.filter(Boolean).map(([k, v], i) => (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '42% 1fr', gap: 8, alignItems: 'baseline', padding: '6px 10px', borderTop: i ? '1px solid var(--in-linea)' : 'none' }}>
            <span style={{ fontSize: 7.2, color: 'var(--in-mute)' }}>{k}</span>
            <b style={{ fontSize: 8.4, fontWeight: 500, color: 'var(--in-texto)', overflowWrap: 'anywhere' }}>{v}</b>
          </div>
        ))}
      </div>
      {vacacion && s.papeleta && (
        <button type="button" style={accion}
          onClick={() => setViendo({ ...armarPapeleta(s, { yo: at.yo, empresa, solicitudes: at.solicitudes, lugarPorId: at.lugarPorId, hoy: at.hoy }), firma: { estado: s.estado, quien: s.respondio, cuando: s.respondida ? String(s.respondida).slice(0, 10).split('-').reverse().slice(0, 2).join('/') : '' } })}>
          <FileText size={13} style={{ color: 'var(--in-texto)' }} />
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}><b style={{ fontSize: 7.8, color: 'var(--in-texto)' }}>Papeleta de vacación</b><span style={{ fontSize: 6.4, color: 'var(--in-mute)' }}>N° {s.papeleta}</span></span>
          <span style={{ fontSize: 7.2, fontWeight: 700, color: 'var(--tx-verde)' }}>Ver</span>
        </button>
      )}
      {recibido && (
        <button type="button" style={accion} onClick={() => onLeer(s.resuelto.emitidoId)}>
          <FileText size={13} style={{ color: 'var(--in-texto)' }} />
          <span style={{ flex: 1 }}><b style={{ fontSize: 7.8, color: 'var(--in-texto)' }}>Ver el documento</b></span>
          <ChevronRight size={10} style={{ color: 'var(--in-suave)' }} />
        </button>
      )}
      {p.estado === 'pendiente' && p.origen === 'asistencia' && p.tipo !== 'extra' && (
        <button type="button" onClick={() => setCancelando(true)} style={{
          marginTop: 4, height: 32, borderRadius: 15, border: 'none', background: 'var(--in-carta)', boxShadow: SOMBRA, color: 'var(--in-rojo)',
          fontFamily: 'inherit', fontSize: 8.6, fontWeight: 600, cursor: 'pointer',
        }}>
          Cancelar solicitud
        </button>
      )}
      {viendo && marco && createPortal(<VerPapeleta papeleta={viendo} onCerrar={() => setViendo(null)} />, marco)}
      {cancelando && marco && createPortal(<ConfirmarCancelar p={p} onSi={cancelar} onNo={() => setCancelando(false)} />, marco)}
    </div>
  )
}

/* «¿Cancelar su vacación?»: sobre todo el teléfono, con lo que se cancela y lo que pasa con los días. */
/* «del 3 al 12 de noviembre», «del 28 de octubre al 3 de noviembre» o «del 5 de noviembre». */
function periodoLargo(desde, hasta) {
  const [, m1, d1] = desde.split('-').map(Number)
  const [, m2, d2] = (hasta || desde).split('-').map(Number)
  if (desde === (hasta || desde)) return `del ${d1} de ${MESES[m1 - 1]}`
  return m1 === m2 ? `del ${d1} al ${d2} de ${MESES[m2 - 1]}` : `del ${d1} de ${MESES[m1 - 1]} al ${d2} de ${MESES[m2 - 1]}`
}

function ConfirmarCancelar({ p, onSi, onNo }) {
  const vacacion = p.tipo === 'vacaciones'
  const s = p.original
  const que = vacacion ? 'su vacación' : p.tipo === 'permiso' ? 'su permiso' : 'su solicitud'
  const titulo = s?.desde ? `¿Cancelar ${que} ${periodoLargo(s.desde, s.hasta)}?` : `¿Cancelar ${que}?`
  const la = p.tipo === 'permiso' ? 'lo' : 'la'
  const boton = { ...BOTON, height: 30, width: '100%', borderRadius: 9, fontSize: 8.2 }
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'grid', placeItems: 'center', padding: 16, fontFamily: 'Poppins, sans-serif' }}>
      <div onClick={onNo} style={{ position: 'absolute', inset: 0, background: 'rgba(12,45,64,.42)' }} />
      <div role="alertdialog" aria-label={titulo} style={{ position: 'relative', width: '100%', background: 'var(--in-carta)', borderRadius: 18, padding: '16px 13px 13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, textAlign: 'center', color: 'var(--in-texto)', boxShadow: '0 24px 50px -20px rgba(12,45,64,.7)' }}>
        <span style={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--in-rojo-bg)', color: '#D92D20', boxShadow: '0 0 0 5px #FEF5F4' }}>
          <CalendarX size={17} strokeWidth={1.9} />
        </span>
        <b style={{ fontSize: 10.5, lineHeight: 1.3, letterSpacing: '-.01em', textWrap: 'balance' }}>{titulo}</b>
        <span style={{ fontSize: 7.8, lineHeight: 1.55, color: 'var(--in-mute)' }}>
          {p.dias && vacacion ? <>Los <b style={{ color: 'var(--in-texto)' }}>{p.dias} {p.dias === 1 ? 'día' : 'días'}</b> vuelven a su saldo y </> : `Si ${la} cancela, `}RR.HH. ya no {la} verá.
        </span>
        <div style={{ display: 'grid', gap: 6, width: '100%', marginTop: 2 }}>
          <button type="button" onClick={onSi} style={{ ...boton, background: '#D92D20', color: '#fff' }}>Sí, cancelar {vacacion ? 'vacación' : p.tipo === 'permiso' ? 'permiso' : 'solicitud'}</button>
          <button type="button" onClick={onNo} style={{ ...boton, background: 'var(--in-carta)', color: 'var(--in-texto)', boxShadow: 'inset 0 0 0 1.2px var(--in-campo)' }}>No, mantener{la}</button>
        </div>
      </div>
    </div>
  )
}
