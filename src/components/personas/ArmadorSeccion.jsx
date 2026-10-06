import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react'
import Desplegable from '../layout/Desplegable'
import Acordeon from './Acordeon'
import TarjetaCampos from '../organizacion/TarjetaCampos'
import { PASOS, PESTANAS } from '../../data/fichaColaborador'
import { TIPOS_CAMPO, opcionesDe, tarjetaPropia } from '../../data/configFicha'

/* EL ARMADOR DE UNA SECCIÓN PROPIA — Configuración › Ficha del colaborador (fase 2).
   Un modal grande, como los demás de la plataforma, en dos columnas: a la izquierda se arma —nombre, instrucción, dónde va y sus
   campos— y a la derecha se ve la sección tal como saldrá en la ficha, con los controles de
   verdad (`TarjetaCampos`), y se puede probar escribiendo. Nada se guarda hasta «Crear sección».

   LO QUE SE PIDE ES LO MÍNIMO para que la sección se entienda en la ficha: un nombre, y por cada
   campo su nombre y su tipo. La instrucción es opcional; las opciones, sólo para una lista. Lo
   que falta se dice abajo, junto al botón, en vez de marcar en rojo lo que todavía no se tocó.

   LAS CLAVES DE LOS CAMPOS NO SE REUSAN: el contador `siguiente` sólo sube (ver `configFicha`). */

const nuevoId = () => `p${Date.now().toString(36)}`

/* Dónde puede ir: cualquier parte de la ficha menos la configuración del usuario, que no es un
   dato del colaborador. Las pestañas de una sola parte se nombran por la pestaña. */
const LUGARES = PESTANAS.filter(t => t.key !== 'configuracion').flatMap(t => t.partes.map(k => ({
  valor: k,
  etiqueta: t.partes.length > 1 ? `${t.titulo} › ${PASOS.find(p => p.key === k)?.titulo}` : t.titulo,
})))

export default function ArmadorSeccion({ inicial, parteInicial, onGuardar, onCerrar }) {
  const editando = !!inicial
  const [id] = useState(() => inicial?.id || nuevoId())
  const [titulo, setTitulo] = useState(inicial?.titulo || '')
  const [desc, setDesc] = useState(inicial?.desc || '')
  const [parte, setParte] = useState(inicial?.parte || parteInicial)
  const [siguiente, setSiguiente] = useState(inicial?.siguiente || 1)
  const [campos, setCampos] = useState(inicial?.campos || [])
  const [prueba, setPrueba] = useState({})

  useEffect(() => {
    const tecla = e => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])

  const agregar = () => {
    setCampos(cs => [...cs, { key: `${id}.${siguiente}`, label: '', tipo: 'texto', requerido: false, opciones: '' }])
    setSiguiente(n => n + 1)
  }
  const cambiar = (i, parche) => setCampos(cs => cs.map((c, j) => (j === i ? { ...c, ...parche } : c)))
  const quitar = i => setCampos(cs => cs.filter((_, j) => j !== i))
  const mover = (i, d) => setCampos(cs => {
    const j = i + d
    if (j < 0 || j >= cs.length) return cs
    const otra = [...cs]; [otra[i], otra[j]] = [otra[j], otra[i]]
    return otra
  })

  const seccion = { id, titulo: titulo.trim(), desc: desc.trim(), parte, siguiente, campos: campos.map(c => ({ ...c, label: c.label.trim() })) }
  const vista = tarjetaPropia({ ...seccion, titulo: seccion.titulo || 'Sección sin nombre' })

  /* Lo primero que falta, en el orden en que se llena el panel. */
  const falta = !seccion.titulo ? 'Escriba el nombre de la sección.'
    : !campos.length ? 'Agregue al menos un campo.'
      : seccion.campos.some(c => !c.label) ? 'Hay un campo sin nombre.'
        : (() => {
          const corta = seccion.campos.find(c => c.tipo === 'lista' && opcionesDe(c.opciones).length < 2)
          return corta ? `La lista «${corta.label}» necesita al menos dos opciones.` : null
        })()

  return (
    <div className="pl-overlay" onClick={onCerrar}>
      <section className="cf-armador" role="dialog" aria-modal="true" aria-labelledby="cf-armador-tit" onClick={e => e.stopPropagation()}>
        <header className="cf-armador-cab">
          <div>
            <h2 id="cf-armador-tit">{editando ? 'Editar sección' : 'Nueva sección'}</h2>
            <p>Se agrega al final de la parte que elija, con los mismos campos que el resto de la ficha.</p>
          </div>
          <button type="button" className="cf-modal-cerrar" aria-label="Cerrar" onClick={onCerrar}><X size={16} /></button>
        </header>

        <div className="cf-armador-cuerpo">
          <div className="cf-armador-form">
            <label className="cf-armador-rotulo">
              <span>Nombre de la sección <span className="cf-req">*</span></span>
              <input className="pl-input" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej.: Tallas de uniforme" autoFocus />
            </label>
            <label className="cf-armador-rotulo">
              <span>Instrucción <span className="cf-opc">(opcional)</span></span>
              <input className="pl-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej.: Registre las tallas del colaborador para su uniforme." />
            </label>
            <div className="cf-armador-rotulo">
              ¿Dónde va?
              <Desplegable valor={parte} opciones={LUGARES} onCambio={setParte} ariaLabel="Parte de la ficha donde va la sección" />
            </div>

            <h3 className="cf-armador-sub">Campos <span>{campos.length}</span></h3>
            <div className="cf-armador-campos">
              {campos.map((c, i) => (
                <div key={c.key} className="cf-campo">
                  <div className="cf-campo-fila">
                    <input className="pl-input" value={c.label} onChange={e => cambiar(i, { label: e.target.value })} placeholder="Nombre del campo" aria-label={`Nombre del campo ${i + 1}`} />
                    <div className="cf-campo-tipo">
                      <Desplegable valor={c.tipo} opciones={TIPOS_CAMPO} onCambio={v => cambiar(i, { tipo: v })} ariaLabel={`Tipo del campo ${i + 1}`} />
                    </div>
                  </div>
                  {c.tipo === 'lista' && (
                    <textarea className="pl-input cf-campo-opciones" rows={3} value={c.opciones} onChange={e => cambiar(i, { opciones: e.target.value })} placeholder={'Opciones, una por línea\nEj.: S\nM\nL'} aria-label={`Opciones del campo ${i + 1}`} />
                  )}
                  <div className="cf-campo-pie">
                    <label className="cf-campo-check">
                      <input type="checkbox" checked={!!c.requerido} onChange={e => cambiar(i, { requerido: e.target.checked })} />
                      Obligatorio
                    </label>
                    <span style={{ flex: 1 }} />
                    <button type="button" className="cf-ico-btn" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir campo"><ArrowUp size={14} /></button>
                    <button type="button" className="cf-ico-btn" onClick={() => mover(i, 1)} disabled={i === campos.length - 1} aria-label="Bajar campo"><ArrowDown size={14} /></button>
                    <button type="button" className="cf-ico-btn borrar" onClick={() => quitar(i)} aria-label="Quitar campo"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              <button type="button" className="cf-agregar-campo" onClick={agregar}><Plus size={15} /> Agregar campo</button>
            </div>
          </div>

          {/* LA SECCIÓN COMO SALDRÁ, en su acordeón y con los controles de la ficha. Se puede
              escribir para probarla; lo escrito aquí no se guarda. */}
          <div className="cf-armador-vista">
            <span className="cf-armador-vista-tit">Vista previa</span>
            <Acordeon titulo={vista.titulo} desc={vista.desc} abierto onAlternar={() => {}}>
              {vista.campos.length
                ? <TarjetaCampos campos={vista.campos} form={prueba} set={(k, v) => setPrueba(f => ({ ...f, [k]: v }))} editando prefijo="cfp" marcarFaltas={false} desnudo />
                : <p className="cf-armador-vacia">Los campos que agregue aparecerán aquí.</p>}
            </Acordeon>
          </div>
        </div>

        <footer className="cf-armador-pie">
          <span className={`cf-armador-falta${falta ? '' : ' listo'}`}>{falta || 'Lista para guardar.'}</span>
          <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
          <button type="button" className="pl-btn-save" disabled={!!falta} onClick={() => onGuardar(seccion)}>
            {editando ? 'Guardar cambios' : 'Crear sección'}
          </button>
        </footer>
      </section>
    </div>
  )
}
