-- ============================================================
--  C.O.S.M.O. — Configuração do banco de dados (Marco 3)
--  Cole TUDO isto no "SQL Editor" do Supabase e clique em RUN.
-- ============================================================

-- 1) A tabela onde os dados do C.O.S.M.O. vão morar.
--    Cada linha = um pedaço de dado (projetos, hábitos, etc.) de um usuário.
create table if not exists public.cosmo_store (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value text,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

-- 2) Liga a "trava de segurança" (Row Level Security).
--    Sem isto, qualquer um poderia ver os dados de todos. COM isto,
--    cada pessoa só enxerga e mexe nos próprios dados.
alter table public.cosmo_store enable row level security;

-- 3) As regras: um usuário só pode ler/gravar/atualizar/apagar as linhas dele.
create policy "cosmo_select_own"
  on public.cosmo_store for select
  using (auth.uid() = user_id);

create policy "cosmo_insert_own"
  on public.cosmo_store for insert
  with check (auth.uid() = user_id);

create policy "cosmo_update_own"
  on public.cosmo_store for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cosmo_delete_own"
  on public.cosmo_store for delete
  using (auth.uid() = user_id);

-- Pronto. Seus dados agora têm um lar seguro na nuvem.
