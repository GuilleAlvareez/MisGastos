# Finanzas

App de control de gastos personales. PWA instalable en el móvil, pensada para
apuntar un gasto en dos toques y ver de un vistazo cuánto llevas gastado del mes
y cuánto te queda de presupuesto.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** en modo estricto.
- **Tailwind CSS** con una paleta cerrada: un acento único y un semáforo de tres
  colores para los presupuestos.
- **Recharts** para las gráficas.
- **Supabase** (PostgreSQL) como único backend. No hay API propia: el cliente
  habla con Supabase directamente desde el navegador.
- **PWA**: `public/manifest.json` + service worker mínimo (`public/sw.js`) que
  solo cachea los iconos del arranque. Los datos nunca se cachean.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # y rellena las dos variables
npm run dev
```

Las variables (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
están en Supabase → Project Settings → API. Sin ellas la app arranca pero cada
pantalla avisa de que falta la configuración.

Para crear la base de datos desde cero, ejecuta `supabase/schema.sql` en el SQL
Editor de Supabase. Es idempotente, así que también sirve para comprobar que a
una base ya existente no le falta ninguna tabla, índice ni política de RLS.

## Base de datos

| Tabla | Para qué |
| --- | --- |
| `categorias` | Etiquetas de gasto: nombre, color y presupuesto mensual de referencia. |
| `gastos` | Cada gasto: importe, fecha, categoría (opcional) y descripción. |
| `presupuestos` | Histórico de límites, un registro por categoría y mes (`YYYY-MM-01`). |
| `ingresos` | Entradas sueltas con concepto libre, sin categoría. |

Dos detalles del modelo que condicionan el código:

- Un gasto puede quedarse **sin categoría** (`categoria_id` es nullable y la FK es
  `on delete set null`), así que borrar una categoría no borra su histórico.
- El límite de un mes sale de `presupuestos`; si ese mes no tiene registro, se cae
  al `presupuesto_mensual` de la categoría. Toda la app respeta ese *fallback*.

**Seguridad:** las políticas de RLS son abiertas para el rol `anon`, es decir, la
app asume un único usuario de confianza. Si vas a publicarla en una URL accesible
desde fuera, cierra el acceso siguiendo `supabase/auth.sql`.

## Estructura

```
app/              rutas del App Router (una carpeta por pantalla)
components/
  charts/         gráficas de Recharts, cada una con su tipo de dato
  layout/         Header, Sidebar, TabBar y el contexto del mes activo
hooks/            un hook por tabla: lectura reactiva + mutaciones
lib/
  colores.ts      paleta, resolución de categorías y semáforo de presupuesto
  format.ts       euros, fechas y claves de mes (todo es-ES)
  eventos.ts      pub-sub mínimo para recargar las vistas tras una escritura
  types.ts        espejo del esquema de Supabase
supabase/         SQL de referencia y migraciones
```

Dos convenciones que conviene conocer antes de tocar código:

- **El mes activo vive en un contexto** (`components/layout/MesContext.tsx`) y lo
  comparten todas las pantallas. Ninguna guarda su propio mes.
- **Después de escribir en Supabase se llama a `avisarDatosCambiados()`**
  (`lib/eventos.ts`). Todos los hooks de lectura están suscritos, así que las
  pantallas montadas se refrescan solas sin recargar la web.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Build de producción. |
| `npm run lint` | ESLint de Next. |
