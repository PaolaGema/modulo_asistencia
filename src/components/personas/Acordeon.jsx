import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

/* UNA SECCIÓN QUE SE PLIEGA.
   Las tarjetas del riel están siempre abiertas: son tres por paso y caben. Con las pestañas el
   formulario ocupa el ancho entero y los pasos largos —documentos son ocho campos de archivo—
   se vuelven una tirada de scroll donde se pierde de vista en qué sección se está. El acordeón
   deja ver el índice del paso de un golpe y abrir solo lo que toca.

   LA CABECERA DICE CUÁNTO LLEVA ESA SECCIÓN. Plegada, un título solo no distingue una sección
   terminada de una que nadie tocó, y entonces hay que abrir las cuatro para averiguarlo: el
   plegado ahorraría scroll a cambio de clics. Con «3 de 7» al costado, cerrado también informa.

   Y PLEGADA NO SE DESMONTA: los campos siguen en el árbol, escondidos. Sin eso, un desplegable
   abierto o un texto a medio escribir se perdían al plegar por accidente, y volver a abrir costaba
   un dibujo entero de nueve campos.

   SE ABRE Y SE CIERRA CON MOVIMIENTO (30 sep 2026, a pedido del equipo), el mismo del riel: el
   cuerpo crece o se encoge y su contenido aparece con un fundido. Cerrada queda `inert`, así que
   ni se ve ni la recorre el teclado — lo mismo que hacía `hidden`, pero dejando animar. */
export default function Acordeon({ titulo, desc, abierto, onAlternar, llenos, total, children }) {
  const llena = total > 0 && llenos >= total

  /* LA PASTILLA BRILLA UNA VEZ AL COMPLETARSE, y sólo al pasar de incompleta a completa: una
     sección que ya abre terminada no tiene nada que festejar. */
  const [brilla, setBrilla] = useState(false)
  const antes = useRef(llena)
  useEffect(() => {
    if (llena && !antes.current) {
      setBrilla(true)
      const t = setTimeout(() => setBrilla(false), 900)
      antes.current = llena
      return () => clearTimeout(t)
    }
    antes.current = llena
  }, [llena])

  return (
    <section className={`ac-caja${abierto ? ' on' : ''}`}>
      <button type="button" className="ac-cab" onClick={onAlternar} aria-expanded={abierto}>
        <ChevronDown size={14} className="ac-flecha" />
        <span className="ac-tit">{titulo}</span>
        {/* VERDE CUANDO ESTÁ COMPLETA, y no siempre: en esta pantalla el verde ya quiere decir
            «avance» —los aros del riel, la fila del paso puesto, «Nada impide crearla»— así que
            teñir la cuenta de verde pase lo que pase haría que el color deje de decir nada.
            Encendida sólo al llegar al total, el acordeón cerrado se vuelve un índice: pastilla
            verde es sección terminada, y se ve sin abrir ninguna. */}
        <span className={`ac-cuenta${llena ? ' llena' : ''}${brilla ? ' brilla' : ''}`}>
          {llenos} de {total}
        </span>
      </button>
      <div className={`ac-anim${abierto ? ' on' : ''}`} inert={!abierto}>
        <div className="ac-anim-dentro">
          <div className="ac-cuerpo">
            {desc && <p className="ac-desc">{desc}</p>}
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
