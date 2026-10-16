import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CheckCircle2, Download, FolderOpen, Tags, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import Avatar from '../../components/personas/Avatar'
import SelectorFecha from '../../components/layout/SelectorFecha'
import { EstadoChip, SensibilidadChip, Vacio } from '../../components/documentacion/comunes'
import { FILTROS_VACIOS, pasaFiltros } from '../../components/documentacion/utilidades'
import { diasHasta, fechaCorta, versionActual } from '../../data/documentacionData'
import { Previa, descargarVersion } from './Expediente'
import { useAviso } from './Envios'
import './seguimiento.css'
import './expediente.css'

/* ── POR REVISAR: UNA SOLA TAREA, EN FILA (Documentación v2) ──────────────
   Lo que subieron los colaboradores desde Mis documentos espera a que RR.HH. lo mire: hasta
   entonces no cuenta (RN-05). Antes era un filtro dentro de Colaboradores; revisar es trabajo de
   todos los días y tiene su puerta, con su contador en el menú.

   A LA IZQUIERDA LA FILA, A LA DERECHA EL DOCUMENTO. Se aprueba, se rechaza con motivo o se
   corrigen las fechas —el colaborador sube sin ponerlas— y al resolver uno se abre el siguiente.
   Lo más viejo va primero: es lo que lleva más tiempo esperando.

   Lo que se subió sin decir qué es («por clasificar») también espera a alguien: se clasifica en el
   expediente de su dueño, que es donde están sus carpetas. */

const VISTAS = [
  { key: 'revision', label: 'Subidos por colaboradores' },
  { key: 'clasificar', label: 'Sin clasificar' },
]

/* Vive dentro de Expedientes, como su filtro «Por revisar» (v3): recibe los filtros de la lista. */
export default function PorRevisar({ filtros: f = FILTROS_VACIOS }) {
  const { personas, documentos, subtipos, sinClasificar, revisar, cambiarFechas, registrarDescarga } = useDocumentacion()
  const navigate = useNavigate()
  const [vista, setVista] = useState('revision')
  const [elegido, setElegido] = useState(null)
  const [aviso, setAviso] = useAviso()

  const porId = useMemo(() => new Map(personas.map(p => [p.id, p])), [personas])
  const enRevision = useMemo(() => documentos
    .filter(d => !d.eliminado && versionActual(d)?.revision === 'pendiente' && porId.has(d.colaboradorId))
    .map(d => ({ clave: d.id, doc: d, version: versionActual(d), persona: porId.get(d.colaboradorId), subtipo: subtipos.find(s => s.id === d.subtipoId) }))
    .filter(x => pasaFiltros(x.persona, f))
    .sort((a, b) => ((a.version.fecha || '') < (b.version.fecha || '') ? -1 : 1)), [documentos, porId, subtipos, f])
  const porClasificar = useMemo(() => sinClasificar
    .filter(x => porId.has(x.colaboradorId))
    .map(x => ({ clave: x.id, pendiente: x, persona: porId.get(x.colaboradorId) }))
    .filter(x => pasaFiltros(x.persona, f))
    .sort((a, b) => (a.pendiente.fecha < b.pendiente.fecha ? -1 : 1)), [sinClasificar, porId, f])

  const lista = vista === 'revision' ? enRevision : porClasificar
  const actual = lista.find(x => x.clave === elegido) || lista[0] || null
  /* Al resolver uno se pasa al que estaba debajo; si era el último, al de arriba. */
  const siguiente = () => {
    const i = lista.findIndex(x => x.clave === actual?.clave)
    setElegido((lista[i + 1] || lista[i - 1])?.clave || null)
  }

  return (
    <div>
      <div style={{ margin: "0 0 12px" }}>
        <div className="xb-segmento" role="group" aria-label="Qué revisar">
          {VISTAS.map(v => (
            <button key={v.key} type="button" aria-pressed={vista === v.key} className={vista === v.key ? 'on' : ''} onClick={() => { setVista(v.key); setElegido(null) }}>
              {v.label} <span className="xb-seg-n">{v.key === 'revision' ? enRevision.length : porClasificar.length}</span>
            </button>
          ))}
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="dc-tarjeta">
          <Vacio
            Icono={CheckCircle2}
            titulo={vista === 'revision' ? 'No hay nada por revisar' : 'No hay archivos sin clasificar'}
            texto={vista === 'revision' ? 'Lo que los colaboradores suban desde Mis documentos aparecerá aquí, el más antiguo primero.' : 'Los archivos que se suban sin decir qué documento son aparecerán aquí.'}
          />
        </div>
      ) : (
        <div className="xr-cuerpo">
          <div className="dc-tarjeta xr-lista" role="listbox" aria-label="Documentos por revisar">
            {lista.map(x => {
              const espera = x.version ? -diasHasta(x.version.fecha) : -diasHasta(x.pendiente.fecha)
              return (
                <button key={x.clave} type="button" role="option" aria-selected={actual?.clave === x.clave} className={`xr-item${actual?.clave === x.clave ? ' on' : ''}`} onClick={() => setElegido(x.clave)}>
                  <Avatar persona={x.persona} size={32} />
                  <span className="xr-item-txt">
                    <span className="xr-item-nom">{x.subtipo?.nombre || x.pendiente?.archivo.original}</span>
                    <span className="xr-item-sub">{x.persona.name} · {x.persona.sedeNombre || 'sin sucursal'}</span>
                    <span className="xr-item-sub">{espera <= 0 ? 'Subido hoy' : `Espera hace ${espera} ${espera === 1 ? 'día' : 'días'}`}{x.version?.canal === 'app' ? ' · desde el celular' : ''}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {actual && (vista === 'revision'
            ? <PanelRevision
                key={actual.clave}
                item={actual}
                onAprobar={() => { revisar(actual.doc.id, true); setAviso(`«${actual.subtipo?.nombre}» de ${actual.persona.name} aprobado: ya cuenta como cumplido.`); siguiente() }}
                onRechazar={m => { revisar(actual.doc.id, false, m); setAviso(`Rechazado. ${actual.persona.name.split(' ')[0]} verá el motivo en Mis documentos.`); siguiente() }}
                onFechas={(emision, vencimiento) => { cambiarFechas(actual.doc.id, { emision, vencimiento }); setAviso('Fechas corregidas.') }}
                onDescargar={() => descargarVersion(actual.persona, actual.subtipo, actual.version, actual.doc, registrarDescarga)}
                onExpediente={() => navigate(`/documentos/expedientes/${actual.persona.id}`)}
              />
            : <PanelClasificar item={actual} onClasificar={() => navigate(`/documentos/expedientes/${actual.persona.id}/porclasificar`)} />)}
        </div>
      )}
      {aviso}
    </div>
  )
}

function Quien({ persona }) {
  return (
    <span className="dc-persona">
      <Avatar persona={persona} size={36} />
      <span className="dc-persona-txt">
        <span className="dc-persona-nom">{persona.name}</span>
        <span className="dc-persona-sub">{persona.cargo} · {persona.sedeNombre}</span>
      </span>
    </span>
  )
}

function PanelRevision({ item, onAprobar, onRechazar, onFechas, onDescargar, onExpediente }) {
  const { version: v, subtipo, persona } = item
  const [emision, setEmision] = useState(v.emision || '')
  const [vencimiento, setVencimiento] = useState(v.vencimiento || '')
  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const fechasCambiaron = emision !== (v.emision || '') || vencimiento !== (v.vencimiento || '')
  return (
    <section className="dc-tarjeta xr-panel" aria-label="Documento elegido">
      <div className="xr-panel-cab">
        <div>
          <h2>{subtipo?.nombre || 'Documento'} <SensibilidadChip nivel={subtipo?.sensibilidad} /></h2>
          <Quien persona={persona} />
        </div>
        <EstadoChip estado="en_revision" />
      </div>
      <div className="xr-panel-cuerpo">
        <div className="xr-hoja"><Previa version={v} persona={persona} subtipo={subtipo} /></div>
        <div>
          <dl className="xr-datos">
            <div><dt>Subido</dt><dd>{fechaCorta(v.fecha)} por {v.subidoPor}{v.canal === 'app' ? ', desde el celular' : v.canal === 'web' ? ', desde la web' : ''}</dd></div>
            <div><dt>Archivo</dt><dd>{v.archivo?.original || v.archivo?.nombre}</dd></div>
            {v.motivoCambio && <div><dt>Nota</dt><dd>{v.motivoCambio}</dd></div>}
            <div><dt>Formato pedido</dt><dd>{subtipo?.formatos?.map(x => x.toUpperCase()).join(', ')} · hasta {subtipo?.tamanoMaxMB} MB</dd></div>
          </dl>
          <p className="xb-nota" style={{ margin: '14px 0 8px' }}>El colaborador no pone fechas al subir. Corríjalas si el documento es de antes.</p>
          <div className="xr-fechas">
            <label className="pl-label">Emisión<SelectorFecha valor={emision} onCambio={setEmision} ariaLabel="Fecha de emisión" /></label>
            {subtipo?.vence && <label className="pl-label">Vencimiento<SelectorFecha valor={vencimiento} onCambio={setVencimiento} ariaLabel="Fecha de vencimiento" /></label>}
          </div>
          {fechasCambiaron && <button type="button" className="dc-btn dc-btn-sm" style={{ marginTop: 8 }} onClick={() => onFechas(emision, vencimiento)}><Check size={12} aria-hidden="true" /> Guardar fechas</button>}
        </div>
      </div>

      {rechazando ? (
        <div className="xr-rechazo">
          <label className="pl-label" htmlFor="xr-motivo">Motivo del rechazo · lo lee el colaborador</label>
          <textarea id="xr-motivo" className="pl-input" rows={3} autoFocus value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="La foto está cortada: no se lee el número de documento." />
          <div className="xr-pie">
            <button type="button" className="pl-btn-cancel" onClick={() => setRechazando(false)}>Cancelar</button>
            <button type="button" className="pl-btn-save xb-btn-rechazo" disabled={motivo.trim().length < 5} onClick={() => onRechazar(motivo.trim())}>Rechazar</button>
          </div>
        </div>
      ) : (
        <div className="xr-pie">
          <button type="button" className="dc-btn" onClick={onExpediente}><FolderOpen size={14} aria-hidden="true" /> Abrir su expediente</button>
          <button type="button" className="dc-btn" onClick={onDescargar}><Download size={14} aria-hidden="true" /> Descargar</button>
          <button type="button" className="dc-btn dc-btn-peligro" onClick={() => setRechazando(true)}><X size={14} aria-hidden="true" /> Rechazar</button>
          <button type="button" className="pl-btn-new" onClick={onAprobar}><Check size={14} aria-hidden="true" /> Aprobar</button>
        </div>
      )}
    </section>
  )
}

function PanelClasificar({ item, onClasificar }) {
  const { pendiente: x, persona } = item
  return (
    <section className="dc-tarjeta xr-panel" aria-label="Archivo elegido">
      <div className="xr-panel-cab">
        <div>
          <h2>{x.archivo.original}</h2>
          <Quien persona={persona} />
        </div>
        <span className="dc-chip dc-t-ambar">Por clasificar</span>
      </div>
      <div className="xr-hoja"><Previa version={{ v: 1, archivo: x.archivo }} persona={persona} subtipo={{ nombre: x.archivo.original }} /></div>
      <p className="xb-nota">Lo subió {x.por} el {fechaCorta(x.fecha)} sin decir qué documento es. Se clasifica en su expediente, donde están sus carpetas y lo que le falta.</p>
      <div className="xr-pie">
        <button type="button" className="pl-btn-new" onClick={onClasificar}><Tags size={14} aria-hidden="true" /> Clasificar en su expediente</button>
      </div>
    </section>
  )
}

