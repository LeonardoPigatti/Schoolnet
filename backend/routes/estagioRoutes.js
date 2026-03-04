const express = require("express");
const router = express.Router({ mergeParams: true });
const { obter, salvar, atualizarHoras, enviarDocumento, removerDocumento } = require("../controllers/estagioController");

router.get("/", obter);
router.post("/", salvar);
router.patch("/horas", atualizarHoras);
router.post("/documentos", enviarDocumento);
router.delete("/documentos/:docId", removerDocumento);

module.exports = router;

// No app.js:
// app.use("/alunos/:alunoId/estagio", require("./routes/estagioRoutes"));