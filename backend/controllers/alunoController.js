const bcrypt = require("bcrypt");
const Aluno = require("../models/Aluno");
const Matricula = require("../models/Matricula");

const register = async (req, res) => {
  try {
    const { nome, email, senha, curso } = req.body;

    const existe = await Aluno.findOne({ email });
    if (existe) return res.json({ erro: "Email já cadastrado" });

    const senhaHash = await bcrypt.hash(senha, 10);

    await Aluno.create({ nome, email, senha: senhaHash, curso });

    res.json({ mensagem: "Aluno criado com sucesso!" });
  } catch (error) {
    res.status(500).json(error);
  }
};

const login = async (req, res) => {
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
      curso: aluno.curso.nome,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const listar = async (req, res) => {
  const alunos = await Aluno.find().populate("curso");
  res.json(alunos);
};

const calcularBolsa = async (req, res) => {
  try {
    const { rendaFamiliar, escolaPublica, notasAltas } = req.body;

    let bolsa = 0;

    if (rendaFamiliar <= 1500 && escolaPublica) {
      bolsa = 100;
    } else if (rendaFamiliar <= 3000) {
      bolsa = 50;
    } else if (notasAltas) {
      bolsa = 25;
    }

    await Aluno.findByIdAndUpdate(req.params.alunoId, { bolsa });

    res.json({ mensagem: "Bolsa calculada com sucesso!", bolsa });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao calcular bolsa" });
  }
};

const getFinanceiro = async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.alunoId);

    const matriculas = await Matricula.find({
      aluno: req.params.alunoId,
    }).populate("disciplina");

    const totalBruto = matriculas.reduce((acc, mat) => acc + mat.disciplina.valor, 0);
    const desconto = totalBruto * (aluno.bolsa / 100);
    const totalLiquido = totalBruto - desconto;

    const parcelas = [];
    for (let i = 1; i <= 4; i++) {
      parcelas.push({
        vencimento: new Date(2026, i + 1, 10),
        referencia: `${i}/2026`,
        valor: totalLiquido,
        titulo: Math.floor(Math.random() * 9000000),
      });
    }

    res.json({ bolsa: aluno.bolsa, totalBruto, desconto, totalLiquido, parcelas });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao gerar extrato" });
  }
};

const getMatriz = async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.alunoId).populate("curso");

    if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" });

    const disciplinas = await require("../models/Disciplina")
      .find({ curso: aluno.curso._id })
      .sort({ semestre: 1 });

    const matriz = {};
    disciplinas.forEach((disc) => {
      if (!matriz[disc.semestre]) matriz[disc.semestre] = [];
      matriz[disc.semestre].push(disc);
    });

    res.json({ aluno: aluno.nome, curso: aluno.curso.nome, matriz });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = { register, login, listar, calcularBolsa, getFinanceiro, getMatriz };