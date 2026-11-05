import { X } from 'lucide-react'
import { duracion } from '../../data/asistenciaData'

/* La línea ámbar «Llegó tarde N · Solicitar corrección de hora ›» (ver `useLineaTarde`). Es la misma en el
   Inicio y en Mi asistencia: una tarjeta del teléfono con borde ámbar, el texto y la × para cerrarla. */
export default function LineaTarde({ tardanza, onCorregir, onCerrar, estilo }) {
  return (
    <div role="button" tabIndex={0} onClick={onCorregir} onKeyDown={e => { if (e.key === 'Enter') onCorregir() }} style={{
      background: 'var(--in-carta)', borderRadius: 14, width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px',
      cursor: 'pointer', color: 'var(--in-texto)', boxShadow: 'inset 0 0 0 1.2px #F5B544, var(--in-sombra)', ...estilo,
    }}>
      <span style={{ width: 26, height: 26, borderRadius: 9, background: 'var(--tn-ambar)', color: 'var(--tx-ambar)', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 11 }}>!</span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <b style={{ fontSize: 9.4, fontWeight: 600 }}>Llegó tarde {duracion(tardanza)}</b>
        <span style={{ fontSize: 7.8, color: 'var(--in-mute)' }}><b style={{ color: 'var(--in-acento-txt)', fontWeight: 600 }}>Solicitar corrección de hora ›</b></span>
      </span>
      <button type="button" aria-label="Cerrar aviso" onClick={e => { e.stopPropagation(); onCerrar() }}
        style={{ border: 'none', background: 'none', padding: 2, cursor: 'pointer', color: 'var(--in-suave)', display: 'grid', placeItems: 'center' }}><X size={12} /></button>
    </div>
  )
}
