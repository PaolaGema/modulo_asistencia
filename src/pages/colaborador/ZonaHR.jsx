import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import ZonaHRPhone from '../../components/layout/ZonaHRPhone'
import PanelCel from '../../components/layout/PanelCel'
import SolicitarVacacionPhone from '../../components/layout/VacacionPhone'
import SolicitarPermisoPhone, { SolicitarRemotoPhone } from '../../components/layout/PermisoPhone'
import BeneficiosPhone from '../../components/layout/BeneficiosPhone'

/* ZONA HR — EL LANZADOR DE MÓDULOS (opción A de «Mi espacio web · Propuestas», 5 nov 2026).
   Es la Zona HR del teléfono, la misma pieza (`ZonaHRPhone`), a seis columnas y con `zoom`: el mismo
   buscador, el mismo aro menta, el número ámbar de lo que espera y el reloj de Mi asistencia. Mi asistencia
   y el calendario viven aquí, como en el teléfono; el menú deja Zona HR encendida mientras uno está en ellos.

   Cada destino del teléfono se traduce a su pantalla web. Lo que en la web no tiene pantalla propia (la
   vacación, el permiso, el trabajo remoto, los beneficios) se abre en el panel del teléfono, a la derecha.
   Personas y Organigrama siguen detrás del guardia de rutas: solo quien gestiona tiene a dónde ir. */
const ADMINISTRA = ['admin', 'manager', 'auxiliar']
const PANELES = { vacacion: 'Solicitar vacación', permiso: 'Permiso o licencia', remoto: 'Trabajo remoto', beneficios: 'Mis beneficios' }

export default function ZonaHR() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const [panel, setPanel] = useState(null)
  const cerrar = () => setPanel(null)
  const gestiona = currentUser.role === 'admin' || currentUser.role === 'manager'

  const navegar = (destino, con) => {
    const paso = con?.find?.(x => PANELES[x.p])?.p
    if (paso) return setPanel(paso)
    if (PANELES[destino]) return setPanel(destino)
    const ruta = {
      organigrama: gestiona && '/organizacion/organigrama',
      onboarding: ADMINISTRA.includes(currentUser.role) ? '/onboarding' : '/mi-espacio/mi-onboarding',
      documentos: '/mi-espacio/zona-hr/documentos',
      solicitudes: '/mi-espacio/zona-hr/solicitudes',
      asistencia: '/mi-espacio/mi-asistencia',
      calendario: '/mi-espacio/calendario',
    }[destino]
    if (ruta) navigate(ruta)
  }

  return (
    <div className="content-scroll">
      <div style={{ zoom: 1.6, maxWidth: 720, margin: '0 auto' }}>
        <ZonaHRPhone web currentUser={currentUser} onNavegar={navegar} />
      </div>
      <PanelCel abierto={!!panel} onCerrar={cerrar} etiqueta={PANELES[panel]}>
        {panel === 'vacacion' && <SolicitarVacacionPhone onVolver={cerrar} volverA="Zona HR" onListo={cerrar} listoTexto="Volver a Zona HR" />}
        {panel === 'permiso' && <SolicitarPermisoPhone onVolver={cerrar} volverA="Zona HR" onListo={cerrar} listoTexto="Volver a Zona HR" />}
        {panel === 'remoto' && <SolicitarRemotoPhone onVolver={cerrar} volverA="Zona HR" onListo={cerrar} listoTexto="Volver a Zona HR" />}
        {panel === 'beneficios' && <BeneficiosPhone currentUser={currentUser} onVolver={cerrar} volverA="Zona HR" />}
      </PanelCel>
    </div>
  )
}
