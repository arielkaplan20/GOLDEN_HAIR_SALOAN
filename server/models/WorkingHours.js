// מודל שעות העבודה של נותן שירות
// לכל ספר יש שורה אחת לכל יום בשבוע (0 = ראשון, 6 = שבת)

const mongoose = require("mongoose");

const workingHoursSchema = new mongoose.Schema({
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },

  openTime: { type: String, default: "09:00" },
  closeTime: { type: String, default: "18:00" },

  // אם true - הספר לא עובד ביום הזה בכלל
  isClosed: { type: Boolean, default: false },
});

module.exports = mongoose.model("WorkingHours", workingHoursSchema);
