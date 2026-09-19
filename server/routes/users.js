// נתיבי המשתמשים: הרשמה, התחברות, פרופיל וניהול הרשאות
// מממש את SUC-1, SUC-2, SUC-8 ו-SUC-10

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireLogin, requireRole } = require("../middleware/auth");

const router = express.Router();

// כמה ניסיונות התחברות כושלים מותרים, ולכמה זמן החשבון ננעל
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 30;

// בדיקה פשוטה שכתובת המייל נראית תקינה
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================================
// SUC-1: הרשמה לאפליקציה
// ============================================================
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, address, birthDate, phone } = req.body;

    // בדיקה שכל שדות החובה מלאים
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "צריך למלא את כל השדות" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "כתובת המייל אינה תקינה" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "הסיסמה צריכה להיות באורך 6 תווים לפחות" });
    }

    // הסתעפות א של SUC-1 - הסיסמאות לא תואמות
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "הסיסמאות אינן תואמות" });
    }

    // בדיקה שהמייל לא רשום כבר
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "כתובת המייל הזו כבר רשומה במערכת" });
    }

    // הצפנת הסיסמה לפני השמירה
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      address: address || "",
      birthDate: birthDate || null,
      phone: phone || "",
      role: "customer", // כל מי שנרשם דרך האתר הוא לקוח
    });

    await newUser.save();

    res.status(201).json({ message: "ההרשמה הושלמה בהצלחה" });
  } catch (error) {
    console.log("שגיאה בהרשמה:", error.message);
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// SUC-2: התחברות לאפליקציה
// ============================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "צריך להזין מייל וסיסמה" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // שים לב: ההודעה זהה גם כשהמייל לא קיים וגם כשהסיסמה שגויה.
    // אם נגיד "המייל לא קיים", מישהו יוכל לגלות אילו מיילים רשומים אצלנו.
    if (!user) {
      return res.status(400).json({ message: "שם משתמש או סיסמה שגויים" });
    }

    // בדיקה אם החשבון נעול כרגע
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(403).json({
        message: "החשבון נעול זמנית בגלל ניסיונות התחברות כושלים. נסה שוב בעוד חצי שעה",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      // סופרים את הניסיון הכושל, ואם הגענו למקסימום נועלים
      user.failedAttempts = user.failedAttempts + 1;

      if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        user.failedAttempts = 0;
      }

      await user.save();
      return res.status(400).json({ message: "שם משתמש או סיסמה שגויים" });
    }

    // התחברות הצליחה - מאפסים את מונה הניסיונות
    user.failedAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    // יוצרים אסימון שמכיל את המזהה והתפקיד
    const token = jwt.sign(
      { id: user._id, role: user.role, firstName: user.firstName },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("שגיאה בהתחברות:", error.message);
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// SUC-8: צפייה ועדכון פרופיל אישי
// ============================================================
router.get("/profile", requireLogin, async (req, res) => {
  try {
    // מוציאים את הסיסמה מהתוצאה, אין שום סיבה לשלוח אותה ללקוח
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

router.put("/profile", requireLogin, async (req, res) => {
  try {
    const { firstName, lastName, address, phone, birthDate } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: "שם פרטי ושם משפחה הם שדות חובה" });
    }

    const user = await User.findById(req.user.id);
    user.firstName = firstName;
    user.lastName = lastName;
    user.address = address || "";
    user.phone = phone || "";
    if (birthDate) {
      user.birthDate = birthDate;
    }

    await user.save();

    res.json({ message: "הפרטים עודכנו בהצלחה" });
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// החלפת סיסמה
router.put("/password", requireLogin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "צריך למלא את שתי הסיסמאות" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "הסיסמה החדשה צריכה להיות באורך 6 תווים לפחות" });
    }

    const user = await User.findById(req.user.id);
    const isCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isCorrect) {
      return res.status(400).json({ message: "הסיסמה הנוכחית שגויה" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "הסיסמה הוחלפה בהצלחה" });
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// רשימת הספרים - כל לקוח צריך אותה כדי להזמין תור
// ============================================================
router.get("/barbers", requireLogin, async (req, res) => {
  try {
    const barbers = await User.find({ role: "barber" }).select("firstName lastName");
    res.json(barbers);
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// SUC-10: ניהול משתמשים והרשאות - למנהל בלבד
// ============================================================
router.get("/", requireLogin, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

router.put("/:id/role", requireLogin, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;

    if (!["customer", "barber", "admin"].includes(role)) {
      return res.status(400).json({ message: "התפקיד שנבחר אינו תקין" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "המשתמש לא נמצא" });
    }

    // מונעים מצב שבו המנהל מוריד לעצמו את ההרשאות ואז אין מנהל במערכת
    if (user._id.toString() === req.user.id && role !== "admin") {
      return res.status(400).json({ message: "אי אפשר להוריד לעצמך את הרשאת המנהל" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "ההרשאה עודכנה בהצלחה" });
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

module.exports = router;
