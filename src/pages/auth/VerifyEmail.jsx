import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { resendVerification, verifyOtp } from "../../api/auth"

export default function VerifyEmail() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email || ""

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")
  const refs = useRef([])

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setTimer(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  function handleInput(i, val) {
    const v = val.replace(/\D/g, "").slice(-1)
    const next = [...otp]; next[i] = v; setOtp(next)
    setError("")
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  function handleKey(i, e) {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus()
      const next = [...otp]; next[i - 1] = ""; setOtp(next)
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const next = [...otp]
    text.split("").forEach((c, i) => { next[i] = c })
    setOtp(next)
    refs.current[Math.min(text.length, 5)]?.focus()
  }

  async function handleVerify() {
    const code = otp.join("")
    if (code.length < 6) return setError("Enter the complete 6-digit code.")
    setLoading(true)
    setError("")
    try {
      await verifyOtp({ email_id: email, otp: code })
      navigate("/login", { state: { verified: true } })
    } catch (err) {
      setError(err.message || "Invalid OTP. Try again.")
      setOtp(["", "", "", "", "", ""])
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    try {
      await resendVerification(email)
      setTimer(60)
      setCanResend(false)
      setOtp(["", "", "", "", "", ""])
      refs.current[0]?.focus()
    } catch (_) {}
    finally { setResending(false) }
  }

  const mm = String(Math.floor(timer / 60)).padStart(2, "0")
  const ss = String(timer % 60).padStart(2, "0")
  const full = otp.every(v => v)

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={s.logo}>LT</div>
          <Link to="/signup" style={{ fontSize: 13, color: "#8a8a8a", textDecoration: "none" }}>← Back</Link>
        </div>

        <div style={s.iconWrap}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff4438" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
          </svg>
        </div>

        <h2 style={s.heading}>Enter verification code</h2>
        <p style={s.sub}>
          We sent a 6-digit code to{" "}
          <span style={{ color: "#f5f5f5", fontWeight: 600 }}>{email || "your email"}</span>.
        </p>

        <div style={s.otpRow} onPaste={handlePaste}>
          {otp.map((v, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              maxLength={1}
              value={v}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              style={{
                ...s.otpBox,
                ...(v ? s.otpFilled : {}),
                ...(i === otp.findIndex(x => !x) && !full ? s.otpActive : {}),
              }}
            />
          ))}
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        <div style={s.timerRow}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#8a8a8a" }}>
            <span style={s.dot} /> Auto-detecting…
          </span>
          {canResend
            ? <button onClick={handleResend} disabled={resending} style={s.resendBtn}>
                {resending ? "Sending…" : "Resend OTP"}
              </button>
            : <span style={{ color: "#8a8a8a", fontSize: 13 }}>
                Resend in <span style={{ color: "#f5f5f5", fontWeight: 600 }}>{mm}:{ss}</span>
              </span>
          }
        </div>

        <button
          onClick={handleVerify}
          disabled={!full || loading}
          style={{ ...s.btnPrimary, opacity: full ? 1 : 0.55 }}
        >
          {loading ? "Verifying…" : "Verify & continue"}
        </button>

        <div style={s.footer}>
          Didn't get it? Check spam, or{" "}
          <Link to="#" style={{ color: "#ff4438" }}>contact support</Link>.
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: "#0e0e0e", color: "#f5f5f5", fontFamily: "'Inter',system-ui,sans-serif", WebkitFontSmoothing: "antialiased" },
  card: { width: "100%", maxWidth: 460, background: "#141414", border: "1px solid #1e1e1e", borderRadius: 20, padding: 44 },
  logo: { width: 34, height: 34, background: "#ff4438", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#0e0e0e" },
  iconWrap: { width: 56, height: 56, background: "rgba(255,68,56,.14)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 },
  heading: { margin: "0 0 8px", fontSize: 26, fontWeight: 700, letterSpacing: "-.02em" },
  sub: { margin: "0 0 28px", color: "#a8a8a8", fontSize: 14, lineHeight: 1.55 },
  otpRow: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 16 },
  otpBox: { width: "100%", aspectRatio: "1", background: "#0e0e0e", border: "1.5px solid #1e1e1e", borderRadius: 12, textAlign: "center", fontSize: 24, fontWeight: 700, color: "#f5f5f5", outline: "none", fontFamily: "inherit", transition: "all .15s", boxSizing: "border-box" },
  otpFilled: { borderColor: "#ff4438", color: "#ff4438" },
  otpActive: { borderColor: "#ff4438" },
  errorBox: { padding: "10px 14px", background: "rgba(255,68,56,.1)", border: "1px solid rgba(255,68,56,.3)", borderRadius: 10, fontSize: 13, color: "#ff6b60", marginBottom: 16 },
  timerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, fontSize: 13 },
  dot: { width: 6, height: 6, background: "#3ec26a", borderRadius: "50%", boxShadow: "0 0 8px #3ec26a", display: "inline-block" },
  resendBtn: { background: "none", border: "none", color: "#ff4438", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnPrimary: { width: "100%", background: "#ff4438", color: "#0e0e0e", border: "none", borderRadius: 12, padding: 15, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "background .15s" },
  footer: { marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e1e1e", fontSize: 12, color: "#6a6a6a", textAlign: "center" },
}