import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useNavigate, Link } from "react-router-dom"
import client from "../api/client"
import { useAuthStore } from "../store/authStore"
import "../styles/adminPortal.css"

const EMPTY_STAFF_FORM = { first_name: "", last_name: "", email_id: "", phone_number: "", password: "", role: "staff" }

export default function AdminPortal() {
  const navigate = useNavigate()
  const { user, clearUser } = useAuthStore()

  // ── User list state ─────────────────────────────
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState("all")
  const [search, setSearch] = useState("")

  // ── Create staff modal ──────────────────────────
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [staffForm, setStaffForm] = useState(EMPTY_STAFF_FORM)

  // ── Toasts ───────────────────────────────────────
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  const showToast = useCallback((msg, type = "ok") => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  // ── Load users ───────────────────────────────────
  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await client.get("/auth/admin/users")
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      showToast(err.message || "Failed to load users", "err")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // ── Derived: stats, counts, filtered rows ───────
  const stats = useMemo(() => ({
    total: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    staff: users.filter((u) => u.role === "staff").length,
    active: users.filter((u) => u.is_active).length,
    buyer: users.filter((u) => u.role === "buyer").length,
  }), [users])

  const filteredUsers = useMemo(() => {
    let list = users
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((u) =>
        `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase().includes(q) ||
        (u.email_id || "").toLowerCase().includes(q)
      )
    }
    return list
  }, [users, roleFilter, search])

  // ── Role change ──────────────────────────────────
  async function changeRole(uuid, newRole) {
    const prev = users.find((u) => u.uuid === uuid)?.role
    setUsers((list) => list.map((u) => (u.uuid === uuid ? { ...u, role: newRole } : u)))
    try {
      await client.patch(`/auth/admin/users/${uuid}/role`, { role: newRole })
      showToast(`Role changed to ${newRole}`, "ok")
    } catch (err) {
      setUsers((list) => list.map((u) => (u.uuid === uuid ? { ...u, role: prev } : u)))
      showToast(err.message || "Role change failed", "err")
    }
  }

  // ── Activate / deactivate ────────────────────────
  async function toggleStatus(uuid, activate) {
    try {
      await client.patch(`/auth/admin/users/${uuid}/status`, { is_active: activate })
      setUsers((list) => list.map((u) => (u.uuid === uuid ? { ...u, is_active: activate } : u)))
      showToast(activate ? "Account activated" : "Account deactivated", "ok")
    } catch (err) {
      showToast(err.message || "Status update failed", "err")
    }
  }

  // ── Create staff/admin ───────────────────────────
  function openCreateModal() {
    setStaffForm(EMPTY_STAFF_FORM)
    setCreateOpen(true)
  }

  async function handleCreateSubmit(e) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await client.post("/auth/admin/create-staff", {
        first_name: staffForm.first_name,
        last_name: staffForm.last_name || undefined,
        email_id: staffForm.email_id,
        phone_number: parseInt(staffForm.phone_number),
        password: staffForm.password,
      })
      // Backend always creates a "staff" account first — bump to admin if that was selected.
      if (staffForm.role === "admin" && res.data?.user?.uuid) {
        await client.patch(`/auth/admin/users/${res.data.user.uuid}/role`, { role: "admin" })
      }
      showToast(`Account created for ${res.data.user.email_id}`, "ok")
      setCreateOpen(false)
      await loadUsers()
    } catch (err) {
      showToast(err.message || "Account creation failed", "err")
    } finally {
      setCreating(false)
    }
  }

  function handleLogout() {
    clearUser()
    navigate("/login")
  }

  return (
    <div className="admin-portal">
      {/* Top bar */}
      <div className="a-topbar">
        <div className="a-topbar-inner">
          <div className="a-brand">
            <div className="a-brand-mark">L</div>
            <span className="a-brand-name">LootLooto</span>
            <span className="a-brand-badge">Admin</span>
          </div>
          <div className="a-topbar-spacer" />
          <div className="a-topbar-user">
            <Link to="/staff" className="a-btn a-btn-ghost a-btn-sm">Manage catalog</Link>
            <span className="a-topbar-role">{user?.role?.toUpperCase() || "ADMIN"}</span>
            <strong>{user?.name || user?.first_name || user?.email || "Signed in"}</strong>
            <button className="a-btn a-btn-ghost a-btn-sm" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
      </div>

      <div className="a-page">
        <div className="a-page-head">
          <div>
            <div className="a-page-title">User Management</div>
            <div className="a-page-sub">Manage roles, access, and team accounts</div>
          </div>
          <button className="a-btn a-btn-primary" onClick={openCreateModal}>＋ Create Staff</button>
        </div>

        {/* Stats */}
        <div className="a-stats-row">
          <div className="a-stat-card"><div className="a-stat-label">Total users</div><div className="a-stat-value">{loading ? "—" : stats.total}</div></div>
          <div className="a-stat-card"><div className="a-stat-label">Admins</div><div className="a-stat-value accent">{loading ? "—" : stats.admin}</div></div>
          <div className="a-stat-card"><div className="a-stat-label">Staff</div><div className="a-stat-value warn">{loading ? "—" : stats.staff}</div></div>
          <div className="a-stat-card"><div className="a-stat-label">Active</div><div className="a-stat-value success">{loading ? "—" : stats.active}</div></div>
        </div>

        {/* Filter + search */}
        <div className="a-filter-row">
          <button className={`a-filter-tab ${roleFilter === "all" ? "active" : ""}`} onClick={() => setRoleFilter("all")}>All <span className="a-filter-count">{stats.total}</span></button>
          <button className={`a-filter-tab ${roleFilter === "admin" ? "active" : ""}`} onClick={() => setRoleFilter("admin")}>Admin <span className="a-filter-count">{stats.admin}</span></button>
          <button className={`a-filter-tab ${roleFilter === "staff" ? "active" : ""}`} onClick={() => setRoleFilter("staff")}>Staff <span className="a-filter-count">{stats.staff}</span></button>
          <button className={`a-filter-tab ${roleFilter === "buyer" ? "active" : ""}`} onClick={() => setRoleFilter("buyer")}>Buyers <span className="a-filter-count">{stats.buyer}</span></button>
          <div className="a-filter-spacer" />
          <div className="a-search-wrap">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input className="a-search-input" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="a-table-card">
          <div className="a-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th className="hide-sm">Status</th>
                  <th className="hide-sm">Joined</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5}><div className="a-table-empty">Loading users…</div></td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5}><div className="a-table-empty"><strong>No users found</strong>Try a different search or filter.</div></td></tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.uuid === user?.uuid
                    const name = [u.first_name, u.last_name].filter(Boolean).join(" ")
                    const joined = u.created_at
                      ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"
                    return (
                      <tr key={u.uuid}>
                        <td>
                          <div className="a-user-name">{name || "—"}</div>
                          <div className="a-user-email">{u.email_id}</div>
                        </td>
                        <td>
                          <select
                            className="a-role-select"
                            value={u.role}
                            disabled={isSelf}
                            title={isSelf ? "Cannot change your own role" : undefined}
                            onChange={(e) => changeRole(u.uuid, e.target.value)}
                          >
                            <option value="buyer">Buyer</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="hide-sm">
                          <span className={u.is_active ? "a-pill-active" : "a-pill-inactive"}>
                            {u.is_active ? "● Active" : "● Inactive"}
                          </span>
                        </td>
                        <td className="hide-sm a-date-cell">{joined}</td>
                        <td style={{ textAlign: "right" }}>
                          {isSelf ? (
                            <span style={{ color: "var(--a-muted)", fontSize: 12 }}>You</span>
                          ) : (
                            <button
                              className={`a-btn a-btn-sm ${u.is_active ? "a-btn-danger" : ""}`}
                              onClick={() => toggleStatus(u.uuid, !u.is_active)}
                            >
                              {u.is_active ? "Deactivate" : "Activate"}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create staff modal */}
      <div className={`a-overlay ${createOpen ? "active" : ""}`} onClick={() => setCreateOpen(false)}>
        <div className="a-modal" onClick={(e) => e.stopPropagation()}>
          <div className="a-modal-title">Create Staff Account</div>
          <form onSubmit={handleCreateSubmit}>
            <div className="a-modal-grid2">
              <div className="a-field">
                <label>First name *</label>
                <input required value={staffForm.first_name} onChange={(e) => setStaffForm((f) => ({ ...f, first_name: e.target.value }))} placeholder="Jane" />
              </div>
              <div className="a-field">
                <label>Last name</label>
                <input value={staffForm.last_name} onChange={(e) => setStaffForm((f) => ({ ...f, last_name: e.target.value }))} placeholder="Doe" />
              </div>
            </div>
            <div className="a-field">
              <label>Email address *</label>
              <input type="email" required value={staffForm.email_id} onChange={(e) => setStaffForm((f) => ({ ...f, email_id: e.target.value }))} placeholder="staff@lootlooto.com" />
            </div>
            <div className="a-field">
              <label>Phone number *</label>
              <input type="number" required value={staffForm.phone_number} onChange={(e) => setStaffForm((f) => ({ ...f, phone_number: e.target.value }))} placeholder="9876543210" />
            </div>
            <div className="a-field">
              <label>Role</label>
              <select value={staffForm.role} onChange={(e) => setStaffForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="a-field">
              <label>Password *</label>
              <input type="password" required value={staffForm.password} onChange={(e) => setStaffForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" />
            </div>
            <div className="a-modal-footer">
              <button type="button" className="a-btn" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button type="submit" className="a-btn a-btn-primary" disabled={creating}>{creating ? "Creating…" : "Create account"}</button>
            </div>
          </form>
        </div>
      </div>

      {/* Toasts */}
      <div id="a-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`a-toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  )
}