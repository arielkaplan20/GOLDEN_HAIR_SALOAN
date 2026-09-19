// ============================================================
// המשך תוכן הפרקים שנוספים לספר
// כאן: טבלאות הבדיקות, מפרט SUC-12, תרשימי הרצף, ה-SDD ודפי האישור
// ============================================================

const H = require("./docx-helpers");

// ============================================================
// סעיף 14 - תכנון הבדיקות
// ============================================================

// הטבלה הזו שומרת על מבנה שלוש העמודות שכבר היה בספר המקורי -
// "מספר דרישה", "תיאור דרישה" ו"בדיקות תהליכיות במערכת" -
// ורק ממלאת את התאים שהיו ריקים.
const testPlanning =
  H.table(
    ["מספר דרישה", "תיאור דרישה", "בדיקות תהליכיות במערכת"],
    [
      ["1, 2", "האפליקציה פועלת בדפדפן במחשב ובנייד", "פתיחת האתר בדפדפן במחשב ובסמארטפון"],
      ["3", "כניסת משתמש קיים עם דוא״ל וסיסמה", "התחברות עם פרטים תקינים"],
      ["4", "הודעה בעת פרטי התחברות שגויים", "התחברות עם סיסמה שגויה, ועם כתובת שאינה רשומה"],
      ["5", "הרשמת משתמש חדש עם כל הפרטים", "הרשמה מלאה ותקינה של משתמש חדש"],
      ["6", "התראה כאשר הסיסמאות אינן תואמות", "הזנת שתי סיסמאות שונות בטופס ההרשמה"],
      ["7", "חסימת התקדמות כאשר שדה חובה ריק", "ניסיון הרשמה עם שדה ריק"],
      ["8", "הודעת אישור והעברה לדף הכניסה", "השלמת הרשמה תקינה ובדיקת ההפניה"],
      ["9", "הפניה לממשק המותאם לפי הרשאות", "התחברות כלקוח, כנותן שירות וכמנהל"],
      ["10", "הצגת ״שלום [שם הלקוח]״ והתפריט הראשי", "בדיקת דף הבית לאחר התחברות לקוח"],
      ["11", "בחירת ספר, תאריך ושעה פנויה בלבד", "ביצוע הזמנת תור מלאה, ובדיקה ששעה תפוסה אינה מוצגת"],
      ["12", "קביעת התור במערכת ושליחת אישור", "אישור הזמנה ובדיקת הודעת האישור"],
      ["13", "הצגת התורים הקיימים או הודעה מתאימה", "כניסה ל״התורים שלי״ עם תורים וללא תורים"],
      ["14", "שינוי תור למועד ושעה אחרים", "שינוי תור קיים וקבלת הודעת אישור"],
      ["15", "התור הישן מתפנה באופן מיידי", "בדיקה שהמועד הישן חזר להיות פנוי לשאר הלקוחות"],
      ["16", "ביטול תור וקבלת הודעת אישור", "ביטול תור קיים, כולל חלון האישור"],
      ["17", "הצגת מוצרים בכרטיסיות והוספה לסל", "כניסה לחנות, בחירת כמות והוספת מוצר לסל"],
      ["18", "סקירת הסל ובחירה בין איסוף למשלוח", "כניסה ל״הסל שלי״ ומעבר לתשלום"],
      ["19", "מילוי פרטי איסוף עצמי", "בחירת איסוף עצמי ומילוי כל הפרטים הנדרשים"],
      ["20", "מילוי פרטים וכתובת למשלוח", "בחירת משלוח ומילוי כתובת מלאה"],
      ["21", "תשלום מאובטח וקבלת מספר הזמנה", "תשלום עם פרטי אשראי תקינים, ועם פרטים שגויים"],
      ["22", "צפייה בהזמנות קודמות והזמנה חוזרת", "כניסה להזמנות קודמות וביצוע הזמנה חוזרת"],
      ["23", "עדכון פרטים אישיים בפרופיל", "שינוי פרט בפרופיל האישי ושמירתו"],
      ["24", "מתן הרשאות לנותני שירות", "כניסה כמנהל והענקת הרשאת נותן שירות ללקוח"],
      ["25", "צפייה וניהול כלל התורים במערכת", "כניסה כמנהל למסך ניהול התורים"],
      ["26", "ניהול מוצרים וצפייה בכל ההזמנות", "הוספה, עדכון ומחיקה של מוצר, וצפייה ברשימת ההזמנות"],
      ["27", "נותן שירות רואה את תוריו בלבד", "כניסה כספר ובדיקה שמוצגים רק התורים שנקבעו אליו"],
      ["28", "עריכת שעות וימי העבודה של הספר", "שינוי שעות עבודה ובדיקת ההשפעה על השעות הפנויות"],
      ["כללי", "הרשאות - חסימת גישה לא מורשית", "ניסיון גישה למסך מנהל בהיות המשתמש לקוח"],
      ["כללי", "התנתקות מהמערכת", "לחיצה על התנתקות ובדיקת החזרה לדף הכניסה"],
    ],
    [14, 36, 50]
  ) +
  H.h2("14.1\tבדיקות יחידה (Unit Test)") +
  H.table(
    ["מס׳", "הבדיקה", "מה נבדק", "בוצע בתאריך", "תוצאות"],
    [
      ["1", "מסך הרשמה", "הצגת כל השדות וולידציה של כל שדה", "", ""],
      ["2", "מסך התחברות", "הצגת השדות והודעות השגיאה", "", ""],
      ["3", "דף הבית - לקוח", "הצגת שם הלקוח וכל פריטי התפריט", "", ""],
      ["4", "מסך בחירת ספר", "הצגת רשימת נותני השירות", "", ""],
      ["5", "רכיב לוח השנה", "בחירת תאריך ומעבר בין חודשים", "", ""],
      ["6", "רכיב בחירת שעה", "הצגת שעות פנויות בלבד", "", ""],
      ["7", "מסך ״התורים שלי״", "הצגת התורים וכפתורי שינוי וביטול", "", ""],
      ["8", "מסך החנות", "הצגת כרטיסיות המוצרים", "", ""],
      ["9", "מסך מוצר בודד", "תיאור, בחירת כמות והוספה לסל", "", ""],
      ["10", "מסך ״הסל שלי״", "הצגת המוצרים וחישוב המחיר הכולל", "", ""],
      ["11", "מסך התשלום", "שדות האשראי וולידציה", "", ""],
      ["12", "מסך פרופיל אישי", "טעינת הפרטים הקיימים ושמירת שינוי", "", ""],
      ["13", "מסך יומן הספר", "הצגת התורים של הספר המחובר בלבד", "", ""],
      ["14", "מסך שעות עבודה", "עריכה ושמירה של ימים ושעות", "", ""],
      ["15", "מסך ניהול משתמשים", "הצגת המשתמשים ושינוי הרשאה", "", ""],
      ["16", "מסך ניהול מוצרים", "הוספה, עריכה ומחיקה של מוצר", "", ""],
      ["17", "פונקציית חישוב שעות פנויות", "החזרת השעות הנכונות בכל תרחיש", "", ""],
      ["18", "פונקציית בדיקת חפיפה", "זיהוי נכון של התנגשות בין תורים", "", ""],
    ],
    [6, 24, 40, 16, 14]
  ) +
  H.note(
    "העמודות הריקות - למלא רק אחרי בדיקה בפועל",
    "העמודות ״בוצע בתאריך״ ו״תוצאות״ הושארו ריקות בכוונה. אלה תוצאות שצריך למדוד באמת " +
    "אחרי הרצת המערכת. אל תמלא אותן לפני שבדקת."
  );

// ============================================================
// SUC-12 - מפרט מלא
// ============================================================

const suc12 =
  H.h3("SUC-12 - ניהול החנות וההזמנות") +
  H.sucTable([
    ["שחקנים ויעדים", "מנהל ראשי"],
    ["ב״ע ואינטרסים", "מנהל ראשי, לקוח"],
    ["pre-conditions", "המנהל הראשי מחובר למערכת ונמצא בממשק מנהל"],
    ["post-conditions", "מוצרי החנות עודכנו במסד הנתונים, או שרשימת ההזמנות הוצגה למנהל"],
    ["trigger", "המנהל הראשי בוחר באפשרות ״ניהול חנות״"],
    ["MSS", [
      "1. המנהל הראשי לוחץ על אפשרות ״ניהול חנות״.",
      "2. המערכת שולפת ומציגה את רשימת המוצרים הקיימים ממסד הנתונים.",
      "3. המנהל הראשי בוחר את הפעולה הרצויה: הוספת מוצר, עדכון מוצר או מחיקת מוצר.",
      "4. המנהל הראשי מזין את פרטי המוצר (שם, תיאור, מחיר, כמות במלאי ותמונה).",
      "5. המערכת מוודאת שהפרטים שהוזנו תקינים ומלאים.",
      "6. המערכת מעדכנת את המוצר במסד הנתונים.",
      "7. המערכת מציגה הודעת אישור על ביצוע הפעולה.",
      "8. המנהל הראשי בוחר באפשרות ״צפייה בהזמנות״.",
      "9. המערכת שולפת ומציגה את כל ההזמנות הקיימות במערכת.",
    ]],
    ["הסתעפות א׳", [
      "חריגה מצעד 5 של MSS: פרטי המוצר אינם תקינים או שחסרים שדות חובה.",
      "5א.1 המערכת מציגה הודעת שגיאה ומציינת את הפרטים שאינם תקינים או חסרים.",
      "5א.2 חזרה לצעד 4.",
    ]],
    ["הסתעפות ב׳", [
      "חריגה מצעד 3 של MSS: המנהל בחר במחיקת מוצר.",
      "3ב.1 המערכת מציגה חלון אישור מחיקה.",
      "3ב.2 אם המנהל מאשר - המערכת מוחקת את המוצר ומציגה הודעת אישור.",
      "3ב.3 אם המנהל אינו מאשר - התהליך מסתיים ללא ביצוע שינוי.",
    ]],
    ["הסתעפות ג׳", [
      "חריגה מצעד 9 של MSS: לא קיימות הזמנות במערכת.",
      "9ג.1 המערכת מציגה הודעה ״אין הזמנות קיימות״.",
    ]],
    ["עקביות לדרישות", "תפעוליות: 26"],
  ]) +
  H.diagram(
    "תרשים פעילות ל-SUC-12",
    "בספר, אחרי כל מפרט SUC מופיע תרשים פעילות. זהו התרשים המתאים ל-SUC-12.",
    [
      "@startuml", "start",
      ':Admin clicks "Shop Management";',
      ":System loads products from DB;",
      "if (Which action?) then (Add / Update)",
      "  :Admin enters product details;",
      "  if (Details valid?) then (yes)",
      "    :System saves product to DB;",
      "    :Show success message;",
      "  else (no)",
      "    :Show error message;",
      "    :Return to details form;",
      "  endif",
      "else (Delete)",
      "  :Show delete confirmation;",
      "  if (Confirmed?) then (yes)",
      "    :System deletes product;",
      "    :Show success message;",
      "  else (no)",
      "    :No change;",
      "  endif",
      "endif",
      ':Admin opens "View Orders";',
      "if (Orders exist?) then (yes)",
      "  :Display all orders;",
      "else (no)",
      '  :Show "No existing orders";',
      "endif",
      "stop", "@enduml",
    ]
  );

// ============================================================
// תיקונים ל-SUC-7 ו-SUC-9
// ============================================================

const sucFixes =
  H.h1("תוספות למפרטי SUC קיימים") +
  H.note(
    "שים לב - זה לא פרק חדש",
    "שני התיקונים הבאים שייכים למפרטי SUC-7 ו-SUC-9 שכבר נמצאים בפרק ה-SRS למעלה. " +
    "הם מופיעים כאן בנפרד כדי שתוכל להעתיק אותם אל תוך המפרטים הקיימים. אחרי שתעשה זאת, " +
    "מחק את העמוד הזה."
  ) +

  H.h3("תוספת ל-SUC-7 - הזמנה חוזרת") +
  H.p(
    "דרישה 22 (״הלקוח יכול לצפות בהזמנות קודמות בחנות ולבצע הזמנה חוזרת״) מצוינת " +
    "ב״עקביות לדרישות״ של SUC-7, אך אין לה צעד ב-MSS שמממש אותה. יש להוסיף את " +
    "ההסתעפויות הבאות למפרט הקיים:"
  ) +
  H.sucTable([
    ["הסתעפות ג׳", [
      "החלפה לצעד 1 של MSS: הלקוח בוחר לבצע הזמנה חוזרת.",
      "1ג.1 הלקוח נכנס לאזור ״ההזמנות שלי״.",
      "1ג.2 המערכת שולפת ומציגה את ההזמנות הקודמות של הלקוח.",
      "1ג.3 הלקוח לוחץ על כפתור ״הזמן שוב״ ליד ההזמנה הרצויה.",
      "1ג.4 המערכת מוסיפה את כל מוצרי ההזמנה לסל הקניות.",
      "1ג.5 המשך לצעד 2 של MSS.",
    ]],
    ["הסתעפות ד׳", [
      "חריגה מצעד 1ג.2: לא קיימות הזמנות קודמות עבור הלקוח.",
      "1ד.1 המערכת מציגה הודעה ״אין הזמנות קודמות״.",
      "1ד.2 חזרה לצעד 1 (חנות המוצרים).",
    ]],
  ]) +

  H.h3("תיקון ל-SUC-9 - הוספת עריכת שעות עבודה") +
  H.p(
    "שם התהליך הוא ״ניהול יומן ושעות עבודה״, אך ה-MSS הקיים מתאר צפייה ביומן בלבד. " +
    "עריכת השעות, שהיא דרישה 28, אינה מופיעה. יש להחליף את השורות הבאות במפרט SUC-9:"
  ) +
  H.sucTable([
    ["post-conditions", "יומן התורים הוצג לנותן השירות, ו/או ימי ושעות העבודה שלו עודכנו במסד הנתונים"],
    ["MSS", [
      "1. נותן השירות נכנס לאזור ״יומן תורים״.",
      "2. המערכת שולפת ממסד הנתונים אך ורק את התורים שנקבעו אליו.",
      "3. המערכת בודקת ומציגה את פירוט התורים הקיימים.",
      "4. נותן השירות בוחר באפשרות ״עריכת שעות עבודה״.",
      "5. המערכת מציגה את ימי ושעות העבודה הנוכחיים שלו.",
      "6. נותן השירות מסמן את הימים שבהם הוא עובד ומזין שעת פתיחה ושעת סגירה לכל יום.",
      "7. נותן השירות לוחץ על כפתור ״שמירה״.",
      "8. המערכת מוודאת שהשעות תקינות ושעת הסגירה מאוחרת משעת הפתיחה.",
      "9. המערכת מעדכנת את ימי ושעות העבודה במסד הנתונים ומציגה הודעת אישור.",
    ]],
    ["הסתעפות א׳", [
      "חריגה מצעד 3 של MSS: לא נקבעו תורים עבור הספר.",
      "3א.1 המערכת מציגה הודעה ״לא נקבעו תורים עדיין״.",
    ]],
    ["הסתעפות ב׳", [
      "חריגה מצעד 8 של MSS: השעות שהוזנו אינן תקינות.",
      "8ב.1 המערכת מציגה הודעת שגיאה מתאימה.",
      "8ב.2 חזרה לצעד 6.",
    ]],
    ["הסתעפות ג׳", [
      "חריגה מצעד 9 של MSS: קיימים תורים בשעות שיצאו מטווח העבודה החדש.",
      "9ג.1 המערכת מציגה התראה ומפרטת את התורים המושפעים.",
      "9ג.2 נותן השירות מאשר או מבטל את השינוי.",
    ]],
    ["עקביות לדרישות", "תפעוליות: 27, 28"],
  ]) +
  H.pageBreak();

// ============================================================
// SAD סעיף 5 - תרשימי רצף
// ============================================================

function seq(title, description, lines) {
  return H.diagram(title, description, lines);
}

const sequenceDiagrams =
  H.h1("5. תרשימי רצף לתהליכי מערכת (Sequence Diagrams)") +
  H.p(
    "תרשים רצף מתאר את סדר ההודעות העוברות בין רכיבי המערכת במהלך ביצוע תהליך. השחקנים " +
    "בכל התרשימים הם: המשתמש, הממשק הגרפי (GUI), רכיב הניהול הרלוונטי בשרת, ומסד הנתונים."
  ) +
  H.note(
    "איך להפוך את הקוד לתמונה",
    "לכל תרשים מצורף קוד מקור בשפת PlantUML. כדי לייצר את התמונה: היכנס לאתר plantuml.com, " +
    "הדבק את הקוד בתיבה ולחץ Submit. לאחר מכן שמור את התמונה והדבק אותה כאן במקום הקוד."
  ) +

  seq("SUC-1 - הרשמה לאפליקציה",
    "המשתמש מזין פרטים, השרת מוודא תקינות, מצפין את הסיסמה ושומר את המשתמש החדש.",
    ["@startuml", "actor User", "participant GUI", 'participant "Users Manager" as UM',
     'database "Users DB" as DB', "",
     "User -> GUI : enter personal details",
     'User -> GUI : click "Finish Registration"',
     "GUI -> UM : sendRegistrationData()",
     "UM -> UM : validate fields and password match",
     "alt details are valid",
     "  UM -> UM : hash password (bcrypt)",
     "  UM -> DB : saveNewUser()",
     "  DB --> UM : saved successfully",
     "  UM --> GUI : registration success",
     "  GUI --> User : show confirmation, go to login page",
     "else details invalid",
     "  UM --> GUI : validation errors",
     "  GUI --> User : show error message",
     "end", "@enduml"]) +

  seq("SUC-2 - התחברות לאפליקציה",
    "המשתמש מזין דואר אלקטרוני וסיסמה, השרת מאמת מול מסד הנתונים ומנפיק אסימון JWT הכולל את תפקיד המשתמש.",
    ["@startuml", "actor User", "participant GUI", 'participant "Users Manager" as UM',
     'database "Users DB" as DB', "",
     "User -> GUI : enter email and password",
     'User -> GUI : click "Login"',
     "GUI -> UM : sendLoginData()",
     "UM -> DB : findUserByEmail()",
     "DB --> UM : user record",
     "UM -> UM : compare password hash",
     "alt credentials correct",
     "  UM -> UM : create JWT token with role",
     "  UM --> GUI : token + user role",
     "  GUI --> User : open interface by role",
     "else credentials wrong",
     "  UM --> GUI : authentication failed",
     "  GUI --> User : show error message",
     "end", "@enduml"]) +

  seq("SUC-3 - הזמנת תור",
    "התהליך המרכזי במערכת. שים לב לשתי הפניות למסד הנתונים: אחת לחישוב השעות הפנויות, ושנייה לבדיקה חוזרת לפני השמירה, כדי למנוע התנגשות בין שני לקוחות.",
    ["@startuml", "actor Customer", "participant GUI",
     'participant "Appointments Manager" as AM',
     'database "Appointments DB" as ADB',
     'database "ServiceProviders DB" as SDB', "",
     "Customer -> GUI : choose barber",
     "Customer -> GUI : choose date from calendar",
     "GUI -> AM : getFreeSlots(barberId, date)",
     "AM -> SDB : getWorkingHours(barberId, day)",
     "SDB --> AM : open and close time",
     "AM -> ADB : getAppointments(barberId, date)",
     "ADB --> AM : taken appointments",
     "AM -> AM : calculate free slots",
     "alt free slots exist",
     "  AM --> GUI : list of free hours",
     "  GUI --> Customer : show free hours only",
     "  Customer -> GUI : choose hour and confirm",
     "  GUI -> AM : bookAppointment()",
     "  AM -> ADB : check slot still free",
     "  ADB --> AM : still free",
     "  AM -> ADB : saveAppointment()",
     "  AM --> GUI : booking confirmed",
     "  GUI --> Customer : show confirmation",
     "else no free slots",
     "  AM --> GUI : empty list",
     '  GUI --> Customer : "No free hours on this date"',
     "end", "@enduml"]) +

  seq("SUC-4 - צפייה בתורים קיימים",
    "שליפת התורים העתידיים של הלקוח המחובר בלבד.",
    ["@startuml", "actor Customer", "participant GUI",
     'participant "Appointments Manager" as AM',
     'database "Appointments DB" as DB', "",
     'Customer -> GUI : open "My Appointments"',
     "GUI -> AM : getMyAppointments(customerId)",
     "AM -> DB : findFutureAppointments(customerId)",
     "DB --> AM : appointments list",
     "alt appointments exist",
     "  AM --> GUI : appointments details",
     "  GUI --> Customer : display appointments",
     "else no appointments",
     "  AM --> GUI : empty list",
     '  GUI --> Customer : "No existing appointments"',
     "end", "@enduml"]) +

  seq("SUC-5 - שינוי תור",
    "המועד הישן משתחרר והחדש נתפס. שתי הפעולות חייבות להתבצע יחד - אם אחת נכשלת, אף אחת לא מתבצעת.",
    ["@startuml", "actor Customer", "participant GUI",
     'participant "Appointments Manager" as AM',
     'database "Appointments DB" as DB', "",
     'Customer -> GUI : open "Change Appointment"',
     "GUI -> AM : getMyAppointments(customerId)",
     "AM -> DB : findAppointments(customerId)",
     "DB --> AM : appointments list",
     "AM --> GUI : display list",
     'Customer -> GUI : click "Change" on an appointment',
     "Customer -> GUI : choose new date",
     "GUI -> AM : getFreeSlots(barberId, newDate)",
     "AM -> DB : getAppointments(barberId, newDate)",
     "DB --> AM : taken appointments",
     "AM -> AM : calculate free slots",
     "AM --> GUI : free hours",
     "Customer -> GUI : choose new hour and confirm",
     "GUI -> AM : updateAppointment()",
     "AM -> DB : release old slot",
     "AM -> DB : save new slot",
     "DB --> AM : updated",
     "AM --> GUI : change confirmed",
     "GUI --> Customer : show confirmation", "@enduml"]) +

  seq("SUC-6 - ביטול תור",
    "כולל חלון אישור. אם הלקוח אינו מאשר, התור נשאר במערכת ללא שינוי.",
    ["@startuml", "actor Customer", "participant GUI",
     'participant "Appointments Manager" as AM',
     'database "Appointments DB" as DB', "",
     'Customer -> GUI : open "Cancel Appointment"',
     "GUI -> AM : getMyAppointments(customerId)",
     "AM -> DB : findAppointments(customerId)",
     "DB --> AM : appointments list",
     "AM --> GUI : display list",
     'Customer -> GUI : click "Cancel" on an appointment',
     "GUI --> Customer : show confirmation dialog",
     "alt customer confirms",
     '  Customer -> GUI : click "Yes"',
     "  GUI -> AM : cancelAppointment(appointmentId)",
     "  AM -> DB : deleteAppointment()",
     "  DB --> AM : deleted, slot released",
     "  AM --> GUI : cancellation confirmed",
     "  GUI --> Customer : show confirmation",
     "else customer declines",
     '  Customer -> GUI : click "No"',
     "  GUI --> Customer : no change made",
     "end", "@enduml"]) +

  seq("SUC-7 - רכישה בחנות האפליקציה",
    "התהליך הארוך ביותר. שים לב שפרטי האשראי עוברים לשירות הסליקה החיצוני ואינם נשמרים במסד הנתונים.",
    ["@startuml", "actor Customer", "participant GUI",
     'participant "Shop Manager" as SM', 'database "Shop DB" as DB',
     'participant "Payment Service" as PAY', "",
     "Customer -> GUI : browse products",
     "GUI -> SM : getProducts()",
     "SM -> DB : findAllProducts()",
     "DB --> SM : products list",
     "SM --> GUI : products",
     "Customer -> GUI : choose product and quantity",
     'Customer -> GUI : click "Add to Cart"',
     'Customer -> GUI : open "My Cart"',
     'Customer -> GUI : click "Checkout"',
     "Customer -> GUI : choose pickup or delivery",
     "Customer -> GUI : enter order details",
     "Customer -> GUI : enter credit card details",
     "GUI -> SM : submitOrder()",
     "SM -> PAY : processPayment(card details)",
     "alt payment approved",
     "  PAY --> SM : approved + transaction id",
     "  SM -> DB : saveOrder()",
     "  SM -> DB : updateStock()",
     "  DB --> SM : saved",
     "  SM --> GUI : order number",
     "  GUI --> Customer : confirmation + order number",
     "else payment declined",
     "  PAY --> SM : declined",
     "  SM --> GUI : payment failed",
     '  GUI --> Customer : "Payment failed, please try again"',
     "end", "@enduml"]) +

  seq("SUC-8 - עדכון פרופיל אישי",
    "רלוונטי לכל סוגי המשתמשים.",
    ["@startuml", "actor User", "participant GUI",
     'participant "Users Manager" as UM', 'database "Users DB" as DB', "",
     'User -> GUI : open "My Profile"',
     "GUI -> UM : getUserDetails(userId)",
     "UM -> DB : findUser(userId)",
     "DB --> UM : user details",
     "UM --> GUI : details",
     "GUI --> User : display current details",
     "User -> GUI : edit details",
     'User -> GUI : click "Save"',
     "GUI -> UM : updateProfile()",
     "UM -> UM : validate fields",
     "alt valid",
     "  UM -> DB : updateUser()",
     "  DB --> UM : updated",
     "  UM --> GUI : update success",
     "  GUI --> User : show confirmation",
     "else invalid",
     "  UM --> GUI : validation error",
     "  GUI --> User : show error message",
     "end", "@enduml"]) +

  seq("SUC-9 - ניהול יומן ושעות עבודה",
    "כולל את החלק שחסר במפרט המקורי: עריכת ימי ושעות העבודה.",
    ["@startuml", "actor Barber", "participant GUI",
     'participant "Schedule Manager" as SCM',
     'database "Appointments DB" as ADB',
     'database "ServiceProviders DB" as SDB', "",
     'Barber -> GUI : open "Appointments Calendar"',
     "GUI -> SCM : getMyCalendar(barberId)",
     "SCM -> ADB : findAppointments(barberId)",
     "ADB --> SCM : appointments of this barber only",
     "SCM --> GUI : calendar data",
     "GUI --> Barber : display calendar",
     'Barber -> GUI : open "Edit Working Hours"',
     "GUI -> SCM : getWorkingHours(barberId)",
     "SCM -> SDB : findProvider(barberId)",
     "SDB --> SCM : current working hours",
     "SCM --> GUI : working hours",
     "Barber -> GUI : set days and hours",
     'Barber -> GUI : click "Save"',
     "GUI -> SCM : updateWorkingHours()",
     "SCM -> SCM : validate close time after open time",
     "SCM -> SDB : saveWorkingHours()",
     "SDB --> SCM : saved",
     "SCM --> GUI : update confirmed",
     "GUI --> Barber : show confirmation", "@enduml"]) +

  seq("SUC-10 - ניהול משתמשים והרשאות",
    "כולל חלון אישור לפני שינוי הרשאה.",
    ["@startuml", "actor Admin", "participant GUI",
     'participant "Users Manager" as UM', 'database "Users DB" as DB', "",
     'Admin -> GUI : open "User Management"',
     "GUI -> UM : getAllUsers()",
     "UM -> DB : findAllUsers()",
     "DB --> UM : users list",
     "UM --> GUI : users",
     "GUI --> Admin : display users list",
     "Admin -> GUI : select user and change role",
     "GUI --> Admin : show confirmation dialog",
     "alt admin confirms",
     '  Admin -> GUI : click "Yes"',
     "  GUI -> UM : updateUserRole()",
     "  UM -> DB : saveRole()",
     "  DB --> UM : updated",
     "  UM --> GUI : role updated",
     "  GUI --> Admin : show confirmation",
     "else admin declines",
     "  GUI --> Admin : no change made",
     "end", "@enduml"]) +

  seq("SUC-11 - ניהול תורים כולל",
    "המנהל רואה את כל התורים במערכת, בניגוד לספר שרואה את שלו בלבד.",
    ["@startuml", "actor Admin", "participant GUI",
     'participant "Appointments Manager" as AM',
     'database "Appointments DB" as DB', "",
     'Admin -> GUI : open "Appointments Management"',
     "GUI -> AM : getAllAppointments()",
     "AM -> DB : findAllAppointments()",
     "DB --> AM : all appointments in system",
     "alt appointments exist",
     "  AM --> GUI : appointments details",
     "  GUI --> Admin : display all appointments",
     "else none",
     "  AM --> GUI : empty list",
     '  GUI --> Admin : "No existing appointments"',
     "end", "@enduml"]) +

  seq("SUC-12 - ניהול החנות וההזמנות",
    "התהליך שמפרטו נוסף בפרק ה-SRS.",
    ["@startuml", "actor Admin", "participant GUI",
     'participant "Shop Manager" as SM', 'database "Shop DB" as DB', "",
     'Admin -> GUI : open "Shop Management"',
     "GUI -> SM : getProducts()",
     "SM -> DB : findAllProducts()",
     "DB --> SM : products list",
     "SM --> GUI : products",
     "GUI --> Admin : display products",
     "Admin -> GUI : add / update / delete product",
     "GUI -> SM : saveProduct()",
     "SM -> SM : validate product details",
     "alt valid",
     "  SM -> DB : saveProduct()",
     "  DB --> SM : saved",
     "  SM --> GUI : success",
     "  GUI --> Admin : show confirmation",
     "else invalid",
     "  SM --> GUI : validation error",
     "  GUI --> Admin : show error message",
     "end",
     'Admin -> GUI : open "View Orders"',
     "GUI -> SM : getAllOrders()",
     "SM -> DB : findAllOrders()",
     "DB --> SM : orders list",
     "SM --> GUI : orders",
     "GUI --> Admin : display all orders", "@enduml"]) +
  H.pageBreak();

module.exports = { testPlanning, suc12, sucFixes, sequenceDiagrams };
