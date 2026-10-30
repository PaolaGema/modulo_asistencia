import { useRef, useState } from 'react'
import {
  Users, Network, Route, ClipboardCheck, ClipboardList, TrendingUp,
  DollarSign, Bot, Folder, Calendar, Gift, Globe, Moon, Sun, Search, X, FileText, MessageSquarePlus, ScanFace,
  Palmtree, Award, ScrollText, PencilLine, Timer, Flag, Inbox, ChevronRight,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useMisPedidos } from '../../hooks/useMisPedidos'
import { useAsistencia } from '../../context/AsistenciaContext'
import { saldoVacaciones } from '../../data/asistenciaData'

/* ── ZONA HR (lienzo «Zona HR, sin alejarse de los círculos», C3) ──
   Lanzador de módulos del colaborador. Se mantienen los círculos con borde menta y el orden de siempre;
   cambia lo que lo hacía parecer otra app: el fondo y la cabecera del Inicio (botones redondos
   blancos), las letras del mismo tamaño que el resto, los colores del tema (claro y oscuro) y un
   número ámbar donde hay algo pendiente. Organigrama, Onboarding, Mis documentos, Mis solicitudes y
   Mi asistencia tienen destino dentro del prototipo; el resto son accesos de módulos que SoulyHR
   todavía no tiene construidos.
   `palabras` y `linea` son para el buscador: cómo lo dice la gente y qué tiene dentro. */
const MODULOS = [
  { icon: Users, label: 'Personas', linea: 'El directorio de la empresa', palabras: 'directorio compañeros colegas equipo gente' },
  { icon: Network, label: 'Organigrama', destino: 'organigrama', linea: 'Quién es quién', palabras: 'estructura jefe areas unidades' },
  { icon: Route, label: 'Onboarding', destino: 'onboarding', linea: 'Su recorrido de bienvenida', palabras: 'induccion bienvenida tareas' },
  { icon: FileText, label: 'Mis documentos', destino: 'documentos', pendientes: 'documentos', linea: 'Contratos, certificados y su expediente', palabras: 'archivos expediente contrato certificados subir' },
  { icon: MessageSquarePlus, label: 'Mis solicitudes', destino: 'solicitudes', pendientes: 'solicitudes', linea: 'Vacaciones, permisos y certificados', palabras: 'pedidos vacaciones permisos certificados tramites' },
  { icon: ScanFace, label: 'Mi asistencia', destino: 'asistencia', linea: 'Sus marcas, la semana y el mes', palabras: 'marcar marcacion entrada salida horario turno pausa' },
  { icon: ClipboardCheck, label: 'Evaluaciones', linea: 'Su evaluación de desempeño', palabras: 'desempeno evaluacion' },
  { icon: ClipboardList, label: 'Encuestas', linea: 'Encuestas de la empresa', palabras: 'encuesta opinion clima' },
  { icon: TrendingUp, label: 'PDI', linea: 'Su plan de desarrollo', palabras: 'plan desarrollo individual metas crecer' },
  { icon: DollarSign, label: 'Mis remuneraciones', linea: 'Sus boletas de pago', palabras: 'boleta boletas sueldo pago salario planilla' },
  { icon: Bot, label: 'Agente de IA', linea: 'Pregúntele lo que necesite', palabras: 'asistente preguntas ayuda bot' },
  { icon: Folder, label: 'Archivos', linea: 'Archivos compartidos', palabras: 'carpetas compartidos' },
  { icon: Calendar, label: 'Calendario', linea: 'Feriados, eventos y cumpleaños', palabras: 'feriados eventos cumpleanos fechas' },
  { icon: Gift, label: 'Mis beneficios', linea: 'Lo que la empresa le ofrece', palabras: 'beneficios descuentos seguro' },
  { icon: Globe, label: 'Página oficial', linea: 'El sitio de la empresa', palabras: 'web sitio empresa' },
]
const NAVY = 'var(--in-texto)'
const SOMBRA = 'var(--in-sombra)'
const BOTON_REDONDO = { position: 'relative', width: 29, height: 29, borderRadius: '50%', border: 'none', background: 'var(--in-carta)', display: 'grid', placeItems: 'center', boxShadow: 'var(--in-sombra)', cursor: 'pointer', padding: 0, flexShrink: 0 }

export default function ZonaHRPhone({ currentUser, onNavegar }) {
  const { theme, toggleTheme } = useTheme()
  const { pendientes, md } = useMisPedidos(currentUser.name)
  const [q, setQ] = useState('')
  const [enfocado, setEnfocado] = useState(false)
  const campo = useRef(null)
  const cuantos = { solicitudes: pendientes.length, documentos: md?.porHacer?.length || 0 }
  const palabras = palabrasDe(q)
  const modulos = palabras.length ? MODULOS.filter(m => coincide(palabras, `${m.label} ${m.linea} ${m.palabras}`)) : MODULOS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '2px 2px', fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
      {/* ── Cabecera, como la del Inicio. Sin lupa: el buscador ya está a la vista debajo. ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <span style={{ flex: 1, display: 'grid', minWidth: 0 }}>
          <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>Zona HR</b>
          <small style={{ fontSize: 8.2, color: 'var(--in-mute)' }}>Todo lo suyo en un solo lugar</small>
        </span>
        {/* El mismo botón del Inicio: muestra el modo al que se pasa y el ícono gira de luna a sol. */}
        <button type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Pasar a modo claro' : 'Pasar a modo oscuro'} style={BOTON_REDONDO}>
          <Moon size={12} className="tema-ico" style={{ color: 'var(--in-texto)', opacity: theme === 'dark' ? 0 : 1, transform: theme === 'dark' ? 'rotate(-90deg) scale(.4)' : 'none' }} />
          <Sun size={13} className="tema-ico" style={{ color: 'var(--in-acento-txt)', opacity: theme === 'dark' ? 1 : 0, transform: theme === 'dark' ? 'none' : 'rotate(90deg) scale(.4)' }} />
        </button>
      </div>

      {/* ── El buscador (propuesta C, «La cuadrícula se filtra»): fijo debajo del título, sin cambiar de
         pantalla. Al escribir quedan solo los módulos que coinciden y debajo lo que se puede pedir o ya
         tiene. Con la «×» vuelve la cuadrícula entera; no hay «Cancelar» porque nunca se salió. ── */}
      <label htmlFor="zonahr-buscar" style={{ height: 30, borderRadius: 99, background: 'var(--in-carta)', boxShadow: enfocado || q ? `0 0 0 1.4px ${NAVY}, ${SOMBRA}` : SOMBRA, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', marginBottom: 4, cursor: 'text' }}>
        <Search size={12} strokeWidth={2.2} style={{ color: 'var(--in-mute)', flexShrink: 0 }} />
        <input id="zonahr-buscar" ref={campo} value={q} onChange={e => setQ(e.target.value)} onFocus={() => setEnfocado(true)} onBlur={() => setEnfocado(false)}
          placeholder="Buscar en Zona HR" aria-label="Buscar en Zona HR" autoComplete="off"
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 9, color: 'var(--in-texto)' }} />
        {q && (
          <button type="button" onClick={() => { setQ(''); campo.current?.focus() }} aria-label="Borrar lo escrito" style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', padding: 0, background: 'var(--in-linea)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <X size={8} strokeWidth={2.6} style={{ color: 'var(--in-mute)' }} />
          </button>
        )}
      </label>

      {modulos.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {modulos.map(m => {
          const n = m.pendientes ? cuantos[m.pendientes] : 0
          return (
            <button key={m.label} type="button" onClick={() => m.destino && onNavegar(m.destino)} style={{
              position: 'relative', background: 'var(--in-carta)', borderRadius: 13, padding: '10px 4px 8px', border: 'none', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, boxShadow: SOMBRA, cursor: m.destino ? 'pointer' : 'default', color: 'var(--in-texto)',
            }}>
              {/* El aro menta de siempre; el ícono en navy, como los íconos del Inicio. */}
              <span style={{ width: 28, height: 28, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px #00E091', color: 'var(--in-texto)', display: 'grid', placeItems: 'center' }}>
                <m.icon size={13} strokeWidth={1.7} />
              </span>
              {/* El nombre en peso medio, como «Solicitar vacación» en las acciones rápidas del Inicio. */}
              <span style={{ fontSize: 7.6, fontWeight: 500, textAlign: 'center', lineHeight: 1.25 }}><Resaltado texto={m.label} q={q.trim()} /></span>
              {n > 0 && <em style={{ position: 'absolute', top: 6, right: 6, minWidth: 11, height: 11, borderRadius: 99, padding: '0 3px', background: 'var(--tn-ambar)', color: 'var(--tx-ambar)', fontStyle: 'normal', fontSize: 5.6, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{n}</em>}
            </button>
          )
        })}
      </div>}

      {palabras.length > 0 && <ResultadosHR q={q} palabras={palabras} hayModulos={modulos.length > 0} currentUser={currentUser} onNavegar={onNavegar} />}
    </div>
  )
}

/* ── LO QUE SALE DEBAJO DE LOS MÓDULOS al escribir («Encontrar lo que necesita, sin saber en qué módulo
   está»). La gente busca una cosa, no un módulo: además de los módulos que coinciden salen Pedir (lo que
   puede hacer ahora) y Lo que ya tiene (sus pedidos con su estado y sus documentos). Cada resultado dice
   en qué módulo vive. No hace falta escribir tildes. En «Pedir» solo entra lo que ya se puede hacer en
   el prototipo. */
const sinTildes = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const palabrasDe = q => sinTildes(q).trim().split(/\s+/).filter(Boolean)
/* Sale si cada palabra escrita aparece en el nombre o en cómo lo dice la gente. */
const coincide = (palabras, texto) => { const t = sinTildes(texto); return palabras.every(w => t.includes(w)) }
const ETIQUETA = {
  pendiente: ['var(--tx-ambar)', 'var(--tn-ambar)'], ok: ['var(--tx-verde)', 'var(--tn-verde)'], no: ['var(--in-rojo)', 'var(--in-rojo-bg)'], cancelada: ['var(--tx-gris)', 'var(--tn-gris)'],
}
const textoEstado = p => p.estado === 'pendiente' ? (p.origen === 'documentos' ? 'En RR.HH.' : 'Por aprobar')
  : p.estado === 'ok' ? (p.origen === 'documentos' ? 'Lista' : 'Aprobada') : p.estado === 'cancelada' ? 'Cancelada' : 'No aprobada'

/* Lo escrito, en negrita dentro del nombre: así se ve por qué salió. */
function Resaltado({ texto, q }) {
  const i = q ? sinTildes(texto).indexOf(sinTildes(q)) : -1
  if (i < 0) return texto
  return <>{texto.slice(0, i)}<b style={{ fontWeight: 700 }}>{texto.slice(i, i + q.length)}</b>{texto.slice(i + q.length)}</>
}

function ResultadosHR({ q, palabras, hayModulos, currentUser, onNavegar }) {
  const { todos, md } = useMisPedidos(currentUser.name)
  const at = useAsistencia()
  const libres = saldoVacaciones(at.yo, at.solicitudes, at.hoy).disponible

  const nueva = paso => () => onNavegar('solicitudes', [{ p: 'nueva' }, paso])
  const acciones = [
    { titulo: 'Solicitar vacación', linea: libres ? `Le ${libres === 1 ? 'queda 1 día libre' : `quedan ${libres} días libres`}` : 'No le quedan días por ahora', Icono: Palmtree, palabras: 'vacaciones dias libres descanso', ir: () => onNavegar('vacacion') },
    { titulo: 'Pedir un certificado de trabajo', linea: 'Mis solicitudes', Icono: Award, palabras: 'certificado constancia trabajo sueldo banco', ir: nueva({ p: 'elegir', tipo: 'certificacion' }) },
    { titulo: 'Corregir una marcación', linea: 'Mis solicitudes', Icono: PencilLine, palabras: 'olvide marcar entrada salida error marcacion', ir: nueva({ p: 'corregir' }) },
    { titulo: 'Pedir horas extra', linea: 'Mis solicitudes', Icono: Timer, palabras: 'horas extra sobretiempo quedarse tarde', ir: nueva({ p: 'extra' }) },
    { titulo: 'Pedir una copia del contrato', linea: 'Mis solicitudes', Icono: ScrollText, palabras: 'copia contrato firmado', ir: nueva({ p: 'elegir', tipo: 'copia' }) },
    { titulo: 'Corregir un documento', linea: 'Mis solicitudes', Icono: Flag, palabras: 'documento error dato mal', ir: nueva({ p: 'elegir', tipo: 'correccion' }) },
  ]
  const tiene = [
    ...todos.map(p => ({ titulo: p.titulo, linea: `Mis solicitudes${p.detalle ? ` · ${p.detalle}` : ''}`, Icono: Inbox, palabras: `${p.corto} ${p.tipo}`, estado: p, ir: () => onNavegar('solicitudes', [{ p: 'detalle', id: p.id }]) })),
    ...(md?.tiposActivos || []).map(t => ({ titulo: t.nombre, linea: 'Mis documentos · su carpeta', Icono: Folder, palabras: 'carpeta documentos', ir: () => onNavegar('documentos', [{ p: 'carpeta', id: t.id }]) })),
    ...(md?.carpetasRrhh || []).map(([cat, nombre]) => ({ titulo: nombre, linea: 'Mis documentos · de RR.HH.', Icono: Folder, palabras: 'carpeta documentos rrhh', ir: () => onNavegar('documentos', [{ p: 'recibidos', cat }]) })),
    ...(md?.recibidos || []).map(r => ({ titulo: r.nombre, linea: 'Mis documentos · recibido', Icono: FileText, palabras: 'documento recibido', ir: () => onNavegar('documentos', [{ p: 'leer', id: r.emitido.id }]) })),
  ]
  const deEsto = r => coincide(palabras, `${r.titulo} ${r.linea} ${r.palabras}`)
  const grupos = [['Pedir', acciones.filter(deEsto)], ['Lo que ya tiene', tiene.filter(deEsto).slice(0, 5)]].filter(([, l]) => l.length)

  const rotulo = { fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)', margin: '6px 0 0' }
  return (
    <>
      {grupos.map(([titulo, lista]) => (
        <div key={titulo} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span style={rotulo}>{titulo}</span>
          {lista.map(r => <FilaResultado key={`${titulo}-${r.titulo}`} r={r} q={q.trim()} />)}
        </div>
      ))}

      {!grupos.length && !hayModulos && (
        <div style={{ display: 'grid', justifyItems: 'center', gap: 6, textAlign: 'center', padding: '26px 10px 0' }}>
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--in-acento-bg)', color: 'var(--in-acento-txt)', display: 'grid', placeItems: 'center' }}><Search size={20} strokeWidth={1.8} /></span>
          <b style={{ fontSize: 10.5, fontWeight: 600 }}>No encontramos «{q.trim()}»</b>
          <span style={{ fontSize: 7.8, color: 'var(--in-mute)', maxWidth: 200, lineHeight: 1.45 }}>Pruebe con otra palabra, como «certificado», «vacación» o «boleta».</span>
          {/* El Agente de IA todavía no está construido: se muestra apagado, como lo que viene en «¿Qué necesita?». */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 16px', borderRadius: 99, background: '#00E091', color: '#0C2D40', fontSize: 8.6, fontWeight: 600, marginTop: 6, opacity: 0.55 }}>
            <Bot size={12} /> Preguntar al Agente de IA · Pronto
          </span>
        </div>
      )}
    </>
  )
}

/* Cada resultado es una línea como la de solicitudes del Inicio: cuadro menta, nombre, de dónde es y su
   etiqueta de estado o «›». */
function FilaResultado({ r, q }) {
  const est = r.estado
  return (
    <button type="button" onClick={r.ir || undefined} disabled={!r.ir} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px', border: 'none', borderRadius: 14, background: 'var(--in-carta)', boxShadow: SOMBRA,
      fontFamily: 'inherit', textAlign: 'left', color: 'var(--in-texto)', cursor: r.ir ? 'pointer' : 'default', opacity: r.ir ? 1 : 0.55, boxSizing: 'border-box',
    }}>
      <span style={{ width: 26, height: 26, borderRadius: 9, background: 'var(--in-acento-bg)', color: 'var(--in-acento-txt)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <r.Icono size={13} strokeWidth={2} />
      </span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 9.2, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><Resaltado texto={r.titulo} q={q} /></span>
        <span style={{ fontSize: 7.4, color: 'var(--in-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.linea}</span>
      </span>
      {est
        ? <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 7px', whiteSpace: 'nowrap', color: ETIQUETA[est.estado][0], background: ETIQUETA[est.estado][1] }}>{textoEstado(est)}</em>
        : r.ir
          ? <ChevronRight size={12} style={{ color: 'var(--in-suave)', flexShrink: 0 }} />
          : <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 7px', color: 'var(--in-mute)', background: 'var(--tn-gris)' }}>Pronto</em>}
    </button>
  )
}
