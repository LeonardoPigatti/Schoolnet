const Estagio = require("../models/Estagio");

const obter = async (req, res) => {
  try {
    const estagio = await Estagio.findOne({ aluno: req.params.alunoId });
    res.json(estagio || null);
  } catch {
    res.status(500).json({ erro: "Erro ao buscar estágio" });
  }
};

const salvar = async (req, res) => {
  try {
    const { empresa, supervisor, dataInicio, dataFim, cargaHorariaSemanal, descricaoAtividades } = req.body;
    let estagio = await Estagio.findOne({ aluno: req.params.alunoId });
    if (estagio) {
      estagio = await Estagio.findOneAndUpdate(
        { aluno: req.params.alunoId },
        { empresa, supervisor, dataInicio, dataFim, cargaHorariaSemanal, descricaoAtividades },
        { new: true }
      );
    } else {
      estagio = await Estagio.create({ aluno: req.params.alunoId, empresa, supervisor, dataInicio, dataFim, cargaHorariaSemanal, descricaoAtividades });
    }
    res.json({ mensagem: "Estágio salvo com sucesso!", estagio });
  } catch {
    res.status(500).json({ erro: "Erro ao salvar estágio" });
  }
};

const atualizarHoras = async (req, res) => {
  try {
    const { horasCumpridas } = req.body;
    const estagio = await Estagio.findOneAndUpdate(
      { aluno: req.params.alunoId },
      { horasCumpridas },
      { new: true }
    );
    res.json({ mensagem: "Horas atualizadas!", estagio });
  } catch {
    res.status(500).json({ erro: "Erro ao atualizar horas" });
  }
};

const enviarDocumento = async (req, res) => {
  try {
    const { tipo, nome, arquivo, mimeType } = req.body;
    const estagio = await Estagio.findOneAndUpdate(
      { aluno: req.params.alunoId },
      { $push: { documentos: { tipo, nome, arquivo, mimeType } } },
      { new: true }
    );
    res.json({ mensagem: "Documento enviado!", estagio });
  } catch {
    res.status(500).json({ erro: "Erro ao enviar documento" });
  }
};

const removerDocumento = async (req, res) => {
  try {
    await Estagio.findOneAndUpdate(
      { aluno: req.params.alunoId },
      { $pull: { documentos: { _id: req.params.docId } } }
    );
    res.json({ mensagem: "Documento removido!" });
  } catch {
    res.status(500).json({ erro: "Erro ao remover documento" });
  }
};

module.exports = { obter, salvar, atualizarHoras, enviarDocumento, removerDocumento };