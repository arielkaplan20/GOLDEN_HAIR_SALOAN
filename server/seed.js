// ============================================================
// סקריפט הזרעה - יוצר נתוני התחלה במסד הנתונים
//
// הרצה: npm run seed
//
// הסקריפט הזה עונה על שאלה שעלתה בספר הפרויקט:
// איך נוצר המנהל הראשי הראשון?
// התשובה: הוא נוצר כאן, ישירות במסד הנתונים, ולא דרך מסך ההרשמה.
// רק אחרי שהוא קיים הוא יכול להעניק הרשאות לשאר המשתמשים.
//
// שים לב: הסקריפט מוחק את כל הנתונים הקיימים לפני שהוא יוצר חדשים.
// ============================================================

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const WorkingHours = require("./models/WorkingHours");
const Product = require("./models/Product");
const Appointment = require("./models/Appointment");
const Order = require("./models/Order");

async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plain, salt);
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("התחברנו למסד הנתונים");

  // ניקוי כל הנתונים הקיימים
  await User.deleteMany({});
  await WorkingHours.deleteMany({});
  await Product.deleteMany({});
  await Appointment.deleteMany({});
  await Order.deleteMany({});
  console.log("הנתונים הישנים נמחקו");

  // ---------- המנהל הראשי ----------
  const admin = new User({
    firstName: "אריאל",
    lastName: "קפלן",
    email: "admin@goldenhair.co.il",
    password: await hashPassword("admin123"),
    phone: "050-0000000",
    address: "רחוב הראשי 1",
    role: "admin",
  });
  await admin.save();

  // ---------- שלושה ספרים ----------
  const barbersData = [
    { firstName: "יוסי", lastName: "כהן", email: "yossi@goldenhair.co.il" },
    { firstName: "משה", lastName: "לוי", email: "moshe@goldenhair.co.il" },
    { firstName: "דני", lastName: "מזרחי", email: "dani@goldenhair.co.il" },
  ];

  const barbers = [];

  for (let i = 0; i < barbersData.length; i++) {
    const data = barbersData[i];

    const barber = new User({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: await hashPassword("barber123"),
      phone: "052-100000" + i,
      role: "barber",
    });

    await barber.save();
    barbers.push(barber);

    // שעות עבודה לכל ספר: ראשון עד חמישי 09:00-18:00,
    // שישי 09:00-13:00, שבת סגור
    for (let day = 0; day < 7; day++) {
      let openTime = "09:00";
      let closeTime = "18:00";
      let isClosed = false;

      if (day === 5) {
        closeTime = "13:00"; // יום שישי קצר
      }

      if (day === 6) {
        isClosed = true; // שבת סגור
      }

      const hours = new WorkingHours({
        barberId: barber._id,
        dayOfWeek: day,
        openTime: openTime,
        closeTime: closeTime,
        isClosed: isClosed,
      });

      await hours.save();
    }
  }

  // ---------- שני לקוחות לדוגמה ----------
  const customer1 = new User({
    firstName: "אבי",
    lastName: "ישראלי",
    email: "avi@gmail.com",
    password: await hashPassword("123456"),
    phone: "054-1234567",
    address: "רחוב הפרחים 5, תל אביב",
    role: "customer",
  });
  await customer1.save();

  const customer2 = new User({
    firstName: "רון",
    lastName: "שגב",
    email: "ron@gmail.com",
    password: await hashPassword("123456"),
    phone: "053-7654321",
    address: "רחוב הזית 12, חולון",
    role: "customer",
  });
  await customer2.save();

  // ---------- מוצרים בחנות ----------
  const products = [
    {
      name: "מכונת תספורת מקצועית",
      description: "מכונת תספורת אלחוטית עם 8 מסרקים בגדלים שונים. סוללה לשעתיים עבודה רצופה.",
      price: 349,
      stock: 12,
    },
    {
      name: "ג׳ל לשיער - אחיזה חזקה",
      description: "ג׳ל בנפח 250 מ״ל, אחיזה חזקה לאורך כל היום ללא הכתמה.",
      price: 39,
      stock: 45,
    },
    {
      name: "שמפו לשיער שמן",
      description: "שמפו בנפח 400 מ״ל המותאם לשיער שמן. מנקה לעומק בלי לייבש.",
      price: 55,
      stock: 30,
    },
    {
      name: "מסרק עץ מקצועי",
      description: "מסרק עשוי עץ במבוק, מונע חשמל סטטי בשיער.",
      price: 29,
      stock: 60,
    },
    {
      name: "שמן זקן",
      description: "שמן טיפוח לזקן בנפח 50 מ״ל. מרכך את הזקן ומעניק ברק טבעי.",
      price: 69,
      stock: 25,
    },
    {
      name: "מכונת גילוח לזקן",
      description: "מכונה לעיצוב וקיצוץ זקן, עמידה במים, עם 5 הגדרות אורך.",
      price: 219,
      stock: 8,
    },
    {
      name: "ווקס לשיער - מראה מט",
      description: "ווקס בנפח 100 מ״ל למראה מט וטבעי. אחיזה בינונית.",
      price: 45,
      stock: 38,
    },
    {
      name: "מברשת עיצוב",
      description: "מברשת עגולה לעיצוב ופן, מתאימה לכל סוגי השיער.",
      price: 35,
      stock: 0,
    },
  ];

  for (let i = 0; i < products.length; i++) {
    const product = new Product(products[i]);
    await product.save();
  }

  // ---------- כמה תורים לדוגמה ----------
  // מוסיפים תורים למחר, כדי שיהיה מה לראות במסכים
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = tomorrow.getMonth() + 1;
  const day = tomorrow.getDate();
  const monthText = month < 10 ? "0" + month : "" + month;
  const dayText = day < 10 ? "0" + day : "" + day;
  const tomorrowText = year + "-" + monthText + "-" + dayText;

  // רק אם מחר לא שבת
  if (tomorrow.getDay() !== 6) {
    const appt1 = new Appointment({
      customerId: customer1._id,
      barberId: barbers[0]._id,
      date: tomorrowText,
      startTime: "09:30",
      duration: 30,
      serviceType: "תספורת",
    });
    await appt1.save();

    const appt2 = new Appointment({
      customerId: customer2._id,
      barberId: barbers[0]._id,
      date: tomorrowText,
      startTime: "11:00",
      duration: 45,
      serviceType: "תספורת וזקן",
    });
    await appt2.save();

    console.log("נוצרו 2 תורים לדוגמה בתאריך " + tomorrowText);
  }

  console.log("");
  console.log("===========================================");
  console.log("   הנתונים נוצרו בהצלחה");
  console.log("===========================================");
  console.log("");
  console.log("  מנהל ראשי:");
  console.log("    admin@goldenhair.co.il  /  admin123");
  console.log("");
  console.log("  ספרים:");
  console.log("    yossi@goldenhair.co.il  /  barber123");
  console.log("    moshe@goldenhair.co.il  /  barber123");
  console.log("    dani@goldenhair.co.il   /  barber123");
  console.log("");
  console.log("  לקוחות:");
  console.log("    avi@gmail.com  /  123456");
  console.log("    ron@gmail.com  /  123456");
  console.log("");
  console.log("===========================================");

  await mongoose.disconnect();
}

seed();
