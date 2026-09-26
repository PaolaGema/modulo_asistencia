import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Upload, Download, FilePlus2, Eye, RefreshCw, ShieldCheck, Check, X, Trash2, Search,
  FolderOpen, Lock, FileText, History, Undo2, FileSignature, Archive,
} from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import {
  EstadoChip, EstadoContratoChip, EstadoEmitidoChip, SensibilidadChip, BarraAvance, Modal, Vacio,
} from '../../components/documentacion/comunes'
import { descargarTexto } from '../../components/documentacion/utilidades'
import Avatar from '../../components/personas/Avatar'
import Desplegable from '../../components/layout/Desplegable'
import { useArchivoLocal } from '../../hooks/useArchivoLocal'
import { leerArchivo } from '../../utils/archivosLocales'
import {
  ESTADOS, CATEGORIAS, MODALIDADES, ACCIONES_BITACORA, fechaCorta, fechaNum, antiguedad, diasHasta,
  estadoVersion, versionActual, estadoContrato,
} from '../../data/documentacionData'
import CargarDocumentoModal from './CargarDocumentoModal'
import './expediente.css'

/* ── EL EXPEDIENTE DEL COLABORADOR (pantalla 5 · RF-17 a RF-25) ────────────
   Una sola pantalla que reemplaza las cuatro consultas del Salar. Arriba, la ficha (RF-19): de
   quién es y cuánto tiene. Abajo, todo lo suyo AGRUPADO POR TIPO, y dentro de cada tipo los
   requisitos sin cumplir como filas visibles (RF-17): la ausencia es un dato (principio 1), así
   que un faltante no es un hueco que hay que deducir sino una fila con su botón de cargar.

   EL ESTADO SE LEE DE `checklistDe` y de `estadoVersion`, nunca se calcula acá: si esta pantalla
   y la bandeja dijeran cosas distintas del mismo carnet, el módulo dejaría de servir.

   LOS MODALES VIVEN EN LA URL (`?cargar=`, `?doc=`) porque la bandeja y el panel llegan hasta
   acá con la acción ya elegida: «desde el faltante llego a cargar sin volver a elegir tipo ni
   subtipo» (historia 1). Y cerrar vuelve atrás con la flecha del navegador, como se espera. */

const PESTANAS = [
  { key: 'documentos', label: 'Documentos', Icono: FolderOpen },
  { key: 'emitidos', label: 'Emitidos', Icono: FileText },
  { key: 'contratos', label: 'Contratos', Icono: FileSignature },
  { key: 'historial', label: 'Historial', Icono: History },
]

/* Qué acción principal corresponde a cada estado. El botón dice lo que hay que hacer, no
   «Editar»: un faltante se carga, un vencido se renueva, uno en revisión se revisa. */
const ACCION = {
  faltante: { label: 'Cargar', Icono: Upload },
  vencido: { label: 'Renovar', Icono: RefreshCw },
  por_vencer: { label: 'Renovar', Icono: RefreshCw },
  rechazado: { label: 'Cargar otro', Icono: Upload },
}

export default function Expediente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const doc = useDocumentacion()
  const {
    persona: personaDe, tipos, subtipos, documentos, emitidos, contratos, bitacora, parametros, modelos,
    checklist, avanceDe, revisar, exonerar, eliminarDocumento, recuperarDocumento, registrarDescarga,
  } = doc
  const persona = personaDe(id)

  const [pestana, setPestana] = useState('documentos')
  const [busca, setBusca] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [rechazo, setRechazo] = useState(null)       // docId
  const [exonera, setExonera] = useState(null)       // subtipoId
  const [papelera, setPapelera] = useState(null)     // docId
  const [aviso, setAviso] = useState('')

  const abrir = (k, v) => { const q = Object.fromEntries(params.entries()); q[k] = v; setParams(q) }
  const cerrar = k => { const q = Object.fromEntries(params.entries()); delete q[k]; setParams(q, { replace: true }) }
  /* De la vista de un documento a cargar su versión nueva: un solo cambio de URL. Hecho en dos
     pasos, el segundo leía los parámetros de antes y dejaba la vista abierta debajo. */
  const pasarACargar = subtipoId => { const q = Object.fromEntries(params.entries()); delete q.doc; q.cargar = subtipoId; setParams(q, { replace: true }) }
  const cargarParam = params.get('cargar')
  const docParam = params.get('doc')

  /* Las filas: un requisito con o sin documento, más los documentos que no responden a ningún
     requisito (un certificado de curso que nadie exigió también es parte del expediente). */
  const filas = useMemo(() => {
    if (!persona) return []
    const cl = checklist(persona)
    const propios = documentos.filter(d => d.colaboradorId === persona.id && !d.eliminado)
    const out = cl.map(i => ({ key: `r-${i.subtipo.id}`, subtipo: i.subtipo, requisito: i.requisito, documento: i.documento, estado: i.estado, limite: i.limite, exigible: i.exigible, exoneracion: i.exoneracion }))
    for (const d of propios) {
      if (out.some(f => f.documento?.id === d.id)) continue
      const s = subtipos.find(x => x.id === d.subtipoId)
      out.push({ key: `d-${d.id}`, subtipo: s, requisito: null, documento: d, estado: estadoVersion(versionActual(d), s, parametros) })
    }
    return out.filter(f => f.subtipo)
  }, [persona, checklist, documentos, subtipos, parametros])

  if (!persona) {
    return (
      <div className="content-scroll">
        <div className="dc-tarjeta">
          <Vacio Icono={FolderOpen} titulo="No encontramos este expediente" texto="La persona no existe o ya no figura en el directorio.">
            <button type="button" className="dc-btn" onClick={() => navigate('/documentos/expedientes')}>Volver a expedientes</button>
          </Vacio>
        </div>
      </div>
    )
  }

  /* RF-24 / RN-21: el expediente de quien se fue se cierra en solo lectura. Se consulta, se
     descarga y se audita; no se carga ni se edita. */
  const cerrado = persona.status === 'desvinculado'
  const avance = avanceDe(persona)
  const vigente = contratos.find(c => c.colaboradorId === persona.id && c.tipo === 'contrato' && ['vigente', 'por_vencer'].includes(estadoContrato(c, parametros, contratos)))
  const enPapelera = documentos.filter(d => d.colaboradorId === persona.id && d.eliminado)
  const susEmitidos = emitidos.filter(e => e.colaboradorId === persona.id)
  const susContratos = contratos.filter(c => c.colaboradorId === persona.id)
  const susEventos = bitacora.filter(b => b.colaboradorId === persona.id)

  const texto = busca.trim().toLowerCase()
  const visibles = filas.filter(f => {
    if (filtroEstado && f.estado !== filtroEstado) return false
    if (!texto) return true
    const v = versionActual(f.documento)
    return [f.subtipo.nombre, v?.archivo?.nombre, v?.archivo?.original, ESTADOS[f.estado]?.label, tipos.find(t => t.id === f.subtipo.tipoId)?.nombre]
      .some(x => String(x || '').toLowerCase().includes(texto))
  })
  const grupos = tipos
    .map(t => ({ tipo: t, filas: visibles.filter(f => f.subtipo.tipoId === t.id) }))
    .filter(g => g.filas.length)
    .map(g => ({ ...g, filas: [...g.filas].sort((a, b) => orden(a) - orden(b)) }))

  const cuantos = e => filas.filter(f => f.estado === e).length
  const filaDoc = docParam ? documentos.find(d => d.id === docParam) : null

  /* RF-22: el expediente completo con índice. La demo no tiene servidor de archivos, así que se
     descarga el índice en texto: qué contiene, en qué estado y a qué fecha se generó. */
  const descargarExpediente = () => {
    const l = []
    l.push(`EXPEDIENTE DE ${persona.name.toUpperCase()}`)
    l.push(`Código ${persona.codigo} · ${persona.cargo} · ${persona.depto} · ${persona.sedeNombre}`)
    l.push(`Ingreso ${fechaNum(persona.ingreso)} · Completitud ${avance.pct === null ? 'sin requisitos' : `${avance.pct}% (${avance.cumplidos} de ${avance.total} obligatorios)`}`)
    l.push(`Generado el ${new Date().toLocaleString('es-BO')} por ${doc.usuario}`)
    l.push('')
    for (const t of tipos) {
      const fs = filas.filter(f => f.subtipo.tipoId === t.id)
      if (!fs.length) continue
      l.push(`— ${t.nombre.toUpperCase()}`)
      for (const f of fs) {
        const v = versionActual(f.documento)
        l.push(`  ${f.subtipo.nombre.padEnd(40)} ${ESTADOS[f.estado].label.padEnd(12)} ${v?.vencimiento ? `vence ${fechaNum(v.vencimiento)}` : ''.padEnd(16)}  ${v ? `${v.archivo.nombre} (v${v.v})` : 'sin archivo'}`)
      }
      l.push('')
    }
    if (susEmitidos.length) {
      l.push('— DOCUMENTOS EMITIDOS')
      for (const e of susEmitidos) l.push(`  ${e.numero.padEnd(18)} ${(modelos.find(m => m.id === e.modeloId)?.nombre || '').padEnd(40)} ${fechaNum(e.fecha)}  ${e.estado}`)
      l.push('')
    }
    if (susContratos.length) {
      l.push('— CONTRATOS Y ADENDAS')
      for (const c of susContratos) l.push(`  ${c.numero.padEnd(18)} ${(c.tipo === 'adenda' ? 'Adenda' : MODALIDADES[c.modalidad]).padEnd(22)} ${fechaNum(c.inicio)} a ${c.fin ? fechaNum(c.fin) : 'sin fecha de fin'}`)
    }
    descargarTexto(`expediente_${persona.codigo}.txt`, l.join('\n'))
    registrarDescarga('expediente', persona.id, persona.id, 'Descargó el expediente completo con índice')
  }

  const avisar = t => { setAviso(t); setTimeout(() => setAviso(''), 3200) }

  return (
    <div className="content-scroll">
      <button type="button" className="xa-volver" onClick={() => navigate('/documentos/expedientes')}>
        <ArrowLeft size={14} /> Expedientes
      </button>

      {/* ── LA FICHA (RF-19). Los datos vienen de Gestión de Personas y acá no se editan. ── */}
      <section className="dc-tarjeta xa-ficha">
        <Avatar persona={persona} size={72} clase="og-av xa-ficha-foto" />
        <div className="xa-ficha-quien">
          <h1 className="xa-ficha-nombre">{persona.name}</h1>
          <p className="xa-ficha-cargo">{persona.cargo || 'Sin cargo'} · {persona.depto || 'Sin área'}</p>
          <dl className="xa-ficha-datos">
            <div><dt>Código</dt><dd>{persona.codigo}</dd></div>
            <div><dt>Sucursal</dt><dd>{persona.sedeNombre || '—'}</dd></div>
            <div><dt>Ingreso</dt><dd>{fechaCorta(persona.ingreso)}</dd></div>
            <div><dt>Antigüedad</dt><dd>{antiguedad(persona.ingreso)}</dd></div>
            <div><dt>Contrato</dt><dd>{vigente ? MODALIDADES[vigente.modalidad] : 'Sin contrato vigente'}</dd></div>
          </dl>
        </div>
        <div className="xa-ficha-avance">
          <span className="xa-ficha-etq">Completitud documental</span>
          {cerrado
            ? <span className="dc-chip dc-t-gris"><Archive size={12} /> Expediente cerrado</span>
            : <BarraAvance pct={avance.pct} ancho={150} />}
          {!cerrado && avance.pct !== null && <span className="dc-muted xa-ficha-n">{avance.cumplidos} de {avance.total} obligatorios exigibles</span>}
          {!cerrado && (
            <div className="xa-ficha-acc">
              <button type="button" className="pl-btn-new" onClick={() => abrir('cargar', 'nuevo')}>
                <Upload size={14} /> Cargar documento
              </button>
            </div>
          )}
          <div className="xa-ficha-acc">
            <button type="button" className="dc-btn" onClick={descargarExpediente}><Download size={14} /> Descargar expediente</button>
            {!cerrado && (
              <button type="button" className="dc-btn" onClick={() => navigate(`/documentos/emitir?colaborador=${persona.id}`)}>
                <FilePlus2 size={14} /> Emitir
              </button>
            )}
          </div>
        </div>
      </section>

      {cerrado && (
        <div className="xa-cerrado" role="status">
          <Lock size={16} aria-hidden="true" />
          <div>
            <b>Expediente cerrado en solo lectura.</b> {persona.name} ya no forma parte de la empresa: se puede consultar,
            descargar y auditar, pero no cargar ni modificar documentos. Corre la política de retención de cada tipo.
          </div>
        </div>
      )}

      {aviso && <div className="xa-toast" role="status"><Check size={14} /> {aviso}</div>}

      <div className="dc-tabs" role="tablist">
        {PESTANAS.map(({ key, label, Icono }) => {
          const n = { documentos: filas.length, emitidos: susEmitidos.length, contratos: susContratos.length, historial: susEventos.length }[key]
          return (
            <button key={key} type="button" role="tab" aria-selected={pestana === key} className={`dc-tab${pestana === key ? ' on' : ''}`} onClick={() => setPestana(key)}>
              <Icono size={14} aria-hidden="true" /> {label} <span className="dc-tab-n">{n}</span>
            </button>
          )
        })}
      </div>

      {pestana === 'documentos' && (
        <>
          <div className="xa-barra">
            <div className="pl-search-wrap xa-busca">
              <Search size={13} className="pl-search-ico" />
              <input type="search" className="pl-search" placeholder="Buscar en el expediente…" value={busca} onChange={e => setBusca(e.target.value)} aria-label="Buscar en el expediente" />
            </div>
            <div className="xa-filtro-estado">
              <Desplegable
                valor={filtroEstado}
                opciones={[{ valor: '', etiqueta: 'Todos los estados' }, ...Object.keys(ESTADOS).filter(e => cuantos(e)).map(e => ({ valor: e, etiqueta: `${ESTADOS[e].label} (${cuantos(e)})` }))]}
                placeholder="Todos los estados"
                ariaLabel="Filtrar por estado"
                onCambio={setFiltroEstado}
              />
            </div>
          </div>

          {filas.length === 0 ? (
            <div className="dc-tarjeta">
              <Vacio
                Icono={FolderOpen}
                titulo="Este expediente está vacío"
                texto="Esta persona no tiene documentos cargados y ningún conjunto de requisitos la alcanza por su área, cargo o sucursal."
              >
                <button type="button" className="dc-btn" onClick={() => navigate('/documentos/configuracion/requisitos')}>Definir requisitos</button>
                {!cerrado && <button type="button" className="pl-btn-new" onClick={() => abrir('cargar', 'nuevo')}><Upload size={14} /> Cargar documento</button>}
              </Vacio>
            </div>
          ) : grupos.length === 0 ? (
            <div className="dc-tarjeta">
              <Vacio Icono={Search} titulo="Nada coincide con la búsqueda" texto={`Se buscó «${busca}»${filtroEstado ? ` con estado ${ESTADOS[filtroEstado].label}` : ''}.`}>
                <button type="button" className="dc-btn" onClick={() => { setBusca(''); setFiltroEstado('') }}>Limpiar</button>
              </Vacio>
            </div>
          ) : grupos.map(g => (
            <section key={g.tipo.id} className="dc-tarjeta xa-grupo">
              <header className="dc-tarjeta-cab">
                <h2>{g.tipo.nombre}</h2>
                <span className="dc-muted xa-grupo-n">{g.filas.length} {g.filas.length === 1 ? 'documento' : 'documentos'}</span>
              </header>
              <ul className="xa-filas">
                {g.filas.map(f => (
                  <FilaDocumento
                    key={f.key}
                    fila={f}
                    cerrado={cerrado}
                    onVer={() => abrir('doc', f.documento.id)}
                    onCargar={() => abrir('cargar', f.subtipo.id)}
                    onAprobar={() => { revisar(f.documento.id, true); avisar(`«${f.subtipo.nombre}» aprobado: ya cuenta como cumplido.`) }}
                    onRechazar={() => setRechazo(f.documento.id)}
                    onExonerar={() => setExonera(f.subtipo.id)}
                    onPapelera={() => setPapelera(f.documento.id)}
                    onDescargar={() => descargarVersion(persona, f.subtipo, versionActual(f.documento), f.documento, registrarDescarga)}
                  />
                ))}
              </ul>
            </section>
          ))}

          {enPapelera.length > 0 && (
            <section className="dc-tarjeta xa-grupo xa-papelera">
              <header className="dc-tarjeta-cab">
                <h2><Trash2 size={14} aria-hidden="true" /> Papelera</h2>
                <span className="dc-muted xa-grupo-n">Se recuperan durante {parametros.papeleraDias} días</span>
              </header>
              <ul className="xa-filas">
                {enPapelera.map(d => {
                  const s = subtipos.find(x => x.id === d.subtipoId)
                  return (
                    <li key={d.id} className="xa-fila">
                      <div className="xa-fila-doc">
                        <span className="xa-fila-nom">{s?.nombre}</span>
                        <span className="xa-fila-arch">Enviado a la papelera el {fechaCorta(d.eliminado.fecha)} por {d.eliminado.por}: {d.eliminado.motivo}</span>
                      </div>
                      {!cerrado && (
                        <div className="xa-fila-acc">
                          <button type="button" className="dc-btn dc-btn-sm" onClick={() => { recuperarDocumento(d.id); avisar('Documento recuperado.') }}>
                            <Undo2 size={13} /> Recuperar
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </>
      )}

      {pestana === 'emitidos' && (
        <section className="dc-tarjeta">
          <header className="dc-tarjeta-cab">
            <h2>Certificados y memorándums</h2>
            {!cerrado && <button type="button" className="dc-btn dc-btn-sm" onClick={() => navigate(`/documentos/emitir?colaborador=${persona.id}`)}><FilePlus2 size={13} /> Emitir</button>}
          </header>
          {susEmitidos.length === 0 ? (
            <Vacio Icono={FileText} titulo="Todavía no se le emitió nada" texto="Los certificados y memorándums que se emitan para esta persona se archivan aquí solos." />
          ) : (
            <ul className="xa-filas">
              {susEmitidos.map(e => {
                const m = modelos.find(x => x.id === e.modeloId)
                return (
                  <li key={e.id} className="xa-fila">
                    <div className="xa-fila-doc">
                      <span className="xa-fila-nom">{m?.nombre || 'Documento emitido'} {m?.sensible && <SensibilidadChip nivel="confidencial" />}</span>
                      <span className="xa-fila-arch">{e.numero} · {CATEGORIAS[e.categoria]?.label} · emitido el {fechaCorta(e.fecha)} por {e.emitidoPor}</span>
                    </div>
                    <div className="xa-fila-estado"><EstadoEmitidoChip estado={e.estado} /></div>
                    <div className="xa-fila-acc">
                      <button type="button" className="dc-btn dc-btn-sm" onClick={() => navigate(`/documentos/emitir?colaborador=${persona.id}&emitido=${e.id}`)}>
                        <Eye size={13} /> Ver
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      {pestana === 'contratos' && (
        <section className="dc-tarjeta">
          <header className="dc-tarjeta-cab">
            <h2>Contratos y adendas</h2>
            {!cerrado && <button type="button" className="dc-btn dc-btn-sm" onClick={() => navigate(`/documentos/emitir?colaborador=${persona.id}&categoria=contrato`)}><FilePlus2 size={13} /> Registrar contrato</button>}
          </header>
          {susContratos.length === 0 ? (
            <Vacio Icono={FileSignature} titulo="Sin contratos registrados" texto="Un colaborador activo sin contrato vigente es una inconsistencia para Planillas (3.5)." />
          ) : (
            <ul className="xa-filas">
              {susContratos.map(c => (
                <li key={c.id} className="xa-fila xa-fila-link" onClick={() => navigate(`/documentos/contratos/${c.id}`)}>
                  <div className="xa-fila-doc">
                    <span className="xa-fila-nom">{c.tipo === 'adenda' ? 'Adenda' : `Contrato ${MODALIDADES[c.modalidad].toLowerCase()}`}</span>
                    <span className="xa-fila-arch">{c.numero} · desde {fechaCorta(c.inicio)}{c.fin ? ` hasta ${fechaCorta(c.fin)}` : ''} · {c.versiones.length} {c.versiones.length === 1 ? 'versión' : 'versiones'}</span>
                  </div>
                  <div className="xa-fila-estado"><EstadoContratoChip estado={estadoContrato(c, parametros, contratos)} /></div>
                  <div className="xa-fila-acc">
                    <button type="button" className="dc-btn dc-btn-sm" onClick={ev => { ev.stopPropagation(); navigate(`/documentos/contratos/${c.id}`) }}>Abrir</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {pestana === 'historial' && (
        <section className="dc-tarjeta">
          <header className="dc-tarjeta-cab">
            <h2>Historial del expediente</h2>
            <span className="dc-muted xa-grupo-n">Bitácora inmutable: nadie puede editarla ni borrarla (RF-85)</span>
          </header>
          {susEventos.length === 0 ? (
            <Vacio Icono={History} titulo="Sin movimientos todavía" />
          ) : (
            <ol className="xa-linea">
              {susEventos.map(ev => (
                <li key={ev.id} className={`xa-evento xa-ev-${ev.accion}`}>
                  <span className="xa-evento-punto" aria-hidden="true" />
                  <div>
                    <p className="xa-evento-tit"><b>{ACCIONES_BITACORA[ev.accion] || ev.accion}</b> · {ev.detalle}</p>
                    <p className="xa-evento-meta">{fechaCorta(ev.fecha)}{ev.hora ? ` · ${ev.hora}` : ''} · {ev.usuario}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {/* ── MODALES ── */}
      {cargarParam && !cerrado && (
        <CargarDocumentoModal
          persona={persona}
          subtipoInicial={cargarParam === 'nuevo' ? '' : cargarParam}
          onCerrar={() => cerrar('cargar')}
          onCargado={n => avisar(n > 1 ? `${n} documentos cargados.` : 'Documento cargado.')}
        />
      )}

      {filaDoc && (
        <VistaDocumento
          documento={filaDoc}
          persona={persona}
          cerrado={cerrado}
          onCerrar={() => cerrar('doc')}
          onRechazar={() => setRechazo(filaDoc.id)}
          onAprobar={() => { revisar(filaDoc.id, true); avisar('Documento aprobado.') }}
          onRenovar={() => pasarACargar(filaDoc.subtipoId)}
        />
      )}

      {rechazo && (
        <ModalMotivo
          titulo="Rechazar documento"
          Icono={X}
          texto="El motivo le llega al colaborador y queda en la bitácora para siempre. Dígale qué tiene que corregir."
          placeholder="La foto está cortada: no se lee el número de documento."
          accion="Rechazar"
          peligro
          onCerrar={() => setRechazo(null)}
          onConfirmar={m => { revisar(rechazo, false, m); setRechazo(null); avisar('Documento rechazado. Se notificó el motivo.') }}
        />
      )}

      {exonera && (
        <ModalMotivo
          titulo={`Exonerar «${subtipos.find(s => s.id === exonera)?.nombre}»`}
          Icono={ShieldCheck}
          texto="El requisito deja de contar como faltante para esta persona. Queda registrado quién lo exoneró, cuándo y por qué, y eso no se borra (RN-09)."
          placeholder="Extranjero con residencia temporal: presenta pasaporte en lugar de carnet."
          accion="Exonerar"
          onCerrar={() => setExonera(null)}
          onConfirmar={m => { exonerar(persona.id, exonera, m); setExonera(null); avisar('Requisito exonerado.') }}
        />
      )}

      {papelera && (
        <ModalPapelera
          nombre={subtipos.find(s => s.id === documentos.find(d => d.id === papelera)?.subtipoId)?.nombre}
          dias={parametros.papeleraDias}
          onCerrar={() => setPapelera(null)}
          onConfirmar={m => { eliminarDocumento(papelera, m); setPapelera(null); avisar('Enviado a la papelera. Se puede recuperar desde el final de esta página.') }}
        />
      )}
    </div>
  )
}

/* Orden dentro de un tipo: lo que pide atención primero. */
const PRIORIDAD = { vencido: 0, rechazado: 1, faltante: 2, en_revision: 3, por_vencer: 4, vigente: 5, exonerado: 6 }
const orden = f => PRIORIDAD[f.estado] ?? 9

/* ── UNA FILA DEL EXPEDIENTE ─────────────────────────────────────────────── */
function FilaDocumento({ fila, cerrado, onVer, onCargar, onAprobar, onRechazar, onExonerar, onPapelera, onDescargar }) {
  const { subtipo, requisito, documento, estado, limite, exigible, exoneracion } = fila
  const v = versionActual(documento)
  const accion = ACCION[estado]
  const d = v?.vencimiento ? diasHasta(v.vencimiento) : null

  let detalle
  if (estado === 'exonerado') detalle = `Exonerado por ${exoneracion.por} el ${fechaCorta(exoneracion.fecha)}: ${exoneracion.motivo}`
  else if (estado === 'faltante') detalle = limite ? (exigible ? `Debió entregarse hasta el ${fechaCorta(limite)}` : `Plazo hasta el ${fechaCorta(limite)} · aún no descuenta`) : 'Sin plazo'
  else if (estado === 'rechazado') detalle = `Rechazado: ${v.motivoRechazo}`
  else if (v) detalle = `${v.archivo.nombre}${v.v > 1 ? ` · versión ${v.v}` : ''}`

  return (
    <li className={`xa-fila xa-e-${estado}`}>
      <div className="xa-fila-doc">
        <span className="xa-fila-nom">
          {subtipo.nombre}
          <SensibilidadChip nivel={subtipo.sensibilidad} />
          {requisito && !requisito.obligatorio && <span className="xa-opcional">opcional</span>}
          {!requisito && <span className="xa-opcional">no exigido</span>}
        </span>
        <span className="xa-fila-arch" title={v?.archivo?.original ? `Nombre original: ${v.archivo.original}` : undefined}>{detalle}</span>
      </div>
      <div className="xa-fila-estado">
        <EstadoChip estado={estado} />
      </div>
      <div className="xa-fila-venc">
        {v?.vencimiento ? (
          <>
            <span>{fechaCorta(v.vencimiento)}</span>
            {d !== null && <small className={d < 0 ? 'xa-rojo' : d <= 60 ? 'xa-ambar' : ''}>{d < 0 ? `hace ${-d} días` : d === 0 ? 'vence hoy' : `en ${d} días`}</small>}
          </>
        ) : <span className="dc-muted">{v ? 'No vence' : '—'}</span>}
      </div>
      <div className="xa-fila-acc">
        {estado === 'en_revision' && !cerrado && (
          <>
            <button type="button" className="dc-btn dc-btn-sm xa-btn-ok" onClick={onAprobar}><Check size={13} /> Aprobar</button>
            <button type="button" className="dc-btn dc-btn-sm dc-btn-peligro" onClick={onRechazar}><X size={13} /> Rechazar</button>
          </>
        )}
        {accion && !cerrado && (
          <button type="button" className={estado === 'faltante' ? 'pl-btn-new xa-btn-cargar' : 'dc-btn dc-btn-sm'} onClick={onCargar}>
            <accion.Icono size={13} /> {accion.label}
          </button>
        )}
        {documento && (
          <>
            <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={onVer} aria-label={`Ver ${subtipo.nombre}`} title="Ver"><Eye size={14} /></button>
            <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={onDescargar} aria-label={`Descargar ${subtipo.nombre}`} title="Descargar"><Download size={14} /></button>
          </>
        )}
        {!cerrado && requisito && ['faltante', 'vencido', 'rechazado'].includes(estado) && (
          <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={onExonerar} aria-label={`Exonerar ${subtipo.nombre}`} title="Exonerar"><ShieldCheck size={14} /></button>
        )}
        {documento && !cerrado && (
          <button type="button" className="dc-btn dc-btn-sm dc-btn-texto dc-btn-peligro" onClick={onPapelera} aria-label={`Enviar ${subtipo.nombre} a la papelera`} title="Enviar a la papelera"><Trash2 size={14} /></button>
        )}
      </div>
    </li>
  )
}

/* Descargar una versión: el archivo de verdad si se subió en esta demo; si es de los datos de
   ejemplo, una constancia en texto que dice qué se habría bajado. Siempre deja rastro (RF-85). */
async function descargarVersion(persona, subtipo, v, documento, registrarDescarga) {
  if (!v) return
  const archivo = v.archivo?.clave ? await leerArchivo(v.archivo.clave) : null
  if (archivo) {
    const url = URL.createObjectURL(archivo)
    const a = document.createElement('a')
    a.href = url; a.download = v.archivo.nombre; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } else {
    descargarTexto(`${v.archivo.nombre}.txt`, `Muestra de la demo: este documento no tiene archivo real.\n\n${subtipo.nombre} de ${persona.name}\nArchivo: ${v.archivo.nombre}\nNombre original: ${v.archivo.original || '—'}\nVersión ${v.v} · cargada el ${fechaNum(v.fecha)} por ${v.subidoPor}`)
  }
  registrarDescarga('documento', documento.id, persona.id, `Descargó ${v.archivo.nombre} (v${v.v})`, subtipo.sensibilidad === 'confidencial')
}

/* ── VER UN DOCUMENTO (RF-21) ─────────────────────────────────────────────
   Vista previa sin descargar y todas sus versiones: reemplazar no borra (RN-13), así que la
   versión 1 de un carnet renovado sigue ahí, marcada como reemplazada.

   ABRIR UN CONFIDENCIAL DEJA RASTRO aunque no se descargue (RF-90). Se anota al montar, venga de
   un clic o de un enlace con `?doc=`, una sola vez por apertura: la guarda del ref evita el
   doble registro del modo estricto de React. */
function VistaDocumento({ documento, persona, cerrado, onCerrar, onAprobar, onRechazar, onRenovar }) {
  const { subtipos, parametros, registrarDescarga } = useDocumentacion()
  const subtipo = subtipos.find(s => s.id === documento.subtipoId)
  const versiones = [...documento.versiones].reverse()
  const [elegida, setElegida] = useState(versiones[0].v)
  const anotado = useRef(null)
  const v = documento.versiones.find(x => x.v === elegida)
  const estado = estadoVersion(versionActual(documento), subtipo, parametros)
  const confidencial = subtipo?.sensibilidad === 'confidencial'

  useEffect(() => {
    if (!confidencial || anotado.current === documento.id) return
    anotado.current = documento.id
    registrarDescarga('documento', documento.id, persona.id, `Abrió ${subtipo.nombre} (confidencial)`, true)
  }, [confidencial, documento.id, persona.id, subtipo, registrarDescarga])

  const pie = (
    <>
      {estado === 'en_revision' && !cerrado && (
        <>
          <button type="button" className="pl-btn-cancel xa-pie-rechazar" onClick={onRechazar}>Rechazar</button>
          <button type="button" className="pl-btn-save" onClick={() => { onAprobar(); onCerrar() }}>Aprobar</button>
        </>
      )}
      {estado !== 'en_revision' && !cerrado && <button type="button" className="pl-btn-cancel" onClick={onRenovar}><RefreshCw size={13} /> Cargar nueva versión</button>}
      <button type="button" className="pl-btn-save" onClick={() => descargarVersion(persona, subtipo, v, documento, registrarDescarga)}><Download size={13} /> Descargar</button>
    </>
  )

  return (
    <Modal titulo={subtipo?.nombre || 'Documento'} Icono={Eye} onCerrar={onCerrar} pie={pie} ancho={820}>
      <div className="xa-vista">
        <div className="xa-vista-hoja">
          <Previa version={v} persona={persona} subtipo={subtipo} />
        </div>
        <aside className="xa-vista-lado">
          <div className="xa-vista-estado">
            <EstadoChip estado={estado} />
            <SensibilidadChip nivel={subtipo?.sensibilidad} />
          </div>
          <dl className="xa-vista-datos">
            <div><dt>Archivo</dt><dd>{v.archivo.nombre}</dd></div>
            {v.archivo.original && <div><dt>Nombre original</dt><dd>{v.archivo.original}</dd></div>}
            <div><dt>Emisión</dt><dd>{fechaCorta(v.emision)}</dd></div>
            <div><dt>Vencimiento</dt><dd>{v.vencimiento ? fechaCorta(v.vencimiento) : 'No vence'}</dd></div>
            <div><dt>Cargado</dt><dd>{fechaCorta(v.fecha)} · {v.subidoPor} · {v.canal === 'app' ? 'desde la app' : v.canal === 'lote' ? 'por lote' : 'web'}</dd></div>
            {v.info && <div><dt>Información adicional</dt><dd>{v.info}</dd></div>}
            {v.motivoRechazo && <div><dt>Motivo del rechazo</dt><dd className="xa-rojo">{v.motivoRechazo}</dd></div>}
            {v.motivoCambio && <div><dt>Motivo del cambio</dt><dd>{v.motivoCambio}</dd></div>}
            {v.archivo.huella && <div><dt>Huella</dt><dd className="xa-mono">{v.archivo.huella}</dd></div>}
          </dl>
          <h3 className="xa-vista-sub">Versiones</h3>
          <ol className="xa-versiones">
            {versiones.map((x, i) => (
              <li key={x.v}>
                <button type="button" className={x.v === elegida ? 'on' : ''} onClick={() => setElegida(x.v)} aria-pressed={x.v === elegida}>
                  <span className="xa-ver-1"><b>v{x.v}</b> · {fechaCorta(x.fecha)}</span>
                  <span className="xa-ver-2">{i === 0 ? 'Actual' : 'Reemplazada'} · {x.subidoPor}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </Modal>
  )
}

/* La vista previa: el archivo real si se subió en la demo; si no, una hoja de muestra que dice
   que lo es. Un recuadro vacío se leería como un error. */
function Previa({ version, persona, subtipo }) {
  const url = useArchivoLocal(version.archivo?.clave || null)
  if (url) {
    const esPdf = version.archivo.formato === 'pdf' || version.archivo.tipoMime === 'application/pdf'
    return esPdf
      ? <iframe className="xa-previa-pdf" src={url} title={`Vista previa de ${version.archivo.nombre}`} />
      : <img className="xa-previa-img" src={url} alt={`Vista previa de ${version.archivo.nombre}`} />
  }
  return (
    <div className="xa-hoja" aria-label="Hoja de muestra">
      <span className="xa-hoja-sello">Muestra</span>
      <p className="xa-hoja-tit">{subtipo?.nombre}</p>
      <p className="xa-hoja-nom">{persona.name}</p>
      <p className="xa-hoja-doc">{persona.documento}</p>
      <div className="xa-hoja-lineas" aria-hidden="true">
        {[92, 78, 85, 60, 88, 70].map((w, i) => <span key={i} style={{ width: `${w}%` }} />)}
      </div>
      <p className="xa-hoja-pie">
        Emitido {fechaNum(version.emision)}{version.vencimiento ? ` · válido hasta ${fechaNum(version.vencimiento)}` : ''}
      </p>
      <p className="xa-hoja-nota">Documento de los datos de ejemplo: no tiene archivo real. Los que se carguen en esta demo se ven aquí tal cual.</p>
    </div>
  )
}

/* Un motivo obligatorio antes de confirmar: rechazo y exoneración. */
function ModalMotivo({ titulo, Icono, texto, placeholder, accion, peligro, onCerrar, onConfirmar }) {
  const [m, setM] = useState('')
  const [intento, setIntento] = useState(false)
  const ok = m.trim().length >= 5
  const pie = (
    <>
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
      <button type="button" className={`pl-btn-save${peligro ? ' xa-btn-peligro' : ''}`} onClick={() => { setIntento(true); if (ok) onConfirmar(m.trim()) }}>{accion}</button>
    </>
  )
  return (
    <Modal titulo={titulo} Icono={Icono} onCerrar={onCerrar} pie={pie} ancho={480}>
      <p className="xa-modal-txt">{texto}</p>
      <label className="xa-campo">
        <span className="pl-label">Motivo <span className="pl-req" aria-hidden="true">*</span></span>
        <textarea className="pl-input xa-textarea" rows={3} value={m} onChange={e => setM(e.target.value)} placeholder={placeholder} autoFocus />
        {intento && !ok && <small className="xa-rojo">Escriba el motivo (al menos unas palabras).</small>}
      </label>
    </Modal>
  )
}

/* ENVIAR A LA PAPELERA PIDE DOS CONFIRMACIONES Y UN MOTIVO (RF-88), y aun así no borra: el
   documento sale de las vistas y se puede recuperar durante el plazo de la papelera (RF-89). */
function ModalPapelera({ nombre, dias, onCerrar, onConfirmar }) {
  const [m, setM] = useState('')
  const [paso, setPaso] = useState(1)
  const ok = m.trim().length >= 5
  const pie = (
    <>
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
      {paso === 1
        ? <button type="button" className="pl-btn-save xa-btn-peligro" disabled={!ok} onClick={() => setPaso(2)}>Continuar</button>
        : <button type="button" className="pl-btn-save xa-btn-peligro" onClick={() => onConfirmar(m.trim())}>Sí, enviar a la papelera</button>}
    </>
  )
  return (
    <Modal titulo="Enviar a la papelera" Icono={Trash2} onCerrar={onCerrar} pie={pie} ancho={480}>
      {paso === 1 ? (
        <>
          <p className="xa-modal-txt">«{nombre}» dejará de verse en el expediente y dejará de contar para sus requisitos. No se borra: queda en la papelera {dias} días y se puede recuperar.</p>
          <label className="xa-campo">
            <span className="pl-label">¿Por qué se elimina? <span className="pl-req" aria-hidden="true">*</span></span>
            <textarea className="pl-input xa-textarea" rows={3} value={m} onChange={e => setM(e.target.value)} placeholder="Se cargó en el expediente equivocado." autoFocus />
          </label>
        </>
      ) : (
        <div className="xa-confirma">
          <Trash2 size={20} aria-hidden="true" />
          <p><b>¿Confirma que desea enviar «{nombre}» a la papelera?</b></p>
          <p className="dc-muted">Motivo: {m.trim()}</p>
        </div>
      )}
    </Modal>
  )
}
