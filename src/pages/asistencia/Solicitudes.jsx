import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Luggage, Stethoscope, PencilLine, House, Repeat, AlarmClockPlus } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Vacio, Etiqueta } from '../../components/documentacion/comunes'
import Paginacion from '../../components/layout/Paginacion'
import { PersonaAt, BarraBusqueda, FILTRO_VACIO, filtrar } from '../../components/asistencia/comunes'
import DetalleJornada from '../../components/asistencia/DetalleJornada'
import HorasExtra from './HorasExtra'
import RevisarSolicitud from '../../components/asistencia/RevisarSolicitud'
import { TIPOS_SOLICITUD, SUBTIPOS_PERMISO, ESTADOS_SOLICITUD, TIPOS_MARCA, diasHabiles, saldoVacaciones, fechaCorta, aFecha } from '../../data/asistenciaData'

/* ── SOLICITUDES ───────────────────────────────────────────────────────────
   Todo lo que la gente le pide a RR.HH. sobre su tiempo, en un solo lugar y con sub-vistas por tipo
   (como Configuración en Documentación). Lo pide desde la app; RR.HH. responde aquí, y aprobar ya
   aplica el efecto: el día de vacaciones o de licencia deja de ser falta, la corrección carga la
   marcación, el trabajo remoto quita la geocerca.

   PARA DECIDIR, CADA FILA TRAE LO QUE HACE FALTA: el saldo de vacaciones que le queda a la persona,
   cuánta gente le faltaría a su lugar esos días, si adjuntó el respaldo de una licencia. */

const VISTAS = {
  vacaciones: { tipo: 'vacaciones', titulo: 'Vacaciones', Icono: Luggage },
  permisos: { tipo: 'permiso', titulo: 'Permisos y licencias', Icono: Stethoscope },
  'horas-extra': { titulo: 'Horas extra', Icono: AlarmClockPlus },
  correcciones: { tipo: 'correccion', titulo: 'Correcciones de marcación', Icono: PencilLine },
  remoto: { tipo: 'remoto', titulo: 'Trabajo remoto', Icono: House },
  cambios: { tipo: 'cambio', titulo: 'Cambios de turno', Icono: Repeat },
}
const ESTADOS = [
  { key: 'pendiente', label: 'Por responder' },
  { key: 'aprobada', label: 'Aprobadas' },
  { key: 'rechazada', label: 'Rechazadas' },
  { key: 'todas', label: 'Todas' },
]
const POR_PAGINA = 10
const rango = (a, b) => (a === b ? fechaCorta(a) : `${fechaCorta(a)} al ${fechaCorta(b)}`)
const hace = (desde, hoy) => { const d = Math.round((aFecha(hoy) - aFecha(desde)) / 864e5); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días` }

export default function Solicitudes() {
  const [params] = useSearchParams()
  const ver = VISTAS[params.get('ver')] ? params.get('ver') : 'vacaciones'
  if (ver === 'horas-extra') return <HorasExtra />
  return <Lista ver={ver} key={ver} />
}

function Lista({ ver }) {
  const at = useAsistencia()
  const navigate = useNavigate()
  const vista = VISTAS[ver]
  const [estado, setEstado] = useState('pendiente')
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [busca, setBusca] = useState('')
  const [pag, setPag] = useState(1)
  const [detalle, setDetalle] = useState(null)
  const [revisar, setRevisar] = useState(null)

  const gente = useMemo(() => filtrar(at.personas, filtro), [at.personas, filtro])
  const ids = useMemo(() => new Set(gente.map(p => String(p.id))), [gente])
  const texto = busca.trim().toLowerCase()
  const delAlcance = at.solicitudes
    .filter(s => ids.has(String(s.personaId)))
    .map(s => ({ ...s, persona: at.personaPorId.get(String(s.personaId)) }))
    .filter(s => s.persona)
  const delTipo = delAlcance.filter(s => !vista.tipo || s.tipo === vista.tipo)
  const lista = delTipo
    .filter(s => estado === 'todas' || estado === 'saldos' || s.estado === estado)
    .filter(s => !texto || `${s.persona.name} ${s.motivo || ''}`.toLowerCase().includes(texto))
    .sort((a, b) => (estado === 'pendiente' ? (inicio(a) < inicio(b) ? -1 : 1) : (a.cuando < b.cuando ? 1 : -1)))
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)

  /* SALDO DE VACACIONES: el derecho del año según su antigüedad, menos lo ya aprobado en los últimos 12 meses. */
  const saldoDe = p => saldoVacaciones(p, at.solicitudes, at.hoy)
  /* COBERTURA: cuánta gente de su mismo lugar ya estará fuera esos días (aprobado o pedido). */
  const coberturaDe = s => {
    const lugar = s.persona.lugar?.id
    if (!lugar) return null
    const delLugar = at.personas.filter(p => p.lugar?.id === lugar && p.asig)
    const fuera = new Set(at.solicitudes.filter(x => x.id !== s.id && ['vacaciones', 'permiso'].includes(x.tipo) && !['rechazada', 'cancelada'].includes(x.estado) && !x.horaDesde && x.desde <= s.hasta && x.hasta >= s.desde && delLugar.some(p => p.id === x.personaId)).map(x => x.personaId))
    const quedan = delLugar.length - fuera.size - 1
    return { total: delLugar.length, quedan, otros: fuera.size, riesgo: quedan < Math.ceil(delLugar.length * 0.8) }
  }


  return (
    <div className="content-scroll">
      <Cabecera titulo={vista.titulo} sub={vista.sub || TIPOS_SOLICITUD[vista.tipo]?.desc} />

      <div className="at-barra-herr">
        <div className="at-pestanas" role="tablist" aria-label="Estado">
          {[...ESTADOS, ...(ver === 'vacaciones' ? [{ key: 'saldos', label: 'Saldos' }] : [])].map(e => {
            const n = e.key === 'pendiente' ? delTipo.filter(s => s.estado === 'pendiente').length : null
            return <button key={e.key} type="button" role="tab" aria-selected={estado === e.key} className={`at-pestana${estado === e.key ? ' on' : ''}`} onClick={() => { setEstado(e.key); setPag(1) }}>{e.label}{n ? <b>{n}</b> : null}</button>
          })}
        </div>
      </div>
      <BarraBusqueda busca={busca} onBusca={v => { setBusca(v); setPag(1) }} placeholder="Buscar persona o motivo…" filtro={filtro} onFiltro={v => { setFiltro(v); setPag(1) }} lugares={at.lugares} personas={at.personas} />

      {estado === 'saldos' ? (
        <Saldos gente={gente.filter(p => p.asig && (!texto || p.name.toLowerCase().includes(texto)))} saldoDe={saldoDe} navigate={navigate} />
      ) : lista.length ? (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table at-tabla at-tabla-sol">
            <thead><tr><th>Persona</th><th>Solicitud</th><th>Para decidir</th><th>Pedida</th><th>Estado</th><th aria-label="Acción" /></tr></thead>
            <tbody>
              {lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(s => {
                const d = describir(s, saldoDe, coberturaDe)
                const abrir = () => setRevisar(s)
                return (
                  <tr key={s.id} tabIndex={0} onClick={abrir} onKeyDown={e => { if (e.key === 'Enter') abrir() }}>
                    <td><PersonaAt persona={s.persona} size={32} /></td>
                    <td>
                      <span className="at-sol-tit">{d.titulo}</span>
                      <span className="at-sol-sub">{d.detalle}</span>
                    </td>
                    <td><span className="at-sol-chips">{d.chips.length ? d.chips.slice(0, 2).map((c, i) => <span key={i} className={`dc-chip dc-chip-sm dc-t-${c.tono}`}>{c.texto}</span>) : <span className="dc-muted">—</span>}</span></td>
                    <td className="at-sol-cuando">{hace(s.cuando, at.hoy)}</td>
                    <td><Etiqueta tono={ESTADOS_SOLICITUD[s.estado].tono}>{ESTADOS_SOLICITUD[s.estado].label}</Etiqueta></td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className={s.estado === 'pendiente' ? 'at-btn-revisar' : 'dc-btn dc-btn-sm'} onClick={e => { e.stopPropagation(); abrir() }}>
                        {s.estado === 'pendiente' ? 'Revisar' : 'Ver'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Paginacion page={pagina} setPage={setPag} total={lista.length} perPage={POR_PAGINA} nombre="solicitudes" nombreUno="solicitud" />
        </div>
      ) : (
        <div className="dc-tarjeta">
          <Vacio Icono={estado === 'pendiente' ? Check : vista.Icono}
            titulo={estado === 'pendiente' ? 'Nada por responder' : 'Sin solicitudes aquí'}
            texto={estado === 'pendiente' ? 'Cuando alguien pida algo desde la app, aparece aquí para revisarlo.' : 'Pruebe con otro estado u otros filtros.'} />
        </div>
      )}

      {revisar && (() => {
        const d = describir(revisar, saldoDe, coberturaDe)
        const pendiente = revisar.estado === 'pendiente'
        return (
          <RevisarSolicitud
            titulo={`Revisar · ${d.tipo}`} persona={revisar.persona} estado={ESTADOS_SOLICITUD[revisar.estado]}
            datos={d.datos} contexto={[...d.chips, ...d.extra]} efecto={d.efecto}
            efectoRechazo="No se aplica nada: el día sigue como estaba. La persona verá el motivo en su app."
            respondio={revisar.respondio} nota={revisar.nota}
            onAprobar={pendiente ? nota => at.responderSolicitud(revisar.id, 'aprobada', nota) : null}
            onRechazar={pendiente ? motivo => at.responderSolicitud(revisar.id, 'rechazada', motivo) : null}
            onVerDia={revisar.tipo === 'correccion' ? () => { setDetalle({ persona: revisar.persona, fecha: revisar.fecha }); setRevisar(null) } : null}
            accionAprobar={d.sinSaldo ? 'Aprobar igual' : 'Aprobar'}
            onCerrar={() => setRevisar(null)}
          />
        )
      })()}

      {detalle && <DetalleJornada persona={detalle.persona} fecha={detalle.fecha} onCerrar={() => setDetalle(null)} />}
    </div>
  )
}

const inicio = s => s.desde || s.fecha || s.cuando

/* LO QUE SE DICE DE UNA SOLICITUD, en un solo lugar: la fila de la tabla y la ventana de revisión
   leen lo mismo, así que nunca cuentan dos cosas distintas. */
function describir(s, saldoDe, coberturaDe) {
  const sub = SUBTIPOS_PERMISO.find(t => t.key === s.subtipo)
  const chips = []
  const extra = []
  const datos = []
  const marca = (TIPOS_MARCA[s.marca]?.label || 'Marcación').toLowerCase()
  let titulo = ''
  let efecto = ''
  let tipo = TIPOS_SOLICITUD[s.tipo].label
  let sinSaldo = false
  const detalle = s.motivo ? `«${s.motivo}»` : ''

  if (s.tipo === 'vacaciones') {
    const dias = diasHabiles(s.desde, s.hasta, s.persona.horario)
    const saldo = saldoDe(s.persona)
    titulo = `${rango(s.desde, s.hasta)} · ${dias} ${dias === 1 ? 'día hábil' : 'días hábiles'}`
    datos.push(['Días', `${rango(s.desde, s.hasta)} (${dias} hábiles)`], ['Motivo', s.motivo || '—'])
    if (saldo.derecho === 0) chips.push({ tono: 'rojo', texto: 'Aún no cumple un año: sin días de vacación' })
    else if (s.estado === 'pendiente' && dias > saldo.saldo) chips.push({ tono: 'rojo', texto: `Pide ${dias} y le quedan ${saldo.saldo}` })
    else chips.push({ tono: 'azul', texto: `Le quedan ${saldo.saldo} de ${saldo.derecho} días` })
    if (dias > saldo.saldo) {
      sinSaldo = true
      efecto = `del ${rango(s.desde, s.hasta)} quedará como vacaciones, pero no le alcanza el saldo: pide ${dias} y tiene ${saldo.saldo}. Aprobarla es una excepción y quedará registrada así.`
    } else efecto = `del ${rango(s.desde, s.hasta)} quedará como vacaciones y no contará como falta. Se descuentan ${dias} días: le quedarán ${saldo.saldo - dias}.`
  } else if (s.tipo === 'permiso') {
    tipo = sub?.licencia ? 'Licencia' : 'Permiso'
    titulo = `${sub?.label || 'Permiso'} · ${rango(s.desde, s.hasta)}${s.horaDesde ? `, ${s.horaDesde} a ${s.horaHasta}` : ''}`
    datos.push(['Tipo', sub?.label || 'Permiso'], ['Cuándo', `${rango(s.desde, s.hasta)}${s.horaDesde ? ` de ${s.horaDesde} a ${s.horaHasta}` : ' · día completo'}`], ['Motivo', s.motivo || '—'])
    if (sub?.licencia) chips.push(s.respaldo ? { tono: 'verde', texto: `Respaldo: ${s.respaldo}` } : { tono: 'ambar', texto: 'Sin respaldo adjunto' })
    efecto = s.horaDesde ? `podrá ausentarse de ${s.horaDesde} a ${s.horaHasta} el ${fechaCorta(s.desde)}.` : `del ${rango(s.desde, s.hasta)} no contará como falta.`
  } else if (s.tipo === 'correccion') {
    titulo = `${TIPOS_MARCA[s.marca]?.label || 'Marcación'} del ${fechaCorta(s.fecha)} a las ${s.hora}`
    datos.push(['Qué pide', `Cargar la ${marca} del ${fechaCorta(s.fecha)}`], ['Hora', s.hora], ['Motivo', s.motivo || '—'])
    extra.push({ tono: 'gris', texto: 'Antes de aprobar, mira su día: que la hora tenga sentido con sus otras marcaciones.' })
    efecto = `se carga la ${marca} de las ${s.hora} del ${fechaCorta(s.fecha)}, con este motivo y tu nombre. Queda a la vista como corrección.`
  } else if (s.tipo === 'remoto') {
    titulo = `Desde casa · ${rango(s.desde, s.hasta)}`
    datos.push(['Días', rango(s.desde, s.hasta)], ['Motivo', s.motivo || '—'])
    efecto = 'esos días marcará desde donde esté: se controla el rostro y el horario, pero no se exige estar en su lugar de trabajo.'
  } else if (s.tipo === 'cambio') {
    titulo = `${fechaCorta(s.fecha)} · de ${s.turnoDe} a ${s.turnoA}`
    datos.push(['Día', fechaCorta(s.fecha)], ['Cambio', `De ${s.turnoDe} a ${s.turnoA}`], ['Con', s.con || '—'], ['Motivo', s.motivo || '—'])
    efecto = 'queda registrado el cambio de turno de ese día.'
  }
  if (s.estado === 'pendiente' && ['vacaciones', 'permiso'].includes(s.tipo) && !s.horaDesde) {
    const cob = coberturaDe(s)
    if (cob) chips.push(cob.riesgo ? { tono: 'ambar', texto: `Su lugar quedaría con ${cob.quedan} de ${cob.total}` } : { tono: 'verde', texto: `Su lugar sigue cubierto (${cob.quedan} de ${cob.total})` })
  }
  return { tipo, titulo, detalle, chips, extra, datos, sinSaldo, efecto: efecto ? efecto.charAt(0).toUpperCase() + efecto.slice(1) : '' }
}

function Saldos({ gente, saldoDe, navigate }) {
  const [pag, setPag] = useState(1)
  const filas = gente.map(p => ({ p, ...saldoDe(p) })).sort((a, b) => b.saldo - a.saldo)
  const paginas = Math.max(1, Math.ceil(filas.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)
  return (
    <section className="at-card">
      <div className="at-card-cab"><div><h2>Saldos de vacaciones</h2><p>Días por año según la antigüedad (15 de 1 a 5 años, 20 de 5 a 10, 30 desde los 10), menos lo aprobado en los últimos 12 meses.</p></div></div>
      <div style={{ overflowX: 'auto' }}>
        <table className="as-table at-tabla">
          <thead><tr><th>Persona</th><th>Ingreso</th><th>Derecho</th><th>Usados</th><th>Saldo</th><th style={{ width: '24%' }} /></tr></thead>
          <tbody>
            {filas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(f => (
              <tr key={f.p.id} tabIndex={0} onClick={() => navigate(`/asistencia/persona/${f.p.id}`)}>
                <td><PersonaAt persona={f.p} size={30} /></td>
                <td className="num">{f.p.ingreso ? fechaCorta(f.p.ingreso) + ` ${f.p.ingreso.slice(0, 4)}` : '—'}</td>
                <td className="num">{f.derecho ? `${f.derecho} días` : <small>Aún no cumple un año</small>}</td>
                <td className="num">{f.usados}</td>
                <td className="num" style={{ color: f.saldo > 20 ? 'var(--dc-ambar)' : 'var(--dc-verde)' }}>{f.saldo} días{f.saldo > 20 && <small>Mucho acumulado: conviene programarlas</small>}</td>
                <td><span className="at-progreso" style={{ display: 'block', margin: 0 }}><span style={{ width: `${f.derecho ? (f.usados / f.derecho) * 100 : 0}%` }} /></span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Paginacion page={pagina} setPage={setPag} total={filas.length} perPage={POR_PAGINA} nombre="personas" nombreUno="persona" />
      </div>
    </section>
  )
}
