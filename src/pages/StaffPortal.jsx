import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import client from "../api/client"
import { useAuthStore } from "../store/authStore"
import "../styles/staffPortal.css"

const TAB_NAMES = ["Basics", "Category & price", "Status", "Inventory", "Images"]
const EMPTY_FORM = {
  uuid: "",
  name: "",
  sku: "",
  slug: "",
  slugManual: false,
  brand: "",
  variant: "",
  description: "",
  category_id: "",
  selling_price: "",
  compare_price: "",
  status: "OK",
  is_published: true,
  opening_qty: "0",
  current_qty: "0",
  reorder_level: "",
  pack_qty: "",
  location_bin: "",
  supplier: "",
  purchase_date: "",
  actual_unit_cost: "",
  notes: "",
  images: [],
}

export default function StaffPortal() {
  const navigate = useNavigate()
  const { user, clearUser } = useAuthStore()

  // ── Catalog state ──────────────────────────────
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  // ── Sheet / form wizard state ──────────────────
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState("new") // "new" | "edit"
  const [tab, setTab] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imgUrlInput, setImgUrlInput] = useState("")

  // ── Modals ──────────────────────────────────────
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [staffModalOpen, setStaffModalOpen] = useState(false)
  const [catForm, setCatForm] = useState({ name: "", slug: "" })
  const [staffForm, setStaffForm] = useState({ first_name: "", last_name: "", email_id: "", phone_number: "", password: "" })

  // ── Toasts ──────────────────────────────────────
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)
  const searchDebounce = useRef(null)

  const showToast = useCallback((msg, type = "info") => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  // ── Data loading ────────────────────────────────
  const loadCategories = useCallback(async () => {
    try {
      const res = await client.get("/catalog/categories")
      setCategories(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error("Categories error", err)
    }
  }, [])

  const loadProducts = useCallback(async () => {
    try {
      const params = { limit: 100 }
      if (search) params.search = search
      if (filterCategory) params.category_id = filterCategory
      if (activeFilter === "pub") params.is_published = true
      if (activeFilter === "low") params.status = "LOW_STOCK"

      const res = await client.get("/catalog/products", { params })
      setProducts(res.data?.items || [])
    } catch (err) {
      console.error("Failed to load products", err)
    }
  }, [search, filterCategory, activeFilter])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // debounce search typing
  function onSearchChange(v) {
    clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => setSearch(v), 300)
  }

  // ── Derived counts ──────────────────────────────
  const total = products.length
  const pubCount = products.filter((p) => p.is_published).length
  const lowCount = products.filter((p) => p.status === "LOW_STOCK" || p.status === "OUT_OF_STOCK").length

  // ── Sheet open/close ────────────────────────────
  function openSheetNew() {
    setForm(EMPTY_FORM)
    setSheetMode("new")
    setTab(0)
    setSheetOpen(true)
  }

  function closeSheet() {
    setSheetOpen(false)
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function onNameChange(v) {
    setForm((f) => ({
      ...f,
      name: v,
      slug: f.slugManual ? f.slug : slugify(v),
    }))
  }

  function slugify(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  // ── Images ──────────────────────────────────────
  function addImageFromUrl() {
    const url = imgUrlInput.trim()
    if (!url) return
    setForm((f) => ({
      ...f,
      images: [...f.images, { url, sort_order: f.images.length, is_primary: f.images.length === 0 }],
    }))
    setImgUrlInput("")
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    showToast(files.length > 1 ? `Uploading ${files.length} files...` : "Uploading file...", "info")
    let uploaded = 0
    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file)
      try {
        const res = await client.post("/catalog/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000, // uploads (Supabase Storage round-trip) need more room than the 15s default
        })
        setForm((f) => ({
          ...f,
          images: [...f.images, { url: res.data.url, sort_order: f.images.length, is_primary: f.images.length === 0 }],
        }))
        uploaded++
      } catch (err) {
        showToast(`${file.name}: ${err.message || "Upload failed"}`, "error")
      }
    }
    if (uploaded > 0) showToast(uploaded > 1 ? `${uploaded} images uploaded!` : "Image uploaded!", "success")
    e.target.value = ""
  }

  function removeImage(idx) {
    setForm((f) => {
      const images = f.images.filter((_, i) => i !== idx)
      if (images.length > 0 && !images.some((i) => i.is_primary)) images[0].is_primary = true
      return { ...f, images }
    })
  }

  function setPrimary(idx) {
    setForm((f) => ({
      ...f,
      images: f.images.map((img, i) => ({ ...img, is_primary: i === idx })),
    }))
  }

  // ── Save product ────────────────────────────────
  async function saveProduct() {
    if (!form.name || !form.sku || !form.category_id || form.selling_price === "") {
      showToast("Please fill in all required fields (*)", "error")
      return
    }
    const payload = {
      category_id: form.category_id,
      sku: form.sku,
      slug: form.slug || undefined,
      name: form.name,
      brand: form.brand || undefined,
      variant: form.variant || undefined,
      description: form.description || undefined,
      selling_price: parseFloat(form.selling_price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : undefined,
      status: form.status,
      is_published: form.is_published,
      opening_qty: parseInt(form.opening_qty) || 0,
      current_qty: parseInt(form.current_qty) || 0,
      reorder_level: form.reorder_level ? parseInt(form.reorder_level) : undefined,
      pack_qty: form.pack_qty ? parseFloat(form.pack_qty) : undefined,
      location_bin: form.location_bin || undefined,
      supplier: form.supplier || undefined,
      purchase_date: form.purchase_date || undefined,
      actual_unit_cost: form.actual_unit_cost ? parseFloat(form.actual_unit_cost) : undefined,
      notes: form.notes || undefined,
      images: form.images,
    }

    const isEdit = Boolean(form.uuid)
    try {
      if (isEdit) {
        await client.patch(`/catalog/products/${form.uuid}`, payload)
      } else {
        await client.post("/catalog/products", payload)
      }
      showToast(isEdit ? "Product updated!" : "Product created!", "success")
      closeSheet()
      loadProducts()
    } catch (err) {
      showToast(err.message || "Save failed", "error")
    }
  }

  async function editProduct(uuid) {
    try {
      const res = await client.get(`/catalog/products/${uuid}`)
      const p = res.data
      setForm({
        uuid: p.uuid,
        name: p.name || "",
        sku: p.sku || "",
        slug: p.slug || "",
        slugManual: true,
        brand: p.brand || "",
        variant: p.variant || "",
        description: p.description || "",
        category_id: p.category_id || "",
        selling_price: p.selling_price ?? "",
        compare_price: p.compare_price ?? "",
        status: p.status || "OK",
        is_published: Boolean(p.is_published),
        opening_qty: String(p.opening_qty ?? 0),
        current_qty: String(p.current_qty ?? 0),
        reorder_level: p.reorder_level ?? "",
        pack_qty: p.pack_qty ?? "",
        location_bin: p.location_bin || "",
        supplier: p.supplier || "",
        purchase_date: p.purchase_date || "",
        actual_unit_cost: p.actual_unit_cost ?? "",
        notes: p.notes || "",
        images: (p.images || []).map((i) => ({ url: i.url, sort_order: i.sort_order || 0, is_primary: i.is_primary || false })),
      })
      setSheetMode("edit")
      setTab(0)
      setSheetOpen(true)
    } catch (err) {
      showToast(err.message || "Could not fetch product", "error")
    }
  }

  async function deleteProduct(uuid) {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      await client.delete(`/catalog/products/${uuid}`)
      showToast("Product deleted", "success")
      loadProducts()
    } catch (err) {
      showToast(err.message || "Delete failed", "error")
    }
  }

  // ── Category modal ──────────────────────────────
  async function handleCategorySubmit(e) {
    e.preventDefault()
    try {
      const res = await client.post("/catalog/categories", {
        name: catForm.name,
        slug: catForm.slug || undefined,
      })
      showToast(`Category '${res.data.name}' created!`, "success")
      setCategoryModalOpen(false)
      setCatForm({ name: "", slug: "" })
      await loadCategories()
      setField("category_id", res.data.uuid)
    } catch (err) {
      showToast(err.message || "Category creation failed", "error")
    }
  }

  // ── Create staff modal (admin only) ─────────────
  async function handleStaffSubmit(e) {
    e.preventDefault()
    try {
      const res = await client.post("/auth/admin/create-staff", {
        first_name: staffForm.first_name,
        last_name: staffForm.last_name || undefined,
        email_id: staffForm.email_id,
        phone_number: parseInt(staffForm.phone_number),
        password: staffForm.password,
      })
      showToast(`Staff account ${res.data.user.email_id} created!`, "success")
      setStaffModalOpen(false)
      setStaffForm({ first_name: "", last_name: "", email_id: "", phone_number: "", password: "" })
    } catch (err) {
      showToast(err.message || "Staff creation failed", "error")
    }
  }

  function handleLogout() {
    clearUser()
    navigate("/login")
  }

  return (
    <div className="staff-portal">
      <div className="page">
        {/* Top Nav Header */}
        <div className="top">
          <div className="brand">
            <div className="brand-mark">L</div>
            <div>
              <div className="brand-title">LootLooto Catalog</div>
              <div className="brand-sub">Products & inventory</div>
            </div>
          </div>
          <div className="top-right">
            <span className="tag tag-accent-2">{user?.role?.toUpperCase() || "STAFF"}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.name || user?.email || "Signed in"}</span>
            {user?.role === "admin" && (
              <button className="btn" onClick={() => setStaffModalOpen(true)}>Create Staff</button>
            )}
            <button className="btn btn-ghost" onClick={handleLogout}>Sign out</button>
          </div>
        </div>

        {/* Hero Header */}
        <div className="h-hero">
          <div>
            <div className="kicker">Catalog</div>
            <h1 className="h1">{total} product{total !== 1 ? "s" : ""}</h1>
            <p className="h-sub">Catalog inventory dashboard. Add or edit items using the side panel.</p>
          </div>
          <button className="btn btn-primary" onClick={openSheetNew}>＋ New product</button>
        </div>

        {/* Filter Chips */}
        <div className="chips">
          <button className="chip" aria-pressed={activeFilter === "all"} onClick={() => setActiveFilter("all")}>All · {total}</button>
          <button className="chip" aria-pressed={activeFilter === "pub"} onClick={() => setActiveFilter("pub")}>Published · {pubCount}</button>
          <button className="chip warn" aria-pressed={activeFilter === "low"} onClick={() => setActiveFilter("low")}>Low stock · {lowCount}</button>
          <button className="chip" aria-pressed={activeFilter === "cat"} onClick={() => setActiveFilter("cat")}>Categories · {categories.length}</button>
        </div>

        {/* Search & Toolbar */}
        <div className="toolbar">
          <div className="search field" style={{ margin: 0, flex: 1 }}>
            <input className="input" placeholder="Search by name, SKU, brand…" onChange={(e) => onSearchChange(e.target.value)} />
          </div>
          <select className="input" style={{ width: 200 }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}
          </select>
        </div>

        {/* Product Catalog Table */}
        <div className="catalog">
          <div className="row head">
            <div>Image</div>
            <div>Name & SKU</div>
            <div className="col-cat">Category</div>
            <div>Price</div>
            <div className="col-stock">Stock</div>
            <div className="col-status">Status</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>
          {products.length === 0 ? (
            <div className="empty">No products match. Click <strong>＋ New product</strong> to add one!</div>
          ) : (
            products.map((p) => {
              const thumb = p.images?.length > 0 ? (p.images.find((i) => i.is_primary) || p.images[0]).url : "https://via.placeholder.com/56?text=No+Img"
              const catName = p.category?.name || "Uncategorized"
              const isLow = p.status === "LOW_STOCK" || p.status === "OUT_OF_STOCK"
              return (
                <div className="row" key={p.uuid}>
                  <div className="thumb"><img src={thumb} alt="" /></div>
                  <div>
                    <div className="p-name">{p.name}</div>
                    <div className="p-sku">SKU · {p.sku}</div>
                  </div>
                  <div className="col-cat"><span className="tag tag-outline">{catName}</span></div>
                  <div className="price">₹{Number(p.selling_price).toFixed(2)}</div>
                  <div className="col-stock">{p.current_qty}</div>
                  <div className="col-status"><span className={`status-tag ${isLow ? "low" : ""}`}>{p.status.replace("_", " ")}</span></div>
                  <div className="row-actions">
                    <button className="btn" onClick={() => editProduct(p.uuid)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => deleteProduct(p.uuid)}>Delete</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Side Sheet */}
      <div className={`backdrop ${sheetOpen ? "open" : ""}`} onClick={closeSheet} />
      <aside className={`sheet ${sheetOpen ? "open" : ""}`} aria-hidden={!sheetOpen}>
        <div className="sheet-head">
          <div>
            <div className="kicker">{sheetMode === "edit" ? "Edit product" : "New product"}</div>
            <h2 className="sheet-title">{sheetMode === "edit" ? form.name : "Product Details"}</h2>
          </div>
          <button className="close" onClick={closeSheet} aria-label="Close">✕</button>
        </div>

        <div className="tabs" role="tablist">
          {TAB_NAMES.map((name, i) => (
            <button key={name} className="tab" aria-selected={tab === i} onClick={() => setTab(i)}>{name}</button>
          ))}
        </div>

        <div className="sheet-body">
          {/* Pane 0: Basics */}
          <div className={`pane ${tab === 0 ? "active" : ""}`}>
            <div className="field">
              <label>Product name <span className="req">*</span></label>
              <input className="input" value={form.name} onChange={(e) => onNameChange(e.target.value)} placeholder="e.g. Chevron Palms Cushion Cover" />
            </div>
            <div className="grid-2">
              <div className="field"><label>SKU <span className="req">*</span></label><input className="input" value={form.sku} onChange={(e) => setField("sku", e.target.value)} placeholder="CU-CH-CO" /></div>
              <div className="field"><label>Slug</label><input className="input" value={form.slug} onChange={(e) => { setField("slug", e.target.value); setField("slugManual", true) }} placeholder="auto-generated" /></div>
            </div>
            <div className="grid-2">
              <div className="field"><label>Brand</label><input className="input" value={form.brand} onChange={(e) => setField("brand", e.target.value)} placeholder="Lootlooto" /></div>
              <div className="field"><label>Variant</label><input className="input" value={form.variant} onChange={(e) => setField("variant", e.target.value)} placeholder="e.g. Black / 40x40" /></div>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea className="input" value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Product features & specifications..." />
            </div>
          </div>

          {/* Pane 1: Category & Price */}
          <div className={`pane ${tab === 1 ? "active" : ""}`}>
            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label>Category <span className="req">*</span></label>
                <button type="button" className="btn btn-ghost" style={{ padding: "2px 8px", fontSize: 12 }} onClick={() => setCategoryModalOpen(true)}>＋ New category</button>
              </div>
              <select className="input" value={form.category_id} onChange={(e) => setField("category_id", e.target.value)}>
                <option value="">Select Category...</option>
                {categories.map((c) => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="field"><label>Selling price (₹) <span className="req">*</span></label><input type="number" step="0.01" className="input" value={form.selling_price} onChange={(e) => setField("selling_price", e.target.value)} placeholder="499.00" /></div>
              <div className="field"><label>Compare price (₹)</label><input type="number" step="0.01" className="input" value={form.compare_price} onChange={(e) => setField("compare_price", e.target.value)} placeholder="999.00" /></div>
            </div>
          </div>

          {/* Pane 2: Status & Visibility */}
          <div className={`pane ${tab === 2 ? "active" : ""}`}>
            <div className="field">
              <label>Status</label>
              <select className="input" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                <option value="OK">OK</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div>
            <div className="field">
              <label>Published</label>
              <div className="switch">
                <div className={`toggle ${form.is_published ? "" : "off"}`} onClick={() => setField("is_published", !form.is_published)} />
                <span>{form.is_published ? "Live on storefront" : "Draft (Hidden)"}</span>
              </div>
            </div>
          </div>

          {/* Pane 3: Inventory */}
          <div className={`pane ${tab === 3 ? "active" : ""}`}>
            <div className="grid-2">
              <div className="field"><label>Opening qty</label><input type="number" className="input" value={form.opening_qty} onChange={(e) => setField("opening_qty", e.target.value)} /></div>
              <div className="field"><label>Current qty</label><input type="number" className="input" value={form.current_qty} onChange={(e) => setField("current_qty", e.target.value)} /></div>
              <div className="field"><label>Reorder level</label><input type="number" className="input" value={form.reorder_level} onChange={(e) => setField("reorder_level", e.target.value)} placeholder="10" /></div>
              <div className="field"><label>Pack qty</label><input type="number" step="0.01" className="input" value={form.pack_qty} onChange={(e) => setField("pack_qty", e.target.value)} placeholder="1.0" /></div>
              <div className="field"><label>Location / bin</label><input className="input" value={form.location_bin} onChange={(e) => setField("location_bin", e.target.value)} placeholder="Bin A-12" /></div>
              <div className="field"><label>Supplier</label><input className="input" value={form.supplier} onChange={(e) => setField("supplier", e.target.value)} placeholder="Supplier name" /></div>
              <div className="field"><label>Purchase date</label><input type="date" className="input" value={form.purchase_date} onChange={(e) => setField("purchase_date", e.target.value)} /></div>
              <div className="field"><label>Actual unit cost (₹)</label><input type="number" step="0.01" className="input" value={form.actual_unit_cost} onChange={(e) => setField("actual_unit_cost", e.target.value)} placeholder="250.00" /></div>
            </div>
            <div className="field">
              <label>Internal notes</label>
              <textarea className="input" value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Staff inventory notes…" />
            </div>
          </div>

          {/* Pane 4: Images */}
          <div className={`pane ${tab === 4 ? "active" : ""}`}>
            <div className="field">
              <label>Add by URL</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" value={imgUrlInput} onChange={(e) => setImgUrlInput(e.target.value)} placeholder="Paste image URL…" style={{ flex: 1 }} />
                <button type="button" className="btn" onClick={addImageFromUrl}>Add</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <label className="btn" style={{ cursor: "pointer", display: "inline-block" }}>
                📁 Upload file
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileUpload} />
              </label>
              <label className="btn" style={{ cursor: "pointer", display: "inline-block" }}>
                📷 Take photo
                <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileUpload} />
              </label>
            </div>
            <div className="img-list">
              {form.images.map((img, i) => (
                <div className="img-tile" key={i}>
                  <img src={img.url} alt="" onClick={() => setPrimary(i)} title="Click to set primary" />
                  {img.is_primary && <div className="badge">Primary</div>}
                  <button type="button" className="rm" onClick={() => removeImage(i)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sheet-foot">
          <span className="foot-hint">Step {tab + 1} of 5 · {TAB_NAMES[tab]}</span>
          <div className="foot-nav">
            {tab > 0 && <button className="btn" onClick={() => setTab(tab - 1)}>Back</button>}
            {tab < 4 && <button className="btn btn-primary" onClick={() => setTab(tab + 1)}>Next</button>}
            {tab === 4 && <button className="btn btn-primary" onClick={saveProduct}>Save product</button>}
          </div>
        </div>
      </aside>

      {/* Category Modal */}
      <div className={`modal-overlay ${categoryModalOpen ? "active" : ""}`}>
        <div className="modal-box">
          <div className="modal-title">🏷️ Create Category</div>
          <form onSubmit={handleCategorySubmit}>
            <div className="field">
              <label>Category Name <span className="req">*</span></label>
              <input type="text" className="input" required value={catForm.name} onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Cushions" />
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Slug (optional)</label>
              <input type="text" className="input" value={catForm.slug} onChange={(e) => setCatForm((f) => ({ ...f, slug: e.target.value }))} placeholder="e.g. cushions" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Save category</button>
            <button type="button" className="btn btn-ghost" style={{ width: "100%", marginTop: 8 }} onClick={() => setCategoryModalOpen(false)}>Cancel</button>
          </form>
        </div>
      </div>

      {/* Create Staff Modal (admin only) */}
      <div className={`modal-overlay ${staffModalOpen ? "active" : ""}`}>
        <div className="modal-box">
          <div className="modal-title">👨‍💼 Create Staff Account</div>
          <form onSubmit={handleStaffSubmit}>
            <div className="field">
              <label>First Name <span className="req">*</span></label>
              <input type="text" className="input" required value={staffForm.first_name} onChange={(e) => setStaffForm((f) => ({ ...f, first_name: e.target.value }))} placeholder="John" />
            </div>
            <div className="field">
              <label>Last Name</label>
              <input type="text" className="input" value={staffForm.last_name} onChange={(e) => setStaffForm((f) => ({ ...f, last_name: e.target.value }))} placeholder="Doe" />
            </div>
            <div className="field">
              <label>Email Address <span className="req">*</span></label>
              <input type="email" className="input" required value={staffForm.email_id} onChange={(e) => setStaffForm((f) => ({ ...f, email_id: e.target.value }))} placeholder="staff@lootlooto.com" />
            </div>
            <div className="field">
              <label>Phone Number <span className="req">*</span></label>
              <input type="number" className="input" required value={staffForm.phone_number} onChange={(e) => setStaffForm((f) => ({ ...f, phone_number: e.target.value }))} placeholder="9876543210" />
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Password <span className="req">*</span></label>
              <input type="password" className="input" required value={staffForm.password} onChange={(e) => setStaffForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Create Staff Account</button>
            <button type="button" className="btn btn-ghost" style={{ width: "100%", marginTop: 8 }} onClick={() => setStaffModalOpen(false)}>Cancel</button>
          </form>
        </div>
      </div>

      {/* Toasts */}
      <div id="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  )
}