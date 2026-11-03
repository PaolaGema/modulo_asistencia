import { useLocalStorage } from './useLocalStorage'
import { CANALES } from '../data/chatsData'

/* LOS CANALES Y GRUPOS OFICIALES, compartidos entre las dos puertas: RR.HH. los arma en
   Comunicación › Canales y grupos, y cada persona los ve en sus chats (Mi espacio y la app).
   Un canal: solo publica RR.HH., la gente reacciona. Un grupo: todos los que están escriben.
   `para`: 'Toda la empresa' o el nombre de un área. Lo archivado deja de verse en los chats. */
const SEMILLA = CANALES.map(c => ({ ...c, tipo: 'canal', para: 'Toda la empresa', archivado: false }))

export function useCanales() {
  const [canales, setCanales] = useLocalStorage('comunicacion_canales', SEMILLA)
  return [canales || SEMILLA, setCanales]
}

// Lo que le llega a una persona de un área: lo activo, para toda la empresa o para su área.
export const canalesPara = (canales, area) => canales.filter(c => !c.archivado && (c.para === 'Toda la empresa' || c.para === area))
