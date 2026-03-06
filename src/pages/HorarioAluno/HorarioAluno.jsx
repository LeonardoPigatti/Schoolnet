import React, { useEffect, useState } from "react";
import "./HorarioAluno.css";

// Ordena os dias da semana na sequência correta
const ORDEM_DIAS = [
  "Segunda-Feira",
  "Terça-Feira",
  "Quarta-Feira",
  "Quinta-Feira",
  "Sexta-Feira",
  "Sábado",
  "Domingo",
];

function IconePin() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function IconeMapa() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

function HorarioAluno({ alunoId }) {
  const [disciplinas, setDisciplinas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!alunoId) return;

    async function buscarHorario() {
      try {
        const response = await fetch(`http://localhost:5000/boletim/${alunoId}`);
        const data = await response.json();
        if (!Array.isArray(data)) return;
        setDisciplinas(data);
      } catch (error) {
        console.error("Erro ao buscar horário:", error);
      } finally {
        setCarregando(false);
      }
    }

    buscarHorario();
  }, [alunoId]);

  // Agrupa as aulas por dia da semana
  const agrupadoPorDia = disciplinas.reduce((acc, mat) => {
    const dia = mat.disciplina?.horario?.dia || "Sem dia";
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(mat);
    return acc;
  }, {});

  // Dias ordenados conforme a semana
  const diasOrdenados = Object.keys(agrupadoPorDia).sort(
    (a, b) => ORDEM_DIAS.indexOf(a) - ORDEM_DIAS.indexOf(b)
  );

  return (
    <div className="horario-container">
      {/* ── Cabeçalho ── */}
      <div className="horario-header">
        <h1 className="horario-titulo">Horário de Aulas</h1>
        {/* <p className="horario-periodo">Primeiro período de 2026</p> */}
      </div>

      {/* ── Mapa dos Campi ── */}
      {/* <div className="horario-campi-row">
        <span className="campi-label">
          <IconeMapa />
          Mapa dos Campi:
        </span>
        <button className="campi-btn verde">
          <IconePin />
          Araras — Seu Campus
        </button>
        <button className="campi-btn azul">
          <IconePin />
          Santa Bárbara d'Oeste
        </button>
      </div> */}

      {/* ── Conteúdo ── */}
      {carregando ? (
        <p className="horario-vazio">Carregando horário...</p>
      ) : disciplinas.length === 0 ? (
        <p className="horario-vazio">Nenhuma disciplina encontrada.</p>
      ) : (
        diasOrdenados.map((dia) => (
          <div className="horario-dia-bloco" key={dia}>
            <h2 className="horario-dia-titulo">{dia}</h2>

            <table className="horario-tabela">
              <thead>
                <tr>
                  <th className="col-inicio">Início</th>
                  <th className="col-termino">Término</th>
                  <th className="col-horario">Horário</th>
                  <th className="col-disciplina">Disciplina</th>
                  <th className="col-local">Local</th>
                  <th className="col-turma">Turma</th>
                </tr>
              </thead>
              <tbody>
                {agrupadoPorDia[dia].map((mat) => (
                  <tr key={mat._id}>
                    <td className="col-inicio">
                      {mat.disciplina?.horario?.inicio ?? "—"}
                    </td>
                    <td className="col-termino">
                      {mat.disciplina?.horario?.fim ?? "—"}
                    </td>
                    <td className="col-horario">
                      {mat.disciplina?.horario?.tipo ?? "Semanal"}
                    </td>
                    <td className="col-disciplina">
                      {mat.disciplina?.codigo
                        ? `${mat.disciplina.codigo} - ${mat.disciplina.nome}`
                        : mat.disciplina?.nome ?? "—"}
                    </td>
                    <td className="col-local">
                      {mat.disciplina?.sala ?? "—"}
                    </td>
                    <td className="col-turma">
                      {mat.turma ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

export default HorarioAluno;

// TODO ENTENDER POR QUE NÃO MUDOU O SEMANAL

// TODO Colocar sala e codigo