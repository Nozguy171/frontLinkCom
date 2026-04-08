"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Play,
  X,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"

type VideoSection = {
  id: string
  name: string
  slug: string
  description?: string | null
  section_type: string
  display_order: number
  is_active: boolean
}

type VideoSectionSummary = {
  id: string
  name: string
  slug: string
  description?: string | null
  section_type: string
  display_order: number
  is_active: boolean
}

type LearningVideo = {
  id: string
  supplier_id?: string | null
  title: string
  description?: string | null
  thumbnail_url?: string | null
  video_url: string
  duration?: string | null
  view_count: number
  display_order: number
  is_active: boolean
  created_at?: string | null
  section_ids: string[]
  sections: VideoSectionSummary[]
}

function mediaUrl(value?: string | null) {
  if (!value) return ""
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  return `${API_URL.replace(/\/api$/, "")}${value}`
}

function normalizeText(value?: string | null) {
  return (value || "").trim().toLowerCase()
}

function getVideoPreviewMode(sectionType?: string | null) {
  const value = normalizeText(sectionType)

  if (["short", "shorts", "reel", "reels"].includes(value)) {
    return {
      isVertical: true,
      cardWidth: "w-[240px] md:w-[280px] xl:w-[300px]",
      previewClass: "aspect-[9/16]",
      scrollAmount: 300,
    }
  }

  return {
    isVertical: false,
    cardWidth: "w-[420px] md:w-[520px] xl:w-[580px]",
    previewClass: "aspect-[16/9]",
    scrollAmount: 520,
  }
}

export default function LearningPage() {
  const [sections, setSections] = useState<VideoSection[]>([])
  const [videos, setVideos] = useState<LearningVideo[]>([])
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const currentVideo = useMemo(
    () => videos.find((video) => video.id === activeVideoId) || null,
    [videos, activeVideoId]
  )

  useEffect(() => {
    let ignore = false

    async function loadData() {
      try {
        setLoading(true)
        setError("")

        const [sectionsResponse, videosResponse] = await Promise.all([
          fetch(`${API_URL}/video-sections`, { cache: "no-store" }),
          fetch(`${API_URL}/videos`, { cache: "no-store" }),
        ])

        const sectionsData = await sectionsResponse.json().catch(() => ({ items: [] }))
        const videosData = await videosResponse.json().catch(() => ({ items: [] }))

        if (!sectionsResponse.ok) {
          throw new Error(sectionsData?.error || sectionsData?.message || "No se pudieron cargar las secciones.")
        }

        if (!videosResponse.ok) {
          throw new Error(videosData?.error || videosData?.message || "No se pudieron cargar los videos.")
        }

        if (ignore) return

        setSections(sectionsData.items || [])
        setVideos(videosData.items || [])
      } catch (err: any) {
        if (!ignore) {
          setError(err.message || "No se pudo cargar el contenido de talleres.")
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
    if (!activeVideoId) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveVideoId(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeVideoId])

  const sectionsWithVideos = useMemo(() => {
    return sections
      .map((section) => {
        const relatedVideos = videos
          .filter((video) => {
            if (video.section_ids?.includes(section.id)) return true

            return (video.sections || []).some((item) => {
              return item.id === section.id || normalizeText(item.slug) === normalizeText(section.slug)
            })
          })
          .sort((a, b) => {
            if (a.display_order !== b.display_order) {
              return a.display_order - b.display_order
            }
            return (b.created_at || "").localeCompare(a.created_at || "")
          })

        return {
          section,
          videos: relatedVideos,
        }
      })
      .filter((entry) => entry.videos.length > 0)
  }, [sections, videos])

  return (
    <div className="min-h-screen bg-[#FCFAF4]">
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/home"
                className="rounded-xl p-2 transition-colors hover:bg-[#F3E7C9]/50"
              >
                <ArrowLeft className="h-5 w-5 text-[#1F2937]" />
              </Link>
              <span className="text-xl font-bold text-[#0E5A6B]">Asesoramiento y Talleres</span>
            </div>
          </div>
        </div>
      </header>

      {activeVideoId && currentVideo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative flex items-center justify-center bg-black p-2 sm:p-4">
              <video
                src={mediaUrl(currentVideo.video_url)}
                poster={mediaUrl(currentVideo.thumbnail_url)}
                controls
                autoPlay
                playsInline
                className="max-h-[70vh] w-full object-contain bg-black"
              />
              <button
                onClick={() => setActiveVideoId(null)}
                className="absolute right-4 top-4 rounded-full bg-black/60 p-2 transition-colors hover:bg-black/80"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto p-6">
              {currentVideo.duration ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm text-[#6B7280]">
                    <Clock className="h-4 w-4" />
                    {currentVideo.duration}
                  </span>
                </div>
              ) : null}

              <h2 className="text-2xl font-bold text-[#1F2937]">{currentVideo.title}</h2>

              {currentVideo.description ? (
                <p className="text-[#6B7280]">{currentVideo.description}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <main className="py-8">
        <section className="mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#0E5A6B] p-8 text-white md:p-12">
            <h1 className="mb-4 text-2xl font-bold text-balance md:text-4xl">
              Aprende, crece y mejora tu negocio
            </h1>
            <p className="mb-6 max-w-2xl text-lg text-white/80">
              Videos, talleres y recursos para emprendedores. Desde tips rápidos hasta talleres completos sobre negocios, proveedores y ventas.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">Videos</span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">Talleres</span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">Consejos prácticos</span>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex items-center justify-center gap-3 text-[#0E5A6B]">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-medium">Cargando talleres...</span>
            </div>
          </div>
        ) : sectionsWithVideos.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-dashed border-[#D1D5DB] bg-white p-10 text-center">
              <h3 className="text-lg font-semibold text-[#1F2937]">Todavía no hay talleres disponibles</h3>
              <p className="mt-2 text-sm text-[#6B7280]">
                En cuanto suban videos y los asignen a secciones, van a aparecer aquí.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {sectionsWithVideos.map(({ section, videos: sectionVideos }) => (
              <LearningVideoSection
                key={section.id}
                section={section}
                videos={sectionVideos}
                onVideoClick={setActiveVideoId}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="mt-12 bg-[#0E5A6B] py-8 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-white/70">© 2026 LinkCom.mx. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

function LearningVideoSection({
  section,
  videos,
  onVideoClick,
}: {
  section: VideoSection
  videos: LearningVideo[]
  onVideoClick: (id: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const previewMode = getVideoPreviewMode(section.section_type)

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return

    scrollRef.current.scrollBy({
      left: direction === "left" ? -previewMode.scrollAmount : previewMode.scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <section className="relative">
      <div className="mb-4 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl font-bold text-[#1F2937] md:text-2xl">{section.name}</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            {section.description ||
              (previewMode.isVertical
                ? "Videos rápidos para aprender algo puntual."
                : "Talleres y cursos con mayor detalle.")}
          </p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={() => scroll("left")}
            className="rounded-lg border border-[#E5E7EB] p-2 transition-colors hover:border-[#0E5A6B] hover:text-[#0E5A6B]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-lg border border-[#E5E7EB] p-2 transition-colors hover:border-[#0E5A6B] hover:text-[#0E5A6B]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 md:gap-6 lg:px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => onVideoClick(video.id)}
            className={`group flex-shrink-0 snap-start text-left ${previewMode.cardWidth}`}
          >
            <div className="flex h-full flex-col">
              <div
                className={`relative overflow-hidden rounded-3xl bg-[#020617] shadow-md ${previewMode.previewClass}`}
              >
                {video.thumbnail_url ? (
                  <img
                    src={mediaUrl(video.thumbnail_url)}
                    alt={video.title}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <video
                    src={mediaUrl(video.video_url)}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                )}

                <div className="absolute inset-0 bg-black/18 transition-colors group-hover:bg-black/30" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors group-hover:bg-white/30 ${
                      previewMode.isVertical ? "h-14 w-14 md:h-16 md:w-16" : "h-16 w-16 md:h-20 md:w-20"
                    }`}
                  >
                    <Play
                      className={`fill-white text-white ${
                        previewMode.isVertical ? "h-6 w-6 md:h-7 md:w-7" : "h-7 w-7 md:h-9 md:w-9"
                      }`}
                    />
                  </div>
                </div>

                {video.duration ? (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
                    <Clock className="h-3 w-3" />
                    {video.duration}
                  </div>
                ) : null}
              </div>

              <div className="mt-3 flex min-h-[118px] flex-col px-1">
                <h3 className="line-clamp-2 text-lg font-semibold text-[#1F2937] transition-colors group-hover:text-[#0E5A6B]">
                  {video.title}
                </h3>

                {video.description ? (
                  <p className="mt-2 line-clamp-2 min-h-[48px] text-sm text-[#6B7280]">
                    {video.description}
                  </p>
                ) : null}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
