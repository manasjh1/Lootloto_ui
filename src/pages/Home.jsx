import React, { useState, useEffect, useRef, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { logoutUser } from "../api/auth"
import { getProducts } from "../api/products"

export default function Home() {
  const [cartCount, setCartCount] = useState(0)
  const [sloganIndex, setSloganIndex] = useState(0)
  const [sloganAnim, setSloganAnim] = useState(true)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastText, setToastText] = useState("")
  const [toastAnim, setToastAnim] = useState("toast-in")
  
  // Backend products state
  const [backendProducts, setBackendProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)

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

  // Fetch backend uploaded products
  useEffect(() => {
    let isMounted = true
    async function loadBackendProducts() {
      try {
        setLoadingProducts(true)
        const data = await getProducts()
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setBackendProducts(data)
          } else if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
            setBackendProducts(data.products)
          }
        }
      } catch (err) {
        console.log("No active backend products endpoint found, rendering Shani Bazar stalls:", err.message)
      } finally {
        if (isMounted) setLoadingProducts(false)
      }
    }
    loadBackendProducts()
    return () => { isMounted = false }
  }, [])

  // Buyers list
  const buyers = useMemo(() => [
    { name: 'Priya', city: 'Delhi', item: 'Bhaav Kam Karo Tee' },
    { name: 'Rohan', city: 'Indore', item: 'Nazar Battu Charm' },
    { name: 'Ayesha', city: 'Lucknow', item: 'Chaandni Jhumkas' },
    { name: 'Karan', city: 'Pune', item: 'Sabzi-to-Slay Tote' },
    { name: 'Meher', city: 'Jaipur', item: 'Bhaav Kam Karo Tee' },
    { name: 'Devansh', city: 'Surat', item: 'Nazar Battu Charm' },
    { name: 'Ishita', city: 'Kolkata', item: 'Chaandni Jhumkas' },
    { name: 'Aarav', city: 'Chandigarh', item: 'Sabzi-to-Slay Tote' },
    { name: 'Zoya', city: 'Bhopal', item: 'Nazar Battu Charm' },
    { name: 'Yash', city: 'Nagpur', item: 'Bhaav Kam Karo Tee' },
    { name: 'Simran', city: 'Amritsar', item: 'Chaandni Jhumkas' },
    { name: 'Kabir', city: 'Hyderabad', item: 'Sabzi-to-Slay Tote' }
  ], [])

  // Slogans list
  const slogans = useMemo(() => [
    '"Retail therapy, but make it desi."',
    '"Gir gaya price, gir gaya."',
    '"Sasta bhi, sundar bhi, slay bhi."',
    '"Bargain karo, brag karo."',
    '"Har Shanivaar, ek naya pyaar (product)."',
    '"No cap, only thela."',
    '"Cash on delivery, drama on Instagram."',
    '"Your paycheck\'s favourite Saturday plan."',
    '"Auntie-approved, bestie-tested."',
    '"Mumma poochegi kitne ka liya, jhooth bol dena."',
    '"Overthinking outfits since forever, we just make it cheaper."'
  ], [])

  // Quirky ticker lines
  const quirkyLines = useMemo(() => [
    '🛺 LOOTLOOTO — SASTA BHI, SUNDAR BHI, SLAY BHI',
    '📉 GIR GAYA PRICE, GIR GAYA',
    '💸 COD accepted, excuses nahi',
    '🔥 New thela drops every Shanivaar',
    '🧿 Bargaining is a personality trait here',
    '👛 Your wallet vs. this bazaar: wallet loses',
    '🫡 Return policy: sirf emotional support milega',
    '🪔 Free nazar battu with every order over ₹999',
    '☕ Chai break? Bazar 24×7 hai bhai'
  ], [])

  // Default Shani Bazar stalls
  const defaultStalls = useMemo(() => [
    {
      id: "def-1",
      title: "Bhaav Kam Karo Tee",
      subtitle: "Oversized Tee\n\"Bhaav Kam Karo\"",
      description: "100% cotton, 200% attitude. For people who negotiate everything.",
      price: 549,
      originalPrice: 899,
      badge: "GIR GAYA PRICE 📉",
      badgeBg: "#0B6E4F",
      gradient: "linear-gradient(135deg,#FF7A1A,#FFC94A)",
      textColor: "#181030",
      rotation: "-1.4deg"
    },
    {
      id: "def-2",
      title: "Chaandni Jhumkas",
      subtitle: "Jhumka\nEarrings",
      description: "Loud enough to hear you walk in. Not loud enough for your boss to notice.",
      price: 349,
      gradient: "linear-gradient(135deg,#F0177B,#ff8fc0)",
      textColor: "#181030",
      rotation: "1.4deg"
    },
    {
      id: "def-3",
      title: "Nazar Battu Charm",
      subtitle: "Phone Charm\n\"Nazar Battu\"",
      description: "Protects your phone from evil eye and butterfingers, mostly the second one.",
      price: 199,
      badge: "NEW ✨",
      badgeBg: "#F0177B",
      gradient: "linear-gradient(135deg,#0B6E4F,#38b88a)",
      textColor: "#F7EEDD",
      rotation: "-1.4deg"
    },
    {
      id: "def-4",
      title: "Sabzi-to-Slay Tote",
      subtitle: "Tote Bag\n\"Sabzi to Slay\"",
      description: "Carries onions on Monday, laptop on Tuesday, vibes always.",
      price: 399,
      originalPrice: 599,
      badge: "GIR GAYA PRICE 📉",
      badgeBg: "#0B6E4F",
      gradient: "linear-gradient(135deg,#7A5CFF,#b6a3ff)",
      textColor: "#181030",
      rotation: "1.4deg"
    }
  ], [])

  const gradients = ['linear-gradient(135deg,#FF7A1A,#FFC94A)', 'linear-gradient(135deg,#F0177B,#ff8fc0)', 'linear-gradient(135deg,#0B6E4F,#38b88a)', 'linear-gradient(135deg,#7A5CFF,#b6a3ff)']

  // Display mapped products: prioritize staff uploaded backend products if available
  const displayStalls = useMemo(() => {
    if (backendProducts.length > 0) {
      return backendProducts.map((prod, idx) => ({
        id: prod.id || prod._id || `backend-${idx}`,
        title: prod.title || prod.name || "Bazaar Item",
        subtitle: prod.subtitle || prod.category?.name || prod.name,
        description: prod.description || "Fresh off the thela. Limited stock, unlimited attitude.",
        price: prod.price || 299,
        originalPrice: prod.original_price || prod.originalPrice || prod.mrp,
        badge: prod.badge || prod.tag || (prod.original_price ? "GIR GAYA PRICE 📉" : null),
        badgeBg: prod.badgeBg || "#0B6E4F",
        image: prod.image_url || prod.imageUrl || prod.image,
        gradient: gradients[idx % gradients.length],
        textColor: "#181030",
        rotation: idx % 2 === 0 ? "-1.4deg" : "1.4deg"
      }))
    }
    return defaultStalls
  }, [backendProducts, defaultStalls])

  // Slogan rotation
  const showNextSlogan = () => {
    setSloganAnim(false)
    setTimeout(() => {
      setSloganIndex((prev) => (prev + 1) % slogans.length)
      setSloganAnim(true)
    }, 50)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      showNextSlogan()
    }, 4500)
    return () => clearInterval(interval)
  }, [slogans.length])

  // Buyer toast rotation
  useEffect(() => {
    let buyerIdx = 0
    const showBuyerToast = () => {
      const b = buyers[buyerIdx % buyers.length]
      buyerIdx++
      setToastAnim("toast-out")
      setTimeout(() => {
        setToastText(`${b.name} from ${b.city} just grabbed the ${b.item} 🛍️`)
        setToastAnim("toast-in")
        setToastVisible(true)
      }, 420)

      setTimeout(() => {
        setToastAnim("toast-out")
      }, 5200)
    }

    const firstTimeout = setTimeout(showBuyerToast, 1600)
    const interval = setInterval(showBuyerToast, 6800)

    return () => {
      clearTimeout(firstTimeout)
      clearInterval(interval)
    }
  }, [buyers])

  const handleAddToCart = (productName) => {
    setCartCount((prev) => prev + 1)
    setToastText(`Added ${productName} to Jhola! 🛍️`)
    setToastAnim("toast-in")
    setToastVisible(true)
    setTimeout(() => {
      setToastAnim("toast-out")
    }, 3000)
  }

  // Generate SVG bunting flags along quadratic bezier curve
  const buntingItems = useMemo(() => {
    const palette = ['#FF7A1A', '#F0177B', '#FFC94A', '#0B6E4F', '#7A5CFF']
    const bez = (t) => {
      const x = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 500 + t * t * 990
      const y = (1 - t) * (1 - t) * 6 + 2 * (1 - t) * t * 68 + t * t * 6
      return { x, y }
    }
    const N = 26
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

  // Build ticker content items
  const tickerItems = useMemo(() => {
    const items = []
    let bi = 0
    quirkyLines.forEach((line, i) => {
      items.push({ type: 'text', content: line, key: `q-${i}` })
      if (i % 2 === 1) {
        const b = buyers[bi % buyers.length]
        bi++
        items.push({ type: 'buyer', buyer: b, key: `b-${i}` })
      }
    })
    return items
  }, [quirkyLines, buyers])

  return (
    <div style={{ background: "#FFF7EC", color: "#181030", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", position: "relative", minHeight: "100vh" }} id="stage">
      
      {/* Decorative background glow circles */}
      <div style={{ position: "absolute", top: 180, left: -140, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #FF7A1A55, transparent 60%)", filter: "blur(6px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 520, right: -160, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle at 60% 40%, #F0177B44, transparent 60%)", filter: "blur(8px)", pointerEvents: "none" }} />

      {/* TOP STRIP & MARQUEE TICKER */}
      <div style={{ background: "#FFEFDA", borderBottom: "1px solid rgba(255,122,26,0.25)", position: "relative" }}>
        
        <div style={{ background: "#FFFFFF", color: "#181030", overflow: "hidden", whiteSpace: "nowrap", padding: "11px 0", borderTop: "1px solid rgba(255,201,74,0.4)", borderBottom: "1px solid rgba(255,201,74,0.4)", position: "relative" }}>
          {/* Fade edges */}
          <div style={{ position: "absolute", inset: "0 auto 0 0", width: 80, background: "linear-gradient(90deg,#FFFFFF,transparent)", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: "0 0 0 auto", width: 80, background: "linear-gradient(270deg,#FFFFFF,transparent)", zIndex: 2, pointerEvents: "none" }} />
          
          <div style={{ display: "inline-block", willChange: "transform", animation: "scroll-left 48s linear infinite", fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 14, letterSpacing: "0.6px" }}>
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <React.Fragment key={idx}>
                {item.type === 'text' ? (
                  <span style={{ margin: "0 24px" }}>{item.content}</span>
                ) : (
                  <span style={{ fontWeight: 800, margin: "0 24px" }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#0B6E4F", marginRight: 6, boxShadow: "0 0 0 3px rgba(11,110,79,0.35)", animation: "dot-pulse 1.2s ease-in-out infinite", verticalAlign: "middle" }} />
                    JUST IN: <b style={{ textDecoration: "underline", textDecorationStyle: "wavy", textDecorationColor: "#FF7A1A", textUnderlineOffset: "3px" }}>{item.buyer.name}</b> ({item.buyer.city}) copped the {item.buyer.item} 👀
                  </span>
                )}
                <span style={{ margin: "0 18px", color: "#181030", opacity: 0.5 }}>✦</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Shanivaar Special Pill Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, padding: "14px 6%", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "transparent", color: "#FF7A1A", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
            <span style={{ width: 22, height: 1, background: "#FFC94A", opacity: 0.7 }} />
            Shanivaar Special
            <span style={{ width: 22, height: 1, background: "#FFC94A", opacity: 0.7 }} />
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 18px", border: "1px solid rgba(255,122,26,0.4)", borderRadius: 999, fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 15, color: "#181030" }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#0B6E4F", boxShadow: "0 0 0 3px rgba(11,110,79,0.28)", animation: "dot-pulse 1.4s ease-in-out infinite" }} />
            Prices dropped up to <span style={{ color: "#FF7A1A", fontWeight: 800 }}>40%</span>
            <span style={{ opacity: 0.55, fontFamily: "'Kalam', cursive", fontWeight: 400 }}>— gir gaya, sach mein</span>
          </span>
        </div>
      </div>

      {/* NAVBAR */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 6%", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "conic-gradient(from 90deg,#F0177B,#FF7A1A,#FFC94A,#F0177B)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 17, color: "#181030", transform: "rotate(-8deg)", border: "3px solid #181030", boxShadow: "3px 3px 0 #F0177B" }}>LL</div>
          <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: "0.5px" }}>LOOT<span style={{ color: "#FF7A1A" }}>LOOTO</span></div>
        </div>

        <div style={{ display: "flex", gap: 32, fontSize: 15, fontWeight: 500 }} className="nav-links-hide">
          <a href="#products" style={{ textDecoration: "none", opacity: 0.85 }}>Stalls</a>
          <a href="#products" style={{ textDecoration: "none", opacity: 0.85 }}>New Aaya</a>
          <a href="#products" style={{ textDecoration: "none", opacity: 0.85 }}>Sale</a>
          <a href="#slogans" style={{ textDecoration: "none", opacity: 0.85 }}>About Bazar</a>
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

      {/* HERO SECTION */}
      <section style={{ position: "relative", padding: "90px 6% 110px", textAlign: "center", maxWidth: 1040, margin: "0 auto" }}>

        {/* SVG Bunting String across hero */}
        <svg width="100%" height="70" viewBox="0 0 1000 70" preserveAspectRatio="none" style={{ position: "absolute", top: 20, left: 0, right: 0, display: "block", pointerEvents: "none" }}>
          <rect x="6" y="0" width="4" height="70" fill="#FFC94A" opacity="0.55" rx="2" />
          <rect x="990" y="0" width="4" height="70" fill="#FFC94A" opacity="0.55" rx="2" />
          <path d="M10 6 Q 500 68, 990 6" stroke="#FFC94A" strokeWidth="1.2" fill="none" opacity="0.55" strokeDasharray="2 4" />
          <g id="buntingG">
            {buntingItems.map((item) => (
              <React.Fragment key={item.id}>
                <line x1={item.cx} y1={item.sy - 2} x2={item.cx} y2={item.sy} stroke="#FFC94A" strokeWidth="0.8" opacity="0.6" />
                {item.kind === 0 && (
                  <polygon points={`${item.cx - 7},${item.sy} ${item.cx + 7},${item.sy} ${item.cx},${item.sy + 16}`} fill={item.color} opacity="0.95" />
                )}
                {item.kind === 1 && (
                  <circle cx={item.cx} cy={item.sy + 9} r="5.5" fill={item.color} opacity="0.95" />
                )}
                {item.kind === 2 && (
                  <rect x={item.cx - 5} y={item.sy + 1} width="10" height="15" rx="2" fill={item.color} opacity="0.95" />
                )}
              </React.Fragment>
            ))}
          </g>
        </svg>

        {/* Floating stickers */}
        <span className="sticker-1" style={{ position: "absolute", top: "3%", left: "-1%", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 13, background: "#F7EEDD", color: "#181030", padding: "16px 12px", borderRadius: "50%", border: "2px dashed #181030", boxShadow: "4px 4px 0 rgba(0,0,0,0.35)", textAlign: "center", lineHeight: 1.15 }}>₹99<br />ONLY</span>
        <span className="sticker-2" style={{ position: "absolute", top: "44%", right: "-2%", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 13, background: "#0B6E4F", color: "#F7EEDD", padding: "16px 12px", borderRadius: "50%", border: "2px dashed #F7EEDD", boxShadow: "4px 4px 0 rgba(0,0,0,0.35)", textAlign: "center", lineHeight: 1.15 }}>100%<br />DESI</span>
        <span className="sticker-3" style={{ position: "absolute", bottom: "4%", left: "2%", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 13, background: "#F0177B", color: "#F7EEDD", padding: "16px 12px", borderRadius: "50%", border: "2px dashed #F7EEDD", boxShadow: "4px 4px 0 rgba(0,0,0,0.35)", textAlign: "center", lineHeight: 1.15 }}>NO<br />RETURNS*</span>
        <span className="sticker-4" style={{ position: "absolute", bottom: "6%", right: "2%", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 12, background: "#7A5CFF", color: "#F7EEDD", padding: "12px 14px", borderRadius: 14, border: "2px solid #181030", boxShadow: "3px 3px 0 #FFC94A", textAlign: "center", lineHeight: 1.2 }}>JHOLA<br />APPROVED ✅</span>

        {/* APPROVED Stamp */}
        <div style={{ position: "absolute", bottom: "20%", left: "4%", fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 20, color: "#F0177B", border: "4px double #F0177B", padding: "6px 14px", borderRadius: 6, letterSpacing: 2, transform: "rotate(-14deg)", animation: "stamp-in 0.8s ease-out both 0.6s", textShadow: "1px 1px 0 rgba(240,23,123,0.2)", zIndex: 2 }}>AUNTY<br />APPROVED</div>

        {/* Pin Note */}
        <div style={{ position: "absolute", top: "1%", right: "-1%", background: "#FFC94A", color: "#181030", padding: "14px 16px 16px", transform: "rotate(6deg)", fontFamily: "'Kalam', cursive", fontSize: 15, fontWeight: 700, boxShadow: "4px 6px 10px rgba(0,0,0,0.35)", maxWidth: 160, lineHeight: 1.25 }}>
          <div style={{ position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", width: 16, height: 16, borderRadius: "50%", background: "#F0177B", border: "2px solid #181030" }} />
          "beta sasta hai, le lo, warna raat ko neend nahi aayegi" — every aunty ever
        </div>

        {/* Location Badge */}
        <div style={{ display: "inline-block", fontFamily: "'Space Mono'", fontSize: 13, fontWeight: 700, background: "#FFFFFF", border: "1px dashed #FF7A1A", color: "#181030", padding: "6px 18px", borderRadius: 999, marginBottom: 28, transform: "rotate(-2deg)" }}>📍 OPEN 24×7 BECAUSE FOMO DOESN'T SLEEP</div>

        {/* Main Heading */}
        <h1 style={{ fontFamily: "'Baloo 2'", fontSize: "clamp(46px,9vw,108px)", lineHeight: 1.65, fontWeight: 800, letterSpacing: "-1.5px", margin: 0, position: "relative" }}>
          THELA SE <span style={{ color: "#FF7A1A", WebkitTextStroke: "2px #181030" }}>DIL</span><br />
          TAK <span style={{ color: "#F0177B", display: "inline-block", transform: "rotate(-2deg)" }}>PAHUNCHE</span>
        </h1>
        <div style={{ fontFamily: "'Kalam', cursive", fontSize: 22, color: "#FF7A1A", transform: "rotate(-3deg)", marginTop: 32 }}>*sasta, sundar, slay ✨</div>

        <p style={{ maxWidth: 560, margin: "28px auto 40px", fontSize: 18, opacity: 0.82, lineHeight: 1.55 }}>
          Street market energy, doorstep delivery. Real bazaar chaos, zero bhaav-tav headache — we already fought the shopkeeper so you don't have to.
        </p>

        <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#products" style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 18, padding: "16px 34px", borderRadius: 14, textDecoration: "none", background: "#FFC94A", color: "#181030", border: "3px solid #181030", boxShadow: "6px 6px 0 #F0177B", display: "inline-block" }}>Ghoomo Bazar 🛍️</a>
          <a href="#slogans" style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 18, padding: "16px 34px", borderRadius: 14, textDecoration: "none", background: "transparent", color: "#181030", border: "3px solid #181030", display: "inline-block" }}>Aaj Ka Bhaav 👀</a>
        </div>
      </section>

      {/* SLOGAN STRIP */}
      <div 
        id="slogans" 
        onClick={showNextSlogan}
        style={{ background: "#FFFFFF", color: "#181030", padding: "60px 6%", textAlign: "center", borderTop: "6px solid #181030", borderBottom: "6px solid #181030", position: "relative", overflow: "hidden", cursor: "pointer" }}
      >
        {/* Rangoli dots */}
        <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6 }}>
          <span style={{ width: 10, height: 10, background: "#F0177B", borderRadius: "50%" }} />
          <span style={{ width: 10, height: 10, background: "#FF7A1A", borderRadius: "50%" }} />
          <span style={{ width: 10, height: 10, background: "#FFC94A", borderRadius: "50%" }} />
        </div>
        <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 6 }}>
          <span style={{ width: 10, height: 10, background: "#0B6E4F", borderRadius: "50%" }} />
          <span style={{ width: 10, height: 10, background: "#7A5CFF", borderRadius: "50%" }} />
          <span style={{ width: 10, height: 10, background: "#F0177B", borderRadius: "50%" }} />
        </div>

        <div style={{ fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#F0177B", marginBottom: 16 }}>📢 Bazar ki awaaz</div>
        <div 
          style={{ 
            fontFamily: "'Baloo 2'", 
            fontWeight: 700, 
            fontSize: "clamp(26px,5vw,44px)", 
            minHeight: 64, 
            lineHeight: 1.15, 
            padding: "0 4%",
            animation: sloganAnim ? "slogan-in 0.5s ease-out" : "none" 
          }}
        >
          {slogans[sloganIndex]}
        </div>
        <div style={{ marginTop: 20, fontSize: 13, opacity: 0.6, fontFamily: "'Kalam', cursive" }}>👆 tap anywhere to hear another one shout at you</div>
      </div>

      {/* DOODLE DIVIDER */}
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0", background: "#FFF7EC" }}>
        <svg width="240" height="24" viewBox="0 0 220 24" fill="none"><path d="M2 12 Q 20 2, 38 12 T 74 12 T 110 12 T 146 12 T 182 12 T 218 12" stroke="#FF7A1A" strokeWidth="2.5" strokeLinecap="round" /></svg>
      </div>

      {/* PRODUCTS SECTION */}
      <div id="products" style={{ textAlign: "center", padding: "70px 6% 10px" }}>
        <h2 style={{ fontFamily: "'Baloo 2'", fontSize: "clamp(32px,5vw,52px)", fontWeight: 800 }}>Aaj Ke Stalls 🪔</h2>
        <p style={{ opacity: 0.75, marginTop: 10, fontSize: 16 }}>Fresh off the thela. Limited stock, unlimited attitude.</p>
      </div>

      {/* DYNAMIC PRODUCTS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 32, padding: "44px 6% 90px", maxWidth: 1240, margin: "0 auto" }}>
        {displayStalls.map((stall) => (
          <div 
            key={stall.id} 
            style={{ 
              background: "#FFFFFF",
              border: "2px solid rgba(24,16,48,0.1)",
              borderRadius: 20, 
              padding: 22, 
              position: "relative", 
              transform: `rotate(${stall.rotation || '0deg'})`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              {stall.badge && (
                <div style={{ position: "absolute", top: -12, right: 16, background: stall.badgeBg || "#0B6E4F", color: "#F7EEDD", fontFamily: "'Space Mono'", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 999, transform: "rotate(6deg)", border: "1px solid #181030" }}>
                  {stall.badge}
                </div>
              )}

              {stall.image ? (
                <img src={stall.image} alt={stall.title} style={{ width: "100%", height: 160, borderRadius: 14, marginBottom: 16, objectFit: "cover" }} />
              ) : (
                <div style={{ height: 160, borderRadius: 14, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Baloo 2'", fontSize: 16, fontWeight: 700, textAlign: "center", color: stall.textColor || "#181030", background: stall.gradient || "linear-gradient(135deg,#FF7A1A,#FFC94A)", whiteSpace: "pre-line" }}>
                  {stall.subtitle || stall.title}
                </div>
              )}

              <h3 style={{ fontFamily: "'Baloo 2'", fontSize: 20, margin: "0 0 6px" }}>{stall.title}</h3>
              <div style={{ fontSize: 13, opacity: 0.72, marginBottom: 14, lineHeight: 1.45 }}>{stall.description}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <div style={{ fontFamily: "'Space Mono'", fontWeight: 700, color: "#FF7A1A" }}>
                {stall.originalPrice && (
                  <span style={{ textDecoration: "line-through", opacity: 0.5, color: "#181030", fontWeight: 400, marginRight: 6 }}>
                    ₹{stall.originalPrice}
                  </span>
                )}
                ₹{stall.price}
              </div>
              <button onClick={() => handleAddToCart(stall.title)} style={{ background: "#FFC94A", color: "#181030", border: "none", width: 36, height: 36, borderRadius: "50%", fontSize: 19, fontWeight: 800, cursor: "pointer" }}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer style={{ textAlign: "center", padding: "60px 6% 44px", borderTop: "1px solid rgba(24,16,48,0.12)", fontSize: 13, opacity: 0.65 }}>
        <div style={{ fontFamily: "'Baloo 2'", fontSize: 22, opacity: 1, marginBottom: 12, color: "#FF7A1A" }}>LOOTLOOTO</div>
        <div style={{ fontFamily: "'Kalam', cursive", fontSize: 16, opacity: 0.85 }}>Bazar band nahi hota, bas tab bandh hota hai jab paisa khatam ho jaaye.</div>
        <div style={{ marginTop: 16 }}>© 2026 Lootlooto · running on jugaad, not just js</div>
      </footer>

      {/* BUYER TOAST NOTIFICATION */}
      {toastVisible && (
        <div 
          id="buyerToast" 
          style={{ 
            position: "fixed", 
            left: 22, 
            bottom: 22, 
            zIndex: 50, 
            background: "#FFFFFF",
            color: "#181030",
            padding: "14px 18px 14px 16px", 
            borderRadius: "4px 14px 14px 4px", 
            maxWidth: 280, 
            boxShadow: "6px 6px 0 rgba(0,0,0,0.4)", 
            borderLeft: "5px dashed #F0177B",
            animation: `${toastAnim} 0.6s cubic-bezier(0.2,0.8,0.3,1.2) forwards`
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0B6E4F", boxShadow: "0 0 0 3px rgba(11,110,79,0.25)", animation: "dot-pulse 1.4s ease-in-out infinite", display: "inline-block" }} />
            <span style={{ fontFamily: "'Space Mono'", fontSize: 10, letterSpacing: 1.5, opacity: 0.55 }}>ABHI ABHI</span>
          </div>
          <div style={{ fontFamily: "'Kalam', cursive", fontSize: 19, fontWeight: 700, lineHeight: 1.28 }}>
            {toastText}
          </div>
        </div>
      )}

    </div>
  )
}