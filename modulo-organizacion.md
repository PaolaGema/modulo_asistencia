Souly HR · Módulo base · Documentación de producto

# Módulo de organización

> **Módulo de organización — versión en Markdown.** Reúne completo el documento de producto `public/reglas-de-negocio.html` (versión 3.5, 7 de octubre de 2026): glosario, contexto, integraciones, funcionalidades, las 47 reglas de negocio con sus escenarios, modelo de datos, roadmap, flujos, wireframes, historias de usuario y el anexo de decisiones. Al final suma un anexo nuevo, **«El módulo en el prototipo, hoy»**, con cómo está construido al 7 de octubre de 2026 y en qué se aparta del documento. Los wireframes y diagramas dibujados se conservan en el HTML; acá quedan nombrados, con todo lo que señalan.

## Índice

- [00 · Glosario](#00--glosario)
- [01 · Contexto](#01--contexto)
- [02 · Integraciones](#02--integraciones)
- [03 · Funcionalidades](#03--funcionalidades)
- [04 · Reglas de negocio](#04--reglas-de-negocio)
- [05 · Modelo de datos](#05--modelo-de-datos)
- [06 · Roadmap](#06--roadmap)
- [07 · Flujos de usuario](#07--flujos-de-usuario)
- [08 · Recursos visuales](#08--recursos-visuales)
- [09 · Historias de usuario](#09--historias-de-usuario)
- [Cómo se mantiene este documento](#cómo-se-mantiene-este-documento)
- [Anexo · Por qué decidimos así](#anexo--por-qué-decidimos-así)
- [Anexo · El módulo en el prototipo, hoy](#anexo--el-módulo-en-el-prototipo-hoy)

La estructura de la empresa deja de vivir en un Excel y pasa a ser *la fuente de la que leen todos los módulos*. Este documento define qué es, qué reglas cumple, qué tiene que hacer el producto y cómo se opera.

![Mascota de VIA sosteniendo una hoja impresa con un organigrama](public/assets/imagenes/via_organigrama.png)

- **Versión:** 3.5
- **Fecha:** 7 de octubre de 2026
- **Autoría:** Paola Gema — Diseñadora UX
- **Revisa y aprueba:** Naihara Rocha — reglas y uso de RR.HH.
- **Revisa y aprueba:** Israel Chávez — viabilidad y plazos
- **Consultora especialista:** Fabiola Gutiérrez — RR.HH. y dominio
- **Estado:** Entregado

| En este documento | Cantidad |
| --- | --- |
| niveles de estructura del árbol | 8 |
| reglas de negocio | 47 |
| requisitos funcionales | 32 |
| no funcionales | 6 |
| historias de usuario | 15 |
| wireframes | 7 |
| flujos de usuario | 8 |
| decisiones abiertas | 7 |

### El organigrama, de un vistazo

Las cuatro codificaciones de cuadro y las dos líneas. Cada una lleva **tres señales al mismo tiempo** —color, forma de borde e ícono— para que el organigrama se siga leyendo fotocopiado, proyectado y por alguien con daltonismo.

**Las cuatro codificaciones de cuadro**

- 👤 Regular
- 🎯 Staff
- 🤝 Externo
- ⬜ Vacante

**Lo que se lee del árbol, no se declara**

- ⭐ Tiene gente a cargo
- Dependencia estructural
- Dependencia funcional

De quién depende cada puesto. En la base es su jefeId.

### Guía de lectura por rol

#### Si usted es de Diseño UX

![VIA con anteojos redondos y una bufanda de colores, sosteniendo un portátil donde se ve un tablero de wireframes conectados entre sí](public/assets/imagenes/via_ux_ui.png)

**Tu misión** Que cualquier empresa pueda armar su estructura y su organigrama, tenga la forma que tenga, sin que haga falta un desarrollo para cada una.

Souly es un SaaS y no hay dos empresas con la misma forma: una opera en cinco ciudades y otra en una sola, una separa centros de trabajo de sus sucursales y otra no. Que las dos lleguen solas hasta su organigrama obliga a que ninguna pantalla dé por sentado qué niveles de estructura existen, y a que ninguna etiqueta quede escrita en el diseño: todas salen de la lista de la empresa. El documento define qué debe respetar cada pantalla y de dónde salen sus palabras.

- **Empezar por:** 00 · Glosario · 1.4 · Principios de diseño · 08 · Recursos visuales
- **No omitir:** 04 · Reglas de negocio: es lo que la maqueta debe cumplir. Cada regla incluye el escenario con el que se verifica

#### Si usted es de Desarrollo

![VIA con anteojos de marco grueso, sosteniendo un portátil con código en pantalla](public/assets/imagenes/via_developer.png)

**Tu misión** Entregar el módulo completo y probado: cada regla de negocio cumplida, cubierta con pruebas unitarias y verificada con QA.

Antes de escribir la primera línea, leer entero el punto 04. Las cuarenta y siete reglas dicen qué tiene que pasar y qué tiene que estar impedido, y cada una trae un escenario —el camino que debe funcionar— que sirve como caso de prueba tal como está. El punto 05 explica cómo está modelado el árbol; el 03, qué debe hacer cada pantalla.

- **Empezar por:** 00 · Glosario · 05 · Modelo de datos · 03 · Funcionalidades
- **No omitir:** 04 · Reglas de negocio y 02 · Integraciones: definen qué se valida al guardar y qué queda expuesto a los demás módulos. Y 6.6 · Riesgos: hay dos decisiones que, tomadas mal, obligan a migrar todo

#### Si usted es de Negocio y RR.HH.

![Tres VIA juntos: uno con planilla y traje, otro con planos y chaleco de obra, y otro con una tableta de indicadores](public/assets/imagenes/via_rrhh_proyectos.png)

**Tu misión** Cerrar las decisiones que siguen abiertas, antes de que las cierre el código por su cuenta.

Quedan nueve, y una de ellas —el histórico de la estructura— no se puede agregar después sin migrar lo que ya esté cargado. El documento define **qué resuelve el módulo**, cómo se opera y qué falta resolver.

- **Empezar por:** 01 · Contexto · 07 · Flujos de usuario
- **No omitir:** 6.7 · Decisiones abiertas: las nueve que siguen pendientes, varias de ellas de negocio

## 00 · Glosario

Todo el documento se apoya en estas definiciones. No son formalismos: cada una resuelve una confusión que ya apareció. **Están agrupadas por tema y no por alfabeto**, para que leídas de corrido enseñen el modelo: cómo está armado el árbol, sus dos dimensiones, las personas, las dos dependencias y los códigos con los que se cita todo lo demás.

| Término | Qué es |
| --- | --- |
| **Cómo está armada la estructura** | |
| **Estructura** · árbol | La jerarquía completa de la empresa: todos los nodos colgando unos de otros, desde la raíz hasta el último nivel |
| **Nodo** | Cada elemento de la estructura. Declara qué **tipo** es y de qué **nodo superior** cuelga, y nada más |
| **Nivel de estructura** | El tipo de un nodo: qué clase de elemento es —empresa, sucursal, cargo…—. Son ocho de fábrica y cada empresa enciende los que usa |
| **Esquema de niveles** | Los niveles que esa empresa usa, con la palabra que les puso y el orden en que van. Es lo que se configura en la pantalla de Configuración |
| **Nodo superior** | El nodo del que depende jerárquicamente otro. Vacío significa que cuelga de la empresa, que es la respuesta de todo lo de primer nivel |
| **Dimensión** | El criterio con el que se agrupa y se mira la estructura. Son dos: • **Física**, o geográfica — dónde está la empresa: regionales, sucursales y centros de trabajo • **Organizacional** — cómo reparte el trabajo: unidades de negocio, unidades organizacionales y cargos  |
| **Regla de jerarquía** | Un nodo solo puede colgar de otro cuyo nivel de estructura esté **más arriba** en el esquema. Es la única validación estructural del módulo |
| **La dimensión física: dónde está la empresa** | |
| **Estructura física** | El recorte de la estructura que contesta **dónde opera** la empresa: regionales, sucursales y centros de trabajo. También se la llama estructura geográfica |
| **Empresa** | La raíz de la estructura, y el cliente de Souly. Se define en Datos de la empresa y no se crea desde el árbol |
| **Regional** | Agrupa sucursales por geografía. Sirve para filtrar y consolidar, *no para mandar* |
| **Sucursal** | La sede desde la que se opera en un sitio |
| **Centro de trabajo** | Dónde se marca asistencia: una oficina, un almacén, una planta, una obra, una tienda |
| **Sitio de trabajo** | La sucursal o el centro donde se desempeña un puesto. **Solo filtra, nunca forma la estructura** |
| **La dimensión organizacional: cómo reparte el trabajo** | |
| **Estructura organizacional** | El recorte que contesta **cómo reparte el trabajo** la empresa: unidades de negocio, unidades organizacionales y cargos |
| **Unidad de negocio** | La línea por la que la empresa separa lo que hace: Corporativo, Operativo, Servicios. Agrupa para medir, *no para mandar* |
| **Unidad organizacional** | Cualquier agrupación o división dentro de la empresa (Dirección, Gerencia, Departamento, Equipo, etc.). Es el nodo que conforma la estructura del árbol y permite **anidamiento jerárquico sin límite de profundidad**. Esa palabra —su **tipo de unidad**— es una etiqueta descriptiva, no una regla de nivel jerárquico por sí misma |
| **Cargo** | La definición de un rol: cómo se llama, en qué unidad vive, qué nivel de mando tiene y cuántas sillas abre. **Existe una sola vez** |
| **Puesto** | Una silla concreta de ese cargo: su código, dónde se trabaja y quién la ocupa |
| **Organigrama** | La misma estructura, dibujada. No es una copia: es la otra manera de mirar el mismo dato |
| **Las personas y las sillas** | |
| **Ocupante** | La persona que ocupa un puesto. Su ficha vive en Gestión de personas, no en este módulo |
| **Cupo** | Cuántas personas pueden ocupar un cargo a la vez. Es un **techo**, no una orden de creación |
| **Vacante** | Un estado, no una clase: una silla abierta que nadie ocupa |
| **Tipo de cargo** | Regular, staff o externo. Se declara en el cargo y baja a sus puestos. **«Jefe» no es un tipo**: se lee de la estructura |
| **Colaborador** | La clase corriente: en planilla y dentro de la dependencia estructural. Tiene nivel de mando |
| **Staff** | Asiste a un cargo sin depender estructuralmente de él —una controller, una asistente de gerencia—. **Sin nivel de mando**, y se dibuja al costado |
| **Outsourcing** | Lo cubre un prestador externo. **Sin nivel de mando**, se dibuja al costado y no genera planilla ni asistencia |
| **Nivel de mando** | El grado de autoridad de un cargo. Vienen tres —superior, medio e inferior— y cada empresa los renombra, los reordena y agrega los que le falten |
| **Las dos dependencias** | |
| **Dependencia estructural** | Define la relación jerárquica principal dentro del organigrama. Cada puesto tiene un **único jefe directo**, quien coordina su evaluación, contrato y posición formal. En pantalla se llama `De quién depende` |
| **Dependencia funcional** | Define la relación de trabajo operativo con otras áreas o proyectos. Un puesto puede responder a **varios responsables funcionales** según las tareas que desempeñe. En pantalla se llama `También trabaja en` |
| **Estados y herencia** | |
| **Activo · inactivo** | El estado de un nodo. **Desactivar no es borrar**: lo cerrado deja de ofrecerse para cosas nuevas y conserva su historia |
| **Herencia** | Lo que un nodo saca de su rama sin declararlo: la sucursal de una unidad, y la unidad y el nivel de mando de un puesto |
| **Cómo está escrito este documento** | |
| **BR‑ORG‑000** | Una **regla de negocio**: qué es verdad en la organización de una empresa, con el escenario que la verifica |
| **RF‑ORG‑000** | Un **requisito funcional**: qué tiene que hacer el producto al respecto |
| **RNF‑ORG‑00** | Un **requisito no funcional**: cómo tiene que comportarse —escala, aislamiento, accesibilidad— |
| **F‑ORG‑00** | Un **flujo**: un recorrido paso a paso, con su camino feliz y sus desvíos |
| **W‑00** | Un **wireframe**: la pantalla dibujada en cajas, sin decir de qué color es nada |
| **ABIERTA‑00 · FUERA‑00** | Una decisión que todavía no se tomó, y algo que se dejó deliberadamente fuera de esta versión |

**«Nodo» y «nivel de estructura», dichas de otra manera.** La estructura de una empresa —sus sedes, sus áreas, sus cargos— se guarda como **una sola lista de piezas**. Cada pieza dice dos cosas y nada más: **qué es** y **de qué cuelga**. A la pieza este documento la llama **nodo**; a lo que esa pieza es —sucursal, área, cargo— la llama **nivel de estructura**.

Por eso son ocho niveles de estructura y no ocho listas separadas: una sucursal y un cargo se guardan igual, y lo único que los distingue es su nivel de estructura y de qué cuelgan. **Para recursos humanos** eso significa que la empresa decide qué niveles de estructura usa y cómo los llama. **Para desarrollo** significa una sola tabla con tipo y padreId, y ninguna tabla por nivel de estructura.

Quien usa el producto ve sucursales, áreas, cargos y puestos, y los ve con **la palabra que sale de la lista de niveles de su empresa**, nunca con una escrita en el código de la pantalla. Esa es la condición de RNF‑ORG‑06. Hoy esa lista trae los nombres de fábrica y no hay dónde cambiarlos —FUERA‑05—; lo que la condición asegura es que el día que lo haya, cambiarlos no sea tocar cada pantalla.

> **Figura · Las palabras, señaladas. Un nodo por nivel, y cada rótulo es un término del glosario. Sirve para aprender cómo se llama cada cosa, no para ver cómo queda una empresa.** — el dibujo está en la versión HTML de este documento.

**Tres cosas parecen tipos de cargo y no lo son.**

**Vacante** es un **estado**, no un tipo: una silla que nadie ocupa. Se deduce, y puede estar vacante un puesto de cualquiera de los tres tipos —también uno de staff o externo—.

**Jefe** tampoco se declara: es jefe el puesto que tiene otros colgando de él, y eso se lee del árbol. Por eso nunca queda viejo cuando alguien mueve a otro de lugar.

**Funcional** no es un tipo sino una **dependencia**: un puesto dibujado en otra unidad por dependencia funcional sigue siendo el mismo puesto, del mismo tipo, y no se cuenta dos veces.

### 0.1 Todo es un nodo

Empresa, regional, sucursal, centro de trabajo, unidad de negocio, unidad organizacional, cargo y puesto **no son ocho tablas: son ocho tipos del mismo nodo**. Cada nodo declara qué tipo es y de qué nodo superior cuelga.

**Es la decisión que ordena todo lo demás.** La estructura no se pudo modelar de una vez porque cada empresa la dibuja distinta, y la respuesta que veníamos dando era agregar una pantalla por cada forma nueva. Con un solo árbol, de qué escalones está hecho pasa a ser **un dato de la empresa**: lo que antes era programar, ahora es configurar. La regla completa es BR‑ORG‑001.

### 0.2 El esquema: los ocho niveles

Este es el esquema de niveles con el que nace una empresa. Cada una lo recorta: enciende los que usa y apaga los que no.

| Nivel de estructura | Dimensión | ¿Se apaga? | Qué contesta | De qué puede colgar |
| --- | --- | --- | --- | --- |
| **Empresa** | Ninguno | Fijo | Es la raíz. Se define en Datos de la empresa y no se crea desde el árbol | De nada |
| **Regional** | Física | Sí | Agrupa sucursales por geografía. Para filtrar y consolidar, *no para mandar* | De la empresa |
| **Sucursal** | Física | Sí | La sede desde la que se opera en un sitio | De la empresa o de una regional |
| **Centro de trabajo** | Física | Sí | Dónde se marca asistencia: una oficina, un almacén, una planta, una obra, una tienda | De una sucursal, o de otro centro |
| **Unidad de negocio** | Organizacional | Sí | La línea por la que la empresa separa lo que hace: Corporativo, Operativo, Servicios. Agrupa para medir, *no para mandar* | De la empresa |
| **Unidad organizacional** | Organizacional | Fijo | Agrupa personas y cargos. La palabra —Dirección, Gerencia, Departamento, Área, Equipo— es un campo, no un nivel de estructura. Se anida sin límite de profundidad | De cualquier nivel de estructura superior, y **de otra unidad** |
| **Cargo** | Organizacional | Fijo | La definición de un rol: nombre, unidad, nivel de mando y cuántas sillas abre | **Solo de una unidad organizacional** |
| **Puesto** | Organizacional | Fijo, sin lista propia | Una silla concreta de un cargo: dónde se trabaja y quién la ocupa. Es el único nodo que apunta a las dos dimensiones | **Solo de un cargo** |

**El cargo y el puesto son fijos y encima están acotados a un solo nodo superior**, aunque la regla de jerarquía les permitiría más. Un cargo colgado de una sucursal saldría del organigrama, y ahí la dimensión física y la organizacional dejarían de tocarse en un solo punto —el puesto—, que es lo que sostiene todo el modelo. BR‑ORG‑008 y BR‑ORG‑010.

### 0.3 Las dos dimensiones

La **estructura física** —regional, sucursal, centro de trabajo— contesta dónde está la empresa. La **estructura organizacional** —unidad de negocio, unidad organizacional, cargo— contesta cómo reparte el trabajo. No son dos árboles: son dos recortes del mismo, y cada pantalla lista solo los tipos de su dimensión.

> **Figura · Cómo se ve en una empresa de verdad. Varios nodos por nivel, dos cargos con mandos distintos, una silla ocupada y otra vacante, y el punto donde las dos dimensiones se tocan.** — el dibujo está en la versión HTML de este documento.

### 0.4 Cargo y puesto: la distinción que más cuesta

El **cargo** define qué se hace y existe una sola vez. El **puesto** es una silla concreta de ese cargo. Cinco «Ejecutivo Comercial» son **un cargo con cinco puestos**, no cinco cargos.

| Dato | ¿De quién es? | Por qué |
| --- | --- | --- |
| Nombre del rol | **Del cargo** | Renombrarlo renombra las cinco sillas de una vez |
| Unidad organizacional | **Del cargo** | Ahí está su jefe, su presupuesto y su evaluación |
| Nivel de mando | **Del cargo** | Es parte de la definición del rol, no de la silla |
| Cupo de sillas | **Del cargo** | Es un techo: hasta cuántas personas pueden ocuparlo a la vez |
| Código | **Del puesto** | Distingue una silla de otra del mismo cargo |
| Dónde se trabaja | **Del puesto** | Tres sillas del mismo cargo pueden estar en tres ciudades |
| De quién depende | **Del puesto** | Dos sillas en dos sedes pueden responderle a jefes distintos |
| Quién lo ocupa | **Del puesto** | La persona ocupa una silla, no un catálogo |

**El puesto no tiene campo de nombre: se llama como su cargo.** Y hereda de él la unidad y el nivel de mando, que se *enseñan* y no se preguntan. Volver a pedirlos permitiría que una silla de «Ejecutivo Comercial» declare estar en Contabilidad, y después nadie sabe cuál de las dos vale. BR‑ORG‑007 y BR‑ORG‑011.

> **Figura · El caso, dibujado. Un solo cargo llamado «Vendedor», con nueve sillas. Tres responden a la Supervisora de Supermercados y seis a la Coordinadora de Ventas: cada silla tiene su propia línea hacia arriba, y por eso la jefatura no puede vivir en el cargo.** — el dibujo está en la versión HTML de este documento.

### 0.5 Los tres tipos de cargo

Se declaran en el cargo y bajan a sus puestos. Los tres nombres cortos son los que se ven en la columna y en el filtro; el nombre largo es la definición completa.

| Tipo | Qué es | Particularidad |
| --- | --- | --- |
| **Regular** — *Cargo regular o de línea* | Puesto interno en planilla que forma parte de la jerarquía vertical: manda o reporta directamente | Es el caso corriente. Es el único que tiene nivel de mando |
| **Staff** — *Cargo de staff (asesoría o soporte)* | Puesto interno en planilla que da soporte o asistencia a una dirección desde el costado, sin gente a su cargo: una controller, una asistente de gerencia | **Sin nivel de mando.** Se dibuja al costado, no debajo |
| **Externo** — *Cargo externo (outsourcing)* | Puesto cubierto por un prestador externo | **Sin nivel de mando.** Se dibuja al costado. No genera planilla ni asistencia |

**«Jefe» no es un tipo, y «vacante» tampoco.** Un puesto es jefe porque tiene otros colgando de él: se lee del árbol, y por eso nunca queda viejo cuando alguien mueve a otro de lugar. Una silla está vacante porque nadie la ocupa: se deduce, no se marca a mano. BR‑ORG‑014.

### 0.6 Las dos dependencias

| Dependencia | Qué significa | Dónde vive el dato | Cuántas admite |
| --- | --- | --- | --- |
| **Estructural** · `Depende de` | La relación jerárquica principal: su jefe directo, quien coordina su evaluación y su posición formal | En el **puesto** | Una, o ninguna si es la cima |
| **Funcional** · `También trabaja en` | La relación de trabajo operativo con otras áreas o proyectos, según las tareas que desempeñe | En el **puesto** | Las que haga falta, una por unidad |

**Cuidado con «organizacional»: en este documento nombra tres cosas distintas.** Es una de las dos **dimensiones**, es el nivel llamado **unidad organizacional**, y es el adjetivo de **estructura organizacional**. Ninguna de las tres es una dependencia, y por eso la primera de las dos de acá abajo se llama **estructural** y no «organizacional».

**Y «dependencia» no quiere decir jerarquía en los dos casos.** La estructural es de quién se depende: una sola, y es la que dibuja el árbol. La funcional es dónde se trabaja además: todas las que haga falta, y no mueven a nadie de sitio en el organigrama.

**Por qué las dos viven en el puesto y no en el cargo.** Dos sillas del mismo cargo en dos sedes pueden responderle a jefes distintos. Deducirlo —«cada cargo responde a la cabeza de su unidad»— alcanza para el caso corriente y miente en cuanto una unidad tiene dos jefaturas. BR‑ORG‑012 y BR‑ORG‑013.

### 0.7 Cómo se nombra cada cosa según dónde aparezca

Un mismo concepto se llama distinto en pantalla, en la documentación y en la base. No es descuido: cada lector es otro. Y hay una vuelta más: **en pantalla la palabra la elige la empresa**, no el producto.

| Concepto | En pantalla | En documentación | En la base |
| --- | --- | --- | --- |
| El tipo de un nodo | La palabra que sale de la lista de niveles | *nivel de estructura* | `tipo` — una llave, nunca la palabra |
| De qué cuelga | `Depende de` | *nodo superior* | `padreId` |
| Dependencia estructural | `De quién depende` | *dependencia estructural*, o *línea de mando* | `jefeId`, en el puesto |
| Dependencia funcional | `También trabaja en` | *dependencia funcional*, o *apoyo funcional* | `apoyos[]`, en el puesto |
| Cerrar sin borrar | `Cambiar estado` | *desactivación* | `estado` |

«Nodo superior» es vocabulario de especialista. La responsable de RR.HH. que declara su estructura no lo usa. En pantalla se entiende el verbo; el término técnico vive donde el lector es otro. Y ninguna etiqueta de nivel de estructura está escrita en el código de la pantalla: sale de la lista de la empresa —RNF‑ORG‑06—, que es la condición para que Souly sea multipaís y multirubro.

## 01 · Contexto

*Qué es un organigrama, qué le falta al que ya existe, y a quién tiene que servir el que estamos construyendo.*

### 1.1 ¿Qué es un organigrama?

Un organigrama es la representación de la **estructura formal** de una organización: qué puestos existen, cómo se relacionan entre sí y quién responde ante quién. Es un mapa, y como todo mapa vale por lo que decide dejar afuera.

Responde tres preguntas y ninguna más:

| Pregunta | Qué la contesta |
| --- | --- |
| **¿Qué puestos existen?** | El cargo con su cupo de sillas, dentro de su unidad organizacional |
| **¿Cómo se relacionan?** | Las dos líneas: de quién depende cada puesto, y en qué unidades además trabaja |
| **¿Dónde se desempeñan?** | El sitio de trabajo del puesto, que filtra la vista sin alterar el árbol |

**La unidad es el puesto, no la persona.** Es la decisión que ordena todo lo demás. Un organigrama construido sobre personas se desarma cada vez que alguien renuncia: desaparece el cuadro, desaparecen las líneas que salían de él y desaparece el registro de que esa silla existía. Construido sobre puestos, la rotación es lo que es —un cambio de ocupante— y la estructura queda intacta.

**Lo que un organigrama no dice.** No dice cómo se trabaja de verdad, ni quién tiene influencia, ni cuánto gana nadie. Describe la estructura declarada, que es una parte de la organización y no toda. Confundir las dos cosas es el error clásico: se le pide al organigrama que explique por qué algo no funciona, y el organigrama solo sabe quién le reporta a quién.

### 1.2 El problema que resuelve

La estructura no se pudo modelar de una vez porque cada empresa la dibuja distinta, y la respuesta que veníamos dando era **agregar una pantalla por cada forma nueva**. Este módulo cambia esa respuesta.

| Qué pasa hoy | Qué cambia |
| --- | --- |
| **Organigramas en hojas de cálculo** y documentos desactualizados que no escalan con el crecimiento de la empresa cliente | El árbol vive en un solo sitio y se edita donde se mira |
| **La implantación se traba en el primer paso:** sin estructura no se puede dar de alta a nadie, y armarla depende de soporte | Cada empresa configura sola su estructura física y jerárquica, con sus palabras, en minutos |
| **Dispersión de datos:** no hay visibilidad centralizada de dónde operan los colaboradores ni de cómo se estructuran las líneas de mando | Un solo árbol, y toda la plataforma lee de él |
| **Inconsistencias cruzadas:** se asigna personal a cargos o ubicaciones que no existen | La estructura es la fuente única de verdad organizacional, y los otros módulos la consultan en vez de copiarla |

**El dolor concreto.** Hoy, para saber quién depende de quién en una sucursal, alguien de RR.HH. abre un Excel que actualizó a mano en enero. Cuando la empresa reorganiza un área, ese Excel queda viejo el mismo día y nadie se entera hasta que un permiso se traba o un anuncio le llega a quien no era.

### 1.3 Visión del módulo

**Dónde vive.** Organización es un **módulo base**: no se vende aparte y está encendido desde el primer día en toda empresa. Es el primero que se llena en la puesta en marcha, y de él cuelga lo demás.

#### El objetivo

Proveer una arquitectura organizacional **flexible, multiempresa y autogestionable**, que permita a las empresas clientes configurar y escalar rápidamente su propia estructura física y jerárquica en la nube, estandarizando la gestión de su talento desde el primer día de despliegue.

#### Las cinco piezas

| # | Pieza | Qué es |
| --- | --- | --- |
| 01 | **Un solo árbol de nodos** | Ocho niveles de estructura que no son ocho tablas. Cada nodo declara su tipo y su nodo superior, y de ahí sale todo lo demás |
| 02 | **El esquema de niveles es un dato de la empresa** | Cada una enciende los niveles de estructura que usa y apaga los que no. Lo que antes era programar —una pantalla por cada forma de organización— ahora es configurar |
| 03 | **Dos dimensiones que se tocan en un punto** | La geografía y el trabajo, cruzados solo en el puesto. Es lo que evita que el mismo cargo aparezca dibujado tres veces por tener tres sedes |
| 04 | **Cargo y puesto separados** | El rol se define una vez; las sillas se abren tantas como haga falta, cada una con su sitio, su jefe y su ocupante |
| 05 | **El organigrama y las tablas son el mismo dato** | Tres vistas del mismo árbol —gráfico, cards y tabla—, sin copia que sincronizar y sin dos verdades posibles |

#### Hacia dónde va

| Horizonte | Hacia dónde |
| --- | --- |
| **Esta versión** | La estructura existe, está completa y los otros módulos la pueden leer |
| **Siguiente** | La estructura tiene historia: ver cómo estaba la organización en una fecha pasada, para auditoría y para análisis de rotación. Hoy está fuera de alcance —FUERA‑01— y es la decisión con más consecuencias de las que quedan abiertas |
| **Más adelante** | La estructura alimenta decisiones: costo por unidad de negocio, tramos de control, unidades sin sucesor |

### 1.4 Principios de diseño

Ocho decisiones que se tomaron una vez y valen para todo el módulo. Cuando aparezca un caso que este documento no previó, se resuelve con estos principios y no con criterio nuevo. El argumento largo de cada uno está en el anexo *Por qué decidimos así*.

| # | Principio | Qué implica en la práctica |
| --- | --- | --- |
| 1 | **Un solo árbol, ocho tipos** | Ninguna forma de organización nueva se resuelve con una pantalla nueva |
| 2 | **El esquema de niveles lo decide la empresa** | Los niveles de estructura se encienden y se apagan sin tocar código |
| 3 | **Lo imposible no se ofrece** | Un desplegable que no incluye lo prohibido evita un mensaje de error que nadie quería leer |
| 4 | **Se deduce antes que se pregunta** | La sucursal de una unidad, el estado de vacante y la condición de jefe se leen del árbol. Un dato que se pregunta dos veces se contradice una |
| 5 | **El cargo es el rol; el puesto es la silla** | Lo que es del rol se define una vez; lo que es de la silla se declara silla por silla |
| 6 | **Desactivar no es borrar** | Lo que cerró conserva su historia y deja de ofrecerse. Eliminar es otra acción, y avisa qué arrastra |
| 7 | **Se llama como lo llama el usuario** | «Depende de», no «nodo superior». Y la palabra del nivel de estructura la pone la empresa |
| 8 | **El organigrama vive fuera de la pantalla** | Se imprime y se proyecta. Se exporta entero y a tamaño natural, no el pedazo que se ve |

**El principio 4 es el que más consecuencias tiene.** La sucursal de una unidad se declara una sola vez y baja por la rama: las de más abajo la muestran y no la vuelven a preguntar —BR‑ORG‑006—. El estado de vacante no se marca: se deduce de que nadie ocupe la silla. «Jefe» no se declara: se lee de que otros cuelguen de él —BR‑ORG‑014—. Cada uno de esos datos, si se preguntara, podría contradecir al árbol, y ahí nadie sabría cuál de los dos vale.

### 1.5 Cómo se sabe si funcionó

| Señal | Qué mediríamos | Adónde apunta |
| --- | --- | --- |
| **La estructura se carga una sola vez** | Cantidad de sucursales o unidades creadas por fuera de este módulo | **Cero** |
| **La empresa recorta su escalera** | Porcentaje de empresas que apagaron al menos un nivel de estructura que no usan | **Alto** |
| **La puesta en marcha no se traba** | Tiempo desde que se crea la empresa hasta que hay un organigrama con cargos y puestos | **Días, no semanas** |
| **El árbol está sano** | Nodos colgando de un nivel de estructura apagado, o de un nodo superior que ya no existe | **Cero** |
| **El organigrama se usa** | Exportaciones y visitas al organigrama por empresa y por mes | **Sostenido** |

**Ninguna de estas cifras está medida hoy**, porque el módulo actual no registra estos eventos. Registrar la actividad —alta de nodo, cambio de esquema de niveles, exportación, importación— es lo que convierte esta tabla en algo comprobable; hoy es una intención. **Está sin requisito escrito** y es una de las cosas a cerrar antes de desarrollo.

### 1.6 A quién sirve

| Quién | Qué hace en el módulo | Cada cuánto | Qué le importa |
| --- | --- | --- | --- |
| **Recursos Humanos** | **Es el único que edita.** Arma la estructura, abre cargos y puestos, y decide qué niveles de estructura usa la empresa | Semanal | Que se cargue una vez y quede bien. Es la usuaria principal |
| **Alta dirección** | Mira el organigrama completo, lo recorta por sucursal y se lo lleva a una presentación | Trimestral | Que se entienda de un vistazo y salga presentable |
| **Líder de equipo** | Consulta su rama: de quién depende cada persona y qué sillas están sin cubrir | Mensual | Saber a quién pedirle qué, sin preguntar |
| **Colaborador** | **No entra al módulo.** Ve el resultado —el organigrama, de quién depende, quién es su equipo— desde su app | De vez en cuando | Encontrar una respuesta concreta en dos toques |
| **Los otros módulos** | Preguntan qué unidades hay, qué sucursales y qué cargo tiene una persona | Permanente | No tener que mantener su propia copia |

#### Persona de referencia

**Fabiola Gutiérrez · consultora especialista en RR.HH.**

Mantiene la estructura de empresas de varias sucursales y es quien conoce cómo se arma un organigrama de verdad: dónde una gerencia responde a dos sitios, cuándo una sucursal cerrada tiene que seguir apareciendo y por qué cinco cajeros no son cinco cargos. **Es quien valida que el modelo describa organizaciones reales**, y quien recorre el prototipo antes de que llegue a desarrollo.

Sus dos exigencias condicionan buena parte de este documento: **que la empresa pueda usar sus propias palabras** —de ahí el esquema de niveles configurable— y **que el organigrama sirva para presentar**, impreso y proyectado, de donde sale que la exportación sea un requisito y no una mejora.

#### Los cinco trabajos que resuelve

| Quién | Qué quiere hacer | Para qué |
| --- | --- | --- |
| **RR.HH., en la puesta en marcha** | Cargar la empresa entera —sedes, áreas, cargos— una sola vez | Para poder empezar a usar el resto de los módulos sin volver a cargar lo mismo |
| **RR.HH., todos los meses** | Abrir un cargo nuevo, cerrar una sucursal, mover un área de dirección | Para que el organigrama diga lo que de verdad pasa, y no lo que pasaba en enero |
| **Alta dirección** | Mirar el organigrama completo, recortarlo por sucursal y llevárselo a una presentación | Para decidir dónde falta gente y dónde sobra estructura |
| **Un líder de equipo** | Ver de quién depende cada persona de su rama y quién está sin cubrir | Para saber a quién pedirle qué, sin preguntar |
| **Los otros módulos** | Preguntar «¿qué unidades hay?», «¿qué sucursales?», «¿qué cargo tiene esta persona?» | Para segmentar una ruta, un anuncio o un permiso sin mantener su propia copia |

Cada uno de esos trabajos está desarrollado paso a paso, con sus desvíos, en la sección 7.

### 1.7 Alcance y límites

#### Qué entra

- **El árbol completo de la organización y su edición:** crear, mover, renombrar, cambiar de estado y eliminar nodos.
- **La configuración de los niveles de estructura** que cada empresa enciende o apaga.
- **Los datos de la empresa**, que son la raíz del árbol.
- **El catálogo de cargos**, sus puestos y la dependencia estructural entre ellos.
- **El organigrama** —dibujarlo, recortarlo, exportarlo— y la carga masiva desde una planilla.

#### Qué no entra

| Queda afuera | Por qué, y de quién es |
| --- | --- |
| **Las personas** | Quién ocupa un puesto se declara en este módulo, pero la ficha del colaborador, su contrato y sus datos sensibles son de **Gestión de personas** |
| **Los permisos** | El cargo no es el rol: quién puede hacer qué se define en **Configuración**. La estructura solo aporta el alcance —sobre quién— |
| **La nómina y la asistencia** | El centro de trabajo dice dónde se ficha; qué se hace con esa marca es de otro módulo |
| **El histórico de la estructura** | Hoy se guarda cómo está la organización, no cómo estaba en marzo. Es una decisión abierta, no un olvido — FUERA‑01 |

#### Lo que este módulo no pretende ser

- **No es una herramienta para diseñar la organización.** Representa la estructura que existe; no simula reorganizaciones ni escenarios hipotéticos.
- **No reemplaza el directorio de personas.** Acá la unidad es el puesto; la persona es quien lo ocupa.
- **No abre la edición a todo el mundo.** La estructura la lee todo lo administrativo y la edita solo Recursos Humanos.
- **No modela doble jefe.** Cada puesto depende de uno solo. Lo matricial se expresa con la dependencia funcional.
- **No decide por nadie.** El sistema valida reglas; no sugiere reorganizaciones ni señala cargos «innecesarios».

#### Escala de prioridades

Vale para todos los requisitos de la sección 3.

| Prioridad | Criterio |
| --- | --- |
| Oblig. | Sin esto, la estructura no le sirve a los otros módulos |
| Import. | Mejora sustantiva; entra si el plazo lo permite |
| Deseable | Entra en la primera iteración posterior |
| Fuera | Registrado, pero no en esta versión |

**Las prioridades de la sección 3 son una propuesta de Diseño, sin confirmar.** Están puestas para poder discutir el corte de la primera entrega; el que manda es el acuerdo con Producto y Desarrollo, y hasta que exista, ninguna de esas etiquetas es un compromiso.

## 02 · Integraciones

*Qué lee y qué escribe cada módulo. Este es el que se llena primero, y del que cuelgan los demás.*

### 2.1 El principio: la estructura es la fuente, los demás leen

El módulo de Organización no le pide datos a nadie. **Declara la estructura y la expone**; los otros la consultan. La única escritura que recibe desde afuera es la asignación de ocupantes, que llega de Gestión de personas.

Es una decisión de arquitectura, no una preferencia: si cada módulo pudiera escribir estructura, habría siete lugares donde cambiar de jefe y ninguno sería el verdadero. Es lo que dice BR‑ORG‑020 y lo que exige RNF‑ORG‑01.

```text
                       ┌──────────────────────────┐
    escribe   ────────▶│                          │
                       │      ORGANIZACIÓN       │
 Gestión de personas   │                          │
 (ocupantes)           │  nodos · niveles de estructura        │──────▶  leen
                       │  cargos · puestos        │
                       │  dependencia estructural │   Gestión de personas
                       │  dependencias funcionales│   Onboarding
                       └──────────────────────────┘   Evaluación
                                                      Comunicación
                                                      Asistencia
                                                      Planillas y salarios
```

#### Qué expone

| Pregunta | Qué devuelve |
| --- | --- |
| ¿Qué sucursales y centros tiene esta empresa? | Los nodos de la dimensión física, anidados, con su estado |
| ¿Qué unidades organizacionales hay? | El árbol de unidades, con su tipo y su responsable |
| ¿Qué cargos hay y de cuántas sillas? | Cargos activos con unidad, nivel de mando, tipo y cupo |
| ¿Qué puesto ocupa esta persona? | El puesto, su cargo, su unidad y su sitio de trabajo |
| ¿De quién depende este puesto? | El puesto jefe, y su ocupante si lo tiene |
| ¿En qué otras unidades trabaja? | Sus dependencias funcionales, con a quién le responde en cada una |
| ¿Qué sillas están sin cubrir? | Los puestos vacantes, deducidos de que nadie los ocupe |

### 2.2 De qué depende este módulo

De muy poco, y es a propósito: es el primero que se llena en la puesta en marcha. Necesita los **datos de la empresa** —que son su raíz— y el **catálogo de países** para las direcciones. Nada más.

**Eso es lo que lo hace el punto de partida de toda implantación.** Y también lo que lo vuelve el cuello de botella: mientras la estructura no exista, no hay dónde sentar a nadie, y el resto de los módulos no arranca.

### 2.3 Gestión de personas

**Es el único módulo que además escribe.**

- **Qué lee:** Los cargos y sus puestos al dar de alta a un colaborador, con su unidad, su nivel de mando y su sitio de trabajo
- **Qué escribe:** Quién ocupa cada puesto
- **Se apoya en:** BR‑ORG‑007 · BR‑ORG‑009 · BR‑ORG‑011

Depende directamente de la estructura para asignar a cada colaborador su cargo, su nivel de mando, su unidad organizacional y su ubicación física exacta. **El cupo del cargo se valida aquí:** un cargo de cinco sillas no admite una sexta, y el intento se rechaza ofreciendo subir el cupo o abrir otro cargo.

### 2.4 Onboarding

- **Qué lee:** Cargos, unidades y sucursales, para decidir qué ruta le toca a quién
- **Qué escribe:** Nada
- **Se apoya en:** BR‑ORG‑020

Una ruta de onboarding apunta a un **cargo y una sede**, no a una persona: cuando se abre un puesto de ese cargo en esa sede, quien lo ocupe recibe la ruta sin que nadie la elija. Es el ejemplo más claro de por qué escribir en la estructura tiene que ser de RR.HH. y de nadie más: **una unidad borrada deja rutas sin destino**.

### 2.5 Evaluación

- **Qué lee:** Niveles de mando, cargos y la jerarquía, para armar las cadenas de evaluación
- **Qué escribe:** Nada
- **Se apoya en:** BR‑ORG‑012 · BR‑ORG‑013 · BR‑ORG‑015

Necesita los niveles de mando, los cargos y la jerarquía para configurar quién evalúa a quién —de jefe a subordinado, o entre pares de la misma unidad—.

**La dependencia funcional es lo que le falta hoy y lo que este módulo aporta.** Un puesto que pertenece a una unidad y trabaja en otra tiene dos personas que pueden opinar de su trabajo: la de su dependencia estructural y la de la unidad que apoya. Si esa segunda relación no está declarada —BR‑ORG‑013—, los evaluadores funcionales se cargan a mano, por fuera del sistema, cada vez que se arma un ciclo.

### 2.6 Comunicación

- **Qué lee:** Regionales, sucursales, unidades y niveles de mando, para segmentar destinatarios
- **Qué escribe:** Nada
- **Se apoya en:** BR‑ORG‑005 · BR‑ORG‑006

Se apoya en la estructura para enviar comunicados internos de forma focalizada: a una regional, a una sucursal, a una unidad o a un nivel de mando. **La herencia de sucursal es lo que hace que eso funcione:** un anuncio «para Santa Cruz» alcanza a los puestos que trabajan ahí aunque ninguno lo haya declarado, porque la sede se deduce de la rama.

### 2.7 Asistencia, planillas y salarios

- **Qué leen:** El centro de trabajo del puesto y su clase —colaborador, staff, outsourcing—
- **Qué escriben:** Nada
- **Se apoya en:** BR‑ORG‑010 · BR‑ORG‑014

**Los puestos de outsourcing son la excepción y hay que respetarla de los dos lados.** Están en la estructura pero no en la nómina: no generan planilla ni asistencia. Si Planillas lee la estructura sin filtrar por clase, va a intentar liquidar a personal externo.

### 2.8 Resumen

| Módulo | Lee | Escribe | Qué le aporta este módulo |
| --- | --- | --- | --- |
| **Gestión de personas** | Cargos, puestos, cupo, unidad, sitio | **Ocupantes** | Un catálogo de sillas reales donde sentar a la gente |
| **Onboarding** | Cargos, unidades, sucursales | — | Rutas que se asignan solas por cargo y sede |
| **Evaluación** | Niveles de mando, jerarquía, dependencias funcionales | — | Las cadenas de evaluación, incluida la funcional |
| **Comunicación** | Regionales, sucursales, unidades, niveles | — | Segmentación real, con la sede heredada de la rama |
| **Asistencia** | Centro de trabajo, tipo de cargo | — | Dónde ficha cada quien, y quién no ficha |
| **Planillas y salarios** | Tipo de cargo, unidad | — | A quién se liquida y a quién no |

**Lo que todas tienen en común:** ninguna funciona si el árbol no está cargado. Por eso la puesta en marcha —F‑ORG‑01— no es una comodidad del módulo, es la dependencia crítica de toda la implantación.

## 03 · Funcionalidades

*Treinta y un requisitos funcionales y seis no funcionales, agrupados por pantalla, cada uno con su condición de comprobación.*

Los requisitos que definen qué tiene que hacer el módulo. Cada uno lleva prioridad —según la escala de 1.7—, la regla en la que se apoya y una condición de comprobación, que es lo que QA va a verificar.

**Los números son estables:** RF‑ORG‑012 es RF‑ORG‑012 en cualquier versión de este documento, y no se renumera cuando se inserta uno nuevo en el medio. Por eso los bloques saltan de diez en diez: hay sitio para crecer sin mover a nadie. Las pantallas donde vive cada requisito están en 8.1.

### 3.1 Configuración de la estructura

De qué escalones está hecha esta empresa. Es la pantalla que hace que este módulo no sea ocho tablas.

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RF‑ORG‑001 | La empresa administra **de qué niveles de estructura está hecho su árbol**: enciende los que usa y apaga los que no | Oblig. | Una empresa de una sola ciudad saca «Regional» de todos sus formularios sin que nadie toque código |
| RF‑ORG‑002 | Los niveles de estructura fijos —empresa, unidad organizacional, cargo y puesto— **no se apagan**: sin ellos no hay organigrama que dibujar | Oblig. | El interruptor no existe para esos cuatro, en vez de existir y rechazar |
| RF‑ORG‑003 | Apagar o borrar un nivel de estructura que tiene nodos dentro está **trabado**, y el sistema dice cuántos nodos habría que mover antes | Oblig. | Con 3 regiones cargadas, el interruptor de «Regional» no se puede mover y el contador dice 3. *BR‑ORG‑004* |
| RF‑ORG‑006 | La pantalla muestra una **vista previa del esquema de niveles resultante**: «así queda tu organización», con los niveles de estructura encendidos en orden y anidados | Import. | Apagar un nivel de estructura cambia la vista previa antes de guardar |
| RF‑ORG‑007 | El **catálogo de tipos de cargo** —regular, staff, externo— se administra en esta misma pantalla, porque decide cómo se dibuja el organigrama. El de **niveles de mando** tiene la suya, dentro de Estructura organizacional | Oblig. | Está donde se decide la forma de la estructura, no repartido en dos sitios |

**El nivel de mando también es un catálogo de la empresa** —BR‑ORG‑015—: vienen tres, y cada empresa los renombra, los reordena y agrega los que le falten. El número no se guarda en el cargo: es la posición en la lista, y por eso intercalar un nivel de estructura renumera todo solo sin tocar un cargo.

### 3.2 Las listas del árbol

Estructura física y Estructura organizacional. Dos pantallas con la misma forma, porque son dos recortes del mismo árbol.

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RF‑ORG‑010 | Cada dimensión muestra **una pestaña por nivel de estructura encendido**, en el orden del esquema de niveles, y nombra al final los apagados para poder encenderlos desde ahí | Oblig. | Encender un nivel de estructura agrega su pestaña sin tocar la pantalla |
| RF‑ORG‑011 | La tabla dibuja el **árbol anidado**, no una lista plana: cada fila se cuelga de su ancestro más cercano que también esté en la vista, y el camino que se saltó se enseña en gris | Oblig. | Una unidad que cuelga de una sucursal se sigue viendo anidada en la lista de unidades |
| RF‑ORG‑012 | Las columnas **se deducen de los tipos a la vista**: se dibuja la que **puede** tener dato, no la que ya lo tiene, y desaparece cuando ninguno de los tipos listados podría llenarla | Oblig. | Una tabla sin ningún responsable cargado igual dibuja la columna Responsable, vacía; una sin ninguna unidad de negocio declarada no dibuja esa columna |
| RF‑ORG‑013 | Un buscador filtra dentro de la vista, y el resultado **vuelve a la primera página**. La lista se pagina | Oblig. | Buscar estando en la página 3 no deja al usuario mirando una página vacía |
| RF‑ORG‑014 | El botón de crear **se deduce**: en una vista de un solo tipo crea directamente ese tipo y dice «Nueva sucursal»; en una que agrupa varios, pregunta qué se quiere crear | Oblig. | En la pestaña Sucursales no se ofrece crear una unidad organizacional. *BR‑ORG‑003* |
| RF‑ORG‑015 | Cada fila ofrece un menú con **ver detalle, editar, cambiar estado y eliminar**, y nada más. Eliminar va marcado como riesgo y pide escribir la palabra | Oblig. | El estado se cambia por un solo camino, y borrar nunca es un clic distraído |
| RF‑ORG‑016 | Un cargo se despliega y muestra **sus puestos como filas hijas**, con las mismas columnas. El puesto no tiene lista propia: vive dentro de su cargo | Oblig. | Un cargo de cupo 5 con 1 puesto abierto despliega 5 filas: la abierta y 4 vacantes. *BR‑ORG‑009* |

### 3.3 La ficha de un nodo

Una sola pantalla para los siete tipos que se crean. No cambia de forma: cambia qué campos trae.

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RF‑ORG‑020 | Una **sola ficha** sirve a regional, sucursal, centro de trabajo, unidad de negocio, unidad organizacional, cargo y puesto | Oblig. | Los siete tipos se editan en la misma pantalla, con los mismos gestos |
| RF‑ORG‑021 | La ficha **abre en lectura** y se pasa a edición. Los campos son los mismos y están donde van a estar, solo que bloqueados | Oblig. | Nada se mueve de sitio al pasar de mirar a editar |
| RF‑ORG‑022 | El desplegable **«Depende de» solo ofrece nodos de niveles de estructura superiores**, ya filtrados por lo que la empresa encendió | Oblig. | Creando una unidad, ni un cargo ni un puesto figuran en la lista. *BR‑ORG‑002* |
| RF‑ORG‑023 | Los obligatorios **salen de los propios campos** y bloquean el guardado nombrando cuáles faltan y por qué hacen falta —«es el domicilio que sale en cada finiquito»— | Oblig. | El error nombra el campo y su razón, no un «campo obligatorio» que no explica nada |
| RF‑ORG‑024 | Un **puesto no tiene campo de nombre**: se llama como su cargo. Lo que lo distingue es su código, dónde está y quién lo ocupa; su unidad y su nivel de mando se muestran heredados y en gris | Oblig. | Renombrar el cargo renombra sus puestos, y no hay forma de que una silla declare otra unidad. *BR‑ORG‑011* |
| RF‑ORG‑025 | El cargo declara **su cupo** —hasta cuántas personas admite— y **cuántas plazas abre**, que son dos cosas: sus puestos se crean y se corrigen desde su ficha | Oblig. | Un cargo con cupo 4 y ninguna plaza abierta es válido, y bajar el cupo por debajo de las abiertas no guarda. *BR‑ORG‑009* |
| RF‑ORG‑026 | Un centro de trabajo pregunta por **regional, sucursal y centro superior en tres campos separados**, y el sistema los traduce a un solo nodo superior | Import. | El formulario habla como habla la empresa; el árbol guarda un padreId |
| RF‑ORG‑027 | Cancelar **vuelve a la lista del tipo del nodo**, no a la pantalla desde la que se llegó | Import. | Un nodo pertenece a la lista que lo lista, se haya llegado desde donde se haya llegado |
| RF‑ORG‑029 | El cargo pregunta **si todos sus puestos dependen de la misma jefatura**: marcado —el caso corriente— se elige una y vale para todos; desmarcado, cada puesto elige el suyo | Oblig. | Un cargo de cinco sillas repartidas entre dos supervisores se edita en una sola ficha. *BR‑ORG‑012* |
| RF‑ORG‑038 | El cargo declara **con qué jefatura nacen sus sillas nuevas**, y cambiarla no mueve a ninguna de las que ya existen | Import. | Una silla abierta desde la lista nace colgada y no suelta. *BR‑ORG‑024* |
| RF‑ORG‑028 | El **estado se lee, no se rellena**: en la ficha es un dato mostrado, y se cambia por su único camino —la acción «Cambiar estado»— | Oblig. | No existe un desplegable de estado en el formulario de edición. *BR‑ORG‑016* |

### 3.4 El organigrama

El mismo árbol, dibujado. No es una copia: es la otra manera de mirar el mismo dato.

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RF‑ORG‑030 | Tres vistas del mismo dato: **gráfico, cards y tabla**. Cambiar de vista no cambia lo que hay, cambia cómo se mira | Oblig. | Lo creado en una pantalla está en la otra al instante, sin sincronizar. *BR‑ORG‑017* |
| RF‑ORG‑031 | Los filtros —cargos, unidad organizacional, unidad de negocio y lugar— **recortan la vista, no el sistema**, y cada uno muestra con su nombre lo que está recortando | Oblig. | Filtrar por una sede conserva la dependencia estructural completa hasta arriba. *BR‑ORG‑018* |
| RF‑ORG‑032 | **Los cargos de staff y los externos se dibujan al costado** de la línea, no debajo, porque no mandan | Oblig. | Un puesto de staff nunca aparece como subordinado de quien asiste. *BR‑ORG‑014* |
| RF‑ORG‑033 | La dependencia funcional —«también trabaja en»— se dibuja como **línea secundaria**, distinguible de la estructural | Import. | En escala de grises las dos líneas se siguen distinguiendo. *BR‑ORG‑013* |
| RF‑ORG‑034 | Se exporta a **PNG, SVG e impresión o PDF**, y siempre **el organigrama entero a tamaño natural**, no el pedazo que se ve en pantalla | Oblig. | La exportación de una estructura de 200 puestos sale completa y legible |
| RF‑ORG‑035 | Se puede **importar la estructura desde una planilla**, con una plantilla de ejemplo descargable | Import. | Se revisa antes de escribir: se rechaza la fila mala nombrando el motivo, no la planilla entera |
| RF‑ORG‑036 | El organigrama tiene su propia configuración de presentación: **colores por unidad, niveles de mando y si los puestos muestran su código** | Deseable | Cambiar cómo se ve no toca el dato |
| RF‑ORG‑037 | Un cuadro **se abre a la ficha del nodo** | Oblig. | Mirar el dibujo y corregir el dato no son dos viajes distintos |
| RF‑ORG‑039 | Crear y editar desde el dibujo **pregunta lo mismo que la ficha** y guarda los mismos datos: son dos puertas a un solo formulario, no dos formularios | Oblig. | Un cargo creado desde el dibujo no queda sin cupo ni sin la jefatura de sus sillas. *BR‑ORG‑017* |

### 3.5 Requisitos no funcionales

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RNF‑ORG‑01 | **Una sola fuente.** Ningún módulo guarda su propia copia de sucursales o unidades: todos leen este árbol | Oblig. | Cero sucursales o unidades creadas fuera de este módulo. *BR‑ORG‑020* |
| RNF‑ORG‑02 | **Aislamiento por empresa.** Un nodo pertenece a un inquilino y no se ve desde otro, ni siquiera por su id | Oblig. | Verificado con pruebas explícitas entre empresas, del lado del servidor |
| RNF‑ORG‑03 | **Ids estables.** El id de un nodo no cambia nunca: apagar y volver a encender su nivel de estructura, o mover el nodo de sitio, no lo tocan | Oblig. | Es lo que permite que otro módulo lo guarde y lo siga encontrando |
| RNF‑ORG‑04 | **Escala de trabajo:** una empresa de hasta ~2.000 nodos lista, busca y dibuja sin degradarse de manera perceptible | Oblig. | Medición con datos de prueba en tabla y en lienzo |
| RNF‑ORG‑05 | **Los dos temas y el teclado.** Todo el módulo se recorre con tabulador, con el foco visible, y se lee igual en claro y en oscuro | Oblig. | Recorrido completo sin ratón, y contraste verificado en los dos temas |
| RNF‑ORG‑06 | **Idioma del cliente.** Ninguna etiqueta de nivel de estructura está escrita en el código de la pantalla: sale de la lista de la empresa | Oblig. | Es la condición para que Souly sea multipaís y multirubro |

**Lo que falta y hay que escribir.** El módulo no tiene todavía requisitos de **registro de actividad** —sin él, la tabla de 1.5 no se puede medir—, ni de **estados vacíos, carga y error**, ni de **permisos verificados en el servidor**. Los tres estaban en el PRD de agosto y se perdieron al reescribir. Están anotados en 6.7.

### 3.6 Cómo se escriben los textos

| Regla | Ejemplo |
| --- | --- |
| Llamar las cosas como las llama el usuario | «Depende de», no «nodo superior» |
| Y con la palabra que eligió la empresa | «Nueva faena», si eso es lo que la minera llama centro de trabajo |
| El error dice qué pasó y cómo se arregla | «Tiene 12 cargos adentro. Movelos antes de eliminar» |
| Las consecuencias se cuentan antes, no después | «Se mueven 3 unidades y 14 cargos» |
| El botón dice lo que hace | «Nueva sucursal», no «Agregar» |
| Un hueco con nombre no es un hueco | «De nadie: es la cima», no un campo vacío |

### 3.7 Fuera de alcance de esta versión

| # | Queda afuera | Por qué |
| --- | --- | --- |
| FUERA‑01 | **El histórico de la estructura** | Se guarda cómo está la organización, no cómo estaba en marzo. Un organigrama a fecha pasada es otro modelo —cada nodo con vigencia— y **no se puede agregar después sin migrar** |
| FUERA‑02 | **Presupuesto y costos por unidad** | La unidad de negocio agrupa para medir, pero lo que se mide no vive todavía en Souly |
| FUERA‑03 | **Aprobaciones** | Abrir un cargo o cerrar una sucursal no pasa por un flujo de autorización: quien tiene el rol, lo hace |
| FUERA‑04 | **Edición delegada por rama** | Hoy la estructura la edita Recursos Humanos y punto; que un líder pueda tocar su propia rama es una idea, no un requisito |
| FUERA‑05 | **Renombrar, reordenar y agregar niveles de estructura** | La escalera se enciende y se apaga, y nada más. Renombrar toca cada empresa por separado y reordenar puede dejar nodos colgando de un escalón que quedó debajo: son tres editores con su propia manera de romper el árbol, y el interruptor ya contesta la pregunta que trae a alguien a esa pantalla. **No hay que decidirlo ahora:** las etiquetas ya salen de la lista y no del código —RNF‑ORG‑06—, así que agregarlo después no migra nada |

**FUERA‑01 es el único de los cinco que hay que decidir ahora.** Los otros cuatro se pueden agregar cuando se quiera. El histórico no: si los nodos no nacen con vigencia, la pantalla futura no va a tener historia que mostrar y habrá que empezar a contar desde cero. Es la decisión con más consecuencias de todo el documento.

## 04 · Reglas de negocio

*Cuarenta y siete condiciones que el sistema valida siempre, en el orden en que una empresa arma su estructura: primero de qué escalones está hecha, después qué pone en cada uno. Todas se leen igual, en cuatro apartados: información básica, escenarios ágiles de ejecución, condiciones y excepciones, y trazabilidad.*

### Datos de la empresa

*La raíz del árbol: lo que la empresa dice de sí misma antes de tener estructura*

#### 4.1 · BR-ORG-036 · La empresa es la raíz del árbol y solo exige su nombre

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-036
- **Grupo:** Datos de la empresa
- **Nivel que gobierna:** Empresa
- **Estado:** Borrador

*Descripción general*

La empresa es el nodo raíz de la estructura: todo nodo que no declara nodo superior cuelga de ella —BR‑ORG‑001—. Es la primera pantalla del módulo y el primer paso de la puesta en marcha.

El único campo obligatorio es el **nombre comercial**, porque el organigrama lo imprime en su cabecera al exportar. La razón social, el NIT, el rubro, el contacto y las redes son opcionales y se completan cuando la empresa los tenga.

La dirección que registra esta ficha es la de la **casa matriz**. Las direcciones de cada oficina se registran en la sucursal y en el centro de trabajo.

**2. Escenarios ágiles de ejecución**

*Una empresa creada con lo mínimo*

- **Dado que** se está dando de alta una empresa nueva
- **Cuando** se escribe solo el nombre comercial y se guarda
- **Entonces** la raíz queda creada y ya se le pueden colgar regionales, sucursales y unidades
- **Y** el resto se completa después, sin bloquear la puesta en marcha

*El nombre sale en la exportación*

- **Dado que** la empresa se llama «FarmaVida»
- **Cuando** se exporta el organigrama
- **Entonces** ese nombre va en la cabecera del archivo
- **Y** por eso es el único campo que el sistema no deja vacío

*Las direcciones de cada oficina no van acá*

- **Dado que** la empresa tiene seis sucursales
- **Cuando** se completa Datos de la empresa
- **Entonces** se pide una sola dirección, la de la casa matriz
- **Y** la de cada sucursal se carga en su propia ficha, que es la que la usa

**3. Condiciones y excepciones**

- Sin nombre comercial el sistema no guarda la empresa. Ningún otro campo bloquea el guardado.
- Una empresa sin datos fiscales admite el alta de regionales, sucursales y unidades.
- Las direcciones de sucursales y centros de trabajo no se registran en esta ficha.
- El país declarado acá gobierna las listas de ciudades de cada alta —BR‑ORG‑037—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑023 · RF‑ORG‑034
- **Historia de usuario:** HU‑ORG‑02
- **Pantalla:** W‑05 Datos de la empresa
- **Diseño:** Prototipado

---

#### 4.2 · BR-ORG-037 · El país se declara una vez, en la empresa, y de él salen las ciudades

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-037
- **Grupo:** Datos de la empresa
- **Nivel que gobierna:** Empresa
- **Estado:** Borrador

*Descripción general*

El país se pregunta **en la empresa y en ningún otro sitio por defecto**. De él sale la lista de ciudades que se ofrece al crear regionales, sucursales y centros de trabajo, así que declararlo una vez ahorra contestarlo en cada alta.

No es una restricción: una sucursal en otro país puede declarar el suyo —BR‑ORG‑028—, y ahí la lista de ciudades cambia con él. Lo que la empresa aporta es **el valor con el que empieza cada alta**, correcto en la mayoría de los casos.

**2. Escenarios ágiles de ejecución**

*Las ciudades salen del país de la empresa*

- **Dado que** la empresa declaró «Bolivia»
- **Cuando** se crea una sucursal
- **Entonces** el desplegable de ciudades ofrece las bolivianas
- **Y** nadie tuvo que volver a elegir el país

*Una sede en otro país*

- **Dado que** la empresa es boliviana y abre una oficina en Argentina
- **Cuando** esa sucursal declara «Argentina» como su país
- **Entonces** sus ciudades salen del catálogo argentino
- **Y** la empresa y las demás sedes no cambian

*Sin país no hay ciudades que ofrecer*

- **Dado que** todavía no se declaró ningún país
- **Cuando** se abre el desplegable de ciudades
- **Entonces** el formulario pide primero el país y lo dice así
- **Y** el motivo es el que se lee en el campo: de él sale la lista de al lado

**3. Condiciones y excepciones**

- El país de la empresa es el valor con el que arranca cada alta; no impide declarar otro.
- Una sucursal o un centro de trabajo pueden declarar su propio país, y sus ciudades salen de ese catálogo —BR‑ORG‑028—.
- Sin país declarado el formulario no ofrece ciudades: pide primero el país y dice por qué.
- Cambiar el país de la empresa no reescribe las ciudades ya guardadas en otros nodos.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑020
- **Historia de usuario:** HU‑ORG‑02 · HU‑ORG‑03
- **Pantalla:** W‑05 Datos de la empresa
- **Diseño:** Prototipado

### Configuración

*De qué escalones está hecha esta empresa: lo primero que se decide y lo que gobierna a todo lo demás*

#### 4.3 · BR-ORG-004 · Cada empresa enciende los niveles de estructura que usa

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-004
- **Grupo:** Configuración
- **Alcance:** Toda la estructura
- **Estado:** Borrador

*Descripción general*

El esquema de niveles es un dato de la empresa, no una lista fija del producto. Empresa, unidad organizacional, cargo y puesto son **fijos** —sin ellos no hay organigrama que dibujar—; los demás se encienden y se apagan. Lo apagado no aparece en ningún formulario, filtro ni menú.

**2. Escenarios ágiles de ejecución**

*Apagar lo que no se usa*

- **Dado que** la empresa opera en una sola ciudad y no usa regiones
- **Cuando** apaga «Región» en Configuración
- **Entonces** el nivel de estructura desaparece de toda la aplicación
- **Y** encenderlo de nuevo más adelante no migra nada: solo vuelve a aparecer el escalón donde colgar cosas

*Un nivel con nodos dentro no se apaga*

- **Dado que** existen tres regiones en el árbol
- **Cuando** se intenta apagar «Región»
- **Entonces** el interruptor queda trabado y el contador dice tres
- **Y** dice cuántos nodos habría que mover antes: quedarían colgando de un escalón que dejó de existir

*Los cuatro fijos no tienen interruptor*

- **Dado que** se abre Configuración
- **Cuando** se busca el interruptor de «Unidad organizacional»
- **Entonces** no existe, en vez de existir y rechazar
- **Y** lo mismo empresa, cargo y puesto: sin ellos no hay organigrama que dibujar

**3. Condiciones y excepciones**

- Empresa, unidad organizacional, cargo y puesto no tienen interruptor: sin ellos no hay organigrama que dibujar.
- Un nivel con nodos dentro no se puede apagar; el sistema dice cuántos habría que mover antes —RF‑ORG‑003—.
- Un nivel apagado no aparece en ningún formulario, filtro ni menú.
- Volver a encender un nivel no migra datos: solo reaparece el escalón donde colgar nodos.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑001 · RF‑ORG‑002 · RF‑ORG‑003
- **Historia de usuario:** HU‑ORG‑01
- **Pantalla:** W‑04 Configuración de la organización
- **Diseño:** Prototipado

---

#### 4.4 · BR-ORG-038 · «Así queda tu organización» se rehace mientras se configura

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-038
- **Grupo:** Configuración
- **Ámbito:** Configuración de la empresa
- **Estado:** Borrador

*Descripción general*

La vista previa va **primera** en la pantalla y contesta «¿cómo queda mi organización?», que es la pregunta de quien entra a configurar. Se lee como **dos caminos, uno por dimensión** —Empresa › Sucursal › Centro de trabajo, y Empresa › Unidad de negocio › Unidad organizacional › Cargo › Puesto—, con los niveles encendidos y en orden.

Se rehace **en el momento**, antes de guardar: encender «Regional» la mete entre la empresa y la sucursal y se ve ahí mismo. La consecuencia de cada interruptor se ve en la misma pantalla, sin ir a buscarla al árbol.

Y los interruptores **se ajustan a lo que hay cargado**: un nivel con nodos dentro aparece encendido aunque la configuración guardada dijera lo contrario, para que nunca quede un nivel apagado con cosas adentro.

**2. Escenarios ágiles de ejecución**

*La consecuencia se ve antes de guardar*

- **Dado que** la empresa no usa regionales
- **Cuando** enciende «Regional» en la lista
- **Entonces** la vista previa de arriba pasa a decir Empresa › Regional › Sucursal › Centro de trabajo
- **Y** no hace falta salir al árbol para ver qué cambió

*Dos caminos, uno por dimensión*

- **Dado que** se abre Configuración
- **Cuando** se mira la vista previa
- **Entonces** muestra la cadena física y la organizacional por separado
- **Y** son dos recortes del mismo árbol, no dos árboles — *BR‑ORG‑005*

*Los interruptores siguen a los datos*

- **Dado que** se cargan datos que traen centros de trabajo y el nivel figuraba apagado
- **Cuando** se abre Configuración
- **Entonces** ese nivel aparece encendido
- **Y** nunca queda un nivel apagado con nodos adentro, que sería gente sin pantalla donde verse

**3. Condiciones y excepciones**

- La vista previa muestra el esquema resultante antes de guardar, no el guardado.
- Un nivel con nodos cargados aparece encendido aunque la configuración guardada diga lo contrario.
- La previa se lee como dos caminos, uno por dimensión, con los niveles encendidos y en orden.
- Salir sin guardar deja la configuración anterior: la previa no escribe nada.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑006
- **Historia de usuario:** HU‑ORG‑01
- **Pantalla:** W‑04 Configuración de la organización
- **Diseño:** Prototipado

### Los cimientos

*De qué está hecha la estructura, antes de hablar de ningún nivel*

#### 4.5 · BR-ORG-001 · Toda la estructura es un solo árbol de nodos

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-001
- **Grupo:** Los cimientos
- **Alcance:** Toda la estructura
- **Estado:** Borrador

*Descripción general*

Empresa, región, sucursal, centro de trabajo, unidad de negocio, unidad organizacional, cargo y puesto no son ocho tablas: son ocho **tipos** del mismo nodo. Cada uno declara qué **tipo** es y de qué **nodo superior** cuelga, y nada más. Es lo que permite que la estructura de una empresa no se parezca a la de la de al lado sin que haya que programar una pantalla nueva.

**2. Escenarios ágiles de ejecución**

*Una sucursal dentro de una región*

- **Dado que** existe la región «Oriente»
- **Cuando** se crea la sucursal «Casa Matriz» eligiendo «Oriente» en «Depende de»
- **Entonces** la sucursal queda guardada con su tipo y el id de su nodo superior
- **Y** aparece anidada bajo Oriente en la tabla y en cualquier pantalla que lea el árbol

*Un nodo de primer nivel*

- **Dado que** se crea una región y no se le elige nada en «Depende de»
- **Cuando** se guarda
- **Entonces** el nodo superior queda vacío, que significa «cuelga de la empresa»
- **Y** no es un error: es la respuesta de todo lo de primer nivel

*Un nivel más no es una tabla más*

- **Dado que** la empresa enciende «Centro de trabajo», que tenía apagado
- **Cuando** crea el primero
- **Entonces** se guarda con su tipo y su nodo superior, igual que los otros siete
- **Y** su lista, su menú y su «Depende de» salen del mismo sitio: nadie programó una pantalla para él

**3. Condiciones y excepciones**

- Cada nodo declara de qué tipo es y de qué nodo superior cuelga; no hay una tabla por tipo.
- Un nodo que no declara nodo superior cuelga de la empresa —BR‑ORG‑036—.
- Los ocho tipos comparten ficha, lista y menú de acciones —RF‑ORG‑020—.
- Agregar un tipo de nodo no exige una pantalla nueva.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑020 · RF‑ORG‑014
- **Historia de usuario:** HU‑ORG‑01
- **Pantalla:** W‑01 Estructura organizacional
- **Diseño:** Prototipado

---

#### 4.6 · BR-ORG-002 · La regla de jerarquía: el nodo superior siempre va por encima

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-002
- **Grupo:** Los cimientos
- **Alcance:** Toda la estructura
- **Estado:** Borrador

*Descripción general*

Los niveles de estructura están ordenados de lo más grande a lo más chico, y un nodo solo puede colgar de otro cuyo nivel de estructura esté **más arriba**. Es la única validación estructural del módulo, y de ella salen todas las demás: no hay que escribir «una región no puede ir dentro de un cargo», ya está prohibido.

**2. Escenarios ágiles de ejecución**

*Saltarse un nivel de estructura es legal*

- **Dado que** la empresa usa Región, Sucursal y Centro de trabajo
- **Cuando** se crea la sucursal «El Prado» colgando directamente de la empresa, sin región
- **Entonces** el sistema lo permite
- **Y** la sucursal se dibuja en primer nivel: la regla exige que el nodo superior esté por encima, no que sea el inmediato superior

*El desplegable no ofrece lo imposible*

- **Dado que** se está creando una unidad organizacional
- **Cuando** se abre el desplegable «Depende de»
- **Entonces** solo se ofrecen nodos de niveles superiores
- **Y** un cargo o un puesto no figuran: lo imposible no se ofrece, no se rechaza después

*Una unidad colgada de una sucursal*

- **Dado que** la empresa usa Sucursal y Unidad organizacional
- **Cuando** se crea la unidad «Ventas» eligiendo la sucursal «Casa Matriz»
- **Entonces** se permite: la sucursal está por encima
- **Y** es el punto donde la dimensión física y la organizacional se tocan

**3. Condiciones y excepciones**

- Un nodo solo cuelga de otro cuyo nivel esté más arriba en el orden del esquema.
- Saltarse un nivel intermedio es válido: la regla exige que el superior esté por encima, no que sea el inmediato.
- El desplegable «Depende de» solo ofrece nodos de niveles superiores encendidos —RF‑ORG‑022—.
- Es la única validación estructural del módulo: las demás prohibiciones salen de ella.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑022
- **Historia de usuario:** HU‑ORG‑04
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

---

#### 4.7 · BR-ORG-048 · Ningún nodo cuelga de sí mismo ni de los que cuelgan de él

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-048
- **Grupo:** Los cimientos
- **Alcance:** Toda la estructura
- **Estado:** Borrador

*Descripción general*

La regla de jerarquía —BR‑ORG‑002— compara **niveles**, y por eso no ve este caso: «Marketing dentro de Comercial» es válido, y «Comercial dentro de Marketing» también, cada uno por separado. Los dos a la vez forman un bucle, y las dos son unidades organizacionales, así que la validación de niveles los deja pasar.

Un nodo que cuelga de uno de sus descendientes **desprende esa rama del árbol**: deja de haber un camino desde la empresa hasta ella. El organigrama se dibuja desde la empresa hacia abajo, así que esa rama y su gente **desaparecen del dibujo**; y el sitio heredado, que sube buscando el primer ancestro físico —BR‑ORG‑006—, no encuentra dónde parar.

Se impide como ya se impide la jefatura circular: **el desplegable no ofrece lo que no se puede elegir**. «Depende de» deja fuera al propio nodo y a todo lo que cuelga de él, a cualquier profundidad. Lo imposible no se ofrece, en vez de ofrecerse y rechazar.

Vale igual **al crear, al editar, al mover una rama y al importar desde planilla**. En la importación nadie elige de una lista, así que ahí el bucle se detecta al revisar el archivo y se rechaza esa fila nombrando los dos nodos que lo arman, sin tirar la planilla entera —RF‑ORG‑035—.

**2. Escenarios ágiles de ejecución**

*La lista no ofrece la propia descendencia*

- **Dado que** Marketing está dentro de Comercial
- **Cuando** se abre «Depende de» en la ficha de Comercial
- **Entonces** Marketing no está en la lista, ni tampoco lo que cuelga de Marketing
- **Y** tampoco está Comercial: un nodo no cuelga de sí mismo

*Mover una rama dentro de sí misma*

- **Dado que** se está reorganizando y se arrastra Comercial hacia adentro de su propio equipo de Marketing
- **Cuando** se suelta ahí
- **Entonces** el destino no acepta el nodo y dice por qué: quedaría colgando de algo que cuelga de él
- **Y** la rama vuelve a donde estaba, sin cambios a medias

*Una planilla que arma el bucle*

- **Dado que** una planilla declara Comercial dentro de Marketing y Marketing dentro de Comercial
- **Cuando** se importa
- **Entonces** se rechaza esa fila nombrando los dos nodos que arman el bucle
- **Y** el resto del archivo se carga igual

**3. Condiciones y excepciones**

- Un nodo no puede colgar de sí mismo ni de ninguno de sus descendientes, a cualquier profundidad.
- El desplegable «Depende de» deja fuera al propio nodo y a toda su descendencia —RF‑ORG‑022—.
- Vale igual al crear, al editar, al mover una rama y al importar.
- La regla de jerarquía no cubre este caso: compara niveles, no parentesco —BR‑ORG‑002—.
- Es la misma idea que ya gobierna la jefatura, donde no se ofrecen los subordinados del propio puesto —BR‑ORG‑012—.
- En la importación el bucle se detecta antes de escribir y se rechaza esa fila, no el archivo entero.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑022 · RF‑ORG‑035
- **Historia de usuario:** HU‑ORG‑13
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Sin construir: el desplegable ya filtra por nivel y todavía no descarta la descendencia

---

#### 4.8 · BR-ORG-003 · El menú de «Agregar» se deduce, no se escribe

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-003
- **Grupo:** Los cimientos
- **Alcance:** Toda la estructura
- **Estado:** Borrador

*Descripción general*

Qué se puede crear en cada sitio sale de la regla de jerarquía cruzada con la dimensión de la pantalla. Nadie mantiene una lista de opciones por pantalla, así que un nivel de estructura encendido aparece donde corresponde el mismo día, y uno apagado desaparece de todas partes sin tocar una línea.

**2. Escenarios ágiles de ejecución**

*La pantalla ofrece lo suyo*

- **Dado que** se está en Estructura física, en la pestaña «Sucursales»
- **Cuando** se pulsa el botón de crear
- **Entonces** crea directamente una sucursal y el botón dice «Nueva sucursal»
- **Y** no se ofrece crear una unidad organizacional, que es del otra dimensión

*Un nivel apagado desaparece de todas partes*

- **Dado que** la empresa apagó «Centro de trabajo» en Configuración
- **Cuando** se recorre el módulo
- **Entonces** no aparece su pestaña, ni su entrada de menú, ni la opción en ningún «Depende de»
- **Y** las sucursales pasan a contener unidades organizacionales directamente

*Una vista que agrupa varios tipos pregunta*

- **Dado que** se está en una lista que mezcla más de un nivel
- **Cuando** se pulsa el botón de crear
- **Entonces** pregunta qué se quiere crear, con los que caben ahí
- **Y** en una lista de un solo tipo no pregunta: crea ese y el botón lo dice

**3. Condiciones y excepciones**

- Las opciones de «Agregar» salen de la regla de jerarquía cruzada con la dimensión de la pantalla.
- Un nivel encendido aparece en el menú el mismo día; uno apagado desaparece de todas las pantallas.
- En una vista de un solo tipo el botón crea ese tipo directamente —RF‑ORG‑014—.
- No hay lista de opciones mantenida a mano en ninguna pantalla.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑014
- **Historia de usuario:** HU‑ORG‑04
- **Pantalla:** W‑01 Estructura organizacional
- **Diseño:** Prototipado

---

#### 4.9 · BR-ORG-005 · Dos dimensiones, un solo árbol

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-005
- **Grupo:** Los cimientos
- **Alcance:** Toda la estructura
- **Estado:** Borrador

*Descripción general*

La **estructura física** —región, sucursal, centro de trabajo— contesta dónde está la empresa. La **estructura organizacional** —unidad de negocio, unidad organizacional, cargo— contesta cómo reparte el trabajo. No son dos árboles: son dos recortes del mismo, y cada pantalla lista solo los tipos de su dimensión.

**2. Escenarios ágiles de ejecución**

*Cada dimensión lista lo suyo*

- **Dado que** el árbol tiene regiones, sucursales, unidades y cargos
- **Cuando** se entra a Estructura física
- **Entonces** se listan solo los nodos de la dimensión física, anidados entre ellos
- **Y** una unidad organizacional que cuelga de una sucursal no rompe la lista: se salta al mostrarla, porque es del otra dimensión

*El menú no cruza dimensiones*

- **Dado que** se está en Estructura física
- **Cuando** se pulsa «Agregar»
- **Entonces** no se ofrece crear una unidad organizacional
- **Y** la pantalla crea lo suyo: es una lista de la dimensión física

*La ficha sí cruza, y a propósito*

- **Dado que** se abre la ficha de una unidad organizacional
- **Cuando** se elige de qué cuelga
- **Entonces** se ofrecen sucursales y centros de trabajo, que son de la otra dimensión
- **Y** acá el cruce es deliberado: ya se eligió de qué se está hablando

**3. Condiciones y excepciones**

- Las dos dimensiones son recortes del mismo árbol: un nodo no se duplica en la otra.
- Cada pantalla lista solo los tipos de su dimensión —RF‑ORG‑010—.
- El cargo es donde las dos dimensiones se tocan —BR‑ORG‑010—.
- Un filtro de la dimensión física recorta la vista organizacional, no la borra —BR‑ORG‑033—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑010
- **Historia de usuario:** HU‑ORG‑03 · HU‑ORG‑04
- **Pantalla:** W‑01 Estructura organizacional
- **Diseño:** Prototipado

### Estructura física

*Regiones, sucursales y centros de trabajo: dónde está la empresa y qué exige cada nivel*

#### 4.10 · BR-ORG-025 · La regional agrupa y no depende de nada

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-025
- **Grupo:** Estructura física
- **Nivel que gobierna:** Regional
- **Estado:** Borrador

*Descripción general*

La regional es el nivel más alto del eje físico: ningún nivel está por encima de ella, y por eso su ficha no incluye el campo «Depende de». Su función es agrupar sucursales; no interviene en la línea de mando, en la facturación ni en la liquidación.

Sus campos obligatorios son **nombre, país, ciudad y estado**. El código, el responsable, la dirección, el teléfono y el correo son opcionales: el responsable puede no estar dado de alta todavía y el teléfono puede no existir. Una regional incompleta ya sirve para colgarle sucursales, que es para lo que se la crea.

Los parámetros de nómina —orden para planillas, dirección para liquidaciones— son datos de sueldos y no se registran en esta ficha.

**2. Escenarios ágiles de ejecución**

*Una regional que todavía no tiene responsable*

- **Dado que** se crea la «Regional Oriente» con su país y su ciudad
- **Cuando** se guarda sin responsable, sin teléfono y sin correo
- **Entonces** la regional queda creada y ya se le pueden colgar sucursales
- **Y** esos campos se completan más adelante, cuando la empresa los sepa

*No pregunta de qué cuelga*

- **Dado que** se crea una regional
- **Cuando** se mira su ficha
- **Entonces** no hay ningún campo «Depende de»
- **Y** no hay nivel por encima al que ofrecerle

*Sin nombre no se guarda*

- **Dado que** se llenan país y ciudad y se deja el nombre vacío
- **Cuando** se intenta guardar
- **Entonces** el sistema nombra el campo y su razón: sin nombre no hay forma de elegirla al colgarle una sucursal
- **Y** no guarda hasta que se escriba

**3. Condiciones y excepciones**

- La ficha no ofrece campo «Depende de»: la regla de jerarquía no admite ningún nivel por encima —BR‑ORG‑002—.
- Los campos opcionales no bloquean el alta; solo el nombre, el país, la ciudad y el estado lo hacen.
- El nivel «Regional» puede estar apagado en Configuración, y entonces las sucursales cuelgan de la empresa —BR‑ORG‑004—.
- Los parámetros de nómina se administran en el módulo de sueldos, no en esta pantalla.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑020 · RF‑ORG‑023
- **Historia de usuario:** HU‑ORG‑03
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

---

#### 4.11 · BR-ORG-026 · La sucursal es la sede; el centro de trabajo es el domicilio

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-026
- **Grupo:** Estructura física
- **Nivel que gobierna:** Sucursal y centro de trabajo
- **Estado:** Borrador

*Descripción general*

Son dos niveles y contestan dos preguntas distintas. La **sucursal** es la sede: la unidad con la que la empresa se presenta en una ciudad, y es lo que hereda todo lo que cuelga de ella. El **centro de trabajo** es el sitio físico donde la gente trabaja, y su domicilio **es el que sale en los papeles laborales**: es el nivel donde de verdad se sabe dónde está una persona.

Por eso el centro pide una cosa que la sucursal no: **qué clase de sitio es** —oficina, planta, almacén, taller, obra, tienda u otro—, y es obligatorio. Sin el tipo, un almacén y una oficina se leen igual en toda la aplicación.

Una empresa que no separe sus centros de trabajo apaga ese nivel y su gente queda ubicada en la sucursal, que ahí pasa a ser las dos cosas. Es la decisión de BR‑ORG‑004, y por eso el centro de trabajo no es obligatorio para nadie.

**2. Escenarios ágiles de ejecución**

*Un depósito dentro de una sucursal*

- **Dado que** existe la sucursal «Casa Matriz» en Santa Cruz
- **Cuando** se crea el centro de trabajo «Depósito Norte» dentro de ella, de tipo «Almacén»
- **Entonces** el depósito guarda su propio domicilio, que es el que va en los papeles de quien marca ahí
- **Y** la sucursal sigue siendo la sede: lo que cuelga del depósito hereda las dos cosas

*El tipo de centro es obligatorio*

- **Dado que** se crea un centro de trabajo con su nombre y su domicilio
- **Cuando** se guarda sin elegir de qué clase de sitio se trata
- **Entonces** el sistema lo pide: sin el tipo, un almacén y una oficina se leen igual en toda la aplicación
- **Y** no guarda hasta que se elija

*Una empresa que no separa centros*

- **Dado que** toda la gente de la empresa marca en la propia sucursal
- **Cuando** apaga «Centro de trabajo» en Configuración
- **Entonces** la sucursal pasa a ser las dos cosas: la sede y el domicilio
- **Y** nadie tiene que crear un centro por cada sucursal para que la estructura cierre

**3. Condiciones y excepciones**

- El centro de trabajo exige qué clase de sitio es —oficina, planta, almacén, taller, obra, tienda u otro—; la sucursal no lo pide.
- El domicilio del centro de trabajo es el que sale en los papeles laborales.
- Una empresa que no separa sus centros apaga ese nivel y su gente queda ubicada en la sucursal —BR‑ORG‑004—.
- El centro de trabajo no es obligatorio para ninguna empresa.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑026 · RF‑ORG‑023
- **Historia de usuario:** HU‑ORG‑03
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

---

#### 4.12 · BR-ORG-027 · Un centro de trabajo se ubica con tres listas que se acotan entre sí

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-027
- **Grupo:** Estructura física
- **Nivel que gobierna:** Centro de trabajo
- **Estado:** Borrador

*Descripción general*

La ficha pregunta por **regional, sucursal y centro superior** en tres campos separados, y **los tres son opcionales**: un centro puede colgar directo de la empresa. Preguntarlo así tiene un riesgo evidente —contestar «Occidente» y «Equipetrol», que está en Oriente— y son tres respuestas para una sola pregunta, sin forma de saber cuál vale.

Se resuelve **acotando la lista, no prohibiendo el campo**: elegida una regional, «Sucursal» solo ofrece las suyas; elegida una sucursal, «Centro superior» solo ofrece los que están dentro. Los tres campos existen y ninguna combinación imposible se puede siquiera elegir.

Lo que se guarda es **el más específico de los tres**, que es de quien cuelga en el árbol; los otros dos quedaron de camino y no son un dato aparte. Un campo cuyo nivel la empresa no usa no aparece: sin regionales creadas, «Regional» sería un desplegable con una sola opción y el nombre de un escalón que esta empresa apagó.

«Ninguna» es **una opción de la lista** y no un marcador gris. Elegida por error una sucursal, tiene que haber forma de volver a dejarlo vacío; y elegida a propósito, «Ninguna» dice algo distinto de un campo en blanco: en blanco es «no lo contesté», elegido es «este centro no cuelga de ninguna regional».

**2. Escenarios ágiles de ejecución**

*La sucursal se acota por su regional*

- **Dado que** se está creando un centro de trabajo y se elige la regional «Oriente»
- **Cuando** se abre el desplegable «Sucursal»
- **Entonces** solo se ofrecen las sucursales de Oriente
- **Y** el centro queda colgado de la sucursal elegida, que es la más específica de las tres respuestas

*Volver a dejarlo en «Ninguna»*

- **Dado que** se eligió una sucursal por error
- **Cuando** se abre la lista otra vez
- **Entonces** «Ninguna» está entre las opciones y se puede elegir
- **Y** elegida a propósito dice algo distinto de un campo en blanco: es «no cuelga de ninguna», no «no lo contesté»

*Un nivel que la empresa no usa no aparece*

- **Dado que** la empresa no tiene ninguna regional creada
- **Cuando** se crea un centro de trabajo
- **Entonces** el campo «Regional» no está, y quedan dos listas en vez de tres
- **Y** no se ofrece un desplegable con una sola opción y el nombre de un escalón que esta empresa no usa

**3. Condiciones y excepciones**

- Los tres campos —regional, sucursal y centro superior— son opcionales: un centro puede colgar directo de la empresa.
- Cada lista se acota con la anterior: elegida una regional, «Sucursal» solo ofrece las suyas.
- Se guarda el más específico de los tres; los otros dos no son un dato aparte.
- Un campo cuyo nivel la empresa apagó no aparece en la ficha.
- «Ninguna» es una opción de la lista y significa algo distinto de dejar el campo en blanco.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑026 · RF‑ORG‑022
- **Historia de usuario:** HU‑ORG‑03
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

---

#### 4.13 · BR-ORG-028 · La dirección sale de catálogos, y solo hasta donde el catálogo alcanza

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-028
- **Grupo:** Estructura física
- **Nivel que gobierna:** Regional, sucursal y centro de trabajo
- **Estado:** Borrador

*Descripción general*

País, departamento y ciudad se eligen de listas y **cada una acota a la siguiente**: del país sale la lista de ciudades, y con departamento elegido salen solo las suyas. Dos listas sueltas dejarían guardar «Departamento: La Paz · Ciudad: Sucre»; acotadas, esa combinación no se puede ni elegir.

**El departamento solo aparece donde esa división existe con ese nombre.** Traducir el rótulo país por país —Provincia en Argentina, Estado en México— trae dos problemas: en Chile la división se llama «Región», y esa palabra ya es un nivel de esta estructura, así que dos «regiones» en el mismo formulario se confunden aunque las dos estén bien; y traducir el rótulo no traduce el dato, que sigue siendo texto libre y sigue sin agrupar nada. Donde no aplica, el campo no sale.

Provincia, municipio y localidad **no se piden**. Eran la mitad de los campos exigidos para dar de alta un depósito y no agrupan nada: «Santa Cruz» y «Sta. Cruz» son dos sitios distintos para una máquina. Queda la ciudad, que sí sale de un catálogo, y la dirección escrita.

**2. Escenarios ágiles de ejecución**

*Una sucursal fuera de Bolivia*

- **Dado que** se crea una sucursal y se elige «Argentina» como país
- **Cuando** se mira la tarjeta de ubicación
- **Entonces** el campo «Departamento» no aparece y país y ciudad se reparten la fila
- **Y** la ciudad se elige del catálogo del país, no se escribe a mano

*La ciudad se acota por el departamento*

- **Dado que** se elige «La Paz» como departamento
- **Cuando** se abre la lista de ciudades
- **Entonces** solo se ofrecen las de La Paz
- **Y** «Departamento: La Paz · Ciudad: Sucre» no se puede ni elegir

*Lo que se elige y lo que se escribe*

- **Dado que** se completa la ubicación de una sucursal
- **Cuando** se llega a «Dirección»
- **Entonces** es texto libre: no hay catálogo que pueda contener una dirección
- **Y** la ciudad de al lado sí sale de uno, que es lo que permite agrupar por zona

**3. Condiciones y excepciones**

- País, departamento y ciudad se eligen de listas, y cada una acota a la siguiente.
- El departamento solo aparece donde esa división existe con ese nombre; donde no aplica, el campo no sale.
- Provincia, municipio y localidad no se piden: quedan la ciudad de catálogo y la dirección escrita.
- Una sucursal puede declarar un país distinto del de la empresa —BR‑ORG‑037—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑023
- **Historia de usuario:** HU‑ORG‑03
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

### Unidades de negocio

*La línea a la que pertenece cada parte de la empresa*

#### 4.14 · BR-ORG-022 · La unidad de negocio no es un padre: se declara en un nivel y se hereda

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-022
- **Grupo:** Unidades de negocio
- **Nivel que gobierna:** Unidad de negocio
- **Estado:** Borrador

*Descripción general*

Una unidad de negocio —«Farmacias», «Institucional», «Distribución»— es una **etiqueta que reparte** la empresa, no un escalón del que cuelguen las cosas. No tiene nada dentro: lo que hace es marcar a qué línea pertenece cada parte de la estructura.

Cada empresa la declara en **un solo escalón**, el que le sirve —un holding en sus regionales, una cadena en sus sucursales, una consultora en sus áreas—. La escalera de abajo es idéntica en los tres casos: lo único que cambia es dónde se pega la etiqueta. Elegido el escalón, los de más abajo la **leen y no la eligen**: su ficha la muestra y dice de dónde sale, así que mezclar dos niveles no es algo que haya que prohibir —no se puede hacer—.

Pide **solo nombre y estado**: no tiene código ni descripción, porque no es un sitio ni un área, sino una manera de partir la empresa en líneas.

> **Figura · La escalera es la misma; lo único que cambia es en qué escalón se pega la etiqueta. Un holding reparte por regionales, una cadena de farmacias por sucursales, una consultora por áreas. Elegido el escalón, todo lo que cuelga la hereda y no se le vuelve a preguntar.** — el dibujo está en la versión HTML de este documento.

Los cargos y los puestos nunca la declaran, solo la muestran. La suya es la de su rama, y cambiar la de la sucursal cambia la de todo lo que cuelga sin tocar un registro.

**2. Escenarios ágiles de ejecución**

*Empresa A · la pega en sus regionales*

- **Dado que** un holding reparte su negocio por zonas y usa las tres capas físicas
- **Cuando** declara «Farmacias» en la **Regional Oriente**
- **Entonces** las sucursales de Oriente la heredan, y los centros de trabajo de esas también
- **Y** la ficha de cada uno la muestra y dice de qué regional sale: ninguno la elige

*Empresa B · la pega en sus sucursales*

- **Dado que** una cadena de farmacias tiene regionales pero no reparte por ellas
- **Cuando** declara «Institucional» en la sucursal **Casa Matriz**
- **Entonces** sus centros de trabajo la heredan, y la regional queda sin unidad de negocio
- **Y** la escalera es la misma que en la empresa A: lo único que cambió es en qué escalón se pega la etiqueta

*Empresa C · la pega en sus áreas*

- **Dado que** una consultora reparte por áreas y no por geografía
- **Cuando** declara «Servicios» en el área **Consultoría**
- **Entonces** sus cargos la heredan, y los puestos de esos cargos también
- **Y** ni los cargos ni los puestos la declaran nunca: solo la muestran

**3. Condiciones y excepciones**

- Cada empresa declara la unidad de negocio en un solo escalón; los de más abajo la heredan y no la eligen.
- La unidad de negocio no tiene nodos dentro: no es un escalón del que cuelguen cosas.
- Pide solo nombre y estado: no tiene código ni descripción.
- La ficha de un nodo que la hereda la muestra y dice de qué nodo sale.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑020
- **Historia de usuario:** HU‑ORG‑05
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

---

#### 4.15 · BR-ORG-039 · Lo que agrupa una unidad de negocio se ve, pero no se asigna desde ahí

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-039
- **Grupo:** Unidades de negocio
- **Nivel que gobierna:** Unidad de negocio
- **Estado:** Borrador

*Descripción general*

Su ficha muestra **qué declaró pertenecerle** —cuántos y cuáles—, y esa tarjeta es de solo lectura. La asignación se hace desde la ficha de cada uno, en su campo «A qué negocio pertenece», que es la pantalla donde ese dato se conoce.

Habilitar también la asignación desde acá sería **una segunda entrada para el mismo dato**, y dos entradas para un dato terminan discrepando. Verlo junto sí hace falta —es la única forma de contestar «¿qué abarca esta línea?»— y por eso se muestra sin poder tocarse.

Es la misma forma que ya usa la unidad organizacional con sus apoyos funcionales: se declara donde se sabe, y se lee donde se pregunta.

**2. Escenarios ágiles de ejecución**

*Qué abarca una línea*

- **Dado que** tres sucursales declararon pertenecer a «Farmacias»
- **Cuando** se abre la ficha de esa unidad de negocio
- **Entonces** las lista, y dice que lo que cuelga de cada una la hereda
- **Y** ninguna se puede agregar ni quitar desde ahí

*Una línea que todavía no agrupa nada*

- **Dado que** se acaba de crear la unidad de negocio «Distribución»
- **Cuando** se abre su ficha
- **Entonces** dice que todavía nadie declaró pertenecer a esa línea
- **Y** no es un error: la línea existe antes de que se le asigne nada

*Se asigna donde uno está cuando lo sabe*

- **Dado que** se está creando la sucursal «Casa Matriz»
- **Cuando** se llega a «A qué negocio pertenece»
- **Entonces** ahí se elige «Farmacias»
- **Y** la ficha de Farmacias pasa a listarla, sin que nadie la haya agregado desde allá

**3. Condiciones y excepciones**

- La tarjeta que lista lo que agrupa es de solo lectura.
- La asignación se hace desde la ficha de cada nodo, en su campo «A qué negocio pertenece».
- No hay una segunda puerta para el mismo dato.
- Es la misma forma que usa la unidad organizacional con sus apoyos funcionales —BR‑ORG‑013—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑020 · RF‑ORG‑021
- **Historia de usuario:** HU‑ORG‑05
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

### Unidades organizacionales

*Áreas, gerencias, departamentos y equipos: cómo se reparte el trabajo*

#### 4.16 · BR-ORG-023 · Una unidad dice dentro de qué está y qué puesto la manda

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-023
- **Grupo:** Unidades organizacionales
- **Nivel que gobierna:** Unidad organizacional
- **Estado:** Borrador

*Descripción general*

Son **dos preguntas y se contestan por separado**, porque tienen respuestas distintas.

**«Depende de» dice dentro de qué está.** Una unidad organizacional **sí se anida en otra unidad**: una gerencia dentro de una dirección, un equipo dentro de esa gerencia, con tantos escalones como la empresa tenga. También puede estar directamente dentro de una sucursal, de un centro de trabajo o de la empresa. La tabla dibuja ese anidamiento con sangría, y el organigrama lo dibuja como áreas dentro de áreas.

**«Bajo el mando de» dice qué puesto la manda**, y es de ahí de donde sale la línea del dibujo. Sin ese dato, la unidad y todo lo que tiene adentro quedan sueltos: se ven como si no dependieran de nadie, aunque estén perfectamente anidados.

Anidarse no es depender. «Marketing Digital» está dentro de «Marketing» y responde al Líder de Marketing, que es un puesto de Marketing; una unidad de primer nivel está dentro de la empresa y responde al Gerente General. En el dibujo, las cajas de las áreas se anidan unas en otras y las líneas salen de los puestos.

Su **cabeza** —el cargo de la unidad que no le responde a nadie de adentro— se deduce y no se declara: es quien manda ahí, y por eso la ficha lo muestra sin preguntarlo.

**2. Escenarios ágiles de ejecución**

*Un área colgada de su gerencia*

- **Dado que** existe la unidad «Ventas» y el puesto «Gerente General»
- **Cuando** se declara al Gerente General en «Bajo el mando de» de Ventas
- **Entonces** la rama entera de Ventas se dibuja colgando de ese puesto
- **Y** la ficha muestra como cabeza de Ventas al cargo que no le responde a nadie de adentro, sin pedir que se lo declare

*Un área dentro de otra área*

- **Dado que** la empresa tiene «Marketing Digital» dentro de «Marketing», y «Marketing» dentro de «Dirección Comercial»
- **Cuando** se elige «Marketing» en el «Depende de» de Marketing Digital
- **Entonces** queda anidada ahí, con la sangría que le corresponde en la tabla
- **Y** a quién responde es otra pregunta: se declara aparte, y en su caso es el Líder de Marketing

*La cabeza no se declara*

- **Dado que** la unidad «Ventas» tiene doce cargos
- **Cuando** se abre su ficha
- **Entonces** muestra como cabeza al único que no le responde a nadie de adentro
- **Y** nadie lo eligió: se lee del árbol, y por eso no queda viejo cuando alguien mueve un cargo

**3. Condiciones y excepciones**

- «Depende de» y «Bajo el mando de» son dos campos distintos y se contestan por separado.
- Una unidad se anida en otra unidad, en una sucursal, en un centro de trabajo o en la empresa.
- Sin «Bajo el mando de», la unidad y todo lo que tiene adentro se dibujan sueltos.
- La cabeza de la unidad se deduce del árbol y no se declara.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑022
- **Historia de usuario:** HU‑ORG‑04
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

---

#### 4.17 · BR-ORG-006 · El sitio se declara una vez y baja por la rama

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-006
- **Grupo:** Unidades organizacionales
- **Nivel que gobierna:** Unidad organizacional
- **Estado:** Borrador

*Descripción general*

Una unidad organizacional declara **en qué región, sucursal o centro de trabajo está**, y ese sitio vale para ella y para todo lo que cuelgue de ella. Las de más abajo no lo vuelven a contestar: su ficha muestra el heredado y, al lado, de qué unidad sale.

Declarar uno propio en una unidad de más abajo no contradice a su rama: la **afina** —«Almacén La Paz» dentro de «Logística», que está en Casa Matriz— y desde ahí manda el nuevo hacia abajo. No declarar ninguno significa «toda la empresa», que es la respuesta de una unidad que no está atada a ninguna sede.

Por eso la columna «Sucursal» tiene dato en unidades y cargos que nunca lo escribieron, y por eso mover una rama de sitio corrige el de todo lo que cuelga de ella sin tocar un solo registro.

**2. Escenarios ágiles de ejecución**

*Una subunidad hereda el sitio de su rama*

- **Dado que** la unidad «Ventas» declara que está en «Casa Matriz»
- **Cuando** se crea la subunidad «Preventa» dentro de Ventas
- **Entonces** su ficha muestra «Casa Matriz» sin que nadie lo haya escrito, y al lado dice «Heredado de Ventas»
- **Y** la tabla la lista en Casa Matriz, igual que a los cargos que cuelgan de ella

*Una subunidad declara el suyo*

- **Dado que** «Logística» está en Casa Matriz
- **Cuando** «Almacén La Paz», dentro de ella, declara la sucursal La Paz
- **Entonces** ese pasa a valer para el almacén y para todo lo que cuelgue de él
- **Y** Logística no cambia: la rama de más abajo se afina, no contradice

*Una unidad que no está atada a ninguna sede*

- **Dado que** ni la unidad ni ninguna de su rama declara un sitio
- **Cuando** se mira su ficha
- **Entonces** dice «Toda la empresa»
- **Y** no es un dato faltante: es la respuesta de una unidad que vale para todas las sedes

**3. Condiciones y excepciones**

- El sitio declarado en una unidad vale para ella y para todo lo que cuelgue de ella.
- Una unidad de más abajo puede declarar el suyo propio, y desde ahí manda el nuevo hacia abajo.
- No declarar ninguno significa «toda la empresa».
- Mover una rama de sitio corrige el sitio de todo lo que cuelga sin tocar otro registro.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑012
- **Historia de usuario:** HU‑ORG‑04
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

### Cargos

*El rol: qué se hace, dentro de qué unidad y con cuántas sillas*

#### 4.18 · BR-ORG-007 · El cargo es el rol; el puesto es la silla

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-007
- **Grupo:** Cargos
- **Nivel que gobierna:** Cargo y puesto
- **Estado:** Borrador

*Descripción general*

El **cargo** define qué se hace —nombre, unidad, nivel de mando, tipo, descripción— y existe una sola vez. El **puesto** es una silla concreta de ese cargo: tiene su código, su sitio de trabajo, su jefatura y su ocupante. Nueve «Vendedor» son **un cargo con nueve puestos**, no nueve cargos.

Que sean uno solo es lo que permite que sus sillas se repartan entre dos jefaturas sin partir el rol en dos: nueve vendedores, seis bajo la Coordinadora de Ventas y tres bajo la Supervisora de Supermercados, siguen siendo el mismo «Vendedor» en el catálogo, con la misma descripción y la misma banda salarial. BR‑ORG‑012.

**2. Escenarios ágiles de ejecución**

*Renombrar el rol*

- **Dado que** el cargo «Vendedor» tiene nueve puestos abiertos, repartidos entre dos jefaturas
- **Cuando** se lo renombra a «Asesor Comercial»
- **Entonces** los nueve puestos pasan a llamarse así, los de las dos jefaturas
- **Y** no hay forma de que queden dos roles que en realidad son uno

*Un cargo definido y sin sillas*

- **Dado que** se aprueba el cargo «Analista de Datos» y todavía no hay presupuesto para la plaza
- **Cuando** se guarda sin abrir ninguna
- **Entonces** el cargo existe en el catálogo, con su unidad y su nivel de mando
- **Y** es un estado válido y frecuente, no un cargo a medio cargar

*Nueve sillas son una fila, no nueve*

- **Dado que** el cargo «Vendedor» tiene nueve plazas abiertas
- **Cuando** se mira la lista de cargos
- **Entonces** figura una sola fila, con sus nueve sillas desplegables debajo
- **Y** no nueve definiciones que haya que mantener iguales a mano

**3. Condiciones y excepciones**

- El cargo existe una sola vez; el puesto es cada silla de ese cargo.
- El puesto no tiene nombre propio: se llama como su cargo —RF‑ORG‑024—.
- Las sillas de un mismo cargo pueden responder a jefaturas distintas sin partir el rol —BR‑ORG‑012—.
- El puesto no tiene lista propia: se ve desplegando su cargo —RF‑ORG‑016—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑016 · RF‑ORG‑024 · RF‑ORG‑025
- **Historia de usuario:** HU‑ORG‑06
- **Pantalla:** W‑07 El cargo y sus plazas
- **Diseño:** Prototipado

---

#### 4.19 · BR-ORG-008 · Un cargo pertenece a una unidad; su línea de mando sale de sus sillas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-008
- **Grupo:** Cargos
- **Nivel que gobierna:** Cargo
- **Estado:** Borrador

*Descripción general*

La regla de jerarquía le permitiría colgar de una sucursal o de una región —están más arriba— y eso lo sacaría del organigrama. Un cargo pertenece a una unidad: ahí está su jefe, su presupuesto y su evaluación. Dónde se trabaja lo dice el puesto, que es otra cosa.

**«Cuelga de» quiere decir dos cosas, y esta regla habla de una.** En el **árbol** un cargo cuelga de su unidad, y es el único nodo superior que se le ofrece: eso es a qué área pertenece. En el **dibujo** el cuadro de un cargo aparece debajo del cuadro de otro cargo, y eso es la línea de mando, que no sale de acá: sale de **a quién responden sus sillas**, una por una —BR‑ORG‑012—. Por eso la tabla de Cargos tiene las dos columnas, «Pertenece a» y «Depende de», y dicen cosas distintas.

Se contestan por separado porque tienen respuestas distintas. El cargo «Vendedor» pertenece a Ventas y tiene nueve sillas repartidas entre dos jefaturas: en el árbol es **uno solo** colgando de Ventas, y en el dibujo sus cuadros salen de **dos sitios**. La columna «Depende de» de la tabla lo dice tal cual —«2 jefaturas»—, porque no la guarda: la lee de las sillas.

**2. Escenarios ágiles de ejecución**

*Cargo dentro de su unidad*

- **Dado que** existe la unidad «Recursos Humanos»
- **Cuando** se crea el cargo «Analista de Nóminas» eligiéndola
- **Entonces** el cargo queda dentro de esa rama del organigrama
- **Y** la unidad es obligatoria: sin ella no hay dónde dibujarlo

*Sin ninguna unidad todavía*

- **Dado que** la empresa recién empieza y no tiene ninguna unidad organizacional
- **Cuando** se intenta crear un cargo
- **Entonces** la opción está bloqueada
- **Y** el motivo se dice en el sitio: primero hace falta una unidad donde ponerlo

*Un cargo debajo de otro cargo*

- **Dado que** el cargo «Vendedor» pertenece a Ventas y seis de sus nueve sillas responden a la Coordinadora de Ventas
- **Cuando** se mira el organigrama
- **Entonces** esos seis cuadros aparecen colgando del cuadro de la coordinadora, y los otros tres del de la supervisora
- **Y** en el árbol sigue colgando de Ventas: son dos preguntas distintas y el desplegable de esta regla solo ofrece unidades

**3. Condiciones y excepciones**

- El único nodo superior que se le ofrece a un cargo es una unidad organizacional.
- La línea del dibujo no sale del árbol: sale de a quién responde cada silla —BR‑ORG‑012—.
- La tabla de cargos muestra «Pertenece a» y «Depende de» como dos columnas distintas.
- Un cargo con sillas en dos jefaturas muestra «2 jefaturas»: no es un dato guardado, se lee de las sillas.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑022 · RF‑ORG‑029
- **Historia de usuario:** HU‑ORG‑06 · HU‑ORG‑07
- **Pantalla:** W‑07 El cargo y sus plazas
- **Diseño:** Prototipado

---

#### 4.20 · BR-ORG-009 · El cupo del cargo es un techo, no una orden de creación

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-009
- **Grupo:** Cargos
- **Nivel que gobierna:** Cargo
- **Estado:** Borrador

*Descripción general*

«Máximo de ocupantes» declara **hasta cuántas personas pueden ocupar ese cargo a la vez**. Es el cupo aprobado, y puede ser mayor que las sillas abiertas hoy: dejarlo vacío significa «sin límite», que es el caso de la mayoría de los cargos.

**2. Escenarios ágiles de ejecución**

*Un cupo mayor que las sillas abiertas*

- **Dado que** el cargo «Ejecutivo Comercial» tiene cupo 5 y tres sillas abiertas
- **Cuando** se mira la lista de cargos
- **Entonces** se despliegan las tres sillas, con su código y su ocupante
- **Y** el cargo admite dos más sin volver a pedir la aprobación del cupo

*El cupo no abre nada por sí solo*

- **Dado que** se crea un cargo con cupo cuatro
- **Cuando** se guarda
- **Entonces** no se crea ningún puesto
- **Y** el cargo queda definido y admitiendo hasta cuatro, que se abren cuando alguien las abra

*Bajar el cupo por debajo de lo abierto*

- **Dado que** el cargo tiene cinco sillas abiertas
- **Cuando** se pone el tope en tres
- **Entonces** el sistema avisa que sobran dos y no guarda hasta que se eliminen
- **Y** las sillas siguen ahí: un techo por debajo del piso no las cierra ni las deja sin efecto

**3. Condiciones y excepciones**

- Dejar el cupo vacío significa «sin límite», que es el caso de la mayoría de los cargos.
- El cupo puede ser mayor que las sillas abiertas hoy: declararlo no crea puestos.
- El cupo no se puede bajar por debajo de los puestos ya abiertos.
- Cupo y plazas abiertas son dos datos distintos —RF‑ORG‑025—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑025
- **Historia de usuario:** HU‑ORG‑06
- **Pantalla:** W‑07 El cargo y sus plazas
- **Diseño:** Prototipado

---

#### 4.21 · BR-ORG-014 · Los tres tipos de cargo se declaran, y dos de ellos no mandan

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-014
- **Grupo:** Cargos
- **Nivel que gobierna:** Cargo
- **Estado:** Borrador

*Descripción general*

Hay tres tipos de cargo y se **declaran**, no se deducen. **Regular** (o de línea): puesto interno en planilla que forma parte de la jerarquía vertical —manda o reporta directamente—. **Staff** (asesoría o soporte): puesto interno en planilla que da soporte o asistencia a una dirección desde el costado, sin gente a su cargo. **Externo** (outsourcing): puesto cubierto por un prestador externo, que no genera planilla ni asistencia.

Los dos últimos se dibujan **al costado** de la línea de mando, así que preguntarles a qué altura mandan no tiene respuesta posible: el campo «Nivel de mando» no aparece en su formulario.

**2. Escenarios ágiles de ejecución**

*Un cargo de staff*

- **Dado que** se marca un cargo como «Staff»
- **Cuando** se mira el formulario
- **Entonces** el campo «Nivel de mando» desaparece
- **Y** el cuadro se dibuja al costado de su jefe, sin nada colgando debajo

*Un cargo externo*

- **Dado que** se marca un cargo como «Externo»
- **Cuando** se mira el organigrama
- **Entonces** se dibuja al costado de la línea, con su color propio y su línea punteada
- **Y** no genera planilla ni asistencia: lo cubre un prestador

*Jefe no es un tipo*

- **Dado que** un puesto tiene otros colgando de él
- **Cuando** se mira de qué tipo es
- **Entonces** sigue diciendo «Regular»
- **Y** «jefe» no se declara: se lee del árbol, y por eso nunca queda viejo cuando alguien mueve a otro de lugar

**3. Condiciones y excepciones**

- El tipo de cargo se declara; no se deduce del árbol.
- Staff y externo se dibujan al costado de la línea de mando —RF‑ORG‑032—.
- El campo «Nivel de mando» no aparece en el formulario de un cargo staff ni de uno externo.
- El catálogo de tipos se administra en Configuración —RF‑ORG‑007—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑007 · RF‑ORG‑032
- **Historia de usuario:** HU‑ORG‑06
- **Pantalla:** W‑04 Configuración de la organización
- **Diseño:** Prototipado

---

#### 4.22 · BR-ORG-021 · El cargo y la plaza llevan códigos distintos

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-021
- **Grupo:** Cargos
- **Nivel que gobierna:** Cargo y puesto
- **Estado:** Borrador

*Descripción general*

El código del **cargo** identifica el rol en el catálogo: de él cuelgan la descripción de puesto, el perfil y la banda salarial. El código del **puesto** identifica la plaza financiada: de él cuelgan el presupuesto, el contrato y la fila en planilla. En Recursos Humanos viven en dos documentos distintos —el manual de cargos y la plantilla de personal, donde en el sector público boliviano la plaza es el *ítem*— y por eso son dos códigos, también cuando el cargo tiene una sola plaza.

Compartirlos obliga a renumerar el día que se abre la segunda, y para eso basta una transición entre el titular saliente y el entrante, o un interinato de seis meses. Ese código ya salió del sistema: está en un contrato y en una planilla, y renumerarlo ahí no es un cambio de pantalla. Además, un código suelto en una exportación dejaría de decir si nombra un rol o una silla.

**2. Escenarios ágiles de ejecución**

*Un cargo con una sola plaza*

- **Dado que** el cargo «Gerente General» tiene código «CAR‑001» y una sola plaza
- **Cuando** se abre esa plaza
- **Entonces** el sistema propone «CAR‑001‑01» como código de la plaza, derivado del cargo
- **Y** el día que se abre una segunda es «CAR‑001‑02», sin tocar la primera

*La serie se propone y no se pisa*

- **Dado que** el cargo tiene código «EC‑001» y se abren cinco plazas
- **Cuando** se miran sus códigos
- **Entonces** se proponen «EC‑001‑01» a «EC‑001‑05», derivados del cargo
- **Y** una plaza cuyo código se escribió a mano conserva el suyo aunque cambie el del cargo

*Un código que ya es de otro*

- **Dado que** el código «CAR‑001» identifica a un cargo
- **Cuando** alguien lo escribe como código de una plaza
- **Entonces** el sistema avisa que ese código ya identifica a un cargo
- **Y** no guarda hasta que se cambie

**3. Condiciones y excepciones**

- El código del cargo identifica el rol; el del puesto identifica la plaza financiada.
- Son dos códigos también cuando el cargo tiene una sola plaza.
- No se comparten: abrir una segunda plaza no puede obligar a renumerar la primera.
- Un código suelto en una exportación dice si nombra un rol o una silla.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑024
- **Historia de usuario:** HU‑ORG‑06
- **Pantalla:** W‑07 El cargo y sus plazas
- **Diseño:** El código derivado ya se propone en el prototipo; la validación de códigos repetidos todavía no está construida

---

#### 4.23 · BR-ORG-024 · El cargo dice con qué jefatura nacen sus sillas nuevas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-024
- **Grupo:** Cargos
- **Nivel que gobierna:** Cargo
- **Estado:** Borrador

*Descripción general*

La jefatura vive en cada puesto —BR‑ORG‑012—, y por eso una silla abierta más tarde nacía suelta: había que entrar a su ficha a decir de quién depende, y un puesto sin ese dato se guarda igual y no aparece colgado de ninguna parte: el error no se ve hasta que alguien mira el organigrama.

El cargo declara entonces **con qué jefatura nacen sus sillas**. No es la línea de mando del cargo, que no tiene: es el valor por defecto de las que se abran. Cambiarlo **no mueve a ninguna que ya exista** —cada una guarda la suya— y cada silla lo puede cambiar por su cuenta cuando quiera.

Es también lo que contesta un cargo aprobado y todavía sin sillas: la primera que alguien abra nace colgada donde corresponde, y no hay un segundo paso que se pueda olvidar.

**2. Escenarios ágiles de ejecución**

*Una silla abierta desde la tabla*

- **Dado que** el cargo «Ejecutivo Comercial Junior» declara que sus sillas nacen bajo el Supervisor de La Paz
- **Cuando** se abre una silla desde la lista de cargos
- **Entonces** nace colgada de ese supervisor, con su código propuesto a partir del código del cargo
- **Y** las sillas que ya existían conservan la jefatura que tenían

*Cambiarla no mueve a las que ya existen*

- **Dado que** el cargo tiene cinco sillas con sus jefaturas puestas
- **Cuando** se cambia con cuál nacen las nuevas
- **Entonces** las cinco conservan la suya
- **Y** la sexta, cuando se abra, nace con la nueva

*Un cargo sin sillas también la contesta*

- **Dado que** el cargo está aprobado y no tiene ninguna plaza abierta
- **Cuando** se abre su ficha
- **Entonces** el campo aparece igual y dice que las que se abran nacen con esa jefatura
- **Y** se guarda aunque todavía no haya a qué aplicarla

**3. Condiciones y excepciones**

- El valor declarado en el cargo es el que toman las sillas nuevas; no es la línea de mando del cargo.
- Cambiarlo no mueve ninguna silla existente: cada una guarda la suya.
- Cada silla puede cambiar su jefatura por su cuenta —BR‑ORG‑012—.
- Un cargo todavía sin sillas ya deja declarado dónde colgará la primera.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑038 · RF‑ORG‑029
- **Historia de usuario:** HU‑ORG‑07
- **Pantalla:** W‑07 El cargo y sus plazas
- **Diseño:** Prototipado

### Niveles de mando

*El catálogo que dice cuánto pesa un cargo, y cómo se traduce en el dibujo*

#### 4.24 · BR-ORG-015 · El nivel de mando es un catálogo de la empresa

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-015
- **Grupo:** Niveles de mando
- **Nivel que gobierna:** Nivel de mando
- **Estado:** Borrador

*Descripción general*

Toda empresa nace con tres creados —mando superior, mando medio y mando inferior— y es todo lo que el producto define: cada empresa los renombra, los reordena y agrega los que le falten. El número no se guarda: es **la posición en la lista**. Un cargo guarda **la llave de su nivel de mando**, nunca su nombre ni su número.

No se administra en Configuración: tiene su propia pantalla dentro de **Estructura organizacional**, porque es lo que clasifica a un cargo y no de qué escalones está hecha la empresa. Configuración contesta con qué niveles se arma el árbol; esto contesta cuánto pesa un cargo dentro de él.

**2. Escenarios ágiles de ejecución**

*Intercalar un nivel de mando*

- **Dado que** la empresa tiene tres niveles de mando
- **Cuando** inserta «Jefatura» entre el primero y el segundo
- **Entonces** todos los de abajo se renumeran solos
- **Y** ningún cargo cambia: siguen apuntando a la misma llave

*Borrar un nivel que está en uso*

- **Dado que** diez cargos tienen puesto «Mando medio»
- **Cuando** se intenta borrarlo
- **Entonces** el editor avisa a cuántos cargos deja sin nivel antes de hacerlo
- **Y** la decisión se toma sabiendo el costo, no descubriéndolo después

*Dos peldaños no se pueden llamar igual*

- **Dado que** ya existe el peldaño «Mando medio»
- **Cuando** se escribe ese mismo nombre en otro
- **Entonces** el editor avisa que ya hay uno con ese nombre y no deja guardar
- **Y** tampoco deja dejarlo vacío: dos peldaños que dicen lo mismo son dos filas y ninguna insignia sabría a cuál se refiere

**3. Condiciones y excepciones**

- Toda empresa nace con los tres creados —mando superior, mando medio, mando inferior—; desde ahí los renombra, los reordena y agrega los que le falten.
- El número no se guarda: es la posición en la lista.
- Un cargo guarda la llave de su nivel de mando, nunca su nombre ni su número.
- Se administra en su propia pantalla dentro de Estructura organizacional, no en Configuración.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑036
- **Historia de usuario:** HU‑ORG‑06
- **Pantalla:** W‑06 Niveles de mando
- **Diseño:** Prototipado

---

#### 4.25 · BR-ORG-029 · Un nivel de mando no es una línea de mando

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-029
- **Grupo:** Niveles de mando
- **Nivel que gobierna:** Nivel de mando
- **Estado:** Borrador

*Descripción general*

Los peldaños dicen **cuánto pesa** un cargo, no de quién depende. No se reportan entre sí: un mando inferior puede colgar directo de un superior sin que en el medio haya nada, y dos cargos del mismo peldaño pueden estar en ramas que no se tocan.

Por eso la escala de la pantalla se dibuja **sin una sola línea entre los cuadros**, y es a propósito: en este producto una línea significa «depende de», y unirlos afirmaría que cada nivel le reporta al de arriba. Sin líneas se leen como los peldaños que son.

Tampoco dibuja un caso concreto. Se probó con un ejemplo de dos ramas y enseñaba mal: se lo tomaba como la forma que iba a tener el organigrama de esa empresa, y esa forma depende de **quién cuelga de quién**, que es otro dato —BR‑ORG‑012—.

**2. Escenarios ágiles de ejecución**

*Un mando inferior colgando de un superior*

- **Dado que** la empresa tiene tres peldaños y una asistente de dirección con el más bajo
- **Cuando** se la cuelga directamente del Gerente General, que tiene el más alto
- **Entonces** se permite: entre los dos no hace falta ningún peldaño intermedio
- **Y** el organigrama lo dibuja tal cual, porque los peldaños no son escalones por los que haya que pasar

*La escala no dibuja un organigrama*

- **Dado que** se abre el editor de niveles de mando
- **Cuando** se mira la vista previa de la derecha
- **Entonces** muestra un cuadro por peldaño, en escalera y sin líneas entre ellos
- **Y** no muestra una estructura de ejemplo: la forma del organigrama no sale de los peldaños

*Dos cargos del mismo peldaño en ramas distintas*

- **Dado que** el Jefe de Planta y el Jefe de Marketing tienen los dos «Mando medio»
- **Cuando** se mira el organigrama
- **Entonces** cada uno cuelga de su propio jefe, en su propia rama
- **Y** compartir peldaño no los pone en la misma fila ni los relaciona entre sí

**3. Condiciones y excepciones**

- Los peldaños no se reportan entre sí: un mando inferior puede colgar directo de uno superior.
- La escala se dibuja sin ninguna línea entre los cuadros: una línea significa «depende de».
- La pantalla no dibuja un caso concreto de organigrama.
- De quién depende un cargo sale de sus sillas —BR‑ORG‑012—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑036
- **Historia de usuario:** HU‑ORG‑06
- **Pantalla:** W‑06 Niveles de mando
- **Diseño:** Prototipado

---

#### 4.26 · BR-ORG-030 · La altura de un cuadro se mide contra su jefe, no contra su fila

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-030
- **Grupo:** Niveles de mando
- **Nivel que gobierna:** Nivel de mando
- **Estado:** Borrador

*Descripción general*

El número del peldaño es lo que el dibujo convierte en **altura**, y la referencia es el peldaño **inmediatamente por debajo del de su jefe**. Un reporte un peldaño por debajo del suyo queda a ras; dos peldaños por debajo baja una caja; tres, baja dos.

Medir contra la fila no alcanza: un líder de mando inferior y un pasante que cuelgan del mismo jefe se dibujarían idénticos, como pares, y no lo son. Cuando **el jefe no declara peldaño** no hay contra qué medir, y entonces sí se compara contra el hermano más alto de la fila, que es la única referencia que queda.

**Sin peldaño declarado el cuadro no se mueve de su sitio.** Lo que no se dijo no es «el más alto»: es que todavía no se dijo, y adivinarlo sería dibujar una jerarquía que nadie declaró.

**2. Escenarios ágiles de ejecución**

*Dos reportes de peso distinto*

- **Dado que** del Gerente General —mando superior— cuelgan un Jefe de Planta —mando medio— y un asistente —mando inferior—
- **Cuando** se mira el organigrama
- **Entonces** el jefe queda a ras y el asistente baja una caja
- **Y** se ve de un vistazo que no son pares, aunque los dos le reporten al mismo

*Un jefe que no declara su peldaño*

- **Dado que** el jefe de una rama no tiene nivel de mando declarado
- **Cuando** se dibujan sus reportes
- **Entonces** se miden entre ellos, contra el más alto de la fila
- **Y** es la única referencia que queda cuando no hay contra quién medirse hacia arriba

*Un cargo sin peldaño no se mueve*

- **Dado que** un cargo no declaró su nivel de mando
- **Cuando** se dibuja
- **Entonces** queda a ras de su fila, sin bajar
- **Y** no se le adivina uno: lo que no se dijo no es «el más bajo», es que falta decirlo

**3. Condiciones y excepciones**

- La altura se mide contra el peldaño inmediatamente por debajo del de su jefe.
- Cuando el jefe no declara peldaño, la comparación es contra el hermano más alto de la fila.
- Sin peldaño declarado, el cuadro no se mueve de su sitio.
- El peldaño no cambia de quién depende el cargo —BR‑ORG‑029—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑036
- **Historia de usuario:** HU‑ORG‑09
- **Pantalla:** W‑03 Organigrama
- **Diseño:** Prototipado

### Puestos

*La silla concreta: su código, su sitio, su jefatura y quién la ocupa*

#### 4.27 · BR-ORG-010 · El puesto es donde las dos dimensiones se tocan

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-010
- **Grupo:** Puestos
- **Nivel que gobierna:** Puesto
- **Estado:** Borrador

*Descripción general*

Es el único nodo del árbol que apunta a los dos: cuelga de un **cargo** —dimensión organizacional— y declara un **sitio de trabajo** de la dimensión física. Ese sitio puede ser una sucursal o un centro de trabajo; de él se deduce la sucursal sin declararla aparte.

**2. Escenarios ágiles de ejecución**

*Trabajar en un centro*

- **Dado que** el «Depósito Central» está dentro de «Casa Matriz»
- **Cuando** un puesto declara que se trabaja en el Depósito Central
- **Entonces** su columna Sucursal dice «Casa Matriz», deducida subiendo por la rama
- **Y** al filtrar el organigrama por Casa Matriz, ese puesto entra

*Un puesto sin sitio declarado*

- **Dado que** un puesto no declara dónde se trabaja
- **Cuando** se filtra el organigrama por cualquier sucursal
- **Entonces** el puesto aparece igual
- **Y** sin sitio significa «toda la empresa», no «dato faltante»

*El mismo cargo en dos sedes*

- **Dado que** el cargo «Cajero» tiene una silla en Casa Matriz y otra en El Prado
- **Cuando** se filtra por El Prado
- **Entonces** aparece solo la segunda
- **Y** las dos siguen siendo el mismo cargo: lo que cambia por sede es qué puestos existen

**3. Condiciones y excepciones**

- El puesto cuelga de un cargo y declara un sitio de trabajo: es el único nodo que apunta a las dos dimensiones.
- El sitio de trabajo puede ser una sucursal o un centro de trabajo.
- La sucursal se deduce del sitio declarado; no se pide aparte —BR‑ORG‑006—.
- Un puesto sin sitio declarado queda ubicado por la rama de su cargo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑024 · RF‑ORG‑016
- **Historia de usuario:** HU‑ORG‑06
- **Pantalla:** W‑07 El cargo y sus plazas
- **Diseño:** Prototipado

---

#### 4.28 · BR-ORG-011 · El puesto hereda del cargo lo que no es suyo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-011
- **Grupo:** Puestos
- **Nivel que gobierna:** Puesto
- **Estado:** Borrador

*Descripción general*

La unidad organizacional y el nivel de mando salen del cargo y se **enseñan**, no se preguntan. Volver a pedirlos permitiría que una silla de «Ejecutivo Comercial» declare estar en Contabilidad, y después nadie sabe cuál de las dos vale.

**2. Escenarios ágiles de ejecución**

*Lo heredado se lee*

- **Dado que** se abre la ficha de un puesto
- **Cuando** se mira la tarjeta «El puesto»
- **Entonces** la unidad y el nivel de mando aparecen sin caja, con la nota «Sale del cargo»
- **Y** corregirlos se hace en la ficha del cargo, que es donde el dato vive

*Lo que sí es del puesto*

- **Dado que** un cargo tiene tres puestos en tres ciudades
- **Cuando** se edita uno de ellos
- **Entonces** su código, su sitio, su ocupante y su jefatura son solo suyos
- **Y** cambiarlos no toca a los otros dos

*El puesto no tiene campo de nombre*

- **Dado que** se abre la ficha de un puesto
- **Cuando** se busca el campo «Nombre»
- **Entonces** no está: se llama como su cargo
- **Y** no hay forma de que una silla de «Ejecutivo Comercial» diga que se llama otra cosa

**3. Condiciones y excepciones**

- La unidad organizacional y el nivel de mando salen del cargo y se muestran, no se preguntan.
- El puesto no puede declarar una unidad distinta de la de su cargo.
- Cambiar el dato en el cargo lo cambia en todas sus sillas.
- Lo propio de la silla —código, sitio, jefatura y ocupante— sí se pregunta —BR‑ORG‑007—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑024
- **Historia de usuario:** HU‑ORG‑06
- **Pantalla:** W‑07 El cargo y sus plazas
- **Diseño:** Prototipado

---

#### 4.29 · BR-ORG-012 · «De quién depende» se declara y vive en el puesto

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-012
- **Grupo:** Puestos
- **Nivel que gobierna:** Puesto
- **Estado:** Borrador

*Descripción general*

La dependencia estructural del organigrama sale de este dato. Se guarda en el **puesto** y no en el cargo, porque dos sillas del mismo cargo pueden responderle a jefes distintos.

**El caso que lo obliga.** Un solo cargo «Vendedor» con nueve sillas, PU‑01 a PU‑09: seis responden a la Coordinadora de Ventas y tres a la Supervisora de Supermercados, que atiende esa cuenta. Es un cargo, nueve puestos y **dos líneas de mando**. Preguntándole al cargo de quién depende no hay una sola respuesta: son dos, y guardar una daría por falsa la de las otras sillas. Cada silla tiene su propia línea hacia arriba, y por eso el dato vive ahí.

Deducirlo —«cada cargo responde a la cabeza de su unidad»— alcanza para el caso corriente y miente en cuanto una unidad tiene dos jefaturas.

El formulario lo pregunta en ese orden: una casilla dice **«todos los puestos dependen de la misma jefatura»**, marcada por defecto porque es lo que pasa casi siempre, y desmarcarla es el paso que se pide cuando no. Desmarcada, cada silla elige la suya y el dibujo las agrupa por jefatura en vez de colgarlas todas de una.

**2. Escenarios ágiles de ejecución**

*Nueve vendedores, dos jefaturas*

- **Dado que** el cargo «Vendedor» tiene nueve sillas, PU‑01 a PU‑09
- **Cuando** se desmarca «todos los puestos dependen de la misma jefatura» y tres se cuelgan de la Supervisora de Supermercados
- **Entonces** esas tres se dibujan bajo ella y las seis restantes bajo la Coordinadora de Ventas
- **Y** sigue siendo **un solo cargo**: renombrarlo los renombra a los nueve, y la lista lo muestra en una fila con sus nueve sillas debajo

*El caso corriente: todas la misma*

- **Dado que** las cinco sillas de un cargo responden al mismo jefe
- **Cuando** se abre su ficha
- **Entonces** la casilla «todos dependen de la misma jefatura» viene marcada y se elige una sola vez
- **Y** vale para las cinco, sin contestar cinco veces lo mismo

*No se puede depender de un subordinado*

- **Dado que** un puesto tiene otros colgando de él
- **Cuando** se abre su «De quién depende»
- **Entonces** los suyos no aparecen en la lista
- **Y** un círculo en la dependencia estructural no se puede dibujar

**3. Condiciones y excepciones**

- La dependencia estructural se guarda en el puesto, no en el cargo.
- La casilla «todos los puestos dependen de la misma jefatura» viene marcada: desmarcarla habilita elegir una por silla.
- Un cargo con sillas en dos jefaturas se dibuja agrupado por jefatura, no colgado de una sola.
- El valor con el que nace una silla nueva sale del cargo —BR‑ORG‑024—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑029 · RF‑ORG‑038
- **Historia de usuario:** HU‑ORG‑07 · HU‑ORG‑15
- **Pantalla:** W‑07 El cargo y sus plazas
- **Diseño:** Prototipado

---

#### 4.30 · BR-ORG-044 · Un puesto ocupado no se elimina

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-044
- **Grupo:** Puestos
- **Nivel que gobierna:** Puesto
- **Estado:** Borrador

*Descripción general*

Un puesto con una persona adentro **no se puede eliminar**. Esa persona está ubicada en la estructura por su puesto: de ahí salen su unidad, su sede, su jefe y las rutas, campañas y anuncios que le tocan —BR‑ORG‑020—. Borrado el puesto, el colaborador queda sin ninguna de esas respuestas y los demás módulos empiezan a contestar mal.

El intento abre un **aviso que explica la consecuencia y ofrece los dos caminos que sí resuelven**: mover a la persona a otro puesto, o desvincularla primero en Gestión de personas. No es un «no se puede» a secas: quien lo intenta tiene un motivo, y lo que necesita es saber por dónde sigue.

Un puesto **vacante sí se elimina**, y uno ocupado siempre se puede **desactivar**: desactivar conserva la historia, que es lo que casi siempre se quiere cuando una plaza deja de usarse —BR‑ORG‑016—.

**2. Escenarios ágiles de ejecución**

*El aviso dice qué pasaría y por dónde seguir*

- **Dado que** el puesto PU‑03 lo ocupa una persona
- **Cuando** se elige «Eliminar» en su menú
- **Entonces** se abre un aviso que la nombra y dice que quedaría fuera de la estructura: sin unidad, sin sede y sin jefe
- **Y** ofrece mover a la persona a otro puesto o desvincularla primero, y no deja eliminar desde ahí

*Una plaza que nunca se ocupó*

- **Dado que** se abrieron dos plazas de más por error y están vacantes
- **Cuando** se elimina una
- **Entonces** se elimina, porque no deja a nadie sin sitio
- **Y** el cupo del cargo vuelve a admitirla si más adelante hace falta —BR‑ORG‑009—

*La plaza que dejó de usarse*

- **Dado que** un puesto ocupado ya no va a existir el año que viene
- **Cuando** se busca sacarlo de la estructura
- **Entonces** el camino es desactivarlo, no eliminarlo
- **Y** así deja de ofrecerse para cosas nuevas y conserva quién pasó por ahí

**3. Condiciones y excepciones**

- Eliminar un puesto ocupado está bloqueado, y el bloqueo se explica en un aviso, no en un error.
- El aviso nombra a la persona y ofrece mover o desvincular: los dos caminos que sí resuelven.
- Un puesto vacante se elimina sin aviso.
- Un puesto ocupado siempre se puede desactivar —BR‑ORG‑016—.
- Vale igual desde la lista, desde la ficha y desde el organigrama: es del dato, no de la pantalla.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑015 · RF‑ORG‑028
- **Historia de usuario:** HU‑ORG‑14
- **Pantalla:** W‑07 El cargo y sus plazas
- **Diseño:** Sin construir: el menú marca «Eliminar» como acción de riesgo y no comprueba el ocupante

---

#### 4.31 · BR-ORG-045 · Una persona ocupa un solo puesto, y un puesto a una sola persona

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-045
- **Grupo:** Puestos
- **Nivel que gobierna:** Puesto
- **Estado:** Borrador

*Descripción general*

La relación entre una persona y su puesto es **uno a uno**. Un puesto admite un ocupante y una persona ocupa un puesto: si una silla la ocuparan dos, el organigrama tendría que dibujar dos cuadros donde hay uno; si una persona ocupara dos, no habría una sola respuesta a «¿de quién depende?» ni a «¿en qué unidad se la cuenta?».

Lo que en otras empresas se resuelve poniendo a alguien en dos puestos, acá se resuelve con lo que el modelo ya tiene: si además trabaja para otra área, eso es **dependencia funcional** y se declara como apoyo —BR‑ORG‑013—; si el trabajo es de verdad otro cargo, es **otra plaza** y la ocupa otra persona.

Un puesto **sin ocupante está vacante**, y así se dibuja: vacante no es un estado que alguien marca, es la consecuencia de que la silla esté vacía.

**2. Escenarios ágiles de ejecución**

*La persona ya ocupa otro puesto*

- **Dado que** una persona ocupa el puesto de Analista Contable
- **Cuando** se la intenta asignar además a un puesto de Ventas
- **Entonces** el sistema no la asigna y dice qué puesto ocupa hoy
- **Y** ofrece moverla —dejar el primero y tomar el segundo— o declarar el segundo como apoyo funcional

*Trabajar para dos áreas sin ocupar dos puestos*

- **Dado que** la Analista Contable también atiende a Marketing
- **Cuando** se declara ese apoyo en su puesto
- **Entonces** aparece dibujada también en Marketing, con línea secundaria
- **Y** sigue contándose una sola vez, en Contabilidad —BR‑ORG‑032—

*Una silla vacía se lee sola*

- **Dado que** la persona que ocupaba un puesto se desvincula
- **Cuando** se mira el organigrama
- **Entonces** ese cuadro se dibuja como vacante, sin que nadie lo marque
- **Y** el puesto sigue existiendo con su código, su sitio y su jefatura

**3. Condiciones y excepciones**

- Un puesto admite un ocupante; una persona ocupa un puesto.
- Trabajar para otra unidad se declara como apoyo funcional, no como un segundo puesto —BR‑ORG‑013—.
- Un puesto sin ocupante está vacante: no es un estado que se marque a mano.
- Quién ocupa cada puesto lo escribe Gestión de personas; acá se lee —BR‑ORG‑020—.
- El cupo del cargo limita cuántas personas lo ocupan a la vez, contando una por silla —BR‑ORG‑009—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑024 · RF‑ORG‑016
- **Historia de usuario:** HU‑ORG‑06 · HU‑ORG‑08
- **Pantalla:** W‑07 El cargo y sus plazas
- **Diseño:** Prototipado: el puesto muestra un ocupante y la silla vacía se dibuja como vacante

### Dependencia funcional

*Dónde más trabaja un puesto sin pertenecer ahí, y cómo se dibuja*

#### 4.32 · BR-ORG-013 · Un puesto pertenece a una unidad y puede trabajar en otras

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-013
- **Grupo:** Dependencia funcional
- **Nivel que gobierna:** Puesto
- **Estado:** Borrador

*Descripción general*

La **dependencia funcional** es eso: la unidad a la que pertenece es la que lo evalúa y donde se lo cuenta; las que apoya son donde además trabaja. En cada una se dibuja como un cuadro más, en azul, y sigue siendo el mismo puesto: no se cuenta dos veces.

**2. Escenarios ágiles de ejecución**

*Declarar un apoyo*

- **Dado que** el Community Manager pertenece a Marketing Digital
- **Cuando** se declara que apoya a «Contenidos y Creatividad» respondiendo a su analista
- **Entonces** aparece dibujado también dentro de Contenidos, en azul y con línea punteada
- **Y** los contadores de Contenidos no lo suman como cargo propio

*Ni a sí misma ni repetida*

- **Dado que** se abre el editor de apoyos de un puesto
- **Cuando** se despliega la lista de unidades
- **Entonces** no aparece su propia unidad ni ninguna que ya esté en la lista
- **Y** dos filas con la misma unidad darían dos jefes funcionales sin forma de saber cuál vale

*No se cuenta dos veces*

- **Dado que** un puesto de Tecnología apoya a Marketing
- **Cuando** se cuentan los puestos de Marketing
- **Entonces** no está entre ellos: pertenece a Tecnología
- **Y** en el dibujo de Marketing aparece igual, como un cuadro más en azul

**3. Condiciones y excepciones**

- La unidad a la que pertenece es la que lo cuenta y lo evalúa; las que apoya son donde además trabaja.
- El puesto se dibuja en cada unidad que apoya y sigue siendo el mismo: no se cuenta dos veces.
- La dependencia funcional no cambia de quién depende —BR‑ORG‑032—.
- Un puesto puede no apoyar a ninguna unidad: el dato es opcional.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑033
- **Historia de usuario:** HU‑ORG‑08
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

---

#### 4.33 · BR-ORG-031 · Cada apoyo declara su unidad y a quién responde ahí

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-031
- **Grupo:** Dependencia funcional
- **Nivel que gobierna:** Puesto
- **Estado:** Borrador

*Descripción general*

Un apoyo funcional no es una etiqueta: es un par. **«Trabaja en Marketing respondiendo a la Líder de Marketing»** son dos datos, y el segundo se elige de **los cargos de esa unidad** y de ninguna otra. Elegir otra unidad limpia el jefe: el que valía ahí no vale acá.

Puede quedar **sin jefe funcional**, y eso es una respuesta —«cuelga de la unidad»—, no un dato a medio llenar: hay apoyos que son al área entera y no a una persona.

Dos límites, y los dos son del dato y no de la pantalla —por eso valen igual desde la ficha del cargo y desde el modal del dibujo—. **No se ofrece la unidad propia:** un puesto pertenece a la suya, que es otra cosa que trabajar en ella. **Ni una que ya esté en la lista:** repetirla dejaría dos renglones con dos jefes funcionales distintos y ninguna forma de saber cuál vale.

**2. Escenarios ágiles de ejecución**

*Trabaja en otra área respondiendo a alguien de ahí*

- **Dado que** un analista pertenece a Tecnología
- **Cuando** se declara que apoya a Marketing respondiendo a la Líder de Marketing
- **Entonces** el desplegable del jefe solo ofrece cargos de Marketing
- **Y** queda guardado el par entero: la unidad y a quién responde en ella

*Un apoyo al área entera*

- **Dado que** se declara que un puesto apoya a Operaciones
- **Cuando** se deja el jefe funcional en «Nadie: cuelga de la unidad»
- **Entonces** se guarda así, y el cuadro se dibuja colgando del área y no de una persona
- **Y** no es un dato faltante: hay apoyos que son al área y no a alguien

*La lista no ofrece lo que no tiene sentido*

- **Dado que** un puesto de Tecnología ya apoya a Marketing
- **Cuando** se agrega otra fila de apoyo
- **Entonces** no se ofrecen ni Tecnología —la suya— ni Marketing —ya está—
- **Y** si no queda ninguna libre, el botón de agregar directamente no aparece

**3. Condiciones y excepciones**

- Cada apoyo es un par: la unidad y a quién responde en ella.
- El jefe funcional se elige entre los cargos de esa unidad; cambiar la unidad limpia el jefe.
- Un apoyo puede quedar sin jefe funcional, y eso significa «cuelga de la unidad».
- No se ofrece la unidad propia ni una que ya esté en la lista.
- Los dos límites valen igual desde la ficha del cargo y desde el modal del dibujo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑033 · RF‑ORG‑039
- **Historia de usuario:** HU‑ORG‑08
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

---

#### 4.34 · BR-ORG-032 · Lo funcional se dibuja distinto y no se cuenta dos veces

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-032
- **Grupo:** Dependencia funcional
- **Nivel que gobierna:** Puesto
- **Estado:** Borrador

*Descripción general*

En cada unidad que apoya, el puesto se dibuja como **un cuadro más**, y la línea que lo trae es **secundaria**: distinta de la estructural, para que las dos se sigan distinguiendo en escala de grises, fotocopiadas y proyectadas.

Sigue siendo el **mismo puesto**. La unidad a la que **pertenece** es la que lo cuenta, la que lo evalúa y donde sale en su plantilla; las que apoya son donde además trabaja. Contarlo en las dos daría dos respuestas distintas a «¿cuánta gente tiene esta área?» y las dos serían defendibles, que es la peor forma de tener un número.

Y no cambia de quién depende. La dependencia estructural sigue siendo la de su puesto —BR‑ORG‑012—: un apoyo agrega una segunda persona que puede opinar de su trabajo, no un segundo jefe que lo manda.

**2. Escenarios ágiles de ejecución**

*El mismo puesto, dos veces dibujado*

- **Dado que** un analista de Tecnología apoya a Marketing
- **Cuando** se mira el organigrama completo
- **Entonces** aparece en su sitio de Tecnología y otra vez dentro de Marketing, con la línea secundaria
- **Y** los dos cuadros son el mismo puesto: renombrarlo o moverlo los cambia a los dos

*Cuánta gente tiene un área*

- **Dado que** Marketing tiene seis puestos propios y recibe el apoyo de dos de Tecnología
- **Cuando** se cuenta su gente
- **Entonces** son seis
- **Y** los dos de apoyo se cuentan en Tecnología, que es donde pertenecen

*Las dos líneas se distinguen sin color*

- **Dado que** se exporta el organigrama a blanco y negro para imprimirlo
- **Cuando** se mira un puesto que apoya a otra área
- **Entonces** su línea estructural y su línea funcional se siguen diferenciando
- **Y** no hace falta el color para saber cuál de las dos es la que manda

**3. Condiciones y excepciones**

- La línea funcional se dibuja distinta de la estructural, y se distingue también en escala de grises.
- El puesto se cuenta solo en la unidad a la que pertenece.
- La dependencia estructural sigue siendo la de su puesto —BR‑ORG‑012—.
- Un apoyo agrega quién opina de su trabajo, no un segundo jefe que lo manda.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑033
- **Historia de usuario:** HU‑ORG‑08 · HU‑ORG‑09
- **Pantalla:** W‑03 Organigrama
- **Diseño:** Prototipado

### El organigrama

*El dibujo y las tablas, que son la misma estructura vista de dos maneras*

#### 4.35 · BR-ORG-017 · El organigrama y las tablas son el mismo dato

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-017
- **Grupo:** El organigrama
- **Alcance:** Todo el módulo
- **Estado:** Borrador

*Descripción general*

No hay una copia para dibujar y otra para editar. Lo que se carga por una puerta está en la otra al instante, sin botón de sincronizar y sin posibilidad de que una diga una cosa y la otra otra.

**2. Escenarios ágiles de ejecución**

*Crear desde el dibujo*

- **Dado que** se crea una unidad organizacional desde el organigrama
- **Cuando** se abre la tabla de Unidades organizacionales
- **Entonces** la unidad ya está ahí, sin traerla ni sincronizar nada
- **Y** lo mismo al revés: lo creado en la tabla se dibuja al instante

*Las dos puertas escriben lo mismo*

- **Dado que** se crea un cargo desde un cuadro del organigrama
- **Cuando** se abre después su ficha desde la tabla
- **Entonces** trae su cupo y la jefatura con la que nacen sus sillas, igual que si se hubiera creado ahí
- **Y** ningún cargo queda más pobre por la puerta que se usó

*Sin botón de sincronizar*

- **Dado que** se renombra una unidad desde la tabla
- **Cuando** se mira el organigrama
- **Entonces** el nombre nuevo ya está
- **Y** no existe un estado en el que una pantalla tenga razón y la otra no

**3. Condiciones y excepciones**

- El organigrama y las tablas leen y escriben el mismo dato: no hay copia para dibujar.
- Lo que se carga por una puerta aparece en la otra sin botón de sincronizar.
- Crear y editar desde el dibujo pregunta lo mismo que la ficha —RF‑ORG‑039—.
- No hay estado en el que una vista diga una cosa y la otra diga otra.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑039 · RF‑ORG‑030
- **Historia de usuario:** HU‑ORG‑09 · HU‑ORG‑13
- **Pantalla:** W‑03 Organigrama
- **Diseño:** Prototipado

---

#### 4.36 · BR-ORG-018 · Los recortes del organigrama son de la vista, no del sistema

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-018
- **Grupo:** El organigrama
- **Ámbito:** Organigrama y listas
- **Estado:** Borrador

*Descripción general*

Filtrar por unidad organizacional, por unidad de negocio, por lugar, por tipo de cargo o por estado cambia **lo que se está mirando** y nada más: no cambia lo que se crea ni lo que existe. Cada recorte se ve en su desplegable, pintado, y se quita desde ahí.

**2. Escenarios ágiles de ejecución**

*Ver una sede*

- **Dado que** se elige «Sucursal Sopocachi» en el filtro del organigrama
- **Cuando** se mira el dibujo
- **Entonces** se ven los puestos de esa sede con su dependencia estructural completa hasta arriba
- **Y** un jefe que no trabaja ahí se queda dibujado si alguno de los suyos sí: sin eso, los de abajo colgarían de nada

*Ningún recorte invisible*

- **Dado que** hay un filtro puesto
- **Cuando** se mira la pantalla
- **Entonces** el desplegable de ese filtro dice lo elegido y está pintado
- **Y** ningún recorte se aplica sin que quien mira sepa que lo puso

*El recorte no corta la línea de mando*

- **Dado que** se filtra por una sucursal
- **Cuando** se mira un puesto de ahí
- **Entonces** su dependencia sube completa hasta arriba
- **Y** los jefes de otra sede se siguen viendo: si no, la rama quedaría colgando de la nada

**3. Condiciones y excepciones**

- Filtrar cambia lo que se está mirando; no cambia lo que existe ni lo que se crea.
- Cada recorte se ve en su desplegable y se quita desde ahí —BR‑ORG‑033—.
- Un filtro se queda con las ramas que llegan al nodo elegido, jefes incluidos.
- Los filtros no se aplican solos: ninguno queda puesto sin que se lea en pantalla.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑031
- **Historia de usuario:** HU‑ORG‑10
- **Pantalla:** W‑03 Organigrama
- **Diseño:** Prototipado

---

#### 4.37 · BR-ORG-033 · Los filtros tienen nombre, y lo que recortan se ve en el dibujo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-033
- **Grupo:** El organigrama
- **Ámbito:** Organigrama
- **Estado:** Borrador

*Descripción general*

Lo que se está mirando se elige en **cuatro desplegables con su nombre encima**: **Cargos**, **Unidad organizacional**, **Unidad de negocio** y **Lugar**. Lo que muestra cada uno es **la respuesta** —«Staff · Vacantes», «Toda la empresa», «Farmacias»—, y el que está recortando algo **se pinta**, así que se sabe qué se está mirando sin abrir nada. Sin nada elegido, los cuatro dicen «Todos», «Toda la empresa» o «Todas», y no hace falta un aviso de «sin filtros».

**Cargos** junta lo que hace a un cargo lo que es —**tipo, nivel de mando y si está vacante**—, porque las tres arman una sola idea. **Lugar** ofrece las **regionales, las sucursales y los centros de trabajo** en árbol: elegir una regional trae sus sucursales y sus centros; una sucursal, sus centros. **Unidad de negocio** ofrece las de la empresa y **Transversal**, que son los puestos que no pertenecen a ninguna; solo aparece si la empresa tiene encendido ese nivel.

**Dónde está un puesto y de qué unidad de negocio es** se lee, no se declara dos veces. Un puesto está donde dice él y, si no dice nada, donde está su unidad organizacional. Es de la unidad de negocio de su unidad y, si su unidad es transversal, de la del lugar donde trabaja: un vendedor de Ventas en Sopocachi es de Farmacias porque Sopocachi lo es. Al filtrar por unidad de negocio, lo transversal **no** entra en cada una —si entrara, en una empresa donde casi todo es transversal el filtro no recortaría nada—; sí se quedan los jefes transversales que hacen falta para no cortar la línea de mando.

**Lo que recortan los filtros también se ve en el dibujo.** Encima de la unidad donde **cambia el lugar** va una tarjeta de lugar, y encima de los puestos donde **empieza una unidad de negocio**, una de unidad de negocio; los puestos hermanos de la misma unidad de negocio comparten una sola tarjeta. Lo que hereda el lugar o la unidad de negocio de arriba no la repite, y lo que vale para toda la empresa o es transversal no lleva ninguna. Con un lugar o una unidad de negocio elegidos en el filtro, su tarjeta va **arriba de todo**, debajo de la empresa. Las dos tarjetas son un marcador con el ícono arriba —un pin para el lugar, un maletín para la unidad de negocio— y no se parecen ni a una unidad ni a un puesto.

**2. Escenarios ágiles de ejecución**

*Los filtros dicen lo que recortan*

- **Dado que** se elige «Casa Matriz» en Lugar y «Vacantes» en Cargos
- **Cuando** se mira la barra de arriba
- **Entonces** Lugar dice «Casa Matriz» y Cargos dice «Vacantes», y los dos están pintados
- **Y** ningún recorte queda aplicado sin que se vea en su desplegable

*Un vendedor en otra sucursal*

- **Dado que** Ventas es transversal y uno de sus vendedores trabaja en Sopocachi, que es de Farmacias
- **Cuando** se elige «Farmacias» en Unidad de negocio
- **Entonces** el vendedor aparece, con su jefe y los de arriba hasta la empresa
- **Y** en el dibujo, una tarjeta «Farmacias» va arriba de todo

*Lo que se hereda no se repite*

- **Dado que** Dirección General está en Casa Matriz y sus áreas no declaran lugar
- **Cuando** se mira el organigrama sin filtros
- **Entonces** hay una sola tarjeta «Casa Matriz», encima de Dirección General
- **Y** Operaciones, que está en el Depósito Central, lleva la suya

**3. Condiciones y excepciones**

- Cuatro desplegables con nombre: Cargos, Unidad organizacional, Unidad de negocio y Lugar. El que recorta se pinta.
- Unidad de negocio solo aparece si la empresa usa ese nivel, y ofrece también «Transversal».
- Lo transversal no entra al filtrar por una unidad de negocio, salvo como jefe que sostiene la línea de mando.
- La tarjeta de lugar o de unidad de negocio va donde empieza, no se repite en lo que hereda, y no se dibuja para «toda la empresa» ni para lo transversal.
- Con un lugar o una unidad de negocio elegidos, su tarjeta va arriba de todo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑031
- **Historia de usuario:** HU‑ORG‑10
- **Pantalla:** W‑03 Organigrama
- **Diseño:** Prototipado

---

#### 4.38 · BR-ORG-034 · «Qué se dibuja» no es un filtro: cambia el papel, no a quién se deja afuera

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-034
- **Grupo:** El organigrama
- **Ámbito:** Organigrama
- **Estado:** Borrador

*Descripción general*

Elegir entre **unidades y cargos**, **solo los cargos**, **solo las unidades**, **por lugar** o **por unidad de negocio** no deja a nadie afuera: cambia qué está dibujando el organigrama. Un organigrama de unidades y uno de puestos son dos documentos distintos, y los dos son el mismo dato.

Los tres primeros dibujan **quién manda a quién**. Los dos últimos contestan otra pregunta —**dónde está cada cosa**— y por eso cuelgan las unidades de un sitio y no de un jefe. **Por lugar:** la empresa, sus regionales, sucursales y centros de trabajo, y debajo de cada uno las unidades que están ahí; una unidad que solo tiene puestos en una sucursal sale también ahí, marcada con cuántos. Una unidad que está en otro lugar que su madre lleva escrito de quién depende, porque esa línea no se dibuja. **Por unidad de negocio:** lo mismo, una vez por cada unidad de negocio y otra para lo transversal. Los lugares y las unidades de negocio sin nada debajo no se dibujan.

Por eso **no entra entre los filtros** y no vive en su barra: está abierto sobre el lienzo, abajo, que es donde se ve lo que hace. Meterlo entre los recortes haría creer que hay gente escondida cuando no la hay.

**2. Escenarios ágiles de ejecución**

*Un organigrama de áreas*

- **Dado que** hace falta el mapa de áreas para una presentación
- **Cuando** se elige «solo áreas»
- **Entonces** se dibujan las unidades con su jerarquía y sin los cargos adentro
- **Y** no falta nadie: los cargos siguen existiendo, este documento no los muestra

*No entra entre los filtros*

- **Dado que** se cambió a «solo cargos»
- **Cuando** se mira la barra de los filtros
- **Entonces** no está ahí
- **Y** el control está a la vista sobre el lienzo, que es donde se ve el efecto

*Se combina con los recortes*

- **Dado que** se elige «solo áreas» y se filtra por una sucursal
- **Cuando** se mira el dibujo
- **Entonces** se ven las áreas que llegan a esa sucursal
- **Y** son dos preguntas que se contestan juntas: qué se dibuja y de qué pedazo

**3. Condiciones y excepciones**

- Elegir entre unidades y cargos, solo los cargos, solo las unidades, por lugar o por unidad de negocio no deja a nadie afuera.
- «Por lugar» y «por unidad de negocio» cuelgan las unidades de un sitio, no de un jefe, y escriben de quién depende la que queda separada de su madre.
- «Por unidad de negocio» solo se ofrece si la empresa usa ese nivel.
- El control no entra entre los filtros ni vive en su barra: está sobre el lienzo.
- Un organigrama de áreas y uno de puestos son dos documentos del mismo dato.
- Cambiar qué se dibuja no cambia qué se exporta —RF‑ORG‑034—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑030
- **Historia de usuario:** HU‑ORG‑09
- **Pantalla:** W‑03 Organigrama
- **Diseño:** Prototipado

---

#### 4.39 · BR-ORG-035 · La empresa elige los tonos de la leyenda, nunca sus significados

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-035
- **Grupo:** El organigrama
- **Ámbito:** Organigrama
- **Estado:** Borrador

*Descripción general*

Lo que se cambia es **qué tono tiene cada significado** —apoyo funcional, cargo externo, cargo de staff, vacante y el color de marca—. Nunca **cuántos significados hay** ni **cuál pinta qué**: eso es la leyenda, y una leyenda que cada empresa redefine deja de poder explicarse.

Cambiar el tono es necesario, y no por motivos de marca: **el teal del staff y el ámbar del vacante son justo el par que más se confunde** con daltonismo, y cada empresa tiene que poder separarlos con los colores que su gente distinga.

Y el color **nunca va solo**. Cada codificación lleva **tres señales a la vez** —color, forma del borde e ícono— para que el organigrama se siga leyendo fotocopiado, proyectado y por alguien que no distingue esos dos tonos. Un cambio de paleta no puede romper la lectura porque no es lo único que la sostiene.

Nada de esto toca el dato: cambiar cómo se ve el organigrama no mueve un solo nodo.

**2. Escenarios ágiles de ejecución**

*Separar dos tonos que se confunden*

- **Dado que** en esta empresa el staff y las vacantes se confunden al proyectar
- **Cuando** se le cambia el tono a uno de los dos
- **Entonces** la leyenda sigue teniendo los mismos cinco significados y cada uno pinta lo mismo
- **Y** no se movió ningún cargo: es la presentación, no la estructura

*Los tonos se eligen viéndolos juntos*

- **Dado que** se abre la configuración de colores
- **Cuando** se cambia uno
- **Entonces** el pedazo de organigrama de al lado los muestra a los cinco conviviendo
- **Y** es la única forma de saber si ese violeta se distingue del azul y del verde en el mismo dibujo

*El organigrama fotocopiado se sigue leyendo*

- **Dado que** se imprime el organigrama en blanco y negro
- **Cuando** se mira un cargo externo
- **Entonces** se reconoce por su borde y su ícono, sin el color
- **Y** las tres señales están siempre, no solo cuando el color falla

**3. Condiciones y excepciones**

- La empresa cambia el tono de cada significado; no cuántos significados hay ni cuál pinta qué.
- Cada codificación lleva tres señales a la vez: color, forma del borde e ícono.
- El teal del staff y el ámbar del vacante son el par que más se confunde con daltonismo, y por eso se pueden separar.
- Cambiar la paleta no mueve ningún nodo: no toca el dato.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑036
- **Historia de usuario:** HU‑ORG‑12
- **Pantalla:** W‑03 Organigrama
- **Diseño:** Prototipado

### Las fichas y las listas

*La forma que comparten todos los tipos: cómo se llenan y cómo se listan*

#### 4.40 · BR-ORG-040 · Una sola ficha para todos los tipos, y abre para mirar

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-040
- **Grupo:** Las fichas y las listas
- **Alcance:** Los siete tipos de nodo
- **Estado:** Borrador

*Descripción general*

Regional, sucursal, centro de trabajo, unidad de negocio, unidad organizacional, cargo y puesto se editan en **la misma pantalla**, con los mismos gestos. No cambia de forma: cambia qué campos trae. Siete formularios distintos serían siete sitios donde arreglar el mismo error.

**Abre en lectura y editar es un paso que se pide.** Un nodo se abre muchas más veces para consultarlo que para cambiarlo, y entrando directo al editor cualquier descuido —rozar un desplegable y guardar— muda algo de sitio sin que nadie lo haya pedido. Un alta no tiene nada que mirar todavía: nace en edición.

Y al pasar de mirar a editar **nada se mueve de sitio**: los campos son los mismos y están donde van a estar, solo que bloqueados. Cancelar vuelve a **la lista del tipo del nodo** y no a la pantalla desde la que se llegó: un nodo pertenece a la lista que lo lista, se haya llegado desde donde se haya llegado.

**2. Escenarios ágiles de ejecución**

*Mirar antes de tocar*

- **Dado que** se abre un cargo desde la tabla
- **Cuando** aparece la ficha
- **Entonces** muestra sus datos sin ningún campo editable
- **Y** editar es un botón que hay que apretar, así que no se cambia nada por descuido

*Los campos no se mueven al editar*

- **Dado que** se está mirando una sucursal
- **Cuando** se pasa a edición
- **Entonces** los campos siguen en el mismo sitio, ahora escribibles
- **Y** no hay que volver a buscar el que se venía a cambiar

*Cancelar vuelve a la lista del tipo*

- **Dado que** se llegó a la ficha de una regional desde el organigrama
- **Cuando** se cancela
- **Entonces** se vuelve a la lista de regionales
- **Y** no al organigrama: el nodo pertenece a la lista que lo lista

**3. Condiciones y excepciones**

- Los siete tipos comparten la misma ficha: cambia qué campos trae, no la forma.
- La ficha abre en lectura; editar es un paso que se pide.
- Un alta nace en edición: no hay nada que mirar todavía.
- Al pasar de mirar a editar ningún campo cambia de sitio.
- Cancelar vuelve a la lista del tipo del nodo, no a la pantalla desde la que se llegó —RF‑ORG‑027—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑020 · RF‑ORG‑021 · RF‑ORG‑027
- **Historia de usuario:** —
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

---

#### 4.41 · BR-ORG-041 · Lo obligatorio bloquea el guardado y dice por qué hace falta

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-041
- **Grupo:** Las fichas y las listas
- **Alcance:** Los siete tipos de nodo
- **Estado:** Borrador

*Descripción general*

Los campos obligatorios salen de **los propios campos** y no de una lista aparte, así que agregar uno mañana lo hace exigible sin tocar la validación.

El aviso **nombra cuál falta y para qué**: «es el domicilio que sale en cada finiquito», «sin nombre no hay forma de elegirla al colgarle una sucursal». Un «campo obligatorio» a secas no explica nada y deja a quien lo lee adivinando si de verdad hace falta. Con uno solo se dice su razón; con varios se enumeran.

Y los errores aparecen **después del primer intento de guardar**, no mientras se escribe. Marcar en rojo un campo que todavía se está llenando señala un error que todavía no ocurrió.

**2. Escenarios ágiles de ejecución**

*El aviso dice el campo y su razón*

- **Dado que** se guarda una regional sin ciudad
- **Cuando** se pulsa guardar
- **Entonces** el aviso nombra el campo y para qué hace falta
- **Y** no guarda hasta que se complete

*Nada en rojo mientras se escribe*

- **Dado que** se está llenando una ficha nueva y todavía faltan campos
- **Cuando** se recorre el formulario sin intentar guardar
- **Entonces** ningún campo aparece marcado como faltante
- **Y** las marcas salen recién al primer intento de guardar

*Varios faltantes se enumeran*

- **Dado que** faltan tres campos obligatorios
- **Cuando** se intenta guardar
- **Entonces** el aviso dice cuántos son y los nombra
- **Y** no hay que descubrirlos de a uno guardando tres veces

**3. Condiciones y excepciones**

- Un campo obligatorio nuevo queda exigible sin tocar la validación: la exigencia sale del propio campo.
- El aviso nunca dice «campo obligatorio» a secas: nombra cuál falta y para qué hace falta.
- Con un solo faltante se dice su razón; con varios se enumeran todos en un mismo aviso.
- Ningún campo se marca en rojo antes del primer intento de guardar.
- Cada tipo de nodo exige los suyos: la ficha es la misma y los campos cambian —BR‑ORG‑040—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑023
- **Historia de usuario:** —
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

---

#### 4.42 · BR-ORG-042 · La tabla dibuja el árbol, y al buscar se aplana

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-042
- **Grupo:** Las fichas y las listas
- **Alcance:** Las listas del módulo
- **Estado:** Borrador

*Descripción general*

Las listas no son planas: cada fila se cuelga **de su ancestro más cercano que también esté en la vista**, con sangría. Un cargo se despliega y muestra sus puestos como filas hijas, con las mismas columnas —el puesto no tiene lista propia: vive dentro de su cargo—.

El buscador dice **entre cuántos está buscando** y de qué habla —«Buscar entre 34 unidades organizacionales…»—, mira nombre, ciudad y código, y **no distingue tildes**: «Potosi» y «Potosí» devuelven lo mismo. El resultado vuelve a la primera página, porque buscar estando en la tercera dejaría a alguien mirando una página vacía.

Con la búsqueda puesta **la sangría se aplana**, y es a propósito: los resultados no son hermanos entre sí, así que dibujarlos anidados afirmaría un parentesco que no existe. Ahí la columna «Depende de» pasa a ser lo único que los ubica.

**2. Escenarios ágiles de ejecución**

*El árbol con sangría*

- **Dado que** la unidad «Preventa» está dentro de «Gerencia de Ventas», que está dentro de «Dirección Comercial»
- **Cuando** se abre la lista de unidades
- **Entonces** las tres se dibujan anidadas, cada una bajo la suya
- **Y** un cargo de Preventa se despliega para mostrar sus puestos como filas hijas

*Buscar aplana y vuelve al principio*

- **Dado que** se está en la página 3 de la lista
- **Cuando** se escribe algo en el buscador
- **Entonces** los resultados salen sin sangría y desde la primera página
- **Y** «Depende de» los ubica, porque entre ellos no hay parentesco que dibujar

*Buscar sin acentos*

- **Dado que** existe la sucursal de «Potosí»
- **Cuando** alguien escribe «potosi» sin tilde
- **Entonces** aparece igual
- **Y** la búsqueda mira también el código y la ciudad, no solo el nombre

**3. Condiciones y excepciones**

- Cada fila se cuelga de su ancestro más cercano que también esté en la vista.
- Un cargo se despliega y muestra sus puestos como filas hijas —RF‑ORG‑016—.
- El buscador mira nombre, ciudad y código, no distingue tildes y dice entre cuántos busca.
- Con la búsqueda puesta la sangría se aplana y «Depende de» pasa a ser lo que ubica cada fila.
- El resultado vuelve a la primera página —RF‑ORG‑013—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑011 · RF‑ORG‑013 · RF‑ORG‑016
- **Historia de usuario:** —
- **Pantalla:** W‑01 Estructura organizacional
- **Diseño:** Prototipado

---

#### 4.43 · BR-ORG-043 · Ni los códigos ni los nombres se repiten

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-043
- **Grupo:** Las fichas y las listas
- **Alcance:** Los siete tipos de nodo
- **Estado:** Borrador

*Descripción general*

El **código es único en toda la empresa** y el sistema no guarda uno repetido. Un código identifica: dos nodos con el mismo dejan de identificar nada, y el que lo repite ya salió del sistema —está en un contrato, en una planilla y en una exportación—, así que el error no se arregla renumerando después.

El **nombre es único entre hermanos del mismo tipo**: dos sucursales de la misma empresa no se llaman igual, y dos cargos de la misma unidad tampoco. Más lejos no se exige, porque repetirlo es legítimo: un «Almacén» en la sucursal de La Paz y otro en la de Santa Cruz son dos sitios distintos con el mismo nombre, y «Asistente» existe en Contabilidad y en Ventas sin que sean el mismo cargo.

La comprobación **no distingue mayúsculas ni tildes ni espacios de más**: «casa matriz», «Casa Matriz» y «Casa Matriz» son el mismo nombre. Distinguirlas dejaría entrar el duplicado que a simple vista nadie ve, que es peor que el duplicado evidente.

Un nodo desactivado **sigue ocupando su código** —los históricos lo nombran— y libera su nombre, que es una etiqueta y no una identidad.

**2. Escenarios ágiles de ejecución**

*Un código que ya existe*

- **Dado que** el puesto PU‑07 ya está cargado
- **Cuando** se intenta guardar otro con ese mismo código
- **Entonces** el sistema no guarda y dice qué nodo lo está usando, con un enlace para abrirlo
- **Y** no propone renumerar al que ya existía: ese código ya salió en contratos y planillas

*El mismo nombre en dos sitios distintos*

- **Dado que** la sucursal La Paz tiene un centro de trabajo «Almacén»
- **Cuando** se crea otro «Almacén» dentro de la sucursal Santa Cruz
- **Entonces** se guarda sin avisar nada: no son hermanos
- **Y** crear un segundo «Almacén» dentro de La Paz sí queda bloqueado

*Un duplicado que a simple vista no se ve*

- **Dado que** existe la regional «Región Occidente»
- **Cuando** alguien carga «región occidente», en minúsculas y con dos espacios
- **Entonces** el sistema lo trata como el mismo nombre y no lo guarda
- **Y** lo dice mostrando el que ya existe, para que se vea que es el mismo

**3. Condiciones y excepciones**

- El código es único en toda la empresa, sin importar el tipo de nodo ni dónde cuelgue.
- El nombre es único entre hermanos del mismo tipo; en otra rama puede repetirse.
- La comprobación ignora mayúsculas, tildes y espacios de más.
- Un nodo desactivado conserva su código ocupado y libera su nombre.
- El aviso nombra el nodo que ya usa ese valor y deja abrirlo, en vez de decir «ya existe».
- El cargo y el puesto llevan códigos de series distintas y no compiten entre sí —BR‑ORG‑021—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑023 · RF‑ORG‑035
- **Historia de usuario:** —
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Sin construir: el prototipo propone el código derivado y no comprueba repetidos

### Vale para todo el módulo

*Lo que se cumple en cualquier nivel y en cualquier pantalla*

#### 4.44 · BR-ORG-016 · Desactivar no es borrar

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-016
- **Grupo:** Vale para todo el módulo
- **Alcance:** Todo el módulo
- **Estado:** Borrador

*Descripción general*

Una sucursal que cerró tiene historia, gente y planillas detrás. Lo mismo una unidad que se disolvió o un cargo que dejó de usarse. Se **desactivan**, con su fecha, y dejan de ofrecerse para cosas nuevas conservando todo lo que pasó por ahí.

**2. Escenarios ágiles de ejecución**

*Cerrar una sucursal*

- **Dado que** la sucursal «Villa Imperial» deja de operar
- **Cuando** se cambia su estado a «Cerrada»
- **Entonces** no se ofrece al crear puestos nuevos
- **Y** sigue visible en la tabla y en los históricos, marcada como cerrada

*Eliminar algo con cosas dentro*

- **Dado que** una unidad organizacional tiene cargos adentro
- **Cuando** se intenta eliminarla
- **Entonces** el sistema lo impide y dice cuántos hay que mover primero
- **Y** eliminar deja de ser una sorpresa y pasa a ser una decisión informada

*El estado se lee, no se rellena*

- **Dado que** se edita un nodo
- **Cuando** se busca el estado en el formulario
- **Entonces** es un dato mostrado y no un desplegable
- **Y** se cambia por su único camino, la acción «Cambiar estado», que es donde se dice qué implica

**3. Condiciones y excepciones**

- Los nodos se desactivan con su fecha; no se borran.
- Un nodo desactivado deja de ofrecerse para cosas nuevas y se conserva en tablas e históricos.
- El estado se cambia por su único camino, la acción «Cambiar estado» —RF‑ORG‑028—.
- Desactivar una sucursal no borra lo que colgaba de ella.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑028 · RF‑ORG‑015
- **Historia de usuario:** HU‑ORG‑14
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Prototipado

---

#### 4.45 · BR-ORG-020 · La estructura es el dato del que dependen los demás módulos

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-020
- **Grupo:** Vale para todo el módulo
- **Alcance:** Todo el módulo
- **Estado:** Borrador

*Descripción general*

Onboarding saca de aquí a quién le toca cada ruta; Evaluación, a quién apunta cada campaña; Comunicación, a quién le llega cada anuncio. Por eso escribir en la estructura es de Recursos Humanos y de nadie más: una unidad borrada deja rutas sin destino y campañas sin público.

**2. Escenarios ágiles de ejecución**

*Un cambio se propaga*

- **Dado que** una ruta de onboarding apunta al cargo «Ejecutivo Comercial» en La Paz
- **Cuando** se abre un puesto de ese cargo en esa sede
- **Entonces** la persona que lo ocupe recibe esa ruta sin que nadie la elija
- **Y** el vínculo es el cargo y la sede, no la persona

*Quién puede escribir*

- **Dado que** un líder de unidad entra al módulo
- **Cuando** mira la estructura
- **Entonces** ve el organigrama entero y su unidad en detalle
- **Y** no puede crear ni mover nodos: eso es de Recursos Humanos

*Ningún módulo guarda su copia*

- **Dado que** Evaluación necesita saber quién es el jefe de alguien
- **Cuando** arma un ciclo
- **Entonces** lo lee de la estructura en ese momento
- **Y** no lo guarda: habría dos verdades y ninguna forma de saber cuál vale

**3. Condiciones y excepciones**

- Onboarding, Evaluación y Comunicación leen la estructura; ninguno la escribe.
- Escribir en la estructura es de Recursos Humanos.
- Una unidad borrada dejaría rutas sin destino y campañas sin público: por eso se desactiva —BR‑ORG‑016—.
- Los permisos por rol todavía no se verifican en el servidor —ABIERTA‑09—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** —
- **Historia de usuario:** —
- **Pantalla:** —
- **Diseño:** La estructura ya es la única fuente en el prototipo; los permisos por rol todavía no se verifican —ABIERTA‑09—

---

#### 4.46 · BR-ORG-046 · Desactivar un nodo desactiva todo lo que cuelga de él

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-046
- **Grupo:** Vale para todo el módulo
- **Alcance:** Todo el módulo
- **Estado:** Borrador

*Descripción general*

Cerrar una sucursal cierra lo que había dentro. Por eso desactivar un nodo **desactiva también su rama entera** —centros de trabajo, unidades, cargos y puestos—, con la misma fecha. Dejarlos activos colgando de algo inactivo describe una empresa que no existe: un cargo en funciones dentro de una sede cerrada.

Antes de hacerlo, el aviso dice **cuántos nodos se desactivan y de qué tipos**, y cuántos de esos puestos están ocupados, que es la consecuencia que de verdad importa: esas personas quedan en una rama inactiva y hay que reubicarlas. Es el mismo aviso de BR‑ORG‑044, contado para toda la rama.

Cada nodo arrastrado guarda **que cayó con otro y con cuál**. Así, reactivar el nodo de arriba ofrece devolver al estado activo a los que cayeron con él, y no toca a los que ya estaban desactivados por su cuenta antes: esos se desactivaron por otro motivo y en otra fecha.

La regla no cambia lo que ya dice BR‑ORG‑016: nada se borra. Un nodo desactivado deja de ofrecerse para cosas nuevas y sigue en las tablas y en los históricos.

**2. Escenarios ágiles de ejecución**

*El aviso cuenta lo que se va con la sucursal*

- **Dado que** la sucursal El Prado tiene 2 centros de trabajo, 4 unidades y 11 puestos, 9 de ellos ocupados
- **Cuando** se la desactiva
- **Entonces** el aviso dice esos números antes de confirmar, y nombra a las 9 personas que quedan en una rama inactiva
- **Y** confirmado, los 17 nodos quedan inactivos con la misma fecha

*Reabrir la sede devuelve lo que cayó con ella*

- **Dado que** esa sucursal se reactiva seis meses después
- **Cuando** se cambia su estado a activo
- **Entonces** el sistema ofrece reactivar los 17 que cayeron con ella
- **Y** deja fuera un cargo que ya estaba desactivado desde antes, por su cuenta y con otra fecha

*Ningún activo cuelga de un inactivo*

- **Dado que** una unidad organizacional está desactivada
- **Cuando** se intenta crear un cargo dentro de ella
- **Entonces** no se ofrece como «Depende de»: un nodo inactivo no recibe nodos nuevos
- **Y** para volver a usarla hay que reactivarla primero

**3. Condiciones y excepciones**

- Desactivar arrastra la rama entera, con la misma fecha; ningún nodo activo queda colgando de uno inactivo.
- El aviso dice cuántos nodos caen, de qué tipos y cuántos puestos ocupados hay entre ellos, antes de confirmar.
- Cada nodo arrastrado guarda con cuál cayó, y reactivar ese nodo ofrece devolverlos al estado activo.
- Los que ya estaban desactivados por su cuenta no se reactivan con la rama: se desactivaron por otro motivo.
- Un nodo inactivo no se ofrece como «Depende de» de nada nuevo.
- Nada se borra: desactivar conserva tablas e históricos —BR‑ORG‑016—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑028 · RF‑ORG‑022
- **Historia de usuario:** HU‑ORG‑14
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Sin construir: cambiar el estado ya tiene su acción y todavía no arrastra la rama

---

#### 4.47 · BR-ORG-047 · Cerrar una sede ofrece mudar a su gente antes de cerrarla

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ORG-047
- **Grupo:** Vale para todo el módulo
- **Nivel que gobierna:** Sucursal y centro de trabajo
- **Estado:** Borrador

*Descripción general*

Cuando lo que se desactiva es una **sede** —una sucursal o un centro de trabajo— y en su rama hay **puestos ocupados**, el aviso de BR‑ORG‑046 suma un paso: **a qué sede activa pasan esas personas**. Se elige un destino y vale para todas; repartirlas entre dos sedes se hace después, puesto por puesto, que es el caso raro.

Mudar **cambia el sitio de trabajo del puesto y nada más**. La persona sigue en su unidad, con su cargo, con su nivel de mando y con su jefe: cerrar una sede reubica, no reorganiza. Por eso la mudanza no pasa por el editor del organigrama ni pide volver a contestar nada.

También se puede **cerrar sin mudar**, y es un caso real: si la sede cierra porque esa operación termina, esas personas se desvinculan y no hay adónde mandarlas. Entonces el aviso lo dice con todas sus letras —los puestos quedan en una rama inactiva y se resuelven en Gestión de personas— en vez de obligar a inventar un destino.

Lo que no se muda son los **centros de trabajo y las unidades**: un centro es un domicilio y un domicilio no cambia de sede, y una unidad no está en ningún sitio físico más que por herencia. Esos se desactivan con la sede. Lo que se muda son los puestos, que es donde está la gente.

**2. Escenarios ágiles de ejecución**

*La sede cierra y su gente pasa a Casa Matriz*

- **Dado que** la sucursal El Prado cierra y tiene 9 puestos ocupados
- **Cuando** se la desactiva y se elige Casa Matriz como destino
- **Entonces** esos 9 puestos pasan a tener Casa Matriz como sitio de trabajo, con su unidad, su cargo y su jefe intactos
- **Y** el resto de la rama —centros de trabajo y unidades— queda desactivado con la sucursal

*La operación termina y no hay adónde mandarlos*

- **Dado que** la sede cierra porque esa operación se discontinúa
- **Cuando** se elige cerrar sin destino
- **Entonces** el aviso dice que los 9 puestos quedan en una rama inactiva y que esas desvinculaciones se resuelven en Gestión de personas
- **Y** el cierre se completa igual: el sistema no obliga a inventar un destino

*El destino solo puede ser una sede en pie*

- **Dado que** se está eligiendo adónde pasa la gente
- **Cuando** se abre la lista de destinos
- **Entonces** ofrece las sucursales y los centros de trabajo activos, y nada más
- **Y** no aparecen ni la sede que se está cerrando ni ninguna inactiva

**3. Condiciones y excepciones**

- El paso de mudanza aparece solo cuando en la rama hay puestos ocupados.
- El destino se elige entre sedes activas; no se ofrece la que se cierra ni ninguna inactiva.
- Mudar cambia el sitio de trabajo del puesto y no toca su unidad, su cargo, su nivel de mando ni su jefatura.
- Un destino vale para todas las personas de esa sede; repartirlas entre varias se hace después, puesto por puesto.
- Los centros de trabajo y las unidades no se mudan: se desactivan con la sede —BR‑ORG‑046—.
- Cerrar sin destino está permitido, y el aviso dice qué queda pendiente de resolver.
- Una unidad de otra rama que declaraba esa sede como su sitio queda señalada para revisar: su sitio apunta a una sede inactiva —BR‑ORG‑006—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ORG‑028 · RF‑ORG‑026
- **Historia de usuario:** HU‑ORG‑14
- **Pantalla:** W‑02 La ficha de un nodo
- **Diseño:** Sin construir: el aviso de cambiar el estado todavía no ofrece destino

### 4.1 Quién hace qué

La estructura la lee todo lo administrativo y la edita solo Recursos Humanos. BR‑ORG‑020.

| Rol | Puede |
| --- | --- |
| **Colaborador** | No entra al módulo. Ve el organigrama y de quién depende, desde su app |
| **Líder de unidad** | Ve el organigrama entero y su unidad en detalle. **No crea ni mueve nodos** |
| **Alta dirección** | Lee la estructura completa y la exporta |
| **Recursos Humanos** | Todo dentro de su empresa: crear, editar, mover, cambiar de estado, eliminar, configurar el esquema de niveles, importar y exportar |

**Ningún requisito hace cumplir esta tabla todavía.** Escondiendo botones no alcanza: tiene que verificarse en el servidor, como RNF‑ORG‑02 hace con el aislamiento entre empresas. Está anotado en ABIERTA‑09.

### 4.2 Cómo se escribe una regla

| Convención | Por qué |
| --- | --- |
| **Toda regla verificable tiene un ID estable** | Se cita en un ticket y en una prueba. BR‑ORG‑007 significa lo mismo dentro de un año |
| **Los códigos que ya existen no se renumeran** | Aunque la regla cambie de sección o de orden. Un número reutilizado es peor que un hueco |
| **La regla dice qué y por qué** | El porqué es lo que permite discutirla antes de construirla, en vez de descubrirla rota meses después |
| **El estado dice cuánta confianza merece** | *Borrador*: escrita, sin revisar. Lo que no está aprobado no se presenta como si lo estuviera |
| **Los escenarios se leen como pruebas** | «Dado que» es la situación de partida, «Cuando» lo que hace el usuario y «Entonces» lo que tiene que pasar. **Tres por regla**: el camino corriente, el caso distinto que la regla también gobierna, y lo que el sistema hace cuando algo no cierra —dicho como lo que hace, «avisa y no guarda», y no como una puerta cerrada |
| **La trazabilidad se declara aunque esté vacía** | «Pendiente» es información; en blanco solo deja la duda de si falta el dato o falta el enlace |

## 05 · Modelo de datos

*Qué se guarda, qué se deduce y qué se expone. Un solo árbol de nodos, y el esquema de niveles como dato de la empresa.*

Esta sección es para desarrollo. Describe **qué se guarda, qué se deduce y qué se expone**; no prescribe motor de base de datos ni nombres de tabla definitivos.

Todo lo que sigue es consecuencia del principio 1 de 1.4: **un solo árbol, ocho tipos.** Si en algún punto el modelo empieza a necesitar una tabla por nivel de estructura, algo se entendió al revés.

### 5.1 Las entidades

```text
  ┌──────────────┐
  │   EMPRESA    │  el aislamiento vive aquí — RNF‑ORG‑02
  └──────┬───────┘
         │ 1..n
  ┌──────┴─────────────────────────────────────────────────┐
  │                                                        │
┌─▼───────────────────────┐                   ┌────────────▼────────────┐
│   NIVEL DE ESTRUCTURA   │                   │     NIVEL DE MANDO      │
│                         │                   │                         │
│ llave · nombre          │                   │ llave · nombre          │
│ dimensión · orden       │                   │ orden                   │
│ encendido · fijo        │                   │                         │
│                         │                   │  catálogo de la empresa │
│  EL ESQUEMA DE NIVELES  │                   │                         │
└─┬───────────────────────┘                   └────────────┬────────────┘
  │ tipo                                                   │
  │                    ┌──────────────┐                    │
  └───────────────────▶│     NODO     │◀───────────────────┘
                       │              │       (solo si es cargo)
                       │ id  · tipo   │
                       │ nombre       │
                       │ padreId      │──┐
                       │ estado       │  │ el árbol entero
                       └──┬────────┬──┘  │ es esta columna
                          │        │◀────┘
        ┌─────────────────┘        └─────────────────┐
        │ si tipo = cargo                            │ si tipo = puesto
  ┌─────▼──────────────┐                    ┌────────▼───────────┐
  │  campos de CARGO   │                    │ campos de PUESTO   │
  │                    │                    │                    │
  │ clase              │                    │ código             │
  │ nivelDeMandoId     │                    │ sitioId  (físico)  │
  │ cupo               │                    │ jefeId   (puesto)  │
  │ descripción        │                    │ ocupanteId         │
  └────────────────────┘                    │ apoyos[]           │
                                            └────────┬───────────┘
                                                     │
                                                     ▼
                                              PERSONA  (vive en
                                              Gestión de personas;
                                             aquí solo se referencia)
```

| Entidad | Qué representa | Nota |
| --- | --- | --- |
| **Empresa** | El cliente. Es la frontera de aislamiento | Toda consulta lleva empresa. RNF‑ORG‑02 |
| **Nivel de estructura** | Un tipo de nodo, con su nombre, su dimensión, su orden y si está encendido | **Es de la empresa, no del producto.** Vienen ocho de fábrica |
| **Nodo** | Cada pieza del árbol: su tipo, su nombre, su nodo superior y su estado | **Una sola tabla para los ocho niveles de estructura.** BR‑ORG‑001 |
| **Cargo** | Un nodo de tipo cargo, con sus campos propios: clase, nivel de mando, cupo | Cuelga solo de una unidad organizacional. BR‑ORG‑008 |
| **Puesto** | Un nodo de tipo puesto: código, sitio, jefe, ocupante y apoyos | Cuelga solo de un cargo. Es el único que apunta a las dos dimensiones |
| **Nivel de mando** | Un nivel de estructura de autoridad, con su nombre y su orden | Catálogo de la empresa. **El número no se guarda**: es la posición |
| **Persona** | El colaborador | **No es de este módulo.** Se referencia, no se duplica |

**El árbol entero es una columna.** `padreId` es todo lo que hace falta para dibujar la organización, filtrar por rama, heredar la sucursal y validar un movimiento. No hay tabla de relaciones, no hay caminos precalculados y no hay dos sitios donde el mismo vínculo pueda estar escrito distinto.

### 5.2 El nodo

| Campo | Tipo | Oblig. | Nota |
| --- | --- | --- | --- |
| `id` | identificador | Sí | **No cambia nunca.** Es lo que permite que otro módulo lo guarde — RNF‑ORG‑03 |
| `empresa` | referencia | Sí | Contexto de sesión. RNF‑ORG‑02 |
| `tipo` | llave de nivel de estructura | Sí | **La llave, nunca la palabra.** Apagar el nivel de estructura no toca al nodo: deja de ofrecerse y se queda donde está — BR‑ORG‑004 |
| `nombre` | texto | Sí *(salvo puesto)* | Un puesto no lo tiene: se llama como su cargo — RF‑ORG‑024 |
| `codigo` | texto | No | En el puesto es lo que distingue una silla de otra |
| `padreId` | referencia a nodo | No | **Vacío significa «cuelga de la empresa»**, que es la respuesta de todo lo de primer nivel, no un dato faltante |
| `estado` | `activo` · `inactivo` | Sí | Con su fecha y su motivo. Desactivar no es borrar — BR‑ORG‑016 |

Los campos propios de cada nivel de estructura —dirección y país en una sucursal, tipo y responsable en una unidad, clase y cupo en un cargo— cuelgan de este mismo registro. **Qué campos trae cada tipo lo decide el tipo**, y es lo que hace que una sola ficha sirva para los siete (RF‑ORG‑020).

### 5.3 Lo que se guarda y lo que se deduce

Es la distinción que más consecuencias tiene en este modelo.

| Dato | ¿Se guarda? | Cómo se obtiene |
| --- | --- | --- |
| De qué cuelga un nodo | **Sí** | `padreId`, declarado al crearlo |
| Tipo de cargo | **Sí** | Se declara en el cargo — regular, staff o externo |
| **Que un puesto es jefe** | **No** | Se deduce: hay otros puestos que lo declaran como jefe. BR‑ORG‑014 |
| **La sucursal de una unidad o un cargo** | **No** | Se deduce: el primer ancestro de la dimensión física subiendo por la rama. BR‑ORG‑006 |
| **Vacante** | **No** | Se deduce: silla abierta que nadie ocupa |
| Sillas `1/5` | **No** | Se cuenta: puestos abiertos sobre el `cupo` del cargo |
| Unidad y nivel de mando de un puesto | **No** | Se leen de su cargo. BR‑ORG‑011 |
| Número del nivel de mando | **No** | Es la posición en la lista de la empresa. BR‑ORG‑015 |

**Nada de esto se deduce por elegancia.** Cada dato deducido es un dato que no puede contradecir al árbol. Si la sucursal de una unidad fuera un campo, mover la rama de sitio dejaría el campo viejo y habría dos respuestas a la misma pregunta; si «jefe» fuera una casilla, quedaría marcada en alguien que ya no tiene a nadie a cargo.

### 5.4 La regla de jerarquía, en el modelo

Es **la única validación estructural del módulo**, y de ella salen todas las demás. Un nodo solo puede colgar de otro cuyo nivel de estructura esté más arriba en el esquema de niveles de esa empresa.

```text
 orden 1  Empresa              ┐
 orden 2  Regional             │  un nodo de orden N
 orden 3  Sucursal             │  solo acepta uno
 orden 4  Centro de trabajo    │  de orden < N
 orden 5  Unidad de negocio    │
 orden 6  Unidad organizacional│  (no «N−1»: saltarse
 orden 7  Cargo                │   niveles de estructura es legal)
 orden 8  Puesto               ┘

 Excepciones acotadas, y son solo dos:
   Cargo  → solo unidad organizacional    BR‑ORG‑008
   Puesto → solo cargo                    BR‑ORG‑010
   Unidad organizacional → además, de otra unidad
```

| # | Regla del modelo | De dónde viene |
| --- | --- | --- |
| 1 | El nivel de estructura del nodo superior tiene **orden menor** que el del hijo | BR‑ORG‑002 |
| 2 | Un cargo tiene como nodo superior **una unidad organizacional**, y nada más | BR‑ORG‑008 |
| 3 | Un puesto tiene como nodo superior **un cargo**, y nada más | BR‑ORG‑010 |
| 4 | Un nodo **no puede ser su propio ancestro** | Un árbol con un ciclo no se dibuja —BR‑ORG‑048— |
| 5 | La dependencia estructural **tampoco admite ciclos**: un puesto no depende de uno de los suyos | BR‑ORG‑012 |
| 6 | Ningún nodo cuelga de un nivel de estructura **apagado** | BR‑ORG‑004 |
| 7 | El nodo superior y el suyo pertenecen a la **misma empresa** | RNF‑ORG‑02 |
| 8 | Los puestos abiertos de un cargo **no superan su cupo** | BR‑ORG‑009 — el sistema avisa cuántas sobran y no guarda |

**Escribir la regla de jerarquía una vez es lo que evita escribir cuarenta.** No hace falta declarar que «una región no puede ir dentro de un cargo»: ya está prohibido. Y lo que la regla prohíbe **no se ofrece** en el desplegable, que es la diferencia entre un formulario que enseña el modelo y uno que rechaza intentos.

### 5.5 La dependencia funcional

Es la única relación que no es `padreId`, y por eso es la única que necesita su propia lista dentro del puesto.

| Campo | Qué guarda |
| --- | --- |
| `unidadId` | La unidad organizacional donde además trabaja |
| `respondeAId` | El puesto al que le responde **en esa unidad** |

**La unidad a la que pertenece es la que lo evalúa y donde se lo cuenta; las que apoya son donde además trabaja.** En cada una se dibuja como un cuadro más, con línea secundaria, y sigue siendo el mismo puesto: **no se cuenta dos veces**. No admite su propia unidad ni dos filas con la misma —dos jefes funcionales en el mismo sitio no se pueden resolver—. BR‑ORG‑013.

### 5.6 Lo que cada empresa configura

| Qué configura | Efecto | Requisito |
| --- | --- | --- |
| **Qué niveles de estructura usa** | Lo apagado no aparece en ninguna pestaña, menú, formulario ni filtro | RF‑ORG‑001 |
| **Cuáles no puede apagar** | Empresa, unidad organizacional, cargo y puesto no tienen interruptor: sin ellos no hay organigrama que dibujar | RF‑ORG‑002 |
| **Sus niveles de mando** | Renombrar, reordenar y agregar. Un cargo guarda la llave, nunca el número | BR‑ORG‑015 |
| **Sus tipos de cargo** | Decide cómo se dibuja el organigrama | RF‑ORG‑007 |

**Cómo se llama cada nivel y en qué orden van todavía no se configuran** —FUERA‑05—: la lista trae los nombres y el orden de fábrica. Lo que ya está resuelto es que ninguna pantalla los tenga escritos, así que el editor se puede agregar sin migrar nada.

**Los tipos de unidad todavía no están aquí y deberían.** Dirección, Gerencia, Departamento, Área, Equipo… son hoy una lista fija de ocho palabras en el código. El día que una empresa pida «Vicepresidencia», se mudan a Configuración junto a los niveles de estructura. ABIERTA‑04.

## 06 · Roadmap

*Cómo se llega a desarrollo, en qué orden se construye, y las nueve decisiones que todavía faltan.*

### 6.1 El camino hasta desarrollo

**Este documento no va a desarrollo. Lo que recibe desarrollo es el prototipo.**

```text
   Documento          Prototipo          Validación         Correcciones       Desarrollo
    ●───────────────────●──────────────────●──────────────────●───────────────────●
 Producto y          Diseño UX          Fabiola y quien     Diseño UX          Recibe el
 Desarrollo          las 6 pantallas    corresponda                            prototipo
 aprueban            en alta            aprueban                               aprobado
                     fidelidad
```

Este documento existe para que el prototipo se construya sobre decisiones acordadas, y para poder rastrear después por qué cada pantalla es como es. Pero **lo que se construye es lo que está en el prototipo**: un requisito que no llegue a la maqueta no se desarrolla.

| Fase | Qué pasa | Quién | Cuándo |
| --- | --- | --- | --- |
| **Prototipo** | Las seis pantallas de 8.1, navegables | Diseño UX | Del 1 al 7 de agosto de 2026 — **hecho** |
| **Documento** | Este: reglas, requisitos, modelo y flujos | Diseño UX | **En revisión** |
| **Validación** | Se recorre el prototipo con la consultora especialista y con quien corresponda según la pantalla | Fabiola Gutiérrez + Diseño UX | Por definir |
| **Correcciones** | Se ajusta el prototipo con lo que salga de la validación | Diseño UX | Por definir |
| **Entrega a desarrollo** | Se pasa el prototipo aprobado | Diseño UX → Desarrollo | Por definir |
| **Desarrollo** | Por etapas, según 6.2 | Desarrollo + QA | Desde el 8 de septiembre de 2026 |

**El desarrollo arranca el 8 de septiembre y este documento todavía está en revisión.** Eso no es un orden ideal, y es exactamente el motivo por el que existe esta versión: que lo que se construya y lo que está escrito digan lo mismo desde el primer día. Cada diferencia que aparezca entre el código y este documento es un punto a resolver, no una licencia.

**Quién aprueba qué.** Naihara Rocha e Israel Chávez aprueban **este documento**: las reglas, los nombres y la viabilidad. Fabiola Gutiérrez, la consultora especialista, aprueba **el prototipo** —su validación es sobre pantallas, no sobre requisitos escritos—. Son dos revisiones distintas y ninguna reemplaza a la otra.

### 6.2 Las tres entregas

Las etapas ordenan **qué se construye primero**, no cuándo. El corte no es por dificultad: es por utilidad, y está donde los otros módulos empiezan a poder leer la estructura.

| Etapa | Qué incluye | Cuándo se considera lista |
| --- | --- | --- |
| **1 · Estructura utilizable** | RF‑ORG‑001 a 003, 006, 007 — RF‑ORG‑010 a 016 — RF‑ORG‑020 a 025, 028 — RF‑ORG‑030, 037 — RNF‑ORG‑01 a 06 | Una empresa que empieza de cero llega sola a tener su árbol completo —sedes, unidades, cargos y puestos— y a verlo dibujado |
| **2 · El organigrama completo** | RF‑ORG‑006, 026, 027 — RF‑ORG‑031 a 035 | Filtros, dependencia funcional dibujada, exportación e importación desde planilla |
| **3 · Comodidad** | RF‑ORG‑036 — Registro de actividad | Configuración de presentación del organigrama y lo que hace medibles los indicadores de 1.5 |
| **Fuera de esta versión** | FUERA‑01 a FUERA‑04 | Registrado para más adelante |

**Qué se desbloquea en cada etapa**, leído desde 2:

| Etapa | Módulos que pasan a funcionar |
| --- | --- |
| 1 | Gestión de personas puede sentar gente. Onboarding puede apuntar rutas a cargos y sedes. Asistencia sabe dónde ficha cada quien |
| 2 | Evaluación recibe la dependencia funcional. Comunicación recibe la segmentación por sede. RR.HH. puede presentar el organigrama |
| 3 | Nada nuevo se desbloquea: es comodidad y medición |

### 6.3 Hitos de control

Cada hito es una puerta: no se pasa al siguiente sin cerrar el anterior.

| Hito | Qué tiene que estar cerrado para pasar | Estado |
| --- | --- | --- |
| **Modelo acordado** | Un solo árbol, el esquema de niveles configurable, y cargo separado de puesto | Cerrado |
| **Documento aprobado** | Producto y Desarrollo firman reglas, nombres y viabilidad | **Pendiente** |
| **Decisiones abiertas resueltas** | Las cinco de 6.7 que bloquean la primera etapa | **Pendiente** |
| **Prototipo validado** | Fabiola lo recorre y aprueba; las correcciones ya están aplicadas | Pendiente |
| **Paridad documento ↔ código** | Cada requisito obligatorio de la primera etapa está visible en alguna pantalla | Pendiente |

### 6.4 Dependencias

| Qué hace falta | De quién | Sin eso no hay | Estado |
| --- | --- | --- | --- |
| **Una sola tabla de nodos con tipo y padreId** | Backend | **Sin esto no hay módulo**, no es que falten funciones. Es el modelo entero — ver 5.1 | Por confirmar |
| El esquema de niveles como dato de la empresa | Backend | RF‑ORG‑001 a RF‑ORG‑003 y RF‑ORG‑006, y con ellos la promesa de configurar en vez de programar | Por confirmar |
| Datos de la empresa cargados | Producto | La raíz del árbol. Es lo único de lo que depende este módulo | Ya existe |
| Catálogo de países | Plataforma | Las direcciones de sucursales y centros | Ya existe |
| Motor de dibujo del organigrama | Desarrollo | RF‑ORG‑030 a RF‑ORG‑037 | Por confirmar |
| Vista de consulta en la app del colaborador | Equipo de la app | Que el colaborador vea de quién depende sin entrar al módulo | Por confirmar |

### 6.5 Suposiciones

Cada una dice quién la valida y qué pasa si resulta falsa. Un supuesto sin consecuencia declarada es una nota al pie.

| Suposición | Valida | Si es falsa |
| --- | --- | --- |
| Ocho niveles de estructura alcanzan para el 90 % de los clientes, y el resto se resuelve agregando los suyos | Producto | Aparece una dimensión nueva —no físico ni organizacional— y hay que revisar BR‑ORG‑005 |
| Una empresa típica no pasa de ~2.000 nodos | Desarrollo | RNF‑ORG‑04 se queda corto y hay que paginar o cargar el árbol por ramas |
| La estructura la edita solo RR.HH. | Producto | FUERA‑04 deja de estar fuera, y aparecen permisos por rama |
| Nadie necesita ver la estructura de una fecha pasada, todavía | Producto + Legal | FUERA‑01 entra, y entra **antes** del primer cliente en producción: agregarlo después obliga a migrar |
| Se opera desde el escritorio; en el celular se consulta | Producto | Hay que diseñar la edición táctil del árbol, que hoy no está en el alcance |
| La dependencia funcional alcanza para modelar lo matricial | Fabiola | Aparece la necesidad de doble jefe real y se rompe «un puesto, un solo nodo superior» |

### 6.6 Riesgos

| Riesgo | Prob. | Impacto | Qué hacemos |
| --- | --- | --- | --- |
| **Cargo y puesto se entienden como sinónimos** y se construye una sola cosa | Alta | **Crítico** | Es el motivo por el que el glosario va primero. Si se construye el cargo con ocupante adentro, el modelo entero se cae y la migración es total |
| El histórico se decide tarde | Media | **Crítico** | Decidir FUERA‑01 antes del primer cliente en producción. Después no se agrega sin migrar |
| El esquema de niveles configurable se implementa como ocho tablas «por ahora» | Media | Alto | Revisar el modelo de datos antes de la primera línea. Es la diferencia entre configurar y volver a programar |
| El organigrama se satura con estructuras grandes | Media | Alto | Filtros, plegado y recorte por rama desde la etapa 2. Prototipar con datos reales |
| La importación desde planilla se vuelve el camino principal y trae basura | Media | Medio | Revisar antes de escribir, rechazar la fila y no la planilla, y no dejarla actualizar hasta resolver ABIERTA‑03 |
| Las empresas no apagan nada y arrastran ocho niveles que no usan | Baja | Medio | Es un indicador de 1.5: si nadie apaga, la configuración no se está encontrando |

### 6.7 Decisiones abiertas

| # | Pregunta | Bloquea | Quién responde |
| --- | --- | --- | --- |
| ABIERTA‑01 | Al **mover un nodo con descendientes**, ¿se arrastra la rama entera sin preguntar, o se pide confirmación diciendo cuántos nodos se mueven con él? | F‑ORG‑04, etapa 1 | Producto + Diseño |
| ABIERTA‑03 | La **importación desde planilla**: ¿solo crea, o también actualiza lo que ya existe? Actualizar obliga a decidir por qué campo se reconoce un nodo ya cargado | RF‑ORG‑035, etapa 2 | Producto + Desarrollo |
| ABIERTA‑04 | Los **tipos de unidad** —Dirección, Gerencia, Departamento…— son hoy una lista fija de ocho palabras. ¿Se mudan a Configuración junto a los niveles de estructura? | Etapa 2 | Producto |
| ABIERTA‑06 | **¿Entra el histórico de la estructura?** Es FUERA‑01, y es la única de las cuatro exclusiones que no se puede agregar después sin migrar | **Todo el modelo** | Producto + Desarrollo |
| ABIERTA‑07 | ¿Qué **eventos se registran** para poder medir los indicadores de 1.5? Hoy no hay ninguno, y sin ellos esa tabla es una intención | La medición, etapa 3 | Producto |
| ABIERTA‑08 | ¿Cómo se comportan los **estados vacíos, la carga y el error** de cada pantalla? Estaban escritos en el PRD de agosto y se perdieron | Etapa 1 | Diseño |
| ABIERTA‑09 | ¿Qué **permisos se verifican en el servidor**, y no solo escondiendo botones? La tabla de 4.1 dice quién hace qué, pero ningún requisito la hace cumplir | Etapa 1 | Desarrollo |

**ABIERTA‑06 es la urgente.** Las otras ocho se pueden responder mientras se construye. Esa no: define si cada nodo nace con vigencia o sin ella, y esa columna no se agrega después sobre datos que ya están cargados.

## 07 · Flujos de usuario

*Los ocho recorridos que de verdad se hacen en este módulo, con su camino feliz y sus desvíos.*

Un flujo se lee para saber **cuántas pantallas cuesta una tarea**; los desvíos, para saber **qué se olvidó de diseñar**. Cada desvío que termina en una decisión abierta está marcado con su código: son los huecos que quedan, y están contados en 6.7.

**F‑ORG‑01 es el que decide si una implantación arranca en una semana o en un mes.** Los otros siete son el trabajo de todos los meses.

### F-ORG-01 · Puesta en marcha: de una empresa vacía a un organigrama dibujado

**Quién** Administrador general (RRHH)

**Desde dónde** Empresa recién creada

**Termina en** Organigrama con cargos y puestos

1. Completa **Datos de la empresa**. Es la raíz del árbol: sin ella no hay de qué colgar nada.
2. Entra a **Configuración** y apaga los niveles de estructura que no usa: una empresa de una sola ciudad apaga «Regional», y una que no separa centros de trabajo apaga ese.
3. Carga la **estructura física**: sus sucursales y, si los usa, sus centros de trabajo.
4. Carga la **estructura organizacional**: sus unidades, anidadas como estén en la realidad —una Dirección con gerencias dentro y equipos dentro de esas—.
5. Abre sus **cargos**, cada uno dentro de su unidad, con cuántas plazas abre y —si tiene tope— su cupo.
6. Completa los **puestos**: dónde se trabaja, quién lo ocupa y de quién depende.
7. Abre el **Organigrama** y lo ve dibujado. *Solo a partir de este punto el resto de los módulos tiene con qué trabajar.*

**Si la empresa ya tiene su organigrama en un Excel:** los pasos 3 a 6 se reemplazan por F-ORG-08, la importación.

**Si se salta el paso 2:** no se rompe nada; la empresa trabaja con los ocho niveles de estructura de fábrica. Puede volver a Configuración cuando quiera, y encender o apagar no migra datos.

**Si intenta cargar personas antes que la estructura:** no hay dónde sentarlas. El orden de la puesta en marcha no es una sugerencia. *Regla transversal: no se cargan personas antes que la estructura.*

### F-ORG-02 · Crear una sucursal

**Quién** Recursos Humanos

**Desde dónde** Estructura física, pestaña «Sucursales»

**Termina en** La sucursal en la lista, anidada bajo su nodo superior

1. Pulsa el botón de crear, que dice **«Nueva sucursal»**: la vista es de un solo tipo, así que no hay nada que preguntar.
2. Se abre la **ficha** en modo creación, con los campos de una sucursal: nombre, código, «Depende de», ubicación, responsable y estado.
3. Elige de qué **depende**. El desplegable ofrece la empresa y las regionales; nada de más abajo.
4. Completa los **obligatorios** —nombre, país, ciudad y estado— y guarda.
5. Vuelve a la lista y la sucursal aparece **anidada bajo su nodo superior**, con sus columnas completas.

**Si no elige nodo superior:** no es un error. El nodo superior vacío significa «cuelga de la empresa», que es la respuesta de todo lo de primer nivel. *BR-ORG-001.*

**Si falta un obligatorio:** guardar queda bloqueado y el aviso nombra qué campos faltan y por qué hacen falta. Los errores aparecen después del primer intento de guardar, no mientras escribe.

**Si cancela:** vuelve a la lista de sucursales —la lista de su tipo—, no a donde estaba antes de entrar.

### F-ORG-03 · Abrir un cargo y sus puestos

**Quién** Recursos Humanos

**Desde dónde** Estructura organizacional, pestaña «Cargos»

**Termina en** El cargo con sus sillas abiertas, vacantes u ocupadas

1. Crea el **cargo** y elige la **unidad organizacional** donde vive. Es el único nodo superior que se le ofrece: un cargo pertenece a un área, y dónde se trabaja lo dice el puesto.
2. Le pone **nombre, código, tipo de cargo** —regular, staff o externo— y su nivel de mando.
3. Dice de cuántas **sillas** es el cargo, y con qué jefatura nacen. Con eso quedan abiertos sus puestos.
4. Si hace falta, declara su **cupo**: hasta cuántas personas admite el cargo, que puede ser más que las plazas abiertas hoy. *BR-ORG-009.*
5. Entra a cada **puesto** desde el propio cargo. No le pide nombre: se llama como su cargo.
6. Del puesto declara **dónde se trabaja** —un centro de trabajo o una sucursal, que es donde las dos dimensiones se tocan—, **de quién depende** y **quién lo ocupa**.
7. El cargo, desplegado en la lista, muestra **sus puestos como filas hijas** con las mismas columnas.

**Si el cargo es de staff o externo:** no se le pide nivel de mando, porque no manda. En el organigrama se dibuja al costado de la línea. *BR-ORG-014.*

**Si sus sillas no dependen todas del mismo:** se desmarca «todos los puestos dependen de la misma jefatura» y cada una elige la suya. *BR-ORG-012.*

**Si no se dice quién lo ocupa:** el puesto queda **vacante**, que es un estado con nombre y no un campo vacío. *Regla del módulo de Gestión de personas: una vacante es un estado con nombre, no un campo vacío.*

**Si un puesto trabaja además en otra unidad:** se declara en «También trabaja en». Pertenece a una y apoya en otras. *BR-ORG-013.*

### F-ORG-04 · Reorganizar: mover una unidad de sitio

**Quién** Recursos Humanos

**Desde dónde** La ficha de la unidad

**Termina en** La rama entera colgando del nodo superior nuevo

1. Abre la **ficha de la unidad** y pasa a edición.
2. Cambia **«Depende de»** por su nuevo nodo superior. El desplegable solo ofrece niveles de estructura superiores, y una unidad puede colgar de otra unidad.
3. Guarda. **Todo lo que colgaba de ella se mueve con ella**: sus sub-unidades, sus cargos y los puestos de esos cargos.
4. El organigrama y las tablas lo reflejan en el acto, porque son el mismo dato mirado de dos maneras.

**Si intenta colgarla de algo de más abajo** —un cargo, un puesto—: la opción no está en la lista. Lo imposible no se ofrece. *BR-ORG-002.*

**Si la unidad tiene mucha gente debajo:** está abierto si conviene confirmar el movimiento diciendo cuántos nodos se arrastran. *ABIERTA-01.*

**Si lo que cambia es la sucursal donde opera:** se declara una sola vez, en la unidad de más arriba que la tenga, y baja por la rama. Las de más abajo la muestran heredada y dicen de dónde sale. *BR-ORG-006.*

### F-ORG-05 · Cerrar una sucursal

**Quién** Recursos Humanos

**Desde dónde** El menú de acciones de su fila

**Termina en** La sucursal cerrada, con su historia intacta

1. Abre el menú de la fila y elige **«Cambiar estado»**. Es el único camino: en la ficha el estado se lee, no se rellena.
2. El sistema pide el **estado nuevo** y el motivo, y avisa qué cuelga de la sucursal.
3. Confirma. La sucursal queda **cerrada**: deja de ofrecerse para cosas nuevas y **conserva su historia y su gente**.

**Cerrar no es borrar.** Eliminar es otra acción, va marcada como riesgo y pide escribir la palabra. *Reglas transversales: una sucursal cerrada conserva su historia y su gente, y borrar pide escribir la palabra.*

**Si tenía puestos trabajando ahí:** los puestos siguen existiendo. Qué se les señala está sin decidir. *ABIERTA-02.*

**Si lo que se quiere es apagar el nivel de estructura «Sucursal» entero:** es otra cosa y vive en Configuración, y está trabado mientras haya sucursales cargadas. *BR-ORG-004.*

### F-ORG-06 · Cambiar el esquema de niveles: encender o apagar un nivel de estructura

**Quién** Recursos Humanos

**Desde dónde** Configuración de la organización

**Termina en** El nivel de estructura en su sitio, con su pestaña y su menú

1. Entra a **Configuración** y ve el esquema de niveles de la empresa: los niveles de estructura en orden, agrupados por dimensión, con su interruptor.
2. **Enciende** el que le falta o **apaga** el que no usa, y la cadena de arriba se rehace en el momento: la consecuencia se ve sin ir a buscarla al árbol.
3. Guarda. El nivel de estructura **aparece en toda la aplicación el mismo día**: su pestaña, su entrada de menú y su opción en cada «Depende de».

**Si intenta apagar uno con nodos dentro:** el interruptor está trabado y el contador dice cuántos habría que mover antes. *BR-ORG-004.*

**Si busca apagar un nivel de estructura fijo** —empresa, unidad organizacional, cargo, puesto—: no tiene interruptor. Sin ellos no hay organigrama que dibujar.

### F-ORG-07 · Consultar el organigrama y llevárselo

**Quién** Alta dirección, líderes, RRHH

**Desde dónde** Organigrama

**Termina en** Un archivo para pegar en una presentación

1. Abre el **Organigrama** y elige la vista: **gráfico** para ver la forma, **cards** para recorrer, **tabla** para comparar.
2. **Recorta** lo que quiere mirar: un lugar, una unidad organizacional, una unidad de negocio, un tipo de cargo. Cada filtro dice con su nombre lo que está recortando.
3. Abre un cuadro para **leer la ficha** de ese nodo —de quién depende, cuánta gente cuelga, qué está sin cubrir—.
4. **Exporta**: PNG para pegar, SVG para escalar, imprimir o PDF con texto buscable.

**Lo que se exporta es el organigrama entero a tamaño natural**, no el pedazo visible en pantalla. *RF-ORG-034.*

**El recorte es de la vista, no del sistema:** filtrar un organigrama es quedarse con las ramas que llegan a esa sucursal, y no borra nada. *BR-ORG-018 y la regla transversal de que filtrar recorta la vista y no borra nada.*

**Si quiere cambiar cómo se ve** —colores por unidad, códigos de puesto, niveles de mando—: es la configuración del propio organigrama, y no toca el dato.

### F-ORG-08 · Cargar la estructura desde una planilla

**Quién** Recursos Humanos, en la puesta en marcha

**Desde dónde** Organigrama, botón de importar

**Termina en** El árbol cargado de una vez

1. Abre **Importar** y descarga la **plantilla de ejemplo**, que ya trae las columnas con el nombre que el sistema espera.
2. Vuelca ahí su organigrama: una fila por nodo, diciendo qué es y de qué cuelga.
3. Sube el archivo. El sistema **revisa antes de escribir**: qué filas están bien, cuáles apuntan a un nodo superior que no existe y cuáles rompen la regla de jerarquía.
4. Confirma. El árbol queda cargado y se dibuja.

**Si una fila cuelga de algo de más abajo:** se rechaza esa fila nombrando el motivo, no la planilla entera.

**Si la planilla trae un nivel de estructura que la empresa apagó:** hay que encenderlo en Configuración primero. Lo apagado no existe en ningún formulario ni en ninguna carga.

**Si la estructura ya estaba cargada:** está sin decidir si la importación actualiza o solo crea. *ABIERTA-03.*

## 08 · Recursos visuales

*Siete pantallas y siete wireframes. Sirven para discutir la estructura sin discutir el estilo.*

**Los wireframes no son maquetas.** No dicen de qué color es nada ni con qué tipografía se escribe: dibujan qué hay en cada pantalla, en qué orden y por qué. Por eso sirven para acordar la estructura antes de que exista el diseño, y por eso no reemplazan al prototipo.

### 8.1 Las siete pantallas del módulo

Seis pantallas y una sola idea: **tres listan el árbol, una lo edita, una lo dibuja y una decide de qué escalones está hecho.**

| Pantalla | Ruta | Para qué se entra | Requisitos | Wireframe |
| --- | --- | --- | --- | --- |
| **Datos de la empresa** | /organizacion/datos | Identificación, contacto y presencia digital de la raíz del árbol. Es la primera pantalla del módulo y la primera de la puesta en marcha | RF‑ORG‑023 | [W‑05](#W-05) |
| **Estructura física** | /organizacion/distribucion | La lista de la dimensión de la geografía, con una pestaña por nivel de estructura encendido: Regionales, Sucursales, Centros de trabajo | RF‑ORG‑010 a 015 | [W‑01](#W-01) |
| **Estructura organizacional** | /organizacion/estructura | La lista de la dimensión del trabajo: Unidades de negocio, Unidades organizacionales, Cargos. Los puestos se ven desplegando su cargo | RF‑ORG‑010 a 016 | [W‑01](#W-01) |
| **Ficha de un nodo** | /organizacion/nodo/:id | Una sola pantalla para los siete tipos que se crean. No cambia de forma: cambia qué campos trae. Abre en lectura y se pasa a edición | RF‑ORG‑020 a 029 · 038 | [W‑02](#W-02) |
| **Organigrama** | /organizacion/organigrama | El mismo árbol dibujado, en tres vistas —gráfico, cards y tabla— con sus filtros, su exportación y la importación desde una planilla | RF‑ORG‑030 a 037 · 039 | [W‑03](#W-03) |
| **Niveles de mando** | /organizacion/mandos | El catálogo que ordena el organigrama de arriba abajo: renombrar, reordenar y agregar peldaños. Se llega desde Estructura organizacional, que es donde alguien lo va a buscar | BR‑ORG‑015 | — |
| **Configuración** | /organizacion/configuracion | De qué niveles de estructura está hecha esta empresa: encender y apagar. Y el catálogo de tipos de cargo | RF‑ORG‑001 a 007 | [W‑04](#W-04) |

**Qué pasa si el prototipo y este documento no coinciden.** Como desarrollo construye desde el prototipo, una diferencia entre los dos no se resuelve declarando un ganador: se decide cuál de los dos está mal y se corrige ése. Lo que no puede pasar es entregar el prototipo con una diferencia sin resolver, porque entonces el requisito escrito en este documento no lo verá nadie.

### W-01 · Estructura organizacional

La lista de una dimensión. La misma forma sirve para Estructura física: lo único que cambia son las pestañas y las columnas, y las dos cosas se deducen de los niveles de estructura que la empresa tiene encendidos.

> **Wireframe · Estructura organizacional** — `/organizacion/estructura?ver=unidades`. El dibujo en cajas está en la versión HTML de este documento; abajo, lo que señala cada número.

1. **Una pestaña por nivel de estructura encendido**, en el orden del esquema de niveles. Los apagados se nombran al final, en gris y con borde punteado: es desde donde se los enciende. Nadie mantiene esta lista a mano.
2. **El buscador dice cuántos hay** y de qué está hablando —«entre 34 unidades organizacionales»—, con el plural del nivel. Filtrar devuelve la tabla a la primera página.
3. **El botón crea directamente** y lleva el nombre del tipo, porque la vista es de un solo nivel de estructura. En una vista que agrupa dos, el mismo botón abre un menú que pregunta qué se quiere crear.
4. **El árbol se dibuja con sangría**, y un cargo se despliega para mostrar sus puestos como filas hijas con las mismas columnas. La columna «Depende de» repite el nodo superior para poder leerlo alineado, sin un renglón gris encima de cada fila.
5. **El menú de la fila tiene cuatro acciones y ninguna más:** ver detalle, editar, cambiar estado y eliminar. La última va marcada como riesgo. «Ver» está en el menú a propósito: leer es una de las cosas que se pueden hacer con esto.

### W-02 · La ficha de un nodo

Una sola pantalla para los siete tipos que se crean. No cambia de forma: cambia qué campos trae. Acá está dibujada con los de un cargo, que es el tipo con más cosas que decir.

> **Wireframe · Cargo · Ejecutiva Comercial** — `/organizacion/nodo/:id?editar=1`. El dibujo en cajas está en la versión HTML de este documento; abajo, lo que señala cada número.

1. **La vuelta es a la lista del tipo del nodo**, no a la pantalla desde la que se llegó. Un cargo pertenece a la lista de cargos: de ahí saliste y ahí esperás volver, aunque hayas entrado desde el organigrama.
2. **Los obligatorios los declara el campo**, no la pantalla, y por eso van marcados de a uno. Al intentar guardar sin ellos, el aviso los nombra y dice para qué hacen falta. Antes del primer intento no hay ni un error en rojo.
3. **«Unidad organizacional» es el «Depende de» del cargo**, y solo ofrece unidades. La regla de jerarquía le permitiría colgar de una sucursal, pero eso lo sacaría del organigrama, así que está acotado.
4. **Los puestos viven dentro de su cargo** y no en una lista hermana: 34 de los 35 cargos de la demo tienen exactamente una silla, y elegir por cuál de dos puertas entrar era una decisión que nadie tenía que tomar. Un puesto vacante se dice con la palabra, no con una celda vacía.
5. **Guardar está apagado mientras no haya cambios**, y cancelar deshace el viaje por donde se entró. Las dos son reglas transversales: la ficha de un nodo no inventa las suyas.

### W-03 · Organigrama

El mismo árbol que las tablas, dibujado. Tres vistas del mismo dato, una barra de filtros que dice qué se está mirando y un lienzo que se arrastra.

> **Wireframe · Organigrama · vista gráfico** — `/organizacion/organigrama`. El dibujo en cajas está en la versión HTML de este documento; abajo, lo que señala cada número.

1. **Los filtros recortan la vista, no el sistema.** Filtrar por sucursal es quedarse con las ramas que llegan a esa sucursal —incluidos los nodos de arriba que las sostienen—, no borrar lo demás.
2. **Importar y exportar viven aquí** y no en una pantalla aparte, porque es donde se ve el resultado. Se exporta el organigrama entero a tamaño natural, no el pedazo que se ve.
3. **Tres vistas del mismo dato:** gráfico para ver la forma, cards para recorrer, tabla para comparar. Cambiar de vista no cambia lo que hay.
4. **Los filtros dicen qué se está mirando**, cada uno con su nombre, y van como segunda fila de la barra, no en una tarjeta propia: leer «128 puestos» creyendo que es toda la empresa cuando son los de una sucursal lleva a decidir con la mitad del dato.
5. **Staff y outsourcing se dibujan al costado de la línea**, con una marca propia, porque no tienen nivel de mando. Un puesto vacante se dibuja con borde punteado: existe, y no lo ocupa nadie.

### W-04 · Configuración de la organización

La pantalla que hace que este módulo no sea ocho tablas: aquí la empresa decide de qué escalones está hecha.

> **Wireframe · Configuración de la organización** — `/organizacion/configuracion`. El dibujo en cajas está en la versión HTML de este documento; abajo, lo que señala cada número.

1. **La vista previa va primera** porque es la pregunta que trae a esta pantalla: «¿cómo queda mi organización?». Se lee como dos caminos, uno por dimensión, con los niveles que la empresa eligió.
2. **La columna «Nodos» es la que decide qué se puede tocar.** Un nivel de estructura con cero nodos se apaga sin consecuencias; uno con 34 tiene el interruptor trabado y el número explica por qué.
3. **Apagado no es borrado.** El nivel de estructura sigue en la lista, en su posición, y encenderlo de nuevo no migra nada: solo vuelve a aparecer el escalón donde colgar cosas.
4. **Los cuatro fijos no tienen interruptor.** Empresa, unidad organizacional, cargo y puesto no se apagan: sin ellos no hay organigrama que dibujar, así que el control no existe en vez de existir y rechazar.

### W-05 · Datos de la empresa

La raíz del árbol y la primera pantalla de la puesta en marcha. Es una ficha larga y sin sorpresas: lo que importa es que existe antes que todo lo demás.

> **Wireframe · Datos de la empresa** — `/organizacion/datos`. El dibujo en cajas está en la versión HTML de este documento; abajo, lo que señala cada número.

1. **Esto es el nodo raíz**, aunque no se parezca a la ficha de un nodo. La empresa no se crea desde el árbol —ya existe cuando alguien entra por primera vez—, así que tiene su propia pantalla y no una fila en ninguna tabla.
2. **Los dos logos son dos campos** porque el producto tiene dos temas, y un logo pensado para fondo claro desaparece sobre la tinta marina.
3. **Cada fila del formulario suma doce columnas exactas**, como toda ficha de Souly: es lo que hace que tres campos de un tercio y dos de un medio se lean como una sola retícula y no como cinco decisiones sueltas.

### W-06 · Niveles de mando

El catálogo que dice cuánto pesa un cargo. Se llega desde Estructura organizacional, no desde Configuración: es lo que clasifica a un cargo y no de qué escalones está hecha la empresa.

> **Wireframe · Niveles de mando** — `/organizacion/mandos`. El dibujo en cajas está en la versión HTML de este documento; abajo, lo que señala cada número.

1. **Los tres vienen sembrados y ahí termina la opinión del producto.** Cada empresa los renombra, los reordena y agrega los que le falten. El número no se escribe: es la posición en la lista. *BR-ORG-015.*
2. **Se reordena arrastrando**, y al soltar todos se renumeran solos. Ningún cargo cambia: lo que guarda es la llave del peldaño, nunca su número.
3. **La columna «Cargos» es la que decide qué se puede borrar.** Borrar uno en uso avisa a cuántos cargos deja sin nivel *antes* de hacerlo: la decisión se toma sabiendo el costo.
4. **Un peldaño nuevo pide solo su nombre**, y no puede quedar vacío ni repetir el de otro: dos peldaños que se llaman igual son dos filas que dicen lo mismo, y ninguna insignia sabría a cuál se refiere.
5. **La escala se dibuja sin una sola línea entre los cuadros**, y es a propósito: en este producto una línea significa «depende de», y unirlos afirmaría que cada nivel le reporta al de arriba. Tampoco dibuja un caso concreto: la forma del organigrama sale de quién cuelga de quién, no de los peldaños. *BR-ORG-029 y BR-ORG-030.*

### W-07 · El cargo y sus plazas

La parte más difícil del módulo, dibujada: un cargo es un rol y sus plazas son sillas, y esas sillas pueden responder a jefaturas distintas. Es la misma forma en la ficha y en el modal del organigrama, porque son dos puertas a un solo formulario.

> **Wireframe · Cargo · Vendedor** — `/organizacion/nodo/:id?editar=1`. El dibujo en cajas está en la versión HTML de este documento; abajo, lo que señala cada número.

1. **El nivel de mando solo aparece si el tipo es «Regular».** Los de staff y los externos se dibujan al costado de la línea, así que preguntarles a qué altura mandan no tiene respuesta. *BR-ORG-014.*
2. **El cupo es un techo, no una orden de creación.** Vacío significa «sin límite». Guardar con cupo cuatro no abre ninguna plaza, y bajarlo por debajo de las abiertas no guarda: el sistema dice cuántas sobran. *BR-ORG-009.*
3. **Las plazas se abren desde el cargo**, que es de donde cuelgan. El puesto no tiene lista propia ni campo de nombre: se llama como su cargo. *BR-ORG-007 y BR-ORG-011.*
4. **La casilla viene marcada, porque es lo que pasa casi siempre.** Marcada, la jefatura de arriba vale para todas las plazas y la columna de la tabla ni se dibuja. Desmarcarla es el paso que se pide cuando no. *BR-ORG-012.*
5. **Desmarcada, cada fila elige la suya**, y abre con el valor que la jefatura común venía diciendo —no en blanco—. Las que nadie toque conservan la que tenían. El desplegable no ofrece a los subordinados del propio puesto: un círculo no se puede dibujar.
6. **La previa agrupa por jefatura** en vez de colgar las nueve de una sola, porque eso prometería un sitio que el organigrama no les va a dar. Es la misma previa en la ficha y en el modal del dibujo. *BR-ORG-017.*

## 09 · Historias de usuario

*Quince historias con sus criterios de aceptación, y el plan de prototipado. Es contra esto que se acepta o se devuelve lo construido.*

Las reglas dicen qué es verdad y los requisitos qué tiene que hacer cada pantalla. Esta sección dice **qué se entrega y cómo se acepta**, que es otra cosa: sin ella, dos personas leen los mismos requisitos y construyen cosas distintas, las dos defendibles.

**Un criterio de aceptación se marca hecho o no hecho delante de la pantalla, sin discutir.** Por eso están escritos como afirmaciones comprobables y no como intenciones: «el aviso dice el motivo y no guarda», no «el sistema valida correctamente». Si un criterio necesita interpretación, no es un criterio.

**La historia dice para quién y para qué.** Una historia sin el «para» se construye igual y se acepta peor: es lo que permite discutir si lo entregado sirve, y no solo si funciona.

### 9.1 Las quince historias y sus criterios de aceptación

**HU-ORG-01 · Dejar el esquema de niveles como es mi empresa**

**Como** responsable de Recursos Humanos que está poniendo en marcha el módulo, **quiero** apagar los escalones de estructura que mi empresa no usa **para** que mis formularios no me pidan cosas que no tengo.

###### Criterios de aceptación

- Cada nivel de estructura se ve en una lista con su dimensión, cuántos nodos tiene y su interruptor.
- Empresa, unidad organizacional, cargo y puesto **no tienen interruptor**: no aparece el control, en vez de aparecer y rechazar.
- Apagar un nivel con nodos dentro está **trabado**, y el sistema dice cuántos habría que mover antes.
- Un nivel apagado **desaparece** de su pestaña, de su entrada de menú y de todo desplegable «Depende de».
- Apagar no borra: los nodos de ese nivel se quedan donde están, y encenderlo de nuevo los vuelve a mostrar sin migrar nada.
- La vista previa «así queda tu organización» está **arriba** y se rehace **antes de guardar**, mostrando las dos dimensiones por separado.
- Al cargar datos que traen nodos de un nivel apagado, ese nivel **aparece encendido**: nunca queda un nivel apagado con cosas adentro.

Se apoya en **BR‑ORG‑004 · BR‑ORG‑038 · RF‑ORG‑001 a 003, 006** · Pantalla: Configuración

**HU-ORG-02 · Cargar los datos de mi empresa**

**Como** responsable de Recursos Humanos, **quiero** registrar la identificación y el contacto de mi empresa **para** que exista la raíz de la que va a colgar todo lo demás.

###### Criterios de aceptación

- El **único campo obligatorio** es el nombre comercial.
- Al intentar guardar sin él, el aviso dice el motivo —el organigrama lo imprime en su cabecera— y no guarda.
- Razón social, NIT, rubro, contacto, dirección y redes se pueden dejar vacíos y completar después.
- El **país** se elige de un catálogo, y de él salen las ciudades que se ofrecen al crear regionales, sucursales y centros de trabajo.
- La dirección que se pide acá es la de la **casa matriz**; la de cada sede se carga en su propia ficha.
- Guardado el nombre, ya se puede crear el primer nodo que cuelgue de la empresa.

Se apoya en **BR‑ORG‑036 · BR‑ORG‑037 · BR‑ORG‑001** · Pantalla: Datos de la empresa

**HU-ORG-03 · Cargar dónde está mi empresa**

**Como** responsable de Recursos Humanos, **quiero** registrar mis regionales, sucursales y centros de trabajo **para** poder decir después dónde trabaja cada persona.

###### Criterios de aceptación

- Cada nivel encendido tiene su **pestaña**, en el orden del esquema, y el botón de crear dice el nombre de ese nivel: «Nueva sucursal».
- La **regional** no pregunta de qué cuelga, y exige nombre, país, ciudad y estado, y nada más.
- La **sucursal** exige nombre, país, ciudad y estado; su «Depende de» ofrece la empresa y las regionales, y nada de más abajo.
- El **centro de trabajo** exige además **de qué clase de sitio** se trata —oficina, planta, almacén, taller, obra, tienda u otro—.
- El centro pregunta regional, sucursal y centro superior en **tres listas que se acotan entre sí**: elegida la regional, «Sucursal» solo ofrece las suyas.
- Los tres son opcionales y «Ninguna» es **una opción elegible** de la lista, no solo un marcador gris.
- Se guarda **el más específico** de los tres como nodo superior.
- El campo de un nivel que la empresa no usa **no aparece** en el formulario.
- La ciudad se acota por el departamento cuando existe, y el departamento solo se pide donde esa división existe con ese nombre.
- La dirección se escribe libre; la ciudad se elige del catálogo.

Se apoya en **BR‑ORG‑025 a 028 · BR‑ORG‑002 · BR‑ORG‑003** · Pantalla: Estructura física

**HU-ORG-04 · Cargar cómo se organiza el trabajo**

**Como** responsable de Recursos Humanos, **quiero** registrar mis áreas con la jerarquía que tienen de verdad **para** que el organigrama muestre la forma real de la empresa.

###### Criterios de aceptación

- Una unidad organizacional se puede anidar **dentro de otra unidad**, a cualquier profundidad.
- También puede colgar directamente de una sucursal, de un centro de trabajo o de la empresa.
- Además del anidamiento, la unidad declara **«Bajo el mando de»**: el puesto que la manda, y de ahí sale su línea en el dibujo.
- Sin «Bajo el mando de», la unidad y todo lo que tiene dentro se dibujan **sueltos**, y eso es visible.
- La **cabeza** de la unidad —el cargo que no le responde a nadie de adentro— se muestra sin pedir que se la declare.
- La unidad declara **en qué sede está**; las de más abajo lo muestran heredado y dicen de qué unidad sale.
- Declarar una sede propia en una unidad de más abajo **afina** la rama y no contradice a la de arriba.
- Sin ninguna sede declarada en toda la rama, la ficha dice «Toda la empresa», y eso no es un dato faltante.
- La tabla dibuja el anidamiento **con sangría**.

Se apoya en **BR‑ORG‑023 · BR‑ORG‑006 · BR‑ORG‑042** · Pantalla: Estructura organizacional

**HU-ORG-05 · Repartir mi empresa en líneas de negocio**

**Como** responsable de Recursos Humanos de una empresa con varios frentes, **quiero** marcar a qué línea pertenece cada parte de la estructura **para** poder responder cuánta gente tiene cada frente del negocio.

###### Criterios de aceptación

- Una unidad de negocio se crea pidiendo **solo nombre y estado**: no tiene código ni descripción.
- La línea se asigna desde la ficha de cada regional, sucursal, centro de trabajo o unidad organizacional, en su campo «A qué negocio pertenece».
- Un nodo que **hereda** la línea de su rama la muestra y **no la puede cambiar desde ahí**: el campo dice de dónde sale.
- Cambiar la línea de un nodo la cambia en **todo lo que cuelga** de él, sin escribir en ningún otro registro.
- Los cargos y los puestos **nunca la declaran**: solo la muestran.
- La ficha de la unidad de negocio **lista lo que declaró pertenecerle**, en solo lectura.
- Una unidad de negocio sin nada asignado dice que todavía nadie declaró pertenecerle, y eso no es un error.
- La columna «Unidad de negocio» de las tablas **no se dibuja** si la empresa no declaró ninguna.

Se apoya en **BR‑ORG‑022 · BR‑ORG‑039** · Pantalla: Estructura organizacional › Unidades de negocio

**HU-ORG-06 · Definir un cargo y abrir sus plazas**

**Como** responsable de Recursos Humanos, **quiero** crear un cargo con las sillas que tiene **para** poder asignarle gente y verlo en el organigrama.

###### Criterios de aceptación

- El cargo exige **nombre, unidad organizacional y tipo de cargo**; el nivel de mando se exige solo si el tipo es «Regular».
- El desplegable de unidad **solo ofrece unidades organizacionales**: ni sucursales ni regionales.
- Sin ninguna unidad creada, crear un cargo está **bloqueado** y el motivo se dice en el sitio.
- Un cargo **puede guardarse sin ninguna plaza abierta**, y queda en el catálogo con su unidad y su nivel.
- El **cupo** es opcional: vacío significa «sin límite», y puede ser mayor que las plazas abiertas hoy.
- Guardar un cargo con cupo cuatro **no crea ninguna plaza**.
- Bajar el cupo por debajo de las plazas abiertas **no guarda**: el sistema dice cuántas sobran.
- El código de la plaza se **propone** derivado del código del cargo —«EC‑001» propone «EC‑001‑01»— y una plaza con código escrito a mano conserva el suyo.
- Un cargo con varias plazas figura en la lista como **una sola fila**, con sus plazas desplegables debajo con las mismas columnas.
- Renombrar el cargo renombra **todas** sus plazas.
- Los cargos de staff y los externos **no muestran el campo de nivel de mando**.

Se apoya en **BR‑ORG‑007 a 009 · BR‑ORG‑014 · BR‑ORG‑021 · BR‑ORG‑024** · Pantalla: Estructura organizacional › Cargos

**HU-ORG-07 · Repartir las plazas de un cargo entre dos jefaturas**

**Como** responsable de Recursos Humanos de un equipo comercial, **quiero** que las nueve plazas de «Vendedor» respondan a dos supervisoras distintas **para** que el organigrama muestre quién le responde a quién de verdad.

###### Criterios de aceptación

- El formulario del cargo trae una casilla **«todos los puestos dependen de la misma jefatura»**, marcada por defecto.
- Marcada, se elige **una sola jefatura** y vale para todas las plazas.
- Desmarcada, **cada plaza elige la suya** y las que no se toquen conservan la que tenían.
- Al desmarcarla, los desplegables de cada plaza abren **con el valor que la común venía diciendo**, no en blanco.
- Volver a marcarla avisa, antes de guardar, que las plazas responden hoy a jefaturas distintas y que todas van a pasar a la elegida.
- El desplegable de jefatura **no ofrece a los subordinados** del propio puesto.
- Con las plazas repartidas, el panel de la izquierda del modal las **agrupa por jefatura** en vez de colgarlas todas de una.
- La columna «Depende de» de la tabla dice **«2 jefaturas»** cuando están repartidas, y el nombre cuando es una sola.
- En el organigrama, las plazas se dibujan bajo **su** jefatura, y siguen siendo un solo cargo.
- El cargo declara además **con qué jefatura nacen las plazas nuevas**, y cambiarla no mueve a ninguna existente.
- Un cargo sin plazas puede contestar esa jefatura por defecto y se guarda igual.
- Todo lo anterior funciona **igual** desde la ficha del cargo y desde el modal del organigrama.

Se apoya en **BR‑ORG‑012 · BR‑ORG‑024 · BR‑ORG‑017** · Pantalla: Cargos · Organigrama

**HU-ORG-08 · Declarar dónde más trabaja un puesto**

**Como** responsable de Recursos Humanos, **quiero** registrar que un analista de Tecnología también trabaja para Marketing **para** que su evaluación incluya a quien de verdad ve su trabajo.

###### Criterios de aceptación

- Cada apoyo se declara como un **par**: la unidad y a quién responde en ella.
- El desplegable del jefe funcional **solo ofrece cargos de la unidad elegida**.
- Cambiar la unidad **limpia** el jefe funcional elegido antes.
- El jefe funcional puede quedar vacío, y eso significa **«cuelga de la unidad»**, no un dato faltante.
- La lista **no ofrece la unidad propia** del puesto.
- La lista **no ofrece una unidad ya declarada** en otra fila del mismo puesto.
- Si no queda ninguna unidad libre, el botón de agregar **no aparece**.
- En el organigrama, el puesto se dibuja también dentro de cada unidad que apoya, con una **línea secundaria** distinguible de la estructural en escala de grises.
- El puesto **no se cuenta** en la unidad que apoya: se cuenta en la que pertenece.
- El apoyo **no cambia** de quién depende estructuralmente.
- El editor es el mismo desde la ficha del cargo y desde el modal del organigrama.

Se apoya en **BR‑ORG‑013 · BR‑ORG‑031 · BR‑ORG‑032** · Pantalla: Cargos · Organigrama

**HU-ORG-09 · Mirar el organigrama de la manera que me sirve**

**Como** directora general, **quiero** ver la estructura como gráfico, como cards o como tabla **para** poder entender su forma, recorrerla o compararla según lo que necesite.

###### Criterios de aceptación

- Hay **tres vistas** y un control para cambiar entre ellas: **gráfico**, **cards** y **tabla**.
- Las tres muestran **el mismo dato**: cambiar de vista no agrega ni saca a nadie.
- Los **filtros puestos se conservan** al cambiar de vista.
- **Gráfico:** dibuja el árbol con sus líneas; las áreas se anidan unas en otras y las líneas salen de los puestos.
- **Gráfico:** los cargos de staff y los externos se dibujan **al costado** de la línea, no debajo.
- **Gráfico:** la altura de cada cuadro se mide contra el peldaño de su jefe; sin peldaño declarado, el cuadro no se mueve.
- **Gráfico:** un cargo con varias plazas se dibuja como **un cuadro** que se abre para mostrarlas.
- **Cards:** muestra cada nodo como una tarjeta recorrible, con su ocupante y su estado.
- **Tabla:** muestra las mismas columnas que la lista, para comparar y ordenar.
- En cualquiera de las tres, un cuadro **se abre a la ficha** del nodo.
- Crear o editar desde el dibujo pregunta lo mismo que la ficha y guarda los mismos datos.
- Lo creado o cambiado en una vista está en las otras **al instante**, sin sincronizar nada.

Se apoya en **BR‑ORG‑017 · BR‑ORG‑014 · BR‑ORG‑030 · RF‑ORG‑030, 037, 039** · Pantalla: Organigrama

**HU-ORG-10 · Mirar solo el pedazo que me importa**

**Como** líder de una unidad, **quiero** recortar el organigrama por lugar, por unidad organizacional, por unidad de negocio o por lo que hace a un cargo lo que es **para** poder revisar mi parte sin perderme en la empresa entera.

###### Criterios de aceptación

- Los filtros son **cuatro desplegables con su nombre**: Cargos, Unidad organizacional, Unidad de negocio y Lugar.
- Lo que muestra cada uno es **la respuesta**, y el que recorta algo **se pinta**.
- Sin ningún filtro puesto, los cuatro dicen «Todos», «Toda la empresa» o «Todas», y no hace falta ningún cartel de «sin filtros».
- Lugar ofrece **regionales, sucursales y centros de trabajo** en árbol; Unidad de negocio, las de la empresa y **Transversal**.
- Se puede recortar por lo que hace a un cargo lo que es —**tipo, nivel de mando y si está vacante**— y los tres van juntos en Cargos.
- Con un lugar o una unidad de negocio elegidos, su tarjeta va **arriba de todo** en el dibujo.
- Filtrar **no borra ni oculta datos del sistema**: solo cambia lo que se dibuja.
- Al filtrar por una sede, la **línea de mando sube completa** hasta arriba, aunque los jefes sean de otra sede.
- El control de **«qué se dibuja»** —unidades y cargos, solo los cargos, solo las unidades, por lugar y por unidad de negocio— está a la vista sobre el lienzo y **no** entra entre los filtros.
- Cambiar «qué se dibuja» no deja a nadie afuera: cambia qué documento es.
- «Qué se dibuja» y los recortes se pueden combinar.

Se apoya en **BR‑ORG‑018 · BR‑ORG‑033 · BR‑ORG‑034** · Pantalla: Organigrama

**HU-ORG-11 · Llevarme el organigrama**

**Como** directora general, **quiero** exportar el organigrama a un archivo **para** poder pegarlo en una presentación de directorio.

###### Criterios de aceptación

- Se exporta a **PNG**, a **SVG** y a impresión o PDF.
- Lo que se exporta es el **organigrama entero a tamaño natural**, no el pedazo visible en pantalla.
- El archivo lleva el **nombre de la empresa** en su cabecera.
- Si hay filtros puestos, se exporta **lo que se está viendo**, y el archivo lo dice.
- Una estructura de doscientos puestos sale completa y legible.
- El PDF conserva el **texto buscable**.

Se apoya en **RF‑ORG‑034 · BR‑ORG‑036** · Pantalla: Organigrama

**HU-ORG-12 · Ajustar los colores para que mi gente los distinga**

**Como** responsable de Recursos Humanos, **quiero** cambiar los tonos de la leyenda del organigrama **para** que se lean bien proyectados, fotocopiados y por quien no distingue ciertos colores.

###### Criterios de aceptación

- Se puede cambiar **el tono** de cada significado de la leyenda y el color de marca.
- No se puede cambiar **cuántos significados hay** ni **cuál pinta qué**.
- Al cambiar un tono, un pedazo de organigrama de al lado muestra **los cinco conviviendo**, no un cuadrito suelto.
- Cada codificación lleva **tres señales a la vez**: color, forma del borde e ícono.
- En blanco y negro, un cargo externo se sigue reconociendo por su borde y su ícono.
- Cambiar los colores **no toca ningún dato** de la estructura.

Se apoya en **BR‑ORG‑035 · RF‑ORG‑036** · Pantalla: Organigrama › Colores

**HU-ORG-13 · Reorganizar sin volver a cargar nada**

**Como** responsable de Recursos Humanos, **quiero** mover un área completa a otro sitio de la estructura **para** reflejar una reorganización sin rehacer el trabajo de carga.

###### Criterios de aceptación

- Cambiar «Depende de» en la ficha de una unidad **mueve toda su rama**: sus subunidades, sus cargos y las plazas de esos cargos.
- El desplegable **no ofrece** nodos de niveles inferiores, así que la opción imposible no está.
- El organigrama y las tablas lo reflejan **en el acto**.
- Los **ids no cambian**: los otros módulos siguen encontrando lo que tenían guardado.
- La sede que la rama heredaba se **recalcula sola** con el sitio nuevo, sin tocar un registro.
- Eliminar un nodo que tiene cosas dentro está **impedido**, y el sistema dice cuántas hay que mover primero.
- Eliminar pide **escribir la palabra** y va marcado como acción de riesgo.

Se apoya en **BR‑ORG‑002 · BR‑ORG‑006 · BR‑ORG‑016 · RNF‑ORG‑03** · Pantalla: Ficha de un nodo

**HU-ORG-14 · Cerrar una sede sin perder su historia**

**Como** responsable de Recursos Humanos, **quiero** dar de baja una sucursal que dejó de operar **para** que deje de ofrecerse sin borrar lo que pasó ahí.

###### Criterios de aceptación

- El estado se cambia por **una sola acción**, «Cambiar estado», desde el menú de la fila.
- En la ficha el estado es un **dato mostrado**, no un desplegable del formulario.
- Al cambiar el estado, el sistema pide el estado nuevo y avisa **qué cuelga** de ese nodo.
- Una sucursal cerrada **deja de ofrecerse** para cosas nuevas.
- Una sucursal cerrada **conserva** su historia, su gente y sus puestos.
- Cerrar **no es** eliminar: eliminar es otra acción, marcada como riesgo, que pide escribir la palabra.

Se apoya en **BR‑ORG‑016 · RF‑ORG‑015, 028** · Pantalla: Estructura física

**HU-ORG-15 · Saber de quién dependo**

**Como** colaborador, **quiero** ver mi puesto y mi línea de mando **para** saber a quién le llevo lo que necesito resolver.

###### Criterios de aceptación

- Desde su aplicación, el colaborador ve el **organigrama** y su propio puesto señalado.
- Ve **de quién depende** y quiénes dependen de él.
- Si su puesto apoya funcionalmente a otra unidad, lo ve también.
- No puede crear, mover ni editar nada de la estructura.
- Lo que ve sale de la **misma estructura** que edita Recursos Humanos, sin copia intermedia.

Se apoya en **BR‑ORG‑020 · BR‑ORG‑012 · BR‑ORG‑013** · Pantalla: Organigrama · App del colaborador

### 9.2 Plan de prototipado

El prototipo no es la maqueta ni el producto: es **dónde se contestan las preguntas que el documento no puede contestar solo**. Cada etapa existe para responder una, y termina cuando esa pregunta está contestada —no cuando la pantalla se ve linda—.

| Etapa | Qué se prototipa | La pregunta que contesta | Cómo se sabe que terminó |
| --- | --- | --- | --- |
| **P‑1** | El esquema de niveles y las dos listas del árbol | ¿Una empresa reconoce su estructura en estos ocho niveles y puede armarla sola? | Tres empresas de rubros distintos arman su estructura completa sin pedir ayuda |
| **P‑2** | La ficha de un nodo, con sus siete caras | ¿Una sola forma sirve para los siete tipos sin que ninguno se sienta forzado? | Ningún tipo necesita un campo que la forma no sepa dibujar |
| **P‑3** | El cargo, sus plazas y sus jefaturas | ¿Se entiende la diferencia entre el rol y la silla sin que se la expliquen? | Alguien de RR.HH. carga «nueve vendedores con dos supervisoras» a la primera |
| **P‑4** | El organigrama dibujado, en sus tres vistas | ¿El dibujo dice lo mismo que las tablas, y se lee de un vistazo? | Nadie encuentra una diferencia entre lo que dibuja y lo que lista |
| **P‑5** | Los filtros, la exportación y los colores | ¿Se puede sacar de acá el documento que hoy se hace a mano en PowerPoint? | Una presentación de directorio sale del sistema sin retoques |

**Qué está prototipado hoy y qué no.** P‑1 a P‑4 están construidas y son lo que se puede tocar. De P‑5 están los filtros y los colores; la exportación y la importación desde planilla están dibujadas y no funcionan —el modal de importar muestra la plantilla y el sitio donde se suelta el archivo, y ahí termina—. La trazabilidad de cada regla lo dice caso por caso.

**Lo que el prototipo no contesta y hay que decidir en otro lado:** los permisos por rol, que se verifican en el servidor y no escondiendo botones —ABIERTA‑09—, y el histórico de la estructura, que cambia el modelo y no se puede agregar después —FUERA‑01—.

## Cómo se mantiene este documento

*Las reglas que lo mantienen siendo la única fuente de verdad del módulo.*

Este documento es la única fuente de verdad del módulo mientras dure el proyecto. Para que siga siéndolo:

- **Cada decisión que se toma en una reunión entra aquí**, con fecha, en el historial de versiones. Una decisión que solo vive en un chat no existe.
- **Cuando se responda una decisión abierta**, se borra de 6.7 y la respuesta se incorpora al cuerpo. La lista debería vaciarse, no crecer.
- **Si el prototipo y este documento no coinciden**, se corrige el que esté mal, y se corrige antes de entregarle nada a desarrollo.
- **Los códigos no se reutilizan.** Si una regla o un requisito se elimina, su número queda libre y vacío. Citar RF‑ORG‑012 tiene que significar lo mismo dentro de un año.
- **Una regla en *Borrador* no se presenta como aprobada.** El estado es parte de la regla y se actualiza cuando alguien la revisa, no cuando alguien la escribe.
- **Cada regla se escribe en los cuatro apartados** —información básica, escenarios ágiles de ejecución, condiciones y excepciones, y trazabilidad—, y la trazabilidad se declara aunque esté pendiente. Una regla que no los tiene está a medio escribir.
- **La versión sube cuando cambia lo que el documento promete**, no cuando se corrige una palabra.

**Y hay una regla más, que es la que le dio origen a esta versión:** si desarrollo no está entendiendo el documento, el problema es del documento. Un módulo que se explica en nueve secciones y aun así se construye distinto no tiene un problema de lectura.

### Historial de versiones

| Versión | Fecha | Qué cambió |
| --- | --- | --- |
| — | ago 2026 | **Antecedente: el PRD · Organigrama**, en cuatro versiones entre el 4 y el 11 de agosto. Modelaba la estructura sobre el modelo anterior —el cargo era la unidad y la persona lo ocupaba— y de él vienen el diseño de este documento, el glosario al frente, los principios y el anexo de decisiones |
| 1.0 | 7 sep 2026 | La documentación del módulo en formato BR: veinte reglas con escenarios, treinta y un requisitos funcionales con código estable, ocho flujos y cinco wireframes. **Cambia el modelo:** un solo árbol de nodos, el esquema de niveles como dato de la empresa, y el cargo separado del puesto |
| **2.0** | 7 sep 2026 | **Los dos documentos se unen en uno.** El contenido del módulo —reglas, requisitos, flujos y wireframes— entra en la estructura de nueve secciones del PRD, que es la que se sostiene: glosario al frente, contexto, integraciones módulo por módulo, modelo de datos y roadmap. **Se rescata del PRD de agosto** todo lo que seguía valiendo y se reescribe sobre el modelo nuevo: qué es un organigrama, los principios de diseño, las integraciones, el camino hasta desarrollo, los riesgos y el anexo de decisiones. **Se anota lo que falta** en vez de disimularlo: registro de actividad, estados vacíos y permisos verificados en el servidor quedan como ABIERTA‑07 a ABIERTA‑09. **Sin revisar todavía** |
| **2.1** | 9 sep 2026 | Entra BR‑ORG‑021: **el cargo y la plaza llevan códigos distintos**, también cuando el cargo tiene una sola plaza. Es como lo maneja Recursos Humanos —el manual de cargos y la plantilla de personal son dos documentos— y no estaba escrito en ninguna parte, así que el formulario mostraba dos campos «Código» sin decir por qué eran dos |
| **3.5** | 7 oct 2026 | **Los filtros del organigrama dejan de ser una frase y el dibujo dice dónde está cada cosa.** BR‑ORG‑033 se reescribe: los filtros son **cuatro desplegables con su nombre** —Cargos, Unidad organizacional, Unidad de negocio y Lugar—, el que recorta se pinta, Lugar ofrece regionales, sucursales y centros de trabajo en árbol, y Unidad de negocio ofrece las de la empresa y Transversal. Se escribe **cómo se lee dónde está un puesto y de qué unidad de negocio es** —lo suyo o, si no dice, lo de su unidad; y la unidad de negocio de su unidad o, si es transversal, la del lugar donde trabaja— y que **lo transversal no entra al filtrar por una unidad de negocio**. Y entra que **lo que recortan los filtros se ve en el dibujo**: una tarjeta de lugar donde cambia el lugar y una de unidad de negocio donde empieza, que no se repiten en lo que hereda, y la del elegido arriba de todo. BR‑ORG‑034 suma los modos **por lugar** y **por unidad de negocio**, que cuelgan las unidades de un sitio y no de un jefe. Se actualizan RF‑ORG‑031, F‑ORG‑07, W‑03 y HU‑ORG‑10, y el anexo suma por qué los filtros dejaron de ser una frase y por qué las tarjetas van donde empiezan |
| **3.4** | 10 sep 2026 | **Cuatro reglas que el módulo daba por sabidas y nadie había escrito.** BR‑ORG‑043: **ni los códigos ni los nombres se repiten** —el código, único en toda la empresa; el nombre, único entre hermanos del mismo tipo, porque un «Almacén» en La Paz y otro en Santa Cruz son dos sitios distintos—, y la comprobación ignora mayúsculas, tildes y espacios de más. BR‑ORG‑044: **un puesto ocupado no se elimina**, y el intento abre un aviso que nombra a la persona, explica que quedaría fuera de la estructura y ofrece los dos caminos que sí resuelven. BR‑ORG‑045: **una persona ocupa un solo puesto**; trabajar para otra área es dependencia funcional, no una segunda silla. BR‑ORG‑046: **desactivar arrastra la rama entera**, contando antes cuántos nodos caen y cuántos de esos puestos están ocupados, y reactivar ofrece devolver a los que cayeron. Esta última contesta ABIERTA‑02, que **sale de las decisiones abiertas**. Y entra BR‑ORG‑047: **cerrar una sede ofrece mudar a su gente a otra activa** antes de cerrarla, cambiando el sitio de trabajo de sus puestos y nada más —ni unidad, ni cargo, ni jefe—, y permite cerrar sin destino cuando la operación termina y esas personas se desvinculan. Y BR‑ORG‑048: **ningún nodo cuelga de sí mismo ni de los que cuelgan de él**. La regla de jerarquía no lo cubría —compara niveles, y «una unidad dentro de otra unidad» le parece válido en las dos direcciones—, y un bucle desprende esa rama del árbol: el organigrama, que se dibuja desde la empresa hacia abajo, deja de mostrarla. El tercer nivel de mando pasa a llamarse **mando inferior** en todo el documento |
| **3.3** | 10 sep 2026 | **Las cuarenta y una reglas pasan a un formato único de cuatro apartados**, por observación de QA: **1 Información básica** —código, grupo, alcance, estado y una descripción general—, **2 Escenarios ágiles de ejecución**, **3 Condiciones y excepciones** y **4 Trazabilidad**. **El «Ticket: pendiente» suelto al pie de cada regla desaparece** y pasa a ser el apartado 4, con ticket, requisitos, historia de usuario, pantalla y estado del diseño declarados uno por uno. **Las descripciones se reescriben en tono descriptivo**: lo narrativo —«es la cima del eje físico», «es la ficha más corta»— se enuncia como lo que el sistema hace, sin perder el motivo. Y BR‑ORG‑004 decía tres niveles fijos donde son cuatro: el puesto faltaba |
| **3.2** | 10 sep 2026 | **Dos diagramas y dos wireframes.** Se dibujan los dos casos que más cuesta contar por escrito: **los nueve vendedores** —un cargo, nueve sillas, dos líneas de mando— en el 0.4, y **las tres empresas** que pegan la unidad de negocio en tres escalones distintos, dentro de BR‑ORG‑022. Entran W‑06 Niveles de mando y W‑07 El cargo y sus plazas —las dos pantallas sin dibujar, y W‑07 es donde vive lo más difícil del módulo—. Y W‑05 marcaba como obligatorios la razón social, el NIT y el país, que no lo son: el único obligatorio de la empresa es el nombre comercial |
| **3.1** | 10 sep 2026 | **Entra el punto 09: quince historias de usuario con sus criterios de aceptación, y el plan de prototipado.** El documento decía qué es verdad —las reglas— y qué tiene que hacer cada pantalla —los requisitos—, pero no decía **qué se entrega ni cómo se acepta**, y sin eso dos personas leen los mismos requisitos y construyen cosas distintas, las dos defendibles. Los criterios están escritos como afirmaciones que se marcan hechas o no hechas delante de la pantalla: si uno necesita interpretación, no es un criterio. HU‑ORG‑09 cubre las tres vistas del organigrama —gráfico, cards y tabla— una por una. El 9.2 dice qué contesta cada etapa del prototipo, cómo se sabe que terminó, y qué está construido hoy y qué está solo dibujado |
| **3.0** | 10 sep 2026 | **Barrido del prototipo buscando lo que un desarrollador necesita y el documento no decía.** **Datos de la empresa** no tenía ninguna regla y es la primera pantalla del módulo: entran BR‑ORG‑036 —la raíz solo exige su nombre, porque el organigrama lo imprime en su cabecera— y BR‑ORG‑037 —el país se declara una vez y de él salen las ciudades de cada alta—. **Configuración** gana BR‑ORG‑038: la vista previa se rehace en el momento y los interruptores se ajustan a lo que hay cargado. **Unidades de negocio** gana BR‑ORG‑039: lo que agrupa se ve y no se asigna desde ahí, porque dos puertas para un dato terminan discrepando. Y entra el grupo **Las fichas y las listas**, que es la forma que comparten todos los tipos: BR‑ORG‑040 una sola ficha que abre para mirar, BR‑ORG‑041 lo obligatorio bloquea y dice por qué hace falta, y BR‑ORG‑042 la tabla dibuja el árbol y al buscar se aplana |
| **2.9** | 10 sep 2026 | **Tres asuntos con pantalla propia y sin reglas.** **Dependencia funcional** pasa a ser su propio grupo: BR‑ORG‑031 cada apoyo es un par —la unidad y a quién responde ahí, elegido entre los cargos de esa unidad—, y BR‑ORG‑032 se dibuja con línea secundaria y no se cuenta dos veces, porque «¿cuánta gente tiene esta área?» no puede tener dos respuestas defendibles. **Los filtros:** BR‑ORG‑033 se leen como una frase que sin filtros sigue siendo verdad, y BR‑ORG‑034 «qué se dibuja» no es un filtro —cambia el papel, no a quién se deja afuera—. **Los colores:** BR‑ORG‑035 la empresa elige los tonos y nunca los significados, y el color nunca va solo: cada codificación lleva color, borde e ícono a la vez |
| **2.8** | 10 sep 2026 | **Niveles de mando pasa a ser su propio grupo.** Tiene su pantalla, su editor y su dibujo, y estaba al final del grupo de Cargos como si fuera un detalle del cargo. Entran dos reglas que nadie había escrito y salen del prototipo: BR‑ORG‑029 un nivel de mando **no es una línea de mando** —los peldaños no se reportan entre sí, y por eso la escala se dibuja sin una sola línea entre los cuadros—, y BR‑ORG‑030 la altura de un cuadro se mide **contra su jefe y no contra su fila**, porque medir contra la fila dibujaba a un jefe de planta y a un pasante como pares |
| **2.7** | 10 sep 2026 | **Dos reglas decían «no cuelga de X» donde la frase honesta es «cuelga de X en el árbol y de otra cosa en el dibujo».** BR‑ORG‑008: un cargo pertenece a una unidad y su cuadro aparece debajo del cuadro de otro cargo, porque la línea sale de a quién responden sus sillas. BR‑ORG‑023: una unidad **sí se anida en otra unidad** —el nivel es anidable y hay empresas con cuatro escalones de área—; lo que no sale del anidamiento es la línea, que sale del puesto que la manda. Enunciadas como estaban, las dos contradecían lo que cualquiera ve en pantalla. **Y los tres escenarios de BR‑ORG‑022** pasan a ser tres empresas que pegan la etiqueta en tres escalones distintos —regionales, sucursales, áreas— con la misma escalera debajo, que es lo que la regla venía a enseñar |
| **2.6** | 10 sep 2026 | **Los ocho flujos y los cinco wireframes, contra la pantalla real.** W‑04 dibujaba un lápiz en cada nivel, «Sede *(era Sucursal)*» y un botón «Agregar un nivel»: tres controles que ya no van a existir, y un wireframe que los dibuja es lo que alguien va a construir. Sale el vocabulario viejo —«clase de puesto: colaborador, staff u outsourcing»— del glosario, el modelo de datos, las integraciones, dos flujos, un wireframe y el anexo. F‑ORG‑02 pedía «nombre, país, estado» y la ficha también pide ciudad; F‑ORG‑04 seguía diciendo que la sucursal de una unidad se deduce, y se declara; F‑ORG‑03 gana el cupo y la jefatura de las sillas; y W‑02 decía seis tipos donde son siete |
| **2.5** | 10 sep 2026 | **Tres escenarios por regla** —el camino corriente, el caso distinto que la regla también gobierna, y lo que el sistema hace cuando algo no cierra—: ochenta y uno en total, y lo que estaba dicho en prosa vuelve a ser verificable. **Pasada del documento contra el prototipo:** entra «Niveles de mando» al mapa de pantallas, que tiene su ruta y su editor y no estaba listada; RF‑ORG‑025 deja de confundir el cupo con las plazas abiertas, que son dos cosas; y RF‑ORG‑012 agrega que una columna también desaparece cuando ninguno de los tipos a la vista podría llenarla. **Se cierra ABIERTA‑05:** un cupo que baja por debajo de los puestos abiertos se bloquea, y así está construido |
| **2.4** | 10 sep 2026 | **Estructura física deja de tener una sola regla y encima ajena.** Entran cuatro escritas de lo que las fichas piden hoy: BR‑ORG‑025 la regional agrupa y no depende de nada —y pide nombre, país, ciudad y estado, nada más—, BR‑ORG‑026 la sucursal es la sede y el centro de trabajo el domicilio que sale en los papeles laborales, BR‑ORG‑027 los tres desplegables del centro se acotan entre sí y se guarda el más específico, y BR‑ORG‑028 la dirección sale de catálogos y el departamento solo aparece donde esa división existe con ese nombre. BR‑ORG‑006 se muda a Unidades organizacionales: habla de dónde está una unidad, no de un nivel físico |
| **2.3** | 10 sep 2026 | **Renombrar, reordenar y agregar niveles de estructura salen del producto** y pasan a FUERA‑05: la escalera se enciende y se apaga, y nada más. Se va BR‑ORG‑019 con ellos, y las dos mitades que los exigían —RF‑ORG‑004 y RF‑ORG‑005—, dejando el hueco en la numeración como manda el 4.2. Lo que **no** se toca es que ninguna etiqueta esté escrita en el código de una pantalla —RNF‑ORG‑06—: sale de la lista de la empresa, y eso es lo que hará barato el editor el día que se agregue. **El nivel de mando no se administra en Configuración**: tiene su pantalla dentro de Estructura organizacional, así que BR‑ORG‑015 se muda al grupo de Cargos |
| **2.2** | 10 sep 2026 | **Las reglas se agrupan por lo que gobiernan** —la configuración, los cimientos del modelo, la estructura física, las unidades de negocio, las organizacionales, los cargos, los puestos y el dibujo— y en el orden en que una empresa arma su estructura. **Un solo escenario por regla:** los segundos estaban marcados como el camino cerrado y casi ninguno lo era, así que lo que de verdad se impide pasó al párrafo de cada regla. **Entran tres reglas:** BR‑ORG‑022 la unidad de negocio se declara en un nivel y se hereda, BR‑ORG‑023 una unidad organizacional cuelga de un puesto, y BR‑ORG‑024 con qué jefatura nacen las sillas nuevas de un cargo. **Se reescriben tres:** el sitio se declara una vez y baja por la rama —BR‑ORG‑006—, el cupo es un techo que no se puede bajar por debajo de las sillas abiertas —BR‑ORG‑009—, y la jefatura se pregunta silla por silla —BR‑ORG‑012—. **Los tres tipos de cargo** pasan a llamarse regular, staff y externo, con su definición completa |

**Qué cambió respecto del PRD de agosto, y por qué importa.** El PRD de agosto modelaba el organigrama con el **cargo** como unidad y la persona como ocupante. El modelo de septiembre separa el **cargo** —el rol, que existe una vez— del **puesto** —la silla, que se abre tantas veces como haga falta—. No es un cambio de vocabulario: cambia dónde vive la dependencia estructural, cómo se cuenta una vacante y qué significa mover un cargo. **Donde este documento y el PRD de agosto digan cosas distintas, manda éste.**

## Anexo · Por qué decidimos así

*Los argumentos largos, separados del cuerpo para que el cuerpo prescriba y el anexo explique.*

Cada uno desarrolla alguno de los principios de 1.4 o alguna de las reglas de 4.

##### Por qué un solo árbol y no ocho tablas

Cada empresa dibuja su estructura distinto, y la respuesta que veníamos dando era agregar una pantalla por cada forma nueva: una para regiones, otra para divisiones, otra para el nivel que pidió el cliente de la semana. Con ocho tipos del mismo nodo, la forma de la organización deja de ser código y pasa a ser un dato. Lo que se gana no es elegancia: es que el próximo cliente raro no cuesta un desarrollo.

##### Por qué el esquema de niveles lo decide la empresa

Un colegio no usa regiones, una minera separa faenas de sus sucursales y una consultora de veinte personas no tiene ni lo uno ni lo otro. Si de qué escalones está hecha la estructura vive en el código, cada una de esas formas es un desarrollo; si vive en la configuración, es una lista de interruptores que la propia empresa mueve el primer día.

La palabra de cada escalón sigue el mismo camino a medias: ninguna pantalla la tiene escrita —sale de la lista de la empresa, RNF‑ORG‑06— pero todavía no hay dónde cambiarla, así que la lista trae los nombres de fábrica. La mitad cara está hecha; falta el editor.

##### Por qué la regla de jerarquía es una sola y no cuarenta

La alternativa era escribir cada prohibición a mano: «una región no va dentro de un cargo», «un cargo no va dentro de un puesto», y así hasta cansarse. Ordenar los niveles de estructura de lo más grande a lo más chico y exigir que el nodo superior esté por encima cubre todas de una vez, y además cubre las que todavía no existen: un nivel de estructura propio que la empresa agregue mañana ya está validado el día que lo crea.

##### Por qué saltarse un nivel de estructura es legal

La regla exige que el nodo superior esté por encima, no que sea el inmediato superior. Una empresa que usa regiones puede tener igual una sucursal que cuelga directamente de la empresa, porque en la vida real esa sucursal no pertenece a ninguna región. Exigir la cadena completa obligaría a inventar una región vacía para poder guardar, y ese es el tipo de dato falso que después nadie sabe de dónde salió.

##### Por qué el cargo se separó del puesto

Es el cambio más grande respecto del PRD de agosto. Con el cargo como unidad, cinco cajeros son cinco cargos que hay que renombrar de a uno, o un cargo con una persona adentro y las otras cuatro en ninguna parte. Separándolos, el rol se define una vez —y renombrarlo renombra las cinco sillas— y cada silla lleva lo que de verdad la distingue: dónde está, quién la ocupa y a quién le responde. Los tres son datos que cambian silla por silla, y ninguno se puede guardar en el rol sin mentir.

##### Por qué la dependencia estructural vive en el puesto

Dos sillas del mismo cargo en dos sedes pueden responderle a jefes distintos: el cajero de Casa Matriz le responde al supervisor de Casa Matriz. Deducirlo del cargo —«todos responden a la cabeza de su unidad»— alcanza para el caso corriente y miente en cuanto una unidad tiene dos jefaturas, que es exactamente el caso que uno necesita modelar bien.

##### Por qué la sucursal de una unidad se deduce

Si fuera un campo, habría que llenarlo en cada unidad, en cada subunidad y en cada cargo, y quedaría viejo el día que alguien mueva la rama de sitio. Heredándolo del primer ancestro físico, mover una dirección de una sucursal a otra corrige la sede de todo lo que cuelga de ella sin tocar un solo registro. El precio es que la ficha no pregunta dónde opera cuando ya lo sabe, y eso al principio se lee como un campo que falta.

##### Por qué «jefe» no es un tipo de cargo

Porque se puede leer del árbol: es jefe quien tiene otros colgando de él. Declararlo abre la puerta a la contradicción más fácil de todas —alguien marcado como jefe sin nadie a cargo, o al revés— y esa contradicción no la detecta nadie hasta que el organigrama sale raro en una presentación.

##### Por qué staff y outsourcing se dibujan al costado

No están en la dependencia estructural: asisten a un cargo o prestan un servicio. Dibujarlos debajo los convierte en subordinados y hace que el organigrama afirme algo que no es cierto. Y como no mandan, preguntarles a qué altura mandan no tiene respuesta posible: por eso el formulario les saca el campo en vez de dejarlo vacío.

##### Por qué desactivar y no borrar

Una sucursal que cerró tiene historia, gente y planillas detrás. Borrarla deja huérfano todo lo que la nombraba y no hay forma de reconstruirlo. Desactivarla la saca de los formularios —deja de ofrecerse para cosas nuevas— y la conserva en las tablas y en los históricos, que es lo que uno necesita cuando alguien pregunta dónde trabajaba tal persona en 2024.

##### Por qué filtrar recorta la vista y no el sistema

Un filtro que ocultara los cargos de otras sedes rompería el árbol: se irían los jefes y los subordinados quedarían colgando de la nada. Por eso filtrar por una sucursal se queda con las ramas que llegan a ella, jefes incluidos, y por eso cada recorte se ve en su desplegable, pintado: ningún filtro se aplica sin que quien mira sepa que lo puso.

##### Por qué los filtros dejaron de ser una frase

Fueron una frase —«Viendo todos los cargos de toda la empresa en todas las sucursales»— y se leía bien con tres huecos. Con la unidad de negocio eran cuatro, y la frase ya no se leía como frase: «de toda la empresa, de Farmacias, en Occidente» hay que releerlo para saber qué es cada trozo. Con el nombre encima, cada filtro se encuentra sin leer los demás, y se conserva lo que la frase tenía de bueno: lo que se ve es la respuesta, y no hace falta abrir nada para saber qué está recortando.

##### Por qué el lugar y la unidad de negocio se dibujan donde empiezan

Una etiqueta en cada unidad repetiría «Casa Matriz» en veinte cuadros, y lo que se repite en todos no distingue a ninguno. Una tarjeta donde el lugar **cambia** dice lo mismo una sola vez, y además marca dónde empieza cada lugar, que es lo que se viene a mirar. La unidad de negocio va en los puestos y no en las unidades porque en la práctica casi todas las unidades son transversales: la unidad de negocio llega por la sucursal donde se trabaja, y es ahí donde hay que mostrarla.

##### Por qué el glosario va primero y no en un anexo

Casi todos los desacuerdos de este módulo fueron de vocabulario, no de criterio: «cargo» y «puesto», «sucursal» como nivel del árbol o como filtro, «jefe» como clase o como consecuencia. Un glosario al final es un diccionario que se consulta cuando ya hubo un malentendido. Al principio es un acuerdo que lo previene.

Documentación del módulo de organización — versión 3.5, 7 de octubre de 2026. Souly HR. Reúne el PRD del organigrama de agosto de 2026 y la documentación del módulo de septiembre, sobre el modelo vigente: un solo árbol de nodos, el esquema de niveles como dato de la empresa y el cargo separado del puesto. **Las cuarenta y siete reglas están en estado borrador.**

## Anexo · El módulo en el prototipo, hoy

*Cómo está construido el módulo de organización en el prototipo al 7 de octubre de 2026. Todo lo de este anexo sale del código de `ficha_colaborador`, no del documento de arriba: sirve para saber qué de lo escrito ya existe, dónde vive y en qué se aparta.*

### Rutas y pantallas

Las rutas están declaradas en `src/App.jsx`. `/organizacion` redirige a `/organizacion/datos`.

| Ruta | Pantalla | Qué hace | En el menú |
| --- | --- | --- | --- |
| `/organizacion/datos` | `DatosEmpresa` | Ficha de la empresa que se lee y se edita en la misma pantalla: nombre comercial, razón social, NIT, rubro, país, contacto, dirección legal, web y redes, y el logo (se guarda en PNG) | Sí · Datos de la empresa |
| `/organizacion/distribucion` | `Estructura` con el eje físico | Tabla con pestañas Regionales · Sucursales · Centros de trabajo (`?ver=`). Buscador, paginación, botón «Nueva…» y menú por fila: Editar · Cambiar estado · Eliminar | Sí · Estructura física |
| `/organizacion/estructura` | `Estructura` con el eje organizacional | La misma tabla con Unidades de negocio · Unidades organizacionales · Cargos. Los cargos despliegan sus puestos. Enlace al catálogo de niveles de mando | Sí · Estructura organizacional |
| `/organizacion/nodo/nuevo` · `/organizacion/nodo/:id` | `NodoDetalle` | Una sola ficha para cualquier tipo de nodo; los grupos de campos salen de `gruposDe`. También elimina un puesto | — (se llega desde las listas) |
| `/organizacion/organigrama` | `Organigrama` (`src/pages/personas/Organigrama.jsx`) | Vistas Gráfico · Cards · Tabla. En el gráfico, cinco modos —unidades y cargos, solo los cargos, solo las unidades, por lugar y por unidad de negocio— y los apoyos funcionales sin / con / solo. Tarjetas de lugar (lima, con pin) y de unidad de negocio (azul acero, con maletín) donde cada uno empieza. Filtros con nombre: Cargos (tipo, nivel y estado), Unidad organizacional, Unidad de negocio y Lugar. Exporta PNG, SVG e «Imprimir o PDF». Menú para configurar mandos y colores | Sí · Organigrama |
| `/organizacion/configuracion` | `ConfiguracionOrg` | Los peldaños de la estructura: encender, apagar, renombrar, reordenar y agregar peldaños propios, con la cadena resultante arriba | Sí · Configuración |
| `/organizacion/mandos` | `Mandos` | Los niveles de mando en orden; se editan con `ConfigMandos`: reordenar arrastrando, renombrar y borrar avisando a cuántos cargos afecta | No · se llega desde «Niveles de mando» en Estructura organizacional |
| `/organizacion/negocio` | — | Redirige a `/organizacion/estructura?ver=negocios` | — |
| `/organizacion/sucursales` · `nueva` · `:id` | `Sucursales` · `SucursalDetalle` | Lista y ficha de sedes con la versión antigua de los datos. No borra una sede con puestos | No |
| `/organizacion/areas` | `Areas` | Árbol de unidades con indicadores, alta y edición en modal y borrado con `bloqueoUnidad` | No |
| `/organizacion/cargos` | `Cargos` | Catálogo de consulta que agrupa los puestos por nombre | No |
| `/organizacion/puestos` | `Puestos` | Tabla de consulta con filtros por área, tipo y ocupado / vacante | No |

`/personas/organigrama`, la ruta vieja, redirige a `/organizacion/organigrama`.

**La importación desde planilla es una maqueta.** El modal del organigrama tiene la zona para soltar un `.xlsx` o `.csv` y el botón «Descargar plantilla», pero todavía no procesa nada (F‑ORG‑08 y RF de importación).

### El menú

En el menú principal (`src/components/layout/modulos.js`), «Organización» va **antes** de «Gestión de personas» y lo ven sólo administradores y managers. Su submenú (`src/components/layout/ModuleNav.jsx`) tiene dos grupos:

- **Empresa:** Datos de la empresa · Estructura física · Estructura organizacional
- **Puestos y personas:** Organigrama · Configuración

### Qué se guarda y dónde

Todo vive en `localStorage` a través de `useLocalStorage` (`src/hooks/useLocalStorage.js`), que antepone `onb_demo_` a cada llave. Los estados se sirven desde `src/context/OnboardingDataContext.jsx`.

| Llave | Qué guarda |
| --- | --- |
| `onb_demo_estructuraNodos2` | **El árbol único de nodos**: la fuente real de sedes, unidades, cargos y puestos |
| `onb_demo_estructuraNiveles6` | El esquema de niveles de la empresa (`LLAVE_NIVELES`) |
| `onb_demo_organigrama` | Sólo lo que no es árbol: relaciones funcionales, niveles de mando, colores y acomodos del dibujo |
| `onb_demo_empresa` | Los datos de la empresa, la raíz |
| `onb_demo_sucursales` | La lista antigua de sucursales, que todavía usan `Sucursales` y `SucursalDetalle` |
| `onb_demo_empresasGrupo`, `onb_demo_organigramaColor`, `onb_demo_organigramaApoyos`, `onb_demo_organigramaDibujo` | El grupo empresarial y preferencias del dibujo |

**El objeto `organigrama` que reciben las pantallas se arma al vuelo** con `conListas(crudo, nodos)`: lo guardado en `onb_demo_organigrama` más `unidades` y `cargos` deducidos de los nodos. Al guardar se reparte al revés: las unidades vuelven a los nodos con `aplicarUnidades`, los cargos con `aplicarCargos`, y el resto a `onb_demo_organigrama`.

**La forma de cada cosa:**

- **Nodo:** `{ id, tipo, nombre, padreId, estado, … }`. Los tipos base son empresa, region, sucursal, centro, negocio, unidad, cargo y puesto. Según el tipo suma código, nombre corto, tipo de unidad o de centro, ubicación, línea de negocio, responsable, ciudad, dirección…
- **Cargo:** además `nivelMando`, `tipoCargo`, `destacado`, `maxPersonas` (el cupo) y `jefeSillas`.
- **Puesto:** su `padreId` es el cargo; tiene `codigo`, `ubicacion`, `ocupanteId` y `ocupante` (el nombre), `reportaA` (de quién depende) y `funcionales`.
- **Relación funcional:** `{ id, origen, destino, tipo: 'funcional', calidad: 'par' | 'supervisor_funcional', desde, hasta }`.
- **Catálogos:** `NIVELES_MANDO` (superior, medio y bajo, renombrables), `TIPOS_CARGO` (Regular, Staff y Externo), `TIPOS_UNIDAD`, `TIPOS_CENTRO` y `NEGOCIOS_COMUNES`, que son sugerencias y no una lista cerrada.

### Las funciones que usan los demás módulos

En `src/data/organigramaData.js`:

- `ocupanteDe(cargo)` y `ocupantesDe(cargo)`: quién ocupa una silla.
- `nivelesDe(org)` y `gradoDe(cargo, org)`: el catálogo de mandos de la empresa y el nivel de un cargo con su orden.
- `funcionalesDe`, `areasQueApoya` y `apoyosDeUnidad`: la dependencia funcional.
- `cuadroDe`, `cargoDe`, `areaDe` y `sedesDe(persona, org)`: dónde está sentada una persona.
- `buildOrgTree`, `filasTabla`, `cabezaDe`, `esVacante`, `filtrarPorSucursal`, `filtrarPorUnidad`, `filtrarPorNegocio`, `descendientesDe`, `eliminarCargo` y `bloqueoUnidad`.
- `lugarDeUnidad(unidadId, org)` y `lugaresDeCargo(cargo, org)`: dónde está una unidad —su `ubicacion` o la de la primera madre que la declare— y dónde trabaja un puesto —lo suyo o, si no dice, lo de su unidad—.
- `negociosDeCargo(cargo, org, lineaDe)`: la unidad de negocio de un puesto, la de su unidad o, si es transversal, la del lugar donde trabaja.

En `src/data/estructuraData.js`:

- `filasEje(nodos, tipos)`: las filas de una dimensión, cada nodo colgado del ancestro más cercano de su mismo eje. Es la que permite saltarse un nivel apagado.
- `descendientes(id, nodos)`: toda la rama de un nodo.
- `lineaDe(id, nodos)`: la unidad de negocio de un nodo, heredada por su cadena organizacional o, si esa no dice nada, por su ancla física (BR‑ORG‑022).
- `ancestroDe`, `caminoDe`, `anclaDe`, `hijosDe`, `EJES`, `vistasDeEje`, `listaDe`, y las que traducen entre nodos y listas: `cargosDeNodos`, `aplicarCargos`, `unidadesDeNodos`, `aplicarUnidades`, `aplicarMandoDeUnidad`, `sanearNiveles`, `nivelesIniciales`.

### Componentes propios del módulo

En `src/components/organizacion/`:

- **`ApoyoFuncional.jsx`**: el editor de «También trabaja en» —a qué unidades apoya un puesto y, en cada una, a quién responde—. Exporta también `ModalApoyoFuncional`. Lo usan el Organigrama, Estructura, NodoDetalle y la ficha del colaborador.
- **`ConfirmarBorrado.jsx`**: pide escribir «eliminar» antes de borrar, y admite un texto que explica por qué algo no se puede borrar.
- **`PastillaEstado.jsx`**: la etiqueta de estado, con la palabra que corresponde a cada tipo de nodo (Activa, Cerrada, Inactiva…).

En `src/components/personas/`, las piezas del dibujo: `OrgGrafico`, `OrgNodos`, `exportarOrganigrama`, `ConfigMandos` y `ConfigColores`.

### Qué lee y qué escribe la ficha del colaborador

Es la integración de 2.3 funcionando. La ficha (`src/pages/personas/ColaboradorNuevo.jsx` y `src/data/fichaColaborador.js`) arma su contexto a partir de `organigrama` y de los nodos:

| Campo de la ficha | De dónde sale |
| --- | --- |
| **3.11 Cargo** | Una opción por cargo, unidad y sede, que asigna la primera silla libre. El cargo sin sillas libres se ve apagado, con el motivo. Cada opción trae su área, su sede, su jefe (el ocupante de `reportaA`), su tipo y su nivel de mando |
| **3.11n Nivel de mando** y **3.11t Tipo de cargo** | Se deducen del puesto elegido, con `nivelesDe` y `TIPOS_CARGO`. No se escriben |
| **3.3 Unidad de negocio · 3.5 Unidad organizacional · 3.7 Región · 3.8 Sucursal · 3.10 Centro de trabajo** | Salen de `filasEje` sobre los nodos y se acotan entre sí con `lineaDe` y `descendientes`: elegida una sucursal, los centros son los suyos |
| **3.15f Apoya funcionalmente a** | Las unidades y los cargos del organigrama, sin la unidad propia del cargo elegido. Se guarda como `[{ unidadId, reportaA }]`, la misma forma que el puesto |
| **3.13 Supervisor inmediato · 3.16 Aprobadores de permisos** | Del directorio de colaboradores vigentes que ocupan un cargo, con foto y cargo. No se deducen de la jefatura del puesto |

**Al dar de alta, la ficha escribe en la estructura una sola cosa: quién ocupa la silla.** Deja `ocupanteId` en el cargo elegido en 3.11, y `aplicarCargos` lo baja al nodo puesto junto con el nombre en `ocupante`. Es lo que 2.3 promete: Gestión de personas es el único módulo que además escribe.

### En qué se aparta el prototipo del documento

| Tema | El documento dice | El prototipo hace |
| --- | --- | --- |
| La jefatura del puesto | Se guarda en `jefeId`, en el puesto (0.7, 5.4) | Se guarda en **`reportaA`**. No hay un campo `jefeId` |
| El tercer nivel de mando | Nace como «Mando inferior» | Nace como **«Mando bajo»** (llave `bajo`). La empresa lo puede renombrar |
| La importación desde planilla (F‑ORG‑08) | Carga la estructura desde un Excel o CSV | El modal existe, sin lógica: todavía no procesa archivos |
| Pantallas fuera del menú | Siete pantallas (8.1) | Además de las siete, siguen vivas `sucursales`, `areas`, `cargos` y `puestos`, de una versión anterior y sin entrada en el menú |
| Títulos de la barra superior | — | `Header.jsx` tiene título para datos, sucursales, áreas, cargos, puestos y organigrama, pero no para Estructura física, Estructura organizacional, Mandos ni Configuración |
