const express = require("express");
const router = express.Router({ mergeParams: true });
const { obter, salvar, enviar } = require("../controllers/tccController");

router.get("/", obter);
router.post("/", salvar);
router.patch("/enviar", enviar);

module.exports = router;

// No app.js:
