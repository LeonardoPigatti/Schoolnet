const mongoose = require("mongoose");

const CursoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  duracaoSemestres: { type: Number, required: true },
});

module.exports = mongoose.model("Curso", CursoSchema);
