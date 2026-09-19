// מודל המשתמש
// יש שלושה סוגי משתמשים במערכת והם מובחנים בשדה role:
// customer = לקוח, barber = נותן שירות (ספר), admin = מנהל ראשי

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },

  // הסיסמה נשמרת מוצפנת בלבד (bcrypt), אף פעם לא כטקסט רגיל
  password: { type: String, required: true },

  address: { type: String, default: "" },
  birthDate: { type: Date },
  phone: { type: String, default: "" },

  role: {
    type: String,
    enum: ["customer", "barber", "admin"],
    default: "customer",
  },

  // שני השדות הבאים משמשים לנעילת החשבון אחרי 5 ניסיונות התחברות כושלים
  failedAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
