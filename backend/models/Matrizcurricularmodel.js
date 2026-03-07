const mongoose = require("mongoose");

const MatrizCurricularSchema = new mongoose.Schema({
  nome:  { type: String, required: true },
  ano:   { type: Number, required: true },
  curso: { type: mongoose.Schema.Types.ObjectId, ref: "Curso", required: true },
});

module.exports = mongoose.model("MatrizCurricular", MatrizCurricularSchema);