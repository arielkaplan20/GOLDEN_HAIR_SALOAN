// בדיקת הזדהות והרשאות
//
// חשוב: הבדיקות כאן רצות בצד השרת ולא בצד הלקוח.
// להסתיר כפתור במסך זה לא אבטחה - מי שירצה יוכל לפנות לכתובת ישירות.
// לכן כל נתיב שדורש הרשאה עובר דרך הפונקציות שבקובץ הזה.

const jwt = require("jsonwebtoken");

// בודק שהמשתמש מחובר, ושם את הפרטים שלו ב-req.user
function requireLogin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "צריך להתחבר כדי לבצע את הפעולה הזו" });
  }

  // הכותרת מגיעה בפורמט "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "צריך להתחבר כדי לבצע את הפעולה הזו" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // מכיל את id, role ו-firstName
    next();
  } catch (error) {
    return res.status(401).json({ message: "ההתחברות פגה, יש להתחבר מחדש" });
  }
}

// בודק שלמשתמש יש את התפקיד המתאים
// שימוש לדוגמה: router.get("/all", requireLogin, requireRole("admin"), ...)
function requireRole(role) {
  return function (req, res, next) {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "אין לך הרשאה לבצע את הפעולה הזו" });
    }
    next();
  };
}

module.exports = { requireLogin, requireRole };
