const mongoose = require("mongoose");

const RepositorioSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    autor: { type: String, required: true },
    curso: { type: String, required: true },
    ano: { type: Number, required: true },
    resumo: { type: String },
    orientador: { type: String },
    palavrasChave: [{ type: String }],
    arquivo: {
      nome: { type: String },
      dados: { type: String }, // base64
      mimeType: { type: String, default: "application/pdf" },
    },
    visualizacoes: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Repositorio", RepositorioSchema);