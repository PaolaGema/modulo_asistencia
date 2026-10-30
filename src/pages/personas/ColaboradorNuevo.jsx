import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, LogOut, UserPlus, Users } from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useUnsavedChanges } from '../../context/UnsavedChangesContext'
import { ocupanteDe, TIPOS_CARGO, nivelesDe as nivelesDeMando } from '../../data/organigramaData'
import { descendientes, filasEje, lineaDe } from '../../data/estructuraData'
import { esVigente } from './colaboradoresData'
import {
  EN_BLANCO, NIVELES, PASOS, PASO_PREVIA, PESTANAS, alDia, pasoPedido, pestanaDe, documentoDe, faltaParaCrear, faltasParaCrear,
  consecuenciasDe, fechaCorta, inicialesDe, nombreDe, progresoDe, progresoPorPaso, tarjetasDe, tarjetasTodas,
} from '../../data/fichaColaborador'
import TarjetaCampos from '../../components/organizacion/TarjetaCampos'
import RielPasos from '../../components/personas/RielPasos'
import Acordeon from '../../components/personas/Acordeon'
import TarjetaReingreso from '../../components/personas/TarjetaReingreso'
import AsignacionAsistencia, { asignacionDeFicha } from '../../components/personas/AsignacionAsistencia'
import { useAsistencia } from '../../context/AsistenciaContext'
import ExpedientePrevia from '../../components/personas/ExpedientePrevia'
import ConfirmarAlta from '../../components/personas/ConfirmarAlta'

/* DAR DE ALTA A UNA PERSONA, EN SU PROPIA PANTALLA.
   «Nuevo colaborador» era un botón que no hacía nada, y lo que tiene que hacer no cabe en un
   modal: son más de ochenta datos que llegan de papeles distintos —el carnet, el contrato, la
   Gestora, el banco— y casi nunca el mismo día. Un modal es para una decisión corta; esto es
   una ficha que se llena con la carpeta delante y se vuelve a mirar meses después.

   SU PROPIA RUTA, y el paso en la dirección: `/personas/colaboradores/nuevo?paso=contrato` se
   puede enlazar y mandar por chat —«llename el paso 4»—, la flecha de atrás del navegador
   retrocede de paso en paso como uno espera, y recargar no devuelve al principio.

   SE GUARDA SOLO, SIEMPRE. El borrador vive en `localStorage` desde la primera letra, así que
   cerrar la pestaña en el paso 5 no cuesta nada: al volver está todo. Por eso no hay aviso de
   «tienes cambios sin guardar» —no los hay nunca— y por eso el botón de en medio dice «Guardar
   y salir» y no «Guardar»: guardar ya pasó, lo que ofrece es irse tranquilo.

   EL COLABORADOR NO EXISTE HASTA LA VISTA PREVIA. Mientras tanto es un borrador y nada más: no
   aparece en el directorio, no ocupa un puesto y no cuenta en ningún tablero. Media ficha
   cargada no es media persona contratada. */

const LLAVE_BORRADOR = 'colaboradorBorrador'

/* ── LA FICHA SE RECORRE CON RIEL Y ACORDEONES ────────────────────────────
   Durante un tiempo esta pantalla fue tres pantallas a la vez. No eran tres diseños sueltos
   sino dos decisiones que se combinaban —riel al costado contra pestañas arriba, campos de
   corrido contra acordeones— y se enseñaban juntas para que el equipo eligiera una.

   ELIGIERON: riel y acordeones. El riel tiene los nueve pasos siempre a la vista con su pista
   debajo, así que se sabe en todo momento dónde se está y qué falta; los acordeones dejan leer
   el paso primero como índice —qué secciones tiene y cuántos campos lleva cada una— y después
   como formulario, que es lo que evita que un paso de cuarenta campos sea una pared.

   ASÍ QUE SE FUERON LAS OTRAS DOS, y con ellas el interruptor que las cambiaba, el parámetro
   `?vista=` de la dirección y la tira de pestañas entera. Lo que queda no lleva rama: esto ya
   no es una comparación, es la pantalla. Están en el historial por si alguien las echa de
   menos, que es donde tiene que estar un andamio retirado y no en medio del archivo. */

export default function ColaboradorNuevo() {
  const navigate = useNavigate()
  const {
    organigrama, setOrganigrama, nodos, sucursales, colaboradores, setColaboradores, empresa,
    empresasGrupo,
  } = useOnboardingData()
  const at = useAsistencia()
  // La raíz de la pantalla, para encontrar desde ella el contenedor que se desplaza.
  const raiz = useRef(null)
  const [guardado, setForm] = useLocalStorage(LLAVE_BORRADOR, EN_BLANCO)

  /* LOS VALORES DE ARRANQUE TAMBIÉN VALEN PARA UN BORRADOR YA EMPEZADO. `useLocalStorage` usa el
     valor inicial sólo cuando no hay nada guardado, que es lo correcto para un borrador —lo que
     alguien escribió manda sobre cualquier arranque— pero deja fuera un caso: el campo que NO
     existía cuando se guardó.

     Pasó con el país emisor del documento secundario. Se le puso «Bolivia» de arranque, y las
     fichas a medio llenar siguieron abriéndolo vacío: en su borrador esa clave no estaba, así que
     no había nada que enseñar y tampoco nada que la rellenara. El campo parecía roto y el código
     estaba bien. Volverá a pasar con el siguiente campo que se añada.

     La mezcla sólo rellena AUSENCIAS: cualquier clave que el borrador tenga —aunque esté vacía—
     gana. Nada de lo que alguien escribió se pisa.

     Y `alDia` trae lo que se guardó con claves que ya no existen —el segundo contacto de
     emergencia de antes del grupo— a donde hoy se lee. */
  const form = useMemo(() => alDia({ ...EN_BLANCO, ...guardado }), [guardado])
  const [params, setParams] = useSearchParams()

  /* El paso sale de la dirección y se sanea: `?paso=cualquier-cosa` —escrito a mano o de un
     enlace viejo— abre el primero en vez de una pantalla en blanco. */
  const pedido = params.get('paso')
  const paso = pasoPedido(pedido)
  const indice = PASOS.findIndex(p => p.key === paso)

  /* TOCAR UN CAMPO ES CONFIRMARLO. Los datos que llegan de un reingreso —teléfono, domicilio,
     cuenta bancaria— vienen marcados porque pueden tener cuatro años, y la marca se levanta
     sola en cuanto alguien escribe encima. No hay un botón de «verificado»: un botón así se
     pulsa sin mirar, y escribir en el campo es la única prueba de que lo miraron de verdad.

     Se hace acá, en el único sitio por donde pasan todas las escrituras de la ficha, y no en
     cada campo: puesto en el campo habría que acordarse en los 254. */
  /* Algunas respuestas corrigen otro dato en el mismo gesto —decir que no es boliviana vacía una
     nacionalidad «Bolivia»—. Esas consecuencias viven en `consecuenciasDe`, junto a las demás
     reglas de la ficha, y no repartidas por la pantalla. */
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v, ...consecuenciasDe(k, v, prev) }))

  /* VARIAS CLAVES DE UNA VEZ, para lo que no es escribir en un campo. Hoy lo usa una sola cosa
     —quitar un hijo del medio, que hace subir un lugar a todos los de abajo— y con `set` en
     bucle serían quince renders encadenados para un clic. Va sobre `prev` y no sobre `form`:
     el borrador es lo que se guarda, y la mezcla con los valores de arranque se rehace sola. */
  const aplicar = parche => setForm(prev => ({ ...prev, ...parche }))

  /* LO QUE EL ESTUDIO NO PUEDE SABER: esta empresa.
     Los 249 campos vienen con catálogos de ejemplo para todo lo que sale de la estructura
     —sucursales, unidades, cargos, jefes—. Acá se reemplazan por los de verdad, los que el
     usuario cargó en Organización. Es la única parte del estudio que no se porta tal cual,
     porque no habla de la ley sino de esta empresa en particular.

     LO QUE SE OFRECE SON CARGOS, Y EL QUE NO TIENE SILLA LIBRE SE OFRECE APAGADO. Ofrecer una
     silla ocupada sería ofrecer sentar a dos personas en el mismo sitio. Cada opción viaja con
     lo que el puesto arrastra —área, sede, jefe— para poder enseñarlo sin recorrer el
     organigrama por campo. */
  const ctx = useMemo(() => {
    const cargos = organigrama?.cargos || []
    const unidadesOrg = organigrama?.unidades || []
    const nombreDeId = id => colaboradores.find(c => c.id === id)?.name || null

    /* ── LOS PELDAÑOS DEL ÁRBOL, CON FORMA DE ÁRBOL ─────────────────────────
       Una unidad organizacional vive dentro de otra y un centro de trabajo dentro de una
       sucursal. Enseñarlos como una lista plana los convierte en hermanos: «Recursos Humanos»,
       «Selección» y «Nómina» se leen como tres opciones del mismo rango cuando dos cuelgan de
       la primera, y quien elige no tiene cómo saberlo.

       ES LA MISMA FUNCIÓN QUE ARMA LA TABLA DE ORGANIZACIÓN, `filasEje`, y por eso este
       desplegable no puede discrepar de lo que se ve allá: si alguien mueve una unidad, la
       ficha se entera el mismo día. `Desplegable` ya sabía sangrar por `nivel` y ubicar por
       `pista` cuando se busca —lo usa la ficha de un nodo—; acá solo hay que dárselos.

       Y CADA OPCIÓN VIAJA CON SUS ANTEPASADOS, que es lo que permite encadenar un selector con
       el de arriba sin que la ficha tenga que recorrer el árbol otra vez. Van por NOMBRE y no
       por id porque es el nombre lo que guarda el campo de arriba: comparar ids obligaría a
       traducir en los dos sentidos por una ganancia que nadie vería. */
    const porId = new Map((nodos || []).map(n => [n.id, n]))
    const ancestrosDe = id => {
      const salida = []
      let p = porId.get(id)?.padreId
      for (let v = 0; p && v < 20; v += 1) { salida.push(porId.get(p)?.nombre); p = porId.get(p)?.padreId }
      return salida.filter(Boolean)
    }

    const ramaDe = tipos => {
      const pila = []
      return filasEje(nodos || [], tipos).map(f => {
        pila[f.nivel] = f.nodo.nombre
        return {
          /* El valor sigue siendo el NOMBRE y no el id: es lo que la ficha guardó siempre y lo
             que se lee en la vista previa. El id viaja aparte, para encadenar. */
          valor: f.nodo.nombre,
          etiqueta: f.nodo.nombre,
          nivel: f.nivel,
          pista: pila.slice(0, f.nivel).join(' › '),
          ancestros: ancestrosDe(f.nodo.id),
          nodoId: f.nodo.id,
        }
      })
    }

    /* El NOMBRE del negocio y no su id, por lo mismo que los demás: es lo que guarda la ficha. */
    const negocioDe = id => {
      const l = id ? lineaDe(id, nodos || []) : null
      return l ? porId.get(l)?.nombre || null : null
    }

    /* ── UNA OPCIÓN POR CARGO, NO POR SILLA ─────────────────────────────────
       El organigrama guarda una silla por plaza abierta, así que un cargo con seis vacantes
       llegaba hasta acá como seis opciones idénticas: «Ejecutivo de Ventas · Comercial» repetido
       seis veces, sin una letra que distinguiera una de otra. Quien contrata no elige la silla
       número tres —no sabe que existen tres ni le importa—: elige el cargo, y cuál de las libres
       se ocupa es cuenta del sistema.

       SE AGRUPA POR CARGO Y SE ASIGNA LA PRIMERA LIBRE. Lo que se guarda sigue siendo el id de
       una silla, que es lo que el resto de la ficha ya lee para sacar el área, la sede y el
       jefe: el cambio es de presentación, no de dato.

       Y EL CARGO SIN NINGUNA SILLA LIBRE NO DESAPARECE, se apaga con el motivo al lado. Quitarlo
       de la lista deja a quien lo busca sin saber si no existe, si se escribe distinto o si
       están todas ocupadas —y esa última es justo la respuesta que necesita para ir a abrir una
       plaza en Organización—. */
    /* Y UNA POR SEDE, desde que la ficha pregunta primero dónde se trabaja. «Ejecutivo Comercial»
       con sillas en La Paz y en Santa Cruz son dos respuestas distintas para quien ya eligió
       sucursal: juntas, la silla que se asignaba era la primera libre de cualquier sede, y alguien
       dado de alta en Santa Cruz podía terminar sentado en La Paz. */
    const sedeDe = c => (c.sucursalIds || [])[0] || ''
    const porCargo = new Map()
    for (const c of cargos) {
      const clave = `${c.nombre}|${c.unidadId || ''}|${sedeDe(c)}`
      const grupo = porCargo.get(clave)
      if (grupo) grupo.push(c)
      else porCargo.set(clave, [c])
    }
    /* Cuántas sedes tiene cada cargo: sólo al que está en más de una le hace falta decir cuál en
       la etiqueta. Al resto le sobra. */
    const sedesPorCargo = new Map()
    for (const [c] of porCargo.values()) {
      const k = `${c.nombre}|${c.unidadId || ''}`
      sedesPorCargo.set(k, (sedesPorCargo.get(k) || 0) + 1)
    }
    const nombreDeSede = id => porId.get(id)?.nombre || sucursales.find(s => s.id === id)?.nombre

    const puestos = [...porCargo.values()].map(sillas => {
      const libres = sillas.filter(s => ocupanteDe(s) == null)
      /* La silla que se va a ocupar es la primera libre. Si no hay ninguna, se toma la primera a
         secas: la opción no se puede elegir, pero igual tiene que saber decir su área y su jefe. */
      const c = libres[0] || sillas[0]
      const unidad = unidadesOrg.find(u => u.id === c.unidadId)
      const jefeCargo = cargos.find(x => x.id === c.reportaA)
      const jefeId = jefeCargo ? ocupanteDe(jefeCargo) : null
      const sedes = (c.sucursalIds || []).map(nombreDeSede).filter(Boolean)
      const variasSedes = sedesPorCargo.get(`${c.nombre}|${c.unidadId || ''}`) > 1

      return {
        valor: c.id,
        /* El área va en la etiqueta porque hay cargos que se llaman igual en dos áreas
           —«Analista», «Asistente»— y elegir uno a ciegas es elegir mal la mitad de las veces. */
        etiqueta: [c.nombre, unidad?.nombre, variasSedes ? (sedes[0] || 'Toda la empresa') : null]
          .filter(Boolean).join(' · '),
        agotada: libres.length === 0,
        motivo: libres.length === 0
          ? `sin puestos libres · ${sillas.length} ocupado${sillas.length === 1 ? '' : 's'}`
          : undefined,
        libres: libres.length,
        plazas: sillas.length,
        area: unidad?.nombre || '',
        /* Un puesto sin sede declarada no es un puesto sin sede: es uno que vale para toda la
           empresa. Son dos cosas distintas y el campo tiene que decir cuál. */
        sede: sedes.join(' · ') || 'Toda la empresa',
        jefe: jefeId
          ? nombreDeId(jefeId)
          : jefeCargo ? `${jefeCargo.nombre} · puesto vacante` : 'Nadie: es la punta del organigrama',
        clase: TIPOS_CARGO.find(t => t.key === (c.tipo || 'colaborador'))?.label || '',
        /* EL NIVEL DE MANDO DEL CARGO, con el nombre que le puso la empresa en Organización. Es
           del cargo y no de la persona: la ficha lo enseña, no lo pregunta (3.11n). */
        mando: nivelesDeMando(organigrama || undefined).find(n => n.id === c.grado)?.nombre || '',
        /* SU UNIDAD Y TODAS LAS DE ENCIMA. Elegir «Comercial» tiene que ofrecer también los
           cargos de «Ventas» y «Preventa», que están dentro: quien contrata piensa en el área
           grande y el cargo vive tres escalones abajo. Por eso es la rama entera y no el padre. */
        ancestros: c.unidadId ? [unidad?.nombre, ...ancestrosDe(c.unidadId)].filter(Boolean) : [],
        /* DÓNDE SE TRABAJA, CON TODO LO DE ENCIMA: la sede de la silla, su sucursal y su región.
           Es lo que deja filtrar el cargo por lo que ya se contestó arriba, sea el peldaño que
           sea. Una silla sin sede vale para toda la empresa y pasa cualquier filtro. */
        sedes,
        lugares: sedes.length ? [...sedes, ...ancestrosDe(sedeDe(c))] : null,
        /* DE QUÉ NEGOCIO ES LA SILLA, con la misma regla que Organización: la de su unidad y, si
           la unidad no declara ninguna, la del sitio donde se trabaja. Sin línea es transversal. */
        negocios: (() => {
          const n = negocioDe(c.id) || (c.unidadId ? negocioDe(c.unidadId) : null)
          return n ? [n] : null
        })(),
      }
    })

    /* ── LA UNIDAD SE FILTRA POR SUS SILLAS, NO POR SU SEDE ──────────────────
       Una unidad no cuelga de ningún lugar: «Ventas» tiene su jefatura en la casa matriz y
       vendedores en cinco ciudades. Filtrarla por su ancla la escondería en todas menos una. Lo que
       se pregunta es si tiene alguna silla en la sucursal elegida —ella o alguna de sus hijas—, y
       eso ya lo dicen los cargos. La que tiene una silla sin sede, o ninguna silla todavía, se
       ofrece siempre: no hay nada que diga que no está ahí. */
    const unico = xs => [...new Set(xs.filter(Boolean))]
    /* Lo mismo con el negocio: el suyo, si lo declara, y el de cada una de sus sillas. «Ventas»
       vive en la casa matriz, que es de todos, pero vende en farmacias: es de Farmacias por sus
       vendedores. La que no toca ningún negocio es transversal y se ofrece siempre. */
    const negociosDe = (propio, suyos) => {
      const ns = unico([propio, ...suyos.flatMap(p => p.negocios || [])])
      return ns.length ? ns : null
    }
    const unidades = ramaDe(['unidad']).map(u => {
      const suyos = puestos.filter(p => p.ancestros.includes(u.valor))
      const negocios = negociosDe(negocioDe(u.nodoId), suyos)
      if (!suyos.length || suyos.some(p => !p.lugares)) return { ...u, negocios }
      return { ...u, negocios, sedes: unico(suyos.flatMap(p => p.sedes)), lugares: unico(suyos.flatMap(p => p.lugares)) }
    })

    /* ── QUÉ NEGOCIOS TOCAN CADA LUGAR ──────────────────────────────────────
       El que el lugar declara, el de los lugares que tiene dentro —una región no declara nada y
       sus sucursales sí— y el de las sillas que hay ahí. Es lo que deja recortar la unidad de
       negocio por la región o la sucursal elegida. Si el lugar no toca ninguno, no se recorta. */
    const lugaresCon = tipo => ramaDe([tipo]).map(l => {
      const dentro = descendientes(l.nodoId, nodos || []).map(id => negocioDe(id))
      const sillas = puestos.filter(p => p.lugares?.includes(l.valor))
      return { ...l, negocios: negociosDe(negocioDe(l.nodoId), [...sillas, { negocios: dentro }]) }
    })

    return {
      puestos,
      empresa,
      /* Las hermanas de esta empresa, para la pregunta de reingreso. Van enteras y no solo sus
         nombres: el campo enseña el corto, pero quien las consuma después necesita la razón
         social y el NIT. */
      grupo: empresasGrupo,
      unidades,
      negocios: ramaDe(['negocio']),
      regiones: lugaresCon('region'),
      sucursales: lugaresCon('sucursal'),
      centros: lugaresCon('centro'),
      /* SÓLO LOS VIGENTES. Esta lista alimenta todo campo que pide elegir a una persona —el
         jefe que aprueba, el garante, a quién avisar en una emergencia— y un desvinculado no
         puede ser ninguna de esas cosas. Sigue en el directorio porque es historia y porque
         hace falta para reconocer un reingreso, no para volver a asignarle nada. */
      personas: colaboradores.filter(esVigente).map(c => c.name).sort((a, b) => a.localeCompare(b)),
      /* Y DE CADA UNA, LO QUE SE ENSEÑA AL ELEGIRLA: su cargo y su área. Es lo que llena «Cargo
         del supervisor» (3.14) en cuanto se elige al supervisor inmediato. */
      datosDePersona: Object.fromEntries(colaboradores.filter(esVigente).map(c => [c.name, {
        cargo: c.cargo || '', area: c.depto || '', foto: c.foto, initials: c.initials, color: c.color,
      }])),
      // El organigrama tal cual, para la dependencia funcional: unidades y cargos, con sus ids.
      org: organigrama || { unidades: [], cargos: [] },
    }
  }, [organigrama, nodos, sucursales, colaboradores, empresa, empresasGrupo])

  const puestos = ctx.puestos

  /* EL NIVEL RECORTA LA FICHA, no la cambia: Mínimo legal ⊂ Operativo ⊂ Completo, el corte del
     propio estudio. Va en la dirección, porque «mirá el mínimo legal» se manda como enlace y no
     como instrucción.

     Y SE ABRE EN COMPLETO. Arrancaba en Operativo, que enseñaba una ficha recortada a quien venía
     a ver la ficha: los campos que faltaban no estaban marcados como omitidos —sencillamente no
     estaban— así que no había forma de saber desde dentro que se estaba mirando un extracto. El
     recorte sigue a un clic para quien lo quiera, pero por defecto se enseña lo que hay. */
  const pedidoNivel = params.get('nivel')
  const nivel = NIVELES.some(n => n.key === pedidoNivel) ? pedidoNivel : 'Completo'

  const progreso = useMemo(() => progresoDe(form, ctx, nivel), [form, ctx, nivel])
  /* La cinta se cuenta sobre el nivel que se está mirando, no sobre el mínimo: es el mapa de lo
     que hay en pantalla. Bajar a «Mínimo legal» rellena los segmentos de golpe, y está bien que
     así sea —son menos campos los que se piden— porque es exactamente lo que el nivel promete. */
  /* Indexado por clave y no como lista: el riel y las pestañas recorren los NUEVE pasos —con
     la vista previa, que no se llena— y preguntan por el suyo. Una lista obligaría a que los
     dos supieran que la previa no está y a alinear posiciones a mano. */
  const avance = useMemo(() => {
    const porClave = {}
    for (const t of progresoPorPaso(form, ctx, nivel)) porClave[t.key] = t
    return porClave
  }, [form, ctx, nivel])
  /* EL RIEL MIDE PESTAÑAS: su aro suma los campos de todas sus partes, y su punto rojo se
     enciende si cualquiera de ellas debe algo del mínimo legal. */
  const avancePestana = useMemo(() => {
    const porClave = {}
    for (const t of PESTANAS) {
      const puestos = t.partes.reduce((n, k) => n + (avance[k]?.puestos || 0), 0)
      const total = t.partes.reduce((n, k) => n + (avance[k]?.total || 0), 0)
      porClave[t.key] = { puestos, total, pct: total ? Math.round((puestos / total) * 100) : 0 }
    }
    return porClave
  }, [avance])
  const falta = faltaParaCrear(form)

  /* Qué pasos tienen algo del MÍNIMO LEGAL sin llenar: es el punto rojo de las pestañas. Se
     cuenta sobre el mínimo y no sobre el nivel que se está mirando, porque el punto avisa de lo
     que impide declarar a la persona —y eso no cambia porque uno decida mirar menos campos. */
  const pendientes = useMemo(() => {
    const set = new Set()
    for (const { paso: p, tarjetas } of tarjetasTodas(form, ctx, 'Mínimo')) {
      const debe = tarjetas.flatMap(t => t.campos)
        .some(c => c.requerido && c.tipo !== 'rotulo' && c.deducido === undefined
          && !String(form[c.key] ?? '').trim())
      if (debe) set.add(p.key)
    }
    return set
  }, [form, ctx])
  const pendientesPestana = useMemo(
    () => new Set(PESTANAS.filter(t => t.partes.some(k => pendientes.has(k))).map(t => t.key)),
    [pendientes],
  )

  /* EL NIVEL SIGUE VIVIENDO EN LA DIRECCIÓN, no en un ajuste escondido: `?nivel=Mínimo` se copia
     y se manda, que es de lo que se trata. Lo acompañaba un `?vista=` para elegir entre las tres
     propuestas; elegida una, el parámetro no tenía ya nada que decir y se fue con ellas. Un enlace
     viejo que todavía lo traiga no rompe nada: sobra, y se ignora. */
  const irA = (clave, otroNivel = nivel) => {
    const q = {}
    if (clave !== PASOS[0].key) q.paso = clave
    if (otroNivel !== 'Completo') q.nivel = otroNivel
    setParams(q)
    /* Cambiar de paso es cambiar de pantalla: quedarse a media altura del formulario anterior
       hace pensar que no pasó nada.

       Y LO QUE SE DESPLAZA NO ES LA VENTANA sino el <main> del layout, que tiene su propio
       scroll. Con `window.scrollTo` la ventana ya estaba arriba y no pasaba nada: se llegaba a la
       vista previa a la altura del paso anterior, que en un formulario largo es el final. Se sube
       el contenedor que de verdad se desplaza, y la ventana también por si algún día lo es. */
    const lienzo = raiz.current?.closest('main')
    if (lienzo) lienzo.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
  }

  const volverALista = () => navigate('/personas/colaboradores')

  /* ── «¿ESTÁ SEGURO DE SALIR?» ─────────────────────────────────────────────────
     Pedido por el equipo (30 sep 2026): con un registro empezado, irse a otra pantalla —el menú
     lateral, el menú del módulo, la miga de «Colaboradores»— pregunta antes. El borrador ya se
     guarda solo desde la primera letra, así que «Guardar borrador y salir» no pierde nada;
     «Salir sin guardar» es la única forma de tirarlo, y por eso lo borra de verdad.

     SE PREGUNTA SÓLO SI HAY ALGO REGISTRADO: una ficha recién abierta, con los valores de
     arranque —Bolivia, «No» en el reingreso—, no tiene nada que perder. Y no se pregunta al
     pulsar «Guardar borrador y salir» ni al dar de alta: ahí la persona ya dijo qué quiere. */
  const { setDirty, setSaveHandler, setDiscardHandler, setTextos, guardNavigate } = useUnsavedChanges()
  const hayRegistro = Object.keys(guardado || {}).some(k => {
    if (k.startsWith('__')) return false
    const v = guardado[k]
    const texto = v && typeof v === 'object' ? JSON.stringify(v) : String(v ?? '').trim()
    const base = EN_BLANCO[k]
    const deArranque = base && typeof base === 'object' ? JSON.stringify(base) : String(base ?? '').trim()
    return texto !== '' && texto !== deArranque
  })
  useEffect(() => { setDirty(hayRegistro) }, [hayRegistro, setDirty])
  useEffect(() => {
    setTextos({
      titulo: '¿Está seguro de salir?',
      texto: 'El registro de este colaborador está a medio llenar. ¿Quiere guardarlo como borrador para continuar después?',
      guardar: 'Guardar borrador y salir',
      descartar: 'Salir sin guardar',
      quedarse: 'Seguir registrando',
    })
    // El borrador ya está guardado: guardar es sólo salir. Descartar lo borra.
    setSaveHandler(() => {})
    setDiscardHandler(() => setForm(EN_BLANCO))
    return () => { setDirty(false); setTextos(null); setSaveHandler(null); setDiscardHandler(null) }
  }, [setDirty, setTextos, setSaveHandler, setDiscardHandler, setForm])
  const salirPorLaMiga = () => guardNavigate(volverALista)

  /* CREAR ES DOS COSAS A LA VEZ y por eso vive en una sola función: la persona entra al
     directorio y, si eligió un puesto, se sienta en él. Hacer solo lo primero deja a alguien
     contratado que el organigrama no conoce, y es justo el estado que obliga a acordarse
     mañana de ir a ubicarlo. */
  function crear() {
    /* SI FALTA ALGO, SE DICE ANTES DE MOVER A NADIE. Llevaba directo al paso del primer faltante
       sin una palabra, y se leía como que el botón había fallado o había sacado de la vista
       previa sin motivo. Ahora un aviso lista todo lo que falta y cada fila lleva a su campo. */
    if (falta) { setAvisoAlta(true); return }
    /* Y SI NO FALTA NADA, SE CONFIRMA. Es lo único de la ficha que no se deshace con otro clic:
       el diálogo enseña a quién se da de alta y recién su «Sí» llama a `darDeAlta`. */
    setConfirmaAlta(true)
  }

  function darDeAlta() {
    setConfirmaAlta(false)
    const id = Math.max(0, ...colaboradores.map(c => c.id || 0)) + 1
    /* Las claves son los ids del estudio: 3.11 es «Cargo actual», 3.22 el correo corporativo,
       3.25 la fecha de ingreso legal, 7.6 el rol en el sistema. Se leen raro y valen la pena:
       desde cualquiera de ellas se vuelve a la fila de la propuesta v1.2 que la justifica. */
    const puesto = puestos.find(p => p.valor === form['3.11']) || null

    setColaboradores(prev => [...prev, {
      id,
      name: nombreDe(form),
      email: (form['3.22'] || form['1.38'] || '').trim(),
      /* EL DOCUMENTO SUBE A PRIMER NIVEL. La ficha entera viaja acá abajo en `ficha`, así que el
         dato ya estaba — pero enterrado en `ficha['1.11']`, partido en tres y donde ninguna
         búsqueda lo iba a mirar. Arriba es lo que permite reconocer a alguien que vuelve: dos
         personas pueden llamarse igual y escribirse distinto —«María Fernanda Rojas Vargas»
         contra «Maria Rojas»— pero no comparten documento.

         SE LLAMABA `ci` y el nombre mentía fuera de Bolivia: acá cabe un pasaporte, un DNI o una
         cédula, y ninguno es un carnet de identidad. Es el documento con el que esa persona se
         identificó, sea cual sea. */
      documento: documentoDe(form),
      /* El área del directorio es el respaldo de quien todavía no está en ningún cuadro: si
         eligió puesto manda la unidad de ese puesto, y si no, lo que haya dicho en 3.5. */
      depto: puesto?.area || form['3.5'] || 'Sin asignar',
      cargo: puesto ? puesto.etiqueta.split(' · ')[0] : 'Sin puesto asignado',
      rol: form['7.6'] || 'Colaborador',
      ingreso: fechaCorta(form['3.25']),
      status: 'activo',
      registro: progreso.pct,
      /* Recién creado no tiene ruta: la asigna RRHH desde el propio directorio. */
      onb: 'sin-ruta',
      initials: inicialesDe(form),
      color: '#0C2D40',
      fotoClave: form['1.9']?.clave || null,
      /* LA FICHA ENTERA VIAJA CON LA PERSONA. El directorio usa ocho campos, pero los otros
         doscientos cuarenta son el motivo por el que existe esta pantalla: tirarlos al guardar
         sería pedir dos veces lo mismo. */
      ficha: form,
    }])

    /* SU ASISTENCIA: lo elegido en la parte Asistencia queda asignado en el módulo desde hoy. */
    const asistencia = asignacionDeFicha(form, at)
    if (asistencia) at.asignar([id], asistencia)

    if (puesto) {
      setOrganigrama(prev => ({
        ...prev,
        cargos: (prev.cargos || []).map(c => (c.id === puesto.valor ? { ...c, ocupanteId: id, ocupantes: [id] } : c)),
      }))
    }

    // El borrador cumplió: si se quedara, la próxima alta abriría con los datos del anterior.
    setForm(EN_BLANCO)
    navigate('/personas/colaboradores')
  }

  const enPrevia = paso === PASO_PREVIA
  /* En Asistencia, la primera sección es la del módulo: horario, lugar, modalidad y cómo marca.
     Los campos del estudio (jornada legal, vacaciones, permisos) siguen debajo. */
  const tarjetas = enPrevia ? [] : [
    ...(paso === 'asistencia' ? [{ id: 'at-modulo', titulo: 'Asignación de asistencia', desc: 'Su horario, dónde marca y cómo marca. Desde su primer día aparece en Hoy y en su app.', campos: [] }] : []),
    ...tarjetasDe(paso, form, ctx, nivel),
  ]
  const pasoActual = PASOS[indice]
  const pestana = pestanaDe(paso)
  /* El riel lista las pestañas y la vista previa; pulsar una pestaña abre su primera parte. */
  const itemsRiel = [
    ...PESTANAS.map(t => ({ key: t.key, n: t.n, titulo: t.titulo, pista: t.pista })),
    PASOS[PASOS.length - 1],
  ]
  const irAPestana = clave => irA(clave === PASO_PREVIA ? PASO_PREVIA : PESTANAS.find(t => t.key === clave).partes[0])

  /* QUÉ ACORDEONES ESTÁN ABIERTOS, por paso y sin efecto que lo sincronice: mientras nadie tocó
     el paso, la respuesta se DEDUCE —el primero abierto, el resto plegado—, y recién cuando
     alguien pliega o despliega algo ese paso pasa a tener una respuesta guardada. Un efecto que
     reiniciara la lista en cada cambio de paso haría lo mismo con un dibujo de más y perdería lo
     que el usuario había abierto al volver. */
  const [abiertosPorPaso, setAbiertosPorPaso] = useState({})
  const abiertos = abiertosPorPaso[paso] ?? (tarjetas[0] ? [tarjetas[0].titulo] : [])
  const alternar = titulo => setAbiertosPorPaso(prev => {
    const s = new Set(prev[paso] ?? abiertos)
    if (s.has(titulo)) s.delete(titulo); else s.add(titulo)
    return { ...prev, [paso]: [...s] }
  })

  /* ── LLEVAR HASTA EL CAMPO QUE FALTA, NO SÓLO HASTA SU PASO ──────────────────
     Cambiar de paso dejaba a la persona arriba de un paso de cinco secciones plegadas, buscando
     dónde estaba «Fecha de ingreso». Se abre la sección que lo contiene, se baja hasta él, se le
     pone el cursor y se lo resalta un momento para que el ojo lo encuentre. */
  const [avisoAlta, setAvisoAlta] = useState(false)
  const [confirmaAlta, setConfirmaAlta] = useState(false)
  const [enfocar, setEnfocar] = useState(null)
  const irAlCampo = f => {
    setAvisoAlta(false)
    const suyas = tarjetasDe(f.paso, form, ctx, nivel)
    const tarjeta = suyas.find(t => t.campos.some(c => c.key === f.key))
    if (tarjeta) {
      setAbiertosPorPaso(prev => {
        const antes = prev[f.paso] ?? (suyas[0] ? [suyas[0].titulo] : [])
        return { ...prev, [f.paso]: [...new Set([...antes, tarjeta.titulo])] }
      })
    }
    irA(f.paso)
    setEnfocar(f.key)
  }
  useEffect(() => {
    if (!enfocar || paso === PASO_PREVIA) return
    // Después del cambio de parte y de que la sección termine de abrirse (su movimiento dura ~0,3 s).
    const t = setTimeout(() => {
      const el = document.getElementById(`cn-${enfocar}`)
      setEnfocar(null)
      if (!el) return
      const quieto = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'center' })
      el.focus({ preventScroll: true })
      const caja = el.closest('.pl-label')?.parentElement || el.parentElement
      caja?.classList.add('cn-resaltado')
      setTimeout(() => caja?.classList.remove('cn-resaltado'), 2400)
    }, 320)
    return () => clearTimeout(t)
  }, [enfocar, paso])

  /* El aviso se cierra con Escape, como cualquier diálogo. */
  useEffect(() => {
    if (!avisoAlta) return
    const alTeclear = e => { if (e.key === 'Escape') setAvisoAlta(false) }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [avisoAlta])

  const faltas = faltasParaCrear(form)
  const avisoDeAlta = avisoAlta && faltas.length > 0 && (
    <div className="pl-overlay" onClick={() => setAvisoAlta(false)}>
      <div
        className="pl-modal pl-modal-sm cn-alta"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cn-alta-tit"
        onClick={e => e.stopPropagation()}
      >
        <div className="cn-alta-cab">
          <span className="cn-alta-ico" aria-hidden="true"><AlertTriangle size={22} /></span>
          <h2 id="cn-alta-tit">Todavía no se puede dar de alta</h2>
          <p>
            {faltas.length === 1 ? 'Falta un dato obligatorio.' : `Faltan ${faltas.length} datos obligatorios.`}
            {' '}Sin ellos no hay a quién dar de alta ni desde cuándo contar su antigüedad.
          </p>
        </div>
        <ul className="cn-alta-lista">
          {faltas.map(f => {
            const p = PASOS.find(x => x.key === f.paso)
            return (
              <li key={f.key}>
                <span className="cn-alta-num" aria-hidden="true">{p?.n}</span>
                <span className="cn-alta-txt">
                  <b>{f.nombre[0].toUpperCase() + f.nombre.slice(1)}</b>
                  <small>{pestanaDe(f.paso)?.titulo}{pestanaDe(f.paso)?.partes.length > 1 ? ` · ${p?.titulo}` : ''}</small>
                </span>
                <button type="button" onClick={() => irAlCampo(f)}>
                  Completar <ArrowRight size={13} aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
        <div className="pl-modal-footer">
          <button type="button" className="pl-btn-cancel" onClick={() => setAvisoAlta(false)}>
            Seguir revisando
          </button>
          <button type="button" className="pl-btn-save" autoFocus onClick={() => irAlCampo(faltas[0])}>
            Ir al primero
          </button>
        </div>
      </div>
    </div>
  )

  const escribibles = t => t.campos.filter(c => c.deducido === undefined)
  const llenosDe = t => escribibles(t).filter(c => String(form[c.key] ?? '').trim()).length

  /* SIN PUESTOS NO HAY NADA QUE ELEGIR, y conviene decirlo antes de que alguien abra el
     desplegable a ver qué hay. La ficha se puede terminar igual: el puesto se asigna después
     desde el organigrama.

     NO ES «NINGÚN CARGO» SINO «NINGUNO CON SILLA LIBRE». Desde que la lista enseña también los
     cargos agotados, contar cuántos hay ya no contesta la pregunta: puede haber treinta y estar
     los treinta ocupados, que para quien viene a dar de alta es exactamente lo mismo que no
     haber ninguno. */
  const avisoSinPuestos = paso === 'puesto' && !puestos.some(p => !p.agotada) && (
    <div className="cn-aviso cn-aviso-suave">
      <Users size={15} />
      <span>
        No hay puestos libres en la estructura. Puede crear al colaborador de todos modos y ubicarlo
        después, o abrir un puesto en Organización.
      </span>
      <button type="button" onClick={() => navigate('/organizacion/estructura')}>
        Ir a Estructura
      </button>
    </div>
  )

  /* LA VISTA PREVIA NO ES OTRA PANTALLA: son las mismas tarjetas de los pasos con el
     formulario cerrado, y `TarjetaCampos` ya sabe leerse a sí misma. Lo que cambia es el
     envoltorio: una tapa de expediente y separadores de colores —ver `ExpedientePrevia`—,
     porque lo que se revisa antes de crear es el legajo de una persona. */
  const vistaPrevia = (
    <ExpedientePrevia
      form={form}
      set={set}
      ctx={ctx}
      nivel={nivel}
      avance={avance}
      progreso={progreso}
      falta={falta}
      irA={irA}
      completar={irAlCampo}
    />
  )

  const pie = (
    <div className="cn-pie">
      {/* EN EL PRIMER PASO NO HAY «VOLVER ATRÁS», porque no hay paso anterior. Llevaba a la lista
          de colaboradores, que es salir de la ficha y no volver a un paso: el botón prometía una
          cosa y hacía otra. Para salir están la miga de arriba y «Guardar borrador y salir». */}
      {indice > 0 && (
        <button className="pl-btn-cancel" onClick={() => irA(PASOS[indice - 1].key)}>
          <ArrowLeft size={14} /> Volver atrás
        </button>
      )}

      {/* EL DE EN MEDIO NO GUARDA: ya está guardado. Lo que ofrece es soltar la ficha a medias
          sin miedo, que es el gesto real de quien se quedó sin el papel que le faltaba.

          SE LLAMA «BORRADOR» PARA NO CONFUNDIRSE CON EL ALTA. Decía «Guardar y salir» y se leía
          como si guardar fuera crear a la persona; lo que queda es un borrador, y la palabra
          lo dice. «Y salir» porque además saca de la pantalla: un botón dice todo lo que hace. */}
      <button className="pl-btn-cancel" onClick={volverALista}>
        <LogOut size={14} /> Guardar borrador y salir
      </button>

      {/* «DAR DE ALTA» Y NO «CREAR COLABORADOR». A una persona no se la crea: se la da de alta,
          que es como lo dice RR.HH. —alta en la Gestora, en la Caja, en planilla—. Sin el nombre
          en el botón porque la tapa lo enseña en grande justo encima. */}
      {enPrevia ? (
        <button className="pl-btn-save" onClick={crear} title={falta?.que || undefined}>
          <UserPlus size={14} /> Dar de alta
        </button>
      ) : (
        <button className="pl-btn-save" onClick={() => irA(PASOS[indice + 1].key)}>
          {PASOS[indice + 1].key === PASO_PREVIA ? <Check size={14} /> : null}
          {PASOS[indice + 1].key === PASO_PREVIA ? 'Revisar la ficha' : 'Siguiente'}
          {PASOS[indice + 1].key === PASO_PREVIA ? null : <ArrowRight size={14} />}
        </button>
      )}
    </div>
  )

  return (
    <div className="content-scroll cn-pantalla" ref={raiz}>
      {avisoDeAlta}
      {confirmaAlta && !falta && (
        <ConfirmarAlta
          form={form}
          puesto={puestos.find(p => p.valor === form['3.11']) || null}
          onConfirmar={darDeAlta}
          onCancelar={() => setConfirmaAlta(false)}
        />
      )}
      {/* ── LA CABECERA ──
          UNA LÍNEA Y NADA MÁS. Acá hubo, por orden: un «← Colaboradores» con un <h1> debajo y
          un párrafo de veinticinco palabras; después una tarjeta de identidad con foto, nombre,
          paso y dos cuentas de campos; después un chip que prometía el autoguardado. Se fueron
          los tres, y cada uno por el mismo motivo: con la ficha recién abierta no decían nada
          que no estuviera ya en pantalla. El paso lo enseña el riel encendido y otra vez la
          cabecera del paso; las cuentas las enseña cada acordeón en su cabecera; la foto era un
          guión dentro de un círculo; y el chip anunciaba una promesa que nadie había puesto en
          duda.

          Y AHORA QUEDA SOLA EN LA FILA. Al lado vivía la franja del mínimo legal —«Faltan 26
          campos del mínimo legal · 7 de 221 cargados · Nivel Completo»—, retirada a pedido. Con
          ella se fue el envoltorio `cn-tope`, que existía para poner las dos cosas en una fila y
          con un solo hijo era lo mismo que no tenerlo. Si algún día vuelve una cuenta acá arriba,
          vuelve también ese envoltorio; mientras tanto la miga cuelga directa del scroll.

          LO QUE QUEDA ES LO ÚNICO QUE NO ESTABA EN NINGÚN OTRO LADO: de dónde venís y cómo
          volver. El resto de la pantalla es el formulario, que es a lo que se vino.

          EL <h1> ES EL ÚLTIMO TRAMO DE LA MIGA, que es lo que un último tramo siempre es: el
          título de la página. Tenerlo además en un encabezado suelto era tenerlo dos veces, y
          ése fue el argumento para elegir esta miga en primer lugar.

          EL <nav> ENVUELVE SÓLO LO QUE NAVEGA. El título no navega —es donde ya estás— así que
          queda fuera del landmark, y el `display: contents` del nav deja que su botón se acomode
          en la fila como si no hubiera envoltorio. Un <h1> dentro de una navegación se lee raro
          en un lector de pantalla y acá no hace falta.

          OJO AL EXTENDERLA: hay cuatro pantallas de detalle más —sucursal, nodo, asignación— que
          siguen con `det-back`. Mientras sean las únicas, ésta es la rara. Si la miga convence,
          va a las cinco; si no, ésta vuelve al botón. Lo que no conviene es dejarlo mitad y
          mitad por inercia. */}
      <div className="cn-miga">
        <nav aria-label="Dónde estás">
          {/* LA FLECHA VA DENTRO DEL PRIMER TRAMO, no suelta a la izquierda de la miga. En esta
              pantalla «volver» y «Colaboradores» son literalmente el mismo destino, así que dos
              botones pegados harían lo mismo y habría que adivinar cuál es cuál.

              Y LA MIGA SOLA NO SE VEÍA COMO UNA SALIDA: en gris apagado y a 12 px, «Colaboradores»
              se lee como un rótulo que dice dónde estás parado, no como algo que se pulsa. La
              flecha es lo que convierte la palabra en una puerta — y de paso agranda el blanco
              donde hay que acertar con el ratón, que en un tramo de miga es siempre demasiado
              chico. */}
          <button type="button" onClick={salirPorLaMiga}>
            <ArrowLeft size={13} aria-hidden="true" />
            Colaboradores
          </button>
        </nav>
        <span className="cn-miga-sep" aria-hidden="true">›</span>
        <h1 className="cn-miga-fin">Nuevo colaborador</h1>
      </div>

      {/* ── EL CUERPO ──
          Las tarjetas se escriben una sola vez y el riel las monta alrededor. Hubo un tiempo en
          que esto tenía una rama por cada eje de comparación —dos navegaciones, dos formas de
          leer los campos—; elegida la combinación, las ramas sobran. */}
      {(() => {
        const campos = enPrevia ? vistaPrevia : (
            /* ACORDEONES: el paso se lee primero como índice —qué secciones tiene y cuántos
               campos lleva cada una— y después como formulario. Cuesta un clic por sección; a
               cambio, un paso de cuarenta campos deja de ser una pared. */
            <div className="cn-acordeones">
              {avisoSinPuestos}
              {tarjetas.map(t => (
                <Acordeon
                  key={t.titulo}
                  titulo={t.titulo}
                  desc={t.desc}
                  abierto={abiertos.includes(t.titulo)}
                  onAlternar={() => alternar(t.titulo)}
                  llenos={llenosDe(t)}
                  total={t.id === 'at-modulo' ? null : escribibles(t).length}
                >
                  <TarjetaCampos
                    campos={t.id === 'reingreso' ? [] : t.campos}
                    children={t.id === 'reingreso'
                      ? <TarjetaReingreso form={form} set={set} gente={colaboradores} />
                      : t.id === 'at-modulo' ? <AsignacionAsistencia form={form} set={set} /> : null}
                    form={form}
                    set={set}
                    aplicar={aplicar}
                    editando
                    prefijo="cn"
                    marcarFaltas={false}
                    desnudo
                  />
                </Acordeon>
              ))}
              <p className="pl-leyenda"><b>*</b> Campo obligatorio para poder dar de alta</p>
            </div>
        )

        /* EL RIEL AL COSTADO tiene los nueve pasos siempre a la vista con su pista debajo, así
           que se sabe en todo momento dónde se está y qué falta por delante; a cambio, el
           formulario vive en una columna más angosta. Y como el riel no dice de qué va el paso
           abierto más allá de su nombre, la cabecera lo repite en grande con su pista. */
        return (
          <div className="cn-grid">
            <RielPasos
              pasos={itemsRiel}
              actual={enPrevia ? PASO_PREVIA : pestana?.key}
              onIr={irAPestana}
              avance={avancePestana}
              pendientes={pendientesPestana}
              partes={pestana?.partes.map(k => ({
                key: k,
                titulo: PASOS.find(x => x.key === k).titulo,
                on: k === paso,
                debe: pendientes.has(k),
                pct: avance[k]?.pct ?? 0,
                puestos: avance[k]?.puestos,
                total: avance[k]?.total,
              }))}
              onParte={irA}
              conPartes={new Set(PESTANAS.filter(t => t.partes.length > 1).map(t => t.key))}
            />

            <div className="cn-cuerpo">
              {/* La cabecera y el contenido llevan la clave de la parte: al cambiar, vuelven a entrar
                  con el fundido de `.cn-entra`. */}
              <div className="cn-paso-cab cn-entra" key={`cab-${paso}`}>
                {/* Con varias partes, el título es la parte con su número —1.1, 2.3— y debajo se nombra su pestaña. */}
                <h2>{pestana ? (pestana.partes.length > 1 ? `${pestana.n}.${pestana.partes.indexOf(paso) + 1} · ${pasoActual.titulo}` : `${pestana.n} · ${pestana.titulo}`) : pasoActual.titulo}</h2>
                <p>{pestana && pestana.partes.length > 1 ? `${pestana.titulo} · ${pasoActual.pista}` : pasoActual.pista}</p>
              </div>
              {/* LAS PARTES DE LA PESTAÑA EN EL CELULAR. En escritorio cuelgan del riel; en una
                  pantalla angosta el riel se acuesta y no hay dónde colgarlas, así que van acá
                  como píldoras: la activa en azul oscuro, cada una con su aro de avance y su
                  punto rojo si debe algo del mínimo legal. */}
              {pestana && pestana.partes.length > 1 && (
                <div className="cn-partes" role="tablist" aria-label={`Partes de ${pestana.titulo}`}>
                  {pestana.partes.map((k, j) => {
                    const parte = PASOS.find(x => x.key === k)
                    const a = avance[k]
                    const puesta = k === paso
                    return (
                      <button
                        key={k}
                        type="button"
                        role="tab"
                        aria-selected={puesta}
                        className={`cn-parte${puesta ? ' on' : ''}`}
                        onClick={() => irA(k)}
                        title={a ? `${a.puestos} de ${a.total} campos` : undefined}
                      >
                        <span className="rp-aro">
                          {a && <i className="rp-arco" style={{ '--pct': `${a.pct}%` }} />}
                          <b>{j + 1}</b>
                        </span>
                        <span className="cn-parte-nom">{parte.titulo}</span>
                        {pendientes.has(k) && <i className="rp-punto" aria-label="Falta un dato del mínimo legal" />}
                      </button>
                    )
                  })}
                </div>
              )}
              <div className="cn-entra" key={paso}>{campos}</div>
              {pie}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
