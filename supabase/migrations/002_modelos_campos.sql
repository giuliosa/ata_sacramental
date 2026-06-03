-- Migration: 002_modelos_campos
-- Descrição: Adiciona coluna campos para definições dinâmicas de campos do modelo

alter table modelos rename column conteudo to campos;

alter table modelos alter column campos set default '[]'::jsonb;

comment on column modelos.campos is 'Array de definições de campos do modelo: [{id, label, type, required, order}]';
