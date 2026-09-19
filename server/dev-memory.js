// ============================================================
// הרצת השרת עם מסד נתונים בזיכרון
//
// הרצה: npm run dev:memory
//
// הקובץ הזה מפעיל MongoDB זמני שרץ בתוך הזיכרון של המחשב,
// בלי שצריך להתקין MongoDB בכלל. זה שימושי כדי לבדוק את
// המערכת במהירות.
//
// שים לב: כל הנתונים נמחקים ברגע שסוגרים את השרת.
// לעבודה אמיתית צריך MongoDB אמיתי או MongoDB Atlas.
// ============================================================

const { MongoMemoryServer } = require("mongodb-memory-server");

async function start() {
  console.log("מפעיל מסד נתונים זמני בזיכרון...");

  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // מגדירים את הכתובת לפני שטוענים את שאר הקבצים,
  // כדי שהם יתחברו למסד הזמני
  process.env.MONGO_URI = uri;

  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "dev-only-secret-do-not-use-in-production";
  }

  console.log("מסד הנתונים הזמני פועל");
  console.log("");

  // מריצים את סקריפט ההזרעה כדי שיהיו נתונים להתחיל איתם
  const mongoose = require("mongoose");
  await mongoose.connect(uri);

  await createSeedData();

  await mongoose.disconnect();

  // ועכשיו מפעילים את השרת עצמו
  require("./server");
}

// יוצר את נתוני ההתחלה. זהה לסקריפט seed.js
async function createSeedData() {
  const bcrypt = require("bcryptjs");
  const User = require("./models/User");
  const WorkingHours = require("./models/WorkingHours");
  const Product = require("./models/Product");

  const salt = await bcrypt.genSalt(10);

  // מנהל ראשי
  await new User({
    firstName: "אריאל",
    lastName: "קפלן",
    email: "admin@goldenhair.co.il",
    password: await bcrypt.hash("admin123", salt),
    phone: "050-0000000",
    role: "admin",
  }).save();

  // ספרים
  const barbersData = [
    { firstName: "יוסי", lastName: "כהן", email: "yossi@goldenhair.co.il" },
    { firstName: "משה", lastName: "לוי", email: "moshe@goldenhair.co.il" },
    { firstName: "דני", lastName: "מזרחי", email: "dani@goldenhair.co.il" },
  ];

  for (let i = 0; i < barbersData.length; i++) {
    const data = barbersData[i];

    const barber = await new User({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: await bcrypt.hash("barber123", salt),
      phone: "052-100000" + i,
      role: "barber",
    }).save();

    for (let day = 0; day < 7; day++) {
      await new WorkingHours({
        barberId: barber._id,
        dayOfWeek: day,
        openTime: "09:00",
        closeTime: day === 5 ? "13:00" : "18:00",
        isClosed: day === 6,
      }).save();
    }
  }

  // לקוחות
  await new User({
    firstName: "אבי",
    lastName: "ישראלי",
    email: "avi@gmail.com",
    password: await bcrypt.hash("123456", salt),
    phone: "054-1234567",
    address: "רחוב הפרחים 5, תל אביב",
    role: "customer",
  }).save();

  // מוצרים
  const products = [
    { name: "מכונת תספורת מקצועית", description: "מכונה אלחוטית עם 8 מסרקים.", price: 349, stock: 12 },
    { name: "ג׳ל לשיער - אחיזה חזקה", description: "250 מ״ל, אחיזה חזקה לכל היום.", price: 39, stock: 45 },
    { name: "שמפו לשיער שמן", description: "400 מ״ל, מנקה לעומק בלי לייבש.", price: 55, stock: 30 },
    { name: "שמן זקן", description: "50 מ״ל, מרכך ומעניק ברק טבעי.", price: 69, stock: 25 },
    { name: "מברשת עיצוב", description: "מברשת עגולה לעיצוב ופן.", price: 35, stock: 0 },
  ];

  for (let i = 0; i < products.length; i++) {
    await new Product(products[i]).save();
  }

  console.log("===========================================");
  console.log("  נתוני התחלה נוצרו");
  console.log("===========================================");
  console.log("  מנהל:  admin@goldenhair.co.il / admin123");
  console.log("  ספר:   yossi@goldenhair.co.il / barber123");
  console.log("  לקוח:  avi@gmail.com / 123456");
  console.log("===========================================");
  console.log("");
}

start();
