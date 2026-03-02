import React, { useState } from "react";
import "./PagFacil.css";

function PagFacil({ alunoId }) {
  const [renda, setRenda] = useState("");
  const [escolaPublica, setEscolaPublica] = useState(false);
  const [notasAltas, setNotasAltas] = useState(false);
  const [resultado, setResultado] = useState(null);

  async function enviarFormulario(e) {
    e.preventDefault();

    const response = await fetch(
      `http://localhost:5000/pagfacil/${alunoId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rendaFamiliar: Number(renda),
          escolaPublica,
          notasAltas
        })
      }
    );

    const data = await response.json();
    setResultado(data.bolsa);
  }

  return (
    <div className="pagfacil-container">
      <h2>Programa PagFácil</h2>

      <form onSubmit={enviarFormulario}>
        <label>Renda Familiar:</label>
        <input
          type="number"
          value={renda}
          onChange={(e) => setRenda(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            onChange={(e) => setEscolaPublica(e.target.checked)}
          />
          Estudou em escola pública
        </label>

        <label>
          <input
            type="checkbox"
            onChange={(e) => setNotasAltas(e.target.checked)}
          />
          Possui notas altas
        </label>

        <button type="submit">Calcular Bolsa</button>
      </form>

      {resultado !== null && (
        <div className="resultado">
          Você ganhou {resultado}% de bolsa 🎉
        </div>
      )}
    </div>
  );
}

export default PagFacil;