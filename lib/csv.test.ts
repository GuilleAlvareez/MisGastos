import { describe, expect, it } from 'vitest';
import { aCSV, importeCSV, nombreArchivo } from './csv';

describe('importeCSV', () => {
  it('usa coma decimal y siempre dos céntimos', () => {
    expect(importeCSV(1234.5)).toBe('1234,50');
    expect(importeCSV(0.01)).toBe('0,01');
    expect(importeCSV(300)).toBe('300,00');
  });
});

describe('aCSV', () => {
  it('separa con punto y coma y termina las filas con CRLF', () => {
    const csv = aCSV(['Fecha', 'Importe'], [['2026-08-01', '10,00']]);
    expect(csv).toBe('Fecha;Importe\r\n2026-08-01;10,00');
  });

  it('entrecomilla el campo que lleva el separador, o rompería la fila', () => {
    expect(aCSV(['A'], [['uno;dos']])).toBe('A\r\n"uno;dos"');
  });

  it('duplica las comillas internas, como manda el formato', () => {
    expect(aCSV(['A'], [['dice "hola"']])).toBe('A\r\n"dice ""hola"""');
  });

  it('entrecomilla los saltos de línea', () => {
    expect(aCSV(['A'], [['dos\nlíneas']])).toBe('A\r\n"dos\nlíneas"');
  });

  it('null y undefined salen como celda vacía, no como "null"', () => {
    expect(aCSV(['A', 'B'], [[null, undefined]])).toBe('A;B\r\n;');
  });

  it('no toca las tildes: de eso se encarga el BOM al descargar', () => {
    expect(aCSV(['Categoría'], [['Té de melocotón']])).toContain('Té de melocotón');
  });

  it('sin filas deja solo la cabecera', () => {
    expect(aCSV(['A', 'B'], [])).toBe('A;B');
  });
});

describe('nombreArchivo', () => {
  it('lleva el rango dentro para no acabar con "export (1).csv"', () => {
    expect(nombreArchivo('gastos', '2026-08-01', '2026-08-31')).toBe(
      'finanzas-gastos-2026-08-01_2026-08-31.csv',
    );
  });
});
