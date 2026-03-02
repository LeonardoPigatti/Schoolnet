import React, { useEffect, useState } from "react";
import "./HorarioAluno.css";

function HorarioAluno({ alunoId }) {
  const [disciplinas, setDisciplinas] = useState([]);

  useEffect(() => {
    if (!alunoId) return;

    async function buscarHorario() {
      try {
        const response = await fetch(
          `http://localhost:5000/boletim/${alunoId}`
        );

        const data = await response.json();

        if (!Array.isArray(data)) return;

        setDisciplinas(data);
      } catch (error) {
        console.error("Erro ao buscar horário:", error);
      }
    }

    buscarHorario();
  }, [alunoId]);

  return (
    <div className="horario-container">
      <h2>Horário das Aulas</h2>

      <table className="horario-tabela">
        <thead>
          <tr>
            <th>Disciplina</th>
            <th>Dia</th>
            <th>Início</th>
            <th>Fim</th>
            <th>Sala</th>
          </tr>
        </thead>
        <tbody>
          {disciplinas.length > 0 ? (
            disciplinas.map((mat) => (
              <tr key={mat._id}>
                <td>{mat.disciplina.nome}</td>
                <td>{mat.disciplina.horario?.dia}</td>
                <td>{mat.disciplina.horario?.inicio}</td>
                <td>{mat.disciplina.horario?.fim}</td>
                <td>{mat.disciplina.sala}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Nenhuma disciplina encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default HorarioAluno;