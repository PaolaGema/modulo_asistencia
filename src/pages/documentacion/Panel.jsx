import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, CircleDashed, ListChecks, XCircle } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { BarraAvance, Cabecera, Etiqueta, Filtros, PersonaCelda, Vacio } from '../../components/documentacion/comunes'
import { FILTROS_VACIOS, pasaFiltros } from '../../components/documentacion/utilidades'
import { ESTADOS } from '../../data/documentacionData'
import { activos, agregado, nivelDe, pilas } from './seguimientoDatos'
import './seguimiento.css'

/* ── EL PANEL DE CUMPLIMIENTO (pantalla 13, RF-78, RF-14) ──────────────────
   Responde lo que ningún reporte del Salar responde: dónde está el problema. Semáforo por
   sucursal y por área, y desde el rojo se baja hasta la persona y el documento en dos clics.

   CUENTA SÓLO A LA GENTE ACTIVA. Un expediente cerrado no baja el porcentaje de nadie: sus
   pendientes quedaron registrados al cierre (7.9) y ya no hay a quién pedírselos. */

const ICONO_NIVEL = { verde: CheckCircle2, ambar: AlertTriangle, rojo: XCircle, gris: CircleDashed }

export default function Panel() {
  const ctx = useDocumentacion()
  const { personas, sucursales, conjuntos } = ctx
  const navigate = useNavigate()
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [eje, setEje] = useState('sede')
  const [abierto, setAbierto] = useState(null)

  const gente = useMemo(() => activos(personas).filter(p => pasaFiltros(p, filtros)), [personas, filtros])
  const total = useMemo(() => agregado(gente, ctx), [gente, ctx])
  const pend = useMemo(() => pilas(ctx, gente), [ctx, gente])

  const hayRequisitos = conjuntos.some(c => c.activo && c.requisitos.length)
  if (!hayRequisitos) {
    return (
      <div className="content-scroll">
        <Cabecera titulo="Panel de cumplimiento" sub="Qué tan completa está la documentación, por sucursal y por área." />
        <div className="dc-tarjeta">
          <Vacio Icono={ListChecks} titulo="El cumplimiento no se puede calcular todavía porque ningún cargo tiene requisitos"
            texto="Mientras nadie declare qué documentos exige cada cargo, el sistema no sabe qué falta. Empiece por los requisitos por perfil.">
            <button type="button" className="pl-btn-new" onClick={() => navigate('/documentos/configuracion/requisitos')}>Definir requisitos</button>
          </Vacio>
        </div>
      </div>
    )
  }

  /* LOS GRUPOS DEL SEMÁFORO. Se agrupa el detalle ya calculado —no se vuelve a pedir la checklist
     de cada persona por grupo— y se ordena del peor al mejor: el panel existe para decir dónde
     poner el foco, y el foco va arriba. */
  const grupos = (() => {
    const m = new Map()
    for (const d of total.detalle) {
      const k = eje === 'sede' ? d.persona.sede : d.persona.depto
      if (!m.has(k)) m.set(k, [])
      m.get(k).push(d)
    }
    return [...m.entries()].map(([k, ds]) => {
      const cumplidos = ds.reduce((a, d) => a + d.cumplidos, 0)
      const tot = ds.reduce((a, d) => a + d.total, 0)
      const suc = sucursales.find(s => s.id === k)
      const faltas = ds.flatMap(d => d.checklist.filter(i => i.requisito.obligatorio && i.estado !== 'exonerado' && !ESTADOS[i.estado].cumple && (i.exigible || i.estado !== 'faltante')))
      return {
        clave: k, nombre: eje === 'sede' ? (suc?.nombre || k) : k, sub: eje === 'sede' ? suc?.ciudad : null,
        pct: tot ? Math.round((cumplidos / tot) * 100) : null, personas: ds.length,
        vencidos: faltas.filter(i => i.estado === 'vencido').length,
        faltantes: faltas.filter(i => i.estado === 'faltante' || i.estado === 'rechazado').length,
        revision: faltas.filter(i => i.estado === 'en_revision').length,
        peores: [...ds].filter(d => d.pct !== null && d.pct < 100).sort((a, b) => a.pct - b.pct),
      }
    }).sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101))
  })()

  const kpis = [
    { titulo: 'Completitud', val: total.pct === null ? '—' : `${total.pct}%`, lbl: `${total.cumplidos} de ${total.total} requisitos exigibles`, tono: 'var(--green-fuerte)', ir: '/documentos/bandeja?pila=faltantes', ayuda: 'Ver lo que falta' },
    { titulo: 'Al día', val: total.alDia, lbl: `de ${total.conReq} personas con requisitos`, tono: 'var(--blue)', ir: '/documentos/expedientes', ayuda: 'Ver los expedientes' },
    { titulo: 'Vencidos', val: pend.vencidos.length, lbl: 'Documentos que ya no cuentan', tono: 'var(--dc-rojo)', ir: '/documentos/bandeja?pila=vencidos', ayuda: 'Ver los vencidos en la bandeja' },
    { titulo: 'En revisión', val: pend.revision.length, lbl: 'Esperan que alguien los mire', tono: 'var(--dc-azul)', ir: '/documentos/bandeja?pila=revision', ayuda: 'Ver lo que espera revisión' },
  ]

  const irLista = g => navigate(`/documentos/expedientes?${new URLSearchParams({ ...(filtros.sede && { sede: filtros.sede }), ...(filtros.area && { area: filtros.area }), ...(filtros.cargo && { cargo: filtros.cargo }), [eje === 'sede' ? 'sede' : 'area']: g.clave })}`)

  return (
    <div className="content-scroll">
      <Cabecera titulo="Panel de cumplimiento" sub="Qué tan completa está la documentación, por sucursal y por área. Cuenta sólo los requisitos obligatorios cuyo plazo ya venció." />

      <Filtros valor={filtros} onCambio={v => { setFiltros(v); setAbierto(null) }} personas={activos(personas)} sucursales={sucursales} />

      <div className="kpi-strip">
        {kpis.map(k => (
          <button key={k.titulo} type="button" className="kpi-card dc-kpi-link xb-kpi" style={{ '--kpi-accent': k.tono }} onClick={() => navigate(k.ir)} title={k.ayuda}>
            <div className="kpi-title">{k.titulo}</div>
            <div className="kpi-val">{k.val}</div>
            <div className="kpi-lbl">{k.lbl}</div>
          </button>
        ))}
      </div>

      <div className="dc-tarjeta">
        <div className="dc-tarjeta-cab xb-panel-cab">
          <h2>Semáforo {eje === 'sede' ? 'por sucursal' : 'por área'}</h2>
          <div className="xb-segmento" role="group" aria-label="Agrupar por">
            <button type="button" aria-pressed={eje === 'sede'} className={eje === 'sede' ? 'on' : ''} onClick={() => { setEje('sede'); setAbierto(null) }}>Sucursal</button>
            <button type="button" aria-pressed={eje === 'area'} className={eje === 'area' ? 'on' : ''} onClick={() => { setEje('area'); setAbierto(null) }}>Área</button>
          </div>
        </div>

        {grupos.length === 0 ? (
          <Vacio Icono={CircleDashed} titulo="Nadie coincide con estos filtros" texto="Pruebe con otra sucursal o área, o limpie los filtros." />
        ) : (
          <ul className="xb-semaforo">
            {grupos.map(g => {
              const n = nivelDe(g.pct)
              const Ico = ICONO_NIVEL[n.tono]
              const esAbierto = abierto === g.clave
              return (
                <li key={g.clave} className={esAbierto ? 'abierto' : undefined}>
                  <button type="button" className="xb-grupo" aria-expanded={esAbierto} onClick={() => setAbierto(esAbierto ? null : g.clave)}>
                    {esAbierto ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronRight size={15} aria-hidden="true" />}
                    <span className="xb-grupo-nom"><b>{g.nombre}</b>{g.sub && <span>{g.sub}</span>}</span>
                    <span className="xb-grupo-n">{g.personas} {g.personas === 1 ? 'persona' : 'personas'}</span>
                    <span className="xb-grupo-barra"><BarraAvance pct={g.pct} ancho={160} /></span>
                    <span className={`dc-chip dc-t-${n.tono} xb-nivel`}><Ico size={12} aria-hidden="true" /> {n.label}</span>
                    <span className="xb-grupo-cuentas">
                      {g.vencidos > 0 && <Etiqueta tono="rojo">{g.vencidos} {g.vencidos === 1 ? 'vencido' : 'vencidos'}</Etiqueta>}
                      {g.faltantes > 0 && <Etiqueta tono="gris">{g.faltantes} {g.faltantes === 1 ? 'faltante' : 'faltantes'}</Etiqueta>}
                      {g.revision > 0 && <Etiqueta tono="azul">{g.revision} en revisión</Etiqueta>}
                    </span>
                  </button>
                  {esAbierto && (
                    <div className="xb-descenso">
                      {g.peores.length === 0 ? <p className="xb-nota">Todas las personas de {g.nombre} tienen su documentación exigible completa.</p> : (
                        <ul className="xb-peores">
                          {g.peores.slice(0, 6).map(d => {
                            const falta = d.checklist.filter(i => i.requisito.obligatorio && i.estado !== 'exonerado' && !ESTADOS[i.estado].cumple && (i.exigible || i.estado !== 'faltante'))
                            return (
                              <li key={d.persona.id}>
                                <PersonaCelda persona={d.persona} size={28} onClick={() => navigate(`/documentos/expedientes/${d.persona.id}`)} />
                                <BarraAvance pct={d.pct} ancho={80} />
                                <span className="xb-falta">
                                  {falta.map(i => <span key={i.subtipo.id}><b>{i.subtipo.nombre}</b> · {ESTADOS[i.estado].label.toLowerCase()}</span>)}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                      <button type="button" className="dc-btn dc-btn-sm" onClick={() => irLista(g)}>
                        Ver {g.personas === 1 ? 'la persona' : `las ${g.personas} personas`} en Expedientes <ChevronRight size={13} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <p className="xb-nota xb-nota-pie">
        El porcentaje baja cuando se declara un requisito nuevo: recién ahí el sistema sabe qué falta. Un número que empeora porque se empezó a medir no es una mala noticia (PRD 7.2).
      </p>
    </div>
  )
}
