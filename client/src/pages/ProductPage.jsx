// מסך מוצר בודד - תיאור, בחירת כמות והוספה לסל (דרישה 17)

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { get, addToCart } from "../api";

function ProductPage() {
  const params = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await get("/products/" + params.id);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    }

    loadProduct();
  }, [params.id]);

  function handleAddToCart() {
    addToCart(product, quantity);
    setAdded(true);

    // ההודעה נעלמת אחרי 3 שניות
    setTimeout(() => setAdded(false), 3000);
  }

  if (loading) {
    return (
      <div className="page">
        <div className="empty">טוען...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page">
        <div className="message error">{error || "המוצר לא נמצא"}</div>
        <Link to="/shop" className="btn btn-small">
          חזרה לחנות
        </Link>
      </div>
    );
  }

  // רשימת הכמויות שאפשר לבחור, עד המלאי הקיים ועד 10 לכל היותר
  const maxQuantity = Math.min(product.stock, 10);
  const quantityOptions = [];

  for (let i = 1; i <= maxQuantity; i++) {
    quantityOptions.push(i);
  }

  return (
    <div className="page">
      <h1 className="page-title">{product.name}</h1>

      {added && (
        <div className="message success">
          המוצר נוסף לסל.{" "}
          <Link to="/cart" style={{ fontWeight: 700 }}>
            מעבר לסל שלי
          </Link>
        </div>
      )}

      <div className="two-columns">
        <div className="card">
          <div
            className="product-image"
            style={{ height: 260, borderRadius: 8, marginBottom: 18 }}
          >
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} />
            ) : (
              <span style={{ fontSize: 70 }}>💈</span>
            )}
          </div>

          <h3 style={{ marginBottom: 10 }}>תיאור המוצר</h3>
          <p style={{ lineHeight: 1.8, color: "#4a4a4a" }}>
            {product.description || "אין תיאור למוצר זה"}
          </p>
        </div>

        <div className="card">
          <div className="price" style={{ fontSize: 30 }}>
            {product.price} ₪
          </div>

          {product.stock === 0 ? (
            <>
              <div className="message error">המוצר אזל מהמלאי</div>
              <button className="btn btn-full" disabled>
                לא ניתן להזמין
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, color: "#6b6b6b", marginBottom: 16 }}>
                נותרו {product.stock} יחידות במלאי
              </div>

              <div className="form-row">
                <label>כמות</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {quantityOptions.map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn btn-full" onClick={handleAddToCart}>
                הוסף לסל
              </button>
            </>
          )}

          <button
            className="btn-light btn-full"
            style={{ marginTop: 10 }}
            onClick={() => navigate("/shop")}
          >
            חזרה לחנות
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
