// מסך הזמנת תור - SUC-3
//
// התהליך מחולק לארבעה שלבים:
// בחירת ספר, בחירת סוג תספורת, בחירת תאריך, ובחירת שעה.
// השעות שמוצגות הן רק השעות הפנויות, לפי החישוב שרץ בשרת.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { get, post } from "../api";

function BookAppointment() {
  const navigate = useNavigate();

  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [freeSlots, setFreeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  // טוענים את רשימת הספרים וסוגי התספורות כשהמסך נפתח
  useEffect(() => {
    async function loadData() {
      try {
        const barbersList = await get("/users/barbers");
        const servicesList = await get("/appointments/services");

        setBarbers(barbersList);
        setServices(servicesList);
      } catch (err) {
        setError(err.message);
      }
    }

    loadData();
  }, []);

  // בכל פעם שמשתנים הספר, סוג התספורת או התאריך -
  // שולפים מחדש את השעות הפנויות
  useEffect(() => {
    async function loadSlots() {
      if (!selectedBarber || !selectedDate || !selectedService) {
        setFreeSlots([]);
        return;
      }

      setLoadingSlots(true);
      setSelectedTime("");
      setError("");

      try {
        const url =
          "/appointments/free-slots?barberId=" +
          selectedBarber._id +
          "&date=" +
          selectedDate +
          "&serviceType=" +
          encodeURIComponent(selectedService.name);

        const data = await get(url);
        setFreeSlots(data.slots);
      } catch (err) {
        setError(err.message);
        setFreeSlots([]);
      }

      setLoadingSlots(false);
    }

    loadSlots();
  }, [selectedBarber, selectedDate, selectedService]);

  async function handleConfirm() {
    setError("");

    try {
      const data = await post("/appointments", {
        barberId: selectedBarber._id,
        date: selectedDate,
        startTime: selectedTime,
        serviceType: selectedService.name,
      });

      setConfirmed(data.appointment);
    } catch (err) {
      setError(err.message);

      // אם השעה נתפסה בינתיים, מרעננים את הרשימה
      // כדי שהלקוח יראה את המצב העדכני
      if (err.message.includes("נתפסה")) {
        const url =
          "/appointments/free-slots?barberId=" +
          selectedBarber._id +
          "&date=" +
          selectedDate +
          "&serviceType=" +
          encodeURIComponent(selectedService.name);

        const data = await get(url);
        setFreeSlots(data.slots);
        setSelectedTime("");
      }
    }
  }

  // התאריך המינימלי שאפשר לבחור הוא היום
  const today = new Date().toISOString().split("T")[0];

  // ---------- מסך האישור ----------
  if (confirmed) {
    return (
      <div className="page">
        <div className="card confirm-box">
          <div className="big-icon">✅</div>
          <h2>התור נקבע בהצלחה</h2>

          <div style={{ marginTop: 18, lineHeight: 2, fontSize: 16 }}>
            <div>
              <strong>ספר:</strong> {selectedBarber.firstName} {selectedBarber.lastName}
            </div>
            <div>
              <strong>שירות:</strong> {confirmed.serviceType}
            </div>
            <div>
              <strong>תאריך:</strong> {confirmed.date}
            </div>
            <div>
              <strong>שעה:</strong> {confirmed.startTime}
            </div>
          </div>

          <div style={{ marginTop: 26 }}>
            <button className="btn" onClick={() => navigate("/my-appointments")}>
              לתורים שלי
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">הזמנת תור</h1>

      {error && <div className="message error">{error}</div>}

      {/* סרגל השלבים */}
      <div className="steps">
        <div className={"step " + (selectedBarber ? "done" : "active")}>1. בחירת ספר</div>
        <div
          className={
            "step " + (selectedService ? "done" : selectedBarber ? "active" : "")
          }
        >
          2. סוג השירות
        </div>
        <div
          className={"step " + (selectedDate ? "done" : selectedService ? "active" : "")}
        >
          3. תאריך
        </div>
        <div className={"step " + (selectedTime ? "done" : selectedDate ? "active" : "")}>
          4. שעה
        </div>
      </div>

      {/* שלב 1 */}
      <div className="card">
        <h3 style={{ marginBottom: 12 }}>בחר נותן שירות</h3>

        {barbers.length === 0 ? (
          <div className="empty">אין נותני שירות במערכת כרגע</div>
        ) : (
          <div className="choice-grid">
            {barbers.map((barber) => (
              <button
                key={barber._id}
                className={
                  "choice " +
                  (selectedBarber && selectedBarber._id === barber._id ? "selected" : "")
                }
                onClick={() => setSelectedBarber(barber)}
              >
                {barber.firstName} {barber.lastName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* שלב 2 */}
      {selectedBarber && (
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>בחר סוג שירות</h3>

          <div className="choice-grid">
            {services.map((service) => (
              <button
                key={service.name}
                className={
                  "choice " +
                  (selectedService && selectedService.name === service.name ? "selected" : "")
                }
                onClick={() => setSelectedService(service)}
              >
                {service.name}
                <div style={{ fontSize: 13, color: "#6b6b6b", marginTop: 4 }}>
                  {service.duration} דקות
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* שלב 3 */}
      {selectedService && (
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>בחר תאריך</h3>

          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ maxWidth: 260 }}
          />
        </div>
      )}

      {/* שלב 4 */}
      {selectedDate && (
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>בחר שעה</h3>

          {loadingSlots && <div className="empty">טוען שעות פנויות...</div>}

          {/* הסתעפות א של SUC-3 - אין שעות פנויות בתאריך שנבחר */}
          {!loadingSlots && freeSlots.length === 0 && (
            <div className="empty">
              אין שעות פנויות בתאריך זה
              <div style={{ fontSize: 14, marginTop: 8 }}>נסה לבחור תאריך אחר</div>
            </div>
          )}

          {!loadingSlots && freeSlots.length > 0 && (
            <div className="slot-grid">
              {freeSlots.map((slot) => (
                <button
                  key={slot}
                  className={"slot " + (selectedTime === slot ? "selected" : "")}
                  onClick={() => setSelectedTime(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* כפתור האישור */}
      {selectedTime && (
        <div className="card">
          <div style={{ marginBottom: 14, fontSize: 16, lineHeight: 1.9 }}>
            <strong>סיכום:</strong> {selectedService.name} אצל {selectedBarber.firstName}{" "}
            {selectedBarber.lastName}, בתאריך {selectedDate} בשעה {selectedTime}
          </div>

          <button className="btn btn-full" onClick={handleConfirm}>
            אישור הזמנת תור
          </button>
        </div>
      )}
    </div>
  );
}

export default BookAppointment;
