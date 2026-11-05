import { Check } from 'lucide-react'

/* La línea verde del permiso por horas (el texto sale de «textoPermiso», en utils/permisoHoras.js). */
export default function LineaPermiso({ texto, estilo }) {
  return (
    <div style={{
      background: 'var(--in-carta)', borderRadius: 14, width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px',
      color: 'var(--in-texto)', boxShadow: 'inset 0 0 0 1px #9FE3C6, var(--in-sombra)', ...estilo,
    }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px #00E091', color: 'var(--in-acento-txt)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Check size={13} strokeWidth={2.4} /></span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <b style={{ fontSize: 9.4, fontWeight: 600 }}>{texto.titulo}</b>
        <span style={{ fontSize: 7.8, color: 'var(--in-mute)' }}>{texto.sub}</span>
      </span>
    </div>
  )
}
