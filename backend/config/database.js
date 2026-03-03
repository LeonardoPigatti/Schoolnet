const mongoose = require("mongoose");

const conectar = async () => {
  await mongoose
    .connect("mongodb://localhost:27017/faculdade")
    .then(() => console.log("MongoDB conectado!"))
    .catch((err) => console.log(err));
};

module.exports = { conectar };