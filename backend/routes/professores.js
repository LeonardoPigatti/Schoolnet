const express = require("express");
const router = express.Router();
const { register, login, listar } = require("../controllers/professorController");

router.post("/register", register);
router.post("/login",    login);
router.get("/",          listar);

module.exports = router;