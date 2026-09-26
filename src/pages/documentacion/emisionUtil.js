import { estadoContrato, finEfectivo as finEfectivoBase } from '../../data/documentacionData'

/* Lo que comparten la biblioteca, el editor, emitir y la ficha del contrato, y que no está en
   los archivos comunes del módulo. Vive junto a las cuatro pantallas porque sólo ellas lo usan. */

export const CIRCUITOS = {
  sin_aprobacion: 'Sin aprobación',
  una: 'Una aprobación',
  dos: 'Dos aprobaciones',
}

/* La versión que se usa para emitir: la última publicada (RN-17). Un borrador posterior no
   cuenta hasta que se publique. */
export const versionPublicada = modelo => [...(modelo?.versiones || [])].reverse().find(v => v.estado === 'publicada') || null
export const ultimaVersion = modelo => (modelo?.versiones?.length ? modelo.versiones[modelo.versiones.length - 1] : null)

/* Un modelo se puede usar para emitir si está activo y tiene plantilla publicada (RN-17). */
export const emisible = modelo => modelo.estado === 'activo' && !!versionPublicada(modelo)

export const esAdenda = modelo => !!modelo && (modelo.id === 'm-adenda' || /adenda/i.test(modelo.nombre))

/* EL CONTRATO QUE MANDA HOY para una persona: el de tipo contrato que no se finalizó ni se
   reemplazó y cuyas fechas lo dejan vigente o por vencer. Es el que Planillas lee (RF-65) y el
   que obliga a decidir antes de registrar otro (RN-18). */
export const contratoVigenteDe = (colaboradorId, contratos, parametros) =>
  contratos.find(c => c.colaboradorId === colaboradorId && c.tipo === 'contrato'
    && ['vigente', 'por_vencer'].includes(estadoContrato(c, parametros, contratos))) || null

/* EL FIN QUE DE VERDAD RIGE. Una adenda de ampliación corre la fecha de fin del contrato que
   modifica; el contrato conserva la suya escrita —es lo que firmaron— pero lo que vale es la
   última adenda. Sin esto, un contrato renovado seguiría saliendo «vencido» el día de su fin
   original. */
export const finEfectivo = finEfectivoBase

export const estadoEfectivo = (contrato, contratos, parametros) => estadoContrato(contrato, parametros, contratos)

/* Cuántos plazos fijos lleva encadenados una persona, contando las adendas de ampliación. Es el
   dato que RF-66 pone adelante antes del tercero: avisa, no bloquea. */
export const plazosFijosDe = (colaboradorId, contratos) =>
  contratos.filter(c => c.colaboradorId === colaboradorId && c.modalidad === 'plazo_fijo' && !c.reemplazado).length
