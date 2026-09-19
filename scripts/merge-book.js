// ============================================================
// בניית ספר הפרויקט המאוחד
//
// הרצה: node scripts/merge-book.js
//
// הכלל המנחה, לפי בקשת אריאל:
//
//   הספר המקורי לא משתנה בכלל. אף תו.
//   גם סעיפים שנשארו ריקים - נשארים ריקים.
//
//   ההוספה היחידה שלפני הטקסט המקורי היא עמודי הפתיחה
//   (פרטי הסטודנט והמנחה), כי מה"ט דורשים אותם בתחילת הספר.
//
//   כל שאר התוספות נכנסות אחרי העמוד האחרון של הספר המקורי.
//
// הגישה הטכנית: עריכת ה-XML שבתוך קובץ ה-Word.
// כך כל העיצוב, הטבלאות ו-23 התמונות המוטמעות נשארים כמו שהם.
// ============================================================

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const H = require("./docx-helpers");
const C1 = require("./book-content");
const C2 = require("./book-content2");
const C3 = require("./book-content3");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "docs", "ספר-פרויקט-GOLDEN-HAIR-SALON.docx");
const TARGET = path.join(ROOT, "docs", "ספר-פרויקט-GOLDEN-HAIR-SALON-מאוחד.docx");
const TEMP = path.join(ROOT, "scripts", ".tmp-document.xml");

// ------------------------------------------------------------
// קריאה וכתיבה של document.xml בתוך קובץ ה-docx
// ------------------------------------------------------------

function runPowerShell(script) {
  execSync("powershell -NoProfile -Command " + JSON.stringify(script.replace(/\r?\n/g, "; ")), {
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function readDocumentXml(docxPath, outPath) {
  runPowerShell(`
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z=[System.IO.Compression.ZipFile]::OpenRead('${docxPath}')
$e=$z.Entries | Where-Object {$_.FullName -eq 'word/document.xml'}
$sr=New-Object System.IO.StreamReader($e.Open())
$t=$sr.ReadToEnd(); $sr.Close(); $z.Dispose()
[System.IO.File]::WriteAllText('${outPath}', $t, (New-Object System.Text.UTF8Encoding($false)))
  `);

  return fs.readFileSync(outPath, "utf8");
}

function writeDocumentXml(docxPath, xmlPath) {
  runPowerShell(`
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z=[System.IO.Compression.ZipFile]::Open('${docxPath}','Update')
$e=$z.Entries | Where-Object {$_.FullName -eq 'word/document.xml'}
$e.Delete()
$new=$z.CreateEntry('word/document.xml')
$sw=New-Object System.IO.StreamWriter($new.Open(), (New-Object System.Text.UTF8Encoding($false)))
$sw.Write([System.IO.File]::ReadAllText('${xmlPath}', (New-Object System.Text.UTF8Encoding($false))))
$sw.Flush(); $sw.Close(); $z.Dispose()
  `);
}

// ------------------------------------------------------------
// התחלה
// ------------------------------------------------------------

console.log("קורא את ספר הפרויקט המקורי...");

let xml = readDocumentXml(SOURCE, TEMP);
const originalXml = xml;

console.log("  גודל ה-XML: " + Math.round(xml.length / 1024) + " KB");
console.log("");

// ============================================================
// חלק א: עמודי הפתיחה, לפני סעיף 1
// ============================================================

console.log("מוסיף את עמודי הפתיחה בתחילת הספר...");

const bodyStart = xml.indexOf("<w:body>") + "<w:body>".length;

if (bodyStart > "<w:body>".length - 1) {
  xml = xml.substring(0, bodyStart) + C1.coverPages + xml.substring(bodyStart);
  console.log("  נוספו: פרטי הסטודנט, פרטי המנחה והערה על תוכן העניינים");
} else {
  console.log("  שגיאה: לא נמצא <w:body>");
  process.exit(1);
}

// ============================================================
// חלק ב: כל התוספות, אחרי העמוד האחרון
// ============================================================

console.log("");
console.log("בונה את כל התוספות שאחרי העמוד האחרון...");

// --- ב1: המשך ישיר של הספר ---
// הספר המקורי נקטע באמצע ה-SAD, בסעיף 4.ד.
// הפרקים הבאים הם ההמשך הטבעי שלו.

const continuation =
  H.pageBreak() +
  C2.sequenceDiagrams +   // SAD סעיף 5 - תרשימי רצף
  C3.sdd +                // מפרט תכן תוכנה
  C3.testsChapter +       // פרק הבדיקות
  C3.screensChapter +     // מסכי האפליקציה
  C3.signaturePages;      // דפי החתימות והאישורים

console.log("  המשך הספר: תרשימי רצף, SDD, בדיקות, מסכים ודפי אישור");

// --- ב2: הנספח ---
// כאן נמצאות ההשלמות לסעיפים שנמצאים באמצע הספר.
// הן לא הושתלו במקומן כי הספר המקורי לא משתנה.
// אריאל מעתיק כל אחת למקומה ואז מוחק את הנספח כולו.
//
// הנספח נמצא אחרי דפי האישור בכוונה: כשמוחקים אותו,
// הספר נגמר בדפי האישור כמו שצריך.

function appendixItem(where, content) {
  return (
    H.note("המקום בספר: " + where, "העתק את התוכן הבא אל המקום הזה בספר, ואז מחק אותו מהנספח.") +
    content +
    H.pageBreak()
  );
}

const appendix =
  H.pageBreak() +
  H.p("נספח", { bold: true, size: 44, align: "center", after: 120 }) +
  H.p("השלמות לסעיפים שבגוף הספר", { bold: true, size: 30, align: "center", after: 300 }) +
  H.note(
    "מה הנספח הזה ולמה הוא כאן",
    "גוף הספר נשאר בדיוק כפי שנכתב, ולכן ההשלמות לסעיפים שנמצאים באמצעו לא הושתלו " +
    "במקומן אלא רוכזו כאן. כל פריט מסומן בדיוק לאן הוא שייך. העתק כל אחד למקומו בספר, " +
    "ובסיום מחק את הנספח כולו - ואז הספר יסתיים בדפי האישור כנדרש."
  ) +
  H.pageBreak() +

  appendixItem(
    "סעיף 9, אחרי 9.2 תרשים רצף",
    C1.dataFlow
  ) +

  appendixItem(
    "סעיף 10, מתחת לכותרת 10.1 שריקה כרגע",
    H.h1("10.‏ תיאור המרכיב האלגוריתמי - חישוב") +
    H.h2("10.1\tאיזו בעיה בא לפתור, וכיצד") +
    C1.algorithmSection
  ) +

  appendixItem(
    "סעיף 11, אחרי שתי הפסקאות הקיימות",
    H.h1("11.‏ תיאור/התייחסות לנושאי אבטחת מידע - הרחבה") +
    C1.securitySection
  ) +

  appendixItem(
    "סעיף 12, אחרי 12.3 תוכנות נדרשות",
    C1.resourcesSection
  ) +

  appendixItem(
    "סעיף 13, במקום הרשימה הקיימת (אופציונלי)",
    H.h1("13.‏ תכנית עבודה ושלבים למימוש הפרויקט - כטבלה") +
    H.p(
      "הרשימה הקיימת בספר תקינה מבחינת התוכן, אך התאריכים שבה כבר עברו. " +
      "הטבלה הבאה מציגה את אותם שלבים בפורמט טבלה, כמו בספר הדוגמה, עם תאריכים מעודכנים. " +
      "השימוש בה אינו חובה."
    ) +
    C1.workPlan
  ) +

  appendixItem(
    "סעיף 14, בתוך הטבלה שריקה כרגע",
    H.h1("14. תכנון הבדיקות שיבוצעו - הטבלה המלאה") +
    H.p(
      "הטבלה הבאה שומרת על שלוש העמודות שכבר קיימות בספר, ורק ממלאת את התאים. " +
      "אפשר להעתיק את השורות אל תוך הטבלה הקיימת."
    ) +
    C2.testPlanning
  ) +

  appendixItem(
    "SRS, סעיף 2.ג - אחרי המפרט של SUC-11",
    H.h1("מפרט SUC-12 - חסר ב-SRS") +
    H.p(
      "ברשימת תהליכי המערכת (סעיף 2.א) מוצהרים 12 תהליכים, אך במפרט (סעיף 2.ג) " +
      "יש מפרטים ל-11 בלבד. בלי המפרט הזה, דרישה 26 אינה מכוסה בשום מקום בספר."
    ) +
    C2.suc12
  ) +

  C2.sucFixes;

console.log("  הנספח: 9.3, סעיף 10, סעיף 11, סעיף 12, סעיף 13, סעיף 14, SUC-12 ותיקוני SUC");

// --- הוספה בפועל, לפני sectPr שבסוף המסמך ---

const sectPrIndex = xml.lastIndexOf("<w:sectPr>");

if (sectPrIndex === -1) {
  console.log("  שגיאה: לא נמצא sectPr");
  process.exit(1);
}

xml = xml.substring(0, sectPrIndex) + continuation + appendix + xml.substring(sectPrIndex);

// ============================================================
// בדיקת שלמות: כל פסקה מהמקור חייבת להישאר כמו שהיא
// ============================================================

console.log("");
console.log("בודק שהטקסט המקורי לא נפגע...");

function paragraphTexts(source) {
  return source
    .split("</w:p>")
    .map(function (p) {
      return p.replace(/<[^>]+>/g, "").trim();
    })
    .filter(function (t) {
      return t !== "";
    });
}

const originalTexts = paragraphTexts(originalXml);
const mergedTexts = paragraphTexts(xml);
const mergedSet = new Set(mergedTexts);

const missing = originalTexts.filter(function (t) {
  return !mergedSet.has(t);
});

if (missing.length > 0) {
  console.log("  שגיאה: " + missing.length + " פסקאות מהמקור נעלמו או שונו:");
  missing.slice(0, 10).forEach(function (m) {
    console.log("    - " + m.substring(0, 100));
  });
  process.exit(1);
}

console.log("  תקין: כל " + originalTexts.length + " הפסקאות מהמקור קיימות, מילה במילה");

// בדיקה שהסעיפים הריקים נשארו ריקים
const stillEmpty = [];

if (xml.indexOf("FUNCTION getFreeSlots") > xml.indexOf("נספח")) {
  stillEmpty.push("סעיף 10 נשאר ריק בגוף הספר");
}

stillEmpty.forEach(function (s) {
  console.log("  תקין: " + s);
});

// ============================================================
// כתיבת הקובץ
// ============================================================

console.log("");
console.log("כותב את הקובץ המאוחד...");

fs.writeFileSync(TEMP, xml, "utf8");
fs.copyFileSync(SOURCE, TARGET);
writeDocumentXml(TARGET, TEMP);
fs.unlinkSync(TEMP);

console.log("");
console.log("===========================================");
console.log("  הספר המאוחד נוצר");
console.log("===========================================");
console.log("  " + TARGET);
console.log("");
console.log("  פסקאות במקור  : " + originalTexts.length);
console.log("  פסקאות במאוחד : " + mergedTexts.length);
console.log("  נוספו         : " + (mergedTexts.length - originalTexts.length));
console.log("");
console.log("  מבנה הקובץ:");
console.log("    1. עמודי פתיחה (חדש)");
console.log("    2. הספר המקורי - ללא שינוי");
console.log("    3. המשך הספר: SAD סעיף 5, SDD, בדיקות, מסכים, דפי אישור");
console.log("    4. נספח: השלמות לסעיפים שבגוף הספר - למחיקה אחרי השימוש");
console.log("===========================================");
