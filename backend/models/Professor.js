const mongoose = require("mongoose");

const ProfessorSchema = new mongoose.Schema({
  nome:  { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  ativo: { type: Boolean, required: true },
  tipoProfessor: {
    type: String,
    enum: ["professor", "coordenador"],
    default: "professor",
  },
  cursoCoordenado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Curso",
    default: null,
  },
});

module.exports = mongoose.model("Professor", ProfessorSchema);