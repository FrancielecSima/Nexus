-- ============================================================
-- FIX: a tabela `profiles` só tinha política de SELECT — nunca teve
-- permissão de UPDATE. Por isso, ao trocar a senha no primeiro acesso,
-- a atualização de must_change_password=false era bloqueada em
-- silêncio pelo RLS, e o sistema ficava preso num loop voltando pra
-- tela de "Primeiro acesso" pra sempre.
-- Rode isso no SQL Editor do Supabase.
-- ============================================================

create policy "atualiza proprio perfil" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
