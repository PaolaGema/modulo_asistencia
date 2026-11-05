import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/* UN PEDIDO DEL TELÉFONO, ABIERTO EN LA WEB (Mi espacio, opción A de «Mi espacio web · Propuestas»).
   La web no tiene formularios propios para la vacación, el permiso o los beneficios: usa los mismos del
   teléfono, en un panel a la derecha del ancho del teléfono (280 × 1,6) y con el mismo `zoom`, así una
   persona pide igual desde las dos puertas. Se cierra con el «‹ volver» del formulario, con Escape o
   tocando afuera. */
export default function PanelCel({ abierto, onCerrar, etiqueta, children }) {
  useEffect(() => {
    if (!abierto) return
    const tecla = e => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [abierto, onCerrar])
  if (!abierto) return null
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={etiqueta} style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <button type="button" aria-label="Cerrar" onClick={onCerrar} style={{ position: 'absolute', inset: 0, border: 'none', padding: 0, background: 'rgba(12,45,64,.42)', cursor: 'default' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 448, maxWidth: '100%', background: 'var(--in-fondo)', overflowY: 'auto', boxShadow: '-20px 0 40px -20px rgba(12,45,64,.45)' }}>
        <div style={{ zoom: 1.6, padding: '12px 10px 14px', minHeight: 'calc(100vh / 1.6)', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
