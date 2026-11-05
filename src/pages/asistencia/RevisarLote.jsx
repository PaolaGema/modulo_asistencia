import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCheck, ChevronDown, ChevronRight, Check } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Vacio } from '../../components/documentacion/comunes'
import Paginacion from '../../components/layout/Paginacion'
import Desplegable from '../../components/layout/Desplegable'
import { PersonaAt, BarraBusqueda, FILTRO_VACIO, filtrar } from '../../components/asistencia/comunes'
import { cambiosDe, NOMBRE_MARCA, ranurasDelDia, efectoDeCambios, pideRespaldo } from '../../utils/correccion'
import { fechaCorta, aFecha, hhmm, mesDe } from '../../data/asistenciaData'

/* ── REVISAR CORRECCIONES EN LOTE (propuesta «Aprobar en lote», ronda 3 · A3 en grande, 5 nov 2026) ──
   Deja de ser una ventana: es una pantalla propia, pensada para 100 correcciones o más, con las mismas
   piezas que la lista de Solicitudes (cabecera, buscador y filtros, tablas, paginación).
   · Arriba, «Qué cambia» filtra por lo que hace la corrección, con cuántas hay de cada una. El colaborador
     no elige un tipo: corrige su día; el tipo se deduce de sus cambios.
   · Dos grupos. «Rutinarias»: mueven 15 min o menos, no quitan atraso y es su 1.ª o 2.ª corrección del mes;
     se pueden elegir todas de un toque. «Se revisan de a una»: las que pesan (respaldo), la 3.ª del mes o
     más, y la propia; no tienen casilla y se abren con «Revisar», como siempre.
   · «Ver su día» abre la fila con sus marcas: la que cambia, resaltada, con la hora anterior tachada.
   · El pie queda fijo con cuántas van elegidas; se confirma escribiendo APROBAR, como de a una, porque el
     camino rápido no puede pedir menos que el lento. Rechazar no va en lote: cada rechazo lleva su motivo. */

const POR_PAGINA = 20
const QUE = {
  falta: 'Carga una marca que faltaba',
  hora: 'Cambia la hora de una marca',
  quita: 'Quita una marca de más',
  varios: 'Varios cambios en su día',
}
const queDe = s => { const cs = cambiosDe(s); return cs.length > 1 ? 'varios' : cs[0]?.quitar ? 'quita' : cs[0]?.antes ? 'hora' : 'falta' }
const fechaSolicitud = f => { const d = aFecha(String(f).slice(0, 10)); return `${d.getDate()} ${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][d.getMonth()]}` }
const unCambio = c => (c.quitar ? `Quitar ${NOMBRE_MARCA[c.tipo]?.toLowerCase() || 'marca'} de más (${c.antes})` : `${NOMBRE_MARCA[c.tipo] || 'Marcación'} ${c.antes ? `${c.antes} → ` : ''}${c.hora}`)

export default function RevisarLote({ pendientes, onVolver, onRevisar, onAprobadas }) {
  const at = useAsistencia()
  const [filtro, setFiltro] = useState(FILTRO_VACIO)
  const [busca, setBusca] = useState('')
  const [que, setQue] = useState('')
  const [elegidas, setElegidas] = useState(() => new Set())
  const [abiertas, setAbiertas] = useState(() => new Set())
  const [pagR, setPagR] = useState(1)
  const [pagN, setPagN] = useState(1)
  const [clave, setClave] = useState('')

  /* Cuántas correcciones lleva esa persona en el mes, contando esta (por orden de llegada). */
  const ordenDelMes = useMemo(() => {
    const m = new Map()
    const todas = at.solicitudes.filter(x => x.tipo === 'correccion' && x.estado !== 'cancelada' && x.fecha)
      .sort((a, b) => (String(a.cuando) + a.id < String(b.cuando) + b.id ? -1 : 1))
    const cuenta = {}
    todas.forEach(x => { const k = `${x.personaId}|${mesDe(x.fecha)}`; cuenta[k] = (cuenta[k] || 0) + 1; m.set(x.id, cuenta[k]) })
    return m
  }, [at.solicitudes])

  /* Lo que se sabe de cada una, calculado una vez: qué cambia, su efecto y si va de a una (y por qué). */
  const filas = useMemo(() => pendientes.map(s => {
    const cs = cambiosDe(s)
    const efecto = efectoDeCambios(at, s.persona, s.fecha, cs)
    const n = ordenDelMes.get(s.id) || 1
    const propia = String(s.personaId) === String(at.yo?.id)
    const pesa = pideRespaldo(at, s.persona, s.fecha, cs)
    const porQue = propia ? 'Es su propia solicitud'
      : pesa ? `${efecto[0]}${s.respaldo ? ` · Comprobar: ${s.respaldo}` : ''}`
      : n >= 3 ? `Es su ${n}.ª corrección del mes` : null
    return { s, cs, efecto, n, porQue, que: queDe(s) }
  }), [pendientes, at, ordenDelMes])

  const gente = useMemo(() => new Set(filtrar(at.personas, filtro).map(p => String(p.id))), [at.personas, filtro])
  const texto = busca.trim().toLowerCase()
  const delFiltro = filas.filter(f => gente.has(String(f.s.personaId)) && (!texto || `${f.s.persona.name} ${f.s.motivo || ''}`.toLowerCase().includes(texto)))
  const visibles = delFiltro.filter(f => !que || f.que === que)
  const rutinarias = visibles.filter(f => !f.porQue)
  const deAUna = visibles.filter(f => f.porQue)
  const seleccion = rutinarias.filter(f => elegidas.has(f.s.id))
  const todas = rutinarias.length > 0 && seleccion.length === rutinarias.length
  const claveOk = clave.trim().toUpperCase() === 'APROBAR'

  const alternar = id => setElegidas(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const alternarDia = id => setAbiertas(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const aprobar = () => {
    if (!claveOk || !seleccion.length) return
    seleccion.forEach(f => at.responderSolicitud(f.s.id, 'aprobada', ''))
    onAprobadas(seleccion.length)
    setElegidas(new Set()); setClave('')
  }

  const pagina = (lista, pag) => lista.slice((Math.min(pag, Math.max(1, Math.ceil(lista.length / POR_PAGINA))) - 1) * POR_PAGINA, Math.min(pag, Math.max(1, Math.ceil(lista.length / POR_PAGINA))) * POR_PAGINA)

  /* SU DÍA: las marcas que su horario espera, con la que cambia resaltada y la hora anterior tachada. */
  const suDia = f => {
    const { filas: ranuras, extras, horario } = ranurasDelDia(at, f.s.persona, f.s.fecha)
    const cambioDe = r => f.cs.find(c => (c.marcaId && c.marcaId === r.marca?.id) || (!c.marcaId && !c.quitar && c.tipo === r.tipo && !r.marca))
    return (
      <div style={{ display: 'grid', gap: 8, padding: '4px 0 2px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ranuras.map(r => {
            const c = cambioDe(r)
            return c
              ? <span key={r.key} className="dc-chip dc-chip-sm dc-t-verde">{r.nombre} {c.antes && <s style={{ opacity: .6, fontWeight: 400 }}>{c.antes}</s>} {c.hora}</span>
              : <span key={r.key} className="dc-chip dc-chip-sm dc-t-gris">{r.nombre} {r.marca ? hhmm(r.marca.min) : '—'}</span>
          })}
          {extras.map(m => {
            const c = f.cs.find(x => x.marcaId === m.id)
            return <span key={m.id} className={`dc-chip dc-chip-sm dc-t-${c?.quitar ? 'ambar' : 'gris'}`}>{NOMBRE_MARCA[m.tipo]} {c?.quitar ? <s>{hhmm(m.min)}</s> : hhmm(m.min)}{c?.quitar ? ' · se quita' : ''}</span>
          })}
        </div>
        <small className="dc-muted" style={{ fontSize: 12 }}>
          {f.n}.ª corrección del mes{horario?.modo === 'fijo' ? ` · su horario: ${horario.entrada} a ${horario.salida}` : ''} · {f.efecto.join(' · ')}
        </small>
      </div>
    )
  }

  const colPersona = f => <td><PersonaAt persona={f.s.persona} size={32} /></td>
  const colQue = f => (
    <td>
      <span className="at-sol-tit">{f.cs.length === 1 ? unCambio(f.cs[0]) : `${f.cs.length} cambios en su día`} · {fechaCorta(f.s.fecha)}</span>
      <span className="at-sol-sub">{f.s.motivo ? `«${f.s.motivo}»` : ''}</span>
    </td>
  )
  const botonDia = f => (
    <button type="button" className="dc-btn dc-btn-texto dc-btn-sm" aria-expanded={abiertas.has(f.s.id)} onClick={e => { e.stopPropagation(); alternarDia(f.s.id) }}>
      {abiertas.has(f.s.id) ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />} Ver su día
    </button>
  )

  return (
    <>
      <Cabecera titulo={`Revisar ${visibles.length} ${visibles.length === 1 ? 'corrección' : 'correcciones'}`} sub="Las rutinarias se pueden aprobar juntas. Las que pesan se abren y se revisan de a una.">
        <button type="button" className="dc-btn" onClick={onVolver}><ArrowLeft size={14} aria-hidden="true" /> Volver a la lista</button>
      </Cabecera>

      <BarraBusqueda busca={busca} onBusca={v => { setBusca(v); setPagR(1); setPagN(1) }} placeholder="Buscar colaborador o motivo…" filtro={filtro} onFiltro={v => { setFiltro(v); setPagR(1); setPagN(1) }} lugares={at.lugares} personas={at.personas}>
        <div className={`dc-filtro at-filtro-estado${que ? ' on' : ''}`}>
          <Desplegable valor={que} ariaLabel="Filtrar por lo que cambia" placeholder="Qué cambia" anchoMenu={290} claseBoton="at-dd-estados"
            onCambio={v => { setQue(v || ''); setPagR(1); setPagN(1) }}
            opciones={[
              { valor: '', etiqueta: 'Todo lo que cambia', lateral: String(delFiltro.length), separada: true },
              ...Object.entries(QUE).map(([k, l]) => { const n = delFiltro.filter(f => f.que === k).length; return { valor: k, etiqueta: l, lateral: String(n), apagada: !n } }),
            ]}
            contenido={o => (
              <span className="pl-dd-trigger-estado">
                <span>{o ? o.etiqueta : 'Qué cambia'}</span>
                <b>{o ? o.lateral : delFiltro.length}</b>
              </span>
            )} />
        </div>
      </BarraBusqueda>

      {!visibles.length ? (
        <div className="dc-tarjeta"><Vacio Icono={Check} titulo="Nada para revisar" texto="No hay correcciones pendientes con estos filtros." /></div>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {/* RUTINARIAS: con casilla; «Elegir las N» las toma todas, de todas las páginas. */}
          <section className="at-card">
            <div className="at-card-cab">
              <div>
                <h2>Rutinarias · {rutinarias.length}</h2>
                <p>Mueven 15 min o menos, no quitan atraso y es su 1.ª o 2.ª corrección del mes.</p>
              </div>
              {rutinarias.length > 0 && (
                <button type="button" className="dc-btn dc-btn-sm" onClick={() => setElegidas(todas ? new Set() : new Set(rutinarias.map(f => f.s.id)))}>
                  {todas ? 'Quitar selección' : `Elegir las ${rutinarias.length}`}
                </button>
              )}
            </div>
            {rutinarias.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="as-table at-tabla at-tabla-sol con-lote">
                  <thead><tr><th style={{ width: 40 }} aria-label="Elegir" /><th>Colaborador</th><th>Qué corrige</th><th>Qué cambia</th><th>Fecha de solicitud</th><th aria-label="Su día" /></tr></thead>
                  <tbody>
                    {pagina(rutinarias, pagR).map(f => [
                      <tr key={f.s.id} tabIndex={0} onClick={() => alternar(f.s.id)} onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); alternar(f.s.id) } }}>
                        <td onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={elegidas.has(f.s.id)} onChange={() => alternar(f.s.id)} aria-label={`Elegir la corrección de ${f.s.persona.name}`} style={{ width: 16, height: 16, accentColor: '#00B876', cursor: 'pointer' }} />
                        </td>
                        {colPersona(f)}
                        {colQue(f)}
                        <td style={{ maxWidth: 220 }}><span className="at-sol-sub" style={{ marginTop: 0 }}>{f.efecto[0]}</span></td>
                        <td className="at-sol-cuando"><b className="at-sol-fecha">{fechaSolicitud(f.s.cuando)}</b></td>
                        <td style={{ textAlign: 'right', width: 1, whiteSpace: 'nowrap' }}>{botonDia(f)}</td>
                      </tr>,
                      abiertas.has(f.s.id) && <tr key={`${f.s.id}-dia`} className="at-lote-dia"><td /><td colSpan={5}>{suDia(f)}</td></tr>,
                    ])}
                  </tbody>
                </table>
                <Paginacion page={Math.min(pagR, Math.max(1, Math.ceil(rutinarias.length / POR_PAGINA)))} setPage={setPagR} total={rutinarias.length} perPage={POR_PAGINA} nombre="correcciones" nombreUno="corrección" />
              </div>
            ) : <p className="at-ayuda" style={{ padding: '14px 18px' }}>Ninguna con estos filtros.</p>}
          </section>

          {/* DE A UNA: sin casilla. Dicen por qué y se abren con «Revisar», con la papeleta y su respaldo. */}
          <section className="at-card">
            <div className="at-card-cab">
              <div>
                <h2>Se revisan de a una · {deAUna.length}</h2>
                <p>Cambian más de 15 min o quitan atraso, ya es su 3.ª corrección del mes, o es la suya. Ábralas y revise el respaldo.</p>
              </div>
            </div>
            {deAUna.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="as-table at-tabla at-tabla-sol">
                  <thead><tr><th>Colaborador</th><th>Qué corrige</th><th>Por qué de a una</th><th>Fecha de solicitud</th><th aria-label="Acción" /></tr></thead>
                  <tbody>
                    {pagina(deAUna, pagN).map(f => (
                      <tr key={f.s.id} tabIndex={0} onClick={() => onRevisar(f.s)} onKeyDown={e => { if (e.key === 'Enter') onRevisar(f.s) }}>
                        {colPersona(f)}
                        {colQue(f)}
                        <td style={{ maxWidth: 300 }}><span className="dc-chip dc-chip-sm dc-t-ambar" style={{ whiteSpace: 'normal', lineHeight: 1.35, height: 'auto', padding: '4px 9px' }}>{f.porQue}</span></td>
                        <td className="at-sol-cuando"><b className="at-sol-fecha">{fechaSolicitud(f.s.cuando)}</b></td>
                        <td style={{ textAlign: 'right', width: 1, whiteSpace: 'nowrap' }}><button type="button" className="at-btn-revisar" onClick={e => { e.stopPropagation(); onRevisar(f.s) }}>Revisar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Paginacion page={Math.min(pagN, Math.max(1, Math.ceil(deAUna.length / POR_PAGINA)))} setPage={setPagN} total={deAUna.length} perPage={POR_PAGINA} nombre="correcciones" nombreUno="corrección" />
              </div>
            ) : <p className="at-ayuda" style={{ padding: '14px 18px' }}>Ninguna con estos filtros.</p>}
          </section>
        </div>
      )}

      {/* EL PIE FIJO: cuántas van elegidas, la palabra y el botón, sin bajar hasta el final de 100 filas. */}
      <div className="at-lote-pie" role="region" aria-label="Aprobar las elegidas">
        <b>{seleccion.length === 1 ? '1 elegida' : `${seleccion.length} elegidas`}</b>
        {seleccion.length > 0 && <button type="button" className="dc-btn dc-btn-texto dc-btn-sm" onClick={() => setElegidas(new Set())}>Quitar selección</button>}
        <span style={{ flex: 1 }} />
        <span className="dc-muted" style={{ fontSize: 12 }}>Para confirmar, escriba APROBAR</span>
        <input className="pl-input" value={clave} onChange={e => setClave(e.target.value)} placeholder="APROBAR" autoComplete="off" spellCheck={false} aria-label="Escriba APROBAR para confirmar"
          disabled={!seleccion.length} style={{ width: 130, height: 38 }} onKeyDown={e => { if (e.key === 'Enter') aprobar() }} />
        <button type="button" className="at-btn-ok" disabled={!seleccion.length || !claveOk} onClick={aprobar}><CheckCheck size={14} aria-hidden="true" /> Aprobar {seleccion.length || ''}</button>
      </div>
    </>
  )
}
