import { House, CircleUserRound, UserRound, MessageCircleMore, ClipboardCheck, Settings, Rocket, Folder, Building2, FolderCheck, Clock } from 'lucide-react'

/* Los módulos de la aplicación. Viven aparte para que los lean el riel (`Sidebar`) y el menú de
   teléfono (`MenuPanel`) sin que ninguno de los dos tenga que exportar otra cosa que componentes. */

// El buddy ve exactamente lo mismo que un colaborador: acompañar no otorga permisos.
const TODOS = ['admin', 'manager', 'auxiliar', 'colaborador', 'buddy']

/* El riel separa lo administrativo de lo personal. "Mi espacio personal" es lo único que ve
   todo el mundo: adentro está el día, el calendario y el onboarding propios.

   Inicio y Onboarding quedaron solo para quien administra. Antes los veía también el
   colaborador, pero al entrar rebotaba a su pantalla personal: eran dos puertas del riel que
   llevaban al mismo lugar y ninguna a lo que anunciaban. */
export const allNavItems = [
  { icon: House, label: 'Inicio', path: '/inicio', roles: ['admin', 'manager', 'auxiliar'] },
  { icon: CircleUserRound, label: 'Mi espacio personal', path: '/mi-espacio', roles: TODOS },
  /* LA ESTRUCTURA VA ANTES QUE LA GENTE, y el orden no es estético: primero se define el área y
     se abre la plaza, y recién después se contrata contra ella. Salió de "Gestión de personas"
     —donde era la mitad de un módulo que decía llamarse de otra cosa— porque no es dato de
     personas sino dato maestro de la empresa: Onboarding ya elige la ruta por área y cargo, y
     Evaluación va a sacar de aquí quién evalúa a quién. Un dato del que dependen tres módulos no
     puede vivir dentro del cajón de ajustes de uno. */
  { icon: Building2, label: 'Organización', path: '/organizacion', roles: ['admin', 'manager'] },
  { icon: UserRound, label: 'Gestión de personas', path: '/personas/colaboradores', roles: ['admin', 'manager'] },
  /* DOCUMENTACIÓN VA JUSTO DESPUÉS DE LA GENTE, porque su unidad es siempre una persona: el
     expediente cuelga del colaborador (PRD 3.2) y lee de su ficha. Módulo propio y no una
     pestaña de la ficha porque tiene su propio trabajo diario —la bandeja, emitir, el panel—
     que no empieza eligiendo a nadie. */
  { icon: FolderCheck, label: 'Documentación', path: '/documentos', roles: ['admin', 'manager'] },
  /* ASISTENCIA VA DESPUÉS DE DOCUMENTACIÓN: también su unidad es la persona, y lee de Organización
     dónde marca cada una (su sucursal o su centro de trabajo) y a qué unidad pertenece. Lo del
     colaborador —marcar, su mes— entra por Mi espacio personal. */
  { icon: Clock, label: 'Asistencia', path: '/asistencia', roles: ['admin', 'manager'] },
  { icon: Rocket, label: 'Onboarding', path: '/onboarding', roles: ['admin', 'manager', 'auxiliar'] },
  /* COMUNICACIÓN Y EVALUACIÓN SON MÓDULOS DE ADMINISTRACIÓN, no del colaborador: aquí se
     redactan los anuncios y se arman las campañas de evaluación, no se leen. Lo que al
     colaborador le toca de esos dos módulos —sus chats, sus evaluaciones por responder— entra
     por Mi espacio personal, igual que su onboarding.

     Así el colaborador y el buddy ven UNA sola entrada en el riel. Antes veían tres, y las dos
     de abajo no llevaban a ninguna parte. */
  { icon: MessageCircleMore, label: 'Comunicación', path: '/comunicacion', roles: ['admin', 'manager'] },
  { icon: ClipboardCheck, label: 'Evaluación', path: null, roles: ['admin', 'manager'] },
  { icon: Folder, label: 'Mis archivos', path: '/archivos', roles: ['admin'] },
  /* CONFIGURACIÓN VA LA ÚLTIMA porque no es un módulo de trabajo: se entra a decidir cómo se
     comporta el sistema y se sale. Solo Recursos Humanos: quién puede hacer qué no lo decide
     quien lo padece. */
  { icon: Settings, label: 'Configuración', path: '/configuracion', roles: ['admin'] },
]
