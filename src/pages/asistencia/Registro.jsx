import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Download, BookOpen, CalendarDays, Table2, Search, FileText, LayoutGrid, List } from 'lucide-react'
import ListaTema from '../../components/asistencia/ListaTema'
import { TEMAS, SITUACIONES, hechosPorTema, segunSituacion, exportarTema } from '../../components/asistencia/temasLibro'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Vacio, Modal } from '../../components/documentacion/comunes'
import Paginacion from '../../components/layout/Paginacion'
import { PersonaAt, BarraBusqueda, EstadoDia, FILTRO_VACIO, filtrar } from '../../components/asistencia/comunes'
import { motivoJustificado } from '../../components/asistencia/estadoDia'
import Desplegable from '../../components/layout/Desplegable'
import DetalleJornada from '../../components/asistencia/DetalleJornada'
import Avatar from '../../components/personas/Avatar'
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
  const ver = ['semana', 'mes', 'calendario'].includes(params.get('ver')) ? params.get('ver') : 'dia'
  /* El Mes y el Calendario se recorren de a un mes. */
  const porMes = ver === 'mes' || ver === 'calendario'
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [estado, setEstado] = useState('')
  const [busca, setBusca] = useState('')
  const [pag, setPag] = useState(1)
  const [detalle, setDetalle] = useState(null)
  const [exportando, setExportando] = useState(false)

  const ir = (cambios) => { const n = new URLSearchParams(params); Object.entries(cambios).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); setParams(n, { replace: true }); setPag(1) }
  const lunes = sumarDias(fecha, 1 - diaISO(fecha))
  const semana = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i))
  const paso = ver === 'semana' ? 7 : 1
  const mes = mesDe(fecha)
  const esHoy = porMes ? mes === mesDe(at.hoy) : fecha === at.hoy
  /* El mes se recorre de a uno; el siguiente nunca pasa de hoy. */
  const anterior = () => ir({ fecha: porMes ? `${mesVecino(mes, -1)}-01` : sumarDias(fecha, -paso) })
  const siguiente = () => {
    const n = porMes ? `${mesVecino(mes, 1)}-01` : sumarDias(fecha, paso)
    ir({ fecha: n > at.hoy ? at.hoy : n })
  }
  const sinSiguiente = porMes ? mesVecino(mes, 1) > mesDe(at.hoy) : sumarDias(fecha, paso) > at.hoy && (ver === 'dia' || semana[6] >= at.hoy)
  const texto = busca.trim().toLowerCase()

  const gente = useMemo(() => filtrar(at.personas.filter(p => p.asig), filtro).filter(p => !texto || `${p.name} ${p.cargo} ${p.unidad}`.toLowerCase().includes(texto)), [at.personas, filtro, texto])
  const filasDia = useMemo(() => gente.map(p => ({ p, j: at.jornadaDe(p, fecha) })).filter(f => f.j.estado !== 'libre'), [gente, fecha, at])  
  const grupoSel = GRUPOS_DIA.find(g => g.key === estado)
  const filas = grupoSel ? filasDia.filter(f => grupoSel.f(f.j)) : filasDia
  /* LOS TEMAS COMO FILTRO (Ronda 15 · T2): en la Semana y el Mes, «Faltas», «Retrasos y descansos»…
     dejan solo a quienes tuvieron eso en el período y apagan los demás días; ☰ los muestra en lista. */
  const conTemas = ver === 'semana' || ver === 'mes'
  const tema = conTemas && TEMAS[params.get('tema')] ? params.get('tema') : ''
  const situacion = params.get('sit') || ''
  const enLista = !!tema && params.get('lista') === '1'
  const fechasPeriodo = useMemo(() => (ver === 'semana' ? semana : diasDelMes(mes)), [ver, mes, semana[0]]) // eslint-disable-line react-hooks/exhaustive-deps
  const hechos = useMemo(() => (conTemas ? hechosPorTema(at, fechasPeriodo, gente) : null), [conTemas, at, fechasPeriodo, gente])
  const delTema = tema ? segunSituacion(tema, hechos[tema], situacion) : []
  const foco = tema ? new Set(delTema.map(i => `${i.persona.id}|${i.fecha}`)) : null
  const genteTema = tema ? gente.filter(p => delTema.some(i => i.persona.id === p.id)) : gente
  const periodo = ver === 'semana' ? `${fechaCorta(semana[0])} al ${fechaCorta(semana[6])}` : nombreMes(mes)
  const paginas = Math.max(1, Math.ceil((ver === 'dia' ? filas.length : genteTema.length) / POR_PAGINA))
  const pagina = Math.min(pag, paginas)

  const exportar = () => {
    if (tema) { exportarTema(tema, ver === 'semana' ? `${semana[0]}_a_${semana[6]}` : mes, delTema); return }
    if (porMes) { setExportando(true); return }
    exportarJornadas()
  }
  const exportarJornadas = () => {
    const dias = ver === 'semana' ? semana.filter(d => d <= at.hoy) : porMes ? diasDelMes(mes).filter(d => d <= at.hoy) : [fecha]
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
  /* PARA PLANILLAS (#27): una fila por persona con el mes resumido, en un formato fijo y en segundos,
     para llevarlo al sistema de sueldos de la empresa. Solo cuenta en contra lo injustificado y solo
     las horas extra trabajadas dentro de lo autorizado. Cuenta los días que ya pasaron. */
  const exportarPlanillas = () => {
    const dias = diasDelMes(mes).filter(d => d < at.hoy)
    const sg = min => Math.round((min || 0) * 60)
    const rows = [['Período', 'Código', 'Colaborador', 'Unidad organizacional', 'Sucursal', 'Centro de trabajo', 'Días programados', 'Días trabajados', 'Faltas injustificadas', 'Ausencias justificadas', 'Trabajado (s)', 'Programado (s)', 'Retrasos (veces)', 'Tardanza total (s)', 'Tardanza injustificada (s)', 'Descanso excedido injustificado (s)', 'Salida anticipada injustificada (s)', 'Días sin marcar descanso', 'Horas extra aprobadas trabajadas (s)', 'Horas extra autorizadas (s)', 'Fuera de horario sin autorización (s)']]
    gente.forEach(p => {
      const js = dias.map(d => at.jornadaDe(p, d)).filter(j => j.estado !== 'libre')
      const t = k => js.reduce((a, j) => a + (j[k] || 0), 0)
      rows.push([mes, p.codigo, p.name, p.unidad, at.lugarPorId.get(p.sucursalId)?.nombre || '', p.centroId ? p.lugar.nombre : '', js.filter(j => j.programado > 0).length, js.filter(j => j.entrada != null).length, js.filter(j => j.estado === 'ausente').length, js.filter(j => j.estado === 'justificada').length, sg(t('trabajado')), sg(t('programado')), js.filter(j => j.llegoTarde).length, sg(t('tardanza')), sg(t('tardanzaInjustificada')), sg(t('excesoPausaInjustificado')), sg(t('anticipadaInjustificada')), js.filter(j => j.alertas.some(a => a.tipo === 'sinPausa')).length, sg(t('extra')), sg(t('autorizado')), sg(t('fueraDeHorario'))])
    })
    descargarCSV(`planillas_asistencia_${mes}.csv`, rows)
  }


  return (
    <div className="content-scroll at-libro">
      {/* El período y la vista van juntos en la cabecera, junto a Exportar: los dos cambian toda la
          pantalla. La fila de abajo queda solo para el buscador y los filtros. */}
      <Cabecera titulo="Libro de asistencia" sub="Cada jornada con su entrada, su salida y su evidencia.">
        <div className="at-periodo">
          {!esHoy && <button type="button" className="dc-btn dc-btn-sm" onClick={() => ir({ fecha: null })}>{porMes ? 'Ir a este mes' : 'Ir a hoy'}</button>}
          <div className="at-dia-nav">
            <button type="button" aria-label="Anterior" onClick={anterior}><ChevronLeft size={16} /></button>
            <span>{porMes ? nombreMes(mes) : ver === 'semana' ? `${fechaCorta(semana[0])} – ${fechaCorta(semana[6])}` : esHoy ? `Hoy · ${fechaCorta(fecha)}` : fechaLarga(fecha)}</span>
            <button type="button" aria-label="Siguiente" disabled={sinSiguiente} onClick={siguiente}><ChevronRight size={16} /></button>
          </div>
        </div>
        {ver !== 'calendario' && (
          <div className="at-segmento" role="tablist" aria-label="Vista">
            <button type="button" role="tab" aria-selected={ver === 'dia'} className={ver === 'dia' ? 'on' : ''} onClick={() => ir({ ver: null })}>Día</button>
            <button type="button" role="tab" aria-selected={ver === 'semana'} className={ver === 'semana' ? 'on' : ''} onClick={() => ir({ ver: 'semana' })}>Semana</button>
            <button type="button" role="tab" aria-selected={ver === 'mes'} className={ver === 'mes' ? 'on' : ''} onClick={() => ir({ ver: 'mes' })}>Mes</button>
          </div>
        )}
        {/* TABLA O CALENDARIO: dos formas de ver el Libro. El calendario usa la pantalla entera y cada
            día se abre en una ventana con todo. */}
        <div className="at-segmento at-modo" role="tablist" aria-label="Forma de ver">
          <button type="button" role="tab" aria-selected={ver !== 'calendario'} aria-label="Tabla" title="Tabla" className={ver !== 'calendario' ? 'on' : ''} onClick={() => ir({ ver: ver === 'calendario' ? 'mes' : ver === 'dia' ? null : ver })}><Table2 size={16} aria-hidden="true" /></button>
          <button type="button" role="tab" aria-selected={ver === 'calendario'} aria-label="Calendario" title="Calendario" className={ver === 'calendario' ? 'on' : ''} onClick={() => ir({ ver: 'calendario' })}><CalendarDays size={16} aria-hidden="true" /></button>
        </div>
      </Cabecera>

      <BarraBusqueda busca={busca} onBusca={v => { setBusca(v); setPag(1) }} placeholder="Buscar persona o cargo…" filtro={filtro} onFiltro={v => { setFiltro(v); setPag(1) }} lugares={at.lugares} personas={at.personas}>
        {/* El estado es un filtro más: en una lista desplegable, con su cuenta, junto a los de lugar y unidad. */}
        {ver === 'dia' && (
          <div className={`dc-filtro at-filtro-estado${estado ? ' on' : ''}`}>
            <Desplegable valor={estado} ariaLabel="Filtrar por estado" placeholder="Todos los estados" anchoMenu={270} claseBoton="at-dd-estados"
              opciones={[
                { valor: '', etiqueta: 'Todos los estados', lateral: String(filasDia.length), separada: true },
                ...GRUPOS_DIA.filter(g => !g.cuando || g.cuando === (esHoy ? 'hoy' : 'pasado')).map(g => {
                  const n = filasDia.filter(f => g.f(f.j)).length
                  return { valor: g.key, etiqueta: esHoy ? g.hoy || g.label : g.label, punto: g.punto, lateral: String(n), apagada: !n }
                }),
              ]}
              contenido={o => (
                <span className="pl-dd-trigger-estado">
                  {o?.punto && <i style={{ background: o.punto }} aria-hidden="true" />}
                  <span>{o ? o.etiqueta : 'Todos los estados'}</span>
                  <b>{o ? o.lateral : filasDia.length}</b>
                </span>
              )}
              onCambio={v => { setEstado(v); setPag(1) }} />
          </div>
        )}
        {conTemas && (
          <div className={`dc-filtro at-filtro-estado${tema ? ' on' : ''}`}>
            <Desplegable valor={tema} ariaLabel="Ver un tema" placeholder="Todas las jornadas" anchoMenu={270} claseBoton="at-dd-estados"
              opciones={[
                { valor: '', etiqueta: 'Todas las jornadas', separada: true },
                ...Object.entries(TEMAS).map(([k, t]) => {
                  const n = segunSituacion(k, hechos[k], k === tema ? situacion : '').length
                  return { valor: k, etiqueta: t.titulo, punto: t.punto, lateral: String(n), apagada: !n }
                }),
              ]}
              contenido={o => (
                <span className="pl-dd-trigger-estado">
                  {o?.punto && <i style={{ background: o.punto }} aria-hidden="true" />}
                  <span>{o ? o.etiqueta : 'Todas las jornadas'}</span>
                  {o && <b>{delTema.length}</b>}
                </span>
              )}
              onCambio={v => ir({ tema: v, lista: v && enLista ? '1' : null })} />
          </div>
        )}
        {tema && TEMAS[tema].situacion && (
          <div className="dc-filtro at-filtro-estado on">
            <Desplegable valor={situacion} ariaLabel="Filtrar por justificación" opciones={SITUACIONES} onCambio={v => ir({ sit: v })} />
          </div>
        )}
        {tema && (
          <div className="at-segmento at-modo" role="tablist" aria-label="Forma de ver el tema">
            <button type="button" role="tab" aria-selected={!enLista} aria-label="Cuadritos" title="Cuadritos" className={!enLista ? 'on' : ''} onClick={() => ir({ lista: null })}><LayoutGrid size={15} aria-hidden="true" /></button>
            <button type="button" role="tab" aria-selected={enLista} aria-label="Lista" title="Lista de cada caso" className={enLista ? 'on' : ''} onClick={() => ir({ lista: '1' })}><List size={15} aria-hidden="true" /></button>
          </div>
        )}
        {/* Exportar baja lo que muestran los filtros: va en su fila, al final. */}
        <button type="button" className="dc-btn at-exportar" onClick={exportar}><Download size={14} aria-hidden="true" /> Exportar CSV</button>
      </BarraBusqueda>

      {enLista ? (
        <ListaTema key={`${tema}|${periodo}|${situacion}`} tema={tema} lista={delTema} hayAlgo={hechos[tema].length > 0} periodo={periodo} />
      ) : tema && !genteTema.length ? (
        <div className="dc-tarjeta"><Vacio Icono={BookOpen} titulo={`Nada en ${periodo}`} texto={hechos[tema].length ? 'Pruebe con otros filtros.' : `No hay ${TEMAS[tema].titulo.toLowerCase()} en este período.`} /></div>
      ) : ver === 'calendario' ? (
        gente.length
          ? <LibroCalendario gente={gente} mes={mes} onDia={(persona, d) => setDetalle({ persona, fecha: d })} onAbrirDia={d => ir({ ver: null, fecha: d })} />
          : <div className="dc-tarjeta"><Vacio Icono={BookOpen} titulo="Nadie coincide" texto="Pruebe con otros filtros." /></div>
      ) : ver === 'mes' ? (
        gente.length
          ? <LibroMes gente={genteTema} foco={foco} mes={mes} onDia={(persona, d) => setDetalle({ persona, fecha: d })} onPersona={p => navigate(`/asistencia/persona/${p.id}?mes=${mes}`)} />
          : <div className="dc-tarjeta"><Vacio Icono={BookOpen} titulo="Nadie coincide" texto="Pruebe con otros filtros." /></div>
      ) : ver === 'dia' ? (
        filas.length ? (
          <LibroDia filas={filas} pagina={pagina} setPag={setPag} ahora={esHoy ? minutosAhora() : null} onAbrir={p => setDetalle({ persona: p, fecha })} />
        ) : (
          <div className="dc-tarjeta"><Vacio Icono={BookOpen} titulo="Ninguna jornada" texto="Nadie con jornada programada coincide con la fecha y los filtros elegidos." /></div>
        )
      ) : (
        gente.length ? (
          <LibroSemana gente={genteTema} foco={foco} semana={semana} pagina={pagina} setPag={setPag} onDia={(persona, d) => setDetalle({ persona, fecha: d })} onPersona={p => navigate(`/asistencia/persona/${p.id}?mes=${mesDe(fecha)}`)} />
        ) : <div className="dc-tarjeta"><Vacio Icono={BookOpen} titulo="Nadie coincide" texto="Pruebe con otros filtros." /></div>
      )}

      {detalle && <DetalleJornada persona={detalle.persona} fecha={detalle.fecha} onCerrar={() => setDetalle(null)} />}
      {exportando && (
        <Modal titulo={`Exportar ${nombreMes(mes)}`} Icono={Download} onCerrar={() => setExportando(false)} ancho={520}>
          <div className="at-exp-ops">
            <button type="button" onClick={() => { exportarJornadas(); setExportando(false) }}>
              <b>Las jornadas</b><span>Una fila por persona y día: entrada, salida, descanso, horas, tardanza y estado, al segundo.</span>
            </button>
            <button type="button" onClick={() => { exportarPlanillas(); setExportando(false) }}>
              <b>Resumen para planillas</b><span>Una fila por persona con el mes: días, faltas, horas trabajadas, retrasos, lo injustificado y las horas extra aprobadas. Formato fijo, en segundos, para el sistema de sueldos.</span>
            </button>
          </div>
          <p className="at-ayuda" style={{ marginTop: 10 }}>Bajan las personas que dejan pasar los filtros. Los días que todavía no pasaron no cuentan.</p>
        </Modal>
      )}
    </div>
  )
}

/* ── EL MES COMO PLANILLA ──
   Cada cuadrito es una jornada, con el color de su estado; un clic la abre. Lo acumulado cuenta sólo
   días cerrados (el de hoy suma cuando la persona marca la salida), igual que la ficha de la persona.
   Faltas: «ausente» es la que cuenta; la ausencia con vacación, permiso o licencia va aparte. */
const LEYENDA_MES = [['ok', 'A tiempo'], ['tarde', 'Tarde o salió antes'], ['falta', 'Faltó'], ['just', 'De vacaciones o con permiso'], ['extra', 'Horas extra'], ['inc', 'Salida sin marcar'], ['libre', 'Día libre']]
const TONO_MES = { presente: 'ok', termino: 'ok', trabajando: 'hoy', pausa: 'hoy', porLlegar: 'hoy', tarde: 'tarde', anticipada: 'tarde', ausente: 'falta', sinMarcar: 'falta', justificada: 'just', extra: 'extra', incompleta: 'inc', libre: 'libre' }
const ORDENES = {
  veces: (a, b) => b.tarde.veces - a.tarde.veces || b.tarde.min - a.tarde.min,
  tardanza: (a, b) => b.tarde.min - a.tarde.min || b.tarde.veces - a.tarde.veces,
  faltas: (a, b) => b.faltas - a.faltas || b.justificadas - a.justificadas,
  saldo: (a, b) => (a.saldo ?? 0) - (b.saldo ?? 0),
}

function LibroMes({ gente, foco, mes, onDia, onPersona }) {
  const navigate = useNavigate()
  const at = useAsistencia()
  const [orden, setOrden] = useState('')
  const [pag, setPag] = useState(1)
  /* Un clic en la persona abre el resumen de su mes en una ventana, sin salir del Libro. */
  const [abierta, setAbierta] = useState(null)
  const dias = useMemo(() => diasDelMes(mes), [mes])
  const filas = useMemo(() => gente.map(p => {
    const js = dias.map(d => (d <= at.hoy ? at.jornadaDe(p, d) : null))
    return { p, js, ...resumenDe(js, dias, at.hoy) }
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
              {cab('veces', 'Retrasos')}
              {cab('tardanza', 'Tiempo de retraso')}
              {cab('faltas', 'Faltas')}
              {cab('saldo', 'Horas del mes')}
            </tr>
          </thead>
          <tbody>
            {ordenadas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(fila => { const { p, js } = fila; return (
              <tr key={p.id}>
                <td className="at-mes-persona"><PersonaAt persona={p} size={28} sub={p.unidad} onClick={() => setAbierta(ordenadas.find(x => x.p.id === p.id))} /></td>
                <td>
                  <div className="at-mes-dias" style={columnas}>
                    {dias.map((d, i) => {
                      const j = js[i]
                      if (!j) return <span key={d} className="at-mes-c t-futuro" />
                      const det = `${fechaLarga(d)} · ${ESTADOS[j.estado].label}${j.llegoTarde ? ` · ${duracion(j.tardanza)} tarde` : ''}`
                      return <button key={d} type="button" className={`at-mes-c t-${TONO_MES[j.estado] || 'libre'}${d === at.hoy ? ' hoy' : ''}${foco && !foco.has(`${p.id}|${d}`) ? ' apagado' : ''}`} title={det} aria-label={`${p.name}, ${det}`} onClick={() => onDia(p, d)} />
                    })}
                  </div>
                </td>
                <CeldasAcumulado r={fila} rotuloHoras="Horas del mes" />
              </tr>
            ) })}
          </tbody>
        </table>
      </div>
      <div className="at-mes-leyenda">
        {LEYENDA_MES.map(([k, t]) => <span key={k}><i className={`at-mes-c t-${k}`} />{t}</span>)}
      </div>
      <Paginacion page={pagina} setPage={setPag} total={ordenadas.length} perPage={POR_PAGINA} nombre="personas" nombreUno="persona" />
      {abierta && <ModalMesPersona fila={abierta} mes={mes} dias={dias} hoy={at.hoy} onCerrar={() => setAbierta(null)} onDia={onDia} onCompleta={() => onPersona(abierta.p)} onPdf={() => navigate(`/asistencia/persona/${abierta.p.id}?mes=${mes}&pdf=1`)} />}
    </div>
  )
}

/* ── EL DÍA COMO TABLA LIMPIA (E1) ──
   Solo números, bien ordenados, como el timesheet de BambooHR: el horario al lado de la entrada para
   comparar sin pensar, el atraso en naranja junto a la hora y el estado con el punto de color del
   Mes. Y una barrita del día, chica, para leerlo sin números: el riel es su horario, el verde lo que
   trabajó, el naranja el atraso, el hueco el descanso y la rayita, ahora. */
/* Los grupos del filtro, con el punto de color de la tabla (D1). «cuando» dice si el grupo tiene
   sentido hoy, en un día pasado o en los dos: «Aún no les toca» solo existe hoy, «Salida sin
   marcar» solo en un día que ya pasó. Los que están en cero se ven apagados, no desaparecen. */
const GRUPOS_DIA = [
  { key: 'falta', label: 'Faltaron', hoy: 'No han llegado', punto: '#E5484D', f: j => j.estado === 'ausente' || j.estado === 'sinMarcar' },
  { key: 'tarde', label: 'Llegaron tarde', punto: '#F5B04F', f: j => j.llegoTarde },
  { key: 'trabajando', label: 'Trabajando', punto: '#2FCB8B', cuando: 'hoy', f: j => j.estado === 'trabajando' || j.estado === 'pausa' },
  { key: 'porLlegar', label: 'Aún no les toca', punto: '#94A3B8', cuando: 'hoy', f: j => j.estado === 'porLlegar' },
  { key: 'termino', label: 'Terminaron su jornada', punto: '#8FE3BF', f: j => j.salida != null },
  { key: 'incompleta', label: 'Salida sin marcar', punto: '#A78BEA', cuando: 'pasado', f: j => j.estado === 'incompleta' },
  { key: 'justificada', label: 'De vacaciones o con permiso', punto: '#C9D3DC', f: j => j.estado === 'justificada' },
]

/* La leyenda dibuja cada muestra igual que en la barrita: liso lo que pasó, rayado lo que no se trabajó. */
const LEYENDA_DIA = [['ok', 'Trabajó'], ['vivo', 'Trabajando ahora'], ['tarde', 'Llegó tarde o salió antes'], ['falta', 'No vino'], ['just', 'De vacaciones o con permiso'], ['inc', 'Salida sin marcar']]
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
  /* Sin números en la cabecera: la marca gris es el mediodía y el globito dice las horas exactas. */
  const globo = `${j.entrada != null ? `${hhmm(j.entrada)} → ${j.salida != null ? hhmm(j.salida) : ahora != null ? 'ahora' : 'sin salida'}` : ESTADOS[j.estado]?.label || ''}${prog ? ` · horario ${hhmm(prog[0])}–${hhmm(prog[1])}` : ''}`
  return (
    <div className="at-minidia" role="img" title={globo} aria-label={`${p.name}: ${globo}`}>
      {segs.map(([tono, a, b], i) => <i key={i} className={`s-${tono}`} style={{ left: x(a), width: w(a, b) }} />)}
      <i className="s-tick" style={{ left: x(12 * 60) }} />
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
              return (
                <tr key={p.id} tabIndex={0} className="at-dia-fila" onClick={abrir} onKeyDown={e => { if (e.key === 'Enter') abrir() }}>
                  <td><PersonaAt persona={p} size={30} sub={`${p.unidad} · ${remoto ? 'Remoto' : p.lugar?.nombre || 'Sin lugar'}`} /></td>
                  <td className="at-dia-hor">{h?.modo === 'fijo' ? <><b>{h.entrada} – {h.salida}</b><small>{fr ? `descanso ${hhmm(fr.desde)}–${hhmm(fr.hasta)}` : 'sin descanso'}</small></> : h ? <><b>Flexible</b><small>meta {duracion(h.meta, { corto: true })}</small></> : '—'}</td>
                  <td className="at-dia-num"><b className={j.llegoTarde ? 'tarde' : j.estado === 'sinMarcar' || j.estado === 'ausente' ? 'falta' : ''}>{hhmm(j.entrada)}</b><small className={j.llegoTarde ? 'tarde' : ''}>{notaEntrada}</small></td>
                  <td className="at-dia-num"><b>{hhmm(j.salida)}</b>{notaSalida && <small className={alerta && !alerta.justificacion ? 'alerta' : ''}>{notaSalida}</small>}</td>
                  <td className="at-minidia-c"><MiniDia p={p} j={j} ahora={ahora} /></td>
                  <td className="at-dia-num"><b>{j.entrada != null ? duracion(j.trabajado, { corto: true }) : '—'}</b><small>de {h?.modo === 'flexible' ? duracion(h.meta, { corto: true }) : duracion(j.programado, { corto: true })}</small></td>
                  <td><EstadoDia persona={p} jornada={j} ahora={ahora} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="at-mes-leyenda">
        <span><i className="at-leyenda-riel" />Su horario</span>
        {LEYENDA_DIA.map(([k, txt]) => <span key={k}><i className={`at-ley-seg s-${k}`} />{txt}</span>)}
        <span><i className="at-leyenda-ahora" />Ahora</span>
      </div>
      <Paginacion page={pagina} setPage={setPag} total={filas.length} perPage={POR_PAGINA} nombre="jornadas" nombreUno="jornada" />
    </div>
  )
}

/* ── EL MES DE UNA PERSONA, EN UNA VENTANA ──
   Un clic en la persona del Mes abre su resumen sin salir del Libro: las mismas cifras de la fila,
   más grandes, y su calendario con el color de cada día. Un clic en un día abre esa jornada; la
   página entera de la persona queda a un botón. */
function ModalMesPersona({ fila, mes, dias, hoy, onCerrar, onDia, onCompleta, onPdf }) {
  const { p, js, tarde, faltas, justificadas, saldo, trabajado, programado, diasTrabajados, diasConJornada } = fila
  const huecos = diaISO(dias[0]) - 1
  const injustificado = tarde.injust <= 0 ? 'justificado' : tarde.injust >= tarde.min ? 'sin justificar' : `${duracion(tarde.min - tarde.injust)} justificados`
  const cifras = [
    ['Días trabajados', diasConJornada ? `${diasTrabajados} de ${diasConJornada}` : '—', '', ''],
    ['Retrasos', tarde.veces || '—', tarde.veces ? (tarde.veces === 1 ? 'vez' : 'veces') : '', tarde.veces ? 'tarde' : ''],
    ['Tiempo de retraso', tarde.veces ? duracion(tarde.min) : '—', tarde.veces ? injustificado : '', tarde.veces ? 'tarde' : ''],
    ['Faltas', faltas || (justificadas ? 0 : '—'), justificadas ? `+ ${justificadas} con permiso` : faltas ? 'sin justificar' : '', faltas ? 'falta' : ''],
    ['Horas del mes', saldo == null ? '—' : duracion(trabajado, { corto: true }), saldo == null ? '' : `de ${duracion(programado, { corto: true })} · ${saldo >= 0 ? 'completas' : `faltan ${duracion(-saldo, { corto: true })}`}`, saldo != null && saldo < 0 ? 'falta' : ''],
  ]
  return (
    <Modal titulo={`Su mes · ${nombreMes(mes)}`} Icono={CalendarDays} onCerrar={onCerrar} ancho={660}
      pie={<><button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cerrar</button><span style={{ flex: 1 }} /><button type="button" className="dc-btn" onClick={onPdf}><FileText size={14} aria-hidden="true" /> Descargar PDF</button><button type="button" className="pl-btn-save" onClick={onCompleta}>Ver su asistencia completa</button></>}>
      <div className="at-mm at-mes">
        <PersonaAt persona={p} size={44} sub={`${p.cargo} · ${p.unidad}`} />
        <div className="at-mm-cifras">
          {cifras.map(([t, v, s, tono]) => (
            <div key={t}><span>{t}</span><b className={tono}>{v}</b>{s && <small>{s}</small>}</div>
          ))}
        </div>
        <div className="at-mm-cal" role="grid" aria-label={`Calendario de ${nombreMes(mes)}`}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={`h${i}`} className="cab">{d}</span>)}
          {Array.from({ length: huecos }, (_, i) => <span key={`v${i}`} />)}
          {dias.map((d, i) => {
            const j = js[i]
            const n = aFecha(d).getDate()
            if (!j) return <span key={d} className="at-mm-dia t-futuro"><b>{n}</b></span>
            const det = `${fechaLarga(d)} · ${ESTADOS[j.estado].label}${j.llegoTarde ? ` · ${duracion(j.tardanza)} tarde` : ''}`
            return (
              <button key={d} type="button" className={`at-mm-dia t-${TONO_MES[j.estado] || 'libre'}${d === hoy ? ' hoy' : ''}`} title={det} aria-label={det} onClick={() => onDia(p, d)}>
                <b>{n}</b>{j.entrada != null && <small>{hhmm(j.entrada)}</small>}
              </button>
            )
          })}
        </div>
        <div className="at-mes-leyenda" style={{ padding: 0 }}>
          {LEYENDA_MES.map(([k, t]) => <span key={k}><i className={`at-mes-c t-${k}`} />{t}</span>)}
        </div>
      </div>
    </Modal>
  )
}

/* ── LO ACUMULADO DE UN PERÍODO, IGUAL EN LA SEMANA Y EN EL MES ──
   Cuenta solo días cerrados (el de hoy suma cuando marca la salida). Retrasos: cuántas veces y
   cuánto tiempo, con lo sin justificar. Faltas: las ausentes; las de vacaciones, permiso o licencia
   van aparte. Y LO JUSTIFICADO NO ES HORA QUE FALTA: un día de vacaciones no suma a lo programado,
   si no «faltaban» 22 horas a quien estuvo cuatro días de vacaciones. */
function resumenDe(js, dias, hoy) {
  const cerradas = js.filter((j, i) => j && j.estado !== 'libre' && (dias[i] !== hoy || j.salida != null))
  const conJornada = cerradas.filter(j => j.estado !== 'justificada')
  const tardes = cerradas.filter(j => j.llegoTarde)
  const sum = (lista, k) => lista.reduce((s, j) => s + (j[k] || 0), 0)
  const trabajado = sum(cerradas, 'trabajado')
  const programado = sum(conJornada, 'programado')
  return {
    tarde: { veces: tardes.length, min: sum(tardes, 'tardanza'), injust: sum(tardes, 'tardanzaInjustificada') },
    faltas: cerradas.filter(j => j.estado === 'ausente').length,
    justificadas: cerradas.filter(j => j.estado === 'justificada').length,
    saldo: conJornada.length ? trabajado - programado : null,
    trabajado, programado,
    diasTrabajados: cerradas.filter(j => j.entrada != null).length,
    diasConJornada: conJornada.filter(j => j.programado > 0).length,
  }
}

const CORTO_JUSTIFICADO = { 'De vacaciones': 'Vacaciones', 'Con permiso': 'Permiso', 'Con licencia': 'Licencia' }

/* Las celdas de lo acumulado, las mismas en la Semana y en el Mes. */
function CeldasAcumulado({ r, rotuloHoras }) {
  const { tarde, faltas, justificadas, saldo, trabajado, programado } = r
  return (
    <>
      <td className="at-mes-acc num">{tarde.veces ? <b className="tarde">{tarde.veces}</b> : <span className="dc-muted">—</span>}</td>
      <td className="at-mes-acc num">
        {tarde.veces ? (
          <>
            <b className="tarde">{duracion(tarde.min)}</b>
            <small>{tarde.injust <= 0 ? 'justificado' : tarde.injust >= tarde.min ? (tarde.veces > 1 ? 'todo sin justificar' : 'sin justificar') : `${duracion(tarde.min - tarde.injust)} justificados`}</small>
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
      <td className="at-mes-acc num" aria-label={rotuloHoras}>
        {saldo == null ? <span className="dc-muted" title="El día en curso suma cuando la persona marca la salida">—</span> : (
          <>
            <b>{duracion(trabajado, { corto: true })}</b>
            <small>de {duracion(programado, { corto: true })}</small>
            <small style={{ color: saldo >= 0 ? 'var(--dc-verde)' : 'var(--dc-rojo)' }}>{saldo >= 0 ? 'completas' : `faltan ${duracion(-saldo, { corto: true })}`}</small>
          </>
        )}
      </td>
    </>
  )
}

/* ── LA SEMANA, CON EL LENGUAJE DEL MES (W1) ──
   Cada día en el color lleno del Mes, con la hora de entrada y de salida; el fin de semana, apagado.
   A la derecha, lo mismo que el Mes: retrasos, tiempo de retraso, faltas y horas de la semana. */
function LibroSemana({ gente, foco, semana, pagina, setPag, onDia, onPersona }) {
  const at = useAsistencia()
  const [orden, setOrden] = useState('')
  const filas = useMemo(() => gente.map(p => {
    const js = semana.map(d => (d <= at.hoy ? at.jornadaDe(p, d) : null))
    return { p, js, ...resumenDe(js, semana, at.hoy) }
  }), [gente, semana, at])
  const ordenadas = orden ? [...filas].sort(ORDENES[orden]) : filas
  const cab = (k, txt) => (
    <th className="at-mes-acc">
      <button type="button" className={`at-mes-orden${orden === k ? ' on' : ''}`} aria-pressed={orden === k} onClick={() => { setOrden(orden === k ? '' : k); setPag(1) }} title={orden === k ? 'Quitar el orden' : 'Ordenar de mayor a menor'}>{txt}{orden === k ? ' ↓' : ''}</button>
    </th>
  )
  return (
    <div className="as-table-wrap at-mes">
      <div style={{ overflowX: 'auto' }}>
        <table className="as-table at-mes-tabla at-sem-tabla">
          <thead>
            <tr>
              <th className="at-mes-persona">Colaborador</th>
              {semana.map(d => <th key={d} className={`at-sem-dia${d === at.hoy ? ' hoy' : ''}${diaISO(d) >= 6 ? ' finde' : ''}`}>{DIAS_CORTOS[diaISO(d)]} {aFecha(d).getDate()}</th>)}
              {cab('veces', 'Retrasos')}
              {cab('tardanza', 'Tiempo de retraso')}
              {cab('faltas', 'Faltas')}
              {cab('saldo', 'Horas de la semana')}
            </tr>
          </thead>
          <tbody>
            {ordenadas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(r => (
              <tr key={r.p.id}>
                <td className="at-mes-persona"><PersonaAt persona={r.p} size={28} sub={r.p.unidad} onClick={() => onPersona(r.p)} /></td>
                {semana.map((d, i) => {
                  const j = r.js[i]
                  if (!j) return <td key={d}><span className="at-sem-c t-futuro" /></td>
                  const tono = TONO_MES[j.estado] || 'libre'
                  const det = `${fechaLarga(d)} · ${ESTADOS[j.estado].label}${j.llegoTarde ? ` · ${duracion(j.tardanza)} tarde` : ''}`
                  const texto = j.entrada != null
                    ? <><b>{hhmm(j.entrada)}</b><span>{j.salida != null ? hhmm(j.salida) : '…'}</span></>
                    : <span>{j.estado === 'libre' ? 'Libre' : j.estado === 'justificada' ? CORTO_JUSTIFICADO[motivoJustificado(j)] : ESTADOS[j.estado].label}</span>
                  return (
                    <td key={d} className="at-sem-td">
                      <button type="button" className={`at-sem-c t-${tono}${d === at.hoy ? ' hoy' : ''}${foco && !foco.has(`${r.p.id}|${d}`) ? ' apagado' : ''}`} title={det} aria-label={`${r.p.name}, ${det}`} onClick={() => onDia(r.p, d)}>{texto}</button>
                    </td>
                  )
                })}
                <CeldasAcumulado r={r} rotuloHoras="Horas de la semana" />
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

/* ── EL LIBRO COMO CALENDARIO (C1) ──
   La vista gráfica del mes. Cada día muestra las caras de quienes hay que mirar —aro rojo si faltó,
   ámbar si llegó tarde—, hasta cuatro y «+N», y debajo cuántos. Al tocar un día, el panel del costado
   lista a todas las personas de ese día agrupadas por lo que les pasó; cada una abre su jornada y el
   día entero se abre en el Libro. Los fines de semana y feriados, sin nadie con jornada, se apagan. */
const GRUPOS_CAL = [
  { key: 'falta', titulo: 'Faltaron', hoy: 'No han llegado', color: '#E5484D', f: j => j.estado === 'ausente' || j.estado === 'sinMarcar' },
  { key: 'tarde', titulo: 'Llegaron tarde', color: '#F5B04F', f: j => j.llegoTarde },
  { key: 'just', titulo: 'De vacaciones o con permiso', color: '#C9D3DC', f: j => j.estado === 'justificada' },
  { key: 'inc', titulo: 'Salida sin marcar', color: '#A78BEA', f: j => j.estado === 'incompleta' },
  { key: 'ok', titulo: 'A tiempo', color: '#2FCB8B', plegado: true, f: j => j.entrada != null && !j.llegoTarde },
]

function LibroCalendario({ gente, mes, onDia, onAbrirDia }) {
  const at = useAsistencia()
  const dias = useMemo(() => diasDelMes(mes), [mes])
  /* El resumen de cada día: quién faltó, quién llegó tarde, quién tiene permiso, quién llegó bien. */
  const porDia = useMemo(() => dias.map(d => {
    if (d > at.hoy) return { d, futuro: true }
    const filas = gente.map(p => ({ p, j: at.jornadaDe(p, d) })).filter(x => x.j.estado !== 'libre')
    const grupos = Object.fromEntries(GRUPOS_CAL.map(g => [g.key, filas.filter(x => g.f(x.j))]))
    return { d, filas, grupos, libre: !filas.length }
  }), [dias, gente, at])
  /* Un clic en un día abre su ventana con todo: no hay panel al costado, el calendario usa la pantalla. */
  const [abierto, setAbierto] = useState(null)
  const huecos = diaISO(dias[0]) - 1
  const dia = porDia.find(x => x.d === abierto)

  return (
    <div className="at-cal-libro at-mes">
      <div className="at-cal-grid" role="grid" aria-label={`Calendario de ${nombreMes(mes)}`}>
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(x => <span key={x} className="at-cal-cab">{x}</span>)}
        {Array.from({ length: huecos }, (_, i) => <span key={`h${i}`} />)}
        {porDia.map(x => {
          const n = aFecha(x.d).getDate()
          if (x.futuro || x.libre) return <div key={x.d} className={`at-cal-d ${x.futuro ? 'futuro' : 'libre'}`}><b>{n}</b></div>
          const faltas = x.grupos.falta; const tardes = x.grupos.tarde
          const caras = [...faltas.map(f => ({ ...f, tono: 'falta' })), ...tardes.map(f => ({ ...f, tono: 'tarde' }))]
          const vistas = caras.slice(0, 5)
          return (
            <button key={x.d} type="button" className={`at-cal-d${x.d === at.hoy ? ' hoy' : ''}`} onClick={() => setAbierto(x.d)}
              aria-label={`${fechaLarga(x.d)}: ${tardes.length} llegaron tarde, ${faltas.length} ${x.d === at.hoy ? 'no han llegado' : 'faltaron'}. Abrir el día`}>
              <b>{n}</b>
              {caras.length ? (
                <span className="at-cal-caras">
                  {vistas.map(c => <span key={c.p.id} className={`at-cal-cara t-${c.tono}`} title={`${c.p.name} · ${c.tono === 'falta' ? 'faltó' : `${duracion(c.j.tardanza)} tarde`}`}><Avatar persona={c.p} size={24} /></span>)}
                  {caras.length > 5 && <span className="at-cal-mas">+{caras.length - 5}</span>}
                </span>
              ) : <span className="at-cal-bien">Todos a tiempo</span>}
              <small>{[tardes.length && `${tardes.length} tarde`, faltas.length && `${faltas.length} ${x.d === at.hoy ? 'sin llegar' : 'faltó'}`].filter(Boolean).join(' · ') || `${x.grupos.ok.length} a tiempo`}</small>
            </button>
          )
        })}
      </div>
      {dia && <ModalDiaCal dia={dia} hoy={at.hoy} onCerrar={() => setAbierto(null)} onDia={onDia} onAbrirDia={onAbrirDia} />}
    </div>
  )
}

/* ── EL DÍA ENTERO, EN UNA VENTANA ──
   Lo que se abre al tocar un día del calendario: las cifras del día, que también filtran, un
   buscador y la misma tabla del Día —horario, entrada, salida, su barrita, horas y estado—. Un clic
   en una persona abre su jornada encima; «Abrir este día en el Libro» lleva a la vista Día. */
function ModalDiaCal({ dia, hoy, onCerrar, onDia, onAbrirDia }) {
  const [grupo, setGrupo] = useState('')
  const [busca, setBusca] = useState('')
  const [pag, setPag] = useState(1)
  const esHoy = dia.d === hoy
  const texto = busca.trim().toLowerCase()
  const base = grupo ? dia.grupos[grupo] : dia.filas
  const filas = base.filter(({ p }) => !texto || `${p.name} ${p.cargo} ${p.unidad} ${p.lugar?.nombre || ''}`.toLowerCase().includes(texto))
  const pagina = Math.min(pag, Math.max(1, Math.ceil(filas.length / POR_PAGINA)))
  return (
    <Modal titulo={`${fechaLarga(dia.d)}${esHoy ? ' · hoy' : ''}`} Icono={CalendarDays} onCerrar={onCerrar} ancho={1120}
      pie={<><button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cerrar</button><button type="button" className="pl-btn-save" onClick={() => onAbrirDia(dia.d)}>Abrir este día en el Libro</button></>}>
      <div className="at-cal-modal">
        <div className="at-cal-m-cifras" role="group" aria-label="Filtrar por lo que pasó">
          <button type="button" className={!grupo ? 'on' : ''} aria-pressed={!grupo} onClick={() => { setGrupo(''); setPag(1) }}>
            <b>{dia.filas.length}</b><span>Con jornada</span>
          </button>
          {GRUPOS_CAL.map(g => (
            <button key={g.key} type="button" className={grupo === g.key ? 'on' : ''} aria-pressed={grupo === g.key} disabled={!dia.grupos[g.key].length} onClick={() => { setGrupo(grupo === g.key ? '' : g.key); setPag(1) }}>
              <b><i style={{ background: g.color }} aria-hidden="true" />{dia.grupos[g.key].length}</b><span>{esHoy && g.hoy ? g.hoy : g.titulo}</span>
            </button>
          ))}
        </div>
        <div className="at-cal-m-barra" aria-hidden="true">
          {GRUPOS_CAL.filter(g => g.key !== 'inc').map(g => <i key={g.key} style={{ width: `${(dia.grupos[g.key].length / Math.max(1, dia.filas.length)) * 100}%`, background: g.color }} />)}
        </div>
        <div className="pl-search-wrap at-busca at-cal-m-busca">
          <Search size={13} className="pl-search-ico" />
          <input type="search" className="pl-search" placeholder="Buscar persona, cargo o lugar…" value={busca} onChange={e => { setBusca(e.target.value); setPag(1) }} aria-label="Buscar persona, cargo o lugar" />
        </div>
        {filas.length
          ? <LibroDia filas={filas} pagina={pagina} setPag={setPag} ahora={esHoy ? minutosAhora() : null} onAbrir={p => onDia(p, dia.d)} />
          : <div className="dc-tarjeta"><Vacio Icono={BookOpen} titulo="Nadie coincide" texto="Pruebe con otro grupo u otra palabra." /></div>}
      </div>
    </Modal>
  )
}
