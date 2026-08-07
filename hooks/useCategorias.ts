'use client';

import { useCallback, useEffect, useState } from 'react';
import { suscribirDatos } from '@/lib/eventos';
import { ERROR_SIN_CONFIG, supabase, supabaseConfigurado } from '@/lib/supabase';
import type { Categoria } from '@/lib/types';

/**
 * Solo lectura: las categorías se gestionan fuera de la app (Supabase / n8n).
 * Aquí se consumen para colores, nombres y presupuestos de referencia.
 */
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
