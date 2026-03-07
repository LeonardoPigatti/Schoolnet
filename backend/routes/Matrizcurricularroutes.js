const express = require("express");
const router = express.Router();
const {
  listar,
  buscarPorId,
  criar,
  editar,
  deletar,
} = require("../controllers/matrizCurricularController");

router.get("/", listar);
router.get("/:id", buscarPorId);
router.post("/", criar);
router.patch("/:id", editar);
router.delete("/:id", deletar);

module.exports = router;