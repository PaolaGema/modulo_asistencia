import { useMemo, useState } from 'react'
import { AlertTriangle, Info, ListChecks, Pencil, Plus, Power, Trash2, Users } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera, Etiqueta, Modal, Vacio } from '../../components/documentacion/comunes'
import Desplegable from '../../components/layout/Desplegable'
import { alcanza, checklistDe, completitud, ESTADOS } from '../../data/documentacionData'
import './configuracion.css'

/* ── REQUISITOS POR PERFIL (pantalla 4, RF-10, RF-11, RF-16, flujo 7.2) ───
   Lo que el Salar no tiene y lo que sostiene todo el módulo: un conjunto dice a QUIÉN alcanza y
   QUÉ le exige. Sin esto el sistema sabe lo que hay, nunca lo que falta (brecha 1).

   EL SIMULADOR VA DENTRO DEL EDITOR Y SE MUEVE CON ÉL. Declarar un requisito hace caer el
   porcentaje de cumplimiento, porque recién ahí el sistema sabe lo que falta (nota de 7.2). Si
   eso se descubre después de aplicar, se lee como que el sistema empeoró las cosas; dicho antes
   —«esto va a marcar 84 documentos como faltantes»— es una decisión tomada a sabiendas. */

const VACIO = { nombre: '', desc: '', activo: true, criterio: { areas: [], cargos: [], sedes: [] }, requisitos: [] }

function criterioLegible(c, sucursales) {
  const { areas = [], cargos = [], sedes = [] } = c.criterio || {}
  return [
    areas.length ? `Área: ${areas.join(', ')}` : 'Cualquier área',
    cargos.length ? `Cargo: ${cargos.join(', ')}` : 'cualquier cargo',
    sedes.length ? `Sucursal: ${sedes.map(s => sucursales.find(x => x.id === s)?.nombre || s).join(', ')}` : 'cualquier sucursal',
  ].join(' · ')
}

/* Varias opciones a la vez, como casillas: un desplegable de a una obligaría a abrirlo cinco
   veces para marcar cinco áreas. Vacío quiere decir «todas», y lo dice. */
function Multi({ titulo, opciones, valor, onCambio, todas }) {
  const alternar = v => onCambio(valor.includes(v) ? valor.filter(x => x !== v) : [...valor, v])
  return (
    <div className="xd-grupo">
      <p className="xd-grupo-tit">{titulo} · {valor.length ? `${valor.length} ${valor.length === 1 ? 'elegido' : 'elegidos'}` : todas}</p>
      <div className="xd-casillas" style={{ maxHeight: 132, overflowY: 'auto' }}>
        {opciones.map(o => (
          <label key={o.valor} className={`xd-casilla${valor.includes(o.valor) ? ' on' : ''}`}>
            <input type="checkbox" checked={valor.includes(o.valor)} onChange={() => alternar(o.valor)} /> {o.etiqueta}
          </label>
        ))}
      </div>
    </div>
  )
}

function Editor({ inicial, onCerrar, onAplicar }) {
  const { personas, sucursales, subtipos, conjuntos, documentos, exoneraciones, parametros } = useDocumentacion()
  const [c, setC] = useState(inicial)
  const [intento, setIntento] = useState(false)
  const set = (k, v) => setC(prev => ({ ...prev, [k]: v }))
  const setCrit = (k, v) => setC(prev => ({ ...prev, criterio: { ...prev.criterio, [k]: v } }))
  const setReq = (i, k, v) => setC(prev => ({ ...prev, requisitos: prev.requisitos.map((r, j) => (j === i ? { ...r, [k]: v } : r)) }))

  const activos = useMemo(() => personas.filter(p => p.status !== 'desvinculado'), [personas])
  const areas = [...new Set(activos.map(p => p.depto).filter(Boolean))].sort()
  const cargos = [...new Set(activos.filter(p => !c.criterio.areas.length || c.criterio.areas.includes(p.depto)).map(p => p.cargo).filter(Boolean))].sort()
  const subActivos = subtipos.filter(s => s.activo)

  const errores = []
  if (!c.nombre.trim()) errores.push('Póngale un nombre al conjunto.')
  if (!c.requisitos.length) errores.push('Agregue al menos un requisito.')
  if (c.requisitos.some(r => !r.subtipoId)) errores.push('Hay un requisito sin documento elegido.')
  const repetidos = c.requisitos.map(r => r.subtipoId).filter((s, i, a) => s && a.indexOf(s) !== i)
  if (repetidos.length) errores.push('Hay un documento pedido dos veces en el mismo conjunto.')

  /* ── EL SIMULADOR (RF-16) ──
     Dos checklists por persona: con los conjuntos de hoy y con éste aplicado como quedaría. Lo que
     aparece en la segunda y no cumple es lo que el conjunto va a marcar como faltante. */
  const sim = useMemo(() => {
    const base = { subtipos, documentos, exoneraciones, parametros }
    const sin = conjuntos.filter(x => x.id !== c.id)
    const borrador = { ...c, id: c.id || '__borrador', requisitos: c.requisitos.filter(r => r.subtipoId) }
    const con = [...sin, borrador]
    const alcanzados = activos.filter(p => alcanza(borrador, p))
    const faltas = []
    let antes = 0, despues = 0, conPct = 0
    for (const p of alcanzados) {
      const a = checklistDe(p, { ...base, conjuntos: sin })
      const d = checklistDe(p, { ...base, conjuntos: con })
      const nuevos = d.filter(i => !a.some(x => x.requisito.subtipoId === i.requisito.subtipoId) && i.estado !== 'exonerado' && !ESTADOS[i.estado].cumple)
      if (nuevos.length) faltas.push({ p, docs: nuevos.map(i => i.subtipo?.nombre || '—') })
      const ca = completitud(a).pct, cd = completitud(d).pct
      if (cd !== null) { antes += ca ?? 100; despues += cd; conPct += 1 }
    }
    return {
      alcanzados: alcanzados.length,
      faltas,
      nDocs: faltas.reduce((n, f) => n + f.docs.length, 0),
      antes: conPct ? Math.round(antes / conPct) : null,
      despues: conPct ? Math.round(despues / conPct) : null,
    }
  }, [c, conjuntos, subtipos, documentos, exoneraciones, parametros, activos])

  const aplicar = () => {
    setIntento(true)
    if (errores.length) return
    onAplicar({ ...c, nombre: c.nombre.trim() }, sim)
  }

  return (
    <Modal
      titulo={inicial.id ? `Editar «${inicial.nombre}»` : 'Nuevo conjunto de requisitos'}
      Icono={ListChecks}
      onCerrar={onCerrar}
      ancho={860}
      pie={<>
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="pl-btn-save" onClick={aplicar}>Aplicar a {sim.alcanzados} {sim.alcanzados === 1 ? 'persona' : 'personas'}</button>
      </>}
    >
      {intento && errores.length > 0 && (
        <div className="xd-aviso" role="alert"><AlertTriangle size={15} /><div>{errores.map(e => <div key={e}>{e}</div>)}</div></div>
      )}
      <div className="xd-form">
        <label className="pl-label">Nombre
          <input className="pl-input" value={c.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Personal de almacén" />
        </label>
        <label className="pl-label">Para qué es
          <input className="pl-input" value={c.desc} onChange={e => set('desc', e.target.value)} placeholder="Quien manipula alimentos o medicamentos" />
        </label>
        <div className="xd-ancho xd-pila" style={{ gap: 10 }}>
          <p className="xd-nota"><b>A quién alcanza.</b> Lo que no marque cuenta como «todos». Si una persona queda en dos conjuntos que piden lo mismo, gana lo más exigente.</p>
          <Multi titulo="Áreas" todas="todas" valor={c.criterio.areas} onCambio={v => setC(prev => ({ ...prev, criterio: { ...prev.criterio, areas: v, cargos: prev.criterio.cargos.filter(x => activos.some(p => p.cargo === x && (!v.length || v.includes(p.depto)))) } }))} opciones={areas.map(a => ({ valor: a, etiqueta: a }))} />
          <Multi titulo="Cargos" todas="todos" valor={c.criterio.cargos} onCambio={v => setCrit('cargos', v)} opciones={cargos.map(a => ({ valor: a, etiqueta: a }))} />
          <Multi titulo="Sucursales" todas="todas" valor={c.criterio.sedes} onCambio={v => setCrit('sedes', v)} opciones={sucursales.map(s => ({ valor: s.id, etiqueta: `${s.nombre} · ${s.ciudad}` }))} />
        </div>

        <div className="xd-ancho">
          <p className="xd-grupo-tit" style={{ marginBottom: 4 }}>Qué exige (RF-11)</p>
          <div className="xd-req-fila xd-req-cab"><span>Documento</span><span>Obligatorio</span><span>Plazo</span><span>Vigencia</span><span /></div>
          {c.requisitos.map((r, i) => {
            const sub = subtipos.find(s => s.id === r.subtipoId)
            return (
              <div key={i} className="xd-req-fila">
                <Desplegable valor={r.subtipoId} onCambio={v => setReq(i, 'subtipoId', v)} ariaLabel={`Documento del requisito ${i + 1}`} placeholder="Elija el documento"
                  opciones={subActivos.map(s => ({ valor: s.id, etiqueta: s.nombre }))} />
                <label className="xd-mini"><input type="checkbox" checked={r.obligatorio} onChange={e => setReq(i, 'obligatorio', e.target.checked)} /> Obligatorio</label>
                <label className="xd-mini" title="Días desde el ingreso para entregarlo">
                  <input className="pl-input" style={{ width: 56 }} inputMode="numeric" aria-label="Plazo en días desde el ingreso" value={r.plazoDias} onChange={e => setReq(i, 'plazoDias', Number(e.target.value.replace(/\D/g, '')) || 0)} /> días
                </label>
                <label className="xd-mini" title={sub && !sub.vence ? 'Este documento no vence' : undefined} style={sub && !sub.vence ? { opacity: 0.5 } : undefined}>
                  <input type="checkbox" disabled={sub && !sub.vence} checked={!!r.exigeVigencia && (!sub || sub.vence)} onChange={e => setReq(i, 'exigeVigencia', e.target.checked)} /> Exige vigencia
                </label>
                <button type="button" className="dc-btn dc-btn-sm dc-btn-texto dc-btn-peligro" aria-label="Quitar requisito" onClick={() => set('requisitos', c.requisitos.filter((_, j) => j !== i))}><Trash2 size={13} /></button>
              </div>
            )
          })}
          <button type="button" className="dc-btn dc-btn-sm" style={{ marginTop: 10 }} onClick={() => set('requisitos', [...c.requisitos, { subtipoId: '', obligatorio: true, plazoDias: 30, exigeVigencia: false }])}>
            <Plus size={13} /> Agregar requisito
          </button>
        </div>

        <div className="xd-ancho xd-sim" aria-live="polite">
          <div className="xd-sim-cab">
            <Users size={18} aria-hidden="true" style={{ color: 'var(--dc-azul)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <b>
                {sim.nDocs
                  ? `Esto va a marcar ${sim.nDocs} ${sim.nDocs === 1 ? 'documento' : 'documentos'} como faltantes a ${sim.faltas.length} ${sim.faltas.length === 1 ? 'persona' : 'personas'}.`
                  : sim.alcanzados ? 'Nadie queda con documentos faltantes nuevos.' : 'Con este criterio no alcanza a nadie hoy.'}
              </b>
              <p className="xd-nota" style={{ marginTop: 3 }}>
                Alcanza hoy a {sim.alcanzados} {sim.alcanzados === 1 ? 'persona' : 'personas'}.
                {sim.antes !== null && sim.despues !== null && sim.despues < sim.antes && ` Su cumplimiento promedio va a pasar de ${sim.antes} % a ${sim.despues} %: no es que empeoren, es que recién ahora se mide lo que les falta.`}
                {' '}Aplicar no borra nada de lo ya cargado (RN-08).
              </p>
            </div>
          </div>
          {sim.faltas.length > 0 && (
            <ul className="xd-sim-lista">
              {sim.faltas.map(f => (
                <li key={f.p.id}><span>{f.p.name}</span><span>{f.docs.join(', ')}</span></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default function Requisitos() {
  const { conjuntos, setConjuntos, personas, sucursales, subtipos, anotarConfig } = useDocumentacion()
  const [editando, setEditando] = useState(null)
  const [aviso, setAviso] = useState(null)
  const activos = personas.filter(p => p.status !== 'desvinculado')
  const sinNada = activos.filter(p => !conjuntos.some(c => alcanza(c, p))).length

  const aplicar = (c, sim) => {
    if (c.id) setConjuntos(prev => prev.map(x => (x.id === c.id ? c : x)))
    else setConjuntos(prev => [...prev, { ...c, id: `c-${Date.now().toString(36)}`, creadoPor: 'RR.HH.', creado: new Date().toISOString().slice(0, 10) }])
    anotarConfig(`${c.id ? 'Editó' : 'Creó'} el conjunto de requisitos «${c.nombre}» (alcanza a ${sim.alcanzados})`)
    setAviso(`«${c.nombre}» aplicado a ${sim.alcanzados} personas.${sim.nDocs ? ` ${sim.nDocs} documentos pasan a figurar como faltantes.` : ''}`)
    setEditando(null)
  }

  const alternar = c => {
    setConjuntos(prev => prev.map(x => (x.id === c.id ? { ...x, activo: !x.activo } : x)))
    anotarConfig(`${c.activo ? 'Desactivó' : 'Activó'} el conjunto «${c.nombre}»`)
    setAviso(c.activo ? `«${c.nombre}» desactivado. Sus requisitos dejan de exigirse; los documentos ya cargados se conservan.` : `«${c.nombre}» activado.`)
  }

  const subNom = id => subtipos.find(s => s.id === id)?.nombre || '(documento eliminado)'

  return (
    <div className="content-scroll">
      <Cabecera titulo="Requisitos por perfil" sub="Qué documentos exige cada área, cargo o sucursal. Es lo que permite saber qué falta.">
        <button type="button" className="pl-btn-new" onClick={() => setEditando(VACIO)}><Plus size={14} color="#00E091" /> Nuevo conjunto</button>
      </Cabecera>

      {aviso && <div className="xd-aviso ok" role="status"><Info size={15} /><span>{aviso}</span></div>}
      {sinNada > 0 && (
        <div className="xd-aviso"><AlertTriangle size={15} />
          <span><b>{sinNada} {sinNada === 1 ? 'persona no tiene' : 'personas no tienen'} ningún requisito.</b> Para ellas el sistema no puede decir qué falta ni calcular su cumplimiento.</span>
        </div>
      )}

      {conjuntos.length === 0 ? (
        <div className="dc-tarjeta">
          <Vacio Icono={ListChecks} titulo="Ningún cargo tiene requisitos todavía" texto="El cumplimiento no se puede calcular hasta que se declare qué documentos exige cada perfil. Empiece por lo que se pide a todo el personal.">
            <button type="button" className="pl-btn-new" onClick={() => setEditando(VACIO)}><Plus size={14} color="#00E091" /> Nuevo conjunto</button>
          </Vacio>
        </div>
      ) : (
        <div className="xd-conjuntos">
          {conjuntos.map(c => {
            const n = activos.filter(p => alcanza({ ...c, activo: true }, p)).length
            return (
              <section key={c.id} className={`dc-tarjeta xd-conj${c.activo ? '' : ' inactivo'}`}>
                <div className="dc-tarjeta-cab">
                  <h3>{c.nombre}</h3>
                  {c.activo ? <Etiqueta tono="verde">Activo</Etiqueta> : <Etiqueta tono="gris">Inactivo</Etiqueta>}
                </div>
                <div className="dc-tarjeta-cuerpo">
                  {c.desc && <p className="xd-nota">{c.desc}</p>}
                  <p className="xd-crit"><b>Alcanza a:</b> {criterioLegible(c, sucursales)}</p>
                  <ul className="xd-reqs">
                    {c.requisitos.map(r => (
                      <li key={r.subtipoId}>
                        <span>{subNom(r.subtipoId)}</span>
                        <span>{r.obligatorio ? 'Obligatorio' : 'Opcional'} · {r.plazoDias ? `${r.plazoDias} días` : 'al ingresar'}{r.exigeVigencia ? ' · vigente' : ''}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="xd-conj-pie">
                  <span className="xd-alcance"><b>{c.activo ? n : 0}</b> {c.activo ? (n === 1 ? 'persona hoy' : 'personas hoy') : `personas (alcanzaría a ${n})`}</span>
                  <span className="xd-fila" style={{ gap: 4 }}>
                    <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={() => setEditando(c)}><Pencil size={13} /> Editar</button>
                    <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={() => alternar(c)}><Power size={13} /> {c.activo ? 'Desactivar' : 'Activar'}</button>
                  </span>
                </div>
              </section>
            )
          })}
        </div>
      )}

      {editando && <Editor inicial={editando} onCerrar={() => setEditando(null)} onAplicar={aplicar} />}
    </div>
  )
}
