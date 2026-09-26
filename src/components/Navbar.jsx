import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { logoutUser } from "../api/auth"

export default function Navbar({ cartCount = 0 }) {
  const { isLoggedIn, clearUser, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (err) {
      console.error(err)
    }
    clearUser()
    navigate("/")
  }

  return (
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 6%", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "conic-gradient(from 90deg,#F0177B,#FF7A1A,#FFC94A,#F0177B)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 17, color: "#181030", transform: "rotate(-8deg)", border: "3px solid #181030", boxShadow: "3px 3px 0 #F0177B" }}>LL</div>
        <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: "0.5px" }}>LOOT<span style={{ color: "#FF7A1A" }}>LOOTO</span></div>
      </div>

      <div style={{ display: "flex", gap: 32, fontSize: 15, fontWeight: 500 }} className="nav-links-hide">
        <Link to="/products" style={{ textDecoration: "none", opacity: 0.85, color: "inherit" }}>Stalls</Link>
        <Link to="/products?filter=new" style={{ textDecoration: "none", opacity: 0.85, color: "inherit" }}>New Aaya</Link>
        <Link to="/products?filter=sale" style={{ textDecoration: "none", opacity: 0.85, color: "inherit" }}>Sale</Link>
        <Link to="/#slogans" style={{ textDecoration: "none", opacity: 0.85, color: "inherit" }}>About Bazar</Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {isLoggedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontFamily: "'Space Mono'", color: "#FF7A1A" }}>{user?.email || "User"}</span>
            <button onClick={handleLogout} style={{ background: "transparent", color: "#181030", border: "1px solid rgba(24,16,48,0.3)", padding: "6px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer" }}>Logout</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link to="/login" style={{ textDecoration: "none", color: "#181030", fontSize: 13, fontWeight: 600, padding: "6px 12px" }}>Login</Link>
          </div>
        )}
        <button style={{ background: "#F0177B", color: "#F7EEDD", border: "3px solid #181030", padding: "10px 22px", borderRadius: 999, fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "4px 4px 0 #FFC94A" }}>
          JHOLA ({cartCount}) 🛒
        </button>
      </div>
    </nav>
  )
}
