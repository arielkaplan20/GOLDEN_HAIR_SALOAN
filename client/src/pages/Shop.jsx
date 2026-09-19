// מסך החנות - הצגת המוצרים בכרטיסיות (דרישה 17)

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { get } from "../api";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await get("/products");
        setProducts(data);
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="empty">טוען מוצרים...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">החנות</h1>

      {error && <div className="message error">{error}</div>}

      {products.length === 0 && <div className="empty">אין מוצרים בחנות כרגע</div>}

      <div className="product-grid">
        {products.map((product) => (
          <Link
            key={product._id}
            to={"/product/" + product._id}
            className="product-card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="product-image">
              {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : "💈"}
            </div>

            <div className="product-body">
              <h3>{product.name}</h3>
              <div className="desc">{product.description}</div>
              <div className="price">{product.price} ₪</div>

              {product.stock === 0 ? (
                <div className="out-of-stock">אזל מהמלאי</div>
              ) : (
                <div style={{ fontSize: 13, color: "#6b6b6b" }}>
                  במלאי: {product.stock} יחידות
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Shop;
