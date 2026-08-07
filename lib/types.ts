// Espejo exacto del esquema existente en Supabase. No se crea nada aquí, solo se consume.

export type Categoria = {
  id: string;
  nombre: string;
  color: string; // nunca null: default '#888888'
  presupuesto_mensual: number | null;
  creado_en: string;
};

export type Gasto = {
  id: string;
  importe: number;
  categoria_id: string | null; // on delete set null → puede ser null
  descripcion: string | null;
  fecha: string; // 'YYYY-MM-DD'
  creado_en: string;
};

export type Presupuesto = {
  id: string;
  categoria_id: string;
  mes: string; // 'YYYY-MM-01'
  limite: number;
  creado_en: string;
};

export type Ingreso = {
  id: string;
  importe: number;
  concepto: string | null;
  fecha: string;
  creado_en: string;
};

/** Gasto con su categoría ya resuelta (o la pseudo-categoría "Sin categoría"). */
export type GastoResuelto = Gasto & {
  categoriaNombre: string;
  categoriaColor: string;
};

export type EstadoPresupuesto = 'rango' | 'limite' | 'excedido';

export type Rango = { desde: string; hasta: string };
