-- ============================================================
-- FIX: política de notificações permitia que qualquer usuário logado
-- inserisse notificações em nome de QUALQUER outro usuário.
-- Rode isso no SQL Editor do Supabase.
-- ============================================================

-- 1) Substitui a política antiga (muito permissiva) por uma restrita:
--    só pode inserir notificação pra si mesmo, OU se for da empresa
--    (que legitimamente notifica clientes específicos).
drop policy if exists "sistema cria notificacoes" on notificacoes;

create policy "cria notificacao propria ou empresa notifica cliente" on notificacoes
  for insert with check (user_id = auth.uid() or is_empresa());

-- 2) Função seleção seguraa (security definer) para o CLIENTE conseguir
--    avisar toda a equipe (ex: abriu chamado, avaliou atendimento) sem
--    precisar de permissão de escrita direta na notificação de terceiros.
create or replace function notify_empresa(texto text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Não autenticado.';
  end if;

  insert into notificacoes (user_id, texto)
  select id, texto from equipe where ativo = true;
end;
$$;

grant execute on function notify_empresa(text) to authenticated;
