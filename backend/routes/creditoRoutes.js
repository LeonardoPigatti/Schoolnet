const express = require("express");
const router = express.Router({ mergeParams: true });
const { obter, comprar } = require("../controllers/creditoController");

router.get("/", obter);
router.post("/comprar", comprar);

module.exports = router;

// No app.js:
