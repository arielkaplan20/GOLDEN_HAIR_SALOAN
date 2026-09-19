// ============================================================
// בניית ספר הפרויקט המאוחד
//
// הרצה: node scripts/merge-book.js
//
// הסקריפט לוקח את ספר הפרויקט המקורי, משתיל בו את הפרקים החסרים
// ומחיל את התיקונים - ומייצר קובץ חדש. הקובץ המקורי לא משתנה.
//
// הגישה: עריכה ישירה של ה-XML שבתוך קובץ ה-Word.
// כך כל העיצוב, הטבלאות ו-23 התמונות המוטמעות נשארים בדיוק כמו שהם.
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
console.log("  גודל ה-XML: " + Math.round(xml.length / 1024) + " KB");

const report = [];

// ============================================================
// שלב 1: תיקוני טקסט
// ============================================================

console.log("");
console.log("מחיל תיקוני טקסט...");

// מחליף טקסט בתוך תגית <w:t>, ומוודא שהוא באמת נמצא
function replaceText(oldText, newText, description) {
  const escapedOld = H.esc(oldText);
  const escapedNew = H.esc(newText);

  if (xml.indexOf(escapedOld) === -1) {
    console.log("  לא נמצא: " + description);
    report.push({ ok: false, what: description });
    return;
  }

  const count = xml.split(escapedOld).length - 1;
  xml = xml.split(escapedOld).join(escapedNew);

  console.log("  תוקן (" + count + "): " + description);
  report.push({ ok: true, what: description, count: count });
}

// החלפה גולמית, בלי הברחת תווי XML.
// נחוצה כשרוצים לכוון למקטע טקסט מסוים ולא למחרוזת בתוכו.
function replaceRaw(oldRaw, newRaw, description) {
  if (xml.indexOf(oldRaw) === -1) {
    console.log("  לא נמצא: " + description);
    report.push({ ok: false, what: description });
    return;
  }

  const count = xml.split(oldRaw).length - 1;
  xml = xml.split(oldRaw).join(newRaw);

  console.log("  תוקן (" + count + "): " + description);
  report.push({ ok: true, what: description, count: count });
}

// ממצא 9 - שגיאת כתיב.
// Word מפצל את הפסקה למקטעים, והמילה OPA יושבת במקטע משלה,
// אז מחליפים בדיוק את המקטע הזה.
replaceRaw(">OPA</w:t>", ">SPA (Single Page Application)</w:t>", "ממצא 9: OPA ← SPA");

// ממצא 8 - מינוח מסד הנתונים
replaceText(
  "האתר שומר את הנתונים בבסיס נתונים שאינו רלציוני, המחולק לטבלאות.",
  "האתר שומר את הנתונים בבסיס נתונים שאינו רלציוני (MongoDB), המחולק לאוספים (Collections). " +
  "כל אוסף מכיל מסמכים (Documents) בפורמט דמוי JSON.",
  "ממצא 8: טבלאות ← אוספים (סעיף 8)"
);

// ממצא 8 - המשך, שמות האוספים בסעיף 8
replaceText("טבלת נותני שירות (ספרים נוספים העובדים במספרה).",
  "אוסף נותני השירות (ספרים נוספים העובדים במספרה).", "ממצא 8: אוסף נותני שירות");
replaceText("טבלת משתמשים (פרטים אישיים, פרטי הרשמה).",
  "אוסף המשתמשים (פרטים אישיים, פרטי הרשמה).", "ממצא 8: אוסף משתמשים");
replaceText("טבלת תורים שנקבעו (תאריך, שעה, סוג התספורת).",
  "אוסף התורים שנקבעו (תאריך, שעה, סוג התספורת).", "ממצא 8: אוסף תורים");
replaceText("טבלת הזמנות בחנות שבאתר (פרטי ההזמנה).",
  "אוסף ההזמנות בחנות שבאתר (פרטי ההזמנה).", "ממצא 8: אוסף הזמנות");

// ממצא 8 - שמות האוספים ב-SAD
replaceText("טבלת המשתמשים: פרטים אישיים ופרטי הרשמה",
  "אוסף המשתמשים: פרטים אישיים ופרטי הרשמה", "ממצא 8: SAD - אוסף משתמשים");
replaceText("טבלת נותני השירות: הספרים ושעות העבודה שלהם",
  "אוסף נותני השירות: הספרים ושעות העבודה שלהם", "ממצא 8: SAD - אוסף נותני שירות");
replaceText("טבלת התורים: תאריך, שעה וסוג התספורת",
  "אוסף התורים: תאריך, שעה וסוג התספורת", "ממצא 8: SAD - אוסף תורים");
replaceText("טבלת החנות: מוצרים והזמנות",
  "אוסף החנות: מוצרים והזמנות", "ממצא 8: SAD - אוסף חנות");
replaceText("קבלת נתוני משתמשים מטבלת המשתמשים",
  "קבלת נתוני משתמשים מאוסף המשתמשים", "ממצא 8: SAD - ממשק משתמשים");
replaceText("שמירת נתוני משתמשים בטבלת המשתמשים",
  "שמירת נתוני משתמשים באוסף המשתמשים", "ממצא 8: SAD - שמירת משתמשים");
replaceText("קבלת נתוני תורים מטבלת התורים",
  "קבלת נתוני תורים מאוסף התורים", "ממצא 8: SAD - קבלת תורים");
replaceText("שמירת תורים ועדכונם בטבלת התורים",
  "שמירת תורים ועדכונם באוסף התורים", "ממצא 8: SAD - שמירת תורים");
replaceText("קבלת התורים שנקבעו לספר מטבלת התורים",
  "קבלת התורים שנקבעו לספר מאוסף התורים", "ממצא 8: SAD - תורי הספר");
replaceText("עדכון תורים בטבלת התורים",
  "עדכון תורים באוסף התורים", "ממצא 8: SAD - עדכון תורים");
replaceText("קבלת נתוני נותני השירות מטבלת נותני השירות",
  "קבלת נתוני נותני השירות מאוסף נותני השירות", "ממצא 8: SAD - נתוני נותני שירות");
replaceText("עדכון שעות וימי עבודה בטבלת נותני השירות",
  "עדכון שעות וימי עבודה באוסף נותני השירות", "ממצא 8: SAD - עדכון שעות");
replaceText("קבלת מוצרים והזמנות מטבלת החנות",
  "קבלת מוצרים והזמנות מאוסף החנות", "ממצא 8: SAD - קבלת מוצרים");
replaceText("שמירת הזמנות ועדכון מוצרים בטבלת החנות",
  "שמירת הזמנות ועדכון מוצרים באוסף החנות", "ממצא 8: SAD - שמירת הזמנות");

// ממצא 15 - עקביות לדרישות של SUC-9
replaceText("תפעוליות: 27", "תפעוליות: 27, 28", "ממצא 15: SUC-9 עקביות לדרישות");

// שתי פסקאות נוספות - 7.3 (ארכיטקטורה) ו-7.5 (סביבת השרת) - מוחלפות
// בשלב הבא, בהחלפת פסקאות שלמות. הסיבה: Word פיצל אותן למקטעים רבים,
// ולכן קל ובטוח יותר להחליף את הפסקה כולה מאשר לתקן מקטע-מקטע.

// ============================================================
// שלב 2: החלפת הטבלה הריקה של סעיף 14
// ============================================================

console.log("");
console.log("מחליף את טבלת הבדיקות הריקה...");

// מאתר את הטבלה שמתחילה בכותרת "מספר דרישה" ומחליף אותה כולה
const emptyTableStart = xml.indexOf("<w:tbl>", xml.indexOf("14. תכנון הבדיקות שיבוצעו"));
const emptyTableEnd = xml.indexOf("</w:tbl>", emptyTableStart);

if (emptyTableStart > -1 && emptyTableEnd > -1) {
  const before = xml.substring(0, emptyTableStart);
  const after = xml.substring(emptyTableEnd + "</w:tbl>".length);

  xml = before + C2.testPlanning + after;

  console.log("  הוחלפה טבלת הבדיקות של סעיף 14");
  report.push({ ok: true, what: "ממצא 5: טבלת הבדיקות של סעיף 14 מולאה" });
} else {
  console.log("  שגיאה: לא נמצאה הטבלה של סעיף 14");
  report.push({ ok: false, what: "ממצא 5: טבלת הבדיקות" });
}

// ============================================================
// שלב 3: השתלת הפרקים החסרים
// ============================================================

console.log("");
console.log("משתיל את הפרקים החסרים...");

// מפצל לפסקאות. שומרים את המפריד כדי שאפשר יהיה להרכיב בחזרה.
function splitParagraphs(source) {
  return source.split("</w:p>");
}

function joinParagraphs(list) {
  return list.join("</w:p>");
}

// מוצא את מספר הפסקה שמכילה טקסט מסוים
function findParagraph(list, text) {
  const target = H.esc(text);

  for (let i = 0; i < list.length; i++) {
    if (list[i].indexOf(target) > -1) {
      return i;
    }
  }

  return -1;
}

let paragraphs = splitParagraphs(xml);

// אוסף את כל ההשתלות ומבצע אותן בסוף, מהסוף להתחלה,
// כדי שמספרי הפסקאות לא יזוזו תוך כדי
const insertions = [];

function insertAfter(anchorText, content, description) {
  const index = findParagraph(paragraphs, anchorText);

  if (index === -1) {
    console.log("  לא נמצאה העוגן: " + description);
    report.push({ ok: false, what: description });
    return;
  }

  insertions.push({ index: index, content: content, description: description });
}

function replaceRange(fromText, toText, content, description) {
  const from = findParagraph(paragraphs, fromText);
  const to = findParagraph(paragraphs, toText);

  if (from === -1 || to === -1 || to < from) {
    console.log("  לא נמצא הטווח: " + description);
    report.push({ ok: false, what: description });
    return;
  }

  insertions.push({ index: from, content: content, description: description, deleteTo: to });
}

// --- עמודי הפתיחה, לפני סעיף 1 ---
insertions.push({ index: -1, content: C1.coverPages, description: "עמודי פתיחה: פרטי סטודנט, מנחה ותוכן עניינים" });

// --- 9.3 תרשים זרימת נתונים, אחרי תמונת תרשים הרצף ---
insertAfter("10.‏ תיאור המרכיב האלגוריתמי - חישוב", C1.dataFlow + H.h1("10.‏ תיאור המרכיב האלגוריתמי - חישוב"), "__SKIP__");
insertions.pop(); // מטופל אחרת למטה

// --- סעיף 10, אחרי כותרת 10.1 ---
insertAfter("10.1", C1.algorithmSection, "ממצא 4: סעיף 10 - המרכיב האלגוריתמי");

// --- סעיף 7.3, מחליף את פסקת ה-MVC ---
replaceRange(
  "האתר ישתמש בארכיטקטורת ",
  "האתר ישתמש בארכיטקטורת ",
  H.p(
    "הארכיטקטורה הנבחרת היא חלוקה לשלוש שכבות: שכבת התצוגה (React בצד הלקוח), " +
    "שכבת הלוגיקה (שרת Node.js ו-Express החושף REST API), ושכבת הנתונים (MongoDB). " +
    "היתרון העיקרי בחלוקה לשכבות הוא תחזוקה קלה - ניתן להחליף כל שכבה מבלי לגעת " +
    "באחרות כאשר נרצה לבצע שינויים במערכת."
  ),
  "ממצא 7: MVC ← ארכיטקטורת שלוש שכבות"
);

// --- סעיף 7.5, מחליף את פסקת סביבת השרת ---
replaceRange(
  "סביבת השרת",
  "סביבת השרת",
  H.p(
    "7.5\tסביבת השרת: שרת Node.js ועליו Express.js, ומסד הנתונים MongoDB מתארח " +
    "בשירות הענן MongoDB Atlas. השימוש בשירות ענן חוסך התקנה מקומית של מסד הנתונים " +
    "ומאפשר גישה אליו מכל מקום.",
    { bold: true }
  ),
  "ממצא 10: הבהרת סביבת השרת ומסד הנתונים"
);

// --- סעיף 11, מחליף את שתי הפסקאות הקיימות ---
replaceRange(
  "האפליקציה תאובטח בשרת המקומי",
  "סליקת האשראי משתמשת ב-",
  C1.securitySection,
  "ממצא 21: סעיף 11 - אבטחת מידע מורחבת"
);

// --- 12.4 ו-12.5, אחרי תוכנות נדרשות ---
insertAfter("תוכנות נדרשות:", C1.resourcesSection, "ממצא 23: ידע חדש נדרש וספרות ומקורות");

// --- סעיף 13, מחליף את הטקסט החופשי בטבלה ---
replaceRange(
  "ניתוח הפרויקט וכתיבת הצעת פרויקט",
  "כתיבת ספר פרויקט",
  C1.workPlan,
  "ממצא 22: סעיף 13 - תכנית עבודה כטבלה"
);

// --- SUC-12, לפני תחילת ה-SAD ---
insertAfter("מפרט ארכיטקטורת תוכנה", C2.suc12, "__SUC12__");

console.log("  נאספו " + insertions.length + " השתלות");

// מבצע את ההשתלות מהסוף להתחלה
insertions.sort(function (a, b) { return b.index - a.index; });

insertions.forEach(function (item) {
  if (item.description === "__SUC12__") {
    // SUC-12 צריך להיכנס לפני כותרת ה-SAD, לא אחריה
    paragraphs.splice(item.index, 0, item.content.replace(/<\/w:p>$/, ""));
    console.log("  הושתל: ממצא 6 - מפרט SUC-12");
    report.push({ ok: true, what: "ממצא 6: מפרט SUC-12 נוסף ל-SRS" });
    return;
  }

  if (item.index === -1) {
    // עמודי הפתיחה - בתחילת המסמך.
    // כאן משתילים בתוך המקטע הראשון ולא כאיבר חדש במערך,
    // ולכן משאירים את תגית הסגירה האחרונה במקומה.
    const bodyStart = paragraphs[0].indexOf("<w:body>") + "<w:body>".length;
    paragraphs[0] =
      paragraphs[0].substring(0, bodyStart) +
      item.content +
      paragraphs[0].substring(bodyStart);

    console.log("  הושתל: " + item.description);
    report.push({ ok: true, what: "ממצא 2: " + item.description });
    return;
  }

  if (item.deleteTo !== undefined) {
    const howMany = item.deleteTo - item.index + 1;
    paragraphs.splice(item.index, howMany, item.content.replace(/<\/w:p>$/, ""));
    console.log("  הוחלף (" + howMany + " פסקאות): " + item.description);
  } else {
    paragraphs.splice(item.index + 1, 0, item.content.replace(/<\/w:p>$/, ""));
    console.log("  הושתל: " + item.description);
  }

  report.push({ ok: true, what: item.description });
});

xml = joinParagraphs(paragraphs);

// --- 9.3 מושתל בנפרד, כי הוא צריך לבוא לפני כותרת סעיף 10 ---
const section10Heading = xml.indexOf("<w:p><w:pPr><w:keepNext/><w:bidi/><w:spacing w:after=\"200\" w:before=\"400\"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii=\"David\" w:cs=\"David\" w:hAnsi=\"David\"/><w:b/><w:bCs/><w:sz w:val=\"32\"/><w:szCs w:val=\"32\"/><w:rtl/></w:rPr><w:t xml:space=\"preserve\">10.");

if (section10Heading > -1) {
  xml = xml.substring(0, section10Heading) + C1.dataFlow + xml.substring(section10Heading);
  console.log("  הושתל: ממצא - סעיף 9.3 תרשים זרימת נתונים");
  report.push({ ok: true, what: "סעיף 9.3: תרשים זרימת נתונים נוסף" });
} else {
  console.log("  לא נמצאה כותרת סעיף 10 להשתלת 9.3");
  report.push({ ok: false, what: "סעיף 9.3" });
}

// ============================================================
// שלב 4: הוספת הפרקים החדשים בסוף הספר
// ============================================================

console.log("");
console.log("מוסיף את הפרקים החדשים בסוף הספר...");

const tail =
  H.pageBreak() +
  C2.sequenceDiagrams +
  C3.sdd +
  C3.testsChapter +
  C3.screensChapter +
  C2.sucFixes +
  C3.signaturePages;

const sectPrIndex = xml.lastIndexOf("<w:sectPr>");

if (sectPrIndex > -1) {
  xml = xml.substring(0, sectPrIndex) + tail + xml.substring(sectPrIndex);

  console.log("  נוספו: תרשימי רצף, SDD, בדיקות, מסכים, תוספות SUC ודפי אישור");
  report.push({ ok: true, what: "ממצא 1: כל הפרקים שאחרי סעיף 4.ד נוספו" });
} else {
  console.log("  שגיאה: לא נמצא sectPr");
  report.push({ ok: false, what: "ממצא 1: הפרקים החדשים" });
}

// ============================================================
// שלב 5: כתיבת הקובץ
// ============================================================

console.log("");
console.log("כותב את הקובץ המאוחד...");

fs.writeFileSync(TEMP, xml, "utf8");
fs.copyFileSync(SOURCE, TARGET);
writeDocumentXml(TARGET, TEMP);
fs.unlinkSync(TEMP);

const sourceSize = fs.statSync(SOURCE).size;
const targetSize = fs.statSync(TARGET).size;

console.log("");
console.log("===========================================");
console.log("  הספר המאוחד נוצר");
console.log("===========================================");
console.log("  " + TARGET);
console.log("");
console.log("  גודל המקור:  " + Math.round(sourceSize / 1024) + " KB");
console.log("  גודל החדש:   " + Math.round(targetSize / 1024) + " KB");
console.log("");

const ok = report.filter(function (r) { return r.ok; }).length;
const failed = report.filter(function (r) { return !r.ok; });

console.log("  שינויים שהוחלו: " + ok);

if (failed.length > 0) {
  console.log("  נכשלו: " + failed.length);
  failed.forEach(function (f) { console.log("    - " + f.what); });
  process.exitCode = 1;
}

console.log("===========================================");
