import { Palmtree, Clock, House } from 'lucide-react'
import { SUBTIPOS_PERMISO, DIAS_LARGOS, MESES, diaISO, aFecha } from '../../data/asistenciaData'

/* «YA TIENE PEDIDO» (opción A de «Lo que ya pidió», 5 nov 2026): debajo de los calendarios de pedir, una ficha
   por cada cosa que ya pidió o le aprobaron en el mes que se mira, como las tarjetas de Mis solicitudes: el
   ícono del tipo en el aro menta, qué es, el día y la etiqueta de estado. El único color es el estado. */
const ICONO = { vacaciones: Palmtree, permiso: Clock, remoto: House }
const corto = s => `${DIAS_LARGOS[diaISO(s)].slice(0, 3).replace(/^./, c => c.toUpperCase())} ${aFecha(s).getDate()} ${MESES[aFecha(s).getMonth()].slice(0, 3)}`
const dia = s => `${aFecha(s).getDate()} ${MESES[aFecha(s).getMonth()].slice(0, 3)}`
const ETIQUETA = { pendiente: ['Por aprobar', 'var(--tx-ambar)', 'var(--tn-ambar)'], aprobada: ['Aprobado', 'var(--tx-verde)', 'var(--tn-verde)'] }

export default function YaPedido({ ocupados, celdas }) {
  const desde = celdas[0]
  const hasta = celdas.at(-1)
  const aca = ocupados.lista.filter(s => s.desde <= hasta && (s.hasta || s.desde) >= desde).sort((a, b) => a.desde.localeCompare(b.desde))
  if (!aca.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)', margin: '4px 2px 0' }}>Ya tiene pedido</span>
      {aca.map(s => {
        const Icono = ICONO[s.tipo] || Clock
        const sub = s.tipo === 'permiso' ? SUBTIPOS_PERMISO.find(t => t.key === s.subtipo)?.label : null
        const nombre = s.tipo === 'vacaciones' ? 'Vacación' : s.tipo === 'remoto' ? 'Trabajo remoto' : `Permiso${sub ? ` · ${sub}` : ''}`
        const cuando = s.hasta && s.hasta !== s.desde ? `${dia(s.desde)} – ${dia(s.hasta)}` : `${corto(s.desde)}${s.horaDesde ? ` · ${s.horaDesde} a ${s.horaHasta}` : ''}`
        const [txt, color, fondo] = ETIQUETA[s.estado] || ETIQUETA.pendiente
        return (
          <div key={s.id} style={{ background: 'var(--in-carta)', borderRadius: 12, boxShadow: 'var(--in-sombra)', padding: '6px 8px', display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) auto', gap: 7, alignItems: 'center' }}>
            <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.3px #00E091', display: 'grid', placeItems: 'center', color: 'var(--in-texto)' }}><Icono size={11} strokeWidth={1.8} /></span>
            <span style={{ display: 'grid', minWidth: 0 }}>
              <b style={{ fontSize: 8.6, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombre}</b>
              <small style={{ fontSize: 7.2, color: 'var(--in-mute)' }}>{cuando}</small>
            </span>
            <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: fondo, color, whiteSpace: 'nowrap' }}>{txt}</em>
          </div>
        )
      })}
    </div>
  )
}
