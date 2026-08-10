// Generación de CSV pensada para abrirse en Excel en español, que es el destino real
// de una exportación de gastos. Todo son funciones puras: no tocan el DOM.

/**
 * Excel en configuración española espera `;` como separador de columnas, porque la
 * coma ya se usa para los decimales. Con `,` mete toda la fila en una sola celda.
 */
export const SEPARADOR = ';';

export type Celda = string | number | null | undefined;

/**
 * Entrecomilla el campo si hace falta. Las comillas internas se duplican, que es lo
 * que manda el formato. Sin esto, una descripción con `;` rompería la fila.
 */
function celda(v: Celda): string {
  if (v === null || v === undefined) return '';
  const texto = String(v);
  return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** Importe con coma decimal y dos céntimos, como espera Excel en español. */
export const importeCSV = (n: number) => n.toFixed(2).replace('.', ',');

/**
 * Une cabeceras y filas en un CSV. Salto de línea CRLF: es lo que dice el formato y
 * lo que Excel en Windows interpreta sin dudar.
 */
export function aCSV(cabeceras: string[], filas: Celda[][]): string {
  return [cabeceras, ...filas].map((fila) => fila.map(celda).join(SEPARADOR)).join('\r\n');
}

/**
 * Nombre de archivo con el rango dentro, para que descargar dos meses seguidos no
 * deje "export (1).csv" y "export (2).csv" sin saber cuál es cuál.
 */
export const nombreArchivo = (que: string, desde: string, hasta: string) =>
  `finanzas-${que}-${desde}_${hasta}.csv`;
