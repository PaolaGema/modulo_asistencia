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

/* LOS FILTROS APLICADOS, uno por uno y en palabras: lo que la fila de etiquetas dibuja sobre una
   tabla («Unidad: Ventas ×»). Cada uno dice qué filtro es, qué valor tiene y su clave para quitarlo. */
export const NOMBRE_FILTRO = { sede: 'Sucursal', area: 'Unidad', cargo: 'Cargo', tipo: 'Carpeta', subtipo: 'Documento', estado: 'Estado' }
export function filtrosAplicados(f, mostrar, { sucursales = [], tipos = [], subtipos = [] } = {}) {
  const texto = {
    sede: v => sucursales.find(s => s.id === v)?.nombre,
    area: v => v, cargo: v => v,
    tipo: v => tipos.find(x => x.id === v)?.nombre,
    subtipo: v => subtipos.find(x => x.id === v)?.nombre,
    estado: v => ESTADOS[v]?.label,
  }
  return mostrar.filter(k => f[k]).map(k => ({ clave: k, nombre: NOMBRE_FILTRO[k], valor: texto[k](f[k]) || f[k] }))
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
