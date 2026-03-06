const bcrypt = require("bcrypt");
const Professor = require("../models/Professor");

const register = async (req, res) => {
  try {
    const { nome, email, senha, ativo, tipoProfessor, cursoCoordenado } = req.body;

    const existe = await Professor.findOne({ email });
    if (existe) return res.json({ erro: "Email já cadastrado" });

    const senhaHash = await bcrypt.hash(senha, 10);

    const professor = await Professor.create({
      nome,
      email,
      senha: senhaHash,
      ativo: ativo ?? true,
      tipoProfessor: tipoProfessor ?? "professor",
      cursoCoordenado: tipoProfessor === "coordenador" ? cursoCoordenado : null,
    });

    res.json({ mensagem: "Professor criado com sucesso!", professorId: professor._id });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const professor = await Professor.findOne({ email }).populate("cursoCoordenado", "nome");
    if (!professor) return res.json({ sucesso: false });

    if (!professor.ativo) return res.json({ sucesso: false, erro: "Professor inativo" });

    const senhaCorreta = await bcrypt.compare(senha, professor.senha);
    if (!senhaCorreta) return res.json({ sucesso: false });

    res.json({
      sucesso:         true,
      nome:            professor.nome,
      professorId:     professor._id,
      tipoProfessor:   professor.tipoProfessor,             // "professor" | "coordenador"
      cursoCoordenado: professor.cursoCoordenado?._id ?? null,
      cursoNome:       professor.cursoCoordenado?.nome ?? null,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

const listar = async (req, res) => {
  const professores = await Professor.find();
  res.json(professores);
};

module.exports = { register, login, listar };