import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'

/* ── ELIMINAR, CONFIRMANDO CON EL NOMBRE (Ronda 22 · K2) ───────────────────
   La misma ventana que «Eliminar mi cuenta» del celular: centrada, un ícono grande, la pregunta con
   el nombre y, para confirmar, escribir el nombre de lo que se borra. No se puede eliminar sin mirar
   qué se está eliminando. El botón rojo se enciende con el nombre exacto (sin importar mayúsculas ni
   tildes). Escape o tocar afuera cierran sin borrar nada. */

const llano = t => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

export default function ConfirmarEliminar({ que = 'horario', nombre, texto, accion, onConfirmar, onCerrar }) {
  const [escrito, setEscrito] = useState('')
  const ref = useRef(null)
  const listo = llano(escrito) === llano(nombre)
  useEffect(() => {
    const tecla = e => {
      if (e.key !== 'Escape') return
      const todas = document.querySelectorAll('.pl-overlay')
      if (todas[todas.length - 1] === ref.current) onCerrar()
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])
  const confirmar = () => { if (listo) { onConfirmar(); onCerrar() } }
  return (
    <div className="pl-overlay" ref={ref} onClick={onCerrar}>
      <div className="at-elim" role="alertdialog" aria-modal="true" aria-label={`Eliminar ${que}`} onClick={e => e.stopPropagation()}>
        <span className="at-elim-ico" aria-hidden="true"><Trash2 size={26} /></span>
        <b className="at-elim-tit">¿Eliminar «{nombre}»?</b>
        <p className="at-elim-txt">{texto || 'No se puede deshacer.'}</p>
        <label className="at-elim-campo">
          <span>Escriba el nombre del {que} para confirmar</span>
          <span className={`at-elim-in${listo ? ' ok' : ''}`}>
            <input value={escrito} onChange={e => setEscrito(e.target.value)} placeholder={nombre} autoFocus autoComplete="off" spellCheck={false}
              onKeyDown={e => { if (e.key === 'Enter') confirmar() }} />
            {listo && <em aria-hidden="true">✓</em>}
          </span>
        </label>
        <div className="at-elim-pie">
          <button type="button" className="at-elim-si" disabled={!listo} onClick={confirmar}>{accion || `Eliminar ${que}`}</button>
          <button type="button" className="at-elim-no" onClick={onCerrar}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}
