// Directorio de colaboradores del prototipo. Vive fuera de `Colaboradores.jsx` para que
// los modales que necesitan la lista (asignar buddy, previsualizar ruta) no tengan que
// importar de vuelta a la pantalla que a su vez los importa a ellos.


/* Retratos de gente que no existe (randomuser.me). El prototipo se muestra en reuniones y una
   grilla de iniciales no se parece a la pantalla que va a ser; con la conexión caída, la inicial
   sigue estando debajo, así que nunca se ve peor que antes.

   `foto` guarda la referencia corta —'m/32', 'w/44'— y no la URL entera para que el archivo se
   siga leyendo. Cuando SoulyHR aloje las fotos de verdad, esto pasa a ser la ruta del archivo
   subido y no cambia nada más: la pantalla ya pide la foto por persona.

   Las caras están puestas a mano, una por una. Ninguna se deduce del nombre —eso sale mal— así
   que si alguna no pega con el personaje, se cambia su referencia acá y listo. */
export const fotoDe = persona => (persona?.foto
  ? `https://randomuser.me/api/portraits/${persona.foto[0] === 'w' ? 'women' : 'men'}/${persona.foto.slice(2)}.jpg`
  : null)

export const departamentos = ['Todos', 'Dirección General', 'Ventas', 'Tecnología', 'Marketing', 'Operaciones', 'Recursos Humanos', 'Finanzas', 'Diseño']

/* Una ruta asignada no arranca sola: queda "Sin iniciar" hasta que el colaborador abre su
   primera tarea. Solo entonces pasa a "En curso". */
export const ESTADOS_ONBOARDING = {
  'n-a': { label: 'N/A', color: '#b0b8c4', dot: '#cbd5e1', bg: '#f8fafc', desc: 'Incorporado antes del sistema' },
  'sin-ruta': { label: 'Sin ruta', color: '#64748b', dot: '#94a3b8', bg: '#f8fafc', desc: 'Nuevo ingreso sin ruta asignada' },
  'sin-iniciar': { label: 'Sin iniciar', color: '#b45309', dot: '#f59e0b', bg: '#fefce8', desc: 'Ruta asignada, aún no la comienza' },
  'en-curso': { label: 'En curso', color: '#2563eb', dot: '#2563eb', bg: '#eff6ff', desc: 'Realizando su onboarding' },
  'en-riesgo': { label: 'En riesgo', color: '#dc2626', dot: '#dc2626', bg: '#fef2f2', desc: '+3 días sin actividad' },
  'graduado': { label: 'Graduado', color: '#16a34a', dot: '#16a34a', bg: '#f0fdf4', desc: 'Completó todas las etapas' },
}

/* ── EL ESTADO DE UN COLABORADOR ──────────────────────────────────────────
   Eran cinco —activo, vacaciones, licencia, suspendido, desvinculado— y no eran cinco valores
   de lo mismo: eran las respuestas a DOS PREGUNTAS que no tienen nada que ver.

     ¿EXISTE EL VÍNCULO?  Un hecho legal. Decide si la persona va en planilla, si se la declara
     a la Gestora y a la Caja, y si cuenta como parte de la empresa. Cambia tres o cuatro veces
     en una vida laboral y cada cambio es un trámite.

     ¿ESTÁ HOY?  Un hecho de calendario. Tiene fecha de inicio y de fin, se aprueba y se repite
     varias veces al año. NO toca el contrato: quien está de vacaciones sigue siendo empleado,
     cobra y suma antigüedad.

   METIDAS EN LA MISMA COLUMNA SE PISAN. Para marcar que alguien salió de vacaciones había que
   borrar que estaba activo, y en cuatro sitios del código —el selector de buddy, el
   constructor de rutas y los dos contadores del directorio— `status === 'activo'` quiere decir
   «es empleado vigente». Resultado: el directorio decía 5 inactivos cuando sólo 3 personas se
   habían ido, y quien estaba de vacaciones no podía ser buddy de nadie.

   AHORA SON DOS CAMPOS. `status` contesta la primera pregunta y nada más; `ausencia` contesta
   la segunda y lleva sus fechas. Los cuatro sitios que preguntaban por `activo` se arreglaron
   solos: quien está de vacaciones VUELVE a estar activo, que es lo que siempre fue.

   UN ESTADO SE JUSTIFICA POR LO QUE CAMBIA, y estos tres cambian cosas distintas: quién va en
   planilla, quién puede ocupar un puesto, quién entra al sistema, quién suma antigüedad y
   quién sale en la búsqueda de reingreso. Si dos estados no difieren en nada, sobra uno. */
export const ESTADOS_VINCULO = {
  activo: { label: 'Activo', desc: 'Contrato vigente y en funciones', color: '#16a34a', bg: '#f0fdf4' },
  /* NECESITA MOTIVO, y no es burocracia: una suspensión disciplinaria sin goce de haber no paga
     ni suma antigüedad; una por incapacidad temporal sí, y la cubre la Caja. Sin saber cuál de
     las dos es, la planilla no se puede calcular sola. */
  suspendido: { label: 'Suspendido', desc: 'El contrato sigue, pero está interrumpido', color: '#dc2626', bg: '#fef2f2', pideMotivo: true },
  /* El que faltaba. En producción se marcaba como «suspendido» a quien ya se había ido, y ahí
     el estado deja de significar nada: un suspendido vuelve, un desvinculado no. */
  desvinculado: { label: 'Desvinculado', desc: 'El contrato terminó', color: '#64748b', bg: '#f8fafc', pideMotivo: true, pideFecha: true },
}

/* LO QUE ANTES ERAN ESTADOS Y SON AUSENCIAS. La diferencia que importa: esto TERMINA solo. Una
   ausencia tiene fecha de fin, así que nadie tiene que acordarse de volver a poner a la persona
   en activo cuando regresa — que es el error que la forma anterior garantizaba. */
export const TIPOS_AUSENCIA = {
  vacaciones: { label: 'Vacaciones', desc: 'Descanso programado', color: '#b45309', bg: '#fefce8' },
  licencia: { label: 'Licencia médica', desc: 'Baja temporal por salud', color: '#2563eb', bg: '#eff6ff' },
}

/* Lo que se enseña al lado del nombre: si hay una ausencia en curso manda ella, porque es la
   respuesta a «¿puedo contar con esta persona esta semana?», que es lo que uno mira en una
   tabla. El vínculo sigue siendo el de abajo y no cambió. */
export const insigniaDe = c => (
  c?.ausencia?.tipo && TIPOS_AUSENCIA[c.ausencia.tipo]
    ? { ...TIPOS_AUSENCIA[c.ausencia.tipo], clave: c.ausencia.tipo }
    : { ...(ESTADOS_VINCULO[c?.status] || ESTADOS_VINCULO.activo), clave: c?.status || 'activo' }
)

/* QUIÉN PUEDE SER ELEGIDO EN UN DESPLEGABLE. Un desvinculado sigue en el directorio —es
   historia y hace falta para reconocer un reingreso— pero no puede ser el jefe de nadie, ni
   un garante, ni el contacto de emergencia de alguien que entra hoy. Ofrecerlo es ofrecer a
   alguien que ya no está.

   Va acá y no escrito a mano en cada pantalla porque la regla es una sola y las pantallas que
   la necesitan son varias. */
export const esVigente = c => c?.status !== 'desvinculado'

// Estados en los que ya existe una ruta viva: se puede desasignar y se puede acompañar con un buddy.
export const CON_RUTA_ACTIVA = ['sin-iniciar', 'en-curso', 'en-riesgo']

// Solo puede acompañar a alguien quien ya terminó su propio onboarding (o entró antes del
// sistema). Nadie guía un camino que todavía está recorriendo.
export const BUDDY_ELEGIBLE = ['graduado', 'n-a']

// El buddy es una relación que cuelga de la asignación de onboarding: Diego es Colaborador
// graduado y, además, acompaña a tres personas.
const BUDDY_MARTIN = { name: 'Martín Solano', initials: 'MS', color: '#10b981' }
const BUDDY_DIEGO = { name: 'Diego Morales', initials: 'DM', color: '#3b82f6' }

/* El jefe es una relación estable del colaborador, no de la asignación: sigue ahí cuando el
   onboarding termina. Por eso apunta a la persona y no al área — un área puede tener varios
   líderes, y quien dirige no siempre es el senior de su propio departamento. */
const JEFE_ANA = { name: 'Ana Martínez Ruiz', initials: 'AM', color: '#c026d3' }
const JEFE_NICOLAS = { name: 'Nicolás Zapata', initials: 'NZ', color: '#84cc16' }

/* LA VERSIÓN DE LA SEMILLA. Se sube A MANO cada vez que cambian los datos de ejemplo, y lo que
   la hace necesaria es un error que ya ocurrió dos veces.

   Primero la semilla sólo sembraba: quien ya había usado la demo no veía a los tres
   ex-colaboradores nuevos, porque su navegador ya tenía guardada una lista sin ellos. Eso se
   arregló agregando las filas que faltaban por `id`.

   Y AHÍ APARECIÓ EL SEGUNDO, que es más sutil: a María se la sembró primero sin ficha y la
   ficha llegó después. Como su `id` ya estaba guardado, la mezcla no la tocaba — el reingreso
   la encontraba y no copiaba ni su nombre, porque en ESE navegador María no tenía ficha. Una
   fila que ya existe también puede haber cambiado.

   ASÍ QUE AL SUBIR LA VERSIÓN, LAS FILAS SEMBRADAS SE REESCRIBEN y lo que el usuario creó se
   queda intacto: sus ids son mayores que cualquiera de la semilla. El precio es que una
   edición hecha sobre una persona de ejemplo se pierde en la próxima subida — y es el precio
   correcto, porque eso es exactamente lo que significa que sea de ejemplo. */
export const SEMILLA_VERSION = 3

export const colaboradoresData = [
  { id: 1, name: 'Diego Morales', email: 'diego.morales@farmavida.com.bo', depto: 'Tecnología', cargo: 'Desarrollador Backend', rol: 'Colaborador', ingreso: '15 Mar 2025', status: 'activo', registro: 100, onb: 'graduado', foto: 'm/32', initials: 'DM', color: '#3b82f6' },
  { id: 2, name: 'Camila Herrera', email: 'camila.herrera@farmavida.com.bo', depto: 'Ventas', cargo: 'Ejecutiva Comercial', rol: 'Colaborador', ingreso: '02 Ene 2026', status: 'activo', registro: 100, onb: 'sin-iniciar', onbPct: 0, foto: 'w/44', initials: 'CH', color: '#f97316', buddy: BUDDY_MARTIN, jefe: JEFE_NICOLAS },
  { id: 3, name: 'Valentina Cruz', email: 'valentina.cruz@farmavida.com.bo', depto: 'Diseño', cargo: 'Diseñadora UX/UI', rol: 'Colaborador', ingreso: '20 May 2026', status: 'activo', registro: 100, onb: 'en-riesgo', onbPct: 25, foto: 'w/68', initials: 'VC', color: '#ec4899', buddy: BUDDY_DIEGO },
  { id: 4, name: 'Facundo Medina', email: 'facundo.medina@farmavida.com.bo', depto: 'Tecnología', cargo: 'QA Engineer', rol: 'Colaborador', ingreso: '10 Abr 2026', status: 'activo', registro: 100, onb: 'en-riesgo', onbPct: 15, foto: 'm/75', initials: 'FM', color: '#ef4444' },
  { id: 5, name: 'Sofía Ramírez', email: 'sofia.ramirez@farmavida.com.bo', depto: 'Ventas', cargo: 'Pasante Comercial', rol: 'Colaborador', ingreso: '10 Jun 2026', status: 'activo', registro: 60, onb: 'sin-ruta', foto: 'w/12', initials: 'SR', color: '#f59e0b', jefe: JEFE_NICOLAS },
  { id: 6, name: 'Martín Solano', email: 'martin.solano@farmavida.com.bo', depto: 'Tecnología', cargo: 'Frontend Developer', rol: 'Colaborador', ingreso: '03 Feb 2025', status: 'activo', registro: 100, onb: 'graduado', foto: 'm/45', initials: 'MS', color: '#10b981' },
  { id: 7, name: 'Luciana Paredes', email: 'luciana.paredes@farmavida.com.bo', depto: 'Ventas', cargo: 'Account Manager', rol: 'Colaborador', ingreso: '17 Jun 2026', status: 'activo', registro: 40, onb: 'sin-ruta', foto: 'w/29', initials: 'LP', color: '#0d9488', jefe: JEFE_NICOLAS },
  { id: 8, name: 'Tomás Ibáñez', email: 'tomas.ibanez@farmavida.com.bo', depto: 'Operaciones', cargo: 'Analista de Procesos', rol: 'Colaborador', ingreso: '17 Jun 2026', status: 'activo', registro: 25, onb: 'sin-ruta', foto: 'm/11', initials: 'TI', color: '#8b5cf6' },
  { id: 9, name: 'Paola Arce', email: 'paola.arce@farmavida.com.bo', depto: 'Recursos Humanos', cargo: 'Especialista RRHH', rol: 'Sub-admin RRHH', ingreso: '10 Ago 2024', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/56', initials: 'PA', color: '#d946ef' },
  { id: 10, name: 'Roberto Peña', email: 'roberto.pena@farmavida.com.bo', depto: 'Finanzas', cargo: 'Contador General', rol: 'Supervisor', ingreso: '05 Nov 2024', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/60', initials: 'RP', color: '#0C2D40' },
  { id: 11, name: 'Andrea Núñez', email: 'andrea.nunez@farmavida.com.bo', depto: 'Marketing', cargo: 'Community Manager', rol: 'Colaborador', ingreso: '22 Sep 2025', status: 'activo', registro: 100, onb: 'en-curso', onbPct: 55, foto: 'w/33', initials: 'AN', color: '#06b6d4', buddy: BUDDY_DIEGO, jefe: JEFE_ANA },
  { id: 12, name: 'Nicolás Zapata', email: 'nicolas.zapata@farmavida.com.bo', depto: 'Ventas', cargo: 'Ejecutivo Senior', rol: 'Líder de área', ingreso: '14 Jul 2024', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/22', initials: 'NZ', color: '#84cc16' },
  { id: 13, name: 'Carolina Vega', email: 'carolina.vega@farmavida.com.bo', depto: 'Marketing', cargo: 'Analista de Marketing', rol: 'Colaborador', ingreso: '08 Mar 2025', status: 'activo', registro: 100, onb: 'graduado', onbPct: 100, foto: 'w/81', initials: 'CV', color: '#14b8a6', buddy: BUDDY_DIEGO, jefe: JEFE_ANA },
  { id: 14, name: 'Alejandro Ríos', email: 'alejandro.rios@farmavida.com.bo', depto: 'Tecnología', cargo: 'DevOps Engineer', rol: 'Colaborador', ingreso: '22 Nov 2024', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/8', initials: 'AR', color: '#6366f1' },
  { id: 15, name: 'Daniela Flores', email: 'daniela.flores@farmavida.com.bo', depto: 'Recursos Humanos', cargo: 'Analista de Nóminas', rol: 'Colaborador', ingreso: '15 Ene 2025', status: 'activo', registro: 100, onb: 'graduado', foto: 'w/9', initials: 'DF', color: '#e11d48' },
  { id: 16, name: 'Sebastián Torres', email: 'sebastian.torres@farmavida.com.bo', depto: 'Operaciones', cargo: 'Coordinador Logístico', rol: 'Supervisor', ingreso: '03 Sep 2025', status: 'activo', ausencia: { tipo: 'vacaciones', desde: '01 Sep 2026', hasta: '19 Sep 2026' }, registro: 100, onb: 'graduado', foto: 'm/54', initials: 'ST', color: '#0891b2' },
  { id: 17, name: 'Isabella Mendoza', email: 'isabella.mendoza@farmavida.com.bo', depto: 'Finanzas', cargo: 'Analista Financiera', rol: 'Colaborador', ingreso: '18 Abr 2025', status: 'activo', registro: 100, onb: 'en-curso', onbPct: 32, foto: 'w/20', initials: 'IM', color: '#7c3aed' },
  { id: 18, name: 'Mateo Guzmán', email: 'mateo.guzman@farmavida.com.bo', depto: 'Ventas', cargo: 'SDR Junior', rol: 'Colaborador', ingreso: '25 Jun 2026', status: 'activo', registro: 75, onb: 'sin-ruta', foto: 'm/91', initials: 'MG', color: '#ca8a04', jefe: JEFE_NICOLAS },
  { id: 19, name: 'Renata Castillo', email: 'renata.castillo@farmavida.com.bo', depto: 'Diseño', cargo: 'Diseñadora Gráfica', rol: 'Colaborador', ingreso: '12 Feb 2026', status: 'activo', registro: 100, onb: 'en-curso', onbPct: 48, foto: 'w/71', initials: 'RC', color: '#db2777' },
  { id: 20, name: 'Gabriel Pacheco', email: 'gabriel.pacheco@farmavida.com.bo', depto: 'Tecnología', cargo: 'Data Analyst', rol: 'Colaborador', ingreso: '30 May 2025', status: 'activo', registro: 100, onb: 'en-curso', onbPct: 70, foto: 'm/17', initials: 'GP', color: '#059669', buddy: BUDDY_DIEGO },
  { id: 21, name: 'Valeria Rojas', email: 'valeria.rojas@farmavida.com.bo', depto: 'Marketing', cargo: 'Content Creator', rol: 'Colaborador', ingreso: '07 Ago 2025', status: 'activo', registro: 100, onb: 'graduado', foto: 'w/48', initials: 'VR', color: '#c026d3', jefe: JEFE_ANA },
  { id: 22, name: 'Emilio Vargas', email: 'emilio.vargas@farmavida.com.bo', depto: 'Operaciones', cargo: 'Asistente Operativo', rol: 'Colaborador', ingreso: '20 Jun 2026', status: 'activo', ausencia: { tipo: 'licencia', desde: '24 Ago 2026', hasta: '30 Sep 2026' }, registro: 50, onb: 'sin-ruta', foto: 'm/83', initials: 'EV', color: '#ea580c' },
  { id: 23, name: 'Camilo Espinoza', email: 'camilo.espinoza@farmavida.com.bo', depto: 'Finanzas', cargo: 'Tesorero', rol: 'Gerente', ingreso: '11 Oct 2024', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/40', initials: 'CE', color: '#2563eb' },
  { id: 24, name: 'Julieta Sánchez', email: 'julieta.sanchez@farmavida.com.bo', depto: 'Recursos Humanos', cargo: 'Reclutadora', rol: 'Colaborador', ingreso: '28 Jun 2026', status: 'activo', registro: 15, onb: 'sin-ruta', foto: 'w/5', initials: 'JS', color: '#9333ea' },
  { id: 25, name: 'Ana Martínez Ruiz', email: 'ana.martinez@farmavida.com.bo', depto: 'Marketing', cargo: 'Líder de Marketing', rol: 'Líder de área', ingreso: '19 Feb 2024', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/65', initials: 'AM', color: '#c026d3' },
  { id: 26, name: 'Bruno Salazar', email: 'bruno.salazar@farmavida.com.bo', depto: 'Marketing', cargo: 'Especialista SEO', rol: 'Colaborador', ingreso: '01 Jun 2026', status: 'activo', registro: 100, onb: 'en-riesgo', onbPct: 18, foto: 'm/29', initials: 'BS', color: '#f43f5e', buddy: BUDDY_MARTIN, jefe: JEFE_ANA },
  { id: 27, name: 'Natalia Ferrer', email: 'natalia.ferrer@farmavida.com.bo', depto: 'Marketing', cargo: 'Ejecutiva de Marca', rol: 'Colaborador', ingreso: '15 Jun 2026', status: 'activo', registro: 100, onb: 'sin-iniciar', onbPct: 0, foto: 'w/90', initials: 'NF', color: '#8b5cf6', jefe: JEFE_ANA },
  // Dirección General: son la punta del organigrama, por eso existen en el directorio.
  { id: 28, name: 'Ricardo Ballivián', email: 'ricardo.ballivian@farmavida.com.bo', depto: 'Dirección General', cargo: 'Gerente General', rol: 'Gerente', ingreso: '02 Ene 2023', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/68', initials: 'RB', color: '#0C2D40' },
  { id: 29, name: 'Lorena Aguirre', email: 'lorena.aguirre@farmavida.com.bo', depto: 'Dirección General', cargo: 'Asistente de Dirección', rol: 'Colaborador', ingreso: '18 Mar 2023', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/37', initials: 'LA', color: '#0891b2' },

  /* PERSONAL SIN UBICAR EN EL ORGANIGRAMA. Existen en el directorio y no ocupan ningún cuadro:
     son el banco de gente disponible para cubrir plazas. Sin ellos el organigrama sembrado deja
     a cada persona en una casilla, y la lista de "Quiénes lo ocupan" —que solo ofrece a quien no
     ocupa otro puesto— sale vacía justo al ir a cubrir una vacante.

     "Sin puesto asignado" es el respaldo que muestra el directorio mientras nadie los dibuje: el
     cargo de verdad sale del cuadro que ocupan (`cargoDe`), y área no tienen —eso lo decide la
     estructura, no el directorio—. Van como 'n-a' a propósito: es personal existente sin ubicar,
     no ingresos nuevos, así que no ensucian los tableros de onboarding. */
  { id: 30, name: 'Adriana Ledezma', email: 'adriana.ledezma@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '02 Ene 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/1', initials: 'AL', color: '#0ea5e9' },
  { id: 31, name: 'Fernando Quisbert', email: 'fernando.quisbert@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '05 Feb 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/1', initials: 'FQ', color: '#f97316' },
  { id: 32, name: 'Marcela Antelo', email: 'marcela.antelo@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '08 Mar 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/2', initials: 'MA', color: '#8b5cf6' },
  { id: 33, name: 'Iván Chumacero', email: 'ivan.chumacero@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '11 Abr 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/2', initials: 'IC', color: '#14b8a6' },
  { id: 34, name: 'Gabriela Loayza', email: 'gabriela.loayza@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '14 May 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/3', initials: 'GL', color: '#e11d48' },
  { id: 35, name: 'Rodrigo Terceros', email: 'rodrigo.terceros@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '17 Jun 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/3', initials: 'RT', color: '#3b82f6' },
  { id: 36, name: 'Lucía Balderrama', email: 'lucia.balderrama@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '20 Jul 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/4', initials: 'LB', color: '#65a30d' },
  { id: 37, name: 'Álvaro Justiniano', email: 'alvaro.justiniano@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '23 Ago 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/4', initials: 'ÁJ', color: '#d946ef' },
  { id: 38, name: 'Patricia Mostajo', email: 'patricia.mostajo@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '26 Ene 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/6', initials: 'PM', color: '#0891b2' },
  { id: 39, name: 'Javier Suárez', email: 'javier.suarez@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '03 Feb 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/5', initials: 'JS', color: '#ca8a04' },
  { id: 40, name: 'Silvia Ortuño', email: 'silvia.ortuno@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '06 Mar 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/7', initials: 'SO', color: '#7c3aed' },
  { id: 41, name: 'Marcelo Zurita', email: 'marcelo.zurita@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '09 Abr 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/6', initials: 'MZ', color: '#059669' },
  { id: 42, name: 'Karen Villarroel', email: 'karen.villarroel@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '12 May 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/8', initials: 'KV', color: '#db2777' },
  { id: 43, name: 'Pablo Encinas', email: 'pablo.encinas@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '15 Jun 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/7', initials: 'PE', color: '#2563eb' },
  { id: 44, name: 'Rocío Calderón', email: 'rocio.calderon@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '18 Jul 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/10', initials: 'RC', color: '#f59e0b' },
  { id: 45, name: 'Óscar Landívar', email: 'oscar.landivar@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '21 Ago 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/9', initials: 'ÓL', color: '#10b981' },
  { id: 46, name: 'Fabiola Arispe', email: 'fabiola.arispe@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '24 Ene 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/11', initials: 'FA', color: '#c026d3' },
  { id: 47, name: 'Hugo Michel', email: 'hugo.michel@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '27 Feb 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/10', initials: 'HM', color: '#0d9488' },
  { id: 48, name: 'Verónica Ayala', email: 'veronica.ayala@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '04 Mar 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/13', initials: 'VA', color: '#ef4444' },
  { id: 49, name: 'Ramiro Cuéllar', email: 'ramiro.cuellar@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '07 Abr 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/12', initials: 'RC', color: '#6366f1' },
  { id: 50, name: 'Andrea Pinto', email: 'andrea.pinto@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '10 May 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/14', initials: 'AP', color: '#84cc16' },
  { id: 51, name: 'Gonzalo Áñez', email: 'gonzalo.anez@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '13 Jun 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/13', initials: 'GÁ', color: '#ea580c' },
  { id: 52, name: 'Mariana Ribera', email: 'mariana.ribera@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '16 Jul 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/15', initials: 'MR', color: '#06b6d4' },
  { id: 53, name: 'Enrique Dorado', email: 'enrique.dorado@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '19 Ago 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/14', initials: 'ED', color: '#9333ea' },
  { id: 54, name: 'Claudia Nogales', email: 'claudia.nogales@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '22 Ene 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/16', initials: 'CN', color: '#f43f5e' },
  { id: 55, name: 'Diego Camacho', email: 'diego.camacho@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '25 Feb 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/15', initials: 'DC', color: '#22c55e' },
  { id: 56, name: 'Tatiana Roca', email: 'tatiana.roca@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '02 Mar 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/17', initials: 'TR', color: '#a855f7' },
  { id: 57, name: 'Luis Peñaranda', email: 'luis.penaranda@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '05 Abr 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/16', initials: 'LP', color: '#0C2D40' },
  { id: 58, name: 'Alejandra Vaca', email: 'alejandra.vaca@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '08 May 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'w/18', initials: 'AV', color: '#ec4899' },
  { id: 59, name: 'Sergio Molina', email: 'sergio.molina@farmavida.com.bo', depto: 'Sin asignar', cargo: 'Sin puesto asignado', rol: 'Colaborador', ingreso: '11 Jun 2026', status: 'activo', registro: 100, onb: 'n-a', foto: 'm/18', initials: 'SM', color: '#334155' },

  /* UNA SEGUNDA ROJAS, Y ESTÁ ACTIVA. No es relleno: es el caso que separa una búsqueda que
     sirve de una que engaña. Quien da de alta a «Rojas» tiene que ver a las dos y distinguirlas
     por el carnet, y sobre todo tiene que enterarse de que una de ellas TRABAJA ACÁ HOY —eso
     no es un reingreso, es un duplicado de alguien en planilla, que es el peor de los dos
     errores—. Sin ella, la tarjeta de reingreso se probaba solo con el caso fácil. */
  { id: 63, name: 'Carla Andrea Rojas Zeballos', email: 'carla.rojas@farmavida.com.bo', depto: 'Ventas', cargo: 'Visitadora Médica', rol: 'Colaborador', ingreso: '12 Feb 2024', documento: '7733410 SC', status: 'activo', registro: 100, onb: 'graduado', foto: 'w/33', initials: 'CR', color: '#10b981' },

  /* ── QUIEN SE FUE SIGUE ESTANDO ─────────────────────────────────────────
     El directorio tenía cincuenta y nueve personas y las cincuenta y nueve activas. No es que
     nadie se hubiera ido: es que al irse desaparecía, porque no había ningún estado que
     representara eso. La insignia de «Desvinculado» estaba dibujada en la tabla y en el modal
     de cambiar estado desde el principio, esperando a alguien que la llevara.

     Y ESO ROMPÍA EL REINGRESO. La primera tarjeta de la ficha de alta pregunta si la persona
     ya trabajó acá, para recuperar su registro en vez de crear un duplicado. Sin ex-
     colaboradores en ninguna parte, contestar «Sí» correctamente no llevaba a ningún lado:
     no había nada que recuperar.

     LLEVAN `salida`, `motivoSalida` Y `documento`, que los activos no tienen. La fecha de salida
     es lo que convierte un registro en historia —«trabajó de tal a tal»— y el documento es con lo
     que se lo va a encontrar: dos personas pueden llamarse igual, pero no tener el mismo
     documento. Se llamaba `ci`, y era un nombre boliviano en un producto que se vende a varios
     países: quien llega con pasaporte no tiene carnet, y se identifica igual de bien.

     `onb: n-a` porque su onboarding no está ni en curso ni pendiente: terminó hace años o
     nunca existió. `cargo` es el último que tuvieron, y NO ocupan ninguna silla del
     organigrama: el puesto quedó libre el día que se fueron. */
  { id: 60, name: 'María Fernanda Rojas Vargas', email: 'mf.rojas@farmavida.com.bo', depto: 'Finanzas', cargo: 'Analista de Tesorería', rol: 'Colaborador', ingreso: '04 Mar 2019', salida: '30 Jun 2023', motivoSalida: 'Renuncia voluntaria', documento: '8452119 SC', empresaGrupo: 'FarmaVida', status: 'desvinculado', registro: 100, onb: 'n-a', foto: 'w/26', initials: 'MR', color: '#8b5cf6',
    /* LA FICHA QUE MARÍA DEJÓ EN 2023. Está entera a propósito: es la que prueba de verdad el
       reingreso, porque enseña las dos mitades —lo que se copia callado y lo que llega marcado
       «a confirmar»— en una sola persona. Con la ficha a medias, el caso se probaba con cuatro
       campos y no se veía nada.

       Los valores de los desplegables son opciones REALES de sus catálogos: «CI», «Casado(a)»,
       «Santa Cruz». Un valor inventado deja el campo en blanco al dibujarse y el reingreso
       parecería no haber traído nada. */
    ficha: {
      // No cambian nunca
      '1.1': 'María', '1.2': 'Fernanda', '1.4': 'Rojas', '1.5': 'Vargas',
      /* EL TIPO DE DOCUMENTO SE ESCRIBE COMO LO DICE HOY SU CATÁLOGO. Acá decía «CI», que era
         la opción de entonces, y el catálogo pasó a llamarla «Documento nacional de identidad»
         —la sigla traía dentro que era boliviana y el producto se vende a varios países—. Un
         valor que ya no está en la lista no se dibuja: el desplegable volvía vacío y el
         reingreso, que había copiado el dato, parecía no haberlo traído.

         Y VA CON PAÍS EMISOR. La extensión y el complemento SEGIP sólo se enseñan si el
         documento es nacional Y lo emitió Bolivia; sin 1.14 puesto, el «SC» que sí se copiaba
         no tenía dónde aparecer. */
      '1.10': 'Documento nacional de identidad', '1.11': '8452119', '1.12': 'SC', '1.14': 'Bolivia',
      '1.21': '1991-07-14', '1.22': 'Santa Cruz de la Sierra', '1.23': 'Bolivia',
      '1.24': 'si',
      // Los números de por vida: los que hay que ir a buscar a otra oficina si se pierden
      '3.45': '3021-8845-17', '3.51': 'CNS-4471902', '3.57': 'RC-8845-21',
      // Lo que pudo cambiar en cuatro años — llega marcado «a confirmar»
      '1.29': 'Casado(a)', '1.32': 'Licenciada en Auditoría',
      '1.36': '+591 712 44 890', '1.39': 'mf.rojas.v@gmail.com',
      '1.42': 'Bolivia', '1.43': 'Santa Cruz', '1.45': 'Santa Cruz de la Sierra',
      '1.46': 'Equipetrol Norte', '1.47': 'Calle Los Cusis', '1.48': '248',
      '1.50': 'Frente al parque, portón verde',
      '2.1': 'Ernesto Rojas Saucedo', '2.2': 'Padre', '2.3': '+591 700 33 118',
      '3.89': 'Banco Nacional de Bolivia', '3.90': 'Caja de ahorro',
      '3.91': '1500-4432-19', '3.93': 'BOB · Boliviano',

      /* LO QUE PODÍA HACER EN EL SISTEMA, que es lo que la tarjeta de reingreso pregunta y no
         tenía con qué contestar. «¿Los mismos permisos que tenía?» enseñaba «Colaborador» —el
         `rol` del directorio— y ahí se acababa: un nombre de paquete no dice qué hay dentro, y
         quien aprueba el reingreso puede no ser quien configuró ese rol.

         EL INGRESO EN «NO» PORQUE SE FUE EN 2023. Un ex-colaborador con el acceso todavía
         habilitado es un hallazgo de auditoría, no un detalle de la ficha: el dato tiene que
         llegar al reingreso diciendo justamente eso. */
      '7.5': 'no', '7.6': 'Colaborador',
      '7.11': 'Autogestión de vacaciones, boletas y datos personales',
    } },
  { id: 61, name: 'Luis Alberto Mamani Quispe', email: 'la.mamani@farmavida.com.bo', depto: 'Operaciones', cargo: 'Auxiliar de Almacén', rol: 'Colaborador', ingreso: '18 Ene 2021', salida: '29 Feb 2024', motivoSalida: 'Fin de contrato a plazo fijo', documento: '6103884 LP', empresaGrupo: 'FarmaDistribución', status: 'desvinculado', registro: 100, onb: 'n-a', foto: 'm/24', initials: 'LM', color: '#0891b2',
    ficha: { '1.1': 'Luis', '1.2': 'Alberto', '1.4': 'Mamani', '1.5': 'Quispe', '1.10': 'Documento nacional de identidad', '1.11': '6103884', '1.12': 'LP', '1.14': 'Bolivia' } },
  { id: 62, name: 'Gabriela Ortiz Peña', email: 'g.ortiz@farmavida.com.bo', depto: 'Ventas', cargo: 'Ejecutiva Comercial', rol: 'Colaborador', ingreso: '07 Ago 2017', salida: '15 Dic 2020', motivoSalida: 'Renuncia voluntaria', documento: '9218455 CB', empresaGrupo: 'Laboratorios Vida', status: 'desvinculado', registro: 100, onb: 'n-a', foto: 'w/52', initials: 'GO', color: '#f97316',
    ficha: { '1.1': 'Gabriela', '1.4': 'Ortiz', '1.5': 'Peña', '1.10': 'Documento nacional de identidad', '1.11': '9218455', '1.12': 'CB', '1.14': 'Bolivia' } },
]
