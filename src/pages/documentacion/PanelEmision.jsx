import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, ChevronLeft, ChevronRight, CircleCheck, Download, FileText, Lock, Pencil, TriangleAlert, Upload, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import {
  CATEGORIAS, FRASES_DEFECTO, MODALIDADES, aFecha, datosPara, fechaCorta, fechaLarga, fechaNum, iso, rellenar, siguienteNumero,
} from '../../data/documentacionData'
import Desplegable from '../../components/layout/Desplegable'
import SelectorFecha from '../../components/layout/SelectorFecha'
import HojaDocumento from './HojaDocumento'
import { descargarParaImprimir } from '../../components/documentacion/utilidades'
import { guardarArchivo, nuevaClaveArchivo } from '../../utils/archivosLocales'
import { extensionDe } from '../../components/documentacion/deducir'
import { contratoVigenteDe, emisible, esAdenda, plazosFijosDe, versionPublicada } from './emisionUtil'
import './emision.css'

/* ── EMITIR, EN UNA SOLA VISTA (pantalla 11, revisada) ─────────────────────
   Era un recorrido de cinco tarjetas apiladas que obligaba a bajar y bajar. Ahora son TRES
   CAMPOS EN UNA FILA —qué emitir, el modelo, a quién— y debajo, lado a lado, lo poco que es propio
   de cada documento y la VISTA PREVIA, que se conserva: el documento final se ve antes de
   confirmar (RF-45).

   SE USA EN DOS LUGARES. Como página (Emitir, en el menú) y dentro de un modal desde el expediente
   y desde las solicitudes, con la persona ya puesta: emitir algo para alguien no obliga a irse a
   otra sección.

   NINGÚN DATO DE LA PERSONA SE TIPEA (RF-51, principio 2). Cargo, unidad, sucursal e ingreso se
   leen de su ficha; si algo está mal, se corrige allá y no en el certificado. */

/* Lo que va en la hoja de ejemplo en lugar de los datos de la persona. */
const MUESTRA = {
  'colaborador.nombre': 'Sin nombre', 'colaborador.documento': 'Nº de carnet', 'colaborador.codigo': 'Código', 'colaborador.correo': 'Correo',
  'cargo.nombre': 'Cargo', 'unidad.nombre': 'Unidad organizacional', 'sucursal.nombre': 'Sucursal', 'sucursal.ciudad': 'Ciudad',
  'ingreso.fecha': 'Fecha de ingreso', antiguedad: 'Antigüedad', 'salario.basico': 'Haber básico',
  'contrato.modalidad': 'modalidad', 'contrato.fecha_inicio': 'Fecha de inicio', 'contrato.fecha_fin': 'Fecha de fin',
}

const sumarDia = (s, n = 1) => { const d = aFecha(s); d.setDate(d.getDate() + n); return iso(d) }

/* COMO TERCER PASO DE LA PÁGINA EMITIR (`fijo`), el modelo y la persona ya vienen elegidos de los
   pasos anteriores. No hay barra arriba: una línea dice qué sale y para quién, y abajo va el mismo
   pie de los pasos 1 y 2 —Atrás, lo que falta o el número, y Emitir—. A varios, el costado no
   vuelve a preguntar a quiénes: dice cuántos salen, quién no y por qué, y deja ver o quitar a cada
   uno. Un certificado a una persona no tiene costado: la hoja va sola, al centro.
   «Emitir otro» vuelve al primer paso. */
/* EN EL RIEL DE EMITIR (`riel`, propuesta AM, 15 oct 2026): el modelo se elige en el riel de la
   izquierda y a quién en el costado, que dibuja la página con `ladoArriba`. Los destinatarios
   vienen de afuera (`para`): personas sueltas o un grupo con quienes se desmarcaron. Con una sola
   persona sale como siempre; con más, uno por cada una. */
export default function PanelEmision({ preset = {}, personaFija = false, onEmitido, enModal = false, fijo = false, onReiniciar, onAtras, riel = false, para, ladoArriba }) {
  const { modelos, personas, contratos, emitidos, parametros, empresa, emitir, emitirVarios, registrarContrato, modelo: buscarModelo } = useDocumentacion()

  /* LLEGAR YA PREELEGIDO: desde el expediente con la persona, desde una solicitud con la persona y
     el modelo, desde la ficha de un contrato con `origenId` para renovarlo con una adenda. */
  const inicial = useMemo(() => {
    const origen = contratos.find(c => c.id === preset.origenId)
    const mod = buscarModelo(preset.modeloId) || (origen ? modelos.find(m => esAdenda(m) && emisible(m)) : null)
    const colab = origen ? origen.colaboradorId : Number(preset.colaboradorId) || null
    return {
      categoria: mod?.categoria || preset.categoria || (origen ? 'contrato' : ''),
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
  const [obs, setObs] = useState('')
  /* EDITAR ESTE DOCUMENTO (16 oct 2026): el texto entero se vuelve editable sobre la hoja, sólo para
     esta emisión —firma otra persona, cambió un dato—. `null` es «como sale de la plantilla». */
  const [editado, setEditado] = useState(null) // { para: 'persona|modelo', texto }
  const obsRef = useRef(null)
  const [fechaMemo, setFechaMemo] = useState(() => iso(new Date()))
  const [k, setK] = useState({ modalidad: inicial.modalidad, inicio: inicial.inicio, fin: '', camino: 'generar', archivo: '', decision: '', origenId: inicial.origenId, comentarios: '' })
  const [resultado, setResultado] = useState(null)
  /* Emitir no envía (16 oct 2026): el documento queda en el expediente sin firmar, hasta que se sube
     el firmado. No se pide confirmación de recepción. */
  /* EMITIR A VARIOS: el mismo certificado o memorándum para un grupo. Los destinatarios se arman
     con «grupos» —una sucursal, una unidad, un cargo o una persona suelta— y se puede quitar a
     quien no corresponda. Los contratos no: cada uno lleva sus fechas y su decisión sobre el
     contrato anterior, y eso se decide persona por persona. */
  const [modo, setModo] = useState(preset.modo === 'varias' ? 'varias' : 'una')
  /* Las personas marcadas en el paso 2 de Emitir llegan como grupos sueltos: al costado se ven y
     se pueden quitar o sumar más, igual que si se hubieran agregado acá. */
  const [grupos, setGrupos] = useState(() => (preset.colaboradorIds || [])
    .map(id => personas.find(p => p.id === id)).filter(Boolean)
    .map(p => ({ tipo: 'persona', valor: p.id, etiqueta: `Persona · ${p.name}` })))
  const [quitados, setQuitados] = useState(() => new Set())
  const [verIdx, setVerIdx] = useState(0)
  const setKk = (c, v) => setK(prev => ({ ...prev, [c]: v }))

  const modelo = modelos.find(m => m.id === modeloId) || null
  const activos = personas.filter(p => p.status !== 'desvinculado')
  const gruposEf = riel
    ? (para?.ids || []).map(id => ({ tipo: 'persona', valor: id }))
    : grupos
  const quitadosEf = riel ? new Set() : quitados
  const enGrupos = p => gruposEf.some(g => (g.tipo === 'sede' ? p.sede === g.valor : g.tipo === 'area' ? p.depto === g.valor : g.tipo === 'cargo' ? p.cargo === g.valor : p.id === g.valor))
  const destinatarios = riel || (modo === 'varias' && !personaFija && categoria !== 'contrato') ? activos.filter(enGrupos) : []
  const incluidos = destinatarios.filter(p => !quitadosEf.has(p.id))
  const varios = riel
    ? incluidos.length > 1 && categoria !== 'contrato'
    : modo === 'varias' && !personaFija && categoria !== 'contrato'
  const persona = varios
    ? incluidos[Math.min(verIdx, Math.max(0, incluidos.length - 1))] || null
    : riel ? incluidos[0] || null : personas.find(p => p.id === colabId) || null
  /* En el riel la persona cambia desde afuera: lo decidido sobre el contrato de la anterior no
     vale para la nueva. Se ajusta al dibujar, no en un efecto. */
  const [personaAntes, setPersonaAntes] = useState(persona?.id ?? null)
  if (riel && (persona?.id ?? null) !== personaAntes && !varios) {
    setPersonaAntes(persona?.id ?? null)
    setK(prev => ({ ...prev, decision: '', origenId: prev.origenId && contratos.find(c => c.id === prev.origenId)?.colaboradorId === persona?.id ? prev.origenId : '' }))
  }
  const adenda = esAdenda(modelo)
  const version = versionPublicada(modelo)
  const vigente = persona ? contratoVigenteDe(persona.id, contratos, parametros) : null
  const origenes = persona ? contratos.filter(c => c.colaboradorId === persona.id && c.tipo === 'contrato' && !c.finalizado && !c.reemplazado) : []
  const origen = contratos.find(c => c.id === k.origenId) || null
  const modalidad = adenda ? origen?.modalidad : k.modalidad


  /* Lo que se puede agregar como destinatarios, en una sola lista con buscador: primero los
     grupos —que es lo que se usa para emitir a muchos—, después cada persona. */
  const opcionesGrupo = [
    ...[...new Map(activos.filter(p => p.sede).map(p => [p.sede, p.sedeNombre])).entries()].map(([v, n]) => ({ valor: `sede|${v}`, etiqueta: `Sucursal · ${n || v}` })),
    ...[...new Set(activos.map(p => p.depto).filter(Boolean))].sort().map(v => ({ valor: `area|${v}`, etiqueta: `Unidad · ${v}` })),
    ...[...new Set(activos.map(p => p.cargo).filter(Boolean))].sort().map(v => ({ valor: `cargo|${v}`, etiqueta: `Cargo · ${v}` })),
    ...activos.map(p => ({ valor: `persona|${p.id}`, etiqueta: `Persona · ${p.name}` })),
  ].filter(o => !grupos.some(g => `${g.tipo}|${g.valor}` === o.valor))
  const agregarGrupo = v => {
    if (!v) return
    const [tipo, ...resto] = v.split('|')
    const crudo = resto.join('|')
    const etiqueta = opcionesGrupo.find(o => o.valor === v)?.etiqueta || crudo
    setGrupos(prev => [...prev, { tipo, valor: tipo === 'persona' ? Number(crudo) : crudo, etiqueta }])
    setVerIdx(0)
    setResultado(null)
  }
  const quitarGrupo = g => { setGrupos(prev => prev.filter(x => x !== g)); setVerIdx(0) }
  const alternarQuitado = id => setQuitados(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })

  function proponerModalidad(m) {
    /* Un modelo de contrato ya dice su modalidad; proponerla ahorra un paso y un error. */
    if (m.id === 'm-contrato-indef') setK(prev => ({ ...prev, modalidad: 'indefinido', fin: '' }))
    if (m.id === 'm-contrato-plazo') setK(prev => ({ ...prev, modalidad: 'plazo_fijo' }))
  }
  function elegirModelo(id) {
    setModeloId(id)
    setResultado(null)
    const m = modelos.find(x => x.id === id)
    if (m) proponerModalidad(m)
  }
  function elegirPersona(id) {
    setColabId(Number(id) || null)
    setResultado(null)
    setK(prev => ({ ...prev, decision: '', origenId: '' }))
  }

  /* ── Lo que falta para poder emitir, en palabras ── */
  const faltan = []
  if (!categoria) faltan.push('elegir qué emitir')
  else if (!modelo) faltan.push('elegir el modelo')
  if (varios ? !incluidos.length : !persona) faltan.push(varios ? 'elegir a quiénes' : 'elegir a quién')
  if (modelo && persona) {
    if (categoria === 'memorandum' && obs.trim().length < 5) faltan.push(modelo.sensible ? 'escribir el hecho' : 'escribir el motivo')
    else if (categoria === 'memorandum' && /\[[^\]]*\]/.test(obs)) faltan.push('completar lo que está entre corchetes')
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
      if (!origen) faltan.push('elegir el contrato que modifica')
      if (origen && k.inicio && k.inicio < origen.inicio) faltan.push('corregir el inicio: una adenda no puede ser anterior a su contrato')
      if (!k.inicio) faltan.push('poner la fecha de inicio de la adenda')
      if (origen?.modalidad === 'plazo_fijo' && !k.fin) faltan.push('poner la nueva fecha de fin')
      if (k.fin && k.inicio && k.fin <= k.inicio) faltan.push('corregir el fin: tiene que ser posterior al inicio')
    }
  }

  const numero = categoria ? siguienteNumero(categoria, emitidos, parametros, contratos) : null
  const contratoDatos = categoria === 'contrato' ? { modalidad: modalidad || 'indefinido', inicio: k.inicio, fin: modalidad === 'indefinido' ? null : k.fin } : (persona ? contratoVigenteDe(persona.id, contratos, parametros) : null)
  const datos = persona ? { ...datosPara(persona, { empresa, contrato: contratoDatos, numero: numero ? `${numero.texto}` : undefined, observaciones: obs }), ...(categoria === 'memorandum' ? { 'documento.fecha': fechaLarga(fechaMemo) } : {}) } : null
  /* SIN NADIE ELEGIDO, LA HOJA IGUAL SE VE (riel): con los datos de la empresa y, en el lugar de
     los de la persona, una muestra en otro color —«Sin nombre»— que se reemplaza al elegir a quién. */
  const muestra = riel && !persona && modelo ? {
    ...datosPara(null, { empresa, numero: numero ? numero.texto : undefined }),
    ...(categoria === 'memorandum' ? { 'documento.fecha': fechaLarga(fechaMemo) } : {}),
    ...Object.fromEntries(Object.entries(MUESTRA).map(([c, v]) => [c, `⟪${v}⟫`])),
  } : null
  const previa = version && datos ? rellenar(version.texto, datos) : ''
  /* UN DOCUMENTO CON HUECOS NO SALE (RN-17): lo que la plantilla no pudo rellenar se ve marcado en
     la hoja y el botón no emite. */
  const huecos = (previa.match(/\{\{[^}]*\}\}/g) || []).length
  /* A VARIOS, UN HUECO NO FRENA A TODOS: quien tenga un dato sin llenar en su ficha se queda
     fuera de esta emisión, dicho con su nombre, y los demás salen. */
  const sinDatos = varios && version
    ? incluidos.filter(p => /\{\{[^}]*\}\}/.test(rellenar(version.texto, { ...datosPara(p, { empresa, contrato: contratoVigenteDe(p.id, contratos, parametros), numero: 'X', observaciones: obs }), ...(categoria === 'memorandum' ? { 'documento.fecha': fechaLarga(fechaMemo) } : {}) })))
    : []
  const aEmitir = incluidos.filter(p => !sinDatos.includes(p))
  if (varios) { if (incluidos.length && !aEmitir.length && faltan.length === 0) faltan.push('completar los datos que la plantilla necesita') }
  else if (huecos && faltan.length === 0) faltan.push(`completar ${huecos === 1 ? 'un dato que' : `${huecos} datos que`} la plantilla necesita`)
  const listo = faltan.length === 0 && !!version
  const ultimoNumero = varios && numero && aEmitir.length > 1
    ? siguienteNumero(categoria, [...Array(aEmitir.length - 1)].map(() => ({ categoria, gestion: numero.gestion })).concat(emitidos), parametros, contratos).texto
    : null

  const unaPersona = !varios || (incluidos.length === 1 && aEmitir.length === 1)
  const paraQuien = `${persona?.id}|${modelo?.id}`
  const textoLibre = unaPersona && editado?.para === paraQuien ? editado.texto : null
  const setTextoLibre = t => setEditado(t === null ? null : { para: paraQuien, texto: t })

  function confirmar() {
    if (!listo) return
    // Con el texto editado, a una sola persona: sale como un documento suelto, con ese texto.
    if (varios && textoLibre === null) {
      const nuevos = emitirVarios({ modeloId: modelo.id, colaboradorIds: aEmitir.map(p => p.id), observaciones: obs, fecha: categoria === 'memorandum' ? fechaMemo : null })
      setResultado({ tipo: 'varios', ids: nuevos.map(n => n.id), loteId: nuevos[0]?.loteId, omitidos: sinDatos.map(p => p.name) })
      onEmitido?.({ tipo: 'varios', ids: nuevos.map(n => n.id), numero: nuevos.map(n => n.numero).join(', ') })
      return
    }
    if (categoria === 'contrato') {
      const nuevo = registrarContrato({
        colaboradorId: persona.id, modalidad, inicio: k.inicio, fin: modalidad === 'indefinido' ? null : k.fin,
        modeloId: modelo.id, comentarios: k.comentarios, origenId: adenda ? origen.id : null,
        camino: adenda ? 'generar' : k.camino, archivo: k.camino === 'cargar' ? k.archivo : null,
        decision: adenda ? null : (vigente ? k.decision : null), anteriorId: adenda ? null : vigente?.id,
      })
      setResultado({ tipo: 'contrato', id: nuevo.id, numero: nuevo.numero, texto: previa.replace(numero.texto, nuevo.numero) })
      onEmitido?.({ tipo: 'contrato', id: nuevo.id, numero: nuevo.numero })
    } else {
      const nuevo = emitir({ modeloId: modelo.id, colaboradorId: persona.id, observaciones: obs, fecha: categoria === 'memorandum' ? fechaMemo : null, textoEditado: textoLibre })
      setResultado({ tipo: 'emitido', id: nuevo.id })
      onEmitido?.({ tipo: 'emitido', id: nuevo.id, numero: nuevo.numero })
    }
  }

  function reiniciar() {
    if (onReiniciar) { onReiniciar(); return }
    setResultado(null); setObs(''); setModeloId(''); setCategoria(''); setGrupos([]); setQuitados(new Set()); setVerIdx(0)
    if (!personaFija) setColabId(null)
    setK({ modalidad: '', inicio: '', fin: '', camino: 'generar', archivo: '', decision: '', origenId: '', comentarios: '' })
  }

  if (resultado?.tipo === 'varios') return <ResultadoVarios resultado={resultado} modelo={modelo} onOtro={reiniciar} enModal={enModal} />
  if (resultado) return <Resultado resultado={resultado} persona={persona} modelo={modelo} onOtro={reiniciar} enModal={enModal} />

  /* ── ESCRIBIR SOBRE LA HOJA (propuesta H2) ──
     La hoja es el formulario: el hecho del memorándum se escribe en su lugar dentro del documento
     y la fecha se cambia tocándola. Al costado queda sólo lo que no es texto del documento: qué
     falta, los antecedentes, los textos frecuentes y, en un contrato, sus fechas y decisiones. */
  const memo = categoria === 'memorandum'
  const corchetes = /\[[^\]]*\]/.test(obs)
  const frases = memo && modelo ? (modelo.frases || FRASES_DEFECTO[modelo.id] || []) : []
  const usarFrase = f => {
    setObs(o => (o.trim() ? `${o.trim()} ` : '') + f)
    /* Lo que hay que completar queda seleccionado: se escribe encima sin buscarlo. */
    requestAnimationFrame(() => {
      const t = obsRef.current
      if (!t) return
      const i = t.value.indexOf('[')
      t.focus()
      if (i >= 0) t.setSelectionRange(i, t.value.indexOf(']', i) + 1)
    })
  }
  /* Antecedentes: el mismo memorándum para la misma persona en los últimos doce meses. Se avisa,
     no se bloquea: puede corresponder, pero quien emite tiene que saberlo antes. */
  const haceUnAnio = sumarDia(iso(new Date()), -365)
  const antecedentes = memo && modelo && persona && !varios
    ? emitidos.filter(e => e.colaboradorId === persona.id && e.modeloId === modelo.id && e.estado !== 'anulado' && e.fecha >= haceUnAnio)
    : []
  /* Los modelos que más se emiten, primero: es lo de todos los días. */
  const usos = emitidos.reduce((m, e) => m.set(e.modeloId, (m.get(e.modeloId) || 0) + 1), new Map())
  const frecuentes = new Set(modelos.filter(emisible).sort((a, b) => (usos.get(b.id) || 0) - (usos.get(a.id) || 0)).slice(0, 3).filter(m => usos.get(m.id)).map(m => m.id))
  const opcionesModelo = modelos.filter(emisible)
    .filter(m => !(varios || modo === 'varias') || m.categoria !== 'contrato' || personaFija)
    .sort((a, b) => (frecuentes.has(b.id) - frecuentes.has(a.id)) || Object.keys(CATEGORIAS).indexOf(a.categoria) - Object.keys(CATEGORIAS).indexOf(b.categoria))
    .map(m => ({ valor: m.id, etiqueta: m.nombre, lateral: frecuentes.has(m.id) ? 'Frecuente' : CATEGORIAS[m.categoria]?.label }))
  const ocultosTodos = modelos.length - modelos.filter(emisible).length
  function elegirModeloUnico(id) {
    const m = modelos.find(x => x.id === id)
    if (!m) return
    setCategoria(m.categoria)
    elegirModelo(id)
  }
  const lista = !modelo || !persona ? [] : memo
    ? [
        { t: 'Datos de la ficha', ok: huecos === 0 },
        { t: 'Fecha', ok: !!fechaMemo },
        { t: corchetes ? 'Completar lo que está entre corchetes' : 'El hecho', ok: obs.trim().length >= 5 && !corchetes },
      ]
    : [
        { t: 'Datos de la ficha', ok: varios ? aEmitir.length > 0 : huecos === 0 },
        ...faltan.filter(f => !/datos? que la plantilla|elegir/.test(f)).map(f => ({ t: f[0].toUpperCase() + f.slice(1), ok: false })),
      ]

  const textoBoton = categoria === 'contrato' ? (adenda ? 'Registrar adenda' : 'Registrar contrato') : varios && aEmitir.length > 1 ? `Emitir ${aEmitir.length} documentos` : 'Emitir documento'
  const quien = varios ? `${incluidos.length} ${incluidos.length === 1 ? 'persona' : 'personas'}` : persona?.name
  const bajada = !modelo ? ''
    : categoria === 'contrato' ? `${modelo.nombre} para ${quien}. Complete los datos al costado: la hoja cambia a medida que completa.`
      : memo ? `${modelo.nombre} para ${quien}. ${modelo.sensible ? 'Escriba el hecho' : 'Escriba el motivo'} en el recuadro de la hoja${varios ? '; el texto es el mismo para todos' : ''}.`
        : varios ? `${modelo.nombre} para ${quien}: sale uno por persona, cada uno con los datos de su ficha.`
          : `${modelo.nombre} para ${quien}. Sale con los datos de su ficha; no hace falta escribir nada.`
  const sinLado = !riel && fijo && !varios && !memo && categoria !== 'contrato' && antecedentes.length === 0

  return (
    <div className={`xe-panel xh${enModal ? ' xe-en-modal' : ''}${fijo ? ' xe-fijo' : ''}${riel ? ' xe-riel' : ''}`}>
      {fijo && bajada && <p className="xw-bajada">{bajada}</p>}
      {/* ── ARRIBA: QUÉ, A QUIÉN Y EMITIR ── */}
      {!fijo && !riel && <div className={`xh-barra${enModal ? '' : ' dc-tarjeta'}`}>
        {!fijo && <div className="xh-modelo">
          <Desplegable
            valor={modeloId}
            onCambio={elegirModeloUnico}
            ariaLabel="Qué emitir"
            placeholder="¿Qué va a emitir?"
            conBuscador
            buscaPh="Buscar modelo…"
            nota={ocultosTodos > 0 ? `${ocultosTodos === 1 ? 'Un modelo no aparece' : `${ocultosTodos} modelos no aparecen`}: inactivo${ocultosTodos === 1 ? '' : 's'} o sin plantilla publicada.` : undefined}
            opciones={opcionesModelo}
          />
        </div>}
        {!personaFija && !fijo && (
          <div className="xh-quien">
            {categoria !== 'contrato' && (
              <span className="xe-modo" role="group" aria-label="Cuántas personas">
                <button type="button" className={modo === 'una' ? 'on' : ''} aria-pressed={modo === 'una'} onClick={() => { setModo('una'); setResultado(null) }}>Una persona</button>
                <button type="button" className={modo === 'varias' ? 'on' : ''} aria-pressed={modo === 'varias'} onClick={() => { setModo('varias'); setResultado(null); setVerIdx(0) }}>Varias</button>
              </span>
            )}
            {!varios && (
              <Desplegable
                valor={colabId ? String(colabId) : ''}
                onCambio={elegirPersona}
                ariaLabel="A quién"
                placeholder="¿A quién?"
                conBuscador
                buscaPh="Nombre, cargo o código…"
                nota="Las personas desvinculadas no aparecen: su expediente está cerrado."
                opciones={activos.map(p => ({ valor: String(p.id), etiqueta: p.name, lateral: p.cargo || 'Sin cargo' }))}
              />
            )}
          </div>
        )}
        {modelo?.sensible && <span className="xh-sello" title="Su jefe no lo verá salvo permiso explícito, y cada vez que alguien lo abra queda registrado."><Lock size={12} aria-hidden="true" /> Confidencial</span>}
        <span className="xh-esp" />
        {numero && modelo && <span className="xh-numero">{varios && ultimoNumero ? `${numero.texto} al ${ultimoNumero}` : numero.texto}</span>}
        <button type="button" className="pl-btn-new" disabled={!listo} onClick={confirmar} title={listo ? undefined : `Falta ${faltan.join(', ')}.`} style={listo ? undefined : { opacity: .5, cursor: 'not-allowed' }}>
          <CircleCheck size={14} color="#00E091" /> {textoBoton}
        </button>
      </div>}

      {modeloId === '' && opcionesModelo.length === 0 && (
        <div className="xc-aviso xc-aviso-ambar"><TriangleAlert size={15} aria-hidden="true" /><p>No hay modelos listos para emitir. <Link className="xc-enlace" to="/documentos/configuracion?ver=plantillas">Revise los modelos</Link>: un modelo necesita estar activo y tener su plantilla publicada.</p></div>
      )}

      <div className={`xh-cuerpo${sinLado ? ' xh-solo' : ''}`}>
        {/* ── LA HOJA ── */}
        <section className="xh-mesa" aria-label="Documento">
          {varios && persona && modelo && version && incluidos.length > 0 && (
            <div className="xe-previa-cab">
              <span>Hoja de <b>{persona.name}</b> · {incluidos.indexOf(persona) + 1} de {incluidos.length}</span>
              <span className="xe-previa-nav">
                <button type="button" aria-label="Anterior" disabled={incluidos.indexOf(persona) <= 0} onClick={() => setVerIdx(i => Math.max(0, i - 1))}><ChevronLeft size={16} /></button>
                <button type="button" aria-label="Siguiente" disabled={incluidos.indexOf(persona) >= incluidos.length - 1} onClick={() => setVerIdx(i => Math.min(incluidos.length - 1, i + 1))}><ChevronRight size={16} /></button>
              </span>
            </div>
          )}
          {muestra && version && (
            <div className="xe-previa-cab xh-muestra-cab">
              <span>Hoja de ejemplo: elija al costado para quién es y se completa con sus datos.</span>
            </div>
          )}
          {persona && modelo && version && unaPersona && categoria !== 'contrato' && (
            <div className={`xe-previa-cab xe-editar${textoLibre !== null ? ' on' : ''}`}>
              {textoLibre === null
                ? <><span>¿Hay que cambiar algo sólo en este documento? Quién firma, un dato que cambió…</span>
                  <button type="button" className="dc-btn dc-btn-sm" onClick={() => setTextoLibre(previa)}><Pencil size={13} aria-hidden="true" /> Editar documento</button></>
                : <><span><b>Editando sólo este documento.</b> La plantilla y los datos de {persona.name.split(' ')[0]} no cambian.</span>
                  <button type="button" className="dc-btn dc-btn-sm" onClick={() => setTextoLibre(null)}>Volver a la plantilla</button></>}
            </div>
          )}
          {textoLibre !== null && persona ? (
            <HojaLibre valor={textoLibre} onCambio={setTextoLibre} />
          ) : (persona || muestra) && modelo && version ? (
            <HojaEditable
              plantilla={version.texto}
              datos={datos || muestra}
              editable={memo || /\{\{\s*memo\.observaciones/.test(version.texto)}
              conFecha={memo}
              obs={obs}
              onObs={setObs}
              obsRef={obsRef}
              obsPh={!memo ? 'Escriba aquí lo que corresponda a esta persona.' : modelo.sensible ? 'Describa el hecho con fechas concretas: «tres atrasos injustificados los días 4, 11 y 18 de agosto».' : 'El motivo del reconocimiento, con el hecho concreto.'}
              obsEti={!memo ? 'Escriba aquí' : modelo.sensible ? 'Escriba aquí el hecho' : 'Escriba aquí el motivo'}
              fecha={fechaMemo}
              onFecha={v => setFechaMemo(v || iso(new Date()))}
              comun={varios}
            />
          ) : (
            <div className="xe-previa-vacia">
              <FileText size={28} strokeWidth={1.4} aria-hidden="true" />
              <p>{riel ? (!modelo ? 'Elija a la izquierda qué va a emitir.' : 'Elija al costado para quién es.') : !modelo ? 'Elija arriba qué va a emitir.' : varios ? 'Agregue a quiénes, al costado.' : 'Elija arriba a quién.'}<br />El documento aparece aquí, tal como va a salir, y lo que haya que escribir se escribe sobre él.</p>
            </div>
          )}
        </section>

        {/* ── AL COSTADO: LO QUE NO ES TEXTO DEL DOCUMENTO ── */}
        {!sinLado && <aside className={`xh-lado${enModal ? '' : ' dc-tarjeta'}`}>
          {riel && ladoArriba?.({ sinDatos: sinDatos.map(p => p.id), viendo: persona?.id, ver: id => setVerIdx(Math.max(0, incluidos.findIndex(p => p.id === id))), unaSola: categoria === 'contrato' })}

          {varios && fijo && !riel && (
            <div className="xh-bloque">
              <h2 className="xe-tit">{sinDatos.length ? `Salen ${aEmitir.length} de ${incluidos.length}` : `Salen ${aEmitir.length}, uno por persona`}</h2>
              {sinDatos.length > 0 && (
                <div className="xc-aviso xc-aviso-ambar">
                  <TriangleAlert size={15} aria-hidden="true" />
                  <p><b>{sinDatos.map(p => p.name).join(', ')}</b> no {sinDatos.length === 1 ? 'sale' : 'salen'}: a su ficha le falta un dato que la plantilla usa.</p>
                </div>
              )}
              <ul className="xw-dest">
                {incluidos.map((p, i) => (
                  <li key={p.id} className={persona?.id === p.id ? 'viendo' : undefined}>
                    <span className="xw-dest-nom">{p.name}<small>{p.cargo || 'Sin cargo'}</small></span>
                    {sinDatos.includes(p) ? <span className="xw-dest-falta">No sale</span>
                      : persona?.id === p.id ? <span className="xw-dest-viendo">Viendo</span>
                        : <button type="button" className="xw-enlace" onClick={() => setVerIdx(i)}>Ver</button>}
                    <button type="button" className="xw-dest-quitar" aria-label={`Quitar a ${p.name}`} title="Quitar" onClick={() => { alternarQuitado(p.id); setVerIdx(0) }}><X size={14} /></button>
                  </li>
                ))}
              </ul>
              {quitados.size > 0 && (
                <p className="xh-ayuda">Quitó a {quitados.size}. <button type="button" className="xw-enlace" onClick={() => setQuitados(new Set())}>Volver a incluir</button></p>
              )}
              {onAtras && <button type="button" className="xw-enlace" onClick={onAtras}>Cambiar a quiénes</button>}
            </div>
          )}

          {varios && !fijo && !riel && (
            <div className="xh-bloque">
              <h2 className="xe-tit">A quiénes</h2>
              <div className="xe-grupos">
                {grupos.map(g => (
                  <span key={`${g.tipo}|${g.valor}`} className="xe-chip">
                    {g.etiqueta}
                    <button type="button" aria-label={`Quitar ${g.etiqueta}`} onClick={() => quitarGrupo(g)}>×</button>
                  </span>
                ))}
                <div className="xe-agregar">
                  <Desplegable valor="" onCambio={agregarGrupo} ariaLabel="Agregar destinatarios" placeholder={grupos.length ? '+ Agregar más' : 'Sucursal, unidad, cargo o persona'} conBuscador buscaPh="Sucursal, unidad, cargo o nombre…" opciones={opcionesGrupo} />
                </div>
              </div>
              {destinatarios.length > 0 && (
                <div className="xe-destinos">
                  <div className="xe-destinos-cab"><b>Destinatarios · {incluidos.length}</b><span>Quite a quien no corresponda</span></div>
                  <ul className="xe-destinos-lista">
                    {destinatarios.map(p => {
                      const fuera = quitados.has(p.id)
                      const falta = sinDatos.includes(p)
                      return (
                        <li key={p.id} className={fuera ? 'fuera' : undefined}>
                          <label>
                            <input type="checkbox" checked={!fuera} onChange={() => alternarQuitado(p.id)} />
                            <span className="xe-destino-nom">{p.name}<small> · {p.cargo || 'Sin cargo'}</small></span>
                          </label>
                          {falta && <span className="xe-destino-aviso" title="A su ficha le falta un dato que la plantilla usa">Le falta un dato · no se emite</span>}
                          {!fuera && !falta && <button type="button" className="xe-destino-ver" onClick={() => setVerIdx(incluidos.indexOf(p))}>Ver</button>}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!fijo && !riel && lista.length > 0 && (
            <div className="xh-bloque">
              <h2 className="xe-tit">{lista.every(x => x.ok) ? 'Listo para emitir' : 'Lo que falta'}</h2>
              <ul className="xh-lista">
                {lista.map(x => (
                  <li key={x.t} className={x.ok ? 'ok' : 'falta'}>
                    <span className="xh-marca" aria-hidden="true">{x.ok && <Check size={11} strokeWidth={3} />}</span>
                    {x.t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {antecedentes.length > 0 && (
            <div className="xc-aviso xc-aviso-ambar">
              <TriangleAlert size={15} aria-hidden="true" />
              <p>Ya tiene {antecedentes.length === 1 ? <b>uno igual</b> : <b>{antecedentes.length} iguales</b>} en los últimos 12 meses: {antecedentes.slice(0, 3).map(e => `${e.numero} (${fechaCorta(e.fecha)})`).join(', ')}. Revíselo antes de emitir otro.</p>
            </div>
          )}

          {frases.length > 0 && (
            <div className="xh-bloque">
              <h2 className="xe-tit">Textos frecuentes</h2>
              <p className="xh-ayuda">Un clic lo pone en la hoja; complete lo que está entre corchetes.</p>
              <div className="xh-frases">
                {frases.map(f => (
                  <button key={f.titulo} type="button" className="xh-frase" onClick={() => usarFrase(f.texto)} title={f.texto}>{f.titulo}</button>
                ))}
              </div>
            </div>
          )}

          {!fijo && !riel && modelo && persona && (categoria === 'certificado' || categoria === 'otro') && (
            <p className="xc-ayuda" style={{ margin: 0 }}>No hace falta escribir nada: {varios ? 'cada uno sale con los datos de su ficha' : 'sale con los datos de la ficha'}, el número se asigna al emitir y la fecha es la de hoy ({fechaNum(iso(new Date()))}).</p>
          )}

          {modelo && persona && categoria === 'contrato' && !adenda && (
            <div className="xc-col xh-bloque" style={{ gap: 12 }}>
              <h2 className="xe-tit">Datos del contrato</h2>
              {vigente && (
                /* RN-18: DOS CONTRATOS VIGENTES DEJAN A PLANILLAS SIN SABER CUÁL APLICAR. No se
                   elige por omisión: la decisión es de quien registra, y se toma acá. */
                <div className="xc-aviso xc-aviso-ambar" role="alert">
                  <TriangleAlert size={15} aria-hidden="true" />
                  <div className="xc-aviso-cuerpo">
                    <p><b>Ya tiene un contrato vigente</b>: {vigente.numero}, {MODALIDADES[vigente.modalidad].toLowerCase()}. ¿Qué pasa con ese contrato?</p>
                    <div className="xc-radios" role="radiogroup" aria-label="Qué pasa con el contrato vigente">
                      <label className={`xc-radio${k.decision === 'finalizar' ? ' on' : ''}`}>
                        <input type="radio" name="xe-decision" checked={k.decision === 'finalizar'} onChange={() => setKk('decision', 'finalizar')} />
                        <span>Finalizarlo<small>El contrato nuevo empieza una relación nueva.</small></span>
                      </label>
                      <label className={`xc-radio${k.decision === 'reemplazar' ? ' on' : ''}`}>
                        <input type="radio" name="xe-decision" checked={k.decision === 'reemplazar'} onChange={() => setKk('decision', 'reemplazar')} />
                        <span>Reemplazarlo<small>El anterior se conserva, marcado como reemplazado.</small></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              <div className="pl-label">
                Modalidad
                <Desplegable valor={k.modalidad} onCambio={v => setK(prev => ({ ...prev, modalidad: v, fin: v === 'indefinido' ? '' : prev.fin }))} ariaLabel="Modalidad" opciones={Object.entries(MODALIDADES).map(([v, t]) => ({ valor: v, etiqueta: t }))} />
              </div>
              <div className="xc-fila">
                <div className="pl-label">
                  Inicio
                  <SelectorFecha id="xe-k-inicio" valor={k.inicio} onCambio={v => setKk('inicio', v)} ariaLabel="Fecha de inicio" />
                </div>
                {k.modalidad !== 'indefinido' && (
                  <div className="pl-label">
                    Fin{k.modalidad === 'plazo_fijo' ? '' : ' (opcional)'}
                    <SelectorFecha id="xe-k-fin" valor={k.fin} onCambio={v => setKk('fin', v)} ariaLabel="Fecha de fin" />
                  </div>
                )}
              </div>
              {k.modalidad === 'plazo_fijo' && plazosFijosDe(persona.id, contratos) >= 2 && (
                <div className="xc-aviso xc-aviso-ambar"><TriangleAlert size={15} aria-hidden="true" /><p>Ya encadena {plazosFijosDe(persona.id, contratos)} contratos a plazo fijo: encadenar más puede convertir la relación en indefinida. Consúltelo con Legal; el sistema avisa, no bloquea.</p></div>
              )}
              <div className="xe-seg" role="radiogroup" aria-label="Cómo se registra">
                <button type="button" role="radio" aria-checked={k.camino === 'generar'} className={k.camino === 'generar' ? 'on' : ''} onClick={() => setKk('camino', 'generar')}>Generar desde la plantilla</button>
                <button type="button" role="radio" aria-checked={k.camino === 'cargar'} className={k.camino === 'cargar' ? 'on' : ''} onClick={() => setKk('camino', 'cargar')}>Subir el firmado</button>
              </div>
              {k.camino === 'cargar' && (
                <label className="dc-btn" style={{ alignSelf: 'flex-start', cursor: 'pointer' }}>
                  <Upload size={13} aria-hidden="true" /> {k.archivo ? `Adjunto: ${k.archivo}` : 'Adjuntar el firmado (PDF)'}
                  <input type="file" accept="application/pdf,image/*" hidden onChange={e => setKk('archivo', e.target.files?.[0]?.name || '')} />
                </label>
              )}
              <label className="pl-label" htmlFor="xe-k-com">
                Comentarios (opcional)
                <textarea id="xe-k-com" className="pl-input xc-textarea" style={{ minHeight: 60 }} value={k.comentarios} onChange={e => setKk('comentarios', e.target.value)} />
              </label>
            </div>
          )}

          {modelo && persona && categoria === 'contrato' && adenda && (
            <div className="xc-col xh-bloque" style={{ gap: 12 }}>
              <h2 className="xe-tit">Datos de la adenda</h2>
              <div className="pl-label">
                Contrato que modifica
                {origenes.length === 0 ? (
                  <p className="xc-error">No tiene ningún contrato vigente: una adenda no existe sin contrato origen (RN-19). Registre primero el contrato.</p>
                ) : (
                  <Desplegable
                    valor={k.origenId}
                    onCambio={v => { const o = contratos.find(c => c.id === v); setK(prev => ({ ...prev, origenId: v, inicio: prev.inicio || (o?.fin ? sumarDia(o.fin) : '') })) }}
                    ariaLabel="Contrato origen"
                    opciones={origenes.map(c => ({ valor: c.id, etiqueta: `${c.numero} · ${MODALIDADES[c.modalidad]}${c.fin ? ` hasta ${fechaCorta(c.fin)}` : ''}` }))}
                  />
                )}
              </div>
              {origen && (
                <div className="xc-fila">
                  <div className="pl-label">
                    Rige desde
                    <SelectorFecha id="xe-a-inicio" valor={k.inicio} onCambio={v => setKk('inicio', v)} ariaLabel="Inicio de la adenda" />
                  </div>
                  {origen.modalidad !== 'indefinido' && (
                    <div className="pl-label">
                      Nuevo fin
                      <SelectorFecha id="xe-a-fin" valor={k.fin} onCambio={v => setKk('fin', v)} ariaLabel="Nueva fecha de fin" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {riel && modelo && (
            <div className="xr-enviar">
              <p className={`xr-enviar-nota${listo ? '' : ' falta'}`} aria-live="polite">
                {!listo ? `Falta ${faltan.join(', ')}.`
                  : varios && ultimoNumero ? <>Salen del <b>{numero?.texto}</b> al <b>{ultimoNumero}</b>, uno por persona.</>
                    : <>Sale con el número <b>{numero?.texto}</b> y queda en su expediente.</>}
              </p>
              <button type="button" className="pl-btn-new xr-boton" disabled={!listo} onClick={confirmar}>
                <CircleCheck size={15} color="#00E091" aria-hidden="true" /> {categoria === 'contrato' ? textoBoton : aEmitir.length > 1 ? `Emitir ${aEmitir.length} documentos` : persona ? `Emitir para ${persona.name.split(' ')[0]}` : 'Emitir documento'}
              </button>
            </div>
          )}

          {!fijo && !riel && <p className="xh-resumen" aria-live="polite">
            {!modelo ? 'Elija qué va a emitir.'
              : !listo ? `Falta ${faltan.join(', ')}.`
                : varios ? <>Se emitirán <b>{aEmitir.length}</b>, uno por persona{ultimoNumero ? <>, del <b>{numero?.texto}</b> al <b>{ultimoNumero}</b></> : <>, con el número <b>{numero?.texto}</b></>}. Cada uno queda en el expediente de su dueño.{sinDatos.length ? ` ${sinDatos.length} se quedan fuera por un dato faltante.` : ''}</>
                  : <>Sale con el número <b>{numero?.texto}</b> y queda en el expediente de {persona?.name.split(' ')[0]}.</>}
          </p>}
        </aside>}
      </div>

      {/* EL PIE DE LOS PASOS: Atrás, lo que falta (o el número que sale) y el botón. */}
      {fijo && (
        <div className="xw-pie xw-pie-ancho">
          {onAtras
            ? <button type="button" className="dc-btn xw-atras" onClick={onAtras}><ArrowLeft size={15} aria-hidden="true" /> Atrás</button>
            : <span />}
          <span className={`xw-pie-ayuda${listo ? '' : ' falta'}`} aria-live="polite">
            {!listo ? `Falta ${faltan.join(', ')}.`
              : varios && ultimoNumero ? <>Números del <b>{numero?.texto}</b> al <b>{ultimoNumero}</b></>
                : <>Saldrá con el número <b>{numero?.texto}</b></>}
          </span>
          <button type="button" className="pl-btn-new xw-siguiente" disabled={!listo} onClick={confirmar}>
            <CircleCheck size={15} color="#00E091" aria-hidden="true" /> {textoBoton}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── LA HOJA EDITABLE ──────────────────────────────────────────────────────
   El documento tal como va a salir, con dos lugares que se tocan: el hecho, que se escribe en su
   sitio, y la fecha, que se cambia con un clic sobre ella. Lo que la plantilla no pudo rellenar
   se marca igual que en la vista previa de siempre. Fuera de un memorándum es sólo la hoja. */
const MARCA_OBS = '⟦OBS⟧'
const MARCA_FECHA = '⟦FECHA⟧'

function HojaEditable({ plantilla, datos, editable, conFecha = editable, obs, onObs, obsRef, obsPh, obsEti, fecha, onFecha, comun }) {
  /* El recuadro para escribir sale en cualquier plantilla que lo tenga; la fecha que se toca, sólo
     en el memorándum, que es el único que la guarda al emitir. */
  const texto = rellenar(plantilla, editable ? { ...datos, 'memo.observaciones': MARCA_OBS, ...(conFecha ? { 'documento.fecha': MARCA_FECHA } : {}) } : datos)
  const partes = texto.split(/(⟦OBS⟧|⟦FECHA⟧|⟪[^⟫]*⟫|\{\{[^}]*\}\})/g)
  return (
    <div className="xc-hoja xh-hoja" aria-label="El documento a emitir">
      {partes.map((p, i) => {
        if (p === MARCA_OBS) return <AreaEnHoja key={i} valor={obs} onCambio={onObs} areaRef={obsRef} ph={obsPh} eti={comun ? `${obsEti} · igual para todos` : obsEti} />
        if (p === MARCA_FECHA) return <FechaEnHoja key={i} valor={fecha} onCambio={onFecha} />
        if (/^⟪[^⟫]*⟫$/.test(p)) return <mark key={i} className="xh-muestra" title="Dato de ejemplo: se completa al elegir a quién">{p.slice(1, -1)}</mark>
        if (/^\{\{[^}]*\}\}$/.test(p)) return <mark key={i} className="xc-hueco" title="Este dato no se pudo rellenar">{p}</mark>
        /* El recuadro ya es un bloque: el salto de línea que lo sigue en la plantilla dejaría un renglón vacío de más. */
        return <span key={i}>{partes[i - 1] === MARCA_OBS ? p.replace(/^\n/, '') : p}</span>
      })}
    </div>
  )
}

/* LA HOJA ENTERA, EDITABLE: el mismo papel y la misma letra, pero todo el texto se puede cambiar.
   Crece con lo que se escribe, como el recuadro del memorándum. */
function HojaLibre({ valor, onCambio }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const t = ref.current
    if (!t) return
    t.style.height = 'auto'
    t.style.height = `${t.scrollHeight}px`
  }, [valor])
  return (
    <div className="xc-hoja xh-hoja xe-hoja-libre">
      <textarea ref={ref} value={valor} onChange={e => onCambio(e.target.value)} aria-label="Texto del documento" spellCheck />
    </div>
  )
}

/* El recuadro donde se escribe crece con el texto: en la hoja no hay barra de desplazamiento. */
function AreaEnHoja({ valor, onCambio, areaRef, ph, eti }) {
  const propio = useRef(null)
  const ref = areaRef || propio
  useLayoutEffect(() => {
    const t = ref.current
    if (!t) return
    t.style.height = 'auto'
    t.style.height = `${t.scrollHeight}px`
  }, [valor, ref])
  const vacio = !valor.trim()
  return (
    <span className={`xh-campo${vacio ? ' vacio' : ''}`}>
      <span className="xh-campo-eti" aria-hidden="true">{eti}</span>
      <textarea ref={ref} className="xh-area" value={valor} onChange={e => onCambio(e.target.value)} placeholder={ph} aria-label={eti} rows={3} />
    </span>
  )
}

function FechaEnHoja({ valor, onCambio }) {
  const [abierta, setAbierta] = useState(false)
  const cajaRef = useRef(null)
  useEffect(() => {
    if (!abierta) return
    const fuera = e => {
      /* El calendario puede dibujarse fuera de la caja; un clic en él no cuenta como «fuera». */
      if (cajaRef.current?.contains(e.target) || e.target.closest?.('[class*="fecha"], [class*="cal"]')) return
      setAbierta(false)
    }
    const esc = e => { if (e.key === 'Escape') { e.stopPropagation(); setAbierta(false) } }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc, true)
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', esc, true) }
  }, [abierta])
  return (
    <span className="xh-fecha" ref={cajaRef}>
      <button type="button" className="xh-fecha-btn" onClick={() => setAbierta(a => !a)} aria-expanded={abierta} title="Cambiar la fecha del memorándum">
        {fechaLarga(valor)} <Pencil size={11} aria-hidden="true" />
      </button>
      {abierta && (
        <span className="xh-fecha-pop">
          <span className="xh-fecha-tit">Fecha del memorándum</span>
          <SelectorFecha id="xe-memo-fecha" valor={valor} onCambio={v => { onCambio(v); if (v) setAbierta(false) }} ariaLabel="Fecha del memorándum" />
          <button type="button" className="xh-fecha-hoy" onClick={() => { onCambio(iso(new Date())); setAbierta(false) }}>Volver a hoy</button>
        </span>
      )}
    </span>
  )
}

/* ── DESPUÉS DE EMITIR (16 oct 2026) ───────────────────────────────────────
   Emitir no envía: el documento quedó en el expediente SIN FIRMAR. Lo que sigue es lo de la vida
   real —descargarlo, imprimirlo, hacerlo firmar a mano y subir el firmado—, y por eso aquí están
   esos dos botones. El firmado se puede subir también después, desde el expediente o el envío.
   Un contrato tampoco se envía: queda en el expediente para firmarse. */
function Resultado({ resultado, persona, modelo, onOtro, enModal }) {
  const { emitidos, adjuntarFirmado, registrarDescarga } = useDocumentacion()
  const input = useRef(null)
  const [subiendo, setSubiendo] = useState(false)
  if (resultado.tipo === 'contrato') {
    return (
      <section className={`xc-exito${enModal ? '' : ' dc-tarjeta xc-paso'}`}>
        <div className="xc-exito-cab">
          <span className="xc-exito-ico"><CircleCheck size={22} aria-hidden="true" /></span>
          <div>
            <h2>{esAdenda(modelo) ? 'Adenda registrada' : 'Contrato registrado'}: {resultado.numero}</h2>
            <p>{persona?.name}. Quedó en su expediente, carpeta Contratos, como contrato vigente para Planillas.</p>
          </div>
        </div>
        <HojaDocumento texto={resultado.texto} compacta />
        <div className="xc-pie-paso" style={{ justifyContent: 'flex-start' }}>
          <Link className="pl-btn-new" to={`/documentos/expedientes/contrato/${resultado.id}`}>Abrir el contrato</Link>
          <button type="button" className="dc-btn" onClick={onOtro}>Emitir otro documento</button>
        </div>
      </section>
    )
  }
  const e = emitidos.find(x => x.id === resultado.id)
  if (!e) return null
  const descargar = () => {
    descargarParaImprimir(`${e.numero.replace(/\//g, '-')}_${persona?.codigo || ''}_para-firmar`, e.texto)
    registrarDescarga('emitido', e.id, e.colaboradorId, `Descargó ${e.numero} para imprimir y firmar`)
  }
  const subir = async files => {
    const f = [...(files || [])][0]
    if (!f) return
    setSubiendo(true)
    const clave = nuevaClaveArchivo()
    const ok = await guardarArchivo(clave, f).catch(() => false)
    adjuntarFirmado(e.id, { nombre: f.name, clave: ok === false ? null : clave, formato: extensionDe(f.name), tipoMime: f.type, tamanoKB: Math.round(f.size / 1024) })
    setSubiendo(false)
  }
  return (
    <section className={`xc-exito${enModal ? '' : ' dc-tarjeta xc-paso'}`}>
      <div className="xc-exito-cab">
        <span className="xc-exito-ico"><CircleCheck size={22} aria-hidden="true" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>Emitido: {e.numero}</h2>
          <p>{e.firmado
            ? <>Firmado y guardado en el expediente de {persona?.name}. Ya está listo.</>
            : <>{modelo?.nombre} quedó en el expediente de {persona?.name}, <b>sin firmar</b>. Descárguelo, imprímalo, hágalo firmar y suba el firmado.</>}</p>
        </div>
      </div>
      <HojaDocumento texto={e.texto} compacta />
      <div className="xc-pie-paso" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
        {e.firmado ? (
          <span className="dc-chip dc-t-verde"><Check size={12} aria-hidden="true" /> Firmado subido · {e.firmado.archivo.nombre}</span>
        ) : <>
          <button type="button" className="pl-btn-new" onClick={descargar}><Download size={14} aria-hidden="true" /> Descargar para imprimir</button>
          <button type="button" className="dc-btn" disabled={subiendo} onClick={() => input.current?.click()}><Upload size={14} aria-hidden="true" /> {subiendo ? 'Subiendo…' : 'Subir el firmado'}</button>
          <input ref={input} type="file" hidden accept="application/pdf,image/*" onChange={ev => { subir(ev.target.files); ev.target.value = '' }} />
        </>}
        {!enModal && <Link className="dc-btn" to={`/documentos/emitidos/${e.id}`}>Ver el documento</Link>}
        <button type="button" className="dc-btn" onClick={onOtro}>Emitir otro documento</button>
      </div>
    </section>
  )
}

function ResultadoVarios({ resultado, modelo, onOtro, enModal }) {
  const { emitidos } = useDocumentacion()
  const lista = resultado.ids.map(id => emitidos.find(e => e.id === id)).filter(Boolean)
  return (
    <section className={`xc-exito${enModal ? '' : ' dc-tarjeta xc-paso'}`}>
      <div className="xc-exito-cab">
        <span className="xc-exito-ico"><CircleCheck size={22} aria-hidden="true" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>Se emitieron {lista.length} documentos: {modelo?.nombre}</h2>
          <p>Del {lista[0]?.numero} al {lista[lista.length - 1]?.numero}. Cada uno quedó en el expediente de su dueño, <b>sin firmar</b>. Descárguelos, imprímalos, hágalos firmar y suba cada firmado desde su expediente.</p>
        </div>
      </div>
      {resultado.omitidos?.length > 0 && (
        <div className="xc-aviso xc-aviso-ambar"><TriangleAlert size={15} aria-hidden="true" /><p>No se emitió para {resultado.omitidos.join(', ')}: a su ficha le falta un dato que la plantilla usa. Complételo y emítaselo aparte.</p></div>
      )}
      <div className="xc-pie-paso" style={{ justifyContent: 'flex-start' }}>
        {resultado.loteId && <Link className="pl-btn-new" to={`/documentos/emitidos/${resultado.loteId}`}><Download size={14} aria-hidden="true" /> Ver y descargar todos</Link>}
        <button type="button" className="dc-btn" onClick={onOtro}>Emitir otro documento</button>
      </div>
    </section>
  )
}
