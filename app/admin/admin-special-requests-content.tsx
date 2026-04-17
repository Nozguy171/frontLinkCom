"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Clock3, Loader2, Search, XCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"

type SubmissionItem = {
  id: string
  user_id: string
  supplier_id?: string | null
  submission_type: string
  status: string
  data: {
    request_kind?: string
    product_name?: string
    specifications?: string
    quantity?: string
    attachment_url?: string | null
    admin_comment?: string | null
    rejection_reason?: string | null
  }
  notes?: string | null
  created_at?: string | null
  updated_at?: string | null
  user?: {
    id: string
    name: string
    email: string
  } | null
  supplier?: {
    id: string
    name: string
  } | null
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

export default function AdminSpecialRequestsContent() {
  const [items, setItems] = useState<SubmissionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedId, setSelectedId] = useState("")
  const [form, setForm] = useState({
    status: "pending",
    admin_comment: "",
    rejection_reason: "",
  })

  async function loadItems() {
    try {
      setLoading(true)
      setError("")
      const query = new URLSearchParams()
      query.set("submission_type", "special_product_request")
      if (statusFilter) query.set("status", statusFilter)

      const res = await apiJson(`/submissions?${query.toString()}`)
      setItems(res.items || [])
    } catch (err: any) {
      setError(err.message || "No se pudieron cargar las solicitudes.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadItems()
  }, [statusFilter])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items

    return items.filter((item) => {
      return (
        (item.user?.name || "").toLowerCase().includes(q) ||
        (item.user?.email || "").toLowerCase().includes(q) ||
        (item.supplier?.name || "").toLowerCase().includes(q) ||
        (item.data?.product_name || "").toLowerCase().includes(q)
      )
    })
  }, [items, search])

  const selected = filtered.find((item) => item.id === selectedId) || filtered[0] || null

  useEffect(() => {
    if (!selected) return
    setSelectedId(selected.id)
    setForm({
      status: selected.status || "pending",
      admin_comment: selected.data?.admin_comment || "",
      rejection_reason: selected.data?.rejection_reason || "",
    })
  }, [selected?.id])

  async function handleSave() {
    if (!selected) return

    try {
      setSaving(true)
      setError("")

      await apiJson(`/submissions/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      })

      await loadItems()
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar la solicitud.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6 min-h-[70vh]">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB] space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar solicitudes..."
            className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_review">En revisión</option>
            <option value="approved">Aprobada</option>
            <option value="rejected">Rechazada</option>
          </select>
        </div>

        <div className="divide-y divide-[#E5E7EB] max-h-[70vh] overflow-auto">
          {loading ? (
            <div className="p-6 text-[#6B7280] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-[#6B7280]">No hay solicitudes.</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left p-4 hover:bg-[#FCFAF4] ${
                  selected?.id === item.id ? "bg-[#FCFAF4]" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[#1F2937] truncate">
                    {item.data?.product_name || "Sin nombre"}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusClasses(item.status)}`}>
                    {statusLabel(item.status)}
                  </span>
                </div>

                <div className="text-sm text-[#6B7280] mt-1">
                  {item.user?.name || item.user?.email || "Usuario"}
                </div>

                <div className="text-xs text-[#6B7280] mt-1">
                  {item.supplier?.name || "Sin proveedor"}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        {!selected ? (
          <div className="text-[#6B7280]">Selecciona una solicitud.</div>
        ) : (
          <div className="space-y-6">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div>
              <h2 className="text-xl font-semibold text-[#1F2937]">
                {selected.data?.product_name || "Solicitud"}
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                {selected.user?.name || selected.user?.email || "Usuario"} · {selected.supplier?.name || "Sin proveedor"}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-[#E5E7EB] p-4">
                <div className="text-[#6B7280]">Tipo</div>
                <div className="font-medium text-[#1F2937] mt-1">
                  {selected.data?.request_kind === "custom_spec" ? "Especificación especial" : "Nuevo producto"}
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] p-4">
                <div className="text-[#6B7280]">Cantidad</div>
                <div className="font-medium text-[#1F2937] mt-1">{selected.data?.quantity || "—"}</div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] p-4">
              <div className="text-[#6B7280] text-sm">Especificaciones</div>
              <div className="text-[#1F2937] mt-1 whitespace-pre-wrap">
                {selected.data?.specifications || "—"}
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] p-4">
              <div className="text-[#6B7280] text-sm">Notas del usuario</div>
              <div className="text-[#1F2937] mt-1 whitespace-pre-wrap">
                {selected.notes || "—"}
              </div>
            </div>
{selected.data?.admin_comment ? (
  <div className="rounded-xl border border-[#E5E7EB] p-4">
    <div className="text-[#6B7280] text-sm">Comentario del administrador</div>
    <div className="text-[#1F2937] mt-1 whitespace-pre-wrap">
      {selected.data.admin_comment}
    </div>
  </div>
) : null}
            {selected.data?.attachment_url ? (
              <a
                href={`${API_URL.replace(/\/api$/, "")}${selected.data.attachment_url}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#0E5A6B] hover:underline"
              >
                Ver adjunto
              </a>
            ) : null}

            <div className="grid sm:grid-cols-2 gap-4">
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
              >
                <option value="pending">Pendiente</option>
                <option value="in_review">En revisión</option>
                <option value="approved">Aprobada</option>
                <option value="rejected">Rechazada</option>
              </select>

              <input
                value={form.admin_comment}
                onChange={(e) => setForm((prev) => ({ ...prev, admin_comment: e.target.value }))}
                placeholder="Comentario admin"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
              />
            </div>

            {form.status === "rejected" ? (
              <textarea
                value={form.rejection_reason}
                onChange={(e) => setForm((prev) => ({ ...prev, rejection_reason: e.target.value }))}
                placeholder="Motivo de rechazo"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4]"
              />
            ) : null}

            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="px-5 py-3 rounded-xl bg-[#0E5A6B] text-white font-medium hover:bg-[#0B4855] disabled:opacity-70 inline-flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Guardar cambios
            </button>
          </div>
        )}
      </div>
    </div>
  )
}