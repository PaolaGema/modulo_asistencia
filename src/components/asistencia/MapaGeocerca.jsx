import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* ── LA GEOCERCA EN EL MAPA ──
   El círculo es el radio dentro del cual se puede marcar. Se mueve tocando el mapa o arrastrando el
   punto, y el radio se cambia desde fuera (el control deslizante del formulario). Leaflet y
   OpenStreetMap, como el selector de ubicación de Organización: sin clave ni costo. */

const CENTRO_BOLIVIA = [-16.2902, -63.5887]

export default function MapaGeocerca({ geo, onCambio }) {
  const nodo = useRef(null)
  const mapa = useRef(null)
  const marca = useRef(null)
  const circulo = useRef(null)
  const cambio = useRef(onCambio)
  useEffect(() => { cambio.current = onCambio }, [onCambio])

  useEffect(() => {
    const m = L.map(nodo.current, { zoomControl: true, attributionControl: false }).setView(geo ? [geo.lat, geo.lng] : CENTRO_BOLIVIA, geo ? 16 : 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m)
    m.on('click', e => cambio.current({ lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) }))
    mapa.current = m
    setTimeout(() => m.invalidateSize(), 60)
    return () => { m.remove(); mapa.current = null; marca.current = null; circulo.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const m = mapa.current
    if (!m || !geo) return
    const pos = [geo.lat, geo.lng]
    if (!marca.current) {
      const icono = L.divIcon({ className: '', html: '<div style="width:18px;height:18px;border-radius:50%;background:#00C27D;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>', iconSize: [18, 18], iconAnchor: [9, 9] })
      marca.current = L.marker(pos, { draggable: true, icon: icono }).addTo(m)
      marca.current.on('dragend', e => { const p = e.target.getLatLng(); cambio.current({ lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) }) })
      circulo.current = L.circle(pos, { radius: geo.radio, color: '#00C27D', weight: 2, fillColor: '#00E091', fillOpacity: 0.18 }).addTo(m)
      m.setView(pos, 16)
    } else {
      marca.current.setLatLng(pos)
      circulo.current.setLatLng(pos).setRadius(geo.radio)
    }
  }, [geo])

  return <div ref={nodo} className="at-mapa" aria-label="Mapa de la geocerca: toque para mover el punto" />
}
