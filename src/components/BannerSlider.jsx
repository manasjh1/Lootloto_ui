import { useState, useEffect, useRef } from "react"
import { getBanners } from "../api/banners"

const COLORS = { text: "#181030", orange: "#FF7A1A", pink: "#F0177B", gold: "#FFC94A" }

// A rotating banner slider. `type="promo"` for the big featured photo
// slides, `type="ad"` for the smaller sale-campaign strip (Winter Sale,
// Diwali Sale, etc). Renders nothing until banners of that type exist —
// no fabricated placeholder slides pretending to be real promotions.
export default function BannerSlider({ type, onShopNow, height = 320 }) {
  const [slides, setSlides] = useState([])
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    getBanners(type).then((data) => {
      if (isMounted) setSlides(data.filter((b) => b.is_active !== false))
    })
    return () => { isMounted = false }
  }, [type])

  useEffect(() => {
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(timerRef.current)
  }, [slides.length])

  if (slides.length === 0) return null

  const slide = slides[index]

  return (
    <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", border: "2px solid rgba(24,16,48,0.1)", height, marginBottom: 26 }}>
      {slides.map((s, i) => (
        <div
          key={s.uuid || i}
          style={{
            position: "absolute", inset: 0, opacity: i === index ? 1 : 0, transition: "opacity 0.5s ease",
            backgroundImage: `url(${s.image_url})`, backgroundSize: "cover", backgroundPosition: "center",
          }}
        />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(24,16,48,0.55), transparent 65%)" }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 6%", maxWidth: 460 }}>
        {slide.caption && (
          <h2 style={{ fontFamily: "'Baloo 2'", fontSize: "clamp(22px,3.2vw,36px)", fontWeight: 800, color: COLORS.gold, margin: "0 0 14px", lineHeight: 1.2 }}>
            {slide.caption}
          </h2>
        )}
        <button
          onClick={() => onShopNow?.(slide)}
          style={{
            alignSelf: "flex-start", fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 13,
            padding: "10px 24px", borderRadius: 999, background: COLORS.gold, color: COLORS.text,
            border: `2px solid ${COLORS.text}`, boxShadow: `3px 3px 0 ${COLORS.pink}`, cursor: "pointer",
          }}
        >
          Shop Now 🛍️
        </button>
      </div>
      {slides.length > 1 && (
        <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              style={{ width: 8, height: 8, borderRadius: "50%", border: "none", cursor: "pointer", background: i === index ? COLORS.gold : "rgba(255,255,255,0.5)" }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
