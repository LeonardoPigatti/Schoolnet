import { useState } from "react";

const API_URL = "http://localhost:5000";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const resposta = await fetch(`${API_URL}/alunos/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usuario, senha }),
      });
      const dados = await resposta.json();

      if (dados.sucesso) {
        onLogin({ nome: dados.nome, alunoId: dados.alunoId });
      } else {
        setErro("Usuário ou senha incorretos!");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (_) {
      setErro("Erro ao conectar com o servidor!");
    }
  }

  return (
    <div className="container-login">
      <div className="card">
        <h1 className="titulo">Autenticação</h1>
        <form onSubmit={handleLogin} className="form">
          <input
            className="input"
            type="text"
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          {erro && <p className="erro">{erro}</p>}
          <button className="botao" type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}