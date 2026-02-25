function Navbar({ usuario, onSair }) {
  return (
    <>
      {/* Barra superior azul */}
      <div style={styles.topBar}>
        <div style={styles.topContent}>
          <h1 style={styles.logo}>Schoolnet</h1>

          <div style={styles.userArea}>
            <span>Aluno RA: 110542</span>
          </div>
        </div>
      </div>

      {/* Barra inferior cinza (menu) */}
      <div style={styles.menuBar}>
        <div style={styles.menuContent}>
          <span style={styles.link}>Secretaria ▾</span>
          <span style={styles.link}>Financeiro ▾</span>
          <span style={styles.link}>PagFácil ▾</span>
          <span style={styles.link}>Atividades Acadêmicas ▾</span>
          <span style={styles.link}>Requerimentos ▾</span>
          <span style={styles.link}>SPA e RE ▾</span>
          <span style={styles.link}>Material de Apoio ▾</span>
          <span style={styles.link}>DP Modular ▾</span>
        </div>
      </div>
    </>
  );
}

const styles = {
  /* Barra azul */
  topBar: {
    backgroundColor: "#4f647a",
    height: "70px",
    display: "flex",
    alignItems: "center",
  },

  topContent: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px",
  },

  logo: {
    color: "white",
    fontSize: "42px",
    fontWeight: "300",
    margin: 0,
    paddingLeft:"209px",
    paddingTop:"1px",
    paddingBottom:"6px",
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
  },
  userArea: {
    color: "white",
    fontSize: "14px",
    fontFamily: '"Open Sans", sans-serif',
    marginRight: "179px",
        paddingTop:"8px",

  },

  /* Barra cinza */
  menuBar: {
    backgroundColor: "#F8F8F8",
    height: "48px",
    display: "flex",
    alignItems: "center",
  },

  menuContent: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    gap: "32px",
    padding: "0 24px",
  fontFamily: '"Open Sans", sans-serif',
    paddingLeft: "220px",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: "400",
    letterSpacing: "normal",
    color: "#333333",
  },

  link: {
    cursor: "pointer",
  },
};

export default Navbar;