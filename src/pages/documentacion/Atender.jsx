import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Award, Check, CheckCircle2, Copy, FolderOpen, PenLine, Send, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera, PersonaCelda } from '../../components/documentacion/comunes'
import Desplegable from '../../components/layout/Desplegable'
import {
  MODALIDADES, TIPOS_SOLICITUD, aFecha, datosPara, fechaCorta, hoy, rellenar, responderAntes, versionActual,
} from '../../data/documentacionData'
import { versionPublicada } from './emisionUtil'
import HojaDocumento from './HojaDocumento'
import { Previa } from './Expediente'
import './expediente.css'
import './revisar.css'

/* ── ATENDER UNA SOLICITUD (15 oct 2026) ──────────────────────────────────
   Se llega desde la tabla de Solicitudes tocando un pedido: la tabla es la lista, así que acá no
   se repite. Al centro, el documento que va a recibir la persona, tal como le va a llegar; a la
   derecha, qué pidió, el plazo y la acción. Atender y entregar es un solo paso: al emitir, el
   documento le llega por la app y el pedido queda unido a él.

   CADA PEDIDO SE ATIENDE CON LO QUE PIDE: un certificado se emite, una corrección se vuelve a emitir
   (y el anterior se anula), una copia se elige de su expediente y se envía. Rechazar pide motivo:
   un motivo rápido lo escribe en el campo y se confirma con «Rechazar». Al terminar, el panel lo
   dice y ofrece el siguiente pendiente o volver a la tabla. */

const ICONOS = { certificacion: Award, copia: Copy, correccion: PenLine }
const MOTIVOS = [
  { corto: 'Se entrega en persona', texto: 'Este documento se entrega en persona en RR.HH. Pase a recogerlo en horario de oficina.' },
  { corto: 'Ya se le envió', texto: 'Este documento ya se le envió: lo encuentra en Mis documentos › De RR.HH.' },
  { corto: 'Falta información', texto: 'Necesitamos más detalle para atenderlo. Escríbanos qué necesita exactamente y para qué.' },
  { corto: 'No corresponde', texto: 'Este pedido no corresponde a su situación laboral actual.' },
]

function plazoDe(q) {
  const d = Math.round((aFecha(responderAntes(q.fecha)) - hoy()) / 864e5)
  if (d < 0) return { texto: `Atrasada ${-d} ${d === -1 ? 'día' : 'días'}`, clase: 'rv-rojo' }
  if (d === 0) return { texto: 'Vence hoy', clase: 'rv-rojo' }
  if (d === 1) return { texto: 'Mañana', clase: 'rv-ambar' }
  return { texto: `En ${d} días`, clase: '' }
}

export default function Atender() {
  const { id } = useParams()
  const { personas, solicitudes } = useDocumentacion()
  const navigate = useNavigate()
  const q = solicitudes.find(x => x.id === id) || null
  const persona = q ? personas.find(p => p.id === q.colaboradorId) : null
  // Lo que pasó en esta visita: si se atendió o se rechazó, el panel lo dice y ofrece seguir.
  const [hecho, setHecho] = useState(null)
  const siguiente = solicitudes
    .filter(x => x.estado === 'pendiente' && x.id !== id && TIPOS_SOLICITUD[x.tipo])
    .sort((a, b) => (responderAntes(a.fecha) < responderAntes(b.fecha) ? -1 : 1))[0] || null

  if (!q || !persona) {
    return (
      <div className="content-scroll rv-pagina">
        <Link to="/documentos/solicitudes" className="xc-volver"><ArrowLeft size={13} aria-hidden="true" /> Solicitudes</Link>
        <div className="rv-vacio"><CheckCircle2 size={44} aria-hidden="true" /><h2>Este pedido no existe</h2><p>Puede que el enlace esté incompleto. Los pedidos están en Solicitudes.</p></div>
      </div>
    )
  }
  const yaResuelto = q.estado !== 'pendiente' && !hecho
  return (
    <div className="content-scroll rv-pagina">
      <Link to="/documentos/solicitudes" className="xc-volver"><ArrowLeft size={13} aria-hidden="true" /> Solicitudes</Link>
      <Cabecera titulo={q.asunto} sub={`Pedido de ${persona.name}. Al atenderlo, el documento le llega por la app.`} />
      <div className="rv-bandeja rv-dos">
        <Pedido key={q.id} q={q} persona={persona}
          decision={hecho?.ok === true || (yaResuelto && q.estado === 'atendida') ? 'ok' : hecho?.ok === false || (yaResuelto && q.estado === 'rechazada') ? 'no' : null}
          resultado={hecho?.texto || (yaResuelto ? q.resuelto?.nota : null)}
          siguiente={siguiente} onSiguiente={() => { setHecho(null); navigate(`/documentos/solicitudes/${siguiente.id}`) }}
          onVolver={() => navigate('/documentos/solicitudes')}
          onListo={(ok, texto) => setHecho({ ok, texto })} onExpediente={() => navigate(`/documentos/expedientes/${q.colaboradorId}`)} />
      </div>
    </div>
  )
}

/* Un pedido: el documento al centro y el panel a la derecha. Ocupa dos columnas de la bandeja. */
function Pedido({ q, persona, decision, resultado, siguiente, onSiguiente, onVolver, onListo, onExpediente }) {
  const ctx = useDocumentacion()
  const { modelos, emitidos, contratos, documentos, subtipos, tipos, empresa, emitir, anular, entregar, registrarDescarga, resolverSolicitud } = ctx
  const nombre = persona?.name.split(' ')[0] || ''

  /* Certificado o corrección: el modelo que se emite. La corrección toma el del documento con el error. */
  const anterior = q.tipo === 'correccion'
    ? (q.emitidoId && emitidos.find(e => e.id === q.emitidoId && e.estado !== 'anulado'))
      || emitidos.filter(e => e.colaboradorId === q.colaboradorId && e.estado !== 'anulado' && (!q.modeloId || e.modeloId === q.modeloId)).sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0] || null
    : null
  const certificables = modelos.filter(m => m.estado === 'activo' && m.categoria === 'certificado' && versionPublicada(m))
  const [modeloId, setModeloId] = useState(q.modeloId || anterior?.modeloId || certificables[0]?.id || '')
  const modelo = modelos.find(m => m.id === modeloId)
  const [anularAnterior, setAnularAnterior] = useState(true)

  /* Copia: lo que se le puede enviar es lo suyo —contratos, lo emitido, sus carpetas—. */
  const opciones = useMemo(() => {
    if (q.tipo !== 'copia') return []
    const id = q.colaboradorId
    return [
      ...contratos.filter(c => c.colaboradorId === id).sort((a, b) => ((a.inicio || '') < (b.inicio || '') ? 1 : -1))
        .map(c => ({ clave: `c-${c.id}`, carpeta: 'contratos', contrato: c, nombre: `${c.tipo === 'adenda' ? 'Adenda' : 'Contrato'} ${MODALIDADES[c.modalidad]?.toLowerCase() || ''}`.trim(), sub: c.numero })),
      ...emitidos.filter(e => e.colaboradorId === id && e.estado !== 'anulado').sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
        .map(e => ({ clave: `e-${e.id}`, carpeta: 'emitidos', emitido: e, emitidoId: e.id, nombre: modelos.find(m => m.id === e.modeloId)?.nombre || e.numero, sub: `${e.numero} · ${fechaCorta(e.fecha)}` })),
      ...documentos.filter(d => d.colaboradorId === id && !d.eliminado && versionActual(d)).map(d => {
        const st = subtipos.find(x => x.id === d.subtipoId)
        const v = versionActual(d)
        return { clave: `d-${d.id}`, carpeta: st?.tipoId, doc: d, version: v, subtipo: st, docId: d.id, nombre: d.origen === 'ficha' && v.info ? v.info : st?.nombre || 'Documento', sub: tipos.find(t => t.id === st?.tipoId)?.nombre || '' }
      }),
    ]
  }, [q, contratos, emitidos, documentos, subtipos, tipos, modelos])
  const [copia, setCopia] = useState(() => (opciones.find(o => o.carpeta === q.carpeta) || opciones[0])?.clave || '')
  const elegida = opciones.find(o => o.clave === copia)

  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')

  /* Lo que va a recibir, tal como le llega. */
  const contratoVigente = contratos.find(c => c.colaboradorId === q.colaboradorId && c.tipo === 'contrato' && !c.finalizado && !c.reemplazado)
  const textoNuevo = modelo ? rellenar(versionPublicada(modelo)?.texto || '', datosPara(persona, { empresa, contrato: contratoVigente, numero: '(se numera al emitir)' })) : ''

  const emitirYEnviar = () => {
    const r = emitir({ modeloId, colaboradorId: q.colaboradorId, enviar: true })
    if (q.tipo === 'correccion' && anularAnterior && anterior) anular(anterior.id, `Reemplazado por ${r.numero}: ${q.detalle}`)
    resolverSolicitud(q.id, 'atendida', q.tipo === 'correccion' ? `Se reemitió como ${r.numero}${anularAnterior && anterior ? ` y se anuló ${anterior.numero}` : ''}` : `Se emitió ${r.numero}`, { emitidoId: r.id, ...(anularAnterior && anterior ? { anuladoId: anterior.id } : null) })
    onListo(true, `${r.numero} emitido: a ${nombre} le llegó por la app.`)
  }
  const enviarCopia = () => {
    if (!elegida) return
    if (elegida.emitidoId) entregar(elegida.emitidoId, 'app')
    registrarDescarga(elegida.emitidoId ? 'emitido' : 'documento', elegida.emitidoId || elegida.docId || elegida.clave, q.colaboradorId, `Envió copia de ${elegida.nombre} (${elegida.sub}) por la app`)
    resolverSolicitud(q.id, 'atendida', `Se envió ${elegida.nombre} (${elegida.sub}) por la app`, elegida.emitidoId ? { emitidoId: elegida.emitidoId } : elegida.docId ? { docId: elegida.docId } : {})
    onListo(true, `Copia enviada: a ${nombre} le llegó por la app.`)
  }
  const rechazar = () => { resolverSolicitud(q.id, 'rechazada', motivo.trim()); onListo(false, `Rechazado. ${nombre} verá el motivo en Mis solicitudes.`) }

  const Icono = ICONOS[q.tipo]
  const plazo = plazoDe(q)

  return (
    <>
      <div className="rv-escena">
        <div className="rv-papel" key={`${modeloId}-${copia}`}>
          {q.tipo === 'copia'
            ? elegida?.doc ? <Previa version={elegida.version} persona={persona} subtipo={elegida.subtipo} />
              : elegida?.emitido ? <HojaDocumento texto={elegida.emitido.texto || ''} />
                : elegida?.contrato ? <HojaDocumento texto={`${elegida.nombre.toUpperCase()}\n${elegida.contrato.numero}\n\n${persona?.name}\nDesde el ${fechaCorta(elegida.contrato.inicio)}${elegida.contrato.fin ? ` hasta el ${fechaCorta(elegida.contrato.fin)}` : ''}\n\nCopia del contrato que guarda RR.HH.`} />
                  : <HojaDocumento texto="Su expediente no tiene documentos para enviarle." />
            : modelo ? <HojaDocumento texto={textoNuevo} /> : <HojaDocumento texto="Elija la plantilla del certificado." />}
        </div>
      </div>

      <section className="rv-panel" aria-label="Pedido elegido">
        <div>
          <h2 className="rv-panel-tit rv-panel-tit-ico"><Icono size={16} aria-hidden="true" />{q.asunto}</h2>
          <PersonaCelda persona={persona} size={32} sub={`${persona?.cargo || 'Sin cargo'} · ${persona?.sedeNombre || ''}`} />
        </div>
        {q.detalle && <p className="rv-cita">«{q.detalle}»</p>}
        <dl className="rv-datos">
          <div><dt>Pidió</dt><dd>{fechaCorta(q.fecha)}</dd></div>
          <div><dt>Responder antes</dt><dd className={plazo.clase}>{fechaCorta(responderAntes(q.fecha))} · {plazo.texto.toLowerCase()}</dd></div>
        </dl>

        {(q.tipo === 'certificacion' || q.tipo === 'correccion') && (
          <div className="rv-fechas">
            <label>Plantilla
              <Desplegable valor={modeloId} onCambio={setModeloId} ariaLabel="Plantilla" placeholder="Elija la plantilla"
                opciones={(q.tipo === 'certificacion' ? certificables : modelos.filter(m => m.estado === 'activo' && versionPublicada(m))).map(m => ({ valor: m.id, etiqueta: m.nombre }))} />
            </label>
            {q.tipo === 'correccion' && anterior && (
              <label className="rv-check">
                <input type="checkbox" checked={anularAnterior} onChange={e => setAnularAnterior(e.target.checked)} />
                <span>Anular <b>{anterior.numero}</b> al emitir el nuevo</span>
              </label>
            )}
            {q.tipo === 'correccion' && <p>Si el error está en un dato de la ficha, corríjalo primero en Gestión de personas: el documento nuevo toma sus datos de ahí.</p>}
          </div>
        )}

        {q.tipo === 'copia' && opciones.length > 0 && (
          <div className="rv-fechas">
            <label>¿Qué documento le envía?
              <Desplegable valor={copia} onCambio={setCopia} ariaLabel="Documento a enviar" placeholder="Elija el documento"
                opciones={opciones.map(o => ({ valor: o.clave, etiqueta: o.nombre, lateral: o.sub }))} />
            </label>
          </div>
        )}

        <div className="rv-herr">
          <button type="button" onClick={onExpediente}><FolderOpen size={13} aria-hidden="true" /> Su expediente</button>
        </div>

        <div className="rv-decidir">
          {decision ? (
            <>
              <p className={`rv-hecho rv-hecho-${decision}`}>{decision === 'ok' ? <><Check size={15} /> Atendida</> : <><X size={15} /> Rechazada</>}</p>
              {resultado && <p className="rv-resultado">{resultado}</p>}
              {siguiente
                ? <button type="button" className="rv-btn-aprobar" onClick={onSiguiente}>Siguiente pendiente →</button>
                : <button type="button" className="rv-btn-aprobar" onClick={onVolver}>Volver a Solicitudes</button>}
              {siguiente && <button type="button" className="rv-btn-rechazar rv-btn-neutro" onClick={onVolver}>Volver a Solicitudes</button>}
            </>
          ) : rechazando ? (
            <>
              <span className="rv-rot">Rechazar porque…</span>
              <div className="rv-motivos">
                {MOTIVOS.map(m => <button key={m.corto} type="button" className={motivo === m.texto ? 'on' : ''} aria-pressed={motivo === m.texto} onClick={() => setMotivo(m.texto)} title={m.texto}>{m.corto}</button>)}
              </div>
              <textarea rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Elija un motivo o escríbalo con sus palabras…" aria-label="Motivo del rechazo" />
              <div className="rv-botones">
                <button type="button" className="pl-btn-cancel" onClick={() => setRechazando(false)}>Cancelar</button>
                <button type="button" className="rv-btn-rechazar-ok" disabled={motivo.trim().length < 5} onClick={rechazar}>Rechazar</button>
              </div>
            </>
          ) : (
            <>
              {q.tipo === 'copia'
                ? <button type="button" className="rv-btn-aprobar" disabled={!elegida} onClick={enviarCopia}><Send size={15} aria-hidden="true" /> Enviar copia a {nombre}</button>
                : <button type="button" className="rv-btn-aprobar" disabled={!modelo} onClick={emitirYEnviar}><Send size={15} aria-hidden="true" /> {q.tipo === 'correccion' ? 'Reemitir y enviar' : 'Emitir y enviar'}</button>}
              <button type="button" className="rv-btn-rechazar" onClick={() => setRechazando(true)}><X size={15} aria-hidden="true" /> Rechazar…</button>
            </>
          )}
        </div>
      </section>
    </>
  )
}
