import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";
import Calendar from "./Calendar";
import InstitutionalDocuments from "./InstitutionalDocuments";
import CurriculumMatrix from "./CurriculumMatrix";
import ListTeacher from "./ListTeacher";
import BoletimSemestre from "./BoletimSemestre";
import HorarioAluno from "./HorarioAluno";
import ExtratoFinanceiro from "./ExtratoFinanceiro";
import PagFacil from "./PagFacil";

import "./App.css";

/* ============================= */
/*        COMPONENTE LOGIN       */
/* ============================= */

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const resposta = await fetch("http://localhost:5000/alunos/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usuario, senha }),
      });

      const dados = await resposta.json();

      if (dados.sucesso) {
        onLogin({
          nome: dados.nome,
          alunoId: dados.alunoId,
        });
      } else {
        setErro("Usuário ou senha incorretos!");
      }
    } catch (error) {
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

          <button className="botao" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================= */
/*      COMPONENTE LOGADO        */
/* ============================= */

function BemVindo({ usuario, onSair }) {
  return (
    <div className="pagina">
      <Navbar usuario={usuario.nome} onSair={onSair} />

      <div className="conteudo">
        <Routes>
          <Route
            path="/"
            element={
              <div className="card">
                <h1 className="titulo">
                  Bem-vindo, {usuario.nome}! 👋
                </h1>
                <p className="subtitulo">
                  Você está logado com sucesso.
                </p>
              </div>
            }
          />

          <Route path="/calendarioacademico" element={<Calendar />} />
          <Route
            path="/documentosinstitucionais"
            element={<InstitutionalDocuments />}
          />

          <Route
            path="/matrizcurricular"
            element={<CurriculumMatrix userId={usuario?.alunoId} />}
          />

          <Route
            path="/professores"
            element={<ListTeacher userId={usuario?.alunoId} />}
          />

          <Route
            path="/horario"
            element={<HorarioAluno alunoId={usuario?.alunoId} />}
          />

          <Route
            path="/pagfacil"
            element={<PagFacil alunoId={usuario?.alunoId} />}
          />

          <Route
            path="/financeiro"
            element={<ExtratoFinanceiro alunoId={usuario?.alunoId} />}
          />

          <Route
            path="/notas"
            element={
              <BoletimSemestre
                alunoId={usuario?.alunoId}
                semestre={1}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

/* ============================= */
/*             APP               */
/* ============================= */

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  function handleLogin(dados) {
    localStorage.setItem("usuario", JSON.stringify(dados));
    setUsuarioLogado(dados);
  }

  function handleSair() {
    localStorage.removeItem("usuario");
    setUsuarioLogado(null);
  }

  return (
    <Router>
      {usuarioLogado ? (
        <BemVindo usuario={usuarioLogado} onSair={handleSair} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </Router>
  );
}

export default App;