// ============================================================
// רינדור התרשימים לתמונות PNG - מקומית
//
// הרצה: node scripts/render-diagrams.js
//
// הסקריפט מריץ את PlantUML על כל קובצי ה-puml
// ושומר את התמונות ב-docs/diagrams/png/
//
// הכול רץ על המחשב המקומי. שום דבר לא נשלח לרשת.
//
// דרישות: Java מותקן, ו-tools/plantuml.jar קיים.
// ============================================================

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PUML_DIR = path.join(ROOT, "docs", "diagrams", "puml");
const PNG_DIR = path.join(ROOT, "docs", "diagrams", "png");
const JAR = path.join(ROOT, "tools", "plantuml.jar");

// ------------------------------------------------------------
// איתור Java
//
// במחשב הזה Java מותקנת דרך IntelliJ ולא נמצאת ב-PATH,
// לכן מחפשים אותה גם בתיקיית .jdks
// ------------------------------------------------------------

function findJava() {
  // קודם מנסים את מה שנמצא ב-PATH
  try {
    execFileSync("java", ["-version"], { stdio: "ignore" });
    return "java";
  } catch (error) {
    // לא נמצא, ממשיכים לחפש
  }

  // JAVA_HOME
  if (process.env.JAVA_HOME) {
    const fromHome = path.join(process.env.JAVA_HOME, "bin", "java.exe");
    if (fs.existsSync(fromHome)) {
      return fromHome;
    }
  }

  // תיקיית ה-JDK של IntelliJ
  const jdksDir = path.join(process.env.USERPROFILE || "", ".jdks");

  if (fs.existsSync(jdksDir)) {
    const versions = fs.readdirSync(jdksDir).sort().reverse();

    for (let i = 0; i < versions.length; i++) {
      const candidate = path.join(jdksDir, versions[i], "bin", "java.exe");
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

// ------------------------------------------------------------
// התחלה
// ------------------------------------------------------------

const java = findJava();

if (!java) {
  console.log("שגיאה: לא נמצאה התקנת Java.");
  console.log("אפשר להוריד מ-https://adoptium.net/ או לרנדר באתר plantuml.com");
  process.exit(1);
}

console.log("Java: " + java);

if (!fs.existsSync(JAR)) {
  console.log("");
  console.log("שגיאה: הקובץ tools/plantuml.jar לא נמצא.");
  console.log("הורד אותו מ-https://github.com/plantuml/plantuml/releases");
  console.log("ושמור בתיקייה tools/ בשם plantuml.jar");
  process.exit(1);
}

if (!fs.existsSync(PUML_DIR)) {
  console.log("");
  console.log("שגיאה: תיקיית ה-puml לא נמצאה.");
  console.log("הרץ קודם: node scripts/export-diagrams.js");
  process.exit(1);
}

if (!fs.existsSync(PNG_DIR)) {
  fs.mkdirSync(PNG_DIR, { recursive: true });
}

const files = fs
  .readdirSync(PUML_DIR)
  .filter(function (f) { return f.endsWith(".puml"); })
  .sort();

console.log("נמצאו " + files.length + " קובצי puml");
console.log("");
console.log("מרנדר...");

let done = 0;
let failed = 0;

files.forEach(function (file) {
  const source = path.join(PUML_DIR, file);
  const expected = path.join(PNG_DIR, file.replace(/\.puml$/, ".png"));

  try {
    execFileSync(
      java,
      [
        "-Djava.awt.headless=true",
        "-Dfile.encoding=UTF-8",
        "-jar", JAR,
        "-tpng",
        "-charset", "UTF-8",
        "-o", PNG_DIR,
        source,
      ],
      { stdio: ["ignore", "pipe", "pipe"], timeout: 120000 }
    );

    if (fs.existsSync(expected)) {
      const size = Math.round(fs.statSync(expected).size / 1024);
      console.log("  " + file.replace(/\.puml$/, "") + "  (" + size + " KB)");
      done++;
    } else {
      console.log("  נכשל (לא נוצרה תמונה): " + file);
      failed++;
    }
  } catch (error) {
    console.log("  נכשל: " + file);
    console.log("    " + String(error.stderr || error.message).split("\n")[0]);
    failed++;
  }
});

console.log("");
console.log("===========================================");
console.log("  רונדרו " + done + " תרשימים" + (failed ? ", נכשלו " + failed : ""));
console.log("===========================================");
console.log("  " + PNG_DIR);

if (done > 0) {
  console.log("");
  console.log("  השלב הבא - להכניס אותם לספר:");
  console.log("    node scripts/insert-diagrams.js");
}

console.log("===========================================");

if (failed > 0) {
  process.exitCode = 1;
}
