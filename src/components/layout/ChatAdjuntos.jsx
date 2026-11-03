import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FileText, Paperclip, X } from 'lucide-react'

/* IMÁGENES Y DOCUMENTOS EN LOS CHATS. El clip del campo de escribir abre el selector del teléfono:
   una foto se achica (lado mayor 900 px) y va como imagen en la burbuja; un documento va como una
   tarjeta con su nombre y su peso, y se descarga al tocarlo. En esta demo todo se guarda en el
   navegador, así que un documento muy grande se manda solo con su nombre. */

const LADO = 900
const TOPE = 1.5 * 1024 * 1024
const DOCUMENTOS = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv'

const peso = b => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB`)
const comoTexto = file => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(file) })
const achicar = url => new Promise(res => {
  const img = new Image()
  img.onload = () => {
    const k = Math.min(1, LADO / Math.max(img.width, img.height))
    const c = document.createElement('canvas')
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
    res(c.toDataURL('image/jpeg', 0.8))
  }
  img.onerror = () => res(null)
  img.src = url
})

/* El clip. `onAdjunto({ tipo: 'imagen' | 'documento', nombre, peso, url })`. */
export function BotonAdjuntar({ onAdjunto }) {
  const campo = useRef(null)
  const elegir = async e => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.type.startsWith('image/')) {
      const url = await achicar(await comoTexto(file))
      if (url) onAdjunto({ tipo: 'imagen', nombre: file.name, peso: peso(file.size), url })
      return
    }
    onAdjunto({ tipo: 'documento', nombre: file.name, peso: peso(file.size), url: file.size <= TOPE ? await comoTexto(file) : null })
  }
  return (
    <>
      <button type="button" onClick={() => campo.current?.click()} aria-label="Adjuntar una imagen o un documento" style={{
        width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'none', display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer', color: 'var(--in-mute)', flexShrink: 0,
      }}><Paperclip size={13} strokeWidth={2} /></button>
      <input ref={campo} type="file" accept={`image/*,${DOCUMENTOS}`} onChange={elegir} hidden />
    </>
  )
}

/* Lo adjunto, dentro de la burbuja. La imagen se abre grande al tocarla. */
export function Adjunto({ archivo, mio }) {
  const [grande, setGrande] = useState(false)
  const marco = typeof document !== 'undefined' ? document.getElementById('marco-telefono') : null
  if (archivo.tipo === 'imagen') {
    return (
      <>
        <button type="button" onClick={() => setGrande(true)} aria-label={`Ver ${archivo.nombre}`} style={{ border: 'none', padding: 0, background: 'none', cursor: 'zoom-in', display: 'block', margin: '-2px -6px 0' }}>
          <img src={archivo.url} alt={archivo.nombre} style={{ display: 'block', width: '100%', maxWidth: 170, maxHeight: 200, objectFit: 'cover', borderRadius: 10 }} />
        </button>
        {grande && marco && createPortal(
          <div onClick={() => setGrande(false)} style={{ position: 'absolute', inset: 0, zIndex: 45, background: 'rgba(5,20,30,.92)', display: 'grid', placeItems: 'center', padding: 14 }}>
            <button type="button" onClick={() => setGrande(false)} aria-label="Cerrar" style={{ position: 'absolute', top: 34, right: 14, width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.15)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0 }}><X size={12} /></button>
            <img src={archivo.url} alt={archivo.nombre} style={{ maxWidth: '100%', maxHeight: '80%', borderRadius: 8 }} />
          </div>, marco)}
      </>
    )
  }
  const Caja = archivo.url ? 'a' : 'span'
  return (
    <Caja {...(archivo.url ? { href: archivo.url, download: archivo.nombre } : {})} style={{
      display: 'flex', alignItems: 'center', gap: 7, minWidth: 150, padding: '6px 7px', margin: '0 -4px', borderRadius: 10, textDecoration: 'none', color: 'inherit',
      background: mio ? 'rgba(255,255,255,.12)' : 'var(--in-fondo)',
    }}>
      <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, display: 'grid', placeItems: 'center', background: mio ? '#00E091' : 'var(--in-ok-bg)', color: '#0C2D40' }}><FileText size={12} strokeWidth={2} /></span>
      <span style={{ flex: 1, minWidth: 0, display: 'grid' }}>
        <b style={{ fontSize: 7.8, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{archivo.nombre}</b>
        <small style={{ fontSize: 6.4, opacity: 0.7 }}>{archivo.peso}{archivo.nombre.includes('.') ? ` · ${archivo.nombre.split('.').pop().toUpperCase()}` : ''}</small>
      </span>
    </Caja>
  )
}
