-- ============================================================
-- NOVAS FUNCIONALIDADES: notas internas, tempo real, upload de anexos
-- Rode isso no SQL Editor do Supabase, de cima pra baixo.
-- ============================================================

-- ------------------------------------------------------------
-- 1) NOTAS INTERNAS DA EQUIPE — mensagem no histórico do chamado
--    que o cliente NUNCA vê, só a equipe.
-- ------------------------------------------------------------
alter table ticket_historico add column if not exists interno boolean not null default false;

drop policy if exists "cliente ve historico dos proprios tickets" on ticket_historico;
create policy "cliente ve historico publico dos proprios tickets" on ticket_historico
  for select using (
    interno = false
    and exists (select 1 from tickets t where t.id = ticket_id and cliente_pertence_ao_usuario(t.cliente_id))
  );
-- (a política "empresa gerencia historico" já existente continua garantindo que
-- a equipe veja e crie tanto notas internas quanto mensagens públicas)

-- ------------------------------------------------------------
-- 2) TEMPO REAL — permite que o app receba atualizações ao vivo
--    (chamados, histórico, notificações, caixa) sem precisar de F5.
-- ------------------------------------------------------------
alter publication supabase_realtime add table tickets;
alter publication supabase_realtime add table ticket_historico;
alter publication supabase_realtime add table notificacoes;
alter publication supabase_realtime add table caixa_lancamentos;

-- ------------------------------------------------------------
-- 3) UPLOAD DE ANEXOS — políticas do bucket de armazenamento.
--    IMPORTANTE: antes de rodar este bloco, crie o bucket no painel:
--    Storage → New bucket → nome exatamente "anexos" → Private (desmarcado "Public").
-- ------------------------------------------------------------
create policy "empresa gerencia anexos no storage" on storage.objects
  for all using (bucket_id = 'anexos' and is_empresa())
  with check (bucket_id = 'anexos' and is_empresa());
