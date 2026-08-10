'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHojaMovimiento } from '@/components/HojaMovimiento';
import { IconoMas, RUTAS_PRINCIPALES, RUTAS_SECUNDARIAS, type Ruta, esRutaActiva } from './nav';

/**
 * Navegación fija de escritorio. En móvil se sustituye por <TabBar />, donde lo
 * secundario vive detrás de la pestaña "Más"; aquí hay sitio para todo a la vista.
 */
export default function Sidebar() {
  const ruta = usePathname();
  const { abrir } = useHojaMovimiento();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gris-200 px-4 py-6 md:flex">
      <div className="px-3">
        <p className="etiqueta">Finanzas</p>
        <p className="mt-1 text-lg font-semibold tracking-tight">Control de gastos</p>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {RUTAS_PRINCIPALES.map((r) => (
          <Enlace key={r.href} ruta={r} activo={esRutaActiva(ruta, r.href)} />
        ))}
      </nav>

      <nav className="mt-6 flex flex-col gap-1 border-t border-gris-200 pt-4">
        {RUTAS_SECUNDARIAS.map((r) => (
          <Enlace key={r.href} ruta={r} activo={esRutaActiva(ruta, r.href)} />
        ))}
      </nav>

      <button type="button" onClick={() => abrir()} className="boton-primario mt-auto gap-2">
        <IconoMas className="h-4 w-4" />
        Nuevo movimiento
      </button>
    </aside>
  );
}

function Enlace({ ruta, activo }: { ruta: Ruta; activo: boolean }) {
  const { href, etiqueta, Icono } = ruta;
  return (
    <Link
      href={href}
      aria-current={activo ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors ${
        activo ? 'bg-acento-tenue font-semibold text-acento' : 'text-gris-600 hover:bg-gris-50'
      }`}
    >
      <Icono className="h-5 w-5" />
      {etiqueta}
    </Link>
  );
}
