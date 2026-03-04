const mongoose = require("mongoose");

const CreditoImpressaoSchema = new mongoose.Schema(
  {
    aluno: { type: mongoose.Schema.Types.ObjectId, ref: "Aluno", required: true },
    saldo: { type: Number, default: 0 },
    transacoes: [
      {
        tipo: { type: String, enum: ["Recarga", "Uso"], required: true },
        quantidade: { type: Number, required: true },
        descricao: { type: String },
        formaPagamento: { type: String, enum: ["PIX", "Cartão", "Sistema"], default: "Sistema" },
        status: { type: String, enum: ["Pendente", "Confirmado", "Cancelado"], default: "Pendente" },
        criadoEm: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreditoImpressao", CreditoImpressaoSchema);