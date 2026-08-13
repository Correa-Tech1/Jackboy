// Função serverless da Vercel: a "voz" do C.O.S.M.O.
// Recebe um texto, chama a API de voz (TTS) da OpenAI e devolve um áudio MP3.
// A chave da OpenAI fica guardada como variável de ambiente (OPENAI_API_KEY)
// e NUNCA aparece no navegador. Enquanto a chave não estiver configurada,
// retorna 503 e o app usa a voz gratuita do navegador como reserva.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Chave ainda não configurada — o app cai na voz do navegador (fallback).
    return res.status(503).json({ error: "Voz premium ainda não configurada." });
  }

  try {
    const { text, voice, format } = req.body || {};
    const clean = String(text || "").trim();
    if (!clean) {
      return res.status(400).json({ error: "Texto vazio." });
    }
    // limite de segurança: evita textos gigantes (e gasto acidental)
    const limited = clean.slice(0, 4000);

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts", // modelo de voz mais recente e barato
        input: limited,
        voice: voice || "onyx",   // voz padrão (pode ser trocada pelo app)
        response_format: format || "mp3",
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: "Falha na geração de voz", detail });
    }

    // a OpenAI devolve o áudio binário — repassamos como MP3
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(500).json({ error: "Erro interno na voz", detail: String(err) });
  }
}
