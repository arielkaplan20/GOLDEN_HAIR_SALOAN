// ============================================================
// כל הפניות לשרת עוברות דרך הקובץ הזה
//
// היתרון: אם משנים משהו בדרך שבה פונים לשרת,
// משנים אותו במקום אחד ולא ב-20 מסכים שונים.
// ============================================================

// ---------- ניהול האסימון והמשתמש ----------
// שומרים אותם ב-localStorage כדי שהמשתמש יישאר מחובר
// גם אחרי רענון של הדף

export function saveLogin(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const userText = localStorage.getItem("user");

  if (!userText) {
    return null;
  }

  return JSON.parse(userText);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("cart");
}

// ---------- הפנייה לשרת ----------

async function request(url, method, body) {
  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // אם המשתמש מחובר, מצרפים את האסימון לכל בקשה
  const token = getToken();
  if (token) {
    options.headers["Authorization"] = "Bearer " + token;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch("/api" + url, options);
  const data = await response.json();

  if (!response.ok) {
    // אם האסימון פג, מנתקים את המשתמש ומחזירים אותו לדף הכניסה
    if (response.status === 401) {
      logout();
      window.location.href = "/login";
    }

    // זורקים שגיאה עם ההודעה מהשרת, כדי שהמסך יוכל להציג אותה
    throw new Error(data.message || "אירעה שגיאה");
  }

  return data;
}

export function get(url) {
  return request(url, "GET");
}

export function post(url, body) {
  return request(url, "POST", body);
}

export function put(url, body) {
  return request(url, "PUT", body);
}

export function remove(url) {
  return request(url, "DELETE");
}

// ---------- ניהול סל הקניות ----------
// הסל נשמר בדפדפן ולא בשרת, כי הוא זמני
// ורק ברגע התשלום הוא הופך להזמנה אמיתית

export function getCart() {
  const cartText = localStorage.getItem("cart");

  if (!cartText) {
    return [];
  }

  return JSON.parse(cartText);
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));

  // מודיעים לסרגל העליון שהסל השתנה, כדי שיעדכן את המונה
  window.dispatchEvent(new Event("cart-changed"));
}

export function addToCart(product, quantity) {
  const cart = getCart();

  // אם המוצר כבר בסל, רק מגדילים את הכמות
  const existing = cart.find((item) => item.productId === product._id);

  if (existing) {
    existing.quantity = existing.quantity + quantity;
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      imageUrl: product.imageUrl,
    });
  }

  saveCart(cart);
}

export function removeFromCart(productId) {
  const cart = getCart();
  const newCart = cart.filter((item) => item.productId !== productId);
  saveCart(newCart);
}

export function clearCart() {
  localStorage.removeItem("cart");
  window.dispatchEvent(new Event("cart-changed"));
}

export function getCartTotal() {
  const cart = getCart();
  let total = 0;

  for (let i = 0; i < cart.length; i++) {
    total = total + cart[i].price * cart[i].quantity;
  }

  return total;
}
