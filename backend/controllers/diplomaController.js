const PDFDocument = require("pdfkit");
const Aluno = require("../models/Aluno");
const Matricula = require("../models/Matricula");
const Estagio = require("../models/Estagio");
const AtividadeComplementar = require("../models/AtividadeComplementar");

const HORAS_MINIMAS_AC = 200; // ajuste conforme seu curso

const verificar = async (req, res) => {
  try {
    const { alunoId } = req.params;

    const aluno = await Aluno.findById(alunoId).populate("curso");
    if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" });

    // 1. Todas disciplinas aprovadas
    const matriculas = await Matricula.find({ aluno: alunoId }).populate("disciplina");
    const disciplinasTotal = matriculas.length;
    const disciplinasAprovadas = matriculas.filter(m => m.nota >= 5).length;
    const disciplinasOk = disciplinasTotal > 0 && disciplinasTotal === disciplinasAprovadas;

    // 2. Estágio concluído
    const estagio = await Estagio.findOne({ aluno: alunoId });
    const estagioOk = estagio?.status === "Concluído";

    // 3. Atividades complementares
    const atividades = await AtividadeComplementar.find({ aluno: alunoId, status: "Aprovada" });
    const horasAC = atividades.reduce((acc, a) => acc + a.cargaHoraria, 0);
    const atividadesOk = horasAC >= HORAS_MINIMAS_AC;

    const apto = disciplinasOk && estagioOk && atividadesOk;

    res.json({
      apto,
      aluno: aluno.nome,
      curso: aluno.curso?.nome,
      checklist: {
        disciplinas: { ok: disciplinasOk, aprovadas: disciplinasAprovadas, total: disciplinasTotal },
        estagio: { ok: estagioOk, status: estagio?.status || "Não cadastrado" },
        atividadesComplementares: { ok: atividadesOk, horas: horasAC, minimo: HORAS_MINIMAS_AC },
      },
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao verificar requisitos" });
  }
};

const gerar = async (req, res) => {
  try {
    const { alunoId } = req.params;

    const aluno = await Aluno.findById(alunoId).populate("curso");
    if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" });

    // Revalida antes de gerar
    const matriculas = await Matricula.find({ aluno: alunoId }).populate("disciplina");
    const todasAprovadas = matriculas.length > 0 && matriculas.every(m => m.nota >= 5);
    const estagio = await Estagio.findOne({ aluno: alunoId });
    const estagioOk = estagio?.status === "Concluído";
    const atividades = await AtividadeComplementar.find({ aluno: alunoId, status: "Aprovada" });
    const horasAC = atividades.reduce((acc, a) => acc + a.cargaHoraria, 0);
    const atividadesOk = horasAC >= 200;

    if (!todasAprovadas || !estagioOk || !atividadesOk) {
      return res.status(403).json({ erro: "Aluno não atende todos os requisitos para emissão do diploma." });
    }

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 60 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="diploma_${aluno.nome.replace(/ /g, "_")}.pdf"`);
    doc.pipe(res);

    const W = 841, H = 595;

    // Fundo
    doc.rect(0, 0, W, H).fill("#0d0f2b");

    // Borda dupla decorativa
    doc.rect(20, 20, W - 40, H - 40).lineWidth(3).strokeColor("#5b6cff").stroke();
    doc.rect(28, 28, W - 56, H - 56).lineWidth(1).strokeColor("#a78bfa").stroke();

    // Ornamentos de canto
    const corners = [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]];
    corners.forEach(([cx, cy]) => {
      doc.circle(cx, cy, 6).fill("#5b6cff");
    });

    // Linha decorativa central superior
    doc.rect(W / 2 - 120, 55, 240, 2).fill("#5b6cff");

    // Título da instituição
    doc.fontSize(11).fillColor("#a78bfa")
      .text("SCHOOLNET — INSTITUIÇÃO DE ENSINO SUPERIOR", 0, 65, { align: "center", characterSpacing: 3 });

    // Linha decorativa
    doc.rect(W / 2 - 80, 88, 160, 1).fill("#5b6cff");

    // DIPLOMA
    doc.fontSize(42).fillColor("#ffffff")
      .font("Helvetica-Bold")
      .text("DIPLOMA", 0, 105, { align: "center", characterSpacing: 6 });

    // Subtítulo
    doc.fontSize(13).fillColor("#a78bfa").font("Helvetica")
      .text("DE GRADUAÇÃO", 0, 158, { align: "center", characterSpacing: 4 });

    // Texto principal
    doc.fontSize(12).fillColor("#ccccdd").font("Helvetica")
      .text("A Instituição de Ensino Superior SCHOOLNET confere o presente diploma a", 0, 210, { align: "center" });

    // Nome do aluno
    doc.fontSize(28).fillColor("#ffffff").font("Helvetica-BoldOblique")
      .text(aluno.nome, 0, 235, { align: "center" });

    // Linha sob o nome
    const nomeWidth = 320;
    doc.rect(W / 2 - nomeWidth / 2, 272, nomeWidth, 1).fill("#5b6cff");

    // Curso
    doc.fontSize(12).fillColor("#ccccdd").font("Helvetica")
      .text("pelo cumprimento integral dos requisitos do curso de", 0, 282, { align: "center" });

    doc.fontSize(18).fillColor("#a78bfa").font("Helvetica-Bold")
      .text(aluno.curso?.nome?.toUpperCase() || "CURSO SUPERIOR", 0, 304, { align: "center" });

    // Data e local
    const dataFormatada = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
    doc.fontSize(11).fillColor("#888899").font("Helvetica")
      .text(`Emitido em ${dataFormatada}`, 0, 345, { align: "center" });

    // Assinaturas
    const assinY = 430;
    const col1 = 180, col2 = W / 2, col3 = W - 180;

    [[col1, "Diretor Acadêmico"], [col2, "Reitor"], [col3, "Secretário Geral"]].forEach(([x, cargo]) => {
      doc.rect(x - 70, assinY, 140, 1).fill("#5b6cff");
      doc.fontSize(9).fillColor("#aaaacc").font("Helvetica")
        .text(cargo, x - 70, assinY + 6, { width: 140, align: "center" });
    });

    // Código verificador
    const codigo = `SCH-${Date.now().toString(36).toUpperCase()}`;
    doc.fontSize(8).fillColor("#555577")
      .text(`Código de verificação: ${codigo}`, 0, H - 45, { align: "center" });

    doc.end();
  } catch (err) {
    res.status(500).json({ erro: "Erro ao gerar diploma" });
  }
};

module.exports = { verificar, gerar };