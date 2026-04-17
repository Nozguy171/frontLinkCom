"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Loader2,
  MessageCircle,
  Pencil,
  Search,
  Shield,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"
const CHAT_API_URL = `${API_URL}/chat`

type AdminUser = {
  id: string
  name: string
  email: string
  role: string
  company?: string | null
  phone?: string | null
  avatar_url?: string | null
  created_at?: string | null
  updated_at?: string | null
  last_login?: string | null
  conversation_id?: string | null
  messages_count?: number
  unread_from_user_count?: number
  last_message_at?: string | null
  last_message_preview?: string | null
  can_open_chat?: boolean
}

type ConfirmDialogState = {
  title: string
  description: string
  confirmText: string
  tone?: "danger" | "primary"
  onConfirm: () => void
}

function getToken() {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("linkcom_token") || ""
}

async function apiJson(path: string, options: RequestInit = {}) {
  const token = getToken()

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Ocurrió un error.")
  }
  return data
}

async function chatJson(path: string, options: RequestInit = {}) {
  const token = getToken()

  const response = await fetch(`${CHAT_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Ocurrió un error.")
  }
  return data
}

function formatDate(value?: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText = "Cancelar",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmText: string
  cancelText?: string
  tone?: "danger" | "primary"
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  const confirmButtonClass =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-[#0E5A6B] hover:bg-[#0B4855] text-white"

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[28px] border border-[#E5E7EB] bg-white shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E5E7EB] bg-[#FCFAF4]">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <h4 className="text-lg font-semibold text-[#1F2937]">{title}</h4>
                <p className="text-sm text-[#6B7280] mt-1">{description}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] font-medium hover:bg-[#F3E7C9]/30 transition-colors disabled:opacity-70"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 ${confirmButtonClass}`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersContent({
  onOpenConversation,
}: {
  onOpenConversation: (conversationId: string) => void
}) {
  const [items, setItems] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openingChatId, setOpeningChatId] = useState("")
  const [deletingUserId, setDeletingUserId] = useState("")
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [editingUserId, setEditingUserId] = useState("")
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    role: "user",
    password: "",
  })

  async function loadUsers() {
    try {
      setLoading(true)
      setError("")
      const data = await apiJson("/admin/users")
      setItems(data.items || [])
    } catch (err: any) {
      setError(err.message || "No se pudieron cargar los usuarios.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items

    return items.filter((item) => {
      return (
        (item.name || "").toLowerCase().includes(q) ||
        (item.email || "").toLowerCase().includes(q) ||
        (item.company || "").toLowerCase().includes(q) ||
        (item.phone || "").toLowerCase().includes(q)
      )
    })
  }, [items, search])


  function isProtectedAdmin(user: AdminUser) {
    return user.role === "admin"
  }

  function openEditor(user: AdminUser) {
    setEditingUserId(user.id)
    setForm({
      name: user.name || "",
      email: user.email || "",
      company: user.company || "",
      phone: user.phone || "",
      role: user.role === "admin" ? "admin" : user.role || "user",
      password: "",
    })
    setError("")
  }

  function closeEditor() {
    setEditingUserId("")
    setForm({
      name: "",
      email: "",
      company: "",
      phone: "",
      role: "user",
      password: "",
    })
  }

  async function handleSaveUser() {
    if (!editingUserId) return

    if (!form.name.trim()) {
      setError("El nombre es obligatorio.")
      return
    }

    if (!form.email.trim()) {
      setError("El correo es obligatorio.")
      return
    }

    try {
      setSaving(true)
      setError("")

      const res = await apiJson(`/admin/users/${editingUserId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          phone: form.phone.trim(),
          role: editingUser?.role === "admin" ? "admin" : form.role,
          password: form.password.trim(),
        }),
      })

      const updated = res.user as AdminUser
      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      closeEditor()
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar el usuario.")
    } finally {
      setSaving(false)
    }
  }

  async function executeDeleteUser(userId: string) {
    try {
      setDeletingUserId(userId)
      setError("")
      await apiJson(`/admin/users/${userId}`, {
        method: "DELETE",
      })
      setItems((prev) => prev.filter((item) => item.id !== userId))
    } catch (err: any) {
      setError(err.message || "No se pudo eliminar el usuario.")
    } finally {
      setDeletingUserId("")
    }
  }

  function handleDeleteUser(user: AdminUser) {
    setConfirmDialog({
      title: "Eliminar usuario",
      description: `Vas a eliminar a "${user.name || user.email}". Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
      tone: "danger",
      onConfirm: () => {
        setConfirmDialog(null)
        void executeDeleteUser(user.id)
      },
    })
  }

  async function handleOpenChat(user: AdminUser) {
    try {
      setOpeningChatId(user.id)
      setError("")

      if (user.conversation_id) {
        onOpenConversation(user.conversation_id)
        return
      }

      const res = await chatJson("/conversations", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
        }),
      })

      const conversationId = res?.conversation?.id
      if (!conversationId) {
        throw new Error("No se pudo abrir la conversación.")
      }

      await loadUsers()
      onOpenConversation(conversationId)
    } catch (err: any) {
      setError(err.message || "No se pudo abrir el chat.")
    } finally {
      setOpeningChatId("")
    }
  }

  const editingUser = items.find((item) => item.id === editingUserId) || null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all"
          />
        </div>
      </div>

      {error && !editingUser ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-[#FCFAF4] border-b border-[#E5E7EB]">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Usuario
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Rol
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Empresa / Teléfono
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Chat
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Último acceso
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-[#6B7280]">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cargando usuarios...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-[#6B7280]">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="border-b border-[#E5E7EB] last:border-b-0">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#F3E7C9]/50 flex items-center justify-center text-[#0E5A6B] shrink-0">
                          <UserIcon className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-[#1F2937] truncate">{user.name || "Sin nombre"}</div>
                          <div className="text-sm text-[#6B7280] truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-[#0E5A6B]/10 text-[#0E5A6B]"
                            : "bg-[#F3E7C9]/60 text-[#8A5B14]"
                        }`}
                      >
                        {user.role === "admin" ? <Shield className="w-3.5 h-3.5" /> : null}
                        {user.role === "admin" ? "Admin" : "Usuario"}
                      </span>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-[#1F2937]">{user.company || "—"}</div>
                      <div className="text-sm text-[#6B7280] mt-1">{user.phone || "—"}</div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      {user.can_open_chat ? (
                        <div className="space-y-1">
                          <div className="text-sm text-[#1F2937]">
                            {user.conversation_id ? `${user.messages_count || 0} mensajes` : "Sin conversación"}
                          </div>
                          <div className="text-xs text-[#6B7280]">
                            {user.unread_from_user_count ? `${user.unread_from_user_count} sin leer` : "Todo leído"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-[#6B7280]">No aplica</span>
                      )}
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-[#1F2937]">{formatDate(user.last_login)}</div>
                      <div className="text-xs text-[#6B7280] mt-1">
                        Creado: {formatDate(user.created_at)}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center justify-end gap-2">
                        {user.can_open_chat ? (
                          <button
                            type="button"
                            onClick={() => void handleOpenChat(user)}
                            disabled={openingChatId === user.id}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E5E7EB] text-[#1F2937] hover:bg-[#F3E7C9]/30 transition-colors disabled:opacity-70"
                          >
                            {openingChatId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MessageCircle className="w-4 h-4" />
                            )}
                            Ver chat
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => openEditor(user)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E5E7EB] text-[#1F2937] hover:bg-[#F3E7C9]/30 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          Editar
                        </button>

                        {isProtectedAdmin(user) ? (
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#0E5A6B]/20 bg-[#0E5A6B]/5 text-[#0E5A6B] text-sm font-medium">
                            <Shield className="w-4 h-4" />
                            Admin protegido
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={deletingUserId === user.id}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-70"
                          >
                            {deletingUserId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser ? (
        <div className="fixed inset-0 z-[85]">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={closeEditor} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-[28px] border border-[#E5E7EB] bg-white shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E7EB] bg-[#FCFAF4] flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#1F2937]">Editar usuario</h3>
                  <p className="text-sm text-[#6B7280] mt-1">{editingUser.email}</p>
                </div>

                <button
                  type="button"
                  onClick={closeEditor}
                  className="w-10 h-10 rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F3E7C9]/30 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre *"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                  />

                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Correo *"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                  />

                  <input
                    value={form.company}
                    onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                    placeholder="Empresa"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                  />

                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Teléfono"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                  />

                  <div className="space-y-2">
                    <select
                      value={editingUser?.role === "admin" ? "admin" : form.role}
                      onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                      disabled={editingUser?.role === "admin"}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {editingUser?.role === "admin" ? (
                        <option value="admin">Admin</option>
                      ) : (
                        <>
                          <option value="user">Usuario</option>
                          <option value="admin">Admin</option>
                        </>
                      )}
                    </select>

                    {editingUser?.role === "admin" ? (
                      <p className="text-xs text-[#6B7280]">El rol de un administrador está bloqueado desde esta vista.</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <input
                      value={form.password}
                      onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Nueva contraseña (opcional)"
                      type="password"
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                    />

                    {editingUser?.role === "admin" ? (
                      <p className="text-xs text-[#6B7280]">Sí puedes cambiar la contraseña del admin desde aquí si tu endpoint backend ya soporta ese campo.</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 border-t border-[#E5E7EB] flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] font-medium hover:bg-[#F3E7C9]/30 transition-colors disabled:opacity-70"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => void handleSaveUser()}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0E5A6B] text-white font-medium hover:bg-[#0B4855] transition-colors disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title || ""}
        description={confirmDialog?.description || ""}
        confirmText={confirmDialog?.confirmText || "Continuar"}
        tone={confirmDialog?.tone || "danger"}
        loading={Boolean(deletingUserId)}
        onCancel={() => setConfirmDialog(null)}
        onConfirm={() => confirmDialog?.onConfirm()}
      />
    </div>
  )
}