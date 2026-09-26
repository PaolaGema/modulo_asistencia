import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Award, Ban, CircleCheck, Download, Eye, FileText, Mail, PenLine, ScrollText, Search, Smartphone, TriangleAlert, Upload } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import {
  CATEGORIAS, ESTADOS_EMITIDO, MODALIDADES, aFecha, datosPara, fechaCorta, fechaLarga, fechaNum, iso, rellenar, siguienteNumero,
} from '../../data/documentacionData'
import { Cabecera, EstadoEmitidoChip, Etiqueta, Filtros, Modal, PersonaCelda, SensibilidadChip, Vacio } from '../../components/documentacion/comunes'
import { FILTROS_VACIOS, describirFiltros, descargarTexto, exportarCSV, pasaFiltros } from '../../components/documentacion/utilidades'
import Desplegable from '../../components/layout/Desplegable'
import SelectorFecha from '../../components/layout/SelectorFecha'
import HojaDocumento from './HojaDocumento'
import { contratoVigenteDe, emisible, esAdenda, plazosFijosDe, versionPublicada } from './emisionUtil'
import './emision.css'

/* ── EMITIR: UNA PANTALLA PARA LAS TRES FAMILIAS (pantalla 11) ─────────────
   Certificado, memorándum y contrato se emiten igual: se elige qué, a quién, se completa lo
   poco que es propio de cada uno y se ve el documento FINAL antes de confirmar (RF-45). El Salar
   tiene tres pantallas de registro; acá el recorrido es uno y lo que cambia es el paso 4.

   NINGÚN DATO DE LA PERSONA SE TIPEA (RF-51, principio 2). Sede, cargo, área e ingreso se leen
   de la ficha al elegirla; si algo está mal, se corrige en la ficha, no en el certificado.

   Todo en la misma página y no en un asistente de pantallas: quien emite quiere ver a la vez qué
   eligió y cómo va quedando, y volver a cambiar el modelo sin perder a la persona. */

const ICONO_CAT = { certificado: Award, memorandum: ScrollText, contrato: PenLine }
const DESC_CAT = {
  certificado: 'De trabajo, con sueldo… Sale con los datos de la ficha y número correlativo.',
  memorandum: 'Felicitación, llamada de atención… Con observaciones y constancia de entrega.',
  contrato: 'Contrato nuevo o adenda. Queda como el contrato vigente para Planillas.',
}

const sumarDia = (s, n = 1) => { const d = aFecha(s); d.setDate(d.getDate() + n); return iso(d) }

export default function Emitir() {
  const [params, setParams] = useSearchParams()
  const pestana = params.get('ver') === 'emitidos' ? 'emitidos' : 'emitir'
  const cambiarPestana = p => { const q = new URLSearchParams(params); if (p === 'emitidos') q.set('ver', 'emitidos'); else q.delete('ver'); setParams(q, { replace: true }) }
  const { emitidos } = useDocumentacion()

  return (
    <div className="content-scroll">
      <Cabecera titulo="Emitir documento" sub="Certificados, memorándums y contratos desde las plantillas de la empresa, con los datos de la ficha ya puestos." />
      <div className="dc-tabs" role="tablist" aria-label="Emitir o consultar">
        <button type="button" role="tab" aria-selected={pestana === 'emitir'} className={`dc-tab${pestana === 'emitir' ? ' on' : ''}`} onClick={() => cambiarPestana('emitir')}>Emitir</button>
        <button type="button" role="tab" aria-selected={pestana === 'emitidos'} className={`dc-tab${pestana === 'emitidos' ? ' on' : ''}`} onClick={() => cambiarPestana('emitidos')}>
          Emitidos <span className="dc-tab-n">{emitidos.length}</span>
        </button>
      </div>
      {pestana === 'emitir' ? <Asistente params={params} /> : <ConsultaEmitidos />}
    </div>
  )
}

function Paso({ n, titulo, sub, hecho, bloqueado, children, accion }) {
  return (
    <section className={`dc-tarjeta xc-paso${hecho ? ' hecho' : ''}${bloqueado ? ' bloqueado' : ''}`} aria-disabled={bloqueado || undefined}>
      <div className="xc-paso-cab">
        <span className="xc-paso-n" aria-hidden="true">{hecho ? <CircleCheck size={15} /> : n}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>{titulo}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {accion}
      </div>
      {!bloqueado && children}
    </section>
  )
}

/* ── EL RECORRIDO DE EMISIÓN ── */
function Asistente({ params }) {
  const { modelos, personas, contratos, emitidos, parametros, empresa, emitir, registrarContrato, modelo: buscarModelo } = useDocumentacion()

  /* LLEGAR YA PREELEGIDO. Desde el expediente se llega con `?colaborador=…&modelo=…`, y desde la
     ficha de un contrato con `?origen=…` para renovarlo con adenda: rehacer esa elección acá
     sería volver a hacer lo que ya se hizo un clic antes. */
  const inicial = useMemo(() => {
    const origen = contratos.find(c => c.id === params.get('origen'))
    const mod = buscarModelo(params.get('modelo')) || (origen ? modelos.find(m => esAdenda(m) && emisible(m)) : null)
    const colab = origen ? origen.colaboradorId : Number(params.get('colaborador')) || null
    return {
      categoria: mod?.categoria || (origen ? 'contrato' : ''),
      modeloId: mod && emisible(mod) ? mod.id : '',
      colabId: personas.some(p => p.id === colab) ? colab : null,
      origenId: origen && !origen.origenId ? origen.id : (origen?.origenId || ''),
      modalidad: origen?.modalidad || '',
      inicio: origen?.fin ? sumarDia(origen.fin) : '',
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [categoria, setCategoria] = useState(inicial.categoria)
  const [modeloId, setModeloId] = useState(inicial.modeloId)
  const [colabId, setColabId] = useState(inicial.colabId)
  const [busca, setBusca] = useState('')
  const [obs, setObs] = useState('')
  // La fecha del memorándum: por omisión la de hoy, pero puede fecharse el día del hecho.
  const [fechaMemo, setFechaMemo] = useState(() => iso(new Date()))
  const [k, setK] = useState({ modalidad: inicial.modalidad, inicio: inicial.inicio, fin: '', camino: 'generar', archivo: '', decision: '', origenId: inicial.origenId, comentarios: '' })
  const [resultado, setResultado] = useState(null)
  const setKk = (c, v) => setK(prev => ({ ...prev, [c]: v }))

  const modelo = modelos.find(m => m.id === modeloId) || null
  const persona = personas.find(p => p.id === colabId) || null
  const adenda = esAdenda(modelo)
  const version = versionPublicada(modelo)
  const vigente = persona ? contratoVigenteDe(persona.id, contratos, parametros) : null
  const origenes = persona ? contratos.filter(c => c.colaboradorId === persona.id && c.tipo === 'contrato' && !c.finalizado && !c.reemplazado) : []
  const origen = contratos.find(c => c.id === k.origenId) || null
  const modalidad = adenda ? origen?.modalidad : k.modalidad

  const deCategoria = modelos.filter(m => m.categoria === categoria)
  const usables = deCategoria.filter(emisible)
  const ocultos = deCategoria.length - usables.length

  function elegirCategoria(c) {
    setCategoria(c)
    if (modelo?.categoria !== c) setModeloId('')
    setResultado(null)
  }
  function elegirModelo(m) {
    setModeloId(m.id)
    setResultado(null)
    /* Un modelo de contrato ya dice su modalidad; proponerla ahorra un paso y un error. */
    if (m.id === 'm-contrato-indef') setK(prev => ({ ...prev, modalidad: 'indefinido', fin: '' }))
    if (m.id === 'm-contrato-plazo') setK(prev => ({ ...prev, modalidad: 'plazo_fijo' }))
  }
  function elegirPersona(p) {
    setColabId(p.id)
    setBusca('')
    setResultado(null)
    setK(prev => ({ ...prev, decision: '', origenId: '' }))
  }

  /* ── Lo que falta para poder emitir, en palabras ── */
  const faltan = []
  if (!categoria) faltan.push('elegir qué emitir')
  else if (!modelo) faltan.push('elegir el modelo')
  if (!persona) faltan.push('elegir a la persona')
  if (modelo && persona) {
    if (categoria === 'memorandum' && obs.trim().length < 5) faltan.push('escribir las observaciones del memorándum')
    if (categoria === 'contrato' && !adenda) {
      if (!k.modalidad) faltan.push('elegir la modalidad')
      if (!k.inicio) faltan.push('poner la fecha de inicio')
      /* RN-20: la modalidad decide qué fechas tienen sentido. */
      if (k.modalidad === 'plazo_fijo' && !k.fin) faltan.push('poner la fecha de fin (a plazo fijo es obligatoria)')
      if (k.fin && k.inicio && k.fin <= k.inicio) faltan.push('corregir el fin: tiene que ser posterior al inicio')
      if (vigente && !k.decision) faltan.push('decidir qué pasa con el contrato vigente')
      if (k.camino === 'cargar' && !k.archivo) faltan.push('adjuntar el contrato firmado')
    }
    if (adenda) {
      if (!origen) faltan.push('elegir el contrato que modifica la adenda')
      if (origen && k.inicio && k.inicio < origen.inicio) faltan.push('corregir el inicio: una adenda no puede ser anterior a su contrato')
      if (!k.inicio) faltan.push('poner la fecha de inicio de la adenda')
      if (origen?.modalidad === 'plazo_fijo' && !k.fin) faltan.push('poner la nueva fecha de fin')
      if (k.fin && k.inicio && k.fin <= k.inicio) faltan.push('corregir el fin: tiene que ser posterior al inicio')
    }
  }

  const numero = categoria ? siguienteNumero(categoria, emitidos, parametros, contratos) : null
  const contratoDatos = categoria === 'contrato' ? { modalidad: modalidad || 'indefinido', inicio: k.inicio, fin: modalidad === 'indefinido' ? null : k.fin } : (persona ? contratoVigenteDe(persona.id, contratos, parametros) : null)
  const datos = persona ? { ...datosPara(persona, { empresa, contrato: contratoDatos, numero: numero ? `${numero.texto}` : undefined, observaciones: obs }), ...(categoria === 'memorandum' ? { 'documento.fecha': fechaLarga(fechaMemo) } : {}) } : null
  const previa = version && datos ? rellenar(version.texto, datos) : ''
  /* UN DOCUMENTO CON HUECOS NO SALE (RN-17). Si algo de la plantilla queda sin rellenar para
     esta persona, se ve marcado en la hoja y el botón no emite. */
  const huecos = (previa.match(/\{\{[^}]*\}\}/g) || []).length
  if (huecos && faltan.length === 0) faltan.push(`completar ${huecos === 1 ? 'un dato que' : `${huecos} datos que`} la plantilla necesita`)
  const listo = faltan.length === 0 && !!version

  function confirmar() {
    if (!listo) return
    if (categoria === 'contrato') {
      const nuevo = registrarContrato({
        colaboradorId: persona.id, modalidad, inicio: k.inicio, fin: modalidad === 'indefinido' ? null : k.fin,
        modeloId: modelo.id, comentarios: k.comentarios, origenId: adenda ? origen.id : null,
        camino: adenda ? 'generar' : k.camino, archivo: k.camino === 'cargar' ? k.archivo : null,
        decision: adenda ? null : (vigente ? k.decision : null), anteriorId: adenda ? null : vigente?.id,
      })
      setResultado({ tipo: 'contrato', id: nuevo.id, numero: nuevo.numero, texto: previa.replace(numero.texto, nuevo.numero) })
    } else {
      const nuevo = emitir({ modeloId: modelo.id, colaboradorId: persona.id, observaciones: obs, fecha: categoria === 'memorandum' ? fechaMemo : null })
      setResultado({ tipo: 'emitido', id: nuevo.id })
    }
  }

  function reiniciar() {
    setResultado(null); setColabId(null); setObs(''); setModeloId('')
    setK({ modalidad: '', inicio: '', fin: '', camino: 'generar', archivo: '', decision: '', origenId: '', comentarios: '' })
  }

  if (resultado) return <Resultado resultado={resultado} persona={persona} modelo={modelo} onOtro={reiniciar} />

  const coincidencias = busca.trim()
    ? personas.filter(p => p.status !== 'desvinculado' && `${p.name} ${p.cargo} ${p.codigo} ${p.depto}`.toLowerCase().includes(busca.trim().toLowerCase())).slice(0, 8)
    : []

  return (
    <div className="xc-pasos">
      <Paso n={1} titulo="Qué va a emitir" hecho={!!categoria}>
        <div className="xc-opciones" role="radiogroup" aria-label="Categoría">
          {Object.entries(CATEGORIAS).map(([c, def]) => {
            const Icono = ICONO_CAT[c]
            return (
              <button key={c} type="button" role="radio" aria-checked={categoria === c} className={`xc-op${categoria === c ? ' on' : ''}`} onClick={() => elegirCategoria(c)}>
                <span className="xc-op-ico"><Icono size={17} aria-hidden="true" /></span>
                <span className="xc-op-txt"><b>{def.label}</b><small>{DESC_CAT[c]}</small></span>
              </button>
            )
          })}
        </div>
      </Paso>

      <Paso n={2} titulo="Modelo" sub={categoria ? 'Solo aparecen los modelos activos con plantilla publicada.' : 'Primero elija qué va a emitir.'} hecho={!!modelo} bloqueado={!categoria}>
        {usables.length === 0 ? (
          <div className="xc-aviso xc-aviso-ambar"><TriangleAlert size={15} aria-hidden="true" /><p>No hay modelos de {CATEGORIAS[categoria]?.plural.toLowerCase()} listos para emitir. <Link className="xc-enlace" to="/documentos/configuracion/modelos">Revise la biblioteca</Link>: un modelo necesita estar activo y tener su plantilla publicada.</p></div>
        ) : (
          <>
            <div className="xc-opciones" role="radiogroup" aria-label="Modelo">
              {usables.map(m => (
                <button key={m.id} type="button" role="radio" aria-checked={modeloId === m.id} className={`xc-op${modeloId === m.id ? ' on' : ''}`} onClick={() => elegirModelo(m)}>
                  <span className="xc-op-ico"><FileText size={16} aria-hidden="true" /></span>
                  <span className="xc-op-txt">
                    <b>{m.nombre}</b>
                    <small>Versión {versionPublicada(m).v}{m.base ? ' · de fábrica' : ' · propio'}{m.sensible ? ' · confidencial' : ''}</small>
                  </span>
                </button>
              ))}
            </div>
            {ocultos > 0 && <p className="xc-ayuda">{ocultos === 1 ? 'Un modelo de esta categoría no aparece' : `${ocultos} modelos de esta categoría no aparecen`} porque está{ocultos === 1 ? '' : 'n'} inactivo{ocultos === 1 ? '' : 's'} o sin plantilla publicada.</p>}
          </>
        )}
      </Paso>

      <Paso
        n={3}
        titulo="A quién"
        sub={modelo ? 'Busque por nombre, cargo, área o código.' : 'Primero elija el modelo.'}
        hecho={!!persona}
        bloqueado={!modelo}
        accion={persona && <button type="button" className="dc-btn dc-btn-sm" onClick={() => { setColabId(null); setK(prev => ({ ...prev, decision: '', origenId: '' })) }}>Cambiar</button>}
      >
        {persona ? (
          <>
            <PersonaCelda persona={persona} size={38} />
            <dl className="xc-datos">
              <div><dt>Sucursal</dt><dd>{persona.sedeNombre || '—'}</dd></div>
              <div><dt>Ciudad</dt><dd>{persona.sedeCiudad || '—'}</dd></div>
              <div><dt>Cargo</dt><dd>{persona.cargo || '—'}</dd></div>
              <div><dt>Área</dt><dd>{persona.depto || '—'}</dd></div>
              <div><dt>Ingreso</dt><dd>{fechaCorta(persona.ingreso)}</dd></div>
              <div><dt>Código</dt><dd>{persona.codigo}</dd></div>
            </dl>
            <p className="xc-auto">Estos datos salen de la ficha del colaborador y no se editan aquí. Si alguno está mal, corríjalo en su ficha antes de emitir.</p>
          </>
        ) : (
          <>
            <label className="xc-buscar" style={{ width: '100%', maxWidth: 440 }}>
              <Search size={14} aria-hidden="true" />
              <input className="pl-input" type="search" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar colaborador…" aria-label="Buscar colaborador" autoFocus={!!modelo} />
            </label>
            {busca.trim() && (
              <div className="xc-resultados" role="listbox" aria-label="Colaboradores encontrados">
                {coincidencias.length === 0
                  ? <p className="xc-ayuda">Nadie coincide con «{busca}». Las personas desvinculadas no aparecen: su expediente está cerrado.</p>
                  : coincidencias.map(p => (
                    <button key={p.id} type="button" role="option" aria-selected="false" className="xc-resultado" onClick={() => elegirPersona(p)}>
                      <PersonaCelda persona={p} />
                      <small className="dc-muted">{p.codigo}</small>
                    </button>
                  ))}
              </div>
            )}
          </>
        )}
      </Paso>

      <Paso n={4} titulo="Datos del documento" hecho={!!persona && faltan.length === 0} bloqueado={!persona}>
        {persona && categoria === 'certificado' && (
          <p className="xc-ayuda" style={{ margin: 0, fontSize: 12.5 }}>No hace falta nada más: el certificado sale con los datos de la ficha, el número se asigna al emitir y la fecha es la de hoy ({fechaNum(iso(new Date()))}).</p>
        )}

        {persona && categoria === 'memorandum' && (
          <div className="xc-col" style={{ gap: 12 }}>
            {modelo?.sensible && (
              <div className="xc-aviso xc-aviso-azul"><Eye size={15} aria-hidden="true" /><p><b>Memorándum confidencial.</b> Su jefe no lo verá salvo permiso explícito, y cada vez que alguien lo abra queda registrado (RF-58, RF-90).</p></div>
            )}
            <label className="pl-label" htmlFor="xc-obs">
              Observaciones
              <textarea id="xc-obs" className="pl-input xc-textarea" value={obs} onChange={e => setObs(e.target.value)} placeholder={modelo?.sensible ? 'Describa el hecho con fechas concretas: «tres atrasos injustificados los días 4, 11 y 18 de agosto».' : 'El motivo del reconocimiento, con el hecho concreto.'} />
              <span className="xc-ayuda">Se escriben dentro del memorándum, donde la plantilla lo indica.</span>
            </label>
            <label className="pl-label" htmlFor="xc-memo-fecha" style={{ maxWidth: 260 }}>
              Fecha del memorándum
              <SelectorFecha id="xc-memo-fecha" valor={fechaMemo} onCambio={v => setFechaMemo(v || iso(new Date()))} ariaLabel="Fecha del memorándum" />
            </label>
          </div>
        )}

        {persona && categoria === 'contrato' && !adenda && (
          <div className="xc-col" style={{ gap: 14 }}>
            {vigente && (
              /* RN-18: DOS CONTRATOS VIGENTES DEJAN A PLANILLAS SIN SABER CUÁL APLICAR. No se elige
                 por omisión: la decisión es de quien registra, y se toma acá, antes de emitir. */
              <div className="xc-aviso xc-aviso-ambar" role="alert">
                <TriangleAlert size={15} aria-hidden="true" />
                <div className="xc-aviso-cuerpo">
                  <p><b>{persona.name} ya tiene un contrato vigente</b>: {vigente.numero}, {MODALIDADES[vigente.modalidad].toLowerCase()}, desde el {fechaCorta(vigente.inicio)}{vigente.fin ? ` hasta el ${fechaCorta(vigente.fin)}` : ''}. Una persona no puede tener dos. ¿Qué pasa con ese contrato?</p>
                  <div className="xc-radios" role="radiogroup" aria-label="Qué pasa con el contrato vigente">
                    <label className={`xc-radio${k.decision === 'finalizar' ? ' on' : ''}`}>
                      <input type="radio" name="xc-decision" checked={k.decision === 'finalizar'} onChange={() => setKk('decision', 'finalizar')} />
                      <span>Finalizarlo<small>Terminó: el contrato nuevo empieza una relación nueva.</small></span>
                    </label>
                    <label className={`xc-radio${k.decision === 'reemplazar' ? ' on' : ''}`}>
                      <input type="radio" name="xc-decision" checked={k.decision === 'reemplazar'} onChange={() => setKk('decision', 'reemplazar')} />
                      <span>Reemplazarlo<small>El nuevo lo sustituye. El anterior se conserva, marcado como reemplazado.</small></span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            <div className="xc-fila">
              <div className="pl-label">
                Modalidad
                <Desplegable valor={k.modalidad} onCambio={v => setK(prev => ({ ...prev, modalidad: v, fin: v === 'indefinido' ? '' : prev.fin }))} ariaLabel="Modalidad" opciones={Object.entries(MODALIDADES).map(([v, t]) => ({ valor: v, etiqueta: t }))} />
              </div>
              <div className="pl-label">
                Fecha de inicio
                <SelectorFecha id="xc-k-inicio" valor={k.inicio} onCambio={v => setKk('inicio', v)} ariaLabel="Fecha de inicio" />
              </div>
              {k.modalidad !== 'indefinido' ? (
                <div className="pl-label">
                  Fecha de fin{k.modalidad === 'plazo_fijo' ? '' : ' (opcional)'}
                  <SelectorFecha id="xc-k-fin" valor={k.fin} onCambio={v => setKk('fin', v)} ariaLabel="Fecha de fin" />
                </div>
              ) : (
                <div className="pl-label">
                  Fecha de fin
                  <p className="xc-ayuda" style={{ margin: '10px 0 0' }}>Un contrato indefinido no lleva fecha de fin (RN-20).</p>
                </div>
              )}
            </div>
            {k.modalidad === 'plazo_fijo' && plazosFijosDe(persona.id, contratos) >= 2 && (
              <div className="xc-aviso xc-aviso-ambar"><TriangleAlert size={15} aria-hidden="true" /><p>{persona.name} ya encadena {plazosFijosDe(persona.id, contratos)} contratos a plazo fijo. Según la norma laboral, encadenar más puede convertir la relación en indefinida: consúltelo con Legal. El sistema avisa, no bloquea (RF-66).</p></div>
            )}
            <div className="pl-label">
              Cómo se registra
              <div className="xc-radios" role="radiogroup" aria-label="Cómo se registra">
                <label className={`xc-radio${k.camino === 'generar' ? ' on' : ''}`}>
                  <input type="radio" name="xc-camino" checked={k.camino === 'generar'} onChange={() => setKk('camino', 'generar')} />
                  <span>Generar desde la plantilla<small>Sale sin firma; cuando vuelva firmado, lo carga en la ficha del contrato.</small></span>
                </label>
                <label className={`xc-radio${k.camino === 'cargar' ? ' on' : ''}`}>
                  <input type="radio" name="xc-camino" checked={k.camino === 'cargar'} onChange={() => setKk('camino', 'cargar')} />
                  <span>Cargar el contrato ya firmado<small>Para un contrato firmado en papel que hay que registrar.</small></span>
                </label>
              </div>
            </div>
            {k.camino === 'cargar' && (
              <label className="dc-btn" style={{ alignSelf: 'flex-start', cursor: 'pointer' }}>
                <Upload size={13} aria-hidden="true" /> {k.archivo ? `Adjunto: ${k.archivo}` : 'Adjuntar el firmado (PDF)'}
                <input type="file" accept="application/pdf,image/*" hidden onChange={e => setKk('archivo', e.target.files?.[0]?.name || '')} />
              </label>
            )}
            <label className="pl-label" htmlFor="xc-k-com">
              Comentarios (opcional)
              <textarea id="xc-k-com" className="pl-input xc-textarea" value={k.comentarios} onChange={e => setKk('comentarios', e.target.value)} />
            </label>
          </div>
        )}

        {persona && categoria === 'contrato' && adenda && (
          <div className="xc-col" style={{ gap: 14 }}>
            <div className="pl-label">
              Contrato que modifica
              {origenes.length === 0 ? (
                <p className="xc-error">{persona.name} no tiene ningún contrato vigente: una adenda no existe sin contrato origen (RN-19). Registre primero el contrato.</p>
              ) : (
                <Desplegable
                  valor={k.origenId}
                  onCambio={v => { const o = contratos.find(c => c.id === v); setK(prev => ({ ...prev, origenId: v, inicio: prev.inicio || (o?.fin ? sumarDia(o.fin) : '') })) }}
                  ariaLabel="Contrato origen"
                  opciones={origenes.map(c => ({ valor: c.id, etiqueta: `${c.numero} · ${MODALIDADES[c.modalidad]} · desde ${fechaCorta(c.inicio)}${c.fin ? ` hasta ${fechaCorta(c.fin)}` : ''}` }))}
                />
              )}
            </div>
            {origen && (
              <div className="xc-fila">
                <div className="pl-label">
                  Rige desde
                  <SelectorFecha id="xc-a-inicio" valor={k.inicio} onCambio={v => setKk('inicio', v)} ariaLabel="Inicio de la adenda" />
                </div>
                {origen.modalidad !== 'indefinido' && (
                  <div className="pl-label">
                    Nueva fecha de fin
                    <SelectorFecha id="xc-a-fin" valor={k.fin} onCambio={v => setKk('fin', v)} ariaLabel="Nueva fecha de fin" />
                  </div>
                )}
              </div>
            )}
            {origen?.modalidad === 'plazo_fijo' && plazosFijosDe(persona.id, contratos) >= 2 && (
              <div className="xc-aviso xc-aviso-ambar"><TriangleAlert size={15} aria-hidden="true" /><p>Esta sería una renovación más de un plazo fijo ({plazosFijosDe(persona.id, contratos)} hasta ahora). Encadenar plazos fijos puede convertir la relación en indefinida: consúltelo con Legal. El sistema avisa, no bloquea (RF-66).</p></div>
            )}
          </div>
        )}
      </Paso>

      <Paso n={5} titulo="Vista previa" sub={persona && modelo ? 'Así sale el documento, con los datos de hoy. Revíselo antes de emitir.' : 'Aparece al elegir el modelo y la persona.'} bloqueado={!persona || !modelo}>
        <HojaDocumento texto={previa} etiqueta="Vista previa del documento a emitir" />
        <div className="xc-pie-paso">
          <span className="xc-falta" aria-live="polite">
            {listo
              ? <>Se emitirá con el número <b>{numero?.texto}</b>{categoria !== 'contrato' ? ` y la versión ${version.v} de la plantilla.` : '.'}</>
              : `Falta ${faltan.join(', ')}.`}
          </span>
          <button type="button" className="pl-btn-new" disabled={!listo} onClick={confirmar} style={listo ? undefined : { opacity: .5, cursor: 'not-allowed' }}>
            <CircleCheck size={14} color="#00E091" /> {categoria === 'contrato' ? (adenda ? 'Registrar adenda' : 'Registrar contrato') : 'Emitir'}
          </button>
        </div>
      </Paso>
    </div>
  )
}

/* ── DESPUÉS DE EMITIR: EL NÚMERO Y LA ENTREGA (RF-55) ────────────────────
   Emitir no es entregar. El documento queda generado, y la entrega se registra aparte con su
   canal, fecha y quién: es lo que después prueba que el colaborador lo recibió. */
function Resultado({ resultado, persona, modelo, onOtro }) {
  const { emitidos, entregar, registrarDescarga } = useDocumentacion()
  if (resultado.tipo === 'contrato') {
    return (
      <section className="dc-tarjeta xc-paso xc-exito">
        <div className="xc-exito-cab">
          <span className="xc-exito-ico"><CircleCheck size={22} aria-hidden="true" /></span>
          <div>
            <h2>{esAdenda(modelo) ? 'Adenda registrada' : 'Contrato registrado'}: {resultado.numero}</h2>
            <p>{persona?.name}. Queda como contrato vigente para Planillas (RF-65).</p>
          </div>
        </div>
        <HojaDocumento texto={resultado.texto} compacta />
        <div className="xc-pie-paso" style={{ justifyContent: 'flex-start' }}>
          <Link className="pl-btn-new" to={`/documentos/contratos/${resultado.id}`}>Abrir la ficha del contrato</Link>
          <Link className="dc-btn" to={`/documentos/expedientes/${persona?.id}`}>Ir al expediente</Link>
          <button type="button" className="dc-btn" onClick={onOtro}>Emitir otro documento</button>
        </div>
      </section>
    )
  }
  const e = emitidos.find(x => x.id === resultado.id)
  if (!e) return null
  const canales = new Set(e.entregas.map(x => x.canal))
  const nombreArchivo = `${e.numero.replace(/\//g, '-')}_${persona?.codigo || ''}.txt`
  return (
    <section className="dc-tarjeta xc-paso xc-exito">
      <div className="xc-exito-cab">
        <span className="xc-exito-ico"><CircleCheck size={22} aria-hidden="true" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>Emitido: {e.numero}</h2>
          <p>{modelo?.nombre} para {persona?.name}. Quedó archivado en su expediente.</p>
        </div>
        <EstadoEmitidoChip estado={e.estado} />
      </div>
      <div className="xc-aviso xc-aviso-azul">
        <Mail size={15} aria-hidden="true" />
        <div className="xc-aviso-cuerpo">
          <p><b>Falta entregarlo.</b> Registre por dónde le llega al colaborador: la entrega queda con fecha, hora y quién la hizo.</p>
          <div className="xc-barra">
            <button type="button" className="dc-btn" onClick={() => { descargarTexto(nombreArchivo, e.texto); entregar(e.id, 'descarga'); registrarDescarga('emitido', e.id, e.colaboradorId, `Descargó ${e.numero}`) }}>
              <Download size={13} aria-hidden="true" /> Descargar{canales.has('descarga') ? ' ✓' : ''}
            </button>
            <button type="button" className="dc-btn" onClick={() => entregar(e.id, 'correo')}><Mail size={13} aria-hidden="true" /> Enviar por correo{canales.has('correo') ? ' ✓' : ''}</button>
            <button type="button" className="dc-btn" onClick={() => entregar(e.id, 'app')}><Smartphone size={13} aria-hidden="true" /> Notificar en la app{canales.has('app') ? ' ✓' : ''}</button>
          </div>
          {e.entregas.length > 0 && <p>Entregas: {e.entregas.map(x => `${x.canal} (${fechaCorta(x.fecha)}, ${x.por})`).join(' · ')}</p>}
        </div>
      </div>
      <HojaDocumento texto={e.texto} compacta />
      <div className="xc-pie-paso" style={{ justifyContent: 'flex-start' }}>
        <Link className="dc-btn" to={`/documentos/expedientes/${e.colaboradorId}`}>Ir al expediente</Link>
        <button type="button" className="pl-btn-new" onClick={onOtro}>Emitir otro documento</button>
      </div>
    </section>
  )
}

/* ── LA CONSULTA DE EMITIDOS (RF-54) ──────────────────────────────────────
   Con los filtros de todo el módulo más modelo, estado y fechas, y se ve en pantalla antes de
   exportar. ANULAR NO BORRA (RN-14, RN-15): el documento queda con su número tachado y el motivo,
   y la corrección es emitir uno nuevo. */
function ConsultaEmitidos() {
  const { emitidos, personas, modelos, sucursales, anular, registrarDescarga, modelo: buscarModelo } = useDocumentacion()
  const [f, setF] = useState(FILTROS_VACIOS)
  const [modeloF, setModeloF] = useState('')
  const [estadoF, setEstadoF] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [viendo, setViendo] = useState(null)
  const [anulando, setAnulando] = useState(null)
  const [motivo, setMotivo] = useState('')

  const textoDe = e => {
    if (e.texto) return e.texto
    const m = buscarModelo(e.modeloId)
    const v = m?.versiones.find(x => x.v === e.versionPlantilla) || versionPublicada(m)
    return rellenar(v?.texto || '', { ...e.datos, 'documento.numero': e.numero, 'memo.observaciones': e.observaciones || e.datos?.['memo.observaciones'] || '' })
  }

  const filas = emitidos
    .map(e => ({ e, p: personas.find(p => p.id === e.colaboradorId), m: buscarModelo(e.modeloId) }))
    .filter(({ e, p }) => p && pasaFiltros(p, f)
      && (!modeloF || e.modeloId === modeloF) && (!estadoF || e.estado === estadoF)
      && (!desde || e.fecha >= desde) && (!hasta || e.fecha <= hasta))
    .sort((a, b) => (a.e.fecha < b.e.fecha ? 1 : -1))

  const hayFiltros = modeloF || estadoF || desde || hasta
  const textoFiltros = [describirFiltros(f, { sucursales }), modeloF && buscarModelo(modeloF)?.nombre, estadoF && ESTADOS_EMITIDO[estadoF].label, desde && `desde ${fechaNum(desde)}`, hasta && `hasta ${fechaNum(hasta)}`].filter(x => x && x !== 'Sin filtros').join(' · ') || 'Sin filtros'

  function abrir(fila) {
    setViendo(fila)
    /* Abrir un memorándum confidencial deja rastro aunque no se descargue (RF-90). */
    if (fila.m?.sensible) registrarDescarga('emitido', fila.e.id, fila.e.colaboradorId, `Abrió ${fila.e.numero}`, true)
  }

  return (
    <div className="xc-col">
      <div className="xc-herramientas">
        <Filtros valor={f} onCambio={setF} personas={personas} sucursales={sucursales} mostrar={['sede', 'area']} />
        <div className="dc-filtro">
          <Desplegable valor={modeloF} onCambio={setModeloF} ariaLabel="Modelo" placeholder="Todos los modelos" opciones={[{ valor: '', etiqueta: 'Todos los modelos' }, ...modelos.filter(m => m.categoria !== 'contrato').map(m => ({ valor: m.id, etiqueta: m.nombre }))]} />
        </div>
        <div className="dc-filtro">
          <Desplegable valor={estadoF} onCambio={setEstadoF} ariaLabel="Estado" placeholder="Todos los estados" opciones={[{ valor: '', etiqueta: 'Todos los estados' }, ...Object.entries(ESTADOS_EMITIDO).map(([k, e]) => ({ valor: k, etiqueta: e.label }))]} />
        </div>
        <div className="dc-filtro"><SelectorFecha id="xc-desde" valor={desde} onCambio={setDesde} placeholder="Desde" ariaLabel="Emitidos desde" /></div>
        <div className="dc-filtro"><SelectorFecha id="xc-hasta" valor={hasta} onCambio={setHasta} placeholder="Hasta" ariaLabel="Emitidos hasta" /></div>
        {hayFiltros && <button type="button" className="dc-limpiar" onClick={() => { setModeloF(''); setEstadoF(''); setDesde(''); setHasta('') }}>Limpiar fechas y modelo</button>}
        <button
          type="button"
          className="dc-btn"
          style={{ marginLeft: 'auto' }}
          disabled={!filas.length}
          onClick={() => exportarCSV('emitidos.csv', ['Número', 'Colaborador', 'Sucursal', 'Área', 'Modelo', 'Fecha', 'Estado', 'Entregas'], filas.map(({ e, p, m }) => [e.numero, p.name, p.sedeNombre, p.depto, m?.nombre, fechaNum(e.fecha), ESTADOS_EMITIDO[e.estado].label, e.entregas.map(x => x.canal).join(', ')]), textoFiltros)}
        >
          <Download size={13} aria-hidden="true" /> Exportar
        </button>
      </div>
      <p className="xc-ayuda" style={{ margin: 0 }}>{filas.length} {filas.length === 1 ? 'documento' : 'documentos'} · {textoFiltros}. Los contratos se consultan en el expediente de cada persona.</p>

      {filas.length === 0 ? (
        <div className="dc-tarjeta">
          <Vacio Icono={FileText} titulo="No hay documentos emitidos con estos filtros" texto={`Se buscó: ${textoFiltros}.`}>
            <button type="button" className="dc-btn" onClick={() => { setF(FILTROS_VACIOS); setModeloF(''); setEstadoF(''); setDesde(''); setHasta('') }}>Limpiar filtros</button>
          </Vacio>
        </div>
      ) : (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table xc-tabla" style={{ minWidth: 960 }}>
            <thead>
              <tr><th>Número</th><th>Colaborador</th><th>Modelo</th><th>Fecha</th><th>Estado</th><th>Entrega</th><th aria-label="Acciones" /></tr>
            </thead>
            <tbody>
              {filas.map(fila => {
                const { e, p, m } = fila
                return (
                  <tr key={e.id}>
                    <td><span className="xc-num" style={e.estado === 'anulado' ? { textDecoration: 'line-through' } : undefined}>{e.numero}</span></td>
                    <td><PersonaCelda persona={p} size={28} /></td>
                    <td><span className="xc-nombre"><b>{m?.nombre || '—'}</b><small>Plantilla v{e.versionPlantilla} {m?.sensible && <SensibilidadChip nivel="confidencial" />}</small></span></td>
                    <td>{fechaCorta(e.fecha)}</td>
                    <td><EstadoEmitidoChip estado={e.estado} /></td>
                    <td>{e.entregas.length ? e.entregas.map(x => x.canal).join(', ') : <span className="dc-muted">Sin entregar</span>}</td>
                    <td>
                      <div className="xc-acciones">
                        <button type="button" className="dc-btn dc-btn-sm" onClick={() => abrir(fila)}><Eye size={12} aria-hidden="true" /> Ver</button>
                        <button type="button" className="dc-btn dc-btn-sm" aria-label={`Descargar ${e.numero}`} onClick={() => { descargarTexto(`${e.numero.replace(/\//g, '-')}.txt`, textoDe(e)); registrarDescarga('emitido', e.id, e.colaboradorId, `Descargó ${e.numero}`, !!m?.sensible) }}><Download size={12} aria-hidden="true" /></button>
                        {e.estado !== 'anulado' && (
                          <button type="button" className="dc-btn dc-btn-sm dc-btn-peligro" onClick={() => { setAnulando(fila); setMotivo('') }}><Ban size={12} aria-hidden="true" /> Anular</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {viendo && (
        <Modal titulo={`${viendo.e.numero} · ${viendo.m?.nombre || ''}`} Icono={FileText} onCerrar={() => setViendo(null)} ancho={780}>
          <div className="xc-barra">
            <EstadoEmitidoChip estado={viendo.e.estado} />
            {viendo.m?.sensible && <SensibilidadChip nivel="confidencial" />}
            <span className="xc-ayuda" style={{ margin: 0 }}>Emitido el {fechaCorta(viendo.e.fecha)} por {viendo.e.emitidoPor} · plantilla versión {viendo.e.versionPlantilla}</span>
          </div>
          {viendo.e.anulado && <div className="xc-aviso xc-aviso-gris"><Ban size={15} aria-hidden="true" /><p><b>Anulado</b> el {fechaCorta(viendo.e.anulado.fecha)} por {viendo.e.anulado.por}: {viendo.e.anulado.motivo}</p></div>}
          {viendo.e.acuse && <div className="xc-aviso xc-aviso-verde"><CircleCheck size={15} aria-hidden="true" /><p><b>Acusó recibo</b> el {fechaCorta(viendo.e.acuse.fecha)} · {viendo.e.acuse.dispositivo}</p></div>}
          <p className="xc-ayuda" style={{ margin: 0 }}>Entregas: {viendo.e.entregas.length ? viendo.e.entregas.map(x => `${x.canal} (${fechaCorta(x.fecha)}, ${x.por})`).join(' · ') : 'ninguna todavía'}.</p>
          <HojaDocumento texto={textoDe(viendo.e)} compacta />
        </Modal>
      )}

      {anulando && (
        <Modal
          titulo={`Anular ${anulando.e.numero}`}
          Icono={Ban}
          onCerrar={() => setAnulando(null)}
          ancho={480}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setAnulando(null)}>Cancelar</button>
            <button type="button" className="pl-btn-save" disabled={motivo.trim().length < 5} onClick={() => { anular(anulando.e.id, motivo.trim()); setAnulando(null) }}>Anular documento</button>
          </>}
        >
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--text-heading)' }}>
            Un documento emitido no se edita: se anula y, si hace falta, se emite uno nuevo. El número <b>{anulando.e.numero}</b> queda anulado y no se vuelve a usar (RN-15).
          </p>
          <label className="pl-label" htmlFor="xc-motivo">
            Motivo de la anulación
            <textarea id="xc-motivo" className="pl-input xc-textarea" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="El cargo del certificado no era el actual." autoFocus />
            <span className="xc-ayuda">Obligatorio. Queda en la bitácora y en el documento.</span>
          </label>
          <Etiqueta tono="gris">{anulando.p?.name} · {anulando.m?.nombre}</Etiqueta>
        </Modal>
      )}
    </div>
  )
}
