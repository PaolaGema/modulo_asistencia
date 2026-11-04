import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'

/* ── CONFIRMAR ALGO QUE NO SE DESHACE (Ronda 22 · K2 y Ronda 24 · B1) ──────
   La misma ventana que «Eliminar mi cuenta» del celular: centrada, un ícono grande, la pregunta y,
   para confirmar, escribir algo —el nombre de lo que se elimina, o una palabra como BORRAR—. El botón
   rojo se enciende con lo escrito exacto (sin importar mayúsculas ni tildes). Opcionales: `cabeza`
   reemplaza al ícono (la cara de la persona, su rostro tachado) y `pasos` dice qué pasa, en orden.
   Escape o tocar afuera cierran sin hacer nada. */

const llano = t => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

export default function ConfirmarEliminar({ que = 'horario', nombre, titulo, palabra, texto, pasos, cabeza, accion, onConfirmar, onCerrar }) {
  const [escrito, setEscrito] = useState('')
  const ref = useRef(null)
  const clave = palabra || nombre
  const listo = llano(escrito) === llano(clave)
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
      <div className="at-elim" role="alertdialog" aria-modal="true" aria-label={titulo || `Eliminar ${que}`} onClick={e => e.stopPropagation()}>
        {cabeza || <span className="at-elim-ico" aria-hidden="true"><Trash2 size={26} /></span>}
        <b className="at-elim-tit">{titulo || <>¿Eliminar «{nombre}»?</>}</b>
        <p className="at-elim-txt">{texto || 'No se puede deshacer.'}</p>
        {pasos?.length > 0 && (
          <ol className="at-elim-pasos">{pasos.map((p, i) => <li key={i}><i>{i + 1}</i>{p}</li>)}</ol>
        )}
        <label className="at-elim-campo">
          <span>{palabra ? <>Para confirmar, escriba <b className="at-elim-palabra">{palabra}</b></> : `Escriba el nombre del ${que} para confirmar`}</span>
          <span className={`at-elim-in${listo ? ' ok' : ''}`}>
            <input value={escrito} onChange={e => setEscrito(e.target.value)} placeholder={clave} autoFocus autoComplete="off" spellCheck={false}
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
