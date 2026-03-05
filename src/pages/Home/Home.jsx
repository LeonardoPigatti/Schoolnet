export default function Home({ nome }) {
  return (
    <div className="card">
      <h1 className="titulo">Bem-vindo, {nome}! 👋</h1>
      <p className="subtitulo">Você está logado com sucesso.</p>
    </div>
  );
}