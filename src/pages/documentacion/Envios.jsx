import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Search, Send, Users, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera, EstadoEmitidoChip, Etiqueta, PersonaCelda, Vacio } from '../../components/documentacion/comunes'
import { avanceLote, fechaCorta, nombreEmitido, origenDe } from '../../data/documentacionData'
import Paginacion from '../../components/layout/Paginacion'
import './seguimiento.css'

const POR_PAGINA = 10

/* ── DOCUMENTOS EMITIDOS (antes «Envíos», 15 oct 2026) ────────────────────
   Todo lo que la empresa le mandó a su gente, en una lista, como el panel de envíos de Humand o el
   de firmas de Talana. Un envío es un documento a una persona o el mismo documento a un grupo; de
   cada uno se ve a quién y cuándo.
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
      <Cabecera titulo="Documentos emitidos" sub="Los certificados, memorándums y documentos que RR.HH. emitió. Quedan en el expediente de cada persona.">
        <button type="button" className="pl-btn-new" onClick={() => navigate('/documentos/emitidos/nuevo')}>
          <Send size={14} aria-hidden="true" /> Emitir documento
        </button>
      </Cabecera>
      <Enviados />
    </div>
  )
}

function Enviados() {
  const { emitidos, lotesEmision, personas, modelos, solicitudes } = useDocumentacion()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [pag, setPag] = useState(1)
  const porId = useMemo(() => new Map(personas.map(p => [p.id, p])), [personas])
  const lista = useMemo(() => envios(emitidos, lotesEmision), [emitidos, lotesEmision])

  const texto = busca.trim().toLowerCase()
  const filas = lista.filter(x => {
    if (!texto) return true
    const nombre = x.lote ? x.lote.nombre : nombreEmitido(x.emitido, modelos)
    return [nombre, ...x.emitidos.map(e => `${e.numero} ${porId.get(e.colaboradorId)?.name || ''}`)].some(v => String(v).toLowerCase().includes(texto))
  })
  /* DIEZ POR PÁGINA (16 oct 2026), como Expedientes y Plantillas: lo emitido sólo crece. */
  const paginas = Math.max(1, Math.ceil(filas.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)
  const deLaPagina = filas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  /* SIN CONFIRMACIÓN DE RECEPCIÓN (16 oct 2026): ya no se le pide al colaborador que confirme lo
     que recibe, así que se fueron la columna «Confirmación», el «Recordar» y el filtro de los sin
     confirmar. Lo que sí importa saber —que algo no se envió o se anuló— queda junto a la fecha. */
  return (
    <section className="xb-reporte">
      <div className="xb-rango">
        <div className="pl-search-wrap" style={{ flex: '1 1 320px', maxWidth: 420 }}>
          <Search size={13} className="pl-search-ico" />
          <input type="search" className="pl-search" placeholder="Buscar por documento, número o persona…" value={busca} onChange={e => { setBusca(e.target.value); setPag(1) }} aria-label="Buscar envíos" />
        </div>
      </div>

      {!filas.length ? (
        <div className="dc-tarjeta">
          <Vacio Icono={Send} titulo={lista.length ? 'Ningún documento coincide' : 'Todavía no se emitió nada'} texto={lista.length ? 'Pruebe con otra palabra.' : 'Los certificados, memorándums y archivos que envíe aparecerán aquí.'}>
            {!lista.length && <button type="button" className="pl-btn-new" onClick={() => navigate('/documentos/emitidos/nuevo')}><Send size={14} aria-hidden="true" /> Emitir documento</button>}
          </Vacio>
        </div>
      ) : (
        <div className="as-table-wrap xb-tabla-wrap">
          <table className="as-table xb-tabla">
            <thead><tr><th>Documento</th><th>Para</th><th>Emitido</th></tr></thead>
            <tbody>
              {deLaPagina.map(x => {
                const e = x.emitido
                const ir = () => navigate(`/documentos/emitidos/${x.id}`)
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
                    <td className="xb-cuando" style={{ whiteSpace: 'nowrap' }}>
                      <span>{fechaCorta(x.fecha)}</span>
                      {e && ['generado', 'pendiente', 'anulado'].includes(e.estado) && <EstadoEmitidoChip estado={e.estado} />}
                      {e?.firmado && <span className="dc-chip dc-t-verde">Firmado</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Paginacion page={pagina} setPage={setPag} total={filas.length} perPage={POR_PAGINA} nombre="documentos" nombreUno="documento" />
        </div>
      )}
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
