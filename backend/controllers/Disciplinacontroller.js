const Disciplina = require("../models/Disciplina");

// Listar todas
const listar = async (req, res) => {
  try {
    const disciplinas = await Disciplina.find();
    res.json(disciplinas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar disciplinas." });
  }
};

// Listar por curso
const listarPorCurso = async (req, res) => {
  try {
    const disciplinas = await Disciplina.find({ curso: req.params.cursoId });
    res.json(disciplinas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar disciplinas do curso." });
  }
};

// Buscar por ID
const buscarPorId = async (req, res) => {
  try {
    const disciplina = await Disciplina.findById(req.params.id);
    if (!disciplina) return res.status(404).json({ erro: "Disciplina não encontrada." });
    res.json(disciplina);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar disciplina." });
  }
};

// Criar
const criar = async (req, res) => {
  try {
    const nova = await Disciplina.create(req.body);
    res.status(201).json(nova);
  } catch (err) {
    res.status(400).json({ erro: "Erro ao criar disciplina.", detalhe: err.message });
  }
};

// Editar
const editar = async (req, res) => {
  try {
    const atualizada = await Disciplina.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!atualizada) return res.status(404).json({ erro: "Disciplina não encontrada." });
    res.json(atualizada);
  } catch (err) {
    res.status(400).json({ erro: "Erro ao editar disciplina.", detalhe: err.message });
  }
};

// Deletar
const deletar = async (req, res) => {
  try {
    const deletada = await Disciplina.findByIdAndDelete(req.params.id);
    if (!deletada) return res.status(404).json({ erro: "Disciplina não encontrada." });
    res.json({ mensagem: "Disciplina removida com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar disciplina." });
  }
};

module.exports = { listar, listarPorCurso, buscarPorId, criar, editar, deletar };