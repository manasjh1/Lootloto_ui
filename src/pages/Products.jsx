import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { getProducts, getCategories } from "../api/products"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const COLORS = {
  bg: "#FFF7EC",
  bgAlt: "#FFEFDA",
  text: "#181030",
  orange: "#FF7A1A",
  pink: "#F0177B",
  gold: "#FFC94A",
  green: "#0B6E4F",
  purple: "#7A5CFF",
  cream: "#F7EEDD",
}

const PAGE_SIZE = 9

const getImageUrl = (p) => {
  if (!p) return null
  if (Array.isArray(p.images) && p.images.length > 0) {
    const primary = p.images.find((i) => i && i.is_primary) || p.images[0]
    if (typeof primary === "string") return primary
    if (primary && typeof primary === "object") return primary.url || primary.image_url || primary.imageUrl || null
  }
  return p.image_url || p.image || null
}

export default function Products() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [cartCount, setCartCount] = useState(0)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastText, setToastText] = useState("")
  const [toastAnim, setToastAnim] = useState("toast-in")

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [availability, setAvailability] = useState("all") // all | in-stock
  const [saleOnly, setSaleOnly] = useState(searchParams.get("filter") === "sale")
  const [newOnly, setNewOnly] = useState(searchParams.get("filter") === "new")
  const [maxPrice, setMaxPrice] = useState(5000)
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState("grid") // grid | list
  const [page, setPage] = useState(1)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      const [prods, cats] = await Promise.all([getProducts(), getCategories()])
      if (isMounted) {
        setProducts(Array.isArray(prods) ? prods : [])
        setCategories(cats)
        setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  // Keep the URL in sync with the quick-filter chips from the navbar
  useEffect(() => {
    const f = searchParams.get("filter")
    if (f === "sale" || f === "new") {
      setSaleOnly(f === "sale")
      setNewOnly(f === "new")
    }
  }, [searchParams])

  const priceCeiling = useMemo(() => {
    const prices = products.map((p) => p.selling_price ?? p.price ?? 0)
    return prices.length > 0 ? Math.max(...prices, 500) : 5000
  }, [products])

  useEffect(() => { setMaxPrice(priceCeiling) }, [priceCeiling])

  const categoryCounts = useMemo(() => {
    const counts = {}
    products.forEach((p) => {
      const id = p.category_id || p.category?.uuid
      if (id) counts[id] = (counts[id] || 0) + 1
    })
    return counts
  }, [products])

  const filtered = useMemo(() => {
    let list = [...products]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q))
    }
    if (categoryId) {
      list = list.filter((p) => (p.category_id || p.category?.uuid) === categoryId)
    }
    if (availability === "in-stock") {
      list = list.filter((p) => (p.current_qty ?? 0) > 0 && p.status !== "OUT_OF_STOCK")
    }
    if (saleOnly) {
      list = list.filter((p) => p.compare_price && p.compare_price > (p.selling_price ?? p.price))
    }
    if (newOnly) {
      const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000
      list = list.filter((p) => p.created_at && new Date(p.created_at).getTime() >= cutoff)
    }
    list = list.filter((p) => (p.selling_price ?? p.price ?? 0) <= maxPrice)

    switch (sortBy) {
      case "price-low": list.sort((a, b) => (a.selling_price ?? a.price ?? 0) - (b.selling_price ?? b.price ?? 0)); break
      case "price-high": list.sort((a, b) => (b.selling_price ?? b.price ?? 0) - (a.selling_price ?? a.price ?? 0)); break
      case "newest": list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); break
      default: list.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    }
    return list
  }, [products, search, categoryId, availability, saleOnly, newOnly, maxPrice, sortBy])

  useEffect(() => { setPage(1) }, [search, categoryId, availability, saleOnly, newOnly, maxPrice, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetFilters = () => {
    setSearch(""); setCategoryId(""); setAvailability("all")
    setSaleOnly(false); setNewOnly(false); setMaxPrice(priceCeiling)
    setSearchParams({})
  }

  const handleAddToCart = (e, name) => {
    e.stopPropagation()
    setCartCount((prev) => prev + 1)
    setToastText(`Added ${name} to Jhola! 🛍️`)
    setToastAnim("toast-in")
    setToastVisible(true)
    setTimeout(() => setToastAnim("toast-out"), 3000)
  }

  const radioDot = (checked) => (
    <span style={{
      width: 15, height: 15, borderRadius: "50%", display: "inline-block", flexShrink: 0,
      border: `2px solid ${checked ? COLORS.orange : "rgba(24,16,48,0.3)"}`,
      background: checked ? COLORS.orange : "transparent",
      boxShadow: checked ? "inset 0 0 0 2.5px #FFFFFF" : "none",
    }} />
  )

  return (
    <div style={{ background: COLORS.bg, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "absolute", top: 80, left: -140, width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle at 30% 30%, ${COLORS.orange}44, transparent 60%)`, filter: "blur(6px)", pointerEvents: "none" }} />

      <Navbar cartCount={cartCount} />

      {/* PAGE HEADER */}
      <div style={{ textAlign: "center", padding: "10px 6% 46px", position: "relative" }}>
        <div style={{ display: "inline-block", fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, background: "#FFFFFF", border: `1px dashed ${COLORS.orange}`, padding: "5px 16px", borderRadius: 999, marginBottom: 16, transform: "rotate(-1.5deg)" }}>
          🪔 POORA BAZAR, EK HI JAGAH
        </div>
        <h1 style={{ fontFamily: "'Baloo 2'", fontSize: "clamp(30px,5vw,50px)", fontWeight: 800, margin: 0 }}>Saara Saamaan Yahin Hai 🛍️</h1>
        <p style={{ opacity: 0.7, marginTop: 10, fontFamily: "'Kalam', cursive", fontSize: 16 }}>Chhaan lo, chun lo, bhaav-tav bhi kar lo (thoda sa).</p>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 6% 100px", display: "flex", gap: 32, alignItems: "flex-start", position: "relative" }}>

        {/* ── FILTERS SIDEBAR ── */}
        <aside
          style={{ width: 260, flexShrink: 0, position: "relative" }}
          className={mobileFiltersOpen ? "pl-filters-sidebar pl-mobile-open" : "pl-filters-sidebar"}
        >
          <div style={{ background: "#FFFFFF", border: "2px solid rgba(24,16,48,0.1)", borderRadius: 20, padding: 22, position: "sticky", top: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 18 }}>Chhaanti 🔍</div>
              <button onClick={resetFilters} style={{ background: "transparent", border: "none", fontFamily: "'Space Mono'", fontSize: 11, color: COLORS.pink, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Reset</button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 22 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Naam, SKU, brand..."
                style={{ width: "100%", padding: "9px 14px", borderRadius: 999, border: "1px solid rgba(24,16,48,0.15)", background: COLORS.bgAlt, color: COLORS.text, fontFamily: "'DM Sans'", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Price */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: COLORS.orange, marginBottom: 10 }}>Bhaav (Price)</div>
              <input
                type="range" min={0} max={priceCeiling || 5000} value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: "100%", accentColor: COLORS.orange }}
              />
              <div style={{ fontFamily: "'Space Mono'", fontSize: 12, opacity: 0.7, marginTop: 4 }}>Up to ₹{maxPrice}</div>
            </div>

            {/* Availability */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: COLORS.orange, marginBottom: 10 }}>Availability</div>
              {[["all", "Sab kuch"], ["in-stock", "Stock mein hai"]].map(([val, label]) => (
                <label key={val} onClick={() => setAvailability(val)} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", padding: "5px 0", fontSize: 13.5 }}>
                  {radioDot(availability === val)} {label}
                </label>
              ))}
            </div>

            {/* Sale */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: COLORS.orange, marginBottom: 10 }}>Deals</div>
              <label onClick={() => setSaleOnly((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", padding: "5px 0", fontSize: 13.5 }}>
                {radioDot(saleOnly)} Gir Gaya Price only 📉
              </label>
              <label onClick={() => setNewOnly((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", padding: "5px 0", fontSize: 13.5 }}>
                {radioDot(newOnly)} New Aaya ✨
              </label>
            </div>

            {/* Category */}
            {categories.length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: COLORS.orange, marginBottom: 10 }}>Category</div>
                <label onClick={() => setCategoryId("")} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", padding: "5px 0", fontSize: 13.5 }}>
                  {radioDot(categoryId === "")} All <i style={{ opacity: 0.5, fontStyle: "normal", marginLeft: 4 }}>({products.length})</i>
                </label>
                {categories.map((c) => (
                  <label key={c.uuid} onClick={() => setCategoryId(c.uuid)} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", padding: "5px 0", fontSize: 13.5 }}>
                    {radioDot(categoryId === c.uuid)} {c.name} <i style={{ opacity: 0.5, fontStyle: "normal", marginLeft: 4 }}>({categoryCounts[c.uuid] || 0})</i>
                  </label>
                ))}
              </div>
            )}

            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="pl-apply-btn"
              style={{ display: "none", width: "100%", marginTop: 10, background: COLORS.gold, color: COLORS.text, border: `2px solid ${COLORS.text}`, borderRadius: 999, padding: "10px 0", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Dikhao Bazar 🛍️
            </button>
          </div>
        </aside>

        {/* ── PRODUCTS ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Sort bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, background: "#FFFFFF", border: "2px solid rgba(24,16,48,0.1)", borderRadius: 999, padding: "10px 20px", marginBottom: 26 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 12.5 }}>
              {loading ? "Thela khol rahe hai..." : (
                <>Dikha rahe hai <strong>{pageItems.length}</strong> mein se <strong>{filtered.length}</strong></>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="pl-filter-toggle"
                style={{ display: "none", background: "transparent", border: "1px solid rgba(24,16,48,0.2)", borderRadius: 999, padding: "6px 14px", fontFamily: "'Space Mono'", fontSize: 12, cursor: "pointer" }}
              >
                🔍 Filters
              </button>
              <select
                value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                style={{ border: "1px solid rgba(24,16,48,0.2)", borderRadius: 999, padding: "6px 14px", background: COLORS.bgAlt, fontFamily: "'Space Mono'", fontSize: 12, color: COLORS.text, outline: "none" }}
              >
                <option value="name">Naam se</option>
                <option value="price-low">Bhaav: kam se zyada</option>
                <option value="price-high">Bhaav: zyada se kam</option>
                <option value="newest">Sabse naya</option>
              </select>
              <div style={{ display: "flex", gap: 4 }}>
                {["grid", "list"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, cursor: "pointer",
                      border: `1px solid ${viewMode === mode ? COLORS.orange : "rgba(24,16,48,0.2)"}`,
                      background: viewMode === mode ? COLORS.orange : "transparent",
                      color: viewMode === mode ? "#FFFFFF" : COLORS.text,
                      fontSize: 14,
                    }}
                    aria-label={mode === "grid" ? "Grid view" : "List view"}
                  >
                    {mode === "grid" ? "▦" : "☰"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid / List */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", gap: 26 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ background: "#FFFFFF", border: "2px solid rgba(24,16,48,0.08)", borderRadius: 18, padding: 18 }}>
                  <div style={{ height: 150, borderRadius: 12, marginBottom: 14, background: "linear-gradient(90deg,#FFF1DC,#FFF7EC,#FFF1DC)" }} />
                  <div style={{ height: 14, width: "70%", borderRadius: 6, marginBottom: 8, background: "rgba(24,16,48,0.08)" }} />
                  <div style={{ height: 14, width: "40%", borderRadius: 6, background: "rgba(24,16,48,0.08)" }} />
                </div>
              ))}
            </div>
          ) : pageItems.length === 0 ? (
            <div style={{ background: "#FFFFFF", border: "2px dashed rgba(24,16,48,0.15)", borderRadius: 18, padding: "50px 24px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Baloo 2'", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Yahan kuch nahi mila 🤷</div>
              <p style={{ opacity: 0.7, fontSize: 14, margin: "0 0 18px" }}>Filters badal ke dekho, ya reset kar do.</p>
              <button onClick={resetFilters} style={{ background: COLORS.gold, color: COLORS.text, border: `2px solid ${COLORS.text}`, borderRadius: 999, padding: "9px 22px", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Reset Filters</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(230px,1fr))" : "1fr", gap: 26 }}>
              {pageItems.map((p) => {
                const img = getImageUrl(p)
                const price = p.selling_price ?? p.price ?? 0
                const hasDiscount = p.compare_price && p.compare_price > price
                const isList = viewMode === "list"
                return (
                  <article
                    key={p.uuid || p.id}
                    onClick={() => navigate(`/product/${p.slug || p.uuid || p.id}`)}
                    style={{
                      background: "#FFFFFF", border: "2px solid rgba(24,16,48,0.1)", borderRadius: 18,
                      padding: 18, cursor: "pointer", position: "relative",
                      display: "flex", flexDirection: isList ? "row" : "column", gap: isList ? 20 : 0,
                      alignItems: isList ? "center" : "stretch",
                    }}
                  >
                    {hasDiscount && (
                      <div style={{ position: "absolute", top: -10, left: 14, background: COLORS.green, color: COLORS.cream, fontFamily: "'Space Mono'", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 999, transform: "rotate(-4deg)", border: `1px solid ${COLORS.text}`, zIndex: 1 }}>
                        GIR GAYA PRICE 📉
                      </div>
                    )}
                    <div style={{ position: "relative", width: isList ? 140 : "100%", flexShrink: 0 }}>
                      {img ? (
                        <img src={img} alt={p.name} style={{ width: "100%", height: isList ? 100 : 160, objectFit: "cover", borderRadius: 12, marginBottom: isList ? 0 : 14 }} />
                      ) : (
                        <div style={{ width: "100%", height: isList ? 100 : 160, borderRadius: 12, marginBottom: isList ? 0 : 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Baloo 2'", fontSize: 14, fontWeight: 700, textAlign: "center", padding: "0 8%", color: COLORS.text, background: `linear-gradient(135deg,${COLORS.orange},${COLORS.gold})` }}>
                          {p.name}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                      <div>
                        {p.category?.name && (
                          <div style={{ fontFamily: "'Space Mono'", fontSize: 10.5, fontWeight: 700, color: COLORS.orange, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{p.category.name}</div>
                        )}
                        <h3 style={{ fontFamily: "'Baloo 2'", fontSize: 17, margin: "0 0 6px", lineHeight: 1.25 }}>{p.name}</h3>
                        {isList && p.description && (
                          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 10, lineHeight: 1.45 }}>{p.description}</div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                        <div style={{ fontFamily: "'Space Mono'", fontWeight: 700, color: COLORS.orange, fontSize: 15 }}>
                          {hasDiscount && <span style={{ textDecoration: "line-through", opacity: 0.45, color: COLORS.text, fontWeight: 400, marginRight: 6 }}>₹{Number(p.compare_price).toFixed(0)}</span>}
                          ₹{Number(price).toFixed(0)}
                        </div>
                        <button
                          onClick={(e) => handleAddToCart(e, p.name)}
                          style={{ background: COLORS.gold, color: COLORS.text, border: "none", width: 34, height: 34, borderRadius: "50%", fontSize: 18, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}
                        >+</button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40, flexWrap: "wrap" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pagerBtnStyle(false, page === 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} style={pagerBtnStyle(n === page)}>{n}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pagerBtnStyle(false, page === totalPages)}>›</button>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {toastVisible && (
        <div style={{
          position: "fixed", left: 22, bottom: 22, zIndex: 50, background: "#FFFFFF", color: COLORS.text,
          padding: "14px 18px", borderRadius: "4px 14px 14px 4px", maxWidth: 280,
          boxShadow: "6px 6px 0 rgba(0,0,0,0.4)", borderLeft: `5px dashed ${COLORS.pink}`,
          animation: `${toastAnim} 0.6s cubic-bezier(0.2,0.8,0.3,1.2) forwards`,
        }}>
          <div style={{ fontFamily: "'Kalam', cursive", fontSize: 18, fontWeight: 700 }}>{toastText}</div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .pl-filters-sidebar { display: none !important; }
          .pl-filters-sidebar.pl-mobile-open { display: block !important; position: fixed !important; inset: 0; z-index: 60; background: rgba(24,16,48,0.5); padding: 20px; overflow-y: auto; }
          .pl-filter-toggle { display: inline-flex !important; }
          .pl-apply-btn { display: block !important; }
        }
      `}</style>
    </div>
  )
}

function pagerBtnStyle(active, disabled) {
  return {
    width: 34, height: 34, borderRadius: "50%", cursor: disabled ? "default" : "pointer",
    border: `2px solid ${active ? COLORS.text : "rgba(24,16,48,0.15)"}`,
    background: active ? COLORS.gold : "#FFFFFF",
    color: COLORS.text, fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 13,
    opacity: disabled ? 0.4 : 1,
  }
}
