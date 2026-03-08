import { useState, useEffect } from "react";
import "./Rematricula.css";

export default function Rematricula() {
  const [ofertas, setOfertas] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [loadingMatricula, setLoadingMatricula] = useState(null); // id da oferta em processo

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const cursoId = usuario?.curso;
  const alunoId = usuario?.id;

  useEffect(() => {
    if (!cursoId) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`http://localhost:5000/ofertas/curso/${cursoId}`).then((r) => r.json()),
      fetch(`http://localhost:5000/matriculas/aluno/${alunoId}`).then((r) => r.json()),
    ])
      .then(([ofertasData, matriculasData]) => {
        setOfertas(ofertasData.filter((o) => o.ativa));
        setMatriculas(matriculasData);
        setLoading(false);
      })
      .catch(() => {
        setErro("Erro ao carregar dados.");
        setLoading(false);
      });
  }, []);

  const jaMatriculado = (disciplinaId) =>
    matriculas.some((m) => m.disciplina._id === disciplinaId || m.disciplina === disciplinaId);

  const handleMatricular = async (oferta) => {
    const disciplinaId = oferta.disciplina._id;

    if (jaMatriculado(disciplinaId)) return;

    setLoadingMatricula(oferta._id);

    try {
      const res = await fetch("http://localhost:5000/matriculas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId, disciplinaId }),
      });

      const data = await res.json();

      if (data.erro) {
        alert(data.erro);
        return;
      }

      // Atualiza localmente para refletir a matrícula sem recarregar
      setMatriculas((prev) => [...prev, { disciplina: { _id: disciplinaId } }]);
    } catch {
      alert("Erro ao realizar matrícula.");
    } finally {
      setLoadingMatricula(null);
    }
  };

  const ofertasFiltradas = ofertas.filter((o) =>
    o.disciplina.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="re-page">
      <div className="re-bg-decoration" aria-hidden="true">
        <span /><span /><span />
      </div>

      <header className="re-header">
        <div className="re-header-inner">
          <div className="re-badge">Acadêmico</div>
          <h1 className="re-title">
            Re
            <br />
            <em>matrícula</em>
          </h1>
          <p className="re-subtitle">
            Disciplinas disponíveis para matrícula neste semestre
          </p>
        </div>
      </header>

      <main className="re-main">

        {loading && (
          <div className="re-loading">
            <div className="re-spinner">
              <span /><span /><span />
            </div>
            <p>Carregando disciplinas...</p>
          </div>
        )}

        {erro && (
          <div className="re-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{erro}</p>
          </div>
        )}

        {!loading && !erro && !cursoId && (
          <div className="re-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>Nenhum curso vinculado ao seu perfil.</p>
          </div>
        )}

        {!loading && !erro && cursoId && (
          <>
            <div className="re-toolbar">
              <div className="re-search-wrapper">
                <svg className="re-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="re-search"
                  type="text"
                  placeholder="Buscar disciplina..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                {busca && (
                  <button className="re-search-clear" onClick={() => setBusca("")}>×</button>
                )}
              </div>
              <div className="re-count">
                <span>
                  {ofertasFiltradas.length}{" "}
                  {ofertasFiltradas.length === 1 ? "disciplina" : "disciplinas"}
                </span>
              </div>
            </div>

            {ofertasFiltradas.length === 0 && (
              <div className="re-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
                <p>Nenhuma disciplina disponível no momento.</p>
              </div>
            )}

            {ofertasFiltradas.length > 0 && (
              <ul className="re-list">
                {ofertasFiltradas.map((oferta, index) => {
                  const d = oferta.disciplina;
                  const matriculado = jaMatriculado(d._id);
                  const processando = loadingMatricula === oferta._id;

                  return (
                    <li
                      className={`re-item ${matriculado ? "re-item--matriculado" : ""}`}
                      key={oferta._id}
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="re-item-index">{String(index + 1).padStart(2, "0")}</div>
                      <div className="re-item-content">
                        <span className="re-item-name">{d.nome}</span>
                        <div className="re-item-meta">
                          <span>⏱ {d.cargaHoraria}h</span>
                          <span>📘 {d.tipo}</span>
                          <span>💰 R$ {d.valor}</span>
                        </div>
                      </div>
                      <button
                        className={`re-btn ${matriculado ? "re-btn--matriculado" : ""}`}
                        onClick={() => handleMatricular(oferta)}
                        disabled={matriculado || processando}
                      >
                        {processando ? "..." : matriculado ? "Matriculado" : "Matricular"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}