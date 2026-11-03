import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, List, Network, Search, Users, User, X } from 'lucide-react'
import BarraVolver from './BarraVolver'
import { AvisoColega, PerfilColega, ChatColega, Cara } from './ColegaPhone'
import OrgGrafico from '../personas/OrgGrafico'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { buildOrgTree, estiloColores, sucursales, orgSeed, unidadesRaiz, subunidadesDe, cabezaDe, getPersona, getUnidad, ocupanteDe, normalizar } from '../../data/organigramaData'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { useMiFicha } from '../../hooks/useMiFicha'
import { useFotoPerfil } from '../../hooks/useFotoPerfil'

/* EL ORGANIGRAMA DEL TELÉFONO (opción O2 afinada, «Un árbol que se despliega»).
   El gerente arriba y las áreas colgando de una línea, como un árbol de carpetas. Al entrar todo
   está cerrado menos el área de la persona, que se abre sola, y ella va resaltada en menta con
   «Usted». Cada área se abre con la «v» de la derecha (gira al abrirse) y sus sub-áreas se abren
   igual, un nivel más adentro. Se pueden tener varias abiertas.

   LOS DATOS SON LOS DE ORGANIZACIÓN. Si la empresa todavía no armó su organigrama —la demo
   arranca vacía—, el teléfono muestra el de ejemplo en vez de abrirse en blanco.

   LA PERSONA. Se la busca por nombre entre los ocupantes; si no ocupa ningún cargo (Carlos, en la
   demo), se la suma como una fila más en el área que dice su perfil, para que se vea «Usted». */

const C = { texto: 'var(--in-texto)', mute: 'var(--in-mute)', carta: 'var(--in-carta)', sombra: 'var(--in-sombra)', linea: 'var(--in-campo)', lineaMenta: 'rgba(0,224,145,.4)' }
const ETIQUETA = { fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 6px', whiteSpace: 'nowrap', flexShrink: 0 }
const MIA = { ...ETIQUETA, color: 'var(--tx-verde)', background: 'var(--tn-verde)' }
const GRIS = { ...ETIQUETA, color: 'var(--tx-gris)', background: 'var(--tn-gris)' }

// Todas las unidades que cuelgan de una, con ella incluida.
const conDescendientes = (id, org) => [id, ...subunidadesDe(id, org).flatMap(u => conDescendientes(u.id, org))]
// De una unidad hacia arriba, hasta la raíz.
const cadenaHasta = (id, org) => { const out = []; let u = getUnidad(id, org); while (u) { out.unshift(u.id); u = u.padreId ? getUnidad(u.padreId, org) : null } return out }

function Aro({ sub, Icono = sub ? Users : Network }) {
  const t = sub ? 20 : 24
  return (
    <span style={{ width: t, height: t, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px #00E091', display: 'grid', placeItems: 'center', flexShrink: 0, color: C.texto }}>
      <Icono size={sub ? 9 : 11} strokeWidth={1.8} />
    </span>
  )
}

function Vacio({ size = 26 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--tn-gris)', boxShadow: 'inset 0 0 0 1.2px var(--in-campo)', display: 'grid', placeItems: 'center', flexShrink: 0, color: 'var(--in-suave)' }}>
      <User size={size * 0.45} strokeWidth={1.8} />
    </span>
  )
}

/* Una fila del árbol: persona, puesto vacante o servicio externo. `soy` la resalta. Con alguien
   adentro se puede tocar: a otra persona le abre el aviso; a usted, su Perfil. */
function Fila({ fila, onTocar, marcada }) {
  const { persona, foto, nombre, linea, etiqueta, soy } = fila
  const tocable = !!onTocar && (soy || !!persona)
  return (
    <div data-fila={fila.clave} role={tocable ? 'button' : undefined} tabIndex={tocable ? 0 : undefined} onClick={tocable ? () => onTocar(fila) : undefined}
      onKeyDown={tocable ? e => { if (e.key === 'Enter') onTocar(fila) } : undefined} style={{
      cursor: tocable ? 'pointer' : 'default',
      position: 'relative', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12,
      padding: soy ? 8 : '6px 8px', background: soy ? 'var(--in-ok-bg)' : 'var(--in-calendario)',
      boxShadow: soy ? 'inset 0 0 0 1.5px #00E091' : 'none',
      /* La persona que se buscó: el mismo menta, más fuerte y con halo, hasta la próxima búsqueda. */
      ...(marcada ? { background: 'var(--in-ok-bg)', boxShadow: '0 0 0 2px #00E091, 0 0 0 6px rgba(0,224,145,.18)' } : {}),
    }}>
      {persona || foto ? <Cara persona={persona} foto={foto} size={soy ? 30 : 26} /> : <Vacio />}
      <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
        <b style={{ fontSize: 8.8, fontWeight: soy ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {nombre}{soy && <em style={{ ...MIA, marginLeft: 4, verticalAlign: 1 }}>Usted</em>}
        </b>
        <span style={{ fontSize: 7, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{linea}</span>
      </span>
      {etiqueta && <em style={GRIS}>{etiqueta}</em>}
    </div>
  )
}

/* Los hijos cuelgan de una línea vertical, y cada uno se engancha con un trazo corto. */
function Colgando({ children, menta }) {
  const color = menta ? C.lineaMenta : C.linea
  return (
    <div style={{ position: 'relative', display: 'grid', gap: 6, margin: '6px 0 0 15px', paddingLeft: 11, borderLeft: `1.5px solid ${color}` }}>
      {[].concat(children).filter(Boolean).map((h, i) => (
        <div key={i} style={{ position: 'relative' }}>
          <i aria-hidden="true" style={{ position: 'absolute', left: -11, top: 17, width: 11, height: 1.5, background: color }} />
          {h}
        </div>
      ))}
    </div>
  )
}

function Rama({ id, org, sub, abiertas, alternar, filasDe, miArea, cuenta, onTocar, marcado }) {
  const unidad = getUnidad(id, org)
  const abierta = abiertas.has(id)
  const subs = subunidadesDe(id, org)
  const cabeza = cabezaDe(id, org)
  const jefe = cabeza && getPersona(ocupanteDe(cabeza))
  const n = cuenta(id)
  const linea = [jefe ? jefe.name : cabeza ? 'Jefatura por cubrir' : null, `${n} ${n === 1 ? 'persona' : 'personas'}`, subs.length ? `${subs.length} ${subs.length === 1 ? 'sub-área' : 'sub-áreas'}` : null].filter(Boolean).join(' · ')
  return (
    <div>
      <button type="button" onClick={() => alternar(id)} aria-expanded={abierta} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px 7px 7px', borderRadius: 13, border: 'none', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: C.texto,
        background: sub ? 'var(--in-calendario)' : C.carta, boxShadow: sub ? 'none' : C.sombra,
      }}>
        <Aro sub={sub} />
        <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
          <b style={{ fontSize: 9, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {unidad.nombre}{miArea === id && <em style={{ ...MIA, marginLeft: 4, verticalAlign: 1 }}>Su área</em>}
          </b>
          <span style={{ fontSize: 7, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{linea}</span>
        </span>
        <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, background: abierta ? '#00E091' : 'var(--in-fondo)' }}>
          <ChevronDown size={10} strokeWidth={2.4} style={{ color: abierta ? '#0C2D40' : C.mute, transform: abierta ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </span>
      </button>
      {abierta && (
        <Colgando menta>
          {filasDe(id).map(f => <Fila key={f.clave} fila={f} onTocar={onTocar} marcada={marcado === f.clave} />)}
          {subs.map(s => <Rama key={s.id} id={s.id} org={org} sub abiertas={abiertas} alternar={alternar} filasDe={filasDe} miArea={miArea} cuenta={cuenta} onTocar={onTocar} marcado={marcado} />)}
        </Colgando>
      )}
    </div>
  )
}

export default function OrganigramaPhone({ currentUser, onSalir, volverA = 'Zona HR', onMiPerfil }) {
  const { organigrama, empresa } = useOnboardingData()
  const org = organigrama?.unidades?.length ? organigrama : orgSeed
  const { ficha } = useMiFicha(currentUser?.name)
  const miFoto = useFotoPerfil(currentUser?.name, ficha?.form?.['1.9'], 80)
  /* EL BUSCADOR, abierto como el de Zona HR. Elegir a alguien no abre nada: lleva hasta esa persona
     —en la lista abre su área y baja hasta ella; en el gráfico centra el dibujo en su cuadro— y la
     deja resaltada en menta hasta la próxima búsqueda. */
  const [q, setQ] = useState('')
  const [enfocado, setEnfocado] = useState(false)
  const [marcado, setMarcado] = useState(null)
  const [buscado, setBuscado] = useState(null)
  const campo = useRef(null)

  const raiz = unidadesRaiz(org)[0] || null
  const cabezaRaiz = raiz && cabezaDe(raiz.id, org)
  const gerente = cabezaRaiz && getPersona(ocupanteDe(cabezaRaiz))
  const areas = raiz ? subunidadesDe(raiz.id, org) : []

  /* Dónde está la persona: el cargo que ocupa, o el área que dice su perfil («… — Tecnología»). */
  const yo = useMemo(() => {
    if (!currentUser) return null
    const cargo = org.cargos.find(c => getPersona(ocupanteDe(c))?.name === currentUser.name)
    if (cargo) return { cargoId: cargo.id, unidadId: cargo.unidadId }
    const area = normalizar(currentUser.area || currentUser.roleLabel?.split('—').pop() || '')
    const u = org.unidades.find(x => normalizar(x.nombre) === area.trim())
    return u ? { unidadId: u.id, suelto: true } : null
  }, [org, currentUser])

  // Su área es la de primer nivel que la contiene; se abre esa cadena entera.
  const cadena = yo ? cadenaHasta(yo.unidadId, org) : []
  const miArea = cadena[1] || cadena[0] || null
  const [abiertas, setAbiertas] = useState(() => new Set(cadena))
  const alternar = id => setAbiertas(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const filaDeCargo = c => {
    const persona = getPersona(ocupanteDe(c))
    const externo = c.tipo === 'outsourcing'
    const esCabeza = cabezaDe(c.unidadId, org)?.id === c.id
    const soy = yo?.cargoId === c.id
    if (persona) return { clave: c.id, cargo: c, persona, foto: soy ? miFoto : null, nombre: persona.name, linea: esCabeza ? `${c.nombre} · a cargo del área` : c.nombre, soy }
    return { clave: c.id, cargo: c, nombre: c.nombre, linea: externo ? 'Servicio externo' : esCabeza ? 'Jefatura' : 'Puesto', etiqueta: externo ? 'Tercerizado' : 'Por cubrir' }
  }
  const filasDe = id => {
    const propios = org.cargos.filter(c => c.unidadId === id)
    const cabeza = cabezaDe(id, org)
    const orden = [...propios].sort((a, b) => (b.id === cabeza?.id) - (a.id === cabeza?.id))
    const filas = orden.map(filaDeCargo)
    if (yo?.suelto && yo.unidadId === id) {
      filas.splice(Math.min(3, filas.length), 0, { clave: 'yo', foto: miFoto, nombre: currentUser.name, linea: currentUser.cargo || 'Colaborador', soy: true })
    }
    return filas
  }
  const cuenta = id => {
    const ids = conDescendientes(id, org)
    const n = org.cargos.filter(c => ids.includes(c.unidadId) && getPersona(ocupanteDe(c))).length
    return n + (yo?.suelto && ids.includes(yo.unidadId) ? 1 : 0)
  }

  /* Lo que el aviso, el perfil y el chat necesitan de una persona del árbol. */
  const datosColega = f => {
    const c = f.cargo
    const jefeCargo = c.reportaA && org.cargos.find(x => x.id === c.reportaA)
    const jefe = jefeCargo && getPersona(ocupanteDe(jefeCargo))
    const equipo = filasDe(c.unidadId).filter(x => x.clave !== f.clave && (x.persona || x.soy))
    return {
      persona: f.persona, cargo: c, area: getUnidad(c.unidadId, org)?.nombre,
      sucursal: sucursales.find(x => x.id === c.sucursalIds?.[0])?.nombre,
      jefe: jefeCargo ? { nombre: jefe ? jefe.name : jefeCargo.nombre, vacante: !jefe } : null,
      equipo, companero: yo?.unidadId === c.unidadId,
    }
  }
  const [aviso, setAviso] = useState(null)
  const [vista, setVista] = useState(null)
  /* Lista o gráfico: el gráfico es el mismo dibujo que arma RR.HH. en Organización, solo para mirar.
     Se recuerda cuál usó la última vez. */
  const [modo, setModo] = useLocalStorage('organigramaCel', 'lista')
  // Los colores del dibujo son los que RR.HH. eligió en Organización.
  const [colorMarca] = useLocalStorage('organigramaColor', '#0C2D40')
  const arbolGrafico = useMemo(() => buildOrgTree('completo', org, { vacias: true }), [org])
  // Centrado en su cargo; si no ocupa ninguno, en la jefatura de su área.
  const enfoque = yo?.cargoId || (yo && cabezaDe(yo.unidadId, org)?.id) || null
  // En el dibujo de la web un cuadro se abre con doble clic; en el teléfono, con un toque.
  const tocarEnGrafico = e => {
    if (e.target.closest('button')) return
    const id = e.target.closest('[data-cargo]')?.getAttribute('data-cargo')
    const c = id && org.cargos.find(x => x.id === id)
    if (c) tocar(filaDeCargo(c))
  }
  const ir = v => { setAviso(null); setVista(v); document.querySelector('.phone-scroll')?.scrollTo(0, 0) }
  const tocar = f => (f.soy ? onMiPerfil?.() : f.cargo && setAviso(datosColega(f)))

  const ubicar = f => {
    setQ('')
    campo.current?.blur()
    const unidadId = f.cargo?.unidadId || yo?.unidadId
    setAbiertas(s => new Set([...s, ...cadenaHasta(unidadId, org)]))
    setMarcado(f.clave)
    // En el gráfico, quien no tiene cuadro propio se ubica en la jefatura de su área.
    setBuscado({ id: f.cargo?.id || cabezaDe(unidadId, org)?.id, vez: Date.now() })
  }
  useEffect(() => {
    if (!marcado || modo !== 'lista') return
    requestAnimationFrame(() => document.querySelector(`[data-fila="${marcado}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
  }, [marcado, modo])

  /* Buscar: personas y cargos de toda la empresa, en una lista plana con su área. */
  const palabra = normalizar(q.trim())
  const resultados = palabra ? org.cargos.map(filaDeCargo).map((f, i) => ({ ...f, linea: `${f.linea} · ${getUnidad(org.cargos[i].unidadId, org)?.nombre || ''}` }))
    .concat(yo?.suelto ? [{ clave: 'yo', foto: miFoto, nombre: currentUser.name, linea: `${currentUser.cargo} · ${getUnidad(yo.unidadId, org)?.nombre}`, soy: true }] : [])
    .filter(f => normalizar(`${f.nombre} ${f.linea}`).includes(palabra)) : []

  if (vista?.p === 'perfil') {
    return <PerfilColega colega={vista.colega} volverA="Organigrama" onVolver={() => ir(null)}
      onChat={() => ir({ p: 'chat', colega: vista.colega, desdePerfil: true })} onOtro={f => ir({ p: 'perfil', colega: datosColega(f) })} />
  }
  if (vista?.p === 'chat') {
    return <ChatColega colega={vista.colega} yo={currentUser?.name} onVolver={() => ir(vista.desdePerfil ? { p: 'perfil', colega: vista.colega } : null)} />
  }

  // La raíz también tiene gente propia además del gerente (asistencia, asesoría externa).
  const propiosRaiz = raiz ? filasDe(raiz.id).slice(1) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Poppins, sans-serif', color: C.texto }}>
      <BarraVolver texto={volverA} onVolver={onSalir} conTema />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '-2px 2px 0' }}>
        <span style={{ flex: 1, display: 'grid', minWidth: 0 }}>
          <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>Organigrama</b>
          <small style={{ fontSize: 8, color: C.mute }}>{empresa?.razonSocial || empresa?.nombre || 'La empresa'} · {areas.length} {areas.length === 1 ? 'área' : 'áreas'}</small>
        </span>
        {/* Lista o gráfico, en dos botones redondos: el encendido en navy, como la pestaña de abajo. */}
        {[['lista', List, 'Ver en lista'], ['grafico', Network, 'Ver el gráfico']].map(([k, Icono, t]) => (
          <button key={k} type="button" aria-label={t} title={t} aria-pressed={modo === k} onClick={() => setModo(k)} style={{
            width: 29, height: 29, borderRadius: '50%', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0, flexShrink: 0,
            background: modo === k ? '#0C2D40' : C.carta, color: modo === k ? '#fff' : C.texto, boxShadow: modo === k ? 'none' : C.sombra,
          }}><Icono size={12} strokeWidth={2.2} /></button>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
      <label style={{ height: 30, borderRadius: 99, background: C.carta, boxShadow: enfocado || q ? `0 0 0 1.4px ${C.texto}, ${C.sombra}` : C.sombra, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', cursor: 'text' }}>
        <Search size={12} strokeWidth={2.2} style={{ color: C.mute, flexShrink: 0 }} />
        <input ref={campo} value={q} onChange={e => setQ(e.target.value)} onFocus={() => setEnfocado(true)} onBlur={() => setEnfocado(false)}
          placeholder="Buscar a una persona, cargo o área" aria-label="Buscar en el organigrama" autoComplete="off"
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 9, color: C.texto }} />
        {q && (
          <button type="button" onClick={() => { setQ(''); campo.current?.focus() }} aria-label="Borrar lo escrito" style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', padding: 0, background: 'var(--in-linea)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <X size={8} strokeWidth={2.6} style={{ color: C.mute }} />
          </button>
        )}
      </label>
      {/* Los resultados caen sobre la lista o el gráfico, sin desarmarlos: así, al elegir, el dibujo ya
          está ahí para llevar hasta la persona. */}
      {palabra && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 36, zIndex: 20, maxHeight: 300, overflowY: 'auto', display: 'grid', gap: 4, padding: 6, borderRadius: 15, background: C.carta, boxShadow: '0 0 0 1px var(--in-linea), 0 18px 36px -12px rgba(12,45,64,.5)' }}>
          {resultados.length
            ? resultados.map(f => <Fila key={f.clave} fila={f} onTocar={ubicar} />)
            : <span style={{ fontSize: 8, color: C.mute, textAlign: 'center', padding: '12px 0' }}>Nadie coincide con «{q.trim()}».</span>}
        </div>
      )}
      </div>

      {!raiz ? (
        <span style={{ fontSize: 8, color: C.mute, textAlign: 'center', padding: '20px 0' }}>La empresa todavía no cargó su organigrama.</span>
      ) : modo === 'grafico' ? (
        <div className="og-page og-cel" style={{ '--og-marca': colorMarca, ...estiloColores(org) }} onClickCapture={tocarEnGrafico}>
          <OrgGrafico tree={arbolGrafico} org={org} telefono enfoque={enfoque} buscado={buscado} />
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 15, background: C.carta, boxShadow: C.sombra }}>
            {gerente ? <Cara persona={gerente} size={30} /> : <Vacio size={30} />}
            <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
              <b style={{ fontSize: 9.6, fontWeight: 600 }}>{gerente?.name || cabezaRaiz?.nombre || raiz.nombre}</b>
              <span style={{ fontSize: 7.2, color: C.mute }}>{cabezaRaiz ? `${cabezaRaiz.nombre} · ${raiz.nombre}` : raiz.nombre}</span>
            </span>
            {cabezaRaiz && !gerente && <em style={GRIS}>Por cubrir</em>}
          </div>
          <Colgando>
            {propiosRaiz.map(f => <Fila key={f.clave} fila={f} onTocar={tocar} marcada={marcado === f.clave} />)}
            {areas.map(a => <Rama key={a.id} id={a.id} org={org} abiertas={abiertas} alternar={alternar} filasDe={filasDe} miArea={miArea} cuenta={cuenta} onTocar={tocar} marcado={marcado} />)}
          </Colgando>
        </div>
      )}
      {aviso && <AvisoColega colega={aviso} onCerrar={() => setAviso(null)} onPerfil={() => ir({ p: 'perfil', colega: aviso })} onChat={() => ir({ p: 'chat', colega: aviso })} />}
    </div>
  )
}
