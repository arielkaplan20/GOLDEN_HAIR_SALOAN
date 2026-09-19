// מסך עריכת שעות העבודה של הספר - SUC-9, החלק השני
//
// זה החלק שהיה חסר במפרט המקורי של SUC-9 בספר, לפי ממצא 15
// בקובץ התיקונים. הוא מממש את דרישה 28.

import { useState, useEffect } from "react";
import { get, put } from "../api";

function BarberSchedule() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadSchedule() {
      try {
        const data = await get("/schedule/my");
        setDays(data);
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    }

    loadSchedule();
  }, []);

  // מעדכן שדה אחד ביום מסוים
  function updateDay(index, field, value) {
    const newDays = days.map((day, i) => {
      if (i === index) {
        return { ...day, [field]: value };
      }
      return day;
    });

    setDays(newDays);
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    try {
      const data = await put("/schedule/my", { days: days });
      setSuccess(data.message);
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

  return (
    <div className="page">
      <h1 className="page-title">שעות העבודה שלי</h1>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <div className="card">
        <p style={{ marginBottom: 16, color: "#6b6b6b", fontSize: 15 }}>
          סמן את הימים שבהם אתה עובד והגדר לכל יום שעת פתיחה ושעת סגירה. השעות הפנויות
          שיוצגו ללקוחות מחושבות לפי מה שתגדיר כאן.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>יום</th>
                <th>עובד?</th>
                <th>שעת פתיחה</th>
                <th>שעת סגירה</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, index) => (
                <tr key={day.dayOfWeek}>
                  <td>
                    <strong>יום {day.dayName}</strong>
                  </td>

                  <td>
                    <input
                      type="checkbox"
                      checked={!day.isClosed}
                      onChange={(e) => updateDay(index, "isClosed", !e.target.checked)}
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                    />
                  </td>

                  <td>
                    <input
                      type="time"
                      value={day.openTime}
                      disabled={day.isClosed}
                      onChange={(e) => updateDay(index, "openTime", e.target.value)}
                      style={{ maxWidth: 130 }}
                    />
                  </td>

                  <td>
                    <input
                      type="time"
                      value={day.closeTime}
                      disabled={day.isClosed}
                      onChange={(e) => updateDay(index, "closeTime", e.target.value)}
                      style={{ maxWidth: 130 }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn" style={{ marginTop: 18 }} onClick={handleSave}>
          שמירת שעות העבודה
        </button>
      </div>
    </div>
  );
}

export default BarberSchedule;
