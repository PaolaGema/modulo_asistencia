import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, CheckCircle2, Copy, Inbox, PenLine, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera, Etiqueta, Filtros, PersonaCelda, Vacio } from '../../components/documentacion/comunes'
import { FILTROS_VACIOS, pasaFiltros } from '../../components/documentacion/utilidades'
import { PLAZO_SOLICITUD_DIAS, TIPOS_SOLICITUD, aFecha, fechaCorta, hoy, responderAntes } from '../../data/documentacionData'
import { activos } from './seguimientoDatos'
import Desplegable from '../../components/layout/Desplegable'
import './seguimiento.css'

/* ── SOLICITUDES: LO QUE PIDIÓ UN COLABORADOR ──────────────────────────────
   Sólo lo que una persona pidió desde la app y que termina en un documento en sus manos:
   certificados, copias de su expediente y correcciones. Lo que el sistema detecta solo —revisar,
   faltantes, vencidos, contratos que terminan— está en Colaboradores, visto por documento: mezclado acá, 66 pendientes
   del sistema tapaban los 4 pedidos de la gente.

   CADA PEDIDO SE ATIENDE CON LO QUE PIDE. No hay «Aprobar»: un certificado se emite, una copia se
   elige y se envía, una corrección se vuelve a emitir. Rechazar sigue existiendo, con motivo.

   Y CADA UNO TIENE PLAZO. Se responde dentro de los días hábiles fijados; lo atrasado se ve
   primero y en rojo. */

const ICONOS = { certificacion: Award, copia: Copy, correccion: PenLine }
const VISTAS = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'atendida', label: 'Atendidas' },
  { key: 'rechazada', label: 'Rechazadas' },
]

/* Cuánto falta para responder, en palabras y con su color. */
function plazoDe(q) {
  const limite = responderAntes(q.fecha)
  const d = Math.round((aFecha(limite) - hoy()) / 864e5)
  if (d < 0) return { d, texto: `Atrasada ${-d} ${d === -1 ? 'día' : 'días'}`, tono: 'rojo', limite }
  if (d === 0) return { d, texto: 'Vence hoy', tono: 'rojo', limite }
  if (d === 1) return { d, texto: 'Mañana', tono: 'ambar', limite }
  return { d, texto: `En ${d} días`, tono: 'gris', limite }
}

/* Es la pantalla Solicitudes (su propia entrada del menú desde el 15 oct 2026): lo pedido suele terminar en un documento emitido. */
export default function Bandeja() {
  const ctx = useDocumentacion()
  const { personas, sucursales, tipos, subtipos, solicitudes } = ctx
  const navigate = useNavigate()
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [vista, setVista] = useState('pendiente')
  const [tipo, setTipo] = useState('')
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 4200)
    return () => clearTimeout(t)
  }, [aviso])

  const gente = useMemo(() => activos(personas).filter(p => pasaFiltros(p, filtros)), [personas, filtros])
  const porId = useMemo(() => new Map(gente.map(p => [p.id, p])), [gente])
  const deLaGente = solicitudes.filter(q => TIPOS_SOLICITUD[q.tipo] && porId.has(q.colaboradorId))
  const enVista = deLaGente.filter(q => q.estado === vista)
  const filas = enVista
    .filter(q => !tipo || q.tipo === tipo)
    .sort((a, b) => (vista === 'pendiente'
      ? (responderAntes(a.fecha) < responderAntes(b.fecha) ? -1 : 1)
      : ((a.resuelto?.fecha || '') < (b.resuelto?.fecha || '') ? 1 : -1)))

  /* ATENDER ES OTRA PANTALLA (15 oct 2026): «Atender solicitudes», de tres columnas, como «Revisar
     documentos». Desde la bandeja sólo se elige el pedido; rechazar sí se puede desde acá. */

  return (
    <div>
      {/* PENDIENTES / ATENDIDAS / RECHAZADAS, en la cabecera y con sus números, como «Activos /
          Desvinculados / Todos» en Expedientes: elige qué pedidos se miran; los filtros trabajan
          dentro de eso. */}
      <Cabecera titulo="Solicitudes" sub={`Lo que los colaboradores le piden a RR.HH. Respóndalas dentro de ${PLAZO_SOLICITUD_DIAS} días hábiles.`}>
        <div className="xa-vinculo" role="group" aria-label="Qué pedidos ver">
          {VISTAS.map(v => (
            <button key={v.key} type="button" aria-pressed={vista === v.key} className={vista === v.key ? 'on' : ''} onClick={() => setVista(v.key)}>
              {v.label} <span>{deLaGente.filter(q => q.estado === v.key).length}</span>
            </button>
          ))}
        </div>
      </Cabecera>

      {/* El tipo de pedido es un filtro más, en la misma fila y con la misma forma que los demás. */}
      <div className="xs-filtros">
        <Filtros valor={filtros} onCambio={setFiltros} mostrar={['sede', 'area', 'cargo']} personas={activos(personas)} sucursales={sucursales} tipos={tipos} subtipos={subtipos} />
        <div className={`dc-filtro${tipo ? ' on' : ''}`}>
          {tipo && <button type="button" className="dc-filtro-quitar" aria-label="Quitar el filtro de tipo" title="Quitar este filtro" onClick={() => setTipo('')}><X size={13} aria-hidden="true" /></button>}
          <Desplegable valor={tipo} onCambio={setTipo} ariaLabel="Tipo de pedido" placeholder="Todos los tipos"
            opciones={[{ valor: '', etiqueta: 'Todos los tipos', lateral: String(enVista.length) }, ...Object.entries(TIPOS_SOLICITUD).map(([k, t]) => ({ valor: k, etiqueta: t.label, lateral: String(enVista.filter(q => q.tipo === k).length) }))]} />
        </div>
      </div>

      <div className="dc-tarjeta xb-bandeja">
        {filas.length === 0 ? (
          <Vacio
            Icono={vista === 'pendiente' ? CheckCircle2 : Inbox}
            titulo={vista === 'pendiente' ? 'No hay pedidos pendientes' : vista === 'atendida' ? 'Todavía no se atendió ningún pedido' : 'No se rechazó ningún pedido'}
            texto={vista === 'pendiente' ? 'Lo que pidan los colaboradores desde la app aparecerá aquí.' : 'Quedan aquí con quién y cuándo respondió.'}
          />
        ) : (
          <div className="as-table-wrap xb-tabla-wrap">
            <table className="as-table xb-tabla">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Pide</th>
                  <th>Detalle</th>
                  <th>{vista === 'pendiente' ? 'Responder antes' : 'Respondida'}</th>
                  <th className="xs-col-acc"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {filas.map(q => {
                  const p = porId.get(q.colaboradorId)
                  const t = TIPOS_SOLICITUD[q.tipo]
                  const Icono = ICONOS[q.tipo]
                  const plazo = plazoDe(q)
                  return (
                    <tr key={q.id} className="xa-fila-link" tabIndex={0} onClick={() => navigate(`/documentos/solicitudes/${q.id}`)} onKeyDown={e => { if (e.key === 'Enter') navigate(`/documentos/solicitudes/${q.id}`) }} aria-label={`Abrir el pedido de ${p.name}: ${q.asunto}`}>
                      <td><PersonaCelda persona={p} /></td>
                      <td><Etiqueta tono={t.tono}><Icono size={11} aria-hidden="true" /> {t.singular}</Etiqueta></td>
                      <td>
                        <div className="xb-doc">
                          <span className="xb-doc-nom">{q.asunto}</span>
                          <span className="xb-doc-sub">{q.detalle}</span>
                          {q.estado === 'rechazada' && q.resuelto?.nota && <span className="xb-motivo">Motivo: {q.resuelto.nota}</span>}
                          {q.estado === 'atendida' && q.resuelto?.nota && <span className="xs-resuelto">{q.resuelto.nota}</span>}
                          {q.estado === 'atendida' && q.resuelto?.emitidoId && <button type="button" className="xb-enlace" onClick={() => navigate(`/documentos/emitidos/${q.resuelto.emitidoId}`)}>Ver el envío</button>}
                        </div>
                      </td>
                      <td className="xb-cuando">
                        {vista === 'pendiente'
                          ? <><Etiqueta tono={plazo.tono}>{plazo.texto}</Etiqueta><span>{fechaCorta(plazo.limite)} · pedido el {fechaCorta(q.fecha)}</span></>
                          : <><b>{fechaCorta(q.resuelto?.fecha)}</b><span>{q.resuelto?.por}</span></>}
                      </td>
                      {/* Sólo «Ver detalle»: emitir o rechazar se decide dentro del pedido, con el documento a la vista. */}
                      <td className="xs-col-acc">
                        <button type="button" className="dc-btn dc-btn-sm" onClick={e => { e.stopPropagation(); navigate(`/documentos/solicitudes/${q.id}`) }}>Ver detalle</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {aviso && (
        <div className="xb-aviso" role="status">
          <CheckCircle2 size={16} aria-hidden="true" /> <span>{aviso}</span>
          <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso(null)}><X size={14} /></button>
        </div>
      )}
    </div>
  )
}
