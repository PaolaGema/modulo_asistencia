/* ── LA HOJA: EL DOCUMENTO COMO VA A SALIR ────────────────────────────────
   La vista previa se dibuja como papel —claro también en modo oscuro— porque lo que se revisa
   es el documento final, no un formulario (RF-45). Lo que quedó sin rellenar se marca en la
   misma hoja, en el sitio exacto donde falta: una variable que no existe o que no tiene dato
   para esta persona se ve como `{{…}}` resaltado, que es lo que llegaría al colaborador. */
export default function HojaDocumento({ texto, compacta = false, etiqueta }) {
  const partes = String(texto || '').split(/(\{\{[^}]*\}\})/g)
  return (
    <div className={`xc-hoja${compacta ? ' xc-hoja-compacta' : ''}`} aria-label={etiqueta || 'Vista previa del documento'}>
      {partes.map((p, i) => (/^\{\{[^}]*\}\}$/.test(p)
        ? <mark key={i} className="xc-hueco" title="Este dato no se pudo rellenar">{p}</mark>
        : <span key={i}>{p}</span>))}
    </div>
  )
}
