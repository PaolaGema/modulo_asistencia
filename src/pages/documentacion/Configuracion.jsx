import { useSearchParams } from 'react-router-dom'
import { Cabecera } from '../../components/documentacion/comunes'
import { Modelos } from './Biblioteca'
import Notificaciones from './Notificaciones'
import './configuracion.css'

/* ── CONFIGURACIÓN DE DOCUMENTACIÓN (v3) ──────────────────────────────────
   Todo lo que se arma una vez: con qué plantillas se envían certificados, memorándums y
   contratos, y cuándo se avisa y cómo se numera.
   SUS PARTES SON SUBSECCIONES DEL MENÚ (15 oct 2026), como los ejes de Organización: ya no hay
   pestañas en la pantalla, y cada parte lleva su propio título. `?ver=avisos` abre la segunda.
   «Carpetas y documentos» salió de acá el mismo día: `Taxonomia` sigue en TiposSubtipos.jsx.
   «Notificaciones y numeración» es su propia pantalla (`Notificaciones.jsx`, 16 oct 2026), con un
   solo «Guardar cambios»; `AvisosGenerales` y `Numeracion` quedaron sin usar. */
const PARTES = {
  plantillas: { titulo: 'Plantillas', sub: 'Lo que RR.HH. envía: certificados, memorándums y contratos.' },
  avisos: { titulo: 'Notificaciones y numeración', sub: 'A quién se le avisa, por dónde y con cuánta anticipación cuando un documento o un contrato está por vencer, y cómo se numera lo que emite RR.HH.' },
}

export default function Configuracion() {
  const [params] = useSearchParams()
  const ver = PARTES[params.get('ver')] ? params.get('ver') : 'plantillas'
  return (
    <div className="content-scroll">
      {ver === 'plantillas' && (
        <>
          <Cabecera titulo={PARTES.plantillas.titulo} sub={PARTES.plantillas.sub} />
          <Modelos />
        </>
      )}
      {ver === 'avisos' && <Notificaciones titulo={PARTES.avisos.titulo} sub={PARTES.avisos.sub} />}
    </div>
  )
}
