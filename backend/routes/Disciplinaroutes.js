const express = require("express");
const router = express.Router();
const {
  listar,
  listarPorCurso,
  buscarPorId,
  criar,
  editar,
  deletar,
} = require("../controllers/disciplinaController");

router.get("/", listar);
router.get("/curso/:cursoId", listarPorCurso);
router.get("/:id", buscarPorId);
router.post("/", criar);
router.patch("/:id", editar);
router.delete("/:id", deletar);

module.exports = router;