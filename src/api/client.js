import axios from "axios"

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await client.post("/auth/refresh")
        localStorage.setItem("access_token", data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return client(original)
      } catch {
        localStorage.removeItem("access_token")
        window.location.href = "/login"
      }
    }
    const msg = err.response?.data?.detail || err.message || "Something went wrong"
    return Promise.reject(new Error(msg))
  }
)

export default client