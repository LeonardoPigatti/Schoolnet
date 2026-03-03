const bcrypt = require("bcrypt");
const Professor = require("../models/Professor");

const register = async (req, res) => {
  try {
    const { nome, email, senha, ativo } = req.body;

    const existe = await Professor.findOne({ email });
    if (existe) return res.json({ erro: "Email já cadastrado" });

    const senhaHash = await bcrypt.hash(senha, 10);

    const professor = await Professor.create({
      nome,
      email,
      senha: senhaHash,
      ativo: ativo ?? true,
    });

    res.json({ mensagem: "Professor criado com sucesso!", professorId: professor._id });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

const listar = async (req, res) => {
  const professores = await Professor.find();
  res.json(professores);
};

module.exports = { register, listar };
