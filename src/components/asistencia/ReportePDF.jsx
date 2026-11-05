import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import logoSouly from '../../assets/imagenes/logo_souly_oscuro.png'
import { motivoJustificado } from './estadoDia'
import { DIAS_CORTOS, diaISO, aFecha, hhmm, hhmmss, duracion, nombreMes } from '../../data/asistenciaData'

/* ── EL REPORTE DEL MES DE UNA PERSONA, EN PDF (F1) ──────────────────────────
   Página 1: lo mismo que la pantalla —las seis cifras y el calendario en colores— para que se lea
   igual en papel. Página 2: cada día con su observación y las firmas de RR.HH. y de la persona, para
   el expediente. Si se pide, se suman en horizontal las marcaciones al segundo (para auditoría).

   Las hojas se dibujan fuera de la pantalla en HTML, se fotografían una por una y se arma el PDF.
   Van en tamaño A4 a 96 ppp (794 × 1123), así un píxel de acá es un píxel del papel. */

const A4 = { w: 794, h: 1123 }
const TONO = { presente: 'ok', termino: 'ok', trabajando: 'ok', pausa: 'ok', porLlegar: 'fu', tarde: 'ta', anticipada: 'ta', ausente: 'fa', sinMarcar: 'fa', justificada: 'ju', extra: 'ex', incompleta: 'in', libre: 'li' }
const ROTULO = { ok: 'A tiempo', ta: 'Tarde o salió antes', fa: 'Faltó', ju: 'Vacaciones o permiso', ex: 'Horas extra', in: 'Salida sin marcar' }
const FILAS_HORIZONTAL = 15

/* Lo que se anota de cada día, en palabras. */
function observacion(j) {
  const t = []
  if (j.estado === 'ausente') t.push('Faltó · sin justificar')
  if (j.estado === 'justificada') t.push(motivoJustificado(j))
  if (j.estado === 'incompleta') t.push('No marcó su salida')
  for (const a of j.alertas || []) {
    const just = a.justificacion ? ' · justificado' : ''
    if (a.tipo === 'tarde') t.push(`Llegó ${duracion(a.min)} tarde${just}`)
    else if (a.tipo === 'anticipada') t.push(`Salió ${duracion(a.min)} antes${just}`)
    else if (a.tipo === 'pausaExceso') t.push(`Excedió su descanso ${duracion(a.min)}${just}`)
    else if (a.tipo === 'pausaAnticipada') t.push(`Salió antes al descanso${just}`)
    else if (a.tipo === 'pausaRetorno') t.push(`Volvió tarde del descanso${just}`)
    else if (a.tipo === 'sinPausa') t.push('No marcó su descanso')
  }
  if (j.extra > 0) t.push(`Horas extra ${duracion(j.extra)}`)
  if (j.fueraDeHorario > 0) t.push(`Fuera de horario ${duracion(j.fueraDeHorario)}`)
  return t.join(' · ')
}

function comoMarco(m) {
  if (!m) return '—'
  /* Una marca cargada por RR.HH. (una corrección aprobada) dice quién la cargó y por qué: la auditoría tiene
     que mostrar también cuando alguien se aprobó su propia corrección («la aprobó la misma persona»). */
  if (m.origen === 'panel') return [`Cargada por ${m.por || 'RR.HH.'}`, m.motivo].filter(Boolean).join(' · ')
  const t = []
  t.push(m.score != null ? `Rostro ${Math.round(m.score * 100)} %` : 'Sin rostro')
  if (m.remoto) t.push('remoto')
  else if (m.distancia != null) t.push(`a ${m.distancia} m`)
  if (m.ajuste) t.push(`corregida (era ${hhmmss(m.original)})`)
  return t.join(' · ')
}

function Cabecera({ empresa, titulo, mes }) {
  return (
    <div className="rp-cab">
      <img src={logoSouly} alt="SoulyHR" className="rp-logo" />
      <div className="rp-emp"><b>{empresa?.razonSocial || empresa?.nombre || 'Empresa'}</b><small>{titulo}</small></div>
      <div className="rp-per"><span>Período</span><b>{nombreMes(mes)}</b></div>
    </div>
  )
}

function Pie({ generado, n, total }) {
  return <div className="rp-pie"><span>Generado el {generado} · SoulyHR · Asistencia</span><span>Página {n} de {total}</span></div>
}

function Persona({ p, lugar }) {
  const hr = p.horario
  return (
    <div className="rp-pers">
      <span className="rp-av" style={{ background: p.color }}>{p.initials}</span>
      <div>
        <b>{p.name}</b>
        <small>{[p.cargo, p.unidad, p.codigo && `Código ${p.codigo}`].filter(Boolean).join(' · ')}</small>
        <small>{[lugar, hr && `${hr.nombre} ${hr.modo === 'fijo' ? `${hr.entrada}–${hr.salida}` : `meta ${duracion(hr.meta)}`}`].filter(Boolean).join(' · ')}</small>
      </div>
    </div>
  )
}

function Firmas({ nombre }) {
  return <div className="rp-firmas"><div><i /><span>Recursos Humanos</span></div><div><i /><span>{nombre}</span></div></div>
}

export default function ReportePDF({ p, mes, dias, cifras, pie, lugar, empresa, generado, conMarcas, onListo }) {
  const ref = useRef(null)
  const listo = useRef(false)

  const conDatos = dias.filter(x => x.j && x.j.estado !== 'libre')
  const lotes = []
  if (conMarcas) for (let i = 0; i < conDatos.length; i += FILAS_HORIZONTAL) lotes.push(conDatos.slice(i, i + FILAS_HORIZONTAL))
  const total = 2 + lotes.length
  const huecos = diaISO(`${mes}-01`) - 1

  useEffect(() => {
    if (listo.current) return
    listo.current = true
    const armar = async () => {
      try {
        await document.fonts?.ready
        const hojas = [...ref.current.querySelectorAll('.rp-hoja')]
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
        for (let i = 0; i < hojas.length; i++) {
          const h = hojas[i]
          const horizontal = h.classList.contains('h')
          const png = await toPng(h, { pixelRatio: 2, backgroundColor: '#ffffff', cacheBust: true })
          if (i > 0) pdf.addPage('a4', horizontal ? 'landscape' : 'portrait')
          pdf.addImage(png, 'PNG', 0, 0, horizontal ? 297 : 210, horizontal ? 210 : 297, undefined, 'FAST')
        }
        pdf.save(`reporte_asistencia_${p.name.replace(/\s+/g, '_')}_${mes}.pdf`)
        onListo(null)
      } catch (e) {
        onListo(e)
      }
    }
    armar()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return createPortal(
    <div ref={ref} className="rp-escena" aria-hidden="true">
      {/* 1 · El mes */}
      <div className="rp-hoja" style={{ width: A4.w, height: A4.h }}>
        <Cabecera empresa={empresa} titulo="Reporte de asistencia" mes={mes} />
        <Persona p={p} lugar={lugar} />
        <div className="rp-cif">
          {cifras.map(c => <div key={c.t}><span>{c.t}</span><b className={c.tono}>{c.v}</b>{c.s && <small>{c.s}</small>}</div>)}
        </div>
        <div className="rp-sec">Su mes</div>
        <div className="rp-cal">
          {[1, 2, 3, 4, 5, 6, 7].map(d => <i key={d}>{DIAS_CORTOS[d]}</i>)}
          {Array.from({ length: huecos }).map((_, i) => <span key={`h${i}`} className="va" />)}
          {dias.map(({ d, j }) => {
            const n = aFecha(d).getDate()
            const tono = j ? TONO[j.estado] || 'li' : 'fu'
            const texto = j && j.entrada != null
              ? <small>{hhmm(j.entrada)}<br />{j.salida != null ? hhmm(j.salida) : '…'}</small>
              : j && j.estado === 'justificada' ? <small>{motivoJustificado(j).replace(/^(De|Con) /, '').replace(/^./, c => c.toUpperCase())}</small>
                : j && tono === 'fa' ? <small>Faltó</small> : null
            return <span key={d} className={tono}><b>{n}</b>{texto}</span>
          })}
        </div>
        <div className="rp-ley">
          {Object.entries(ROTULO).map(([k, t]) => <span key={k}><i className={k} />{t}</span>)}
        </div>
        <div className="rp-nota">{pie}</div>
        <Pie generado={generado} n={1} total={total} />
      </div>

      {/* 2 · Día por día, con las firmas */}
      <div className="rp-hoja" style={{ width: A4.w, height: A4.h }}>
        <Cabecera empresa={empresa} titulo={`Reporte de asistencia · día por día · ${p.name}`} mes={mes} />
        <table className="rp-tab">
          <thead><tr><th>Día</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Estado</th><th>Observación</th></tr></thead>
          <tbody>
            {conDatos.map(({ d, j }) => {
              const tono = TONO[j.estado] || 'li'
              return (
                <tr key={d}>
                  <td>{DIAS_CORTOS[diaISO(d)]} {aFecha(d).getDate()}</td>
                  <td>{hhmm(j.entrada)}</td>
                  <td>{hhmm(j.salida)}</td>
                  <td>{j.trabajado ? duracion(j.trabajado, { corto: true }) : '—'}</td>
                  <td><span className={`rp-pl ${tono}`}>{ROTULO[tono] || '—'}</span></td>
                  <td>{observacion(j)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!conDatos.length && <p className="rp-nota">No hay jornadas en este mes.</p>}
        <Firmas nombre={p.name} />
        <Pie generado={generado} n={2} total={total} />
      </div>

      {/* 3… · Las marcaciones al segundo, en horizontal */}
      {lotes.map((lote, i) => (
        <div key={i} className="rp-hoja h" style={{ width: A4.h, height: A4.w }}>
          <Cabecera empresa={empresa} titulo={`Registro de asistencia · marcaciones al segundo · ${p.name}`} mes={mes} />
          <table className="rp-tab x">
            <thead><tr><th>Día</th><th>Horario</th><th>Entrada</th><th>Inicio descanso</th><th>Fin descanso</th><th>Salida</th><th>Trabajado</th><th>Tardanza</th><th>Cómo marcó la entrada</th><th>Estado</th></tr></thead>
            <tbody>
              {lote.map(({ d, j }) => {
                const val = (j.marcas || []).filter(m => !m.rechazada && !m.anulada)
                const m = t => val.find(x => x.tipo === t)
                const tono = TONO[j.estado] || 'li'
                const hr = p.horario
                return (
                  <tr key={d}>
                    <td>{DIAS_CORTOS[diaISO(d)]} {aFecha(d).getDate()}</td>
                    <td>{hr ? (hr.modo === 'fijo' ? `${hr.entrada}–${hr.salida}` : `meta ${duracion(hr.meta)}`) : '—'}</td>
                    <td>{hhmmss(j.entrada)}</td>
                    <td>{hhmmss(m('pausa_inicio')?.min)}</td>
                    <td>{hhmmss(m('pausa_fin')?.min)}</td>
                    <td>{hhmmss(j.salida)}</td>
                    <td>{j.trabajado ? duracion(j.trabajado, { seg: true }) : '—'}</td>
                    <td>{j.tardanza ? duracion(j.tardanza, { seg: true }) : '—'}</td>
                    <td>{comoMarco(m('entrada'))}</td>
                    <td><span className={`rp-pl ${tono}`}>{ROTULO[tono] || '—'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="rp-nota">Las horas van al segundo, con la hora del servidor. Una marcación corregida muestra la hora que tenía antes.</div>
          <Pie generado={generado} n={3 + i} total={total} />
        </div>
      ))}
    </div>,
    document.body,
  )
}

