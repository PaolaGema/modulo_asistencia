import { AlertTriangle, ArrowRight, Check, CheckCircle2, Pencil } from 'lucide-react'
import { useArchivoLocal } from '../../hooks/useArchivoLocal'
import TarjetaCampos from '../organizacion/TarjetaCampos'
import { documentoDe, fechaCorta, inicialesDe, nombreDe, tarjetasTodas } from '../../data/fichaColaborador'

/* ── LA VISTA PREVIA ES UN EXPEDIENTE ─────────────────────────────────────
   Era una columna de tarjetas con un número al lado, y así se leía: como el formulario otra vez,
   sin cajas. Pero lo que se revisa antes de crear no es un formulario sino el legajo de una
   persona, y los legajos tienen una forma que todo el que trabaja en RR.HH. reconoce: una
   carpeta con la foto y el nombre en la tapa, y separadores de colores por dentro.

   LA TAPA DICE DE QUIÉN ES Y SI ESTÁ LISTA. Foto, nombre, cargo, documento y fecha de ingreso
   —lo que se busca primero en cualquier legajo— y al lado cuánto está cargado y si algo impide
   crearla. Sin nombre todavía, lo dice en vez de dejar el hueco.

   LOS SEPARADORES VAN POR FAMILIA Y NO UNO POR PASO. Once colores son un arcoíris y no enseñan
   nada; cuatro agrupan lo que va junto —la persona, su trayectoria, el contrato y el pago, lo que
   la empresa le da— y el color vive sólo en el índice: las secciones de abajo van en los de la
   marca. El verde se queda fuera de la paleta a propósito: en esta ficha quiere decir «completo». */

/* Las familias siguen a las pestañas de la ficha (30 sep 2026): la persona, lo laboral, su perfil
   y lo que la empresa le da y le pide. Cuatro colores y no seis: Documentación, Recursos y
   Configuración son de una sola parte y van juntas. */
const FAMILIAS = [
  { key: 'persona', nombre: 'Información Personal', pasos: ['quien', 'entorno'] },
  { key: 'contrato', nombre: 'Información Laboral', pasos: ['puesto', 'contrato', 'remuneracion', 'asistencia'] },
  { key: 'trayectoria', nombre: 'Perfil Profesional', pasos: ['perfil'] },
  { key: 'empresa', nombre: 'En la empresa', pasos: ['expediente', 'recursos', 'sistema'] },
]

/* El anillo de la tapa. Decorativo: la cifra va escrita al lado con todas sus letras. */
function Anillo({ pct }) {
  const r = 34
  const largo = 2 * Math.PI * r
  return (
    <svg className="xp-anillo" viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="40" cy="40" r={r} className="xp-anillo-fondo" />
      <circle
        cx="40" cy="40" r={r}
        className="xp-anillo-lleno"
        strokeDasharray={largo}
        strokeDashoffset={largo * (1 - pct / 100)}
      />
    </svg>
  )
}

function Retrato({ foto, iniciales }) {
  const url = useArchivoLocal(foto?.clave || null)
  return (
    <div className="xp-retrato">
      {url
        ? <img src={url} alt="Fotografía del colaborador" />
        : <span className="xp-iniciales" aria-hidden="true">{iniciales === '—' ? '?' : iniciales}</span>}
    </div>
  )
}

/* Un dato de la tapa. Vacío dice «por completar» en vez de un guion: en la tapa se lee de lejos,
   y un guion suelto ahí parece un error de la pantalla. */
function Dato({ rotulo, valor }) {
  return (
    <div className="xp-dato">
      <dt>{rotulo}</dt>
      <dd className={valor ? '' : 'xp-dato-vacio'}>{valor || 'Por completar'}</dd>
    </div>
  )
}

/* `completar` lleva hasta el campo que falta —paso, sección abierta y cursor puesto—, el mismo
   camino que las filas del aviso de «Dar de alta». Sin él, el sello cae a ir sólo al paso. */
export default function ExpedientePrevia({ form, set, ctx, nivel, avance, progreso, falta, irA, completar }) {
  const nombre = nombreDe(form)
  const puesto = (ctx.puestos || []).find(p => p.valor === form['3.11'])
  const cargo = puesto ? puesto.etiqueta.split(' · ')[0] : ''
  const area = puesto?.area || form['3.5'] || ''
  const sede = form['3.8'] || ''
  const codigo = (form['3.1'] || '').trim()

  const pasos = tarjetasTodas(form, ctx, nivel)

  /* Ir a una sección es bajar hasta ella, no cambiar de paso: el índice es de esta página.
     Sin animación si quien mira pidió menos movimiento. */
  const bajarA = clave => {
    const destino = document.getElementById(`xp-${clave}`)
    if (!destino) return
    const quieto = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    destino.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className="xp">
      {/* ── LA TAPA ── */}
      <header className="xp-tapa">
        <span className="xp-pestana">
          Expediente{codigo ? ` · N.º ${codigo}` : ''}
        </span>

        <div className="xp-tapa-cuerpo">
          <Retrato foto={form['1.9']} iniciales={inicialesDe(form)} />

          <div className="xp-quien">
            <p className="xp-ceja">
              <span className={`xp-tipo${form['0.1'] === 'si' ? ' xp-tipo-reingreso' : ''}`}>
                {form['0.1'] === 'si' ? 'Reingreso' : 'Alta nueva'}
              </span>
              {sede && <span>{sede}</span>}
            </p>
            <h2 className={`xp-nombre${nombre ? '' : ' xp-nombre-vacio'}`}>
              {nombre || 'Nombre por completar'}
            </h2>
            <p className={`xp-cargo${cargo ? '' : ' xp-cargo-vacio'}`}>
              {cargo ? <>{cargo}{area && <span> · {area}</span>}</> : 'Sin cargo asignado todavía'}
            </p>

            <dl className="xp-datos">
              <Dato rotulo="Documento" valor={documentoDe(form)} />
              <Dato rotulo="Ingreso" valor={fechaCorta(form['3.25'])} />
              <Dato rotulo="Contrato" valor={form['3.32']} />
              <Dato rotulo="Correo" valor={form['3.22'] || form['1.38']} />
            </dl>
          </div>

          <div className="xp-estado">
            <div className="xp-avance">
              <Anillo pct={progreso.pct} />
              <span className="xp-avance-pct">{progreso.pct}<small>%</small></span>
            </div>
            <p className="xp-avance-txt">{progreso.puestos} de {progreso.total} datos</p>
            {falta ? (
              <button type="button" className="xp-sello xp-sello-falta" onClick={() => (completar ? completar(falta) : irA(falta.paso))}>
                <AlertTriangle size={14} aria-hidden="true" />
                <span>{falta.que}</span>
                <ArrowRight size={13} aria-hidden="true" />
              </button>
            ) : (
              <p className="xp-sello xp-sello-listo">
                {/* «Se puede», no «está lista»: con el mínimo cubierto ya se da de alta, y el resto se
                    completa después. Con un 8 % al lado, «lista» se leería como un error. */}
                <CheckCircle2 size={14} aria-hidden="true" /> Ya se puede dar de alta
              </p>
            )}
          </div>
        </div>
      </header>

      {/* ── LOS SEPARADORES ── */}
      {/* EL LOMO DE LA CARPETA: UNA SOLA BARRA PARTIDA EN ONCE TRAMOS. Cada familia ocupa lo que
          tiene —la de cuatro pasos, el doble que la de dos— y cada tramo se llena de su color hasta
          su porcentaje, así que de un vistazo se ve dónde está lo cargado y dónde el hueco. Se
          eligió entre seis propuestas; la anterior eran filas de pestañas por familia. Cada tramo
          es un botón que baja hasta su sección. */}
      <nav className="xp-lomo" aria-label="Secciones del expediente">
        {FAMILIAS.filter(f => f.pasos.some(c => pasos.some(x => x.paso.key === c))).map(f => (
          <div key={f.key} className="xp-lomo-fam" data-familia={f.key} style={{ flexGrow: f.pasos.filter(c => pasos.some(x => x.paso.key === c)).length }}>
            <p className="xp-lomo-nom">{f.nombre}</p>
            <div className="xp-lomo-tramos">
              {f.pasos.map(clave => {
                const p = pasos.find(x => x.paso.key === clave)?.paso
                const pct = avance[clave]?.pct ?? 0
                if (!p) return null
                return (
                  <button
                    key={clave}
                    type="button"
                    className={`xp-tramo${pct === 100 ? ' xp-tramo-lleno' : ''}`}
                    onClick={() => bajarA(clave)}
                    aria-label={`${p.titulo}, ${pct}% completo`}
                  >
                    <span className="xp-tramo-barra" aria-hidden="true">
                      <span style={{ width: `${pct}%` }} />
                    </span>
                    <span className="xp-tramo-nom" aria-hidden="true">{p.corto}</span>
                    {/* El número va aparte del nombre: delante le quitaba el sitio y «Contrato» acababa partido. */}
                    <span className="xp-tramo-pct" aria-hidden="true">
                      <b>Pestaña {p.n}</b> · {pct === 100 ? <><Check size={11} strokeWidth={3} /> Completo</> : `${pct}%`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      {/* ── LAS SECCIONES ── */}
      {pasos.map(({ paso: p, tarjetas: ts }) => {
        const a = avance[p.key]
        return (
          <section key={p.key} id={`xp-${p.key}`} className="xp-seccion">
            <header className="xp-seccion-cab">
              <span className="xp-seccion-tab">{p.n}</span>
              <div className="xp-seccion-tit">
                <h3>{p.titulo}</h3>
                {a && <p>{a.puestos} de {a.total} datos</p>}
              </div>
              <button type="button" className="xp-editar" onClick={() => irA(p.key)}>
                <Pencil size={12} aria-hidden="true" /> Editar
              </button>
            </header>
            <div className="xp-seccion-cuerpo">
              {ts.map(t => (
                <TarjetaCampos
                  key={t.titulo}
                  titulo={t.titulo}
                  campos={t.campos}
                  form={form}
                  set={set}
                  editando={false}
                  papel
                  prefijo="cn"
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
