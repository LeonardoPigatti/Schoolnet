const express = require("express");
const router = express.Router({ mergeParams: true });
const { verificar, gerar } = require("../controllers/diplomaController");

router.get("/verificar", verificar);
router.get("/gerar", gerar);

module.exports = router;

// No app.js:
// app.use("/alunos/:alunoId/diploma", require("./routes/diplomaRoutes"));