const mongoose = require("mongoose");

const DocumentoInstitucionalSchema = new mongoose.Schema(
  {
    titulo:   { type: String, required: true },
    categoria: {
      type: String,
      required: true,
      // categorias que já existem no frontend
      enum: [
        "Regulamento do Curso",
        "Atividades Complementares",
        "Colação de Grau",
        "Termos de Estágio",
        "Outro",
      ],
    },
    url:      { type: String, required: true },   // link externo do PDF

    // Array de cursos — se vazio, visível para todos os cursos
    cursos:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Curso" }],

    // Quem fez o upload
    enviadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Professor", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DocumentoInstitucional", DocumentoInstitucionalSchema);