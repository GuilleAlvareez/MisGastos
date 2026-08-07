# Finanzas (ControlGastos)

Web app de finanzas personales sobre Next.js (App Router) + Supabase, instalable como PWA
en la pantalla de inicio del iPhone (modo standalone desde Safari).

## Arranque

1. Copia `.env.example` a `.env` y rellena las dos variables del proyecto de Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Instala y arranca:

```bash
npm install && npm run dev
```

Si faltan las variables, la app arranca igual y cada página muestra el aviso en vez de
datos vacíos silenciosos.

## Instalar en el iPhone

Abre la URL en Safari → Compartir → *Añadir a pantalla de inicio*. Se abre sin barra de
direcciones (`display: standalone`), respeta notch y barra inferior vía
`env(safe-area-inset-*)` y usa `/icons/apple-touch-icon.png` como icono.

Para probarlo desde el iPhone en local, sirve la app en la IP de la máquina
(`npm run dev -- -H 0.0.0.0`) y entra por `http://<ip-del-pc>:3000`. iOS solo instala en
modo standalone desde una URL servida; con HTTPS (producción) además registra el service
worker mínimo de `public/sw.js`.

## Datos

El esquema de Supabase (`categorias`, `gastos`, `presupuestos`, `ingresos`) ya existe y lo
alimenta un flujo de n8n desde Telegram. La app es de **solo lectura** salvo un punto:

- escribe únicamente en `gastos`, con el alta manual del botón **+**
- `categorias` y `presupuestos` se consultan pero no se modifican desde la app (se gestionan
  en Supabase / n8n)

Detalles que la UI ya contempla:

- `gastos.categoria_id` puede ser `null` → se muestra como **Sin categoría** en gris.
- `presupuestos` es histórico: manda el registro del mes activo; si no existe, se usa
  `categorias.presupuesto_mensual`.
- `ingresos` no tiene `categoria_id`; se usa solo para Ingresos/Saldo del resumen. Si la
  tabla no tiene la política de RLS abierta, el dashboard lo avisa en lugar de romperse.

## Estructura

```
app/            páginas (Resumen, Movimientos, Presupuestos, Estadísticas)
components/     UI: tarjetas, barras, gráficos (recharts), navegación, hoja de nuevo gasto
hooks/          acceso a Supabase (useGastos, useCategorias, usePresupuestos, useIngresos)
lib/            cliente de Supabase, tipos del esquema, formato es-ES, paleta y semáforo
public/         manifest.json, sw.js e iconos de la PWA
```

## Nota de desarrollo

No lances `npm run build` con `npm run dev` levantado: ambos escriben en `.next` y el dev
server acaba sirviendo chunks corruptos (`__webpack_modules__[moduleId] is not a function`).
Si pasa, para el server, `rm -rf .next` y vuelve a arrancar.
