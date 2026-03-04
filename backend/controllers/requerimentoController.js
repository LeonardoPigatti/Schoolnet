const PDFDocument = require("pdfkit");
const Aluno = require("../models/Aluno");
const Matricula = require("../models/Matricula");

function cabecalho(doc, titulo) {
  doc.rect(0, 0, 612, 80).fill("#1a1a2e");
  doc.fontSize(10).fillColor("#aaaacc").text("SCHOOLNET — SISTEMA ACADÊMICO", 50, 20);
  doc.fontSize(18).fillColor("#ffffff").text(titulo, 50, 38);
  doc.rect(0, 80, 612, 3).fill("#5b6cff");
  doc.moveDown(3);
  doc.fillColor("#111111");
}

function rodape(doc) {
  const y = 760;
  doc.rect(0, y, 612, 1).fill("#dddddd");
  doc.fontSize(8).fillColor("#999999")
    .text(`Documento gerado em ${new Date().toLocaleString("pt-BR")}`, 50, y + 8, { align: "center" });
}

function linhaInfo(doc, label, valor) {
  doc.fontSize(10).fillColor("#666666").text(label, { continued: true });
  doc.fontSize(10).fillColor("#111111").text(`  ${valor}`);
  doc.moveDown(0.3);
}

// ── DECLARAÇÃO DE MATRÍCULA ──────────────────────────────────────────────────
const declaracaoMatricula = async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.alunoId).populate("curso");
    if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" });

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="declaracao_matricula_${aluno.nome.replace(/ /g, "_")}.pdf"`);
    doc.pipe(res);

    cabecalho(doc, "Declaração de Matrícula");

    doc.fontSize(12).fillColor("#111111")
      .text("Declaramos, para os devidos fins, que o(a) aluno(a) abaixo identificado(a) encontra-se regularmente matriculado(a) nesta instituição de ensino.", { align: "justify" });
    doc.moveDown(1.5);

    linhaInfo(doc, "Nome:", aluno.nome);
    linhaInfo(doc, "E-mail:", aluno.email);
    linhaInfo(doc, "Curso:", aluno.curso?.nome || "—");
    linhaInfo(doc, "Situação:", "Matriculado(a)");
    linhaInfo(doc, "Data de emissão:", new Date().toLocaleDateString("pt-BR"));

    doc.moveDown(3);
    doc.fontSize(10).fillColor("#666666").text("Por ser verdade, firmamos a presente declaração.", { align: "center" });
    doc.moveDown(2);
    doc.fontSize(10).fillColor("#111111").text("_______________________________", { align: "center" });
    doc.text("Secretaria Acadêmica — Schoolnet", { align: "center" });

    rodape(doc);
    doc.end();
  } catch (err) {
    res.status(500).json({ erro: "Erro ao gerar declaração de matrícula" });
  }
};

// ── HISTÓRICO ESCOLAR ────────────────────────────────────────────────────────
const historicoEscolar = async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.alunoId).populate("curso");
    if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" });

    const matriculas = await Matricula.find({ aluno: req.params.alunoId }).populate("disciplina");

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="historico_${aluno.nome.replace(/ /g, "_")}.pdf"`);
    doc.pipe(res);

    cabecalho(doc, "Histórico Escolar");

    linhaInfo(doc, "Nome:", aluno.nome);
    linhaInfo(doc, "Curso:", aluno.curso?.nome || "—");
    linhaInfo(doc, "Data de emissão:", new Date().toLocaleDateString("pt-BR"));
    doc.moveDown(1);

    // Cabeçalho tabela
    const colX = [50, 220, 340, 420, 500];
    doc.rect(50, doc.y, 512, 22).fill("#5b6cff");
    doc.fontSize(9).fillColor("#ffffff");
    ["Disciplina", "Semestre", "Nota", "Faltas", "Situação"].forEach((h, i) => {
      doc.text(h, colX[i], doc.y - 16, { width: colX[i + 1] - colX[i] - 4 });
    });
    doc.moveDown(0.5);

    if (!matriculas.length) {
      doc.fillColor("#666666").fontSize(10).text("Nenhuma disciplina cursada encontrada.", 50, doc.y + 8);
    } else {
      matriculas.forEach((mat, idx) => {
        const y = doc.y;
        if (idx % 2 === 0) doc.rect(50, y, 512, 20).fill("#f5f5f5");
        doc.fillColor("#111111").fontSize(9);
        const situacao = mat.nota >= 5 ? "Aprovado" : mat.nota != null ? "Reprovado" : "Em curso";
        const linha = [
          mat.disciplina?.nome || "—",
          String(mat.disciplina?.semestre || "—"),
          mat.nota != null ? String(mat.nota) : "—",
          String(mat.faltas || 0),
          situacao,
        ];
        linha.forEach((val, i) => {
          doc.text(val, colX[i], y + 5, { width: (colX[i + 1] || 562) - colX[i] - 4 });
        });
        doc.moveDown(0.8);
      });
    }

    rodape(doc);
    doc.end();
  } catch (err) {
    res.status(500).json({ erro: "Erro ao gerar histórico escolar" });
  }
};

// ── ATESTADO DE FREQUÊNCIA ───────────────────────────────────────────────────
const atestadoFrequencia = async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.alunoId).populate("curso");
    if (!aluno) return res.status(404).json({ erro: "Aluno não encontrado" });

    const matriculas = await Matricula.find({ aluno: req.params.alunoId }).populate("disciplina");

    const totalAulas = matriculas.reduce((acc, m) => acc + (m.disciplina?.cargaHoraria || 0), 0);
    const totalFaltas = matriculas.reduce((acc, m) => acc + (m.faltas || 0), 0);
    const frequencia = totalAulas > 0 ? (((totalAulas - totalFaltas) / totalAulas) * 100).toFixed(1) : "100.0";

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="atestado_frequencia_${aluno.nome.replace(/ /g, "_")}.pdf"`);
    doc.pipe(res);

    cabecalho(doc, "Atestado de Frequência");

    doc.fontSize(12).fillColor("#111111")
      .text("Atestamos que o(a) aluno(a) abaixo identificado(a) apresenta a seguinte frequência no período letivo vigente:", { align: "justify" });
    doc.moveDown(1.5);

    linhaInfo(doc, "Nome:", aluno.nome);
    linhaInfo(doc, "Curso:", aluno.curso?.nome || "—");
    linhaInfo(doc, "Total de aulas:", `${totalAulas}h`);
    linhaInfo(doc, "Total de faltas:", `${totalFaltas}h`);
    linhaInfo(doc, "Frequência geral:", `${frequencia}%`);
    linhaInfo(doc, "Situação:", parseFloat(frequencia) >= 75 ? "Regular (frequência mínima atingida)" : "Irregular (abaixo de 75%)");
    linhaInfo(doc, "Data de emissão:", new Date().toLocaleDateString("pt-BR"));

    doc.moveDown(3);
    doc.fontSize(10).fillColor("#666666").text("Documento emitido eletronicamente pela Secretaria Acadêmica.", { align: "center" });
    doc.moveDown(2);
    doc.fontSize(10).fillColor("#111111").text("_______________________________", { align: "center" });
    doc.text("Secretaria Acadêmica — Schoolnet", { align: "center" });

    rodape(doc);
    doc.end();
  } catch (err) {
    res.status(500).json({ erro: "Erro ao gerar atestado de frequência" });
  }
};

module.exports = { declaracaoMatricula, historicoEscolar, atestadoFrequencia };