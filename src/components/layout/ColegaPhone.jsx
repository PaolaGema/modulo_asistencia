import { Fragment, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, FileText, Heart, MessageCircle, SendHorizontal, User, X } from 'lucide-react'
import Avatar from '../personas/Avatar'
import BarraVolver from './BarraVolver'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useMiFicha } from '../../hooks/useMiFicha'
import { COLEGAS } from '../../data/colegasData'
import { PUBLICACIONES } from '../../data/publicacionesInicio'
import { historiaCon } from '../../data/chatsData'
import { Adjunto, BotonAdjuntar } from './ChatAdjuntos'

/* UN COMPAÑERO, desde el organigrama (opción M2 y las dos pantallas aprobadas).
   Tocar a una persona abre un aviso al centro con su foto, su cargo y dos botones: «Enviar mensaje»
   y «Ver perfil». El perfil muestra solo lo público —nada de la ficha personal—; el chat es uno a
   uno y en esta demo se guarda en el navegador.

   `colega`: { persona, cargo, area, sucursal, jefe: { nombre, linea, vacante } | null,
               equipo: [{ persona, cargo, clave, soy, foto }], companero } — lo arma el organigrama. */

const C = { texto: 'var(--in-texto)', mute: 'var(--in-mute)', carta: 'var(--in-carta)', sombra: 'var(--in-sombra)' }
const MIA = { fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 7px', color: 'var(--tx-verde)', background: 'var(--tn-verde)', whiteSpace: 'nowrap' }
const GRIS = { ...MIA, color: 'var(--tx-gris)', background: 'var(--tn-gris)' }
const BOTON = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, height: 30, borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 8.4, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }
const MENTA = { ...BOTON, background: '#00E091', color: '#0C2D40' }
const SUAVE = { ...BOTON, background: 'var(--in-fondo)', color: C.texto }

export function Cara({ persona, foto, size = 26 }) {
  const aro = { boxShadow: '0 0 0 1.4px var(--in-carta), 0 0 0 2.6px #00E091', flexShrink: 0 }
  if (foto) return <img src={foto} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', ...aro }} />
  if (!persona) return <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--tn-gris)', display: 'grid', placeItems: 'center', color: 'var(--in-suave)', flexShrink: 0 }}><User size={size * 0.45} /></span>
  return <Avatar persona={persona} size={size} style={aro} />
}

const MESES = { ene: 'enero', feb: 'febrero', mar: 'marzo', abr: 'abril', may: 'mayo', jun: 'junio', jul: 'julio', ago: 'agosto', sep: 'septiembre', oct: 'octubre', nov: 'noviembre', dic: 'diciembre' }
// «15 Mar 2025» → «Marzo de 2025»
const ingreso = t => {
  const m = /(\d{1,2})\s+([A-Za-zé]{3})\w*\s+(\d{4})/.exec(t || '')
  const mes = m && MESES[m[2].toLowerCase()]
  return mes ? `${mes[0].toUpperCase()}${mes.slice(1)} de ${m[3]}` : t || '—'
}

/* EL AVISO AL CENTRO (M2): sobre el teléfono, con velo; se cierra con la × o tocando afuera. */
export function AvisoColega({ colega, onCerrar, onPerfil, onChat }) {
  const marco = document.getElementById('marco-telefono')
  const { persona, cargo, area } = colega
  const aviso = (
    <div onClick={onCerrar} style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(12,45,64,.42)', display: 'grid', placeItems: 'center', padding: 22, fontFamily: 'Poppins, sans-serif' }}>
      <div role="dialog" aria-label={persona.name} onClick={e => e.stopPropagation()} style={{
        position: 'relative', width: '100%', background: C.carta, color: C.texto, borderRadius: 20, boxShadow: '0 20px 40px -12px rgba(12,45,64,.5)',
        padding: '18px 14px 14px', display: 'grid', justifyItems: 'center', textAlign: 'center', gap: 2,
      }}>
        <button type="button" onClick={onCerrar} aria-label="Cerrar" style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'var(--in-fondo)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: C.mute, padding: 0 }}><X size={10} strokeWidth={2.4} /></button>
        <Cara persona={persona} size={58} />
        <b style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{persona.name}</b>
        <span style={{ fontSize: 7.8, color: C.mute }}>{cargo?.nombre || persona.cargo}{area ? ` · ${area}` : ''}</span>
        {colega.companero && <em style={{ ...MIA, marginTop: 4 }}>Su compañero de equipo</em>}
        <div style={{ display: 'grid', gap: 6, width: '100%', marginTop: 12 }}>
          <button type="button" onClick={onChat} style={MENTA}><MessageCircle size={12} strokeWidth={2} />Enviar mensaje</button>
          <button type="button" onClick={onPerfil} style={SUAVE}><User size={12} strokeWidth={2} />Ver perfil</button>
        </div>
      </div>
    </div>
  )
  return marco ? createPortal(aviso, marco) : aviso
}

const ROTULO = { fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', margin: '8px 2px -2px' }
const lineas = t => (t || '').split('\n').map(x => x.trim()).filter(Boolean)
// Los gustos en píldoras blancas con sombra, como en Perfil.
const Chips = ({ lista, vacio }) => lista.length
  ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{lista.map(x => <span key={x} style={{ fontSize: 7.6, padding: '5px 9px', borderRadius: 99, background: C.carta, boxShadow: C.sombra }}>{x}</span>)}</div>
  : <span style={{ fontSize: 7.4, color: C.mute, padding: '0 2px' }}>{vacio}</span>

/* EL PERFIL DE OTRA PERSONA: la tarjeta de Perfil con los círculos menta, debajo lo de la empresa,
   su equipo, lo que le gustaría que le regalen (para el cumpleaños o el amigo secreto) y lo que publicó. */
export function PerfilColega({ colega, volverA, onVolver, onChat, onOtro }) {
  const { persona, cargo, area, sucursal, jefe, equipo } = colega
  // Si tiene ficha propia, mandan sus Preferencias; si no, las de ejemplo.
  const { ficha } = useMiFicha(persona.name)
  const extra = COLEGAS[persona.name] || {}
  const regalos = ficha?.form?.['ra.f1'] != null ? lineas(ficha.form['ra.f1']) : extra.regalos || []
  const experiencias = ficha?.form?.['ra.f4'] != null ? lineas(ficha.form['ra.f4']) : extra.experiencias || []
  const publicaciones = [...PUBLICACIONES.filter(p => p.autor === persona.name), ...(extra.publicaciones || [])]
  const nombre = persona.name.split(' ')[0]
  const filas = [
    ['Área', area],
    jefe && ['Reporta a', jefe.nombre, jefe.vacante],
    persona.ingreso && ['Ingresó', ingreso(persona.ingreso)],
    persona.email && ['Correo', persona.email],
  ].filter(Boolean)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Poppins, sans-serif', color: C.texto }}>
      <BarraVolver texto={volverA} onVolver={onVolver} conTema />
      <div style={{ position: 'relative', overflow: 'hidden', display: 'grid', justifyItems: 'center', textAlign: 'center', gap: 2, background: C.carta, borderRadius: 18, boxShadow: C.sombra, padding: '14px 13px 12px', marginBottom: 4 }}>
        <i aria-hidden="true" style={{ position: 'absolute', width: 120, height: 120, right: -40, top: -50, borderRadius: '50%', background: 'rgba(0,224,145,.09)' }} />
        <i aria-hidden="true" style={{ position: 'absolute', width: 60, height: 60, right: 60, top: -34, borderRadius: '50%', background: 'rgba(0,224,145,.12)' }} />
        <span style={{ position: 'relative' }}><Cara persona={persona} size={58} /></span>
        <b style={{ position: 'relative', fontSize: 12.5, fontWeight: 600, marginTop: 6 }}>{persona.name}</b>
        <span style={{ position: 'relative', fontSize: 8, color: C.mute }}>{cargo?.nombre || persona.cargo}</span>
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, margin: '6px 0 10px' }}>
          {[area, sucursal].filter(Boolean).map(t => <span key={t} style={{ fontSize: 6.8, fontWeight: 600, borderRadius: 99, padding: '3px 8px', background: 'var(--in-fondo)' }}>{t}</span>)}
        </div>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%' }}>
          <button type="button" onClick={onChat} style={MENTA}><MessageCircle size={12} strokeWidth={2} />Mensaje</button>
          {persona.email
            ? <a href={`mailto:${persona.email}`} style={SUAVE}><FileText size={12} strokeWidth={2} />Correo</a>
            : <span style={{ ...SUAVE, opacity: 0.5, cursor: 'default' }}><FileText size={12} strokeWidth={2} />Correo</span>}
        </div>
      </div>

      <span style={{ fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', margin: '2px 2px -2px' }}>En la empresa</span>
      <div style={{ background: C.carta, borderRadius: 15, boxShadow: C.sombra, overflow: 'hidden' }}>
        {filas.map(([k, v, vacante], i) => (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '38% 1fr', gap: 8, padding: '7px 10px', alignItems: 'baseline', borderTop: i ? '1px solid var(--in-linea)' : 'none' }}>
            <small style={{ fontSize: 7.2, color: C.mute }}>{k}</small>
            <b style={{ fontSize: 8.4, fontWeight: 600, overflowWrap: 'anywhere' }}>{v}{vacante && <em style={{ ...GRIS, marginLeft: 4, display: 'inline-block' }}>Por cubrir</em>}</b>
          </div>
        ))}
      </div>

      {!!equipo.length && (
        <>
          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', margin: '8px 2px -2px' }}>
            Su equipo<small style={{ fontSize: 7.4, fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: C.mute }}>{area} · {equipo.length + 1}</small>
          </span>
          <div style={{ display: 'flex', gap: 9, overflowX: 'auto', padding: '3px 2px 4px', scrollbarWidth: 'none' }}>
            {equipo.map(m => (
              <button key={m.clave} type="button" disabled={m.soy} onClick={() => onOtro(m)} style={{ display: 'grid', justifyItems: 'center', gap: 4, border: 'none', background: 'none', padding: 0, fontFamily: 'inherit', color: C.texto, cursor: m.soy ? 'default' : 'pointer', flexShrink: 0 }}>
                <Cara persona={m.persona} foto={m.foto} size={36} />
                <b style={{ fontSize: 7.4, fontWeight: 500 }}>{m.soy ? 'Usted' : m.persona.name.split(' ')[0]}</b>
              </button>
            ))}
          </div>
        </>
      )}

      <span style={ROTULO}>Regalos que le gustaría recibir</span>
      <Chips lista={regalos} vacio={`${nombre} todavía no agregó regalos.`} />
      <span style={ROTULO}>Experiencias que le gustaría vivir</span>
      <Chips lista={experiencias} vacio={`${nombre} todavía no agregó experiencias.`} />

      <span style={ROTULO}>Publicaciones</span>
      {publicaciones.length ? publicaciones.map((p, i) => (
        <div key={i} style={{ background: C.carta, borderRadius: 15, boxShadow: C.sombra, padding: '10px 11px', display: 'grid', gap: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Cara persona={persona} size={22} />
            <span style={{ display: 'grid' }}><b style={{ fontSize: 8.4, fontWeight: 600 }}>{persona.name}</b><small style={{ fontSize: 6.8, color: C.mute }}>{p.cuando}</small></span>
          </span>
          {p.titulo && <b style={{ fontSize: 9, fontWeight: 600, marginTop: 2 }}>{p.titulo}</b>}
          <span style={{ fontSize: 8, color: C.mute, lineHeight: 1.45 }}>{p.texto}</span>
          <span style={{ display: 'flex', gap: 10, fontSize: 7, color: C.mute, marginTop: 2 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Heart size={10} /> {p.likes}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><MessageCircle size={10} /> {p.comentarios} {p.comentarios === 1 ? 'comentario' : 'comentarios'}</span>
          </span>
        </div>
      )) : <span style={{ fontSize: 7.4, color: C.mute, padding: '0 2px' }}>{nombre} todavía no publicó nada.</span>}
    </div>
  )
}

// El día de un tramo de la conversación, en una píldora al centro.
export const DiaChat = ({ dia }) => <span style={{ justifySelf: 'center', fontSize: 6.8, color: C.mute, background: 'var(--in-plomo)', borderRadius: 99, padding: '2px 8px' }}>{dia}</span>

const hora = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }

/* EL CHAT: uno a uno. Sus mensajes en navy a la derecha, los del otro en blanco a la izquierda.
   Sin mensajes, la foto grande y dos frases para empezar (tocarlas las pone en el campo). */
export function ChatColega({ colega, yo, onVolver }) {
  const { persona, cargo, area } = colega
  const [mensajes, setMensajes] = useLocalStorage(`chat:${yo}:${persona.name}`, historiaCon(persona.name))
  const [texto, setTexto] = useState('')
  const fin = useRef(null)
  const campo = useRef(null)
  useEffect(() => { fin.current?.scrollIntoView({ block: 'end' }) }, [mensajes.length])
  const nombre = persona.name.split(' ')[0]
  const enviar = () => {
    const t = texto.trim()
    if (!t) return
    setMensajes(m => [...m, { de: 'yo', texto: t, hora: hora() }])
    setTexto('')
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: 'Poppins, sans-serif', color: C.texto }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 -10px', padding: '0 10px 8px', borderBottom: '1px solid var(--in-linea)' }}>
        <button type="button" onClick={onVolver} aria-label="Volver" style={{ width: 29, height: 29, borderRadius: '50%', border: 'none', background: C.carta, boxShadow: C.sombra, display: 'grid', placeItems: 'center', cursor: 'pointer', color: C.texto, padding: 0, flexShrink: 0 }}><ChevronLeft size={13} strokeWidth={2.2} /></button>
        <Cara persona={persona} size={26} />
        <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
          <b style={{ fontSize: 9.6, fontWeight: 600 }}>{persona.name}</b>
          <span style={{ fontSize: 7, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cargo?.nombre || persona.cargo}{area ? ` · ${area}` : ''}</span>
        </span>
      </div>

      {mensajes.length ? (
        <div style={{ display: 'grid', gap: 6, paddingTop: 10, paddingBottom: 8 }}>
          {mensajes.map((m, i) => {
            const mio = m.de === 'yo'
            const dia = m.dia || 'Hoy'
            return (<Fragment key={i}>
              {dia !== (i ? mensajes[i - 1].dia || 'Hoy' : null) && <DiaChat dia={dia} />}
              <div style={{
                maxWidth: '78%', justifySelf: mio ? 'end' : 'start', display: 'grid', gap: 2, fontSize: 8.4, lineHeight: 1.4, padding: '7px 10px 5px', borderRadius: 14,
                ...(mio ? { background: '#0C2D40', color: '#fff', borderBottomRightRadius: 4 } : { background: C.carta, boxShadow: C.sombra, borderBottomLeftRadius: 4 }),
                overflowWrap: 'anywhere',
              }}>
                {m.archivo && <Adjunto archivo={m.archivo} mio={mio} />}
                {m.texto}
                <small style={{ fontSize: 6, opacity: 0.6, justifySelf: 'end' }}>{m.hora}{mio && i === mensajes.length - 1 ? ' · Enviado' : ''}</small>
              </div>
            </Fragment>)
          })}
          <i ref={fin} />
        </div>
      ) : (
        <div style={{ display: 'grid', justifyItems: 'center', textAlign: 'center', gap: 3, paddingTop: 60 }}>
          <Cara persona={persona} size={58} />
          <b style={{ fontSize: 11, fontWeight: 600, marginTop: 8 }}>Escríbale a {nombre}</b>
          <span style={{ fontSize: 7.8, color: C.mute }}>Todavía no se escribieron. Puede empezar con:</span>
          <div style={{ display: 'grid', gap: 5, marginTop: 10 }}>
            {[`Hola ${nombre}, ¿cómo está?`, '¿Tiene un momento para una consulta?'].map(s => (
              <button key={s} type="button" onClick={() => { setTexto(s); campo.current?.focus() }} style={{ fontFamily: 'inherit', fontSize: 8, padding: '7px 12px', borderRadius: 99, border: 'none', background: C.carta, color: C.texto, boxShadow: '0 0 0 1.2px #00E091', cursor: 'pointer' }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); enviar() }} style={{ position: 'sticky', bottom: 0, marginTop: 'auto', paddingTop: 8, background: 'var(--in-fondo)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, borderRadius: 99, background: C.carta, boxShadow: C.sombra, padding: '0 4px 0 6px' }}>
          <BotonAdjuntar onAdjunto={a => setMensajes(m => [...m, { de: 'yo', archivo: a, hora: hora() }])} />
          <input ref={campo} value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escriba un mensaje…" aria-label="Mensaje"
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 8.4, color: C.texto }} />
          <button type="submit" aria-label="Enviar" disabled={!texto.trim()} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', display: 'grid', placeItems: 'center', padding: 0, cursor: texto.trim() ? 'pointer' : 'default', background: texto.trim() ? '#00E091' : 'var(--in-plomo)', color: '#0C2D40' }}>
            <SendHorizontal size={12} strokeWidth={2.2} />
          </button>
        </div>
      </form>
    </div>
  )
}
