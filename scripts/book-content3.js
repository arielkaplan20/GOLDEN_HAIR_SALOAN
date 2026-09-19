// ============================================================
// החלק האחרון של הספר:
// מפרט תכן תוכנה (SDD), פרק הבדיקות, מסכי האפליקציה ודפי האישור
// ============================================================

const H = require("./docx-helpers");

// ============================================================
// SDD - מפרט תכן תוכנה
// ============================================================

const sdd =
  H.p("מפרט תכן תוכנה", { bold: true, size: 40, align: "center", after: 60, before: 400 }) +
  H.p("Software Design Document (SDD)", { bold: true, size: 32, align: "center", after: 400 }) +
  H.p("שם הפרויקט: GOLDEN HAIR SALON", { bold: true, after: 60 }) +
  H.p("המחבר/ים: אריאל יצחק קפלן", { after: 60 }) +
  H.p("מקורות:", { bold: true, after: 60 }) +
  H.bullet("סיפור הלקוח - GOLDEN HAIR SALON - Client Story") +
  H.bullet("טבלת דרישות - GOLDEN HAIR SALON - Requirements Table") +
  H.bullet("מפרט דרישות מערכת/תוכנה - GOLDEN HAIR SALON - SRS") +
  H.bullet("מפרט ארכיטקטורת תוכנה - GOLDEN HAIR SALON - SAD") +
  H.blank() +

  H.h1("6. מודל ישויות במרחב הבעיה (PDOM)") +
  H.p(
    "מודל הישויות מתאר את העצמים המרכזיים בעולם הבעיה - המספרה - ואת הקשרים ביניהם, " +
    "עוד לפני שמדובר במימוש טכני."
  ) +

  H.h2("6.1\tהישויות במערכת") +
  H.table(
    ["הישות", "תיאור", "תכונות עיקריות"],
    [
      ["User", "משתמש במערכת. ישות האב לשלושת סוגי המשתמשים", "firstName, lastName, email, password, address, birthDate, phone, role"],
      ["Customer", "לקוח המספרה. יורש מ-User", "appointments, orders"],
      ["ServiceProvider", "נותן שירות (ספר). יורש מ-User", "workingHours, appointments"],
      ["Admin", "מנהל ראשי. יורש מ-User", "הרשאות ניהול מלאות"],
      ["Appointment", "תור שנקבע במספרה", "customerId, barberId, date, startTime, duration, serviceType, status"],
      ["WorkingHours", "ימי ושעות העבודה של ספר", "dayOfWeek, openTime, closeTime, isClosed"],
      ["Product", "מוצר הנמכר בחנות", "name, description, price, stock, imageUrl"],
      ["CartItem", "פריט בסל הקניות", "productId, quantity, priceAtPurchase"],
      ["Order", "הזמנה שבוצעה בחנות", "orderNumber, customerId, items, totalPrice, deliveryType, address, status, orderDate"],
    ],
    [16, 34, 50]
  ) +

  H.h2("6.2\tPDOM כתרשים קונספטואלי (מפה סמנטית)") +
  H.diagram(
    "התרשים",
    "התרשים מציג את הישויות ואת היחסים ביניהן: אילו ישויות מכילות אחרות, ומה מספר המופעים בכל צד של הקשר.",
    ["@startuml", "skinparam backgroundColor white", "hide methods", "",
     "class User", "class Customer", "class ServiceProvider", "class Admin",
     "class Appointment", "class WorkingHours", "class Product",
     "class CartItem", "class Order", "",
     "User <|-- Customer", "User <|-- ServiceProvider", "User <|-- Admin", "",
     'Customer "1" -- "0..*" Appointment : books >',
     'ServiceProvider "1" -- "0..*" Appointment : serves >',
     'ServiceProvider "1" *-- "0..7" WorkingHours : defines >',
     'Customer "1" -- "0..*" Order : places >',
     'Order "1" *-- "1..*" CartItem : contains >',
     'CartItem "0..*" -- "1" Product : refers to >',
     'Admin "1" -- "0..*" Product : manages >',
     "@enduml"]
  ) +

  H.h2("6.3\tPDOM כאוסף מחלקות תשתית") +
  H.diagram(
    "התרשים",
    "אותן ישויות, הפעם עם התכונות המלאות שלהן. זהו הבסיס למבנה האוספים במסד הנתונים.",
    ["@startuml", "skinparam backgroundColor white", "hide methods", "",
     "class User {", "  +String firstName", "  +String lastName",
     "  +String email", "  +String password", "  +String address",
     "  +Date birthDate", "  +String phone", "  +String role", "}", "",
     "class Appointment {", "  +ObjectId customerId", "  +ObjectId barberId",
     "  +String date", "  +String startTime", "  +int duration",
     "  +String serviceType", "  +String status", "}", "",
     "class WorkingHours {", "  +ObjectId barberId", "  +int dayOfWeek",
     "  +String openTime", "  +String closeTime", "  +boolean isClosed", "}", "",
     "class Product {", "  +String name", "  +String description",
     "  +double price", "  +int stock", "  +String imageUrl", "}", "",
     "class Order {", "  +String orderNumber", "  +ObjectId customerId",
     "  +List<CartItem> items", "  +double totalPrice",
     "  +String deliveryType", "  +String address",
     "  +String status", "  +Date orderDate", "}", "",
     "class CartItem {", "  +ObjectId productId", "  +int quantity",
     "  +double priceAtPurchase", "}", "",
     "Order *-- CartItem", "@enduml"]
  ) +
  H.pageBreak() +

  H.h1("7. רכיב תוכנת Appointments Manager") +
  H.p(
    "רכיב ניהול התורים הוא הרכיב המרכזי במערכת. הוא אחראי על כל מחזור החיים של התור - " +
    "קביעה, צפייה, שינוי וביטול - וכן על חישוב השעות הפנויות המתואר בסעיף 10 של הצעת הפרויקט."
  ) +

  H.h2("7.1\tתרשים מחלקות") +
  H.diagram(
    "התרשים",
    "המחלקות המרכיבות את רכיב ניהול התורים, המתודות שלהן והקשרים ביניהן.",
    ["@startuml", "skinparam backgroundColor white", "",
     "class AppointmentController {",
     "  +bookAppointment(req, res)", "  +getMyAppointments(req, res)",
     "  +updateAppointment(req, res)", "  +cancelAppointment(req, res)",
     "  +getFreeSlots(req, res)", "  +getAllAppointments(req, res)", "}", "",
     "class AppointmentService {",
     "  +calculateFreeSlots(barberId, date, duration)",
     "  +isSlotAvailable(barberId, date, time, duration)",
     "  +createAppointment(data)",
     "  +changeAppointment(id, newDate, newTime)",
     "  +deleteAppointment(id)",
     "  -isOverlapping(startA, endA, startB, endB)", "}", "",
     "class Appointment {",
     "  +ObjectId customerId", "  +ObjectId barberId",
     "  +String date", "  +String startTime",
     "  +int duration", "  +String serviceType",
     "  +String status", "  +save()", "  +remove()", "}", "",
     "class ScheduleService {",
     "  +getWorkingHours(barberId, dayOfWeek)",
     "  +updateWorkingHours(barberId, hours)", "}", "",
     "AppointmentController --> AppointmentService : uses",
     "AppointmentService --> Appointment : creates / reads",
     "AppointmentService --> ScheduleService : gets working hours",
     "@enduml"]
  ) +

  H.h2("7.2\tתרשים רצף ברמת עצמים - מימוש המתודה calculateFreeSlots ב-SUC-3") +
  H.diagram(
    "התרשים",
    "התרשים יורד לרמת הקריאות בין העצמים בתוך השרת, ומראה כיצד מתבצע בפועל האלגוריתם המתואר בסעיף 10. שים לב ללולאה שבה כל משבצת נבדקת מול כל תור קיים.",
    ["@startuml", "participant AppointmentController as AC",
     "participant AppointmentService as AS",
     "participant ScheduleService as SS",
     "participant Appointment as AP",
     "database MongoDB as DB", "",
     "AC -> AS : calculateFreeSlots(barberId, date, duration)",
     "activate AS",
     "AS -> SS : getWorkingHours(barberId, dayOfWeek)",
     "activate SS",
     "SS -> DB : findOne({ barberId, dayOfWeek })",
     "DB --> SS : working hours record",
     "SS --> AS : openTime, closeTime",
     "deactivate SS", "",
     "alt barber is closed this day",
     "  AS --> AC : empty list",
     "else barber works",
     "  AS -> AS : buildAllSlots(openTime, closeTime, 15)",
     "  AS -> AP : find({ barberId, date })",
     "  activate AP",
     "  AP -> DB : query appointments",
     "  DB --> AP : taken appointments",
     "  AP --> AS : appointments list",
     "  deactivate AP", "",
     "  loop for each candidate slot",
     "    loop for each taken appointment",
     "      AS -> AS : isOverlapping(slot, slotEnd, apptStart, apptEnd)",
     "    end",
     "    AS -> AS : check slotEnd <= closeTime",
     "    AS -> AS : check slot is not in the past",
     "  end",
     "  AS --> AC : free slots list",
     "end", "deactivate AS", "@enduml"]
  ) +
  H.pageBreak() +

  H.h1("8. רכיב תוכנת Users Manager") +
  H.p(
    "רכיב ניהול המשתמשים אחראי על הרשמה, התחברות, ניהול הרשאות ועדכון פרופיל. הוא גם " +
    "הרכיב שמממש את מנגנוני האבטחה המתוארים בסעיף 11."
  ) +

  H.h2("8.1\tתרשים מחלקות") +
  H.diagram(
    "התרשים",
    "המחלקות של רכיב ניהול המשתמשים. שים לב למחלקה AuthService, המרכזת את כל פעולות ההצפנה והאסימונים.",
    ["@startuml", "skinparam backgroundColor white", "",
     "class UserController {",
     "  +register(req, res)", "  +login(req, res)",
     "  +getProfile(req, res)", "  +updateProfile(req, res)",
     "  +getAllUsers(req, res)", "  +updateUserRole(req, res)", "}", "",
     "class UserService {",
     "  +createUser(data)", "  +findByEmail(email)",
     "  +updateUser(id, data)", "  +changeRole(id, newRole)",
     "  +getAll()", "}", "",
     "class AuthService {",
     "  +hashPassword(plain)", "  +comparePassword(plain, hash)",
     "  +generateToken(user)", "  +verifyToken(token)",
     "  +countFailedAttempt(email)", "  +isAccountLocked(email)", "}", "",
     "class User {",
     "  +String firstName", "  +String lastName",
     "  +String email", "  +String password",
     "  +String address", "  +Date birthDate",
     "  +String phone", "  +String role",
     "  +int failedAttempts", "  +Date lockedUntil",
     "  +save()", "}", "",
     "class AuthMiddleware {",
     "  +requireLogin(req, res, next)", "  +requireRole(role)", "}", "",
     "UserController --> UserService : uses",
     "UserController --> AuthService : uses",
     "UserService --> User : creates / reads",
     "AuthMiddleware --> AuthService : verifies token",
     "@enduml"]
  ) +

  H.h2("8.2\tתרשים רצף ברמת עצמים - מימוש המתודה register ב-SUC-1") +
  H.diagram(
    "התרשים",
    "התהליך המלא של הרשמת משתמש חדש ברמת העצמים, כולל בדיקת כפילות כתובת הדואר האלקטרוני והצפנת הסיסמה.",
    ["@startuml", "participant UserController as UC",
     "participant UserService as US",
     "participant AuthService as AUTH",
     "participant User as U",
     "database MongoDB as DB", "",
     "UC -> UC : validate required fields",
     "UC -> UC : check password == confirmPassword",
     "alt validation failed",
     "  UC --> UC : return 400 with errors",
     "else validation passed",
     "  UC -> US : findByEmail(email)",
     "  activate US",
     "  US -> DB : findOne({ email })",
     "  DB --> US : result",
     "  US --> UC : existing user or null",
     "  deactivate US", "",
     "  alt email already exists",
     '    UC --> UC : return "Email already registered"',
     "  else email is free",
     "    UC -> AUTH : hashPassword(plainPassword)",
     "    activate AUTH",
     "    AUTH -> AUTH : generate salt",
     "    AUTH -> AUTH : bcrypt hash",
     "    AUTH --> UC : hashed password",
     "    deactivate AUTH", "",
     "    UC -> US : createUser(data with hash)",
     "    activate US",
     "    US -> U : new User(data)",
     "    U -> DB : save()",
     "    DB --> U : saved document",
     "    U --> US : created user",
     "    US --> UC : user",
     "    deactivate US",
     "    UC --> UC : return success",
     "  end", "end", "@enduml"]
  ) +
  H.pageBreak() +

  H.h1("9. מכונות מצבים (State Machines)") +
  H.p(
    "מכונת מצבים מתארת את המצבים שבהם עצם יכול להימצא לאורך חייו, ואת האירועים שגורמים " +
    "למעבר בין המצבים."
  ) +

  H.h2("9.1\tמכונת מצבים למחלקה Appointment") +
  H.p(
    "התור הוא העצם המרכזי במערכת, ולו מחזור חיים ברור: הוא נוצר, עשוי להשתנות או להתבטל, " +
    "ולבסוף מתקיים או שהלקוח לא הגיע."
  ) +
  H.table(
    ["המצב", "משמעותו", "המעברים האפשריים ממנו"],
    [
      ["Scheduled", "התור נקבע וממתין למועדו", "Rescheduled, Cancelled, Completed, NoShow"],
      ["Rescheduled", "התור הוזז למועד אחר", "Rescheduled, Cancelled, Completed, NoShow"],
      ["Cancelled", "התור בוטל והמועד התפנה", "אין - מצב סופי"],
      ["Completed", "התור התקיים בפועל", "אין - מצב סופי"],
      ["NoShow", "הלקוח לא הגיע לתור", "אין - מצב סופי"],
    ],
    [16, 38, 46]
  ) +
  H.diagram(
    "התרשים",
    "המעברים בין מצבי התור. שים לב ששינוי תור מחזיר את העצם לאותו מצב, ולכן אפשר לשנות תור מספר פעמים.",
    ["@startuml", "skinparam backgroundColor white", "",
     "[*] --> Scheduled : customer books appointment", "",
     "Scheduled --> Rescheduled : customer changes date/time",
     "Rescheduled --> Rescheduled : changed again", "",
     "Scheduled --> Cancelled : customer cancels",
     "Rescheduled --> Cancelled : customer cancels", "",
     "Scheduled --> Completed : appointment took place",
     "Rescheduled --> Completed : appointment took place", "",
     "Scheduled --> NoShow : customer did not arrive",
     "Rescheduled --> NoShow : customer did not arrive", "",
     "Cancelled --> [*]", "Completed --> [*]", "NoShow --> [*]",
     "@enduml"]
  ) +

  H.h2("9.2\tמכונת מצבים למחלקה Order") +
  H.p(
    "ההזמנה בחנות עוברת אף היא מחזור חיים, התלוי גם באופן הקבלה שנבחר - איסוף עצמי או משלוח."
  ) +
  H.diagram(
    "התרשים",
    "מצבי ההזמנה מרגע יצירתה ועד קבלתה. שים לב שההזמנה מתפצלת לשני מסלולים לפי אופן הקבלה.",
    ["@startuml", "skinparam backgroundColor white", "",
     "[*] --> Pending : customer completes cart", "",
     "Pending --> Paid : payment approved",
     "Pending --> Failed : payment declined",
     "Failed --> Pending : customer retries", "",
     "Paid --> Preparing : admin starts preparing order", "",
     "Preparing --> ReadyForPickup : delivery type = pickup",
     "Preparing --> Shipped : delivery type = delivery", "",
     "ReadyForPickup --> Collected : customer collected it",
     "Shipped --> Delivered : package arrived", "",
     "Paid --> Cancelled : order cancelled before preparing", "",
     "Collected --> [*]", "Delivered --> [*]", "Cancelled --> [*]",
     "@enduml"]
  ) +
  H.pageBreak();

// ============================================================
// פרק הבדיקות
// ============================================================

const testsChapter =
  H.h1("בדיקות") +
  H.p(
    "פרק זה שונה מסעיף 14 שבהצעת הפרויקט: סעיף 14 הוא תכנון הבדיקות מראש, ואילו פרק זה " +
    "הוא הדיווח על הבדיקות שבוצעו בפועל על גרסת המערכת הסופית."
  ) +
  H.p("הבדיקות בוצעו בדפדפן Chrome, במחשב נייח ובסמארטפון.") +
  H.table(
    ["מס׳", "הבדיקה", "בוצע בתאריך", "תוצאות"],
    [
      ["1", "הפעלת האפליקציה", "", ""],
      ["2", "הרשמת לקוח חדש", "", ""],
      ["3", "הרשמה עם שדה חובה ריק", "", ""],
      ["4", "הרשמה עם סיסמאות שאינן תואמות", "", ""],
      ["5", "הרשמה עם כתובת דואר אלקטרוני שכבר רשומה", "", ""],
      ["6", "כניסה: כתובת נכונה + סיסמה נכונה", "", ""],
      ["7", "כניסה: כתובת נכונה + סיסמה שגויה", "", ""],
      ["8", "כניסה: כתובת שגויה + סיסמה נכונה", "", ""],
      ["9", "כניסה ללא כתובת וללא סיסמה", "", ""],
      ["10", "נעילת חשבון אחרי 5 ניסיונות כושלים", "", ""],
      ["11", "הפניה לממשק הנכון לפי הרשאה", "", ""],
      ["12", "הזמנת תור - בחירת ספר", "", ""],
      ["13", "הזמנת תור - בחירת תאריך מלוח השנה", "", ""],
      ["14", "הזמנת תור - הצגת שעות פנויות בלבד", "", ""],
      ["15", "הזמנת תור - אישור וקבלת הודעה", "", ""],
      ["16", "הזמנת תור בתאריך ללא שעות פנויות", "", ""],
      ["17", "הזמנת שני תורים באותה שעה (בדיקת התנגשות)", "", ""],
      ["18", "צפייה ב״התורים שלי״ עם תורים קיימים", "", ""],
      ["19", "צפייה ב״התורים שלי״ ללא תורים", "", ""],
      ["20", "שינוי תור קיים", "", ""],
      ["21", "בדיקה שהמועד הישן התפנה אחרי שינוי", "", ""],
      ["22", "ביטול תור - אישור", "", ""],
      ["23", "ביטול תור - לחיצה על ״לא״", "", ""],
      ["24", "כניסה לחנות והצגת המוצרים", "", ""],
      ["25", "הוספת מוצר לסל", "", ""],
      ["26", "מעבר לתשלום עם סל ריק", "", ""],
      ["27", "הזמנה באיסוף עצמי", "", ""],
      ["28", "הזמנה במשלוח", "", ""],
      ["29", "תשלום עם פרטי אשראי תקינים", "", ""],
      ["30", "תשלום עם פרטי אשראי שגויים", "", ""],
      ["31", "הזמנה חוזרת מהזמנות קודמות", "", ""],
      ["32", "עדכון פרטים בפרופיל האישי", "", ""],
      ["33", "יומן הספר - הצגת תוריו בלבד", "", ""],
      ["34", "עריכת ימי ושעות עבודה של ספר", "", ""],
      ["35", "מנהל - מתן הרשאת נותן שירות", "", ""],
      ["36", "מנהל - צפייה בכל התורים", "", ""],
      ["37", "מנהל - הוספת מוצר לחנות", "", ""],
      ["38", "מנהל - עדכון ומחיקת מוצר", "", ""],
      ["39", "מנהל - צפייה בכל ההזמנות", "", ""],
      ["40", "גישה לדף מנהל כלקוח (בדיקת הרשאות)", "", ""],
      ["41", "תצוגה במסך סמארטפון", "", ""],
      ["42", "התנתקות מהמערכת", "", ""],
    ],
    [7, 55, 20, 18]
  ) +
  H.pageBreak();

// ============================================================
// מסכי האפליקציה
// ============================================================

const screensChapter =
  H.h1("מסכי האפליקציה") +
  H.note(
    "הפרק היחיד שנותר להשלים",
    "פרק זה דורש צילומי מסך מהאתר האמיתי. הטבלה למטה היא רשימת המסכים שצריך לצלם. " +
    "לכל מסך: כותרת ממוספרת, צילום מסך, ושתיים-שלוש שורות הסבר על מה המשתמש רואה " +
    "ומה הוא יכול לעשות שם. אחרי שתשלים את הפרק, מחק את ההערה הזו ואת הטבלה."
  ) +
  H.table(
    ["מס׳", "המסך", "מה לצלם"],
    [
      ["1", "דף הכניסה", "שדות הדואר האלקטרוני והסיסמה, כפתור הכניסה וקישור ההרשמה"],
      ["2", "דף ההרשמה", "כל שדות ההרשמה כולל אימות הסיסמה"],
      ["3", "דף הבית - לקוח", "הכיתוב ״שלום [שם]״ והתפריט הראשי"],
      ["4", "בחירת נותן שירות", "כרטיסיות הספרים"],
      ["5", "לוח השנה", "בחירת תאריך"],
      ["6", "בחירת שעה", "רשימת השעות הפנויות"],
      ["7", "אישור הזמנת תור", "הודעת האישור עם פרטי התור"],
      ["8", "התורים שלי", "רשימת התורים עם כפתורי שינוי וביטול"],
      ["9", "החנות", "כרטיסיות המוצרים"],
      ["10", "דף מוצר בודד", "תיאור, בחירת כמות וכפתור הוספה לסל"],
      ["11", "הסל שלי", "רשימת המוצרים והמחיר הכולל"],
      ["12", "בחירת אופן קבלה", "האפשרויות איסוף עצמי ומשלוח"],
      ["13", "דף התשלום", "שדות האשראי"],
      ["14", "אישור הזמנה", "מספר ההזמנה"],
      ["15", "הזמנות קודמות", "הרשימה וכפתור ההזמנה החוזרת"],
      ["16", "פרופיל אישי", "הפרטים הניתנים לעריכה"],
      ["17", "יומן הספר", "התורים של הספר המחובר"],
      ["18", "עריכת שעות עבודה", "בחירת הימים והשעות"],
      ["19", "ניהול משתמשים", "רשימת המשתמשים ושינוי ההרשאות"],
      ["20", "ניהול כל התורים", "התצוגה של המנהל"],
      ["21", "ניהול מוצרי החנות", "הוספה, עריכה ומחיקה"],
      ["22", "ניהול הזמנות", "רשימת ההזמנות"],
      ["23", "תצוגה בנייד", "צילום של דף הבית במסך סמארטפון"],
    ],
    [7, 30, 63]
  ) +
  H.pageBreak();

// ============================================================
// דפי אישור וחתימות
// ============================================================

const signaturePages =
  H.blank() + H.blank() +
  H.signatureLine("חתימת הסטודנט") +
  H.signatureLine("חתימת המנחה") +
  H.blank() + H.blank() +

  H.h1("הערות ראש המגמה במכללה") +
  H.writeLine() + H.writeLine() + H.writeLine() + H.writeLine() + H.writeLine() +
  H.blank() +
  H.h2("אישור ראש המגמה") +
  H.table(["שם", "חתימה", "תאריך"], [["", "", ""]], [40, 30, 30]) +
  H.blank() + H.blank() +

  H.h1("הערות הגורם המקצועי מטעם מה״ט") +
  H.writeLine() + H.writeLine() + H.writeLine() + H.writeLine() + H.writeLine() +
  H.blank() +
  H.h2("אישור הגורם המקצועי מטעם מה״ט") +
  H.table(["שם", "חתימה", "תאריך"], [["", "", ""]], [40, 30, 30]);

module.exports = { sdd, testsChapter, screensChapter, signaturePages };
