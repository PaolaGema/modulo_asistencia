import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Ban, BellRing, Check, CircleCheck, Download, Pencil, Send } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera, EstadoEmitidoChip, Etiqueta, Modal, PersonaCelda, SensibilidadChip, Vacio } from '../../components/documentacion/comunes'
import HojaEmitido from '../../components/documentacion/HojaEmitido'
import { descargarTexto } from '../../components/documentacion/utilidades'
import { crearZip, descargarBlob, nombreSeguro } from '../../components/documentacion/zip'
import { avanceLote, esperaAcuse, fechaCorta, iso, hoy, nombreEmitido } from '../../data/documentacionData'
import { textoEmitido } from './emisionUtil'
import { useAviso } from './Envios'
import './seguimiento.css'

/* ── UN ENVÍO (Documentación v3) ──────────────────────────────────────────
   Lo enviado, abierto. Si fue a un grupo: a quiénes, quién confirmó y quién no, con «recordar» y
   «descargar todos». Si fue a una persona: el documento tal como le llegó, su confirmación y lo que
   se puede hacer con él —recordar, descargar, anular—. Anular no borra (RN-14): el número queda
   tachado con su motivo, y la persona deja de verlo como vigente. */
export default function Envio() {
  const { id } = useParams()
  const { lotesEmision, emitidos } = useDocumentacion()
  const lote = lotesEmision.find(l => l.id === id)
  const emitido = !lote && emitidos.find(e => e.id === id)
  const navigate = useNavigate()
  if (lote) return <EnvioGrupo lote={lote} />
  if (emitido) return <EnvioUno e={emitido} />
  return (
    <div className="content-scroll">
      <Volver />
      <div className="dc-tarjeta"><Vacio Icono={Send} titulo="No encontramos este envío" texto="Puede que el enlace sea de otra demo.">
        <button type="button" className="dc-btn" onClick={() => navigate('/documentos/emitidos')}>Ir a Documentos emitidos</button>
      </Vacio></div>
    </div>
  )
}

function Volver({ a = '/documentos/emitidos', texto = 'Documentos emitidos' }) {
  const navigate = useNavigate()
  return (
    <button type="button" className="dc-btn dc-btn-texto" style={{ marginBottom: 6 }} onClick={() => navigate(a)}>
      <ArrowLeft size={15} aria-hidden="true" /> {texto}
    </button>
  )
}

function Avance({ n, total, tono }) {
  const pct = total ? Math.round((n / total) * 100) : 0
  return (
    <span className="dc-avance" title={`${n} de ${total}`}>
      <span className="dc-avance-barra" style={{ width: 120 }} aria-hidden="true"><span className={`dc-avance-lleno dc-bg-${tono}`} style={{ width: `${pct}%` }} /></span>
      <b>{n} de {total}</b>
    </span>
  )
}

/* ── A UN GRUPO ── */
function EnvioGrupo({ lote }) {
  const navigate = useNavigate()
  const { emitidos, modelos, personas, recordarAcuse, renombrarLote, registrarDescarga } = useDocumentacion()
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [bajando, setBajando] = useState(false)
  const [aviso, setAviso] = useAviso()
  const a = avanceLote(lote, emitidos)
  const personaDe = e => personas.find(p => p.id === e.colaboradorId)
  const sinConfirmar = a.emitidos.filter(esperaAcuse)
  const anulados = emitidos.filter(e => e.loteId === lote.id && e.estado === 'anulado')
  const doc = nombreEmitido(a.emitidos[0] || {}, modelos)

  const recordar = () => {
    const n = recordarAcuse(sinConfirmar.map(e => e.id))
    setAviso(`Se registró el recordatorio a ${n} ${n === 1 ? 'persona' : 'personas'}. En producción saldría por la app y por correo.`)
  }
  async function descargarTodos() {
    setBajando(true)
    try {
      const blob = await crearZip(a.emitidos.map(e => ({ nombre: `${nombreSeguro(e.numero.replace(/\//g, '-'))} ${nombreSeguro(personaDe(e)?.name || '')}.txt`, datos: textoEmitido(e, modelos) || nombreEmitido(e, modelos) })))
      descargarBlob(`${nombreSeguro(lote.nombre)}_${iso(hoy())}.zip`, blob)
      registrarDescarga('emitido', null, null, `Descargó el envío «${lote.nombre}» (${a.emitidos.length} documentos)`)
    } finally { setBajando(false) }
  }
  const guardar = () => { renombrarLote(lote.id, nombre); setEditando(false) }

  return (
    <div className="content-scroll">
      <Volver />
      {editando ? (
        <div className="xl-nombre" style={{ margin: '4px 0 18px' }}>
          <input aria-label="Nombre del envío" value={nombre} autoFocus onChange={ev => setNombre(ev.target.value)} onKeyDown={ev => { if (ev.key === 'Enter') guardar(); if (ev.key === 'Escape') setEditando(false) }} />
          <button type="button" className="pl-btn-new" onClick={guardar}><Check size={14} aria-hidden="true" /> Guardar</button>
          <button type="button" className="dc-btn dc-btn-texto" onClick={() => setEditando(false)}>Cancelar</button>
        </div>
      ) : (
        <Cabecera titulo={lote.nombre} sub={`${doc} · enviado el ${fechaCorta(lote.fecha)} por ${lote.por} a ${a.total} ${a.total === 1 ? 'persona' : 'personas'}`}>
          <button type="button" className="dc-btn dc-btn-texto" onClick={() => { setNombre(lote.nombre); setEditando(true) }}><Pencil size={14} aria-hidden="true" /> Cambiar el nombre</button>
        </Cabecera>
      )}

      <div className="dc-tarjeta xl-cab" style={{ margin: '0 0 16px' }}>
        {a.pideAcuse
          ? <div className="xl-cab-dato"><span className="xl-cab-rot">Confirmaron</span><Avance n={a.confirmados} total={a.total} tono="verde" /></div>
          : <span className="xb-nota">Se envió sin pedir confirmación de recepción.</span>}
        <div className="xl-acciones">
          {sinConfirmar.length > 0 && <button type="button" className="pl-btn-new" onClick={recordar}><BellRing size={14} aria-hidden="true" /> Recordar a {sinConfirmar.length === 1 ? 'quien falta' : `los ${sinConfirmar.length} que faltan`}</button>}
          <button type="button" className="dc-btn" disabled={bajando || !a.emitidos.length} onClick={descargarTodos}><Download size={14} aria-hidden="true" /> {bajando ? 'Preparando…' : 'Descargar todos'}</button>
        </div>
      </div>

      <div className="as-table-wrap xb-tabla-wrap">
        <table className="as-table xb-tabla">
          <thead><tr><th>Colaborador</th><th>Número</th><th>Confirmación</th></tr></thead>
          <tbody>
            {[...a.emitidos, ...anulados].map(e => {
              const ir = () => navigate(`/documentos/emitidos/${e.id}`)
              return (
                <tr key={e.id} className="xb-fila-link" tabIndex={0} onClick={ir} onKeyDown={ev => { if (ev.key === 'Enter') ir() }}>
                  <td><PersonaCelda persona={personaDe(e)} size={28} /></td>
                  <td className="xb-num" style={e.estado === 'anulado' ? { textDecoration: 'line-through' } : undefined}>{e.numero}</td>
                  <td className="xb-cuando">
                    {e.acuse ? <><EstadoEmitidoChip estado="acusado" /><span>{fechaCorta(e.acuse.fecha)} · {e.acuse.dispositivo}</span></>
                      : esperaAcuse(e) ? <><Etiqueta tono="ambar">Sin confirmar</Etiqueta>{e.recordatorios?.length > 0 && <span>Recordado el {fechaCorta(e.recordatorios.at(-1).fecha)}</span>}</>
                        : <EstadoEmitidoChip estado={e.estado} />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {aviso}
    </div>
  )
}

/* ── A UNA PERSONA ── */
function EnvioUno({ e }) {
  const navigate = useNavigate()
  const { personas, modelos, lotesEmision, recordarAcuse, anular, entregar, registrarDescarga } = useDocumentacion()
  const [anulando, setAnulando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [aviso, setAviso] = useAviso()
  const persona = personas.find(p => p.id === e.colaboradorId)
  const m = modelos.find(x => x.id === e.modeloId)
  const lote = e.loteId && lotesEmision.find(l => l.id === e.loteId)
  const nombre = nombreEmitido(e, modelos)
  const anulado = e.estado === 'anulado'

  return (
    <div className="content-scroll">
      {lote ? <Volver a={`/documentos/emitidos/${lote.id}`} texto={lote.nombre} /> : <Volver />}
      <Cabecera titulo={nombre} sub={`${e.numero} · enviado el ${fechaCorta(e.fecha)} por ${e.emitidoPor}`}>
        {esperaAcuse(e) && <button type="button" className="pl-btn-new" onClick={() => { recordarAcuse([e.id]); setAviso('Se registró el recordatorio.') }}><BellRing size={14} aria-hidden="true" /> Recordar</button>}
        {e.estado === 'generado' && <button type="button" className="pl-btn-new" onClick={() => { entregar(e.id, 'app'); setAviso('Enviado por la app.') }}><Send size={14} aria-hidden="true" /> Enviar por la app</button>}
        <button type="button" className="dc-btn" onClick={() => { descargarTexto(`${e.numero.replace(/\//g, '-')}.txt`, textoEmitido(e, modelos) || nombre); registrarDescarga('emitido', e.id, e.colaboradorId, `Descargó ${e.numero}`, !!m?.sensible) }}><Download size={14} aria-hidden="true" /> Descargar</button>
        {!anulado && <button type="button" className="dc-btn dc-btn-peligro" onClick={() => { setAnulando(true); setMotivo('') }}><Ban size={14} aria-hidden="true" /> Anular</button>}
      </Cabecera>

      <div className="dc-tarjeta xl-cab" style={{ margin: '0 0 16px' }}>
        <PersonaCelda persona={persona} onClick={persona ? () => navigate(`/documentos/expedientes/${persona.id}/emitidos`) : undefined} />
        <div className="xb-estado">
          <EstadoEmitidoChip estado={e.estado} />
          {m?.sensible && <SensibilidadChip nivel="confidencial" />}
        </div>
        <p className="xb-nota" style={{ flex: '1 1 280px' }}>
          {e.anulado ? `Anulado el ${fechaCorta(e.anulado.fecha)} por ${e.anulado.por}: ${e.anulado.motivo}`
            : e.acuse ? <><CircleCheck size={12} aria-hidden="true" /> Confirmó la recepción el {fechaCorta(e.acuse.fecha)} · {e.acuse.dispositivo}</>
              : esperaAcuse(e) ? `Le llegó por la app el ${fechaCorta(e.entregas.at(-1)?.fecha)} y todavía no confirmó.${e.recordatorios?.length ? ` Recordado el ${fechaCorta(e.recordatorios.at(-1).fecha)}.` : ''}`
                : e.entregas.length ? `Le llegó por la app el ${fechaCorta(e.entregas.at(-1).fecha)}.` : 'Todavía no se le envió.'}
        </p>
      </div>

      <HojaEmitido emitido={e} />

      {anulando && (
        <Modal titulo={`Anular ${e.numero}`} Icono={Ban} onCerrar={() => setAnulando(false)} ancho={480}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setAnulando(false)}>Cancelar</button>
            <button type="button" className="pl-btn-save xb-btn-rechazo" disabled={motivo.trim().length < 5} onClick={() => { anular(e.id, motivo.trim()); setAnulando(false); setAviso(`${e.numero} quedó anulado.`) }}>Anular</button>
          </>}
        >
          <p className="xb-p">Un documento enviado no se edita: se anula y, si hace falta, se envía uno nuevo. El número <b>{e.numero}</b> no se vuelve a usar.</p>
          <label className="pl-label xb-motivo-campo">
            Motivo <span className="pl-req" aria-hidden="true">*</span>
            <textarea className="pl-input" rows={3} value={motivo} onChange={ev => setMotivo(ev.target.value)} placeholder="El cargo del certificado no era el actual." autoFocus />
          </label>
        </Modal>
      )}
      {aviso}
    </div>
  )
}
