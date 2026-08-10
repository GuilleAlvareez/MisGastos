'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEscritura } from '@/hooks/useEscritura';
import { suscribirDatos } from '@/lib/eventos';
import { ERROR_SIN_CONFIG, supabase, supabaseConfigurado } from '@/lib/supabase';
import type { Categoria } from '@/lib/types';

export type NuevaCategoria = {
  nombre: string;
  color: string;
  /** null = la categoría no tiene presupuesto de referencia. */
  presupuesto_mensual: number | null;
};

/** Las categorías se leen en casi todas las pantallas; se gestionan en /categorias. */
export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!supabaseConfigurado) {
      setError(ERROR_SIN_CONFIG);
      setCargando(false);
      return;
    }
    setCargando(true);
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre, color, presupuesto_mensual, creado_en')
      .order('creado_en', { ascending: true });

    if (error) setError(error.message);
    else {
      setError(null);
      setCategorias(
        (data ?? []).map((c) => ({
          ...c,
          presupuesto_mensual: c.presupuesto_mensual === null ? null : Number(c.presupuesto_mensual),
        })),
      );
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    void recargar();
    return suscribirDatos(() => void recargar());
  }, [recargar]);

  return { categorias, cargando, error, recargar };
}

/** Alta, edición y borrado de categorías. Devuelven el mensaje de error o `null`. */
export function useGuardarCategoria() {
  const { escribir, guardando } = useEscritura();

  const crear = useCallback(
    (c: NuevaCategoria) => escribir(() => supabase.from('categorias').insert(c).select('id')),
    [escribir],
  );

  const actualizar = useCallback(
    (id: string, c: NuevaCategoria) =>
      escribir(() => supabase.from('categorias').update(c).eq('id', id).select('id')),
    [escribir],
  );

  /**
   * Borrar una categoría no borra su histórico: la FK de `gastos` es
   * `on delete set null`, así que esos gastos pasan a "Sin categoría". Los
   * presupuestos de esa categoría sí caen con ella (`on delete cascade`).
   */
  const eliminar = useCallback(
    (id: string) => escribir(() => supabase.from('categorias').delete().eq('id', id).select('id')),
    [escribir],
  );

  return { crear, actualizar, eliminar, guardando };
}
