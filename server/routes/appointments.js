// נתיבי התורים: הזמנה, צפייה, שינוי וביטול
// מממש את SUC-3, SUC-4, SUC-5, SUC-6 ו-SUC-11

const express = require("express");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { requireLogin, requireRole } = require("../middleware/auth");
const slots = require("../services/slots");

const router = express.Router();

// סוגי התספורות שהמספרה מציעה, וכמה דקות כל אחת לוקחת
const SERVICES = {
  "תספורת": 30,
  "תספורת וזקן": 45,
  "זקן בלבד": 15,
  "תספורת ילדים": 20,
};

// ============================================================
// SUC-3 שלב 3: הצגת השעות הפנויות
// כאן נמצא המרכיב האלגוריתמי של הפרויקט
// ============================================================
router.get("/free-slots", requireLogin, async (req, res) => {
  try {
    const { barberId, date, serviceType } = req.query;

    if (!barberId || !date) {
      return res.status(400).json({ message: "צריך לבחור ספר ותאריך" });
    }

    const duration = SERVICES[serviceType] || 30;

    const freeSlots = await slots.getFreeSlots(barberId, date, duration);

    res.json({ slots: freeSlots, duration: duration });
  } catch (error) {
    console.log("שגיאה בחישוב שעות פנויות:", error.message);
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// רשימת סוגי התספורות למסך ההזמנה
router.get("/services", requireLogin, (req, res) => {
  const list = Object.keys(SERVICES).map((name) => {
    return { name: name, duration: SERVICES[name] };
  });
  res.json(list);
});

// ============================================================
// SUC-3: הזמנת תור
// ============================================================
router.post("/", requireLogin, async (req, res) => {
  try {
    const { barberId, date, startTime, serviceType } = req.body;

    if (!barberId || !date || !startTime) {
      return res.status(400).json({ message: "צריך לבחור ספר, תאריך ושעה" });
    }

    const duration = SERVICES[serviceType] || 30;

    // בדיקה שהספר באמת קיים ושהוא באמת ספר
    const barber = await User.findById(barberId);
    if (!barber || barber.role !== "barber") {
      return res.status(400).json({ message: "נותן השירות שנבחר אינו קיים" });
    }

    // אי אפשר להזמין תור בתאריך שכבר עבר
    if (date < slots.formatDate(new Date())) {
      return res.status(400).json({ message: "אי אפשר להזמין תור בתאריך שעבר" });
    }

    // הבדיקה החוזרת - בדיוק לפני השמירה.
    // בין הרגע שהלקוח ראה את השעות הפנויות לרגע הזה,
    // לקוח אחר יכול היה לתפוס את אותה שעה.
    const available = await slots.isSlotAvailable(barberId, date, startTime, duration);

    if (!available) {
      return res.status(409).json({
        message: "השעה הזו כבר נתפסה, אנא בחר שעה אחרת",
      });
    }

    const newAppointment = new Appointment({
      customerId: req.user.id,
      barberId: barberId,
      date: date,
      startTime: startTime,
      duration: duration,
      serviceType: serviceType || "תספורת",
      status: "scheduled",
    });

    await newAppointment.save();

    res.status(201).json({
      message: "התור נקבע בהצלחה",
      appointment: newAppointment,
    });
  } catch (error) {
    console.log("שגיאה בהזמנת תור:", error.message);
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// SUC-4: צפייה בתורים הקיימים של הלקוח
// ============================================================
router.get("/my", requireLogin, async (req, res) => {
  try {
    const today = slots.formatDate(new Date());

    const appointments = await Appointment.find({
      customerId: req.user.id,
      status: { $ne: "cancelled" },
      date: { $gte: today }, // רק תורים עתידיים
    })
      .populate("barberId", "firstName lastName")
      .sort({ date: 1, startTime: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// SUC-5: שינוי תור
// ============================================================
router.put("/:id", requireLogin, async (req, res) => {
  try {
    const { date, startTime } = req.body;

    if (!date || !startTime) {
      return res.status(400).json({ message: "צריך לבחור תאריך ושעה חדשים" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "התור לא נמצא" });
    }

    // בדיקה שהתור באמת שייך למשתמש שמבקש לשנות אותו
    if (appointment.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "אין לך הרשאה לשנות את התור הזה" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ message: "התור הזה כבר בוטל" });
    }

    if (date < slots.formatDate(new Date())) {
      return res.status(400).json({ message: "אי אפשר להעביר תור לתאריך שעבר" });
    }

    // בודקים שהמועד החדש פנוי.
    // מעבירים את מזהה התור כדי שהוא לא ייבדק מול עצמו.
    const available = await slots.isSlotAvailable(
      appointment.barberId,
      date,
      startTime,
      appointment.duration,
      appointment._id
    );

    if (!available) {
      return res.status(409).json({ message: "השעה הזו כבר נתפסה, אנא בחר שעה אחרת" });
    }

    // מעדכנים את התור. המועד הישן מתפנה אוטומטית,
    // כי הוא פשוט כבר לא רשום בתור הזה ואף תור אחר לא תופס אותו.
    appointment.date = date;
    appointment.startTime = startTime;
    appointment.status = "rescheduled";

    await appointment.save();

    res.json({ message: "התור שונה בהצלחה", appointment: appointment });
  } catch (error) {
    console.log("שגיאה בשינוי תור:", error.message);
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// SUC-6: ביטול תור
// ============================================================
router.delete("/:id", requireLogin, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "התור לא נמצא" });
    }

    // לקוח יכול לבטל רק את התורים שלו. מנהל יכול לבטל כל תור.
    const isOwner = appointment.customerId.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "אין לך הרשאה לבטל את התור הזה" });
    }

    // מסמנים כמבוטל במקום למחוק, כדי שיישאר תיעוד במערכת.
    // חישוב השעות הפנויות מתעלם מתורים מבוטלים, אז המועד מתפנה מיד.
    appointment.status = "cancelled";
    await appointment.save();

    res.json({ message: "התור בוטל בהצלחה" });
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// SUC-9: יומן התורים של הספר - רק התורים שנקבעו אליו
// ============================================================
router.get("/barber-calendar", requireLogin, requireRole("barber"), async (req, res) => {
  try {
    const today = slots.formatDate(new Date());

    const appointments = await Appointment.find({
      barberId: req.user.id, // מזהה הספר נלקח מהאסימון, לא מהבקשה
      status: { $ne: "cancelled" },
      date: { $gte: today },
    })
      .populate("customerId", "firstName lastName phone")
      .sort({ date: 1, startTime: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// SUC-11: ניהול כל התורים במערכת - למנהל בלבד
// ============================================================
router.get("/all", requireLogin, requireRole("admin"), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("customerId", "firstName lastName phone")
      .populate("barberId", "firstName lastName")
      .sort({ date: -1, startTime: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

module.exports = router;
