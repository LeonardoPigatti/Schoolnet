const MatrizCurricular = require("../models/Matrizcurricularmodel");

// Listar todas as matrizes
const listar = async (req, res) => {
  try {
    const matrizes = await MatrizCurricular.find();
    res.json(matrizes);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar matrizes curriculares." });
  }
};

// Buscar por ID
const buscarPorId = async (req, res) => {
  try {
    const matriz = await MatrizCurricular.findById(req.params.id);
    if (!matriz) return res.status(404).json({ erro: "Matriz curricular não encontrada." });
    res.json(matriz);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar matriz curricular." });
  }
};

// Criar
const criar = async (req, res) => {
  try {
    const { nome, ano, curso } = req.body;
    const nova = await MatrizCurricular.create({ nome, ano, curso });
    res.status(201).json(nova);
  } catch (err) {
    res.status(400).json({ erro: "Erro ao criar matriz curricular.", detalhe: err.message });
  }
};

// Editar
const editar = async (req, res) => {
  try {
    const { nome, ano, curso } = req.body;
    const atualizada = await MatrizCurricular.findByIdAndUpdate(
      req.params.id,
      { nome, ano, curso },
      { new: true, runValidators: true }
    );
    if (!atualizada) return res.status(404).json({ erro: "Matriz curricular não encontrada." });
    res.json(atualizada);
  } catch (err) {
    res.status(400).json({ erro: "Erro ao editar matriz curricular.", detalhe: err.message });
  }
};

// Deletar
const deletar = async (req, res) => {
  try {
    const deletada = await MatrizCurricular.findByIdAndDelete(req.params.id);
    if (!deletada) return res.status(404).json({ erro: "Matriz curricular não encontrada." });
    res.json({ mensagem: "Matriz curricular removida com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar matriz curricular." });
  }
};

module.exports = { listar, buscarPorId, criar, editar, deletar };