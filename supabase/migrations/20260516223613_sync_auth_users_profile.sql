-- ============================================================
-- Migration: sync_auth_users_profile
-- Descrição: cria/atualiza perfis públicos a partir de auth.users
-- ============================================================

create schema if not exists private;

revoke all on schema private from anon, authenticated;

create or replace function private.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1),
      'Usuário'
    )
  )
  on conflict (id) do update
    set
      email = excluded.email,
      name = excluded.name;

  return new;
end;
$$;

revoke all on function private.sync_auth_user_profile() from public, anon, authenticated;

drop trigger if exists trg_sync_auth_user_profile on auth.users;

create trigger trg_sync_auth_user_profile
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute function private.sync_auth_user_profile();

insert into public.users (id, email, name)
select
  id,
  coalesce(email, ''),
  coalesce(
    raw_user_meta_data ->> 'full_name',
    raw_user_meta_data ->> 'name',
    split_part(coalesce(email, ''), '@', 1),
    'Usuário'
  )
from auth.users
on conflict (id) do update
  set
    email = excluded.email,
    name = excluded.name;

drop policy if exists "Usuário atualiza próprio perfil" on users;
drop policy if exists "Usuário atualiza próprio perfil básico" on users;

create policy "Usuário atualiza próprio perfil básico"
  on users for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = get_user_role()
    and ala_id is not distinct from get_user_ala_id()
  );

drop policy if exists "Usuário vincula primeira ala" on users;

create policy "Usuário vincula primeira ala"
  on users for update
  to authenticated
  using (
    id = auth.uid()
    and ala_id is null
  )
  with check (
    id = auth.uid()
    and role = get_user_role()
    and ala_id is not null
  );
