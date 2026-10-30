import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Download, Building2, Warehouse, House, Lock, BookOpen } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Vacio } from '../../components/documentacion/comunes'
import Paginacion from '../../components/layout/Paginacion'
import { EstadoChip, PersonaAt, BarraDia, BarraBusqueda, FILTRO_VACIO, filtrar } from '../../components/asistencia/comunes'
import DetalleJornada from '../../components/asistencia/DetalleJornada'
import Desplegable from '../../components/layout/Desplegable'
import { ESTADOS, DIAS_CORTOS, fechaLarga, fechaCorta, hhmm, duracion, sumarDias, diaISO, minutosAhora, mesDe, descargarCSV, aFecha } from '../../data/asistenciaData'

/* ── EL LIBRO DE ASISTENCIA ────────────────────────────────────────────────
   Todas las jornadas, un día o una semana a la vez. El día es una tabla —quién, a qué hora entró y
   salió, cuánto trabajó— con la barra del día para leerlo sin números; la semana es una grilla de
   colores, como la «timesheet» de BambooHR, para encontrar patrones: el que llega tarde todos los
   lunes se ve de lejos.

   La fecha viaja en la dirección (`?fecha=`, `?ver=semana`): se enlaza y la flecha de atrás vuelve. */

const POR_PAGINA = 12

export default function Registro() {
  const at = useAsistencia()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const fecha = params.get('fecha') || at.hoy
  const ver = params.get('ver') === 'semana' ? 'semana' : 'dia'
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [estado, setEstado] = useState('')
  const [busca, setBusca] = useState('')
  const [pag, setPag] = useState(1)
  const [detalle, setDetalle] = useState(null)

  const ir = (cambios) => { const n = new URLSearchParams(params); Object.entries(cambios).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); setParams(n, { replace: true }); setPag(1) }
  const lunes = sumarDias(fecha, 1 - diaISO(fecha))
  const semana = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i))
  const paso = ver === 'semana' ? 7 : 1
  const esHoy = fecha === at.hoy
  const texto = busca.trim().toLowerCase()

  const gente = useMemo(() => filtrar(at.personas.filter(p => p.asig), filtro).filter(p => !texto || `${p.name} ${p.cargo} ${p.unidad}`.toLowerCase().includes(texto)), [at.personas, filtro, texto])
  const filasDia = useMemo(() => gente.map(p => ({ p, j: at.jornadaDe(p, fecha) })).filter(f => f.j.estado !== 'libre'), [gente, fecha, at])  
  const cuentas = useMemo(() => filasDia.reduce((acc, f) => { acc[f.j.estado] = (acc[f.j.estado] || 0) + 1; return acc }, {}), [filasDia])
  const filas = filasDia.filter(f => !estado || f.j.estado === estado)
  const paginas = Math.max(1, Math.ceil((ver === 'dia' ? filas.length : gente.length) / POR_PAGINA))
  const pagina = Math.min(pag, paginas)

  const exportar = () => {
    const dias = ver === 'semana' ? semana.filter(d => d <= at.hoy) : [fecha]
    const rows = [['Fecha', 'Colaborador', 'Código', 'Unidad organizacional', 'Sucursal', 'Centro de trabajo', 'Modalidad', 'Entrada', 'Salida', 'Pausas (min)', 'Trabajado (min)', 'Programado (min)', 'Tardanza (min)', 'Horas extra autorizadas trabajadas (min)', 'Fuera de horario (min)', 'Estado']]
    dias.forEach(d => gente.forEach(p => {
      const j = at.jornadaDe(p, d)
      if (j.estado === 'libre') return
      const suc = at.lugarPorId.get(p.sucursalId)
      rows.push([d, p.name, p.codigo, p.unidad, suc?.nombre || '', p.centroId ? p.lugar.nombre : '', p.asig.modalidad, hhmm(j.entrada), hhmm(j.salida), j.pausas, Math.round(j.trabajado), j.programado, Math.round(j.tardanza), Math.round(j.extra), Math.round(j.fueraDeHorario), ESTADOS[j.estado].label])
    }))
    descargarCSV(`asistencia_${dias[0]}${dias.length > 1 ? `_a_${dias[dias.length - 1]}` : ''}.csv`, rows)
  }

  const cerrado = !!at.cierres[mesDe(fecha)]

  return (
    <div className="content-scroll">
      <Cabecera titulo="Libro de asistencia" sub="Cada jornada con su entrada, su salida y su evidencia.">
        <button type="button" className="dc-btn" onClick={exportar}><Download size={14} aria-hidden="true" /> Exportar CSV</button>
      </Cabecera>

      <div className="at-barra-herr">
        <div className="at-barra-herr-izq">
          <div className="at-dia-nav">
            <button type="button" aria-label="Anterior" onClick={() => ir({ fecha: sumarDias(fecha, -paso) })}><ChevronLeft size={16} /></button>
            <span>{ver === 'semana' ? `${fechaCorta(semana[0])} – ${fechaCorta(semana[6])}` : esHoy ? `Hoy · ${fechaCorta(fecha)}` : fechaLarga(fecha)}</span>
            <button type="button" aria-label="Siguiente" disabled={sumarDias(fecha, paso) > at.hoy && (ver === 'dia' || semana[6] >= at.hoy)} onClick={() => ir({ fecha: sumarDias(fecha, paso) > at.hoy ? at.hoy : sumarDias(fecha, paso) })}><ChevronRight size={16} /></button>
          </div>
          {!esHoy && <button type="button" className="dc-btn dc-btn-sm" onClick={() => ir({ fecha: null })}>Ir a hoy</button>}
          <div className="at-segmento" role="tablist" aria-label="Vista">
            <button type="button" role="tab" aria-selected={ver === 'dia'} className={ver === 'dia' ? 'on' : ''} onClick={() => ir({ ver: null })}>Día</button>
            <button type="button" role="tab" aria-selected={ver === 'semana'} className={ver === 'semana' ? 'on' : ''} onClick={() => ir({ ver: 'semana' })}>Semana</button>
          </div>
          {cerrado && <span className="dc-chip dc-t-gris"><Lock size={11} aria-hidden="true" /> Mes cerrado</span>}
        </div>
      </div>

      <BarraBusqueda busca={busca} onBusca={v => { setBusca(v); setPag(1) }} placeholder="Buscar persona o cargo…" filtro={filtro} onFiltro={v => { setFiltro(v); setPag(1) }} lugares={at.lugares} personas={at.personas}>
        {/* El estado es un filtro más: en una lista desplegable, con su cuenta, para no ocupar una fila entera. */}
        {ver === 'dia' && (
          <div className={`dc-filtro at-filtro-estado${estado ? ' on' : ''}`}>
            <Desplegable valor={estado} ariaLabel="Filtrar por estado" placeholder={`Todos los estados (${filasDia.length})`}
              opciones={[{ valor: '', etiqueta: `Todos los estados (${filasDia.length})` }, ...Object.entries(cuentas).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ valor: k, etiqueta: `${ESTADOS[k].label} (${n})` }))]}
              onCambio={v => { setEstado(v); setPag(1) }} />
          </div>
        )}
      </BarraBusqueda>

      {ver === 'dia' ? (
        <>

          {filas.length ? (
            <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="as-table at-tabla">
                <thead><tr><th>Persona</th><th>Lugar</th><th>Entrada</th><th>Salida</th><th className="col-barra">Jornada</th><th>Trabajado</th><th>Estado</th></tr></thead>
                <tbody>
                  {filas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(({ p, j }) => {
                    const remoto = j.marcas.some(m => m.remoto && !m.rechazada)
                    const Ico = remoto ? House : p.lugar?.tipo === 'centro' ? Warehouse : Building2
                    const abrir = () => setDetalle({ persona: p, fecha })
                    return (
                      <tr key={p.id} tabIndex={0} onClick={abrir} onKeyDown={e => { if (e.key === 'Enter') abrir() }}>
                        <td><PersonaAt persona={p} size={30} sub={`${p.cargo} · ${p.unidad}`} /></td>
                        <td><span className="at-lugar-chip"><Ico size={13} aria-hidden="true" /> {remoto ? 'Remoto' : p.lugar?.nombre}</span></td>
                        <td className={`num${j.llegoTarde ? ' tarde' : ''}`}>{hhmm(j.entrada)}{j.tardanza > 0 && <small>+{duracion(j.tardanza)}</small>}</td>
                        <td className="num">{hhmm(j.salida)}{j.extra > 0 && <small style={{ color: 'var(--dc-azul)' }}>+{duracion(j.extra)} extra autorizada</small>}{j.fueraDeHorario > 0 && <small>+{duracion(j.fueraDeHorario)} fuera de horario</small>}</td>
                        <td className="col-barra"><BarraDia jornada={j} horario={p.horario} ahora={esHoy ? minutosAhora() : null} /></td>
                        <td className="num">{j.entrada != null ? duracion(j.trabajado, { corto: true }) : '—'}<small>de {p.horario?.modo === 'flexible' ? duracion(p.horario.meta, { corto: true }) : duracion(j.programado, { corto: true })}</small></td>
                        <td><EstadoChip estado={j.estado} pequeno /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <Paginacion page={pagina} setPage={setPag} total={filas.length} perPage={POR_PAGINA} nombre="jornadas" nombreUno="jornada" />
            </div>
          ) : (
            <div className="dc-tarjeta"><Vacio Icono={BookOpen} titulo="Ninguna jornada" texto="Nadie con jornada programada coincide con la fecha y los filtros elegidos." /></div>
          )}
        </>
      ) : (
        gente.length ? (
          <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="as-table at-semana">
              <thead>
                <tr>
                  <th>Persona</th>
                  {semana.map(d => <th key={d} className={`dia${d === at.hoy ? ' hoy' : ''}`}>{DIAS_CORTOS[diaISO(d)]} {aFecha(d).getDate()}</th>)}
                  <th style={{ textAlign: 'right' }}>Semana</th>
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
