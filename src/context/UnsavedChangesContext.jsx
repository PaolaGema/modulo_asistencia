import { createContext, useContext, useCallback, useRef, useState } from 'react'

const UnsavedChangesContext = createContext()

export function UnsavedChangesProvider({ children }) {
  const [dirty, setDirty] = useState(false)
  const [pendingNav, setPendingNav] = useState(null)
  const saveHandlerRef = useRef(null)
  const discardHandlerRef = useRef(null)
  /* LO QUE DICE EL AVISO, si la pantalla quiere decir otra cosa que «cambios sin guardar». La
     ficha del colaborador pregunta si se guarda el registro como borrador: ahí «guardar» no es
     aplicar cambios sino dejar el registro a medias para seguir después. */
  const [textos, setTextos] = useState(null)

  const setSaveHandler = useCallback(fn => { saveHandlerRef.current = fn }, [])
  /* Qué hacer al salir SIN guardar, además de salir. La ficha borra el borrador; las demás
     pantallas no necesitan nada porque lo no guardado ya se pierde solo. */
  const setDiscardHandler = useCallback(fn => { discardHandlerRef.current = fn }, [])

  const guardNavigate = useCallback((navigateFn) => {
    if (!dirty) { navigateFn(); return }
    setPendingNav(() => navigateFn)
  }, [dirty])

  function confirmDiscard() {
    const fn = pendingNav
    discardHandlerRef.current?.()
    setDirty(false)
    setPendingNav(null)
    fn?.()
  }

  /* El handler recibe el destino porque puede necesitar un paso más antes de salir
     (elegir a quiénes aplicar los cambios de una ruta activa, por ejemplo). Si devuelve
     'diferido' se queda él con la navegación y con limpiar el aviso; si no, se sale aquí. */
  function confirmSave() {
    const fn = pendingNav
    setPendingNav(null)
    if (saveHandlerRef.current?.(fn) === 'diferido') return
    setDirty(false)
    fn?.()
  }

  function cancelExit() {
    setPendingNav(null)
  }

  return (
    <UnsavedChangesContext.Provider value={{
      dirty, setDirty, setSaveHandler, setDiscardHandler, setTextos, textos, guardNavigate,
      exitConfirmOpen: !!pendingNav, confirmDiscard, confirmSave, cancelExit,
    }}>
      {children}
    </UnsavedChangesContext.Provider>
  )
}

export function useUnsavedChanges() {
  return useContext(UnsavedChangesContext)
}
