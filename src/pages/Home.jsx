import React, { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { logoutUser } from "../api/auth"
import { getProducts } from "../api/products"

const fallbackProducts = [
  { id: "1", title: "Bhaav Kam Karo Tee", subtitle: "Everyday essentials", description: "Soft cotton, easy fit, made for everyday living.", price: 549, originalPrice: 899, image: "/placeholder.svg?height=520&width=420" },
  { id: "2", title: "Chaandni Jhumkas", subtitle: "Jewellery", description: "A quiet detail that changes the whole look.", price: 349, image: "/placeholder.svg?height=520&width=420" },
  { id: "3", title: "Nazar Battu Charm", subtitle: "Small objects", description: "A little talisman for your everyday carry.", price: 199, image: "/placeholder.svg?height=520&width=420" },
  { id: "4", title: "Sabzi-to-Slay Tote", subtitle: "Bags & travel", description: "Room for the useful things and the beautiful ones.", price: 399, originalPrice: 599, image: "/placeholder.svg?height=520&width=420" },
]

export default function Home() {
  const [cartCount, setCartCount] = useState(0)
  const [products, setProducts] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const { isLoggedIn, clearUser, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    getProducts().then((data) => {
      const items = Array.isArray(data) ? data : data?.products
      if (items?.length) setProducts(items)
    }).catch(() => {})
  }, [])

  const displayProducts = useMemo(() => products.length ? products.map((product, index) => ({
    ...fallbackProducts[index % fallbackProducts.length], ...product,
    title: product.title || product.name || fallbackProducts[index % fallbackProducts.length].title,
    price: product.price || 299,
    image: product.image_url || product.imageUrl || product.image || fallbackProducts[index % fallbackProducts.length].image,
  })) : fallbackProducts, [products])

  const handleLogout = async () => {
    try { await logoutUser() } catch (error) { console.error(error) }
    clearUser()
    navigate("/")
  }

  return (
    <main className="minimal-home">
      <div className="announcement"><button aria-label="Previous announcement">‹</button><a href="#products">A little something nice for your everyday &nbsp;|&nbsp; Shop now</a><button aria-label="Next announcement">›</button></div>
      <header className="minimal-header">
        <Link to="/" className="brand"><span className="brand-mark">LL</span><span>LOOTLOTO</span></Link>
        <nav className="minimal-nav" aria-label="Main navigation"><a href="#products">New arrivals</a><a href="#products">Collections</a><a href="#products">Best sellers</a><a href="#about">About us</a></nav>
        <div className="header-actions"><button className="search-trigger" onClick={() => setSearchOpen(!searchOpen)} aria-expanded={searchOpen}>⌕ <span>Search</span></button>{isLoggedIn ? <button className="text-button" onClick={handleLogout}>{user?.email || "Account"}</button> : <Link className="text-button" to="/login">Account</Link>}<button className="bag-button" onClick={() => setCartCount((count) => count)} aria-label="Shopping bag">Bag ({cartCount})</button></div>
      </header>
      {searchOpen && <div className="search-panel"><input autoFocus placeholder="Search the collection" aria-label="Search the collection" /></div>}

      <section className="editorial-hero"><div className="hero-image hero-image-left" /><div className="hero-message"><p className="eyebrow">THE EVERYDAY EDIT</p><h1>Objects with<br /><em>a little feeling.</em></h1><p>Thoughtful, useful things for the way you live now. Made to be kept, gifted, and loved a little longer.</p><a className="quiet-link" href="#products">Explore the collection <span>→</span></a></div><div className="hero-image hero-image-right" /></section>
      <section className="category-row" id="about"><p>Made in India, found everywhere.</p><a href="#products">Shop all</a><p>Small-batch objects for slower days.</p></section>
      <section className="products-section" id="products"><div className="section-heading"><div><p className="eyebrow">A CONSIDERED COLLECTION</p><h2>New arrivals</h2></div><a className="quiet-link" href="#products">View all <span>→</span></a></div><div className="product-grid">{displayProducts.map((product) => <article className="product-card" key={product.id}><div className="product-image"><img src={product.image} alt={product.title} /><span>New arrival</span></div><div className="product-meta"><div><h3>{product.title}</h3><p>{product.subtitle || product.category || "Everyday objects"}</p></div><div className="product-price"><span>₹ {Number(product.price).toLocaleString("en-IN")}</span>{product.originalPrice && <del>₹ {Number(product.originalPrice).toLocaleString("en-IN")}</del>}</div></div><button className="add-button" onClick={() => setCartCount((count) => count + 1)}>Add to bag</button></article>)}</div></section>
      <footer className="minimal-footer"><Link to="/" className="brand">LOOTLOTO</Link><p>Useful things, beautifully considered.</p><div><a href="#about">Our story</a><a href="#products">Contact</a><a href="#products">Instagram</a></div></footer>
    </main>
  )
}
