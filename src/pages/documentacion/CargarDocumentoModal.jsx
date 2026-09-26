import { useRef, useState } from 'react'
import { Upload, FileText, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Modal } from '../../components/documentacion/comunes'
import Desplegable from '../../components/layout/Desplegable'
import SelectorFecha from '../../components/layout/SelectorFecha'
import { guardarArchivo, nuevaClaveArchivo } from '../../utils/archivosLocales'
import { normalizarNombre, sumarMeses, iso, hoy, versionActual } from '../../data/documentacionData'

/* ── CARGAR DOCUMENTOS (pantalla 6 · RF-26 a RF-28, RF-33, RN-03) ──────────
   Uno o varios archivos a la vez: cada archivo soltado es una tarjeta con su subtipo, sus fechas y
   su nota, y se guardan todos de una pasada (RF-28). Diez carnets no obligan a llenar el
   formulario diez veces.

   SE VALIDA ANTES DE SUBIR, NO DESPUÉS (RF-04). El formato y el tamaño se comparan contra el
   subtipo en el momento de soltar, y otra vez si se cambia el subtipo: un .exe en un subtipo que
   acepta PDF e imagen se ve rechazado en la tarjeta, no al final después de esperar.

   SI EL SUBTIPO VENCE, LA FECHA DE VENCIMIENTO ES OBLIGATORIA (RN-03), y se propone sola a partir
   de la emisión y la vigencia (RF-03). Sin fecha no hay alerta posible, y el documento entraría
   como falsamente cumplido para siempre.

   Lo que carga RR.HH. entra aprobado; lo que sube el colaborador entra en revisión (RF-31), pero
   eso ocurre en la app, no acá. */

const extension = nombre => {
  const e = String(nombre).split('.').pop().toLowerCase()
  return e === 'jpeg' ? 'jpg' : e
}

let contador = 0
const nuevoItem = (file, subtipoId, subtipos) => {
  const sub = subtipos.find(s => s.id === subtipoId)
  const emision = iso(hoy())
  return {
    id: ++contador,
    file,
    subtipoId: subtipoId || '',
    emision,
    vencimiento: sub?.vence ? sumarMeses(emision, sub.vigenciaMeses) : '',
    vencTocado: false,
    info: '',
    motivo: '',
    duplicadoAceptado: false,
  }
}

export default function CargarDocumentoModal({ persona, subtipoInicial = '', onCerrar, onCargado }) {
  const { tipos, subtipos, documentos, cargarDocumento } = useDocumentacion()
  const [items, setItems] = useState([])
  const [arrastrando, setArrastrando] = useState(false)
  const [intentado, setIntentado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const entrada = useRef(null)

  const activos = subtipos.filter(s => s.activo && tipos.find(t => t.id === s.tipoId)?.activo)
  const opcionesSubtipo = tipos.filter(t => t.activo).flatMap(t =>
    activos.filter(s => s.tipoId === t.id).map(s => ({ valor: s.id, etiqueta: `${t.nombre} · ${s.nombre}` })))

  const docsDePersona = documentos.filter(d => d.colaboradorId === persona.id && !d.eliminado)

  const agregar = lista => {
    const nuevos = [...lista].map(f => nuevoItem(f, subtipoInicial, subtipos))
    setItems(prev => [...prev, ...nuevos])
  }

  const cambiar = (id, cambios) => setItems(prev => prev.map(it => {
    if (it.id !== id) return it
    const next = { ...it, ...cambios }
    /* El vencimiento se vuelve a proponer si cambia el subtipo o la emisión, mientras nadie lo
       haya escrito a mano: si alguien lo corrigió, manda lo que escribió. */
    if (('subtipoId' in cambios || 'emision' in cambios) && !next.vencTocado) {
      const sub = subtipos.find(s => s.id === next.subtipoId)
      next.vencimiento = sub?.vence && next.emision ? sumarMeses(next.emision, sub.vigenciaMeses) : ''
    }
    return next
  }))

  const quitar = id => setItems(prev => prev.filter(it => it.id !== id))

  /* Lo que está mal en una tarjeta, en palabras. Vacío = se puede guardar. */
  const problemasDe = it => {
    const sub = subtipos.find(s => s.id === it.subtipoId)
    const p = []
    if (!sub) { p.push('Elija qué documento es.'); return p }
    const ext = extension(it.file.name)
    if (!sub.formatos.includes(ext)) p.push(`«${sub.nombre}» acepta ${sub.formatos.map(f => f.toUpperCase()).join(', ')}; este archivo es .${ext}.`)
    const mb = it.file.size / 1024 / 1024
    if (mb > sub.tamanoMaxMB) p.push(`Pesa ${mb.toFixed(1)} MB y el máximo para este documento es ${sub.tamanoMaxMB} MB.`)
    if (!it.emision) p.push('Falta la fecha de emisión.')
    if (sub.vence && !it.vencimiento) p.push('Este documento vence: la fecha de vencimiento es obligatoria.')
    if (it.vencimiento && it.emision && it.vencimiento <= it.emision) p.push('El vencimiento tiene que ser posterior a la emisión.')
    if (reemplazaA(it) && !it.motivo.trim()) p.push('Escriba el motivo del reemplazo: la versión anterior se conserva y el motivo queda en el historial.')
    return p
  }

  /* RF-33: el mismo archivo —mismo nombre original y mismo peso— ya está en este expediente. */
  const duplicadoDe = it => {
    const kb = Math.round(it.file.size / 1024)
    for (const d of docsDePersona) {
      for (const v of d.versiones) {
        if (v.archivo?.original === it.file.name && Math.abs((v.archivo?.tamanoKB || 0) - kb) <= 1) return { d, v }
      }
    }
    return null
  }

  /* Si ya hay un documento de ese subtipo, la carga es una versión nueva (RN-13): lo anterior no
     se pierde, pero hay que decir por qué se cambia. */
  const reemplazaA = it => {
    // Un subtipo que soporta varios (vacunas, cursos) suma un documento, no reemplaza (RN-02).
    if (subtipos.find(s => s.id === it.subtipoId)?.varios) return null
    const d = docsDePersona.find(x => x.subtipoId === it.subtipoId)
    return d && versionActual(d) ? d : null
  }

  const bloqueados = items.filter(it => problemasDe(it).length || (duplicadoDe(it) && !it.duplicadoAceptado))
  const listo = items.length > 0 && bloqueados.length === 0

  const guardar = async () => {
    setIntentado(true)
    if (!listo || guardando) return
    setGuardando(true)
    for (const it of items) {
      const sub = subtipos.find(s => s.id === it.subtipoId)
      const clave = nuevaClaveArchivo()
      await guardarArchivo(clave, it.file)
      const formato = extension(it.file.name)
      cargarDocumento({
        colaboradorId: persona.id,
        subtipoId: it.subtipoId,
        motivo: it.motivo.trim(),
        version: {
          archivo: {
            nombre: normalizarNombre(persona, sub, it.emision, formato),
            original: it.file.name,
            formato,
            tamanoKB: Math.round(it.file.size / 1024),
            clave,
            tipoMime: it.file.type,
          },
          emision: it.emision,
          vencimiento: it.vencimiento || null,
          info: it.info.trim(),
        },
      })
    }
    setGuardando(false)
    onCargado?.(items.length)
    onCerrar()
  }

  const pie = (
    <>
      {items.length > 0 && (
        <span className="xa-pie-nota">
          {bloqueados.length && intentado
            ? `${bloqueados.length} ${bloqueados.length === 1 ? 'archivo necesita' : 'archivos necesitan'} corrección`
            : `${items.length} ${items.length === 1 ? 'archivo' : 'archivos'} para cargar`}
        </span>
      )}
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
      <button type="button" className="pl-btn-save" onClick={guardar} disabled={!items.length || guardando}>
        {guardando ? 'Guardando…' : items.length > 1 ? `Cargar ${items.length} documentos` : 'Cargar documento'}
      </button>
    </>
  )

  return (
    <Modal titulo={`Cargar documento · ${persona.name}`} Icono={Upload} onCerrar={onCerrar} pie={pie} ancho={680}>
      <div
        className={`xa-soltar${arrastrando ? ' on' : ''}`}
        onDragOver={e => { e.preventDefault(); setArrastrando(true) }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={e => { e.preventDefault(); setArrastrando(false); agregar(e.dataTransfer.files) }}
        onClick={() => entrada.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); entrada.current?.click() } }}
      >
        <Upload size={22} aria-hidden="true" />
        <p><b>Arrastre aquí uno o varios archivos</b> o haga clic para elegirlos</p>
        <span>Cada archivo se clasifica por separado antes de guardar</span>
        <input
          ref={entrada}
          type="file"
          multiple
          hidden
          onChange={e => { agregar(e.target.files); e.target.value = '' }}
        />
      </div>

      {items.map(it => {
        const sub = subtipos.find(s => s.id === it.subtipoId)
        const probs = problemasDe(it)
        const dup = duplicadoDe(it)
        const reemplaza = reemplazaA(it)
        const mostrarProbs = intentado || probs.some(p => p.includes('acepta') || p.includes('máximo'))
        return (
          <div key={it.id} className={`xa-item${mostrarProbs && probs.length ? ' con-error' : ''}`}>
            <div className="xa-item-cab">
              <FileText size={16} aria-hidden="true" />
              <span className="xa-item-nom" title={it.file.name}>{it.file.name}</span>
              <span className="dc-muted xa-item-peso">{(it.file.size / 1024).toFixed(0)} KB</span>
              <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={() => quitar(it.id)} aria-label={`Quitar ${it.file.name}`}>
                <Trash2 size={13} />
              </button>
            </div>
            <div className="xa-item-campos">
              <div className="xa-campo xa-campo-ancho">
                <span className="pl-label">Documento</span>
                <Desplegable
                  valor={it.subtipoId}
                  opciones={opcionesSubtipo}
                  placeholder="Tipo · subtipo"
                  ariaLabel="Tipo y subtipo del documento"
                  onCambio={v => cambiar(it.id, { subtipoId: v })}
                />
              </div>
              <div className="xa-campo">
                <span className="pl-label">Fecha de emisión</span>
                <SelectorFecha valor={it.emision} onCambio={v => cambiar(it.id, { emision: v })} ariaLabel="Fecha de emisión" />
              </div>
              <div className="xa-campo">
                <span className="pl-label">
                  Vencimiento{sub?.vence ? <span className="pl-req" aria-hidden="true"> *</span> : <span className="dc-muted"> (no vence)</span>}
                </span>
                {sub?.vence
                  ? <SelectorFecha valor={it.vencimiento} onCambio={v => cambiar(it.id, { vencimiento: v, vencTocado: true })} ariaLabel="Fecha de vencimiento" />
                  : <div className="xa-campo-nulo">—</div>}
                {sub?.vence && !it.vencTocado && it.vencimiento && (
                  <small className="xa-ayuda">Propuesta: {sub.vigenciaMeses} meses desde la emisión.</small>
                )}
              </div>
              <label className="xa-campo xa-campo-ancho">
                <span className="pl-label">Información adicional</span>
                <input className="pl-input" value={it.info} onChange={e => cambiar(it.id, { info: e.target.value })} placeholder="Opcional" />
              </label>
              {reemplaza && (
                <label className="xa-campo xa-campo-ancho">
                  <span className="pl-label">Motivo del reemplazo <span className="pl-req" aria-hidden="true">*</span></span>
                  <input
                    className="pl-input"
                    value={it.motivo}
                    onChange={e => cambiar(it.id, { motivo: e.target.value })}
                    placeholder="Renovación, se cargó el original firmado, la anterior estaba ilegible…"
                  />
                  <small className="xa-ayuda">Ya existe «{sub?.nombre}» en este expediente: se guardará como versión {reemplaza.versiones.length + 1} y la anterior seguirá descargable.</small>
                </label>
              )}
            </div>
            {dup && (
              <div className="xa-aviso">
                <AlertTriangle size={14} aria-hidden="true" />
                <span>Este archivo ya está en el expediente ({dup.v.archivo.nombre}, cargado el {dup.v.fecha}).</span>
                {it.duplicadoAceptado
                  ? <span className="xa-aviso-ok"><CheckCircle2 size={13} /> Se cargará igual</span>
                  : (
                    <span className="xa-aviso-acc">
                      <button type="button" className="dc-btn dc-btn-sm" onClick={() => cambiar(it.id, { duplicadoAceptado: true })}>Cargar igual</button>
                      <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={() => quitar(it.id)}>Cancelar este</button>
                    </span>
                  )}
              </div>
            )}
            {mostrarProbs && probs.length > 0 && (
              <ul className="xa-probs">
                {probs.map(p => <li key={p}>{p}</li>)}
              </ul>
            )}
          </div>
        )
      })}
    </Modal>
  )
}
