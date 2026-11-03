import { ScanFace, Coffee, Check, LogOut, RotateCcw, Sun, Moon, Calendar, Palmtree, ScrollText, Gift, Heart, MessageCircle, PartyPopper, Award, ChevronRight, X, Inbox } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAsistencia } from '../../context/AsistenciaContext'
import ConfirmarMarca from '../asistencia/ConfirmarMarca'
import { ahora, hhmm, duracion, accionDelMomento, ETIQUETA_MARCA, saldoVacaciones, DIAS_LARGOS, diaISO, fechaCorta } from '../../data/asistenciaData'
import { avatarUrl } from '../../utils/calendarEvents'
import { EVENTOS_INICIO, diaCorto } from '../../data/eventosInicio'
import { useMisPedidos } from '../../hooks/useMisPedidos'
import { PUBLICACIONES } from '../../data/publicacionesInicio'
import { useTheme } from '../../context/ThemeContext'

/* ── EL INICIO DEL TELÉFONO, ESTILO SUAVE (propuesta B1 del lienzo) ──
   Fondo blanco como la app; tarjetas sin borde con sombra suave. Arriba, «Hoy» compacto (franja navy
   con la hora, el turno y el botón de marcar); debajo, la línea de solicitudes y las acciones rápidas,
   y después los cumpleaños y el muro. La tarjeta grande «Hoy es» con sus fichas se reemplazó el 29 oct
   2026 para que lo que más se toca quede sin bajar.

   Medido para el teléfono de 280 px de la demo: los tamaños son los del lienzo a ~0,72. */

/* Los colores de Souly: navy y menta. El verde para escribir sobre blanco es el menta oscurecido, para que se lea.
   Son variables (`--in-*`, en index.css) para que el inicio siga el modo oscuro. */
const C = {
  texto: 'var(--in-texto)', mute: 'var(--in-mute)', suave: 'var(--in-suave)', acento: '#00E091', acentoTxt: 'var(--in-acento-txt)', acentoBg: 'var(--in-acento-bg)',
  linea: 'var(--in-linea)', borde: 'var(--in-borde)', deco: 'var(--in-deco)', circulo: 'var(--in-circulo)', tile: 'var(--in-tile)',
  pill: 'var(--in-pill)', pillTxt: 'var(--in-pill-txt)', banda: 'var(--in-banda)', carta: 'var(--in-carta)', okBg: 'var(--in-ok-bg)',
  /* El fondo de la app, como la de hoy (prop.jpeg): un gris azulado muy claro, y las tarjetas en blanco encima. */
  fondo: 'var(--in-fondo)',
  sombra: 'var(--in-sombra)',
}
const carta = { background: C.carta, borderRadius: 14, boxShadow: C.sombra }
const rotulo = { fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: C.texto }

/* La misma lista que el calendario de «Ver más»: con la fecha corta para la fila. */
const CUMPLES = EVENTOS_INICIO.map(e => ({ ...e, dia: e.fecha, fecha: diaCorto(e.fecha) }))

/* «HOY», COMPACTO (propuesta del inicio en 3 toques): una franja navy con el día, la hora, tu turno y
   el botón de lo que toca ahora. Reemplaza a la tarjeta grande «Hoy es» con sus tres fichas: el cargo
   la persona ya lo sabe, la actividad era fija y el saldo de vacaciones pasó al botón «Solicitar
   vacación». Así las acciones rápidas suben y se ven sin bajar.
   Un toque en el botón no marca: abre la ventana «Vas a marcar…», igual que antes el deslizador. */
function HoyCompacto({ onMarcar }) {
  const at = useAsistencia()
  const yo = at.yo
  const j = at.jornadaDe(yo, at.hoy)
  const h = yo.horario
  const hoy = ahora()
  const dia = `${DIAS_LARGOS[diaISO(at.hoy)]} ${fechaCorta(at.hoy)}`

  const acc = accionDelMomento(j, h, hoy.getHours() * 60 + hoy.getMinutes())
  const siguiente = yo.asig ? acc.principal : null
  const [pedido, setPedido] = useState(null)
  const marco = typeof document !== 'undefined' ? document.getElementById('marco-telefono') : null
  const turno = !h ? 'Sin horario asignado' : h.modo === 'fijo' ? `Turno ${h.entrada}–${h.salida}` : `Turno flexible · ${duracion(h.meta)}`
  const detalle = !h ? 'Pídeselo a RR.HH.'
    : j.salida != null ? `Saliste ${hhmm(j.salida)} · ${duracion(j.trabajado)}`
      : j.enPausa ? 'En descanso'
        : j.entrada != null ? `Entraste ${hhmm(j.entrada)} · ${duracion(j.trabajado)}`
          : 'Sin marcar'
  const enTurno = j.entrada != null && j.salida == null
  const meta = j.programado || h?.meta || 480
  const avance = Math.min(100, Math.round((j.trabajado / meta) * 100))
  const enlace = { display: 'inline-flex', alignItems: 'center', gap: 3, border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 7.8, fontWeight: 600, color: '#B7CBD8' }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: C.banda, color: '#fff', borderRadius: 18, padding: '11px 12px', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10, boxShadow: '0 10px 22px -14px rgba(12,45,64,.6)' }}>
      <span aria-hidden="true" style={{ position: 'absolute', right: -40, top: -50, width: 130, height: 130, borderRadius: '50%', background: 'rgba(0,224,145,.08)' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, position: 'relative' }}>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: 8, color: '#B7CBD8' }}>{dia[0].toUpperCase() + dia.slice(1)}</span>
          <b style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>{hhmm(hoy.getHours() * 60 + hoy.getMinutes())}</b>
          {/* Turno y estado en dos renglones: en uno solo, el botón de marcar los cortaba. */}
          <span style={{ fontSize: 7.8, color: '#B7CBD8', whiteSpace: 'nowrap' }}>{turno}</span>
          <span style={{ fontSize: 7.8, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
            {enTurno && !j.enPausa && <i style={{ width: 4, height: 4, borderRadius: '50%', background: C.acento, flexShrink: 0 }} />}
            {detalle}
          </span>
        </span>
        {siguiente ? (
          <button type="button" onClick={() => setPedido(siguiente)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, border: 'none', cursor: 'pointer',
            background: C.acento, color: '#0C2D40', borderRadius: 99, padding: '7px 11px', fontFamily: 'inherit', fontSize: 8.6, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            {siguiente === 'entrada' || siguiente === 'salida' ? <ScanFace size={12} /> : <Coffee size={12} />} {ETIQUETA_MARCA[siguiente]}
          </button>
        ) : h && yo.asig && (
          <button type="button" onClick={() => onMarcar(null)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.1)', color: '#fff', borderRadius: 99, padding: '7px 11px', fontFamily: 'inherit', fontSize: 8.6, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            <Check size={11} strokeWidth={2.4} /> Listo por hoy
          </button>
        )}
      </div>

      {/* En turno, cuánto del día va: una barra y, al lado, la otra marca posible. */}
      {enTurno && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, position: 'relative' }}>
          <span style={{ flex: 1, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.14)', overflow: 'hidden' }}>
            <span style={{ display: 'block', width: `${avance}%`, height: '100%', borderRadius: 99, background: C.acento }} />
          </span>
          {acc.secundaria && (
            <button type="button" onClick={() => setPedido(acc.secundaria)} style={enlace}>
              {acc.secundaria === 'salida' ? <LogOut size={9} /> : <Coffee size={9} />} {acc.secundaria === 'salida' ? 'Marcar salida' : 'Pausa'}
            </button>
          )}
        </div>
      )}
      {acc.deshacer && (
        <button type="button" onClick={() => at.anular(acc.deshacer.id, 'La persona deshizo su salida desde la app')} style={{ ...enlace, alignSelf: 'flex-start', color: C.acento, position: 'relative' }}>
          <RotateCcw size={9} /> ¿Te equivocaste? Deshacer salida
        </button>
      )}

      {pedido && marco && createPortal(
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, fontSize: 9.4 }}>
          <ConfirmarMarca tipo={pedido} onCancelar={() => setPedido(null)} onConfirmar={t => { setPedido(null); onMarcar(t) }} />
        </div>, marco)}
    </div>
  )
}

/* LOS CUMPLEAÑOS: las caras con su aro, el nombre y la fecha. Van en páginas de cinco que caben justas
   dentro de los márgenes (antes la fila se salía por los bordes y la última cara quedaba cortada); se
   pasa de página deslizando; para ver todo está «Ver más». Hubo un hilo que las unía (propuesta H1
   del lienzo); se quitó porque ensuciaba la fila. El aro del evento va en navy para distinguirlo. */
const H = { foto: 30, aro: 2.5, luz: 1 }
const POR_PAGINA = 5
const PAGINAS = Array.from({ length: Math.ceil(CUMPLES.length / POR_PAGINA) }, (_, i) => CUMPLES.slice(i * POR_PAGINA, (i + 1) * POR_PAGINA))

/* Tocar un cumpleaños o un evento abre Eventos y cumpleaños en ese día. */
function Cumpleanos({ onDia }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="phone-scroll" style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '5px 0 4px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {PAGINAS.map((caras, i) => (
          <div key={i} style={{ flex: '0 0 100%', scrollSnapAlign: 'start', display: 'grid', gridTemplateColumns: `repeat(${POR_PAGINA}, minmax(0, 1fr))` }}>
            {caras.map(c => (
              <button key={c.nombre} type="button" onClick={() => onDia?.(c.dia)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: 0, border: 'none', background: 'none', padding: 0, fontFamily: 'inherit', cursor: 'pointer' }}>
                <span style={{ display: 'block', padding: H.luz, borderRadius: '50%', background: C.fondo, boxShadow: `0 0 0 ${H.aro}px ${c.tipo === 'Evento' ? C.texto : C.acento}, 0 6px 10px -7px rgba(12,45,64,.45)` }}>
                  {c.tipo === 'Evento'
                    ? <span style={{ width: H.foto, height: H.foto, borderRadius: '50%', background: C.banda, display: 'grid', placeItems: 'center' }}><PartyPopper size={14} style={{ color: '#00E091' }} /></span>
                    : <img src={avatarUrl(c.nombre, 80)} alt="" style={{ display: 'block', width: H.foto, height: H.foto, borderRadius: '50%', objectFit: 'cover' }} />}
                </span>
                <b style={{ marginTop: 6, maxWidth: '100%', fontSize: 9, fontWeight: 600, color: C.texto, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre}</b>
                <span style={{ fontSize: 7.4, color: C.mute }}>{c.fecha}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* EL SALDO EN EL BOTÓN DE VACACIÓN (opción B del lienzo «Días libres, días reservados»): una barrita
   verde con lo que se puede pedir y ámbar con lo que espera aprobación, y «9 de 15». Lo pedido no se
   pierde: queda reservado hasta que RR.HH. responde, y vuelve si se rechaza o se cancela. */
function SaldoMini({ s }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, lineHeight: 1.2, alignSelf: 'stretch' }}>
      <span style={{ display: 'flex', gap: 1.5, alignSelf: 'stretch', height: 4, borderRadius: 99, overflow: 'hidden', background: C.linea }}>
        {s.disponible > 0 && <i style={{ flex: s.disponible, background: C.acento }} />}
        {s.pedidos > 0 && <i style={{ flex: s.pedidos, background: '#F5B544' }} />}
      </span>
      <span style={{ fontSize: 6.8, color: C.mute }}>
        <b style={{ fontSize: 10, fontWeight: 700, color: C.acentoTxt, fontVariantNumeric: 'tabular-nums' }}>{s.disponible} de {s.saldo}</b> disponibles
      </span>
      {/* Lo que espera aprobación, en su propio renglón: junto a «disponibles» no entraba y se cortaba. */}
      {!!s.pedidos && <span style={{ fontSize: 6.8, color: C.mute, marginTop: -2 }}>{s.pedidos} por aprobar</span>}
    </span>
  )
}

/* LA LÍNEA DE SOLICITUDES: como máximo una, nunca una lista. Una respuesta nueva va primero hasta que
   la persona la toca o la cierra; si no hay, una sola solicitud esperando se muestra completa y dos o
   más se agrupan. Sin nada que contar, no ocupa lugar. Tocarla abre Mis solicitudes. */
const ICONO_PEDIDO = { vacaciones: Palmtree, permiso: ScrollText, certificacion: Award }

function LineaSolicitudes({ pedidos, onAbrir }) {
  const { pendientes, nuevas, marcarVista } = pedidos
  const nueva = nuevas[0]
  if (!nueva && !pendientes.length) return null

  const fila = { ...carta, width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px', marginBottom: 12, border: 'none', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: C.texto, boxSizing: 'border-box' }
  const cuadro = (Icono, bg, color) => <span style={{ width: 26, height: 26, borderRadius: 9, background: bg, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icono size={13} /></span>
  const textos = (t, s) => (
    <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <b style={{ fontSize: 9.4, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</b>
      <span style={{ fontSize: 7.8, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</span>
    </span>
  )
  const masEsperando = pendientes.length ? ` · ${pendientes.length} más ${pendientes.length === 1 ? 'espera' : 'esperan'}` : ''

  if (nueva) {
    const ok = nueva.estado === 'ok'
    const que = nueva.origen === 'asistencia' ? `Su ${nueva.corto}` : nueva.titulo
    const verbo = nueva.origen === 'asistencia' ? (ok ? 'fue aprobada' : 'no fue aprobada') : (ok ? 'está lista' : 'fue rechazada')
    return (
      <div role="button" tabIndex={0} onClick={() => { marcarVista(nueva.id); onAbrir() }} onKeyDown={e => { if (e.key === 'Enter') { marcarVista(nueva.id); onAbrir() } }}
        style={{ ...fila, background: ok ? C.okBg : C.carta, boxShadow: `inset 0 0 0 1px ${ok ? '#9FE3C6' : '#F3C7C2'}, ${C.sombra}` }}>
        {cuadro(ok ? Check : X, ok ? '#00B876' : '#FDECEA', ok ? '#fff' : '#B42318')}
        {textos(`${que} ${verbo}`, `${!ok && nueva.nota ? nueva.nota : nueva.titulo}${masEsperando}`)}
        <button type="button" aria-label="Cerrar aviso" onClick={e => { e.stopPropagation(); marcarVista(nueva.id) }}
          style={{ border: 'none', background: 'none', padding: 2, cursor: 'pointer', color: C.suave, display: 'grid', placeItems: 'center' }}><X size={12} /></button>
      </div>
    )
  }

  if (pendientes.length === 1) {
    const p = pendientes[0]
    return (
      <button type="button" onClick={onAbrir} style={fila}>
        {cuadro(ICONO_PEDIDO[p.tipo] || Inbox, C.acentoBg, C.acentoTxt)}
        {textos(p.titulo, `${p.detalle ? `${p.detalle} · ` : ''}espera a RR.HH.`)}
        <span style={{ fontSize: 7.4, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: '#FFF4DE', color: '#9A5B06', whiteSpace: 'nowrap' }}>Por aprobar</span>
      </button>
    )
  }

  const tipos = [...new Set(pendientes.map(p => p.corto))]
  const lista = tipos.length > 1 ? `${tipos.slice(0, -1).join(', ')} y ${tipos[tipos.length - 1]}` : tipos[0]
  return (
    <button type="button" onClick={onAbrir} style={fila}>
      {cuadro(Inbox, C.acentoBg, C.acentoTxt)}
      {textos(`${pendientes.length} solicitudes por aprobar`, lista[0].toUpperCase() + lista.slice(1))}
      <ChevronRight size={13} style={{ color: C.suave, flexShrink: 0 }} />
    </button>
  )
}

export default function InicioPhone({ currentUser, onMarcar, onVacacion, onPermiso, onBeneficios, onSolicitudes, onCalendario, onPerfil }) {
  const pedidos = useMisPedidos(currentUser.name)
  const at = useAsistencia()
  const vacacion = saldoVacaciones(at.yo, at.solicitudes, at.hoy)
  const { theme, toggleTheme } = useTheme()
  const circulo = { width: 29, height: 29, borderRadius: '50%', background: C.carta, boxShadow: C.sombra, display: 'grid', placeItems: 'center' }
  return (
    <div style={{ padding: '2px 2px' }}>
      {/* LA CABECERA (opción A del lienzo «Cabecera del inicio»): la foto acompaña al saludo y abre el
          perfil; a la derecha, las dos herramientas: el calendario de eventos y el modo claro u oscuro. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
        {/* La foto de la persona, como en la app; la misma que sale en su publicación de bienvenida. */}
        <button type="button" onClick={onPerfil} aria-label="Ver mi perfil" title="Mi perfil"
          style={{ border: 'none', padding: 0, background: 'none', cursor: 'pointer', borderRadius: '50%', flexShrink: 0 }}>
          <img src={avatarUrl(currentUser.name, 80)} alt="" style={{ display: 'block', width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.carta}`, boxShadow: C.sombra, boxSizing: 'border-box' }} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: C.mute }}>Hola 👋</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.texto, letterSpacing: '-.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
          {/* El cargo, debajo del nombre: antes era una ficha de «Hoy es». */}
          {currentUser.cargo && <div style={{ fontSize: 8.2, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.cargo}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button type="button" onClick={onCalendario} aria-label="Ver el calendario de eventos" title="Calendario"
            style={{ ...circulo, border: 'none', padding: 0, cursor: 'pointer' }}>
            <Calendar size={12} style={{ color: C.texto }} />
          </button>
          {/* Claro u oscuro, a un toque. Muestra el modo al que se pasa. El círculo del cambio nace de
              aquí (ThemeContext) y el ícono gira de luna a sol. */}
          <button type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Pasar a modo claro' : 'Pasar a modo oscuro'} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            style={{ ...circulo, position: 'relative', border: 'none', padding: 0, cursor: 'pointer' }}>
            <Moon size={12} className="tema-ico" style={{ color: C.texto, opacity: theme === 'dark' ? 0 : 1, transform: theme === 'dark' ? 'rotate(-90deg) scale(.4)' : 'none' }} />
            <Sun size={13} className="tema-ico" style={{ color: C.acento, opacity: theme === 'dark' ? 1 : 0, transform: theme === 'dark' ? 'none' : 'rotate(90deg) scale(.4)' }} />
          </button>
        </div>
      </div>

      <HoyCompacto onMarcar={onMarcar} />

      <LineaSolicitudes pedidos={pedidos} onAbrir={onSolicitudes} />

      {/* Las acciones rápidas suben, justo debajo de «Hoy»: son lo que más se toca. EN MOSAICO (opción A3):
          vacación en la tarjeta grande con su saldo, donde se decide pedirlas, y a su lado permiso y
          beneficios apilados. Con tres tarjetas iguales, la de vacación crecía por el saldo y las otras
          dos quedaban con un hueco blanco abajo. */}
      <span style={rotulo}>Acciones rápidas</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 7, margin: '6px 0 12px' }}>
        <button type="button" onClick={onVacacion} style={{
          ...carta, border: 'none', padding: '11px 11px 10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
          fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: C.texto,
        }}>
          <Palmtree size={22} strokeWidth={1.4} />
          <span style={{ fontSize: 9.4, fontWeight: 500, lineHeight: 1.3 }}>Solicitar vacación</span>
          <SaldoMini s={vacacion} />
        </button>
        <span style={{ display: 'grid', gap: 7 }}>
          {[
            { Icono: ScrollText, label: 'Permiso o licencia', ir: onPermiso },
            { Icono: Gift, label: 'Beneficios', ir: onBeneficios },
          ].map(a => (
            <button key={a.label} type="button" onClick={a.ir} style={{
              ...carta, border: 'none', padding: '10px', display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: C.texto,
            }}>
              <a.Icono size={17} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 8.6, lineHeight: 1.25 }}>{a.label}</span>
            </button>
          ))}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={rotulo}>Próximos eventos y cumpleaños</span>
        <button type="button" onClick={onCalendario} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8.6, color: C.acentoTxt, fontWeight: 600 }}>Ver más →</button>
      </div>
      <Cumpleanos onDia={onCalendario} />

      <Muro currentUser={currentUser} />
    </div>
  )
}

/* ── NOTICIAS · MURO · MENCIONES ── las tres pestañas cambian lo que se ve; cada publicación se puede
   recomendar (el corazón suma y resta). Lo de la empresa va en Noticias, lo de la gente en el Muro, y en
   Menciones lo que nombra a la persona. */

function Muro({ currentUser }) {
  const [tab, setTab] = useState('noticias')
  const [mios, setMios] = useState([])
  const lista = PUBLICACIONES.filter(p => p.tab === tab)
  const nombre = currentUser.name.split(' ')[0]
  return (
    <>
      <div role="tablist" style={{ ...carta, borderRadius: 99, display: 'flex', padding: 3, marginBottom: 10 }}>
        {[['noticias', 'Noticias'], ['muro', 'Muro'], ['menciones', 'Menciones']].map(([k, t]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 9.4, padding: '6px 0', borderRadius: 99, background: tab === k ? C.pill : 'transparent', color: tab === k ? C.pillTxt : C.texto, fontWeight: tab === k ? 500 : 400, transition: 'background .15s' }}>{t}</button>
        ))}
      </div>

      {lista.length === 0 && <div style={{ ...carta, padding: 16, textAlign: 'center', fontSize: 8.6, color: C.mute, marginBottom: 10 }}>No hay nada aquí por ahora.</div>}
      {lista.map(p => {
        const mio = mios.includes(p.id)
        return (
          <article key={p.id} style={{ ...carta, padding: 11, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <img src={avatarUrl(p.autor, 60)} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: 9.4, fontWeight: 600, color: C.texto }}>{p.autor}</div>
                <div style={{ fontSize: 7.6, color: C.mute }}>{p.cuando}</div>
              </div>
            </div>
            {p.titulo && <div style={{ fontSize: 9.6, fontWeight: 700, color: C.texto, marginTop: 7 }}>{p.titulo}</div>}
            <p style={{ fontSize: 8.6, color: C.mute, margin: p.titulo ? '3px 0 8px' : '7px 0 8px', lineHeight: 1.5 }}>
              {p.texto.replace('@Carlos', `@${nombre}`)} {p.etiqueta && <span style={{ color: C.acentoTxt, fontWeight: 600 }}>{p.etiqueta}</span>}
            </p>
            {p.bienvenida && (
              <div style={{ background: C.acentoBg, borderRadius: 12, padding: 10, textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 6, fontWeight: 700, color: C.acentoTxt, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>🎉 Bienvenida al equipo 🎉</div>
                <img src={avatarUrl(currentUser.name, 80)} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.carta}`, boxShadow: C.sombra, display: 'block', margin: '0 auto' }} />
                <div style={{ fontSize: 8.6, fontWeight: 600, color: C.texto, marginTop: 4 }}>{currentUser.name}</div>
                <div style={{ fontSize: 7, color: C.mute }}>{currentUser.cargo}</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 7.6, color: C.mute }}>
              <button type="button" onClick={() => setMios(m => (mio ? m.filter(x => x !== p.id) : [...m, p.id]))} aria-pressed={mio} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 7.6, color: mio ? '#E0477A' : C.mute, fontWeight: mio ? 600 : 400 }}>
                <Heart size={10} fill={mio ? 'currentColor' : 'none'} /> {p.likes + (mio ? 1 : 0)}
              </button>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><MessageCircle size={10} /> {p.comentarios} {p.comentarios === 1 ? 'comentario' : 'comentarios'}</span>
            </div>
          </article>
        )
      })}
    </>
  )
}
