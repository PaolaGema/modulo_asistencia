import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ScanFace, Coffee, LogOut, X } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { aMin, hhmm, duracion } from '../../data/asistenciaData'

/* ── LOS AVISOS DE MARCAR, COMO NOTIFICACIÓN DEL TELÉFONO ──
   Bajan desde arriba del teléfono de la demo cuando toca marcar:
   · 10 min antes de la entrada, si todavía no marcó;
   · pasada la tolerancia, si sigue sin marcar la entrada;
   · 5 min antes de que termine la pausa, y si ya se pasó;
   · a la hora de salida, si sigue trabajando sin marcarla.
   Cada aviso sale una vez por día. Tocarlo lleva al inicio, donde está el botón de marcar.

   En la demo no se puede esperar a la hora real: `probar` (el botón junto al teléfono) muestra el
   aviso que corresponde a cómo está la jornada ahora. */

// eslint-disable-next-line react-refresh/only-export-components
export function avisoDelMomento(at, { forzar = false } = {}) {
  const yo = at.yo
  const h = yo.horario
  if (!yo.asig || !h) return null
  const j = at.jornadaDe(yo, at.hoy)
  const t = new Date()
  const ahora = t.getHours() * 60 + t.getMinutes()
  const lugar = yo.lugar?.nombre || 'su lugar de trabajo'
  const fijo = h.modo === 'fijo'
  const ent = fijo ? aMin(h.entrada) : null
  const sal = fijo ? aMin(h.salida) : null
  const tol = yo.politica?.tolerancia ?? 10

  if (j.salida != null) return forzar ? { id: 'listo', icono: LogOut, titulo: 'Su jornada ya está cerrada', texto: `Salió a las ${hhmm(j.salida)}. ¡Que descanse!` } : null
  if (j.entrada == null) {
    if (fijo && ahora >= ent + tol && ahora < sal) return { id: 'sin-entrada', icono: ScanFace, titulo: 'Aún no marca su entrada', texto: `Su turno empezó a las ${h.entrada}. Marque al llegar a ${lugar}.`, urgente: true }
    if (forzar || (fijo && ahora >= ent - 10 && ahora < ent + tol)) return { id: 'entrada', icono: ScanFace, titulo: fijo ? `Su turno empieza a las ${h.entrada}` : 'Es hora de empezar su jornada', texto: `No olvide marcar su entrada al llegar a ${lugar}.` }
    return null
  }
  if (j.enPausa) {
    const ini = [...j.marcas].reverse().find(m => m.tipo === 'pausa_inicio' && !m.anulada && !m.rechazada)
    const fin = ini && h.pausa ? ini.min + h.pausa : null
    if (fin != null && ahora > fin) return { id: 'pausa-pasada', icono: Coffee, titulo: `Se pasó ${duracion(ahora - fin)} de su pausa`, texto: 'Marque su vuelta cuanto antes.', urgente: true }
    if (forzar || (fin != null && ahora >= fin - 5)) return { id: 'pausa-fin', icono: Coffee, titulo: fin != null ? `Su pausa termina a las ${hhmm(fin)}` : 'Vuelva de su pausa', texto: 'Recuerde marcar su vuelta.' }
    return null
  }
  if (forzar || (fijo && ahora >= sal)) return { id: 'salida', icono: LogOut, titulo: fijo && ahora >= sal ? 'Ya es su hora de salida' : `Su salida es a las ${h.salida}`, texto: 'No olvide marcar su salida antes de irse.' }
  return null
}

export default function AvisoPhone({ aviso, onAbrir, onCerrar }) {
  const marco = typeof document !== 'undefined' ? document.getElementById('marco-telefono') : null
  if (!aviso || !marco) return null
  const Icono = aviso.icono
  return createPortal(
    <div role="status" style={{ position: 'absolute', left: 8, right: 8, top: 8, zIndex: 60, animation: 'at-aviso-baja .35s cubic-bezier(.2,.9,.3,1.1)' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '9px 10px', boxShadow: '0 10px 24px -8px rgba(12,45,64,.45)', border: '1px solid rgba(12,45,64,.06)' }}>
        <button type="button" onClick={onAbrir} style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'flex-start', border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: '#0C2D40', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icono size={13} style={{ color: '#00E091' }} /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6.8, color: '#62788A', marginBottom: 1 }}><b style={{ fontWeight: 700, letterSpacing: '.04em' }}>SOULYHR · ASISTENCIA</b><span>ahora</span></span>
            <b style={{ display: 'block', fontSize: 9, color: aviso.urgente ? '#B3261E' : '#0C2D40', lineHeight: 1.3 }}>{aviso.titulo}</b>
            <span style={{ display: 'block', fontSize: 8, color: '#62788A', lineHeight: 1.35 }}>{aviso.texto}</span>
          </span>
        </button>
        <button type="button" onClick={onCerrar} aria-label="Descartar aviso" style={{ border: 'none', background: 'none', padding: 2, cursor: 'pointer', color: '#9AABBB' }}><X size={11} /></button>
      </div>
    </div>,
    marco,
  )
}

/* Revisa cada 30 s si toca avisar; cada aviso sale una vez por día. */
// eslint-disable-next-line react-refresh/only-export-components
export function useAvisosMarca(activo) {
  const at = useAsistencia()
  const [aviso, setAviso] = useState(null)
  const [vistos, setVistos] = useState([])
  useEffect(() => {
    if (!activo) return undefined
    const revisar = () => {
      const a = avisoDelMomento(at)
      if (a && !vistos.includes(`${at.hoy}|${a.id}`)) { setAviso(a); setVistos(v => [...v, `${at.hoy}|${a.id}`]) }
    }
    const t0 = setTimeout(revisar, 1500)
    const i = setInterval(revisar, 30000)
    return () => { clearTimeout(t0); clearInterval(i) }
  }, [activo, at, vistos])
  /* Se va solo a los 8 s, como en el teléfono. */
  useEffect(() => {
    if (!aviso) return undefined
    const t = setTimeout(() => setAviso(null), 8000)
    return () => clearTimeout(t)
  }, [aviso])
  return { aviso, cerrar: () => setAviso(null), probar: () => setAviso(avisoDelMomento(at, { forzar: true })) }
}
