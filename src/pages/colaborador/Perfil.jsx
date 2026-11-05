import { Fragment, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Network, Settings, Gift, Sparkles, Plus, FileText, ArrowLeft } from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { colaboradoresData } from '../personas/colaboradoresData'
import { cargoDe, areaDe, sedesDe } from '../../data/organigramaData'
import { HOY, avatarUrl } from '../../utils/calendarEvents'
import { useMiFicha } from '../../hooks/useMiFicha'
import { useUnsavedChanges } from '../../context/UnsavedChangesContext'
import MiFichaWeb, { Preferencias, SeccionMiFicha, EditarPerfil } from '../../components/personas/MiFichaWeb'
import ConfiguracionWeb from '../../components/personas/ConfiguracionWeb'
import { pestanasCon, preferenciasVisibles } from '../../data/miFichaLectura'

/* MI PERFIL — LA FICHA PROPIA, NO UN FORMULARIO.
   Es la misma pantalla que el colaborador tiene en el teléfono: se entra a mirarse, no a
   editarse. Por eso todo el peso visual está arriba —la banda, la foto y el nombre— y lo de
   abajo son secciones que hoy están vacías y lo dicen.

   NADA DE ESTO SE ESCRIBE AQUÍ. El cargo, el área y la sucursal SE DERIVAN del puesto que la
   persona ocupa en el organigrama, con las mismas funciones que usan las otras pantallas
   (`cargoDe`, `areaDe`, `sedesDe`). Es la regla de siempre: un dato, un dueño. Si el perfil
   guardara su propio cargo, un día diría "Diseñadora UX/UI" mientras su cuadro dice otra cosa, y
   no habría manera de saber cuál miente.

   LAS SECCIONES VACÍAS SE MUESTRAN VACÍAS, no se esconden: enseñan qué va a haber aquí —deseos,
   habilidades, publicaciones propias— y son la lista de lo que falta construir. */

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/* "15 Mar 2025" → Date. Es el formato en que están escritas las fechas de ingreso del
   directorio; se lee aquí y no se cambia el dato para no tocar veinte fichas por una pantalla. */
function fechaIngreso(texto) {
  if (!texto) return null
  const [dia, mes, anio] = texto.split(' ')
  const i = MESES_CORTOS.indexOf(mes)
  if (i < 0) return null
  return new Date(Number(anio), i, Number(dia))
}

/* "1 año, 3 meses en la empresa". Se cuenta contra el hoy ficticio de la demo —el mismo que usan
   el calendario y el dashboard— para que no diga una cosa distinta en cada pantalla. */
function antiguedad(desde) {
  if (!desde) return null
  let meses = (HOY.getFullYear() - desde.getFullYear()) * 12 + (HOY.getMonth() - desde.getMonth())
  if (HOY.getDate() < desde.getDate()) meses--
  if (meses < 0) return null
  const anios = Math.floor(meses / 12)
  const resto = meses % 12
  const partes = []
  if (anios) partes.push(`${anios} ${anios === 1 ? 'año' : 'años'}`)
  if (resto || !anios) partes.push(`${resto} ${resto === 1 ? 'mes' : 'meses'}`)
  return `${partes.join(', ')} en la empresa`
}

function SeccionVacia({ icon: Icon, titulo, vacio }) {
  return (
    <div>
      <h2 style={{
        display: 'flex', alignItems: 'center', gap: 9, margin: '0 0 6px',
        fontSize: 16, fontWeight: 700, color: 'var(--text-heading)',
      }}>
        <Icon size={18} style={{ color: 'var(--text-heading)' }} /> {titulo}
      </h2>
      <p style={{ margin: 0, fontSize: 13.5, fontStyle: 'italic', color: 'var(--text-muted)' }}>{vacio}</p>
    </div>
  )
}

export default function Perfil() {
  const { currentUser } = useUser()
  const { organigrama: org } = useOnboardingData()
  const navigate = useNavigate()
  const { guardNavigate } = useUnsavedChanges()
  const [sinFoto, setSinFoto] = useState(false)

  /* El usuario de la demo y la ficha del directorio son dos cosas distintas —uno es con quién
     estás mirando, la otra es la persona— y no todos los perfiles de la demo existen en el
     directorio. Cuando no está, la pantalla se dibuja igual con lo que el usuario sí trae. */
  const { ficha: miFicha, guardar } = useMiFicha(currentUser.name)
  const ficha = colaboradoresData.find(c => c.name === currentUser.name) || null

  /* El cargo sale del cuadro que la persona ocupa; si no está en el organigrama, del respaldo
     del usuario. Nunca del rol: «Administrador HR» es lo que su cuenta puede hacer, no el
     trabajo que hace, y ponerlo en la pastilla del cargo mezcla dos cosas que el producto se
     pasa el día distinguiendo. Sin ninguno de los dos se dice que falta, que es la verdad. */
  const cargo = (ficha && cargoDe(ficha, org)) || currentUser.cargo || null
  const area = (ficha && areaDe(ficha, org)) || ficha?.depto || currentUser.area || miFicha?.area || null
  const sedes = ficha ? sedesDe(ficha, org) : null
  const sede = sedes?.[0] || null
  const tiempo = antiguedad(fechaIngreso(ficha?.ingreso || miFicha?.ingreso))
  const gestiona = currentUser.role === 'admin' || currentUser.role === 'manager'

  /* QUÉ PANTALLA SE VE: el perfil, una sección de Mi ficha o Configuración. Como en el teléfono,
     cada una ocupa la página entera y vuelve al perfil. Se recuerda por usuario: al cambiar de
     persona en la demo la página no se vuelve a montar, y la de antes no debe quedar abierta. */
  const [abierta, setAbierta] = useState({ id: currentUser.id, vista: 'inicio' })
  const scroll = useRef(null)
  const abrir = vista => { setAbierta({ id: currentUser.id, vista }); scroll.current?.scrollTo(0, 0) }
  const vista = abierta.id === currentUser.id ? abierta.vista : 'inicio'
  const pestana = miFicha && pestanasCon(miFicha.form).find(p => p.key === vista)

  if (vista === 'config' || vista === 'editar' || pestana) {
    // Cada miga: [texto, vista a la que lleva]. La última es la pantalla actual y va como título.
    const migas = pestana ? [['Mi perfil', 'inicio'], ['Mi ficha'], [pestana.titulo]]
      : vista === 'config' ? [['Mi perfil', 'inicio'], ['Configuración']]
        : [['Mi perfil', 'inicio'], ['Configuración', 'config'], ['Editar perfil de usuario']]
    return (
      <div ref={scroll} className="content-scroll" style={{ maxWidth: vista === 'config' ? 720 : vista === 'editar' ? 'none' : 960, margin: '0 auto', width: '100%', gap: 20 }}>
        {/* La misma miga que «Nuevo colaborador»: una línea, la flecha en el primer tramo y el
            último tramo es el <h1> de la página. */}
        <div className="cn-miga">
          <nav aria-label="Dónde estás">
            {migas.slice(0, -1).map(([texto, destino], i) => (
              <Fragment key={texto}>
                {i > 0 && <span className="cn-miga-sep" aria-hidden="true">›</span>}
                {destino
                  ? <button type="button" onClick={() => guardNavigate(() => abrir(destino))}>
                      {i === 0 && <ArrowLeft size={13} aria-hidden="true" />}
                      {texto}
                    </button>
                  : <span className="cn-miga-tramo">{texto}</span>}
              </Fragment>
            ))}
          </nav>
          <span className="cn-miga-sep" aria-hidden="true">›</span>
          <h1 className="cn-miga-fin">{migas[migas.length - 1][0]}</h1>
        </div>
        {pestana ? (
          <SeccionMiFicha key={vista} ficha={miFicha} pestana={vista} />
        ) : vista === 'config' ? (
          <ConfiguracionWeb onPerfilUsuario={() => abrir('editar')} />
        ) : miFicha ? (
          <EditarPerfil key={currentUser.id} ficha={miFicha} onGuardar={guardar} />
        ) : (
          <p className="mf-nota" style={{ fontStyle: 'italic' }}>RR.HH. todavía no registró su ficha.</p>
        )}
        <div style={{ height: 8 }} />
      </div>
    )
  }

  return (
    <div ref={scroll} className="content-scroll" style={{ maxWidth: 720, margin: '0 auto', width: '100%', gap: 26 }}>

      {/* LA TARJETA DE LA PERSONA, COMO EN EL TELÉFONO (opción B2 de Perfil, llevada a la web con la opción A
          de «Mi espacio web · Propuestas», 5 nov 2026): sin franja de color. Una tarjeta blanca destacada con
          los dos círculos menta translúcidos en la esquina, la foto con aro menta, el cargo y la antigüedad
          como texto gris y dos píldoras: Organigrama (blanca) y Configuración (menta).
          El cargo, el área y la sucursal siguen saliendo del puesto en el organigrama. */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--in-carta)', borderRadius: 28, boxShadow: 'var(--in-sombra)', padding: '30px 24px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'var(--in-texto)' }}>
        <span aria-hidden="true" style={{ position: 'absolute', right: -60, top: -70, width: 230, height: 230, borderRadius: '50%', background: 'var(--in-acento-bg)' }} />
        <span aria-hidden="true" style={{ position: 'absolute', right: -40, top: 90, width: 120, height: 120, borderRadius: '50%', background: 'var(--in-acento-bg)' }} />
        <div style={{
          position: 'relative', width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          border: '4px solid var(--in-carta)', boxShadow: '0 0 0 3px #00E091, 0 12px 26px -12px rgba(12,45,64,.45)', background: 'var(--in-carta)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {sinFoto ? (
            <span style={{ fontSize: 36, fontWeight: 700, color: '#fff', width: '100%', height: '100%', background: currentUser.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {currentUser.initials}
            </span>
          ) : (
            <img src={avatarUrl(currentUser.name, 240)} alt={currentUser.name} onError={() => setSinFoto(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}
        </div>
        <h1 style={{ position: 'relative', margin: '16px 0 0', fontSize: 24, fontWeight: 600, letterSpacing: '-.01em', lineHeight: 1.2 }}>{currentUser.name}</h1>
        <p style={{ position: 'relative', margin: '6px 0 0', fontSize: 14, color: 'var(--in-mute)' }}>
          {[cargo || 'Sin puesto asignado', area].filter(Boolean).join(' · ')}
        </p>
        {((sede || miFicha) || tiempo) && (
          <p style={{ position: 'relative', margin: '3px 0 0', fontSize: 14, color: 'var(--in-mute)' }}>
            {[sede ? sede.ciudad : miFicha?.sucursal, tiempo].filter(Boolean).join(' · ')}
          </p>
        )}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 22, width: '100%', maxWidth: 440 }}>
          <button type="button" onClick={() => gestiona ? navigate('/organizacion/organigrama') : null} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: 99, border: 'none',
            background: 'var(--in-carta)', boxShadow: 'var(--in-sombra)', color: 'var(--in-texto)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
            cursor: gestiona ? 'pointer' : 'default',
          }}>
            <Network size={16} /> Organigrama
          </button>
          <button type="button" onClick={() => abrir('config')} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: 99, border: 'none',
            background: '#00E091', color: '#0C2D40', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            <Settings size={16} /> Configuración
          </button>
        </div>
      </div>

      {/* LA FICHA PROPIA, PARA MIRARLA, como en el teléfono: una fila por sección, y cada una se
          abre en su pantalla. Las preferencias reemplazan a «Wishlist»: son los mismos regalos y
          experiencias que RR.HH. registra en Información Personal, y se editan en Configuración.
          Quien no tiene ficha de ejemplo sigue viendo las secciones vacías, que dicen lo que falta. */}
      {miFicha ? (
        <>
          <MiFichaWeb ficha={miFicha} onAbrir={abrir} />
          {preferenciasVisibles() && <Preferencias ficha={miFicha} />}
        </>
      ) : (
        <>
          <SeccionVacia icon={Gift} titulo="Wishlist" vacio="Sin deseos agregados" />
          <SeccionVacia icon={Sparkles} titulo="Habilidades" vacio="Sin habilidades agregadas" />
        </>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <h2 style={{
            margin: 0, flex: 1, fontSize: 11.5, fontWeight: 700, letterSpacing: '.08em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            Mis publicaciones
          </h2>
          <button
            aria-label="Nueva publicación"
            title="Publicar en el muro todavía no está construido en el prototipo"
            style={{
              width: 38, height: 38, borderRadius: 12, border: 'none', background: 'var(--navy)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'default', flexShrink: 0,
            }}
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="sec-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <FileText size={30} strokeWidth={1.5} style={{ color: 'var(--icon-muted)', margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>Todavía no publicaste nada</div>
          <p style={{ margin: '6px auto 0', maxWidth: 320, fontSize: 12, lineHeight: 1.55, color: 'var(--text-muted)' }}>
            Lo que publiques en el muro de la empresa aparecerá aquí, en tu perfil.
          </p>
        </div>
      </div>

      <div style={{ height: 8 }} />
    </div>
  )
}
