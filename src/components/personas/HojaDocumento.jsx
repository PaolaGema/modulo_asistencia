import { useState } from 'react'
import { avatarUrl } from '../../utils/calendarEvents'

/* LA VISTA PREVIA DE UN DOCUMENTO DE MI FICHA.
   En la demo no hay archivos subidos de verdad —Carlos y María traen sólo el nombre del archivo—,
   así que la hoja se arma con lo que se sabe del documento: su nombre, de quién es, cuándo se
   emitió y cuándo vence. La foto sí se ve como foto. En el producto, aquí va el archivo real
   (el PDF o la imagen que subió RR.HH.); lo que no cambia es el marco: la hoja, sus datos al
   lado y los botones de ver y descargar.

   LA HOJA ES BLANCA EN LOS DOS TEMAS: es un papel, y un papel no se vuelve oscuro.
   `chico` la dibuja a la escala del teléfono. */
export default function HojaDocumento({ doc, titular, chico = false }) {
  const [sinFoto, setSinFoto] = useState(false)
  const t = n => (chico ? n * 0.55 : n)
  const esFoto = /\.(jpe?g|png|webp)$/i.test(doc.archivo)

  if (esFoto) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: t(16) }}>
        {sinFoto ? (
          <div style={{ width: t(240), height: t(300), borderRadius: t(8), background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: t(13) }}>
            {doc.archivo}
          </div>
        ) : (
          <img src={avatarUrl(titular, 480)} alt={`Fotografía de ${titular}`} onError={() => setSinFoto(true)}
            style={{ width: t(240), height: t(300), objectFit: 'cover', borderRadius: t(8), boxShadow: '0 6px 20px rgba(12,45,64,.18)' }} />
        )}
      </div>
    )
  }

  const titulo = doc.nombre.split(' · ').pop()
  const linea = (w, alto = 7) => <div style={{ height: t(alto), width: w, borderRadius: 99, background: '#e5e9ef', marginTop: t(9) }} />
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: t(16) }}>
      <div style={{
        width: '100%', maxWidth: t(420), aspectRatio: '1 / 1.3', background: '#fff', color: '#0C2D40',
        borderRadius: t(6), boxShadow: '0 6px 24px rgba(12,45,64,.18)', padding: `${t(28)}px ${t(30)}px`,
        boxSizing: 'border-box', display: 'flex', flexDirection: 'column', fontFamily: 'Poppins, sans-serif',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e9ef', paddingBottom: t(10) }}>
          <span style={{ fontSize: t(11), fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>{doc.grupo}</span>
          <span style={{ width: t(26), height: t(26), borderRadius: '50%', border: `${t(2)}px solid #00A96B` }} />
        </div>
        <div style={{ fontSize: t(17), fontWeight: 700, marginTop: t(18), lineHeight: 1.25 }}>{titulo}</div>
        <div style={{ fontSize: t(12), color: '#475569', marginTop: t(6) }}>Titular: <b style={{ color: '#0C2D40' }}>{titular}</b></div>
        {linea('92%')}{linea('86%')}{linea('70%')}
        <div style={{ display: 'flex', gap: t(18), marginTop: t(18), fontSize: t(11), color: '#475569' }}>
          {doc.emite && <span>Emitido<br /><b style={{ color: '#0C2D40', fontSize: t(12) }}>{doc.emite}</b></span>}
          {doc.vence && <span>Vence<br /><b style={{ color: '#0C2D40', fontSize: t(12) }}>{doc.vence}</b></span>}
        </div>
        {linea('94%')}{linea('88%')}{linea('60%')}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ fontSize: t(10), color: '#94a3b8' }}>{doc.archivo}</span>
          <span style={{ width: t(90), borderTop: '1px solid #94a3b8', textAlign: 'center', fontSize: t(9), color: '#94a3b8', paddingTop: t(3) }}>Firma</span>
        </div>
      </div>
    </div>
  )
}
