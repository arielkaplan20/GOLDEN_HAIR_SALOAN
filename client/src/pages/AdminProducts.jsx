// ניהול מוצרי החנות - SUC-12
// הוספה, עדכון ומחיקה של מוצרים

import { useState, useEffect } from "react";
import { get, post, put, remove } from "../api";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // אם editingId ריק - הטופס במצב הוספה. אחרת - במצב עריכה.
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // המוצר שנמצא כרגע בחלון אישור המחיקה
  const [deleting, setDeleting] = useState(null);

  async function loadProducts() {
    try {
      const data = await get("/products");
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function startAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function startEdit(product) {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
    });
    setEditingId(product._id);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      let data;

      if (editingId) {
        data = await put("/products/" + editingId, form);
      } else {
        data = await post("/products", form);
      }

      setSuccess(data.message);
      closeForm();

      await loadProducts();
    } catch (err) {
      // הסתעפות א של SUC-12 - פרטי המוצר אינם תקינים
      setError(err.message);
    }
  }

  // הסתעפות ב של SUC-12 - מחיקה עם חלון אישור
  async function confirmDelete() {
    setError("");

    try {
      const data = await remove("/products/" + deleting._id);

      setSuccess(data.message);
      setDeleting(null);

      await loadProducts();
    } catch (err) {
      setError(err.message);
      setDeleting(null);
    }
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
      <h1 className="page-title">ניהול החנות</h1>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      {/* חלון אישור המחיקה */}
      {deleting && (
        <div className="card" style={{ borderInlineStart: "4px solid #c0392b" }}>
          <h3 style={{ marginBottom: 10 }}>אישור מחיקה</h3>
          <p style={{ marginBottom: 16 }}>
            האם אתה בטוח שברצונך למחוק את המוצר <strong>{deleting.name}</strong>? הפעולה
            אינה ניתנת לביטול.
          </p>

          <div className="actions">
            <button className="btn-danger" onClick={confirmDelete}>
              כן, מחק
            </button>
            <button className="btn-light" onClick={() => setDeleting(null)}>
              לא
            </button>
          </div>
        </div>
      )}

      {/* טופס ההוספה והעריכה */}
      {showForm && (
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>
            {editingId ? "עריכת מוצר" : "הוספת מוצר חדש"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>שם המוצר *</label>
              <input name="name" value={form.name} onChange={updateField} />
            </div>

            <div className="form-row">
              <label>תיאור</label>
              <textarea name="description" value={form.description} onChange={updateField} />
            </div>

            <div className="form-grid">
              <div className="form-row">
                <label>מחיר (₪) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={updateField}
                  min="0"
                />
              </div>

              <div className="form-row">
                <label>כמות במלאי *</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={updateField}
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <label>כתובת תמונה</label>
              <input
                name="imageUrl"
                value={form.imageUrl}
                onChange={updateField}
                placeholder="https://..."
                dir="ltr"
              />
            </div>

            <div className="actions">
              <button type="submit" className="btn">
                {editingId ? "שמירת השינויים" : "הוספת המוצר"}
              </button>
              <button type="button" className="btn-light" onClick={closeForm}>
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3>המוצרים בחנות ({products.length})</h3>

          {!showForm && (
            <button className="btn btn-small" onClick={startAdd}>
              + הוספת מוצר
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="empty">אין מוצרים בחנות</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>שם המוצר</th>
                  <th>מחיר</th>
                  <th>מלאי</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <strong>{product.name}</strong>
                      <div style={{ fontSize: 13, color: "#6b6b6b" }}>
                        {product.description.length > 60
                          ? product.description.substring(0, 60) + "..."
                          : product.description}
                      </div>
                    </td>
                    <td>{product.price} ₪</td>
                    <td>
                      {product.stock === 0 ? (
                        <span className="badge red">אזל</span>
                      ) : (
                        product.stock
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn-small btn-light"
                          onClick={() => startEdit(product)}
                        >
                          עריכה
                        </button>
                        <button
                          className="btn-small btn-danger"
                          onClick={() => setDeleting(product)}
                        >
                          מחיקה
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;
