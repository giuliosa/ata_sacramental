-- 004: Default role = editor, modelos scoped by ala

-- Change default role from reader to editor
alter table users alter column role set default 'editor';

-- Add ala_id initially as nullable, then backfill
alter table modelos add column ala_id uuid references alas(id) on delete restrict;

update modelos set ala_id = (select ala_id from users where id = modelos.criado_por);

alter table modelos alter column ala_id set not null;

-- Drop old modelos policies
drop policy if exists "Autenticados podem ver modelos ativos" on modelos;
drop policy if exists "Apenas adm gerencia modelos" on modelos;

-- SELECT: see active modelos from own ala; adm sees all
create policy "Modelos visíveis por ala"
  on modelos for select
  to authenticated
  using (
    (ativo = true and ala_id = get_user_ala_id())
    or get_user_role() = 'adm'
  );

-- INSERT: editors and adm can create modelos for their ala
create policy "Usuários podem criar modelos"
  on modelos for insert
  to authenticated
  with check (
    get_user_role() in ('adm', 'editor')
    and ala_id = get_user_ala_id()
  );

-- UPDATE: only adm
create policy "Apenas adm atualiza modelos"
  on modelos for update
  to authenticated
  using (get_user_role() = 'adm')
  with check (get_user_role() = 'adm');

-- DELETE: only adm
create policy "Apenas adm exclui modelos"
  on modelos for delete
  to authenticated
  using (get_user_role() = 'adm');
