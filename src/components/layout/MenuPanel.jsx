import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronDown, X } from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { allNavItems } from './modulos'
import ModuleNav from './ModuleNav'

/* EL MENÚ DE TELÉFONO, EN UN SOLO PANEL.
   En escritorio la navegación son dos columnas: el riel de íconos y el menú del módulo. Metidas
   las dos en un cajón de teléfono sumaban 304 px, y el panel del módulo casi siempre quedaba con
   una o dos entradas y todo el resto en blanco. Acá es una sola lista: los módulos con su nombre
   —en el riel son solo íconos, y en un teléfono no hay ratón para leer el título— y, debajo del
   que se abre, su propio menú.

   ABRIR UN MÓDULO NO NAVEGA: despliega. Así se puede mirar qué tiene Organización sin salir de la
   ficha a medias. Navegar es tocar una de sus entradas, y al cambiar de ruta el panel se cierra
   solo (lo decide `Layout`).

   Arranca desplegado el módulo en el que se está, que es casi siempre donde se quiere ir. */
export default function MenuPanel({ onCerrar }) {
  const { currentUser } = useUser()
  const { empresa } = useOnboardingData()
  const location = useLocation()

  // Evaluación todavía no tiene ruta: en el riel se ve y no lleva a nada; acá no se muestra.
  const modulos = allNavItems.filter(m => m.path && m.roles.includes(currentUser.role))
  // «Gestión de personas» vive en /personas/colaboradores pero es dueño de todo /personas.
  const raiz = path => '/' + path.split('/')[1]
  const actual = modulos.find(m => location.pathname.startsWith(raiz(m.path)))
  const [abierto, setAbierto] = useState(actual?.path ?? null)

  return (
    <nav className="app-panel" aria-label="Menú principal">
      <div className="app-panel-cab">
        <span className="app-panel-empresa">{empresa?.nombre || 'Sin nombre'}</span>
        <button type="button" className="app-panel-cerrar" onClick={onCerrar} aria-label="Cerrar menú">
          <X size={20} />
        </button>
      </div>

      <div className="app-panel-lista">
        {modulos.map(m => {
          const Icono = m.icon
          const desplegado = abierto === m.path
          const aqui = actual?.path === m.path
          return (
            <div key={m.path} className={`app-panel-mod${desplegado ? ' abierto' : ''}${aqui ? ' aqui' : ''}`}>
              <button
                type="button"
                className="app-panel-fila"
                aria-expanded={desplegado}
                onClick={() => setAbierto(desplegado ? null : m.path)}
              >
                <Icono size={19} strokeWidth={aqui ? 2.2 : 1.8} />
                <span>{m.label}</span>
                <ChevronDown size={16} className="app-panel-chev" aria-hidden="true" />
              </button>
              {desplegado && <ModuleNav enPanel ruta={m.path} />}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
