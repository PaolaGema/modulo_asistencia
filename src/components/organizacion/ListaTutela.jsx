import { useState } from 'react'
import { Plus, Check, Lock, X, Info } from 'lucide-react'
import Desplegable from '../layout/Desplegable'
import {
  DISC_TUTELA, GRADOS_DISCAPACIDAD, OTRA_PERSONA, OTRAS_TUTELA, RELACIONES_TUTELA, SEP_TUTELA,
  TIPOS_DISCAPACIDAD, marcadosDeTutela, otrasDeTutela,
} from '../../data/fichaColaborador'

/* ── «MARQUE A LAS PERSONAS CON DISCAPACIDAD», UNA LISTA EN UN RECUADRO ───
   Toda la gente que la ficha ya conoce, una fila por persona dentro de un solo recuadro, con sus
   datos en columnas —persona, relación, tipo y grado de discapacidad— y un círculo a la derecha
   para marcarla. Se probaron una tabla con pastillas, tarjetas y una lista agrupada; el equipo
   eligió esta (29 sep 2026): los datos ordenados sin ruido de colores.

   MARCAR A ALGUIEN ES DECIR QUE TIENE DISCAPACIDAD, así que su fila pide el tipo y el grado ahí
   mismo, con dos desplegables en sus columnas. Se guardan en 1.62t —ver `DISC_TUTELA`—, por
   nombre, y se borran al desmarcar.

   EL HIJO CON DISCAPACIDAD DECLARADA VIENE MARCADO Y BLOQUEADO: eso ya se contestó en su bloque,
   tipo y grado incluidos, y acá sólo se muestra, con un candado. Si cambia, se cambia allá. Y
   tocarla no queda mudo: sale un aviso que dice por qué no se desmarca y dónde se cambia.

   SE PUEDE MARCAR A MÁS DE UNO. Los nombres marcados se guardan en 1.62b separados por « · »
   —ver `marcadosDeTutela`—; una ficha con un solo nombre de antes se sigue leyendo igual.

   «AGREGAR OTRA PERSONA» QUEDA SIEMPRE AL FINAL, y cada clic suma una fila editable —nombre,
   relación, tipo y grado en sus columnas— para alguien que no está en la ficha. Pueden ser
   varias; cada una se quita con la cruz de su derecha. Se guardan en 1.62o, ver `otrasDeTutela`.
   Primero había una sola y el botón se volvía esa fila: no se podía agregar una segunda. */
const relacionDe = (grupo, p) =>
  grupo === 'Contactos de emergencia' ? (p.relacion || 'Contacto de emergencia')
    : grupo === 'Cónyuge' ? 'Cónyuge'
      : p.relacion

const iniciales = nombre => nombre.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()

const OTRA_VACIA = { nombre: '', relacion: '', tipo: '', grado: '' }

export default function ListaTutela({ campo, form, set }) {
  const marcados = marcadosDeTutela(form[campo.key])
  const personas = (campo.grupos || []).flatMap(g => g.personas.map(p => ({ ...p, relacion: relacionDe(g.titulo, p) })))
  const conocidos = new Set(personas.map(p => p.nombre))
  const fijos = new Set(personas.filter(p => p.fija).map(p => p.nombre))
  const discs = form[DISC_TUTELA] || {}
  const otras = otrasDeTutela(form)
  const [aviso, setAviso] = useState(null)

  /* Al marcar o desmarcar se limpian de paso los nombres que ya no tienen fila —alguien borrado o
     renombrado arriba—: quedarían guardados sin que nada pudiera quitarlos. Y al desmarcar se va
     también su tipo y su grado, que sin la marca no dicen nada. */
  const alternar = nombre => {
    if (fijos.has(nombre)) return
    const quedan = marcados.filter(n => conocidos.has(n) && !fijos.has(n))
    const sale = quedan.includes(nombre)
    set(campo.key, (sale ? quedan.filter(n => n !== nombre) : [...quedan, nombre]).join(SEP_TUTELA))
    if (sale && discs[nombre]) {
      set(DISC_TUTELA, Object.fromEntries(Object.entries(discs).filter(([n]) => n !== nombre)))
    }
  }
  const ponerDisc = (nombre, clave, valor) =>
    set(DISC_TUTELA, { ...discs, [nombre]: { ...discs[nombre], [clave]: valor } })

  /* LAS OTRAS PERSONAS SE ESCRIBEN COMO LISTA. La primera vez que se toca, lo que hubiera en el
     formato de antes —una sola, en 1.62c a 1.62f— pasa a la lista y se limpia de donde estaba. */
  const ponerOtras = lista => {
    set(OTRAS_TUTELA, lista)
    if (!Array.isArray(form[OTRAS_TUTELA]) && marcados.includes(OTRA_PERSONA)) {
      set(campo.key, marcados.filter(n => n !== OTRA_PERSONA).join(SEP_TUTELA))
      ;['1.62c', '1.62d', '1.62e', '1.62f'].forEach(k => set(k, ''))
    }
  }
  const agregarOtra = () => ponerOtras([...otras, { ...OTRA_VACIA }])
  const cambiarOtra = (i, clave, valor) => ponerOtras(otras.map((o, j) => (j === i ? { ...o, [clave]: valor } : o)))
  const quitarOtra = i => ponerOtras(otras.filter((_, j) => j !== i))

  return (
    <div className="tut" role="group" aria-label={campo.label}>
      {(personas.length > 0 || otras.length > 0) && (
        <div className="tut-cab" aria-hidden="true">
          <span>Persona</span>
          <span>Relación</span>
          <span>Tipo</span>
          <span>Grado</span>
          <span />
        </div>
      )}

      {personas.map(p => {
        const puesta = p.fija || marcados.includes(p.nombre)
        const id = `tut-${p.nombre.replace(/\s+/g, '-')}`
        return (
          <div
            key={p.nombre}
            className={`tut-fila${puesta ? ' puesta' : ''}${p.fija ? ' fija' : ''}`}
            title={p.fija ? 'Su discapacidad está declarada en «Datos de los hijos»: se cambia allá.' : undefined}
            onClick={p.fija ? () => setAviso(p.nombre) : undefined}
          >
            <label className="tut-persona" htmlFor={id}>
              <input
                id={id}
                type="checkbox"
                className="tut-check"
                checked={puesta}
                disabled={p.fija}
                onChange={() => alternar(p.nombre)}
              />
              <span className="tut-ini" aria-hidden="true">{iniciales(p.nombre)}</span>
              <span className="tut-nombre">{p.nombre}</span>
            </label>
            <span className="tut-rel">{p.relacion || '—'}</span>

            {p.fija ? (
              <>
                <span className="tut-dato"><Lock size={12} aria-hidden="true" />{p.tipo || '—'}</span>
                <span className="tut-dato">{p.grado || '—'}</span>
              </>
            ) : puesta ? (
              <>
                <Desplegable
                  valor={discs[p.nombre]?.tipo || ''}
                  opciones={TIPOS_DISCAPACIDAD}
                  placeholder="Tipo"
                  ariaLabel={`Tipo de discapacidad de ${p.nombre}`}
                  onCambio={v => ponerDisc(p.nombre, 'tipo', v)}
                />
                <Desplegable
                  valor={discs[p.nombre]?.grado || ''}
                  opciones={GRADOS_DISCAPACIDAD}
                  placeholder="Grado"
                  ariaLabel={`Grado de discapacidad de ${p.nombre}`}
                  onCambio={v => ponerDisc(p.nombre, 'grado', v)}
                />
              </>
            ) : (
              <>
                <span className="tut-sin">—</span>
                <span className="tut-sin">—</span>
              </>
            )}

            <label className="tut-marca" htmlFor={id} aria-hidden="true">
              {puesta && <Check size={12} strokeWidth={3.2} />}
            </label>
          </div>
        )
      })}

      {otras.map((o, i) => (
        <div key={i} className="tut-fila puesta tut-otra-abierta">
          <span className="tut-persona">
            <span className="tut-ini" aria-hidden="true">{iniciales(o.nombre || '') || <Plus size={14} />}</span>
            <input
              className="pl-input tut-input"
              value={o.nombre}
              placeholder="Nombre completo"
              aria-label={`Nombre completo de la otra persona ${i + 1}`}
              onChange={e => cambiarOtra(i, 'nombre', e.target.value)}
            />
          </span>
          <Desplegable
            valor={o.relacion}
            opciones={RELACIONES_TUTELA}
            placeholder="Relación"
            ariaLabel={`Relación de la otra persona ${i + 1}`}
            onCambio={v => cambiarOtra(i, 'relacion', v)}
          />
          <Desplegable
            valor={o.tipo}
            opciones={TIPOS_DISCAPACIDAD}
            placeholder="Tipo"
            ariaLabel={`Tipo de discapacidad de la otra persona ${i + 1}`}
            onCambio={v => cambiarOtra(i, 'tipo', v)}
          />
          <Desplegable
            valor={o.grado}
            opciones={GRADOS_DISCAPACIDAD}
            placeholder="Grado"
            ariaLabel={`Grado de discapacidad de la otra persona ${i + 1}`}
            onCambio={v => cambiarOtra(i, 'grado', v)}
          />
          <button
            type="button"
            className="tut-quitar"
            aria-label={`Quitar a ${o.nombre || `la otra persona ${i + 1}`}`}
            title="Quitar"
            onClick={() => quitarOtra(i)}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {aviso && (
        <div className="tut-aviso" role="alert">
          <Info size={16} aria-hidden="true" />
          <span>
            <b>{aviso}</b> no se puede desmarcar aquí: su discapacidad está declarada en
            «Datos de los hijos». Si ya no corresponde, cámbiela allá, en «¿Presenta discapacidad?».
          </span>
          <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso(null)}><X size={14} /></button>
        </div>
      )}

      <button type="button" className="tut-fila tut-otra" onClick={agregarOtra}>
        <span className="tut-persona">
          <span className="tut-ini tut-ini-mas" aria-hidden="true"><Plus size={14} /></span>
          <span>Agregar otra persona</span>
        </span>
      </button>
    </div>
  )
}
