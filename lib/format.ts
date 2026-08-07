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

export const mismoMes = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
