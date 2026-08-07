import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** false si faltan las variables de entorno: los hooks lo usan para avisar en la UI. */
export const supabaseConfigurado = Boolean(url && anonKey);

export const ERROR_SIN_CONFIG =
  'Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example a .env y rellénalas.';

// Placeholder para que el build no reviente cuando aún no hay .env.
export const supabase = createClient(url || 'http://localhost:54321', anonKey || 'anon-placeholder', {
  auth: { persistSession: false },
});
