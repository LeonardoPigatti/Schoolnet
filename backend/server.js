const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

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
  cargaHoraria: { type: Number, required: true }, // 🔥 usado para limite de faltas
  curso: { type: mongoose.Schema.Types.ObjectId, ref: "Curso", required: true }
});

const Disciplina = mongoose.model("Disciplina", DisciplinaSchema);

// 👨‍🎓 Aluno
const AlunoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  curso: { type: mongoose.Schema.Types.ObjectId, ref: "Curso", required: true }
});

const Aluno = mongoose.model("Aluno", AlunoSchema);

// 👨‍🏫 Professor
const ProfessorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  ativo: { type: Boolean, required: true }
});

const Professor = mongoose.model("Professor", ProfessorSchema);

/* =========================
   📝 MATRÍCULA PROFISSIONAL
========================= */

const MatriculaSchema = new mongoose.Schema({
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: "Aluno", required: true },
  disciplina: { type: mongoose.Schema.Types.ObjectId, ref: "Disciplina", required: true },
  nota1: { type: Number, default: 0 },
  nota2: { type: Number, default: 0 },
  media: { type: Number, default: 0 },
  faltas: { type: Number, default: 0 },
  status: { type: String, default: "Cursando" }
});

const Matricula = mongoose.model("Matricula", MatriculaSchema);

/* =========================
   🎯 FUNÇÃO AUTOMÁTICA
========================= */

async function atualizarSituacao(matriculaId) {
  const matricula = await Matricula.findById(matriculaId).populate("disciplina");

  const media = (matricula.nota1 + matricula.nota2) / 2;
  const limiteFaltas = matricula.disciplina.cargaHoraria * 0.25;

  let status = "Cursando";

  if (matricula.faltas > limiteFaltas) {
    status = "Reprovado por Falta";
  } else if (media >= 7) {
    status = "Aprovado";
  } else {
    status = "Reprovado por Nota";
  }

  matricula.media = media;
  matricula.status = status;

  await matricula.save();
}

/* =========================
   🚀 ROTAS
========================= */

// 👨‍🏫 Professor Register
app.post("/professores/register", async (req, res) => {
  try {
    const { nome, email, senha, ativo } = req.body;

    const existe = await Professor.findOne({ email });
    if (existe) {
      return res.json({ erro: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const professor = await Professor.create({
      nome,
      email,
      senha: senhaHash,
      ativo: ativo ?? true
    });

    res.json({
      mensagem: "Professor criado com sucesso!",
      professorId: professor._id
    });

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// 👨‍🎓 Aluno Register
app.post("/alunos/register", async (req, res) => {
  try {
    const { nome, email, senha, curso } = req.body;

    const existe = await Aluno.findOne({ email });
    if (existe) {
      return res.json({ erro: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await Aluno.create({
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

// 🔐 Login aluno
app.post("/alunos/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const aluno = await Aluno.findOne({ email }).populate("curso");

    if (!aluno) return res.json({ sucesso: false });

    const senhaCorreta = await bcrypt.compare(senha, aluno.senha);

    if (!senhaCorreta) return res.json({ sucesso: false });

    res.json({
      sucesso: true,
      nome: aluno.nome,
      alunoId: aluno._id,
      curso: aluno.curso.nome
    });

  } catch (error) {
    res.status(500).json(error);
  }
});

/* =========================
   📝 MATRÍCULA ROTAS
========================= */

// Matricular aluno
app.post("/matricular", async (req, res) => {
  try {
    const { alunoId, disciplinaId } = req.body;

    const existe = await Matricula.findOne({
      aluno: alunoId,
      disciplina: disciplinaId
    });

    if (existe) {
      return res.json({ erro: "Aluno já matriculado" });
    }

    await Matricula.create({
      aluno: alunoId,
      disciplina: disciplinaId
    });

    res.json({ mensagem: "Matrícula realizada!" });

  } catch (error) {
    res.status(500).json(error);
  }
});

// Lançar notas
app.put("/matricula/notas", async (req, res) => {
  try {
    const { matriculaId, nota1, nota2 } = req.body;

    await Matricula.findByIdAndUpdate(matriculaId, { nota1, nota2 });

    await atualizarSituacao(matriculaId);

    res.json({ mensagem: "Notas atualizadas!" });

  } catch (error) {
    res.status(500).json(error);
  }
});

// Lançar faltas
app.put("/matricula/faltas", async (req, res) => {
  try {
    const { matriculaId, faltas } = req.body;

    await Matricula.findByIdAndUpdate(matriculaId, { faltas });

    await atualizarSituacao(matriculaId);

    res.json({ mensagem: "Faltas atualizadas!" });

  } catch (error) {
    res.status(500).json(error);
  }
});

// 📊 Boletim completo
app.get("/boletim/:alunoId", async (req, res) => {
  try {
    const boletim = await Matricula.find({
      aluno: req.params.alunoId
    }).populate("disciplina");

    res.json(boletim);

  } catch (error) {
    res.status(500).json(error);
  }
});

/* =========================
   📚 LISTAGENS ORIGINAIS
========================= */

app.get("/professores", async (req, res) => {
  const professores = await Professor.find();
  res.json(professores);
});

app.get("/alunos", async (req, res) => {
  const alunos = await Aluno.find().populate("curso");
  res.json(alunos);
});

app.get("/cursos", async (req, res) => {
  const cursos = await Curso.find();
  res.json(cursos);
});

app.get("/disciplinas/:cursoId", async (req, res) => {
  const disciplinas = await Disciplina.find({ curso: req.params.cursoId });
  res.json(disciplinas);
});

/* =========================
   🎓 MATRIZ CURRICULAR ORIGINAL
========================= */

app.get("/matriz/:alunoId", async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.alunoId).populate("curso");

    if (!aluno) {
      return res.status(404).json({ erro: "Aluno não encontrado" });
    }

    const disciplinas = await Disciplina.find({
      curso: aluno.curso._id
    }).sort({ semestre: 1 });

    const matriz = {};

    disciplinas.forEach((disc) => {
      if (!matriz[disc.semestre]) {
        matriz[disc.semestre] = [];
      }
      matriz[disc.semestre].push(disc);
    });

    res.json({
      aluno: aluno.nome,
      curso: aluno.curso.nome,
      matriz
    });

  } catch (error) {
    res.status(500).json(error);
  }
});

/* =========================
   🌱 SEED ATUALIZADO
========================= */

app.get("/seed", async (req, res) => {
  try {
    await Curso.deleteMany();
    await Disciplina.deleteMany();

    const eng = await Curso.create({
      nome: "Engenharia da Computação",
      duracaoSemestres: 10
    });

    const med = await Curso.create({
      nome: "Medicina",
      duracaoSemestres: 12
    });

    await Disciplina.create([
      { nome: "Cálculo I", semestre: 1, cargaHoraria: 80, curso: eng._id },
      { nome: "Lógica de Programação", semestre: 1, cargaHoraria: 60, curso: eng._id },
      { nome: "Anatomia I", semestre: 1, cargaHoraria: 100, curso: med._id }
    ]);

    res.json({ mensagem: "Banco populado com sucesso!" });

  } catch (error) {
    res.status(500).json(error);
  }
});

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});