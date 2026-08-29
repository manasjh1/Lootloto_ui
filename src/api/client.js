import axios from "axios"
import { getToken, setToken, clearSession } from "../utils/session"

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
  timeout: 15000, // 15s default — 3s was too short even for normal requests on a slow connection
  headers: { "Content-Type": "application/json" },
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    // Only attempt refresh for 401 on protected requests, avoid refresh loops on public endpoints
    if (err.response?.status === 401 && !original._retry && !original.url?.includes("/auth/")) {
      original._retry = true
      try {
        const { data } = await client.post("/auth/refresh", {}, { timeout: 2000 })
        if (data?.access_token) {
          setToken(data.access_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return client(original)
        }
      } catch {
        clearSession()
      }
    }
    const msg = err.response?.data?.detail || err.message || "Something went wrong"
    return Promise.reject(new Error(msg))
  }
)

export default client