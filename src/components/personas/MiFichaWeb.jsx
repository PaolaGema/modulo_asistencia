import { useMemo, useState } from 'react'
import {
  User, Briefcase, FileText, Monitor, GraduationCap, Info, Eye, EyeOff, Download,
  AlertTriangle, Gift, Sparkles, Check, X, Image, ChevronRight,
} from 'lucide-react'
import {
  pestanasCon, partesDe, documentosDe, agrupar, lineas, titularDe, resumenDe, porRenovar, FORMATO_PROPIO,
  PESTANAS_COLABORADOR, pestanaConEditables, preferenciasEditables,
} from '../../data/miFichaLectura'
import { tarjetasDe } from '../../data/fichaColaborador'
import { useEdicionPerfil } from '../../hooks/useEdicionPerfil'
import RielPasos from './RielPasos'
import TarjetaCampos from '../organizacion/TarjetaCampos'
import Acordeon from './Acordeon'
import HojaDocumento from './HojaDocumento'

/* «MI FICHA» EN LA WEB, IGUAL QUE EN EL TELÉFONO: una lista con las secciones de la ficha, y cada
   una se abre en su propia pantalla con «Volver a Mi perfil». Se lee y no se edita: su
   Información Personal, con sus documentos, y sus preferencias las cambia en Configuración ›
   Editar perfil de usuario (`EditarPerfil`). Lo que se enseña y cómo se lee sale de
   `miFichaLectura`, el mismo módulo que usa el teléfono. */

const ICONOS = { personal: User, laboral: Briefcase, perfil: GraduationCap, documentos: FileText, recursos: Monitor }
const ESTADO = {
  vigente: { t: 'Vigente', cls: 'mf-est vig' },
  'por-vencer': { t: 'Por vencer', cls: 'mf-est por' },
  vencido: { t: 'Vencido', cls: 'mf-est ven' },
}

function Guardado() {
  return <span className="mf-guardado"><Check size={13} /> Cambios guardados</span>
}

/* «Cambios guardados» se ve un par de segundos después de guardar y se va solo. */
function useAvisoGuardado() {
  const [visto, setVisto] = useState(false)
  const avisar = () => { setVisto(true); setTimeout(() => setVisto(false), 2200) }
  return [visto, avisar]
}

/* UNA SECCIÓN DE MI FICHA: un acordeón, como en «Editar perfil», con los datos escritos como en la
   hoja de expediente de la vista previa de RR.HH. —rótulo, línea de puntos, dato— (2 oct 2026).
   Sin la cuenta «X de Y»: leyendo, parece una tarea pendiente. Lo que se enseña lo decide `leer`
   (sólo lo que tiene valor, así que no hay renglones con guion; los archivos van a Documentación).
   Los montos llevan el formato de la ficha del colaborador —«Bs 8.500»— y los reservados se tapan
   hasta que se pide verlos. */
function SeccionLeida({ s, form, abierta, onAlternar }) {
  const [ver, setVer] = useState(false)
  const datos = new Map(s.bloques.flatMap(b => b.datos).map(d => [d.key, d]))
  const conValor = s.campos.filter(c => c.tipo === 'rotulo' || datos.has(c.key))
  // Un rótulo sin datos debajo —«Contacto 3» vacío— no se enseña.
  const campos = conValor
    .filter((c, i) => c.tipo !== 'rotulo' || (conValor[i + 1] && conValor[i + 1].tipo !== 'rotulo'))
    .map(c => {
      const d = datos.get(c.key)
      if (!d || !(d.reservado || FORMATO_PROPIO.has(c.key.split('#')[0]))) return c
      return { ...c, leer: () => (d.reservado && !ver ? '••••••' : d.valor) }
    })
  return (
    <Acordeon titulo={s.titulo} abierto={abierta} onAlternar={onAlternar}>
      {s.reservada && (
        <button type="button" className="mf-mini gris mf-ver-montos" onClick={() => setVer(v => !v)}>
          {ver ? <EyeOff size={12} /> : <Eye size={12} />} {ver ? 'Ocultar montos' : 'Mostrar montos'}
        </button>
      )}
      {s.vacia
        ? <p className="mf-nota" style={{ fontStyle: 'italic', margin: 0 }}>Sin asignaciones en esta categoría.</p>
        : <TarjetaCampos campos={campos} form={form} set={() => {}} editando={false} papel desnudo prefijo="mf" />}
    </Acordeon>
  )
}

const esImagen = d => /\.(jpe?g|png|webp)$/i.test(d.archivo)

/* ── VER UN DOCUMENTO ──────────────────────────────────────────────────────
   La hoja a la izquierda y lo que se sabe de ella a la derecha, con la descarga a mano. */
function Visor({ doc, titular, onCerrar }) {
  const e = ESTADO[doc.estado]
  return (
    <div className="mf-velo" onClick={onCerrar}>
      <div className="mf-modal mf-visor" role="dialog" aria-modal="true" aria-labelledby="mf-visor-tit" onClick={ev => ev.stopPropagation()}>
        <button type="button" className="mf-cerrar" aria-label="Cerrar" onClick={onCerrar}><X size={18} /></button>
        <div className="mf-visor-hoja"><HojaDocumento doc={doc} titular={titular} /></div>
        <aside className="mf-visor-datos">
          <p className="mf-grupo-tit">{doc.grupo}</p>
          <h3 id="mf-visor-tit">{doc.nombre}</h3>
          <dl className="mf-datos">
            <div><dt>Archivo</dt><dd>{doc.archivo}</dd></div>
            {doc.emite && <div><dt>Fecha de emisión</dt><dd>{doc.emite}</dd></div>}
            {doc.vence && <div><dt>Fecha de vencimiento</dt><dd>{doc.vence}</dd></div>}
            {e && <div><dt>Estado</dt><dd><span className={e.cls}>{e.t}</span></dd></div>}
          </dl>
          <button type="button" className="mf-btn primario" style={{ marginTop: 16 }}><Download size={14} /> Descargar</button>
        </aside>
      </div>
    </div>
  )
}

/* UN DOCUMENTO, COMO EN «NUEVO COLABORADOR» PERO SIN CAMBIARLO: su rótulo arriba, la hoja con el
   archivo —tocarla lo abre— y en la esquina Ver y Descargar, los mismos botones flotantes del
   recuadro de RR.HH. Debajo, sus fechas y su estado. */
function DocumentoLeido({ d, onVer }) {
  const e = ESTADO[d.estado]
  const fechas = [d.emite && `Emitido ${d.emite}`, d.vence && `Vence ${d.vence}`].filter(Boolean).join(' · ')
  return (
    <div className="c-tercio">
      <span className="pl-label">{d.nombre}</span>
      <div className="sa-doc">
        <div className="sa-hoja con-archivo">
          <button type="button" className="mf-doc-abrir" onClick={onVer} aria-label={`Ver ${d.nombre}`}>
            {esImagen(d) ? <Image size={22} /> : <FileText size={22} />}
            <span>{d.archivo}</span>
          </button>
          <div className="sa-hoja-acciones">
            <button type="button" className="sa-flota" onClick={onVer} title="Ver" aria-label={`Ver ${d.nombre}`}><Eye size={14} /></button>
            <button type="button" className="sa-flota" title="Descargar" aria-label={`Descargar ${d.nombre}`}><Download size={14} /></button>
          </div>
        </div>
        <div className="sa-doc-pie">
          <div className="sa-datos"><span className="sa-peso">{fechas || 'Sin vencimiento'}</span></div>
          {e && <span className={e.cls}>{e.t}</span>}
        </div>
      </div>
    </div>
  )
}

function Documentos({ form }) {
  const [viendo, setViendo] = useState(null)
  const [cerradas, setCerradas] = useState(() => new Set())
  const alternar = t => setCerradas(a => { const n = new Set(a); n.has(t) ? n.delete(t) : n.add(t); return n })
  const docs = documentosDe(form)
  const renovar = docs.filter(d => d.estado === 'por-vencer' || d.estado === 'vencido')
  return (
    <>
      {renovar.map(d => (
        <div key={d.key} className={`mf-aviso${d.estado === 'vencido' ? ' rojo' : ''}`}>
          <AlertTriangle size={15} />
          <span><b>{d.nombre.split(' · ').pop()}</b> {d.estado === 'vencido' ? 'venció' : 'vence'} el {d.vence}. Renuévelo y envíe la copia a RR.HH.</span>
        </div>
      ))}
      <div className="cn-acordeones">
        {agrupar(docs, 'grupo').map(g => (
          <Acordeon key={g.titulo} titulo={g.titulo} abierto={!cerradas.has(g.titulo)} onAlternar={() => alternar(g.titulo)}>
            <div className="emp-form">
              {g.items.map(d => <DocumentoLeido key={d.key} d={d} onVer={() => setViendo(d)} />)}
            </div>
          </Acordeon>
        ))}
      </div>
      <p className="mf-nota">Los documentos de su Información Personal puede cambiarlos en Configuración › Editar perfil de usuario. Los demás los sube RR.HH.</p>
      {viendo && <Visor doc={viendo} titular={titularDe(form)} onCerrar={() => setViendo(null)} />}
    </>
  )
}

/* ── MI FICHA EN «MI PERFIL»: LA LISTA ────────────────────────────────────
   Una fila por sección, con lo que tiene dentro dicho en una línea. El punto naranja avisa que
   hay un documento por renovar, igual que en el teléfono. */
export default function MiFichaWeb({ ficha, onAbrir }) {
  const form = ficha.form
  const renovar = porRenovar(form).length > 0
  return (
    <div className="mf">
      <div className="mf-cab">
        <div>
          <h2>Mi ficha</h2>
          <p>Revise sus datos registrados por RR.HH.</p>
        </div>
        <span className="mf-fecha">Actualizada {ficha.actualizada}</span>
      </div>
      <div className="mf-filas">
        {pestanasCon(form).map(p => {
          const I = ICONOS[p.key] || FileText
          return (
            <button key={p.key} type="button" className="mf-fila" onClick={() => onAbrir(p.key)}>
              <span className="mf-fila-ico"><I size={18} /></span>
              <span className="mf-fila-txt">
                <strong>{p.titulo}</strong>
                <span>{resumenDe(form, p.key)}</span>
              </span>
              {p.key === 'documentos' && renovar && <span className="mf-punto" aria-label="Hay documentos por renovar" />}
              <ChevronRight size={18} className="mf-fila-flecha" />
            </button>
          )
        })}
      </div>
    </div>
  )
}


/* ── UNA SECCIÓN DE MI FICHA, EN SU PROPIA PANTALLA ─────────────────────────
   Se entra desde la lista de Mi ficha del perfil y se vuelve por la miga. Sin riel: los pasos
   numerados son para llenar un formulario, y esto sólo se lee. Las partes de una sección —las
   tres de Información Laboral— van una debajo de otra con su título. */
export function SeccionMiFicha({ ficha, pestana }) {
  const form = ficha.form
  if (pestana === 'documentos') return <div className="mf-cuerpo"><Documentos form={form} /></div>
  return (
    <div className="mf-cuerpo">
      <div className="mf-info">
        <Info size={15} />
        <span>{pestanaConEditables(pestana)
          ? 'Estos datos los mantiene usted al día. Para cambiarlos, entre a Configuración › Editar perfil de usuario.'
          : pestana === 'recursos'
            ? 'Lo que la empresa le entregó para trabajar.'
            : 'Estos datos los registró RR.HH.'}</span>
      </div>
      <PartesLeidas partes={partesDe(pestana, form)} form={form} />
    </div>
  )
}

/* Las partes de la pestaña, una debajo de otra, cada una con sus acordeones. Todos abiertos de
   entrada: esto se viene a leer, y doce clics para ver la propia ficha son once de más. */
function PartesLeidas({ partes, form }) {
  const [cerradas, setCerradas] = useState(() => new Set())
  const alternar = id => setCerradas(a => { const n = new Set(a); n.has(id) ? n.delete(id) : n.add(id); return n })
  return partes.map(parte => (
    <div key={parte.key} className="mf-parte">
      {parte.titulo && partes.length > 1 && <h3>{parte.titulo}</h3>}
      <div className="cn-acordeones">
        {parte.secciones.map(s => (
          <SeccionLeida key={s.id} s={s} form={form} abierta={!cerradas.has(s.id)} onAlternar={() => alternar(s.id)} />
        ))}
      </div>
    </div>
  ))
}

/* ── CONFIGURACIÓN › EDITAR PERFIL DE USUARIO ──────────────────────────────
   Su Información Personal —la suya y la de su familia— con los documentos que van en ella, y sus
   preferencias. Los campos están abiertos desde que se entra; los cambios se juntan y se guardan
   todos con «Guardar cambios», en la barra que aparece abajo apenas hay uno. Lo que se escribe y
   cómo se guarda vive en `useEdicionPerfil`, lo mismo que en el teléfono. */

const ESCRIBIBLES = new Set(['texto', 'lista', 'siNo', 'archivo', undefined])
const vacio = v => v === null || v === undefined || (typeof v === 'string' && v.trim() === '') || (typeof v === 'object' && !v?.nombre)
function contarLlenos(s, vivo) {
  const esc = s.campos.filter(c => ESCRIBIBLES.has(c.tipo) && c.tipo !== 'rotulo' && c.tipo !== 'repetir' && c.deducido === undefined && !c.oculto)
  return { llenos: esc.filter(c => !vacio(vivo[c.key])).length, total: esc.length }
}

function CamposSeccion({ s, ed }) {
  return (
    <TarjetaCampos
      campos={s.campos}
      form={ed.vivo}
      set={ed.set}
      aplicar={ed.aplicar}
      editando
      prefijo="mf"
      marcarFaltas={false}
      desnudo
    />
  )
}

/* Las pestañas del riel son las de la ficha que tienen algo que él pueda editar —lo decide la
   empresa en `configFicha`— y Preferencias al final, si también la puede editar. */
const PREFERENCIAS = { key: 'preferencias', titulo: 'Preferencias', pista: 'Regalos y experiencias que le gustarían', partes: ['preferencias'] }
const pestanasPerfil = partes => [
  ...PESTANAS_COLABORADOR
    .map(p => ({ key: p.key, titulo: p.titulo, pista: p.pista, partes: p.partes.filter(k => partes.some(x => x.key === k)) }))
    .filter(p => p.partes.length),
  ...(preferenciasEditables() ? [PREFERENCIAS] : []),
]

export function EditarPerfil({ ficha, onGuardar }) {
  const ed = useEdicionPerfil(ficha.form, onGuardar)
  const [guardado, avisar] = useAvisoGuardado()
  const [docViendo, setDocViendo] = useState(null)
  const PESTANAS_PERFIL = useMemo(() => pestanasPerfil(ed.partes), [ed.partes])
  const TITULO_PARTE = Object.fromEntries([...ed.partes.map(p => [p.key, p.titulo]), ['preferencias', 'Preferencias']])
  const [paso, setPaso] = useState(() => PESTANAS_PERFIL[0]?.partes[0] || 'quien')

  const pestana = PESTANAS_PERFIL.find(t => t.partes.includes(paso)) || PESTANAS_PERFIL[0]
  const parteActual = ed.partes.find(p => p.key === paso)

  const avance = useMemo(() => {
    const m = {}
    for (const p of ed.partes) {
      let puestos = 0, total = 0
      for (const s of p.secciones) {
        const c = contarLlenos(s, ed.vivo)
        puestos += c.llenos; total += c.total
      }
      m[p.key] = { puestos, total, pct: total ? Math.round(puestos * 100 / total) : 0 }
    }
    m.preferencias = { puestos: 0, total: 0, pct: 0 }
    return m
  }, [ed.partes, ed.vivo])

  const avancePestana = useMemo(() => {
    const m = {}
    for (const t of PESTANAS_PERFIL) {
      let puestos = 0, total = 0
      for (const k of t.partes) { puestos += avance[k]?.puestos || 0; total += avance[k]?.total || 0 }
      m[t.key] = { puestos, total, pct: total ? Math.round(puestos * 100 / total) : 0 }
    }
    return m
  }, [avance, PESTANAS_PERFIL])

  const itemsRiel = PESTANAS_PERFIL.map((t, i) => ({ key: t.key, n: i + 1, titulo: t.titulo, pista: t.pista }))
  const irAPestana = clave => setPaso(PESTANAS_PERFIL.find(t => t.key === clave)?.partes[0] || 'quien')
  const conPartes = new Set(PESTANAS_PERFIL.filter(t => t.partes.length > 1).map(t => t.key))

  const [abiertos, setAbiertos] = useState(() => {
    const first = ed.partes[0]?.secciones[0]
    return first ? [first.titulo] : []
  })
  const alternar = t => setAbiertos(a => a.includes(t) ? a.filter(x => x !== t) : [...a, t])

  // Si la empresa no le deja editar nada, lo dice en vez de enseñar un formulario vacío.
  if (!pestana) {
    return (
      <div className="mf-cuerpo">
        <div className="mf-info">
          <Info size={15} />
          <span>Su empresa no tiene datos de la ficha para que usted los edite. Si algo no está bien, pida la corrección a RR.HH.</span>
        </div>
      </div>
    )
  }

  const contenido = paso === 'preferencias' ? (
    <PreferenciasEditables ed={ed} />
  ) : parteActual ? (
    <div className="cn-acordeones">
      {parteActual.secciones.map(s => {
        const { llenos, total } = contarLlenos(s, ed.vivo)
        return (
          <Acordeon key={s.id} titulo={s.titulo} abierto={abiertos.includes(s.titulo)} onAlternar={() => alternar(s.titulo)} llenos={llenos} total={total}>
            <CamposSeccion s={s} ed={ed} />
          </Acordeon>
        )
      })}
    </div>
  ) : null

  return (
    <div className="mf-cuerpo">
      <div className="mf-info">
        <Info size={15} />
        <span>Mantenga al día su información personal y sus documentos. Lo laboral lo registra RR.HH.</span>
      </div>
      <div className="cn-grid">
        <RielPasos
          pasos={itemsRiel}
          actual={pestana.key}
          onIr={irAPestana}
          avance={avancePestana}
          partes={pestana.partes.length > 1 ? pestana.partes.map(k => ({
            key: k,
            titulo: TITULO_PARTE[k] || k,
            on: k === paso,
            pct: avance[k]?.pct ?? 0,
            puestos: avance[k]?.puestos,
            total: avance[k]?.total,
          })) : undefined}
          onParte={setPaso}
          conPartes={conPartes}
        />
        <div className="cn-cuerpo">
          <div className="cn-paso-cab cn-entra" key={`cab-${paso}`}>
            <h2>
              {pestana.partes.length > 1
                ? `${PESTANAS_PERFIL.indexOf(pestana) + 1}.${pestana.partes.indexOf(paso) + 1} · ${TITULO_PARTE[paso] || paso}`
                : `${PESTANAS_PERFIL.indexOf(pestana) + 1} · ${pestana.titulo}`}
            </h2>
            <p>{pestana.partes.length > 1 ? `${pestana.titulo} · ${pestana.pista}` : pestana.pista}</p>
          </div>
          {contenido}
        </div>
      </div>
      {(ed.hayCambios || guardado) && (
        <div className="mf-barra-guardar">
          {ed.hayCambios ? (
            <>
              <span className={ed.faltan.length ? 'falta' : ''}>
                {ed.faltan.length
                  ? `Complete ${ed.faltan.length === 1 ? 'el dato obligatorio' : `los ${ed.faltan.length} datos obligatorios`}`
                  : ed.cuantos === 1 ? '1 cambio sin guardar' : ed.cuantos ? `${ed.cuantos} cambios sin guardar` : 'Cambios sin guardar'}
              </span>
              <button type="button" className="mf-btn" onClick={ed.descartar}>Descartar</button>
              <button type="button" className="mf-btn primario" disabled={ed.faltan.length > 0} onClick={() => { if (ed.guardar()) avisar() }}>Guardar cambios</button>
            </>
          ) : <Guardado />}
        </div>
      )}
      {docViendo && <Visor doc={docViendo} titular={titularDe(ficha.form)} onCerrar={() => setDocViendo(null)} />}
    </div>
  )
}

// La misma sección y las mismas tablitas que llena RR.HH. en «Nuevo colaborador».
function PreferenciasEditables({ ed }) {
  const [abierto, setAbierto] = useState(true)
  const t = tarjetasDe('quien', ed.vivo, {}).find(x => x.id === 'preferencias')
  if (!t) return null
  const llenos = t.campos.filter(c => lineas(ed.vivo[c.key]).length).length
  return (
    <div className="cn-acordeones">
      <Acordeon titulo={t.titulo} desc={t.desc} abierto={abierto} onAlternar={() => setAbierto(a => !a)} llenos={llenos} total={t.campos.length}>
        <TarjetaCampos campos={t.campos} form={ed.vivo} set={ed.set} aplicar={ed.aplicar} editando prefijo="mf" marcarFaltas={false} desnudo />
      </Acordeon>
    </div>
  )
}

const GRUPOS_PREF = [
  ['regalos', Gift, 'Regalos que le gustaría recibir', 'Sin regalos agregados', 'Ej.: Un libro', 'Indique detalles que le alegrarían en su cumpleaños o en un reconocimiento.'],
  ['experiencias', Sparkles, 'Experiencias que le gustaría vivir', 'Sin experiencias agregadas', 'Ej.: Un viaje', 'Indique actividades o vivencias que la empresa podría regalarle.'],
]
const prefDe = form => ({ regalos: lineas(form['ra.f1']), experiencias: lineas(form['ra.f4']) })

/* Regalos y experiencias en Mi perfil: para mirar. Se cambian en Configuración. */
export function Preferencias({ ficha }) {
  const actual = prefDe(ficha.form)
  return (
    <div className="mf-pref">
      {GRUPOS_PREF.map(([k, I, t, vacio]) => (
        <div key={k} style={{ width: '100%' }}>
          <h2 className="mf-pref-tit"><I size={18} /> {t}</h2>
          {actual[k].length
            ? <div className="mf-chips">{actual[k].map(x => <span key={x}>{x}</span>)}</div>
            : <p className="mf-nota" style={{ fontStyle: 'italic' }}>{vacio}</p>}
        </div>
      ))}
    </div>
  )
}

