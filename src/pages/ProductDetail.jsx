import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import client from "../api/client"


const COLORS = {
  bg: "#FFF7EC",
  text: "#181030",
  orange: "#FF7A1A",
  pink: "#F0177B",
  gold: "#FFC94A",
  green: "#0B6E4F",
  purple: "#7A5CFF",
  cream: "#F7EEDD",
}

export default function ProductDetail() {
  const { idOrSlug } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [addedFlash, setAddedFlash] = useState(false)

  // "You might also like" — other products from the same category only
  const [related, setRelated] = useState([])
  const [relatedLoading, setRelatedLoading] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function loadProduct() {
      setLoading(true)
      setError(false)
      try {
        const res = await client.get(`/catalog/products/${idOrSlug}`)
        if (isMounted) {
          setProduct(res.data)
          setActiveImg(0)
        }
      } catch (err) {
        console.error("Failed to load product", err)
        if (isMounted) setError(true)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadProduct()
    return () => { isMounted = false }
  }, [idOrSlug])

  // Fetch recommendations scoped to the current product's category only,
  // re-running whenever the viewed product (and therefore its category) changes.
  useEffect(() => {
    const categoryId = product?.category_id || product?.category?.uuid
    if (!categoryId) {
      setRelated([])
      return
    }
    let isMounted = true
    async function loadRelated() {
      setRelatedLoading(true)
      try {
        const res = await client.get("/catalog/products", {
          params: { category_id: categoryId, is_published: true, limit: 9 },
        })
        const items = res.data?.items || (Array.isArray(res.data) ? res.data : [])
        if (isMounted) {
          setRelated(items.filter((p) => p.uuid !== product.uuid).slice(0, 4))
        }
      } catch (err) {
        console.error("Failed to load related products", err)
        if (isMounted) setRelated([])
      } finally {
        if (isMounted) setRelatedLoading(false)
      }
    }
    loadRelated()
    return () => { isMounted = false }
  }, [product?.uuid, product?.category_id, product?.category?.uuid])

  function handleAddToJhola() {
    setAddedFlash(true)
    setTimeout(() => setAddedFlash(false), 2200)
  }

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Baloo 2'", fontSize: 22, color: COLORS.text }}>
        Khol rahe hai thela... 🛺
      </div>
    )
  }

  if (error || !product) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", color: COLORS.text, textAlign: "center", padding: "0 6%" }}>
        <div style={{ fontFamily: "'Baloo 2'", fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Yeh stall toh gayab hai! 🔍</div>
        <p style={{ opacity: 0.7, marginBottom: 28 }}>This item isn't on the thela anymore, or never was.</p>
        <Link to="/" style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 16, padding: "14px 30px", borderRadius: 14, textDecoration: "none", background: COLORS.gold, color: COLORS.text, border: `3px solid ${COLORS.text}`, boxShadow: `5px 5px 0 ${COLORS.pink}` }}>
          ← Back to Bazar
        </Link>
      </div>
    )
  }

  const images = product.images?.length > 0
    ? [...product.images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
    : []
  const hasDiscount = product.compare_price && product.compare_price > product.selling_price
  const discountPct = hasDiscount ? Math.round(100 - (product.selling_price / product.compare_price) * 100) : null
  const inStock = product.current_qty > 0 && product.status !== "OUT_OF_STOCK" && product.status !== "DISCONTINUED"
  const lowStock = product.status === "LOW_STOCK" || (product.current_qty > 0 && product.current_qty <= (product.reorder_level || 5))

  return (
    <div style={{ background: COLORS.bg, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      {/* Decorative glow, matches Home.jsx */}
      <div style={{ position: "absolute", top: 120, left: -140, width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(circle at 30% 30%, ${COLORS.orange}55, transparent 60%)`, filter: "blur(6px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 420, right: -160, width: 420, height: 420, borderRadius: "50%", background: `radial-gradient(circle at 60% 40%, ${COLORS.pink}44, transparent 60%)`, filter: "blur(8px)", pointerEvents: "none" }} />

      {/* NAVBAR — mirrors Home.jsx */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 6%", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: `conic-gradient(from 90deg,${COLORS.pink},${COLORS.orange},${COLORS.gold},${COLORS.pink})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 17, color: COLORS.text, transform: "rotate(-8deg)", border: `3px solid ${COLORS.text}`, boxShadow: `3px 3px 0 ${COLORS.pink}` }}>LL</div>
          <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: "0.5px" }}>LOOT<span style={{ color: COLORS.orange }}>LOOTO</span></div>
        </div>
        <Link to="/" style={{ fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 13, color: COLORS.text, opacity: 0.8, textDecoration: "none" }}>← Bazar mein wapas</Link>
      </nav>

      {/* PRODUCT LAYOUT */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "30px 6% 100px", display: "grid", gridTemplateColumns: "minmax(280px, 1fr) minmax(280px, 1fr)", gap: 52, position: "relative" }}>

        {/* Gallery */}
        <div>
          <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", border: `2px solid rgba(24,16,48,0.1)`, background: "#FFFFFF", boxShadow: "6px 6px 0 rgba(24,16,48,0.08)" }}>
            {hasDiscount && (
              <div style={{ position: "absolute", top: 16, left: -8, background: COLORS.green, color: COLORS.cream, fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 999, transform: "rotate(-6deg)", border: `1px solid ${COLORS.text}`, zIndex: 2 }}>
                GIR GAYA PRICE 📉 {discountPct}% OFF
              </div>
            )}
            {images.length > 0 ? (
              <img src={images[activeImg].url} alt={product.name} style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: 420, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Baloo 2'", fontSize: 22, fontWeight: 700, textAlign: "center", padding: "0 10%", color: COLORS.text, background: `linear-gradient(135deg,${COLORS.orange},${COLORS.gold})` }}>
                {product.name}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: 64, height: 64, borderRadius: 12, overflow: "hidden", padding: 0, cursor: "pointer",
                    border: i === activeImg ? `3px solid ${COLORS.orange}` : "2px solid rgba(24,16,48,0.15)",
                    background: "#FFFFFF",
                  }}
                >
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ position: "relative" }}>
          {/* Pin note, matches Home.jsx hero decoration */}
          <div style={{ position: "absolute", top: -34, right: 0, background: COLORS.gold, color: COLORS.text, padding: "10px 14px 12px", transform: "rotate(6deg)", fontFamily: "'Kalam', cursive", fontSize: 13, fontWeight: 700, boxShadow: "3px 5px 8px rgba(0,0,0,0.3)", maxWidth: 150, lineHeight: 1.2 }}>
            "isse accha kahin nahi milega" — thelawala
          </div>

          {product.category?.name && (
            <div style={{ display: "inline-block", fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, background: "#FFFFFF", border: `1px dashed ${COLORS.orange}`, color: COLORS.text, padding: "5px 14px", borderRadius: 999, marginBottom: 18 }}>
              {product.category.name}
            </div>
          )}

          <h1 style={{ fontFamily: "'Baloo 2'", fontSize: "clamp(30px,4vw,44px)", fontWeight: 800, lineHeight: 1.15, margin: "0 0 8px" }}>{product.name}</h1>

          {(product.brand || product.variant) && (
            <div style={{ fontFamily: "'Space Mono'", fontSize: 13, opacity: 0.65, marginBottom: 18 }}>
              {[product.brand, product.variant].filter(Boolean).join(" · ")}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
            <span style={{ fontFamily: "'Space Mono'", fontSize: 30, fontWeight: 800, color: COLORS.orange }}>₹{Number(product.selling_price).toFixed(0)}</span>
            {hasDiscount && (
              <span style={{ fontFamily: "'Space Mono'", fontSize: 17, textDecoration: "line-through", opacity: 0.45 }}>₹{Number(product.compare_price).toFixed(0)}</span>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            {inStock ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, color: COLORS.green }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green, boxShadow: `0 0 0 3px ${COLORS.green}33` }} />
                {lowStock ? "Kam bacha hai — jaldi karo!" : "Stock mein hai"}
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, color: COLORS.pink }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.pink }} />
                Thela khaali — out of stock
              </span>
            )}
          </div>

          {product.description && (
            <p style={{ fontSize: 15.5, lineHeight: 1.65, opacity: 0.85, marginBottom: 32, maxWidth: 480 }}>
              {product.description}
            </p>
          )}

          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleAddToJhola}
              disabled={!inStock}
              style={{
                fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 17, padding: "16px 34px", borderRadius: 14,
                background: inStock ? COLORS.pink : "rgba(24,16,48,0.15)",
                color: inStock ? COLORS.cream : "rgba(24,16,48,0.4)",
                border: `3px solid ${COLORS.text}`,
                boxShadow: inStock ? `6px 6px 0 ${COLORS.gold}` : "none",
                cursor: inStock ? "pointer" : "not-allowed",
              }}
            >
              {inStock ? "Jhole Mein Daalo 🛒" : "Sold Out"}
            </button>
            {addedFlash && (
              <span style={{ fontFamily: "'Kalam', cursive", fontSize: 16, color: COLORS.green, fontWeight: 700 }}>
                Jhola mein aa gaya! ✨
              </span>
            )}
          </div>

          <div style={{ marginTop: 40, fontFamily: "'Space Mono'", fontSize: 11, opacity: 0.5, letterSpacing: 0.5 }}>
            SKU · {product.sku}
          </div>
        </div>
      </div>

      {/* YOU MIGHT ALSO LIKE — same category only */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 6% 90px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 24, borderTop: `2px dashed rgba(24,16,48,0.15)`, paddingTop: 40 }}>
          <h2 style={{ fontFamily: "'Baloo 2'", fontSize: "clamp(24px,3.5vw,34px)", fontWeight: 800, margin: 0 }}>
            Isi Thele Se 🪔 {product.category?.name ? <span style={{ color: COLORS.orange }}>{product.category.name}</span> : "More Like This"}
          </h2>
        </div>

        {relatedLoading ? (
          // Loading placeholders — mirrors the real card layout so nothing jumps on load
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 26 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: "#FFFFFF", border: "2px solid rgba(24,16,48,0.08)", borderRadius: 18, padding: 18 }}>
                <div style={{ height: 140, borderRadius: 12, marginBottom: 14, background: "linear-gradient(90deg,#FFF1DC,#FFF7EC,#FFF1DC)" }} />
                <div style={{ height: 14, width: "70%", borderRadius: 6, marginBottom: 8, background: "rgba(24,16,48,0.08)" }} />
                <div style={{ height: 14, width: "40%", borderRadius: 6, background: "rgba(24,16,48,0.08)" }} />
              </div>
            ))}
          </div>
        ) : related.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 26 }}>
            {related.map((p) => {
              const img = p.images?.find((i) => i.is_primary) || p.images?.[0]
              const hasDisc = p.compare_price && p.compare_price > p.selling_price
              return (
                <div
                  key={p.uuid}
                  onClick={() => navigate(`/product/${p.slug || p.uuid}`)}
                  style={{ background: "#FFFFFF", border: "2px solid rgba(24,16,48,0.1)", borderRadius: 18, padding: 18, cursor: "pointer", position: "relative" }}
                >
                  {hasDisc && (
                    <div style={{ position: "absolute", top: -10, right: 14, background: COLORS.green, color: COLORS.cream, fontFamily: "'Space Mono'", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 999, transform: "rotate(6deg)", border: `1px solid ${COLORS.text}` }}>
                      SASTA 📉
                    </div>
                  )}
                  {img ? (
                    <img src={img.url} alt={p.name} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, marginBottom: 14 }} />
                  ) : (
                    <div style={{ height: 140, borderRadius: 12, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Baloo 2'", fontSize: 15, fontWeight: 700, textAlign: "center", padding: "0 10%", background: "linear-gradient(135deg,#FF7A1A,#FFC94A)" }}>
                      {p.name}
                    </div>
                  )}
                  <h3 style={{ fontFamily: "'Baloo 2'", fontSize: 16, margin: "0 0 8px", lineHeight: 1.3 }}>{p.name}</h3>
                  <div style={{ fontFamily: "'Space Mono'", fontWeight: 700, color: COLORS.orange, fontSize: 15 }}>
                    {hasDisc && <span style={{ textDecoration: "line-through", opacity: 0.45, color: COLORS.text, fontWeight: 400, marginRight: 6 }}>₹{Number(p.compare_price).toFixed(0)}</span>}
                    ₹{Number(p.selling_price).toFixed(0)}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // Placeholder shown when this category has no other published products yet
          <div style={{ background: "#FFFFFF", border: "2px dashed rgba(24,16,48,0.15)", borderRadius: 18, padding: "36px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Baloo 2'", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Is category mein aur kuch nahi 🤷</div>
            <p style={{ opacity: 0.7, fontSize: 14, margin: 0 }}>Filhaal is category ka yehi ek item hai. Naya stock jaldi aayega!</p>
          </div>
        )}
      </div>

      {/* FOOTER — matches Home.jsx */}
      <footer style={{ textAlign: "center", padding: "40px 6% 44px", borderTop: "1px solid rgba(24,16,48,0.12)", fontSize: 13, opacity: 0.65 }}>
        <div style={{ fontFamily: "'Baloo 2'", fontSize: 22, opacity: 1, marginBottom: 12, color: COLORS.orange }}>LOOTLOOTO</div>
        <div style={{ fontFamily: "'Kalam', cursive", fontSize: 16, opacity: 0.85 }}>Bazar band nahi hota, bas tab bandh hota hai jab paisa khatam ho jaaye.</div>
      </footer>
    </div>
  )
}