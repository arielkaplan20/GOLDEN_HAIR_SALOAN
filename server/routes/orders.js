// נתיבי ההזמנות בחנות
// מממש את SUC-7 (ביצוע ההזמנה והתשלום) ואת SUC-12 (צפייה בהזמנות)

const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { requireLogin, requireRole } = require("../middleware/auth");

const router = express.Router();

// ============================================================
// יצירת מספר הזמנה
// הפורמט הוא שנה-חודש-יום ואחריו מספר אקראי בן 4 ספרות
// למשל: 20260920-4817
// ============================================================
function createOrderNumber() {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const monthText = month < 10 ? "0" + month : "" + month;
  const dayText = day < 10 ? "0" + day : "" + day;

  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return "" + year + monthText + dayText + "-" + randomPart;
}

// ============================================================
// הדמיית סליקת אשראי
//
// חשוב: בפרויקט הזה הסליקה היא הדמיה בלבד ואין חיוב אמיתי.
// במערכת אמיתית הקריאה הזו הייתה נשלחת לשירות סליקה חיצוני,
// והאתר עצמו לעולם לא היה שומר את פרטי הכרטיס.
// גם כאן הפרטים לא נשמרים בשום מקום - רק נבדקים ונזרקים.
// ============================================================
function processPayment(cardNumber, expiry, cvv) {
  if (!cardNumber || !expiry || !cvv) {
    return { approved: false, message: "צריך למלא את כל פרטי האשראי" };
  }

  // מסירים רווחים ומקפים שהמשתמש אולי הקליד
  const cleanNumber = cardNumber.replace(/[\s-]/g, "");

  if (cleanNumber.length !== 16 || isNaN(cleanNumber)) {
    return { approved: false, message: "מספר הכרטיס צריך להכיל 16 ספרות" };
  }

  if (cvv.length < 3 || cvv.length > 4 || isNaN(cvv)) {
    return { approved: false, message: "קוד האבטחה אינו תקין" };
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return { approved: false, message: "תוקף הכרטיס צריך להיות בפורמט MM/YY" };
  }

  return { approved: true, message: "התשלום אושר" };
}

// ============================================================
// SUC-7: ביצוע הזמנה חדשה
// ============================================================
router.post("/", requireLogin, async (req, res) => {
  try {
    const { items, deliveryType, fullName, phone, email, address, pickupPoint, notes, card } = req.body;

    // הסתעפות א של SUC-7 - הסל ריק
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "הסל שלך ריק" });
    }

    if (!deliveryType || !["pickup", "delivery"].includes(deliveryType)) {
      return res.status(400).json({ message: "צריך לבחור בין איסוף עצמי למשלוח" });
    }

    if (!fullName || !phone || !email) {
      return res.status(400).json({ message: "צריך למלא שם מלא, טלפון ומייל" });
    }

    if (deliveryType === "delivery" && !address) {
      return res.status(400).json({ message: "צריך למלא כתובת למשלוח" });
    }

    if (deliveryType === "pickup" && !pickupPoint) {
      return res.status(400).json({ message: "צריך לבחור נקודת איסוף" });
    }

    // בונים את פרטי ההזמנה מהמוצרים שבמסד הנתונים ולא ממה שהלקוח שלח.
    // אם נסמוך על המחיר שהגיע מהדפדפן, מישהו יוכל לשנות אותו ולשלם פחות.
    const orderItems = [];
    let totalPrice = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({ message: "אחד המוצרים בסל כבר לא קיים בחנות" });
      }

      const quantity = Number(item.quantity);

      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "הכמות של " + product.name + " אינה תקינה" });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: "אין מספיק מלאי מהמוצר " + product.name + ". נשארו " + product.stock + " יחידות",
        });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: quantity,
        priceAtPurchase: product.price,
      });

      totalPrice = totalPrice + product.price * quantity;
    }

    // הסתעפות ב של SUC-7 - אימות האשראי נכשל
    const payment = processPayment(card && card.number, card && card.expiry, card && card.cvv);

    if (!payment.approved) {
      return res.status(400).json({ message: "התשלום נכשל: " + payment.message });
    }

    // התשלום אושר, שומרים את ההזמנה ומעדכנים את המלאי
    const newOrder = new Order({
      orderNumber: createOrderNumber(),
      customerId: req.user.id,
      items: orderItems,
      totalPrice: totalPrice,
      deliveryType: deliveryType,
      fullName: fullName,
      phone: phone,
      email: email,
      address: address || "",
      pickupPoint: pickupPoint || "",
      notes: notes || "",
      status: "paid",
    });

    await newOrder.save();

    // הורדת המלאי
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const product = await Product.findById(item.productId);
      product.stock = product.stock - item.quantity;
      await product.save();
    }

    res.status(201).json({
      message: "ההזמנה בוצעה בהצלחה",
      orderNumber: newOrder.orderNumber,
      totalPrice: totalPrice,
    });
  } catch (error) {
    console.log("שגיאה בביצוע הזמנה:", error.message);
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// דרישה 22: צפייה בהזמנות קודמות
// ============================================================
router.get("/my", requireLogin, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id }).sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// דרישה 22: הזמנה חוזרת
// מחזיר את המוצרים של הזמנה קודמת כדי שהמסך יוסיף אותם לסל.
// בודקים מלאי ומחזירים את המחיר העדכני, כי הוא יכול היה להשתנות.
// ============================================================
router.get("/:id/reorder", requireLogin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "ההזמנה לא נמצאה" });
    }

    if (order.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "אין לך הרשאה לצפות בהזמנה הזו" });
    }

    const availableItems = [];
    const missingItems = [];

    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const product = await Product.findById(item.productId);

      if (!product || product.stock < item.quantity) {
        missingItems.push(item.name);
      } else {
        availableItems.push({
          productId: product._id,
          name: product.name,
          price: product.price, // המחיר העדכני, לא זה שבהזמנה הישנה
          quantity: item.quantity,
          imageUrl: product.imageUrl,
        });
      }
    }

    res.json({ items: availableItems, missing: missingItems });
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// ============================================================
// SUC-12: צפייה בכל ההזמנות - למנהל בלבד
// ============================================================
router.get("/all", requireLogin, requireRole("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "firstName lastName email")
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

// עדכון סטטוס הזמנה - למנהל בלבד
router.put("/:id/status", requireLogin, requireRole("admin"), async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["paid", "preparing", "ready", "shipped", "collected", "delivered", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "הסטטוס שנבחר אינו תקין" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "ההזמנה לא נמצאה" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "סטטוס ההזמנה עודכן" });
  } catch (error) {
    res.status(500).json({ message: "אירעה שגיאה בשרת" });
  }
});

module.exports = router;
