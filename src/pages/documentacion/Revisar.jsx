import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, CheckCircle2, Download, FileImage, FileText, FolderOpen, Search, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import SelectorFecha from '../../components/layout/SelectorFecha'
import { Cabecera, PersonaCelda } from '../../components/documentacion/comunes'
import { diasHasta, fechaCorta, versionActual } from '../../data/documentacionData'
import { Previa, descargarVersion } from './Expediente'
import './expediente.css'
import './revisar.css'

/* ── REVISAR DOCUMENTOS: BANDEJA DE TRES COLUMNAS (propuesta AD, 15 oct 2026) ──
   Una pantalla propia, como un correo: a la izquierda la cola —lo que más espera arriba, con su
   miniatura y los días en color—; al centro, el documento grande; a la derecha, sus datos, las
   fechas para corregir y la decisión. Se ve el conjunto y el detalle a la vez.

   LO RESUELTO NO DESAPARECE DE LA COLA mientras dura la sesión: queda marcado con ✓ o ✕, así se
   ve cuánto se avanzó. Al decidir se pasa solo al siguiente pendiente.

   RECHAZAR DE UN TOQUE. Los motivos de siempre están a mano y uno solo rechaza con ese texto, que
   es lo que el colaborador lee en Mis documentos; para otro motivo se escribe. Atajos: A aprueba,
   ↑ ↓ recorren la cola. Lo que se subió sin clasificar no se revisa acá: se ordena en el
   expediente de su dueño. */

const MOTIVOS = [
  { corto: 'No se lee', texto: () => 'No se lee bien. Vuelva a tomar la foto con buena luz y de frente.' },
  { corto: 'Se ve cortado', texto: () => 'La imagen está cortada: tiene que verse el documento completo.' },
  { corto: 'No es este documento', texto: s => `No es ${(s?.persona || 'el documento pedido').replace(/^(Su|El|La) /, m => m.toLowerCase())}. Suba el correcto.` },
  { corto: 'Está vencido', texto: () => 'El documento está vencido. Suba uno vigente.' },
]
const sinTildes = t => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const esImagen = v => ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes((v?.archivo?.formato || '').toLowerCase())

export default function Revisar() {
  const { personas, documentos, subtipos, sinClasificar, revisar, cambiarFechas, registrarDescarga } = useDocumentacion()
  const navigate = useNavigate()

  const porId = useMemo(() => new Map(personas.map(p => [p.id, p])), [personas])
  const pendientes = useMemo(() => documentos
    .filter(d => !d.eliminado && versionActual(d)?.revision === 'pendiente' && porId.has(d.colaboradorId))
    .map(d => ({ clave: d.id, doc: d, version: versionActual(d), persona: porId.get(d.colaboradorId), subtipo: subtipos.find(s => s.id === d.subtipoId) }))
    .sort((a, b) => ((a.version.fecha || '') < (b.version.fecha || '') ? -1 : 1)), [documentos, porId, subtipos])
  const nSinClasificar = sinClasificar.filter(x => porId.has(x.colaboradorId)).length

  /* La cola como estaba al entrar: lo que se resuelve queda en su lugar, marcado. */
  const [orden] = useState(() => pendientes)
  const [decisiones, setDecisiones] = useState({})
  const [elegido, setElegido] = useState(() => pendientes[0]?.clave || null)
  const [busca, setBusca] = useState('')
  const [aviso, setAviso] = useState(null)

  const t = sinTildes(busca.trim())
  const visibles = orden.filter(x => !t || sinTildes(`${x.persona.name} ${x.subtipo?.nombre}`).includes(t))
  const actual = orden.find(x => x.clave === elegido) || null
  const restantes = orden.filter(x => !decisiones[x.clave])
  const hechos = orden.length - restantes.length
  const masAntiguo = restantes[0] ? Math.max(0, -diasHasta(restantes[0].version.fecha)) : 0

  const resolver = (ok, m) => {
    if (!actual || decisiones[actual.clave]) return
    revisar(actual.doc.id, ok, m)
    const nuevas = { ...decisiones, [actual.clave]: ok ? 'ok' : 'no' }
    setDecisiones(nuevas)
    setAviso(ok ? `Aprobado: ${actual.subtipo?.nombre} de ${actual.persona.name}.` : `Rechazado. ${actual.persona.name.split(' ')[0]} verá el motivo en Mis documentos.`)
    // El siguiente pendiente después de este; si no hay, el primero que quede.
    const i = orden.findIndex(x => x.clave === actual.clave)
    const sig = [...orden.slice(i + 1), ...orden.slice(0, i)].find(x => !nuevas[x.clave])
    setElegido(sig?.clave || actual.clave)
  }
  const mover = paso => {
    if (!visibles.length) return
    const i = visibles.findIndex(x => x.clave === elegido)
    const n = Math.min(visibles.length - 1, Math.max(0, i + paso))
    setElegido(visibles[n].clave)
  }

  useEffect(() => {
    if (!aviso) return
    const id = setTimeout(() => setAviso(null), 3200)
    return () => clearTimeout(id)
  }, [aviso])

  useEffect(() => {
    const tecla = e => {
      if (e.target.closest?.('textarea, input, select, [aria-haspopup], .pl-dropdown-menu, .pl-modal')) return
      if (e.key === 'a' || e.key === 'A') resolver(true)
      else if (e.key === 'ArrowDown') { e.preventDefault(); mover(1) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mover(-1) }
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  })

  return (
    <div className="content-scroll rv-pagina">
      <Link to="/documentos/expedientes" className="xc-volver"><ArrowLeft size={13} aria-hidden="true" /> Expedientes</Link>
      <Cabecera titulo="Revisar documentos" sub="Lo que los colaboradores subieron desde Mis documentos. No cuenta hasta que se aprueba.">
        <span className="rv-resumen">
          {restantes.length
            ? <><b>{restantes.length}</b> pendiente{restantes.length === 1 ? '' : 's'}{masAntiguo > 0 && ` · el más antiguo, hace ${masAntiguo} día${masAntiguo === 1 ? '' : 's'}`}</>
            : 'Nada pendiente'}
          {hechos > 0 && <> · <span className="rv-n-ok">{hechos} revisado{hechos === 1 ? '' : 's'}</span></>}
        </span>
      </Cabecera>

      {!orden.length ? (
        <div className="rv-vacio">
          <CheckCircle2 size={44} aria-hidden="true" />
          <h2>No hay nada por revisar</h2>
          <p>{nSinClasificar ? `Hay ${nSinClasificar} archivo${nSinClasificar === 1 ? '' : 's'} sin clasificar: se ordenan en el expediente de cada persona.` : 'Lo que los colaboradores suban desde Mis documentos aparecerá aquí, lo más antiguo primero.'}</p>
        </div>
      ) : (
        <div className="rv-bandeja">
          {/* ── LA COLA ── */}
          <aside className="rv-cola" aria-label="Documentos por revisar">
            <label className="rv-buscar">
              <Search size={14} aria-hidden="true" />
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar persona o documento…" aria-label="Buscar en la cola" />
            </label>
            <div className="rv-cola-lista" role="listbox">
              {visibles.map(x => {
                const d = decisiones[x.clave]
                const espera = Math.max(0, -diasHasta(x.version.fecha))
                const Icono = esImagen(x.version) ? FileImage : FileText
                return (
                  <button key={x.clave} type="button" role="option" aria-selected={elegido === x.clave}
                    className={`rv-item${elegido === x.clave ? ' on' : ''}${d ? ` hecho rv-item-${d}` : ''}`} onClick={() => setElegido(x.clave)}>
                    <span className="rv-mini">{d === 'ok' ? <Check size={16} /> : d === 'no' ? <X size={16} /> : <Icono size={16} />}</span>
                    <span className="rv-item-txt">
                      <b>{x.subtipo?.nombre || 'Documento'}</b>
                      <span>{x.persona.name}</span>
                      <span className={d ? '' : espera >= 7 ? 'rv-rojo' : espera >= 3 ? 'rv-ambar' : ''}>
                        {d === 'ok' ? 'Aprobado' : d === 'no' ? 'Rechazado' : espera ? `hace ${espera} día${espera === 1 ? '' : 's'}` : 'hoy'}
                      </span>
                    </span>
                  </button>
                )
              })}
              {!visibles.length && <p className="rv-nada">Nada coincide con «{busca.trim()}».</p>}
            </div>
          </aside>

          {/* ── EL DOCUMENTO ── */}
          <div className="rv-escena">
            {actual && <div className="rv-papel" key={actual.clave}><Previa version={actual.version} persona={actual.persona} subtipo={actual.subtipo} /></div>}
          </div>

          {/* ── LOS DATOS Y LA DECISIÓN ── */}
          {actual && <Decision key={actual.clave} item={actual} decision={decisiones[actual.clave]}
            onAprobar={() => resolver(true)} onRechazar={m => resolver(false, m)}
            onFechas={(e, v) => { cambiarFechas(actual.doc.id, { emision: e, vencimiento: v }); setAviso('Fechas corregidas.') }}
            onDescargar={() => descargarVersion(actual.persona, actual.subtipo, actual.version, actual.doc, registrarDescarga)}
            onExpediente={() => navigate(`/documentos/expedientes/${actual.persona.id}`)} />}
        </div>
      )}

      {aviso && <div className="rv-aviso" role="status"><CheckCircle2 size={15} aria-hidden="true" /> {aviso}</div>}
    </div>
  )
}

function Decision({ item, decision, onAprobar, onRechazar, onFechas, onDescargar, onExpediente }) {
  const { version: v, subtipo, persona } = item
  const [emision, setEmision] = useState(v.emision || '')
  const [vencimiento, setVencimiento] = useState(v.vencimiento || '')
  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const fechasCambiaron = emision !== (v.emision || '') || vencimiento !== (v.vencimiento || '')
  return (
    <section className="rv-panel" aria-label="Documento elegido">
      <div>
        <h2 className="rv-panel-tit">{subtipo?.nombre || 'Documento'}</h2>
        <PersonaCelda persona={persona} size={32} sub={`${persona.cargo || 'Sin cargo'} · ${persona.sedeNombre || ''}`} />
      </div>
      <dl className="rv-datos">
        <div><dt>Subido</dt><dd>{fechaCorta(v.fecha)}{v.canal === 'app' ? ' · celular' : v.canal === 'web' ? ' · web' : ''}</dd></div>
        <div><dt>Archivo</dt><dd>{(v.archivo?.formato || '').toUpperCase() || '—'}{v.archivo?.tamanoKB ? ` · ${v.archivo.tamanoKB} KB` : ''}</dd></div>
      </dl>
      <div className="rv-fechas">
        <label>Emitido el<SelectorFecha valor={emision} onCambio={setEmision} ariaLabel="Fecha de emisión" /></label>
        {subtipo?.vence && <label>Vence el<SelectorFecha valor={vencimiento} onCambio={setVencimiento} ariaLabel="Fecha de vencimiento" /></label>}
        {fechasCambiaron && <button type="button" className="dc-btn dc-btn-sm" onClick={() => onFechas(emision, vencimiento)}><Check size={12} aria-hidden="true" /> Guardar fechas</button>}
        <p>El colaborador sube sin poner fechas: corríjalas si el documento es de antes.</p>
      </div>
      <div className="rv-herr">
        <button type="button" onClick={onDescargar}><Download size={13} aria-hidden="true" /> Descargar</button>
        <button type="button" onClick={onExpediente}><FolderOpen size={13} aria-hidden="true" /> Su expediente</button>
      </div>

      <div className="rv-decidir">
        {decision ? (
          <p className={`rv-hecho rv-hecho-${decision}`}>{decision === 'ok' ? <><Check size={15} /> Aprobado</> : <><X size={15} /> Rechazado</>}</p>
        ) : rechazando ? (
          <>
            <span className="rv-rot">Rechazar porque…</span>
            {/* Un motivo rápido escribe su texto en el campo —se puede ajustar— y se confirma con
                «Rechazar»: nada se rechaza con un solo toque por error. */}
            <div className="rv-motivos">
              {MOTIVOS.map(m => {
                const texto = m.texto(subtipo)
                return (
                  <button key={m.corto} type="button" className={motivo === texto ? 'on' : ''} aria-pressed={motivo === texto} onClick={() => setMotivo(texto)} title={texto}>{m.corto}</button>
                )
              })}
            </div>
            <textarea rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Elija un motivo o escríbalo con sus palabras…" aria-label="Motivo del rechazo" />
            <div className="rv-botones">
              <button type="button" className="pl-btn-cancel" onClick={() => setRechazando(false)}>Cancelar</button>
              <button type="button" className="rv-btn-rechazar-ok" disabled={motivo.trim().length < 5} onClick={() => onRechazar(motivo.trim())}>Rechazar</button>
            </div>
          </>
        ) : (
          <>
            <button type="button" className="rv-btn-aprobar" onClick={onAprobar}><Check size={16} aria-hidden="true" /> Aprobar</button>
            <button type="button" className="rv-btn-rechazar" onClick={() => setRechazando(true)}><X size={15} aria-hidden="true" /> Rechazar…</button>
          </>
        )}
      </div>
    </section>
  )
}
