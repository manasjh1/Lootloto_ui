import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

/**
 * Gates a route behind both authentication AND role membership.
 *
 * - Not logged in at all            -> /login
 * - Logged in but wrong role        -> / (home), with a state flag the
 *                                       destination can use to show a message
 * - Logged in with an allowed role  -> renders children
 *
 * Usage: <RoleProtectedRoute roles={["staff", "admin"]}><StaffPortal /></RoleProtectedRoute>
 */
export default function RoleProtectedRoute({ roles = [], children }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const user = useAuthStore((s) => s.user)

  if (!isLoggedIn) return <Navigate to="/login" replace />

  const userRole = user?.role
  const allowed = roles.length === 0 || roles.includes(userRole)

  if (!allowed) {
    return <Navigate to="/" replace state={{ accessDenied: true }} />
  }

  return children
}