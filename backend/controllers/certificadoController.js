const Certificado = require("../models/Certificado");

const listar = async (req, res) => {
  try {
    const certificados = await Certificado.find({ aluno: req.params.alunoId }).sort({ dataEmissao: -1 });
    res.json(certificados);
  } catch {
    res.status(500).json({ erro: "Erro ao listar certificados" });
  }
};

// Rota para uso futuro do admin
const criar = async (req, res) => {
  try {
    const { titulo, descricao, categoria, dataEmissao, arquivo, emitidoPor } = req.body;
    const cert = await Certificado.create({
      aluno: req.params.alunoId,
      titulo, descricao, categoria, dataEmissao, arquivo, emitidoPor,
    });
    res.json({ mensagem: "Certificado criado!", cert });
  } catch {
    res.status(500).json({ erro: "Erro ao criar certificado" });
  }
};

const remover = async (req, res) => {
  try {
    await Certificado.findOneAndDelete({ _id: req.params.certId, aluno: req.params.alunoId });
    res.json({ mensagem: "Certificado removido!" });
  } catch {
    res.status(500).json({ erro: "Erro ao remover certificado" });
  }
};

module.exports = { listar, criar, remover };