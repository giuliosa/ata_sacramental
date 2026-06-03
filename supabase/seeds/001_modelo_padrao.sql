insert into estacas (id, nome) values
  ('00000000-0000-0000-0000-000000000001', 'Estaca Recife Leste')
on conflict (nome) do nothing;

insert into alas (id, nome, estaca_id) values
  ('00000000-0000-0000-0000-000000000002', 'Ala Jardim Atlântico', '00000000-0000-0000-0000-000000000001')
on conflict (nome, estaca_id) do nothing;

insert into modelos (id, nome, campos, criado_por, ativo)
select
  '00000000-0000-0000-0000-000000000010',
  'Modelo Padrão — Reunião Sacramental',
  '[
    {"id":"presidente","label":"Presidida por","type":"text","required":true,"order":1},
    {"id":"dirigente","label":"Dirigida por","type":"text","required":true,"order":2},
    {"id":"regente","label":"Regente","type":"text","required":false,"order":3},
    {"id":"pianista","label":"Pianista","type":"text","required":false,"order":4},
    {"id":"hino_inicial_num","label":"Nº do hino inicial","type":"number","required":false,"order":5},
    {"id":"hino_inicial_tit","label":"Título do hino inicial","type":"text","required":true,"order":6},
    {"id":"oracao_inicial","label":"Oração inicial","type":"text","required":true,"order":7},
    {"id":"anuncios","label":"Anúncios","type":"list","required":false,"order":8},
    {"id":"apoios","label":"Apoios","type":"list","required":false,"order":9},
    {"id":"desobrigacoes","label":"Desobrigações","type":"list","required":false,"order":10},
    {"id":"hino_sacra_num","label":"Nº do hino sacramental","type":"number","required":false,"order":11},
    {"id":"hino_sacra_tit","label":"Título do hino sacramental","type":"text","required":false,"order":12},
    {"id":"discursantes","label":"Discursantes","type":"list","required":true,"order":13},
    {"id":"hino_inter_num","label":"Nº do hino interm.","type":"number","required":false,"order":14},
    {"id":"hino_inter_tit","label":"Título do hino interm.","type":"text","required":false,"order":15},
    {"id":"hino_final_num","label":"Nº do hino final","type":"number","required":false,"order":16},
    {"id":"hino_final_tit","label":"Título do hino final","type":"text","required":true,"order":17},
    {"id":"oracao_final","label":"Oração de encerramento","type":"text","required":true,"order":18}
  ]'::jsonb,
  id,
  true
from users
where role = 'adm'
limit 1;
