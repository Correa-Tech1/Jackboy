import { useState } from "react";
import {
  Plus, Trash2, FileText, Users, ChevronLeft, Download,
  Briefcase, Check, Pencil, X,
} from "lucide-react";
import { LOGO_JACKSON } from "./logoJackson.js";

// ============================================================
//  MÓDULO DE SERVIÇOS — orçamentos + clientes + PDF
//  Feito pro Jackson (eletricista). Espelha o formato do orçamento
//  real dele (serviços + materiais + totais + formas de pagamento).
// ============================================================

// paleta local (recebe C do pai via prop pra manter o tema)
function money(n) {
  const v = Number(n) || 0;
  return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function genId() { return Math.random().toString(36).slice(2, 10); }
function hoje() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const STATUS = [
  { id: "orcado", label: "Orçado", cor: "#7FC0EE" },
  { id: "agendado", label: "Agendado", cor: "#F2C230" },
  { id: "andamento", label: "Em andamento", cor: "#4FA3E0" },
  { id: "concluido", label: "Concluído", cor: "#43C08A" },
  { id: "atraso", label: "Em atraso", cor: "#E8705F" },
];

// dados da empresa (aparecem no PDF) — podem virar editáveis depois
const EMPRESA = {
  nome: "Jackson Oliveira - Serviços Elétricos",
  cnpj: "55.755.820/0001-85",
  fone: "62993574444",
  cidade: "Anápolis", bairro: "Jaiara", estado: "Goiás", cep: "75064-720",
  pix: "55.755.820/0001-85 (CNPJ)",
  garantia: "90 dias",
};

export default function ServicosScreen({ C, MONO, SANS, servData, persistServ }) {
  // servData = { clientes: [], orcamentos: [] }
  const clientes = (servData && servData.clientes) || [];
  const orcamentos = (servData && servData.orcamentos) || [];
  const [view, setView] = useState("orcamentos"); // orcamentos | clientes | novoOrc | verOrc
  const [orcAtivo, setOrcAtivo] = useState(null);

  function salvar(next) { persistServ({ clientes, orcamentos, ...next }); }

  // ---------- clientes ----------
  function addCliente(c) {
    const novo = { id: genId(), nome: c.nome, contato: c.contato || "", status: c.status || "orcado", criadoEm: Date.now() };
    salvar({ clientes: [novo, ...clientes] });
    return novo;
  }
  function updateCliente(id, patch) {
    salvar({ clientes: clientes.map((c) => c.id === id ? { ...c, ...patch } : c) });
  }
  function delCliente(id) {
    salvar({ clientes: clientes.filter((c) => c.id !== id) });
  }

  // ---------- orçamentos ----------
  function salvarOrc(orc) {
    const existe = orcamentos.find((o) => o.id === orc.id);
    const lista = existe ? orcamentos.map((o) => o.id === orc.id ? orc : o) : [orc, ...orcamentos];
    salvar({ orcamentos: lista });
  }
  function delOrc(id) {
    salvar({ orcamentos: orcamentos.filter((o) => o.id !== id) });
  }

  // ------- estilos base -------
  const card = { background: "rgba(255,255,255,0.03)", border: `0.5px solid ${C.panelBorder}`, borderRadius: 12, padding: 14 };
  const btnPrimary = { display: "flex", alignItems: "center", gap: 6, background: C.blue, color: "#04121F", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS };
  const chip = (ativo) => ({ padding: "7px 13px", borderRadius: 20, fontSize: 12, fontFamily: MONO, letterSpacing: "0.05em", cursor: "pointer", border: `0.5px solid ${ativo ? C.blueLine : C.panelBorder}`, background: ativo ? "rgba(79,163,224,0.12)" : "transparent", color: ativo ? C.blueLight : C.inkMute });

  // ====== TELA: criar/editar orçamento ======
  if (view === "novoOrc" || view === "verOrc") {
    return (
      <OrcamentoForm
        C={C} MONO={MONO} SANS={SANS}
        clientes={clientes}
        addCliente={addCliente}
        orcInicial={view === "verOrc" ? orcAtivo : null}
        onCancel={() => { setView("orcamentos"); setOrcAtivo(null); }}
        onSave={(orc) => { salvarOrc(orc); setView("orcamentos"); setOrcAtivo(null); }}
        onPDF={(orc) => gerarPDF(orc, clientes)}
      />
    );
  }

  return (
    <div className="cosmo-fade" style={{ paddingBottom: 24 }}>
      {/* cabeçalho + alternador */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Briefcase size={18} color={C.blueBright} />
        <div style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>Serviços</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div onClick={() => setView("orcamentos")} style={chip(view === "orcamentos")}>ORÇAMENTOS</div>
        <div onClick={() => setView("clientes")} style={chip(view === "clientes")}>CLIENTES</div>
      </div>

      {view === "orcamentos" && (
        <>
          <button onClick={() => { setOrcAtivo(null); setView("novoOrc"); }} style={{ ...btnPrimary, width: "100%", justifyContent: "center", marginBottom: 16 }}>
            <Plus size={15} /> Novo orçamento
          </button>
          {orcamentos.length === 0 && (
            <div style={{ fontSize: 12.5, color: C.inkFaint, textAlign: "center", padding: "20px 0" }}>
              Nenhum orçamento ainda. Cria o primeiro aí em cima. ⚡
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orcamentos.map((o) => {
              const st = STATUS.find((s) => s.id === o.status) || STATUS[0];
              return (
                <div key={o.id} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: C.ink, fontWeight: 600 }}>{o.cliente || "Sem cliente"}</div>
                      <div style={{ fontSize: 11.5, color: C.inkMute, marginTop: 2 }}>{o.titulo || "Orçamento"}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.inkFaint, marginTop: 4 }}>{o.numero} · {o.data}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, color: C.blueBright, fontWeight: 700, fontFamily: MONO }}>{money(o.total)}</div>
                      <div style={{ display: "inline-block", marginTop: 6, padding: "3px 8px", borderRadius: 12, fontSize: 9.5, fontFamily: MONO, color: st.cor, border: `0.5px solid ${st.cor}55` }}>{st.label}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={() => { setOrcAtivo(o); setView("verOrc"); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "rgba(255,255,255,0.04)", border: `0.5px solid ${C.panelBorder}`, borderRadius: 9, padding: "8px", fontSize: 12, color: C.inkSoft, cursor: "pointer", fontFamily: SANS }}>
                      <Pencil size={12} /> Abrir
                    </button>
                    <button onClick={() => gerarPDF(o, clientes)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "rgba(79,163,224,0.1)", border: `0.5px solid ${C.blueLine}`, borderRadius: 9, padding: "8px", fontSize: 12, color: C.blueLight, cursor: "pointer", fontFamily: SANS }}>
                      <Download size={12} /> PDF
                    </button>
                    <button onClick={() => { if (confirm("Apagar este orçamento?")) delOrc(o.id); }} className="cosmo-icon-btn" style={{ padding: 8 }}>
                      <Trash2 size={13} color={C.inkFaint} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {view === "clientes" && (
        <ClientesLista
          C={C} MONO={MONO} SANS={SANS}
          clientes={clientes}
          addCliente={addCliente}
          updateCliente={updateCliente}
          delCliente={delCliente}
        />
      )}
    </div>
  );
}

// ---------- Lista de clientes ----------
function ClientesLista({ C, MONO, SANS, clientes, addCliente, updateCliente, delCliente }) {
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const card = { background: "rgba(255,255,255,0.03)", border: `0.5px solid ${C.panelBorder}`, borderRadius: 12, padding: 12 };
  const input = { flex: 1, background: "rgba(255,255,255,0.05)", border: `0.5px solid ${C.panelBorder}`, borderRadius: 9, padding: "10px 12px", fontSize: 13, color: C.ink, outline: "none", fontFamily: SANS };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <input style={input} placeholder="Nome do cliente" value={nome} onChange={(e) => setNome(e.target.value)} />
        <div style={{ display: "flex", gap: 8 }}>
          <input style={input} placeholder="Contato (telefone)" value={contato} onChange={(e) => setContato(e.target.value)} />
          <button onClick={() => { if (nome.trim()) { addCliente({ nome: nome.trim(), contato: contato.trim() }); setNome(""); setContato(""); } }} style={{ display: "flex", alignItems: "center", gap: 5, background: C.blue, color: "#04121F", border: "none", borderRadius: 9, padding: "0 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
      {clientes.length === 0 && (
        <div style={{ fontSize: 12.5, color: C.inkFaint, textAlign: "center", padding: "20px 0" }}>Nenhum cliente cadastrado.</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {clientes.map((c) => {
          const st = STATUS.find((s) => s.id === c.status) || STATUS[0];
          return (
            <div key={c.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, color: C.ink, fontWeight: 500 }}>{c.nome}</div>
                  {c.contato ? <div style={{ fontSize: 11.5, color: C.inkMute, fontFamily: MONO, marginTop: 2 }}>{c.contato}</div> : null}
                </div>
                <button onClick={() => { if (confirm("Apagar cliente?")) delCliente(c.id); }} className="cosmo-icon-btn"><Trash2 size={13} color={C.inkFaint} /></button>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {STATUS.map((s) => (
                  <div key={s.id} onClick={() => updateCliente(c.id, { status: s.id })} style={{ padding: "4px 9px", borderRadius: 12, fontSize: 9.5, fontFamily: MONO, cursor: "pointer", color: c.status === s.id ? s.cor : C.inkFaint, border: `0.5px solid ${c.status === s.id ? s.cor + "77" : C.panelBorder}`, background: c.status === s.id ? s.cor + "18" : "transparent" }}>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Formulário de orçamento ----------
function OrcamentoForm({ C, MONO, SANS, clientes, addCliente, orcInicial, onCancel, onSave, onPDF }) {
  const [cliente, setCliente] = useState(orcInicial ? orcInicial.cliente : "");
  const [contato, setContato] = useState(orcInicial ? orcInicial.contato || "" : "");
  const [titulo, setTitulo] = useState(orcInicial ? orcInicial.titulo || "" : "");
  const [status, setStatus] = useState(orcInicial ? orcInicial.status : "orcado");
  const [servicos, setServicos] = useState(orcInicial ? orcInicial.servicos || [] : []);
  const [materiais, setMateriais] = useState(orcInicial ? orcInicial.materiais || [] : []);
  const [obs, setObs] = useState(orcInicial ? orcInicial.obs || "" : "");

  const input = { width: "100%", background: "rgba(255,255,255,0.05)", border: `0.5px solid ${C.panelBorder}`, borderRadius: 9, padding: "10px 12px", fontSize: 13, color: C.ink, outline: "none", fontFamily: SANS, boxSizing: "border-box" };
  const label = { fontSize: 10.5, fontFamily: MONO, color: C.inkMute, letterSpacing: "0.1em", marginBottom: 6, display: "block", textTransform: "uppercase" };

  const totalServ = servicos.reduce((s, it) => s + (Number(it.preco) || 0) * (Number(it.qtd) || 0), 0);
  const totalMat = materiais.reduce((s, it) => s + (Number(it.preco) || 0) * (Number(it.qtd) || 0), 0);
  const total = totalServ + totalMat;

  function addServico() { setServicos([...servicos, { id: genId(), nome: "", preco: "", qtd: "1" }]); }
  function addMaterial() { setMateriais([...materiais, { id: genId(), nome: "", preco: "", qtd: "1", unidade: "und" }]); }
  function upServ(id, patch) { setServicos(servicos.map((s) => s.id === id ? { ...s, ...patch } : s)); }
  function upMat(id, patch) { setMateriais(materiais.map((m) => m.id === id ? { ...m, ...patch } : m)); }

  function montarOrc() {
    return {
      id: orcInicial ? orcInicial.id : genId(),
      numero: orcInicial ? orcInicial.numero : "ORC-" + Date.now().toString().slice(-6),
      data: orcInicial ? orcInicial.data : hoje(),
      cliente: cliente.trim(), contato: contato.trim(), titulo: titulo.trim(),
      status, servicos, materiais, obs,
      totalServ, totalMat, total,
    };
  }

  const btnAdd = { display: "flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100%", background: "rgba(255,255,255,0.04)", border: `0.5px dashed ${C.panelBorder}`, borderRadius: 9, padding: "9px", fontSize: 12, color: C.inkSoft, cursor: "pointer", fontFamily: SANS };

  return (
    <div className="cosmo-fade" style={{ paddingBottom: 30 }}>
      <button onClick={onCancel} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: C.inkMute, fontSize: 13, cursor: "pointer", marginBottom: 14, fontFamily: SANS }}>
        <ChevronLeft size={16} /> voltar
      </button>

      <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 16 }}>
        {orcInicial ? "Editar orçamento" : "Novo orçamento"}
      </div>

      {/* cliente */}
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Cliente</label>
        <input style={input} placeholder="Nome do cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} list="clientes-list" />
        <datalist id="clientes-list">
          {clientes.map((c) => <option key={c.id} value={c.nome} />)}
        </datalist>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Contato</label>
        <input style={input} placeholder="Telefone / contato" value={contato} onChange={(e) => setContato(e.target.value)} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Título do serviço</label>
        <input style={input} placeholder="Ex: Instalação elétrica predial" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </div>

      {/* serviços */}
      <div style={{ marginTop: 18, marginBottom: 8 }}>
        <label style={label}>Mão de obra / Serviços</label>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
        {servicos.map((s) => (
          <div key={s.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input style={{ ...input, flex: 2 }} placeholder="Descrição" value={s.nome} onChange={(e) => upServ(s.id, { nome: e.target.value })} />
            <input style={{ ...input, width: 70 }} placeholder="Qtd" inputMode="decimal" value={s.qtd} onChange={(e) => upServ(s.id, { qtd: e.target.value })} />
            <input style={{ ...input, width: 92 }} placeholder="Preço" inputMode="decimal" value={s.preco} onChange={(e) => upServ(s.id, { preco: e.target.value })} />
            <button onClick={() => setServicos(servicos.filter((x) => x.id !== s.id))} className="cosmo-icon-btn"><X size={14} color={C.inkFaint} /></button>
          </div>
        ))}
      </div>
      <button onClick={addServico} style={btnAdd}><Plus size={13} /> Adicionar serviço</button>

      {/* materiais */}
      <div style={{ marginTop: 18, marginBottom: 8 }}>
        <label style={label}>Materiais</label>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
        {materiais.map((m) => (
          <div key={m.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input style={{ ...input, flex: 2 }} placeholder="Material" value={m.nome} onChange={(e) => upMat(m.id, { nome: e.target.value })} />
            <input style={{ ...input, width: 62 }} placeholder="Qtd" inputMode="decimal" value={m.qtd} onChange={(e) => upMat(m.id, { qtd: e.target.value })} />
            <input style={{ ...input, width: 88 }} placeholder="Preço" inputMode="decimal" value={m.preco} onChange={(e) => upMat(m.id, { preco: e.target.value })} />
            <button onClick={() => setMateriais(materiais.filter((x) => x.id !== m.id))} className="cosmo-icon-btn"><X size={14} color={C.inkFaint} /></button>
          </div>
        ))}
      </div>
      <button onClick={addMaterial} style={btnAdd}><Plus size={13} /> Adicionar material</button>

      {/* observações */}
      <div style={{ marginTop: 18, marginBottom: 14 }}>
        <label style={label}>Observações</label>
        <textarea style={{ ...input, minHeight: 60, resize: "vertical" }} placeholder="Condições, prazos, detalhes..." value={obs} onChange={(e) => setObs(e.target.value)} />
      </div>

      {/* status */}
      <div style={{ marginBottom: 16 }}>
        <label style={label}>Status</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS.map((s) => (
            <div key={s.id} onClick={() => setStatus(s.id)} style={{ padding: "6px 11px", borderRadius: 12, fontSize: 10.5, fontFamily: MONO, cursor: "pointer", color: status === s.id ? s.cor : C.inkFaint, border: `0.5px solid ${status === s.id ? s.cor + "77" : C.panelBorder}`, background: status === s.id ? s.cor + "18" : "transparent" }}>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* totais */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: `0.5px solid ${C.panelBorder}`, borderRadius: 12, padding: 14, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.inkSoft, marginBottom: 6 }}>
          <span>Total serviços</span><span style={{ fontFamily: MONO }}>{money(totalServ)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.inkSoft, marginBottom: 10 }}>
          <span>Total materiais</span><span style={{ fontFamily: MONO }}>{money(totalMat)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: C.blueBright, fontWeight: 700, borderTop: `0.5px solid ${C.panelBorder}`, paddingTop: 10 }}>
          <span>TOTAL</span><span style={{ fontFamily: MONO }}>{money(total)}</span>
        </div>
      </div>

      {/* ações */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onSave(montarOrc())} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.blue, color: "#04121F", border: "none", borderRadius: 10, padding: "12px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
          <Check size={15} /> Salvar
        </button>
        <button onClick={() => onPDF(montarOrc())} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(242,194,48,0.14)", color: C.blueBright, border: `0.5px solid ${C.blueBright}55`, borderRadius: 10, padding: "12px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
          <Download size={15} /> Gerar PDF
        </button>
      </div>
    </div>
  );
}

// ---------- Geração do PDF (abre janela de impressão → salvar como PDF) ----------
function gerarPDF(orc, clientes) {
  const linhasServ = (orc.servicos || []).filter((s) => s.nome).map((s) => {
    const val = (Number(s.preco) || 0) * (Number(s.qtd) || 0);
    return `<tr>
      <td>${escapar(s.nome)}</td>
      <td class="r">${money(s.preco)}</td>
      <td class="c">${Number(s.qtd) || 0}</td>
      <td class="r">${money(val)}</td>
    </tr>`;
  }).join("");

  const linhasMat = (orc.materiais || []).filter((m) => m.nome).map((m) => `<tr>
      <td>${escapar(m.nome)}</td>
      <td class="r">${Number(m.qtd) || 0} (${escapar(m.unidade || "und")})</td>
    </tr>`).join("");

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Orçamento ${escapar(orc.numero)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; margin: 0; padding: 28px; font-size: 13px; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 14px; }
  .logo { width: 88px; height: auto; border-radius: 8px; }
  .title { text-align: right; }
  .title h1 { margin: 0; font-size: 26px; letter-spacing: 1px; }
  .title .doc { font-size: 12px; color: #333; margin-top: 4px; }
  .empresa { margin-top: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
  .empresa .nome { font-size: 17px; font-weight: bold; }
  .empresa .sub { font-size: 11px; color: #444; line-height: 1.5; margin-top: 3px; }
  .cli { text-align: right; font-size: 12px; }
  .cli b { font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 18px; }
  th { background: #f0f0f0; text-align: left; padding: 8px 10px; font-size: 12px; border-bottom: 1.5px solid #ccc; }
  td { padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 12px; }
  th.r, td.r { text-align: right; } th.c, td.c { text-align: center; }
  .sec { margin-top: 4px; background: #1a1a1a; color: #fff; padding: 7px 10px; font-weight: bold; font-size: 12px; }
  .totais { margin-top: 20px; margin-left: auto; width: 60%; }
  .totais .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
  .totais .final { border-top: 2px solid #111; margin-top: 6px; padding-top: 8px; font-size: 16px; font-weight: bold; }
  .foot { margin-top: 26px; font-size: 11px; color: #333; line-height: 1.7; }
  .assinatura { margin-top: 46px; text-align: center; }
  .assinatura .linha { width: 260px; border-top: 1px solid #333; margin: 0 auto 6px; }
  @media print { body { padding: 12px; } }
</style></head><body>
  <div class="top">
    <img src="${LOGO_JACKSON}" class="logo" alt="logo" />
    <div class="title">
      <h1>Orçamento</h1>
      <div class="doc"><b>Nº</b> ${escapar(orc.numero)}<br><b>Data</b> ${escapar(orc.data)}</div>
    </div>
  </div>

  <div class="empresa">
    <div>
      <div class="nome">${escapar(EMPRESA.nome)}</div>
      <div class="sub">CNPJ: ${EMPRESA.cnpj}<br>${EMPRESA.fone}<br>${EMPRESA.cidade} · ${EMPRESA.bairro} · ${EMPRESA.estado} · CEP ${EMPRESA.cep}</div>
    </div>
    <div class="cli">
      <b>Cliente:</b> ${escapar(orc.cliente || "-")}<br>
      ${orc.contato ? "Contato: " + escapar(orc.contato) : ""}
      ${orc.titulo ? "<br><i>" + escapar(orc.titulo) + "</i>" : ""}
    </div>
  </div>

  ${linhasServ ? `<table>
    <tr><th>Serviços</th><th class="r">Preço</th><th class="c">Qtd</th><th class="r">Valor</th></tr>
    ${linhasServ}
  </table>` : ""}

  ${linhasMat ? `<div class="sec">Materiais</div><table>
    <tr><th>Item</th><th class="r">Quantidade</th></tr>
    ${linhasMat}
  </table>` : ""}

  <div class="totais">
    <div class="row"><span>Total serviços</span><span>${money(orc.totalServ)}</span></div>
    <div class="row"><span>Total materiais</span><span>${money(orc.totalMat)}</span></div>
    <div class="row final"><span>TOTAL</span><span>${money(orc.total)}</span></div>
  </div>

  <div class="foot">
    <b>Garantia da mão de obra:</b> ${EMPRESA.garantia}<br>
    ${orc.obs ? "<b>Observações:</b> " + escapar(orc.obs) + "<br>" : ""}
    <b>Formas de pagamento:</b> Dinheiro / Cartão / Boleto / PIX: ${EMPRESA.pix}
  </div>

  <div class="assinatura">
    <div class="linha"></div>
    <div>${escapar(EMPRESA.nome)}</div>
  </div>

  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) { alert("Permita pop-ups pra gerar o PDF."); return; }
  win.document.write(html);
  win.document.close();
}

function escapar(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
