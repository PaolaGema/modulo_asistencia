import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, FolderOpen, ChevronUp, ChevronDown, ChevronsUpDown, Inbox, Send, Download, Check, FileArchive, Sheet } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera, Filtros, PersonaCelda, BarraAvance, Vacio, Modal } from '../../components/documentacion/comunes'
import { FILTROS_VACIOS, pasaFiltros, describirFiltros, exportarCSV } from '../../components/documentacion/utilidades'
import { zipDeExpedientes } from '../../components/documentacion/expedienteZip'
import { descargarBlob } from '../../components/documentacion/zip'
import { versionActual, fechaCorta } from '../../data/documentacionData'
import { pilas } from './seguimientoDatos'
import PorDocumento from './PorDocumento'
import PorRevisar from './PorRevisar'
import Paginacion from '../../components/layout/Paginacion'
import Desplegable from '../../components/layout/Desplegable'
import './expediente.css'

/* ── LEGAJOS (Documentación v3) ───────────────────────────────────────────
   La puerta del módulo, como la pestaña «Documentos» de BambooHR o el expediente de Humand: buscar a
   una persona y abrir sus carpetas. Cada fila dice ya lo que importa sin abrirla.

   LO PENDIENTE SON FILTROS, NO PANTALLAS. Una fila de pastillas arriba dice cuánto hay de cada cosa
   —lo que espera revisión, lo vencido, lo que falta— y tocar una deja en la lista sólo eso. «Por
   revisar» muestra la fila de revisión: el documento a la derecha, aprobar o rechazar, y el
   siguiente. Las otras se ven por persona o por documento, para pedir a varios de una vez.

   «Subir en lote» y «Reportes» se quitaron (15 oct 2026): cada documento se sube desde el
   expediente de su persona, y lo que importa ya se ve y se filtra en esta misma tabla. Los filtros viven en la URL: la flecha de atrás vuelve igual.

   UNA TABLA DE DATOS, PAGINADA Y ORDENABLE, como Colaboradores en Gestión de personas: con mil
   personas no se dibujan mil filas. La página y el orden también viven en la URL (`pag`, `orden`),
   y cualquier filtro nuevo vuelve a la primera página. */

const POR_PAGINA = 10

/* Por qué columna se puede ordenar y con qué valor. El pendiente suma todo lo que hay que mirar. */
const COLUMNAS = [
  { clave: 'nombre', label: 'Colaborador', valor: f => f.p.name },
  { clave: 'unidad', label: 'Unidad organizacional', valor: f => f.p.depto || '' },
  { clave: 'sucursal', label: 'Sucursal', valor: f => f.p.sedeNombre || '' },
  { clave: 'avance', label: 'Expediente completo', valor: f => (f.p.status === 'desvinculado' ? -1 : f.avance.pct ?? 101) },
  { clave: 'pendiente', label: 'Lo más urgente', valor: f => -(f.urgente?.peso ?? -1) },
]

/* «LO MÁS URGENTE» (propuesta S, 15 oct 2026): el tiempo como protagonista. De todo lo pendiente de
   una persona se muestra una sola cosa —la que más apura—: el tiempo arriba y en color («Venció hace
   12 días»), el documento debajo, una barrita del color de su estado y «+N más» por lo demás. El orden: vencido,
   rechazado, falta, contrato, por vencer, en revisión; y dentro de cada uno, lo que más tiempo lleva. */
const enTiempo = d => {
  if (d <= 0) return 'hoy'
  if (d === 1) return '1 día'
  if (d < 31) return `${d} días`
  if (d < 365) { const m = Math.round(d / 30); return `${m} ${m === 1 ? 'mes' : 'meses'}` }
  const a = Math.round(d / 365); return `${a} ${a === 1 ? 'año' : 'años'}`
}
const hace = d => (d <= 0 ? 'hoy' : `hace ${enTiempo(d)}`)
const en = d => (d <= 0 ? 'hoy' : `en ${enTiempo(d)}`)

function urgenciasDe(todo) {
  const por = new Map()
  const sumar = (id, u) => { if (!por.has(id)) por.set(id, []); por.get(id).push(u) }
  for (const x of todo.vencidos) sumar(x.persona.id, { peso: 5000 + x.dias, tono: 'rojo', pct: 100, titulo: `Venció ${hace(x.dias)}`, doc: x.subtipo.nombre })
  for (const x of todo.faltantes) {
    if (x.estado === 'rechazado') sumar(x.persona.id, { peso: 4000 + x.dias, tono: 'rojo', pct: 100, rayado: true, titulo: 'Rechazado: volver a pedirlo', doc: x.subtipo.nombre })
    else sumar(x.persona.id, { peso: 3000 + x.dias, tono: 'gris', pct: 100, rayado: true, titulo: x.dias ? `Falta desde ${hace(x.dias)}` : 'Falta entregar', doc: x.subtipo.nombre })
  }
  for (const x of todo.contratos) {
    const d = x.dias ?? 0
    sumar(x.persona.id, d < 0
      ? { peso: 2500 - d, tono: 'violeta', pct: 100, titulo: `Terminó ${hace(-d)}`, doc: 'Contrato' }
      : { peso: 2000 - d, tono: 'violeta', pct: Math.max(8, 100 - (d / 45) * 100), titulo: `Termina ${en(d)}`, doc: 'Contrato' })
  }
  for (const x of todo.por_vencer) sumar(x.persona.id, { peso: 1500 - x.dias, tono: 'ambar', pct: Math.max(8, 100 - (x.dias / 90) * 100), titulo: `Vence ${en(x.dias)}`, doc: x.subtipo.nombre })
  const rev = new Map()
  for (const x of todo.revision) { const q = rev.get(x.persona.id) || { n: 0, dias: 0 }; rev.set(x.persona.id, { n: q.n + 1, dias: Math.max(q.dias, x.dias) }) }
  for (const [id, q] of rev) sumar(id, { peso: 500 + q.dias, tono: 'azul', pct: Math.max(8, Math.min(100, (q.dias / 7) * 100)), titulo: `Espera revisión ${hace(q.dias)}`, doc: q.n === 1 ? '1 documento' : `${q.n} documentos`, cuenta: q.n })
  const out = new Map()
  for (const [id, lista] of por) {
    lista.sort((a, b) => b.peso - a.peso)
    const total = lista.reduce((n, u) => n + (u.cuenta || 1), 0)
    out.set(id, { ...lista[0], mas: total - (lista[0].cuenta || 1) })
  }
  return out
}

const VINCULOS = [
  { valor: 'activos', etiqueta: 'Activos' },
  { valor: 'desvinculados', etiqueta: 'Desvinculados' },
  { valor: 'todos', etiqueta: 'Todos' },
]

/* EL ESTADO DEL EXPEDIENTE, UN SOLO FILTRO (propuesta B, 15 oct 2026). Antes eran seis pastillas
   que contaban cosas distintas —documentos unas, personas otras— y una de ellas, «Por revisar», ni
   siquiera filtraba. Ahora lo que espera revisión es un aviso con su botón, y lo pendiente es un
   desplegable más junto al buscador. Todas las opciones cuentan PERSONAS ACTIVAS, con la misma
   regla que la vista por documento (`pilas`): el número que se lee es el que se ve al elegirla. */
const PENDIENTES = {
  vencidos: f => f.vencidos > 0,
  por_vencer: f => f.porVencer > 0,
  faltantes: f => f.faltantes > 0,
  rechazados: f => f.rechazados > 0,
  contratos: f => f.contrato,
}
const ATENCION = Object.keys(PENDIENTES)
const ESTADOS_FILTRO = {
  // Lo que sólo espera revisión no es deuda del colaborador: está en el aviso, y aquí cuenta como al día.
  al_dia: f => !ATENCION.some(k => PENDIENTES[k](f)),
  atencion: f => ATENCION.some(k => PENDIENTES[k](f)),
  ...PENDIENTES,
}
const NOMBRE_ESTADO = {
  al_dia: 'Al día', atencion: 'Requieren atención', vencidos: 'Vencidos', por_vencer: 'Por vencer',
  faltantes: 'Falta entregar', rechazados: 'Rechazados', contratos: 'Contrato por vencer',
}

export default function Expedientes() {
  const ctx = useDocumentacion()
  const { personas, sucursales, tipos, subtipos, checklist, avanceDe, documentos, sinClasificar } = ctx
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [busca, setBusca] = useState(params.get('q') || '')
  const [bajando, setBajando] = useState(null) // null: cerrado; 'pregunta' o 'preparando'
  const [aviso, setAviso] = useState('')
  const filtros = {
    ...FILTROS_VACIOS,
    sede: params.get('sede') || '', area: params.get('area') || '', cargo: params.get('cargo') || '',
    tipo: params.get('tipo') || '', subtipo: params.get('subtipo') || '',
  }
  const vinculo = params.get('vinculo') || 'activos'
  const revisando = params.get('ver') === 'revisar'
  const pend = !revisando && ESTADOS_FILTRO[params.get('pend')] ? params.get('pend') : ''
  // Ver por documento sólo tiene sentido con un motivo concreto: «al día» o «requieren atención» mezclan.
  const porDocumento = PENDIENTES[pend] && params.get('ver') === 'documento'

  const escribir = cambios => {
    const q = Object.fromEntries(params.entries())
    // Otro filtro u otro orden cambia la lista: se vuelve a la primera página.
    if (!('pag' in cambios)) delete q.pag
    for (const [k, v] of Object.entries(cambios)) { if (v) q[k] = v; else delete q[k] }
    setParams(q, { replace: true })
  }

  /* Lo pendiente de cada persona sale de `pilas`, lo mismo que dibuja la vista por documento: así
     «Con vencidos 3» abre exactamente esas filas. */
  const filas = useMemo(() => {
    const todo = pilas(ctx, personas)
    const de = lista => { const m = new Map(); for (const it of lista) m.set(it.persona.id, (m.get(it.persona.id) || 0) + 1); return m }
    const venc = de(todo.vencidos), porV = de(todo.por_vencer), rev = de(todo.revision)
    const falt = de(todo.faltantes.filter(x => x.estado !== 'rechazado')), rech = de(todo.faltantes.filter(x => x.estado === 'rechazado'))
    const contrato = new Set(todo.contratos.map(c => c.persona.id))
    const urgentes = urgenciasDe(todo)
    return personas.map(p => ({
      urgente: urgentes.get(p.id) || null,
      p, avance: avanceDe(p), vencidos: venc.get(p.id) || 0, porVencer: porV.get(p.id) || 0, faltantes: falt.get(p.id) || 0,
      revision: rev.get(p.id) || 0, rechazados: rech.get(p.id) || 0, contrato: contrato.has(p.id),
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personas, avanceDe, ctx.documentos, ctx.subtipos, ctx.parametros, ctx.exoneraciones, ctx.contratos, checklist])

  const texto = busca.trim().toLowerCase()
  // Lo que dejan pasar la búsqueda y los filtros, sin mirar todavía si la persona sigue o se fue.
  const buscados = filas.filter(({ p }) => {
    if (!pasaFiltros(p, filtros)) return false
    if (!texto) return true
    return [p.name, p.codigo, p.cargo, p.email].some(v => String(v || '').toLowerCase().includes(texto))
  })
  const nVinculo = {
    activos: buscados.filter(f => f.p.status !== 'desvinculado').length,
    desvinculados: buscados.filter(f => f.p.status === 'desvinculado').length,
    todos: buscados.length,
  }
  const base = buscados.filter(({ p }) => (vinculo === 'activos' ? p.status !== 'desvinculado' : vinculo === 'desvinculados' ? p.status === 'desvinculado' : true))
  const vivos = base.filter(f => f.p.status !== 'desvinculado')
  const gente = vivos.map(f => f.p)
  const todas = pilas(ctx, gente)
  // Un expediente cerrado no debe nada: los estados miran sólo a los activos.
  const pasa = (clave, f) => f.p.status !== 'desvinculado' && ESTADOS_FILTRO[clave](f)
  const visibles = pend ? base.filter(f => pasa(pend, f)) : base

  // El orden: «nombre» de la A a la Z si no se eligió otro; «-avance» es de mayor a menor.
  const orden = params.get('orden') || 'nombre'
  const col = COLUMNAS.find(c => c.clave === orden.replace('-', '')) || COLUMNAS[0]
  const sentido = orden.startsWith('-') ? -1 : 1
  const ordenadas = [...visibles].sort((a, b) => {
    const x = col.valor(a), y = col.valor(b)
    return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'es')) * sentido || a.p.name.localeCompare(b.p.name, 'es')
  })
  const paginas = Math.max(1, Math.ceil(ordenadas.length / POR_PAGINA))
  const pagina = Math.min(paginas, Math.max(1, Number(params.get('pag')) || 1))
  const deLaPagina = ordenadas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
  const irAPagina = p => {
    const n = typeof p === 'function' ? p(pagina) : p
    escribir({ pag: n > 1 ? String(n) : '' })
    document.querySelector('.content-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const ordenar = clave => escribir({ orden: orden === clave ? `-${clave}` : clave === 'nombre' ? '' : clave })
  const deTipo = it => (!filtros.tipo || it.subtipo?.tipoId === filtros.tipo) && (!filtros.subtipo || it.subtipo?.id === filtros.subtipo)
  // La vista por documento de cada motivo; «rechazados» son los faltantes que sí se entregaron.
  const docsPend = !PENDIENTES[pend] ? []
    : pend === 'contratos' ? todas.contratos
      : pend === 'faltantes' ? todas.faltantes.filter(x => x.estado !== 'rechazado').filter(deTipo)
        : pend === 'rechazados' ? todas.faltantes.filter(x => x.estado === 'rechazado').filter(deTipo)
          : todas[pend].filter(deTipo)
  const n = clave => vivos.filter(f => pasa(clave, f)).length

  /* Lo que espera revisión, con el mismo criterio que el contador del menú. */
  const ids = new Set(gente.map(p => p.id))
  const nRevisar = documentos.filter(d => !d.eliminado && versionActual(d)?.revision === 'pendiente' && ids.has(d.colaboradorId)).length
    + sinClasificar.filter(x => ids.has(x.colaboradorId)).length

  /* Las opciones del filtro, con su número a la derecha: los motivos van sangrados bajo
     «Requieren atención», que es la suma de todos ellos. Con «Desvinculados» no hay estados. */
  const soloCerrados = vinculo === 'desvinculados'
  const opcionesEstado = [
    { valor: '', etiqueta: 'Todos los expedientes', lateral: String(base.length) },
    ...(soloCerrados ? [] : [
      { valor: 'al_dia', etiqueta: 'Al día', lateral: String(n('al_dia')) },
      { valor: 'atencion', etiqueta: 'Requieren atención', lateral: String(n('atencion')) },
      ...ATENCION.map(k => ({ valor: k, etiqueta: NOMBRE_ESTADO[k], lateral: String(n(k)), nivel: 2, agotada: !n(k) && pend !== k, motivo: 'Nadie' })),
    ]),
  ]

  /* EXPORTAR LA LISTA (propuesta D, 16 oct 2026): un menú en la cabecera con dos salidas, y las
     dos bajan los que dejan pasar la búsqueda, los filtros, el estado y Activos/Desvinculados
     —todas las páginas, no sólo la que se ve—.
     · Expedientes en ZIP: una carpeta por persona. Es una descarga masiva: lo confidencial no
       viaja (RNF-12) y el índice de cada uno dice qué quedó fuera.
     · Lista en Excel: una fila por persona con su avance y lo que tiene pendiente. */
  const queSeBaja = [
    VINCULOS.find(v => v.valor === vinculo)?.etiqueta,
    texto && `«${busca.trim()}»`,
    describirFiltros({ sede: filtros.sede, area: filtros.area, cargo: filtros.cargo }, { sucursales }).replace('Sin filtros', ''),
    pend && NOMBRE_ESTADO[pend],
  ].filter(Boolean).join(' · ')
  // Lo mismo en una frase, para la confirmación: «Activos de Casa Matriz Equipetrol».
  const nombreSede = sucursales.find(s => s.id === filtros.sede)?.nombre
  const quienesBaja = [
    { activos: 'Activos', desvinculados: 'Desvinculados', todos: 'Activos y desvinculados' }[vinculo],
    nombreSede && `de ${nombreSede}`,
    filtros.area && `de ${filtros.area}`,
    filtros.cargo && `con el cargo ${filtros.cargo}`,
    pend && `con el estado «${NOMBRE_ESTADO[pend]}»`,
    texto && `que coinciden con «${busca.trim()}»`,
  ].filter(Boolean).join(' ')
  const descargarLista = async () => {
    setBajando('preparando')
    try {
      const { blob, archivos, omitidos } = await zipDeExpedientes(ordenadas.map(f => f.p), ctx, { confidenciales: false })
      descargarBlob(`expedientes_${new Date().toISOString().slice(0, 10)}.zip`, blob)
      ctx.registrarDescarga('expediente', null, null, `Descargó ${ordenadas.length} expedientes (ZIP, ${archivos} archivos) · ${queSeBaja}`)
      setAviso(`${ordenadas.length} expedientes descargados: ${archivos} archivos${omitidos ? ` · ${omitidos} confidencial${omitidos === 1 ? '' : 'es'} no incluido${omitidos === 1 ? '' : 's'}` : ''}.`)
      setTimeout(() => setAviso(''), 3600)
    } finally {
      setBajando(null)
    }
  }
  const exportarLista = () => {
    const cerrado = f => f.p.status === 'desvinculado'
    exportarCSV(`lista_expedientes_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Código', 'Colaborador', 'Cargo', 'Unidad organizacional', 'Sucursal', 'Situación', 'Expediente completo', 'Obligatorios cumplidos',
        'Vencidos', 'Por vencer', 'Faltan', 'Rechazados', 'En revisión', 'Contrato por terminar', 'Lo más urgente'],
      ordenadas.map(f => [
        f.p.codigo, f.p.name, f.p.cargo || '', f.p.depto || '', f.p.sedeNombre || '', cerrado(f) ? 'Desvinculado' : 'Activo',
        cerrado(f) ? 'Expediente cerrado' : f.avance.pct == null ? '' : `${f.avance.pct} %`,
        cerrado(f) ? '' : `${f.avance.cumplidos} de ${f.avance.total}`,
        ...(cerrado(f) ? ['', '', '', '', '', ''] : [f.vencidos, f.porVencer, f.faltantes, f.rechazados, f.revision, f.contrato ? 'Sí' : 'No']),
        !cerrado(f) && f.urgente ? `${f.urgente.titulo} · ${f.urgente.doc}` : '',
      ]),
      queSeBaja)
    ctx.registrarDescarga('expediente', null, null, `Exportó la lista de ${ordenadas.length} expedientes (Excel) · ${queSeBaja}`)
    setAviso(`Lista de ${ordenadas.length} expediente${ordenadas.length === 1 ? '' : 's'} descargada.`)
    setTimeout(() => setAviso(''), 3200)
  }

  // La revisión tiene su propia pantalla, en modo foco: los enlaces viejos con ?ver=revisar van ahí.
  if (revisando) return <Navigate to="/documentos/expedientes/revisar" replace />

  return (
    <div className="content-scroll">
      {/* A QUIÉN SE MIRA (propuesta AJ): en la cabecera y con sus números, fuera de la fila de
          filtros, porque no recorta lo mismo: elige la población —quienes siguen, quienes se
          fueron o todos— y los filtros trabajan dentro de ella. */}
      <Cabecera titulo="Expedientes" sub="Busque a un colaborador para ver sus documentos y lo que le falta.">
        <div className="xa-vinculo" role="group" aria-label="Qué colaboradores ver">
          {VINCULOS.map(v => (
            <button key={v.valor} type="button" className={vinculo === v.valor ? 'on' : ''} aria-pressed={vinculo === v.valor}
              onClick={() => escribir({ vinculo: v.valor === 'activos' ? '' : v.valor, ...(v.valor === 'desvinculados' ? { pend: '', ver: '' } : null) })}>
              {v.etiqueta} <span>{nVinculo[v.valor]}</span>
            </button>
          ))}
        </div>
        <MenuExportar n={ordenadas.length} preparando={bajando === 'preparando'}
          onZip={() => setBajando('pregunta')} onLista={exportarLista} />
      </Cabecera>

      {!revisando && (
        <ResumenHoy
          filas={vivos} todas={todas} nRevisar={nRevisar} pedidos={ctx.pedidos}
          onPedir={lista => ctx.pedirDocumentos(lista.map(x => ({ colaboradorId: x.persona.id, subtipoId: x.subtipo.id, nombre: x.subtipo.nombre })))}
          onRevisar={() => navigate('/documentos/expedientes/revisar')}
          onEstado={(e, porDoc) => escribir({ pend: e, ver: porDoc ? 'documento' : '' })}
        />
      )}

      <div className="xa-barra xa-barra-exp">
        <div className="pl-search-wrap xa-busca">
          <Search size={13} className="pl-search-ico" />
          <input type="search" className="pl-search" placeholder="Nombre, código o cargo…" value={busca} aria-label="Buscar colaborador"
            onChange={e => { setBusca(e.target.value); escribir({ q: e.target.value }) }} />
        </div>
        {/* Los filtros, en la misma fila que el buscador: buscar y acotar son un solo gesto. */}
        <Filtros
          valor={filtros}
          onCambio={f => escribir({ sede: f.sede, area: f.area, cargo: f.cargo, tipo: f.tipo, subtipo: f.subtipo })}
          mostrar={porDocumento && pend !== 'contratos' ? ['sede', 'area', 'cargo', 'tipo', 'subtipo'] : ['sede', 'area', 'cargo']}
          personas={personas} sucursales={sucursales} tipos={tipos} subtipos={subtipos} compacto
        />
        <div className={`dc-filtro dc-filtro-compacto xa-estado${pend ? ' on' : ''}`}>
          <Desplegable valor={pend} opciones={opcionesEstado} ariaLabel="Estado del expediente" placeholder="Estado" anchoMenu={270}
            contenido={() => <span className="dc-filtro-val">{pend ? NOMBRE_ESTADO[pend] : 'Todos los estados'}</span>}
            onCambio={v => escribir({ pend: v, ver: '', tipo: '', subtipo: '' })} />
        </div>
      </div>

      {/* El aviso «N documentos esperan su revisión» se quitó (15 oct 2026). Mientras se revisa,
          queda sólo esta barra para volver a la lista. */}
      {revisando && (
        <div className="xa-aviso-rev on" role="status">
          <Inbox size={18} aria-hidden="true" />
          <span className="xa-aviso-txt">
            <b>Revisando {nRevisar} documento{nRevisar === 1 ? '' : 's'}.</b> Apruebe o rechace y pase al siguiente.
          </span>
          <button type="button" className="dc-btn" onClick={() => escribir({ ver: '' })}>Volver a la lista</button>
        </div>
      )}

      {/* LA LÍNEA DEL RESULTADO: cuántos hay y qué se mira, y a la derecha quiénes (activos,
          desvinculados o todos) y, con un motivo elegido, verlo por documento para pedirlo a varios. */}
      {/* Sin «N colaboradores»: el total ya lo dice la paginación. La línea sólo aparece para
          ver la lista por documento cuando hay un motivo elegido. */}
      {!revisando && PENDIENTES[pend] && (
        <div className="xa-resultado">
          <span className="xa-resultado-der">
            {(
              <span className="xg-ver">
                Ver por
                <span className="xa-segmento" role="group" aria-label="Ver la lista por colaborador o por documento">
                  <button type="button" className={!porDocumento ? 'on' : ''} aria-pressed={!porDocumento} onClick={() => escribir({ ver: '', tipo: '', subtipo: '' })}>Colaborador</button>
                  <button type="button" className={porDocumento ? 'on' : ''} aria-pressed={!!porDocumento} onClick={() => escribir({ ver: 'documento' })}>{pend === 'contratos' ? 'Contrato' : 'Documento'}</button>
                </span>
              </span>
            )}
          </span>
        </div>
      )}

      {bajando === 'pregunta' && (
        <ConfirmarDescarga n={ordenadas.length} quienes={quienesBaja} variasPaginas={ordenadas.length > POR_PAGINA}
          onCerrar={() => setBajando(null)} onDescargar={descargarLista} />
      )}
      {aviso && <div className="xa-toast" role="status"><Check size={14} /> {aviso}</div>}

      {revisando ? (
        <PorRevisar filtros={filtros} />
      ) : porDocumento ? (
        <PorDocumento key={pend} pila={pend === 'rechazados' ? 'faltantes' : pend} filas={docsPend} gente={gente} />
      ) : visibles.length === 0 ? (
        <div className="dc-tarjeta">
          <Vacio Icono={FolderOpen} titulo="Ningún colaborador coincide" texto={`Se buscó «${busca || 'todo'}» con los filtros elegidos. Pruebe con menos filtros o con otra palabra.`}>
            <button type="button" className="dc-btn" onClick={() => { setBusca(''); setParams({}, { replace: true }) }}>Limpiar la búsqueda</button>
          </Vacio>
        </div>
      ) : (
        <div className="as-table-wrap xa-tabla-wrap">
          <table className="as-table xa-tabla">
            <thead>
              <tr>
                {COLUMNAS.map(c => {
                  const aqui = col.clave === c.clave
                  const Flecha = !aqui ? ChevronsUpDown : sentido > 0 ? ChevronUp : ChevronDown
                  return (
                    <th key={c.clave} aria-sort={aqui ? (sentido > 0 ? 'ascending' : 'descending') : 'none'}>
                      <button type="button" className={`xa-orden${aqui ? ' on' : ''}`} onClick={() => ordenar(c.clave)}>
                        {c.label} <Flecha size={13} aria-hidden="true" />
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {deLaPagina.map(({ p, avance, urgente }) => {
                const ir = () => navigate(`/documentos/expedientes/${p.id}`)
                return (
                  <tr key={p.id} className="xa-fila-link" tabIndex={0} onClick={ir} onKeyDown={e => { if (e.key === 'Enter') ir() }} aria-label={`Abrir el expediente de ${p.name}`}>
                    <td><PersonaCelda persona={p} sub={`${p.codigo} · ${p.cargo || 'Sin cargo'}`} /></td>
                    <td className="xa-celda-txt">{p.depto || '—'}</td>
                    <td className="xa-celda-txt">{p.sedeNombre || '—'}</td>
                    <td>
                      {p.status === 'desvinculado'
                        ? <span className="dc-chip dc-t-gris">Expediente cerrado</span>
                        : <BarraAvance pct={avance.pct} detalle={`${avance.cumplidos} de ${avance.total} obligatorios`} ancho={90} />}
                    </td>
                    <td>
                      {p.status === 'desvinculado' ? <span className="dc-muted">—</span> : urgente ? (
                        <div className={`xa-urg xa-urg-${urgente.tono}`}>
                          <div className="xa-urg-txt"><b>{urgente.titulo}</b>{urgente.mas > 0 && <span className="xa-urg-mas" title={`Y ${urgente.mas} cosa${urgente.mas === 1 ? '' : 's'} más en su expediente`}>+{urgente.mas} más</span>}</div>
                          <span className="xa-urg-doc">{urgente.doc}</span>
                          <div className={`xa-urg-barra${urgente.rayado ? ' rayada' : ''}`}><span style={{ width: `${urgente.pct}%` }} /></div>
                        </div>
                      ) : (
                        <span className="dc-muted" aria-label="Al día">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Paginacion page={pagina} setPage={irAPagina} total={ordenadas.length} perPage={POR_PAGINA} nombre="colaboradores" nombreUno="colaborador" />
        </div>
      )}
    </div>
  )
}

/* LA CONFIRMACIÓN CORTA (propuesta E, 16 oct 2026): una pregunta, una línea y dos botones, sin la
   cabecera azul de los otros modales, porque no es un formulario. La línea dice a quiénes —con
   los filtros en palabras— y que lo confidencial no viaja. Escape o tocar afuera la cierran. */
function ConfirmarDescarga({ n, quienes, variasPaginas, onCerrar, onDescargar }) {
  useEffect(() => {
    const tecla = e => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])
  const titulo = `¿Descargar ${n} expediente${n === 1 ? '' : 's'}?`
  return (
    <div className="pl-overlay" onClick={onCerrar}>
      <div className="xa-bajar" role="alertdialog" aria-modal="true" aria-label={titulo} onClick={e => e.stopPropagation()}>
        <span className="xa-bajar-ico" aria-hidden="true"><Download size={24} /></span>
        <h2>{titulo}</h2>
        <p>{quienes}{variasPaginas ? ', de todas las páginas' : ''}. Se bajan en un ZIP, sin los documentos confidenciales.</p>
        <div className="xa-bajar-pie">
          <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
          <button type="button" className="pl-btn-save" onClick={onDescargar} autoFocus>Descargar</button>
        </div>
      </div>
    </div>
  )
}

/* EL MENÚ «EXPORTAR»: un botón con texto que abre las salidas, cada una con lo que trae y cuántos.
   Se cierra con Escape o al tocar afuera. */
function MenuExportar({ n, preparando, onZip, onLista }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!abierto) return
    const fuera = e => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false) }
    const tecla = e => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', tecla) }
  }, [abierto])
  const elegir = accion => { setAbierto(false); accion() }
  const de = n === 1 ? '1 colaborador' : `los ${n} colaboradores`
  return (
    <div className="xa-exportar" ref={ref}>
      <button type="button" className="dc-btn" aria-haspopup="menu" aria-expanded={abierto} disabled={!n || preparando} onClick={() => setAbierto(a => !a)}>
        <Download size={14} aria-hidden="true" /> {preparando ? 'Preparando…' : 'Exportar'}
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {abierto && (
        <div className="xa-exportar-lista" role="menu">
          <button type="button" role="menuitem" onClick={() => elegir(onZip)}>
            <FileArchive size={16} aria-hidden="true" />
            <span><b>Expedientes en ZIP</b><small>Los documentos de {de}, una carpeta por persona</small></span>
          </button>
          <button type="button" role="menuitem" onClick={() => elegir(onLista)}>
            <Sheet size={16} aria-hidden="true" />
            <span><b>Lista en Excel</b><small>Avance y pendientes de {de}</small></span>
          </button>
          <p className="xa-exportar-nota">Con la búsqueda y los filtros elegidos, de todas las páginas.</p>
        </div>
      )}
    </div>
  )
}

/* ── RESUMEN + QUÉ ATENDER HOY (propuesta X, 15 oct 2026) ─────────────────
   Arriba de la tabla: a la izquierda, cuántos expedientes están al día, en un anillo partido por lo
   que le pasa a cada persona (lo más urgente de cada una, la misma regla de la columna); a la
   derecha, las tres cosas que más apuran en toda la empresa, cada una con su botón. Es también la
   entrada a la revisión de documentos. Mira a los activos que dejan pasar los filtros de arriba. */
const TONOS_ANILLO = [
  ['al_dia', '#00B876'], ['azul', '#6FA0E6'], ['ambar', '#E5A13A'], ['violeta', '#8E6AD8'], ['gris', '#94A3B8'], ['rojo', '#D92D20'],
]

function ResumenHoy({ filas, todas, nRevisar, pedidos, onPedir, onRevisar, onEstado }) {
  const [renovando, setRenovando] = useState(false)
  const total = filas.length
  if (!total) return null
  const cuenta = { al_dia: 0, azul: 0, ambar: 0, violeta: 0, gris: 0, rojo: 0 }
  for (const f of filas) cuenta[f.urgente?.tono || 'al_dia']++
  const pct = Math.round((cuenta.al_dia / total) * 100)
  // Cada tramo empieza donde terminó el anterior: la suma de los de antes.
  const tramos = TONOS_ANILLO.map(([k]) => (cuenta[k] / total) * 100)
  const anillo = TONOS_ANILLO.map(([, c], i) => {
    const de = tramos.slice(0, i).reduce((a, b) => a + b, 0)
    return `${c} ${de}% ${de + tramos[i]}%`
  }).join(', ')
  const personas = lista => new Set(lista.map(x => x.persona.id)).size

  /* Las tres más urgentes, en este orden: lo vencido hace más tiempo, lo que espera revisión, los
     contratos que terminan pronto; si sobra lugar, lo que falta entregar y lo que está por vencer. */
  const tareas = []
  /* LO VENCIDO, TODO JUNTO: una persona se nombra; varias se cuentan. «Pedir renovación» no pide
     a ciegas: abre el detalle —quién, qué documento, hace cuánto— y se confirma ahí. */
  const vencidos = todas.vencidos
  if (vencidos.length) {
    const nP = personas(vencidos)
    const sinPedir = vencidos.filter(x => !pedidos[`${x.persona.id}|${x.subtipo.id}`])
    tareas.push({
      clave: 'venc', tono: 'rojo',
      texto: nP === 1
        ? <><b>{vencidos[0].persona.name}</b> · {vencidos.length === 1 ? `${vencidos[0].subtipo.nombre.toLowerCase()} venció ${hace(vencidos[0].dias)}` : `${vencidos.length} documentos vencidos`}</>
        : <><b>{nP} personas</b> tienen documentos vencidos · {vencidos.length} documento{vencidos.length === 1 ? '' : 's'}</>,
      boton: sinPedir.length ? 'Pedir renovación' : 'Ya pedido · ver', accion: () => setRenovando(true),
    })
  }
  if (nRevisar > 0) {
    const dias = todas.revision[0]?.dias || 0
    tareas.push({
      clave: 'rev', tono: 'azul',
      texto: <><b>{nRevisar} documento{nRevisar === 1 ? '' : 's'}</b> espera{nRevisar === 1 ? '' : 'n'} revisión{dias > 0 ? ` · el más antiguo, ${hace(dias)}` : ''}</>,
      boton: 'Revisar', accion: onRevisar,
    })
  }
  // Los mismos que muestra la vista por contrato: los que terminan en 45 días y los que ya terminaron.
  const contratos = todas.contratos
  const terminados = contratos.filter(c => (c.dias ?? 0) < 0).length
  if (contratos.length) {
    tareas.push({
      clave: 'ctr', tono: 'violeta',
      texto: <><b>{contratos.length} contrato{contratos.length === 1 ? '' : 's'}</b> por decidir{terminados ? ` · ${terminados === 1 ? '1 ya terminó' : `${terminados} ya terminaron`}` : ''}, el resto en los próximos 45 días</>,
      boton: 'Ver contratos', accion: () => onEstado('contratos', true),
    })
  }
  const falta = todas.faltantes.filter(x => x.estado !== 'rechazado')
  if (falta.length) {
    tareas.push({
      clave: 'falta', tono: 'gris',
      texto: <><b>{personas(falta)} persona{personas(falta) === 1 ? '' : 's'}</b> no entregaron {falta.length} documento{falta.length === 1 ? '' : 's'}</>,
      boton: 'Ver quiénes', accion: () => onEstado('faltantes'),
    })
  }
  if (todas.por_vencer.length) {
    tareas.push({
      clave: 'porv', tono: 'ambar',
      texto: <><b>{todas.por_vencer.length} documento{todas.por_vencer.length === 1 ? '' : 's'}</b> vence{todas.por_vencer.length === 1 ? '' : 'n'} pronto</>,
      boton: 'Ver cuáles', accion: () => onEstado('por_vencer', true),
    })
  }

  return (
    <div className="xr-resumen">
      <div className="xr-salud">
        <span className="xr-anillo" style={{ background: `conic-gradient(${anillo})` }} role="img" aria-label={`${pct} % de los expedientes al día`}>
          <span>{pct} %</span>
        </span>
        <span className="xr-salud-txt">
          <b>al día</b>
          <span>{cuenta.rojo} vencidos o rechazados · {cuenta.ambar} por vencer</span>
          <span>{cuenta.gris} con faltantes · {cuenta.azul} en revisión</span>
          {cuenta.violeta > 0 && <span>{cuenta.violeta} con contrato por terminar</span>}
        </span>
      </div>
      <div className="xr-hoy">
        <span className="xr-hoy-tit">Qué atender hoy</span>
        {tareas.length === 0 && <span className="xr-hoy-nada">Nada urgente: todos los expedientes están al día.</span>}
        {tareas.slice(0, 3).map(t => (
          <div key={t.clave} className="xr-tarea">
            <span className={`xr-punto xr-${t.tono}`} aria-hidden="true" />
            <span className="xr-tarea-txt">{t.texto}</span>
            <button type="button" className={`xr-btn xr-${t.tono}`} onClick={t.accion} disabled={t.hecho}>{t.boton}</button>
          </div>
        ))}
      </div>
      {renovando && <PedirRenovacion lista={todas.vencidos} pedidos={pedidos} onCerrar={() => setRenovando(false)} onPedir={l => { onPedir(l); setRenovando(false) }} />}
    </div>
  )
}

/* EL DETALLE ANTES DE PEDIR: cada documento vencido con su persona y hace cuánto venció, todos
   marcados salvo los que ya se pidieron. Se destilda lo que no corresponde —alguien de licencia,
   un caso que se está viendo aparte— y se confirma. En producción el pedido sale por correo y por
   la app; la demo lo registra. */
function PedirRenovacion({ lista, pedidos, onCerrar, onPedir }) {
  const pedidoDe = x => pedidos[`${x.persona.id}|${x.subtipo.id}`]
  const [marcados, setMarcados] = useState(() => new Set(lista.filter(x => !pedidoDe(x)).map(x => x.clave)))
  const elegidos = lista.filter(x => marcados.has(x.clave))
  const nPersonas = new Set(elegidos.map(x => x.persona.id)).size
  const alternar = clave => setMarcados(m => { const n = new Set(m); if (n.has(clave)) n.delete(clave); else n.add(clave); return n })
  return (
    <Modal titulo="Pedir la renovación de documentos vencidos" Icono={Send} onCerrar={onCerrar} ancho={620} pie={<>
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
      <button type="button" className="pl-btn-save" disabled={!elegidos.length} onClick={() => onPedir(elegidos)}>
        {elegidos.length ? `Pedir a ${nPersonas} persona${nPersonas === 1 ? '' : 's'}` : 'Elija al menos uno'}
      </button>
    </>}>
      <p className="xr-modal-txt">Cada persona recibe un aviso con el documento que tiene que renovar y el acceso directo para subirlo desde la app.</p>
      <ul className="xr-renovar">
        {lista.map(x => {
          const pedido = pedidoDe(x)
          return (
            <li key={x.clave}>
              <label>
                <input type="checkbox" checked={marcados.has(x.clave)} onChange={() => alternar(x.clave)} />
                <PersonaCelda persona={x.persona} size={32} sub={x.persona.sedeNombre} />
                <span className="xr-renovar-doc">
                  <b>{x.subtipo.nombre}</b>
                  <span>Venció {hace(x.dias)}{pedido ? ` · pedido el ${fechaCorta(pedido)}` : ''}</span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}
