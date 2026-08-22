import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Signup        from "./pages/auth/Signup"
import Login         from "./pages/auth/Login"
import VerifyEmail   from "./pages/auth/VerifyEmail"
import Home          from "./pages/Home"
import ProtectedRoute from "./components/ProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup"       element={<Signup />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}