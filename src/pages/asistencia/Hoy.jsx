import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Plus, UserX, Clock, Luggage, Inbox, Store, ScanFace, TrendingUp, CircleDashed, Check, TriangleAlert, Search } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { useUser } from '../../context/UserContext'
import { Vacio, Modal } from '../../components/documentacion/comunes'
import Avatar from '../../components/personas/Avatar'
import Desplegable from '../../components/layout/Desplegable'
import Paginacion from '../../components/layout/Paginacion'
import { EstadoDia, PersonaAt, BarraDia, FiltrosOrg, FILTRO_VACIO, filtrar } from '../../components/asistencia/comunes'
import DetalleJornada from '../../components/asistencia/DetalleJornada'
import CalendarioAsistencia from '../../components/asistencia/CalendarioAsistencia'
import { CurvaPresencia, LoQueConviene } from '../../components/asistencia/HoyPulso'
import viaSaludando from '../../assets/imagenes/via_saludando.png'
import { ahora, relojDemo, fechaLarga, hhmm, minutosAhora, aMin, duracion, sumarDias, esDiaLaboral } from '../../data/asistenciaData'

/* ── HOY ───────────────────────────────────────────────────────────────────
   La pantalla con la que RR.HH. empieza la mañana (propuesta Q del lienzo de diseño). Responde, en
   este orden, lo que se pregunta quien la abre:
     1. ¿Cómo vamos?                      → el titular y el reloj sobre el arco de la jornada.
     2. ¿Es un día normal?                → cada cifra se compara con el mismo día de semanas atrás.
     3. ¿Qué tengo que resolver?          → «Requiere tu atención», lo urgente arriba.
     4. ¿Dónde?                           → solo las sucursales y centros que preocupan.
     5. ¿Quién falta justificado?        → vacaciones, permisos y licencias: nunca son faltas.
     6. ¿Qué viene mañana?                → lo ya aprobado y dónde no alcanzaría la gente.
     7. ¿Quiénes son?                     → la lista, que abre en los que faltan sin aviso.

   LA AUSENCIA JUSTIFICADA NO SE ESPERA. Quien está de vacaciones o con permiso aprobado sale de los
   «esperados»: así «Sin marcar» son solo las faltas de verdad.

   EL MÍNIMO PARA OPERAR, mientras no se configure por sucursal, es el 80 % de su gente esperada. */

const MINIMO = 0.8
const POR_PAGINA = 10
const MAX_LISTA = 5
const PESTANAS = [
  { key: 'sinMarcar', label: 'No han llegado', punto: '#E5484D', filtro: f => f.j.estado === 'sinMarcar' },
  { key: 'tarde', label: 'Llegaron tarde', punto: '#F5B04F', filtro: f => f.j.llegoTarde },
  { key: 'trabajando', label: 'Trabajando', punto: '#2FCB8B', filtro: f => ['trabajando', 'pausa'].includes(f.j.estado) },
  { key: 'porLlegar', label: 'Aún no les toca', punto: '#94A3B8', filtro: f => f.j.estado === 'porLlegar' },
  { key: 'aviso', label: 'Vacaciones y permisos', punto: '#C9D3DC', filtro: f => f.j.estado === 'justificada' },
  { key: 'todos', label: 'Todos', filtro: () => true },
]

/* LAS MISMAS PIEZAS QUE EL DASHBOARD DE INICIO. La tarjeta muestra hasta MAX_LISTA y el chip de la
   cabecera lleva a la pantalla que sí sabe mostrar todo; al pie se dice qué quedó fuera, porque un
   recorte silencioso se lee como «esto es todo». */
function VerTodos({ total, texto, accion = 'Ver', onClick }) {
  return (
    <a href="#" className="chip-link" onClick={e => { e.preventDefault(); onClick() }}>
      {total > MAX_LISTA ? `Ver ${texto} ${total} →` : `${accion} →`}
    </a>
  )
}
function Truncado({ total, donde }) {
  if (total <= MAX_LISTA) return null
  return <div className="at-q-truncado">Mostrando {MAX_LISTA} de {total} · el resto está en {donde}</div>
}

function useReloj() {
  const [t, setT] = useState(() => ahora())
  useEffect(() => { const i = setInterval(() => setT(ahora()), 1000); return () => clearInterval(i) }, [])
  return t
}

const enHoras = min => min / 60
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`
/* Primero lo que no abrió, después lo que está bajo su mínimo, al final lo que solo tiene faltas sueltas. */
const gravedad = g => (g.cerrada ? 3 : g.ok < g.minimo && g.porLlegar === 0 ? 2 : 1)

export default function Hoy() {
  const at = useAsistencia()
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const reloj = useReloj()
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [pestana, setPestana] = useState('sinMarcar')
  const [lugarSel, setLugarSel] = useState('')
  const [busca, setBusca] = useState('')
  const [pag, setPag] = useState(1)
  const [detalle, setDetalle] = useState(null)
  const [elegir, setElegir] = useState(false)

  const { personas, jornadaDe, hoy, horarioPorId, justificacionDe } = at
  const ahora = minutosAhora()
  const cincoMin = Math.floor(ahora / 5)
  const gente = useMemo(() => filtrar(personas.filter(p => p.asig), filtro), [personas, filtro])
  const filas = useMemo(() => gente.map(p => ({ p, j: jornadaDe(p, hoy) })), [gente, jornadaDe, hoy])
  const conAviso = filas.filter(f => f.j.estado === 'justificada')
  const esperadas = filas.filter(f => !['libre', 'justificada'].includes(f.j.estado))
  const llegaron = esperadas.filter(f => f.j.entrada != null)
  const sinMarcar = esperadas.filter(f => f.j.estado === 'sinMarcar')
  const tarde = llegaron.filter(f => f.j.llegoTarde)
  const pct = esperadas.length ? Math.round((llegaron.length / esperadas.length) * 100) : 0
  const puntualidad = llegaron.length ? ((llegaron.length - tarde.length) / llegaron.length) * 100 : null

  /* ¿ES UN DÍA NORMAL? El mismo día de la semana, las cuatro semanas anteriores, a esta misma hora. */
  const normal = useMemo(() => {
    const semanas = [1, 2, 3, 4].map(k => {
      const fecha = sumarDias(hoy, -7 * k)
      let faltan = 0; let llegados = 0; let tardes = 0
      for (const p of gente) {
        const j = jornadaDe(p, fecha)
        if (['libre', 'justificada'].includes(j.estado)) continue
        const limite = p.horario?.modo === 'fijo' ? aMin(p.horario.entrada) + (p.politica?.tolerancia ?? 10) : 11 * 60
        if (j.entrada != null && j.entrada <= ahora) { llegados++; if (j.llegoTarde) tardes++ } else if (limite <= ahora) faltan++
      }
      return { faltan, puntualidad: llegados ? ((llegados - tardes) / llegados) * 100 : null }
    })
    const conDatos = semanas.filter(s => s.puntualidad != null)
    return {
      faltan: Math.round(semanas.reduce((s, x) => s + x.faltan, 0) / semanas.length),
      puntualidadPasada: semanas[0].puntualidad,
      hay: conDatos.length > 0,
    }
  }, [gente, jornadaDe, hoy, cincoMin]) // eslint-disable-line react-hooks/exhaustive-deps

  /* LA JORNADA DE REFERENCIA del arco: el horario fijo que más gente tiene. */
  const referencia = useMemo(() => {
    const cuenta = new Map()
    gente.forEach(p => { if (p.horario?.modo === 'fijo') cuenta.set(p.horario.id, (cuenta.get(p.horario.id) || 0) + 1) })
    const id = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    return horarioPorId.get(id) || { entrada: '08:30', salida: '18:00', nombre: 'Oficina' }
  }, [gente, horarioPorId])
  const ini = enHoras(aMin(referencia.entrada)); const fin = enHoras(aMin(referencia.salida))
  const hAhora = reloj.getHours() + reloj.getMinutes() / 60
  const jornadaTxt = hAhora < ini ? `La jornada de ${referencia.nombre.toLowerCase()} empieza a las ${referencia.entrada}`
    : hAhora > fin ? `La jornada de ${referencia.nombre.toLowerCase()} terminó a las ${referencia.salida}`
      : `Van ${duracion((hAhora - ini) * 60)} de jornada · faltan ${duracion((fin - hAhora) * 60)}`

  /* POR LUGAR: cuánta gente esperada, cuánta llegó y cuántas ya pasaron su hora sin marcar. */
  const lugares = (() => {
    const m = new Map()
    esperadas.forEach(f => {
      const l = f.p.lugar
      if (!l) return
      if (!m.has(l.id)) m.set(l.id, { lugar: l, total: 0, ok: 0, sin: 0, porLlegar: 0, rechazos: 0 })
      const g = m.get(l.id)
      g.total++
      if (f.j.entrada != null) g.ok++
      if (f.j.estado === 'sinMarcar') g.sin++
      if (f.j.estado === 'porLlegar') g.porLlegar++
      g.rechazos += f.j.rechazadas.length
    })
    return [...m.values()].map(g => ({ ...g, minimo: Math.ceil(g.total * MINIMO), cerrada: g.ok === 0 && g.sin > 0 && g.porLlegar === 0 }))
  })()
  const preocupan = lugares
    .filter(g => g.sin > 0 || g.rechazos > 0)
    .sort((a, b) => gravedad(b) - gravedad(a) || b.sin - a.sin)
  const sinApertura = lugares.filter(g => g.cerrada)
  const bajoMinimo = lugares.filter(g => !g.cerrada && g.ok < g.minimo && g.porLlegar === 0)

  /* AUSENCIAS JUSTIFICADAS, por motivo. */
  const motivos = (() => {
    const m = new Map()
    conAviso.forEach(f => {
      const k = f.j.justificacion?.tipo || 'Justificada'
      if (!m.has(k)) m.set(k, [])
      m.get(k).push(f.p)
    })
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length)
  })()

  /* MAÑANA, con lo ya aprobado. */
  const manana = useMemo(() => {
    const fecha = sumarDias(hoy, 1)
    let esperados = 0; let fuera = 0
    const porLugar = new Map()
    for (const p of gente) {
      if (!esDiaLaboral(p.horario, fecha)) continue
      const aviso = justificacionDe(p.id, fecha)
      const id = p.lugar?.id
      if (id && !porLugar.has(id)) porLugar.set(id, { lugar: p.lugar, total: 0, fuera: 0 })
      if (id) porLugar.get(id).total++
      if (aviso) { fuera++; if (id) porLugar.get(id).fuera++ } else esperados++
    }
    const riesgo = [...porLugar.values()].find(g => g.fuera > 0 && (g.total - g.fuera) < Math.ceil(g.total * MINIMO))
    return { fecha, esperados, fuera, riesgo }
  }, [gente, hoy, justificacionDe])

  /* Quiénes de los que están fuera hoy ya no lo están mañana. */
  const vuelvenManana = conAviso.filter(f => !justificacionDe(f.p.id, sumarDias(hoy, 1))).length

  const inc = at.incidencias.filter(i => gente.some(p => p.id === i.persona.id))
  /* Las solicitudes de horas extra que esperan a RR.HH.: se responden ANTES del día. */
  const solicitudesExtra = at.horasExtra.filter(x => x.estado === 'pendiente' && gente.some(p => String(p.id) === String(x.personaId)))
  const fueraHorario = inc.filter(i => i.tipo === 'fuera')
  const incompletas = inc.filter(i => i.tipo === 'incompleta')
  const faltas = inc.filter(i => i.tipo === 'ausente')
  const rechazosHoy = filas.flatMap(f => f.j.rechazadas)

  const verLista = (tab, lugar = '') => {
    setPestana(tab); setLugarSel(lugar); setPag(1)
    setTimeout(() => document.getElementById('at-q-personas')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  const atencion = [
    sinApertura.length > 0 && {
      tono: 'rojo', Icono: Store, fuerte: true, accion: 'Ver quiénes',
      titulo: sinApertura.length === 1 ? `${sinApertura[0].lugar.nombre} no abrió` : `${sinApertura.length} lugares no abrieron`,
      detalle: `Nadie marcó: ${sinApertura.map(g => g.lugar.nombre.replace('Sucursal ', '')).join(', ')}`,
      ir: () => verLista('sinMarcar', sinApertura[0].lugar.id),
    },
    bajoMinimo.length > 0 && {
      tono: 'rojo', Icono: UserX, fuerte: true, accion: 'Ver equipo',
      titulo: `${bajoMinimo[0].lugar.nombre.replace('Sucursal ', '')}, bajo su mínimo`,
      detalle: `Hay ${bajoMinimo[0].ok} y necesita ${bajoMinimo[0].minimo}${bajoMinimo.length > 1 ? ` · y ${plural(bajoMinimo.length - 1, 'lugar más', 'lugares más')}` : ''}`,
      ir: () => verLista('sinMarcar', bajoMinimo[0].lugar.id),
    },
    rechazosHoy.length > 0 && {
      tono: 'ambar', Icono: ScanFace, accion: 'Revisar',
      titulo: `${plural(rechazosHoy.length, 'marcación rechazada', 'marcaciones rechazadas')} hoy`,
      detalle: [['rostro', 'por rostro'], ['geocerca', 'fuera de la geocerca']].map(([k, t]) => [rechazosHoy.filter(m => m.rechazada === k).length, t]).filter(([n]) => n).map(([n, t]) => `${n} ${t}`).join(', '),
      ir: () => navigate('/asistencia/registro?ver=mes&tema=rechazos&lista=1'),
    },
    faltas.length > 0 && {
      tono: 'violeta', Icono: Inbox, accion: 'Justificar',
      titulo: `${plural(faltas.length, 'falta', 'faltas')} sin justificar`,
      detalle: 'De los últimos 10 días. Las que tengan permiso no deberían contar.',
      ir: () => navigate('/asistencia/registro?ver=mes&tema=faltas&lista=1'),
    },
    solicitudesExtra.length > 0 && {
      tono: 'azul', Icono: TrendingUp, accion: 'Responder',
      titulo: `${plural(solicitudesExtra.length, 'solicitud', 'solicitudes')} de horas extra`,
      detalle: 'Pedidas desde la app: solo cuentan si RR.HH. las aprueba',
      ir: () => navigate('/asistencia/solicitudes?ver=horas-extra'),
    },
    fueraHorario.length > 0 && {
      tono: 'gris', Icono: Clock, accion: 'Revisar',
      titulo: `${plural(fueraHorario.length, 'persona se quedó', 'veces se quedaron')} fuera de horario`,
      detalle: 'Sin horas extra autorizadas: no cuenta, salvo que lo autorices',
      ir: () => navigate('/asistencia/registro?ver=mes&tema=fuera&lista=1'),
    },
    incompletas.length > 0 && {
      tono: 'gris', Icono: CircleDashed, accion: 'Completar',
      titulo: `${plural(incompletas.length, 'jornada', 'jornadas')} sin salida`,
      detalle: 'Marcaron la entrada y nunca la salida',
      ir: () => navigate('/asistencia/registro?ver=mes&tema=salidas&lista=1'),
    },
  ].filter(Boolean)

  /* LA LISTA */
  const tab = PESTANAS.find(t => t.key === pestana)
  const texto = busca.trim().toLowerCase()
  const visibles = filas
    .filter(f => f.j.estado !== 'libre')
    .filter(tab.filtro)
    .filter(f => !lugarSel || f.p.lugar?.id === lugarSel)
    .filter(f => !texto || `${f.p.name} ${f.p.cargo} ${f.p.unidad}`.toLowerCase().includes(texto))
    .sort((a, b) => (a.j.entrada ?? 9999) - (b.j.entrada ?? 9999))
  const paginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)

  const hora = reloj.getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const nombre = currentUser.name.split(' ')[0]

  return (
    <div className="content-scroll at-q">
      <div className="at-q-barra">
        <h1 className="pl-title">Hoy</h1>
        <FiltrosOrg valor={filtro} onCambio={v => { setFiltro(v); setPag(1); setLugarSel('') }} lugares={at.lugares} personas={at.personas} />
      </div>

      {/* EL MISMO SALUDO QUE EL DASHBOARD DE INICIO: banner navy, la mascota y una línea de resumen.
          Así la pantalla se reconoce como parte del producto y no como un módulo de otro sistema. */}
      {/* COMO EL DASHBOARD DE INICIO: el trabajo a la izquierda y un rail a la derecha con la hora
          y el calendario. */}
      <div className="two-col at-q-cols">
      <div className="at-q-izq">
      <section className="welcome-banner at-q-banner">
        <div className="welcome-left">
          <img src={viaSaludando} alt="" className="welcome-mascot" />
          <div className="welcome-content">
            <div className="welcome-title">{saludo}, {nombre}</div>
            <div className="welcome-sub">
              {esperadas.length
                ? <>El <strong className="at-q-verde">{pct} %</strong> de tu gente ya está trabajando: llegaron {llegaron.length} de {esperadas.length}.</>
                : 'Hoy no hay jornadas programadas.'}
            </div>
            <div className="at-q-acciones">
            {sinMarcar.length > 0 && (
              <button type="button" className="at-q-btn-fuerte" onClick={() => verLista('sinMarcar')}>
                Ver a {sinMarcar.length === 1 ? 'quien falta' : `los ${sinMarcar.length} que faltan`} <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
            <button type="button" className="at-q-btn" onClick={() => setElegir(true)}><Plus size={15} aria-hidden="true" /> Marcación manual</button>
            </div>
          </div>
        </div>
      </section>


      <div className="at-q-cifras">
        <button type="button" className="at-q-cifra" onClick={() => verLista('sinMarcar')}>
          <span className="cab"><span className="ico t-rojo"><UserX size={17} /></span>No han llegado</span>
          <span className="val rojo">{sinMarcar.length}</span>
          <span className="ctx">{normal.hay ? `Lo normal a esta hora: ${normal.faltan}` : 'Pasaron su hora y su tolerancia'}</span>
          <span className="barra"><span style={{ flex: sinMarcar.length, background: 'var(--at-rojo)' }} /><span style={{ flex: Math.max(1, esperadas.length - sinMarcar.length), background: 'transparent' }} /></span>
        </button>
        <button type="button" className="at-q-cifra" onClick={() => verLista('tarde')}>
          <span className="cab"><span className="ico t-ambar"><Clock size={17} /></span>Llegaron tarde</span>
          <span className="val">{tarde.length}</span>
          <span className="ctx">{puntualidad == null ? 'Nadie llegó todavía' : `Puntualidad ${puntualidad.toFixed(1).replace('.', ',')} %${normal.puntualidadPasada != null ? ` · hace una semana ${normal.puntualidadPasada.toFixed(1).replace('.', ',')} %` : ''}`}</span>
          <span className="barra"><span style={{ flex: Math.max(0, llegaron.length - tarde.length), background: 'var(--at-verde)' }} /><span style={{ flex: tarde.length, background: 'var(--at-ambar)' }} /></span>
        </button>
        <button type="button" className="at-q-cifra" onClick={() => verLista('aviso')}>
          <span className="cab"><span className="ico t-azul"><Luggage size={17} /></span>Ausencias justificadas</span>
          <span className="val">{conAviso.length}</span>
          <span className="ctx">{motivos.length ? motivos.map(([k, ps]) => `${k}: ${ps.length}`).join(' · ') : 'Nadie de vacaciones ni con permiso hoy'}</span>
          <span className="barra">{motivos.map(([k, ps], i) => <span key={k} style={{ flex: ps.length, background: ['var(--at-azul)', 'var(--at-violeta)', 'var(--at-gris)'][i % 3] }} />)}</span>
        </button>
      </div>

      <div className="at-q-dos">
        <section className="sec-card">
          <div className="sc-hd">
            <TriangleAlert size={15} style={{ color: 'var(--red)' }} aria-hidden="true" />
            <h3>Requiere tu atención <span className="sc-hd-count">{atencion.length}</span></h3>
            <VerTodos total={atencion.length} texto="las" accion="Ir al Libro" onClick={() => navigate('/asistencia/registro?ver=mes&tema=faltas&lista=1')} />
          </div>
          <div className="sc-body at-q-lista">
            {atencion.length ? atencion.slice(0, MAX_LISTA).map(a => (
              <div key={a.titulo} className="at-q-fila">
                <span className={`at-q-fila-ico t-${a.tono}`}><a.Icono size={20} aria-hidden="true" /></span>
                <span className="txt"><b>{a.titulo}</b><span>{a.detalle}</span></span>
                <button type="button" className={a.fuerte ? 'at-q-btn-fuerte chico' : 'at-q-btn chico'} onClick={a.ir}>{a.accion}</button>
              </div>
            )) : <div className="at-q-ok"><Check size={17} aria-hidden="true" /> Nada que resolver por ahora</div>}
            <Truncado total={atencion.length} donde="el Libro de asistencia" />
          </div>
        </section>
      </div>

      {/* LO QUE SE REPITE, antes de la lista: se lee una vez y no compite con lo urgente. */}
      <LoQueConviene gente={gente} />

      <section className="at-q-card" id="at-q-personas">
        <div className="at-q-card-cab">
          <h2>Colaboradores{lugarSel && <> · {at.lugarPorId.get(lugarSel)?.nombre} <button type="button" className="at-q-link" onClick={() => setLugarSel('')}>quitar</button></>}</h2>
        </div>
        {/* El buscador a la izquierda, como en el resto del producto; los estados a su lado. */}
        <div className="at-barra-busca" style={{ marginBottom: 12 }}>
          <div className="pl-search-wrap at-busca">
            <Search size={13} className="pl-search-ico" />
            <input type="search" className="pl-search" placeholder="Buscar colaborador…" value={busca} onChange={e => { setBusca(e.target.value); setPag(1) }} aria-label="Buscar colaborador" />
          </div>
        <div className="dc-filtro at-filtro-estado on">
          <Desplegable valor={pestana} ariaLabel="Filtrar por estado" anchoMenu={260} claseBoton="at-dd-estados"
            opciones={PESTANAS.map(t => {
              const n = filas.filter(f => f.j.estado !== 'libre').filter(t.filtro).filter(f => !lugarSel || f.p.lugar?.id === lugarSel).length
              return { valor: t.key, etiqueta: t.label, punto: t.punto, lateral: String(n), apagada: !n && t.key !== 'todos', separada: t.key === 'aviso' }
            })}
            contenido={o => (
              <span className="pl-dd-trigger-estado">
                {o?.punto && <i style={{ background: o.punto }} aria-hidden="true" />}
                <span>{o?.etiqueta}</span>
                <b>{o?.lateral}</b>
              </span>
            )}
            onCambio={v => { setPestana(v); setPag(1) }} />
        </div>
        </div>
        {visibles.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="as-table at-tabla">
              <thead><tr><th>Colaborador</th><th>Entrada</th><th className="col-barra">Su día</th><th>Estado</th></tr></thead>
              <tbody>
                {visibles.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(({ p, j }) => (
                  <tr key={p.id} tabIndex={0} onClick={() => setDetalle({ persona: p, fecha: at.hoy })} onKeyDown={e => { if (e.key === 'Enter') setDetalle({ persona: p, fecha: at.hoy }) }}>
                    <td><PersonaAt persona={p} size={30} /></td>
                    <td className={`num${j.llegoTarde ? ' tarde' : ''}`}>{hhmm(j.entrada)}<small>{p.horario?.modo === 'fijo' ? `Entra ${p.horario.entrada}` : 'Flexible'}</small></td>
                    <td className="col-barra"><BarraDia jornada={j} horario={p.horario} ahora={ahora} /></td>
                    <td><EstadoDia persona={p} jornada={j} ahora={ahora} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Paginacion page={pagina} setPage={setPag} total={visibles.length} perPage={POR_PAGINA} nombre="personas" nombreUno="persona" />
          </div>
        ) : <Vacio Icono={Check} titulo="Nadie en este grupo" texto="Pruebe con otro estado, otro lugar u otra palabra." />}
      </section>
      </div>

      <aside className="at-q-rail" aria-label="El contexto del día">
      {/* EL RELOJ, EN SU PROPIA TARJETA BLANCA: el banner saluda y resume; esto dice la hora. */}
      <section className="at-q-reloj at-q-reloj-card" aria-label="Hora actual">
          <svg className="esfera" viewBox="0 0 200 200" role="img" aria-label={`Son las ${String(hora).padStart(2, '0')}:${String(reloj.getMinutes()).padStart(2, '0')}`}>
            <circle cx="100" cy="100" r="96" className="fondo" />
            {Array.from({ length: 12 }, (_, i) => (
              <circle key={i} cx="100" cy="12" r={i % 3 === 0 ? 3.2 : 1.8} className="marca" transform={`rotate(${i * 30} 100 100)`} />
            ))}
            <line x1="100" y1="100" x2="100" y2="56" className="aguja-hora" transform={`rotate(${(hora % 12) * 30 + reloj.getMinutes() * 0.5} 100 100)`} />
            <line x1="100" y1="100" x2="100" y2="30" className="aguja-min" transform={`rotate(${reloj.getMinutes() * 6 + reloj.getSeconds() * 0.1} 100 100)`} />
            <line x1="100" y1="114" x2="100" y2="24" className="aguja-seg" transform={`rotate(${reloj.getSeconds() * 6} 100 100)`} />
            <circle cx="100" cy="100" r="5" className="eje" />
          </svg>
          <div className="at-q-hora">
            <div>{String(hora).padStart(2, '0')}:{String(reloj.getMinutes()).padStart(2, '0')}<span>:{String(reloj.getSeconds()).padStart(2, '0')}</span></div>
            <small>{fechaLarga(at.hoy)}</small>
            {relojDemo && <span className="at-demo-chip" title="Cargaste los datos de ejemplo: Asistencia simula este día. «Resetear demo» vuelve a la fecha real.">Simulación de la demo</span>}
          </div>
          <span className="at-q-jornada"><i />{jornadaTxt}</span>
      </section>
        <CurvaPresencia compacta filas={filas} esperadas={esperadas} ahora={ahora} />
        <CalendarioAsistencia gente={gente} />
        {/* DÓNDE Y QUIÉN: una tarjeta debajo de la otra, en el contexto. */}
        <div className="at-q-par at-q-par-rail">
          <section className="sec-card">
            <div className="sc-hd">
              <Store size={15} style={{ color: 'var(--red)' }} aria-hidden="true" />
              <h3>Lugares en riesgo <span className="sc-hd-count">{preocupan.length}</span></h3>
              <VerTodos total={preocupan.length} texto="los" accion="Ver todos" onClick={() => navigate('/asistencia/registro')} />
            </div>
            <div className="sc-body at-q-lista">
            {preocupan.slice(0, MAX_LISTA).map(g => {
              const color = g.cerrada ? 'var(--at-cerrada)' : g.ok < g.minimo ? 'var(--at-rojo)' : 'var(--at-ambar)'
              return (
                <button key={g.lugar.id} type="button" className="at-q-lugar" onClick={() => verLista(g.sin ? 'sinMarcar' : 'todos', g.lugar.id)}>
                  <span className="txt">
                    <b>{g.lugar.nombre}</b>
                    <span className={g.cerrada || g.ok < g.minimo ? 'rojo' : 'ambar'}>
                      {g.cerrada ? 'Nadie marcó' : [g.sin && plural(g.sin, 'sin marcar', 'sin marcar'), g.ok < g.minimo && g.porLlegar === 0 && 'bajo el mínimo', g.rechazos && plural(g.rechazos, 'rechazo', 'rechazos')].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className="medidor">
                    <span style={{ width: `${(g.ok / g.total) * 100}%`, background: color }} />
                    <i style={{ left: `${(g.minimo / g.total) * 100}%` }} title={`Mínimo para operar: ${g.minimo}`} />
                  </span>
                  <span className="cuenta">{g.ok}/{g.total}</span>
                </button>
              )
            })}
            <Truncado total={preocupan.length} donde="el libro de asistencia" />
            <div className="at-q-ok at-q-pie"><Check size={17} aria-hidden="true" /> {preocupan.length ? `Los otros ${lugares.length - preocupan.length} están completos` : `Los ${lugares.length} lugares están completos`}</div>
            </div>
          </section>

          <section className="sec-card">
            <div className="sc-hd">
              <Luggage size={15} style={{ color: 'var(--dc-azul)' }} aria-hidden="true" />
              <h3>Justificadas hoy <span className="sc-hd-count">{conAviso.length}</span></h3>
              {conAviso.length > 0 && <VerTodos total={motivos.length} texto="los" accion="Ver quiénes" onClick={() => verLista('aviso')} />}
            </div>
            <div className="sc-body at-q-lista">
            {motivos.length ? motivos.slice(0, MAX_LISTA).map(([k, ps]) => (
              <button key={k} type="button" className="at-q-aviso" onClick={() => verLista('aviso')}>
                <span className="num"><b>{ps.length}</b><span>{k}</span></span>
                <span className="pila">
                  {ps.slice(0, 6).map(p => <Avatar key={p.id} persona={p} size={34} />)}
                  {ps.length > 6 && <em>+{ps.length - 6}</em>}
                </span>
                <span className="nombres">{ps.slice(0, 2).map(p => p.name.split(' ')[0]).join(', ')}{ps.length > 2 ? ' y más' : ''}</span>
              </button>
            )) : <Vacio Icono={Luggage} titulo="Hoy no hay ausencias justificadas" texto="Las vacaciones, los permisos y las licencias aprobadas aparecen aquí y no cuentan como falta." />}
            <div className="at-q-pie at-q-pie-azul"><Luggage size={16} aria-hidden="true" /> {conAviso.length ? `Ninguno cuenta como falta${vuelvenManana ? ` · ${plural(vuelvenManana, 'vuelve', 'vuelven')} mañana` : ''}` : 'Hoy todos los esperados están disponibles'}</div>
            </div>
          </section>
        </div>
        {/* MAÑANA, DEBAJO DEL CALENDARIO: los dos miran hacia adelante. */}
        <section className="at-q-card oscura">
          <div className="at-q-card-cab at-q-manana-cab"><h2>Mañana, {fechaLarga(manana.fecha).toLowerCase()}</h2><span>Con lo ya aprobado</span></div>
          <div className="at-q-manana">
            <span><b>{manana.esperados}</b>esperados</span>
            <span><b className="azul">{manana.fuera}</b>{manana.fuera === 1 ? 'ausente justificado' : 'ausentes justificados'}</span>
          </div>
          <div className="at-q-nota">
            {manana.riesgo ? <TriangleAlert size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" className="ok" />}
            <span>{manana.riesgo
              ? <><b>{manana.riesgo.lugar.nombre}</b> quedaría con {manana.riesgo.total - manana.riesgo.fuera} de {manana.riesgo.total}, bajo su mínimo. Antes de aprobar más días libres ahí, revisa la cobertura.</>
              : 'Ningún lugar queda bajo su mínimo con las vacaciones y permisos ya aprobados.'}</span>
          </div>
        </section>
      </aside>
      </div>

      {elegir && (
        <Modal titulo="Marcación manual" Icono={Plus} onCerrar={() => setElegir(false)} ancho={460}>
          <div className="at-modal-campos">
            <p className="at-ayuda">Para quien no pudo marcar desde la app: se olvidó el teléfono, no tenía señal o el rostro no lo reconoció. Elija a la persona y luego la hora; el motivo es obligatorio y queda en el registro.</p>
            <label className="at-campo"><span>¿Para quién?</span>
              <Desplegable valor="" conBuscador placeholder="Buscar a la persona…" ariaLabel="Persona"
                opciones={at.personas.filter(p => p.asig).map(p => ({ valor: String(p.id), etiqueta: `${p.name} · ${p.unidad}` }))}
                onCambio={v => { setElegir(false); setDetalle({ persona: at.personaPorId.get(v), fecha: at.hoy }) }} />
            </label>
          </div>
        </Modal>
      )}
      {detalle && <DetalleJornada persona={detalle.persona} fecha={detalle.fecha} onCerrar={() => setDetalle(null)} />}
    </div>
  )
}
