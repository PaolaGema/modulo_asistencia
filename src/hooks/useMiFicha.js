import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { miFichaDe } from '../data/miFicha'

/* LA FICHA DEL COLABORADOR CON LO QUE ÉL MISMO CAMBIÓ ENCIMA.
   Lo registrado por RR.HH. queda como está; lo que el colaborador edita —contacto, contactos de
   emergencia y preferencias— se guarda aparte, por persona y por clave de campo, y se superpone
   al leer. Así el teléfono y la web muestran lo mismo, y «Borrar datos de la demo» lo devuelve al
   original.

   LAS SOLICITUDES DE CORRECCIÓN son para todo lo demás: el colaborador no cambia el dato, le
   dice a RR.HH. cuál es el correcto. Quedan «Pendiente» hasta que RR.HH. las atienda.

   UNA SOLA CLAVE PARA TODOS: al cambiar de usuario en la demo la pantalla no se vuelve a montar,
   y una clave por persona se quedaba leyendo la del usuario anterior. */
export function useMiFicha(nombre) {
  const [todos, setTodos] = useLocalStorage('mi_ficha', {})
  const suyo = useMemo(() => todos[nombre] || {}, [todos, nombre])
  const actualizar = useCallback(f => setTodos(t => ({ ...t, [nombre]: f(t[nombre] || {}) })), [setTodos, nombre])
  const base = miFichaDe(nombre)

  const ficha = useMemo(
    () => (base ? { ...base, form: { ...base.form, ...(suyo.cambios || {}) } } : null),
    [base, suyo],
  )

  /* Un campo vaciado queda sin dato —y deja de verse—, no como texto en blanco. */
  const guardar = useCallback(parche => {
    const limpio = Object.fromEntries(Object.entries(parche).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]))
    actualizar(s => ({ ...s, cambios: { ...s.cambios, ...limpio } }))
  }, [actualizar])

  const solicitudes = suyo.solicitudes || []
  const solicitar = useCallback(pedido => {
    actualizar(s => ({
      ...s,
      solicitudes: [{ ...pedido, id: Date.now(), fecha: new Date().toISOString(), estado: 'Pendiente' }, ...(s.solicitudes || [])],
    }))
  }, [actualizar])

  return { ficha, guardar, solicitudes, solicitar }
}
