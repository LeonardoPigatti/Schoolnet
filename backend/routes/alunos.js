const express = require("express");
const router = express.Router();
const {
  register,
  login,
  listar,
  calcularBolsa,
  getFinanceiro,
  getMatriz,
} = require("../controllers/alunoController");

router.post("/register", register);
router.post("/login", login);
router.get("/", listar);
router.post("/:alunoId/pagfacil", calcularBolsa);
router.get("/:alunoId/financeiro", getFinanceiro);
router.get("/:alunoId/matriz", getMatriz);
router.get("/:alunoId/boletim", require("../controllers/matriculaController").getBoletim);
router.patch("/:alunoId/senha", require("../controllers/alunoController").alterarSenha);

module.exports = router;