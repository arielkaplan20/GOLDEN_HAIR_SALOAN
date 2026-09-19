// דף הבית
// מציג "שלום [שם]" ותפריט שמשתנה לפי סוג המשתמש - דרישה 10

import { Link } from "react-router-dom";
import { getUser } from "../api";

// התפריט של הלקוח.
// שים לב: שינוי תור וביטול תור אינם פריטים נפרדים כאן,
// אלא כפתורים ליד כל תור בתוך "התורים שלי".
// זה מה שהוחלט בקובץ התיקונים, ממצא 19.
const customerMenu = [
  { to: "/book", icon: "📅", title: "הזמנת תור", desc: "בחר ספר, תאריך ושעה" },
  { to: "/my-appointments", icon: "📋", title: "התורים שלי", desc: "צפייה, שינוי וביטול" },
  { to: "/shop", icon: "🛍️", title: "חנות", desc: "מוצרים לשיער ולזקן" },
  { to: "/my-orders", icon: "📦", title: "ההזמנות שלי", desc: "הזמנות קודמות והזמנה חוזרת" },
  { to: "/cart", icon: "🛒", title: "הסל שלי", desc: "סיום הזמנה ותשלום" },
  { to: "/profile", icon: "👤", title: "הפרופיל שלי", desc: "עדכון הפרטים האישיים" },
];

const barberMenu = [
  { to: "/barber/calendar", icon: "📅", title: "יומן תורים", desc: "התורים שנקבעו אליך" },
  { to: "/barber/schedule", icon: "🕐", title: "שעות עבודה", desc: "עריכת ימי ושעות העבודה" },
  { to: "/profile", icon: "👤", title: "הפרופיל שלי", desc: "עדכון הפרטים האישיים" },
];

const adminMenu = [
  { to: "/admin/users", icon: "👥", title: "ניהול משתמשים", desc: "הרשאות לנותני שירות" },
  { to: "/admin/appointments", icon: "📅", title: "ניהול תורים", desc: "כל התורים במערכת" },
  { to: "/admin/products", icon: "🏷️", title: "ניהול החנות", desc: "הוספה, עדכון ומחיקת מוצרים" },
  { to: "/admin/orders", icon: "📦", title: "ניהול הזמנות", desc: "כל ההזמנות בחנות" },
  { to: "/profile", icon: "👤", title: "הפרופיל שלי", desc: "עדכון הפרטים האישיים" },
];

function Home() {
  const user = getUser();

  let menu = customerMenu;
  let subtitle = "מה תרצה לעשות היום?";

  if (user.role === "barber") {
    menu = barberMenu;
    subtitle = "ממשק נותן שירות";
  }

  if (user.role === "admin") {
    menu = adminMenu;
    subtitle = "ממשק ניהול המערכת";
  }

  return (
    <div className="page">
      <div className="welcome">
        <h1>
          שלום <span>{user.firstName}</span>
        </h1>
        <p>{subtitle}</p>
      </div>

      <div className="menu-grid">
        {menu.map((item) => (
          <Link key={item.to} to={item.to} className="menu-item">
            <span className="icon">{item.icon}</span>
            <div className="title">{item.title}</div>
            <div className="desc">{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
