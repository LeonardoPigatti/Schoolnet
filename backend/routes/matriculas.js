const express = require("express");
const router = express.Router();
const { matricular, lancarNotas, lancarFaltas, getMatriculasPorAluno } = require("../controllers/matriculaController");

router.post("/", matricular);
router.put("/notas", lancarNotas);
router.put("/faltas", lancarFaltas);
router.get("/aluno/:alunoId", getMatriculasPorAluno);


module.exports = router;
