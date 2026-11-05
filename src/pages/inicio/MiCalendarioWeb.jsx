import CalendarioPhone from '../../components/layout/CalendarioPhone'

/* MI ESPACIO › MI CALENDARIO (opción A «El mes vivo», 5 nov 2026). El mismo calendario del teléfono —todo lo
   de la persona: lo que pidió, lo aprobado, feriados, eventos y cumpleaños—, con `zoom` como el Inicio web y
   en dos columnas: el mes a la izquierda, las fichas del día o del mes a la derecha. El calendario de toda la
   empresa sigue en Inicio › Calendario, que es lo administrativo. */
export default function MiCalendarioWeb() {
  return (
    <div className="content-scroll">
      <div style={{ zoom: 1.6, maxWidth: 720, margin: '0 auto' }}>
        <CalendarioPhone web />
      </div>
    </div>
  )
}
