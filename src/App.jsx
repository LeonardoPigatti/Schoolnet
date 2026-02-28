import { useState } from "react";
import Navbar from "./Navbar";
import "./App.css";

function BemVindo({ usuario, onSair }) {
  return (
    <div style={styles.pagina}>
      <Navbar usuario={usuario} onSair={onSair} />

      <div style={styles.conteudo}>
        <div style={styles.card}>
          <h1 style={styles.titulo}>Bem-vindo, {usuario}! 👋</h1>
          <p style={styles.subtitulo}>Você está logado com sucesso.</p>
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const resposta = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario, senha })
      });

      const dados = await resposta.json();

      if (dados.sucesso) {
        onLogin(dados.usuario);
        setErro("");
      } else {
        setErro("Usuário ou senha incorretos!");
      }
    } catch (error) {
      setErro("Erro ao conectar com o servidor!");
    }
  }

  return (
    <div style={styles.containerLogin}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>Autenticação</h1>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          {erro && <p style={styles.erro}>{erro}</p>}

          <button style={styles.botao} type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  if (usuarioLogado) {
    return (
      <BemVindo
        usuario={usuarioLogado}
        onSair={() => setUsuarioLogado(null)}
      />
    );
  }

  return <Login onLogin={(nome) => setUsuarioLogado(nome)} />;
}

const styles = {
  pagina: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "white",
  },
  conteudo: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  containerLogin: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f4f8",
  },
  card: {
    backgroundColor: "#fff",
    padding: "48px 40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  titulo: {
    color: "#4a7fa5",
    fontWeight: 300,
    fontSize: "2rem",
    marginBottom: "16px",
    fontFamily: "sans-serif",
  },
  subtitulo: {
    color: "#888",
    fontSize: "1rem",
    fontFamily: "sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  input: {
    padding: "14px 16px",
    border: "1.5px solid #d0e0f0",
    borderRadius: "8px",
    fontSize: "1rem",
    color: "#555",
    outline: "none",
    fontFamily: "sans-serif",
  },
  botao: {
    marginTop: "8px",
    padding: "14px",
    backgroundColor: "#4a7fa5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    fontFamily: "sans-serif",
    width: "100%",
  },
  erro: {
    color: "#e05555",
    fontSize: "0.9rem",
    fontFamily: "sans-serif",
    margin: 0,
  },
};

export default App;