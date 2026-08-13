// ============================================================
//  O CARTEIRO — roda de hora em hora (chamado pelo cron-job.org).
//  1) Lê os compromissos e tarefas de cada usuário no Supabase.
//  2) Descobre o que deve ser avisado nesta hora:
//     - Compromisso: avisa quando falta ~1h ou menos pra ele.
//     - Tarefas: um resumo pela manhã (primeira rodada do dia).
//  3) Dispara o push pros aparelhos inscritos, sem repetir o mesmo aviso.
// ============================================================

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// ---- fuso: o Jackson está no Brasil (UTC-3). O cron roda em UTC. ----
const TZ_OFFSET = -3; // horas

function agoraBrasil() {
  const nowUtc = new Date();
  return new Date(nowUtc.getTime() + TZ_OFFSET * 3600 * 1000);
}

// id do dia da semana no padrão do app (seg..dom) a partir de uma data
function dayId(d) {
  return ["seg", "ter", "qua", "qui", "sex", "sab", "dom"][(d.getUTCDay() + 6) % 7];
}
// chave AAAA-MM-DD (no horário do Brasil) pra controlar "já avisei hoje"
function dateKey(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function getAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export default async function handler(req, res) {
  // Segurança: só roda se vier o segredo certo (evita que qualquer um dispare o carteiro).
  const secret = process.env.CRON_SECRET;
  const auth = req.headers["authorization"] || "";
  const qsSecret = (req.query && req.query.secret) || "";
  if (secret && auth !== `Bearer ${secret}` && qsSecret !== secret) {
    return res.status(401).json({ error: "não autorizado" });
  }

  const admin = getAdmin();
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!admin || !vapidPublic || !vapidPrivate) {
    return res.status(503).json({ error: "servidor de push incompleto (faltam variáveis)" });
  }
  webpush.setVapidDetails("mailto:jackboy@correatech.app", vapidPublic, vapidPrivate);

  const agora = agoraBrasil();
  const horaAtual = agora.getUTCHours();         // hora no Brasil
  const hojeId = dayId(agora);
  const hojeKey = dateKey(agora);
  const ehManha = horaAtual >= 6 && horaAtual <= 9;   // janela do resumo matinal

  try {
    // ---- 1) Carrega inscrições, eventos, tarefas e o log de avisos ----
    const [subsR, evtR, tskR, logR] = await Promise.all([
      admin.from("push_subs").select("*"),
      admin.from("cosmo_store").select("user_id,value").eq("key", "jackboy-events"),
      admin.from("cosmo_store").select("user_id,value").eq("key", "jackboy-tasks"),
      admin.from("cosmo_store").select("user_id,value").eq("key", "jackboy-push-log"),
    ]);

    const subs = subsR.data || [];
    if (!subs.length) return res.status(200).json({ ok: true, msg: "sem aparelhos inscritos" });

    // indexa eventos/tarefas/log por user_id
    const parseVal = (rows) => {
      const m = {};
      (rows || []).forEach((r) => {
        try { m[r.user_id] = JSON.parse(r.value); } catch (e) { m[r.user_id] = null; }
      });
      return m;
    };
    const eventsByUser = parseVal(evtR.data);
    const tasksByUser = parseVal(tskR.data);
    const logByUser = parseVal(logR.data);

    // agrupa aparelhos por usuário (um usuário pode ter vários aparelhos)
    const subsByUser = {};
    const subsSemDono = [];
    for (const s of subs) {
      if (s.user_id) { (subsByUser[s.user_id] = subsByUser[s.user_id] || []).push(s); }
      else subsSemDono.push(s);
    }

    let enviados = 0;
    const paraRemover = [];

    // helper: envia um push pra uma lista de inscrições
    async function enviarPara(lista, payload) {
      for (const s of lista) {
        let sub;
        try { sub = JSON.parse(s.subscription); } catch (e) { continue; }
        try {
          await webpush.sendNotification(sub, JSON.stringify(payload));
          enviados++;
        } catch (err) {
          // 404/410 = inscrição morta (app desinstalado, etc) → marca pra remover
          if (err && (err.statusCode === 404 || err.statusCode === 410)) {
            paraRemover.push(s.endpoint);
          }
        }
      }
    }

    // ---- 2) Para cada usuário com aparelho, decide o que avisar ----
    for (const userId of Object.keys(subsByUser)) {
      const lista = subsByUser[userId];
      const eventos = eventsByUser[userId] || [];
      const tarefas = tasksByUser[userId] || [];
      const log = logByUser[userId] || {};       // { "avisado:2026-08-13:ev-<id>": true, ... }
      let logMudou = false;

      // --- compromissos de HOJE que estão a ~1h ou menos de distância ---
      for (const e of eventos) {
        if (!e || e.day !== hojeId || !e.time) continue;
        const [h, min] = String(e.time).split(":").map((n) => parseInt(n, 10));
        if (isNaN(h)) continue;
        const minutosEvento = h * 60 + (min || 0);
        const minutosAgora = horaAtual * 60 + agora.getUTCMinutes();
        const faltam = minutosEvento - minutosAgora;
        // avisa quando falta entre 0 e 75 min (pega o "1h antes" mesmo o cron rodando na hora cheia)
        if (faltam >= 0 && faltam <= 75) {
          const chave = `av:${hojeKey}:ev-${e.id}`;
          if (log[chave]) continue;              // já avisei este compromisso
          await enviarPara(lista, {
            title: "Compromisso chegando",
            body: `${e.title} às ${e.time}`,
            tag: `ev-${e.id}`,
            url: "/",
          });
          log[chave] = true;
          logMudou = true;
        }
      }

      // --- resumo de tarefas pela manhã (uma vez por dia) ---
      if (ehManha) {
        const chaveManha = `av:${hojeKey}:tarefas-manha`;
        if (!log[chaveManha]) {
          const abertasHoje = [];
          (tarefas || []).forEach((t) => {
            if (t && !t.done && (t.day === hojeId || t.day == null)) abertasHoje.push(t.title);
          });
          if (abertasHoje.length) {
            const corpo = abertasHoje.length === 1
              ? abertasHoje[0]
              : `Você tem ${abertasHoje.length} tarefas pra hoje. Bora, Jackson — um passo de cada vez.`;
            await enviarPara(lista, { title: "Tarefas de hoje", body: corpo, tag: "tarefas-manha", url: "/" });
            log[chaveManha] = true;
            logMudou = true;
          }
        }
      }

      // --- guarda o log atualizado (e faz uma limpeza dos avisos de dias passados) ---
      if (logMudou) {
        const limpo = {};
        for (const k of Object.keys(log)) {
          if (k.includes(hojeKey)) limpo[k] = log[k];   // mantém só os de hoje
        }
        await admin.from("cosmo_store").upsert(
          { user_id: userId, key: "jackboy-push-log", value: JSON.stringify(limpo) },
          { onConflict: "user_id,key" }
        );
      }
    }

    // ---- 3) Remove inscrições mortas ----
    if (paraRemover.length) {
      await admin.from("push_subs").delete().in("endpoint", paraRemover);
    }

    return res.status(200).json({ ok: true, enviados, removidos: paraRemover.length, hora: horaAtual });
  } catch (e) {
    return res.status(500).json({ error: "erro no carteiro", detail: String(e) });
  }
}
