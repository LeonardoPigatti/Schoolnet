const mongoose = require("mongoose");

const TCCSchema = new mongoose.Schema(
  {
    aluno: { type: mongoose.Schema.Types.ObjectId, ref: "Aluno", required: true },
    titulo: { type: String, required: true },
    resumo: { type: String, required: true },
    orientador: {
      nome: { type: String, required: true },
      email: { type: String },
    },
    dataDefesa: { type: Date },
    banca: [
      {
        nome: { type: String },
        email: { type: String },
      },
    ],
    arquivo: {
      nome: { type: String },
      dados: { type: String }, // base64
      mimeType: { type: String },
    },
    status: {
      type: String,
      enum: ["Rascunho", "Enviado", "Em Análise", "Aprovado", "Reprovado", "Correção Solicitada"],
      default: "Rascunho",
    },
    feedbackAdmin: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TCC", TCCSchema);