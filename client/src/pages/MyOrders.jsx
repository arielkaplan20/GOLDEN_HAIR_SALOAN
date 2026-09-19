// מסך ההזמנות שלי - צפייה בהזמנות קודמות והזמנה חוזרת (דרישה 22)

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { get, getCart, saveCart } from "../api";

// תרגום הסטטוס מאנגלית לעברית
const STATUS_NAMES = {
  paid: "שולם",
  preparing: "בהכנה",
  ready: "מוכן לאיסוף",
  shipped: "נשלח",
  collected: "נאסף",
  delivered: "נמסר",
  cancelled: "בוטל",
};

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await get("/orders/my");
        setOrders(data);
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    }

    loadOrders();
  }, []);

  // הזמנה חוזרת - מוסיף את מוצרי ההזמנה לסל
  async function handleReorder(orderId) {
    setError("");
    setMessage("");

    try {
      const data = await get("/orders/" + orderId + "/reorder");

      if (data.items.length === 0) {
        setError("אף אחד מהמוצרים בהזמנה הזו אינו זמין כרגע");
        return;
      }

      // מוסיפים את המוצרים לסל הקיים
      const cart = getCart();

      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        const existing = cart.find((c) => c.productId === item.productId);

        if (existing) {
          existing.quantity = existing.quantity + item.quantity;
        } else {
          cart.push(item);
        }
      }

      saveCart(cart);

      if (data.missing.length > 0) {
        setMessage(
          "המוצרים נוספו לסל. שים לב שהמוצרים הבאים לא זמינים: " + data.missing.join(", ")
        );
      } else {
        setMessage("כל המוצרים נוספו לסל");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  // מציג תאריך בפורמט קריא בעברית
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL");
  }

  if (loading) {
    return (
      <div className="page">
        <div className="empty">טוען...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">ההזמנות שלי</h1>

      {error && <div className="message error">{error}</div>}
      {message && (
        <div className="message success">
          {message}{" "}
          <Link to="/cart" style={{ fontWeight: 700 }}>
            מעבר לסל
          </Link>
        </div>
      )}

      {orders.length === 0 && <div className="empty">אין הזמנות קודמות</div>}

      {orders.map((order) => (
        <div key={order._id} className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div>
              <h3 style={{ marginBottom: 4 }}>
                הזמנה <span dir="ltr">{order.orderNumber}</span>
              </h3>
              <p style={{ fontSize: 14, color: "#6b6b6b" }}>
                {formatDate(order.orderDate)} ·{" "}
                {order.deliveryType === "pickup" ? "איסוף עצמי" : "משלוח"}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="badge gold">{STATUS_NAMES[order.status]}</span>
              <button className="btn btn-small" onClick={() => handleReorder(order._id)}>
                הזמן שוב
              </button>
            </div>
          </div>

          {order.items.map((item, index) => (
            <div key={index} className="summary-row">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{item.priceAtPurchase * item.quantity} ₪</span>
            </div>
          ))}

          <div className="summary-row total">
            <span>סך הכול</span>
            <span>{order.totalPrice} ₪</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyOrders;
