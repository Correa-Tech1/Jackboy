import { useState, useEffect } from "react";
import { supabase, supabaseReady } from "./supabaseClient.js";
import Cosmo, { setStorageUser } from "./Cosmo.jsx";
import Splash from "./Splash.jsx";

// Tela de login (email + senha) + porteiro que decide se mostra o JACKBOY ou o login.
export default function AuthGate() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState("entrar"); // "entrar" | "criar"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!supabaseReady) { setChecking(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) setStorageUser(data.session.user.id);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setStorageUser(s ? s.user.id : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit() {
    if (!email.trim() || !password || busy) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "criar") {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        const { data } = await supabase.auth.getSession();
        if (!data.session) setInfo("Conta criada. Se pedir confirmacao, verifique seu email; senao, ja pode entrar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (e) {
      const msg = String(e && e.message ? e.message : e);
      if (/invalid login/i.test(msg)) setError("Email ou senha incorretos.");
      else if (/already registered|already exists/i.test(msg)) setError("Esse email ja tem conta. Tente entrar.");
      else if (/password/i.test(msg) && /6/.test(msg)) setError("A senha precisa ter ao menos 6 caracteres.");
      else setError("Nao consegui agora. Confira os dados e tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (supabaseReady) await supabase.auth.signOut();
    setStorageUser(null);
    setSession(null);
  }

  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% -10%, #16181F 0%, #0F1015 55%, #0A0A0C 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <svg width="88" height="88" viewBox="0 0 92 92" aria-hidden="true">
            <defs>
              <linearGradient id="gBlue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7FC0EE" /><stop offset="100%" stopColor="#2E7CB8" /></linearGradient>
              <linearGradient id="gYellow" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#F7D65A" /><stop offset="100%" stopColor="#E0A81A" /></linearGradient>
            </defs>
            <polygon points="46,8 78,26 78,66 46,84 14,66 14,26" fill="none" stroke="url(#gBlue)" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="46,16 71,30 71,62 46,76 21,62 21,30" fill="none" stroke="#F2C230" strokeWidth="1" strokeLinejoin="round" opacity="0.35" strokeDasharray="3 5" />
            <path d="M 56 28 L 56 52 Q 56 63 45 63 Q 35 63 34 54" fill="none" stroke="url(#gYellow)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 50 30 L 40 45 L 48 45 L 38 60" fill="none" stroke="#4FA3E0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="56" cy="28" r="3" fill="#F2C230" />
            <circle cx="34" cy="54" r="2.5" fill="#4FA3E0" />
          </svg>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#F2C230", letterSpacing: "0.3em", marginBottom: 22 }}>JACKBOY</div>
        {children}
      </div>
    </div>
  );

  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#F4F5F7", outline: "none", fontFamily: "inherit", marginTop: 10 };
  const btnStyle = { width: "100%", marginTop: 14, background: "#4FA3E0", color: "#0A2B45", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
  const linkStyle = { background: "none", border: "none", color: "#7FC0EE", fontSize: 12.5, cursor: "pointer", marginTop: 16, fontFamily: "inherit" };

  if (showSplash) {
    return <Splash onDone={() => setShowSplash(false)} />;
  }

  if (!supabaseReady) {
    // DIAGNÓSTICO: mostra o que o app está enxergando das variáveis, em vez de abrir mudo.
    const urlSeen = import.meta.env.VITE_SUPABASE_URL;
    const keySeen = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return shell(
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 15, color: "#F4F5F7", marginBottom: 12, textAlign: "center" }}>Diagnóstico de conexão</div>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 14, fontSize: 12.5, lineHeight: 1.7, fontFamily: "monospace", color: "#D2D4D8" }}>
          <div>VITE_SUPABASE_URL:<br /><span style={{ color: urlSeen ? "#4ADE80" : "#F87171" }}>{urlSeen ? "✓ " + String(urlSeen).slice(0, 30) + "..." : "✗ NÃO ENCONTRADA"}</span></div>
          <div style={{ marginTop: 10 }}>VITE_SUPABASE_ANON_KEY:<br /><span style={{ color: keySeen ? "#4ADE80" : "#F87171" }}>{keySeen ? "✓ " + String(keySeen).slice(0, 18) + "..." : "✗ NÃO ENCONTRADA"}</span></div>
        </div>
        <div style={{ fontSize: 12, color: "#7A8BA8", marginTop: 14, lineHeight: 1.6, textAlign: "center" }}>
          Se aparecer "NÃO ENCONTRADA" em vermelho, o app não recebeu as variáveis no momento da montagem. Mande um print desta tela.
        </div>
      </div>
    );
  }

  if (checking) {
    return shell(<div style={{ color: "#7A8BA8", fontSize: 13 }}>Verificando sessao...</div>);
  }

  if (session) {
    return <Cosmo onSignOut={signOut} userEmail={session.user.email} />;
  }

  return shell(
    <div>
      <div style={{ fontSize: 16, color: "#F4F5F7", marginBottom: 6 }}>
        {mode === "criar" ? "Criar sua conta" : "Bom te ver, Jackson."}
      </div>
      <div style={{ fontSize: 13, color: "#7A8BA8", marginBottom: 12, lineHeight: 1.6 }}>
        {mode === "criar" ? "Escolha um email e uma senha para o JACKBOY." : "Entre com seu email e senha."}
      </div>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle} autoFocus />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }} placeholder={mode === "criar" ? "senha (min. 6 caracteres)" : "senha"} style={inputStyle} />
      {error && <div style={{ color: "#F87171", fontSize: 12, marginTop: 8 }}>{error}</div>}
      {info && <div style={{ color: "#93C5FD", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>{info}</div>}
      <button onClick={handleSubmit} disabled={busy || !email.trim() || !password} style={{ ...btnStyle, opacity: busy || !email.trim() || !password ? 0.6 : 1 }}>
        {busy ? "Aguarde..." : mode === "criar" ? "Criar conta" : "Entrar"}
      </button>
      <div>
        <button onClick={() => { setMode(mode === "criar" ? "entrar" : "criar"); setError(null); setInfo(null); }} style={linkStyle}>
          {mode === "criar" ? "Ja tenho conta - entrar" : "Primeira vez? Criar conta"}
        </button>
      </div>
    </div>
  );
}
