import { describe, expect, it } from 'vitest';
import { GRIS_SIN_CATEGORIA, PALETA, SIN_CATEGORIA, colorCategoria, estadoPresupuesto, resolverGastos } from './colores';
import type { Categoria, Gasto } from './types';

const categoria = (extra: Partial<Categoria> = {}): Categoria => ({
  id: 'c1',
  nombre: 'Comidas',
  color: '#2E7D6B',
  presupuesto_mensual: null,
  creado_en: '2026-01-01T00:00:00Z',
  ...extra,
});

const gasto = (extra: Partial<Gasto> = {}): Gasto => ({
  id: 'g1',
  importe: 10,
  categoria_id: 'c1',
  descripcion: null,
  fecha: '2026-08-01',
  creado_en: '2026-08-01T00:00:00Z',
  ...extra,
});

describe('estadoPresupuesto', () => {
  it('marca los tres tramos del semáforo', () => {
    expect(estadoPresupuesto(50, 100)).toBe('rango');
    expect(estadoPresupuesto(85, 100)).toBe('limite');
    expect(estadoPresupuesto(120, 100)).toBe('excedido');
  });

  it('los bordes caen donde dice el diseño: 70% al límite, 100% todavía no excedido', () => {
    expect(estadoPresupuesto(69.99, 100)).toBe('rango');
    expect(estadoPresupuesto(70, 100)).toBe('limite');
    expect(estadoPresupuesto(100, 100)).toBe('limite');
    expect(estadoPresupuesto(100.01, 100)).toBe('excedido');
  });

  it('sin límite, gastar algo ya es excedido y no dividir por cero', () => {
    expect(estadoPresupuesto(0, 0)).toBe('rango');
    expect(estadoPresupuesto(1, 0)).toBe('excedido');
  });
});

describe('colorCategoria', () => {
  it('respeta el color propio de la categoría', () => {
    expect(colorCategoria(categoria({ color: '#639922' }), 0)).toBe('#639922');
  });

  it('sustituye el gris por defecto del esquema por un color de paleta', () => {
    expect(colorCategoria(categoria({ color: '#888888' }), 0)).toBe(PALETA[0]);
    expect(colorCategoria(categoria({ color: '' }), 3)).toBe(PALETA[3]);
  });

  it('da la vuelta a la paleta cuando hay más categorías que colores', () => {
    expect(colorCategoria(categoria({ color: '#888888' }), PALETA.length)).toBe(PALETA[0]);
  });
});

describe('resolverGastos', () => {
  it('resuelve nombre y color de la categoría', () => {
    const [resuelto] = resolverGastos([gasto()], [categoria()]);
    expect(resuelto.categoriaNombre).toBe('Comidas');
    expect(resuelto.categoriaColor).toBe('#2E7D6B');
  });

  it('un gasto sin categoría no se pierde: cae en la pseudo-categoría gris', () => {
    // Pasa de verdad: la FK es `on delete set null`, así que borrar una categoría
    // deja sus gastos con categoria_id a null.
    const [resuelto] = resolverGastos([gasto({ categoria_id: null })], [categoria()]);
    expect(resuelto.categoriaNombre).toBe(SIN_CATEGORIA);
    expect(resuelto.categoriaColor).toBe(GRIS_SIN_CATEGORIA);
  });

  it('un id que ya no existe se trata igual que sin categoría', () => {
    const [resuelto] = resolverGastos([gasto({ categoria_id: 'fantasma' })], [categoria()]);
    expect(resuelto.categoriaNombre).toBe(SIN_CATEGORIA);
  });
});
