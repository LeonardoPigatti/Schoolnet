const Matricula = require("../models/Matricula");

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

module.exports = { atualizarSituacao };