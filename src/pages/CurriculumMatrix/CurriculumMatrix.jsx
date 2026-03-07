import { useState, useEffect } from "react";
import "./CurriculumMatrix.css";

export default function MatrizCurricular() {
  const [matrizes, setMatrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/matrizes-curriculares")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar matrizes.");
        return res.json();
      })
      .then((data) => {
        setMatrizes(data);
        setLoading(false);
      })
      .catch((err) => {
        setErro(err.message);
        setLoading(false);
      });
  }, []);

  const matricesFiltradas = matrizes.filter((m) =>
    m.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="mc-page">
      <div className="mc-bg-decoration" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <header className="mc-header">
        <div className="mc-header-inner">
          <div className="mc-badge">Acadêmico</div>
          <h1 className="mc-title">
            Matrizes
            <br />
            <em>Curriculares</em>
          </h1>
          <p className="mc-subtitle">
            Estruturas de formação disponíveis na instituição
          </p>
        </div>
      </header>

      <main className="mc-main">
        <div className="mc-toolbar">
          <div className="mc-search-wrapper">
            <svg className="mc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="mc-search"
              type="text"
              placeholder="Buscar matriz..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {busca && (
              <button className="mc-search-clear" onClick={() => setBusca("")}>
                ×
              </button>
            )}
          </div>
          <div className="mc-count">
            {!loading && !erro && (
              <span>
                {matricesFiltradas.length}{" "}
                {matricesFiltradas.length === 1 ? "resultado" : "resultados"}
              </span>
            )}
          </div>
        </div>

        {loading && (
          <div className="mc-loading">
            <div className="mc-spinner">
              <span /><span /><span />
            </div>
            <p>Carregando matrizes...</p>
          </div>
        )}

        {erro && (
          <div className="mc-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{erro}</p>
          </div>
        )}

        {!loading && !erro && matricesFiltradas.length === 0 && (
          <div className="mc-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            <p>Nenhuma matriz encontrada.</p>
          </div>
        )}

        {!loading && !erro && matricesFiltradas.length > 0 && (
          <ul className="mc-list">
            {matricesFiltradas.map((matriz, index) => (
              <li
                className="mc-item"
                key={matriz._id}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="mc-item-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="mc-item-content">
                  <span className="mc-item-name">{matriz.nome}</span>
                  <span className="mc-item-id">ID: {matriz._id}</span>
                </div>
                <div className="mc-item-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}