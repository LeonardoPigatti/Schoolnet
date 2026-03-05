const express = require("express");
const router = express.Router({ mergeParams: true });
const { listar, marcarLida, arquivar, criar } = require("../controllers/mensagemController");

router.get("/", listar);
router.patch("/:msgId/ler", marcarLida);
router.patch("/:msgId/arquivar", arquivar);
router.post("/", criar); // admin futuramente

module.exports = router;