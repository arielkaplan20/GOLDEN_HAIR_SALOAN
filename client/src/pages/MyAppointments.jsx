// מסך התורים שלי - SUC-4, SUC-5 ו-SUC-6
//
// כאן מרוכזים שלושת התהליכים: צפייה, שינוי וביטול.
// לפי ממצא 19 בקובץ התיקונים, שינוי וביטול הם כפתורים
// ליד כל תור ולא פריטי תפריט נפרדים.

import { useState, useEffect } from "react";
import { get, put, remove } from "../api";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // התור שנמצא כרגע בתהליך שינוי
  const [changing, setChanging] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [freeSlots, setFreeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // התור שנמצא כרגע בתהליך ביטול (חלון האישור)
  const [cancelling, setCancelling] = useState(null);

  async function loadAppointments() {
    try {
      const data = await get("/appointments/my");
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  // שליפת השעות הפנויות למועד החדש
  useEffect(() => {
    async function loadSlots() {
      if (!changing || !newDate) {
        setFreeSlots([]);
        return;
      }

      setLoadingSlots(true);
      setNewTime("");

      try {
        const url =
          "/appointments/free-slots?barberId=" +
          changing.barberId._id +
          "&date=" +
          newDate +
          "&serviceType=" +
          encodeURIComponent(changing.serviceType);

        const data = await get(url);
        setFreeSlots(data.slots);
      } catch (err) {
        setError(err.message);
      }

      setLoadingSlots(false);
    }

    loadSlots();
  }, [changing, newDate]);

  function startChange(appointment) {
    setChanging(appointment);
    setNewDate("");
    setNewTime("");
    setError("");
    setSuccess("");
  }

  async function confirmChange() {
    setError("");

    try {
      await put("/appointments/" + changing._id, { date: newDate, startTime: newTime });

      setSuccess("התור שונה בהצלחה");
      setChanging(null);

      await loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmCancel() {
    setError("");

    try {
      await remove("/appointments/" + cancelling._id);

      setSuccess("התור בוטל בהצלחה והמועד התפנה");
      setCancelling(null);

      await loadAppointments();
    } catch (err) {
      setError(err.message);
      setCancelling(null);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="page">
        <div className="empty">טוען...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">התורים שלי</h1>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      {/* הסתעפות א של SUC-4 - אין תורים קיימים */}
      {appointments.length === 0 && <div className="empty">אין תורים קיימים</div>}

      {appointments.map((appointment) => (
        <div key={appointment._id}>
          <div className="list-item">
            <div className="info">
              <h3>{appointment.serviceType}</h3>
              <p>
                אצל {appointment.barberId.firstName} {appointment.barberId.lastName}
              </p>
              <p>
                {appointment.date} בשעה {appointment.startTime} ({appointment.duration} דקות)
              </p>
            </div>

            <div className="actions">
              <button className="btn btn-small" onClick={() => startChange(appointment)}>
                שינוי תור
              </button>
              <button
                className="btn-small btn-danger"
                onClick={() => setCancelling(appointment)}
              >
                ביטול תור
              </button>
            </div>
          </div>

          {/* טופס שינוי התור - נפתח מתחת לתור שנבחר */}
          {changing && changing._id === appointment._id && (
            <div className="card" style={{ marginTop: -6 }}>
              <h3 style={{ marginBottom: 12 }}>בחירת מועד חדש</h3>

              <div className="form-row">
                <label>תאריך חדש</label>
                <input
                  type="date"
                  value={newDate}
                  min={today}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{ maxWidth: 260 }}
                />
              </div>

              {newDate && loadingSlots && <div className="empty">טוען שעות פנויות...</div>}

              {/* הסתעפות ב של SUC-5 - אין שעות פנויות בתאריך החדש */}
              {newDate && !loadingSlots && freeSlots.length === 0 && (
                <div className="empty">אין שעות פנויות בתאריך זה, נסה תאריך אחר</div>
              )}

              {newDate && !loadingSlots && freeSlots.length > 0 && (
                <>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                    שעה חדשה
                  </label>
                  <div className="slot-grid">
                    {freeSlots.map((slot) => (
                      <button
                        key={slot}
                        className={"slot " + (newTime === slot ? "selected" : "")}
                        onClick={() => setNewTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="actions" style={{ marginTop: 16 }}>
                <button className="btn" onClick={confirmChange} disabled={!newTime}>
                  אישור השינוי
                </button>
                <button className="btn-light" onClick={() => setChanging(null)}>
                  ביטול
                </button>
              </div>
            </div>
          )}

          {/* חלון אישור הביטול - צעד 4 של SUC-6 */}
          {cancelling && cancelling._id === appointment._id && (
            <div className="card" style={{ marginTop: -6 }}>
              <h3 style={{ marginBottom: 10 }}>אישור ביטול</h3>
              <p style={{ marginBottom: 16 }}>
                האם אתה בטוח שברצונך לבטל את התור בתאריך {appointment.date} בשעה{" "}
                {appointment.startTime}?
              </p>

              <div className="actions">
                <button className="btn-danger" onClick={confirmCancel}>
                  כן, בטל את התור
                </button>
                <button className="btn-light" onClick={() => setCancelling(null)}>
                  לא
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default MyAppointments;
