'use client';

/** Celda de dato suelto: etiqueta arriba, cifra grande, pista opcional debajo. */
export default function Kpi({
  etiqueta,
  valor,
  pista,
  tono = 'neutro',
}: {
  etiqueta: string;
  valor: string;
  pista?: string;
  tono?: 'neutro' | 'bien' | 'mal';
}) {
  const color = tono === 'bien' ? 'text-rango' : tono === 'mal' ? 'text-excedido' : 'text-gris-900';

  return (
    <div className="tarjeta p-3.5">
      <p className="etiqueta">{etiqueta}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums tracking-tight ${color}`}>{valor}</p>
      {pista && <p className="mt-0.5 text-[12px] leading-snug text-gris-400">{pista}</p>}
    </div>
  );
}
