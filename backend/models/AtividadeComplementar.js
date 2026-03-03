const mongoose = require("mongoose");

const AtividadeComplementarSchema = new mongoose.Schema(
  {
    aluno: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Aluno",
      required: true,
    },
    titulo: { type: String, required: true },
    descricao: { type: String },
    categoria: {
      type: String,
      enum: ["Extensão", "Pesquisa", "Monitoria", "Cultura", "Esporte", "Outro"],
      required: true,
    },
    cargaHoraria: { type: Number, required: true },
    dataRealizacao: { type: Date, required: true },
    arquivo: {
      nome: String,
      tipo: String,
      dados: String, // base64
    },
    status: {
      type: String,
      enum: ["Pendente", "Aprovada", "Reprovada"],
      default: "Pendente",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AtividadeComplementar", AtividadeComplementarSchema);