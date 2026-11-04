import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LogIn, LogOut, Coffee, X, Check, ScanFace, MapPin, House, ChevronLeft, ChevronRight, RotateCcw, Navigation, Clock, Plus, PencilLine } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { fotoDe } from '../../pages/personas/colaboradoresData'
import { avatarUrl } from '../../utils/calendarEvents'
import viaSaludando from '../../assets/imagenes/via_saludando.png'
import { ahora, TIPOS_MARCA, ESTADOS_EXTRA, esAutorizada, fechaLarga, fechaCorta, nombreMes, mesVecino, hhmm, aMin, duracion, hoyISO, diasDelMes, mesDe, sumarDias, accionDelMomento, ETIQUETA_MARCA, ESTADOS, DIAS_CORTOS, diaISO, aFecha, semanasDe } from '../../data/asistenciaData'
import ConfirmarMarca from './ConfirmarMarca'
import BarraVolver from '../layout/BarraVolver'
import FechaCel from '../layout/FechaCel'
import HoraCel from '../layout/HoraCel'

/* ── EL MARCADOR DEL COLABORADOR ───────────────────────────────────────────
   La pantalla que se abre diez veces por semana, así que tiene una sola cosa grande: el botón de lo
   que toca ahora —entrar, salir, volver de la pausa—. Todo lo demás es contexto chico.

   MARCAR SON TRES PASOS Y SE VEN LOS TRES: ubicación, rostro, listo. Cada uno dice qué está
   comprobando y por qué falla si falla («estás a 640 m de Casa Matriz»), en vez del «error» genérico.

   SE MIDE EN `em`. El mismo componente vive en la página de escritorio y dentro del teléfono de la
   demo, que está dibujado a escala: el contenedor pone el tamaño de letra y todo lo demás lo sigue.

   EL CONSENTIMIENTO DICE LA VERDAD (riesgo P1): que cada marcación sube una selfie reducida, y
   cuántos días se guarda. */

const PASO_MS = 1700

function useHora() {
  const [t, setT] = useState(() => ahora())
  useEffect(() => { const i = setInterval(() => setT(ahora()), 1000); return () => clearInterval(i) }, [])
  return t
}

/* `telefono`: la versión del celular (lienzo «Cómo cambia la tarjeta al marcar», M1 sin la línea de color
   arriba). La página de escritorio sigue con la tarjeta K1. `volverA` es el texto de la barra de volver. */
export default function Marcador({ onVolver, iniciar = null, telefono = false, volverA = 'Zona HR' }) {
  const at = useAsistencia()
  const yo = at.yo
  const t = useHora()
  const j = at.jornadaDe(yo, at.hoy)
  /* `iniciar` llega del botón del inicio del teléfono: abre directo el paso que toca. */
  const ahora = t.getHours() * 60 + t.getMinutes()
  const acc = accionDelMomento(j, yo.horario, ahora)
  /* Viniendo del inicio del teléfono (`iniciar`) ya se confirmó en la ventana: va directo al escaneo. */
  const [flujo, setFlujo] = useState(iniciar ? { tipo: iniciar } : null) // { tipo }
  const ex = at.exigenciasDe(yo, at.hoy)
  /* Un toque abre la ventana «Vas a marcar…» (V2): ahí se avisa el atraso, la salida antes de tiempo,
     la pausa pasada. El escaneo empieza al confirmarla. */
  const [hoja, setHoja] = useState(null)
  /* En el teléfono, «Ver el mes» cambia la pantalla por el calendario del mes. */
  const [verMes, setVerMes] = useState(false)
  /* El «+» del saludo (lienzo H1): su menú y la pantalla «Pedir horas extra». */
  const [menuMas, setMenuMas] = useState(false)
  const [verExtra, setVerExtra] = useState(false)
  /* Corregir una marcación: null, o { fecha } del día desde el que se pidió. */
  const [corregir, setCorregir] = useState(null)
  const [avisoExtra, setAvisoExtra] = useState(null)
  /* La ventana se centra en el teléfono de la demo si el marcador vive ahí, y en la pantalla si no. */
  const raiz = useRef(null)
  const [enTelefono, setEnTelefono] = useState(null)
  const pedir = tipo => {
    setEnTelefono(raiz.current?.closest('#marco-telefono') || null)
    setHoja(tipo)
  }

  const siguiente = acc.principal
  const validas = j.marcas.filter(m => !m.rechazada && !m.anulada)
  const mes = diasDelMes(mesDe(at.hoy)).filter(d => d < at.hoy).map(d => at.jornadaDe(yo, d)).filter(x => x.estado !== 'libre')
  const saldo = mes.reduce((s, x) => s + x.trabajado - x.programado, 0)
  const nombre = yo.name.split(' ')[0]
  const extraHoy = at.horasExtra.find(x => String(x.personaId) === String(yo.id) && x.fecha === at.hoy && esAutorizada(x))
  const h = t.getHours()

  /* ── LO QUE PINTA LA TARJETA K1 ── el momento del día, la regla del turno, los tres datos y el recorrido. */
  const k1 = (() => {
    const hr = yo.horario
    if (!hr) return { momento: 'antes', marcasHora: [], datos: [], recorrido: [] }
    const ahoraMin = t.getHours() * 60 + t.getMinutes()
    const fijo = hr.modo === 'fijo'
    const A = fijo ? aMin(hr.entrada) : 9 * 60
    const B = fijo ? aMin(hr.salida) : 18 * 60
    const pct = m => Math.max(0, Math.min(100, ((m - A) / (B - A)) * 100))
    const pi = validas.filter(m => m.tipo === 'pausa_inicio')
    const pf = validas.filter(m => m.tipo === 'pausa_fin')
    const iniPausa = pi[pi.length - 1]; const finPausa = iniPausa ? pf.find(m => m.min >= iniPausa.min) : null
    const momento = j.salida != null ? 'fin' : j.enPausa ? 'pausa' : j.entrada != null ? 'turno' : 'antes'
    const dur = hr.pausa || 0
    const pausaPlan = dur ? [Math.round((A + B) / 2 - dur / 2), Math.round((A + B) / 2 + dur / 2)] : null
    const pausaReal = iniPausa ? [iniPausa.min, finPausa ? finPausa.min : ahoraMin] : null
    const pausa = (pausaReal || pausaPlan) && (pausaReal || pausaPlan).map(pct)
    const finLleno = j.salida != null ? j.salida : j.enPausa && iniPausa ? iniPausa.min : ahoraMin
    const lleno = j.entrada != null ? [pct(j.entrada), pct(finLleno)] : null
    const ahora = momento === 'fin' || ahoraMin < A || ahoraMin > B ? null : pct(ahoraMin)
    const marcasHora = []
    for (let m = Math.ceil(A / 60) * 60; m < B; m += 60) if (m > A) marcasHora.push({ h: m, x: pct(m), larga: (m / 60) % 3 === 0 })

    const vuelve = iniPausa && dur ? iniPausa.min + dur : null
    const chip = momento === 'pausa' ? `En pausa desde las ${hhmm(iniPausa?.min ?? ahoraMin)}`
      : momento === 'turno' ? `En turno desde las ${hhmm(j.entrada)}`
        : !j.laboral ? 'Hoy no tiene jornada' : fijo && ahoraMin >= B ? `Su turno ya terminó · ${hr.entrada} a ${hr.salida}` : fijo && ahoraMin > A + (yo.politica?.tolerancia ?? 10) ? `Su entrada era a las ${hr.entrada}` : fijo ? `Su entrada es a las ${hr.entrada}` : 'Horario flexible'
    const datos = momento === 'fin' ? [['Trabajó', duracion(j.trabajado)], ['Descanso', duracion(j.pausas || 0)], ['Saldo del mes', duracion(saldo, { signo: true, corto: true }), saldo >= 0 ? 'bien' : 'mal']]
      : momento === 'pausa' ? [['Lleva de descanso', duracion(ahoraMin - (iniPausa?.min ?? ahoraMin)), 'ojo'], ['Vuelve a las', vuelve != null ? hhmm(vuelve) : '—'], vuelve != null && ahoraMin > vuelve ? ['Se pasó', duracion(ahoraMin - vuelve), 'mal'] : ['Le quedan', vuelve != null ? duracion(vuelve - ahoraMin) : '—']]
        : momento === 'turno' ? [['Lleva', duracion(j.trabajado)], ['Le quedan', duracion(acc.falta)], ['Sale', fijo ? hr.salida : '—']]
          : [['Entrada', fijo ? hr.entrada : 'Libre'], ['Descanso', dur ? `${dur} min` : '—'], ['Salida', fijo ? hr.salida : '—']]

    const tol = yo.politica?.tolerancia ?? 10
    const dif = j.entrada != null && fijo ? j.entrada - A : null
    const recorrido = [
      j.entrada != null
        ? ['ok', LogIn, 'Entrada', dif <= 0 ? `A tiempo · ${duracion(-dif)} antes` : dif <= tol ? 'Dentro de la tolerancia' : `${duracion(dif)} tarde`, hhmm(j.entrada)]
        : ['despues', LogIn, 'Entrada', 'Por marcar', fijo ? hr.entrada : '—'],
      iniPausa
        ? [finPausa ? 'ok' : 'ahora', Coffee, 'Descanso', finPausa ? duracion(finPausa.min - iniPausa.min) : 'En curso', hhmm(iniPausa.min)]
        : [momento === 'turno' && dur ? 'ahora' : 'despues', Coffee, 'Descanso', dur ? `Sugerido · ${dur} min` : 'Sin descanso', pausaPlan ? hhmm(pausaPlan[0]) : '—'],
      j.salida != null
        ? ['ok', LogOut, 'Salida', 'Jornada completa', hhmm(j.salida)]
        : ['despues', LogOut, 'Salida', 'Fin de su turno', fijo ? hr.salida : '—'],
    ]
    return { momento, chip, pausa, lleno, ahora, marcasHora, datos, recorrido, desde: fijo ? hr.entrada : '09:00', hasta: fijo ? hr.salida : '18:00' }
  })()

  /* EL FLUJO OCUPA LA PANTALLA ENTERA, no se apoya encima: en el teléfono de la demo una capa
     encima medía lo que mide todo el contenido de abajo y el texto quedaba fuera de la vista. */
  /* Si se marcó desde el inicio del teléfono (`iniciar`), al cerrar se vuelve al inicio: la persona no
     vino al marcador, vino a marcar. Desde Mi asistencia o Zona HR, se queda en el marcador. */
  const cerrarFlujo = () => { setFlujo(null); if (iniciar && onVolver) onVolver() }
  if (flujo) return <div className="at-marcador"><Flujo tipo={flujo.tipo} onCerrar={cerrarFlujo} /></div>

  const ventana = hoja && createPortal(
    <div style={{ position: enTelefono ? 'absolute' : 'fixed', inset: 0, zIndex: enTelefono ? 40 : 300, fontSize: enTelefono ? 9.4 : 15 }}>
      <ConfirmarMarca tipo={hoja} onCancelar={() => setHoja(null)} onConfirmar={t => { setFlujo({ tipo: t }); setHoja(null) }} />
    </div>, enTelefono || document.body)

  if (telefono && corregir) return <CorregirMarcaCel fecha={corregir.fecha} onVolver={() => setCorregir(null)} onEnviada={() => { setCorregir(null); setVerMes(false); setAvisoExtra('Pidió corregir una marcación. RR.HH. le responderá.') }} />
  if (telefono && verMes) return <MesCel onVolver={() => setVerMes(false)} onCorregir={fecha => setCorregir({ fecha })} />
  if (telefono && verExtra) return <PedirExtraCel onVolver={() => setVerExtra(false)} onEnviada={() => { setVerExtra(false); setAvisoExtra('Pidió horas extra. RR.HH. le responderá.') }} />
  if (telefono) {
    return (
      <div ref={raiz} style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
        {onVolver && <BarraVolver texto={volverA} onVolver={onVolver} conTema />}
        <span style={{ fontSize: 7, color: 'var(--in-mute)', margin: '-6px 2px -6px' }}>{fechaLarga(at.hoy).replace(/^./, c => c.toUpperCase())}</span>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '0 2px' }}>
          <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>
            {j.salida != null ? `¡Buen trabajo, ${nombre}!` : `${h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'}, ${nombre}`}
          </b>
          <button type="button" aria-label="Pedir algo" aria-expanded={menuMas} onClick={() => setMenuMas(v => !v)} style={{ position: 'relative', zIndex: 6, width: 24, height: 24, borderRadius: '50%', border: 'none', background: '#00E091', color: NAVY, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,184,118,.35)', transform: menuMas ? 'rotate(45deg)' : 'none', transition: 'transform .15s' }}>
            <Plus size={13} strokeWidth={2.6} />
          </button>
          {menuMas && (
            <>
              <div onClick={() => setMenuMas(false)} style={{ position: 'fixed', inset: 0, zIndex: 4 }} />
              <div role="menu" style={{ position: 'absolute', right: 0, top: 30, zIndex: 5, width: 150, background: 'var(--in-carta)', borderRadius: 11, padding: 4, display: 'grid', boxShadow: '0 0 0 1px var(--in-linea), 0 18px 32px -14px rgba(12,45,64,.55)', animation: 'vac-aparecer .15s ease-out' }}>
                {[[Clock, 'var(--tn-violeta)', 'var(--tx-violeta)', 'Pedir horas extra', 'Para quedarse más tarde', () => { setMenuMas(false); setVerExtra(true) }],
                  [PencilLine, 'var(--tn-ambar)', 'var(--tx-ambar)', 'Corregir una marcación', 'Olvidó marcar o marcó mal', () => { setMenuMas(false); setCorregir({ fecha: at.hoy }) }]].map(([Ico, bg, tx, t, sub, onClick]) => (
                  <button key={t} type="button" role="menuitem" disabled={!onClick} onClick={onClick} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 7, alignItems: 'center', padding: '6px 6px', border: 'none', borderRadius: 8, background: 'transparent', fontFamily: 'inherit', textAlign: 'left', color: 'var(--in-texto)', cursor: onClick ? 'pointer' : 'default', opacity: onClick ? 1 : 0.5 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: bg, color: tx, display: 'grid', placeItems: 'center' }}><Ico size={10} /></span>
                    <span style={{ display: 'grid' }}><b style={{ fontSize: 7.6 }}>{t}</b><small style={{ fontSize: 6, color: 'var(--in-mute)' }}>{sub}</small></span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {avisoExtra && <span style={{ fontSize: 7, fontWeight: 600, color: 'var(--tx-verde)', background: 'var(--tn-verde)', borderRadius: 9, padding: '6px 9px', display: 'flex', alignItems: 'center', gap: 5 }}><Check size={10} strokeWidth={2.6} /> {avisoExtra}</span>}
        <AsignadasCel />
        {!yo.asig || !yo.horario
          ? <div style={{ ...TARJETA_CEL, fontSize: 7.6, color: 'var(--in-mute)', textAlign: 'center' }}>Todavía no tiene un horario asignado. Pídaselo a RR.HH.</div>
          : <HoyCel j={j} acc={acc} t={t} yo={yo} extraHoy={extraHoy} validas={validas} onPedir={pedir} onDeshacer={id => at.anular(id, 'La persona deshizo su salida desde la app')} />}
        {yo.horario && <SemanaCel onMes={() => setVerMes(true)} onCorregir={fecha => setCorregir({ fecha })} />}
        {ventana}
      </div>
    )
  }

  return (
    <div className="at-marcador at-mc" ref={raiz}>
      {onVolver && (
        <button type="button" onClick={onVolver} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '.3em', border: 'none', background: 'none', color: 'var(--text-heading)', font: 'inherit', fontSize: '.8em', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
          <ChevronLeft size="1.2em" /> Asistencia
        </button>
      )}

      {/* ── K1 PULIDA («La hora manda») ── la tarjeta con la piel de «Hoy es» (borde menta y esquinas de 34;
          sin los círculos de adorno, que se pidió quitar), la hora grande y la REGLA DEL TURNO: de la entrada a la salida del
          horario, se llena con lo trabajado, la pausa va rayada y un tic marca «ahora». Cambia de tono según
          el momento: menta en turno, ámbar en pausa, y un check al terminar. */}
      <div className="at-k1-enc">
        <span>{fechaLarga(at.hoy)}</span>
        <b>{h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'}, {nombre}</b>
      </div>

      {!yo.asig || !yo.horario ? (
        <section className="at-k1"><p className="at-k1-nota">Todavía no tiene un horario asignado. Pídaselo a RR.HH.</p></section>
      ) : (
        <section className={`at-k1 ${k1.momento}`}>
          <div className="at-k1-centro">
            {k1.momento === 'fin' ? (
              <>
                <span className="at-k1-check"><Check size="1.4em" strokeWidth={3} /></span>
                <b className="at-k1-titulo">Jornada completa</b>
                <span className="at-k1-sub">Salió a las {hhmm(j.salida)} · ¡que descanse!</span>
              </>
            ) : (
              <>
                <span className={`at-k1-chip ${k1.momento}`}><i />{k1.chip}</span>
                <div className="at-k1-hora" aria-live="off">{String(h).padStart(2, '0')}:{String(t.getMinutes()).padStart(2, '0')}<small>:{String(t.getSeconds()).padStart(2, '0')}</small></div>
                <span className="at-k1-lugar"><MapPin size="1.05em" /> {ex.remotoHoy ? 'Hoy en remoto' : yo.lugar?.nombre}</span>
              </>
            )}

            <div className="at-k1-regla" aria-hidden="true">
              {k1.marcasHora.map(p => <i key={p.h} className={p.larga ? 'larga' : ''} style={{ left: `${p.x}%` }} />)}
              <span className="riel" />
              {k1.pausa && <span className="pausa" style={{ left: `${k1.pausa[0]}%`, width: `${k1.pausa[1] - k1.pausa[0]}%` }} />}
              {k1.lleno && <span className="lleno" style={{ left: `${k1.lleno[0]}%`, width: `${k1.lleno[1] - k1.lleno[0]}%` }} />}
              {k1.ahora != null && <span className="ahora" style={{ left: `${k1.ahora}%` }} />}
              <span className="extremo izq">{k1.desde}</span><span className="extremo der">{k1.hasta}</span>
            </div>

            <div className="at-k1-datos">
              {k1.datos.map(([r, v, tono]) => <span key={r}><small>{r}</small><b className={tono || ''}>{v}</b></span>)}
            </div>
            {extraHoy && <span className="at-k1-extra">Hoy tiene horas extra autorizadas de {extraHoy.desde} a {extraHoy.hasta}</span>}

            {siguiente ? (
              <div className={`at-k1-botones${acc.secundaria ? '' : ' uno'}`}>
                {acc.secundaria && <button type="button" className="sec" onClick={() => pedir(acc.secundaria)}>{acc.secundaria === 'salida' ? <LogOut size="1.15em" /> : <Coffee size="1.15em" />} {acc.secundaria === 'salida' ? 'Salida' : 'Pausa'}</button>}
                <button type="button" className="prin" onClick={() => pedir(siguiente)}>
                  {siguiente === 'salida' ? <LogOut size="1.2em" /> : siguiente === 'entrada' ? <LogIn size="1.2em" /> : <Coffee size="1.2em" />} {ETIQUETA_MARCA[siguiente]}
                </button>
              </div>
            ) : acc.deshacer && (
              /* Diez minutos para arrepentirse de una salida marcada por error: se anula, no se borra. */
              <button type="button" className="at-k1-deshacer" onClick={() => at.anular(acc.deshacer.id, 'La persona deshizo su salida desde la app')}><RotateCcw size="1.1em" /> ¿Te equivocaste? Deshacer salida</button>
            )}
          </div>
        </section>
      )}

      {/* «Tu día» como recorrido: lo hecho en menta, lo que viene en gris. */}
      {yo.horario && (
        <section className="at-k1-dia">
          <div className="cab"><b>Su día</b><span>{ex.remotoHoy ? 'Remoto' : yo.lugar?.nombre}</span></div>
          {k1.recorrido.map(([est, Icono, titulo, detalle, horaTxt], i) => (
            <div key={titulo} className={`paso ${est}`}>
              {i < k1.recorrido.length - 1 && <span className="hilo" />}
              <span className="ico"><Icono size="1.15em" /></span>
              <span className="txt"><b>{titulo}</b><small>{detalle}</small></span>
              <b className="h">{horaTxt}</b>
            </div>
          ))}
        </section>
      )}

      <MisHorasExtra />

      <DiasPasados />

      {ventana}
    </div>
  )
}

/* ── EL MARCADOR EN EL TELÉFONO (línea de DISENO_MOBILE.md) ─────────────────
   Una tarjeta blanca con todo lo de hoy: la etiqueta del momento, el reloj, los tres pasos (Entrada ·
   Pausa · Salida) y un solo botón, que siempre es lo que sigue. Cada momento tiene su color: gris sin
   nada en curso, verde trabajando o listo, ámbar en la pausa. El botón siempre es menta; cambian su
   texto y su ícono. Al terminar no hay botón: se muestra lo trabajado. */
const NAVY = '#0C2D40'
const SOMBRA_CEL = 'var(--in-sombra)'
const TARJETA_CEL = { background: 'var(--in-carta)', borderRadius: 13, padding: '10px 11px', boxShadow: SOMBRA_CEL }
const CHIP_CEL = { gris: ['var(--tn-gris)', 'var(--tx-gris)', 'var(--in-suave)'], verde: ['var(--tn-verde)', 'var(--tx-verde)', '#00B876'], ambar: ['var(--tn-ambar)', 'var(--tx-ambar)', '#F5B544'] }
const ICONO_MARCA = { entrada: LogIn, pausa_inicio: Coffee, pausa_fin: Coffee, salida: LogOut }

function HoyCel({ j, acc, t, yo, extraHoy, validas, onPedir, onDeshacer }) {
  /* Como la M3 del lienzo: solo la etiqueta del momento, el reloj y el botón. Las marcas del día y los
     pasos están al tocar el día en la semana; así la tarjeta no se llena de texto. */
  const hr = yo.horario
  const fijo = hr.modo === 'fijo'
  const ahoraMin = t.getHours() * 60 + t.getMinutes()
  const A = fijo ? aMin(hr.entrada) : null
  const B = fijo ? aMin(hr.salida) : null
  const tol = yo.politica?.tolerancia ?? 10
  const dur = hr.pausa || 0
  const pi = validas.filter(m => m.tipo === 'pausa_inicio')
  const iniPausa = pi[pi.length - 1]
  const momento = j.salida != null ? 'fin' : j.enPausa ? 'pausa' : j.entrada != null ? 'turno' : 'antes'
  /* Una entrada después de la hora de salida no es «tarde»: es fuera de horario. */
  const fueraDeHorario = j.entrada != null && fijo && j.entrada >= B
  const dif = j.entrada != null && fijo && !fueraDeHorario ? j.entrada - A : null
  const vuelve = iniPausa && dur ? iniPausa.min + dur : null

  const [tono, chip] = momento === 'fin' ? ['verde', `Día completo · ${fueraDeHorario ? 'fuera de horario' : dif != null && dif > tol ? 'llegó tarde' : 'a tiempo'}`]
    : momento === 'pausa' ? ['ambar', vuelve != null ? (ahoraMin > vuelve ? `En pausa · se pasó ${duracion(ahoraMin - vuelve)}` : `En pausa · vuelva a las ${hhmm(vuelve)}`) : `En pausa desde las ${hhmm(iniPausa?.min ?? ahoraMin)}`]
      : momento === 'turno' ? [fueraDeHorario ? 'gris' : 'verde', fueraDeHorario ? `Fuera de su horario · entró a las ${hhmm(j.entrada)}` : `Trabajando desde las ${hhmm(j.entrada)}`]
        : !j.laboral ? ['gris', 'Hoy no tiene jornada']
          : fijo && ahoraMin >= B ? ['gris', `Su turno terminó · ${hr.entrada} a ${hr.salida}`]
            : fijo && ahoraMin < A ? ['gris', `Su turno empieza en ${duracion(A - ahoraMin)}`]
              : fijo ? ['gris', ahoraMin > A + tol ? `Su entrada era a las ${hr.entrada}` : `Su entrada es a las ${hr.entrada}`] : ['gris', 'Horario flexible']
  const [chipBg, chipTx, chipPunto] = CHIP_CEL[tono]
  const reloj = <>{String(t.getHours()).padStart(2, '0')}:{String(t.getMinutes()).padStart(2, '0')}<small style={{ fontSize: 11, color: 'var(--tx-verde)', fontWeight: 700 }}>:{String(t.getSeconds()).padStart(2, '0')}</small></>
  const enlace = { border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 7, fontWeight: 700, color: 'var(--tx-verde)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 2 }
  const IcoPrin = acc.principal === 'entrada' ? ScanFace : ICONO_MARCA[acc.principal]

  return (
    <section style={{ ...TARJETA_CEL, borderRadius: 15, padding: '12px 11px 11px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 9, background: momento === 'fin' ? 'linear-gradient(180deg, var(--in-ok-bg), var(--in-carta) 50%)' : 'var(--in-carta)' }}>
      <span style={{ alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 6.4, fontWeight: 700, borderRadius: 99, padding: '3px 8px', background: chipBg, color: chipTx }}>
        <i style={{ width: 5, height: 5, borderRadius: '50%', background: chipPunto }} />{chip}
      </span>
      <div style={{ textAlign: 'center', fontSize: momento === 'fin' ? 25 : 32, fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1 }} aria-live="off">
        {momento === 'fin' ? <>{duracion(j.trabajado)}<small style={{ fontSize: 9, color: 'var(--tx-verde)', fontWeight: 700, letterSpacing: 0 }}> trabajadas</small></> : reloj}
      </div>
      {extraHoy && <span style={{ fontSize: 6.6, color: 'var(--tx-violeta)', background: 'var(--tn-violeta)', borderRadius: 8, padding: '4px 7px', textAlign: 'center' }}>Hoy tiene horas extra autorizadas de {extraHoy.desde} a {extraHoy.hasta}</span>}
      {momento === 'fin' ? (
        acc.deshacer && <button type="button" onClick={() => onDeshacer(acc.deshacer.id)} style={enlace}><RotateCcw size={9} /> ¿Se equivocó? Deshacer la salida</button>
      ) : acc.principal && (
        <>
          {/* La píldora menta del Inicio («Marcar entrada» en la franja de hoy). */}
          <button type="button" onClick={() => onPedir(acc.principal)} style={{ ...BOTON_BASE_CEL, height: 30, borderRadius: 99, fontWeight: 600, fontSize: 8.6, background: '#00E091', color: NAVY }}>
            <IcoPrin size={11} /> {ETIQUETA_MARCA[acc.principal]}
          </button>
          {acc.secundaria && (
            <button type="button" onClick={() => onPedir(acc.secundaria)} style={{ ...enlace, marginTop: -4 }}>
              {acc.secundaria === 'salida' ? 'O marcar la salida' : 'O iniciar su descanso'}
            </button>
          )}
        </>
      )}
    </section>
  )
}
const BOTON_BASE_CEL = { height: 28, borderRadius: 9, border: 'none', fontFamily: 'inherit', fontSize: 8.2, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer' }

/* ESTA SEMANA (lienzo «Mi asistencia», M3): de lunes a domingo, un punto por día —verde a tiempo,
   ámbar tarde, rojo ausente, gris lo que falta— con hoy en navy, y debajo lo trabajado, los días a
   tiempo y las horas extra de la semana. Tocar un día muestra debajo sus marcas: a qué hora entró,
   la pausa, a qué hora salió y cuánto trabajó (o su horario, si todavía no llega). */
const PUNTO_DIA = { verde: '#00B876', ambar: '#F5B544', rojo: '#E5484D', azul: '#2E6FD6', violeta: '#7C5AD6', gris: 'var(--in-campo)' }
function SemanaCel({ onMes, onCorregir }) {
  const at = useAsistencia()
  const yo = at.yo
  const lunes = sumarDias(at.hoy, 1 - diaISO(at.hoy))
  const dias = Array.from({ length: 7 }, (_, i) => {
    const fecha = sumarDias(lunes, i)
    return { fecha, j: fecha <= at.hoy ? at.jornadaDe(yo, fecha) : null, laboral: yo.horario.dias.includes(diaISO(fecha)) }
  })
  const hechos = dias.filter(d => d.j && d.j.estado !== 'libre' && (d.fecha < at.hoy || d.j.salida != null))
  const trabajado = dias.reduce((t, d) => t + (d.j?.trabajado || 0), 0)
  const aTiempo = hechos.filter(d => ['presente', 'justificada'].includes(d.j.estado)).length
  const extra = dias.reduce((t, d) => t + (d.j?.extra || 0), 0)
  const [sel, setSel] = useState(null)
  const elegido = dias.find(d => d.fecha === sel)
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '4px 2px -2px' }}>
        {/* El rótulo y el enlace del Inicio («ACCIONES RÁPIDAS», «Ver más →»). */}
        <span style={{ fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)' }}>Esta semana</span>
        <button type="button" onClick={onMes} style={{ border: 'none', background: 'none', padding: 0, fontFamily: 'inherit', fontSize: 8.4, fontWeight: 600, color: 'var(--in-acento-txt)', cursor: 'pointer' }}>Ver el mes →</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {dias.map(({ fecha, j, laboral }) => {
          const hoy = fecha === at.hoy
          const punto = !laboral ? null : fecha > at.hoy || (hoy && j?.salida == null) ? PUNTO_DIA.gris : PUNTO_DIA[(ESTADOS[j.estado] || ESTADOS.presente).tono] || PUNTO_DIA.gris
          const marcado = sel === fecha
          return (
            <button type="button" key={fecha} onClick={() => setSel(marcado ? null : fecha)} aria-pressed={marcado} style={{
              display: 'grid', justifyItems: 'center', gap: 2, borderRadius: 9, padding: '5px 0 5px', border: 'none', fontFamily: 'inherit', cursor: 'pointer',
              background: hoy ? 'var(--in-pill)' : laboral ? 'var(--in-carta)' : 'transparent',
              boxShadow: marcado ? (hoy ? '0 0 0 2px #00E091' : '0 0 0 1.5px var(--in-texto)') : laboral && !hoy ? '0 1px 2px rgba(12,45,64,.06)' : 'none',
            }}>
              <small style={{ fontSize: 5.4, fontWeight: 700, textTransform: 'uppercase', color: hoy ? 'var(--in-pill-txt)' : 'var(--in-suave)' }}>{DIAS_CORTOS[diaISO(fecha)]}</small>
              <b style={{ fontSize: 9, color: hoy ? 'var(--in-pill-txt)' : laboral ? 'var(--in-texto)' : 'var(--in-suave)' }}>{aFecha(fecha).getDate()}</b>
              <i style={{ width: 4, height: 4, borderRadius: '50%', background: punto ? (hoy && punto === PUNTO_DIA.gris ? 'rgba(255,255,255,.35)' : punto) : 'transparent' }} />
            </button>
          )
        })}
      </div>
      {elegido ? <DiaElegido {...elegido} yo={yo} hoy={at.hoy} onCorregir={onCorregir} /> : <span style={{ textAlign: 'center', fontSize: 6.4, color: 'var(--in-suave)', marginTop: -3 }}>Toque un día para ver a qué hora marcó.</span>}
      <div style={{ ...TARJETA_CEL, padding: '7px 4px 8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
        <span style={{ gridColumn: '1 / -1', fontSize: 6.4, fontWeight: 700, color: 'var(--in-mute)', textAlign: 'center', marginBottom: 5 }}>Resumen de esta semana · del {fechaCorta(lunes)} a hoy</span>
        {[[duracion(trabajado), 'Trabajadas'], [`${aTiempo} de ${hechos.length}`, 'Días a tiempo'], [duracion(extra), 'Horas extra']].map(([v, k], i) => (
          <span key={k} style={{ display: 'grid', borderLeft: i ? '1px solid var(--in-linea)' : 'none' }}>
            <b style={{ fontSize: 9.4, letterSpacing: '-.01em' }}>{v}</b>
            <small style={{ fontSize: 5.8, color: 'var(--in-mute)' }}>{k}</small>
          </span>
        ))}
      </div>
    </>
  )
}

/* El día que se tocó en la semana o en el mes (lienzo DD1): las marcas una debajo de otra —entrada,
   salida a la pausa, vuelta y salida— con la hora grande, si fue antes o después de lo que le tocaba
   y cómo se marcó (rostro, distancia). Entre la salida a la pausa y la vuelta, la pausa con su
   duración. Un día que todavía no llega muestra el horario; uno libre, que es libre. */
const MARCA_DD = {
  entrada: [LogIn, 'Entrada', 'var(--tn-verde)', 'var(--tx-verde)'], pausa_inicio: [Coffee, 'Salió a descansar', 'var(--tn-ambar)', 'var(--tx-ambar)'],
  pausa_fin: [Coffee, 'Volvió del descanso', 'var(--tn-ambar)', 'var(--tx-ambar)'], salida: [LogOut, 'Salida', 'var(--tn-gris)', 'var(--in-texto)'],
}
function DiaElegido({ fecha, j, laboral, yo, hoy, onCorregir }) {
  const hr = yo.horario
  const d = aFecha(fecha)
  const titulo = `${['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][diaISO(fecha)]} ${d.getDate()}${fecha === hoy ? ' · hoy' : ''}`
  const tol = yo.politica?.tolerancia ?? 10
  const marcas = j ? j.marcas.filter(m => !m.rechazada && !m.anulada) : []
  let etiqueta = null
  if (j && j.estado !== 'libre' && (fecha < hoy || j.salida != null)) {
    const e = ESTADOS[j.estado] || ESTADOS.presente
    const tarde = j.llegoTarde && hr.modo === 'fijo' && j.entrada != null ? j.entrada - aMin(hr.entrada) : null
    const [bg, tx] = ETIQ_DIA[e.tono] || ETIQ_DIA.gris
    etiqueta = [j.estado === 'tarde' && tarde != null ? `Tarde ${duracion(tarde)}` : j.estado === 'presente' ? (tarde != null && tarde > 0 && tarde <= tol ? 'En la tolerancia' : 'A tiempo') : e.label, bg, tx]
  }
  const fijo = hr.modo === 'fijo'
  /* Antes o después de lo que le tocaba: la entrada contra su hora de entrada, la salida contra la de salida. */
  const diferencia = m => {
    if (!fijo || (m.tipo !== 'entrada' && m.tipo !== 'salida')) return null
    const dif = m.min - aMin(m.tipo === 'entrada' ? hr.entrada : hr.salida)
    if (!dif) return ['a la hora', 'var(--in-mute)']
    if (m.tipo === 'entrada' && m.min >= aMin(hr.salida)) return ['fuera de horario', 'var(--in-mute)']
    if (m.tipo === 'entrada') return dif < 0 ? [`${duracion(-dif)} antes`, 'var(--tx-verde)'] : [`${duracion(dif)} tarde`, dif <= tol ? 'var(--in-mute)' : 'var(--tx-ambar)']
    return dif > 0 ? [`${duracion(dif)} después`, 'var(--tx-verde)'] : [`${duracion(-dif)} antes`, 'var(--tx-ambar)']
  }
  const como = m => [m.score != null && 'Rostro ✓', m.remoto ? 'remoto' : m.distancia != null && `a ${m.distancia} m`, m.origen === 'panel' && 'cargada por RR.HH.'].filter(Boolean).join(' · ')
  const hilo = <span style={{ marginLeft: 9, borderLeft: '2px solid #C9F5E2', height: 9 }} />
  const fila = (key, Icono, nombre, bg, tx, hora, nota, dif, apagada) => (
    <div key={key} style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 8, alignItems: 'center', padding: '3px 0', opacity: apagada ? 0.5 : 1 }}>
      <i style={{ width: 20, height: 20, borderRadius: '50%', background: bg, color: tx, display: 'grid', placeItems: 'center' }}><Icono size={10} /></i>
      <span style={{ display: 'grid', minWidth: 0 }}>
        <b style={{ fontSize: 8.2 }}>{nombre}</b>
        {nota && <small style={{ fontSize: 6.2, color: 'var(--in-mute)' }}>{nota}</small>}
      </span>
      <b style={{ fontSize: 10, letterSpacing: '-.01em', textAlign: 'right', color: apagada ? 'var(--in-suave)' : 'var(--in-texto)' }}>
        {hora}{dif && <small style={{ display: 'block', fontSize: 5.8, fontWeight: 600, letterSpacing: 0, color: dif[1] }}>{dif[0]}</small>}
      </b>
    </div>
  )
  /* La línea del día: cada marca, y entre la salida a la pausa y la vuelta, la pausa. */
  const lineaDelDia = () => {
    const filas = []
    marcas.forEach((m, i) => {
      const [Icono, nombre, bg, tx] = MARCA_DD[m.tipo] || [Clock, TIPOS_MARCA[m.tipo]?.label || 'Marca', 'var(--tn-gris)', 'var(--in-texto)']
      if (i) {
        const vuelve = m.tipo === 'pausa_fin' && marcas[i - 1].tipo === 'pausa_inicio'
        if (vuelve) {
          const dur = m.min - marcas[i - 1].min
          const demas = hr.pausa ? dur - hr.pausa : 0
          filas.push(
            <span key={`p${i}`} style={{ marginLeft: 9, borderLeft: '2px dashed #F5B544', minHeight: 20, display: 'flex', alignItems: 'center' }}>
              <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, color: 'var(--tx-ambar)', background: 'var(--tn-ambar)', borderRadius: 99, padding: '2px 7px', marginLeft: 16 }}>
                Pausa de {duracion(dur)}{demas > 0 ? ` · ${duracion(demas)} de más` : ''}
              </em>
            </span>,
          )
        } else filas.push(<span key={`h${i}`} style={{ display: 'contents' }}>{hilo}</span>)
      }
      filas.push(fila(m.id, Icono, nombre, bg, tx, hhmm(m.min), como(m), diferencia(m)))
    })
    if (j.salida == null && fecha === hoy) {
      if (j.enPausa) filas.push(<span key="pa" style={{ marginLeft: 9, borderLeft: '2px dashed #F5B544', height: 12 }} />)
      else filas.push(<span key="hs" style={{ display: 'contents' }}>{hilo}</span>)
      filas.push(fila('falta', LogOut, 'Salida', 'var(--tn-gris)', 'var(--in-mute)', fijo ? hr.salida : '—', 'por marcar', null, true))
    }
    return filas
  }
  return (
    <div style={{ ...TARJETA_CEL, display: 'grid', gap: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <span style={{ display: 'grid' }}>
          <b style={{ fontSize: 8.4 }}>{titulo}</b>
          {laboral && j?.entrada != null && <small style={{ fontSize: 6.2, color: 'var(--in-mute)' }}>{yo.lugar?.nombre}{fijo ? ` · turno ${hr.entrada} a ${hr.salida}` : ''}</small>}
        </span>
        {etiqueta && <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 7px', background: etiqueta[1], color: etiqueta[2] }}>{etiqueta[0]}</em>}
      </div>
      {!laboral ? (
        <span style={{ fontSize: 7, color: 'var(--in-mute)' }}>Día libre: no le toca trabajar.</span>
      ) : fecha > hoy || (fecha === hoy && j?.entrada == null) ? (
        <span style={{ fontSize: 7, color: 'var(--in-mute)' }}>{hr.modo === 'fijo' ? <>Le toca de <b style={{ color: 'var(--in-texto)' }}>{hr.entrada}</b> a <b style={{ color: 'var(--in-texto)' }}>{hr.salida}</b>{hr.pausa ? `, con ${hr.pausa} min de pausa` : ''}.</> : 'Horario flexible.'}{fecha === hoy ? ' Todavía no marcó la entrada.' : ''}</span>
      ) : j?.entrada == null ? (
        <span style={{ fontSize: 7, color: 'var(--in-mute)' }}>{j?.justificacion ? `${j.justificacion.tipo || 'Ausencia justificada'}${j.justificacion.motivo ? ` · ${j.justificacion.motivo}` : ''}` : 'Ese día no tiene marcas.'}</span>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column' }}>{lineaDelDia()}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--in-linea)', paddingTop: 7, fontSize: 6.8, color: 'var(--in-mute)' }}>
            <span>{j.salida != null ? 'Trabajó' : 'Lleva'}</span><b style={{ fontSize: 9.6, color: 'var(--in-texto)' }}>{duracion(j.trabajado)}</b>
          </div>
        </>
      )}
      {/* Un día que ya pasó (o hoy) se puede corregir: falta una marca o quedó mal. */}
      {laboral && fecha <= hoy && onCorregir && (
        <button type="button" onClick={() => onCorregir(fecha)} style={{ border: 'none', background: 'none', padding: 0, fontFamily: 'inherit', fontSize: 6.8, fontWeight: 700, color: 'var(--tx-verde)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <PencilLine size={9} /> ¿Algo está mal? Corregir una marca
        </button>
      )}
    </div>
  )
}

/* CORREGIR UNA MARCACIÓN: el día, qué marca (entrada, salida a la pausa, vuelta o salida), la hora
   correcta y la razón. Dice qué figura hoy para esa marca, así la persona ve qué está pidiendo
   cambiar. Va a RR.HH. como solicitud de corrección: al aprobarla se carga la marca. */
const MARCAS_CORREGIR = [['entrada', 'Entrada'], ['pausa_inicio', 'Salió a descansar'], ['pausa_fin', 'Volvió del descanso'], ['salida', 'Salida']]
export function CorregirMarcaCel({ fecha: fechaInicial, onVolver, onEnviada, volverA = 'Mi asistencia' }) {
  const at = useAsistencia()
  const yo = at.yo
  const hr = yo.horario
  const sugerida = m => !hr || hr.modo !== 'fijo' ? '09:00' : m === 'entrada' ? hr.entrada : m === 'salida' ? hr.salida
    : hhmm(Math.round((aMin(hr.entrada) + aMin(hr.salida)) / 2 - (hr.pausa || 0) / 2) + (m === 'pausa_fin' ? hr.pausa || 0 : 0))
  const [fecha, setFecha] = useState(fechaInicial || at.hoy)
  const [marca, setMarca] = useState('entrada')
  const [hora, setHora] = useState(sugerida('entrada'))
  const [motivo, setMotivo] = useState('')
  const marcas = at.jornadaDe(yo, fecha).marcas.filter(m => !m.rechazada && !m.anulada && m.tipo === marca)
  const valido = fecha <= at.hoy && !!hora && motivo.trim().length >= 4
  const elegir = m => { setMarca(m); setHora(sugerida(m)) }
  const enviar = () => { at.crearSolicitud({ tipo: 'correccion', personaId: yo.id, fecha, marca, hora, motivo: motivo.trim() }); onEnviada() }
  const campo = { width: '100%', boxSizing: 'border-box', height: 26, padding: '0 9px', borderRadius: 10, border: 'none', background: 'var(--in-fondo)', fontFamily: 'inherit', fontSize: 8.4, fontWeight: 500, color: 'var(--in-texto)', outline: 'none' }
  const rotulo = { fontSize: 7.2, fontWeight: 400, color: 'var(--in-mute)', display: 'grid', gap: 3 }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
      <BarraVolver texto={volverA} onVolver={onVolver} conTema />
      <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em', margin: '-6px 2px 0' }}>Corregir una marcación</b>
      <span style={{ fontSize: 7.4, color: 'var(--in-mute)', margin: '-5px 2px 0', lineHeight: 1.5 }}>Si olvidó marcar o la hora quedó mal. RR.HH. la revisa y, si la aprueba, se corrige sola.</span>
      <div style={{ ...TARJETA_CEL, display: 'grid', gap: 8 }}>
        <div style={rotulo}>Día<FechaCel valor={fecha} max={at.hoy} hoy={at.hoy} onCambio={setFecha} estilo={campo} ariaLabel="Día" /></div>
        <div style={{ ...rotulo, gap: 4 }}>
          ¿Qué marca?
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {MARCAS_CORREGIR.map(([k, t]) => (
              <button key={k} type="button" onClick={() => elegir(k)} aria-pressed={marca === k} style={{
                height: 24, borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 7.8, fontWeight: 600, cursor: 'pointer',
                background: marca === k ? 'var(--in-pill)' : 'var(--in-fondo)', color: marca === k ? 'var(--in-pill-txt)' : 'var(--in-texto)',
              }}>{t}</button>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 6.6, color: 'var(--in-mute)', background: 'var(--in-calendario)', borderRadius: 8, padding: '5px 8px' }}>
          {marcas.length ? <>Hoy figura a las <b style={{ color: 'var(--in-texto)' }}>{marcas.map(m => hhmm(m.min)).join(' y ')}</b>.</> : 'Ese día no figura esta marca.'}
        </span>
        <div style={rotulo}>Hora correcta<HoraCel valor={hora} onCambio={setHora} estilo={campo} ariaLabel="Hora correcta" titulo="Hora correcta" conAhora={fecha === at.hoy}
          atajos={hr?.modo === 'fijo' ? [{ hora: sugerida(marca), texto: { entrada: 'su entrada', salida: 'su salida', pausa_inicio: 'su pausa', pausa_fin: 'fin de la pausa' }[marca] }] : []} /></div>
        <label style={rotulo}>Razón de la solicitud<input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Por ejemplo: se me acabó la batería" style={campo} /></label>
      </div>
      <button type="button" disabled={!valido} onClick={enviar} style={{ height: 30, borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 8.6, fontWeight: 600, background: valido ? '#00E091' : 'var(--in-plomo)', color: valido ? NAVY : 'var(--in-suave)', cursor: valido ? 'pointer' : 'default' }}>Enviar a RR.HH.</button>
    </div>
  )
}

/* Horas extra que RR.HH. le asignó y esperan su respuesta: van arriba de la tarjeta de hoy, porque piden
   una respuesta. Lo demás de las horas extra se ve en la semana y se pide desde el «+». */
function AsignadasCel() {
  const at = useAsistencia()
  const yo = at.yo
  const porAceptar = at.horasExtra.filter(x => String(x.personaId) === String(yo.id) && x.estado === 'asignada')
  if (!porAceptar.length) return null
  const boton = { flex: 1, height: 24, borderRadius: 8, border: 'none', fontFamily: 'inherit', fontSize: 7.4, fontWeight: 700, cursor: 'pointer' }
  return porAceptar.map(x => (
    <div key={x.id} style={{ ...TARJETA_CEL, display: 'grid', gap: 6, background: 'var(--tn-violeta)', boxShadow: '0 0 0 1px var(--tn-violeta-borde)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--tn-violeta)', color: 'var(--tx-violeta)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Clock size={11} /></span>
        <span style={{ display: 'grid' }}>
          <b style={{ fontSize: 8 }}>RR.HH. le asignó horas extra</b>
          <small style={{ fontSize: 6.6, color: 'var(--in-mute)' }}>{x.fecha === at.hoy ? 'Hoy' : fechaLarga(x.fecha)} · de {x.desde} a {x.hasta}{x.motivo ? ` · ${x.motivo}` : ''}</small>
        </span>
      </span>
      <span style={{ display: 'flex', gap: 5 }}>
        <button type="button" onClick={() => at.responderExtra(x.id, 'rechazada', 'No puede')} style={{ ...boton, background: 'var(--in-carta)', color: 'var(--in-texto)', boxShadow: 'inset 0 0 0 1.2px var(--in-campo)' }}>No puedo</button>
        <button type="button" onClick={() => at.responderExtra(x.id, 'aceptada')} style={{ ...boton, background: '#00E091', color: NAVY }}>Acepto</button>
      </span>
    </div>
  ))
}

/* PEDIR HORAS EXTRA, en su pantalla: el día, desde y hasta, y para qué. Abajo, las que ya pidió. */
export function PedirExtraCel({ onVolver, onEnviada, volverA = 'Mi asistencia' }) {
  const at = useAsistencia()
  const yo = at.yo
  const salida = yo.horario?.salida || '18:00'
  const [fecha, setFecha] = useState(sumarDias(at.hoy, 1))
  const [desde, setDesde] = useState(salida)
  const [hasta, setHasta] = useState(hhmm(aMin(salida) + 120))
  const [motivo, setMotivo] = useState('')
  const valido = aMin(hasta) > aMin(desde) && motivo.trim().length >= 4 && fecha >= at.hoy
  const mias = at.horasExtra.filter(x => String(x.personaId) === String(yo.id) && x.fecha >= at.hoy && x.estado !== 'asignada').sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
  const enviar = () => { at.solicitarExtra({ personaId: yo.id, fecha, desde, hasta, motivo: motivo.trim(), por: yo.name }); onEnviada() }
  const campo = { width: '100%', boxSizing: 'border-box', height: 26, padding: '0 9px', borderRadius: 10, border: 'none', background: 'var(--in-fondo)', fontFamily: 'inherit', fontSize: 8.4, fontWeight: 500, color: 'var(--in-texto)', outline: 'none' }
  const rotulo = { fontSize: 7.2, fontWeight: 400, color: 'var(--in-mute)', display: 'grid', gap: 3 }
  const ESTADO_EXTRA_CEL = { pendiente: ['Por aprobar', 'var(--tn-ambar)', 'var(--tx-ambar)'], aprobada: ['Aprobada', 'var(--tn-verde)', 'var(--tx-verde)'], aceptada: ['Aceptada', 'var(--tn-verde)', 'var(--tx-verde)'], rechazada: ['No aprobada', 'var(--in-rojo-bg)', 'var(--in-rojo)'] }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
      <BarraVolver texto={volverA} onVolver={onVolver} conTema />
      <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em', margin: '-6px 2px 0' }}>Pedir horas extra</b>
      <span style={{ fontSize: 7.4, color: 'var(--in-mute)', margin: '-5px 2px 0', lineHeight: 1.5 }}>Se piden antes del día. Quedarse más tiempo sin pedirlas no cuenta como hora extra.</span>
      <div style={{ ...TARJETA_CEL, display: 'grid', gap: 8 }}>
        <div style={rotulo}>Día<FechaCel valor={fecha} min={at.hoy} hoy={at.hoy} onCambio={setFecha} estilo={campo} ariaLabel="Día" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div style={rotulo}>Desde<HoraCel valor={desde} onCambio={setDesde} estilo={campo} ariaLabel="Desde" titulo="Desde" alinear="izq" atajos={[{ hora: salida, texto: 'su salida' }]} /></div>
          <div style={rotulo}>Hasta<HoraCel valor={hasta} onCambio={setHasta} estilo={campo} ariaLabel="Hasta" titulo="Hasta" alinear="der" atajos={[{ hora: hhmm(aMin(desde) + 60), texto: '1 h' }, { hora: hhmm(aMin(desde) + 120), texto: '2 h' }]} /></div>
        </div>
        <label style={rotulo}>Razón de la solicitud<input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Por ejemplo: cierre de inventario" style={campo} /></label>
        {aMin(hasta) > aMin(desde) && <span style={{ fontSize: 6.6, color: 'var(--in-mute)' }}>Serían <b style={{ color: 'var(--in-texto)' }}>{duracion(aMin(hasta) - aMin(desde))}</b> de horas extra.</span>}
      </div>
      <button type="button" disabled={!valido} onClick={enviar} style={{ height: 30, borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 8.6, fontWeight: 600, background: valido ? '#00E091' : 'var(--in-plomo)', color: valido ? NAVY : 'var(--in-suave)', cursor: valido ? 'pointer' : 'default' }}>Enviar a RR.HH.</button>
      {!!mias.length && (
        <>
          <span style={{ fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)', margin: '6px 2px -2px' }}>Sus horas extra</span>
          {mias.map(x => {
            const [t, bg, tx] = ESTADO_EXTRA_CEL[x.estado] || [ESTADOS_EXTRA[x.estado]?.label || x.estado, 'var(--tn-gris)', 'var(--tx-gris)']
            return (
              <div key={x.id} style={{ ...TARJETA_CEL, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'grid' }}><b style={{ fontSize: 8.2 }}>{x.fecha === at.hoy ? 'Hoy' : fechaCorta(x.fecha)} · {x.desde} a {x.hasta}</b><small style={{ fontSize: 6.4, color: 'var(--in-mute)' }}>{x.motivo}</small></span>
                <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 7px', background: bg, color: tx, whiteSpace: 'nowrap' }}>{t}</em>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

const ETIQ_DIA = { verde: ['var(--tn-verde)', 'var(--tx-verde)', '#00B876'], ambar: ['var(--tn-ambar)', 'var(--tx-ambar)', '#E59A1A'], rojo: ['var(--in-rojo-bg)', 'var(--in-rojo)', '#E5484D'], azul: ['var(--tn-azul)', 'var(--tx-azul)', '#2E6FD6'], violeta: ['var(--tn-violeta)', 'var(--tx-violeta)', '#7C5AD6'], gris: ['var(--tn-gris)', 'var(--tx-gris)', 'var(--in-mute)'] }

/* ── EL MES (desde «Ver el mes»): el calendario con cada día pintado por cómo le fue —verde a tiempo,
   ámbar tarde, rojo ausente, azul o violeta justificado— y las cifras del mes. Tocar un día muestra
   sus marcas, igual que en la semana. Se puede ir a los meses anteriores. */
function MesCel({ onVolver, onCorregir }) {
  const at = useAsistencia()
  const yo = at.yo
  const [ym, setYm] = useState(mesDe(at.hoy))
  const [sel, setSel] = useState(null)
  const dias = diasDelMes(ym).map(fecha => ({ fecha, j: fecha <= at.hoy ? at.jornadaDe(yo, fecha) : null, laboral: !!yo.horario?.dias.includes(diaISO(fecha)) }))
  // Las semanas completas, como el calendario de la vacación: los días del mes vecino, más claros.
  const semanas = semanasDe(ym)
  const hechos = dias.filter(d => d.j && d.j.estado !== 'libre' && (d.fecha < at.hoy || d.j.salida != null))
  const trabajado = dias.reduce((t, d) => t + (d.j?.trabajado || 0), 0)
  const aTiempo = hechos.filter(d => ['presente', 'justificada'].includes(d.j.estado)).length
  const tardes = hechos.filter(d => d.j.estado === 'tarde').length
  const elegido = dias.find(d => d.fecha === sel)
  const ir = n => { setYm(m => mesVecino(m, n)); setSel(null) }
  const flecha = (n, Icono, off) => (
    <button type="button" disabled={off} onClick={() => ir(n)} aria-label={n < 0 ? 'Mes anterior' : 'Mes siguiente'} style={{ width: 22, height: 22, borderRadius: 7, border: 'none', background: off ? 'transparent' : 'var(--in-fondo)', color: off ? 'var(--in-campo)' : 'var(--in-texto)', display: 'grid', placeItems: 'center', cursor: off ? 'default' : 'pointer' }}><Icono size={11} /></button>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
      <BarraVolver texto="Mi asistencia" onVolver={onVolver} conTema />
      <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em', margin: '-6px 2px 0' }}>Mi mes</b>
      <div style={{ ...TARJETA_CEL, display: 'grid', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {flecha(-1, ChevronLeft, false)}
          <b style={{ fontSize: 9, textTransform: 'capitalize' }}>{nombreMes(ym)}</b>
          {flecha(1, ChevronRight, ym >= mesDe(at.hoy))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, textAlign: 'center' }}>
          {['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'].map(x => <small key={x} style={{ fontSize: 6.6, fontWeight: 600, letterSpacing: '.06em', color: 'var(--in-suave)' }}>{x}</small>)}
          {semanas.map(fecha => {
            if (!fecha.startsWith(ym)) return <span key={fecha} style={{ height: 22, display: 'grid', placeItems: 'center', fontSize: 7.4, color: 'var(--in-campo)' }}>{aFecha(fecha).getDate()}</span>
            const { j, laboral } = dias.find(d => d.fecha === fecha)
            const hoy = fecha === at.hoy
            const listo = j && j.estado !== 'libre' && laboral && (fecha < at.hoy || j.salida != null)
            const [bg, tx] = listo ? ETIQ_DIA[(ESTADOS[j.estado] || ESTADOS.presente).tono] || ETIQ_DIA.gris : ['transparent', laboral ? 'var(--in-texto)' : 'var(--in-suave)']
            const marcado = sel === fecha
            return (
              <button type="button" key={fecha} onClick={() => setSel(marcado ? null : fecha)} style={{
                height: 22, borderRadius: 7, border: 'none', fontFamily: 'inherit', fontSize: 7.4, fontWeight: 600, cursor: 'pointer', padding: 0,
                background: hoy ? 'var(--in-pill)' : bg, color: hoy ? 'var(--in-pill-txt)' : tx,
                boxShadow: marcado ? (hoy ? '0 0 0 2px #00E091' : '0 0 0 1.5px var(--in-texto)') : 'none',
              }}>{aFecha(fecha).getDate()}</button>
            )
          })}
        </div>
        {/* La leyenda, solo con lo que aparece en el mes: «Horas extra» o «Justificado» sin ningún día así
            sobraban. */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, fontSize: 6.4, color: 'var(--in-mute)' }}>
          {[['verde', '#C9F5E2', 'A tiempo'], ['ambar', '#FBE3B3', 'Tarde'], ['rojo', '#F9CFCB', 'Faltó'], ['violeta', 'var(--tn-violeta-borde)', 'Salida sin marcar'], ['gris', 'var(--in-campo)', 'Vacaciones o permiso'], ['azul', '#D7E4F8', 'Horas extra']]
            .filter(([tono]) => hechos.some(d => d.laboral && (ESTADOS[d.j.estado] || ESTADOS.presente).tono === tono))
            .map(([, c, t]) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><i style={{ width: 6, height: 6, borderRadius: 2, background: c }} />{t}</span>
          ))}
        </div>
      </div>
      {elegido ? <DiaElegido {...elegido} yo={yo} hoy={at.hoy} onCorregir={onCorregir} /> : <span style={{ textAlign: 'center', fontSize: 6.4, color: 'var(--in-suave)', marginTop: -3 }}>Toque un día para ver a qué hora marcó.</span>}
      <div style={{ ...TARJETA_CEL, padding: '7px 4px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
        <span style={{ gridColumn: '1 / -1', fontSize: 6.8, fontWeight: 600, color: 'var(--in-mute)', textAlign: 'center', marginBottom: 5 }}>Resumen de {nombreMes(ym)}</span>
        {[[duracion(trabajado), 'Trabajadas'], [`${aTiempo} de ${hechos.length}`, 'Días a tiempo'], [String(tardes), tardes === 1 ? 'Llegada tarde' : 'Llegadas tarde']].map(([v, k], i) => (
          <span key={k} style={{ display: 'grid', borderLeft: i ? '1px solid var(--in-linea)' : 'none' }}>
            <b style={{ fontSize: 9.4, letterSpacing: '-.01em' }}>{v}</b>
            <small style={{ fontSize: 5.8, color: 'var(--in-mute)' }}>{k}</small>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── MIS HORAS EXTRA ──
   Lo que el colaborador hace con las horas extra: aceptar las que RR.HH. le asignó, pedir las que
   sabe que va a necesitar y ver cuántas lleva en el mes. Marcar sigue igual: su salida normal. */
function MisHorasExtra() {
  const at = useAsistencia()
  const yo = at.yo
  const [pedir, setPedir] = useState(false)
  const [fecha, setFecha] = useState(sumarDias(hoyISO(), 1))
  const [desde, setDesde] = useState(yo.horario?.salida || '18:00')
  const [hasta, setHasta] = useState(hhmm(aMin(yo.horario?.salida || '18:00') + 120))
  const [motivo, setMotivo] = useState('')
  const mias = at.horasExtra.filter(x => String(x.personaId) === String(yo.id))
  const porAceptar = mias.filter(x => x.estado === 'asignada')
  const proximas = mias.filter(x => x.fecha >= at.hoy && x.estado !== 'rechazada' && x.estado !== 'asignada').sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
  const delMes = mias.filter(x => esAutorizada(x) && mesDe(x.fecha) === mesDe(at.hoy))
  const trabajadas = delMes.filter(x => x.fecha <= at.hoy).reduce((t, x) => t + at.jornadaDe(yo, x.fecha).extra, 0)
  const valido = aMin(hasta) > aMin(desde) && motivo.trim().length >= 4
  const enviar = () => { at.solicitarExtra({ personaId: yo.id, fecha, desde, hasta, motivo: motivo.trim(), por: yo.name }); setPedir(false); setMotivo('') }
  const boton = { border: 'none', borderRadius: '.7em', font: 'inherit', fontSize: '.74em', fontWeight: 700, padding: '.55em .9em', cursor: 'pointer' }
  return (
    <section className="at-mc-hoy">
      <h3>Horas extra <span>{duracion(trabajadas, { corto: true })} este mes</span></h3>
      {porAceptar.map(x => (
        <div key={x.id} style={{ background: 'var(--dc-azul-bg)', borderRadius: '.8em', padding: '.7em .8em', marginBottom: '.5em' }}>
          <div style={{ fontSize: '.76em', fontWeight: 700, color: 'var(--text-heading)' }}>RR.HH. te asignó {fechaCorta(x.fecha)} de {x.desde} a {x.hasta}</div>
          <div style={{ fontSize: '.7em', color: 'var(--text-muted)', margin: '.2em 0 .5em' }}>{x.motivo}</div>
          <div style={{ display: 'flex', gap: '.4em' }}>
            <button type="button" style={{ ...boton, background: 'var(--surface-card)', color: 'var(--text-heading)' }} onClick={() => at.responderExtra(x.id, 'rechazada', 'No puede')}>No puedo</button>
            <button type="button" style={{ ...boton, background: 'var(--green)', color: '#06231B' }} onClick={() => at.responderExtra(x.id, 'aceptada')}>Acepto</button>
          </div>
        </div>
      ))}
      {proximas.slice(0, 3).map(x => (
        <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '.5em', fontSize: '.76em', padding: '.3em 0' }}>
          <span>{x.fecha === at.hoy ? 'Hoy' : fechaCorta(x.fecha)} · {x.desde}–{x.hasta}</span>
          <span style={{ color: esAutorizada(x) ? 'var(--dc-verde)' : 'var(--dc-ambar)', fontWeight: 600 }}>{ESTADOS_EXTRA[x.estado].label}</span>
        </div>
      ))}
      {!porAceptar.length && !proximas.length && !pedir && <div style={{ fontSize: '.74em', color: 'var(--text-muted)' }}>No tiene horas extra programadas. Quedarse más tiempo no cuenta como hora extra.</div>}
      {pedir ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.45em', marginTop: '.6em', fontSize: '.78em' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '.2em' }}>Día<input type="date" className="pl-input" value={fecha} min={at.hoy} onChange={e => setFecha(e.target.value)} /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.4em' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '.2em' }}>Desde<input type="time" className="pl-input" value={desde} onChange={e => setDesde(e.target.value)} /></label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '.2em' }}>Hasta<input type="time" className="pl-input" value={hasta} onChange={e => setHasta(e.target.value)} /></label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '.2em' }}>¿Para qué?<input className="pl-input" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej.: cierre de inventario" /></label>
          <div style={{ display: 'flex', gap: '.4em', justifyContent: 'flex-end' }}>
            <button type="button" style={{ ...boton, background: 'var(--surface-hover)', color: 'var(--text-heading)' }} onClick={() => setPedir(false)}>Cancelar</button>
            <button type="button" disabled={!valido} style={{ ...boton, background: 'var(--navy)', color: '#fff', opacity: valido ? 1 : 0.5 }} onClick={enviar}>Enviar a RR.HH.</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setPedir(true)} style={{ ...boton, marginTop: '.6em', background: 'var(--surface-hover)', color: 'var(--text-heading)', width: '100%' }}>Pedir horas extra</button>
      )}
    </section>
  )
}

/* ── TUS DÍAS ANTERIORES ── las asistencias pasadas, con los mismos números que ve RR.HH.: cada día con
   su entrada y su salida, lo trabajado y el estado (a tiempo, tarde, ausente, justificada…). Se ven 7 y
   se piden más; tocar un día muestra sus marcas. Los días libres no se listan. */
const TONO_DIA = { verde: ['#E3FAF0', '#0A7F55'], ambar: ['#FFF4DE', '#C77700'], rojo: ['#FDECEA', '#C0392B'], azul: ['#E6EEFF', '#2F6FEB'], violeta: ['#F0EAFE', '#7A4FE0'], gris: ['#EEF2F6', '#62788A'] }
function DiasPasados() {
  const at = useAsistencia()
  const yo = at.yo
  const [cuantos, setCuantos] = useState(7)
  const [abierto, setAbierto] = useState(null)
  const dias = []
  for (let i = 1; dias.length < cuantos && i <= 60; i++) {
    const fecha = sumarDias(at.hoy, -i)
    const j = at.jornadaDe(yo, fecha)
    if (j.estado !== 'libre') dias.push({ fecha, j })
  }
  const tol = yo.politica?.tolerancia ?? 10
  return (
    <section className="at-k1-pasados">
      <div className="cab"><b>Sus días anteriores</b><span>Lo mismo que ve RR.HH.</span></div>
      {dias.map(({ fecha, j }) => {
        const e = ESTADOS[j.estado] || ESTADOS.presente
        const [bg, fg] = TONO_DIA[e.tono] || TONO_DIA.gris
        const tarde = j.llegoTarde && yo.horario?.modo === 'fijo' ? j.entrada - aMin(yo.horario.entrada) : null
        const etiqueta = j.estado === 'tarde' && tarde != null ? `${duracion(tarde)} tarde` : j.estado === 'presente' ? (tarde != null && tarde > 0 && tarde <= tol ? 'Tolerancia' : 'A tiempo') : e.label
        const marcas = j.marcas.filter(m => !m.rechazada && !m.anulada)
        const d = aFecha(fecha)
        const esAbierto = abierto === fecha
        return (
          <div key={fecha} className={`dia${esAbierto ? ' abierto' : ''}`}>
            <button type="button" className="fila" onClick={() => setAbierto(esAbierto ? null : fecha)} aria-expanded={esAbierto}>
              <span className="fecha"><small>{DIAS_CORTOS[diaISO(fecha)]}</small><b>{d.getDate()}</b></span>
              <span className="horas">
                <b>{j.entrada != null ? `${hhmm(j.entrada)} → ${j.salida != null ? hhmm(j.salida) : '—'}` : j.justificacion ? (j.justificacion.tipo || 'Justificada') : 'Sin marcas'}</b>
                <small>{j.trabajado ? `Trabajaste ${duracion(j.trabajado)}` : e.desc}</small>
              </span>
              <span className="estado" style={{ background: bg, color: fg }}>{etiqueta}</span>
            </button>
            {esAbierto && (
              <ul className="marcas">
                {marcas.length ? marcas.map(m => (
                  <li key={m.id}><b>{hhmm(m.min)}</b> {TIPOS_MARCA[m.tipo].label}<span>{m.remoto ? 'Remoto' : m.distancia != null ? `a ${m.distancia} m` : m.origen === 'panel' ? 'Cargada por RR.HH.' : ''}</span></li>
                )) : <li className="vacio">Ese día no tiene marcas.</li>}
              </ul>
            )}
          </div>
        )
      })}
      {cuantos < 30 && <button type="button" className="mas" onClick={() => setCuantos(c => c + 7)}>Ver más días</button>}
    </section>
  )
}

/* ── EL FLUJO DE CAPTURA ── */
function Flujo({ tipo, onCerrar }) {
  const at = useAsistencia()
  const yo = at.yo
  const ex = at.exigenciasDe(yo, hoyISO())
  const geo = yo.lugar?.geo
  const radio = yo.politica?.radio || geo?.radio || 150
  const necesitaConsent = ex.rostro && !yo.bio?.consentimiento
  const [paso, setPaso] = useState(necesitaConsent ? 'consent' : 'ubicacion')
  const [lejos, setLejos] = useState(false)
  const [pos, setPos] = useState(null) // { lat, lng, distancia }
  const [score, setScore] = useState(null)
  const [hecha, setHecha] = useState(null)
  const enrolando = ex.rostro && !yo.bio?.enrolado

  /* Paso 3: se guarda. La hora la pone el servidor. */
  const guardar = (punto, s) => {
    if (enrolando) at.actualizarBio(yo.id, { enrolado: hoyISO() })
    setHecha(at.marcar(yo, tipo, { lat: punto?.lat, lng: punto?.lng, score: s }))
    setPaso('listo')
  }

  /* Paso 1: la ubicación. En la maqueta, un punto dentro de la geocerca (o lejos, si se pide). */
  useEffect(() => {
    if (paso !== 'ubicacion') return
    const tm = setTimeout(() => {
      const d = lejos ? 640 : 18 + Math.round(Math.random() * Math.min(80, radio * 0.5))
      const base = geo || { lat: -17.78, lng: -63.18 }
      const ang = Math.random() * 6.28
      const punto = { lat: base.lat + (d * Math.cos(ang)) / 111320, lng: base.lng + (d * Math.sin(ang)) / (111320 * Math.cos((base.lat * Math.PI) / 180)), distancia: d }
      setPos(punto)
      if (ex.geocerca && d > radio) { setPaso('fuera'); return }
      /* DOS PASOS (propuesta D1): encontrada la ubicación, no avanza sola. La persona decide si sigue con
         su rostro o se arrepiente; cancelar aquí no deja ninguna marca. */
    }, PASO_MS)
    return () => clearTimeout(tm)
  }, [paso, lejos]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Paso 2: el rostro. */
  useEffect(() => {
    if (paso !== 'rostro') return
    let siguiente
    const tm = setTimeout(() => {
      const s = +(0.86 + Math.random() * 0.1).toFixed(2)
      setScore(s)
      siguiente = setTimeout(() => guardar(pos, s), 700)
    }, PASO_MS + 900)
    return () => { clearTimeout(tm); clearTimeout(siguiente) }
  }, [paso]) // eslint-disable-line react-hooks/exhaustive-deps

  /* F1 · CLARO Y CONTINUO (lienzo «Mientras marcas»): la misma piel que la ventana V2, los pasos con
     nombre arriba y una sola cosa grande al centro. */
  const pasos = ex.rostro ? ['ubicacion', 'rostro', 'listo'] : ['ubicacion', 'listo']
  const idx = paso === 'consent' ? -1 : paso === 'fuera' ? 0 : paso === 'listo' ? pasos.length : pasos.indexOf(paso)
  const IconoTipo = tipo === 'entrada' ? LogIn : tipo === 'salida' ? LogOut : Coffee
  const lugar = yo.lugar?.nombre || 'su lugar'
  const enc = paso === 'consent' ? { titulo: 'Antes de usar su rostro', sub: 'Lo que pasa con su cara y su ubicación.' }
    : paso === 'fuera' ? { titulo: 'Está fuera de su lugar', sub: `A ${pos?.distancia} m de ${lugar} · se puede hasta ${radio} m` }
      : paso === 'ubicacion' ? (ex.remotoHoy ? { titulo: pos ? 'Ubicación lista' : 'Buscando su ubicación', sub: 'Hoy es día remoto: vale cualquier lugar.' }
        : pos ? { titulo: 'Está en su lugar', sub: `${lugar} · a ${pos.distancia} m` } : { titulo: 'Buscando su ubicación', sub: `${lugar} · hasta ${radio} m` })
        : paso === 'rostro' ? (score != null ? { titulo: 'Es usted', sub: 'Rostro verificado' }
          : enrolando ? { titulo: 'Registrando su rostro', sub: 'Es la primera vez: quieto, de frente y con buena luz.' }
            : { titulo: 'Mire la cámara', sub: 'Un segundo, quédese quieto · sin lentes oscuros ni gorra' })
          : null
  /* Al volver de la pausa, cuánto duró: lo único que le importa saber. */
  const pausaDuro = (() => { if (tipo !== 'pausa_fin' || !hecha) return null; const ini = [...at.jornadaDe(yo, at.hoy).marcas].reverse().find(m => m.tipo === 'pausa_inicio' && !m.anulada && !m.rechazada && m.min <= hecha.min); return ini ? hecha.min - ini.min : null })()
  const LISTO = { entrada: 'Entrada registrada', pausa_inicio: 'Pausa iniciada', pausa_fin: 'Volvió de su pausa', salida: 'Salida registrada' }
  const diferencia = tipo === 'entrada' && yo.horario?.modo === 'fijo' && hecha ? hecha.min - aMin(yo.horario.entrada) : null

  return (
    <div className="at-flujo claro" role="dialog" aria-modal="true" aria-label={TIPOS_MARCA[tipo].label}>
      <button type="button" className="at-flujo-cerrar" onClick={onCerrar} aria-label="Cerrar"><X size="1.1em" /></button>

      {/* ARRIBA, COMO LA AURORA: qué marcas y en qué paso vas, y un título grande con lo que pasa ahora.
          Reemplaza la fila «Ubicación · Rostro · Listo», que se leía como un formulario. */}
      {enc && (
        <div className="at-flujo-enc">
          <span className="at-flujo-ceja"><IconoTipo size="1.1em" /> {TIPOS_MARCA[tipo].label.toUpperCase()}{paso !== 'listo' && paso !== 'consent' ? ` · ${Math.min(idx + 1, pasos.length)} DE ${pasos.length}` : ''}</span>
          <h2>{enc.titulo}</h2>
          {enc.sub && <p>{enc.sub}</p>}
        </div>
      )}

      <div className={`at-flujo-cuerpo${paso === 'listo' ? ' fin' : ''}`}>
        {paso === 'consent' && (
          <>
            <ul className="at-consent">
              <li>Su teléfono convierte su cara en un código numérico. <b>La empresa nunca compara fotos</b>, compara ese código.</li>
              <li>En cada marcación se envía una <b>selfie reducida</b> como evidencia. Se borra a los {at.ajustesGenerales.retencionSelfies} días.</li>
              <li>También se guarda <b>dónde marcó</b>, solo en el momento de marcar.</li>
              <li>Puede pedir que se borre su rostro cuando quiera, desde RR.HH.</li>
            </ul>
            <div style={{ width: '100%' }}>
              <button type="button" className="at-flujo-btn" onClick={() => { at.actualizarBio(yo.id, { consentimiento: { version: '2026-08-v1', aceptado: hoyISO() } }); setPaso('ubicacion') }}>Acepto y continúo</button>
              <button type="button" className="at-flujo-btn sec" onClick={onCerrar}>Ahora no</button>
            </div>
          </>
        )}

        {(paso === 'ubicacion' || paso === 'fuera') && (
          <>
            <div className="at-flujo-centro">
              <MapaBusqueda buscando={!pos} remoto={ex.remotoHoy} dentro={pos && !ex.remotoHoy ? pos.distancia <= radio : null} />
            </div>
            {/* DÍA REMOTO (propuesta «Mapa sin exigencia»): se busca igual y se muestra dónde está, pero se
                dice claro que hoy no se revisa la oficina, para que no parezca que algo falló. */}
            {ex.remotoHoy && pos && paso === 'ubicacion' && (
              <div className="at-remoto-nota">
                <span className="ico"><Check size="1.1em" strokeWidth={3} /></span>
                <div><b>Remoto · no se revisa la oficina</b><span>Su ubicación queda solo como registro</span></div>
              </div>
            )}
            {paso === 'fuera' ? (
              <div style={{ width: '100%' }}>
                <button type="button" className="at-flujo-btn" onClick={() => { setLejos(false); setPos(null); setPaso('ubicacion') }}><RotateCcw size="1em" style={{ verticalAlign: '-.15em' }} /> Volver a intentar</button>
                <button type="button" className="at-flujo-btn sec" onClick={onCerrar}>Cancelar</button>
              </div>
            ) : pos ? (
              <div className="at-flujo-decide">
                <button type="button" className="at-flujo-btn verde" onClick={() => (ex.rostro ? setPaso('rostro') : guardar(pos, null))} autoFocus>
                  {ex.rostro ? <><ScanFace size="1.2em" /> Escanear rostro</> : <><Check size="1.2em" /> Marcar ahora</>}
                </button>
                <button type="button" className="at-flujo-btn texto" onClick={onCerrar}>Ahora no, cancelar</button>
              </div>
            ) : ex.geocerca && (
              <button type="button" onClick={() => setLejos(true)} style={{ border: 'none', background: 'none', color: '#9AABBB', font: 'inherit', fontSize: '.7em', cursor: 'pointer', textDecoration: 'underline' }}>
                <Navigation size="1em" style={{ verticalAlign: '-.15em' }} /> Demo: probar desde lejos
              </button>
            )}
          </>
        )}

        {paso === 'rostro' && (
          <>
            <div className="at-flujo-centro"><Camara persona={yo} listo={score != null} /></div>
            <Globo via={viaSaludando} titulo={score != null ? '¡Es usted! 🙌' : `Sonría, ${yo.name.split(' ')[0]} 😄`} sub={score != null ? 'Guardando su marca…' : 'Quédese quieto un segundo.'} />
            <div className="at-flujo-pie doble">
              <span><Check size="1.15em" strokeWidth={3} /> Ubicación</span>
              <span className={score != null ? '' : 'ahora'}><ScanFace size="1.15em" /> {score != null ? 'Rostro reconocido' : 'Reconociendo…'}</span>
            </div>
          </>
        )}

        {paso === 'listo' && hecha && (
          <>
            <span className="at-flujo-ok"><Check size="2.6em" strokeWidth={3} /></span>
            <h2 className="at-flujo-tit" style={{ marginTop: '.4em' }}>{LISTO[tipo]}</h2>
            <div className="at-flujo-hora">{hhmm(hecha.min)}</div>
            <Globo via={viaSaludando} {...despedida(tipo, hecha, yo)} />
            {/* Solo lo que la persona necesita saber de esta marca; lo verificado (rostro, distancia) lo ve RR.HH. en el Libro. */}
            {(diferencia != null || tipo === 'salida' || (tipo === 'pausa_inicio' && yo.horario?.pausa > 0) || pausaDuro != null) && (
              <div className="at-flujo-resumen">
                {diferencia != null && (
                  <div><span><Clock size="1.15em" /> Llegada</span><b className={diferencia > (yo.politica?.tolerancia ?? 10) ? 'tarde' : ''}>{diferencia <= 0 ? `${duracion(-diferencia)} antes` : diferencia <= (yo.politica?.tolerancia ?? 10) ? 'Dentro de la tolerancia' : `${duracion(diferencia)} tarde`}</b></div>
                )}
                {tipo === 'pausa_inicio' && yo.horario?.pausa > 0 && <div><span><Clock size="1.15em" /> Vuelve a las</span><b>{hhmm(hecha.min + yo.horario.pausa)}</b></div>}
                {tipo === 'salida' && <div><span><Clock size="1.15em" /> Trabajaste</span><b>{duracion(at.jornadaDe(yo, at.hoy).trabajado)}</b></div>}
                {tipo === 'pausa_fin' && pausaDuro != null && <div><span><Clock size="1.15em" /> Su pausa duró</span><b>{duracion(pausaDuro)}</b></div>}
              </div>
            )}
            <button type="button" className="at-flujo-btn" onClick={onCerrar} style={{ marginTop: '.4em' }}>Listo</button>
          </>
        )}
      </div>
    </div>
  )
}

/* LOS GLOBOS DE VÍA (de la propuesta «Vía te acompaña»): la mascota dice una frase corta en el rostro
   y al terminar. Amigable sin ser cargoso: una línea y, si hace falta, un detalle. */
function Globo({ via, titulo, sub }) {
  return (
    <div className="at-globo">
      <img src={via} alt="" />
      <div className="at-globo-txt"><b>{titulo}</b>{sub && <span>{sub}</span>}</div>
    </div>
  )
}
function despedida(tipo, hecha, yo) {
  if (tipo === 'entrada') return { titulo: '¡Que tenga un gran día! ☀️', sub: 'Su entrada ya quedó guardada.' }
  if (tipo === 'pausa_inicio') return { titulo: '¡Disfrute su pausa! ☕', sub: yo.horario?.pausa ? `Lo esperamos a las ${hhmm(hecha.min + yo.horario.pausa)}.` : 'Aquí lo esperamos.' }
  if (tipo === 'pausa_fin') return { titulo: '¡Qué bueno verlo de vuelta! 💪', sub: 'Seguimos con su jornada.' }
  return { titulo: '¡Buen trabajo hoy! 🌙', sub: 'Descanse, nos vemos en su próxima jornada.' }
}

/* EL MAPA QUE BUSCA: calles, la zona de la sucursal y un haz de luz que gira mientras se busca la
   ubicación. Al encontrarla el haz se detiene y aparece tu punto: dentro de la zona, o afuera en rojo.
   En un día remoto no hay zona: el haz es azul y tu punto es una casita con «Estás aquí». */
function MapaBusqueda({ buscando, dentro, remoto }) {
  return (
    <div className={`at-mapa${dentro === false ? ' fuera' : ''}${remoto ? ' remoto' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="at-mapa-calles"><path d="M-5 32 L105 50 M28 -5 L40 105 M70 -5 L62 105 M-5 78 L105 84" /></svg>
      {!remoto && <span className="at-mapa-zona" />}
      {buscando && <span className="at-mapa-haz" />}
      {buscando ? <span className="at-mapa-centro" />
        : remoto ? <><span className="at-mapa-casa"><House size="1.3em" /></span><span className="at-mapa-aqui">Está aquí</span></>
          : <span className={`at-mapa-punto${dentro === false ? ' fuera' : ''}`} />}
    </div>
  )
}

/* La cámara frontal si el navegador la da; si no, el retrato de la persona. Nunca se guarda nada
   de lo que se ve aquí: en la maqueta es sólo para que se sienta como el teléfono de verdad. */
function Camara({ persona, listo }) {
  const video = useRef(null)
  const [vivo, setVivo] = useState(false)
  useEffect(() => {
    let flujo
    navigator.mediaDevices?.getUserMedia?.({ video: { facingMode: 'user' }, audio: false })
      .then(s => { flujo = s; if (video.current) { video.current.srcObject = s; setVivo(true) } })
      .catch(() => setVivo(false))
    return () => flujo?.getTracks().forEach(tr => tr.stop())
  }, [])
  /* Sin foto en el directorio (los usuarios de la demo), la misma foto que usa el inicio del teléfono. */
  const foto = fotoDe(persona) || avatarUrl(persona.name, 240)
  return (
    <>
      <div className={`at-ovalo${listo ? ' ok' : ''}`}>
        <video ref={video} autoPlay playsInline muted style={{ display: vivo ? 'block' : 'none' }} />
        {!vivo && (foto ? <img src={foto} alt="" /> : <div className="ini" style={{ background: persona.color }}>{persona.initials}</div>)}
        {!listo && <><span className="at-ovalo-malla" /><span className="at-ovalo-linea" /></>}
      </div>
    </>
  )
}
