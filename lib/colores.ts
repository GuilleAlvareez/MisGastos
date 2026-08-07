import type { Categoria, EstadoPresupuesto, Gasto, GastoResuelto } from './types';

/** Paleta categórica: se asigna por índice a categorías sin color propio útil en Supabase. */
export const PALETA = [
  '#2E7D6B',
  '#3D6FD9',
  '#7C5CD6',
  '#C0468A',
  '#D4573D',
  '#B9791A',
  '#6F9C24',
  '#148F8F',
  '#8A6E4B',
  '#5B6B8C',
];

export const GRIS_SIN_CATEGORIA = '#A1A1AA';
export const SIN_CATEGORIA = 'Sin categoría';

/** El default del esquema ('#888888') no está en la paleta: se sustituye por color de paleta. */
const COLOR_DEFAULT_ESQUEMA = '#888888';

export function colorCategoria(cat: Pick<Categoria, 'color'>, indice: number) {
  const c = (cat.color || '').trim().toLowerCase();
  if (!c || c === COLOR_DEFAULT_ESQUEMA) return PALETA[indice % PALETA.length];
  return cat.color;
}

/** Mapa id → { nombre, color } listo para pintar listas y gráficos. */
export function mapaCategorias(categorias: Categoria[]) {
  return new Map(
    categorias.map((c, i) => [c.id, { nombre: c.nombre, color: colorCategoria(c, i) }] as const),
  );
}

/** Resuelve la categoría de cada gasto, contemplando categoria_id null. */
export function resolverGastos(gastos: Gasto[], categorias: Categoria[]): GastoResuelto[] {
  const mapa = mapaCategorias(categorias);
  return gastos.map((g) => {
    const cat = g.categoria_id ? mapa.get(g.categoria_id) : undefined;
    return {
      ...g,
      categoriaNombre: cat?.nombre ?? SIN_CATEGORIA,
      categoriaColor: cat?.color ?? GRIS_SIN_CATEGORIA,
    };
  });
}

/** Semáforo de presupuesto: <70% en rango · 70-100% al límite · >100% excedido. */
export function estadoPresupuesto(gastado: number, limite: number): EstadoPresupuesto {
  if (limite <= 0) return gastado > 0 ? 'excedido' : 'rango';
  const pct = (gastado / limite) * 100;
  if (pct > 100) return 'excedido';
  if (pct >= 70) return 'limite';
  return 'rango';
}

export const ETIQUETA_ESTADO: Record<EstadoPresupuesto, string> = {
  rango: 'En rango',
  limite: 'Al límite',
  excedido: 'Excedido',
};

export const CLASES_ESTADO: Record<EstadoPresupuesto, string> = {
  rango: 'bg-rango-bg text-rango',
  limite: 'bg-limite-bg text-limite',
  excedido: 'bg-excedido-bg text-excedido',
};
