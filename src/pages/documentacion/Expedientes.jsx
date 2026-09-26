import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, FolderOpen, Upload } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera, Filtros, PersonaCelda, BarraAvance, EstadoChip, Vacio } from '../../components/documentacion/comunes'
import { FILTROS_VACIOS, pasaFiltros } from '../../components/documentacion/utilidades'
import { fechaCorta } from '../../data/documentacionData'
import './expediente.css'

/* ── EXPEDIENTES: BUSCAR A UNA PERSONA Y VER CÓMO ESTÁ ─────────────────────
   La puerta del módulo. Se busca por nombre, código o cargo (7.4, paso 1) y cada fila dice ya lo
   que importa sin abrirla: cuánto tiene y qué le falta.

   LOS FILTROS VIENEN DE LA URL porque el Panel de cumplimiento baja hasta acá desde el rojo de
   una sucursal (RF-78): «dos clics hasta la persona» sólo funciona si el segundo clic llega ya
   filtrado. Y se escriben de vuelta en la URL, para que la flecha de atrás vuelva a esta vista. */

const VINCULOS = [
  { valor: 'activos', etiqueta: 'Activos' },
  { valor: 'desvinculados', etiqueta: 'Desvinculados' },
  { valor: 'todos', etiqueta: 'Todos' },
]

export default function Expedientes() {
  const { personas, sucursales, checklist, avanceDe } = useDocumentacion()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [busca, setBusca] = useState(params.get('q') || '')
  const filtros = { ...FILTROS_VACIOS, sede: params.get('sede') || '', area: params.get('area') || '', cargo: params.get('cargo') || '' }
  const vinculo = params.get('vinculo') || 'activos'

  const escribir = cambios => {
    const q = Object.fromEntries(params.entries())
    for (const [k, v] of Object.entries(cambios)) { if (v) q[k] = v; else delete q[k] }
    setParams(q, { replace: true })
  }

  /* La checklist de cada persona se calcula una vez por render de la lista y no por celda: la
     fila usa el porcentaje y los conteos, que salen del mismo cálculo. */
  const filas = useMemo(() => personas.map(p => {
    const cl = checklist(p)
    const cuenta = e => cl.filter(i => i.estado === e && (e !== 'faltante' || i.exigible)).length
    return {
      p,
      avance: avanceDe(p),
      vencidos: cuenta('vencido'),
      faltantes: cuenta('faltante'),
      revision: cuenta('en_revision'),
      rechazados: cuenta('rechazado'),
    }
  }), [personas, checklist, avanceDe])

  const texto = busca.trim().toLowerCase()
  const visibles = filas.filter(({ p }) => {
    if (vinculo === 'activos' && p.status === 'desvinculado') return false
    if (vinculo === 'desvinculados' && p.status !== 'desvinculado') return false
    if (!pasaFiltros(p, filtros)) return false
    if (!texto) return true
    return [p.name, p.codigo, p.cargo, p.email].some(v => String(v || '').toLowerCase().includes(texto))
  })

  const conPendientes = visibles.filter(f => f.vencidos + f.faltantes + f.revision + f.rechazados > 0).length
  const conPct = visibles.filter(f => f.avance.pct !== null)
  const promedio = conPct.length ? Math.round(conPct.reduce((a, f) => a + f.avance.pct, 0) / conPct.length) : null

  return (
    <div className="content-scroll">
      <Cabecera titulo="Expedientes" sub="Busque a una persona para ver todo lo suyo: lo que tiene, lo que le falta y lo que vence.">
        <button type="button" className="dc-btn" onClick={() => navigate('/documentos/lote')}>
          <Upload size={14} /> Carga por lote
        </button>
      </Cabecera>

      <div className="kpi-strip">
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--blue)' }}>
          <div className="kpi-title" style={{ color: 'var(--blue)' }}>Expedientes</div>
          <div className="kpi-val">{visibles.length}</div>
          <div className="kpi-lbl">Con los filtros aplicados</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--green)' }}>
          <div className="kpi-title" style={{ color: 'var(--green-fuerte)' }}>Completitud media</div>
          <div className="kpi-val">{promedio === null ? '—' : `${promedio}%`}</div>
          <div className="kpi-lbl">Solo requisitos obligatorios exigibles</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--yellow)' }}>
          <div className="kpi-title" style={{ color: 'var(--ambar)' }}>Con pendientes</div>
          <div className="kpi-val">{conPendientes}</div>
          <div className="kpi-lbl">Vencidos, faltantes, en revisión o rechazados</div>
        </div>
      </div>

      <div className="xa-barra">
        <div className="pl-search-wrap xa-busca">
          <Search size={13} className="pl-search-ico" />
          <input
            type="search"
            className="pl-search"
            placeholder="Buscar por nombre, código o cargo…"
            value={busca}
            aria-label="Buscar colaborador"
            onChange={e => { setBusca(e.target.value); escribir({ q: e.target.value }) }}
          />
        </div>
        <div className="xa-segmento" role="group" aria-label="Estado del colaborador">
          {VINCULOS.map(v => (
            <button
              key={v.valor}
              type="button"
              className={vinculo === v.valor ? 'on' : ''}
              aria-pressed={vinculo === v.valor}
              onClick={() => escribir({ vinculo: v.valor === 'activos' ? '' : v.valor })}
            >
              {v.etiqueta}
            </button>
          ))}
        </div>
      </div>
      <Filtros
        valor={filtros}
        onCambio={f => escribir({ sede: f.sede, area: f.area, cargo: f.cargo })}
        personas={personas}
        sucursales={sucursales}
      />

      {visibles.length === 0 ? (
        <div className="dc-tarjeta">
          <Vacio
            Icono={FolderOpen}
            titulo="Ningún expediente coincide"
            texto={`Se buscó «${busca || 'todo'}» con los filtros elegidos. Pruebe con menos filtros o con otra palabra.`}
          >
            <button type="button" className="dc-btn" onClick={() => { setBusca(''); setParams({}, { replace: true }) }}>Limpiar la búsqueda</button>
          </Vacio>
        </div>
      ) : (
        <div className="as-table-wrap xa-tabla-wrap">
          <table className="as-table xa-tabla">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Área</th>
                <th>Sucursal</th>
                <th>Ingreso</th>
                <th>Completitud</th>
                <th>Pendientes</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map(({ p, avance, vencidos, faltantes, revision, rechazados }) => {
                const ir = () => navigate(`/documentos/expedientes/${p.id}`)
                return (
                  <tr
                    key={p.id}
                    className="xa-fila-link"
                    tabIndex={0}
                    onClick={ir}
                    onKeyDown={e => { if (e.key === 'Enter') ir() }}
                    aria-label={`Abrir el expediente de ${p.name}`}
                  >
                    <td>
                      <PersonaCelda persona={p} sub={`${p.codigo} · ${p.cargo || 'Sin cargo'}`} />
                    </td>
                    <td className="xa-celda-txt">{p.depto || '—'}</td>
                    <td className="xa-celda-txt">{p.sedeNombre || '—'}</td>
                    <td className="xa-celda-txt xa-nowrap">{fechaCorta(p.ingreso)}</td>
                    <td>
                      {p.status === 'desvinculado'
                        ? <span className="dc-chip dc-t-gris">Expediente cerrado</span>
                        : <BarraAvance pct={avance.pct} detalle={`${avance.cumplidos} de ${avance.total} obligatorios`} ancho={90} />}
                    </td>
                    <td>
                      <div className="xa-pend">
                        {vencidos > 0 && <span className="xa-pend-item"><EstadoChip estado="vencido" pequeno /> <b>{vencidos}</b></span>}
                        {faltantes > 0 && <span className="xa-pend-item"><EstadoChip estado="faltante" pequeno /> <b>{faltantes}</b></span>}
                        {revision > 0 && <span className="xa-pend-item"><EstadoChip estado="en_revision" pequeno /> <b>{revision}</b></span>}
                        {rechazados > 0 && <span className="xa-pend-item"><EstadoChip estado="rechazado" pequeno /> <b>{rechazados}</b></span>}
                        {vencidos + faltantes + revision + rechazados === 0 && <span className="dc-muted xa-al-dia">Al día</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
