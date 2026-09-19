// מסך הפרופיל האישי - SUC-8
// זמין לכל סוגי המשתמשים

import { useState, useEffect } from "react";
import { get, put } from "../api";

function Profile() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phone: "",
    birthDate: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await get("/users/profile");

        setForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          address: user.address || "",
          phone: user.phone || "",
          // התאריך מגיע מהשרת בפורמט מלא, וצריך רק את החלק של התאריך
          birthDate: user.birthDate ? user.birthDate.split("T")[0] : "",
        });
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function updatePasswordField(event) {
    setPasswordForm({ ...passwordForm, [event.target.name]: event.target.value });
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = await put("/users/profile", form);
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = await put("/users/password", passwordForm);
      setSuccess(data.message);
      setPasswordForm({ currentPassword: "", newPassword: "" });
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
      <h1 className="page-title">הפרופיל שלי</h1>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>פרטים אישיים</h3>

        <form onSubmit={handleSaveProfile}>
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
            <label>כתובת מייל</label>
            <input value={form.email} disabled />
            <div style={{ fontSize: 13, color: "#6b6b6b", marginTop: 5 }}>
              כתובת המייל משמשת להתחברות ולכן אי אפשר לשנות אותה
            </div>
          </div>

          <div className="form-row">
            <label>כתובת מגורים</label>
            <input name="address" value={form.address} onChange={updateField} />
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label>טלפון</label>
              <input name="phone" value={form.phone} onChange={updateField} />
            </div>

            <div className="form-row">
              <label>תאריך לידה</label>
              <input
                type="date"
                name="birthDate"
                value={form.birthDate}
                onChange={updateField}
              />
            </div>
          </div>

          <button type="submit" className="btn">
            שמירת עדכון
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>החלפת סיסמה</h3>

        <form onSubmit={handleChangePassword}>
          <div className="form-grid">
            <div className="form-row">
              <label>סיסמה נוכחית</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={updatePasswordField}
              />
            </div>

            <div className="form-row">
              <label>סיסמה חדשה</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={updatePasswordField}
              />
            </div>
          </div>

          <button type="submit" className="btn-dark">
            החלף סיסמה
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
