import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Luggage, Stethoscope, PencilLine, House, Repeat, AlarmClockPlus, MessageSquareQuote, CheckCircle2, CheckCheck } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Vacio, Etiqueta } from '../../components/documentacion/comunes'
import Paginacion from '../../components/layout/Paginacion'
import Desplegable from '../../components/layout/Desplegable'
import { PersonaAt, BarraBusqueda, FILTRO_VACIO, filtrar } from '../../components/asistencia/comunes'
import DetalleJornada from '../../components/asistencia/DetalleJornada'
import HorasExtra from './HorasExtra'
import RevisarLote from './RevisarLote'
import RevisarSolicitud from '../../components/asistencia/RevisarSolicitud'
import { Papeleta } from '../../components/layout/VacacionPhone'
import { Hoja } from '../../components/layout/PermisoPhone'
import PapeletaCorreccion from '../../components/asistencia/PapeletaCorreccion'
import { cambiosDe, NOMBRE_MARCA } from '../../utils/correccion'
import { armarPapeleta } from '../../utils/papeletaVacacion'
import { armarHojaPermiso } from '../../utils/papeletaPermiso'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { TIPOS_SOLICITUD, SUBTIPOS_PERMISO, ESTADOS_SOLICITUD, ALERTAS, saldoVacaciones, diasDeSolicitud, incluyeDia, habilesDeSolicitud, textoDias, fechaCorta, aFecha, duracion, mesDe } from '../../data/asistenciaData'

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
  justificaciones: { tipo: 'justificacion', titulo: 'Justificaciones', Icono: MessageSquareQuote },
  correcciones: { tipo: 'correccion', titulo: 'Correcciones de marcación', Icono: PencilLine },
  remoto: { tipo: 'remoto', titulo: 'Trabajo remoto', Icono: House },
  cambios: { tipo: 'cambio', titulo: 'Cambios de turno', Icono: Repeat },
}
/* El estado es un filtro más, en una lista desplegable junto al buscador; arranca en «Pendientes»,
   que es lo que hay que hacer. «Saldos» no es un estado: es otra vista, arriba a la derecha. */
const ESTADOS = [
  { key: 'pendiente', label: 'Pendientes', punto: '#F5B04F' },
  { key: 'aprobada', label: 'Aprobadas', punto: '#2FCB8B' },
  { key: 'rechazada', label: 'Rechazadas', punto: '#94A3B8' },
  { key: 'cancelada', label: 'Canceladas', punto: '#C9D3DC' },
]
const POR_PAGINA = 10
const QUE = { vacaciones: 'las vacaciones', justificacion: 'la justificación', correccion: 'la corrección', remoto: 'el trabajo remoto', cambio: 'el cambio de turno' }
/* Qué dice la segunda columna, según lo que se pide. */
const COL_PIDE = { vacaciones: 'Fechas y motivo', permiso: 'Permiso o licencia', justificacion: 'Qué justifica', correccion: 'Qué corrige', remoto: 'Días y motivo', cambio: 'Qué turno cambia' }
const rango = (a, b) => (a === b ? fechaCorta(a) : `${fechaCorta(a)} al ${fechaCorta(b)}`)
/* Los días de una solicitud: un tramo («3 nov al 7 nov») o, si son sueltos, la lista («mié 11 y lun 16 nov»). */
const cuando = s => (s.dias?.length ? textoDias(s.dias, s.persona?.horario) : rango(s.desde, s.hasta))
const delS = s => (s.dias?.length ? `los días ${textoDias(s.dias, s.persona?.horario)}` : `del ${rango(s.desde, s.hasta)}`)
/* La fecha en que la pidió, y debajo cuánto hace. */
const fechaSolicitud = f => { const d = aFecha(String(f).slice(0, 10)); return `${d.getDate()} ${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][d.getMonth()]} ${d.getFullYear()}` }
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
  const [params, setParams] = useSearchParams()
  const vista = VISTAS[ver]
  const [estado, setEstado] = useState('pendiente')
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [busca, setBusca] = useState('')
  const [pag, setPag] = useState(1)
  const [detalle, setDetalle] = useState(null)
  const [revisar, setRevisar] = useState(null)
  const { empresa } = useOnboardingData()
  /* REVISAR EN LOTE (A3 en grande, 5 nov 2026): las correcciones pendientes se aprueban en lote desde una
     pantalla propia (RevisarLote), no desde casillas en esta tabla. Se abre con «Revisar en lote» y vive en la
     URL (?ver=correcciones&lote=1), así «Atrás» vuelve a la lista. */
  const modoLote = vista.tipo === 'correccion' && params.get('lote') === '1'
  const irLote = on => setParams(prev => { const n = new URLSearchParams(prev); if (on) n.set('lote', '1'); else n.delete('lote'); return n })
  const [aviso, setAviso] = useState(null)
  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 4200)
    return () => clearTimeout(t)
  }, [aviso])

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
  /* LO QUE YA JUSTIFICÓ ESE MES: para que el jefe vea si es la primera vez o la quinta. */
  const historialDe = s => {
    const delMes = at.solicitudes.filter(x => x.tipo === 'justificacion' && x.id !== s.id && String(x.personaId) === String(s.personaId) && mesDe(x.fecha) === mesDe(s.fecha))
    return { aceptadas: delMes.filter(x => x.estado === 'aprobada').length, rechazadas: delMes.filter(x => x.estado === 'rechazada').length, pendientes: delMes.filter(x => x.estado === 'pendiente').length }
  }
  /* COBERTURA: cuánta gente de su mismo lugar ya estará fuera esos días (aprobado o pedido). */
  const coberturaDe = s => {
    const lugar = s.persona.lugar?.id
    if (!lugar) return null
    const delLugar = at.personas.filter(p => p.lugar?.id === lugar && p.asig)
    const fuera = new Set(at.solicitudes.filter(x => x.id !== s.id && ['vacaciones', 'permiso'].includes(x.tipo) && !['rechazada', 'cancelada'].includes(x.estado) && !x.horaDesde && diasDeSolicitud(s).some(d => incluyeDia(x, d)) && delLugar.some(p => p.id === x.personaId)).map(x => x.personaId))
    const quedan = delLugar.length - fuera.size - 1
    return { total: delLugar.length, quedan, otros: fuera.size, riesgo: quedan < Math.ceil(delLugar.length * 0.8) }
  }

  const visibles = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
  /* Todas las correcciones pendientes (sin los filtros de esta lista: la pantalla del lote tiene los suyos). */
  const ventanas = <Ventanas revisar={revisar} setRevisar={setRevisar} at={at} empresa={empresa} saldoDe={saldoDe} coberturaDe={coberturaDe} historialDe={historialDe} aviso={aviso} detalle={detalle} setDetalle={setDetalle} />
  const correccionesPendientes = vista.tipo === 'correccion' ? delAlcance.filter(s => s.tipo === 'correccion' && s.estado === 'pendiente') : []

  if (modoLote) return (
    <div className="content-scroll">
      <RevisarLote pendientes={correccionesPendientes} onVolver={() => irLote(false)} onRevisar={setRevisar}
        onAprobadas={n => setAviso(n === 1 ? 'Se aprobó 1 corrección y se corrigió su día' : `Se aprobaron ${n} correcciones y se corrigieron sus días`)} />
      {ventanas}
    </div>
  )

  return (
    <div className="content-scroll">
      <Cabecera titulo={vista.titulo} sub={vista.sub || TIPOS_SOLICITUD[vista.tipo]?.desc}>
        {vista.tipo === 'correccion' && correccionesPendientes.length > 1 && (
          <button type="button" className="at-btn-ok" onClick={() => irLote(true)}><CheckCheck size={14} aria-hidden="true" /> Revisar en lote · {correccionesPendientes.length}</button>
        )}
        {ver === 'vacaciones' && (
          <div className="at-segmento" role="tablist" aria-label="Vista">
            <button type="button" role="tab" aria-selected={estado !== 'saldos'} className={estado !== 'saldos' ? 'on' : ''} onClick={() => { setEstado('pendiente'); setPag(1) }}>Solicitudes</button>
            <button type="button" role="tab" aria-selected={estado === 'saldos'} className={estado === 'saldos' ? 'on' : ''} onClick={() => { setEstado('saldos'); setPag(1) }}>Saldos</button>
          </div>
        )}
      </Cabecera>

      <BarraBusqueda busca={busca} onBusca={v => { setBusca(v); setPag(1) }} placeholder="Buscar colaborador o motivo…" filtro={filtro} onFiltro={v => { setFiltro(v); setPag(1) }} lugares={at.lugares} personas={at.personas}>
        {estado !== 'saldos' && (
          <div className={`dc-filtro at-filtro-estado${estado !== 'todas' ? ' on' : ''}`}>
            <Desplegable valor={estado === 'todas' ? '' : estado} ariaLabel="Filtrar por estado" placeholder="Todos los estados" anchoMenu={250} claseBoton="at-dd-estados"
              onCambio={v => { setEstado(v || 'todas'); setPag(1) }}
              opciones={[
                { valor: '', etiqueta: 'Todos los estados', lateral: String(delTipo.length), separada: true },
                ...ESTADOS.map(e => { const n = delTipo.filter(s => s.estado === e.key).length; return { valor: e.key, etiqueta: e.label, punto: e.punto, lateral: String(n), apagada: !n } }),
              ]}
              contenido={o => (
                <span className="pl-dd-trigger-estado">
                  {o?.punto && <i style={{ background: o.punto }} aria-hidden="true" />}
                  <span>{o ? o.etiqueta : 'Todos los estados'}</span>
                  <b>{o ? o.lateral : delTipo.length}</b>
                </span>
              )} />
          </div>
        )}
      </BarraBusqueda>

      {estado === 'saldos' ? (
        <Saldos gente={gente.filter(p => p.asig && (!texto || p.name.toLowerCase().includes(texto)))} saldoDe={saldoDe} navigate={navigate} />
      ) : lista.length ? (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table at-tabla at-tabla-sol">
            <thead><tr>
              <th>Colaborador</th><th>{COL_PIDE[vista.tipo] || 'Qué pide'}</th><th>A tener en cuenta</th><th>Fecha de solicitud</th><th>Estado</th><th aria-label="Acción" />
            </tr></thead>
            <tbody>
              {visibles.map(s => {
                const d = describir(s, saldoDe, coberturaDe, historialDe)
                const abrir = () => setRevisar(s)
                return (
                  <tr key={s.id} tabIndex={0} onClick={abrir} onKeyDown={e => { if (e.key === 'Enter') abrir() }}>
                    <td><PersonaAt persona={s.persona} size={32} /></td>
                    <td>
                      <span className="at-sol-tit">{d.titulo}</span>
                      <span className="at-sol-sub">{d.detalle}</span>
                    </td>
                    <td><span className="at-sol-chips">{d.chips.length ? d.chips.slice(0, 2).map((c, i) => <span key={i} className={`dc-chip dc-chip-sm dc-t-${c.tono}`}>{c.texto}</span>) : <span className="dc-muted">—</span>}</span></td>
                    <td className="at-sol-cuando"><b className="at-sol-fecha">{fechaSolicitud(s.cuando)}</b><small>{hace(s.cuando, at.hoy)}</small></td>
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
            titulo={estado === 'pendiente' ? 'Nada pendiente' : 'Sin solicitudes aquí'}
            texto={estado === 'pendiente' ? 'Cuando alguien pida algo desde la app, aparece aquí para revisarlo.' : 'Pruebe con otro estado u otros filtros.'} />
        </div>
      )}

      {ventanas}
    </div>
  )
}

/* SE COMPARTE ENTRE LA LISTA Y LA PANTALLA DEL LOTE: abrir una solicitud, el aviso y su día. */
function Ventanas({ revisar, setRevisar, at, empresa, saldoDe, coberturaDe, historialDe, aviso, detalle, setDetalle }) {
  return (
    <>
      {revisar && (() => {
        const d = describir(revisar, saldoDe, coberturaDe, historialDe)
        /* LA PROPIA SE PUEDE RESPONDER (con una sola persona en RR.HH. nadie más podría), pero de a una, con aviso
           antes de decidir, y queda registrado que se la aprobó a sí misma. En lote no entra. */
        const propia = String(revisar.personaId) === String(at.yo?.id)
        const pendiente = revisar.estado === 'pendiente'
        const esJust = revisar.tipo === 'justificacion'
        /* LA PAPELETA QUE FIRMÓ LA PERSONA, tal cual le llegó a RR.HH., con el sello de lo que se decidió.
           Las solicitudes sembradas no guardaron su número: se numeran por orden de llegada. */
        const delTipoTodas = at.solicitudes.filter(x => x.tipo === revisar.tipo).sort((a, b) => (a.cuando < b.cuando ? -1 : 1))
        const numero = revisar.papeleta || `${(revisar.cuando || at.hoy).slice(0, 4)}-${String(delTipoTodas.findIndex(x => x.id === revisar.id) + 1).padStart(4, '0')}`
        const firma = { estado: revisar.estado, quien: revisar.respondio, cuando: revisar.respondida ? fechaCorta(String(revisar.respondida).slice(0, 10)) : '' }
        const ctx = { yo: revisar.persona, persona: revisar.persona, empresa, solicitudes: at.solicitudes, lugarPorId: at.lugarPorId, hoy: at.hoy, numero }
        const documento = revisar.tipo === 'vacaciones' ? <Papeleta p={{ ...armarPapeleta({ ...revisar, papeleta: numero }, ctx) }} firma={firma} />
          : revisar.tipo === 'permiso' ? <Hoja {...armarHojaPermiso(revisar, ctx)} firma={firma} />
          : revisar.tipo === 'correccion' ? <PapeletaCorreccion s={revisar} persona={revisar.persona} empresa={empresa} numero={numero} firma={firma} /> : null
        const lic = revisar.tipo === 'permiso' && SUBTIPOS_PERMISO.find(t => t.key === revisar.subtipo)?.licencia
        return (
          <RevisarSolicitud
            titulo={`Revisar · ${d.tipo}`} persona={revisar.persona} estado={ESTADOS_SOLICITUD[revisar.estado]}
            datos={d.datos} contexto={[...(propia && pendiente ? [{ tono: 'ambar', texto: 'Es su propia solicitud. Puede responderla, pero quedará registrado en la auditoría que la respondió usted. Si hay otra persona en RR.HH., mejor que la revise esa persona.' }] : []), ...d.chips, ...d.extra]} efecto={d.efecto}
            efectoRechazo={esJust ? `Seguirá contando como ${ALERTAS[revisar.alerta]?.label.toLowerCase() || 'incidencia'} injustificada en el Libro de asistencia. La persona verá el motivo en su app.` : 'No se aplica nada: el día sigue como estaba. La persona verá el motivo en su app.'}
            respondio={revisar.respondio && revisar.propia ? `${revisar.respondio} (su propia solicitud)` : revisar.respondio} nota={revisar.nota}
            onAprobar={pendiente ? nota => at.responderSolicitud(revisar.id, 'aprobada', nota) : null}
            onRechazar={pendiente ? motivo => at.responderSolicitud(revisar.id, 'rechazada', motivo) : null}
            onVerDia={revisar.tipo === 'correccion' || esJust ? () => { setDetalle({ persona: revisar.persona, fecha: revisar.fecha }); setRevisar(null) } : null}
            accionAprobar={d.sinSaldo ? 'Aprobar igual' : esJust ? 'Aceptar el motivo' : 'Aprobar'}
            accionRechazar={esJust ? 'No aceptar' : 'Rechazar'}
            documento={documento}
            que={revisar.tipo === 'permiso' ? (lic ? 'la licencia' : 'el permiso') : QUE[revisar.tipo]}
            excepcion={d.sinSaldo ? 'No le alcanza el saldo: aprobarla es una excepción y quedará registrada así.' : null}
            onCerrar={() => setRevisar(null)}
          />
        )
      })()}

      {aviso && <div className="md-aviso" role="status"><CheckCircle2 size={15} aria-hidden="true" /> {aviso}</div>}

      {detalle && <DetalleJornada persona={detalle.persona} fecha={detalle.fecha} onCerrar={() => setDetalle(null)} />}
    </>
  )
}

const inicio = s => s.desde || s.fecha || s.cuando

/* LO QUE SE DICE DE UNA SOLICITUD, en un solo lugar: la fila de la tabla y la ventana de revisión
   leen lo mismo, así que nunca cuentan dos cosas distintas. */
function describir(s, saldoDe, coberturaDe, historialDe) {
  const sub = SUBTIPOS_PERMISO.find(t => t.key === s.subtipo)
  const chips = []
  const extra = []
  const datos = []
  let titulo = ''
  let efecto = ''
  let tipo = TIPOS_SOLICITUD[s.tipo].label
  let sinSaldo = false
  const detalle = s.motivo ? `«${s.motivo}»` : ''

  if (s.tipo === 'vacaciones') {
    const dias = habilesDeSolicitud(s, s.persona.horario)
    const saldo = saldoDe(s.persona)
    titulo = `${cuando(s)} · ${dias} ${dias === 1 ? 'día hábil' : 'días hábiles'}`
    datos.push(['Días', `${cuando(s)} (${dias} hábiles)`], ['Motivo', s.motivo || '—'])
    if (saldo.derecho === 0) chips.push({ tono: 'rojo', texto: 'Aún no cumple un año: sin días de vacación' })
    else if (s.estado === 'pendiente' && dias > saldo.saldo) chips.push({ tono: 'rojo', texto: `Pide ${dias} y le quedan ${saldo.saldo}` })
    else chips.push({ tono: 'azul', texto: `Le quedan ${saldo.saldo} de ${saldo.derecho} días` })
    if (dias > saldo.saldo) {
      sinSaldo = true
      efecto = `${delS(s)} quedará como vacaciones, pero no le alcanza el saldo: pide ${dias} y tiene ${saldo.saldo}. Aprobarla es una excepción y quedará registrada así.`
    } else efecto = `${delS(s)} quedará como vacaciones y no contará como falta. Se descuentan ${dias} días: le quedarán ${saldo.saldo - dias}.`
  } else if (s.tipo === 'permiso') {
    tipo = sub?.licencia ? 'Licencia' : 'Permiso'
    titulo = `${sub?.label || 'Permiso'} · ${cuando(s)}${s.horaDesde ? `, ${s.horaDesde} a ${s.horaHasta}` : ''}`
    datos.push(['Tipo', sub?.label || 'Permiso'], ['Cuándo', `${cuando(s)}${s.horaDesde ? ` de ${s.horaDesde} a ${s.horaHasta}` : ' · día completo'}`], ['Motivo', s.motivo || '—'])
    if (sub?.licencia) chips.push(s.respaldo ? { tono: 'verde', texto: `Respaldo: ${s.respaldo}` } : { tono: 'ambar', texto: 'Sin respaldo adjunto' })
    efecto = s.horaDesde ? `podrá ausentarse de ${s.horaDesde} a ${s.horaHasta} el ${fechaCorta(s.desde)}.` : `${delS(s)} no contará como falta.`
  } else if (s.tipo === 'correccion') {
    /* Corregir su día: uno o varios cambios (cambiar una hora, agregar la que faltaba, quitar una de más). */
    const cs = cambiosDe(s)
    const uno = c => (c.quitar ? `Quitar ${NOMBRE_MARCA[c.tipo]?.toLowerCase() || 'marca'} de más (${c.antes})` : `${NOMBRE_MARCA[c.tipo] || 'Marcación'} ${c.antes ? `${c.antes} → ` : ''}${c.hora}`)
    titulo = cs.length === 1 ? `${uno(cs[0])} · ${fechaCorta(s.fecha)}` : `${cs.length} cambios en su día · ${fechaCorta(s.fecha)}`
    datos.push(['Día', fechaCorta(s.fecha)], ...cs.map((c, i) => [cs.length > 1 ? `Cambio ${i + 1}` : 'Qué cambia', uno(c)]), ['Motivo', s.motivo || '—'], s.respaldo && ['Justificación', s.respaldo])
    if (s.respaldo) chips.push({ tono: 'azul', texto: `Comprobar: ${s.respaldo}` })
    extra.push({ tono: 'gris', texto: 'Antes de aprobar, mire su día: que las horas tengan sentido con sus otras marcaciones.' })
    efecto = `${cs.length === 1 ? 'se corrige su día' : `se aplican los ${cs.length} cambios`} del ${fechaCorta(s.fecha)} sobre las marcas que ya tiene (sin duplicarlas), con este motivo y su nombre. Queda a la vista como corrección.`
  } else if (s.tipo === 'remoto') {
    titulo = `Desde casa · ${cuando(s)}`
    datos.push(['Días', cuando(s)], ['Motivo', s.motivo || '—'])
    efecto = 'esos días marcará desde donde esté: se controla el rostro y el horario, pero no se exige estar en su lugar de trabajo.'
  } else if (s.tipo === 'justificacion') {
    const al = ALERTAS[s.alerta]
    const cuanto = s.minutos ? duracion(s.minutos, { seg: true }) : ''
    tipo = 'Justificación'
    titulo = `${al?.label || 'Incidencia'}${cuanto ? ` · ${cuanto}` : ''} · ${fechaCorta(s.fecha)}`
    datos.push(['Qué pasó', `${al?.label || 'Incidencia'}${cuanto ? `: ${cuanto}` : ''} el ${fechaCorta(s.fecha)}`], ['Motivo', s.categoria || '—'], ['En sus palabras', s.motivo ? `«${s.motivo}»` : '—'], s.avisada && ['Aviso', `La app le avisó el mismo día y respondió ${s.cuando === s.fecha ? 'ese día' : `el ${fechaCorta(s.cuando)}`}`])
    const h = historialDe?.(s)
    if (h) chips.push(h.aceptadas + h.rechazadas ? { tono: h.rechazadas || h.aceptadas >= 3 ? 'ambar' : 'gris', texto: `Este mes: ${h.aceptadas} aceptadas, ${h.rechazadas} no aceptadas` } : { tono: 'verde', texto: 'Primera justificación del mes' })
    if (s.categoria) chips.push({ tono: 'azul', texto: s.categoria })
    extra.push({ tono: 'gris', texto: 'Mira su día: la hora de cada marcación, al segundo, y si fue algo puntual.' })
    efecto = `${(al?.label || 'la incidencia').toLowerCase()} del ${fechaCorta(s.fecha)} queda justificada: no cuenta como injustificada en el cierre ni en los reportes de puntualidad.`
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
          <thead><tr><th>Colaborador</th><th>Fecha de ingreso</th><th>Días por año</th><th>Días usados</th><th>Días disponibles</th><th style={{ width: '24%' }} /></tr></thead>
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
