import { useState, useEffect } from "react";

export default function Diploma({ alunoId }) {
  const API = `/alunos/${alunoId}/diploma`;

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { verificar(); }, []);

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function verificar() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/verificar`);
      const d = await r.json();
      setDados(d);
    } catch {
      setDados({
        apto: false,
        aluno: "—",
        curso: "—",
        checklist: {
          disciplinas: { ok: false, aprovadas: 0, total: 0 },
          estagio: { ok: false, status: "Não cadastrado" },
          atividadesComplementares: { ok: false, horas: 0, minimo: 200 },
        },
      });
    }
    setLoading(false);
  }

  async function gerarDiploma() {
    setGerando(true);
    try {
      const res = await fetch(`${API}/gerar`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.erro || "Erro");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diploma_${dados?.aluno?.replace(/ /g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Diploma gerado com sucesso!");
    } catch (e) {
      showToast(e.message || "Erro ao gerar diploma.", "erro");
    }
    setGerando(false);
  }

  const cl = dados?.checklist;

  const itens = cl ? [
    {
      label: "Disciplinas Aprovadas",
      ok: cl.disciplinas.ok,
      detalhe: `${cl.disciplinas.aprovadas} de ${cl.disciplinas.total} aprovadas`,
      icon: "📚",
    },
    {
      label: "Estágio Concluído",
      ok: cl.estagio.ok,
      detalhe: `Status atual: ${cl.estagio.status}`,
      icon: "🏢",
    },
    {
      label: "Atividades Complementares",
      ok: cl.atividadesComplementares.ok,
      detalhe: `${cl.atividadesComplementares.horas}h de ${cl.atividadesComplementares.minimo}h mínimas`,
      icon: "🎯",
    },
  ] : [];

  const totalOk = itens.filter(i => i.ok).length;

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>🎓</div>
          <div>
            <div style={S.headerTitle}>Diploma de Graduação</div>
            <div style={S.headerSub}>Portal Acadêmico</div>
          </div>
        </div>
      </header>

      <div style={S.page}>
        {loading ? (
          <div style={S.center}><Spinner large /><p style={{ color: "#6b7280", marginTop: 16 }}>Verificando requisitos...</p></div>
        ) : (
          <>
            {/* HERO */}
            <div style={{ ...S.heroCard, ...(dados?.apto ? S.heroApto : S.heroNaoApto) }}>
              <div style={S.heroIcon}>{dados?.apto ? "🎓" : "⏳"}</div>
              <div>
                <div style={S.heroNome}>{dados?.aluno}</div>
                <div style={S.heroCurso}>{dados?.curso}</div>
                <div style={{ ...S.heroBadge, ...(dados?.apto ? S.badgeApto : S.badgePendente) }}>
                  {dados?.apto ? "✔ Apto para emissão do diploma" : `${totalOk}/3 requisitos concluídos`}
                </div>
              </div>
            </div>

            {/* CHECKLIST */}
            <div style={S.checkCard}>
              <div style={S.sectionLabel}>Checklist de Requisitos</div>
              {itens.map((item, i) => (
                <div key={i} style={{ ...S.checkRow, borderBottom: i < itens.length - 1 ? "1px solid #1c202b" : "none" }}>
                  <div style={{ ...S.checkCircle, ...(item.ok ? S.checkOk : S.checkPending) }}>
                    {item.ok ? "✓" : "○"}
                  </div>
                  <div style={{ fontSize: 22 }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={S.checkLabel}>{item.label}</div>
                    <div style={S.checkDetalhe}>{item.detalhe}</div>
                  </div>
                  <div style={{ ...S.checkStatus, ...(item.ok ? S.statusOk : S.statusPending) }}>
                    {item.ok ? "Concluído" : "Pendente"}
                  </div>
                </div>
              ))}
            </div>

            {/* PROGRESS BAR */}
            <div style={S.progressCard}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>Progresso para formatura</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>{Math.round((totalOk / 3) * 100)}%</span>
              </div>
              <div style={S.track}>
                <div style={{ ...S.bar, width: `${(totalOk / 3) * 100}%`, background: dados?.apto ? "linear-gradient(90deg,#34d399,#059669)" : "linear-gradient(90deg,#5b6cff,#a78bfa)" }} />
              </div>
            </div>

            {/* BOTÃO */}
            {dados?.apto ? (
              <button
                style={{ ...S.btnDiploma, ...(gerando ? S.btnDisabled : {}) }}
                onClick={gerarDiploma}
                disabled={gerando}
              >
                {gerando ? <><Spinner /> Gerando diploma...</> : "🎓 Emitir e Baixar Diploma"}
              </button>
            ) : (
              <div style={S.bloqueadoBox}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>🔒</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Diploma bloqueado</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Conclua todos os requisitos acima para liberar a emissão do diploma.
                </div>
              </div>
            )}

            <button style={S.btnRecarregar} onClick={verificar}>🔄 Verificar novamente</button>
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
      width: large ? 36 : 14, height: large ? 36 : 14,
      border: "2px solid rgba(255,255,255,0.15)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      display: "inline-block", verticalAlign: "middle",
      marginRight: large ? 0 : 8,
    }} />
  );
}

const S = {
  root: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#e8eaf0" },
  header: { background: "#15181f", borderBottom: "1px solid #252a38", padding: "16px 28px", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#fbbf24,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  page: { maxWidth: 680, margin: "0 auto", padding: "36px 20px" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh" },

  heroCard: { borderRadius: 16, padding: "32px 28px", display: "flex", alignItems: "center", gap: 24, marginBottom: 20, border: "1px solid" },
  heroApto: { background: "linear-gradient(135deg,rgba(52,211,153,0.1),rgba(5,150,105,0.05))", borderColor: "#34d39944" },
  heroNaoApto: { background: "linear-gradient(135deg,rgba(91,108,255,0.08),rgba(167,139,250,0.05))", borderColor: "#5b6cff44" },
  heroIcon: { fontSize: 52, flexShrink: 0 },
  heroNome: { fontSize: 22, fontWeight: 800, marginBottom: 4 },
  heroCurso: { fontSize: 14, color: "#9ca3af", marginBottom: 12 },
  heroBadge: { display: "inline-block", padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700 },
  badgeApto: { background: "rgba(52,211,153,0.15)", color: "#34d399" },
  badgePendente: { background: "rgba(251,191,36,0.15)", color: "#fbbf24" },

  checkCard: { background: "#15181f", border: "1px solid #252a38", borderRadius: 14, padding: "22px 24px", marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 },
  checkRow: { display: "flex", alignItems: "center", gap: 16, padding: "16px 0" },
  checkCircle: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 },
  checkOk: { background: "rgba(52,211,153,0.15)", color: "#34d399" },
  checkPending: { background: "rgba(107,114,128,0.15)", color: "#6b7280" },
  checkLabel: { fontWeight: 700, fontSize: 14, marginBottom: 3 },
  checkDetalhe: { fontSize: 12, color: "#6b7280" },
  checkStatus: { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 },
  statusOk: { background: "rgba(52,211,153,0.12)", color: "#34d399" },
  statusPending: { background: "rgba(251,191,36,0.12)", color: "#fbbf24" },

  progressCard: { background: "#15181f", border: "1px solid #252a38", borderRadius: 14, padding: "20px 24px", marginBottom: 20 },
  track: { background: "#1c202b", borderRadius: 999, height: 10, overflow: "hidden" },
  bar: { height: "100%", borderRadius: 999, transition: "width 0.6s ease" },

  btnDiploma: { width: "100%", padding: "16px", border: "none", borderRadius: 12, background: "linear-gradient(135deg,#34d399,#059669)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12, letterSpacing: 0.3 },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  bloqueadoBox: { background: "#15181f", border: "1px dashed #252a38", borderRadius: 12, padding: "28px", textAlign: "center", marginBottom: 12 },
  btnRecarregar: { width: "100%", padding: "11px", border: "1px solid #252a38", borderRadius: 10, background: "none", color: "#6b7280", fontFamily: "inherit", fontSize: 13, cursor: "pointer" },

  toast: { position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", zIndex: 999 },
  toastOk:   { background: "#15181f", borderLeft: "4px solid #34d399", color: "#e8eaf0" },
  toastErro: { background: "#15181f", borderLeft: "4px solid #f87171", color: "#e8eaf0" },
};