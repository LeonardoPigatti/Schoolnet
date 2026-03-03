const express = require("express");
const router = express.Router();
const { register, listar } = require("../controllers/professorController");

router.post("/register", register);
router.get("/", listar);

module.exports = router;
