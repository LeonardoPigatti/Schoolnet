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
import Ocorrencias from "./pages/Ocorrencia/Ocorrencia";
import PerguntasFrequentes from "./pages/Faq/Faq";
import Mensagens from "./pages/Mensagens/Mensagens";
import RepositorioInstitucional from "./pages/Repositorio/Repositorio";

import "./App.css";

/* ============================= */
/*           CONSTANTES          */
/* ============================= */

const API_URL = "http://localhost:5000";

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

/* ============================= */
/*      HOME (ROTA PADRÃO)       */
/* ============================= */

function Home({ nome }) {
  return (
    <div className="card">
      <h1 className="titulo">Bem-vindo, {nome}! 👋</h1>
      <p className="subtitulo">Você está logado com sucesso.</p>
    </div>
  );
}

/* ============================= */
/*        ROTAS DO ALUNO         */
/* ============================= */

function AppRoutes({ usuario }) {
  const id = usuario?.alunoId;

  const routes = [
    { path: "/",                       element: <Home nome={usuario.nome} /> },
    { path: "/Mensagens",              element: <Mensagens alunoId={id} /> },
    { path: "/faq",                    element: <PerguntasFrequentes /> },
    { path: "/Certificados",           element: <Certificados alunoId={id} /> },
    { path: "/Ocorrencias",            element: <Ocorrencias alunoId={id} /> },
    { path: "/calendarioacademico",    element: <Calendar /> },
    { path: "/documentosinstitucionais", element: <InstitutionalDocuments /> },
    { path: "/Perfil",                 element: <PerfilAluno alunoId={id} /> },
    { path: "/repositorio",            element: <RepositorioInstitucional /> },
    { path: "/Impressao",              element: <CreditoImpressao alunoId={id} /> },
    { path: "/matrizcurricular",       element: <CurriculumMatrix userId={id} /> },
    { path: "/professores",            element: <ListTeacher userId={id} /> },
    { path: "/horario",                element: <HorarioAluno alunoId={id} /> },
    { path: "/pagfacil",               element: <PagFacil alunoId={id} /> },
    { path: "/financeiro",             element: <ExtratoFinanceiro alunoId={id} /> },
    { path: "/AlterarSenha",           element: <AlterarSenha alunoId={id} /> },
    { path: "/AtividadesComplementares", element: <AtividadesComplementares alunoId={id} /> },
    { path: "/Estagio",                element: <Estagio alunoId={id} /> },
    { path: "/TCC",                    element: <TCC alunoId={id} /> },
    { path: "/Requerimentos",          element: <Requerimentos alunoId={id} /> },
    { path: "/Diploma",                element: <Diploma alunoId={id} /> },
    { path: "/notas",                  element: <BoletimSemestre alunoId={id} semestre={1} /> },
  ];

  return (
    <Routes>
      {routes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Routes>
  );
}

/* ============================= */
/*      LAYOUT AUTENTICADO       */
/* ============================= */

function AuthLayout({ usuario, onSair }) {
  return (
    <div className="pagina">
      <Navbar usuario={usuario.nome} onSair={onSair} />
      <div className="conteudo">
        <AppRoutes usuario={usuario} />
      </div>
    </div>
  );
}

/* ============================= */
/*             APP               */
/* ============================= */

function useAuth() {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  function login(dados) {
    localStorage.setItem("usuario", JSON.stringify(dados));
    setUsuario(dados);
  }

  function logout() {
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  return { usuario, login, logout };
}

export default function App() {
  const { usuario, login, logout } = useAuth();

  return (
    <Router>
      {usuario
        ? <AuthLayout usuario={usuario} onSair={logout} />
        : <Login onLogin={login} />
      }
    </Router>
  );
}