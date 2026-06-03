-- ============================================================
-- Migration: 003_resource_permissions
-- Descrição: Compartilhamento de atas entre usuários
-- ============================================================

-- Enum de níveis de permissão
create type permission_level as enum ('viewer', 'editor', 'owner');

-- Tabela de permissões por recurso
create table resource_permissions (
  id              uuid primary key default uuid_generate_v4(),
  resource_type   text not null default 'ata',
  resource_id     uuid not null,
  user_id         uuid references users(id) on delete cascade,
  permission_level permission_level not null default 'viewer',
  invited_by      uuid references users(id) on delete set null,
  invited_email   text,
  token           text unique,
  accepted_at     timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),

  constraint uq_resource_permission unique (resource_type, resource_id, user_id),
  constraint chk_resource_type check (resource_type = 'ata'),
  constraint chk_user_or_email check (user_id is not null or (invited_email is not null and token is not null))
);

comment on table resource_permissions is 'Compartilhamento de recursos (atas) entre usuários';

create index idx_resource_permissions_resource on resource_permissions (resource_type, resource_id);
create index idx_resource_permissions_user on resource_permissions (user_id);
create index idx_resource_permissions_token on resource_permissions (token) where token is not null;
create index idx_resource_permissions_pending on resource_permissions (invited_email) where accepted_at is null;

-- ─── RLS ────────────────────────────────────────────────────

alter table resource_permissions enable row level security;

-- Helper: verifica se usuário tem permissão em uma ata
create or replace function has_ata_permission(ata_id uuid, min_level permission_level default 'viewer')
returns boolean as $$
declare
  user_role text;
begin
  -- Admins sempre têm acesso
  select role::text into user_role from users where id = auth.uid();
  if user_role = 'adm' then
    return true;
  end if;

  -- Verifica permissão direta no resource_permissions
  return exists (
    select 1 from resource_permissions
    where resource_type = 'ata'
      and resource_id = ata_id
      and user_id = auth.uid()
      and accepted_at is not null
      and (
        (min_level = 'viewer') or
        (min_level = 'editor' and permission_level in ('editor', 'owner')) or
        (min_level = 'owner' and permission_level = 'owner')
      )
  );
end;
$$ language plpgsql security definer stable;

-- Leitura: dono da permissão ou quem convidou ou adm
create policy "Usuário vê próprias permissões ou adm vê todas"
  on resource_permissions for select
  to authenticated
  using (
    user_id = auth.uid()
    or invited_by = auth.uid()
    or get_user_role() = 'adm'
  );

-- Inserção: apenas adm pode adicionar permissões
create policy "Adm pode gerenciar permissões"
  on resource_permissions for insert
  to authenticated
  with check (get_user_role() = 'adm');

create policy "Adm pode atualizar permissões"
  on resource_permissions for update
  to authenticated
  using (get_user_role() = 'adm')
  with check (get_user_role() = 'adm');

create policy "Adm pode excluir permissões"
  on resource_permissions for delete
  to authenticated
  using (get_user_role() = 'adm');

-- ─── Atualização das políticas de atas ──────────────────────

-- Drop existing policies
drop policy if exists "Usuário vê atas da própria ala" on atas;
drop policy if exists "Apenas adm pode editar atas" on atas;

-- Nova política de SELECT: própria ala OU tem permissão compartilhada
create policy "Usuário vê atas da própria ala ou compartilhadas"
  on atas for select
  to authenticated
  using (
    ala_id = get_user_ala_id()
    or has_ata_permission(id, 'viewer')
  );

-- Nova política de UPDATE: própria ala + adm OU tem permissão de editor
create policy "Usuário pode editar atas permitidas"
  on atas for update
  to authenticated
  using (
    (ala_id = get_user_ala_id() and get_user_role() = 'adm')
    or has_ata_permission(id, 'editor')
  )
  with check (
    (ala_id = get_user_ala_id() and get_user_role() = 'adm')
    or has_ata_permission(id, 'editor')
  );
