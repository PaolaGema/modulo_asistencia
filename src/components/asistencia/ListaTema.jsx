import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PartyPopper, ScanFace, MapPinX, MessageSquareQuote, BellRing, X, Check } from 'lucide-react'
import { Vacio } from '../documentacion/comunes'
import Paginacion from '../layout/Paginacion'
import { PersonaAt, Selfie } from './comunes'
import DetalleJornada from './DetalleJornada'
import { TEMAS } from './temasLibro'
import { fechaCorta, DIAS_CORTOS, diaISO, hhmm, duracion, ALERTAS } from '../../data/asistenciaData'

/* ── LA LISTA DE UN TEMA ───────────────────────────────────────────────────
   Cada caso del tema elegido en el Libro (☰ Lista): quién, qué día, qué pasó y su motivo, y «Ver el
   día» abre el detalle, donde se justifica, se completa la salida o se autoriza como extra. */

const POR_PAGINA = 12
const dia = f => `${DIAS_CORTOS[diaISO(f)]} ${fechaCorta(f)}`

export default function ListaTema({ tema, lista, hayAlgo, periodo }) {
  const navigate = useNavigate()
  const [pag, setPag] = useState(1)
  const [detalle, setDetalle] = useState(null)
  const t = TEMAS[tema]
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)

  const abrir = i => {
    const j = i.jornada
    const aviso = {
      faltas: i.justificada ? null : { titulo: 'Falta sin justificar', texto: 'Si tenía permiso, usa «Justificar» abajo.' },
      salidas: { titulo: `Entró a las ${hhmm(j.entrada)} y no marcó la salida`, texto: 'Usa «Agregar marcación» abajo para cargar la salida, con el motivo.' },
      rechazos: { titulo: i.marca?.rechazada === 'rostro' ? `El rostro coincidió solo ${Math.round((i.marca.score || 0) * 100)} %` : `Marcó a ${i.marca?.distancia} m de su lugar`, texto: j.entrada != null ? `Después marcó bien a las ${hhmm(j.entrada)}. Mira la selfie y la distancia abajo.` : 'Mira la selfie y la distancia abajo.' },
      fuera: { titulo: `Se quedó ${duracion(j.fueraDeHorario)} sin horas extra autorizadas`, texto: 'Si correspondía, usa «Autorizar como horas extra» abajo. Si no, no cuenta.' },
      retrasos: null,
    }[tema]
    setDetalle({ persona: i.persona, fecha: i.fecha, incidencia: aviso ? { ...aviso, accion: null } : null })
  }


  return (
    <>
      {lista.length ? (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table at-tabla at-tabla-sol">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Día</th>
                {tema === 'faltas' && <><th>Su horario</th><th>Lugar</th><th>Situación</th></>}
                {tema === 'salidas' && <><th>Entró</th><th>Debía salir</th><th>Lugar</th></>}
                {tema === 'rechazos' && <><th>Por qué</th><th>Después</th></>}
                {tema === 'fuera' && <><th>Debía salir</th><th>Salió</th><th>Tiempo de más</th></>}
                {tema === 'retrasos' && <><th>Qué pasó</th><th>Su motivo</th></>}
                <th aria-label="Acción" />
              </tr>
            </thead>
            <tbody>
              {lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(i => {
                const j = i.jornada
                const h = i.persona.horario
                return (
                  <tr key={i.id} tabIndex={0} onClick={() => abrir(i)} onKeyDown={e => { if (e.key === 'Enter') abrir(i) }}>
                    <td>
                      {tema === 'rechazos' ? (
                        <span className="dc-persona">
                          <Selfie persona={i.persona} marca={i.marca} size={32} />
                          <span className="dc-persona-txt">
                            <span className="dc-persona-nom">{i.persona.name}</span>
                            <span className="dc-persona-sub">{i.persona.unidad} · {i.persona.lugar?.nombre || ''}</span>
                          </span>
                        </span>
                      ) : <PersonaAt persona={i.persona} size={32} />}
                    </td>
                    <td className="at-sol-cuando" style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{dia(i.fecha)}</td>
                    {tema === 'faltas' && <>
                      <td className="num">{h?.modo === 'fijo' ? `${h.entrada}–${h.salida}` : 'Flexible'}</td>
                      <td className="at-sol-cuando">{i.persona.lugar?.nombre || '—'}</td>
                      <td>{i.justificada
                        ? <span className="at-pl t-gris"><i aria-hidden="true" />{j.justificacion?.tipo || 'Justificada'}</span>
                        : <span className="at-pl t-rojo"><i aria-hidden="true" />Sin justificar</span>}</td>
                    </>}
                    {tema === 'salidas' && <>
                      <td className="num">{hhmm(j.entrada)}</td>
                      <td className="num">{h?.modo === 'fijo' ? h.salida : '—'}</td>
                      <td className="at-sol-cuando">{i.persona.lugar?.nombre || '—'}</td>
                    </>}
                    {tema === 'rechazos' && <>
                      <td>{i.marca.rechazada === 'rostro'
                        ? <span className="dc-chip dc-chip-sm dc-t-rojo"><ScanFace size={11} /> Rostro {Math.round((i.marca.score || 0) * 100)} %</span>
                        : <span className="dc-chip dc-chip-sm dc-t-ambar"><MapPinX size={11} /> A {i.marca.distancia} m</span>}</td>
                      <td>{j.entrada != null
                        ? <span className="dc-chip dc-chip-sm dc-t-verde">Marcó bien a las {hhmm(j.entrada)}</span>
                        : <span className="dc-chip dc-chip-sm dc-t-gris">No volvió a marcar</span>}</td>
                    </>}
                    {tema === 'fuera' && <>
                      <td className="num">{h?.salida || '—'}</td>
                      <td className="num">{hhmm(j.salida)}</td>
                      <td className="num" style={{ color: 'var(--dc-azul)' }}>{duracion(j.fueraDeHorario)}</td>
                    </>}
                    {tema === 'retrasos' && <>
                      <td><span className="at-sol-chips">{i.alertas.map(a => <span key={a.tipo} className={`dc-chip dc-chip-sm dc-t-${a.justificacion ? 'gris' : ALERTAS[a.tipo].tono}`}>{ALERTAS[a.tipo].corto} · {duracion(a.min)}</span>)}</span></td>
                      <td>{i.justificada
                        ? <span className="dc-chip dc-chip-sm dc-t-verde"><Check size={11} /> Justificado{i.alertas[0]?.justificacion?.categoria ? ` · ${i.alertas[0].justificacion.categoria}` : ''}</span>
                        : i.pedido?.estado === 'pendiente'
                          ? <button type="button" className="dc-chip dc-chip-sm dc-t-azul" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={e => { e.stopPropagation(); navigate('/asistencia/solicitudes?ver=justificaciones') }}><MessageSquareQuote size={11} /> {i.pedido.categoria} · por responder</button>
                          : i.pedido?.estado === 'rechazada'
                            ? <span className="dc-chip dc-chip-sm dc-t-gris"><X size={11} /> Motivo no aceptado</span>
                            : i.avisada
                              ? <span className="dc-chip dc-chip-sm dc-t-ambar"><BellRing size={11} /> Avisada · sin motivo</span>
                              : <span className="dc-chip dc-chip-sm dc-t-gris">Sin aviso a la persona</span>}</td>
                    </>}
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="at-btn-revisar" onClick={e => { e.stopPropagation(); abrir(i) }}>Ver el día</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Paginacion page={pagina} setPage={setPag} total={lista.length} perPage={POR_PAGINA} nombre={t.nombre} nombreUno={t.uno} />
        </div>
      ) : (
        <div className="dc-tarjeta">
          <Vacio Icono={PartyPopper} titulo={`Nada en ${periodo}`} texto={hayAlgo ? 'Pruebe con otros filtros.' : `No hay ${t.titulo.toLowerCase()} en este período.`} />
        </div>
      )}

      {detalle && <DetalleJornada persona={detalle.persona} fecha={detalle.fecha} incidencia={detalle.incidencia} onCerrar={() => setDetalle(null)} />}
    </>
  )
}
