import { Eye } from 'lucide-react'

/* EL RIEL DE LOS OCHO PASOS.
   Un formulario por pasos que no enseña los pasos es un formulario que se llena a ciegas: no se
   sabe cuánto falta, no se sabe qué viene, y no se puede volver al tercero sin pasar por el
   cuarto y el quinto. Acá están los nueve a la vista y todos se pueden pulsar.

   TODOS, DESDE EL PRIMER MOMENTO, y no solo los ya visitados. Esto no es un pago en línea donde
   el paso tres depende del dos: son ocho grupos de datos independientes, y quien tiene el
   contrato en la mano quiere ir al paso 4 sin inventarse antes una fecha de nacimiento. El
   único orden que existe es el de la lectura.

   EL NÚMERO ES EL MEDIDOR. El disco del orden ya ocupaba veintidós píxeles en cada fila sin
   decir nada más que «este es el cuarto»; ahora el aro que lo rodea dice además cuánto de ese
   paso está lleno. Es la pregunta que se hace alguien con doscientos campos por delante: no
   «cuánto de la ficha» sino «cuánto de cada parte», porque los papeles llegan de manos distintas
   —el contrato lo trae legal, el NUA lo da la Gestora, el haber lo pone RRHH— y lo que hace
   falta saber es a quién ir a pedirle algo.

   EL ARO SE COME AL TILDE, y está bien. El tilde decía «acá hay algo escrito» y no distinguía un
   paso con un campo de veinte llenos de uno terminado: un aro al 5% dice lo mismo y además dice
   cuánto. Dos señales para una sola pregunta, con una de ellas menos precisa, era una de más.

   Y SE COME TAMBIÉN LA BARRA DE TRES PÍXELES que estuvo acá un rato, debajo de la pista. Medía
   mejor —una barra horizontal siempre mide mejor que un arco— pero le costaba un renglón a cada
   una de las nueve filas, y el número exacto se puede leer en el título del paso.

   LA LÍNEA VIVE ACÁ Y NO EN EL ENCABEZADO. Hubo una versión con los ocho segmentos en una cinta
   arriba, y funcionaba, pero era un segundo mapa de lo mismo a cuarenta píxeles del primero: dos
   dibujos de los ocho pasos compitiendo por la misma mirada. El avance pertenece al sitio donde
   se navega, y navegar se navega acá.

   EL PUNTO ROJO ES OTRA COSA QUE EL ARO. El aro dice cuánto hay escrito; el punto dice que ahí
   falta algo que el Ministerio, la Caja o la Gestora exigen, y eso no se deduce del relleno:
   un paso puede estar al 90% y deber justo el campo que impide declarar a la persona. Es el
   mismo punto que usan las pestañas, porque dos señales distintas para lo mismo serían dos
   idiomas.

   Y NO HAY MARCA DE «COMPLETO». Un aro lleno es un aro lleno; un sello de terminado sobre un
   paso donde ningún campo es obligatorio sería una promesa que nadie puede cobrar. */
export default function RielPasos({ pasos, actual, onIr, avance, pendientes }) {
  return (
    <nav className="rp-riel" aria-label="Pasos de la ficha">
      {pasos.map(p => {
        const puesto = p.key === actual
        /* La vista previa no tiene aro: no es un paso que se llene, así que no hay nada que
           medirle. Llega como `undefined` desde el avance y eso alcanza para dejarlo liso. */
        const t = avance?.[p.key]
        const debe = pendientes?.has(p.key)
        return (
          <button
            key={p.key}
            type="button"
            className={`rp-paso${puesto ? ' on' : ''}${p.n ? '' : ' rp-previa'}`}
            aria-current={puesto ? 'step' : undefined}
            onClick={() => onIr(p.key)}
            /* El aro no lleva cifra —no cabe—, así que el número exacto vive acá, que es
               donde se lo busca en cuanto un paso llama la atención. */
            title={t ? `${t.puestos} de ${t.total} campos` + (pendientes?.has(p.key) ? ' · falta un dato del mínimo legal' : '') : undefined}
          >
            {/* La vista previa no lleva número porque no es un paso más que llenar: es los ocho
                leídos de corrido. El ojo lo dice sin tener que explicarlo. */}
            <span className="rp-aro">
              {/* El arco es un elemento aparte y recortado con una máscara, no un disco de
                  color con otro disco encima: el truco del disco obliga a que el círculo de
                  adentro sea del color exacto de la fila, y la fila cambia de color al pasar
                  el ratón y al estar puesta. Con la máscara, el centro es transparente de
                  verdad y el aro no se despega nunca del fondo que tenga debajo. */}
              {t && <i className="rp-arco" style={{ '--pct': `${t.pct}%` }} />}
              <b>{p.n ? p.n : <Eye size={12} />}</b>
            </span>
            <span className="rp-texto">
              <span className="rp-fila">
                <span className="rp-titulo">{p.titulo}</span>
                {debe && (
                  <i
                    className="rp-punto"
                    title="Falta un dato del mínimo legal"
                    aria-label="Falta un dato del mínimo legal"
                  />
                )}
              </span>
              <span className="rp-pista">{p.pista}</span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
