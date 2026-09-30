import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Eye } from 'lucide-react'

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
/* ── LAS PARTES DE LA PESTAÑA ABIERTA, COMO UN ÍNDICE ────────────────────────────
   El diseño que mandó el equipo (30 sep 2026): las partes cuelgan debajo de su pestaña con su
   numeración —1.1, 1.2— y una guía vertical fina; la puesta va en un recuadro con borde verde.
   El avance de cada parte queda en el título, al pasar el ratón.

   `partes` llega sólo para la pestaña abierta y sólo si tiene más de una: una pestaña de una
   sola parte no tiene nada que desplegar. En el celular el riel se acuesta y las partes no caben
   colgadas: ahí se esconden y las enseña la barra de píldoras de arriba del contenido. */
/* SE ABRE Y SE CIERRA COMO UN GRUPO DEL MENÚ (30 sep 2026, a pedido del equipo): la pestaña con
   partes lleva una flechita, y tocarla estando abierta pliega o despliega sus partes sin moverse de
   la parte en la que se está. Tocar otra pestaña la abre, como siempre. `conPartes` dice qué
   pestañas tienen más de una parte, para dibujarles la flecha aunque no estén abiertas. */
export default function RielPasos({ pasos, actual, onIr, avance, pendientes, partes, onParte, conPartes }) {
  // Plegada es de la pestaña abierta: al cambiar de pestaña vuelve a verse desplegada.
  const [plegadaEn, setPlegadaEn] = useState(null)
  const plegada = plegadaEn === actual
  /* ACOSTADO, EL PASO PUESTO VA AL MEDIO. En pantallas angostas el riel es una tira con scroll y
     el paso elegido podía quedar pegado a un borde, o fuera de la vista: no se sabía dónde se
     estaba ni que había más pasos a los lados. Centrado, siempre asoman vecinos por los dos
     lados, y eso ya dice que la tira sigue.

     Se mueve la tira y no la página: `scrollIntoView` desplazaría también el formulario. De pie
     (escritorio) la tira no tiene scroll horizontal y esto no hace nada. */
  const riel = useRef(null)
  // Al entrar a la ficha el salto es seco: animarlo desde el paso 1 es un viaje que nadie pidió.
  const yaCentro = useRef(false)
  useEffect(() => {
    const centrar = suave => {
      const r = riel.current
      const b = r?.querySelector('.rp-paso.on')
      if (!r || !b || r.scrollWidth <= r.clientWidth) return
      const caja = r.getBoundingClientRect()
      const paso = b.getBoundingClientRect()
      const quieto = !suave || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      r.scrollBy({ left: (paso.left + paso.width / 2) - (caja.left + caja.width / 2), behavior: quieto ? 'auto' : 'smooth' })
    }
    centrar(yaCentro.current)
    /* La primera vez se vuelve a centrar cuando llega la tipografía: con la de reserva los pasos
       miden otra cosa, y el centro calculado antes queda corrido. */
    if (!yaCentro.current) document.fonts?.ready.then(() => centrar(false))
    yaCentro.current = true
  }, [actual])

  return (
    <nav className="rp-riel" aria-label="Pasos de la ficha" ref={riel}>
      {pasos.map(p => {
        const puesto = p.key === actual
        /* La vista previa no tiene aro: no es un paso que se llene, así que no hay nada que
           medirle. Llega como `undefined` desde el avance y eso alcanza para dejarlo liso. */
        const t = avance?.[p.key]
        const debe = pendientes?.has(p.key)
        const tienePartes = !!conPartes?.has(p.key)
        const abierta = puesto && !plegada
        // Las partes de la pestaña puesta se dibujan siempre, abiertas o no, para poder animar el cierre.
        const colgadas = puesto && partes?.length > 1
        return (
          <div key={p.key} className="rp-grupo">
          <button
            type="button"
            className={`rp-paso${puesto ? ' on' : ''}${p.n ? '' : ' rp-previa'}`}
            aria-current={puesto ? 'step' : undefined}
            aria-expanded={tienePartes ? abierta : undefined}
            onClick={() => (puesto && tienePartes ? setPlegadaEn(plegada ? null : actual) : onIr(p.key))}
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
            {tienePartes && <ChevronRight className={`rp-chev${abierta ? ' abierto' : ''}`} size={14} strokeWidth={2.5} aria-hidden="true" />}
          </button>
          {colgadas && (
            /* LA CAJA CRECE Y SE ENCOGE, y las partes entran de a una. Cerrada queda `inert`: no se
               ve, no se pulsa y el tabulador la salta. */
            <div className={`rp-subs-caja${abierta ? ' abierta' : ''}`} inert={!abierta}>
            <div className="rp-subs-dentro">
            <div className="rp-subs" role="group" aria-label={`Partes de ${p.titulo}`}>
              {partes.map((x, j) => (
                <button
                  key={x.key}
                  type="button"
                  className={`rp-sub${x.on ? ' on' : ''}`}
                  style={{ '--i': j }}
                  aria-current={x.on ? 'step' : undefined}
                  onClick={() => onParte(x.key)}
                  title={x.total ? `${x.puestos} de ${x.total} campos · ${x.pct}%` : undefined}
                >
                  <span className="rp-sub-num">{p.n}.{j + 1}</span>
                  <span className="rp-sub-nom">
                    {x.titulo}
                    {x.debe && <i className="rp-punto" aria-label="Falta un dato del mínimo legal" />}
                  </span>
                </button>
              ))}
            </div>
            </div>
            </div>
          )}
          </div>
        )
      })}
    </nav>
  )
}
