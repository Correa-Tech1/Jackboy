import { useState, useEffect } from "react";

// Tela de abertura (splash) em duas cenas:
//  1) "Sistema criado pela — CORREA TECH"
//  2) A logo do JACKBOY surge; depois some e o app abre.
// Ao terminar, chama onDone(). Respeita quem prefere menos animação.
export default function Splash({ onDone }) {
  const [cena, setCena] = useState(0);       // 0 = Correa Tech, 1 = JACKBOY, 2 = saindo
  const reduz = typeof window !== "undefined" &&
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    // tempos (encurtados se o usuário prefere menos movimento)
    const t1 = reduz ? 900 : 1700;   // quanto tempo a cena Correa Tech fica
    const t2 = reduz ? 800 : 1500;   // quanto tempo a logo JACKBOY fica
    const fade = 500;                // duração do fade de saída

    const a = setTimeout(() => setCena(1), t1);
    const b = setTimeout(() => setCena(2), t1 + t2);
    const c = setTimeout(() => onDone && onDone(), t1 + t2 + fade);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
    // eslint-disable-next-line
  }, []);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "radial-gradient(ellipse at 50% 30%, #16181F 0%, #0A0A0C 70%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
        opacity: cena === 2 ? 0 : 1,
        transition: "opacity 500ms ease",
      }}
    >
      {/* CENA 1 — Correa Tech */}
      <div
        style={{
          position: "absolute", textAlign: "center",
          opacity: cena === 0 ? 1 : 0,
          transform: cena === 0 ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 600ms ease, transform 600ms ease",
        }}
      >
        <div style={{ fontSize: 13, color: "#9DA0A6", letterSpacing: "0.18em", marginBottom: 12, textTransform: "uppercase" }}>
          Sistema criado pela
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          {/* símbolo CT minimalista em linha clara */}
          <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M30 12 A13 13 0 1 0 30 36" fill="none" stroke="#B4D2F0" strokeWidth="3" strokeLinecap="round" />
            <path d="M26 11 L42 11 M34 11 L34 37" fill="none" stroke="#B4D2F0" strokeWidth="3" strokeLinecap="round" />
            <circle cx="24" cy="24" r="2.4" fill="#4FA3E0" />
          </svg>
          <div style={{ fontSize: 26, color: "#F4F5F7", fontWeight: 700, letterSpacing: "0.14em" }}>
            CORREA TECH
          </div>
        </div>
      </div>

      {/* CENA 2 — logo JACKBOY */}
      <div
        style={{
          position: "absolute", textAlign: "center",
          opacity: cena === 1 ? 1 : 0,
          transform: cena === 1 ? "scale(1)" : "scale(0.94)",
          transition: "opacity 600ms ease, transform 600ms ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <svg width="96" height="96" viewBox="0 0 92 92" aria-hidden="true">
            <defs>
              <linearGradient id="spBlue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7FC0EE" /><stop offset="100%" stopColor="#2E7CB8" /></linearGradient>
              <linearGradient id="spYellow" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#F7D65A" /><stop offset="100%" stopColor="#E0A81A" /></linearGradient>
            </defs>
            <polygon points="46,8 78,26 78,66 46,84 14,66 14,26" fill="none" stroke="url(#spBlue)" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="46,16 71,30 71,62 46,76 21,62 21,30" fill="none" stroke="#F2C230" strokeWidth="1" strokeLinejoin="round" opacity="0.35" strokeDasharray="3 5" />
            <path d="M 56 28 L 56 52 Q 56 63 45 63 Q 35 63 34 54" fill="none" stroke="url(#spYellow)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 50 30 L 40 45 L 48 45 L 38 60" fill="none" stroke="#4FA3E0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="56" cy="28" r="3" fill="#F2C230" />
            <circle cx="34" cy="54" r="2.5" fill="#4FA3E0" />
          </svg>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: "#F2C230", letterSpacing: "0.32em" }}>
          JACKBOY
        </div>
      </div>
    </div>
  );
}
