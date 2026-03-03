import React, { useEffect, useState } from "react";
import "./ExtratoFinanceiro.css";

function ExtratoFinanceiro({ alunoId }) {
  const [parcelas, setParcelas] = useState([]);
  const [totalBruto, setTotalBruto] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [totalLiquido, setTotalLiquido] = useState(0);
  const [bolsa, setBolsa] = useState(0);

  useEffect(() => {
    if (!alunoId) return;

    async function buscarExtrato() {
      const response = await fetch(
        `http://localhost:5000/financeiro/${alunoId}`
      );

      const data = await response.json();

      setParcelas(data.parcelas || []);
      setTotalBruto(data.totalBruto || 0);
      setDesconto(data.desconto || 0);
      setTotalLiquido(data.totalLiquido || 0);
      setBolsa(data.bolsa || 0);
    }

    buscarExtrato();
  }, [alunoId]);

  function calcularDias(vencimento) {
    const hoje = new Date();
    const dataVenc = new Date(vencimento);
    const diff = Math.ceil(
      (dataVenc - hoje) / (1000 * 60 * 60 * 24)
    );

    if (diff <= 0) return "Vencido";
    if (diff <= 10) return `vence em ${diff} dias`;
    return "vence em 30+ dias";
  }

  return (
    <div className="extrato-container">
      <h2>Extrato Financeiro</h2>

      <div className="resumo-financeiro">
        <p><strong>Total Bruto:</strong> R$ {Number(totalBruto).toFixed(2)}</p>
        <p><strong>Bolsa:</strong> {bolsa}%</p>
        <p><strong>Desconto:</strong> R$ {Number(desconto).toFixed(2)}</p>
        <p><strong>Total Final:</strong> R$ {Number(totalLiquido).toFixed(2)}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Data Vencimento</th>
            <th>Dias</th>
            <th>Documento</th>
            <th>Referência</th>
            <th>Valor (R$)</th>
            <th>Título</th>
          </tr>
        </thead>
        <tbody>
          {parcelas.map((p, index) => (
            <tr key={index}>
              <td>{new Date(p.vencimento).toLocaleDateString()}</td>
              <td>{calcularDias(p.vencimento)}</td>
              <td>Boleto Bancário</td>
              <td>{p.referencia}</td>
              <td>{Number(p.valor).toFixed(2)}</td>
              <td>{p.titulo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExtratoFinanceiro;