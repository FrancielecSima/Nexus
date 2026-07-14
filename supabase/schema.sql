-- ============================================================
-- SISTEMA NEXUS — Schema Supabase (Postgres) — v2
-- Atualizado para refletir: periodicidade de cobrança, status de
-- pagamento real, categoria/recorrência de gastos, timestamps reais
-- de SLA, responsável pelo chamado, avaliação (CSAT), equipe interna
-- e trilha de auditoria.
--
-- Rode isso no SQL Editor do seu projeto Supabase, de cima pra baixo.
-- Se você já rodou a v1 deste schema, veja as notas de migração no
-- final do arquivo antes de rodar tudo de novo.
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES — estende o auth.users do Supabase
-- ------------------------------------------------------------
create type user_role as enum ('empresa', 'cliente');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'cliente',
  nome text not null,
  cargo text,                                   -- só para role='empresa' (ex: "Suporte Técnico")
  must_change_password boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. CLIENTES — agora com periodicidade de cobrança
-- ------------------------------------------------------------
create type periodicidade_cobranca as enum ('mensal', 'trimestral', 'anual');

create table clientes (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  nome text not null,
  empresa text not null,
  cnpj text not null,
  email text not null,
  endereco text not null,
  servico text not null,
  valor_cobranca numeric(10,2) not null default 0,       -- valor cobrado a cada ciclo
  periodicidade periodicidade_cobranca not null default 'mensal',
  cor_primaria text not null default '#FF6A2B',
  cor_secundaria text not null default '#1E1F24',
  sigla text not null default 'C',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. SERVIÇOS
-- ------------------------------------------------------------
create table servicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  valor numeric(10,2) not null,
  comissao_percent numeric(5,2) not null default 20,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. EQUIPE INTERNA — cada pessoa da equipe tem login próprio,
--    permitindo saber quem fez o quê (chamado, edição, auditoria).
-- ------------------------------------------------------------
create table equipe (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  cargo text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. CHAMADOS — com timestamps reais de SLA, responsável e avaliação
-- ------------------------------------------------------------
create type ticket_status as enum ('em_atendimento', 'aguardando_retorno', 'encerrado');

create table tickets (
  id uuid primary key default gen_random_uuid(),
  numero serial unique,
  cliente_id uuid not null references clientes(id) on delete cascade,
  responsavel_id uuid references equipe(id) on delete set null,
  titulo text not null,
  status ticket_status not null default 'em_atendimento',
  prioridade text not null default 'Média',
  categoria text not null,
  descricao text not null,
  criado_em timestamptz not null default now(),
  primeira_resposta_em timestamptz,
  encerrado_em timestamptz,
  avaliacao smallint check (avaliacao between 1 and 5),
  created_at timestamptz not null default now()
);

create table ticket_historico (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  texto text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 6. CAIXA — agora com status de pagamento real
-- ------------------------------------------------------------
create type status_pagamento as enum ('pendente', 'pago', 'cancelado');

create table caixa_lancamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  valor numeric(10,2) not null,
  vencimento date not null,
  status status_pagamento not null default 'pendente',
  data_pagamento date,
  anexo_boleto_url text,
  anexo_nota_url text,
  created_at timestamptz not null default now()
);
-- "Atrasado" não é um status gravado — é calculado (status='pendente' e vencimento < hoje).
-- Ver a view abaixo.

create view caixa_com_status_efetivo as
select *,
  case
    when status = 'pago' then 'pago'
    when status = 'cancelado' then 'cancelado'
    when vencimento < current_date then 'atrasado'
    else 'pendente'
  end as status_efetivo
from caixa_lancamentos;

-- ------------------------------------------------------------
-- 7. ORÇAMENTOS
-- ------------------------------------------------------------
create table orcamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  servico_id uuid references servicos(id) on delete set null,
  item text not null,
  valor numeric(10,2) not null,
  comissao numeric(10,2) not null default 0,
  status text not null default 'Em análise',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 8. GASTOS — agora com categoria e recorrência
-- ------------------------------------------------------------
create type categoria_gasto as enum ('Fixo', 'Variável');

create table gastos (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  valor numeric(10,2) not null,
  vencimento date not null,
  categoria categoria_gasto not null default 'Variável',
  recorrente boolean not null default false,
  created_at timestamptz not null default now()
);

create table terceirizados (
  id uuid primary key default gen_random_uuid(),
  parceiro text not null,
  servico text not null,
  custo numeric(10,2) not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 9. NOTIFICAÇÕES
-- ------------------------------------------------------------
create table notificacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  texto text not null,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 10. AUDITORIA — trilha de alterações sensíveis
-- ------------------------------------------------------------
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users(id) on delete set null,
  acao text not null,
  detalhe text,
  criado_em timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table clientes enable row level security;
alter table servicos enable row level security;
alter table equipe enable row level security;
alter table tickets enable row level security;
alter table ticket_historico enable row level security;
alter table caixa_lancamentos enable row level security;
alter table orcamentos enable row level security;
alter table gastos enable row level security;
alter table terceirizados enable row level security;
alter table notificacoes enable row level security;
alter table audit_log enable row level security;

create or replace function is_empresa()
returns boolean language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'empresa');
$$;

create or replace function cliente_pertence_ao_usuario(p_cliente_id uuid)
returns boolean language sql stable as $$
  select exists (select 1 from clientes where id = p_cliente_id and auth_user_id = auth.uid());
$$;

create policy "ver proprio perfil ou equipe ve tudo" on profiles
  for select using (id = auth.uid() or is_empresa());

create policy "empresa gerencia clientes" on clientes
  for all using (is_empresa()) with check (is_empresa());
create policy "cliente ve proprio cadastro" on clientes
  for select using (auth_user_id = auth.uid());

create policy "empresa gerencia servicos" on servicos
  for all using (is_empresa()) with check (is_empresa());
create policy "logados leem servicos" on servicos
  for select using (auth.uid() is not null);

create policy "empresa ve equipe" on equipe
  for select using (is_empresa());
create policy "empresa gerencia equipe" on equipe
  for all using (is_empresa()) with check (is_empresa());

create policy "empresa gerencia tickets" on tickets
  for all using (is_empresa()) with check (is_empresa());
create policy "cliente ve proprios tickets" on tickets
  for select using (cliente_pertence_ao_usuario(cliente_id));
create policy "cliente cria proprio ticket" on tickets
  for insert with check (cliente_pertence_ao_usuario(cliente_id));
create policy "cliente avalia proprio ticket encerrado" on tickets
  for update using (cliente_pertence_ao_usuario(cliente_id) and status = 'encerrado');

create policy "empresa gerencia historico" on ticket_historico
  for all using (is_empresa()) with check (is_empresa());
create policy "cliente ve historico dos proprios tickets" on ticket_historico
  for select using (
    exists (select 1 from tickets t where t.id = ticket_id and cliente_pertence_ao_usuario(t.cliente_id))
  );

create policy "empresa gerencia caixa" on caixa_lancamentos
  for all using (is_empresa()) with check (is_empresa());
create policy "empresa gerencia orcamentos" on orcamentos
  for all using (is_empresa()) with check (is_empresa());
create policy "empresa gerencia gastos" on gastos
  for all using (is_empresa()) with check (is_empresa());
create policy "empresa gerencia terceirizados" on terceirizados
  for all using (is_empresa()) with check (is_empresa());

create policy "ve proprias notificacoes" on notificacoes
  for select using (user_id = auth.uid());
create policy "marca proprias notificacoes como lidas" on notificacoes
  for update using (user_id = auth.uid());
create policy "sistema cria notificacoes" on notificacoes
  for insert with check (auth.uid() is not null);

create policy "empresa ve auditoria" on audit_log
  for select using (is_empresa());
create policy "empresa cria registro de auditoria" on audit_log
  for insert with check (is_empresa());

-- ============================================================
-- NOTAS DE MIGRAÇÃO (se você já tinha rodado a v1 deste schema)
-- ============================================================
-- alter table clientes rename column valor_mensal to valor_cobranca;
-- alter table clientes add column periodicidade periodicidade_cobranca not null default 'mensal';
-- alter table caixa_lancamentos add column status status_pagamento not null default 'pendente';
-- alter table caixa_lancamentos add column data_pagamento date;
-- alter table gastos add column categoria categoria_gasto not null default 'Variável';
-- alter table gastos add column recorrente boolean not null default false;
-- alter table tickets add column responsavel_id uuid references equipe(id);
-- alter table tickets add column primeira_resposta_em timestamptz;
-- alter table tickets add column encerrado_em timestamptz;
-- alter table tickets add column avaliacao smallint check (avaliacao between 1 and 5);
-- (equipe e audit_log são tabelas novas — só rodar os CREATE TABLE de cada uma)
