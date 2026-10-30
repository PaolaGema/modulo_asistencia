import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Palmtree, FileText } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import BarraVolver from './BarraVolver'
import {
  FERIADOS, esHabil, diasHabiles, habilSiguiente, saldoVacaciones, sumarDias, diaISO, aFecha,
  MESES, DIAS_LARGOS, mesDe, mesVecino, diasDelMes, nombreMes,
} from '../../data/asistenciaData'

/* ── SOLICITAR VACACIÓN, DESDE EL INICIO ──
   El calendario navy de la marca con «Sale ✈ Vuelve» (lienzo «Navy con Sale y Vuelve»): arriba la
   salida y el regreso, en el medio el calendario y al pie el resumen junto al botón que lo envía. En
   claro la tarjeta es blanca, la cabecera menta suave y el navy en los días elegidos; en oscuro todo es
   navy y lo elegido brilla en menta (variables `--in-vac-*` de index.css).

   El sistema hace la cuenta con el HORARIO DE LA PERSONA: quien trabaja los sábados gasta un día al
   faltar el sábado; los feriados nunca cuentan. Y dice cuándo se vuelve.

   NO SE PUEDE PEDIR DE MÁS: al elegir el primer día, los que no alcanza el saldo se apagan y una línea
   dice hasta dónde llega. El rango se elige tocando el primero y el último, o arrastrando el dedo.
   Al enviar, una confirmación y de vuelta al inicio. La revisa RR.HH. en Asistencia › Solicitudes. */

const C = {
  texto: 'var(--in-texto)', mute: 'var(--in-mute)', suave: 'var(--in-suave)', acento: '#00E091', acentoTxt: 'var(--in-acento-txt)', acentoBg: 'var(--in-acento-bg)',
  carta: 'var(--in-carta)', campo: 'var(--in-campo)', off: 'var(--in-boton-off)',
  vCarta: 'var(--in-vac-carta)', vBorde: 'var(--in-vac-borde)', viaje: 'var(--in-vac-viaje)', viajeBorde: 'var(--in-vac-viaje-borde)', viajeSombra: 'var(--in-vac-viaje-sombra)',
  viajeTxt: 'var(--in-vac-viaje-txt)', viajeRotulo: 'var(--in-vac-viaje-rotulo)', avion: 'var(--in-vac-avion)', trazo: 'var(--in-vac-trazo)',
  punta: 'var(--in-vac-punta)', puntaTxt: 'var(--in-vac-punta-txt)', puntaSombra: 'var(--in-vac-punta-sombra)',
  cinta: 'var(--in-vac-cinta)', cintaTxt: 'var(--in-vac-cinta-txt)', etiqueta: 'var(--in-vac-etiqueta)', separador: 'var(--in-vac-separador)',
}
const BOTON = { height: 32, border: 'none', borderRadius: 99, background: C.acento, color: '#0C2D40', fontFamily: 'inherit', fontSize: 9.6, fontWeight: 600, cursor: 'pointer' }
const INICIALES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const diaCorto = s => `${DIAS_LARGOS[diaISO(s)].slice(0, 3)} ${aFecha(s).getDate()} ${MESES[aFecha(s).getMonth()].slice(0, 3)}`
const diaSemana = s => `${DIAS_LARGOS[diaISO(s)].slice(0, 3)} ${aFecha(s).getDate()}`
const diaMes = s => `${aFecha(s).getDate()} ${MESES[aFecha(s).getMonth()].slice(0, 3)}`
/* Al cambiar de paso, la pantalla del teléfono vuelve arriba: si no, se abría a mitad del documento. */
const arriba = () => document.querySelector('#marco-telefono .phone-scroll')?.scrollTo(0, 0)
const dias = n => `${n} ${n === 1 ? 'día' : 'días'}`
/* «martes 24 de noviembre de 2026»; sin el año cuando es la primera fecha de un «del … al …». */
const fechaCompleta = (s, conAnio = true) => `${DIAS_LARGOS[diaISO(s)]} ${aFecha(s).getDate()} de ${MESES[aFecha(s).getMonth()]}${conAnio ? ` de ${s.slice(0, 4)}` : ''}`
/* El día en que se completan `n` días hábiles de la persona contando desde `desde`: hasta dónde alcanza el saldo. */
function finPorHabiles(desde, n, horario) {
  let d = desde, k = esHabil(d, horario) ? 1 : 0
  while (k < n) { d = sumarDias(d, 1); if (esHabil(d, horario)) k++ }
  return d
}

/* `volverA` es el texto de la barra de arriba; `onListo`, a dónde lleva el botón de la confirmación
   (desde Mis solicitudes vuelve a la lista, no al inicio). */
export default function SolicitarVacacionPhone({ onVolver, volverA = 'Inicio', onListo, listoTexto = 'Volver al inicio' }) {
  const at = useAsistencia()
  const yo = at.yo
  const h = yo.horario
  const minimo = sumarDias(at.hoy, 1)
  /* Abre en el mes que conviene: si al mes de hoy le quedan menos de cinco días hábiles por elegir
     (fin de mes), abre en el siguiente; si no, se veía un calendario casi entero apagado. */
  const [ym, setYm] = useState(() => {
    const mes = mesDe(minimo)
    return diasDelMes(mes).filter(d => d >= minimo && esHabil(d, h)).length < 5 ? mesVecino(mes, 1) : mes
  })
  const [desde, setDesde] = useState(null)
  const [hasta, setHasta] = useState(null)
  const [paso, setPaso] = useState('desde')
  const [comentario, setComentario] = useState('')
  const [revisar, setRevisar] = useState(false)
  const [viendo, setViendo] = useState(null)
  const [enviada, setEnviada] = useState(null)
  const { empresa } = useOnboardingData()
  /* La hoja de revisión y la papeleta suben sobre todo el teléfono, no solo sobre el formulario. */
  const marco = typeof document !== 'undefined' ? document.getElementById('marco-telefono') : null
  /* El arrastre en curso: desde qué día y si el dedo ya se movió (entonces el clic final no cuenta). */
  const arrastre = useRef(null)

  const saldo = saldoVacaciones(yo, at.solicitudes, at.hoy)
  /* Los días que ya están pedidos o aprobados no se pueden volver a pedir. */
  const ocupados = useMemo(() => {
    const set = new Set()
    at.solicitudes
      .filter(s => s.tipo === 'vacaciones' && ['pendiente', 'aprobada'].includes(s.estado) && String(s.personaId) === String(yo.id))
      .forEach(s => { for (let d = s.desde; d <= s.hasta; d = sumarDias(d, 1)) set.add(d) })
    return set
  }, [at.solicitudes, yo.id])

  if (enviada) {
    return (
      <>
        <Enviada {...enviada} onVer={() => setViendo(enviada)} onVolver={onListo || onVolver} listoTexto={listoTexto} />
        {viendo && marco && createPortal(<VerPapeleta papeleta={viendo} onCerrar={() => setViendo(null)} />, marco)}
      </>
    )
  }

  if (!saldo.derecho || saldo.disponible <= 0) {
    const sinDerecho = !saldo.derecho
    return (
      <div>
        <BarraVolver texto={volverA} onVolver={onVolver} conTema />
        <div style={{ background: C.carta, borderRadius: 20, boxShadow: 'var(--in-sombra)', padding: '22px 14px', textAlign: 'center', color: C.texto }}>
          <Palmtree size={26} strokeWidth={1.5} style={{ color: C.mute }} />
          <b style={{ display: 'block', fontSize: 11, marginTop: 6 }}>{sinDerecho ? 'Todavía no tiene vacaciones' : 'No le quedan días disponibles'}</b>
          <p style={{ margin: '4px 0 0', fontSize: 8.6, color: C.mute, lineHeight: 1.5 }}>
            {sinDerecho ? 'Se ganan al cumplir un año en la empresa. Si necesita faltar, pida un permiso.'
              : saldo.pedidos ? `${dias(saldo.pedidos)} ya pedidos esperan respuesta de RR.HH.` : 'Si necesita faltar, pida un permiso.'}
          </p>
        </div>
      </div>
    )
  }

  /* Con solo el primer día tocado, la solicitud es de ese día. */
  const fin = hasta || desde
  const n = desde ? diasHabiles(desde, fin, h) : 0
  const regreso = desde ? habilSiguiente(fin, h) : null
  const eligiendo = !!desde && paso === 'hasta'
  /* HASTA DÓNDE SE PUEDE LLEGAR desde el primer día: lo que alcanza el saldo, y nunca pasando por encima
     de días ya pedidos (el rango se frena el día antes del primero que encuentra). `frenoPedido` dice
     qué lo frenó, para explicarlo debajo del calendario. */
  const topeDe = x => {
    const porSaldo = finPorHabiles(x, saldo.disponible, h)
    let d = sumarDias(x, 1)
    while (d <= porSaldo) { if (ocupados.has(d)) return { tope: sumarDias(d, -1), pedido: d }; d = sumarDias(d, 1) }
    return { tope: porSaldo, pedido: null }
  }
  const { tope: limite, pedido: frenoPedido } = desde ? topeDe(desde) : { tope: null, pedido: null }
  const choca = desde && Array.from({ length: Math.round((aFecha(fin) - aFecha(desde)) / 864e5) + 1 }, (_, i) => sumarDias(desde, i)).some(d => ocupados.has(d))
  const listo = desde && n > 0 && !choca

  /* ELEGIR EL RANGO: tocar un día marca la salida; el siguiente toque, el último día. Un día antes de
     la salida la reemplaza. Con el rango completo, otro toque empieza de nuevo. */
  const tocar = d => {
    if (paso !== 'hasta' || !desde) { setDesde(d); setHasta(null); setPaso('hasta'); return }
    if (d < desde) { setDesde(d); return }
    setHasta(d === desde ? null : d)
    setPaso('listo')
  }
  /* ARRASTRAR: se apoya el dedo en un día y se desliza; el rango sigue al dedo y se frena donde se
     acaba el saldo. Se lee el día bajo el dedo con `elementFromPoint` porque en pantallas táctiles el
     movimiento llega siempre al primer día tocado. */
  const diaBajo = e => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('[data-dia]')
    return el && !el.disabled ? el.dataset.dia : null
  }
  const empezar = e => {
    const el = e.target.closest('[data-dia]')
    arrastre.current = el && !el.disabled ? { inicio: el.dataset.dia, movio: false } : null
  }
  const mover = e => {
    const a = arrastre.current
    if (!a || a.suelto) return
    const d = diaBajo(e)
    if (!d || (d === a.inicio && !a.movio)) return
    a.movio = true
    const x = d < a.inicio ? d : a.inicio
    const y = [d > a.inicio ? d : a.inicio, topeDe(x).tope].sort()[0]
    setDesde(x); setHasta(y === x ? null : y); setPaso('listo')
  }
  const soltar = () => { if (arrastre.current?.movio) arrastre.current = { suelto: true, cuando: Date.now() }; else arrastre.current = null }
  const clic = d => {
    const a = arrastre.current
    arrastre.current = null
    if (a?.suelto && Date.now() - a.cuando < 500) return
    tocar(d)
  }

  /* LA PAPELETA SE ARMA SOLA (lienzo «La papeleta se arma sola»): con los datos del expediente y las
     fechas elegidas. La persona no escribe nada: la ve y la solicita. Todavía no hay firma digital:
     la papeleta registra quién la pidió y cuándo, y RR.HH. la aprueba. */
  const papeleta = desde && {
    numero: `${at.hoy.slice(0, 4)}-${String(at.solicitudes.filter(s => s.tipo === 'vacaciones').length + 1).padStart(4, '0')}`,
    empresa: empresa?.razonSocial || empresa?.nombre || 'FarmaVida S.A.',
    nit: empresa?.nit,
    persona: yo, desde, hasta: fin, regreso, n, saldo: saldo.disponible, motivo: comentario.trim(), horario: h,
    /* Dónde trabaja, cada cosa por su lado, con la estructura de Organización: la sucursal y, si tiene,
       el centro de trabajo donde marca. */
    sucursal: at.lugarPorId.get(yo.sucursalId)?.nombre || yo.sedeNombre,
    centro: yo.lugar?.tipo === 'centro' ? yo.lugar.nombre : null,
  }
  const solicitar = () => {
    const solicitada = new Date().toISOString()
    at.crearSolicitud({ tipo: 'vacaciones', personaId: yo.id, desde, hasta: fin, motivo: comentario.trim() || 'Vacaciones', papeleta: papeleta.numero, solicitada, saldoAntes: saldo.disponible })
    setRevisar(false)
    setEnviada({ ...papeleta, solicitada, quedan: saldo.disponible - n })
  }

  /* PASO 2 DE 2 · EL DOCUMENTO: una pantalla con la papeleta tal como llega a RR.HH., el motivo opcional
     (que aparece en la papeleta al escribirlo) y el botón «Solicitar» fijo al pie. «‹ Fechas» vuelve
     al calendario sin perder nada. */
  if (revisar && papeleta) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: C.texto, minHeight: '100%' }}>
        <BarraVolver texto="Fechas" onVolver={() => { setRevisar(false); arriba() }} conTema />
        <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>Revise su solicitud</b>
        <Papeleta p={papeleta} />
        <label style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
          <span style={{ fontSize: 7.6, color: C.mute }}>Motivo (opcional)</span>
          <input value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Ej.: viaje familiar"
            style={{ border: 'none', borderBottom: `1px solid ${C.campo}`, background: 'none', padding: '3px 0 5px', fontFamily: 'inherit', fontSize: 9, color: C.texto, outline: 'none' }} />
        </label>
        <div style={{ position: 'sticky', bottom: -10, marginTop: 'auto', paddingTop: 8, paddingBottom: 2, background: 'var(--in-fondo)', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <button type="button" onClick={solicitar} style={{ ...BOTON, width: '100%', height: 34, boxShadow: '0 8px 16px -10px rgba(0,184,118,.9)' }}>Solicitar</button>
          <span style={{ fontSize: 7.4, color: C.mute, textAlign: 'center' }}>Se envía a RR.HH. para su aprobación.</span>
        </div>
      </div>
    )
  }

  const offset = diaISO(`${ym}-01`) - 1
  const celdas = [...Array(offset).fill(null), ...diasDelMes(ym)]
  const primerMes = ym <= mesDe(minimo)
  const ayuda = !desde ? 'Toque el día en que sale, o arrastre sobre los días.'
    : choca ? 'Ya pidió vacaciones en esas fechas.'
      : eligiendo && frenoPedido ? `Toque el último día: puede llegar hasta el ${diaCorto(limite)}, porque desde el ${diaCorto(frenoPedido)} ya tiene vacaciones pedidas.`
      : eligiendo ? `Toque el último día. Su saldo alcanza hasta el ${diaCorto(limite)}.`
        : `Vuelve a trabajar el ${fechaCompleta(regreso)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: C.texto }}>
      <BarraVolver texto={volverA} onVolver={onVolver} conTema />

      <div style={{ background: C.vCarta, border: `1px solid ${C.vBorde}`, borderRadius: 22, boxShadow: 'var(--in-sombra)', padding: '9px 10px 10px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {/* Arriba, las vacaciones; el día en que ya trabaja, abajo. */}
        <Viaje desde={desde} hasta={fin} n={n} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <button type="button" aria-label="Mes anterior" disabled={primerMes} onClick={() => setYm(mesVecino(ym, -1))} style={flecha(primerMes)}><ChevronLeft size={12} /></button>
            <b style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-.02em' }}>
              {nombreMes(ym)[0].toUpperCase() + nombreMes(ym).slice(1, -5)} <span style={{ fontWeight: 400, opacity: 0.45 }}>{ym.slice(0, 4)}</span>
            </b>
            <button type="button" aria-label="Mes siguiente" onClick={() => setYm(mesVecino(ym, 1))} style={flecha(false)}><ChevronRight size={12} /></button>
          </div>
          <div onPointerDown={empezar} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 6, textAlign: 'center', touchAction: 'none' }}>
            {INICIALES.map((l, i) => <span key={i} style={{ fontSize: 7, fontWeight: 600, letterSpacing: '.06em', opacity: 0.45, paddingBottom: 2 }}>{l}</span>)}
            {celdas.map((d, i) => d
              ? <Dia key={d} d={d} col={i % 7} desde={desde} fin={fin} regreso={regreso} habil={esHabil(d, h)} pasado={d < minimo} ocupado={ocupados.has(d)}
                  fuera={eligiendo && d > limite} onTocar={clic} />
              : <span key={`v${i}`} />)}
          </div>
          {ayuda && <p style={{ margin: '8px 0 0', fontSize: 7.8, color: C.mute, textAlign: 'center' }}>{ayuda}</p>}
        </div>

        {/* Al pie, el saldo junto al botón (las fechas y los días ya están en la cabecera), con la barra
            de «Días libres, días reservados»: verde lo que queda libre, navy esta solicitud y ámbar lo que
            ya espera aprobación. Lo pedido no se pierde: queda reservado hasta que RR.HH. responde. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: `1px solid ${C.separador}`, paddingTop: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: 7.4, color: C.mute }}>{desde ? 'Le quedarán libres' : 'Puede pedir'}</span>
            <b style={{ fontSize: 10.4, fontWeight: 700, letterSpacing: '-.01em', whiteSpace: 'nowrap' }}>{dias(desde ? saldo.disponible - n : saldo.disponible)}</b>
          </span>
          {/* Paso 1 de 2: elegir las fechas. Solicitar es después de ver la papeleta. */}
          <button type="button" disabled={!listo} onClick={() => { setRevisar(true); arriba() }}
            style={{ ...BOTON, padding: '0 18px', flexShrink: 0, ...(listo ? { boxShadow: '0 8px 16px -10px rgba(0,184,118,.9)' } : { background: C.off, color: C.suave, cursor: 'default' }) }}>
            Continuar
          </button>
        </div>
        <BarraSaldo libres={saldo.disponible - (desde ? n : 0)} esta={desde ? n : 0} reservados={saldo.pedidos} total={saldo.saldo} />
        </div>
      </div>

    </div>
  )
}

const flecha = off => ({ width: 22, height: 22, display: 'grid', placeItems: 'center', border: 'none', borderRadius: '50%', background: 'none', color: 'inherit', opacity: off ? 0.2 : 0.6, cursor: off ? 'default' : 'pointer' })

/* «🌴 DE VACACIONES · mié 2 – – vie 4»: arriba solo el periodo, del primer al último día, con la palmera
   (la misma del botón del inicio) junto al título y una línea limpia entre las fechas; antes había un
   avión que volaba sobre la línea. El día en que ya trabaja va abajo (marcado en el calendario
   y dicho bajo él): juntos en la cabecera, el regreso se confundía con un día más de vacación. Se
   probaron una barra de dos colores y «Vacaciones solicitadas / Vuelve el». `enTarjeta` lo pinta como
   una tarjeta blanca (en «¡Listo!») en vez del menta claro de la cabecera del calendario. */
function Viaje({ desde, hasta, n, enTarjeta }) {
  const varios = desde && hasta && hasta !== desde
  const cruza = varios && aFecha(desde).getMonth() !== aFecha(hasta).getMonth()
  const dia = s => (cruza ? diaMes(s) : diaSemana(s))
  const valor = { fontSize: 12, fontWeight: 700, letterSpacing: '-.02em', whiteSpace: 'nowrap' }
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 3, borderRadius: enTarjeta ? 14 : 15, padding: '8px 11px 9px',
      color: C.viajeTxt, background: enTarjeta ? C.carta : C.viaje, border: `1px solid ${enTarjeta ? 'transparent' : C.viajeBorde}`, boxShadow: enTarjeta ? 'var(--in-sombra)' : C.viajeSombra,
    }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 6.6, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: C.viajeRotulo }}>
          <Palmtree size={10} strokeWidth={2} style={{ color: C.avion, flexShrink: 0 }} aria-hidden="true" />De vacaciones
        </span>
        {desde && !enTarjeta && <span style={{ fontSize: 7.4, fontWeight: 600, color: C.viajeRotulo }}>{n} {n === 1 ? 'día hábil' : 'días hábiles'}</span>}
      </span>
      {!desde ? (
        <b style={{ ...valor, opacity: 0.4 }}>Elija sus días</b>
      ) : !varios ? (
        <b style={valor}>{diaCorto(desde)}</b>
      ) : (
        <span style={{ display: 'grid', gridTemplateColumns: 'auto minmax(40px, 1fr) auto', alignItems: 'center', gap: 8 }}>
          <b style={valor}>{dia(desde)}</b>
          <span style={{ height: 2, background: `repeating-linear-gradient(90deg, ${C.trazo} 0 5px, transparent 5px 9px)` }} />
          <b style={valor}>{dia(hasta)}</b>
        </span>
      )}
    </div>
  )
}

/* La barra del saldo con su leyenda. Los tramos suman el saldo de la gestión. */
function BarraSaldo({ libres, esta, reservados, total }) {
  const tramos = [[libres, C.acento, `${libres} libres`], [esta, 'var(--in-vac-punta)', `${esta} esta solicitud`], [reservados, '#F5B544', `${reservados} por aprobar`]].filter(([v]) => v > 0)
  return (
    <>
      <span style={{ display: 'flex', gap: 2, height: 6, borderRadius: 99, overflow: 'hidden', background: 'var(--in-linea)' }}>
        {tramos.map(([v, color], i) => <i key={i} style={{ flex: v, background: color, transition: 'flex .3s cubic-bezier(.2, .8, .2, 1)' }} />)}
      </span>
      <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px 9px', fontSize: 6.8, color: C.mute }}>
        {tramos.map(([, color, texto]) => (
          <span key={texto} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><i style={{ width: 6, height: 6, borderRadius: 2, background: color }} />{texto}</span>
        ))}
        <span style={{ marginLeft: 'auto', opacity: 0.75 }}>de {total} en la gestión</span>
      </span>
    </>
  )
}

/* Un día del calendario: un círculo. El rango, una cinta detrás, partida a la mitad en sus puntas y
   redondeada donde cambia la semana. Debajo de la salida dice «Sale»; el día que vuelve lleva un aro
   menta y «Vuelve». Lo que no se puede elegir (pasado, ya pedido, fuera del saldo), tenue. */
function Dia({ d, col, desde, fin, regreso, habil, pasado, ocupado, fuera, onTocar }) {
  const varios = desde && fin !== desde
  const punta = d === desde || d === fin
  const dentro = desde && d > desde && d < fin
  const vuelve = d === regreso
  const feriado = FERIADOS[d]
  const off = pasado || ocupado || fuera
  const inicio = varios && d === desde && col !== 6
  const final = varios && d === fin && col !== 0
  const fondo = inicio ? `linear-gradient(90deg, transparent 50%, ${C.cinta} 50%)` : final ? `linear-gradient(90deg, ${C.cinta} 50%, transparent 50%)` : dentro ? C.cinta : 'transparent'
  const radio = dentro && col === 0 ? '99px 0 0 99px' : dentro && col === 6 ? '0 99px 99px 0' : 0
  const color = punta ? C.puntaTxt : dentro ? C.cintaTxt : C.texto
  const etiqueta = d === desde ? 'Vacaciones' : vuelve ? 'Trabaja' : null
  return (
    <span style={{ height: 25, display: 'grid', placeItems: 'center', background: fondo, borderRadius: radio }}>
      <button type="button" data-dia={d} disabled={off} onClick={() => onTocar(d)} title={feriado || (ocupado ? 'Ya pedido' : pasado ? 'Ya pasó' : undefined)}
        aria-label={`${diaCorto(d)}${feriado ? `, feriado: ${feriado}` : ''}${ocupado ? ', ya pedido' : ''}${vuelve ? ', día en que vuelve' : ''}`} aria-pressed={punta || !!dentro}
        style={{
          position: 'relative', width: 23, height: 23, borderRadius: '50%', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 9,
          fontVariantNumeric: 'tabular-nums', fontWeight: punta || vuelve ? 700 : dentro ? 600 : 400, color,
          opacity: off && !punta && !vuelve ? 0.28 : !habil && !punta && !vuelve ? 0.5 : 1, cursor: off ? 'default' : 'pointer',
          background: punta ? C.punta : 'transparent', boxShadow: punta ? C.puntaSombra : vuelve ? `inset 0 0 0 1.5px ${C.acento}` : 'none',
          transition: 'background .15s, color .15s, box-shadow .2s', textDecoration: ocupado ? 'line-through' : 'none',
        }}>
        {aFecha(d).getDate()}
        {feriado && !punta && <i aria-hidden="true" style={{ position: 'absolute', left: '50%', bottom: 2.5, width: 2.5, height: 2.5, marginLeft: -1.25, borderRadius: '50%', background: '#F59E0B' }} />}
        {etiqueta && <small style={{ position: 'absolute', left: '50%', bottom: -8, transform: 'translateX(-50%)', fontSize: 5.4, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: C.etiqueta }}>{etiqueta}</small>}
      </button>
    </span>
  )
}

/* La papeleta a pantalla completa, sobre el teléfono. */
export function VerPapeleta({ papeleta, onCerrar }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 45, background: 'var(--in-fondo)', display: 'flex', flexDirection: 'column', animation: 'vac-aparecer .2s ease' }}>
      <div style={{ height: 34, flexShrink: 0 }} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px 14px', scrollbarWidth: 'none' }}>
        <BarraVolver texto="Volver" onVolver={onCerrar} conTema />
        <Papeleta p={papeleta} />
      </div>
    </div>
  )
}

/* LA PAPELETA DE VACACIÓN (opción A1 · Claro del lienzo «El formulario oficial, más cuidado»): el
   formulario de siempre, con encabezado de marca, dos secciones numeradas, las fechas destacadas y el
   regreso en su propio bloque para que nadie lo confunda con el último día de vacación. Es papel: se
   ve blanco también en modo oscuro. */
const P = { navy: '#0C2D40', menta: '#00E091', mentaTxt: '#0A7F55', gris: '#6B7C8A', suave: '#9AABBB', borde: '#E6ECF1', linea: '#EEF2F5', fondoMenta: '#F3FBF7', bordeMenta: '#D3F5E6' }
const iniciales = nombre => ((nombre || '').split(' ')[0].match(/[A-ZÁÉÍÓÚÑ]/g) || ['S']).slice(0, 2).join('')

function Papeleta({ p }) {
  const per = p.persona
  const horario = !p.horario?.dias?.length ? 'Lunes a viernes'
    : p.horario.dias.length === 6 ? 'Lunes a sábado' : p.horario.dias.length === 5 ? 'Lunes a viernes' : `${p.horario.dias.length} días por semana`
  const pidio = p.solicitada && new Date(p.solicitada)
  const diaNombre = s => `${DIAS_LARGOS[diaISO(s)][0].toUpperCase()}${DIAS_LARGOS[diaISO(s)].slice(1)} ${aFecha(s).getDate()}`
  const celda = (k, v, { ancho, vacio, destacado } = {}) => (
    <div style={{ gridColumn: ancho ? '1 / -1' : undefined, display: 'flex', flexDirection: 'column', padding: '4px 7px', borderBottom: `1px solid ${P.linea}`, background: destacado ? '#F7FAFC' : 'transparent', minWidth: 0 }}>
      <span style={{ fontSize: 6.2, color: P.gris }}>{k}</span>
      <b style={{ fontSize: destacado ? 9 : 8, fontWeight: destacado ? 700 : 600, color: vacio ? P.suave : P.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</b>
    </div>
  )
  const seccion = (n, titulo) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 6.8, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
      <i style={{ width: 13, height: 13, borderRadius: '50%', background: P.navy, color: '#fff', display: 'grid', placeItems: 'center', fontStyle: 'normal', fontSize: 6.8, letterSpacing: 0 }}>{n}</i>
      {titulo}
      <span style={{ flex: 1, height: 1, background: P.linea }} />
    </span>
  )
  /* «Miércoles 11 de noviembre» */
  const fechaLarga = s => `${diaNombre(s)} de ${MESES[aFecha(s).getMonth()]}`

  return (
    <article style={{ background: '#fff', color: P.navy, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 0 #E3EAF0, 0 18px 32px -24px rgba(12,45,64,.6)' }}>
      <header style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 7, alignItems: 'center', padding: '10px 11px', borderBottom: `1px solid ${P.linea}` }}>
        <span style={{ width: 25, height: 25, borderRadius: 7, background: P.navy, color: P.menta, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 8.4 }}>{iniciales(p.empresa)}</span>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <b style={{ fontSize: 8.8, letterSpacing: '-.01em' }}>{p.empresa}</b>
          <span style={{ fontSize: 6.2, color: P.gris }}>{p.nit ? `NIT ${p.nit} · ` : ''}Recursos Humanos</span>
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 6.2, color: P.gris }}>Papeleta de vacación</span>
          <b style={{ fontSize: 8.4, color: P.mentaTxt, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>N° {p.numero}</b>
        </span>
      </header>

      <div style={{ padding: '10px 11px 4px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <b style={{ textAlign: 'center', fontSize: 8.4, letterSpacing: '.14em', textTransform: 'uppercase' }}>Solicitud de vacación</b>

        {seccion(1, 'Datos del trabajador')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${P.borde}`, borderRadius: 7, overflow: 'hidden', marginTop: -3 }}>
          {celda('Nombre completo', per.name, { ancho: true, destacado: true })}
          {celda('CI', per.documento || '—')}
          {celda('Fecha de ingreso', per.ingreso ? `${diaMes(per.ingreso)} ${per.ingreso.slice(0, 4)}` : '—')}
          {celda('Cargo', per.cargo || '—', { ancho: true })}
          {celda('Unidad organizacional', per.unidad || '—')}
          {celda('Horario', horario)}
          {celda('Sucursal', p.sucursal || '—')}
          {celda('Centro de trabajo', p.centro || 'Sin centro asignado', { vacio: !p.centro })}
        </div>

        {/* La vacación en filas, con las dos columnas de Mi ficha (opción I2): desde, hasta, los días
            hábiles resaltados en menta, el regreso y el saldo. Antes eran tres recuadros con tres estilos
            —el menta de las fechas, uno con borde navy para el regreso y la grilla del saldo— y el borde
            navy pesaba más que todo. */}
        {seccion(2, 'Vacación solicitada')}
        <div style={{ border: `1px solid ${P.borde}`, borderRadius: 7, overflow: 'hidden', marginTop: -3, fontVariantNumeric: 'tabular-nums' }}>
          {[
            ...(p.desde === p.hasta ? [['El día', fechaLarga(p.desde)]] : [['Desde', fechaLarga(p.desde)], ['Hasta', fechaLarga(p.hasta)]]),
            ['Días hábiles', `${p.n} ${p.n === 1 ? 'día' : 'días'}`, true],
            ['Vuelve a trabajar', fechaLarga(p.regreso)],
            ['Saldo después', `${p.saldo - p.n} ${p.saldo - p.n === 1 ? 'día' : 'días'} (de ${p.saldo})`],
            ...(p.motivo ? [['Motivo', p.motivo]] : []),
          ].map(([k, v, menta], i) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '42% 1fr', gap: 8, alignItems: 'baseline', padding: '5px 8px', borderTop: i ? `1px solid ${P.linea}` : 'none', background: menta ? P.fondoMenta : 'transparent' }}>
              <span style={{ fontSize: 6.6, color: P.gris }}>{k}</span>
              <b style={{ fontSize: 8, fontWeight: 600, color: menta ? P.mentaTxt : P.navy, overflowWrap: 'anywhere' }}>{v}</b>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 6 }}>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
            <span style={{ alignSelf: 'stretch', height: 20, borderBottom: `1px solid ${P.navy}` }} />
            <b style={{ fontSize: 7.6, marginTop: 3 }}>{per.name}</b>
            <span style={{ fontSize: 6.2, color: P.gris }}>Solicitante{pidio ? ` · solicitó el ${pidio.toLocaleDateString('es')}, ${pidio.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
            <span style={{ alignSelf: 'stretch', height: 20, borderBottom: `1px solid ${P.navy}`, display: 'grid', placeItems: 'center' }}>
              <em style={{ fontStyle: 'normal', fontSize: 6.2, fontWeight: 700, color: '#9A5B06', background: '#FFF4DE', padding: '1px 6px', borderRadius: 99 }}>Pendiente</em>
            </span>
            <b style={{ fontSize: 7.6, marginTop: 3 }}>Recursos Humanos</b>
            <span style={{ fontSize: 6.2, color: P.gris }}>Aprobación</span>
          </span>
        </div>
      </div>

      <footer style={{ display: 'flex', justifyContent: 'space-between', gap: 6, padding: '7px 11px 9px', marginTop: 6, borderTop: '1px solid #F0F3F6', fontSize: 5.8, color: P.suave }}>
        <span>Generado por SoulyHR con los datos del expediente</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>N° {p.numero}</span>
      </footer>
    </article>
  )
}

/* LISTO (opción A · Celebrar del lienzo, con el verde suavizado): un saludo con su nombre sobre el
   mismo menta claro de «Sale ✈ Vuelve a trabajar», las fechas del viaje y lo importante en tres
   cifras. Sin un verde que grite: el menta queda en el avión y el botón. */
function Enviada({ persona, desde, hasta, regreso, n, quedan, numero, onVer, onVolver, listoTexto }) {
  const nombre = (persona?.name || '').split(' ')[0]
  const cifra = (valor, rotulo, chip) => (
    <span style={{ background: C.carta, boxShadow: 'var(--in-sombra)', borderRadius: 12, padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, textAlign: 'center' }}>
      {chip
        ? <b style={{ fontSize: 7.6, fontWeight: 700, color: '#9A5B06', background: '#FFF4DE', borderRadius: 99, padding: '2px 7px', margin: '3px 0 2px' }}>{valor}</b>
        : <b style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{valor}</b>}
      <span style={{ fontSize: 7, color: C.mute }}>{rotulo}</span>
    </span>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minHeight: '100%', color: C.texto }}>
      <div style={{ marginTop: 6, borderRadius: 18, padding: '18px 12px 15px', background: C.viaje, border: `1px solid ${C.viajeBorde}`, color: C.viajeTxt, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
        <span className="vac-flota" aria-hidden="true" style={{ width: 34, height: 34, borderRadius: '50%', background: C.carta, color: C.avion, display: 'grid', placeItems: 'center', fontSize: 15, marginBottom: 7, boxShadow: '0 6px 14px -8px rgba(0,184,118,.7)' }}>✈</span>
        <b style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.01em' }}>¡Listo{nombre ? `, ${nombre}` : ''}!</b>
        <span style={{ fontSize: 8.6, color: C.mute }}>Su solicitud ya está con RR.HH.</span>
      </div>

      <Viaje desde={desde} hasta={hasta} n={n} enTarjeta />
      {/* El regreso, aparte y en navy: el día en que ya trabaja. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderRadius: 12, padding: '8px 11px', border: `1.2px solid ${C.texto}`, marginTop: -2 }}>
        <span style={{ fontSize: 7.4, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: C.mute }}>Vuelve a trabajar</span>
        <b style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-.01em' }}>{fechaCompleta(regreso).replace(/ de \d{4}$/, '')}</b>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {cifra(n, n === 1 ? 'día hábil' : 'días hábiles')}
        {cifra(quedan, 'saldo después')}
        {cifra('Por aprobar', 'estado', true)}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <button type="button" onClick={onVer} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 8.8, fontWeight: 600, color: C.acentoTxt, cursor: 'pointer' }}>
          <FileText size={11} /> Ver papeleta N° {numero}
        </button>
        <button type="button" onClick={onVolver} style={{ ...BOTON, width: '100%', height: 34 }}>{listoTexto}</button>
      </div>
    </div>
  )
}
