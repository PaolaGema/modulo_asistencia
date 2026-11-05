import { useState } from 'react'
import { useAsistencia } from '../context/AsistenciaContext'
import { cambiosDe } from '../utils/correccion'

/* «MARCAR AHORA, CORREGIR CUANDO QUIERA» (opción A de «Lo que la app ya sabe · ronda 2», 5 nov 2026). Marcar
   no pregunta nada. Si la entrada de hoy quedó tarde, el Inicio y Mi asistencia lo dicen en una línea ámbar
   y ofrecen corregir la hora con calma. Se queda hasta que la corrija (la solicitud pendiente la reemplaza)
   o la cierre con la ×; cerrarla vale para las dos pantallas y para todo el día. */
const clave = (pid, fecha) => `inicio-tarde-cerrada-${pid}-${fecha}`
const leer = k => { try { return localStorage.getItem(k) === '1' } catch { return false } }

export function useLineaTarde() {
  const at = useAsistencia()
  const yo = at.yo
  const j = at.jornadaDe(yo, at.hoy)
  const k = clave(yo.id, at.hoy)
  const [, setTic] = useState(0)
  const pedida = at.solicitudes.some(s => s.tipo === 'correccion' && s.estado === 'pendiente' && String(s.personaId) === String(yo.id) && s.fecha === at.hoy && cambiosDe(s).some(c => c.tipo === 'entrada'))
  const ver = !leer(k) && !pedida && j.entrada != null && j.llegoTarde && j.tardanza > 0
  const cerrar = () => { try { localStorage.setItem(k, '1') } catch { /* sin almacenamiento: vuelve a salir al recargar */ } setTic(n => n + 1) }
  return { ver, tardanza: j.tardanza, cerrar }
}
