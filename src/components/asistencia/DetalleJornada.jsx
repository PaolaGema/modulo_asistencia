import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Pencil, Plus, ShieldCheck, Ban, Lock, Check, X, ArrowUpRight, Smartphone, MonitorCog, BellRing, MessageSquareQuote, Coffee } from 'lucide-react'
import { Modal, MenuAcciones } from '../documentacion/comunes'
import Desplegable from '../layout/Desplegable'
import { useAsistencia } from '../../context/AsistenciaContext'
import { TIPOS_MARCA, TIPOS_JUSTIFICACION, ESTADOS_EXTRA, ORIGENES_EXTRA, ALERTAS, esAutorizada, fechaLarga, hhmm, hhmmss, aMin, duracion, mesDe, minutosAhora } from '../../data/asistenciaData'
import { EstadoChip, PersonaAt, Selfie, Verificacion, BarraDia, Radar } from './comunes'

/* ── EL DETALLE DE UN DÍA ──────────────────────────────────────────────────
   Se abre desde cualquier pantalla del módulo: la fila del libro, una celda del calendario, una
   incidencia. Muestra cada marcación con su evidencia —selfie, rostro, geocerca— y deja corregir.

   CORREGIR NO BORRA. Un ajuste guarda la hora original tachada al lado de la nueva, quién lo hizo y
   por qué; anular deja la marca a la vista, gris. Es el «registro inalterable» que piden las
   direcciones del trabajo (y Talana cumple): lo que se corrige se ve corregido. Y TODO PIDE MOTIVO,
   también la marcación manual —riesgo R7 de la arquitectura—. */

/* `incidencia` (opcional): cuando se abre desde Incidencias, arriba se dice qué se vino a revisar y
   se ofrece la salida que NO cambia el día —«dejar como falta», «no es extra», «ya la revisé»—. Las
   que sí lo cambian (justificar, cargar la salida, autorizar) están más abajo, con su motivo. */
export default function DetalleJornada({ persona, fecha, onCerrar, incidencia }) {
  const at = useAsistencia()
  const navigate = useNavigate()
  const j = at.jornadaDe(persona, fecha)
  const cerrado = !!at.cierres[mesDe(fecha)]
  const esHoy = fecha === at.hoy
  const [form, setForm] = useState(null) // { modo: 'ajustar'|'anular'|'agregar'|'justificar', marca? }
  const geo = persona.lugar?.geo

  return (
    <Modal titulo="Detalle de la jornada" Icono={CalendarDays} onCerrar={onCerrar} ancho={720}>
      <div className="at-det">
        <div className="at-det-cab">
          <PersonaAt persona={persona} size={44} sub={`${persona.cargo} · ${persona.unidad}`} />
          <div className="at-det-fecha">
            <span>{fechaLarga(fecha)}{esHoy && ' · hoy'}</span>
            <EstadoChip estado={j.estado} />
          </div>
        </div>

        {cerrado && (
          <div className="at-aviso-linea"><Lock size={14} aria-hidden="true" /> El mes está cerrado para nómina: se puede mirar, pero no corregir.</div>
        )}

        {incidencia && (
          <div className="at-incidencia-aviso">
            <div>
              <b>{incidencia.titulo}</b>
              <span>{incidencia.texto}</span>
            </div>
            {incidencia.accion && !cerrado && (
              <button type="button" className="dc-btn dc-btn-sm" onClick={() => { incidencia.onAccion(); onCerrar() }}>{incidencia.accion}</button>
            )}
          </div>
        )}

        <div className="at-det-cifras">
          <div><span>Entrada</span><b className={j.llegoTarde ? 'tarde' : ''}>{hhmmss(j.entrada)}</b></div>
          <div><span>Salida</span><b>{hhmmss(j.salida)}</b></div>
          <div><span>Trabajado</span><b>{duracion(j.trabajado, { corto: true, seg: true })}</b></div>
          <div><span>Programado</span><b>{persona.horario?.modo === 'flexible' ? `Meta ${duracion(persona.horario.meta)}` : duracion(j.programado)}</b></div>
          <div><span>{j.tardanza ? 'Tardanza' : 'Extra aprobada'}</span><b className={j.tardanza ? 'tarde' : j.extra ? 'extra' : ''}>{j.tardanza ? duracion(j.tardanza, { seg: true }) : duracion(j.extra)}</b></div>
        </div>

        <BarraDia jornada={j} horario={persona.horario} ahora={esHoy ? minutosAhora() : null} grande />

        {j.franja && (
          <p className="at-det-franja"><Coffee size={13} aria-hidden="true" /> Descanso de {hhmm(j.franja.desde)} a {hhmm(j.franja.hasta)}{j.pausas > 0 ? ` · tomó ${duracion(j.pausas, { seg: true })}` : ''}{j.descontado > 0 ? ` · se descontaron ${duracion(j.descontado)} por no marcarlo` : ''}</p>
        )}

        {/* LAS ALERTAS DEL DÍA (#5, #6, #7, #13, #15): qué pasó, si se le avisó y qué respondió. */}
        {j.alertas.length > 0 && <Alertas j={j} persona={persona} fecha={fecha} />}

        {/* LAS HORAS EXTRA DEL DÍA: solo las autorizadas cuentan. Lo demás es «fuera de horario». */}
        {j.horasExtra.map(x => (
          <div key={x.id} className={`at-extra-dec${esAutorizada(x) ? ' aprobada' : x.estado === 'rechazada' ? ' rechazada' : ''}`}>
            <div>
              <b>Horas extra {x.desde}–{x.hasta} · {ESTADOS_EXTRA[x.estado].label.toLowerCase()}</b>
              <span>{ORIGENES_EXTRA[x.origen]} · {x.motivo}{esAutorizada(x) && fecha <= at.hoy ? ` · trabajó ${duracion(j.extra)} dentro de ellas` : ''}</span>
            </div>
            {!cerrado && x.estado === 'pendiente' && (
              <div className="at-extra-acc">
                <button type="button" className="dc-btn dc-btn-sm" onClick={() => at.responderExtra(x.id, 'rechazada')}><X size={13} /> Rechazar</button>
                <button type="button" className="at-btn-ok" onClick={() => at.responderExtra(x.id, 'aprobada')}><Check size={13} /> Aprobar</button>
              </div>
            )}
          </div>
        ))}
        {j.fueraDeHorario > 0 && (
          <div className="at-extra-dec rechazada">
            <div>
              <b>{duracion(j.fueraDeHorario)} fuera de horario, sin autorización</b>
              <span>Se quedó después de su jornada sin horas extra autorizadas: no cuenta como hora extra.</span>
            </div>
            {!cerrado && j.salida != null && persona.horario?.modo === 'fijo' && (
              <div className="at-extra-acc">
                <button type="button" className="at-btn-ok" onClick={() => at.autorizarDespues({ personaId: persona.id, fecha, desde: persona.horario.salida, hasta: hhmm(j.salida), motivo: 'Autorizada después del día por RR.HH.' })}>
                  <Check size={13} /> Autorizar como horas extra
                </button>
              </div>
            )}
          </div>
        )}

        <ol className="at-tl">
          {j.marcas.length === 0 && (
            <li className="at-tl-vacio">
              {j.justificacion
                ? <><ShieldCheck size={16} aria-hidden="true" /> {j.justificacion.tipo}: {j.justificacion.motivo}</>
                : j.estado === 'libre' ? 'No tenía jornada programada este día.' : esHoy ? 'Todavía no hay marcaciones hoy.' : 'No marcó ese día.'}
            </li>
          )}
          {j.marcas.map(m => (
            <li key={m.id} className={`at-tl-item${m.rechazada ? ' rech' : ''}${m.anulada ? ' anul' : ''}`}>
              <span className="at-tl-hora">
                <b>{hhmmss(m.min)}</b>
                {m.ajuste && !m.anulada && <s title="Hora original">{hhmmss(m.original)}</s>}
              </span>
              <span className={`at-tl-nodo t-${m.tipo}`} aria-hidden="true" />
              <div className="at-tl-cuerpo">
                <div className="at-tl-fila">
                  {m.score != null && <Selfie persona={persona} marca={m} size={38} />}
                  <div className="at-tl-txt">
                    <span className="at-tl-tipo">
                      {TIPOS_MARCA[m.tipo].label}
                      {m.rechazada && <span className="at-tl-rech">Rechazada · {m.rechazada === 'rostro' ? 'el rostro no coincidió' : 'fuera de la geocerca'}</span>}
                      {m.anulada && <span className="at-tl-rech">Anulada</span>}
                    </span>
                    <span className="at-tl-sub">
                      {m.origen === 'panel' ? <><MonitorCog size={12} aria-hidden="true" /> Cargada por {m.por}</> : <><Smartphone size={12} aria-hidden="true" /> Desde la app{m.remoto ? ' · remoto' : persona.lugar ? ` · ${persona.lugar.nombre}` : ''}</>}
                    </span>
                    <Verificacion marca={m} />
                    {(m.ajuste || m.motivo) && <span className="at-tl-motivo">«{m.ajuste?.motivo || m.motivo}» — {m.ajuste?.por || m.por}</span>}
                  </div>
                  {m.distancia != null && !m.remoto && geo && <Radar distancia={m.distancia} radio={persona.politica?.radio || geo.radio} dentro={m.dentro} size={64} />}
                  {!cerrado && !m.rechazada && !m.anulada && (
                    <MenuAcciones items={[
                      { label: 'Ajustar la hora', Icono: Pencil, onClick: () => setForm({ modo: 'ajustar', marca: m }) },
                      { label: 'Anular la marcación', Icono: Ban, peligro: true, onClick: () => setForm({ modo: 'anular', marca: m }) },
                    ]} />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {j.justificacion && j.marcas.length > 0 && (
          <div className="at-aviso-linea"><ShieldCheck size={14} aria-hidden="true" /> {j.justificacion.tipo}: {j.justificacion.motivo} — {j.justificacion.por}</div>
        )}

        {form && <FormCorreccion form={form} persona={persona} fecha={fecha} onListo={() => setForm(null)} />}

        <div className="at-det-pie">
          <button type="button" className="dc-btn" onClick={() => { onCerrar(); navigate(`/asistencia/persona/${persona.id}?mes=${mesDe(fecha)}`) }}>
            Ver su mes <ArrowUpRight size={13} aria-hidden="true" />
          </button>
          {!cerrado && !form && (
            <div style={{ display: 'flex', gap: 8 }}>
              {['ausente', 'sinMarcar', 'incompleta', 'tarde'].includes(j.estado) && !j.justificacion && (
                <button type="button" className="dc-btn" onClick={() => setForm({ modo: 'justificar' })}><ShieldCheck size={13} /> Justificar</button>
              )}
              <button type="button" className="pl-btn-new" style={{ fontSize: 13 }} onClick={() => setForm({ modo: 'agregar' })}><Plus size={14} /> Agregar marcación</button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

/* Cada alerta con su estado frente a la persona: avisada y sin respuesta, con motivo por revisar,
   aceptada o no aceptada. RR.HH. no justifica por ella: la justificación la manda la persona y la
   acepta su jefe (Solicitudes › Justificaciones). */
function Alertas({ j, persona, fecha }) {
  const at = useAsistencia()
  const avisar = at.ajustesGenerales.avisar || {}
  const grupo = t => (t.startsWith('pausa') ? 'pausa' : t)
  const pedidos = at.solicitudes.filter(s => s.tipo === 'justificacion' && s.fecha === fecha && String(s.personaId) === String(persona.id) && s.estado !== 'cancelada')
  return (
    <ul className="at-alertas">
      {j.alertas.map(a => {
        const al = ALERTAS[a.tipo]
        const pedido = pedidos.find(s => s.alerta === a.tipo || (grupo(s.alerta) === 'pausa' && grupo(a.tipo) === 'pausa'))
        const estado = a.justificacion
          ? { tono: 'verde', Icono: ShieldCheck, txt: `Justificada · ${a.justificacion.categoria || ''}${a.justificacion.motivo ? ` «${a.justificacion.motivo}»` : ''}` }
          : pedido?.estado === 'pendiente' ? { tono: 'azul', Icono: MessageSquareQuote, txt: `Mandó su motivo: ${pedido.categoria} · por revisar en Justificaciones` }
            : pedido?.estado === 'rechazada' ? { tono: 'gris', Icono: X, txt: `Motivo no aceptado${pedido.nota ? `: «${pedido.nota}»` : ''}` }
              : avisar[grupo(a.tipo)] !== false && fecha <= at.hoy ? { tono: 'ambar', Icono: BellRing, txt: `Se le avisó en la app${fecha < at.hoy ? ' · sin motivo todavía' : ''}` }
                : null
        return (
          <li key={a.tipo} className={`at-alerta t-${al.tono}${a.justificacion ? ' ok' : ''}`}>
            <span className={`dc-chip dc-chip-sm dc-t-${a.justificacion ? 'verde' : al.tono}`}>{al.corto} · {duracion(a.min, { seg: true })}</span>
            <div>
              <b>{al.label}</b>
              <span>{a.detalle}</span>
              {estado && <em className={`t-${estado.tono}`}><estado.Icono size={12} aria-hidden="true" /> {estado.txt}</em>}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function FormCorreccion({ form, persona, fecha, onListo }) {
  const at = useAsistencia()
  const j = at.jornadaDe(persona, fecha)
  const sugerido = form.marca ? hhmmss(form.marca.min) : !j.marcas.some(m => m.tipo === 'salida') && j.entrada != null ? persona.horario?.salida || '18:00' : persona.horario?.entrada || '08:30'
  const [hora, setHora] = useState(sugerido)
  const [tipo, setTipo] = useState(j.entrada == null ? 'entrada' : 'salida')
  const [jtipo, setJtipo] = useState(TIPOS_JUSTIFICACION[0])
  const [motivo, setMotivo] = useState('')
  const listo = motivo.trim().length >= 4

  const titulos = { ajustar: 'Ajustar la hora', anular: 'Anular la marcación', agregar: 'Agregar una marcación', justificar: 'Justificar el día' }
  const guardar = () => {
    if (!listo) return
    if (form.modo === 'ajustar') at.ajustar(form.marca.id, aMin(hora), motivo.trim())
    if (form.modo === 'anular') at.anular(form.marca.id, motivo.trim())
    if (form.modo === 'agregar') at.marcaManual({ personaId: persona.id, fecha, tipo, min: aMin(hora), motivo: motivo.trim() })
    if (form.modo === 'justificar') at.justificar(persona.id, fecha, jtipo, motivo.trim())
    onListo()
  }

  return (
    <div className="at-form">
      <div className="at-form-tit">{titulos[form.modo]}</div>
      <div className="at-form-fila">
        {form.modo === 'agregar' && (
          <label className="at-campo"><span>Tipo</span>
            <Desplegable valor={tipo} onCambio={setTipo} opciones={Object.entries(TIPOS_MARCA).map(([k, v]) => ({ valor: k, etiqueta: v.label }))} ariaLabel="Tipo de marcación" />
          </label>
        )}
        {(form.modo === 'ajustar' || form.modo === 'agregar') && (
          <label className="at-campo at-campo-hora"><span>Hora</span>
            <input type="time" step="1" className="pl-input" value={hora} onChange={e => setHora(e.target.value)} />
          </label>
        )}
        {form.modo === 'justificar' && (
          <label className="at-campo"><span>Motivo de la ausencia</span>
            <Desplegable valor={jtipo} onCambio={setJtipo} opciones={TIPOS_JUSTIFICACION.map(t => ({ valor: t, etiqueta: t }))} ariaLabel="Tipo de justificación" />
          </label>
        )}
        <label className="at-campo at-campo-ancho"><span>¿Por qué? <em>Obligatorio: queda en el registro</em></span>
          <input className="pl-input" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder={form.modo === 'justificar' ? 'Ej.: presentó certificado médico' : 'Ej.: el teléfono se quedó sin batería'} autoFocus />
        </label>
      </div>
      <div className="at-form-acc">
        <button type="button" className="dc-btn" onClick={onListo}>Cancelar</button>
        <button type="button" className={form.modo === 'anular' ? 'at-btn-peligro' : 'at-btn-ok'} disabled={!listo} onClick={guardar}>
          {form.modo === 'anular' ? 'Anular' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
