"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Globe,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"

type SupplierCategory = {
  id: string
  name: string
  slug: string
  icon?: string | null
  description?: string | null
  is_active?: boolean
}

type SupplierProduct = {
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

type SupplierDetail = {
  id: string
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  banner_url?: string | null
  location?: string | null
  coverage?: string | null
  address?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  is_verified?: boolean
  is_featured?: boolean
  is_active?: boolean
  products_count?: number
  categories?: SupplierCategory[]
  products?: SupplierProduct[]
}

function mediaUrl(value?: string | null) {
  if (!value) return ""
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  return `${API_URL.replace(/\/api$/, "")}${value}`
}

function coverageLabel(value?: string | null) {
  const normalized = (value || "").trim().toLowerCase()
  if (normalized === "international") return "Internacional"
  if (normalized === "regional") return "Regional"
  if (normalized === "national") return "Nacional"
  return value || "No disponible"
}

function currencyLabel(value?: number | null) {
  if (typeof value !== "number") return null
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value)
}

export default function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [supplier, setSupplier] = useState<SupplierDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    async function loadSupplier() {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(`${API_URL}/suppliers/${id}`, {
          cache: "no-store",
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data?.error || data?.message || "Proveedor no encontrado.")
        }

        if (ignore) return
        setSupplier(data?.supplier || null)
      } catch (err: any) {
        if (!ignore) {
          setError(err.message || "No se pudo cargar el proveedor.")
          setSupplier(null)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    if (id) {
      loadSupplier()
    }

    return () => {
      ignore = true
    }
  }, [id])

  const tags = useMemo(() => {
    return (supplier?.categories || []).map((category) => category.name).filter(Boolean)
  }, [supplier])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFAF4]">
        <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white shadow-sm">
          <div className="max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <Link
              href="/home"
              className="rounded-xl p-2 transition-colors hover:bg-[#F3E7C9]/50"
            >
              <ArrowLeft className="h-5 w-5 text-[#1F2937]" />
            </Link>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-56 animate-pulse rounded-3xl bg-[#EDE7DA]" />
          <div className="-mt-14 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-lg md:p-8">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-[#EDE7DA]" />
            <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded-lg bg-[#EDE7DA]" />
            <div className="mt-2 h-5 w-full max-w-xl animate-pulse rounded-lg bg-[#EDE7DA]" />
          </div>
        </div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-[#FCFAF4] flex items-center justify-center px-4">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#1F2937] mb-3">Proveedor no encontrado</h1>
          <p className="text-[#6B7280] mb-5">
            {error || "No pudimos encontrar la información de este proveedor."}
          </p>
          <Link href="/home" className="text-[#0E5A6B] hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const banner = mediaUrl(supplier.banner_url)
  const logo = mediaUrl(supplier.logo_url)
  const products = supplier.products || []

  return (
    <div className="min-h-screen bg-[#FCFAF4]">
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
              <span className="text-xl font-bold text-[#0E5A6B]">LinkCom.mx</span>
            </div>

<div className="flex gap-3">
  <Link
    href="/chat"
    className="flex items-center gap-2 px-4 py-2 bg-[#0E5A6B] text-white rounded-xl font-medium hover:bg-[#0E5A6B]/90 transition-all"
  >
    <MessageCircle className="w-4 h-4" />
    <span className="hidden sm:inline">Contactar</span>
  </Link>

  <Link
    href={`/forms?supplier_id=${supplier.id}`}
    className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] bg-white text-[#1F2937] rounded-xl font-medium hover:bg-[#F3E7C9]/30 transition-all"
  >
    <Package className="w-4 h-4" />
    <span className="hidden sm:inline">Solicitud especial</span>
  </Link>
</div>
          </div>
        </div>
      </header>

      <div className="relative h-48 md:h-64 lg:h-80 bg-[#EDE7DA] overflow-hidden">
        {banner ? (
          <img
            src={banner}
            alt={supplier.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-[#0E5A6B] to-[#164B58]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0 -mt-16 md:-mt-20 bg-white">
              {logo ? (
                <img
                  src={logo}
                  alt={supplier.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#F3E7C9]/40 text-3xl font-bold text-[#0E5A6B]">
                  {supplier.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]">
                      {supplier.name}
                    </h1>

                    {supplier.is_featured ? (
                      <span className="px-3 py-1 bg-[#0E5A6B] text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Destacado
                      </span>
                    ) : null}

                    {supplier.is_verified ? (
                      <span className="px-3 py-1 bg-[#F3E7C9]/60 text-[#1F2937] text-xs font-medium rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verificado
                      </span>
                    ) : null}
                  </div>

                  {supplier.location ? (
                    <p className="text-[#6B7280] text-lg">{supplier.location}</p>
                  ) : null}
                </div>

<div className="flex gap-3 flex-wrap">
  <Link
    href="/chat"
    className="flex items-center gap-2 px-5 py-2.5 bg-[#0E5A6B] text-white rounded-xl font-medium hover:bg-[#0E5A6B]/90 transition-all"
  >
    <MessageCircle className="w-4 h-4" />
    Iniciar chat
  </Link>

  <Link
    href={`/forms?supplier_id=${supplier.id}`}
    className="flex items-center gap-2 px-5 py-2.5 border border-[#E5E7EB] bg-white text-[#1F2937] rounded-xl font-medium hover:bg-[#F3E7C9]/30 transition-all"
  >
    <Package className="w-4 h-4" />
    Solicitud especial
  </Link>
</div>
              </div>

              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-[#F3E7C9]/50 text-[#1F2937] text-sm font-medium rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {supplier.description ? (
            <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
              <h2 className="text-lg font-semibold text-[#1F2937] mb-3">
                Acerca del proveedor
              </h2>
              <p className="text-[#6B7280] leading-relaxed">{supplier.description}</p>
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Package} label="Productos" value={`${supplier.products_count ?? products.length}`} />
            <StatCard icon={Globe} label="Cobertura" value={coverageLabel(supplier.coverage)} />
            <StatCard icon={MapPin} label="Ubicación" value={supplier.location?.split(",")[0] || "No disponible"} />
            <StatCard icon={Info} label="Categorías" value={`${tags.length || 0}`} />
          </div>

          {(supplier.phone || supplier.email || supplier.website || supplier.address) ? (
            <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
              <h2 className="text-lg font-semibold text-[#1F2937] mb-4">
                Información de contacto
              </h2>

              <div className="flex flex-wrap gap-4">
                {supplier.phone ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#FCFAF4] rounded-xl">
                    <Phone className="w-5 h-5 text-[#0E5A6B]" />
                    <span className="text-[#1F2937]">{supplier.phone}</span>
                  </div>
                ) : null}

                {supplier.email ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#FCFAF4] rounded-xl">
                    <Mail className="w-5 h-5 text-[#0E5A6B]" />
                    <span className="text-[#1F2937]">{supplier.email}</span>
                  </div>
                ) : null}

                {supplier.address ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#FCFAF4] rounded-xl">
                    <MapPin className="w-5 h-5 text-[#0E5A6B]" />
                    <span className="text-[#1F2937]">{supplier.address}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#1F2937]">
            Catálogo de productos
          </h2>
          <span className="text-[#6B7280]">
            {products.length} producto(s) disponibles
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-lg hover:border-[#0E5A6B]/30 transition-all group"
              >
                <div className="relative h-48 bg-[#F3E7C9]/20 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={mediaUrl(product.image_url)}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#0E5A6B]">
                      {product.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-[#1F2937] mb-1 group-hover:text-[#0E5A6B] transition-colors">
                    {product.name}
                  </h3>

                  {product.description ? (
                    <p className="text-sm text-[#6B7280] mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  ) : null}

                  <div className="flex items-center justify-between gap-3">
                    <span className="px-2 py-1 bg-[#F3E7C9]/50 text-[#1F2937] text-xs font-medium rounded-lg">
                      {product.category_name || "Producto"}
                    </span>

                    {currencyLabel(product.price) ? (
                      <span className="font-semibold text-[#0E5A6B]">
                        {currencyLabel(product.price)}
                      </span>
                    ) : null}
                  </div>

                  <button className="w-full mt-4 py-2.5 bg-[#F3E7C9] text-[#1F2937] rounded-xl font-medium hover:bg-[#F3E7C9]/70 transition-all">
                    Solicitar información
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
            <div className="w-16 h-16 bg-[#F3E7C9]/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-[#0E5A6B]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
              Sin productos disponibles
            </h3>
            <p className="text-[#6B7280] mb-4">
              Este proveedor aún no ha cargado su catálogo de productos.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E5A6B] text-white rounded-xl font-medium hover:bg-[#0E5A6B]/90 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar para más información
            </Link>
          </div>
        )}
      </section>

      <footer className="bg-[#0E5A6B] text-white py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/70 text-sm">© 2026 LinkCom.mx. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="p-4 bg-[#FCFAF4] rounded-xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[#E5E7EB]">
          <Icon className="w-5 h-5 text-[#0E5A6B]" />
        </div>
        <span className="text-sm text-[#6B7280]">{label}</span>
      </div>
      <p className="font-semibold text-[#1F2937]">{value}</p>
    </div>
  )
}
