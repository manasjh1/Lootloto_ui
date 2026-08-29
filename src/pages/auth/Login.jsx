import React, { useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { loginUser } from "../../api/auth"
import { useAuthStore } from "../../store/authStore"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { setSession } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in both email and password.")
      return
    }
    setError("")
    setLoading(true)
    try {
      // API expects `email_id`, not `email`
      const data = await loginUser({ email_id: email, password })
      if (data?.access_token) {
        // The API returns the JWT alongside user details (name, role, etc.)
        // either nested under `user` or flattened on the response itself.
        const user = data.user || {
          name: data.name,
          role: data.role,
          email: data.email_id || email,
        }
        setSession(data.access_token, user, remember)
        // Role-based landing: staff/admin go straight to their portal,
        // everyone else goes to the storefront.
        if (user.role === "admin") navigate("/admin")
        else if (user.role === "staff") navigate("/staff")
        else navigate("/")
      } else {
        setError("Invalid response from server.")
      }
    } catch (err) {
      setError(err.message || "Failed to sign in. Check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  // Ticker lines
  const quirkyLines = useMemo(() => [
    '🛺 LOOTLOOTO — SASTA BHI, SUNDAR BHI, SLAY BHI',
    '📉 GIR GAYA PRICE, GIR GAYA',
    '💸 COD accepted, excuses nahi',
    '🔥 New thela drops every Shanivaar',
    '🧿 Bargaining is a personality trait here',
    '👛 Your wallet vs. this bazaar: wallet loses'
  ], [])

  // Generate SVG bunting flags along curve
  const buntingItems = useMemo(() => {
    const palette = ['#FF7A1A', '#F0177B', '#FFC94A', '#0B6E4F', '#7A5CFF']
    const bez = (t) => {
      const x = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 500 + t * t * 990
      const y = (1 - t) * (1 - t) * 6 + 2 * (1 - t) * t * 68 + t * t * 6
      return { x, y }
    }
    const N = 20
    const items = []
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) / N
      const p = bez(t)
      const cx = p.x
      const sy = p.y
      const kind = i % 3
      const color = palette[i % palette.length]
      items.push({ id: i, cx, sy, kind, color })
    }
    return items
  }, [])

  return (
    <div style={{ background: "#181030", color: "#F7EEDD", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", overflowX: "hidden", position: "relative" }} id="stage">
      
      {/* Glow Circles */}
      <div style={{ position: "absolute", top: 120, left: -140, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #FF7A1A55, transparent 60%)", filter: "blur(6px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 420, right: -160, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle at 60% 40%, #F0177B44, transparent 60%)", filter: "blur(8px)", pointerEvents: "none" }} />

      {/* TOP MARQUEE TICKER */}
      <div style={{ background: "#0f0a22", borderBottom: "1px solid rgba(255,201,74,0.18)", position: "relative" }}>
        <div style={{ background: "#181030", color: "#F7EEDD", overflow: "hidden", whiteSpace: "nowrap", padding: "11px 0", borderBottom: "1px solid rgba(255,201,74,0.14)", position: "relative" }}>
          <div style={{ position: "absolute", inset: "0 auto 0 0", width: 80, background: "linear-gradient(90deg,#181030,transparent)", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: "0 0 0 auto", width: 80, background: "linear-gradient(270deg,#181030,transparent)", zIndex: 2, pointerEvents: "none" }} />
          
          <div style={{ display: "inline-block", willChange: "transform", animation: "scroll-left 40s linear infinite", fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 14, letterSpacing: "0.6px" }}>
            {[...quirkyLines, ...quirkyLines, ...quirkyLines].map((line, idx) => (
              <React.Fragment key={idx}>
                <span style={{ margin: "0 24px" }}>{line}</span>
                <span style={{ margin: "0 18px", color: "#181030", opacity: 0.5 }}>✦</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Shanivaar Special Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "10px 6%", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#FFC94A", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>
            Shanivaar Special
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", border: "1px solid rgba(255,201,74,0.35)", borderRadius: 999, fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 14, color: "#F7EEDD" }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#0B6E4F", boxShadow: "0 0 0 3px rgba(11,110,79,0.28)", animation: "dot-pulse 1.4s ease-in-out infinite" }} />
            Sign in to claim <span style={{ color: "#FF7A1A", fontWeight: 800 }}>40% Off</span>
          </span>
        </div>
      </div>

      {/* NAVBAR HEADER */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 6%", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "conic-gradient(from 90deg,#F0177B,#FF7A1A,#FFC94A,#F0177B)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 17, color: "#181030", transform: "rotate(-8deg)", border: "3px solid #F7EEDD", boxShadow: "3px 3px 0 #F0177B" }}>LL</div>
          <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: "0.5px" }}>LOOT<span style={{ color: "#FFC94A" }}>LOOTO</span></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 14, opacity: 0.8 }} className="nav-links-hide">Naya customer ho?</span>
          <Link to="/signup" style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 14, padding: "8px 20px", borderRadius: 999, textDecoration: "none", background: "transparent", color: "#FFC94A", border: "2px solid #FFC94A" }}>
            Create Account 🛍️
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT CONTAINER */}
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 6% 80px", position: "relative" }}>
        
        {/* SVG Bunting String */}
        <svg width="100%" height="60" viewBox="0 0 1000 60" preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0, right: 0, display: "block", pointerEvents: "none" }}>
          <path d="M10 6 Q 500 58, 990 6" stroke="#FFC94A" strokeWidth="1.2" fill="none" opacity="0.45" strokeDasharray="2 4" />
          <g>
            {buntingItems.map((item) => (
              <React.Fragment key={item.id}>
                <line x1={item.cx} y1={item.sy - 2} x2={item.cx} y2={item.sy} stroke="#FFC94A" strokeWidth="0.8" opacity="0.6" />
                {item.kind === 0 && <polygon points={`${item.cx - 6},${item.sy} ${item.cx + 6},${item.sy} ${item.cx},${item.sy + 14}`} fill={item.color} opacity="0.9" />}
                {item.kind === 1 && <circle cx={item.cx} cy={item.sy + 8} r="5" fill={item.color} opacity="0.9" />}
                {item.kind === 2 && <rect x={item.cx - 4} y={item.sy + 1} width="8" height="13" rx="2" fill={item.color} opacity="0.9" />}
              </React.Fragment>
            ))}
          </g>
        </svg>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, alignItems: "center", marginTop: 20 }}>
          
          {/* LEFT HERO / BRAGGING SIDE */}
          <div style={{ position: "relative", paddingRight: 20 }}>
            
            {/* Floating Stickers */}
            <span className="sticker-1" style={{ position: "absolute", top: "-28px", left: "-10px", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 12, background: "#F7EEDD", color: "#181030", padding: "14px 10px", borderRadius: "50%", border: "2px dashed #181030", boxShadow: "4px 4px 0 rgba(0,0,0,0.35)", textAlign: "center" }}>₹99<br />ONLY</span>
            <span className="sticker-2" style={{ position: "absolute", bottom: "-30px", right: "10px", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 12, background: "#0B6E4F", color: "#F7EEDD", padding: "14px 10px", borderRadius: "50%", border: "2px dashed #F7EEDD", boxShadow: "4px 4px 0 rgba(0,0,0,0.35)", textAlign: "center" }}>100%<br />DESI</span>

            {/* Pin Note */}
            <div style={{ position: "relative", marginBottom: 32, display: "inline-block", background: "#FFC94A", color: "#181030", padding: "14px 18px", transform: "rotate(4deg)", fontFamily: "'Kalam', cursive", fontSize: 16, fontWeight: 700, boxShadow: "4px 6px 10px rgba(0,0,0,0.35)", maxWidth: 260 }}>
              <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: "#F0177B", border: "2px solid #181030" }} />
              "beta login kar lo, warna favourite deal miss ho jaayegi" — aunty wisdom
            </div>

            <div style={{ display: "inline-block", fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, background: "#241a45", border: "1px dashed #FFC94A", color: "#FFC94A", padding: "6px 16px", borderRadius: 999, marginBottom: 20 }}>
              📍 1-CLICK AUTH FOR MAX BHAAV DISCOUNT
            </div>

            <h1 style={{ fontFamily: "'Baloo 2'", fontSize: "clamp(38px,6vw,68px)", lineHeight: 1.15, fontWeight: 800, margin: "0 0 16px" }}>
              BAZAR ME <span style={{ color: "#FF7A1A", WebkitTextStroke: "1px #F7EEDD" }}>WAPAS</span><br />
              AAO! <span style={{ color: "#F0177B" }}>SHOP SLAY 🛍️</span>
            </h1>

            {/* Auntie Approved Stamp & Subtitle - Clean side-by-side flex layout */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 16, color: "#F0177B", border: "4px double #F0177B", padding: "4px 12px", borderRadius: 6, letterSpacing: 2, transform: "rotate(-12deg)", animation: "stamp-in 0.8s ease-out both", textShadow: "1px 1px 0 rgba(240,23,123,0.2)", display: "inline-block", flexShrink: 0 }}>
                AUNTY<br />APPROVED
              </div>
              <div style={{ fontFamily: "'Kalam', cursive", fontSize: 20, color: "#FFC94A" }}>
                *sasta, sundar, slay login ✨
              </div>
            </div>

            <p style={{ fontSize: 16, opacity: 0.82, lineHeight: 1.6, maxWidth: 440 }}>
              Access your Jhola, track live Shanivaar drops, and grab exclusive member bhaav discounts on every item.
            </p>
          </div>

          {/* RIGHT FORM CARD */}
          <div style={{ background: "#241a45", border: "2px solid rgba(247,238,221,0.18)", borderRadius: 24, padding: "36px 32px", boxShadow: "6px 6px 0 #F0177B", position: "relative" }}>
            
            <div style={{ marginBottom: 28, textAlign: "center" }}>
              <h2 style={{ fontFamily: "'Baloo 2'", fontSize: 30, fontWeight: 800, margin: "0 0 6px" }}>Sign in to LootLooto</h2>
              <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>Enter your credentials to enter the bazaar</p>
            </div>

            {error && (
              <div style={{ background: "rgba(240,23,123,0.15)", border: "1.5px solid #F0177B", color: "#F7EEDD", borderRadius: 12, padding: "12px 16px", fontSize: 13, marginBottom: 22, display: "flex", alignItems: "center", gap: 10 }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Email */}
              <div>
                <label style={{ display: "block", fontFamily: "'Space Mono'", fontSize: 11, fontWeight: 700, color: "#FFC94A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                  EMAIL ADDRESS
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aunty@lootlooto.com"
                  required
                  style={{ width: "100%", padding: "14px 16px", background: "#181030", border: "1.5px solid rgba(247,238,221,0.2)", borderRadius: 12, color: "#F7EEDD", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontFamily: "'Space Mono'", fontSize: 11, fontWeight: 700, color: "#FFC94A", letterSpacing: 1, textTransform: "uppercase" }}>
                    PASSWORD
                  </label>
                  <a href="#" style={{ fontSize: 12, color: "#F7EEDD", opacity: 0.7, textDecoration: "underline" }}>Forgot?</a>
                </div>
                <div style={{ position: "relative" }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ width: "100%", padding: "14px 44px 14px 16px", background: "#181030", border: "1.5px solid rgba(247,238,221,0.2)", borderRadius: 12, color: "#F7EEDD", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#F7EEDD", opacity: 0.7, cursor: "pointer", fontSize: 14 }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Remember checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setRemember(!remember)}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: "2px solid #FFC94A", background: remember ? "#FFC94A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#181030", fontWeight: 800, fontSize: 12 }}>
                  {remember && "✓"}
                </div>
                <span style={{ fontSize: 13, opacity: 0.85 }}>Keep me logged in for next Shanivaar</span>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  fontFamily: "'Baloo 2'", 
                  fontWeight: 800, 
                  fontSize: 18, 
                  padding: "15px", 
                  borderRadius: 14, 
                  border: "3px solid #181030", 
                  background: "#FFC94A", 
                  color: "#181030", 
                  cursor: loading ? "wait" : "pointer", 
                  boxShadow: "4px 4px 0 #F0177B",
                  marginTop: 6
                }}
              >
                {loading ? "Signing in..." : "Ghoomo Bazar (Sign In) 🚀"}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0", opacity: 0.5 }}>
                <div style={{ flex: 1, height: 1, background: "#F7EEDD" }} />
                <span style={{ fontSize: 11, fontFamily: "'Space Mono'" }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "#F7EEDD" }} />
              </div>

              {/* Social Login Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button type="button" style={{ background: "#181030", border: "1.5px solid rgba(247,238,221,0.2)", borderRadius: 12, padding: "10px", color: "#F7EEDD", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .55 4.1 1.6l3-3C17.3 1.9 14.8 1 12 1 7.7 1 3.99 3.47 2.2 7.07l3.5 2.72C6.55 7.09 9.05 5 12 5Z"/><path fill="#34A853" d="M23 12c0-.8-.07-1.57-.2-2.3H12v4.4h6.19c-.27 1.43-1.08 2.63-2.3 3.44l3.55 2.75C21.55 18.34 23 15.42 23 12Z"/><path fill="#4A90E2" d="M5.7 14.28c-.22-.65-.35-1.35-.35-2.28s.13-1.63.35-2.28L2.2 7C1.44 8.5 1 10.2 1 12s.44 3.5 1.2 5l3.5-2.72Z"/><path fill="#FBBC05" d="M12 23c3 0 5.5-.99 7.34-2.71l-3.55-2.75c-.99.66-2.26 1.06-3.79 1.06-2.95 0-5.45-2.09-6.3-4.79L2.2 16.53C3.99 20.53 7.7 23 12 23Z"/></svg>
                  Google
                </button>
                <button type="button" style={{ background: "#181030", border: "1.5px solid rgba(247,238,221,0.2)", borderRadius: 12, padding: "10px", color: "#F7EEDD", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#F7EEDD"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z"/></svg>
                  Apple
                </button>
              </div>

            </form>

            <div style={{ marginTop: 24, textAlign: "center", fontSize: 14 }}>
              <span opacity={0.7}>Account nahi hai? </span>
              <Link to="/signup" style={{ color: "#FFC94A", fontWeight: 700, textDecoration: "underline" }}>
                Naya Account Banayo 🛍️
              </Link>
            </div>

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer style={{ textAlign: "center", padding: "40px 6% 30px", borderTop: "1px solid rgba(247,238,221,0.14)", fontSize: 13, opacity: 0.65 }}>
        <div style={{ fontFamily: "'Baloo 2'", fontSize: 20, color: "#FFC94A", marginBottom: 6 }}>LOOTLOOTO</div>
        <div style={{ fontFamily: "'Kalam', cursive", fontSize: 15 }}>Bazar band nahi hota, bas tab bandh hota hai jab paisa khatam ho jaaye.</div>
      </footer>

    </div>
  )
}