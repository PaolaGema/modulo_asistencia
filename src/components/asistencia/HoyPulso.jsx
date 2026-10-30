import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { aMin, hhmm, duracion, sumarDias, diaISO, mesDe, esAutorizada } from '../../data/asistenciaData'

/* ── DOS PIEZAS DE «HOY» QUE VIENEN DE LA PROPUESTA S (la curva de presencia) ──
   La curva responde «¿cuánta gente está trabajando ahora y cuánta debería?» de un vistazo; «Lo que
   conviene saber» mira hacia atrás (cuatro semanas) para avisar lo que todavía no es un problema. */

const T0 = 6 * 60
const T1 = 22 * 60
const PASO = 10
const ANCHO = 1000
const ALTO = 200
const X = t => ((Math.min(T1, Math.max(T0, t)) - T0) / (T1 - T0)) * ANCHO
const pct = t => `${(X(t) / ANCHO) * 100}%`

/* Lo esperado sale del horario de cada persona esperada hoy (sin vacaciones ni permisos). Un horario
   flexible se cuenta de 09:00 a 18:00. Los turnos que cruzan la medianoche aún no se dibujan. */
function tramoEsperado(p) {
  const h = p.horario
  if (h?.modo === 'fijo') {
    const a = aMin(h.entrada); const b = aMin(h.salida)
    return b > a ? [a, b] : null
  }
  return [9 * 60, 18 * 60]
}

export function CurvaPresencia({ filas, esperadas, ahora, compacta }) {
  const minuto = Math.floor(ahora)
  const curva = useMemo(() => {
    const tramos = esperadas.map(f => tramoEsperado(f.p)).filter(Boolean)
    const esp = []; const real = []
    const trabajandoEn = t => filas.filter(({ j }) => j.entrada != null && j.entrada <= t && (j.salida != null ? t < j.salida : t <= minuto)).length
    for (let t = T0; t <= T1; t += PASO) {
      esp.push([t, tramos.filter(([a, b]) => a <= t && t < b).length])
      if (t <= minuto) real.push([t, trabajandoEn(t)])
    }
    if (minuto > T0 && minuto < T1) real.push([minuto, trabajandoEn(minuto)])
    const esperadoAhora = tramos.filter(([a, b]) => a <= minuto && minuto < b).length
    return { esp, real, tope: Math.max(1, ...esp.map(e => e[1]), ...real.map(r => r[1])), esperadoAhora, ahoraN: real.length ? real[real.length - 1][1] : 0 }
  }, [filas, esperadas, minuto])

  const Y = v => ALTO - (v / curva.tope) * (ALTO - 16)
  const puntos = arr => arr.map(([t, v]) => `${X(t).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')
  const enRango = minuto > T0 && minuto < T1
  const finReal = curva.real.length ? curva.real[curva.real.length - 1][0] : T0
  const faltan = curva.esperadoAhora - curva.ahoraN

  return (
    <section className={`at-q-card at-presencia${compacta ? ' angosta' : ''}`} aria-label="Cuánta gente está trabajando">
      <div className="at-q-card-cab">
        <h2>{compacta ? 'Trabajando ahora' : 'Cuánta gente está trabajando, minuto a minuto'}</h2>
        <span className="at-curva-leyenda">
          <span><i className="hoy" />Hoy</span>
          <span title="Según los horarios, sin quienes están de vacaciones o con permiso"><i className="esp" />Lo esperado</span>
        </span>
      </div>
      <p className="at-curva-resumen">
        {!enRango ? 'La curva cubre de 06:00 a 22:00.'
          : faltan > 0 ? <>A esta hora deberían estar <b>{curva.esperadoAhora}</b> y están <b>{curva.ahoraN}</b>: faltan <b className="rojo">{faltan}</b>.</>
            : <>A esta hora deberían estar <b>{curva.esperadoAhora}</b> y están <b>{curva.ahoraN}</b>. Todo como se esperaba.</>}
      </p>

      <div className="at-curva-lienzo">
        <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1={ALTO - 0.5} x2={ANCHO} y2={ALTO - 0.5} className="base" vectorEffect="non-scaling-stroke" />
          {curva.real.length > 1 && <polygon points={`${X(T0)},${ALTO} ${puntos(curva.real)} ${X(finReal).toFixed(1)},${ALTO}`} className="area" />}
          {curva.real.length > 1 && <polyline points={puntos(curva.real)} className="linea" vectorEffect="non-scaling-stroke" />}
          <polyline points={puntos(curva.esp)} className="esperada" vectorEffect="non-scaling-stroke" />
        </svg>
        {enRango && (
          <>
            <div className="at-curva-ahora" style={{ left: pct(minuto) }} />
            <div className="at-curva-punto" style={{ left: pct(minuto), top: `${(Y(curva.ahoraN) / ALTO) * 100}%` }} />
            <div className={`at-curva-globo${minuto > T1 - 120 ? ' izq' : minuto < T0 + 120 ? ' der' : ''}`} style={{ left: pct(minuto) }}>
              <b>{hhmm(minuto)}</b><span>{curva.ahoraN} trabajando</span>
            </div>
          </>
        )}
      </div>
      <div className="at-curva-eje" aria-hidden="true">
        {(compacta ? [6, 10, 14, 18, 22] : [6, 8, 10, 12, 14, 16, 18, 20, 22]).map(h => <span key={h} style={{ left: pct(h * 60) }}>{String(h).padStart(2, '0')}:00</span>)}
      </div>
    </section>
  )
}

/* ── LO QUE CONVIENE SABER ──
   Patrones, no pendientes: nada de esto se resuelve con un botón, pero todo merece una conversación
   antes de que sea un hábito. Solo aparece lo que hoy tiene algo que contar. */
export function LoQueConviene({ gente, compacta }) {
  const at = useAsistencia()
  const navigate = useNavigate()
  const { hoy, jornadaDe, incidencias, horasExtra } = at

  const saber = useMemo(() => {
    const ids = new Set(gente.map(p => p.id))
    const lista = []

    /* Faltas sin aviso en lunes o viernes, cuatro semanas. */
    let faltas = 0; let bordes = 0
    const quienesFaltan = new Set()
    const tardes = new Map()
    for (let i = 1; i <= 28; i++) {
      const fecha = sumarDias(hoy, -i)
      const dia = diaISO(fecha)
      for (const p of gente) {
        const j = jornadaDe(p, fecha)
        if (j.estado === 'ausente') { faltas++; quienesFaltan.add(p.id); if (dia === 1 || dia === 5) bordes++ }
        if (i <= 14 && j.llegoTarde) tardes.set(p, (tardes.get(p) || 0) + 1)
      }
    }
    if (faltas >= 3) {
      const p = Math.round((bordes / faltas) * 100)
      lista.push({ cifra: `${p} %`, tono: p >= 50 ? 'rojo' : 'gris', titulo: 'de las faltas sin aviso caen en lunes o viernes', detalle: `${faltas} faltas en cuatro semanas, de ${quienesFaltan.size} ${quienesFaltan.size === 1 ? 'persona' : 'personas'}.${p >= 50 ? ' Vale una conversación antes de que sea un hábito.' : ''}`, ir: '/asistencia/incidencias?ver=ausente' })
    }

    /* Llegar tarde una y otra vez. */
    const reincidentes = [...tardes.entries()].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1])
    if (reincidentes.length) {
      const [p1, n1] = reincidentes[0]
      lista.push({ cifra: reincidentes.length, tono: 'ambar', titulo: `${reincidentes.length === 1 ? 'persona llegó' : 'personas llegaron'} tarde 3 veces o más en dos semanas`, detalle: `La que más: ${p1.name} (${n1} veces). Puede ser el horario, el transporte o algo para conversar.`, ir: '/asistencia/registro?ver=semana' })
    }

    /* Menos de 12 horas de descanso entre ayer y hoy. */
    const ayer = sumarDias(hoy, -1)
    const cansados = gente.filter(p => {
      const a = jornadaDe(p, ayer); const h = jornadaDe(p, hoy)
      return a.salida != null && h.entrada != null && (24 * 60 - a.salida) + h.entrada < 12 * 60
    })
    if (cansados.length) lista.push({ cifra: cansados.length, tono: 'rojo', titulo: 'no tuvieron 12 h de descanso entre jornadas', detalle: `Salieron tarde ayer y entraron temprano hoy: ${cansados.slice(0, 2).map(p => p.name.split(' ')[0]).join(', ')}${cansados.length > 2 ? ' y más' : ''}.`, ir: '/asistencia/registro' })

    /* Se quedan después de hora sin horas extra autorizadas. */
    const fuera = new Map()
    incidencias.filter(i => i.tipo === 'fuera' && ids.has(i.persona.id)).forEach(i => fuera.set(i.persona.id, (fuera.get(i.persona.id) || 0) + 1))
    const seQuedan = [...fuera.values()].filter(n => n >= 2).length
    if (seQuedan) lista.push({ cifra: seQuedan, tono: 'azul', titulo: `${seQuedan === 1 ? 'persona se queda' : 'personas se quedan'} después de hora sin horas extra autorizadas`, detalle: 'Dos veces o más en diez días. Si es trabajo de verdad, conviene asignarles horas extra.', ir: '/asistencia/incidencias?ver=fuera' })

    /* Horas extra autorizadas del mes. */
    const mes = mesDe(hoy)
    const delMes = horasExtra.filter(x => esAutorizada(x) && mesDe(x.fecha) === mes && gente.some(p => String(p.id) === String(x.personaId)))
    if (delMes.length) {
      const por = new Map()
      delMes.forEach(x => por.set(String(x.personaId), (por.get(String(x.personaId)) || 0) + aMin(x.hasta) - aMin(x.desde)))
      const total = [...por.values()].reduce((s, n) => s + n, 0)
      const [idTop, minTop] = [...por.entries()].sort((a, b) => b[1] - a[1])[0]
      const top = gente.find(p => String(p.id) === idTop)
      lista.push({ cifra: `${Math.round(total / 60)} h`, tono: 'violeta', titulo: 'de horas extra autorizadas este mes', detalle: `${por.size} ${por.size === 1 ? 'persona' : 'personas'}${top ? `; la que más, ${top.name} (${duracion(minTop)})` : ''}.`, ir: '/asistencia/solicitudes?ver=horas-extra&vista=mes' })
    }
    return lista
  }, [gente, hoy, jornadaDe, incidencias, horasExtra])

  return (
    <section className={`at-q-card oscura at-saber${compacta ? ' angosta' : ''}`} aria-label="Lo que conviene saber">
      <div className="at-q-card-cab at-q-manana-cab"><h2>Lo que conviene saber</h2><span>Patrones de las últimas 4 semanas</span></div>
      {saber.length ? saber.map(s => (
        <button key={s.titulo} type="button" className="at-saber-fila" onClick={() => navigate(s.ir)}>
          <span className={`cifra c-${s.tono}`}>{s.cifra}</span>
          <span className="txt"><b>{s.titulo}</b><span>{s.detalle}</span></span>
          <ChevronRight size={16} aria-hidden="true" className="ir" />
        </button>
      )) : <p className="at-saber-vacio">Nada fuera de lo común en las últimas cuatro semanas.</p>}
    </section>
  )
}
