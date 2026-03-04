import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ usuario, onSair }) {
  const [openMenu, setOpenMenu] = useState(null);
  const navbarRef = useRef(null); // ← ref em toda a navbar

  useEffect(() => {
    function handleClickOutside(e) {
      if (navbarRef.current && !navbarRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rotas = {
    "Alterar Senha":             "/AlterarSenha",
    "Crédito de Impressão":      "/Impressao",
    "Perfil":                    "/Perfil",
    "Calendário Acadêmico":      "/calendarioacademico",
    "Documentos Institucionais": "/documentosinstitucionais",
    "Matriz Curricular":         "/matrizcurricular",
    "Notas e Faltas":            "/notas",
    "Professores":               "/professores",
    "Horário de Aulas":          "/horario",
    "Extrato":                   "/financeiro",
    "PagFacil":                  "/pagfacil",
    "Atividades Complementares": "/AtividadesComplementares",
    "Estágio":                   "/Estagio",
    "TCC":                       "/TCC",
    "Diploma":                   "/Diploma",
    "Documentos":                "/Requerimentos",
  };

  const menus = {
    usuario: [
      "Alterar Senha", "Certificados", "Crédito de Impressão",
      "Ocorrências", "Perfil", "Mentor", "Mensagens", "Meus Cursos", "Sair",
    ],
    secretaria: [
      "Calendário Acadêmico", "Documentos Institucionais", "Horário de Aulas",
      "Matriz Curricular", "Notas e Faltas", "Professores", "Rematrícula",
    ],
    financeiro: ["Extrato", "PagFacil"],
    atividades: ["Atividades Complementares", "Estágio", "TCC"],
    requerimentos: ["Diploma", "Documentos"],
    spa: ["Sistema Programado Avaliação", "Material de Apoio RE", "Avaliações RE"],
    material: ["Cronograma", "Perguntas Frequentes", "Manual Schoolnet", "Repositório Institucional"],
    dp: ["Minhas DPs"],
  };

  const menuLabels = [
    { id: "secretaria",    label: "Secretaria" },
    { id: "financeiro",    label: "Financeiro" },
    { id: "atividades",    label: "Atividades Acadêmicas" },
    { id: "requerimentos", label: "Requerimentos" },
    { id: "spa",           label: "SPA e RE" },
    { id: "material",      label: "Material de Apoio" },
    { id: "dp",            label: "DP Modular" },
  ];

  function renderItem(item, index) {
    if (item === "Sair") {
      return (
        <div key={index} className="dropdown-item" onClick={onSair}>
          {item}
        </div>
      );
    }

    const rota = rotas[item];
    if (rota) {
      return (
        <Link
          key={index}
          to={rota}
          className="dropdown-item"
          onClick={() => setOpenMenu(null)}
        >
          {item}
        </Link>
      );
    }

    return (
      <div key={index} className="dropdown-item" style={{ opacity: 0.5, cursor: "not-allowed" }}>
        {item}
      </div>
    );
  }

  return (
    // ↓ ref em todo o wrapper da navbar
    <div ref={navbarRef}>
      <div className="top-bar">
        <div className="top-content">
          <h1 className="logo">Schoolnet</h1>

          <div className="menu-item">
            <span
              className="user-area"
              onClick={() => setOpenMenu(openMenu === "usuario" ? null : "usuario")}
            >
              {usuario?.nome ? `${usuario.nome} ▾` : "Aluno ▾"}
            </span>

            {openMenu === "usuario" && (
              <div className="dropdown-menu">
                {menus.usuario.map((item, index) => renderItem(item, index))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="menu-bar">
        <div className="menu-content">
          {menuLabels.map((menu) => (
            <div key={menu.id} className="menu-item">
              <span
                className="menu-link"
                onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
              >
                {menu.label} ▾
              </span>

              {openMenu === menu.id && (
                <div className="dropdown-menu">
                  {menus[menu.id].map((item, index) => renderItem(item, index))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Navbar;