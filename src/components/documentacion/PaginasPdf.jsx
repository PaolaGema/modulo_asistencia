import { useEffect, useRef, useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import urlDelTrabajador from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = urlDelTrabajador

/* ── EL PDF DIBUJADO POR LA PROPIA PÁGINA ──────────────────────────────────
   Se mostraba en un <iframe> con el visor del navegador, y el visor falla justo donde más se
   usa: dentro de una ventana (Chrome y Edge lo dejaban en gris) y en el iPhone, que no muestra un
   PDF incrustado. Con pdf.js —el lector de Firefox— cada página se dibuja en un lienzo, igual en
   todos los navegadores y en el celular.

   `primera`: sólo la primera página, para la miniatura de la tarjeta. Sin ella, todas, una debajo
   de otra, para leer. Se dibujan al ancho de la caja y con la densidad de la pantalla, para que
   el texto no salga borroso. */
const MAX_PAGINAS = 40

export default function PaginasPdf({ url, primera = false, className = '' }) {
  const caja = useRef(null)
  const [estado, setEstado] = useState('cargando')
  const [paginas, setPaginas] = useState(0)

  useEffect(() => {
    if (!url || !caja.current) return
    let cancelado = false
    const destino = caja.current
    const tarea = getDocument(url)
    tarea.promise.then(async pdf => {
      if (cancelado) return
      destino.innerHTML = ''
      const total = primera ? 1 : Math.min(pdf.numPages, MAX_PAGINAS)
      setPaginas(pdf.numPages)
      for (let n = 1; n <= total; n++) {
        const pagina = await pdf.getPage(n)
        if (cancelado) return
        const base = pagina.getViewport({ scale: 1 })
        const ancho = destino.clientWidth || 300
        const densidad = window.devicePixelRatio || 1
        const vista = pagina.getViewport({ scale: (ancho / base.width) * densidad })
        const lienzo = document.createElement('canvas')
        lienzo.width = vista.width
        lienzo.height = vista.height
        lienzo.style.width = '100%'
        lienzo.setAttribute('aria-hidden', 'true')
        destino.appendChild(lienzo)
        await pagina.render({ canvasContext: lienzo.getContext('2d'), viewport: vista }).promise
      }
      if (!cancelado) setEstado('listo')
    }).catch(() => { if (!cancelado) setEstado('error') })
    return () => { cancelado = true; tarea.destroy() }
  }, [url, primera])

  return (
    <div className={`dc-pdf${primera ? ' dc-pdf-primera' : ''} ${className}`}>
      <div ref={caja} className="dc-pdf-paginas" />
      {estado === 'cargando' && <span className="dc-pdf-nota">Abriendo el PDF…</span>}
      {estado === 'error' && <span className="dc-pdf-nota">No se pudo mostrar este PDF. Descárguelo para abrirlo.</span>}
      {estado === 'listo' && !primera && paginas > MAX_PAGINAS && <span className="dc-pdf-nota">Se muestran las primeras {MAX_PAGINAS} de {paginas} páginas. Descárguelo para verlo entero.</span>}
    </div>
  )
}
