import React, { useEffect, useState } from "react";
import "./BoletimSemestre.css";

function BoletimSemestre({ usuario }) {
  const [disciplinas, setDisciplinas] = useState([]);
  const alunoId = usuario?.id;

  useEffect(() => {
    if (!alunoId) return;

    async function buscarBoletim() {
      try {
        const response = await fetch(
          `http://localhost:5000/matriculas/aluno/${alunoId}`
        );
        const data = await response.json();

        const cursando = data.filter((mat) => mat.status === "Cursando");
        setDisciplinas(cursando);
      } catch (error) {
        console.error("Erro ao buscar boletim:", error);
      }
    }

    buscarBoletim();
  }, [alunoId]);

  return (
    <div className="boletim-container">
      <h2>Minhas Disciplinas</h2>

      <table className="boletim-tabela">
        <thead>
          <tr>
            <th>Disciplina</th>
            <th>Nota 1</th>
            <th>Nota 2</th>
            <th>Média</th>
            <th>Faltas</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {disciplinas.length > 0 ? (
            disciplinas.map((mat) => (
              <tr key={mat._id}>
                <td>{mat.disciplina.nome}</td>
                <td>{mat.nota1}</td>
                <td>{mat.nota2}</td>
                <td>{mat.media.toFixed(1)}</td>
                <td>{mat.faltas}</td>
                <td className={`status ${mat.status.replace(/\s/g, "")}`}>
                  {mat.status}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">Nenhuma disciplina em andamento.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BoletimSemestre;