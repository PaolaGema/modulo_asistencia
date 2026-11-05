import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'
import { RutaActivaProvider } from './context/RutaActivaContext'
import { ConfigProvider } from './context/ConfigContext'
import { OnboardingDataProvider } from './context/OnboardingDataContext'
import { UnsavedChangesProvider } from './context/UnsavedChangesContext'
import Layout from './components/layout/Layout'
import Home from './pages/inicio/Home'
import InicioWeb from './pages/inicio/InicioWeb'
import MiCalendarioWeb from './pages/inicio/MiCalendarioWeb'
import Calendario from './pages/calendario/Calendario'
import Dashboard from './pages/onboarding/Dashboard'
import Asignaciones from './pages/onboarding/Asignaciones'
import DetalleAsignacion from './pages/onboarding/DetalleAsignacion'
import Plantillas from './pages/onboarding/Plantillas'
import Conocimiento from './pages/onboarding/Conocimiento'
import Configuracion from './pages/onboarding/Configuracion'
import MiOnboarding from './pages/colaborador/MiOnboarding'
import MisAcompanados from './pages/onboarding/MisAcompanados'
import Chats from './pages/comunicacion/Chats'
import { Anuncios, Reconocimientos, Eventos, MensajesProgramados } from './pages/comunicacion/Proximamente'
import CanalesGrupos from './pages/comunicacion/CanalesGrupos'
import ZonaHR from './pages/colaborador/ZonaHR'
import Perfil from './pages/colaborador/Perfil'
import MisDocumentos, { MisSolicitudes } from './pages/colaborador/MisDocumentos'
import Colaboradores from './pages/personas/Colaboradores'
import ColaboradorNuevo from './pages/personas/ColaboradorNuevo'
import ClientesExternos from './pages/personas/ClientesExternos'
import ConfiguracionFicha from './pages/personas/ConfiguracionFicha'
import Organigrama from './pages/personas/Organigrama'
import DatosEmpresa from './pages/organizacion/DatosEmpresa'
import Sucursales from './pages/organizacion/Sucursales'
import SucursalDetalle from './pages/organizacion/SucursalDetalle'
import Estructura from './pages/organizacion/Estructura'
import { EJES } from './data/estructuraData'
import NodoDetalle from './pages/organizacion/NodoDetalle'
import ConfiguracionOrg from './pages/organizacion/ConfiguracionOrg'
import Mandos from './pages/organizacion/Mandos'
import Areas from './pages/organizacion/Areas'
import Cargos from './pages/organizacion/Cargos'
import Puestos from './pages/organizacion/Puestos'
import MisArchivos from './pages/archivos/MisArchivos'
import RecursosPersonas from './pages/archivos/RecursosPersonas'
import RecursosComunicacion from './pages/archivos/RecursosComunicacion'
import RecursosEvaluacion from './pages/archivos/RecursosEvaluacion'
import RolesPermisos from './pages/configuracion/RolesPermisos'
import { DocumentacionProvider } from './context/DocumentacionContext'
import DocLegajos from './pages/documentacion/Legajos'
import DocExpediente from './pages/documentacion/Expediente'
import DocEmitir from './pages/documentacion/Emitir'
import DocEditorPlantilla from './pages/documentacion/EditorPlantilla'
import DocContrato from './pages/documentacion/Contrato'
import DocRevisar from './pages/documentacion/Revisar'
import DocSolicitudes from './pages/documentacion/Solicitudes'
import DocAtender from './pages/documentacion/Atender'
import DocEnvios from './pages/documentacion/Envios'
import DocEnvio from './pages/documentacion/Envio'
import DocConfiguracion from './pages/documentacion/Configuracion'
import { AsistenciaProvider } from './context/AsistenciaContext'
import AtHoy from './pages/asistencia/Hoy'
import AtRegistro from './pages/asistencia/Registro'
import AtPersona from './pages/asistencia/Persona'
import AtLibroTema from './pages/asistencia/LibroTema'
import AtSolicitudes from './pages/asistencia/Solicitudes'
import AtConfiguracion from './pages/asistencia/Configuracion'
import MiAsistencia from './pages/colaborador/MiAsistencia'

/* Lleva un enlace viejo de Seguimiento (?pila=…) a donde quedó: lo que espera revisión tiene su
   pantalla; lo demás es Colaboradores visto por documento. */
function SeguimientoAColaboradores() {
  const [params] = useSearchParams()
  const pila = params.get('pila') || 'revision'
  return <Navigate to={pila === 'revision' ? '/documentos/expedientes/revisar' : `/documentos/expedientes?pend=${pila}&ver=documento`} replace />
}

/* Una dirección de antes, a la de ahora, con lo que traía detrás (el id, la carpeta, la consulta). */
/* La vieja pantalla «Envíos» se partió en dos (15 oct 2026): sus solicitudes van a Solicitudes y lo
   demás a Documentos emitidos. */
function EnviosViejo() {
  const { search } = useLocation()
  return <Navigate to={new URLSearchParams(search).get('ver') === 'solicitudes' ? '/documentos/solicitudes' : '/documentos/emitidos'} replace />
}

function CambiarPrefijo({ de, a }) {
  const { pathname, search } = useLocation()
  return <Navigate to={`${a}${pathname.slice(de.length)}${search}`} replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
      <OnboardingDataProvider>
      <ConfigProvider>
      <RutaActivaProvider>
      <UnsavedChangesProvider>
      <DocumentacionProvider>
      <AsistenciaProvider>
      <BrowserRouter>
        <Routes>
          {/* Lo personal vive junto y aparte de lo administrativo: Inicio y Onboarding
              quedaron solo para quien administra. Las rutas viejas siguen respondiendo
              —redirigen— porque hay enlaces y marcadores apuntando ahí. */}
          <Route path="/mi-espacio" element={<Layout />}>
            <Route index element={<Navigate to="/mi-espacio/mi-dia" replace />} />
            <Route path="mi-dia" element={<InicioWeb />} />
            {/* MI CALENDARIO: el de la persona —sus vacaciones y permisos, feriados, cumpleaños de
                su área—. El de toda la empresa sigue en Inicio, que es lo administrativo. */}
            <Route path="calendario" element={<MiCalendarioWeb />} />
            <Route path="mi-onboarding" element={<MiOnboarding />} />
            <Route path="mi-asistencia" element={<MiAsistencia />} />
            <Route path="acompanados" element={<MisAcompanados />} />
            {/* Las tres pestañas que el colaborador ya tenía en el móvil y no en escritorio.
                Ahora las tres existen aquí con su propia pantalla. */}
            <Route path="chats" element={<Chats />} />
            <Route path="zona-hr" element={<ZonaHR />} />
            {/* Cuelga de Zona HR, que es desde donde se abre: así el menú la deja encendida. */}
            <Route path="zona-hr/documentos" element={<MisDocumentos />} />
            <Route path="zona-hr/solicitudes" element={<MisSolicitudes />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>

          <Route path="/inicio" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="mi-dia" element={<Navigate to="/mi-espacio/mi-dia" replace />} />
            <Route path="calendario" element={<Calendario />} />
          </Route>
          <Route path="/calendario" element={<Navigate to="/inicio/calendario" replace />} />
          <Route path="/onboarding" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="asignaciones" element={<Asignaciones />} />
            <Route path="asignaciones/:id" element={<DetalleAsignacion />} />
            <Route path="plantillas" element={<Plantillas />} />
            <Route path="conocimiento" element={<Conocimiento />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="mi-onboarding" element={<Navigate to="/mi-espacio/mi-onboarding" replace />} />
            <Route path="acompanados" element={<Navigate to="/mi-espacio/acompanados" replace />} />
          </Route>
          {/* La estructura de la empresa dejó de colgar de "personas": es dato maestro del que
              ya dependen otros módulos. El organigrama se mudó aquí y su ruta vieja redirige,
              porque hay enlaces y marcadores apuntando a ella. */}
          <Route path="/organizacion" element={<Layout />}>
            <Route index element={<Navigate to="/organizacion/datos" replace />} />
            <Route path="datos" element={<DatosEmpresa />} />
            <Route path="sucursales" element={<Sucursales />} />
            {/* Crear y editar una sede tienen dirección propia: se enlaza, se marca y la
                flecha de atrás del navegador vuelve a la lista.

                LA DE CREAR AVISA POR PROP Y NO POR LA URL: es una ruta SIN `:id`, así que dentro
                del componente `useParams()` no trae nada y preguntarle a la dirección si dice
                "nueva" daba siempre que no. */}
            <Route path="sucursales/nueva" element={<SucursalDetalle nueva />} />
            <Route path="sucursales/:id" element={<SucursalDetalle />} />
            {/* YA NO SON UN ANEXO: estas dos pantallas ocupan en el menú el sitio de Sucursales
                y de Áreas, que salieron de él. Las rutas viejas siguen montadas —se llegan
                escribiendo la dirección— para poder comparar mientras dure la prueba, y los
                datos siguen separados: el árbol vive en su propia llave de localStorage. */}
            {/* LA RUTA VIEJA NO SE BORRA, REDIRIGE. «Estructura de negocio» era un eje con su
                pantalla y ahora es una pestaña de Estructura organizacional; un enlace guardado o un
                marcador tienen que seguir llegando a donde se mudó la lista, no a un 404. */}
            <Route path="negocio" element={<Navigate to="/organizacion/estructura?ver=negocios" replace />} />
            <Route path="distribucion" element={<Estructura eje={EJES.fisica} />} />
            <Route path="estructura" element={<Estructura eje={EJES.organizacional} />} />
            {/* LA FICHA DE UN NODO NO CUELGA DE NINGÚN EJE. Vivía en «estructura/:id», que es la
                ruta de la Estructura organizacional, así que crear una REGIONAL —que es del otro
                eje— marcaba en el menú la entrada equivocada. El nodo es de su tipo, no de la
                pantalla desde la que se llegó. */}
            <Route path="nodo/nuevo" element={<NodoDetalle nuevo />} />
            <Route path="nodo/:id" element={<NodoDetalle />} />
            <Route path="mandos" element={<Mandos />} />
            <Route path="configuracion" element={<ConfiguracionOrg />} />
            <Route path="areas" element={<Areas />} />
            <Route path="cargos" element={<Cargos />} />
            <Route path="puestos" element={<Puestos />} />
            <Route path="organigrama" element={<Organigrama />} />
          </Route>
          {/* COMUNICACIÓN: solo lo que RR.HH. administra. Los chats de cada uno viven en Mi espacio
              (también los de quien es de RR.HH., que además es colaborador); la ruta vieja redirige. */}
          <Route path="/comunicacion" element={<Layout />}>
            <Route index element={<Navigate to="/comunicacion/anuncios" replace />} />
            <Route path="chats" element={<Navigate to="/mi-espacio/chats" replace />} />
            <Route path="canales" element={<CanalesGrupos />} />
            <Route path="anuncios" element={<Anuncios />} />
            <Route path="reconocimientos" element={<Reconocimientos />} />
            <Route path="eventos" element={<Eventos />} />
            <Route path="programados" element={<MensajesProgramados />} />
          </Route>
          <Route path="/personas" element={<Layout />}>
            <Route path="colaboradores" element={<Colaboradores />} />
            {/* DAR DE ALTA TIENE DIRECCIÓN PROPIA, y el paso viaja en la consulta:
                `?paso=contrato` se enlaza, se marca y la flecha de atrás retrocede de paso en
                paso. Va ANTES que cualquier `:id` que llegue después, para que "nuevo" no se lea
                como el identificador de un colaborador que no existe. */}
            <Route path="colaboradores/nuevo" element={<ColaboradorNuevo />} />
            <Route path="clientes-externos" element={<ClientesExternos />} />
            <Route path="configuracion/ficha" element={<ConfiguracionFicha />} />
            <Route path="organigrama" element={<Navigate to="/organizacion/organigrama" replace />} />
          </Route>
          {/* DOCUMENTACIÓN (PRD v1.0), EN /documentos: /documentacion ya lo ocupa documentacion.html,
              la documentación de la maqueta, y el servidor de desarrollo la sirve primero. Las rutas siguen el menú por tarea de 11.2; el expediente
              lleva el id de la persona y no uno propio, porque un expediente ES una persona. */}
          {/* DOCUMENTACIÓN v3: TRES PUERTAS, como BambooHR, Humand y Talana. LEGAJOS guarda lo de cada
              persona —sus carpetas, lo que falta, lo que espera revisión—; ENVÍOS es todo lo que la
              empresa le mandó a su gente y lo que su gente le pidió; CONFIGURACIÓN, las carpetas y las
              plantillas. Lo demás —revisar, un contrato— cuelga de una de las
              tres, para que el menú encienda siempre la puerta por la que se entró. */}
          <Route path="/documentos" element={<Layout />}>
            <Route index element={<Navigate to="/documentos/expedientes" replace />} />
            <Route path="expedientes" element={<DocLegajos />} />
            <Route path="expedientes/carga" element={<Navigate to="/documentos/expedientes" replace />} />
            <Route path="expedientes/reportes" element={<Navigate to="/documentos/expedientes" replace />} />
            <Route path="expedientes/contrato/:id" element={<DocContrato />} />
            <Route path="expedientes/revisar" element={<DocRevisar />} />
            <Route path="expedientes/:id" element={<DocExpediente />} />
            {/* Cada carpeta del legajo es una página: se enlaza y la flecha de atrás vuelve. */}
            <Route path="expedientes/:id/:carpeta" element={<DocExpediente />} />
            <Route path="solicitudes" element={<DocSolicitudes />} />
            <Route path="solicitudes/atender" element={<Navigate to="/documentos/solicitudes" replace />} />
            <Route path="solicitudes/:id" element={<DocAtender />} />
            <Route path="emitidos" element={<DocEnvios />} />
            <Route path="emitidos/nuevo" element={<DocEmitir />} />
            <Route path="emitidos/:id" element={<DocEnvio />} />
            <Route path="envios" element={<EnviosViejo />} />
            <Route path="envios/*" element={<CambiarPrefijo de="/documentos/envios" a="/documentos/emitidos" />} />
            <Route path="configuracion" element={<DocConfiguracion />} />
            <Route path="configuracion/plantillas/:id" element={<DocEditorPlantilla />} />
            {/* LAS DIRECCIONES DE ANTES siguen respondiendo y llevan a donde quedó lo suyo, con lo que
                traían detrás: un enlace guardado a un expediente cae en ese mismo legajo. */}
            <Route path="colaboradores/*" element={<CambiarPrefijo de="/documentos/colaboradores" a="/documentos/expedientes" />} />
            <Route path="legajos/*" element={<CambiarPrefijo de="/documentos/legajos" a="/documentos/expedientes" />} />
            <Route path="contratos/*" element={<CambiarPrefijo de="/documentos/contratos" a="/documentos/expedientes/contrato" />} />
            <Route path="emitir" element={<CambiarPrefijo de="/documentos/emitir" a="/documentos/emitidos/nuevo" />} />
            <Route path="emitidos/lotes/*" element={<CambiarPrefijo de="/documentos/emitidos/lotes" a="/documentos/emitidos" />} />
            <Route path="bandeja" element={<Navigate to="/documentos/solicitudes" replace />} />
            <Route path="por-revisar" element={<Navigate to="/documentos/expedientes/revisar" replace />} />
            <Route path="carga-masiva" element={<Navigate to="/documentos/expedientes" replace />} />
            <Route path="lote" element={<Navigate to="/documentos/expedientes" replace />} />
            <Route path="reportes" element={<Navigate to="/documentos/expedientes" replace />} />
            <Route path="seguimiento" element={<SeguimientoAColaboradores />} />
            <Route path="panel" element={<Navigate to="/documentos/expedientes" replace />} />
            <Route path="configuracion/tipos" element={<Navigate to="/documentos/configuracion" replace />} />
            <Route path="configuracion/modelos/*" element={<CambiarPrefijo de="/documentos/configuracion/modelos" a="/documentos/configuracion/plantillas" />} />
            <Route path="configuracion/modelos" element={<Navigate to="/documentos/configuracion?ver=plantillas" replace />} />
            <Route path="configuracion/avisos" element={<Navigate to="/documentos/configuracion?ver=avisos" replace />} />
            <Route path="configuracion/requisitos" element={<Navigate to="/documentos/expedientes" replace />} />
            <Route path="configuracion/parametros" element={<Navigate to="/documentos/configuracion?ver=avisos" replace />} />
          </Route>
          {/* ASISTENCIA. Marca contra los lugares de Organización —sucursales y centros de trabajo— y
              agrupa por unidad organizacional. «Hoy» abre el módulo porque es lo que se mira todos
              los días; el libro, las incidencias y el cierre son el trabajo de RR.HH. con lo que pasó. */}
          <Route path="/asistencia" element={<Layout />}>
            <Route index element={<AtHoy />} />
            <Route path="registro" element={<AtRegistro />} />
            <Route path="persona/:id" element={<AtPersona />} />
            {/* Incidencias pasó a ser los temas del Libro: Faltas, Retrasos y descansos, Salidas sin marcar,
                Marcaciones rechazadas y Fuera de horario. La dirección vieja lleva a Faltas. */}
            <Route path="registro/:tema" element={<AtLibroTema />} />
            <Route path="incidencias" element={<Navigate to="/asistencia/registro/faltas" replace />} />
            <Route path="solicitudes" element={<AtSolicitudes />} />
            <Route path="horas-extra" element={<Navigate to="/asistencia/solicitudes?ver=horas-extra" replace />} />
            <Route path="cierre" element={<Navigate to="/asistencia" replace />} />
            <Route path="configuracion" element={<AtConfiguracion />} />
          </Route>
          <Route path="/archivos" element={<Layout />}>
            <Route index element={<MisArchivos />} />
            <Route path="onboarding" element={<Conocimiento />} />
            <Route path="personas" element={<RecursosPersonas />} />
            <Route path="comunicacion" element={<RecursosComunicacion />} />
            <Route path="evaluacion" element={<RecursosEvaluacion />} />
          </Route>
          {/* CONFIGURACIÓN DEL SISTEMA. Nace con una sola pantalla —Roles y permisos— y por eso
              la raíz redirige a ella: un módulo con una sola puerta no necesita recibidor. Aquí
              entrarán después las preferencias de la empresa y las integraciones.

              NO SE CONFUNDE con «Organización → Configuración», que decide qué NIVELES usa la
              empresa: eso es la forma del árbol y es dato de la organización. Esto es quién
              puede hacer qué, que es del sistema. */}
          <Route path="/configuracion" element={<Layout />}>
            <Route index element={<Navigate to="/configuracion/roles" replace />} />
            <Route path="roles" element={<RolesPermisos />} />
          </Route>
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </BrowserRouter>
      </AsistenciaProvider>
      </DocumentacionProvider>
      </UnsavedChangesProvider>
      </RutaActivaProvider>
      </ConfigProvider>
      </OnboardingDataProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
