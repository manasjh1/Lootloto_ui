import React, { useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../../api/auth"

export default function Signup() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    agreed: true
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  // Password strength calculation
  const strengthScore = useMemo(() => {
    const p = form.password
    if (!p) return 0
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }, [form.password])

  const strengthColors = ["#1e1e1e", "#F0177B", "#FF7A1A", "#FFC94A", "#0B6E4F"]
  const strengthLabels = ["Very Weak", "Weak 😕", "Fair 😐", "Good 🙂", "Strong & Aunty Approved! 💪"]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.agreed) {
      setError("Please agree to the Terms & Privacy Policy to continue.")
      return
    }
    setError("")
    setLoading(true)
    try {
      // API expects first_name/last_name (split from the single Full Name field),
      // email_id (not email), and phone_number as a number (not phone).
      const nameParts = form.fullName.trim().split(/\s+/)
      const first_name = nameParts[0] || ""
      const last_name = nameParts.slice(1).join(" ") || first_name
      const phone_number = Number(form.phone.replace(/\D/g, ""))

      await registerUser({
        first_name,
        last_name,
        email_id: form.email,
        phone_number,
        password: form.password
      })
      navigate("/verify-email", { state: { email: form.email } })
    } catch (err) {
      setError(err.message || "Registration failed. Check your inputs.")
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
      
      {/* Background Glow Circles */}
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
            Free Nazar Battu on First Order &gt; ₹999
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
          <span style={{ fontSize: 14, opacity: 0.8 }} className="nav-links-hide">Pehle se account hai?</span>
          <Link to="/login" style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 14, padding: "8px 20px", borderRadius: 999, textDecoration: "none", background: "#FFC94A", color: "#181030", border: "2px solid #181030", boxShadow: "3px 3px 0 #F0177B" }}>
            Sign In 🔑
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, alignItems: "flex-start", marginTop: 20 }}>
          
          {/* LEFT HERO / WHY JOIN SIDE */}
          <div style={{ position: "relative", paddingRight: 20 }}>
            
            {/* Floating Stickers */}
            <span className="sticker-1" style={{ position: "absolute", top: "-28px", left: "-10px", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 12, background: "#F7EEDD", color: "#181030", padding: "14px 10px", borderRadius: "50%", border: "2px dashed #181030", boxShadow: "4px 4px 0 rgba(0,0,0,0.35)", textAlign: "center" }}>₹99<br />ONLY</span>
            <span className="sticker-2" style={{ position: "absolute", bottom: "40px", right: "10px", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 12, background: "#0B6E4F", color: "#F7EEDD", padding: "14px 10px", borderRadius: "50%", border: "2px dashed #F7EEDD", boxShadow: "4px 4px 0 rgba(0,0,0,0.35)", textAlign: "center" }}>100%<br />DESI</span>

            {/* Pin Note */}
            <div style={{ position: "relative", marginBottom: 32, display: "inline-block", background: "#FFC94A", color: "#181030", padding: "14px 18px", transform: "rotate(4deg)", fontFamily: "'Kalam', cursive", fontSize: 16, fontWeight: 700, boxShadow: "4px 6px 10px rgba(0,0,0,0.35)", maxWidth: 270 }}>
              <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: "#F0177B", border: "2px solid #181030" }} />
              "beta register kar lo, pehle order pe nazar battu bilkul free!" — aunty wisdom
            </div>

            <div style={{ display: "inline-block", fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, background: "#241a45", border: "1px dashed #FFC94A", color: "#FFC94A", padding: "6px 16px", borderRadius: 999, marginBottom: 20 }}>
              📍 1-MINUTE FAST BAZAR REGISTRATION
            </div>

            <h1 style={{ fontFamily: "'Baloo 2'", fontSize: "clamp(38px,6vw,64px)", lineHeight: 1.15, fontWeight: 800, margin: "0 0 16px" }}>
              NAYA ACCOUNT <span style={{ color: "#FF7A1A", WebkitTextStroke: "1px #F7EEDD" }}>BANAYO</span>!<br />
              JOIN THELA 🛍️
            </h1>

            {/* Auntie Approved Stamp & Subtitle */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
              <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 16, color: "#F0177B", border: "4px double #F0177B", padding: "4px 12px", borderRadius: 6, letterSpacing: 2, transform: "rotate(-12deg)", animation: "stamp-in 0.8s ease-out both", textShadow: "1px 1px 0 rgba(240,23,123,0.2)", display: "inline-block", flexShrink: 0 }}>
                AUNTY<br />APPROVED
              </div>
              <div style={{ fontFamily: "'Kalam', cursive", fontSize: 20, color: "#FFC94A" }}>
                *sasta, sundar, slay signup ✨
              </div>
            </div>

            {/* Perks List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 440 }}>
              {[
                { icon: "⚡", title: "Shanivaar Early Access", desc: "Get 24-hour early entry to new stall drops before stock runs out." },
                { icon: "🎁", title: "Free Nazar Battu", desc: "Every new registration gets a free Nazar Battu phone charm on orders above ₹999." },
                { icon: "👛", title: "Bhaav Price Protection", desc: "We negotiate directly with suppliers so you get zero bhaav-tav headache." }
              ].map((perk, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: "#241a45", border: "1px solid rgba(247,238,221,0.12)", borderRadius: 16, padding: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#181030", border: "1px solid #FFC94A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {perk.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 16, color: "#F7EEDD", marginBottom: 2 }}>{perk.title}</div>
                    <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.45 }}>{perk.desc}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT REGISTRATION FORM CARD */}
          <div style={{ background: "#241a45", border: "2px solid rgba(247,238,221,0.18)", borderRadius: 24, padding: "36px 32px", boxShadow: "6px 6px 0 #F0177B", position: "relative" }}>
            
            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <h2 style={{ fontFamily: "'Baloo 2'", fontSize: 30, fontWeight: 800, margin: "0 0 6px" }}>Create your Account</h2>
              <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>Fill in your details to start looting deals</p>
            </div>

            {error && (
              <div style={{ background: "rgba(240,23,123,0.15)", border: "1.5px solid #F0177B", color: "#F7EEDD", borderRadius: 12, padding: "12px 16px", fontSize: 13, marginBottom: 22, display: "flex", alignItems: "center", gap: 10 }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              
              {/* Full Name */}
              <div>
                <label style={{ display: "block", fontFamily: "'Space Mono'", fontSize: 11, fontWeight: 700, color: "#FFC94A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                  FULL NAME
                </label>
                <input 
                  type="text" 
                  value={form.fullName}
                  onChange={setField("fullName")}
                  placeholder="Priya Sharma"
                  required
                  style={{ width: "100%", padding: "13px 16px", background: "#181030", border: "1.5px solid rgba(247,238,221,0.2)", borderRadius: 12, color: "#F7EEDD", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontFamily: "'Space Mono'", fontSize: 11, fontWeight: 700, color: "#FFC94A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                  EMAIL ADDRESS
                </label>
                <input 
                  type="email" 
                  value={form.email}
                  onChange={setField("email")}
                  placeholder="priya@example.com"
                  required
                  style={{ width: "100%", padding: "13px 16px", background: "#181030", border: "1.5px solid rgba(247,238,221,0.2)", borderRadius: 12, color: "#F7EEDD", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: "block", fontFamily: "'Space Mono'", fontSize: 11, fontWeight: 700, color: "#FFC94A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                  PHONE NUMBER
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ padding: "13px 14px", background: "#181030", border: "1.5px solid rgba(247,238,221,0.2)", borderRadius: 12, color: "#FFC94A", fontFamily: "'Space Mono'", fontSize: 13, fontWeight: 700 }}>
                    +91
                  </span>
                  <input 
                    type="tel" 
                    value={form.phone}
                    onChange={setField("phone")}
                    placeholder="98765 43210"
                    required
                    style={{ flex: 1, padding: "13px 16px", background: "#181030", border: "1.5px solid rgba(247,238,221,0.2)", borderRadius: 12, color: "#F7EEDD", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontFamily: "'Space Mono'", fontSize: 11, fontWeight: 700, color: "#FFC94A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                  PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={form.password}
                    onChange={setField("password")}
                    placeholder="At least 8 characters"
                    required
                    style={{ width: "100%", padding: "13px 44px 13px 16px", background: "#181030", border: "1.5px solid rgba(247,238,221,0.2)", borderRadius: 12, color: "#F7EEDD", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#F7EEDD", opacity: 0.7, cursor: "pointer", fontSize: 14 }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step} 
                      style={{ 
                        flex: 1, 
                        height: 4, 
                        borderRadius: 2, 
                        background: step <= strengthScore ? strengthColors[strengthScore] : "rgba(247,238,221,0.15)",
                        transition: "background 0.2s ease" 
                      }} 
                    />
                  ))}
                </div>
                {form.password && (
                  <div style={{ fontSize: 11, color: strengthColors[strengthScore], marginTop: 4, fontFamily: "'Space Mono'" }}>
                    {strengthLabels[strengthScore]}
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }} onClick={() => setForm(f => ({ ...f, agreed: !f.agreed }))}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: "2px solid #FFC94A", background: form.agreed ? "#FFC94A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#181030", fontWeight: 800, fontSize: 12, flexShrink: 0, marginTop: 2 }}>
                  {form.agreed && "✓"}
                </div>
                <span style={{ fontSize: 12.5, opacity: 0.8, lineHeight: 1.4 }}>
                  I agree to the <a href="#" style={{ color: "#FFC94A" }}>Terms</a> and <a href="#" style={{ color: "#FFC94A" }}>Privacy Policy</a>, and want Shanivaar drop updates.
                </span>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  fontFamily: "'Baloo 2'", 
                  fontWeight: 800, 
                  fontSize: 18, 
                  padding: "14px", 
                  borderRadius: 14, 
                  border: "3px solid #181030", 
                  background: "#FFC94A", 
                  color: "#181030", 
                  cursor: loading ? "wait" : "pointer", 
                  boxShadow: "4px 4px 0 #F0177B",
                  marginTop: 6
                }}
              >
                {loading ? "Creating account..." : "Banayo Account (Register) 🚀"}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0", opacity: 0.5 }}>
                <div style={{ flex: 1, height: 1, background: "#F7EEDD" }} />
                <span style={{ fontSize: 11, fontFamily: "'Space Mono'" }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "#F7EEDD" }} />
              </div>

              {/* Social Login Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button type="button" style={{ background: "#181030", border: "1.5px solid rgba(247,238,221,0.2)", borderRadius: 12, padding: "10px", color: "#F7EEDD", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .55 4.1 1.6l3-3C17.3 1.9 14.8 1 12 1 7.7 1 3.99 3.47 2.2 7.07l3.5 2.72C6.55 7.09 9.05 5 12 5Z"/><path fill="#34A853" d="M23 12c0-.8-.07-1.57-.2-2.3H12v4.4h6.19c-.27 1.43-1.08 2.63-2.3 3.44l3.55 2.75C21.55 18.34 23 15.42 23 12Z"/><path fill="#4A90E2" d="M5.7 14.28c-.22-.65-.35-1.35-.35-2.28s.13-1.63.35-2.28L2.2 7C1.44 8.5 1 10.2 1 12s.44 3.5 1.2 5l3.5-2.72Z"/><path fill="#FBBC05" d="M12 23c3 0 5.5-.99 7.34-2.71l-3.55-2.75c-.99.26-2.26 1.06-3.79 1.06-2.95 0-5.45-2.09-6.3-4.79L2.2 16.53C3.99 20.53 7.7 23 12 23Z"/></svg>
                  Google
                </button>
                <button type="button" style={{ background: "#181030", border: "1.5px solid rgba(247,238,221,0.2)", borderRadius: 12, padding: "10px", color: "#F7EEDD", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#F7EEDD"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z"/></svg>
                  Apple
                </button>
              </div>

            </form>

            <div style={{ marginTop: 22, textAlign: "center", fontSize: 14 }}>
              <span opacity={0.7}>Pehle se account hai? </span>
              <Link to="/login" style={{ color: "#FFC94A", fontWeight: 700, textDecoration: "underline" }}>
                Sign In Karo 🔑
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