import { useMemo, useState } from 'react'
import { AlertTriangle, Check, RotateCcw, Search } from 'lucide-react'
import { esVigente } from '../../pages/personas/colaboradoresData'
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
  '1.10', '1.11', '1.12', '1.13', '1.14',                      // documento de identidad
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
  '3.89', '3.90', '3.91', '3.93',                              // banco y cuenta
]

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
  const porConfirmar = (form['__porConfirmar'] || []).length
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

  const responder = valor => {
    set('0.1', valor)
    if (valor !== 'si') soltar()
  }

  function soltar() {
    set('__reingresoDe', '')
    set('0.2', '')
    set('0.3', '')
    /* No se borra lo copiado —quizá era la persona correcta y se soltó por error— pero sí la
       marca de revisar: sin dueño, un «a confirmar» no dice de qué ficha vino. */
    set('__porConfirmar', [])
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

    /* La lista de lo que hay que mirar viaja en la ficha y no en este componente: los campos
       marcados están en los ocho pasos y este componente vive sólo en el primero. */
    set('__porConfirmar', marcados)
  }

  return (
    <div className="rg">
      <div className="rg-pregunta">
        <span>¿Ya trabajó antes aquí este colaborador?</span>
        <div className="rg-sino" role="group" aria-label="¿Ya trabajó antes aquí?">
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
            <span className="pl-label">Buscar por nombre, apellido o carnet</span>
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
            <p className="rg-pista">Escribí al menos tres letras.</p>
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
            <img className="rg-foto" src={avatarUrl(traido.name, 96)} alt="" />

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
            {porConfirmar > 0 && (
              <span className="rg-revisar">{porConfirmar} hay que confirmar</span>
            )}
          </p>

          {/* LAS TRES PREGUNTAS LLEGAN ACÁ Y NO ANTES. Preguntar si conservar la antigüedad de
              alguien a quien todavía no elegiste es preguntar por nadie. Ahora tienen sujeto, y
              por eso los rótulos pueden decir «sus» y «su» en vez de repetir el nombre. */}
          <p className="rg-sub">¿Qué más traemos de su registro anterior?</p>

          {[['0.4', 'Sus documentos digitales'], ['0.5', 'Los mismos permisos que tenía'], ['0.6', 'Su antigüedad anterior']].map(([clave, texto]) => (
            <div key={clave} className="rg-pregunta rg-pregunta-fina">
              <span>{texto}</span>
              <div className="rg-sino" role="group" aria-label={texto}>
                {[['si', 'Sí'], ['no', 'No']].map(([v, t]) => (
                  <button
                    key={v}
                    type="button"
                    className={`rg-op${form[clave] === v ? ' on' : ''}`}
                    aria-pressed={form[clave] === v}
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
