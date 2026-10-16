import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, CircleCheck, FileText, Search, Send, Upload, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import Avatar from '../../components/personas/Avatar'
import Desplegable from '../../components/layout/Desplegable'
import { tiposDoc } from '../../data/documentacionData'
import { emisible, esAdenda } from './emisionUtil'
import { guardarArchivo, nuevaClaveArchivo } from '../../utils/archivosLocales'
import { extensionDe } from '../../components/documentacion/deducir'
import PanelEmision from './PanelEmision'
import './emision.css'

/* ── EMITIR, EN UNA SOLA PANTALLA CON RIEL (propuesta AM, 15 oct 2026) ──────
   Los tres pasos —documento, para quién, enviar— eran tres pantallas que se reemplazaban: para
   cambiar de plantilla había que volver atrás y perder lo elegido. Ahora todo está a la vista:
   1 A LA IZQUIERDA, EL RIEL: cada familia con su punto de color y su flecha para desplegar
      sus plantillas, con cuántas veces se emitió cada una.
   2 AL CENTRO, LA HOJA tal como va a salir, con los datos de quien se está viendo.
   3 A LA DERECHA, PARA QUIÉN: personas sueltas, o UN GRUPO —una sucursal, una unidad
      organizacional o un cargo— con su lista para desmarcar a quien no va. Abajo, el botón.
   Lo elegido en «Para quién» se conserva al cambiar de plantilla.

   UN CONTRATO ES DE UNA SOLA PERSONA: lleva sus fechas y su decisión sobre el contrato anterior.
   Con un contrato no hay grupo, y elegir a otra persona la reemplaza.

   LO QUE LLEGA EN LA URL se respeta: `?modelo=…` abre esa plantilla, `?colaborador=…` (uno o
   varios ids separados por coma) pone a las personas, `?categoria=…` abre esa familia y
   `?origen=…`, desde la ficha de un contrato, abre la adenda para renovarlo. */
const PARA_VACIO = { pestana: 'personas', ids: [] }

const DESCRIPCION = {
  certificado: 'Lo que la persona presenta afuera',
  memorandum: 'Felicitaciones y llamadas de atención',
  contrato: 'Indefinido, plazo fijo y adendas',
  otro: 'Otros documentos con plantilla',
}

export default function Emitir() {
  const { modelos, personas, contratos } = useDocumentacion()
  const [params, setParams] = useSearchParams()
  const origen = contratos.find(c => c.id === params.get('origen')) || null
  const listos = modelos.filter(emisible)
  const modeloId = params.get('modelo') === 'archivo' ? 'archivo'
    : listos.find(m => m.id === params.get('modelo'))?.id || (origen ? listos.find(esAdenda)?.id || '' : '')
  const modelo = listos.find(m => m.id === modeloId) || null
  const unaSola = modelo?.categoria === 'contrato'

  const [para, setPara] = useState(() => {
    const ids = origen ? [origen.colaboradorId] : (params.get('colaborador') || '').split(',').map(Number).filter(id => personas.some(p => p.id === id))
    return { ...PARA_VACIO, ids }
  })
  /* El archivo propio no cabe en la URL: vive acá mientras se elige a quién. */
  const [archivo, setArchivo] = useState(null)
  const [hecho, setHecho] = useState(false)

  const elegir = id => {
    const m = listos.find(x => x.id === id)
    /* Pasar a un contrato deja una sola persona y sin grupo. */
    if (m?.categoria === 'contrato') setPara(p => ({ ...PARA_VACIO, ids: p.ids.slice(0, 1) }))
    setParams(id ? { modelo: id } : {})
  }
  const reiniciar = () => { setHecho(false); setArchivo(null); setPara(PARA_VACIO); setParams({}) }

  return (
    <div className="content-scroll xr-pagina">
      <Link to="/documentos/emitidos" className="xr-volver"><ArrowLeft size={14} aria-hidden="true" /> Documentos emitidos</Link>
      <h1 className="xr-titulo">Emitir documento</h1>

      <div className={`xr-grid${hecho ? ' hecho' : ''}`}>
        {!hecho && (
          <Riel
            elegido={modeloId}
            categoria={params.get('categoria') || ''}
            onElegir={elegir}
          />
        )}
        <div className="xr-trabajo">
          {modeloId === 'archivo' ? (
            <PanelArchivo archivo={archivo} onArchivo={setArchivo} para={para} onPara={setPara} onHecho={() => setHecho(true)} onOtro={reiniciar} />
          ) : (
            <PanelEmision
              key={`${modeloId}|${origen?.id || ''}`}
              riel
              para={unaSola ? { ...para, pestana: 'personas', ids: para.ids.slice(0, 1) } : para}
              preset={{ modeloId, origenId: origen?.id }}
              onEmitido={() => setHecho(true)}
              onReiniciar={reiniciar}
              ladoArriba={info => <ParaQuien para={para} onPara={setPara} {...info} unaSola={unaSola} />}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ── EL RIEL ──
   Cada familia con su punto de color y una flecha que dice que adentro hay más: tocarla despliega
   sus plantillas (o las pliega), sin elegir ninguna. Se pueden tener varias abiertas. La del
   documento elegido empieza abierta. El archivo propio va último y no despliega: no sale de una
   plantilla, se elige con el mismo clic. */
/* Cada tipo trae su color (los propios también); el archivo propio va en gris. */
const COLOR_ARCHIVO = '#64748B'

function Riel({ elegido, categoria, onElegir }) {
  const { modelos, emitidos, contratos, parametros } = useDocumentacion()
  const CATEGORIAS = tiposDoc(parametros)
  const listos = modelos.filter(emisible)
  const usos = [...emitidos.filter(e => e.estado !== 'anulado'), ...contratos]
    .reduce((m, e) => m.set(e.modeloId, (m.get(e.modeloId) || 0) + 1), new Map())
  const familias = Object.entries(CATEGORIAS)
    .map(([k, c]) => ({ k, label: c.plural, modelos: listos.filter(m => m.categoria === k) }))
    .filter(f => f.modelos.length)
  const actual = elegido === 'archivo' ? 'archivo' : listos.find(m => m.id === elegido)?.categoria || ''
  const [abiertas, setAbiertas] = useState(() => new Set([actual || categoria || familias[0]?.k].filter(Boolean)))
  /* Si el documento elegido cambia desde afuera, su familia se abre. Se ajusta al dibujar. */
  if (actual && actual !== 'archivo' && !abiertas.has(actual)) setAbiertas(prev => new Set(prev).add(actual))
  const alternar = k => setAbiertas(prev => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n })

  return (
    <nav className="xr-riel dc-tarjeta" aria-label="Qué va a enviar">
      {familias.length === 0 && (
        <p className="xr-riel-vacio">No hay modelos listos para emitir. <Link to="/documentos/configuracion?ver=plantillas">Revise los modelos</Link>: un modelo necesita estar activo y tener su plantilla publicada.</p>
      )}
      <ul>
        {familias.map(f => {
          const abierta = abiertas.has(f.k)
          return (
            <li key={f.k} className={actual === f.k ? 'on' : undefined} style={{ '--xr-color': CATEGORIAS[f.k].color }}>
              <button type="button" className="xr-familia" aria-expanded={abierta} onClick={() => alternar(f.k)}>
                <span className="xr-punto" aria-hidden="true" />
                <span className="xr-fam-txt"><b>{f.label}</b><small>{DESCRIPCION[f.k] || `${f.modelos.length} ${f.modelos.length === 1 ? 'plantilla' : 'plantillas'}`}</small></span>
                <ChevronDown size={16} className={`xr-flecha${abierta ? ' abierta' : ''}`} aria-hidden="true" />
              </button>
              {abierta && (
                <ul className="xr-modelos">
                  {f.modelos.map(m => (
                    <li key={m.id}>
                      <button type="button" className={`xr-modelo${elegido === m.id ? ' on' : ''}`} aria-pressed={elegido === m.id} onClick={() => onElegir(m.id)}>
                        <span className="xr-fam-txt"><span className="xr-mod-nom">{m.nombre}</span><small>{usos.get(m.id) ? `${usos.get(m.id)} ${usos.get(m.id) === 1 ? 'emitido' : 'emitidos'}` : 'Aún no se emitió'}</small></span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
        <li className={actual === 'archivo' ? 'on' : undefined} style={{ '--xr-color': COLOR_ARCHIVO }}>
          <button type="button" className={`xr-familia${actual === 'archivo' ? ' elegida' : ''}`} aria-pressed={actual === 'archivo'} onClick={() => onElegir('archivo')}>
            <span className="xr-punto" aria-hidden="true" />
            <span className="xr-fam-txt"><b>Un archivo propio</b><small>Reglamento, política, comunicado</small></span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

/* ── PARA QUIÉN ──
   TODO TERMINA EN UNA LISTA DE PERSONAS.
   «Personas»: se busca y se suma de a una.
   «Un grupo», COMO ARMAR UN GRUPO EN WHATSAPP: la gente en una lista con casillas, que se acorta
   con la sucursal, la unidad organizacional, el cargo —cada uno por separado— y un buscador. Se
   marca, se sigue buscando y se marca más: lo marcado no se pierde al cambiar el filtro y queda
   arriba como etiquetas, para quitar a quien sobre. «Marcar a los N» marca de una vez a todos los
   que el filtro dejó.
   Con más de una persona, cada nombre deja ver su hoja; a quien le falta un dato en la ficha se le
   avisa: no sale, y los demás sí. */
const sinTildes = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function ParaQuien({ para, onPara, sinDatos = [], viendo, ver, unaSola }) {
  const { personas } = useDocumentacion()
  const activos = personas.filter(p => p.status !== 'desvinculado')
  const pestana = unaSola ? 'personas' : para.pestana
  const ids = unaSola ? para.ids.slice(0, 1) : para.ids
  const [f, setF] = useState({ busca: '', sede: '', area: '', cargo: '' })
  const setFf = (c, v) => setF(prev => ({ ...prev, [c]: v }))

  const elegidas = ids.map(id => personas.find(p => p.id === id)).filter(Boolean)
  const cuantos = elegidas.length
  const texto = sinTildes(f.busca.trim())
  const lista = activos
    .filter(p => (!f.sede || p.sede === f.sede) && (!f.area || p.depto === f.area) && (!f.cargo || p.cargo === f.cargo))
    .filter(p => !texto || [p.name, p.cargo, p.codigo].some(v => sinTildes(v).includes(texto)))
  const todos = lista.length > 0 && lista.every(p => ids.includes(p.id))

  const opciones = (vals, todas) => [{ valor: '', etiqueta: todas, lateral: String(activos.length) }, ...vals]
  const sucursales = [...new Map(activos.filter(p => p.sede).map(p => [p.sede, p.sedeNombre || p.sede])).entries()]
    .map(([v, n]) => ({ valor: v, etiqueta: n, lateral: String(activos.filter(p => p.sede === v).length) }))
  const unidades = [...new Set(activos.map(p => p.depto).filter(Boolean))].sort()
    .map(v => ({ valor: v, etiqueta: v, lateral: String(activos.filter(p => p.depto === v).length) }))
  const cargos = [...new Set(activos.map(p => p.cargo).filter(Boolean))].sort()
    .map(v => ({ valor: v, etiqueta: v, lateral: String(activos.filter(p => p.cargo === v).length) }))

  const sumar = v => { const id = Number(v); if (id) onPara(p => ({ ...p, ids: unaSola ? [id] : [...p.ids.filter(x => x !== id), id] })) }
  const quitar = id => onPara(p => ({ ...p, ids: p.ids.filter(x => x !== id) }))
  const alternar = id => (ids.includes(id) ? quitar(id) : sumar(id))
  const marcarTodos = () => onPara(p => ({
    ...p,
    ids: todos ? p.ids.filter(id => !lista.some(x => x.id === id)) : [...p.ids, ...lista.map(x => x.id).filter(id => !p.ids.includes(id))],
  }))
  const estado = p => (sinDatos.includes(p.id) ? <span className="xw-dest-falta" title="A su ficha le falta un dato que la plantilla usa">No sale</span>
    : !ver ? null : cuantos > 1 && viendo === p.id ? <span className="xw-dest-viendo">Viendo</span>
      : cuantos > 1 ? <button type="button" className="xw-enlace" onClick={e => { e.preventDefault(); ver(p.id) }}>Ver</button> : null)

  return (
    <div className="xh-bloque xr-para">
      <h2 className="xe-tit">Para quién{cuantos > 1 ? ` · ${cuantos}` : ''}</h2>
      {!unaSola && (
        <span className="xe-modo xr-modo" role="group" aria-label="Cómo elegir a quién">
          <button type="button" className={pestana === 'personas' ? 'on' : ''} aria-pressed={pestana === 'personas'} onClick={() => onPara(p => ({ ...p, pestana: 'personas' }))}>Personas</button>
          <button type="button" className={pestana === 'grupo' ? 'on' : ''} aria-pressed={pestana === 'grupo'} onClick={() => onPara(p => ({ ...p, pestana: 'grupo' }))}>Un grupo</button>
        </span>
      )}

      {pestana === 'personas' ? (
        <>
          <Desplegable
            valor=""
            onCambio={sumar}
            ariaLabel="Buscar colaborador"
            placeholder={unaSola && elegidas.length ? 'Cambiar de persona…' : 'Buscar colaborador…'}
            conBuscador
            buscaPh="Nombre, cargo o código…"
            nota="Las personas desvinculadas no aparecen: su expediente está cerrado."
            opciones={activos.filter(p => !ids.includes(p.id)).map(p => ({ valor: String(p.id), etiqueta: p.name, lateral: p.cargo || 'Sin cargo' }))}
          />
          {elegidas.length > 0 ? (
            <ul className="xw-dest xr-lista">
              {elegidas.map(p => (
                <li key={p.id} className={cuantos > 1 && viendo === p.id ? 'viendo' : undefined}>
                  <Avatar persona={p} size={28} />
                  <span className="xw-dest-nom">{p.name}<small>{p.cargo || 'Sin cargo'}</small></span>
                  {estado(p)}
                  <button type="button" className="xw-dest-quitar" aria-label={`Quitar a ${p.name}`} title="Quitar" onClick={() => quitar(p.id)}><X size={14} /></button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="xh-ayuda">{unaSola ? 'Un contrato es de una sola persona.' : 'Sume a una o a varias personas: a cada una le sale el suyo.'}</p>
          )}
        </>
      ) : (
        <>
          {/* Lo marcado, arriba y siempre a la vista, como en WhatsApp: se quita con la ×. */}
          {elegidas.length > 0 && (
            <div className="xr-chips-cab">
              <span><b>{elegidas.length}</b> {elegidas.length === 1 ? 'elegida' : 'elegidas'}</span>
              <button type="button" className="xw-enlace" onClick={() => onPara(p => ({ ...p, ids: [] }))}>Quitar todos</button>
            </div>
          )}
          {elegidas.length > 0 && (
            <div className="xr-chips">
              {elegidas.map(p => (
                <span key={p.id} className={`xr-chip${sinDatos.includes(p.id) ? ' falta' : ''}`} title={sinDatos.includes(p.id) ? 'A su ficha le falta un dato: no sale' : p.name}>
                  <Avatar persona={p} size={20} />
                  <span className="xr-chip-nom">{p.name.split(' ').slice(0, 2).join(' ')}</span>
                  <button type="button" aria-label={`Quitar a ${p.name}`} onClick={() => quitar(p.id)}><X size={12} /></button>
                </span>
              ))}
            </div>
          )}
          <label className="xr-busca">
            <Search size={15} aria-hidden="true" />
            <span className="sr-only">Buscar persona</span>
            <input type="search" placeholder="Buscar por nombre, cargo o código" value={f.busca} onChange={e => setFf('busca', e.target.value)} />
          </label>
          <div className="xr-filtros">
            <div className={`dc-filtro${f.sede ? ' on' : ''}`}><Desplegable valor={f.sede} onCambio={v => setFf('sede', v)} ariaLabel="Sucursal" placeholder="Todas las sucursales" opciones={opciones(sucursales, 'Todas las sucursales')} /></div>
            <div className={`dc-filtro${f.area ? ' on' : ''}`}><Desplegable valor={f.area} onCambio={v => setFf('area', v)} ariaLabel="Unidad organizacional" placeholder="Todas las unidades organizacionales" opciones={opciones(unidades, 'Todas las unidades organizacionales')} /></div>
            <div className={`dc-filtro${f.cargo ? ' on' : ''}`}><Desplegable valor={f.cargo} onCambio={v => setFf('cargo', v)} ariaLabel="Cargo" placeholder="Todos los cargos" conBuscador opciones={opciones(cargos, 'Todos los cargos')} /></div>
          </div>
          {lista.length === 0 ? (
            <p className="xh-ayuda">Nadie coincide. Pruebe con otro nombre o con menos filtros.</p>
          ) : (
            <div className="xr-caja">
              <label className="xr-check xr-todos">
                <input type="checkbox" checked={todos} onChange={marcarTodos} />
                <span>{todos ? `Desmarcar a los ${lista.length}` : `Marcar a los ${lista.length}`}</span>
              </label>
              <ul className="xw-dest xr-lista">
                {lista.map(p => {
                  const on = ids.includes(p.id)
                  return (
                    <li key={p.id} className={on && cuantos > 1 && viendo === p.id ? 'viendo' : undefined}>
                      <label className="xr-check">
                        <input type="checkbox" checked={on} onChange={() => alternar(p.id)} />
                        <Avatar persona={p} size={26} />
                        <span className="xw-dest-nom">{p.name}<small>{p.cargo || 'Sin cargo'}</small></span>
                      </label>
                      {on && estado(p)}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── UN ARCHIVO PROPIO (v3, como Humand) ───────────────────────────────────
   No todo lo que se envía sale de una plantilla: un reglamento interno, una política o un comunicado
   ya están hechos, en PDF. Se sube una vez y le llega a cada persona elegida, con su número de la
   serie «otro documento», a su carpeta Recibidos. */
const ACEPTA = '.pdf,.jpg,.jpeg,.png'

function PanelArchivo({ archivo, onArchivo, para, onPara, onHecho, onOtro }) {
  const { personas, enviarArchivo } = useDocumentacion()
  const input = useRef(null)
  const [pideAcuse, setPideAcuse] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [hecho, setHecho] = useState(null)
  const destino = para.ids.map(id => personas.find(p => p.id === id)).filter(Boolean)
  const listo = !!archivo?.nombre?.trim() && destino.length > 0

  const enviar = async () => {
    setEnviando(true)
    const clave = nuevaClaveArchivo()
    const ok = await guardarArchivo(clave, archivo.file).catch(() => false)
    const f = archivo.file
    const nuevos = enviarArchivo({
      nombre: archivo.nombre.trim() || f.name,
      archivo: { nombre: f.name, clave: ok === false ? null : clave, formato: extensionDe(f.name), tipoMime: f.type, tamanoKB: Math.round(f.size / 1024) },
      colaboradorIds: destino.map(p => p.id),
      pideAcuse,
    })
    setEnviando(false)
    setHecho({ envio: nuevos[0]?.loteId || nuevos[0]?.id, cuantos: destino.length, a: destino[0]?.name })
    onHecho()
  }

  if (hecho) {
    return (
      <section className="xc-exito dc-tarjeta xc-paso">
        <div className="xc-exito-cab">
          <span className="xc-exito-ico"><CircleCheck size={22} aria-hidden="true" /></span>
          <div>
            <h2>Enviado: {archivo.nombre}</h2>
            <p>Le llegó por la app a {hecho.cuantos === 1 ? hecho.a : `${hecho.cuantos} personas`} y quedó en su expediente, carpeta Recibidos.</p>
          </div>
        </div>
        <div className="xc-pie-paso" style={{ justifyContent: 'flex-start' }}>
          {hecho.envio && <Link className="dc-btn" to={`/documentos/emitidos/${hecho.envio}`}>Ver el envío</Link>}
          <button type="button" className="pl-btn-new" onClick={onOtro}>Emitir otro documento</button>
        </div>
      </section>
    )
  }

  return (
    <div className="xh-cuerpo xr-cuerpo">
      <section className="xh-mesa xr-archivo" aria-label="El archivo">
        <input ref={input} type="file" hidden accept={ACEPTA} onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onArchivo({ file: f, nombre: archivo?.nombre || f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ') }) }} />
        <div className="xr-archivo-caja">
          <FileText size={30} strokeWidth={1.4} aria-hidden="true" />
          {archivo
            ? <span className="xw-archivo-nom">{archivo.file.name} · {Math.max(1, Math.round(archivo.file.size / 1024))} KB</span>
            : <p>Un PDF o una imagen ya hechos: reglamento, política, comunicado. Le llega igual a cada persona.</p>}
          <button type="button" className="dc-btn" onClick={() => input.current?.click()}><Upload size={14} aria-hidden="true" /> {archivo ? 'Cambiar el archivo' : 'Elegir el archivo'}</button>
          {archivo && (
            <label className="pl-label" style={{ width: '100%' }}>
              Nombre con que lo verá el colaborador
              <input className="pl-input" value={archivo.nombre} onChange={e => onArchivo({ ...archivo, nombre: e.target.value })} placeholder="Reglamento interno de trabajo 2026" />
            </label>
          )}
        </div>
      </section>
      <aside className="xh-lado dc-tarjeta">
        <ParaQuien para={para} onPara={onPara} />
        <div className="xr-enviar">
          <p className={`xr-enviar-nota${listo ? '' : ' falta'}`}>
            {!archivo ? 'Falta elegir el archivo.' : !destino.length ? 'Falta elegir a quién.' : 'Le llega por la app y queda en su expediente.'}
          </p>
          <label className="xb-check" title="La persona confirma en la app que lo recibió y lo leyó; no que está de acuerdo.">
            <input type="checkbox" checked={pideAcuse} onChange={e => setPideAcuse(e.target.checked)} />
            <span>Pedir que confirme la recepción</span>
          </label>
          <button type="button" className="pl-btn-new xr-boton" disabled={!listo || enviando} onClick={enviar}>
            <Send size={15} aria-hidden="true" /> {enviando ? 'Enviando…' : destino.length > 1 ? `Enviar a ${destino.length} personas` : destino.length ? `Enviar a ${destino[0].name.split(' ')[0]}` : 'Enviar'}
          </button>
        </div>
      </aside>
    </div>
  )
}
