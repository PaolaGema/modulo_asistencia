import { createContext, useContext, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { CURVA } from '../utils/transicionPhone'

const ThemeContext = createContext()

/* EL CAMBIO DE MODO, CON UN CÍRCULO QUE NACE DEL BOTÓN (opción B del lienzo «El efecto al cambiar
   de modo»): el modo nuevo se agranda desde el botón que se tocó hasta cubrir la pantalla, en 0,45 s,
   con la misma curva que al abrir pantallas en el teléfono (transicionPhone).
   Se hace con la API de transiciones de vista: el navegador fotografía la pantalla vieja, aplicamos el
   tema de golpe y recortamos la nueva con un círculo que crece. Donde no hay esa API (Firefox) o la
   persona pidió reducir el movimiento, los colores se funden en 0,4 s.
   `toggleTheme` recibe el evento del clic para saber de dónde sale el círculo; sin él, sale del centro. */
const DURACION = 450

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('soulyhr-theme') || 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('soulyhr-theme', theme)
  }, [theme])

  function toggleTheme(e) {
    const siguiente = theme === 'dark' ? 'light' : 'dark'
    const raiz = document.documentElement
    const aplicar = () => {
      flushSync(() => setTheme(siguiente))
      raiz.classList.toggle('dark', siguiente === 'dark')
    }
    const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (!document.startViewTransition || reducir) {
      raiz.classList.add('tema-fundido')
      aplicar()
      setTimeout(() => raiz.classList.remove('tema-fundido'), 450)
      return
    }

    const r = e?.currentTarget?.getBoundingClientRect?.()
    const x = r ? r.left + r.width / 2 : window.innerWidth / 2
    const y = r ? r.top + r.height / 2 : window.innerHeight / 2

    /* DESDE EL TELÉFONO DE LA DEMO, el círculo se queda dentro del teléfono: se fotografía aparte
       (`telefono`) y el círculo se mide desde su esquina. La página de alrededor solo se funde; si no,
       el círculo se salía del marco y pintaba el fondo de la demo. */
    const telefono = e?.currentTarget?.closest?.('#marco-telefono')
    if (telefono) {
      const t = telefono.getBoundingClientRect()
      const cx = x - t.left, cy = y - t.top
      const radioTel = Math.hypot(Math.max(cx, t.width - cx), Math.max(cy, t.height - cy))
      telefono.style.viewTransitionName = 'telefono'
      const transicion = document.startViewTransition(aplicar)
      transicion.ready.then(() => {
        raiz.animate(
          { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radioTel}px at ${cx}px ${cy}px)`] },
          { duration: DURACION, easing: CURVA, pseudoElement: '::view-transition-new(telefono)' },
        )
        raiz.animate({ opacity: [0, 1] }, { duration: DURACION, easing: CURVA, pseudoElement: '::view-transition-new(root)' })
      }).catch(() => {})
      transicion.finished.finally(() => { telefono.style.viewTransitionName = '' })
      return
    }

    const radio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const transicion = document.startViewTransition(aplicar)
    transicion.ready.then(() => {
      raiz.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
        { duration: DURACION, easing: CURVA, pseudoElement: '::view-transition-new(root)' },
      )
    }).catch(() => {})
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
