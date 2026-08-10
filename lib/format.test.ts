import { describe, expect, it } from 'vitest';
import {
  aISO,
  diasDelRango,
  importeANumero,
  numeroAImporte,
  rangoMes,
  sanearImporte,
  sumarDias,
} from './format';

describe('sanearImporte', () => {
  it('deja pasar lo que ya está bien', () => {
    expect(sanearImporte('12,34')).toBe('12,34');
    expect(sanearImporte('7')).toBe('7');
    expect(sanearImporte('')).toBe('');
  });

  it('convierte el punto en coma, porque el teclado del móvil da punto', () => {
    expect(sanearImporte('12.34')).toBe('12,34');
  });

  it('quita lo que no es cifra ni separador', () => {
    // Se limita a descartar: no inventa separadores donde había letras o espacios.
    // Solo se llega aquí pegando texto, porque el campo es de teclado numérico.
    expect(sanearImporte('12€ 34abc')).toBe('1234');
    expect(sanearImporte('-5')).toBe('5');
  });

  // Este era el fallo real: el campo aceptaba varios separadores, el espejo visual
  // mostraba solo parte del valor y el botón de guardar se quedaba muerto sin explicar.
  it('deja un único separador aunque se teclee de más', () => {
    expect(sanearImporte('0,017,77')).toBe('0,01');
    expect(sanearImporte('1.2.3')).toBe('1,23');
    expect(sanearImporte('1,,')).toBe('1,');
  });

  it('recorta a dos céntimos', () => {
    expect(sanearImporte('9,999')).toBe('9,99');
  });

  it('es idempotente: aplicarlo dos veces no cambia nada', () => {
    for (const entrada of ['0,017,77', '1.2.3', '9,999', '12€ 34abc']) {
      expect(sanearImporte(sanearImporte(entrada))).toBe(sanearImporte(entrada));
    }
  });
});

describe('importeANumero', () => {
  it('interpreta la coma decimal', () => {
    expect(importeANumero('12,34')).toBe(12.34);
    expect(importeANumero('12.34')).toBe(12.34);
  });

  it('nunca devuelve NaN por un separador de más', () => {
    expect(importeANumero('0,017,77')).toBe(0.01);
  });

  it('el vacío no cuela como importe válido', () => {
    // Number('') es 0, así que quien valide debe exigir > 0, no solo que sea finito.
    expect(importeANumero('')).toBe(0);
  });

  it('cierra el círculo con numeroAImporte', () => {
    expect(importeANumero(numeroAImporte(7.5))).toBe(7.5);
    expect(numeroAImporte(0.01)).toBe('0,01');
  });
});

describe('rangos de fechas', () => {
  it('rangoMes cubre el mes entero', () => {
    expect(rangoMes(new Date(2026, 1, 15))).toEqual({ desde: '2026-02-01', hasta: '2026-02-28' });
  });

  it('rangoMes acierta en año bisiesto', () => {
    expect(rangoMes(new Date(2024, 1, 10)).hasta).toBe('2024-02-29');
  });

  it('diasDelRango cuenta los dos extremos', () => {
    expect(diasDelRango('2026-08-01', '2026-08-01')).toBe(1);
    expect(diasDelRango('2026-08-01', '2026-08-31')).toBe(31);
  });

  it('sumarDias cruza meses y años', () => {
    expect(sumarDias('2026-08-31', 1)).toBe('2026-09-01');
    expect(sumarDias('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('la ventana anterior de la misma longitud queda pegada y sin solaparse', () => {
    // Es el cálculo del comparador de periodos de Estadísticas.
    const [desde, hasta] = ['2026-08-09', '2026-08-10'];
    const dias = diasDelRango(desde, hasta);
    const previoHasta = sumarDias(desde, -1);
    const previoDesde = sumarDias(previoHasta, -(dias - 1));

    expect(previoHasta).toBe('2026-08-08');
    expect(previoDesde).toBe('2026-08-07');
    expect(diasDelRango(previoDesde, previoHasta)).toBe(dias);
  });

  it('aISO no se desplaza por la zona horaria', () => {
    expect(aISO(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
});
