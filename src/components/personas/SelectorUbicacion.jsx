import { useEffect, useRef, useState } from 'react'
import { Crosshair, LocateFixed, MapPin, Search, Trash2 } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* UN PUNTO EN EL MAPA, DENTRO DEL FORMULARIO.
   El Salar obliga a tipear la latitud a mano y eso es pedirle a alguien de Recursos Humanos que
   transcriba «-17.783319» sin fallar un dígito. Un dígito de más o de menos son once kilómetros,
   y nada en la pantalla avisa: el número entra, se guarda y queda mal para siempre. Acá se busca
   la dirección, se toca el mapa y el número lo escribe el mapa.

   LEAFLET Y OPENSTREETMAP, NO GOOGLE. No por ideología: Google Maps cobra por carga desde 2018 y
   pide una cuenta de facturación activa, así que meterlo acá habría sido decidir un gasto mensual
   recurrente en nombre de quien no lo pidió. Esto no cuesta nada ni necesita clave. Se paga en
   otra moneda —el buscador de direcciones acierta menos en Bolivia que el de Google— y por eso el
   campo sigue aceptando que peguen un enlace de Google Maps a mano: cuando el buscador falle, esa
   sigue siendo la salida, y es además el acuerdo de la sesión 1.

   LO QUE SE GUARDA ES UNA URL DE GOOGLE MAPS y no un par de números. Tres razones: es lo que la
   sesión 1 acordó; se puede pulsar desde la ficha en modo lectura sin que esta pantalla tenga que
   estar montada; y sobrevive a que algún día se cambie de proveedor de mapas, porque una URL la
   entiende cualquiera y un formato propio de coordenadas no. */

const ZOOM_PAIS = 5
const ZOOM_PUNTO = 16
const CENTRO_BOLIVIA = [-16.2902, -63.5887]

/* NOMINATIM PIDE EDUCACIÓN, NO CLAVE. Su política de uso admite como mucho una consulta por
   segundo y pide que quien consulta se identifique. Por eso se busca al enviar y no en cada
   tecla: un buscador que consulta mientras escribís manda ocho peticiones por dirección y hace
   que nos corten el servicio a todos, que es exactamente lo que la política existe para evitar. */
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'

/* LO QUE SE GUARDA, Y LO QUE SE PUEDE LEER DE VUELTA.
   Escribimos siempre la misma forma —`?q=lat,lng`— pero leemos varias, porque el campo existía
   antes que este mapa y alguien pudo pegar un enlace copiado del navegador (`@lat,lng,17z`) o las
   coordenadas sueltas. Lo que no se puede resolver acá es un enlace corto de `maps.app.goo.gl`:
   para saber a dónde apunta hay que seguirlo, y eso es una petición al servidor de Google que no
   vamos a hacer. Ese enlace se conserva tal cual y el mapa abre sin marca, que es honesto: no
   sabemos dónde está, y no lo inventamos. */
const enlaceDe = (lat, lng, radio) =>
  `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}` + (radio ? `&radio=${radio}` : '')

/* EL RADIO VIAJA EN LA MISMA URL Y NO EN UN CAMPO APARTE. «Ubicación autorizada» es UN campo del
   estudio —3.115, «lat / long / radio»— y partirlo en dos claves sería inventarle al estudio un
   campo que no tiene, con su propia fila en cada informe que lo lea. Como parámetro de más en el
   enlace, Google lo ignora y el enlace sigue abriendo el punto; nosotros lo leemos de vuelta. */
const RADIO_POR_DEFECTO = 100
const radioDe = valor => {
  const m = (valor || '').match(/[?&]radio=(\d+)/)
  return m ? Number(m[1]) : null
}

function coordenadasDe(valor) {
  const v = (valor || '').trim()
  if (!v) return null
  const patrones = [
    /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,   // ?q=lat,lng — lo que escribimos nosotros
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,        // @lat,lng,17z — copiado de la barra del navegador
    /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/, // dos números pelados
  ]
  for (const p of patrones) {
    const m = v.match(p)
    if (!m) continue
    const lat = Number(m[1]); const lng = Number(m[2])
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return [lat, lng]
  }
  return null
}

export default function SelectorUbicacion({ id, valor, onCambio, ariaLabel, conRadio = false }) {
  const nodo = useRef(null)
  const mapa = useRef(null)
  const marca = useRef(null)
  const [consulta, setConsulta] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [aviso, setAviso] = useState('')
  /* EL MAPA CAÍDO ES OTRA COSA QUE UN BUSCADOR SIN RESULTADOS, y por eso no comparte estado con
     él: uno habla de la consulta que acabás de hacer y el otro de que el fondo no se dibuja. Si
     compartieran sitio, un servidor de baldosas caído taparía las coordenadas ya guardadas —que
     es justo lo que hay que seguir viendo— y el mensaje quedaría pegado aunque el mapa vuelva. */
  const [mapaCaido, setMapaCaido] = useState(false)

  const punto = coordenadasDe(valor)
  const radio = conRadio ? (radioDe(valor) ?? RADIO_POR_DEFECTO) : null
  const cerco = useRef(null)
  /* LOS OYENTES DEL MAPA SE MONTAN UNA VEZ Y SE QUEDAN CON EL RADIO DE ESE MOMENTO. Una referencia
     les da el de ahora sin tener que volver a montar el mapa cada vez que alguien cambia los
     metros, que es justo lo que no se puede hacer mientras se arrastra una marca. */
  const radioRef = useRef(radio)
  useEffect(() => { radioRef.current = radio }, [radio])

  /* EL MAPA SE MONTA UNA VEZ Y VIVE FUERA DE REACT. Leaflet escribe en el DOM por su cuenta, así
     que volver a crearlo en cada render sería tirar y rehacer el mapa mientras alguien lo arrastra.
     Se crea al montar, se destruye al desmontar, y lo único que viaja de React hacia él es dónde
     está la marca. */
  useEffect(() => {
    if (mapa.current || !nodo.current) return
    const m = L.map(nodo.current, { attributionControl: true, scrollWheelZoom: false })
      .setView(punto || CENTRO_BOLIVIA, punto ? ZOOM_PUNTO : ZOOM_PAIS)

    /* EL SERVIDOR CANÓNICO DE OPENSTREETMAP, Y LA RAZÓN DE QUE NO SEA OTRO.
       Se probó el CDN de Carto, que sirve el mismo mapa más rápido y más callado de color: desde
       acá responde, y desde la máquina de quien lo usaba contestaba «api key required». Un tercero
       que da acceso según de dónde le preguntes no es una dependencia, es una lotería — y no hay
       nada que arreglar en nuestro lado, así que se vuelve al que nunca pide nada.

       ESTE ES MÁS LENTO Y SE ASUME. Lo pagan donaciones y contesta desde Europa, así que desde
       Bolivia la primera carga se nota. A cambio no hay clave que caduque, ni cuenta que activar,
       ni un día en que deje de funcionar sin avisar. El día que haya presupuesto para un proveedor
       con contrato, esto son tres líneas: la URL, la atribución y el zoom máximo.

       SIN {r}: una pantalla retina pide la versión @2x de cada baldosa, que se ve algo mejor y
       tarda el doble. A este tamaño, dentro de un formulario, no compensa. */
    const capa = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: 'abc',
      maxZoom: 19,
      /* Dos anillos de baldosas de más alrededor de lo que se ve: arrastrar el mapa un poco ya no
         dispara una descarga, que es de donde venía la sensación de tirones. Y se redibuja
         mientras se arrastra en vez de esperar a que se suelte. */
      keepBuffer: 2,
      updateWhenIdle: false,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m)

    /* UN MAPA QUE NO CARGA NO PUEDE PARECER UN MAPA VACÍO. Si el servidor de baldosas falla o
       rechaza —que es exactamente lo que acababa de pasar con el otro proveedor— sin esto se ve un
       rectángulo gris y nada explica por qué. Se dice, y se recuerda que las otras vías siguen
       abiertas: la marca se puede arrastrar y el enlace se puede pegar. */
    capa.on('tileerror', () => setMapaCaido(true))
    capa.on('load', () => setMapaCaido(false))

    /* TOCAR EL MAPA ES CONTESTAR. Sin esto habría que arrastrar una marca que todavía no existe,
       y la primera vez no hay nada que arrastrar. */
    m.on('click', e => onCambio(enlaceDe(e.latlng.lat, e.latlng.lng, radioRef.current)))

    /* ── LA RUEDA ACERCA, PERO SÓLO CUANDO EL MAPA ES EL TEMA ──
       Arrancaba desactivada del todo, y eso era pasarse: quien quiere acercarse a su manzana
       mueve la rueda, no busca dos botones. Pero activarla siempre es peor todavía —este mapa
       vive a media altura de un formulario largo, y bajando por él la rueda se quedaría atrapada
       acá mientras la página no se mueve—.

       ASÍ QUE SE ACTIVA AL ENTRAR Y SE APAGA AL SALIR. Con el puntero encima, el tema es el mapa
       y la rueda le pertenece; fuera, la rueda vuelve a ser de la página. No hay que aprender
       nada ni pulsar ninguna tecla: es el sitio del puntero el que decide, que es justo lo que
       uno ya está diciendo al ponerlo ahí. */
    m.on('mouseover', () => m.scrollWheelZoom.enable())
    m.on('mouseout', () => m.scrollWheelZoom.disable())

    mapa.current = m

    /* ── LEAFLET MIDE UNA VEZ Y HAY QUE AVISARLE CADA VEZ QUE CAMBIA ──────────────────────
       Este mapa nace dentro de un acordeón CERRADO. Al montarse, su contenedor mide cero, así
       que Leaflet calcula que con una baldosa le alcanza — y cuando alguien abre la sección
       nadie le dice que ahora mide doscientos por trescientos. El resultado es un recuadro gris
       con una esquina de mapa: no falta el mapa, falta el mapa DENTRO del mapa.

       Un `setTimeout` al montar no lo arregla, que es lo que había: dispara mientras la sección
       sigue cerrada y vuelve a medir cero. Lo que hace falta es enterarse del cambio cuando
       ocurra, sea por abrir el acordeón, por estirar la ventana o porque el riel cambió de alto
       al aparecer un campo. Un observador de tamaño se entera de los tres. */
    const ojo = new ResizeObserver(() => m.invalidateSize())
    ojo.observe(nodo.current)

    return () => { ojo.disconnect(); m.remove(); mapa.current = null; marca.current = null }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  /* LA MARCA SIGUE AL VALOR, no al revés. Así da igual si el punto lo puso un clic en el mapa, el
     buscador, el botón de «mi ubicación» o un enlace pegado a mano en otro sitio: hay un solo
     camino desde el dato hasta lo que se ve. */
  useEffect(() => {
    const m = mapa.current
    if (!m) return
    if (!punto) {
      if (marca.current) { marca.current.remove(); marca.current = null }
      return
    }
    if (!marca.current) {
      /* MARCA DIBUJADA ACÁ Y NO LA DE LEAFLET. La suya llega como dos PNG que el empaquetador
         reescribe de sitio y acaban en 404 —es el tropiezo clásico— y además es azul de otro azul.
         Un `divIcon` es HTML: usa el color de la marca y no hay archivo que perder. */
      const icono = L.divIcon({
        className: 'su-marca',
        html: '<span></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 22],
      })
      marca.current = L.marker(punto, { icon: icono, draggable: true }).addTo(m)
      marca.current.on('dragend', e => {
        const { lat, lng } = e.target.getLatLng()
        onCambio(enlaceDe(lat, lng, radioRef.current))
      })
    } else {
      marca.current.setLatLng(punto)
    }

    /* EL CERCO ES EL DATO, NO UN ADORNO. Este campo autoriza dónde se puede marcar asistencia, y
       lo que autoriza no es un punto sino un área: sin el círculo dibujado, cien metros y
       quinientos se escriben igual de fácil y no se distinguen hasta que alguien no puede marcar
       desde la puerta de su oficina. */
    if (radio) {
      if (!cerco.current) cerco.current = L.circle(punto, { radius: radio, className: 'su-cerco' }).addTo(m)
      else cerco.current.setLatLng(punto).setRadius(radio)
    } else if (cerco.current) {
      cerco.current.remove(); cerco.current = null
    }
  }, [punto?.[0], punto?.[1], radio])   // eslint-disable-line react-hooks/exhaustive-deps

  const buscar = async e => {
    e.preventDefault()
    const q = consulta.trim()
    if (!q || buscando) return
    setBuscando(true)
    setAviso('')
    try {
      const r = await fetch(`${NOMINATIM}?format=json&limit=1&q=${encodeURIComponent(q)}`)
      const [hallado] = r.ok ? await r.json() : []
      if (!hallado) {
        setAviso('No se encontró esa dirección. Prueba con la ciudad al final, o toca el mapa.')
        return
      }
      const lat = Number(hallado.lat); const lng = Number(hallado.lon)
      onCambio(enlaceDe(lat, lng, radioRef.current))
      mapa.current?.setView([lat, lng], ZOOM_PUNTO)
    } catch {
      /* SIN RED NO SE INVENTA NADA. El mapa sigue ahí para tocarlo y el campo sigue aceptando un
         enlace pegado: el buscador es una ayuda, no la única puerta. */
      setAviso('No se pudo buscar ahora. Toca el mapa o pega un enlace de Google Maps.')
    } finally {
      setBuscando(false)
    }
  }

  const miUbicacion = () => {
    if (!navigator.geolocation) { setAviso('Este navegador no comparte la ubicación.'); return }
    setAviso('')
    navigator.geolocation.getCurrentPosition(
      p => {
        onCambio(enlaceDe(p.coords.latitude, p.coords.longitude, radioRef.current))
        mapa.current?.setView([p.coords.latitude, p.coords.longitude], ZOOM_PUNTO)
      },
      /* NO ES UN FALLO SINO UNA RESPUESTA. Decir que no a compartir la ubicación es legítimo y no
         merece un mensaje de error rojo: se dice qué hacer en su lugar y se sigue. */
      () => setAviso('No se compartió la ubicación. Busca la dirección o toca el mapa.'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div className="su" role="group" aria-label={ariaLabel}>
      <div className="su-barra">
        <form className="su-buscar" onSubmit={buscar}>
          <Search size={14} className="su-lupa" aria-hidden="true" />
          <input
            id={id}
            type="search"
            value={consulta}
            onChange={e => setConsulta(e.target.value)}
            placeholder="Busca la dirección y pulsa Enter"
            aria-label="Buscar dirección"
          />
        </form>

        <button type="button" className="su-accion" onClick={miUbicacion} title="Usar mi ubicación actual">
          <LocateFixed size={14} />
        </button>

        {conRadio && (
          <label className="su-radio" title="Radio autorizado, en metros">
            <input
              type="number"
              min="20"
              max="5000"
              step="10"
              value={radio}
              onChange={e => {
                const n = Math.max(20, Math.min(5000, Number(e.target.value) || RADIO_POR_DEFECTO))
                /* Sin punto todavía no hay nada que cercar, pero el número se acepta igual: se
                   guarda en cuanto haya dónde ponerlo. */
                if (punto) onCambio(enlaceDe(punto[0], punto[1], n))
              }}
              aria-label="Radio autorizado en metros"
            />
            <span>m</span>
          </label>
        )}

        {punto && (
          <button
            type="button"
            className="su-accion"
            onClick={() => { onCambio(''); setAviso('') }}
            title="Quitar la ubicación"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="su-mapa" ref={nodo} />

      {/* UN MAPA QUE NO CARGA NO PUEDE PARECER UN MAPA VACÍO. Sin esto se ve un rectángulo gris y
          nada dice por qué. Va por encima del pie y no en su lugar: lo guardado se sigue viendo, y
          lo que se recuerda es que las otras vías siguen abiertas. */}
      {mapaCaido && (
        <p className="su-pie su-aviso">
          <Crosshair size={12} /> El mapa no está cargando. Puedes pegar un enlace de Google Maps igualmente.
        </p>
      )}

      {/* LO QUE SE GUARDÓ, A LA VISTA Y PULSABLE. Un mapa enseña dónde está el punto pero no qué
          quedó escrito en la ficha, y son dos cosas distintas: acá se comprueba que lo segundo
          existe, y de paso se puede abrir en Google Maps para contrastar. */}
      <p className="su-pie">
        {aviso ? (
          <span className="su-aviso"><Crosshair size={12} /> {aviso}</span>
        ) : punto ? (
          <a className="su-enlace" href={valor} target="_blank" rel="noreferrer">
            <MapPin size={12} /> {punto[0].toFixed(5)}, {punto[1].toFixed(5)}
          </a>
        ) : valor ? (
          /* Un enlace que no supimos leer —un `maps.app.goo.gl`, por ejemplo— no se borra ni se
             adivina: se dice que está y que el mapa no lo sabe situar. */
          <a className="su-enlace" href={valor} target="_blank" rel="noreferrer">
            <MapPin size={12} /> Enlace guardado, sin punto en el mapa
          </a>
        ) : (
          <span className="su-vacio">Busca la dirección, toca el mapa o arrastra la marca</span>
        )}
      </p>
    </div>
  )
}
