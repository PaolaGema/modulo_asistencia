import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import {
  ChevronLeft, ChevronRight, ShieldHalf, Fingerprint, User, Lock, Settings, Bell, Palette,
  Building2, Brush, AlertCircle, Trash2,
} from 'lucide-react'

/* CONFIGURACIÓN DEL TELÉFONO, como está hoy en la app de Souly: cuenta y seguridad,
   preferencias del sistema, empresa y la zona de peligro. Se abre desde el botón
   «Configuración» del perfil. Los interruptores funcionan; el resto de las filas todavía no
   tienen pantalla, salvo «Perfil de usuario», donde el colaborador edita lo que mantiene al día de
   su ficha: contacto, contactos de emergencia y preferencias. Mi ficha, en cambio, sólo se lee. */

const VERDE = '#00E091'

function Interruptor({ encendido, onCambiar, etiqueta }) {
  return (
    <button role="switch" aria-checked={encendido} aria-label={etiqueta} onClick={onCambiar} style={{
      width: 30, height: 17, borderRadius: 99, flexShrink: 0, cursor: 'pointer', padding: 0,
      border: encendido ? 'none' : '1.5px solid var(--text-heading)', background: encendido ? VERDE : '#9ca3af',
      position: 'relative', transition: 'background .2s',
    }}>
      <span style={{
        position: 'absolute', top: '50%', width: 11, height: 11, borderRadius: '50%',
        background: encendido ? '#0C2D40' : '#000', transform: 'translateY(-50%)',
        left: encendido ? 16 : 2.5, transition: 'left .2s',
      }} />
    </button>
  )
}

function Fila({ icon: I, titulo, texto, derecha, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '10px 10px',
      border: 'none', background: 'none',
      fontFamily: 'inherit', textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
    }}>
      <span style={{
        width: 29, height: 29, borderRadius: '50%', border: `1.5px solid ${VERDE}`, color: '#10b981',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}><I size={12} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 9, fontWeight: 500, color: 'var(--text-heading)', lineHeight: 1.25 }}>{titulo}</span>
        <span style={{ display: 'block', fontSize: 7, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{texto}</span>
      </span>
      {derecha ?? <ChevronRight size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
    </Tag>
  )
}

function Grupo({ icon: I, titulo, color = 'var(--text-muted)', children }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 8.5, fontWeight: 600, color, margin: '0 2px 6px' }}>
        <I size={11} /> {titulo}
      </div>
      {children && (
        <div style={{ background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--border-soft)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function ConfiguracionPhone({ onVolver, onPerfilUsuario }) {
  const [biometria, setBiometria] = useState(false)
  const [avisos, setAvisos] = useState(true)
  // «Interfaz» cambia el tema de verdad: es el mismo interruptor que el de la web.
  const { theme, toggleTheme } = useTheme()
  return (
    <div style={{ padding: '2px 2px 6px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 26 }}>
        <button onClick={onVolver} aria-label="Volver a Mi perfil" style={{
          position: 'absolute', left: -4, width: 26, height: 26, border: 'none', background: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-heading)',
        }}><ChevronLeft size={15} /></button>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)' }}>Configuración</span>
      </div>

      <Grupo icon={ShieldHalf} titulo="Gestión de cuenta y seguridad">
        <Fila icon={Fingerprint} titulo="Seguridad biométrica" texto="Usa tu huella o Face ID para iniciar sesión"
          derecha={<Interruptor encendido={biometria} onCambiar={() => setBiometria(v => !v)} etiqueta="Seguridad biométrica" />} />
        <Fila icon={User} titulo="Perfil de usuario" texto="Edita tu información personal" onClick={onPerfilUsuario} />
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

      <Grupo icon={AlertCircle} titulo="Zona de peligro" color="#ef4444" />
      <button style={{
        width: '100%', height: 30, borderRadius: 11, border: 'none', background: '#ef4444', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit',
        fontSize: 8.5, fontWeight: 700, cursor: 'pointer',
      }}><Trash2 size={10} /> Solicitar la eliminación de mi cuenta</button>

      <div style={{ textAlign: 'center', fontSize: 7, color: 'var(--text-muted)', marginTop: 12 }}>Souly HR v1.0.0</div>
    </div>
  )
}
