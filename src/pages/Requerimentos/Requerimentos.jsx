import { useState } from "react";

const DOCS = [
  {
    id: "declaracao-matricula",
    titulo: "Declaração de Matrícula",
    descricao: "Comprova que o aluno está regularmente matriculado na instituição.",
    icon: "🎓",
    cor: "#5b6cff",
  },
  {
    id: "historico-escolar",
    titulo: "Histórico Escolar",
    descricao: "Lista todas as disciplinas cursadas com notas, faltas e situação.",
    icon: "📊",
    cor: "#a78bfa",
  },
  {
    id: "atestado-frequencia",
    titulo: "Atestado de Frequência",
    descricao: "Informa a frequência geral do aluno no período letivo vigente.",
    icon: "📅",
    cor: "#34d399",
  },
];

export default function Requerimentos({ alunoId }) {
  const [loadingId, setLoadingId] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function baixarDoc(doc) {
    setLoadingId(doc.id);
    try {
      const res = await fetch(`/alunos/${alunoId}/requerimentos/${doc.id}`);
      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.id}_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      const registro = {
        id: Date.now(),
        titulo: doc.titulo,
        hora: new Date().toLocaleString("pt-BR"),
      };
      setHistorico(prev => [registro, ...prev].slice(0, 10));
      showToast(`${doc.titulo} gerado com sucesso!`);
    } catch {
      showToast("Erro ao gerar documento. Tente novamente.", "erro");
    }
    setLoadingId(null);
  }

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>RQ</div>
          <div>
            <div style={S.headerTitle}>Requerimento de Documentos</div>
            <div style={S.headerSub}>Portal Acadêmico</div>
          </div>
        </div>
      </header>

      <div style={S.page}>
        <p style={S.intro}>
          Selecione o documento desejado. O PDF será gerado automaticamente com seus dados e iniciará o download.
        </p>

        {/* CARDS DE DOCUMENTOS */}
        <div style={S.grid}>
          {DOCS.map(doc => (
            <div key={doc.id} style={S.docCard}>
              <div style={{ ...S.docIcon, background: doc.cor + "22", color: doc.cor }}>
                {doc.icon}
              </div>
              <div style={S.docInfo}>
                <div style={S.docTitulo}>{doc.titulo}</div>
                <div style={S.docDesc}>{doc.descricao}</div>
              </div>
              <button
                style={{ ...S.btnDownload, background: `linear-gradient(135deg, ${doc.cor}, ${doc.cor}cc)`, ...(loadingId === doc.id ? S.btnDisabled : {}) }}
                onClick={() => baixarDoc(doc)}
                disabled={!!loadingId}
              >
                {loadingId === doc.id
                  ? <><Spinner /> Gerando...</>
                  : <> ⬇ Baixar PDF</>}
              </button>
            </div>
          ))}
        </div>

        {/* HISTÓRICO DA SESSÃO */}
        {historico.length > 0 && (
          <div style={S.historicoBox}>
            <div style={S.historicoTitulo}>📋 Documentos baixados nesta sessão</div>
            {historico.map(h => (
              <div key={h.id} style={S.historicoRow}>
                <span style={{ color: "#34d399" }}>✔</span>
                <span style={{ flex: 1 }}>{h.titulo}</span>
                <span style={{ color: "#6b7280", fontSize: 12 }}>{h.hora}</span>
              </div>
            ))}
          </div>
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

function Spinner() {
  return (
    <div style={{
      width: 13, height: 13,
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      display: "inline-block",
      verticalAlign: "middle",
      marginRight: 7,
    }} />
  );
}

const S = {
  root: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#e8eaf0" },
  header: { background: "#15181f", borderBottom: "1px solid #252a38", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#fbbf24,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  page: { maxWidth: 800, margin: "0 auto", padding: "36px 20px" },
  intro: { fontSize: 14, color: "#9ca3af", marginBottom: 28, lineHeight: 1.6 },
  grid: { display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 },
  docCard: { background: "#15181f", border: "1px solid #252a38", borderRadius: 14, padding: "22px 24px", display: "flex", alignItems: "center", gap: 18, transition: "border-color 0.2s" },
  docIcon: { width: 52, height: 52, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 },
  docInfo: { flex: 1 },
  docTitulo: { fontWeight: 700, fontSize: 15, marginBottom: 4 },
  docDesc: { fontSize: 13, color: "#6b7280", lineHeight: 1.5 },
  btnDownload: { padding: "10px 20px", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, whiteSpace: "nowrap" },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  historicoBox: { background: "#15181f", border: "1px solid #252a38", borderRadius: 12, padding: "20px 24px" },
  historicoTitulo: { fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 },
  historicoRow: { display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #1c202b", fontSize: 13 },
  toast: { position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", zIndex: 999 },
  toastOk:   { background: "#15181f", borderLeft: "4px solid #34d399", color: "#e8eaf0" },
  toastErro: { background: "#15181f", borderLeft: "4px solid #f87171", color: "#e8eaf0" },
};