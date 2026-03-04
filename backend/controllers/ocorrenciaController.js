const Ocorrencia = require("../models/Ocorrencia");

const listar = async (req, res) => {
  try {
    const ocorrencias = await Ocorrencia.find({ aluno: req.params.alunoId }).sort({ dataOcorrencia: -1 });
    res.json(ocorrencias);
  } catch {
    res.status(500).json({ erro: "Erro ao listar ocorrências" });
  }
};

// Usado pelo admin futuramente
const criar = async (req, res) => {
  try {
    const { titulo, descricao, tipo, punicao, registradoPor, dataOcorrencia } = req.body;
    const oc = await Ocorrencia.create({
      aluno: req.params.alunoId,
      titulo, descricao, tipo, punicao, registradoPor, dataOcorrencia,
    });
    res.json({ mensagem: "Ocorrência registrada!", oc });
  } catch {
    res.status(500).json({ erro: "Erro ao criar ocorrência" });
  }
};

const contestar = async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto?.trim()) return res.status(400).json({ erro: "Informe o texto da contestação" });

    const oc = await Ocorrencia.findOneAndUpdate(
      { _id: req.params.ocId, aluno: req.params.alunoId },
      { status: "Contestada", contestacao: { texto, dataEnvio: new Date() } },
      { new: true }
    );
    if (!oc) return res.status(404).json({ erro: "Ocorrência não encontrada" });
    res.json({ mensagem: "Contestação enviada!", oc });
  } catch {
    res.status(500).json({ erro: "Erro ao contestar ocorrência" });
  }
};

module.exports = { listar, criar, contestar };