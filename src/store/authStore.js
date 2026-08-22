import { create } from "zustand"

export const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  setUser:   (user) => set({ user, isLoggedIn: !!user }),
  clearUser: ()     => { localStorage.removeItem("access_token"); set({ user: null, isLoggedIn: false }) },
}))