import { useState, useEffect, useRef } from "react";

const STATUS_COLORS = {
  "Aprovado":            { bg: "rgba(52,211,153,0.12)",  color: "#34d399" },
  "Concluído":           { bg: "rgba(52,211,153,0.12)",  color: "#34d399" },
  "Em Andamento":        { bg: "rgba(91,108,255,0.12)",  color: "#5b6cff" },
  "Enviado":             { bg: "rgba(91,108,255,0.12)",  color: "#5b6cff" },
  "Em Análise":          { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24" },
  "Pendente":            { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24" },
  "Rascunho":            { bg: "rgba(107,114,128,0.12)", color: "#9ca3af" },
  "Reprovado":           { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
  "Correção Solicitada": { bg: "rgba(251,146,60,0.12)",  color: "#fb923c" },
  "Não iniciado":        { bg: "rgba(107,114,128,0.12)", color: "#6b7280" },
};

export default function Perfil({ alunoId }) {
  const API = `/alunos/${alunoId}`;

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nomeEdit, setNomeEdit] = useState("");
  const [fotoEdit, setFotoEdit] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const fileRef = useRef();

  useEffect(() => { fetchPerfil(); }, []);

  async function fetchPerfil() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/perfil`);
      const d = await r.json();
      setDados(d);
      setNomeEdit(d.nome);
      setFotoPreview(d.foto ? `data:image/jpeg;base64,${d.foto}` : null);
    } catch {
      setDados({
        nome: "Aluno Demo", email: "demo@escola.edu.br", curso: "Ciência da Computação",
        foto: null,
        academico: { totalDisciplinas: 12, aprovadas: 10, mediaGeral: "7.8", frequencia: "88.5" },
        estagio: { status: "Em Andamento", empresa: "TechCorp Ltda" },
        tcc: { status: "Enviado", titulo: "IA aplicada ao ensino" },
        atividadesComplementares: { total: 5, horasAC: 180, horasAprovadas: 160 },
      });
    }
    setLoading(false);
  }

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleFoto(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      setFotoEdit(e.target.result.split(",")[1]);
      setFotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  async function salvarPerfil() {
    if (!nomeEdit.trim()) { showToast("O nome não pode ficar vazio.", "erro"); return; }
    setSaving(true);
    try {
      const r = await fetch(`${API}/perfil`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeEdit, ...(fotoEdit && { foto: fotoEdit }) }),
      });
      const d = await r.json();
      if (d.erro) throw new Error(d.erro);
      setDados(prev => ({ ...prev, nome: d.nome, foto: d.foto }));
      showToast("Perfil atualizado!");
      setEditando(false);
    } catch {
      setDados(prev => ({ ...prev, nome: nomeEdit }));
      showToast("Perfil atualizado! (demo)");
      setEditando(false);
    }
    setSaving(false);
  }

  const ac = dados?.academico;
  const acComp = dados?.atividadesComplementares;
  const progressoDisciplinas = ac ? Math.round((ac.aprovadas / ac.totalDisciplinas) * 100) : 0;
  const progressoAC = acComp ? Math.min(100, Math.round((acComp.horasAprovadas / 200) * 100)) : 0;
  const iniciais = dados?.nome?.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

  if (loading) return (
    <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner large />
    </div>
  );

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>👤</div>
          <div>
            <div style={S.headerTitle}>Meu Perfil</div>
            <div style={S.headerSub}>Portal Acadêmico</div>
          </div>
        </div>
        {!editando
          ? <button style={S.btnEditar} onClick={() => setEditando(true)}>✏️ Editar perfil</button>
          : <div style={{ display: "flex", gap: 10 }}>
              <button style={S.btnCancelar} onClick={() => { setEditando(false); setNomeEdit(dados.nome); setFotoPreview(dados.foto ? `data:image/jpeg;base64,${dados.foto}` : null); setFotoEdit(null); }}>Cancelar</button>
              <button style={{ ...S.btnSalvar, ...(saving ? S.btnDisabled : {}) }} onClick={salvarPerfil} disabled={saving}>
                {saving ? <><Spinner /> Salvando...</> : "💾 Salvar"}
              </button>
            </div>
        }
      </header>

      <div style={S.page}>
        {/* HERO */}
        <div style={S.heroCard}>
          {/* AVATAR */}
          <div style={S.avatarWrap}>
            <div style={S.avatar}>
              {fotoPreview
                ? <img src={fotoPreview} alt="foto" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                : <span style={S.avatarIniciais}>{iniciais}</span>
              }
            </div>
            {editando && (
              <>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => handleFoto(e.target.files[0])} />
                <button style={S.btnTrocarFoto} onClick={() => fileRef.current.click()}>📷</button>
              </>
            )}
          </div>

          {/* INFO */}
          <div style={S.heroInfo}>
            {editando ? (
              <input style={S.nomeInput} value={nomeEdit}
                onChange={e => setNomeEdit(e.target.value)} placeholder="Seu nome" />
            ) : (
              <div style={S.heroNome}>{dados?.nome}</div>
            )}
            <div style={S.heroEmail}>{dados?.email}</div>
            <div style={S.cursoBadge}>🎓 {dados?.curso}</div>
          </div>

          {/* MINI STATS */}
          <div style={S.heroStats}>
            {[
              { label: "Média Geral",  value: ac?.mediaGeral || "—", cor: "#a78bfa" },
              { label: "Frequência",   value: ac?.frequencia ? `${ac.frequencia}%` : "—", cor: "#34d399" },
              { label: "Disciplinas",  value: ac ? `${ac.aprovadas}/${ac.totalDisciplinas}` : "—", cor: "#5b6cff" },
            ].map(s => (
              <div key={s.label} style={S.miniStat}>
                <div style={{ ...S.miniVal, color: s.cor }}>{s.value}</div>
                <div style={S.miniLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={S.grid}>
          {/* COL ESQUERDA */}
          <div>
            {/* DESEMPENHO ACADÊMICO */}
            <div style={S.card}>
              <div style={S.cardTitle}>📊 Desempenho Acadêmico</div>
              <div style={S.progressItem}>
                <div style={S.progressHeader}>
                  <span style={S.progressLabel}>Disciplinas aprovadas</span>
                  <span style={S.progressVal}>{ac?.aprovadas}/{ac?.totalDisciplinas}</span>
                </div>
                <div style={S.track}><div style={{ ...S.bar, width: `${progressoDisciplinas}%`, background: "linear-gradient(90deg,#5b6cff,#a78bfa)" }} /></div>
              </div>
              <div style={S.progressItem}>
                <div style={S.progressHeader}>
                  <span style={S.progressLabel}>Frequência geral</span>
                  <span style={{ ...S.progressVal, color: parseFloat(ac?.frequencia) >= 75 ? "#34d399" : "#f87171" }}>
                    {ac?.frequencia ? `${ac.frequencia}%` : "—"}
                  </span>
                </div>
                <div style={S.track}><div style={{ ...S.bar, width: `${ac?.frequencia || 0}%`, background: parseFloat(ac?.frequencia) >= 75 ? "linear-gradient(90deg,#34d399,#059669)" : "linear-gradient(90deg,#f87171,#dc2626)" }} /></div>
              </div>
              <div style={S.progressItem}>
                <div style={S.progressHeader}>
                  <span style={S.progressLabel}>Ativ. Complementares (200h mín.)</span>
                  <span style={S.progressVal}>{acComp?.horasAprovadas || 0}h</span>
                </div>
                <div style={S.track}><div style={{ ...S.bar, width: `${progressoAC}%`, background: "linear-gradient(90deg,#fbbf24,#f59e0b)" }} /></div>
              </div>
            </div>

            {/* ATIVIDADES COMPLEMENTARES */}
            <div style={S.card}>
              <div style={S.cardTitle}>🎯 Atividades Complementares</div>
              <div style={S.infoGrid}>
                <InfoItem label="Total de atividades" value={acComp?.total || 0} />
                <InfoItem label="Horas registradas" value={`${acComp?.horasAC || 0}h`} />
                <InfoItem label="Horas aprovadas" value={`${acComp?.horasAprovadas || 0}h`} cor="#34d399" />
                <InfoItem label="Mínimo exigido" value="200h" />
              </div>
            </div>
          </div>

          {/* COL DIREITA */}
          <div>
            {/* ESTÁGIO */}
            <div style={S.card}>
              <div style={S.cardTitle}>🏢 Estágio Supervisionado</div>
              {dados?.estagio?.status ? (
                <div>
                  <StatusBadge status={dados.estagio.status} />
                  {dados.estagio.empresa && (
                    <div style={S.infoRow}>
                      <span style={S.infoLabel}>Empresa</span>
                      <span style={S.infoVal}>{dados.estagio.empresa}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={S.naoIniciado}>Estágio não cadastrado</div>
              )}
            </div>

            {/* TCC */}
            <div style={S.card}>
              <div style={S.cardTitle}>📝 TCC</div>
              {dados?.tcc?.status ? (
                <div>
                  <StatusBadge status={dados.tcc.status} />
                  {dados.tcc.titulo && (
                    <div style={S.infoRow}>
                      <span style={S.infoLabel}>Título</span>
                      <span style={{ ...S.infoVal, fontStyle: "italic" }}>"{dados.tcc.titulo}"</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={S.naoIniciado}>TCC não cadastrado</div>
              )}
            </div>

            {/* APTIDÃO DIPLOMA */}
            <div style={{ ...S.card, background: "linear-gradient(135deg,rgba(91,108,255,0.08),rgba(167,139,250,0.05))", borderColor: "#5b6cff33" }}>
              <div style={S.cardTitle}>🎓 Aptidão para Diploma</div>
              {[
                { label: "Todas disciplinas", ok: ac?.aprovadas === ac?.totalDisciplinas && ac?.totalDisciplinas > 0 },
                { label: "Estágio concluído", ok: dados?.estagio?.status === "Concluído" },
                { label: "Ativ. complementares (200h)", ok: (acComp?.horasAprovadas || 0) >= 200 },
              ].map((item, i) => (
                <div key={i} style={S.diplomaRow}>
                  <div style={{ ...S.diplomaCircle, ...(item.ok ? S.dcOk : S.dcPend) }}>{item.ok ? "✓" : "○"}</div>
                  <span style={{ fontSize: 13, color: item.ok ? "#e8eaf0" : "#6b7280" }}>{item.label}</span>
                </div>
              ))}
            </div>
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

function StatusBadge({ status }) {
  const st = STATUS_COLORS[status] || STATUS_COLORS["Não iniciado"];
  return <div style={{ ...S2.badge, background: st.bg, color: st.color }}>{status}</div>;
}

function InfoItem({ label, value, cor }) {
  return (
    <div style={S2.infoItem}>
      <div style={S2.infoItemLabel}>{label}</div>
      <div style={{ ...S2.infoItemVal, ...(cor ? { color: cor } : {}) }}>{value}</div>
    </div>
  );
}

function Spinner({ large }) {
  return (
    <div style={{
      width: large ? 32 : 13, height: large ? 32 : 13,
      border: "2px solid rgba(255,255,255,0.15)",
      borderTopColor: large ? "#5b6cff" : "#fff",
      borderRadius: "50%", animation: "spin 0.7s linear infinite",
      display: "inline-block", verticalAlign: "middle", marginRight: large ? 0 : 8,
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
  btnEditar: { background: "#1c202b", border: "1px solid #252a38", borderRadius: 8, color: "#e8eaf0", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 16px", cursor: "pointer" },
  btnCancelar: { background: "none", border: "1px solid #252a38", borderRadius: 8, color: "#9ca3af", fontFamily: "inherit", fontSize: 13, padding: "8px 16px", cursor: "pointer" },
  btnSalvar: { background: "linear-gradient(135deg,#5b6cff,#a78bfa)", border: "none", borderRadius: 8, color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  page: { maxWidth: 1000, margin: "0 auto", padding: "28px 20px" },
  heroCard: { background: "#15181f", border: "1px solid #252a38", borderRadius: 16, padding: "28px 32px", display: "flex", alignItems: "center", gap: 28, marginBottom: 24, flexWrap: "wrap" },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: { width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg,#5b6cff,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "3px solid #252a38" },
  avatarIniciais: { fontSize: 28, fontWeight: 800, color: "#fff" },
  btnTrocarFoto: { position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: "#1c202b", border: "1px solid #252a38", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" },
  heroInfo: { flex: 1 },
  heroNome: { fontSize: 24, fontWeight: 800, marginBottom: 4 },
  nomeInput: { fontSize: 22, fontWeight: 700, background: "#1c202b", border: "1px solid #5b6cff", borderRadius: 8, color: "#e8eaf0", padding: "6px 12px", fontFamily: "inherit", marginBottom: 8, width: "100%" },
  heroEmail: { fontSize: 13, color: "#6b7280", marginBottom: 10 },
  cursoBadge: { display: "inline-block", background: "rgba(91,108,255,0.12)", color: "#a78bfa", padding: "4px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600 },
  heroStats: { display: "flex", gap: 28, marginLeft: "auto" },
  miniStat: { textAlign: "center" },
  miniVal: { fontSize: 22, fontWeight: 800, lineHeight: 1 },
  miniLabel: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  grid: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" },
  card: { background: "#15181f", border: "1px solid #252a38", borderRadius: 14, padding: "22px 24px", marginBottom: 16 },
  cardTitle: { fontSize: 13, fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid #1c202b" },
  progressItem: { marginBottom: 16 },
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 12, color: "#9ca3af" },
  progressVal: { fontSize: 12, fontWeight: 700, color: "#e8eaf0" },
  track: { background: "#1c202b", borderRadius: 999, height: 6, overflow: "hidden" },
  bar: { height: "100%", borderRadius: 999, transition: "width 0.5s ease" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 12, gap: 12 },
  infoLabel: { fontSize: 12, color: "#6b7280" },
  infoVal: { fontSize: 13, fontWeight: 600, textAlign: "right" },
  naoIniciado: { fontSize: 13, color: "#6b7280", fontStyle: "italic" },
  diplomaRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1c202b" },
  diplomaCircle: { width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  dcOk:   { background: "rgba(52,211,153,0.15)", color: "#34d399" },
  dcPend: { background: "rgba(107,114,128,0.12)", color: "#6b7280" },
  toast: { position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", zIndex: 999 },
  toastOk:   { background: "#15181f", borderLeft: "4px solid #34d399", color: "#e8eaf0" },
  toastErro: { background: "#15181f", borderLeft: "4px solid #f87171", color: "#e8eaf0" },
};

const S2 = {
  badge: { display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 10 },
  infoItem: { background: "#1c202b", borderRadius: 8, padding: "12px 14px" },
  infoItemLabel: { fontSize: 11, color: "#6b7280", marginBottom: 4 },
  infoItemVal: { fontSize: 16, fontWeight: 800 },
};