import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Marcador from '../../components/asistencia/Marcador'

/* ── MI ASISTENCIA, EN LA WEB ──────────────────────────────────────────────
   La misma pantalla del celular, agrandada, como Zona HR (Mi espacio web = la barra del celular, 5 nov
   2026). Antes era una página propia de escritorio, con el marcador a la izquierda y el mes a la derecha:
   quedó vieja cuando Mi espacio pasó a usar las piezas del teléfono. Una sola versión sirve para las dos
   puertas: lo que cambia en el celular, cambia aquí. */

export default function MiAsistencia() {
  const navigate = useNavigate()
  /* «Marcar entrada» del Inicio web llega con el paso ya confirmado (?marcar=entrada): va directo al escaneo. */
  const [params, setParams] = useSearchParams()
  const [marcar] = useState(() => params.get('marcar'))
  // Se lee una vez y se quita de la dirección: al recargar, no vuelve a abrir el escaneo.
  useEffect(() => { if (params.get('marcar')) setParams({}, { replace: true }) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="content-scroll">
      <div style={{ zoom: 1.6, maxWidth: 720, margin: '0 auto' }}>
        <div className="at-cel">
          <Marcador iniciar={marcar} telefono volverA="Zona HR" onVolver={() => navigate('/mi-espacio/zona-hr')} />
        </div>
      </div>
    </div>
  )
}
