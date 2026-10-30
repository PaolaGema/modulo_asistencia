import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { ChevronRight, Fingerprint, Lock, Bell, Moon, Brush, LogOut, Trash2 } from 'lucide-react'
import BarraVolver from './BarraVolver'
import { useFotoPerfil } from '../../hooks/useFotoPerfil'

/* CONFIGURACIÓN DEL TELÉFONO: cuenta, seguridad, preferencias y empresa. Se abre desde el botón
   «Configuración» del perfil. Los interruptores funcionan; el resto de las filas todavía no
   tienen pantalla, salvo «Editar perfil de usuario», donde el colaborador edita su Información
   Personal con sus documentos, y sus preferencias. Mi ficha, en cambio, sólo se lee.

   Con la línea del Inicio (auditoría heurística, opción B «su cuenta arriba»): como en los ajustes del
   teléfono, arriba quién es —una tarjeta con la foto, el nombre y el correo, con los círculos menta de
   Perfil— que abre «Editar perfil de usuario»; abajo los grupos con los rótulos del Inicio. De usted.
   «Interfaz» era una fila con flecha que no abría nada: ahora es «Modo oscuro» con su interruptor. Lo
   rojo (cerrar sesión, eliminar la cuenta) va al final como filas con aro y título en rojo suave, no como
   un botón rojo lleno. */

/* Apagado gris claro con bolita blanca, encendido menta: el de antes, apagado, tenía borde navy y bolita
   negra y parecía roto. */
function Interruptor({ encendido, onCambiar, etiqueta }) {
  return (
    <button role="switch" aria-checked={encendido} aria-label={etiqueta} onClick={onCambiar} style={{
      width: 30, height: 17, borderRadius: 99, flexShrink: 0, cursor: 'pointer', padding: 0, border: 'none',
      background: encendido ? '#00E091' : 'var(--in-boton-off)', position: 'relative', transition: 'background .2s',
    }}>
      <span style={{
        position: 'absolute', top: '50%', width: 13, height: 13, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 3px rgba(12,45,64,.3)', transform: 'translateY(-50%)',
        left: encendido ? 15 : 2, transition: 'left .2s',
      }} />
    </button>
  )
}

/* `rojo`: las filas de salir y de eliminar la cuenta llevan el aro y el título en rojo suave (opción R1). */
function Fila({ icon: I, titulo, texto, derecha, onClick, rojo = false }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 10px',
      border: 'none', background: 'none', color: rojo ? 'var(--in-rojo)' : 'var(--in-texto)',
      fontFamily: 'inherit', textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
    }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', boxShadow: `inset 0 0 0 1.4px ${rojo ? 'var(--in-rojo-borde)' : '#00E091'}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <I size={12} strokeWidth={1.8} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 9, fontWeight: 500, lineHeight: 1.25 }}>{titulo}</span>
        <span style={{ display: 'block', fontSize: 7.2, color: 'var(--in-mute)', marginTop: 1, lineHeight: 1.4 }}>{texto}</span>
      </span>
      {derecha ?? <ChevronRight size={11} style={{ color: 'var(--in-suave)', flexShrink: 0 }} />}
    </Tag>
  )
}

/* El rótulo de sección del Inicio y una tarjeta blanca con sombra; las filas se separan con una línea. */
function Grupo({ titulo, children }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)', marginBottom: 7 }}>{titulo}</div>
      <div style={{ background: 'var(--in-carta)', borderRadius: 15, boxShadow: 'var(--in-sombra)', overflow: 'hidden' }}>
        {[children].flat().filter(Boolean).map((hijo, i) => (
          <div key={i} style={{ borderTop: i ? '1px solid var(--in-linea)' : 'none' }}>{hijo}</div>
        ))}
      </div>
    </div>
  )
}

/* Quién es, arriba: la foto con aro menta, el nombre y el correo, con los círculos de la tarjeta de Perfil. */
function TarjetaCuenta({ currentUser, form, onAbrir }) {
  const [sinFoto, setSinFoto] = useState(false)
  const foto = useFotoPerfil(currentUser.name, form?.['1.9'], 80)
  const correo = form?.['3.22'] || form?.['1.39']
  return (
    <button type="button" onClick={onAbrir} disabled={!onAbrir} style={{
      position: 'relative', overflow: 'hidden', width: '100%', display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--in-carta)', borderRadius: 18, boxShadow: 'var(--in-sombra)', border: 'none', padding: '11px 11px',
      fontFamily: 'inherit', textAlign: 'left', color: 'var(--in-texto)', cursor: onAbrir ? 'pointer' : 'default',
    }}>
      <span aria-hidden="true" style={{ position: 'absolute', width: 96, height: 96, top: -48, right: -30, borderRadius: '50%', background: 'rgba(0,224,145,.10)' }} />
      <span style={{ position: 'relative', width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 2px var(--in-carta), 0 0 0 3.4px #00E091' }}>
        {sinFoto ? (
          <span style={{ width: '100%', height: '100%', background: currentUser.color, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{currentUser.initials}</span>
        ) : (
          <img src={foto} alt={currentUser.name} onError={() => setSinFoto(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
      </span>
      <span style={{ position: 'relative', flex: 1, minWidth: 0, display: 'grid' }}>
        <b style={{ fontSize: 10, fontWeight: 600 }}>{currentUser.name}</b>
        {correo && <small style={{ fontSize: 7.4, color: 'var(--in-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{correo}</small>}
        {onAbrir && <small style={{ fontSize: 7.4, fontWeight: 600, color: 'var(--in-acento-txt)', marginTop: 2 }}>Editar perfil de usuario</small>}
      </span>
      {onAbrir && <ChevronRight size={11} style={{ position: 'relative', color: 'var(--in-suave)', flexShrink: 0 }} />}
    </button>
  )
}


export default function ConfiguracionPhone({ onVolver, onPerfilUsuario, currentUser, form }) {
  const [biometria, setBiometria] = useState(false)
  const [avisos, setAvisos] = useState(true)
  // «Modo oscuro» cambia el tema de verdad: es el mismo interruptor que el de la web.
  const { theme, toggleTheme } = useTheme()
  return (
    <div style={{ padding: '2px 2px 6px', fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
      <BarraVolver conTema texto="Mi perfil" onVolver={onVolver} />
      <div style={{ display: 'grid', marginBottom: 10 }}>
        <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>Configuración</b>
        <small style={{ fontSize: 8.2, color: 'var(--in-mute)' }}>Su cuenta y cómo se ve la app</small>
      </div>

      {currentUser && <TarjetaCuenta currentUser={currentUser} form={form} onAbrir={onPerfilUsuario} />}

      <Grupo titulo="Seguridad">
        <Fila icon={Fingerprint} titulo="Seguridad biométrica" texto="Use su huella o Face ID para entrar"
          derecha={<Interruptor encendido={biometria} onCambiar={() => setBiometria(v => !v)} etiqueta="Seguridad biométrica" />} />
        <Fila icon={Lock} titulo="Cambiar contraseña" texto="Actualice su contraseña de acceso" />
      </Grupo>

      <Grupo titulo="Preferencias">
        <Fila icon={Bell} titulo="Notificaciones" texto="Avisos de mensajes y solicitudes"
          derecha={<Interruptor encendido={avisos} onCambiar={() => setAvisos(v => !v)} etiqueta="Notificaciones" />} />
        <Fila icon={Moon} titulo="Modo oscuro" texto="Cambia los colores de toda la app"
          derecha={<Interruptor encendido={theme === 'dark'} onCambiar={toggleTheme} etiqueta="Modo oscuro" />} />
      </Grupo>

      <Grupo titulo="Empresa">
        <Fila icon={Brush} titulo="Personalización de la empresa" texto="Fondo del chat, emojis de reacciones y logo" />
      </Grupo>

      {/* Salir y eliminar la cuenta, al final, como dos filas más con aro y título en rojo suave (opción
          R1 elegida). Como el prototipo no tiene sesión ni cuentas que borrar, todavía no hacen nada,
          igual que las filas sin pantalla. */}
      <Grupo titulo="Cuenta">
        <Fila rojo icon={LogOut} titulo="Cerrar sesión" texto="Salir de SoulyHR en este teléfono" derecha={false} />
        <Fila rojo icon={Trash2} titulo="Eliminar mi cuenta" texto="Envía la solicitud para borrar su cuenta" />
      </Grupo>

      <div style={{ textAlign: 'center', fontSize: 7.4, color: 'var(--in-mute)', marginTop: 12 }}>Souly HR v1.0.0</div>
    </div>
  )
}
