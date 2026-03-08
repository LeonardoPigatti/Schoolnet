const mongoose = require("mongoose");

const OfertaSchema = new mongoose.Schema({
  disciplina: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Disciplina",
    required: true,
  },
  ativa: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Oferta", OfertaSchema);