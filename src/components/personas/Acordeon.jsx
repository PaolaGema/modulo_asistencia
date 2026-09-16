import { ChevronDown } from 'lucide-react'

/* UNA SECCIÓN QUE SE PLIEGA.
   Las tarjetas del riel están siempre abiertas: son tres por paso y caben. Con las pestañas el
   formulario ocupa el ancho entero y los pasos largos —documentos son ocho campos de archivo—
   se vuelven una tirada de scroll donde se pierde de vista en qué sección se está. El acordeón
   deja ver el índice del paso de un golpe y abrir solo lo que toca.

   LA CABECERA DICE CUÁNTO LLEVA ESA SECCIÓN. Plegada, un título solo no distingue una sección
   terminada de una que nadie tocó, y entonces hay que abrir las cuatro para averiguarlo: el
   plegado ahorraría scroll a cambio de clics. Con «3 de 7» al costado, cerrado también informa.

   Y PLEGADA NO SE DESMONTA: los campos siguen en el árbol, escondidos con `hidden`. Sin eso, un
   desplegable abierto o un texto a medio escribir se perdían al plegar por accidente, y volver a
   abrir costaba un dibujo entero de nueve campos. */
export default function Acordeon({ titulo, desc, abierto, onAlternar, llenos, total, children }) {
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
        <span className={`ac-cuenta${total > 0 && llenos >= total ? ' llena' : ''}`}>
          {llenos} de {total}
        </span>
      </button>

      <div className="ac-cuerpo" hidden={!abierto}>
        {desc && <p className="ac-desc">{desc}</p>}
        {children}
      </div>
    </section>
  )
}
