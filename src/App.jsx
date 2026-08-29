import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Signup        from "./pages/auth/Signup"
import Login         from "./pages/auth/Login"
import VerifyEmail   from "./pages/auth/VerifyEmail"
import Home          from "./pages/Home"
import ProductDetail from "./pages/ProductDetail"
import StaffPortal   from "./pages/StaffPortal"
import AdminPortal   from "./pages/AdminPortal"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleProtectedRoute from "./components/RoleProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/signup"       element={<Signup />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/product/:idOrSlug" element={<ProductDetail />} />
        <Route
          path="/staff"
          element={
            <RoleProtectedRoute roles={["staff", "admin"]}>
              <StaffPortal />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute roles={["admin"]}>
              <AdminPortal />
            </RoleProtectedRoute>
          }
        />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}