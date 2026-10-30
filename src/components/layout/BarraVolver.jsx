import { ChevronLeft } from 'lucide-react'

/* Cabecera de las sub-pantallas del teléfono: la barra inferior sigue visible porque no
   saliste de la pestaña, pero hace falta una salida explícita hacia el nivel de arriba.

   La fila entera es el botón, no solo el chevron: un blanco de 20×20 px es de los tamaños
   que más se fallan con el pulgar, y la palabra que está al lado ya se lee como parte del
   mismo control. Separarlos obliga a apuntar. */
/* `conTema` la pinta con los colores del sistema, para las pantallas del teléfono que ya siguen el
   modo oscuro (la ficha del colaborador). Las demás siguen en claro y la usan sin él. */
export default function BarraVolver({ texto, onVolver, conTema = false }) {
  return (
    <button
      onClick={onVolver}
      style={{
        display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8,
        background: 'none', border: 'none', padding: '2px 2px 2px 0',
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      }}
    >
      {/* El botón redondo blanco del Inicio (calendario, modo oscuro), no un cuadrado con borde. */}
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 26, height: 26, borderRadius: '50%', boxShadow: 'var(--in-sombra)',
        background: conTema ? 'var(--surface-card)' : '#fff', color: conTema ? 'var(--text-heading)' : '#0C2D40', flexShrink: 0,
      }}>
        <ChevronLeft size={12} strokeWidth={2.2} />
      </span>
      <span style={{ fontSize: 8.6, fontWeight: 600, color: conTema ? 'var(--text-heading)' : '#0C2D40' }}>{texto}</span>
    </button>
  )
}
