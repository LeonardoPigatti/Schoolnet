const express = require("express");
const router = express.Router({ mergeParams: true });
const { listar, criar, remover } = require("../controllers/certificadoController");

router.get("/", listar);
router.post("/", criar);           // usado pelo admin futuramente
router.delete("/:certId", remover);

module.exports = router;
