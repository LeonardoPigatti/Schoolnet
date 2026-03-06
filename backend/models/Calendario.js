const mongoose = require("mongoose");

const DiaSchema = new mongoose.Schema({
  data:  { type: Date, required: true },
  tipo:  { type: String, enum: ["letivo", "nao_letivo", "feriado"], required: true },
  descricao: { type: String, default: "" }, // ex: "Feriado Nacional - Tiradentes"
}, { _id: false });

const CalendarioSchema = new mongoose.Schema(
  {
    curso: { type: mongoose.Schema.Types.ObjectId, ref: "Curso", required: true, unique: true },
    ano:   { type: Number, required: true },
    dias:  [DiaSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Calendario", CalendarioSchema);