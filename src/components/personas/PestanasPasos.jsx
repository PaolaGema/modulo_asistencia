import { Eye } from 'lucide-react'

/* LOS MISMOS NUEVE PASOS, ACOSTADOS.
   Es la otra manera de recorrer la ficha: una tira de pestañas encima del formulario en vez de
   una columna al costado. Comparte todo con el riel menos la forma —el mismo orden, los mismos
   nombres, los mismos saltos libres— porque la comparación solo sirve si lo único que cambia es
   lo que se está comparando.

   QUÉ GANA CONTRA EL RIEL: el formulario arranca en el borde izquierdo y ocupa la pantalla
   entera, así que los campos respiran y la rejilla de doce columnas se lee de verdad.
   QUÉ PIERDE: la pista de una línea debajo de cada paso —«Gestora, caja de salud y RC-IVA»— no
   entra en una pestaña, así que los nombres tienen que bastarse solos.

   EL PUNTO ROJO ES OTRA COSA QUE EL TILDE DEL RIEL. El tilde dice «acá hay algo escrito»; el
   punto dice «acá falta algo que impide crear la ficha», que es lo único que hay que ir a
   buscar sí o sí. Con las pestañas no se ven las pistas, así que el aviso tiene que ser más
   fuerte: es la única señal de que hay que volver.

   EL AVANCE VA EN EL ARO, IGUAL QUE EN EL RIEL. Estuvo un rato como una línea en el borde de
   abajo de cada pastilla, y funcionaba, pero eran dos formas distintas para el mismo dato según
   por dónde se navegara. Ahora el disco del número es el mismo aro de las dos, así que cambiar
   de una navegación a la otra no obliga a reaprender nada — que es media razón de tener las dos.
   Si el avance viviera solo en el riel, elegir pestañas costaría saber dónde están los huecos y
   las propuestas dejarían de ser comparables, que es justo lo que la franja existe para comparar.

   LOS RÓTULOS VAN CORTOS PARA QUE LAS NUEVE ENTREN EN UNA FILA. Con los títulos completos suman
   unos 1150 px y el área de contenido de un portátil de 1366 ronda los 1080: dos pestañas caían
   a un segundo renglón y la tira dejaba de leerse como una tira. Con «Identidad», «Sueldo» y
   «Acceso» bajan a unos 880 y entran holgadas a partir de 1280.

   NO SE PIERDE EL NOMBRE ENTERO: está en el `title` de cada pestaña y, más abajo, en la cabecera
   del paso puesto. Son los mismos cortos que usa `PASOS_CORTO` en el conversor, con su porqué
   escrito al lado — no otra lista que pueda desfasarse de ésta. */
export default function PestanasPasos({ pasos, actual, onIr, pendientes, avance }) {
  return (
    <div className="pp-tira" role="tablist" aria-label="Pasos de la ficha">
      {pasos.map(p => {
        const puesto = p.key === actual
        const t = avance?.[p.key]
        return (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={puesto}
            className={`pp-tab${puesto ? ' on' : ''}${p.n ? '' : ' pp-previa'}`}
            onClick={() => onIr(p.key)}
            /* El rótulo va corto para que las nueve entren en una fila; el nombre entero y la
               cuenta de campos viven acá, que es donde se los busca. */
            title={t ? `${p.titulo} — ${t.puestos} de ${t.total} campos` : p.titulo}
          >
            {p.n ? (
              <span className="pp-aro">
                {/* Recortado con máscara y no un disco sobre otro disco: la pastilla cambia
                    de fondo al pasar el ratón y al estar puesta, y en oscuro la puesta va en
                    verde. Ningún color sólido de relleno sirve para los cuatro estados. */}
                {t && <i className="pp-arco" style={{ '--pct': `${t.pct}%` }} />}
                <b>{p.n}</b>
              </span>
            ) : <Eye size={13} className="pp-ojo" />}
            {p.corto || p.titulo}
            {pendientes.has(p.key) && (
              <span className="pp-punto" title="Falta un dato obligatorio" aria-label="Falta un dato obligatorio" />
            )}
          </button>
        )
      })}
    </div>
  )
}
