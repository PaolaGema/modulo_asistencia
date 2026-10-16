import Bandeja from './Bandeja'
import './seguimiento.css'

/* ── SOLICITUDES (15 oct 2026) ────────────────────────────────────────────
   Lo que la gente le pide a RR.HH. —certificados, copias del contrato, correcciones— en su propia
   entrada del menú, con su número. Vivía como pestaña de «Envíos», pero es trabajo con plazo, no un
   registro: va aparte, igual que el colaborador las ve aparte en Zona HR › Mis solicitudes.
   Atender una suele terminar en un documento emitido, que queda en «Documentos emitidos». */
export default function Solicitudes() {
  return (
    <div className="content-scroll">
      <Bandeja />
    </div>
  )
}
