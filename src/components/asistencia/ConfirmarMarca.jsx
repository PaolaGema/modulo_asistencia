import { Clock, MapPin, ScanFace, House, Coffee, ArrowRight } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { aMin, hhmm, duracion, accionDelMomento } from '../../data/asistenciaData'
import './asistencia.css'

/* ── ¿MARCAR? — LA VENTANA ANTES DE ESCANEAR (propuesta V2 del lienzo, «la hora manda») ──
   Un toque ya no marca: se abre una ventana centrada con qué se va a marcar, la hora en grande, un chip
   con el estado y un botón a todo el ancho. El escaneo empieza solo al tocar ese botón; un roce en el
   bolsillo abre la ventana, nada más.

   EL CHIP DICE LO QUE ESA MARCA SIGNIFICA: menta si está bien, ámbar si hay algo que saber (atraso,
   fuera de horario, pausa pasada, salir antes). Salir antes de completar la jornada es esta misma
   ventana: ofrece primero la pausa, que es lo que la persona suele querer.

   Lo de la ubicación (fuera de la zona, GPS impreciso) se sabe recién al buscarla, en el paso que sigue.
   El lienzo muestra los diez casos (tablero «V2 · La hora manda, en todos sus casos»).

   Se mide en `em`: vive dentro del teléfono de la demo y en Mi asistencia de escritorio. Ocupa todo su
   contenedor (el teléfono, o la pantalla con `position: fixed`) y se centra en él. */

const QUE = { entrada: 'Vas a marcar tu entrada', pausa_inicio: 'Vas a iniciar tu pausa', pausa_fin: 'Vas a volver de tu pausa', salida: 'Vas a marcar tu salida' }

function estadoDe(tipo, { h, j, ahora, tolerancia, acc, pausaPendiente }) {
  if (tipo === 'entrada') {
    if (h?.modo === 'fijo' && ahora >= aMin(h.salida)) return { tono: 'ojo', chip: `Fuera de tu horario · ${h.entrada} a ${h.salida}`, nota: 'Tu turno ya terminó. Si estás con horas extra autorizadas, márcala igual: RR.HH. la va a revisar.', prin: 'Marcar igual', navy: true }
    const tarde = h?.modo === 'fijo' ? ahora - aMin(h.entrada) : 0
    if (tarde > tolerancia) return { tono: 'ojo', chip: `Llegas ${duracion(tarde)} tarde`, nota: 'Se registra como atraso. Si tuviste un motivo, puedes justificarlo después.' }
    return { tono: 'bien', chip: h?.modo === 'fijo' ? `Llegas a tiempo · tu entrada es ${h.entrada}` : 'Horario flexible' }
  }
  if (tipo === 'pausa_inicio') return { tono: 'bien', icono: Coffee, chip: h?.pausa ? `Tu horario tiene ${h.pausa} min · vuelve ${hhmm(ahora + h.pausa)}` : 'Inicio de pausa' }
  if (tipo === 'pausa_fin') {
    const inicio = [...(j.marcas || [])].reverse().find(m => m.tipo === 'pausa_inicio' && !m.anulada && !m.rechazada)
    const dura = inicio ? ahora - inicio.min : 0
    if (h?.pausa && dura > h.pausa) return { tono: 'ojo', icono: Coffee, chip: `Te pasaste ${duracion(dura - h.pausa)} de tu pausa`, nota: 'Se descuentan de tu jornada.' }
    return { tono: 'bien', icono: Coffee, chip: `Llevas ${duracion(dura)} de pausa` }
  }
  if (acc.temprano) return { tono: 'ojo', chip: `Te faltan ${duracion(acc.falta)} de jornada`, nota: 'Si marcas salida, tu día se cierra y ya no podrás volver a marcar hoy.', antes: pausaPendiente }
  return { tono: 'bien', chip: `Trabajaste ${duracion(j.trabajado)} · jornada completa` }
}

export default function ConfirmarMarca({ tipo, onCancelar, onConfirmar }) {
  const at = useAsistencia()
  const yo = at.yo
  const j = at.jornadaDe(yo, at.hoy)
  const ex = at.exigenciasDe(yo, at.hoy)
  const h = yo.horario
  const t = new Date()
  const ahora = t.getHours() * 60 + t.getMinutes()
  const acc = accionDelMomento(j, h, ahora)
  const pausaPendiente = (h?.pausa || 0) > 0 && !(j.marcas || []).some(m => m.tipo === 'pausa_inicio' && !m.anulada && !m.rechazada)
  const e = estadoDe(tipo, { h, j, ahora, tolerancia: yo.politica?.tolerancia ?? 10, acc, pausaPendiente })
  const Icono = e.icono || Clock

  const linea = ex.remotoHoy ? 'Hoy en remoto · sin verificar ubicación'
    : `${yo.lugar?.nombre || 'Tu lugar de trabajo'}${ex.rostro ? ' · con tu rostro' : ex.geocerca ? ' · con tu ubicación' : ''}`
  const accion = ex.rostro ? <><ScanFace size="1.2em" /> Escanear rostro</> : <><ArrowRight size="1.2em" /> Marcar ahora</>

  return (
    <div className="at-hoja-marca" role="dialog" aria-modal="true" aria-label={QUE[tipo]}>
      <button type="button" className="at-hoja-fondo" aria-label="Cancelar" onClick={onCancelar} />
      <div className="at-hoja-cuerpo at-v2">
        <span className="at-v2-que">{QUE[tipo]}</span>
        <b className="at-v2-hora">{hhmm(ahora)}</b>
        <span className={`at-v2-chip ${e.tono}`}><Icono size="1.15em" /> {e.chip}</span>
        <span className="at-v2-linea">{ex.remotoHoy ? <House size="1.1em" /> : <MapPin size="1.1em" />} {linea}</span>
        {e.nota && <span className="at-v2-nota">{e.nota}</span>}
        <div className="at-v2-botones">
          {e.antes ? (
            <>
              <button type="button" className="prin" onClick={() => onConfirmar('pausa_inicio')} autoFocus><Coffee size="1.2em" /> Mejor, iniciar pausa</button>
              <button type="button" className="sec" onClick={() => onConfirmar('salida')}>Sí, terminar jornada</button>
            </>
          ) : (
            <button type="button" className={`prin${e.navy ? ' navy' : ''}`} onClick={() => onConfirmar(tipo)} autoFocus>
              {e.prin ? <><ScanFace size="1.2em" /> {e.prin}</> : tipo === 'salida' && acc.temprano ? 'Sí, terminar jornada' : accion}
            </button>
          )}
          <button type="button" className="cancelar" onClick={onCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}
