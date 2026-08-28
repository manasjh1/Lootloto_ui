import React, { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { logoutUser } from "../api/auth"
import { getProducts } from "../api/products"

const categories = ["All stalls", "Apparel", "Accessories", "Home finds", "Gifts"]
const fallbackProducts = [
  { id: "def-1", title: "Bhaav Kam Karo Tee", subtitle: "Apparel", description: "100% cotton, 200% attitude. For people who negotiate everything.", price: 549, originalPrice: 899, badge: "Price gir gaya", art: "TEE", artClass: "art-mango" },
  { id: "def-2", title: "Chaandni Jhumkas", subtitle: "Accessories", description: "Loud enough to hear you walk in. Quiet enough for your boss.", price: 349, originalPrice: 499, badge: "Best seller", art: "JHUMKA", artClass: "art-pink" },
  { id: "def-3", title: "Nazar Battu Charm", subtitle: "Accessories", description: "Protects your phone from the evil eye and butterfingers.", price: 199, originalPrice: 249, badge: "New drop", art: "NAZAR", artClass: "art-green" },
  { id: "def-4", title: "Sabzi-to-Slay Tote", subtitle: "Home finds", description: "Carries onions on Monday, laptop on Tuesday, vibes always.", price: 399, originalPrice: 599, badge: "Thela fave", art: "TOTE", artClass: "art-lilac" },
]

export default function Home() {
  const [backendProducts, setBackendProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All stalls")
  const [sort, setSort] = useState("featured")
  const [cartCount, setCartCount] = useState(0)
  const [wishlist, setWishlist] = useState([])
  const [toast, setToast] = useState("")
  const [mood, setMood] = useState("chaos")
  const [mascotLine, setMascotLine] = useState("Bhai, jhola halka hai. Dil nahi.")
  const moods = { chaos: { label: "Full chaos", slogan: "Buy the weird thing. Future-you will thank you.", cta: "Unleash the jhola" }, sensible: { label: "Fake sensible", slogan: "I came for one thing. I left with seven.", cta: "Browse responsibly" }, filmy: { label: "Main character", slogan: "Your cart has entered its dramatic era.", cta: "Cue the shopping" } }
  const mascotLines = ["Bhai, jhola halka hai. Dil nahi.", "Madam, this discount has no parents.", "One more item and I unlock leg day.", "No returns on bad decisions, only better ones."]
  const surpriseMascot = () => setMascotLine(mascotLines[Math.floor(Math.random() * mascotLines.length)])
  const { isLoggedIn, clearUser, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    getProducts().then((data) => {
      const products = Array.isArray(data) ? data : data?.products
      if (mounted && Array.isArray(products) && products.length) setBackendProducts(products)
    }).catch(() => {}).finally(() => mounted && setLoadingProducts(false))
    return () => { mounted = false }
  }, [])

  const products = useMemo(() => {
    const source = backendProducts.length ? backendProducts.map((p, i) => ({
      ...p, id: p.id || p._id || `backend-${i}`, title: p.title || p.name || "Bazaar item", subtitle: p.subtitle || p.category || "Fresh find", description: p.description || "Fresh off the thela. Limited stock, unlimited attitude.", price: p.price || 299, originalPrice: p.original_price || p.originalPrice || p.mrp, image: p.image_url || p.imageUrl || p.image, badge: p.badge || p.tag || "Just arrived", art: "FIND", artClass: ["art-mango", "art-pink", "art-green", "art-lilac"][i % 4]
    })) : fallbackProducts
    const filtered = source.filter((p) => (category === "All stalls" || (p.subtitle || "").toLowerCase().includes(category.replace(" finds", "").toLowerCase())) && `${p.title} ${p.description}`.toLowerCase().includes(query.toLowerCase()))
    return [...filtered].sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : 0)
  }, [backendProducts, category, query, sort])

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(""), 2600) }
  const addToCart = (product) => { setCartCount((n) => n + 1); notify(`${product.title} is in your jhola`) }
  const toggleWishlist = (id) => setWishlist((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  const handleLogout = async () => { try { await logoutUser() } catch {} clearUser(); navigate("/") }

  return <div className="storefront" id="stage">
    <div className="top-ticker"><div className="ticker-track">LOOTLOOTO / THE INTERNET&apos;S MOST UNNECESSARY MARKETPLACE <span>•</span> COD accepted, excuses not required <span>•</span> New thela drops every Saturday <span>•</span> LOOTLOOTO / THE INTERNET&apos;S MOST UNNECESSARY MARKETPLACE <span>•</span></div></div>
    <header className="market-header">
      <div className="header-top">
        <button className="brand" onClick={() => navigate("/")} aria-label="Lootlooto home"><span className="brand-mark">LL</span><span>LOOT<span>LOOTO</span></span></button>
        <div className="location"><span className="pin">+</span><div><small>Delivering to</small><strong>Everywhere, probably</strong></div></div>
        <label className="search"><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the bazaar..." aria-label="Search products" />{query && <button onClick={() => setQuery("")} aria-label="Clear search">×</button>}</label>
        <div className="header-actions">{isLoggedIn ? <button className="account" onClick={handleLogout}><small>Hi, {user?.email?.split("@")[0] || "friend"}</small><strong>Logout</strong></button> : <Link className="account" to="/login"><small>Welcome,</small><strong>Login / Signup</strong></Link>}<button className="icon-action" onClick={() => notify(`${wishlist.length} saved finds waiting`)} aria-label="Wishlist">♡ <b>{wishlist.length}</b></button><button className="cart" onClick={() => notify(cartCount ? `${cartCount} item${cartCount > 1 ? "s" : ""} in your jhola` : "Your jhola is empty, go shopping")}>JHOLA <b>{cartCount}</b></button></div>
      </div>
      <nav className="category-nav" aria-label="Product categories">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}<span className="nav-spacer" /><a href="#deals">Today&apos;s deals</a><a href="#about">Why Lootlooto?</a></nav>
    </header>

    <main>
      <section className="hero-wrap" id="deals"><div className="hero-copy"><span className="eyebrow">Saturday special / no bargaining needed</span><span className="hero-kicker">For people with excellent taste and questionable decisions</span><h1>Small joys.<br /><em>Big jhola.</em></h1><p>{moods[mood].slogan} Street-market energy, doorstep delivery. We already fought the shopkeeper so you can shop in peace.</p><div className="hero-buttons"><a className="button button-dark" href="#products">{moods[mood].cta} <span>→</span></a><button className="text-button" onClick={() => notify("Prices are low. Your willpower is lower.")}>Tell me a secret <span>↗</span></button></div><div className="mood-picker" aria-label="Choose your shopping mood"><span>Today I am:</span>{Object.entries(moods).map(([key, value]) => <button key={key} className={mood === key ? "active" : ""} onClick={() => setMood(key)}>{value.label}</button>)}</div></div><div className="hero-art"><div className="sunburst">UP TO<br /><strong>40%</strong><br />OFF</div><button className="thela-scene" onClick={surpriseMascot} aria-label="Hear a new thela joke"><span className="speech-bubble">{mascotLine}</span><span className="thela-sign">LOOT<br />LOOTO</span><span className="mascot"><span className="mascot-head"><i></i></span><span className="mascot-body"></span><span className="mascot-arm"></span><span className="mascot-leg leg-one"></span><span className="mascot-leg leg-two"></span></span><span className="thela"><span className="thela-roof">TODAY&apos;S BAKRA</span><span className="thela-box"><b>₹</b><i>?</i><em>!</em></span><span className="thela-wheel wheel-one"></span><span className="thela-wheel wheel-two"></span></span><span className="thela-ground"></span></button><div className="hero-card"><span className="tape">AUNTY APPROVED</span><div className="hero-product">JHOLA<br /><small>full of nonsense</small></div><span className="scribble">sasta, sundar,<br />slay.</span></div><span className="hero-sticker sticker-yellow">NO<br />FOMO</span><span className="hero-sticker sticker-pink">₹99<br />STARTS</span></div></section>
      <section className="trust-row"><div><b>01</b><span><strong>Unexpected finds</strong>Stuff you didn&apos;t know you needed</span></div><div><b>02</b><span><strong>Fast-ish delivery</strong>Powered by jugaad and optimism</span></div><div><b>03</b><span><strong>Safe checkout</strong>Your data stays in the jhola</span></div></section>
      <section className="section-heading" id="products"><div><span className="eyebrow">Fresh from the thela</span><h2>Pick your poison.</h2></div><p>Limited stock. Unlimited attitude.<br /><span>Scroll responsibly.</span></p></section>
      <div className="shop-toolbar"><span>{loadingProducts ? "Finding the good stuff..." : `${products.length} things worth adding to cart`}</span><div className="toolbar-controls"><button onClick={() => notify("Filters are just vibes today")}>☷ Filter</button><label>Sort by <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div></div>
      <section className="product-grid">{products.length ? products.map((product) => { const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0; return <article className="product-card" key={product.id}><div className="product-media">{product.image ? <img src={product.image} alt={product.title} /> : <div className={`product-art ${product.artClass}`}><span>{product.art}</span><i>★</i></div>}<span className="product-badge">{product.badge}</span><button className={`heart ${wishlist.includes(product.id) ? "saved" : ""}`} onClick={() => toggleWishlist(product.id)} aria-label={`Save ${product.title}`}>{wishlist.includes(product.id) ? "♥" : "♡"}</button></div><div className="product-info"><span className="product-category">{product.subtitle}</span><h3>{product.title}</h3><p>{product.description}</p><div className="rating"><b>4.7 ★</b><span> · 28 reviews</span></div><div className="price-row"><div><strong>₹{product.price}</strong>{product.originalPrice && <><del>₹{product.originalPrice}</del><small>{discount}% off</small></>}</div><button className="add-button" onClick={() => addToCart(product)} aria-label={`Add ${product.title} to cart`}>+</button></div><small className="delivery">Free delivery · arrives when it arrives</small></div></article> }) : <div className="empty-state"><strong>No such thela exists.</strong><span>Try a different search or browse all stalls.</span><button onClick={() => { setQuery(""); setCategory("All stalls") }}>Reset bazaar</button></div>}</section>
    </main>
    <footer id="about"><div className="footer-brand">LOOT<span>LOOTO</span><small>made for your little obsessions</small></div><p>We put the bazaar on the internet.<br />No aunties were harmed in the making of this store.</p><span className="copyright">© 2026 Lootlooto / running on jugaad</span></footer>
    {toast && <div className="toast" role="status"><span>JUST IN</span><strong>{toast}</strong></div>}
  </div>
}
