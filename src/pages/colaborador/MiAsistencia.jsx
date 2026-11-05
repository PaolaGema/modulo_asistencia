import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Building2, Warehouse, House, Clock, Flame, FileDown, Loader2 } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera } from '../../components/documentacion/comunes'
import Marcador from '../../components/asistencia/Marcador'
import ReporteMes from '../../components/asistencia/ReporteMes'
import { EstadoChip, COLOR_ESTADO } from '../../components/asistencia/comunes'
import { ESTADOS, DIAS_CORTOS, MODALIDADES, diasDelMes, diaISO, mesDe, mesVecino, nombreMes, hhmm, duracion, aFecha } from '../../data/asistenciaData'

/* ── MI ASISTENCIA ─────────────────────────────────────────────────────────
   Lo mismo que el colaborador tiene en el teléfono, en escritorio: a la izquierda el marcador, a la
   derecha su mes. Ve exactamente los números que ve RR.HH. —no hay una versión «para el empleado»—,
   que es lo que evita la discusión de fin de mes. */

export default function MiAsistencia() {
  const at = useAsistencia()
  const yo = at.yo
  const [mes, setMes] = useState(mesDe(at.hoy))
  const [sel, setSel] = useState(null)
  const [armando, setArmando] = useState(false)
  const [errorPdf, setErrorPdf] = useState(false)
  /* «Marcar entrada» del Inicio web llega con el paso ya confirmado (?marcar=entrada): va directo al escaneo. */
  const [params, setParams] = useSearchParams()
  const [marcar] = useState(() => params.get('marcar'))
  // Se lee una vez y se quita de la dirección: al recargar, no vuelve a abrir el escaneo.
  useEffect(() => { if (params.get('marcar')) setParams({}, { replace: true }) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const dias = useMemo(() => diasDelMes(mes).map(d => ({ d, j: d <= at.hoy ? at.jornadaDe(yo, d) : null })), [mes, yo, at])  
  const pasados = dias.filter(x => x.j && x.j.estado !== 'libre')
  const conEntrada = pasados.filter(x => x.j.entrada != null)
  const aTiempo = conEntrada.filter(x => !x.j.llegoTarde).length
  let racha = 0
  for (const x of [...conEntrada].reverse()) { if (x.j.llegoTarde) break; racha++ }
  const cerrados = pasados.filter(x => x.d !== at.hoy || x.j.salida != null)
  const trabajado = cerrados.reduce((s, x) => s + x.j.trabajado, 0)
  const programado = cerrados.reduce((s, x) => s + x.j.programado, 0)
  const elegido = sel ? dias.find(x => x.d === sel)?.j : null
  const Ico = yo.asig?.modalidad === 'remoto' ? House : yo.lugar?.tipo === 'centro' ? Warehouse : Building2

  return (
    <div className="content-scroll">
      <Cabecera titulo="Mi asistencia" sub="Marque su entrada y su salida, y mire su mes con los mismos números que ve RR.HH.">
        {/* El reporte del mes que está mirando, en PDF: el mismo que baja RR.HH. desde su ficha. */}
        <button type="button" className="dc-btn dc-btn-sm" disabled={armando} onClick={() => { setErrorPdf(false); setArmando(true) }}>
          {armando ? <Loader2 size={13} className="at-gira" /> : <FileDown size={13} />} {armando ? 'Armando el PDF…' : `Descargar ${nombreMes(mes).split(' ')[0]} en PDF`}
        </button>
      </Cabecera>
      {errorPdf && <p className="at-ayuda" style={{ color: 'var(--dc-rojo, #B42318)' }}>No se pudo armar el PDF. Pruebe de nuevo.</p>}
      {armando && <ReporteMes p={yo} mes={mes} onListo={e => { setArmando(false); if (e) setErrorPdf(true) }} />}
      <div className="at-mia">
        <div className="at-mia-tel"><Marcador iniciar={marcar} /></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div className="at-cifras">
            <div className="at-cifra"><span className="at-cifra-rot">Trabajado en {nombreMes(mes).split(' ')[0]}</span><span className="at-cifra-val">{duracion(trabajado, { corto: true })}</span><span className="at-cifra-det">de {duracion(programado, { corto: true })} programadas</span></div>
            <div className="at-cifra"><span className="at-cifra-rot">Puntualidad</span><span className="at-cifra-val">{conEntrada.length ? `${Math.round((aTiempo / conEntrada.length) * 100)}%` : '—'}</span><span className="at-cifra-det">{aTiempo} de {conEntrada.length} días a tiempo</span></div>
            <div className="at-cifra t-verde"><span className="at-cifra-top"><span className="at-cifra-ico"><Flame size={15} /></span><span className="at-cifra-rot">Racha</span></span><span className="at-cifra-val">{racha}</span><span className="at-cifra-det">días seguidos a tiempo</span></div>
          </div>

          <section className="at-card">
            <div className="at-card-cab">
              <div className="at-dia-nav">
                <button type="button" aria-label="Mes anterior" onClick={() => { setMes(mesVecino(mes, -1)); setSel(null) }}><ChevronLeft size={16} /></button>
                <span>{nombreMes(mes)}</span>
                <button type="button" aria-label="Mes siguiente" disabled={mes >= mesDe(at.hoy)} onClick={() => { setMes(mesVecino(mes, 1)); setSel(null) }}><ChevronRight size={16} /></button>
              </div>
              <div className="at-ficha-tags" style={{ marginTop: 0 }}>
                {yo.lugar && <span className="at-tag"><Ico size={12} /> {yo.asig?.modalidad === 'remoto' ? 'Remoto' : yo.lugar.nombre}</span>}
                {yo.asig && <span className="at-tag">{MODALIDADES[yo.asig.modalidad].label}</span>}
                {yo.horario && <span className="at-tag"><Clock size={12} /> {yo.horario.modo === 'fijo' ? `${yo.horario.entrada}–${yo.horario.salida}` : 'Flexible'}</span>}
              </div>
            </div>
            <div className="at-card-cuerpo">
              <div className="at-cal">
                {[1, 2, 3, 4, 5, 6, 7].map(d => <div key={d} className="at-cal-dow">{DIAS_CORTOS[d]}</div>)}
                {Array.from({ length: diaISO(`${mes}-01`) - 1 }).map((_, i) => <div key={`h${i}`} className="at-cal-dia fuera" />)}
                {dias.map(({ d, j }) => {
                  const est = j ? j.estado : 'libre'
                  return (
                    <button key={d} type="button" disabled={!j} className={`at-cal-dia e-${est}${!j ? ' futuro' : ''}${d === at.hoy ? ' hoy' : ''}${sel === d ? ' sel' : ''}`} onClick={() => setSel(d)}>
                      <span className="at-cal-num">{aFecha(d).getDate()}</span>
                      {j && j.entrada != null && <span className="at-cal-h">{hhmm(j.entrada)}<br />{j.salida != null ? hhmm(j.salida) : '…'}</span>}
                      {j && j.entrada == null && est !== 'libre' && <span className="at-cal-h">{ESTADOS[est].label}</span>}
                    </button>
                  )
                })}
              </div>
              <div className="at-cal-ley">
                {['presente', 'tarde', 'extra', 'incompleta', 'ausente', 'justificada'].map(e => <span key={e}><i style={{ background: COLOR_ESTADO[e] }} /> {ESTADOS[e].label}</span>)}
              </div>
            </div>
          </section>

          {elegido && (
            <section className="at-card">
              <div className="at-card-cab"><div><h2 style={{ textTransform: 'capitalize' }}>{DIAS_CORTOS[diaISO(sel)]} {aFecha(sel).getDate()}</h2><p>{elegido.entrada != null ? `${hhmm(elegido.entrada)} – ${hhmm(elegido.salida)} · ${duracion(elegido.trabajado)} trabajadas` : elegido.justificacion ? `${elegido.justificacion.tipo}` : 'Sin marcaciones'}</p></div><EstadoChip estado={elegido.estado} /></div>
              {(elegido.estado === 'incompleta' || elegido.estado === 'ausente') && (
                <div className="at-card-cuerpo"><div className="at-aviso-linea">¿Falta algo? Escríbele a RR.HH. desde Mis solicitudes: ellos pueden completar la marcación con el motivo.</div></div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
