import { useState, useEffect } from "react";

const PRIORIDADE_STYLE = {
  "Normal":     { cor: "#6b7280", bg: "rgba(107,114,128,0.12)", icon: "💬" },
  "Importante": { cor: "#fbbf24", bg: "rgba(251,191,36,0.12)",  icon: "⭐" },
  "Urgente":    { cor: "#f87171", bg: "rgba(248,113,113,0.12)", icon: "🚨" },
};

const TIPO_STYLE = {
  "Individual":  { cor: "#a78bfa", label: "Pessoal" },
  "Curso":       { cor: "#34d399", label: "Seu Curso" },
  "Geral":       { cor: "#5b6cff", label: "Geral" },
  "Professores": { cor: "#fb923c", label: "Professores" },
};

export default function Mensagens({ alunoId }) {
  const API = `/alunos/${alunoId}/mensagens`;

  const [mensagens, setMensagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todas");
  const [aberta, setAberta] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchMensagens(); }, []);

  async function fetchMensagens() {
    setLoading(true);
    try {
      const r = await fetch(API);
      const d = await r.json();
      setMensagens(Array.isArray(d) ? d : []);
    } catch {
      // demo
      setMensagens([
        {
          _id: "1", titulo: "Bem-vindo ao semestre 2026/1!",
          corpo: "Prezados alunos, informamos que as aulas do semestre 2026/1 terão início no dia 10 de fevereiro. Confiram o horário de aulas no portal e fiquem atentos ao calendário acadêmico. Qualquer dúvida, procurem a secretaria. Bom semestre a todos!",
          remetente: "Coord. Geral", tipo: "Geral", prioridade: "Normal",
          lida: false, createdAt: new Date("2026-02-01").toISOString(),
        },
        {
          _id: "2", titulo: "Prazo de entrega do TCC — URGENTE",
          corpo: "Informamos que o prazo final para envio do TCC no portal é dia 28 de fevereiro de 2026. Alunos que não enviarem dentro do prazo terão suas defesas canceladas. Qualquer problema técnico deve ser reportado imediatamente à secretaria.",
          remetente: "Coord. de Curso", tipo: "Curso", prioridade: "Urgente",
          lida: false, createdAt: new Date("2026-01-25").toISOString(),
        },
        {
          _id: "3", titulo: "Sua solicitação de documentos foi processada",
          corpo: "Informamos que sua solicitação de declaração de matrícula foi processada com sucesso. O documento já está disponível para download no portal em Requerimentos → Documentos.",
          remetente: "Secretaria Acadêmica", tipo: "Individual", prioridade: "Normal",
          lida: true, createdAt: new Date("2026-01-20").toISOString(),
        },
        {
          _id: "4", titulo: "Manutenção do sistema — sábado 08/02",
          corpo: "O portal Schoolnet ficará indisponível no sábado, dia 08 de fevereiro, das 00h às 06h para manutenção programada. Pedimos desculpas pelo transtorno.",
          remetente: "TI Institucional", tipo: "Geral", prioridade: "Importante",
          lida: true, createdAt: new Date("2026-01-18").toISOString(),
        },
      ]);
    }
    setLoading(false);
  }

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function abrirMensagem(msg) {
    setAberta(msg);
    if (!msg.lida) {
      try {
        await fetch(`${API}/${msg._id}/ler`, { method: "PATCH" });
      } catch {}
      setMensagens(prev => prev.map(m => m._id === msg._id ? { ...m, lida: true } : m));
    }
  }

  async function arquivar(e, msgId) {
    e.stopPropagation();
    try {
      await fetch(`${API}/${msgId}/arquivar`, { method: "PATCH" });
    } catch {}
    setMensagens(prev => prev.filter(m => m._id !== msgId));
    if (aberta?._id === msgId) setAberta(null);
    showToast("Mensagem arquivada.");
  }

  const naoLidas = mensagens.filter(m => !m.lida).length;

  const filtros = ["Todas", "Não lidas", "Geral", "Curso", "Individual", "Urgente"];
  const filtradas = mensagens.filter(m => {
    if (filtro === "Não lidas") return !m.lida;
    if (filtro === "Urgente")   return m.prioridade === "Urgente";
    if (filtro === "Todas")     return true;
    return m.tipo === filtro;
  });

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>✉️</div>
          <div>
            <div style={S.headerTitle}>Mensagens</div>
            <div style={S.headerSub}>Portal Acadêmico</div>
          </div>
        </div>
        {naoLidas > 0 && (
          <div style={S.naoLidasPill}>
            {naoLidas} não lida{naoLidas > 1 ? "s" : ""}
          </div>
        )}
      </header>

      <div style={S.page}>
        {/* FILTROS */}
        <div style={S.filtros}>
          {filtros.map(f => (
            <button key={f}
              style={{ ...S.filtrBtn, ...(filtro === f ? S.filtrAtivo : {}) }}
              onClick={() => setFiltro(f)}>
              {f}
              {f === "Não lidas" && naoLidas > 0 && (
                <span style={S.badge}>{naoLidas}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={S.center}><Spinner /></div>
        ) : (
          <div style={S.layout}>
            {/* LISTA */}
            <div style={S.lista}>
              {filtradas.length === 0 ? (
                <div style={S.emptyCard}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Nenhuma mensagem</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    {filtro === "Não lidas" ? "Você leu todas as mensagens!" : "Nenhuma mensagem nesta categoria."}
                  </div>
                </div>
              ) : (
                filtradas.map(msg => {
                  const pr = PRIORIDADE_STYLE[msg.prioridade] || PRIORIDADE_STYLE["Normal"];
                  const tp = TIPO_STYLE[msg.tipo] || TIPO_STYLE["Geral"];
                  const data = new Date(msg.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
                  const isAberta = aberta?._id === msg._id;

                  return (
                    <div
                      key={msg._id}
                      style={{ ...S.msgRow, ...(isAberta ? S.msgRowAtivo : {}), ...(msg.lida ? {} : S.msgRowNaoLida) }}
                      onClick={() => abrirMensagem(msg)}
                    >
                      {/* INDICADOR NÃO LIDA */}
                      <div style={{ ...S.dotNaoLida, opacity: msg.lida ? 0 : 1 }} />

                      <div style={{ ...S.prIcon, background: pr.bg }}>
                        {pr.icon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ ...S.msgTitulo, fontWeight: msg.lida ? 500 : 700 }}>
                            {msg.titulo}
                          </div>
                        </div>
                        <div style={S.msgMeta}>
                          <span>{msg.remetente}</span>
                          <span style={{ color: tp.cor }}>● {tp.label}</span>
                          <span>{data}</span>
                        </div>
                        <div style={S.msgPreview}>
                          {msg.corpo.substring(0, 80)}...
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                        {msg.prioridade !== "Normal" && (
                          <div style={{ ...S.prTag, color: pr.cor, background: pr.bg }}>
                            {msg.prioridade}
                          </div>
                        )}
                        <button style={S.btnArquivar} onClick={e => arquivar(e, msg._id)} title="Arquivar">
                          🗂
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* PAINEL DE LEITURA */}
            <div style={S.painel}>
              {!aberta ? (
                <div style={S.painelVazio}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>✉️</div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Selecione uma mensagem</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Clique em uma mensagem para ler o conteúdo completo.</div>
                </div>
              ) : (() => {
                const pr = PRIORIDADE_STYLE[aberta.prioridade] || PRIORIDADE_STYLE["Normal"];
                const tp = TIPO_STYLE[aberta.tipo] || TIPO_STYLE["Geral"];
                const data = new Date(aberta.createdAt).toLocaleString("pt-BR");
                return (
                  <div style={S.painelConteudo}>
                    {/* PRIORIDADE URGENTE */}
                    {aberta.prioridade === "Urgente" && (
                      <div style={S.urgenteBanner}>
                        🚨 Mensagem urgente — leia com atenção
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                      <div>
                        <div style={{ ...S.tipoPill, color: tp.cor, background: tp.cor + "15" }}>
                          {tp.label}
                        </div>
                        <div style={S.painelTitulo}>{aberta.titulo}</div>
                      </div>
                      <button style={S.btnArquivarPainel} onClick={e => arquivar(e, aberta._id)}>
                        🗂 Arquivar
                      </button>
                    </div>

                    <div style={S.painelInfoRow}>
                      <span>👤 <strong>{aberta.remetente}</strong></span>
                      <span>📅 {data}</span>
                      <span style={{ color: pr.cor }}>{pr.icon} {aberta.prioridade}</span>
                    </div>

                    <div style={S.painelDivider} />

                    <div style={S.painelCorpo}>{aberta.corpo}</div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div style={{ ...S.toast, ...(toast.type === "erro" ? S.toastErro : S.toastOk) }}>
          ✔ {toast.msg}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 32, height: 32,
      border: "3px solid rgba(255,255,255,0.1)",
      borderTopColor: "#5b6cff", borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

const S = {
  root: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#e8eaf0" },
  header: { background: "#15181f", borderBottom: "1px solid #252a38", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#5b6cff,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  naoLidasPill: { background: "rgba(91,108,255,0.15)", border: "1px solid #5b6cff44", color: "#a78bfa", padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700 },
  page: { maxWidth: 1100, margin: "0 auto", padding: "28px 20px" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" },
  filtros: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  filtrBtn: { padding: "7px 16px", border: "1px solid #252a38", borderRadius: 999, background: "none", color: "#6b7280", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  filtrAtivo: { background: "#1c202b", borderColor: "#5b6cff", color: "#e8eaf0" },
  badge: { background: "#5b6cff", color: "#fff", borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 700 },
  layout: { display: "grid", gridTemplateColumns: "400px 1fr", gap: 20, alignItems: "start" },
  lista: { display: "flex", flexDirection: "column", gap: 4 },
  msgRow: { display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: "#15181f", border: "1px solid #252a38", borderRadius: 12, cursor: "pointer", transition: "all 0.15s", position: "relative" },
  msgRowAtivo: { borderColor: "#5b6cff", background: "rgba(91,108,255,0.06)" },
  msgRowNaoLida: { background: "#15181f" },
  dotNaoLida: { position: "absolute", top: 16, left: 6, width: 7, height: 7, borderRadius: "50%", background: "#5b6cff", flexShrink: 0 },
  prIcon: { width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  msgTitulo: { fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 },
  msgMeta: { display: "flex", gap: 10, fontSize: 11, color: "#6b7280", marginBottom: 3 },
  msgPreview: { fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  prTag: { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 },
  btnArquivar: { background: "none", border: "1px solid #252a38", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" },
  emptyCard: { background: "#15181f", border: "1px dashed #252a38", borderRadius: 14, padding: "52px 24px", textAlign: "center" },
  painel: { background: "#15181f", border: "1px solid #252a38", borderRadius: 14, minHeight: 480, position: "sticky", top: 80 },
  painelVazio: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 480, textAlign: "center", padding: 32 },
  painelConteudo: { padding: "24px 28px" },
  urgenteBanner: { background: "rgba(248,113,113,0.1)", border: "1px solid #f8717133", borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#f87171", fontWeight: 600, marginBottom: 18 },
  tipoPill: { display: "inline-block", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999, marginBottom: 8 },
  painelTitulo: { fontSize: 20, fontWeight: 800, lineHeight: 1.3 },
  painelInfoRow: { display: "flex", gap: 20, fontSize: 12, color: "#6b7280", margin: "14px 0", flexWrap: "wrap" },
  painelDivider: { height: 1, background: "#1c202b", margin: "16px 0" },
  painelCorpo: { fontSize: 14, color: "#9ca3af", lineHeight: 1.8, whiteSpace: "pre-wrap" },
  btnArquivarPainel: { padding: "7px 14px", border: "1px solid #252a38", borderRadius: 8, background: "none", color: "#6b7280", fontFamily: "inherit", fontSize: 12, cursor: "pointer", flexShrink: 0 },
  toast: { position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", zIndex: 999 },
  toastOk:   { background: "#15181f", borderLeft: "4px solid #34d399", color: "#e8eaf0" },
  toastErro: { background: "#15181f", borderLeft: "4px solid #f87171", color: "#e8eaf0" },
};