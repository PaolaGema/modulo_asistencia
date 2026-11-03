import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Download, PartyPopper, ScanFace, MapPinX, MessageSquareQuote, BellRing, X, Check } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Vacio } from '../../components/documentacion/comunes'
import Paginacion from '../../components/layout/Paginacion'
import Desplegable from '../../components/layout/Desplegable'
import { BarraBusqueda, FILTRO_VACIO, filtrar, PersonaAt, Selfie } from '../../components/asistencia/comunes'
import DetalleJornada from '../../components/asistencia/DetalleJornada'
import { fechaCorta, DIAS_CORTOS, diaISO, hhmm, duracion, ALERTAS, diasDelMes, mesDe, mesVecino, nombreMes, descargarCSV } from '../../data/asistenciaData'

/* ── LOS TEMAS DEL LIBRO ───────────────────────────────────────────────────
   Lo que antes era Incidencias, dentro del Libro de asistencia: Faltas, Retrasos y descansos, Salidas
   sin marcar, Marcaciones rechazadas y Fuera de horario. El módulo es solo de asistencia —no paga
   sueldos ni arma planillas—, así que no es una bandeja de pendientes: es el registro visto por tema.
   Cada lista muestra un mes, con el buscador y los filtros de siempre y uno propio (sin justificar,
   justificadas o todas). Una fila abre el día con su detalle, donde se justifica, se completa la
   salida o se autoriza como extra. Exportar baja la lista. */

const TEMAS = {
  faltas: { titulo: 'Faltas', sub: 'Quién tenía jornada y no marcó en todo el día. Las que tienen vacación, permiso o licencia aprobados se ven como justificadas.', nombre: 'faltas', uno: 'falta', situacion: true },
  retrasos: { titulo: 'Retrasos y descansos', sub: 'Llegadas tarde, descansos fuera de su franja o excedidos, descansos sin marcar y salidas anticipadas. Lo justificado deja de contar en contra.', nombre: 'días', uno: 'día', situacion: true },
  salidas: { titulo: 'Salidas sin marcar', sub: 'Marcaron la entrada y nunca la salida. Sin salida no se pueden contar las horas del día: se completa desde el detalle, con el motivo.', nombre: 'jornadas', uno: 'jornada' },
  rechazos: { titulo: 'Marcaciones rechazadas', sub: 'El rostro no coincidió o estaban lejos de su lugar. La selfie y la distancia están en el detalle: puede ser la luz de la entrada o un intento indebido.', nombre: 'marcaciones', uno: 'marcación' },
  fuera: { titulo: 'Fuera de horario', sub: 'Se quedaron 30 minutos o más después de su jornada sin horas extra autorizadas. No cuenta como hora extra, salvo que se autorice desde el detalle.', nombre: 'días', uno: 'día' },
}
const SITUACIONES = [{ valor: 'sin', etiqueta: 'Sin justificar' }, { valor: 'con', etiqueta: 'Justificadas' }, { valor: '', etiqueta: 'Todas' }]
const POR_PAGINA = 12
const dia = f => `${DIAS_CORTOS[diaISO(f)]} ${fechaCorta(f)}`

export default function LibroTema() {
  const { tema } = useParams()
  const at = useAsistencia()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [busca, setBusca] = useState('')
  const [situacion, setSituacion] = useState('sin')
  const [pag, setPag] = useState(1)
  const [detalle, setDetalle] = useState(null)
  const t = TEMAS[tema]
  const mes = params.get('mes') || mesDe(at.hoy)
  const esEsteMes = mes === mesDe(at.hoy)

  /* Los hechos del mes, persona por persona y día por día. Hoy entra solo en lo que ya se sabe
     —un retraso, una marca rechazada—: una falta o una salida sin marcar recién se sabe mañana. */
  const todos = useMemo(() => {
    if (!t) return []
    const lista = []
    for (const fecha of diasDelMes(mes)) {
      if (fecha > at.hoy) break
      const hoy = fecha === at.hoy
      for (const p of at.personas) {
        if (!p.asig) continue
        const j = at.jornadaDe(p, fecha)
        const k = `${p.id}|${fecha}`
        if (tema === 'faltas' && !hoy && (j.estado === 'ausente' || j.estado === 'justificada')) lista.push({ id: k, persona: p, fecha, jornada: j, justificada: j.estado === 'justificada' })
        if (tema === 'salidas' && !hoy && j.estado === 'incompleta') lista.push({ id: k, persona: p, fecha, jornada: j })
        if (tema === 'fuera' && j.fueraDeHorario >= 30 && (!hoy || j.salida != null)) lista.push({ id: k, persona: p, fecha, jornada: j })
        if (tema === 'rechazos') for (const r of j.rechazadas) lista.push({ id: r.id, persona: p, fecha, jornada: j, marca: r })
        if (tema === 'retrasos' && j.alertas.length) {
          const pedido = (at.solicitudes || []).find(s => s.tipo === 'justificacion' && s.fecha === fecha && String(s.personaId) === String(p.id) && s.estado !== 'cancelada')
          const grupo = x => (x.startsWith('pausa') ? 'pausa' : x)
          const avisada = j.alertas.some(a => at.ajustesGenerales.avisar?.[grupo(a.tipo)] !== false)
          lista.push({ id: k, persona: p, fecha, jornada: j, alertas: j.alertas, pedido, avisada, justificada: j.alertas.every(a => a.justificacion) })
        }
      }
    }
    return lista.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
  }, [t, tema, mes, at])

  if (!t) return <Navigate to="/asistencia/registro" replace />

  const permitidas = new Set(filtrar(at.personas, filtro).map(p => p.id))
  const texto = busca.trim().toLowerCase()
  const lista = todos.filter(i => permitidas.has(i.persona.id)
    && (!t.situacion || !situacion || (situacion === 'con' ? i.justificada : !i.justificada))
    && (!texto || [i.persona.name, i.persona.unidad, i.persona.lugar?.nombre].some(v => v?.toLowerCase().includes(texto))))
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)
  const irMes = m => { const n = new URLSearchParams(params); if (m === mesDe(at.hoy)) n.delete('mes'); else n.set('mes', m); setParams(n, { replace: true }); setPag(1) }

  /* Una línea arriba del día que dice qué se está mirando; las acciones que cambian el día están abajo. */
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

  const exportar = () => {
    const cab = { faltas: ['Situación'], retrasos: ['Qué pasó', 'Justificado'], salidas: ['Entró', 'Debía salir'], rechazos: ['Hora', 'Por qué', 'Distancia (m)', 'Similitud del rostro'], fuera: ['Debía salir', 'Salió', 'Tiempo de más (min)'] }[tema]
    const fila = i => {
      const j = i.jornada; const h = i.persona.horario
      if (tema === 'faltas') return [i.justificada ? `Justificada · ${j.justificacion?.tipo || ''}` : 'Sin justificar']
      if (tema === 'retrasos') return [i.alertas.map(a => `${ALERTAS[a.tipo].label} ${Math.round(a.min)} min`).join(' · '), i.justificada ? 'Sí' : 'No']
      if (tema === 'salidas') return [hhmm(j.entrada), h?.salida || '']
      if (tema === 'rechazos') return [hhmm(i.marca.min), i.marca.rechazada === 'rostro' ? 'Rostro' : 'Fuera de su lugar', i.marca.distancia ?? '', i.marca.score != null ? `${Math.round(i.marca.score * 100)} %` : '']
      return [h?.salida || '', hhmm(j.salida), Math.round(j.fueraDeHorario)]
    }
    descargarCSV(`${tema}_${mes}.csv`, [['Fecha', 'Colaborador', 'Código', 'Unidad organizacional', 'Lugar', ...cab], ...lista.map(i => [i.fecha, i.persona.name, i.persona.codigo, i.persona.unidad, i.persona.lugar?.nombre || '', ...fila(i)])])
  }

  return (
    <div className="content-scroll at-libro">
      <Cabecera titulo={t.titulo} sub={t.sub}>
        <div className="at-periodo">
          {!esEsteMes && <button type="button" className="dc-btn dc-btn-sm" onClick={() => irMes(mesDe(at.hoy))}>Ir a este mes</button>}
          <div className="at-dia-nav">
            <button type="button" aria-label="Mes anterior" onClick={() => irMes(mesVecino(mes, -1))}><ChevronLeft size={16} /></button>
            <span>{nombreMes(mes)}</span>
            <button type="button" aria-label="Mes siguiente" disabled={esEsteMes} onClick={() => irMes(mesVecino(mes, 1))}><ChevronRight size={16} /></button>
          </div>
        </div>
      </Cabecera>

      <BarraBusqueda busca={busca} onBusca={v => { setBusca(v); setPag(1) }} placeholder="Buscar persona, unidad o lugar…" filtro={filtro} onFiltro={v => { setFiltro(v); setPag(1) }} lugares={at.lugares} personas={at.personas}>
        {t.situacion && (
          <div className={`dc-filtro at-filtro-estado${situacion ? ' on' : ''}`}>
            <Desplegable valor={situacion} ariaLabel="Filtrar por justificación" opciones={SITUACIONES} onCambio={v => { setSituacion(v); setPag(1) }} />
          </div>
        )}
        <button type="button" className="dc-btn at-exportar" onClick={exportar}><Download size={14} aria-hidden="true" /> Exportar CSV</button>
      </BarraBusqueda>

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
          <Vacio Icono={PartyPopper} titulo={`Nada en ${nombreMes(mes)}`} texto={todos.length ? 'Pruebe con otros filtros.' : `No hay ${t.titulo.toLowerCase()} en este mes.`} />
        </div>
      )}

      {detalle && <DetalleJornada persona={detalle.persona} fecha={detalle.fecha} incidencia={detalle.incidencia} onCerrar={() => setDetalle(null)} />}
    </div>
  )
}
