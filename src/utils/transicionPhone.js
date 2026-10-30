import { flushSync } from 'react-dom'

/* ── EL MOVIMIENTO AL NAVEGAR EN EL TELÉFONO (opción B del lienzo «Transiciones al abrir y volver») ──
   Lo nuevo nace de lo que se tocó: la pantalla que se abre crece desde la tarjeta o el botón tocado
   hasta ocupar el teléfono, y al volver se encoge de regreso a su lugar. Es la misma regla del cambio
   de modo (el círculo sale del sol o la luna), con la misma curva. Las pestañas de abajo son hermanas,
   no nacen de nada: entre ellas, un fundido corto.

   Se hace con la API de transiciones de vista: el navegador fotografía la pantalla de antes, el cambio
   se aplica de golpe y se recorta la de después (o la de antes, al volver). El teléfono se fotografía
   aparte, así el recorte nunca pasa de su borde. Sin la API, o con «reducir movimiento», el cambio es
   directo o un fundido.

   De dónde se tocó: se recuerda el último botón presionado dentro del teléfono, así ninguna pantalla
   tiene que pasar su evento. Cada apertura guarda su origen en una pila para saber adónde volver. */

export const CURVA = 'cubic-bezier(.2, .8, .2, 1)'
const ABRIR = 320
const FUNDIDO = 200

let tocado = null
const origenes = []

if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', e => {
    const el = e.target.closest?.('#marco-telefono button, #marco-telefono [role="button"], #marco-telefono a')
    tocado = el ? { rect: el.getBoundingClientRect(), cuando: Date.now() } : null
  }, true)
}

const quieto = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const directo = () => !document.startViewTransition
const telefono = () => document.getElementById('marco-telefono')

/* TODO PASA DENTRO DEL TELÉFONO. El teléfono se fotografía aparte (`telefono`), así los recortes se
   miden desde su esquina y no pueden salirse de su borde; la página de alrededor no se mueve. */
const recorte = (r, t, radio) => `inset(${r.top - t.top}px ${t.right - r.right}px ${t.bottom - r.bottom}px ${r.left - t.left}px round ${radio}px)`
const radioMarco = t => Math.round(31 * (t.width / 290))

function enTelefono(cambiar, animar, { volviendo = false } = {}) {
  const tel = telefono()
  if (!tel) return cambiar()
  const t = tel.getBoundingClientRect()
  const raiz = document.documentElement
  tel.style.viewTransitionName = 'telefono'
  if (volviendo) raiz.classList.add('vt-volver')
  const vt = document.startViewTransition(() => flushSync(cambiar))
  vt.ready.then(() => animar(raiz, t)).catch(() => {})
  vt.finished.finally(() => { tel.style.viewTransitionName = ''; raiz.classList.remove('vt-volver') })
}

function fundido(cambiar) {
  if (directo()) return cambiar()
  enTelefono(cambiar, raiz => raiz.animate(
    { opacity: [0, 1] },
    { duration: FUNDIDO, easing: CURVA, pseudoElement: '::view-transition-new(telefono)' },
  ))
}

/* Abrir: crece desde lo tocado. Sin origen conocido (teclado) o con «reducir movimiento», fundido. */
export function abrirCreciendo(cambiar) {
  const origen = tocado && Date.now() - tocado.cuando < 1500 ? tocado.rect : null
  tocado = null
  origenes.push(origen)
  if (directo()) return cambiar()
  if (quieto() || !origen) return fundido(cambiar)
  enTelefono(cambiar, (raiz, t) => raiz.animate(
    { clipPath: [recorte(origen, t, 12), `inset(0px round ${radioMarco(t)}px)`], opacity: [0.4, 1] },
    { duration: ABRIR, easing: CURVA, pseudoElement: '::view-transition-new(telefono)' },
  ))
}

/* Volver: la pantalla se encoge hasta la tarjeta de donde salió (la de antes va encima). */
export function volverEncogiendo(cambiar) {
  const origen = origenes.pop()
  if (directo()) return cambiar()
  if (quieto() || !origen) return fundido(cambiar)
  enTelefono(cambiar, (raiz, t) => raiz.animate(
    { clipPath: [`inset(0px round ${radioMarco(t)}px)`, recorte(origen, t, 12)], opacity: [1, 0.3] },
    { duration: ABRIR, easing: CURVA, pseudoElement: '::view-transition-old(telefono)', fill: 'forwards' },
  ), { volviendo: true })
}

/* Entre pestañas hermanas: la nueva aparece sobre la anterior, y se olvidan los orígenes. */
export function cambiarPestana(cambiar) {
  origenes.length = 0
  fundido(cambiar)
}
