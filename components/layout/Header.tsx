'use client';

import { mesLargo } from '@/lib/format';
import { useMes } from './MesContext';

/**
 * Cabecera de página: mes activo (con navegación), título y un valor opcional a la derecha.
 * `sinMes` la usa la página de Categorías, que no depende del mes.
 */
export default function Header({
  titulo,
  derecha,
  sinMes,
  subtitulo,
}: {
  titulo: string;
  derecha?: React.ReactNode;
  sinMes?: boolean;
  subtitulo?: string;
}) {
  const { mes, avanzar, esMesActual } = useMes();

  return (
    <header className="pt-4">
      {sinMes ? (
        <p className="etiqueta">Ajustes</p>
      ) : (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => avanzar(-1)}
            aria-label="Mes anterior"
            className="-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full text-gris-400 hover:bg-gris-100"
          >
            <Flecha direccion="izq" />
          </button>
          <p className="etiqueta">{mesLargo(mes)}</p>
          <button
            type="button"
            onClick={() => avanzar(1)}
            disabled={esMesActual}
            aria-label="Mes siguiente"
            className="flex h-6 w-6 items-center justify-center rounded-full text-gris-400 hover:bg-gris-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Flecha direccion="der" />
          </button>
        </div>
      )}

      <div className="mt-0.5 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {derecha}
      </div>

      {subtitulo && <p className="mt-1.5 text-sm text-gris-600">{subtitulo}</p>}
    </header>
  );
}

function Flecha({ direccion }: { direccion: 'izq' | 'der' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={direccion === 'izq' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}
