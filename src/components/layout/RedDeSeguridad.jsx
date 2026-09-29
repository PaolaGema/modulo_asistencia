import { Component } from 'react'

/* ── SI UNA PANTALLA FALLA, QUE NO QUEDE EN BLANCO ────────────────────────
   Un error al dibujar cualquier página desmontaba la aplicación entera y dejaba la pantalla
   vacía, sin menú y sin una palabra: quien estaba llenando una ficha no sabía si había perdido
   algo ni qué hacer. Esto atrapa el error de la página y deja el marco en pie, con un aviso,
   un botón para recargar y el detalle del error, para poder contarlo.

   LO ESCRITO NO SE PIERDE: el borrador de la ficha se guarda a cada cambio, así que recargar
   vuelve a donde se estaba.

   `ruta` la reinicia al navegar: cambiar de pantalla es la forma más natural de salir del error,
   y sin esto el aviso seguiría ahí en la página siguiente. */
export default class RedDeSeguridad extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, ruta: props.ruta }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  static getDerivedStateFromProps(props, state) {
    return props.ruta !== state.ruta ? { error: null, ruta: props.ruta } : null
  }

  componentDidCatch(error, info) {
    console.error('Error en la pantalla:', error, info?.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div className="red-seguridad" role="alert">
        <h2>Algo falló al mostrar esta pantalla</h2>
        <p>Lo que ya había escrito está guardado. Recargue la página para seguir donde estaba.</p>
        <button type="button" className="pl-btn-save" onClick={() => window.location.reload()}>Recargar</button>
        <details>
          <summary>Detalle del error</summary>
          <pre>{String(error?.stack || error)}</pre>
        </details>
      </div>
    )
  }
}
