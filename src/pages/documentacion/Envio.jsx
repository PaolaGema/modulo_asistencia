import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Ban, Check, Download, Pencil, Send, Upload } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera, EstadoEmitidoChip, Modal, PersonaCelda, SensibilidadChip, Vacio } from '../../components/documentacion/comunes'
import HojaEmitido from '../../components/documentacion/HojaEmitido'
import { descargarTexto, descargarParaImprimir } from '../../components/documentacion/utilidades'
import { guardarArchivo, nuevaClaveArchivo } from '../../utils/archivosLocales'
import { extensionDe } from '../../components/documentacion/deducir'
import { crearZip, descargarBlob, nombreSeguro } from '../../components/documentacion/zip'
import { avanceLote, fechaCorta, iso, hoy, nombreEmitido } from '../../data/documentacionData'
import { textoEmitido } from './emisionUtil'
import { useAviso } from './Envios'
import './seguimiento.css'

/* ── UN ENVÍO (Documentación v3) ──────────────────────────────────────────
   Lo emitido, abierto. Desde el 16 oct 2026 no se envía: se descarga para imprimir y firmar, y se
   sube el firmado. Si fue a un grupo: a quiénes les llegó, con «descargar todos». Si fue a una
   persona: el documento tal como le llegó y lo que se puede hacer con él —descargar, anular—.
   Ya no se pide confirmar la recepción (16 oct 2026): no hay «confirmó» ni «recordar». Anular no borra (RN-14): el número queda
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
  const { emitidos, modelos, personas, renombrarLote, registrarDescarga } = useDocumentacion()
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [bajando, setBajando] = useState(false)
  const [aviso, setAviso] = useAviso()
  const a = avanceLote(lote, emitidos)
  const personaDe = e => personas.find(p => p.id === e.colaboradorId)
  const anulados = emitidos.filter(e => e.loteId === lote.id && e.estado === 'anulado')
  const doc = nombreEmitido(a.emitidos[0] || {}, modelos)

  async function descargarTodos() {
    setBajando(true)
    try {
      const blob = await crearZip(a.emitidos.map(e => ({ nombre: `${nombreSeguro(e.numero.replace(/\//g, '-'))} ${nombreSeguro(personaDe(e)?.name || '')}.txt`, datos: textoEmitido(e, modelos) || nombreEmitido(e, modelos) })))
      descargarBlob(`${nombreSeguro(lote.nombre)}_${iso(hoy())}.zip`, blob)
      registrarDescarga('emitido', null, null, `Descargó el envío «${lote.nombre}» (${a.emitidos.length} documentos)`)
      setAviso(`Se descargaron los ${a.emitidos.length} documentos del envío.`)
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
        <div className="xl-cab-dato"><span className="xl-cab-rot">Con el firmado subido</span><Avance n={a.emitidos.filter(e => e.firmado).length} total={a.total} tono="verde" /></div>
        <div className="xl-acciones">
          <button type="button" className="dc-btn" disabled={bajando || !a.emitidos.length} onClick={descargarTodos}><Download size={14} aria-hidden="true" /> {bajando ? 'Preparando…' : 'Descargar todos'}</button>
        </div>
      </div>

      <div className="as-table-wrap xb-tabla-wrap">
        <table className="as-table xb-tabla">
          <thead><tr><th>Colaborador</th><th>Número</th><th>Firmado</th></tr></thead>
          <tbody>
            {[...a.emitidos, ...anulados].map(e => {
              const ir = () => navigate(`/documentos/emitidos/${e.id}`)
              return (
                <tr key={e.id} className="xb-fila-link" tabIndex={0} onClick={ir} onKeyDown={ev => { if (ev.key === 'Enter') ir() }}>
                  <td><PersonaCelda persona={personaDe(e)} size={28} /></td>
                  <td className="xb-num" style={e.estado === 'anulado' ? { textDecoration: 'line-through' } : undefined}>{e.numero}</td>
                  <td className="xb-cuando">
                    {e.estado === 'anulado' || e.estado === 'pendiente' ? <EstadoEmitidoChip estado={e.estado} />
                      : e.firmado ? <span>{fechaCorta(e.firmado.fecha)}</span>
                        : <EstadoEmitidoChip estado="generado" />}
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
  const { personas, modelos, lotesEmision, anular, adjuntarFirmado, registrarDescarga } = useDocumentacion()
  const input = useRef(null)
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
        {!anulado && !e.firmado && e.texto && <button type="button" className="pl-btn-new" onClick={() => { descargarParaImprimir(`${e.numero.replace(/\//g, '-')}_${persona?.codigo || ''}_para-firmar`, e.texto); registrarDescarga('emitido', e.id, e.colaboradorId, `Descargó ${e.numero} para imprimir y firmar`) }}><Download size={14} aria-hidden="true" /> Descargar para imprimir</button>}
        {!anulado && <button type="button" className={e.firmado ? 'dc-btn' : 'pl-btn-new'} onClick={() => input.current?.click()}><Upload size={14} aria-hidden="true" /> {e.firmado ? 'Reemplazar el firmado' : 'Subir el firmado'}</button>}
        <input ref={input} type="file" hidden accept="application/pdf,image/*" onChange={async ev => {
          const f = ev.target.files?.[0]; ev.target.value = ''
          if (!f) return
          const clave = nuevaClaveArchivo()
          const ok = await guardarArchivo(clave, f).catch(() => false)
          adjuntarFirmado(e.id, { nombre: f.name, clave: ok === false ? null : clave, formato: extensionDe(f.name), tipoMime: f.type, tamanoKB: Math.round(f.size / 1024) })
          setAviso('Se guardó el firmado.')
        }} />
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
            : e.firmado ? `Firmado: lo subió ${e.firmado.por} el ${fechaCorta(e.firmado.fecha)}. Está en su expediente.`
              : e.estado === 'generado' ? 'Está en su expediente, sin firmar. Descárguelo, imprímalo, hágalo firmar y suba el firmado.'
                : e.entregas.length ? `Le llegó por la app el ${fechaCorta(e.entregas.at(-1).fecha)}.` : 'Está en su expediente.'}
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
