import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, LogOut, UserPlus, Users } from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { useUser } from '../../context/UserContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { ocupanteDe, TIPOS_CARGO } from '../../data/organigramaData'
import { descendientes, filasEje, lineaDe } from '../../data/estructuraData'
import { esVigente } from './colaboradoresData'
import {
  EN_BLANCO, NIVELES, PASOS, PASO_PREVIA, documentoDe, faltaParaCrear,
  fechaCorta, inicialesDe, nombreDe, progresoDe, progresoPorPaso, tarjetasDe, tarjetasTodas,
} from '../../data/fichaColaborador'
import TarjetaCampos from '../../components/organizacion/TarjetaCampos'
import RielPasos from '../../components/personas/RielPasos'
import Acordeon from '../../components/personas/Acordeon'
import TarjetaReingreso from '../../components/personas/TarjetaReingreso'

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
  const { currentUser } = useUser()
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
     gana. Nada de lo que alguien escribió se pisa. */
  const form = useMemo(() => ({ ...EN_BLANCO, ...guardado }), [guardado])
  const [params, setParams] = useSearchParams()

  /* El paso sale de la dirección y se sanea: `?paso=cualquier-cosa` —escrito a mano o de un
     enlace viejo— abre el primero en vez de una pantalla en blanco. */
  const pedido = params.get('paso')
  const paso = PASOS.some(p => p.key === pedido) ? pedido : PASOS[0].key
  const indice = PASOS.findIndex(p => p.key === paso)

  /* TOCAR UN CAMPO ES CONFIRMARLO. Los datos que llegan de un reingreso —teléfono, domicilio,
     cuenta bancaria— vienen marcados porque pueden tener cuatro años, y la marca se levanta
     sola en cuanto alguien escribe encima. No hay un botón de «verificado»: un botón así se
     pulsa sin mirar, y escribir en el campo es la única prueba de que lo miraron de verdad.

     Se hace acá, en el único sitio por donde pasan todas las escrituras de la ficha, y no en
     cada campo: puesto en el campo habría que acordarse en los 254. */
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

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
      // Quién registra la ficha, para «Historial y auditoría».
      usuario: currentUser?.name || '',
    }
  }, [organigrama, nodos, sucursales, colaboradores, empresa, empresasGrupo, currentUser])

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
       hace pensar que no pasó nada. */
    window.scrollTo({ top: 0 })
  }

  const volverALista = () => navigate('/personas/colaboradores')

  /* CREAR ES DOS COSAS A LA VEZ y por eso vive en una sola función: la persona entra al
     directorio y, si eligió un puesto, se sienta en él. Hacer solo lo primero deja a alguien
     contratado que el organigrama no conoce, y es justo el estado que obliga a acordarse
     mañana de ir a ubicarlo. */
  function crear() {
    if (falta) { irA(falta.paso); return }

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
  const tarjetas = enPrevia ? [] : tarjetasDe(paso, form, ctx, nivel)
  const pasoActual = PASOS[indice]

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
        No hay puestos libres en la estructura. Podés crear igual al colaborador y ubicarlo
        después, o abrir un puesto en Organización.
      </span>
      <button type="button" onClick={() => navigate('/organizacion/estructura')}>
        Ir a Estructura
      </button>
    </div>
  )

  /* LA VISTA PREVIA NO ES OTRA PANTALLA: son las mismas tarjetas de los ocho pasos con el
     formulario cerrado. `TarjetaCampos` ya sabe leerse a sí misma —es lo que hace la ficha de
     una sucursal cuando no se está editando— así que acá no hay una segunda versión de nada que
     pueda quedar desfasada de la primera. Y es la misma en las tres propuestas: lo que se está
     comparando es cómo se RECORRE la ficha, no cómo se lee al final. */
  const vistaPrevia = (
    <div className="cn-previa">
      {falta && (
        <div className="cn-aviso">
          <AlertTriangle size={15} />
          <span>{falta.que}</span>
          <button type="button" onClick={() => irA(falta.paso)}>Ir a corregirlo</button>
        </div>
      )}

      {tarjetasTodas(form, ctx, nivel).map(({ paso: p, tarjetas: ts }) => (
        <section key={p.key} className="cn-bloque">
          <header className="cn-bloque-cab">
            <span className="cn-bloque-num">{p.n}</span>
            <h3>{p.titulo}</h3>
            <button type="button" onClick={() => irA(p.key)}>Editar</button>
          </header>
          {ts.map(t => (
            <TarjetaCampos
              key={t.titulo}
              titulo={t.titulo}
              campos={t.campos}
              form={form}
              set={set}
              editando={false}
              prefijo="cn"
            />
          ))}
        </section>
      ))}
    </div>
  )

  const pie = (
    <div className="cn-pie">
      <button
        className="pl-btn-cancel"
        onClick={() => (indice === 0 ? volverALista() : irA(PASOS[indice - 1].key))}
      >
        <ArrowLeft size={14} /> Volver atrás
      </button>

      {/* EL DE EN MEDIO NO GUARDA: ya está guardado. Lo que ofrece es soltar la ficha a medias
          sin miedo, que es el gesto real de quien se quedó sin el papel que le faltaba. */}
      <button className="pl-btn-cancel" onClick={volverALista}>
        <LogOut size={14} /> Guardar y salir
      </button>

      {enPrevia ? (
        <button className="pl-btn-save" onClick={crear} title={falta?.que || undefined}>
          <UserPlus size={14} /> Crear colaborador
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
    <div className="content-scroll">
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
          <button type="button" onClick={volverALista}>
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
                  total={escribibles(t).length}
                >
                  <TarjetaCampos
                    campos={t.id === 'reingreso' ? [] : t.campos}
                    children={t.id === 'reingreso'
                      ? <TarjetaReingreso form={form} set={set} gente={colaboradores} />
                      : null}
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
              <p className="pl-leyenda"><b>*</b> Campo obligatorio para poder crear la ficha</p>
            </div>
        )

        /* EL RIEL AL COSTADO tiene los nueve pasos siempre a la vista con su pista debajo, así
           que se sabe en todo momento dónde se está y qué falta por delante; a cambio, el
           formulario vive en una columna más angosta. Y como el riel no dice de qué va el paso
           abierto más allá de su nombre, la cabecera lo repite en grande con su pista. */
        return (
          <div className="cn-grid">
            <RielPasos
              pasos={PASOS}
              actual={paso}
              onIr={irA}
              avance={avance}
              pendientes={pendientes}
            />

            <div className="cn-cuerpo">
              <div className="cn-paso-cab">
                <h2>{pasoActual.n ? `${pasoActual.n} · ${pasoActual.titulo}` : pasoActual.titulo}</h2>
                <p>{pasoActual.pista}</p>
              </div>
              {campos}
              {pie}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
