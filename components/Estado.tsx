'use client';

export function Cargando({ filas = 3 }: { filas?: number }) {
  return (
    <div className="space-y-3 py-4" role="status" aria-label="Cargando">
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-gris-100" />
      ))}
    </div>
  );
}

export function ErrorAviso({ mensaje }: { mensaje: string }) {
  return (
    <div className="my-4 rounded-tarjeta border border-excedido/20 bg-excedido-bg px-4 py-3" role="alert">
      <p className="text-sm font-semibold text-excedido">No se han podido cargar los datos</p>
      <p className="mt-1 text-[13px] leading-snug text-excedido/90">{mensaje}</p>
    </div>
  );
}

export function Vacio({ mensaje }: { mensaje: string }) {
  return <p className="py-10 text-center text-sm text-gris-400">{mensaje}</p>;
}
