// Cliente do Supabase — a "nuvem" onde os dados do C.O.S.M.O. vão morar.
// As duas chaves abaixo vêm das variáveis de ambiente configuradas na Vercel
// (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY). A "anon key" é pública por
// design — a segurança real vem das regras de acesso (RLS) no banco.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Se as variáveis não estiverem configuradas ainda, o app avisa em vez de quebrar.
export const supabaseReady = Boolean(url && anonKey);

export const supabase = supabaseReady
  ? createClient(url, anonKey)
  : null;
