import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../../context/ThemeContext'
import { ChevronRight, Fingerprint, Lock, Bell, Moon, Building2, LogOut, Trash2, MapPin, AlertTriangle } from 'lucide-react'
import BarraVolver from './BarraVolver'
import { useFotoPerfil } from '../../hooks/useFotoPerfil'
import { useOnboardingData } from '../../context/OnboardingDataContext'

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

/* MI EMPRESA, SOLO PARA MIRAR: el colaborador ve el nombre, los datos de contacto y las sucursales, pero
   no cambia nada —eso lo hace RR.HH. en Organización—. Antes era «Personalización de la empresa» (fondo
   del chat, emojis, logo), que no es cosa del colaborador. */
function MiEmpresa({ onVolver }) {
  const { empresa, sucursales } = useOnboardingData()
  const activas = (sucursales || []).filter(x => x.estado !== 'cerrada')
  const nombre = empresa?.razonSocial || empresa?.nombre || 'La empresa'
  const sigla = (nombre.split(' ')[0].match(/[A-ZÁÉÍÓÚÑ]/g) || ['S']).slice(0, 2).join('')
  const datos = [['Razón social', empresa?.razonSocial], ['NIT', empresa?.nit], ['Rubro', empresa?.rubro], ['Dirección', empresa?.direccionLegal], ['Teléfono', empresa?.telefono], ['Correo', empresa?.correo], ['Sitio web', empresa?.web]].filter(([, v]) => v)
  return (
    <div style={{ padding: '2px 2px 6px', fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <BarraVolver conTema texto="Configuración" onVolver={onVolver} />
      <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--in-carta)', borderRadius: 18, boxShadow: 'var(--in-sombra)', padding: '12px 13px' }}>
        <span aria-hidden="true" style={{ position: 'absolute', width: 110, height: 110, top: -50, right: -36, borderRadius: '50%', background: 'rgba(0,224,145,.10)' }} />
        <span style={{ position: 'relative', width: 38, height: 38, borderRadius: 11, background: '#0C2D40', color: '#00E091', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{sigla}</span>
        <span style={{ position: 'relative', display: 'grid', minWidth: 0 }}>
          <b style={{ fontSize: 11, fontWeight: 600 }}>{empresa?.nombre || nombre}</b>
          <small style={{ fontSize: 7.4, color: 'var(--in-mute)' }}>{activas.length} sucursales · {empresa?.pais || 'Bolivia'}</small>
        </span>
      </div>
      <span style={{ fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', margin: '6px 2px -2px' }}>Datos de la empresa</span>
      <div style={{ background: 'var(--in-carta)', borderRadius: 15, boxShadow: 'var(--in-sombra)', overflow: 'hidden' }}>
        {datos.map(([k, v], i) => (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '38% 1fr', gap: 8, padding: '7px 10px', alignItems: 'baseline', borderTop: i ? '1px solid var(--in-linea)' : 'none' }}>
            <small style={{ fontSize: 7.2, color: 'var(--in-mute)' }}>{k}</small><b style={{ fontSize: 8.4, fontWeight: 600, overflowWrap: 'anywhere' }}>{v}</b>
          </div>
        ))}
      </div>
      <span style={{ fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', margin: '6px 2px -2px', display: 'flex', justifyContent: 'space-between' }}>Sucursales<small style={{ fontSize: 7.4, fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--in-mute)' }}>{activas.length}</small></span>
      <div style={{ background: 'var(--in-carta)', borderRadius: 15, boxShadow: 'var(--in-sombra)', overflow: 'hidden' }}>
        {activas.map((x, i) => (
          <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderTop: i ? '1px solid var(--in-linea)' : 'none' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px #00E091', display: 'grid', placeItems: 'center', flexShrink: 0 }}><MapPin size={12} strokeWidth={1.8} /></span>
            <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
              <b style={{ fontSize: 9, fontWeight: 500 }}>{x.nombre}</b>
              <small style={{ fontSize: 7.2, color: 'var(--in-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{[x.ciudad, x.direccion].filter(Boolean).join(' · ')}</small>
            </span>
          </div>
        ))}
      </div>
      <span style={{ fontSize: 7.2, color: 'var(--in-mute)', textAlign: 'center', marginTop: 4 }}>Estos datos los mantiene Recursos Humanos.</span>
    </div>
  )
}

/* ELIMINAR LA CUENTA PIDE ESCRIBIRLO: un aviso al centro donde hay que escribir «eliminar mi cuenta» para
   que se active el botón. Es una acción que no se deshace, y un toque suelto no puede bastar. */
const FRASE = 'eliminar mi cuenta'
function ConfirmarEliminar({ onCancelar, onConfirmar }) {
  const [texto, setTexto] = useState('')
  const listo = texto.trim().toLowerCase() === FRASE
  const marco = document.getElementById('marco-telefono')
  const aviso = (
    <div onClick={onCancelar} style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(12,45,64,.42)', display: 'grid', placeItems: 'center', padding: 20, fontFamily: 'Poppins, sans-serif' }}>
      <div role="dialog" aria-label="Eliminar mi cuenta" onClick={e => e.stopPropagation()} style={{ width: '100%', background: 'var(--in-carta)', color: 'var(--in-texto)', borderRadius: 20, boxShadow: '0 20px 40px -12px rgba(12,45,64,.5)', padding: '18px 14px 14px', display: 'grid', justifyItems: 'center', textAlign: 'center', gap: 4 }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--in-rojo-bg)', color: 'var(--in-rojo)', display: 'grid', placeItems: 'center', marginBottom: 4 }}><AlertTriangle size={18} /></span>
        <b style={{ fontSize: 11.5, fontWeight: 600 }}>¿Eliminar su cuenta?</b>
        <span style={{ fontSize: 8, color: 'var(--in-mute)', lineHeight: 1.5 }}>Se envía la solicitud a RR.HH. y, cuando la apruebe, ya no podrá entrar a SoulyHR. Esto no se puede deshacer.</span>
        <label style={{ display: 'grid', gap: 4, width: '100%', marginTop: 8, textAlign: 'left' }}>
          <span style={{ fontSize: 7.4, color: 'var(--in-mute)' }}>Para confirmar, escriba <b style={{ color: 'var(--in-texto)' }}>{FRASE}</b></span>
          <input value={texto} onChange={e => setTexto(e.target.value)} placeholder={FRASE} aria-label="Escriba eliminar mi cuenta" autoComplete="off"
            style={{ height: 30, borderRadius: 10, border: 'none', background: 'var(--in-fondo)', padding: '0 10px', fontFamily: 'inherit', fontSize: 8.8, color: 'var(--in-texto)', outline: 'none', boxShadow: listo ? 'inset 0 0 0 1.4px var(--in-rojo)' : 'none' }} />
        </label>
        <div style={{ display: 'grid', gap: 6, width: '100%', marginTop: 8 }}>
          <button type="button" disabled={!listo} onClick={onConfirmar} style={{ height: 30, borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 8.6, fontWeight: 600, cursor: listo ? 'pointer' : 'default', background: listo ? '#D92D20' : 'var(--in-plomo)', color: listo ? '#fff' : 'var(--in-suave)' }}>Eliminar mi cuenta</button>
          <button type="button" onClick={onCancelar} style={{ height: 30, borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 8.6, fontWeight: 600, cursor: 'pointer', background: 'var(--in-fondo)', color: 'var(--in-texto)' }}>No, mantenerla</button>
        </div>
      </div>
    </div>
  )
  return marco ? createPortal(aviso, marco) : aviso
}

export default function ConfiguracionPhone({ onVolver, onPerfilUsuario, currentUser, form }) {
  const [biometria, setBiometria] = useState(false)
  const [avisos, setAvisos] = useState(true)
  // «Modo oscuro» cambia el tema de verdad: es el mismo interruptor que el de la web.
  const { theme, toggleTheme } = useTheme()
  const [vista, setVista] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [aviso, setAviso] = useState(null)
  if (vista === 'empresa') return <MiEmpresa onVolver={() => setVista(null)} />
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
        <Fila icon={Building2} titulo="Mi empresa" texto="Nombre, datos y sucursales" onClick={() => setVista('empresa')} />
      </Grupo>

      {/* Salir y eliminar la cuenta, al final, como dos filas más con aro y título en rojo suave (opción
          R1 elegida). Eliminar pide escribir «eliminar mi cuenta»; como el prototipo no borra cuentas, al
          confirmar solo avisa que la solicitud se envió. */}
      <Grupo titulo="Cuenta">
        <Fila rojo icon={LogOut} titulo="Cerrar sesión" texto="Salir de SoulyHR en este teléfono" derecha={false} />
        <Fila rojo icon={Trash2} titulo="Eliminar mi cuenta" texto="Envía la solicitud para borrar su cuenta" onClick={() => setEliminando(true)} />
      </Grupo>

      <div style={{ textAlign: 'center', fontSize: 7.4, color: 'var(--in-mute)', marginTop: 12 }}>Souly HR v1.0.0</div>
      {eliminando && <ConfirmarEliminar onCancelar={() => setEliminando(false)} onConfirmar={() => {
        setEliminando(false)
        setAviso('Enviamos su solicitud a RR.HH. Le avisaremos cuando la responda.')
        setTimeout(() => setAviso(null), 3200)
      }} />}
      {aviso && <div role="status" style={{ position: 'sticky', bottom: 6, marginTop: 10, padding: '7px 10px', borderRadius: 12, background: '#0C2D40', color: '#fff', fontSize: 7.6, fontWeight: 600, boxShadow: '0 4px 14px rgba(12,45,64,.25)' }}>{aviso}</div>}
    </div>
  )
}
