const Oferta = require("../models/Ofertamodel");
const Disciplina = require("../models/Disciplina");

// Listar todas as ofertas
const listar = async (req, res) => {
  try {
    const ofertas = await Oferta.find().populate("disciplina");
    res.json(ofertas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar ofertas." });
  }
};

// Listar ofertas por curso (para o coordenador)
const listarPorCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;

    // Busca todas as disciplinas do curso
    const disciplinas = await Disciplina.find({ curso: cursoId });
    const disciplinaIds = disciplinas.map((d) => d._id);

    // Busca as ofertas dessas disciplinas
    const ofertas = await Oferta.find({ disciplina: { $in: disciplinaIds } }).populate("disciplina");

    res.json(ofertas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar ofertas do curso." });
  }
};

// Criar oferta para uma disciplina
const criar = async (req, res) => {
  try {
    const { disciplinaId } = req.body;

    // Verifica se já existe oferta para essa disciplina
    const existente = await Oferta.findOne({ disciplina: disciplinaId });
    if (existente) {
      return res.status(400).json({ erro: "Já existe uma oferta para essa disciplina." });
    }

    const nova = await Oferta.create({ disciplina: disciplinaId });
    await nova.populate("disciplina");
    res.status(201).json(nova);
  } catch (err) {
    res.status(400).json({ erro: "Erro ao criar oferta.", detalhe: err.message });
  }
};

// Alternar ativa/inativa
const alternarAtiva = async (req, res) => {
  try {
    const oferta = await Oferta.findById(req.params.id);
    if (!oferta) return res.status(404).json({ erro: "Oferta não encontrada." });

    oferta.ativa = !oferta.ativa;
    await oferta.save();
    await oferta.populate("disciplina");

    res.json(oferta);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao alternar oferta." });
  }
};

// Deletar oferta
const deletar = async (req, res) => {
  try {
    const deletada = await Oferta.findByIdAndDelete(req.params.id);
    if (!deletada) return res.status(404).json({ erro: "Oferta não encontrada." });
    res.json({ mensagem: "Oferta removida com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar oferta." });
  }
};

module.exports = { listar, listarPorCurso, criar, alternarAtiva, deletar };