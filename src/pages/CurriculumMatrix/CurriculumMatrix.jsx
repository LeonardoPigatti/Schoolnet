import { useEffect, useState } from "react";
import axios from "axios";
import "./CurriculumMatrix.css";

function CurriculumMatrix({ userId }) {
  const [curso, setCurso] = useState("");
  const [matriz, setMatriz] = useState({});

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:5000/matriz/${userId}`)
      .then((res) => {
        console.log("Dados recebidos:", res.data);

        setCurso(res.data?.curso || "");
        setMatriz(res.data?.matriz || {});
      })
      .catch((err) => {
        console.log("Erro ao buscar matriz:", err);
      });

  }, [userId]);

  return (
    <div className="matrix-container">
      <h1 className="matrix-title">Matriz Curricular</h1>
      <h2 className="matrix-course">{curso}</h2>

      {Object.keys(matriz || {}).map((semestre) => (
        <div key={semestre} className="period-section">
          <h3 className="period-title">
            Período: {semestre}
          </h3>

          <table className="matrix-table">
            <thead>
              <tr>
                <th>Disciplina</th>
              </tr>
            </thead>

            <tbody>
              {matriz[semestre]?.map((disc, i) => (
                <tr key={i}>
                  <td>{disc?.nome || "Sem nome"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default CurriculumMatrix;

// TODO colocar infos igual do Schoolnet real

// TODO melhorar visualmente 