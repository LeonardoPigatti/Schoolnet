const express = require("express");
const router  = express.Router();
const { buscar, salvar } = require("../controllers/calendarioController");

// Aluno e coordenador — buscar calendário do curso
router.get("/:cursoId", buscar);

// Apenas coordenador — salvar calendário
router.post("/:cursoId", salvar);

module.exports = router;