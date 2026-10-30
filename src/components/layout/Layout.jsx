import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import ModuleNav from './ModuleNav'
import MenuPanel from './MenuPanel'
import MiOnboarding from '../../pages/colaborador/MiOnboarding'
import { useUser } from '../../context/UserContext'
import { useUnsavedChanges } from '../../context/UnsavedChangesContext'
import { Home, MessageCircle, User, LayoutGrid, Route, Info } from 'lucide-react'
import EncabezadoPropuesta from './EncabezadoPropuesta'
import ZonaHRPhone from './ZonaHRPhone'
import OrganigramaPhone from './OrganigramaPhone'
import SeguimientoPhone from './SeguimientoPhone'
import AcompanadosPhone from './AcompanadosPhone'
import OnboardingHubPhone from './OnboardingHubPhone'
import PerfilPhone from './PerfilPhone'
import MisDocumentosPhone, { MisSolicitudesPhone } from './MisDocumentosPhone'
import Marcador from '../asistencia/Marcador'
import InicioPhone from './InicioPhone'
import SolicitarVacacionPhone from './VacacionPhone'
import CalendarioPhone from './CalendarioPhone'
import AvisoPhone, { useAvisosMarca } from './AvisoPhone'
import BarraVolver from './BarraVolver'
import RedDeSeguridad from './RedDeSeguridad'
/* Abrir crece desde lo tocado, volver se encoge a su lugar, las pestañas se funden (transicionPhone). */
import { abrirCreciendo, volverEncogiendo, cambiarPestana } from '../../utils/transicionPhone'

/* Mis solicitudes lleva el gris azulado claro de su maqueta (opción C), con la franja de arriba igual:
   así las tarjetas blancas se despegan del fondo. */
const FONDO_SOLICITUDES = 'var(--in-fondo)'

// Destinos que cuelgan de la pestaña Onboarding.
const SUB_ONBOARDING = ['mi-onboarding', 'seguimiento', 'acompanados']
/* Las pantallas con el fondo del Inicio, franja de arriba incluida. */
const CON_FONDO_INICIO = ['inicio', 'vacacion', 'solicitudes', 'asistencia', 'hr', 'perfil']
/* Onboarding también lleva el fondo del Inicio (auditoría heurística: su franja navy lo hacía ver como
   otra app), pero siempre en claro con `papel-claro`: sus tareas todavía tienen colores fijos y en
   oscuro quedarían letras navy sobre navy. */
const ONBOARDING = ['onboarding', ...SUB_ONBOARDING]
const FONDO_ONBOARDING = '#F2F5FC'
/* Mis documentos también va en claro con el fondo del Inicio: sus pantallas de adentro todavía tienen
   colores fijos (mismo criterio que Onboarding). */
const SIEMPRE_CLARO = [...ONBOARDING, 'documentos']

export default function Layout() {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const { exitConfirmOpen, confirmDiscard, confirmSave, cancelExit, textos, guardNavigate } = useUnsavedChanges()

  const isMobile = currentUser.mobile === true

  /* El menú de teléfono se cierra solo al llegar a otra pantalla: ya cumplió. Por eso se guarda
     la ruta en la que se abrió y no un sí/no: al cambiar la ruta deja de coincidir y queda cerrado
     sin un efecto que lo apague. */
  const [menuEn, setMenuEn] = useState(null)
  const menuMovil = menuEn === location.pathname
  const setMenuMovil = abrir => setMenuEn(abrir ? location.pathname : null)
  const esLider = currentUser.role === 'manager'
  const esBuddy = currentUser.role === 'buddy'

  /* La pestaña "Onboarding" es un atajo, no un lugar: existe solo mientras la persona
     tiene una incorporación en curso, para que pueda ir a sus tareas de un toque. Quien ya
     se graduó — o nunca pasó por el módulo, como un líder de siempre — entra por Zona HR.
     Por eso la condición mira el dato del usuario y no su rol. */
  const enOnboarding = !currentUser.onbNA && !currentUser.onbGraduado

  /* El buddy tampoco la tiene: acompañar no es una ruta propia en curso, así que entra por
     Zona HR como cualquier otro módulo. La regla de la pestaña sigue siendo una sola —
     tienes incorporación en curso o no — y no se le abre una excepción por rol. */

  /* El hub aparece cuando hay más de un destino adentro. El buddy graduado igual lo ve: su
     ruta terminada sigue siendo consultable y la tarjeta lo dice. */
  const conHub = esLider || esBuddy

  // Quien está cursando entra por su ruta; el buddy graduado, por Inicio: acompañar es parte
  // de su día, no lo único que hace.
  const tabInicial = enOnboarding ? 'onboarding' : 'inicio'
  const [mobileTab, setMobileTab] = useState(tabInicial)

  /* EL TELÉFONO CRECE CON LA VENTANA. Dibujado a 280×560 se leía chico en un monitor: se
     agranda entero, en proporción, hasta ocupar el alto disponible (la etiqueta y el selector
     van en las esquinas y no le estorban), sin pasar de 2,2 veces ni bajar del tamaño original. */
  const zoomDelTelefono = () => Math.min(2.2, Math.max(1, (window.innerHeight - 24) / 570))
  const [zoomCel, setZoomCel] = useState(zoomDelTelefono)
  useEffect(() => {
    const alCambiar = () => setZoomCel(zoomDelTelefono())
    window.addEventListener('resize', alCambiar)
    return () => window.removeEventListener('resize', alCambiar)
  }, [])

  /* Un módulo abierto desde Zona HR ocupa la pantalla completa: el lanzador te saca del
     árbol de pestañas, así que dejar la barra abajo sugiere que sigues dentro de ella.
     Y la pestaña "Onboarding" es transitoria — cuando la persona se gradúa desaparece y
     Zona HR queda como única puerta, así que ese camino tiene que verse bien sin barra. */
  const [origenHR, setOrigenHR] = useState(false)
  /* `con`: pantallas que el módulo abre ya apiladas (el buscador de Zona HR lleva directo a un pedido o a una carpeta). */
  const [abrirCon, setAbrirCon] = useState(null)
  const abrirDesdeHR = (key, con = null) => abrirCreciendo(() => { setAbrirCon(con); setDesdeInicio(false); setDesdePerfil(false); setOrigenHR(true); setMobileTab(key) })
  const volverAHR = () => volverEncogiendo(() => { setOrigenHR(false); setMobileTab('hr') })
  /* Lo que se abre desde el inicio (marcar, pedir vacaciones) vuelve al inicio, no a Zona HR.
     `marcarCon` es el paso que el botón del carrusel ya eligió: el marcador abre directo en él. */
  const [desdeInicio, setDesdeInicio] = useState(false)
  const [marcarCon, setMarcarCon] = useState(null)
  const abrirDesdeInicio = (key, paso = null) => abrirCreciendo(() => { setAbrirCon(null); setMarcarCon(paso); setDesdeInicio(true); setOrigenHR(true); setMobileTab(key) })
  const volverAInicio = () => volverEncogiendo(() => { setDesdeInicio(false); setOrigenHR(false); setMobileTab('inicio') })
  /* Los avisos de marcar bajan como notificación del teléfono; tocarlos lleva al inicio. */
  const avisos = useAvisosMarca(isMobile)
  const volverDeModulo = desdeInicio ? volverAInicio : volverAHR
  /* El organigrama abierto desde Perfil vuelve a Perfil (antes ese botón no hacía nada). */
  const [desdePerfil, setDesdePerfil] = useState(false)
  const abrirDesdePerfil = key => abrirCreciendo(() => { setDesdePerfil(true); setOrigenHR(true); setMobileTab(key) })
  const volverAPerfil = () => volverEncogiendo(() => { setDesdePerfil(false); setOrigenHR(false); setMobileTab('perfil') })
  const irAPestana = key => guardNavigate(() => cambiarPestana(() => { setOrigenHR(false); setMobileTab(key) }))

  /* El inicio ya no lleva el atajo «Continuar mi Onboarding» (ni el del líder o el buddy): se pidió
     quitarlo. El onboarding sigue en su pestaña de la barra de abajo. */

  // Al cambiar de usuario en el simulador se vuelve a la raíz de la pestaña: si no, un
  // colaborador puede quedar parado en Seguimiento, que no le corresponde.
  useEffect(() => { setOrigenHR(false); setMobileTab(tabInicial) }, [currentUser.id, tabInicial])

  useEffect(() => {
    /* `/personas/organigrama` ya no se excluye: esa ruta hoy solo redirige a
       `/organizacion/organigrama`, así que la excepción no protegía nada. */
    const isPersonas = location.pathname.startsWith('/personas')
    /* Organización entra al rebote como el resto de lo administrativo. Se le escapó al crear el
       módulo: el riel ya no se lo muestra a un colaborador, pero el riel solo esconde —quien
       escriba la URL a mano entra igual, y este guardia es justamente el que lo impide. */
    const isOrganizacion = location.pathname.startsWith('/organizacion')
    const isArchivos = location.pathname.startsWith('/archivos')
    const isComunicacion = location.pathname.startsWith('/comunicacion')
    /* Configuración entra al rebote con el resto de lo administrativo, y con más razón: es
       donde se decide quién puede hacer qué. El riel no se la enseña a nadie más que a RRHH,
       pero el riel solo esconde —quien escriba la dirección a mano entra igual—. */
    const isConfiguracion = location.pathname.startsWith('/configuracion')
    // La ficha de una asignación cuelga de Seguimiento (/onboarding/asignaciones/:id): entra
    // por prefijo, si no un colaborador podría quedarse ahí escribiendo la URL a mano.
    const isAdminRoute = ['/onboarding', '/onboarding/asignaciones', '/onboarding/plantillas', '/onboarding/conocimiento', '/onboarding/configuracion'].includes(location.pathname)
      || location.pathname.startsWith('/onboarding/asignaciones/')

    // El buddy tiene los mismos permisos que un colaborador: acompañar no da acceso a
    // administración. Su única pantalla extra es /mi-espacio/acompanados.
    const sinAccesoAdmin = currentUser.role === 'colaborador' || currentUser.role === 'buddy'

    // Lo suyo vive en Mi espacio personal; los módulos administrativos ni les aparecen en el
    // riel, así que llegar aquí es haber escrito la URL a mano o venir de un enlace viejo.
    if (sinAccesoAdmin && location.pathname.startsWith('/inicio')) {
      navigate('/mi-espacio/mi-dia', { replace: true })
    } else if (sinAccesoAdmin && location.pathname.startsWith('/asistencia')) {
      /* La asistencia de todos es de RR.HH.; la suya la marca y la mira en Mi asistencia. */
      navigate('/mi-espacio/mi-asistencia', { replace: true })
    } else if (sinAccesoAdmin && location.pathname.startsWith('/documentos')) {
      /* Documentación entra al rebote como el resto: son los expedientes de todos. Lo suyo lo
         tiene en Zona HR › Mis documentos, y ahí se lo lleva. */
      navigate('/mi-espacio/zona-hr/documentos', { replace: true })
    } else if (sinAccesoAdmin && (isAdminRoute || isPersonas || isOrganizacion || isArchivos || isComunicacion || isConfiguracion)) {
      navigate('/mi-espacio/mi-onboarding', { replace: true })
    }
  }, [currentUser.id, location.pathname])

  /* EL AVISO DE SALIR SIN GUARDAR va en las dos vistas: en el teléfono también se edita (Configuración ›
     Editar perfil de usuario), y sin dibujarlo ahí el «volver» se quedaba quieto sin decir por qué. */
  const avisoSalida = exitConfirmOpen && (
    <div className="pl-overlay" style={{ zIndex: 200 }} onClick={cancelExit}>
      <div className="pl-modal pl-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="pl-modal-body" style={{ textAlign: 'center', padding: '28px 24px 4px' }}>
          <div className="jb-del-ico" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Info size={24} />
          </div>
          <h2 className="pl-del-title">{textos?.titulo || 'Cambios sin guardar'}</h2>
          <p className="pl-del-desc">
            {textos?.texto || 'Hiciste cambios en esta ruta que todavía no guardaste. ¿Qué quieres hacer?'}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '20px 24px 22px' }}>
          <button
            onClick={confirmSave}
            style={{ width: '100%', padding: '11px 20px', border: 'none', borderRadius: 10, background: '#0C2D40', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            {textos?.guardar || 'Guardar y salir'}
          </button>
          <button
            onClick={confirmDiscard}
            style={{ width: '100%', padding: '10px 20px', border: '1px solid #fecaca', borderRadius: 10, background: '#fff', color: '#ef4444', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            {textos?.descartar || 'Salir sin guardar'}
          </button>
          <button
            onClick={cancelExit}
            style={{ width: '100%', padding: '9px 20px', border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            {textos?.quedarse || 'Seguir editando'}
          </button>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: '#1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Selector de usuario flotante */}
        <div style={{ position: 'absolute', top: 20, right: 24 }}>
          <Header floating />
        </div>

        {/* Etiqueta */}
        <div style={{
          position: 'absolute', top: 24, left: 28,
          color: '#94a3b8', fontSize: 11, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#00E091',
          }} />
          Vista Mobile — Prototipo UX
          <button type="button" onClick={avisos.probar} style={{ marginLeft: 6, padding: '4px 10px', borderRadius: 99, border: '1px solid #334155', background: 'transparent', color: '#cbd5e1', fontFamily: 'inherit', fontSize: 10.5, fontWeight: 600, cursor: 'pointer' }}>
            Probar aviso de marcación
          </button>
        </div>

        {/* Phone frame. Su `id` lo mide la lista del teléfono para abrirse hacia arriba si abajo no cabe (`useMenuPhone`). */}
        <div id="marco-telefono" style={{
          width: 280, height: 560, zoom: zoomCel,
          borderRadius: 36,
          border: '5px solid #334155',
          background: CON_FONDO_INICIO.includes(mobileTab) ? FONDO_SOLICITUDES : SIEMPRE_CLARO.includes(mobileTab) ? FONDO_ONBOARDING : '#fff',
          overflow: 'hidden',
          boxShadow: '0 0 0 2px #1e293b, 0 25px 60px rgba(0,0,0,.4)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          <AvisoPhone aviso={avisos.aviso} onCerrar={avisos.cerrar} onAbrir={() => { avisos.cerrar(); volverAInicio() }} />
          {/* Status bar */}
          <div style={{
            /* Solo la franja de la cámara, como un teléfono de verdad: el nombre «SoulyHR» se quitó porque
               se leía como un encabezado y ocupaba espacio. */
            height: 34, background: CON_FONDO_INICIO.includes(mobileTab) ? FONDO_SOLICITUDES : SIEMPRE_CLARO.includes(mobileTab) ? FONDO_ONBOARDING : '#0C2D40',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: 5, flexShrink: 0,
            position: 'relative',
          }}>
            <div style={{
              width: 90, height: 22, borderRadius: 11,
              background: '#1e293b', position: 'absolute', top: 6,
              left: '50%', transform: 'translateX(-50%)',
            }} />
          </div>

          {/* Content */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '10px 10px 10px',
            /* La ficha del colaborador, el inicio y el formulario de vacación siguen el tema; el resto de las
               pantallas del teléfono todavía tiene sus colores fijos y se queda en claro. */
            background: CON_FONDO_INICIO.includes(mobileTab) ? FONDO_SOLICITUDES : SIEMPRE_CLARO.includes(mobileTab) ? FONDO_ONBOARDING : '#f8fafc',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          className={SIEMPRE_CLARO.includes(mobileTab) ? 'phone-scroll papel-claro' : 'phone-scroll'}
          >
            {mobileTab === 'inicio' ? (
              /* El inicio, estilo suave (propuesta B1): «Hoy es» con tu turno y el botón de marcar. */
              <InicioPhone
                currentUser={currentUser}
                onMarcar={paso => abrirDesdeInicio('asistencia', paso)}
                onVacacion={() => abrirDesdeInicio('vacacion')}
                onSolicitudes={() => abrirDesdeInicio('solicitudes')}
                onCalendario={() => abrirDesdeInicio('calendario')}
                onPerfil={() => irAPestana('perfil')}
              />
            ) : mobileTab === 'vacacion' ? (
              /* «Solicitar vacación» del inicio abre directo el formulario, sin pasar por Mis solicitudes. */
              <SolicitarVacacionPhone onVolver={volverDeModulo} volverA={desdeInicio ? 'Inicio' : 'Zona HR'} listoTexto={desdeInicio ? undefined : 'Volver a Zona HR'} />
            ) : mobileTab === 'hr' ? (
              <ZonaHRPhone currentUser={currentUser} onNavegar={abrirDesdeHR} />
            ) : mobileTab === 'perfil' ? (
              <PerfilPhone key={currentUser.id} currentUser={currentUser} onOrganigrama={() => abrirDesdePerfil('organigrama')} />
            ) : mobileTab === 'organigrama' ? (
              <OrganigramaPhone onSalir={desdePerfil ? volverAPerfil : volverAHR} />
            ) : mobileTab === 'documentos' ? (
              <MisDocumentosPhone currentUser={currentUser} onVolver={volverAHR} inicio={abrirCon} />
            ) : mobileTab === 'solicitudes' ? (
              <MisSolicitudesPhone currentUser={currentUser} onVolver={volverDeModulo} inicio={desdeInicio ? null : abrirCon} />
            ) : mobileTab === 'calendario' ? (
              <CalendarioPhone onVolver={volverDeModulo} />
            ) : mobileTab === 'asistencia' ? (
              <div className="at-cel"><Marcador key={marcarCon || 'marcador'} iniciar={marcarCon} onVolver={volverDeModulo} telefono volverA={desdeInicio ? 'Inicio' : 'Zona HR'} /></div>
            ) : mobileTab === 'seguimiento' ? (
              <SeguimientoPhone currentUser={currentUser} onVolver={() => setMobileTab('onboarding')} />
            ) : mobileTab === 'acompanados' ? (
              <AcompanadosPhone currentUser={currentUser} onVolver={() => setMobileTab('onboarding')} />
            ) : (
              <>
                {/* Abierto desde Zona HR se sale al lanzador; abierto desde la pestaña, al hub. */}
                {mobileTab === 'onboarding' && origenHR && (
                  <BarraVolver texto="Zona HR" onVolver={volverAHR} />
                )}
                {mobileTab === 'mi-onboarding' && (
                  <BarraVolver texto="Onboarding" onVolver={() => setMobileTab('onboarding')} />
                )}
                {mobileTab === 'onboarding' && conHub
                  ? <OnboardingHubPhone currentUser={currentUser} onIr={setMobileTab} />
                  : <MiOnboarding forcePhone />}
              </>
            )}
          </div>

          {/* Bottom nav — estilo SoulyHR. Los módulos abiertos desde Zona HR van a pantalla
              completa: dejar las pestañas ahí sugiere que son hermanas de Inicio y te deja
              sin salida al tocar otra. */}
          <div style={{
            flexShrink: 0,
            padding: '4px 10px 0',
            display: origenHR ? 'none' : 'block',
          }}>
            <div style={{
              background: ['perfil', 'inicio'].includes(mobileTab) ? 'var(--bg-nav)' : '#fff',
              borderRadius: 18,
              boxShadow: '0 -2px 16px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-around',
              padding: '6px 4px',
            }}>
              {[
                { icon: Home, label: 'Inicio', key: 'inicio' },
                ...(enOnboarding ? [{ icon: Route, label: 'Onboarding', key: 'onboarding' }] : []),
                { icon: MessageCircle, label: 'Chat', key: 'chat' },
                { icon: LayoutGrid, label: 'Zona HR', key: 'hr' },
                { icon: User, label: 'Perfil', key: 'perfil' },
              ].map(tab => {
                // Mi Onboarding y Seguimiento viven dentro de la pestaña Onboarding, así que
                // la mantienen encendida mientras estás adentro.
                const active = mobileTab === tab.key
                  || (tab.key === 'onboarding' && SUB_ONBOARDING.includes(mobileTab))
                const navegable = ['inicio', 'onboarding', 'hr', 'perfil'].includes(tab.key)
                return (
                <div key={tab.label}
                  onClick={() => navegable && irAPestana(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 3, cursor: navegable ? 'pointer' : 'default',
                    ...(active ? {
                      background: '#0C2D40', borderRadius: 10,
                      padding: '5px 10px',
                    } : {
                      padding: '5px 6px',
                    }),
                  }}>
                  <tab.icon size={12} strokeWidth={active ? 2.5 : 1.8} style={{ color: active ? '#fff' : '#64748b' }} />
                  {active && (
                    <span style={{ fontSize: 7, fontWeight: 700, color: '#fff' }}>{tab.label}</span>
                  )}
                </div>
                )
              })}
            </div>
          </div>

          {/* Franja de gestos del sistema. Va siempre, con o sin barra de pestañas: es el
              espacio del teléfono, no de la app, y ahí abajo vive la barra de volver/inicio.
              Dibujarla evita que la navegación de SoulyHR se apoye sobre ella. */}
          <div style={{
            flexShrink: 0, height: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 92, height: 3.5, borderRadius: 99, background: '#cbd5e1' }} />
          </div>
        </div>
        {avisoSalida}
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* EN UN TELÉFONO LOS DOS MENÚS SE GUARDAN. El riel (64 px) y el menú del módulo (240 px)
          sumaban 304 px de columna fija: en 390 le dejaban al contenido una tira de 54 px. Por
          debajo de 760 px los dos se esconden y el botón de la barra abre en su lugar un solo
          panel, `MenuPanel`. En escritorio los envoltorios son `display: contents`, como si no
          estuvieran, y el panel no se dibuja. */}
      <div className="app-riel"><Sidebar /></div>
      {menuMovil && (
        <>
          <div className="app-velo" onClick={() => setMenuMovil(false)} aria-hidden="true" />
          <MenuPanel onCerrar={() => setMenuMovil(false)} />
        </>
      )}
      {/* SIN CABECERA. Los 56 px de la barra superior decían tres cosas: el título de la
          pantalla —que ya está dos filas más abajo, y por duplicado hacían que hubiera dos
          <h1> en cada página—, un aviso y quién eres. Las dos últimas se mudaron al riel,
          bajo el logo; la primera sobraba. El `Header` sigue vivo para la vista móvil, que lo
          monta como selector flotante. */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* ARRIBA DEL MENÚ Y NO SOLO DEL CONTENIDO: la barra cruza de lado a lado a partir del
            riel, que es como se dibujaba antes. Metida dentro de la columna del contenido
            arrancaría a 300 px del borde y parecería la cabecera de la página, no de la app. */}
        <EncabezadoPropuesta menuAbierto={menuMovil} onMenu={() => setMenuMovil(!menuMovil)} />
        <div className="flex flex-1 overflow-hidden">
          <div className="app-modulos"><ModuleNav /></div>
          <main className="flex-1 overflow-y-auto" style={{ padding: '1.25rem 1rem', background: 'var(--bg-app)' }}>
            <RedDeSeguridad ruta={location.pathname}><Outlet /></RedDeSeguridad>
          </main>
        </div>
      </div>

      {avisoSalida}
    </div>
  )
}
