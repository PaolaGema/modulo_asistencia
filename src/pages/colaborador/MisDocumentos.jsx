import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Upload, FolderOpen, MessageSquarePlus, CheckCircle2, Clock, ScrollText, Send, Search, X,
  Flag, Award, Megaphone, Maximize2, Download, History, Plus, FileText,
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { useMisDocumentos, textoMotivo } from '../../hooks/useMisDocumentos'
import { useMiFicha } from '../../hooks/useMiFicha'
import { useFotoPerfil } from '../../hooks/useFotoPerfil'
import { Cabecera, EstadoChip, Etiqueta, EstadoContratoChip, Modal, Vacio } from '../../components/documentacion/comunes'
import { PreviaDocumento, Miniatura } from '../../components/layout/MisDocumentosPhone'
import Desplegable from '../../components/layout/Desplegable'
import {
  fechaCorta, MODALIDADES, TIPOS_SOLICITUD, ESTADOS_SOLICITUD, limiteSolicitud, responderAntes, iso,
} from '../../data/documentacionData'
import HojaEmitido from '../../components/documentacion/HojaEmitido'
import './misDocumentos.css'

/* ── MIS DOCUMENTOS (WEB) ─────────────────────────────────────────────────
   Lo mismo que el celular (`MisDocumentosPhone`), a la escala de la web y decidido en el mismo
   lugar (`useMisDocumentos`). La portada son CARPETAS: arriba, una franja con el avance y lo que
   debe; debajo, «Mis carpetas» —lo suyo— y «De RR.HH.» —certificados, memorándums y otros—.
   Cada carpeta y cada documento son una vista propia, con su dirección (`?carpeta=`, `?doc=`,
   `?de=`), así que el «atrás» del navegador vuelve a donde estaba. Las solicitudes se siguen en
   su propia sección de Zona HR (`MisSolicitudes`); aquí sólo están los atajos para pedir. */

/* Las carpetas de lo recibido las arma `useMisDocumentos` (`md.carpetasRrhh`, `md.carpetaDe`): incluyen los tipos que cree la empresa. */
const SOBRE = {
  certificado: [Award, 'Los certificados que RR.HH. le emitió.', 'Cuando RR.HH. le emita un certificado, llegará aquí.'],
  memorandum: [ScrollText, 'Los memorándums que RR.HH. le envió.', 'No recibió memorándums.'],
  otro: [Megaphone, 'Comunicados, reglamentos y otros documentos de RR.HH.', 'No recibió otros documentos.'],
}
const archivos = n => (n ? `${n} archivo${n === 1 ? '' : 's'}` : 'Vacía')
const sinTildes = t => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const DICHOS = { carnet: 'identidad', ci: 'identidad', cedula: 'identidad', carne: 'identidad', diploma: 'titulo', foto: 'fotografia' }
const AVISO_SOLICITUD = 'Enviado a RR.HH. Siga su avance en Zona HR › Mis solicitudes.'

export default function MisDocumentos() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const md = useMisDocumentos(currentUser.name, 'web')
  const { ficha } = useMiFicha(currentUser.name)
  const fotoUrl = useFotoPerfil(currentUser.name, ficha?.form?.['1.9'], 400)
  const perfil = { url: fotoUrl, archivo: ficha?.form?.['1.9']?.clave ? ficha.form['1.9'] : null }
  const [leyendo, setLeyendo] = useState(null)
  const [pidiendo, setPidiendo] = useState(null)
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 4200)
    return () => clearTimeout(t)
  }, [aviso])

  const ir = p => { setParams(p); document.querySelector('.content-scroll')?.scrollTo(0, 0) }
  const inicio = () => ir({})
  const carpeta = params.get('carpeta'), doc = params.get('doc'), de = params.get('de'), ver = params.get('ver')

  const aZona = (
    <button type="button" className="dc-btn dc-btn-texto md-volver" onClick={() => navigate('/mi-espacio/zona-hr')}>
      <ChevronLeft size={15} aria-hidden="true" /> Zona HR
    </button>
  )
  const aInicio = (
    <button type="button" className="dc-btn dc-btn-texto md-volver" onClick={inicio}>
      <ChevronLeft size={15} aria-hidden="true" /> Mis documentos
    </button>
  )

  if (!md.persona) {
    return (
      <div className="content-scroll">
        {aZona}
        <Cabecera titulo="Mis documentos" />
        <div className="dc-tarjeta">
          <Vacio Icono={FolderOpen} titulo="Su expediente todavía no está en Documentación" texto="RR.HH. aún no abrió su expediente. Cuando lo haga, aquí verá sus documentos y lo que le falte entregar." />
        </div>
      </div>
    )
  }

  const pedir = (tipo, clave) => setPidiendo({ tipo, clave })
  let vista
  if (doc) {
    const x = md.propios.find(d => d.doc.id === doc)
    const tipo = x && md.tiposActivos.find(t => t.id === x.subtipo.tipoId)
    vista = x
      ? <Documento x={x} md={md} perfil={perfil} onAviso={setAviso}
          volver={<button type="button" className="dc-btn dc-btn-texto md-volver" onClick={() => ir({ carpeta: x.subtipo.tipoId })}><ChevronLeft size={15} aria-hidden="true" /> {tipo?.nombre || 'Mis documentos'}</button>} />
      : <>{aInicio}<div className="dc-tarjeta"><Vacio Icono={FolderOpen} titulo="Este documento ya no está" texto="Puede que RR.HH. lo haya quitado de su expediente." /></div></>
  } else if (carpeta === 'contratos') {
    vista = <Contratos md={md} volver={aInicio} onPedirCopia={c => pedir('copia', `c-${c.contrato.id}`)} />
  } else if (carpeta) {
    vista = <Carpeta md={md} tipoId={carpeta} perfil={perfil} volver={aInicio} onAbrir={id => ir({ doc: id })} onAviso={setAviso} />
  } else if (de) {
    vista = <DeRRHH md={md} cat={de} volver={aInicio} onLeer={setLeyendo} onPedir={() => pedir('certificacion')} />
  } else if (ver === 'pendientes') {
    vista = <Pendientes md={md} volver={aInicio} onSubido={setAviso} />
  } else {
    vista = <Portada md={md} volver={aZona} ir={ir} onPedir={() => pedir('certificacion')} />
  }

  return (
    <div className="content-scroll">
      {vista}

      {leyendo && (
        <LeerRecibido r={leyendo} onCerrar={() => setLeyendo(null)}
          onReportar={() => { const id = leyendo.emitido.id; setLeyendo(null); pedir('correccion', id) }} />
      )}
      {pidiendo && (
        <NuevaSolicitud md={md} fijo inicial={pidiendo} onCerrar={() => setPidiendo(null)}
          onEnviada={() => { setPidiendo(null); setAviso(AVISO_SOLICITUD) }} />
      )}

      {aviso && <div className="md-aviso" role="status"><CheckCircle2 size={15} aria-hidden="true" /> {aviso}</div>}
    </div>
  )
}

/* La carpeta dibujada: el amarillo de las carpetas de Windows, igual que en el celular. */
function IconoCarpeta({ size = 40 }) {
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 40 34" aria-hidden="true">
      <path d="M2 6a4 4 0 0 1 4-4h10l4 5h14a4 4 0 0 1 4 4v17a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill="#E8A82A" />
      <path d="M2 12h36v16a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill="#FFCB4C" />
    </svg>
  )
}

/* El mosaico de carpeta también lo usa el expediente de RR.HH. (Expediente.jsx): las dos miradas
   del mismo expediente se ven igual. */
export function Mosaico({ titulo, sub, punto, insignia, onClick }) {
  return (
    <button type="button" className="md-mosaico" onClick={onClick}>
      {punto && <span className={`md-punto md-punto-${punto}`} aria-hidden="true" />}
      {insignia > 0 && <span className="md-insignia" aria-label={`${insignia} pendientes`}>{insignia}</span>}
      <IconoCarpeta />
      <span className="md-mosaico-nom">{titulo}</span>
      <span className="md-mosaico-sub">{sub}</span>
    </button>
  )
}

/* ── PORTADA ── */
function Portada({ md, volver, ir, onPedir }) {
  const [q, setQ] = useState('')
  const total = md.propios.length + md.misContratos.length

  /* Lo más urgente de adentro de cada carpeta: el punto del mosaico y una palabra en su línea. */
  const pista = tipoId => {
    const docs = md.propios.filter(x => x.subtipo.tipoId === tipoId)
    const deben = md.porHacer.filter(p => p.subtipo.tipoId === tipoId)
    const n = e => docs.filter(x => x.estado === e).length
    const c = e => deben.filter(p => p.estado === e).length
    if (c('rechazado')) return [`${c('rechazado')} rechazado${c('rechazado') > 1 ? 's' : ''}`, 'rojo']
    if (n('vencido')) return [`${n('vencido')} vencido${n('vencido') > 1 ? 's' : ''}`, 'rojo']
    if (c('faltante')) return [`falta${c('faltante') > 1 ? 'n' : ''} ${c('faltante')}`, 'ambar']
    if (n('por_vencer')) return [`${n('por_vencer')} por vencer`, 'ambar']
    if (n('en_revision')) return [`${n('en_revision')} en revisión`, 'azul']
    return null
  }
  const vigentes = md.misContratos.filter(c => c.estado === 'vigente').length

  return (
    <>
      {volver}
      <Cabecera titulo="Mis documentos" sub="Su expediente, ordenado por carpetas.">
        <label className="md-buscar">
          <Search size={15} aria-hidden="true" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar: carnet, contrato, certificado…" aria-label="Buscar un documento" />
          {q && <button type="button" onClick={() => setQ('')} aria-label="Borrar la búsqueda"><X size={14} /></button>}
        </label>
      </Cabecera>

      {q.trim() ? <Resultados md={md} q={q} ir={ir} /> : <>
        <Franja md={md} onResolver={() => ir({ ver: 'pendientes' })} />

        <div className="md-seccion"><h2>Mis carpetas</h2><span className="dc-muted">{archivos(total)}</span></div>
        <div className="md-grilla">
          {md.tiposActivos.map(t => {
            const n = md.propios.filter(x => x.subtipo.tipoId === t.id).length
            const p = pista(t.id)
            return <Mosaico key={t.id} titulo={t.nombre} sub={p ? `${archivos(n)} · ${p[0]}` : archivos(n)} punto={p?.[1]} onClick={() => ir({ carpeta: t.id })} />
          })}
          <Mosaico titulo="Contratos" onClick={() => ir({ carpeta: 'contratos' })}
            sub={vigentes ? `${vigentes} vigente${vigentes > 1 ? 's' : ''}` : archivos(md.misContratos.length)} />
        </div>

        <div className="md-seccion"><h2>De RR.HH.</h2><span className="dc-muted">Lo que la empresa le envió</span></div>
        <div className="md-grilla">
          {md.carpetasRrhh.map(([cat, nombre]) => {
            const lista = md.recibidos.filter(x => md.carpetaDe(x.emitido) === cat)
            return <Mosaico key={cat} titulo={nombre} onClick={() => ir({ de: cat })} sub={archivos(lista.length)} />
          })}
        </div>

        <button type="button" className="md-atajo" onClick={onPedir}>
          <MessageSquarePlus size={16} aria-hidden="true" />
          <span>Pedir un certificado</span>
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </>}
    </>
  )
}

/* La franja oscura: el avance en un anillo y, si debe algo, cuánto y de qué tipo. */
function Franja({ md, onResolver }) {
  const n = md.porHacer.length
  const { pct, cumplidos, total } = md.avance
  const c = e => md.porHacer.filter(p => p.estado === e).length
  const partes = [
    c('rechazado') && `${c('rechazado')} rechazado${c('rechazado') > 1 ? 's' : ''}`,
    c('vencido') && `${c('vencido')} vencido${c('vencido') > 1 ? 's' : ''}`,
    c('faltante') && `${c('faltante')} falta${c('faltante') > 1 ? 'n' : ''}`,
    c('por_vencer') && `${c('por_vencer')} por vencer`,
  ].filter(Boolean)
  const [titulo, sub] = n
    ? [`${n} documento${n === 1 ? '' : 's'} por entregar`, partes.join(' · ')]
    : md.enRevision.length
      ? [`${md.enRevision.length} en revisión`, 'RR.HH. los está mirando. No tiene que hacer nada.']
      : ['Está al día', 'No le falta entregar nada.']
  const p = pct ?? 100
  return (
    <div className="md-franja">
      <span className="md-anillo" style={{ '--p': `${p}%` }} aria-label={total ? `${cumplidos} de ${total} requisitos al día` : 'Al día'}>
        <span>{total ? `${cumplidos}/${total}` : <CheckCircle2 size={16} />}</span>
      </span>
      <div className="md-franja-txt">
        <b>{titulo}</b>
        <span>{sub}</span>
      </div>
      {(n > 0 || md.enRevision.length > 0) && (
        <button type="button" className={n ? 'md-franja-btn' : 'md-franja-btn md-franja-btn-suave'} onClick={onResolver}>{n ? 'Resolver' : 'Ver'}</button>
      )}
    </div>
  )
}

function Resultados({ md, q, ir }) {
  const t = sinTildes(q.trim())
  const dicho = t.length > 1 && Object.entries(DICHOS).find(([k]) => k.startsWith(t) || t.startsWith(k))?.[1]
  const hay = (...xs) => xs.some(x => sinTildes(x).includes(t) || (dicho && sinTildes(x).includes(dicho)))
  const docs = md.propios.filter(x => hay(x.nombre, x.subtipo.nombre, x.subtipo.persona, x.version?.archivo?.nombre))
  const contratos = md.misContratos.filter(c => hay(c.nombre, c.contrato.numero, 'contrato'))
  const recibidos = md.recibidos.filter(r => hay(r.nombre, r.emitido.numero))
  const n = docs.length + contratos.length + recibidos.length
  if (!n) return <div className="dc-tarjeta"><Vacio Icono={Search} titulo="No encontramos nada" texto={`Ningún documento suyo se llama «${q.trim()}».`} /></div>
  return (
    <section className="dc-tarjeta">
      <div className="dc-tarjeta-cab"><h2>{n === 1 ? '1 resultado' : `${n} resultados`}</h2></div>
      {docs.map(x => (
        <button key={x.doc.id} type="button" className="md-fila md-fila-btn" onClick={() => ir({ doc: x.doc.id })}>
          <span className="md-fila-ico"><FileText size={16} aria-hidden="true" /></span>
          <span className="md-fila-txt"><span className="md-fila-nom">{x.nombre}</span><span className="md-fila-sub">{md.tiposActivos.find(tp => tp.id === x.subtipo.tipoId)?.nombre}</span></span>
          <EstadoChip estado={x.estado} /><ChevronRight size={15} className="md-flecha" aria-hidden="true" />
        </button>
      ))}
      {contratos.map(c => (
        <button key={c.contrato.id} type="button" className="md-fila md-fila-btn" onClick={() => ir({ carpeta: 'contratos' })}>
          <span className="md-fila-ico"><ScrollText size={16} aria-hidden="true" /></span>
          <span className="md-fila-txt"><span className="md-fila-nom">{c.nombre}</span><span className="md-fila-sub">Contratos · {c.contrato.numero}</span></span>
          <ChevronRight size={15} className="md-flecha" aria-hidden="true" />
        </button>
      ))}
      {recibidos.map(r => (
        <button key={r.emitido.id} type="button" className="md-fila md-fila-btn" onClick={() => ir({ de: md.carpetaDe(r.emitido) })}>
          <span className="md-fila-ico"><Award size={16} aria-hidden="true" /></span>
          <span className="md-fila-txt"><span className="md-fila-nom">{r.nombre}</span><span className="md-fila-sub">De RR.HH. · {r.emitido.numero}</span></span>
          <ChevronRight size={15} className="md-flecha" aria-hidden="true" />
        </button>
      ))}
    </section>
  )
}

/* El botón que elige el archivo y lo envía en el mismo gesto: las fechas las revisa RR.HH. */
function BotonSubir({ p, md, onSubido, texto, suave }) {
  const input = useRef(null)
  const [error, setError] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const elegir = async e => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setSubiendo(true)
    const err = await md.subir(p, file)
    setSubiendo(false)
    setError(err || '')
    if (!err) onSubido?.()
  }
  return (
    <span className="md-subir">
      <input ref={input} type="file" hidden accept={p.subtipo.formatos.map(f => `.${f}`).join(',')} onChange={elegir} />
      <button type="button" className={suave ? 'dc-btn' : 'pl-btn-new md-btn-sm'} disabled={subiendo} onClick={() => input.current?.click()}>
        <Upload size={14} aria-hidden="true" /> {subiendo ? 'Enviando…' : texto || p.accion || 'Subir'}
      </button>
      {error && <span className="md-error" role="alert">{error}</span>}
    </span>
  )
}

/* ── UNA CARPETA ── */
function Carpeta({ md, tipoId, perfil, volver, onAbrir, onAviso }) {
  const tipo = md.tiposActivos.find(t => t.id === tipoId)
  const [subiendo, setSubiendo] = useState(false)
  if (!tipo) return <>{volver}<div className="dc-tarjeta"><Vacio Icono={FolderOpen} titulo="Esta carpeta no está disponible" /></div></>
  const docs = md.propios.filter(x => x.subtipo.tipoId === tipoId).sort((a, b) => ((a.version?.fecha || '') < (b.version?.fecha || '') ? 1 : -1))
  const faltan = md.porHacer.filter(p => p.subtipo.tipoId === tipoId && !p.doc)
  const subibles = md.subibles.filter(s => s.tipoId === tipoId)
  const enviado = () => onAviso('Enviado. Quedó en revisión hasta que RR.HH. lo apruebe.')
  return (
    <>
      {volver}
      <Cabecera titulo={tipo.nombre} sub={docs.length ? archivos(docs.length) : 'Todavía no hay archivos en esta carpeta.'}>
        {subibles.length > 0 && <button type="button" className="pl-btn-new" onClick={() => setSubiendo(true)}><Plus size={15} aria-hidden="true" /> Subir a esta carpeta</button>}
      </Cabecera>
      <div className="md-col">
        {faltan.length > 0 && (
          <section className="dc-tarjeta md-faltan">
            <div className="dc-tarjeta-cab"><h2>Le falta entregar</h2></div>
            {faltan.map(p => (
              <div key={p.clave} className="md-fila">
                <span className="md-fila-ico md-ico-por_vencer"><Upload size={16} aria-hidden="true" /></span>
                <span className="md-fila-txt"><span className="md-fila-nom">{p.subtipo.persona}</span><span className="md-fila-sub">{textoMotivo(p)}</span></span>
                {p.subeEl ? <BotonSubir p={p} md={md} onSubido={enviado} /> : <span className="dc-muted md-lo-hace">Lo carga RR.HH.</span>}
              </div>
            ))}
          </section>
        )}
        {docs.length > 0 ? (
          <section className="dc-tarjeta">
            {docs.map(x => (
              <button key={x.doc.id} type="button" className="md-fila md-fila-btn" onClick={() => onAbrir(x.doc.id)}>
                <span className="md-mini"><Miniatura x={x} perfil={perfil} tono="azul" /></span>
                <span className="md-fila-txt">
                  <span className="md-fila-nom">{x.nombre}</span>
                  <span className="md-fila-sub">{x.version?.fecha ? `Subido el ${fechaCorta(x.version.fecha)}` : x.version?.archivo?.nombre}{x.version?.vencimiento ? ` · vence el ${fechaCorta(x.version.vencimiento)}` : ''}</span>
                </span>
                {x.estado !== 'vigente' && <EstadoChip estado={x.estado} />}
                <ChevronRight size={15} className="md-flecha" aria-hidden="true" />
              </button>
            ))}
          </section>
        ) : !faltan.length && (
          <div className="dc-tarjeta"><Vacio Icono={FolderOpen} titulo="Carpeta vacía" texto={subibles.length ? 'Use «Subir a esta carpeta» para entregar un documento.' : 'Los documentos de esta carpeta los carga RR.HH.; cuando lo haga, aparecerán aquí.'} /></div>
        )}
      </div>
      {subiendo && <ElegirSubir md={md} tipoId={tipoId} onCerrar={() => setSubiendo(false)} onSubido={() => { setSubiendo(false); enviado() }} />}
    </>
  )
}

/* Qué va a subir a esta carpeta: lo que le piden primero; lo que ya tiene se reemplaza. */
function ElegirSubir({ md, tipoId, onCerrar, onSubido }) {
  const lista = md.subibles.filter(s => s.tipoId === tipoId)
  const comoPendiente = s => md.porHacer.find(p => p.subtipo.id === s.id) || (() => {
    const ya = !s.varios && md.propios.find(x => x.subtipo.id === s.id)
    return { subtipo: s, doc: ya ? ya.doc : null, estado: ya ? ya.estado : 'faltante', accion: 'Subir', ya: !!ya }
  })()
  const orden = [...lista].sort((a, b) => md.porHacer.some(p => p.subtipo.id === b.id) - md.porHacer.some(p => p.subtipo.id === a.id))
  return (
    <Modal titulo="Subir un documento" Icono={Upload} onCerrar={onCerrar} ancho={560} pie={<button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cerrar</button>}>
      <p className="md-modal-txt">Elija qué va a entregar. Lo que envía queda en revisión hasta que RR.HH. lo apruebe.</p>
      <div className="md-lista-subir">
        {orden.map(s => {
          const p = comoPendiente(s)
          const pedido = md.porHacer.some(q => q.subtipo.id === s.id)
          return (
            <div key={s.id} className="md-fila">
              <span className="md-fila-txt">
                <span className="md-fila-nom">{s.persona}{pedido && <Etiqueta tono="ambar"> RR.HH. se lo pide</Etiqueta>}</span>
                <span className="md-fila-sub">{p.ya ? 'Ya lo tiene; lo que suba lo reemplaza.' : `${s.formatos.map(f => f.toUpperCase()).join(', ')} · hasta ${s.tamanoMaxMB} MB`}</span>
              </span>
              <BotonSubir p={p} md={md} suave={!pedido} onSubido={onSubido} />
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

/* ── UN DOCUMENTO: la vista previa grande a la izquierda y sus datos a la derecha ── */
function Documento({ x, md, perfil, volver, onAviso }) {
  const [grande, setGrande] = useState(false)
  const { doc, subtipo, version: v, estado } = x
  const desdePerfil = subtipo.id === 's-foto' && perfil.archivo && !v?.archivo?.clave
  const archivo = desdePerfil ? { nombre: perfil.archivo.nombre, tamanoKB: perfil.archivo.peso ? Math.round(perfil.archivo.peso / 1024) : null } : v?.archivo
  const muestra = !v?.archivo?.clave && subtipo.id !== 's-foto'
  const accion = { rechazado: 'Volver a subir', vencido: 'Renovar', por_vencer: 'Renovar' }[estado] || 'Subir una versión nueva'
  const datos = [
    ['Documento', subtipo.nombre],
    v?.emision && ['Emitido el', fechaCorta(v.emision)],
    v?.vencimiento && ['Vence el', fechaCorta(v.vencimiento)],
    desdePerfil ? ['Cambiada', 'Desde su perfil'] : v?.fecha && ['Subido el', `${fechaCorta(v.fecha)}${v.canal === 'app' ? ' · desde el celular' : v.subidoPor ? ` · ${v.subidoPor}` : ''}`],
    archivo?.nombre && ['Archivo', `${archivo.nombre}${archivo.tamanoKB ? ` · ${archivo.tamanoKB} KB` : ''}`],
  ].filter(Boolean)
  const versiones = [...(doc.versiones || [])].reverse()
  const descargar = async () => {
    if (subtipo.id === 's-foto' && !v?.archivo?.clave) { window.open(perfil.url, '_blank', 'noopener'); return }
    const ok = await md.abrir(v, doc.id)
    if (!ok) onAviso('No se pudo abrir el archivo en este navegador.')
  }
  return (
    <>
      {volver}
      <div className="md-doc">
        <div className="md-doc-previa">
          <button type="button" className="md-previa" onClick={() => setGrande(true)} aria-label="Ver en grande">
            <div className="md-zoom"><PreviaDocumento x={x} md={md} perfil={perfil} alto={230} /></div>
          </button>
          <div className="md-previa-pie">
            <span className="dc-muted">{muestra ? 'Vista de ejemplo. El original lo guarda RR.HH.' : subtipo.id === 's-foto' ? 'Es la foto de su perfil.' : archivo?.formato === 'pdf' ? 'PDF' : 'Imagen'}</span>
            <button type="button" className="dc-btn dc-btn-sm" onClick={() => setGrande(true)}><Maximize2 size={13} aria-hidden="true" /> Ver en grande</button>
            {!muestra && <button type="button" className="dc-btn dc-btn-sm" onClick={descargar}><Download size={13} aria-hidden="true" /> Descargar</button>}
          </div>
        </div>

        <div className="md-doc-info">
          <h1 className="md-doc-nom">{x.nombre}</h1>
          <EstadoChip estado={estado} />
          {estado === 'rechazado' && v?.motivoRechazo && <p className="md-nota md-nota-rojo"><b>RR.HH. lo rechazó:</b> {v.motivoRechazo}</p>}
          {estado === 'en_revision' && <p className="md-nota md-nota-azul">RR.HH. lo está revisando. Cuenta cuando lo apruebe.</p>}

          <section className="dc-tarjeta md-datos">
            {datos.map(([k, val]) => <div key={k}><span>{k}</span><b>{val}</b></div>)}
          </section>

          {versiones.length > 1 && (
            <section className="dc-tarjeta">
              <div className="dc-tarjeta-cab"><h2>Versiones</h2></div>
              {versiones.map((ver, i) => (
                <div key={ver.v} className="md-fila">
                  <span className="md-fila-ico"><History size={15} aria-hidden="true" /></span>
                  <span className="md-fila-txt"><span className="md-fila-nom">Versión {ver.v}{i === 0 ? ' · la actual' : ''}</span><span className="md-fila-sub">{fechaCorta(ver.fecha)}{ver.motivoCambio ? ` · ${ver.motivoCambio}` : ''}</span></span>
                </div>
              ))}
            </section>
          )}

          {subtipo.editableColab && estado !== 'en_revision' && <BotonSubir p={{ subtipo, doc, estado }} md={md} texto={accion} onSubido={() => onAviso('Enviado. Quedó en revisión.')} />}
          {!subtipo.editableColab && <p className="dc-muted md-nota-suave">Este documento lo carga RR.HH.</p>}
        </div>
      </div>

      {grande && (
        <Modal titulo={x.nombre} Icono={FileText} onCerrar={() => setGrande(false)} ancho={760} pie={<button type="button" className="pl-btn-cancel" onClick={() => setGrande(false)}>Cerrar</button>}>
          <div className="md-grande"><div className="md-zoom md-zoom-grande"><PreviaDocumento x={x} md={md} perfil={perfil} grande /></div></div>
        </Modal>
      )}
    </>
  )
}

/* ── POR ENTREGAR ── */
function Pendientes({ md, volver, onSubido }) {
  return (
    <>
      {volver}
      <Cabecera titulo="Por entregar" sub="Lo que RR.HH. necesita de usted, lo más urgente primero." />
      <div className="md-col">
        {!md.porHacer.length && !md.enRevision.length && (
          <div className="dc-tarjeta"><Vacio Icono={CheckCircle2} titulo="No tiene nada pendiente" texto="Todo lo que RR.HH. le pidió está entregado y al día. Si algo vence, se lo avisaremos aquí." /></div>
        )}
        {md.porHacer.length > 0 && (
          <section className="dc-tarjeta">
            <div className="dc-tarjeta-cab"><h2>Para entregar</h2><span className="dc-muted md-cab-nota">Lo que sube queda en revisión hasta que RR.HH. lo apruebe.</span></div>
            {md.porHacer.map(p => (
              <div key={p.clave} className="md-fila">
                <span className={`md-fila-ico md-ico-${p.estado}`}><FileText size={16} aria-hidden="true" /></span>
                <span className="md-fila-txt">
                  <span className="md-fila-nom">{p.nombre || p.subtipo.persona}{!p.obligatorio && p.estado === 'faltante' && <span className="dc-muted md-opcional"> · opcional</span>}</span>
                  <span className="md-fila-sub">{textoMotivo(p)}</span>
                </span>
                <EstadoChip estado={p.estado} />
                {p.subeEl
                  ? <BotonSubir p={p} md={md} onSubido={() => onSubido(`Envió ${p.subtipo.persona.charAt(0).toLowerCase()}${p.subtipo.persona.slice(1)}. Quedó en revisión.`)} />
                  : <span className="dc-muted md-lo-hace">Lo gestiona RR.HH.</span>}
              </div>
            ))}
          </section>
        )}
        {md.enRevision.length > 0 && (
          <section className="dc-tarjeta">
            <div className="dc-tarjeta-cab"><h2>En revisión</h2><span className="dc-muted md-cab-nota">Ya los entregó. No tiene que hacer nada más.</span></div>
            {md.enRevision.map(x => (
              <div key={x.doc.id} className="md-fila">
                <span className="md-fila-ico"><Clock size={16} aria-hidden="true" /></span>
                <span className="md-fila-txt"><span className="md-fila-nom">{x.subtipo.persona}</span><span className="md-fila-sub">Lo envió el {fechaCorta(x.version.fecha)} · {x.version.archivo?.original || x.version.archivo?.nombre}</span></span>
                <EstadoChip estado="en_revision" />
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  )
}

/* ── CONTRATOS ── */
function Contratos({ md, volver, onPedirCopia }) {
  return (
    <>
      {volver}
      <Cabecera titulo="Contratos" sub="Sus contratos. Los firma en RR.HH., que guarda el original." />
      {!md.misContratos.length ? (
        <div className="dc-tarjeta"><Vacio Icono={ScrollText} titulo="Todavía no hay contratos" texto="Cuando RR.HH. registre su contrato, lo verá aquí." /></div>
      ) : (
        <section className="dc-tarjeta">
          {md.misContratos.map(c => (
            <div key={c.contrato.id} className="md-fila">
              <span className="md-fila-ico"><ScrollText size={16} aria-hidden="true" /></span>
              <span className="md-fila-txt">
                <span className="md-fila-nom">{c.nombre}</span>
                <span className="md-fila-sub">{c.contrato.numero} · {MODALIDADES[c.contrato.modalidad] || ''} · desde el {fechaCorta(c.contrato.inicio)}{c.contrato.fin ? ` hasta el ${fechaCorta(c.contrato.fin)}` : ''}</span>
              </span>
              <EstadoContratoChip estado={c.estado} />
              <button type="button" className="dc-btn dc-btn-sm" onClick={() => onPedirCopia(c)}>Pedir una copia</button>
            </div>
          ))}
        </section>
      )}
    </>
  )
}

/* ── DE RR.HH.: certificados, memorándums u otros ── */
function DeRRHH({ md, cat, volver, onLeer, onPedir }) {
  const lista = md.recibidos.filter(x => md.carpetaDe(x.emitido) === cat)
  const [Icono, sub, vacio] = SOBRE[cat] || SOBRE.otro
  return (
    <>
      {volver}
      <Cabecera titulo={md.carpetasRrhh.find(([k]) => k === cat)?.[1] || 'De RR.HH.'} sub={sub}>
        {cat === 'certificado' && <button type="button" className="pl-btn-new" onClick={onPedir}><Plus size={15} aria-hidden="true" /> Pedir un certificado</button>}
      </Cabecera>
      {!lista.length ? (
        <div className="dc-tarjeta"><Vacio Icono={Icono} titulo="Todavía no hay nada aquí" texto={vacio} /></div>
      ) : (
        <section className="dc-tarjeta">
          {lista.map(r => (
            <button key={r.emitido.id} type="button" className="md-fila md-fila-btn" onClick={() => onLeer(r)}>
              <span className="md-fila-ico"><Icono size={16} aria-hidden="true" /></span>
              <span className="md-fila-txt"><span className="md-fila-nom">{r.nombre}</span><span className="md-fila-sub">{r.emitido.numero} · {fechaCorta(r.emitido.fecha)}</span></span>
              <ChevronRight size={15} className="md-flecha" aria-hidden="true" />
            </button>
          ))}
        </section>
      )}
    </>
  )
}

/* Ya no se confirma la recepción (16 oct 2026): el documento se lee y, si tiene un error, se reporta. */
export function LeerRecibido({ r, onCerrar, onReportar }) {
  return (
    <Modal titulo={`${r.nombre} · ${r.emitido.numero}`} Icono={ScrollText} onCerrar={onCerrar} ancho={640} pie={(
      <>
        {onReportar && <button type="button" className="dc-btn md-reportar" onClick={onReportar}><Flag size={14} aria-hidden="true" /> Reportar un error</button>}
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cerrar</button>
      </>
    )}>
      {r.emitido.archivo ? <HojaEmitido emitido={r.emitido} /> : <pre className="md-hoja">{r.texto}</pre>}
    </Modal>
  )
}

/* ── PEDIR ──
   Qué pide, cuál y para qué. Desde un atajo (`fijo`) llega con el tipo decidido —un certificado,
   la copia de ese contrato, el error de ese documento— y no se lo vuelve a preguntar. */
const QUE_PIDE = {
  certificacion: { label: 'Un certificado', titulo: 'Pedir un certificado', desc: 'De trabajo, o de trabajo con sueldo.', pregunta: '¿Qué certificado necesita?', detalle: '¿Para qué lo necesita? (opcional)' },
  copia: { label: 'Copia del contrato', titulo: 'Pedir una copia', desc: 'De su contrato.', pregunta: '¿De qué contrato?', detalle: '¿Para qué la necesita? (opcional)' },
  correccion: { label: 'Corregir algo que recibí', titulo: 'Reportar un error', desc: 'Un certificado o memorándum con un error.', pregunta: '¿Qué documento tiene el error?', detalle: '¿Qué está mal?' },
}

export function NuevaSolicitud({ md, inicial, fijo, onCerrar, onEnviada }) {
  const [tipo, setTipo] = useState(inicial?.tipo || 'certificacion')
  const [clave, setClave] = useState(inicial?.clave || '')
  const [detalle, setDetalle] = useState('')
  const opciones = useMemo(() => md.opciones[tipo] || [], [md.opciones, tipo])
  const opcion = opciones.find(o => o.clave === clave)
  const q = QUE_PIDE[tipo]
  const listo = !!opcion && (tipo !== 'correccion' || detalle.trim().length > 3)
  const enviar = () => { if (!listo) return; md.solicitar({ tipo, opcion, detalle }); onEnviada() }
  return (
    <Modal titulo={fijo ? q.titulo : 'Nueva solicitud'} Icono={tipo === 'correccion' ? Flag : MessageSquarePlus} onCerrar={onCerrar} pie={(
      <>
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="pl-btn-save" disabled={!listo} onClick={enviar}><Send size={14} aria-hidden="true" /> Enviar a RR.HH.</button>
      </>
    )}>
      {!fijo && (
        <div className="md-tipos" role="radiogroup" aria-label="Qué necesita">
          {Object.entries(QUE_PIDE).map(([k, t]) => (
            <button key={k} type="button" role="radio" aria-checked={tipo === k} className={`md-tipo${tipo === k ? ' on' : ''}`} onClick={() => { setTipo(k); setClave(''); setDetalle('') }}>
              <b>{t.label}</b><span>{t.desc}</span>
            </button>
          ))}
        </div>
      )}
      <p className="md-modal-txt">RR.HH. le responde dentro de {md.plazoSolicitud} {md.plazoSolicitud === 1 ? 'día hábil' : 'días hábiles'}: a más tardar el {fechaCorta(responderAntes(iso(new Date()), md.plazoSolicitud))}. Su avance se sigue en Zona HR › Mis solicitudes.</p>
      <label className="pl-label">{q.pregunta}</label>
      {opciones.length
        ? <Desplegable valor={clave} onCambio={setClave} ariaLabel={q.pregunta} placeholder="Elija una opción" opciones={opciones.map(o => ({ valor: o.clave, etiqueta: o.nombre }))} />
        : <p className="dc-muted md-sin-opciones">{tipo === 'correccion' ? 'Todavía no recibió documentos que se puedan corregir.' : 'No hay opciones disponibles por ahora.'}</p>}
      <label className="pl-label" style={{ marginTop: 14 }}>{q.detalle}</label>
      <textarea className="pl-input" rows={3} value={detalle} onChange={e => setDetalle(e.target.value)} placeholder={tipo === 'correccion' ? 'Por ejemplo: mi segundo apellido figura mal escrito.' : 'Por ejemplo: para la apertura de una cuenta en el banco.'} />
    </Modal>
  )
}

/* ── MIS SOLICITUDES (WEB) ───────────────────────────────────────────────
   Su propia sección en Zona HR, como en el celular: lo que pidió a RR.HH. y en qué va, con su
   recorrido en tres pasos. Hoy son certificados, copias del contrato y correcciones; mañana,
   vacaciones, permisos o anticipos. */
const ICONO_SOLICITUD = { certificacion: Award, copia: ScrollText, correccion: Flag }

export function MisSolicitudes() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const md = useMisDocumentos(currentUser.name, 'web')
  const [vista, setVista] = useState('curso')
  const [pidiendo, setPidiendo] = useState(false)
  const [leyendo, setLeyendo] = useState(null)
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 4200)
    return () => clearTimeout(t)
  }, [aviso])

  const volver = (
    <button type="button" className="dc-btn dc-btn-texto md-volver" onClick={() => navigate('/mi-espacio/zona-hr')}>
      <ChevronLeft size={15} aria-hidden="true" /> Zona HR
    </button>
  )
  if (!md.persona) {
    return (
      <div className="content-scroll">
        {volver}
        <Cabecera titulo="Mis solicitudes" />
        <div className="dc-tarjeta"><Vacio Icono={MessageSquarePlus} titulo="Todavía no puede hacer solicitudes" texto="Cuando RR.HH. abra su expediente, podrá pedir certificados y seguir sus pedidos aquí." /></div>
      </div>
    )
  }

  const enCurso = md.misSolicitudes.filter(q => q.estado === 'pendiente')
  const resueltas = md.misSolicitudes.filter(q => q.estado !== 'pendiente')
  const lista = vista === 'curso' ? enCurso : resueltas
  return (
    <div className="content-scroll">
      {volver}
      <Cabecera titulo="Mis solicitudes" sub="Lo que pidió a RR.HH. y en qué va.">
        <button type="button" className="pl-btn-new" onClick={() => setPidiendo(true)}><Plus size={15} aria-hidden="true" /> Nueva solicitud</button>
      </Cabecera>

      <div className="dc-tabs md-tabs" role="tablist">
        {[['curso', 'En curso', enCurso.length], ['resueltas', 'Resueltas', resueltas.length]].map(([k, t, n]) => (
          <button key={k} type="button" role="tab" aria-selected={vista === k} className={`dc-tab${vista === k ? ' on' : ''}`} onClick={() => setVista(k)}>
            {t} {n > 0 && <span className="dc-tab-n">{n}</span>}
          </button>
        ))}
      </div>

      {!lista.length ? (
        <div className="dc-tarjeta">
          <Vacio Icono={MessageSquarePlus} titulo={vista === 'curso' ? 'No tiene pedidos en curso' : 'Todavía no hay pedidos resueltos'}
            texto={vista === 'curso' ? 'Pida un certificado, la copia de su contrato o la corrección de un documento.' : 'Cuando RR.HH. responda sus pedidos, quedarán aquí.'}>
            {vista === 'curso' && <button type="button" className="pl-btn-new" onClick={() => setPidiendo(true)}><Plus size={15} aria-hidden="true" /> Nueva solicitud</button>}
          </Vacio>
        </div>
      ) : (
        <div className="md-solicitudes">
          {lista.map(q => <TarjetaSolicitud key={q.id} q={q} md={md} onLeer={setLeyendo} />)}
        </div>
      )}
      <p className="dc-muted md-pronto">Pronto podrá pedir aquí también vacaciones, permisos y anticipos.</p>

      {pidiendo && <NuevaSolicitud md={md} onCerrar={() => setPidiendo(false)} onEnviada={() => { setPidiendo(false); setVista('curso'); setAviso('Solicitud enviada a RR.HH.') }} />}
      {leyendo && <LeerRecibido r={leyendo} onCerrar={() => setLeyendo(null)} />}
      {aviso && <div className="md-aviso" role="status"><CheckCircle2 size={15} aria-hidden="true" /> {aviso}</div>}
    </div>
  )
}

function TarjetaSolicitud({ q, md, onLeer }) {
  const Icono = ICONO_SOLICITUD[q.tipo] || MessageSquarePlus
  const resuelta = q.estado !== 'pendiente'
  const rechazada = q.estado === 'rechazada'
  const pasos = [
    ['Enviada', fechaCorta(q.fecha), true],
    ['En RR.HH.', resuelta ? 'Revisada' : `Responde hasta el ${fechaCorta(limiteSolicitud(q))}`, true],
    [rechazada ? 'Rechazada' : 'Atendida', resuelta ? fechaCorta(q.resuelto?.fecha) : '—', resuelta],
  ]
  const r = md.recibidos.find(x => x.emitido.id === q.resuelto?.emitidoId)
  return (
    <section className="dc-tarjeta md-sol">
      <div className="md-sol-cab">
        <span className="md-fila-ico"><Icono size={16} aria-hidden="true" /></span>
        <div className="md-fila-txt">
          <span className="md-fila-nom">{q.asunto}</span>
          <span className="md-fila-sub">{TIPOS_SOLICITUD[q.tipo]?.singular}{q.detalle ? ` · «${q.detalle}»` : ''}</span>
        </div>
        <Etiqueta tono={ESTADOS_SOLICITUD[q.estado]?.tono}>{ESTADOS_SOLICITUD[q.estado]?.label}</Etiqueta>
      </div>
      <ol className="md-pasos">
        {pasos.map(([t, f, hecho], i) => (
          <li key={t} className={`${hecho ? 'hecho' : ''}${i === 2 && rechazada ? ' rechazo' : ''}`}>
            <span className="md-paso-punto" aria-hidden="true" />
            <b>{t}</b><span>{f}</span>
          </li>
        ))}
      </ol>
      {q.resuelto?.nota && <p className={`md-respuesta md-resp-${q.estado}`}><b>RR.HH.:</b> {q.resuelto.nota}</p>}
      {r && <button type="button" className="pl-btn-new md-btn-sm md-sol-ver" onClick={() => onLeer(r)}><FileText size={14} aria-hidden="true" /> Ver el documento</button>}
    </section>
  )
}
