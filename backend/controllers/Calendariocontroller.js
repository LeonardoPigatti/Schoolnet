const Calendario = require("../models/Calendario");

// Feriados nacionais sugeridos para 2026
const FERIADOS_SUGERIDOS_2026 = [
  { data: "2026-01-01", descricao: "Confraternização Universal" },
  { data: "2026-02-16", descricao: "Carnaval" },
  { data: "2026-02-17", descricao: "Carnaval" },
  { data: "2026-04-03", descricao: "Sexta-feira Santa" },
  { data: "2026-04-21", descricao: "Tiradentes" },
  { data: "2026-05-01", descricao: "Dia do Trabalho" },
  { data: "2026-06-04", descricao: "Corpus Christi" },
  { data: "2026-09-07", descricao: "Independência do Brasil" },
  { data: "2026-10-12", descricao: "Nossa Senhora Aparecida" },
  { data: "2026-11-02", descricao: "Finados" },
  { data: "2026-11-15", descricao: "Proclamação da República" },
  { data: "2026-12-25", descricao: "Natal" },
];

// ── BUSCAR calendário do curso ───────────────────────────────────────
const buscar = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const calendario = await Calendario.findOne({ curso: cursoId });

    if (!calendario) {
      // Retorna vazio + sugestões de feriados para o coordenador começar
      return res.json({
        existe: false,
        dias: [],
        sugestoes: FERIADOS_SUGERIDOS_2026,
      });
    }

    res.json({ existe: true, dias: calendario.dias, sugestoes: FERIADOS_SUGERIDOS_2026 });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// ── SALVAR (cria ou atualiza) ────────────────────────────────────────
const salvar = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const { dias, ano } = req.body;

    const calendario = await Calendario.findOneAndUpdate(
      { curso: cursoId },
      { curso: cursoId, ano: ano ?? 2026, dias },
      { upsert: true, new: true }
    );

    res.json({ mensagem: "Calendário salvo com sucesso!", calendario });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

module.exports = { buscar, salvar };