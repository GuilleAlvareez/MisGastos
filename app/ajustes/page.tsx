'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { useAjustes } from '@/hooks/useAjustes';
import { UMBRALES } from '@/lib/ajustes';
import { type EstadoPermiso, estadoPermiso, notificar, pedirPermiso } from '@/lib/notificaciones';

export default function Ajustes() {
  const { ajustes, cargado, actualizar } = useAjustes();
  // El permiso solo se puede leer en el navegador, así que empieza indefinido.
  const [permiso, setPermiso] = useState<EstadoPermiso | null>(null);

  useEffect(() => setPermiso(estadoPermiso()), []);

  const concedido = permiso === 'granted';

  async function activar() {
    const resultado = await pedirPermiso();
    setPermiso(resultado);
    // Pedir el permiso y no activar el aviso dejaría el botón hecho a medias.
    if (resultado === 'granted') actualizar({ alertasActivas: true });
  }

  return (
    <>
      <Header titulo="Ajustes" sinMes />

      <section className="mt-6">
        <h2 className="text-[15px] font-semibold">Avisos de presupuesto</h2>
        <p className="mt-1 text-[13px] leading-snug text-gris-600">
          Un aviso cuando una categoría se acerca a su límite del mes, y otro si se pasa.
          Se calcula en este dispositivo con los datos que ya tiene descargados: no hay
          servidor de notificaciones detrás.
        </p>

        {permiso === 'sin-soporte' && (
          <p className="mt-3 rounded-xl bg-gris-100 px-3 py-2.5 text-[13px] text-gris-600">
            Este navegador no admite notificaciones.
          </p>
        )}

        {permiso === 'denied' && (
          <p className="mt-3 rounded-xl bg-limite-bg px-3 py-2.5 text-[13px] leading-snug text-limite">
            Has bloqueado las notificaciones para esta app. Hay que volver a permitirlas
            desde los ajustes del navegador; desde aquí no se puede.
          </p>
        )}

        {permiso === 'default' && (
          <button type="button" onClick={activar} className="boton-primario mt-3">
            Permitir notificaciones
          </button>
        )}

        {concedido && (
          <>
            <label className="mt-4 flex items-center justify-between gap-4 border-y border-gris-200 py-3.5">
              <span className="min-w-0">
                <span className="block text-[15px]">Avisos activados</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-gris-400">
                  Cada aviso se envía una sola vez por categoría y mes
                </span>
              </span>
              <input
                type="checkbox"
                checked={cargado && ajustes.alertasActivas}
                onChange={(e) => actualizar({ alertasActivas: e.target.checked })}
                className="h-5 w-5 shrink-0 accent-acento"
              />
            </label>

            <p className="etiqueta mt-6">Avisar al llegar a</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {UMBRALES.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => actualizar({ umbral: u })}
                  aria-pressed={ajustes.umbral === u}
                  className={`chip ${ajustes.umbral === u ? 'chip-activo' : ''}`}
                >
                  {u}%
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                void notificar(
                  'Aviso de prueba',
                  'Si ves esto, los avisos de presupuesto funcionan.',
                  'finanzas:prueba',
                )
              }
              className="mt-5 w-full rounded-xl border border-gris-200 bg-white px-4 py-2.5 text-[15px] font-medium transition-colors hover:bg-gris-50"
            >
              Enviar un aviso de prueba
            </button>
          </>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-[15px] font-semibold">Datos</h2>
        <p className="mt-1 text-[13px] leading-snug text-gris-600">
          Los movimientos viven en Supabase. Si al guardar un cambio aparece un aviso de
          que la base lo ha rechazado, es que faltan políticas de RLS: ejecuta
          <code className="mx-1 rounded bg-gris-100 px-1 py-0.5 text-[12px]">
            supabase/schema.sql
          </code>
          en el SQL Editor de Supabase.
        </p>
      </section>
    </>
  );
}
