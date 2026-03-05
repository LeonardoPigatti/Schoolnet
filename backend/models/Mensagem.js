const mongoose = require("mongoose");

const MensagemSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    corpo: { type: String, required: true },
    remetente: { type: String, required: true }, // nome do coordenador/admin
    tipo: {
      type: String,
      enum: ["Individual", "Curso", "Geral", "Professores"],
      required: true,
    },
    // destinatários
    destinatarioAluno: { type: mongoose.Schema.Types.ObjectId, ref: "Aluno" },
    destinatarioCurso: { type: mongoose.Schema.Types.ObjectId, ref: "Curso" },
    prioridade: {
      type: String,
      enum: ["Normal", "Importante", "Urgente"],
      default: "Normal",
    },
    // controle por aluno
    leituras: [
      {
        aluno: { type: mongoose.Schema.Types.ObjectId, ref: "Aluno" },
        lidaEm: { type: Date, default: Date.now },
      },
    ],
    arquivadaPor: [{ type: mongoose.Schema.Types.ObjectId, ref: "Aluno" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mensagem", MensagemSchema);