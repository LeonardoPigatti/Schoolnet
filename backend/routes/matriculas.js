const express = require("express");
const router = express.Router();
const { matricular, lancarNotas, lancarFaltas } = require("../controllers/matriculaController");

router.post("/", matricular);
router.put("/notas", lancarNotas);
router.put("/faltas", lancarFaltas);

module.exports = router;
