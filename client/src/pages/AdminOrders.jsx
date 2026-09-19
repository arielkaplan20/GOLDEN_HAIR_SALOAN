// צפייה וניהול כל ההזמנות בחנות - SUC-12, החלק השני

import { useState, useEffect } from "react";
import { get, put } from "../api";

const STATUS_NAMES = {
  paid: "שולם",
  preparing: "בהכנה",
  ready: "מוכן לאיסוף",
  shipped: "נשלח",
  collected: "נאסף",
  delivered: "נמסר",
  cancelled: "בוטל",
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ההזמנה שפתוחה כרגע לצפייה בפרטים המלאים
  const [openOrder, setOpenOrder] = useState(null);

  async function loadOrders() {
    try {
      const data = await get("/orders/all");
      setOrders(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function changeStatus(orderId, status) {
    setError("");
    setSuccess("");

    try {
      const data = await put("/orders/" + orderId + "/status", { status: status });

      setSuccess(data.message);
      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL") + " " + date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
      <h1 className="page-title">ניהול הזמנות</h1>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      {/* הסתעפות ג של SUC-12 - אין הזמנות */}
      {orders.length === 0 ? (
        <div className="empty">אין הזמנות קיימות</div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>מספר הזמנה</th>
                  <th>תאריך</th>
                  <th>לקוח</th>
                  <th>סכום</th>
                  <th>אופן קבלה</th>
                  <th>סטטוס</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td dir="ltr" style={{ textAlign: "right" }}>
                      <strong>{order.orderNumber}</strong>
                    </td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>{order.fullName}</td>
                    <td>
                      <strong>{order.totalPrice} ₪</strong>
                    </td>
                    <td>{order.deliveryType === "pickup" ? "איסוף עצמי" : "משלוח"}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => changeStatus(order._id, e.target.value)}
                        style={{ maxWidth: 145, fontSize: 13 }}
                      >
                        {Object.keys(STATUS_NAMES).map((key) => (
                          <option key={key} value={key}>
                            {STATUS_NAMES[key]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn-small btn-light"
                        onClick={() =>
                          setOpenOrder(openOrder === order._id ? null : order._id)
                        }
                      >
                        {openOrder === order._id ? "סגור" : "פרטים"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* פרטי ההזמנה שנפתחה */}
      {openOrder &&
        orders
          .filter((order) => order._id === openOrder)
          .map((order) => (
            <div key={order._id} className="card">
              <h3 style={{ marginBottom: 14 }}>
                פרטי הזמנה <span dir="ltr">{order.orderNumber}</span>
              </h3>

              <div className="form-grid" style={{ marginBottom: 14 }}>
                <div>
                  <p style={{ marginBottom: 6 }}>
                    <strong>שם:</strong> {order.fullName}
                  </p>
                  <p style={{ marginBottom: 6 }}>
                    <strong>טלפון:</strong> {order.phone}
                  </p>
                  <p style={{ marginBottom: 6 }}>
                    <strong>מייל:</strong> {order.email}
                  </p>
                </div>

                <div>
                  {order.deliveryType === "delivery" ? (
                    <p style={{ marginBottom: 6 }}>
                      <strong>כתובת למשלוח:</strong> {order.address}
                    </p>
                  ) : (
                    <p style={{ marginBottom: 6 }}>
                      <strong>נקודת איסוף:</strong> {order.pickupPoint}
                    </p>
                  )}

                  {order.notes && (
                    <p style={{ marginBottom: 6 }}>
                      <strong>הערות:</strong> {order.notes}
                    </p>
                  )}
                </div>
              </div>

              <h4 style={{ marginBottom: 8 }}>המוצרים בהזמנה</h4>

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

export default AdminOrders;
