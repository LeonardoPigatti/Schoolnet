import { useState, useEffect } from "react";
import "./Ofertas.css";

export default function Ofertas() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const cursoId = usuario?.cursoCoordenado;

  useEffect(() => {
    if (!cursoId) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`http://localhost:5000/disciplinas/curso/${cursoId}`).then((r) => r.json()),
      fetch(`http://localhost:5000/ofertas/curso/${cursoId}`).then((r) => r.json()),
    ])
      .then(([disciplinasData, ofertasData]) => {
        setDisciplinas(disciplinasData);
        setOfertas(ofertasData);
        setLoading(false);
      })
      .catch((err) => {
        setErro("Erro ao carregar dados.");
        setLoading(false);
      });
  }, []);

  // Retorna a oferta de uma disciplina, se existir
  const getOferta = (disciplinaId) =>
    ofertas.find((o) => o.disciplina._id === disciplinaId || o.disciplina === disciplinaId);

  const handleAlternar = async (disciplina) => {
    const oferta = getOferta(disciplina._id);

    try {
      if (!oferta) {
        // Cria a oferta e já ativa
        const res = await fetch("http://localhost:5000/ofertas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ disciplinaId: disciplina._id }),
        });
        const nova = await res.json();
        // Alterna pra ativa logo após criar
        const res2 = await fetch(`http://localhost:5000/ofertas/${nova._id}/alternar`, {
          method: "PATCH",
        });
        const atualizada = await res2.json();
        setOfertas((prev) => [...prev, atualizada]);
      } else {
        // Alterna ativa/inativa
        const res = await fetch(`http://localhost:5000/ofertas/${oferta._id}/alternar`, {
          method: "PATCH",
        });
        const atualizada = await res.json();
        setOfertas((prev) =>
          prev.map((o) => (o._id === atualizada._id ? atualizada : o))
        );
      }
    } catch (err) {
      alert("Erro ao atualizar oferta.");
    }
  };

  const disciplinasFiltradas = disciplinas.filter((d) =>
    d.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="of-page">
      <div className="of-bg-decoration" aria-hidden="true">
        <span /><span /><span />
      </div>

      <header className="of-header">
        <div className="of-header-inner">
          <div className="of-badge">Coordenação</div>
          <h1 className="of-title">
            Ofertas de<br />
            <em>Disciplinas</em>
          </h1>
          <p className="of-subtitle">
            Defina quais disciplinas estarão disponíveis neste semestre
          </p>
        </div>
      </header>

      <main className="of-main">

        {loading && (
          <div className="of-loading">
            <div className="of-spinner">
              <span /><span /><span />
            </div>
            <p>Carregando disciplinas...</p>
          </div>
        )}

        {erro && (
          <div className="of-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{erro}</p>
          </div>
        )}

        {!loading && !erro && !cursoId && (
          <div className="of-empty">
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
            <div className="of-toolbar">
              <div className="of-search-wrapper">
                <svg className="of-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="of-search"
                  type="text"
                  placeholder="Buscar disciplina..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                {busca && (
                  <button className="of-search-clear" onClick={() => setBusca("")}>×</button>
                )}
              </div>
              <div className="of-count">
                <span>{disciplinasFiltradas.length}{" "}
                  {disciplinasFiltradas.length === 1 ? "disciplina" : "disciplinas"}
                </span>
              </div>
            </div>

            {disciplinasFiltradas.length === 0 && (
              <div className="of-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
                <p>Nenhuma disciplina encontrada.</p>
              </div>
            )}

            {disciplinasFiltradas.length > 0 && (
              <ul className="of-list">
                {disciplinasFiltradas.map((disciplina, index) => {
                  const oferta = getOferta(disciplina._id);
                  const ativa = oferta?.ativa ?? false;

                  return (
                    <li
                      className={`of-item ${ativa ? "of-item--ativa" : ""}`}
                      key={disciplina._id}
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="of-item-index">{String(index + 1).padStart(2, "0")}</div>
                      <div className="of-item-content">
                        <span className="of-item-name">{disciplina.nome}</span>
                        <div className="of-item-meta">
                          <span>⏱ {disciplina.cargaHoraria}h</span>
                          <span>📘 {disciplina.tipo}</span>
                          <span>💰 R$ {disciplina.valor}</span>
                        </div>
                      </div>
                      <button
                        className={`of-toggle ${ativa ? "of-toggle--ativa" : ""}`}
                        onClick={() => handleAlternar(disciplina)}
                      >
                        {ativa ? "Disponível" : "Indisponível"}
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