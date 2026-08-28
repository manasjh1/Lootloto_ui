import axios from "axios"

const client = axios.create({
  baseURL: "",
  withCredentials: true,
  timeout: 3000,
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
    // Only attempt refresh for 401 on protected requests, avoid refresh loops on public endpoints
    if (err.response?.status === 401 && !original._retry && !original.url?.includes("/auth/")) {
      original._retry = true
      try {
        const { data } = await client.post("/auth/refresh", {}, { timeout: 2000 })
        if (data?.access_token) {
          localStorage.setItem("access_token", data.access_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return client(original)
        }
      } catch {
        localStorage.removeItem("access_token")
      }
    }
    const msg = err.response?.data?.detail || err.message || "Something went wrong"
    return Promise.reject(new Error(msg))
  }
)

export default client