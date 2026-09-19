// מסך התשלום - SUC-7, צעדים 3 עד 6
//
// הלקוח בוחר בין איסוף עצמי למשלוח, ממלא את הפרטים המתאימים,
// מזין פרטי אשראי ומקבל מספר הזמנה.

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { get, post, getCart, getCartTotal, clearCart } from "../api";

// נקודות האיסוף האפשריות
const PICKUP_POINTS = [
  "סניף תל אביב - דיזנגוף 120",
  "סניף רמת גן - ביאליק 45",
  "סניף חולון - סוקולוב 33",
];

function Checkout() {
  const navigate = useNavigate();

  const [cart] = useState(getCart());
  const [deliveryType, setDeliveryType] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    pickupPoint: "",
    notes: "",
  });

  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  // ממלאים מראש את הפרטים מהפרופיל, כדי שהלקוח לא יקליד הכול שוב
  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await get("/users/profile");

        setForm((current) => ({
          ...current,
          fullName: user.firstName + " " + user.lastName,
          phone: user.phone || "",
          email: user.email || "",
          address: user.address || "",
        }));
      } catch (err) {
        // אם לא הצלחנו לטעון את הפרופיל, הלקוח פשוט ימלא ידנית
      }
    }

    loadProfile();
  }, []);

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function updateCard(event) {
    setCard({ ...card, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!deliveryType) {
      setError("צריך לבחור בין איסוף עצמי למשלוח");
      return;
    }

    if (!form.fullName || !form.phone || !form.email) {
      setError("צריך למלא שם מלא, טלפון ומייל");
      return;
    }

    if (deliveryType === "delivery" && !form.address) {
      setError("צריך למלא כתובת למשלוח");
      return;
    }

    if (deliveryType === "pickup" && !form.pickupPoint) {
      setError("צריך לבחור נקודת איסוף");
      return;
    }

    setLoading(true);

    try {
      const data = await post("/orders", {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryType: deliveryType,
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        pickupPoint: form.pickupPoint,
        notes: form.notes,
        card: card,
      });

      clearCart();
      setOrderResult(data);
    } catch (err) {
      // הסתעפות ב של SUC-7 - התשלום נכשל
      setError(err.message);
      setLoading(false);
    }
  }

  const total = getCartTotal();

  // ---------- מסך אישור ההזמנה ----------
  if (orderResult) {
    return (
      <div className="page">
        <div className="card confirm-box">
          <div className="big-icon">📦</div>
          <h2>ההזמנה בוצעה בהצלחה</h2>
          <p style={{ color: "#6b6b6b" }}>מספר ההזמנה שלך:</p>

          <div className="order-number">{orderResult.orderNumber}</div>

          <div style={{ fontSize: 17, marginBottom: 24 }}>
            סך הכול שולם: <strong>{orderResult.totalPrice} ₪</strong>
          </div>

          <div className="actions" style={{ justifyContent: "center" }}>
            <button className="btn" onClick={() => navigate("/my-orders")}>
              ההזמנות שלי
            </button>
            <button className="btn-light" onClick={() => navigate("/shop")}>
              חזרה לחנות
            </button>
          </div>
        </div>
      </div>
    );
  }

  // אם הגיעו למסך עם סל ריק
  if (cart.length === 0) {
    return (
      <div className="page">
        <div className="empty">
          הסל שלך ריק
          <div style={{ marginTop: 16 }}>
            <Link to="/shop" className="btn btn-small">
              מעבר לחנות
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">סיום ותשלום</h1>

      {error && <div className="message error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="two-columns">
          <div>
            {/* בחירת אופן הקבלה */}
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>איך תרצה לקבל את ההזמנה?</h3>

              <div className="choice-grid">
                <button
                  type="button"
                  className={"choice " + (deliveryType === "pickup" ? "selected" : "")}
                  onClick={() => setDeliveryType("pickup")}
                >
                  🏪 איסוף עצמי
                </button>

                <button
                  type="button"
                  className={"choice " + (deliveryType === "delivery" ? "selected" : "")}
                  onClick={() => setDeliveryType("delivery")}
                >
                  🚚 משלוח
                </button>
              </div>
            </div>

            {/* פרטי ההזמנה */}
            {deliveryType && (
              <div className="card">
                <h3 style={{ marginBottom: 12 }}>פרטי ההזמנה</h3>

                <div className="form-grid">
                  <div className="form-row">
                    <label>שם מלא *</label>
                    <input name="fullName" value={form.fullName} onChange={updateForm} />
                  </div>

                  <div className="form-row">
                    <label>טלפון *</label>
                    <input name="phone" value={form.phone} onChange={updateForm} />
                  </div>
                </div>

                <div className="form-row">
                  <label>כתובת מייל *</label>
                  <input type="email" name="email" value={form.email} onChange={updateForm} />
                </div>

                {/* דרישה 19 - פרטי איסוף עצמי */}
                {deliveryType === "pickup" && (
                  <div className="form-row">
                    <label>נקודת איסוף *</label>
                    <select
                      name="pickupPoint"
                      value={form.pickupPoint}
                      onChange={updateForm}
                    >
                      <option value="">בחר נקודת איסוף</option>
                      {PICKUP_POINTS.map((point) => (
                        <option key={point} value={point}>
                          {point}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* דרישה 20 - פרטי משלוח */}
                {deliveryType === "delivery" && (
                  <div className="form-row">
                    <label>כתובת מלאה למשלוח *</label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={updateForm}
                      placeholder="רחוב, מספר בית, עיר"
                    />
                  </div>
                )}

                <div className="form-row">
                  <label>הערות להזמנה</label>
                  <textarea name="notes" value={form.notes} onChange={updateForm} />
                </div>
              </div>
            )}

            {/* פרטי האשראי */}
            {deliveryType && (
              <div className="card">
                <h3 style={{ marginBottom: 6 }}>פרטי תשלום</h3>
                <p style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 14 }}>
                  הסליקה בפרויקט זה היא הדמיה בלבד ואין חיוב אמיתי. פרטי הכרטיס אינם נשמרים
                  במערכת.
                </p>

                <div className="form-row">
                  <label>מספר כרטיס *</label>
                  <input
                    name="number"
                    value={card.number}
                    onChange={updateCard}
                    placeholder="1234 5678 9012 3456"
                    dir="ltr"
                  />
                </div>

                <div className="form-grid">
                  <div className="form-row">
                    <label>תוקף *</label>
                    <input
                      name="expiry"
                      value={card.expiry}
                      onChange={updateCard}
                      placeholder="MM/YY"
                      dir="ltr"
                    />
                  </div>

                  <div className="form-row">
                    <label>CVV *</label>
                    <input
                      name="cvv"
                      value={card.cvv}
                      onChange={updateCard}
                      placeholder="123"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* סיכום ההזמנה */}
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>סיכום</h3>

            {cart.map((item) => (
              <div key={item.productId} className="summary-row">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{item.price * item.quantity} ₪</span>
              </div>
            ))}

            <div className="summary-row total">
              <span>סך הכול</span>
              <span>{total} ₪</span>
            </div>

            <button
              type="submit"
              className="btn btn-full"
              style={{ marginTop: 16 }}
              disabled={loading || !deliveryType}
            >
              {loading ? "מבצע תשלום..." : "אישור ותשלום"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Checkout;
