const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔗 Conectar ao MongoDB local
mongoose.connect("mongodb://localhost:27017/meubanco")
  .then(() => console.log("MongoDB conectado!"))
  .catch(err => console.log("Erro ao conectar:", err));

// 📦 Schema
const UsuarioSchema = new mongoose.Schema({
  usuario: String,
  senha: String
});

const Usuario = mongoose.model("usuarios", UsuarioSchema);

// 🔐 Rota de login
app.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    const user = await Usuario.findOne({ usuario, senha });

    if (user) {
      res.json({ sucesso: true, usuario: user.usuario });
    } else {
      res.json({ sucesso: false });
    }
  } catch (error) {
    res.status(500).json({ sucesso: false });
  }
});

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});