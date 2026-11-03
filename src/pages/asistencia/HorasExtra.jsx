import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Check, Inbox, CalendarClock, Clock, TrendingUp, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Modal, Vacio, Etiqueta } from '../../components/documentacion/comunes'
import Paginacion from '../../components/layout/Paginacion'
import RevisarSolicitud from '../../components/asistencia/RevisarSolicitud'
import { PersonaAt, BarraBusqueda, FILTRO_VACIO, filtrar, Cifra } from '../../components/asistencia/comunes'
import { ESTADOS_EXTRA, ORIGENES_EXTRA, PROYECTOS_DEMO, esAutorizada, fechaLarga, fechaCorta, aMin, duracion, sumarDias, mesDe, mesVecino, nombreMes, diasDelMes, descargarCSV } from '../../data/asistenciaData'

/* ── HORAS EXTRA ───────────────────────────────────────────────────────────
   Quedarse no es trabajar horas extra. Una hora extra existe solo si se autorizó:
     · la persona la PIDE desde la app y RR.HH. la APRUEBA, o
     · RR.HH. la ASIGNA (después de conversarlo con la persona) y la persona la ACEPTA.
   Lo que alguien trabaje después de su horario sin autorización se ve como «fuera de horario»: se
   informa, no se cuenta. Si correspondía, RR.HH. puede autorizarlo después desde el día.

   Si se pagan o se compensan con tiempo libre lo decide cada empresa: esta pantalla solo dice
   cuántas horas se autorizaron y cuántas se trabajaron, por día y por mes. */

const POR_PAGINA = 10
const PESTANAS = [
  { key: 'responder', label: 'Por responder' },
  { key: 'proximas', label: 'Programadas' },
  { key: 'mes', label: 'Resumen del mes' },
  { key: 'historial', label: 'Historial' },
]
const horas = x => `${x.desde}–${x.hasta}`
const largo = x => aMin(x.hasta) - aMin(x.desde)

export default function HorasExtra() {
  const at = useAsistencia()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  /* `vista` y no `ver`: esta pantalla vive dentro de Solicitudes, que ya usa `?ver=horas-extra`. */
  const ver = PESTANAS.some(p => p.key === params.get('vista')) ? params.get('vista') : 'responder'
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [busca, setBusca] = useState('')
  const [pag, setPag] = useState(1)
  const [mes, setMes] = useState(mesDe(at.hoy))
  const [asignar, setAsignar] = useState(false)
  const [revisar, setRevisar] = useState(null)

  const gente = useMemo(() => filtrar(at.personas, filtro), [at.personas, filtro])
  const ids = useMemo(() => new Set(gente.map(p => String(p.id))), [gente])
  const texto = busca.trim().toLowerCase()
  const todas = at.horasExtra
    .filter(x => ids.has(String(x.personaId)))
    .map(x => ({ ...x, persona: at.personaPorId.get(String(x.personaId)) }))
    .filter(x => x.persona && (!texto || `${x.persona.name} ${x.motivo}`.toLowerCase().includes(texto)))

  const porResponder = todas.filter(x => x.estado === 'pendiente').sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
  const esperando = todas.filter(x => x.estado === 'asignada')
  const proximas = todas.filter(x => x.fecha >= at.hoy && (esAutorizada(x) || x.estado === 'asignada')).sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
  const historial = [...todas].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))

  /* EL MES, POR PERSONA: autorizadas contra trabajadas dentro de lo autorizado. */
  const resumen = useMemo(() => {
    const dias = new Set(diasDelMes(mes))
    const m = new Map()
    for (const x of todas) {
      if (!dias.has(x.fecha) || !esAutorizada(x)) continue
      if (!m.has(x.personaId)) m.set(x.personaId, { persona: x.persona, autorizado: 0, trabajado: 0, dias: new Set() })
      const g = m.get(x.personaId)
      g.autorizado += largo(x)
      g.dias.add(x.fecha)
    }
    for (const g of m.values()) for (const f of g.dias) if (f <= at.hoy) g.trabajado += at.jornadaDe(g.persona, f).extra
    return [...m.values()].sort((a, b) => b.autorizado - a.autorizado)
  }, [todas, mes, at])
  const totMes = k => resumen.reduce((s, g) => s + g[k], 0)

  const lista = ver === 'responder' ? porResponder : ver === 'proximas' ? proximas : ver === 'historial' ? historial : resumen
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)
  const deLaPagina = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
  const irA = v => { const n = new URLSearchParams(params); if (v === 'responder') n.delete('vista'); else n.set('vista', v); setParams(n, { replace: true }); setPag(1) }

  const exportar = () => descargarCSV(`horas_extra_${mes}.csv`, [
    ['Código', 'Colaborador', 'Unidad organizacional', 'Días con horas extra', 'Autorizadas (h)', 'Trabajadas dentro de lo autorizado (h)'],
    ...resumen.map(g => [g.persona.codigo, g.persona.name, g.persona.unidad, g.dias.size, (g.autorizado / 60).toFixed(2), (g.trabajado / 60).toFixed(2)]),
  ])

  return (
    <div className="content-scroll">
      <Cabecera titulo="Horas extra" sub="Solo cuentan las autorizadas. Quedarse más tiempo no las genera.">
        <button type="button" className="pl-btn-new" onClick={() => setAsignar(true)}><Plus size={14} aria-hidden="true" /> Asignar horas extra</button>
      </Cabecera>

      <div className="at-cifras">
        <Cifra Icono={Inbox} tono="ambar" rotulo="Por responder" valor={porResponder.length} detalle="Pedidas desde la app" onClick={() => irA('responder')} activo={ver === 'responder'} />
        <Cifra Icono={CalendarClock} tono="azul" rotulo="Esperando que acepten" valor={esperando.length} detalle="Asignadas por RR.HH." onClick={() => irA('proximas')} activo={ver === 'proximas'} />
        <Cifra Icono={Clock} tono="violeta" rotulo={`Autorizadas en ${nombreMes(mesDe(at.hoy)).split(' ')[0]}`} valor={duracion(todas.filter(x => esAutorizada(x) && mesDe(x.fecha) === mesDe(at.hoy)).reduce((s, x) => s + largo(x), 0), { corto: true })} detalle="horas : minutos" onClick={() => irA('mes')} activo={ver === 'mes'} />
        <Cifra Icono={TrendingUp} tono="verde" rotulo="Trabajadas este mes" valor={duracion(mes === mesDe(at.hoy) ? totMes('trabajado') : 0, { corto: true })} detalle="Dentro de lo autorizado" onClick={() => irA('mes')} />
      </div>

      <div className="at-barra-herr">
        <div className="at-pestanas" role="tablist" aria-label="Vista">
          {PESTANAS.map(t => (
            <button key={t.key} type="button" role="tab" aria-selected={ver === t.key} className={`at-pestana${ver === t.key ? ' on' : ''}`} onClick={() => irA(t.key)}>
              {t.label}{t.key === 'responder' && porResponder.length > 0 && <b>{porResponder.length}</b>}
            </button>
          ))}
        </div>
      </div>
      <BarraBusqueda busca={busca} onBusca={v => { setBusca(v); setPag(1) }} placeholder="Buscar persona o motivo…" filtro={filtro} onFiltro={v => { setFiltro(v); setPag(1) }} lugares={at.lugares} personas={at.personas} />

      {ver === 'mes' ? (
        <section className="at-card">
          <div className="at-card-cab">
            <div className="at-dia-nav">
              <button type="button" aria-label="Mes anterior" onClick={() => setMes(mesVecino(mes, -1))}><ChevronLeft size={16} /></button>
              <span>{nombreMes(mes)}</span>
              <button type="button" aria-label="Mes siguiente" onClick={() => setMes(mesVecino(mes, 1))}><ChevronRight size={16} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="dc-muted" style={{ fontSize: 12.5 }}>{duracion(totMes('autorizado'), { corto: true })} autorizadas · {duracion(totMes('trabajado'), { corto: true })} trabajadas</span>
              <button type="button" className="dc-btn dc-btn-sm" onClick={exportar}><Download size={13} /> CSV</button>
            </div>
          </div>
          {resumen.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="as-table at-tabla">
                <thead><tr><th>Colaborador</th><th>Días</th><th>Horas autorizadas</th><th>Horas trabajadas</th><th style={{ width: '28%' }}>Uso</th></tr></thead>
                <tbody>
                  {deLaPagina.map(g => (
                    <tr key={g.persona.id} tabIndex={0} onClick={() => navigate(`/asistencia/persona/${g.persona.id}?mes=${mes}`)}>
                      <td><PersonaAt persona={g.persona} size={30} /></td>
                      <td className="num">{g.dias.size}</td>
                      <td className="num">{duracion(g.autorizado)}</td>
                      <td className="num" style={{ color: 'var(--dc-azul)' }}>{duracion(g.trabajado)}</td>
                      <td><span className="at-progreso" style={{ display: 'block', margin: 0 }}><span style={{ width: `${g.autorizado ? Math.min(100, (g.trabajado / g.autorizado) * 100) : 0}%` }} /></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Paginacion page={pagina} setPage={setPag} total={resumen.length} perPage={POR_PAGINA} nombre="personas" nombreUno="persona" />
            </div>
          ) : <Vacio Icono={Clock} titulo="Sin horas extra autorizadas en este mes" texto="Cuando RR.HH. apruebe o asigne horas extra, aparecen aquí con lo que cada persona trabajó dentro de ellas." />}
        </section>
      ) : lista.length ? (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table at-tabla at-tabla-sol">
            <thead><tr><th>Colaborador</th><th>Día y horario</th><th>Motivo</th><th>Quién la originó</th><th>Estado</th><th aria-label="Acción" /></tr></thead>
            <tbody>
              {deLaPagina.map(x => {
                const abrir = () => setRevisar(x)
                const accion = x.estado === 'pendiente' ? 'Revisar' : 'Ver'
                return (
                  <tr key={x.id} tabIndex={0} onClick={abrir} onKeyDown={e => { if (e.key === 'Enter') abrir() }}>
                    <td><PersonaAt persona={x.persona} size={32} /></td>
                    <td>
                      <span className="at-sol-tit">{fechaCorta(x.fecha)} · {horas(x)}</span>
                      <span className="at-sol-sub">{duracion(largo(x))}{x.fecha < at.hoy && esAutorizada(x) ? ` · trabajó ${duracion(at.jornadaDe(x.persona, x.fecha).extra)}` : ''}</span>
                    </td>
                    <td><span className="at-sol-sub" style={{ marginTop: 0, color: 'var(--text-heading)' }}>{x.motivo}</span></td>
                    <td className="at-sol-cuando">{ORIGENES_EXTRA[x.origen]}</td>
                    <td><Etiqueta tono={ESTADOS_EXTRA[x.estado].tono}>{ESTADOS_EXTRA[x.estado].label}</Etiqueta></td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className={x.estado === 'pendiente' ? 'at-btn-revisar' : 'dc-btn dc-btn-sm'} onClick={e => { e.stopPropagation(); abrir() }}>{accion}</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Paginacion page={pagina} setPage={setPag} total={lista.length} perPage={POR_PAGINA} nombre="horas extra" nombreUno="hora extra" />
        </div>
      ) : (
        <div className="dc-tarjeta">
          <Vacio Icono={ver === 'responder' ? Check : CalendarClock}
            titulo={ver === 'responder' ? 'No hay solicitudes por responder' : ver === 'proximas' ? 'No hay horas extra programadas' : 'Todavía no hay horas extra'}
            texto={ver === 'responder' ? 'Cuando alguien pida horas extra desde la app, aparece aquí para revisarla.' : 'Asigne horas extra a quien las necesite: la persona las acepta desde su app.'}>
            {ver !== 'responder' && <button type="button" className="pl-btn-new" onClick={() => setAsignar(true)}><Plus size={14} /> Asignar horas extra</button>}
          </Vacio>
        </div>
      )}

      {revisar && (() => {
        const x = revisar
        const pendiente = x.estado === 'pendiente'
        const cancelable = (esAutorizada(x) || x.estado === 'asignada') && x.fecha >= at.hoy
        const yaTiene = at.horasExtra.filter(o => o.id !== x.id && o.personaId === x.personaId && esAutorizada(o) && mesDe(o.fecha) === mesDe(x.fecha)).reduce((t, o) => t + largo(o), 0)
        return (
          <RevisarSolicitud
            titulo="Revisar · Horas extra" persona={x.persona} estado={ESTADOS_EXTRA[x.estado]}
            datos={[['Día', fechaLarga(x.fecha)], ['Horario', `${horas(x)} (${duracion(largo(x))})`], ['Motivo', x.motivo], x.proyecto && ['Proyecto', x.proyecto], ['Origen', ORIGENES_EXTRA[x.origen]], ['Aprueba', x.respondio || x.aprobador || 'RR.HH.']]}
            contexto={[
              { tono: 'azul', texto: `Ya tiene ${duracion(yaTiene)} de horas extra autorizadas en ${nombreMes(mesDe(x.fecha)).split(' ')[0]}` },
              x.persona.horario?.modo === 'fijo' && { tono: 'gris', texto: `Su horario ese día termina a las ${x.persona.horario.salida}` },
            ]}
            efecto={pendiente ? `lo que trabaje de ${horas(x)} el ${fechaCorta(x.fecha)} contará como horas extra. Si se queda más tiempo, ese tiempo no cuenta.` : ''}
            efectoRechazo={pendiente ? 'Si igual se queda, ese tiempo no contará como horas extra. La persona verá el motivo en su app.' : 'Las horas dejan de estar autorizadas: lo que trabaje ese día después de su horario no contará como horas extra. La persona lo verá en su app.'}
            respondio={x.respondio} nota={x.nota}
            onAprobar={pendiente ? nota => at.responderExtra(x.id, 'aprobada', nota) : null}
            onRechazar={pendiente || cancelable ? motivo => at.responderExtra(x.id, 'rechazada', motivo) : null}
            accionRechazar={pendiente ? 'Rechazar' : 'Cancelar las horas extra'}
            onCerrar={() => setRevisar(null)}
          />
        )
      })()}

      {asignar && <ModalAsignar gente={gente.filter(p => p.asig)} onCerrar={() => setAsignar(false)} />}
    </div>
  )
}

function ModalAsignar({ gente, onCerrar }) {
  const at = useAsistencia()
  const [sel, setSel] = useState(() => new Set())
  const [busca, setBusca] = useState('')
  const [fecha, setFecha] = useState(sumarDias(at.hoy, 1))
  const [desde, setDesde] = useState('18:00')
  const [hasta, setHasta] = useState('20:00')
  const [motivo, setMotivo] = useState('')
  const [proyecto, setProyecto] = useState('')
  const texto = busca.trim().toLowerCase()
  const visibles = gente.filter(p => !texto || `${p.name} ${p.unidad} ${p.lugar?.nombre || ''}`.toLowerCase().includes(texto)).slice(0, 60)
  const alternar = id => setSel(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const valido = sel.size > 0 && aMin(hasta) > aMin(desde) && motivo.trim().length >= 4 && fecha >= at.hoy
  return (
    <Modal titulo="Asignar horas extra" Icono={CalendarClock} onCerrar={onCerrar} ancho={620}
      pie={<>
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="pl-btn-save" disabled={!valido} onClick={() => { at.asignarExtra([...sel], { fecha, desde, hasta, motivo: motivo.trim(), proyecto: proyecto.trim() || null, aprobador: at.yo?.name }); onCerrar() }}>
          Asignar{sel.size ? ` a ${sel.size}` : ''}
        </button>
      </>}>
      <div className="at-modal-campos">
        <p className="at-ayuda">Conversa antes con cada persona. La verá en su app y tendrá que aceptarla; recién entonces cuenta como hora extra.</p>
        <div className="at-tres">
          <label className="at-campo"><span>Fecha</span><input type="date" className="pl-input" value={fecha} min={at.hoy} onChange={e => setFecha(e.target.value)} /></label>
          <label className="at-campo"><span>Desde</span><input type="time" className="pl-input" value={desde} onChange={e => setDesde(e.target.value)} /></label>
          <label className="at-campo"><span>Hasta</span><input type="time" className="pl-input" value={hasta} onChange={e => setHasta(e.target.value)} /></label>
        </div>
        <div className="at-dos">
          <label className="at-campo"><span>Motivo <em>lo verá la persona</em></span><input className="pl-input" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej.: cierre de inventario del mes" /></label>
          <label className="at-campo"><span>Proyecto o centro de costo <em>opcional</em></span><input className="pl-input" list="at-proyectos" value={proyecto} onChange={e => setProyecto(e.target.value)} placeholder="Ej.: Proyecto X" /></label>
          <datalist id="at-proyectos">{PROYECTOS_DEMO.map(p => <option key={p} value={p} />)}</datalist>
        </div>
        <div className="at-campo">
          <span>¿Para quién? {sel.size > 0 && <em>{sel.size} {sel.size === 1 ? 'persona elegida' : 'personas elegidas'}</em>}</span>
          <div className="pl-search-wrap" style={{ maxWidth: 'none' }}>
            <Search size={13} className="pl-search-ico" />
            <input type="search" className="pl-search" placeholder="Buscar por nombre, unidad o lugar…" value={busca} onChange={e => setBusca(e.target.value)} aria-label="Buscar persona" />
          </div>
          <div className="at-elegir-gente">
            {visibles.map(p => (
              <label key={p.id} className={sel.has(p.id) ? 'on' : ''}>
                <input type="checkbox" className="at-check" checked={sel.has(p.id)} onChange={() => alternar(p.id)} />
                <PersonaAt persona={p} size={28} />
                <span className="dc-muted" style={{ fontSize: 11.5, marginLeft: 'auto', whiteSpace: 'nowrap' }}>{p.horario?.modo === 'fijo' ? `Sale ${p.horario.salida}` : 'Flexible'}</span>
              </label>
            ))}
          </div>
        </div>
        {aMin(hasta) <= aMin(desde) && <div className="at-aviso-linea" style={{ background: 'var(--dc-ambar-bg)', color: 'var(--dc-ambar)' }}>La hora «hasta» tiene que ser después de «desde».</div>}
        <p className="at-ayuda">{fechaCorta(fecha)} de {desde} a {hasta}: {duracion(Math.max(0, aMin(hasta) - aMin(desde)))} por persona. Al marcar la salida se valida contra esta franja: solo lo trabajado dentro de ella cuenta como hora extra.</p>
      </div>
    </Modal>
  )
}
