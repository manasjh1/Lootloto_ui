import client from "./client"

// Fetch products from backend catalog
export const getProducts = async () => {
  try {
    const res = await client.get("/catalog/products", { timeout: 3000 })
    const data = res.data

    // Backend returns { items: [...], total: N, ... }
    if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
      return data.items
    }
    // Fallback: plain array
    if (Array.isArray(data) && data.length > 0) {
      return data
    }
    // Fallback: { products: [...] }
    if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
      return data.products
    }
    return null
  } catch {
    return null
  }
}

export const createProduct = async (productData) => {
  try {
    const res = await client.post("/catalog/products", productData, { timeout: 5000 })
    return res.data
  } catch {
    return null
  }
}
