-- ============================================================
-- Seed: modelo_padrao
-- Descrição: Modelo padrão de ata sacramental baseado no template oficial
-- ATENÇÃO: Ajustar o criado_por para um UUID de adm real antes de rodar
-- ============================================================

-- Insere uma estaca e ala de exemplo para desenvolvimento
insert into estacas (id, nome) values
  ('00000000-0000-0000-0000-000000000001', 'Estaca Recife Leste')
on conflict (nome) do nothing;

insert into alas (id, nome, estaca_id) values
  ('00000000-0000-0000-0000-000000000002', 'Ala Jardim Atlântico', '00000000-0000-0000-0000-000000000001')
on conflict (nome, estaca_id) do nothing;

-- Modelo padrão: espelha exatamente o template do arquivo Ata_sacramental.md
-- O campo conteudo/defaults pode pré-preencher valores fixos (ex: nome da ala)
-- O campo campos_obrigatorios lista o que não pode ficar em branco ao salvar
insert into modelos (id, nome, conteudo, criado_por, ativo)
select
  '00000000-0000-0000-0000-000000000010',
  'Modelo Padrão — Reunião Sacramental',
  '{
    "defaults": {
      "anuncios": [],
      "apoios": [],
      "desobrigacoes": [],
      "discursantes": [
        { "id": "d1", "ordem": 1, "nome": "", "tema": "" },
        { "id": "d2", "ordem": 2, "nome": "", "tema": "" },
        { "id": "d3", "ordem": 3, "nome": "", "tema": "" }
      ]
    },
    "campos_obrigatorios": [
      "presidida_por",
      "dirigida_por",
      "hino_inicial_titulo",
      "oracao_inicial",
      "hino_final_titulo",
      "oracao_encerramento"
    ]
  }'::jsonb,
  id,
  true
from users
where role = 'adm'
limit 1;

-- Nota: este seed assume que já existe pelo menos um adm cadastrado.
-- Em desenvolvimento, crie o primeiro adm manualmente via Supabase dashboard
-- e então rode: npm run db:seed
