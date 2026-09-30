import { useEffect, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'

/* ── UNA TABLITA DONDE CADA FILA ES UNA CELDA PARA ESCRIBIR ─────────────────────
   Para las listas que la persona arma a su gusto —los regalos que le gustaría recibir, las
   experiencias que le gustaría vivir—. El equipo vio tablas con categorías, precio y prioridad,
   tarjetas y etiquetas, y eligió esto (30 sep 2026): una fila por deseo, se escribe y nada más.

   SE GUARDA COMO TEXTO, UNA FILA POR RENGLÓN. Así lo que alguien escribió en la caja de antes
   sigue ahí —cada renglón pasa a ser una fila—, y las cuentas de la ficha, que preguntan si el
   campo tiene algo escrito, funcionan sin enterarse: filas vacías son renglones vacíos.

   SIEMPRE HAY AL MENOS UNA FILA, vacía si no hay nada, para que se vea dónde escribir. */
const filasDe = valor => {
  const filas = String(valor || '').split('\n')
  return filas.length ? filas : ['']
}

export default function ListaFilas({ id, campo, form, set }) {
  const filas = filasDe(form[campo.key])
  const guardar = nuevas => set(campo.key, nuevas.join('\n'))
  // Al agregar una fila, el cursor va a ella: agregar y escribir es un solo gesto.
  const [enfocar, setEnfocar] = useState(null)
  const cuerpo = useRef(null)
  useEffect(() => {
    if (enfocar === null) return
    cuerpo.current?.querySelectorAll('input')[enfocar]?.focus()
    setEnfocar(null)
  }, [enfocar])

  return (
    <div className="lf" id={id}>
      <table className="lf-tabla">
        <thead>
          <tr><th className="lf-n">#</th><th>{campo.columna || 'Detalle'}</th><th className="lf-x" aria-label="Quitar" /></tr>
        </thead>
        <tbody ref={cuerpo}>
          {filas.map((v, i) => (
            <tr key={i}>
              <td className="lf-n">{i + 1}</td>
              <td>
                <input
                  className="lf-celda"
                  value={v}
                  placeholder={i === 0 ? campo.ph : undefined}
                  aria-label={`${campo.columna || campo.label} ${i + 1}`}
                  onChange={e => guardar(filas.map((x, j) => (j === i ? e.target.value : x)))}
                  onKeyDown={e => {
                    // Enter al final de una fila con algo escrito abre la siguiente.
                    if (e.key === 'Enter' && v.trim()) { e.preventDefault(); guardar([...filas, '']); setEnfocar(filas.length) }
                  }}
                />
              </td>
              <td className="lf-x">
                {(filas.length > 1 || v) && (
                  <button
                    type="button"
                    className="lf-quitar"
                    aria-label={`Quitar fila ${i + 1}`}
                    onClick={() => guardar(filas.length > 1 ? filas.filter((_, j) => j !== i) : [''])}
                  >
                    <X size={13} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="lf-mas"
        /* Si la última fila está vacía no se suma otra: se va a escribir en ésa. */
        onClick={() => {
          if (!filas[filas.length - 1].trim()) { setEnfocar(filas.length - 1); return }
          guardar([...filas, '']); setEnfocar(filas.length)
        }}
      >
        <Plus size={13} /> {campo.agregar || 'Agregar fila'}
      </button>
    </div>
  )
}

/* Leído —la vista previa, la ficha cerrada—: sólo las filas con algo escrito, numeradas. */
export function FilasLeidas({ valor }) {
  const filas = filasDe(valor).map(x => x.trim()).filter(Boolean)
  return (
    <ol className="lf-leidas">
      {filas.map((x, i) => <li key={i}>{x}</li>)}
    </ol>
  )
}
