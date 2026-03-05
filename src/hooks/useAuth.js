import { useState } from "react";

export default function useAuth() {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  function login(dados) {
    localStorage.setItem("usuario", JSON.stringify(dados));
    setUsuario(dados);
  }

  function logout() {
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  return { usuario, login, logout };
}