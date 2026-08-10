import { describe, expect, it } from 'vitest';
import { type ConsumoCategoria, calcularAvisos, claveAviso, cuerpoAviso, tituloAviso } from './alertas';

const consumo = (extra: Partial<ConsumoCategoria> = {}): ConsumoCategoria => ({
  id: 'c1',
  nombre: 'Comidas',
  gastado: 0,
  limite: 100,
  ...extra,
});

describe('calcularAvisos', () => {
  it('no avisa por debajo del umbral', () => {
    expect(calcularAvisos([consumo({ gastado: 50 })], 80)).toEqual([]);
  });

  it('avisa justo al llegar al umbral', () => {
    const [aviso] = calcularAvisos([consumo({ gastado: 80 })], 80);
    expect(aviso.nivel).toBe('umbral');
    expect(aviso.pct).toBe(80);
  });

  it('al pasarse manda el aviso de excedido, no el de umbral', () => {
    // Un solo gasto puede saltar del 0 al 120%: lo que importa es que se ha pasado.
    const [aviso] = calcularAvisos([consumo({ gastado: 120 })], 80);
    expect(aviso.nivel).toBe('excedido');
  });

  it('el 100% justo todavía no es excedido', () => {
    expect(calcularAvisos([consumo({ gastado: 100 })], 80)[0].nivel).toBe('umbral');
  });

  it('respeta el umbral que elija el usuario', () => {
    expect(calcularAvisos([consumo({ gastado: 75 })], 70)).toHaveLength(1);
    expect(calcularAvisos([consumo({ gastado: 75 })], 90)).toHaveLength(0);
  });

  it('ignora las categorías sin presupuesto', () => {
    // Sin límite no hay nada que exceder, y dividir por cero daría Infinity.
    expect(calcularAvisos([consumo({ limite: 0, gastado: 500 })], 80)).toEqual([]);
  });

  it('devuelve solo las categorías que avisan', () => {
    const avisos = calcularAvisos(
      [
        consumo({ id: 'a', nombre: 'Tranquila', gastado: 10 }),
        consumo({ id: 'b', nombre: 'Al límite', gastado: 90 }),
        consumo({ id: 'c', nombre: 'Pasada', gastado: 150 }),
      ],
      80,
    );
    expect(avisos.map((a) => [a.categoriaId, a.nivel])).toEqual([
      ['b', 'umbral'],
      ['c', 'excedido'],
    ]);
  });
});

describe('claveAviso', () => {
  const aviso = { categoriaId: 'c1', nivel: 'umbral' as const };

  it('cambia con el mes, para que el aviso vuelva a salir el mes siguiente', () => {
    expect(claveAviso('2026-08-01', aviso)).not.toBe(claveAviso('2026-09-01', aviso));
  });

  it('distingue los dos niveles, para que uno no tape al otro', () => {
    expect(claveAviso('2026-08-01', aviso)).not.toBe(
      claveAviso('2026-08-01', { ...aviso, nivel: 'excedido' }),
    );
  });

  it('es estable: la misma situación da la misma clave', () => {
    expect(claveAviso('2026-08-01', aviso)).toBe(claveAviso('2026-08-01', { ...aviso }));
  });
});

describe('textos del aviso', () => {
  const base = { categoriaId: 'c1', nombre: 'Comidas', gastado: 90, limite: 100, pct: 90 };

  it('el de umbral dice cuánto llevas y el porcentaje', () => {
    const aviso = { ...base, nivel: 'umbral' as const };
    expect(tituloAviso(aviso)).toBe('Comidas: cerca del límite');
    expect(cuerpoAviso(aviso)).toContain('90%');
  });

  it('el de excedido dice cuánto te has pasado', () => {
    const aviso = { ...base, nivel: 'excedido' as const, gastado: 130, pct: 130 };
    expect(tituloAviso(aviso)).toBe('Comidas: presupuesto excedido');
    expect(cuerpoAviso(aviso)).toContain('de más');
  });
});
