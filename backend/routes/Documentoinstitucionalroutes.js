const express = require("express");
const router  = express.Router();
const { listar, criar, deletar, editar, uploadMiddleware } = require("../controllers/documentoInstitucionalController");

// Aluno e coordenador — listar documentos do seu curso
// GET /documentos-institucionais?cursoId=xxx
router.get("/", listar);

// Apenas coordenador — gerenciar documentos (multer aplicado nas rotas de escrita)
router.post(  "/:professorId",               uploadMiddleware, criar);
router.patch( "/:professorId/:documentoId",  uploadMiddleware, editar);
router.delete("/:professorId/:documentoId",  deletar);

module.exports = router;