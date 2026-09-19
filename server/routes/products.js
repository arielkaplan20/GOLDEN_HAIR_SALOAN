// נתיבי מוצרי החנות
// מממש את SUC-7 (צד התצוגה) ואת SUC-12 (ניהול המוצרים)

const express = require("express");
const Product = require("../models/Product");
const { requireLogin, requireRole } = require("../middleware/auth");

const router = express.Router();

// ============================================================
// SUC-7: הצגת המוצרים בחנות - פתוח לכל משתמש מחובר
// ============================================================
router.get("/", requireLogin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// הצגת מוצר בודד
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "המוצר לא נמצא" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// SUC-12: ניהול המוצרים - למנהל בלבד
// ============================================================

// בדיקת תקינות של פרטי מוצר. משותפת להוספה ולעדכון.
function validateProduct(body) {
  if (!body.name || body.name.trim() === "") {
    return "צריך למלא שם מוצר";
  }

  if (body.price === undefined || body.price === null || body.price === "") {
    return "צריך למלא מחיר";
  }

  if (isNaN(body.price) || Number(body.price) < 0) {
    return "המחיר חייב להיות מספר חיובי";
  }

  if (body.stock === undefined || body.stock === null || body.stock === "") {
    return "צריך למלא כמות במלאי";
  }

  if (isNaN(body.stock) || Number(body.stock) < 0) {
    return "הכמות במלאי חייבת להיות מספר חיובי";
  }

  return null; // אין שגיאה
}

// הוספת מוצר
router.post("/", requireLogin, requireRole("admin"), async (req, res) => {
  try {
    const error = validateProduct(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description || "",
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      imageUrl: req.body.imageUrl || "",
    });

    await newProduct.save();

    res.status(201).json({ message: "המוצר נוסף בהצלחה", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// עדכון מוצר
router.put("/:id", requireLogin, requireRole("admin"), async (req, res) => {
  try {
    const error = validateProduct(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "המוצר לא נמצא" });
    }

    product.name = req.body.name;
    product.description = req.body.description || "";
    product.price = Number(req.body.price);
    product.stock = Number(req.body.stock);
    product.imageUrl = req.body.imageUrl || "";

    await product.save();

    res.json({ message: "המוצר עודכן בהצלחה", product: product });
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// מחיקת מוצר
router.delete("/:id", requireLogin, requireRole("admin"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "המוצר לא נמצא" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "המוצר נמחק בהצלחה" });
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

module.exports = router;
