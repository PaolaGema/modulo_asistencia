import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Clock, CircleDashed, UserX, ScanFace, MapPinX, PartyPopper, Inbox, Timer, BellRing, MessageSquareQuote, X } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Vacio } from '../../components/documentacion/comunes'
import Paginacion from '../../components/layout/Paginacion'
import { BarraBusqueda, FILTRO_VACIO, filtrar, PersonaAt, Selfie } from '../../components/asistencia/comunes'
import DetalleJornada from '../../components/asistencia/DetalleJornada'
import { fechaCorta, DIAS_CORTOS, diaISO, hhmm, duracion, ALERTAS } from '../../data/asistenciaData'

/* ── INCIDENCIAS ───────────────────────────────────────────────────────────
   Lo que salió raro en las marcaciones de los últimos 10 días y que alguien tiene que mirar antes
   del cierre del mes. No son pedidos de nadie (eso es Solicitudes): son hechos que el sistema vio.

   UNA PESTAÑA POR TIPO, DE LO MÁS GRAVE A LO MENOS, y una tabla con solo las columnas que sirven para
   decidir ese tipo. En la fila no se resuelve nada: «Revisar» abre el día entero, con la evidencia y
   las herramientas, y arriba la salida que no cambia el día («dejar como falta», «no es extra»). Lo
   que se resuelve sale de la lista; el menú cuenta lo que queda. */

const TIPOS = [
  { key: 'ausente', label: 'Faltas sin justificar', Icono: UserX, desc: 'Tenían jornada y no marcaron en todo el día. Si tenían permiso, justifíquelo; si no, déjelo como falta.' },
  { key: 'alerta', label: 'Tardanzas y descansos', Icono: Timer, desc: 'Llegadas tarde, descansos excedidos o no marcados y salidas anticipadas sin justificar. La app ya le avisó a cada persona y le pidió el motivo; lo que mande llega a Solicitudes › Justificaciones. Lo que quede así cuenta como injustificado en el cierre.' },
  { key: 'incompleta', label: 'Jornadas sin salida', Icono: CircleDashed, desc: 'Marcaron la entrada y nunca la salida. Sin salida no se pueden contar las horas del día.' },
  { key: 'rechazo', label: 'Marcaciones rechazadas', Icono: ScanFace, desc: 'El rostro no coincidió o estaban lejos de su lugar. Mire la evidencia: puede ser la luz de la entrada o un intento indebido.' },
  { key: 'fuera', label: 'Fuera de horario', Icono: Clock, desc: 'Se quedaron más de 30 minutos después de su jornada sin horas extra autorizadas. No cuenta como hora extra, salvo que lo autorice.' },
]
const POR_PAGINA = 10
const dia = f => `${DIAS_CORTOS[diaISO(f)]} ${fechaCorta(f)}`

export default function Incidencias() {
  const at = useAsistencia()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [busca, setBusca] = useState('')
  const [pag, setPag] = useState(1)
  const [detalle, setDetalle] = useState(null)

  const permitidas = new Set(filtrar(at.personas, filtro).map(p => p.id))
  const texto = busca.trim().toLowerCase()
  const todas = at.incidencias.filter(i => permitidas.has(i.persona.id) && (!texto || [i.persona.name, i.persona.unidad, i.persona.lugar?.nombre].some(v => v?.toLowerCase().includes(texto))))
  const cuenta = k => todas.filter(i => i.tipo === k).length
  const pedido = TIPOS.find(t => t.key === params.get('ver'))?.key
  const tipo = pedido || TIPOS.find(t => cuenta(t.key) > 0)?.key || 'ausente'
  const t = TIPOS.find(x => x.key === tipo)
  const lista = todas.filter(i => i.tipo === tipo)
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)
  const solicitudes = at.horasExtra.filter(x => x.estado === 'pendiente').length + at.solicitudes.filter(x => x.estado === 'pendiente').length

  /* Lo que se dice arriba del día, según el tipo, y la salida que NO cambia el día. */
  const abrir = i => {
    const j = i.jornada
    const aviso = {
      ausente: { titulo: 'Falta sin justificar', texto: 'Si tenía permiso, usa «Justificar» abajo. Si no, déjala como falta: así cuenta en el cierre.', accion: 'Dejar como falta' },
      incompleta: { titulo: `Entró a las ${hhmm(j.entrada)} y no marcó la salida`, texto: 'Usa «Agregar marcación» abajo para cargar la salida, con el motivo.', accion: null },
      rechazo: { titulo: i.marca?.rechazada === 'rostro' ? `El rostro coincidió solo ${Math.round((i.marca.score || 0) * 100)} %` : `Marcó a ${i.marca?.distancia} m de su lugar`, texto: j.entrada != null ? `Después marcó bien a las ${hhmm(j.entrada)}. Mira la selfie y la distancia abajo.` : 'Mira la selfie y la distancia abajo.', accion: 'Ya la revisé' },
      fuera: { titulo: `Se quedó ${duracion(j.fueraDeHorario)} sin horas extra autorizadas`, texto: 'Si correspondía, usa «Autorizar como horas extra» abajo. Si no, no cuenta.', accion: 'No es extra' },
      alerta: { titulo: i.alertas?.map(a => `${ALERTAS[a.tipo].label} (${duracion(a.min)})`).join(' · '), texto: i.pedido?.estado === 'pendiente' ? 'Ya mandó su motivo: respóndelo en Solicitudes › Justificaciones.' : i.avisada ? 'Se le avisó en la app y no mandó motivo. Si lo dejas así, cuenta como injustificado en el cierre.' : 'La app no avisa este caso (Configuración › Avisos al colaborador). Si lo dejas así, cuenta como injustificado en el cierre.', accion: 'Dejar como injustificada' },
    }[i.tipo]
    setDetalle({ persona: i.persona, fecha: i.fecha, incidencia: { ...aviso, onAccion: () => at.descartar(i.id) } })
  }

  return (
    <div className="content-scroll">
      <Cabecera titulo="Incidencias" sub="Lo raro de los últimos 10 días, para revisar antes del cierre.">
        <button type="button" className="dc-btn" onClick={() => navigate('/asistencia/solicitudes')}>
          <Inbox size={14} aria-hidden="true" /> Solicitudes{solicitudes ? ` (${solicitudes})` : ''}
        </button>
      </Cabecera>

      <div className="at-pestanas" role="tablist" aria-label="Tipo de incidencia">
        {TIPOS.map(x => (
          <button key={x.key} type="button" role="tab" aria-selected={tipo === x.key} className={`at-pestana${tipo === x.key ? ' on' : ''}`}
            onClick={() => { setParams({ ver: x.key }, { replace: true }); setPag(1) }}>
            <x.Icono size={13} aria-hidden="true" /> {x.label} <b>{cuenta(x.key)}</b>
          </button>
        ))}
      </div>

      <BarraBusqueda busca={busca} onBusca={v => { setBusca(v); setPag(1) }} placeholder="Buscar persona, unidad o lugar…" filtro={filtro} onFiltro={v => { setFiltro(v); setPag(1) }} lugares={at.lugares} personas={at.personas} />

      <p className="at-inc-explica">{t.desc}</p>

      {lista.length ? (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table at-tabla at-tabla-sol">
            <thead>
              <tr>
                <th>Persona</th>
                <th>Día</th>
                {tipo === 'ausente' && <><th>Su horario</th><th>Lugar</th></>}
                {tipo === 'incompleta' && <><th>Entró</th><th>Debía salir</th><th>Lugar</th></>}
                {tipo === 'rechazo' && <><th>Por qué</th><th>Después</th></>}
                {tipo === 'fuera' && <><th>Debía salir</th><th>Salió</th><th>Tiempo de más</th></>}
                {tipo === 'alerta' && <><th>Qué pasó</th><th>Su motivo</th></>}
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
                      {tipo === 'rechazo' ? (
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
                    {tipo === 'ausente' && <>
                      <td className="num">{h?.modo === 'fijo' ? `${h.entrada}–${h.salida}` : 'Flexible'}</td>
                      <td className="at-sol-cuando">{i.persona.lugar?.nombre || '—'}</td>
                    </>}
                    {tipo === 'incompleta' && <>
                      <td className="num">{hhmm(j.entrada)}</td>
                      <td className="num">{h?.modo === 'fijo' ? h.salida : '—'}</td>
                      <td className="at-sol-cuando">{i.persona.lugar?.nombre || '—'}</td>
                    </>}
                    {tipo === 'rechazo' && <>
                      <td>{i.marca.rechazada === 'rostro'
                        ? <span className="dc-chip dc-chip-sm dc-t-rojo"><ScanFace size={11} /> Rostro {Math.round((i.marca.score || 0) * 100)} %</span>
                        : <span className="dc-chip dc-chip-sm dc-t-ambar"><MapPinX size={11} /> A {i.marca.distancia} m</span>}</td>
                      <td>{j.entrada != null
                        ? <span className="dc-chip dc-chip-sm dc-t-verde">Marcó bien a las {hhmm(j.entrada)}</span>
                        : <span className="dc-chip dc-chip-sm dc-t-gris">No volvió a marcar</span>}</td>
                    </>}
                    {tipo === 'fuera' && <>
                      <td className="num">{h?.salida || '—'}</td>
                      <td className="num">{hhmm(j.salida)}</td>
                      <td className="num" style={{ color: 'var(--dc-azul)' }}>{duracion(j.fueraDeHorario)}</td>
                    </>}
                    {tipo === 'alerta' && <>
                      <td><span className="at-sol-chips">{i.alertas.map(a => <span key={a.tipo} className={`dc-chip dc-chip-sm dc-t-${ALERTAS[a.tipo].tono}`}>{ALERTAS[a.tipo].corto} · {duracion(a.min)}</span>)}</span></td>
                      <td>{i.pedido?.estado === 'pendiente'
                        ? <button type="button" className="dc-chip dc-chip-sm dc-t-azul" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={e => { e.stopPropagation(); navigate('/asistencia/solicitudes?ver=justificaciones') }}><MessageSquareQuote size={11} /> {i.pedido.categoria} · por responder</button>
                        : i.pedido?.estado === 'rechazada'
                          ? <span className="dc-chip dc-chip-sm dc-t-gris"><X size={11} /> Motivo no aceptado</span>
                          : i.avisada
                            ? <span className="dc-chip dc-chip-sm dc-t-ambar"><BellRing size={11} /> Avisada · sin motivo</span>
                            : <span className="dc-chip dc-chip-sm dc-t-gris">Sin aviso a la persona</span>}</td>
                    </>}
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="at-btn-revisar" onClick={e => { e.stopPropagation(); abrir(i) }}>Revisar</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Paginacion page={pagina} setPage={setPag} total={lista.length} perPage={POR_PAGINA} nombre="incidencias" nombreUno="incidencia" />
        </div>
      ) : (
        <div className="dc-tarjeta">
          <Vacio Icono={PartyPopper} titulo={`Nada en «${t.label.toLowerCase()}»`} texto={todas.length ? 'Mire las otras pestañas.' : 'No hay nada que revisar en los últimos 10 días.'} />
        </div>
      )}

      {detalle && <DetalleJornada persona={detalle.persona} fecha={detalle.fecha} incidencia={detalle.incidencia} onCerrar={() => setDetalle(null)} />}
    </div>
  )
}
