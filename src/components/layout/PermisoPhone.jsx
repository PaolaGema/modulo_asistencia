import { useRef, useState } from 'react'
import { Award, Gift, Baby, BookOpen, ChevronLeft, ChevronRight, Clock, FileText, Heart, HeartHandshake, Paperclip, Stethoscope, Users } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import BarraVolver from './BarraVolver'
import HoraCel from './HoraCel'
import {
  SUBTIPOS_PERMISO, esHabil, diasHabiles, habilSiguiente, sumarDias, diaISO, aFecha, MESES, DIAS_LARGOS,
  mesDe, mesVecino, nombreMes, aMin, duracion, semanasDe,
} from '../../data/asistenciaData'

/* ── SOLICITAR PERMISO O LICENCIA, DESDE EL INICIO (opción P1 «Primero qué, después cuándo») ──
   Como pedir un certificado: primero qué necesita —permisos y licencias en dos grupos—; después el
   calendario de la vacación, que se adapta: un PERMISO es un día —entero o unas horas— o varios días;
   una LICENCIA es un rango, con los días que da la ley ya contados y el respaldo para subir ahora o
   después. Los días del mes vecino se ven en el calendario, así un pedido que cruza de mes se elige junto. Al final,
   la misma hoja de la vacación para revisar y «Solicitar». Lo revisa RR.HH. en Asistencia › Solicitudes. */

const C = {
  texto: 'var(--in-texto)', mute: 'var(--in-mute)', suave: 'var(--in-suave)', carta: 'var(--in-carta)', sombra: 'var(--in-sombra)',
  vCarta: 'var(--in-vac-carta)', vBorde: 'var(--in-vac-borde)', viaje: 'var(--in-vac-viaje)', viajeBorde: 'var(--in-vac-viaje-borde)',
  viajeTxt: 'var(--in-vac-viaje-txt)', viajeRotulo: 'var(--in-vac-viaje-rotulo)', avion: 'var(--in-vac-avion)',
  punta: 'var(--in-vac-punta)', puntaTxt: 'var(--in-vac-punta-txt)', puntaSombra: 'var(--in-vac-punta-sombra)', cinta: 'var(--in-vac-cinta)', separador: 'var(--in-vac-separador)',
}
const BOTON = { height: 32, border: 'none', borderRadius: 99, background: '#00E091', color: '#0C2D40', fontFamily: 'inherit', fontSize: 9.6, fontWeight: 600, cursor: 'pointer' }
const ROTULO = { fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', margin: '4px 2px -2px' }
// «lu ma mi» y no iniciales sueltas: con una letra, martes y miércoles son los dos «M».
const INICIALES = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do']
const arriba = () => document.querySelector('#marco-telefono .phone-scroll')?.scrollTo(0, 0)
const dias = n => `${n} ${n === 1 ? 'día' : 'días'}`
const corto = s => `${DIAS_LARGOS[diaISO(s)].slice(0, 3)} ${aFecha(s).getDate()} ${MESES[aFecha(s).getMonth()].slice(0, 3)}`
const largo = s => { const t = `${DIAS_LARGOS[diaISO(s)]} ${aFecha(s).getDate()} de ${MESES[aFecha(s).getMonth()]}`; return t[0].toUpperCase() + t.slice(1) }

/* Lo que la app sabe de cada tipo: su ícono, una línea, los días que da la ley (`habiles` cuenta solo
   días de trabajo; si no, corridos) y el papel que lo respalda. Sin `dias`, el rango lo elige la persona. */
const INFO = {
  medico: { Icono: Stethoscope, linea: 'Unas horas, el día o varios días' },
  tramite: { Icono: FileText, linea: 'Banco, notaría, carnet…' },
  familiar: { Icono: Users, linea: 'Reunión del colegio, un familiar…' },
  estudio: { Icono: BookOpen, linea: 'Clases o un examen' },
  /* El reposo médico corre en días corridos, fines de semana y feriados incluidos. */
  'lic-medica': { Icono: Heart, linea: 'Los días que indique el médico', corridos: true, respaldo: 'Certificado médico' },
  maternidad: { Icono: Baby, linea: '90 días corridos', dias: 90, respaldo: 'Certificado médico prenatal' },
  paternidad: { Icono: Baby, linea: '3 días hábiles', dias: 3, habiles: true, respaldo: 'Certificado de nacimiento' },
  duelo: { Icono: HeartHandshake, linea: '3 días hábiles', dias: 3, habiles: true, respaldo: 'Certificado de defunción' },
  matrimonio: { Icono: Award, linea: '3 días hábiles', dias: 3, habiles: true, respaldo: 'Certificado de matrimonio' },
  cumpleanos: { Icono: Gift, linea: 'Un día libre en su mes de cumpleaños' },
}

/* El ejemplo del motivo, según lo que pide. */
const EJEMPLO = { medico: 'control con el traumatólogo', tramite: 'renovar el carnet', familiar: 'reunión en el colegio de mi hijo', estudio: 'examen de la maestría', 'lic-medica': 'reposo indicado por el médico', maternidad: 'nacimiento previsto para el 20 de diciembre', paternidad: 'nacimiento de mi hija', duelo: 'fallecimiento de un familiar', matrimonio: 'mi matrimonio civil', cumpleanos: 'mi cumpleaños' }

function finDe(desde, info, h) {
  if (!info.dias) return desde
  if (!info.habiles) return sumarDias(desde, info.dias - 1)
  let d = desde, k = esHabil(d, h) ? 1 : 0
  while (k < info.dias) { d = sumarDias(d, 1); if (esHabil(d, h)) k++ }
  return d
}

/* `inicial`: { tipo, desde } para llegar con el pedido ya armado (el día de cumpleaños desde Mis beneficios):
   se salta «¿Qué necesita?» y el «volver» de las fechas sale de vuelta a donde se abrió. */
export default function SolicitarPermisoPhone({ onVolver, volverA = 'Inicio', onListo, listoTexto = 'Volver al inicio', inicial }) {
  const at = useAsistencia()
  const yo = at.yo
  const h = yo.horario
  const { empresa } = useOnboardingData()
  const [tipo, setTipo] = useState(inicial?.tipo || null)
  const [paso, setPaso] = useState(inicial ? 'fechas' : 'tipo')
  const [ym, setYm] = useState(mesDe(inicial?.desde || at.hoy))
  const [desde, setDesde] = useState(inicial?.desde || null)
  const [hasta, setHasta] = useState(null)
  const [eligiendoFin, setEligiendoFin] = useState(false)
  const [porHoras, setPorHoras] = useState(!inicial)
  const [horaDesde, setHoraDesde] = useState('15:00')
  const [horaHasta, setHoraHasta] = useState('17:00')
  const [respaldo, setRespaldo] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [enviada, setEnviada] = useState(null)
  const archivo = useRef(null)

  const sub = SUBTIPOS_PERMISO.find(s => s.key === tipo)
  const info = INFO[tipo] || {}
  const licencia = !!sub?.licencia
  // Una licencia médica puede empezar unos días atrás: el reposo ya corre cuando se avisa.
  const minimo = tipo === 'lic-medica' ? sumarDias(at.hoy, -7) : at.hoy
  const fin = hasta || desde
  const corridos = licencia && !info.habiles && (info.dias || info.corridos)
  const n = !desde ? 0 : corridos ? Math.round((aFecha(fin) - aFecha(desde)) / 864e5) + 1 : diasHabiles(desde, fin, h)
  // Las horas son de un permiso de un solo día; con varios días, son días enteros.
  const unDia = !!desde && fin === desde
  // El día de cumpleaños es un día entero: no tiene horas.
  const conHoras = !licencia && unDia && porHoras && tipo !== 'cumpleanos'
  const regreso = desde && licencia ? habilSiguiente(fin, h) : null
  const horasOk = !conHoras || aMin(horaHasta) > aMin(horaDesde)
  const listo = !!desde && (licencia ? n > 0 : horasOk)
  const ir = p => { setPaso(p); arriba() }

  const elegirTipo = k => { setTipo(k); setDesde(null); setHasta(null); setEligiendoFin(false); setRespaldo(null); setPorHoras(!SUBTIPOS_PERMISO.find(s => s.key === k)?.licencia); ir('fechas') }

  /* Una licencia con días de ley: el primero y el resto se cuentan solos. Un permiso o una licencia
     médica: el primero y, si son varios, el último, como la vacación. */
  const tocar = d => {
    if (info.dias) { setDesde(d); setHasta(finDe(d, info, h)); return }
    if (!eligiendoFin || !desde || d < desde) { setDesde(d); setHasta(null); setEligiendoFin(true); return }
    setHasta(d === desde ? null : d); setEligiendoFin(false)
  }

  const enviar = () => {
    at.crearSolicitud({
      tipo: 'permiso', subtipo: tipo, personaId: yo.id, desde, hasta: fin,
      ...(conHoras ? { horaDesde, horaHasta } : {}),
      motivo: motivo.trim() || sub.label, ...(respaldo ? { respaldo } : {}), solicitada: new Date().toISOString(),
    })
    setEnviada(true); arriba()
  }

  if (enviada) {
    const nombre = (yo.name || '').split(' ')[0]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minHeight: '100%', color: C.texto }}>
        <div style={{ marginTop: 6, borderRadius: 18, padding: '18px 12px 15px', background: C.viaje, border: `1px solid ${C.viajeBorde}`, color: C.viajeTxt, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
          <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: '50%', background: C.carta, color: C.avion, display: 'grid', placeItems: 'center', marginBottom: 7, boxShadow: '0 6px 14px -8px rgba(0,184,118,.7)' }}><info.Icono size={15} /></span>
          <b style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.01em' }}>¡Listo{nombre ? `, ${nombre}` : ''}!</b>
          <span style={{ fontSize: 8.6, color: C.mute }}>Su solicitud ya está con RR.HH.</span>
        </div>
        <Cabecera sub={sub} info={info} licencia={licencia} desde={desde} fin={fin} n={n} porHoras={conHoras} corridos={corridos} horaDesde={horaDesde} horaHasta={horaHasta} enTarjeta />
        {licencia && respaldo == null && info.respaldo && (
          <span style={{ fontSize: 7.8, color: C.mute, textAlign: 'center', lineHeight: 1.5 }}>Recuerde subir el {info.respaldo.toLowerCase()} desde Mis solicitudes.</span>
        )}
        <button type="button" onClick={onListo || onVolver} style={{ ...BOTON, width: '100%', height: 34, marginTop: 'auto' }}>{listoTexto}</button>
      </div>
    )
  }

  /* ── PASO 1 · ¿QUÉ NECESITA? ── */
  if (paso === 'tipo') {
    const grupo = (titulo, lista) => (
      <>
        <span style={ROTULO}>{titulo}</span>
        <div style={{ background: C.carta, borderRadius: 15, boxShadow: C.sombra, overflow: 'hidden' }}>
          {lista.map((s, i) => {
            const I = INFO[s.key]
            return (
              <button key={s.key} type="button" onClick={() => elegirTipo(s.key)} style={{
                display: 'grid', gridTemplateColumns: '28px 1fr auto 10px', gap: 9, alignItems: 'center', width: '100%', padding: '8px 10px',
                border: 'none', borderTop: i ? '1px solid var(--in-linea)' : 'none', background: 'none', fontFamily: 'inherit', textAlign: 'left', color: C.texto, cursor: 'pointer',
              }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px #00E091', display: 'grid', placeItems: 'center' }}><I.Icono size={12} strokeWidth={1.8} /></span>
                <span style={{ display: 'grid', minWidth: 0 }}>
                  <b style={{ fontSize: 9, fontWeight: 500 }}>{s.label}</b>
                  <span style={{ fontSize: 7.2, color: C.mute }}>{I.linea}</span>
                </span>
                {I.respaldo ? <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 7px', background: 'var(--tn-gris)', color: 'var(--tx-gris)' }}>Respaldo</em> : <span />}
                <ChevronRight size={11} style={{ color: C.suave }} />
              </button>
            )
          })}
        </div>
      </>
    )
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: C.texto }}>
        <BarraVolver texto={volverA} onVolver={onVolver} conTema />
        <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em', margin: '-2px 2px 0' }}>¿Qué necesita?</b>
        <span style={{ fontSize: 7.4, color: C.mute, margin: '-5px 2px 2px', lineHeight: 1.5 }}>Un permiso es por horas o un día; una licencia, por días y con respaldo.</span>
        {grupo('Permiso', SUBTIPOS_PERMISO.filter(s => !s.licencia && !s.beneficio))}
        <div style={{ height: 4 }} />
        {grupo('Licencia', SUBTIPOS_PERMISO.filter(s => s.licencia))}
      </div>
    )
  }

  /* ── PASO 3 · REVISAR ── */
  if (paso === 'revisar') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: C.texto, minHeight: '100%' }}>
        <BarraVolver texto="Fechas" onVolver={() => ir('fechas')} conTema />
        <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>Revise su solicitud</b>
        <Hoja at={at} yo={yo} empresa={empresa} sub={sub} licencia={licencia} desde={desde} fin={fin} n={n} regreso={regreso}
          porHoras={conHoras} corridos={corridos} horaDesde={horaDesde} horaHasta={horaHasta} respaldo={respaldo} info={info} motivo={motivo.trim()} />
        <label style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
          <span style={{ fontSize: 7.6, color: C.mute }}>Motivo (opcional)</span>
          <input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder={`Ej.: ${EJEMPLO[tipo] || 'el motivo'}`}
            style={{ border: 'none', borderBottom: '1px solid var(--in-campo)', background: 'none', padding: '3px 0 5px', fontFamily: 'inherit', fontSize: 9, color: C.texto, outline: 'none' }} />
        </label>
        <div style={{ position: 'sticky', bottom: -10, marginTop: 'auto', paddingTop: 8, paddingBottom: 2, background: 'var(--in-fondo)', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <button type="button" onClick={enviar} style={{ ...BOTON, width: '100%', height: 34, boxShadow: '0 8px 16px -10px rgba(0,184,118,.9)' }}>Solicitar</button>
          <span style={{ fontSize: 7.4, color: C.mute, textAlign: 'center' }}>Se envía a RR.HH. para su aprobación.</span>
        </div>
      </div>
    )
  }

  /* ── PASO 2 · CUÁNDO: el calendario de la vacación ── */
  const celdas = semanasDe(ym)
  const primerMes = ym <= mesDe(minimo)
  const ayuda = !desde ? (info.dias ? `Toque el primer día: la ley da ${info.linea}.` : licencia ? 'Toque el primer día de reposo y después el último.' : 'Toque el día del permiso. Si son varios, toque también el último.')
    : eligiendoFin && !info.dias ? (licencia ? 'Toque el último día.' : 'Si es más de un día, toque el último.')
      : licencia ? `Vuelve a trabajar el ${largo(regreso).toLowerCase()}.` : null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: C.texto }}>
      <BarraVolver texto={inicial ? volverA : '¿Qué necesita?'} onVolver={inicial ? onVolver : () => ir('tipo')} conTema />
      <div style={{ background: C.vCarta, border: `1px solid ${C.vBorde}`, borderRadius: 22, boxShadow: 'var(--in-sombra)', padding: '9px 10px 10px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <Cabecera sub={sub} info={info} licencia={licencia} desde={desde} fin={fin} n={n} porHoras={conHoras} corridos={corridos} horaDesde={horaDesde} horaHasta={horaHasta} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <button type="button" aria-label="Mes anterior" disabled={primerMes} onClick={() => setYm(mesVecino(ym, -1))} style={flecha(primerMes)}><ChevronLeft size={12} /></button>
            <b style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-.02em' }}>
              {nombreMes(ym)[0].toUpperCase() + nombreMes(ym).slice(1, -5)} <span style={{ fontWeight: 400, opacity: 0.45 }}>{ym.slice(0, 4)}</span>
            </b>
            <button type="button" aria-label="Mes siguiente" onClick={() => setYm(mesVecino(ym, 1))} style={flecha(false)}><ChevronRight size={12} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 6, textAlign: 'center' }}>
            {INICIALES.map((l, i) => <span key={i} style={{ fontSize: 7, fontWeight: 600, letterSpacing: '.06em', opacity: 0.45, paddingBottom: 2 }}>{l}</span>)}
            {celdas.map((d, i) => <Dia key={d} d={d} col={i % 7} desde={desde} fin={fin} habil={esHabil(d, h)} off={d < minimo} vecino={!d.startsWith(ym)} onTocar={tocar} />)}
          </div>
          {ayuda && <p style={{ margin: '8px 0 0', fontSize: 7.8, color: C.mute, textAlign: 'center' }}>{ayuda}</p>}
        </div>

        {/* Un permiso de un día: entero o unas horas, con la hora del teléfono. */}
        {!licencia && unDia && tipo !== 'cumpleanos' && (
          <>
            <div role="group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, background: 'var(--in-fondo)', borderRadius: 99, padding: 3 }}>
              {[[false, 'Todo el día'], [true, 'Unas horas']].map(([v, t]) => (
                <button key={t} type="button" aria-pressed={porHoras === v} onClick={() => setPorHoras(v)} style={{ height: 22, borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 8, fontWeight: 600, cursor: 'pointer', background: porHoras === v ? '#0C2D40' : 'transparent', color: porHoras === v ? '#fff' : C.mute }}>{t}</button>
              ))}
            </div>
            {conHoras && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[['Desde', horaDesde, setHoraDesde, 'izq'], ['Hasta', horaHasta, setHoraHasta, 'der']].map(([k, v, f, lado]) => (
                  <div key={k} style={{ display: 'grid', gap: 3, fontSize: 7.2, color: C.mute }}>{k}
                    <HoraCel valor={v} onCambio={f} titulo={k} ariaLabel={k} alinear={lado}
                      estilo={{ width: '100%', boxSizing: 'border-box', height: 26, padding: '0 9px', borderRadius: 10, border: 'none', background: 'var(--in-fondo)', fontFamily: 'inherit', fontSize: 8.4, fontWeight: 500, color: C.texto, outline: 'none' }} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Una licencia: el papel que la respalda, ahora o después. */}
        {licencia && info.respaldo && desde && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px', borderRadius: 12, background: 'var(--in-calendario)' }}>
            <Paperclip size={13} style={{ color: '#0A7F55', flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
              <b style={{ fontSize: 8.4, fontWeight: 600 }}>{info.respaldo}</b>
              <small style={{ fontSize: 6.8, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{respaldo || 'Puede subirlo ahora o después, hasta 5 días.'}</small>
            </span>
            <input ref={archivo} type="file" accept="image/*,application/pdf" hidden onChange={e => setRespaldo(e.target.files?.[0]?.name || null)} />
            <button type="button" onClick={() => archivo.current?.click()} style={{ height: 22, padding: '0 10px', borderRadius: 99, border: 'none', background: C.carta, boxShadow: '0 0 0 1.2px #00E091', fontFamily: 'inherit', fontSize: 7.6, fontWeight: 600, color: '#0A7F55', cursor: 'pointer', flexShrink: 0 }}>{respaldo ? 'Cambiar' : 'Subir'}</button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderTop: `1px solid ${C.separador}`, paddingTop: 9 }}>
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: 7.4, color: C.mute }}>{licencia ? 'Días de licencia' : unDia || !desde ? 'Es un permiso' : 'Días de permiso · no descuenta vacaciones'}</span>
            <b style={{ fontSize: 10.4, fontWeight: 700, letterSpacing: '-.01em', whiteSpace: 'nowrap' }}>
              {licencia ? (desde ? dias(n) : '—') : unDia || !desde ? 'No descuenta vacaciones' : dias(n)}
            </b>
          </span>
          <button type="button" disabled={!listo} onClick={() => ir('revisar')}
            style={{ ...BOTON, padding: '0 18px', flexShrink: 0, ...(listo ? { boxShadow: '0 8px 16px -10px rgba(0,184,118,.9)' } : { background: 'var(--in-boton-off)', color: C.suave, cursor: 'default' }) }}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

const flecha = off => ({ width: 22, height: 22, display: 'grid', placeItems: 'center', border: 'none', borderRadius: '50%', background: 'none', color: 'inherit', opacity: off ? 0.2 : 0.6, cursor: off ? 'default' : 'pointer' })

/* El día del calendario: las puntas en navy y el medio en la cinta menta, como la vacación. */
function Dia({ d, col, desde, fin, habil, off, vecino, onTocar }) {
  const varios = desde && fin !== desde
  const punta = d === desde || d === fin
  const dentro = desde && d > desde && d < fin
  const inicio = varios && d === desde && col !== 6
  const final = varios && d === fin && col !== 0
  const fondo = inicio ? `linear-gradient(90deg, transparent 50%, ${C.cinta} 50%)` : final ? `linear-gradient(90deg, ${C.cinta} 50%, transparent 50%)` : dentro ? C.cinta : 'transparent'
  return (
    <span style={{ height: 25, display: 'grid', placeItems: 'center', background: fondo, borderRadius: dentro && col === 0 ? '99px 0 0 99px' : dentro && col === 6 ? '0 99px 99px 0' : 0 }}>
      <button type="button" disabled={off} onClick={() => onTocar(d)} aria-pressed={punta || !!dentro} aria-label={corto(d)} style={{
        width: 23, height: 23, borderRadius: '50%', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 9, fontVariantNumeric: 'tabular-nums',
        fontWeight: punta ? 700 : dentro ? 600 : 400, color: punta ? C.puntaTxt : C.texto, background: punta ? C.punta : 'transparent', boxShadow: punta ? C.puntaSombra : 'none',
        opacity: off && !punta ? 0.28 : vecino && !punta && !dentro ? 0.4 : !habil && !punta && !dentro ? 0.5 : 1, cursor: off ? 'default' : 'pointer',
      }}>{aFecha(d).getDate()}</button>
    </span>
  )
}

/* Arriba del calendario: qué es y cuándo, en el menta claro de «De vacaciones». */
function Cabecera({ sub, info, licencia, desde, fin, n, porHoras, corridos, horaDesde, horaHasta, enTarjeta }) {
  const titulo = !desde ? (licencia ? 'Elija los días' : 'Elija el día')
    : fin !== desde || licencia ? (fin !== desde ? `${corto(desde)[0].toUpperCase()}${corto(desde).slice(1)} – ${corto(fin)}` : largo(desde)) : largo(desde)
  const linea = !desde ? info.linea
    : licencia || fin !== desde ? `${dias(n)}${corridos ? ' corridos' : ' hábiles'}`
      : porHoras && aMin(horaHasta) > aMin(horaDesde) ? `${horaDesde} a ${horaHasta} · ${duracion(aMin(horaHasta) - aMin(horaDesde))}` : 'Todo el día'
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2, borderRadius: enTarjeta ? 14 : 15, padding: '8px 11px 9px', color: C.viajeTxt,
      background: enTarjeta ? C.carta : C.viaje, border: `1px solid ${enTarjeta ? 'transparent' : C.viajeBorde}`, boxShadow: enTarjeta ? 'var(--in-sombra)' : 'none',
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 6.6, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: C.viajeRotulo }}>
        <Clock size={10} strokeWidth={2} style={{ color: C.avion }} aria-hidden="true" />{licencia ? sub.label : `Permiso · ${sub.label}`}
      </span>
      <b style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-.02em' }}>{titulo}</b>
      {linea && <span style={{ fontSize: 7.6, color: C.mute }}>{linea}</span>}
    </div>
  )
}

/* LA HOJA (la papeleta de la vacación, opción I2): datos del trabajador y lo pedido en filas de dos
   columnas, con el horario o los días en la fila menta. */
const P = { navy: '#0C2D40', menta: '#00E091', mentaTxt: '#0A7F55', gris: '#6B7C8A', suave: '#9AABBB', borde: '#E6ECF1', linea: '#EEF2F5', fondoMenta: '#F3FBF7' }
function Hoja({ at, yo, empresa, sub, licencia, desde, fin, n, regreso, porHoras, corridos, horaDesde, horaHasta, respaldo, info, motivo }) {
  const nombreEmpresa = empresa?.razonSocial || empresa?.nombre || 'FarmaVida S.A.'
  const sigla = (nombreEmpresa.split(' ')[0].match(/[A-ZÁÉÍÓÚÑ]/g) || ['S']).slice(0, 2).join('')
  const numero = `${at.hoy.slice(0, 4)}-${String(at.solicitudes.filter(s => s.tipo === 'permiso').length + 1).padStart(4, '0')}`
  const sucursal = at.lugarPorId.get(yo.sucursalId)?.nombre || yo.sedeNombre
  const celda = (k, v, ancho, destacado) => (
    <div style={{ gridColumn: ancho ? '1 / -1' : undefined, display: 'flex', flexDirection: 'column', padding: '4px 7px', borderBottom: `1px solid ${P.linea}`, background: destacado ? '#F7FAFC' : 'transparent', minWidth: 0 }}>
      <span style={{ fontSize: 6.2, color: P.gris }}>{k}</span>
      <b style={{ fontSize: destacado ? 9 : 8, fontWeight: destacado ? 700 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</b>
    </div>
  )
  const seccion = (num, t) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 6.8, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
      <i style={{ width: 13, height: 13, borderRadius: '50%', background: P.navy, color: '#fff', display: 'grid', placeItems: 'center', fontStyle: 'normal', fontSize: 6.8, letterSpacing: 0 }}>{num}</i>
      {t}<span style={{ flex: 1, height: 1, background: P.linea }} />
    </span>
  )
  const filas = [
    ['Tipo', sub.label],
    ...(fin !== desde ? [['Desde', largo(desde)], ['Hasta', largo(fin)]] : [['El día', largo(desde)]]),
    licencia || fin !== desde ? ['Días', `${dias(n)}${corridos ? ' corridos' : ' hábiles'}`, true]
      : ['Horario', porHoras ? `${horaDesde} a ${horaHasta} · ${duracion(aMin(horaHasta) - aMin(horaDesde))}` : 'Todo el día', true],
    ...(licencia ? [['Vuelve a trabajar', largo(regreso)]] : []),
    ...(info.respaldo ? [['Respaldo', respaldo || `${info.respaldo} · lo sube después`]] : []),
    ...(motivo ? [['Motivo', motivo]] : []),
  ]
  return (
    <article className="papel-claro" style={{ background: '#fff', color: P.navy, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 0 #E3EAF0, 0 18px 32px -24px rgba(12,45,64,.6)' }}>
      <header style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 7, alignItems: 'center', padding: '10px 11px', borderBottom: `1px solid ${P.linea}` }}>
        <span style={{ width: 25, height: 25, borderRadius: 7, background: P.navy, color: P.menta, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 8.4 }}>{sigla}</span>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <b style={{ fontSize: 8.8, letterSpacing: '-.01em' }}>{nombreEmpresa}</b>
          <span style={{ fontSize: 6.2, color: P.gris }}>{empresa?.nit ? `NIT ${empresa.nit} · ` : ''}Recursos Humanos</span>
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 6.2, color: P.gris }}>Papeleta de {licencia ? 'licencia' : 'permiso'}</span>
          <b style={{ fontSize: 8.4, color: P.mentaTxt, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>N° {numero}</b>
        </span>
      </header>
      <div style={{ padding: '10px 11px 4px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <b style={{ textAlign: 'center', fontSize: 8.4, letterSpacing: '.14em', textTransform: 'uppercase' }}>Solicitud de {licencia ? 'licencia' : 'permiso'}</b>
        {seccion(1, 'Datos del trabajador')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${P.borde}`, borderRadius: 7, overflow: 'hidden', marginTop: -3 }}>
          {celda('Nombre completo', yo.name, true, true)}
          {celda('CI', yo.documento || '—')}
          {celda('Fecha de ingreso', yo.ingreso ? `${aFecha(yo.ingreso).getDate()} ${MESES[aFecha(yo.ingreso).getMonth()].slice(0, 3)} ${yo.ingreso.slice(0, 4)}` : '—')}
          {celda('Cargo', yo.cargo || '—', true)}
          {celda('Unidad organizacional', yo.unidad || '—')}
          {celda('Sucursal', sucursal || '—')}
        </div>
        {seccion(2, licencia ? 'Licencia solicitada' : 'Permiso solicitado')}
        <div style={{ border: `1px solid ${P.borde}`, borderRadius: 7, overflow: 'hidden', marginTop: -3 }}>
          {filas.map(([k, v, menta], i) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '42% 1fr', gap: 8, alignItems: 'baseline', padding: '5px 8px', borderTop: i ? `1px solid ${P.linea}` : 'none', background: menta ? P.fondoMenta : 'transparent' }}>
              <span style={{ fontSize: 6.6, color: P.gris }}>{k}</span>
              <b style={{ fontSize: 8, fontWeight: 600, color: menta ? P.mentaTxt : P.navy, overflowWrap: 'anywhere' }}>{v}</b>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 6 }}>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
            <span style={{ alignSelf: 'stretch', height: 20, borderBottom: `1px solid ${P.navy}` }} />
            <b style={{ fontSize: 7.6, marginTop: 3 }}>{yo.name}</b>
            <span style={{ fontSize: 6.2, color: P.gris }}>Solicitante</span>
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
        <span>Generado por SoulyHR con los datos del expediente</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>N° {numero}</span>
      </footer>
    </article>
  )
}
