const mongoose = require("mongoose");

const DisciplinaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  semestre: { type: Number, required: true },
  cargaHoraria: { type: Number, required: true },
  tipo: { type: String, required: true, default: "Semanal" },

  horario: {
    dia: { type: String, required: true },
    inicio: { type: String, required: true },
    fim: { type: String, required: true },
  },

  sala: { type: String, required: true },
  valor: { type: Number, required: true },

  curso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Curso",
    required: true,
  },
});

module.exports = mongoose.model("Disciplina", DisciplinaSchema);
