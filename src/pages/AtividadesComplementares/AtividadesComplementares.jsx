import { useState, useEffect, useRef } from "react";

const CAT_ICONS = {
  "Extensão": "🌐", "Pesquisa": "🔬", "Monitoria": "📚",
  "Cultura": "🎭", "Esporte": "⚽", "Outro": "📋",
};

const CAT_COLORS = {
  "Extensão": "#5b6cff", "Pesquisa": "#a78bfa", "Monitoria": "#34d399",
  "Cultura": "#fbbf24", "Esporte": "#f87171", "Outro": "#6b7280",
};

const STATUS_STYLE = {
  "Pendente":  { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24" },
  "Aprovada":  { bg: "rgba(52,211,153,0.12)",  color: "#34d399" },
  "Reprovada": { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
};

let demoId = 1;

export default function AtividadesComplementares({ alunoId }) {
  const API = `/alunos/${alunoId}/atividades`;

  const [atividades, setAtividades] = useState([]);
  const [totalHoras, setTotalHoras] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({
    titulo: "", categoria: "", cargaHoraria: "", dataRealizacao: "", descricao: "",
  });

  useEffect(() => { fetchAtividades(); }, []);

  async function fetchAtividades() {
    setLoading(true);
    try {
      const r = await fetch(API);
      const d = await r.json();
      setAtividades(d.atividades || []);
      setTotalHoras(d.totalHoras || 0);
    } catch {
      setAtividades([]);
      setTotalHoras(0);
    }
    setLoading(false);
  }

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setArquivo({
      nome: file.name,
      tipo: file.type,
      dados: e.target.result.split(",")[1],
    });
    reader.readAsDataURL(file);
  }

  async function salvar() {
    const { titulo, categoria, cargaHoraria, dataRealizacao } = form;
    if (!titulo || !categoria || !cargaHoraria || !dataRealizacao) {
      showToast("Preencha todos os campos obrigatórios.", "erro");
      return;
    }
    setSaving(true);
    const body = { ...form, cargaHoraria: Number(cargaHoraria), arquivo: arquivo || null };
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.erro) throw new Error(d.erro);
      showToast("Atividade cadastrada!");
      fetchAtividades();
    } catch {
      const nova = {
        _id: `demo-${demoId++}`, ...body, status: "Pendente",
        createdAt: new Date().toISOString(),
      };
      setAtividades(prev => [nova, ...prev]);
      setTotalHoras(prev => prev + Number(cargaHoraria));
      showToast("Atividade adicionada! (demo)");
    }
    setForm({ titulo: "", categoria: "", cargaHoraria: "", dataRealizacao: "", descricao: "" });
    setArquivo(null);
    setSaving(false);
  }

  async function remover(id) {
    if (!confirm("Remover esta atividade?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
    } catch {}
    setAtividades(prev => {
      const removida = prev.find(a => a._id === id);
      if (removida) setTotalHoras(t => t - removida.cargaHoraria);
      return prev.filter(a => a._id !== id);
    });
    showToast("Atividade removida.");
  }

  const pendentes = atividades.filter(a => a.status === "Pendente").length;

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>AC</div>
          <div>
            <div style={S.headerTitle}>Atividades Complementares</div>
            <div style={S.headerSub}>Portal Acadêmico</div>
          </div>
        </div>
        <div style={S.pill}>{totalHoras}h registradas</div>
      </header>

      <div style={S.page}>
        <div style={S.statsRow}>
          {[
            { label: "Total de Horas", value: totalHoras, color: "#a78bfa" },
            { label: "Atividades",     value: atividades.length, color: "#34d399" },
            { label: "Pendentes",      value: pendentes, color: "#fbbf24" },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={S.statLabel}>{s.label}</div>
              <div style={{ ...S.statValue, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={S.grid}>
          <div style={S.listCol}>
            <div style={S.sectionLabel}>Histórico</div>
            {loading ? (
              <div style={S.empty}><Spinner /><p style={{ margin: "12px 0 0", color: "#6b7280" }}>Carregando...</p></div>
            ) : atividades.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                <p style={{ color: "#6b7280", fontSize: 14 }}>Nenhuma atividade registrada ainda.</p>
              </div>
            ) : (
              <div>
                {atividades.map(a => (
                  <AtividadeCard key={a._id} a={a} onRemover={remover} />
                ))}
              </div>
            )}
          </div>

          <div style={S.formCard}>
            <div style={S.formTitle}>Nova Atividade</div>

            <Field label="Título *">
              <input style={S.input} placeholder="Ex: Congresso de TI" value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
            </Field>

            <Field label="Categoria *">
              <select style={S.input} value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                <option value="">Selecione...</option>
                {Object.keys(CAT_ICONS).map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Horas *">
                <input style={S.input} type="number" min="1" placeholder="20"
                  value={form.cargaHoraria}
                  onChange={e => setForm(f => ({ ...f, cargaHoraria: e.target.value }))} />
              </Field>
              <Field label="Data *">
                <input style={S.input} type="date" value={form.dataRealizacao}
                  onChange={e => setForm(f => ({ ...f, dataRealizacao: e.target.value }))} />
              </Field>
            </div>

            <Field label="Descrição">
              <textarea style={{ ...S.input, minHeight: 72, resize: "vertical" }}
                placeholder="Descreva brevemente..." value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
            </Field>

            <Field label="Comprovante (PDF, JPG, PNG)">
              <div
                style={{ ...S.dropZone, ...(drag ? S.dropZoneActive : {}) }}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current.click()}
              >
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={e => handleFile(e.target.files[0])} />
                {arquivo ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24 }}>📎</div>
                    <div style={{ color: "#34d399", fontSize: 13, marginTop: 4 }}>{arquivo.nome}</div>
                    <button style={S.clearFile} onClick={e => { e.stopPropagation(); setArquivo(null); }}>✕ remover</button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
                    <span style={{ color: "#5b6cff", fontWeight: 600 }}>Clique</span> ou arraste aqui
                  </div>
                )}
              </div>
            </Field>

            <button style={{ ...S.btn, ...(saving ? S.btnDisabled : {}) }} onClick={salvar} disabled={saving}>
              {saving ? <><Spinner small /> Salvando...</> : "✚ Salvar Atividade"}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ ...S.toast, ...(toast.type === "erro" ? S.toastErro : S.toastOk) }}>
          {toast.type === "erro" ? "⚠ " : "✔ "}{toast.msg}
        </div>
      )}
    </div>
  );
}

function AtividadeCard({ a, onRemover }) {
  const cor = CAT_COLORS[a.categoria] || "#6b7280";
  const st = STATUS_STYLE[a.status] || STATUS_STYLE["Pendente"];
  const data = new Date(a.dataRealizacao).toLocaleDateString("pt-BR");

  return (
    <div style={S.card}>
      <div style={{ ...S.catIcon, background: cor + "22", fontSize: 20 }}>
        {CAT_ICONS[a.categoria] || "📋"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={S.cardTitle}>{a.titulo}</div>
        <div style={S.cardMeta}>
          <span>🏷 {a.categoria}</span>
          <span>📅 {data}</span>
          <span>🕐 {a.cargaHoraria}h</span>
        </div>
        {a.descricao && <div style={S.cardDesc}>{a.descricao}</div>}
        {a.arquivo?.nome && (
          <span style={S.fileLink} onClick={() => baixarArquivo(a.arquivo)}>📎 {a.arquivo.nome}</span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
        <div style={{ ...S.statusBadge, background: st.bg, color: st.color }}>{a.status}</div>
        <div style={S.horasBadge}>{a.cargaHoraria}h</div>
        <button style={S.removeBtn} onClick={() => onRemover(a._id)}>🗑</button>
      </div>
    </div>
  );
}

function baixarArquivo(arquivo) {
  if (!arquivo?.dados) return;
  const byteChars = atob(arquivo.dados);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  const blob = new Blob([bytes], { type: arquivo.tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = arquivo.nome; a.click();
  URL.revokeObjectURL(url);
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
      width: small ? 14 : 28, height: small ? 14 : 28,
      border: "2px solid rgba(255,255,255,0.15)",
      borderTopColor: small ? "#fff" : "#5b6cff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      display: "inline-block",
      verticalAlign: "middle",
      marginRight: small ? 8 : 0,
    }} />
  );
}

const S = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#0d0f14",
    minHeight: "100vh",
    color: "#e8eaf0",
  },
  header: {
    background: "#15181f",
    borderBottom: "1px solid #252a38",
    padding: "16px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: {
    width: 38, height: 38, borderRadius: 10,
    background: "linear-gradient(135deg,#5b6cff,#a78bfa)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: 13, letterSpacing: 1,
  },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  pill: {
    background: "linear-gradient(135deg,#5b6cff,#a78bfa)",
    padding: "6px 16px", borderRadius: 999,
    fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
  },
  page: { maxWidth: 1080, margin: "0 auto", padding: "28px 20px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 },
  statCard: {
    background: "#15181f",
    border: "1px solid #252a38",
    borderRadius: 12, padding: "18px 20px",
  },
  statLabel: { fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  statValue: { fontSize: 32, fontWeight: 800, lineHeight: 1 },
  grid: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", marginBottom: 14 },
  listCol: {},
  empty: {
    background: "#15181f", border: "1px dashed #252a38",
    borderRadius: 12, padding: "52px 24px", textAlign: "center",
  },
  card: {
    background: "#15181f",
    border: "1px solid #252a38",
    borderRadius: 12, padding: "18px 20px",
    display: "flex", gap: 14, alignItems: "flex-start",
    marginBottom: 10,
  },
  catIcon: {
    width: 42, height: 42, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: { fontWeight: 700, fontSize: 14, marginBottom: 5 },
  cardMeta: { display: "flex", gap: 12, fontSize: 12, color: "#6b7280", flexWrap: "wrap", marginBottom: 4 },
  cardDesc: { fontSize: 12, color: "#9ca3af", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  fileLink: { fontSize: 12, color: "#5b6cff", cursor: "pointer", marginTop: 4, display: "inline-block" },
  statusBadge: { padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600 },
  horasBadge: { fontSize: 13, fontWeight: 700, color: "#a78bfa" },
  removeBtn: {
    background: "none", border: "1px solid #252a38",
    borderRadius: 7, width: 28, height: 28,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#6b7280", fontSize: 13,
  },
  formCard: {
    background: "#15181f",
    border: "1px solid #252a38",
    borderRadius: 12, padding: "24px",
    position: "sticky", top: 76,
  },
  formTitle: { fontWeight: 700, fontSize: 15, marginBottom: 20 },
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 },
  input: {
    width: "100%", background: "#1c202b",
    border: "1px solid #252a38", borderRadius: 8,
    color: "#e8eaf0", fontFamily: "inherit", fontSize: 14,
    padding: "9px 12px", outline: "none",
  },
  dropZone: {
    border: "2px dashed #252a38", borderRadius: 8,
    padding: "20px 16px", cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
  },
  dropZoneActive: { borderColor: "#5b6cff", background: "rgba(91,108,255,0.06)" },
  clearFile: {
    marginTop: 6, background: "none", border: "none",
    color: "#6b7280", fontSize: 11, cursor: "pointer",
  },
  btn: {
    width: "100%", padding: "12px",
    border: "none", borderRadius: 8,
    background: "linear-gradient(135deg,#5b6cff,#7c8ffc)",
    color: "#fff", fontWeight: 700, fontSize: 14,
    cursor: "pointer", marginTop: 18, letterSpacing: 0.3,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  toast: {
    position: "fixed", bottom: 24, right: 24,
    padding: "12px 20px", borderRadius: 10,
    fontSize: 13, fontWeight: 500,
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    zIndex: 999,
  },
  toastOk:   { background: "#15181f", borderLeft: "4px solid #34d399", color: "#e8eaf0" },
  toastErro: { background: "#15181f", borderLeft: "4px solid #f87171", color: "#e8eaf0" },
};