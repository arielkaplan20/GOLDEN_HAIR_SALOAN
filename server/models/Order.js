// מודל הזמנה בחנות
//
// שים לב: פרטי כרטיס האשראי לא נשמרים כאן ולא בשום מקום אחר במערכת.
// שומרים רק את מספר ההזמנה ואת העובדה שהתשלום אושר.

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,              // שומרים גם את השם, כדי שההזמנה תישאר קריאה
      quantity: Number,
      priceAtPurchase: Number,   // המחיר בזמן הרכישה, כי המחיר בחנות עשוי להשתנות
    },
  ],

  totalPrice: { type: Number, required: true },

  deliveryType: { type: String, enum: ["pickup", "delivery"], required: true },

  // פרטי המזמין
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },

  address: { type: String, default: "" },      // במשלוח
  pickupPoint: { type: String, default: "" },  // באיסוף עצמי
  notes: { type: String, default: "" },

  status: {
    type: String,
    enum: ["paid", "preparing", "ready", "shipped", "collected", "delivered", "cancelled"],
    default: "paid",
  },

  orderDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
