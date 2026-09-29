import { Plus, X } from 'lucide-react'
import Desplegable from '../layout/Desplegable'

/* ── LA DEPENDENCIA FUNCIONAL EN LA FICHA, COMO TABLA ─────────────────────
   Es el mismo dato que el organigrama guarda para cada puesto —[{ unidadId, reportaA }]— y con las
   mismas reglas que su editor, `ApoyoFuncional`: no se ofrece la unidad propia, no se repiten
   unidades, y a quién responde se elige entre los cargos de la unidad apoyada.

   LO QUE CAMBIA ES EL DIBUJO. Los selectores del organigrama tienen su propio estilo y dentro de la
   ficha desentonaban; acá va como la tabla de aprobadores, que es como la ficha pide varias cosas en
   orden: dos columnas —«Unidad que apoya» y «Responde a»—, una cruz por fila y «Agregar otra unidad»
   al pie. */
export default function TablaFuncional({ apoyos = [], org, unidadPropia, cargoId, onCambio }) {
  const unidades = org?.unidades || []
  const cargos = org?.cargos || []
  const libres = unidades.filter(u => u.id !== unidadPropia && !apoyos.some(f => f.unidadId === u.id))

  const poner = (i, cambios) => onCambio(apoyos.map((x, j) => (j === i ? { ...x, ...cambios } : x)))
  const nombreDe = id => unidades.find(u => u.id === id)?.nombre || ''

  return (
    <div className="apr apr-dos" role="group" aria-label="Unidades que apoya">
      {apoyos.length > 0 && (
        <div className="apr-cab" aria-hidden="true">
          <span>Unidad que apoya</span>
          <span>Responde a</span>
          <span />
        </div>
      )}

      {apoyos.length === 0 && (
        <p className="apr-vacia">A nadie: solo trabaja en su unidad.</p>
      )}

      {apoyos.map((f, i) => {
        const opcionesUnidad = unidades
          .filter(u => u.id !== unidadPropia && (u.id === f.unidadId || !apoyos.some(x => x.unidadId === u.id)))
          .map(u => ({ valor: u.id, etiqueta: u.nombre }))
        /* Un cargo se nombra una vez aunque tenga varias sillas: quien apoya responde al cargo. */
        const vistos = new Set()
        const opcionesJefe = [
          { valor: '', etiqueta: 'Nadie: cuelga de la unidad' },
          ...cargos
            .filter(c => c.unidadId === f.unidadId && c.id !== cargoId)
            .filter(c => !vistos.has(c.nombre) && vistos.add(c.nombre))
            .map(c => ({ valor: c.id, etiqueta: c.nombre })),
        ]
        return (
          <div key={i} className="apr-fila">
            <Desplegable
              valor={f.unidadId}
              opciones={opcionesUnidad}
              placeholder="Elige la unidad"
              ariaLabel={`Unidad que apoya ${i + 1}`}
              onCambio={v => poner(i, { unidadId: v, reportaA: null })}
            />
            {f.unidadId ? (
              <Desplegable
                valor={f.reportaA || ''}
                opciones={opcionesJefe}
                placeholder="Nadie: cuelga de la unidad"
                ariaLabel={`A quién responde en ${nombreDe(f.unidadId)}`}
                onCambio={v => poner(i, { reportaA: v || null })}
              />
            ) : <span className="apr-raya">Elige primero la unidad</span>}
            <button type="button" className="apr-quitar" aria-label={`Quitar ${nombreDe(f.unidadId) || 'esta unidad'}`} onClick={() => onCambio(apoyos.filter((_, j) => j !== i))}>
              <X size={14} />
            </button>
          </div>
        )
      })}

      {libres.length > 0 ? (
        <button type="button" className="apr-agregar" onClick={() => onCambio([...apoyos, { unidadId: '', reportaA: null }])}>
          <Plus size={14} /> {apoyos.length ? 'Agregar otra unidad' : 'Agregar una unidad'}
        </button>
      ) : apoyos.length === 0 && (
        <p className="apr-vacia">No hay otras unidades todavía en el organigrama.</p>
      )}
    </div>
  )
}
