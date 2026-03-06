import { useState } from "react";
import "./InstitutionalDocuments.css";

function InstitutionalDocuments() {
  const [openMain, setOpenMain] = useState(false);
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (item) => {
    setOpenItem(openItem === item ? null : item);
  };

  return (
    <div className="documents-container">
      <h1>Documentos Institucionais</h1>

      <h2 className="documents-subtitle">Documentação Disponível</h2>

      {/* Collapse Principal */}
      <div className="collapse">
        <div
          className="collapse-header"
          onClick={() => setOpenMain(!openMain)}
        >
          Engenharia da Computação ▾
        </div>

        {openMain && (
          <div className="collapse-content">

            {/* Regulamento */}
            <div className="sub-collapse">
              <div
                className="sub-header"
                onClick={() => toggleItem("regulamento")}
              >
                Regulamento do Curso ▾
              </div>

              {openItem === "regulamento" && (
                <div className="file-item">
                  <a href="#" className="file-link">
                    📄 Regulamento_do_Curso.pdf
                  </a>
                </div>
              )}
            </div>

            {/* Atividades Complementares */}
            <div className="sub-collapse">
              <div
                className="sub-header"
                onClick={() => toggleItem("atividades")}
              >
                Atividades Complementares ▾
              </div>

              {openItem === "atividades" && (
                <div className="file-item">
                  <a href="#" className="file-link">
                    📄 Atividades_Complementares.pdf
                  </a>
                </div>
              )}
            </div>

            {/* Colação de Grau */}
            <div className="sub-collapse">
              <div
                className="sub-header"
                onClick={() => toggleItem("colacao")}
              >
                Colação de Grau ▾
              </div>

              {openItem === "colacao" && (
                <div className="file-item">
                  <a href="#" className="file-link">
                    📄 Colacao_de_Grau.pdf
                  </a>
                </div>
              )}
            </div>

            {/* Termos de Estágio */}
            <div className="sub-collapse">
              <div
                className="sub-header"
                onClick={() => toggleItem("estagio")}
              >
                Termos de Estágio ▾
              </div>

              {openItem === "estagio" && (
                <div className="file-item">
                  <a href="#" className="file-link">
                    📄 Termos_de_Estagio.pdf
                  </a>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default InstitutionalDocuments;

// TODO fazer pegar os documentos corretos do banco
// TODO melhorar o visal e detalhes
