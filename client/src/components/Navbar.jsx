// הסרגל העליון
// התפריט משתנה לפי סוג המשתמש - לקוח, ספר או מנהל

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, logout, getCart } from "../api";

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  const [cartCount, setCartCount] = useState(0);

  // מעדכנים את המונה של הסל בכל פעם שהסל משתנה
  useEffect(() => {
    function updateCount() {
      const cart = getCart();
      let total = 0;

      for (let i = 0; i < cart.length; i++) {
        total = total + cart[i].quantity;
      }

      setCartCount(total);
    }

    updateCount();

    // האירוע הזה נשלח מ-api.js בכל שינוי בסל
    window.addEventListener("cart-changed", updateCount);

    return () => {
      window.removeEventListener("cart-changed", updateCount);
    };
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user) {
    return null;
  }

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          GOLDEN HAIR SALON
        </Link>

        <div className="nav-links">
          <Link to="/">דף הבית</Link>

          {user.role === "customer" && (
            <>
              <Link to="/book">הזמנת תור</Link>
              <Link to="/my-appointments">התורים שלי</Link>
              <Link to="/shop">חנות</Link>
              <Link to="/my-orders">ההזמנות שלי</Link>
              <Link to="/cart">
                הסל שלי
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
            </>
          )}

          {user.role === "barber" && (
            <>
              <Link to="/barber/calendar">יומן תורים</Link>
              <Link to="/barber/schedule">שעות עבודה</Link>
            </>
          )}

          {user.role === "admin" && (
            <>
              <Link to="/admin/users">משתמשים</Link>
              <Link to="/admin/appointments">תורים</Link>
              <Link to="/admin/products">מוצרים</Link>
              <Link to="/admin/orders">הזמנות</Link>
            </>
          )}

          <Link to="/profile">פרופיל</Link>
        </div>

        <div className="nav-user">
          <span>{user.firstName}</span>
          <button className="btn-small btn-light" onClick={handleLogout}>
            התנתקות
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
