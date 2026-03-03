const Curso = require("../models/Curso");
const Disciplina = require("../models/Disciplina");

const listar = async (req, res) => {
  const cursos = await Curso.find();
  res.json(cursos);
};

const listarDisciplinas = async (req, res) => {
  const disciplinas = await Disciplina.find({ curso: req.params.cursoId });
  res.json(disciplinas);
};

module.exports = { listar, listarDisciplinas };
