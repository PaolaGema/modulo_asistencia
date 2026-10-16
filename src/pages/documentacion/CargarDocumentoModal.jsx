import { useMemo, useRef, useState } from 'react'
import { Upload, FileText, Trash2, AlertTriangle, Check, Sparkles, History } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Modal } from '../../components/documentacion/comunes'
import SelectorFecha from '../../components/layout/SelectorFecha'
import { guardarArchivo, nuevaClaveArchivo } from '../../utils/archivosLocales'
import { deducirSubtipo, extensionDe } from '../../components/documentacion/deducir'
import PaginasPdf from '../../components/documentacion/PaginasPdf'
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

const extension = extensionDe

let contador = 0
const nuevoItem = (file, subtipoId, subtipos, sugerido = null) => {
  const sub = subtipos.find(s => s.id === subtipoId)
  const emision = iso(hoy())
  return {
    id: ++contador,
    file,
    subtipoId: subtipoId || '',
    sugerido: subtipoId ? sugerido : null,
    emision,
    vencimiento: sub?.vence ? sumarMeses(emision, sub.vigenciaMeses) : '',
    vencTocado: false,
    info: '',
    motivo: '',
    duplicadoAceptado: false,
  }
}

/* `tipoInicial`: abierto desde una carpeta, la lista se acota a sus documentos —y si tiene uno
   solo, ya viene elegido—. Elegir entre catorce documentos de todas las carpetas cuando se está
   mirando una era la traba más común al cargar. Se puede abrir a todas con un clic. */
/* `archivosIniciales`: los que ya se eligieron fuera —la carga directa desde una carpeta— y no se
   pudieron cargar solos. El formulario abre con ellos puestos, sin volver a pedirlos. */
export default function CargarDocumentoModal({ persona, subtipoInicial = '', tipoInicial = '', archivosIniciales = null, onCerrar, onCargado }) {
  const { tipos, subtipos, documentos, cargarDocumento, checklist } = useDocumentacion()
  const activos = subtipos.filter(s => s.activo && tipos.find(t => t.id === s.tipoId)?.activo)
  const deLaCarpeta = tipoInicial ? activos.filter(s => s.tipoId === tipoInicial) : []
  /* QUÉ DOCUMENTO ES, SIN PREGUNTARLO. En este orden: el que trae quien abrió la carga (la hoja
     «Cargar» de un faltante), el que dice el nombre del archivo («carnet», «croquis», «título»), y
     dentro de una carpeta el primero que le falta. Siempre se ve y se corrige con un clic. */
  const faltantes = tipoInicial
    ? checklist(persona).filter(i => i.subtipo.tipoId === tipoInicial && ['faltante', 'rechazado'].includes(i.estado)).map(i => i.subtipo.id)
    : []
  const candidatos = deLaCarpeta.length ? deLaCarpeta : activos
  const crearItem = f => {
    if (subtipoInicial) return nuevoItem(f, subtipoInicial, subtipos)
    const porNombre = deducirSubtipo(f.name, candidatos)
    if (porNombre) return nuevoItem(f, porNombre, subtipos, 'nombre')
    if (faltantes[0]) return nuevoItem(f, faltantes[0], subtipos, 'falta')
    return nuevoItem(f, deLaCarpeta.length === 1 ? deLaCarpeta[0].id : '', subtipos)
  }

  const [items, setItems] = useState(() => (archivosIniciales || []).map(crearItem))
  const [arrastrando, setArrastrando] = useState(false)
  const [intentado, setIntentado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [soloCarpeta, setSoloCarpeta] = useState(!!tipoInicial)
  const [activoId, setActivoId] = useState(null)
  /* Los enlaces «+ Agregar una nota» y «+ Decir por qué se reemplaza» que ya se abrieron. */
  const [abiertos, setAbiertos] = useState(() => new Set())
  const abrir = k => setAbiertos(prev => new Set(prev).add(k))
  const entrada = useRef(null)

  const docsDePersona = documentos.filter(d => d.colaboradorId === persona.id && !d.eliminado)

  const agregar = lista => {
    const nuevos = [...lista].map(crearItem)
    setItems(prev => [...prev, ...nuevos])
    if (nuevos[0]) setActivoId(nuevos[0].id)
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
    // Un subtipo que soporta varios (títulos, actas de entrega) suma un documento, no reemplaza (RN-02).
    if (subtipos.find(s => s.id === it.subtipoId)?.varios) return null
    const d = docsDePersona.find(x => x.subtipoId === it.subtipoId)
    return d && versionActual(d) ? d : null
  }

  /* EL DUPLICADO AVISA Y NO BLOQUEA (RF-33): quien carga lo ve y decide. Bloquearlo trababa
     justo el caso de quien prueba el sistema subiendo el mismo PDF más de una vez. */
  const bloqueados = items.filter(it => problemasDe(it).length)
  const listo = items.length > 0 && bloqueados.length === 0

  const guardar = async () => {
    setIntentado(true)
    if (!listo || guardando) return
    setGuardando(true)
    for (const it of items) {
      const sub = subtipos.find(s => s.id === it.subtipoId)
      const clave = nuevaClaveArchivo()
      /* Si el navegador no deja guardar el archivo (modo privado, sin espacio), el documento se
         registra igual, sin vista previa: perder la carga entera por eso sería peor. */
      const guardado = await guardarArchivo(clave, it.file).catch(() => false)
      const formato = extension(it.file.name)
      cargarDocumento({
        colaboradorId: persona.id,
        subtipoId: it.subtipoId,
        // El motivo es opcional: sin él queda una nota neutra, y la versión anterior se conserva igual (RN-13).
        motivo: it.motivo.trim() || (reemplazaA(it) ? 'Se cargó una versión nueva' : ''),
        version: {
          archivo: {
            nombre: normalizarNombre(persona, sub, it.emision, formato),
            original: it.file.name,
            formato,
            tamanoKB: Math.round(it.file.size / 1024),
            clave: guardado === false ? null : clave,
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

  /* ── EL FORMULARIO, CON UNA PREGUNTA A LA VEZ ───────────────────────────
     Sin archivos, sólo la zona de arrastre. Con archivos, a la izquierda el archivo tal como es —la
     imagen, la primera página del PDF— y a la derecha lo que hay que decidir, en orden: qué
     documento es, y recién después sus fechas, sólo si las tiene. La nota y el motivo, que casi
     nunca se usan, quedan detrás de un enlace. Con varios archivos, una tira arriba lleva de uno a
     otro y marca cuál está listo. */
  const actual = items.find(it => it.id === activoId) || items[0] || null
  const listos = items.filter(it => !problemasDe(it).length).length

  const subirTodo = () => {
    if (!listo) {
      setIntentado(true)
      if (bloqueados[0]) setActivoId(bloqueados[0].id)
      return
    }
    guardar()
  }

  const pie = items.length ? (
    <>
      <span className="xa-pie-nota">
        {items.length === 1
          ? (listo ? 'Listo para subir' : 'Falta indicar qué documento es')
          : `${listos} de ${items.length} listos`}
      </span>
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
      <button type="button" className="pl-btn-save" onClick={subirTodo} disabled={guardando}>
        {guardando ? 'Subiendo…' : items.length > 1 ? `Subir ${items.length} documentos` : 'Subir documento'}
      </button>
    </>
  ) : (
    <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
  )

  const entradaOculta = (
    <input ref={entrada} type="file" multiple hidden accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
      onChange={e => { const lista = [...(e.target.files || [])]; e.target.value = ''; if (lista.length) agregar(lista) }} />
  )

  if (!actual) {
    return (
      <Modal titulo={`Subir documentos · ${persona.name}`} Icono={Upload} onCerrar={onCerrar} pie={pie} ancho={620}>
        <div
          className={`xs-soltar${arrastrando ? ' on' : ''}`}
          onDragOver={e => { e.preventDefault(); setArrastrando(true) }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={e => { e.preventDefault(); setArrastrando(false); agregar([...e.dataTransfer.files]) }}
          onClick={() => entrada.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); entrada.current?.click() } }}
        >
          <span className="xs-soltar-ico" aria-hidden="true"><Upload size={26} /></span>
          <b>Arrastre los archivos aquí</b>
          <span>o <u>elíjalos de su equipo</u> · PDF o imagen</span>
          {entradaOculta}
        </div>
      </Modal>
    )
  }

  const sub = subtipos.find(s => s.id === actual.subtipoId)
  const probs = problemasDe(actual)
  const dup = duplicadoDe(actual)
  const reemplaza = reemplazaA(actual)
  const errorDe = palabra => (intentado || probs.some(p => p.includes('acepta') || p.includes('máximo'))) && probs.find(p => p.includes(palabra))
  const opciones = tipoInicial && soloCarpeta ? deLaCarpeta : activos
  const grupos = tipos.filter(t => opciones.some(s => s.tipoId === t.id)).map(t => ({ tipo: t, subtipos: opciones.filter(s => s.tipoId === t.id) }))
  const estadoDe = s => {
    if (faltantes.includes(s.id)) return { texto: 'Le falta', tono: 'rojo' }
    if (!s.varios && docsDePersona.some(d => d.subtipoId === s.id)) return { texto: 'Ya tiene uno', tono: 'gris' }
    return null
  }

  return (
    <Modal titulo={items.length > 1 ? `Subir ${items.length} documentos · ${persona.name}` : `Subir documento · ${persona.name}`} Icono={Upload} onCerrar={onCerrar} pie={pie} ancho={940}>
      {entradaOculta}
      {items.length > 1 && (
        <div className="xs-tira" role="tablist" aria-label="Archivos">
          {items.map(it => {
            const ok = !problemasDe(it).length
            return (
              <button key={it.id} type="button" role="tab" aria-selected={it.id === actual.id} className={`xs-tira-item${it.id === actual.id ? ' on' : ''}`} onClick={() => setActivoId(it.id)}>
                <span className={`xs-punto ${ok ? 'ok' : 'falta'}`} aria-hidden="true" />
                <span className="xs-tira-nom">{it.file.name}</span>
                <span className="sr-only">{ok ? 'listo' : 'falta completar'}</span>
              </button>
            )
          })}
          <button type="button" className="xs-tira-mas" onClick={() => entrada.current?.click()}><Upload size={13} /> Agregar más</button>
        </div>
      )}

      <div className="xs-cuerpo">
        <aside className="xs-archivo">
          <VistaArchivo file={actual.file} />
          <div className="xs-archivo-pie">
            <span className="xs-archivo-nom" title={actual.file.name}>{actual.file.name}</span>
            <span className="dc-muted">{tamano(actual.file.size)}</span>
          </div>
          <div className="xs-archivo-acc">
            <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={() => quitar(actual.id)}><Trash2 size={13} /> Quitar</button>
            {items.length === 1 && <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={() => entrada.current?.click()}><Upload size={13} /> Agregar otro</button>}
          </div>
        </aside>

        <section className="xs-preguntas">
          <div className="xs-paso">
            <h3>¿Qué documento es?</h3>
            {actual.sugerido && actual.subtipoId && (
              <p className="xs-pista"><Sparkles size={13} aria-hidden="true" /> {actual.sugerido === 'nombre' ? 'Lo reconocimos por el nombre del archivo.' : 'Es el que le falta en esta carpeta.'} Si no es, elija otro.</p>
            )}
            {grupos.map(g => (
              <div key={g.tipo.id} className="xs-grupo">
                {grupos.length > 1 && <span className="xs-grupo-tit">{g.tipo.nombre}</span>}
                <div className="xs-opciones" role="radiogroup" aria-label={`Documentos de ${g.tipo.nombre}`}>
                  {g.subtipos.map(s => {
                    const est = estadoDe(s)
                    const on = actual.subtipoId === s.id
                    return (
                      <button key={s.id} type="button" role="radio" aria-checked={on} className={`xs-opcion${on ? ' on' : ''}`} onClick={() => cambiar(actual.id, { subtipoId: s.id, sugerido: null })}>
                        <span className="xs-opcion-nom">{s.nombre}</span>
                        {est && <span className={`xs-opcion-est xs-${est.tono}`}>{est.texto}</span>}
                        {on && <Check size={15} className="xs-opcion-ok" aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {tipoInicial && (
              <button type="button" className="xa-enlace-mini" onClick={() => setSoloCarpeta(v => !v)}>
                {soloCarpeta ? 'No está aquí: ver los de todas las carpetas' : 'Ver solo los de esta carpeta'}
              </button>
            )}
            {errorDe('Elija') && <p className="xs-error">Elija qué documento es para poder subirlo.</p>}
            {(errorDe('acepta') || errorDe('máximo')) && <p className="xs-error">{errorDe('acepta') || errorDe('máximo')}</p>}
          </div>

          {sub && (
            <div className="xs-paso">
              {sub.vence ? (
                <>
                  <h3>¿Hasta cuándo es válido?</h3>
                  <div className="xs-fechas">
                    <div className="xa-campo">
                      <span className="pl-label">Emitido el</span>
                      <SelectorFecha valor={actual.emision} onCambio={v => cambiar(actual.id, { emision: v })} ariaLabel="Fecha de emisión" />
                    </div>
                    <div className="xa-campo">
                      <span className="pl-label">Vence el</span>
                      <SelectorFecha valor={actual.vencimiento} onCambio={v => cambiar(actual.id, { vencimiento: v, vencTocado: true })} ariaLabel="Fecha de vencimiento" />
                    </div>
                  </div>
                  {!actual.vencTocado && actual.vencimiento && <p className="xs-ayuda">Lo propusimos: {sub.vigenciaMeses % 12 === 0 ? `${sub.vigenciaMeses / 12} ${sub.vigenciaMeses === 12 ? 'año' : 'años'}` : `${sub.vigenciaMeses} meses`} desde la emisión. Avisaremos antes de que venza.</p>}
                  {(errorDe('vencimiento') || errorDe('emisión') || errorDe('posterior')) && <p className="xs-error">{errorDe('posterior') || errorDe('vencimiento') || errorDe('emisión')}</p>}
                </>
              ) : (
                <div className="xs-linea">
                  <span>Este documento no vence.</span>
                  <span className="xs-linea-fecha">Emitido el <SelectorFecha valor={actual.emision} onCambio={v => cambiar(actual.id, { emision: v })} ariaLabel="Fecha de emisión" /></span>
                </div>
              )}
            </div>
          )}

          {sub && reemplaza && (
            <p className="xs-nota"><History size={13} aria-hidden="true" /> Ya tiene «{sub.nombre}»: este quedará como versión {reemplaza.versiones.length + 1} y el anterior se conserva.</p>
          )}
          {dup && (
            <p className="xs-nota xs-nota-ambar"><AlertTriangle size={13} aria-hidden="true" /> Este mismo archivo ya está en su expediente. Se subirá igual; si fue un error, quítelo.</p>
          )}

          {sub && (
            <div className="xs-extras">
              {abiertos.has(`nota-${actual.id}`) || actual.info ? (
                <label className="xa-campo">
                  <span className="pl-label">Nota</span>
                  <input className="pl-input" value={actual.info} onChange={e => cambiar(actual.id, { info: e.target.value })} placeholder="Por ejemplo: copia legalizada" autoFocus />
                </label>
              ) : (
                <button type="button" className="xa-enlace-mini" onClick={() => abrir(`nota-${actual.id}`)}>+ Agregar una nota</button>
              )}
              {reemplaza && (abiertos.has(`motivo-${actual.id}`) || actual.motivo ? (
                <label className="xa-campo">
                  <span className="pl-label">Por qué se reemplaza</span>
                  <input className="pl-input" value={actual.motivo} onChange={e => cambiar(actual.id, { motivo: e.target.value })} placeholder="Renovación, original firmado, la anterior era ilegible…" autoFocus />
                </label>
              ) : (
                <button type="button" className="xa-enlace-mini" onClick={() => abrir(`motivo-${actual.id}`)}>+ Decir por qué se reemplaza</button>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  )
}

const tamano = b => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

/* EL ARCHIVO TAL COMO ES, antes de subirlo: la imagen, o la primera página del PDF. Quien sube
   tiene que ver qué está subiendo para decir qué es. La URL del archivo en memoria no se libera al
   desmontar: en desarrollo React monta dos veces y la liberaba antes de dibujarla; son pocos
   archivos y se van al cerrar la pestaña. */
function VistaArchivo({ file }) {
  const url = useMemo(() => URL.createObjectURL(file), [file])
  const ext = extension(file.name)
  if (['jpg', 'png', 'webp', 'gif'].includes(ext)) return <div className="xs-vista"><img src={url} alt={`Vista previa de ${file.name}`} /></div>
  if (ext === 'pdf') return <div className="xs-vista xs-vista-pdf"><PaginasPdf url={url} primera /></div>
  return <div className="xs-vista xs-vista-otro"><FileText size={34} aria-hidden="true" /><b>.{ext}</b><span>Sin vista previa</span></div>
}
