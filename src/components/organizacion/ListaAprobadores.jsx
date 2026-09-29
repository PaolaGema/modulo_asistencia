import { Plus, X } from 'lucide-react'
import Desplegable from '../layout/Desplegable'

/* ── LOS APROBADORES DE PERMISOS, EN UNA TABLA ────────────────────────────
   Un permiso pasa por una o varias firmas en orden: el jefe directo y, después, RR.HH. Se probó
   como bloque repetible —un título y un campo por aprobador— y como fila de casillas; el equipo
   eligió la tabla (29 sep 2026): una fila por firma, con tres columnas —orden, quién aprueba y
   quién lo reemplaza si no está—, y «Agregar otro aprobador» al pie, hasta tres.

   SE GUARDAN DONDE SIEMPRE: el primero en 3.16 y los siguientes en 3.16#2 y 3.16#3, con la cuenta en
   `__n_aprobadores`. Lo que estaba elegido sigue siendo el primer aprobador.

   CADA APROBADOR TIENE SU SUPLENTE, en «Si no está»: quien firma en su lugar cuando falta. El del
   primero se guarda en 3.16b, como antes; el del segundo y el tercero, en 3.16b#2 y 3.16b#3.

   UNA PERSONA NO FIRMA DOS VECES: quien ya está en otra casilla no se ofrece en las demás. */
const MAX = 3
const CUENTA = '__n_aprobadores'
const claveDe = n => (n === 1 ? '3.16' : `3.16#${n}`)
const suplenteDe = n => (n === 1 ? '3.16b' : `3.16b#${n}`)

export default function ListaAprobadores({ campo, form, set }) {
  const cuantos = Math.min(MAX, Math.max(1, Number(form[CUENTA]) || 1))
  const valores = Array.from({ length: cuantos }, (_, i) => form[claveDe(i + 1)] || '')
  const suplentes = Array.from({ length: cuantos }, (_, i) => form[suplenteDe(i + 1)] || '')
  const opciones = campo.opciones || []

  const libresPara = (propio, otros) => opciones.filter(o => {
    const v = typeof o === 'string' ? o : o.valor
    return v === propio || !otros.includes(v)
  })

  /* Quitar uno que no es el último corre a los de abajo un lugar: el orden es el de las firmas y no
     puede quedar un hueco en medio. */
  const quitar = n => {
    for (let i = n; i < cuantos; i += 1) { set(claveDe(i), valores[i]); set(suplenteDe(i), suplentes[i]) }
    set(claveDe(cuantos), '')
    set(suplenteDe(cuantos), '')
    set(CUENTA, cuantos - 1)
  }

  return (
    <div className="apr" role="group" aria-label={campo.label}>
      <div className="apr-cab" aria-hidden="true">
        <span>Orden</span>
        <span>Aprueba</span>
        <span>Aprobador suplente</span>
        <span />
      </div>

      {valores.map((v, i) => {
        const n = i + 1
        // Nadie aparece dos veces en la tabla: ni como aprobador ni como suplente.
        const todos = [...valores, ...suplentes]
        const otrosQue = propio => todos.filter(x => x && x !== propio)
        return (
          <div key={n} className="apr-fila">
            <span className="apr-orden" aria-label={`${n}.º`}>{n}</span>
            <Desplegable
              valor={v}
              opciones={libresPara(v, otrosQue(v))}
              placeholder="Elige a una persona"
              conBuscador
              buscaPh="Buscar por nombre o cargo…"
              ariaLabel={`${n}.º aprobador de permisos`}
              onCambio={x => set(claveDe(n), x)}
            />
            <Desplegable
              valor={suplentes[i]}
              opciones={libresPara(suplentes[i], otrosQue(suplentes[i]))}
              placeholder="Nadie (opcional)"
              conBuscador
              buscaPh="Buscar por nombre o cargo…"
              ariaLabel={`Aprobador suplente del ${n}.º`}
              onCambio={x => set(suplenteDe(n), x)}
            />
            {cuantos > 1 ? (
              <button type="button" className="apr-quitar" aria-label={`Quitar al ${n}.º aprobador`} onClick={() => quitar(n)}>
                <X size={14} />
              </button>
            ) : <span />}
          </div>
        )
      })}

      {cuantos < MAX && (
        <button type="button" className="apr-agregar" onClick={() => set(CUENTA, cuantos + 1)}>
          <Plus size={14} /> Agregar otro aprobador
        </button>
      )}
    </div>
  )
}
