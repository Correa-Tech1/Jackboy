// Função serverless da Vercel: o "cérebro seguro" do C.O.S.M.O.
// A chave da API fica guardada como variável de ambiente (ANTHROPIC_API_KEY)
// e NUNCA aparece no navegador. Só entra em ação depois que você configurar a
// chave na Vercel (Marco 2). Antes disso, retorna 503 e o app usa os textos de fallback.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Marco 1: chave ainda não configurada. O app trata isso graciosamente.
    return res.status(503).json({ error: "C.O.S.M.O. ainda não está conectado à IA." });
  }

  try {
    const { system, messages, max_tokens } = req.body || {};

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: max_tokens || 1100,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: "Falha na IA", detail });
    }

    const data = await response.json();
    return res.status(200).json({ content: data.content });
  } catch (e) {
    return res.status(500).json({ error: "Erro interno", detail: String(e) });
  }
}
