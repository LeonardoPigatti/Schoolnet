import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
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
      "Mensagens",
      "Meus Cursos",
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
      "Extrato",
      "PagFacil",
    ],
    atividades: [
      "Atividades Complementares",
      "Estágio",
      "TCC",
    ],
    requerimentos: [
      "Diploma",
      "Documentos",
    ],
    spa: [
      "Sistema Programado Avaliação",
      "Material de Apoio RE",
      "Avaliações RE",
    ],
    material: [
      "Cronograma",
      "Perguntas Frequentes",
      "Manual Schoolnet",
      "Repositório Institucional",
    ],
    dp: ["Minhas DPs"],
  };

  const menuLabels = [
    { id: "secretaria", label: "Secretaria" },
    { id: "financeiro", label: "Financeiro" },
    { id: "atividades", label: "Atividades Acadêmicas" },
    { id: "requerimentos", label: "Requerimentos" },
    { id: "spa", label: "SPA e RE" },
    { id: "material", label: "Material de Apoio" },
    { id: "dp", label: "DP Modular" },
  ];

  return (
    <>
      <div className="top-bar">
        <div className="top-content">
          <h1 className="logo">Schoolnet</h1>

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
                {menus.usuario.map((item, index) =>
                  item === "Sair" ? (
                    <div
                      key={index}
                      className="dropdown-item"
                      onClick={onSair}
                    >
                      {item}
                    </div>
                  ) : (
                    <div key={index} className="dropdown-item">
                      {item}
                    </div>
                  )
                )}
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
                onClick={() =>
                  setOpenMenu(openMenu === menu.id ? null : menu.id)
                }
              >
                {menu.label} ▾
              </span>

              {openMenu === menu.id && (
                <div className="dropdown-menu">
                  {menus[menu.id].map((item, index) =>
                    item === "Calendário Acadêmico" ? (
                      <Link
                        key={index}
                        to="/calendario"
                        className="dropdown-item"
                        onClick={() => setOpenMenu(null)}
                      >
                        {item}
                      </Link>
                    ) : (
                      <div key={index} className="dropdown-item">
                        {item}
                      </div>
                    )
                  )}
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