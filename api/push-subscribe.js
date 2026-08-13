// Função serverless: registra (ou remove) a "inscrição de push" de um aparelho.
// O app manda pra cá a inscrição gerada pelo navegador; a gente guarda no Supabase
// pra o carteiro (api/cron-notif.js) saber pra onde enviar os empurrões.
//
// Usa a SERVICE_ROLE key do Supabase (chave de admin, só no servidor) pra gravar
// sem depender do login — por isso ela NUNCA pode ir pro navegador.

import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }
  const admin = getAdmin();
  if (!admin) {
    return res.status(503).json({ error: "Push ainda não configurado no servidor." });
  }

  try {
    const { subscription, userId, action } = req.body || {};
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Inscrição inválida." });
    }

    // Remover inscrição (quando o usuário desliga as notificações)
    if (action === "unsubscribe") {
      await admin.from("push_subs").delete().eq("endpoint", subscription.endpoint);
      return res.status(200).json({ ok: true, removed: true });
    }

    // Salvar/atualizar inscrição. endpoint é único → upsert não duplica o mesmo aparelho.
    const row = {
      endpoint: subscription.endpoint,
      subscription: JSON.stringify(subscription),
      user_id: userId || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await admin
      .from("push_subs")
      .upsert(row, { onConflict: "endpoint" });
    if (error) {
      return res.status(500).json({ error: "Falha ao salvar inscrição", detail: error.message });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Erro interno", detail: String(e) });
  }
}
