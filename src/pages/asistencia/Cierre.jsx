import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Download, Lock, LockOpen, AlertTriangle, Wallet, Clock, CalendarX, Timer, TrendingUp } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Modal, Vacio } from '../../components/documentacion/comunes'
import Paginacion from '../../components/layout/Paginacion'
import { PersonaAt, BarraBusqueda, FILTRO_VACIO, filtrar, Cifra } from '../../components/asistencia/comunes'
import { diasDelMes, mesDe, mesVecino, nombreMes, duracion, descargarCSV } from '../../data/asistenciaData'

/* ── CIERRE DEL MES ────────────────────────────────────────────────────────
   El saldo de cada persona, listo para nómina: lo que trabajó, lo que debía, las faltas, la
   tardanza y las horas extra APROBADAS (las que no se aprobaron no se pagan). Es `calcularSaldo` del
   backend hecho tabla.

   CERRAR CONGELA. Un mes cerrado ya no se corrige —ni ajustes ni marcas manuales— porque lo que
   salió a nómina tiene que seguir diciendo lo mismo mañana. Se puede reabrir, y queda dicho quién lo
   cerró. Antes de cerrar, la pantalla avisa lo que sigue pendiente en Incidencias. */

const POR_PAGINA = 12

export default function Cierre() {
  const at = useAsistencia()
  const navigate = useNavigate()
  const [mes, setMes] = useState(mesDe(at.hoy))
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [busca, setBusca] = useState('')
  const [pag, setPag] = useState(1)
  const [confirmar, setConfirmar] = useState(false)
  const cierre = at.cierres[mes]

  const filas = useMemo(() => {
    const dias = diasDelMes(mes).filter(d => d < at.hoy)
    return filtrar(at.personas.filter(p => p.asig), filtro).map(p => {
      const js = dias.map(d => at.jornadaDe(p, d)).filter(j => j.estado !== 'libre')
      const s = k => js.reduce((t, j) => t + (j[k] || 0), 0)
      return {
        p,
        dias: js.filter(j => j.entrada != null).length,
        ausencias: js.filter(j => j.estado === 'ausente').length,
        justificadas: js.filter(j => j.estado === 'justificada').length,
        trabajado: s('trabajado'), programado: s('programado'), tardanza: s('tardanza'),
        /* Solo lo trabajado DENTRO de horas extra autorizadas; quedarse sin autorización va aparte. */
        extra: s('extra'), autorizado: s('autorizado'), fuera: s('fueraDeHorario'),
      }
    })
  }, [at, mes, filtro])

  const texto = busca.trim().toLowerCase()
  const visibles = filas.filter(f => !texto || `${f.p.name} ${f.p.unidad}`.toLowerCase().includes(texto))
  const paginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)
  const tot = k => filas.reduce((s, f) => s + f[k], 0)
  const pendientes = at.incidencias.filter(i => mesDe(i.fecha) === mes).length

  const exportar = () => descargarCSV(`cierre_asistencia_${mes}.csv`, [
    ['Código', 'Colaborador', 'Unidad organizacional', 'Sucursal', 'Centro de trabajo', 'Días trabajados', 'Ausencias', 'Justificadas', 'Trabajado (h)', 'Programado (h)', 'Saldo (h)', 'Tardanza (min)', 'Horas extra autorizadas (h)', 'Horas extra trabajadas (h)', 'Fuera de horario sin autorización (h)'],
    ...filas.map(f => [f.p.codigo, f.p.name, f.p.unidad, at.lugarPorId.get(f.p.sucursalId)?.nombre || '', f.p.centroId ? f.p.lugar.nombre : '', f.dias, f.ausencias, f.justificadas, (f.trabajado / 60).toFixed(2), (f.programado / 60).toFixed(2), ((f.trabajado - f.programado) / 60).toFixed(2), Math.round(f.tardanza), (f.autorizado / 60).toFixed(2), (f.extra / 60).toFixed(2), (f.fuera / 60).toFixed(2)]),
  ])

  return (
    <div className="content-scroll">
      <Cabecera titulo="Cierre del mes" sub="El saldo para nómina. Al cerrar el mes, ya no se corrige.">
        <button type="button" className="dc-btn" onClick={exportar}><Download size={14} aria-hidden="true" /> Exportar para nómina</button>
        {cierre
          ? <button type="button" className="dc-btn" onClick={() => at.reabrirMes(mes)}><LockOpen size={14} aria-hidden="true" /> Reabrir el mes</button>
          : <button type="button" className="pl-btn-new" onClick={() => setConfirmar(true)}><Lock size={14} aria-hidden="true" /> Cerrar {nombreMes(mes).split(' ')[0]}</button>}
      </Cabecera>

      <div className="at-barra-herr">
        <div className="at-barra-herr-izq">
          <div className="at-dia-nav">
            <button type="button" aria-label="Mes anterior" onClick={() => { setMes(mesVecino(mes, -1)); setPag(1) }}><ChevronLeft size={16} /></button>
            <span>{nombreMes(mes)}</span>
            <button type="button" aria-label="Mes siguiente" disabled={mes >= mesDe(at.hoy)} onClick={() => { setMes(mesVecino(mes, 1)); setPag(1) }}><ChevronRight size={16} /></button>
          </div>
          {cierre
            ? <span className="dc-chip dc-t-gris"><Lock size={11} /> Cerrado por {cierre.por}</span>
            : mes === mesDe(at.hoy) ? <span className="dc-chip dc-t-azul">En curso</span> : <span className="dc-chip dc-t-ambar">Sin cerrar</span>}
          {!cierre && pendientes > 0 && (
            <button type="button" className="dc-chip dc-t-ambar" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => navigate('/asistencia/incidencias')}>
              <AlertTriangle size={11} /> {pendientes} incidencias sin resolver
            </button>
          )}
        </div>
      </div>

      <BarraBusqueda busca={busca} onBusca={v => { setBusca(v); setPag(1) }} placeholder="Buscar persona…" filtro={filtro} onFiltro={v => { setFiltro(v); setPag(1) }} lugares={at.lugares} personas={at.personas} />

      <div className="at-cifras">
        <Cifra Icono={Clock} tono="verde" rotulo="Horas trabajadas" valor={duracion(tot('trabajado'), { corto: true })} detalle={`de ${duracion(tot('programado'), { corto: true })} programadas`} />
        <Cifra Icono={CalendarX} tono="rojo" rotulo="Ausencias" valor={tot('ausencias')} detalle={`${tot('justificadas')} justificadas aparte`} />
        <Cifra Icono={Timer} tono="ambar" rotulo="Tardanza acumulada" valor={duracion(tot('tardanza'), { corto: true })} detalle="horas : minutos" />
        <Cifra Icono={TrendingUp} tono="azul" rotulo="Horas extra" valor={duracion(tot('extra'), { corto: true })} detalle={`trabajadas de ${duracion(tot('autorizado'), { corto: true })} autorizadas · ${duracion(tot('fuera'), { corto: true })} fuera de horario no cuentan`} />
      </div>

      {visibles.length ? (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table at-tabla">
            <thead><tr><th>Persona</th><th>Días</th><th>Ausencias</th><th>Trabajado</th><th>Saldo</th><th>Tardanza</th><th>Horas extra</th></tr></thead>
            <tbody>
              {visibles.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(f => {
                const saldo = f.trabajado - f.programado
                const ir = () => navigate(`/asistencia/persona/${f.p.id}?mes=${mes}`)
                return (
                  <tr key={f.p.id} tabIndex={0} onClick={ir} onKeyDown={e => { if (e.key === 'Enter') ir() }}>
                    <td><PersonaAt persona={f.p} size={30} /></td>
                    <td className="num">{f.dias}</td>
                    <td className="num" style={{ color: f.ausencias ? 'var(--dc-rojo)' : undefined }}>{f.ausencias}{f.justificadas > 0 && <small>+{f.justificadas} justificadas</small>}</td>
                    <td className="num">{duracion(f.trabajado, { corto: true })}<small>de {duracion(f.programado, { corto: true })}</small></td>
                    <td className="num" style={{ color: saldo >= 0 ? 'var(--dc-verde)' : 'var(--dc-rojo)' }}>{duracion(saldo, { signo: true, corto: true })}</td>
                    <td className="num" style={{ color: f.tardanza ? 'var(--dc-ambar)' : undefined }}>{f.tardanza ? duracion(f.tardanza) : '—'}</td>
                    <td className="num" style={{ color: 'var(--dc-azul)' }}>{f.autorizado ? duracion(f.extra) : '—'}{f.autorizado > 0 && <small>de {duracion(f.autorizado)} autorizadas</small>}{f.fuera > 0 && <small style={{ color: 'var(--text-muted)' }}>{duracion(f.fuera)} fuera de horario</small>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Paginacion page={pagina} setPage={setPag} total={visibles.length} perPage={POR_PAGINA} nombre="personas" nombreUno="persona" />
        </div>
      ) : <div className="dc-tarjeta"><Vacio Icono={Wallet} titulo="Nadie coincide" texto="Pruebe con otros filtros." /></div>}

      {confirmar && (
        <Modal titulo={`Cerrar ${nombreMes(mes)}`} Icono={Lock} onCerrar={() => setConfirmar(false)} ancho={480}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setConfirmar(false)}>Cancelar</button>
            <button type="button" className="pl-btn-save" onClick={() => { at.cerrarMes(mes); setConfirmar(false) }}>Cerrar el mes</button>
          </>}>
          <div className="at-modal-campos">
            <p className="at-ayuda" style={{ fontSize: 13 }}>Al cerrar, nadie podrá ajustar marcaciones, agregar marcas manuales ni justificar días de {nombreMes(mes)}. Lo exportado para nómina seguirá diciendo lo mismo. Se puede reabrir si hace falta.</p>
            {pendientes > 0 && (
              <div className="at-aviso-linea" style={{ background: 'var(--dc-ambar-bg)', color: 'var(--dc-ambar)' }}>
                <AlertTriangle size={14} /> Quedan {pendientes} incidencias sin resolver en este mes. Si cierra, las horas extra no aprobadas no se pagan.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
