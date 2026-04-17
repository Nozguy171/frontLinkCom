"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  BookOpen,
  FileText,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Search,
  Star,
  User,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { banners } from "@/lib/mock-data"
import { useApp } from "@/lib/context"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"

type UserMenuProfile = {
  name: string
  company?: string | null
}

type PublicCategory = {
  id: string
  name: string
  slug: string
  icon?: string | null
  description?: string | null
  is_active: boolean
}

type SupplierCategory = {
  id: string
  name: string
  slug: string
  icon?: string | null
  description?: string | null
  is_active: boolean
}

type PublicSupplier = {
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
  is_verified?: boolean
  is_featured: boolean
  is_active: boolean
  categories: SupplierCategory[]
  products_count: number
}

function mediaUrl(value?: string | null) {
  if (!value) return ""
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  return `${API_URL.replace(/\/api$/, "")}${value}`
}

function getStoredUser(): UserMenuProfile {
  if (typeof window === "undefined") {
    return { name: "Usuario", company: "LinkCom" }
  }

  try {
    const raw = localStorage.getItem("linkcom_user")
    if (!raw) return { name: "Usuario", company: "LinkCom" }

    const parsed = JSON.parse(raw)
    return {
      name: parsed?.name || "Usuario",
      company: parsed?.company || "LinkCom",
    }
  } catch {
    return { name: "Usuario", company: "LinkCom" }
  }
}

function coverageLabel(value?: string) {
  if (value === "international") return "Internacional"
  if (value === "regional") return "Regional"
  return "Nacional"
}

function supplierMatchesCategory(supplier: PublicSupplier, categoryId: string) {
  if (!categoryId) return true
  return (supplier.categories || []).some((category) => category.id === categoryId)
}

function supplierMatchesSearch(supplier: PublicSupplier, query: string) {
  if (!query) return true

  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    supplier.name,
    supplier.description,
    supplier.location,
    supplier.coverage,
    ...(supplier.categories || []).map((category) => category.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return haystack.includes(q)
}

function SupplierCard({
  supplier,
  featured = false,
}: {
  supplier: PublicSupplier
  featured?: boolean
}) {
  const logo = mediaUrl(supplier.logo_url)
  const firstCategory = supplier.categories?.[0]?.name || "Sin categoría"

  return (
    <Link
      href={`/supplier/${supplier.id}`}
      className="group block h-full overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white transition-all hover:-translate-y-1 hover:border-[#0E5A6B]/30 hover:shadow-xl"
    >
      <div className={`relative overflow-hidden bg-gradient-to-br from-[#F7F1E1] to-[#F3E7C9] ${featured ? "h-44" : "h-40"}`}>
        {logo ? (
          <img
            src={logo}
            alt={supplier.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#0E5A6B]">
            {supplier.name.slice(0, 1).toUpperCase()}
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {supplier.is_featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0E5A6B] px-3 py-1 text-xs font-semibold text-white shadow-md">
              <Star className="h-3.5 w-3.5" />
              Destacado
            </span>
          ) : null}

          {supplier.is_verified ? (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1F2937] shadow-sm">
              Verificado
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-1 text-lg font-semibold text-[#1F2937] transition-colors group-hover:text-[#0E5A6B]">
            {supplier.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-[#6B7280]">
            {supplier.description || "Proveedor disponible en la plataforma."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#F3E7C9]/55 px-3 py-1 text-xs font-medium text-[#1F2937]">
            {firstCategory}
          </span>
          {supplier.categories?.length > 1 ? (
            <span className="rounded-full border border-[#E5E7EB] bg-[#FCFAF4] px-3 py-1 text-xs font-medium text-[#6B7280]">
              +{supplier.categories.length - 1} más
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm text-[#6B7280] sm:grid-cols-2">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#0E5A6B]" />
            {supplier.location || "Ubicación no disponible"}
          </span>
          <span className="inline-flex items-center gap-2">
            <Package className="h-4 w-4 text-[#0E5A6B]" />
            {supplier.products_count} productos
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4">
          <span className="text-sm font-medium text-[#6B7280]">{coverageLabel(supplier.coverage)}</span>
          <span className="text-sm font-semibold text-[#0E5A6B] group-hover:underline">Ver proveedor</span>
        </div>
      </div>
    </Link>
  )
}

function MenuItem({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ElementType
  label: string
  href?: string
  onClick?: () => void
}) {
  const content = (
    <div className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-[#1F2937] transition-colors hover:bg-[#F3E7C9]/50">
      <Icon className="h-5 w-5 text-[#6B7280]" />
      <span className="font-medium">{label}</span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} onClick={onClick}>
        {content}
      </Link>
    )
  }

  return <div onClick={onClick}>{content}</div>
}

function FeaturedSuppliersMarquee({ suppliers }: { suppliers: PublicSupplier[] }) {
  const [paused, setPaused] = useState(false)

  const marqueeItems = useMemo(() => {
    if (!suppliers.length) return []
    return [...suppliers, ...suppliers]
  }, [suppliers])

  if (!suppliers.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-[#D1D5DB] bg-white p-10 text-center text-[#6B7280]">
        No hay proveedores destacados todavía.
      </div>
    )
  }

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#FCFAF4] to-transparent md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#FCFAF4] to-transparent md:w-24" />

      <div
        className="featured-marquee-track flex w-max gap-5 py-1"
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {marqueeItems.map((supplier, index) => (
          <div
            key={`${supplier.id}-${index}`}
            className="w-[280px] flex-none md:w-[320px] xl:w-[340px]"
          >
            <SupplierCard supplier={supplier} featured />
          </div>
        ))}
      </div>

      <style jsx>{`
        .featured-marquee-track {
          animation: featured-marquee 32s linear infinite;
        }

        @keyframes featured-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 10px));
          }
        }
      `}</style>
    </div>
  )
}

export default function UserHomePage() {
  const router = useRouter()
  const { setRole } = useApp()

  const [currentBanner, setCurrentBanner] = useState(0)
  const [sideMenuOpen, setSideMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<PublicCategory[]>([])
  const [suppliers, setSuppliers] = useState<PublicSupplier[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userProfile, setUserProfile] = useState<UserMenuProfile>({ name: "Usuario", company: "LinkCom" })
const suppliersSectionRef = useRef<HTMLElement | null>(null)

function scrollToSuppliers() {
  suppliersSectionRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })
}
  const handleLogout = () => {
    localStorage.removeItem("linkcom_token")
    localStorage.removeItem("linkcom_user")
    setRole(null)
    router.push("/")
  }

  useEffect(() => {
    setUserProfile(getStoredUser())
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadData() {
      try {
        setLoading(true)
        setError("")

        const [categoriesResponse, suppliersResponse] = await Promise.all([
          fetch(`${API_URL}/categories`, { cache: "no-store" }),
          fetch(`${API_URL}/suppliers`, { cache: "no-store" }),
        ])

        const categoriesData = await categoriesResponse.json().catch(() => ({ items: [] }))
        const suppliersData = await suppliersResponse.json().catch(() => ({ items: [] }))

        if (!categoriesResponse.ok) {
          throw new Error(categoriesData?.error || categoriesData?.message || "No se pudieron cargar las categorías.")
        }

        if (!suppliersResponse.ok) {
          throw new Error(suppliersData?.error || suppliersData?.message || "No se pudieron cargar los proveedores.")
        }

        if (ignore) return

        setCategories(categoriesData.items || [])
        setSuppliers(suppliersData.items || [])
      } catch (err: any) {
        if (!ignore) {
          setError(err.message || "No se pudo cargar la vista de proveedores.")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = window.setInterval(() => {
      setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
    }, 5500)

    return () => window.clearInterval(interval)
  }, [])

  const featuredSuppliers = useMemo(() => {
    const featured = suppliers.filter((supplier) => supplier.is_featured)
    return featured.length > 0 ? featured : suppliers.slice(0, 8)
  }, [suppliers])

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      (supplier) => supplierMatchesCategory(supplier, selectedCategoryId) && supplierMatchesSearch(supplier, searchQuery)
    )
  }, [suppliers, selectedCategoryId, searchQuery])

  const activeCategoryName = selectedCategoryId
    ? categories.find((category) => category.id === selectedCategoryId)?.name || "Categoría"
    : "Todos los proveedores"

  return (
    <div className="min-h-screen bg-[#FCFAF4]">
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
<button
  type="button"
  onClick={scrollToTop}
  aria-label="Ir al inicio"
  className="flex items-center gap-2 cursor-pointer select-none rounded-xl px-2 py-1 hover:bg-[#F3E7C9]/40 transition-colors"
>
  <span className="text-xl font-bold text-[#0E5A6B]">LinkCom.mx</span>
</button>

            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Buscar proveedores, productos, categorías..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all"
                />
              </div>
            </div>

<div className="flex items-center gap-2">
  <Link href="/chat" className="p-2.5 rounded-xl hover:bg-[#F3E7C9]/50 transition-colors relative">
    <MessageCircle className="w-5 h-5 text-[#1F2937]" />
    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0E5A6B] rounded-full" />
  </Link>
<Link
  href="/perfil"
  className="hidden md:flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-[#F3E7C9]/50 transition-colors"
>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0E5A6B] text-sm font-semibold text-white">
                  {userProfile.name.slice(0, 1).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[#1F2937]">{userProfile.name.split(" ")[0]}</span>
</Link>
              <button
                onClick={() => setSideMenuOpen(true)}
                className="p-2.5 rounded-xl hover:bg-[#F3E7C9]/50 transition-colors"
              >
                <Menu className="w-5 h-5 text-[#1F2937]" />
              </button>
            </div>
          </div>

          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Buscar proveedores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all text-sm"
              />
            </div>
          </div>
        </div>
      </header>

      {sideMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSideMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-[#0E5A6B] px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10 text-lg font-semibold text-white">
                    {userProfile.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{userProfile.name}</p>
                    <p className="text-sm text-white/70">{userProfile.company || "LinkCom"}</p>
                  </div>
                </div>
                <button onClick={() => setSideMenuOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-1">
<MenuItem
  icon={User}
  label="Mi cuenta"
  href="/perfil"
  onClick={() => setSideMenuOpen(false)}
/>              <MenuItem
  icon={FileText}
  label="Solicitudes especiales"
  href="/forms"
  onClick={() => setSideMenuOpen(false)}
/>
              <MenuItem icon={MessageCircle} label="Chat" href="/chat" onClick={() => setSideMenuOpen(false)} />
              <MenuItem icon={BookOpen} label="Asesoramiento y talleres" href="/learning" onClick={() => setSideMenuOpen(false)} />

              <div className="pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main>
        <section className="relative">
          <div className="relative h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentBanner ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-lg">
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 text-balance">
                        {banner.title}
                      </h2>
                      <p className="text-lg md:text-xl text-white/90 mb-6">
                        {banner.subtitle}
                      </p>
<button
  type="button"
  onClick={scrollToSuppliers}
  className="inline-flex px-6 py-3 bg-[#0E5A6B] text-white rounded-xl font-medium hover:bg-[#0E5A6B]/90 transition-all shadow-lg"
>
  {banner.cta}
</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentBanner ? "bg-white w-8" : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors hidden md:flex"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors hidden md:flex"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </section>

        <section className="py-8 md:py-12 bg-[#FCFAF4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
                {error}
              </div>
            ) : null}

            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937]">Destacados</h2>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-[380px] animate-pulse rounded-[24px] border border-[#E5E7EB] bg-white" />
                ))}
              </div>
            ) : (
              <FeaturedSuppliersMarquee suppliers={featuredSuppliers} />
            )}
          </div>
        </section>

<section ref={suppliersSectionRef} className="pb-14 pt-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937]">{activeCategoryName}</h2>
                <p className="mt-2 text-sm text-[#6B7280]">
                  {selectedCategoryId
                    ? "Mostrando proveedores de la categoría seleccionada."
                    : "Mostrando todos los proveedores disponibles en la plataforma."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId("")}
                  className={`px-4 py-2 md:px-5 md:py-2.5 rounded-full border text-sm md:text-base font-medium transition-all shadow-sm ${
                    !selectedCategoryId
                      ? "border-[#0E5A6B] bg-[#0E5A6B] text-white"
                      : "bg-white border-[#E5E7EB] text-[#1F2937] hover:border-[#0E5A6B] hover:text-[#0E5A6B]"
                  }`}
                >
                  Todos
                </button>

                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`px-4 py-2 md:px-5 md:py-2.5 rounded-full border text-sm md:text-base font-medium transition-all shadow-sm ${
                      selectedCategoryId === category.id
                        ? "border-[#0E5A6B] bg-[#0E5A6B] text-white"
                        : "bg-white border-[#E5E7EB] text-[#1F2937] hover:border-[#0E5A6B] hover:text-[#0E5A6B]"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-[360px] animate-pulse rounded-[24px] border border-[#E5E7EB] bg-white" />
                ))}
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#D1D5DB] bg-white p-10 text-center">
                <h3 className="text-lg font-semibold text-[#1F2937]">No encontramos proveedores</h3>
                <p className="mt-2 text-sm text-[#6B7280]">
                  Prueba quitando filtros o cambiando el texto de búsqueda.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId("")}
                    className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#1F2937] hover:bg-[#F3E7C9]/30"
                  >
                    Limpiar categoría
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="rounded-xl bg-[#0E5A6B] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0B4855]"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredSuppliers.map((supplier) => (
                  <SupplierCard key={supplier.id} supplier={supplier} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-[#0E5A6B] text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LinkCom.mx</h3>
              <p className="text-white/70 text-sm">
                La plataforma líder para conectar con proveedores mayoristas en México.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-white/70">
<li>
  <button
    type="button"
    onClick={scrollToTop}
    aria-label="Subir al inicio"
    className="inline-flex cursor-pointer hover:text-white transition-colors"
  >
    Inicio
  </button>
</li>
                <li><Link href="/learning" className="hover:text-white transition-colors">Talleres</Link></li>
                <li><Link href="/chat" className="hover:text-white transition-colors">Chat</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/50">
            © 2026 LinkCom.mx. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
