import { ESTADOS } from '../../data/documentacionData'

/* Las funciones que acompañan a los componentes de `comunes.jsx`. Viven aparte porque un archivo
   de componentes que además exporta funciones rompe la recarga en caliente de Vite: las pantallas
   importan los componentes de `comunes.jsx` y estas funciones de acá. */

export const FILTROS_VACIOS = { sede: '', area: '', cargo: '', tipo: '', subtipo: '', estado: '' }

export const pasaFiltros = (persona, f) =>
  (!f.sede || persona.sede === f.sede) && (!f.area || persona.depto === f.area) && (!f.cargo || persona.cargo === f.cargo)

/* Qué filtros se usaron, en palabras: lo que un reporte exportado tiene que decir (RF-83). */
export function describirFiltros(f, { sucursales = [], tipos = [], subtipos = [] } = {}) {
  const t = []
  if (f.sede) t.push(sucursales.find(s => s.id === f.sede)?.nombre)
  if (f.area) t.push(f.area)
  if (f.cargo) t.push(f.cargo)
  if (f.tipo) t.push(tipos.find(x => x.id === f.tipo)?.nombre)
  if (f.subtipo) t.push(subtipos.find(x => x.id === f.subtipo)?.nombre)
  if (f.estado) t.push(ESTADOS[f.estado]?.label)
  return t.filter(Boolean).join(' · ') || 'Sin filtros'
}

/* Descarga simulada: la demo no tiene servidor de archivos, así que se baja un .txt que dice
   qué se habría bajado. Mejor eso que un botón que no hace nada. */
export function descargarTexto(nombre, contenido) {
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = nombre; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* Exportar una tabla a CSV con los filtros escritos arriba (RF-83). Excel lo abre directo. */
export function exportarCSV(nombre, encabezados, filas, filtrosTexto) {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lineas = [
    esc(`Filtros: ${filtrosTexto}`),
    esc(`Generado: ${new Date().toLocaleString('es-BO')}`),
    '',
    encabezados.map(esc).join(';'),
    ...filas.map(f => f.map(esc).join(';')),
  ]
  const blob = new Blob(['﻿' + lineas.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = nombre; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
