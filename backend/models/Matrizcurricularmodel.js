const mongoose = require("mongoose");

const DisciplinaMatrizSchema = new mongoose.Schema({
  disciplina: { type: mongoose.Schema.Types.ObjectId, ref: "Disciplina", required: true },
  semestre:   { type: Number, required: true },
}, { _id: false });

const MatrizCurricularSchema = new mongoose.Schema({
  nome:        { type: String, required: true },
  ano:         { type: Number, required: true },
  curso:       { type: mongoose.Schema.Types.ObjectId, ref: "Curso", required: true },
  disciplinas: { type: [DisciplinaMatrizSchema], default: [] },
});

module.exports = mongoose.model("MatrizCurricular", MatrizCurricularSchema);