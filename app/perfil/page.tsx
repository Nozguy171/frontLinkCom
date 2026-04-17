"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Save, User } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"

function getToken() {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("linkcom_token") || ""
}

async function apiJson(path: string, options: RequestInit = {}) {
  const token = getToken()

  const response = await fetch(`${API_URL}/auth${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Ocurrió un error.")
  }

  return data
}

type ProfileForm = {
  name: string
  email: string
  company: string
  phone: string
  password: string
}

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    company: "",
    phone: "",
    password: "",
  })

  async function loadProfile() {
    try {
      setLoading(true)
      setError("")
      const res = await apiJson("/me")

      setForm({
        name: res.user?.name || "",
        email: res.user?.email || "",
        company: res.user?.company || "",
        phone: res.user?.phone || "",
        password: "",
      })
    } catch (err: any) {
      setError(err.message || "No se pudo cargar tu perfil.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        phone: form.phone.trim(),
        password: form.password.trim(),
      }

      const res = await apiJson("/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      })

      const updatedUser = res.user

      localStorage.setItem("linkcom_user", JSON.stringify(updatedUser))

      setForm((prev) => ({
        ...prev,
        name: updatedUser?.name || prev.name,
        email: updatedUser?.email || prev.email,
        company: updatedUser?.company || "",
        phone: updatedUser?.phone || "",
        password: "",
      }))

      setSuccess(res.message || "Perfil actualizado correctamente.")
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar tu perfil.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FCFAF4]">
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center gap-4">
            <Link
              href="/home"
              className="rounded-xl p-2 transition-colors hover:bg-[#F3E7C9]/50"
            >
              <ArrowLeft className="h-5 w-5 text-[#1F2937]" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0E5A6B] text-white flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#1F2937]">Mi perfil</h1>
                <p className="text-sm text-[#6B7280]">Actualiza tu información personal</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6 md:p-8">
          {loading ? (
            <div className="flex items-center gap-2 text-[#6B7280]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando perfil...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] px-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] px-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] px-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                    placeholder="Tu empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] px-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                    placeholder="Tu teléfono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] px-4 py-3 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                  placeholder="Déjala vacía si no la quieres cambiar"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0E5A6B] px-5 py-3 text-white font-medium hover:bg-[#0B4855] transition-colors disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Guardar cambios
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}