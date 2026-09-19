// מודל התור
//
// הערה על התאריך והשעה:
// שמרתי אותם כמחרוזות ולא כאובייקט Date, בכוונה.
// התאריך בפורמט "YYYY-MM-DD" והשעה בפורמט "HH:MM".
// הסיבה היא שתור במספרה הוא תמיד בשעון המקומי של המספרה,
// ואם שומרים Date מלא נכנסים לבעיות של אזורי זמן שמסבכות את החישובים.

const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  date: { type: String, required: true },       // "2026-09-20"
  startTime: { type: String, required: true },  // "10:30"
  duration: { type: Number, required: true },   // משך התספורת בדקות

  serviceType: { type: String, default: "תספורת" },

  status: {
    type: String,
    enum: ["scheduled", "rescheduled", "cancelled", "completed", "noshow"],
    default: "scheduled",
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
