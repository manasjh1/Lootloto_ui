// Central helper for persisting the auth session (JWT + user info like role/name)
// "Remember me" -> localStorage (survives browser close)
// otherwise      -> sessionStorage (cleared when the tab/browser closes)

const TOKEN_KEY = "access_token"
const USER_KEY = "auth_user"

export function saveSession({ token, user, remember = true }) {
  const storage = remember ? localStorage : sessionStorage
  const other = remember ? sessionStorage : localStorage

  // avoid stale duplicates in the storage we're not using
  other.removeItem(TOKEN_KEY)
  other.removeItem(USER_KEY)

  if (token) storage.setItem(TOKEN_KEY, token)
  if (user) storage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null
}

export function setToken(token) {
  // keep the token in whichever storage already holds the session
  const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}