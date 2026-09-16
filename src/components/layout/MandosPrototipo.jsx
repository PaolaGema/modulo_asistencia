import { useEffect, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { PROPUESTAS } from '../../pages/personas/ColaboradorNuevo'

/* LOS MANDOS DEL PROTOTIPO, EN LA BARRA DE LA APLICACIÓN.
   Los dos interruptores con los que se enseña la ficha de alta —qué propuesta se recorre y
   cuántos campos se piden— vivían en una banda oscura dentro de la propia pantalla. Ahí
   funcionaban, pero le costaban una fila entera al formulario, que es a lo que se entra.

   Y DESPUÉS VIVIERON DESPLEGADOS EN ESTA BARRA, que resultó peor de lo que parecía: seis botones
   y dos rótulos cruzando la cabecera de la aplicación, todo el tiempo, para un control que se
   toca tres veces en una reunión. Una barra superior es el sitio más caro de la pantalla —está
   en todas las vistas y no se puede cerrar— y el andamio se la había quedado entera.

   AHORA ES UN ICONO QUE ABRE UNA TARJETA. Plegado ocupa cuarenta píxeles; abierto enseña lo
   mismo que antes con más aire del que tenía. El matraz no es adorno: dice «esto es un
   experimento» sin escribirlo, y lo separa de los controles de verdad que lo rodean.

   EL NÚMERO SE QUEDA FUERA, pegado al icono. Es lo único que hace falta saber sin abrir nada
   —cuál de las tres propuestas se está mirando— y es justo lo que se pregunta quien entra a la
   reunión cinco minutos tarde.

   ESTO ES ANDAMIO Y SE BORRA. No es una función del producto: es la comparación entre varios
   diseños de la misma pantalla, para que un equipo elija uno. El día que lo hagan, se borra este
   archivo entero y su línea en `EncabezadoPropuesta`. Por eso vive aparte y no mezclado con el
   resto de la barra — sacarlo tiene que ser quitar dos cosas, no desenredarlo de otras cinco.

   NO RECIBE NI GUARDA ESTADO. `vista` y `nivel` viven en la dirección desde el primer día
   —`?vista=pestanas&nivel=Mínimo` se puede enlazar y mandar por chat— así que acá se leen y se
   escriben igual que los lee la pantalla. Sin contexto, sin props que atraviesen el armazón, y
   sin un segundo sitio donde el valor pueda quedar desfasado. */

const RUTA = '/personas/colaboradores/nuevo'

/* LA LISTA NO SE ESCRIBE ACÁ: sale de la pantalla que las dibuja. Estuvo copiada un rato y la
   copia duró exactamente hasta que apareció una tercera propuesta — que es lo que siempre pasa
   con dos listas de lo mismo. Y la flecha apunta en el sentido correcto: lo temporal depende de
   lo permanente, así que el día que se borre este archivo la pantalla no se entera. */
const VISTAS = Object.entries(PROPUESTAS).map(([v, o]) => ({ v, ...o }))

const NIVELES = [
  { key: 'Mínimo', label: 'Mínimo legal', pista: 'Sin esto no se puede declarar a nadie' },
  { key: 'Operativo', label: 'Operativo', pista: 'Lo que hace falta para que la persona opere' },
  { key: 'Completo', label: 'Completo', pista: 'Los 249 campos del estudio' },
]

export default function MandosPrototipo() {
  const { pathname } = useLocation()
  const [params, setParams] = useSearchParams()
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)

  /* SE CIERRA COMO SE ESPERA QUE SE CIERRE: tocando fuera o con Escape. Un panel que sólo se
     cierra con su propio botón obliga a volver a buscarlo, y éste se abre justo encima del
     contenido que uno quiere mirar. Los oyentes se enganchan sólo con el panel abierto: mientras
     está plegado no hay nada que escuchar. */
  useEffect(() => {
    if (!abierto) return
    const fuera = e => { if (caja.current && !caja.current.contains(e.target)) setAbierto(false) }
    const tecla = e => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  /* Sólo en la ficha de alta. La barra es de toda la aplicación y un control que habla de una
     pantalla no tiene nada que decir en Organización ni en Onboarding.

     VA DESPUÉS DE LOS HOOKS y no antes: un `return` temprano por encima de `useEffect` cambia
     cuántos hooks corre el componente según la ruta, y React cuenta con que sean siempre los
     mismos. */
  if (pathname !== RUTA) return null

  const pedida = params.get('vista')
  const vista = PROPUESTAS[pedida] ? pedida : 'riel'
  const pedido = params.get('nivel')
  const nivel = NIVELES.some(n => n.key === pedido) ? pedido : 'Operativo'
  const propuesta = PROPUESTAS[vista]

  /* LOS VALORES POR DEFECTO NO SE ESCRIBEN, que es la convención que ya usa la pantalla: la
     dirección limpia es la del riel en nivel operativo, y así un enlace compartido no arrastra
     parámetros que no dicen nada. El paso se conserva: cambiar de propuesta no puede sacarte del
     paso 6 al 1. */
  const ir = (otraVista, otroNivel) => {
    const q = {}
    const paso = params.get('paso')
    if (paso) q.paso = paso
    if (otraVista !== 'riel') q.vista = otraVista
    if (otroNivel !== 'Operativo') q.nivel = otroNivel
    setParams(q)
  }

  return (
    <div className="mp" ref={caja}>
      <button
        type="button"
        className={`mp-boton${abierto ? ' on' : ''}`}
        onClick={() => setAbierto(a => !a)}
        aria-expanded={abierto}
        aria-haspopup="dialog"
        title={`Prototipo · Propuesta ${propuesta.n}: ${propuesta.t} · nivel ${nivel}`}
      >
        <FlaskConical size={15} />
        <b>{propuesta.n}</b>
      </button>

      {abierto && (
        <div className="mp-tarjeta" role="dialog" aria-label="Mandos del prototipo">
          <p className="mp-cab">
            Prototipo
            <span>Esto no es parte del producto: se borra cuando el equipo elija una.</span>
          </p>

          <span className="mp-et">Cómo se recorre la ficha</span>
          <div className="mp-lista" role="group" aria-label="Cómo se recorre la ficha">
            {VISTAS.map(o => (
              <button
                key={o.v}
                type="button"
                className={`mp-op${vista === o.v ? ' on' : ''}`}
                aria-pressed={vista === o.v}
                onClick={() => ir(o.v, nivel)}
              >
                <b>{o.n}</b>
                <span>{o.t}</span>
              </button>
            ))}
          </div>

          {/* El nivel es el otro interruptor del estudio y hace falta tanto como el primero:
              doscientos cuarenta y nueve campos de golpe no se le enseñan a nadie. Mínimo ⊂
              Operativo ⊂ Completo —el corte es del propio estudio—, así que bajar de nivel no
              esconde nada arbitrario: deja lo que sin ello no se puede declarar. */}
          <span className="mp-et">Cuántos campos se piden</span>
          <div className="mp-lista" role="group" aria-label="Cuántos campos se piden">
            {NIVELES.map(n => (
              <button
                key={n.key}
                type="button"
                className={`mp-op${nivel === n.key ? ' on' : ''}`}
                aria-pressed={nivel === n.key}
                onClick={() => ir(vista, n.key)}
              >
                <span>{n.label}</span>
                {/* La pista sale del `title` y pasa a la vista: acá hay sitio, y de las tres
                    opciones la que decide es justamente la que nadie sabe qué esconde. */}
                <i>{n.pista}</i>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
