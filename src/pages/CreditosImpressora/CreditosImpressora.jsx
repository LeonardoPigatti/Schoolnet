import { useState, useEffect } from "react";

const PACOTES = [
  { id: 10,  creditos: 10,  preco: 2.00,  label: "Básico",    popular: false },
  { id: 25,  creditos: 25,  preco: 4.50,  label: "Popular",   popular: true  },
  { id: 50,  creditos: 50,  preco: 8.00,  label: "Econômico", popular: false },
  { id: 100, creditos: 100, preco: 14.00, label: "Premium",   popular: false },
];

const FORMAS = [
  { id: "PIX",    icon: "⚡", label: "PIX",    desc: "Aprovação imediata" },
  { id: "Cartão", icon: "💳", label: "Cartão", desc: "Crédito ou débito"  },
];

export default function CreditoImpressao({ alunoId }) {
  const API = `/alunos/${alunoId}/creditos`;

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comprando, setComprando] = useState(false);
  const [tab, setTab] = useState("comprar");
  const [pacoteSel, setPacoteSel] = useState(25);
  const [formaPag, setFormaPag] = useState("PIX");
  const [toast, setToast] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => { fetchDados(); }, []);

  async function fetchDados() {
    setLoading(true);
    try {
      const r = await fetch(API);
      const d = await r.json();
      setDados(d);
    } catch {
      setDados({ saldo: 0, transacoes: [] });
    }
    setLoading(false);
  }

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function confirmarCompra() {
    setComprando(true);
    try {
      const r = await fetch(`${API}/comprar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: pacoteSel, formaPagamento: formaPag }),
      });
      const d = await r.json();
      if (d.erro) throw new Error(d.erro);
      setDados(d.credito);
      showToast(`${pacoteSel} créditos adicionados com sucesso!`);
      setConfirmando(false);
      setTab("historico");
    } catch {
      // demo
      setDados(prev => ({
        ...prev,
        saldo: (prev?.saldo || 0) + pacoteSel,
        transacoes: [
          {
            _id: `demo-${Date.now()}`,
            tipo: "Recarga",
            quantidade: pacoteSel,
            descricao: `Recarga de ${pacoteSel} créditos`,
            formaPagamento: formaPag,
            status: "Confirmado",
            criadoEm: new Date().toISOString(),
          },
          ...(prev?.transacoes || []),
        ],
      }));
      showToast(`${pacoteSel} créditos adicionados! (demo)`);
      setConfirmando(false);
      setTab("historico");
    }
    setComprando(false);
  }

  const pacote = PACOTES.find(p => p.id === pacoteSel);
  const transacoes = [...(dados?.transacoes || [])].reverse();
  const recargas = transacoes.filter(t => t.tipo === "Recarga" && t.status === "Confirmado").reduce((a, t) => a + t.quantidade, 0);
  const usos = transacoes.filter(t => t.tipo === "Uso").reduce((a, t) => a + t.quantidade, 0);

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>🖨</div>
          <div>
            <div style={S.headerTitle}>Créditos de Impressão</div>
            <div style={S.headerSub}>Portal Acadêmico</div>
          </div>
        </div>
        {!loading && (
          <div style={S.saldoPill}>
            🖨 <strong style={{ marginLeft: 6 }}>{dados?.saldo || 0}</strong>&nbsp;páginas disponíveis
          </div>
        )}
      </header>

      <div style={S.page}>
        {loading ? (
          <div style={S.center}><Spinner large /></div>
        ) : (
          <>
            {/* STATS */}
            <div style={S.statsRow}>
              <div style={{ ...S.statCard, borderColor: "#5b6cff44" }}>
                <div style={S.statLabel}>Saldo Atual</div>
                <div style={{ ...S.statVal, color: "#5b6cff" }}>{dados?.saldo || 0}</div>
                <div style={S.statSub}>páginas</div>
              </div>
              <div style={{ ...S.statCard, borderColor: "#34d39944" }}>
                <div style={S.statLabel}>Total Recarregado</div>
                <div style={{ ...S.statVal, color: "#34d399" }}>{recargas}</div>
                <div style={S.statSub}>créditos</div>
              </div>
              <div style={{ ...S.statCard, borderColor: "#fbbf2444" }}>
                <div style={S.statLabel}>Total Utilizado</div>
                <div style={{ ...S.statVal, color: "#fbbf24" }}>{usos}</div>
                <div style={S.statSub}>páginas impressas</div>
              </div>
            </div>

            {/* TABS */}
            <div style={S.tabs}>
              {[["comprar","🛒 Comprar"],["historico","📋 Histórico"]].map(([id, label]) => (
                <button key={id} style={{ ...S.tab, ...(tab === id ? S.tabActive : {}) }}
                  onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>

            {/* TAB COMPRAR */}
            {tab === "comprar" && !confirmando && (
              <div>
                <div style={S.sectionLabel}>Escolha um pacote</div>
                <div style={S.pacotesGrid}>
                  {PACOTES.map(p => (
                    <div key={p.id}
                      style={{ ...S.pacoteCard, ...(pacoteSel === p.id ? S.pacoteAtivo : {}), ...(p.popular ? S.pacotePopular : {}) }}
                      onClick={() => setPacoteSel(p.id)}
                    >
                      {p.popular && <div style={S.popularTag}>⭐ Mais popular</div>}
                      <div style={S.pacoteLabel}>{p.label}</div>
                      <div style={S.pacoteCreditos}>{p.creditos}</div>
                      <div style={S.pacotePaginas}>páginas</div>
                      <div style={S.pacotePreco}>R$ {p.preco.toFixed(2)}</div>
                      <div style={S.pacotePorPag}>R$ {(p.preco / p.creditos).toFixed(2)}/pág</div>
                    </div>
                  ))}
                </div>

                <div style={S.sectionLabel}>Forma de pagamento</div>
                <div style={S.formasRow}>
                  {FORMAS.map(f => (
                    <div key={f.id}
                      style={{ ...S.formaCard, ...(formaPag === f.id ? S.formaAtiva : {}) }}
                      onClick={() => setFormaPag(f.id)}
                    >
                      <span style={{ fontSize: 24 }}>{f.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{f.label}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{f.desc}</div>
                      </div>
                      <div style={{ ...S.radioCircle, ...(formaPag === f.id ? S.radioAtivo : {}) }} />
                    </div>
                  ))}
                </div>

                <div style={S.resumoBox}>
                  <div style={S.resumoRow}>
                    <span style={{ color: "#9ca3af" }}>Pacote selecionado</span>
                    <span>{pacote?.creditos} créditos ({pacote?.label})</span>
                  </div>
                  <div style={S.resumoRow}>
                    <span style={{ color: "#9ca3af" }}>Forma de pagamento</span>
                    <span>{formaPag}</span>
                  </div>
                  <div style={{ ...S.resumoRow, borderTop: "1px solid #252a38", paddingTop: 12, marginTop: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                    <span style={{ fontWeight: 800, fontSize: 18, color: "#34d399" }}>R$ {pacote?.preco.toFixed(2)}</span>
                  </div>
                </div>

                <button style={S.btnComprar} onClick={() => setConfirmando(true)}>
                  🛒 Continuar para pagamento
                </button>
              </div>
            )}

            {/* CONFIRMAR COMPRA */}
            {tab === "comprar" && confirmando && (
              <div style={S.confirmCard}>
                <div style={{ fontSize: 48, marginBottom: 16, textAlign: "center" }}>
                  {formaPag === "PIX" ? "⚡" : "💳"}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, textAlign: "center", marginBottom: 6 }}>
                  Confirmar pagamento
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", textAlign: "center", marginBottom: 28 }}>
                  {formaPag === "PIX" ? "Escaneie o QR code ou copie a chave PIX abaixo" : "Insira os dados do cartão"}
                </div>

                {formaPag === "PIX" && (
                  <div style={S.pixBox}>
                    <div style={S.pixQR}>
                      {/* QR fake */}
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div key={i} style={{ width: 10, height: 10, background: Math.random() > 0.5 ? "#0d0f14" : "transparent", borderRadius: 1 }} />
                      ))}
                    </div>
                    <div style={S.pixChave}>schoolnet@pix.com.br</div>
                    <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center" }}>Chave PIX da instituição</div>
                  </div>
                )}

                <div style={S.confirmResumo}>
                  <span>💳 {pacote?.creditos} créditos por <strong>R$ {pacote?.preco.toFixed(2)}</strong></span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
                  <button style={S.btnCancelar} onClick={() => setConfirmando(false)}>← Voltar</button>
                  <button
                    style={{ ...S.btnConfirmar, ...(comprando ? S.btnDisabled : {}) }}
                    onClick={confirmarCompra} disabled={comprando}
                  >
                    {comprando ? <><Spinner /> Processando...</> : "✔ Confirmar"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB HISTÓRICO */}
            {tab === "historico" && (
              <div style={S.card}>
                <div style={S.sectionLabel}>Movimentações</div>
                {!transacoes.length ? (
                  <div style={S.empty}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🧾</div>
                    <p style={{ color: "#6b7280", fontSize: 13 }}>Nenhuma movimentação ainda.</p>
                  </div>
                ) : (
                  transacoes.map((t, i) => (
                    <div key={t._id || i} style={{ ...S.transRow, borderBottom: i < transacoes.length - 1 ? "1px solid #1c202b" : "none" }}>
                      <div style={{ ...S.transIcon, background: t.tipo === "Recarga" ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)" }}>
                        {t.tipo === "Recarga" ? "⬆" : "🖨"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.descricao || t.tipo}</div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                          {t.formaPagamento && <span>{t.formaPagamento} · </span>}
                          {new Date(t.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: t.tipo === "Recarga" ? "#34d399" : "#f87171" }}>
                          {t.tipo === "Recarga" ? "+" : "-"}{t.quantidade}
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>páginas</div>
                      </div>
                      <div style={{ ...S.statusBadge, ...(t.status === "Confirmado" ? S.badgeOk : t.status === "Pendente" ? S.badgePend : S.badgeErr) }}>
                        {t.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <div style={{ ...S.toast, ...(toast.type === "erro" ? S.toastErro : S.toastOk) }}>
          {toast.type === "erro" ? "⚠ " : "✔ "}{toast.msg}
        </div>
      )}
    </div>
  );
}

function Spinner({ large }) {
  return (
    <div style={{
      width: large ? 32 : 13, height: large ? 32 : 13,
      border: "2px solid rgba(255,255,255,0.15)",
      borderTopColor: large ? "#5b6cff" : "#fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      display: "inline-block", verticalAlign: "middle",
      marginRight: large ? 0 : 8,
    }} />
  );
}

const S = {
  root: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#e8eaf0" },
  header: { background: "#15181f", borderBottom: "1px solid #252a38", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  saldoPill: { background: "linear-gradient(135deg,#1c202b,#252a38)", border: "1px solid #252a38", padding: "8px 18px", borderRadius: 999, fontSize: 13, display: "flex", alignItems: "center" },
  page: { maxWidth: 720, margin: "0 auto", padding: "32px 20px" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 },
  statCard: { background: "#15181f", border: "1px solid", borderRadius: 12, padding: "18px 20px" },
  statLabel: { fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 },
  statVal: { fontSize: 32, fontWeight: 800, lineHeight: 1 },
  statSub: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  tabs: { display: "flex", gap: 4, background: "#15181f", border: "1px solid #252a38", borderRadius: 10, padding: 4, marginBottom: 24 },
  tab: { flex: 1, padding: "9px", border: "none", borderRadius: 8, background: "none", color: "#6b7280", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  tabActive: { background: "#1c202b", color: "#e8eaf0" },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 },
  pacotesGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 },
  pacoteCard: { background: "#15181f", border: "2px solid #252a38", borderRadius: 12, padding: "18px 14px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", position: "relative" },
  pacoteAtivo: { borderColor: "#5b6cff", background: "rgba(91,108,255,0.08)" },
  pacotePopular: { borderColor: "#fbbf2466" },
  popularTag: { position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "#fbbf24", color: "#0d0f14", fontSize: 10, fontWeight: 800, padding: "2px 10px", borderRadius: 999, whiteSpace: "nowrap" },
  pacoteLabel: { fontSize: 11, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" },
  pacoteCreditos: { fontSize: 36, fontWeight: 800, color: "#e8eaf0", lineHeight: 1 },
  pacotePaginas: { fontSize: 11, color: "#6b7280", marginBottom: 10 },
  pacotePreco: { fontSize: 16, fontWeight: 700, color: "#34d399" },
  pacotePorPag: { fontSize: 10, color: "#6b7280", marginTop: 2 },
  formasRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 },
  formaCard: { background: "#15181f", border: "2px solid #252a38", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "all 0.2s" },
  formaAtiva: { borderColor: "#5b6cff", background: "rgba(91,108,255,0.08)" },
  radioCircle: { width: 18, height: 18, borderRadius: "50%", border: "2px solid #252a38", marginLeft: "auto", flexShrink: 0 },
  radioAtivo: { border: "5px solid #5b6cff" },
  resumoBox: { background: "#15181f", border: "1px solid #252a38", borderRadius: 12, padding: "18px 20px", marginBottom: 20 },
  resumoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", fontSize: 13 },
  btnComprar: { width: "100%", padding: "14px", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#5b6cff,#a78bfa)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  confirmCard: { background: "#15181f", border: "1px solid #252a38", borderRadius: 16, padding: "32px 28px" },
  pixBox: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 20 },
  pixQR: { display: "grid", gridTemplateColumns: "repeat(7,10px)", gap: 2, padding: 12, background: "#fff", borderRadius: 8 },
  pixChave: { background: "#1c202b", border: "1px solid #252a38", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "#5b6cff", letterSpacing: 0.5 },
  confirmResumo: { background: "#1c202b", borderRadius: 10, padding: "14px 18px", textAlign: "center", fontSize: 14 },
  btnCancelar: { padding: "12px", border: "1px solid #252a38", borderRadius: 10, background: "none", color: "#9ca3af", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnConfirmar: { padding: "12px", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#34d399,#059669)", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  card: { background: "#15181f", border: "1px solid #252a38", borderRadius: 14, padding: "22px 24px" },
  empty: { textAlign: "center", padding: "40px 0" },
  transRow: { display: "flex", alignItems: "center", gap: 14, padding: "14px 0" },
  transIcon: { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  statusBadge: { padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, flexShrink: 0 },
  badgeOk:   { background: "rgba(52,211,153,0.12)",  color: "#34d399" },
  badgePend: { background: "rgba(251,191,36,0.12)",  color: "#fbbf24" },
  badgeErr:  { background: "rgba(248,113,113,0.12)", color: "#f87171" },
  toast: { position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", zIndex: 999 },
  toastOk:   { background: "#15181f", borderLeft: "4px solid #34d399", color: "#e8eaf0" },
  toastErro: { background: "#15181f", borderLeft: "4px solid #f87171", color: "#e8eaf0" },
};