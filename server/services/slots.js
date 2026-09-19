// ============================================================
// חישוב השעות הפנויות של ספר בתאריך נתון
//
// זה המרכיב האלגוריתמי של הפרויקט (סעיף 10 בספר הפרויקט).
// הקובץ הזה מממש בדיוק את האלגוריתם שמתואר שם.
//
// הרעיון: בונים את כל משבצות הזמן האפשריות ביום העבודה,
// ואז מסירים מהן אחת-אחת את המשבצות שלא פנויות.
// ============================================================

const Appointment = require("../models/Appointment");
const WorkingHours = require("../models/WorkingHours");

// כל כמה דקות מתחילה משבצת חדשה
const SLOT_STEP = 15;

// ------------------------------------------------------------
// פונקציות עזר להמרת שעות
// קל יותר לעבוד עם מספרים מאשר עם מחרוזות של שעות,
// אז ממירים "10:30" ל-630 (מספר הדקות מתחילת היום) ולהפך.
// ------------------------------------------------------------

function timeToMinutes(time) {
  const parts = time.split(":");
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // מוסיפים אפס מוביל כדי שתמיד יהיה בפורמט "09:05"
  const hoursText = hours < 10 ? "0" + hours : "" + hours;
  const minutesText = minutes < 10 ? "0" + minutes : "" + minutes;

  return hoursText + ":" + minutesText;
}

// ------------------------------------------------------------
// בדיקת חפיפה בין שני טווחי זמן
//
// שני טווחים חופפים אם ההתחלה של הראשון מוקדמת מהסיום של השני,
// וגם ההתחלה של השני מוקדמת מהסיום של הראשון.
//
// שים לב שהסימן הוא < ולא <= , וזה חשוב:
// תור שמסתיים ב-10:00 ותור שמתחיל ב-10:00 לא חופפים.
// ------------------------------------------------------------

function isOverlapping(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

// ------------------------------------------------------------
// הפונקציה הראשית
//
// מקבלת: מזהה הספר, תאריך בפורמט "YYYY-MM-DD", ומשך התספורת בדקות
// מחזירה: מערך של שעות פנויות, למשל ["09:00", "10:00", "10:15"]
// ------------------------------------------------------------

async function getFreeSlots(barberId, date, serviceDuration) {
  // ---- שלב 2: שליפת שעות העבודה של הספר ליום הזה ----
  const dayOfWeek = new Date(date + "T00:00:00").getDay();

  const workDay = await WorkingHours.findOne({
    barberId: barberId,
    dayOfWeek: dayOfWeek,
  });

  // ---- שלב 3: אם הספר לא עובד היום, אין מה לחשב ----
  if (!workDay || workDay.isClosed) {
    return [];
  }

  const openMinutes = timeToMinutes(workDay.openTime);
  const closeMinutes = timeToMinutes(workDay.closeTime);

  // ---- שלב 4: בניית כל משבצות הזמן האפשריות ----
  const allSlots = [];
  let current = openMinutes;

  while (current < closeMinutes) {
    allSlots.push(current);
    current = current + SLOT_STEP;
  }

  // ---- שלב 5: שליפת התורים שכבר נקבעו לספר באותו תאריך ----
  // מתעלמים מתורים שבוטלו, כי המועד שלהם התפנה
  const takenAppointments = await Appointment.find({
    barberId: barberId,
    date: date,
    status: { $ne: "cancelled" },
  });

  // כמה דקות עברו מתחילת היום ברגע זה - נחוץ לשלב 8
  const now = new Date();
  const todayText = formatDate(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // ---- שלבים 6 עד 8: סינון המשבצות ----
  const freeSlots = [];

  for (let i = 0; i < allSlots.length; i++) {
    const slotStart = allSlots[i];
    const slotEnd = slotStart + serviceDuration;

    let available = true;

    // שלב 6: בדיקה מול כל תור קיים
    for (let j = 0; j < takenAppointments.length; j++) {
      const appointment = takenAppointments[j];
      const apptStart = timeToMinutes(appointment.startTime);
      const apptEnd = apptStart + appointment.duration;

      if (isOverlapping(slotStart, slotEnd, apptStart, apptEnd)) {
        available = false;
        break; // מצאנו התנגשות, אין טעם להמשיך לבדוק
      }
    }

    // שלב 7: התספורת לא יכולה לחרוג משעת הסגירה
    if (slotEnd > closeMinutes) {
      available = false;
    }

    // שלב 8: אם מדובר בהיום, אין טעם להציג שעות שכבר עברו
    if (date === todayText && slotStart <= nowMinutes) {
      available = false;
    }

    if (available) {
      freeSlots.push(minutesToTime(slotStart));
    }
  }

  // ---- שלב 9: החזרת הרשימה ----
  return freeSlots;
}

// ------------------------------------------------------------
// בדיקה חוזרת לפני שמירת התור
//
// למה זה צריך להיות פונקציה נפרדת?
// בין הרגע שהלקוח ראה את רשימת השעות הפנויות לרגע שהוא לחץ אישור,
// לקוח אחר יכול היה לתפוס את אותה שעה.
// לכן בודקים שוב, ממש לפני השמירה, מול מצב מסד הנתונים באותו רגע.
// ------------------------------------------------------------

async function isSlotAvailable(barberId, date, startTime, duration, ignoreAppointmentId) {
  const dayOfWeek = new Date(date + "T00:00:00").getDay();

  const workDay = await WorkingHours.findOne({ barberId: barberId, dayOfWeek: dayOfWeek });

  if (!workDay || workDay.isClosed) {
    return false;
  }

  const slotStart = timeToMinutes(startTime);
  const slotEnd = slotStart + duration;

  // בדיקה שהתור נכנס בתוך שעות העבודה
  if (slotStart < timeToMinutes(workDay.openTime)) {
    return false;
  }
  if (slotEnd > timeToMinutes(workDay.closeTime)) {
    return false;
  }

  const takenAppointments = await Appointment.find({
    barberId: barberId,
    date: date,
    status: { $ne: "cancelled" },
  });

  for (let i = 0; i < takenAppointments.length; i++) {
    const appointment = takenAppointments[i];

    // כשמשנים תור קיים, אסור לבדוק אותו מול עצמו
    if (ignoreAppointmentId && appointment._id.toString() === ignoreAppointmentId.toString()) {
      continue;
    }

    const apptStart = timeToMinutes(appointment.startTime);
    const apptEnd = apptStart + appointment.duration;

    if (isOverlapping(slotStart, slotEnd, apptStart, apptEnd)) {
      return false;
    }
  }

  return true;
}

// מחזיר תאריך בפורמט "YYYY-MM-DD"
function formatDate(dateObject) {
  const year = dateObject.getFullYear();
  const month = dateObject.getMonth() + 1;
  const day = dateObject.getDate();

  const monthText = month < 10 ? "0" + month : "" + month;
  const dayText = day < 10 ? "0" + day : "" + day;

  return year + "-" + monthText + "-" + dayText;
}

module.exports = {
  getFreeSlots,
  isSlotAvailable,
  isOverlapping,
  timeToMinutes,
  minutesToTime,
  formatDate,
};
