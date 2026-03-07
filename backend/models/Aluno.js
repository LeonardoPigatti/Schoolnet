const mongoose = require("mongoose");

const AlunoSchema = new mongoose.Schema({
  nome:              { type: String, required: true },
  email:             { type: String, required: true, unique: true },
  senha:             { type: String, required: true },
  curso:             { type: mongoose.Schema.Types.ObjectId, ref: "Curso", required: true },
  matrizCurricular:  { type: mongoose.Schema.Types.ObjectId, ref: "MatrizCurricular", default: null },
  bolsa:             { type: Number, default: 0 },
  foto:              { type: String, default: null },
});

module.exports = mongoose.model("Aluno", AlunoSchema);