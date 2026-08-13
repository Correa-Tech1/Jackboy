import { useState, useEffect } from "react";
import { supabase, supabaseReady } from "./supabaseClient.js";
import Cosmo, { setStorageUser } from "./Cosmo.jsx";

// Tela de login (email + senha) + porteiro que decide se mostra o C.O.S.M.O. ou o login.
export default function AuthGate() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
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
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% -10%, #0F1B33 0%, #0A1020 55%, #060912 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <svg width="88" height="88" viewBox="0 0 92 92" aria-hidden="true">
            <defs>
              <radialGradient id="gc" cx="50%" cy="42%" r="60%"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="40%" stopColor="#DBEAFE" /><stop offset="100%" stopColor="#2563EB" /></radialGradient>
              <linearGradient id="ga" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#93C5FD" /><stop offset="50%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#1D4ED8" /></linearGradient>
              <radialGradient id="gh" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0" /></radialGradient>
            </defs>
            <circle cx="46" cy="46" r="44" fill="url(#gh)" />
            <ellipse cx="46" cy="46" rx="40" ry="15" fill="none" stroke="#2A4A7F" strokeWidth="1.5" transform="rotate(-28 46 46)" />
            <path d="M 70 22 A 34 34 0 1 0 70 70" fill="none" stroke="#0A1428" strokeWidth="9" strokeLinecap="round" />
            <path d="M 70 22 A 34 34 0 1 0 70 70" fill="none" stroke="url(#ga)" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M 69 21 A 34 34 0 0 0 12 46" fill="none" stroke="#DBEAFE" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <circle cx="46" cy="46" r="12" fill="url(#gh)" />
            <circle cx="46" cy="46" r="7.5" fill="url(#gc)" />
            <g transform="rotate(-28 46 46)"><circle cx="86" cy="46" r="4" fill="#93C5FD" /></g>
          </svg>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#4A5B7C", letterSpacing: "0.3em", marginBottom: 22 }}>C.O.S.M.O.</div>
        {children}
      </div>
    </div>
  );

  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#EAF1FF", outline: "none", fontFamily: "inherit", marginTop: 10 };
  const btnStyle = { width: "100%", marginTop: 14, background: "#3B82F6", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" };
  const linkStyle = { background: "none", border: "none", color: "#93C5FD", fontSize: 12.5, cursor: "pointer", marginTop: 16, fontFamily: "inherit" };

  if (!supabaseReady) {
    // DIAGNÓSTICO: mostra o que o app está enxergando das variáveis, em vez de abrir mudo.
    const urlSeen = import.meta.env.VITE_SUPABASE_URL;
    const keySeen = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return shell(
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 15, color: "#EAF1FF", marginBottom: 12, textAlign: "center" }}>Diagnóstico de conexão</div>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 14, fontSize: 12.5, lineHeight: 1.7, fontFamily: "monospace", color: "#AEC0DD" }}>
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
      <div style={{ fontSize: 16, color: "#EAF1FF", marginBottom: 6 }}>
        {mode === "criar" ? "Criar sua conta" : "Bom te ver, Matheus."}
      </div>
      <div style={{ fontSize: 13, color: "#7A8BA8", marginBottom: 12, lineHeight: 1.6 }}>
        {mode === "criar" ? "Escolha um email e uma senha para o C.O.S.M.O." : "Entre com seu email e senha."}
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
