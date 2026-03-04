const express = require("express");
const router = express.Router({ mergeParams: true });
const { listar, criar, contestar } = require("../controllers/ocorrenciaController");

router.get("/", listar);
router.post("/", criar);
router.patch("/:ocId/contestar", contestar);

module.exports = router;

// No app.js:
// app.use("/alunos/:alunoId/ocorrencias", require("./routes/ocorrenciaRoutes"));