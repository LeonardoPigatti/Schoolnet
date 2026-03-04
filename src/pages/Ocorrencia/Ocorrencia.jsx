import { useState, useEffect } from "react";

const TIPO_STYLE = {
  "Comportamento":     { icon: "😤", cor: "#f87171" },
  "Indisciplina":      { icon: "⚡", cor: "#fb923c" },
  "Atraso":            { icon: "⏰", cor: "#fbbf24" },
  "Uso de Celular":    { icon: "📱", cor: "#a78bfa" },
  "Fraude Acadêmica":  { icon: "📋", cor: "#f43f5e" },
  "Outro":             { icon: "📌", cor: "#6b7280" },
};

const STATUS_STYLE = {
  "Pendente":    { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24" },
  "Em Análise":  { bg: "rgba(91,108,255,0.12)",  color: "#5b6cff" },
  "Resolvida":   { bg: "rgba(52,211,153,0.12)",  color: "#34d399" },
  "Contestada":  { bg: "rgba(251,146,60,0.12)",  color: "#fb923c" },
};

const PUNICAO_STYLE = {
  "Sem Punição":                   { icon: "✅", cor: "#34d399" },
  "Advertência Verbal":            { icon: "🗣",  cor: "#fbbf24" },
  "Advertência Escrita":           { icon: "📝",  cor: "#fb923c" },
  "Suspensão":                     { icon: "🚫",  cor: "#f87171" },
  "Encaminhamento à Coordenação":  { icon: "🏫",  cor: "#a78bfa" },
  "Expulsão":                      { icon: "❌",  cor: "#f43f5e" },
};

export default function Ocorrencias({ alunoId }) {
  const API = `/alunos/${alunoId}/ocorrencias`;

  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const [contestandoId, setContestandoId] = useState(null);
  const [textoContestacao, setTextoContestacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [expandidoId, setExpandidoId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchOcorrencias(); }, []);

  async function fetchOcorrencias() {
    setLoading(true);
    try {
      const r = await fetch(API);
      const d = await r.json();
      setOcorrencias(Array.isArray(d) ? d : []);
    } catch {
      setOcorrencias([]);
    }
    setLoading(false);
  }

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function enviarContestacao(ocId) {
    if (!textoContestacao.trim()) {
      showToast("Escreva o texto da contestação.", "erro"); return;
    }
    setEnviando(true);
    try {
      const r = await fetch(`${API}/${ocId}/contestar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: textoContestacao }),
      });
      const d = await r.json();
      if (d.erro) throw new Error(d.erro);
      setOcorrencias(prev => prev.map(o => o._id === ocId ? d.oc : o));
      showToast("Contestação enviada com sucesso!");
    } catch {
      setOcorrencias(prev => prev.map(o =>
        o._id === ocId
          ? { ...o, status: "Contestada", contestacao: { texto: textoContestacao, dataEnvio: new Date().toISOString() } }
          : o
      ));
      showToast("Contestação enviada! (demo)");
    }
    setContestandoId(null);
    setTextoContestacao("");
    setEnviando(false);
  }

  const statusFiltros = ["Todos", "Pendente", "Em Análise", "Resolvida", "Contestada"];
  const filtradas = filtro === "Todos" ? ocorrencias : ocorrencias.filter(o => o.status === filtro);

  const pendentes = ocorrencias.filter(o => o.status === "Pendente").length;
  const graves = ocorrencias.filter(o => ["Suspensão", "Expulsão"].includes(o.punicao)).length;

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>⚠️</div>
          <div>
            <div style={S.headerTitle}>Minhas Ocorrências</div>
            <div style={S.headerSub}>Portal Acadêmico</div>
          </div>
        </div>
        {ocorrencias.length > 0 && (
          <div style={{ ...S.pill, background: pendentes > 0 ? "rgba(248,113,113,0.15)" : "rgba(52,211,153,0.12)", color: pendentes > 0 ? "#f87171" : "#34d399", border: `1px solid ${pendentes > 0 ? "#f8717133" : "#34d39933"}` }}>
            {pendentes > 0 ? `⚠ ${pendentes} pendente${pendentes > 1 ? "s" : ""}` : "✔ Tudo resolvido"}
          </div>
        )}
      </header>

      <div style={S.page}>

        {/* STATS */}
        {ocorrencias.length > 0 && (
          <div style={S.statsRow}>
            {[
              { label: "Total",      value: ocorrencias.length,  cor: "#e8eaf0" },
              { label: "Pendentes",  value: pendentes,            cor: "#fbbf24" },
              { label: "Resolvidas", value: ocorrencias.filter(o => o.status === "Resolvida").length, cor: "#34d399" },
              { label: "Graves",     value: graves,               cor: "#f87171" },
            ].map(s => (
              <div key={s.label} style={S.statCard}>
                <div style={S.statLabel}>{s.label}</div>
                <div style={{ ...S.statVal, color: s.cor }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* AVISO GRAVE */}
        {graves > 0 && (
          <div style={S.avisoGrave}>
            <span style={{ fontSize: 20 }}>🚨</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Atenção — ocorrência grave registrada</div>
              <div style={{ fontSize: 12, color: "#fca5a5", marginTop: 2 }}>
                Você possui {graves} ocorrência{graves > 1 ? "s" : ""} com punição grave (suspensão ou expulsão). Procure a coordenação.
              </div>
            </div>
          </div>
        )}

        {/* FILTROS */}
        <div style={S.filtros}>
          {statusFiltros.map(f => (
            <button key={f} style={{ ...S.filtrBtn, ...(filtro === f ? S.filtrAtivo : {}) }}
              onClick={() => setFiltro(f)}>
              {f}
              {f !== "Todos" && (
                <span style={S.filtrCount}>{ocorrencias.filter(o => o.status === f).length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={S.center}><Spinner /></div>
        ) : filtradas.length === 0 ? (
          <div style={S.emptyCard}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {filtro === "Todos" ? "Nenhuma ocorrência registrada" : `Nenhuma ocorrência ${filtro.toLowerCase()}`}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {filtro === "Todos" ? "Parabéns! Você não possui ocorrências." : "Tente outro filtro."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtradas.map(oc => {
              const tipo = TIPO_STYLE[oc.tipo] || TIPO_STYLE["Outro"];
              const st = STATUS_STYLE[oc.status] || STATUS_STYLE["Pendente"];
              const pun = PUNICAO_STYLE[oc.punicao] || PUNICAO_STYLE["Sem Punição"];
              const data = new Date(oc.dataOcorrencia).toLocaleDateString("pt-BR");
              const expandido = expandidoId === oc._id;
              const podeContestar = ["Pendente", "Em Análise"].includes(oc.status);

              return (
                <div key={oc._id} style={{ ...S.card, ...(expandido ? S.cardExpandido : {}) }}>
                  {/* LINHA PRINCIPAL */}
                  <div style={S.cardTop} onClick={() => setExpandidoId(expandido ? null : oc._id)}>
                    <div style={{ ...S.tipoIcon, background: tipo.cor + "18", color: tipo.cor }}>
                      {tipo.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={S.ocTitulo}>{oc.titulo}</div>
                      <div style={S.ocMeta}>
                        <span>📅 {data}</span>
                        <span>👤 {oc.registradoPor}</span>
                        <span style={{ color: tipo.cor }}>● {oc.tipo}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <div style={{ ...S.statusBadge, background: st.bg, color: st.color }}>{oc.status}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{expandido ? "▲" : "▼"}</div>
                    </div>
                  </div>

                  {/* EXPANDIDO */}
                  {expandido && (
                    <div style={S.cardDetalhes}>
                      <div style={S.detalhesDivider} />

                      {/* DESCRIÇÃO */}
                      <div style={S.detalheBloco}>
                        <div style={S.detalheLabel}>Descrição</div>
                        <div style={S.detalheTexto}>{oc.descricao}</div>
                      </div>

                      {/* PUNIÇÃO */}
                      <div style={{ ...S.punicaoBox, background: pun.cor + "10", border: `1px solid ${pun.cor}33` }}>
                        <span style={{ fontSize: 20 }}>{pun.icon}</span>
                        <div>
                          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>PUNIÇÃO APLICADA</div>
                          <div style={{ fontWeight: 700, color: pun.cor }}>{oc.punicao}</div>
                        </div>
                      </div>

                      {/* RESPOSTA ADMIN */}
                      {oc.respostaAdmin && (
                        <div style={S.respostaBox}>
                          <div style={S.detalheLabel}>Resposta da Coordenação</div>
                          <div style={S.detalheTexto}>{oc.respostaAdmin}</div>
                        </div>
                      )}

                      {/* CONTESTAÇÃO ENVIADA */}
                      {oc.contestacao?.texto && (
                        <div style={S.contestacaoEnviada}>
                          <div style={S.detalheLabel}>Sua Contestação</div>
                          <div style={S.detalheTexto}>{oc.contestacao.texto}</div>
                          {oc.contestacao.dataEnvio && (
                            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
                              Enviada em {new Date(oc.contestacao.dataEnvio).toLocaleDateString("pt-BR")}
                            </div>
                          )}
                        </div>
                      )}

                      {/* BOTÃO CONTESTAR */}
                      {podeContestar && !oc.contestacao?.texto && contestandoId !== oc._id && (
                        <button style={S.btnContestar} onClick={() => setContestandoId(oc._id)}>
                          ✍️ Contestar esta ocorrência
                        </button>
                      )}

                      {/* FORM CONTESTAÇÃO */}
                      {contestandoId === oc._id && (
                        <div style={S.formContestacao}>
                          <div style={S.detalheLabel}>Escreva sua contestação</div>
                          <textarea
                            style={S.textarea}
                            placeholder="Explique sua versão dos fatos com clareza e respeito..."
                            value={textoContestacao}
                            onChange={e => setTextoContestacao(e.target.value)}
                            rows={4}
                          />
                          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                            <button style={S.btnCancelar} onClick={() => { setContestandoId(null); setTextoContestacao(""); }}>
                              Cancelar
                            </button>
                            <button style={{ ...S.btnEnviar, ...(enviando ? S.btnDisabled : {}) }}
                              onClick={() => enviarContestacao(oc._id)} disabled={enviando}>
                              {enviando ? <><Spinner small /> Enviando...</> : "📤 Enviar Contestação"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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

function Spinner({ small }) {
  return (
    <div style={{
      width: small ? 13 : 32, height: small ? 13 : 32,
      border: "2px solid rgba(255,255,255,0.1)",
      borderTopColor: small ? "#fff" : "#5b6cff",
      borderRadius: "50%", animation: "spin 0.7s linear infinite",
      display: "inline-block", verticalAlign: "middle",
      marginRight: small ? 8 : 0,
    }} />
  );
}

const S = {
  root: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#e8eaf0" },
  header: { background: "#15181f", borderBottom: "1px solid #252a38", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#f87171,#dc2626)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  pill: { padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700 },
  page: { maxWidth: 860, margin: "0 auto", padding: "28px 20px" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 },
  statCard: { background: "#15181f", border: "1px solid #252a38", borderRadius: 12, padding: "16px 18px" },
  statLabel: { fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 },
  statVal: { fontSize: 28, fontWeight: 800 },
  avisoGrave: { background: "rgba(248,113,113,0.08)", border: "1px solid #f8717133", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 },
  filtros: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  filtrBtn: { padding: "7px 16px", border: "1px solid #252a38", borderRadius: 999, background: "none", color: "#6b7280", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  filtrAtivo: { background: "#1c202b", borderColor: "#5b6cff", color: "#e8eaf0" },
  filtrCount: { background: "#252a38", borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 700 },
  emptyCard: { background: "#15181f", border: "1px dashed #252a38", borderRadius: 16, padding: "64px 32px", textAlign: "center" },
  card: { background: "#15181f", border: "1px solid #252a38", borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" },
  cardExpandido: { borderColor: "#5b6cff44" },
  cardTop: { padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" },
  tipoIcon: { width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
  ocTitulo: { fontWeight: 700, fontSize: 14, marginBottom: 5 },
  ocMeta: { display: "flex", gap: 14, fontSize: 12, color: "#6b7280", flexWrap: "wrap" },
  statusBadge: { padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 },
  cardDetalhes: { padding: "0 20px 20px" },
  detalhesDivider: { height: 1, background: "#1c202b", marginBottom: 16 },
  detalheBloco: { marginBottom: 14 },
  detalheLabel: { fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 },
  detalheTexto: { fontSize: 13, color: "#9ca3af", lineHeight: 1.6 },
  punicaoBox: { display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, marginBottom: 14 },
  respostaBox: { background: "rgba(91,108,255,0.06)", border: "1px solid #5b6cff22", borderRadius: 10, padding: "14px 16px", marginBottom: 14 },
  contestacaoEnviada: { background: "rgba(251,146,60,0.06)", border: "1px solid #fb923c22", borderRadius: 10, padding: "14px 16px", marginBottom: 14 },
  btnContestar: { width: "100%", padding: "10px", border: "1px dashed #252a38", borderRadius: 8, background: "none", color: "#a78bfa", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  formContestacao: { background: "#1c202b", borderRadius: 10, padding: "16px" },
  textarea: { width: "100%", background: "#15181f", border: "1px solid #252a38", borderRadius: 8, color: "#e8eaf0", fontFamily: "inherit", fontSize: 13, padding: "10px 12px", outline: "none", resize: "vertical", marginTop: 8 },
  btnCancelar: { padding: "9px 16px", border: "1px solid #252a38", borderRadius: 8, background: "none", color: "#9ca3af", fontFamily: "inherit", fontSize: 13, cursor: "pointer" },
  btnEnviar: { padding: "9px 16px", border: "none", borderRadius: 8, background: "linear-gradient(135deg,#5b6cff,#a78bfa)", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  toast: { position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", zIndex: 999 },
  toastOk:   { background: "#15181f", borderLeft: "4px solid #34d399", color: "#e8eaf0" },
  toastErro: { background: "#15181f", borderLeft: "4px solid #f87171", color: "#e8eaf0" },
};