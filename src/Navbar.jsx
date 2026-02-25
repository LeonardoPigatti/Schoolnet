import { useState, useRef, useEffect } from "react";
import "./Navbar.css";

function Navbar({ usuario, onSair }) {
  const [openMenu, setOpenMenu] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menus = {
    usuario: [
      "Alterar Senha",
      "Certificados",
      "Crédito de Impressão",
      "Ocorrências",
      "Perfil",
      "Mentor",
      "E-mail",
      "Mensagens",
      "Meus Cursos",
      "Sistemas",
      "Sair",
    ],
    secretaria: [
      "Calendário Acadêmico",
      "Documentos Institucionais",
      "Horário de Aulas",
      "Matriz Curricular",
      "Notas e Faltas",
      "Professores",
      "Rematrícula",
    ],
    financeiro: [
      "Documentos de Matrícula",
      "Extrato",
      "Pré-Negociação",
      "Renovações de Bolsa",
      "Regularização de Débitos",
    ],
    pagfacil: ["Adesão", "Prorrogação", "Renovação"],
    atividades: [
      "Atividades Complementares",
      "Atividades de Extensão",
      "Projeto Interdisciplinar",
      "Estágio",
      "TCC",
      "Projeto de Pesquisa",
      "Apoio à Pesquisa",
    ],
    requerimentos: [
      "Requerimentos",
      "Diploma",
      "Documentos",
      "Guarda Religiosa",
      "Licença Médica",
      "Outros Requerimentos",
    ],
    spa: [
      "Sistema Programado Avaliação",
      "Material de Apoio RE",
      "Avaliações RE",
    ],
    material: [
      "Cronograma",
      "Perguntas Frequentes",
      "Plano de Ensino",
      "Manual Schoolnet",
      "Repositório Institucional",
    ],
    dp: ["Minhas DPs", "Avaliações DP Modular"],
  };

  const menuLabels = [
    { id: "secretaria", label: "Secretaria" },
    { id: "financeiro", label: "Financeiro" },
    { id: "pagfacil", label: "PagFácil" },
    { id: "atividades", label: "Atividades Acadêmicas" },
    { id: "requerimentos", label: "Requerimentos" },
    { id: "spa", label: "SPA e RE" },
    { id: "material", label: "Material de Apoio" },
    { id: "dp", label: "DP Modular" },
  ];

  return (
    <>
      {/* Barra azul */}
      <div className="top-bar">
        <div className="top-content">
          <h1 className="logo">Schoolnet</h1>

          {/* Usuário */}
          <div ref={dropdownRef} className="menu-item">
            <span
              className="user-area"
              onClick={() =>
                setOpenMenu(openMenu === "usuario" ? null : "usuario")
              }
            >
              Aluno RA: 110542 ▾
            </span>

            {openMenu === "usuario" && (
              <div className="dropdown-menu">
                {menus.usuario.map((item, index) => (
                  <div key={index} className="dropdown-item">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra cinza */}
      <div className="menu-bar">
        <div className="menu-content">
          {menuLabels.map((menu) => (
            <div key={menu.id} className="menu-item">
              <span
                className="menu-link"
                onClick={() =>
                  setOpenMenu(openMenu === menu.id ? null : menu.id)
                }
              >
                {menu.label} ▾
              </span>

              {openMenu === menu.id && (
                <div className="dropdown-menu">
                  {menus[menu.id].map((item, index) => (
                    <div key={index} className="dropdown-item">
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Navbar;