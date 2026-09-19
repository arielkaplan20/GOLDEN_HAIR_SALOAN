// ============================================================
// ייצוא קודי התרשימים לקבצים נפרדים
//
// הרצה: node scripts/export-diagrams.js
//
// הסקריפט שולף את כל בלוקי ה-PlantUML מהספר המאוחד
// ושומר כל אחד כקובץ .puml נפרד בתיקייה docs/diagrams/puml/
//
// אחרי שמרנדרים אותם לתמונות PNG ושמים אותן ב-docs/diagrams/png/
// עם אותם שמות, מריצים את insert-diagrams.js שמכניס אותן לספר.
// ============================================================

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const BOOK = path.join(ROOT, "docs", "ספר-פרויקט-GOLDEN-HAIR-SALON-מאוחד.docx");
const OUT_DIR = path.join(ROOT, "docs", "diagrams", "puml");
const PNG_DIR = path.join(ROOT, "docs", "diagrams", "png");
const TEMP = path.join(__dirname, ".tmp-export.xml");

// שמות קריאים לכל תרשים, לפי סדר הופעתו בספר
const NAMES = [
  "01-seq-suc01-הרשמה",
  "02-seq-suc02-התחברות",
  "03-seq-suc03-הזמנת-תור",
  "04-seq-suc04-צפייה-בתורים",
  "05-seq-suc05-שינוי-תור",
  "06-seq-suc06-ביטול-תור",
  "07-seq-suc07-רכישה-בחנות",
  "08-seq-suc08-פרופיל-אישי",
  "09-seq-suc09-יומן-ושעות",
  "10-seq-suc10-ניהול-משתמשים",
  "11-seq-suc11-ניהול-תורים",
  "12-seq-suc12-ניהול-חנות",
  "13-sdd-pdom-קונספטואלי",
  "14-sdd-pdom-מחלקות",
  "15-sdd-מחלקות-תורים",
  "16-sdd-רצף-calculateFreeSlots",
  "17-sdd-מחלקות-משתמשים",
  "18-sdd-רצף-register",
  "19-sdd-מצבים-Appointment",
  "20-sdd-מצבים-Order",
  "21-נספח-9.3-data-flow",
  "22-נספח-suc12-תרשים-פעילות",
];

function readDocumentXml() {
  const script = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z=[System.IO.Compression.ZipFile]::OpenRead('${BOOK}')
$e=$z.Entries | Where-Object {$_.FullName -eq 'word/document.xml'}
$sr=New-Object System.IO.StreamReader($e.Open())
$t=$sr.ReadToEnd(); $sr.Close(); $z.Dispose()
[System.IO.File]::WriteAllText('${TEMP}', $t, (New-Object System.Text.UTF8Encoding($false)))
  `;

  execSync("powershell -NoProfile -Command " + JSON.stringify(script.replace(/\r?\n/g, "; ")), {
    stdio: ["ignore", "pipe", "pipe"],
  });

  return fs.readFileSync(TEMP, "utf8");
}

// מחזיר טקסט של פסקה, אחרי ביטול ההברחה של תווי XML
function paragraphText(paragraph) {
  return paragraph
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

console.log("קורא את הספר המאוחד...");

const xml = readDocumentXml();
fs.unlinkSync(TEMP);

const paragraphs = xml.split("</w:p>");
const texts = paragraphs.map(paragraphText);

// אוסף את כל הבלוקים מ-@startuml עד @enduml
const diagrams = [];
let current = null;

for (let i = 0; i < texts.length; i++) {
  const line = texts[i];

  if (line === "@startuml") {
    current = { startParagraph: i, lines: [] };
  }

  if (current) {
    current.lines.push(line);
  }

  if (line === "@enduml" && current) {
    current.endParagraph = i;
    diagrams.push(current);
    current = null;
  }
}

console.log("  נמצאו " + diagrams.length + " תרשימים");

if (diagrams.length !== NAMES.length) {
  console.log("");
  console.log("  אזהרה: מספר התרשימים (" + diagrams.length + ") אינו תואם");
  console.log("  את מספר השמות שהוגדרו (" + NAMES.length + ").");
  console.log("  צריך לעדכן את רשימת NAMES בקובץ הזה.");
}

// יצירת התיקיות
[OUT_DIR, PNG_DIR].forEach(function (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log("");
console.log("כותב את קובצי ה-puml...");

const index = [];

diagrams.forEach(function (diagram, i) {
  const name = NAMES[i] || "diagram-" + (i + 1);
  const fileName = name + ".puml";

  fs.writeFileSync(path.join(OUT_DIR, fileName), diagram.lines.join("\r\n"), "utf8");

  index.push({ number: i + 1, name: name, paragraph: diagram.startParagraph + 1 });

  console.log("  " + fileName);
});

// קובץ הסבר בתיקייה, כדי שיהיה ברור מה עושים עם הקבצים
const readme =
  "# תרשימי הספר\n\n" +
  "בתיקייה `puml/` נמצאים " + diagrams.length + " קובצי PlantUML, אחד לכל תרשים בספר.\n\n" +
  "## מה לעשות\n\n" +
  "1. היכנס ל-https://www.plantuml.com/plantuml/uml/\n" +
  "2. פתח קובץ `.puml`, העתק את התוכן והדבק באתר\n" +
  "3. לחץ Submit, ואז לחץ על הקישור PNG ושמור את התמונה\n" +
  "4. שמור אותה בתיקייה `png/` **בדיוק באותו שם** של קובץ ה-puml, עם סיומת `.png`\n\n" +
  "לדוגמה: `01-seq-suc01-הרשמה.puml` נשמר כ-`png/01-seq-suc01-הרשמה.png`\n\n" +
  "5. כשסיימת, הרץ מהתיקייה הראשית:\n\n" +
  "```\nnode scripts/insert-diagrams.js\n```\n\n" +
  "הסקריפט יחליף כל בלוק קוד בספר בתמונה המתאימה.\n" +
  "אפשר להריץ אותו גם אם רק חלק מהתמונות מוכנות - הוא ידלג על מה שחסר.\n\n" +
  "## רשימת התרשימים\n\n" +
  "| # | שם הקובץ | איפה בספר |\n|---|---|---|\n" +
  index
    .map(function (item) {
      return "| " + item.number + " | `" + item.name + "` | פסקה " + item.paragraph + " |";
    })
    .join("\n") +
  "\n";

fs.writeFileSync(path.join(ROOT, "docs", "diagrams", "README.md"), readme, "utf8");

console.log("");
console.log("===========================================");
console.log("  " + diagrams.length + " קובצי puml נוצרו");
console.log("===========================================");
console.log("  " + OUT_DIR);
console.log("");
console.log("  ההוראות המלאות: docs/diagrams/README.md");
console.log("  את התמונות שמור ב: " + PNG_DIR);
console.log("===========================================");
