# Línea gráfica del mobile (SoulyHR · colaborador)

La referencia es **el Inicio** (`InicioPhone.jsx`): pesos, rótulos, botones y tarjetas se copian de ahí.
De **Mis solicitudes** (`MisDocumentosPhone.jsx`: `TarjetaPedido`, `Aro`…) se toman las tarjetas
y las etiquetas de estado. Toda pantalla nueva del teléfono, o una que se rediseñe, sigue estas
reglas. Si algo no está aquí, se copia del Inicio.

**La franja navy (la de «hoy» en el Inicio) es solo del Inicio.** En los módulos, lo principal va en una
tarjeta blanca destacada (radio 15 a 18, más relleno, píldora menta), como el reloj de Mi asistencia.

## Cómo se trabaja

- **Primero se propone, después se aplica.** Todo cambio visual se presenta antes en la página de
  propuestas de Claude (2 a 4 opciones con teléfonos dibujados y una recomendada). Se aplica solo la
  opción elegida, tal cual. Los textos que dicta el usuario y los arreglos de funcionamiento van directo.
- Se prueba en la demo con **Carlos Mendoza Ríos** («Colaborador Mobile — Tecnología»), con Playwright
  contra el servidor de desarrollo, y se revisa la captura antes de dar por terminado.

## Medidas

El teléfono mide **280 × 560** y se agranda con `zoom` (`Layout.jsx`). Por eso los tamaños del código son
chicos: **1 px del código ≈ 1,6 px en pantalla**. No usar tamaños de escritorio.

## Colores

**Regla: nunca colores fijos en las pantallas del teléfono.** Se usan las variables del Inicio
(`--in-*` en `src/index.css`) y las de los tonos (`--tn-*` fondo suave, `--tx-*` texto), que tienen
valor en claro y en oscuro, así el botón de sol y luna cambia todas las pantallas igual que el Inicio.
Equivalencias: fondo `var(--in-fondo)`, tarjeta `var(--in-carta)`, texto `var(--in-texto)`, secundario
`var(--in-mute)`, apagado `var(--in-suave)`, separador `var(--in-linea)`, borde de campo `var(--in-campo)`,
sombra `var(--in-sombra)`, lo elegido `var(--in-pill)` con texto `var(--in-pill-txt)` (navy en claro,
menta en oscuro). Se quedan fijos: el menta `#00E091` de los botones (con texto navy `#0C2D40`) y los
colores vivos de sellos y barras. Lo que es papel (un documento para revisar) lleva la clase
`papel-claro` y se queda claro. La barra de volver se usa con `conTema`.
Los valores en claro, como referencia:

| Uso | Valor |
| --- | --- |
| Navy de la marca (texto principal, botones oscuros, filtros activos) | `#0C2D40` |
| Menta (botón principal, «+», acentos) | `#00E091` |
| Texto menta (sobre blanco) | `#0A7F55` |
| Fondo de las pantallas | `#F2F5FC` (`--in-fondo`) |
| Tarjetas | `#FFFFFF` |
| Texto secundario | `#6B7C8A` |
| Texto apagado, rótulos, chevrons | `#8A9AA8` / `#9AABBB` |
| Bordes de campos y botones claros | `#DDE4EC` |
| Separadores dentro de una tarjeta | `#F0F3F6` |

**Sin color por tipo** (opción S2, auditoría general del 30 oct). Antes cada tipo de solicitud tenía su
color (vacación verde, corrección ámbar, remoto cian, permiso violeta…) y chocaba con los colores de
estado. Ahora el tipo se reconoce por la **forma del ícono** (palmera, reloj, casa, lápiz, medalla…)
dentro del **círculo con aro menta** (`Aro`: 30 px, `inset 0 0 0 1.4px #00E091`, ícono navy 13). **El
único color de una tarjeta es su estado.**

**Estados** (etiqueta: texto / fondo): por aprobar o en RR.HH. `#9A5B06` / `#FFF4DE` · aprobada o lista
`#0A7F55` / `#E3FAF0` · no aprobada `#B42318` / `#FDECEA` · cancelada `#4B5B6B` / `#EEF2F6`.

## Tipografía

Poppins en todo. En unidades del código:

| Elemento | Tamaño | Peso | Otros |
| --- | --- | --- | --- |
| Título de pantalla («Mis solicitudes», «¿Qué necesita?») | 12.5 | 600 | letter-spacing −.01em, como el nombre en el Inicio |
| Título de tarjeta (lo importante: fechas, nombre) | 9.6 | 600 | una línea, con «…» |
| Rótulo sobre el título (tipo: «VACACIÓN») | 6.2 | 600 | MAYÚSCULAS, letter-spacing .05em, `--in-mute` |
| Línea secundaria («5 días · enviada hoy») | 7.2 | 400 | `--in-mute`, partes separadas con « · » |
| Rótulo de sección («ESTA SEMANA», «ACCIONES RÁPIDAS») | 8.3 | 600 | MAYÚSCULAS, letter-spacing .02em, navy (`--in-texto`); a la derecha «Ver … →» en 8.4/600 `--in-acento-txt` |
| Etiqueta de estado | 6 | 700 | píldora, padding 2×7 |
| Botón principal | 8.6 | 600 | píldora (radio 99) |
| Reloj y cifras grandes | 32 | 700 | nunca 800 |
| Barra de volver (`BarraVolver`) | 8.6 | 600 | botón **redondo** blanco de 26 con `--in-sombra`, sin borde |

## Piezas

- **Pantalla:** fondo `#F2F5FC`, también en la barra de estado y el marco (`FONDO_SOLICITUDES` en
  `Layout.jsx`). Arriba `BarraVolver` con el nombre de la pantalla a la que vuelve («Zona HR»,
  «¿Qué necesita?», «Mis solicitudes»). Debajo, el título grande y a la derecha el «+» si se puede crear.
- **Tarjeta:** blanca, `borderRadius` 15, padding 9×10, `--in-sombra`. Tarjetas sueltas con 7 de
  separación, nunca pegadas en una caja gris. Grilla: `Aro` 30 · texto · chevron 10. Sin dibujos de
  calendario ni hojitas de color: la fecha va una sola vez, en el título.
- **Estado en la tarjeta:** una etiqueta de color debajo del texto, no barrita. La barrita de tres
  tramos (Enviada · En RR.HH. · Aprobada) va solo en el detalle.
- **Listas de opciones** («¿Qué necesita?»): como Configuración, una tarjeta por grupo con el rótulo del
  Inicio arriba y filas separadas por una línea: `Aro`, nombre (9.2/500) y una línea que explica. Lo que
  todavía no existe va apagado (opacidad .5) con la etiqueta gris «Pronto» a la derecha, sin poder tocarse.
- **Elegir entre opciones:** cuadros anchos, uno por fila, con la hojita a la izquierda y una línea que
  dice qué incluye. Tocar uno avanza; no hace falta otro botón.
- **Revisar antes de enviar:** el pedido se arma como **documento** con el estilo de la papeleta
  (encabezado con la sigla de la empresa, secciones numeradas, datos en grilla, franja navy con lo
  importante, firmas). No hay firma digital: la línea de RR.HH. dice «Pendiente». Abajo, el campo
  opcional y el botón «Solicitar», fijo al pie.
- **Filtros:** dos desplegables lado a lado («Tipo: Todos ▾», «Estado: Todos ▾»), blancos **sin borde**, con
  `--in-sombra` (abierto, aro navy); con algo elegido se pintan de navy. El menú se abre debajo, cada opción con su cantidad.
- **Onboarding (auditoría heurística, opción A elegida para la ruta):** piezas en
  `src/pages/colaborador/OnboardingPhonePiezas.jsx`. Título en una línea con botones redondos (historial,
  organigrama y el agente en navy con ícono menta, que reemplaza al botón flotante); arriba de la ruta la
  tarjeta destacada «Su siguiente paso» (avance, puntos y píldora «Empezar»). La ruta es un **mapa en
  zigzag** con los círculos de aro menta de Zona HR: hecha = menta con check, la de ahora más grande con
  halo menta y «Ahora», las de etapas que no empezaron en gris con «Se abre día N»; nunca candado sobre la
  etapa actual. «Obligatoria» y los puntos van como texto gris debajo del nombre, no como chip ámbar.
  Tareas: «‹ Mi onboarding», etapa en menta, nombre una vez, línea «Tipo · obligatoria · N pts»; «Hecha»
  o la píldora «Completar» arriba a la derecha. Trato de **usted**. Por ahora Onboarding va siempre en
  claro (`papel-claro`): el contenido de cada tipo de tarea todavía tiene colores fijos.
- **Perfil (opción B2 elegida):** sin franja de color. La persona va en una tarjeta blanca destacada
  (radio 18) con los dos círculos menta translúcidos de la franja «hoy» del Inicio en la esquina, la foto
  con aro menta y sombra, cargo y antigüedad como texto gris (no en una píldora) y dos píldoras:
  «Organigrama» (blanca, abre el organigrama y vuelve a Perfil) y «Configuración» (menta). «Cerrar
  sesión» vive en Configuración, no arriba; «Ayuda» se quitó porque no abría nada. La ficha usa las filas
  de Zona HR y «N por renovar» es la etiqueta ámbar. Títulos en minúscula después de la primera letra.
  Secciones de la ficha: las cerradas en **plomo suave** (`--in-plomo`) sin sombra, como antes pero más
  livianas (opción P1 elegida; se descartó juntarlas en una tarjeta porque al abrir una se pierde dónde está);
  la abierta, tarjeta blanca con sombra y encabezado en menta suave (`--in-acento-bg`), flecha en menta oscuro (V1).
  **Datos de una sección abierta (E1 + F3, sin amarillo):** en su orden de siempre y en **dos columnas
  fijas** (etiqueta 42 % a la izquierda; el valor siempre empieza en la misma línea y lo largo baja dentro de
  su columna; nunca mezclar filas apiladas con filas alineadas a la derecha), los sí/no en pildorita («Sí» navy sobre
  `--in-plomo`, «No» gris con borde). El detalle de una pregunta («Descripción de la alergia») es una fila
  más **con su título**, en las mismas dos columnas y pegada a su pregunta (sin línea entre las dos); nada
  a lo ancho de la tarjeta ni sin título. Nada de ámbar aquí: se pidió plomo.
- **Documentación y expediente (opción G2):** lo que vence va arriba en UNA tarjeta destacada (círculos de
  Perfil, ícono en círculo ámbar o rojo si venció): con un documento dice cuál y cuándo; con dos o más, «N
  documentos por renovar» y una línea por cada uno. «Subir la nueva / las nuevas» (píldora menta) lleva a
  Editar perfil si es de Información personal. Lista: nombre corto primero («Pasaporte»), su tipo debajo,
  círculo con aro menta e ícono por tipo, etiqueta de estado a la derecha y una sola «›»; nada de ojo ni
  descarga en la fila (descargar vive en la vista del documento). Filtros en píldora sin borde con sombra.
  **Ver un documento (opción W2):** pantalla propia que reemplaza a Documentación (un solo «‹ Documentación»,
  nunca una hoja encima de la lista). Arriba la tarjeta destacada: tipo en menta, nombre corto, y si vence
  su estado + «N días» grande «para que venza / desde que venció»; acciones «Descargar» y, si vence y es de
  Información personal, «Subir la nueva». Debajo la hoja recortada («Ver entero» la abre) y los datos en F3.
- **Configuración (opción B «su cuenta arriba»):** «‹ Mi perfil» y título a la izquierda. Arriba, la
  tarjeta de cuenta (foto con aro menta, nombre, correo corporativo y «Editar perfil de usuario» en menta,
  con un círculo menta de Perfil) que abre Editar perfil. Grupos con el rótulo del Inicio en una tarjeta
  blanca con sombra y filas separadas por línea. **Interruptor:** apagado gris claro (`--in-boton-off`)
  con bolita blanca, encendido menta. «Modo oscuro» es un interruptor, no una fila con flecha. Lo rojo
  (cerrar sesión, eliminar la cuenta) va al final en un grupo «Cuenta»: filas como las demás con el aro
  `--in-rojo-borde` y el título e ícono `--in-rojo` (opción R1); nunca un botón rojo lleno.
- **Formularios** (horas extra, corregir marcación, el campo de «Revise su solicitud»): título 600, la etiqueta
  gris arriba (7.2, sin negrita) y el campo **sin borde** en `--in-fondo` (radio 10, texto 8.4/500) dentro de la
  tarjeta blanca. Opciones de una sola elección («¿Qué marca?») en **píldora**, la elegida en `--in-pill`. El botón
  de enviar en píldora menta; apagado en `--in-plomo` mientras falte algo. El documento para revisar (papel) no cambia.
- **Papeleta de vacación** (`Papeleta` en `VacacionPhone.jsx`, también en «Ver» del detalle): la sección «2 · Vacación
  solicitada» va en filas de dos columnas como Mi ficha (opción I2): desde, hasta, días hábiles (fila en menta),
  vuelve a trabajar, saldo después y el motivo si lo hay. Nada de recuadros sueltos ni borde navy. El motivo y
  «Solicitar» de abajo se quedan como estaban (se pidió no cambiarlos).
- **Mis documentos** (Zona HR; opciones MD2 + C2): tarjeta destacada blanca con el anillo de avance y «Resolver»
  (nunca la franja navy); las carpetas en mosaicos de dos como Zona HR, dibujadas como **carpeta menta lisa**
  (pestaña, hoja asomando y frente en menta; sin sello, se pidió sin el iconito) y lo que hay que atender como
  etiqueta de estado arriba a la derecha. Filas con el círculo con aro menta; en «Por entregar» la etiqueta va
  junto al título y la píldora debajo del texto. Va siempre en claro (`papel-claro`) hasta pasar sus colores fijos.
- **Buscador (Zona HR):** nunca abre otra pantalla (se sentía «otra ventana»). Píldora blanca fija debajo
  del título, alto 30, `--in-sombra`; al escribir o con foco, aro navy. Al escribir, la cuadrícula se
  **filtra** (quedan los módulos que coinciden, lo escrito en negrita) y debajo salen «Pedir» y «Lo que ya
  tiene». Sin «Cancelar»: la «×» borra y deja el cursor en el campo. El título y la pestaña no se mueven.
- **Botones:** principal menta `#00E091` con texto navy, alto 26 a 30, en **píldora** (radio 99), como «Marcar entrada» del Inicio. Secundario blanco
  con borde. Acción peligrosa en rojo `#D92D20`, y la salida segura como botón del mismo tamaño
  («No, mantenerla»), nunca como texto chico.
- **Tarjeta de «hoy» (Mi asistencia, `HoyCel` en `Marcador.jsx`):** blanca, sin línea de color arriba
  (se pidió quitarla) y **sin ruido** (se pidió la M3): solo la etiqueta del momento, el reloj grande
  y **un solo botón que siempre es lo que sigue**; la otra acción posible va como enlace chico debajo
  («O iniciar una pausa»). Los pasos y las horas de cada marca NO van aquí: están al tocar el día en
  la semana. Colores de la etiqueta: gris sin nada en curso, verde trabajando o listo, ámbar en la
  pausa. El botón de marcar es **siempre menta**: solo cambian su texto y su ícono. Al terminar no hay
  botón y se muestra lo trabajado. Una entrada después de la hora de salida es «fuera de horario»,
  nunca «X horas tarde».
- **La semana:** tira de lunes a domingo con un punto por día (verde a tiempo, ámbar tarde, rojo
  ausente, gris lo que falta), hoy en navy, y debajo tres cifras en una tarjeta. Tocar un día muestra
  sus marcas debajo (Entrada — Trabajó — Salida y la pausa). «Ver el mes ›» abre el calendario del
  mes pintado por estado, con las mismas marcas al tocar un día. No hay lista larga de días.
- **Lanzador de módulos (Zona HR, `ZonaHRPhone.jsx`, opción C3):** cabecera con título, una línea y los
  botones redondos blancos (modo oscuro, avisos); módulos en el orden de siempre, en cuadrícula de tres,
  cada uno en tarjeta con su ícono **navy** dentro de un **círculo con borde menta** (se pidió no alejarse de
  los circulitos de siempre) y el nombre en 7.6 / peso 500. Lo pendiente, número ámbar en la esquina.
- **Pedir algo desde una pantalla:** un «+» menta redondo junto al título o saludo (como en Mis
  solicitudes). Si hay más de una cosa para pedir, abre un menú corto debajo (ícono en su color,
  nombre y una línea; lo que viene después, apagado con «Pronto»). Cada pedido abre su pantalla con
  `BarraVolver`. No se dejan tarjetas grandes para algo que casi siempre está vacío.
- **Lo que pide respuesta** (por ejemplo, horas extra que RR.HH. asignó) va como aviso arriba de la
  tarjeta principal, con dos botones del mismo tamaño («No puedo» / «Acepto»).
- **Avisos y confirmaciones:** modal centrado sobre velo `rgba(12,45,64,.42)`, ícono en círculo de
  color suave, título con lo que se hace y sus fechas, una línea de consecuencia, dos botones apilados.
  Avisos de éxito: la tostada navy de abajo («Solicitud enviada a RR.HH.»).
- **Ver un documento (V1, la W2 de Perfil en todas):** archivo, contrato y certificado recibido usan
  la misma vista: tarjeta destacada con rótulo, título, estado y días; acciones en píldora («Descargar»,
  «Renovar» / «Volver a subir» / «Pedir una copia»); la hoja recortada con «Ver entero»; los datos en
  dos columnas. Lo que RR.HH. rechazó, en nota roja. «Reportar un error» es una tarjeta blanca con texto rojo.
- **Revisar una solicitud (R1):** toda solicitud con hoja (vacación, certificado, copia, corrección) se
  revisa con la misma papeleta: datos del trabajador en grilla y lo que pide en **filas de dos columnas**,
  con una sola fila menta (la entrega o la respuesta de RR.HH.). Sin franjas navy ni cajas grises. Abajo,
  el campo en una línea (lo escrito entra en la hoja como fila) y «Solicitar» fijo al pie, alto 34.
  Un solo camino para pedir: desde Mis documentos también se elige y se revisa la hoja (no hay otro formulario).
- **Fecha y hora en formularios:** nunca `<input type="date|time">` (abren el calendario y el reloj del
  sistema). El campo queda igual («30/10/2026», «08:30») y al tocarlo se marca con aro menta y se abre
  pegada a él una tarjeta blanca con borde suave y cabecera clara con los círculos menta, que dice en
  grande lo elegido. Día: `FechaCel` (calendario de la vacación: hoy con aro menta, elegido en navy,
  fuera de rango apagado; tocar un día lo elige y cierra). Hora: `HoraCel` (opción Q1: dos columnas
  que se deslizan, horas y minutos de 1 en 1, lo del centro en píldora navy; atajos como
  «08:30 · su entrada» o «Ahora»; se confirma con «Listo»). Si la tarjeta no entra, la pantalla baja sola.
- **Íconos:** lucide-react, trazo fino. Mismo ícono por tipo: Palmtree, Clock, PencilLine, House,
  Repeat, Award, ScrollText, Flag.
- **Modo oscuro:** el Inicio y la vacación ya lo siguen con las variables `--in-*` de `index.css`. Las
  pantallas nuevas usan esas variables en vez de colores fijos cuando se pasen a oscuro.

## Textos

- Español de Bolivia, de **usted** («Toque uno», «Le quedan 5 días»).
- Lo importante primero y en grande (las fechas, el nombre); lo demás en una línea corta.
- Fechas cortas: «14 – 18 dic», «enviada hoy», «enviada el 20 oct 2026», «a más tardar el lunes 2 de
  noviembre». Siempre decir cuándo se envió algo.
- Sin palabras técnicas. Los botones dicen la acción («Solicitar», «Sí, cancelar vacación»).
- Unidad organizacional, sucursal y centro de trabajo van por separado (nunca «sede»).
