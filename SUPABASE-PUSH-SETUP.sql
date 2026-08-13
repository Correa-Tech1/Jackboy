-- ============================================================
--  JACKBOY — Tabela de inscrições de PUSH (notificação com app fechado)
--  Cole TUDO isto no "SQL Editor" do Supabase do JACKBOY e clique em RUN.
-- ============================================================

-- Guarda a "inscrição de push" de cada aparelho. O carteiro (api/cron-notif.js)
-- lê esta tabela pra saber pra onde enviar os empurrões.
create table if not exists public.push_subs (
  endpoint text primary key,            -- identificador único do aparelho/navegador
  subscription text not null,           -- a inscrição completa (JSON), usada pra enviar o push
  user_id uuid,                         -- de quem é o aparelho (pode ser nulo)
  updated_at timestamptz default now()
);

-- Liga a trava de segurança. O acesso a esta tabela é feito SÓ pelo servidor
-- (com a service_role key, que ignora o RLS). Ninguém no navegador mexe aqui.
alter table public.push_subs enable row level security;

-- Nenhuma policy pública é criada de propósito: com RLS ligado e sem policy,
-- o acesso pelo navegador fica bloqueado. Só a service_role (servidor) entra.

-- Pronto. As inscrições de push agora têm onde morar.
