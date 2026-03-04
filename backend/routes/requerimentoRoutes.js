const express = require("express");
const router = express.Router({ mergeParams: true });
const { declaracaoMatricula, historicoEscolar, atestadoFrequencia } = require("../controllers/requerimentoController");

router.get("/declaracao-matricula", declaracaoMatricula);
router.get("/historico-escolar", historicoEscolar);
router.get("/atestado-frequencia", atestadoFrequencia);

module.exports = router;

// No app.js:
// app.use("/alunos/:alunoId/requerimentos", require("./routes/requerimentoRoutes"));