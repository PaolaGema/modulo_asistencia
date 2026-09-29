/* ── LOS CÓDIGOS DE PAÍS DEL TELÉFONO ───────────────────────────────────
   El celular se pedía como una caja de texto, y quien vive o nació fuera tenía que saberse de
   memoria que el prefijo va delante y con un «+». Con esta lista el código se elige, y el número
   se escribe sin él.

   LA SIGLA Y NO LA BANDERA. Las banderas como emoji no se ven en Windows —salen dos letras
   sueltas— y como imagen son doscientos archivos. La sigla ISO se lee igual en todas partes y es
   lo que la bandera de Windows habría enseñado de todos modos.

   VARIOS PAÍSES COMPARTEN CÓDIGO: +1 es Estados Unidos, Canadá y buena parte del Caribe; +7 es
   Rusia y Kazajistán. Por eso el país elegido se guarda aparte del número —ver `CampoTelefono`— y,
   cuando no se sabe, un número «+1 …» se lee como del primero de la lista que lo tenga. */
export const CODIGOS_PAIS = [
  ['AF', 'Afganistán', '+93'], ['AL', 'Albania', '+355'], ['DE', 'Alemania', '+49'],
  ['AD', 'Andorra', '+376'], ['AO', 'Angola', '+244'], ['AG', 'Antigua y Barbuda', '+1'],
  ['SA', 'Arabia Saudita', '+966'], ['DZ', 'Argelia', '+213'], ['AR', 'Argentina', '+54'],
  ['AM', 'Armenia', '+374'], ['AU', 'Australia', '+61'], ['AT', 'Austria', '+43'],
  ['AZ', 'Azerbaiyán', '+994'], ['BS', 'Bahamas', '+1'], ['BD', 'Bangladés', '+880'],
  ['BB', 'Barbados', '+1'], ['BH', 'Baréin', '+973'], ['BE', 'Bélgica', '+32'],
  ['BZ', 'Belice', '+501'], ['BJ', 'Benín', '+229'], ['BY', 'Bielorrusia', '+375'],
  ['MM', 'Birmania', '+95'], ['BO', 'Bolivia', '+591'], ['BA', 'Bosnia y Herzegovina', '+387'],
  ['BW', 'Botsuana', '+267'], ['BR', 'Brasil', '+55'], ['BN', 'Brunéi', '+673'],
  ['BG', 'Bulgaria', '+359'], ['BF', 'Burkina Faso', '+226'], ['BI', 'Burundi', '+257'],
  ['BT', 'Bután', '+975'], ['CV', 'Cabo Verde', '+238'], ['KH', 'Camboya', '+855'],
  ['CM', 'Camerún', '+237'], ['CA', 'Canadá', '+1'], ['QA', 'Catar', '+974'],
  ['TD', 'Chad', '+235'], ['CZ', 'Chequia', '+420'], ['CL', 'Chile', '+56'],
  ['CN', 'China', '+86'], ['CY', 'Chipre', '+357'], ['CO', 'Colombia', '+57'],
  ['KM', 'Comoras', '+269'], ['CG', 'Congo', '+242'], ['CD', 'Congo (Rep. Democrática)', '+243'],
  ['KP', 'Corea del Norte', '+850'], ['KR', 'Corea del Sur', '+82'], ['CI', 'Costa de Marfil', '+225'],
  ['CR', 'Costa Rica', '+506'], ['HR', 'Croacia', '+385'], ['CU', 'Cuba', '+53'],
  ['DK', 'Dinamarca', '+45'], ['DM', 'Dominica', '+1'], ['EC', 'Ecuador', '+593'],
  ['EG', 'Egipto', '+20'], ['SV', 'El Salvador', '+503'], ['AE', 'Emiratos Árabes Unidos', '+971'],
  ['ER', 'Eritrea', '+291'], ['SK', 'Eslovaquia', '+421'], ['SI', 'Eslovenia', '+386'],
  ['ES', 'España', '+34'], ['US', 'Estados Unidos', '+1'], ['EE', 'Estonia', '+372'],
  ['SZ', 'Esuatini', '+268'], ['ET', 'Etiopía', '+251'], ['PH', 'Filipinas', '+63'],
  ['FI', 'Finlandia', '+358'], ['FJ', 'Fiyi', '+679'], ['FR', 'Francia', '+33'],
  ['GA', 'Gabón', '+241'], ['GM', 'Gambia', '+220'], ['GE', 'Georgia', '+995'],
  ['GH', 'Ghana', '+233'], ['GD', 'Granada', '+1'], ['GR', 'Grecia', '+30'],
  ['GT', 'Guatemala', '+502'], ['GN', 'Guinea', '+224'], ['GQ', 'Guinea Ecuatorial', '+240'],
  ['GW', 'Guinea-Bisáu', '+245'], ['GY', 'Guyana', '+592'], ['HT', 'Haití', '+509'],
  ['HN', 'Honduras', '+504'], ['HK', 'Hong Kong', '+852'], ['HU', 'Hungría', '+36'],
  ['IN', 'India', '+91'], ['ID', 'Indonesia', '+62'], ['IQ', 'Irak', '+964'],
  ['IR', 'Irán', '+98'], ['IE', 'Irlanda', '+353'], ['IS', 'Islandia', '+354'],
  ['MH', 'Islas Marshall', '+692'], ['SB', 'Islas Salomón', '+677'], ['IL', 'Israel', '+972'],
  ['IT', 'Italia', '+39'], ['JM', 'Jamaica', '+1'], ['JP', 'Japón', '+81'],
  ['JO', 'Jordania', '+962'], ['KZ', 'Kazajistán', '+7'], ['KE', 'Kenia', '+254'],
  ['KG', 'Kirguistán', '+996'], ['KI', 'Kiribati', '+686'], ['KW', 'Kuwait', '+965'],
  ['LA', 'Laos', '+856'], ['LS', 'Lesoto', '+266'], ['LV', 'Letonia', '+371'],
  ['LB', 'Líbano', '+961'], ['LR', 'Liberia', '+231'], ['LY', 'Libia', '+218'],
  ['LI', 'Liechtenstein', '+423'], ['LT', 'Lituania', '+370'], ['LU', 'Luxemburgo', '+352'],
  ['MK', 'Macedonia del Norte', '+389'], ['MG', 'Madagascar', '+261'], ['MY', 'Malasia', '+60'],
  ['MW', 'Malaui', '+265'], ['MV', 'Maldivas', '+960'], ['ML', 'Malí', '+223'],
  ['MT', 'Malta', '+356'], ['MA', 'Marruecos', '+212'], ['MU', 'Mauricio', '+230'],
  ['MR', 'Mauritania', '+222'], ['MX', 'México', '+52'], ['FM', 'Micronesia', '+691'],
  ['MD', 'Moldavia', '+373'], ['MC', 'Mónaco', '+377'], ['MN', 'Mongolia', '+976'],
  ['ME', 'Montenegro', '+382'], ['MZ', 'Mozambique', '+258'], ['NA', 'Namibia', '+264'],
  ['NR', 'Nauru', '+674'], ['NP', 'Nepal', '+977'], ['NI', 'Nicaragua', '+505'],
  ['NE', 'Níger', '+227'], ['NG', 'Nigeria', '+234'], ['NO', 'Noruega', '+47'],
  ['NZ', 'Nueva Zelanda', '+64'], ['OM', 'Omán', '+968'], ['NL', 'Países Bajos', '+31'],
  ['PK', 'Pakistán', '+92'], ['PW', 'Palaos', '+680'], ['PS', 'Palestina', '+970'],
  ['PA', 'Panamá', '+507'], ['PG', 'Papúa Nueva Guinea', '+675'], ['PY', 'Paraguay', '+595'],
  ['PE', 'Perú', '+51'], ['PL', 'Polonia', '+48'], ['PT', 'Portugal', '+351'],
  ['PR', 'Puerto Rico', '+1'], ['GB', 'Reino Unido', '+44'], ['CF', 'República Centroafricana', '+236'],
  ['DO', 'República Dominicana', '+1'], ['RW', 'Ruanda', '+250'], ['RO', 'Rumania', '+40'],
  ['RU', 'Rusia', '+7'], ['WS', 'Samoa', '+685'], ['KN', 'San Cristóbal y Nieves', '+1'],
  ['SM', 'San Marino', '+378'], ['VC', 'San Vicente y las Granadinas', '+1'], ['LC', 'Santa Lucía', '+1'],
  ['ST', 'Santo Tomé y Príncipe', '+239'], ['SN', 'Senegal', '+221'], ['RS', 'Serbia', '+381'],
  ['SC', 'Seychelles', '+248'], ['SL', 'Sierra Leona', '+232'], ['SG', 'Singapur', '+65'],
  ['SY', 'Siria', '+963'], ['SO', 'Somalia', '+252'], ['LK', 'Sri Lanka', '+94'],
  ['ZA', 'Sudáfrica', '+27'], ['SD', 'Sudán', '+249'], ['SS', 'Sudán del Sur', '+211'],
  ['SE', 'Suecia', '+46'], ['CH', 'Suiza', '+41'], ['SR', 'Surinam', '+597'],
  ['TH', 'Tailandia', '+66'], ['TW', 'Taiwán', '+886'], ['TZ', 'Tanzania', '+255'],
  ['TJ', 'Tayikistán', '+992'], ['TL', 'Timor Oriental', '+670'], ['TG', 'Togo', '+228'],
  ['TO', 'Tonga', '+676'], ['TT', 'Trinidad y Tobago', '+1'], ['TN', 'Túnez', '+216'],
  ['TM', 'Turkmenistán', '+993'], ['TR', 'Turquía', '+90'], ['TV', 'Tuvalu', '+688'],
  ['UA', 'Ucrania', '+380'], ['UG', 'Uganda', '+256'], ['UY', 'Uruguay', '+598'],
  ['UZ', 'Uzbekistán', '+998'], ['VU', 'Vanuatu', '+678'], ['VA', 'Vaticano', '+379'],
  ['VE', 'Venezuela', '+58'], ['VN', 'Vietnam', '+84'], ['YE', 'Yemen', '+967'],
  ['DJ', 'Yibuti', '+253'], ['ZM', 'Zambia', '+260'], ['ZW', 'Zimbabue', '+263'],
].map(([sigla, pais, codigo]) => ({ sigla, pais, codigo }))

/* Cuando dos países comparten código, el que se entiende si no se sabe cuál es. */
const PRIMERO_CON = { '+1': 'US', '+7': 'RU' }

/* Los nombres que usa el país de residencia y que no coinciden con los de acá. */
const ALIAS = { 'EE.UU.': 'US' }

const sinTildes = t => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/* El país de un nombre, como lo escribe la ficha en «País de residencia». */
export const paisPorNombre = nombre => {
  if (ALIAS[nombre]) return CODIGOS_PAIS.find(p => p.sigla === ALIAS[nombre])
  return CODIGOS_PAIS.find(p => sinTildes(p.pais) === sinTildes(nombre)) || null
}

export const paisPorSigla = sigla => CODIGOS_PAIS.find(p => p.sigla === sigla) || null

/* PARTE UN TELÉFONO GUARDADO EN CÓDIGO Y NÚMERO. Se guarda entero —«+591 71244890»— porque es lo
   que sirve para llamar o escribir por WhatsApp sin armar nada. Un número guardado antes de que
   hubiera selector no trae código: se le pone el que corresponda y el número queda tal cual.

   `sigla` es la del país elegido, si se sabe: decide entre los que comparten código. */
export function partirTelefono(valor, sigla, porDefecto) {
  const v = (valor || '').trim()
  const elegido = paisPorSigla(sigla)
  if (!v.startsWith('+')) return { pais: elegido || porDefecto, numero: v }
  if (elegido && v.startsWith(elegido.codigo + ' ')) return { pais: elegido, numero: v.slice(elegido.codigo.length).trim() }
  // El código más largo que encaje: «+591» antes que «+5», que no existe, o que «+59…».
  const codigo = [...new Set(CODIGOS_PAIS.map(p => p.codigo))]
    .filter(c => v.startsWith(c))
    .sort((a, b) => b.length - a.length)[0]
  if (!codigo) return { pais: elegido || porDefecto, numero: v }
  const pais = paisPorSigla(PRIMERO_CON[codigo]) || CODIGOS_PAIS.find(p => p.codigo === codigo)
  return { pais, numero: v.slice(codigo.length).trim() }
}
