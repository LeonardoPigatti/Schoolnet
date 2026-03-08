import { useState, useEffect, useRef } from "react";
import "./InstitutionalDocuments.css";

const API_URL = "http://localhost:5000";

const CATEGORIAS = [
  "Regulamento do Curso",
  "Atividades Complementares",
  "Colação de Grau",
  "Termos de Estágio",
  "Outro",
];

// ── Modal de confirmação de exclusão ────────────────────────────────
function ModalConfirmarExclusao({ onConfirmar, onCancelar }) {
  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-titulo">Remover Documento</h3>
        <p className="modal-descricao">
          Tem certeza que deseja remover este documento? Esta ação não pode ser
          desfeita.
        </p>
        <div className="modal-acoes">
          <button className="btn-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn-deletar-confirmar" onClick={onConfirmar}>
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de novo documento ─────────────────────────────────────────
function ModalNovoDocumento({ professorId, onSalvo, onFechar }) {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [arquivo, setArquivo] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const inputRef = useRef(null);

  function handleArquivo(e) {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      setErro("Apenas arquivos PDF são permitidos.");
      return;
    }
    setErro("");
    setArquivo(file || null);
  }

  async function handleSalvar() {
    if (!titulo.trim()) {
      setErro("Preencha o título.");
      return;
    }
    if (!arquivo) {
      setErro("Selecione um arquivo PDF.");
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      const form = new FormData();
      form.append("titulo", titulo);
      form.append("categoria", categoria);
      form.append("cursos", JSON.stringify([]));
      form.append("arquivo", arquivo);

      const res = await fetch(
        `${API_URL}/documentos-institucionais/${professorId}`,
        {
          method: "POST",
          body: form,
        }
      );

      const dados = await res.json();

      if (dados.erro) {
        setErro(dados.erro);
        return;
      }

      onSalvo();
      onFechar();
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-titulo">Novo Documento</h3>

        <label className="modal-label">Título</label>
        <input
          className="modal-input"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Regulamento 2025"
        />

        <label className="modal-label">Categoria</label>
        <select
          className="modal-input"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {CATEGORIAS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <label className="modal-label">Arquivo PDF</label>
        <div className="upload-area" onClick={() => inputRef.current.click()}>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handleArquivo}
          />

          {arquivo ? (
            <span className="upload-nome">📄 {arquivo.name}</span>
          ) : (
            <span className="upload-placeholder">
              Clique para selecionar um PDF
            </span>
          )}
        </div>

        {erro && <p className="modal-erro">{erro}</p>}

        <div className="modal-acoes">
          <button className="btn-cancelar" onClick={onFechar}>
            Cancelar
          </button>

          <button
            className="btn-salvar"
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando ? "Enviando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de edição ─────────────────────────────────────────────────
function ModalEditarDocumento({ professorId, doc, onSalvo, onFechar }) {
  const [titulo, setTitulo] = useState(doc.titulo);
  const [categoria, setCategoria] = useState(doc.categoria);
  const [arquivo, setArquivo] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const inputRef = useRef(null);

  function handleArquivo(e) {
    const file = e.target.files[0];

    if (file && file.type !== "application/pdf") {
      setErro("Apenas arquivos PDF são permitidos.");
      return;
    }

    setErro("");
    setArquivo(file || null);
  }

  async function handleSalvar() {
    if (!titulo.trim()) {
      setErro("Preencha o título.");
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      let body;
      let headers = {};

      if (arquivo) {
        const form = new FormData();
        form.append("titulo", titulo);
        form.append("categoria", categoria);
        form.append("arquivo", arquivo);
        body = form;
      } else {
        body = JSON.stringify({ titulo, categoria });
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(
        `${API_URL}/documentos-institucionais/${professorId}/${doc._id}`,
        { method: "PATCH", headers, body }
      );

      const dados = await res.json();

      if (dados.erro) {
        setErro(dados.erro);
        return;
      }

      onSalvo();
      onFechar();
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-titulo">Editar Documento</h3>

        <label className="modal-label">Título</label>
        <input
          className="modal-input"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <label className="modal-label">Categoria</label>
        <select
          className="modal-input"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {CATEGORIAS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <label className="modal-label">Substituir PDF (opcional)</label>
        <div className="upload-area" onClick={() => inputRef.current.click()}>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handleArquivo}
          />

          {arquivo ? (
            <span className="upload-nome">📄 {arquivo.name}</span>
          ) : (
            <span className="upload-placeholder">
              Clique para substituir o PDF atual
            </span>
          )}
        </div>

        {erro && <p className="modal-erro">{erro}</p>}

        <div className="modal-acoes">
          <button className="btn-cancelar" onClick={onFechar}>
            Cancelar
          </button>

          <button
            className="btn-salvar"
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────
export default function InstitutionalDocuments({ usuario }) {
  const [documentos, setDocumentos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [openCategoria, setOpenCategoria] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [docEditando, setDocEditando] = useState(null);
  const [docParaDeletar, setDocParaDeletar] = useState(null);

  const ehCoordenador = usuario?.tipoProfessor === "coordenador";
  const ehAluno = usuario?.perfil === "aluno";

  const professorId = usuario?.id ?? usuario?._id;

  const cursoId = ehAluno
    ? usuario?.curso
    : ehCoordenador
    ? usuario?.cursoCoordenado
    : null;

  async function buscarDocumentos() {
    setCarregando(true);

    try {
      const query = cursoId ? `?cursoId=${cursoId}` : "";
      const res = await fetch(`${API_URL}/documentos-institucionais${query}`);
      const dados = await res.json();

      setDocumentos(dados);
    } catch {
      setDocumentos({});
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarDocumentos();
  }, []);

  async function confirmarExclusao() {
    if (!docParaDeletar) return;

    try {
      await fetch(
        `${API_URL}/documentos-institucionais/${professorId}/${docParaDeletar}`,
        { method: "DELETE" }
      );

      buscarDocumentos();
    } catch {
      alert("Erro ao remover documento.");
    } finally {
      setDocParaDeletar(null);
    }
  }

  const categorias = Object.keys(documentos);

  return (
    <div className="documents-container">
      <div className="documents-header-row">
        <div>
          <h1 className="documents-title">Documentos Institucionais</h1>
          <p className="documents-subtitle">
            Acervo disponibilizados para referência oficial
          </p>
        </div>

        {ehCoordenador && (
          <button
            className="btn-novo-doc"
            onClick={() => setModalAberto(true)}
          >
            + Novo Documento
          </button>
        )}
      </div>

      {carregando ? (
        <p className="documents-estado">Carregando documentos...</p>
      ) : categorias.length === 0 ? (
        <p className="documents-estado">Nenhum documento disponível.</p>
      ) : (
        <div className="collapse">
          {categorias.map((categoria) => (
            <div key={categoria}>
              <div
                className="collapse-header"
                onClick={() =>
                  setOpenCategoria(
                    openCategoria === categoria ? null : categoria
                  )
                }
              >
                <span className="collapse-arrow">
                  {openCategoria === categoria ? "▾" : "▸"}
                </span>
                {categoria}
              </div>

              {openCategoria === categoria && (
                <div className="collapse-content">
                  <div className="sub-collapse">
                    {documentos[categoria].map((doc) => (
                      <div
                        key={doc._id}
                        className="file-item file-item-row"
                      >
                        <a
                          href={`${API_URL}${doc.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="file-link"
                        >
                          {doc.titulo}
                        </a>

                        {ehCoordenador && (
                          <div className="file-acoes">
                            <button
                              className="btn-editar"
                              onClick={() => setDocEditando(doc)}
                              title="Editar documento"
                            >
                              ✎
                            </button>

                            <button
                              className="btn-deletar"
                              onClick={() => setDocParaDeletar(doc._id)}
                              title="Remover documento"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <ModalNovoDocumento
          professorId={professorId}
          onSalvo={buscarDocumentos}
          onFechar={() => setModalAberto(false)}
        />
      )}

      {docEditando && (
        <ModalEditarDocumento
          professorId={professorId}
          doc={docEditando}
          onSalvo={buscarDocumentos}
          onFechar={() => setDocEditando(null)}
        />
      )}

      {docParaDeletar && (
        <ModalConfirmarExclusao
          onConfirmar={confirmarExclusao}
          onCancelar={() => setDocParaDeletar(null)}
        />
      )}
    </div>
  );
}

// TODO colocar possibilidade de colocar arquivos zipados e reorganizar no banco
// TODO Cordernador pode editar arquivos enviados e está bugado
// TODO baixar arquivos zipados
// TODO melhorar detalhes visuais