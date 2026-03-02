import "./Calendar.css";

function Calendar() {
  const year = 2026;
  const months = [0, 1, 2, 3, 4, 5];

  function generateCalendar(month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d });
    }

    return days;
  }

  const monthNames = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
  ];

  return (
    <div className="calendar-container">
      <h1 className="calendar-title">Calendário Acadêmico</h1>

      <div className="calendar-grid">
        {months.map((month, index) => (
          <div key={month} className="calendar-card">
            <div className="calendar-header">
              {monthNames[index]}/{year}
            </div>

            <div className="week-days">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="days-grid">
              {generateCalendar(month).map((item, i) => {
                const isLetivo = item.day >= 23;
                const isFeriado = item.day === 7; // exemplo

                return (
                  <div
                    key={i}
                    className={`day 
                      ${item.day ? "" : "empty"} 
                      ${isLetivo ? "letivo" : ""} 
                      ${isFeriado ? "feriado" : ""}`}
                  >
                    {item.day || ""}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* LEGENDA */}
      <div className="legend">
        <h3>Legenda</h3>

        <div className="legend-item">
          <div className="legend-box nao-letivo"></div>
          <span> - Dias não Letivos</span>
        </div>

        <div className="legend-item">
          <div className="legend-box letivo"></div>
          <span> - Dias Letivos</span>
        </div>

        <div className="legend-item">
          <div className="legend-box feriado"></div>
          <span> - Feriados</span>
        </div>
      </div>
    </div>
  );
}

export default Calendar;

// TODO Fazer o perfil do cordernador ajustar os dias de aula
// TODO Melhorar o visual no final do dia