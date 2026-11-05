import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'

/* LA HORA DEL TELÉFONO (opción Q1), hermana de `FechaCel`.
   El `<input type="time">` abre el reloj del sistema, distinto en cada teléfono y nada parecido a la app.
   Este se abre pegado al campo, en la misma tarjeta que el calendario: arriba la hora en grande y debajo
   dos columnas —horas y minutos— que se deslizan con el dedo; lo que queda al centro, en la píldora navy.
   Cualquier minuto se alcanza (08:47), y los atajos («08:30 · su entrada», «Ahora») ponen la hora de un
   toque. Se confirma con «Listo»; tocar fuera cierra sin cambiar nada. */

const ALTO = 22           // alto de cada número; la columna muestra cinco
const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTOS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const partir = v => { const m = /^(\d{1,2}):(\d{2})$/.exec(v || ''); return m ? [+m[1], +m[2]] : [9, 0] }
const ahoraHHMM = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }

export function Columna({ valores, elegido, onElegir, etiqueta, ancho = 62, sinRotulo }) {
  const ref = useRef(null)
  const quieto = useRef(null)
  // Al abrir y al usar un atajo, la columna se pone en el número elegido.
  useLayoutEffect(() => {
    const el = ref.current
    if (el && Math.round(el.scrollTop / ALTO) !== elegido) el.scrollTop = elegido * ALTO
  }, [elegido])
  const alDeslizar = () => {
    clearTimeout(quieto.current)
    quieto.current = setTimeout(() => {
      const i = Math.max(0, Math.min(valores.length - 1, Math.round(ref.current.scrollTop / ALTO)))
      if (i !== elegido) onElegir(i)
    }, 80)
  }
  useEffect(() => () => clearTimeout(quieto.current), [])
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 3 }}>
      {!sinRotulo && <small style={{ fontSize: 6.6, color: 'var(--in-mute)' }}>{etiqueta}</small>}
      <div style={{ position: 'relative', width: ancho, height: ALTO * 5 }}>
        <i aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: ALTO * 2, height: ALTO, borderRadius: 99, background: 'var(--in-vac-punta)' }} />
        <div ref={ref} onScroll={alDeslizar} role="listbox" aria-label={etiqueta}
          style={{
            position: 'relative', height: '100%', overflowY: 'auto', scrollSnapType: 'y mandatory', scrollbarWidth: 'none',
            WebkitMaskImage: 'linear-gradient(transparent, #000 28%, #000 72%, transparent)', maskImage: 'linear-gradient(transparent, #000 28%, #000 72%, transparent)',
          }}>
          <div style={{ height: ALTO * 2 }} />
          {valores.map((v, i) => (
            <button key={i} type="button" role="option" aria-selected={i === elegido}
              onClick={() => { ref.current.scrollTo({ top: i * ALTO, behavior: 'smooth' }); onElegir(i) }}
              style={{
                display: 'grid', placeItems: 'center', width: '100%', height: ALTO, scrollSnapAlign: 'center', border: 'none', background: 'none', padding: 0,
                fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums', cursor: 'pointer',
                fontSize: i === elegido ? 11 : 9.4, fontWeight: i === elegido ? 700 : 500,
                color: i === elegido ? 'var(--in-vac-punta-txt)' : 'var(--in-mute)',
              }}>{v}</button>
          ))}
          <div style={{ height: ALTO * 2 }} />
        </div>
      </div>
    </div>
  )
}

/* `atajos`: [{ hora: '08:30', texto: 'su entrada' }]; `conAhora` suma «Ahora · 17:58».
   `alinear`: en un campo angosto (Desde / Hasta) la tarjeta se abre más ancha, hacia 'izq' o 'der'. */
export default function HoraCel({ valor, onCambio, estilo, ariaLabel, titulo = 'Hora', atajos = [], conAhora, alinear, abrirAlInicio = false, vacio = '--:--' }) {
  const [abierto, setAbierto] = useState(abrirAlInicio)
  const [h, setH] = useState(() => partir(valor)[0])
  const [m, setM] = useState(() => partir(valor)[1])
  const caja = useRef(null)
  const pop = useRef(null)
  // Si la tarjeta queda bajo el borde del teléfono, la pantalla baja lo justo para verla entera.
  useEffect(() => { if (abierto) pop.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [abierto])

  useEffect(() => {
    if (!abierto) return
    const fuera = e => { if (caja.current && !caja.current.contains(e.target)) setAbierto(false) }
    const esc = e => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', fuera); document.removeEventListener('keydown', esc) }
  }, [abierto])

  const abrir = () => { const [a, b] = partir(valor); setH(a); setM(b); setAbierto(x => !x) }
  const poner = t => { const [a, b] = partir(t); setH(a); setM(b) }
  const borrador = `${HORAS[h]}:${MINUTOS[m]}`
  const todos = [...atajos, ...(conAhora ? [{ hora: ahoraHHMM(), texto: 'Ahora' }] : [])]
  const lado = alinear === 'der' ? { right: -4, width: 228 } : alinear === 'izq' ? { left: -4, width: 228 } : { left: -4, right: -4 }

  return (
    <div ref={caja} style={{ position: 'relative' }}>
      <button type="button" onClick={abrir} aria-haspopup="dialog" aria-expanded={abierto} aria-label={ariaLabel}
        style={{ ...estilo, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
          ...(abierto ? { background: 'var(--in-carta)', boxShadow: 'inset 0 0 0 1.5px #00E091, 0 0 0 3px rgba(0,224,145,.16)' } : {}) }}>
        {valor || vacio}
        <Clock size={11} strokeWidth={2} style={{ color: abierto ? '#0A7F55' : 'var(--in-mute)' }} />
      </button>

      {abierto && (
        <div ref={pop} role="dialog" aria-label={`Elegir ${titulo.toLowerCase()}`} style={{
          position: 'absolute', ...lado, top: 'calc(100% + 7px)', zIndex: 30, borderRadius: 16, overflow: 'hidden',
          background: 'var(--in-carta)', color: 'var(--in-texto)', boxShadow: '0 0 0 1px var(--in-linea), 0 18px 36px -12px rgba(12,45,64,.5)',
        }}>
          <div style={{ position: 'relative', overflow: 'hidden', padding: '9px 12px', borderBottom: '1px solid var(--in-linea)' }}>
            <i aria-hidden="true" style={{ position: 'absolute', width: 90, height: 90, right: -28, top: -42, borderRadius: '50%', background: 'rgba(0,224,145,.12)' }} />
            <i aria-hidden="true" style={{ position: 'absolute', width: 46, height: 46, right: 40, bottom: -30, borderRadius: '50%', background: 'rgba(0,224,145,.09)' }} />
            <span style={{ position: 'relative', display: 'block', fontSize: 6.8, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#0A7F55' }}>{titulo}</span>
            <b style={{ position: 'relative', display: 'block', fontSize: 22, fontWeight: 600, letterSpacing: '-.02em', lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>{borrador}</b>
          </div>

          <div style={{ padding: '8px 9px 9px', display: 'grid', gap: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              <Columna valores={HORAS} elegido={h} onElegir={setH} etiqueta="Hora" />
              <b style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>:</b>
              <Columna valores={MINUTOS} elegido={m} onElegir={setM} etiqueta="Minutos" />
            </div>
            {!!todos.length && (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5 }}>
                {todos.map(a => {
                  const puesta = a.hora === borrador
                  return (
                    <button key={a.texto} type="button" onClick={() => poner(a.hora)} style={{
                      height: 22, padding: '0 10px', borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 7.6, cursor: 'pointer',
                      fontWeight: puesta ? 600 : 500, color: puesta ? '#0A7F55' : 'var(--in-texto)',
                      background: puesta ? 'var(--in-ok-bg)' : 'var(--in-fondo)', boxShadow: puesta ? 'inset 0 0 0 1.4px #00E091' : 'none',
                    }}>{a.texto === 'Ahora' ? `Ahora · ${a.hora}` : `${a.hora} · ${a.texto}`}</button>
                  )
                })}
              </div>
            )}
            <button type="button" onClick={() => { onCambio(borrador); setAbierto(false) }} style={{
              height: 26, borderRadius: 99, border: 'none', background: '#00E091', color: '#0C2D40', fontFamily: 'inherit', fontSize: 8.4, fontWeight: 600, cursor: 'pointer',
            }}>Listo</button>
          </div>
        </div>
      )}
    </div>
  )
}
