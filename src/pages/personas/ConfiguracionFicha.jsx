import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Info, Lock, Pencil, RotateCcw, ShieldCheck, Smartphone, User, UserPlus, X } from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { PASOS, PESTANAS, pestanaDe, seccionesConfigurables, tarjetasDe } from '../../data/fichaColaborador'
import {
  useConfigFicha, guardarConfigFicha, nivelDeFabrica, puedeEditarse, NIVELES_COLABORADOR,
} from '../../data/configFicha'
import RielPasos from '../../components/personas/RielPasos'
import Acordeon from '../../components/personas/Acordeon'
import TarjetaCampos from '../../components/organizacion/TarjetaCampos'
import ConfirmarAccionModal from '../../components/layout/ConfirmarAccionModal'

/* GESTIÓN DE PERSONAS › CONFIGURACIÓN › FICHA DEL COLABORADOR.
   La ficha trae todo lo que el estudio pide, y no toda empresa lo usa: una que no pide garantes
   no tiene por qué ver «Datos de garantes y garantías» cada vez que da de alta a alguien. Aquí la
   empresa decide, sección por sección, dos cosas:

     EN LA FICHA      si la usa. Apagada, no sale en ninguna pantalla de la ficha.
     EL COLABORADOR   qué puede hacer él con ella en Mi ficha: nada, verla o editarla.

   SE VE COMO «NUEVO COLABORADOR» (6 oct 2026, a pedido del equipo): el mismo riel con sus pestañas
   y partes, y cada sección en su acordeón. Las dos decisiones van en la cabecera, a la vista con
   el acordeón cerrado; al abrirlo se ven sus campos tal como salen en la ficha, sin poder
   escribir, para saber qué se está encendiendo o apagando.

   Las reglas —qué se guarda, qué no se apaga, qué tiene tope— viven en `configFicha` y
   `seccionesConfigurables`; esta pantalla sólo las ofrece.

   SE APLICA AL CONFIRMAR, sin «Guardar» al final. Activar y desactivar piden confirmación (6 oct
   2026, a pedido del equipo) con `ModalSeccion` —la propuesta A que eligió el equipo—: un
   renglón con ícono por cada cosa que cambia: Nuevo colaborador, Mi ficha y lo ya registrado.
   Los botones del colaborador se aplican al tocar: se ven y se deshacen ahí mismo. */

const ICONO_NIVEL = { editar: Pencil, ver: Eye, oculto: EyeOff }
const vacio = v => v === null || v === undefined || String(v).trim() === ''
const FORM_VACIO = {}
const nada = () => {}

export default function ConfiguracionFicha() {
  const config = useConfigFicha()
  const { colaboradores = [] } = useOnboardingData()
  const secciones = useMemo(() => seccionesConfigurables(), [])
  const porId = useMemo(() => Object.fromEntries(secciones.map(s => [s.id, s])), [secciones])
  const [paso, setPaso] = useState(PESTANAS[0].partes[0])
  const [abiertos, setAbiertos] = useState([])
  const [cambiando, setCambiando] = useState(null)
  const [restableciendo, setRestableciendo] = useState(false)

  /* Cuántas fichas tienen algo en cada sección: es lo que se deja de ver al apagarla. Las copias
     de un bloque repetido guardan su dato en «clave#n», así que se mira la clave y sus copias. */
  const conDatos = useMemo(() => {
    const fichas = colaboradores.map(c => c.ficha).filter(Boolean)
    return Object.fromEntries(secciones.map(s => [s.id, fichas.filter(f => Object.keys(f).some(k => {
      const base = k.split('#')[0]
      return s.claves.includes(base) && !vacio(typeof f[k] === 'object' ? f[k]?.nombre : f[k])
    })).length]))
  }, [colaboradores, secciones])

  const activa = id => !config.inactivas.includes(id)
  const nivel = s => {
    const elegido = config.colaborador[s.id] || nivelDeFabrica(s.id, s.parte)
    return elegido === 'editar' && !puedeEditarse(s.parte) ? 'ver' : elegido
  }

  const alternarActiva = s => {
    if (s.obligatoria) return
    setCambiando(s)
  }
  const cambiarActiva = id => guardarConfigFicha(c => ({
    ...c,
    inactivas: c.inactivas.includes(id) ? c.inactivas.filter(x => x !== id) : [...c.inactivas, id],
  }))
  /* Sólo se guarda lo que difiere de fábrica: volver al valor de partida borra la entrada. */
  const elegirNivel = (s, n) => guardarConfigFicha(c => {
    const colaborador = { ...c.colaborador }
    if (n === nivelDeFabrica(s.id, s.parte)) delete colaborador[s.id]
    else colaborador[s.id] = n
    return { ...c, colaborador }
  })

  const cambiada = config.inactivas.length > 0 || Object.keys(config.colaborador).length > 0
  const enUso = secciones.filter(s => activa(s.id))
  const editables = enUso.filter(s => s.pestana !== 'configuracion' && s.id !== 'archivos' && nivel(s) === 'editar').length

  /* EL RIEL DE «NUEVO COLABORADOR». El aro de cada pestaña dice cuántas de sus secciones están
     en uso: lleno, la usa entera. */
  const pestana = pestanaDe(paso) || PESTANAS[0]
  const pasoActual = PASOS.find(p => p.key === paso)
  const usoDe = partes => {
    const suyas = secciones.filter(s => partes.includes(s.parte))
    const puestos = suyas.filter(s => activa(s.id)).length
    return { puestos, total: suyas.length, pct: suyas.length ? Math.round(puestos * 100 / suyas.length) : 0 }
  }
  const itemsRiel = PESTANAS.map(t => ({ key: t.key, n: t.n, titulo: t.titulo, pista: t.pista }))
  const avance = Object.fromEntries(PESTANAS.map(t => [t.key, usoDe(t.partes)]))
  const irAPestana = clave => { setPaso(PESTANAS.find(t => t.key === clave).partes[0]); setAbiertos([]) }
  const irAParte = k => { setPaso(k); setAbiertos([]) }

  // Las secciones de la parte abierta, con sus campos como salen en la ficha, aunque estén apagadas.
  const tarjetas = tarjetasDe(paso, FORM_VACIO, {}, 'Completo', { conInactivas: true }).filter(t => porId[t.id])
  const alternar = id => setAbiertos(a => (a.includes(id) ? a.filter(x => x !== id) : [...a, id]))

  return (
    <div className="content-scroll">
      <div className="pl-header">
        <div>
          <h1 className="pl-title">Ficha del colaborador</h1>
          <p className="pl-subtitle">
            Elija qué secciones usa su empresa y qué puede hacer el colaborador con cada una.
          </p>
          <div className="cf-resumen">
            <span><b>{enUso.length}</b> de {secciones.length} secciones en uso</span>
            <span><b>{editables}</b> las edita el colaborador</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', alignItems: 'center' }}>
          {/* Sólo cuando hay algo que restablecer: un botón que no cambiaría nada hace dudar. */}
          {cambiada && (
            <button className="pl-btn-cancel" onClick={() => setRestableciendo(true)}>
              <RotateCcw size={14} /> Restablecer
            </button>
          )}
        </div>
      </div>

      <div className="cn-grid">
        <RielPasos
          pasos={itemsRiel}
          actual={pestana.key}
          onIr={irAPestana}
          avance={avance}
          partes={pestana.partes.map(k => ({
            key: k,
            titulo: PASOS.find(x => x.key === k).titulo,
            on: k === paso,
            ...usoDe([k]),
          }))}
          onParte={irAParte}
          conPartes={new Set(PESTANAS.filter(t => t.partes.length > 1).map(t => t.key))}
          unidad="secciones en uso"
        />

        <div className="cn-cuerpo">
          <div className="cn-paso-cab cn-entra" key={`cab-${paso}`}>
            <h2>{pestana.partes.length > 1 ? `${pestana.n}.${pestana.partes.indexOf(paso) + 1} · ${pasoActual.titulo}` : `${pestana.n} · ${pestana.titulo}`}</h2>
            <p>{pestana.partes.length > 1 ? `${pestana.titulo} · ${pasoActual.pista}` : pasoActual.pista}</p>
          </div>

          {/* En pantallas angostas el riel se acuesta y las partes van aquí, como en la ficha. */}
          {pestana.partes.length > 1 && (
            <div className="cn-partes" role="tablist" aria-label={`Partes de ${pestana.titulo}`}>
              {pestana.partes.map((k, j) => (
                <button key={k} type="button" role="tab" aria-selected={k === paso} className={`cn-parte${k === paso ? ' on' : ''}`} onClick={() => irAParte(k)}>
                  <span className="rp-aro"><b>{j + 1}</b></span>
                  <span className="cn-parte-nom">{PASOS.find(x => x.key === k).titulo}</span>
                </button>
              ))}
            </div>
          )}

          <div className="cn-entra" key={paso}>
            {/* QUIÉN ES QUIÉN EN ESTA PANTALLA: los títulos de columna y los botones con sujeto
                —«Para el colaborador: Editable · Solo lectura · Oculta»— dicen que la segunda
                decisión es sobre el colaborador y no sobre RR.HH. Hubo además un aviso que lo
                explicaba en un párrafo, y sobraba. */}
            <div className="cf-columnas" aria-hidden="true">
              <span>Sección</span>
              <span className="cf-col-ficha">En la ficha</span>
              <span className="cf-col-colab"><User size={11} /> Para el colaborador</span>
            </div>
            <div className="cn-acordeones">
              {tarjetas.map(t => {
                const s = porId[t.id]
                const on = activa(s.id)
                return (
                  <Acordeon
                    key={s.id}
                    titulo={s.titulo}
                    clase={on ? '' : 'cf-apagada'}
                    abierto={abiertos.includes(s.id)}
                    onAlternar={() => alternar(s.id)}
                    acciones={<Controles s={s} on={on} nivel={nivel(s)} onAlternar={() => alternarActiva(s)} onNivel={n => elegirNivel(s, n)} />}
                  >
                    <p className="ac-desc cf-desc">
                      {s.desc}
                      <span className="cf-meta">
                        {s.campos} {s.campos === 1 ? 'campo' : 'campos'}
                        {conDatos[s.id] > 0 && ` · ${conDatos[s.id]} ${conDatos[s.id] === 1 ? 'ficha con datos' : 'fichas con datos'}`}
                        {!on && ' · Inactiva: no sale en la ficha ni en Mi ficha'}
                      </span>
                    </p>
                    {/* Los campos tal como salen en la ficha, para mirar y no para llenar. */}
                    <div className="cf-muestra" inert>
                      <TarjetaCampos campos={t.campos} form={FORM_VACIO} set={nada} editando prefijo="cf" marcarFaltas={false} desnudo />
                    </div>
                  </Acordeon>
                )
              })}
            </div>

            <div className="cfg-nota" style={{ marginTop: 16 }}>
              <Info size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p>
                  <strong>Desactivar no borra nada.</strong> La sección deja de verse en «Nuevo
                  colaborador», en la ficha y en Mi ficha. Lo que ya estaba registrado se conserva y
                  vuelve a verse al activarla.
                </p>
                <p>
                  <strong>Las secciones obligatorias no se desactivan.</strong> Tienen datos que exige la
                  ley para declarar al colaborador, o sostienen a las demás, como Archivos y el acceso al
                  sistema.
                </p>
                <p style={{ marginBottom: 0 }}>
                  <strong>Lo laboral el colaborador solo lo ve.</strong> El puesto, el contrato, el
                  pago, las afiliaciones, la asistencia y lo que la empresa le entrega los registra
                  RR.HH.: de ellos dependen la planilla y las declaraciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {cambiando && (
        <ModalSeccion
          s={cambiando}
          activar={!activa(cambiando.id)}
          datos={conDatos[cambiando.id]}
          nivel={nivel(cambiando)}
          onCancelar={() => setCambiando(null)}
          onConfirmar={() => { cambiarActiva(cambiando.id); setCambiando(null) }}
        />
      )}
      {restableciendo && (
        <ConfirmarAccionModal
          icono={RotateCcw}
          titulo="¿Restablecer la ficha estándar?"
          descripcion="Todas las secciones vuelven a estar activas y el colaborador vuelve a ver y editar lo que trae la ficha de fábrica. No se borra ningún dato."
          textoConfirmar="Restablecer"
          onCancelar={() => setRestableciendo(false)}
          onConfirmar={() => { guardarConfigFicha({ inactivas: [], colaborador: {} }); setRestableciendo(false) }}
        />
      )}
    </div>
  )
}

/* ── ACTIVAR O DESACTIVAR UNA SECCIÓN: LA PROPUESTA A ────────────────────────
   Un renglón con ícono por cada cosa que cambia, en el orden en que alguien se lo pregunta:
   ¿se pide al registrar?, ¿y el colaborador?, ¿y lo que ya está registrado? El último va en verde
   porque es la respuesta tranquila: nada se borra. Al activar, el renglón de Mi ficha lleva la
   etiqueta de lo que tiene elegido —Editable, Solo lectura, Oculta—. Cancelar, la X, el velo y
   Escape cierran sin cambiar nada. */
const QUE_HACE = {
  editar: 'El colaborador podrá verla y cambiarla, en la web y en el teléfono.',
  ver: 'El colaborador podrá verla, sin cambiarla, en la web y en el teléfono.',
  oculto: 'El colaborador no la verá: así está elegido para esta sección.',
}
function ModalSeccion({ s, activar, datos, nivel, onCancelar, onConfirmar }) {
  useEffect(() => {
    const tecla = e => { if (e.key === 'Escape') onCancelar() }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCancelar])
  const sinColaborador = s.pestana === 'configuracion' || s.id === 'archivos'
  const n = NIVELES_COLABORADOR.find(x => x.key === nivel)
  const IconoNivel = ICONO_NIVEL[nivel]
  const quienes = datos === 1 ? '1 colaborador' : `${datos} colaboradores`
  return (
    <div className="pl-overlay" onClick={onCancelar}>
      <div className="cf-modal" role="dialog" aria-modal="true" aria-labelledby="cf-modal-tit" onClick={e => e.stopPropagation()}>
        <div className="cf-modal-cuerpo">
          <div className="cf-modal-cab">
            <span className={`cf-modal-ico${activar ? ' activar' : ''}`}>{activar ? <Eye size={20} /> : <EyeOff size={20} />}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 id="cf-modal-tit">¿Está seguro de {activar ? 'activar' : 'desactivar'} «{s.titulo}»?</h2>
              <p>{s.tituloParte} · {s.campos} {s.campos === 1 ? 'campo' : 'campos'}</p>
            </div>
            <button type="button" className="cf-modal-cerrar" aria-label="Cerrar" onClick={onCancelar}><X size={16} /></button>
          </div>
          <div className="cf-modal-renglones">
            <Renglon icono={UserPlus} titulo="Nuevo colaborador">
              {activar ? 'Se pedirá al registrar a alguien y saldrá en su ficha.' : 'Ya no se pedirá al registrar a alguien ni saldrá en su ficha.'}
            </Renglon>
            {!sinColaborador && (
              <Renglon icono={Smartphone} titulo="Mi ficha del colaborador" etiqueta={activar && n ? <><IconoNivel size={11} /> {n.label}</> : null}>
                {activar ? QUE_HACE[nivel] : 'El colaborador dejará de verla, en la web y en el teléfono.'}
              </Renglon>
            )}
            {activar ? (datos > 0 && (
              <Renglon icono={ShieldCheck} verde titulo={`${quienes} ya ${datos === 1 ? 'tenía' : 'tenían'} datos aquí`}>
                Vuelven a verse tal como estaban.
              </Renglon>
            )) : (
              <Renglon icono={ShieldCheck} verde titulo={datos ? `${quienes} ${datos === 1 ? 'tiene' : 'tienen'} datos aquí` : 'No se borra nada'}>
                {datos ? 'No se borran. Vuelven a verse si la activa otra vez.' : 'Puede activarla otra vez cuando quiera.'}
              </Renglon>
            )}
          </div>
        </div>
        <div className="cf-modal-pie">
          <button type="button" className="cf-modal-btn" onClick={onCancelar}>Cancelar</button>
          <button type="button" className={`cf-modal-btn ${activar ? 'activar' : 'desactivar'}`} onClick={onConfirmar} autoFocus>
            {activar ? 'Activar sección' : 'Desactivar sección'}
          </button>
        </div>
      </div>
    </div>
  )
}
function Renglon({ icono: Icono, titulo, etiqueta, verde, children }) {
  return (
    <div className="cf-modal-renglon">
      <span className={`cf-modal-ico-chico${verde ? ' verde' : ''}`}><Icono size={17} /></span>
      <div>
        <div className="cf-modal-renglon-tit">{titulo}{etiqueta && <span className="cf-modal-etiqueta">{etiqueta}</span>}</div>
        <div className="cf-modal-renglon-txt">{children}</div>
      </div>
    </div>
  )
}

/* LO QUE VA EN LA CABECERA DEL ACORDEÓN: si la sección está en la ficha y qué hace el colaborador. */
function Controles({ s, on, nivel, onAlternar, onNivel }) {
  /* Dos que no se le muestran por lo que son, no por lo que decida la empresa: el acceso al
     sistema no es un dato suyo, y los archivos se ven con la sección de cada documento. */
  const sinNivel = s.pestana === 'configuracion' ? 'Lo administra RR.HH.'
    : s.id === 'archivos' ? 'Cada documento sigue a su sección'
      : null
  return (
    <>
      {/* TODAS LAS FILAS LLEVAN SU INTERRUPTOR, y el valor es un adjetivo como los de la otra
          columna: Activa, Inactiva u Obligatoria. La obligatoria lo tiene encendido y con candado
          —antes era sólo un texto en su lugar, que no decía que la sección estaba activa—. */}
      <label
        className={`cf-interruptor${s.obligatoria ? ' fija' : ''}`}
        title={s.obligatoria ? 'Tiene datos que exige la ley o que sostienen a otras secciones: no se puede desactivar.' : on ? 'Desactivar la sección' : 'Activar la sección'}
      >
        <button
          type="button"
          className={`cfg-sw cf-sw${on ? ' on' : ''}`}
          role="switch"
          aria-checked={on}
          aria-label={s.obligatoria ? `${s.titulo}: obligatoria, siempre activa` : `${on ? 'Desactivar' : 'Activar'} ${s.titulo}`}
          disabled={s.obligatoria}
          onClick={onAlternar}
        />
        {s.obligatoria ? <span className="cf-estado-fija"><Lock size={11} /> Obligatoria</span> : <span>{on ? 'Activa' : 'Inactiva'}</span>}
      </label>
      {sinNivel ? (
        <span className="cf-sin-nivel">{sinNivel}</span>
      ) : (
        <>
        {/* El título de la columna, aquí, para cuando la pantalla es angosta y no hay columnas. */}
        <span className="cf-puede">Para el colaborador</span>
        <div className="cf-seg" role="radiogroup" aria-label={`Qué puede hacer el colaborador con ${s.titulo}`}>
          {NIVELES_COLABORADOR.map(n => {
            const Icono = ICONO_NIVEL[n.key]
            const tope = n.key === 'editar' && !puedeEditarse(s.parte)
            return (
              <button
                key={n.key}
                type="button"
                role="radio"
                aria-checked={nivel === n.key}
                className={`cf-seg-op${nivel === n.key ? ' on' : ''}`}
                disabled={!on || tope}
                title={tope ? 'Este dato lo registra RR.HH.: el colaborador solo puede verlo.' : !on ? 'Active la sección para elegir.' : n.pista}
                onClick={() => onNivel(n.key)}
              >
                <Icono size={12} /> {n.label}
              </button>
            )
          })}
        </div>
        </>
      )}
    </>
  )
}
