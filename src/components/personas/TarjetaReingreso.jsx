import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Check, RotateCcw, Search } from 'lucide-react'
import { esVigente, fotoDe } from '../../pages/personas/colaboradoresData'
import { borrarArchivo, copiarArchivo } from '../../utils/archivosLocales'
import { avatarUrl } from '../../utils/calendarEvents'

/* ── REINGRESO O ALTA NUEVA ───────────────────────────────────────────────
   La primera tarjeta de la ficha, y la única que no se dibuja sola con los descriptores del
   estudio. Las otras cuarenta y tres son campos sueltos que `TarjetaCampos` reparte en una
   rejilla; ésta es una CONVERSACIÓN —preguntar, buscar, comparar, elegir, traer— y una rejilla
   no sabe hacer eso.

   POR QUÉ NO ALCANZABA CON LOS CAMPOS. El estudio pide seis: si es reingreso, de qué empresa del
   grupo, quién, y tres de qué conservar. Dibujados como seis cajas, «Colaborador» era un texto
   libre donde había que escribir un nombre de memoria, y las tres últimas preguntaban qué
   conservar de alguien que todavía no se había elegido. El dato existía; la pregunta llegaba en
   el orden equivocado.

   SE BUSCA ENTRE TODOS Y NO SOLO ENTRE LOS DESVINCULADOS, que es lo que uno escribiría primero.
   Si el nombre o el carnet coinciden con alguien que trabaja acá HOY, eso no es un reingreso: es
   un duplicado de una persona en planilla, que es el peor de los dos errores y el que nadie está
   buscando. Se avisa y no se ofrece traer nada — no hay ficha que recuperar de alguien que no se
   fue.

   EL CARNET PESA MÁS QUE EL NOMBRE. Dos personas pueden llamarse María Fernanda Rojas; ninguna
   comparte documento. Por eso se busca por los dos y el hallazgo enseña siempre el carnet: es lo
   que permite decidir entre dos homónimos sin llamar a nadie por teléfono.

   LAS CLAVES SIGUEN SIENDO LAS DEL ESTUDIO —0.1 a 0.6— aunque el dibujo sea propio. Desde
   cualquiera de ellas se vuelve a la fila de la propuesta v1.2 que la justifica, igual que desde
   el resto de la ficha. La única que no es del estudio es `__reingresoDe`, que guarda de quién se
   trajo la ficha: lleva el doble guion bajo de las banderas internas del prototipo para que se
   note de un vistazo que no salió de la propuesta. */

const limpia = t => (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

/* LA LLAVE CON LA QUE SE COMPARAN DOS DOCUMENTOS. Se queda con lo que va antes del primer
   espacio —la extensión departamental de un carnet boliviano va detrás y no identifica a nadie,
   dos personas de Santa Cruz la comparten— y de ahí conserva letras y cifras en mayúscula.

   Así «7.733.410 SC», «7733410 sc» y «7733410» son la misma llave, y «AB123456» sigue siendo
   «AB123456» en vez de quedarse en «123456», que es lo que pasaba cuando esto sólo miraba
   dígitos y el documento venía de otro país. */
const clave = t => (t || '').trim().split(/\s/)[0].toUpperCase().replace(/[^0-9A-Z]/g, '')

/* ── QUÉ SE TRAE DE UN REGISTRO ANTERIOR, EN TRES GRUPOS ──────────────────
   TRAER UN DATO VIEJO PUEDE SER PEOR QUE NO TRAERLO. Un teléfono de hace cuatro años que
   aparece ya escrito no lo verifica nadie: se ve lleno, se da por bueno, y la persona queda
   inubicable el día que haya que llamarla. Así que no alcanza con decidir QUÉ se copia — hay
   que decidir además QUÉ SE COPIA CALLADO y qué se copia pidiendo que lo miren.

   El corte no es por paso de la ficha sino por CUÁNTO DURA EL DATO. */

/* 1 · LO QUE NO CAMBIA NUNCA. Cómo se llama, con qué documento se lo identifica, cuándo y
   dónde nació. Y los números de por vida, que son los que más valen: el NUA de la Gestora, el
   número de asegurado de la Caja y el código RC-IVA no se vuelven a emitir — si no los tenés,
   hay que ir a buscarlos a otra oficina. Traerlos es la mitad del valor de todo esto. */
const TRAE_SIEMPRE = [
  '1.1', '1.2', '1.3', '1.4', '1.5', '1.6',                    // nombre, en sus cinco partes
  '1.10', '1.10b', '1.11', '1.12', '1.13', '1.14',             // documento de identidad
  '1.21', '1.22', '1.23', '1.24', '1.25', '1.26',              // nacimiento y nacionalidad
  '3.45', '3.51', '3.57',                                      // NUA · asegurado en la Caja · RC-IVA
]

/* 2 · LO QUE SUELE HABER CAMBIADO. Llega escrito para no tipear de nuevo, pero marcado: en
   cuatro años una persona se mudó, cambió de número, se casó o tuvo un hijo. La marca vive
   hasta que alguien toca el campo — tocarlo ES confirmarlo, así que no hace falta un botón
   aparte de «verificado» que nadie va a pulsar.

   La cuenta bancaria entra acá y no en el grupo 1 a propósito: es el dato que más caro sale
   equivocado, porque el error no se nota hasta que un sueldo se va a la cuenta de otra
   persona. */
const TRAE_A_CONFIRMAR = [
  '1.29', '1.32', '1.33',                                      // estado civil, profesión, matrícula
  '1.36', '1.38', '1.39',                                      // celular, teléfono fijo, correo personal
  '1.42', '1.43', '1.45', '1.46', '1.47', '1.48', '1.50',      // domicilio
  '2.1', '2.2', '2.3', '2.4', '2.5', '2.6',                    // a quién avisar en una emergencia
  '3.89', '3.90', '3.90o', '3.91', '3.93',                     // banco y cuenta
]

/* 2b · LOS ARCHIVOS, QUE SÓLO VIENEN SI LOS PIDEN. Los otros dos grupos se copian siempre; éste
   cuelga de «¿Copiar documentos digitales?», que es una pregunta que la tarjeta ya hacía y cuya
   respuesta no leía nadie: se contestaba que sí y no pasaba nada. Volver a subir el carnet
   escaneado de alguien que ya lo había subido es la clase de trabajo que este flujo existe para
   ahorrar.

   NO SE COPIA LA REFERENCIA SINO EL ARCHIVO. Dos fichas apuntando al mismo contenido comparten
   destino: reemplazar la foto en la nueva borraría la de la vieja. `copiarArchivo` lo duplica
   bajo una clave propia.

   Y CASI TODOS LLEGAN MARCADOS, por lo mismo que el domicilio o el teléfono: en cuatro años una
   cara cambia y un carnet se renueva —con otra fecha de vencimiento, que es justo el dato que la
   ficha vigila—. El certificado de nacimiento es la excepción y no por descuido: dice dónde y
   cuándo nació alguien, y eso no se renueva nunca. */
const TRAE_ARCHIVOS = [
  { k: '1.9',   confirmar: true,  nombre: 'su fotografía' },
  { k: '1.17',  confirmar: true,  nombre: 'el documento escaneado' },
  { k: '1.20h', confirmar: true,  nombre: 'el documento secundario' },
  { k: '1.53',  confirmar: true,  nombre: 'el croquis' },
  { k: '1.21b', confirmar: false, nombre: 'el certificado de nacimiento' },
]

/* ── LA FOTO DEL DIRECTORIO TAMBIÉN ES UN DOCUMENTO SUYO ──────────────────
   La tarjeta decía «No dejó ninguno subido» tres centímetros debajo de la cara de la persona,
   que estaba ahí mismo, en el recuadro del registro recién traído. Las dos cosas eran ciertas
   por separado y juntas se leen como un error: la frase miraba sólo `ficha['1.9']` y el retrato
   sale de `foto`, que es el campo del DIRECTORIO.

   NO ES UNA RAREZA DE LOS DATOS DE PRUEBA, es dónde vive hoy el retrato: el propio archivo del
   directorio lo dice —«cuando SoulyHR aloje las fotos de verdad, esto pasa a ser la ruta del
   archivo subido»—. Mientras tanto, quien reingresa tiene su foto en un sitio y su ficha en
   otro, y para quien mira la pantalla es la misma foto.

   SE GUARDA LA DIRECCIÓN Y NO UNA COPIA, y esto se probó al revés primero. Descargar el retrato
   para volver a guardarlo bajo clave propia sería lo coherente con los otros cuatro archivos, y
   no se puede: el servidor que aloja las fotos no autoriza leerlas desde otro origen, así que
   `fetch` devuelve un error de red aunque un `<img>` dibuje esa misma imagen sin protestar. Es
   CORS y no hay vuelta desde el navegador.

   ASÍ QUE LA FICHA GUARDA DE DÓNDE SALE. `SubirArchivo` acepta `url` cuando no hay copia local,
   y el recuadro la dibuja igual. Se pierde una cosa y conviene tenerla escrita: esta foto no es
   independiente del registro viejo —si allá cambia la dirección, acá deja de verse—, mientras
   que los otros cuatro archivos sí se duplican de verdad. El día que las fotos se alojen en
   SoulyHR esto pasa a ser una copia como las demás y el resto del código no se entera. */
const retratoDelDirectorio = persona => {
  const url = fotoDe(persona)
  return url
    ? { url, nombre: 'Fotografía de su registro anterior', tipo: 'image/jpeg', origen: 'Traída de su registro anterior' }
    : null
}

/* QUÉ ARCHIVOS TIENE ESTE REGISTRO PARA DAR. Una sola cuenta, porque son dos cosas que no
   pueden discrepar: la frase que los ofrece y el efecto que los copia. Si la ficha ya trae una
   fotografía subida manda ésa; el retrato del directorio es el respaldo, no un sexto archivo. */
const archivosDe = persona => {
  const ficha = persona?.ficha || {}
  const guardados = TRAE_ARCHIVOS.filter(a => ficha[a.k]?.clave)
  if (ficha['1.9']?.clave || !persona?.foto) return guardados
  return [{ k: '1.9', confirmar: true, nombre: 'su fotografía', delDirectorio: true }, ...guardados]
}

/* ── DECIR QUÉ SE ESTÁ OFRECIENDO, QUE ES LO QUE FALTABA ──────────────────
   La pregunta de abajo pedía decidir a ciegas: «¿sus documentos?» sin decir si hay alguno. Quien
   contesta no conoce a esta persona —por eso está buscándola en un directorio—, así que la
   respuesta tiene que venir con lo que se ofrece a la vista.

   ERAN TRES PREGUNTAS y quedó una. «Los mismos permisos que tenía» y «su antigüedad anterior» se
   quitaron a pedido del equipo el 29 sep 2026: solo guardaban la respuesta, sin copiar nada. */

/* 3 · LO QUE NO SE TRAE, y no hace falta escribirlo: es todo lo demás. Puesto, área, sede,
   jefe, tipo de contrato, fechas, haber, horario, accesos. Empieza de cero porque es del
   VÍNCULO NUEVO, y eso es exactamente lo que hace que esto sea un alta y no una reactivación:
   quien vuelve firma otro contrato, no retoma el anterior. */

export default function TarjetaReingreso({ form, set, gente = [] }) {
  const [q, setQ] = useState('')
  /* Los descartados viven en el componente y no en la ficha: son «este no es» dichos mientras se
     busca, no una decisión que valga la pena guardar. Al recargar se vuelven a ofrecer, que es lo
     correcto — quizá el que descartó fue un error. */
  const [descartados, setDescartados] = useState([])

  const esReingreso = form['0.1'] === 'si'
  const traidoId = form['__reingresoDe'] || null
  const traido = useMemo(() => gente.find(p => p.id === traidoId) || null, [gente, traidoId])

  /* Cuántos campos llegaron y cuántos quedan por mirar. El segundo baja solo a medida que
     alguien los va tocando, porque tocar un campo es confirmarlo. */
  const copiados = useMemo(() => {
    const ficha = traido?.ficha || {}
    return [...TRAE_SIEMPRE, ...TRAE_A_CONFIRMAR].filter(k => ficha[k]).length
  }, [traido])

  const hallazgos = useMemo(() => {
    const t = limpia(q)
    if (t.length < 3) return []
    const buscado = clave(t)
    return gente.filter(p => {
      if (descartados.includes(p.id)) return false
      /* El documento se compara sin puntos, guiones ni extensión: se escribe de cinco maneras y
         todas quieren decir lo mismo.

         Y NO SÓLO CIFRAS. Antes se quitaba todo lo que no fuera dígito, que funciona con un
         carnet boliviano y borra medio pasaporte: «AB123456» quedaba en «123456» y podía
         encontrar a quien no era. Ahora se conservan letras y cifras. */
      const doc = clave(p.documento)

      /* QUIEN TRABAJA ACÁ SOLO APARECE SI EL CARNET COINCIDE ENTERO. Antes salía también por
         nombre, y eso llenaba la lista de ruido: buscando «Rojas» aparecían tres personas de las
         que dos siguen en planilla y no tienen nada que ver con el reingreso. Un apellido
         compartido es cosa de todos los días; un documento compartido no existe.

         Así que el aviso se guarda para el único caso en que de verdad importa —estás por crear
         una ficha nueva a alguien que ya está trabajando acá, con su mismo documento— y deja de
         aparecer por cada homónimo. */
      if (esVigente(p)) return Boolean(buscado.length >= 6 && doc && doc === buscado)

      if (buscado.length >= 5 && doc.includes(buscado)) return true
      return limpia(p.name).includes(t)
    }).slice(0, 6)
  }, [q, gente, descartados])

  /* ── LOS DOCUMENTOS DIGITALES LLEGAN CUANDO LOS PIDEN, NO AL ELEGIR A LA PERSONA ──
     «¿Copiar documentos digitales?» se pregunta debajo de la ficha que se acaba de traer —antes
     no tendría sujeto— así que cuando `traer` corre, esa respuesta todavía no existe. Por eso esto
     vive en un efecto y no ahí dentro: lo que lo dispara es la respuesta, no la elección.

     ERA UNA PREGUNTA SIN CONSECUENCIA. Se contestaba que sí y no pasaba nada — ni ésta ni las
     otras dos del grupo se leían en ninguna parte. Volver a subir el carnet escaneado de alguien
     que ya lo había subido es exactamente el trabajo que este flujo existe para ahorrar.

     Y SE DESHACE. Contestar que no después de haber dicho que sí devuelve los campos a vacío y
     borra las copias: un archivo que ya nadie enseña pero sigue ocupando sitio es basura que
     nadie va a ir a buscar. */
  /* QUÉ PUEDE OFRECER DE VERDAD ESTE REGISTRO. Se calcula del propio registro y no se supone:
     una pregunta que ofrece algo que no existe es peor que no preguntar, porque quien contesta
     que sí se queda esperando algo que nunca llega. */
  const ofrece = useMemo(() => {
    const archivos = archivosDe(traido)
    return {
      archivos: archivos.length
        ? `${archivos.length} ${archivos.length === 1 ? 'archivo' : 'archivos'}: ${archivos.map(a => a.nombre).join(', ')}`
        : null,
    }
  }, [traido])

  const copiasArchivo = useRef([])
  useEffect(() => {
    let vivo = true
    const ficha = traido?.ficha || {}

    if (form['0.4'] === 'si' && traido && !copiasArchivo.current.length) {
      Promise.all(archivosDe(traido).map(async ({ k, confirmar, delDirectorio }) => {
        /* EL RETRATO NO SE COPIA, SE APUNTA. No hay binario que duplicar: lo que la ficha se
           lleva es la dirección de la foto del directorio, así que entra sin clave y sin pasar
           por IndexedDB. Los otros cuatro sí existen ahí y se duplican de verdad. */
        if (delDirectorio) {
          const retrato = retratoDelDirectorio(traido)
          if (!retrato || !vivo) return null
          set(k, retrato)
          copiasArchivo.current.push({ k, clave: null })
          return confirmar ? k : null
        }
        const guardado = ficha[k]
        if (!guardado?.clave) return null
        const clave = await copiarArchivo(guardado.clave)
        if (!clave || !vivo) return null
        set(k, { ...guardado, clave })
        copiasArchivo.current.push({ k, clave })
        return confirmar ? k : null
      })).then(nuevos => {
        if (!vivo) return
        const suman = nuevos.filter(Boolean)
        if (suman.length) return
      })
    }

    if (form['0.4'] === 'no' && copiasArchivo.current.length) {
      /* Sin clave no hay nada que borrar: el retrato heredado es una dirección, no una copia. */
      for (const { k, clave } of copiasArchivo.current) { set(k, null); if (clave) borrarArchivo(clave) }
      copiasArchivo.current = []
    }

    return () => { vivo = false }
  }, [form['0.4'], traido])   // eslint-disable-line react-hooks/exhaustive-deps

  const responder = valor => {
    set('0.1', valor)
    if (valor !== 'si') soltar()
  }

  function soltar() {
    set('__reingresoDe', '')
    set('0.2', '')
    set('0.3', '')
    /* Los archivos copiados tampoco se borran, por lo mismo; lo que se suelta es la cuenta de
       cuáles eran nuestros. Si vuelven a elegir a alguien y piden sus documentos, se traen los de
       la ficha nueva encima — que es lo que se acaba de pedir. */
    copiasArchivo.current = []
    setDescartados([])
    setQ('')
  }

  function traer(p) {
    set('__reingresoDe', p.id)
    set('0.2', p.empresaGrupo || '')
    set('0.3', p.name)

    /* Lo que la persona había declarado la vez anterior. Un registro sembrado puede no tener
       ficha —los de ejemplo llegaron antes de que esta pantalla existiera— y entonces se trae lo
       que haya, que es el nombre y el carnet de la fila del directorio. */
    const ficha = p.ficha || {}
    const marcados = []

    for (const k of TRAE_SIEMPRE) if (ficha[k]) set(k, ficha[k])
    for (const k of TRAE_A_CONFIRMAR) if (ficha[k]) { set(k, ficha[k]); marcados.push(k) }

    /* SE TRAE TODO IGUAL, PERO YA NADIE LO MARCA. Los dos grupos existían porque uno llegaba
       limpio y el otro con un chip de «a confirmar» al lado; retirado el chip, lo que los separa
       es sólo el comentario que explica por qué unos datos envejecen y otros no. Se conservan
       así, en dos listas, porque el día que se quiera volver a avisar ya están separados. */
  }

  return (
    <div className="rg">
      {/* LA PREGUNTA DICE «SU EMPRESA O INSTITUCIÓN» Y NO «AQUÍ». Era «¿Ya trabajó antes aquí
          este colaborador?», y «aquí» sólo se entiende si uno ya sabe dónde está parado: en una
          pantalla que se abre desde cinco lugares distintos, el adverbio no señala nada. Nombrar
          la organización deja el alcance dicho —y «o institución» porque no todas las que usan
          esto son empresas—. Es larga a propósito: se hace una sola vez, es la primera decisión
          de la ficha y de ella cuelga todo lo demás, así que se prefiere que no quede duda antes
          que ahorrar cuatro palabras. La caja apila el rótulo sobre los botones, así que crecer
          no desarma nada. */}
      <div className="rg-pregunta">
        <span>¿Es un colaborador que ya ha trabajado previamente en su empresa o institución?</span>
        <div className="rg-sino" role="group" aria-label="¿Ya ha trabajado previamente en su empresa o institución?">
          {[['si', 'Sí'], ['no', 'No']].map(([v, t]) => (
            <button
              key={v}
              type="button"
              className={`rg-op${form['0.1'] === v ? ' on' : ''}`}
              aria-pressed={form['0.1'] === v}
              onClick={() => responder(v)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {esReingreso && !traido && (
        <>
          <label className="rg-buscar">
            <span className="pl-label">Buscar por nombre, apellido o número de documento de identidad</span>
            <span className="rg-caja">
              <Search size={15} />
              <input
                type="text"
                value={q}
                autoComplete="off"
                placeholder="Rojas, Mamani, 8452119…"
                onChange={e => setQ(e.target.value)}
              />
            </span>
          </label>

          {q.trim().length > 0 && q.trim().length < 3 && (
            <p className="rg-pista">Escriba al menos tres letras.</p>
          )}

          {q.trim().length >= 3 && hallazgos.length === 0 && (
            <p className="rg-pista">
              Nadie coincide con «{q.trim()}». Si es la primera vez que entra, la ficha se llena de cero.
            </p>
          )}

          {hallazgos.length > 0 && (
            <ul className="rg-lista">
              {hallazgos.map(p => (
                <li key={p.id}>
                  <Hallazgo
                    persona={p}
                    onTraer={() => traer(p)}
                    onDescartar={() => setDescartados(d => [...d, p.id])}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {esReingreso && traido && (
        /* ── LO QUE SE TRAJO ──
           UNA TARJETA DE PERSONA Y NO UNA LÍNEA DE CONFIRMACIÓN. Acá decía «✓ Ficha de María
           Fernanda Rojas Vargas traída» y nada más, y eso deja a quien llena sin la única
           pregunta que de verdad se hace después de elegir: ¿es ésta? Con la cara, el carnet y
           las fechas delante, equivocarse de persona se nota antes de seguir escribiendo — y
           con dos Rojas en el sistema, equivocarse es perfectamente posible.

           LOS DATOS QUE MUESTRA SON LOS DEL VÍNCULO ANTERIOR, no los de la ficha nueva: último
           puesto, empresa del grupo, entre qué fechas trabajó y por qué salió. Nada de eso se
           copia al alta —el puesto y el sueldo empiezan de cero— pero es lo que permite
           reconocerla. */
        <div className="rg-traido">
          <div className="rg-persona">
            {/* LA CARA SALE DE SU FICHA, NO DE SU NOMBRE. Acá se deducía del nombre, y el propio
                `colaboradoresData` ya avisaba de que eso sale mal —«ninguna se deduce del nombre»—:
                salía mal, y de la peor manera. La misma persona tenía dos caras según la pantalla
                —una en el directorio, otra acá— y a María Fernanda le tocaba una de hombre.

                El reingreso trata justamente de reconocer a alguien que ya estuvo. Enseñarle una
                cara que no es la que su ficha tiene guardada sabotea lo único que esta tarjeta
                viene a hacer. El repuesto por nombre queda sólo para un registro sin foto, que es
                el único caso en que no hay nada mejor. */}
            <img className="rg-foto" src={fotoDe(traido) || avatarUrl(traido.name, 96)} alt="" />

            <div className="rg-persona-datos">
              <p className="rg-persona-nom">{traido.name}</p>
              {traido.documento && <p className="rg-persona-doc">{traido.documento}</p>}

              <dl className="rg-detalles">
                {[
                  ['Último puesto', traido.cargo],
                  ['Empresa', traido.empresaGrupo],
                  ['Trabajó', traido.salida ? traido.ingreso + ' — ' + traido.salida : traido.ingreso],
                  ['Salió por', traido.motivoSalida],
                ].filter(([, v]) => v).map(([rotulo, valor]) => (
                  <div key={rotulo}>
                    <dt>{rotulo}</dt>
                    <dd>{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <button type="button" className="rg-btn rg-quitar" onClick={soltar}>
              <RotateCcw size={13} /> No era ésta
            </button>
          </div>

          {/* Qué se copió ya, dicho sin que haya que ir a buscarlo campo por campo. */}
          {/* CUÁNTO SE AHORRÓ Y CUÁNTO HAY QUE MIRAR, en una línea. Sin el segundo número, los
              campos marcados aparecen ocho pasos más adelante sin que nadie sepa por qué. */}
          <p className="rg-copiado">
            <Check size={13} />
            Se copiaron {copiados} datos suyos a esta ficha.
          </p>

          {/* LA PREGUNTA LLEGA ACÁ Y NO ANTES. Preguntar por los documentos de alguien a quien
              todavía no elegiste es preguntar por nadie. Ahora tiene sujeto, y por eso el rótulo
              puede decir «sus» en vez de repetir el nombre. */}
          <p className="rg-sub">¿Qué más traemos de su registro anterior?</p>

          {[
            ['0.4', 'Sus documentos digitales', ofrece.archivos, 'No dejó ninguno subido'],
          ].map(([clave, texto, detalle, sinDatos]) => (
            <div key={clave} className={`rg-pregunta rg-pregunta-fina${detalle ? '' : ' rg-pregunta-vacia'}`}>
              {/* EL RÓTULO DICE QUÉ SE DECIDE Y LA LÍNEA DE ABAJO QUÉ SE LLEVA. Sin la segunda,
                  las tres se contestaban a ciegas: nadie sabe qué permisos tenía alguien a quien
                  acaba de encontrar buscándolo en un directorio. */}
              <span>
                {texto}
                <small>{detalle || sinDatos}</small>
              </span>
              {/* NO SE OFRECE LO QUE NO HAY. Sin nada que traer, la pregunta se queda a la vista
                  —para que se entienda que existe y por qué no aplica— pero no se puede contestar
                  que sí a un vacío. */}
              <div className="rg-sino" role="group" aria-label={texto} aria-disabled={!detalle}>
                {[['si', 'Sí'], ['no', 'No']].map(([v, t]) => (
                  <button
                    key={v}
                    type="button"
                    className={`rg-op${form[clave] === v ? ' on' : ''}`}
                    aria-pressed={form[clave] === v}
                    disabled={!detalle && v === 'si'}
                    onClick={() => set(clave, v)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* Un resultado de la búsqueda. Enseña lo mismo para los dos casos —quién, con qué carnet, en qué
   puesto y entre qué fechas— y cambia lo que OFRECE, que es lo único que de verdad difiere. */
function Hallazgo({ persona, onTraer, onDescartar }) {
  const vigente = esVigente(persona)

  return (
    <div className={`rg-hall${vigente ? ' rg-hall-alerta' : ''}`}>
      <span className="rg-ini" aria-hidden="true">
        {vigente ? <AlertTriangle size={15} /> : persona.initials}
      </span>

      <div className="rg-hall-cuerpo">
        <span className="rg-hall-et">
          {vigente ? 'Esta persona trabaja acá ahora mismo' : 'Esta persona ya trabajó acá'}
        </span>
        <span className="rg-hall-nom">{persona.name}</span>
        <span className="rg-hall-det">
          {[
            persona.documento,
            persona.cargo,
            persona.empresaGrupo,
            persona.salida ? `${persona.ingreso} — ${persona.salida}` : `desde ${persona.ingreso}`,
            persona.motivoSalida,
          ].filter(Boolean).join(' · ')}
        </span>

        {vigente ? (
          /* NO SE OFRECE TRAER NADA. No hay ficha anterior que recuperar: la persona no se fue.
             Si de verdad son dos personas distintas con el mismo apellido, se descarta y se
             sigue; si es la misma, lo que hay que hacer es abrir su ficha, no crear otra. */
          <p className="rg-hall-aviso">
            No es un reingreso. Si es la misma persona, no hay que crear una ficha nueva: ya tiene una.
          </p>
        ) : null}

        <div className="rg-acc">
          {!vigente && (
            <button type="button" className="rg-btn rg-btn-pri" onClick={onTraer}>
              Traer sus datos
            </button>
          )}
          <button type="button" className="rg-btn" onClick={onDescartar}>
            No es la misma persona
          </button>
        </div>
      </div>
    </div>
  )
}
