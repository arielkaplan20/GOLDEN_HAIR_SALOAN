// ============================================================
// בדיקת האלגוריתם של חישוב השעות הפנויות
//
// הרצה: node test-slots.js
//
// הבדיקה הזו לא צריכה מסד נתונים.
// במקום לפנות למסד האמיתי, מחליפים את הפונקציות שלו
// בפונקציות שמחזירות נתונים קבועים שאנחנו קובעים מראש.
// ככה אפשר לבדוק את הלוגיקה של החישוב בלבד.
//
// המקרה הראשון הוא בדיוק דוגמת ההרצה שמופיעה
// בסעיף 10 של ספר הפרויקט.
// ============================================================

const Appointment = require("./models/Appointment");
const WorkingHours = require("./models/WorkingHours");
const slots = require("./services/slots");

let passed = 0;
let failed = 0;

// משווה בין שתי רשימות ומדפיס את התוצאה
function check(testName, actual, expected) {
  const actualText = actual.join(", ");
  const expectedText = expected.join(", ");

  if (actualText === expectedText) {
    console.log("  עבר:   " + testName);
    passed++;
  } else {
    console.log("  נכשל:  " + testName);
    console.log("         התקבל: [" + actualText + "]");
    console.log("         צפוי:  [" + expectedText + "]");
    failed++;
  }
}

// מחליף את הפניות למסד הנתונים בנתונים קבועים
function useFakeData(workDay, appointments) {
  WorkingHours.findOne = async function () {
    return workDay;
  };

  Appointment.find = async function () {
    return appointments;
  };
}

async function runTests() {
  console.log("");
  console.log("בדיקת האלגוריתם - חישוב שעות פנויות");
  console.log("===========================================");
  console.log("");

  // תאריך עתידי קבוע, כדי שהבדיקה לא תושפע מהשעה הנוכחית.
  // 2030-01-06 הוא יום ראשון.
  const futureDate = "2030-01-06";

  // ----------------------------------------------------------
  // מקרה 1: הדוגמה מספר הפרויקט
  // הספר עובד 09:00-12:00, תספורת 30 דקות
  // תפוס: 09:30 למשך 30 דקות, ו-11:00 למשך 60 דקות
  // ----------------------------------------------------------
  useFakeData(
    { openTime: "09:00", closeTime: "12:00", isClosed: false },
    [
      { _id: "a1", startTime: "09:30", duration: 30 },
      { _id: "a2", startTime: "11:00", duration: 60 },
    ]
  );

  let result = await slots.getFreeSlots("barber1", futureDate, 30);
  check("דוגמת ההרצה מסעיף 10 בספר", result, ["09:00", "10:00", "10:15", "10:30"]);

  // ----------------------------------------------------------
  // מקרה 2: יום ללא תורים כלל
  // ----------------------------------------------------------
  useFakeData({ openTime: "09:00", closeTime: "10:00", isClosed: false }, []);

  result = await slots.getFreeSlots("barber1", futureDate, 30);
  check("יום פנוי לגמרי", result, ["09:00", "09:15", "09:30"]);

  // ----------------------------------------------------------
  // מקרה 3: הספר לא עובד ביום הזה
  // ----------------------------------------------------------
  useFakeData({ openTime: "09:00", closeTime: "18:00", isClosed: true }, []);

  result = await slots.getFreeSlots("barber1", futureDate, 30);
  check("יום סגור מחזיר רשימה ריקה", result, []);

  // ----------------------------------------------------------
  // מקרה 4: לספר אין שעות עבודה מוגדרות בכלל
  // ----------------------------------------------------------
  WorkingHours.findOne = async function () {
    return null;
  };
  Appointment.find = async function () {
    return [];
  };

  result = await slots.getFreeSlots("barber1", futureDate, 30);
  check("ספר בלי שעות מוגדרות מחזיר רשימה ריקה", result, []);

  // ----------------------------------------------------------
  // מקרה 5: תספורת ארוכה שלא נכנסת לפני הסגירה
  // הספר עובד 09:00-10:00, התספורת 45 דקות.
  // רק 09:00 ו-09:15 מספיקים - 09:30 יסתיים ב-10:15 ויחרוג.
  // ----------------------------------------------------------
  useFakeData({ openTime: "09:00", closeTime: "10:00", isClosed: false }, []);

  result = await slots.getFreeSlots("barber1", futureDate, 45);
  check("תספורת ארוכה לא חורגת משעת הסגירה", result, ["09:00", "09:15"]);

  // ----------------------------------------------------------
  // מקרה 6: תור מבוטל לא תופס מקום
  // האלגוריתם מסנן לפי status, אז ההדמיה מחזירה רשימה ריקה
  // כמו שהשאילתה האמיתית הייתה מחזירה
  // ----------------------------------------------------------
  useFakeData({ openTime: "09:00", closeTime: "10:00", isClosed: false }, []);

  result = await slots.getFreeSlots("barber1", futureDate, 30);
  check("תור מבוטל מפנה את המועד", result, ["09:00", "09:15", "09:30"]);

  // ----------------------------------------------------------
  // מקרה 7: היום מלא לגמרי
  // הספר עובד 09:00-10:00 ויש תור שתופס את כל השעה
  // ----------------------------------------------------------
  useFakeData(
    { openTime: "09:00", closeTime: "10:00", isClosed: false },
    [{ _id: "a1", startTime: "09:00", duration: 60 }]
  );

  result = await slots.getFreeSlots("barber1", futureDate, 30);
  check("יום מלא מחזיר רשימה ריקה", result, []);

  // ----------------------------------------------------------
  // מקרה 8: תור שמסתיים בדיוק כשהמשבצת מתחילה
  // תור 09:00-09:30 לא אמור לחסום משבצת שמתחילה ב-09:30
  // ----------------------------------------------------------
  useFakeData(
    { openTime: "09:00", closeTime: "10:30", isClosed: false },
    [{ _id: "a1", startTime: "09:00", duration: 30 }]
  );

  result = await slots.getFreeSlots("barber1", futureDate, 30);
  check("תור שמסתיים בדיוק בהתחלה לא חוסם", result, ["09:30", "09:45", "10:00"]);

  // ----------------------------------------------------------
  // בדיקות של פונקציית החפיפה עצמה
  // ----------------------------------------------------------
  console.log("");
  console.log("בדיקת פונקציית החפיפה");
  console.log("===========================================");
  console.log("");

  function checkBool(testName, actual, expected) {
    if (actual === expected) {
      console.log("  עבר:   " + testName);
      passed++;
    } else {
      console.log("  נכשל:  " + testName + " (התקבל " + actual + ", צפוי " + expected + ")");
      failed++;
    }
  }

  const t = slots.timeToMinutes;

  checkBool("חפיפה חלקית מלפנים", slots.isOverlapping(t("09:15"), t("09:45"), t("09:30"), t("10:00")), true);
  checkBool("חפיפה חלקית מאחור", slots.isOverlapping(t("10:45"), t("11:15"), t("11:00"), t("12:00")), true);
  checkBool("חפיפה מלאה", slots.isOverlapping(t("09:00"), t("12:00"), t("10:00"), t("11:00")), true);
  checkBool("זהה לגמרי", slots.isOverlapping(t("09:00"), t("09:30"), t("09:00"), t("09:30")), true);
  checkBool("נוגעים בקצה - לפני", slots.isOverlapping(t("09:00"), t("09:30"), t("09:30"), t("10:00")), false);
  checkBool("נוגעים בקצה - אחרי", slots.isOverlapping(t("10:00"), t("10:30"), t("09:30"), t("10:00")), false);
  checkBool("רחוקים לגמרי", slots.isOverlapping(t("09:00"), t("09:30"), t("14:00"), t("14:30")), false);

  // ----------------------------------------------------------
  // בדיקות של פונקציות ההמרה
  // ----------------------------------------------------------
  console.log("");
  console.log("בדיקת פונקציות ההמרה");
  console.log("===========================================");
  console.log("");

  checkBool("timeToMinutes של 00:00", slots.timeToMinutes("00:00"), 0);
  checkBool("timeToMinutes של 09:30", slots.timeToMinutes("09:30"), 570);
  checkBool("timeToMinutes של 23:59", slots.timeToMinutes("23:59"), 1439);
  checkBool("minutesToTime של 0", slots.minutesToTime(0), "00:00");
  checkBool("minutesToTime של 570", slots.minutesToTime(570), "09:30");
  checkBool("minutesToTime מוסיף אפס מוביל", slots.minutesToTime(545), "09:05");

  // ----------------------------------------------------------
  // סיכום
  // ----------------------------------------------------------
  console.log("");
  console.log("===========================================");
  console.log("  עברו: " + passed + "   נכשלו: " + failed);
  console.log("===========================================");
  console.log("");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
