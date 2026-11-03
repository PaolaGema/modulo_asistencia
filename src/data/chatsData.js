/* LO QUE YA HAY EN COMUNICACIÓN cuando se abre la demo (opción K1, «una lista, como WhatsApp»).
   Los canales son de RR.HH.: publica RR.HH. y la gente reacciona, no responde. El grupo del área
   se arma solo con la gente de la misma área. Los chats uno a uno traen unas líneas de ejemplo;
   lo que la persona escribe se suma encima y se guarda en el navegador.

   Cada mensaje: { de: 'yo' | nombre, texto, hora, dia? } — `dia` ('Ayer', 'Mar') va en los que no
   son de hoy, y es lo que la lista muestra en vez de la hora. */

export const CANALES = [
  {
    id: 'rrhh', nombre: 'Recursos Humanos', fijado: true, personas: 412,
    publicaciones: [
      { dia: 'Lun', hora: '09:00', titulo: 'Vacaciones de fin de año', texto: 'Recuerde pedirlas antes del 30 de noviembre desde la app, en Inicio › Solicitar vacación.', reacciones: { '👍': 22 } },
      { dia: 'Ayer', hora: '16:20', titulo: 'Canasta navideña 🎄', texto: 'Se entrega la segunda semana de diciembre en cada sucursal. Si no puede recogerla, avise en su sucursal y se la guardan.', reacciones: { '❤️': 48, '👍': 31 } },
    ],
  },
  {
    id: 'interna', nombre: 'Comunicación interna', personas: 412,
    publicaciones: [
      { dia: 'Lun', hora: '11:30', titulo: 'Town Hall trimestral', texto: 'El lunes a las 10:00 en el auditorio de la oficina central y por videollamada. Contaremos los resultados del trimestre.', reacciones: { '👍': 37, '🎉': 12 } },
    ],
  },
]

// El grupo del área: los primeros mensajes, de la gente que esté en ella.
export const MENSAJES_GRUPO = [
  { texto: 'Buen día equipo 👋 Hoy subo el componente del calendario.', hora: '09:12' },
  { texto: 'Perfecto, lo pruebo en la tarde.', hora: '09:20' },
  { texto: '¿Alguien revisó el PR del calendario?', hora: '09:40' },
]
export const NO_LEIDOS_GRUPO = 3

export const DIRECTOS = [
  { nombre: 'Martín Solano', mensajes: [
    { de: 'Martín Solano', texto: '¿Me pasa el archivo de la reunión de ayer?', hora: '10:02' },
    { de: 'yo', texto: 'Perfecto, se lo mando ahora.', hora: '10:16' },
  ] },
  { nombre: 'Ana Martínez Ruiz', noLeidos: 1, mensajes: [
    { de: 'yo', texto: 'Le dejé el informe en la carpeta compartida.', hora: '17:40', dia: 'Ayer' },
    { de: 'Ana Martínez Ruiz', texto: 'Gracias por la ayuda con el informe 🙌', hora: '18:05', dia: 'Ayer' },
  ] },
  { nombre: 'Carolina Vega', mensajes: [
    { de: 'Carolina Vega', texto: 'Le paso el enlace del tablero', hora: '15:10', dia: 'Mar' },
  ] },
  { nombre: 'Diego Morales', mensajes: [
    { de: 'Diego Morales', texto: '¿Almorzamos el viernes?', hora: '12:48', dia: 'Mar' },
  ] },
]

// La historia de un chat uno a uno, para que la lista y el chat del organigrama digan lo mismo.
export const historiaCon = nombre => DIRECTOS.find(d => d.nombre === nombre)?.mensajes || []
