import React, { useEffect, useState } from "react";
import "./BoletimSemestre.css";

function BoletimSemestre({ usuario }) {
  const [disciplinas, setDisciplinas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const alunoId = usuario?.id ?? usuario?._id;

  useEffect(() => {
    if (!alunoId) return;

    async function buscarBoletim() {
      setCarregando(true);
      try {
        const response = await fetch(
          `http://localhost:5000/matriculas/aluno/${alunoId}`
        );
        const data = await response.json();
        const cursando = data.filter((mat) => mat.status === "Cursando");
        setDisciplinas(cursando);
      } catch (error) {
        console.error("Erro ao buscar boletim:", error);
      } finally {
        setCarregando(false);
      }
    }

    buscarBoletim();
  }, [alunoId]);

  function calcularSituacao(media, faltas) {
    if (faltas >= 25) return "Reprovado por Falta";
    if (media >= 7) return "Aprovado";
    if (media >= 5) return "Recuperação";
    return "Reprovado";
  }

  return (
    <div className="boletim-container">
      <div className="boletim-header-row">
        <div>
          <h1 className="boletim-title">Boletim do Semestre</h1>
          <p className="boletim-subtitle">
            Acompanhe suas notas e frequência nas disciplinas em andamento
          </p>
        </div>
      </div>

      {carregando ? (
        <p className="boletim-estado">Carregando disciplinas...</p>
      ) : disciplinas.length === 0 ? (
        <p className="boletim-estado">Nenhuma disciplina em andamento.</p>
      ) : (
        <div className="boletim-tabela-wrapper">
          <table className="boletim-tabela">
            <thead>
              <tr>
                <th>Disciplina</th>
                <th>Nota 1</th>
                <th>Nota 2</th>
                <th>Média</th>
                <th>Faltas</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {disciplinas.map((mat, i) => {
                const situacao = calcularSituacao(mat.media, mat.faltas);
                return (
                  <tr key={mat._id} style={{ animationDelay: `${i * 60}ms` }}>
                    <td className="boletim-nome-disciplina">
                      {mat.disciplina.nome}
                    </td>
                    <td>{mat.nota1 ?? "—"}</td>
                    <td>{mat.nota2 ?? "—"}</td>
                    <td>
                      <span className="boletim-media">
                        {mat.media != null ? mat.media.toFixed(1) : "—"}
                      </span>
                    </td>
                    <td>{mat.faltas}</td>
                    <td>
                      <span
                        className={`boletim-badge boletim-badge--${situacao
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")}`}
                      >
                        {situacao}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BoletimSemestre;