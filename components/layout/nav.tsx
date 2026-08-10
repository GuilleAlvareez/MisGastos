import type { SVGProps } from 'react';

type IconoProps = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
};

export function IconoResumen(p: IconoProps) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </svg>
  );
}

export function IconoMovimientos(p: IconoProps) {
  return (
    <svg {...base} {...p}>
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export function IconoPresupuestos(p: IconoProps) {
  return (
    <svg {...base} {...p}>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <path d="M2.5 10.5h19" />
    </svg>
  );
}

export function IconoEstadisticas(p: IconoProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}

/** Ingresos: flecha que entra en una bandeja. El gasto sería la inversa. */
export function IconoIngresos(p: IconoProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3v10m0 0 4-4m-4 4-4-4" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function IconoMas(p: IconoProps) {
  return (
    <svg {...base} strokeWidth={2.2} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Los tres puntos de la pestaña "Más" del móvil. */
export function IconoMasOpciones(p: IconoProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export type Ruta = {
  href: string;
  etiqueta: string;
  Icono: (p: IconoProps) => React.ReactElement;
  /** Se muestra bajo la etiqueta en el panel "Más", donde hay sitio. */
  pista?: string;
};

/** Las de uso diario. En escritorio salen todas en el sidebar. */
export const RUTAS_PRINCIPALES: Ruta[] = [
  { href: '/', etiqueta: 'Resumen', Icono: IconoResumen },
  { href: '/movimientos', etiqueta: 'Movimientos', Icono: IconoMovimientos },
  { href: '/presupuestos', etiqueta: 'Presupuestos', Icono: IconoPresupuestos },
  { href: '/estadisticas', etiqueta: 'Estadísticas', Icono: IconoEstadisticas },
];

/** Uso ocasional: en escritorio van en un segundo grupo del sidebar. */
export const RUTAS_SECUNDARIAS: Ruta[] = [
  { href: '/ingresos', etiqueta: 'Ingresos', Icono: IconoIngresos, pista: 'Nómina y entradas sueltas' },
];

/**
 * En el móvil solo caben tres pestañas junto al FAB, así que la cuarta es "Más" y
 * abre un panel con todo lo que no ha entrado. Las tres fijas son las de uso diario.
 */
export const RUTAS_BARRA = RUTAS_PRINCIPALES.slice(0, 3);
export const RUTAS_PANEL = [...RUTAS_PRINCIPALES.slice(3), ...RUTAS_SECUNDARIAS];

export const esRutaActiva = (ruta: string, href: string) =>
  href === '/' ? ruta === '/' : ruta.startsWith(href);
