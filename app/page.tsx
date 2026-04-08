"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context"
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"

export default function LoginPage() {
  const router = useRouter()
  const { setRole } = useApp()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Ingresa tu correo y tu contraseña.")
      return
    }

    try {
      setIsSubmitting(true)

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.message || "No se pudo iniciar sesión.")
        return
      }

      localStorage.setItem("linkcom_token", data.access_token)
      localStorage.setItem("linkcom_user", JSON.stringify(data.user))

      if (rememberMe) {
        localStorage.setItem("linkcom_remember_email", email.trim())
      } else {
        localStorage.removeItem("linkcom_remember_email")
      }

      setRole(data.user.role)

      if (data.user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/home")
      }
    } catch (err) {
      setError("Ocurrió un error al conectar con el servidor.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FCFAF4] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#0E5A6B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-white/20" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-white/10" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold mb-6">LinkCom.mx</h1>
          <p className="text-xl text-white/90 leading-relaxed max-w-md">
            Conecta con proveedores, descubre productos y haz crecer tu negocio.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <span className="text-white/80">Más de 500 proveedores verificados</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-white/80">Catálogos actualizados diariamente</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-white/80">Conexión directa con mayoristas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-3xl font-bold text-[#0E5A6B]">LinkCom.mx</h1>
            <p className="text-[#6B7280] mt-2">Portal de Proveedores</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-[#1F2937]">Bienvenido de vuelta</h2>
              <p className="text-[#6B7280] mt-2">Ingresa a tu cuenta para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E5E7EB] text-[#0E5A6B] focus:ring-[#0E5A6B]/20"
                  />
                  <span className="text-sm text-[#6B7280]">Recordarme</span>
                </label>

                <button
                  type="button"
                  className="text-sm text-[#0E5A6B] hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#0E5A6B] text-white rounded-xl font-medium hover:bg-[#0E5A6B]/90 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-[#0E5A6B]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    Ingresar
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-[#0E5A6B] font-medium hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}