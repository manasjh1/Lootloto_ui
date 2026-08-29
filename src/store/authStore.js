import { create } from "zustand"
import { getStoredUser, getToken, saveSession, clearSession } from "../utils/session"

// Hydrate synchronously from storage so a page refresh doesn't lose the
// logged-in state or flash a redirect to /login before we know better.
const initialUser = getStoredUser()
const initialToken = getToken()

export const useAuthStore = create((set) => ({
  user: initialUser,
  isLoggedIn: !!(initialUser && initialToken),

  // Call after login / verify-otp: persists the JWT + user (name, role, etc.)
  // and updates state in one go. `remember` controls localStorage vs sessionStorage.
  setSession: (token, user, remember = true) => {
    saveSession({ token, user, remember })
    set({ user, isLoggedIn: !!user })
  },

  setUser: (user) => set({ user, isLoggedIn: !!user }),

  clearUser: () => {
    clearSession()
    set({ user: null, isLoggedIn: false })
  },
}))