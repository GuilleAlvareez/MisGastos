// Pub-sub mínimo para que cualquier escritura (alta de gasto, CRUD de categorías)
// haga que las páginas ya montadas recarguen sus datos sin recargar la web.

type Oyente = () => void;

const oyentes = new Set<Oyente>();

export function suscribirDatos(fn: Oyente) {
  oyentes.add(fn);
  return () => {
    oyentes.delete(fn);
  };
}

export function avisarDatosCambiados() {
  oyentes.forEach((fn) => fn());
}
