// Qué avisos de presupuesto tocan. Funciones puras: no leen ajustes, no tocan
// localStorage y no envían nada, solo deciden. El componente que las usa se encarga
// de lo demás (ver `components/AlertasPresupuesto.tsx`).

import { euros, porcentaje } from './format';

export type ConsumoCategoria = {
  id: string;
  nombre: string;
  gastado: number;
  limite: number;
};

/** Dos niveles: acercarse al límite y pasarse. Se avisa de cada uno por separado. */
export type NivelAviso = 'umbral' | 'excedido';

export type Aviso = {
  categoriaId: string;
  nombre: string;
  nivel: NivelAviso;
  pct: number;
  gastado: number;
  limite: number;
};

/**
 * Categorías que merecen aviso ahora mismo, sin mirar si ya se avisó antes.
 *
 * Una categoría excedida genera el aviso de 'excedido', no el de 'umbral': si se pasa
 * de golpe del 0 al 120% con un solo gasto, lo que importa es que se ha pasado. El de
 * 'umbral' ya habrá salido antes si el gasto fue subiendo poco a poco.
 */
export function calcularAvisos(consumos: ConsumoCategoria[], umbral: number): Aviso[] {
  return consumos
    .filter((c) => c.limite > 0)
    .map((c) => {
      const pct = (c.gastado / c.limite) * 100;
      const nivel: NivelAviso | null = pct > 100 ? 'excedido' : pct >= umbral ? 'umbral' : null;
      return nivel ? { categoriaId: c.id, nombre: c.nombre, nivel, pct, gastado: c.gastado, limite: c.limite } : null;
    })
    .filter((a): a is Aviso => a !== null);
}

/**
 * Identifica un aviso ya enviado. Lleva el mes dentro para que el mismo aviso vuelva a
 * salir el mes siguiente, y el nivel para que "al límite" y "excedido" no se pisen.
 */
export const claveAviso = (mes: string, a: Pick<Aviso, 'categoriaId' | 'nivel'>) =>
  `finanzas:aviso:${mes}:${a.categoriaId}:${a.nivel}`;

export const tituloAviso = (a: Aviso) =>
  a.nivel === 'excedido' ? `${a.nombre}: presupuesto excedido` : `${a.nombre}: cerca del límite`;

export const cuerpoAviso = (a: Aviso) =>
  a.nivel === 'excedido'
    ? `Llevas ${euros(a.gastado)} de ${euros(a.limite)}: ${euros(a.gastado - a.limite)} de más.`
    : `Llevas ${euros(a.gastado)} de ${euros(a.limite)} (${porcentaje(a.pct)}).`;
