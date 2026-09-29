import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import RedDeSeguridad from './components/layout/RedDeSeguridad'

/* LA RED TAMBIÉN POR FUERA DE TODO: Layout ya pone una alrededor de cada página, pero un error en
   el marco —el menú, los proveedores de datos— desmontaba la aplicación entera y dejaba la
   pantalla en blanco sin decir nada. Ésta atrapa lo que se escape de la otra. */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RedDeSeguridad ruta="app">
      <App />
    </RedDeSeguridad>
  </StrictMode>,
)
