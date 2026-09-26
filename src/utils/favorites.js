// Per-user favorites, stored locally until the backend tracks them (see item 6
// of the marketplace roadmap). Scoped by user uuid so switching accounts on
// the same browser doesn't leak favorites between customers.

function storageKey(userId) {
  return `lootlooto_favs_${userId}`
}

export function getFavorites(userId) {
  if (!userId) return []
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId))) || []
  } catch {
    return []
  }
}

export function isFavorite(userId, productId) {
  return getFavorites(userId).includes(productId)
}

export function toggleFavorite(userId, productId) {
  if (!userId) return []
  const current = getFavorites(userId)
  const next = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId]
  localStorage.setItem(storageKey(userId), JSON.stringify(next))
  return next
}
