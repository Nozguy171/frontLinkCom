"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Package, FileText, Check, Upload, X } from "lucide-react"
import { suppliers, categories } from "@/lib/mock-data"

type FormType = "extra" | "custom" | null

export default function FormsPage() {
  const [activeForm, setActiveForm] = useState<FormType>(null)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    requester: "",
    supplier: "",
    category: "",
    product: "",
    quantity: "",
    specifications: "",
    comments: "",
    attachment: null as File | null
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setActiveForm(null)
      setFormData({
        requester: "",
        supplier: "",
        category: "",
        product: "",
        quantity: "",
        specifications: "",
        comments: "",
        attachment: null
      })
    }, 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-[#FCFAF4]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/home"
                className="p-2 rounded-xl hover:bg-[#F3E7C9]/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
              </Link>
              <span className="text-xl font-bold text-[#0E5A6B]">Solicitudes</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success State */}
        {submitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Solicitud enviada</h3>
              <p className="text-[#6B7280]">
                Tu solicitud ha sido recibida. Te contactaremos pronto.
              </p>
            </div>
          </div>
        )}

        {!activeForm ? (
          /* Form Type Selection */
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937] mb-3">
                Formatos de solicitud
              </h1>
              <p className="text-[#6B7280] max-w-xl mx-auto">
                Selecciona el tipo de solicitud que deseas realizar. Completa el formulario y lo enviaremos al proveedor correspondiente.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Extra Merchandise Form Card */}
              <button
                onClick={() => setActiveForm("extra")}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-6 text-left hover:shadow-lg hover:border-[#0E5A6B]/30 transition-all group"
              >
                <div className="w-14 h-14 bg-[#0E5A6B]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0E5A6B]/20 transition-colors">
                  <Package className="w-7 h-7 text-[#0E5A6B]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1F2937] mb-2 group-hover:text-[#0E5A6B] transition-colors">
                  Solicitud de mercancía extra
                </h2>
                <p className="text-[#6B7280]">
                  Solicita productos adicionales de un catálogo existente. Ideal para restock o pedidos recurrentes.
                </p>
              </button>

              {/* Custom Merchandise Form Card */}
              <button
                onClick={() => setActiveForm("custom")}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-6 text-left hover:shadow-lg hover:border-[#0E5A6B]/30 transition-all group"
              >
                <div className="w-14 h-14 bg-[#F3E7C9] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#F3E7C9]/70 transition-colors">
                  <FileText className="w-7 h-7 text-[#0E5A6B]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1F2937] mb-2 group-hover:text-[#0E5A6B] transition-colors">
                  Solicitud con especificaciones
                </h2>
                <p className="text-[#6B7280]">
                  Solicita productos personalizados o fuera de catálogo. Incluye especificaciones detalladas.
                </p>
              </button>
            </div>
          </>
        ) : (
          /* Active Form */
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            {/* Form Header */}
            <div className="bg-[#0E5A6B] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeForm === "extra" ? (
                  <Package className="w-6 h-6 text-white" />
                ) : (
                  <FileText className="w-6 h-6 text-white" />
                )}
                <h2 className="text-lg font-semibold text-white">
                  {activeForm === "extra" ? "Solicitud de mercancía extra" : "Solicitud con especificaciones"}
                </h2>
              </div>
              <button
                onClick={() => setActiveForm(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Nombre del solicitante *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.requester}
                    onChange={(e) => handleInputChange("requester", e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Proveedor *
                  </label>
                  <select
                    required
                    value={formData.supplier}
                    onChange={(e) => handleInputChange("supplier", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all"
                  >
                    <option value="">Selecciona un proveedor</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    placeholder="Ej: 100"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">
                  Producto o referencia *
                </label>
                <input
                  type="text"
                  required
                  value={formData.product}
                  onChange={(e) => handleInputChange("product", e.target.value)}
                  placeholder="Nombre del producto o código de referencia"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all"
                />
              </div>

              {activeForm === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">
                    Especificaciones detalladas *
                  </label>
                  <textarea
                    required
                    value={formData.specifications}
                    onChange={(e) => handleInputChange("specifications", e.target.value)}
                    placeholder="Describe las especificaciones del producto (tallas, colores, materiales, etc.)"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all resize-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">
                  Comentarios adicionales
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => handleInputChange("comments", e.target.value)}
                  placeholder="Información adicional o instrucciones especiales"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">
                  Adjuntar imagen o evidencia
                </label>
                <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-6 text-center hover:border-[#0E5A6B]/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => setFormData((prev) => ({ ...prev, attachment: e.target.files?.[0] || null }))}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
                    <p className="text-[#6B7280] text-sm">
                      {formData.attachment ? formData.attachment.name : "Haz clic o arrastra un archivo aquí"}
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="flex-1 py-3 px-4 border border-[#E5E7EB] text-[#1F2937] rounded-xl font-medium hover:bg-[#F3E7C9]/30 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#0E5A6B] text-white rounded-xl font-medium hover:bg-[#0E5A6B]/90 transition-all"
                >
                  Enviar solicitud
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
