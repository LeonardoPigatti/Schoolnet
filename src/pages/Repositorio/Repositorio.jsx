import { useState, useEffect } from "react";

const CORES_CURSO = [
  "#5b6cff", "#a78bfa", "#34d399", "#fbbf24",
  "#f87171", "#fb923c", "#60a5fa", "#f472b6",
];

function corDoCurso(curso) {
  let hash = 0;
  for (let i = 0; i < curso.length; i++) hash += curso.charCodeAt(i);
  return CORES_CURSO[hash % CORES_CURSO.length];
}

const DEMO = [
  { _id: "1", titulo: "Aplicação de Inteligência Artificial no Diagnóstico Médico", autor: "Leonardo Silva", curso: "Ciência da Computação", ano: 2025, orientador: "Prof. Dr. Carlos Mendes", resumo: "Este trabalho propõe um modelo de machine learning para auxílio ao diagnóstico de doenças respiratórias com base em imagens de raio-X. Foram utilizadas redes neurais convolucionais treinadas em datasets públicos, atingindo acurácia de 94,2%.", palavrasChave: ["IA", "Machine Learning", "Saúde", "CNN"], visualizacoes: 142, downloads: 38 },
  { _id: "2", titulo: "Gestão Financeira em Microempresas: Um Estudo de Caso", autor: "Ana Beatriz Costa", curso: "Administração", ano: 2025, orientador: "Prof. Dra. Fernanda Lima", resumo: "Análise das práticas de gestão financeira em microempresas do setor de varejo, identificando os principais desafios e propondo estratégias de controle e planejamento.", palavrasChave: ["Finanças", "Microempresas", "Gestão"], visualizacoes: 89, downloads: 21 },
  { _id: "3", titulo: "Impacto das Redes Sociais na Formação da Identidade Juvenil", autor: "Mariana Souza", curso: "Psicologia", ano: 2024, orientador: "Prof. Dr. Roberto Alves", resumo: "Estudo qualitativo sobre como o uso intensivo de redes sociais influencia a construção da identidade em adolescentes entre 14 e 18 anos, baseado em entrevistas e grupos focais.", palavrasChave: ["Redes Sociais", "Adolescência", "Identidade"], visualizacoes: 203, downloads: 67 },
  { _id: "4", titulo: "Arquitetura de Microsserviços para Sistemas de Alta Disponibilidade", autor: "Rafael Oliveira", curso: "Ciência da Computação", ano: 2024, orientador: "Prof. Dr. Carlos Mendes", resumo: "Proposta e implementação de arquitetura baseada em microsserviços com orquestração via Kubernetes para garantir alta disponibilidade e escalabilidade horizontal.", palavrasChave: ["Microsserviços", "Kubernetes", "DevOps"], visualizacoes: 176, downloads: 54 },
  { _id: "5", titulo: "Marketing Digital para Pequenos Negócios no Interior do Brasil", autor: "Juliana Ferreira", curso: "Administração", ano: 2023, orientador: "Prof. Dra. Fernanda Lima", resumo: "Análise das estratégias de marketing digital mais eficazes para pequenos negócios em cidades do interior, com foco em custo-benefício e alcance regional.", palavrasChave: ["Marketing Digital", "Pequenos Negócios", "Interior"], visualizacoes: 95, downloads: 29 },
];

export default function RepositorioInstitucional() {
  const API = "/repositorio";

  const [tccs, setTccs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [selecionado, setSelecionado] = useState(null);
  const [baixando, setBaixando] = useState(null);
  const [demo, setDemo] = useState(false);

  useEffect(() => { fetchTccs(); }, [busca, filtroCurso, filtroAno]);

  async function fetchTccs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca)      params.append("busca", busca);
      if (filtroCurso) params.append("curso", filtroCurso);
      if (filtroAno)  params.append("ano", filtroAno);
      const r = await fetch(`${API}?${params}`);
      const d = await r.json();
      if (Array.isArray(d)) { setTccs(d); setDemo(false); }
      else throw new Error();
    } catch {
      setDemo(true);
      let resultado = DEMO;
      if (busca) resultado = resultado.filter(t =>
        t.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        t.autor.toLowerCase().includes(busca.toLowerCase()) ||
        t.resumo.toLowerCase().includes(busca.toLowerCase())
      );
      if (filtroCurso) resultado = resultado.filter(t => t.curso === filtroCurso);
      if (filtroAno)   resultado = resultado.filter(t => t.ano === Number(filtroAno));
      setTccs(resultado);
    }
    setLoading(false);
  }

  async function abrirDetalhes(tcc) {
    setSelecionado(tcc);
    if (!demo) {
      try {
        const r = await fetch(`${API}/${tcc._id}`);
        const d = await r.json();
        setSelecionado(d);
      } catch {}
    }
  }

  async function baixar(tcc) {
    setBaixando(tcc._id);
    if (demo) {
      setTimeout(() => {
        alert("Modo demo — arquivo não disponível.");
        setBaixando(null);
      }, 800);
      return;
    }
    try {
      const r = await fetch(`${API}/${tcc._id}/baixar`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tcc.titulo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setBaixando(null);
  }

  const cursos = [...new Set(DEMO.map(t => t.curso))];
  const anos = [...new Set(DEMO.map(t => t.ano))].sort((a, b) => b - a);

  function highlight(texto, busca) {
    if (!busca?.trim()) return texto;
    const partes = texto.split(new RegExp(`(${busca})`, "gi"));
    return partes.map((p, i) =>
      p.toLowerCase() === busca.toLowerCase()
        ? <mark key={i} style={{ background: "rgba(91,108,255,0.3)", color: "#a78bfa", borderRadius: 3, padding: "0 2px" }}>{p}</mark>
        : p
    );
  }

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>📚</div>
          <div>
            <div style={S.headerTitle}>Repositório Institucional</div>
            <div style={S.headerSub}>TCCs aprovados — Portal Acadêmico</div>
          </div>
        </div>
        <div style={S.contadorPill}>{tccs.length} trabalho{tccs.length !== 1 ? "s" : ""}</div>
      </header>

      <div style={S.page}>
        {/* BUSCA E FILTROS */}
        <div style={S.toolBar}>
          <div style={S.buscaWrap}>
            <span style={S.buscaIcon}>🔍</span>
            <input style={S.buscaInput} placeholder="Buscar por título, autor ou palavra-chave..."
              value={busca} onChange={e => { setBusca(e.target.value); setSelecionado(null); }} />
            {busca && <button style={S.clearBtn} onClick={() => setBusca("")}>✕</button>}
          </div>
          <select style={S.select} value={filtroCurso} onChange={e => { setFiltroCurso(e.target.value); setSelecionado(null); }}>
            <option value="">Todos os cursos</option>
            {cursos.map(c => <option key={c}>{c}</option>)}
          </select>
          <select style={S.select} value={filtroAno} onChange={e => { setFiltroAno(e.target.value); setSelecionado(null); }}>
            <option value="">Todos os anos</option>
            {anos.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={S.center}><Spinner /></div>
        ) : (
          <div style={S.layout}>
            {/* LISTA */}
            <div style={S.lista}>
              {tccs.length === 0 ? (
                <div style={S.emptyCard}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔎</div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Nenhum resultado</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Tente outros termos ou remova os filtros.</div>
                </div>
              ) : tccs.map(tcc => {
                const cor = corDoCurso(tcc.curso);
                const ativo = selecionado?._id === tcc._id;
                return (
                  <div key={tcc._id}
                    style={{ ...S.tccCard, ...(ativo ? { ...S.tccCardAtivo, borderColor: cor + "66" } : {}) }}
                    onClick={() => abrirDetalhes(tcc)}
                  >
                    <div style={{ ...S.tccIconBox, background: cor + "18" }}>
                      <span style={{ fontSize: 22, color: cor }}>📄</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={S.tccTitulo}>{highlight(tcc.titulo, busca)}</div>
                      <div style={S.tccAutor}>✍️ {highlight(tcc.autor, busca)}</div>
                      <div style={S.tccMeta}>
                        <span style={{ ...S.cursoPill, color: cor, background: cor + "15" }}>{tcc.curso}</span>
                        <span style={S.anoPill}>{tcc.ano}</span>
                      </div>
                    </div>
                    <div style={S.tccStats}>
                      <div style={S.statItem}><span style={{ fontSize: 12 }}>👁</span> {tcc.visualizacoes}</div>
                      <div style={S.statItem}><span style={{ fontSize: 12 }}>⬇</span> {tcc.downloads}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAINEL DETALHES */}
            <div style={S.painel}>
              {!selecionado ? (
                <div style={S.painelVazio}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>📖</div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Selecione um trabalho</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Clique em um TCC para ver os detalhes e baixar o PDF.</div>
                </div>
              ) : (() => {
                const cor = corDoCurso(selecionado.curso);
                return (
                  <div style={S.painelConteudo}>
                    <div style={{ ...S.painelCursoPill, color: cor, background: cor + "15" }}>
                      🎓 {selecionado.curso}
                    </div>
                    <div style={S.painelTitulo}>{selecionado.titulo}</div>

                    <div style={S.painelInfoGrid}>
                      <InfoRow icon="✍️" label="Autor" value={selecionado.autor} />
                      <InfoRow icon="👨‍🏫" label="Orientador" value={selecionado.orientador || "—"} />
                      <InfoRow icon="📅" label="Ano" value={selecionado.ano} />
                      <InfoRow icon="👁" label="Visualizações" value={selecionado.visualizacoes} />
                      <InfoRow icon="⬇" label="Downloads" value={selecionado.downloads} />
                    </div>

                    {selecionado.palavrasChave?.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={S.painelLabel}>Palavras-chave</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {selecionado.palavrasChave.map((p, i) => (
                            <span key={i} style={S.keyword}>{p}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selecionado.resumo && (
                      <div style={{ marginBottom: 24 }}>
                        <div style={S.painelLabel}>Resumo</div>
                        <div style={S.painelResumo}>{selecionado.resumo}</div>
                      </div>
                    )}

                    <button
                      style={{ ...S.btnBaixar, background: `linear-gradient(135deg, ${cor}, ${cor}bb)`, ...(baixando === selecionado._id ? S.btnDisabled : {}) }}
                      onClick={() => baixar(selecionado)}
                      disabled={baixando === selecionado._id}
                    >
                      {baixando === selecionado._id ? <><Spinner small /> Baixando...</> : "⬇ Baixar PDF"}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1c202b", fontSize: 13 }}>
      <span style={{ color: "#6b7280" }}>{icon} {label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
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
  logoMark: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  contadorPill: { background: "#1c202b", border: "1px solid #252a38", padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600 },
  page: { maxWidth: 1100, margin: "0 auto", padding: "28px 20px" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" },
  toolBar: { display: "grid", gridTemplateColumns: "1fr 200px 160px", gap: 12, marginBottom: 24 },
  buscaWrap: { position: "relative", display: "flex", alignItems: "center" },
  buscaIcon: { position: "absolute", left: 14, fontSize: 15, pointerEvents: "none" },
  buscaInput: { width: "100%", background: "#15181f", border: "1px solid #252a38", borderRadius: 10, color: "#e8eaf0", fontFamily: "inherit", fontSize: 14, padding: "11px 40px", outline: "none" },
  clearBtn: { position: "absolute", right: 12, background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13 },
  select: { background: "#15181f", border: "1px solid #252a38", borderRadius: 10, color: "#e8eaf0", fontFamily: "inherit", fontSize: 13, padding: "11px 14px", outline: "none" },
  layout: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" },
  lista: { display: "flex", flexDirection: "column", gap: 10 },
  tccCard: { background: "#15181f", border: "1px solid #252a38", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", transition: "all 0.2s" },
  tccCardAtivo: { background: "rgba(91,108,255,0.04)" },
  tccIconBox: { width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tccTitulo: { fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.4 },
  tccAutor: { fontSize: 12, color: "#9ca3af", marginBottom: 8 },
  tccMeta: { display: "flex", gap: 8, flexWrap: "wrap" },
  cursoPill: { fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999 },
  anoPill: { fontSize: 11, fontWeight: 600, color: "#6b7280", background: "#1c202b", padding: "2px 10px", borderRadius: 999 },
  tccStats: { display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" },
  statItem: { display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6b7280" },
  emptyCard: { background: "#15181f", border: "1px dashed #252a38", borderRadius: 14, padding: "52px 24px", textAlign: "center" },
  painel: { background: "#15181f", border: "1px solid #252a38", borderRadius: 14, position: "sticky", top: 80, minHeight: 400 },
  painelVazio: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, textAlign: "center", padding: 32 },
  painelConteudo: { padding: "24px" },
  painelCursoPill: { display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 999, marginBottom: 10 },
  painelTitulo: { fontSize: 17, fontWeight: 800, lineHeight: 1.4, marginBottom: 18 },
  painelInfoGrid: { marginBottom: 18 },
  painelLabel: { fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 },
  painelResumo: { fontSize: 13, color: "#9ca3af", lineHeight: 1.7 },
  keyword: { background: "#1c202b", border: "1px solid #252a38", borderRadius: 999, padding: "3px 10px", fontSize: 11, color: "#a78bfa" },
  btnBaixar: { width: "100%", padding: "12px", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
};