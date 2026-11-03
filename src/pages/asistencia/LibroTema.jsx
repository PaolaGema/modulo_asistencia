import { Navigate, useParams, useSearchParams } from 'react-router-dom'

/* Los temas del Libro dejaron de ser páginas aparte (Ronda 15 · T2): son un filtro del Mes. Los
   enlaces viejos (/asistencia/registro/faltas) llevan al Mes con el tema elegido y la lista abierta. */
export default function LibroTema() {
  const { tema } = useParams()
  const [params] = useSearchParams()
  const mes = params.get('mes')
  return <Navigate to={`/asistencia/registro?ver=mes&tema=${tema}&lista=1${mes ? `&fecha=${mes}-01` : ''}`} replace />
}
