import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* LOS DOCUMENTOS EN MARKDOWN viven en la raíz del proyecto, que es donde los mantenemos. El servidor
   de desarrollo ya los sirve desde ahí; al compilar se copian a `dist` para que el índice de la
   documentación (public/documentacion.html) los ofrezca para descargar también en Vercel. */
const DOCUMENTOS_MD = ['documentacion-ficha-colaborador.md', 'modulo-organizacion.md', 'modulo-onboarding.md', 'modulo-documentacion.md', 'modulo-asistencia.md']

const documentosMd = () => ({
  name: 'documentos-md',
  apply: 'build',
  closeBundle() {
    for (const f of DOCUMENTOS_MD) copyFileSync(resolve(f), resolve('dist', f))
  },
})

export default defineConfig({
  plugins: [react(), tailwindcss(), documentosMd()],
})
