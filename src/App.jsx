import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Login from "./components/Login/Login";
import useAuth from "./hooks/useAuth";
import Home from "./pages/Home/Home";
import Rematricula from "./pages/Rematricula/Rematricula";
import Ofertas from "./pages/Ofertas/Ofertas";
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

function AppRoutes({ usuario }) {
  const id = usuario?.alunoId;

  const routes = [
    { path: "/",                         element: <Home nome={usuario.nome} /> },
    { path: "/Mensagens",                element: <Mensagens alunoId={id} /> },
    { path: "/faq",                      element: <PerguntasFrequentes /> },
    { path: "/Certificados",             element: <Certificados alunoId={id} /> },
    { path: "/Ocorrencias",              element: <Ocorrencias alunoId={id} /> },
    { path: "/calendarioacademico",      element: <Calendar usuario={usuario} /> },
    { path: "/documentosinstitucionais", element: <InstitutionalDocuments usuario={usuario} /> },
    { path: "/Perfil",                   element: <PerfilAluno alunoId={id} /> },
    { path: "/rematricula",              element: <Rematricula usuario={usuario} /> },
    { path: "/repositorio",              element: <RepositorioInstitucional /> },
    { path: "/Impressao",                element: <CreditoImpressao alunoId={id} /> },
    { path: "/matrizcurricular",         element: <CurriculumMatrix usuario={usuario} /> },
    { path: "/ofertas",                  element: <Ofertas usuario={usuario} /> },
    { path: "/professores",              element: <ListTeacher userId={id} /> },
    { path: "/horario",                  element: <HorarioAluno alunoId={id} /> },
    { path: "/pagfacil",                 element: <PagFacil alunoId={id} /> },
    { path: "/financeiro",               element: <ExtratoFinanceiro alunoId={id} /> },
    { path: "/AlterarSenha",             element: <AlterarSenha alunoId={id} /> },
    { path: "/AtividadesComplementares", element: <AtividadesComplementares alunoId={id} /> },
    { path: "/Estagio",                  element: <Estagio alunoId={id} /> },
    { path: "/TCC",                      element: <TCC alunoId={id} /> },
    { path: "/Requerimentos",            element: <Requerimentos alunoId={id} /> },
    { path: "/Diploma",                  element: <Diploma alunoId={id} /> },
    { path: "/notas",                    element: <BoletimSemestre usuario={usuario}  /> },
  ];

  return (
    <Routes>
      {routes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Routes>
  );
}

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