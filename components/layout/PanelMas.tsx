'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { RUTAS_PANEL, esRutaActiva } from './nav';

/**
 * Panel de la pestaña "Más" del móvil: lo que no cabe en la barra inferior.
 * Hoja que sube desde abajo, se cierra al tocar el fondo, con Escape o al navegar.
 */
export default function PanelMas({ cerrar }: { cerrar: () => void }) {
  const ruta = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cerrar();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cerrar]);

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={cerrar}
        className="absolute inset-0 h-full w-full bg-gris-900/30"
      />

      <div
        className="absolute inset-x-0 bottom-0 rounded-t-tarjeta bg-white shadow-hoja"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between px-5 pb-1 pt-4">
          <p className="etiqueta">Más</p>
          <button type="button" onClick={cerrar} className="text-[15px] text-gris-600">
            Cerrar
          </button>
        </div>

        <nav className="px-3 pb-2">
          {RUTAS_PANEL.map(({ href, etiqueta, Icono, pista }) => {
            const activo = esRutaActiva(ruta, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={cerrar}
                aria-current={activo ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
                  activo ? 'bg-acento-tenue text-acento' : 'text-gris-900'
                }`}
              >
                <Icono className="h-5 w-5 shrink-0" />
                <span className="min-w-0">
                  <span className={`block text-[15px] ${activo ? 'font-semibold' : ''}`}>{etiqueta}</span>
                  {pista && <span className="block text-[13px] text-gris-400">{pista}</span>}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
