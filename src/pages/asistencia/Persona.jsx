import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowLeft, Building2, Warehouse, House, Clock, ScanFace, MapPin, Laptop, Download, FileText, Loader2 } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Vacio, Modal } from '../../components/documentacion/comunes'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import ReportePDF from '../../components/asistencia/ReportePDF'
import Avatar from '../../components/personas/Avatar'
import { motivoJustificado } from '../../components/asistencia/estadoDia'
import DetalleJornada from '../../components/asistencia/DetalleJornada'
import { ESTADOS, MODALIDADES, DIAS_CORTOS, diasDelMes, diaISO, mesVecino, mesDe, nombreMes, hhmm, duracion, aFecha, descargarCSV, fechaLarga, minutosAhora } from '../../data/asistenciaData'

/* ── LA ASISTENCIA DE UNA PERSONA, MES A MES (P1) ─────────────────────────
   Con el lenguaje del Libro: arriba, las mismas cifras que la ventana del mes —días trabajados,
   retrasos, tiempo de retraso, faltas, horas del mes— y la puntualidad; abajo, el calendario a todo el
   ancho en los colores llenos del Mes, con la entrada y la salida de cada día. Son los mismos números
   que la persona ve en su app. */

const TONO = { presente: 'ok', termino: 'ok', trabajando: 'hoy', pausa: 'hoy', porLlegar: 'hoy', tarde: 'tarde', anticipada: 'tarde', ausente: 'falta', sinMarcar: 'falta', justificada: 'just', extra: 'extra', incompleta: 'inc', libre: 'libre' }
const LEYENDA = [['ok', 'A tiempo'], ['tarde', 'Tarde o salió antes'], ['falta', 'Faltó'], ['just', 'Vacaciones o permiso'], ['extra', 'Horas extra'], ['inc', 'Salida sin marcar']]

export default function Persona() {
  const { id } = useParams()
  const at = useAsistencia()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const p = at.personaPorId.get(String(id))
  const mes = params.get('mes') || mesDe(at.hoy)
  const [detalle, setDetalle] = useState(null)
  const { empresa } = useOnboardingData()
  /* El PDF: «pidiendo» abre la ventana con la opción; «armando» dibuja las hojas fuera de la pantalla. */
  const [pidiendo, setPidiendo] = useState(params.get('pdf') === '1')
  const [conMarcas, setConMarcas] = useState(false)
  const [armando, setArmando] = useState(false)
  const [errorPdf, setErrorPdf] = useState(null)

  const dias = useMemo(() => (p ? diasDelMes(mes).map(d => ({ d, j: d <= at.hoy ? at.jornadaDe(p, d) : null })) : []), [p, mes, at])  

  if (!p) {
    return (
      <div className="content-scroll">
        <Cabecera titulo="Asistencia" />
        <div className="dc-tarjeta"><Vacio Icono={Clock} titulo="No encontramos a esa persona" texto="Puede que se haya dado de baja o que el enlace esté incompleto.">
          <button type="button" className="pl-btn-new" onClick={() => navigate('/asistencia/registro')}>Ir al libro de asistencia</button>
        </Vacio></div>
      </div>
    )
  }


  /* Lo acumulado cuenta días cerrados: el de hoy suma cuando marca la salida. Lo justificado no tiene
     horas programadas (no «faltan» horas a quien estuvo de vacaciones). */
  const pasados = dias.filter(x => x.j && x.j.estado !== 'libre')
  const cerrados = pasados.filter(x => x.d !== at.hoy || x.j.salida != null)
  const sum = (lista, k) => lista.reduce((s, x) => s + (x.j[k] || 0), 0)
  const trabajado = sum(cerrados, 'trabajado'); const programado = sum(cerrados, 'programado')
  const tardes = cerrados.filter(x => x.j.llegoTarde)
  const tardanza = sum(tardes, 'tardanza'); const tardanzaInj = sum(tardes, 'tardanzaInjustificada')
  /* Horas extra = lo trabajado dentro de lo autorizado; quedarse sin autorización va aparte. */
  const extraTrabajada = sum(cerrados, 'extra'); const extraAutorizada = sum(cerrados, 'autorizado'); const fueraHorario = sum(cerrados, 'fueraDeHorario')
  const faltas = cerrados.filter(x => x.j.estado === 'ausente').length
  const justificadas = cerrados.filter(x => x.j.estado === 'justificada').length
  const conEntrada = pasados.filter(x => x.j.entrada != null)
  const trabajados = cerrados.filter(x => x.j.entrada != null).length
  const conJornada = cerrados.filter(x => x.j.programado > 0).length
  const aTiempo = conEntrada.filter(x => !x.j.llegoTarde).length
  const puntualidad = conEntrada.length ? Math.round((aTiempo / conEntrada.length) * 100) : null
  const saldo = trabajado - programado
  /* La racha: días seguidos llegando a tiempo, contando hacia atrás desde el último marcado. */
  let racha = 0
  for (const x of [...conEntrada].reverse()) { if (x.j.llegoTarde) break; racha++ }

  const primero = diaISO(`${mes}-01`)
  const huecos = Array.from({ length: primero - 1 })
  const Ico = p.lugar?.tipo === 'centro' ? Warehouse : Building2

  const exportar = () => descargarCSV(`asistencia_${p.name.replace(/\s+/g, '_')}_${mes}.csv`, [
    ['Fecha', 'Entrada', 'Salida', 'Trabajado (min)', 'Programado (min)', 'Tardanza (min)', 'Extra (min)', 'Estado', 'Justificación'],
    ...pasados.map(({ d, j }) => [d, hhmm(j.entrada), hhmm(j.salida), Math.round(j.trabajado), j.programado, Math.round(j.tardanza), Math.round(j.extra), ESTADOS[j.estado].label, j.justificacion ? `${j.justificacion.tipo}: ${j.justificacion.motivo}` : '']),
  ])

  /* P1: las mismas cifras que la ventana del mes del Libro, más la puntualidad. */
  const cifras = [
    ['Días trabajados', conJornada ? <>{trabajados} <em>de {conJornada}</em></> : '—', '', ''],
    ['Retrasos', tardes.length || '—', tardes.length ? (tardes.length === 1 ? 'vez' : 'veces') : '', tardes.length ? 'tarde' : ''],
    ['Tiempo de retraso', tardes.length ? duracion(tardanza) : '—', tardes.length ? (tardanzaInj <= 0 ? 'justificado' : tardanzaInj >= tardanza ? 'sin justificar' : `${duracion(tardanza - tardanzaInj)} justificados`) : '', tardes.length ? 'tarde' : ''],
    ['Faltas', faltas || (justificadas ? 0 : '—'), justificadas ? `+ ${justificadas} con permiso` : faltas ? 'sin justificar' : '', faltas ? 'falta' : ''],
    ['Horas del mes', programado ? duracion(trabajado, { corto: true }) : '—', programado ? <>de {duracion(programado, { corto: true })} · <em className={saldo >= 0 ? 'bien' : 'falta'}>{saldo >= 0 ? 'completas' : `faltan ${duracion(-saldo, { corto: true })}`}</em></> : '', ''],
    ['Puntualidad', puntualidad == null ? '—' : `${puntualidad} %`, racha > 1 ? `${racha} días seguidos a tiempo` : `tolerancia de ${p.politica?.tolerancia ?? 10} min`, puntualidad != null && puntualidad >= 90 ? 'bien' : puntualidad != null ? 'tarde' : ''],
  ]

  return (
    <div className="content-scroll">
      <div>
        <button type="button" className="dc-btn dc-btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={13} /> Volver</button>
      </div>

      <section className="at-ficha-cab">
        <Avatar persona={p} size={72} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 className="at-ficha-nom">{p.name}</h1>
          <div className="at-ficha-sub">{p.cargo} · {p.unidad}</div>
          <div className="at-ficha-tags">
            {p.lugar && <span className="at-tag"><Ico size={12} /> {p.lugar.nombre}{p.lugar.tipo === 'centro' ? ` · ${at.lugarPorId.get(p.lugar.sucursalId)?.nombre || ''}` : ''}</span>}
            {p.asig && <span className="at-tag">{p.asig.modalidad === 'remoto' ? <House size={12} /> : p.asig.modalidad === 'hibrido' ? <Laptop size={12} /> : <MapPin size={12} />} {MODALIDADES[p.asig.modalidad].label}{p.asig.modalidad === 'hibrido' ? ` · oficina ${p.asig.diasOficina.map(d => DIAS_CORTOS[d]).join(', ')}` : ''}</span>}
            {p.horario && <span className="at-tag"><Clock size={12} /> {p.horario.nombre} · {p.horario.modo === 'fijo' ? `${p.horario.entrada}–${p.horario.salida}` : `meta ${duracion(p.horario.meta)}`}</span>}
            <span className="at-tag"><ScanFace size={12} /> {p.bio?.enrolado ? 'Rostro registrado' : 'Rostro sin registrar'}</span>
          </div>
        </div>
        {!p.asig && <button type="button" className="pl-btn-new" onClick={() => navigate('/asistencia/configuracion?ver=asignaciones')}>Asignar horario</button>}
        <div className="at-periodo at-pv-per">
          <div className="at-dia-nav">
            <button type="button" aria-label="Mes anterior" onClick={() => setParams({ mes: mesVecino(mes, -1) }, { replace: true })}><ChevronLeft size={16} /></button>
            <span>{nombreMes(mes)}</span>
            <button type="button" aria-label="Mes siguiente" disabled={mes >= mesDe(at.hoy)} onClick={() => setParams({ mes: mesVecino(mes, 1) }, { replace: true })}><ChevronRight size={16} /></button>
          </div>
          <button type="button" className="dc-btn dc-btn-sm" onClick={exportar}><Download size={13} /> CSV</button>
          <button type="button" className="dc-btn dc-btn-sm" onClick={() => { setErrorPdf(null); setPidiendo(true) }} disabled={armando}>{armando ? <Loader2 size={13} className="at-gira" /> : <FileText size={13} />} Descargar PDF</button>
        </div>
      </section>

      <div className="at-pv-cifras">
        {cifras.map(([t, v, s, tono]) => (
          <div key={t}><span>{t}</span><b className={tono}>{v}</b>{s && <small>{s}</small>}</div>
        ))}
      </div>

      {/* El calendario a todo el ancho, en los colores llenos del Mes, con la entrada y la salida. */}
      <section className="at-card at-pv-card at-mes">
        <div className="at-pv-cal">
          {[1, 2, 3, 4, 5, 6, 7].map(d => <div key={d} className="at-pv-dow">{DIAS_CORTOS[d]}</div>)}
          {huecos.map((_, i) => <div key={`h${i}`} />)}
          {dias.map(({ d, j }) => {
            const n = aFecha(d).getDate()
            if (!j) return <div key={d} className="at-pv-c t-futuro"><b>{n}</b></div>
            const tono = TONO[j.estado] || 'libre'
            const texto = j.entrada != null
              ? <small>{hhmm(j.entrada)}<br />{j.salida != null ? hhmm(j.salida) : '…'}</small>
              : j.estado === 'libre' ? null : <small>{j.estado === 'justificada' ? motivoJustificado(j).replace(/^(De|Con) /, '').replace(/^./, c => c.toUpperCase()) : ESTADOS[j.estado].label}</small>
            return (
              <button key={d} type="button" className={`at-pv-c t-${tono}${d === at.hoy ? ' hoy' : ''}`} onClick={() => setDetalle(d)}
                title={`${ESTADOS[j.estado].label}${j.llegoTarde ? ` · ${duracion(j.tardanza)} tarde` : ''}`}>
                <b>{n}</b>{texto}
              </button>
            )
          })}
        </div>
        <div className="at-pv-pie">
          <div className="at-mes-leyenda" style={{ padding: 0 }}>
            {LEYENDA.map(([k, t]) => <span key={k}><i className={`at-mes-c t-${k}`} />{t}</span>)}
          </div>
          <span className="dc-muted">Horas extra: <b>{duracion(extraTrabajada)}</b> de {duracion(extraAutorizada)} autorizadas · Fuera de horario, sin autorización: <b>{duracion(fueraHorario)}</b></span>
        </div>
      </section>

      {detalle && <DetalleJornada persona={p} fecha={detalle} onCerrar={() => setDetalle(null)} />}
      {pidiendo && (
        <Modal titulo={`Reporte de ${nombreMes(mes)} en PDF`} Icono={FileText} onCerrar={() => setPidiendo(false)} ancho={480}
          pie={<>
            <button type="button" className="dc-btn" onClick={() => setPidiendo(false)}>Cancelar</button>
            <button type="button" className="pl-btn-new" onClick={() => { setPidiendo(false); setArmando(true) }}><Download size={14} /> Descargar PDF</button>
          </>}>
          <p className="at-ayuda" style={{ marginTop: 0 }}>Dos páginas: el resumen del mes con su calendario y el detalle de cada día, con lugar para las firmas de RR.HH. y de {p.name.split(' ')[0]}.</p>
          <label className="at-pdf-op">
            <input type="checkbox" checked={conMarcas} onChange={e => setConMarcas(e.target.checked)} />
            <span><b>Incluir las marcaciones al segundo</b><small>Suma hojas en horizontal con la entrada, el descanso y la salida al segundo, y cómo marcó. Para una auditoría o una inspección del trabajo.</small></span>
          </label>
          {errorPdf && <p className="at-ayuda" style={{ color: 'var(--dc-rojo, #B42318)' }}>No se pudo armar el PDF. Probá de nuevo.</p>}
        </Modal>
      )}
      {armando && (
        <ReportePDF p={p} mes={mes} dias={dias} conMarcas={conMarcas} empresa={empresa}
          lugar={p.lugar ? `${p.lugar.nombre}${p.lugar.tipo === 'centro' ? ` · ${at.lugarPorId.get(p.lugar.sucursalId)?.nombre || ''}` : ''}${p.asig ? ` · ${MODALIDADES[p.asig.modalidad].label}` : ''}` : ''}
          generado={`${fechaLarga(at.hoy).toLowerCase()}, ${hhmm(minutosAhora())}`}
          cifras={[
            { t: 'Días trabajados', v: conJornada ? `${trabajados} de ${conJornada}` : '—' },
            { t: 'Retrasos', v: tardes.length || '—', s: tardes.length ? (tardes.length === 1 ? 'vez' : 'veces') : '', tono: tardes.length ? 'tarde' : '' },
            { t: 'Tiempo de retraso', v: tardes.length ? duracion(tardanza) : '—', s: tardes.length ? (tardanzaInj <= 0 ? 'justificado' : tardanzaInj >= tardanza ? 'sin justificar' : `${duracion(tardanza - tardanzaInj)} justificados`) : '', tono: tardes.length ? 'tarde' : '' },
            { t: 'Faltas', v: faltas || (justificadas ? 0 : '—'), s: justificadas ? `+ ${justificadas} con permiso` : faltas ? 'sin justificar' : '', tono: faltas ? 'falta' : '' },
            { t: 'Horas del mes', v: programado ? duracion(trabajado, { corto: true }) : '—', s: programado ? `de ${duracion(programado, { corto: true })} · ${saldo >= 0 ? 'completas' : `faltan ${duracion(-saldo, { corto: true })}`}` : '' },
            { t: 'Puntualidad', v: puntualidad == null ? '—' : `${puntualidad} %`, s: `tolerancia de ${p.politica?.tolerancia ?? 10} min`, tono: puntualidad != null && puntualidad >= 90 ? 'bien' : puntualidad != null ? 'tarde' : '' },
          ]}
          pie={<><b>Horas extra:</b> {duracion(extraTrabajada)} de {duracion(extraAutorizada)} autorizadas · <b>Fuera de horario, sin autorización:</b> {duracion(fueraHorario)}</>}
          onListo={e => { setArmando(false); if (e) { setErrorPdf(e); setPidiendo(true) } }} />
      )}
    </div>
  )
}
