import { useEffect, useState } from "react";
import axios from "axios";
import "./ListTeacher.css";

function Professores() {
  const [professores, setProfessores] = useState([]);
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/professores")
      .then((res) => setProfessores(res.data))
      .catch((err) => console.log(err));
  }, []);

  const professoresFiltrados = professores.filter((prof) =>
    prof.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const infosMockadas = selecionado
    ? {
        departamento: "Departamento de Tecnologia",
        cargaHoraria: "40h",
        projetos: ["Projeto A", "Projeto B"]
      }
    : null;

  return (
    <div className="prof-container">
      <h1 className="prof-title">Buscar Professores</h1>

      <input
        className="prof-input"
        type="text"
        placeholder="Digite o nome do professor..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="prof-list">
        {professoresFiltrados.map((prof) => (
          <div
            key={prof._id}
            className="prof-card"
            onClick={() => setSelecionado(prof)}
          >
            <strong>{prof.nome}</strong>
            <p>{prof.email}</p>
          </div>
        ))}
      </div>

      {selecionado && (
        <div className="prof-detail">
          <h2>Detalhes do Professor</h2>

          <p><strong>Nome:</strong> {selecionado.nome}</p>
          <p><strong>Email:</strong> {selecionado.email}</p>

          <h3>Infos Mockadas</h3>
          <p>Departamento: {infosMockadas.departamento}</p>
          <p>Carga Horária: {infosMockadas.cargaHoraria}</p>

          <p>Projetos:</p>
          <ul>
            {infosMockadas.projetos.map((proj, i) => (
              <li key={i}>{proj}</li>
            ))}
          </ul>

          <button
            className="prof-button"
            onClick={() => setSelecionado(null)}
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}

export default Professores;

// TODO colcoar mais infos do banco
// TODO melhorar visual