'use client';

import { useState } from 'react';
import { useSesion } from '@/hooks/useSesion';
import { authRequerido } from '@/lib/supabase';

/**
 * Deja pasar o pide acceso, según `NEXT_PUBLIC_AUTH_REQUERIDO`.
 *
 * Con la variable apagada (el modo por defecto) este componente no hace nada: ni
 * consulta la sesión ni envuelve la app. Solo tiene sentido después de ejecutar
 * `supabase/auth.sql`, que es lo que ata cada fila a su usuario.
 */
export default function PuertaAuth({ children }: { children: React.ReactNode }) {
  const { autenticado, cargando } = useSesion();

  if (!authRequerido) return <>{children}</>;

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-gris-400" role="status">
          Comprobando la sesión…
        </p>
      </div>
    );
  }

  if (!autenticado) return <Acceso />;

  return <>{children}</>;
}

function Acceso() {
  const { entrar } = useSesion();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  const valido = correo.includes('@') && contrasena.length > 0;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!valido || entrando) return;
    setEntrando(true);
    setError(null);
    const msg = await entrar(correo, contrasena);
    setEntrando(false);
    if (msg) setError(msg);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={enviar} className="w-full max-w-sm">
        <p className="etiqueta">Finanzas</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Control de gastos</h1>
        <p className="mt-2 text-[13px] leading-snug text-gris-600">
          Entra con la cuenta que creaste en Supabase. No hay registro desde aquí: los
          usuarios se dan de alta en el panel de Supabase.
        </p>

        <label className="mt-6 block">
          <span className="etiqueta">Correo</span>
          <input
            type="email"
            autoComplete="username"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="campo mt-2"
          />
        </label>

        <label className="mt-4 block">
          <span className="etiqueta">Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="campo mt-2"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-xl bg-excedido-bg px-3 py-2 text-sm text-excedido" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={!valido || entrando} className="boton-primario mt-6">
          {entrando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
