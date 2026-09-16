/* ── CÓMO SE DIVIDE CADA PAÍS, Y POR QUÉ ESO ES UN PROBLEMA DE PRODUCTO ───
   La ficha pedía «Departamento», «Provincia» y «Municipio / Ciudad» a todo el mundo, y ofrecía
   los nueve departamentos de Bolivia sin mirar en qué país vive la persona. Elegir «Argentina»
   en el país de residencia te seguía pidiendo un departamento boliviano, con su chip LEGAL al
   lado. No era un riesgo futuro: pasaba, y la ficha ya ofrece trece países.

   NO CAMBIAN SÓLO LOS NOMBRES, CAMBIA LA PROFUNDIDAD. Bolivia tiene tres escalones bajo el país
   —departamento, provincia, municipio— y Colombia dos. Y el mismo nombre ocupa distinto lugar
   según dónde: «Provincia» es el escalón de en medio en Bolivia y el PRIMERO en Argentina y
   Ecuador. Por eso no alcanza con una etiqueta de barras —«Provincia / Estado / Región»— que
   deja al usuario adivinar cuál le toca.

   TRES RANURAS FIJAS, ETIQUETA VARIABLE. Las claves del estudio no se mueven: 1.43 es siempre la
   subdivisión mayor, 1.44 la menor y 1.45 la localidad, vivas donde vivan. Lo que cambia es cómo
   se llaman en pantalla y qué lista ofrecen. Así un informe que cruce colaboradores de tres
   países sigue comparando lo comparable, que es lo único que un código de campo tiene que
   garantizar.

   Y DONDE NO HAY ESCALÓN DE EN MEDIO, EL CAMPO NO SE ENSEÑA. `menor: null` lo dice, y la ficha lo
   esconde con el mismo mecanismo que ya usa para la extensión y el complemento SEGIP: preguntar
   por una provincia colombiana es pedir algo que no existe.

   LOS CATÁLOGOS SON OTRA COSA. Acá sólo están los NOMBRES de los escalones, que se pueden
   escribir con seguridad. Las listas de estados mexicanos, comunas chilenas o condados
   estadounidenses hacen falta de fuente oficial, y una lista inventada de memoria es peor que
   una caja de texto porque parece autoridad. Hasta que lleguen, fuera de Bolivia estos campos
   son texto libre — pero ya con el nombre correcto y en el escalón correcto. */

const GENERICO = { mayor: 'Región o estado', menor: null, local: 'Ciudad' }

export const NIVELES_PAIS = {
  Bolivia:     { mayor: 'Departamento',        menor: 'Provincia',             local: 'Municipio / Ciudad' },
  Argentina:   { mayor: 'Provincia',           menor: 'Departamento / Partido', local: 'Localidad' },
  Brasil:      { mayor: 'Estado',              menor: null,                    local: 'Municipio' },
  Chile:       { mayor: 'Región',              menor: 'Provincia',             local: 'Comuna' },
  Colombia:    { mayor: 'Departamento',        menor: null,                    local: 'Municipio' },
  Ecuador:     { mayor: 'Provincia',           menor: 'Cantón',                local: 'Parroquia' },
  'Perú':      { mayor: 'Departamento',        menor: 'Provincia',             local: 'Distrito' },
  Paraguay:    { mayor: 'Departamento',        menor: null,                    local: 'Distrito' },
  Uruguay:     { mayor: 'Departamento',        menor: null,                    local: 'Municipio' },
  Venezuela:   { mayor: 'Estado',              menor: 'Municipio',             local: 'Parroquia' },
  'España':    { mayor: 'Comunidad autónoma',  menor: 'Provincia',             local: 'Municipio' },
  'EE.UU.':    { mayor: 'Estado',              menor: 'Condado',               local: 'Ciudad' },
}

/* SIN PAÍS ELEGIDO SE DEVUELVE EL GENÉRICO Y NO NADA. La tarjeta tiene que poder dibujarse desde
   el primer render, antes de que nadie conteste: un rótulo vacío es una pantalla rota, y «Región
   o estado» es verdad en cualquier sitio mientras no se sepa dónde. */
export const nivelesDe = pais => NIVELES_PAIS[pais] || GENERICO

/* Sólo Bolivia trae catálogo por ahora —los departamentos en el propio campo del estudio, las
   provincias en `divisionPolitica`—. Preguntarlo así y no por el nombre del país deja el sitio
   preparado: el día que entre el catálogo de Chile, esto devuelve true para Chile y nada más
   cambia. */
export const tieneCatalogo = pais => pais === 'Bolivia'
