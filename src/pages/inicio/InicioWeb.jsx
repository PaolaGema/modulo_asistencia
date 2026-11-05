import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import InicioPhone from '../../components/layout/InicioPhone'
import PanelCel from '../../components/layout/PanelCel'
import SolicitarVacacionPhone from '../../components/layout/VacacionPhone'
import SolicitarPermisoPhone from '../../components/layout/PermisoPhone'
import BeneficiosPhone from '../../components/layout/BeneficiosPhone'
import { CorregirMarcaCel } from '../../components/asistencia/Marcador'

/* MI ESPACIO › INICIO (opción A de «Mi espacio web · Propuestas», 5 nov 2026: «las mismas cinco puertas»).
   Es el Inicio del teléfono, con sus mismas piezas, en dos columnas: a la izquierda lo suyo —la hora con
   «Marcar entrada», la línea de solicitudes y las acciones rápidas—; a la derecha lo de la empresa
   —cumpleaños y noticias—. Reemplaza a «Mi día», que tenía otras piezas y una fecha fija.
   Se dibuja con `zoom`, como el teléfono de la demo, así los tamaños son los mismos en las dos puertas.
   Marcar lleva a Mi asistencia con el paso ya confirmado; la vacación, el permiso y los beneficios se
   abren en el panel del teléfono, a la derecha. */
const ZOOM = 1.6

export default function InicioWeb() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const [panel, setPanel] = useState(null) // 'vacacion' | 'permiso' | 'beneficios'
  const cerrar = () => setPanel(null)

  return (
    <div className="content-scroll">
      <div style={{ zoom: ZOOM, maxWidth: 720, margin: '0 auto' }}>
        <InicioPhone web currentUser={currentUser}
          onMarcar={t => navigate(`/mi-espacio/mi-asistencia${t ? `?marcar=${t}` : ''}`)}
          onVacacion={() => setPanel('vacacion')}
          onPermiso={() => setPanel('permiso')}
          onBeneficios={() => setPanel('beneficios')}
          onSolicitudes={() => navigate('/mi-espacio/zona-hr/solicitudes')}
          onCalendario={() => navigate('/mi-espacio/calendario')}
          onPerfil={() => navigate('/mi-espacio/perfil')}
          onCorregir={() => setPanel('corregir')} />
      </div>

      <PanelCel abierto={!!panel} onCerrar={cerrar} etiqueta={{ vacacion: 'Solicitar vacación', permiso: 'Permiso o licencia', beneficios: 'Mis beneficios', corregir: 'Corregir una marcación' }[panel]}>
        {panel === 'vacacion' && <SolicitarVacacionPhone onVolver={cerrar} volverA="Inicio" onListo={cerrar} />}
        {panel === 'permiso' && <SolicitarPermisoPhone onVolver={cerrar} volverA="Inicio" onListo={cerrar} />}
        {panel === 'corregir' && <CorregirMarcaCel volverA="Inicio" abrir="entrada" onVolver={cerrar} onEnviada={cerrar} />}
        {panel === 'beneficios' && <BeneficiosPhone currentUser={currentUser} onVolver={cerrar} volverA="Inicio" />}
      </PanelCel>
    </div>
  )
}
