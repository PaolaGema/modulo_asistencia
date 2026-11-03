import { useEffect, useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Columna } from './HoraCel'

/* LAS FECHAS DE «EDITAR PERFIL» (opción F2): tres ruedas, día, mes y año.
   El calendario de `FechaCel` sirve para fechas cercanas; una fecha de nacimiento está a treinta años
   y mes por mes son cientos de toques. Las ruedas son las mismas columnas de `HoraCel`, pegadas al
   campo en la misma tarjeta: arriba la fecha escrita entera y debajo las tres columnas. Si el mes
   elegido no tiene ese día (31 de febrero), el día baja al último del mes. Se confirma con «Listo»;
   tocar fuera cierra sin cambiar nada. Se guarda como 'AAAA-MM-DD', igual que antes. */

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const HOY = new Date()
const PRIMER_ANIO = 1940
// Hasta veinte años adelante: también hay vencimientos de documentos.
const ANIOS = Array.from({ length: HOY.getFullYear() + 20 - PRIMER_ANIO + 1 }, (_, i) => String(PRIMER_ANIO + i))
const diasDe = (a, m) => new Date(a, m + 1, 0).getDate()

const partir = v => {
  const x = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '')
  return x ? { a: +x[1], m: +x[2] - 1, d: +x[3] } : { a: HOY.getFullYear(), m: HOY.getMonth(), d: HOY.getDate() }
}
const dos = n => String(n).padStart(2, '0')

export default function FechaRueda({ valor, onCambio, estilo, titulo = 'Fecha' }) {
  const [abierto, setAbierto] = useState(false)
  const [f, setF] = useState(() => partir(valor))
  const caja = useRef(null)
  const pop = useRef(null)
  useEffect(() => { if (abierto) pop.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [abierto])

  useEffect(() => {
    if (!abierto) return
    const fuera = e => { if (caja.current && !caja.current.contains(e.target)) setAbierto(false) }
    const esc = e => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', fuera); document.removeEventListener('keydown', esc) }
  }, [abierto])

  const abrir = () => { setF(partir(valor)); setAbierto(x => !x) }
  const poner = cambio => setF(prev => {
    const n = { ...prev, ...cambio }
    return { ...n, d: Math.min(n.d, diasDe(n.a, n.m)) }
  })
  const dias = Array.from({ length: diasDe(f.a, f.m) }, (_, i) => String(i + 1))
  const iAnio = Math.max(0, f.a - PRIMER_ANIO)
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor || '')

  return (
    <div ref={caja} style={{ position: 'relative' }}>
      <button type="button" onClick={abrir} aria-haspopup="dialog" aria-expanded={abierto} aria-label={titulo}
        style={{ ...estilo, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
          color: p ? estilo?.color : 'var(--in-mute)',
          ...(abierto ? { background: 'var(--in-carta)', borderColor: '#00E091', boxShadow: '0 0 0 3px rgba(0,224,145,.16)' } : {}) }}>
        {p ? `${p[3]}/${p[2]}/${p[1]}` : 'dd/mm/aaaa'}
        <CalendarDays size={10} strokeWidth={2} style={{ color: abierto ? '#0A7F55' : 'var(--in-mute)' }} />
      </button>

      {abierto && (
        <div ref={pop} role="dialog" aria-label={`Elegir ${titulo.toLowerCase()}`} style={{
          position: 'absolute', left: -4, right: -4, top: 'calc(100% + 7px)', zIndex: 30, borderRadius: 16, overflow: 'hidden',
          background: 'var(--in-carta)', color: 'var(--in-texto)', boxShadow: '0 0 0 1px var(--in-linea), 0 18px 36px -12px rgba(12,45,64,.5)',
        }}>
          <div style={{ position: 'relative', overflow: 'hidden', padding: '9px 12px', borderBottom: '1px solid var(--in-linea)' }}>
            <i aria-hidden="true" style={{ position: 'absolute', width: 90, height: 90, right: -28, top: -42, borderRadius: '50%', background: 'rgba(0,224,145,.12)' }} />
            <i aria-hidden="true" style={{ position: 'absolute', width: 46, height: 46, right: 40, bottom: -30, borderRadius: '50%', background: 'rgba(0,224,145,.09)' }} />
            <span style={{ position: 'relative', display: 'block', fontSize: 6.8, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#0A7F55' }}>{titulo}</span>
            <b style={{ position: 'relative', display: 'block', fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{f.d} de {MESES[f.m]} de {f.a}</b>
          </div>

          <div style={{ padding: '8px 9px 9px', display: 'grid', gap: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Columna sinRotulo etiqueta="Día" ancho={44} valores={dias} elegido={f.d - 1} onElegir={i => poner({ d: i + 1 })} />
              <Columna sinRotulo etiqueta="Mes" ancho={92} valores={MESES} elegido={f.m} onElegir={i => poner({ m: i })} />
              <Columna sinRotulo etiqueta="Año" ancho={56} valores={ANIOS} elegido={iAnio} onElegir={i => poner({ a: PRIMER_ANIO + i })} />
            </div>
            <button type="button" onClick={() => { onCambio(`${f.a}-${dos(f.m + 1)}-${dos(f.d)}`); setAbierto(false) }} style={{
              height: 26, borderRadius: 99, border: 'none', background: '#00E091', color: '#0C2D40', fontFamily: 'inherit', fontSize: 8.4, fontWeight: 600, cursor: 'pointer',
            }}>Listo</button>
          </div>
        </div>
      )}
    </div>
  )
}
