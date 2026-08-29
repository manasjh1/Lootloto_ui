import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Signup        from "./pages/auth/Signup"
import Login         from "./pages/auth/Login"
import VerifyEmail   from "./pages/auth/VerifyEmail"
import Home          from "./pages/Home"
import StaffPortal   from "./pages/StaffPortal"
import RoleProtectedRoute from "./components/ProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/signup"       element={<Signup />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/staff"
          element={
            <RoleProtectedRoute roles={["staff", "admin"]}>
              <StaffPortal />
            </RoleProtectedRoute>
          }
        />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}