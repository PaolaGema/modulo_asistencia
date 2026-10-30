import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

/* EL CALENDARIO DEL TELÉFONO (opción P2 sin la franja navy).
   Un `<input type="date">` abre el calendario del sistema, que no se parece en nada al resto de la app.
   Este se abre pegado al campo, en una tarjeta con borde: arriba dice en grande el día elegido (con los
   círculos menta de la tarjeta destacada) y debajo va el mes con las piezas del calendario de vacación:
   hoy con aro menta, el elegido en navy, fuera de rango apagado. Tocar un día lo elige y cierra.
   El campo se queda como estaba («30/10/2026»), con un aro menta mientras está abierto. */

const DIAS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// 'AAAA-MM-DD' se parte a mano: `new Date(cadena)` lo lee como UTC y en Bolivia da el día anterior.
const partes = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? { a: +m[1], m: +m[2] - 1, d: +m[3] } : null }
const cadena = (a, m, d) => `${a}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
const hoyCadena = () => { const h = new Date(); return cadena(h.getFullYear(), h.getMonth(), h.getDate()) }

export default function FechaCel({ valor, onCambio, min, max, hoy = hoyCadena(), estilo, ariaLabel }) {
  const elegida = partes(valor)
  const [abierto, setAbierto] = useState(false)
  const [cursor, setCursor] = useState(() => ({ a: (elegida || partes(hoy)).a, m: (elegida || partes(hoy)).m }))
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

  const abrir = () => {
    const base = elegida || partes(hoy)
    setCursor({ a: base.a, m: base.m })
    setAbierto(a => !a)
  }
  const mover = paso => setCursor(c => { const t = c.m + paso; return { a: c.a + Math.floor(t / 12), m: ((t % 12) + 12) % 12 } })
  const fuera = s => (min && s < min) || (max && s > max)
  // Las flechas no llevan a un mes que no tiene ningún día para elegir.
  const ultimo = cadena(cursor.a, cursor.m, new Date(cursor.a, cursor.m + 1, 0).getDate())
  const primero = cadena(cursor.a, cursor.m, 1)
  const sinAntes = !!min && primero <= min
  const sinDespues = !!max && ultimo >= max

  const desplaz = (new Date(cursor.a, cursor.m, 1).getDay() + 6) % 7
  const nDias = new Date(cursor.a, cursor.m + 1, 0).getDate()
  const celdas = [...Array(desplaz).fill(null), ...Array.from({ length: nDias }, (_, i) => i + 1)]
  const titulo = elegida ? `${SEMANA[new Date(elegida.a, elegida.m, elegida.d).getDay()]} ${elegida.d} de ${MESES[elegida.m]}` : 'Elija un día'

  const flecha = off => ({ width: 22, height: 22, display: 'grid', placeItems: 'center', border: 'none', borderRadius: '50%', background: 'none', color: 'var(--in-texto)', opacity: off ? 0.2 : 0.6, cursor: off ? 'default' : 'pointer', padding: 0 })

  return (
    <div ref={caja} style={{ position: 'relative' }}>
      <button type="button" onClick={abrir} aria-haspopup="dialog" aria-expanded={abierto} aria-label={ariaLabel}
        style={{ ...estilo, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
          ...(abierto ? { background: 'var(--in-carta)', boxShadow: 'inset 0 0 0 1.5px #00E091, 0 0 0 3px rgba(0,224,145,.16)' } : {}) }}>
        {elegida ? `${String(elegida.d).padStart(2, '0')}/${String(elegida.m + 1).padStart(2, '0')}/${elegida.a}` : 'Elegir'}
        <CalendarDays size={11} strokeWidth={2} style={{ color: abierto ? '#0A7F55' : 'var(--in-mute)' }} />
      </button>

      {abierto && (
        <div ref={pop} role="dialog" aria-label="Elegir el día" style={{
          position: 'absolute', left: -4, right: -4, top: 'calc(100% + 7px)', zIndex: 30, borderRadius: 16, overflow: 'hidden',
          background: 'var(--in-carta)', color: 'var(--in-texto)', boxShadow: '0 0 0 1px var(--in-linea), 0 18px 36px -12px rgba(12,45,64,.5)',
        }}>
          {/* Arriba, lo elegido en grande, sobre blanco con los círculos menta de la tarjeta destacada. */}
          <div style={{ position: 'relative', overflow: 'hidden', padding: '9px 12px 9px', borderBottom: '1px solid var(--in-linea)' }}>
            <i aria-hidden="true" style={{ position: 'absolute', width: 90, height: 90, right: -28, top: -42, borderRadius: '50%', background: 'rgba(0,224,145,.12)' }} />
            <i aria-hidden="true" style={{ position: 'absolute', width: 46, height: 46, right: 40, bottom: -30, borderRadius: '50%', background: 'rgba(0,224,145,.09)' }} />
            <span style={{ position: 'relative', display: 'block', fontSize: 6.8, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#0A7F55' }}>{elegida ? elegida.a : 'Día'}</span>
            <b style={{ position: 'relative', display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '-.01em' }}>{titulo}</b>
          </div>

          <div style={{ padding: '7px 9px 9px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <button type="button" aria-label="Mes anterior" disabled={sinAntes} onClick={() => mover(-1)} style={flecha(sinAntes)}><ChevronLeft size={12} /></button>
              <b style={{ fontSize: 10.4, fontWeight: 700, letterSpacing: '-.02em' }}>
                {MESES[cursor.m][0].toUpperCase() + MESES[cursor.m].slice(1)} <span style={{ fontWeight: 400, opacity: 0.45 }}>{cursor.a}</span>
              </b>
              <button type="button" aria-label="Mes siguiente" disabled={sinDespues} onClick={() => mover(1)} style={flecha(sinDespues)}><ChevronRight size={12} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 3, textAlign: 'center' }}>
              {DIAS.map(d => <span key={d} style={{ fontSize: 6.8, fontWeight: 600, letterSpacing: '.06em', opacity: 0.45, paddingBottom: 2 }}>{d}</span>)}
              {celdas.map((d, i) => {
                if (!d) return <span key={`v${i}`} />
                const s = cadena(cursor.a, cursor.m, d)
                const off = fuera(s)
                const sel = s === valor
                const esHoy = s === hoy
                const finde = i % 7 >= 5
                return (
                  <button key={s} type="button" disabled={off} aria-pressed={sel} aria-label={`${d} de ${MESES[cursor.m]}`}
                    onClick={() => { onCambio(s); setAbierto(false) }}
                    style={{
                      width: 22, height: 22, margin: 'auto', borderRadius: '50%', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 8.4,
                      fontVariantNumeric: 'tabular-nums', fontWeight: sel ? 700 : esHoy ? 600 : 400, cursor: off ? 'default' : 'pointer',
                      background: sel ? 'var(--in-vac-punta)' : 'transparent', color: sel ? 'var(--in-vac-punta-txt)' : 'var(--in-texto)',
                      boxShadow: sel ? 'var(--in-vac-punta-sombra)' : esHoy ? 'inset 0 0 0 1.5px #00E091' : 'none',
                      opacity: sel ? 1 : off ? 0.22 : finde ? 0.5 : 1,
                    }}>{d}</button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
