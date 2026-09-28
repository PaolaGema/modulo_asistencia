import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'
import { RutaActivaProvider } from './context/RutaActivaContext'
import { ConfigProvider } from './context/ConfigContext'
import { OnboardingDataProvider } from './context/OnboardingDataContext'
import { UnsavedChangesProvider } from './context/UnsavedChangesContext'
import Layout from './components/layout/Layout'
import Home from './pages/inicio/Home'
import MiDia from './pages/inicio/MiDia'
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
import ZonaHR from './pages/colaborador/ZonaHR'
import Perfil from './pages/colaborador/Perfil'
import Colaboradores from './pages/personas/Colaboradores'
import ColaboradorNuevo from './pages/personas/ColaboradorNuevo'
import ClientesExternos from './pages/personas/ClientesExternos'
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
import DocExpedientes from './pages/documentacion/Expedientes'
import DocExpediente from './pages/documentacion/Expediente'
import DocCargaLote from './pages/documentacion/CargaLote'
import DocBandeja from './pages/documentacion/Bandeja'
import DocPanel from './pages/documentacion/Panel'
import DocReportes from './pages/documentacion/Reportes'
import DocEmitir from './pages/documentacion/Emitir'
import DocBiblioteca from './pages/documentacion/Biblioteca'
import DocEditorPlantilla from './pages/documentacion/EditorPlantilla'
import DocContrato from './pages/documentacion/Contrato'
import DocPuestaEnMarcha from './pages/documentacion/PuestaEnMarcha'
import DocTiposSubtipos from './pages/documentacion/TiposSubtipos'
import DocRequisitos from './pages/documentacion/Requisitos'
import DocParametros from './pages/documentacion/Parametros'

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
      <OnboardingDataProvider>
      <ConfigProvider>
      <RutaActivaProvider>
      <UnsavedChangesProvider>
      <DocumentacionProvider>
      <BrowserRouter>
        <Routes>
          {/* Lo personal vive junto y aparte de lo administrativo: Inicio y Onboarding
              quedaron solo para quien administra. Las rutas viejas siguen respondiendo
              —redirigen— porque hay enlaces y marcadores apuntando ahí. */}
          <Route path="/mi-espacio" element={<Layout />}>
            <Route index element={<Navigate to="/mi-espacio/mi-dia" replace />} />
            <Route path="mi-dia" element={<MiDia />} />
            {/* El calendario de la empresa —cumpleaños, aniversarios, evaluaciones, campañas—
                no es «mi calendario»: se mudó a Inicio, que es donde vive lo administrativo y
                desde donde ya se entraba. El personal del colaborador irá dentro de Zona HR. */}
            <Route path="calendario" element={<Navigate to="/inicio/calendario" replace />} />
            <Route path="mi-onboarding" element={<MiOnboarding />} />
            <Route path="acompanados" element={<MisAcompanados />} />
            {/* Las tres pestañas que el colaborador ya tenía en el móvil y no en escritorio.
                Ahora las tres existen aquí con su propia pantalla. */}
            <Route path="chats" element={<Chats />} />
            <Route path="zona-hr" element={<ZonaHR />} />
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
          {/* COMUNICACIÓN. «Mis chats» es la MISMA pantalla que el colaborador tiene en su
              espacio personal, montada en dos rutas: no es «el chat del administrador» y «el
              chat del colaborador», es el mismo buzón visto desde dos puertas. */}
          <Route path="/comunicacion" element={<Layout />}>
            <Route index element={<Navigate to="/comunicacion/chats" replace />} />
            <Route path="chats" element={<Chats />} />
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
            <Route path="organigrama" element={<Navigate to="/organizacion/organigrama" replace />} />
          </Route>
          {/* DOCUMENTACIÓN (PRD v1.0), EN /documentos: /documentacion ya lo ocupa documentacion.html,
              la documentación de la maqueta, y el servidor de desarrollo la sirve primero. Las rutas siguen el menú por tarea de 11.2; el expediente
              lleva el id de la persona y no uno propio, porque un expediente ES una persona. */}
          <Route path="/documentos" element={<Layout />}>
            <Route index element={<Navigate to="/documentos/expedientes" replace />} />
            <Route path="expedientes" element={<DocExpedientes />} />
            <Route path="expedientes/:id" element={<DocExpediente />} />
            <Route path="bandeja" element={<DocBandeja />} />
            <Route path="emitir" element={<DocEmitir />} />
            <Route path="contratos/:id" element={<DocContrato />} />
            <Route path="panel" element={<DocPanel />} />
            <Route path="reportes" element={<DocReportes />} />
            <Route path="lote" element={<DocCargaLote />} />
            <Route path="configuracion" element={<DocPuestaEnMarcha />} />
            <Route path="configuracion/tipos" element={<DocTiposSubtipos />} />
            <Route path="configuracion/requisitos" element={<DocRequisitos />} />
            <Route path="configuracion/modelos" element={<DocBiblioteca />} />
            <Route path="configuracion/modelos/:id" element={<DocEditorPlantilla />} />
            <Route path="configuracion/parametros" element={<DocParametros />} />
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
      </DocumentacionProvider>
      </UnsavedChangesProvider>
      </RutaActivaProvider>
      </ConfigProvider>
      </OnboardingDataProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
