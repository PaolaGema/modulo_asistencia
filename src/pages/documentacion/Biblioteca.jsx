import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Library, Lock, Pencil, Plus, Power, Search, Trash2 } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { CATEGORIAS, dias, fechaCorta } from '../../data/documentacionData'
import { Cabecera, Etiqueta, Modal, Vacio } from '../../components/documentacion/comunes'
import Desplegable from '../../components/layout/Desplegable'
import { CIRCUITOS, versionPublicada } from './emisionUtil'
import './emision.css'

/* ── LA BIBLIOTECA DE MODELOS (pantalla 9 · RF-42, RF-43, RF-50) ──────────
   UNA sola lista con tres categorías, donde el Salar tiene tres pantallas casi iguales. Así el
   mismo buscador encuentra un certificado o una adenda, y duplicar funciona entre categorías.

   LOS MODELOS DE FÁBRICA NO SE TOCAN: se duplican. Una empresa nueva arranca con ellos y los
   adapta clonando (RF-50); el original queda como estaba para la próxima que los necesite. */

const nuevoId = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`

export default function Biblioteca() {
  const { modelos, setModelos, emitidos, contratos, anotarConfig, usuario } = useDocumentacion()
  const navigate = useNavigate()
  const [categoria, setCategoria] = useState('todos')
  const [estado, setEstado] = useState('todos')
  const [busca, setBusca] = useState('')
  const [creando, setCreando] = useState(false)
  const [borrando, setBorrando] = useState(null)

  /* Cuántos documentos salieron de cada modelo. Es lo que decide si se puede eliminar (RF-08):
     un modelo con historia sólo se desactiva, porque borrarlo dejaría emitidos sin origen. */
  const usos = useMemo(() => {
    const n = {}
    for (const e of emitidos) n[e.modeloId] = (n[e.modeloId] || 0) + 1
    for (const c of contratos) n[c.modeloId] = (n[c.modeloId] || 0) + 1
    return n
  }, [emitidos, contratos])

  const visibles = modelos.filter(m =>
    (categoria === 'todos' || m.categoria === categoria)
    && (estado === 'todos' || m.estado === estado)
    && m.nombre.toLowerCase().includes(busca.trim().toLowerCase()))

  const cuantos = cat => modelos.filter(m => cat === 'todos' || m.categoria === cat).length

  function duplicar(m) {
    const pub = versionPublicada(m) || m.versiones[m.versiones.length - 1]
    const copia = {
      ...m,
      id: nuevoId(),
      nombre: `${m.nombre} (copia)`,
      base: false,
      origenId: m.id,
      /* La copia arranca como BORRADOR: todavía es la plantilla de fábrica, y publicarla sin
         mirarla sería tener dos modelos iguales con nombres distintos. */
      versiones: [{ v: 1, texto: pub?.texto || '', estado: 'borrador', publicadaPor: usuario, fecha: dias(0) }],
    }
    setModelos(prev => [...prev, copia])
    anotarConfig(`Duplicó el modelo «${m.nombre}»`)
    navigate(`/documentos/configuracion/modelos/${copia.id}`)
  }

  function alternar(m) {
    setModelos(prev => prev.map(x => (x.id === m.id ? { ...x, estado: x.estado === 'activo' ? 'inactivo' : 'activo' } : x)))
    anotarConfig(`${m.estado === 'activo' ? 'Desactivó' : 'Activó'} el modelo «${m.nombre}»`)
  }

  function eliminar(m) {
    setModelos(prev => prev.filter(x => x.id !== m.id))
    anotarConfig(`Eliminó el modelo «${m.nombre}», que no tenía documentos emitidos`)
    setBorrando(null)
  }

  return (
    <div className="content-scroll">
      <Cabecera titulo="Biblioteca de modelos" sub="Certificados, memorándums y contratos en una sola lista. Los de fábrica se duplican para adaptarlos.">
        <button type="button" className="pl-btn-new" onClick={() => setCreando(true)}>
          <Plus size={14} color="#00E091" /> Nuevo modelo
        </button>
      </Cabecera>

      <div className="dc-tabs" role="tablist" aria-label="Categoría">
        {['todos', ...Object.keys(CATEGORIAS)].map(c => (
          <button key={c} type="button" role="tab" aria-selected={categoria === c} className={`dc-tab${categoria === c ? ' on' : ''}`} onClick={() => setCategoria(c)}>
            {c === 'todos' ? 'Todos' : CATEGORIAS[c].plural}
            <span className="dc-tab-n">{cuantos(c)}</span>
          </button>
        ))}
      </div>

      <div className="xc-herramientas">
        <label className="xc-buscar">
          <Search size={14} aria-hidden="true" />
          <input className="pl-input" type="search" placeholder="Buscar por nombre…" value={busca} onChange={e => setBusca(e.target.value)} aria-label="Buscar modelo" />
        </label>
        <div className="xc-seg" role="group" aria-label="Estado">
          {[['todos', 'Todos'], ['activo', 'Activos'], ['inactivo', 'Inactivos']].map(([k, t]) => (
            <button key={k} type="button" className={estado === k ? 'on' : ''} aria-pressed={estado === k} onClick={() => setEstado(k)}>{t}</button>
          ))}
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="dc-tarjeta">
          <Vacio Icono={Library} titulo="Ningún modelo coincide" texto={`Se buscó «${busca || 'todo'}» en ${categoria === 'todos' ? 'todas las categorías' : CATEGORIAS[categoria].plural.toLowerCase()}, con estado ${estado === 'todos' ? 'cualquiera' : estado}.`}>
            <button type="button" className="dc-btn" onClick={() => { setBusca(''); setCategoria('todos'); setEstado('todos') }}>Limpiar filtros</button>
          </Vacio>
        </div>
      ) : (
        <div className="as-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="as-table xc-tabla" style={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Categoría</th>
                <th>Plantilla publicada</th>
                <th>Solicitudes</th>
                <th>Aprobación</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {visibles.map(m => {
                const pub = versionPublicada(m)
                const borrador = m.versiones[m.versiones.length - 1]?.estado === 'borrador'
                const n = usos[m.id] || 0
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="xc-nombre">
                        <b>{m.nombre}</b>
                        <small>
                          {m.base ? <><Lock size={10} aria-hidden="true" /> De fábrica · </> : 'Propio · '}
                          {n === 0 ? 'Sin documentos emitidos' : `${n} ${n === 1 ? 'documento emitido' : 'documentos emitidos'}`}
                        </small>
                      </div>
                    </td>
                    <td>{CATEGORIAS[m.categoria]?.label}</td>
                    <td>
                      {pub
                        ? <span className="xc-nombre"><b>Versión {pub.v}</b><small>{fechaCorta(pub.fecha)}{borrador ? ' · hay un borrador sin publicar' : ''}</small></span>
                        : <Etiqueta tono="ambar" titulo="Sin plantilla publicada no se puede emitir (RN-17)">Sin publicar</Etiqueta>}
                    </td>
                    <td>{m.disponibleSolicitud ? 'Sí' : 'No'}</td>
                    <td>{CIRCUITOS[m.circuito] || '—'}</td>
                    <td><Etiqueta tono={m.estado === 'activo' ? 'verde' : 'gris'}>{m.estado === 'activo' ? 'Activo' : 'Inactivo'}</Etiqueta></td>
                    <td>
                      <div className="xc-acciones">
                        <button type="button" className="dc-btn dc-btn-sm" onClick={() => navigate(`/documentos/configuracion/modelos/${m.id}`)}>
                          <Pencil size={12} aria-hidden="true" /> {m.base ? 'Ver' : 'Editar'}
                        </button>
                        <button type="button" className="dc-btn dc-btn-sm" onClick={() => duplicar(m)} title="Crea un modelo propio con esta plantilla">
                          <Copy size={12} aria-hidden="true" /> Duplicar
                        </button>
                        <button type="button" className="dc-btn dc-btn-sm" onClick={() => alternar(m)} title={m.estado === 'activo' ? 'Un modelo inactivo no aparece al emitir; lo ya emitido no cambia' : 'Vuelve a aparecer al emitir'}>
                          <Power size={12} aria-hidden="true" /> {m.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                        {!m.base && (
                          /* ELIMINAR SÓLO LO QUE NO TIENE HISTORIA (RF-08). Apagado, dice por qué y
                             cuántos documentos lo impiden: un botón gris sin explicación se lee como
                             una falla. */
                          <button
                            type="button"
                            className="dc-btn dc-btn-sm dc-btn-peligro"
                            disabled={n > 0}
                            title={n > 0 ? `No se puede eliminar: tiene ${n} ${n === 1 ? 'documento emitido' : 'documentos emitidos'}. Desactívelo.` : 'Eliminar este modelo'}
                            aria-label={n > 0 ? `No se puede eliminar ${m.nombre}: tiene ${n} documentos emitidos` : `Eliminar ${m.nombre}`}
                            onClick={() => setBorrando(m)}
                          >
                            <Trash2 size={12} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {creando && <NuevoModelo onCerrar={() => setCreando(false)} />}

      {borrando && (
        <Modal
          titulo="Eliminar modelo"
          Icono={Trash2}
          onCerrar={() => setBorrando(null)}
          ancho={440}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setBorrando(null)}>Cancelar</button>
            <button type="button" className="pl-btn-save" onClick={() => eliminar(borrando)}>Eliminar</button>
          </>}
        >
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--text-heading)' }}>
            Se eliminará «{borrando.nombre}». No tiene documentos emitidos, así que no deja nada sin origen. El cambio queda registrado en la bitácora.
          </p>
        </Modal>
      )}
    </div>
  )
}

/* Un modelo desde cero: nombre y categoría, y al editor. Nace activo pero sin plantilla
   publicada, así que no aparece al emitir hasta que se publique (RN-17). */
function NuevoModelo({ onCerrar }) {
  const { setModelos, anotarConfig, usuario } = useDocumentacion()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('certificado')
  const listo = nombre.trim().length > 2

  function crear() {
    const id = nuevoId()
    setModelos(prev => [...prev, {
      id, nombre: nombre.trim(), categoria,
      disponibleSolicitud: false, circuito: 'sin_aprobacion', aprobador: 'Responsable de RR.HH.',
      sensible: false, estado: 'activo', base: false,
      versiones: [{ v: 1, texto: '', estado: 'borrador', publicadaPor: usuario, fecha: dias(0) }],
    }])
    anotarConfig(`Creó el modelo «${nombre.trim()}»`)
    navigate(`/documentos/configuracion/modelos/${id}`)
  }

  return (
    <Modal
      titulo="Nuevo modelo"
      Icono={Plus}
      onCerrar={onCerrar}
      ancho={460}
      pie={<>
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="pl-btn-save" disabled={!listo} onClick={crear}>Crear y abrir el editor</button>
      </>}
    >
      <label className="pl-label" htmlFor="xc-nm-nombre">
        Nombre del modelo
        <input id="xc-nm-nombre" className="pl-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Certificado de vacaciones" autoFocus />
      </label>
      <div className="pl-label">
        Categoría
        <Desplegable
          valor={categoria}
          onCambio={setCategoria}
          ariaLabel="Categoría"
          opciones={Object.entries(CATEGORIAS).map(([k, c]) => ({ valor: k, etiqueta: c.label }))}
        />
      </div>
      <p className="xc-ayuda">Se crea sin plantilla publicada: no aparecerá al emitir hasta que la escriba y la publique.</p>
    </Modal>
  )
}
