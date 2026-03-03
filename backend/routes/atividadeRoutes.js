const express = require("express");
const router = express.Router({ mergeParams: true });
const { listar, cadastrar, remover } = require("../controllers/atividadeController");

router.get("/", listar);
router.post("/", cadastrar);
router.delete("/:atividadeId", remover);

module.exports = router;