const AtividadeComplementar = require("../models/AtividadeComplementar");

const listar = async (req, res) => {
  try {
    const atividades = await AtividadeComplementar.find({ aluno: req.params.alunoId }).sort({ createdAt: -1 });
    const totalHoras = atividades.reduce((acc, a) => acc + a.cargaHoraria, 0);
    res.json({ atividades, totalHoras });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar atividades" });
  }
};

const cadastrar = async (req, res) => {
  try {
    const { titulo, descricao, categoria, cargaHoraria, dataRealizacao, arquivo } = req.body;
    const atividade = await AtividadeComplementar.create({
      aluno: req.params.alunoId,
      titulo, descricao, categoria, cargaHoraria, dataRealizacao, arquivo,
    });
    res.json({ mensagem: "Atividade cadastrada com sucesso!", atividade });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao cadastrar atividade" });
  }
};

const remover = async (req, res) => {
  try {
    await AtividadeComplementar.findOneAndDelete({
      _id: req.params.atividadeId,
      aluno: req.params.alunoId,
    });
    res.json({ mensagem: "Atividade removida com sucesso!" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao remover atividade" });
  }
};

module.exports = { listar, cadastrar, remover };