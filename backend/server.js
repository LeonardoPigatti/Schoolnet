/* eslint-disable no-undef */
const express = require("express");
const cors = require("cors");
const { conectar } = require("./config/database");

const professoresRoutes = require("./routes/professores");
const alunosRoutes = require("./routes/alunos");
const matriculasRoutes = require("./routes/matriculas");
const cursosRoutes = require("./routes/cursos");
const { seed } = require("./controllers/seedController");
const { getMatriz, getFinanceiro, calcularBolsa } = require("./controllers/alunoController");
const { getBoletim } = require("./controllers/matriculaController");

const app = express();

app.use(cors());
app.use(express.json());

conectar();

/* =========================
   🚀 ROTAS
========================= */
app.use("/professores", professoresRoutes);
app.use("/alunos", alunosRoutes);
app.use("/matriculas", matriculasRoutes);
app.use("/cursos", cursosRoutes);
app.get("/seed", seed);
app.use("/alunos/:alunoId/atividades", require("./routes/atividadeRoutes"));
app.use("/alunos/:alunoId/estagio", require("./routes/estagioRoutes"));
app.use("/alunos/:alunoId/requerimentos", require("./routes/requerimentoRoutes"));
app.use("/alunos/:alunoId/tcc", require("./routes/tccRoutes"));

// 🔁 Rotas legadas (compatibilidade com frontend antigo)
app.get("/matriz/:alunoId", getMatriz);
app.get("/financeiro/:alunoId", getFinanceiro);
app.post("/pagfacil/:alunoId", calcularBolsa);
app.get("/boletim/:alunoId", getBoletim);

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});