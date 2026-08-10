'use client';

import { useCallback, useState } from 'react';
import { avisarDatosCambiados } from '@/lib/eventos';
import { ERROR_SIN_CONFIG, ERROR_SIN_PERMISO, supabaseConfigurado } from '@/lib/supabase';

/** Lo que devuelve cualquier consulta de Supabase terminada en `.select(...)`. */
type Respuesta = { data: unknown[] | null; error: { message: string } | null };

/**
 * Base común de todas las escrituras de la app. Devuelve el mensaje de error o
 * `null` si ha ido bien, y expone `guardando` para bloquear el botón.
 *
 * Toda consulta que se le pase debe terminar en `.select(...)`. El motivo: cuando
 * una política de RLS no permite la operación, Supabase NO devuelve error, se limita
 * a no tocar ninguna fila. Si no se comprueban las filas devueltas, la app diría
 * "guardado", cerraría el formulario y el dato seguiría igual en la base.
 */
export function useEscritura() {
  const [guardando, setGuardando] = useState(false);

  const escribir = useCallback(async (consulta: () => PromiseLike<Respuesta>) => {
    if (!supabaseConfigurado) return ERROR_SIN_CONFIG;
    setGuardando(true);
    const { data, error } = await consulta();
    setGuardando(false);
    if (error) return error.message;
    if (!data || data.length === 0) return ERROR_SIN_PERMISO;
    avisarDatosCambiados();
    return null;
  }, []);

  return { escribir, guardando };
}
