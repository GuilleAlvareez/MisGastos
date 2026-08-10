'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNuevoGasto } from '@/components/NuevoGastoSheet';
import { IconoMas, RUTAS } from './nav';

/** Barra inferior de iPhone con FAB central. Oculta en escritorio (ahí manda el sidebar). */
export default function TabBar() {
  const ruta = usePathname();
  const { abrir } = useNuevoGasto();

  const izquierda = RUTAS.slice(0, 2);
  const derecha = RUTAS.slice(2);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gris-200 bg-white/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 items-end">
          {izquierda.map((r) => (
            <Pestana key={r.href} {...r} activo={esActivo(ruta, r.href)} />
          ))}
          <div aria-hidden className="h-[62px]" />
          {derecha.map((r) => (
            <Pestana key={r.href} {...r} activo={esActivo(ruta, r.href)} />
          ))}
        </div>
      </nav>

      <button
        type="button"
        onClick={() => abrir()}
        aria-label="Nuevo gasto"
        className="fixed left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-acento text-white shadow-fab active:bg-acento-hover md:hidden"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 18px)' }}
      >
        <IconoMas className="h-6 w-6" />
      </button>
    </>
  );
}

function esActivo(ruta: string, href: string) {
  return href === '/' ? ruta === '/' : ruta.startsWith(href);
}

function Pestana({
  href,
  etiqueta,
  Icono,
  activo,
}: {
  href: string;
  etiqueta: string;
  Icono: (p: { className?: string }) => React.ReactElement;
  activo: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={activo ? 'page' : undefined}
      className={`flex h-[62px] flex-col items-center justify-center gap-1 ${
        activo ? 'text-acento' : 'text-gris-400'
      }`}
    >
      <Icono className="h-[22px] w-[22px]" />
      <span className={`text-[10px] leading-none ${activo ? 'font-semibold' : ''}`}>{etiqueta}</span>
    </Link>
  );
}
