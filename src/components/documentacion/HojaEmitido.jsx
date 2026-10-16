import { FileText } from 'lucide-react'
import { useArchivoLocal } from '../../hooks/useArchivoLocal'
import PaginasPdf from './PaginasPdf'
import HojaDocumento from '../../pages/documentacion/HojaDocumento'
import { textoEmitido } from '../../pages/documentacion/emisionUtil'
import { useDocumentacion } from '../../context/DocumentacionContext'

/* LO QUE RECIBIÓ LA PERSONA, TAL COMO LE LLEGÓ. Lo que salió de una plantilla es su texto congelado
   (RN-16); un archivo propio que se envió —un reglamento en PDF— es ese archivo. Lo usan RR.HH. en
   Envíos y en el expediente, y el colaborador en Recibidos. */
export default function HojaEmitido({ emitido: e, compacta = true }) {
  const { modelos } = useDocumentacion()
  const url = useArchivoLocal(e.archivo?.clave || null)
  if (!e.archivo) return <HojaDocumento texto={textoEmitido(e, modelos)} compacta={compacta} />
  if (url) {
    const esPdf = e.archivo.formato === 'pdf' || e.archivo.tipoMime === 'application/pdf'
    return esPdf
      ? <PaginasPdf url={url} />
      : <img src={url} alt={e.nombre} style={{ maxWidth: '100%', borderRadius: 8 }} />
  }
  return (
    <div className="xc-hoja xc-hoja-compacta" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <FileText size={18} aria-hidden="true" />
      <span>{e.archivo.nombre} · el archivo está guardado en el navegador de quien lo envió.</span>
    </div>
  )
}
