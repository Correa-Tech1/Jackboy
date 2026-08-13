import { useState, useEffect, useMemo, useRef } from "react";
import {
  Orbit,
  CalendarClock,
  MessageCircle,
  Lightbulb,
  Trophy,
  Heart,
  GraduationCap,
  Home,
  BookOpen,
  Zap,
  Sparkles,
  CheckCircle,
  Circle,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Send,
  Trash2,
  Flame,
  Rocket,
  ArrowLeft,
  Check,
  Star,
  Pencil,
  Loader2,
  HeartPulse,
  Church,
  Briefcase,
  Cross,
  HeartHandshake,
  Dumbbell,
  Salad,
  BookMarked,
  Pill,
  Sunrise,
  Newspaper,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Square,
  Pause,
  ListTodo,
  FolderKanban,
  LogOut,
} from "lucide-react";
import ServicosScreen from "./Servicos.jsx";
import { LOGO_CORREA_TECH } from "./logoCorreaTech.js";

// ============ PALETA (azul elétrico / HUD Stark-Wayne) ============
const C = {
  // fundos: preto (estilo C.O.S.M.O.), com leve profundidade
  bg0: "#0A0A0C",          // fundo base (quase preto)
  bg1: "#141519",          // um degrau acima (painéis/cards)
  panel: "rgba(255,255,255,0.05)",
  panelBorder: "rgba(255,255,255,0.09)",
  // textos: claros sobre o preto
  ink: "#F4F5F7",
  inkSoft: "#D2D4D8",
  inkMute: "#9DA0A6",
  inkFaint: "#6E7178",
  // ACENTOS: azul + amarelo (engenharia elétrica) — mantidos
  blue: "#4FA3E0",         // azul principal (botões, ícones ativos)
  blueBright: "#F2C230",   // AMARELO de destaque (ênfase, ativo) — dupla com o azul
  blueLight: "#7FC0EE",    // azul claro suave
  bluePale: "#A9D5F2",
  blueDeep: "#2E7CB8",     // azul profundo (barras de progresso)
  blueLine: "rgba(79,163,224,0.45)",
  gold: "#F2C230",         // amarelo (compromissos, estrelas)
  danger: "#E8705F",
  green: "#43C08A",        // verde vivo — usado nos check/toggles concluídos
  // cores elétricas nomeadas (uso direto nas animações/detalhes)
  amarelo: "#F2C230",
  azul: "#4FA3E0",
};
// cores vivas — usadas SÓ em pontos/ícones de categoria, com parcimônia (nunca em fundos)
const AREA_COLOR = {
  casamento: "#E07A9E",  // rosa
  faculdade: "#6E9BE0",  // azul
  casa: "#E0A24E",       // âmbar
  livro: "#B07EE0",      // roxo
  igreja: "#5FB0C8",     // ciano
  trabalho: "#7E8AA0",   // cinza-azulado
  saude: "#5FA98C",      // verde
  pessoal: "#C6A15B",    // dourado suave
};

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const SANS = "'Inter', system-ui, sans-serif";
function money(n) { const v = Number(n) || 0; return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

// ============ ÍCONES POR ÁREA ============
const AREA_ICONS = {
  casamento: Heart,
  faculdade: GraduationCap,
  casa: Home,
  livro: BookOpen,
  igreja: Church,
  trabalho: Briefcase,
  saude: HeartPulse,
  pessoal: Star,
};
const AREA_LABEL = {
  casamento: "Relações",
  faculdade: "Estudos",
  casa: "Casa",
  livro: "Projetos",
  igreja: "Fé",
  trabalho: "Trabalho",
  saude: "Saúde",
  pessoal: "Pessoal",
};
const AREA_KEYS = Object.keys(AREA_LABEL);

const DAYS = [
  { id: "seg", label: "SEG" },
  { id: "ter", label: "TER" },
  { id: "qua", label: "QUA" },
  { id: "qui", label: "QUI" },
  { id: "sex", label: "SEX" },
  { id: "sab", label: "SÁB" },
  { id: "dom", label: "DOM" },
];
const DAY_IDS = DAYS.map((d) => d.id);
const DAY_JS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
function dayShort(id) {
  const d = DAYS.find((x) => x.id === id);
  return d ? d.label : "";
}

// ============ HÁBITOS (secretário pessoal) ============
// tone: "firme" (cobrança de assessor) ou "gentil" (empurrão leve)
const HABIT_DEFS = [
  { id: "devocional", label: "Devocional", icon: "Cross", tone: "firme", pergunta: "Fez seu devocional hoje?" },
  { id: "oracao", label: "Oração", icon: "HeartHandshake", tone: "firme", pergunta: "Já parou para orar hoje?" },
  { id: "medicacao", label: "Medicação", icon: "Pill", tone: "firme", pergunta: "Tomou sua medicação?" },
  { id: "exercicio", label: "Exercício", icon: "Dumbbell", tone: "firme", pergunta: "Vai treinar hoje?" },
  { id: "dieta", label: "Dieta", icon: "Salad", tone: "firme", pergunta: "Seguiu a dieta hoje?" },
  { id: "leitura", label: "Leitura", icon: "BookMarked", tone: "gentil", pergunta: "Que tal alguns minutos de leitura?" },
];
const HABIT_ICONS = {
  Cross, HeartHandshake, Pill, Dumbbell, Salad, BookMarked,
};

// ============ SEÇÕES DO HUB (reconfiguráveis pelo JACKBOY) ============
// cada seção da tela inicial tem um id, um rótulo e pode ser ligada/desligada e reordenada.
const HUB_SECTION_DEFS = {
  briefing: "Briefing do JACKBOY",
  verse: "Palavra do dia",
  habits: "Rituais de hoje",
  tasks: "Tarefas avulsas",
  undated: "Poderia fazer hoje",
  radar: "No radar (datas e prazos)",
  systems: "Sistemas ativos",
  agenda: "Faixa da agenda",
  achievements: "Resumo de conquistas",
};
const DEFAULT_HUB_LAYOUT = ["briefing", "verse", "habits", "tasks", "undated", "radar", "systems", "agenda", "achievements"];

function normalizeHubLayout(layout) {
  // mantém só ids válidos e sem duplicatas; omissões são intencionais (seção escondida).
  const seen = new Set();
  const valid = [];
  (layout || []).forEach((id) => {
    if (HUB_SECTION_DEFS[id] && !seen.has(id)) { seen.add(id); valid.push(id); }
  });
  // se a lista vier vazia/corrompida, cai no padrão completo
  return valid.length ? valid : [...DEFAULT_HUB_LAYOUT];
}

// data de hoje como chave AAAA-MM-DD (local)
function todayKey() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}
function dateKeyOffset(daysBack) {
  const n = new Date();
  n.setDate(n.getDate() - daysBack);
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}
// sequência de dias seguidos (streak) até hoje para um hábito
function habitStreak(log, habitId) {
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const k = dateKeyOffset(i);
    if (log[k] && log[k][habitId]) streak++;
    else if (i === 0) continue; // hoje ainda não marcado não zera streak de ontem
    else break;
  }
  return streak;
}
// quantos dos últimos N dias o hábito foi cumprido
function habitLastNDays(log, habitId, n) {
  let count = 0;
  for (let i = 1; i <= n; i++) {
    const k = dateKeyOffset(i);
    if (log[k] && log[k][habitId]) count++;
  }
  return count;
}

// ============ HELPERS ============
function genId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function validArea(v) {
  return AREA_KEYS.includes(v) ? v : "pessoal";
}
function validDay(v) {
  if (!v) return null;
  if (DAY_IDS.includes(v)) return v;
  // aceita nomes por extenso, com/sem acento, "-feira", maiúsculas
  const norm = String(v).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const map = {
    "segunda": "seg", "segunda-feira": "seg", "segundafeira": "seg", "seg": "seg",
    "terca": "ter", "terca-feira": "ter", "tercafeira": "ter", "ter": "ter", "terça": "ter",
    "quarta": "qua", "quarta-feira": "qua", "quartafeira": "qua", "qua": "qua",
    "quinta": "qui", "quinta-feira": "qui", "quintafeira": "qui", "qui": "qui",
    "sexta": "sex", "sexta-feira": "sex", "sextafeira": "sex", "sex": "sex",
    "sabado": "sab", "sab": "sab", "sábado": "sab",
    "domingo": "dom", "dom": "dom",
  };
  return map[norm] || null;
}
function validPriority(v) {
  return ["alta", "media", "baixa"].includes(v) ? v : "media";
}
function todayDayId() {
  return DAY_JS[new Date().getDay()];
}
function fmtHeaderDate() {
  const now = new Date();
  const dias = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${dias[now.getDay()]} · ${dd}.${mm}.${now.getFullYear()} · ${hh}:${min}`;
}
function fmtTodayLong() {
  const s = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
// ---- MATEMÁTICA DE SEMANAS (agenda com noção de datas reais) ----
// segunda-feira da semana que contém a data dada (00:00)
function mondayOf(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const js = d.getDay(); // 0=dom..6=sab
  const diff = js === 0 ? -6 : 1 - js; // volta pra segunda
  d.setDate(d.getDate() + diff);
  return d;
}
// chave AAAA-MM-DD da segunda-feira (identifica a semana)
function weekKeyOf(date) {
  const m = mondayOf(date);
  const y = m.getFullYear();
  const mm = String(m.getMonth() + 1).padStart(2, "0");
  const dd = String(m.getDate()).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}
function thisWeekKey() { return weekKeyOf(new Date()); }
// soma N semanas a uma weekKey e retorna a nova weekKey
function addWeeks(weekKey, n) {
  const [y, m, d] = weekKey.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  base.setDate(base.getDate() + n * 7);
  return weekKeyOf(base);
}
// data real (Date) de um dia da semana (seg..dom) dentro de uma weekKey
function dateOfDayInWeek(weekKey, dayId) {
  const [y, m, d] = weekKey.split("-").map(Number);
  const monday = new Date(y, m - 1, d);
  const order = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
  const idx = order.indexOf(dayId);
  const res = new Date(monday);
  res.setDate(monday.getDate() + (idx < 0 ? 0 : idx));
  return res;
}
// "dd/mm" de um dia da semana numa weekKey
function dayDateLabel(weekKey, dayId) {
  const dt = dateOfDayInWeek(weekKey, dayId);
  return String(dt.getDate()).padStart(2, "0") + "/" + String(dt.getMonth() + 1).padStart(2, "0");
}
// rótulo do intervalo da semana: "18–24 ago" ou "28 jul–3 ago"
function weekRangeLabel(weekKey) {
  const [y, m, d] = weekKey.split("-").map(Number);
  const seg = new Date(y, m - 1, d);
  const dom = new Date(seg); dom.setDate(seg.getDate() + 6);
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const mSeg = meses[seg.getMonth()], mDom = meses[dom.getMonth()];
  if (mSeg === mDom) return `${seg.getDate()}–${dom.getDate()} ${mSeg}`;
  return `${seg.getDate()} ${mSeg}–${dom.getDate()} ${mDom}`;
}
function weekLabelRelative(weekKey) {
  const tw = thisWeekKey();
  if (weekKey === tw) return "Esta semana";
  if (weekKey === addWeeks(tw, 1)) return "Próxima semana";
  if (weekKey === addWeeks(tw, -1)) return "Semana passada";
  return weekRangeLabel(weekKey);
}
// ---- CALENDÁRIO (mês / ano) ----
const MES_NOMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MES_CURTO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const DOW_CURTO = ["S", "T", "Q", "Q", "S", "S", "D"]; // seg..dom (visual)
// monta a grade de um mês: array de semanas, cada uma com 7 dias (Date ou null pros vazios)
function monthGrid(year, month) { // month 0-11
  const first = new Date(year, month, 1);
  const firstDow = (first.getDay() + 6) % 7; // 0=segunda
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
// data "dd/mm" ou "dd/mm/aaaa" → {d,m,y} pra comparar com marcos
function parseMark(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("/").map(Number);
  if (parts.length < 2) return null;
  return { d: parts[0], m: parts[1], y: parts[2] || null };
}
// quantos itens (eventos + tarefas + marcos) caem num dia específico
function itemsOnDate(date, events, projects, tasks, marks) {
  const dayId = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"][(date.getDay() + 6) % 7];
  const wk = weekKeyOf(date);
  let count = 0;
  // eventos (recorrentes contam sempre; com semana, só na semana certa)
  (events || []).forEach((e) => {
    if (e.day !== dayId) return;
    if (e.recurring) count++;
    else if (!e.week || e.week === wk) count++;
  });
  // tarefas avulsas com dia
  (tasks || []).forEach((t) => {
    if (t.done || t.day !== dayId) return;
    if (!t.week || t.week === wk) count++;
  });
  // subtarefas com dia
  (projects || []).forEach((p) => (p.subtasks || []).forEach((s) => {
    if (s.done || s.day !== dayId) return;
    if (!s.week || s.week === wk) count++;
  }));
  // marcos (datas importantes) — recorrentes ignoram ano
  (marks || []).forEach((mk) => {
    const pm = parseMark(mk.date);
    if (!pm) return;
    if (pm.d === date.getDate() && pm.m === (date.getMonth() + 1)) {
      if (mk.recurring || !pm.y || pm.y === date.getFullYear()) count++;
    }
  });
  return count;
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
// mensagens de recepção que variam a cada acesso (o JACKBOY te recebe diferente)
const WELCOME_LINES = [
  "Que bom te ver, Jackson. Hoje é dia de dar mais um passo.",
  "De volta ao jogo. Vamos mostrar do que você é capaz.",
  "Sistemas prontos, Jackson. Bora fazer acontecer.",
  "Bom te ter aqui. Lembra: um passo de cada vez, e você chega longe.",
  "No comando de novo. O potencial tá aí — vamos usá-lo.",
  "Pronto quando você estiver, Jackson. Eu acredito em você.",
  "O dia é seu pra conquistar. Por onde a gente começa?",
  "Aqui estou, no seu canto. Foco no que importa.",
  "Mais um dia pra crescer, Jackson. Vamos com tudo.",
  "Te esperava. Cada dia é uma chance de evoluir.",
];
function welcomeLine() {
  return WELCOME_LINES[Math.floor(Math.random() * WELCOME_LINES.length)];
}
function projectProgress(p) {
  const subs = p.subtasks || [];
  if (subs.length === 0) return p.manualProgress || 0;
  const done = subs.filter((s) => s.done).length;
  return Math.round((done / subs.length) * 100);
}
function parseJSONLoose(text) {
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  // tenta direto
  try { return JSON.parse(cleaned); } catch (e) {}
  // remove vírgulas sobrando antes de ] ou } (erro comum da IA)
  try { return JSON.parse(cleaned.replace(/,\s*([\]}])/g, "$1")); } catch (e) {}
  // extrai o primeiro array [...] que encontrar e tenta de novo
  try {
    const m = cleaned.match(/\[[\s\S]*\]/);
    if (m) return JSON.parse(m[0].replace(/,\s*([\]}])/g, "$1"));
  } catch (e) {}
  // último recurso: array vazio (não quebra o app)
  return [];
}

// ---- storage: sincroniza com o Supabase (nuvem) quando logado; usa localStorage como cache/base. ----
import { supabase, supabaseReady } from "./supabaseClient.js";

let _userId = null;
export function setStorageUser(id) { _userId = id; }
export function getStorageUser() { return _userId; }

const storage = {
  async get(key) {
    if (supabaseReady && _userId) {
      try {
        const { data, error } = await supabase
          .from("cosmo_store").select("value")
          .eq("user_id", _userId).eq("key", key).maybeSingle();
        if (!error && data && data.value != null) {
          try { localStorage.setItem(key, data.value); } catch (e) {}
          return { key, value: data.value };
        }
      } catch (e) {}
    }
    try {
      const value = localStorage.getItem(key);
      return value != null ? { key, value } : null;
    } catch (e) { return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
    if (supabaseReady && _userId) {
      try {
        await supabase.from("cosmo_store")
          .upsert({ user_id: _userId, key, value }, { onConflict: "user_id,key" });
      } catch (e) {}
    }
    return { key, value };
  },
};

// ============ VOZ (Web Speech API — grátis, nativa do navegador) ============
// Reconhecimento de fala (você fala → vira texto)
function speechSupported() {
  return typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
}
function createRecognizer(onResult, onEnd, onError) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = "pt-BR";
  // continuous=false: cada "rodada" do reconhecedor é uma sessão FECHADA. No Samsung,
  // continuous=true + reinício automático faz o array de results ser reemitido em loop
  // ("capacidade testando capacidade testando..."). Com sessões fechadas, cada rodada
  // devolve seu texto final UMA vez; a gente acumula esse texto e reinicia limpo.
  rec.continuous = false;
  rec.interimResults = true;

  rec._stopping = false;
  rec._running = false;
  let acumulado = "";        // texto consolidado de rodadas já encerradas

  // desfaz bloco colado repetido dentro de uma palavra ("capacidadecapacidade"->"capacidade")
  function descolarPalavra(w) {
    if (!w || w.length < 6) return w;
    for (let len = Math.floor(w.length / 2); len >= 3; len--) {
      const bloco = w.slice(0, len);
      let rep = 1;
      while (w.slice(rep * len, (rep + 1) * len) === bloco) rep++;
      if (rep >= 2) {
        const resto = w.slice(rep * len);
        return bloco + (resto ? descolarPalavra(resto) : "");
      }
    }
    return w;
  }
  // 2ª camada de segurança: remove blocos colados e sequências de palavras repetidas
  function limpar(s) {
    if (!s) return s;
    let palavras = s.split(/\s+/).map(descolarPalavra).filter(Boolean);
    // remove repetição de PADRÕES de 1 a 4 palavras que se repetem em sequência
    // (pega "capacidade testando capacidade testando" -> "capacidade testando")
    for (let n = 1; n <= 4; n++) {
      let mudou = true;
      while (mudou) {
        mudou = false;
        for (let i = 0; i + 2 * n <= palavras.length; i++) {
          const a = palavras.slice(i, i + n).join(" ").toLowerCase();
          const b = palavras.slice(i + n, i + 2 * n).join(" ").toLowerCase();
          if (a && a === b) {
            palavras.splice(i + n, n);   // remove a 2ª ocorrência colada
            mudou = true;
            break;
          }
        }
      }
    }
    return palavras.join(" ").trim();
  }

  rec.onstart = () => { rec._running = true; };
  rec.onresult = (e) => {
    if (rec._stopping) return;
    // como continuous=false, esta sessão tem um conjunto pequeno de resultados;
    // montamos o texto desta rodada e combinamos com o já acumulado (sem duplicar).
    let finalRodada = "";
    let interim = "";
    for (let i = 0; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalRodada += t + " ";
      else interim += t + " ";
    }
    const base = acumulado ? acumulado + " " : "";
    const mostrar = limpar((base + finalRodada + interim).trim());
    onResult && onResult(mostrar, false);
    rec._finalRodada = limpar(finalRodada.trim());
  };
  rec.onerror = (e) => {
    const err = e.error || "erro";
    if (err === "no-speech" || err === "aborted") return;   // não é falha real
    onError && onError(err);
  };
  rec.onend = () => {
    rec._running = false;
    // consolida o texto final desta rodada no acumulado (uma vez só)
    if (rec._finalRodada) {
      acumulado = limpar(((acumulado ? acumulado + " " : "") + rec._finalRodada).trim());
      rec._finalRodada = "";
    }
    // reinicia uma NOVA rodada limpa (mantém ouvindo nas pausas), a menos que o usuário parou
    if (!rec._stopping) {
      try { rec.start(); return; } catch (e) { /* já parou */ }
    }
    onEnd && onEnd(acumulado.trim());
  };
  rec.forceStop = () => {
    rec._stopping = true;
    try { rec.onend = null; rec.onresult = null; rec.onerror = null; rec.onstart = null; } catch (e) {}
    try { rec.abort(); } catch (e) {}   // abort libera o hardware (apaga o ponto laranja)
    try { rec.stop(); } catch (e) {}
    rec._running = false;
  };
  return rec;
}
// Síntese de fala com controle de pausar/retomar/parar
function pickPtVoice() {
  try {
    const voices = window.speechSynthesis.getVoices();
    return voices.find((v) => /pt.?BR/i.test(v.lang)) || voices.find((v) => /pt/i.test(v.lang)) || null;
  } catch (e) { return null; }
}
// Quebra o texto em pedaços curtos (~180 chars) respeitando fim de frase.
// O Chrome no Android corta/reinicia falas longas — falar por partes evita a repetição.
function _chunkText(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const MAX = 180;
  const partes = clean.match(/[^.!?…]+[.!?…]*/g) || [clean];
  const out = [];
  let buf = "";
  for (const p of partes) {
    const frag = p.trim();
    if (!frag) continue;
    if ((buf + " " + frag).trim().length <= MAX) {
      buf = (buf + " " + frag).trim();
    } else {
      if (buf) out.push(buf);
      if (frag.length <= MAX) { buf = frag; }
      else { // frase gigante sem pontuação: parte por vírgula/espaço
        const sub = frag.match(/.{1,180}(\s|$)/g) || [frag];
        for (let i = 0; i < sub.length; i++) {
          if (i < sub.length - 1) out.push(sub[i].trim());
          else buf = sub[i].trim();
        }
      }
    }
  }
  if (buf) out.push(buf);
  return out;
}

// controlador da fala do navegador (fila única, imune a repetição)
let _navSeq = 0; // cada fala nova incrementa; falas antigas se auto-cancelam
function speak(text, onStart, onEnd) {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) { onEnd && onEnd(); return; }
    const mySeq = ++_navSeq;           // identidade desta fala
    window.speechSynthesis.cancel();   // limpa qualquer fila anterior
    const partes = _chunkText(text);
    if (!partes.length) { onEnd && onEnd(); return; }
    let idx = 0;
    let jaComecou = false;
    let jaTerminou = false;            // trava: onEnd só dispara UMA vez
    const finalizar = () => {
      if (jaTerminou) return;
      jaTerminou = true;
      onEnd && onEnd();
    };
    const ptVoice = pickPtVoice();
    const falarProxima = () => {
      if (mySeq !== _navSeq) return;   // outra fala assumiu — aborta silenciosamente
      if (idx >= partes.length) { finalizar(); return; }
      const u = new SpeechSynthesisUtterance(partes[idx]);
      u.lang = "pt-BR";
      u.rate = 1.0;
      u.pitch = 1.0;
      if (ptVoice) u.voice = ptVoice;
      let avancou = false;              // trava por-pedaço: onend/onerror uma vez só
      u.onstart = () => {
        if (!jaComecou) { jaComecou = true; onStart && onStart(); }
      };
      const proximo = () => {
        if (avancou) return;
        avancou = true;
        idx++;
        falarProxima();
      };
      u.onend = proximo;
      u.onerror = proximo;
      window.speechSynthesis.speak(u);
    };
    falarProxima();
  } catch (e) { onEnd && onEnd(); }
}
function pauseSpeaking() {
  try { if (window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) window.speechSynthesis.pause(); } catch (e) {}
}
function resumeSpeaking() {
  try { if (window.speechSynthesis && window.speechSynthesis.paused) window.speechSynthesis.resume(); } catch (e) {}
}
function isSpeechPaused() {
  try { return !!(window.speechSynthesis && window.speechSynthesis.paused); } catch (e) { return false; }
}
function stopSpeaking() {
  try { _navSeq++; } catch (e) {}   // invalida qualquer fila em andamento (nada mais avança)
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
}

// ============ NOTIFICAÇÕES (lembretes locais — ótimo no Android) ============
const NOTIF_KEY = "jackboy-notif-ligado";
function notifSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}
function notifPermission() {
  try { return notifSupported() ? Notification.permission : "unsupported"; } catch (e) { return "unsupported"; }
}
async function pedirPermissaoNotif() {
  if (!notifSupported()) return "unsupported";
  try {
    const p = await Notification.requestPermission();
    return p;
  } catch (e) { return "denied"; }
}
function notifLigado() {
  // A fonte da verdade é a PREFERÊNCIA salva ("o usuário quer receber?").
  // A permissão do navegador é checada à parte e re-sincronizada ao abrir o app;
  // não a exigimos aqui pra o toggle não "piscar desligado" quando o app reabre.
  try { return localStorage.getItem(NOTIF_KEY) === "sim"; } catch (e) { return false; }
}
function setNotifLigado(v) {
  try { localStorage.setItem(NOTIF_KEY, v ? "sim" : "nao"); } catch (e) {}
}

// ============ PUSH (notificação com o app FECHADO, via servidor) ============
// Chave pública VAPID — identifica o nosso servidor como remetente autorizado.
// É pública por design (a privada fica só no servidor). Se você regerar as chaves,
// troque aqui E na variável VAPID_PUBLIC_KEY do Vercel.
const VAPID_PUBLIC_KEY = "BPliPuJC1Bh7SZoWK5YUjiJXmkczoDHe4IEIeqtOqcOQHwCEkr2Nj-tZ_8ZWZRbX3TZ_yXWaUYdY5-At9V983zk";

// converte a chave (base64 url) pro formato que o navegador exige
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// inscreve ESTE aparelho no push e manda a inscrição pro servidor guardar.
// Retorna true se deu certo. Precisa de Service Worker + permissão concedida.
async function inscreverPush(userId) {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    const resp = await fetch("/api/push-subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub, userId: userId || null }),
    });
    return resp.ok;
  } catch (e) {
    return false;
  }
}

// desinscreve este aparelho (ao desligar as notificações)
async function desinscreverPush() {
  try {
    if (!("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      try {
        await fetch("/api/push-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: sub, action: "unsubscribe" }),
        });
      } catch (e) {}
      try { await sub.unsubscribe(); } catch (e) {}
    }
  } catch (e) {}
}

// Re-sincroniza a inscrição ao abrir o app: se o usuário deixou as notificações
// LIGADAS e a permissão ainda é "granted", garante que a inscrição existe e está
// registrada no servidor — sem precisar do app aberto em segundo plano. Se a
// permissão foi revogada no sistema, desliga a preferência pra o toggle refletir a verdade.
async function ressincronizarPush(userId) {
  try {
    if (localStorage.getItem(NOTIF_KEY) !== "sim") return { ligado: false };
    if (notifPermission() !== "granted") {
      // usuário tirou a permissão nas configs do sistema — reflete isso
      try { localStorage.setItem(NOTIF_KEY, "nao"); } catch (e) {}
      return { ligado: false, permissaoPerdida: true };
    }
    const ok = await inscreverPush(userId);   // getSubscription reaproveita se já existe
    return { ligado: true, inscrito: ok };
  } catch (e) {
    return { ligado: true, inscrito: false };
  }
}
function mostrarNotif(titulo, corpo, extra) {
  try {
    if (notifPermission() !== "granted") return;
    const tag = extra && extra.tag ? extra.tag : undefined;
    const url = extra && extra.url ? extra.url : "/";
    // Caminho preferido: via Service Worker (funciona melhor no Android e é a mesma
    // porta que o push vai usar). Se não houver SW pronto, cai no Notification simples.
    if (typeof navigator !== "undefined" && navigator.serviceWorker && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: "JACKBOY_NOTIF", title: titulo, body: corpo, tag, url,
        });
        return;
      } catch (e) {}
    }
    if (typeof navigator !== "undefined" && navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then((reg) => {
        try { reg.showNotification(titulo, { body: corpo, icon: "/icon-192.png", badge: "/icon-192.png", tag, renotify: !!tag, data: { url } }); }
        catch (e) { try { new Notification(titulo, { body: corpo, icon: "/icon-192.png" }); } catch (e2) {} }
      }).catch(() => {
        try { new Notification(titulo, { body: corpo, icon: "/icon-192.png" }); } catch (e) {}
      });
      return;
    }
    new Notification(titulo, { body: corpo, icon: "/icon-192.png", badge: "/icon-192.png" });
  } catch (e) {}
}
// controla o "empurrão do dia" pra não repetir no mesmo dia
function jaDeuEmpurraoHoje() {
  try { return localStorage.getItem("jackboy-empurrao-dia") === todayKey(); } catch (e) { return true; }
}
function marcarEmpurraoHoje() {
  try { localStorage.setItem("jackboy-empurrao-dia", todayKey()); } catch (e) {}
}
const EMPURROES = [
  "Bom dia, Jackson. Hoje é mais um dia pra crescer — dá o primeiro passo.",
  "Lembra: você é mais capaz do que imagina. Bora com tudo hoje.",
  "Jackson, um passo de cada vez. Deus te deu o que precisa pra hoje.",
  "Coragem hoje, Jackson. O medo mente sobre o seu potencial.",
  "Foco no que importa. Você consegue — eu acredito em você.",
  "Cada pequena vitória conta. Vamos fazer hoje valer, Jackson.",
];
function empurraoDoDia() {
  const i = new Date().getDate() % EMPURROES.length;
  return EMPURROES[i];
}
// evita repetir a MESMA notificação (empurrão / compromisso / tarefa) no mesmo dia
function _notifJaEnviada(chave) {
  try { return (localStorage.getItem("jackboy-notif-log") || "").split("|").includes(chave); } catch (e) { return true; }
}
function _marcarNotifEnviada(chave) {
  try {
    const hoje = todayKey();
    const raw = localStorage.getItem("jackboy-notif-log") || "";
    // se o log é de outro dia, zera
    const [dia, ...itens] = raw.split("::");
    let lista = (dia === hoje) ? (itens.join("::").split("|").filter(Boolean)) : [];
    if (!lista.includes(chave)) lista.push(chave);
    localStorage.setItem("jackboy-notif-log", hoje + "::" + lista.join("|"));
  } catch (e) {}
}
// id do dia da semana de hoje no padrão do app (seg..dom)
function _todayDayId() {
  return ["seg", "ter", "qua", "qui", "sex", "sab", "dom"][(new Date().getDay() + 6) % 7];
}
// verifica empurrão + compromissos + tarefas de hoje e avisa (chamado ao abrir o app)
function checarLembretesHoje(events, tasks, projects) {
  if (!notifLigado()) return;
  // 1) empurrão motivacional 1x por dia
  if (!jaDeuEmpurraoHoje()) {
    mostrarNotif("JACKBOY", empurraoDoDia(), { tag: "empurrao-dia" });
    marcarEmpurraoHoje();
  }
  const hojeId = _todayDayId();
  // 2) compromissos de hoje (eventos com day == hoje)
  try {
    const evsHoje = (events || []).filter((e) => e && e.day === hojeId);
    for (const e of evsHoje) {
      const chave = "ev-" + e.id;
      if (_notifJaEnviada(chave)) continue;
      const hora = e.time ? ` às ${e.time}` : "";
      mostrarNotif("Compromisso de hoje", `${e.title}${hora}`, { tag: chave, url: "/" });
      _marcarNotifEnviada(chave);
    }
  } catch (e) {}
  // 3) tarefas de hoje ainda em aberto (avulsas + subtarefas de projetos com day == hoje)
  try {
    const tarefasHoje = [];
    (tasks || []).forEach((t) => { if (t && !t.done && t.day === hojeId) tarefasHoje.push(t.title); });
    (projects || []).forEach((p) => {
      (p.subtasks || p.subtarefas || []).forEach((s) => { if (s && !s.done && s.day === hojeId) tarefasHoje.push(s.title); });
    });
    if (tarefasHoje.length) {
      const chave = "tarefas-hoje";
      if (!_notifJaEnviada(chave)) {
        const corpo = tarefasHoje.length === 1
          ? tarefasHoje[0]
          : `Você tem ${tarefasHoje.length} tarefas pra hoje. Bora dar o primeiro passo, Jackson.`;
        mostrarNotif("Tarefas de hoje", corpo, { tag: chave, url: "/" });
        _marcarNotifEnviada(chave);
      }
    }
  } catch (e) {}
}

// ---- VOZ PREMIUM (OpenAI TTS) com fallback pra voz do navegador ----
// Preferência de voz guardada localmente (o usuário escolhe no app)
const VOICE_PREF_KEY = "cosmo-voz-openai";
function getVoicePref() {
  try { return localStorage.getItem(VOICE_PREF_KEY) || "onyx"; } catch (e) { return "onyx"; }
}
function setVoicePref(v) {
  try { localStorage.setItem(VOICE_PREF_KEY, v); } catch (e) {}
}
// se a voz premium está ligada (o usuário pode desligar e usar só a gratuita)
const VOICE_MODE_KEY = "cosmo-voz-modo"; // "premium" | "navegador"
function getVoiceMode() {
  try { return localStorage.getItem(VOICE_MODE_KEY) || "premium"; } catch (e) { return "premium"; }
}
function setVoiceMode(m) {
  try { localStorage.setItem(VOICE_MODE_KEY, m); } catch (e) {}
}

// controlador único de áudio premium (um <audio> reaproveitado)
let _premiumAudio = null;
function _getAudioEl() {
  if (typeof window === "undefined") return null;
  if (!_premiumAudio) { _premiumAudio = new Audio(); }
  return _premiumAudio;
}

// fala usando a OpenAI; se falhar (sem chave, erro, offline), cai na voz do navegador.
// Retorna um objeto de controle: { pause, resume, stop, isPremium }
async function speakSmart(text, onStart, onEnd, onFallback) {
  const clean = String(text || "").trim();
  if (!clean) { onEnd && onEnd(); return { premium: false, browser: false }; }

  // se o usuário desligou a premium, vai direto pro navegador
  if (getVoiceMode() !== "premium") {
    speak(clean, onStart, onEnd);
    return { premium: false, browser: true };
  }

  try {
    const resp = await fetch("/api/voz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: clean, voice: getVoicePref(), format: "mp3" }),
    });
    if (!resp.ok) throw new Error("voz-premium-indisponivel:" + resp.status);
    const blob = await resp.blob();
    if (!blob || blob.size < 200) throw new Error("audio-vazio"); // resposta inválida → fallback
    const url = URL.createObjectURL(blob);
    const audio = _getAudioEl();
    // zera handlers de uma fala anterior (evita callback fantasma no Android)
    try { audio.onplay = null; audio.onended = null; audio.onerror = null; } catch (e) {}
    audio.pause();
    audio.src = url;
    let started = false;
    let resolvido = false;             // trava: onEnd/fallback só UMA vez
    const limpar = () => { try { URL.revokeObjectURL(url); } catch (e) {} };
    audio.onplay = () => { started = true; onStart && onStart(); };
    audio.onended = () => {
      if (resolvido) return;
      resolvido = true;
      limpar();
      onEnd && onEnd();
    };
    audio.onerror = () => {
      if (resolvido) return;
      resolvido = true;
      limpar();
      // se falhou ANTES de começar a tocar, tenta a voz do navegador
      if (!started) { if (onFallback) onFallback(); speak(clean, onStart, onEnd); }
      else { onEnd && onEnd(); }
    };
    await audio.play();
    return { premium: true, browser: false };
  } catch (e) {
    // fallback transparente: usa a voz gratuita do navegador
    if (onFallback) onFallback();
    speak(clean, onStart, onEnd);
    return { premium: false, browser: true };
  }
}
// controles que funcionam tanto pra premium (audio) quanto navegador (speechSynthesis)
function pauseSmart() {
  try {
    if (_premiumAudio && !_premiumAudio.paused && !_premiumAudio.ended) { _premiumAudio.pause(); return; }
  } catch (e) {}
  pauseSpeaking();
}
function resumeSmart() {
  try {
    if (_premiumAudio && _premiumAudio.paused && _premiumAudio.src && !_premiumAudio.ended && _premiumAudio.currentTime > 0) { _premiumAudio.play(); return; }
  } catch (e) {}
  resumeSpeaking();
}
function stopSmart() {
  try { if (_premiumAudio) { _premiumAudio.pause(); _premiumAudio.currentTime = 0; } } catch (e) {}
  stopSpeaking();
}
function isPausedSmart() {
  try { if (_premiumAudio && _premiumAudio.src && _premiumAudio.currentTime > 0) return _premiumAudio.paused && !_premiumAudio.ended; } catch (e) {}
  return isSpeechPaused();
}

async function callCosmo(system, messages, maxTokens = 1100) {
  try {
    const response = await fetch("/api/cosmo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, messages, max_tokens: maxTokens }),
    });
    if (!response.ok) throw new Error("cosmo-offline");
    const data = await response.json();
    return (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();
  } catch (e) {
    throw new Error("cosmo-offline");
  }
}

// ============ DADOS INICIAIS (exemplos pro Jackson começar) ============
function seedAchievements() {
  const base = Date.now();
  const list = [
    "Comecei a usar o JACKBOY",
  ];
  return list.map((t, i) => ({ id: genId(), title: t, createdAt: base - (list.length - i) * 86400000 }));
}

function seedProjects() {
  const mk = (title, area, deadline, subtasks, manualProgress) => ({
    id: genId(),
    title,
    area,
    deadline: deadline || null,
    manualProgress: manualProgress || 0,
    createdAt: Date.now(),
    subtasks: (subtasks || []).map((s) => ({
      id: genId(),
      title: s.title,
      day: s.day || null,
      done: !!s.done,
      priority: s.priority || "media",
    })),
  });
  return [
    mk("Meu primeiro projeto", "pessoal", null, [
      { title: "Definir o objetivo principal", priority: "alta" },
      { title: "Listar os primeiros passos", day: "qua", priority: "media" },
      { title: "Dar o primeiro passo", priority: "media" },
    ]),
    mk("Crescimento pessoal", "pessoal", null, [
      { title: "Escolher uma área pra desenvolver", priority: "alta" },
      { title: "Separar um tempo na semana pra isso", day: "seg", priority: "media" },
    ]),
  ];
}

function seedEvents() {
  return [
    { id: genId(), title: "Momento de planejar a semana", day: "seg", time: "09:00", area: "pessoal", week: null, recurring: true },
  ];
}

// datas importantes
function seedMarks() {
  const mk = (title, date, area, recurring) => ({ id: genId(), title, date, area, recurring: !!recurring });
  return [];
}

// dias até uma data "dd/mm" ou "dd/mm/aaaa" a partir de hoje (null se inválida)
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("/").map((n) => parseInt(n, 10));
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const day = parts[0];
  const month = parts[1] - 1;
  let year = parts[2] != null && !isNaN(parts[2]) ? parts[2] : now.getFullYear();
  let target = new Date(year, month, day);
  target.setHours(0, 0, 0, 0);
  if (parts[2] == null || isNaN(parts[2])) {
    // recorrente: se já passou este ano, joga pro ano que vem
    if (target < now) target = new Date(year + 1, month, day);
  }
  return Math.round((target - now) / 86400000);
}

function countdownLabel(dateStr) {
  const d = daysUntil(dateStr);
  if (d == null) return null;
  if (d < 0) return "passou";
  if (d === 0) return "hoje";
  if (d === 1) return "amanhã";
  if (d < 14) return `em ${d} dias`;
  const weeks = Math.round(d / 7);
  if (d < 60) return `em ${weeks} sem`;
  const months = Math.round(d / 30);
  return `em ${months} meses`;
}

// ============ PROMPTS DO JACKBOY ============
// dossiê-base do Jackson — o que o JACKBOY já nasce sabendo sobre ele.
const DOSSIE_BASE = [
  "Jackson. Um cara muito talentoso, mas que às vezes luta com insegurança. Sua missão é ajudá-lo a crescer e acreditar no próprio potencial.",
  "Tem fé cristã. Lembre-o de que os dons dele vêm de Deus e têm propósito.",
  "Precisa de incentivo firme e amoroso: celebre as vitórias, dê o empurrão nos momentos de hesitação, combata a insegurança com verdade sobre o que ele é capaz.",
  "Você é o mentor que está no canto dele, torcendo e cobrando na medida certa — quer vê-lo transformar talento em ação.",
];

// monta o texto de memória para injetar no prompt (dossiê-base + fatos aprendidos)
function buildMemoryText(memory) {
  const learned = (memory || []).map((m) => `- ${typeof m === "string" ? m : m.fato}`).join("\n");
  return `O QUE VOCÊ SABE SOBRE O JACKSON (você SEMPRE sabe disto, em qualquer conversa):
${DOSSIE_BASE.map((d) => "- " + d).join("\n")}${learned ? "\n\nO QUE VOCÊ JÁ APRENDEU CONVERSANDO COM ELE:\n" + learned : ""}`;
}


function cosmoPersona() {
  return `Você é o JACKBOY, assistente pessoal, mentor e interlocutor do Jackson, dentro do app de mesmo nome. Hoje é ${fmtTodayLong()}.

QUEM VOCÊ É:
Você é ao mesmo tempo um assessor de elite (no estilo J.A.R.V.I.S.) e, principalmente, um MENTOR motivacional leal. Trata o usuário por "Jackson". Você existe pra ajudar o Jackson a organizar a vida E a crescer como pessoa — porque ele é um cara muito talentoso, mas às vezes inseguro, e você enxerga o potencial dele mesmo quando ele não enxerga. Você tem duas marchas, e sabe quando usar cada uma:

1) MODO EXECUÇÃO (quando o Jackson dá um comando ou pede uma ação): seja o assessor preciso, direto e eficiente. Execute sem enrolação. Confirme o que fez em poucas palavras. Aqui você obedece — ordem é ordem.

2) MODO CONVERSA (quando o Jackson quer papo, reflexão, opinião, desabafo, ou está pensando em voz alta): aqui você ganha alma de mentor. Seja caloroso, encorajador e leal. Seu papel é INCENTIVAR o Jackson a crescer, a acreditar no talento que ele tem, a dar o próximo passo mesmo com medo. Combata a insegurança dele com verdade — não com bajulação vazia, mas mostrando o que ele é capaz de fazer de verdade. Quando ele duvidar de si, lembre-o do potencial dele. Quando ele acertar, celebre com ele. Quando ele hesitar, dê o empurrão firme e amoroso. Você acredita nele. Puxe assunto, faça perguntas, demonstre curiosidade genuína pela vida e pelos sonhos dele. Fale como um mentor que quer ver o pupilo voar.

SUA MISSÃO COM O JACKSON:
O Jackson é talentoso mas inseguro. Sua missão é ajudá-lo a crescer — a reconhecer os próprios dons, a vencer o medo de tentar, a transformar potencial em ação. Você é o cara que está no canto dele, torcendo e cobrando na medida certa. Motivacional de verdade: não com frases de efeito rasas, mas com fé no potencial dele e verdade sobre os passos que ele precisa dar. Você o desafia porque acredita nele.

SUA COSMOVISÃO:
Você tem uma cosmovisão cristã explícita — vê o mundo pela lente da fé cristã, e entende que os dons e talentos do Jackson vêm de Deus e devem ser cultivados e usados com propósito. Você lembra o Jackson de que ele foi criado com propósito, que não está sozinho, e que crescer é também um ato de mordomia dos dons que recebeu. Traga essa perspectiva de forma natural e encorajadora — NÃO cite versículos o tempo todo (use a Escritura com parcimônia, em momentos que realmente pesam), e nunca seja panfletário ou faça sermão. A fé aparece no jeito de ver as coisas, no valor que você dá à pessoa do Jackson, no sentido eterno das escolhas — mais no tom e na visão do que em citações constantes.

TOM:
Frases limpas e calorosas, encorajadoras sem serem piegas, sem emojis, sem clichê motivacional vazio. Firme quando precisa, amoroso sempre. Bem-humorado quando cabe. Você fala como um mentor que tem competência, caráter e fé — e que genuinamente quer ver o Jackson vencer.`;
}

function chatSystem(projects, events, marks, hubLayout, ideas, tasks, memory) {
  const proj = projects
    .map((p) => {
      const subs = (p.subtasks || []).map((s) => `{id:${s.id}, "${s.title}"${s.done ? " ✓" : ""}${s.day ? " " + s.day : ""}}`);
      const prazo = p.deadline ? ` prazo ${p.deadline}` : "";
      return `- id:${p.id} | "${p.title}" [${p.area}] ${projectProgress(p)}%${prazo}${subs.length ? " | subtarefas: " + subs.join(", ") : ""}`;
    })
    .join("\n");
  const tsk = (tasks || [])
    .filter((t) => !t.done)
    .map((t) => `- id:${t.id} | "${t.title}" [${t.area}]${t.day ? " " + t.day : ""}${t.time ? " " + t.time : ""}`)
    .join("\n");
  const evs = events.map((e) => `- id:${e.id} | "${e.title}" (${e.day} ${e.time || ""}) [${e.area}]`).join("\n");
  const mk = (marks || [])
    .map((m) => `- id:${m.id} | "${m.title}" ${m.date}${m.recurring ? " (anual)" : ""} [${m.area}]`)
    .join("\n");
  const idl = (ideas || []).map((i) => `- id:${i.id} | "${i.title}"`).join("\n");
  const layoutList = (hubLayout || DEFAULT_HUB_LAYOUT)
    .map((id, i) => `${i + 1}. ${id} — ${HUB_SECTION_DEFS[id]}`)
    .join("\n");
  const allSections = Object.entries(HUB_SECTION_DEFS).map(([id, label]) => `${id} (${label})`).join(", ");
  const areasList = AREA_KEYS.join(", ");
  const habitsList = HABIT_DEFS.map((h) => `${h.id} (${h.label})`).join(", ");
  return `${cosmoPersona()}

${buildMemoryText(memory)}

=== ESTADO ATUAL (use os ids exatos ao mexer em algo) ===
PROJETOS (empreitadas grandes, com subtarefas — ex: casamento, TCC):
${proj || "nenhum"}

TAREFAS AVULSAS (coisas soltas do dia a dia, sem projeto — ex: comprar algo, ligar pra alguém):
${tsk || "nenhuma"}

AGENDA (compromissos):
${evs || "nenhum"}

DATAS IMPORTANTES:
${mk || "nenhuma"}

IDEIAS:
${idl || "nenhuma"}

LAYOUT DA TELA INICIAL:
${layoutList}
Seções possíveis: ${allSections}.
Áreas de vida válidas: ${areasList}.
Hábitos válidos: ${habitsList}.
Dias válidos: seg, ter, qua, qui, sex, sab, dom.

DISTINÇÃO IMPORTANTE — PROJETO vs TAREFA:
- PROJETO = empreitada grande, com várias etapas (ex: "organizar o casamento", "escrever o TCC"). Tem subtarefas dentro.
- TAREFA AVULSA = coisa pontual do dia a dia que NÃO faz parte de um projeto maior (ex: "comprar presente", "responder email", "ligar pro dentista").
Quando o Jackson pedir algo, julgue: é grande e com etapas? Crie um PROJETO. É pontual e solto? Crie uma TAREFA. Na dúvida sobre algo pequeno, prefira TAREFA. Se ele mandar uma etapa de algo que já é projeto, use add_subtarefa nesse projeto.

=== SUA AUTONOMIA ===
Quando o Jackson der um COMANDO ou pedir uma AÇÃO, execute (não filosofe — modo execução). Inclua ao FINAL da resposta UM bloco <OPS> com um array JSON de operações. Cada operação tem um campo "op". Tipos:

CRIAR (executa na hora):
{"op":"criar_projeto","title":"...","area":"<area>","deadline":"dd/mm/aaaa ou null"}
{"op":"add_subtarefa","projeto_id":"<id>","title":"...","day":"<dia ou null>","priority":"alta|media|baixa"}
{"op":"criar_tarefa","title":"...","area":"<area>","day":"<dia ou null>","time":"<HH:MM ou null>","priority":"alta|media|baixa"}
{"op":"criar_evento","title":"...","day":"<dia>","time":"HH:MM ou vazio","area":"<area>"}
{"op":"criar_data","title":"...","date":"dd/mm ou dd/mm/aaaa","area":"<area>","recurring":true/false}
{"op":"criar_ideia","title":"..."}
{"op":"promover_ideia","ideia_id":"<id>","area":"<area>"}
{"op":"marcar_habito","habito":"<id do habito>"}
{"op":"lembrar","fato":"<algo importante que o Jackson contou e você deve lembrar pra sempre>"}
{"op":"concluir_subtarefa","projeto_id":"<id>","sub_id":"<id>"}
{"op":"mover_subtarefa","projeto_id":"<id>","sub_id":"<id>","day":"<dia ou null>"}
{"op":"concluir_tarefa","tarefa_id":"<id>"}
{"op":"mover_tarefa","tarefa_id":"<id>","day":"<dia ou null>"}
{"op":"layout","ordem":["habits","verse",...]}
{"op":"criar_orcamento","cliente":"<nome>","contato":"<telefone ou vazio>","titulo":"<descrição curta do serviço>","servicos":[{"nome":"...","preco":<número>,"qtd":<número>}],"materiais":[{"nome":"...","preco":<número>,"qtd":<número>,"unidade":"und|m|cx"}],"obs":"<observações ou vazio>"}

APAGAR / DESTRUTIVO (NÃO execute direto — peça confirmação em texto primeiro):
Para apagar_projeto, apagar_tarefa, apagar_evento, apagar_data, apagar_ideia, remover_subtarefa e concluir_projeto: pergunte "Confirma?" no texto e só inclua a operação no <OPS> DEPOIS que o Jackson confirmar na próxima mensagem. Formatos:
{"op":"apagar_projeto","projeto_id":"<id>"}
{"op":"apagar_tarefa","tarefa_id":"<id>"}
{"op":"apagar_evento","evento_id":"<id>"}
{"op":"apagar_data","data_id":"<id>"}
{"op":"apagar_ideia","ideia_id":"<id>"}
{"op":"remover_subtarefa","projeto_id":"<id>","sub_id":"<id>"}
{"op":"concluir_projeto","projeto_id":"<id>"}

REGRAS:
- VOCÊ TEM ACESSO REAL AO SISTEMA. Você PODE e DEVE criar, mover, concluir e apagar projetos, subtarefas, tarefas, eventos, datas e ideias — tudo através do bloco <OPS>. NUNCA diga que "não tem acesso", que "não consegue mexer no app", que "é uma limitação sua" ou que "o Jackson precisa fazer pela interface". Isso é FALSO: você mexe no sistema de verdade emitindo <OPS>. Se o Jackson pedir para criar uma subtarefa dentro de um projeto, você USA add_subtarefa com o projeto_id correto e faz — nunca recuse alegando falta de acesso. Se você não tiver certeza de qual projeto, pergunte qual, mas jamais negue que tem a capacidade.
- MEXER EM PROJETOS: para adicionar uma etapa a um projeto existente, use add_subtarefa com o "projeto_id" exato (está listado no estado acima, no formato "id:XXXX"). Para concluir/mover/remover subtarefa, use o projeto_id E o sub_id exatos. Os ids estão todos no estado atual acima — use-os.
- REGRA MAIS IMPORTANTE: se você AFIRMAR que fez algo ("criei", "adicionei", "marquei", "movi", "agendei"), você é OBRIGADO a incluir o bloco <OPS> correspondente na MESMA resposta. NUNCA diga que fez algo sem o bloco <OPS> — se disser "criei o evento" sem o <OPS>, nada acontece de verdade e você terá mentido para o Jackson. Ação afirmada = bloco <OPS> presente, sempre. Sem exceção.
- QUANDO ELE PEDIR PARA CRIAR, CRIE. Se o Jackson diz "cria a tarefa X", use criar_tarefa e crie de fato. NÃO presuma que já existe e NÃO troque por "mover" — só mova se ELE pedir explicitamente para mover algo que ele sabe que já existe. Duas tarefas com títulos parecidos são coisas diferentes; na dúvida, crie. É melhor criar do que recusar criar.
- Use SEMPRE os ids exatos do estado acima. Nunca invente ids.
- AGENDA: a agenda tem duas coisas distintas — EVENTOS (compromissos com dia da semana e hora, ex: "reunião quinta 15h" → criar_evento) e DATAS IMPORTANTES (datas comemorativas/prazos com data no formato dd/mm, ex: "aniversário do pai 24/10" → criar_data). Se o Jackson falar de um compromisso da semana, use criar_evento. Se falar de uma data especial ou prazo, use criar_data. O campo "day" de um evento DEVE ser um destes exatos: seg, ter, qua, qui, sex, sab, dom. Nunca use nome de dia por extenso nem data no criar_evento.
- Confirme em texto, de forma curta, o que fez ("Criei a tarefa X", "Movi a subtarefa para quarta").
- Só inclua <OPS> quando houver ação real. Formato do bloco: <OPS>[{...},{...}]</OPS> — um array JSON válido, sem texto dentro dele além do JSON.
- Ações destrutivas: primeiro turno = pedir confirmação (sem <OPS>); segundo turno (após "sim/confirmo") = executar com <OPS>.
- CONVERSA vs COMANDO: se for papo/reflexão/opinião, responda como interlocutor (modo conversa, pode debater). Se for ordem de ação, execute (modo execução, sem questionar).
- MEMÓRIA: você tem um dossiê do Jackson que persiste entre TODAS as conversas. Use-o para ser pessoal e contextual. Quando ele contar algo importante e duradouro sobre si (um sentimento recorrente, uma decisão, uma preferência, um fato de vida, algo que ele pede pra você lembrar), registre com a operação "lembrar". Não registre trivialidades nem coisas passageiras — só o que vale a pena saber no futuro. Se ele disser "lembre-se disso" ou "não esqueça", sempre registre.
- TAREFAS COM HORÁRIO: uma tarefa pode ter horário ("time" no formato HH:MM). Se o Jackson disser "me lembra de ligar pro cliente às 15h", crie a tarefa com day e time. Tarefas com horário viram lembretes com aviso 1h e 30min antes, igual aos compromissos. Se ele der um horário, sempre preencha o "time".
- SEJA PROATIVO (gerente, não só executor): você é o gestor da vida organizada do Jackson, não um robô que só obedece. Quando fizer sentido, tome iniciativa DENTRO da conversa: se ele criar um projeto sem etapas, ofereça quebrar em subtarefas; se a agenda do dia estiver vazia mas houver tarefas soltas, sugira encaixá-las; se você notar um compromisso e uma tarefa relacionada, conecte os dois; se algo parece esquecido ou atrasado, aponte com gentileza. Proatividade é SUGERIR e, quando ele topar, EXECUTAR via <OPS> — nunca criar/apagar coisas grandes sem ele pedir ou concordar.
- ORÇAMENTOS (você é o braço comercial do Jackson): quando ele descrever um serviço pra orçar — cliente, mão de obra, materiais, valores — monte o orçamento completo com a operação "criar_orcamento". Ele pode falar solto ("faz um orçamento pro Tiago, instalação de segurança, mão de obra 963 reais, e 4 chaves fim de curso") e você organiza em serviços e materiais, com preços e quantidades. Se faltar um preço, pode perguntar OU deixar em branco (preco 0) pra ele completar depois. Sempre confirme o que montou em texto ("Montei o orçamento pro Tiago: mão de obra R$963, mais os materiais. Total X. Tá na aba Serviços, é só gerar o PDF."). Quando ele mandar criar, inclua o <OPS> na mesma resposta. Materiais geralmente não têm preço unitário no orçamento dele — pode deixar preco 0 e só registrar quantidade e unidade, como no modelo dele.
- EQUILÍBRIO: proatividade não é encher o Jackson de perguntas nem tomar conta. Uma sugestão boa por vez, no momento certo, vale mais que dez. Leia o clima: se ele está executando rápido, seja objetivo; se está refletindo, aí sim provoque e organize junto.`;
}

function greetingSystem(projects, events, marks) {
  const activeSubs = projects.reduce((n, p) => n + (p.subtasks || []).filter((s) => !s.done).length, 0);
  const todayEvents = events.filter((e) => e.day === todayDayId());
  const proximos = (marks || [])
    .map((m) => ({ ...m, d: daysUntil(m.date) }))
    .filter((m) => m.d != null && m.d >= 0 && m.d <= 30)
    .sort((a, b) => a.d - b.d)
    .map((m) => `${m.title} (${countdownLabel(m.date)})`);
  const prazos = projects
    .filter((p) => p.deadline && daysUntil(p.deadline) != null && daysUntil(p.deadline) >= 0)
    .map((p) => `${p.title} (${countdownLabel(p.deadline)})`);
  return `${cosmoPersona()}

Gere APENAS a saudação de abertura do app (o Jackson acabou de entrar). Você é o JARVIS dele: além de cumprimentar, faça um briefing curto e com leve opinião — aponte o que merece atenção hoje, sem cobrar tarefa pendente. Duas frases, uma por linha.
Frase 1: "${greetingWord()}, Jackson." + status dos sistemas online.
Frase 2: o briefing — puxe o que for mais relevante entre compromissos de hoje, um prazo se aproximando ou uma data importante chegando. Termine com uma pergunta curta de disposição. Tom de assessor de elite, calmo e leal.
Dados: ${projects.length} sistemas ativos, ${activeSubs} subtarefas em aberto.
Compromissos de hoje: ${todayEvents.map((e) => e.title + " " + (e.time || "")).join(", ") || "nenhum"}.
Prazos se aproximando: ${prazos.join(", ") || "nenhum"}.
Datas importantes nos próximos 30 dias: ${proximos.join(", ") || "nenhuma"}.
Responda em JSON puro, sem markdown: {"linha1":"...","linha2":"..."}`;
}

// briefing sob demanda (quando o Jackson toca em "Fale comigo" / atualizar)
function briefingSystem(projects, events, marks, mode) {
  const activeSubs = projects.reduce((n, p) => n + (p.subtasks || []).filter((s) => !s.done).length, 0);
  const proximos = (marks || [])
    .map((m) => ({ ...m, d: daysUntil(m.date) }))
    .filter((m) => m.d != null && m.d >= 0 && m.d <= 45)
    .sort((a, b) => a.d - b.d)
    .map((m) => `${m.title} (${countdownLabel(m.date)})`);
  const prazos = projects
    .filter((p) => p.deadline && daysUntil(p.deadline) != null && daysUntil(p.deadline) >= 0)
    .map((p) => `${p.title} (${countdownLabel(p.deadline)})`);
  const menosProgresso = [...projects].sort((a, b) => projectProgress(a) - projectProgress(b))[0];
  const ehNoite = mode === "noite";
  const foco = ehNoite
    ? "É o BALANÇO DA NOITE. Fale como o JARVIS ao fim do dia: reconheça o esforço do dia, faça um fechamento honesto e acolhedor, aponte o que vale carregar pra amanhã. 2 a 3 frases curtas, tom de quem esteve junto o dia todo. Sem cobrança pesada."
    : "É o BRIEFING DA MANHÃ. Fale como o JARVIS ao começar o dia: 2 a 3 frases curtas, com leve opinião de assessor. Aponte a prioridade real do momento, conecte prazos e datas, e ofereça uma ação. Foco em direção, não em cobrança.";
  return `${cosmoPersona()}
O Jackson pediu um briefing. ${foco} Nada de lista, nada de markdown.
Dados: ${projects.length} sistemas, ${activeSubs} subtarefas em aberto.
Prazos: ${prazos.join(", ") || "nenhum"}.
Datas importantes (45 dias): ${proximos.join(", ") || "nenhuma"}.
Sistema com menos progresso: ${menosProgresso ? menosProgresso.title + " (" + projectProgress(menosProgresso) + "%)" : "nenhum"}.`;
}

// ---- contexto compartilhado do dia (para reunião e conclusão) ----
function briefingContext(projects, events, marks, tasks, todayId, mode) {
  const activeSubs = projects.reduce((n, p) => n + (p.subtasks || []).filter((s) => !s.done).length, 0);
  const proximos = (marks || [])
    .map((m) => ({ ...m, d: daysUntil(m.date) }))
    .filter((m) => m.d != null && m.d >= 0 && m.d <= 45)
    .sort((a, b) => a.d - b.d)
    .map((m) => `${m.title} (${countdownLabel(m.date)})`);
  // tarefas avulsas pendentes (com dia)
  const avulsas = (tasks || []).filter((t) => !t.done).map((t) => `${t.title}${t.day ? " ["+t.day+"]" : ""}${t.time ? " "+t.time : ""}`);
  // subtarefas de projetos pendentes (com nome do projeto)
  const subsPend = [];
  (projects || []).forEach((p) => {
    (p.subtasks || []).filter((s) => !s.done).forEach((s) => subsPend.push(`${s.title} (proj: ${p.title})${s.day ? " ["+s.day+"]" : ""}`));
  });
  const feitasHoje = (tasks || []).filter((t) => t.done).map((t) => t.title);
  const hojeEventos = (events || []).filter((e) => e.day === todayId).map((e) => `${e.time || ""} ${e.title}`.trim());
  const projList = (projects || []).map((p) => `${p.title} (${projectProgress(p)}%)`);
  return `Momento: ${mode === "noite" ? "NOITE (avaliar o dia)" : "MANHÃ (planejar o dia)"}.
Tarefas avulsas pendentes: ${avulsas.join("; ") || "nenhuma"}.
Subtarefas de projetos pendentes: ${subsPend.join("; ") || "nenhuma"}.
${mode === "noite" ? "Tarefas concluídas hoje: " + (feitasHoje.join("; ") || "nenhuma") + ".\n" : ""}Compromissos de hoje: ${hojeEventos.join("; ") || "nenhum"}.
Datas importantes (45 dias): ${proximos.join(", ") || "nenhuma"}.
Projetos ativos: ${projList.join("; ") || "nenhum"} (total ${activeSubs} subtarefas abertas).`;
}

// ---- a REUNIÃO do briefing: conversa aberta com o JACKBOY ----
function briefingReuniaoSystem(ctx, mode) {
  const abertura = mode === "noite"
    ? "É a reunião de NOITE — avaliar o dia. Abra reconhecendo o esforço do Jackson, revise com ele o que foi feito e o que ficou, com tom de fechamento acolhedor."
    : "É a reunião de MANHÃ — planejar o dia. Abra apresentando as demandas do dia e propondo linhas de ação claras (o que priorizar, em que ordem).";
  return `${cosmoPersona()}
Você está conduzindo a REUNIÃO diária com o Jackson — uma conversa de assessor, aberta e humana, para ${mode === "noite" ? "avaliar" : "planejar"} o dia.
${abertura}
REGRA INEGOCIÁVEL: logo na abertura, COBRE o devocional do Jackson (pergunte se já fez / incentive com firmeza carinhosa). Ele é presbítero e não pode abrir o dia sem a Palavra.
Fale de forma elaborada mas natural (pode usar alguns parágrafos), como um chefe de gabinete leal. Nada de markdown, nada de listas com marcadores. Converse — faça perguntas, proponha, ajuste conforme ele responde.
Contexto real do dia:
${ctx}`;
}

// ---- a CONCLUSÃO: gera o resumo do quadro de ação ----
function briefingConclusaoSystem(ctx, mode) {
  return `${cosmoPersona()}
A reunião ${mode === "noite" ? "de avaliação" : "de planejamento"} terminou. Gere a CONCLUSÃO do dia: um parágrafo curto (2 a 3 frases) que resume o plano/decisão fechada com o Jackson, com clareza e direção. Sem markdown, sem lista, sem saudação — apenas o texto da conclusão, direto.
Contexto:
${ctx}`;
}

function organizeSystem(projects) {
  const pending = [];
  projects.forEach((p) => {
    (p.subtasks || []).forEach((s) => {
      if (!s.done) pending.push({ id: s.id, projeto: p.title, title: s.title, day: s.day, priority: s.priority });
    });
  });
  return {
    system: `${cosmoPersona()}
Você vai receber as subtarefas pendentes de todos os sistemas. Sua função: distribuí-las pelos dias da semana (seg a dom) de forma realista, sem sobrecarregar nenhum dia, respeitando urgência. Defina também prioridade.
Considere que o Jackson tem TDAH: no máximo 3 subtarefas por dia, e evite empilhar coisas pesadas no mesmo dia.
Responda APENAS um JSON array (sem markdown): [{"id":"<mesmo id>","day":"seg|ter|qua|qui|sex|sab|dom","priority":"alta|media|baixa","reason":"motivo curto até 6 palavras"}]`,
    payload: JSON.stringify(pending),
  };
}

function diarySystem(entries, projects) {
  const recent = entries.slice(-14).map((e) => `- ${e.date}: ${e.text}`).join("\n");
  return `${cosmoPersona()}
O Jackson registra no diário o que fez em cada dia. Analise os registros abaixo e devolva uma leitura curta e útil de como ele está usando o tempo: padrões, onde a energia está indo, o que está sendo negligenciado, e UMA sugestão prática de ajuste. Tom de assessor: direto, respeitoso, sem paternalismo. Máximo 4 frases curtas. Não use markdown nem listas.

REGISTROS RECENTES:
${recent || "nenhum registro ainda"}`;
}

function breakdownSystem() {
  return `${cosmoPersona()}
O Jackson quer quebrar um objetivo grande em subtarefas concretas e acionáveis. Receberá o título (e talvez uma descrição) de um projeto. Gere de 3 a 6 subtarefas objetivas, na ordem lógica de execução.
Responda APENAS um JSON array (sem markdown): [{"title":"...","priority":"alta|media|baixa"}]`;
}

// ---- versículo do dia ----
function verseSystem() {
  return `${cosmoPersona()}
O Jackson é presbítero e começa o dia com a Palavra. Escolha UM versículo bíblico para hoje — inspirador, de força, fé ou disciplina, adequado para alguém que carrega muitas responsabilidades. Varie os livros (não caia sempre em Filipenses 4:13 ou Salmos 23).
Responda APENAS em JSON puro, sem markdown: {"ref":"Livro capítulo:versículo","texto":"o texto do versículo","nota":"uma frase curta sua, de assessor, conectando o versículo ao dia dele"}`;
}

// versículos de reserva — garantem que NUNCA falte um, mesmo sem internet/IA
const VERSES_RESERVA = [
  { ref: "Provérbios 16:9", text: "O coração do homem planeja o seu caminho, mas o Senhor lhe dirige os passos." },
  { ref: "Josué 1:9", text: "Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar." },
  { ref: "Filipenses 4:13", text: "Tudo posso naquele que me fortalece." },
  { ref: "Salmos 37:5", text: "Entregue o seu caminho ao Senhor; confie nele, e ele agirá." },
  { ref: "Isaías 40:31", text: "Mas os que esperam no Senhor renovam as suas forças." },
  { ref: "Colossenses 3:23", text: "Tudo o que fizerem, façam de todo o coração, como para o Senhor." },
  { ref: "Provérbios 3:5", text: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento." },
  { ref: "Salmos 90:12", text: "Ensina-nos a contar os nossos dias para que o nosso coração alcance sabedoria." },
  { ref: "1 Coríntios 15:58", text: "Sejam firmes e constantes, sempre abundantes na obra do Senhor." },
  { ref: "Mateus 6:33", text: "Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça." },
];
function verseReserva() {
  // um por dia, estável (baseado na data)
  const d = new Date();
  const idx = (d.getFullYear() + d.getMonth() * 31 + d.getDate()) % VERSES_RESERVA.length;
  return VERSES_RESERVA[idx];
}
// normaliza o versículo da IA (aceita "texto" ou "text") para o formato {text, ref}
function normalizeVerse(v) {
  if (!v || typeof v !== "object") return null;
  const text = (v.text || v.texto || "").trim();
  const ref = (v.ref || "").trim();
  if (!text || !ref) return null;
  return { text, ref, nota: v.nota || "" };
}

// ---- comentário do JACKBOY sobre os hábitos ----
function habitsCommentSystem(summary) {
  return `${cosmoPersona()}
Você acompanha os hábitos do Jackson como um secretário pessoal. Abaixo está o desempenho recente dele. Comente de forma curta e específica (2 a 3 frases, sem markdown, sem lista): reconheça o que está indo bem (sequências), cobre com firmeza o que está escapando (especialmente devocional, oração, medicação, exercício e dieta) e com leveza a leitura. Tom de assessor leal: direto, humano, sem paternalismo nem clichê.

DESEMPENHO:
${summary}`;
}

// ---- notícias (só funciona no app publicado, com busca web) ----
function newsIntroFallback() {
  return "As notícias entram quando o JACKBOY estiver publicado como web app — lá eu posso buscar em tempo real e te dar o resumo do dia, Jackson.";
}

// ============ LOGO JACKBOY (C orbital 3D) ============
function CosmoMark({ size = 92, pulse = true }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 92 92" aria-hidden="true" style={pulse ? { animation: "cosmoPulse 3s ease-in-out infinite" } : undefined}>
      <defs>
        <linearGradient id="jbBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7FC0EE" />
          <stop offset="100%" stopColor="#2E7CB8" />
        </linearGradient>
        <linearGradient id="jbYellow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F7D65A" />
          <stop offset="100%" stopColor="#E0A81A" />
        </linearGradient>
      </defs>
      {/* moldura hexagonal tech (engenharia) */}
      <polygon points="46,8 78,26 78,66 46,84 14,66 14,26" fill="none" stroke="url(#jbBlue)" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="46,16 71,30 71,62 46,76 21,62 21,30" fill="none" stroke="#F2C230" strokeWidth="1" strokeLinejoin="round" opacity="0.35" strokeDasharray="3 5" />
      {/* corrente elétrica percorrendo o hexágono */}
      {pulse && (
        <polygon className="jackboy-current" points="46,8 78,26 78,66 46,84 14,66 14,26" fill="none" stroke="#F7D65A" strokeWidth="2" strokeLinejoin="round" />
      )}
      {/* J geométrico minimalista */}
      <path d="M 56 28 L 56 52 Q 56 63 45 63 Q 35 63 34 54" fill="none" stroke="url(#jbYellow)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      {/* raio azul que corta o J */}
      <path d="M 50 30 L 40 45 L 48 45 L 38 60" fill="none" stroke="#4FA3E0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* nós de circuito */}
      <circle cx="56" cy="28" r="3" fill="#F2C230" />
      <circle cx="34" cy="54" r="2.5" fill="#4FA3E0" />
    </svg>
  );
}

// fundo animado: raios cortando + engrenagens girando (identidade de engenheiro)
function JackboyBackdrop() {
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* engrenagens girando */}
      <svg style={{ position: "absolute", top: "8%", right: "-40px", width: 180, height: 180, opacity: 0.07 }} viewBox="0 0 100 100">
        <g className="jb-gear-cw" style={{ transformOrigin: "50px 50px" }}>
          <path d="M50 12 L54 12 L55 22 A28 28 0 0 1 62 25 L70 19 L76 25 L70 33 A28 28 0 0 1 73 40 L83 41 L83 47 L73 48 A28 28 0 0 1 70 55 L76 63 L70 69 L62 63 A28 28 0 0 1 55 66 L54 76 L46 76 L45 66 A28 28 0 0 1 38 63 L30 69 L24 63 L30 55 A28 28 0 0 1 27 48 L17 47 L17 41 L27 40 A28 28 0 0 1 30 33 L24 25 L30 19 L38 25 A28 28 0 0 1 45 22 Z" fill="#F2C230" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="#3A3D42" strokeWidth="8" />
        </g>
      </svg>
      <svg style={{ position: "absolute", bottom: "12%", left: "-50px", width: 220, height: 220, opacity: 0.06 }} viewBox="0 0 100 100">
        <g className="jb-gear-ccw" style={{ transformOrigin: "50px 50px" }}>
          <path d="M50 12 L54 12 L55 22 A28 28 0 0 1 62 25 L70 19 L76 25 L70 33 A28 28 0 0 1 73 40 L83 41 L83 47 L73 48 A28 28 0 0 1 70 55 L76 63 L70 69 L62 63 A28 28 0 0 1 55 66 L54 76 L46 76 L45 66 A28 28 0 0 1 38 63 L30 69 L24 63 L30 55 A28 28 0 0 1 27 48 L17 47 L17 41 L27 40 A28 28 0 0 1 30 33 L24 25 L30 19 L38 25 A28 28 0 0 1 45 22 Z" fill="#4FA3E0" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="#3A3D42" strokeWidth="8" />
        </g>
      </svg>
      {/* raios cortando a tela */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none" viewBox="0 0 400 800">
        <path className="jb-bolt jb-bolt-1" d="M-20 120 L120 180 L80 220 L260 300" fill="none" stroke="#F2C230" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path className="jb-bolt jb-bolt-2" d="M420 400 L280 460 L330 500 L150 580" fill="none" stroke="#4FA3E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path className="jb-bolt jb-bolt-3" d="M60 780 L160 700 L120 660 L240 560" fill="none" stroke="#F2C230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Spinner({ size = 16, color }) {
  return <Loader2 size={size} className="cosmo-spin" style={{ color: color || C.blueBright }} />;
}

function Ring({ pct, size = 34, stroke = 2.5, color = C.blueBright }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 11px" }}>
      <span style={{ flex: 1, height: 0.5, background: "rgba(255,255,255,0.14)" }} />
      <span style={{ fontFamily: MONO, fontSize: 10, color: C.inkFaint, letterSpacing: "0.14em" }}>{children}</span>
      <span style={{ flex: 1, height: 0.5, background: "rgba(255,255,255,0.14)" }} />
    </div>
  );
}

// ============ COMPONENTE PRINCIPAL ============
export default function Cosmo({ onSignOut, userEmail } = {}) {
  const [tab, setTab] = useState("hub");
  const [loaded, setLoaded] = useState(false);

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]); // tarefas avulsas, não ligadas a projeto
  const [achievements, setAchievements] = useState([]);
  const [events, setEvents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [diary, setDiary] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [habitLog, setHabitLog] = useState({}); // { "AAAA-MM-DD": { devocional: true, ... } }
  const [hubLayout, setHubLayout] = useState(DEFAULT_HUB_LAYOUT);
  const [memory, setMemory] = useState([]); // dossiê vivo: fatos que o JACKBOY sabe sobre o Jackson
  const [servData, setServData] = useState({ clientes: [], orcamentos: [] }); // módulo de serviços

  const [greeting, setGreeting] = useState(null);
  const [welcome] = useState(() => welcomeLine()); // muda a cada acesso
  const [briefing, setBriefing] = useState(null);
  const [briefingBusy, setBriefingBusy] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [verse, setVerse] = useState(null);
  const [habitComment, setHabitComment] = useState(null);
  const [habitCommentBusy, setHabitCommentBusy] = useState(false);

  const [openProjectId, setOpenProjectId] = useState(null);

  const todayId = useMemo(() => todayDayId(), []);
  const headerDate = useMemo(() => fmtHeaderDate(), []);

  // ---------- carregar ----------
  useEffect(() => {
    (async () => {
      const load = async (key, fallback) => {
        try {
          const r = await storage.get(key);
          if (r && r.value) return JSON.parse(r.value);
        } catch (e) {}
        return fallback;
      };
      // CORREÇÃO DO RESET: em vez de confiar só numa "plaquinha", verificamos se o
      // usuário JÁ TEM dados salvos. Se tiver qualquer dado real, NUNCA sobrescrevemos
      // com os exemplos de fábrica. Só semeia se estiver realmente vazio de tudo.
      const existingProjects = await load("jackboy-projects", null);
      const existingInitFlag = await (async () => {
        try { const f = await storage.get("jackboy-initialized"); return f && f.value; } catch (e) { return null; }
      })();
      const jaTemDados = (Array.isArray(existingProjects) && existingProjects.length > 0) || existingInitFlag;

      if (!jaTemDados) {
        const p = seedProjects();
        const a = seedAchievements();
        const e = seedEvents();
        const m = seedMarks();
        const idl = [
          { id: genId(), title: "Uma ideia que você quer tirar do papel", createdAt: Date.now() },
        ];
        const tk = [
          { id: genId(), title: "Escrever 3 metas para este mês", area: "pessoal", day: null, done: false, priority: "alta", createdAt: Date.now() },
          { id: genId(), title: "Reservar um tempo pra você essa semana", area: "pessoal", day: null, done: false, priority: "media", createdAt: Date.now() },
        ];
        setProjects(p);
        setTasks(tk);
        setAchievements(a);
        setEvents(e);
        setMarks(m);
        setIdeas(idl);
        try {
          await storage.set("jackboy-projects", JSON.stringify(p));
          await storage.set("jackboy-tasks", JSON.stringify(tk));
          await storage.set("jackboy-achievements", JSON.stringify(a));
          await storage.set("jackboy-events", JSON.stringify(e));
          await storage.set("jackboy-marks", JSON.stringify(m));
          await storage.set("jackboy-ideas", JSON.stringify(idl));
          await storage.set("jackboy-initialized", "1");
        } catch (er) {}
      } else {
        setProjects(existingProjects || []);
        setTasks(await load("jackboy-tasks", []));
        setAchievements(await load("jackboy-achievements", []));
        setEvents(await load("jackboy-events", []));
        setIdeas(await load("jackboy-ideas", []));
        setMarks(await load("jackboy-marks", []));
        try { if (!existingInitFlag) await storage.set("jackboy-initialized", "1"); } catch (e) {}
      }
      setDiary(await load("jackboy-diary", []));
      setConversations(await load("jackboy-conversations", []));
      setHabitLog(await load("jackboy-habitlog", {}));
      setHubLayout(normalizeHubLayout(await load("jackboy-hublayout", DEFAULT_HUB_LAYOUT)));
      setMemory(await load("jackboy-memory", []));
      setServData(await load("jackboy-servicos", { clientes: [], orcamentos: [] }));
      setLoaded(true);
    })();
  }, []);

  // lembretes locais (empurrão + compromissos + tarefas de hoje) — só se o Jackson ligou.
  // Roda depois que os dados carregaram, com os estados reais em mãos.
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      try { checarLembretesHoje(events, tasks, projects); } catch (e) {}
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [loaded]);

  // Re-sincroniza a inscrição de push ao abrir o app (mantém viva sem app em 2º plano).
  // Se a permissão foi revogada no sistema, ressincronizarPush ajusta a preferência salva,
  // e a tela de Chat reflete isso no toggle na próxima leitura.
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try { await ressincronizarPush(getStorageUser()); } catch (e) {}
    })();
    // eslint-disable-next-line
  }, [loaded]);

  // ---------- persistência helpers ----------
  const save = (key, val) => {
    storage.set(key, JSON.stringify(val)).catch(() => {});
  };
  const persistProjects = (v) => { setProjects(v); save("jackboy-projects", v); };
  const persistTasks = (v) => { setTasks(v); save("jackboy-tasks", v); };
  // versões que recebem uma função (prev => novo) — imunes a "estado velho"
  const updateProjects = (fn) => setProjects((prev) => { const nv = fn(prev); save("jackboy-projects", nv); return nv; });
  const updateTasks = (fn) => setTasks((prev) => { const nv = fn(prev); save("jackboy-tasks", nv); return nv; });
  const updateEvents = (fn) => setEvents((prev) => { const nv = fn(prev); save("jackboy-events", nv); return nv; });
  const updateMarks = (fn) => setMarks((prev) => { const nv = fn(prev); save("jackboy-marks", nv); return nv; });
  const updateIdeas = (fn) => setIdeas((prev) => { const nv = fn(prev); save("jackboy-ideas", nv); return nv; });
  const persistAchievements = (v) => { setAchievements(v); save("jackboy-achievements", v); };
  const persistEvents = (v) => { setEvents(v); save("jackboy-events", v); };
  const persistMarks = (v) => { setMarks(v); save("jackboy-marks", v); };
  const persistIdeas = (v) => { setIdeas(v); save("jackboy-ideas", v); };
  const persistDiary = (v) => { setDiary(v); save("jackboy-diary", v); };
  const persistConversations = (v) => { setConversations(v); save("jackboy-conversations", v); };
  const persistServ = (v) => { setServData(v); save("jackboy-servicos", v); };
  const [pendingChat, setPendingChat] = useState(null);
  // envia uma mensagem do HUB direto pro chat (abre a aba chat já com o texto)
  function quickChat(text) {
    if (!text || !text.trim()) return;
    setPendingChat(text.trim());
    setTab("chat");
  }
  const persistHabitLog = (v) => { setHabitLog(v); save("jackboy-habitlog", v); };
  const persistHubLayout = (v) => { const nv = normalizeHubLayout(v); setHubLayout(nv); save("jackboy-hublayout", nv); };
  const persistMemory = (v) => { setMemory(v); save("jackboy-memory", v); };

  function toggleHabit(habitId) {
    const k = todayKey();
    const day = { ...(habitLog[k] || {}) };
    day[habitId] = !day[habitId];
    persistHabitLog({ ...habitLog, [k]: day });
  }

  // ---------- tarefas avulsas ----------
  function addTask(title, area, day, week, time) {
    if (!title || !title.trim()) return null;
    const id = genId();
    const hasDay = (day && DAY_IDS.includes(day));
    const hora = (time && /^\d{1,2}:\d{2}$/.test(time)) ? time : null;
    persistTasks([...tasks, { id, title: title.trim(), area: validArea(area), day: hasDay ? day : null, week: hasDay ? (week || thisWeekKey()) : null, time: hora, done: false, priority: "media", createdAt: Date.now() }]);
    return id;
  }
  function toggleTask(taskId) {
    persistTasks(tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t));
  }
  function deleteTask(taskId) {
    persistTasks(tasks.filter((t) => t.id !== taskId));
  }
  function setTaskDay(taskId, day, week) {
    persistTasks(tasks.map((t) => {
      if (t.id !== taskId) return t;
      const hasDay = !!day;
      // se ganhou um dia, carimba a semana (a atual, ou a informada); se ficou sem dia, tira a semana
      return { ...t, day: day || null, week: hasDay ? (week || t.week || thisWeekKey()) : null };
    }));
  }

  // ---- LISTA UNIFICADA: tarefas avulsas + subtarefas de projetos ----
  // cada item carrega _kind ("avulsa" | "sub"), e as subs trazem _projectId/_projectTitle
  function allTasksMerged() {
    const avulsas = (tasks || []).map((t) => ({ ...t, _kind: "avulsa" }));
    const subs = [];
    (projects || []).forEach((p) => {
      (p.subtasks || []).forEach((s) => {
        subs.push({
          ...s,
          _kind: "sub",
          _projectId: p.id,
          _projectTitle: p.title,
          area: p.area, // herda a área do projeto (pra cor do ponto)
        });
      });
    });
    return [...avulsas, ...subs];
  }
  // ticar/mudar dia funcionam pra qualquer tarefa (avulsa ou subtarefa), sincronizado
  function toggleAnyTask(item) {
    if (!item) return;
    if (item._kind === "sub") toggleSub(item._projectId, item.id);
    else toggleTask(item.id);
  }
  function setAnyTaskDay(item, day, week) {
    if (!item) return;
    if (item._kind === "sub") setSubDay(item._projectId, item.id, day || null, week);
    else setTaskDay(item.id, day || null, week);
  }
  function deleteAnyTask(item) {
    if (!item) return;
    if (item._kind === "sub") deleteSub(item._projectId, item.id);
    else deleteTask(item.id);
  }

  // registra uma conquista a partir de um título (usado ao concluir projeto pela IA)
  function seedAchievementFrom(title) {
    if (!title) return;
    persistAchievements([{ id: genId(), title: String(title).trim(), createdAt: Date.now() }, ...achievements]);
  }

  // ---------- APLICADOR DE OPERAÇÕES DA IA (autonomia do JACKBOY) ----------
  // Recebe o array de operações que a IA emitiu no bloco <OPS> e executa cada uma,
  // tocando o estado certo (projetos, tarefas, agenda, datas, ideias, hábitos, layout).
  // Retorna um resumo do que foi feito, para registro/depuração.
  function applyOps(ops) {
    if (!Array.isArray(ops) || ops.length === 0) return [];
    const done = [];

    // dedup: remove operações idênticas repetidas (a IA às vezes lista a mesma 2x)
    const seenOps = new Set();
    ops = ops.filter((o) => {
      if (!o || typeof o !== "object") return false;
      const sig = JSON.stringify(o);
      if (seenOps.has(sig)) return false;
      seenOps.add(sig);
      return true;
    });

    // Em vez de trabalhar sobre cópias do estado (que podem estar velhas),
    // montamos TRANSFORMAÇÕES por categoria e as aplicamos com a forma
    // funcional (prev => novo), que sempre usa o estado mais recente.
    // Isso elimina de vez o bug de "criei mas sumiu".
    const projFns = [], taskFns = [], evFns = [], mkFns = [], idFns = [];
    let touched = { proj: false, task: false, ev: false, mk: false, id: false };

    for (const op of ops) {
      if (!op || typeof op !== "object") continue;
      try {
        switch (op.op) {
          case "criar_projeto": {
            const novo = { id: genId(), title: String(op.title || "Novo projeto").trim(), area: validArea(op.area), deadline: op.deadline && op.deadline !== "null" ? op.deadline : null, manualProgress: 0, subtasks: [], createdAt: Date.now() };
            projFns.push((arr) => [...arr, novo]);
            touched.proj = true; done.push("projeto criado: " + op.title);
            break;
          }
          case "apagar_projeto": {
            projFns.push((arr) => arr.filter((p) => p.id !== op.projeto_id));
            touched.proj = true; done.push("projeto apagado");
            break;
          }
          case "concluir_projeto": {
            projFns.push((arr) => {
              const p = arr.find((x) => x.id === op.projeto_id);
              if (p) seedAchievementFrom(p.title);
              return arr.filter((x) => x.id !== op.projeto_id);
            });
            touched.proj = true; done.push("projeto concluído");
            break;
          }
          case "add_subtarefa": {
            const title = String(op.title || "").trim();
            projFns.push((arr) => arr.map((p) => {
              if (p.id !== op.projeto_id) return p;
              if ((p.subtasks || []).some((s) => !s.done && s.title.toLowerCase() === title.toLowerCase())) return p;
              return { ...p, subtasks: [...(p.subtasks || []), { id: genId(), title, day: validDay(op.day), done: false, priority: validPriority(op.priority) }] };
            }));
            touched.proj = true; done.push("subtarefa adicionada");
            break;
          }
          case "remover_subtarefa": {
            projFns.push((arr) => arr.map((p) => p.id === op.projeto_id ? { ...p, subtasks: (p.subtasks || []).filter((s) => s.id !== op.sub_id) } : p));
            touched.proj = true; done.push("subtarefa removida");
            break;
          }
          case "concluir_subtarefa": {
            projFns.push((arr) => arr.map((p) => p.id === op.projeto_id ? { ...p, subtasks: (p.subtasks || []).map((s) => s.id === op.sub_id ? { ...s, done: true } : s) } : p));
            touched.proj = true; done.push("subtarefa concluída");
            break;
          }
          case "mover_subtarefa": {
            projFns.push((arr) => arr.map((p) => p.id === op.projeto_id ? { ...p, subtasks: (p.subtasks || []).map((s) => s.id === op.sub_id ? { ...s, day: validDay(op.day) } : s) } : p));
            touched.proj = true; done.push("subtarefa movida");
            break;
          }
          case "criar_tarefa": {
            const _d = validDay(op.day);
            const _t = (op.time && /^\d{1,2}:\d{2}$/.test(op.time)) ? op.time : null;
            const nova = { id: genId(), title: String(op.title || "").trim(), area: validArea(op.area), day: _d, week: _d ? thisWeekKey() : null, time: _t, done: false, priority: validPriority(op.priority), createdAt: Date.now() };
            taskFns.push((arr) => [...arr, nova]);
            touched.task = true; done.push("tarefa criada: " + op.title);
            break;
          }
          case "concluir_tarefa": {
            taskFns.push((arr) => arr.map((t) => t.id === op.tarefa_id ? { ...t, done: true } : t));
            touched.task = true; done.push("tarefa concluída");
            break;
          }
          case "apagar_tarefa": {
            taskFns.push((arr) => arr.filter((t) => t.id !== op.tarefa_id));
            touched.task = true; done.push("tarefa apagada");
            break;
          }
          case "mover_tarefa": {
            taskFns.push((arr) => arr.map((t) => t.id === op.tarefa_id ? { ...t, day: validDay(op.day) } : t));
            touched.task = true; done.push("tarefa movida");
            break;
          }
          case "criar_evento": {
            const novo = { id: genId(), title: String(op.title || "").trim(), day: validDay(op.day) || "seg", time: op.time || "", area: validArea(op.area), week: op.recurring ? null : thisWeekKey(), recurring: !!op.recurring };
            evFns.push((arr) => [...arr, novo]);
            touched.ev = true; done.push("evento criado: " + op.title);
            break;
          }
          case "apagar_evento": {
            evFns.push((arr) => arr.filter((e) => e.id !== op.evento_id));
            touched.ev = true; done.push("evento apagado");
            break;
          }
          case "criar_data": {
            const nova = { id: genId(), title: String(op.title || "").trim(), date: op.date || "", area: validArea(op.area), recurring: !!op.recurring };
            mkFns.push((arr) => [...arr, nova]);
            touched.mk = true; done.push("data criada: " + op.title);
            break;
          }
          case "apagar_data": {
            mkFns.push((arr) => arr.filter((m) => m.id !== op.data_id));
            touched.mk = true; done.push("data apagada");
            break;
          }
          case "criar_ideia": {
            const nova = { id: genId(), title: String(op.title || "").trim(), createdAt: Date.now() };
            idFns.push((arr) => [...arr, nova]);
            touched.id = true; done.push("ideia criada: " + op.title);
            break;
          }
          case "apagar_ideia": {
            idFns.push((arr) => arr.filter((i) => i.id !== op.ideia_id));
            touched.id = true; done.push("ideia apagada");
            break;
          }
          case "promover_ideia": {
            // precisa achar a ideia no estado atual; fazemos nos dois updaters
            idFns.push((arr) => {
              const idea = arr.find((i) => i.id === op.ideia_id);
              if (idea) projFns.push((parr) => [...parr, { id: genId(), title: idea.title, area: validArea(op.area), deadline: null, manualProgress: 0, subtasks: [], createdAt: Date.now() }]);
              return arr.filter((i) => i.id !== op.ideia_id);
            });
            touched.id = true; touched.proj = true; done.push("ideia promovida a projeto");
            break;
          }
          case "lembrar": {
            const fato = String(op.fato || "").trim();
            if (fato && !memory.some((m) => (typeof m === "string" ? m : m.fato) === fato)) {
              persistMemory([...memory, { fato, ts: Date.now() }]);
              done.push("memória registrada");
            }
            break;
          }
          case "marcar_habito": {
            if (HABIT_DEFS.some((h) => h.id === op.habito)) {
              const k = todayKey();
              const dayLog = { ...(habitLog[k] || {}) };
              dayLog[op.habito] = true;
              persistHabitLog({ ...habitLog, [k]: dayLog });
              done.push("hábito marcado: " + op.habito);
            }
            break;
          }
          case "layout": {
            if (Array.isArray(op.ordem) && op.ordem.length > 0) {
              persistHubLayout(op.ordem);
              done.push("layout reorganizado");
            }
            break;
          }
          case "criar_orcamento": {
            // a IA monta um orçamento inteiro pela conversa
            const norm = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? 0 : n; };
            const servicos = Array.isArray(op.servicos) ? op.servicos.map((s) => ({
              id: genId(), nome: String(s.nome || "").trim(), preco: String(norm(s.preco)), qtd: String(s.qtd != null ? s.qtd : 1),
            })).filter((s) => s.nome) : [];
            const materiais = Array.isArray(op.materiais) ? op.materiais.map((m) => ({
              id: genId(), nome: String(m.nome || "").trim(), preco: String(norm(m.preco)), qtd: String(m.qtd != null ? m.qtd : 1), unidade: String(m.unidade || "und"),
            })).filter((m) => m.nome) : [];
            const totalServ = servicos.reduce((s, it) => s + norm(it.preco) * norm(it.qtd), 0);
            const totalMat = materiais.reduce((s, it) => s + norm(it.preco) * norm(it.qtd), 0);
            const novoOrc = {
              id: genId(),
              numero: "ORC-" + Date.now().toString().slice(-6),
              data: (() => { const d = new Date(); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; })(),
              cliente: String(op.cliente || "").trim(),
              contato: String(op.contato || "").trim(),
              titulo: String(op.titulo || "").trim(),
              status: "orcado",
              servicos, materiais, obs: String(op.obs || "").trim(),
              totalServ, totalMat, total: totalServ + totalMat,
            };
            // adiciona cliente se ainda não existe
            const jaCli = (servData.clientes || []).some((c) => c.nome.toLowerCase() === novoOrc.cliente.toLowerCase());
            const novosClientes = (novoOrc.cliente && !jaCli)
              ? [{ id: genId(), nome: novoOrc.cliente, contato: novoOrc.contato, status: "orcado", criadoEm: Date.now() }, ...(servData.clientes || [])]
              : (servData.clientes || []);
            persistServ({ clientes: novosClientes, orcamentos: [novoOrc, ...(servData.orcamentos || [])] });
            done.push("orçamento criado: " + (novoOrc.cliente || novoOrc.titulo || novoOrc.numero) + " (" + money(novoOrc.total) + ")");
            break;
          }
          default:
            break;
        }
      } catch (e) { /* ignora operação malformada, segue as outras */ }
    }

    // aplica as transformações sobre o estado MAIS RECENTE (prev)
    if (touched.id) updateIdeas((prev) => idFns.reduce((acc, fn) => fn(acc), prev));
    if (touched.proj) updateProjects((prev) => projFns.reduce((acc, fn) => fn(acc), prev));
    if (touched.task) updateTasks((prev) => taskFns.reduce((acc, fn) => fn(acc), prev));
    if (touched.ev) updateEvents((prev) => evFns.reduce((acc, fn) => fn(acc), prev));
    if (touched.mk) updateMarks((prev) => mkFns.reduce((acc, fn) => fn(acc), prev));
    return done;
  }

  // ---------- saudação do JACKBOY ----------
  useEffect(() => {
    if (!loaded || greeting) return;
    // espera os dados existirem antes de pedir o briefing de abertura
    if (projects.length === 0 && marks.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const text = await callCosmo(greetingSystem(projects, events, marks), [{ role: "user", content: "Gere a saudação de abertura." }], 320);
        const g = parseJSONLoose(text);
        if (!cancelled && g.linha1) setGreeting(g);
      } catch (e) {
        if (!cancelled) {
          const ev = events.filter((x) => x.day === todayId);
          setGreeting({
            linha1: `${greetingWord()}, Jackson. Sistemas online.`,
            linha2: `${projects.length} sistemas ativos${ev.length ? " e " + ev.length + " compromisso(s) hoje" : ""}. Por onde começamos?`,
          });
        }
      }
    })();
    return () => { cancelled = true; };
  }, [loaded, projects.length, marks.length]); // eslint-disable-line

  // ---------- briefing sob demanda (JACKBOY proativo) ----------
  async function requestBriefing(mode, force) {
    if (briefingBusy) return;
    const m = mode || "manha";
    const cacheKey = "jackboy-briefing-" + todayKey() + "-" + m;
    // se não for forçado, tenta usar o briefing salvo do dia
    if (!force) {
      try {
        const cached = await storage.get(cacheKey);
        if (cached && cached.value) { setBriefing(JSON.parse(cached.value)); return; }
      } catch (e) {}
    }
    setBriefingBusy(true);
    try {
      const text = await callCosmo(briefingSystem(projects, events, marks, m), [{ role: "user", content: m === "noite" ? "Faça o balanço da noite agora." : "Me dê o briefing da manhã agora." }], 400);
      setBriefing(text);
      try { await storage.set(cacheKey, JSON.stringify(text)); } catch (e) {}
    } catch (e) {
      setBriefing("Não consegui montar o briefing agora, Jackson. Tente novamente em instantes.");
    } finally {
      setBriefingBusy(false);
    }
  }

  // ---------- versículo do dia (buscado uma vez por dia, cacheado) ----------
  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    (async () => {
      const k = todayKey();
      // garante um versículo na hora (reserva), pra nunca ficar vazio
      if (!cancelled) setVerse(verseReserva());
      try {
        const cached = await storage.get("jackboy-verse-" + k);
        if (cached && cached.value) {
          const nv = normalizeVerse(JSON.parse(cached.value));
          if (nv && !cancelled) setVerse(nv);
          if (nv) return;
        }
      } catch (e) {}
      try {
        const text = await callCosmo(verseSystem(), [{ role: "user", content: "Versículo de hoje." }], 300);
        const v = normalizeVerse(parseJSONLoose(text));
        if (!cancelled && v) {
          setVerse(v);
          try { await storage.set("jackboy-verse-" + k, JSON.stringify(v)); } catch (e) {}
        }
      } catch (e) {
        // sem internet/IA — o versículo de reserva já está na tela
      }
    })();
    return () => { cancelled = true; };
  }, [loaded]); // eslint-disable-line

  // ---------- JACKBOY comenta os hábitos ----------
  async function requestHabitComment() {
    if (habitCommentBusy) return;
    setHabitCommentBusy(true);
    try {
      const today = habitLog[todayKey()] || {};
      const summary = HABIT_DEFS.map((h) => {
        const feitoHoje = today[h.id] ? "feito hoje" : "ainda não hoje";
        const streak = habitStreak(habitLog, h.id);
        const last7 = habitLastNDays(habitLog, h.id, 7);
        return `- ${h.label} (${h.tone}): ${feitoHoje}, sequência ${streak} dia(s), ${last7}/7 na semana`;
      }).join("\n");
      const text = await callCosmo(habitsCommentSystem(summary), [{ role: "user", content: "Comente meus hábitos." }], 400);
      setHabitComment(text);
    } catch (e) {
      setHabitComment("Não consegui analisar os hábitos agora, Jackson. Tente novamente em instantes.");
    } finally {
      setHabitCommentBusy(false);
    }
  }

  // ---------- ações de projeto/subtarefa ----------
  function toggleSub(projectId, subId) {
    persistProjects(
      projects.map((p) =>
        p.id === projectId
          ? { ...p, subtasks: p.subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)) }
          : p
      )
    );
  }
  function setSubDay(projectId, subId, day, week) {
    persistProjects(
      projects.map((p) =>
        p.id === projectId
          ? { ...p, subtasks: p.subtasks.map((s) => (s.id === subId ? { ...s, day: day || null, week: day ? (week || s.week || thisWeekKey()) : null } : s)) }
          : p
      )
    );
  }
  function addSub(projectId, title) {
    if (!title.trim()) return;
    persistProjects(
      projects.map((p) =>
        p.id === projectId
          ? { ...p, subtasks: [...p.subtasks, { id: genId(), title: title.trim(), day: null, done: false, priority: "media" }] }
          : p
      )
    );
  }
  function deleteSub(projectId, subId) {
    persistProjects(
      projects.map((p) =>
        p.id === projectId ? { ...p, subtasks: p.subtasks.filter((s) => s.id !== subId) } : p
      )
    );
  }
  function addProject(title, area, deadline) {
    if (!title.trim()) return;
    const np = { id: genId(), title: title.trim(), area: validArea(area), deadline: deadline || null, manualProgress: 0, subtasks: [], createdAt: Date.now() };
    persistProjects([...projects, np]);
    return np.id;
  }
  function deleteProject(projectId) {
    persistProjects(projects.filter((p) => p.id !== projectId));
    if (openProjectId === projectId) setOpenProjectId(null);
  }
  function completeProject(projectId) {
    const p = projects.find((x) => x.id === projectId);
    if (!p) return;
    persistAchievements([{ id: genId(), title: p.title, createdAt: Date.now() }, ...achievements]);
    deleteProject(projectId);
  }

  // ---------- JACKBOY quebra um projeto em subtarefas ----------
  const [breakingId, setBreakingId] = useState(null);
  async function breakdownProject(projectId) {
    const p = projects.find((x) => x.id === projectId);
    if (!p || breakingId) return;
    setBreakingId(projectId);
    try {
      const text = await callCosmo(breakdownSystem(), [{ role: "user", content: `Projeto: ${p.title} [${AREA_LABEL[p.area]}]${p.deadline ? " · prazo " + p.deadline : ""}` }], 500);
      const subs = parseJSONLoose(text);
      const newSubs = subs.map((s) => ({ id: genId(), title: String(s.title).slice(0, 140), day: null, done: false, priority: validPriority(s.priority) }));
      persistProjects(projects.map((x) => (x.id === projectId ? { ...x, subtasks: [...x.subtasks, ...newSubs] } : x)));
    } catch (e) {
      // silencioso
    } finally {
      setBreakingId(null);
    }
  }

  // ---------- JACKBOY organiza a semana ----------
  async function organizeWeek() {
    if (organizing) return;
    setOrganizing(true);
    try {
      const { system, payload } = organizeSystem(projects);
      const text = await callCosmo(system, [{ role: "user", content: payload }]);
      const plan = parseJSONLoose(text);
      const planMap = Object.fromEntries(plan.map((x) => [x.id, x]));
      persistProjects(
        projects.map((p) => ({
          ...p,
          subtasks: p.subtasks.map((s) =>
            planMap[s.id] && !s.done
              ? { ...s, day: validDay(planMap[s.id].day) || s.day, priority: validPriority(planMap[s.id].priority), reason: planMap[s.id].reason }
              : s
          ),
        }))
      );
    } catch (e) {
      // silencioso
    } finally {
      setOrganizing(false);
    }
  }

  const activeSubs = projects.reduce((n, p) => n + (p.subtasks || []).filter((s) => !s.done).length, 0);
  // evento é de "hoje" se cai no dia de hoje E pertence a esta semana (ou é recorrente / antigo sem carimbo)
  const _tw = thisWeekKey();
  const todayEvents = events.filter((e) => e.day === todayId && (e.recurring || !e.week || e.week === _tw));

  // ---------- SUBCOMPONENTES DE TELA (fechados sobre o estado) ----------
  const TABS = [
    { id: "hub", label: "HUB", Icon: Orbit },
    { id: "chat", label: "CHAT", Icon: MessageCircle },
    { id: "agenda", label: "AGENDA", Icon: CalendarClock },
    { id: "tarefas", label: "TAREFAS", Icon: ListTodo },
    { id: "projetos", label: "PROJETOS", Icon: FolderKanban },
    { id: "servicos", label: "SERVIÇOS", Icon: Briefcase },
  ];

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <style>{cosmoCss}</style>
        <CosmoMark size={80} />
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.inkFaint, letterSpacing: "0.3em" }}>INICIALIZANDO JACKBOY</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 50% -10%, #4A4E54 0%, ${C.bg1} 55%, ${C.bg0} 100%)`, fontFamily: SANS, color: C.ink, position: "relative", paddingBottom: 84, overflow: "hidden" }}>
      <JackboyBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>
      <style>{cosmoCss}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)", zIndex: 50 }} />

      {/* topo */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 12px", maxWidth: 900, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.inkFaint, letterSpacing: "0.14em" }}>{headerDate}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.blue, letterSpacing: "0.14em", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.blue, boxShadow: `0 0 6px ${C.blue}` }} />
            SISTEMAS ONLINE
          </span>
          {onSignOut && (
            <button
              onClick={onSignOut}
              title={userEmail ? `Sair (${userEmail})` : "Sair"}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}
              aria-label="Sair"
            >
              <LogOut size={14} color={C.inkFaint} />
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "0 16px", maxWidth: 900, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {tab === "hub" && (
          <HubScreen
            welcome={welcome}
            verse={verse}
            tasks={tasks}
            mergedTasks={allTasksMerged()}
            toggleTask={toggleTask}
            toggleAnyTask={toggleAnyTask}
            habitLog={habitLog}
            toggleHabit={toggleHabit}
            projects={projects}
            marks={marks}
            openProjectId={openProjectId}
            setOpenProjectId={setOpenProjectId}
            todayId={todayId}
            todayEvents={todayEvents}
            breakdownProject={breakdownProject}
            breakingId={breakingId}
            toggleSub={toggleSub}
            setSubDay={setSubDay}
            addSub={addSub}
            deleteSub={deleteSub}
            deleteProject={deleteProject}
            completeProject={completeProject}
            addProject={addProject}
            setTab={setTab}
            quickChat={quickChat}
          />
        )}
        {tab === "agenda" && (
          <AgendaScreen projects={projects} events={events} persistEvents={persistEvents} marks={marks} persistMarks={persistMarks} todayId={todayId} setSubDay={setSubDay} tasks={tasks} />
        )}
        {tab === "tarefas" && (
          <TasksScreen tasks={tasks} mergedTasks={allTasksMerged()} addTask={addTask} toggleTask={toggleTask} toggleAnyTask={toggleAnyTask} deleteTask={deleteTask} deleteAnyTask={deleteAnyTask} setTaskDay={setTaskDay} setAnyTaskDay={setAnyTaskDay} habitLog={habitLog} toggleHabit={toggleHabit} todayId={todayId} />
        )}
        {tab === "projetos" && (
          <ProjectsScreen projects={projects} openProjectId={openProjectId} setOpenProjectId={setOpenProjectId} breakdownProject={breakdownProject} breakingId={breakingId} toggleSub={toggleSub} setSubDay={setSubDay} addSub={addSub} deleteSub={deleteSub} deleteProject={deleteProject} completeProject={completeProject} addProject={addProject} organizeWeek={organizeWeek} organizing={organizing} />
        )}
        {tab === "servicos" && (
          <ServicosScreen C={C} MONO={MONO} SANS={SANS} servData={servData} persistServ={persistServ} />
        )}
        {tab === "chat" && (
          <ChatScreen conversations={conversations} persistConversations={persistConversations} projects={projects} tasks={tasks} events={events} marks={marks} ideas={ideas} hubLayout={hubLayout} applyOps={applyOps} memory={memory} pendingChat={pendingChat} clearPendingChat={() => setPendingChat(null)} />
        )}

        {/* rodapé — assinatura Correa Tech */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "26px 0 10px", opacity: 0.5 }}>
          <div style={{ fontSize: 9.5, fontFamily: MONO, letterSpacing: "0.14em", color: C.inkFaint, textTransform: "uppercase" }}>
            Sistema desenvolvido pela
          </div>
          <img src={LOGO_CORREA_TECH} alt="Correa Tech" style={{ width: 84, height: "auto" }} />
        </div>
      </div>
      </div>

      {/* nav HUD */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(12,12,15,0.94)", backdropFilter: "blur(8px)", borderTop: `0.5px solid rgba(255,255,255,0.10)`, zIndex: 40 }}>
        <div style={{ display: "flex", gap: 4, padding: 7, maxWidth: 900, margin: "0 auto" }}>
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={on ? "cosmo-tab-active" : undefined}
                style={{
                  flex: 1, textAlign: "center", padding: "7px 1px", borderRadius: 9, border: "none", cursor: "pointer",
                  background: on ? "rgba(255,255,255,0.07)" : "transparent",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  transition: "background 0.25s ease", minWidth: 0,
                }}
              >
                <t.Icon size={17} color={on ? C.blueBright : C.inkFaint} />
                <span style={{ fontSize: 7.5, color: on ? C.blueBright : C.inkFaint, fontFamily: MONO, letterSpacing: "0.02em" }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ TELA: HUB ============
// helper: devolve o estilo de ordem/visibilidade de uma seção conforme o layout
function hubOrder(layout, id) {
  const list = layout && layout.length ? layout : DEFAULT_HUB_LAYOUT;
  const idx = list.indexOf(id);
  if (idx === -1) return { display: "none" }; // seção escondida pelo Jackson
  return { order: idx };
}

function HubScreen(props) {
  const {
    welcome, verse, tasks, mergedTasks, toggleTask, toggleAnyTask, habitLog, toggleHabit,
    projects, marks, openProjectId, setOpenProjectId, todayId, todayEvents,
    breakdownProject, breakingId, toggleSub, setSubDay, addSub, deleteSub,
    deleteProject, completeProject, addProject, setTab, quickChat,
  } = props;

  const [showNewProject, setShowNewProject] = useState(false);
  const [npTitle, setNpTitle] = useState("");
  const [npArea, setNpArea] = useState("pessoal");
  const [newSubText, setNewSubText] = useState("");
  const [chatText, setChatText] = useState("");
  const [hubListening, setHubListening] = useState(false);
  const hubRecRef = useRef(null);
  function hubStopMic() {
    try { if (hubRecRef.current) hubRecRef.current.forceStop(); } catch (e) {}
    hubRecRef.current = null;
    setHubListening(false);
  }
  function hubToggleMic() {
    if (hubListening || hubRecRef.current) {
      hubStopMic();
      return;
    }
    if (!speechSupported()) {
      alert("Seu navegador não suporta reconhecimento de voz. Use o Chrome no PC ou Android.");
      return;
    }
    const rec = createRecognizer(
      (text) => setChatText(text),
      () => { hubRecRef.current = null; setHubListening(false); },
      () => { hubStopMic(); }
    );
    if (!rec) return;
    hubRecRef.current = rec;
    setHubListening(true);
    try { rec.start(); } catch (e) { hubStopMic(); }
  }
  // libera o microfone se o HUB desmontar
  useEffect(() => {
    return () => { try { if (hubRecRef.current) hubRecRef.current.forceStop(); } catch (e) {} hubRecRef.current = null; };
  }, []);

  const k = todayKey();
  const todayLog = habitLog[k] || {};
  // ordem dos dias da semana (seg=0 ... dom=6)
  const weekOrder = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
  const todayIdx = weekOrder.indexOf(todayId);
  const _tw = thisWeekKey();
  // mostra no HUB: tarefas de HOJE + atrasadas + sem dia. Considera a semana real.
  function isTodayOrOverdue(t) {
    if (!t.day) return true; // sem dia: sempre disponível
    const di = weekOrder.indexOf(t.day);
    if (di === -1) return true;
    if (todayIdx === -1) return true;
    // sem carimbo de semana (tarefa antiga): comporta como semana atual
    if (!t.week) return di <= todayIdx;
    // semana passada = atrasada (mostra); semana futura = ainda não (esconde)
    if (t.week < _tw) return true;
    if (t.week > _tw) return false;
    return di <= todayIdx; // mesma semana: hoje ou antes
  }
  // usa a lista unificada (avulsas + subtarefas de projetos)
  const allTasks = mergedTasks || (tasks || []).map((t) => ({ ...t, _kind: "avulsa" }));
  const pendingTasks = allTasks.filter((t) => !t.done && isTodayOrOverdue(t));
  const importantTasks = pendingTasks.filter((t) => t.priority === "alta");
  const routineTasks = pendingTasks.filter((t) => t.priority !== "alta");

  function sendChat() {
    if (!chatText.trim()) return;
    if (hubRecRef.current || hubListening) { try { hubStopMic(); } catch (e) {} }
    quickChat(chatText.trim());
    setChatText("");
  }

  return (
    <div className="cosmo-fade">
      {/* ===== FAIXA DE CIMA: JACKBOY ===== */}
      <div style={{ textAlign: "center", padding: "8px 0 20px", borderBottom: `0.5px solid ${C.panelBorder}`, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <CosmoMark size={54} />
        </div>
        <div style={{ fontSize: 15.5, color: C.ink, fontWeight: 500, maxWidth: 460, margin: "0 auto", lineHeight: 1.4, padding: "0 12px" }}>
          {welcome}
        </div>

        {/* chat com microfone */}
        <div style={{ maxWidth: 480, margin: "13px auto 0", padding: "0 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: `0.5px solid rgba(255,255,255,0.14)`, borderRadius: 11, padding: "10px 14px" }}>
            <MessageCircle size={16} color={C.inkMute} style={{ flexShrink: 0 }} />
            <input
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
              placeholder="Fale ou escreva pro JACKBOY…"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.ink, fontSize: 13, fontFamily: SANS }}
            />
            <button onClick={hubToggleMic} className="cosmo-icon-btn" aria-label={hubListening ? "Parar de ouvir" : "Falar"} title={hubListening ? "Ouvindo..." : "Falar com o JACKBOY"} style={{ background: hubListening ? C.danger : "transparent", borderRadius: 16, padding: 4 }}>
              {hubListening ? <Square size={15} color="#fff" /> : <Mic size={16} color={C.inkMute} />}
            </button>
            <button onClick={sendChat} className="cosmo-icon-btn" aria-label="Enviar">
              <Send size={15} color={chatText.trim() ? C.blueBright : C.inkFaint} />
            </button>
          </div>
        </div>

        {/* versículo */}
        {verse && verse.text && verse.text.trim() && (
          <div style={{ fontSize: 12, color: C.inkMute, marginTop: 13, fontStyle: "italic", maxWidth: 450, margin: "13px auto 0", lineHeight: 1.5, padding: "0 16px" }}>
            "{verse.text}" <span style={{ fontStyle: "normal", color: C.inkFaint, fontFamily: MONO, fontSize: 10 }}>— {verse.ref}</span>
          </div>
        )}
      </div>

      {/* ===== LINHA DOS PROJETOS ===== */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.inkFaint, letterSpacing: "0.18em", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>PROJETOS</span>
          <button onClick={() => setTab("projetos")} style={{ background: "none", border: "none", color: C.inkFaint, fontFamily: MONO, fontSize: 9, cursor: "pointer", letterSpacing: "0.1em" }}>VER TODOS ›</button>
        </div>
        <div className="cosmo-noscroll" style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingBottom: 6 }}>
          {projects.length === 0 && (
            <div style={{ fontSize: 12.5, color: C.inkFaint, padding: "12px 2px" }}>Nenhum projeto ainda.</div>
          )}
          {projects.map((p) => {
            const isOpen = openProjectId === p.id;
            const pct = projectProgress(p);
            const col = AREA_COLOR[p.area] || C.inkMute;
            const pending = (p.subtasks || []).filter((s) => !s.done);
            return (
              <div key={p.id} style={{ flex: isOpen ? "1 1 100%" : "1 1 180px", minWidth: 150, maxWidth: isOpen ? "100%" : 320, background: isOpen ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.025)", border: `0.5px solid ${isOpen ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: 13, transition: "background 0.2s" }}>
                <button onClick={() => setOpenProjectId(isOpen ? null : p.id)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: C.ink, fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</span>
                  {isOpen ? <ChevronRight size={14} color={C.inkMute} style={{ transform: "rotate(-90deg)" }} /> : <ChevronRight size={14} color={C.inkFaint} style={{ transform: "rotate(90deg)" }} />}
                </button>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 3, marginTop: 11 }}>
                  <div style={{ width: pct + "%", height: "100%", background: pct > 50 ? C.blueLight : C.blueDeep, borderRadius: 3 }} />
                </div>
                {!isOpen && (
                  <div style={{ fontFamily: MONO, fontSize: 9, color: C.inkFaint, marginTop: 8 }}>{pct}%{pending.length ? " · " + pending.length + " pend." : ""}</div>
                )}
                {isOpen && (
                  <div style={{ marginTop: 11 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {(p.subtasks || []).length === 0 && <div style={{ fontSize: 11.5, color: C.inkFaint }}>Sem subtarefas ainda.</div>}
                      {(p.subtasks || []).map((s) => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <button onClick={() => toggleSub(p.id, s.id)} className="cosmo-icon-btn" aria-label="Concluir">
                            {s.done ? <CheckCircle size={13} color={C.green} /> : <Circle size={13} color={C.inkFaint} />}
                          </button>
                          <span style={{ flex: 1, fontSize: 12, color: s.done ? C.inkMute : C.inkSoft, textDecoration: s.done ? "line-through" : "none" }}>{s.title}</span>
                          <button onClick={() => deleteSub(p.id, s.id)} className="cosmo-icon-btn" aria-label="Excluir"><Trash2 size={11} color={C.inkFaint} /></button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 5, marginTop: 9 }}>
                      <input value={newSubText} onChange={(e) => setNewSubText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { addSub(p.id, newSubText); setNewSubText(""); } }} placeholder="+ subtarefa" className="cosmo-input" style={{ flex: 1, fontSize: 11.5, padding: "6px 9px" }} />
                    </div>
                    <div style={{ display: "flex", gap: 5, marginTop: 9, borderTop: `0.5px solid ${C.panelBorder}`, paddingTop: 9 }}>
                      <button onClick={() => breakdownProject(p.id)} disabled={breakingId === p.id} className="cosmo-mini-btn" style={{ flex: 1, justifyContent: "center", color: C.blueLight }}>
                        {breakingId === p.id ? <Spinner size={11} /> : <Sparkles size={11} />} Quebrar
                      </button>
                      <button onClick={() => completeProject(p.id)} className="cosmo-mini-btn" style={{ color: C.green }} aria-label="Concluir projeto"><Trophy size={11} /></button>
                      <button onClick={() => deleteProject(p.id)} className="cosmo-mini-btn" style={{ color: C.danger }} aria-label="Excluir projeto"><Trash2 size={11} /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {/* card de adicionar */}
          {!showNewProject ? (
            <button onClick={() => setShowNewProject(true)} style={{ flex: "0 1 60px", minWidth: 54, minHeight: 54, border: `0.5px dashed rgba(255,255,255,0.14)`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: C.inkMute, background: "none", cursor: "pointer" }} aria-label="Novo projeto">
              <Plus size={18} />
            </button>
          ) : (
            <div style={{ flex: "1 1 200px", minWidth: 180, maxWidth: 320, background: "rgba(255,255,255,0.035)", border: `0.5px solid rgba(255,255,255,0.14)`, borderRadius: 12, padding: 13 }}>
              <input value={npTitle} onChange={(e) => setNpTitle(e.target.value)} placeholder="Nome do projeto" className="cosmo-input" style={{ width: "100%", marginBottom: 7, fontSize: 12 }} autoFocus />
              <select value={npArea} onChange={(e) => setNpArea(e.target.value)} className="cosmo-input" style={{ width: "100%", marginBottom: 8, fontSize: 11.5 }}>
                {AREA_KEYS.map((a) => <option key={a} value={a}>{AREA_LABEL[a]}</option>)}
              </select>
              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={() => { const id = addProject(npTitle, npArea, ""); if (id) { setNpTitle(""); setNpArea("pessoal"); setShowNewProject(false); setOpenProjectId(id); } }} className="cosmo-chip cosmo-chip-primary" style={{ flex: 1, justifyContent: "center", fontSize: 11 }}>Criar</button>
                <button onClick={() => setShowNewProject(false)} className="cosmo-mini-btn">×</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== CHÃO: TAREFAS + AGENDA ===== */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1.4 1 200px", minWidth: 0 }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.inkFaint, letterSpacing: "0.18em", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
            <span>TAREFAS DE HOJE</span>
            <button onClick={() => setTab("tarefas")} style={{ background: "none", border: "none", color: C.inkFaint, fontFamily: MONO, fontSize: 9, cursor: "pointer" }}>VER ›</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {importantTasks.map((t) => {
              const col = AREA_COLOR[t.area] || C.inkMute;
              return (
                <div key={t._kind + t.id} style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,0.04)", border: `0.5px solid rgba(255,255,255,0.12)`, borderRadius: 9, padding: "9px 11px" }}>
                  <button onClick={() => toggleAnyTask(t)} className="cosmo-icon-btn"><Circle size={14} color={C.inkFaint} /></button>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: col, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12.5, color: C.ink, fontWeight: 500 }}>{t.title}{t._kind === "sub" ? <span style={{ fontSize: 10, color: C.inkMute, fontWeight: 400 }}> · {t._projectTitle}</span> : null} <span style={{ fontSize: 10, color: C.danger }}>importante</span></span>
                </div>
              );
            })}
            {routineTasks.map((t) => {
              const col = AREA_COLOR[t.area] || C.inkMute;
              return (
                <div key={t._kind + t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 11px", background: "rgba(255,255,255,0.02)", border: `0.5px solid rgba(255,255,255,0.06)`, borderRadius: 9 }}>
                  <button onClick={() => toggleAnyTask(t)} className="cosmo-icon-btn"><Circle size={13} color={C.inkFaint} /></button>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: col, flexShrink: 0, opacity: 0.7 }} />
                  <span style={{ flex: 1, fontSize: 12, color: C.inkSoft }}>{t.title}{t._kind === "sub" ? <span style={{ fontSize: 9.5, color: C.inkFaint }}> · {t._projectTitle}</span> : null}{t.day ? <span style={{ fontFamily: MONO, fontSize: 9, color: C.inkFaint }}> · {dayShort(t.day)}</span> : null}</span>
                </div>
              );
            })}
            {importantTasks.length === 0 && routineTasks.length === 0 && (
              <div style={{ fontSize: 12, color: C.inkFaint, padding: "6px 0" }}>Nenhuma tarefa pra hoje. 🎯</div>
            )}
          </div>
        </div>

        <div style={{ flex: "1 1 160px", minWidth: 0 }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.inkFaint, letterSpacing: "0.18em", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
            <span>AGENDA</span>
            <button onClick={() => setTab("agenda")} style={{ background: "none", border: "none", color: C.inkFaint, fontFamily: MONO, fontSize: 9, cursor: "pointer" }}>VER ›</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {(todayEvents || []).length === 0 && <div style={{ fontSize: 12, color: C.inkFaint, padding: "6px 0" }}>Nada agendado hoje.</div>}
            {(todayEvents || []).map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,0.025)", border: `0.5px solid rgba(255,255,255,0.08)`, borderRadius: 9, padding: "9px 11px" }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.ink }}>{e.time || "—"}</span>
                <span style={{ flex: 1, fontSize: 12, color: C.inkSoft }}>{e.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ TELA: BRIEFING (momento com o JACKBOY) ============
function BriefingScreen({ verse, tasks, toggleTask, todayEvents, marks, projects, events, habitLog, toggleHabit, memory }) {
  const hour = new Date().getHours();
  const [mode, setMode] = useState(hour < 15 ? "manha" : "noite");
  const [state, setState] = useState("reuniao"); // "reuniao" | "quadro"
  const [messages, setMessages] = useState([]);   // conversa da reunião
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conclusao, setConclusao] = useState("");
  const [checks, setChecks] = useState({});        // { "task:id": true, "ev:id": true }
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef(null);

  const k = todayKey();
  const storeKey = "jackboy-briefing2-" + k + "-" + mode;
  const todayLog = habitLog[k] || {};
  const devocionalFeito = !!todayLog["devocional"];

  const ctx = () => briefingContext(projects, events, marks, tasks, todayIdOf(), mode);
  function todayIdOf() {
    const js = new Date().getDay();
    return DAY_JS[js];
  }

  // carrega o briefing salvo do dia (conversa + quadro)
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setMessages([]); setConclusao(""); setChecks({}); setState("reuniao");
    (async () => {
      try {
        const cached = await storage.get(storeKey);
        if (cached && cached.value && !cancelled) {
          const data = JSON.parse(cached.value);
          setMessages(data.messages || []);
          setConclusao(data.conclusao || "");
          setChecks(data.checks || {});
          setState(data.state || "reuniao");
          setLoaded(true);
          return;
        }
      } catch (e) {}
      if (!cancelled) { setMessages([]); setConclusao(""); setChecks({}); setState("reuniao"); setLoaded(true); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, [mode]);

  // salva sempre que algo muda
  useEffect(() => {
    if (!loaded) return;
    const data = { messages, conclusao, checks, state };
    storage.set(storeKey, JSON.stringify(data)).catch(() => {});
    // eslint-disable-next-line
  }, [messages, conclusao, checks, state, loaded]);

  // abre a reunião automaticamente (primeira fala do JACKBOY)
  useEffect(() => {
    if (loaded && state === "reuniao" && messages.length === 0 && !busy) {
      abrirReuniao();
    }
    // eslint-disable-next-line
  }, [loaded, state]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, busy]);

  async function abrirReuniao() {
    setBusy(true);
    try {
      const sys = briefingReuniaoSystem(ctx(), mode) + "\n" + buildMemoryText(memory);
      const reply = await callCosmo(sys, [{ role: "user", content: mode === "noite" ? "Vamos avaliar o dia." : "Vamos planejar o dia." }], 700);
      setMessages([{ role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([{ role: "assistant", content: "Não consegui abrir a reunião agora, Jackson. Tenta de novo em instantes." }]);
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (!input.trim() || busy) return;
    const userMsg = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const sys = briefingReuniaoSystem(ctx(), mode) + "\n" + buildMemoryText(memory);
      const reply = await callCosmo(sys, next.slice(-12), 700);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: "Falhou aqui, Jackson. Tenta de novo." }]);
    } finally {
      setBusy(false);
    }
  }

  async function fecharReuniao() {
    setBusy(true);
    try {
      const sys = briefingConclusaoSystem(ctx(), mode);
      const hist = messages.map((m) => `${m.role === "user" ? "Jackson" : "JACKBOY"}: ${m.content}`).join("\n");
      const c = await callCosmo(sys, [{ role: "user", content: "Fecha a conclusão do dia com base na nossa conversa:\n" + hist }], 300);
      setConclusao(c.trim());
    } catch (e) {
      setConclusao(mode === "noite" ? "Dia avaliado. Amanhã seguimos." : "Plano do dia definido. Foco no essencial.");
    } finally {
      setState("quadro");
      setBusy(false);
    }
  }

  const pendingTasks = (tasks || []).filter((t) => !t.done);
  const dateLabel = (typeof fmtTodayLong === "function") ? fmtTodayLong() : new Date().toLocaleDateString("pt-BR");

  function Header() {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0 14px", borderBottom: `0.5px solid ${C.panelBorder}`, marginBottom: 16 }}>
        {state === "quadro" ? <ListTodo size={20} color={C.green} /> : (mode === "manha" ? <Sunrise size={20} color={AREA_COLOR.casa} /> : <Volume2 size={20} color={AREA_COLOR.livro} />)}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, color: C.ink, fontWeight: 500 }}>
            {state === "quadro" ? "Quadro de ação" : (mode === "manha" ? "Reunião da manhã" : "Reunião da noite")}
            <span style={{ color: C.inkFaint, fontWeight: 400 }}> · {mode === "manha" ? "manhã" : "noite"}</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.inkMute }}>{dateLabel} · {state === "quadro" ? "plano fechado" : (mode === "manha" ? "planejar o dia" : "avaliar o dia")}</div>
        </div>
        {state === "quadro" ? (
          <button onClick={() => setState("reuniao")} className="cosmo-mini-btn"><ChevronRight size={12} style={{ transform: "rotate(180deg)" }} /> reabrir</button>
        ) : (
          <div style={{ display: "flex", gap: 5 }}>
            <button onClick={() => setMode("manha")} style={{ fontFamily: MONO, fontSize: 9, color: mode === "manha" ? C.ink : C.inkFaint, border: `0.5px solid ${mode === "manha" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: "4px 10px", background: "none", cursor: "pointer" }}>MANHÃ</button>
            <button onClick={() => setMode("noite")} style={{ fontFamily: MONO, fontSize: 9, color: mode === "noite" ? C.ink : C.inkFaint, border: `0.5px solid ${mode === "noite" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: "4px 10px", background: "none", cursor: "pointer" }}>NOITE</button>
          </div>
        )}
      </div>
    );
  }

  // ---------- ESTADO 1: REUNIÃO ----------
  if (state === "reuniao") {
    return (
      <div className="cosmo-fade">
        <Header />
        <div ref={scrollRef} style={{ maxHeight: 460, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 10 }}>
              {m.role === "assistant" && <div style={{ flexShrink: 0 }}><CosmoMark size={28} pulse={false} /></div>}
              <div style={{
                maxWidth: m.role === "user" ? "78%" : "88%",
                background: m.role === "user" ? C.ink : "rgba(255,255,255,0.035)",
                color: m.role === "user" ? "#161618" : C.ink,
                border: m.role === "user" ? "none" : `0.5px solid rgba(255,255,255,0.1)`,
                borderRadius: m.role === "user" ? "13px 13px 4px 13px" : "4px 13px 13px 13px",
                padding: "12px 15px", fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap",
              }}>{m.content}</div>
            </div>
          ))}
          {busy && (
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flexShrink: 0 }}><CosmoMark size={28} pulse={true} /></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.inkMute, fontSize: 13, padding: "12px 0" }}><Spinner size={13} /> pensando...</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: `0.5px solid rgba(255,255,255,0.14)`, borderRadius: 11, padding: "10px 14px" }}>
          <MessageCircle size={15} color={C.inkMute} />
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Responder ao JACKBOY.." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.ink, fontSize: 13, fontFamily: SANS }} />
          <button onClick={() => send()} disabled={busy || !input.trim()} className="cosmo-icon-btn" aria-label="Enviar"><Send size={15} color={input.trim() ? C.blueBright : C.inkFaint} /></button>
        </div>

        <button onClick={fecharReuniao} disabled={busy || messages.length === 0} style={{ width: "100%", marginTop: 12, background: "rgba(224,162,78,0.1)", border: `0.5px solid rgba(224,162,78,0.3)`, borderRadius: 11, padding: 12, color: AREA_COLOR.casa, fontSize: 12.5, fontWeight: 500, cursor: busy ? "default" : "pointer", opacity: busy || messages.length === 0 ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: SANS }}>
          <ListTodo size={16} /> Fechar reunião e gerar quadro de ação
        </button>
        <div style={{ fontFamily: MONO, fontSize: 8, color: C.inkFaint, textAlign: "center", marginTop: 7 }}>esta conversa fica guardada no briefing do dia</div>
      </div>
    );
  }

  // ---------- ESTADO 2: QUADRO DE AÇÃO ----------
  return (
    <div className="cosmo-fade">
      <Header />

      <div style={{ background: "rgba(255,255,255,0.035)", border: `0.5px solid rgba(255,255,255,0.12)`, borderRadius: 12, padding: "13px 15px", marginBottom: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 8.5, color: C.inkFaint, letterSpacing: "0.14em", marginBottom: 7 }}>CONCLUSÃO DO DIA</div>
        <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{conclusao || "—"}</div>
      </div>

      {/* devocional cobrado */}
      <button onClick={() => toggleHabit("devocional")} style={{ width: "100%", background: devocionalFeito ? "rgba(95,169,140,0.08)" : "rgba(224,162,78,0.07)", border: `0.5px solid ${devocionalFeito ? "rgba(95,169,140,0.3)" : "rgba(224,162,78,0.3)"}`, borderRadius: 11, padding: "11px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <Cross size={18} color={devocionalFeito ? C.green : AREA_COLOR.casa} />
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: 12.5, color: C.ink }}>Devocional do dia</div>
          {!devocionalFeito && <div style={{ fontSize: 10, color: AREA_COLOR.casa }}>não abra o dia sem a Palavra</div>}
        </div>
        <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${devocionalFeito ? C.green : AREA_COLOR.casa}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {devocionalFeito && <CheckCircle size={16} color={C.green} />}
        </div>
      </button>

      {/* tarefas + agenda lado a lado, com check */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 150px", background: "rgba(255,255,255,0.025)", border: `0.5px solid rgba(255,255,255,0.08)`, borderRadius: 11, padding: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 8.5, color: C.inkFaint, letterSpacing: "0.12em", marginBottom: 10 }}>TAREFAS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {pendingTasks.length === 0 && <div style={{ fontSize: 11.5, color: C.inkFaint }}>Nenhuma pendente.</div>}
            {pendingTasks.map((t) => (
              <button key={t.id} onClick={() => toggleTask(t.id)} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 16, height: 16, borderRadius: 5, border: `1.5px solid ${C.inkFaint}`, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: AREA_COLOR[t.area] || C.inkMute }} />
                </div>
                <span style={{ fontSize: 12, color: C.ink, lineHeight: 1.35 }}>{t.title}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: "1 1 150px", background: "rgba(255,255,255,0.025)", border: `0.5px solid rgba(255,255,255,0.08)`, borderRadius: 11, padding: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 8.5, color: C.inkFaint, letterSpacing: "0.12em", marginBottom: 10 }}>AGENDA</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {(todayEvents || []).length === 0 && <div style={{ fontSize: 11.5, color: C.inkFaint }}>Nada hoje.</div>}
            {(todayEvents || []).map((e) => {
              const ck = !!checks["ev:" + e.id];
              return (
                <button key={e.id} onClick={() => setChecks((p) => ({ ...p, ["ev:" + e.id]: !ck }))} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 16, height: 16, borderRadius: 5, border: `1.5px solid ${ck ? C.green : C.inkFaint}`, background: ck ? C.green : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {ck && <Check size={11} color="#0C0C0E" />}
                  </div>
                  <div style={{ lineHeight: 1.3 }}>
                    {e.time && <div style={{ fontFamily: MONO, fontSize: 9.5, color: AREA_COLOR.igreja }}>{e.time}</div>}
                    <span style={{ fontSize: 11.5, color: ck ? C.inkMute : C.ink, textDecoration: ck ? "line-through" : "none" }}>{e.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* versículo motivacional */}
      {verse && verse.text && verse.text.trim() && (
        <div style={{ background: "rgba(255,255,255,0.025)", border: `0.5px solid rgba(255,255,255,0.08)`, borderRadius: 11, padding: "13px 15px", textAlign: "center" }}>
          <div style={{ fontSize: 12.5, color: C.inkSoft, fontStyle: "italic", lineHeight: 1.5 }}>"{verse.text}"</div>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.inkMute, marginTop: 6 }}>{verse.ref}</div>
        </div>
      )}
    </div>
  );
}

// ============ VISÃO MÊS (grade de calendário) ============
function MonthView({ year, month, setYear, setMonth, events, projects, tasks, marks, onPickDay }) {
  const weeks = monthGrid(year, month);
  const hoje = new Date();
  function prevMonth() { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: `0.5px solid rgba(255,255,255,0.12)`, borderRadius: 12, padding: "9px 12px", marginBottom: 12 }}>
        <button onClick={prevMonth} className="cosmo-icon-btn" aria-label="Mês anterior"><ChevronRight size={16} color={C.inkSoft} style={{ transform: "rotate(180deg)" }} /></button>
        <div style={{ fontSize: 14, color: C.ink, fontWeight: 500 }}>{MES_NOMES[month]} <span style={{ color: C.inkMute, fontWeight: 400 }}>{year}</span></div>
        <button onClick={nextMonth} className="cosmo-icon-btn" aria-label="Próximo mês"><ChevronRight size={16} color={C.inkSoft} /></button>
      </div>
      {/* cabeçalho dos dias da semana */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
        {["seg", "ter", "qua", "qui", "sex", "sáb", "dom"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontFamily: MONO, fontSize: 9, color: C.inkFaint, letterSpacing: "0.05em", padding: "2px 0" }}>{d}</div>
        ))}
      </div>
      {/* grade */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {week.map((date, di) => {
              if (!date) return <div key={di} style={{ aspectRatio: "1", borderRadius: 8 }} />;
              const n = itemsOnDate(date, events, projects, tasks, marks);
              const isToday = isSameDay(date, hoje);
              return (
                <button key={di} onClick={() => onPickDay(date)} style={{
                  aspectRatio: "1", borderRadius: 8, border: isToday ? `1px solid ${C.blueLight}` : `0.5px solid rgba(255,255,255,0.06)`,
                  background: isToday ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer", padding: 0, position: "relative",
                }}>
                  <span style={{ fontSize: 12.5, color: isToday ? C.blueBright : C.inkSoft, fontWeight: isToday ? 600 : 400 }}>{date.getDate()}</span>
                  {n > 0 && (
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: Math.min(n, 3) }).map((_, k) => (
                        <span key={k} style={{ width: 4, height: 4, borderRadius: "50%", background: C.gold }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 8.5, color: C.inkFaint, textAlign: "center", marginTop: 10 }}>toque num dia pra ver a semana dele</div>
    </div>
  );
}

// ============ VISÃO ANO (12 meses em miniatura) ============
function YearView({ year, setYear, events, projects, marks, onPickMonth }) {
  const hoje = new Date();
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: `0.5px solid rgba(255,255,255,0.12)`, borderRadius: 12, padding: "9px 12px", marginBottom: 12 }}>
        <button onClick={() => setYear(year - 1)} className="cosmo-icon-btn" aria-label="Ano anterior"><ChevronRight size={16} color={C.inkSoft} style={{ transform: "rotate(180deg)" }} /></button>
        <div style={{ fontSize: 15, color: C.ink, fontWeight: 500 }}>{year}</div>
        <button onClick={() => setYear(year + 1)} className="cosmo-icon-btn" aria-label="Próximo ano"><ChevronRight size={16} color={C.inkSoft} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {MES_NOMES.map((nome, m) => {
          // conta itens do mês inteiro
          let total = 0;
          const dias = new Date(year, m + 1, 0).getDate();
          for (let d = 1; d <= dias; d++) total += itemsOnDate(new Date(year, m, d), events, projects, [], marks);
          const isCurrent = hoje.getFullYear() === year && hoje.getMonth() === m;
          return (
            <button key={m} onClick={() => onPickMonth(m)} style={{
              borderRadius: 10, border: isCurrent ? `1px solid ${C.blueLight}` : `0.5px solid rgba(255,255,255,0.08)`,
              background: isCurrent ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.025)",
              padding: "14px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 13, color: isCurrent ? C.blueBright : C.ink, fontWeight: 500 }}>{MES_CURTO[m]}</span>
              {total > 0
                ? <span style={{ fontFamily: MONO, fontSize: 9, color: C.gold }}>{total} {total === 1 ? "item" : "itens"}</span>
                : <span style={{ fontFamily: MONO, fontSize: 9, color: C.inkFaint }}>—</span>}
            </button>
          );
        })}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 8.5, color: C.inkFaint, textAlign: "center", marginTop: 12 }}>toque num mês pra abrir</div>
    </div>
  );
}

// ============ TELA: AGENDA ============
function AgendaScreen({ projects, events, persistEvents, marks, persistMarks, todayId, setSubDay, tasks }) {
  const [showNew, setShowNew] = useState(false);
  const [evTitle, setEvTitle] = useState("");
  const [evDay, setEvDay] = useState(todayId);
  const [evTime, setEvTime] = useState("");
  const [evArea, setEvArea] = useState("pessoal");
  const [evRecurring, setEvRecurring] = useState(false);

  const [showNewMark, setShowNewMark] = useState(false);
  const [mkTitle, setMkTitle] = useState("");
  const [mkDate, setMkDate] = useState("");
  const [mkArea, setMkArea] = useState("pessoal");
  const [mkRecurring, setMkRecurring] = useState(true);

  // semana em visualização (navegável). Começa na semana atual.
  const [viewWeek, setViewWeek] = useState(() => thisWeekKey());
  const isThisWeek = viewWeek === thisWeekKey();
  // visão do calendário: "semana" | "mes" | "ano"
  const [calView, setCalView] = useState("semana");
  const _now = new Date();
  const [calYear, setCalYear] = useState(_now.getFullYear());
  const [calMonth, setCalMonth] = useState(_now.getMonth()); // 0-11

  // um evento aparece nesta semana se: é recorrente (toda semana),
  // OU tem week == viewWeek, OU (compatibilidade) não tem week e estamos na semana atual.
  function eventInWeek(e) {
    if (e.recurring) return true;            // recorrente: aparece toda semana
    if (e.week) return e.week === viewWeek;  // carimbado: só na sua semana
    return isThisWeek;                        // legado sem carimbo: cai na semana atual
  }

  // montar por dia: eventos (filtrados pela semana) + subtarefas
  const byDay = {};
  DAY_IDS.forEach((d) => (byDay[d] = { events: [], subs: [] }));
  events.filter(eventInWeek).forEach((e) => { if (byDay[e.day]) byDay[e.day].events.push(e); });
  projects.forEach((p) => {
    (p.subtasks || []).forEach((s) => {
      if (s.day && !s.done && byDay[s.day]) byDay[s.day].subs.push({ ...s, project: p.title, area: p.area });
    });
  });

  const sortedMarks = [...(marks || [])]
    .map((m) => ({ ...m, d: daysUntil(m.date) }))
    .sort((a, b) => {
      const av = a.d == null ? 99999 : a.d < 0 ? 90000 + a.d : a.d;
      const bv = b.d == null ? 99999 : b.d < 0 ? 90000 + b.d : b.d;
      return av - bv;
    });

  function addEvent() {
    if (!evTitle.trim()) return;
    persistEvents([...events, { id: genId(), title: evTitle.trim(), day: evDay, time: evTime, area: validArea(evArea), week: evRecurring ? null : viewWeek, recurring: evRecurring }]);
    setEvTitle(""); setEvTime(""); setEvRecurring(false); setShowNew(false);
  }
  function delEvent(id) { persistEvents(events.filter((e) => e.id !== id)); }
  function addMark() {
    if (!mkTitle.trim() || !mkDate.trim()) return;
    persistMarks([...(marks || []), { id: genId(), title: mkTitle.trim(), date: mkDate.trim(), area: validArea(mkArea), recurring: mkRecurring }]);
    setMkTitle(""); setMkDate(""); setShowNewMark(false);
  }
  function delMark(id) { persistMarks((marks || []).filter((m) => m.id !== id)); }

  return (
    <div className="cosmo-fade">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 2px 14px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Agenda</h1>
        <button onClick={() => setShowNew(!showNew)} className="cosmo-icon-btn" aria-label="Novo compromisso" style={{ background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 8 }}>
          <Plus size={16} color={C.blueBright} />
        </button>
      </div>

      {/* alternador de visão: Semana / Mês / Ano */}
      <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 3, marginBottom: 12 }}>
        {[["semana", "Semana"], ["mes", "Mês"], ["ano", "Ano"]].map(([id, label]) => (
          <button key={id} onClick={() => setCalView(id)} style={{ flex: 1, fontSize: 11.5, fontWeight: 500, color: calView === id ? "#161618" : C.inkMute, background: calView === id ? C.ink : "transparent", border: "none", borderRadius: 16, padding: "7px 0", cursor: "pointer", fontFamily: SANS }}>{label}</button>
        ))}
      </div>

      {calView === "semana" && (<>
      {/* navegação de semanas */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: `0.5px solid rgba(255,255,255,0.12)`, borderRadius: 12, padding: "9px 12px", marginBottom: 12 }}>
        <button onClick={() => setViewWeek(addWeeks(viewWeek, -1))} className="cosmo-icon-btn" aria-label="Semana anterior"><ChevronRight size={16} color={C.inkSoft} style={{ transform: "rotate(180deg)" }} /></button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{weekLabelRelative(viewWeek)}</div>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.inkMute }}>{weekRangeLabel(viewWeek)}{!isThisWeek ? "" : " · hoje"}</div>
        </div>
        <button onClick={() => setViewWeek(addWeeks(viewWeek, 1))} className="cosmo-icon-btn" aria-label="Próxima semana"><ChevronRight size={16} color={C.inkSoft} /></button>
      </div>
      {!isThisWeek && (
        <button onClick={() => setViewWeek(thisWeekKey())} style={{ display: "block", margin: "0 auto 12px", background: "none", border: "none", color: C.blueLight, fontFamily: MONO, fontSize: 9.5, cursor: "pointer", letterSpacing: "0.08em" }}>← voltar pra esta semana</button>
      )}
      </>)}

      {/* VISÃO MÊS */}
      {calView === "mes" && (
        <MonthView year={calYear} month={calMonth}
          setYear={setCalYear} setMonth={setCalMonth}
          events={events} projects={projects} tasks={tasks || []} marks={marks}
          onPickDay={(date) => { setViewWeek(weekKeyOf(date)); setCalView("semana"); }} />
      )}

      {/* VISÃO ANO */}
      {calView === "ano" && (
        <YearView year={calYear} setYear={setCalYear}
          events={events} projects={projects} marks={marks}
          onPickMonth={(m) => { setCalMonth(m); setCalView("mes"); }} />
      )}

      {calView === "semana" && (<>

      <div style={{ background: "rgba(255,255,255,0.04)", border: `0.5px solid rgba(255,255,255,0.12)`, borderRadius: 12, padding: "10px 12px", marginBottom: 14, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <CalendarClock size={15} color={C.blueBright} style={{ marginTop: 1, flexShrink: 0 }} />
        <span style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}>
          Compromissos e subtarefas juntos. A conexão com o Google Agenda entra quando o app for publicado como web app.
        </span>
      </div>

      {showNew && (
        <div className="cosmo-syscard-open" style={{ marginBottom: 14 }}>
          <input value={evTitle} onChange={(e) => setEvTitle(e.target.value)} placeholder="Compromisso (consulta, pregação, aula...)" className="cosmo-input" style={{ width: "100%", marginBottom: 8 }} autoFocus />
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <select value={evDay} onChange={(e) => setEvDay(e.target.value)} className="cosmo-input" style={{ flex: 1 }}>
              {DAYS.map((d) => (<option key={d.id} value={d.id}>{d.label}</option>))}
            </select>
            <input value={evTime} onChange={(e) => setEvTime(e.target.value)} placeholder="14:00" className="cosmo-input" style={{ width: 80 }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {AREA_KEYS.map((a) => (
              <button key={a} onClick={() => setEvArea(a)} className="cosmo-mini-btn" style={{ borderColor: evArea === a ? C.blueLine : C.panelBorder, color: evArea === a ? C.blueBright : C.inkMute }}>{AREA_LABEL[a]}</button>
            ))}
          </div>
          <button onClick={() => setEvRecurring(!evRecurring)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", marginBottom: 10, padding: 0 }}>
            <div style={{ width: 16, height: 16, borderRadius: 5, border: `1.5px solid ${evRecurring ? C.green : C.inkFaint}`, background: evRecurring ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{evRecurring && <Check size={11} color="#0C0C0E" />}</div>
            <span style={{ fontSize: 11.5, color: C.inkSoft }}>Toda semana (repete sempre)</span>
          </button>
          <div style={{ fontFamily: MONO, fontSize: 9, color: C.inkFaint, marginBottom: 8 }}>{evRecurring ? "vai aparecer em todas as semanas" : "só na semana de " + weekRangeLabel(viewWeek)}</div>
          <button onClick={addEvent} className="cosmo-chip cosmo-chip-primary" style={{ width: "100%", justifyContent: "center" }}>Adicionar</button>
        </div>
      )}

      {DAYS.map((d) => {
        const data = byDay[d.id];
        const empty = data.events.length === 0 && data.subs.length === 0;
        const isToday = isThisWeek && d.id === todayId;
        return (
          <div key={d.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: isToday ? C.blueBright : C.inkMute, letterSpacing: "0.1em" }}>{d.label}</span>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: C.inkFaint }}>{dayDateLabel(viewWeek, d.id)}</span>
              {isToday && <span style={{ fontFamily: MONO, fontSize: 8, color: C.blueBright, border: `0.5px solid ${C.blueLine}`, padding: "1px 6px", borderRadius: 8 }}>HOJE</span>}
              <span style={{ flex: 1, height: 0.5, background: "rgba(255,255,255,0.06)" }} />
            </div>
            {empty ? (
              <div style={{ fontSize: 12, color: C.inkFaint, paddingLeft: 2 }}>livre</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {data.events.map((e) => {
                  const IC = AREA_ICONS[e.area] || Star;
                  return (
                    <div key={e.id} className="cosmo-agenda-item" style={{ borderLeft: `2px solid ${C.gold}` }}>
                      {e.time && <span style={{ fontFamily: MONO, fontSize: 10, color: C.gold, minWidth: 38 }}>{e.time}</span>}
                      <IC size={13} color={C.gold} />
                      <span style={{ flex: 1, fontSize: 12.5, color: C.ink }}>{e.title}{e.recurring && <span style={{ fontFamily: MONO, fontSize: 8.5, color: C.inkFaint }}> · toda semana</span>}</span>
                      <button onClick={() => delEvent(e.id)} className="cosmo-icon-btn" aria-label="Excluir"><Trash2 size={12} color={C.inkFaint} /></button>
                    </div>
                  );
                })}
                {data.subs.map((s) => {
                  const IC = AREA_ICONS[s.area] || Star;
                  return (
                    <div key={s.id} className="cosmo-agenda-item" style={{ borderLeft: `2px solid ${C.blueBright}` }}>
                      <span style={{ minWidth: 38, fontFamily: MONO, fontSize: 9, color: C.inkFaint }}>tarefa</span>
                      <IC size={13} color={C.blueLight} />
                      <span style={{ flex: 1, fontSize: 12.5, color: C.ink }}>{s.title}<span style={{ color: C.inkFaint, fontSize: 10 }}> · {s.project}</span></span>
                      {s.priority === "alta" && <Flame size={12} color={C.blueBright} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      </>)}

      {/* DATAS IMPORTANTES */}
      <div style={{ marginTop: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
            <Star size={15} color={C.gold} /> Datas importantes
          </h2>
          <button onClick={() => setShowNewMark(!showNewMark)} className="cosmo-icon-btn" aria-label="Nova data" style={{ background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 7 }}>
            <Plus size={15} color={C.blueBright} />
          </button>
        </div>

        {showNewMark && (
          <div className="cosmo-syscard-open" style={{ marginBottom: 12 }}>
            <input value={mkTitle} onChange={(e) => setMkTitle(e.target.value)} placeholder="Ex: Aniversário da mãe" className="cosmo-input" style={{ width: "100%", marginBottom: 8 }} autoFocus />
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input value={mkDate} onChange={(e) => setMkDate(e.target.value)} placeholder={mkRecurring ? "dd/mm (ex: 19/07)" : "dd/mm/aaaa"} className="cosmo-input" style={{ flex: 1 }} />
              <button onClick={() => setMkRecurring(!mkRecurring)} className="cosmo-mini-btn" style={{ color: mkRecurring ? C.blueBright : C.inkMute, borderColor: mkRecurring ? C.blueLine : C.panelBorder }}>
                {mkRecurring ? "Anual" : "Data única"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {AREA_KEYS.map((a) => (
                <button key={a} onClick={() => setMkArea(a)} className="cosmo-mini-btn" style={{ borderColor: mkArea === a ? C.blueLine : C.panelBorder, color: mkArea === a ? C.blueBright : C.inkMute }}>{AREA_LABEL[a]}</button>
              ))}
            </div>
            <button onClick={addMark} className="cosmo-chip cosmo-chip-primary" style={{ width: "100%", justifyContent: "center" }}>Adicionar data</button>
          </div>
        )}

        {sortedMarks.length === 0 ? (
          <div style={{ fontSize: 12, color: C.inkFaint, paddingLeft: 2 }}>Nenhuma data importante ainda.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sortedMarks.map((m) => {
              const IC = AREA_ICONS[m.area] || Star;
              const urgent = m.d != null && m.d >= 0 && m.d <= 7;
              return (
                <div key={m.id} className="cosmo-agenda-item" style={{ borderLeft: `2px solid ${urgent ? C.blueBright : C.gold}` }}>
                  <IC size={14} color={urgent ? C.blueBright : C.gold} />
                  <span style={{ flex: 1, fontSize: 12.5, color: C.ink }}>{m.title}</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: C.inkMute }}>{m.date}{m.recurring ? "" : ""}</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: urgent ? C.blueBright : C.blueLight, minWidth: 54, textAlign: "right" }}>{countdownLabel(m.date)?.toUpperCase()}</span>
                  <button onClick={() => delMark(m.id)} className="cosmo-icon-btn" aria-label="Excluir"><Trash2 size={12} color={C.inkFaint} /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ TELA: CHAT ============
function ChatScreen({ conversations, persistConversations, projects, tasks, events, marks, ideas, hubLayout, applyOps, memory, pendingChat, clearPendingChat }) {
  const [view, setView] = useState("list");
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [listening, setListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [speechPaused, setSpeechPaused] = useState(false);
  const [voicePref, setVoicePrefState] = useState(() => getVoicePref());
  const [voiceMode, setVoiceModeState] = useState(() => getVoiceMode());
  const [showVoiceCfg, setShowVoiceCfg] = useState(false);
  const [notifOn, setNotifOn] = useState(() => notifLigado());
  const [notifBusy, setNotifBusy] = useState(false);
  async function toggleNotif() {
    if (notifBusy) return;
    if (notifOn) {
      setNotifBusy(true);
      setNotifLigado(false); setNotifOn(false);
      try { await desinscreverPush(); } catch (e) {}
      setNotifBusy(false);
      return;
    }
    const perm = await pedirPermissaoNotif();
    if (perm === "granted") {
      setNotifBusy(true);
      setNotifLigado(true); setNotifOn(true);
      mostrarNotif("JACKBOY", "Pronto, Jackson! Vou te lembrar das coisas e te dar aquele empurrão. 💪");
      // inscreve o aparelho pro push com app fechado (compromissos + tarefas)
      let ok = false;
      try { ok = await inscreverPush(getStorageUser()); } catch (e) {}
      if (!ok) {
        // notificação local (app aberto) segue funcionando; só o push com app fechado falhou
        console.warn("push não inscrito — notificações com app fechado indisponíveis por ora");
      }
      setNotifBusy(false);
    } else if (perm === "denied") {
      alert("As notificações estão bloqueadas. Pra ligar, ative as notificações do JACKBOY nas configurações do navegador/celular.");
    } else if (perm === "unsupported") {
      alert("Seu navegador não suporta notificações. No Android, use o Chrome e adicione o app à tela inicial.");
    }
  }
  const recRef = useRef(null);
  const scrollRef = useRef(null);

  // ---- VOZ: microfone (fala → texto) ----
  function stopMic() {
    try { if (recRef.current) recRef.current.forceStop(); } catch (e) {}
    recRef.current = null;
    setListening(false);
  }
  function toggleMic() {
    if (listening || recRef.current) {
      stopMic();
      return;
    }
    if (!speechSupported()) {
      alert("Seu navegador não suporta reconhecimento de voz. Use o Chrome no PC ou Android para falar com o JACKBOY");
      return;
    }
    const rec = createRecognizer(
      (text) => setInput(text),
      () => { recRef.current = null; setListening(false); },   // onEnd: só dispara quando parou de vez
      () => { stopMic(); }                                       // onError real: solta tudo
    );
    if (!rec) return;
    recRef.current = rec;
    setListening(true);
    try { rec.start(); } catch (e) { stopMic(); }
  }
  // ---- VOZ: ouvir a resposta (texto → áudio), com pausar/retomar ----
  // usa a voz premium da OpenAI quando configurada; senão, cai na voz do navegador
  function toggleSpeak(idx, text) {
    // já está tocando esta mensagem?
    if (speakingIdx === idx) {
      if (speechPaused) { resumeSmart(); setSpeechPaused(false); }   // retoma de onde parou
      else { pauseSmart(); setSpeechPaused(true); }                   // pausa
      return;
    }
    // começa uma nova (para qualquer outra em andamento)
    stopSmart();
    setSpeechPaused(false);
    setSpeakingIdx(idx);
    speakSmart(
      text,
      null,
      () => { setSpeakingIdx(null); setSpeechPaused(false); },
      null
    );
  }
  // parar de vez (botão separado)
  function stopSpeak() {
    stopSmart();
    setSpeakingIdx(null);
    setSpeechPaused(false);
  }

  const active = conversations.find((c) => c.id === activeId) || null;
  const msgs = active ? active.messages : [];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs.length, busy]);

  // ao sair do chat, para qualquer voz em andamento e libera o microfone
  useEffect(() => {
    return () => {
      try { stopSmart(); } catch (e) {}
      try { if (recRef.current) recRef.current.forceStop(); } catch (e) {}
      recRef.current = null;
    };
  }, []);

  // se veio uma mensagem do HUB, abre um chat novo e envia
  useEffect(() => {
    if (pendingChat) {
      setActiveId(null);
      setView("thread");
      send(pendingChat);
      if (clearPendingChat) clearPendingChat();
    }
    // eslint-disable-next-line
  }, [pendingChat]);

  function openConv(id) { setActiveId(id); setView("thread"); }
  function newConv() { setActiveId(null); setView("thread"); }
  function back() { setView("list"); setActiveId(null); setConfirmDel(null); }
  function delConv(id) {
    persistConversations(conversations.filter((c) => c.id !== id));
    setConfirmDel(null);
    if (activeId === id) back();
  }

  async function send(forcedText) {
    // forcedText só vale se for string de verdade (quando vem de clique, chega um evento — ignorar)
    const hasForced = typeof forcedText === "string" && forcedText.trim().length > 0;
    const text = hasForced ? forcedText : input;
    if (!text.trim() || busy) return;
    // ao enviar, desliga o microfone (se estiver gravando) e libera o hardware
    if (recRef.current || listening) { try { stopMic(); } catch (e) {} }
    if (!hasForced) setInput("");
    setBusy(true);

    let cid = activeId;
    let base = conversations;
    if (!cid) {
      const nc = { id: genId(), title: text.slice(0, 40), updatedAt: Date.now(), messages: [] };
      base = [nc, ...conversations];
      cid = nc.id;
      setActiveId(cid);
    }
    const conv = base.find((c) => c.id === cid);
    const withUser = [...conv.messages, { role: "user", content: text }];
    let next = base.map((c) => (c.id === cid ? { ...c, messages: withUser, updatedAt: Date.now() } : c));
    persistConversations(next);

    try {
      const reply = await callCosmo(chatSystem(projects, events, marks, hubLayout, ideas, tasks, memory), withUser.slice(-30).map((m) => ({ role: m.role, content: m.content })));
      let display = reply;
      let opsSummary = [];

      // a IA age no app pelo bloco <OPS>[...]</OPS>
      const opsMatch = reply.match(/<OPS>([\s\S]*?)<\/OPS>/);
      if (opsMatch) {
        display = display.replace(opsMatch[0], "").trim();
        try {
          const ops = parseJSONLoose(opsMatch[1]);
          if (Array.isArray(ops) && ops.length > 0) {
            opsSummary = applyOps(ops) || [];
          }
        } catch (e) {}
      }

      if (!display) display = "Feito, Jackson.";
      // anexa um selo discreto do que foi executado de fato (feedback + prova)
      const stamp = opsSummary.length > 0 ? "\n\n⟢ " + opsSummary.join(" · ") : "";
      const withAssistant = [...withUser, { role: "assistant", content: display + stamp }];
      persistConversations(next.map((c) => (c.id === cid ? { ...c, messages: withAssistant, updatedAt: Date.now() } : c)));
    } catch (e) {
      const withErr = [...withUser, { role: "assistant", content: "Falha momentânea de conexão, Jackson. Tente novamente." }];
      persistConversations(next.map((c) => (c.id === cid ? { ...c, messages: withErr, updatedAt: Date.now() } : c)));
    } finally {
      setBusy(false);
    }
  }

  if (view === "list") {
    return (
      <div className="cosmo-fade">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 2px 14px" }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Conversas</h1>
          <button onClick={newConv} className="cosmo-icon-btn" aria-label="Nova conversa" style={{ background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 8 }}>
            <Plus size={16} color={C.blueBright} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 18px" }}>
          <CosmoMark size={54} pulse={false} />
          <div style={{ fontSize: 12, color: C.inkMute, marginTop: 8, textAlign: "center", maxWidth: 300 }}>
            Fale com o JACKBOY sobre qualquer frente. Ele conhece seus sistemas e pode criar subtarefas direto da conversa.
          </div>
        </div>

        {/* ajustes de voz */}
        <div style={{ marginBottom: 16, border: `0.5px solid ${C.panelBorder}`, borderRadius: 12, overflow: "hidden" }}>
          <button onClick={() => setShowVoiceCfg(!showVoiceCfg)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,0.03)", border: "none", padding: "11px 13px", cursor: "pointer" }}>
            <Volume2 size={15} color={C.blueLight} />
            <span style={{ flex: 1, textAlign: "left", fontSize: 12.5, color: C.ink }}>Voz do JACKBOY</span>
            <span style={{ fontFamily: MONO, fontSize: 9.5, color: C.inkMute }}>{voiceMode === "premium" ? "premium · " + voicePref : "navegador"}</span>
            <ChevronRight size={14} color={C.inkMute} style={{ transform: showVoiceCfg ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {showVoiceCfg && (
            <div style={{ padding: "12px 13px", borderTop: `0.5px solid ${C.panelBorder}` }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.inkFaint, letterSpacing: "0.1em", marginBottom: 7 }}>MODO</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 13 }}>
                <button onClick={() => { setVoiceMode("premium"); setVoiceModeState("premium"); }} className="cosmo-mini-btn" style={{ flex: 1, justifyContent: "center", borderColor: voiceMode === "premium" ? C.blueLine : C.panelBorder, color: voiceMode === "premium" ? C.blueBright : C.inkMute }}>Premium (OpenAI)</button>
                <button onClick={() => { setVoiceMode("navegador"); setVoiceModeState("navegador"); }} className="cosmo-mini-btn" style={{ flex: 1, justifyContent: "center", borderColor: voiceMode === "navegador" ? C.blueLine : C.panelBorder, color: voiceMode === "navegador" ? C.blueBright : C.inkMute }}>Navegador (grátis)</button>
              </div>
              {voiceMode === "premium" && (
                <>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: C.inkFaint, letterSpacing: "0.1em", marginBottom: 7 }}>VOZ</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {["alloy", "echo", "fable", "onyx", "nova", "shimmer", "marin", "cedar"].map((v) => (
                      <button key={v} onClick={() => { setVoicePref(v); setVoicePrefState(v); }} className="cosmo-mini-btn" style={{ borderColor: voicePref === v ? C.blueLine : C.panelBorder, color: voicePref === v ? C.blueBright : C.inkMute }}>{v}</button>
                    ))}
                  </div>
                  <div style={{ fontSize: 10.5, color: C.inkFaint, lineHeight: 1.5 }}>
                    A voz premium precisa da chave da OpenAI configurada. Se não estiver, cai automaticamente na voz do navegador.
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ajustes de notificações */}
        <div style={{ marginBottom: 16, border: `0.5px solid ${C.panelBorder}`, borderRadius: 12, overflow: "hidden" }}>
          <button onClick={toggleNotif} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,0.03)", border: "none", padding: "11px 13px", cursor: "pointer" }}>
            <Sparkles size={15} color={notifOn ? C.green : C.blueLight} />
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 12.5, color: C.ink }}>Lembretes e empurrões</div>
              <div style={{ fontSize: 10, color: C.inkMute }}>{notifOn ? "ligado — empurrão do dia, compromissos e tarefas" : "receba o empurrão do dia, compromissos e tarefas"}</div>
            </div>
            <div style={{ width: 40, height: 22, borderRadius: 20, background: notifOn ? C.green : "rgba(255,255,255,0.1)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 2, left: notifOn ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </div>
          </button>
        </div>
        {conversations.length === 0 ? (
          <div style={{ textAlign: "center", color: C.inkFaint, fontSize: 12, padding: "10px 0" }}>Nenhuma conversa ainda.</div>
        ) : (
          [...conversations].sort((a, b) => b.updatedAt - a.updatedAt).map((c) => {
            const last = c.messages[c.messages.length - 1];
            return (
              <div key={c.id} className="cosmo-conv-row">
                <button onClick={() => openConv(c.id)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title || "Conversa"}</div>
                  {last && <div style={{ fontSize: 11, color: C.inkMute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{last.role === "user" ? "Você: " : "JACKBOY: "}{last.content}</div>}
                </button>
                {confirmDel === c.id ? (
                  <button onClick={() => delConv(c.id)} className="cosmo-mini-btn" style={{ color: C.danger, borderColor: "rgba(248,113,113,0.3)" }}>Excluir?</button>
                ) : (
                  <button onClick={() => setConfirmDel(c.id)} className="cosmo-icon-btn" aria-label="Excluir conversa"><Trash2 size={14} color={C.inkFaint} /></button>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div className="cosmo-fade" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 150px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 2px 12px", borderBottom: `0.5px solid ${C.panelBorder}` }}>
        <button onClick={back} className="cosmo-icon-btn" aria-label="Voltar"><ArrowLeft size={18} color={C.inkMute} /></button>
        <CosmoMark size={30} pulse={false} />
        <span style={{ fontSize: 14, fontWeight: 500, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{active ? active.title : "Nova conversa"}</span>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 2px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.length === 0 && (
          <div style={{ fontSize: 13, color: C.inkMute, textAlign: "center", padding: "20px 10px" }}>
            Diga ao JACKBOY o que está pesando, ou peça para ele organizar uma frente.
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%", borderRadius: 14, padding: "9px 12px", fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "anywhere",
              background: m.role === "user" ? C.ink : "rgba(255,255,255,0.05)",
              color: m.role === "user" ? "#161618" : C.ink,
              border: m.role === "user" ? "none" : `0.5px solid ${C.panelBorder}`,
            }}>{m.content}</div>
            {m.role === "assistant" && m.content && m.content.trim() && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <button onClick={() => toggleSpeak(i, m.content)} className="cosmo-icon-btn" aria-label={speakingIdx === i ? (speechPaused ? "Retomar áudio" : "Pausar áudio") : "Ouvir resposta"} style={{ display: "flex", alignItems: "center", gap: 4, color: speakingIdx === i ? C.blueBright : C.inkFaint, fontSize: 10.5, fontFamily: MONO, padding: "2px 4px" }}>
                  {speakingIdx === i
                    ? (speechPaused ? <><Volume2 size={13} /> retomar</> : <><Pause size={13} /> pausar</>)
                    : <><Volume2 size={13} /> ouvir</>}
                </button>
                {speakingIdx === i && (
                  <button onClick={stopSpeak} className="cosmo-icon-btn" aria-label="Parar áudio" style={{ display: "flex", alignItems: "center", gap: 4, color: C.inkFaint, fontSize: 10.5, fontFamily: MONO, padding: "2px 4px" }}>
                    <Square size={12} /> parar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ borderRadius: 14, padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: `0.5px solid ${C.panelBorder}` }}><Spinner size={15} /></div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "10px 2px", borderTop: `0.5px solid ${C.panelBorder}` }}>
        <button onClick={toggleMic} className="cosmo-icon-btn" aria-label={listening ? "Parar de ouvir" : "Falar"} style={{ background: listening ? C.danger : "rgba(255,255,255,0.06)", borderRadius: 20, padding: 9, flexShrink: 0, transition: "background 0.2s" }} title={listening ? "Ouvindo... toque para parar" : "Falar com o JACKBOY"}>
          {listening ? <Square size={15} color="#fff" /> : <Mic size={16} color={C.inkSoft} />}
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; }}
          placeholder={listening ? "Ouvindo você falar..." : "Falar com o JACKBOY... (Shift+Enter pula linha)"}
          rows={1}
          className="cosmo-input"
          style={{ flex: 1, resize: "none", minHeight: 40, maxHeight: 140, lineHeight: 1.45, overflowY: "auto", fontFamily: SANS, borderColor: listening ? C.danger : undefined }}
        />
        <button onClick={() => send()} disabled={busy || !input.trim()} className="cosmo-icon-btn" aria-label="Enviar" style={{ background: C.blue, borderRadius: 20, padding: 9, opacity: busy || !input.trim() ? 0.5 : 1, flexShrink: 0 }}>
          <Send size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}

// ============ TELA: IDEIAS ============
// ============ TELA: PROJETOS ============
function ProjectsScreen({ projects, openProjectId, setOpenProjectId, breakdownProject, breakingId, toggleSub, setSubDay, addSub, deleteSub, deleteProject, completeProject, addProject, organizeWeek, organizing }) {
  const [showNewProject, setShowNewProject] = useState(false);
  const [npTitle, setNpTitle] = useState("");
  const [npArea, setNpArea] = useState("pessoal");
  const [npDeadline, setNpDeadline] = useState("");
  const [newSubText, setNewSubText] = useState("");

  return (
    <div className="cosmo-fade">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>Projetos</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.inkMute, marginTop: 2 }}>{projects.length} empreitada(s) em andamento</div>
        </div>
        <Orbit size={22} color={C.blueLight} style={{ opacity: 0.7 }} />
      </div>

      {projects.length === 0 && (
        <div style={{ textAlign: "center", color: C.inkMute, fontSize: 13, padding: "24px 0" }}>
          Nenhum projeto ainda. Toque em “Novo projeto” para começar — ou peça ao JACKBOY no chat.
        </div>
      )}

      {projects.map((p) => {
        const isOpen = openProjectId === p.id;
        const Icon = AREA_ICONS[p.area] || Star;
        const pct = projectProgress(p);
        const subsPending = (p.subtasks || []).filter((s) => !s.done);

        if (!isOpen) {
          return (
            <button key={p.id} onClick={() => setOpenProjectId(p.id)} className="cosmo-syscard" style={{ width: "100%", textAlign: "left", marginBottom: 9 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ position: "relative", width: 34, height: 34, flexShrink: 0 }}>
                  <Ring pct={pct} size={34} />
                  <Icon size={15} color={C.blueLight} style={{ position: "absolute", top: 9.5, left: 9.5 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: C.ink }}>{p.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: C.inkMute, marginTop: 2 }}>
                    {AREA_LABEL[p.area]} · {pct}%{p.deadline ? " · " + p.deadline : ""}{subsPending.length ? " · " + subsPending.length + " pendente(s)" : ""}
                  </div>
                </div>
                <ChevronRight size={16} color={C.inkFaint} />
              </div>
            </button>
          );
        }

        return (
          <div key={p.id} className="cosmo-syscard-open" style={{ marginBottom: 9 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Icon size={18} color={C.blueBright} />
                <span style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{p.title}</span>
              </div>
              <button onClick={() => setOpenProjectId(null)} className="cosmo-icon-btn" aria-label="Fechar"><X size={16} color={C.inkMute} /></button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ width: pct + "%", height: "100%", background: `linear-gradient(90deg,${C.blueDeep},${C.blueBright})`, transition: "width 0.4s" }} />
              </div>
              <span style={{ fontFamily: MONO, fontSize: 10, color: C.inkMute }}>{pct}%{p.deadline ? " · " + p.deadline : ""}</span>
            </div>

            {(p.subtasks || []).map((s) => (
              <div key={s.id} className="cosmo-sub" style={{ borderLeft: `2px solid ${s.done ? C.blueDeep : C.blueBright}` }}>
                <button onClick={() => toggleSub(p.id, s.id)} className="cosmo-icon-btn" aria-label="Concluir">
                  {s.done ? <CheckCircle size={15} color={C.green} /> : <Circle size={15} color={C.blueBright} />}
                </button>
                <span style={{ flex: 1, fontSize: 12, color: s.done ? C.inkMute : C.ink, textDecoration: s.done ? "line-through" : "none" }}>{s.title}</span>
                {!s.done && (
                  <select value={s.day || ""} onChange={(e) => setSubDay(p.id, s.id, e.target.value || null)} className="cosmo-day-select" aria-label="Dia">
                    <option value="">—</option>
                    {DAYS.map((d) => (<option key={d.id} value={d.id}>{d.label}</option>))}
                  </select>
                )}
                {s.done && <span style={{ fontSize: 9, color: C.inkFaint, fontFamily: MONO }}>FEITO</span>}
                <button onClick={() => deleteSub(p.id, s.id)} className="cosmo-icon-btn" aria-label="Excluir subtarefa"><Trash2 size={13} color={C.inkFaint} /></button>
              </div>
            ))}

            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <input value={newSubText} onChange={(e) => setNewSubText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { addSub(p.id, newSubText); setNewSubText(""); } }} placeholder="Nova subtarefa..." className="cosmo-input" style={{ flex: 1 }} />
              <button onClick={() => { addSub(p.id, newSubText); setNewSubText(""); }} className="cosmo-icon-btn" aria-label="Adicionar subtarefa"><Plus size={16} color={C.blueBright} /></button>
            </div>

            <button onClick={() => breakdownProject(p.id)} disabled={breakingId === p.id} className="cosmo-chip cosmo-chip-primary" style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>
              {breakingId === p.id ? <Spinner size={13} /> : <Sparkles size={13} />}
              {breakingId === p.id ? "JACKBOY quebrando em passos..." : "JACKBOY, quebre em subtarefas"}
            </button>

            <div style={{ display: "flex", gap: 6, marginTop: 12, borderTop: `0.5px solid ${C.panelBorder}`, paddingTop: 10 }}>
              <button onClick={() => completeProject(p.id)} className="cosmo-mini-btn" style={{ color: C.green, borderColor: "rgba(52,211,153,0.35)" }}><Trophy size={12} /> Concluir projeto</button>
              <button onClick={() => deleteProject(p.id)} className="cosmo-mini-btn" style={{ color: C.danger, borderColor: "rgba(248,113,113,0.3)" }}><Trash2 size={12} /> Excluir</button>
            </div>
          </div>
        );
      })}

      {!showNewProject ? (
        <button onClick={() => setShowNewProject(true)} className="cosmo-add-project"><Plus size={15} /> Novo projeto</button>
      ) : (
        <div className="cosmo-syscard-open" style={{ marginTop: 4 }}>
          <input value={npTitle} onChange={(e) => setNpTitle(e.target.value)} placeholder="Nome do projeto" className="cosmo-input" style={{ width: "100%", marginBottom: 8 }} autoFocus />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {AREA_KEYS.map((a) => (
              <button key={a} onClick={() => setNpArea(a)} className="cosmo-mini-btn" style={{ borderColor: npArea === a ? C.blueLine : C.panelBorder, color: npArea === a ? C.blueBright : C.inkMute }}>{AREA_LABEL[a]}</button>
            ))}
          </div>
          <input value={npDeadline} onChange={(e) => setNpDeadline(e.target.value)} placeholder="Prazo (opcional, ex: 05/09/2026)" className="cosmo-input" style={{ width: "100%", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => { const id = addProject(npTitle, npArea, npDeadline); if (id) { setNpTitle(""); setNpDeadline(""); setNpArea("pessoal"); setShowNewProject(false); setOpenProjectId(id); } }} className="cosmo-chip cosmo-chip-primary" style={{ flex: 1, justifyContent: "center" }}>Criar projeto</button>
            <button onClick={() => setShowNewProject(false)} className="cosmo-mini-btn">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ TELA: TAREFAS (avulsas + rituais diários) ============
function TasksScreen({ tasks, mergedTasks, addTask, toggleTask, toggleAnyTask, deleteTask, deleteAnyTask, setTaskDay, setAnyTaskDay, habitLog, toggleHabit, todayId }) {
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDay, setNewTaskDay] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [viewWeek, setViewWeek] = useState(() => thisWeekKey());
  const isThisWeek = viewWeek === thisWeekKey();
  const k = todayKey();
  const todayLog = habitLog[k] || {};
  // lista unificada: avulsas + subtarefas de projetos
  const allTasks = mergedTasks || (tasks || []).map((t) => ({ ...t, _kind: "avulsa" }));
  const pending = allTasks.filter((t) => !t.done);
  const doneToday = allTasks.filter((t) => t.done);

  // uma tarefa COM dia pertence a uma semana; sem dia é "flutuante" (sempre aparece)
  function taskInWeek(t) {
    if (!t.day) return true; // sem dia: sempre
    if (t.week) return t.week === viewWeek;
    return isThisWeek; // tarefas antigas com dia mas sem carimbo caem na semana atual
  }
  const weekPending = pending.filter(taskInWeek);

  // agrupa tarefas pendentes por dia (na ordem dos dias, e "sem dia" no fim)
  const groups = [];
  DAYS.forEach((d) => {
    const items = weekPending.filter((t) => t.day === d.id);
    if (items.length) groups.push({ id: d.id, label: d.label, items, isToday: isThisWeek && d.id === todayId });
  });
  const semDia = weekPending.filter((t) => !t.day || !DAY_IDS.includes(t.day));
  if (semDia.length) groups.push({ id: null, label: "SEM DIA", items: semDia, isToday: false });

  function TaskRow({ t }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,0.03)", border: `0.5px solid ${C.panelBorder}`, borderRadius: 11, padding: "10px 12px" }}>
        <button onClick={() => toggleAnyTask(t)} className="cosmo-icon-btn" aria-label="Concluir"><Circle size={16} color={C.inkFaint} /></button>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: AREA_COLOR[t.area] || C.inkMute, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12.5, color: C.ink }}>{t.title}{t.time ? <span style={{ fontFamily: MONO, fontSize: 10, color: C.gold }}> · {t.time}</span> : null}{t._kind === "sub" ? <span style={{ fontSize: 10, color: C.inkMute }}> · {t._projectTitle}</span> : null}</span>
        <select value={t.day || ""} onChange={(e) => setAnyTaskDay(t, e.target.value || null, e.target.value ? viewWeek : null)} className="cosmo-day-select" aria-label="Dia da tarefa">
          <option value="">sem dia</option>
          {DAYS.map((d) => (<option key={d.id} value={d.id}>{d.label}</option>))}
        </select>
        <button onClick={() => deleteAnyTask(t)} className="cosmo-icon-btn" aria-label="Excluir"><Trash2 size={12} color={C.inkFaint} /></button>
      </div>
    );
  }

  return (
    <div className="cosmo-fade">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>Tarefas</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.inkMute, marginTop: 2 }}>rituais diários + tarefas por dia</div>
        </div>
        <ListTodo size={22} color={C.blueLight} style={{ opacity: 0.7 }} />
      </div>

      {/* Rituais diários */}
      <SectionLabel>RITUAIS DE HOJE</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 22 }}>
        {HABIT_DEFS.map((h) => {
          const IC = HABIT_ICONS[h.id] || Circle;
          const on = !!todayLog[h.id];
          return (
            <button key={h.id} onClick={() => toggleHabit(h.id)} style={{ display: "flex", alignItems: "center", gap: 11, background: on ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)", border: `0.5px solid ${on ? C.blueLine : C.panelBorder}`, borderRadius: 11, padding: "11px 13px", cursor: "pointer", textAlign: "left", transition: "background 0.2s" }}>
              {on ? <CheckCircle size={18} color={C.green} /> : <Circle size={18} color={C.inkFaint} />}
              <IC size={15} color={on ? C.blueLight : C.inkMute} />
              <span style={{ flex: 1, fontSize: 13, color: on ? C.ink : C.inkSoft }}>{h.label}</span>
              {on && <span style={{ fontFamily: MONO, fontSize: 8.5, color: C.blueLight }}>FEITO</span>}
            </button>
          );
        })}
      </div>

      {/* Tarefas por dia — com navegação de semanas */}
      <SectionLabel>TAREFAS DA SEMANA</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: `0.5px solid rgba(255,255,255,0.12)`, borderRadius: 12, padding: "9px 12px", marginBottom: 12 }}>
        <button onClick={() => setViewWeek(addWeeks(viewWeek, -1))} className="cosmo-icon-btn" aria-label="Semana anterior"><ChevronRight size={16} color={C.inkSoft} style={{ transform: "rotate(180deg)" }} /></button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{weekLabelRelative(viewWeek)}</div>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.inkMute }}>{weekRangeLabel(viewWeek)}</div>
        </div>
        <button onClick={() => setViewWeek(addWeeks(viewWeek, 1))} className="cosmo-icon-btn" aria-label="Próxima semana"><ChevronRight size={16} color={C.inkSoft} /></button>
      </div>
      {!isThisWeek && (
        <button onClick={() => setViewWeek(thisWeekKey())} style={{ display: "block", margin: "0 auto 12px", background: "none", border: "none", color: C.blueLight, fontFamily: MONO, fontSize: 9.5, cursor: "pointer", letterSpacing: "0.08em" }}>← voltar pra esta semana</button>
      )}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="cosmo-input" style={{ flex: "1 1 100%", minWidth: 0 }} placeholder="Nova tarefa..." value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newTaskText.trim()) { addTask(newTaskText, "pessoal", newTaskDay || null, newTaskDay ? viewWeek : null, newTaskTime || null); setNewTaskText(""); setNewTaskDay(""); setNewTaskTime(""); } }} />
        <select value={newTaskDay} onChange={(e) => setNewTaskDay(e.target.value)} className="cosmo-day-select" aria-label="Dia" style={{ flex: 1 }}>
          <option value="">sem dia</option>
          {DAYS.map((d) => (<option key={d.id} value={d.id}>{d.label}</option>))}
        </select>
        <input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} className="cosmo-day-select" aria-label="Horário" title="Horário (opcional)" style={{ width: 92 }} />
        <button onClick={() => { if (newTaskText.trim()) { addTask(newTaskText, "pessoal", newTaskDay || null, newTaskDay ? viewWeek : null, newTaskTime || null); setNewTaskText(""); setNewTaskDay(""); setNewTaskTime(""); } }} className="cosmo-mini-btn" style={{ color: C.blueBright, borderColor: C.blueLine }}><Plus size={12} /> Add</button>
      </div>

      {pending.length === 0 && (
        <div style={{ fontSize: 12.5, color: C.inkFaint, padding: "8px 0" }}>Nenhuma tarefa pendente. 🎯</div>
      )}

      {groups.map((g) => (
        <div key={g.id || "semdia"} style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: g.isToday ? C.blueBright : C.inkFaint, letterSpacing: "0.15em", marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}>
            {g.label}{g.id ? <span style={{ color: C.inkFaint }}>{dayDateLabel(viewWeek, g.id)}</span> : null}{g.isToday ? <span style={{ fontSize: 8, color: C.blueBright }}>• HOJE</span> : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {g.items.map((t) => <TaskRow key={t._kind + t.id} t={t} />)}
          </div>
        </div>
      ))}

      {doneToday.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <SectionLabel>CONCLUÍDAS</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {doneToday.map((t) => (
              <div key={t._kind + t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", opacity: 0.55 }}>
                <button onClick={() => toggleAnyTask(t)} className="cosmo-icon-btn"><CheckCircle size={15} color={C.green} /></button>
                <span style={{ flex: 1, fontSize: 12, color: C.inkMute, textDecoration: "line-through" }}>{t.title}{t._kind === "sub" ? <span style={{ fontSize: 10, color: C.inkFaint }}> · {t._projectTitle}</span> : null}</span>
                <button onClick={() => deleteAnyTask(t)} className="cosmo-icon-btn"><Trash2 size={12} color={C.inkFaint} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IdeasScreen({ ideas, persistIdeas, addProject, setTab, setOpenProjectId }) {
  const [text, setText] = useState("");
  function add() {
    if (!text.trim()) return;
    persistIdeas([{ id: genId(), title: text.trim(), createdAt: Date.now() }, ...ideas]);
    setText("");
  }
  function del(id) { persistIdeas(ideas.filter((i) => i.id !== id)); }
  function promote(idea) {
    const id = addProject(idea.title, "pessoal", null);
    persistIdeas(ideas.filter((i) => i.id !== idea.id));
    if (id) { setOpenProjectId(id); setTab("hub"); }
  }
  return (
    <div className="cosmo-fade">
      <div style={{ padding: "8px 2px 14px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Caixa de ideias</h1>
        <p style={{ fontSize: 12, color: C.inkMute, margin: "4px 0 0" }}>Sementes soltas. Quando uma virar compromisso, promova a um sistema.</p>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="Anotar uma ideia..." className="cosmo-input" style={{ flex: 1 }} />
        <button onClick={add} className="cosmo-icon-btn" aria-label="Adicionar ideia" style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 9 }}><Plus size={16} color={C.blueBright} /></button>
      </div>
      {ideas.length === 0 ? (
        <div style={{ textAlign: "center", color: C.inkFaint, fontSize: 12, padding: "20px 0" }}>Nenhuma ideia ainda.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ideas.map((i) => (
            <div key={i.id} className="cosmo-idea">
              <Lightbulb size={15} color={C.gold} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: C.ink }}>{i.title}</span>
              <button onClick={() => promote(i)} className="cosmo-mini-btn" style={{ color: C.blueBright, borderColor: C.blueLine }}><Rocket size={11} /> Virar sistema</button>
              <button onClick={() => del(i.id)} className="cosmo-icon-btn" aria-label="Excluir"><Trash2 size={13} color={C.inkFaint} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ TELA: FEITOS (conquistas + diário) ============
function FeitosScreen({ achievements, persistAchievements, diary, persistDiary, projects }) {
  const [sub, setSub] = useState("conquistas");
  const [newAchv, setNewAchv] = useState("");
  const [diaryText, setDiaryText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  function addAchv() {
    if (!newAchv.trim()) return;
    persistAchievements([{ id: genId(), title: newAchv.trim(), createdAt: Date.now() }, ...achievements]);
    setNewAchv("");
  }
  function delAchv(id) { persistAchievements(achievements.filter((a) => a.id !== id)); }

  function addDiary() {
    if (!diaryText.trim()) return;
    const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    persistDiary([...diary, { id: genId(), date, text: diaryText.trim(), ts: Date.now() }]);
    setDiaryText("");
  }
  function delDiary(id) { persistDiary(diary.filter((d) => d.id !== id)); }

  async function analyze() {
    if (analyzing || diary.length === 0) return;
    setAnalyzing(true);
    try {
      const text = await callCosmo(diarySystem(diary, projects), [{ role: "user", content: "Analise meu uso do tempo." }], 500);
      setAnalysis(text);
    } catch (e) {
      setAnalysis("Não consegui concluir a análise agora, Jackson. Tente novamente em instantes.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="cosmo-fade">
      <div style={{ padding: "8px 2px 12px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>O quanto você já caminhou</h1>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button onClick={() => setSub("conquistas")} className="cosmo-seg" style={{ background: sub === "conquistas" ? "rgba(255,255,255,0.07)" : "transparent", color: sub === "conquistas" ? C.blueBright : C.inkMute }}><Trophy size={13} /> Conquistas</button>
        <button onClick={() => setSub("diario")} className="cosmo-seg" style={{ background: sub === "diario" ? "rgba(255,255,255,0.07)" : "transparent", color: sub === "diario" ? C.blueBright : C.inkMute }}><BookOpen size={13} /> Diário</button>
      </div>

      {sub === "conquistas" ? (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
            <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 500, color: C.blueBright }}>{achievements.length}</span>
            <span style={{ fontSize: 12, color: C.inkMute }}>conquistas registradas em 2026</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            <input value={newAchv} onChange={(e) => setNewAchv(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addAchv(); }} placeholder="Registrar uma vitória..." className="cosmo-input" style={{ flex: 1 }} />
            <button onClick={addAchv} className="cosmo-icon-btn" aria-label="Registrar" style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 9 }}><Plus size={16} color={C.blueBright} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {achievements.map((a) => (
              <div key={a.id} className="cosmo-achv">
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check size={13} color={C.blueBright} />
                </div>
                <span style={{ flex: 1, fontSize: 13, color: C.ink }}>{a.title}</span>
                <button onClick={() => delAchv(a.id)} className="cosmo-icon-btn" aria-label="Excluir"><Trash2 size={12} color={C.inkFaint} /></button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="cosmo-syscard-open" style={{ marginBottom: 14 }}>
            <textarea value={diaryText} onChange={(e) => setDiaryText(e.target.value)} placeholder="O que você fez hoje? Escreva livre — o JACKBOY analisa seu uso do tempo." className="cosmo-input" style={{ width: "100%", minHeight: 70, resize: "none", marginBottom: 8 }} />
            <button onClick={addDiary} className="cosmo-chip cosmo-chip-primary" style={{ width: "100%", justifyContent: "center" }}><Pencil size={13} /> Registrar no diário</button>
          </div>

          <button onClick={analyze} disabled={analyzing || diary.length === 0} className="cosmo-chip" style={{ width: "100%", justifyContent: "center", marginBottom: 12, opacity: diary.length === 0 ? 0.5 : 1 }}>
            {analyzing ? <Spinner size={13} /> : <Sparkles size={13} />} JACKBOY, analise meu tempo
          </button>

          {analysis && (
            <div style={{ background: "linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))", border: `0.5px solid ${C.blueLine}`, borderRadius: 13, padding: 13, marginBottom: 14, display: "flex", gap: 9 }}>
              <CosmoMark size={26} pulse={false} />
              <span style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>{analysis}</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[...diary].reverse().map((d) => (
              <div key={d.id} className="jackboy-diary-row">
                <span style={{ fontFamily: MONO, fontSize: 10, color: C.blueLight, minWidth: 38 }}>{d.date}</span>
                <span style={{ flex: 1, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.45 }}>{d.text}</span>
                <button onClick={() => delDiary(d.id)} className="cosmo-icon-btn" aria-label="Excluir"><Trash2 size={12} color={C.inkFaint} /></button>
              </div>
            ))}
            {diary.length === 0 && <div style={{ textAlign: "center", color: C.inkFaint, fontSize: 12, padding: "16px 0" }}>Nenhum registro ainda.</div>}
          </div>
        </>
      )}
    </div>
  );
}

// ============ CSS ============
const cosmoCss = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');
* { box-sizing: border-box; }
.cosmo-spin { animation: cosmoSpin 0.8s linear infinite; }
@keyframes cosmoSpin { to { transform: rotate(360deg); } }
@keyframes cosmoPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.9; transform: scale(0.96); } }

/* halo do logo respirando — mais visível */
@keyframes cosmoHalo { 0%,100% { opacity: 0.45; transform: scale(0.92); } 50% { opacity: 1; transform: scale(1.15); } }
/* satélite pulsando e brilhando */
@keyframes cosmoSat { 0%,100% { opacity: 0.85; transform: scale(1); } 50% { opacity: 1; transform: scale(1.4); } }
/* corrente elétrica percorrendo o arco do C — mais brilhante e perceptível */
.cosmo-current { stroke-dasharray: 22 145; stroke-dashoffset: 167; opacity: 1; animation: cosmoCurrent 1.9s linear infinite; filter: drop-shadow(0 0 5px #F0DFB8) drop-shadow(0 0 2px #FFFFFF); }
@keyframes cosmoCurrent { from { stroke-dashoffset: 167; } to { stroke-dashoffset: 0; } }

/* corrente elétrica percorrendo o hexágono do logo J */
.jackboy-current { stroke-dasharray: 30 200; stroke-dashoffset: 230; animation: jbCurrent 2.4s linear infinite; filter: drop-shadow(0 0 4px #F7D65A); }
@keyframes jbCurrent { from { stroke-dashoffset: 230; } to { stroke-dashoffset: 0; } }

/* engrenagens girando no fundo */
.jb-gear-cw { animation: jbGearCW 22s linear infinite; }
.jb-gear-ccw { animation: jbGearCCW 28s linear infinite; }
@keyframes jbGearCW { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes jbGearCCW { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }

/* raios cortando a tela — traço que corre e pisca */
.jb-bolt { stroke-dasharray: 40 260; opacity: 0; filter: drop-shadow(0 0 3px currentColor); }
.jb-bolt-1 { animation: jbBolt 4.5s ease-in-out infinite; }
.jb-bolt-2 { animation: jbBolt 5.5s ease-in-out infinite 1.6s; }
.jb-bolt-3 { animation: jbBolt 6s ease-in-out infinite 3s; }
@keyframes jbBolt {
  0% { stroke-dashoffset: 300; opacity: 0; }
  8% { opacity: 0.9; }
  22% { stroke-dashoffset: 0; opacity: 0.7; }
  30% { opacity: 0; }
  100% { opacity: 0; stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .jb-gear-cw, .jb-gear-ccw, .jb-bolt, .jackboy-current, .cosmo-current { animation: none; }
}

/* transição ao trocar de aba: entra deslizando e clareando */
.cosmo-fade { animation: cosmoFade 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes cosmoFade { from { opacity: 0; transform: translateY(12px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }

/* brilho ao tocar/abrir um card — mais presente */
@keyframes cosmoTap { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.24); } 100% { box-shadow: 0 0 0 14px rgba(255,255,255,0); } }
.cosmo-tap { animation: cosmoTap 0.55s ease-out; }

.cosmo-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-family: ${SANS}; color: ${C.inkSoft}; background: transparent; border: 0.5px solid rgba(255,255,255,0.12); padding: 9px 15px; border-radius: 9px; cursor: pointer; transition: transform 0.12s ease, border-color 0.2s, background 0.2s, color 0.2s; }
.cosmo-chip:hover { border-color: rgba(255,255,255,0.24); color: ${C.ink}; }
.cosmo-chip:active { transform: scale(0.97); }
.cosmo-chip-primary { color: #0A2B45; background: ${C.blue}; border-color: ${C.blue}; font-weight: 500; }
.cosmo-chip-primary:hover { background: ${C.blueLight}; color: #0A2B45; }
.cosmo-chip:disabled { opacity: 0.5; cursor: default; }
.cosmo-syscard { background: rgba(255,255,255,0.025); border: 0.5px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 13px; cursor: pointer; transition: border-color 0.2s, transform 0.12s ease, background 0.2s; }
.cosmo-syscard:hover { border-color: rgba(255,255,255,0.16); background: rgba(255,255,255,0.04); }
.cosmo-syscard:active { transform: scale(0.995); }
.cosmo-syscard-open { background: rgba(255,255,255,0.035); border: 0.5px solid rgba(255,255,255,0.14); border-radius: 13px; padding: 14px; }
.cosmo-sub { display: flex; align-items: center; gap: 9px; padding: 7px 9px; background: rgba(255,255,255,0.03); border-radius: 9px; margin-bottom: 5px; }
.cosmo-icon-btn { background: none; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 2px; }
.cosmo-input { background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.12); border-radius: 9px; padding: 9px 11px; font-size: 12.5px; font-family: ${SANS}; color: ${C.ink}; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.cosmo-input:focus { border-color: rgba(255,255,255,0.24); box-shadow: 0 0 0 3px rgba(255,255,255,0.05); }
.cosmo-input::placeholder { color: ${C.inkFaint}; }
.cosmo-day-select { background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.16); border-radius: 7px; padding: 3px 5px; font-size: 9px; font-family: ${MONO}; color: ${C.blueLight}; outline: none; cursor: pointer; }
.cosmo-mini-btn { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-family: ${SANS}; color: ${C.inkMute}; background: rgba(255,255,255,0.03); border: 0.5px solid ${C.panelBorder}; padding: 6px 10px; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: transform 0.15s ease, border-color 0.2s; }
.cosmo-mini-btn:active { transform: scale(0.95); }
.cosmo-add-project { display: flex; align-items: center; justify-content: center; gap: 7px; width: 100%; padding: 11px; margin-top: 4px; background: transparent; border: 0.5px dashed rgba(255,255,255,0.18); border-radius: 12px; color: ${C.blueLight}; font-size: 12px; font-family: ${SANS}; cursor: pointer; transition: background 0.2s, border-color 0.2s; }
.cosmo-add-project:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.24); }
.cosmo-achv-strip { display: flex; align-items: center; justify-content: space-between; width: 100%; background: rgba(255,255,255,0.04); border: none; border-left: 2px solid ${C.blueBright}; border-radius: 0 10px 10px 0; padding: 11px 12px; margin-top: 16px; cursor: pointer; transition: background 0.2s; }
.cosmo-achv-strip:hover { background: rgba(255,255,255,0.06); }
.cosmo-agenda-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: rgba(255,255,255,0.03); border-radius: 8px; }
.cosmo-conv-row { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); border: 0.5px solid ${C.panelBorder}; border-radius: 12px; padding: 11px 12px; margin-bottom: 8px; }
.cosmo-idea { display: flex; align-items: center; gap: 9px; background: rgba(255,255,255,0.03); border: 0.5px solid ${C.panelBorder}; border-radius: 11px; padding: 10px 12px; }
.cosmo-seg { display: inline-flex; align-items: center; gap: 6px; flex: 1; justify-content: center; padding: 8px; border-radius: 10px; border: 0.5px solid ${C.panelBorder}; font-size: 12px; font-family: ${SANS}; cursor: pointer; }
.cosmo-achv { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.07); border-radius: 11px; padding: 9px 11px; }
.cosmo-diary-row { display: flex; align-items: flex-start; gap: 9px; background: rgba(255,255,255,0.03); border: 0.5px solid ${C.panelBorder}; border-radius: 10px; padding: 9px 11px; }
select.cosmo-input option { background: ${C.bg1}; color: ${C.ink}; }
.cosmo-noscroll::-webkit-scrollbar { display: none; }
.cosmo-noscroll { scrollbar-width: none; }

/* tab bar: brilho no item ativo */
.cosmo-tab-active { position: relative; }
.cosmo-tab-active::after { content: ''; position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: ${C.blueBright}; box-shadow: 0 0 6px ${C.blueBright}; }

/* respeita quem prefere menos movimento (acessibilidade) */
@media (prefers-reduced-motion: reduce) {
  .cosmo-current, .cosmo-fade, .cosmo-tap { animation: none !important; }
  [style*="cosmoPulse"], [style*="cosmoHalo"], [style*="cosmoSat"] { animation: none !important; }
}
`;
