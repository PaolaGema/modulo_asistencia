import { useRef, useState } from 'react'
import { sumarDias } from '../data/asistenciaData'

/* ELEGIR DÍAS EN EL CALENDARIO (días sueltos, opción A, 5 nov 2026). Lo usan los calendarios de pedir
   vacación, permiso y trabajo remoto en el celular.
   · Tocar un día lo agrega; otro toque lo quita. Así se pide el 11 y el 16 sin el medio.
   · Arrastrar el dedo sobre varios días los agrega todos (un tramo), saltando los que no se pueden.
   `puede(d)`: si ese día se puede elegir (no pasó, no está pedido, es de trabajo…).
   `cabe(lista)`: si la lista entera entra (la vacación, en el saldo). Si no entra, `tope` queda en true.
   Los días bajo el dedo se leen con `elementFromPoint` porque en pantallas táctiles el movimiento llega
   siempre al primer día tocado. Cada día del calendario lleva `data-dia`. */
export function useDiasElegidos({ puede = () => true, cabe = () => true } = {}) {
  const [sel, setSel] = useState([])
  const [tope, setTope] = useState(false)
  const arrastre = useRef(null)

  const alternar = d => {
    if (!puede(d)) return
    if (sel.includes(d)) { setSel(sel.filter(x => x !== d)); setTope(false); return }
    const n = [...sel, d].sort()
    if (!cabe(n)) { setTope(true); return }
    setSel(n); setTope(false)
  }
  const diaBajo = e => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('[data-dia]')
    return el && !el.disabled ? el.dataset.dia : null
  }
  const empezar = e => {
    const el = e.target.closest?.('[data-dia]')
    arrastre.current = el && !el.disabled ? { inicio: el.dataset.dia, base: sel, movio: false } : null
  }
  const mover = e => {
    const a = arrastre.current
    if (!a || a.suelto) return
    const d = diaBajo(e)
    if (!d || (d === a.inicio && !a.movio)) return
    a.movio = true
    const [x, y] = d < a.inicio ? [d, a.inicio] : [a.inicio, d]
    let n = [...a.base]
    let lleno = false
    for (let f = x; f <= y; f = sumarDias(f, 1)) {
      if (!puede(f) || n.includes(f)) continue
      const m = [...n, f].sort()
      if (!cabe(m)) { lleno = true; break }
      n = m
    }
    setSel(n.sort()); setTope(lleno)
  }
  const soltar = () => { if (arrastre.current?.movio) arrastre.current = { suelto: true, cuando: Date.now() }; else arrastre.current = null }
  /* El clic que llega al soltar después de arrastrar no cuenta como toque. */
  const tocar = d => {
    const a = arrastre.current
    arrastre.current = null
    if (a?.suelto && Date.now() - a.cuando < 500) return
    alternar(d)
  }
  return {
    sel, tope, tocar,
    /* Para las licencias de ley: el sistema pone todos los días de una vez. */
    poner: lista => { setSel([...lista].sort()); setTope(false) },
    limpiar: () => { setSel([]); setTope(false) },
    eventos: { onPointerDown: empezar, onPointerMove: mover, onPointerUp: soltar, onPointerCancel: soltar, style: { touchAction: 'none' } },
  }
}
