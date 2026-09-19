// יומן התורים של הספר - SUC-9
// מציג אך ורק את התורים שנקבעו לספר המחובר

import { useState, useEffect } from "react";
import { get } from "../api";

function BarberCalendar() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCalendar() {
      try {
        const data = await get("/appointments/barber-calendar");
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    }

    loadCalendar();
  }, []);

  // מקבצים את התורים לפי תאריך, כדי להציג כותרת לכל יום
  function groupByDate(list) {
    const groups = {};

    for (let i = 0; i < list.length; i++) {
      const appointment = list[i];

      if (!groups[appointment.date]) {
        groups[appointment.date] = [];
      }

      groups[appointment.date].push(appointment);
    }

    return groups;
  }

  if (loading) {
    return (
      <div className="page">
        <div className="empty">טוען...</div>
      </div>
    );
  }

  const groups = groupByDate(appointments);
  const dates = Object.keys(groups).sort();

  return (
    <div className="page">
      <h1 className="page-title">יומן התורים שלי</h1>

      {error && <div className="message error">{error}</div>}

      {/* הסתעפות א של SUC-9 - לא נקבעו תורים */}
      {appointments.length === 0 && <div className="empty">לא נקבעו תורים עדיין</div>}

      {dates.map((date) => (
        <div key={date} className="card">
          <h3
            style={{
              marginBottom: 12,
              paddingBottom: 9,
              borderBottom: "2px solid #c9a227",
            }}
          >
            {date}
            <span style={{ fontSize: 14, fontWeight: 400, color: "#6b6b6b" }}>
              {"  "}({groups[date].length} תורים)
            </span>
          </h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>שעה</th>
                  <th>משך</th>
                  <th>לקוח</th>
                  <th>טלפון</th>
                  <th>שירות</th>
                </tr>
              </thead>
              <tbody>
                {groups[date].map((appointment) => (
                  <tr key={appointment._id}>
                    <td>
                      <strong>{appointment.startTime}</strong>
                    </td>
                    <td>{appointment.duration} דק׳</td>
                    <td>
                      {appointment.customerId
                        ? appointment.customerId.firstName +
                          " " +
                          appointment.customerId.lastName
                        : "לקוח לא ידוע"}
                    </td>
                    <td dir="ltr" style={{ textAlign: "right" }}>
                      {appointment.customerId ? appointment.customerId.phone : ""}
                    </td>
                    <td>{appointment.serviceType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BarberCalendar;
