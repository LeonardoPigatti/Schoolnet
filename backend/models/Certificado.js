const mongoose = require("mongoose");

const CertificadoSchema = new mongoose.Schema(
  {
    aluno: { type: mongoose.Schema.Types.ObjectId, ref: "Aluno", required: true },
    titulo: { type: String, required: true },
    descricao: { type: String },
    categoria: {
      type: String,
      enum: ["Evento", "Conquista Acadêmica", "Outro"],
      required: true,
    },
    dataEmissao: { type: Date, required: true },
    arquivo: {
      nome: { type: String },
      dados: { type: String }, // base64
      mimeType: { type: String },
    },
    emitidoPor: { type: String, default: "Secretaria Acadêmica" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificado", CertificadoSchema);