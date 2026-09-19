// ניהול משתמשים והרשאות - SUC-10

import { useState, useEffect } from "react";
import { get, put } from "../api";

const ROLE_NAMES = {
  customer: "לקוח",
  barber: "נותן שירות",
  admin: "מנהל ראשי",
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // המשתמש שנמצא כרגע בחלון אישור שינוי ההרשאה
  const [confirming, setConfirming] = useState(null);
  const [newRole, setNewRole] = useState("");

  async function loadUsers() {
    try {
      const data = await get("/users");
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // צעד 4 של SUC-10 - הצגת חלון אישור לפני השינוי
  function startRoleChange(user, role) {
    if (role === user.role) {
      return;
    }

    setConfirming(user);
    setNewRole(role);
    setError("");
    setSuccess("");
  }

  async function confirmRoleChange() {
    try {
      const data = await put("/users/" + confirming._id + "/role", { role: newRole });

      setSuccess(data.message);
      setConfirming(null);

      await loadUsers();
    } catch (err) {
      setError(err.message);
      setConfirming(null);
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
      <h1 className="page-title">ניהול משתמשים</h1>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      {/* חלון אישור שינוי ההרשאה */}
      {confirming && (
        <div className="card" style={{ borderInlineStart: "4px solid #c9a227" }}>
          <h3 style={{ marginBottom: 10 }}>אישור שינוי הרשאה</h3>
          <p style={{ marginBottom: 16 }}>
            האם לשנות את ההרשאה של {confirming.firstName} {confirming.lastName} מ־
            <strong>{ROLE_NAMES[confirming.role]}</strong> ל־
            <strong>{ROLE_NAMES[newRole]}</strong>?
          </p>

          <div className="actions">
            <button className="btn" onClick={confirmRoleChange}>
              כן, שנה הרשאה
            </button>
            <button className="btn-light" onClick={() => setConfirming(null)}>
              לא
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>שם</th>
                <th>מייל</th>
                <th>טלפון</th>
                <th>הרשאה נוכחית</th>
                <th>שינוי הרשאה</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td dir="ltr" style={{ textAlign: "right" }}>
                    {user.email}
                  </td>
                  <td dir="ltr" style={{ textAlign: "right" }}>
                    {user.phone}
                  </td>
                  <td>
                    <span className={"badge " + (user.role === "admin" ? "gold" : "")}>
                      {ROLE_NAMES[user.role]}
                    </span>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => startRoleChange(user, e.target.value)}
                      style={{ maxWidth: 150 }}
                    >
                      <option value="customer">לקוח</option>
                      <option value="barber">נותן שירות</option>
                      <option value="admin">מנהל ראשי</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
