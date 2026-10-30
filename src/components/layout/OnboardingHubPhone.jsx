import { Rocket, Users, HeartHandshake, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { colaboradoresData } from '../../pages/personas/colaboradoresData'

/* Las etiquetas de estado de siempre (DISENO_MOBILE.md): rojo = en riesgo, verde = listo, gris = lo demás. */
const TONO = { gris: ['var(--tx-gris)', 'var(--tn-gris)'], rojo: ['var(--in-rojo)', 'var(--in-rojo-bg)'], verde: ['var(--tx-verde)', 'var(--tn-verde)'] }
function Etiqueta({ children, tono = 'gris', Icon }) {
  const [c, bg] = TONO[tono]
  return (
    <em style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 7px', color: c, background: bg }}>
      {Icon && <Icon size={7} />}
      {children}
    </em>
  )
}

/* Hub del módulo Onboarding para quien tiene más de un destino adentro: el líder (su ruta y
   el seguimiento de su área) y el buddy (su ruta y su gente acompañada). El colaborador no
   pasa por aquí: con un solo destino, un hub sobra.

   El orden de las tarjetas no es fijo, es por urgencia: arriba va el trabajo que le queda a
   la persona y abajo lo que ya cerró. Por eso al buddy graduado le abre con "Mis acompañados"
   y deja "Mi onboarding" como consulta.

   Con las piezas de Zona HR (auditoría heurística): el ícono en el círculo con aro menta, tarjetas con
   sombra y no con borde, y trato de usted. */
export default function OnboardingHubPhone({ currentUser, onIr }) {
  const { asignaciones } = useOnboardingData()
  const esBuddy = currentUser.role === 'buddy'

  const cardMiOnboarding = {
    key: 'mi-onboarding',
    icon: Rocket,
    titulo: 'Mi onboarding',
    detalle: 'Su propia ruta de incorporación',
    pie: currentUser.onbGraduado ? <Etiqueta tono="verde" Icon={CheckCircle2}>Completado</Etiqueta> : null,
  }

  let tarjetas
  if (esBuddy) {
    const acompanados = colaboradoresData.filter(c => c.buddy?.name === currentUser.name)
    const enRiesgo = acompanados.filter(c => c.onb === 'en-riesgo').length

    tarjetas = [
      {
        key: 'acompanados',
        icon: HeartHandshake,
        titulo: 'Mis acompañados',
        detalle: `${acompanados.length} ${acompanados.length === 1 ? 'persona' : 'personas'} que acompaña`,
        pie: enRiesgo > 0 ? <Etiqueta tono="rojo" Icon={AlertTriangle}>{enRiesgo} en riesgo</Etiqueta> : null,
      },
      cardMiOnboarding,
    ]
  } else {
    const mios = asignaciones.filter(a => a.area === currentUser.area)
    const enAlerta = mios.filter(a => a.status === 'atrasado' || a.status === 'en-riesgo').length

    tarjetas = [
      cardMiOnboarding,
      {
        key: 'seguimiento',
        icon: Users,
        titulo: 'Seguimiento',
        detalle: `Su área: ${currentUser.area} · ${mios.length} ${mios.length === 1 ? 'persona' : 'personas'}`,
        pie: enAlerta > 0 ? <Etiqueta tono="rojo" Icon={AlertTriangle}>{enAlerta} necesitan atención</Etiqueta> : null,
      },
    ]
  }

  return (
    <div style={{ padding: '2px 2px', fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
      <div style={{ display: 'grid', marginBottom: 12 }}>
        <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>Onboarding</b>
        <small style={{ fontSize: 8.2, color: 'var(--in-mute)' }}>
          {esBuddy ? 'Su recorrido y las personas que acompaña' : 'Su recorrido y el de su equipo'}
        </small>
      </div>

      {tarjetas.map(t => (
        <button
          key={t.key}
          type="button"
          onClick={() => onIr(t.key)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left',
            background: 'var(--in-carta)', border: 'none', borderRadius: 15, boxShadow: 'var(--in-sombra)',
            padding: '11px 11px', marginBottom: 8, fontFamily: 'inherit', color: 'var(--in-texto)',
          }}
        >
          <span style={{ width: 32, height: 32, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px #00E091', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <t.icon size={14} strokeWidth={1.7} />
          </span>
          <span style={{ flex: 1, minWidth: 0, display: 'grid', gap: 1 }}>
            <b style={{ fontSize: 9.6, fontWeight: 600 }}>{t.titulo}</b>
            <small style={{ fontSize: 7.4, color: 'var(--in-mute)' }}>{t.detalle}</small>
            {t.pie && <span style={{ marginTop: 4 }}>{t.pie}</span>}
          </span>
          <ChevronRight size={12} style={{ color: 'var(--in-suave)', flexShrink: 0 }} />
        </button>
      ))}
    </div>
  )
}
