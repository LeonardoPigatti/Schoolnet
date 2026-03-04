const TCC = require("../models/TCC");

const obter = async (req, res) => {
  try {
    const tcc = await TCC.findOne({ aluno: req.params.alunoId });
    res.json(tcc || null);
  } catch {
    res.status(500).json({ erro: "Erro ao buscar TCC" });
  }
};

const salvar = async (req, res) => {
  try {
    const { titulo, resumo, orientador, dataDefesa, banca, arquivo } = req.body;
    let tcc = await TCC.findOne({ aluno: req.params.alunoId });

    const dados = { titulo, resumo, orientador, dataDefesa, banca, arquivo };

    if (tcc) {
      // Só permite editar se não estiver aprovado
      if (tcc.status === "Aprovado") return res.status(403).json({ erro: "TCC já aprovado, não pode ser editado." });
      tcc = await TCC.findOneAndUpdate({ aluno: req.params.alunoId }, { ...dados, status: "Rascunho" }, { new: true });
    } else {
      tcc = await TCC.create({ aluno: req.params.alunoId, ...dados });
    }

    res.json({ mensagem: "TCC salvo!", tcc });
  } catch {
    res.status(500).json({ erro: "Erro ao salvar TCC" });
  }
};

const enviar = async (req, res) => {
  try {
    const tcc = await TCC.findOneAndUpdate(
      { aluno: req.params.alunoId },
      { status: "Enviado" },
      { new: true }
    );
    if (!tcc) return res.status(404).json({ erro: "TCC não encontrado" });
    res.json({ mensagem: "TCC enviado para análise!", tcc });
  } catch {
    res.status(500).json({ erro: "Erro ao enviar TCC" });
  }
};

module.exports = { obter, salvar, enviar };