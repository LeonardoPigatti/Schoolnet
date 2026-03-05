const express = require("express");
const router = express.Router();
const { listar, baixar, visualizar, criar } = require("../controllers/repositorioController");

router.get("/", listar);
router.get("/:id/baixar", baixar);
router.get("/:id", visualizar);
router.post("/", criar); // admin futuramente

module.exports = router;

// No app.js: