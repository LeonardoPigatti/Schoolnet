import { useState, useEffect } from "react";

const CAT_STYLE = {
  "Evento":              { icon: "🎪", cor: "#a78bfa", bg: "rgba(167,139,250,0.10)" },
  "Conquista Acadêmica": { icon: "🏆", cor: "#fbbf24", bg: "rgba(251,191,36,0.10)"  },
  "Outro":               { icon: "📋", cor: "#6b7280", bg: "rgba(107,114,128,0.10)" },
};

export default function Certificados({ alunoId }) {
  const API = `/alunos/${alunoId}/certificados`;

  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchCertificados(); }, []);

  async function fetchCertificados() {
    setLoading(true);
    try {
      const r = await fetch(API);
      const d = await r.json();
      setCertificados(Array.isArray(d) ? d : []);
    } catch {
      setCertificados([]);
    }
    setLoading(false);
  }

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function baixar(cert) {
    if (!cert.arquivo?.dados) return;
    const byteChars = atob(cert.arquivo.dados);
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
    const blob = new Blob([bytes], { type: cert.arquivo.mimeType || "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = cert.arquivo.nome || `${cert.titulo}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Download iniciado!");
  }

  const categorias = ["Todos", "Evento", "Conquista Acadêmica", "Outro"];
  const filtrados = filtro === "Todos" ? certificados : certificados.filter(c => c.categoria === filtro);

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>🎓</div>
          <div>
            <div style={S.headerTitle}>Meus Certificados</div>
            <div style={S.headerSub}>Portal Acadêmico</div>
          </div>
        </div>
        <div style={S.contadorPill}>
          {certificados.length} certificado{certificados.length !== 1 ? "s" : ""}
        </div>
      </header>

      <div style={S.page}>
        {/* FILTROS */}
        <div style={S.filtros}>
          {categorias.map(cat => (
            <button
              key={cat}
              style={{ ...S.filtrBtn, ...(filtro === cat ? S.filtrAtivo : {}) }}
              onClick={() => setFiltro(cat)}
            >
              {cat !== "Todos" && CAT_STYLE[cat]?.icon + " "}
              {cat}
              {cat !== "Todos" && (
                <span style={S.filtrCount}>
                  {certificados.filter(c => c.categoria === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={S.center}><Spinner /></div>
        ) : filtrados.length === 0 ? (
          <div style={S.emptyCard}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {filtro === "Todos" ? "Nenhum certificado ainda" : `Nenhum certificado de ${filtro}`}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, maxWidth: 340 }}>
              {filtro === "Todos"
                ? "Seus certificados aparecerão aqui conforme forem emitidos pela secretaria acadêmica."
                : "Tente selecionar outra categoria ou aguarde a emissão pela secretaria."}
            </div>
          </div>
        ) : (
          <div style={S.grid}>
            {filtrados.map(cert => {
              const cat = CAT_STYLE[cert.categoria] || CAT_STYLE["Outro"];
              const data = new Date(cert.dataEmissao).toLocaleDateString("pt-BR", {
                day: "2-digit", month: "long", year: "numeric",
              });

              return (
                <div key={cert._id} style={S.card}>
                  <div style={{ ...S.cardIconBox, background: cat.bg }}>
                    <span style={{ fontSize: 28 }}>{cat.icon}</span>
                  </div>

                  <div style={S.cardBody}>
                    <div style={{ ...S.catTag, color: cat.cor, background: cat.bg }}>
                      {cert.categoria}
                    </div>
                    <div style={S.cardTitulo}>{cert.titulo}</div>
                    {cert.descricao && (
                      <div style={S.cardDesc}>{cert.descricao}</div>
                    )}
                    <div style={S.cardMeta}>
                      <span>📅 {data}</span>
                      {cert.emitidoPor && <span>🏛 {cert.emitidoPor}</span>}
                    </div>
                  </div>

                  <div style={S.cardActions}>
                    {cert.arquivo?.dados ? (
                      <button style={S.btnBaixar} onClick={() => baixar(cert)}>
                        ⬇ Baixar
                      </button>
                    ) : (
                      <div style={S.semArquivo}>Sem arquivo</div>
                    )}
                  </div>
                </div>
              );
            })}
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
      width: 32, height: 32,
      border: "3px solid rgba(255,255,255,0.1)",
      borderTopColor: "#5b6cff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

const S = {
  root: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#e8eaf0" },
  header: { background: "#15181f", borderBottom: "1px solid #252a38", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#fbbf24,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  contadorPill: { background: "#1c202b", border: "1px solid #252a38", padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600 },
  page: { maxWidth: 900, margin: "0 auto", padding: "32px 20px" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" },
  filtros: { display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" },
  filtrBtn: { padding: "7px 16px", border: "1px solid #252a38", borderRadius: 999, background: "none", color: "#6b7280", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" },
  filtrAtivo: { background: "#1c202b", borderColor: "#5b6cff", color: "#e8eaf0" },
  filtrCount: { background: "#252a38", borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 700 },
  emptyCard: { background: "#15181f", border: "1px dashed #252a38", borderRadius: 16, padding: "64px 32px", textAlign: "center" },
  grid: { display: "flex", flexDirection: "column", gap: 12 },
  card: { background: "#15181f", border: "1px solid #252a38", borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "center", gap: 18, transition: "border-color 0.2s" },
  cardIconBox: { width: 56, height: 56, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardBody: { flex: 1, minWidth: 0 },
  catTag: { display: "inline-block", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999, marginBottom: 6 },
  cardTitulo: { fontSize: 15, fontWeight: 700, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: "#9ca3af", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cardMeta: { display: "flex", gap: 16, fontSize: 12, color: "#6b7280" },
  cardActions: { flexShrink: 0 },
  btnBaixar: { padding: "8px 18px", border: "none", borderRadius: 8, background: "linear-gradient(135deg,#5b6cff,#a78bfa)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  semArquivo: { fontSize: 12, color: "#6b7280", fontStyle: "italic" },
  toast: { position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", zIndex: 999 },
  toastOk:   { background: "#15181f", borderLeft: "4px solid #34d399", color: "#e8eaf0" },
  toastErro: { background: "#15181f", borderLeft: "4px solid #f87171", color: "#e8eaf0" },
};