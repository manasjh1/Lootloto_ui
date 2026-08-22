import client from "./client"

export const registerUser       = (data)  => client.post("/auth/register", data).then(r => r.data)
export const loginUser          = (data)  => client.post("/auth/login", data).then(r => r.data)
export const logoutUser         = ()      => client.post("/auth/logout").then(r => r.data)
export const refreshToken       = ()      => client.post("/auth/refresh").then(r => r.data)
export const getMe              = ()      => client.get("/auth/me").then(r => r.data)
export const resendVerification = (email) => client.post("/auth/resend-verification", { email_id: email }).then(r => r.data)
export const updateProfile      = (data)  => client.post("/auth/profile", data).then(r => r.data)