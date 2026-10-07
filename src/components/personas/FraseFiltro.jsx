import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import SelectorLista from './SelectorLista'
import {
  getUnidad, TODAS_UNIDADES, TODAS_SUCURSALES, TODOS_NEGOCIOS, TIPOS_CARGO, nivelesDe, esVacante,
} from '../../data/organigramaData'
/* Las sedes salen del contexto y ya no del módulo de datos: el catálogo se edita en
   Organización › Sucursales, así que la lista sembrada se quedaba vieja en cuanto alguien
   agregaba una. Y son solo las del ALCANCE de quien mira: a un jefe de sucursal ofrecerle las
   ocho es ofrecerle siete que no puede ver. */

/* LOS FILTROS, CADA UNO CON SU NOMBRE: Cargos · Unidad organizacional · Unidad de negocio · Lugar.

   Fueron una frase —«Viendo todos los cargos de toda la empresa en todos los lugares»— y se
   leía bien con tres huecos; con la unidad de negocio eran cuatro y la frase ya no se leía como
   frase. Con el nombre encima cada filtro se encuentra sin leer los demás.

   Sigue valiendo lo de antes: lo que muestra cada uno es la respuesta actual —«Staff · Vacantes»,
   «Toda la empresa»— y no hace falta abrir nada para saber qué está recortando. El que recorta
   algo se pinta, y los que siguen en su valor de fábrica no.

   LO QUE NO FILTRA NO VA ACÁ. «Qué se dibuja» no deja a nadie afuera: cambia el papel, y vive en
   el lienzo, que es donde se ve lo que hace.

   LOS TRES RECORTES DE PUESTO COMPARTEN UNO. Clase, nivel y estado arman una sola idea —qué
   cargos— y van juntos en «Cargos». */

/* Cuánto aire dejar contra el borde de la ventana. */
const MARGEN = 12

/* El menú de un hueco. Va contra la pantalla y no dentro de la barra: la barra vive arriba del
   lienzo y cualquier `overflow` de por medio recortaría la lista. */
function Menu({ etiqueta, activo, ancho = 250, children }) {
  const [abierto, setAbierto] = useState(false)
  const [pos, setPos] = useState(null)
  const boton = useRef(null)
  const caja = useRef(null)

  useLayoutEffect(() => {
    if (!abierto) return
    const r = boton.current.getBoundingClientRect()
    setPos({
      top: r.bottom + 6,
      left: Math.max(MARGEN, Math.min(r.left, window.innerWidth - ancho - MARGEN)),
      width: ancho,
    })
  }, [abierto, ancho])

  useEffect(() => {
    if (!abierto) return
    const fuera = e => {
      if (boton.current?.contains(e.target) || caja.current?.contains(e.target)) return
      setAbierto(false)
    }
    const tecla = e => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  return (
    <>
      <button
        ref={boton}
        type="button"
        className={`og-hueco${abierto ? ' on' : ''}${activo ? ' puesto' : ''}`}
        onClick={() => setAbierto(a => !a)}
        aria-expanded={abierto}
      >
        {etiqueta}
        <ChevronDown size={12} className="og-hueco-flecha" />
      </button>
      {/* EL PORTAL VA A `.og-page`, NO A `body`. Los colores de la leyenda —staff, outsourcing,
          vacante— son variables declaradas en `.og-page`, porque cada empresa elige los suyos.
          Colgado del `body` el menú queda fuera de ese alcance y las tres muestras salían del
          mismo azul de respaldo. Sigue siendo `fixed`, así que el sitio del que cuelga no cambia
          dónde se dibuja. */}
      {abierto && pos && createPortal(
        <div ref={caja} className="og-hueco-menu" style={pos}>{children}</div>,
        boton.current?.closest('.og-page') || document.body,
      )}
    </>
  )
}

const COLOR_TIPO = {
  colaborador: 'var(--navy)',
  staff: 'var(--og-staff)',
  outsourcing: 'var(--og-ext)',
}

/* LO MISMO, CORTO, para el desplegable con nombre —antes era una frase, «Viendo los cargos de staff…»—: el rótulo «Cargos» ya dice de qué se habla, así
   que el valor es solo lo elegido —«Staff · Vacantes»— o «Todos». */
function resumen({ tipos, grados, estado }, org) {
  const partes = []
  if (tipos.length > 0 && tipos.length < TIPOS_CARGO.length) {
    partes.push(tipos.map(k => TIPOS_CARGO.find(t => t.key === k)?.label).join(', '))
  }
  if (grados.length > 0) partes.push(grados.map(g => nivelesDe(org).find(n => n.id === g)?.nombre).join(', '))
  if (estado !== 'todos') partes.push(estado === 'vacantes' ? 'Vacantes' : 'Cubiertos')
  return partes.length ? partes.join(' · ') : 'Todos'
}

/* Cada filtro con su nombre encima. `puesto` lo pinta cuando está recortando algo, para ver de un
   vistazo cuáles dejan gente afuera. */
const Filtro = ({ rotulo, puesto, children }) => (
  <div className={`og-filtro${puesto ? ' og-filtro-puesto' : ''}`}>
    <span className="og-filtro-rot">{rotulo}</span>
    {children}
  </div>
)


export default function FraseFiltro({ org, filtros, onCambio, sedes = [], negocios = [], ranuraBuscador }) {
  const { tipos, grados, estado, unidadId, sedeId, negocioId } = filtros
  const hayPuesto = tipos.length > 0 || grados.length > 0 || estado !== 'todos'

  const alternarEnLista = (campo, valor) => onCambio({
    [campo]: filtros[campo].includes(valor)
      ? filtros[campo].filter(x => x !== valor)
      : [...filtros[campo], valor],
  })
  /* Los dos estados se excluyen, pero se apagan tocándolos otra vez: hace falta poder volver a
     «todos», y un grupo de radios no se apaga. */
  const alternarEstado = cual => onCambio({ estado: estado === cual ? 'todos' : cual })

  /* CUÁNTOS HAY DE CADA COSA. Es lo que vuelve entendible el menú: «Mando superior · 2» avisa
     de una que elegirlo va a dejar el dibujo casi vacío, y «Sin nivel declarado · 15» destapa
     algo que hoy no se ve en ninguna otra pantalla.

     Se cuenta sobre el organigrama COMPLETO y no sobre lo que ya quedó filtrado: si el número
     bajara al elegir, tocar dos veces la misma opción daría dos cifras distintas y ninguna
     serviría para decidir. */
  const cuentas = useMemo(() => {
    const tipo = {}
    for (const t of TIPOS_CARGO) tipo[t.key] = 0
    const grado = {}
    let sinNivel = 0, vacantes = 0
    for (const c of org.cargos) {
      tipo[c.tipo || 'colaborador'] = (tipo[c.tipo || 'colaborador'] || 0) + 1
      if (c.grado) grado[c.grado] = (grado[c.grado] || 0) + 1; else sinNivel++
      if (esVacante(c)) vacantes++
    }
    /* Por área, para el desplegable de la frase. Cuenta solo lo suyo y no lo de sus hijas: el
       número tiene que decir lo mismo que la fila donde está. La cuenta por sede se fue con el
       desplegable de sucursales. */
    const unidad = {}
    for (const c of org.cargos) unidad[c.unidadId] = (unidad[c.unidadId] || 0) + 1
    return { tipo, grado, sinNivel, vacantes, cubiertos: org.cargos.length - vacantes, unidad }
  }, [org])

  return (
    <div className="og-frase">
      <div className="og-frase-linea">
        <Filtro rotulo="Cargos" puesto={hayPuesto}>
        <Menu etiqueta={resumen(filtros, org)} activo={hayPuesto} ancho={264}>
          {/* CADA GRUPO CON LA FORMA DE LO QUE PREGUNTA. Eran nueve píldoras idénticas en tres
              bloques, y como nada las distinguía se leían como una sola sopa: no había manera de
              ver que «Colaborador» y «Mando medio» son cosas de distinta naturaleza.

              Ahora la CLASE va con su muestra de color —la misma de la leyenda—, el NIVEL como
              una escalera y el ESTADO como dos mitades que se excluyen. Y los tres llevan
              CUÁNTOS HAY, que es lo que evita elegir a ciegas y llegar a un dibujo vacío. */}
          <div className="og-hm-grupo">
            <span className="og-hm-rot">Clase de puesto</span>
            {TIPOS_CARGO.map(t => (
              <button
                key={t.key}
                type="button"
                className={`og-hm-fila${tipos.includes(t.key) ? ' on' : ''}`}
                onClick={() => alternarEnLista('tipos', t.key)}
                aria-pressed={tipos.includes(t.key)}
              >
                <span className="og-hm-m" style={{ color: COLOR_TIPO[t.key] }} />
                {t.label}
                <em>{cuentas.tipo[t.key] || 0}</em>
              </button>
            ))}
          </div>

          {/* UNA ESCALERA Y NO PÍLDORAS: la barra larga es el que más manda, que es exactamente lo
              que el organigrama ya dibuja con el escalón. Repite algo conocido en vez de inventar
              un lenguaje nuevo — y de paso no promete un color, porque el nivel no tiñe el cuadro. */}
          <div className="og-hm-grupo">
            <span className="og-hm-rot">Nivel de mando</span>
            {nivelesDe(org).map((n, i, todos) => (
              <button
                key={n.id}
                type="button"
                className={`og-hm-fila og-hm-peldano${grados.includes(n.id) ? ' on' : ''}`}
                onClick={() => alternarEnLista('grados', n.id)}
                aria-pressed={grados.includes(n.id)}
              >
                <span className="og-hm-barra" style={{ width: `${34 - i * (22 / Math.max(1, todos.length - 1))}px` }} />
                {n.nombre}
                <em>{cuentas.grado[n.id] || 0}</em>
              </button>
            ))}
            {/* Los que no declararon nivel: no se filtra por ellos —no es un peldaño— pero el
                número tiene que estar, porque es lo que falta declarar y no se ve en ninguna
                otra pantalla. */}
            {cuentas.sinNivel > 0 && (
              <span className="og-hm-fila og-hm-apagada">
                <span className="og-hm-barra og-hm-barra-nula" />
                Sin nivel declarado
                <em>{cuentas.sinNivel}</em>
              </span>
            )}
          </div>

          {/* DOS MITADES: son dos y se excluyen, así que la forma lo dice antes que el texto. */}
          <div className="og-hm-grupo">
            <span className="og-hm-rot">Estado</span>
            <div className="og-hm-par">
              <button
                type="button"
                className={`og-hm-mitad${estado === 'vacantes' ? ' on' : ''}`}
                onClick={() => alternarEstado('vacantes')}
                aria-pressed={estado === 'vacantes'}
              >
                Vacantes <em>{cuentas.vacantes}</em>
              </button>
              <button
                type="button"
                className={`og-hm-mitad${estado === 'cubiertos' ? ' on' : ''}`}
                onClick={() => alternarEstado('cubiertos')}
                aria-pressed={estado === 'cubiertos'}
              >
                Cubiertos <em>{cuentas.cubiertos}</em>
              </button>
            </div>
          </div>
          {hayPuesto && (
            <button
              type="button"
              className="og-hm-limpiar"
              onClick={() => onCambio({ tipos: [], grados: [], estado: 'todos' })}
            >
              Volver a todos los cargos
            </button>
          )}
        </Menu>
        </Filtro>

        <Filtro rotulo="Unidad organizacional" puesto={unidadId !== TODAS_UNIDADES}>
        <SelectorLista
          comoHueco
          valor={unidadId === TODAS_UNIDADES ? null : unidadId}
          onCambio={v => onCambio({ unidadId: v ?? TODAS_UNIDADES })}
          vacia="Toda la empresa"
          arbol
          vaciaN={org.cargos.length}
          opciones={org.unidades.map(u => ({
            id: u.id, nombre: u.nombre, padreId: u.padreId,
            detalle: getUnidad(u.padreId, org)?.nombre,
            n: cuentas.unidad[u.id] || 0,
          }))}
        />
        </Filtro>

        {/* LA UNIDAD DE NEGOCIO, solo si la empresa las usa. «Transversal» es una opción más: son
            los puestos que no pertenecen a ninguna, y también se quieren poder mirar solos. */}
        {negocios.length > 0 && (
          <Filtro rotulo="Unidad de negocio" puesto={negocioId !== TODOS_NEGOCIOS}>
            <SelectorLista
              comoHueco
              valor={negocioId === TODOS_NEGOCIOS ? null : negocioId}
              onCambio={v => onCambio({ negocioId: v ?? TODOS_NEGOCIOS })}
              vacia="Todas"
              vaciaN={org.cargos.length}
              opciones={negocios}
            />
          </Filtro>
        )}

        {/* «EN [SUCURSAL]» VOLVIÓ, PERO NO ES LO MISMO QUE ANTES. Aquella era la otra cara de un
            selector del encabezado que cambiaba la aplicación entera; esta es un recorte de ESTA
            vista, hermano de los dos de al lado, que arranca en «todas» y se quita tocándolo.

            Solo aparece si hay más de una sede: con una sola no es un filtro, es la misma empresa
            escrita de otra forma. */}
        {sedes.length > 1 && (
          <Filtro rotulo="Lugar" puesto={sedeId !== TODAS_SUCURSALES}>
            <SelectorLista
              comoHueco
              valor={sedeId === TODAS_SUCURSALES ? null : sedeId}
              onCambio={v => onCambio({ sedeId: v ?? TODAS_SUCURSALES })}
              vacia="Todos"
              vaciaN={org.cargos.length}
              arbol
              opciones={sedes}
            />
          </Filtro>
        )}
        {/* AL OTRO EXTREMO, el buscador. Vivía flotando sobre el
            organigrama y tapaba una esquina para siempre; acá queda al lado de los filtros, que
            es su misma familia —las dos formas de acotar lo que estás mirando—.

            Es una RANURA y no el buscador: el que busca en el dibujo necesita el lienzo para
            llevar la vista hasta el cuadro, así que sigue viviendo en el gráfico y solo se
            dibuja acá. En tarjetas y en tabla cada vista pone el suyo. */}
        <span className="og-frase-fin">
          <span className="og-frase-ranura" ref={ranuraBuscador} />
        </span>
      </div>
    </div>
  )
}
