import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, CircleDashed, Clock, Eye, ShieldCheck, XCircle, X, Lock, MoreHorizontal } from 'lucide-react'
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

export function Filtros({ valor, onCambio, mostrar = ['sede', 'area', 'cargo'], personas = [], sucursales = [], tipos = [], subtipos = [], estados = Object.keys(ESTADOS), compacto = false }) {
  const areas = [...new Set(personas.map(p => p.depto).filter(Boolean))].sort()
  const cargos = [...new Set(personas.filter(p => !valor.area || p.depto === valor.area).map(p => p.cargo).filter(Boolean))].sort()
  const conOpcion = (todas, opciones) => [{ valor: '', etiqueta: todas }, ...opciones]
  const defs = {
    sede: { ph: 'Todas las sucursales', ops: sucursales.map(s => ({ valor: s.id, etiqueta: `${s.nombre} · ${s.ciudad}` })) },
    area: { ph: 'Todas las unidades', ops: areas.map(a => ({ valor: a, etiqueta: a })) },
    cargo: { ph: 'Todos los cargos', ops: cargos.map(c => ({ valor: c, etiqueta: c })) },
    tipo: { ph: 'Todos los tipos', ops: tipos.map(t => ({ valor: t.id, etiqueta: t.nombre })) },
    subtipo: { ph: 'Todos los subtipos', ops: subtipos.filter(s => !valor.tipo || s.tipoId === valor.tipo).map(s => ({ valor: s.id, etiqueta: s.nombre })) },
    estado: { ph: 'Todos los estados', ops: estados.map(e => ({ valor: e, etiqueta: ESTADOS[e]?.label || e })) },
  }
  /* SIN «LIMPIAR FILTROS» (15 oct 2026): era un enlace suelto al final de la fila. Ahora cada filtro
     en uso se marca con borde oscuro y trae su propia ×, que lo vuelve a «Todos».

     `compacto`: el desplegable dice lo elegido —«Ventas»— o «Todas las sucursales», y el que recorta
     algo se pinta, como en el Organigrama. Sin × ni etiquetas debajo: se vuelve a «Todos» desde el
     mismo desplegable. */
  const cambiar = (k, v) => {
    const next = { ...valor, [k]: v }
    if (k === 'area') next.cargo = ''
    if (k === 'tipo') next.subtipo = ''
    onCambio(next)
  }
  return (
    <div className="dc-filtros" role="group" aria-label="Filtros">
      {mostrar.map(k => (
        <div key={k} className={`dc-filtro${compacto ? ' dc-filtro-compacto' : ''}${valor[k] ? ' on' : ''}`}>
          {valor[k] && !compacto && (
            <button type="button" className="dc-filtro-quitar" aria-label={`Quitar el filtro: ${defs[k].ph.toLowerCase()}`} title="Quitar este filtro" onClick={() => cambiar(k, '')}>
              <X size={13} aria-hidden="true" />
            </button>
          )}
          <Desplegable
            valor={valor[k] || ''}
            opciones={conOpcion(defs[k].ph, defs[k].ops)}
            placeholder={defs[k].ph}
            ariaLabel={defs[k].ph}
            onCambio={v => cambiar(k, v)}
            contenido={compacto ? elegida => <span className="dc-filtro-val">{valor[k] ? (elegida?.etiqueta || valor[k]) : defs[k].ph}</span> : undefined}
          />
        </div>
      ))}
    </div>
  )
}

/* ── EL MODAL DEL MÓDULO ──────────────────────────────────────────────────
   Las clases de siempre (`pl-*`) con Escape para cerrar y el clic afuera. `ancho` porque cargar
   un documento no cabe en los 460 px de un aviso. */
export function Modal({ titulo, Icono, onCerrar, children, pie, ancho = 520 }) {
  /* CON DOS VENTANAS ABIERTAS —una carpeta y, encima, un documento suyo— Escape cierra sólo la
     de arriba: la última en el documento. Sin esto se cerraban las dos de un golpe. */
  const ref = useRef(null)
  useEffect(() => {
    const tecla = e => {
      if (e.key !== 'Escape') return
      const todas = document.querySelectorAll('.pl-overlay')
      if (todas[todas.length - 1] === ref.current) onCerrar()
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])
  return (
    <div className="pl-overlay" ref={ref} onClick={onCerrar}>
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

/* ── EL MENÚ DE TRES PUNTOS ───────────────────────────────────────────────
   Las acciones de una fila que no son la principal —editar, desactivar, eliminar— van acá y no
   como tres botones con texto: una tabla con una columna de botones se iba de ancho y pedía
   desplazarse a los costados. Una acción apagada se queda en la lista con su motivo en `titulo`,
   para que no desaparezca sin explicación. */
export function MenuAcciones({ items, etiqueta = 'Más acciones' }) {
  /* LA LISTA FLOTA EN COORDENADAS DE VENTANA, como la de `Desplegable`: dentro de una tabla
     (`.as-table-wrap` recorta lo que se sale) el menú de la última fila quedaba cortado. Se mide
     el botón al abrir y se cierra si la página se desplaza, en vez de perseguirlo. */
  const [pos, setPos] = useState(null)
  const abierto = !!pos
  const ref = useRef(null)
  const cerrar = () => setPos(null)
  useEffect(() => {
    if (!abierto) return
    const fuera = e => { if (ref.current && !ref.current.contains(e.target)) cerrar() }
    const tecla = e => { if (e.key === 'Escape') cerrar() }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    window.addEventListener('scroll', cerrar, true)
    window.addEventListener('resize', cerrar)
    return () => {
      document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', tecla)
      window.removeEventListener('scroll', cerrar, true); window.removeEventListener('resize', cerrar)
    }
  }, [abierto])
  const alternar = e => {
    e.stopPropagation()
    if (abierto) return cerrar()
    const r = e.currentTarget.getBoundingClientRect()
    const alto = items.filter(Boolean).length * 34 + 10
    const arriba = r.bottom + 4 + alto > window.innerHeight
    setPos({ right: window.innerWidth - r.right, ...(arriba ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }) })
  }
  return (
    <div className="dc-menu" ref={ref}>
      <button type="button" className="dc-menu-btn" aria-haspopup="menu" aria-expanded={abierto} aria-label={etiqueta} title={etiqueta} onClick={alternar}>
        <MoreHorizontal size={16} />
      </button>
      {abierto && (
        <div className="dc-menu-lista" role="menu" style={pos}>
          {items.filter(Boolean).map(it => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              className={`dc-menu-item${it.peligro ? ' peligro' : ''}`}
              disabled={it.disabled}
              title={it.titulo}
              onClick={e => { e.stopPropagation(); cerrar(); it.onClick() }}
            >
              {it.Icono && <it.Icono size={14} aria-hidden="true" />} {it.label}
            </button>
          ))}
        </div>
      )}
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
