import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** false si faltan las variables de entorno: los hooks lo usan para avisar en la UI. */
export const supabaseConfigurado = Boolean(url && anonKey);

export const ERROR_SIN_CONFIG =
  'Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example a .env y rellénalas.';

/**
 * Una escritura que no ha tocado ninguna fila. Supabase no devuelve error cuando
 * una política de RLS bloquea la operación, así que este es el aviso que se muestra
 * en su lugar (ver `hooks/useEscritura.ts`).
 */
export const ERROR_SIN_PERMISO =
  'La base de datos ha rechazado el cambio sin dar detalles: la tabla no tiene política de RLS para esta operación. Ejecuta supabase/schema.sql en Supabase.';

// Placeholder para que el build no reviente cuando aún no hay .env.
export const supabase = createClient(url || 'http://localhost:54321', anonKey || 'anon-placeholder', {
  auth: { persistSession: false },
});
