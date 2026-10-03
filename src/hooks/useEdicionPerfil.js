import { useEffect, useMemo, useState } from 'react'
import { perfilEditable } from '../data/miFichaLectura'
import { quitarCopia, claveDeCuenta, cuantosHay } from '../data/fichaColaborador'
import { useUnsavedChanges } from '../context/UnsavedChangesContext'

/* CONFIGURACIÓN › EDITAR PERFIL DE USUARIO, SIN SU DIBUJO.
   El teléfono y la web enseñan lo mismo con otros tamaños, así que lo que se escribe, lo que
   cambia, lo que falta y cómo se guarda vive aquí una vez.

   LOS CAMPOS ESTÁN ABIERTOS desde que se entra —no hay «Editar» por sección— y los cambios se
   juntan hasta que se pulsa «Guardar cambios», una sola vez para todo. Salir con algo escrito
   pregunta antes, con el mismo aviso que el resto de la aplicación.

   UN DATO OBLIGATORIO NO SE PUEDE BORRAR. Sólo se miran los que la persona tocó: si RR.HH. dejó
   uno sin llenar, eso no le impide guardar su teléfono nuevo. */
const vacio = v => v === null || v === undefined || String(v).trim() === ''
const igual = (a, b) => (typeof a === 'object' || typeof b === 'object')
  ? (a?.nombre || '') === (b?.nombre || '')
  : String(a ?? '').trim() === String(b ?? '').trim()

export function useEdicionPerfil(form, onGuardar) {
  const [cambios, setCambios] = useState({})
  const vivo = useMemo(() => ({ ...form, ...cambios }), [form, cambios])
  const partes = useMemo(() => perfilEditable(vivo), [vivo])

  const sucios = Object.keys(cambios).filter(k => !k.startsWith('__n_') && !igual(cambios[k], form[k]))
  const copias = Object.keys(cambios).some(k => k.startsWith('__n_') && Number(cambios[k]) !== cuantosHay(form, k.slice(4)))
  const hayCambios = sucios.length > 0 || copias
  const faltan = partes.flatMap(p => p.secciones).flatMap(s => s.campos)
    .filter(c => c.requerido && c.key in cambios && vacio(vivo[c.key]))

  const set = (k, v) => setCambios(c => ({ ...c, [k]: v }))
  const aplicar = parche => setCambios(c => ({ ...c, ...parche }))
  /* Otra copia de un bloque —otro hijo, otro contacto— con lo que su primera trae de arranque. */
  const agregar = campo => {
    const n = cuantosHay(vivo, campo.grupo) + 1
    const parche = { [claveDeCuenta(campo.grupo)]: n }
    for (const [base, v] of Object.entries(campo.arranque || {})) {
      const k = n === 1 ? base : base + '#' + n
      if (vacio(vivo[k])) parche[k] = v
    }
    setCambios(c => ({ ...c, ...parche }))
  }
  const quitar = (seccion, rotulo) => setCambios(c => ({
    ...c, ...quitarCopia({ ...form, ...c }, seccion.campos, rotulo.grupo, rotulo.instancia),
  }))

  const guardar = () => {
    if (faltan.length) return false
    onGuardar(cambios)
    setCambios({})
    return true
  }
  const descartar = () => setCambios({})

  /* El aviso de salida de la aplicación: el menú, la barra del teléfono y «Volver» pasan por él. */
  const { setDirty, setSaveHandler, setTextos, guardNavigate } = useUnsavedChanges()
  useEffect(() => {
    setTextos({ texto: 'Hizo cambios en su perfil que todavía no guardó. ¿Qué desea hacer?' })
    return () => setTextos(null)
  }, [setTextos])
  useEffect(() => { setDirty(hayCambios) }, [hayCambios, setDirty])
  // Sin dependencias a propósito: el aviso tiene que guardar los cambios de ahora, no los de antes.
  useEffect(() => { setSaveHandler(() => guardar()) })
  useEffect(() => () => { setDirty(false); setSaveHandler(null) }, [setDirty, setSaveHandler])

  return {
    vivo, partes, set, aplicar, agregar, quitar,
    cuantos: sucios.length, hayCambios, faltan, guardar, descartar, salir: guardNavigate,
  }
}
