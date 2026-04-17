
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Tag,
  Video,
  FileText,
  MessageCircle,
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  Star,
  Upload,
  Loader2,
  Check,
  Sparkles,
  AlertTriangle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context"
import VideosWorkshopsContent from "./videos-workshops-content"
import AdminUsersContent from "./admin-users-content"
import AdminChatContent from "./admin-chat-content"
import AdminSpecialRequestsContent from "./admin-special-requests-content"

type AdminSection =
  | "dashboard"
  | "suppliers"
  | "categories"
  | "videos"
  | "submissions"
  | "users"
  | "chat"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"

type DashboardStats = {
  users: number
  suppliers: number
  categories: number
  products: number
  videos: number
  submissions_pending: number
  submissions_total: number
  promotions: number
}

type AdminCategory = {
  id: string
  name: string
  slug: string
  icon?: string | null
  description?: string | null
  is_active: boolean
}

type AdminSupplier = {
  id: string
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  banner_url?: string | null
  location?: string | null
  coverage: string
  address?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  is_featured: boolean
  is_active: boolean
  categories: AdminCategory[]
  products_count: number
}

type AdminProduct = {
  id: string
  supplier_id: string
  category_id: string
  category_name?: string | null
  name: string
  description?: string | null
  image_url?: string | null
  price?: number | null
  sku?: string | null
  is_active: boolean
}

type AdminSupplierDetail = AdminSupplier & {
  products: AdminProduct[]
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

async function apiForm(path: string, formData: FormData, method: "POST" | "PATCH" = "POST") {
  const token = getToken()

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Ocurrió un error.")
  }
  return data
}

function slugifyClient(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function mediaUrl(value?: string | null) {
  if (!value) return ""
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  return `${API_URL.replace(/\/api$/, "")}${value}`
}

function coverageLabel(value?: string) {
  if (value === "international") return "Internacional"
  if (value === "regional") return "Regional"
  return "Nacional"
}

function normalizeText(value?: string | null) {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function isWithoutCategoryCategory(category?: Pick<AdminCategory, "name" | "slug"> | null) {
  if (!category) return false

  const name = normalizeText(category.name)
  const slug = normalizeText(category.slug)

  return name === "sin categoria" || slug === "sin-categoria"
}
function sanitizePriceInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "")
  const parts = cleaned.split(".")

  const integerPart = parts[0] || ""
  const decimalPart = parts[1] ? parts[1].replace(/\./g, "").slice(0, 1) : ""

  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart
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
    <div className="fixed inset-0 z-[80]">
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

function PlaceholderSection({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: React.ElementType
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
      <div className="w-16 h-16 bg-[#F3E7C9]/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-[#0E5A6B]" />
      </div>
      <h3 className="text-xl font-semibold text-[#1F2937] mb-2">{title}</h3>
      <p className="text-[#6B7280] max-w-md mx-auto">{description}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const { setRole } = useApp()
const [chatJump, setChatJump] = useState<{ conversationId: string; token: number } | null>(null)
  const handleLogout = () => {
    localStorage.removeItem("linkcom_token")
    localStorage.removeItem("linkcom_user")
    setRole(null)
    router.push("/")
  }

const navItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "suppliers", label: "Proveedores", icon: Users },
  { id: "categories", label: "Categorías", icon: Tag },
  { id: "videos", label: "Videos y talleres", icon: Video },
  { id: "submissions", label: "Solicitudes", icon: FileText },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "chat", label: "Chat", icon: MessageCircle },
]

  return (
    <div className="min-h-screen bg-[#FCFAF4] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0E5A6B] transform transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:translate-x-0 lg:overflow-hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="p-6 flex items-center justify-between">
            <Link href="/admin" className="text-xl font-bold text-white">
              LinkCom.mx
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 pb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-white/90 text-sm">
              <Star className="w-3 h-3" /> Administrador
            </span>
          </div>

          <nav className="flex-1 min-h-0 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                  activeSection === item.id
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">Admin</p>
                <p className="text-white/60 text-sm truncate">admin@linkcom.mx</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-[#F3E7C9]/50 transition-colors"
              >
                <Menu className="w-5 h-5 text-[#1F2937]" />
              </button>
              <h1 className="text-xl font-semibold text-[#1F2937]">
                {navItems.find((n) => n.id === activeSection)?.label}
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {activeSection === "dashboard" && <DashboardContent />}
          {activeSection === "suppliers" && <SuppliersContent />}
          {activeSection === "categories" && <CategoriesContent />}
{activeSection === "videos" && <VideosWorkshopsContent />}
{activeSection === "submissions" && <AdminSpecialRequestsContent />}
{activeSection === "users" && (
  <AdminUsersContent
    onOpenConversation={(conversationId) => {
      setChatJump({
        conversationId,
        token: Date.now(),
      })
      setActiveSection("chat")
    }}
  />
)}

{activeSection === "chat" && <AdminChatContent chatJump={chatJump} />}
        </main>
      </div>
    </div>
  )
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        const data = await apiJson("/admin/dashboard")
        setStats(data)
      } catch (err: any) {
        setError(err.message || "No se pudo cargar el dashboard.")
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const items = [
    { label: "Proveedores", value: stats?.suppliers ?? 0, change: "Registrados" },
    { label: "Categorías", value: stats?.categories ?? 0, change: "Disponibles" },
    { label: "Productos", value: stats?.products ?? 0, change: "Activos" },
    { label: "Solicitudes", value: stats?.submissions_pending ?? 0, change: "Totales" },
  ]

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {items.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <p className="text-[#6B7280] text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-[#1F2937]">{loading ? "..." : stat.value}</p>
            <p className="text-xs text-[#0E5A6B] mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Estado general</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-2xl bg-[#FCFAF4] border border-[#E5E7EB] p-4">
            <p className="text-[#6B7280]">Usuarios</p>
            <p className="text-2xl font-semibold text-[#1F2937] mt-2">{loading ? "..." : stats?.users ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-[#FCFAF4] border border-[#E5E7EB] p-4">
            <p className="text-[#6B7280]">Videos</p>
            <p className="text-2xl font-semibold text-[#1F2937] mt-2">{loading ? "..." : stats?.videos ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function UploadField({
  label,
  file,
  onChange,
}: {
  label: string
  file: File | null
  onChange: (file: File | null) => void
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#FCFAF4] p-4">
      <p className="text-sm font-medium text-[#1F2937] mb-3">{label}</p>
      <label className="flex items-center justify-center gap-3 rounded-xl bg-white border border-[#E5E7EB] px-4 py-4 cursor-pointer hover:bg-[#F3E7C9]/30 transition-colors">
        <Upload className="w-5 h-5 text-[#0E5A6B]" />
        <span className="text-sm text-[#1F2937] font-medium">
          {file ? file.name : "Seleccionar imagen"}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  )
}

function CategoriesPicker({
  items,
  selectedIds,
  onToggle,
  search,
  setSearch,
}: {
  items: AdminCategory[]
  selectedIds: string[]
  onToggle: (id: string) => void
  search: string
  setSearch: (value: string) => void
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items

    return items.filter((item) => item.name.toLowerCase().includes(q))
  }, [items, search])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoría..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
        />
      </div>

      <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-[#6B7280] sm:col-span-2 lg:col-span-3">
            No se encontraron categorías.
          </p>
        ) : (
          filtered.map((category) => {
            const active = selectedIds.includes(category.id)
            const isWithoutCategory = isWithoutCategoryCategory(category)

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onToggle(category.id)}
                className={`px-4 py-3 rounded-xl border text-left transition-all ${
                  active
                    ? "border-[#0E5A6B] bg-[#0E5A6B]/10 text-[#0E5A6B]"
                    : "border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F3E7C9]/30"
                }`}
              >
                <div className="font-medium text-sm flex items-center justify-between gap-2">
                  <span>{category.name}</span>
                  {active ? <Check className="w-4 h-4" /> : null}
                </div>

                {isWithoutCategory ? (
                  <div className="text-xs opacity-70 mt-1">
                    Si eliges esta, no puedes seleccionar otra.
                  </div>
                ) : null}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

function SuppliersContent() {
  type SupplierFormState = {
    name: string
    description: string
    location: string
    coverage: string
    address: string
    email: string
    phone: string
    website: string
    is_featured: boolean
    category_ids: string[]
    logo: File | null
  }

type ProductDraft = {
  key: string
  name: string
  description: string
  price: string
  category_id: string
  image: File | null
}

type ProductEditorState = {
  id: string
  name: string
  description: string
  price: string
  category_id: string
  image: File | null
}
type ConfirmDialogState = {
  title: string
  description: string
  confirmText: string
  tone?: "danger" | "primary"
  onConfirm: () => void
}
  const emptySupplierForm: SupplierFormState = {
    name: "",
    description: "",
    location: "",
    coverage: "national",
    address: "",
    email: "",
    phone: "",
    website: "",
    is_featured: false,
    category_ids: [],
    logo: null,
  }

  const emptyCategoryForm = {
    name: "",
  }

function buildEmptyProductDraft(defaultCategoryId = ""): ProductDraft {
  return {
    key: `${Date.now()}-${Math.random()}`,
    name: "",
    description: "",
    price: "",
    category_id: defaultCategoryId,
    image: null,
  }
}

const emptyProductEditor: ProductEditorState = {
  id: "",
  name: "",
  description: "",
  price: "",
  category_id: "",
  image: null,
}

  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState<AdminSupplier[]>([])
  const [categoriesData, setCategoriesData] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [savingSupplier, setSavingSupplier] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)
  const [savingNewProducts, setSavingNewProducts] = useState(false)
  const [savingEditedProduct, setSavingEditedProduct] = useState(false)
  const [deletingSupplier, setDeletingSupplier] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState("")

  const [error, setError] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")

  const [supplierDetail, setSupplierDetail] = useState<AdminSupplierDetail | null>(null)
  const [supplierForm, setSupplierForm] = useState<SupplierFormState>(emptySupplierForm)
const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
const [categorySearch, setCategorySearch] = useState("")
const [showCreateCategory, setShowCreateCategory] = useState(false)

const [newProducts, setNewProducts] = useState<ProductDraft[]>([buildEmptyProductDraft()])
const [editingProductId, setEditingProductId] = useState("")
const [productEditor, setProductEditor] = useState<ProductEditorState>(emptyProductEditor)

const [productCategoryForm, setProductCategoryForm] = useState(emptyCategoryForm)
const [showCreateProductCategory, setShowCreateProductCategory] = useState(false)
const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)
  function productPriceLabel(value?: number | null) {
    if (value === null || value === undefined) return "Sin precio"

    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 2,
    }).format(value)
  }

  function hydrateSupplierForm(supplier: AdminSupplierDetail): SupplierFormState {
    return {
      name: supplier.name || "",
      description: supplier.description || "",
      location: supplier.location || "",
      coverage: supplier.coverage || "national",
      address: supplier.address || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      website: supplier.website || "",
      is_featured: Boolean(supplier.is_featured),
      category_ids: supplier.categories.map((category) => category.id),
      logo: null,
    }
  }

  async function loadAll() {
    try {
      setLoading(true)
      const [suppliersRes, categoriesRes] = await Promise.all([
        apiJson("/admin/suppliers"),
        apiJson("/admin/categories"),
      ])
      setItems(suppliersRes.items || [])
      setCategoriesData(categoriesRes.items || [])
    } catch (err: any) {
      setError(err.message || "No se pudo cargar la información.")
    } finally {
      setLoading(false)
    }
  }

  async function loadSupplierDetail(supplierId: string) {
    const data = await apiJson(`/admin/suppliers/${supplierId}`)
    const supplier = data.supplier as AdminSupplierDetail
    setSupplierDetail(supplier)
    setSupplierForm(hydrateSupplierForm(supplier))
    return supplier
  }

  useEffect(() => {
    loadAll()
  }, [])
function closeConfirmDialog() {
  setConfirmDialog(null)
}

function requestCloseModal() {
  setConfirmDialog({
    title: "Cerrar editor",
    description: "Si cierras este modal se perderán los cambios no guardados.",
    confirmText: "Cerrar sin guardar",
    tone: "danger",
    onConfirm: () => {
      closeConfirmDialog()
      closeModal()
    },
  })
}

useEffect(() => {
  if (!modalOpen && !confirmDialog) return

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Escape") return

    event.preventDefault()
    event.stopPropagation()

    if (confirmDialog) {
      closeConfirmDialog()
      return
    }

    if (modalOpen) {
      requestCloseModal()
    }
  }

  window.addEventListener("keydown", handleKeyDown)
  return () => window.removeEventListener("keydown", handleKeyDown)
}, [modalOpen, confirmDialog])
function closeModal() {
  setModalOpen(false)
  setModalMode("create")
  setSupplierDetail(null)
  setSupplierForm(emptySupplierForm)
  setCategoryForm(emptyCategoryForm)
  setCategorySearch("")
  setShowCreateCategory(false)
  setNewProducts([buildEmptyProductDraft()])
  setEditingProductId("")
  setProductEditor(emptyProductEditor)
  setProductCategoryForm(emptyCategoryForm)
  setShowCreateProductCategory(false)
  setError("")
}

function openCreateModal() {
  setModalMode("create")
  setModalOpen(true)
  setSupplierDetail(null)
  setSupplierForm(emptySupplierForm)
  setCategoryForm(emptyCategoryForm)
  setCategorySearch("")
  setShowCreateCategory(false)
  setNewProducts([buildEmptyProductDraft()])
  setEditingProductId("")
  setProductEditor(emptyProductEditor)
  setProductCategoryForm(emptyCategoryForm)
  setShowCreateProductCategory(false)
  setError("")
}

async function openEditModal(supplierId: string) {
  try {
    setModalMode("edit")
    setModalOpen(true)
    setSupplierDetail(null)
    setLoadingDetail(true)
    setError("")
    setCategorySearch("")
    setShowCreateCategory(false)
    setNewProducts([buildEmptyProductDraft()])
    setEditingProductId("")
    setProductEditor(emptyProductEditor)
    setProductCategoryForm(emptyCategoryForm)
    setShowCreateProductCategory(false)
    await loadSupplierDetail(supplierId)
  } catch (err: any) {
    setError(err.message || "No se pudo cargar el proveedor.")
  } finally {
    setLoadingDetail(false)
  }
}

  function toggleCategory(categoryId: string) {
    const clickedCategory = categoriesData.find((item) => item.id === categoryId)
    if (!clickedCategory) return

    const clickedIsWithoutCategory = isWithoutCategoryCategory(clickedCategory)

    setSupplierForm((prev) => {
      const exists = prev.category_ids.includes(categoryId)

      if (exists) {
        return {
          ...prev,
          category_ids: prev.category_ids.filter((id) => id !== categoryId),
        }
      }

      const selectedCategories = categoriesData.filter((item) => prev.category_ids.includes(item.id))
      const selectedWithoutCategory = selectedCategories.find((item) => isWithoutCategoryCategory(item))

      if (clickedIsWithoutCategory) {
        return {
          ...prev,
          category_ids: [categoryId],
        }
      }

      if (selectedWithoutCategory) {
        return {
          ...prev,
          category_ids: prev.category_ids
            .filter((id) => id !== selectedWithoutCategory.id)
            .concat(categoryId),
        }
      }

      return {
        ...prev,
        category_ids: [...prev.category_ids, categoryId],
      }
    })
  }

  async function handleCreateCategoryInline() {
    setError("")

    const categoryName = categoryForm.name.trim()

    if (!categoryName) {
      setError("El nombre de la categoría es obligatorio.")
      return
    }

    try {
      setSavingCategory(true)

      const data = await apiJson("/admin/categories", {
        method: "POST",
        body: JSON.stringify({
          name: categoryName,
          is_active: true,
        }),
      })

      const created = data.category as AdminCategory

      setCategoriesData((prev) => [created, ...prev.filter((item) => item.id !== created.id)])

      setSupplierForm((prev) => ({
        ...prev,
        category_ids: isWithoutCategoryCategory(created)
          ? [created.id]
          : prev.category_ids.includes(created.id)
            ? prev.category_ids
            : [...prev.category_ids, created.id],
      }))

      setCategoryForm(emptyCategoryForm)
      setCategorySearch("")
      setShowCreateCategory(false)
    } catch (err: any) {
      setError(err.message || "No se pudo crear la categoría.")
    } finally {
      setSavingCategory(false)
    }
  }

async function handleCreateProductCategoryInline(
  target?: { type: "draft"; key: string } | { type: "editor" }
) {
  setError("")

  const categoryName = productCategoryForm.name.trim()

  if (!categoryName) {
    setError("El nombre de la categoría del producto es obligatorio.")
    return
  }

  try {
    setSavingCategory(true)

    const data = await apiJson("/admin/categories", {
      method: "POST",
      body: JSON.stringify({
        name: categoryName,
        is_active: true,
      }),
    })

    const created = data.category as AdminCategory

    setCategoriesData((prev) => [created, ...prev.filter((item) => item.id !== created.id)])

    if (target?.type === "draft") {
      updateNewProduct(target.key, { category_id: created.id })
    }

    if (target?.type === "editor") {
      setProductEditor((prev) => ({ ...prev, category_id: created.id }))
    }

    setProductCategoryForm(emptyCategoryForm)
    setShowCreateProductCategory(false)
  } catch (err: any) {
    setError(err.message || "No se pudo crear la categoría del producto.")
  } finally {
    setSavingCategory(false)
  }
}

  async function handleSaveSupplier(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!supplierForm.name.trim()) {
      setError("El nombre del proveedor es obligatorio.")
      return
    }

    if (supplierForm.category_ids.length === 0) {
      setError("Selecciona al menos una categoría.")
      return
    }

    try {
      setSavingSupplier(true)

      const formData = new FormData()
      formData.append("name", supplierForm.name.trim())
      formData.append("description", supplierForm.description.trim())
      formData.append("location", supplierForm.location.trim())
      formData.append("coverage", supplierForm.coverage)
      formData.append("address", supplierForm.address.trim())
      formData.append("email", supplierForm.email.trim())
      formData.append("phone", supplierForm.phone.trim())
      formData.append("website", supplierForm.website.trim())
      formData.append("is_featured", String(supplierForm.is_featured))
      formData.append("category_ids", JSON.stringify(supplierForm.category_ids))

      if (supplierForm.logo) {
        formData.append("logo", supplierForm.logo)
      }

      if (modalMode === "create") {
        const data = await apiForm("/admin/suppliers", formData, "POST")
        const created = data.supplier as AdminSupplierDetail
        setModalMode("edit")
        setSupplierDetail(created)
        setSupplierForm(hydrateSupplierForm(created))
        setNewProducts([buildEmptyProductDraft()])
      } else if (supplierDetail) {
        const data = await apiForm(`/admin/suppliers/${supplierDetail.id}`, formData, "PATCH")
        const updated = data.supplier as AdminSupplierDetail
        setSupplierDetail(updated)
        setSupplierForm(hydrateSupplierForm(updated))
      }

      await loadAll()
    } catch (err: any) {
      setError(err.message || "No se pudo guardar el proveedor.")
    } finally {
      setSavingSupplier(false)
    }
  }

async function executeDeleteSupplier() {
  if (!supplierDetail) return

  try {
    setDeletingSupplier(true)
    setError("")
    await apiJson(`/admin/suppliers/${supplierDetail.id}`, {
      method: "DELETE",
    })
    closeModal()
    await loadAll()
  } catch (err: any) {
    setError(err.message || "No se pudo eliminar el proveedor.")
  } finally {
    setDeletingSupplier(false)
  }
}

function handleDeleteSupplier() {
  if (!supplierDetail) return

  setConfirmDialog({
    title: "Eliminar proveedor",
    description: `Esta acción eliminará a "${supplierDetail.name}" y sus productos asociados.`,
    confirmText: "Sí, eliminar",
    tone: "danger",
    onConfirm: () => {
      closeConfirmDialog()
      void executeDeleteSupplier()
    },
  })
}
function updateNewProduct(key: string, patch: Partial<ProductDraft>) {
  setNewProducts((prev) =>
    prev.map((item) =>
      item.key === key
        ? {
            ...item,
            ...patch,
            price: patch.price !== undefined ? sanitizePriceInput(patch.price) : item.price,
          }
        : item
    )
  )
}
  function addNewProductDraft() {
    setNewProducts((prev) => [...prev, buildEmptyProductDraft()])
  }

  function removeNewProductDraft(key: string) {
    setNewProducts((prev) => {
      const next = prev.filter((item) => item.key !== key)
      return next.length > 0 ? next : [buildEmptyProductDraft()]
    })
  }

async function handleSaveNewProducts() {
  if (!supplierDetail) return

  setError("")

  const rowsToSave = newProducts.filter(
    (item) =>
      item.name.trim() ||
      item.description.trim() ||
      item.price.trim() ||
      item.category_id ||
      item.image
  )

  if (rowsToSave.length === 0) {
    setError("Agrega al menos un producto para guardar.")
    return
  }

  for (const row of rowsToSave) {
    if (!row.name.trim()) {
      setError("Todos los productos nuevos deben tener nombre.")
      return
    }

    if (!row.category_id) {
      setError("Todos los productos nuevos deben tener categoría.")
      return
    }

    if (!row.price.trim()) {
      setError("Todos los productos nuevos deben tener precio.")
      return
    }
  }

  try {
    setSavingNewProducts(true)

    for (const row of rowsToSave) {
      const formData = new FormData()
      formData.append("name", row.name.trim())
      formData.append("description", row.description.trim())
      formData.append("price", row.price.trim())
      formData.append("category_id", row.category_id)

      if (row.image) {
        formData.append("image", row.image)
      }

      await apiForm(`/admin/suppliers/${supplierDetail.id}/products`, formData, "POST")
    }

    await loadSupplierDetail(supplierDetail.id)
    await loadAll()
    setNewProducts([buildEmptyProductDraft()])
  } catch (err: any) {
    setError(err.message || "No se pudieron guardar los productos.")
  } finally {
    setSavingNewProducts(false)
  }
}

function startEditProduct(product: AdminProduct) {
  setEditingProductId(product.id)
  setProductEditor({
    id: product.id,
    name: product.name || "",
    description: product.description || "",
    price: product.price !== null && product.price !== undefined ? String(product.price) : "",
    category_id: product.category_id || "",
    image: null,
  })
}

  function cancelEditProduct() {
    setEditingProductId("")
    setProductEditor(emptyProductEditor)
  }

async function handleSaveEditedProduct() {
  if (!productEditor.id) return

  setError("")

  if (!productEditor.name.trim()) {
    setError("El nombre del producto es obligatorio.")
    return
  }

  if (!productEditor.category_id) {
    setError("La categoría del producto es obligatoria.")
    return
  }

  if (!productEditor.price.trim()) {
    setError("El precio del producto es obligatorio.")
    return
  }

  try {
    setSavingEditedProduct(true)

    const formData = new FormData()
    formData.append("name", productEditor.name.trim())
    formData.append("description", productEditor.description.trim())
    formData.append("price", productEditor.price.trim())
    formData.append("category_id", productEditor.category_id)

    if (productEditor.image) {
      formData.append("image", productEditor.image)
    }

    await apiForm(`/admin/products/${productEditor.id}`, formData, "PATCH")

    if (supplierDetail) {
      await loadSupplierDetail(supplierDetail.id)
    }

    await loadAll()
    cancelEditProduct()
  } catch (err: any) {
    setError(err.message || "No se pudo actualizar el producto.")
  } finally {
    setSavingEditedProduct(false)
  }
}

async function executeDeleteProduct(productId: string) {
  try {
    setDeletingProductId(productId)
    setError("")
    await apiJson(`/admin/products/${productId}`, {
      method: "DELETE",
    })

    if (supplierDetail) {
      await loadSupplierDetail(supplierDetail.id)
    }

    await loadAll()
    if (editingProductId === productId) {
      cancelEditProduct()
    }
  } catch (err: any) {
    setError(err.message || "No se pudo eliminar el producto.")
  } finally {
    setDeletingProductId("")
  }
}

function handleDeleteProduct(productId: string, productName?: string) {
  setConfirmDialog({
    title: "Eliminar producto",
    description: `Vas a eliminar ${productName ? `"${productName}"` : "este producto"}. Esta acción no se puede deshacer.`,
    confirmText: "Sí, eliminar",
    tone: "danger",
    onConfirm: () => {
      closeConfirmDialog()
      void executeDeleteProduct(productId)
    },
  })
}
  const filteredItems = items.filter((supplier) => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true

    const categoriesText = supplier.categories.map((c) => c.name).join(" ").toLowerCase()
    return (
      supplier.name.toLowerCase().includes(q) ||
      (supplier.location || "").toLowerCase().includes(q) ||
      (supplier.email || "").toLowerCase().includes(q) ||
      categoriesText.includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0E5A6B] text-white rounded-xl font-medium hover:bg-[#0E5A6B]/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo proveedor
        </button>
      </div>

      {error && !modalOpen ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-[#FCFAF4] border-b border-[#E5E7EB]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1F2937]">Proveedor</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1F2937]">Categorías</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1F2937]">Cobertura</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1F2937]">Contacto</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1F2937]">Productos</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1F2937]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#6B7280]">
                    Cargando proveedores...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#6B7280]">
                    No hay proveedores todavía.
                  </td>
                </tr>
              ) : (
                filteredItems.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-[#F3E7C9]/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {supplier.logo_url ? (
                          <img
                            src={mediaUrl(supplier.logo_url)}
                            alt={supplier.name}
                            className="w-11 h-11 rounded-xl object-cover border border-[#E5E7EB]"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-[#F3E7C9] flex items-center justify-center font-semibold text-[#0E5A6B]">
                            {supplier.name.slice(0, 1)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#1F2937]">{supplier.name}</p>
                          <p className="text-sm text-[#6B7280]">{supplier.location || "Sin ubicación"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {supplier.categories.map((category) => (
                          <span
                            key={category.id}
                            className="px-2 py-1 bg-[#F3E7C9]/50 text-[#1F2937] text-sm rounded-lg"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-[#1F2937]">{coverageLabel(supplier.coverage)}</td>

                    <td className="px-6 py-4 text-sm text-[#1F2937]">
                      <div>{supplier.email || "Sin correo"}</div>
                      <div className="text-[#6B7280]">{supplier.phone || "Sin teléfono"}</div>
                    </td>

                    <td className="px-6 py-4 text-[#1F2937]">{supplier.products_count}</td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => void openEditModal(supplier.id)}
                        className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F3E7C9]/30 text-sm font-medium text-[#1F2937]"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50">
<div className="absolute inset-0 bg-black/40" onClick={requestCloseModal} />
          <div className="absolute inset-0 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-6xl mx-auto bg-white rounded-[28px] border border-[#E5E7EB] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB] bg-[#FCFAF4]">
                <div>
                  <h3 className="text-xl font-semibold text-[#1F2937]">
                    {modalMode === "create" ? "Crear proveedor" : "Editar proveedor"}
                  </h3>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {modalMode === "create"
                      ? "Primero guardas el proveedor y luego puedes meterle todos los productos que quieras."
                      : "Aquí puedes editar el proveedor y administrar sus productos."}
                  </p>
                </div>
<button
  onClick={requestCloseModal}
  className="p-2 rounded-xl hover:bg-[#F3E7C9]/60 transition-colors"
>
                  <X className="w-5 h-5 text-[#1F2937]" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                {loadingDetail ? (
                  <div className="py-10 text-center text-[#6B7280]">Cargando proveedor...</div>
                ) : (
                  <>
                    <form onSubmit={handleSaveSupplier} className="space-y-6">
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              value={supplierForm.name}
                              onChange={(e) => setSupplierForm((prev) => ({ ...prev, name: e.target.value }))}
                              placeholder="Nombre del proveedor *"
                              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                            />

                            <input
                              value={supplierForm.location}
                              onChange={(e) => setSupplierForm((prev) => ({ ...prev, location: e.target.value }))}
                              placeholder="Ubicación"
                              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                            />

                            <select
                              value={supplierForm.coverage}
                              onChange={(e) => setSupplierForm((prev) => ({ ...prev, coverage: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                            >
                              <option value="regional">Regional</option>
                              <option value="national">Nacional</option>
                              <option value="international">Internacional</option>
                            </select>

                            <input
                              value={supplierForm.email}
                              onChange={(e) => setSupplierForm((prev) => ({ ...prev, email: e.target.value }))}
                              placeholder="Correo de contacto"
                              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                            />

                            <input
                              value={supplierForm.phone}
                              onChange={(e) => setSupplierForm((prev) => ({ ...prev, phone: e.target.value }))}
                              placeholder="Teléfono"
                              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                            />

                            <input
                              value={supplierForm.website}
                              onChange={(e) => setSupplierForm((prev) => ({ ...prev, website: e.target.value }))}
                              placeholder="Sitio web"
                              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                            />
                          </div>

                          <textarea
                            value={supplierForm.description}
                            onChange={(e) => setSupplierForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Descripción"
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] resize-none"
                          />

                          <textarea
                            value={supplierForm.address}
                            onChange={(e) => setSupplierForm((prev) => ({ ...prev, address: e.target.value }))}
                            placeholder="Dirección"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] resize-none"
                          />

                          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937]">
                            <input
                              type="checkbox"
                              checked={supplierForm.is_featured}
                              onChange={(e) =>
                                setSupplierForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                              }
                              className="w-4 h-4 rounded border-[#D1D5DB]"
                            />
                            <span className="text-sm font-medium">Marcar como destacado</span>
                          </label>

                          <div className="rounded-2xl border border-[#E5E7EB] p-4 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-[#1F2937]">Categorías</p>
                                <p className="text-sm text-[#6B7280]">
                                  Puedes buscarlas o crear una nueva.
                                </p>
                              </div>

<button
  type="button"
  onClick={() => setShowCreateCategory((prev) => !prev)}
  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all shadow-sm ${
    showCreateCategory
      ? "border-[#0E5A6B] bg-[#0E5A6B] text-white"
      : "border-[#D9C8A1] bg-[#FFF7E8] text-[#0E5A6B] hover:-translate-y-0.5 hover:shadow-md"
  }`}
>
  <Sparkles className="w-4 h-4" />
  {showCreateCategory ? "Ocultar categoría" : "Crear categoría"}
</button>
                            </div>

                            {showCreateCategory ? (
                              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFAF4] p-4 space-y-3">
                                <input
                                  value={categoryForm.name}
                                  onChange={(e) => setCategoryForm({ name: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault()
                                      void handleCreateCategoryInline()
                                    }
                                  }}
                                  placeholder="Nombre de categoría *"
                                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                                />

                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => void handleCreateCategoryInline()}
                                    disabled={savingCategory}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E5A6B] text-white font-medium hover:bg-[#0E5A6B]/90 transition-colors disabled:opacity-70"
                                  >
                                    {savingCategory ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Plus className="w-4 h-4" />
                                    )}
                                    {savingCategory ? "Guardando..." : "Crear categoría"}
                                  </button>
                                </div>
                              </div>
                            ) : null}

                            <CategoriesPicker
                              items={categoriesData}
                              selectedIds={supplierForm.category_ids}
                              onToggle={toggleCategory}
                              search={categorySearch}
                              setSearch={setCategorySearch}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <UploadField
                            label="Logo del proveedor"
                            file={supplierForm.logo}
                            onChange={(file) => setSupplierForm((prev) => ({ ...prev, logo: file }))}
                          />

                          {modalMode === "edit" && supplierDetail?.logo_url && !supplierForm.logo ? (
                            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFAF4] p-4">
                              <p className="text-sm font-medium text-[#1F2937] mb-3">Logo actual</p>
                              <img
                                src={mediaUrl(supplierDetail.logo_url)}
                                alt={supplierDetail.name}
                                className="w-full max-h-56 object-contain rounded-xl border border-[#E5E7EB] bg-white"
                              />
                            </div>
                          ) : null}

                          <div className="flex flex-col gap-3">
                            <button
                              type="submit"
                              disabled={savingSupplier}
                              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0E5A6B] text-white font-medium hover:bg-[#0E5A6B]/90 transition-colors disabled:opacity-70"
                            >
                              {savingSupplier ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                              {savingSupplier
                                ? "Guardando..."
                                : modalMode === "create"
                                  ? "Guardar proveedor"
                                  : "Guardar cambios"}
                            </button>

                            {modalMode === "edit" ? (
                              <button
                                type="button"
                                onClick={() => void handleDeleteSupplier()}
                                disabled={deletingSupplier}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors disabled:opacity-70"
                              >
                                {deletingSupplier ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {deletingSupplier ? "Eliminando..." : "Eliminar proveedor"}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </form>

                    {modalMode === "edit" && supplierDetail ? (
                      <div className="space-y-8 pt-2">
                        <div className="rounded-2xl border border-[#E5E7EB] p-5 space-y-5">
                          <div>
                            <h4 className="text-lg font-semibold text-[#1F2937]">Agregar productos</h4>
                            <p className="text-sm text-[#6B7280] mt-1">
                              La imagen es opcional. Si no subes una, se mostrará la del proveedor.
                            </p>
                          </div>

                          <div className="space-y-4">
                            {newProducts.map((draft, index) => (
                              <div
                                key={draft.key}
                                className="rounded-2xl border border-[#E5E7EB] bg-[#FCFAF4] p-4 space-y-4"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="font-medium text-[#1F2937]">Nuevo producto #{index + 1}</p>
                                  <button
                                    type="button"
                                    onClick={() => removeNewProductDraft(draft.key)}
                                    className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-red-50 text-sm font-medium text-[#1F2937]"
                                  >
                                    Quitar fila
                                  </button>
                                </div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <input
    value={draft.name}
    onChange={(e) => updateNewProduct(draft.key, { name: e.target.value })}
    placeholder="Nombre del producto *"
    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
  />

  <div className="space-y-2">
    <select
      value={draft.category_id}
      onChange={(e) => updateNewProduct(draft.key, { category_id: e.target.value })}
      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
    >
      <option value="">Selecciona categoría *</option>
      {categoriesData.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>

<button
  type="button"
  onClick={() => setShowCreateProductCategory((prev) => !prev)}
  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border transition-all w-fit ${
    showCreateProductCategory
      ? "border-[#0E5A6B] bg-[#0E5A6B] text-white"
      : "border-[#D9C8A1] bg-[#FFF7E8] text-[#0E5A6B] hover:bg-[#FDF1D7]"
  }`}
>
  <Sparkles className="w-4 h-4" />
  {showCreateProductCategory ? "Ocultar categoría" : "Crear categoría"}
</button>
  </div>

  <input
    value={draft.price}
    onChange={(e) => updateNewProduct(draft.key, { price: e.target.value })}
    placeholder="Precio *"
    inputMode="decimal"
    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
  />
</div>
{showCreateProductCategory ? (
  <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-3">
    <input
      value={productCategoryForm.name}
      onChange={(e) => setProductCategoryForm({ name: e.target.value })}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          void handleCreateProductCategoryInline({ type: "draft", key: draft.key })
        }
      }}
      placeholder="Nombre de la categoría del producto *"
      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
    />

    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => void handleCreateProductCategoryInline({ type: "draft", key: draft.key })}
        disabled={savingCategory}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E5A6B] text-white font-medium hover:bg-[#0E5A6B]/90 transition-colors disabled:opacity-70"
      >
        {savingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {savingCategory ? "Guardando..." : "Crear categoría"}
      </button>
    </div>
  </div>
) : null}

                                <textarea
                                  value={draft.description}
                                  onChange={(e) => updateNewProduct(draft.key, { description: e.target.value })}
                                  placeholder="Descripción opcional"
                                  rows={3}
                                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] resize-none"
                                />

                                <UploadField
                                  label="Imagen del producto"
                                  file={draft.image}
                                  onChange={(file) => updateNewProduct(draft.key, { image: file })}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              type="button"
                              onClick={addNewProductDraft}
                              className="px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F3E7C9]/30 text-sm font-medium text-[#1F2937]"
                            >
                              Agregar otra fila
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleSaveNewProducts()}
                              disabled={savingNewProducts}
                              className="px-4 py-3 rounded-xl bg-[#0E5A6B] text-white font-medium hover:bg-[#0E5A6B]/90 transition-colors disabled:opacity-70"
                            >
                              {savingNewProducts ? "Guardando productos..." : "Guardar productos nuevos"}
                            </button>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#E5E7EB] p-5 space-y-5">
                          <div>
                            <h4 className="text-lg font-semibold text-[#1F2937]">Productos actuales</h4>
                            <p className="text-sm text-[#6B7280] mt-1">
                              Puedes editar o eliminar cualquier producto.
                            </p>
                          </div>

                          {supplierDetail.products.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#FCFAF4] p-6 text-sm text-[#6B7280]">
                              Este proveedor todavía no tiene productos.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {supplierDetail.products.map((product) => {
                                const displayImage = product.image_url || supplierDetail.logo_url || ""

                                return (
                                  <div
                                    key={product.id}
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#FCFAF4] p-4"
                                  >
                                    <div className="flex flex-col lg:flex-row gap-4 lg:items-start lg:justify-between">
                                      <div className="flex gap-4">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden border border-[#E5E7EB] bg-white flex items-center justify-center">
                                          {displayImage ? (
                                            <img
                                              src={mediaUrl(displayImage)}
                                              alt={product.name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="text-xs text-[#6B7280] text-center px-2">
                                              Sin imagen
                                            </div>
                                          )}
                                        </div>

                                        <div className="min-w-0">
                                          <p className="font-semibold text-[#1F2937]">{product.name}</p>
                                          <p className="text-sm text-[#6B7280] mt-1">
                                            {product.description || "Sin descripción"}
                                          </p>
                                          <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="px-2 py-1 rounded-lg bg-white border border-[#E5E7EB] text-sm text-[#1F2937]">
                                              {productPriceLabel(product.price)}
                                            </span>
                                            <span className="px-2 py-1 rounded-lg bg-white border border-[#E5E7EB] text-sm text-[#1F2937]">
                                              {product.category_name || "Sin categoría"}
                                            </span>
                                            {!product.image_url && supplierDetail.logo_url ? (
                                              <span className="px-2 py-1 rounded-lg bg-[#F3E7C9]/50 text-sm text-[#1F2937]">
                                                Usa logo del proveedor
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          type="button"
                                          onClick={() => startEditProduct(product)}
                                          className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F3E7C9]/30 text-sm font-medium text-[#1F2937]"
                                        >
                                          Editar
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => void handleDeleteProduct(product.id, product.name)}
                                          disabled={deletingProductId === product.id}
                                          className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-sm font-medium text-red-700 disabled:opacity-70"
                                        >
                                          {deletingProductId === product.id ? "Eliminando..." : "Eliminar"}
                                        </button>
                                      </div>
                                    </div>

                                    {editingProductId === product.id ? (
                                      <div className="mt-5 pt-5 border-t border-[#E5E7EB] space-y-4">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <input
    value={productEditor.name}
    onChange={(e) =>
      setProductEditor((prev) => ({ ...prev, name: e.target.value }))
    }
    placeholder="Nombre del producto *"
    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
  />

  <div className="space-y-2">
    <select
      value={productEditor.category_id}
      onChange={(e) =>
        setProductEditor((prev) => ({ ...prev, category_id: e.target.value }))
      }
      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
    >
      <option value="">Selecciona categoría *</option>
      {categoriesData.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>

    <button
      type="button"
      onClick={() => setShowCreateProductCategory((prev) => !prev)}
      className="text-sm font-medium text-[#0E5A6B] hover:underline"
    >
      {showCreateProductCategory ? "Ocultar nueva categoría" : "Crear categoría para producto"}
    </button>
  </div>

  <input
    value={productEditor.price}
    onChange={(e) =>
      setProductEditor((prev) => ({ ...prev, price: sanitizePriceInput(e.target.value) }))
    }
    placeholder="Precio *"
    inputMode="decimal"
    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
  />
</div>
{showCreateProductCategory ? (
  <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-3">
    <input
      value={productCategoryForm.name}
      onChange={(e) => setProductCategoryForm({ name: e.target.value })}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          void handleCreateProductCategoryInline({ type: "editor" })
        }
      }}
      placeholder="Nombre de la categoría del producto *"
      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
    />

    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => void handleCreateProductCategoryInline({ type: "editor" })}
        disabled={savingCategory}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E5A6B] text-white font-medium hover:bg-[#0E5A6B]/90 transition-colors disabled:opacity-70"
      >
        {savingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {savingCategory ? "Guardando..." : "Crear categoría"}
      </button>
    </div>
  </div>
) : null}

                                        <textarea
                                          value={productEditor.description}
                                          onChange={(e) =>
                                            setProductEditor((prev) => ({ ...prev, description: e.target.value }))
                                          }
                                          placeholder="Descripción opcional"
                                          rows={3}
                                          className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] resize-none"
                                        />

                                        <UploadField
                                          label="Cambiar imagen del producto"
                                          file={productEditor.image}
                                          onChange={(file) =>
                                            setProductEditor((prev) => ({ ...prev, image: file }))
                                          }
                                        />

                                        <div className="flex flex-col sm:flex-row gap-3">
                                          <button
                                            type="button"
                                            onClick={() => void handleSaveEditedProduct()}
                                            disabled={savingEditedProduct}
                                            className="px-4 py-3 rounded-xl bg-[#0E5A6B] text-white font-medium hover:bg-[#0E5A6B]/90 transition-colors disabled:opacity-70"
                                          >
                                            {savingEditedProduct ? "Guardando..." : "Guardar producto"}
                                          </button>

                                          <button
                                            type="button"
                                            onClick={cancelEditProduct}
                                            className="px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F3E7C9]/30 text-sm font-medium text-[#1F2937]"
                                          >
                                            Cancelar
                                          </button>
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
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
        loading={deletingSupplier || Boolean(deletingProductId)}
        onCancel={closeConfirmDialog}
        onConfirm={() => confirmDialog?.onConfirm()}
      />
    </div>
  )
}
function CategoriesContent() {
  const [items, setItems] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
const [form, setForm] = useState({
  name: "",
})
  async function loadCategories() {
    try {
      setLoading(true)
      const data = await apiJson("/admin/categories")
      setItems(data.items || [])
    } catch (err: any) {
      setError(err.message || "No se pudieron cargar las categorías.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

async function handleCreateCategory(e: React.FormEvent) {
  e.preventDefault()
  setError("")

  if (!form.name.trim()) {
    setError("El nombre de la categoría es obligatorio.")
    return
  }

  try {
    setSaving(true)

    await apiJson("/admin/categories", {
      method: "POST",
      body: JSON.stringify({
        name: form.name.trim(),
        is_active: true,
      }),
    })

    setForm({ name: "" })
    await loadCategories()
  } catch (err: any) {
    setError(err.message || "No se pudo crear la categoría.")
  } finally {
    setSaving(false)
  }
}

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      item.name.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreateCategory} className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[#1F2937]">Crear categoría</h3>

<div className="grid grid-cols-1 gap-4">
  <input
    value={form.name}
    onChange={(e) => setForm({ name: e.target.value })}
    placeholder="Nombre de categoría *"
    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
  />
</div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E5A6B] text-white rounded-xl font-medium hover:bg-[#0E5A6B]/90 transition-all disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? "Guardando..." : "Crear categoría"}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1F2937]">Categorías existentes</h3>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categorías..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-[#6B7280]">Cargando categorías...</p>
        ) : filtered.length === 0 ? (
          <p className="text-[#6B7280]">No hay categorías todavía.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {filtered.map((category) => (
              <div
                key={category.id}
                className="px-4 py-3 rounded-xl bg-[#F3E7C9]/50 text-[#1F2937] border border-[#E5E7EB]"
              >
                <div className="font-medium">{category.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
