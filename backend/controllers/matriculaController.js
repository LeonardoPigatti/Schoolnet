const Matricula = require("../models/Matricula");
const { atualizarSituacao } = require("../services/matriculaService");

const matricular = async (req, res) => {
  try {
    const { alunoId, disciplinaId } = req.body;

    const existe = await Matricula.findOne({ aluno: alunoId, disciplina: disciplinaId });
    if (existe) return res.json({ erro: "Aluno já matriculado" });

    await Matricula.create({ aluno: alunoId, disciplina: disciplinaId });

    res.json({ mensagem: "Matrícula realizada!" });
  } catch (error) {
    res.status(500).json(error);
  }
};

const lancarNotas = async (req, res) => {
  try {
    const { matriculaId, nota1, nota2 } = req.body;

    await Matricula.findByIdAndUpdate(matriculaId, { nota1, nota2 });
    await atualizarSituacao(matriculaId);

    res.json({ mensagem: "Notas atualizadas!" });
  } catch (error) {
    res.status(500).json(error);
  }
};

const lancarFaltas = async (req, res) => {
  try {
    const { matriculaId, faltas } = req.body;

    await Matricula.findByIdAndUpdate(matriculaId, { faltas });
    await atualizarSituacao(matriculaId);

    res.json({ mensagem: "Faltas atualizadas!" });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getBoletim = async (req, res) => {
  try {
    const boletim = await Matricula.find({ aluno: req.params.alunoId }).populate("disciplina");
    res.json(boletim);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getMatriculasPorAluno = async (req, res) => {
  try {
    const matriculas = await Matricula.find({ aluno: req.params.alunoId }).populate("disciplina");
    res.json(matriculas);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = { matricular, lancarNotas, lancarFaltas, getBoletim, getMatriculasPorAluno };
