// מסך ההתחברות - SUC-2

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { post, saveLogin } from "../api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("צריך להזין מייל וסיסמה");
      return;
    }

    setLoading(true);

    try {
      const data = await post("/users/login", { email: email, password: password });

      saveLogin(data.token, data.user);

      // טוענים מחדש את הדף כדי שהסרגל העליון יתעדכן לפי התפקיד
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">GOLDEN HAIR SALON</div>
        <div className="auth-subtitle">כניסה לחשבון שלך</div>

        {error && <div className="message error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>כתובת מייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-row">
            <label>סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="הסיסמה שלך"
            />
          </div>

          <button type="submit" className="btn btn-full" disabled={loading}>
            {loading ? "מתחבר..." : "כניסה"}
          </button>
        </form>

        <div className="auth-link">
          עוד אין לך חשבון? <Link to="/register">הירשם כאן</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
