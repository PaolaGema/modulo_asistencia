import { useState } from 'react'
import { ChevronLeft, ChevronRight, PartyPopper, Palmtree, Clock, House, Star, Timer, LogIn } from 'lucide-react'
import BarraVolver from './BarraVolver'
import { EVENTOS_INICIO } from '../../data/eventosInicio'
import { avatarUrl } from '../../utils/calendarEvents'
import { useAsistencia } from '../../context/AsistenciaContext'
import { ocupadosDe } from '../../utils/ocupados'
import { DIAS_LARGOS, MESES, FERIADOS, SUBTIPOS_PERMISO, aFecha, diaISO, mesDe, mesVecino, nombreMes, semanasDe, esAutorizada, hhmm, sumarDias } from '../../data/asistenciaData'

/* ── MI CALENDARIO (opción A «El mes vivo» de «Mi calendario · ronda 2», aplicada el 5 nov 2026) ──
   El calendario de la persona, con todo: lo que pidió y lo que le aprobaron (vacaciones, permisos, trabajo
   remoto, horas extra), feriados, eventos de la empresa y cumpleaños. Es la tarjeta de calendario de la
   vacación que ya conocen —semanas completas, «lu ma mi», hoy con aro menta, el día elegido en navy—:
   · los días enteros pedidos van como cinta, menta si están aprobados y ámbar si esperan respuesta;
   · los feriados, con el número en rojo;
   · lo demás, un punto por cosa (suyo, por aprobar, evento, cumpleaños).
   La cabecera dice el día elegido y cuántas cosas tiene; debajo, esas cosas en fichas como las de «Ya tiene
   pedido». Sin día elegido, el mes entero. En un día que ya pasó, también su jornada.
   Lo abren el ícono de calendario y «Ver más» del Inicio, un cumpleaños tocado (ya en ese día) y «Calendario»
   de Zona HR. En la web, Mi espacio › Mi calendario es esta misma pieza en dos columnas (`web`). */

const C = {
  texto: 'var(--in-texto)', mute: 'var(--in-mute)', carta: 'var(--in-carta)', sombra: 'var(--in-sombra)',
  vCarta: 'var(--in-vac-carta)', vBorde: 'var(--in-vac-borde)', punta: 'var(--in-vac-punta)', puntaTxt: 'var(--in-vac-punta-txt)', puntaSombra: 'var(--in-vac-punta-sombra)',
  viaje: 'var(--in-vac-viaje)', viajeBorde: 'var(--in-vac-viaje-borde)', viajeTxt: 'var(--in-vac-viaje-txt)', viajeRotulo: 'var(--in-vac-viaje-rotulo)', cinta: 'var(--in-vac-cinta)',
}
const CINTA = { aprobada: [C.cinta, 'var(--tx-verde)'], pendiente: ['var(--tn-ambar)', 'var(--tx-ambar)'] }
const PUNTO = { suyo: '#00B876', pendiente: '#F5B544', evento: 'var(--in-texto)', cumple: '#C084FC' }
const ETIQUETA = { aprobada: ['Aprobado', 'var(--tx-verde)', 'var(--tn-verde)'], pendiente: ['Por aprobar', 'var(--tx-ambar)', 'var(--tn-ambar)'] }
const DIAS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do']
const ROTULO = { fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', margin: '6px 2px -2px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }
const largo = s => { const t = `${DIAS_LARGOS[diaISO(s)]} ${aFecha(s).getDate()} de ${MESES[aFecha(s).getMonth()]}`; return t[0].toUpperCase() + t.slice(1) }
const corto = s => `${DIAS_LARGOS[diaISO(s)].slice(0, 3)} ${aFecha(s).getDate()} ${MESES[aFecha(s).getMonth()].slice(0, 3)}`
const fechaRango = (a, b) => (b && b !== a ? `${aFecha(a).getDate()} ${MESES[aFecha(a).getMonth()].slice(0, 3)} – ${aFecha(b).getDate()} ${MESES[aFecha(b).getMonth()].slice(0, 3)}` : corto(a))
const cosas = n => (n === 1 ? '1 cosa' : `${n} cosas`)

/* Todo lo de la persona, día por día: { fecha: [cosa] }. Cada cosa sabe cómo se dibuja. */
function useCosas() {
  const at = useAsistencia()
  const yo = at.yo
  const porDia = {}
  const poner = (d, c) => { (porDia[d] = porDia[d] || []).push(c) }
  const pedidos = ocupadosDe(at.solicitudes, yo.id).lista
  pedidos.forEach(s => {
    const entero = s.tipo !== 'permiso' || !s.horaDesde
    for (let d = s.desde; d <= (s.hasta || s.desde); d = sumarDias(d, 1)) poner(d, { clase: 'suyo', s, entero })
  })
  ;(at.horasExtra || []).filter(x => String(x.personaId) === String(yo.id) && (esAutorizada(x) || x.estado === 'pendiente' || x.estado === 'asignada'))
    .forEach(x => poner(x.fecha, { clase: 'extra', x }))
  Object.entries(FERIADOS).forEach(([d, nombre]) => poner(d, { clase: 'feriado', nombre }))
  EVENTOS_INICIO.forEach(e => poner(e.fecha, { clase: e.tipo === 'Evento' ? 'evento' : 'cumple', e }))
  return porDia
}

function Ficha({ c, at }) {
  const fila = (izq, titulo, sub, etiqueta) => (
    <div style={{ background: C.carta, borderRadius: 12, boxShadow: C.sombra, padding: '7px 9px', display: 'grid', gridTemplateColumns: '26px minmax(0, 1fr) auto', gap: 8, alignItems: 'center' }}>
      {izq}
      <span style={{ display: 'grid', minWidth: 0 }}>
        <b style={{ fontSize: 8.8, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titulo}</b>
        <small style={{ fontSize: 7.2, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</small>
      </span>
      {etiqueta ? <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: etiqueta[2], color: etiqueta[1], whiteSpace: 'nowrap' }}>{etiqueta[0]}</em> : <span />}
    </div>
  )
  const aro = (Icono, estilo = {}) => <span aria-hidden="true" style={{ width: 26, height: 26, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.3px #00E091', display: 'grid', placeItems: 'center', color: C.texto, ...estilo }}><Icono size={12} strokeWidth={1.8} /></span>
  if (c.clase === 'suyo') {
    const s = c.s
    const sub = s.tipo === 'permiso' ? SUBTIPOS_PERMISO.find(t => t.key === s.subtipo)?.label : null
    const titulo = s.tipo === 'vacaciones' ? 'Vacación' : s.tipo === 'remoto' ? 'Trabajo remoto' : `Permiso${sub ? ` · ${sub}` : ''}`
    const cuando = s.horaDesde ? `${s.horaDesde} a ${s.horaHasta}` : s.hasta && s.hasta !== s.desde ? fechaRango(s.desde, s.hasta) : 'Todo el día'
    return fila(aro(s.tipo === 'vacaciones' ? Palmtree : s.tipo === 'remoto' ? House : Clock), titulo, cuando, ETIQUETA[s.estado])
  }
  if (c.clase === 'extra') {
    const x = c.x
    const et = esAutorizada(x) ? ETIQUETA.aprobada : x.estado === 'asignada' ? ['Asignadas', 'var(--tx-azul)', 'var(--tn-azul)'] : ETIQUETA.pendiente
    return fila(aro(Timer), 'Horas extra', `${x.desde} a ${x.hasta}`, et)
  }
  if (c.clase === 'feriado') return fila(aro(Star, { boxShadow: 'inset 0 0 0 1.3px #F4A29C', color: 'var(--in-rojo)' }), c.nombre, 'Feriado')
  if (c.clase === 'evento') return fila(aro(PartyPopper, { background: '#0C2D40', color: '#00E091', boxShadow: 'none' }), c.e.completo, c.e.detalle || 'Evento de la empresa')
  if (c.clase === 'cumple') {
    return fila(<img src={avatarUrl(c.e.completo, 80)} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 0 1.4px var(--in-carta), 0 0 0 2.6px #00E091' }} />, c.e.completo, c.e.fecha === at.hoy ? '¡Cumple hoy!' : 'Cumpleaños')
  }
  if (c.clase === 'jornada') {
    const j = c.j
    const sub = j.entrada != null ? `Entró ${hhmm(j.entrada)}${j.salida != null ? ` · salió ${hhmm(j.salida)}` : ''}` : 'No marcó ese día'
    return fila(aro(LogIn), 'Su jornada', sub, j.llegoTarde ? ['Llegó tarde', 'var(--tx-ambar)', 'var(--tn-ambar)'] : null)
  }
  return null
}

export default function CalendarioPhone({ onVolver, volverA = 'Inicio', diaInicial = null, web = false }) {
  const at = useAsistencia()
  const yo = at.yo
  const [ym, setYm] = useState(mesDe(diaInicial || at.hoy))
  const [dia, setDia] = useState(diaInicial)
  const porDia = useCosas()
  const celdas = semanasDe(ym)
  const delMes = Object.keys(porDia).filter(d => d.startsWith(ym)).sort()
  const mover = n => { setYm(mesVecino(ym, n)); setDia(null) }
  // Tocar un día del mes vecino lleva a ese mes: lo de ese día se lee con su mes.
  const tocar = d => { if (!d.startsWith(ym)) setYm(mesDe(d)); setDia(dia === d ? null : d) }
  const nombre = nombreMes(ym)
  const mesTxt = nombre[0].toUpperCase() + nombre.slice(1, -5)
  const flecha = { width: 24, height: 24, display: 'grid', placeItems: 'center', border: 'none', borderRadius: '50%', background: 'var(--in-carta)', color: C.texto, cursor: 'pointer', padding: 0, boxShadow: C.sombra }

  /* Lo del día elegido (con su jornada si ya pasó y era de trabajo) o, sin día, todo el mes sin repetir. */
  const jornadaDe = d => { if (d > at.hoy || !yo.horario?.dias?.includes(diaISO(d))) return null; const j = at.jornadaDe(yo, d); return j && j.estado !== 'libre' ? { clase: 'jornada', j } : null }
  const delDia = dia ? [...(porDia[dia] || []), jornadaDe(dia)].filter(Boolean) : null
  const vistos = new Set()
  const lista = delDia || delMes.flatMap(d => (porDia[d] || []).filter(c => {
    const k = c.clase === 'suyo' ? `s-${c.s.id}` : c.clase === 'extra' ? `x-${c.x.id}` : `${c.clase}-${d}-${c.nombre || c.e?.completo}`
    if (vistos.has(k)) return false
    vistos.add(k); return true
  }).map(c => ({ ...c, d })))
  const titulo = dia ? (delDia.length ? `${cosas(delDia.length)} este día` : 'Nada este día') : lista.length ? `${cosas(lista.length)} este mes` : 'Nada este mes'

  const tarjeta = (
    <div style={{ background: C.vCarta, border: `1px solid ${C.vBorde}`, borderRadius: 22, boxShadow: C.sombra, padding: '9px 10px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {/* La cabecera: el día elegido (o el mes) y cuántas cosas tiene; a la derecha, cambiar de mes. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderRadius: 15, padding: '8px 10px 9px 11px', background: C.viaje, border: `1px solid ${C.viajeBorde}`, color: C.viajeTxt }}>
        <span style={{ display: 'grid', minWidth: 0 }}>
          <small style={{ fontSize: 6.6, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: C.viajeRotulo }}>{dia ? largo(dia) : `${mesTxt} ${ym.slice(0, 4)}`}</small>
          <b style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-.02em' }}>{titulo}</b>
        </span>
        <span style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          <button type="button" aria-label="Mes anterior" onClick={() => mover(-1)} style={flecha}><ChevronLeft size={12} /></button>
          <button type="button" aria-label="Mes siguiente" onClick={() => mover(1)} style={flecha}><ChevronRight size={12} /></button>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 3, textAlign: 'center' }}>
        {DIAS.map(d => <span key={d} style={{ fontSize: 7, fontWeight: 600, letterSpacing: '.06em', opacity: 0.45, paddingBottom: 2 }}>{d}</span>)}
        {celdas.map((d, i) => {
          const items = porDia[d] || []
          const sel = d === dia
          const hoy = d === at.hoy
          const vecino = !d.startsWith(ym)
          const col = i % 7
          const feriado = items.find(c => c.clase === 'feriado')
          /* La cinta: un día entero pedido. Redondeada donde empieza y donde termina (o en el borde de la semana). */
          const tramo = items.find(c => c.clase === 'suyo' && c.entero)
          const [fondo, tinta] = tramo ? CINTA[tramo.s.estado] || CINTA.pendiente : [null, null]
          const ini = tramo && (d === tramo.s.desde || col === 0)
          const fin = tramo && (d === (tramo.s.hasta || tramo.s.desde) || col === 6)
          const puntos = [
            items.some(c => (c.clase === 'suyo' && !c.entero && c.s.estado === 'aprobada') || (c.clase === 'extra' && esAutorizada(c.x))) && PUNTO.suyo,
            items.some(c => (c.clase === 'suyo' && !c.entero && c.s.estado === 'pendiente') || (c.clase === 'extra' && !esAutorizada(c.x))) && PUNTO.pendiente,
            items.some(c => c.clase === 'evento') && PUNTO.evento,
            items.some(c => c.clase === 'cumple') && PUNTO.cumple,
          ].filter(Boolean)
          return (
            <span key={d} style={{ height: 32, display: 'grid', justifyItems: 'center', alignContent: 'start', background: fondo ? (ini && fin ? 'transparent' : ini ? `linear-gradient(90deg, transparent 50%, ${fondo} 50%)` : fin ? `linear-gradient(90deg, ${fondo} 50%, transparent 50%)` : fondo) : 'transparent', backgroundSize: '100% 23px', backgroundRepeat: 'no-repeat', opacity: vecino ? 0.4 : 1 }}>
              <button type="button" onClick={() => tocar(d)} aria-pressed={sel} aria-label={`${corto(d)}${items.length ? `, ${cosas(items.length)}` : ''}${feriado ? `, feriado: ${feriado.nombre}` : ''}`}
                style={{
                  width: 23, height: 23, borderRadius: '50%', border: 'none', padding: 0, fontFamily: 'inherit', cursor: 'pointer', display: 'grid', placeItems: 'center',
                  fontSize: 8.8, fontVariantNumeric: 'tabular-nums', fontWeight: sel || hoy || feriado || tramo ? 700 : 400,
                  background: sel ? C.punta : tramo ? fondo : 'transparent',
                  color: sel ? C.puntaTxt : feriado ? 'var(--in-rojo)' : tramo ? tinta : C.texto,
                  boxShadow: sel ? C.puntaSombra : hoy ? 'inset 0 0 0 1.5px #00E091' : 'none',
                  opacity: !sel && !hoy && !tramo && !feriado && col >= 5 ? 0.55 : 1,
                }}>{aFecha(d).getDate()}</button>
              <span style={{ display: 'flex', gap: 2, height: 4, marginTop: 2 }}>
                {puntos.slice(0, 3).map((c, k) => <i key={k} style={{ width: 4, height: 4, borderRadius: '50%', background: c }} />)}
              </span>
            </span>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 10px', fontSize: 6.8, color: C.mute, borderTop: '1px solid var(--in-vac-separador)', paddingTop: 7 }}>
        {[[PUNTO.suyo, 'Suyo'], [PUNTO.pendiente, 'Por aprobar'], [PUNTO.evento, 'Evento'], [PUNTO.cumple, 'Cumpleaños'], ['var(--in-rojo)', 'Feriado']].map(([c, t]) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />{t}</span>
        ))}
      </div>
    </div>
  )

  const fichas = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={ROTULO}>{dia ? largo(dia) : `En ${mesTxt.toLowerCase()}`}</span>
      {lista.length
        ? lista.map((c, k) => (
          <div key={k} style={{ display: 'grid', gap: 2 }}>
            {!dia && (k === 0 || lista[k - 1].d !== c.d) && <small style={{ fontSize: 6.8, fontWeight: 600, color: C.mute, margin: k ? '4px 2px 0' : '0 2px' }}>{corto(c.d)}</small>}
            <Ficha c={c} at={at} />
          </div>
        ))
        : <span style={{ fontSize: 8, color: C.mute, textAlign: 'center', padding: '10px 0' }}>{dia ? 'Nada este día.' : 'Nada este mes.'}</span>}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: C.texto }}>
      {!web && <BarraVolver texto={volverA} onVolver={onVolver} conTema />}
      <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em', margin: '-2px 2px 0' }}>Mi calendario</b>
      {web
        ? <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 14, alignItems: 'start' }}>{tarjeta}{fichas}</div>
        : <>{tarjeta}{fichas}</>}
    </div>
  )
}
