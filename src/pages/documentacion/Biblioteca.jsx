import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Copy, Library, Lock, Pencil, Plus, Power, Search, Trash2 } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { dias, fechaCorta, numeracionDe, tiposDoc } from '../../data/documentacionData'
import { Etiqueta, MenuAcciones, Modal, Vacio } from '../../components/documentacion/comunes'
import Desplegable from '../../components/layout/Desplegable'
import Paginacion from '../../components/layout/Paginacion'
import { versionPublicada } from './emisionUtil'
import './emision.css'
import './configuracion.css'

/* ── MODELOS Y PLANTILLAS (pantalla 9, revisada · RF-42, RF-43, RF-50) ────
   UNA sola lista para certificados, memorándums, contratos y otros documentos, donde el Salar
   tiene tres pantallas casi iguales. La tabla se quedó con lo esencial —qué es, qué plantilla
   tiene publicada, si está activo— y las acciones van en el menú de cada fila.

   UN MODELO NUEVO PUEDE NACER DE UN ARCHIVO: quien ya tiene su certificado en Word lo sube, y
   el sistema le dice qué campos variables reconoció y cuáles no existen en el catálogo, antes de
   abrir el editor.

   LOS MODELOS DE FÁBRICA NO SE TOCAN: se duplican (RF-50). La NUMERACIÓN vive acá, en su pestaña,
   porque es de los modelos y no de los tipos de documento. */

/* Diez por página, como Expedientes: las plantillas propias pueden ser muchas. */
const POR_PAGINA = 10

const nuevoId = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`

/* La pantalla es una pestaña de Configuración (`Configuracion.jsx`). */
export function Modelos() {
  const { modelos, setModelos, emitidos, contratos, parametros, anotarConfig, usuario } = useDocumentacion()
  const CATEGORIAS = tiposDoc(parametros)
  const navigate = useNavigate()
  const [categoria, setCategoria] = useState('')
  const [estado, setEstado] = useState('todos')
  const [busca, setBusca] = useState('')
  const [borrando, setBorrando] = useState(null)
  const [bloqueado, setBloqueado] = useState(null)
  const [pag, setPag] = useState(1)

  /* Cuántos documentos salieron de cada modelo: decide si se puede eliminar (RF-08). */
  const usos = useMemo(() => {
    const n = {}
    for (const e of emitidos) n[e.modeloId] = (n[e.modeloId] || 0) + 1
    for (const c of contratos) n[c.modeloId] = (n[c.modeloId] || 0) + 1
    return n
  }, [emitidos, contratos])

  const visibles = modelos.filter(m =>
    (!categoria || m.categoria === categoria)
    && (estado === 'todos' || m.estado === estado)
    && m.nombre.toLowerCase().includes(busca.trim().toLowerCase()))
  const paginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA))
  const pagina = Math.min(pag, paginas)
  const deLaPagina = visibles.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  function duplicar(m) {
    const pub = versionPublicada(m) || m.versiones[m.versiones.length - 1]
    const copia = {
      ...m,
      id: nuevoId(),
      nombre: `${m.nombre} (copia)`,
      base: false,
      origenId: m.id,
      /* La copia arranca INACTIVA, que es el borrador: activarla sin mirarla sería tener dos
         plantillas iguales con nombres distintos. */
      estado: 'inactivo',
      versiones: [{ v: 1, texto: pub?.texto || '', estado: 'publicada', publicadaPor: usuario, fecha: dias(0) }],
    }
    setModelos(prev => [...prev, copia])
    anotarConfig(`Duplicó el modelo «${m.nombre}»`)
    navigate(`/documentos/configuracion/plantillas/${copia.id}`)
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
    <>
      <div className="xc-herramientas">
        <label className="xc-buscar">
          <Search size={14} aria-hidden="true" />
          <input className="pl-input" type="search" placeholder="Buscar por nombre…" value={busca} onChange={e => { setBusca(e.target.value); setPag(1) }} aria-label="Buscar modelo" />
        </label>
        <div style={{ width: 220 }}>
          <Desplegable valor={categoria} onCambio={v => { setCategoria(v); setPag(1) }} ariaLabel="Tipo" opciones={[{ valor: '', etiqueta: 'Todos los tipos' }, ...Object.entries(CATEGORIAS).filter(([k]) => k !== 'otro' || modelos.some(m => m.categoria === 'otro')).map(([k, c]) => ({ valor: k, etiqueta: `${c.plural} (${modelos.filter(m => m.categoria === k).length})` }))]} />
        </div>
        <div className="xc-seg" role="group" aria-label="Estado">
          {[['todos', 'Todos'], ['activo', 'Activos'], ['inactivo', 'Inactivos']].map(([k, t]) => (
            <button key={k} type="button" className={estado === k ? 'on' : ''} aria-pressed={estado === k} onClick={() => { setEstado(k); setPag(1) }}>{t}</button>
          ))}
        </div>
        <button type="button" className="pl-btn-new" style={{ marginLeft: 'auto' }} onClick={() => navigate('/documentos/configuracion/plantillas/nuevo')}>
          <Plus size={14} color="#00E091" /> Nuevo modelo
        </button>
      </div>

      {visibles.length === 0 ? (
        <div className="dc-tarjeta">
          <Vacio Icono={Library} titulo="Ningún modelo coincide" texto={`Se buscó «${busca || 'todo'}» en ${categoria ? CATEGORIAS[categoria]?.plural.toLowerCase() : 'todos los tipos'}, con estado ${estado === 'todos' ? 'cualquiera' : estado}.`}>
            <button type="button" className="dc-btn" onClick={() => { setBusca(''); setCategoria(''); setEstado('todos') }}>Limpiar filtros</button>
          </Vacio>
        </div>
      ) : (
        <div className="as-table-wrap xd-con-menu">
          <table className="as-table xc-tabla xd-tabla">
            <thead>
              <tr><th>Modelo</th><th>Tipo</th><th>Última edición</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr>
            </thead>
            <tbody>
              {deLaPagina.map(m => {
                const pub = versionPublicada(m)
                const n = usos[m.id] || 0
                const abrir = () => navigate(`/documentos/configuracion/plantillas/${m.id}`)
                return (
                  <tr key={m.id} className={`xd-fila-link${m.estado === 'activo' ? '' : ' inactivo'}`} onClick={abrir}>
                    <td data-etq="Modelo">
                      <div className="xc-nombre">
                        <b>{m.nombre}</b>
                        <small>
                          {m.base ? <><Lock size={10} aria-hidden="true" /> De fábrica · </> : 'Propio · '}
                          {n === 0 ? 'sin emitidos' : `${n} ${n === 1 ? 'emitido' : 'emitidos'}`}
                        </small>
                      </div>
                    </td>
                    <td data-etq="Tipo"><span className="xd-tipo"><span style={{ background: CATEGORIAS[m.categoria]?.color }} aria-hidden="true" />{CATEGORIAS[m.categoria]?.label || 'Otro documento'}</span></td>
                    <td data-etq="Última edición">
                      {pub
                        ? <span className="xc-nombre"><b>{fechaCorta(pub.fecha)}</b><small>{pub.publicadaPor}</small></span>
                        : <Etiqueta tono="ambar" titulo="Ábrala y guárdela para poder usarla">Sin guardar</Etiqueta>}
                    </td>
                    <td data-etq="Estado"><Etiqueta tono={m.estado === 'activo' ? 'verde' : 'gris'}>{m.estado === 'activo' ? 'Activo' : 'Inactivo'}</Etiqueta></td>
                    <td className="xd-acc" onClick={e => e.stopPropagation()}>
                      <MenuAcciones etiqueta={`Acciones de ${m.nombre}`} items={[
                        { label: 'Editar', Icono: Pencil, onClick: abrir },
                        { label: 'Duplicar', Icono: Copy, titulo: 'Crea otra plantilla a partir de esta, para una variante', onClick: () => duplicar(m) },
                        { label: m.estado === 'activo' ? 'Desactivar' : 'Activar', Icono: Power, titulo: m.estado === 'activo' ? 'Un modelo inactivo no aparece al emitir' : 'Vuelve a aparecer al emitir', onClick: () => alternar(m) },
                        /* ELIMINAR SÓLO LO QUE NO TIENE HISTORIA (RF-08), y al pulsarlo dice por
                           qué no: un botón apagado sin explicación se lee como una falla. */
                        !m.base && { label: 'Eliminar', Icono: Trash2, peligro: true, onClick: () => (n > 0 ? setBloqueado({ m, n }) : setBorrando(m)) },
                      ]} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Paginacion page={pagina} setPage={setPag} total={visibles.length} perPage={POR_PAGINA} nombre="plantillas" nombreUno="plantilla" />
        </div>
      )}

      {bloqueado && (
        <Modal titulo="No se puede eliminar" Icono={Trash2} onCerrar={() => setBloqueado(null)} ancho={460}
          pie={<>
            <button type="button" className="pl-btn-cancel" onClick={() => setBloqueado(null)}>Cerrar</button>
            {bloqueado.m.estado === 'activo' && <button type="button" className="pl-btn-save" onClick={() => { alternar(bloqueado.m); setBloqueado(null) }}>Desactivarlo</button>}
          </>}
        >
          <p className="xd-nota">«<b>{bloqueado.m.nombre}</b>» tiene {bloqueado.n} {bloqueado.n === 1 ? 'documento emitido' : 'documentos emitidos'}. Borrarlo los dejaría sin origen (RF-08); puede desactivarlo para que no aparezca al emitir.</p>
        </Modal>
      )}

      {borrando && (
        <Modal titulo="Eliminar modelo" Icono={Trash2} onCerrar={() => setBorrando(null)} ancho={440}
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
    </>
  )
}

/* ── LA NUMERACIÓN CORRELATIVA (RF-07, RN-15) ─────────────────────────────
   Un prefijo y una cantidad de dígitos por categoría. Se edita un borrador y se guarda de una vez:
   cambiar un prefijo a medio escribir no puede dejar un CITE a medias en el próximo certificado. */
const soloNumero = v => v.replace(/\D/g, '')
const ejemplo = cfg => (cfg.formato || '{prefijo}-{n}/{gestion}')
  .replace('{prefijo}', cfg.prefijo || '¿?')
  .replace('{n}', '1'.padStart(Number(cfg.digitos) || 1, '0'))
  .replace('{gestion}', new Date().getFullYear())

export function Numeracion() {
  const { parametros, setParametros, anotarConfig } = useDocumentacion()
  const CATEGORIAS = tiposDoc(parametros)
  const base = () => Object.fromEntries(Object.keys(CATEGORIAS).map(c => [c, { ...numeracionDe(parametros, c) }]))
  const [num, setNum] = useState(base)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')

  const setCampo = (cat, k, v) => { setNum(prev => ({ ...prev, [cat]: { ...prev[cat], [k]: v } })); setGuardado(false) }
  const normal = Object.fromEntries(Object.entries(num).map(([k, v]) => [k, { ...v, prefijo: v.prefijo.trim().toUpperCase(), digitos: Math.min(8, Math.max(1, Number(v.digitos) || 4)) }]))
  const sucio = JSON.stringify(normal) !== JSON.stringify(base())

  const guardar = () => {
    if (Object.values(normal).some(c => !c.prefijo)) return setError('Cada tipo necesita su prefijo: sin él no hay CITE.')
    setError('')
    setParametros(prev => ({ ...prev, numeracion: { ...prev.numeracion, ...normal } }))
    anotarConfig('Cambió la numeración de los documentos emitidos')
    setNum(normal)
    setGuardado(true)
  }

  return (
    <>
      <section className="dc-tarjeta" style={{ maxWidth: 760 }}>
        <div className="dc-tarjeta-cab"><h2>Numeración correlativa</h2></div>
        <div className="dc-tarjeta-cuerpo" style={{ gap: 0 }}>
          {Object.entries(CATEGORIAS).map(([cat, c]) => {
            const cfg = num[cat]
            return (
              <div key={cat} className="xd-numeracion">
                <b style={{ fontSize: 12.5, color: 'var(--text-heading)' }}>{c.plural}</b>
                <span className="xd-fila" style={{ gap: 6, flexWrap: 'nowrap' }}>
                  <span className="xd-ayuda">Prefijo</span>
                  <input className="pl-input" style={{ width: 90 }} aria-label={`Prefijo de ${c.plural}`} value={cfg.prefijo} onChange={e => setCampo(cat, 'prefijo', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} />
                  <span className="xd-ayuda">Dígitos</span>
                  <input className="pl-input" style={{ width: 52 }} inputMode="numeric" aria-label={`Dígitos de ${c.plural}`} value={cfg.digitos} onChange={e => setCampo(cat, 'digitos', soloNumero(e.target.value).slice(0, 1))} />
                </span>
                <label className="xd-mini" title="Empieza en 1 cada gestión"><input type="checkbox" checked={cfg.reinicioAnual} onChange={e => setCampo(cat, 'reinicioAnual', e.target.checked)} /> Reinicia cada año</label>
                <span className="xd-ejemplo" aria-label={`El próximo ${c.label.toLowerCase()} de una gestión nueva saldría con`}>{ejemplo(cfg)}</span>
              </div>
            )
          })}
          <p className="xd-nota" style={{ marginTop: 10 }}>Un número no se reutiliza nunca, ni siquiera si el documento se anula (RN-15).</p>
        </div>
      </section>
      <div className="xd-guardar">
        {error ? <span className="xd-sucio" role="alert">{error}</span>
          : guardado && !sucio ? <span className="xd-guardado" role="status"><CheckCircle2 size={15} /> Cambios guardados</span>
            : sucio ? <span className="xd-sucio">Hay cambios sin guardar</span> : <span style={{ marginRight: 'auto' }} />}
        <button type="button" className="pl-btn-save" disabled={!sucio} onClick={guardar}>Guardar numeración</button>
      </div>
    </>
  )
}
