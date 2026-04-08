"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Video as VideoIcon,
  X,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"

type AdminVideoSection = {
  id: string
  name: string
  slug: string
  description?: string | null
  section_type: string
  display_order: number
  is_active: boolean
  videos_count?: number
}

type AdminVideo = {
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
  sections: AdminVideoSection[]
}

type UploadDraft = {
  key: string
  file: File
  title: string
  description: string
  section_ids: string[]
}

type ConfirmDialogState = {
  title: string
  description: string
  confirmText: string
  tone?: "danger" | "primary"
  onConfirm: () => void
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

function mediaUrl(value?: string | null) {
  if (!value) return ""
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  return `${API_URL.replace(/\/api$/, "")}${value}`
}

function fileNameToTitle(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "").trim() || "Video"
}

function toggleId(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

function SectionSelector({
  sections,
  value,
  onChange,
}: {
  sections: AdminVideoSection[]
  value: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {sections.map((section) => {
        const active = value.includes(section.id)

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(toggleId(value, section.id))}
            className={`px-3 py-2 rounded-xl border text-left transition-colors ${
              active
                ? "border-[#0E5A6B] bg-[#0E5A6B]/10 text-[#0E5A6B]"
                : "border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F3E7C9]/30"
            }`}
          >
            <div className="font-medium text-sm">{section.name}</div>
            {section.description ? (
              <div className="text-xs opacity-70 mt-1 line-clamp-2">{section.description}</div>
            ) : null}
          </button>
        )
      })}
    </div>
  )
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

export default function VideosWorkshopsContent() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [sections, setSections] = useState<AdminVideoSection[]>([])
  const [videos, setVideos] = useState<AdminVideo[]>([])

  const [selectedSectionId, setSelectedSectionId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const [sectionName, setSectionName] = useState("")
  const [sectionDescription, setSectionDescription] = useState("")
  const [savingSection, setSavingSection] = useState(false)

  const [uploadQueue, setUploadQueue] = useState<UploadDraft[]>([])
  const [savingUploads, setSavingUploads] = useState(false)

  const [editingVideoId, setEditingVideoId] = useState("")
  const [videoEditor, setVideoEditor] = useState<{
    id: string
    title: string
    description: string
    section_ids: string[]
  }>({
    id: "",
    title: "",
    description: "",
    section_ids: [],
  })

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)
  const [deletingSectionId, setDeletingSectionId] = useState("")
  const [deletingVideoId, setDeletingVideoId] = useState("")

  async function loadAll() {
    try {
      setLoading(true)
      setError("")

      const [sectionsRes, videosRes] = await Promise.all([
        apiJson("/admin/video-sections"),
        apiJson("/admin/videos"),
      ])

      setSections(sectionsRes.items || [])
      setVideos(videosRes.items || [])
    } catch (err: any) {
      setError(err.message || "No se pudo cargar videos y talleres.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  function handleIncomingFiles(fileList: FileList | null) {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith("video/"))
    if (!files.length) return

    setUploadQueue((prev) => [
      ...prev,
      ...files.map((file) => ({
        key: `${file.name}-${file.size}-${Math.random()}`,
        file,
        title: fileNameToTitle(file.name),
        description: "",
        section_ids: selectedSectionId ? [selectedSectionId] : [],
      })),
    ])
  }

  async function handleCreateSection() {
    const name = sectionName.trim()
    const description = sectionDescription.trim()

    if (!name) {
      setError("El nombre de la sección es obligatorio.")
      return
    }

    try {
      setSavingSection(true)
      setError("")

      const res = await apiJson("/admin/video-sections", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
        }),
      })

      const created = res.section as AdminVideoSection

      setSections((prev) => [created, ...prev])
      setSectionName("")
      setSectionDescription("")
      setSelectedSectionId(created.id)
    } catch (err: any) {
      setError(err.message || "No se pudo crear la sección.")
    } finally {
      setSavingSection(false)
    }
  }

  function closeConfirmDialog() {
    setConfirmDialog(null)
  }

  async function executeDeleteSection(sectionId: string) {
    try {
      setDeletingSectionId(sectionId)
      setError("")
      await apiJson(`/admin/video-sections/${sectionId}`, {
        method: "DELETE",
      })

      if (selectedSectionId === sectionId) {
        setSelectedSectionId("")
      }

      await loadAll()
    } catch (err: any) {
      setError(err.message || "No se pudo eliminar la sección.")
    } finally {
      setDeletingSectionId("")
    }
  }

  function handleDeleteSection(sectionId: string, sectionName: string) {
    setConfirmDialog({
      title: "Eliminar sección",
      description: `Vas a eliminar la sección "${sectionName}". Los videos no se borran, solo se desacoplan de esa sección.`,
      confirmText: "Sí, eliminar",
      tone: "danger",
      onConfirm: () => {
        closeConfirmDialog()
        void executeDeleteSection(sectionId)
      },
    })
  }

  async function handleSaveUploads() {
    if (!uploadQueue.length) {
      setError("No hay videos en cola para subir.")
      return
    }

    for (const item of uploadQueue) {
      if (!item.section_ids.length) {
        setError(`El video "${item.file.name}" debe pertenecer a al menos una sección.`)
        return
      }
    }

    try {
      setSavingUploads(true)
      setError("")

      for (const item of uploadQueue) {
        const formData = new FormData()
        formData.append("video", item.file)
        formData.append("title", item.title.trim())
        formData.append("description", item.description.trim())
        formData.append("section_ids", JSON.stringify(item.section_ids))

        await apiForm("/admin/videos", formData, "POST")
      }

      setUploadQueue([])
      await loadAll()
    } catch (err: any) {
      setError(err.message || "No se pudieron subir los videos.")
    } finally {
      setSavingUploads(false)
    }
  }

  function startEditVideo(video: AdminVideo) {
    setEditingVideoId(video.id)
    setVideoEditor({
      id: video.id,
      title: video.title || "",
      description: video.description || "",
      section_ids: video.section_ids || [],
    })
  }

  function cancelEditVideo() {
    setEditingVideoId("")
    setVideoEditor({
      id: "",
      title: "",
      description: "",
      section_ids: [],
    })
  }

  async function handleSaveVideoEdit() {
    if (!videoEditor.id) return

    if (!videoEditor.title.trim()) {
      setError("El título del video es obligatorio.")
      return
    }

    if (!videoEditor.section_ids.length) {
      setError("El video debe pertenecer a al menos una sección.")
      return
    }

    try {
      setError("")

      const formData = new FormData()
      formData.append("title", videoEditor.title.trim())
      formData.append("description", videoEditor.description.trim())
      formData.append("section_ids", JSON.stringify(videoEditor.section_ids))

      await apiForm(`/admin/videos/${videoEditor.id}`, formData, "PATCH")

      cancelEditVideo()
      await loadAll()
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar el video.")
    }
  }

  async function executeDeleteVideo(videoId: string) {
    try {
      setDeletingVideoId(videoId)
      setError("")
      await apiJson(`/admin/videos/${videoId}`, {
        method: "DELETE",
      })

      if (editingVideoId === videoId) {
        cancelEditVideo()
      }

      await loadAll()
    } catch (err: any) {
      setError(err.message || "No se pudo eliminar el video.")
    } finally {
      setDeletingVideoId("")
    }
  }

  function handleDeleteVideo(videoId: string, title: string) {
    setConfirmDialog({
      title: "Eliminar video",
      description: `Vas a eliminar "${title}". Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
      tone: "danger",
      onConfirm: () => {
        closeConfirmDialog()
        void executeDeleteVideo(videoId)
      },
    })
  }
  const filteredVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return videos.filter((video) => {
      const matchesSection = !selectedSectionId || video.section_ids.includes(selectedSectionId)
      if (!matchesSection) return false

      if (!q) return true

      const sectionsText = (video.sections || []).map((section) => section.name).join(" ").toLowerCase()

      return (
        (video.title || "").toLowerCase().includes(q) ||
        (video.description || "").toLowerCase().includes(q) ||
        sectionsText.includes(q)
      )
    })
  }, [videos, selectedSectionId, searchQuery])

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6">
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[#0E5A6B]" />
            <h3 className="text-lg font-semibold text-[#1F2937]">Secciones</h3>
          </div>

          <div className="space-y-3">
            <input
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="Nombre de la sección"
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20"
            />

            <textarea
              value={sectionDescription}
              onChange={(e) => setSectionDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20"
            />

            <button
              type="button"
              onClick={handleCreateSection}
              disabled={savingSection}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E5A6B] text-white px-4 py-3 font-medium hover:bg-[#0B4855] transition-colors disabled:opacity-70"
            >
              {savingSection ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Crear sección
            </button>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelectedSectionId("")}
              className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${
                !selectedSectionId
                  ? "border-[#0E5A6B] bg-[#0E5A6B]/10 text-[#0E5A6B]"
                  : "border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937]"
              }`}
            >
              Todas las secciones
            </button>

            {sections.map((section) => {
              const active = selectedSectionId === section.id

              return (
                <div
                  key={section.id}
                  className={`rounded-xl border px-3 py-3 ${
                    active ? "border-[#0E5A6B] bg-[#0E5A6B]/10" : "border-[#E5E7EB] bg-[#FCFAF4]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedSectionId(section.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-[#1F2937]">{section.name}</div>
                        {section.description ? (
                          <div className="text-sm text-[#6B7280] mt-1 line-clamp-2">{section.description}</div>
                        ) : null}
                        <div className="text-xs text-[#6B7280] mt-2">
                          {section.videos_count ?? 0} video(s)
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id, section.name)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937]">Subir videos</h3>
                <p className="text-sm text-[#6B7280]">
                  Arrastra videos o selecciónalos. El título se autocompleta con el nombre del archivo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E5A6B] text-white px-4 py-3 font-medium hover:bg-[#0B4855] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Elegir videos
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleIncomingFiles(e.target.files)
                e.currentTarget.value = ""
              }}
            />

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                handleIncomingFiles(e.dataTransfer.files)
              }}
              className="rounded-2xl border-2 border-dashed border-[#D1D5DB] bg-[#FCFAF4] p-8 text-center"
            >
              <VideoIcon className="w-10 h-10 text-[#0E5A6B] mx-auto mb-3" />
              <p className="font-medium text-[#1F2937]">Arrastra aquí tus videos</p>
              <p className="text-sm text-[#6B7280] mt-1">o usa el botón para seleccionarlos desde tu computadora</p>
            </div>

            {uploadQueue.length ? (
              <div className="mt-5 space-y-4">
                {uploadQueue.map((item) => (
                  <div key={item.key} className="rounded-2xl border border-[#E5E7EB] p-4 bg-[#FCFAF4]">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="font-medium text-[#1F2937] truncate">{item.file.name}</div>
                        <div className="text-xs text-[#6B7280] mt-1">
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setUploadQueue((prev) => prev.filter((row) => row.key !== item.key))}
                        className="p-2 rounded-lg hover:bg-white"
                      >
                        <X className="w-4 h-4 text-[#6B7280]" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-3">
                      <input
                        value={item.title}
                        onChange={(e) =>
                          setUploadQueue((prev) =>
                            prev.map((row) => (row.key === item.key ? { ...row, title: e.target.value } : row))
                          )
                        }
                        placeholder="Título"
                        className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20"
                      />

                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          setUploadQueue((prev) =>
                            prev.map((row) => (row.key === item.key ? { ...row, description: e.target.value } : row))
                          )
                        }
                        rows={3}
                        placeholder="Descripción opcional"
                        className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20"
                      />
                    </div>

                    <SectionSelector
                      sections={sections}
                      value={item.section_ids}
                      onChange={(next) =>
                        setUploadQueue((prev) =>
                          prev.map((row) => (row.key === item.key ? { ...row, section_ids: next } : row))
                        )
                      }
                    />
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setUploadQueue([])}
                    className="px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] font-medium hover:bg-[#F3E7C9]/30 transition-colors"
                  >
                    Limpiar cola
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveUploads}
                    disabled={savingUploads}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0E5A6B] text-white font-medium hover:bg-[#0B4855] transition-colors disabled:opacity-70"
                  >
                    {savingUploads ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Subir videos
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937]">Videos cargados</h3>
                <p className="text-sm text-[#6B7280]">Edita título, descripción y secciones; o elimina el video.</p>
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar video..."
                  className="w-full rounded-xl border border-[#E5E7EB] pl-9 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#0E5A6B]" />
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#FCFAF4] p-10 text-center text-[#6B7280]">
                No hay videos para mostrar.
              </div>
            ) : (
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                {filteredVideos.map((video) => {
                  const editing = editingVideoId === video.id

                  return (
                    <div key={video.id} className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-[#FCFAF4]">
                      <video
                        src={mediaUrl(video.video_url)}
                        controls
                        className="w-full bg-black aspect-video"
                      />

                      <div className="p-4 space-y-4">
                        {editing ? (
                          <>
                            <input
                              value={videoEditor.title}
                              onChange={(e) => setVideoEditor((prev) => ({ ...prev, title: e.target.value }))}
                              placeholder="Título"
                              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20"
                            />

                            <textarea
                              value={videoEditor.description}
                              onChange={(e) => setVideoEditor((prev) => ({ ...prev, description: e.target.value }))}
                              rows={4}
                              placeholder="Descripción opcional"
                              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20"
                            />

                            <SectionSelector
                              sections={sections}
                              value={videoEditor.section_ids}
                              onChange={(next) => setVideoEditor((prev) => ({ ...prev, section_ids: next }))}
                            />

                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                type="button"
                                onClick={cancelEditVideo}
                                className="px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1F2937] font-medium hover:bg-[#F3E7C9]/30 transition-colors"
                              >
                                Cancelar
                              </button>

                              <button
                                type="button"
                                onClick={handleSaveVideoEdit}
                                className="px-4 py-3 rounded-xl bg-[#0E5A6B] text-white font-medium hover:bg-[#0B4855] transition-colors"
                              >
                                Guardar cambios
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <h4 className="text-lg font-semibold text-[#1F2937]">{video.title}</h4>
                              {video.description ? (
                                <p className="text-sm text-[#6B7280] mt-2 whitespace-pre-line">{video.description}</p>
                              ) : null}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {(video.sections || []).map((section) => (
                                <span
                                  key={section.id}
                                  className="px-3 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs text-[#1F2937]"
                                >
                                  {section.name}
                                </span>
                              ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                type="button"
                                onClick={() => startEditVideo(video)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0E5A6B] text-white font-medium hover:bg-[#0B4855] transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteVideo(video.id, video.title)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title || ""}
        description={confirmDialog?.description || ""}
        confirmText={confirmDialog?.confirmText || "Continuar"}
        tone={confirmDialog?.tone || "danger"}
        loading={Boolean(deletingSectionId || deletingVideoId)}
        onCancel={closeConfirmDialog}
        onConfirm={() => confirmDialog?.onConfirm()}
      />
    </div>
  )
}