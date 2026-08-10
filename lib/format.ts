const eur = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const eurCorto = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export const euros = (n: number) => eur.format(n);
export const eurosCortos = (n: number) => eurCorto.format(n);

/** '30 jul' */
export const diaMes = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');

/** 'Julio 2026' (es-ES devuelve 'julio de 2026': se quita el 'de'). */
export const mesLargo = (d: Date) => {
  const s = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(' de ', ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** 'julio' */
export const soloMes = (d: Date) => d.toLocaleDateString('es-ES', { month: 'long' });

/** 'jul' para los ejes del gráfico de evolución. */
export const resumenMesCorto = (d: Date) =>
  d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');

export const porcentaje = (n: number) => `${Math.round(n)}%`;

// ---- importes que se teclean ----

/**
 * Normaliza lo que el usuario escribe en un campo de importe: fuera todo lo que no
 * sea cifra o separador, el punto pasa a coma, y queda un único separador con dos
 * céntimos como máximo. Así '1.2.3' → '1,23' y nunca se llega a un valor imposible
 * de interpretar que dejaría el botón de guardar muerto sin explicación.
 */
export function sanearImporte(texto: string) {
  const limpio = texto.replace(/[^0-9.,]/g, '').replace(/\./g, ',');
  const [entera, ...resto] = limpio.split(',');
  if (resto.length === 0) return entera;
  return `${entera},${resto.join('').slice(0, 2)}`;
}

/** Convierte a número el texto ya saneado de un campo de importe. NaN si está vacío. */
export const importeANumero = (texto: string) => Number(sanearImporte(texto).replace(',', '.'));

/** Muestra un número en el formato que espera `sanearImporte` ('7.5' → '7,5'). */
export const numeroAImporte = (n: number) => String(n).replace('.', ',');

// ---- fechas ----

export const aISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const primerDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const ultimoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
export const sumarMeses = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);

/** Rango [primer día, último día] del mes de `d`, en ISO. */
export const rangoMes = (d: Date) => ({ desde: aISO(primerDia(d)), hasta: aISO(ultimoDia(d)) });

/** Clave 'YYYY-MM-01' que usa la columna `mes` de la tabla presupuestos. */
export const claveMes = (d: Date) => aISO(primerDia(d));

/** Suma (o resta, con `n` negativo) días a una fecha ISO y devuelve otra fecha ISO. */
export const sumarDias = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return aISO(d);
};

/** Días que abarca un rango, contando los dos extremos: un solo día cuenta 1. */
export const diasDelRango = (desde: string, hasta: string) => {
  const ms = new Date(`${hasta}T00:00:00`).getTime() - new Date(`${desde}T00:00:00`).getTime();
  return Math.floor(ms / 86_400_000) + 1;
};

export const mismoMes = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
