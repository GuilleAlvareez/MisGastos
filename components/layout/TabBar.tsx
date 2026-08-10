'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useHojaMovimiento } from '@/components/HojaMovimiento';
import { IconoMas, IconoMasOpciones, RUTAS_BARRA, RUTAS_PANEL, esRutaActiva } from './nav';
import PanelMas from './PanelMas';

/**
 * Barra inferior de iPhone con FAB central. Oculta en escritorio (ahí manda el sidebar).
 * Solo caben tres pestañas junto al FAB, así que la cuarta abre el panel "Más".
 */
export default function TabBar() {
  const ruta = usePathname();
  const { abrir } = useHojaMovimiento();
  const [panelAbierto, setPanelAbierto] = useState(false);

  const izquierda = RUTAS_BARRA.slice(0, 2);
  const derecha = RUTAS_BARRA.slice(2);
  // El "Más" se marca como activo cuando la pantalla actual vive dentro del panel.
  const enPanel = RUTAS_PANEL.some((r) => esRutaActiva(ruta, r.href));

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gris-200 bg-white/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 items-end">
          {izquierda.map((r) => (
            <Pestana key={r.href} {...r} activo={esRutaActiva(ruta, r.href)} />
          ))}
          <div aria-hidden className="h-[62px]" />
          {derecha.map((r) => (
            <Pestana key={r.href} {...r} activo={esRutaActiva(ruta, r.href)} />
          ))}
          <Pestana
            etiqueta="Más"
            Icono={IconoMasOpciones}
            activo={enPanel || panelAbierto}
            expandido={panelAbierto}
            alPulsar={() => setPanelAbierto(true)}
          />
        </div>
      </nav>

      {panelAbierto && <PanelMas cerrar={() => setPanelAbierto(false)} />}

      <button
        type="button"
        onClick={() => abrir()}
        aria-label="Nuevo movimiento"
        className="fixed left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-acento text-white shadow-fab active:bg-acento-hover md:hidden"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 18px)' }}
      >
        <IconoMas className="h-6 w-6" />
      </button>
    </>
  );
}

/** Pestaña de la barra: enlace si tiene `href`, botón si abre el panel. */
function Pestana({
  href,
  etiqueta,
  Icono,
  activo,
  alPulsar,
  expandido,
}: {
  href?: string;
  etiqueta: string;
  Icono: (p: { className?: string }) => React.ReactElement;
  activo: boolean;
  alPulsar?: () => void;
  expandido?: boolean;
}) {
  const clases = `flex h-[62px] flex-col items-center justify-center gap-1 ${
    activo ? 'text-acento' : 'text-gris-400'
  }`;
  const contenido = (
    <>
      <Icono className="h-[22px] w-[22px]" />
      <span className={`text-[10px] leading-none ${activo ? 'font-semibold' : ''}`}>{etiqueta}</span>
    </>
  );

  if (!href) {
    return (
      <button type="button" onClick={alPulsar} aria-expanded={expandido} className={clases}>
        {contenido}
      </button>
    );
  }

  return (
    <Link href={href} aria-current={activo ? 'page' : undefined} className={clases}>
      {contenido}
    </Link>
  );
}
