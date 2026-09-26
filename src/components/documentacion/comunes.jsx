import { useEffect } from 'react'
import { AlertTriangle, CheckCircle2, CircleDashed, Clock, Eye, ShieldCheck, XCircle, X, Lock } from 'lucide-react'
import Avatar from '../personas/Avatar'
import Desplegable from '../layout/Desplegable'
import { ESTADOS, ESTADOS_CONTRATO, ESTADOS_EMITIDO, SENSIBILIDAD } from '../../data/documentacionData'
import './documentacion.css'

/* ── LAS PIEZAS QUE COMPARTEN TODAS LAS PANTALLAS DEL MÓDULO ───────────────
   Una etiqueta de estado, una celda de persona, una barra de avance, los filtros y el modal.
   Viven juntas porque son el vocabulario visual del módulo: si el «Vencido» de la bandeja y el
   del expediente se dibujaran en dos sitios, tarde o temprano serían dos rojos distintos. */

const ICONOS = { check: CheckCircle2, reloj: Clock, alerta: AlertTriangle, vacio: CircleDashed, ojo: Eye, cruz: XCircle, escudo: ShieldCheck }

/* EL ESTADO NUNCA VA SÓLO POR COLOR (RF-18, RNF-21): ícono + texto + tono. En escala de grises
   se sigue distinguiendo por el ícono, y un lector de pantalla lee la palabra. */
export function EstadoChip({ estado, pequeno = false, titulo }) {
  const e = ESTADOS[estado]
  if (!e) return null
  const Icono = ICONOS[e.icono]
  return (
    <span className={`dc-chip dc-t-${e.tono}${pequeno ? ' dc-chip-sm' : ''}`} title={titulo || e.desc}>
      <Icono size={pequeno ? 11 : 12} aria-hidden="true" strokeWidth={2.4} />
      {e.label}
    </span>
  )
}

/* Para lo que no es un documento del expediente: contratos, emitidos. Mismo dibujo. */
export function Etiqueta({ tono = 'gris', children, titulo }) {
  return <span className={`dc-chip dc-t-${tono}`} title={titulo}>{children}</span>
}
export const EstadoContratoChip = ({ estado }) => <Etiqueta tono={ESTADOS_CONTRATO[estado]?.tono}>{ESTADOS_CONTRATO[estado]?.label}</Etiqueta>
export const EstadoEmitidoChip = ({ estado }) => <Etiqueta tono={ESTADOS_EMITIDO[estado]?.tono}>{ESTADOS_EMITIDO[estado]?.label}</Etiqueta>

export function SensibilidadChip({ nivel }) {
  if (nivel !== 'confidencial') return null
  return (
    <span className="dc-sens" title={SENSIBILIDAD.confidencial.desc}>
      <Lock size={10} aria-hidden="true" /> Confidencial
    </span>
  )
}

/* La persona en una fila: cara, nombre y una línea de contexto. */
export function PersonaCelda({ persona, sub, size = 32, onClick }) {
  if (!persona) return <span className="dc-muted">—</span>
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} className={`dc-persona${onClick ? ' dc-persona-link' : ''}`} onClick={onClick}>
      <Avatar persona={persona} size={size} />
      <span className="dc-persona-txt">
        <span className="dc-persona-nom">{persona.name}</span>
        {sub !== false && <span className="dc-persona-sub">{sub ?? `${persona.cargo} · ${persona.sedeNombre}`}</span>}
      </span>
    </Tag>
  )
}

/* EL PORCENTAJE DE COMPLETITUD. Sin requisitos no hay número —«Sin requisitos», no 100 %—: decir
   «al día» de alguien a quien nadie le pidió nada es justo lo que este módulo vino a evitar. */
export function BarraAvance({ pct, detalle, ancho = 120 }) {
  if (pct === null || pct === undefined) return <span className="dc-muted dc-sinreq">Sin requisitos</span>
  const tono = pct >= 90 ? 'verde' : pct >= 60 ? 'ambar' : 'rojo'
  return (
    <span className="dc-avance" title={detalle}>
      <span className="dc-avance-barra" style={{ width: ancho }} aria-hidden="true">
        <span className={`dc-avance-lleno dc-bg-${tono}`} style={{ width: `${pct}%` }} />
      </span>
      <b>{pct}%</b>
    </span>
  )
}

/* ── LOS FILTROS TRANSVERSALES (RF-79) ────────────────────────────────────
   Los mismos en el panel, las bandejas y los reportes: sede, área, cargo y, según la pantalla,
   tipo, subtipo y estado. Es la respuesta a la consulta de la reunión del 11 de agosto
   —«filtrar por unidades organizacionales y sucursales»— y por eso se escribe una vez.

   `mostrar` elige cuáles aparecen; `valor` es un objeto con las claves que haya. */

export function Filtros({ valor, onCambio, mostrar = ['sede', 'area', 'cargo'], personas = [], sucursales = [], tipos = [], subtipos = [], estados = Object.keys(ESTADOS) }) {
  const areas = [...new Set(personas.map(p => p.depto).filter(Boolean))].sort()
  const cargos = [...new Set(personas.filter(p => !valor.area || p.depto === valor.area).map(p => p.cargo).filter(Boolean))].sort()
  const conOpcion = (todas, opciones) => [{ valor: '', etiqueta: todas }, ...opciones]
  const defs = {
    sede: { ph: 'Todas las sucursales', ops: sucursales.map(s => ({ valor: s.id, etiqueta: `${s.nombre} · ${s.ciudad}` })) },
    area: { ph: 'Todas las áreas', ops: areas.map(a => ({ valor: a, etiqueta: a })) },
    cargo: { ph: 'Todos los cargos', ops: cargos.map(c => ({ valor: c, etiqueta: c })) },
    tipo: { ph: 'Todos los tipos', ops: tipos.map(t => ({ valor: t.id, etiqueta: t.nombre })) },
    subtipo: { ph: 'Todos los subtipos', ops: subtipos.filter(s => !valor.tipo || s.tipoId === valor.tipo).map(s => ({ valor: s.id, etiqueta: s.nombre })) },
    estado: { ph: 'Todos los estados', ops: estados.map(e => ({ valor: e, etiqueta: ESTADOS[e]?.label || e })) },
  }
  const activos = mostrar.filter(k => valor[k])
  return (
    <div className="dc-filtros" role="group" aria-label="Filtros">
      {mostrar.map(k => (
        <div key={k} className="dc-filtro">
          <Desplegable
            valor={valor[k] || ''}
            opciones={conOpcion(defs[k].ph, defs[k].ops)}
            placeholder={defs[k].ph}
            ariaLabel={defs[k].ph}
            onCambio={v => {
              const next = { ...valor, [k]: v }
              if (k === 'area') next.cargo = ''
              if (k === 'tipo') next.subtipo = ''
              onCambio(next)
            }}
          />
        </div>
      ))}
      {activos.length > 0 && (
        <button type="button" className="dc-limpiar" onClick={() => { const n = { ...valor }; mostrar.forEach(k => { n[k] = '' }); onCambio(n) }}>
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

/* ── EL MODAL DEL MÓDULO ──────────────────────────────────────────────────
   Las clases de siempre (`pl-*`) con Escape para cerrar y el clic afuera. `ancho` porque cargar
   un documento no cabe en los 460 px de un aviso. */
export function Modal({ titulo, Icono, onCerrar, children, pie, ancho = 520 }) {
  useEffect(() => {
    const tecla = e => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])
  return (
    <div className="pl-overlay" onClick={onCerrar}>
      <div className="pl-modal" role="dialog" aria-modal="true" aria-label={titulo} style={{ width: ancho }} onClick={e => e.stopPropagation()}>
        <div className="pl-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {Icono && (
              <div className="dc-modal-ico"><Icono size={16} /></div>
            )}
            <h2>{titulo}</h2>
          </div>
          <button type="button" className="pl-modal-close" onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
        </div>
        <div className="pl-modal-body">{children}</div>
        {pie && <div className="pl-modal-footer">{pie}</div>}
      </div>
    </div>
  )
}

/* La cabecera de una pantalla del módulo: título, una línea de qué es, y acciones a la derecha. */
export function Cabecera({ titulo, sub, children }) {
  return (
    <div className="pl-header dc-cabecera">
      <div>
        <h1 className="pl-title">{titulo}</h1>
        {sub && <p className="pl-subtitle">{sub}</p>}
      </div>
      {children && <div className="dc-cabecera-acc">{children}</div>}
    </div>
  )
}

/* El estado vacío (11.3): qué pasó, por qué y qué hacer. Nunca un recuadro en blanco. */
export function Vacio({ Icono, titulo, texto, children }) {
  return (
    <div className="dc-vacio">
      {Icono && <span className="dc-vacio-ico"><Icono size={26} strokeWidth={1.6} /></span>}
      <p className="dc-vacio-tit">{titulo}</p>
      {texto && <p className="dc-vacio-txt">{texto}</p>}
      {children && <div className="dc-vacio-acc">{children}</div>}
    </div>
  )
}
