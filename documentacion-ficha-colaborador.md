Souly HR · Módulo de personas · Documentación de producto

# Documentación de la ficha del colaborador

> **Documentación de la ficha del colaborador — versión en Markdown.** Es el documento del módulo de gestión de personas. Reúne completo el documento de producto `public/gestion-de-personas.html` (versión 1.103, 30 de septiembre de 2026): glosario, contexto, integraciones, funcionalidades, las reglas de negocio con sus escenarios, modelo de datos, roadmap, flujos, wireframes, historias de usuario y el anexo de decisiones. Describe la ficha tal como se ve en la versión publicada. Los wireframes y diagramas dibujados se conservan en el HTML; acá quedan nombrados, con todo lo que muestran.

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

La ficha del colaborador deja de ser un formulario de doscientos campos y pasa a ser *un alta que se hace por partes, sin perder nada, y que sienta a la persona en su puesto*. Este documento define qué es, qué reglas cumple, qué tiene que hacer el producto y cómo se opera.

![Tres VIA juntos: uno con planilla y traje, otro con planos y chaleco de obra, y otro con una tableta de indicadores](public/assets/imagenes/via_rrhh_proyectos.png)

- **Versión:** 1.103
- **Fecha:** 30 de septiembre de 2026
- **Autoría:** Paola Gema — Diseñadora UX
- **Revisa y aprueba:** Por definir
- **Estado:** Borrador

| En este documento | Cantidad |
| --- | --- |
| pestañas en la ficha de alta | 5 |
| datos distintos en la ficha | 240 |
| datos del mínimo legal | 32 |
| datos que impiden el alta | 3 |
| reglas de negocio | 34 |
| requisitos funcionales | 52 |
| historias de usuario | 13 |
| diagramas | 5 |
| decisiones abiertas | 15 |

### La ficha, de un vistazo

Cinco pestañas en el riel y, bajo la abierta, sus partes numeradas. Cada pestaña dice **cuánto está lleno** con su aro y **si debe algo del mínimo legal** con un punto rojo; cada sección dice cuántos de sus datos están escritos. Todo se guarda solo, y el pie queda siempre abajo.

**Lo que dice el riel**

- Aro: cuánto está lleno
- Debe algo del mínimo legal
- Parte en la que se está

**Lo que dice cada sección**

- **1 de 6** Datos escritos
- \*  Obligatorio para el alta

> **Figura · La pantalla de alta de un colaborador, con sus partes señaladas** — el dibujo está en la versión HTML de este documento.
>
> *Lo que muestra:* A la izquierda, el riel con las cinco pestañas —Información Personal, Información Laboral, Documentación, Recursos y Activos y Configuración— cada una con un aro que se llena según su avance; las dos primeras llevan un punto rojo porque deben datos del mínimo legal. Información Laboral está abierta y muestra sus partes 2.1, 2.2 y 2.3; la 2.2 Relación Laboral, en verde claro, es la que se está llenando. Debajo, la vista previa. A la derecha, la cabecera «2.2 · Relación Laboral», la sección «Datos del contrato» abierta con su cuenta «1 de 6», su instrucción y tres campos obligatorios con asterisco, y la sección «Condiciones de contratación» cerrada. Abajo, el pie con Volver atrás, Guardar borrador y salir y Siguiente. Cinco llamadas numeradas señalan el riel, las partes, la cabecera, la cuenta de datos y el pie.

- **1 · El riel:** Las cinco pestañas, siempre a la vista y todas se pueden pulsar. El aro se llena con lo escrito; el punto rojo avisa lo que falta del mínimo legal.
- **2 · Las partes:** Cuelgan de la pestaña abierta con su número —2.1, 2.2, 2.3—; la parte en la que se está va en verde claro. En el celular pasan arriba del contenido, como píldoras.
- **3 · La cabecera:** La parte con su número, y debajo su pestaña y de qué trata.
- **4 · Las secciones:** Se pliegan y despliegan, empiezan con una instrucción en usted y cuentan sus datos escritos: «1 de 6».
- **5 · El pie:** Siempre abajo: volver, salir con el borrador guardado o seguir. Irse con algo escrito por otro camino pregunta antes.

### Guía de lectura por rol

#### Si usted es de Diseño UX

![VIA con anteojos redondos y una bufanda de colores, sosteniendo un portátil donde se ve un tablero de wireframes conectados entre sí](public/assets/imagenes/via_ux_ui.png)

**Tu misión** Que dar de alta a una persona con trescientos datos posibles se sienta como llenar una carpeta por partes, y no como enfrentarse a una pared de campos.

Los papeles de una persona llegan de manos distintas y en días distintos: el carnet, el contrato, la Gestora, el banco. La ficha tiene que dejar entrar por cualquier pestaña, guardar sola lo escrito y decir en todo momento qué falta y para qué. El documento define qué debe respetar cada pantalla y de dónde sale cada palabra.

- **Empezar por:** 00 · Glosario · 1.4 · Principios de diseño · 08 · Recursos visuales
- **No omitir:** 04 · Reglas de negocio: es lo que la maqueta debe cumplir, con el escenario con el que se verifica cada regla

#### Si usted es de Desarrollo

![VIA con anteojos de marco grueso, sosteniendo un portátil con código en pantalla](public/assets/imagenes/via_developer.png)

**Tu misión** Entregar el alta completa y probada: cada regla de negocio cumplida, cubierta con pruebas unitarias y verificada con QA.

Antes de escribir la primera línea, leer entero el punto 04: las treinta y tres reglas dicen qué tiene que pasar y qué tiene que estar impedido, y cada escenario sirve como caso de prueba. El punto 05 explica por qué la ficha es un mapa de claves del estudio y no una tabla con trescientas columnas.

- **Empezar por:** 00 · Glosario · 05 · Modelo de datos · 03 · Funcionalidades
- **No omitir:** 02 · Integraciones: qué lee de Organización y qué tiene que quedar expuesto a planillas y a las entidades. Y 6.6 · Riesgos

#### Si usted es de Negocio y RR.HH.

![Tres VIA juntos: uno con planilla y traje, otro con planos y chaleco de obra, y otro con una tableta de indicadores](public/assets/imagenes/via_rrhh_proyectos.png)

**Tu misión** Confirmar que lo que la ficha pide es lo que la ley y las entidades exigen, y cerrar las decisiones que siguen abiertas.

Quedan diecisiete. Varias son de negocio y no de pantalla: quién puede ver el sueldo, la salud y el historial disciplinario; si la fecha de ingreso pasa a ser del mínimo legal; qué quiere decir cada código de la traza. El documento define **qué resuelve el módulo**, cómo se opera y qué falta resolver.

- **Empezar por:** 01 · Contexto · 07 · Flujos de usuario
- **No omitir:** 6.7 · Decisiones abiertas: las diecisiete que siguen pendientes

## 00 · Glosario

Todo el documento se apoya en estas definiciones. **Están agrupadas por tema y no por alfabeto**, para que leídas de corrido enseñen el modelo: qué es la ficha, cómo se mide, qué entidades la leen y cómo se cita cada cosa.

| Término | Qué es |
| --- | --- |
| **La persona y su ficha** | |
| **Colaborador** | La persona que trabaja en la empresa. Existe en el sistema **desde que se la da de alta**, no desde que alguien empieza a llenar su ficha |
| **Ficha del colaborador** | Todo lo que la empresa sabe de una persona: identidad, familia, puesto, contrato, sueldo, afiliaciones, recursos, acceso y papeles. Se llena en cinco pestañas |
| **Alta** · dar de alta | El gesto que convierte un borrador en un colaborador. Es como lo dice Recursos Humanos —alta en la Gestora, en la Caja, en planilla—. En pantalla, el botón dice `Dar de alta` |
| **Borrador** | La ficha a medio llenar. Se guarda sola, **no es un colaborador**: no sale en el directorio, no ocupa puesto y no cuenta en ningún tablero |
| **Pestaña** | Cada uno de los seis grandes bloques de la ficha, en el riel de la izquierda, más la vista previa. Se puede entrar a cualquiera en cualquier orden |
| **Parte** | Una división de una pestaña, numerada con la pestaña delante: 1.1 Información Personal, 1.2 Información Familiar, 2.1 a 2.3 en Información Laboral. Las pestañas de una sola parte no se dividen. Cada parte conserva las secciones del paso del estudio del que sale, y su clave en la dirección —`?paso=contrato`— sigue siendo la misma |
| **Sección** · acordeón | Un bloque dentro de una parte —«Datos del contrato», «Datos de pago»—. Se pliega y despliega, y dice cuántos de sus datos están llenos |
| **Dato** · campo | Cada pregunta de la ficha. Tiene una **clave del estudio** —`1.1`, `3.65`— que no cambia aunque cambie su rótulo |
| **Estudio de la propuesta** | El relevamiento de campos v1.2 del que sale la ficha: qué se pide, por qué y quién lo consume. La ficha se genera a partir de él |
| **Cómo se mide la ficha** | |
| **Nivel de ficha** | Cuánto de la ficha se está mirando. Son tres, y cada uno contiene al anterior: **Mínimo legal**, **Operativo** y **Completo**. Recorta la vista; nunca borra un dato |
| **Mínimo legal** | Los 32 datos que alguna entidad exige para declarar a la persona. Sin ellos, el alta existe en el sistema y no existe para el Ministerio |
| **Bloqueo** | Un dato sin el cual no se puede dar de alta. Son tres y solo tres: primer nombre, apellido paterno y fecha de ingreso |
| **Descripción de la sección** | La frase gris bajo el título de cada sección, escrita como instrucción en usted: «Registre…», «Indique…», «Asigne…». Reemplaza a las ayudas con «?» y a las insignias que la ficha mostraba antes |
| **Dato calculado** | Un dato que no se escribe: el sistema lo deduce de otros —el nombre completo, el fin del periodo de prueba, quién registró la ficha— |
| **Dato condicional** | Un dato que solo aparece según otra respuesta: el NUA solo si la persona aporta a la Gestora |
| **Grupo repetible** | Un bloque que se agrega tantas veces como haga falta: contactos de emergencia, hijos, herederos, supervisores funcionales, licencias, cada equipo, uniforme, EPP, herramienta, vehículo o licencia entregados, y los documentos adicionales |
| **Avance** · registro % | Cuántos datos están llenos sobre los que se ven en el nivel elegido. Es el porcentaje que el directorio enseña como `Registro` |
| **Punto rojo** | La marca de una pestaña o de una parte que todavía debe algún dato del mínimo legal, se esté mirando el nivel que se esté mirando |
| **La persona y la empresa** | |
| **Reingreso** | Dar de alta a alguien que ya trabajó en la empresa. Se trae su ficha anterior; no se trae su vínculo anterior |
| **Vínculo** | La relación laboral en curso: puesto, contrato, fechas, sueldo, horario y accesos. Cada alta abre uno nuevo |
| **Puesto** · silla | Definido en [Organización](public/reglas-de-negocio.html): una silla concreta de un cargo. Dar de alta sienta a la persona en una |
| **Estado del vínculo** | Activo, suspendido o desvinculado. Lo cambia una persona, con motivo |
| **Ausencia** | Vacaciones o licencia médica, con fechas. **Termina sola**; mientras dura, manda sobre el estado en la insignia del directorio |
| **Desvincular** | Terminar el vínculo de una persona, con motivo y fecha. **No la borra**: queda en el directorio con su historia |
| **Eliminar** | Quitar del sistema un alta hecha por error. Solo se puede si la persona no tiene historia |
| **Cliente externo** | Una persona de afuera de la empresa que participa en las evaluaciones. **No es un colaborador**: no tiene ficha, puesto ni vínculo |
| **Expediente** | La ficha leída como un legajo: la tapa con los datos que identifican a la persona y un separador por familia de partes. Es lo que muestra la vista previa |
| **Cómo está escrito este documento** | |
| **BR‑GP‑000** | Una **regla de negocio**, con el escenario que la verifica |
| **RF‑GP‑000** · **RNF‑GP‑00** | Un **requisito funcional** —qué tiene que hacer el producto— y uno **no funcional** —cómo tiene que comportarse— |
| **F‑GP‑00** · **W‑GP‑00** | Un **flujo** de usuario y un **wireframe** |
| **HU‑GP‑00** | Una **historia de usuario** con sus criterios de aceptación |
| **ABIERTA‑00 · FUERA‑00** | Una decisión que todavía no se tomó, y algo que se dejó deliberadamente fuera de esta versión |

> **Figura · **Cuánto se pide, dibujado.** Los niveles de la ficha son anillos: el Completo contiene al Operativo, que contiene al mínimo legal. Y dentro del mínimo, sólo tres datos impiden dar de alta.** — el dibujo está en la versión HTML de este documento.
>
> *Lo que muestra:* Un anillo exterior, Completo, con los 240 datos de la ficha. Dentro, Operativo: lo que hace falta para que la persona opere. Dentro, Mínimo legal, con 32 datos sin los cuales no se la puede declarar. Y en el centro, en naranja, los tres datos que bloquean el alta: primer nombre, apellido paterno y fecha de ingreso. A la derecha: cada nivel contiene al anterior y elegir uno recorta la vista sin borrar nada; el asterisco marca lo obligatorio para dar de alta y el punto rojo marca la pestaña o parte que debe algo del mínimo legal.

### 0.1 Las cinco pestañas

La ficha se reparte en cinco pestañas y una vista previa. Las pestañas van en el riel de la izquierda; las partes de la pestaña abierta cuelgan debajo con su numeración —1.1, 1.2— y una guía vertical fina, y la parte en la que se está se pinta del verde claro de su pestaña. En el celular, donde el riel se acuesta, las partes van arriba del contenido como píldoras. **El orden es de lectura, no de dependencia**: quien tiene el contrato en la mano puede ir directo a Relación Laboral sin inventarse antes una fecha de nacimiento. Cada parte conserva las secciones y los campos del paso que era: sólo cambió dónde está.

| # | Pestaña | Partes | Mínimo legal |
| --- | --- | --- | --- |
| 1 | **Información Personal** | Información Personal (antes paso 1) · Información Familiar (paso 2) | 22 |
| 2 | **Información Laboral** | Información Laboral (paso 3) · Relación Laboral (paso 5) · Compensación, Nómina y Afiliaciones (pasos 8 y 6: haber, beneficios y pago, y después Gestora, Caja, Ministerio y RC‑IVA) | 10 |
| 3 | **Documentación y Expediente Digital** | Una sola parte: Archivos | — |
| 4 | **Recursos y Activos** | Una sola parte: las seis clases de cosas entregadas | — |
| 5 | **Configuración de Colaborador** | Una sola parte: Acceso al sistema | — |
| — | **Vista previa** | Todo junto, leído como un expediente, antes de dar de alta | — |

> **Los números del mínimo legal no suman los 32 por casualidad.** Son los datos de nivel Mínimo de cada pestaña: 18 en 1.1 y 4 en 1.2; 7 en 2.1, 2 en 2.2 y 1 en 2.3. Las pestañas 3 a 5 no tienen ninguno: nada de lo que piden lo exige la ley el primer día. Eso no quiere decir que no importen: la afiliación a la Gestora y a la Caja se exige, pero llega después del alta y se avisa en su propio plazo.

> **Figura · **La ficha, parte por parte.** Cada fila es una parte del riel; a la derecha, quién la lee. La mitad de la ficha existe porque una entidad de afuera la pide, y casi todo el mínimo legal vive en las pestañas 1 y 2.** — el dibujo está en la versión HTML de este documento.
>
> *Lo que muestra:* Ocho filas, una por parte: 1.1 Información Personal con 18 datos del mínimo legal, leída por el SEGIP, el Ministerio, la Gestora y Onboarding; 1.2 Información Familiar con 4, leída por el Ministerio y Planillas; 2.1 Información Laboral con 7, que llega de Organización y leen el Ministerio y el ERP; 2.2 Relación Laboral con 2, leída por el Ministerio y Planillas; 2.3 Compensación, Nómina y Afiliaciones con 1, leída por Planillas, la Gestora, la Caja de Salud, Impuestos y el ERP; 3 Documentación, que alimenta el módulo de Documentación; 4 Recursos y Activos, que RR.HH. revisa al desvincular; y 5 Configuración, que da el acceso a Souly y el rol que usará Evaluación. Las entidades externas van en naranja y los módulos de Souly en azul.

### 0.2 Borrador, alta y colaborador: tres estados distintos

Es la distinción que ordena todo el módulo, y la que más fácil se confunde.

| Estado | Qué es | Dónde se ve |
| --- | --- | --- |
| **Borrador** | Una ficha a medio llenar, guardada sola en el navegador | Solo dentro de «Nuevo colaborador». No sale en el directorio ni ocupa silla |
| **Alta** | El gesto, no un estado que dure: el instante en que el borrador pasa a ser colaborador y se sienta en su puesto | El botón `Dar de alta` de la vista previa |
| **Colaborador** | La persona dada de alta, con su ficha entera y su estado de vínculo | El directorio, el organigrama y los módulos que leen de la persona |

**Media ficha cargada no es media persona contratada.** Por eso un borrador no aparece en ningún lado: si lo hiciera, los tableros contarían a alguien que quizá nunca llegue a firmar.

> **Figura · **Tres estados, un solo gesto.** El borrador se llena por partes y se guarda solo; la vista previa dice si ya se puede dar de alta; «Dar de alta» convierte el borrador en colaborador. Irse con algo escrito pregunta antes.** — el dibujo está en la versión HTML de este documento.
>
> *Lo que muestra:* De izquierda a derecha: «Nuevo colaborador» abre un borrador, que se guarda solo y no sale en el directorio. «Revisar la ficha» lleva a la vista previa, y «Dar de alta» la convierte en colaborador, que aparece en el directorio y en su puesto. Si falta un dato, una flecha de vuelta lleva de la vista previa al borrador. Debajo del borrador, irse a otra pantalla con algo escrito abre el aviso «¿Está seguro de salir?», con tres salidas: guardar el borrador y salir, salir sin guardar, que lo borra, o seguir registrando, que vuelve al borrador. Un colaborador no se borra: se desvincula.

### 0.3 Las entidades que piden datos

La mitad de la ficha existe porque alguien de afuera la pide. Conocerlas explica por qué hay datos que parecen repetidos o raros.

| Entidad | Qué pide | Dónde está en la ficha |
| --- | --- | --- |
| **Ministerio de Trabajo** · OVT | La planilla trimestral y el formulario F20: nombre en tres partes, documento, nacionalidad, sexo, discapacidad, sucursal OVT, modalidad de contrato y motivo de retiro | Partes 1.1, 2.1, 2.2 y 2.3 |
| **Gestora Pública** | La afiliación al sistema de pensiones: NUA o CUA, nombre en cinco partes, si aporta o no y si está jubilado | Parte 2.3 |
| **Caja de Salud** | La afiliación al seguro de corto plazo, dentro de los **5 días** desde el ingreso | Parte 2.3 |
| **Impuestos** · RC‑IVA | El código de dependiente y el saldo inicial a favor | Parte 2.3 |
| **SEGIP** · Migración | El documento de identidad: extensión departamental y complemento para el carnet boliviano; el de extranjero lo emite Migración y no lleva extensión | Parte 1.1 |

> **Por eso el nombre se pide partido.** La OVT lo quiere en tres partes, la Gestora en cinco y el RC‑IVA en una. La ficha guarda las cinco y cada exportador arma la forma que su entidad pide; lo que no se puede es partir después un nombre que se guardó entero.

## 01 · Contexto

*Qué es la ficha del colaborador, qué le faltaba a la manera en que se hacía, y a quién tiene que servir la que estamos construyendo.*

### 1.1 ¿Qué es la ficha del colaborador?

Es el registro de todo lo que la empresa necesita saber de una persona para **tenerla contratada en regla**: quién es, a quién avisar, dónde trabaja, qué firmó, a qué entidades está afiliada, cuánto gana, qué se le entregó, con qué accede al sistema y qué papeles respaldan cada cosa.

Responde tres preguntas:

| Pregunta | Qué la contesta |
| --- | --- |
| **¿Se la puede declarar?** | El mínimo legal: los 32 datos que piden el Ministerio, la Gestora y la Caja |
| **¿Puede empezar a trabajar?** | El nivel operativo: puesto, horario, cuenta de pago, acceso al sistema |
| **¿La conocemos de verdad?** | El nivel completo: salud, familia, garantías, recursos entregados |

**La ficha no es el vínculo.** La persona es una sola aunque entre y salga de la empresa varias veces; cada entrada abre un vínculo nuevo —otro contrato, otras fechas, otro sueldo—. Esa distinción es la que permite que un reingreso traiga a la persona sin arrastrar un contrato que ya terminó.

### 1.2 El problema que resuelve

Dar de alta a alguien hoy es juntar papeles que llegan de manos distintas y en días distintos: el carnet lo trae la persona, el contrato lo prepara legal, el NUA lo da la Gestora semanas después, la cuenta bancaria llega cuando se abre. Un formulario de una sola sentada fracasa de tres maneras:

- **Obliga a inventar.** Si el sistema no guarda sin la fecha de nacimiento, alguien pone una cualquiera para poder seguir, y ese dato falso llega a la planilla del Ministerio.
- **Se pierde.** Cerrar la ventana a mitad del contrato cuesta todo lo escrito, así que se deja de cargar en el sistema y se vuelve al Excel.
- **No dice qué falta.** Doscientos campos sin prioridad no distinguen el que impide declarar a la persona del que es un «estaría bien saber».

### 1.3 Visión del módulo

**Que la ficha de una persona se complete por partes, sin perder nada, y que el sistema diga en todo momento qué falta y para qué hace falta.** Y que dar de alta sea un solo gesto que deja a la persona en el directorio y sentada en su puesto del organigrama, para que ningún módulo la tenga que buscar en otro lado.

### 1.4 Principios de diseño

1. **Se guarda desde la primera letra.** No hay botón de guardar. Irse a otra pantalla con algo escrito pregunta antes, y ofrece guardar el borrador o descartarlo —BR‑GP‑034—.
2. **Se entra por cualquier pestaña.** El orden es de lectura; los papeles llegan en otro orden.
3. **Lo que falta se dice, con su motivo.** Una pestaña que debe algo del mínimo legal lo muestra; un bloqueo nombra el dato y dice por qué hace falta.
4. **Bloquear solo lo imprescindible.** Tres datos impiden el alta; los demás se avisan, porque muchos llegan después y la persona igual tiene que poder cobrar.
5. **La estructura manda.** Área, sucursal, cargo y jefe salen de Organización. La ficha no los inventa ni los copia: los lee.
6. **Lo que se calcula no se escribe.** Un dato que se puede deducir se muestra deducido; pedirlo a mano es invitar a que contradiga al otro.
7. **Un dato que no aplica no se ve, y no se cuenta.** Esconderlo no borra lo escrito: si la respuesta vuelve, el dato vuelve con su valor.
8. **Las palabras son las de Recursos Humanos.** «Dar de alta», no «crear»; «borrador», no «guardar»; «Datos de…», no «Cuánto gana».

### 1.5 Cómo se sabe si funcionó

| Indicador | Qué se espera |
| --- | --- |
| **Altas completas en el sistema** | Ninguna alta se hace fuera de Souly para después «pasarla» |
| **Borradores abandonados** | Los borradores se retoman: nadie empieza de cero una ficha que ya había empezado |
| **Mínimo legal al día** | Las personas dadas de alta completan su mínimo legal dentro del plazo de cada entidad |
| **Personas sin puesto** | Ninguna persona queda dada de alta sin silla en el organigrama, salvo que se haya elegido así |

> **Hoy ninguno de estos indicadores se puede medir.** El prototipo no registra actividad. Hacerlos medibles es parte de la tercera entrega —6.2—.

### 1.6 A quién sirve

| Quién | Para qué entra |
| --- | --- |
| **Recursos Humanos** · administrador | Da de alta, completa fichas, cambia estados y asigna rutas de onboarding |
| **Líder de área** · manager | Consulta el directorio de su gente |
| **Planillas y contabilidad** | No entran al módulo: leen lo que la ficha deja listo para la corrida y las declaraciones |
| **El colaborador** | No llena su ficha en esta versión; la ve reflejada en su espacio personal cuando ese módulo la lea |

### 1.7 Alcance y límites

**Entra en esta versión:** la lista de colaboradores, el alta en cinco pestañas con su borrador, el reingreso, la vista previa como expediente, el alta que sienta a la persona en su puesto y los clientes externos.

**Especificado pero sin construir:** ver y editar la ficha de alguien dado de alta —3.6— y eliminar o desvincular —3.7—. **No entra:** la liquidación de una desvinculación y los exportadores a cada entidad. Están contados en 3.11.

**Prioridades.** Cada requisito lleva una: Oblig. sin esto no se entrega; Import. se entrega en la etapa que le toca; Deseable si hay tiempo.

## 02 · Integraciones

*De qué módulos lee la ficha, qué módulos leen de ella, y qué entidades de afuera consumen cada dato.*

### 2.1 El principio: la ficha es la fuente de la persona

Así como la estructura es la fuente de la que leen todos los módulos cuando preguntan *dónde*, la ficha es la fuente cuando preguntan *quién*. **Ningún módulo guarda su propia copia de la persona**: el expediente, la ruta de onboarding y la planilla leen de la ficha, y un cambio en ella llega a todos.

Hay una excepción deliberada, y va en sentido contrario: **lo que la persona es dentro de la estructura —su área, su sucursal, su jefe— no vive en la ficha, vive en su puesto.** La ficha lo muestra, pero lo lee de Organización.

### 2.2 De qué depende este módulo: Organización

Gestión de personas no puede funcionar sin estructura: no hay dónde sentar a nadie. Lo que lee de Organización:

| Lo que se lee | Para qué | Dónde en la ficha |
| --- | --- | --- |
| **Cargos y sus puestos libres** | Ofrecer en qué cargo entra la persona y asignarle la primera silla libre | Parte 2.1 · 3.11 |
| **Unidades, sucursales y centros de trabajo** | Las listas de área y sucursal, con la misma función que arma las tablas de Organización —no pueden discrepar— | Paso 3 · 3.2 a 3.10 |
| **Jefe del puesto** | Mostrar de quién depende, deducido de la silla y no escrito a mano | Parte 2.1 |
| **Empresas del grupo** | Para qué empresa trabaja y a cuáles tiene acceso | Parte 2.1 |

Y lo que **escribe** en Organización es una sola cosa: al dar de alta, sienta a la persona en su puesto —BR‑GP‑018—.

### 2.3 Onboarding

Una persona recién dada de alta nace **sin ruta de onboarding**. La ruta se asigna desde el directorio, porque es una decisión de Recursos Humanos sobre esa persona y no un dato de su ficha. Onboarding elige la ruta por área y cargo, que lee del puesto.

### 2.4 Evaluación

Evaluación va a sacar de la estructura quién evalúa a quién, y de la ficha los datos de la persona. El módulo todavía no existe en el prototipo; el rol que se asigna en la pestaña 5, Configuración de Colaborador, es el que dirá qué puede ver cada uno.

**Los clientes externos también son de Evaluación.** Se registran en este módulo —3.8— y Evaluación los va a ofrecer como evaluadores de afuera: los activos, nunca los inactivos.

### 2.5 Documentación

El expediente digital cuelga del colaborador: **un expediente es una persona**, y lleva su mismo identificador. La pestaña 3 de la ficha, Documentación y Expediente Digital, reúne los archivos que se cargaron en las demás —foto, carnet escaneado, certificado de nacimiento, croquis— para que el expediente arranque con ellos.

> **Hoy la integración es de intención, no de código.** El módulo de Documentación todavía no lee la ficha guardada de la persona: lo va a hacer, y por eso la ficha entera viaja con ella al dar de alta —5.6—.

### 2.6 Asistencia, planillas y ERP

La mitad operativa de la ficha existe para que la planilla corra sin preguntar:

- **Asistencia** todavía no lee de la ficha: los datos de jornada, horario y marcación se están definiendo y se documentarán cuando estén en la versión publicada.
- **Planillas** lee de la parte 2.3, Compensación, Nómina y Afiliaciones: haber básico —en bolivianos— y los **beneficios de ley**, que son interruptores y no montos: dicen qué calcula la corrida, no cuánto. Y el **anticipo de quincena**, que se descuenta del líquido pagable en la misma corrida del mes: una boleta, no dos —BR‑GP‑033—. El **tipo de remuneración** y la **frecuencia de pago** se guardan como dato **informativo**: no gobiernan ningún cálculo.
- **ERP y contabilidad** leen la imputación contable de la parte 2.1 y los datos de pago de la 2.3.

### 2.7 Las entidades externas

| Entidad | Qué consume | Qué pasa si falta |
| --- | --- | --- |
| **Gestora Pública** | Si aporta, NUA o CUA, si está jubilado | Si la persona **no aporta**, la planilla lleva el aporte en cero —no vacío—, se la excluye de las declaraciones SIP y ANS, y la columna del Ministerio va en 0. El NUA puede llegar semanas después: se marca «en proceso» |
| **Caja de Salud** | Si está afiliada, número de asegurado | El plazo de afiliación es de 5 días desde el ingreso. Un seguro privado no la reemplaza |
| **Ministerio de Trabajo** | La planilla y el F20, con sus catálogos oficiales | El alta existe en el sistema y no existe para el Ministerio |
| **RC‑IVA** | Código de dependiente y saldo inicial | El saldo a favor de la persona se pierde en la primera corrida |

### 2.8 Resumen

┌─────────────────────┐ │

ORGANIZACIÓN

│ cargos · puestos · áreas · sucursales └──────────┬──────────┘ lee │ ▲ sienta a la persona en su silla ▼ │ ┌─────────────────────┐ │

FICHA DEL COLABORADOR

│ la fuente de la persona └──┬───────┬───────┬──┘ │ │ │ ┌───────────┘ │ └────────────┐ ▼ ▼ ▼ ┌───────────┐ ┌─────────────┐ ┌───────────────┐ │

ONBOARDING

│ │

DOCUMENTACIÓN

│ │

ASISTENCIA ·

│ │ ruta por │ │ expediente │ │

PLANILLAS · ERP

│ │ área/cargo│ │ = persona │ └───────┬───────┘ └───────────┘ └─────────────┘ ▼ Gestora · Caja · Ministerio · RC‑IVA

## 03 · Funcionalidades

*Cincuenta y dos requisitos funcionales y cinco no funcionales, pantalla por pantalla: la lista, la ficha, editar, eliminar y los clientes externos, cada uno con su condición de comprobación.*

Cada requisito lleva prioridad —según la escala de 1.7—, y una condición de comprobación, que es lo que QA va a verificar. **Los números son estables** y los bloques saltan de diez en diez para poder crecer sin mover a nadie.

### 3.1 Lista de colaboradores

La puerta del módulo, en `/personas/colaboradores`. Responde una sola pregunta —**quién trabaja en la empresa y en qué situación está**— y es desde donde se da de alta, se asigna el onboarding y se cambia el estado de una persona. Lista a todos los dados de alta, vigentes y desvinculados; nunca un borrador —BR‑GP‑001—.

#### A · La cabecera

Título **«Colaboradores»** y subtítulo **«Directorio de colaboradores de la organización»**. Dice qué se está mirando y nada más: el resto de la pantalla es la lista.

#### B · Las cuatro cifras

| Cifra | Rótulo | Cómo se calcula | Por qué existe |
| --- | --- | --- | --- |
| **Total** | Colaboradores registrados | Todas las personas dadas de alta, estén vigentes o desvinculadas | Es el tamaño del directorio: cuántas filas tiene la tabla sin filtros |
| **Activos** | En la organización | Todos los que no están desvinculados | Cuenta **empleados, no presentes**: quien está de vacaciones sigue en planilla, cobra y suma antigüedad. Contarlo fuera hacía decir «5 inactivos» cuando solo 3 se habían ido |
| **Ausentes** | Vacaciones, licencia u otro | Hoy cuenta a los **desvinculados** | Debería contar a quien hoy no está —vacaciones, licencia—. El número y su rótulo no dicen lo mismo. *ABIERTA‑09* |
| **Departamentos** | Áreas activas | Las áreas de la lista del filtro | Da escala: en cuántas áreas se reparte la gente. Hoy la lista es fija; debería salir de las unidades de Organización |

#### C · La barra de búsqueda y filtros

| Control | Qué hace | Por qué así |
| --- | --- | --- |
| **Buscador** · «Buscar por nombre, cargo o email…» | Filtra por nombre, cargo o correo, mientras se escribe, y vuelve a la página 1 | Son las tres formas en que alguien recuerda a una persona. Volver a la página 1 evita quedarse mirando una página vacía |
| **Estado** · «Todos los estados» | Activos, Vacaciones, Licencia médica, Suspendido, Desvinculado | Mira **las dos preguntas a la vez**: el estado del vínculo y la ausencia. «Vacaciones» ya no es un estado del vínculo, pero es lo que alguien busca al abrir el filtro |
| **Área** · «Todas las áreas» | Deja solo a las personas de un área | El recorte más común de Recursos Humanos: «¿quién está en Ventas?» |
| **Nuevo colaborador** | Abre el alta —3.2— con el borrador que hubiera | Es la acción principal del módulo; va a la derecha y en el color de acción |

#### D · Las columnas de la tabla

| Columna | Qué muestra | De dónde sale | Por qué está |
| --- | --- | --- | --- |
| **Colaborador** | Foto o iniciales, nombre y correo | La ficha: nombre, correo corporativo o personal, foto | Reconocer a la persona de un vistazo y tener a mano cómo escribirle |
| **Departamento** | El área | El área del puesto; si no tiene puesto, la que se declaró en la ficha | Ubicar a la persona en la empresa sin abrir nada |
| **Cargo** | El nombre del cargo | **El cuadro que ocupa en el organigrama**, no un texto de la ficha | Si el cargo se renombra en Organización, el directorio lo refleja solo. Dos fuentes para el mismo dato terminan diciendo cosas distintas |
| **Rol** | El rol en el sistema: Administrador General, Sub Administrador - RRHH - IT, Gerente, Supervisor, Asistente o Colaborador | Configuración de Colaborador (pestaña 5) | Qué puede hacer esa persona dentro de Souly, que no es lo mismo que su cargo |
| **Registro** | El avance de la ficha, como porcentaje y barra: verde al 100 %, azul desde 50 %, amarilla por debajo | Los datos llenos sobre los que se ven, calculado al dar de alta | Encontrar rápido las fichas que quedaron flojas. El color ordena la urgencia sin leer el número |
| **Onboarding** | El estado de su incorporación, con una ayuda «?» que explica los seis estados | El módulo de Onboarding | Ver quién necesita una ruta, quién la está haciendo y quién se trabó, sin salir del directorio |
| **Buddy** | Quién lo acompaña, o «—» | La asignación de Onboarding | Saber a quién preguntarle por un recién llegado |
| **Ingreso** | La fecha de ingreso, «15 Mar 2025» | La ficha, parte 2.2 · 3.25 | La antigüedad, las vacaciones y el periodo de prueba cuelgan de ella |
| **Estado** | Una insignia de color; al pasar el cursor, su explicación o las fechas de la ausencia | La ausencia en curso, y si no hay, el estado del vínculo —BR‑GP‑025— | Contesta «¿puedo contar con esta persona esta semana?», que es lo que uno mira en una tabla |
| **⋯** | El menú de acciones de la fila | — | Cada acción donde está la persona, sin abrir su ficha |

#### E · Los estados

El estado de una persona son **dos preguntas distintas**, y por eso son dos listas: **¿existe el vínculo?** —un hecho legal que cambia tres o cuatro veces en una vida laboral— y **¿está hoy?** —un hecho de calendario, con fechas, que termina solo—. Metidas en la misma columna se pisaban: para marcar vacaciones había que borrar que la persona estaba activa. **Un estado se justifica por lo que cambia**; si dos no difieren en nada, sobra uno.

| Estado del vínculo | Qué significa | Qué cambia |
| --- | --- | --- |
| **Activo** | Contrato vigente y en funciones | Va en planilla, se declara a la Gestora y a la Caja, suma antigüedad, entra al sistema y puede ocupar un puesto |
| **Suspendido** | El contrato sigue, pero está interrumpido | Pide **motivo**: una suspensión disciplinaria no paga ni suma antigüedad; una por incapacidad sí, y la cubre la Caja. Sin saber cuál es, la planilla no se calcula sola |
| **Desvinculado** | El contrato terminó | Pide **motivo y fecha**. Sale de planilla, deja de ofrecerse como jefe, garante o contacto, y aparece en la búsqueda de reingreso. Se queda en el directorio: es historia |

| Ausencia | Qué significa | Qué cambia |
| --- | --- | --- |
| **Vacaciones** | Descanso programado, con fechas | Nada del contrato: la persona sigue activa. Mientras dura, la insignia dice «Vacaciones»; al terminar, vuelve sola a «Activo» |
| **Licencia médica** | Baja temporal por salud, con fechas | Lo mismo: no toca el vínculo, y termina sola |

| Onboarding | Qué significa | Qué se puede hacer desde el menú |
| --- | --- | --- |
| **N/A** | Incorporado antes del sistema | Puede ser buddy de otros |
| **Sin ruta** | Nuevo ingreso sin ruta asignada. Es el estado con el que nace toda alta | Asignar ruta de onboarding |
| **Sin iniciar** | Ruta asignada, aún no la comienza. Pasa a «En curso» cuando abre su primera tarea | Asignar o cambiar buddy, desasignar la ruta |
| **En curso** | Realizando su onboarding | Igual que «Sin iniciar» |
| **En riesgo** | Más de 3 días sin actividad | Igual que «Sin iniciar»: es el que pide atención |
| **Graduado** | Completó todas las etapas | Asignar ruta de reboarding. Puede ser buddy de otros |

**Solo puede ser buddy quien terminó su propio onboarding** —graduado o incorporado antes del sistema—: nadie guía un camino que todavía está recorriendo.

#### F · El menú de cada fila

El menú refleja en qué punto del ciclo está la persona: no ofrece asignar una ruta a quien ya la tiene, ni un buddy a quien no la tiene.

| Acción | Cuándo aparece | Qué hace | En el prototipo |
| --- | --- | --- | --- |
| **Ver perfil** | Siempre | Abre la ficha en lectura —3.6— | Todavía no navega |
| **Editar** | Siempre | Abre la ficha para corregirla —3.6— | Todavía no navega |
| **Roles y permisos** | Siempre | Muestra qué puede hacer cada rol en el sistema | Tabla fija, sin editar |
| **Asignar ruta de onboarding** | Sin ruta · N/A | Elige una ruta activa y su fecha de inicio | Funciona |
| **Asignar / cambiar buddy** | Con ruta en curso | Elige quién acompaña a la persona | Funciona |
| **Desasignar buddy · desasignar ruta** | Con ruta en curso | Quita la asignación, previa confirmación | Funciona |
| **Asignar ruta de reboarding** | Graduado | Una ruta nueva para alguien que ya se incorporó y cambia de puesto o vuelve | Funciona |
| **Enviar credenciales** | Siempre | Manda a la persona su acceso al sistema | Todavía no hace nada |
| **Cambiar estado** | Siempre | Activo, suspendido o desvinculado, con motivo —BR‑GP‑026— | Muestra las opciones; todavía no guarda |

#### G · Paginación y vacío

La tabla se pagina de a **ocho** filas, con el texto «1–8 de 63 colaboradores» y los números de página. Si ningún colaborador coincide con la búsqueda o los filtros, dice **«No se encontraron colaboradores»**.

#### H · Requisitos

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RF‑GP‑001 | El directorio lista a cada colaborador con **foto, nombre, correo, departamento, cargo, rol, registro, onboarding, buddy, ingreso y estado** | Oblig. | El cargo que se muestra es el de su puesto en el organigrama, no uno escrito en la ficha |
| RF‑GP‑002 | Arriba, cuatro cifras: **total, activos, ausentes y departamentos** | Import. | «Activos» cuenta empleados, no presentes: alguien de vacaciones sigue siendo activo. *ABIERTA‑09* |
| RF‑GP‑003 | Un buscador por **nombre, cargo o correo**, y filtros por **estado** y **área** | Oblig. | Filtrar por «Vacaciones» encuentra a quien está de vacaciones aunque su vínculo siga activo. *BR‑GP‑025* |
| RF‑GP‑004 | La lista se pagina de a **ocho** filas | Import. | Con 20 personas hay tres páginas |
| RF‑GP‑005 | La columna **Registro** muestra el avance de la ficha como barra: verde al 100 %, azul desde el 50 %, amarilla por debajo | Import. | Una ficha dada de alta al 38 % se ve amarilla |
| RF‑GP‑006 | El botón **«Nuevo colaborador»** lleva al alta | Oblig. | Abre `/personas/colaboradores/nuevo` con el borrador que hubiera |
| RF‑GP‑007 | Cada fila ofrece **asignar, cambiar o quitar la ruta de onboarding** y su buddy, y **cambiar el estado** del vínculo | Oblig. | Una persona recién dada de alta muestra «Sin ruta» y la acción de asignarla |

### 3.2 Nuevo colaborador: la ficha del colaborador

En `/personas/colaboradores/nuevo`. Es donde se da de alta a una persona, y lo que se llena es su **ficha del colaborador**.

#### A · Qué es la ficha del colaborador

Es el registro de todo lo que la empresa necesita saber de una persona para **tenerla contratada en regla**: quién es, a quién avisar, dónde trabaja, qué firmó, a qué entidades está afiliada, cómo marca, cuánto gana, qué se le entregó, con qué entra al sistema y qué papeles respaldan cada cosa. Son **240 datos distintos** repartidos en **cinco pestañas**.

Tres cosas la definen:

- **Se llena por partes.** Los papeles llegan de manos distintas y en días distintos; la ficha se guarda sola y se puede entrar por cualquier pestaña —BR‑GP‑002—.
- **No todo pesa lo mismo.** 32 datos son del mínimo legal; solo 3 impiden el alta —BR‑GP‑006, BR‑GP‑007—.
- **Es la fuente de la persona.** Planillas, Onboarding, Documentación y Evaluación leen de ella; ninguno guarda su propia copia —2.1—.

#### B · Las cinco pestañas, sus partes y sus secciones

| # | Pestaña · parte | Secciones | Para qué sirve |
| --- | --- | --- | --- |
| **1 · Información Personal — sus datos y los de su familia** | | | |
| 1.1 | **Información Personal** | Reingreso o alta nueva · Datos personales · Documento de identidad · Nacionalidad y nacimiento · Residencia · Contacto · Datos patrimoniales · Licencias y certificaciones · Datos médicos · Preferencias | Identificar a la persona como la piden el Ministerio, la Gestora y el SEGIP. Empieza por el reingreso para no duplicar a nadie, y termina con los regalos y experiencias que le gustaría recibir y vivir |
| 1.2 | **Información Familiar** | Contactos de emergencia · Cónyuge · Hijos · Beneficiarios y herederos · Garantes y garantías · Datos de tutela y protecciones | A quién avisar, quién depende de la persona —asignación familiar, subsidio de lactancia—, quién hereda y su salud |
| **2 · Información Laboral — su puesto, contrato, pago y afiliaciones** | | | |
| 2.1 | **Información Laboral** | Información organizacional · Dependencia organizacional y funcional · Contacto corporativo | Dónde se sienta en la estructura: cargo, área, sucursal y jefe. Tiene **un supervisor inmediato** —único, quien responde por su evaluación y su contrato— y **uno o varios supervisores funcionales**, cada uno con la unidad donde lo supervisa |
| 2.2 | **Relación Laboral** | Datos del contrato · Condiciones de contratación | Qué firmó, desde cuándo, por cuánto tiempo y el periodo de prueba |
| 2.3 | **Compensación, Nómina y Afiliaciones** | Datos de haber básico · Configuración de Beneficios y Obligaciones · Datos de pago · Gestora Pública · Caja de Salud · Ministerio de Trabajo · Impuestos RC‑IVA | Lo que la planilla calcula y dónde se deposita —incluido el anticipo de quincena—, y lo que se declara a cada entidad. Junta lo que eran los pasos Remuneración y Afiliaciones. Los beneficios de ley son interruptores, no montos |
| 3 | **Documentación y Expediente Digital** | Archivos | Reúne los papeles cargados en las demás pestañas —y los que se agreguen a mano— para que el expediente arranque con ellos |
| 4 | **Recursos y Activos** | Equipos · Uniformes · Equipo de Protección Personal (EPP) · Herramientas · Vehículos · Software y Licencias | Lo que la empresa le entrega para trabajar, y que tendrá que devolver |
| 5 | **Configuración de Colaborador** | Acceso al sistema: nombre de usuario y rol | Con qué usuario entra al sistema y qué rol tiene |
| — | **Vista previa** | La tapa del expediente y tres separadores | Revisar todo junto antes de dar de alta —3.5— |

#### C · Tres secciones que se llenan distinto

| Sección | Cómo se llena | Por qué así |
| --- | --- | --- |
| **Preferencias** · 1.1 | Dos tablitas, una al lado de la otra: **Regalos que le gustaría recibir** y **Experiencias que le gustaría vivir** —un viaje, un curso, un concierto—. Cada fila es una celda para escribir; «Agregar regalo» y «Agregar experiencia» suman filas, Enter al final de una fila abre la siguiente y la cruz la quita. Sin categorías ni tipo | El equipo vio tablas con categoría, precio y prioridad, tarjetas y etiquetas, y eligió que se escriba directamente. Se guarda una fila por renglón, así que lo escrito antes en una caja de texto se conserva |
| **Recursos y Activos** · 4 | Cada clase de cosa entregada arranca vacía, con su botón «Agregar…». En las listas de tipo de equipo, categoría, tipo de uniforme, de EPP, de vehículo y de licencia, elegir **«Otro»** abre una caja para escribir cuál | Casi nadie recibe a la vez un vehículo, un EPP y una licencia: seis bloques vacíos serían sesenta cajas para llenar de nada. Y «Otro» sin caja guardaba la palabra «Otro» |
| **Archivos** · 3 | Arriba de los documentos, un buscador y tres píldoras en una sola fila: **Tipo**, **Estado** y **Fechas**. El tipo es la pestaña de donde viene cada documento —Información Personal, Recursos y Activos— o «Documentos agregados» para los que se suben a mano; sólo se ofrecen los que tienen documentos. Una píldora con filtro se pinta de verde, dice el valor y trae una cruz para quitarlo. El estado de cada documento es Pendiente (sin archivo), Vencido, Por vencer (30 días antes), Vigente o Sin vencimiento. Fechas abre un panel para elegir emisión o vencimiento, con atajos —próximos 30 y 90 días, ya vencidos, último mes, este año— o un rango. Al final, un recuadro «Agregar documento» suma documentos propios con su nombre | Con trece documentos o más, lo que RR.HH. busca casi siempre es qué falta o qué vence. Los documentos agregados a mano no tienen fechas y no entran en el filtro de fechas |

#### D · Configuración de Beneficios y Obligaciones

La sección de la parte 2.3 que dice a la planilla qué calcular para esta persona. Su descripción en pantalla: **«Active los beneficios sociales y obligaciones patronales que el sistema debe calcular para este empleado.»** Son **interruptores de Sí/No**: ninguno lleva un monto. El monto lo pone la fórmula, siempre.

> **La pregunta de fondo del bloque.** Varios de estos interruptores **no son decisiones: son consecuencias** de dos datos que la ficha ya tiene —la **modalidad de contrato** y la **categoría del puesto** (obrero de producción o administrativo)—. Dejarlos como casillas editables permite marcar una combinación que la ley no admite, y nadie se entera hasta que llega la multa. La recomendación es la misma que para el RC‑IVA: **derivarlos y mostrarlos de solo lectura**, con el dato del que salen a la vista —ABIERTA‑14—.

| Campo | Tipo · nivel | Concepto | Con qué se enlaza |
| --- | --- | --- | --- |
| **¿Sujeto a bono de antigüedad?** | Sí/No · Operativo · legal | Obligatorio por ley. El monto no se digita nunca: `salario mínimo × 3 × % de la escala` según los años de servicio. La escala tiene siete tramos —5, 11, 18, 26, 34, 42 y 50 %— fijados por decreto | Entra desde la **fecha de ingreso para bono de antigüedad** —distinta de la de ingreso legal, porque a veces se reconoce antigüedad anterior— y el salario mínimo de los parámetros de la empresa. Sale hacia la columna del Ministerio, obligatoria aunque vaya en cero. Es un interruptor de verdad: se apaga para personal de servicios externos, contratos de servicios y eventuales |
| **¿Aplica aguinaldo de Navidad?** | Sí/No · Operativo · legal | Un sueldo al año, pagado hasta el 20 de diciembre; por duodécimas si no trabajó la gestión completa | Derivable de la modalidad de contrato. La base son **septiembre, octubre y noviembre**, no diciembre ni el promedio del año. Sale hacia la planilla de aguinaldo, una declaración aparte de la mensual |
| **¿Aguinaldo y prima desde el primer mes?** | Sí/No · Operativo | En los hechos, la marca del obrero: el obrero de producción cobra aguinaldo con 1 mes trabajado; el administrativo necesita 3 meses y 1 día. El mismo umbral vale para el proporcional de la prima: 30 días contra 90 | Sale del **Tipo de trabajador** (2.1 Información Laboral › Información organizacional). **Si la categoría es Obrero y se contesta No, la ficha avisa** junto a la respuesta. La recomendación es que no se llame así —describe el efecto, no el dato— y que se muestre de solo lectura |
| **¿Aplica aportes patronales?** | Sí/No · Operativo | Si la empresa paga sus propios aportes: 7,21 % a la Gestora y 10 % a la Caja de Salud, sobre el total ganado. No se le descuenta al trabajador: es costo de la empresa | Alimenta Planillas y el ERP. Es el peor ubicado del bloque: no es remuneración, y ya existe «¿aporta a la Gestora?» en afiliaciones, que puede contradecirlo —ABIERTA‑16— |
| **¿Incluir en subsidio de frontera?** | Sí/No · Completo | Un pago adicional para quien trabaja en zona de frontera. Parecía marginal, pero es una columna oficial de la planilla del Ministerio | Falta la norma, el porcentaje y quién califica. Suena a que se deriva de la sucursal, no de cada persona —ABIERTA‑17— |

**Qué pasa cuando un interruptor está en No.** No todos se comportan igual, y la diferencia importa para la declaración:

| Interruptor en No | Qué efecto tiene |
| --- | --- |
| **Bono de antigüedad** | La columna del Ministerio va **en cero, no vacía**: es obligatoria. La persona sigue en la planilla |
| **Aguinaldo** | La persona **no aparece** en la planilla de aguinaldo: se excluye la fila completa |
| **Aportes patronales** | La empresa no paga sus aportes por esta persona. Hay que revisar que no contradiga «¿aporta a la Gestora?» |
| **Subsidio de frontera** | La columna del Ministerio va vacía o en cero: es opcional como dato |

> **Una trampa que conviene tener a la vista.** El aguinaldo de fin de año y el aguinaldo que se paga dentro de un finiquito usan ventanas de promedio distintas: el de diciembre promedia septiembre, octubre y noviembre; el del finiquito, los tres meses previos a la salida. Es de los errores más fáciles de cometer en este módulo.

#### E · Navegación y botones

A la izquierda, el **riel** con las cinco pestañas, cada una con el aro de su avance. Bajo la pestaña abierta cuelgan sus **partes numeradas** —1.1, 1.2—; la pestaña con partes lleva una **flechita**, y tocarla estando abierta **cierra o abre** sus partes con un movimiento breve —la lista crece o se encoge y las partes entran de a una—, como un grupo del menú, sin moverse de la parte en la que se está. Las partes van atadas por una guía vertical fina; la parte en la que se está se pinta del verde claro de su pestaña, y su porcentaje aparece al pasar el ratón. En pantallas angostas el riel se acuesta en una barra horizontal y las partes pasan arriba del contenido, como píldoras. En el centro, la cabecera dice la parte con su número —«2.3 · Compensación, Nómina y Afiliaciones»— y debajo su pestaña; después, las **secciones plegables**, cada una con su descripción en usted y su cuenta de datos llenos. Una sección se abre y se cierra con un movimiento breve, sin perder lo escrito; su pastilla brilla una vez al completarse; y al cambiar de parte el contenido entra con un fundido corto. Abajo, el pie, **siempre pegado al borde inferior** aunque la parte sea corta: **«Volver atrás»**, **«Guardar borrador y salir»** y **«Siguiente»**, que recorre las partes y después pasa a la pestaña siguiente, y en la última dice **«Revisar la ficha»**.

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RF‑GP‑010 | El alta es **una pantalla propia**, no un modal, con un **riel de cinco pestañas, sus partes y la vista previa** | Oblig. | Se puede enlazar y mandar: `?paso=contrato` abre el contrato. *BR‑GP‑004* |
| RF‑GP‑011 | **Todas las pestañas y partes se pueden visitar desde el primer momento**, en cualquier orden | Oblig. | Con la ficha vacía, se pulsa Información Laboral › 2.2 Relación Laboral y se llena sin pasar por las anteriores |
| RF‑GP‑012 | Cada pestaña del riel muestra un **aro de avance** alrededor de su número, y cada pestaña y cada parte un **punto rojo** si deben algo del mínimo legal | Oblig. | Una pestaña al 90 % que debe un dato legal muestra el punto. *BR‑GP‑008* |
| RF‑GP‑013 | Cada parte se lee como **índice de secciones plegables**; cada sección dice **cuántos de sus datos están llenos**, y la primera abre sola | Oblig. | «Datos de haber básico · 1 de 4» se pone verde al completarse |
| RF‑GP‑014 | El pie, siempre al borde inferior, ofrece **«Volver atrás»** —no en la parte 1.1—, **«Guardar borrador y salir»** y **«Siguiente»**, que recorre las partes y después las pestañas, y en la última dice **«Revisar la ficha»** | Oblig. | En 1.1 no hay «Volver atrás»; en Configuración, que tiene una sola sección, el pie sigue abajo. *BR‑GP‑002* |
| RF‑GP‑017 | Irse a otra pantalla con un registro empezado abre **«¿Está seguro de salir?»**, con «Guardar borrador y salir», «Salir sin guardar» —que borra el borrador— y «Seguir registrando» | Oblig. | Con el nombre escrito, pulsar otra opción del menú abre el aviso; con la ficha vacía, no. *BR‑GP‑034* |
| RF‑GP‑015 | Cambiar de parte o de pestaña **vuelve arriba** del formulario | Import. | Pasar del final de 1.2 a 2.1 no deja a la persona a media altura |
| RF‑GP‑016 | En pantallas angostas el riel se vuelve una **barra horizontal** con la pestaña elegida **centrada**, y las partes van arriba del contenido como píldoras | Import. | En un teléfono, abrir la ficha en 2.3 muestra Información Laboral al centro de la barra y las píldoras 2.1 a 2.3 arriba |

### 3.3 Los campos

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RF‑GP‑020 | Los datos obligatorios llevan **asterisco**. Al pie: «* Campo obligatorio para poder dar de alta». La ficha ya no muestra insignias —«legal», «se calcula»—: siguen en el estudio y en este documento | Oblig. | El haber básico lleva asterisco. *BR‑GP‑006* |
| RF‑GP‑021 | Cada sección abre con una **descripción escrita como instrucción**, en **usted**: «Registre…», «Indique…», «Asigne…». No hay ayudas detrás de un «?» | Import. | «Datos de haber básico» dice: «Registre el haber básico del colaborador. No puede ser inferior al salario mínimo nacional.» |
| RF‑GP‑022 | Los datos **condicionales** aparecen y desaparecen según la respuesta, con una animación breve | Oblig. | Contestar «Sí» a si aporta a la Gestora muestra el NUA. *BR‑GP‑009* |
| RF‑GP‑023 | Los **grupos repetibles** se agregan con un botón y se quitan de a uno | Oblig. | Se agregan tres hijos y se quita el segundo: el tercero sube. Lo mismo con los supervisores funcionales |
| RF‑GP‑024 | Los **archivos** aceptan PDF o imagen de hasta 10 MB; la foto, hasta 5 MB | Oblig. | Un PDF de 12 MB no se carga y el aviso dice el tope |
| RF‑GP‑025 | Las listas de área, sucursal, cargo y jefe **se acotan entre sí** y dicen por qué vienen cortas o vacías | Oblig. | «Solo se muestran cargos de Ventas en La Paz». *BR‑GP‑019* |
| RF‑GP‑027 | **¿Recibe anticipo de quincena?** habilita **Tipo de anticipo** y **Valor**; el valor tiene tope —100 % o el haber básico— y el rótulo dice la unidad | Import. | Con monto fijo y haber de Bs 5.000, el valor no admite 9.000. *BR‑GP‑033* |
| RF‑GP‑028 | En las listas con **«Otro»**, elegirlo abre una caja para escribir cuál; en los grupos repetidos, cada copia tiene la suya | Oblig. | Elegir «Otro» en el tipo del segundo equipo abre la caja del segundo, no la del primero. *BR‑GP‑009* |
| RF‑GP‑029 | Las **listas escritas a mano** —regalos y experiencias— son tablitas: una fila por deseo, con «Agregar», Enter para la siguiente y una cruz para quitar | Import. | Escribir un regalo y presionar Enter abre la fila 2 con el cursor dentro |
| RF‑GP‑026 | Los datos **calculados** se muestran bloqueados: se leen pero no se escriben | Oblig. | El fin del periodo de prueba no se puede escribir. *BR‑GP‑010* |

### 3.4 El reingreso

> **Figura · **Vuelve la persona, no el vínculo.** De un registro anterior se trae quién es y cómo encontrarla; nada de su puesto, contrato ni sueldo. Sus documentos, sólo si se piden.** — el dibujo está en la versión HTML de este documento.
>
> *Lo que muestra:* A la izquierda, el registro anterior de Ana Quispe, de 2019 a 2023, partido en dos. Arriba, en verde, la persona: nombre y documento, nacimiento y nacionalidad, NUA, asegurado de la Caja y RC-IVA, estado civil y profesión, teléfonos, correo y domicilio, contacto de emergencia y cuenta bancaria. Abajo, en naranja y tachado, el vínculo: puesto, área, sucursal y jefe; contrato y fechas; haber y horario; rol y accesos. Una flecha lleva la persona a la ficha nueva, donde llega marcada para revisar; una línea con una cruz dice que el vínculo no se trae, porque quien vuelve firma otro contrato; y una flecha punteada dice que los documentos se traen sólo si se piden. En la ficha nueva, el vínculo se llena de nuevo como en cualquier alta.

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RF‑GP‑030 | La ficha **empieza preguntando** si la persona ya trabajó en la empresa | Oblig. | Es la primera sección de 1.1 Información Personal. *BR‑GP‑012* |
| RF‑GP‑031 | Si la respuesta es sí, un buscador por **nombre, apellido o número de documento de identidad** —desde tres letras, hasta seis resultados— con **«Traer sus datos»** y **«No es la misma persona»** | Oblig. | Buscar por el carnet encuentra a la persona aunque el nombre esté escrito distinto |
| RF‑GP‑032 | Traídos los datos, se muestra **quién era** —último puesto, fechas, motivo de salida— y una pregunta: **traer sus documentos** | Import. | «Se copiaron 34 datos suyos a esta ficha», y «No era ésta» deshace todo. *BR‑GP‑015* |

### 3.5 Vista previa y alta

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RF‑GP‑040 | La vista previa es la ficha **leída como expediente**: una tapa con foto, nombre, cargo, documento, ingreso, contrato, correo y avance | Oblig. | Lo que falta dice «Por completar», no queda en blanco. *BR‑GP‑023* |
| RF‑GP‑041 | Las partes se agrupan en **tres separadores** —Información Personal, Información Laboral y En la empresa— con el avance de cada parte | Import. | Pulsar un separador baja a su sección |
| RF‑GP‑042 | Cada sección tiene **«Editar»**, que lleva a su parte | Oblig. | Desde la vista previa se corrige el contrato sin recorrer las pestañas |
| RF‑GP‑043 | El sello de la tapa dice **qué falta** para dar de alta, o **«Ya se puede dar de alta»** | Oblig. | Con el nombre vacío, el sello dice «Falta el primer nombre» y lleva a él |
| RF‑GP‑044 | Pulsar **«Dar de alta»** con faltantes abre un aviso que **los lista todos**, cada uno con **«Completar →»** | Oblig. | Con tres faltantes, el aviso tiene tres filas. *BR‑GP‑024* |
| RF‑GP‑045 | Ir a un dato **abre su sección, lo enfoca y lo resalta** un momento | Import. | «Completar →» deja el cursor en el campo que faltaba |
| RF‑GP‑046 | Dar de alta **agrega a la persona al directorio y la sienta en su puesto** en el mismo gesto, y vacía el borrador | Oblig. | La persona aparece en el directorio y en el organigrama a la vez. *BR‑GP‑018* |

### 3.6 Editar un colaborador

Se llega desde **«Editar»** o **«Ver perfil»** en el menú de la fila, a `/personas/colaboradores/:id`. **Está especificado pero todavía no está construido en el prototipo.**

**Es la misma ficha, no otra pantalla.** Las mismas cinco pestañas, el mismo riel y las mismas secciones que en el alta: quien aprendió a dar de alta ya sabe editar. Lo que cambia es el comportamiento, porque ahora cada dato es real: **está en planilla y declarado a las entidades**.

| Qué | En el alta | Al editar | Por qué |
| --- | --- | --- | --- |
| **Cómo abre** | Para escribir | **En lectura**, con el botón «Editar» | Casi siempre se entra a mirar. Abrir para escribir invita a cambiar algo sin querer en la ficha de alguien que ya cobra |
| **Cómo guarda** | Solo, desde la primera letra | Con **«Guardar cambios»**, que antes muestra la lista de lo que cambió | En el alta nada es real hasta dar de alta. Al editar, cambiar el haber o la cuenta bancaria cambia la próxima planilla: se confirma sabiendo qué se toca |
| **Salir sin guardar** | No existe: no hay nada que perder | Pregunta si se descartan los cambios | Acá sí hay algo que perder |
| **Reingreso** | Primera sección de 1.1 | No aparece | La persona ya existe |
| **Datos con vigencia** | Se escriben | El haber básico y el cargo piden **desde qué fecha** rige el cambio | Una planilla ya pagada no se recalcula con el sueldo nuevo |
| **Historial** | Se registra quién hizo el alta | Cada cambio queda en el **historial de cambios** de la ficha: quién, cuándo, qué dato, valor anterior y nuevo | Cuando alguien pregunte por qué cambió un sueldo, la respuesta está en la ficha |

**Las reglas del alta siguen valiendo.** No se puede dejar vacío ningún bloqueo —nombre, apellido paterno, fecha de ingreso—, los condicionales se comportan igual y las listas siguen saliendo de la estructura. **Cambiar el cargo mueve a la persona en el organigrama**: libera su silla anterior y la sienta en la nueva —BR‑GP‑028—.

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RF‑GP‑050 | «Ver perfil» y «Editar» abren **la misma ficha** del alta, con sus cinco pestañas, en `/personas/colaboradores/:id` | Oblig. | Las pestañas, las partes y las secciones son las mismas del alta. *BR‑GP‑027* |
| RF‑GP‑051 | La ficha **abre en lectura**; «Editar» la pasa a edición sin mover nada de sitio | Oblig. | Los campos están donde van a estar, solo que bloqueados |
| RF‑GP‑052 | **«Guardar cambios»** muestra antes la lista de lo cambiado, con valor anterior y nuevo; salir con cambios pregunta si se descartan | Oblig. | Cambiar la cuenta bancaria y guardar muestra la cuenta vieja y la nueva |
| RF‑GP‑053 | Cada cambio guardado queda en el **historial de cambios** de la ficha: quién, cuándo, dato, antes y después | Oblig. | El historial de cambios muestra el cambio de cuenta con el nombre de quien lo hizo |
| RF‑GP‑054 | Cambiar el **haber básico** o el **cargo** pide la fecha desde la que rige | Import. | Un aumento con vigencia del 1 del mes siguiente no cambia la planilla del mes actual |
| RF‑GP‑055 | Cambiar el cargo **libera la silla anterior y sienta a la persona en la nueva** | Oblig. | En el organigrama, la silla anterior queda vacante y la nueva muestra a la persona. *BR‑GP‑028* |

### 3.7 Eliminar y desvincular

**A un colaborador no se lo borra: se lo desvincula.** Una persona que trabajó tiene planillas, declaraciones, marcaciones y documentos detrás. Borrarla deja huérfano todo lo que la nombra y hace imposible reconocerla si vuelve. Por eso hay tres gestos distintos, cada uno para su caso:

| Gesto | Para qué caso | Qué pasa | En el prototipo |
| --- | --- | --- | --- |
| **Desvincular** | La persona dejó de trabajar en la empresa | «Cambiar estado» → Desvinculado, con motivo y fecha. Sale de planilla, deja de ofrecerse como jefe o aprobador, libera su silla y queda en el directorio y en la búsqueda de reingreso | El modal existe; todavía no guarda |
| **Eliminar un alta por error** | Se dio de alta a alguien que nunca llegó a trabajar, o se duplicó a una persona | Solo si la persona **no tiene historia**: ninguna planilla procesada, marcación, documento emitido ni evaluación. Pide escribir su nombre para confirmar, libera la silla y la quita del directorio | No existe todavía |
| **Descartar el borrador** | Se empezó un alta que no va a seguir | Vacía la ficha a medio llenar y sus archivos, previa confirmación. No afecta a nadie: un borrador no es un colaborador | No existe todavía |

> **Cuánto tiempo después del alta se puede eliminar todavía está abierto** —ABIERTA‑11—. La regla segura es la de la historia: si algo ya la nombra, no se elimina, se desvincula.

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RF‑GP‑060 | Desvincular pide **motivo y fecha**, y la persona queda en el directorio como desvinculada | Oblig. | Una desvinculada aparece con su insignia y en la búsqueda de reingreso. *BR‑GP‑026* |
| RF‑GP‑061 | **Eliminar** solo se ofrece a quien no tiene historia, y pide **escribir su nombre** para confirmar | Oblig. | A una persona con una planilla procesada no se le ofrece eliminar, solo desvincular. *BR‑GP‑029* |
| RF‑GP‑062 | Desvincular o eliminar **libera la silla** que la persona ocupaba | Oblig. | El puesto vuelve a aparecer como libre en el alta |
| RF‑GP‑063 | En el alta, **«Descartar borrador»** vacía la ficha y sus archivos, previa confirmación | Import. | Tras descartar, «Nuevo colaborador» abre una ficha en blanco |

### 3.8 Clientes externos

En `/personas/clientes-externos`, debajo de Colaboradores en el menú del módulo. Registra a **personas de afuera de la empresa que participan en las evaluaciones**: clientes que evalúan a los colaboradores con los que tienen trato.

**No son colaboradores** —BR‑GP‑030—: no tienen ficha, ni puesto, ni vínculo, ni planilla. Por eso viven en su propia lista y su registro es corto.

#### A · La lista

| Elemento | Qué muestra | Por qué |
| --- | --- | --- |
| **Cabecera** | «Clientes externos» · «Personas de afuera de la empresa que participan en las evaluaciones» | Dice para qué sirve la lista, que no es obvio desde el nombre |
| **Buscador** | Por nombre, empresa o correo | Las tres formas en que se busca a un cliente |
| **Cuenta** | «N registrados · N activos» | Cuántos hay y cuántos se pueden usar en una evaluación |
| **Nuevo cliente externo** | Abre el formulario de registro | La acción principal, siempre en el mismo lugar |
| **Columna Cliente** | Iniciales, nombre completo y correo | Reconocerlo y saber a dónde le llega la evaluación |
| **Columna Empresa/organización** | De dónde viene, o «—» | Distinguir a dos clientes con el mismo nombre |
| **Columna Teléfono** | El teléfono, o «—» | Un segundo canal si el correo no responde |
| **Columna Rol** | El papel que cumple: hoy, Evaluador | Qué puede hacer en el sistema |
| **Columna Estado** | Activo o Inactivo; la fila inactiva se ve atenuada | Si se lo puede elegir para una evaluación nueva |
| **Acciones** | Editar · Activar o desactivar | No hay «eliminar» —BR‑GP‑032— |
| **Vacía** | La tabla con sus columnas y, adentro, «Todavía no hay clientes externos» | La pantalla se ve igual el primer día que el día cien, y el botón de crear está donde va a estar siempre |

#### B · El formulario «Nuevo cliente externo»

Subtítulo «Registra un nuevo cliente externo». Cada campo muestra su ejemplo y un contador de caracteres, y no deja escribir más del máximo. Botones: **Cancelar** y **Guardar cliente**.

| Campo | Obligatorio | Ejemplo | Máximo | Por qué |
| --- | --- | --- | --- | --- |
| **Nombre** | Sí | Ej. Juan | 50 | A quién se le pide la evaluación |
| **Apellido paterno** | Sí | Ej. Pérez | 50 | Junto con el nombre, identifica a la persona |
| **Apellido materno** | No | Ej. Gómez | 50 | No todos lo usan |
| **Teléfono** | No | Ej. +591 70000000 | 20 | Canal secundario |
| **Correo electrónico** | Sí | Ej. juan@empresa.com | 100 | Es por donde le llega la evaluación; se valida su formato —BR‑GP‑031— |
| **Empresa/organización** | No | Ej. Consultora XYZ | 150 | De dónde viene. Opcional: un cliente puede ser una persona sola |
| **Rol del cliente** | — | Evaluador | — | El papel que cumple. Hoy hay uno solo. *ABIERTA‑12* |

Si falta un obligatorio, el aviso aparece debajo del campo y dice el motivo: **«Falta el correo: es por donde le llega la evaluación»**. El cliente nace **activo**. Editar abre el mismo formulario con el título «Editar cliente externo».

| # | Requisito | Prior. | Cómo se comprueba |
| --- | --- | --- | --- |
| RF‑GP‑070 | La lista se muestra **siempre**, con sus columnas, aunque esté vacía, y el botón **«Nuevo cliente externo»** arriba | Oblig. | Sin ningún cliente, la tabla aparece con el aviso adentro |
| RF‑GP‑071 | Un buscador por **nombre, empresa o correo**, y la cuenta de registrados y activos | Import. | Buscar «Inti» encuentra a los clientes de Droguería Inti |
| RF‑GP‑072 | El formulario pide los **siete campos** de la tabla, con su ejemplo, su **contador** y su **máximo** | Oblig. | El nombre no admite un carácter 51 |
| RF‑GP‑073 | Nombre, apellido paterno y correo son obligatorios, y el correo se valida; el aviso nombra el dato y su motivo | Oblig. | «juan@» no se guarda y el aviso dice que el correo no parece válido. *BR‑GP‑031* |
| RF‑GP‑074 | Cada fila se puede **editar** con el mismo formulario | Oblig. | Corregir el teléfono lo cambia en la lista |
| RF‑GP‑075 | Cada fila se puede **activar o desactivar**; no se puede eliminar | Oblig. | Un cliente desactivado se ve atenuado y con la insignia «Inactivo». *BR‑GP‑032* |
| RF‑GP‑076 | El rol del cliente se elige de una lista; **Evaluador** viene elegido | Import. | Un cliente nuevo se guarda como Evaluador sin tocar el campo |

### 3.9 Requisitos no funcionales

| # | Requisito | Cómo se comprueba |
| --- | --- | --- |
| RNF‑GP‑01 | **Nada de lo escrito se pierde**: ni al cerrar la pestaña, ni al recargar, ni al volver otro día | Se escribe un nombre, se cierra el navegador, se vuelve a abrir: el nombre está |
| RNF‑GP‑02 | Se opera **con teclado**: el riel, los acordeones y los avisos se recorren sin ratón, y el aviso de faltantes se cierra con Escape | Un alta completa se hace sin tocar el ratón |
| RNF‑GP‑03 | **Se adapta al ancho**: por debajo de 1000 px el riel se acuesta; por debajo de 760 px el menú de la app se guarda en un solo panel | En un teléfono de 390 px el formulario usa todo el ancho |
| RNF‑GP‑04 | Respeta **«reducir movimiento»**: las animaciones de condicionales, resaltado, barra, el despliegue de las partes del riel y de las secciones, el fundido al cambiar de parte y el brillo de una sección completa se apagan | Con la preferencia activa, cambiar de paso no anima nada |
| RNF‑GP‑05 | Los **datos sensibles** —salud, historial disciplinario, sueldo— se muestran solo a quien corresponde | Pendiente de definir quién es quien corresponde. *ABIERTA‑04* |

### 3.10 Cómo se escriben los textos

- **Las ayudas van en usted.** La ficha la llena Recursos Humanos o el propio colaborador: «¿Cuál es su fecha de ingreso?», no «¿Cuál es tu…?».
- **«Dar de alta», no «crear».** A una persona no se la crea.
- **«Borrador», no «guardar».** Guardar ya pasó; lo que el botón ofrece es salir sin miedo.
- **Los títulos de sección dicen qué contienen**, en tono de documento: «Datos de haber básico», «Datos de pago», «Jornada laboral». No «Cuánto gana» ni «Dónde se le deposita».
- **Un aviso dice el dato y el motivo**: «Falta la fecha de ingreso: sin ella no hay desde cuándo contar su antigüedad».

### 3.11 Fuera de alcance de esta versión

| # | Qué | Por qué queda fuera |
| --- | --- | --- |
| FUERA‑01 | **Ver y editar la ficha** de alguien ya dado de alta | Está especificado en 3.6; el menú de fila ya lo ofrece pero todavía no lleva a ningún lado |
| FUERA‑02 | **La desvinculación completa**: motivo codificado, liquidación y finiquito | La sección «Salida» del contrato solo aplica al editar, no al dar de alta |
| FUERA‑03 | **Los exportadores** a cada entidad —F20, Gestora, Caja, RC‑IVA— | La ficha guarda los datos en la forma que cada uno necesita; armar los archivos es otra entrega |
| FUERA‑04 | **El historial del haber básico**, versionado con vigencia | Hoy se guarda el valor vigente |
| FUERA‑05 | **Editar los permisos por rol** | El directorio los muestra en una tabla fija |
| FUERA‑06 | **Que el colaborador llene su propia ficha** | Esta versión la llena Recursos Humanos |

## 04 · Reglas de negocio

*Treinta y cuatro condiciones que el sistema cumple siempre, en el orden en que se vive una persona en el sistema: el borrador, los datos, el reingreso, el puesto, las entidades, la revisión, el directorio, la edición y la baja, y los clientes externos. Todas se leen igual, en cuatro apartados: información básica, escenarios ágiles de ejecución, condiciones y excepciones, y trazabilidad.*

### El alta como borrador

**Lo que pasa con una ficha mientras todavía no es un colaborador**

#### 4.1 · BR-GP-001 · El colaborador no existe hasta que se lo da de alta

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-001
- **Grupo:** El alta como borrador
- **Qué gobierna:** Borrador · Colaborador
- **Estado:** Borrador

*Descripción general*

Mientras la ficha se llena, lo que existe es un **borrador**: no aparece en el directorio, no ocupa una silla del organigrama y no cuenta en ningún tablero. La persona pasa a existir en el instante en que se pulsa **Dar de alta**.

Media ficha cargada no es media persona contratada: si el borrador contara, los tableros incluirían a alguien que quizá nunca firme.

**2. Escenarios ágiles de ejecución**

*Un borrador no aparece en el directorio*

- **Dado que** se llenaron las pestañas 1 y 2 de una persona nueva
- **Cuando** se vuelve al directorio con «Guardar borrador y salir»
- **Entonces** la persona no figura en la lista ni en el total de colaboradores
- **Y** su puesto sigue libre en el organigrama

*El alta la hace aparecer en todos lados a la vez*

- **Dado que** la ficha tiene nombre, apellido paterno y fecha de ingreso
- **Cuando** se pulsa «Dar de alta» en la vista previa
- **Entonces** la persona aparece en el directorio y sentada en su puesto
- **Y** el borrador queda vacío para la próxima alta

**3. Condiciones y excepciones**

- Hay un solo borrador por navegador. Empezar otra alta continúa el que haya.
- Un borrador no tiene estado de vínculo, ruta de onboarding ni expediente.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑046
- **Historia de usuario:** HU‑GP‑01
- **Pantalla:** W‑GP‑02 Alta
- **Diseño:** Prototipado

---

#### 4.2 · BR-GP-002 · La ficha se guarda sola, desde la primera letra

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-002
- **Grupo:** El alta como borrador
- **Qué gobierna:** Borrador
- **Estado:** Borrador

*Descripción general*

Cada cambio se guarda en el momento, sin botón de guardar. Los archivos adjuntos se guardan aparte, en el almacenamiento del navegador. Irse a otra pantalla con un registro empezado pregunta antes —BR‑GP‑034—, pero lo escrito ya está a salvo.

El botón del medio del pie dice **«Guardar borrador y salir»**: no guarda —ya está guardado—, ofrece soltar la ficha a medias sin miedo, que es el gesto real de quien se quedó sin el papel que le faltaba.

**2. Escenarios ágiles de ejecución**

*Cerrar la pestaña no cuesta nada*

- **Dado que** se escribió el nombre y el carnet
- **Cuando** se cierra el navegador y se vuelve a «Nuevo colaborador» al día siguiente
- **Entonces** el nombre y el carnet están donde se dejaron

*«Guardar borrador y salir» no pregunta*

- **Dado que** se está en 2.2 Relación Laboral
- **Cuando** se pulsa «Guardar borrador y salir»
- **Entonces** se vuelve al directorio sin ningún aviso
- **Y** al volver a entrar, el borrador sigue en la parte donde estaba

**3. Condiciones y excepciones**

- Un archivo pesa hasta 10 MB; la foto, hasta 5 MB.
- El borrador vive en el navegador donde se empezó: en otro equipo no se ve. *Ver 6.6.*

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑014 · RNF‑GP‑01
- **Historia de usuario:** HU‑GP‑01
- **Pantalla:** W‑GP‑02 Alta
- **Diseño:** Prototipado

---

#### 4.2b · BR-GP-034 · Salir con un registro empezado pregunta antes

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-034
- **Grupo:** El alta como borrador
- **Qué gobierna:** Salida de la ficha
- **Estado:** Borrador

*Descripción general*

Si la ficha tiene algo registrado e intenta irse a otra pantalla —desde el menú lateral, el menú del módulo o la miga «Colaboradores»—, un aviso pregunta antes: **«¿Está seguro de salir?»**, con el texto «El registro de este colaborador está a medio llenar. ¿Quiere guardarlo como borrador para continuar después?» y tres botones:

- **«Guardar borrador y salir»** — sale, y el borrador sigue ahí al volver a «Nuevo colaborador».
- **«Salir sin guardar»** — sale y **borra el borrador**. Es la única forma de tirar un registro empezado.
- **«Seguir registrando»** — cierra el aviso y deja la ficha como estaba.

«Registrado» quiere decir distinto de como abre la ficha: los valores de arranque —Bolivia como país emisor, «No» en el reingreso— no cuentan. Por eso una ficha recién abierta se deja sin preguntar.

**2. Escenarios ágiles de ejecución**

*Con algo escrito, pregunta*

- **Dado que** se escribió el primer nombre en 1.1
- **Cuando** se pulsa «Clientes externos» en el menú del módulo
- **Entonces** aparece «¿Está seguro de salir?» y la pantalla no cambia hasta elegir

*Salir sin guardar tira el registro*

- **Dado que** el aviso está abierto
- **Cuando** se pulsa «Salir sin guardar»
- **Entonces** se va a la otra pantalla
- **Y** al volver a «Nuevo colaborador», la ficha está vacía

*La ficha vacía no pregunta*

- **Dado que** se abrió «Nuevo colaborador» y no se escribió nada
- **Cuando** se pulsa otra pantalla del menú
- **Entonces** se va sin ningún aviso

**3. Condiciones y excepciones**

- No pregunta al pulsar «Guardar borrador y salir» en el pie, ni al dar de alta: ahí la persona ya dijo qué quiere.
- Cerrar o recargar la pestaña del navegador no muestra este aviso: el borrador ya está guardado y sigue ahí al volver —BR‑GP‑002—.
- Es el mismo aviso de «cambios sin guardar» del resto de la aplicación, con los textos de la ficha.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑017
- **Historia de usuario:** HU‑GP‑01
- **Pantalla:** W‑GP‑02 Alta
- **Diseño:** Prototipado

---

#### 4.3 · BR-GP-003 · Un borrador viejo recibe los datos nuevos sin perder los suyos

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-003
- **Grupo:** El alta como borrador
- **Qué gobierna:** Borrador · valores de arranque
- **Estado:** Borrador

*Descripción general*

Algunos datos arrancan con un valor: el país emisor del documento en **Bolivia** —el 95 % de las altas—, «¿Es un reingreso?» en **No**, discapacidad en **No**. Cuando se agrega un dato nuevo con valor de arranque, los borradores empezados antes también lo reciben.

La mezcla **solo rellena ausencias**: cualquier dato que el borrador ya tenga —aunque esté vacío a propósito— gana.

**2. Escenarios ágiles de ejecución**

*El dato nuevo aparece con su valor*

- **Dado que** un borrador se empezó antes de que existiera el país del documento secundario
- **Cuando** se abre ese borrador
- **Entonces** el país aparece en Bolivia, como en un alta nueva

*Lo que alguien escribió no se pisa*

- **Dado que** en el borrador se eligió Perú como país emisor
- **Cuando** se abre el borrador después de un cambio en los valores de arranque
- **Entonces** el país sigue en Perú

**3. Condiciones y excepciones**

- Un valor de arranque se justifica por escrito: por qué ese y no vacío.
- Discapacidad arranca en No aunque cuenta para la cuota del 2 %: el precedente es la pregunta del reingreso.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RNF‑GP‑01
- **Historia de usuario:** HU‑GP‑01
- **Pantalla:** W‑GP‑02 Alta
- **Diseño:** Prototipado

---

#### 4.4 · BR-GP-004 · La parte y el nivel viajan en la dirección

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-004
- **Grupo:** El alta como borrador
- **Qué gobierna:** Navegación del alta
- **Estado:** Borrador

*Descripción general*

La parte en la que se está y el nivel que se mira van en la dirección: `?paso=contrato&nivel=Mínimo`. Así se puede mandar un enlace —«llename la 2.2»—, la flecha de atrás del navegador retrocede de parte en parte y recargar no devuelve al principio. Un enlace viejo a una parte que se juntó con otra —`?paso=afiliaciones`— abre la que la contiene, 2.3.

**2. Escenarios ágiles de ejecución**

*Un enlace abre la parte justa*

- **Dado que** alguien recibe `…/nuevo?paso=contrato`
- **Cuando** lo abre
- **Entonces** la ficha abre en 2.2 Relación Laboral, con el borrador de ese navegador

*Una parte inventada no deja la pantalla en blanco*

- **Dado que** la dirección dice `?paso=cualquier-cosa`
- **Cuando** se abre
- **Entonces** la ficha abre en 1.1 Información Personal

**3. Condiciones y excepciones**

- La primera parte y el nivel Completo no se escriben en la dirección: son los de siempre.
- Un nivel desconocido se trata como Completo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑010
- **Historia de usuario:** HU‑GP‑01
- **Pantalla:** W‑GP‑02 Alta
- **Diseño:** Prototipado

---

### Los datos y sus niveles

**Qué se pide, qué se exige y cómo se mide**

#### 4.5 · BR-GP-005 · Tres niveles anidados, y el nivel recorta la vista sin borrar nada

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-005
- **Grupo:** Los datos y sus niveles
- **Qué gobierna:** Nivel de ficha
- **Estado:** Borrador

*Descripción general*

Cada dato pertenece a un nivel: **Mínimo legal** —sin esto no se puede declarar a nadie—, **Operativo** —lo que hace falta para que la persona opere— o **Completo** —todo el estudio—. Cada nivel contiene al anterior.

Mirar un nivel **esconde** los datos de los niveles de arriba, no los borra. La ficha abre en **Completo**: arrancar recortada enseñaba un extracto sin avisar que lo era.

**2. Escenarios ágiles de ejecución**

*Mirar el mínimo esconde el resto*

- **Dado que** la ficha tiene cargada la fecha de emisión del documento, que es de nivel Completo
- **Cuando** se elige ver el nivel Mínimo legal
- **Entonces** la fecha de emisión no se ve en Documento de identidad
- **Y** al volver a Completo, la fecha sigue ahí

*El avance se mide sobre lo que se mira*

- **Dado que** están llenos los 32 datos del mínimo y nada más
- **Cuando** se mira el nivel Mínimo
- **Entonces** el avance es 100 %; en Completo, bastante menos

**3. Condiciones y excepciones**

- El selector de nivel es parte del prototipo, no del producto: en el producto la ficha es la completa.
- El punto rojo no depende del nivel que se mire —BR‑GP‑008—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑012
- **Historia de usuario:** HU‑GP‑02
- **Pantalla:** W‑GP‑02 Alta
- **Diseño:** Prototipado

---

#### 4.6 · BR-GP-006 · El mínimo legal lo fija una entidad, no una preferencia

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-006
- **Grupo:** Los datos y sus niveles
- **Qué gobierna:** Datos obligatorios
- **Estado:** Borrador

*Descripción general*

Un dato es del mínimo legal porque el Ministerio, la Gestora o la Caja lo exigen para declarar a la persona. Son **32**: la pregunta del reingreso, el nombre, el documento, el nacimiento y la nacionalidad, un teléfono, el contacto de emergencia, la discapacidad, el puesto, la modalidad de contrato y el haber básico. **La moneda no se pide**: por el momento todo se entiende en bolivianos.

Se marcan con asterisco. La insignia **legal** que los acompañaba ya no se muestra en la ficha (29 sep 2026): el equipo la quitó junto con las demás marcas internas. De dónde viene cada obligación sigue escrito en el estudio y en la tabla de entidades de este documento —0.3—.

**2. Escenarios ágiles de ejecución**

*El asterisco dice qué se pide el primer día*

- **Dado que** se abre 2.3 Compensación, Nómina y Afiliaciones
- **Cuando** se mira la sección de haber básico
- **Entonces** el haber básico lleva asterisco; frecuencia de pago no

*Un dato puede ser legal sin ser del primer día*

- **Dado que** el NUA lo exige la Gestora pero llega semanas después
- **Cuando** se mira en la ficha
- **Entonces** no lleva asterisco: no impide el alta ni cuenta para el punto rojo

**3. Condiciones y excepciones**

- Dos datos se corrigieron del estudio para no volverlos obligatorios: el tercer nombre y el complemento SEGIP, que solo lo llevan casos excepcionales.
- Los datos del documento secundario se piden solo si se agrega uno.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑020
- **Historia de usuario:** HU‑GP‑02
- **Pantalla:** W‑GP‑02 Alta
- **Diseño:** Prototipado

---

#### 4.7 · BR-GP-007 · Solo tres datos impiden el alta; los demás se avisan

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-007
- **Grupo:** Los datos y sus niveles
- **Qué gobierna:** Bloqueos del alta
- **Estado:** Borrador

*Descripción general*

No se puede dar de alta sin **primer nombre**, **apellido paterno** y **fecha de ingreso**. Sin nombre no hay a quién dar de alta; sin fecha de ingreso no hay nada que calcular: antigüedad, vacaciones, bono y finiquito cuelgan de ella.

El resto del mínimo legal **se avisa y no se bloquea**, porque muchos datos llegan después del alta —el NUA lo da la Gestora semanas más tarde— y la persona igual tiene que poder cobrar.

**2. Escenarios ágiles de ejecución**

*Sin fecha de ingreso no hay alta*

- **Dado que** la ficha tiene nombre y apellido pero no fecha de ingreso
- **Cuando** se pulsa «Dar de alta»
- **Entonces** no se da de alta y el aviso dice «Falta la fecha de ingreso»

*Sin NUA sí hay alta*

- **Dado que** la ficha tiene los tres datos pero no el NUA ni el número de la Caja
- **Cuando** se pulsa «Dar de alta»
- **Entonces** la persona se da de alta
- **Y** las pestañas y partes que deben datos del mínimo siguen con su punto rojo

**3. Condiciones y excepciones**

- La fecha de ingreso está en el nivel Operativo y aun así bloquea. *ABIERTA‑03*.
- Los bloqueos no dependen del nivel que se mire.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑043 · RF‑GP‑044
- **Historia de usuario:** HU‑GP‑08
- **Pantalla:** W‑GP‑03 Vista previa
- **Diseño:** Prototipado

---

#### 4.8 · BR-GP-008 · El punto rojo de una pestaña se mide siempre contra el mínimo legal

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-008
- **Grupo:** Los datos y sus niveles
- **Qué gobierna:** Riel de pestañas y partes
- **Estado:** Borrador

*Descripción general*

El riel da dos señales por pestaña, y dicen cosas distintas. El **aro** dice cuánto está escrito, sumando todas sus partes; el **punto rojo** dice que falta algo que una entidad exige, y se enciende si cualquiera de sus partes lo debe. Las partes llevan su propio punto. Una pestaña puede estar al 90 % y deber justo el dato que impide declarar a la persona.

El punto se calcula siempre sobre el mínimo legal, se esté mirando el nivel que se esté mirando.

**2. Escenarios ágiles de ejecución**

*Casi lleno, pero debe*

- **Dado que** en 1.1 están llenos 60 de 70 datos, pero no el documento
- **Cuando** se mira el riel
- **Entonces** el aro de la pestaña 1 está casi cerrado, y la pestaña y la parte 1.1 llevan punto rojo

*Una pestaña sin nada legal no lleva punto*

- **Dado que** la pestaña Recursos y Activos está vacía
- **Cuando** se mira el riel
- **Entonces** Recursos y Activos tiene el aro vacío y no lleva punto rojo

**3. Condiciones y excepciones**

- No hay sello de «completo»: un aro lleno es un aro lleno.
- Los datos calculados y los que no se ven no cuentan para el punto.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑012
- **Historia de usuario:** HU‑GP‑02
- **Pantalla:** W‑GP‑02 Alta
- **Diseño:** Prototipado

---

#### 4.9 · BR-GP-009 · Un dato que no se ve no se cuenta, y lo escrito no se borra al esconderse

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-009
- **Grupo:** Los datos y sus niveles
- **Qué gobierna:** Datos condicionales
- **Estado:** Borrador

*Descripción general*

Muchos datos dependen de otra respuesta: el NUA solo si aporta a la Gestora, la extensión y el complemento solo para un carnet boliviano, los detalles de la discapacidad solo si la hay, la caja «Otro» solo si se eligió «Otro». Un dato escondido **no se pide ni se cuenta** en el avance.

Esconderlo **no borra** lo que se había escrito: si la respuesta vuelve, el dato vuelve con su valor.

**2. Escenarios ágiles de ejecución**

*Lo que no aplica no resta*

- **Dado que** la persona no aporta a la Gestora
- **Cuando** se mira el avance de 2.3
- **Entonces** el NUA no aparece ni cuenta como faltante

*Cambiar de idea no cuesta lo escrito*

- **Dado que** se escribió el NUA y después se contestó «No aporta»
- **Cuando** se corrige a «Sí aporta»
- **Entonces** el NUA vuelve a aparecer con el número que tenía

**3. Condiciones y excepciones**

- Las preguntas de las que dependen otros datos nunca se esconden: «no aplica» es una respuesta que tiene que quedar escrita —BR‑GP‑020—.
- La provincia solo se pide para países con ese escalón.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑022
- **Historia de usuario:** HU‑GP‑03
- **Pantalla:** W‑GP‑02 Alta
- **Diseño:** Prototipado

---

#### 4.10 · BR-GP-010 · Lo que se calcula no se escribe

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-010
- **Grupo:** Los datos y sus niveles
- **Qué gobierna:** Datos calculados
- **Estado:** Borrador

*Descripción general*

Un dato que se puede deducir se muestra deducido y bloqueado: el **nombre completo**, el **fin del periodo de prueba** —ingreso más 89 días, porque a los 90 más uno nacen los beneficios sociales—, el **estado de una licencia**, el **total repartido entre herederos**, **quién registró** la ficha y si es **reingreso o alta nueva**.

**2. Escenarios ágiles de ejecución**

*El periodo de prueba se calcula solo*

- **Dado que** la fecha de ingreso es el 1 de octubre
- **Cuando** se mira el fin del periodo de prueba
- **Entonces** muestra el 29 de diciembre y no se puede escribir encima

*La licencia se pone sola por vencer*

- **Dado que** una licencia de conducir vence en 20 días
- **Cuando** se mira su estado
- **Entonces** dice «Por vencer»

**3. Condiciones y excepciones**

- «Por vencer» son 30 días: es el único umbral que no viene de una norma. *ABIERTA‑06*.
- La nacionalidad solo se pregunta si la persona no es de nacionalidad boliviana, y entonces «Boliviana» no se ofrece. Se elige por gentilicio —«Chilena», no «Chile»—, de la lista completa de países.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑026
- **Historia de usuario:** HU‑GP‑03
- **Pantalla:** W‑GP‑02 Alta
- **Diseño:** Prototipado

---

#### 4.11 · BR-GP-011 · Cada dato se cuenta una sola vez en el avance

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-011
- **Grupo:** Los datos y sus niveles
- **Qué gobierna:** Avance de la ficha
- **Estado:** Borrador

*Descripción general*

La pestaña 3, Documentación, reúne archivos que se cargan en otras partes —la foto, el carnet escaneado, el certificado de nacimiento—. Son el mismo dato en dos lugares: se cuentan **una vez**, en la primera parte donde aparecen. Si contaran dos veces, cargar la foto subiría el avance el doble.

**2. Escenarios ágiles de ejecución**

*La foto no cuenta doble*

- **Dado que** se carga la foto en 1.1
- **Cuando** se mira la pestaña 3
- **Entonces** la foto aparece cargada también ahí
- **Y** el avance total subió por un solo dato

**3. Condiciones y excepciones**

- La ficha tiene 322 datos distintos aunque se vean más en pantalla.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑012
- **Historia de usuario:** HU‑GP‑03
- **Pantalla:** W‑GP‑02 Alta
- **Diseño:** Prototipado

---

### El reingreso

**Recontratar a alguien sin cargarlo de nuevo, y sin arrastrar lo que ya terminó**

#### 4.12 · BR-GP-012 · El reingreso se pregunta primero, y se busca por carnet antes que por nombre

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-012
- **Grupo:** El reingreso
- **Qué gobierna:** Búsqueda de reingreso
- **Estado:** Borrador

*Descripción general*

La ficha arranca preguntando si la persona ya trabajó en la empresa. Va primero por una razón: si ya estuvo, hay que recuperar su registro en vez de crear uno nuevo, y **un duplicado se arrastra para siempre**.

La búsqueda acepta nombre o documento, desde tres letras. **El carnet pesa más que el nombre**: los nombres se escriben distinto, el número no.

**2. Escenarios ágiles de ejecución**

*Se encuentra por el carnet*

- **Dado que** María Fernanda Rojas trabajó en la empresa y se fue
- **Cuando** se contesta «Sí» y se busca su número de carnet
- **Entonces** aparece aunque su nombre se hubiera escrito sin el segundo nombre

*«No es la misma persona»*

- **Dado que** la búsqueda por nombre trae a una homónima
- **Cuando** se pulsa «No es la misma persona»
- **Entonces** el resultado sale de la lista y no se trae nada

**3. Condiciones y excepciones**

- Se muestran hasta seis resultados.
- Un documento coincide si contiene lo buscado desde cinco caracteres.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑030 · RF‑GP‑031
- **Historia de usuario:** HU‑GP‑04
- **Pantalla:** W‑GP‑02 Alta · 1.1 Información Personal
- **Diseño:** Prototipado

---

#### 4.13 · BR-GP-013 · Una persona que trabaja hoy no puede reingresar

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-013
- **Grupo:** El reingreso
- **Qué gobierna:** Duplicados
- **Estado:** Borrador

*Descripción general*

La búsqueda revisa a todos, no solo a los desvinculados. Si el documento coincide entero con el de alguien **vigente**, lo muestra con un aviso —«Esta persona trabaja acá ahora mismo. No es un reingreso»— y **sin botón para traer sus datos**. Es la forma de atajar el alta duplicada de alguien que ya está.

**2. Escenarios ágiles de ejecución**

*El duplicado se ve antes de hacerse*

- **Dado que** una persona activa tiene el carnet 7733410
- **Cuando** se busca 7733410 en el reingreso
- **Entonces** aparece con el aviso de que trabaja acá, y no se puede traer

**3. Condiciones y excepciones**

- A un vigente solo se lo muestra si el documento coincide entero, desde seis caracteres: por nombre no aparece.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑031
- **Historia de usuario:** HU‑GP‑04
- **Pantalla:** W‑GP‑02 Alta · 1.1 Información Personal
- **Diseño:** Prototipado

---

#### 4.14 · BR-GP-014 · Del reingreso se trae a la persona, no el vínculo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-014
- **Grupo:** El reingreso
- **Qué gobierna:** Datos traídos
- **Estado:** Borrador

*Descripción general*

Se traen los datos de **la persona**: nombre, documento, nacimiento y nacionalidad, y los números de por vida —NUA, asegurado de la Caja, RC‑IVA—. También lo que pudo cambiar y conviene revisar: estado civil, profesión, teléfonos, correo, domicilio, contacto de emergencia y cuenta bancaria.

**No** se trae nada del vínculo anterior: puesto, área, sucursal, jefe, contrato, fechas, haber, horario ni accesos. Quien vuelve firma otro contrato.

**2. Escenarios ágiles de ejecución**

*Vuelve con su NUA, no con su sueldo*

- **Dado que** la persona se fue como analista con un haber de Bs 6.000
- **Cuando** se traen sus datos
- **Entonces** el NUA y el carnet quedan cargados
- **Y** el puesto y el haber quedan vacíos para el vínculo nuevo

**3. Condiciones y excepciones**

- Hoy lo traído no queda marcado «a confirmar»; los dos grupos se mantienen separados en el sistema por si se vuelve a marcar. *ABIERTA‑02*.
- «No era ésta» deshace todo lo traído.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑032
- **Historia de usuario:** HU‑GP‑04
- **Pantalla:** W‑GP‑02 Alta · 1.1 Información Personal
- **Diseño:** Prototipado

---

#### 4.15 · BR-GP-015 · Los documentos se traen solo si se piden

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-015
- **Grupo:** El reingreso
- **Qué gobierna:** Datos traídos a pedido
- **Estado:** Borrador

*Descripción general*

Traídos los datos de la persona, se pregunta si se traen también **sus documentos** —foto, carnet escaneado, documento secundario, croquis, certificado de nacimiento—, y la pregunta dice cuáles hay.

**Los permisos y la antigüedad anteriores no se preguntan.** Eran dos preguntas más y se quitaron a pedido del equipo: solo guardaban la respuesta, sin copiar nada. El rol y los accesos se configuran de nuevo en la pestaña 5, Configuración de Colaborador, como en cualquier alta.

Contestar que no **deshace** lo que se había traído: vacía los datos y borra las copias de los archivos.

**2. Escenarios ágiles de ejecución**

*Traer y deshacer los documentos*

- **Dado que** se contestó «Sí» a traer sus documentos
- **Cuando** se cambia la respuesta a «No»
- **Entonces** la foto y los escaneos traídos se quitan de la ficha

*Sin nada que ofrecer, no se ofrece*

- **Dado que** la persona anterior no tenía documentos cargados
- **Cuando** se mira la pregunta de documentos
- **Entonces** el «Sí» está deshabilitado

**3. Condiciones y excepciones**

- Los archivos se copian: borrar el del reingreso no toca el de la ficha anterior.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑032
- **Historia de usuario:** HU‑GP‑04
- **Pantalla:** W‑GP‑02 Alta · 1.1 Información Personal
- **Diseño:** Prototipado

---

### El puesto y la estructura

**Dónde se sienta la persona, leído de Organización**

#### 4.16 · BR-GP-016 · Se elige el cargo, y el sistema asigna la silla libre

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-016
- **Grupo:** El puesto y la estructura
- **Qué gobierna:** Asignación de puesto
- **Estado:** Borrador

*Descripción general*

Recursos Humanos piensa en «entra como cajero en Casa Matriz», no en «entra en la silla CAJ‑003». La lista ofrece **cargos** —nombre, unidad y sucursal—, y al elegir uno el sistema toma **la primera silla libre** de ese cargo.

Con el cargo llegan solos el área, la sucursal, el jefe y la clase de cargo: la ficha los muestra, no los pide.

**2. Escenarios ágiles de ejecución**

*El cargo trae su jefe*

- **Dado que** el cargo Cajero de Casa Matriz tiene tres sillas y dos ocupadas
- **Cuando** se elige ese cargo
- **Entonces** la persona queda en la tercera silla
- **Y** la ficha muestra de quién depende esa silla

*La punta del organigrama no tiene jefe*

- **Dado que** se elige el cargo de Gerente General
- **Cuando** se mira el jefe
- **Entonces** dice «Nadie: es la punta del organigrama»

**3. Condiciones y excepciones**

- Un puesto admite una sola persona —[BR‑ORG‑045, en Organización](public/reglas-de-negocio.html#BR-ORG-045)—.
- Si el jefe del puesto está vacante, se dice: «Supervisor · puesto vacante».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑025
- **Historia de usuario:** HU‑GP‑05
- **Pantalla:** W‑GP‑02 Alta · 2.1 Información Laboral
- **Diseño:** Prototipado

---

#### 4.17 · BR-GP-017 · Un cargo sin sillas libres se muestra apagado, con su motivo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-017
- **Grupo:** El puesto y la estructura
- **Qué gobierna:** Lista de cargos
- **Estado:** Borrador

*Descripción general*

Un cargo lleno **no desaparece** de la lista: aparece apagado y dice por qué —«sin puestos libres · 3 ocupados»—. Si desapareciera, quien lo busca pensaría que no existe.

Si no queda ningún cargo con silla libre, la parte 2.1 avisa —«Puede crear al colaborador de todos modos y ubicarlo después»—: se puede dar de alta igual y ubicar a la persona después, o abrir un puesto en Organización.

**2. Escenarios ágiles de ejecución**

*El cargo lleno se ve y no se elige*

- **Dado que** las tres sillas de Cajero están ocupadas
- **Cuando** se abre la lista de cargos
- **Entonces** Cajero aparece apagado con «sin puestos libres · 3 ocupados»

*Sin ninguna silla, se ofrece la salida*

- **Dado que** la estructura no tiene ninguna silla libre
- **Cuando** se entra a 2.1 Información Laboral
- **Entonces** el aviso ofrece «Ir a Estructura»

**3. Condiciones y excepciones**

- Dar de alta sin puesto es válido; la persona queda «Sin puesto asignado».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑025
- **Historia de usuario:** HU‑GP‑05
- **Pantalla:** W‑GP‑02 Alta · 2.1 Información Laboral
- **Diseño:** Prototipado

---

#### 4.18 · BR-GP-018 · Dar de alta sienta a la persona en su puesto, en el mismo gesto

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-018
- **Grupo:** El puesto y la estructura
- **Qué gobierna:** Alta · organigrama
- **Estado:** Borrador

*Descripción general*

Dar de alta son dos cosas a la vez: la persona entra al directorio y, si se eligió un puesto, **se sienta en él**. Hacer solo lo primero deja a alguien contratado que el organigrama no conoce, y obliga a acordarse mañana de ir a ubicarlo.

**2. Escenarios ágiles de ejecución**

*El organigrama se entera solo*

- **Dado que** la ficha tiene elegido el cargo Analista de Procesos
- **Cuando** se da de alta
- **Entonces** la silla de Analista deja de estar vacante y muestra a la persona

**3. Condiciones y excepciones**

- El cargo que muestra el directorio es el de su puesto, no uno escrito en la ficha.
- La persona nace activa, sin ruta de onboarding y con el avance de su ficha como «registro».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑046
- **Historia de usuario:** HU‑GP‑05
- **Pantalla:** W‑GP‑03 Vista previa
- **Diseño:** Prototipado

---

#### 4.19 · BR-GP-019 · Las listas de la ficha salen de la estructura real, y dicen por qué vienen cortas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-019
- **Grupo:** El puesto y la estructura
- **Qué gobierna:** Listas encadenadas
- **Estado:** Borrador

*Descripción general*

Empresa, unidad de negocio, regional, sucursal, centro de trabajo, área y cargo se eligen de listas que **lee la estructura de Organización**, con la misma función que arma sus tablas: no pueden discrepar. Se acotan entre sí, y cuando una viene corta o vacía, lo dice.

Las listas de personas —jefe, aprobadores, supervisor— ofrecen solo a quienes trabajan hoy.

**2. Escenarios ágiles de ejecución**

*La lista explica el recorte*

- **Dado que** se eligió la sucursal La Paz y el área Ventas
- **Cuando** se abre la lista de cargos
- **Entonces** solo trae cargos de Ventas en La Paz, y lo dice

*Una sucursal sin centros no deja la lista muda*

- **Dado que** la sucursal elegida no tiene centros de trabajo
- **Cuando** se abre la lista de centros
- **Entonces** dice que la persona trabaja en la sucursal misma

**3. Condiciones y excepciones**

- Un desvinculado no aparece como jefe ni como aprobador.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑025
- **Historia de usuario:** HU‑GP‑05
- **Pantalla:** W‑GP‑02 Alta · 2.1 Información Laboral
- **Diseño:** Prototipado

---

### Datos que piden las entidades

**Lo que la ficha tiene que dejar listo para el Ministerio, la Gestora y la Caja**

#### 4.20 · BR-GP-020 · «No aporta» es una respuesta, y tiene que quedar escrita

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-020
- **Grupo:** Datos que piden las entidades
- **Qué gobierna:** Afiliaciones
- **Estado:** Borrador

*Descripción general*

Las preguntas «¿Aporta a la Gestora?» y «¿Está afiliado a la Caja?» **nunca se esconden**, porque su «no» tiene consecuencias: si no aporta a la Gestora, la planilla lleva el aporte en **cero** —no vacío—, se la excluye de las declaraciones SIP y ANS, y la columna del Ministerio va en 0.

La Caja tiene **5 días** desde el ingreso para la afiliación. Un seguro privado no la reemplaza.

**2. Escenarios ágiles de ejecución**

*Un jubilado cotiza distinto*

- **Dado que** la persona aporta a la Gestora y está jubilada
- **Cuando** se marca como jubilada
- **Entonces** se pide el detalle de su jubilación

*El NUA puede esperar*

- **Dado que** la Gestora todavía no asignó el NUA
- **Cuando** se da de alta
- **Entonces** el alta se hace y el NUA queda en proceso

**3. Condiciones y excepciones**

- Hay una sola Gestora: la pregunta es si aporta, no a cuál.
- La fecha de ingreso a la Caja es la misma fecha de ingreso: no se pide aparte.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑022
- **Historia de usuario:** HU‑GP‑06
- **Pantalla:** W‑GP‑02 Alta · 2.3 Compensación, Nómina y Afiliaciones
- **Diseño:** Prototipado

---

#### 4.21 · BR-GP-021 · Los beneficiarios y herederos suman el 100 %

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-021
- **Grupo:** Datos que piden las entidades
- **Qué gobierna:** Beneficiarios
- **Estado:** Borrador

*Descripción general*

Declarar beneficiarios es una obligación legal, y los porcentajes de todos tienen que sumar exactamente el 100 %. El total repartido se calcula solo y se muestra junto a la lista.

**2. Escenarios ágiles de ejecución**

*El total avisa lo que falta repartir*

- **Dado que** hay dos herederos con 50 % y 30 %
- **Cuando** se mira el total
- **Entonces** dice 80 % y que falta repartir un 20 %

**3. Condiciones y excepciones**

- La unión libre cuenta igual que el matrimonio para el cónyuge.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑023 · RF‑GP‑026
- **Historia de usuario:** HU‑GP‑06
- **Pantalla:** W‑GP‑02 Alta · 1.2 Información Familiar
- **Diseño:** Prototipado

---

#### 4.22 · BR-GP-022 · El documento de identidad se pide según quién lo emite

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-022
- **Grupo:** Datos que piden las entidades
- **Qué gobierna:** Documento de identidad
- **Estado:** Borrador

*Descripción general*

La **extensión departamental** y el **complemento SEGIP** se piden solo para un documento nacional de identidad emitido en Bolivia. El carnet de extranjero lo emite Migración y no lleva extensión. El documento se guarda con su número, complemento y extensión juntos, y se llama «documento» y no «CI», porque fuera de Bolivia ese nombre miente.

**2. Escenarios ágiles de ejecución**

*Un pasaporte no pide extensión*

- **Dado que** la persona se identifica con pasaporte peruano
- **Cuando** se completa el documento
- **Entonces** no aparecen extensión ni complemento

**3. Condiciones y excepciones**

- Las extensiones son las nueve de los departamentos: LP, SC, CB, OR, PT, TJ, CH, BE y PD.
- **El país emisor va primero** en la sección, antes del tipo y el número: es lo que decide si se piden la extensión y el complemento, y elegirlo después hacía que esos campos aparecieran y desaparecieran delante de quien llena la ficha. Vale igual para el documento secundario.
- El documento secundario es opcional y arranca sin ninguno.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑022
- **Historia de usuario:** HU‑GP‑06
- **Pantalla:** W‑GP‑02 Alta · 1.1 Información Personal
- **Diseño:** Prototipado

---

### Vista previa y alta

**La última mirada antes de que la persona exista**

#### 4.23 · BR-GP-023 · La vista previa es la misma ficha, leída como expediente

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-023
- **Grupo:** Vista previa y alta
- **Qué gobierna:** Vista previa
- **Estado:** Borrador

*Descripción general*

No es otra pantalla con otros datos: son las mismas secciones con el formulario cerrado, bajo una **tapa de expediente** —foto, nombre, cargo, documento, ingreso, contrato, correo, avance— y **tres separadores**: Información Personal, Información Laboral y En la empresa. Lo que se revisa antes de dar de alta es el legajo de una persona, y se ve como tal.

**2. Escenarios ágiles de ejecución**

*Lo vacío dice que está vacío*

- **Dado que** no se cargó el correo
- **Cuando** se abre la vista previa
- **Entonces** la tapa dice «Correo · Por completar»

*Corregir sin recorrer*

- **Dado que** en la vista previa se ve un error en el contrato
- **Cuando** se pulsa «Editar» en la sección del contrato
- **Entonces** se abre 2.2 Relación Laboral

**3. Condiciones y excepciones**

- El verde de un separador se reserva para «completo».
- La tapa distingue «Reingreso» de «Alta nueva».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑040 a 042
- **Historia de usuario:** HU‑GP‑07
- **Pantalla:** W‑GP‑03 Vista previa
- **Diseño:** Prototipado

---

#### 4.24 · BR-GP-024 · Si falta algo para el alta, se dice entero y se lleva a cada dato

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-024
- **Grupo:** Vista previa y alta
- **Qué gobierna:** Aviso de faltantes
- **Estado:** Borrador

*Descripción general*

Pulsar «Dar de alta» con faltantes **no mueve a nadie en silencio**: abre un aviso —«Todavía no se puede dar de alta»— que **lista todos** los datos que faltan, con su paso y un «Completar →» cada uno. Así nadie corrige uno, vuelve a intentar y descubre el siguiente.

**2. Escenarios ágiles de ejecución**

*Los dos faltantes a la vista*

- **Dado que** faltan el apellido paterno y la fecha de ingreso
- **Cuando** se pulsa «Dar de alta»
- **Entonces** el aviso dice «Faltan 2 datos obligatorios» con una fila para cada uno

*«Completar» lleva al campo*

- **Dado que** el aviso está abierto
- **Cuando** se pulsa «Completar →» en la fecha de ingreso
- **Entonces** se abre 2.2 Relación Laboral con la sección desplegada y el campo resaltado

**3. Condiciones y excepciones**

- El aviso se cierra con Escape o con «Seguir revisando».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑044 · RF‑GP‑045
- **Historia de usuario:** HU‑GP‑08
- **Pantalla:** W‑GP‑03 Vista previa
- **Diseño:** Prototipado

---

### El directorio

**Las personas ya dadas de alta y su estado**

#### 4.25 · BR-GP-025 · El estado del vínculo y la ausencia son dos cosas distintas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-025
- **Grupo:** El directorio
- **Qué gobierna:** Estado · ausencia
- **Estado:** Borrador

*Descripción general*

El **estado del vínculo** —activo, suspendido, desvinculado— lo cambia una persona. La **ausencia** —vacaciones, licencia médica— tiene fechas y **termina sola**. Mientras una ausencia está en curso, manda sobre el estado en la insignia del directorio; al terminar, la persona vuelve a verse con su estado de siempre sin que nadie la toque.

**2. Escenarios ágiles de ejecución**

*Las vacaciones terminan solas*

- **Dado que** una persona activa está de vacaciones hasta el viernes
- **Cuando** se mira el directorio el lunes
- **Entonces** su insignia vuelve a decir «Activo»

**3. Condiciones y excepciones**

- Una persona de vacaciones sigue contando como activa en las cifras del directorio.
- «Vigente» es todo el que no está desvinculado.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑002 · RF‑GP‑003
- **Historia de usuario:** HU‑GP‑09
- **Pantalla:** W‑GP‑01 Directorio
- **Diseño:** Prototipado

---

#### 4.26 · BR-GP-026 · Suspender y desvincular piden motivo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-026
- **Grupo:** El directorio
- **Qué gobierna:** Cambio de estado
- **Estado:** Borrador

*Descripción general*

Suspender pide **motivo**, porque no es lo mismo una suspensión disciplinaria —no se paga— que una por incapacidad —la cubre la Caja—. Desvincular pide **motivo y fecha**.

**2. Escenarios ágiles de ejecución**

*Sin motivo no se suspende*

- **Dado que** se abre «Cambiar estado» y se elige Suspendido
- **Cuando** se intenta confirmar sin motivo
- **Entonces** no se confirma y se pide el motivo

**3. Condiciones y excepciones**

- En el prototipo el cambio de estado todavía no se guarda. *Ver 6.6.*
- Un desvinculado deja de ofrecerse como jefe o aprobador —BR‑GP‑019— y puede reingresar —BR‑GP‑012—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑007
- **Historia de usuario:** HU‑GP‑10
- **Pantalla:** W‑GP‑01 Directorio
- **Diseño:** Prototipado

---

### Editar y eliminar

**Lo que se puede hacer con alguien que ya está dado de alta**

#### 4.27 · BR-GP-027 · Editar es la misma ficha: abre en lectura y guarda sabiendo qué cambia

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-027
- **Grupo:** Editar y eliminar
- **Qué gobierna:** Edición de la ficha
- **Estado:** Borrador · sin construir

*Descripción general*

La ficha de alguien dado de alta se edita en **la misma pantalla del alta**, con sus cinco pestañas. Abre **en lectura** y se pasa a edición. A diferencia del alta, no se guarda sola: **«Guardar cambios»** muestra antes qué cambió, porque cada dato ya está en planilla y declarado a las entidades. Cada cambio queda en el historial de la ficha.

**2. Escenarios ágiles de ejecución**

*Mirar no cambia nada*

- **Dado que** se abre la ficha de Diego Morales desde «Ver perfil»
- **Cuando** se recorren sus pestañas
- **Entonces** todos los campos están bloqueados hasta pulsar «Editar»

*El cambio queda escrito*

- **Dado que** se cambia la cuenta bancaria y se pulsa «Guardar cambios»
- **Cuando** se confirma la lista de cambios
- **Entonces** el historial de cambios de la ficha registra quién, cuándo, la cuenta anterior y la nueva

**3. Condiciones y excepciones**

- Los bloqueos del alta siguen: no se puede vaciar el nombre, el apellido paterno ni la fecha de ingreso.
- El haber básico y el cargo piden desde qué fecha rige el cambio.
- La sección del reingreso no aparece; la de salida sí.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑050 a 054
- **Historia de usuario:** HU‑GP‑11
- **Pantalla:** Ficha del colaborador · `/personas/colaboradores/:id`
- **Diseño:** Por prototipar

---

#### 4.28 · BR-GP-028 · Cambiar el cargo mueve a la persona en el organigrama

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-028
- **Grupo:** Editar y eliminar
- **Qué gobierna:** Edición · organigrama
- **Estado:** Borrador · sin construir

*Descripción general*

Igual que dar de alta sienta a la persona —BR‑GP‑018—, cambiarle el cargo **libera su silla anterior y la sienta en la nueva** en el mismo gesto. Si solo cambiara la ficha, el organigrama seguiría mostrándola donde ya no está.

**2. Escenarios ágiles de ejecución**

*Un ascenso se ve en el organigrama*

- **Dado que** una analista pasa a supervisora desde el 1 del mes siguiente
- **Cuando** se guarda el cambio de cargo con esa fecha
- **Entonces** desde esa fecha la silla de analista queda vacante y la de supervisora la muestra a ella

**3. Condiciones y excepciones**

- Solo se ofrecen cargos con silla libre, como en el alta —BR‑GP‑017—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑054 · RF‑GP‑055
- **Historia de usuario:** HU‑GP‑11
- **Pantalla:** Ficha del colaborador · 2.1 Información Laboral
- **Diseño:** Por prototipar

---

#### 4.29 · BR-GP-029 · A un colaborador no se lo borra: se lo desvincula

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-029
- **Grupo:** Editar y eliminar
- **Qué gobierna:** Eliminación
- **Estado:** Borrador · sin construir

*Descripción general*

Quien dejó de trabajar se **desvincula**: queda en el directorio, con su historia, y se lo puede reconocer si vuelve. **Eliminar** existe solo para un alta hecha por error —alguien que nunca llegó a trabajar, o un duplicado— y solo si la persona **no tiene historia**: ninguna planilla procesada, marcación, documento emitido ni evaluación. Eliminar pide escribir el nombre de la persona para confirmar, y libera su silla.

**2. Escenarios ágiles de ejecución**

*Con historia, solo se desvincula*

- **Dado que** una persona ya cobró una planilla
- **Cuando** se abre su menú
- **Entonces** no se ofrece «Eliminar»; se ofrece desvincularla

*Un duplicado se elimina*

- **Dado que** se dio de alta dos veces a la misma persona hoy
- **Cuando** se elimina la copia escribiendo su nombre
- **Entonces** la copia sale del directorio y su silla queda libre

**3. Condiciones y excepciones**

- Hasta cuándo después del alta se puede eliminar está abierto. *ABIERTA‑11*.
- Descartar un borrador no es eliminar a nadie: un borrador no es un colaborador.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑060 a 063
- **Historia de usuario:** HU‑GP‑12
- **Pantalla:** W‑GP‑01 Directorio
- **Diseño:** Por prototipar

---

### Clientes externos

**Las personas de afuera que participan en las evaluaciones**

#### 4.30 · BR-GP-030 · Un cliente externo no es un colaborador

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-030
- **Grupo:** Clientes externos
- **Qué gobierna:** Cliente externo
- **Estado:** Borrador

*Descripción general*

Un cliente externo es alguien de afuera que **evalúa** a colaboradores con los que tiene trato. No tiene ficha, ni puesto, ni vínculo, ni planilla: por eso vive en su propia lista, no aparece en el directorio ni en las cifras de colaboradores, y su registro son siete datos.

**2. Escenarios ágiles de ejecución**

*No suma al directorio*

- **Dado que** se registra a un cliente externo
- **Cuando** se mira el directorio de colaboradores
- **Entonces** el total no cambia y el cliente no aparece en la tabla

**3. Condiciones y excepciones**

- Un cliente externo no puede ser jefe, buddy ni aprobador de nadie.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑070 · RF‑GP‑072
- **Historia de usuario:** HU‑GP‑13
- **Pantalla:** W‑GP‑04 Clientes externos
- **Diseño:** Prototipado

---

#### 4.31 · BR-GP-031 · El correo es obligatorio, porque por ahí llega la evaluación

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-031
- **Grupo:** Clientes externos
- **Qué gobierna:** Registro de cliente externo
- **Estado:** Borrador

*Descripción general*

Nombre, apellido paterno y correo son obligatorios. El correo, además, se valida: un cliente sin correo válido es un evaluador al que la evaluación nunca le llega. El resto —apellido materno, teléfono, empresa— es opcional.

**2. Escenarios ágiles de ejecución**

*Un correo incompleto no se guarda*

- **Dado que** se escribe «juan@» como correo
- **Cuando** se pulsa «Guardar cliente»
- **Entonces** no se guarda y el aviso dice que el correo no parece válido

**3. Condiciones y excepciones**

- Cada campo tiene un máximo de caracteres y un contador.
- Si dos clientes pueden compartir correo está abierto. *ABIERTA‑13*.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑072 · RF‑GP‑073
- **Historia de usuario:** HU‑GP‑13
- **Pantalla:** W‑GP‑04 Clientes externos
- **Diseño:** Prototipado

---

#### 4.32 · BR-GP-032 · Un cliente externo no se borra, se desactiva

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-032
- **Grupo:** Clientes externos
- **Qué gobierna:** Estado del cliente externo
- **Estado:** Borrador

*Descripción general*

Un cliente que ya evaluó a alguien deja su nombre en esas evaluaciones; borrarlo las dejaría sin autor. **Inactivo** deja de ofrecerse para evaluaciones nuevas y conserva lo que ya hizo. Se puede volver a activar.

**2. Escenarios ágiles de ejecución**

*Desactivar y volver*

- **Dado que** un cliente dejó de trabajar con la empresa
- **Cuando** se lo desactiva desde su fila
- **Entonces** se ve atenuado con la insignia «Inactivo», y el botón permite activarlo otra vez

**3. Condiciones y excepciones**

- La lista no ofrece eliminar.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑075
- **Historia de usuario:** HU‑GP‑13
- **Pantalla:** W‑GP‑04 Clientes externos
- **Diseño:** Prototipado

---

### El anticipo de quincena

**Un adelanto a mitad de mes, que se descuenta en la planilla del mes**

#### 4.33 · BR-GP-033 · El anticipo de quincena se descuenta en la planilla del mes, y nunca supera el haber básico

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-GP-033
- **Grupo:** El anticipo de quincena
- **Qué gobierna:** 2.3 Compensación, Nómina y Afiliaciones · planilla
- **Estado:** Borrador

*Descripción general*

Tres campos en **Datos de haber básico**: **¿Recibe anticipo de quincena?** (sí/no, arranca en No), **Tipo de anticipo** —porcentaje del haber básico o monto fijo— y **Valor**. Los dos últimos solo aparecen, y solo se piden, si la respuesta es Sí. Es un dato manual, **independiente de la frecuencia de pago**.

**No genera una segunda planilla ni una segunda declaración.** Es un adelanto que se descuenta del líquido pagable en la corrida del mes: el trabajador ve **una boleta, no dos**.

El adelanto se calcula así: si el tipo es porcentaje, `haber básico × valor ÷ 100`; si es monto fijo, `valor`. **Nunca puede superar el haber básico**: no tiene sentido adelantar más de lo que la persona va a cobrar ese mes, y el propio campo lo tapa en vez de dejar que lo descubra la corrida.

**2. Escenarios ágiles de ejecución**

*El porcentaje no pasa de 100*

- **Dado que** el tipo es «Porcentaje del haber básico»
- **Cuando** se escribe 150 en el valor
- **Entonces** el valor queda en 100 y el rótulo dice «Valor (%)»

*El monto no pasa del haber*

- **Dado que** el haber básico es Bs 5.000 y el tipo es «Monto fijo»
- **Cuando** se escribe 9.000
- **Entonces** el valor queda en 5.000
- **Y** si después el haber baja a Bs 3.000, el valor queda marcado en rojo con el tope nuevo, sin corregirse solo

**3. Condiciones y excepciones**

- Sin tipo elegido, el valor pide elegirlo antes; con monto fijo y sin haber básico, pide escribir antes el haber.
- Son dos campos y no uno: en una sola casilla, cambiar de porcentaje a monto sin tocar el número adelantaba Bs 50 en vez del 50 %. El rótulo cambia de «(%)» a «(Bs)» para que el cambio de unidad se vea.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑GP‑027
- **Historia de usuario:** HU‑GP‑06
- **Pantalla:** W‑GP‑02 Alta · 2.3 Compensación, Nómina y Afiliaciones
- **Diseño:** Prototipado

---

### 4.1 Quién hace qué

| Acción | Recursos Humanos | Líder de área | Colaborador |
| --- | --- | --- | --- |
| Ver el directorio | Sí | Sí | No |
| Dar de alta | Sí | No | No |
| Cambiar el estado del vínculo | Sí | No | No |
| Asignar ruta de onboarding | Sí | No | No |
| Editar la ficha de un colaborador | Sí | No | No |
| Eliminar un alta por error | Sí | No | No |
| Registrar, editar y desactivar clientes externos | Sí | No | No |
| Ver sueldo, salud e historial disciplinario | Por definir — ABIERTA‑04 |

## 05 · Modelo de datos

*Qué se guarda, qué se deduce y qué se expone. La persona, su ficha como mapa de claves y la silla que ocupa en Organización.*

Esta sección es para desarrollo. Describe **qué se guarda, qué se deduce y qué se expone**; no prescribe motor de base de datos ni nombres de tabla definitivos.

### 5.1 Las entidades

┌────────────────────────┐ ┌──────────────────────────┐ │

COLABORADOR

│ │

PUESTO

(Organización) │ │ │ ocupa 0..1│ │ │ id · nombre · correo │─────────▶│ ocupanteId │ │ documento · rol │ │ cargo · unidad · sucursal │ │ ingreso · estado │ │ jefe │ │ registro % · onboarding│ └──────────────────────────┘ │

ficha

───────────────┐ │ └────────────────────────┘ │ ▼ ┌─────────────────────────────┐ ┌───────────────────┐ │

FICHA

│ │

ARCHIVOS

│ │ mapa clave del estudio → valor│──────▶│ foto · escaneos │ │ «1.1» · «3.25» · «3.65» … │ │ certificados │ └─────────────────────────────┘ └───────────────────┘

BORRADOR

: la misma forma que FICHA, sin colaborador todavía. Uno por navegador.

| Entidad | Qué guarda |
| --- | --- |
| **Colaborador** | Lo que el directorio lista sin abrir la ficha: identificador, nombre, correo, documento, departamento, cargo, rol, fecha de ingreso, estado del vínculo, avance de la ficha, estado de onboarding, iniciales, foto — y **la ficha entera** |
| **Ficha** | Todos los datos de la persona, como un mapa de **clave del estudio → valor** |
| **Borrador** | Una ficha sin colaborador. Vive en el navegador hasta que se da de alta |
| **Archivo** | El binario de cada adjunto, guardado aparte; la ficha solo guarda su referencia |
| **Puesto** | Es de Organización. Gestión de personas solo escribe quién lo ocupa |
| **Cliente externo** | Nombre, apellido paterno, apellido materno, teléfono, correo, empresa u organización, rol y si está activo. No se relaciona con ningún puesto |
| **Historial de la ficha** | Cada cambio hecho al editar: quién, cuándo, dato, valor anterior y nuevo, y desde cuándo rige |

### 5.2 La ficha: un mapa de claves

La ficha no es una tabla con trescientas columnas: es un mapa cuya clave es el **identificador del dato en el estudio de la propuesta** —`1.1` primer nombre, `3.25` fecha de ingreso, `3.65` haber básico—. Esa clave no cambia aunque cambie el rótulo del dato o el paso donde se muestra.

Los datos se definen en un archivo generado a partir del estudio, que dice de cada uno su rótulo, su tipo, su nivel, si es obligatorio, su insignia, su ayuda y su traza. **Ese archivo no se edita a mano**: se regenera desde el estudio.

| Tipo | Cuántos | Qué guarda |
| --- | --- | --- |
| Texto | 183 | Una línea o varias |
| Lista | 77 | Una opción de un catálogo |
| Sí / no | 50 | `si` o `no` |
| Archivo | 18 | La referencia a un adjunto |
| Mapa | 2 | Una ubicación |

### 5.3 Lo que se guarda y lo que se deduce

| Se guarda | Se deduce |
| --- | --- |
| Lo que alguien escribe o elige | Nombre completo · fin del periodo de prueba · estado de una licencia · total repartido entre herederos · tiempo trabajado · quién registró la ficha y cuándo · reingreso o alta nueva |
| El puesto elegido | Área, sucursal, jefe y clase de cargo, leídos del puesto |
| — | El avance de cada parte, de cada pestaña y de la ficha, y qué pestañas y partes deben algo del mínimo legal |

### 5.4 Los grupos repetibles

Contactos de emergencia, hijos, herederos, **supervisores funcionales**, licencias, cada equipo, uniforme, EPP, herramienta, vehículo o licencia de software entregado, el documento secundario y los documentos adicionales se repiten. Cada copia numera su clave: `2.20`, `2.20#2`, `2.20#3`. Quitar una copia sube las de abajo y vacía la última. Todos los grupos arrancan con una copia, salvo el documento secundario, lo entregado en Recursos y Activos y los documentos adicionales, que arrancan en cero.

### 5.5 La traza de cada dato

Cada dato lleva una traza de auditoría que no se muestra en pantalla: quién lo consume, en qué condición aparece y de qué formulario oficial sale. El «quién lo consume» se escribe con códigos:

| Código | Qué es | Datos que lo llevan |
| --- | --- | --- |
| GP | Gestión de personas *— a confirmar* | 173 |
| PL | Planillas | 87 |
| — | *Informativo, sin gobernar ningún cálculo* | 2 |
| CC | Comunicación *— a confirmar* | 20 |
| ON | Onboarding | 20 |
| ERP | ERP y contabilidad | 19 |
| DE | Desempeño y evaluación *— a confirmar* | 9 |

> **Tres códigos no están definidos en ningún lado.** «GP» se usa como Gestión de personas y en otro lugar como Gestora; «CC» y «DE» se deducen de los datos que los llevan. Hasta que se confirmen —ABIERTA‑01— esta tabla es una lectura, no una definición.

### 5.6 Lo que viaja al dar de alta

Al dar de alta se escriben dos cosas: el colaborador —con **la ficha entera** adentro, para que Documentación y los demás módulos la lean sin pedirla de nuevo— y el ocupante del puesto elegido. El borrador se vacía.

## 06 · Roadmap

*Cómo se llega a desarrollo, en qué orden se construye, y las diecisiete decisiones que todavía faltan.*

### 6.1 El camino hasta desarrollo

**Este documento no va a desarrollo. Lo que recibe desarrollo es el prototipo.** El documento existe para que el prototipo se construya sobre decisiones acordadas, y para poder rastrear después por qué cada pantalla es como es.

| Fase | Qué pasa | Quién | Cuándo |
| --- | --- | --- | --- |
| **Prototipo** | El directorio, el alta en cinco pestañas y la vista previa, navegables | Diseño UX | **Hecho** y en ajuste |
| **Documento** | Este: reglas, requisitos, modelo y flujos | Diseño UX | **En borrador** |
| **Validación** | Se recorre el prototipo con Recursos Humanos y con quien corresponda | Por definir | Por definir |
| **Correcciones** | Se ajusta el prototipo con lo que salga de la validación | Diseño UX | Por definir |
| **Entrega a desarrollo** | Se pasa el prototipo aprobado | Diseño UX → Desarrollo | Por definir |

### 6.2 Las tres entregas

| Etapa | Qué incluye | Cuándo se considera lista |
| --- | --- | --- |
| **1 · Dar de alta en regla** | RF‑GP‑001 a 007 RF‑GP‑010 a 014, 017 RF‑GP‑020, 022, 025, 046 RNF‑GP‑01, 02 | Recursos Humanos da de alta a una persona con su mínimo legal y la ve en el directorio y en su puesto |
| **2 · La ficha completa** | RF‑GP‑015, 016 RF‑GP‑021, 023, 024, 026, 028, 029 RF‑GP‑030 a 032 RF‑GP‑040 a 045 RF‑GP‑070 a 076 RNF‑GP‑03, 04 | Las cinco pestañas con sus partes, el reingreso, la vista previa como expediente y los clientes externos |
| **3 · Después del alta** | RF‑GP‑050 a 055 RF‑GP‑060 a 063 FUERA‑02, 03 RNF‑GP‑05 Registro de actividad | Ver y editar la ficha de alguien dado de alta, desvincular, exportar a las entidades y medir los indicadores de 1.5 |

### 6.3 Hitos de control

- **Antes de la etapa 1:** cerradas ABIERTA‑03 —si la fecha de ingreso es del mínimo— y ABIERTA‑04 —quién ve los datos sensibles—.
- **Antes de la etapa 2:** cerrada ABIERTA‑07 —qué secciones marcadas como propuesta se quedan—.
- **Antes de la etapa 3:** cerrada ABIERTA‑01 —qué consume cada código de la traza—, porque de ella salen los exportadores.

### 6.4 Dependencias

| Depende de | Para qué |
| --- | --- |
| **Organización** | Cargos, puestos, unidades y sucursales. Sin estructura no hay dónde sentar a nadie: no se cargan personas antes que la estructura |
| **Documentación** | Que el expediente lea la ficha guardada de la persona |
| **Onboarding** | Que las rutas existan para poder asignarlas desde el directorio |

### 6.5 Suposiciones

- La empresa opera en Bolivia: los catálogos de documento, departamentos, provincias y entidades son los bolivianos.
- El alta la hace Recursos Humanos, no el colaborador.
- Un colaborador ocupa un solo puesto a la vez.

### 6.6 Riesgos

| Riesgo | Qué pasa si se ignora |
| --- | --- |
| **El borrador vive en el navegador** | En el prototipo, un alta empezada en una computadora no se ve en otra, y sus datos —incluidos salud y cuenta bancaria— quedan en ese equipo. En el producto el borrador tiene que vivir en el servidor |
| **Cambiar la clave de un dato** | Toda ficha guardada con la clave vieja pierde ese dato. Las claves del estudio no se renumeran |
| **Acciones que se ven y no hacen nada** | En el directorio, «Ver perfil», «Editar», «Enviar credenciales» y guardar un cambio de estado todavía no funcionan. Un prototipo que los muestra puede leerse como hecho |
| **Cifras viejas en los comentarios del código** | Varios dicen ocho, nueve u once pasos y 249 campos. Lo vigente son cinco pestañas y 240 datos, como dice este documento |

### 6.7 Decisiones abiertas

| # | Pregunta | Quién decide |
| --- | --- | --- |
| ABIERTA‑01 | ¿Qué consume cada código de la traza? «GP» ¿es Gestión de personas o la Gestora? ¿Qué son «CC» y «DE»? | Producto |
| ABIERTA‑02 | En un reingreso, ¿se vuelven a marcar «a confirmar» los datos que pudieron cambiar —domicilio, cuenta bancaria—? | RR.HH. |
| ABIERTA‑03 | La fecha de ingreso bloquea el alta pero está en el nivel Operativo. ¿Pasa al mínimo legal? | RR.HH. |
| ABIERTA‑04 | ¿Quién puede ver el sueldo, los datos de salud y el historial disciplinario? | RR.HH. y Legal |
| ABIERTA‑06 | ¿30 días es el umbral correcto para que una licencia se vea «por vencer»? | RR.HH. |
| ABIERTA‑07 | Veintidós secciones están marcadas como propuesta del estudio. ¿Cuáles se quedan? | RR.HH. y Producto |
| ABIERTA‑08 | «Exámenes ocupacionales» y «Reglamentos entregados» no tienen datos todavía y no se muestran. ¿Qué piden? | RR.HH. |
| ABIERTA‑09 | La cifra «Ausentes» del directorio cuenta desvinculados. ¿Debe contar vacaciones y licencias, como dice su rótulo? | Producto |
| ABIERTA‑11 | ¿Hasta cuándo después del alta se puede eliminar a alguien, además de exigir que no tenga historia? | RR.HH. y Producto |
| ABIERTA‑12 | ¿Qué otros roles puede tener un cliente externo, además de Evaluador? | RR.HH. |
| ABIERTA‑13 | ¿Pueden dos clientes externos compartir el mismo correo? | Producto |
| ABIERTA‑14 | ¿Se derivan de la modalidad de contrato y la categoría del puesto los interruptores que no son decisiones —aguinaldo, «desde el primer mes»—, y se muestran de solo lectura? | RR.HH. y Producto |
| ABIERTA‑16 | ¿«Aportes patronales» se muda al bloque de la Gestora, y qué regla impide que contradiga «¿aporta a la Gestora?»? | RR.HH. y Producto |
| ABIERTA‑17 | Subsidio de frontera: ¿qué norma, qué porcentaje y quién califica? ¿Se deriva de la sucursal? ¿El monto se calcula o se digita? | RR.HH. |
| ABIERTA‑10 | La miga «← Colaboradores › Nuevo colaborador» reemplazó al botón de volver. ¿Pasa a las demás pantallas de detalle? | Diseño UX |

## 07 · Flujos de usuario

*Los nueve recorridos que de verdad se hacen en este módulo, con su camino feliz y sus desvíos.*

### F-GP-01 · Dar de alta a alguien nuevo

**Quién** Recursos Humanos  
**Desde dónde** Directorio, «Nuevo colaborador»  
**Termina en** La persona en el directorio y en su puesto

1. Pulsa **«Nuevo colaborador»**. Se abre la ficha en 1.1 Información Personal, con la pregunta del reingreso respondida «No».
2. Completa **Información Personal**: nombre, documento, nacimiento, nacionalidad y un teléfono.
3. Completa el **contacto de emergencia** en Información Familiar.
4. En **Información Laboral** elige el cargo; el área, la sucursal y el jefe llegan solos.
5. En **2.2 Relación Laboral** pone la modalidad y la fecha de ingreso; en **2.3 Compensación, Nómina y Afiliaciones**, el haber básico.
6. Pulsa **«Revisar la ficha»**, recorre el expediente y pulsa **«Dar de alta»**.

> **Si la persona ya trabajó en la empresa:** sigue F-GP-03.

> **Si no hay puestos libres:** sigue F-GP-04.

> **Si falta un dato que bloquea:** sigue F-GP-05.

### F-GP-02 · Un alta en varias sesiones

**Quién** Recursos Humanos  
**Desde dónde** Un borrador empezado  
**Termina en** El alta, días después

1. El lunes carga lo que trajo la persona: carnet, domicilio, familia. Pulsa **«Guardar borrador y salir»**.
2. El miércoles llega el contrato firmado. Entra a «Nuevo colaborador»: **el borrador está donde lo dejó**.
3. Va directo a **2.2 Relación Laboral** por el riel y la completa.
4. El viernes llega la cuenta bancaria; la carga en 2.3 y da de alta.

> **Si abre la ficha en otra computadora:** en el prototipo no ve el borrador —6.6—.

### F-GP-03 · Recontratar a alguien

**Quién** Recursos Humanos  
**Desde dónde** 1.1 Información Personal, pregunta del reingreso  
**Termina en** Una ficha con los datos de la persona y un vínculo nuevo

1. Contesta **«Sí»** a si la persona ya trabajó en la empresa.
2. Busca por **carnet** —o por nombre— y encuentra a la persona.
3. Pulsa **«Traer sus datos»**: se copian su nombre, documento, nacimiento, números de por vida y contactos.
4. Decide si trae sus **documentos**.
5. Completa lo del vínculo nuevo —cargo, contrato, haber— y da de alta.

> **Si la búsqueda trae a alguien que trabaja hoy:** el aviso dice que no es un reingreso y no deja traer nada —BR‑GP‑013—.

> **Si trajo a la persona equivocada:** «No era ésta» deshace todo.

### F-GP-04 · Dar de alta sin puestos libres

**Quién** Recursos Humanos  
**Desde dónde** 2.1 Información Laboral  
**Termina en** La persona dada de alta, con o sin puesto

1. Entra a 2.1 y ve el aviso: **no hay puestos libres en la estructura**.
2. Elige: **«Ir a Estructura»** para abrir una silla en Organización, o seguir sin puesto.
3. Si abrió la silla, vuelve a la ficha —el borrador sigue ahí— y elige el cargo.

> **Si sigue sin puesto:** la persona queda «Sin puesto asignado» y hay que ubicarla después.

### F-GP-05 · Dar de alta con datos faltantes

**Quién** Recursos Humanos  
**Desde dónde** Vista previa  
**Termina en** El alta, con los faltantes completos

1. Pulsa **«Dar de alta»** y se abre el aviso con **todos** los datos que faltan.
2. Pulsa **«Completar →»** en el primero: la ficha lo lleva al campo, abierto y resaltado.
3. Lo completa, vuelve a la vista previa y repite con el siguiente.
4. Con los tres bloqueos resueltos, el sello dice **«Ya se puede dar de alta»**.

> **Si falta algo del mínimo que no bloquea:** el alta se hace, y la pestaña sigue con su punto rojo hasta completarlo.

### F-GP-06 · Asignar la ruta de onboarding

**Quién** Recursos Humanos  
**Desde dónde** Directorio, menú de la fila  
**Termina en** La persona con su ruta y su buddy

1. En el directorio, la persona recién dada de alta muestra **«Sin ruta»**.
2. Abre el menú de su fila y elige **asignar ruta**.
3. Elige la ruta y, si corresponde, su **buddy**.

### F-GP-07 · Corregir la ficha de alguien dado de alta

**Quién** Recursos Humanos  
**Desde dónde** Lista de colaboradores, «Editar»  
**Termina en** La ficha corregida y el cambio en el historial

1. En la lista, abre el menú de la persona y elige **«Editar»**. La ficha abre en lectura.
2. Pulsa **«Editar»**, va a la parte que corresponde y corrige el dato.
3. Pulsa **«Guardar cambios»**, revisa la lista de lo que cambió y confirma.
4. El cambio queda en el **historial de cambios**, con su nombre y la fecha.

> **Si cambia el haber o el cargo:** se pide desde qué fecha rige, y el cargo mueve a la persona en el organigrama.

> **Si sale sin guardar:** se pregunta si se descartan los cambios.

### F-GP-08 · Dar de baja a una persona

**Quién** Recursos Humanos  
**Desde dónde** Lista de colaboradores, menú de la fila  
**Termina en** La persona desvinculada, o el alta por error eliminada

1. Si la persona **dejó de trabajar**: «Cambiar estado» → **Desvinculado**, con motivo y fecha. Queda en la lista con su insignia y su silla se libera.
2. Si fue **un alta por error** y la persona no tiene historia: **«Eliminar»**, escribiendo su nombre para confirmar.

> **Si la persona ya tiene historia:** no se ofrece eliminar; solo desvincular —BR‑GP‑029—.

### F-GP-09 · Registrar un cliente externo

**Quién** Recursos Humanos  
**Desde dónde** Clientes externos  
**Termina en** El cliente en la lista, activo

1. Pulsa **«Nuevo cliente externo»**.
2. Completa nombre, apellido paterno y correo; si los tiene, apellido materno, teléfono y empresa.
3. Deja el rol en **Evaluador** y pulsa **«Guardar cliente»**.

> **Si falta un obligatorio o el correo no es válido:** el aviso aparece debajo del campo y no se guarda.

> **Si el cliente deja de trabajar con la empresa:** se lo desactiva desde su fila; no se lo borra.

## 08 · Recursos visuales

*Las pantallas del módulo y cuatro wireframes. Sirven para discutir la estructura sin discutir el estilo.*

> **Los wireframes no son maquetas.** Dibujan qué hay en cada pantalla, en qué orden y por qué; no dicen de qué color es nada. No reemplazan al prototipo.

### 8.1 Las pantallas del módulo

| Pantalla | Ruta | Para qué se entra | Requisitos | Wireframe |
| --- | --- | --- | --- | --- |
| **Directorio** | `/personas/colaboradores` | Encontrar a una persona, ver su estado y su avance, y asignarle su ruta | RF‑GP‑001 a 007 | W‑GP‑01 |
| **Nuevo colaborador** | `/personas/colaboradores/nuevo` | Dar de alta en cinco pestañas, con el borrador que se guarda solo | RF‑GP‑010 a 032 | W‑GP‑02 |
| **Vista previa** | `…/nuevo?paso=previa` | Revisar la ficha como expediente y dar de alta | RF‑GP‑040 a 046 | W‑GP‑03 |
| **Ficha del colaborador** | `/personas/colaboradores/:id` | Ver y editar la ficha de alguien dado de alta. Especificada, sin construir | RF‑GP‑050 a 055 | — |
| **Clientes externos** | `/personas/clientes-externos` | Registrar a las personas de afuera que participan en las evaluaciones | RF‑GP‑070 a 076 | W‑GP‑04 |
| **Organigrama** | `/organizacion/organigrama` | Vive en Organización; la antigua ruta de personas redirige ahí | — | — |

### W-GP-01 · Directorio

La puerta del módulo. Cuatro cifras, un buscador con dos filtros y la tabla de personas.

> **Wireframe · Colaboradores** — `/personas/colaboradores`. El dibujo en cajas está en la versión HTML de este documento; abajo, lo que señala cada número.

1. 1**Cuatro cifras.** «Activos» cuenta empleados, no presentes.
2. 2**Buscar y filtrar** por estado —que incluye las ausencias— y por área.
3. 3**«Nuevo colaborador»** abre el alta con el borrador que hubiera.
4. 4**Registro** es el avance de la ficha al darla de alta.
5. 5**El menú de la fila**: ruta de onboarding, buddy y cambio de estado.

### W-GP-02 · Una parte del alta

El riel de pestañas a la izquierda, con las partes de la abierta colgando debajo; la parte abierta como índice de secciones, y el pie con las tres salidas.

> **Wireframe · Nuevo colaborador** — `/personas/colaboradores/nuevo?paso=remuneracion`. El dibujo en cajas está en la versión HTML de este documento; abajo, lo que señala cada número.

1. 1**El riel**: las cinco pestañas con su aro de avance y el punto de las que deben algo del mínimo legal. Todas se pueden pulsar.
2. 2**Las partes** de la pestaña abierta, numeradas y atadas por una guía fina; la activa en verde claro. En el celular van arriba del contenido, como píldoras.
3. 3**Secciones plegables** con su descripción en usted y su cuenta de datos llenos. La primera abre sola. El asterisco marca lo obligatorio para dar de alta.
4. 4**El pie**, siempre abajo: volver, salir con el borrador guardado o seguir a la parte siguiente. En la última, «Revisar la ficha».

### W-GP-03 · Vista previa

La ficha leída como expediente: la tapa, los separadores y las secciones con el formulario cerrado.

> **Wireframe · Vista previa** — `/personas/colaboradores/nuevo?paso=previa`. El dibujo en cajas está en la versión HTML de este documento; abajo, lo que señala cada número.

1. 1**La tapa**: foto, nombre, cargo, documento, ingreso, contrato, correo y avance. Lo vacío dice «Por completar».
2. 2**El sello** dice qué falta para dar de alta, y lleva a ese dato; o «Ya se puede dar de alta».
3. 3**Tres separadores** que agrupan las partes por familia: Información Personal, Información Laboral y En la empresa —Documentación, Recursos y Configuración—.
4. 4**«Editar»** en cada sección lleva a su parte.
5. 5**«Dar de alta»**: con faltantes, abre el aviso que los lista todos.

### W-GP-04 · Clientes externos

La lista está siempre, aunque vacía, con el botón de registrar arriba. El formulario pide siete datos.

> **Wireframe · Clientes externos** — `/personas/clientes-externos`. El dibujo en cajas está en la versión HTML de este documento; abajo, lo que señala cada número.

1. 1**Buscar** por nombre, empresa o correo.
2. 2**«Nuevo cliente externo»**, siempre en el mismo lugar, haya o no clientes.
3. 3**Estado** activo o inactivo. Las acciones de la fila son editar y activar o desactivar; no hay eliminar.
4. 4**El formulario**: siete campos con ejemplo, contador y máximo. Obligatorios: nombre, apellido paterno y correo.

## 09 · Historias de usuario

*Trece historias con sus criterios de aceptación, y el plan de prototipado. Es contra esto que se acepta o se devuelve lo construido.*

> **Un criterio de aceptación se marca hecho o no hecho delante de la pantalla, sin discutir.** Por eso están escritos como afirmaciones comprobables y no como intenciones.

### 9.1 Las trece historias y sus criterios de aceptación

#### HU-GP-01 · Empezar un alta y terminarla otro día

**Como** responsable de Recursos Humanos, **quiero** cargar los datos de una persona a medida que llegan sus papeles **para** no tener que esperar a tenerlos todos ni volver a escribir lo que ya cargué.

**Criterios de aceptación**

- Lo escrito se conserva al cerrar el navegador y volver.
- No existe un botón de «guardar»; irse a otra pantalla con algo escrito pregunta «¿Está seguro de salir?».
- El borrador no aparece en el directorio ni ocupa un puesto.
- Un enlace con `?paso=contrato` abre 2.2 Relación Laboral.

*Se apoya en **BR‑GP‑001 a 004, 034 · RF‑GP‑010, 014, 017 · RNF‑GP‑01** · Pantalla: Nuevo colaborador*

#### HU-GP-02 · Saber qué falta para poder declarar a la persona

**Como** responsable de Recursos Humanos, **quiero** ver qué pestañas deben datos que exige una entidad **para** completar primero lo que me pueden observar.

**Criterios de aceptación**

- Cada pestaña del riel muestra su avance y, si debe algo del mínimo legal, un punto rojo; sus partes también llevan el punto.
- El punto no cambia al cambiar el nivel que se mira.
- Los datos obligatorios para dar de alta llevan asterisco.

*Se apoya en **BR‑GP‑005 a 008 · RF‑GP‑012, 020** · Pantalla: Nuevo colaborador*

#### HU-GP-03 · Llenar solo lo que aplica

**Como** responsable de Recursos Humanos, **quiero** que la ficha no me pida lo que no corresponde a esta persona **para** no llenar casillas vacías con «no aplica».

**Criterios de aceptación**

- Los datos condicionales aparecen solo con la respuesta que los activa.
- Esconder un dato no borra su valor.
- Los datos calculados están bloqueados y dicen que se calculan.
- Un archivo que se ve en dos partes cuenta una vez en el avance.

*Se apoya en **BR‑GP‑009 a 011 · RF‑GP‑022, 026** · Pantalla: Nuevo colaborador*

#### HU-GP-04 · Recontratar sin volver a cargarlo todo

**Como** responsable de Recursos Humanos, **quiero** traer los datos de alguien que ya trabajó en la empresa **para** no duplicar su registro ni volver a pedirle sus papeles.

**Criterios de aceptación**

- La búsqueda encuentra por carnet o por nombre, desde tres letras.
- Una persona vigente se muestra con aviso y sin botón para traer.
- Se traen los datos de la persona y ninguno del vínculo anterior.
- Los documentos se traen solo si se contesta que sí, y se deshacen si se cambia.

*Se apoya en **BR‑GP‑012 a 015 · RF‑GP‑030 a 032** · Pantalla: Nuevo colaborador, 1.1 Información Personal*

#### HU-GP-05 · Ubicar a la persona en su puesto

**Como** responsable de Recursos Humanos, **quiero** elegir en qué cargo entra la persona **para** que el organigrama la muestre sin tener que ir a sentarla a mano.

**Criterios de aceptación**

- La lista ofrece cargos, y al elegir uno se asigna la primera silla libre.
- Un cargo lleno aparece apagado con su motivo.
- Área, sucursal y jefe llegan del puesto y no se escriben.
- Al dar de alta, la silla deja de estar vacante.

*Se apoya en **BR‑GP‑016 a 019 · RF‑GP‑025, 046** · Pantalla: Nuevo colaborador, 2.1 Información Laboral*

#### HU-GP-06 · Dejar la ficha lista para las entidades

**Como** responsable de Recursos Humanos, **quiero** que la ficha pida los datos como los piden el Ministerio, la Gestora y la Caja **para** declarar a la persona sin rehacer nada.

**Criterios de aceptación**

- «¿Aporta a la Gestora?» y «¿Está afiliado a la Caja?» siempre están a la vista.
- Los porcentajes de los herederos muestran su total.
- Extensión y complemento se piden solo para un carnet boliviano.

*Se apoya en **BR‑GP‑020 a 022** · Pantalla: Nuevo colaborador, 1.1, 1.2 y 2.3*

#### HU-GP-07 · Revisar la ficha antes de dar de alta

**Como** responsable de Recursos Humanos, **quiero** ver toda la ficha junta como un expediente **para** detectar errores antes de que la persona exista en el sistema.

**Criterios de aceptación**

- La tapa muestra los datos que identifican a la persona, y lo vacío dice «Por completar».
- Los tres separadores bajan a su sección.
- «Editar» en una sección abre su parte.

*Se apoya en **BR‑GP‑023 · RF‑GP‑040 a 042** · Pantalla: Vista previa*

#### HU-GP-08 · Dar de alta sabiendo qué falta

**Como** responsable de Recursos Humanos, **quiero** que el sistema me diga todo lo que impide el alta de una vez **para** no corregir un dato y descubrir el siguiente.

**Criterios de aceptación**

- Solo el primer nombre, el apellido paterno y la fecha de ingreso impiden el alta.
- El aviso lista todos los faltantes, cada uno con «Completar →».
- «Completar →» abre la sección, enfoca el campo y lo resalta.

*Se apoya en **BR‑GP‑007, 024 · RF‑GP‑043 a 045** · Pantalla: Vista previa*

#### HU-GP-09 · Encontrar a una persona en el directorio

**Como** responsable de Recursos Humanos, **quiero** buscar y filtrar el directorio **para** llegar a una persona sin recorrer toda la lista.

**Criterios de aceptación**

- El buscador encuentra por nombre, cargo o correo.
- El filtro de estado incluye vacaciones y licencia médica.
- Una ausencia en curso manda sobre el estado en la insignia, y termina sola.

*Se apoya en **BR‑GP‑025 · RF‑GP‑001 a 004** · Pantalla: Directorio*

#### HU-GP-10 · Cambiar el estado de una persona

**Como** responsable de Recursos Humanos, **quiero** suspender o desvincular a alguien con su motivo **para** que planillas sepa si se paga o no, y desde cuándo.

**Criterios de aceptación**

- Suspender pide motivo; desvincular pide motivo y fecha.
- Un desvinculado deja de ofrecerse como jefe o aprobador.

*Se apoya en **BR‑GP‑026 · RF‑GP‑007** · Pantalla: Directorio*

#### HU-GP-11 · Corregir la ficha de alguien dado de alta

**Como** responsable de Recursos Humanos, **quiero** corregir los datos de una persona que ya trabaja **para** que su planilla y sus declaraciones salgan bien, sabiendo qué cambié.

**Criterios de aceptación**

- La ficha abre en lectura, con las mismas pestañas del alta.
- «Guardar cambios» muestra antes lo que cambió, con valor anterior y nuevo.
- Cada cambio queda en el historial de cambios de la ficha.
- Cambiar el cargo mueve a la persona en el organigrama.

*Se apoya en **BR‑GP‑027, 028 · RF‑GP‑050 a 055** · Pantalla: Ficha del colaborador*

#### HU-GP-12 · Dar de baja sin perder la historia

**Como** responsable de Recursos Humanos, **quiero** desvincular a quien se fue y eliminar solo lo que se cargó por error **para** no perder la historia de nadie.

**Criterios de aceptación**

- Desvincular pide motivo y fecha, y la persona sigue en la lista.
- Eliminar solo aparece para quien no tiene historia, y pide escribir su nombre.
- Las dos acciones liberan la silla que la persona ocupaba.

*Se apoya en **BR‑GP‑026, 029 · RF‑GP‑060 a 063** · Pantalla: Lista de colaboradores*

#### HU-GP-13 · Registrar a un evaluador de afuera

**Como** responsable de Recursos Humanos, **quiero** registrar a los clientes que evalúan a mis colaboradores **para** poder incluirlos en las evaluaciones.

**Criterios de aceptación**

- La lista se ve aunque esté vacía, con «Nuevo cliente externo» arriba.
- El formulario pide los siete campos, con ejemplo, contador y máximo.
- Sin nombre, apellido paterno o un correo válido, no se guarda y el aviso dice por qué.
- Un cliente se desactiva, no se borra.

*Se apoya en **BR‑GP‑030 a 032 · RF‑GP‑070 a 076** · Pantalla: Clientes externos*

### 9.2 Plan de prototipado

| Etapa | Qué se prototipa | La pregunta que contesta | Estado |
| --- | --- | --- | --- |
| **P‑1** | El directorio | ¿Se encuentra a una persona y se entiende su estado de un vistazo? | Construido |
| **P‑2** | El alta en cinco pestañas, con el riel, sus partes y los acordeones | ¿Se llena una ficha de trescientos datos sin sentirla una pared? | Construido |
| **P‑3** | El reingreso | ¿Se recontrata a alguien sin duplicarlo ni arrastrar su contrato anterior? | Construido |
| **P‑4** | La vista previa como expediente y el alta | ¿Se revisa todo antes de dar de alta, y se sabe qué falta? | Construido |
| **P‑5** | Los clientes externos | ¿Se registra a un evaluador de afuera en menos de un minuto? | Construido |
| **P‑6** | La ficha de alguien ya dado de alta: ver, editar, desvincular y eliminar | ¿Se corrige la ficha después del alta sabiendo qué se toca? | Pendiente |

## Cómo se mantiene este documento

*Las reglas que lo mantienen siendo la única fuente de verdad del módulo.*

- **Cada decisión que se toma en una reunión entra aquí**, con fecha, en el historial de versiones.
- **Cuando se responda una decisión abierta**, se borra de 6.7 y la respuesta se incorpora al cuerpo.
- **Si el prototipo y este documento no coinciden**, se corrige el que esté mal antes de entregarle nada a desarrollo.
- **Los códigos no se reutilizan.** Una regla o un requisito eliminado deja su número libre y vacío.
- **Cada regla se escribe en los cuatro apartados**, y la trazabilidad se declara aunque esté pendiente.
- **Las cifras de la ficha —pestañas, datos, mínimo legal— se cuentan del archivo generado**, no de los comentarios del código.

### Historial de versiones

| Versión | Fecha | Qué cambió |
| --- | --- | --- |
| **1.103** | 30 sep 2026 | **El filtro Tipo de Archivos agrupa por pestaña**, a pedido del equipo: Información Personal —identidad, nacimiento, croquis, licencias y los papeles del garante—, Recursos y Activos —las entregas firmadas— y Documentos agregados. Y se corrige que los menús desplegables de la ficha se abrieran fuera de la pantalla después del fundido al cambiar de parte |
| **1.102** | 30 sep 2026 | **En Archivos cada documento se nombra solo**, a pedido del equipo: llega sin la sección que lo explicaba. «Documento escaneado» pasa a **Documento de identidad (anverso y reverso)**, el secundario a **Documento de identidad secundario**, «Croquis» a **Croquis del domicilio**, «Licencia o certificado» a **Licencia o certificación** —que suma el tipo al elegirlo— y «Documento de garantía» a **Documento de respaldo de la garantía**. En su sección de origen se quedan los nombres cortos |
| **1.101** | 30 sep 2026 | **La ficha se mueve**, a pedido del equipo, con medida: las partes del riel y las secciones se abren y se cierran creciendo y encogiéndose, el contenido de una parte entra con un fundido al cambiar, y la pastilla de una sección brilla una vez al completarse. Todo dura menos de 0,3 segundos y se apaga con «reducir movimiento». Cerrar una sección no borra lo escrito |
| **1.100** | 30 sep 2026 | **La pestaña con partes se abre y se cierra**, a pedido del equipo, como los grupos del menú de Organización: lleva una flechita, y tocarla estando abierta pliega o despliega sus partes sin salir de la parte en la que se está. Tocar otra pestaña la abre, como siempre. HU‑GP‑01 y la sección 3.2 dejan de decir que no hay aviso de cambios sin guardar |
| **1.99** | 30 sep 2026 | **El documento suma diagramas**, como el de Organización. Antes del índice, «La ficha, de un vistazo»: la pantalla de alta dibujada, con el riel, las partes, la cabecera, las secciones y el pie señalados. Y cuatro diagramas en el cuerpo: los niveles de la ficha como anillos (0), la ficha parte por parte con quién lee cada una (0.1), el paso de borrador a colaborador con el aviso al salir (0.2) y qué se trae en un reingreso (3.4). Sale ABIERTA‑05, sobre las vacaciones, que es de Asistencia |
| **1.98** | 30 sep 2026 | **El documento describe sólo lo que se ve en la versión publicada**, a pedido del equipo, para que desarrollo no construya lo que todavía se está definiendo: salen Perfil Profesional y la parte Asistencia. La ficha queda en **cinco pestañas** —Documentación pasa a ser la 3, Recursos y Activos la 4 y Configuración la 5—, Información Laboral en tres partes y la vista previa en tres separadores; la ficha cuenta 240 datos. Y una regla nueva, **BR‑GP‑034**: irse a otra pantalla con un registro empezado pregunta «¿Está seguro de salir?», con «Guardar borrador y salir», «Salir sin guardar» —que borra el borrador— y «Seguir registrando»; va con **RF‑GP‑017** |
| **1.97** | 30 sep 2026 | **El documento se pone al día con la ficha de seis pestañas**. El glosario define pestaña y parte, y la descripción de la sección reemplaza a la insignia legal y a las ayudas con «?». Las tablas de entidades e integraciones, los requisitos, las reglas, los flujos, las pantallas y las historias nombran partes —1.1, 2.3— en vez de pasos. La tabla de la ficha se rearma por pestaña, y una nueva, «Tres secciones que se llenan distinto», explica Preferencias, Recursos y Activos y los filtros de Archivos. Se agregan RF‑GP‑028 (la caja de «Otro») y RF‑GP‑029 (las tablitas), los wireframes W‑GP‑02 y W‑GP‑03 se redibujan con el riel nuevo y el anexo suma tres porqués. Las cifras pasan a 6 pestañas, 326 datos y 51 requisitos funcionales |
| **1.96** | 30 sep 2026 | **Regalos y experiencias son tablitas**, a pedido del equipo: cada una es un recuadro con una fila por deseo, numerada, con una celda para escribir y una cruz para quitarla. «Agregar regalo» y «Agregar experiencia» suman filas, y Enter al final de una fila abre la siguiente. Sin categorías ni tipo. Se guarda una fila por renglón, así que lo escrito antes en la caja se conserva |
| **1.95** | 30 sep 2026 | **Preferencias pide regalos y experiencias, en texto libre**, a pedido del equipo: «Regalos que le gustaría recibir» y «Experiencias que le gustaría vivir» (viajes, cursos, conciertos…), una al lado de la otra. Sin categorías ni tablas: se escribe directamente. Sale «Intereses» |
| **1.94** | 30 sep 2026 | **Se retira «Habilidades» de Preferencias**, a pedido del equipo. La sección queda con la lista de deseos y los intereses, y su descripción dice «Registre los deseos e intereses del colaborador.» |
| **1.93** | 30 sep 2026 | **Preferencias pasa al final de Información Personal**, a pedido del equipo: la lista de deseos, los intereses y las habilidades son de la persona, no de lo que la empresa le entrega. Sale de Recursos y Activos con sus tres campos, sin cambios |
| **1.92** | 30 sep 2026 | **La parte 1.1 se llama «Información Personal»**, como su pestaña, a pedido del equipo; antes era «Datos del Colaborador». Es el mismo criterio que la 2.1, que se llama «Información Laboral». La cabecera dice «1.1 · Información Personal» |
| **1.91** | 30 sep 2026 | **La parte seleccionada del riel se pinta de verde claro**, la opción A de seis que vio el equipo: el mismo verde de la pestaña abierta, sin borde, con el texto en negrita y el número en verde oscuro. Reemplaza al recuadro blanco con borde verde, que se veía como un campo de formulario |
| **1.90** | 30 sep 2026 | **Las partes del riel se leen como un índice**, con el diseño que mandó el equipo. Se quita la línea que unía las pestañas. Las partes de la pestaña abierta cuelgan debajo con su numeración —1.1, 1.2, 2.3— y una guía vertical fina; la parte activa va en un recuadro blanco con borde verde. La cabecera muestra el mismo número: «1.1 · Datos del Colaborador». El porcentaje de cada parte queda al pasar el ratón |
| **1.89** | 30 sep 2026 | **El riel de la ficha es una línea de avance**, la versión 1 de cinco que eligió el equipo. Una línea vertical une los aros de las pestañas y se pinta de verde bajo la pestaña completa. Las partes de la pestaña abierta cuelgan de la línea, cada una con un punto que se llena al terminarla y su porcentaje. Con varias partes, la cabecera muestra la parte como título y la pestaña debajo. La barra de píldoras queda sólo para el celular |
| **1.88** | 30 sep 2026 | **La ficha se organiza en seis pestañas**, a pedido del equipo, sin quitar ninguna sección ni ningún campo: Información Personal (Datos del Colaborador e Información Familiar), Información Laboral (Información Laboral, Relación Laboral, Compensación, Nómina y Afiliaciones, y Asistencia), Perfil Profesional, Documentación y Expediente Digital, Recursos y Activos, y Configuración de Colaborador. El riel muestra las pestañas con su avance; las partes van arriba del contenido como píldoras, con la activa en azul oscuro. Remuneración y Afiliaciones forman una sola parte. «Siguiente» recorre las partes y después pasa a la pestaña siguiente, y los enlaces viejos por paso siguen funcionando. En Vercel, sin los pasos que sólo se ven en local, Perfil Profesional no aparece y las pestañas se numeran del 1 al 5 |
| **1.87** | 30 sep 2026 | **«Sede» pasa a llamarse «sucursal» en todo el proyecto**, a pedido del equipo: es el término correcto. Cambian los textos de la ficha, de Organización, del organigrama y de estos documentos. Los nombres internos del código no cambian, porque no se ven en pantalla |
| **1.86** | 30 sep 2026 | **Archivos se filtra también por estado y por fechas, con píldoras**, a pedido del equipo, que eligió entre cuatro propuestas. El buscador y tres píldoras —Tipo, Estado y Fechas— van en una sola fila; una píldora con filtro se pinta de verde, dice el valor y trae una × para quitarlo. El estado de cada documento es Pendiente (sin archivo), Vencido, Por vencer (30 días antes), Vigente o Sin vencimiento. Fechas abre un panel para elegir emisión o vencimiento, con atajos —próximos 30 y 90 días, ya vencidos, último mes, este año— o un rango. Los documentos agregados a mano no tienen fechas y no entran en ese filtro |
| **1.85** | 30 sep 2026 | **«Documentación y Expediente Digital» pasa antes de «Configuración del Colaborador / Autogestión»**, a pedido del equipo: los papeles completan el expediente de la persona, y el usuario y el rol se dan al final, con la ficha lista. En local quedan 10 y 11; en la versión publicada, 8 y 9 |
| **1.84** | 30 sep 2026 | **Se retira «¿Aplica retroactivo? (retroactivo de antigüedad)»** de los beneficios de ley, a pedido del equipo. Por ley el retroactivo siempre se aplica, así que deja de ser una pregunta de la ficha y pasa a ser una regla de la planilla. Con esto se cierra ABIERTA‑15 |
| **1.83** | 30 sep 2026 | **«Otro» abre una caja para escribir cuál** en las listas de Recursos y activos: tipo y categoría de equipo, tipo de uniforme, tipo de EPP, tipo de vehículo y tipo de licencia. Cada cosa entregada tiene su propia caja |
| **1.82** | 29 sep 2026 | **La ficha deja de mostrar los chips y los signos de ayuda**, a pedido del equipo: salen «legal», «se calcula» y «v1.2», y el signo de interrogación con los apuntes del estudio. La ficha enseña sólo títulos, campos e instrucciones. Los apuntes y las marcas siguen en el estudio de campos y en este documento; la ficha de la organización no cambia |
| **1.81** | 29 sep 2026 | **Las descripciones de las secciones se reescriben como instrucciones**, a pedido del equipo: una frase en «usted» que dice qué registrar —«Registre…», «Indique…», «Asigne…», «Defina…», «Active…»—. Las 47 secciones de la ficha siguen el mismo formato; las explicaciones de por qué existe cada dato quedan en este documento y en las ayudas de cada campo |
| **1.80** | 29 sep 2026 | **Agregar un documento es un recuadro más**, la propuesta C de cuatro. Al final de Archivos hay un recuadro «Agregar documento», del tamaño de los adjuntos: cada toque crea un documento al instante —la caja de su nombre arriba y su archivo abajo— y el recuadro queda al final, así se pueden abrir varios seguidos y llenarlos en cualquier orden. El nombre se escribe en una caja y, al terminar, queda como título, con un lápiz para corregirlo; la papelera junto al nombre quita el documento entero; la papelera del archivo, sólo el archivo. Sale la fecha de emisión: sólo importa el nombre |
| **1.79** | 29 sep 2026 | **Archivos se filtra por tipo de documento y admite documentos propios**, a pedido del equipo. Arriba de los adjuntos, un buscador por nombre y una lista desplegable de tipos —Identidad, Certificados y licencias, Formación, Garantías, Entregas de activos, Otros— con cuántos hay subidos de cuántos; filtrar sólo cambia lo que se ve, no las cuentas de la ficha. «Agregar documento» suma los papeles que ningún campo pide, cada uno con su nombre y su archivo; se filtran en «Otros» y se encuentran con el buscador. Además se reúnen los que faltaban: el adjunto de cada licencia (uno por licencia, con su nombre) y los respaldos de formación y certificaciones del perfil profesional, que no salen donde ese paso no se enseña |
| **1.78** | 29 sep 2026 | **El paso 10 queda en una sola tarjeta, «Acceso al sistema», con el nombre de usuario y el rol**, a pedido del equipo. Se retiran el modo de autenticación, la contraseña, el envío de credenciales por correo, el ingreso habilitado, el acceso a otras empresas del grupo y los alcances habilitados: la contraseña la elige quien la usa en su primer ingreso, y lo demás es configuración del sistema, no un dato de la persona |
| **1.77** | 29 sep 2026 | **«Rol del usuario» ofrece los seis roles del equipo**: Administrador General · Sub Administrador - RRHH - IT · Gerente · Supervisor · Asistente · Colaborador. Antes eran cuatro (Administrador general, Administrador de RR.HH., Supervisor, Colaborador) |
| **1.76** | 29 sep 2026 | **Se retira la tarjeta «Autogestión y notificaciones»** del paso 10, a pedido del equipo, con sus tres campos: permisos de autogestión, canal de notificación preferido y restricción de acceso a datos sensibles de salud. El paso queda con Credenciales y Rol y alcances |
| **1.75** | 29 sep 2026 | **Se retira la tarjeta «Historial y auditoría»** del paso 10, a pedido del equipo, con sus tres datos calculados: registrado por, fecha de registro y tipo de alta. El registro de cambios al editar (RF‑GP‑053) se mantiene: deja de mostrarse como una tarjeta de la ficha |
| **1.74** | 29 sep 2026 | **Recursos y activos se rearma en siete secciones**, con la lista de campos que mandó el equipo: Equipos (13), Uniformes (10), Equipo de Protección Personal (10), Herramientas (10), Vehículos (10), Software y Licencias (10) y Preferencias (3). Las seis primeras se repiten y arrancan en cero, con su botón «Agregar…»; el responsable de entrega se elige del directorio, con foto y cargo. Salen «Activos entregados» y «Otros recursos asignados» (puesto de trabajo, estacionamiento, valor referencial). En Archivos, el acta de cada activo pasa a ser la entrega firmada de cada equipo, uniforme y EPP |
| **1.73** | 29 sep 2026 | **El paso 9 pasa a llamarse «Recursos y activos»**, sin «Información de» delante, a pedido del equipo. Además, «Perfil profesional» y «Asistencia» quedan visibles sólo en local (`npm run dev`): en la versión publicada no aparecen y los demás pasos se renumeran |
| **1.72** | 29 sep 2026 | **«Dar de alta» pide confirmación**, a pedido del equipo. Si no falta ningún dato obligatorio, un diálogo pregunta «¿Está seguro de dar de alta?» y enseña a quién: foto, nombre, cargo y unidad, documento y fecha de ingreso. «Seguir revisando» o Escape vuelven a la vista previa; «Sí, dar de alta» crea a la persona. Si falta algo, sigue saliendo el aviso de lo que falta |
| **1.71** | 29 sep 2026 | **El paso 10 pasa a llamarse «Configuración del Colaborador / Autogestión»**, a pedido del equipo. En el riel sigue abreviado «Configuración» |
| **1.70** | 29 sep 2026 | **El paso 5 «Contrato» pasa a llamarse «Relación laboral»**, a pedido del equipo; en el riel se abrevia «Relación». Los campos no cambian |
| **1.69** | 29 sep 2026 | **Se retira la tarjeta «Datos de beneficios adicionales»** del paso Remuneración, con «Paquete de beneficios asignado» y los beneficios individuales, a pedido del equipo |
| **1.68** | 29 sep 2026 | **«Tipo de cuenta» suma «Otro»**, a pedido del equipo, y al elegirlo aparece **«¿Qué tipo de cuenta?»** (3.90o) para escribirlo. **Se retira «Sucursal de la cuenta bancaria»** |
| **1.67** | 29 sep 2026 | **«Banco» lista todos los bancos** que supervisa la ASFI —catorce, más «Otro» para cooperativas y entidades de vivienda— y sale Fassil, intervenido en 2023. Y **«¿Aplica retroactivo? (y retroactivo de antigüedad)» pierde la «y»**: queda «¿Aplica retroactivo? (retroactivo de antigüedad)» |
| **1.66** | 29 sep 2026 | **«Sucursal Caja» lista los nueve departamentos de Bolivia**, a pedido del equipo: La Paz, Santa Cruz, Cochabamba, Oruro, Potosí, Tarija, Chuquisaca, Beni y Pando. Antes ofrecía solo tres |
| **1.65** | 29 sep 2026 | **«Estado de la afiliación» pasa a llamarse «Administradora»**, a pedido del equipo. Las opciones no cambian: Gestora Pública · En proceso |
| **1.64** | 29 sep 2026 | **«¿Aporta a la Gestora?» y «¿Está jubilado?» arrancan en «No»**, a pedido del equipo. Con «Sí» en la primera se abren estado de la afiliación, NUA/CUA, sucursal y tipo de asegurado; con «Sí» en la segunda, la fecha de jubilación |
| **1.63** | 29 sep 2026 | **Se retiran «Clasificación laboral»** de los datos del contrato **y la tarjeta «Salida»** con su «Motivo de retiro», a pedido del equipo |
| **1.62** | 29 sep 2026 | **Una sola fecha de ingreso**, a pedido del equipo. Se retiran la fecha de ingreso para vacaciones, la de antigüedad y la de la Caja de Salud, que era la misma fecha de ingreso copiada. Queda **Fecha de ingreso legal**, la que ven las tres entidades |
| **1.61** | 29 sep 2026 | **Las fechas de ingreso dicen que son fechas**, a pedido del equipo: «Ingreso legal / fiscal» pasa a **Fecha de ingreso**, y las otras tres a **Fecha de ingreso para vacaciones**, **para antigüedad** y **a la Caja de Salud** |
| **1.60** | 29 sep 2026 | **La dependencia funcional, igual que en el organigrama**, a pedido del equipo. Eran «Supervisor funcional» y «¿En qué unidad lo supervisa?», un par distinto del que el organigrama guarda para cada puesto. Ahora es el mismo editor y la misma frase: **«Apoya funcionalmente a [unidad] respondiendo a [cargo de esa unidad]»**, con «Otra unidad» para sumar más. No ofrece la unidad del propio cargo ni repite unidades, y el cargo al que responde se elige entre los de la unidad apoyada; si ninguno, «cuelga de la unidad». En la ficha se dibuja como la tabla de aprobadores: columnas «Unidad que apoya» y «Responde a», una cruz por fila y «Agregar otra unidad» al pie |
| **1.59** | 29 sep 2026 | **El supervisor inmediato, más ancho y sin repetir su cargo**, a pedido del equipo. El selector ocupa media fila y se lee completo: foto, nombre, cargo y área. Se retira «Cargo del supervisor», que repetía al lado lo que el selector ya enseña. La tabla de aprobadores gana aire: filas más altas, columnas más separadas y el orden en un círculo numerado |
| **1.58** | 29 sep 2026 | **Los aprobadores de permisos, en una tabla compacta**, a pedido del equipo (propuesta D), en lugar de la fila de casillas. Tres columnas —**Orden**, **Aprueba** y **Aprobador suplente**—, una fila por firma, cada una con su cruz, y «Agregar otro aprobador» al pie, hasta tres. Cada aprobador tiene su propio suplente en la columna «Aprobador suplente», opcional; al quitar una fila se va con su suplente. En la vista previa: «Diego Morales (suplente: Alejandro Ríos) → Paola Arce» |
| **1.57** | 29 sep 2026 | **Los aprobadores de permisos, en una sola fila, y el suplente con el jefe**, a pedido del equipo. Cada aprobador ocupaba un bloque con título propio; ahora «Aprobadores de permisos» es una fila —«1.º en aprobar», «2.º», «3.º», cada uno con su cruz— y «Agregar aprobador» al final, hasta tres. Una persona no se ofrece dos veces. El **suplente** deja de ser un campo suelto: es el del 1.º aprobador, el jefe, y se agrega bajo su casilla con «+ Agregar suplente». «Cargo del supervisor» ya no muestra el de un supervisor sin puesto elegido de antes |
| **1.56** | 29 sep 2026 | **Una cadena de aprobación de permisos**, a pedido del equipo. Un permiso suele pasar por más de una firma —el jefe directo y después RR.HH.—, y había un solo campo. Ahora «Aprobación de permisos» es una lista en orden —Aprobador 1, Aprobador 2—, cada uno con su campo «Aprobador de permisos», con «Agregar otro aprobador» hasta tres y una papelera en cada uno. El aprobador que ya estaba elegido queda como el primero |
| **1.55** | 29 sep 2026 | **Elegir a una persona es verla**, a pedido del equipo (propuesta S1). El supervisor inmediato, el supervisor funcional, quién aprueba los permisos, el aprobador suplente y quién autorizó la contratación dejan de ser una lista de nombres: cada opción lleva la foto de la persona y, debajo del nombre, su cargo y su área, y el campo elegido también. El buscador encuentra por nombre o por cargo. Sólo se ofrecen las personas que ocupan un cargo: alguien sin puesto asignado no puede ser supervisor ni aprobador |
| **1.54** | 29 sep 2026 | **«Cargo del supervisor» se completa solo**, reportado por el equipo. Se declaraba calculado y no tenía de dónde calcularse: salía siempre en raya. Ahora toma el cargo que tiene en su ficha la persona elegida como supervisor inmediato |
| **1.53** | 29 sep 2026 | **«Jefaturas y aprobaciones» pasa a «Dependencia organizacional y funcional»**, a pedido del equipo, y se ordena en dos bloques. **Dependencia organizacional**: supervisor inmediato, cargo del supervisor, quién aprueba sus permisos y el aprobador suplente. **Dependencia funcional**: el o los supervisores funcionales y la unidad en que cada uno lo supervisa, con «Agregar otro supervisor funcional» |
| **1.52** | 29 sep 2026 | **Se retira «Imputación contable»**, a pedido del equipo, con sus tres campos: centro de costo, proyecto asignado y cliente asignado |
| **1.51** | 29 sep 2026 | **El nivel de mando y el tipo de cargo, desde el organigrama**, a pedido del equipo. «Información organizacional» suma **Nivel de mando** (mando superior, medio o bajo, con los nombres que tenga la empresa) y **Tipo de cargo** (Regular, Staff o Externo). No se preguntan: se completan solos con lo que el organigrama dice del cargo elegido, para que la ficha y el organigrama no puedan contradecirse. Si el cargo no los declaró, quedan en raya, y si no son los correctos se cambian en el cargo |
| **1.50** | 29 sep 2026 | **El cargo con buscador, y el tipo de trabajador a su lado**, a pedido del equipo. El desplegable de **Cargo** muestra siempre su buscador, aunque la empresa tenga pocos cargos; los demás desplegables lo muestran desde nueve opciones. **Tipo de trabajador** pasa a ocupar un tercio de la fila, al lado del cargo, y «Modalidad de trabajo» también |
| **1.49** | 29 sep 2026 | **«Categoría del puesto (Obrero / Administrativo)» pasa a llamarse «Tipo de trabajador»**, a pedido del equipo. Es como lo distingue la Ley General del Trabajo, y no se confunde con la «Clasificación laboral» del contrato ni con la categoría de la licencia. Las opciones siguen siendo Administrativo y Obrero, y el aviso del aguinaldo ahora dice «el tipo de trabajador es Obrero» |
| **1.48** | 29 sep 2026 | **El seguro médico privado pasa a «Datos médicos»**, a pedido del equipo: «¿Tiene seguro médico privado?», el proveedor y el número de asegurado dejan su tarjeta en «Información Familiar» y van al final de «Datos médicos», en «Información Personal», bajo el rótulo «Seguro médico privado» |
| **1.47** | 29 sep 2026 | **Corrección: marcar o desmarcar a una persona dejaba la pantalla en blanco**, reportado por el equipo. La casilla de cada fila no estaba anclada a su fila; al recibir el foco, el navegador desplazaba la vista hasta una zona vacía de la página. Ahora queda dentro de su fila y la vista no se mueve. Además, tocar a un hijo con discapacidad declarada, que no se puede desmarcar, muestra un aviso que explica por qué y dónde se cambia |
| **1.46** | 29 sep 2026 | **Varias personas que no están en la ficha**, a pedido del equipo. Solo se podía registrar una, y el botón se volvía esa fila: no había cómo agregar una segunda. Ahora «Agregar otra persona» queda siempre al final de la lista, cada clic suma una fila con nombre, relación, tipo y grado, y cada una se quita con la cruz de su derecha. Una ficha guardada con una sola otra persona la conserva como la primera de la lista |
| **1.45** | 29 sep 2026 | **Tipo y grado de discapacidad en la misma lista, y la otra persona también**, a pedido del equipo. La columna «Discapacidad» se parte en **Tipo** y **Grado**: al marcar a una persona de la ficha, su fila pide los dos con desplegables, y al desmarcarla se borran. Los hijos con discapacidad declarada los muestran bloqueados. «Agregar otra persona» ya no abre campos debajo: la misma fila se vuelve editable —nombre, relación, tipo y grado en sus columnas—. En la vista previa cada persona se lee con su discapacidad entre paréntesis |
| **1.44** | 29 sep 2026 | **«Marque a las personas con discapacidad»: lista en un recuadro, con columnas**, a pedido del equipo (propuesta L1), en lugar de las tarjetas. Una fila por persona de la ficha con sus datos en columnas —persona, relación y discapacidad— y un círculo a la derecha para marcarla; la última fila es «Agregar otra persona». El campo deja de llamarse «¿De quién es tutor?». **Los hijos con discapacidad declarada aparecen marcados y bloqueados**, con un candado: eso se contestó en «Datos de los hijos» y se cambia allá. En la vista previa se leen todos juntos, los marcados a mano y los hijos con discapacidad |
| **1.43** | 29 sep 2026 | **«¿De quién es tutor?» pasa a tarjetas que se marcan (propuesta B)**, a pedido del equipo, en lugar de la tabla. Una tarjeta por persona de la ficha —iniciales, nombre, relación y, si está declarada, su discapacidad—, tres por fila, que se marca tocándola; la marcada lleva borde verde y un visto. La última, punteada, es «Otra persona» y abre sus datos debajo. En pantallas angostas pasan a dos y a una por fila |
| **1.42** | 29 sep 2026 | **«¿De quién es tutor?» pasa a la lista con casillas (propuesta A)**, a pedido del equipo, en lugar de la agrupada: una sola tabla con las columnas Persona, Relación y Discapacidad, una casilla por fila, y debajo «Es otra persona, que no está en la ficha». La relación dice también de dónde viene la persona («Padre · contacto de emergencia»). Se quita la franja de resumen que había arriba |
| **1.41** | 29 sep 2026 | **«¿De quién es tutor?» pasa a una lista agrupada con casillas**, a pedido del equipo (propuesta A2). Era un desplegable de un solo nombre y una caja «¿Quién?». Ahora muestra la gente que ya está en la ficha agrupada por de dónde viene —hijos, cónyuge, contactos de emergencia—, con la discapacidad declarada a la vista, y se puede marcar a una o a varias personas. Si es alguien que no está en la ficha, «Registrar a alguien que no está en la ficha» abre su nombre completo, relación, y tipo y grado de discapacidad. Deja de ofrecer a los padres, porque esa tarjeta se retiró |
| **1.40** | 29 sep 2026 | **«Tutela y protecciones» pasa a «Datos de tutela y protecciones»**, a pedido del equipo, como el resto de las tarjetas |
| **1.39** | 29 sep 2026 | **«Datos médicos» pasa al final de «Información Personal»**, a pedido del equipo: tipo de sangre, alergias, medicación, condición crónica, recomendación médica y discapacidad son datos de la persona, no de su familia. Con la discapacidad, que es del mínimo legal, el paso 1 pasa a tener 18 datos del mínimo y el paso 2, 4; el total sigue en 32 |
| **1.38** | 29 sep 2026 | **El detalle de los datos médicos**, a pedido del equipo: las cuatro cajas que se abren con «Sí» decían «¿Cuál o cuáles?» y ahora dicen qué se describe: **Descripción de la alergia**, **de la medicación**, **de la condición** y **de la recomendación** |
| **1.37** | 29 sep 2026 | **Se retira el bloque «Propietario de la garantía»**, a pedido del equipo: el dueño de la garantía es el garante, que ya está registrado arriba. Salen «¿La garantía es del mismo garante?» y los campos del propietario (versiones 1.33 y 1.36) |
| **1.36** | 29 sep 2026 | **«Relación con el garante» pasa a lista**, a pedido del equipo, con la misma lista de parentesco que los contactos de emergencia y los beneficiarios: Madre, Padre, Cónyuge, Conviviente, Hijo(a), Hermano(a) y Abuelo(a) |
| **1.35** | 29 sep 2026 | **«Datos de garantes» pasa a llamarse «Datos de garantes y garantías»**, a pedido del equipo: la tarjeta registra a la persona que respalda y lo que deja en respaldo |
| **1.34** | 29 sep 2026 | **El cónyuge del garante casado**, a pedido del equipo. Si el estado civil del garante es «Casado(a)», aparecen **Nombre completo del cónyuge** y **Número de documento de identidad del cónyuge**: con el garante casado, la garantía es compartida. Queda abierto si la unión libre también la comparte |
| **1.33** | 29 sep 2026 | **El propietario de la garantía**, a pedido del equipo. Lo que se deja en garantía puede no ser del garante —la casa de su cónyuge o de sus padres—, y entonces el dueño firma también. Al final del bloque de la garantía, «¿La garantía es del mismo garante?», que arranca en Sí. Con No se abre el bloque **Propietario de la garantía**: nombre completo, relación con el garante, tipo y número de documento de identidad, y su documento escaneado |
| **1.32** | 29 sep 2026 | **El garante y la garantía, por separado**, a pedido del equipo. La tarjeta de garantes se parte en dos bloques. **Garante**: la persona, con sus datos y, nuevo, el **documento de identidad del garante escaneado** (anverso y reverso), que también aparece en «Archivos». **Garantía**: lo que deja en respaldo. «Tipo de garantía» pasa de texto libre a lista —inmueble, vehículo, salario fijo, certificado de depósito, aval de asociación y «Otro», que abre una caja— y se suman **descripción**, **número de registro** (folio real, placa, n.º de certificado) y **valor en bolivianos**, junto al documento de garantía |
| **1.31** | 29 sep 2026 | **«Tipo de documento de identidad» y «Número de documento de identidad»**, a pedido del equipo, en los bloques del cónyuge, de cada hijo, de cada beneficiario y del garante. Decían solo «Tipo de documento» y «Número de documento», y ahí no hay un título que diga de qué documento se habla. En la tarjeta del colaborador siguen igual, porque la tarjeta ya se llama «Documento de identidad» |
| **1.30** | 29 sep 2026 | **«¿Qué documento?» al elegir «Otro»**, a pedido del equipo. El tipo de documento del cónyuge, de cada hijo, de cada beneficiario y del garante tenía «Otro» sin ningún sitio donde decir cuál; ahora abre una caja al lado, como ya hacía el del colaborador. En los bloques repetidos, cada uno mira su propia elección |
| **1.29** | 29 sep 2026 | **El parentesco de beneficiarios y herederos se cierra a los familiares directos**, a pedido del equipo, igual que el del contacto de emergencia: quedan Madre, Padre, Cónyuge, Conviviente, Hijo(a), Hermano(a) y Abuelo(a); salen Tío(a), Primo(a), Amigo(a), Vecino(a) y «Otro», con su caja |
| **1.28** | 29 sep 2026 | **Se retira «Datos de los padres»**, a pedido del equipo: el nombre del padre y el de la madre del colaborador no se usaban. Dejan de ofrecerse en «¿De quién?» de la tutela. Y «¿Presenta discapacidad?» de cada hijo arranca en **No**, como la del colaborador, también en los hijos que se agregan |
| **1.27** | 29 sep 2026 | **El tipo y el grado de discapacidad de cada hijo**, a pedido del equipo. Si un hijo presenta discapacidad aparecen, en su bloque, **Tipo de discapacidad** y **Grado de discapacidad**, dos listas con el mismo catálogo que el del colaborador: los seis tipos y los cuatro grados del artículo 5 de la Ley 223. Cada hijo mira su propia respuesta |
| **1.26** | 29 sep 2026 | **Todos los celulares llevan su código de país**, a pedido del equipo: se suman el del cónyuge y el del garante al del colaborador y los de los contactos de emergencia. Arrancan en el país de residencia del colaborador, o en Bolivia |
| **1.25** | 29 sep 2026 | **Datos de los hijos**, a pedido del equipo. Se retira «¿Es beneficiario del seguro?», como en el cónyuge. El **sexo** de cada hijo pasa de texto libre a lista, con las mismas opciones que el del colaborador: F · Femenino y M · Masculino |
| **1.24** | 29 sep 2026 | **Se retira «¿Es beneficiario del seguro?» de los datos del cónyuge**, a pedido del equipo |
| **1.23** | 29 sep 2026 | **La nacionalidad del cónyuge y la de los hijos**, a pedido del equipo, con el mismo catálogo que la del colaborador: el gentilicio —«Boliviana», «Argentina», «Chilena»— en vez del país, todos los países y sin «Otro» |
| **1.22** | 29 sep 2026 | **El nombre del cónyuge**, a pedido del equipo: «Nombres y apellidos (estructurado)» pasa a decir **Nombre completo**, como en los contactos de emergencia |
| **1.21** | 29 sep 2026 | **Los contactos de emergencia se agregan con un botón**, a pedido del equipo. Desaparece la pregunta «¿Agregar un segundo contacto?» y su segundo bloque fijo: el contacto pasa a ser un grupo repetible, como los hijos o la experiencia laboral, con «Agregar otro contacto de emergencia» —hasta cinco— y una papelera en cada uno. El primero sigue siendo obligatorio. Las fichas que ya tenían un segundo contacto lo conservan: se muestra como «Contacto 2» |
| **1.20** | 29 sep 2026 | **Licencias y certificaciones pasa a ser repetible**, a pedido del equipo: una persona puede tener licencia de conducir y, además, los certificados de antecedentes y de No Violencia. «Agregar otra licencia o certificación» suma un bloque, hasta diez, y cada uno tiene su papelera. Cada bloque se titula con el tipo elegido y aplica sus reglas por su cuenta: la categoría, la suspensión, los rótulos del número y las fechas y el estado calculado miran su propio tipo, su país y su vencimiento, no los del primero |
| **1.19** | 29 sep 2026 | **El contacto de emergencia**, a pedido del equipo, en el primer contacto y en el segundo. «Teléfono principal» pasa a **Número de celular**, con el mismo selector de código de país que el celular del colaborador, que arranca en su país de residencia. «Dirección · Ciudad · País» pasa a **Dirección de domicilio**. El teléfono alternativo sigue igual, porque puede ser un fijo |
| **1.18** | 29 sep 2026 | **El parentesco del contacto de emergencia se cierra a los familiares directos**, a pedido del equipo, en el primer contacto y en el segundo. Quedan Madre, Padre, Cónyuge, Conviviente, Hijo(a), Hermano(a) y Abuelo(a); salen Tío(a), Primo(a), Amigo(a), Vecino(a) y «Otro», y con él la caja para escribir otro parentesco |
| **1.17** | 29 sep 2026 | **Solo una licencia se suspende**, a pedido del equipo. «¿Está suspendida?» aparece con una licencia —de conducir o de operador de maquinaria— o con «Otro», que puede serlo; no con un certificado ni con el carnet de sanidad, que no se suspenden: vencen. Al cambiar a uno de esos, la respuesta vuelve a No y el estado deja de decir «Suspendida» |
| **1.16** | 29 sep 2026 | **El número y las fechas de la tarjeta de licencias dicen de qué papel son**, a pedido del equipo. Decían «de la licencia» aunque se eligiera un certificado. Ahora siguen al tipo: **Número de licencia** y **Fecha de emisión de la licencia**, **Número de certificado** y **Fecha de vencimiento del certificado**, o **del carnet** para el de sanidad. Sin tipo, o con «Otro», dicen solo «Número», «Fecha de emisión» y «Fecha de vencimiento» |
| **1.15** | 29 sep 2026 | **La categoría de la licencia**, a pedido del equipo. Solo aparece si el tipo es **Licencia de conducir**, y al elegir otro tipo se borra. Pasa de texto libre a lista con las categorías de Bolivia: P particular, A, B y C profesional, M motocicleta y T maquinaria y equipo pesado. Como las categorías son de Bolivia, el **país emisor** pasa a preguntarse justo después del tipo, antes del número y la categoría; si es otro país, la categoría vuelve a ser una caja donde se copia tal como figura en la licencia |
| **1.14** | 29 sep 2026 | **Más tipos de licencia o certificación**, a pedido del equipo. Se suman el **certificado de No Violencia** y el **certificado de antecedentes penales**, y lo que es licencia lo dice delante: «Operador de maquinaria» pasa a **Licencia de operador de maquinaria**. La lista queda en dos grupos, primero las licencias y después los certificados, con «Otro» al final |
| **1.13** | 29 sep 2026 | **El celular lleva su código de país, y la profesión se muda a Perfil profesional**, a pedido del equipo. **Número de celular** tiene a la izquierda de la misma caja un selector de código de país —sigla, país y código, con buscador—; arranca en el país de residencia, o en Bolivia si no hay, y se guarda entero, «+591 71244890». **Profesión u ocupación** y **Matrícula profesional** dejan la tarjeta «Datos profesionales» del paso 1 y abren el paso 4, bajo el rótulo «Profesión», junto a la formación y la experiencia que las respaldan; conservan sus claves 1.32 y 1.33 |
| **1.12** | 29 sep 2026 | **Residencia en Argentina y número de celular**, a pedido del equipo. El escalón bajo la provincia argentina deja de llamarse «Departamento / Partido»: dice **Partido** si la provincia es Buenos Aires, **Comuna** si es la Ciudad de Buenos Aires y **Departamento** en el resto. «Celular personal» pasa a llamarse **Número de celular** |
| **1.11** | 29 sep 2026 | **Nacionalidad y segunda nacionalidad**, a pedido del equipo. **Nacionalidad** solo aparece si «¿Es de nacionalidad boliviana?» es No, y entonces no ofrece «Boliviana»; con Sí ya está contestada. **Segunda nacionalidad** pasa de texto libre a selector y no ofrece la nacionalidad principal. Las dos listas dicen el gentilicio —«Argentina», «Chilena»— en vez del país, con todos los países y sin «Otro». Cambiar la respuesta vacía lo que quedaría contradiciéndola |
| **1.10** | 29 sep 2026 | **El país emisor pasa a ser el primer dato del documento de identidad**, en el principal y en el secundario. La extensión y el complemento SEGIP solo existen en el carnet boliviano —un DNI chileno, un pasaporte o un carnet de extranjero no los tienen—, y la ficha ya los escondía; pero el país se elegía después y los campos aparecían antes de tiempo. Nuevo orden: país emisor, tipo, número, extensión y complemento (solo carnet boliviano), fechas y escaneo —BR‑GP‑022— |
| **1.9** | 29 sep 2026 | **El reingreso deja de preguntar por los permisos y la antigüedad anteriores**, a pedido del equipo. Solo queda la pregunta de los documentos. Las dos eran del mínimo legal, que pasa de 34 a 32 datos; la ficha pasa a 322 datos distintos |
| **1.8** | 28 sep 2026 | **Sale el bloque «Competencias»** del perfil profesional, a pedido del equipo. La ficha pasa a 324 datos distintos |
| **1.7** | 28 sep 2026 | **La referencia laboral de cada experiencia dice a quién llamar.** Si «¿Referencia laboral disponible?» es Sí, aparecen **nombre, cargo y teléfono de la referencia**. Se mira la respuesta de cada experiencia por separado: la segunda puede tener referencia aunque la primera no. La ficha pasa a 325 datos distintos |
| **1.6** | 28 sep 2026 | **El supervisor funcional pasa a ser repetible.** Una persona tiene un solo supervisor inmediato, pero puede tener varios funcionales —es lo normal en estructuras matriciales, y el estudio ya lo pedía: obs. #26, «anotar más de una persona»—. Cada uno se declara como un par, **supervisor funcional** y **¿en qué unidad lo supervisa?**, igual que la dependencia funcional de Organización. Se agregan con «Agregar otro supervisor funcional», hasta cinco, y cada copia tiene su papelera. *Se prefirió esto a mostrarlo de solo lectura desde el puesto; queda el riesgo de que la ficha y el organigrama no coincidan.* La ficha pasa a 322 datos distintos |
| **1.5** | 28 sep 2026 | **«Datos de beneficios de ley» pasa a llamarse «Configuración de Beneficios y Obligaciones»**, con la descripción «Active los beneficios sociales y obligaciones patronales que el sistema debe calcular para este empleado». Se documentan sus seis interruptores a partir del insumo de Planillas Bolivia —concepto, enlaces y qué pasa en cada No— y la pregunta de fondo: varios no son decisiones sino consecuencias de la modalidad y la categoría del puesto. **«¿Aguinaldo y prima desde el primer mes?»** deja de ser calculado y pasa a Sí/No, con aviso si se contesta No para un obrero; **el retroactivo arranca en Sí**. Cuatro decisiones abiertas nuevas —ABIERTA‑14 a 17— |
| **1.4** | 28 sep 2026 | **Salen cuatro campos de Remuneración**, a pedido del equipo: **¿Aplica 2º aguinaldo?** —depende de un decreto según el crecimiento del PIB y se aplica a todos por lote, no persona por persona—, **¿Aplica prima?** —va ligada a las utilidades de la empresa—, **¿Aplica vacaciones según el tipo de cargo?** —había entrado en la v1.2 del estudio; la escala de vacaciones sigue abierta en ABIERTA‑05— y **¿Enviar boleta por correo?** —el momento de publicación de la boleta queda como tema de Planillas—. «Configuración de Beneficios y Obligaciones» pasa a seis datos, uno de ellos calculado, y la ficha de 325 a 321 datos distintos. Los cuatro quedan en `CAMPOS_RETIRADOS` |
| **1.3** | 28 sep 2026 | **El anticipo de quincena, en tres campos.** Sale «Modo de quincena + valor», que era un selector y un número en una sola casilla, y entran **¿Recibe anticipo de quincena?**, **Tipo de anticipo** y **Valor**, con su regla —BR‑GP‑033—: se descuenta en la planilla del mes (una boleta, no dos) y nunca supera el haber básico. **Sale «Escala / nivel salarial»** a pedido del equipo; el estudio lo había subido a Operativo porque se usa para los límites de negociación salarial y los planes de carrera, y queda anotado en `CAMPOS_RETIRADOS` por si se lo quiere de vuelta. La ficha pasa de 324 a 325 datos distintos |
| **1.2** | 28 sep 2026 | **Sale el campo «Moneda» del haber básico** (3.66), a pedido del equipo: por el momento todo se entiende en bolivianos, y preguntarlo en cada alta era pedir un dato que siempre tiene la misma respuesta. El mínimo legal pasa de 35 a 34 datos y la ficha de 325 a 324. La moneda de la cuenta bancaria se queda. **Tipo de remuneración** (Mensual · Jornal · Por hora · Comisión · Honorarios) y **frecuencia de pago** (Mensual · Quincenal · Semanal) quedan en nivel Operativo, con su catálogo completo, y pasan a ser **informativos**: no gobiernan ningún cálculo. El campo retirado se deja fuera al portar el estudio —`CAMPOS_RETIRADOS` en `herramientas/portar-campos.cjs`—, y los dos ajustados van en `CAMPOS_AJUSTADOS`, así que volver a generar la ficha no deshace nada |
| **1.1** | 28 sep 2026 | **El capítulo 03 pasa a ir pantalla por pantalla.** **3.1 Lista de colaboradores**: cada cifra, filtro, columna, estado y acción del menú, con de dónde sale y por qué está. **3.2 Nuevo colaborador**: qué es la ficha del colaborador y las secciones de cada uno de sus once pasos. Entran tres puntos nuevos: **3.6 Editar** y **3.7 Eliminar y desvincular**, especificados y todavía sin construir, y **3.8 Clientes externos**, que ya está en el prototipo. Seis reglas nuevas —BR‑GP‑027 a 032—, diecisiete requisitos, tres flujos, un wireframe, tres historias y tres decisiones abiertas |
| **1.0** | 28 sep 2026 | **Primera versión.** Documenta el módulo tal como está en el prototipo: el directorio, el alta en once pasos, el reingreso y la vista previa como expediente. Veintiséis reglas en formato de cuatro apartados, treinta y un requisitos funcionales, cinco no funcionales, seis flujos, tres wireframes, diez historias de usuario y diez decisiones abiertas. Sigue los capítulos del documento de Organización |

## Anexo · Por qué decidimos así

*Los argumentos largos, separados del cuerpo para que el cuerpo prescriba y el anexo explique.*

#### Por qué una pantalla y no un modal

Son más de ochenta datos que llegan de papeles distintos —el carnet, el contrato, la Gestora, el banco— y casi nunca el mismo día. Un modal es para una decisión corta; esto es una ficha que se llena con la carpeta delante y se vuelve a mirar meses después. Además, una pantalla propia se puede enlazar y la flecha de atrás del navegador funciona.

#### Por qué un borrador y no un colaborador a medias

Si la persona existiera desde el primer dato, los tableros contarían a alguien que quizá nunca firme, el organigrama sentaría a alguien sin contrato y cada módulo tendría que preguntar «¿esta persona es de verdad?». Separar el borrador del colaborador hace que esa pregunta no exista.

#### Por qué solo tres datos bloquean

Bloquear todo el mínimo legal suena responsable y produce lo contrario: como el NUA llega semanas después, la gente inventaría uno para poder dar de alta. Bloquear solo lo que hace imposible el alta —a quién y desde cuándo— y avisar lo demás mantiene los datos honestos.

#### Por qué la ficha abre completa

Arrancaba en el nivel Operativo y enseñaba una ficha recortada sin avisar que lo era: no había forma de saber desde dentro que se estaba mirando un extracto. Abrir completa y dejar recortar es honesto; abrir recortada y dejar ampliar es esconder.

#### Por qué se elige el cargo y no la silla

Recursos Humanos piensa en «entra como cajero», no en «entra en CAJ‑003». Pedir la silla obliga a conocer códigos que no le importan; elegir el cargo y asignar la silla libre habla como habla la empresa, y el organigrama queda igual de exacto.

#### Por qué el reingreso no trae el vínculo

La persona es la misma; el contrato no. Traer el puesto, el sueldo o las fechas del vínculo anterior es la manera más rápida de firmar un contrato nuevo con condiciones viejas. Lo de por vida —el carnet, el NUA— se trae; lo del vínculo se vuelve a decidir.

#### Por qué «dar de alta» y no «crear»

A una persona no se la crea: se la da de alta, que es como lo dice Recursos Humanos —alta en la Gestora, en la Caja, en planilla—. El botón usa la palabra de quien lo va a pulsar.

#### Por qué la vista previa es un expediente

Lo que se revisa antes de dar de alta es el legajo de una persona. Mostrarlo como otro formulario hacía que se leyera como una pestaña más; mostrarlo como la carpeta que Recursos Humanos ya conoce hace que se revise como se revisa una carpeta.

#### Por qué las claves son las del estudio

Cada dato de la ficha tiene detrás una fila del estudio de la propuesta que justifica por qué existe, quién lo pide y quién lo consume. Usar esa misma clave en el sistema permite volver a esa justificación desde cualquier dato, y que el rótulo o el paso cambien sin que se pierda nada guardado.

#### Por qué pestañas y no once pasos

Once pasos en una columna eran once decisiones antes de empezar, y el equipo los ordenó como se piensan los datos de una persona: quién es, dónde trabaja y cómo se le paga, sus papeles, lo que se le entrega y cómo entra al sistema. Se agrupó sin quitar nada —cada parte conserva las secciones y los campos del paso que era— y sin cambiar las claves, así que los enlaces, los avisos y las cuentas siguieron funcionando.

#### Por qué las partes cuelgan del riel

Se probaron las partes como pestañas arriba del contenido, como subtítulos dentro de la vista y como un índice. Colgadas de su pestaña, numeradas como un índice —1.1, 1.2—, dicen a la vez dónde se está y qué queda en esa pestaña, sin un segundo menú que mirar. La parte activa se pinta del mismo verde que su pestaña: un recuadro con borde se leía como un campo de formulario. En el celular, donde no hay dónde colgarlas, vuelven a ser píldoras arriba.

#### Por qué Preferencias se escribe a mano

Se ofrecieron categorías, rangos de precio, prioridades y etiquetas para los regalos y las experiencias. El equipo prefirió que cada persona escriba lo que quiera, una fila por deseo: nadie tiene que decidir en qué categoría va un curso de fotografía, y lo que se lee es exactamente lo que la persona pidió.
