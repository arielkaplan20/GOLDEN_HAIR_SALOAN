// מסך הסל שלי - סקירת המוצרים לפני התשלום (דרישה 18)

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCart, saveCart, removeFromCart, getCartTotal } from "../api";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(getCart());

  function changeQuantity(productId, newQuantity) {
    const quantity = Number(newQuantity);

    if (quantity < 1) {
      return;
    }

    const newCart = cart.map((item) => {
      if (item.productId === productId) {
        return { ...item, quantity: quantity };
      }
      return item;
    });

    saveCart(newCart);
    setCart(newCart);
  }

  function handleRemove(productId) {
    removeFromCart(productId);
    setCart(getCart());
  }

  const total = getCartTotal();

  // הסתעפות א של SUC-7 - הסל ריק
  if (cart.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">הסל שלי</h1>

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
      <h1 className="page-title">הסל שלי</h1>

      <div className="two-columns">
        <div>
          {cart.map((item) => (
            <div key={item.productId} className="list-item">
              <div className="info">
                <h3>{item.name}</h3>
                <p>{item.price} ₪ ליחידה</p>
              </div>

              <div className="actions" style={{ alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontSize: 14 }}>כמות:</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => changeQuantity(item.productId, e.target.value)}
                    style={{ width: 70 }}
                  />
                </div>

                <div style={{ fontWeight: 700, minWidth: 80 }}>
                  {item.price * item.quantity} ₪
                </div>

                <button
                  className="btn-small btn-danger"
                  onClick={() => handleRemove(item.productId)}
                >
                  הסר
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14 }}>סיכום הזמנה</h3>

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
            className="btn btn-full"
            style={{ marginTop: 16 }}
            onClick={() => navigate("/checkout")}
          >
            סיום ותשלום
          </button>

          <button
            className="btn-light btn-full"
            style={{ marginTop: 9 }}
            onClick={() => navigate("/shop")}
          >
            המשך קנייה
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
