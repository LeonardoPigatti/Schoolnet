const express = require("express");
const router = express.Router();
const {
  listar,
  listarPorCurso,
  criar,
  alternarAtiva,
  deletar,
} = require("../controllers/ofertaController");

router.get("/", listar);
router.get("/curso/:cursoId", listarPorCurso);
router.post("/", criar);
router.patch("/:id/alternar", alternarAtiva);
router.delete("/:id", deletar);

module.exports = router;