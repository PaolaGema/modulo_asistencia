import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Bell, Check, ChevronLeft, MessageSquarePlus, Pin, Search, SendHorizontal, Users, X } from 'lucide-react'
import BarraVolver from './BarraVolver'
import { Cara, ChatColega, DiaChat } from './ColegaPhone'
import { Adjunto, BotonAdjuntar } from './ChatAdjuntos'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { colaboradoresData } from '../../pages/personas/colaboradoresData'
import { DIRECTOS, MENSAJES_GRUPO, NO_LEIDOS_GRUPO, historiaCon } from '../../data/chatsData'
import { useCanales, canalesPara } from '../../hooks/useCanales'

/* LA PESTAÑA COMUNICACIÓN (opción K1, «una lista, como WhatsApp»).
   Una sola lista con todo: los canales de RR.HH. fijados arriba, el grupo del área, los grupos que
   arme la persona y sus chats uno a uno. Se filtra con chips (Todos, No leídos, Grupos, Canales) y
   con el buscador. El botón menta abre «Nuevo chat»: su equipo primero y el buscador para toda la
   empresa, con «Nuevo grupo» arriba. En los canales publica RR.HH. y la gente solo reacciona.
   En esta demo todo se guarda en el navegador. */

const C = { texto: 'var(--in-texto)', mute: 'var(--in-mute)', carta: 'var(--in-carta)', sombra: 'var(--in-sombra)' }
const TITULO = { fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }
const ROTULO = { fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', margin: '10px 2px 6px' }
const TARJETA = { background: C.carta, borderRadius: 15, boxShadow: C.sombra, overflow: 'hidden' }
const CAMPO = { display: 'flex', alignItems: 'center', gap: 6, height: 30, borderRadius: 99, background: C.carta, boxShadow: C.sombra, padding: '0 12px', color: C.mute }
const INPUT = { flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 8.2, color: C.texto }
// El nombre de cada quien en un grupo, en su color, como en WhatsApp.
const COLORES = ['#0A7F55', '#7C5AD6', '#2E6FD6', '#C2410C', '#BE185D', '#0E7490']
const FILTROS = [['todos', 'Todos'], ['noLeidos', 'No leídos'], ['grupos', 'Grupos'], ['canales', 'Canales']]

const ahora = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
// La línea de la lista para un adjunto, como en WhatsApp.
const lineaAdjunto = a => (a.tipo === 'imagen' ? '📷 Foto' : `📄 ${a.nombre}`)
const sinTildes = t => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function Circulo({ tipo, size = 30 }) {
  const canal = tipo === 'canal'
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
      background: canal ? '#0C2D40' : 'var(--in-ok-bg)', color: canal ? '#00E091' : '#0A7F55',
      boxShadow: '0 0 0 1.4px var(--in-carta), 0 0 0 2.6px #00E091',
    }}>
      {canal ? <Bell size={size * 0.42} strokeWidth={2} /> : <Users size={size * 0.42} strokeWidth={2} />}
    </span>
  )
}

/* Una fila de la lista. Lee su propia conversación para mostrar el último mensaje, también lo que
   la persona escribió después. */
function FilaChat({ chat, clave, semilla, noLeidos, onAbrir, primera }) {
  const [mensajes] = useLocalStorage(clave, semilla)
  const ultimo = chat.tipo === 'canal' ? chat.canal.publicaciones.at(-1) : mensajes.at(-1)
  let linea = ''
  if (chat.tipo === 'canal') linea = ultimo ? `${chat.canal.fijado ? '📌 ' : ''}${ultimo.titulo}` : ''
  else if (ultimo) linea = `${ultimo.de === 'yo' ? '✓✓ ' : chat.tipo === 'grupo' ? `${ultimo.de.split(' ')[0]}: ` : ''}${ultimo.archivo ? lineaAdjunto(ultimo.archivo) : ultimo.texto}`
  if (!ultimo && chat.tipo === 'grupo') linea = `Grupo nuevo · usted y ${chat.miembros.length} ${chat.miembros.length === 1 ? 'persona' : 'personas'}`
  const cuando = ultimo ? ultimo.dia || ultimo.hora : ''
  return (
    <button type="button" onClick={onAbrir} style={{
      display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 10px', border: 'none', borderTop: primera ? 'none' : '1px solid var(--in-linea)',
      background: 'none', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: C.texto,
    }}>
      {chat.persona ? <Cara persona={chat.persona} size={30} /> : <Circulo tipo={chat.tipo} />}
      <span style={{ flex: 1, minWidth: 0, display: 'grid', gap: 1 }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <b style={{ flex: 1, minWidth: 0, fontSize: 8.8, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.nombre}</b>
          <small style={{ fontSize: 6.8, flexShrink: 0, color: noLeidos ? '#0A7F55' : C.mute, fontWeight: noLeidos ? 700 : 400 }}>{cuando}</small>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 7.6, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{linea}</span>
          {noLeidos ? (
            <em style={{ fontStyle: 'normal', minWidth: 15, height: 15, padding: '0 4px', boxSizing: 'border-box', borderRadius: 99, background: '#00E091', color: '#0C2D40', fontSize: 7, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{noLeidos}</em>
          ) : chat.canal?.fijado ? <Pin size={9} style={{ color: C.mute, flexShrink: 0 }} /> : null}
        </span>
      </span>
    </button>
  )
}

/* La cabecera de una conversación: volver, la cara y el nombre con su línea. */
function CabezaChat({ cara, nombre, linea, onVolver }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 -10px', padding: '0 10px 8px', borderBottom: '1px solid var(--in-linea)' }}>
      <button type="button" onClick={onVolver} aria-label="Volver" style={{ width: 29, height: 29, borderRadius: '50%', border: 'none', background: C.carta, boxShadow: C.sombra, display: 'grid', placeItems: 'center', cursor: 'pointer', color: C.texto, padding: 0, flexShrink: 0 }}><ChevronLeft size={13} strokeWidth={2.2} /></button>
      {cara}
      <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
        <b style={{ fontSize: 9.6, fontWeight: 600 }}>{nombre}</b>
        <span style={{ fontSize: 7, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{linea}</span>
      </span>
    </div>
  )
}

/* UN GRUPO: como el chat uno a uno, con el nombre de quien escribe en su color. */
function ChatGrupo({ grupo, clave, semilla, onVolver }) {
  const [mensajes, setMensajes] = useLocalStorage(clave, semilla)
  const [texto, setTexto] = useState('')
  const fin = useRef(null)
  useEffect(() => { fin.current?.scrollIntoView({ block: 'end' }) }, [mensajes.length])
  const color = nombre => COLORES[Math.max(0, grupo.miembros.indexOf(nombre)) % COLORES.length]
  const enviar = () => {
    const t = texto.trim()
    if (!t) return
    setMensajes(m => [...m, { de: 'yo', texto: t, hora: ahora() }])
    setTexto('')
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: 'Poppins, sans-serif', color: C.texto }}>
      <CabezaChat cara={<Circulo tipo="grupo" size={26} />} nombre={grupo.nombre} onVolver={onVolver}
        linea={`${grupo.miembros.map(n => n.split(' ')[0]).join(', ')} y usted`} />
      <div style={{ display: 'grid', gap: 6, paddingTop: 10, paddingBottom: 8 }}>
        {!mensajes.length && <span style={{ justifySelf: 'center', textAlign: 'center', fontSize: 7.6, color: C.mute, padding: '40px 20px 0' }}>Usted creó este grupo. Escriba el primer mensaje.</span>}
        {mensajes.map((m, i) => {
          const mio = m.de === 'yo'
          const dia = m.dia || 'Hoy'
          return (
            <Fragment key={i}>
              {dia !== (i ? mensajes[i - 1].dia || 'Hoy' : null) && <DiaChat dia={dia} />}
              <div style={{
                maxWidth: '78%', justifySelf: mio ? 'end' : 'start', display: 'grid', gap: 2, fontSize: 8.4, lineHeight: 1.4, padding: '6px 10px 5px', borderRadius: 14, overflowWrap: 'anywhere',
                ...(mio ? { background: '#0C2D40', color: '#fff', borderBottomRightRadius: 4 } : { background: C.carta, boxShadow: C.sombra, borderBottomLeftRadius: 4 }),
              }}>
                {!mio && <b style={{ fontSize: 7.2, fontWeight: 600, color: color(m.de) }}>{m.de}</b>}
                {m.archivo && <Adjunto archivo={m.archivo} mio={mio} />}
                {m.texto}
                <small style={{ fontSize: 6, opacity: 0.6, justifySelf: 'end' }}>{m.hora}</small>
              </div>
            </Fragment>
          )
        })}
        <i ref={fin} />
      </div>
      <Escribir texto={texto} setTexto={setTexto} enviar={enviar} onAdjunto={a => setMensajes(m => [...m, { de: 'yo', archivo: a, hora: ahora() }])} />
    </div>
  )
}

function Escribir({ texto, setTexto, enviar, onAdjunto }) {
  return (
    <form onSubmit={e => { e.preventDefault(); enviar() }} style={{ position: 'sticky', bottom: 0, marginTop: 'auto', paddingTop: 8, background: 'var(--in-fondo)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, borderRadius: 99, background: C.carta, boxShadow: C.sombra, padding: '0 4px 0 6px' }}>
        <BotonAdjuntar onAdjunto={onAdjunto} />
        <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escriba un mensaje…" aria-label="Mensaje" style={{ ...INPUT, fontSize: 8.4 }} />
        <button type="submit" aria-label="Enviar" disabled={!texto.trim()} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', display: 'grid', placeItems: 'center', padding: 0, cursor: texto.trim() ? 'pointer' : 'default', background: texto.trim() ? '#00E091' : 'var(--in-plomo)', color: '#0C2D40' }}>
          <SendHorizontal size={12} strokeWidth={2.2} />
        </button>
      </div>
    </form>
  )
}

/* UN CANAL DE RR.HH.: las publicaciones en tarjetas; la gente reacciona, no responde. */
function Canal({ canal, yo, onVolver }) {
  const [mias, setMias] = useLocalStorage(`canal:${yo}:${canal.id}`, {})
  const reaccionar = (i, emoji) => setMias(m => ({ ...m, [i]: m[i] === emoji ? undefined : emoji }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: 'Poppins, sans-serif', color: C.texto }}>
      <CabezaChat cara={<Circulo tipo="canal" size={26} />} nombre={canal.nombre} linea={`Canal oficial · ${canal.personas} personas`} onVolver={onVolver} />
      <div style={{ display: 'grid', gap: 8, paddingTop: 10 }}>
        {canal.publicaciones.map((p, i) => (
          <div key={i} style={{ ...TARJETA, padding: '9px 11px', display: 'grid', gap: 3 }}>
            <small style={{ fontSize: 6.8, color: C.mute }}>{p.dia} · {p.hora}</small>
            <b style={{ fontSize: 9, fontWeight: 600 }}>{p.titulo}</b>
            <span style={{ fontSize: 7.8, lineHeight: 1.5 }}>{p.texto}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {[...new Set([...Object.keys(p.reacciones), '👍', '❤️'])].map(e => {
                const puesta = mias[i] === e
                const n = (p.reacciones[e] || 0) + (puesta ? 1 : 0)
                return (
                  <button key={e} type="button" aria-pressed={puesta} onClick={() => reaccionar(i, e)} style={{
                    height: 20, padding: '0 8px', borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 7.4, cursor: 'pointer', color: C.texto,
                    background: puesta ? 'var(--in-ok-bg)' : 'var(--in-fondo)', boxShadow: puesta ? 'inset 0 0 0 1.3px #00E091' : 'none', fontWeight: puesta ? 600 : 500,
                  }}>{e}{n ? ` ${n}` : ''}</button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <span style={{ marginTop: 12, textAlign: 'center', fontSize: 7.2, color: C.mute }}>Solo Recursos Humanos publica en este canal. Usted puede reaccionar.</span>
    </div>
  )
}

/* Una persona para elegir, en Nuevo chat y Nuevo grupo. */
function FilaPersona({ persona, onTocar, primera, marcada }) {
  return (
    <button type="button" onClick={onTocar} aria-pressed={marcada} style={{
      display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 10px', border: 'none', borderTop: primera ? 'none' : '1px solid var(--in-linea)',
      background: 'none', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: C.texto,
    }}>
      <Cara persona={persona} size={26} />
      <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
        <b style={{ fontSize: 8.6, fontWeight: 600 }}>{persona.name}</b>
        <span style={{ fontSize: 7, color: C.mute }}>{persona.depto === 'Sin asignar' ? 'Todavía sin área' : `${persona.cargo} · ${persona.depto}`}</span>
      </span>
      {marcada != null && (
        <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: marcada ? '#00E091' : 'transparent', boxShadow: marcada ? 'none' : 'inset 0 0 0 1.4px var(--in-suave)', color: '#0C2D40' }}>
          {marcada && <Check size={10} strokeWidth={3} />}
        </span>
      )}
    </button>
  )
}

/* NUEVO CHAT y NUEVO GRUPO: su equipo primero; con el buscador, toda la empresa. */
function Elegir({ equipo, personas, area, grupo, onVolver, onElegir, onGrupo, onCrear }) {
  const [q, setQ] = useState('')
  const [nombre, setNombre] = useState('')
  const [marcadas, setMarcadas] = useState([])
  const buscando = q.trim().length > 0
  const encontradas = buscando ? personas.filter(p => sinTildes(`${p.name} ${p.cargo} ${p.depto}`).includes(sinTildes(q.trim()))).slice(0, 30) : []
  const resto = personas.filter(p => !equipo.includes(p) && p.depto !== 'Sin asignar').slice(0, 6)
  const tocar = p => grupo ? setMarcadas(m => (m.includes(p.name) ? m.filter(x => x !== p.name) : [...m, p.name])) : onElegir(p)
  const lista = (gente, titulo) => gente.length > 0 && (
    <>
      <div style={ROTULO}>{titulo}</div>
      <div style={TARJETA}>{gente.map((p, i) => <FilaPersona key={p.id} persona={p} primera={!i} onTocar={() => tocar(p)} marcada={grupo ? marcadas.includes(p.name) : undefined} />)}</div>
    </>
  )
  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', color: C.texto, paddingBottom: grupo ? 44 : 0 }}>
      <BarraVolver conTema texto={grupo ? 'Nuevo chat' : 'Comunicación'} onVolver={onVolver} />
      <div style={{ display: 'grid', marginBottom: 8 }}>
        <b style={TITULO}>{grupo ? 'Nuevo grupo' : 'Nuevo chat'}</b>
        <small style={{ fontSize: 8.2, color: C.mute }}>{grupo ? 'Póngale un nombre y elija a las personas' : 'Su equipo primero; busque a cualquiera de la empresa'}</small>
      </div>
      {grupo && (
        <div style={{ ...CAMPO, marginBottom: 8 }}>
          <Users size={11} />
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del grupo" aria-label="Nombre del grupo" style={INPUT} />
        </div>
      )}
      <div style={CAMPO}>
        <Search size={11} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar en toda la empresa" aria-label="Buscar personas" style={INPUT} />
        {buscando && <button type="button" onClick={() => setQ('')} aria-label="Borrar la búsqueda" style={{ border: 'none', background: 'none', padding: 0, color: C.mute, cursor: 'pointer', display: 'grid' }}><X size={11} /></button>}
      </div>
      {!grupo && !buscando && (
        <button type="button" onClick={onGrupo} style={{ ...TARJETA, display: 'flex', alignItems: 'center', gap: 9, width: '100%', marginTop: 10, padding: '8px 10px', border: 'none', fontFamily: 'inherit', cursor: 'pointer', color: C.texto, textAlign: 'left' }}>
          <Circulo tipo="grupo" size={26} />
          <b style={{ fontSize: 8.6, fontWeight: 600 }}>Nuevo grupo</b>
        </button>
      )}
      {buscando ? (
        encontradas.length ? lista(encontradas, 'Resultados') : <div style={{ textAlign: 'center', fontSize: 7.8, color: C.mute, padding: '24px 0' }}>No encontramos a nadie con «{q.trim()}».</div>
      ) : (
        <>
          {lista(equipo, `Su equipo · ${area}`)}
          {lista(resto, 'Toda la empresa')}
          {resto.length > 0 && <div style={{ textAlign: 'center', fontSize: 7.2, color: C.mute, marginTop: 8 }}>Use el buscador para encontrar a los demás.</div>}
        </>
      )}
      {grupo && (
        <div style={{ position: 'sticky', bottom: 0, paddingTop: 8, background: 'var(--in-fondo)' }}>
          <button type="button" disabled={!nombre.trim() || !marcadas.length} onClick={() => onCrear(nombre.trim(), marcadas)} style={{
            width: '100%', height: 30, borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 8.4, fontWeight: 600,
            background: nombre.trim() && marcadas.length ? '#00E091' : 'var(--in-plomo)', color: nombre.trim() && marcadas.length ? '#0C2D40' : C.mute,
            cursor: nombre.trim() && marcadas.length ? 'pointer' : 'default',
          }}>{marcadas.length ? `Crear grupo con ${marcadas.length} ${marcadas.length === 1 ? 'persona' : 'personas'}` : 'Crear grupo'}</button>
        </div>
      )}
    </div>
  )
}

export default function ComunicacionPhone({ currentUser }) {
  const yo = currentUser?.name || ''
  const personas = useMemo(() => colaboradoresData.filter(p => p.status === 'activo' && p.name !== yo).sort((a, b) => a.name.localeCompare(b.name)), [yo])
  const area = currentUser?.area || currentUser?.roleLabel?.split('—').pop().trim() || colaboradoresData.find(p => p.name === yo)?.depto || 'Tecnología'
  const equipo = useMemo(() => personas.filter(p => p.depto === area), [personas, area])
  const porNombre = n => colaboradoresData.find(p => p.name === n)

  // Los canales y grupos oficiales los arma RR.HH. en la web (Comunicación › Canales y grupos).
  const [oficiales] = useCanales()
  const [creados, setCreados] = useLocalStorage(`chatsGrupos:${yo}`, [])
  const [leidos, setLeidos] = useLocalStorage(`chatsLeidos:${yo}`, [])
  const [filtro, setFiltro] = useState('todos')
  const [q, setQ] = useState('')
  const [vista, setVista] = useState(null)
  const arriba = () => document.querySelector('.phone-scroll')?.scrollTo(0, 0)
  const ir = v => { setVista(v); arriba() }

  /* Todo lo de la lista, en el orden de WhatsApp: lo fijado arriba y después lo demás. */
  const chats = useMemo(() => {
    const miembros = equipo.slice(0, 5).map(p => p.name)
    const grupoArea = miembros.length ? [{
      id: 'area', tipo: 'grupo', nombre: `Equipo ${area}`, miembros, noLeidos: NO_LEIDOS_GRUPO,
      semilla: MENSAJES_GRUPO.map((m, i) => ({ ...m, de: miembros[i % miembros.length] })),
    }] : []
    return [
      ...canalesPara(oficiales, area).map(c => (c.tipo === 'grupo'
        ? { id: `grupo-${c.id}`, tipo: 'grupo', nombre: c.nombre, semilla: [], miembros: personas.filter(p => c.para === 'Toda la empresa' || p.depto === c.para).slice(0, 5).map(p => p.name) }
        : { id: `canal-${c.id}`, tipo: 'canal', nombre: c.nombre, canal: c })),
      ...creados.map(g => ({ ...g, tipo: 'grupo', semilla: [] })),
      ...grupoArea,
      ...DIRECTOS.filter(d => d.nombre !== yo && porNombre(d.nombre)).map(d => ({
        id: `dm-${d.nombre}`, tipo: 'directo', nombre: d.nombre, persona: porNombre(d.nombre), noLeidos: d.noLeidos, semilla: historiaCon(d.nombre),
      })),
    ].sort((a, b) => !!b.canal?.fijado - !!a.canal?.fijado)
  }, [equipo, area, creados, yo, oficiales, personas])
  const sinLeer = c => (c.noLeidos && !leidos.includes(c.id) ? c.noLeidos : 0)
  const clave = c => (c.tipo === 'directo' ? `chat:${yo}:${c.nombre}` : `grupo:${yo}:${c.id}`)
  const abrir = c => {
    if (!leidos.includes(c.id)) setLeidos(l => [...l, c.id])
    ir({ p: c.tipo, chat: c })
  }

  const volver = () => ir(null)
  if (vista?.p === 'canal') return <Canal canal={vista.chat.canal} yo={yo} onVolver={volver} />
  if (vista?.p === 'grupo') return <ChatGrupo key={vista.chat.id} grupo={vista.chat} clave={clave(vista.chat)} semilla={vista.chat.semilla} onVolver={volver} />
  if (vista?.p === 'directo') {
    const p = vista.chat.persona
    return <ChatColega colega={{ persona: p, cargo: { nombre: p.cargo }, area: p.depto }} yo={yo} onVolver={volver} />
  }
  if (vista?.p === 'nuevo' || vista?.p === 'nuevoGrupo') {
    return (
      <Elegir key={vista.p} grupo={vista.p === 'nuevoGrupo'} equipo={equipo} personas={personas} area={area}
        onVolver={() => ir(vista.p === 'nuevoGrupo' ? { p: 'nuevo' } : null)}
        onGrupo={() => ir({ p: 'nuevoGrupo' })}
        onElegir={p => {
          const ya = chats.find(c => c.persona?.name === p.name)
          ir({ p: 'directo', chat: ya || { id: `dm-${p.name}`, tipo: 'directo', nombre: p.name, persona: p } })
        }}
        onCrear={(nombre, miembros) => {
          const g = { id: `g-${Date.now()}`, nombre, miembros }
          setCreados(l => [g, ...l])
          ir({ p: 'grupo', chat: { ...g, tipo: 'grupo', semilla: [] } })
        }} />
    )
  }

  const totalSinLeer = chats.filter(sinLeer).length
  const texto = sinTildes(q.trim())
  const visibles = chats.filter(c => (filtro === 'todos' || (filtro === 'noLeidos' && sinLeer(c)) || (filtro === 'grupos' && c.tipo === 'grupo') || (filtro === 'canales' && c.tipo === 'canal'))
    && (!texto || sinTildes(c.nombre).includes(texto)))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: 'Poppins, sans-serif', color: C.texto }}>
      <div style={{ display: 'grid', marginBottom: 8 }}>
        <b style={TITULO}>Comunicación</b>
        <small style={{ fontSize: 8.2, color: C.mute }}>{totalSinLeer ? `${totalSinLeer} ${totalSinLeer === 1 ? 'chat sin leer' : 'chats sin leer'}` : 'Está al día'}</small>
      </div>
      <div style={CAMPO}>
        <Search size={11} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar personas o chats" aria-label="Buscar chats" style={INPUT} />
        {q && <button type="button" onClick={() => setQ('')} aria-label="Borrar la búsqueda" style={{ border: 'none', background: 'none', padding: 0, color: C.mute, cursor: 'pointer', display: 'grid' }}><X size={11} /></button>}
      </div>
      <div role="group" aria-label="Filtrar chats" style={{ display: 'flex', gap: 5, overflowX: 'auto', scrollbarWidth: 'none', margin: '8px -10px 8px 0', padding: '2px 10px 4px 0' }}>
        {FILTROS.map(([k, t]) => (
          <button key={k} type="button" aria-pressed={filtro === k} onClick={() => setFiltro(k)} style={{
            flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 11px', borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 7.8, cursor: 'pointer', whiteSpace: 'nowrap',
            fontWeight: filtro === k ? 600 : 500, background: filtro === k ? '#0C2D40' : C.carta, color: filtro === k ? '#fff' : C.texto, boxShadow: filtro === k ? 'none' : C.sombra,
          }}>
            {t}
            {k === 'noLeidos' && totalSinLeer > 0 && <em style={{ fontStyle: 'normal', minWidth: 13, height: 13, borderRadius: 99, background: '#00E091', color: '#0C2D40', fontSize: 6.6, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{totalSinLeer}</em>}
          </button>
        ))}
      </div>

      {visibles.length ? (
        <div style={TARJETA}>
          {visibles.map((c, i) => <FilaChat key={c.id} chat={c} clave={clave(c)} semilla={c.semilla || []} noLeidos={sinLeer(c)} primera={!i} onAbrir={() => abrir(c)} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 7.8, color: C.mute, padding: '28px 10px' }}>
          {texto ? `No hay chats con «${q.trim()}».` : filtro === 'noLeidos' ? 'Leyó todo. No tiene mensajes nuevos.' : 'Todavía no hay nada aquí.'}
        </div>
      )}

      {/* El botón menta de WhatsApp: abre Nuevo chat. Queda abajo a la derecha aunque la lista sea larga. */}
      <div style={{ position: 'sticky', bottom: 8, marginTop: 'auto', paddingTop: 12, display: 'flex', justifyContent: 'flex-end', pointerEvents: 'none' }}>
        <button type="button" onClick={() => ir({ p: 'nuevo' })} aria-label="Nuevo chat" style={{
          pointerEvents: 'auto', width: 38, height: 38, borderRadius: 13, border: 'none', background: '#00E091', color: '#0C2D40', display: 'grid', placeItems: 'center', cursor: 'pointer',
          boxShadow: '0 8px 18px -6px rgba(0,160,100,.6)',
        }}><MessageSquarePlus size={16} strokeWidth={2} /></button>
      </div>
    </div>
  )
}
