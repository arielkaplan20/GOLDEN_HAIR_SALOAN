// ============================================================
// GOLDEN HAIR SALON - קובץ השרת הראשי
//
// כאן מחברים את כל החלקים: מסד הנתונים, הנתיבים והגדרות השרת.
// הרצה: npm start
// ============================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectToDatabase = require("./db");

// הנתיבים
const usersRoutes = require("./routes/users");
const appointmentsRoutes = require("./routes/appointments");
const scheduleRoutes = require("./routes/schedule");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

// מאפשר לאתר בצד הלקוח לפנות לשרת
app.use(cors());

// מאפשר לקרוא את גוף הבקשה כ-JSON
app.use(express.json());

// חיבור הנתיבים
app.use("/api/users", usersRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);

// נתיב בדיקה - מאפשר לוודא שהשרת חי
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "השרת של GOLDEN HAIR SALON פועל" });
});

// כל נתיב שלא קיים
app.use((req, res) => {
  res.status(404).json({ message: "הכתובת המבוקשת לא נמצאה" });
});

// הפעלת השרת רק אחרי שהתחברנו למסד הנתונים
async function startServer() {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log("השרת פועל על פורט " + PORT);
    console.log("כתובת: http://localhost:" + PORT);
  });
}

startServer();
