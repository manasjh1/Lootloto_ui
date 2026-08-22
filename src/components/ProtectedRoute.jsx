import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export default function ProtectedRoute({ children }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const token = localStorage.getItem("access_token")
  return isLoggedIn || token ? children : <Navigate to="/login" replace />
}