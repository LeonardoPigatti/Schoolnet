import React, { useEffect, useState } from "react";
import "./BoletimSemestre.css";

function BoletimSemestre({ alunoId, semestre }) {
  const [disciplinas, setDisciplinas] = useState([]);

  useEffect(() => {
    async function buscarBoletim() {
      try {
        const response = await fetch(
          `http://localhost:5000/boletim/${alunoId}`
        );

        const data = await response.json();

        // Filtrar apenas disciplinas do semestre escolhido
        const filtradas = data.filter(
          (mat) => mat.disciplina.semestre === semestre
        );

        setDisciplinas(filtradas);
      } catch (error) {
        console.error("Erro ao buscar boletim:", error);
      }
    }

    buscarBoletim();
  }, [alunoId, semestre]);

  return (
    <div className="boletim-container">
      <h2>Boletim - {semestre}º Semestre</h2>

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
              <td colSpan="6">Nenhuma disciplina encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BoletimSemestre;