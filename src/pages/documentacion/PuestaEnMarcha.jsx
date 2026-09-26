import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera, Etiqueta } from '../../components/documentacion/comunes'
import { alcanza, CATEGORIAS } from '../../data/documentacionData'
import './configuracion.css'

/* ── LA PUESTA EN MARCHA (pantalla 1, RF-09, flujo 7.1) ───────────────────
   Una empresa nueva arranca con la taxonomía y los modelos de fábrica ya cargados; esta pantalla
   dice qué falta revisar y, sobre todo, QUÉ FALTA PARA PODER EMITIR.

   CADA PASO SE CALCULA DE LA CONFIGURACIÓN REAL, no es una casilla que alguien tilda. Una lista
   de verificación que se marca a mano dice lo que alguien creyó hacer; ésta dice lo que hay.
   Lo que sí se marca a mano es «revisado»: que una persona miró el paso y lo dio por bueno,
   aunque el sistema ya lo viera completo —los valores de fábrica también hay que mirarlos—. */
export default function PuestaEnMarcha() {
  const navigate = useNavigate()
  const { tipos, subtipos, parametros, conjuntos, modelos, personas, puesta, setPuesta } = useDocumentacion()

  const activos = personas.filter(p => p.status !== 'desvinculado')
  const subActivos = subtipos.filter(s => s.activo)
  const conHuecos = subActivos
    .map(s => ({
      s,
      faltan: [
        s.vence && !s.vigenciaMeses && 'vigencia',
        !s.formatos?.length && 'formatos',
        !s.sensibilidad && 'sensibilidad',
      ].filter(Boolean),
    }))
    .filter(x => x.faltan.length)

  const conjActivos = conjuntos.filter(c => c.activo)
  const alcanzados = activos.filter(p => conjActivos.some(c => alcanza(c, p)))
  const categoriasSinModelo = Object.keys(CATEGORIAS).filter(cat =>
    !modelos.some(m => m.categoria === cat && m.estado === 'activo' && m.versiones.some(v => v.estado === 'publicada')))
  const numeracionIncompleta = Object.keys(CATEGORIAS).filter(cat => !parametros.numeracion?.[cat]?.prefijo)
  const sinRetencion = tipos.filter(t => t.activo && !(t.retencionAnios > 0))

  /* `bloquea` marca lo que impide emitir (RN-17: un modelo sin plantilla publicada no emite, y
     sin numeración no hay CITE). Lo demás falta, pero no frena nada. */
  const pasos = [
    {
      key: 'taxonomia', titulo: 'Tipos y subtipos de documento', ruta: '/documentos/configuracion/tipos',
      ok: tipos.some(t => t.activo) && subActivos.length > 0,
      txt: `${tipos.filter(t => t.activo).length} tipos y ${subActivos.length} subtipos activos. Vienen de fábrica: revise que los nombres sean los que usa su empresa y agregue los propios.`,
    },
    {
      key: 'subtipos', titulo: 'Vigencia, formatos y sensibilidad de cada subtipo', ruta: '/documentos/configuracion/tipos',
      ok: conHuecos.length === 0,
      txt: conHuecos.length
        ? `${conHuecos.length} ${conHuecos.length === 1 ? 'subtipo tiene' : 'subtipos tienen'} datos sin definir. Un subtipo que vence sin vigencia no puede avisar nada.`
        : 'Todos los subtipos activos declaran si vencen, qué formatos aceptan y qué tan sensibles son.',
      det: conHuecos.map(x => `${x.s.nombre}: falta ${x.faltan.join(', ')}`),
    },
    {
      key: 'avisos', titulo: 'Avisos de vencimiento', ruta: '/documentos/configuracion/parametros',
      ok: parametros.notificarVencimiento && parametros.hitos?.length > 0 && parametros.destinatarios?.length > 0,
      txt: parametros.notificarVencimiento
        ? `Por defecto se avisa ${parametros.hitos.join(', ')} días antes. ${subtipos.filter(s => s.hitos?.length).length} subtipos tienen hitos propios.`
        : 'Los avisos de vencimiento están apagados: nadie se va a enterar de que algo vence.',
    },
    {
      key: 'numeracion', titulo: 'Numeración correlativa', ruta: '/documentos/configuracion/parametros', bloquea: numeracionIncompleta.length > 0,
      ok: numeracionIncompleta.length === 0,
      txt: numeracionIncompleta.length
        ? `Falta el prefijo de ${numeracionIncompleta.map(c => CATEGORIAS[c].plural.toLowerCase()).join(' y ')}. Sin numeración no hay CITE que asignar.`
        : Object.keys(CATEGORIAS).map(c => `${CATEGORIAS[c].plural}: ${parametros.numeracion[c].prefijo}`).join(' · '),
    },
    {
      key: 'requisitos', titulo: 'Requisitos por perfil', ruta: '/documentos/configuracion/requisitos',
      ok: conjActivos.length > 0,
      txt: conjActivos.length
        ? `${conjActivos.length} ${conjActivos.length === 1 ? 'conjunto activo alcanza' : 'conjuntos activos alcanzan'} a ${alcanzados.length} de ${activos.length} personas.${activos.length - alcanzados.length ? ` ${activos.length - alcanzados.length} no tienen ningún requisito: para ellas el sistema no sabe qué falta.` : ''}`
        : 'Ningún cargo tiene requisitos. Sin ellos el módulo es un archivador: no puede decir qué falta ni calcular el cumplimiento.',
    },
    {
      key: 'modelos', titulo: 'Modelos con plantilla publicada', ruta: '/documentos/configuracion/modelos', bloquea: categoriasSinModelo.length > 0,
      ok: categoriasSinModelo.length === 0,
      txt: categoriasSinModelo.length
        ? `No hay modelo activo con plantilla publicada para ${categoriasSinModelo.map(c => CATEGORIAS[c].plural.toLowerCase()).join(' ni ')} (RN-17).`
        : `${modelos.filter(m => m.estado === 'activo').length} modelos activos con plantilla publicada en las tres categorías.`,
    },
    {
      key: 'retencion', titulo: 'Retención por tipo', ruta: '/documentos/configuracion/parametros',
      ok: sinRetencion.length === 0,
      txt: sinRetencion.length
        ? `${sinRetencion.map(t => t.nombre).join(', ')} sin plazo de retención.`
        : 'Cada tipo declara cuántos años se conserva después de la desvinculación. Al vencer, el sistema avisa y no borra.',
    },
  ]

  const bloquean = pasos.filter(p => p.bloquea)
  const completos = pasos.filter(p => p.ok).length
  const revisados = puesta?.revisados || []
  const alternar = key => setPuesta(prev => {
    const r = prev?.revisados || []
    return { ...prev, revisados: r.includes(key) ? r.filter(k => k !== key) : [...r, key] }
  })

  return (
    <div className="content-scroll">
      <Cabecera titulo="Puesta en marcha" sub="Lo que hay que revisar para que el módulo funcione, y qué falta para poder emitir." />

      <div className={`xd-veredicto ${bloquean.length ? 'falta' : 'ok'}`} role="status">
        {bloquean.length ? <AlertTriangle size={26} aria-hidden="true" /> : <CheckCircle2 size={26} aria-hidden="true" />}
        <div>
          <h2>{bloquean.length ? `Falta ${bloquean.map(p => p.titulo.toLowerCase()).join(' y ')} para poder emitir` : 'Ya se puede emitir'}</h2>
          <p>
            {bloquean.length
              ? 'Mientras tanto se pueden cargar documentos y definir requisitos; emitir certificados, memorándums o contratos espera a esto.'
              : 'Hay numeración y plantillas publicadas para certificados, memorándums y contratos.'}
          </p>
        </div>
        <div className="xd-veredicto-avance">
          <b>{completos} de {pasos.length}</b>
          pasos completos · {revisados.length} revisados
        </div>
      </div>

      <section className="dc-tarjeta">
        <ol className="xd-pasos">
          {pasos.map((p, i) => {
            const rev = revisados.includes(p.key)
            return (
              <li key={p.key} className="xd-paso">
                <span className={`xd-paso-n ${p.ok ? 'ok' : p.bloquea ? 'bloquea' : 'falta'}`} aria-hidden="true">{p.ok ? '✓' : i + 1}</span>
                <div>
                  <h3>
                    {p.titulo}
                    {p.ok
                      ? <Etiqueta tono="verde">Completo</Etiqueta>
                      : <Etiqueta tono={p.bloquea ? 'rojo' : 'ambar'}>{p.bloquea ? 'Impide emitir' : 'Falta'}</Etiqueta>}
                    {rev && <Etiqueta tono="azul">Revisado</Etiqueta>}
                  </h3>
                  <p className="xd-paso-txt">{p.txt}</p>
                  {p.det?.length > 0 && (
                    <ul className="xd-paso-det">
                      {p.det.slice(0, 8).map(d => <li key={d}>{d}</li>)}
                      {p.det.length > 8 && <li>y {p.det.length - 8} más</li>}
                    </ul>
                  )}
                </div>
                <div className="xd-paso-acc">
                  <button type="button" className="dc-btn dc-btn-sm" onClick={() => navigate(p.ruta)}>
                    Ir a configurar <ArrowRight size={13} aria-hidden="true" />
                  </button>
                  <label className="xd-revisado">
                    <input type="checkbox" checked={rev} onChange={() => alternar(p.key)} />
                    Marcar como revisado
                  </label>
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
