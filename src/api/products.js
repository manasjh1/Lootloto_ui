import client from "./client"

// Fetch products from backend catalog
export const getProducts = async (params = {}) => {
  try {
    const res = await client.get("/catalog/products", { params: { page_size: 100, ...params }, timeout: 5000 })
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

// Fetch catalog categories
export const getCategories = async () => {
  try {
    const res = await client.get("/catalog/categories", { timeout: 5000 })
    return Array.isArray(res.data) ? res.data : []
  } catch {
    return []
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
