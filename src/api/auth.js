import client from "./client"

export const registerUser       = (data)  => client.post("/api/auth/register", data).then(r => r.data)
export const loginUser          = (data)  => client.post("/api/auth/login", data).then(r => r.data)
export const logoutUser         = ()      => client.post("/api/auth/logout").then(r => r.data)
export const refreshToken       = ()      => client.post("/api/auth/refresh").then(r => r.data)
export const getMe              = ()      => client.get("/api/auth/me").then(r => r.data)
export const resendVerification = (email) => client.post("/api/auth/resend-verification", { email_id: email }).then(r => r.data)
export const updateProfile      = (data)  => client.post("/api/auth/profile", data).then(r => r.data)
export const verifyOtp          = (data)  => client.post("/api/auth/verify-otp", data).then(r => r.data)