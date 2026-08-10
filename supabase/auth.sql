-- OPCIONAL: cerrar la base por usuario (multiusuario real).
--
-- Solo hace falta si vas a publicar la app en una URL accesible desde fuera o
-- compartirla con otra persona. La instalación por defecto es de un solo usuario
-- con políticas abiertas (ver `schema.sql`) y funciona sin ejecutar nada de aquí.
--
-- CÓMO USARLO
--   1. Crea tu usuario en Supabase → Authentication → Users → Add user.
--   2. Copia su UUID y pégalo en `MI_USUARIO` abajo.
--   3. Ejecuta este script completo en el SQL Editor.
--   4. Pon `NEXT_PUBLIC_AUTH_REQUERIDO=true` en el `.env` de la app y reinicia.
--
-- Es reversible: al final del archivo están los comandos para volver a abrir la
-- base si algo sale mal.
--
-- CUIDADO: el paso 2 asigna TODOS los datos existentes a ese usuario. Si la base
-- ya tuviera datos de varias personas mezclados, repártelos a mano antes.

do $$
declare
  -- 👇 Pega aquí el UUID de tu usuario antes de ejecutar.
  MI_USUARIO uuid := '00000000-0000-0000-0000-000000000000';
  t text;
begin
  if MI_USUARIO = '00000000-0000-0000-0000-000000000000' then
    raise exception 'Rellena MI_USUARIO con el UUID de tu usuario de Supabase Auth.';
  end if;

  -- 1. Columna user_id en las cuatro tablas, apuntando a auth.users.
  foreach t in array array['categorias', 'gastos', 'presupuestos', 'ingresos'] loop
    execute format(
      'alter table public.%I add column if not exists user_id uuid references auth.users (id) on delete cascade',
      t
    );

    -- 2. Los datos que ya había pasan a ser tuyos.
    execute format('update public.%I set user_id = %L where user_id is null', t, MI_USUARIO);

    -- 3. A partir de ahora es obligatoria y se rellena sola con el usuario de la sesión.
    execute format('alter table public.%I alter column user_id set not null', t);
    execute format('alter table public.%I alter column user_id set default auth.uid()', t);
    execute format('create index if not exists %I on public.%I (user_id)', t || '_user_idx', t);

    -- 4. Fuera la política abierta, dentro la política por usuario.
    execute format('drop policy if exists "acceso abierto %s" on public.%I', t, t);
    execute format('drop policy if exists "solo mis %s" on public.%I', t, t);
    execute format(
      'create policy "solo mis %s" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t, t
    );
  end loop;
end $$;

-- El unique de presupuestos pasa a ser por usuario: dos personas pueden tener
-- presupuesto de la misma categoría el mismo mes.
alter table public.presupuestos drop constraint if exists presupuestos_categoria_id_mes_key;
create unique index if not exists presupuestos_usuario_categoria_mes_key
  on public.presupuestos (user_id, categoria_id, mes);

-- ------------------------------------------------------------------ REVERTIR --
-- Descomenta y ejecuta esto para volver a la base abierta de un solo usuario.
--
-- drop policy if exists "solo mis categorias"   on public.categorias;
-- drop policy if exists "solo mis gastos"       on public.gastos;
-- drop policy if exists "solo mis presupuestos" on public.presupuestos;
-- drop policy if exists "solo mis ingresos"     on public.ingresos;
-- create policy "acceso abierto categorias"   on public.categorias   for all using (true) with check (true);
-- create policy "acceso abierto gastos"       on public.gastos       for all using (true) with check (true);
-- create policy "acceso abierto presupuestos" on public.presupuestos for all using (true) with check (true);
-- create policy "acceso abierto ingresos"     on public.ingresos     for all using (true) with check (true);
