import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Calendar from "./pages/Calendar/Calendar";
import InstitutionalDocuments from "./pages/InstitutionalDocuments/InstitutionalDocuments";
import CurriculumMatrix from "./pages/CurriculumMatrix/CurriculumMatrix";
import ListTeacher from "./pages/ListTeacher/ListTeacher";
import BoletimSemestre from "./pages/BoletimSemestre/BoletimSemestre";
import HorarioAluno from "./pages/HorarioAluno/HorarioAluno";
import ExtratoFinanceiro from "./pages/ExtratoFinanceiro/ExtratoFinanceiro";
import PagFacil from "./pages/PagFacil/PagFacil";
import AtividadesComplementares from "./pages/AtividadesComplementares/AtividadesComplementares";
import Estagio from "./pages/Estagio/Estagio.";
import Requerimentos from "./pages/Requerimentos/Requerimentos";
import Diploma from "./pages/Diploma/Diploma";
import TCC from "./pages/TCC/TCC";
import AlterarSenha from "./pages/MudarSenha/MudarSenha";
import CreditoImpressao from "./pages/CreditosImpressora/CreditosImpressora";
import PerfilAluno from "./pages/PerfilAluno/PerfilAluno";
import Certificados from "./pages/Certificados/Certificados";








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
    // eslint-disable-next-line no-unused-vars
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

          <Route path="/Certificados" element={<Certificados alunoId={usuario?.alunoId} />} />


          <Route path="/calendarioacademico" element={<Calendar />} />
          <Route
            path="/documentosinstitucionais"
            element={<InstitutionalDocuments />}
          />

          <Route path="/Perfil" element={<PerfilAluno alunoId={usuario?.alunoId} />} />


          <Route path="/Impressao" element={<CreditoImpressao alunoId={usuario?.alunoId} />} />


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

          <Route path="/AlterarSenha" element={<AlterarSenha alunoId={usuario?.alunoId} />} />

          <Route
            path="/AtividadesComplementares"
            element={<AtividadesComplementares alunoId={usuario?.alunoId} />}
          />

          <Route
  path="/Estagio"
  element={<Estagio alunoId={usuario?.alunoId} />}
/>

<Route path="/TCC" element={<TCC alunoId={usuario?.alunoId} />} />


<Route path="/Requerimentos" element={<Requerimentos alunoId={usuario?.alunoId} />} />

<Route path="/Diploma" element={<Diploma alunoId={usuario?.alunoId} />} />
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