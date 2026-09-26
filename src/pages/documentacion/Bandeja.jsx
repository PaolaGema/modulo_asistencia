import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, Check, CheckCircle2, Clock, Eye, FileSignature, FileText, Inbox, Send, Upload, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { useArchivoLocal } from '../../hooks/useArchivoLocal'
import { Cabecera, EstadoChip, EstadoContratoChip, Etiqueta, Filtros, Modal, PersonaCelda, SensibilidadChip, Vacio } from '../../components/documentacion/comunes'
import { FILTROS_VACIOS, pasaFiltros } from '../../components/documentacion/utilidades'
import { MODALIDADES, fechaCorta, fechaLarga, iso, hoy } from '../../data/documentacionData'
import { activos, pilas, proximoVencimiento, textoDias, ventanaMaxima } from './seguimientoDatos'
import './seguimiento.css'

/* ── LA BANDEJA DE RR.HH. (pantalla 8, RF-39) ──────────────────────────────
   Cuatro pilas —vencidos, por vencer, faltantes y en revisión— y una quinta para los contratos
   que terminan (RF-40). Es la pantalla que responde «¿qué tengo que hacer hoy?», y por eso se
   ACTÚA SIN SALIR: lo que sube el colaborador se aprueba o se rechaza acá mismo, y lo que hay que
   cargar lleva directo al expediente con el tipo ya puesto. */

const PILAS = [
  { key: 'vencidos', label: 'Vencidos', Icono: AlertTriangle },
  { key: 'por_vencer', label: 'Por vencer', Icono: Clock },
  { key: 'faltantes', label: 'Faltantes', Icono: FileText },
  { key: 'revision', label: 'En revisión', Icono: Eye },
  { key: 'contratos', label: 'Contratos por vencer', Icono: FileSignature },
]

export default function Bandeja() {
  const ctx = useDocumentacion()
  const { personas, sucursales, tipos, subtipos, revisar } = ctx
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const pila = PILAS.some(p => p.key === params.get('pila')) ? params.get('pila') : 'vencidos'
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [elegidos, setElegidos] = useState(() => new Set())
  const [revisando, setRevisando] = useState(null)
  const [pedir, setPedir] = useState(false)
  /* LOS PEDIDOS QUEDAN GUARDADOS y en la bitácora. El envío es del motor de Comunicación (3.8),
     que la demo no tiene, y el aviso lo dice. */
  const { pedidos, pedirDocumentos } = ctx
  const pedidoDe = it => it.subtipo && pedidos[`${it.persona.id}|${it.subtipo.id}`]
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 4200)
    return () => clearTimeout(t)
  }, [aviso])

  const gente = useMemo(() => activos(personas).filter(p => pasaFiltros(p, filtros)), [personas, filtros])
  const todas = useMemo(() => pilas(ctx, gente), [ctx, gente])
  /* TIPO Y SUBTIPO FILTRAN FILAS, NO PERSONAS: la sede y el área dicen de quién; el tipo, de qué. */
  const deTipo = it => (!filtros.tipo || it.subtipo?.tipoId === filtros.tipo) && (!filtros.subtipo || it.subtipo?.id === filtros.subtipo)
  const listas = useMemo(() => Object.fromEntries(Object.entries(todas).map(([k, v]) => [k, k === 'contratos' ? v : v.filter(deTipo)])), [todas, filtros]) // eslint-disable-line react-hooks/exhaustive-deps
  const filas = listas[pila]

  const cambiarPila = k => { setParams(k === 'vencidos' ? {} : { pila: k }); setElegidos(new Set()) }
  const alternar = clave => setElegidos(prev => { const n = new Set(prev); if (n.has(clave)) n.delete(clave); else n.add(clave); return n })
  const seleccionables = ['vencidos', 'por_vencer', 'faltantes'].includes(pila)
  const todosElegidos = seleccionables && filas.length > 0 && filas.every(f => elegidos.has(f.clave))

  const cargar = it => navigate(`/documentos/expedientes/${it.persona.id}?cargar=${it.subtipo.id}`)

  const confirmarPedido = () => {
    pedirDocumentos(filas.filter(f => elegidos.has(f.clave)).map(f => ({ colaboradorId: f.persona.id, subtipoId: f.subtipo.id, nombre: f.subtipo.nombre })))
    setAviso(`Se prepararon ${elegidos.size} pedidos. En producción saldrían por correo y por la app; esta demo no envía mensajes.`)
    setElegidos(new Set())
    setPedir(false)
  }

  const ventana = ventanaMaxima(ctx)
  const proximo = proximoVencimiento(ctx, gente)

  return (
    <div className="content-scroll">
      <Cabecera titulo="Bandeja" sub="Lo que necesita atención hoy: vencidos, por vencer, faltantes y lo que espera su revisión." />

      <Filtros valor={filtros} onCambio={v => { setFiltros(v); setElegidos(new Set()) }} mostrar={pila === 'contratos' ? ['sede', 'area', 'cargo'] : ['sede', 'area', 'cargo', 'tipo', 'subtipo']} personas={activos(personas)} sucursales={sucursales} tipos={tipos} subtipos={subtipos} />

      <div className="dc-tarjeta xb-bandeja">
        <div className="dc-tabs" role="tablist" aria-label="Pilas de la bandeja">
          {PILAS.map(({ key, label, Icono }) => (
            <button key={key} type="button" role="tab" aria-selected={pila === key} className={`dc-tab${pila === key ? ' on' : ''}`} onClick={() => cambiarPila(key)}>
              <Icono size={14} aria-hidden="true" /> {label} <span className="dc-tab-n">{listas[key].length}</span>
            </button>
          ))}
        </div>

        {seleccionables && filas.length > 0 && (
          <div className="xb-barra-sel">
            <label className="xb-check">
              <input type="checkbox" checked={todosElegidos} onChange={() => setElegidos(todosElegidos ? new Set() : new Set(filas.map(f => f.clave)))} />
              <span>{elegidos.size ? `${elegidos.size} seleccionados` : 'Seleccionar todos'}</span>
            </label>
            <button type="button" className="dc-btn dc-btn-sm" disabled={!elegidos.size} onClick={() => setPedir(true)}>
              <Send size={13} aria-hidden="true" /> Pedir a los seleccionados
            </button>
          </div>
        )}

        {filas.length === 0 ? <PilaVacia pila={pila} ventana={ventana} proximo={proximo} /> : (
          <div className="as-table-wrap xb-tabla-wrap">
            <table className="as-table xb-tabla">
              <thead>
                <tr>
                  {seleccionables && <th className="xb-col-check"><span className="sr-only">Seleccionar</span></th>}
                  <th>Colaborador</th>
                  <th>{pila === 'contratos' ? 'Contrato' : 'Documento'}</th>
                  <th>Estado</th>
                  <th>{pila === 'revision' ? 'Subido' : pila === 'faltantes' ? 'Plazo' : pila === 'contratos' ? 'Fin' : 'Vencimiento'}</th>
                  <th><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {filas.map(it => (
                  <tr key={it.clave} className={elegidos.has(it.clave) ? 'xb-fila-sel' : undefined}>
                    {seleccionables && (
                      <td className="xb-col-check">
                        <input type="checkbox" aria-label={`Seleccionar ${it.persona.name}, ${it.subtipo.nombre}`} checked={elegidos.has(it.clave)} onChange={() => alternar(it.clave)} />
                      </td>
                    )}
                    <td><PersonaCelda persona={it.persona} onClick={() => navigate(`/documentos/expedientes/${it.persona.id}`)} /></td>
                    <td>
                      {pila === 'contratos' ? (
                        <div className="xb-doc">
                          <span className="xb-doc-nom">{MODALIDADES[it.contrato.modalidad]} · {it.contrato.numero}</span>
                          <span className="xb-doc-sub">{it.contrato.tipo === 'adenda' ? 'Adenda' : 'Contrato'} desde {fechaCorta(it.contrato.inicio)}</span>
                        </div>
                      ) : (
                        <div className="xb-doc">
                          <span className="xb-doc-nom">{it.subtipo.nombre} <SensibilidadChip nivel={it.subtipo.sensibilidad} /></span>
                          <span className="xb-doc-sub">{tipos.find(t => t.id === it.subtipo.tipoId)?.nombre}</span>
                          {it.estado === 'rechazado' && it.version?.motivoRechazo && <span className="xb-motivo">Rechazado: {it.version.motivoRechazo}</span>}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="xb-estado">
                        {pila === 'contratos' ? <EstadoContratoChip estado={it.estado} /> : <EstadoChip estado={it.estado} />}
                        {pedidoDe(it) && <Etiqueta tono="azul" titulo={`Pedido el ${fechaCorta(pedidoDe(it))}`}>{pedidoDe(it) === iso(hoy()) ? 'Pedido hoy' : 'Pedido'}</Etiqueta>}
                      </div>
                    </td>
                    <td className="xb-cuando">
                      {pila === 'revision' ? (
                        <><b>{fechaCorta(it.version.fecha)}</b><span>{it.dias === 0 ? 'Hoy' : `Espera hace ${it.dias} ${it.dias === 1 ? 'día' : 'días'}`} · {it.version.canal === 'app' ? 'desde la app' : it.version.canal}</span></>
                      ) : pila === 'faltantes' ? (
                        <><b>{it.limite ? fechaCorta(it.limite) : 'Desde el ingreso'}</b><span>{it.dias ? `Atrasado ${it.dias} ${it.dias === 1 ? 'día' : 'días'}` : it.estado === 'rechazado' ? 'Hay que volver a pedirlo' : 'Vence hoy'}</span></>
                      ) : pila === 'contratos' ? (
                        <><b>{fechaCorta(it.contrato.fin)}</b><span>{it.dias < 0 ? `Terminó hace ${-it.dias} días` : `Termina en ${it.dias} días`}</span></>
                      ) : (
                        <><b>{fechaCorta(it.version.vencimiento)}</b><span>{textoDias(it.estado, it.dias)}</span></>
                      )}
                    </td>
                    <td className="xb-acc">
                      {pila === 'revision' ? (
                        <button type="button" className="dc-btn dc-btn-sm" onClick={() => setRevisando(it)}><Eye size={13} aria-hidden="true" /> Revisar</button>
                      ) : pila === 'contratos' ? (
                        <button type="button" className="dc-btn dc-btn-sm" onClick={() => navigate(`/documentos/contratos/${it.contrato.id}`)}>Ver contrato</button>
                      ) : (
                        <button type="button" className="dc-btn dc-btn-sm" onClick={() => cargar(it)}><Upload size={13} aria-hidden="true" /> {pila === 'faltantes' ? 'Cargar' : 'Cargar renovación'}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {revisando && (
        <RevisarModal
          item={revisando}
          tipo={tipos.find(t => t.id === revisando.subtipo.tipoId)}
          onCerrar={() => setRevisando(null)}
          onDecidir={(ok, motivo) => {
            revisar(revisando.documento.id, ok, motivo)
            setAviso(ok ? `Aprobado. ${revisando.subtipo.nombre} de ${revisando.persona.name} ya cuenta como cumplido.` : `Rechazado. ${revisando.persona.name} verá el motivo y podrá volver a subirlo.`)
            setRevisando(null)
          }}
          onAbrirExpediente={() => navigate(`/documentos/expedientes/${revisando.persona.id}?doc=${revisando.documento.id}`)}
        />
      )}

      {pedir && (
        <Modal titulo="Pedir documentos" Icono={Send} onCerrar={() => setPedir(false)} ancho={480}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setPedir(false)}>Cancelar</button>
            <button type="button" className="pl-btn-save" onClick={confirmarPedido}>Preparar {elegidos.size} pedidos</button>
          </>}
        >
          <p className="xb-p">
            Se avisará a {new Set(filas.filter(f => elegidos.has(f.clave)).map(f => f.persona.id)).size} personas qué documento tienen que traer, con el acceso directo para subirlo desde la app.
          </p>
          <p className="xb-nota">En esta demo no se envía ningún mensaje: el envío es del motor de notificaciones de Comunicación (PRD 3.8).</p>
        </Modal>
      )}

      {aviso && (
        <div className="xb-aviso" role="status">
          <CheckCircle2 size={16} aria-hidden="true" /> <span>{aviso}</span>
          <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso(null)}><X size={14} /></button>
        </div>
      )}
    </div>
  )
}

/* LOS VACÍOS DICEN QUÉ PASÓ Y QUÉ SIGUE (11.3). El de vencimientos da la fecha del próximo: «no
   hay nada» sin decir cuándo lo habrá deja la pregunta abierta. */
function PilaVacia({ pila, ventana, proximo }) {
  if (pila === 'vencidos' || pila === 'por_vencer') {
    return (
      <Vacio Icono={CheckCircle2} titulo={`No hay nada vencido ni por vencer en los próximos ${ventana} días`}
        texto={proximo ? `El próximo vencimiento es el ${fechaLarga(proximo)}.` : 'Ningún documento cargado tiene fecha de vencimiento.'} />
    )
  }
  if (pila === 'faltantes') return <Vacio Icono={CheckCircle2} titulo="No falta ningún documento exigible" texto="Los plazos que todavía corren no aparecen acá: alguien que entró ayer no está en falta." />
  if (pila === 'revision') return <Vacio Icono={Inbox} titulo="Nada espera su revisión" texto="Lo que suban los colaboradores desde la app aparecerá acá antes de contar como cumplido." />
  return <Vacio Icono={CheckCircle2} titulo="Ningún contrato termina pronto" texto="Los contratos a plazo fijo aparecen acá con la anticipación configurada en Parámetros y avisos." />
}

/* ── REVISAR SIN SALIR DE LA BANDEJA (RF-31, RF-32) ────────────────────────
   Ver y decidir en el mismo lugar. El rechazo EXIGE motivo: le llega al colaborador y queda en
   la auditoría para siempre (5.4). Abrir un documento confidencial deja rastro aunque no se
   apruebe ni se descargue (RF-90). */
function RevisarModal({ item, tipo, onCerrar, onDecidir, onAbrirExpediente }) {
  const { registrarDescarga } = useDocumentacion()
  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const v = item.version
  const url = useArchivoLocal(v.archivo?.clave || null)
  const confidencial = item.subtipo.sensibilidad === 'confidencial'

  useEffect(() => {
    if (confidencial) registrarDescarga('documento', item.documento.id, item.persona.id, `Abrió para revisar ${item.subtipo.nombre}`, true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const esImagen = v.archivo?.formato && ['jpg', 'jpeg', 'png', 'webp'].includes(v.archivo.formato)
  return (
    <Modal titulo="Revisar documento" Icono={Eye} onCerrar={onCerrar} ancho={820}
      pie={rechazando ? <>
        <button type="button" className="pl-btn-cancel" onClick={() => setRechazando(false)}>Volver</button>
        <button type="button" className="pl-btn-save xb-btn-rechazo" disabled={!motivo.trim()} onClick={() => onDecidir(false, motivo.trim())}>Rechazar con este motivo</button>
      </> : <>
        <button type="button" className="dc-btn dc-btn-texto xb-pie-izq" onClick={onAbrirExpediente}>Abrir en el expediente</button>
        <button type="button" className="pl-btn-cancel xb-btn-rechazar" onClick={() => setRechazando(true)}><X size={14} aria-hidden="true" /> Rechazar</button>
        <button type="button" className="pl-btn-save" onClick={() => onDecidir(true)}><Check size={14} aria-hidden="true" /> Aprobar</button>
      </>}
    >
      <div className="xb-revisar">
        <div className="xb-previa" aria-label="Vista previa del documento">
          {url && esImagen ? <img src={url} alt={`${item.subtipo.nombre} de ${item.persona.name}`} />
            : url ? <iframe src={url} title={`${item.subtipo.nombre} de ${item.persona.name}`} />
              : (
                <div className="xb-previa-sim">
                  <FileText size={34} strokeWidth={1.4} aria-hidden="true" />
                  <b>{v.archivo?.nombre}</b>
                  <span>Vista previa simulada: los documentos de ejemplo no tienen archivo.</span>
                </div>
              )}
        </div>
        <div className="xb-ficha">
          <PersonaCelda persona={item.persona} />
          <dl className="xb-dl">
            <div><dt>Documento</dt><dd>{item.subtipo.nombre} <SensibilidadChip nivel={item.subtipo.sensibilidad} /></dd></div>
            <div><dt>Tipo</dt><dd>{tipo?.nombre}</dd></div>
            <div><dt>Emisión</dt><dd>{fechaCorta(v.emision)}</dd></div>
            <div><dt>Vencimiento</dt><dd>{v.vencimiento ? fechaCorta(v.vencimiento) : 'No vence'}</dd></div>
            <div><dt>Subido</dt><dd>{fechaCorta(v.fecha)} por {v.subidoPor} · {v.canal === 'app' ? 'app' : v.canal}</dd></div>
            <div><dt>Archivo</dt><dd className="xb-archivo">{v.archivo?.nombre}<span>Original: {v.archivo?.original || '—'}</span></dd></div>
            {v.info && <div><dt>Información adicional</dt><dd>{v.info}</dd></div>}
          </dl>
          {rechazando && (
            <label className="pl-label xb-motivo-campo">
              Motivo del rechazo <span className="pl-req" aria-hidden="true">*</span>
              <textarea className="pl-input" rows={3} autoFocus value={motivo} onChange={e => setMotivo(e.target.value)}
                placeholder="Por ejemplo: la foto está cortada y no se lee el número de documento." />
              <span className="xb-nota">El colaborador verá este motivo junto a la opción de volver a subirlo.</span>
            </label>
          )}
        </div>
      </div>
    </Modal>
  )
}
