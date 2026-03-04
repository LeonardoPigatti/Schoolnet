const mongoose = require("mongoose");

const EstagioSchema = new mongoose.Schema(
  {
    aluno: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Aluno",
      required: true,
    },
    empresa: {
      nome: { type: String, required: true },
      cnpj: { type: String },
      endereco: { type: String },
    },
    supervisor: {
      nome: { type: String, required: true },
      email: { type: String },
      telefone: { type: String },
    },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date },
    cargaHorariaSemanal: { type: Number, required: true },
    horasCumpridas: { type: Number, default: 0 },
    descricaoAtividades: { type: String },
    status: {
      type: String,
      enum: ["Pendente", "Em Andamento", "Concluído", "Reprovado"],
      default: "Pendente",
    },
    documentos: [
      {
        tipo: {
          type: String,
          enum: ["Termo de Compromisso", "Relatório Parcial", "Relatório Final", "Outro"],
        },
        nome: { type: String },
        arquivo: { type: String }, // base64
        mimeType: { type: String },
        enviadoEm: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Estagio", EstagioSchema);