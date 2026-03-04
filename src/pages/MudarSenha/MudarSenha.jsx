import { useState } from "react";

export default function AlterarSenha({ alunoId }) {
  const API = `/alunos/${alunoId}/senha`;

  const [form, setForm] = useState({ senhaAtual: "", novaSenha: "", confirmar: "" });
  const [show, setShow] = useState({ senhaAtual: false, novaSenha: false, confirmar: false });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function toggleShow(campo) {
    setShow(s => ({ ...s, [campo]: !s[campo] }));
  }

  const forca = calcularForca(form.novaSenha);
  const senhasIguais = form.novaSenha && form.confirmar && form.novaSenha === form.confirmar;
  const senhasDiferentes = form.confirmar && form.novaSenha !== form.confirmar;

  async function salvar() {
    if (!form.senhaAtual || !form.novaSenha || !form.confirmar) {
      showToast("Preencha todos os campos.", "erro"); return;
    }
    if (form.novaSenha !== form.confirmar) {
      showToast("As senhas não coincidem.", "erro"); return;
    }
    if (form.novaSenha.length < 6) {
      showToast("A nova senha deve ter pelo menos 6 caracteres.", "erro"); return;
    }
    setLoading(true);
    try {
      const r = await fetch(API, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual: form.senhaAtual, novaSenha: form.novaSenha }),
      });
      const d = await r.json();
      if (d.erro) throw new Error(d.erro);
      setSucesso(true);
      setForm({ senhaAtual: "", novaSenha: "", confirmar: "" });
      showToast("Senha alterada com sucesso!");
    } catch (e) {
      showToast(e.message || "Erro ao alterar senha.", "erro");
    }
    setLoading(false);
  }

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>🔐</div>
          <div>
            <div style={S.headerTitle}>Alterar Senha</div>
            <div style={S.headerSub}>Portal Acadêmico</div>
          </div>
        </div>
      </header>

      <div style={S.page}>
        {sucesso ? (
          <div style={S.sucessoCard}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Senha alterada!</div>
            <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>
              Sua senha foi atualizada com sucesso.
            </div>
            <button style={S.btnNovamente} onClick={() => setSucesso(false)}>
              Alterar novamente
            </button>
          </div>
        ) : (
          <div style={S.card}>
            <div style={S.cardIcon}>🔑</div>
            <div style={S.cardTitle}>Redefinir senha</div>
            <div style={S.cardSub}>Preencha os campos abaixo para alterar sua senha de acesso.</div>

            <div style={S.divider} />

            {/* SENHA ATUAL */}
            <Field label="Senha Atual">
              <div style={S.inputWrap}>
                <input
                  style={S.input}
                  type={show.senhaAtual ? "text" : "password"}
                  placeholder="Digite sua senha atual"
                  value={form.senhaAtual}
                  onChange={e => setForm(f => ({ ...f, senhaAtual: e.target.value }))}
                />
                <button style={S.eyeBtn} onClick={() => toggleShow("senhaAtual")}>
                  {show.senhaAtual ? "🙈" : "👁"}
                </button>
              </div>
            </Field>

            <div style={S.divider} />

            {/* NOVA SENHA */}
            <Field label="Nova Senha">
              <div style={S.inputWrap}>
                <input
                  style={S.input}
                  type={show.novaSenha ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={form.novaSenha}
                  onChange={e => setForm(f => ({ ...f, novaSenha: e.target.value }))}
                />
                <button style={S.eyeBtn} onClick={() => toggleShow("novaSenha")}>
                  {show.novaSenha ? "🙈" : "👁"}
                </button>
              </div>

              {/* BARRA DE FORÇA */}
              {form.novaSenha.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} style={{
                        flex: 1, height: 4, borderRadius: 999,
                        background: n <= forca.nivel ? forca.cor : "#252a38",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: forca.cor, fontWeight: 600 }}>{forca.label}</div>
                </div>
              )}
            </Field>

            {/* CONFIRMAR */}
            <Field label="Confirmar Nova Senha">
              <div style={S.inputWrap}>
                <input
                  style={{ ...S.input, ...(senhasDiferentes ? S.inputErro : senhasIguais ? S.inputOk : {}) }}
                  type={show.confirmar ? "text" : "password"}
                  placeholder="Repita a nova senha"
                  value={form.confirmar}
                  onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
                />
                <button style={S.eyeBtn} onClick={() => toggleShow("confirmar")}>
                  {show.confirmar ? "🙈" : "👁"}
                </button>
              </div>
              {senhasDiferentes && <div style={S.erroMsg}>⚠ As senhas não coincidem</div>}
              {senhasIguais    && <div style={S.okMsg}>✔ Senhas coincidem</div>}
            </Field>

            <button
              style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}
              onClick={salvar}
              disabled={loading}
            >
              {loading ? <><Spinner /> Alterando...</> : "🔐 Alterar Senha"}
            </button>
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

function calcularForca(senha) {
  if (!senha) return { nivel: 0, cor: "#252a38", label: "" };
  let pontos = 0;
  if (senha.length >= 6)  pontos++;
  if (senha.length >= 10) pontos++;
  if (/[A-Z]/.test(senha) && /[0-9]/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;

  const map = [
    { nivel: 1, cor: "#f87171", label: "Fraca" },
    { nivel: 2, cor: "#fbbf24", label: "Razoável" },
    { nivel: 3, cor: "#60a5fa", label: "Boa" },
    { nivel: 4, cor: "#34d399", label: "Forte" },
  ];
  return map[Math.max(0, pontos - 1)] || map[0];
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 13, height: 13,
      border: "2px solid rgba(255,255,255,0.2)",
      borderTopColor: "#fff", borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      display: "inline-block", verticalAlign: "middle", marginRight: 8,
    }} />
  );
}

const S = {
  root: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#e8eaf0" },
  header: { background: "#15181f", borderBottom: "1px solid #252a38", padding: "16px 28px", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#5b6cff,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  page: { maxWidth: 480, margin: "0 auto", padding: "48px 20px" },
  card: { background: "#15181f", border: "1px solid #252a38", borderRadius: 16, padding: "32px 28px" },
  cardIcon: { fontSize: 36, marginBottom: 10, textAlign: "center" },
  cardTitle: { fontSize: 20, fontWeight: 800, textAlign: "center", marginBottom: 6 },
  cardSub: { fontSize: 13, color: "#6b7280", textAlign: "center", marginBottom: 4, lineHeight: 1.5 },
  divider: { height: 1, background: "#1c202b", margin: "20px 0" },
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  input: { width: "100%", background: "#1c202b", border: "1px solid #252a38", borderRadius: 8, color: "#e8eaf0", fontFamily: "inherit", fontSize: 14, padding: "10px 42px 10px 12px", outline: "none", transition: "border-color 0.2s" },
  inputErro: { borderColor: "#f87171" },
  inputOk:   { borderColor: "#34d399" },
  eyeBtn: { position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 15, padding: 4 },
  erroMsg: { fontSize: 11, color: "#f87171", marginTop: 6, fontWeight: 500 },
  okMsg:   { fontSize: 11, color: "#34d399", marginTop: 6, fontWeight: 500 },
  btn: { width: "100%", padding: "12px", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#5b6cff,#a78bfa)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  sucessoCard: { background: "#15181f", border: "1px solid #252a38", borderRadius: 16, padding: "48px 28px", textAlign: "center" },
  btnNovamente: { padding: "10px 24px", border: "1px solid #252a38", borderRadius: 8, background: "none", color: "#e8eaf0", fontFamily: "inherit", fontSize: 13, cursor: "pointer" },
  toast: { position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", zIndex: 999 },
  toastOk:   { background: "#15181f", borderLeft: "4px solid #34d399", color: "#e8eaf0" },
  toastErro: { background: "#15181f", borderLeft: "4px solid #f87171", color: "#e8eaf0" },
};