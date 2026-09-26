import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, CircleDashed, Clock, Download, Eye, FileBarChart, History, ShieldCheck, XCircle, Grid3x3, CalendarRange, FileSignature, Lock } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import Desplegable from '../../components/layout/Desplegable'
import SelectorFecha from '../../components/layout/SelectorFecha'
import { Cabecera, EstadoChip, EstadoContratoChip, EstadoEmitidoChip, Etiqueta, Filtros, PersonaCelda, SensibilidadChip, Vacio } from '../../components/documentacion/comunes'
import { FILTROS_VACIOS, describirFiltros, exportarCSV, pasaFiltros } from '../../components/documentacion/utilidades'
import {
  ACCIONES_BITACORA, CATEGORIAS, ESTADOS, ESTADOS_CONTRATO, ESTADOS_EMITIDO, MODALIDADES,
  checklistDe, dias, diasHasta, estadoContrato, estadoVersion, fechaCorta, fechaNum, requisitosDe, versionActual,
} from '../../data/documentacionData'
import { activos } from './seguimientoDatos'
import './seguimiento.css'

/* ── REPORTES (pantalla 14, RF-80 a RF-84) ──────────────────────────────────
   Los tres del Salar terminaban en un botón Exportar sin mostrar nada. ACÁ TODO SE VE ANTES DE
   BAJARSE (RF-80), con los mismos filtros transversales del resto del módulo, y lo exportado
   dice qué filtros se usaron y a qué fecha (RF-83).

   LO CONFIDENCIAL NO VIAJA EN UNA EXPORTACIÓN MASIVA (RNF-12). Se ve en pantalla —quien está acá
   ya tiene permiso para mirar— pero el archivo lo omite y dice cuántos quedaron fuera. */

const PESTANAS = [
  { key: 'matriz', label: 'Matriz por colaborador', Icono: Grid3x3 },
  { key: 'vencimientos', label: 'Vencimientos', Icono: CalendarRange },
  { key: 'emision', label: 'Emisión', Icono: FileSignature },
  { key: 'auditoria', label: 'Auditoría', Icono: History },
]

export default function Reportes() {
  const [params, setParams] = useSearchParams()
  const tab = PESTANAS.some(p => p.key === params.get('ver')) ? params.get('ver') : 'matriz'
  return (
    <div className="content-scroll">
      <Cabecera titulo="Reportes" sub="Todo se ve en pantalla antes de exportarse, y el archivo dice con qué filtros y a qué fecha se generó." />
      <div className="dc-tabs" role="tablist" aria-label="Reportes">
        {PESTANAS.map(({ key, label, Icono }) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={`dc-tab${tab === key ? ' on' : ''}`} onClick={() => setParams(key === 'matriz' ? {} : { ver: key })}>
            <Icono size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>
      {tab === 'matriz' && <Matriz />}
      {tab === 'vencimientos' && <Vencimientos />}
      {tab === 'emision' && <Emision />}
      {tab === 'auditoria' && <Auditoria />}
    </div>
  )
}

/* La barra de cada reporte: cuántas filas, el aviso de lo omitido y el botón de exportar. */
function BarraExportar({ filas, omitidos, onExportar, extra, que = 'confidenciales' }) {
  return (
    <div className="xb-exportar">
      <span className="xb-cuenta"><b>{filas}</b> {filas === 1 ? 'fila' : 'filas'}</span>
      {omitidos > 0 && (
        <span className="xb-omitidos" title="Las exportaciones masivas no incluyen documentos confidenciales (RNF-12)">
          <Lock size={12} aria-hidden="true" /> {omitidos} {que} se omitirán al exportar
        </span>
      )}
      {extra}
      <button type="button" className="pl-btn-new xb-btn-exportar" disabled={!filas} onClick={onExportar}>
        <Download size={14} aria-hidden="true" /> Exportar a Excel
      </button>
    </div>
  )
}

/* ── (a) LA MATRIZ (RF-80) ──
   Personas en filas, subtipos en columnas, el estado en cada celda. La celda lleva ícono y
   abreviatura, y su nombre completo para el lector de pantalla: en una rejilla de treinta
   columnas el color solo no alcanza ni para quien ve bien. */
const ABREV = { vigente: 'VIG', por_vencer: 'POR', vencido: 'VEN', faltante: 'FAL', en_revision: 'REV', rechazado: 'RCH', exonerado: 'EXO' }
const ICONO_CELDA = { vigente: CheckCircle2, por_vencer: Clock, vencido: AlertTriangle, faltante: CircleDashed, en_revision: Eye, rechazado: XCircle, exonerado: ShieldCheck }

function Matriz() {
  const ctx = useDocumentacion()
  const { personas, sucursales, tipos, subtipos, conjuntos } = ctx
  const navigate = useNavigate()
  const [f, setF] = useState(FILTROS_VACIOS)

  const gente = useMemo(() => activos(personas).filter(p => pasaFiltros(p, f)), [personas, f])
  const datos = useMemo(() => {
    /* Las columnas son los subtipos que alguien de la lista tiene que tener: un subtipo que nadie
       exige es una columna de guiones. Ordenadas por tipo, como en la configuración. */
    const exigidos = new Set(gente.flatMap(p => requisitosDe(p, conjuntos).map(r => r.subtipoId)))
    const cols = subtipos
      .filter(s => exigidos.has(s.id) && (!f.tipo || s.tipoId === f.tipo) && (!f.subtipo || s.id === f.subtipo))
      .sort((a, b) => tipos.findIndex(t => t.id === a.tipoId) - tipos.findIndex(t => t.id === b.tipoId))
    const filas = gente.map(p => {
      const cl = checklistDe(p, ctx)
      return { persona: p, celdas: Object.fromEntries(cl.map(i => [i.subtipo.id, i.estado])) }
    }).filter(r => !f.estado || cols.some(c => r.celdas[c.id] === f.estado))
    return { cols, filas }
  }, [gente, ctx, conjuntos, subtipos, tipos, f])

  const confid = datos.cols.filter(c => c.sensibilidad === 'confidencial')
  const omitidas = datos.filas.reduce((a, r) => a + confid.filter(c => r.celdas[c.id]).length, 0)

  const exportar = () => {
    const cols = datos.cols.filter(c => c.sensibilidad !== 'confidencial')
    exportarCSV(
      `matriz-documentos_${dias(0)}.csv`,
      ['Colaborador', 'Código', 'Sucursal', 'Área', 'Cargo', ...cols.map(c => c.nombre)],
      datos.filas.map(r => [r.persona.name, r.persona.codigo, r.persona.sedeNombre, r.persona.depto, r.persona.cargo, ...cols.map(c => (r.celdas[c.id] ? ESTADOS[r.celdas[c.id]].label : 'No exigido'))]),
      `${describirFiltros(f, { sucursales, tipos, subtipos })}${confid.length ? ` · Columnas confidenciales omitidas: ${confid.map(c => c.nombre).join(', ')}` : ''}`,
    )
  }

  return (
    <section className="xb-reporte">
      <Filtros valor={f} onCambio={setF} mostrar={['sede', 'area', 'cargo', 'tipo', 'subtipo', 'estado']} personas={activos(personas)} sucursales={sucursales} tipos={tipos} subtipos={subtipos} />
      <div className="xb-leyenda" aria-label="Leyenda de la matriz">
        {Object.entries(ABREV).map(([e, a]) => { const I = ICONO_CELDA[e]; return <span key={e} className={`xb-celda dc-t-${ESTADOS[e].tono}`}><I size={11} aria-hidden="true" />{a}<span className="xb-leyenda-txt">{ESTADOS[e].label}</span></span> })}
        <span className="xb-celda xb-celda-no">—<span className="xb-leyenda-txt">No exigido</span></span>
      </div>
      <BarraExportar filas={datos.filas.length} omitidos={omitidas} que={omitidas === 1 ? 'celda confidencial' : 'celdas confidenciales'} onExportar={exportar} />
      {!datos.filas.length || !datos.cols.length ? (
        <div className="dc-tarjeta"><Vacio Icono={Grid3x3} titulo="La matriz está vacía con estos filtros" texto={`Filtros: ${describirFiltros(f, { sucursales, tipos, subtipos })}. Limpie alguno para ver resultados.`} /></div>
      ) : (
        <div className="as-table-wrap xb-matriz-wrap">
          <table className="as-table xb-matriz">
            <thead>
              <tr>
                <th className="xb-fijo">Colaborador</th>
                {datos.cols.map(c => (
                  <th key={c.id} title={c.nombre}><span className="xb-col-tit">{c.nombre}</span>{c.sensibilidad === 'confidencial' && <Lock size={10} aria-label="Confidencial" />}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos.filas.map(r => (
                <tr key={r.persona.id}>
                  <th scope="row" className="xb-fijo"><PersonaCelda persona={r.persona} size={26} sub={r.persona.sedeNombre} onClick={() => navigate(`/documentos/expedientes/${r.persona.id}`)} /></th>
                  {datos.cols.map(c => {
                    const e = r.celdas[c.id]
                    if (!e) return <td key={c.id}><span className="xb-celda xb-celda-no" aria-label="No exigido">—</span></td>
                    const I = ICONO_CELDA[e]
                    return <td key={c.id}><span className={`xb-celda dc-t-${ESTADOS[e].tono}`} aria-label={`${c.nombre}: ${ESTADOS[e].label}`} title={`${c.nombre}: ${ESTADOS[e].label}`}><I size={11} aria-hidden="true" />{ABREV[e]}</span></td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/* ── (b) VENCIMIENTOS CON PROYECCIÓN (RF-81) ──
   Responde «qué me vence el mes que viene» sin cruzar planillas. La proyección por mes va arriba
   porque es lo que se lleva a una reunión; el detalle, abajo. */
const HORIZONTES = [
  { valor: '30', etiqueta: 'Próximos 30 días' },
  { valor: '60', etiqueta: 'Próximos 60 días' },
  { valor: '90', etiqueta: 'Próximos 90 días' },
  { valor: 'rango', etiqueta: 'Rango de fechas' },
]
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function Vencimientos() {
  const ctx = useDocumentacion()
  const { personas, sucursales, tipos, subtipos, documentos, parametros } = ctx
  const navigate = useNavigate()
  const [f, setF] = useState(FILTROS_VACIOS)
  const [horizonte, setHorizonte] = useState('90')
  const [desde, setDesde] = useState(dias(0))
  const [hasta, setHasta] = useState(dias(120))
  const [conVencidos, setConVencidos] = useState(true)

  const rango = horizonte === 'rango' ? { desde, hasta } : { desde: dias(0), hasta: dias(Number(horizonte)) }
  const gente = useMemo(() => new Map(activos(personas).filter(p => pasaFiltros(p, f)).map(p => [p.id, p])), [personas, f])

  const filas = useMemo(() => documentos.flatMap(d => {
    const p = gente.get(d.colaboradorId)
    const s = subtipos.find(x => x.id === d.subtipoId)
    const v = versionActual(d)
    if (d.eliminado || !p || !s || !v?.vencimiento || v.revision !== 'aprobado') return []
    if ((f.tipo && s.tipoId !== f.tipo) || (f.subtipo && s.id !== f.subtipo)) return []
    const enRango = v.vencimiento >= rango.desde && v.vencimiento <= rango.hasta
    const yaVencido = conVencidos && horizonte !== 'rango' && v.vencimiento < rango.desde
    if (!enRango && !yaVencido) return []
    return [{ persona: p, subtipo: s, doc: d, version: v, estado: estadoVersion(v, s, parametros), dias: diasHasta(v.vencimiento) }]
  }).sort((a, b) => (a.version.vencimiento < b.version.vencimiento ? -1 : 1)), [documentos, gente, subtipos, parametros, f, rango.desde, rango.hasta, conVencidos, horizonte])

  const porMes = useMemo(() => {
    const m = new Map()
    for (const r of filas) {
      if (r.dias < 0) continue
      const k = r.version.vencimiento.slice(0, 7)
      m.set(k, (m.get(k) || 0) + 1)
    }
    return [...m.entries()].sort()
  }, [filas])
  const maxMes = Math.max(1, ...porMes.map(([, n]) => n))
  const omitidos = filas.filter(r => r.subtipo.sensibilidad === 'confidencial').length

  const exportar = () => exportarCSV(
    `vencimientos_${dias(0)}.csv`,
    ['Colaborador', 'Código', 'Sucursal', 'Área', 'Documento', 'Tipo', 'Vencimiento', 'Días', 'Estado'],
    filas.filter(r => r.subtipo.sensibilidad !== 'confidencial').map(r => [r.persona.name, r.persona.codigo, r.persona.sedeNombre, r.persona.depto, r.subtipo.nombre, tipos.find(t => t.id === r.subtipo.tipoId)?.nombre, fechaNum(r.version.vencimiento), r.dias, ESTADOS[r.estado].label]),
    `${describirFiltros(f, { sucursales, tipos, subtipos })} · Del ${fechaNum(rango.desde)} al ${fechaNum(rango.hasta)}${conVencidos && horizonte !== 'rango' ? ' · con los ya vencidos' : ''}${omitidos ? ` · ${omitidos} confidenciales omitidos` : ''}`,
  )

  return (
    <section className="xb-reporte">
      <Filtros valor={f} onCambio={setF} mostrar={['sede', 'area', 'cargo', 'tipo', 'subtipo']} personas={activos(personas)} sucursales={sucursales} tipos={tipos} subtipos={subtipos} />
      <div className="xb-rango">
        <div className="xb-rango-campo"><Desplegable valor={horizonte} opciones={HORIZONTES} onCambio={setHorizonte} ariaLabel="Horizonte" /></div>
        {horizonte === 'rango' ? (
          <>
            <div className="xb-rango-campo"><SelectorFecha valor={desde} onCambio={setDesde} ariaLabel="Desde" placeholder="Desde" /></div>
            <div className="xb-rango-campo"><SelectorFecha valor={hasta} onCambio={setHasta} ariaLabel="Hasta" placeholder="Hasta" /></div>
          </>
        ) : (
          <label className="xb-check"><input type="checkbox" checked={conVencidos} onChange={e => setConVencidos(e.target.checked)} /> <span>Incluir los que ya vencieron</span></label>
        )}
      </div>

      {porMes.length > 0 && (
        <div className="dc-tarjeta xb-proyeccion">
          <div className="dc-tarjeta-cab"><h3>Proyección por mes</h3><span className="xb-nota">Documentos aprobados que vencen en cada mes</span></div>
          <ul className="xb-meses">
            {porMes.map(([k, n]) => (
              <li key={k}>
                <span className="xb-mes">{MESES[Number(k.slice(5)) - 1]} {k.slice(0, 4)}</span>
                <span className="xb-mes-barra" aria-hidden="true"><span style={{ width: `${(n / maxMes) * 100}%` }} /></span>
                <b>{n}</b>
              </li>
            ))}
          </ul>
        </div>
      )}

      <BarraExportar filas={filas.length} omitidos={omitidos} que={omitidos === 1 ? 'documento confidencial' : 'documentos confidenciales'} onExportar={exportar} />
      {!filas.length ? (
        <div className="dc-tarjeta"><Vacio Icono={CalendarRange} titulo="Nada vence en este período" texto={`Del ${fechaCorta(rango.desde)} al ${fechaCorta(rango.hasta)}, con los filtros elegidos.`} /></div>
      ) : (
        <div className="as-table-wrap xb-tabla-wrap">
          <table className="as-table xb-tabla">
            <thead><tr><th>Colaborador</th><th>Documento</th><th>Vencimiento</th><th>Estado</th></tr></thead>
            <tbody>
              {filas.map(r => (
                <tr key={r.doc.id}>
                  <td><PersonaCelda persona={r.persona} onClick={() => navigate(`/documentos/expedientes/${r.persona.id}?doc=${r.doc.id}`)} /></td>
                  <td><div className="xb-doc"><span className="xb-doc-nom">{r.subtipo.nombre} <SensibilidadChip nivel={r.subtipo.sensibilidad} /></span><span className="xb-doc-sub">{tipos.find(t => t.id === r.subtipo.tipoId)?.nombre}</span></div></td>
                  <td className="xb-cuando"><b>{fechaCorta(r.version.vencimiento)}</b><span>{r.dias < 0 ? `Venció hace ${-r.dias} días` : r.dias === 0 ? 'Vence hoy' : `En ${r.dias} días`}</span></td>
                  <td><EstadoChip estado={r.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/* ── (c) EMISIÓN DE LAS TRES FAMILIAS (RF-82) ──
   El Salar sólo tenía el de memorándums. Certificados, memorándums y contratos en una lista,
   con su número, su modelo y su estado. El memorándum de un modelo sensible —la llamada de
   atención— es confidencial (RF-58) y no sale en la exportación. */
function Emision() {
  const { personas, sucursales, emitidos, contratos, modelos, parametros } = useDocumentacion()
  const navigate = useNavigate()
  const [f, setF] = useState(FILTROS_VACIOS)
  const [categoria, setCategoria] = useState('')
  const [modeloId, setModeloId] = useState('')
  const [estado, setEstado] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const porId = useMemo(() => new Map(personas.map(p => [p.id, p])), [personas])
  const todas = useMemo(() => [
    ...emitidos.map(e => {
      const m = modelos.find(x => x.id === e.modeloId)
      return { id: e.id, numero: e.numero, fecha: e.fecha, categoria: e.categoria, modelo: m, persona: porId.get(e.colaboradorId), estado: e.estado, tipoEstado: 'emitido', sensible: !!m?.sensible }
    }),
    ...contratos.map(c => ({
      id: c.id, numero: c.numero, fecha: c.versiones?.[0]?.fecha || c.inicio, categoria: 'contrato', modelo: modelos.find(x => x.id === c.modeloId),
      persona: porId.get(c.colaboradorId), estado: estadoContrato(c, parametros, contratos), tipoEstado: 'contrato', sensible: false, contrato: c,
    })),
  ].filter(r => r.persona), [emitidos, contratos, modelos, porId, parametros])

  const filas = todas.filter(r => pasaFiltros(r.persona, f)
    && (!categoria || r.categoria === categoria) && (!modeloId || r.modelo?.id === modeloId)
    && (!estado || r.estado === estado) && (!desde || r.fecha >= desde) && (!hasta || r.fecha <= hasta))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
  const omitidos = filas.filter(r => r.sensible).length

  const estadosOps = categoria === 'contrato' ? Object.entries(ESTADOS_CONTRATO) : categoria ? Object.entries(ESTADOS_EMITIDO) : [...Object.entries(ESTADOS_EMITIDO), ...Object.entries(ESTADOS_CONTRATO).filter(([k]) => !ESTADOS_EMITIDO[k])]
  const extraFiltros = [categoria && CATEGORIAS[categoria].plural, modeloId && modelos.find(m => m.id === modeloId)?.nombre, estado && (ESTADOS_EMITIDO[estado] || ESTADOS_CONTRATO[estado])?.label, desde && `desde ${fechaNum(desde)}`, hasta && `hasta ${fechaNum(hasta)}`].filter(Boolean).join(' · ')

  const exportar = () => exportarCSV(
    `emision_${dias(0)}.csv`,
    ['Número', 'Fecha', 'Categoría', 'Modelo', 'Colaborador', 'Código', 'Sucursal', 'Estado'],
    filas.filter(r => !r.sensible).map(r => [r.numero, fechaNum(r.fecha), CATEGORIAS[r.categoria].label, r.modelo?.nombre, r.persona.name, r.persona.codigo, r.persona.sedeNombre, (r.tipoEstado === 'contrato' ? ESTADOS_CONTRATO : ESTADOS_EMITIDO)[r.estado]?.label]),
    `${describirFiltros(f, { sucursales })}${extraFiltros ? ` · ${extraFiltros}` : ''}${omitidos ? ` · ${omitidos} confidenciales omitidos` : ''}`,
  )

  return (
    <section className="xb-reporte">
      <Filtros valor={f} onCambio={setF} personas={personas} sucursales={sucursales} />
      <div className="xb-rango">
        <div className="xb-rango-campo"><Desplegable valor={categoria} onCambio={v => { setCategoria(v); setModeloId(''); setEstado('') }} ariaLabel="Categoría" opciones={[{ valor: '', etiqueta: 'Todas las categorías' }, ...Object.entries(CATEGORIAS).map(([k, c]) => ({ valor: k, etiqueta: c.plural }))]} /></div>
        <div className="xb-rango-campo"><Desplegable valor={modeloId} onCambio={setModeloId} ariaLabel="Modelo" opciones={[{ valor: '', etiqueta: 'Todos los modelos' }, ...modelos.filter(m => !categoria || m.categoria === categoria).map(m => ({ valor: m.id, etiqueta: m.nombre }))]} /></div>
        <div className="xb-rango-campo"><Desplegable valor={estado} onCambio={setEstado} ariaLabel="Estado" opciones={[{ valor: '', etiqueta: 'Todos los estados' }, ...estadosOps.map(([k, e]) => ({ valor: k, etiqueta: e.label }))]} /></div>
        <div className="xb-rango-campo"><SelectorFecha valor={desde} onCambio={setDesde} ariaLabel="Emitidos desde" placeholder="Desde" /></div>
        <div className="xb-rango-campo"><SelectorFecha valor={hasta} onCambio={setHasta} ariaLabel="Emitidos hasta" placeholder="Hasta" /></div>
      </div>
      <BarraExportar filas={filas.length} omitidos={omitidos} que={omitidos === 1 ? 'memorándum confidencial' : 'memorándums confidenciales'} onExportar={exportar} />
      {!filas.length ? (
        <div className="dc-tarjeta"><Vacio Icono={FileBarChart} titulo="No hay documentos emitidos con estos filtros" texto="Limpie algún filtro o amplíe el rango de fechas." /></div>
      ) : (
        <div className="as-table-wrap xb-tabla-wrap">
          <table className="as-table xb-tabla">
            <thead><tr><th>Número</th><th>Colaborador</th><th>Modelo</th><th>Fecha</th><th>Estado</th></tr></thead>
            <tbody>
              {filas.map(r => (
                <tr key={r.id} className={r.contrato ? 'xb-fila-link' : undefined} onClick={r.contrato ? () => navigate(`/documentos/contratos/${r.id}`) : undefined}>
                  <td className="xb-num">{r.numero}</td>
                  <td><PersonaCelda persona={r.persona} size={28} /></td>
                  <td><div className="xb-doc"><span className="xb-doc-nom">{r.modelo?.nombre || '—'} {r.sensible && <SensibilidadChip nivel="confidencial" />}</span><span className="xb-doc-sub">{CATEGORIAS[r.categoria].label}{r.contrato ? ` · ${MODALIDADES[r.contrato.modalidad]}${r.contrato.tipo === 'adenda' ? ' · adenda' : ''}` : ''}</span></div></td>
                  <td>{fechaCorta(r.fecha)}</td>
                  <td>{r.tipoEstado === 'contrato' ? <EstadoContratoChip estado={r.estado} /> : <EstadoEmitidoChip estado={r.estado} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/* ── (d) AUDITORÍA (RF-84, RF-85) ──
   «¿Quién descargó este documento y cuándo?» sin pedirle nada a sistemas. La bitácora sólo se
   lee: no hay acción en ninguna pantalla que la edite (RNF-13). Se muestran de a cien porque en
   una empresa de verdad son decenas de miles. */
function Auditoria() {
  const { personas, sucursales, bitacora } = useDocumentacion()
  const [f, setF] = useState(FILTROS_VACIOS)
  const [colab, setColab] = useState('')
  const [usuario, setUsuario] = useState('')
  const [accion, setAccion] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [cuantos, setCuantos] = useState(100)

  const porId = useMemo(() => new Map(personas.map(p => [p.id, p])), [personas])
  const usuarios = useMemo(() => [...new Set(bitacora.map(b => b.usuario))].sort(), [bitacora])
  const hayTransversal = f.sede || f.area || f.cargo

  const filas = bitacora.filter(b => {
    const p = porId.get(b.colaboradorId)
    if (hayTransversal && (!p || !pasaFiltros(p, f))) return false
    return (!colab || String(b.colaboradorId) === colab) && (!usuario || b.usuario === usuario) && (!accion || b.accion === accion)
      && (!desde || b.fecha >= desde) && (!hasta || b.fecha <= hasta)
  })
  const extra = [colab && porId.get(Number(colab))?.name, usuario && `usuario ${usuario}`, accion && ACCIONES_BITACORA[accion], desde && `desde ${fechaNum(desde)}`, hasta && `hasta ${fechaNum(hasta)}`].filter(Boolean).join(' · ')

  const exportar = () => exportarCSV(
    `auditoria_${dias(0)}.csv`,
    ['Fecha', 'Hora', 'Usuario', 'Acción', 'Colaborador', 'Detalle'],
    filas.map(b => [fechaNum(b.fecha), b.hora || '', b.usuario, ACCIONES_BITACORA[b.accion] || b.accion, porId.get(b.colaboradorId)?.name || '—', b.detalle]),
    `${describirFiltros(f, { sucursales })}${extra ? ` · ${extra}` : ''}`,
  )

  return (
    <section className="xb-reporte">
      <Filtros valor={f} onCambio={setF} personas={personas} sucursales={sucursales} />
      <div className="xb-rango">
        <div className="xb-rango-campo xb-rango-ancho"><Desplegable valor={colab} onCambio={setColab} ariaLabel="Colaborador" opciones={[{ valor: '', etiqueta: 'Todos los colaboradores' }, ...personas.map(p => ({ valor: String(p.id), etiqueta: p.name }))]} /></div>
        <div className="xb-rango-campo"><Desplegable valor={usuario} onCambio={setUsuario} ariaLabel="Usuario" opciones={[{ valor: '', etiqueta: 'Todos los usuarios' }, ...usuarios.map(u => ({ valor: u, etiqueta: u }))]} /></div>
        <div className="xb-rango-campo"><Desplegable valor={accion} onCambio={setAccion} ariaLabel="Acción" opciones={[{ valor: '', etiqueta: 'Todas las acciones' }, ...Object.entries(ACCIONES_BITACORA).map(([k, l]) => ({ valor: k, etiqueta: l }))]} /></div>
        <div className="xb-rango-campo"><SelectorFecha valor={desde} onCambio={setDesde} ariaLabel="Desde" placeholder="Desde" /></div>
        <div className="xb-rango-campo"><SelectorFecha valor={hasta} onCambio={setHasta} ariaLabel="Hasta" placeholder="Hasta" /></div>
      </div>
      <BarraExportar filas={filas.length} omitidos={0} onExportar={exportar} />
      {!filas.length ? (
        <div className="dc-tarjeta"><Vacio Icono={History} titulo="No hay eventos con estos filtros" texto="La bitácora registra cada carga, aprobación, emisión, entrega y descarga." /></div>
      ) : (
        <>
          <div className="as-table-wrap xb-tabla-wrap">
            <table className="as-table xb-tabla">
              <thead><tr><th>Cuándo</th><th>Usuario</th><th>Acción</th><th>Colaborador</th><th>Detalle</th></tr></thead>
              <tbody>
                {filas.slice(0, cuantos).map(b => (
                  <tr key={b.id}>
                    <td className="xb-cuando"><b>{fechaCorta(b.fecha)}</b>{b.hora && <span>{b.hora}</span>}</td>
                    <td>{b.usuario}</td>
                    <td><Etiqueta tono={b.accion === 'lectura' ? 'violeta' : b.accion === 'rechazo' || b.accion === 'anulacion' || b.accion === 'baja' ? 'rojo' : b.accion === 'aprobacion' ? 'verde' : 'gris'}>{ACCIONES_BITACORA[b.accion] || b.accion}</Etiqueta></td>
                    <td>{porId.get(b.colaboradorId)?.name || <span className="dc-muted">—</span>}</td>
                    <td className="xb-detalle">{b.detalle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filas.length > cuantos && (
            <button type="button" className="dc-btn xb-mas" onClick={() => setCuantos(c => c + 100)}>Mostrar 100 más ({filas.length - cuantos} restantes)</button>
          )}
        </>
      )}
    </section>
  )
}
