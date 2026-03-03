const mongoose = require("mongoose");

const MatriculaSchema = new mongoose.Schema({
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: "Aluno", required: true },
  disciplina: { type: mongoose.Schema.Types.ObjectId, ref: "Disciplina", required: true },
  nota1: { type: Number, default: 0 },
  nota2: { type: Number, default: 0 },
  media: { type: Number, default: 0 },
  faltas: { type: Number, default: 0 },
  status: { type: String, default: "Cursando" },
});

module.exports = mongoose.model("Matricula", MatriculaSchema);
