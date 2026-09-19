// נתיבי לוח העבודה של הספר - צפייה ועריכה של ימי ושעות העבודה
// מממש את החלק השני של SUC-9

const express = require("express");
const WorkingHours = require("../models/WorkingHours");
const { requireLogin, requireRole } = require("../middleware/auth");
const slots = require("../services/slots");

const router = express.Router();

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

// ============================================================
// שליפת שעות העבודה של הספר המחובר
// ============================================================
router.get("/my", requireLogin, requireRole("barber"), async (req, res) => {
  try {
    const hours = await WorkingHours.find({ barberId: req.user.id }).sort({ dayOfWeek: 1 });

    // אם לספר עוד אין שעות מוגדרות, מחזירים שבוע ריק כדי שיהיה מה להציג במסך
    if (hours.length === 0) {
      const emptyWeek = [];
      for (let day = 0; day < 7; day++) {
        emptyWeek.push({
          dayOfWeek: day,
          dayName: DAY_NAMES[day],
          openTime: "09:00",
          closeTime: "18:00",
          isClosed: true,
        });
      }
      return res.json(emptyWeek);
    }

    // מוסיפים את שם היום בעברית כדי שהמסך לא יצטרך לתרגם מספרים
    const result = hours.map((h) => {
      return {
        dayOfWeek: h.dayOfWeek,
        dayName: DAY_NAMES[h.dayOfWeek],
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// עדכון שעות העבודה
// מקבל את כל שבעת הימים בבת אחת
// ============================================================
router.put("/my", requireLogin, requireRole("barber"), async (req, res) => {
  try {
    const { days } = req.body;

    if (!days || days.length !== 7) {
      return res.status(400).json({ message: "צריך לשלוח את כל שבעת ימי השבוע" });
    }

    // בדיקת תקינות לפני שמעדכנים משהו,
    // כדי שלא נשמור חצי מהימים ואז ניתקל בשגיאה
    for (let i = 0; i < days.length; i++) {
      const day = days[i];

      if (day.isClosed) {
        continue; // ביום סגור לא בודקים שעות
      }

      const open = slots.timeToMinutes(day.openTime);
      const close = slots.timeToMinutes(day.closeTime);

      if (isNaN(open) || isNaN(close)) {
        return res.status(400).json({
          message: "השעות ביום " + DAY_NAMES[i] + " אינן תקינות",
        });
      }

      if (close <= open) {
        return res.status(400).json({
          message: "ביום " + DAY_NAMES[i] + " שעת הסגירה צריכה להיות אחרי שעת הפתיחה",
        });
      }
    }

    // עכשיו שהכל תקין אפשר לשמור
    for (let i = 0; i < days.length; i++) {
      const day = days[i];

      await WorkingHours.findOneAndUpdate(
        { barberId: req.user.id, dayOfWeek: i },
        {
          barberId: req.user.id,
          dayOfWeek: i,
          openTime: day.openTime,
          closeTime: day.closeTime,
          isClosed: day.isClosed,
        },
        { upsert: true } // אם השורה לא קיימת, יוצרים אותה
      );
    }

    res.json({ message: "שעות העבודה עודכנו בהצלחה" });
  } catch (error) {
    console.log("שגיאה בעדכון שעות עבודה:", error.message);
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

module.exports = router;
