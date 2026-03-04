const CreditoImpressao = require("../models/CreditoImpressao");

const obter = async (req, res) => {
  try {
    let credito = await CreditoImpressao.findOne({ aluno: req.params.alunoId });
    if (!credito) credito = await CreditoImpressao.create({ aluno: req.params.alunoId });
    res.json(credito);
  } catch {
    res.status(500).json({ erro: "Erro ao buscar créditos" });
  }
};

const comprar = async (req, res) => {
  try {
    const { quantidade, formaPagamento } = req.body;
    if (!quantidade || quantidade <= 0) return res.status(400).json({ erro: "Quantidade inválida" });

    let credito = await CreditoImpressao.findOne({ aluno: req.params.alunoId });
    if (!credito) credito = await CreditoImpressao.create({ aluno: req.params.alunoId });

    // Em produção aqui entraria a integração com gateway de pagamento
    // Por ora confirma direto
    credito.saldo += quantidade;
    credito.transacoes.push({
      tipo: "Recarga",
      quantidade,
      descricao: `Recarga de ${quantidade} créditos`,
      formaPagamento,
      status: "Confirmado",
    });

    await credito.save();
    res.json({ mensagem: "Créditos adicionados!", credito });
  } catch {
    res.status(500).json({ erro: "Erro ao comprar créditos" });
  }
};

module.exports = { obter, comprar };