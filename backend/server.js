const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/faculdade")
  .then(() => console.log("MongoDB conectado!"))
  .catch(err => console.log(err));

/* =========================
   📚 SCHEMAS
========================= */

// 🎓 Curso
const CursoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  duracaoSemestres: { type: Number, required: true }
});

const Curso = mongoose.model("Curso", CursoSchema);

// 📖 Disciplina
const DisciplinaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  semestre: { type: Number, required: true },
  curso: { type: mongoose.Schema.Types.ObjectId, ref: "Curso", required: true }
});

const Disciplina = mongoose.model("Disciplina", DisciplinaSchema);

// 👨‍🎓 Aluno
const bcrypt = require("bcrypt");

const AlunoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  curso: { type: mongoose.Schema.Types.ObjectId, ref: "Curso", required: true }
});

const Aluno = mongoose.model("Aluno", AlunoSchema);

/* =========================
   🚀 ROTAS
========================= */


app.post("/alunos/register", async (req, res) => {
  try {
    const { nome, email, senha, curso } = req.body;

    // Verifica se já existe
    const existe = await Aluno.findOne({ email });
    if (existe) {
      return res.json({ erro: "Email já cadastrado" });
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const aluno = await Aluno.create({
      nome,
      email,
      senha: senhaHash,
      curso
    });

    res.json({ mensagem: "Aluno criado com sucesso!" });

  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/alunos/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const aluno = await Aluno.findOne({ email }).populate("curso");

    if (!aluno) {
      return res.json({ sucesso: false });
    }

    const senhaCorreta = await bcrypt.compare(senha, aluno.senha);

    if (!senhaCorreta) {
      return res.json({ sucesso: false });
    }

    res.json({
  sucesso: true,
  nome: aluno.nome,
  alunoId: aluno._id,   // 🔥 ADICIONA ISSO
  curso: aluno.curso.nome
});

  } catch (error) {
    res.status(500).json(error);
  }
});

// Listar alunos com curso
app.get("/alunos", async (req, res) => {
  const alunos = await Aluno.find().populate("curso");
  res.json(alunos);
});

// Listar cursos
app.get("/cursos", async (req, res) => {
  const cursos = await Curso.find();
  res.json(cursos);
});

// Listar disciplinas de um curso
app.get("/disciplinas/:cursoId", async (req, res) => {
  const disciplinas = await Disciplina.find({ curso: req.params.cursoId });
  res.json(disciplinas);
});

app.get("/seed", async (req, res) => {
  try {

    // 🔥 Apagar dados antigos (para não duplicar)
    await Curso.deleteMany();
    await Disciplina.deleteMany();

    // 📚 Criar cursos
    const eng = await Curso.create({
      nome: "Engenharia da Computação",
      duracaoSemestres: 10
    });

    const med = await Curso.create({
      nome: "Medicina",
      duracaoSemestres: 12
    });

    // 📖 Disciplinas Engenharia
    await Disciplina.create([
      { nome: "Cálculo I", semestre: 1, curso: eng._id },
      { nome: "Lógica de Programação", semestre: 1, curso: eng._id },
      { nome: "Estrutura de Dados", semestre: 2, curso: eng._id },
      { nome: "Física I", semestre: 2, curso: eng._id }
    ]);

    // 🏥 Disciplinas Medicina
    await Disciplina.create([
      { nome: "Anatomia I", semestre: 1, curso: med._id },
      { nome: "Biologia Celular", semestre: 1, curso: med._id },
      { nome: "Fisiologia I", semestre: 2, curso: med._id },
      { nome: "Histologia", semestre: 2, curso: med._id }
    ]);

    res.json({ mensagem: "Banco populado com sucesso!" });

  } catch (error) {
    res.status(500).json(error);
  }
});

// 🎓 Matriz curricular do aluno
app.get("/matriz/:alunoId", async (req, res) => {
  try {
    // 1️⃣ Buscar aluno e descobrir curso dele
    const aluno = await Aluno.findById(req.params.alunoId).populate("curso");

    if (!aluno) {
      return res.status(404).json({ erro: "Aluno não encontrado" });
    }

    // 2️⃣ Buscar disciplinas do curso do aluno
    const disciplinas = await Disciplina.find({
      curso: aluno.curso._id
    }).sort({ semestre: 1 });

    // 3️⃣ Agrupar por semestre
    const matriz = {};

    disciplinas.forEach((disc) => {
      if (!matriz[disc.semestre]) {
        matriz[disc.semestre] = [];
      }

      matriz[disc.semestre].push(disc);
    });

    // 4️⃣ Retornar organizado
    res.json({
      aluno: aluno.nome,
      curso: aluno.curso.nome,
      matriz
    });

  } catch (error) {
    res.status(500).json(error);
  }
});

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});