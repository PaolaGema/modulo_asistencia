import { useState, useCallback, useEffect, useRef } from 'react'

const PREFIX = 'onb_demo_'

export function useLocalStorage(key, initialValue) {
  const prefixedKey = PREFIX + key

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(prefixedKey)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    setStoredValue(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      try {
        localStorage.setItem(prefixedKey, JSON.stringify(next))
      } catch { /* quota exceeded — ignore */ }
      return next
    })
  }, [prefixedKey])

  /* OTRA PESTAÑA CAMBIÓ O BORRÓ LA CLAVE («Borrar datos de la demo», o la vista del teléfono abierta
     al lado de la de RR.HH.): esta se pone al día. Sin esto, la pestaña vieja seguía con las marcas
     en memoria —el teléfono decía «Listo por hoy» y no dejaba volver a marcar— y al tocar
     cualquier cosa las volvía a escribir encima de lo borrado. */
  const inicial = useRef(initialValue)
  useEffect(() => {
    const alCambiar = e => {
      if (e.storageArea !== localStorage || (e.key !== null && e.key !== prefixedKey)) return
      try {
        const item = localStorage.getItem(prefixedKey)
        setStoredValue(item !== null ? JSON.parse(item) : inicial.current)
      } catch { setStoredValue(inicial.current) }
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [prefixedKey])

  return [storedValue, setValue]
}

export function clearAllDemoData() {
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k.startsWith(PREFIX)) keys.push(k)
  }
  keys.forEach(k => localStorage.removeItem(k))
}
