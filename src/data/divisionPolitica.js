/* ── LA DIVISIÓN POLÍTICA DE BOLIVIA, HASTA LA PROVINCIA ──────────────────
   Nueve departamentos y sus ciento doce provincias. Existe para una sola cosa: que elegir el
   departamento deje en «Provincia» sólo las que pertenecen a él.

   EL DOLOR QUE ARREGLA ES TEXTUAL Y ESTÁ CITADO EN EL ESTUDIO — «la lista no se puede filtrar por
   departamento»—. Sin encadenar, quien carga una ficha de Cochabamba elige entre las ciento doce
   del país, y entre ellas hay nombres repetidos: «Cercado» es una provincia de Cochabamba, otra de
   Oruro, otra de Tarija y otra del Beni. Cuatro provincias distintas con el mismo nombre en una
   lista sin contexto: no es que cueste encontrar la buena, es que no hay manera de saber cuál es.

   SE GUARDA EL NOMBRE Y NO UN CÓDIGO, como el resto de las listas de esta ficha. Un código sería
   más robusto y obligaría a una tabla de traducción en cada sitio que lo lea —el directorio, una
   planilla, un informe— para volver a enseñar exactamente lo que el usuario eligió.

   HASTA LA PROVINCIA Y NO MÁS. Los trescientos cuarenta municipios son el siguiente escalón y no
   están acá: hacen falta de la fuente oficial, y una lista de municipios inventada de memoria es
   peor que una caja de texto, porque parece autoridad. «Municipio / Ciudad» sigue siendo texto
   libre hasta que llegue ese catálogo. */

export const PROVINCIAS = {
  'La Paz': [
    'Abel Iturralde', 'Aroma', 'Bautista Saavedra', 'Caranavi', 'Eliodoro Camacho',
    'Franz Tamayo', 'Gualberto Villarroel', 'Ingavi', 'Inquisivi', 'José Manuel Pando',
    'Larecaja', 'Loayza', 'Los Andes', 'Manco Kapac', 'Muñecas',
    'Murillo', 'Nor Yungas', 'Omasuyos', 'Pacajes', 'Sud Yungas',
  ],
  'Santa Cruz': [
    'Ángel Sandóval', 'Andrés Ibáñez', 'Chiquitos', 'Cordillera', 'Florida',
    'Germán Busch', 'Guarayos', 'Ichilo', 'Ignacio Warnes', 'José Miguel de Velasco',
    'Manuel María Caballero', 'Ñuflo de Chávez', 'Obispo Santistevan', 'Sara', 'Vallegrande',
  ],
  'Cochabamba': [
    'Arani', 'Arque', 'Ayopaya', 'Bolívar', 'Campero',
    'Capinota', 'Carrasco', 'Cercado', 'Chapare', 'Esteban Arze',
    'Germán Jordán', 'Mizque', 'Punata', 'Quillacollo', 'Tapacarí', 'Tiraque',
  ],
  'Potosí': [
    'Alonso de Ibáñez', 'Antonio Quijarro', 'Bernardino Bilbao', 'Charcas', 'Chayanta',
    'Cornelio Saavedra', 'Daniel Campos', 'Enrique Baldivieso', 'José María Linares', 'Modesto Omiste',
    'Nor Chichas', 'Nor Lípez', 'Rafael Bustillo', 'Sud Chichas', 'Sud Lípez', 'Tomás Frías',
  ],
  'Oruro': [
    'Carangas', 'Cercado', 'Eduardo Avaroa', 'Ladislao Cabrera', 'Litoral',
    'Mejillones', 'Nor Carangas', 'Pantaleón Dalence', 'Poopó', 'Sabaya',
    'Sajama', 'Saucarí', 'Sebastián Pagador', 'San Pedro de Totora', 'Sud Carangas', 'Tomás Barrón',
  ],
  'Chuquisaca': [
    'Belisario Boeto', 'Hernando Siles', 'Jaime Zudáñez', 'Juana Azurduy de Padilla', 'Luis Calvo',
    'Nor Cinti', 'Oropeza', 'Sud Cinti', 'Tomina', 'Yamparáez',
  ],
  'Beni': [
    'Cercado', 'Iténez', 'José Ballivián', 'Mamoré', 'Marbán', 'Moxos', 'Vaca Díez', 'Yacuma',
  ],
  'Tarija': [
    'Aniceto Arce', 'Avilés', 'Cercado', 'Gran Chaco', "Burdet O'Connor", 'Eustaquio Méndez',
  ],
  'Pando': [
    'Abuná', 'Federico Román', 'Madre de Dios', 'Manuripi', 'Nicolás Suárez',
  ],
}

/* Los nueve, en el orden en que ya estaban escritos en el campo del estudio. La lista de
   departamentos vive en `camposPropuesta` como opciones del campo 1.43 y ésta no la reemplaza:
   acá sólo se usa para comprobar que las dos dicen lo mismo. */
export const DEPARTAMENTOS = Object.keys(PROVINCIAS)

/* LAS PROVINCIAS DE UN DEPARTAMENTO, o nada. Devolver `null` y no una lista vacía es lo que le
   dice a la ficha «este campo todavía no es un desplegable»: sin departamento elegido no hay nada
   que ofrecer, y una lista vacía sería un desplegable que se abre y no tiene nada dentro. */
export const provinciasDe = departamento => PROVINCIAS[departamento] || null
