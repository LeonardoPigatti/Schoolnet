const Repositorio = require("../models/Repositorio");

const listar = async (req, res) => {
  try {
    const { busca, curso, ano } = req.query;
    const filtro = {};
    if (curso) filtro.curso = curso;
    if (ano)   filtro.ano = Number(ano);
    if (busca) filtro.$or = [
      { titulo:    { $regex: busca, $options: "i" } },
      { autor:     { $regex: busca, $options: "i" } },
      { resumo:    { $regex: busca, $options: "i" } },
      { palavrasChave: { $regex: busca, $options: "i" } },
    ];

    const tccs = await Repositorio.find(filtro, { "arquivo.dados": 0 }).sort({ ano: -1, createdAt: -1 });
    res.json(tccs);
  } catch {
    res.status(500).json({ erro: "Erro ao listar repositório" });
  }
};

const baixar = async (req, res) => {
  try {
    const tcc = await Repositorio.findById(req.params.id);
    if (!tcc || !tcc.arquivo?.dados) return res.status(404).json({ erro: "Arquivo não encontrado" });

    await Repositorio.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });

    const buffer = Buffer.from(tcc.arquivo.dados, "base64");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${tcc.arquivo.nome || tcc.titulo}.pdf"`);
    res.send(buffer);
  } catch {
    res.status(500).json({ erro: "Erro ao baixar arquivo" });
  }
};

const visualizar = async (req, res) => {
  try {
    const tcc = await Repositorio.findByIdAndUpdate(
      req.params.id,
      { $inc: { visualizacoes: 1 } },
      { new: true, projection: { "arquivo.dados": 0 } }
    );
    if (!tcc) return res.status(404).json({ erro: "TCC não encontrado" });
    res.json(tcc);
  } catch {
    res.status(500).json({ erro: "Erro ao buscar TCC" });
  }
};

// Para uso futuro do admin
const criar = async (req, res) => {
  try {
    const tcc = await Repositorio.create(req.body);
    res.json({ mensagem: "TCC adicionado ao repositório!", tcc });
  } catch {
    res.status(500).json({ erro: "Erro ao criar TCC" });
  }
};

module.exports = { listar, baixar, visualizar, criar };