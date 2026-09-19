// ניהול כל התורים במערכת - SUC-11

import { useState, useEffect } from "react";
import { get, remove } from "../api";

const STATUS_NAMES = {
  scheduled: "נקבע",
  rescheduled: "שונה",
  cancelled: "בוטל",
  completed: "התקיים",
  noshow: "לא הגיע",
};

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // סינון לפי סטטוס
  const [filter, setFilter] = useState("all");

  async function loadAppointments() {
    try {
      const data = await get("/appointments/all");
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function handleCancel(appointmentId) {
    setError("");
    setSuccess("");

    try {
      await remove("/appointments/" + appointmentId);
      setSuccess("התור בוטל בהצלחה");

      await loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="empty">טוען...</div>
      </div>
    );
  }

  // מסננים לפי מה שנבחר
  let visible = appointments;

  if (filter === "active") {
    visible = appointments.filter((a) => a.status !== "cancelled");
  }

  if (filter === "cancelled") {
    visible = appointments.filter((a) => a.status === "cancelled");
  }

  return (
    <div className="page">
      <h1 className="page-title">ניהול תורים</h1>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <div className="card">
        <div className="actions" style={{ marginBottom: 16 }}>
          <button
            className={filter === "all" ? "btn btn-small" : "btn-small btn-light"}
            onClick={() => setFilter("all")}
          >
            הכול ({appointments.length})
          </button>
          <button
            className={filter === "active" ? "btn btn-small" : "btn-small btn-light"}
            onClick={() => setFilter("active")}
          >
            פעילים
          </button>
          <button
            className={filter === "cancelled" ? "btn btn-small" : "btn-small btn-light"}
            onClick={() => setFilter("cancelled")}
          >
            מבוטלים
          </button>
        </div>

        {/* הסתעפות א של SUC-11 - אין תורים במערכת */}
        {visible.length === 0 ? (
          <div className="empty">אין תורים קיימים במערכת</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>תאריך</th>
                  <th>שעה</th>
                  <th>לקוח</th>
                  <th>טלפון</th>
                  <th>ספר</th>
                  <th>שירות</th>
                  <th>סטטוס</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment.date}</td>
                    <td>
                      <strong>{appointment.startTime}</strong>
                    </td>
                    <td>
                      {appointment.customerId
                        ? appointment.customerId.firstName +
                          " " +
                          appointment.customerId.lastName
                        : "לא ידוע"}
                    </td>
                    <td dir="ltr" style={{ textAlign: "right" }}>
                      {appointment.customerId ? appointment.customerId.phone : ""}
                    </td>
                    <td>
                      {appointment.barberId
                        ? appointment.barberId.firstName + " " + appointment.barberId.lastName
                        : "לא ידוע"}
                    </td>
                    <td>{appointment.serviceType}</td>
                    <td>
                      <span
                        className={
                          "badge " + (appointment.status === "cancelled" ? "red" : "green")
                        }
                      >
                        {STATUS_NAMES[appointment.status]}
                      </span>
                    </td>
                    <td>
                      {appointment.status !== "cancelled" && (
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleCancel(appointment._id)}
                        >
                          ביטול
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAppointments;
