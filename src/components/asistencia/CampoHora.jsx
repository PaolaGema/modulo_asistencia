import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Clock } from 'lucide-react'

/* ── UNA HORA, CON EL ESTILO DE SOULY ──────────────────────────────────────
   El `<input type="time">` abre el reloj del navegador: una lista gris con bordes cuadrados que no se
   parece a nada del producto. Este campo abre, pegada a él, una tarjeta con dos columnas —horas y
   minutos de 5 en 5— y la elegida en una píldora navy. Un clic en la hora y otro en los minutos; se
   cierra con «Listo», con Escape o tocando afuera. Se puede escribir igual (08:47). */

const HORAS = Array.from({ length: 24 }, (_, i) => i)
const MINUTOS = Array.from({ length: 12 }, (_, i) => i * 5)
const dos = n => String(n).padStart(2, '0')
const partir = v => { const m = /^(\d{1,2}):(\d{2})$/.exec(v || ''); return m ? [+m[1], +m[2]] : [8, 0] }

function Lista({ valores, elegido, onElegir, etiqueta }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current?.querySelector('[aria-selected="true"]')
    if (el) ref.current.scrollTop = el.offsetTop - ref.current.clientHeight / 2 + el.clientHeight / 2
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="at-ch-col">
      <small>{etiqueta}</small>
      <div ref={ref} className="at-ch-lista" role="listbox" aria-label={etiqueta}>
        {valores.map(v => (
          <button key={v} type="button" role="option" aria-selected={v === elegido} className={v === elegido ? 'on' : ''} onClick={() => onElegir(v)}>{dos(v)}</button>
        ))}
      </div>
    </div>
  )
}

export default function CampoHora({ value, onChange, ariaLabel, grande, autoFocus }) {
  const [pos, setPos] = useState(null)
  const [texto, setTexto] = useState(value || '')
  const campo = useRef(null)
  const tarjeta = useRef(null)
  useEffect(() => { setTexto(value || '') }, [value])
  const [h, m] = partir(value)

  const abrir = () => {
    /* Con autoFocus, el foco llega antes de que el campo esté montado: se abre en el cuadro siguiente. */
    if (!campo.current) { requestAnimationFrame(() => { if (campo.current) abrir() }); return }
    const r = campo.current.getBoundingClientRect()
    const abajo = window.innerHeight - r.bottom > 290
    setPos({ left: Math.min(r.left, window.innerWidth - 230), ...(abajo ? { top: r.bottom + 6 } : { bottom: window.innerHeight - r.top + 6 }) })
  }
  useEffect(() => {
    if (!pos) return
    const fuera = e => { if (!tarjeta.current?.contains(e.target) && !campo.current?.contains(e.target)) setPos(null) }
    const tecla = e => { if (e.key === 'Escape') { e.stopPropagation(); setPos(null) } }
    document.addEventListener('mousedown', fuera); document.addEventListener('keydown', tecla, true)
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', tecla, true) }
  }, [pos])

  /* Escribir: se acepta «8», «830», «8:30» o «08:30» y se normaliza al salir del campo. */
  const confirmarTexto = () => {
    const t = texto.replace(/\D/g, '')
    const hh = t.length <= 2 ? +t : +t.slice(0, t.length - 2)
    const mm = t.length <= 2 ? 0 : +t.slice(-2)
    if (t && hh < 24 && mm < 60) onChange(`${dos(hh)}:${dos(mm)}`)
    else setTexto(value || '')
  }

  return (
    <>
      <span ref={campo} className={`at-ch${grande ? ' grande' : ''}${pos ? ' abierto' : ''}`}>
        <input value={texto} aria-label={ariaLabel} inputMode="numeric" autoFocus={autoFocus}
          onChange={e => setTexto(e.target.value)} onFocus={abrir} onClick={() => !pos && abrir()}
          onBlur={confirmarTexto} onKeyDown={e => { if (e.key === 'Enter') { e.currentTarget.blur(); setPos(null) } }} />
        <button type="button" tabIndex={-1} aria-label="Elegir la hora" onClick={() => (pos ? setPos(null) : abrir())}><Clock size={grande ? 16 : 14} /></button>
      </span>
      {pos && createPortal(
        <div ref={tarjeta} className="at-ch-tarjeta" style={pos} role="dialog" aria-label={ariaLabel || 'Elegir la hora'}>
          <div className="at-ch-cols">
            <Lista valores={HORAS} elegido={h} etiqueta="Hora" onElegir={v => onChange(`${dos(v)}:${dos(m)}`)} />
            <span className="at-ch-sep">:</span>
            <Lista valores={MINUTOS} elegido={MINUTOS.includes(m) ? m : null} etiqueta="Minutos" onElegir={v => onChange(`${dos(h)}:${dos(v)}`)} />
          </div>
          <div className="at-ch-pie"><b>{dos(h)}:{dos(m)}</b><button type="button" onClick={() => setPos(null)}>Listo</button></div>
        </div>,
        document.body,
      )}
    </>
  )
}
