const express = require("express");
const router = express.Router();
const { listar, listarDisciplinas } = require("../controllers/cursoController");

router.get("/", listar);
router.get("/:cursoId/disciplinas", listarDisciplinas);

module.exports = router;
