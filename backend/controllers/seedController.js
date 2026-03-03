const Curso = require("../models/Curso");
const Disciplina = require("../models/Disciplina");

const seed = async (req, res) => {
  try {
    await Curso.deleteMany();
    await Disciplina.deleteMany();

    const eng = await Curso.create({ nome: "Engenharia da Computação", duracaoSemestres: 10 });
    const med = await Curso.create({ nome: "Medicina", duracaoSemestres: 12 });

    await Disciplina.create([
      {
        nome: "Cálculo I",
        semestre: 1,
        cargaHoraria: 80,
        valor: 1366.95,
        horario: { dia: "Segunda", inicio: "19:00", fim: "20:40" },
        sala: "B101",
        curso: eng._id,
      },
      {
        nome: "Lógica de Programação",
        semestre: 1,
        cargaHoraria: 60,
        valor: 1366.95,
        horario: { dia: "Terça", inicio: "19:00", fim: "20:40" },
        sala: "B102",
        curso: eng._id,
      },
      {
        nome: "Anatomia I",
        semestre: 1,
        cargaHoraria: 100,
        valor: 1500.0,
        horario: { dia: "Quarta", inicio: "19:00", fim: "22:00" },
        sala: "A201",
        curso: med._id,
      },
    ]);

    res.json({ mensagem: "Banco populado com sucesso!" });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = { seed };
