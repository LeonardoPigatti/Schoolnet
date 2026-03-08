const DocumentoInstitucional = require("../models/DocumentoInstitucional");
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// ── Configuração do multer ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/documentos");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const nome = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, nome);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Apenas arquivos PDF são permitidos."));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const uploadMiddleware = upload.single("arquivo");

// ── LISTAR ──────────────────────────────────────────────────────────
const listar = async (req, res) => {
  try {
    const { cursoId } = req.query;

    const filtro = cursoId
      ? { $or: [{ cursos: cursoId }, { cursos: { $size: 0 } }] }
      : {};

    const documentos = await DocumentoInstitucional.find(filtro)
      .populate("cursos", "nome")
      .populate("enviadoPor", "nome")
      .sort({ categoria: 1, createdAt: -1 });

    const agrupado = documentos.reduce((acc, doc) => {
      const cat = doc.categoria;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({
        _id:        doc._id,
        titulo:     doc.titulo,
        url:        doc.url,
        cursos:     doc.cursos,
        enviadoPor: doc.enviadoPor?.nome,
        criadoEm:   doc.createdAt,
      });
      return acc;
    }, {});

    res.json(agrupado);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// ── CRIAR ────────────────────────────────────────────────────────────
const criar = async (req, res) => {
  try {
    const { titulo, categoria, cursos } = req.body;
    const { professorId } = req.params;

    if (!req.file) return res.status(400).json({ erro: "Nenhum arquivo enviado." });

    const url = `/uploads/documentos/${req.file.filename}`;

    const doc = await DocumentoInstitucional.create({
      titulo,
      categoria,
      url,
      cursos: cursos ? JSON.parse(cursos) : [],
      enviadoPor: professorId,
    });

    res.status(201).json({ mensagem: "Documento criado com sucesso!", documento: doc });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// ── DELETAR ──────────────────────────────────────────────────────────
const deletar = async (req, res) => {
  try {
    const doc = await DocumentoInstitucional.findByIdAndDelete(req.params.documentoId);
    if (!doc) return res.status(404).json({ erro: "Documento não encontrado" });

    const filePath = path.join(__dirname, "..", doc.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ mensagem: "Documento removido com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// ── EDITAR ───────────────────────────────────────────────────────────
const editar = async (req, res) => {
  try {
    const docAtual = await DocumentoInstitucional.findById(req.params.documentoId);
    if (!docAtual) return res.status(404).json({ erro: "Documento não encontrado" });

    const titulo    = req.body.titulo    ?? docAtual.titulo;
    const categoria = req.body.categoria ?? docAtual.categoria;
    const cursos    = req.body.cursos != null
      ? JSON.parse(req.body.cursos)
      : docAtual.cursos;

    const atualizacao = { titulo, categoria, cursos };

    if (req.file) {
      const filePath = path.join(__dirname, "..", docAtual.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      atualizacao.url = `/uploads/documentos/${req.file.filename}`;
    }

    const doc = await DocumentoInstitucional.findByIdAndUpdate(
      req.params.documentoId,
      { $set: atualizacao },
      { new: true }
    );

    res.json({ mensagem: "Documento atualizado!", documento: doc });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

module.exports = { listar, criar, deletar, editar, uploadMiddleware };