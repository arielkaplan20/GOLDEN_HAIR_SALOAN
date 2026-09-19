// ============================================================
// הכנסת תמונות התרשימים לתוך הספר
//
// הרצה: node scripts/insert-diagrams.js
//
// הסקריפט מחפש בתיקייה docs/diagrams/png/ תמונות ששמן תואם
// לקובצי ה-puml, ומחליף כל בלוק קוד בספר בתמונה המתאימה.
//
// אפשר להריץ גם כשרק חלק מהתמונות מוכנות - מה שחסר פשוט
// נשאר כקוד, ואפשר להריץ שוב אחר כך.
//
// הערה: הסקריפט עובד על הספר המאוחד במקום. אם תריץ
// את merge-book.js מחדש, הספר ייבנה מאפס והתמונות ייעלמו -
// ואז צריך להריץ את insert-diagrams.js שוב.
// ============================================================

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const BOOK = path.join(ROOT, "docs", "ספר-פרויקט-GOLDEN-HAIR-SALON-מאוחד.docx");
const PUML_DIR = path.join(ROOT, "docs", "diagrams", "puml");
const PNG_DIR = path.join(ROOT, "docs", "diagrams", "png");
const TEMP_XML = path.join(__dirname, ".tmp-insert.xml");
const TEMP_RELS = path.join(__dirname, ".tmp-rels.xml");

// רוחב מקסימלי לתמונה בספר, ביחידות EMU
// (914400 יחידות = אינץ אחד. עמוד A4 עם שוליים = בערך 6 אינץ)
const MAX_WIDTH_EMU = 5486400; // 6 אינץ

// ------------------------------------------------------------
// עבודה עם קובץ ה-docx
// ------------------------------------------------------------

function powershell(script) {
  execSync("powershell -NoProfile -Command " + JSON.stringify(script.replace(/\r?\n/g, "; ")), {
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function readEntry(entryName, outPath) {
  powershell(`
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z=[System.IO.Compression.ZipFile]::OpenRead('${BOOK}')
$e=$z.Entries | Where-Object {$_.FullName -eq '${entryName}'}
$sr=New-Object System.IO.StreamReader($e.Open())
$t=$sr.ReadToEnd(); $sr.Close(); $z.Dispose()
[System.IO.File]::WriteAllText('${outPath}', $t, (New-Object System.Text.UTF8Encoding($false)))
  `);

  return fs.readFileSync(outPath, "utf8");
}

function writeEntry(entryName, fromPath) {
  powershell(`
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z=[System.IO.Compression.ZipFile]::Open('${BOOK}','Update')
$e=$z.Entries | Where-Object {$_.FullName -eq '${entryName}'}
if ($e) { $e.Delete() }
$new=$z.CreateEntry('${entryName}')
$sw=New-Object System.IO.StreamWriter($new.Open(), (New-Object System.Text.UTF8Encoding($false)))
$sw.Write([System.IO.File]::ReadAllText('${fromPath}', (New-Object System.Text.UTF8Encoding($false))))
$sw.Flush(); $sw.Close(); $z.Dispose()
  `);
}

function addImageToZip(entryName, sourcePath) {
  powershell(`
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z=[System.IO.Compression.ZipFile]::Open('${BOOK}','Update')
$e=$z.Entries | Where-Object {$_.FullName -eq '${entryName}'}
if ($e) { $e.Delete() }
$new=$z.CreateEntry('${entryName}')
$out=$new.Open()
$bytes=[System.IO.File]::ReadAllBytes('${sourcePath}')
$out.Write($bytes,0,$bytes.Length)
$out.Flush(); $out.Close(); $z.Dispose()
  `);
}

// ------------------------------------------------------------
// קריאת מידות התמונה מתוך קובץ ה-PNG
//
// בקובץ PNG, הרוחב והגובה שמורים כשני מספרים בני 4 בתים
// שמתחילים בבית 16. לא צריך ספרייה חיצונית בשביל זה.
// ------------------------------------------------------------

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);

  // בדיקה שזה באמת PNG
  if (buffer.length < 24 || buffer.toString("hex", 0, 8) !== "89504e470d0a1a0a") {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

// ------------------------------------------------------------
// יצירת ה-XML של התמונה
// ------------------------------------------------------------

function imageParagraph(relationId, imageId, name, widthEmu, heightEmu) {
  return (
    '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="200" w:before="120"/></w:pPr>' +
    "<w:r><w:drawing>" +
    '<wp:inline distT="0" distB="0" distL="0" distR="0">' +
    '<wp:extent cx="' + widthEmu + '" cy="' + heightEmu + '"/>' +
    '<wp:effectExtent l="0" t="0" r="0" b="0"/>' +
    '<wp:docPr id="' + imageId + '" name="Picture ' + imageId + '" descr="' + name + '"/>' +
    "<wp:cNvGraphicFramePr>" +
    '<a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>' +
    "</wp:cNvGraphicFramePr>" +
    '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">' +
    '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
    '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
    "<pic:nvPicPr>" +
    '<pic:cNvPr id="' + imageId + '" name="' + name + '"/>' +
    "<pic:cNvPicPr/>" +
    "</pic:nvPicPr>" +
    "<pic:blipFill>" +
    '<a:blip r:embed="' + relationId + '"/>' +
    "<a:stretch><a:fillRect/></a:stretch>" +
    "</pic:blipFill>" +
    "<pic:spPr>" +
    '<a:xfrm><a:off x="0" y="0"/><a:ext cx="' + widthEmu + '" cy="' + heightEmu + '"/></a:xfrm>' +
    '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>' +
    "</pic:spPr>" +
    "</pic:pic>" +
    "</a:graphicData>" +
    "</a:graphic>" +
    "</wp:inline>" +
    "</w:drawing></w:r></w:p>"
  );
}

// ------------------------------------------------------------
// התחלה
// ------------------------------------------------------------

if (!fs.existsSync(BOOK)) {
  console.log("שגיאה: הספר המאוחד לא נמצא. הרץ קודם: node scripts/merge-book.js");
  process.exit(1);
}

if (!fs.existsSync(PUML_DIR)) {
  console.log("שגיאה: תיקיית ה-puml לא נמצאה. הרץ קודם: node scripts/export-diagrams.js");
  process.exit(1);
}

// רשימת התרשימים לפי סדר, מתוך שמות קובצי ה-puml
const names = fs
  .readdirSync(PUML_DIR)
  .filter(function (f) { return f.endsWith(".puml"); })
  .sort()
  .map(function (f) { return f.replace(/\.puml$/, ""); });

console.log("נמצאו " + names.length + " תרשימים בספר");
console.log("");

// אילו תמונות כבר מוכנות
const ready = [];
const notReady = [];

names.forEach(function (name, i) {
  const pngPath = path.join(PNG_DIR, name + ".png");

  if (fs.existsSync(pngPath)) {
    ready.push({ index: i, name: name, file: pngPath });
  } else {
    notReady.push(name);
  }
});

console.log("תמונות מוכנות : " + ready.length);
console.log("עדיין חסרות   : " + notReady.length);

if (ready.length === 0) {
  console.log("");
  console.log("אין מה להכניס עדיין.");
  console.log("שמור את התמונות ב: " + PNG_DIR);
  console.log("ההוראות המלאות:    docs/diagrams/README.md");
  process.exit(0);
}

console.log("");
console.log("קורא את הספר...");

let xml = readEntry("word/document.xml", TEMP_XML);
let rels = readEntry("word/_rels/document.xml.rels", TEMP_RELS);

// מאתר את כל בלוקי הקוד בספר, מ-@startuml עד @enduml
const paragraphs = xml.split("</w:p>");

function plainText(p) {
  return p.replace(/<[^>]+>/g, "").trim();
}

const blocks = [];
let start = -1;

for (let i = 0; i < paragraphs.length; i++) {
  const t = plainText(paragraphs[i]);

  if (t === "@startuml") {
    start = i;
  }

  if (t === "@enduml" && start > -1) {
    blocks.push({ from: start, to: i });
    start = -1;
  }
}

console.log("  נמצאו " + blocks.length + " בלוקי קוד בספר");

if (blocks.length !== names.length) {
  console.log("");
  console.log("  שים לב: מספר בלוקי הקוד בספר (" + blocks.length + ") שונה ממספר");
  console.log("  קובצי ה-puml (" + names.length + "). ייתכן שכבר הכנסת חלק מהתמונות.");
  console.log("  אם זה המצב, הרץ מחדש את merge-book.js ואז נסה שוב.");

  if (blocks.length < names.length) {
    process.exit(1);
  }
}

// מוצא את מספר הקשר הפנוי הבא
let maxRelation = 0;
const relationMatches = rels.match(/Id="rId(\d+)"/g) || [];

relationMatches.forEach(function (m) {
  const num = parseInt(m.match(/\d+/)[0]);
  if (num > maxRelation) {
    maxRelation = num;
  }
});

let maxDocPr = 0;
const docPrMatches = xml.match(/<wp:docPr id="(\d+)"/g) || [];

docPrMatches.forEach(function (m) {
  const num = parseInt(m.match(/\d+/)[0]);
  if (num > maxDocPr) {
    maxDocPr = num;
  }
});

console.log("");
console.log("מכניס את התמונות...");

// עובדים מהסוף להתחלה, כדי שמספרי הפסקאות לא יזוזו
const sorted = ready.slice().sort(function (a, b) { return b.index - a.index; });
const newRelations = [];
const imagesToAdd = [];

sorted.forEach(function (item, counter) {
  const block = blocks[item.index];

  if (!block) {
    console.log("  דילוג (לא נמצא בלוק): " + item.name);
    return;
  }

  const size = readPngSize(item.file);

  if (!size) {
    console.log("  דילוג (לא קובץ PNG תקין): " + item.name);
    return;
  }

  // המרה מפיקסלים ל-EMU, בהנחה של 96 נקודות לאינץ
  let widthEmu = Math.round((size.width / 96) * 914400);
  let heightEmu = Math.round((size.height / 96) * 914400);

  // הקטנה יחסית אם התמונה רחבה מדי לעמוד
  if (widthEmu > MAX_WIDTH_EMU) {
    const ratio = MAX_WIDTH_EMU / widthEmu;
    widthEmu = MAX_WIDTH_EMU;
    heightEmu = Math.round(heightEmu * ratio);
  }

  const relationId = "rId" + (maxRelation + counter + 1);
  const imageId = maxDocPr + counter + 1;
  const mediaName = "diagram" + (item.index + 1) + ".png";

  // מחליפים את כל הפסקאות של בלוק הקוד בפסקה אחת עם התמונה
  const howMany = block.to - block.from + 1;
  paragraphs.splice(
    block.from,
    howMany,
    imageParagraph(relationId, imageId, item.name, widthEmu, heightEmu).replace(/<\/w:p>$/, "")
  );

  newRelations.push(
    '<Relationship Id="' + relationId + '" ' +
    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" ' +
    'Target="media/' + mediaName + '"/>'
  );

  imagesToAdd.push({ entry: "word/media/" + mediaName, source: item.file });

  console.log(
    "  " + item.name + "  (" + size.width + "x" + size.height + " פיקסלים)"
  );
});

if (imagesToAdd.length === 0) {
  console.log("");
  console.log("לא הוכנסה אף תמונה.");
  process.exit(0);
}

// הרכבה מחדש
xml = paragraphs.join("</w:p>");

// הוספת הקשרים לקובץ הקשרים
rels = rels.replace("</Relationships>", newRelations.join("") + "</Relationships>");

console.log("");
console.log("שומר...");

fs.writeFileSync(TEMP_XML, xml, "utf8");
fs.writeFileSync(TEMP_RELS, rels, "utf8");

// קודם מוסיפים את קובצי התמונה, אחר כך את ה-XML
imagesToAdd.forEach(function (image) {
  addImageToZip(image.entry, image.source);
});

writeEntry("word/document.xml", TEMP_XML);
writeEntry("word/_rels/document.xml.rels", TEMP_RELS);

fs.unlinkSync(TEMP_XML);
fs.unlinkSync(TEMP_RELS);

console.log("");
console.log("===========================================");
console.log("  " + imagesToAdd.length + " תמונות הוכנסו לספר");
console.log("===========================================");

if (notReady.length > 0) {
  console.log("");
  console.log("  עדיין חסרות " + notReady.length + " תמונות:");
  notReady.forEach(function (n) {
    console.log("    - " + n + ".png");
  });
  console.log("");
  console.log("  אפשר להריץ שוב אחרי שתוסיף אותן.");
}

console.log("===========================================");
