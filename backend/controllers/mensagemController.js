const Mensagem = require("../models/Mensagem");
const Aluno = require("../models/Aluno");

const listar = async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.alunoId);
    if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" });

    const mensagens = await Mensagem.find({
      arquivadaPor: { $ne: req.params.alunoId },
      $or: [
        { tipo: "Geral" },
        { tipo: "Curso", destinatarioCurso: aluno.curso },
        { tipo: "Individual", destinatarioAluno: req.params.alunoId },
      ],
    }).sort({ createdAt: -1 });

    const resultado = mensagens.map(m => ({
      ...m.toObject(),
      lida: m.leituras.some(l => l.aluno.toString() === req.params.alunoId),
    }));

    res.json(resultado);
  } catch {
    res.status(500).json({ erro: "Erro ao listar mensagens" });
  }
};

const marcarLida = async (req, res) => {
  try {
    const msg = await Mensagem.findById(req.params.msgId);
    if (!msg) return res.status(404).json({ erro: "Mensagem não encontrada" });

    const jaLeu = msg.leituras.some(l => l.aluno.toString() === req.params.alunoId);
    if (!jaLeu) {
      msg.leituras.push({ aluno: req.params.alunoId });
      await msg.save();
    }
    res.json({ mensagem: "Marcada como lida" });
  } catch {
    res.status(500).json({ erro: "Erro ao marcar mensagem" });
  }
};

const arquivar = async (req, res) => {
  try {
    await Mensagem.findByIdAndUpdate(req.params.msgId, {
      $addToSet: { arquivadaPor: req.params.alunoId },
    });
    res.json({ mensagem: "Mensagem arquivada!" });
  } catch {
    res.status(500).json({ erro: "Erro ao arquivar mensagem" });
  }
};

// Para uso futuro do admin/coordenador
const criar = async (req, res) => {
  try {
    const { titulo, corpo, remetente, tipo, destinatarioAluno, destinatarioCurso, prioridade } = req.body;
    const msg = await Mensagem.create({ titulo, corpo, remetente, tipo, destinatarioAluno, destinatarioCurso, prioridade });
    res.json({ mensagem: "Mensagem enviada!", msg });
  } catch {
    res.status(500).json({ erro: "Erro ao criar mensagem" });
  }
};

module.exports = { listar, marcarLida, arquivar, criar };