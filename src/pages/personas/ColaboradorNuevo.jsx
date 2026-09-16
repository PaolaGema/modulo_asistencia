import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, LogOut, UserPlus, Users } from 'lucide-react'
import { useOnboardingData } from '../../context/OnboardingDataContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { ocupanteDe, TIPOS_CARGO } from '../../data/organigramaData'
import { esVigente } from './colaboradoresData'
import {
  EN_BLANCO, NIVELES, PASOS, PASO_PREVIA, documentoDe, faltaLegal, faltaParaCrear,
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
    organigrama, setOrganigrama, sucursales, colaboradores, setColaboradores, empresa, empresasGrupo,
  } = useOnboardingData()
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

  /* LO QUE EL ESTUDIO NO PUEDE SABER: esta empresa.
     Los 249 campos vienen con catálogos de ejemplo para todo lo que sale de la estructura
     —sucursales, unidades, cargos, jefes—. Acá se reemplazan por los de verdad, los que el
     usuario cargó en Organización. Es la única parte del estudio que no se porta tal cual,
     porque no habla de la ley sino de esta empresa en particular.

     LOS PUESTOS OFRECIDOS SON LOS LIBRES. Los demás ya son de alguien, y ofrecerlos sería
     ofrecer sentar a dos personas en la misma silla. Cada opción viaja con lo que el puesto
     arrastra —área, sede, jefe— para poder enseñarlo sin recorrer el organigrama por campo. */
  const ctx = useMemo(() => {
    const cargos = organigrama?.cargos || []
    const unidadesOrg = organigrama?.unidades || []
    const nombreDeId = id => colaboradores.find(c => c.id === id)?.name || null

    const puestos = cargos.filter(c => ocupanteDe(c) == null).map(c => {
      const unidad = unidadesOrg.find(u => u.id === c.unidadId)
      const jefeCargo = cargos.find(x => x.id === c.reportaA)
      const jefeId = jefeCargo ? ocupanteDe(jefeCargo) : null
      const sedes = (c.sucursalIds || [])
        .map(id => sucursales.find(s => s.id === id)?.nombre)
        .filter(Boolean)

      return {
        valor: c.id,
        /* El área va en la etiqueta porque hay puestos que se llaman igual en dos áreas
           —«Analista», «Asistente»— y elegir uno a ciegas es elegir mal la mitad de las veces. */
        etiqueta: unidad ? `${c.nombre} · ${unidad.nombre}` : c.nombre,
        area: unidad?.nombre || '',
        /* Un puesto sin sede declarada no es un puesto sin sede: es uno que vale para toda la
           empresa. Son dos cosas distintas y el campo tiene que decir cuál. */
        sede: sedes.join(' · ') || 'Toda la empresa',
        jefe: jefeId
          ? nombreDeId(jefeId)
          : jefeCargo ? `${jefeCargo.nombre} · puesto vacante` : 'Nadie: es la punta del organigrama',
        clase: TIPOS_CARGO.find(t => t.key === (c.tipo || 'colaborador'))?.label || '',
      }
    })

    return {
      puestos,
      empresa,
      /* Las hermanas de esta empresa, para la pregunta de reingreso. Van enteras y no solo sus
         nombres: el campo enseña el corto, pero quien las consuma después necesita la razón
         social y el NIT. */
      grupo: empresasGrupo,
      unidades: unidadesOrg.map(u => u.nombre),
      sucursales: sucursales.map(s => s.nombre),
      /* SÓLO LOS VIGENTES. Esta lista alimenta todo campo que pide elegir a una persona —el
         jefe que aprueba, el garante, a quién avisar en una emergencia— y un desvinculado no
         puede ser ninguna de esas cosas. Sigue en el directorio porque es historia y porque
         hace falta para reconocer un reingreso, no para volver a asignarle nada. */
      personas: colaboradores.filter(esVigente).map(c => c.name).sort((a, b) => a.localeCompare(b)),
    }
  }, [organigrama, sucursales, colaboradores, empresa, empresasGrupo])

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
  const legalPendiente = useMemo(() => faltaLegal(form, ctx), [form, ctx])

  /* CUÁNTOS CAMPOS ESTÁ ESCONDIENDO EL NIVEL, que hasta ahora no lo decía nadie.
     El nivel saca campos de la pantalla en silencio: bajás a «Mínimo legal» y la tarjeta del
     nombre pasa de nueve campos a cuatro sin una palabra. Quien no sabe que el interruptor
     existe —o se olvidó de que lo tocó— no ve un filtro, ve campos que desaparecieron, y lo
     primero que piensa es que algo se rompió. Pasó en la primera demo.

     SE CUENTA CONTRA «COMPLETO» porque Mínimo ⊂ Operativo ⊂ Completo: lo escondido es siempre
     lo que hay de más en el nivel de arriba del todo. En Completo da cero y la frase no sale. */
  const ocultosPorNivel = useMemo(
    () => progresoDe(form, ctx, 'Completo').total - progreso.total,
    [form, ctx, progreso.total],
  )
  const nivelLabel = (NIVELES.find(n => n.key === nivel) || {}).label || nivel
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
     desde el organigrama. */
  const avisoSinPuestos = paso === 'puesto' && puestos.length === 0 && (
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
      {/* ── LA BARRA DE ARRIBA ──
          DOS COSAS EN UNA FILA: a la izquierda de dónde venís, a la derecha cuánto falta del
          mínimo legal. La miga ocupa doscientos píxeles y dejaba el resto en blanco; la cuenta
          lo ocupa sin pedir una fila propia.

          Acá estuvieron también los dos interruptores del prototipo, en una banda oscura. Se
          mudaron a la barra de la aplicación, que tenía 56 px de alto con el medio vacío: ahí
          no le cuestan un píxel al formulario, que es a lo que se entra a esta pantalla. */}
      <div className="cn-tope">
        {/* ── LA CABECERA ──
            UNA LÍNEA Y NADA MÁS. Acá hubo, por orden: un «← Colaboradores» con un <h1> debajo y
            un párrafo de veinticinco palabras; después una tarjeta de identidad con foto, nombre,
            paso y dos cuentas de campos; después un chip que prometía el autoguardado. Se fueron
            los tres, y cada uno por el mismo motivo: con la ficha recién abierta no decían nada
            que no estuviera ya en pantalla. El paso lo enseña el riel encendido y otra vez la
            cabecera del paso; las cuentas las enseña la franja; la foto era un guión dentro de un
            círculo; y el chip anunciaba una promesa que nadie había puesto en duda.

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

        {/* CUÁNTO FALTA DEL MÍNIMO LEGAL, siempre a la vista y contado sobre el mínimo aunque
            se esté mirando otro nivel: es lo que decide si a esta persona se la puede declarar
            ante el Ministerio, la Caja y la Gestora. No bloquea nada —muchos de esos datos
            llegan semanas después del alta— pero no se deja de decir.

            ESTA FRASE NO ES ANDAMIO, aunque compartió banda con él. Los dos interruptores del
            prototipo se mudaron a la barra de la aplicación y se van a borrar cuando el equipo
            elija; esto se queda, porque habla de la ficha y no de la comparación. Por eso dejó
            la banda oscura y se puso al lado de la miga, en el tono del resto de la pantalla. */}
        <p className="cn-cuenta">
          {legalPendiente.length
            ? `Faltan ${legalPendiente.length} campos del mínimo legal · ${progreso.puestos} de ${progreso.total} cargados`
            : `Mínimo legal completo · ${progreso.puestos} de ${progreso.total} campos cargados`}
          {/* «EN ESTE NIVEL» NO DECÍA CUÁL. La frase terminaba así y era exacta y perfectamente
              inútil: nombraba un filtro sin nombrarlo y sin decir qué se estaba llevando. Ahora
              dice las dos cosas, y la segunda sólo cuando hay algo que confesar. */}
          <span className="cn-nivel">
            {' · Nivel '}{nivelLabel}
            {ocultosPorNivel > 0 && `, ${ocultosPorNivel} campos ocultos`}
          </span>
        </p>
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
