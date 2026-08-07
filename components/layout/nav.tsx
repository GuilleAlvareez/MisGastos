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

export function IconoMas(p: IconoProps) {
  return (
    <svg {...base} strokeWidth={2.2} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export const RUTAS = [
  { href: '/', etiqueta: 'Resumen', Icono: IconoResumen },
  { href: '/movimientos', etiqueta: 'Movimientos', Icono: IconoMovimientos },
  { href: '/presupuestos', etiqueta: 'Presupuestos', Icono: IconoPresupuestos },
  { href: '/estadisticas', etiqueta: 'Estadísticas', Icono: IconoEstadisticas },
] as const;
