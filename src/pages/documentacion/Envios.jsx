import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, CheckCircle2, Search, Send, Users, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera, EstadoEmitidoChip, Etiqueta, PersonaCelda, Vacio } from '../../components/documentacion/comunes'
import { avanceLote, esperaAcuse, fechaCorta, nombreEmitido, origenDe } from '../../data/documentacionData'
import './seguimiento.css'

/* ── DOCUMENTOS EMITIDOS (antes «Envíos», 15 oct 2026) ────────────────────
   Todo lo que la empresa le mandó a su gente, en una lista, como el panel de envíos de Humand o el
   de firmas de Talana. Un envío es un documento a una persona o el mismo documento a un grupo; de
   cada uno se ve a quién, cuándo y cuántos confirmaron, y se le recuerda a quien falta.
   ENVIAR ES ENTREGAR: lo que sale llega por la app en el mismo momento; no hay un paso aparte.

   LAS SOLICITUDES YA NO VIVEN ACÁ: son trabajo con plazo y tienen su propia entrada del menú
   («Solicitudes»). Esta pantalla es el registro de lo emitido. */

/* Un envío a varias personas es su lote; uno a una sola persona es su emitido. Los contratos no son
   envíos: se firman en RR.HH. y viven en el expediente. */
// eslint-disable-next-line react-refresh/only-export-components
export function envios(emitidos, lotesEmision) {
  const lotes = lotesEmision.map(l => {
    const a = avanceLote(l, emitidos)
    return { id: l.id, lote: l, fecha: l.fecha, a, emitidos: a.emitidos }
  })
  const sueltos = emitidos
    .filter(e => !e.loteId || !lotesEmision.some(l => l.id === e.loteId))
    .map(e => ({ id: e.id, emitido: e, fecha: e.fecha, emitidos: [e] }))
  return [...lotes, ...sueltos].sort((x, y) => (x.fecha < y.fecha ? 1 : -1))
}

export default function Envios() {
  const navigate = useNavigate()
  return (
    <div className="content-scroll">
      <Cabecera titulo="Documentos emitidos" sub="Los certificados, memorándums y comunicados que RR.HH. envió, y quién confirmó que los recibió.">
        <button type="button" className="pl-btn-new" onClick={() => navigate('/documentos/emitidos/nuevo')}>
          <Send size={14} aria-hidden="true" /> Emitir documento
        </button>
      </Cabecera>
      <Enviados />
    </div>
  )
}

function Enviados() {
  const { emitidos, lotesEmision, personas, modelos, solicitudes, recordarAcuse } = useDocumentacion()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [soloSin, setSoloSin] = useState(false)
  const [aviso, setAviso] = useAviso()
  const porId = useMemo(() => new Map(personas.map(p => [p.id, p])), [personas])
  const lista = useMemo(() => envios(emitidos, lotesEmision), [emitidos, lotesEmision])

  const texto = busca.trim().toLowerCase()
  const filas = lista.filter(x => {
    const sin = x.emitidos.filter(esperaAcuse).length
    if (soloSin && !sin) return false
    if (!texto) return true
    const nombre = x.lote ? x.lote.nombre : nombreEmitido(x.emitido, modelos)
    return [nombre, ...x.emitidos.map(e => `${e.numero} ${porId.get(e.colaboradorId)?.name || ''}`)].some(v => String(v).toLowerCase().includes(texto))
  })
  const totalSin = lista.reduce((n, x) => n + x.emitidos.filter(esperaAcuse).length, 0)

  const recordar = (ev, x) => {
    ev.stopPropagation()
    const n = recordarAcuse(x.emitidos.filter(esperaAcuse).map(e => e.id))
    setAviso(`Se registró el recordatorio a ${n === 1 ? 'una persona' : `${n} personas`}. En producción saldría por la app y por correo.`)
  }

  return (
    <section className="xb-reporte">
      <div className="xb-rango">
        <div className="pl-search-wrap" style={{ flex: '1 1 320px', maxWidth: 420 }}>
          <Search size={13} className="pl-search-ico" />
          <input type="search" className="pl-search" placeholder="Buscar por documento, número o persona…" value={busca} onChange={e => setBusca(e.target.value)} aria-label="Buscar envíos" />
        </div>
        <label className="xb-check"><input type="checkbox" checked={soloSin} onChange={e => setSoloSin(e.target.checked)} /> <span>Solo los que tienen personas sin confirmar ({totalSin})</span></label>
      </div>

      {!filas.length ? (
        <div className="dc-tarjeta">
          <Vacio Icono={Send} titulo={lista.length ? 'Ningún envío coincide' : 'Todavía no se envió nada'} texto={lista.length ? 'Pruebe con otra palabra o quite el filtro.' : 'Los certificados, memorándums y archivos que envíe aparecerán aquí, con quién los confirmó.'}>
            {!lista.length && <button type="button" className="pl-btn-new" onClick={() => navigate('/documentos/emitidos/nuevo')}><Send size={14} aria-hidden="true" /> Enviar documento</button>}
          </Vacio>
        </div>
      ) : (
        <div className="as-table-wrap xb-tabla-wrap">
          <table className="as-table xb-tabla">
            <thead><tr><th>Documento</th><th>Para</th><th>Enviado</th><th>Confirmación</th><th><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>
              {filas.map(x => {
                const e = x.emitido
                const sin = x.emitidos.filter(esperaAcuse).length
                const ir = () => navigate(`/documentos/emitidos/${x.id}`)
                const pide = x.emitidos.some(y => y.pideAcuse !== false)
                return (
                  <tr key={x.id} className="xb-fila-link" tabIndex={0} onClick={ir} onKeyDown={ev => { if (ev.key === 'Enter') ir() }}>
                    <td>
                      <div className="xb-doc">
                        <span className="xb-doc-nom" style={e?.estado === 'anulado' ? { textDecoration: 'line-through' } : undefined}>{x.lote ? x.lote.nombre : nombreEmitido(e, modelos)}</span>
                        <span className="xb-doc-sub">
                          {x.lote ? `${x.a.total} documentos` : e.numero}
                          {e && origenDe(e, solicitudes) === 'solicitud' && <> · <Etiqueta tono="violeta">Solicitud</Etiqueta></>}
                        </span>
                      </div>
                    </td>
                    <td>
                      {x.lote
                        ? <span className="xb-grupo"><Users size={15} aria-hidden="true" /> {x.a.total} personas</span>
                        : <PersonaCelda persona={porId.get(e.colaboradorId)} size={28} />}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fechaCorta(x.fecha)}</td>
                    <td className="xb-cuando">
                      {x.lote
                        ? (pide ? <><b>{x.a.confirmados} de {x.a.total}</b><span>{sin ? `${sin} sin confirmar` : 'Todos confirmaron'}</span></> : <span>Sin pedir confirmación</span>)
                        : e.estado === 'acusado' ? <><EstadoEmitidoChip estado="acusado" /><span>{fechaCorta(e.acuse.fecha)}</span></>
                          : esperaAcuse(e) ? <><Etiqueta tono="ambar">Sin confirmar</Etiqueta>{e.recordatorios?.length > 0 && <span>Recordado el {fechaCorta(e.recordatorios.at(-1).fecha)}</span>}</>
                            : <EstadoEmitidoChip estado={e.estado} />}
                    </td>
                    <td className="xb-acc">
                      {sin > 0 && <button type="button" className="dc-btn dc-btn-sm" onClick={ev => recordar(ev, x)}><BellRing size={12} aria-hidden="true" /> Recordar</button>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {aviso}
    </section>
  )
}

/* El aviso de abajo, que se va solo. */
// eslint-disable-next-line react-refresh/only-export-components
export function useAviso() {
  const [aviso, setAviso] = useState(null)
  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 4200)
    return () => clearTimeout(t)
  }, [aviso])
  const nodo = aviso && (
    <div className="xb-aviso" role="status">
      <CheckCircle2 size={16} aria-hidden="true" /> <span>{aviso}</span>
      <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso(null)}><X size={14} /></button>
    </div>
  )
  return [nodo, setAviso]
}
