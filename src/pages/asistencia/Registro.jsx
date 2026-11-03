import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Download, Lock, BookOpen } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Vacio } from '../../components/documentacion/comunes'
import Paginacion from '../../components/layout/Paginacion'
import { PersonaAt, BarraBusqueda, FILTRO_VACIO, filtrar } from '../../components/asistencia/comunes'
import DetalleJornada from '../../components/asistencia/DetalleJornada'
import { ESTADOS, ALERTAS, DIAS_CORTOS, fechaLarga, fechaCorta, hhmm, hhmmss, duracion, sumarDias, diaISO, minutosAhora, mesDe, descargarCSV, aFecha, diasDelMes, mesVecino, nombreMes, aMin, franjaPausa } from '../../data/asistenciaData'

/* ── EL LIBRO DE ASISTENCIA ────────────────────────────────────────────────
   Todas las jornadas, un día, una semana o un mes a la vez. El día es una tabla —quién, a qué hora
   entró y salió, cuánto trabajó— con la barra del día para leerlo sin números; la semana es una
   grilla de colores, como la «timesheet» de BambooHR, para encontrar patrones: el que llega tarde
   todos los lunes se ve de lejos. El mes es la planilla clásica de RR.HH.: una fila por persona, un
   cuadrito por día y, a la derecha, lo acumulado (tardanzas, faltas, saldo) que pide el cierre.

   La fecha viaja en la dirección (`?fecha=`, `?ver=semana|mes`): se enlaza y la flecha de atrás vuelve. */

const POR_PAGINA = 12

export default function Registro() {
  const at = useAsistencia()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const fecha = params.get('fecha') || at.hoy
  const ver = ['semana', 'mes'].includes(params.get('ver')) ? params.get('ver') : 'dia'
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [estado, setEstado] = useState('')
  const [busca, setBusca] = useState('')
  const [pag, setPag] = useState(1)
  const [detalle, setDetalle] = useState(null)

  const ir = (cambios) => { const n = new URLSearchParams(params); Object.entries(cambios).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); setParams(n, { replace: true }); setPag(1) }
  const lunes = sumarDias(fecha, 1 - diaISO(fecha))
  const semana = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i))
  const paso = ver === 'semana' ? 7 : 1
  const mes = mesDe(fecha)
  const esHoy = ver === 'mes' ? mes === mesDe(at.hoy) : fecha === at.hoy
  /* El mes se recorre de a uno; el siguiente nunca pasa de hoy. */
  const anterior = () => ir({ fecha: ver === 'mes' ? `${mesVecino(mes, -1)}-01` : sumarDias(fecha, -paso) })
  const siguiente = () => {
    const n = ver === 'mes' ? `${mesVecino(mes, 1)}-01` : sumarDias(fecha, paso)
    ir({ fecha: n > at.hoy ? at.hoy : n })
  }
  const sinSiguiente = ver === 'mes' ? mesVecino(mes, 1) > mesDe(at.hoy) : sumarDias(fecha, paso) > at.hoy && (ver === 'dia' || semana[6] >= at.hoy)
  const texto = busca.trim().toLowerCase()

  const gente = useMemo(() => filtrar(at.personas.filter(p => p.asig), filtro).filter(p => !texto || `${p.name} ${p.cargo} ${p.unidad}`.toLowerCase().includes(texto)), [at.personas, filtro, texto])
  const filasDia = useMemo(() => gente.map(p => ({ p, j: at.jornadaDe(p, fecha) })).filter(f => f.j.estado !== 'libre'), [gente, fecha, at])  
  const grupoSel = GRUPOS_DIA.find(g => g.key === estado)
  const filas = grupoSel ? filasDia.filter(f => grupoSel.f(f.j)) : filasDia
  const paginas = Math.max(1, Math.ceil((ver === 'dia' ? filas.length : gente.length) / POR_PAGINA))
  const pagina = Math.min(pag, paginas)

  const exportar = () => {
    const dias = ver === 'semana' ? semana.filter(d => d <= at.hoy) : ver === 'mes' ? diasDelMes(mes).filter(d => d <= at.hoy) : [fecha]
    /* Al segundo (#8): las horas como HH:MM:SS y las duraciones en segundos. */
    const sg = min => Math.round((min || 0) * 60)
    const rows = [['Fecha', 'Colaborador', 'Código', 'Unidad organizacional', 'Sucursal', 'Centro de trabajo', 'Modalidad', 'Entrada', 'Salida', 'Descanso (s)', 'Trabajado (s)', 'Programado (s)', 'Tardanza (s)', 'Tardanza injustificada (s)', 'Descanso excedido (s)', 'Salida anticipada (s)', 'Horas extra aprobadas trabajadas (s)', 'Fuera de horario (s)', 'Alertas', 'Estado']]
    dias.forEach(d => gente.forEach(p => {
      const j = at.jornadaDe(p, d)
      if (j.estado === 'libre') return
      const suc = at.lugarPorId.get(p.sucursalId)
      rows.push([d, p.name, p.codigo, p.unidad, suc?.nombre || '', p.centroId ? p.lugar.nombre : '', p.asig.modalidad, hhmmss(j.entrada), hhmmss(j.salida), sg(j.pausas), sg(j.trabajado), sg(j.programado), sg(j.tardanza), sg(j.tardanzaInjustificada), sg(j.excesoPausa), sg(j.anticipada), sg(j.extra), sg(j.fueraDeHorario), j.alertas.map(a => `${ALERTAS[a.tipo].label}${a.justificacion ? ' (justificada)' : ''}`).join(' · '), ESTADOS[j.estado].label])
    }))
    descargarCSV(`asistencia_${dias[0]}${dias.length > 1 ? `_a_${dias[dias.length - 1]}` : ''}.csv`, rows)
  }

  const cerrado = !!at.cierres[mes]

  return (
    <div className="content-scroll">
      <Cabecera titulo="Libro de asistencia" sub="Cada jornada con su entrada, su salida y su evidencia.">
        <button type="button" className="dc-btn" onClick={exportar}><Download size={14} aria-hidden="true" /> Exportar CSV</button>
      </Cabecera>

      <div className="at-barra-herr">
        <div className="at-barra-herr-izq">
          <div className="at-dia-nav">
            <button type="button" aria-label="Anterior" onClick={anterior}><ChevronLeft size={16} /></button>
            <span>{ver === 'mes' ? nombreMes(mes) : ver === 'semana' ? `${fechaCorta(semana[0])} – ${fechaCorta(semana[6])}` : esHoy ? `Hoy · ${fechaCorta(fecha)}` : fechaLarga(fecha)}</span>
            <button type="button" aria-label="Siguiente" disabled={sinSiguiente} onClick={siguiente}><ChevronRight size={16} /></button>
          </div>
          {!esHoy && <button type="button" className="dc-btn dc-btn-sm" onClick={() => ir({ fecha: null })}>{ver === 'mes' ? 'Ir a este mes' : 'Ir a hoy'}</button>}
          <div className="at-segmento" role="tablist" aria-label="Vista">
            <button type="button" role="tab" aria-selected={ver === 'dia'} className={ver === 'dia' ? 'on' : ''} onClick={() => ir({ ver: null })}>Día</button>
            <button type="button" role="tab" aria-selected={ver === 'semana'} className={ver === 'semana' ? 'on' : ''} onClick={() => ir({ ver: 'semana' })}>Semana</button>
            <button type="button" role="tab" aria-selected={ver === 'mes'} className={ver === 'mes' ? 'on' : ''} onClick={() => ir({ ver: 'mes' })}>Mes</button>
          </div>
          {cerrado && <span className="dc-chip dc-t-gris"><Lock size={11} aria-hidden="true" /> Mes cerrado</span>}
        </div>
      </div>

      <BarraBusqueda busca={busca} onBusca={v => { setBusca(v); setPag(1) }} placeholder="Buscar persona o cargo…" filtro={filtro} onFiltro={v => { setFiltro(v); setPag(1) }} lugares={at.lugares} personas={at.personas} />

      {/* El estado se filtra con la franja de conteos: todo a la vista, con el color de la grilla. */}
      {ver === 'dia' && (
        <div className="at-franja at-pal" role="group" aria-label="Filtrar por estado">
          <button type="button" className={!estado ? 'on' : ''} aria-pressed={!estado} onClick={() => { setEstado(''); setPag(1) }}><b>{filasDia.length}</b> Todos</button>
          {GRUPOS_DIA.map(g => {
            const n = filasDia.filter(f => g.f(f.j)).length
            if (!n) return null
            return (
              <button key={g.key} type="button" className={estado === g.key ? 'on' : ''} aria-pressed={estado === g.key} onClick={() => { setEstado(estado === g.key ? '' : g.key); setPag(1) }}>
                <i className={`at-mes-c t-${g.tono}`} aria-hidden="true" /><b>{n}</b> {esHoy ? g.hoy || g.label : g.label}
              </button>
            )
          })}
        </div>
      )}

      {ver === 'mes' ? (
        gente.length
          ? <LibroMes gente={gente} mes={mes} onDia={(persona, d) => setDetalle({ persona, fecha: d })} onPersona={p => navigate(`/asistencia/persona/${p.id}?mes=${mes}`)} />
          : <div className="dc-tarjeta"><Vacio Icono={BookOpen} titulo="Nadie coincide" texto="Pruebe con otros filtros." /></div>
      ) : ver === 'dia' ? (
        filas.length ? (
          <LibroDia filas={filas} pagina={pagina} setPag={setPag} ahora={esHoy ? minutosAhora() : null} onAbrir={p => setDetalle({ persona: p, fecha })} />
        ) : (
          <div className="dc-tarjeta"><Vacio Icono={BookOpen} titulo="Ninguna jornada" texto="Nadie con jornada programada coincide con la fecha y los filtros elegidos." /></div>
        )
      ) : (
        gente.length ? (
          <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="as-table at-semana">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  {semana.map(d => <th key={d} className={`dia${d === at.hoy ? ' hoy' : ''}`}>{DIAS_CORTOS[diaISO(d)]} {aFecha(d).getDate()}</th>)}
                  <th style={{ textAlign: 'right' }}>Horas de la semana</th>
                </tr>
              </thead>
              <tbody>
                {gente.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(p => {
                  let total = 0; let prog = 0
                  return (
                    <tr key={p.id}>
                      <td><PersonaAt persona={p} size={30} onClick={() => navigate(`/asistencia/persona/${p.id}?mes=${mesDe(fecha)}`)} /></td>
                      {semana.map(d => {
                        if (d > at.hoy) return <td key={d}><span className="at-celda futuro e-libre" /></td>
                        const j = at.jornadaDe(p, d)
                        /* El día en curso no suma al saldo hasta que termina: a media mañana todos «deben» horas. */
                        if (d < at.hoy || j.salida != null) { total += j.trabajado; prog += j.programado }
                        return (
                          <td key={d} style={{ padding: '6px 4px' }}>
                            <button type="button" className={`at-celda e-${j.estado}`} onClick={() => setDetalle({ persona: p, fecha: d })} title={`${fechaLarga(d)} · ${ESTADOS[j.estado].label}`}>
                              {j.entrada != null ? <><b>{hhmm(j.entrada)}</b><span>{j.salida != null ? hhmm(j.salida) : '…'}</span></> : <span>{j.estado === 'libre' ? 'Libre' : ESTADOS[j.estado].label}</span>}
                            </button>
                          </td>
                        )
                      })}
                      <td className="num" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                        {duracion(total, { corto: true })}
                        <small style={{ display: 'block', fontWeight: 500, fontSize: 11, color: total - prog >= 0 ? 'var(--dc-verde)' : 'var(--dc-rojo)' }}>{duracion(total - prog, { signo: true, corto: true })}</small>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <Paginacion page={pagina} setPage={setPag} total={gente.length} perPage={POR_PAGINA} nombre="personas" nombreUno="persona" />
          </div>
        ) : <div className="dc-tarjeta"><Vacio Icono={BookOpen} titulo="Nadie coincide" texto="Pruebe con otros filtros." /></div>
      )}

      {detalle && <DetalleJornada persona={detalle.persona} fecha={detalle.fecha} onCerrar={() => setDetalle(null)} />}
    </div>
  )
}

/* ── EL MES COMO PLANILLA ──
   Cada cuadrito es una jornada, con el color de su estado; un clic la abre. Lo acumulado cuenta sólo
   días cerrados (el de hoy suma cuando la persona marca la salida), igual que la ficha de la persona.
   Faltas: «ausente» es la que cuenta; la ausencia con vacación, permiso o licencia va aparte. */
const LEYENDA_MES = [['ok', 'A tiempo'], ['tarde', 'Tarde o salió antes'], ['falta', 'Falta'], ['just', 'Vacación, permiso o licencia'], ['extra', 'Horas extra'], ['inc', 'Sin salida'], ['libre', 'Libre']]
const TONO_MES = { presente: 'ok', termino: 'ok', trabajando: 'hoy', pausa: 'hoy', porLlegar: 'hoy', tarde: 'tarde', anticipada: 'tarde', ausente: 'falta', sinMarcar: 'falta', justificada: 'just', extra: 'extra', incompleta: 'inc', libre: 'libre' }
const ORDENES = {
  tardanza: (a, b) => b.tarde.min - a.tarde.min || b.tarde.veces - a.tarde.veces,
  faltas: (a, b) => b.faltas - a.faltas || b.justificadas - a.justificadas,
  saldo: (a, b) => (a.saldo ?? 0) - (b.saldo ?? 0),
}

function LibroMes({ gente, mes, onDia, onPersona }) {
  const at = useAsistencia()
  const [orden, setOrden] = useState('')
  const [pag, setPag] = useState(1)
  const dias = useMemo(() => diasDelMes(mes), [mes])
  const filas = useMemo(() => gente.map(p => {
    const js = dias.map(d => (d <= at.hoy ? at.jornadaDe(p, d) : null))
    const cerradas = js.filter((j, i) => j && j.estado !== 'libre' && (dias[i] !== at.hoy || j.salida != null))
    const tardes = cerradas.filter(j => j.llegoTarde)
    const sum = (lista, k) => lista.reduce((s, j) => s + (j[k] || 0), 0)
    return {
      p, js,
      tarde: { veces: tardes.length, min: sum(tardes, 'tardanza'), injust: sum(tardes, 'tardanzaInjustificada') },
      faltas: cerradas.filter(j => j.estado === 'ausente').length,
      justificadas: cerradas.filter(j => j.estado === 'justificada').length,
      saldo: cerradas.length ? sum(cerradas, 'trabajado') - sum(cerradas, 'programado') : null,
    }
  }), [gente, dias, at])
  const ordenadas = orden ? [...filas].sort(ORDENES[orden]) : filas
  const paginas = Math.max(1, Math.ceil(ordenadas.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)
  const columnas = { gridTemplateColumns: `repeat(${dias.length}, minmax(0, 1fr))` }
  const cab = (k, txt) => (
    <th className="at-mes-acc">
      <button type="button" className={`at-mes-orden${orden === k ? ' on' : ''}`} aria-pressed={orden === k} onClick={() => { setOrden(orden === k ? '' : k); setPag(1) }} title={orden === k ? 'Quitar el orden' : 'Ordenar de mayor a menor'}>{txt}{orden === k ? ' ↓' : ''}</button>
    </th>
  )
  return (
    <div className="as-table-wrap at-mes">
      <div style={{ overflowX: 'auto' }}>
        <table className="as-table at-mes-tabla">
          <thead>
            <tr>
              <th className="at-mes-persona">Colaborador</th>
              <th className="at-mes-dias-h">
                <div className="at-mes-dias" style={columnas}>
                  {dias.map(d => {
                    const dw = diaISO(d)
                    return <span key={d} className={`${dw >= 6 ? 'finde' : ''}${d === at.hoy ? ' hoy' : ''}`} title={fechaLarga(d)}>{aFecha(d).getDate()}<small>{DIAS_CORTOS[dw].slice(0, 1)}</small></span>
                  })}
                </div>
              </th>
              {cab('tardanza', 'Tardanzas')}
              {cab('faltas', 'Faltas')}
              {cab('saldo', 'Saldo')}
            </tr>
          </thead>
          <tbody>
            {ordenadas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(({ p, js, tarde, faltas, justificadas, saldo }) => (
              <tr key={p.id}>
                <td className="at-mes-persona"><PersonaAt persona={p} size={28} sub={p.unidad} onClick={() => onPersona(p)} /></td>
                <td>
                  <div className="at-mes-dias" style={columnas}>
                    {dias.map((d, i) => {
                      const j = js[i]
                      if (!j) return <span key={d} className="at-mes-c t-futuro" />
                      const det = `${fechaLarga(d)} · ${ESTADOS[j.estado].label}${j.llegoTarde ? ` · ${duracion(j.tardanza)} tarde` : ''}`
                      return <button key={d} type="button" className={`at-mes-c t-${TONO_MES[j.estado] || 'libre'}${d === at.hoy ? ' hoy' : ''}`} title={det} aria-label={`${p.name}, ${det}`} onClick={() => onDia(p, d)} />
                    })}
                  </div>
                </td>
                <td className="at-mes-acc num">
                  {tarde.veces ? (
                    <>
                      <b className="tarde">{tarde.veces} {tarde.veces === 1 ? 'vez' : 'veces'}</b>
                      <small>{duracion(tarde.min, { corto: true })}{tarde.injust <= 0 ? ' · justificado' : tarde.injust < tarde.min ? ` · ${duracion(tarde.injust, { corto: true })} sin justificar` : ' sin justificar'}</small>
                    </>
                  ) : <span className="dc-muted">—</span>}
                </td>
                <td className="at-mes-acc num">
                  {faltas || justificadas ? (
                    <>
                      <b className={faltas ? 'falta' : ''}>{faltas}</b>
                      <small>{justificadas ? `+ ${justificadas} con permiso` : 'sin justificar'}</small>
                    </>
                  ) : <span className="dc-muted">—</span>}
                </td>
                <td className="at-mes-acc num">{saldo == null ? <span className="dc-muted">—</span> : <b style={{ color: saldo >= 0 ? 'var(--dc-verde)' : 'var(--dc-rojo)' }}>{duracion(saldo, { signo: true, corto: true })}</b>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="at-mes-leyenda">
        {LEYENDA_MES.map(([k, t]) => <span key={k}><i className={`at-mes-c t-${k}`} />{t}</span>)}
      </div>
      <Paginacion page={pagina} setPage={setPag} total={ordenadas.length} perPage={POR_PAGINA} nombre="personas" nombreUno="persona" />
    </div>
  )
}

/* ── EL DÍA COMO TABLA LIMPIA (E1) ──
   Solo números, bien ordenados, como el timesheet de BambooHR: el horario al lado de la entrada para
   comparar sin pensar, el atraso en naranja junto a la hora y el estado con el punto de color del
   Mes. Y una barrita del día, chica, para leerlo sin números: el riel es su horario, el verde lo que
   trabajó, el naranja el atraso, el hueco el descanso y la rayita, ahora. */
const GRUPOS_DIA = [
  { key: 'tarde', label: 'Llegaron tarde', tono: 'tarde', f: j => j.llegoTarde },
  { key: 'falta', label: 'Faltaron', hoy: 'Sin marcar', tono: 'falta', f: j => j.estado === 'ausente' || j.estado === 'sinMarcar' },
  { key: 'trabajando', label: 'Trabajando', tono: 'vivo', f: j => j.estado === 'trabajando' || j.estado === 'pausa' },
  { key: 'porLlegar', label: 'Por llegar', tono: 'fut', f: j => j.estado === 'porLlegar' },
  { key: 'termino', label: 'Terminaron', tono: 'ok', f: j => j.salida != null },
  { key: 'incompleta', label: 'Sin salida', tono: 'inc', f: j => j.estado === 'incompleta' },
  { key: 'justificada', label: 'Con permiso', tono: 'just', f: j => j.estado === 'justificada' },
]
/* El punto del estado, con los colores del Mes. */
const PUNTO = { presente: 'ok', termino: 'ok', extra: 'extra', trabajando: 'vivo', pausa: 'pausa', porLlegar: 'fut', tarde: 'tarde', anticipada: 'tarde', ausente: 'falta', sinMarcar: 'falta', justificada: 'just', incompleta: 'inc', libre: 'libre' }
const LEYENDA_DIA = [['vivo', 'Trabajó'], ['tarde', 'Llegó tarde o salió antes'], ['falta', 'Falta'], ['just', 'Vacación, permiso o licencia'], ['inc', 'Sin salida']]
const ESCALA = [6 * 60, 22 * 60]

/* Los tramos trabajados salen de las marcas, igual que la barra del día. */
function tramosDe(j, ahora) {
  const marcas = j.marcas.filter(m => !m.rechazada && !m.anulada)
  const trabajo = []
  let abierto = null
  for (const m of marcas) {
    if (m.tipo === 'entrada' || m.tipo === 'pausa_fin') { if (abierto == null) abierto = m.min }
    if ((m.tipo === 'pausa_inicio' || m.tipo === 'salida') && abierto != null) { trabajo.push([abierto, m.min]); abierto = null }
  }
  if (abierto != null && ahora != null) trabajo.push([abierto, ahora, true])
  return { trabajo, sinCierre: abierto != null && ahora == null ? abierto : null }
}

function MiniDia({ p, j, ahora }) {
  const [ini, fin] = ESCALA
  const x = m => `${Math.max(0, Math.min(100, ((m - ini) / (fin - ini)) * 100))}%`
  const w = (a, b) => `${Math.max(0, Math.min(100, ((Math.min(b, fin) - Math.max(a, ini)) / (fin - ini)) * 100))}%`
  const fijo = p.horario?.modo === 'fijo' && j.laboral
  const prog = fijo ? [aMin(p.horario.entrada), aMin(p.horario.salida)] : null
  const t = tramosDe(j, ahora)
  const segs = []
  if (prog) segs.push(['riel', ...prog])
  if (j.estado === 'justificada' && prog) segs.push(['just', ...prog])
  else if ((j.estado === 'sinMarcar' || j.estado === 'ausente') && prog) segs.push(['falta', prog[0], ahora ?? prog[1]])
  else {
    if (j.llegoTarde && prog) segs.push(['tarde', prog[0], j.entrada])
    t.trabajo.forEach(([a, b, vivo]) => segs.push([vivo ? 'vivo' : 'ok', a, b]))
    if (t.sinCierre != null) segs.push(['inc', t.sinCierre, prog ? prog[1] : t.sinCierre + 8 * 60])
    if (j.anticipada > 0 && prog && j.salida != null) segs.push(['tarde', j.salida, prog[1]])
  }
  return (
    <div className="at-minidia" role="img" aria-label={`${p.name}: ${prog ? `horario ${hhmm(prog[0])} a ${hhmm(prog[1])}, ` : ''}entrada ${hhmm(j.entrada)}, salida ${hhmm(j.salida)}`}>
      {segs.map(([tono, a, b], i) => <i key={i} className={`s-${tono}`} style={{ left: x(a), width: w(a, b) }} />)}
      {ahora != null && <i className="s-ahora" style={{ left: x(ahora) }} />}
    </div>
  )
}

function LibroDia({ filas, pagina, setPag, ahora, onAbrir }) {
  return (
    <div className="as-table-wrap at-mes">
      <div style={{ overflowX: 'auto' }}>
        <table className="as-table at-dia-limpia">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Horario</th>
              <th className="r">Entrada</th>
              <th className="r">Salida</th>
              <th className="at-minidia-h">
                <span>Su día</span>
                <span className="at-minidia-esc" aria-hidden="true">{[6, 10, 14, 18, 22].map(h => <b key={h} style={{ left: `${((h * 60 - ESCALA[0]) / (ESCALA[1] - ESCALA[0])) * 100}%` }}>{String(h).padStart(2, '0')}</b>)}</span>
              </th>
              <th className="r">Horas trabajadas</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(({ p, j }) => {
              const remoto = j.marcas.some(m => m.remoto && !m.rechazada)
              const h = p.horario
              const fr = h?.modo === 'fijo' ? franjaPausa(h) : null
              const alerta = j.alertas.find(a => a.tipo !== 'tarde' && a.tipo !== 'anticipada')
              const abrir = () => onAbrir(p)
              const notaEntrada = j.tardanza > 0 ? `+${duracion(j.tardanza)} tarde` : j.entrada != null ? 'a tiempo' : { sinMarcar: 'sin marcar', ausente: 'falta', justificada: 'permiso', porLlegar: 'por llegar' }[j.estado] || ''
              const notaSalida = alerta ? `${ALERTAS[alerta.tipo].corto}${alerta.tipo !== 'sinPausa' ? ` · ${duracion(alerta.min)}` : ''}`
                : j.salida != null ? (j.anticipada > 0 ? `${duracion(j.anticipada)} antes` : j.extra > 0 ? `+${duracion(j.extra)} extra` : '')
                  : j.entrada != null ? (j.estado === 'pausa' ? 'en pausa' : ahora != null ? 'en turno' : 'sin salida') : ''
              const etiqueta = j.estado === 'justificada' && j.justificacion?.tipo ? j.justificacion.tipo : ESTADOS[j.estado].label
              return (
                <tr key={p.id} tabIndex={0} className="at-dia-fila" onClick={abrir} onKeyDown={e => { if (e.key === 'Enter') abrir() }}>
                  <td><PersonaAt persona={p} size={30} sub={`${p.unidad} · ${remoto ? 'Remoto' : p.lugar?.nombre || 'Sin lugar'}`} /></td>
                  <td className="at-dia-hor">{h?.modo === 'fijo' ? <><b>{h.entrada} – {h.salida}</b><small>{fr ? `descanso ${hhmm(fr.desde)}–${hhmm(fr.hasta)}` : 'sin descanso'}</small></> : h ? <><b>Flexible</b><small>meta {duracion(h.meta, { corto: true })}</small></> : '—'}</td>
                  <td className="at-dia-num"><b className={j.llegoTarde ? 'tarde' : j.estado === 'sinMarcar' || j.estado === 'ausente' ? 'falta' : ''}>{hhmm(j.entrada)}</b><small className={j.llegoTarde ? 'tarde' : ''}>{notaEntrada}</small></td>
                  <td className="at-dia-num"><b>{hhmm(j.salida)}</b>{notaSalida && <small className={alerta && !alerta.justificacion ? 'alerta' : ''}>{notaSalida}</small>}</td>
                  <td className="at-minidia-c"><MiniDia p={p} j={j} ahora={ahora} /></td>
                  <td className="at-dia-num"><b>{j.entrada != null ? duracion(j.trabajado, { corto: true }) : '—'}</b><small>de {h?.modo === 'flexible' ? duracion(h.meta, { corto: true }) : duracion(j.programado, { corto: true })}</small></td>
                  <td><span className="at-estado-pt"><i className={`p-${PUNTO[j.estado] || 'libre'}`} />{etiqueta}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="at-mes-leyenda">
        <span><i className="at-leyenda-riel" />Su horario</span>
        {LEYENDA_DIA.map(([k, txt]) => <span key={k}><i className={`at-mes-c t-${k}`} />{txt}</span>)}
        <span><i className="at-leyenda-ahora" />Ahora</span>
      </div>
      <Paginacion page={pagina} setPage={setPag} total={filas.length} perPage={POR_PAGINA} nombre="jornadas" nombreUno="jornada" />
    </div>
  )
}
