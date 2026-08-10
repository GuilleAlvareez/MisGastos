-- Esquema de referencia de Finanzas (ControlGastos).
--
-- Es idempotente: se puede ejecutar entero en el SQL Editor de Supabase sobre una
-- base vacía para levantar el proyecto desde cero, o sobre la base existente para
-- comprobar que no falta nada (los CREATE llevan IF NOT EXISTS).
--
-- Modelo de acceso: la app es de un solo usuario y habla con Supabase directamente
-- desde el navegador con la anon key. Por eso las políticas de RLS son abiertas
-- para el rol `anon`. Si publicas la app en una URL accesible, cualquiera con esa
-- URL puede leer y escribir: ver `supabase/auth.sql` para cerrarla por usuario.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- categorias --
-- Etiqueta de gasto con color de la paleta y presupuesto mensual de referencia.
create table if not exists public.categorias (
  id                  uuid primary key default gen_random_uuid(),
  nombre              text not null,
  color               text not null default '#888888',
  presupuesto_mensual numeric(12, 2),
  creado_en           timestamptz not null default now()
);

-- -------------------------------------------------------------------- gastos --
-- `on delete set null`: borrar una categoría no borra su histórico de gastos,
-- que pasan a mostrarse como "Sin categoría".
create table if not exists public.gastos (
  id           uuid primary key default gen_random_uuid(),
  importe      numeric(12, 2) not null,
  categoria_id uuid references public.categorias (id) on delete set null,
  descripcion  text,
  fecha        date not null,
  creado_en    timestamptz not null default now()
);

create index if not exists gastos_fecha_idx on public.gastos (fecha desc);
create index if not exists gastos_categoria_idx on public.gastos (categoria_id);

-- ------------------------------------------------------------- presupuestos --
-- Histórico de límites: un registro por (categoría, mes). El mes se guarda
-- siempre como su día 1 ('YYYY-MM-01'). Si un mes no tiene registro, la app cae
-- al `presupuesto_mensual` de la categoría.
create table if not exists public.presupuestos (
  id           uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categorias (id) on delete cascade,
  mes          date not null,
  limite       numeric(12, 2) not null,
  creado_en    timestamptz not null default now(),
  unique (categoria_id, mes)
);

create index if not exists presupuestos_mes_idx on public.presupuestos (mes);

-- ------------------------------------------------------------------ ingresos --
-- Entradas sueltas, sin categoría: nómina, devoluciones, ventas puntuales.
create table if not exists public.ingresos (
  id        uuid primary key default gen_random_uuid(),
  importe   numeric(12, 2) not null,
  concepto  text,
  fecha     date not null,
  creado_en timestamptz not null default now()
);

create index if not exists ingresos_fecha_idx on public.ingresos (fecha desc);

-- ----------------------------------------------------------------------- RLS --
-- Una política abierta por tabla. `drop ... if exists` antes de crear para que
-- volver a ejecutar el script no falle.
alter table public.categorias   enable row level security;
alter table public.gastos       enable row level security;
alter table public.presupuestos enable row level security;
alter table public.ingresos     enable row level security;

drop policy if exists "acceso abierto categorias"   on public.categorias;
drop policy if exists "acceso abierto gastos"       on public.gastos;
drop policy if exists "acceso abierto presupuestos" on public.presupuestos;
drop policy if exists "acceso abierto ingresos"     on public.ingresos;

create policy "acceso abierto categorias"   on public.categorias   for all using (true) with check (true);
create policy "acceso abierto gastos"       on public.gastos       for all using (true) with check (true);
create policy "acceso abierto presupuestos" on public.presupuestos for all using (true) with check (true);
-- Ojo: esta es la política que faltaba en la instalación original y hacía que la
-- tarjeta de ingresos del Resumen apareciera como "—".
create policy "acceso abierto ingresos"     on public.ingresos     for all using (true) with check (true);
