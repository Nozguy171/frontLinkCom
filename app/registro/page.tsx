"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"

type CardBrand = "visa" | "mastercard" | "amex" | "desconocida"

function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

function detectCardBrand(cardNumber: string): CardBrand {
  const digits = onlyDigits(cardNumber)

  if (/^4/.test(digits)) return "visa"
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return "mastercard"
  if (/^3[47]/.test(digits)) return "amex"

  return "desconocida"
}

function formatCardNumber(value: string, brand: CardBrand) {
  const digits = onlyDigits(value)

  if (brand === "amex") {
    return digits
      .slice(0, 15)
      .replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join(" ")
      )
  }

  return digits
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
}

function formatExpiry(value: string) {
  const digits = onlyDigits(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function brandLabel(brand: CardBrand) {
  if (brand === "visa") return "Visa"
  if (brand === "mastercard") return "Mastercard"
  if (brand === "amex") return "American Express"
  return "Tarjeta"
}

export default function RegistroPage() {
  const router = useRouter()

  const [step, setStep] = useState<"form" | "success">("form")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    password: "",
    confirmPassword: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  })

  const cardBrand = useMemo(() => detectCardBrand(form.cardNumber), [form.cardNumber])

  const [successData, setSuccessData] = useState<{
    userName: string
    paymentReference: string
    brand: string
    last4: string
  } | null>(null)

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Completa los campos obligatorios.")
      return
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    const cleanCard = onlyDigits(form.cardNumber)
    const cleanCvv = onlyDigits(form.cvv)

    if (cleanCard.length < 15) {
      setError("Ingresa un número de tarjeta válido.")
      return
    }

    if (!form.expiry.includes("/") || form.expiry.length !== 5) {
      setError("Ingresa una fecha de vencimiento válida.")
      return
    }

    if (cleanCvv.length < 3) {
      setError("Ingresa un CVV válido.")
      return
    }

    try {
      setIsSubmitting(true)

      const [expiryMonth, expiryYear] = form.expiry.split("/")

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          phone: form.phone.trim(),
          password: form.password,
          payment: {
            card_name: form.cardName.trim(),
            card_number: cleanCard,
            expiry_month: expiryMonth,
            expiry_year: `20${expiryYear}`,
            cvv: cleanCvv,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.message || "No se pudo crear la cuenta.")
        return
      }

      setSuccessData({
        userName: data.user.name,
        paymentReference: data.payment.reference,
        brand: data.payment.brand,
        last4: data.payment.last4,
      })

      setStep("success")
    } catch (err) {
      setError("Ocurrió un error al procesar el registro.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === "success" && successData) {
    return (
      <div className="min-h-screen bg-[#FCFAF4] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg bg-white rounded-[28px] shadow-xl shadow-black/5 p-8 md:p-10">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="text-center mt-6">
            <h1 className="text-3xl font-bold text-[#1F2937]">Pago aprobado</h1>
            <p className="text-[#6B7280] mt-3">
              Tu cuenta fue creada correctamente y tu acceso ya quedó registrado.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-[#FCFAF4] border border-[#E5E7EB] p-5 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#6B7280] text-sm">Usuario</span>
              <span className="text-[#1F2937] font-medium text-sm">{successData.userName}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[#6B7280] text-sm">Referencia</span>
              <span className="text-[#1F2937] font-medium text-sm">{successData.paymentReference}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[#6B7280] text-sm">Tarjeta</span>
              <span className="text-[#1F2937] font-medium text-sm">
                {successData.brand} terminación {successData.last4}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="mt-8 w-full py-3.5 px-4 bg-[#0E5A6B] text-white rounded-xl font-medium hover:bg-[#0E5A6B]/90 transition-all shadow-lg shadow-[#0E5A6B]/20"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FCFAF4] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#0E5A6B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-16 w-96 h-96 rounded-full bg-white/20" />
          <div className="absolute bottom-16 right-16 w-72 h-72 rounded-full bg-white/10" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold mb-6">LinkCom.mx</h1>
          <p className="text-xl text-white/90 leading-relaxed max-w-md">
            Crea tu cuenta, simula tu pago de acceso y empieza a explorar proveedores.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-white/80">Simulación de pago segura para demostración</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-white/80">No se realiza ningún cobro real</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#0E5A6B] font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al login
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-[#1F2937]">Crear cuenta</h1>
              <p className="text-[#6B7280] mt-2">
                Completa tus datos y simula el pago de acceso para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-[#1F2937] uppercase tracking-wide">
                    Datos de la cuenta
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Nombre completo *"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                  />

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Correo electrónico *"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                  />

                  <input
                    value={form.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    placeholder="Empresa"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                  />

                  <input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Teléfono"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Contraseña *"
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] pr-12 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      placeholder="Confirmar contraseña *"
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] pr-12 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-[#1F2937] uppercase tracking-wide">
                    Simulación de pago
                  </h2>

                  <span className="text-xs px-3 py-1 rounded-full bg-[#F3E7C9] text-[#1F2937] font-medium">
                    {brandLabel(cardBrand)}
                  </span>
                </div>

                <input
                  value={form.cardName}
                  onChange={(e) => updateField("cardName", e.target.value)}
                  placeholder="Nombre como aparece en la tarjeta *"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                />

                <input
                  value={form.cardNumber}
                  onChange={(e) =>
                    updateField("cardNumber", formatCardNumber(e.target.value, detectCardBrand(e.target.value)))
                  }
                  placeholder="Número de tarjeta *"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] tracking-wide focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    value={form.expiry}
                    onChange={(e) => updateField("expiry", formatExpiry(e.target.value))}
                    placeholder="MM/AA *"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                  />

                  <input
                    value={form.cvv}
                    onChange={(e) => updateField("cvv", onlyDigits(e.target.value).slice(0, 4))}
                    placeholder="CVV *"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B]"
                  />
                </div>

                <div className="rounded-xl bg-[#FCFAF4] border border-[#E5E7EB] px-4 py-3 text-sm text-[#6B7280]">
                  Esta es una simulación visual de pago. No se realiza ningún cargo real.
                </div>
              </section>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#0E5A6B] text-white rounded-xl font-medium hover:bg-[#0E5A6B]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0E5A6B]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando pago...
                  </>
                ) : (
                  "Crear cuenta y pagar"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}