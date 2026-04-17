"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, PackageSearch, Search } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"

type SupplierItem = {
  id: string
  name: string
}

type SubmissionItem = {
  id: string
  submission_type: string
  status: string
  notes?: string | null
  data: {
    request_kind?: string
    product_name?: string
    specifications?: string
    quantity?: string
    attachment_url?: string | null
    admin_comment?: string | null
    rejection_reason?: string | null
  }
  supplier?: {
    id: string
    name: string
  } | null
  created_at?: string | null
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
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body,
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

function sanitizeIntegerInput(value: string) {
  return value.replace(/\D/g, "")
}

function statusLabel(status: string) {
  if (status === "approved") return "Aprobada"
  if (status === "rejected") return "Rechazada"
  if (status === "in_review") return "En revisión"
  return "Pendiente"
}

function statusClasses(status: string) {
  if (status === "approved") return "bg-green-100 text-green-700"
  if (status === "rejected") return "bg-red-100 text-red-700"
  if (status === "in_review") return "bg-amber-100 text-amber-700"
  return "bg-slate-100 text-slate-700"
}

export default function SpecialRequestsPage() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([])
  const [items, setItems] = useState<SubmissionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({
    submission_type: "special_product_request",
    request_kind: "new_product",
    supplier_id: "",
    product_name: "",
    specifications: "",
    quantity: "",
    notes: "",
  })
  const [attachment, setAttachment] = useState<File | null>(null)
const searchParams = useSearchParams()
  async function loadAll() {
    try {
      setLoading(true)
      setError("")

      const [suppliersRes, submissionsRes] = await Promise.all([
        apiJson("/suppliers"),
        apiJson("/submissions"),
      ])

      setSuppliers((suppliersRes.items || []).map((item: any) => ({ id: item.id, name: item.name })))
      setItems(submissionsRes.items || [])
    } catch (err: any) {
      setError(err.message || "No se pudo cargar la información.")
    } finally {
      setLoading(false)
    }
  }

useEffect(() => {
  void loadAll()
}, [])

useEffect(() => {
  const supplierIdFromQuery = searchParams.get("supplier_id") || ""
  if (!supplierIdFromQuery) return

  setForm((prev) => ({
    ...prev,
    supplier_id: supplierIdFromQuery,
  }))
}, [searchParams])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items

    return items.filter((item) => {
      return (
        (item.data?.product_name || "").toLowerCase().includes(q) ||
        (item.supplier?.name || "").toLowerCase().includes(q)
      )
    })
  }, [items, search])

async function handleSubmit() {
  try {
    setSaving(true)
    setError("")

    if (!form.product_name.trim()) {
      setError("Escribe el nombre del producto.")
      return
    }

    if (!form.specifications.trim()) {
      setError("Escribe las especificaciones.")
      return
    }

    if (!form.quantity.trim()) {
      setError("La cantidad es obligatoria.")
      return
    }

const formData = new FormData()
formData.append("submission_type", form.submission_type)
formData.append("request_kind", form.request_kind)

if (form.supplier_id) {
  formData.append("supplier_id", form.supplier_id)
}

formData.append("product_name", form.product_name.trim())
formData.append("specifications", form.specifications.trim())
formData.append("quantity", form.quantity.trim())
formData.append("notes", form.notes.trim())

      if (attachment) {
        formData.append("attachment", attachment)
      }

await apiForm("/submissions", formData, "POST")

      setForm({
        submission_type: "special_product_request",
        request_kind: "new_product",
        supplier_id: "",
        product_name: "",
        specifications: "",
        quantity: "",
        notes: "",
      })
      setAttachment(null)

      await loadAll()
    } catch (err: any) {
      setError(err.message || "No se pudo crear la solicitud.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FCFAF4]">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/home" className="p-2 rounded-xl hover:bg-[#F3E7C9]/50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[#1F2937]">Solicitudes especiales</h1>
            <p className="text-sm text-[#6B7280]">Pide un producto nuevo o una especificación especial.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4 h-fit">
            <select
              value={form.request_kind}
              onChange={(e) => setForm((prev) => ({ ...prev, request_kind: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
            >
              <option value="new_product">Nuevo producto</option>
              <option value="custom_spec">Especificación especial</option>
            </select>

            <select
              value={form.supplier_id}
              onChange={(e) => setForm((prev) => ({ ...prev, supplier_id: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
            >
              <option value="">Sin proveedor</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>

            <input
              value={form.product_name}
              onChange={(e) => setForm((prev) => ({ ...prev, product_name: e.target.value }))}
              placeholder="Nombre del producto"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
            />

            <textarea
              value={form.specifications}
              onChange={(e) => setForm((prev) => ({ ...prev, specifications: e.target.value }))}
              placeholder="Especificaciones"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
            />

<input
  value={form.quantity}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      quantity: sanitizeIntegerInput(e.target.value),
    }))
  }
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="Cantidad"
  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
/>

            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
            />

            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
            />

            <button
              onClick={() => void handleSubmit()}
              disabled={saving}
              className="w-full px-5 py-3 rounded-xl bg-[#0E5A6B] text-white font-medium hover:bg-[#0B4855] disabled:opacity-70 inline-flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Enviar solicitud
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar en historial..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
                />
              </div>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <div className="p-6 text-[#6B7280] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-[#6B7280]">No tienes solicitudes todavía.</div>
              ) : (
                filtered.map((item) => (
                  <div key={item.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-[#1F2937]">
                        {item.data?.product_name || "Solicitud"}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusClasses(item.status)}`}>
                        {statusLabel(item.status)}
                      </span>
                    </div>

                    <div className="text-sm text-[#6B7280]">
                      {item.supplier?.name || "Sin proveedor"}
                    </div>

                    <div className="text-sm text-[#1F2937] whitespace-pre-wrap">
                      {item.data?.specifications || "—"}
                    </div>

                    {item.data?.admin_comment ? (
                      <div className="text-sm text-[#0E5A6B]">
                        Comentario admin: {item.data.admin_comment}
                      </div>
                    ) : null}

                    {item.data?.rejection_reason ? (
                      <div className="text-sm text-red-600">
                        Motivo de rechazo: {item.data.rejection_reason}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}