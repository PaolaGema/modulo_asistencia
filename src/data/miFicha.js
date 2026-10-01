/* LA FICHA VISTA POR SU DUEÑO — LOS DATOS DE EJEMPLO.
   Carlos (teléfono), María y Juan (web) no están en el directorio, así que traen su ficha aquí. Está
   COMPLETA a propósito: cada sección que RR.HH. registra tiene algo, hay dos contactos de
   emergencia, cónyuge, hijos, beneficiarios, garante, licencias —una por vencer y otra vencida—,
   equipos, software… Es para que se vea todo lo que la vista del colaborador tiene que resolver,
   no una muestra de tres datos.

   LAS CLAVES SON LAS DEL ESTUDIO ('1.1', '2.3#2'), las mismas que guarda la ficha de RR.HH., y
   los valores de las listas son opciones reales de sus catálogos. Así esta vista se dibuja con
   las mismas funciones que la de RR.HH. (`tarjetasDe`) y no con una lista paralela que un día
   diría otra cosa. Las copias de un bloque repetido llevan `#n` y su cuenta va en `__n_<grupo>`. */

const pdf = nombre => ({ nombre })

const CARLOS = {
  '0.1': 'no',
  // Datos personales
  '1.1': 'Carlos', '1.2': 'Andrés', '1.4': 'Mendoza', '1.5': 'Ríos', '1.9': pdf('Foto_Carlos_Mendoza.jpg'),
  // Documento de identidad y secundario
  '1.14': 'Bolivia', '1.10': 'Documento nacional de identidad', '1.11': '7845123', '1.12': 'LP', '1.13': '1F',
  '1.15': '2019-11-22', '1.16': '2029-11-22', '1.17': pdf('CI_Carlos_Mendoza.pdf'), '1.29': 'Casado(a)',
  '__n_docsec': 1, '1.20g': 'Bolivia', '1.20a': 'Pasaporte', '1.20b': 'EG482913', '1.20e': '2023-04-10',
  '1.20f': '2033-04-10', '1.20h': pdf('Pasaporte_Carlos_Mendoza.pdf'),
  // Nacimiento
  '1.21': '1996-03-14', '1.27': 'M · Masculino', '1.23': 'Bolivia', '1.22': 'La Paz', '1.24': 'si',
  '1.21b': pdf('Certificado_nacimiento_Carlos.pdf'),
  // Residencia
  '1.42': 'Bolivia', '1.43': 'La Paz', '1.44': 'Murillo', '1.45': 'La Paz', '1.46': 'Sopocachi',
  '1.47': 'Calle Belisario Salinas', '1.48': '412', '1.49': 'Edificio Illimani, piso 3, dpto. 3B',
  '1.50': 'A media cuadra de la plaza Abaroa', '1.53': pdf('Croquis_domicilio_Carlos.pdf'),
  // Contacto y patrimonio
  '1.36': '+591 712 34 567', '1.38': '2 241 5530', '1.39': 'carlos.mendoza@gmail.com',
  '1.34': 'no', '1.35': 'si',
  // Licencias: la de conducir, por vencer
  '__n_licencias': 1, '1.72': 'Licencia de conducir', '1.75': 'Bolivia', '1.73': '7845123', '1.74': 'P · Particular',
  '1.76': '2021-11-10', '1.77': '2026-11-10', '1.78b': 'no', '1.79': pdf('Licencia_conducir_Carlos.pdf'),
  // Datos médicos
  '1.54': 'O+', '1.56': 'si', '1.56b': 'Alergia a la penicilina', '1.58': 'no', '1.57': 'no',
  '1.59': 'si', '1.59b': 'Pausas activas cada dos horas por tendinitis en la muñeca derecha', '1.60': 'no',
  '1.63': 'si', '1.64': 'Nacional Seguros', '1.65': 'NS-2291-4478',
  // Preferencias
  'ra.f1': 'Audífonos inalámbricos\nLibro de diseño de interfaces\nCafé de especialidad',
  'ra.f4': 'Curso de React avanzado\nViaje al Salar de Uyuni',

  // Contactos de emergencia: dos
  '__n_emergencia': 2,
  '2.1': 'Rosa Ríos de Mendoza', '2.2': 'Madre', '2.3': '+591 720 98 811', '2.4': '2 242 1180',
  '2.5': 'rosa.rios@gmail.com', '2.6': 'Av. 6 de Agosto 2230, Sopocachi, La Paz', '2.7': 'no',
  '2.1#2': 'Daniela Quiroga Paz', '2.2#2': 'Cónyuge', '2.3#2': '+591 767 44 210', '2.4#2': '2 241 5530',
  '2.5#2': 'daniela.quiroga@gmail.com', '2.6#2': 'Calle Belisario Salinas 412, Sopocachi, La Paz', '2.7#2': 'si',
  // Cónyuge
  '2.9': 'Daniela Quiroga Paz', '2.10': 'Documento nacional de identidad', '2.10b': '8123456 LP',
  '2.11': '1997-08-02', '2.12': 'Boliviana', '2.13': 'Arquitecta', '2.14': 'Estudio Quiroga & Asociados',
  '2.15': '+591 767 44 210',
  // Hijos
  '__n_hijos': 1,
  '2.20': 'Mateo Mendoza Quiroga', '2.21': 'Documento nacional de identidad', '2.21b': '15230441 LP',
  '2.22': '2022-05-09', '2.23': 'M · Masculino', '2.24': 'Boliviana', '2.25': 'Kínder Mis Pequeños Pasos',
  '2.26': 'Inicial', '2.29': 'no',
  // Beneficiarios
  '__n_herederos': 2,
  '2.31': 'Daniela Quiroga Paz', '2.32': 'Cónyuge', '2.33': 'Documento nacional de identidad', '2.33b': '8123456 LP',
  '2.34': '1997-08-02', '2.35': '50',
  '2.31#2': 'Mateo Mendoza Quiroga', '2.32#2': 'Hijo(a)', '2.33#2': 'Documento nacional de identidad',
  '2.33b#2': '15230441 LP', '2.34#2': '2022-05-09', '2.35#2': '50',
  // Garante y garantía
  '2.39': 'Jorge', '2.39b': 'Mendoza Aliaga', '2.40': 'Documento nacional de identidad', '2.40b': '3345120 LP',
  '2.40e': pdf('CI_garante_Jorge_Mendoza.pdf'), '2.41': '+591 715 22 904',
  '2.42': 'Av. 6 de Agosto 2230, Sopocachi, La Paz', '2.43': '1965-02-18', '2.43b': 'Oruro', '2.44': 'Casado(a)',
  '2.44a': 'Rosa Ríos de Mendoza', '2.44b': '3345987 LP', '2.45': 'Inmueble',
  '2.45d': 'Departamento en Sopocachi, 95 m²', '2.45n': 'Folio real 2.01.1.99.0045123', '2.45v': '450000',
  '2.46': pdf('Folio_real_garantia.pdf'),
  '1.62': 'no',

  // Información organizacional
  '3.1': 'FV-TI-0213', '3.2': 'FarmaVida S.A.', '3.7': 'Occidente', '3.8': 'Sucursal La Paz', '3.10': 'Oficina Central',
  '3.3': 'Corporativo', '3.5': 'Tecnología', '3.11': 'Desarrollador Frontend', '3.12': 'Administrativo',
  '3.42b': 'Híbrido', '3.13': 'Andrea Vargas Soliz',
  '3.22': 'cmendoza@farmavida.com.bo', '3.23': '+591 690 11 213',
  // Contrato
  '3.25': '2025-02-02', '3.32': '1 · Tiempo indefinido', '3.33': '1 · Escrito', '3.35': 'CT-2025-0148',
  '3.39': 'Emilia Pessoa Rotger', '3.40': 'Nuevo puesto por crecimiento del equipo de producto digital', '3.42c': 'no',
  // Compensación y pago
  '3.65': '9800', '3.67': 'Mensual', '3.68': 'Mensual', '3.69a': 'si', '3.69b': 'Porcentaje del haber básico',
  '3.69c': '30', '3.73': 'si', '3.74': 'si', '3.77': 'no', '3.81': 'si', '3.83': 'no',
  '3.88': 'Transferencia bancaria', '3.89': 'Banco Unión', '3.90': 'Caja de ahorro', '3.91': '1-4417-2291',
  '3.93': 'BOB · Boliviano', '3.95': 'si',
  // Afiliaciones
  '3.43': 'si', '3.44': 'Gestora Pública', '3.45': '38471920', '3.46': 'La Paz', '3.47': 'D · Dependiente', '3.48': 'no',
  '3.49': 'si', '3.50': '1 · Caja Nacional de Salud (C.N.S.)', '3.51': '96-0314-MRC', '3.52': 'La Paz',
  '3.53': '2025-02-10', '3.55': '001 · La Paz', '3.56': 'si', '3.57': 'RC-7845-13',

  // Recursos y activos
  '__n_equipos': 2,
  'ra.e1': 'Computadora portátil', 'ra.e2': 'Cómputo', 'ra.e3': 'Dell', 'ra.e4': 'Latitude 5440', 'ra.e5': 'CN-0XK21-7731',
  'ra.e6': 'AF-TI-0213', 'ra.e7': 'Nuevo', 'ra.e8': '2025-02-03', 'ra.e11': 'Luis Paredes (Soporte TI)',
  'ra.e12': pdf('Acta_entrega_laptop.pdf'), 'ra.e13': 'Incluye cargador y mochila',
  'ra.e1#2': 'Monitor', 'ra.e2#2': 'Periférico', 'ra.e3#2': 'LG', 'ra.e4#2': '27UL500', 'ra.e5#2': '204NTAB5K112',
  'ra.e6#2': 'AF-TI-0588', 'ra.e7#2': 'Bueno', 'ra.e8#2': '2025-02-03', 'ra.e11#2': 'Luis Paredes (Soporte TI)',
  'ra.e12#2': pdf('Acta_entrega_monitor.pdf'),
  '__n_uniformes': 1,
  'ra.u1': 'Camisa o polera', 'ra.u2': 'M', 'ra.u3': '3', 'ra.u4': '2025-02-03', 'ra.u7': 'Nuevo',
  'ra.u8': 'Carla Ríos (Administración)', 'ra.u9': pdf('Acta_entrega_poleras.pdf'), 'ra.u10': 'Poleras con logo institucional',
  '__n_software': 2,
  'ra.s1': 'Figma Professional', 'ra.s2': 'Suscripción', 'ra.s3': 'cmendoza', 'ra.s4': 'cmendoza@farmavida.com.bo',
  'ra.s5': '2025-02-03', 'ra.s6': '2026-12-31', 'ra.s8': 'Activa', 'ra.s9': 'Luis Paredes (Soporte TI)',
  'ra.s1#2': 'GitHub Copilot', 'ra.s2#2': 'Por usuario', 'ra.s3#2': 'cmendoza-fv', 'ra.s4#2': 'cmendoza@farmavida.com.bo',
  'ra.s5#2': '2025-02-03', 'ra.s6#2': '2026-12-31', 'ra.s8#2': 'Activa', 'ra.s9#2': 'Luis Paredes (Soporte TI)',
  // Documentos agregados
  '__n_docsExtra': 1, 'ex.2': 'Certificado de trabajo anterior', 'ex.4': pdf('Certificado_trabajo_Softek.pdf'),
  // Acceso al sistema
  '7.2': 'cmendoza', '7.6': 'Colaborador',
}

const MARIA = {
  '0.1': 'no',
  '1.1': 'María', '1.2': 'Fernanda', '1.4': 'López', '1.5': 'Torres', '1.6': 'de Paz', '1.9': pdf('Foto_Maria_Lopez.jpg'),
  '1.14': 'Bolivia', '1.10': 'Documento nacional de identidad', '1.11': '5521907', '1.12': 'SC',
  '1.15': '2018-04-30', '1.16': '2028-04-30', '1.17': pdf('CI_Maria_Lopez.pdf'), '1.29': 'Casado(a)',
  '1.21': '1992-09-08', '1.27': 'F · Femenino', '1.23': 'Bolivia', '1.22': 'Santa Cruz de la Sierra', '1.24': 'si',
  '1.21b': pdf('Certificado_nacimiento_Maria.pdf'),
  '1.42': 'Bolivia', '1.43': 'Santa Cruz', '1.44': 'Andrés Ibáñez', '1.45': 'Santa Cruz de la Sierra',
  '1.46': 'Equipetrol Norte', '1.47': 'Av. Beni', '1.48': '2140', '1.49': 'Condominio Los Tajibos, casa 12',
  '1.50': 'Entre 3.er y 4.º anillo, portón negro', '1.53': pdf('Croquis_domicilio_Maria.pdf'),
  '1.36': '+591 760 11 234', '1.38': '3 342 8870', '1.39': 'maria.lopez.t@gmail.com',
  '1.34': 'si', '1.35': 'no',
  // Dos licencias: la de conducir vigente y el certificado de No Violencia, vencido
  '__n_licencias': 2,
  '1.72': 'Licencia de conducir', '1.75': 'Bolivia', '1.73': '5521907', '1.74': 'B · Profesional',
  '1.76': '2023-01-20', '1.77': '2028-01-20', '1.78b': 'no', '1.79': pdf('Licencia_conducir_Maria.pdf'),
  '1.72#2': 'Certificado de No Violencia', '1.75#2': 'Bolivia', '1.73#2': 'CNV-SC-2024-88213',
  '1.76#2': '2024-03-01', '1.77#2': '2025-03-01', '1.78b#2': 'no', '1.79#2': pdf('Certificado_No_Violencia_Maria.pdf'),
  '1.54': 'A+', '1.56': 'no', '1.58': 'si', '1.58b': 'Inhalador de salbutamol en caso de crisis', '1.57': 'si',
  '1.57b': 'Asma leve', '1.59': 'no', '1.60': 'no', '1.63': 'no',
  'ra.f1': 'Set de plantas de interior\nAgenda de cuero',
  'ra.f4': 'Cena en familia\nTaller de negociación',

  '__n_emergencia': 2,
  '2.1': 'Jorge Paz Arteaga', '2.2': 'Cónyuge', '2.3': '+591 773 34 590', '2.4': '3 342 8870',
  '2.5': 'jorge.paz@gmail.com', '2.6': 'Av. Beni 2140, Equipetrol Norte, Santa Cruz', '2.7': 'si',
  '2.1#2': 'Carmen Torres Vaca', '2.2#2': 'Madre', '2.3#2': '+591 721 55 016', '2.4#2': '3 336 2104',
  '2.5#2': 'carmen.torres@hotmail.com', '2.6#2': 'Calle Sucre 318, zona Centro, Santa Cruz', '2.7#2': 'no',
  '2.9': 'Jorge Paz Arteaga', '2.10': 'Documento nacional de identidad', '2.10b': '4810225 SC', '2.11': '1990-01-25',
  '2.12': 'Boliviana', '2.13': 'Ingeniero industrial', '2.14': 'Ingenio Guabirá', '2.15': '+591 773 34 590',
  '__n_hijos': 2,
  '2.20': 'Valentina Paz López', '2.21': 'Documento nacional de identidad', '2.21b': '14882310 SC', '2.22': '2021-02-11',
  '2.23': 'F · Femenino', '2.24': 'Boliviana', '2.25': 'Colegio Alemán Santa Cruz', '2.26': 'Inicial', '2.29': 'no',
  '2.20#2': 'Tomás Paz López', '2.21#2': 'Documento nacional de identidad', '2.21b#2': '16013347 SC', '2.22#2': '2024-06-30',
  '2.23#2': 'M · Masculino', '2.24#2': 'Boliviana', '2.25#2': 'Guardería Pasitos', '2.26#2': 'Maternal', '2.29#2': 'no',
  '__n_herederos': 3,
  '2.31': 'Jorge Paz Arteaga', '2.32': 'Cónyuge', '2.33': 'Documento nacional de identidad', '2.33b': '4810225 SC',
  '2.34': '1990-01-25', '2.35': '50',
  '2.31#2': 'Valentina Paz López', '2.32#2': 'Hijo(a)', '2.33#2': 'Documento nacional de identidad', '2.33b#2': '14882310 SC',
  '2.34#2': '2021-02-11', '2.35#2': '25',
  '2.31#3': 'Tomás Paz López', '2.32#3': 'Hijo(a)', '2.33#3': 'Documento nacional de identidad', '2.33b#3': '16013347 SC',
  '2.34#3': '2024-06-30', '2.35#3': '25',
  '2.39': 'Hugo', '2.39b': 'López Suárez', '2.40': 'Documento nacional de identidad', '2.40b': '2290114 SC',
  '2.40e': pdf('CI_garante_Hugo_Lopez.pdf'), '2.41': '+591 700 18 442', '2.42': 'Calle Sucre 318, zona Centro, Santa Cruz',
  '2.43': '1962-10-03', '2.43b': 'Montero', '2.44': 'Casado(a)', '2.44a': 'Carmen Torres Vaca', '2.44b': '2290887 SC',
  '2.45': 'Vehículo', '2.45d': 'Vagoneta Toyota Rav4 2019', '2.45n': 'RUAT 3398-KDX', '2.45v': '165000',
  '2.46': pdf('RUAT_garantia_vehiculo.pdf'),
  '1.62': 'no',

  '3.1': 'FV-VE-0077', '3.2': 'FarmaVida S.A.', '3.7': 'Oriente', '3.8': 'Sucursal Santa Cruz', '3.10': 'Oficina Santa Cruz',
  '3.3': 'Retail', '3.5': 'Ventas', '3.11': 'Ejecutiva Comercial', '3.12': 'Administrativo', '3.42b': 'Presencial',
  '3.13': 'Ricardo Salinas Paz', '3.22': 'mlopez@farmavida.com.bo', '3.23': '+591 690 12 277',
  '3.25': '2024-03-15', '3.32': '1 · Tiempo indefinido', '3.33': '1 · Escrito', '3.35': 'CT-2024-0061',
  '3.38': '2025-03-15', '3.39': 'Natalia Ziade Mareño', '3.40': 'Reemplazo por promoción de la ejecutiva anterior',
  '3.42c': 'si',
  '3.65': '7200', '3.67': 'Mensual', '3.68': 'Mensual', '3.69a': 'no', '3.73': 'si', '3.74': 'si', '3.77': 'no',
  '3.81': 'si', '3.83': 'no', '3.88': 'Transferencia bancaria', '3.89': 'Banco Mercantil Santa Cruz',
  '3.90': 'Caja de ahorro', '3.91': '4011-0932-55', '3.93': 'BOB · Boliviano', '3.95': 'si',
  '3.43': 'si', '3.44': 'Gestora Pública', '3.45': '29013377', '3.46': 'Santa Cruz', '3.47': 'D · Dependiente', '3.48': 'no',
  '3.49': 'si', '3.50': '2 · Caja Petrolera de Salud (C.P.S.)', '3.51': '92-0908-LTM', '3.52': 'Santa Cruz',
  '3.53': '2024-03-22', '3.55': '002 · Santa Cruz', '3.56': 'si', '3.57': 'RC-5521-07',

  '__n_equipos': 2,
  'ra.e1': 'Celular', 'ra.e2': 'Comunicación', 'ra.e3': 'Samsung', 'ra.e4': 'Galaxy A54', 'ra.e5': 'R58W41KXJ2A',
  'ra.e6': 'AF-VE-0231', 'ra.e7': 'Bueno', 'ra.e8': '2024-03-16', 'ra.e11': 'Luis Paredes (Soporte TI)',
  'ra.e12': pdf('Acta_entrega_celular.pdf'), 'ra.e13': 'Línea corporativa 69012277',
  'ra.e1#2': 'Computadora portátil', 'ra.e2#2': 'Cómputo', 'ra.e3#2': 'Lenovo', 'ra.e4#2': 'ThinkPad E14',
  'ra.e5#2': 'PF3K9XZA', 'ra.e6#2': 'AF-VE-0077', 'ra.e7#2': 'Bueno', 'ra.e8#2': '2024-03-16',
  'ra.e11#2': 'Luis Paredes (Soporte TI)', 'ra.e12#2': pdf('Acta_entrega_laptop_Maria.pdf'),
  '__n_uniformes': 1,
  'ra.u1': 'Chaqueta', 'ra.u2': 'M', 'ra.u3': '2', 'ra.u4': '2024-03-16', 'ra.u5': '2026-03-16', 'ra.u7': 'Bueno',
  'ra.u8': 'Carla Ríos (Administración)', 'ra.u9': pdf('Acta_entrega_blazer.pdf'), 'ra.u10': 'Blazer institucional azul',
  '__n_vehiculos': 1,
  'ra.v1': 'Camioneta', 'ra.v2': 'Toyota', 'ra.v3': 'Hilux', 'ra.v4': '4521-KTR', 'ra.v5': '2022', 'ra.v6': '2024-04-02',
  'ra.v8': 'Bueno', 'ra.v9': 'Ricardo Salinas Paz', 'ra.v10': 'Para visitas a farmacias de la zona norte',
  '__n_software': 1,
  'ra.s1': 'CRM comercial', 'ra.s2': 'Por usuario', 'ra.s3': 'mlopez', 'ra.s4': 'mlopez@farmavida.com.bo',
  'ra.s5': '2024-03-16', 'ra.s6': '2027-03-15', 'ra.s8': 'Activa', 'ra.s9': 'Luis Paredes (Soporte TI)',
  '__n_docsExtra': 1, 'ex.2': 'Certificado de matrimonio', 'ex.4': pdf('Certificado_matrimonio_Maria.pdf'),
  '7.2': 'mlopez', '7.6': 'Colaborador',
}

/* JUAN TAMBIÉN ES COLABORADOR. Administra RR.HH., pero su ficha la registra la empresa igual que
   la de cualquiera, y en «Mi perfil» la mira como todos: no por tener el rol de administrador
   deja de tener contrato, haber y contactos de emergencia. */
const JUAN = {
  '0.1': 'no',
  '1.1': 'Juan', '1.2': 'Carlos', '1.4': 'Pérez', '1.5': 'Gómez', '1.9': pdf('Foto_Juan_Perez.jpg'),
  '1.14': 'Bolivia', '1.10': 'Documento nacional de identidad', '1.11': '4412087', '1.12': 'LP',
  '1.15': '2020-08-14', '1.16': '2030-08-14', '1.17': pdf('CI_Juan_Perez.pdf'), '1.29': 'Casado(a)',
  '1.21': '1985-11-02', '1.27': 'M · Masculino', '1.23': 'Bolivia', '1.22': 'Cochabamba', '1.24': 'si',
  '1.21b': pdf('Certificado_nacimiento_Juan.pdf'),
  '1.42': 'Bolivia', '1.43': 'La Paz', '1.44': 'Murillo', '1.45': 'La Paz', '1.46': 'Calacoto',
  '1.47': 'Calle 21', '1.48': '8240', '1.49': 'Condominio Las Retamas, casa 4',
  '1.50': 'A dos cuadras de la avenida Ballivián', '1.53': pdf('Croquis_domicilio_Juan.pdf'),
  '1.36': '+591 706 21 448', '1.38': '2 279 3310', '1.39': 'juan.perez.gomez@gmail.com',
  '1.34': 'si', '1.35': 'si',
  '__n_licencias': 1, '1.72': 'Licencia de conducir', '1.75': 'Bolivia', '1.73': '4412087', '1.74': 'P · Particular',
  '1.76': '2022-05-18', '1.77': '2027-05-18', '1.78b': 'no', '1.79': pdf('Licencia_conducir_Juan.pdf'),
  '1.54': 'B+', '1.56': 'no', '1.58': 'no', '1.57': 'no', '1.59': 'no', '1.60': 'no',
  '1.63': 'si', '1.64': 'Nacional Seguros', '1.65': 'NS-1180-2207',
  'ra.f1': 'Libro de liderazgo de equipos\nCafé de especialidad',
  'ra.f4': 'Diplomado en gestión del talento\nFin de semana en Coroico',

  '__n_emergencia': 2,
  '2.1': 'Patricia Rojas Vargas', '2.2': 'Cónyuge', '2.3': '+591 715 66 092', '2.4': '2 279 3310',
  '2.5': 'patricia.rojas@gmail.com', '2.6': 'Calle 21 n.º 8240, Calacoto, La Paz', '2.7': 'si',
  '2.1#2': 'Luis Pérez Andrade', '2.2#2': 'Padre', '2.3#2': '+591 722 10 385', '2.4#2': '4 425 1907',
  '2.5#2': 'luis.perez.a@hotmail.com', '2.6#2': 'Av. América 1150, Cochabamba', '2.7#2': 'no',
  '2.9': 'Patricia Rojas Vargas', '2.10': 'Documento nacional de identidad', '2.10b': '4590312 LP',
  '2.11': '1987-04-21', '2.12': 'Boliviana', '2.13': 'Médica pediatra', '2.14': 'Clínica Alemana',
  '2.15': '+591 715 66 092',
  '__n_hijos': 2,
  '2.20': 'Sofía Pérez Rojas', '2.21': 'Documento nacional de identidad', '2.21b': '12740551 LP', '2.22': '2014-09-03',
  '2.23': 'F · Femenino', '2.24': 'Boliviana', '2.25': 'Colegio San Ignacio', '2.26': 'Primaria', '2.29': 'no',
  '2.20#2': 'Mateo Pérez Rojas', '2.21#2': 'Documento nacional de identidad', '2.21b#2': '14105283 LP', '2.22#2': '2018-02-27',
  '2.23#2': 'M · Masculino', '2.24#2': 'Boliviana', '2.25#2': 'Colegio San Ignacio', '2.26#2': 'Inicial', '2.29#2': 'no',
  '__n_herederos': 3,
  '2.31': 'Patricia Rojas Vargas', '2.32': 'Cónyuge', '2.33': 'Documento nacional de identidad', '2.33b': '4590312 LP',
  '2.34': '1987-04-21', '2.35': '50',
  '2.31#2': 'Sofía Pérez Rojas', '2.32#2': 'Hijo(a)', '2.33#2': 'Documento nacional de identidad', '2.33b#2': '12740551 LP',
  '2.34#2': '2014-09-03', '2.35#2': '25',
  '2.31#3': 'Mateo Pérez Rojas', '2.32#3': 'Hijo(a)', '2.33#3': 'Documento nacional de identidad', '2.33b#3': '14105283 LP',
  '2.34#3': '2018-02-27', '2.35#3': '25',
  '1.62': 'no',

  '3.1': 'FV-RH-0004', '3.2': 'FarmaVida S.A.', '3.7': 'Occidente', '3.8': 'Sucursal La Paz', '3.10': 'Oficina Central',
  '3.3': 'Corporativo', '3.5': 'RH', '3.11': 'Gerente de Recursos Humanos', '3.12': 'Administrativo',
  '3.42b': 'Presencial', '3.13': 'Ricardo Ballivián',
  '3.22': 'jperez@farmavida.com.bo', '3.23': '+591 690 10 004',
  '3.25': '2022-01-10', '3.32': '1 · Tiempo indefinido', '3.33': '1 · Escrito', '3.35': 'CT-2022-0007',
  '3.39': 'Ricardo Ballivián', '3.40': 'Creación de la gerencia de Recursos Humanos', '3.42c': 'no',
  '3.65': '18500', '3.67': 'Mensual', '3.68': 'Mensual', '3.69a': 'no', '3.73': 'si', '3.74': 'si', '3.77': 'no',
  '3.81': 'si', '3.83': 'no', '3.88': 'Transferencia bancaria', '3.89': 'Banco Nacional de Bolivia',
  '3.90': 'Caja de ahorro', '3.91': '1500-2280-41', '3.93': 'BOB · Boliviano', '3.95': 'si',
  '3.43': 'si', '3.44': 'Gestora Pública', '3.45': '27190044', '3.46': 'La Paz', '3.47': 'D · Dependiente', '3.48': 'no',
  '3.49': 'si', '3.50': '1 · Caja Nacional de Salud (C.N.S.)', '3.51': '85-1102-PGJ', '3.52': 'La Paz',
  '3.53': '2022-01-17', '3.55': '001 · La Paz', '3.56': 'si', '3.57': 'RC-4412-08',

  '__n_equipos': 2,
  'ra.e1': 'Computadora portátil', 'ra.e2': 'Cómputo', 'ra.e3': 'HP', 'ra.e4': 'EliteBook 840 G9', 'ra.e5': '5CG2318KXQ',
  'ra.e6': 'AF-RH-0004', 'ra.e7': 'Bueno', 'ra.e8': '2023-03-06', 'ra.e11': 'Luis Paredes (Soporte TI)',
  'ra.e12': pdf('Acta_entrega_laptop_Juan.pdf'),
  'ra.e1#2': 'Celular', 'ra.e2#2': 'Comunicación', 'ra.e3#2': 'Samsung', 'ra.e4#2': 'Galaxy S23', 'ra.e5#2': 'R5CW31LMP8T',
  'ra.e6#2': 'AF-RH-0019', 'ra.e7#2': 'Bueno', 'ra.e8#2': '2024-02-12', 'ra.e11#2': 'Luis Paredes (Soporte TI)',
  'ra.e12#2': pdf('Acta_entrega_celular_Juan.pdf'), 'ra.e13#2': 'Línea corporativa 69010004',
  '__n_software': 1,
  'ra.s1': 'SoulyHR', 'ra.s2': 'Por usuario', 'ra.s3': 'jperez', 'ra.s4': 'jperez@farmavida.com.bo',
  'ra.s5': '2022-01-10', 'ra.s6': '2026-12-31', 'ra.s8': 'Activa', 'ra.s9': 'Luis Paredes (Soporte TI)',
  '__n_docsExtra': 1, 'ex.2': 'Título de Licenciatura en Psicología', 'ex.4': pdf('Titulo_Psicologia_Juan.pdf'),
  '7.2': 'jperez', '7.6': 'Administrador General',
}

const FICHAS = {
  'Juan Pérez Gómez': {
    area: 'Recursos Humanos', sucursal: 'Sucursal La Paz', actualizada: '2 jun 2026',
    ingreso: '10 Ene 2022', antiguedad: '4 años, 5 meses en la empresa', form: JUAN,
  },
  'Carlos Mendoza Ríos': {
    area: 'Tecnología', sucursal: 'Sucursal La Paz', actualizada: '12 jun 2026',
    ingreso: '2 Feb 2025', antiguedad: '1 año, 4 meses en la empresa', form: CARLOS,
  },
  'María López Torres': {
    area: 'Ventas', sucursal: 'Sucursal Santa Cruz', actualizada: '3 jun 2026',
    ingreso: '15 Mar 2024', antiguedad: '2 años, 3 meses en la empresa', form: MARIA,
  },
}

/* La ficha del usuario de la demo; quien no tiene una de ejemplo recibe `null` y la pantalla
   lo dice, en vez de inventarle datos. */
export const miFichaDe = nombre => FICHAS[nombre] || null
