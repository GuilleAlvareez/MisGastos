'use client';

import { sanearImporte } from '@/lib/format';

/**
 * Campo grande de importe: cifra centrada de 44px con los céntimos separados y el
 * símbolo de euro al lado. El input real es transparente y va superpuesto al
 * "espejo" visual, que es lo que se ve; así se puede maquetar la cifra libremente
 * sin renunciar al teclado numérico del móvil ni al caret nativo.
 *
 * El valor siempre entra ya saneado por `sanearImporte`, de modo que tiene como
 * mucho un separador y dos céntimos y el espejo nunca puede desviarse del valor real.
 */
export default function CampoImporte({
  valor,
  alCambiar,
  etiqueta = 'Importe',
  autoFocus,
}: {
  valor: string;
  alCambiar: (v: string) => void;
  etiqueta?: string;
  autoFocus?: boolean;
}) {
  const [entera, decimal] = valor.split(',');
  const conDecimal = valor.includes(',');

  return (
    <>
      <p className="etiqueta text-center">{etiqueta}</p>
      <label className="mt-2 flex items-baseline justify-center gap-1">
        <span className="sr-only">{etiqueta} en euros</span>
        <span className="relative">
          <span aria-hidden className="text-[44px] font-semibold tabular-nums tracking-tight">
            {entera || '0'}
            {conDecimal && (
              <>
                <span>,</span>
                <span>{decimal}</span>
              </>
            )}
          </span>
          <input
            inputMode="decimal"
            autoFocus={autoFocus}
            value={valor}
            onChange={(e) => alCambiar(sanearImporte(e.target.value))}
            className="absolute inset-0 h-full w-full bg-transparent text-center text-[44px] font-semibold tabular-nums tracking-tight text-transparent caret-gris-900 outline-none"
          />
        </span>
        <span className="text-[28px] font-medium text-gris-400">€</span>
      </label>
    </>
  );
}
