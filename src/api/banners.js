import client from "./client"

// Marketing banners (promo photo sliders + sale-campaign ad sliders).
// Backend contract (not yet implemented — this fails soft until it lands):
//   GET    /catalog/banners?type=promo|ad          -> [{ uuid, type, image_url, caption, link_url, sort_order, is_active }]
//   POST   /catalog/banners                        -> create
//   PATCH  /catalog/banners/{uuid}                 -> update (incl. sort_order, is_active)
//   DELETE /catalog/banners/{uuid}                 -> delete

export const getBanners = async (type) => {
  try {
    const res = await client.get("/catalog/banners", { params: type ? { type } : {} })
    const data = res.data
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.items)) return data.items
    return []
  } catch {
    return []
  }
}

export const createBanner = async (payload) => {
  const res = await client.post("/catalog/banners", payload)
  return res.data
}

export const updateBanner = async (uuid, payload) => {
  const res = await client.patch(`/catalog/banners/${uuid}`, payload)
  return res.data
}

export const deleteBanner = async (uuid) => {
  await client.delete(`/catalog/banners/${uuid}`)
}
