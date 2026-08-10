'use client';

import { useCallback, useEffect, useState } from 'react';
import { authRequerido, supabase } from '@/lib/supabase';

/**
 * Sesión de Supabase Auth. Con `authRequerido` apagado no consulta nada y se
 * comporta como si hubiera sesión, que es el modo de un solo usuario de siempre.
 *
 * `cargando` importa: sin él, el primer render no sabe todavía si hay sesión y la
 * puerta enseñaría el formulario de acceso durante un parpadeo a quien ya está dentro.
 */
export function useSesion() {
  const [email, setEmail] = useState<string | null>(null);
  const [autenticado, setAutenticado] = useState(!authRequerido);
  const [cargando, setCargando] = useState(authRequerido);

  useEffect(() => {
    if (!authRequerido) return;

    let vivo = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!vivo) return;
      setEmail(data.session?.user.email ?? null);
      setAutenticado(Boolean(data.session));
      setCargando(false);
    });

    // Cubre el login, el logout y la renovación del token en otra pestaña.
    const { data: suscripcion } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setEmail(sesion?.user.email ?? null);
      setAutenticado(Boolean(sesion));
      setCargando(false);
    });

    return () => {
      vivo = false;
      suscripcion.subscription.unsubscribe();
    };
  }, []);

  const entrar = useCallback(async (correo: string, contrasena: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: contrasena,
    });
    return error?.message ?? null;
  }, []);

  const salir = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return error?.message ?? null;
  }, []);

  return { autenticado, cargando, email, entrar, salir };
}
