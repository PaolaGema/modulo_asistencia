import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search, Plus, FileText, Folder, ArrowLeft } from 'lucide-react'

/* ── «¿QUÉ DOCUMENTO ES?» ─────────────────────────────────────────────────
   Un desplegable hecho para esta pregunta, no el de la casa: la lista puede tener decenas de
   documentos y se lee mejor ordenada como el expediente —por carpeta, con su color— y con lo
   que a la persona le falta arriba de todo, que es lo más probable que se esté subiendo.

   Abajo, siempre a la vista, «Otro documento»: lo que no está en la lista se guarda con el nombre
   que se le escriba. Si lo buscado no aparece, ese texto ya pasa a ser el nombre.

   grupos: [{ clave, nombre, color: { osc, cla }, items: [{ id, nombre, falta }] }]
   faltan: [{ id, nombre, carpeta }] — lo que le falta, para la sección de arriba. */

const ALTO = 360
const ANCHO = 340
const sinTildes = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function SelectorDocumento({ grupos = [], faltan = [], otro = false, onElegir, onOtro, ariaLabel, placeholder = 'Elegir…' }) {
  const [abierto, setAbierto] = useState(false)
  const [busca, setBusca] = useState('')
  const [activo, setActivo] = useState(0)
  const [escribiendo, setEscribiendo] = useState(false)
  const [nombre, setNombre] = useState('')
  const [pos, setPos] = useState(null)
  const cajaRef = useRef(null)
  const botonRef = useRef(null)
  const listaRef = useRef(null)

  const escrito = busca.trim()
  /* Buscando, la lista se aplana: los resultados salen de carpetas distintas y la carpeta pasa a
     escribirse al lado de cada uno. Sin buscar, «Le falta» arriba y después carpeta por carpeta. */
  const secciones = useMemo(() => {
    if (escrito) {
      const q = sinTildes(escrito)
      const items = grupos.flatMap(g => g.items.filter(x => sinTildes(`${x.nombre} ${g.nombre}`).includes(q)).map(x => ({ ...x, carpeta: g.nombre, color: g.color })))
      return items.length ? [{ clave: '_res', items }] : []
    }
    return [
      ...(faltan.length ? [{ clave: '_faltan', nombre: 'Le falta', faltan: true, items: faltan.map(x => ({ ...x, falta: true })) }] : []),
      ...grupos.filter(g => g.items.length),
    ]
  }, [grupos, faltan, escrito])
  const planos = secciones.flatMap(s => s.items.map(x => ({ ...x, _clave: `${s.clave}-${x.id}` })))

  const medir = () => {
    const c = botonRef.current?.getBoundingClientRect()
    if (!c) return null
    const arriba = c.bottom + ALTO > window.innerHeight && c.top > ALTO
    const left = Math.max(8, Math.min(c.left, window.innerWidth - ANCHO - 8))
    return arriba ? { left, bottom: window.innerHeight - c.top + 6, arriba } : { left, top: c.bottom + 6 }
  }

  useEffect(() => {
    if (!abierto) return
    const fuera = e => { if (cajaRef.current && !cajaRef.current.contains(e.target)) setAbierto(false) }
    const seguir = e => {
      if (e.type === 'scroll' && listaRef.current?.contains(e.target)) return
      const c = botonRef.current?.getBoundingClientRect()
      if (!c || c.bottom < 0 || c.top > window.innerHeight) { setAbierto(false); return }
      setPos(medir())
    }
    document.addEventListener('mousedown', fuera)
    window.addEventListener('scroll', seguir, true)
    window.addEventListener('resize', seguir)
    return () => {
      document.removeEventListener('mousedown', fuera)
      window.removeEventListener('scroll', seguir, true)
      window.removeEventListener('resize', seguir)
    }
  }, [abierto])

  useEffect(() => {
    if (abierto) listaRef.current?.querySelector('[data-activo="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activo, abierto])

  const abrir = () => { setBusca(''); setActivo(0); setEscribiendo(false); setNombre(''); setPos(medir()); setAbierto(true) }
  const cerrar = () => { setAbierto(false); botonRef.current?.focus() }
  const elegir = id => { setAbierto(false); onElegir(id) }
  /* «Otro» toma lo que se buscó como punto de partida: quien escribió «constancia» y no la
     encontró, ya escribió el nombre. */
  const pasarAOtro = () => { setNombre(escrito); setEscribiendo(true) }
  const guardarOtro = () => { if (nombre.trim()) { setAbierto(false); onOtro(nombre.trim()) } }

  const teclas = e => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (escribiendo) setEscribiendo(false); else cerrar(); return }
    if (escribiendo) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const n = planos.length
      if (n) setActivo(i => (i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n)
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (planos[activo]) elegir(planos[activo].id)
      else if (otro && escrito) pasarAOtro()
    }
  }

  let indice = -1
  return (
    <div className="xs-sel" ref={cajaRef}>
      <button
        ref={botonRef}
        type="button"
        className={`pl-dropdown-trigger placeholder${abierto ? ' open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={ariaLabel}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        onKeyDown={e => { if (!abierto && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrir() } }}
      >
        <span>{placeholder}</span>
        <ChevronDown size={15} className="pl-dropdown-chevron" />
      </button>

      {abierto && pos && (
        <div className={`xs-sel-panel${pos.arriba ? ' arriba' : ''}`} style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: ANCHO }} onKeyDown={teclas}>
          {escribiendo ? (
            <form className="xs-sel-otro" onSubmit={e => { e.preventDefault(); guardarOtro() }}>
              <button type="button" className="xs-sel-volver" onClick={() => setEscribiendo(false)}><ArrowLeft size={14} /> Volver a la lista</button>
              <label className="xs-sel-otro-tit" htmlFor="xs-sel-nombre">Nombre del documento</label>
              <input id="xs-sel-nombre" className="xs-sel-input" autoFocus value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej.: Constancia de trabajo anterior" maxLength={80} />
              <span className="xs-sel-ayuda">Se guarda en «Documentos agregados» con este nombre.</span>
              <button type="submit" className="xs-sel-guardar" disabled={!nombre.trim()}>Guardar</button>
            </form>
          ) : (
            <>
              <div className="xs-sel-buscar">
                <Search size={14} aria-hidden="true" />
                <input autoFocus value={busca} onChange={e => { setBusca(e.target.value); setActivo(0) }} placeholder="Buscar documento…" aria-label="Buscar documento" />
              </div>

              <div className="xs-sel-lista" ref={listaRef} role="listbox" aria-label={ariaLabel}>
                {secciones.map(s => (
                  <div key={s.clave} className="xs-sel-grupo" role="group" aria-label={s.nombre || 'Resultados'}>
                    {s.nombre && (
                      <span className={`xs-sel-grupo-tit${s.faltan ? ' falta' : ''}`}>
                        {s.faltan ? <span className="xs-sel-punto" /> : <Folder size={13} style={{ color: s.color?.osc }} aria-hidden="true" />}
                        {s.nombre}
                      </span>
                    )}
                    {s.items.map(x => {
                      indice += 1
                      const i = indice
                      return (
                        <button
                          key={`${s.clave}-${x.id}`}
                          type="button"
                          role="option"
                          aria-selected={false}
                          data-activo={i === activo}
                          className={`xs-sel-op${i === activo ? ' activo' : ''}`}
                          onMouseEnter={() => setActivo(i)}
                          onClick={() => elegir(x.id)}
                        >
                          <FileText size={15} className="xs-sel-ico" style={{ color: (x.color || s.color)?.osc }} aria-hidden="true" />
                          <span className="xs-sel-txt">
                            <span>{x.nombre}</span>
                            {(x.carpeta) && <span className="xs-sel-sub">{x.carpeta}</span>}
                          </span>
                          {x.falta && !s.faltan && <span className="xs-sel-falta">Le falta</span>}
                        </button>
                      )
                    })}
                  </div>
                ))}
                {!secciones.length && <p className="xs-sel-nada">No hay ningún documento «{escrito}» en la lista.</p>}
              </div>

              {otro && (
                <button type="button" className="xs-sel-pie" onClick={pasarAOtro}>
                  <span className="xs-sel-mas"><Plus size={14} /></span>
                  <span className="xs-sel-txt">
                    <span>{escrito && !planos.length ? `Guardar «${escrito}» como otro documento` : 'Otro documento'}</span>
                    <span className="xs-sel-sub">No está en la lista: escriba su nombre</span>
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
