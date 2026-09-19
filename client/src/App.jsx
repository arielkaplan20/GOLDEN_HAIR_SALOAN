// ============================================================
// הקובץ הראשי של צד הלקוח
// כאן מוגדרים כל המסכים ומי רשאי להיכנס לכל אחד מהם
// ============================================================

import { Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "./api";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import BarberCalendar from "./pages/BarberCalendar";
import BarberSchedule from "./pages/BarberSchedule";
import AdminUsers from "./pages/AdminUsers";
import AdminAppointments from "./pages/AdminAppointments";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";

// עוטף מסך שדורש התחברות.
// אפשר גם להגביל לתפקיד מסוים בעזרת role.
//
// חשוב להבין: זו הגנה על הממשק בלבד, כדי שהמשתמש לא יראה
// מסכים שלא שייכים לו. ההגנה האמיתית היא בשרת,
// בקובץ middleware/auth.js
function Protected({ children, role }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  const user = getUser();

  return (
    <>
      <Navbar />

      <Routes>
        {/* מסכים פתוחים */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        {/* דף הבית - לכל משתמש מחובר */}
        <Route
          path="/"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        />

        {/* מסכי הלקוח */}
        <Route
          path="/book"
          element={
            <Protected role="customer">
              <BookAppointment />
            </Protected>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <Protected role="customer">
              <MyAppointments />
            </Protected>
          }
        />
        <Route
          path="/shop"
          element={
            <Protected role="customer">
              <Shop />
            </Protected>
          }
        />
        <Route
          path="/product/:id"
          element={
            <Protected role="customer">
              <ProductPage />
            </Protected>
          }
        />
        <Route
          path="/cart"
          element={
            <Protected role="customer">
              <Cart />
            </Protected>
          }
        />
        <Route
          path="/checkout"
          element={
            <Protected role="customer">
              <Checkout />
            </Protected>
          }
        />
        <Route
          path="/my-orders"
          element={
            <Protected role="customer">
              <MyOrders />
            </Protected>
          }
        />

        {/* פרופיל - לכל משתמש */}
        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />

        {/* מסכי הספר */}
        <Route
          path="/barber/calendar"
          element={
            <Protected role="barber">
              <BarberCalendar />
            </Protected>
          }
        />
        <Route
          path="/barber/schedule"
          element={
            <Protected role="barber">
              <BarberSchedule />
            </Protected>
          }
        />

        {/* מסכי המנהל */}
        <Route
          path="/admin/users"
          element={
            <Protected role="admin">
              <AdminUsers />
            </Protected>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <Protected role="admin">
              <AdminAppointments />
            </Protected>
          }
        />
        <Route
          path="/admin/products"
          element={
            <Protected role="admin">
              <AdminProducts />
            </Protected>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <Protected role="admin">
              <AdminOrders />
            </Protected>
          }
        />

        {/* כל כתובת אחרת מחזירה לדף הבית */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
