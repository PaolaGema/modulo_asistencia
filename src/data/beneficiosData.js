/* ── LOS BENEFICIOS DE LA EMPRESA (los del colaborador, en Mis beneficios del teléfono) ──
   De ejemplo para FarmaVida, en cinco grupos. Cada uno dice qué es, cómo se usa y sus condiciones;
   `estado` es lo que se ve en su fila (activo, disponible, inscrito, una fecha o un convenio) y `accion`
   lo que se puede hacer desde su vista:
     · 'dia'       — pedir el día libre de cumpleaños (abre el permiso con el día puesto)
     · 'reembolso' — pedir un reembolso del fondo (con el curso, el monto y la factura)
     · 'codigo'    — mostrar el código en caja
   Los montos y condiciones son de ejemplo: los define RR.HH. */

export const GRUPOS = ['Salud', 'Tiempo', 'Desarrollo', 'Familia', 'Descuentos']

export const FONDO_ANUAL = 1500

export const BENEFICIOS = [
  {
    id: 'seguro', grupo: 'Salud', icono: 'salud', titulo: 'Seguro de salud complementario', linea: 'Usted y su familia directa', estado: 'activo',
    que: 'Cubre consultas, exámenes e internación en la red de clínicas del convenio, para usted, su cónyuge y sus hijos.',
    pasos: ['Muestre su carnet de identidad en la clínica.', 'Diga que es del plan corporativo de FarmaVida.', 'Lo que no cubre el seguro lo paga en caja.'],
    datos: [['Aseguradora', 'Nacional Seguros'], ['Póliza', '04-55821 · Plan familiar'], ['Emergencias', '800 10 2020, las 24 horas']],
  },
  {
    id: 'chequeo', grupo: 'Salud', icono: 'chequeo', titulo: 'Chequeo médico anual', linea: 'Gratis en la clínica del convenio', estado: 'disponible',
    que: 'Un chequeo completo al año: análisis de sangre, presión, vista y una consulta general.',
    pasos: ['Pida su cita llamando a la clínica.', 'Vaya en ayunas.', 'Los resultados le llegan a su correo.'],
    datos: [['Dónde', 'Clínica Los Andes, todas las sedes'], ['Cuándo', 'Una vez al año'], ['Citas', '2 277 4400']],
  },
  {
    id: 'cumple', grupo: 'Tiempo', icono: 'regalo', titulo: 'Día libre de cumpleaños', linea: 'Un día libre en su mes de cumpleaños', accion: 'dia',
    que: 'Un día libre pagado en el mes de su cumpleaños. Si cae en fin de semana o feriado, lo puede tomar cualquier otro día de ese mes.',
    pasos: ['Toque «Pedir mi día»: el día de su cumpleaños ya está puesto.', 'Revise la papeleta y envíela.', 'RR.HH. la aprueba como cualquier permiso.'],
    datos: [['Se pide', 'Con 5 días de anticipación'], ['No descuenta', 'Vacaciones ni sueldo']],
  },
  {
    id: 'viernes', grupo: 'Tiempo', icono: 'reloj', titulo: 'Viernes corto', linea: 'Salida a las 16:00 un viernes al mes', estado: 'uno',
    que: 'Un viernes al mes puede salir a las 16:00. Lo acuerda con su jefe y se marca la salida como siempre.',
    pasos: ['Acuérdelo con su jefe durante la semana.', 'Ese viernes marque su salida a las 16:00.'],
    datos: [['Cuántos', 'Uno por mes, no se acumula'], ['Quién', 'Todo el personal administrativo']],
  },
  {
    id: 'fondo', grupo: 'Desarrollo', icono: 'crecer', titulo: 'Fondo de capacitación', linea: 'Para cursos, diplomados o certificaciones', accion: 'reembolso', saldo: true,
    que: `Bs ${FONDO_ANUAL.toLocaleString('es-BO')} al año para cursos, diplomados o certificaciones relacionados con su trabajo. Lo que no use se pierde el 31 de diciembre.`,
    pasos: ['Pague el curso y pida la factura a nombre de FarmaVida.', 'Pida el reembolso con la factura.', 'RR.HH. se lo paga con el sueldo del mes siguiente.'],
    datos: [['Por año', `Bs ${FONDO_ANUAL.toLocaleString('es-BO')}`], ['Se usa hasta', '31 de diciembre'], ['Factura', 'A nombre de FarmaVida S.R.L.']],
  },
  {
    id: 'ingles', grupo: 'Desarrollo', icono: 'mundo', titulo: 'Clases de inglés', linea: 'Martes y jueves, en línea', estado: 'inscrito',
    que: 'Clases de inglés en grupo, dos veces por semana, en línea y en horario de trabajo.',
    pasos: ['Las clases son martes y jueves de 8:00 a 9:00.', 'El enlace le llega a su correo.'],
    datos: [['Su nivel', 'Intermedio'], ['Profesora', 'Laura Paz']],
  },
  {
    id: 'nacimiento', grupo: 'Familia', icono: 'familia', titulo: 'Bono por nacimiento', linea: 'Bs 1.000 por cada hijo o hija',
    que: 'Un bono de Bs 1.000 por el nacimiento o la adopción de cada hijo o hija, además de lo que da la ley.',
    pasos: ['Pida la licencia por paternidad o maternidad.', 'Suba el certificado de nacimiento.', 'El bono llega con el sueldo del mes siguiente.'],
    datos: [['Monto', 'Bs 1.000'], ['Se pide', 'Hasta 3 meses después']],
  },
  {
    id: 'canasta', grupo: 'Familia', icono: 'regalo', titulo: 'Canasta navideña', linea: 'Se entrega la segunda semana de diciembre', estado: 'diciembre',
    que: 'Una canasta con productos para la cena de Navidad, para cada persona de la empresa.',
    pasos: ['Se entrega en su sucursal.', 'Si no puede recogerla, avise a RR.HH. para que se la guarden.'],
    datos: [['Cuándo', 'Segunda semana de diciembre'], ['Dónde', 'En su sucursal']],
  },
  {
    id: 'descuento', grupo: 'Descuentos', icono: 'tienda', titulo: '20 % en FarmaVida', linea: 'En todas las sucursales', estado: 'activo', accion: 'codigo',
    que: 'Un 20 % de descuento en todas las compras en FarmaVida, para usted y su familia directa.',
    pasos: ['Muestre su código en caja antes de pagar.', 'El descuento se aplica solo.'],
    datos: [['Dónde', 'Todas las sucursales'], ['Hasta', 'Bs 800 al mes']],
  },
  {
    id: 'gimnasio', grupo: 'Descuentos', icono: 'pesa', titulo: '30 % en el gimnasio', linea: 'Convenio con Bodytech', estado: 'convenio',
    que: 'Un 30 % de descuento en la mensualidad de Bodytech, en cualquiera de sus sedes.',
    pasos: ['Inscríbase en Bodytech con su carnet de identidad.', 'Diga que es del convenio de FarmaVida.'],
    datos: [['Dónde', 'Todas las sedes de Bodytech'], ['Para', 'Usted']],
  },
  {
    id: 'optica', grupo: 'Descuentos', icono: 'ojo', titulo: '15 % en ópticas', linea: 'Convenio con Óptica Visión', estado: 'convenio',
    que: 'Un 15 % en lentes y monturas en Óptica Visión, para usted y su familia directa.',
    pasos: ['Muestre su código de FarmaVida en la óptica.'],
    datos: [['Dónde', 'Óptica Visión, todas las sucursales'], ['Para', 'Usted y su familia']],
  },
]

/* Lo que ya se usó del fondo en la demo, por persona. Lo que se pida desde el teléfono se suma. */
export const USOS_FONDO = {
  'Carlos Mendoza Ríos': [{ curso: 'Curso de React avanzado', monto: 400, cuando: 'agosto', estado: 'pagado' }],
}
