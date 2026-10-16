import { useArchivoLocal } from './useArchivoLocal'
import { avatarUrl } from '../utils/calendarEvents'

/* LA FOTO DE PERFIL, una sola para todo el teléfono: la portada del perfil, «Editar perfil» y la
   carpeta de Mis documentos muestran la misma. Si la persona subió una (campo 1.9 de la ficha con
   su archivo guardado en el navegador), esa; si no, la del directorio de la demo. */
export function useFotoPerfil(nombre, foto, size = 120) {
  const propia = useArchivoLocal(foto?.clave || null)
  return propia || avatarUrl(nombre, size)
}
