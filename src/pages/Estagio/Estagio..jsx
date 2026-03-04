import { useState, useEffect, useRef } from "react";

const STATUS_STYLE = {
  "Pendente":     { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24" },
  "Em Andamento": { bg: "rgba(91,108,255,0.12)",  color: "#5b6cff" },
  "Concluído":    { bg: "rgba(52,211,153,0.12)",  color: "#34d399" },
  "Reprovado":    { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
};

const DOC_TIPOS = ["Termo de Compromisso", "Relatório Parcial", "Relatório Final", "Outro"];
const DOC_ICONS = {
  "Termo de Compromisso": "📝", "Relatório Parcial": "📊",
  "Relatório Final": "🏁", "Outro": "📎",
};

export default function Estagio({ alunoId }) {
  const API = `/alunos/${alunoId}/estagio`;

  const [estagio, setEstagio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("info"); // info | horas | docs
  const [toast, setToast] = useState(null);
  const [docArquivo, setDocArquivo] = useState(null);
  const [docTipo, setDocTipo] = useState("");
  const [drag, setDrag] = useState(false);
  const [horasInput, setHorasInput] = useState("");
  const fileRef = useRef();

  const [form, setForm] = useState({
    empresa: { nome: "", cnpj: "", endereco: "" },
    supervisor: { nome: "", email: "", telefone: "" },
    dataInicio: "", dataFim: "",
    cargaHorariaSemanal: "",
    descricaoAtividades: "",
  });

  useEffect(() => { fetchEstagio(); }, []);

  async function fetchEstagio() {
    setLoading(true);
    try {
      const r = await fetch(API);
      const d = await r.json();
      if (d && d._id) {
        setEstagio(d);
        setForm({
          empresa: d.empresa || { nome: "", cnpj: "", endereco: "" },
          supervisor: d.supervisor || { nome: "", email: "", telefone: "" },
          dataInicio: d.dataInicio?.slice(0, 10) || "",
          dataFim: d.dataFim?.slice(0, 10) || "",
          cargaHorariaSemanal: d.cargaHorariaSemanal || "",
          descricaoAtividades: d.descricaoAtividades || "",
        });
        setHorasInput(d.horasCumpridas || 0);
      }
    } catch {}
    setLoading(false);
  }

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function salvarInfo() {
    if (!form.empresa.nome || !form.supervisor.nome || !form.dataInicio || !form.cargaHorariaSemanal) {
      showToast("Preencha os campos obrigatórios.", "erro"); return;
    }
    setSaving(true);
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cargaHorariaSemanal: Number(form.cargaHorariaSemanal) }),
      });
      const d = await r.json();
      if (d.erro) throw new Error();
      setEstagio(d.estagio);
      showToast("Dados salvos com sucesso!");
    } catch {
      showToast("Salvo no modo demo!", "ok");
      setEstagio({ ...form, _id: "demo", status: "Pendente", horasCumpridas: 0, documentos: [] });
    }
    setSaving(false);
  }

  async function salvarHoras() {
    try {
      const r = await fetch(`${API}/horas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ horasCumpridas: Number(horasInput) }),
      });
      const d = await r.json();
      if (d.estagio) setEstagio(d.estagio);
      showToast("Horas atualizadas!");
    } catch {
      setEstagio(prev => ({ ...prev, horasCumpridas: Number(horasInput) }));
      showToast("Horas atualizadas! (demo)");
    }
  }

  function handleDocFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setDocArquivo({ nome: file.name, mimeType: file.type, dados: e.target.result.split(",")[1] });
    reader.readAsDataURL(file);
  }

  async function enviarDoc() {
    if (!docArquivo || !docTipo) { showToast("Selecione o tipo e o arquivo.", "erro"); return; }
    try {
      const r = await fetch(`${API}/documentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: docTipo, nome: docArquivo.nome, arquivo: docArquivo.dados, mimeType: docArquivo.mimeType }),
      });
      const d = await r.json();
      if (d.estagio) setEstagio(d.estagio);
      showToast("Documento enviado!");
    } catch {
      const novoDoc = { _id: `demo-${Date.now()}`, tipo: docTipo, nome: docArquivo.nome, enviadoEm: new Date().toISOString() };
      setEstagio(prev => ({ ...prev, documentos: [...(prev?.documentos || []), novoDoc] }));
      showToast("Documento enviado! (demo)");
    }
    setDocArquivo(null);
    setDocTipo("");
  }

  async function removerDoc(docId) {
    if (!confirm("Remover documento?")) return;
    try {
      await fetch(`${API}/documentos/${docId}`, { method: "DELETE" });
    } catch {}
    setEstagio(prev => ({ ...prev, documentos: prev.documentos.filter(d => d._id !== docId) }));
    showToast("Documento removido.");
  }

  const horasTotal = estagio?.cargaHorariaSemanal
    ? Math.ceil((new Date(estagio.dataFim || Date.now()) - new Date(estagio.dataInicio)) / (7 * 24 * 3600 * 1000)) * estagio.cargaHorariaSemanal
    : 0;
  const progresso = horasTotal > 0 ? Math.min(100, Math.round(((estagio?.horasCumpridas || 0) / horasTotal) * 100)) : 0;

  if (loading) return (
    <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner /><span style={{ marginLeft: 12, color: "#6b7280" }}>Carregando...</span>
    </div>
  );

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>ES</div>
          <div>
            <div style={S.headerTitle}>Estágio Supervisionado</div>
            <div style={S.headerSub}>Portal Acadêmico</div>
          </div>
        </div>
        {estagio?.status && (
          <div style={{ ...S.statusBadge, ...STATUS_STYLE[estagio.status] }}>
            {estagio.status}
          </div>
        )}
      </header>

      <div style={S.page}>
        {/* CARDS TOPO */}
        {estagio && (
          <div style={S.statsRow}>
            <div style={S.statCard}>
              <div style={S.statLabel}>Empresa</div>
              <div style={{ ...S.statValue, fontSize: 18, color: "#e8eaf0" }}>{estagio.empresa?.nome || "—"}</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>Horas Cumpridas</div>
              <div style={{ ...S.statValue, color: "#34d399" }}>{estagio.horasCumpridas || 0}h</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>Progresso</div>
              <div style={{ ...S.statValue, color: "#a78bfa" }}>{progresso}%</div>
              <div style={S.progressTrack}>
                <div style={{ ...S.progressBar, width: `${progresso}%` }} />
              </div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>Documentos</div>
              <div style={{ ...S.statValue, color: "#fbbf24" }}>{estagio.documentos?.length || 0}</div>
            </div>
          </div>
        )}

        {/* TABS */}
        <div style={S.tabs}>
          {[["info", "📋 Informações"], ["horas", "🕐 Horas"], ["docs", "📁 Documentos"]].map(([key, label]) => (
            <button key={key} style={{ ...S.tab, ...(tab === key ? S.tabActive : {}) }} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* TAB: INFORMAÇÕES */}
        {tab === "info" && (
          <div style={S.card}>
            <div style={S.cardSection}>🏢 Dados da Empresa</div>
            <div style={S.row3}>
              <Field label="Nome da Empresa *">
                <input style={S.input} value={form.empresa.nome} placeholder="Ex: TechCorp Ltda"
                  onChange={e => setForm(f => ({ ...f, empresa: { ...f.empresa, nome: e.target.value } }))} />
              </Field>
              <Field label="CNPJ">
                <input style={S.input} value={form.empresa.cnpj} placeholder="00.000.000/0001-00"
                  onChange={e => setForm(f => ({ ...f, empresa: { ...f.empresa, cnpj: e.target.value } }))} />
              </Field>
              <Field label="Endereço">
                <input style={S.input} value={form.empresa.endereco} placeholder="Rua, número, cidade"
                  onChange={e => setForm(f => ({ ...f, empresa: { ...f.empresa, endereco: e.target.value } }))} />
              </Field>
            </div>

            <div style={S.cardSection}>👤 Supervisor</div>
            <div style={S.row3}>
              <Field label="Nome do Supervisor *">
                <input style={S.input} value={form.supervisor.nome} placeholder="Nome completo"
                  onChange={e => setForm(f => ({ ...f, supervisor: { ...f.supervisor, nome: e.target.value } }))} />
              </Field>
              <Field label="E-mail">
                <input style={S.input} value={form.supervisor.email} placeholder="supervisor@empresa.com"
                  onChange={e => setForm(f => ({ ...f, supervisor: { ...f.supervisor, email: e.target.value } }))} />
              </Field>
              <Field label="Telefone">
                <input style={S.input} value={form.supervisor.telefone} placeholder="(11) 99999-9999"
                  onChange={e => setForm(f => ({ ...f, supervisor: { ...f.supervisor, telefone: e.target.value } }))} />
              </Field>
            </div>

            <div style={S.cardSection}>📅 Período e Carga Horária</div>
            <div style={S.row3}>
              <Field label="Data de Início *">
                <input style={S.input} type="date" value={form.dataInicio}
                  onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} />
              </Field>
              <Field label="Data de Término">
                <input style={S.input} type="date" value={form.dataFim}
                  onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} />
              </Field>
              <Field label="Horas Semanais *">
                <input style={S.input} type="number" min="1" value={form.cargaHorariaSemanal} placeholder="Ex: 20"
                  onChange={e => setForm(f => ({ ...f, cargaHorariaSemanal: e.target.value }))} />
              </Field>
            </div>

            <Field label="Descrição das Atividades">
              <textarea style={{ ...S.input, minHeight: 88, resize: "vertical" }}
                value={form.descricaoAtividades} placeholder="Descreva as atividades realizadas no estágio..."
                onChange={e => setForm(f => ({ ...f, descricaoAtividades: e.target.value }))} />
            </Field>

            <button style={{ ...S.btn, ...(saving ? S.btnDisabled : {}) }} onClick={salvarInfo} disabled={saving}>
              {saving ? <><Spinner small /> Salvando...</> : "💾 Salvar Informações"}
            </button>
          </div>
        )}

        {/* TAB: HORAS */}
        {tab === "horas" && (
          <div style={S.card}>
            {!estagio ? (
              <div style={S.empty}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                <p style={{ color: "#6b7280" }}>Cadastre as informações do estágio primeiro.</p>
              </div>
            ) : (
              <>
                <div style={S.cardSection}>🕐 Horas Cumpridas</div>
                <div style={S.horasBox}>
                  <div style={S.horasCircle}>
                    <span style={S.horasNum}>{estagio.horasCumpridas || 0}</span>
                    <span style={S.horasLabel}>horas</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                      Meta: <strong style={{ color: "#e8eaf0" }}>{horasTotal}h</strong> totais
                      ({estagio.cargaHorariaSemanal}h/semana)
                    </div>
                    <div style={S.progressTrack}>
                      <div style={{ ...S.progressBar, width: `${progresso}%`, height: 12, borderRadius: 6 }} />
                    </div>
                    <div style={{ fontSize: 12, color: "#a78bfa", marginTop: 6 }}>{progresso}% concluído</div>
                  </div>
                </div>

                <Field label="Atualizar Horas Cumpridas">
                  <div style={{ display: "flex", gap: 10 }}>
                    <input style={{ ...S.input, flex: 1 }} type="number" min="0"
                      value={horasInput} onChange={e => setHorasInput(e.target.value)} />
                    <button style={{ ...S.btn, width: "auto", padding: "9px 20px", marginTop: 0 }} onClick={salvarHoras}>
                      Atualizar
                    </button>
                  </div>
                </Field>
              </>
            )}
          </div>
        )}

        {/* TAB: DOCUMENTOS */}
        {tab === "docs" && (
          <div>
            {!estagio ? (
              <div style={{ ...S.card, ...S.empty }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                <p style={{ color: "#6b7280" }}>Cadastre as informações do estágio primeiro.</p>
              </div>
            ) : (
              <>
                {/* Upload */}
                <div style={{ ...S.card, marginBottom: 16 }}>
                  <div style={S.cardSection}>📤 Enviar Documento</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <Field label="Tipo do Documento *">
                      <select style={S.input} value={docTipo} onChange={e => setDocTipo(e.target.value)}>
                        <option value="">Selecione...</option>
                        {DOC_TIPOS.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Arquivo (PDF, JPG, PNG)">
                      <div
                        style={{ ...S.dropZone, ...(drag ? S.dropZoneActive : {}) }}
                        onDragOver={e => { e.preventDefault(); setDrag(true); }}
                        onDragLeave={() => setDrag(false)}
                        onDrop={e => { e.preventDefault(); setDrag(false); handleDocFile(e.dataTransfer.files[0]); }}
                        onClick={() => fileRef.current.click()}
                      >
                        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                          style={{ display: "none" }} onChange={e => handleDocFile(e.target.files[0])} />
                        {docArquivo
                          ? <span style={{ color: "#34d399", fontSize: 13 }}>📎 {docArquivo.nome}</span>
                          : <span style={{ color: "#6b7280", fontSize: 13 }}><span style={{ color: "#5b6cff" }}>Clique</span> ou arraste</span>
                        }
                      </div>
                    </Field>
                  </div>
                  <button style={S.btn} onClick={enviarDoc}>📤 Enviar Documento</button>
                </div>

                {/* Lista docs */}
                <div style={S.card}>
                  <div style={S.cardSection}>📁 Documentos Enviados</div>
                  {!estagio.documentos?.length ? (
                    <div style={S.empty}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                      <p style={{ color: "#6b7280", fontSize: 13 }}>Nenhum documento enviado ainda.</p>
                    </div>
                  ) : (
                    estagio.documentos.map(doc => (
                      <div key={doc._id} style={S.docRow}>
                        <span style={{ fontSize: 22 }}>{DOC_ICONS[doc.tipo] || "📎"}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{doc.nome}</div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>
                            {doc.tipo} · {new Date(doc.enviadoEm).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                        <button style={S.removeBtn} onClick={() => removerDoc(doc._id)}>🗑</button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div style={{ ...S.toast, ...(toast.type === "erro" ? S.toastErro : S.toastOk) }}>
          {toast.type === "erro" ? "⚠ " : "✔ "} {toast.msg}
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

function Spinner({ small }) {
  return (
    <div style={{
      width: small ? 14 : 24, height: small ? 14 : 24,
      border: "2px solid rgba(255,255,255,0.15)",
      borderTopColor: small ? "#fff" : "#5b6cff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      display: "inline-block", verticalAlign: "middle",
      marginRight: small ? 8 : 0,
    }} />
  );
}

const S = {
  root: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#e8eaf0" },
  header: { background: "#15181f", borderBottom: "1px solid #252a38", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  statusBadge: { padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700 },
  page: { maxWidth: 960, margin: "0 auto", padding: "28px 20px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 },
  statCard: { background: "#15181f", border: "1px solid #252a38", borderRadius: 12, padding: "16px 18px" },
  statLabel: { fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: 800, lineHeight: 1 },
  progressTrack: { background: "#1c202b", borderRadius: 999, height: 6, overflow: "hidden", marginTop: 8 },
  progressBar: { background: "linear-gradient(90deg,#5b6cff,#a78bfa)", height: "100%", borderRadius: 999, transition: "width 0.5s ease" },
  tabs: { display: "flex", gap: 4, marginBottom: 20, background: "#15181f", border: "1px solid #252a38", borderRadius: 10, padding: 4 },
  tab: { flex: 1, padding: "9px 12px", border: "none", borderRadius: 8, background: "none", color: "#6b7280", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  tabActive: { background: "#1c202b", color: "#e8eaf0" },
  card: { background: "#15181f", border: "1px solid #252a38", borderRadius: 12, padding: "24px", marginBottom: 16 },
  cardSection: { fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #252a38" },
  row3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 },
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 },
  input: { width: "100%", background: "#1c202b", border: "1px solid #252a38", borderRadius: 8, color: "#e8eaf0", fontFamily: "inherit", fontSize: 14, padding: "9px 12px", outline: "none" },
  btn: { width: "100%", padding: "11px", border: "none", borderRadius: 8, background: "linear-gradient(135deg,#34d399,#059669)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  horasBox: { display: "flex", alignItems: "center", gap: 24, marginBottom: 24, padding: "20px", background: "#1c202b", borderRadius: 10 },
  horasCircle: { width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  horasNum: { fontSize: 22, fontWeight: 800, lineHeight: 1 },
  horasLabel: { fontSize: 10, opacity: 0.8 },
  dropZone: { border: "2px dashed #252a38", borderRadius: 8, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s", textAlign: "center" },
  dropZoneActive: { borderColor: "#5b6cff", background: "rgba(91,108,255,0.06)" },
  docRow: { display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #1c202b" },
  removeBtn: { background: "none", border: "1px solid #252a38", borderRadius: 7, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280", fontSize: 13 },
  empty: { textAlign: "center", padding: "40px 20px" },
  toast: { position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", zIndex: 999 },
  toastOk:   { background: "#15181f", borderLeft: "4px solid #34d399", color: "#e8eaf0" },
  toastErro: { background: "#15181f", borderLeft: "4px solid #f87171", color: "#e8eaf0" },
};