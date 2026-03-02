function Calendar() {
  const eventos = [
    {
      data: "05/02/2025",
      evento: "Início do Semestre Letivo"
    },
    {
      data: "18/03/2025",
      evento: "Avaliação Parcial (AP1)"
    },
    {
      data: "21/04/2025",
      evento: "Feriado - Tiradentes"
    },
    {
      data: "10/06/2025",
      evento: "Avaliação Parcial (AP2)"
    },
    {
      data: "01/07/2025",
      evento: "Encerramento do Semestre"
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>Calendário Acadêmico</h1>

        <table style={styles.tabela}>
          <thead>
            <tr>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Evento</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((item, index) => (
              <tr key={index}>
                <td style={styles.td}>{item.data}</td>
                <td style={styles.td}>{item.evento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px",
    backgroundColor: "#f5f7fa",
    minHeight: "calc(100vh - 120px)"
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "800px"
  },
  titulo: {
    color: "#4a7fa5",
    fontWeight: 300,
    fontSize: "2rem",
    marginBottom: "24px",
    fontFamily: "sans-serif"
  },
  tabela: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #d0e0f0",
    color: "#4a7fa5",
    fontWeight: "600",
    fontFamily: "sans-serif"
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    fontFamily: "sans-serif",
    color: "#555"
  }
};

export default Calendar;