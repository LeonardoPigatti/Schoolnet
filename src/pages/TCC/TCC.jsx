import { useState, useEffect, useRef } from "react";

const STATUS_STYLE = {
  "Rascunho":              { bg: "rgba(107,114,128,0.15)", color: "#9ca3af",  icon: "✏️" },
  "Enviado":               { bg: "rgba(91,108,255,0.15)",  color: "#5b6cff",  icon: "📤" },
  "Em Análise":            { bg: "rgba(251,191,36,0.15)",  color: "#fbbf24",  icon: "🔍" },
  "Aprovado":              { bg: "rgba(52,211,153,0.15)",  color: "#34d399",  icon: "✅" },
  "Reprovado":             { bg: "rgba(248,113,113,0.15)", color: "#f87171",  icon: "❌" },
  "Correção Solicitada":   { bg: "rgba(251,146,60,0.15)",  color: "#fb923c",  icon: "🔧" },
};

const TABS = [
  { id: "info",    label: "📋 Informações" },
  { id: "banca",   label: "👥 Banca" },
  { id: "arquivo", label: "📄 Arquivo" },
];

export default function TCC({ alunoId }) {
  const API = `/alunos/${alunoId}/tcc`;

  const [tcc, setTcc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [tab, setTab] = useState("info");
  const [toast, setToast] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  const bloqueado = tcc?.status === "Aprovado" || tcc?.status === "Em Análise" || tcc?.status === "Enviado";

  const [form, setForm] = useState({
    titulo: "",
    resumo: "",
    orientador: { nome: "", email: "" },
    dataDefesa: "",
    banca: [{ nome: "", email: "" }, { nome: "", email: "" }],
  });

  useEffect(() => { fetchTCC(); }, []);

  async function fetchTCC() {
    setLoading(true);
    try {
      const r = await fetch(API);
      const d = await r.json();
      if (d?._id) {
        setTcc(d);
        setForm({
          titulo: d.titulo || "",
          resumo: d.resumo || "",
          orientador: d.orientador || { nome: "", email: "" },
          dataDefesa: d.dataDefesa?.slice(0, 10) || "",
          banca: d.banca?.length ? d.banca : [{ nome: "", email: "" }, { nome: "", email: "" }],
        });
        if (d.arquivo?.nome) setArquivo({ nome: d.arquivo.nome, existente: true });
      }
    } catch {}
    setLoading(false);
  }

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleFile(file) {
    if (!file || file.type !== "application/pdf") {
      showToast("Apenas arquivos PDF são aceitos.", "erro"); return;
    }
    const reader = new FileReader();
    reader.onload = e => setArquivo({ nome: file.name, mimeType: file.type, dados: e.target.result.split(",")[1] });
    reader.readAsDataURL(file);
  }

  function setBancaMembro(i, campo, valor) {
    setForm(f => {
      const banca = [...f.banca];
      banca[i] = { ...banca[i], [campo]: valor };
      return { ...f, banca };
    });
  }

  function addMembro() {
    setForm(f => ({ ...f, banca: [...f.banca, { nome: "", email: "" }] }));
  }

  function removeMembro(i) {
    setForm(f => ({ ...f, banca: f.banca.filter((_, idx) => idx !== i) }));
  }

  async function salvar() {
    if (!form.titulo || !form.resumo || !form.orientador.nome) {
      showToast("Preencha título, resumo e orientador.", "erro"); return;
    }
    setSaving(true);
    const body = {
      ...form,
      arquivo: arquivo?.dados ? { nome: arquivo.nome, dados: arquivo.dados, mimeType: arquivo.mimeType } : tcc?.arquivo || null,
    };
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.erro) throw new Error(d.erro);
      setTcc(d.tcc);
      showToast("TCC salvo com sucesso!");
    } catch (e) {
      setTcc(prev => ({ ...(prev || {}), ...form, status: "Rascunho", _id: "demo" }));
      showToast(e.message || "Salvo no modo demo!");
    }
    setSaving(false);
  }

  async function enviar() {
    if (!tcc?._id) { showToast("Salve o TCC antes de enviar.", "erro"); return; }
    if (!arquivo && !tcc?.arquivo?.nome) { showToast("Anexe o arquivo PDF antes de enviar.", "erro"); return; }
    if (!confirm("Enviar TCC para análise? Após o envio não será possível editar.")) return;
    setEnviando(true);
    try {
      const r = await fetch(`${API}/enviar`, { method: "PATCH" });
      const d = await r.json();
      if (d.erro) throw new Error(d.erro);
      setTcc(d.tcc);
      showToast("TCC enviado para análise!");
    } catch {
      setTcc(prev => ({ ...prev, status: "Enviado" }));
      showToast("TCC enviado! (demo)");
    }
    setEnviando(false);
  }

  const st = STATUS_STYLE[tcc?.status || "Rascunho"];

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>TCC</div>
          <div>
            <div style={S.headerTitle}>Trabalho de Conclusão de Curso</div>
            <div style={S.headerSub}>Portal Acadêmico</div>
          </div>
        </div>
        {tcc && (
          <div style={{ ...S.statusBadge, background: st.bg, color: st.color }}>
            {st.icon} {tcc.status}
          </div>
        )}
      </header>

      <div style={S.page}>
        {loading ? (
          <div style={S.center}><Spinner large /></div>
        ) : (
          <>
            {/* FEEDBACK DO ADMIN */}
            {tcc?.feedbackAdmin && (
              <div style={{ ...S.feedbackBox, ...(tcc.status === "Aprovado" ? S.feedbackOk : S.feedbackWarn) }}>
                <strong>{tcc.status === "Aprovado" ? "✅ Feedback do avaliador:" : "🔧 Correções solicitadas:"}</strong>
                <p style={{ margin: "6px 0 0", fontSize: 13 }}>{tcc.feedbackAdmin}</p>
              </div>
            )}

            {/* TABS */}
            <div style={S.tabs}>
              {TABS.map(t => (
                <button key={t.id} style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }}
                  onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB INFORMAÇÕES */}
            {tab === "info" && (
              <div style={S.card}>
                <Field label="Título do TCC *">
                  <input style={{ ...S.input, ...(bloqueado ? S.inputDisabled : {}) }}
                    disabled={bloqueado} value={form.titulo} placeholder="Ex: Aplicação de IA no ensino superior"
                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
                </Field>

                <Field label="Resumo *">
                  <textarea style={{ ...S.input, minHeight: 110, resize: "vertical", ...(bloqueado ? S.inputDisabled : {}) }}
                    disabled={bloqueado} value={form.resumo} placeholder="Descreva o tema, objetivos e metodologia do seu TCC..."
                    onChange={e => setForm(f => ({ ...f, resumo: e.target.value }))} />
                </Field>

                <div style={S.row2}>
                  <Field label="Nome do Orientador *">
                    <input style={{ ...S.input, ...(bloqueado ? S.inputDisabled : {}) }}
                      disabled={bloqueado} value={form.orientador.nome} placeholder="Prof. Dr. João Silva"
                      onChange={e => setForm(f => ({ ...f, orientador: { ...f.orientador, nome: e.target.value } }))} />
                  </Field>
                  <Field label="E-mail do Orientador">
                    <input style={{ ...S.input, ...(bloqueado ? S.inputDisabled : {}) }}
                      disabled={bloqueado} value={form.orientador.email} placeholder="orientador@instituicao.edu.br"
                      onChange={e => setForm(f => ({ ...f, orientador: { ...f.orientador, email: e.target.value } }))} />
                  </Field>
                </div>

                <Field label="Data de Defesa">
                  <input style={{ ...S.input, ...(bloqueado ? S.inputDisabled : {}) }}
                    type="date" disabled={bloqueado} value={form.dataDefesa}
                    onChange={e => setForm(f => ({ ...f, dataDefesa: e.target.value }))} />
                </Field>
              </div>
            )}

            {/* TAB BANCA */}
            {tab === "banca" && (
              <div style={S.card}>
                <div style={S.sectionLabel}>👥 Membros da Banca Examinadora</div>
                {form.banca.map((m, i) => (
                  <div key={i} style={S.bancaRow}>
                    <div style={S.bancaNum}>{i + 1}</div>
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <input style={{ ...S.input, ...(bloqueado ? S.inputDisabled : {}) }}
                        disabled={bloqueado} placeholder="Nome do membro" value={m.nome}
                        onChange={e => setBancaMembro(i, "nome", e.target.value)} />
                      <input style={{ ...S.input, ...(bloqueado ? S.inputDisabled : {}) }}
                        disabled={bloqueado} placeholder="E-mail" value={m.email}
                        onChange={e => setBancaMembro(i, "email", e.target.value)} />
                    </div>
                    {!bloqueado && form.banca.length > 1 && (
                      <button style={S.removeBtn} onClick={() => removeMembro(i)}>🗑</button>
                    )}
                  </div>
                ))}
                {!bloqueado && form.banca.length < 5 && (
                  <button style={S.btnAddMembro} onClick={addMembro}>+ Adicionar membro</button>
                )}
              </div>
            )}

            {/* TAB ARQUIVO */}
            {tab === "arquivo" && (
              <div style={S.card}>
                <div style={S.sectionLabel}>📄 Arquivo do TCC (PDF)</div>
                {!bloqueado ? (
                  <div
                    style={{ ...S.dropZone, ...(drag ? S.dropZoneActive : {}) }}
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileRef.current.click()}
                  >
                    <input ref={fileRef} type="file" accept=".pdf"
                      style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                    {arquivo ? (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                        <div style={{ color: "#34d399", fontWeight: 600, fontSize: 14 }}>{arquivo.nome}</div>
                        <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>
                          {arquivo.existente ? "Arquivo atual — clique para substituir" : "Arquivo selecionado"}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", color: "#6b7280" }}>
                        <div style={{ fontSize: 40, marginBottom: 10 }}>📁</div>
                        <div style={{ fontSize: 14 }}><span style={{ color: "#5b6cff", fontWeight: 600 }}>Clique</span> ou arraste o PDF aqui</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>Somente arquivos PDF</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={S.arquivoInfo}>
                    <span style={{ fontSize: 28 }}>📄</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{tcc?.arquivo?.nome || "Nenhum arquivo"}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                        {bloqueado ? "Arquivo bloqueado para edição" : ""}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AÇÕES */}
            {!bloqueado && (
              <div style={S.acoes}>
                <button style={{ ...S.btnSalvar, ...(saving ? S.btnDisabled : {}) }}
                  onClick={salvar} disabled={saving}>
                  {saving ? <><Spinner /> Salvando...</> : "💾 Salvar Rascunho"}
                </button>
                <button style={{ ...S.btnEnviar, ...(enviando || !tcc?._id ? S.btnDisabled : {}) }}
                  onClick={enviar} disabled={enviando || !tcc?._id}>
                  {enviando ? <><Spinner /> Enviando...</> : "📤 Enviar para Análise"}
                </button>
              </div>
            )}

            {bloqueado && (
              <div style={S.bloqueadoInfo}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  {tcc?.status === "Aprovado"
                    ? "TCC aprovado! Parabéns."
                    : "TCC enviado. Aguardando análise do avaliador."}
                </span>
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

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function Spinner({ large }) {
  return (
    <div style={{
      width: large ? 32 : 13, height: large ? 32 : 13,
      border: "2px solid rgba(255,255,255,0.15)",
      borderTopColor: "#fff", borderRadius: "50%",
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
  logoMark: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#5b6cff,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, letterSpacing: 0.5 },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  statusBadge: { padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 },
  page: { maxWidth: 760, margin: "0 auto", padding: "32px 20px" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" },
  feedbackBox: { borderRadius: 12, padding: "16px 20px", marginBottom: 20, border: "1px solid" },
  feedbackOk:   { background: "rgba(52,211,153,0.08)",  borderColor: "#34d39944", color: "#34d399" },
  feedbackWarn: { background: "rgba(251,146,60,0.08)",  borderColor: "#fb923c44", color: "#fb923c" },
  tabs: { display: "flex", gap: 4, background: "#15181f", border: "1px solid #252a38", borderRadius: 10, padding: 4, marginBottom: 16 },
  tab: { flex: 1, padding: "9px 12px", border: "none", borderRadius: 8, background: "none", color: "#6b7280", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  tabActive: { background: "#1c202b", color: "#e8eaf0" },
  card: { background: "#15181f", border: "1px solid #252a38", borderRadius: 14, padding: "24px", marginBottom: 14 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 18, paddingBottom: 10, borderBottom: "1px solid #252a38" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 },
  input: { width: "100%", background: "#1c202b", border: "1px solid #252a38", borderRadius: 8, color: "#e8eaf0", fontFamily: "inherit", fontSize: 14, padding: "9px 12px", outline: "none" },
  inputDisabled: { opacity: 0.5, cursor: "not-allowed" },
  bancaRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  bancaNum: { width: 28, height: 28, borderRadius: "50%", background: "#1c202b", border: "1px solid #252a38", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#6b7280", flexShrink: 0 },
  removeBtn: { background: "none", border: "1px solid #252a38", borderRadius: 7, width: 30, height: 30, cursor: "pointer", color: "#6b7280", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  btnAddMembro: { width: "100%", padding: "9px", border: "1px dashed #252a38", borderRadius: 8, background: "none", color: "#5b6cff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 },
  dropZone: { border: "2px dashed #252a38", borderRadius: 10, padding: "40px 24px", cursor: "pointer", transition: "all 0.2s", textAlign: "center" },
  dropZoneActive: { borderColor: "#5b6cff", background: "rgba(91,108,255,0.06)" },
  arquivoInfo: { display: "flex", alignItems: "center", gap: 16, padding: "20px", background: "#1c202b", borderRadius: 10 },
  acoes: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  btnSalvar: { padding: "12px", border: "1px solid #252a38", borderRadius: 10, background: "#1c202b", color: "#e8eaf0", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },  btnEnviar: { padding: "12px", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#5b6cff,#a78bfa)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  bloqueadoInfo: { display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: "#15181f", border: "1px solid #252a38", borderRadius: 10 },
  toast: { position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24x rgba(0,0,0,0.4)", zIndex: 999 },
  toastOk:   { background: "#15181f", borderLeft: "4px solid #34d399", color: "#e8eaf0" },
  toastErro: { background: "#15181f", borderLeft: "4px solid #f87171", color: "#e8eaf0" },
};