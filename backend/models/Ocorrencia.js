const mongoose = require("mongoose");

const OcorrenciaSchema = new mongoose.Schema(
  {
    aluno: { type: mongoose.Schema.Types.ObjectId, ref: "Aluno", required: true },
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    tipo: {
      type: String,
      enum: ["Comportamento", "Indisciplina", "Atraso", "Uso de Celular", "Fraude Acadêmica", "Outro"],
      required: true,
    },
    punicao: {
      type: String,
      enum: ["Sem Punição", "Advertência Verbal", "Advertência Escrita", "Suspensão", "Encaminhamento à Coordenação", "Expulsão"],
      default: "Sem Punição",
    },
    status: {
      type: String,
      enum: ["Pendente", "Em Análise", "Resolvida", "Contestada"],
      default: "Pendente",
    },
    registradoPor: { type: String, required: true },
    dataOcorrencia: { type: Date, required: true },
    contestacao: {
      texto: { type: String },
      dataEnvio: { type: Date },
    },
    respostaAdmin: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ocorrencia", OcorrenciaSchema);