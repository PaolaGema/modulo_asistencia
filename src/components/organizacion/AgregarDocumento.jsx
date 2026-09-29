import { Plus } from 'lucide-react'
import { claveDeCuenta, cuantosHay } from '../../data/fichaColaborador'

/* ── AGREGAR UN DOCUMENTO ES UN RECUADRO MÁS ─────────────────────────────
   Era un bloque de tres campos con su rótulo y un botón sobre una costura, igual que los hijos o
   las licencias. El equipo eligió, entre cuatro propuestas (29 sep 2026), que agregar un documento
   se parezca a lo que ya hay en Archivos: un recuadro del mismo tamaño que los adjuntos.

   CADA TOQUE CREA UN DOCUMENTO AL INSTANTE. Primero se abría ahí mismo un formulario con
   «Agregar», y había que completar uno antes de poder empezar el siguiente; quien llega con cinco
   papeles quiere abrir los cinco lugares y llenarlos en el orden que le quede cómodo. Así que el
   recuadro no pregunta nada: suma una copia del grupo —su nombre se escribe arriba de su archivo,
   en su propio recuadro— y se queda al final, listo para la siguiente.

   LO QUE SE GUARDA ES EL MISMO GRUPO: `ex.2` el nombre, `ex.4` el archivo, la cuenta en
   `__n_docsExtra`. La vista previa, las cuentas y el buscador lo leen igual que antes. */
export default function AgregarDocumento({ campo, form, set }) {
  const cuantos = cuantosHay(form, campo.grupo)
  const tope = campo.max || Infinity

  if (cuantos >= tope) {
    return <div className={campo.col}><p className="doc-nuevo-tope">Máximo {tope} documentos agregados.</p></div>
  }

  return (
    <div className={campo.col}>
      {/* El rótulo invisible alinea el recuadro con los de al lado, que tienen el suyo encima. */}
      <span className="pl-label doc-nuevo-hueco" aria-hidden="true">·</span>
      <button type="button" className="doc-nuevo" onClick={() => set(claveDeCuenta(campo.grupo), cuantos + 1)}>
        <span className="doc-nuevo-mas" aria-hidden="true"><Plus size={20} /></span>
        <span className="doc-nuevo-tit">{campo.label}</span>
        <span className="doc-nuevo-sub">Un papel que ningún campo pide</span>
      </button>
    </div>
  )
}
