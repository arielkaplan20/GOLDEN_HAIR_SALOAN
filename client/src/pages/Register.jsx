// מסך ההרשמה - SUC-1

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { post } from "../api";

function Register() {
  const navigate = useNavigate();

  // מחזיקים את כל השדות באובייקט אחד במקום ב-8 משתנים נפרדים
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    birthDate: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // פונקציה אחת שמעדכנת כל שדה, לפי השם שלו
  function updateField(event) {
    const name = event.target.name;
    const value = event.target.value;

    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // בדיקות בצד הלקוח, כדי לתת תגובה מהירה למשתמש.
    // השרת בודק את אותן בדיקות שוב, כי בדיקה כאן אפשר לעקוף.

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("צריך למלא את כל שדות החובה");
      return;
    }

    if (form.password.length < 6) {
      setError("הסיסמה צריכה להיות באורך 6 תווים לפחות");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }

    setLoading(true);

    try {
      await post("/users/register", form);

      setSuccess("ההרשמה הושלמה בהצלחה, מעבירים אותך לדף הכניסה");

      // מחכים רגע כדי שהמשתמש יספיק לקרוא את ההודעה
      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">GOLDEN HAIR SALON</div>
        <div className="auth-subtitle">הרשמה למערכת</div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-row">
              <label>שם פרטי *</label>
              <input name="firstName" value={form.firstName} onChange={updateField} />
            </div>

            <div className="form-row">
              <label>שם משפחה *</label>
              <input name="lastName" value={form.lastName} onChange={updateField} />
            </div>
          </div>

          <div className="form-row">
            <label>כתובת מייל *</label>
            <input type="email" name="email" value={form.email} onChange={updateField} />
          </div>

          <div className="form-row">
            <label>כתובת מגורים</label>
            <input name="address" value={form.address} onChange={updateField} />
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label>תאריך לידה</label>
              <input type="date" name="birthDate" value={form.birthDate} onChange={updateField} />
            </div>

            <div className="form-row">
              <label>טלפון</label>
              <input name="phone" value={form.phone} onChange={updateField} />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label>סיסמה *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
              />
            </div>

            <div className="form-row">
              <label>אימות סיסמה *</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={updateField}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-full" disabled={loading}>
            {loading ? "נרשם..." : "סיום הרשמה"}
          </button>
        </form>

        <div className="auth-link">
          כבר יש לך חשבון? <Link to="/login">התחבר כאן</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
