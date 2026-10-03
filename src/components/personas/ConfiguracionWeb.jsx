import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import {
  ChevronRight, ShieldHalf, Fingerprint, User, Lock, Settings, Bell, Palette,
  Building2, Brush, AlertCircle, Trash2,
} from 'lucide-react'

/* La misma Configuración del teléfono, con las filas de la web. Sólo «Editar perfil de usuario»
   y «Interfaz» hacen algo; los interruptores se mueven pero no guardan nada todavía. */

function Interruptor({ encendido, onCambiar, etiqueta }) {
  return (
    <button type="button" role="switch" aria-checked={encendido} aria-label={etiqueta}
      className={`mf-switch${encendido ? ' on' : ''}`} onClick={onCambiar}>
      <span />
    </button>
  )
}

function Fila({ icon: I, titulo, texto, derecha, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} className="mf-fila" onClick={onClick}
      style={onClick ? undefined : { cursor: 'default' }}>
      <span className="mf-fila-ico"><I size={18} /></span>
      <span className="mf-fila-txt">
        <strong>{titulo}</strong>
        <span>{texto}</span>
      </span>
      {derecha ?? <ChevronRight size={18} className="mf-fila-flecha" />}
    </Tag>
  )
}

function Grupo({ icon: I, titulo, children }) {
  return (
    <section>
      <h3 className="mf-grupo-tit mf-config-tit">
        <I size={14} /> {titulo}
      </h3>
      <div className="mf-filas">{children}</div>
    </section>
  )
}

export default function ConfiguracionWeb({ onPerfilUsuario }) {
  const [biometria, setBiometria] = useState(false)
  const [avisos, setAvisos] = useState(true)
  const { theme, toggleTheme } = useTheme()
  return (
    <div className="mf-cuerpo">
      <Grupo icon={ShieldHalf} titulo="Gestión de cuenta y seguridad">
        <Fila icon={Fingerprint} titulo="Seguridad biométrica" texto="Usa tu huella o Face ID para iniciar sesión"
          derecha={<Interruptor encendido={biometria} onCambiar={() => setBiometria(v => !v)} etiqueta="Seguridad biométrica" />} />
        <Fila icon={User} titulo="Editar perfil de usuario" texto="Tu información personal y tus documentos" onClick={onPerfilUsuario} />
        <Fila icon={Lock} titulo="Cambiar contraseña" texto="Actualiza tu contraseña de acceso" />
      </Grupo>

      <Grupo icon={Settings} titulo="Preferencias del sistema">
        <Fila icon={Bell} titulo="Notificaciones" texto="Recibirás notificaciones de mensajes"
          derecha={<Interruptor encendido={avisos} onCambiar={() => setAvisos(v => !v)} etiqueta="Notificaciones" />} />
        <Fila icon={Palette} titulo="Interfaz" texto={theme === 'dark' ? 'Modo oscuro' : 'Modo claro'} onClick={toggleTheme} />
      </Grupo>

      <Grupo icon={Building2} titulo="Empresa">
        <Fila icon={Brush} titulo="Personalización de la empresa" texto="Fondo del chat, emojis de reacciones y logo" />
      </Grupo>

      <section>
        <h3 className="mf-grupo-tit mf-config-tit" style={{ color: '#ef4444' }}><AlertCircle size={14} /> Zona de peligro</h3>
        <button type="button" className="mf-peligro"><Trash2 size={15} /> Solicitar la eliminación de mi cuenta</button>
      </section>

      <p className="mf-version">Souly HR v1.0.0</p>
    </div>
  )
}
