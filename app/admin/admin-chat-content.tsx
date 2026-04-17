"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  MessageCircle,
  Pencil,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"
const CHAT_API_URL = `${API_URL}/chat`

type AdminChatJump = {
  conversationId: string
  token: number
} | null

type ChatUser = {
  id: string
  name?: string | null
  email?: string | null
}

type ChatMessage = {
  id: string
  conversation_id: string
  sender_user_id?: string | null
  sender_role: "admin" | "user"
  content: string
  is_read: boolean
  is_edited?: boolean
  edited_at?: string | null
  is_deleted?: boolean
  deleted_at?: string | null
  created_at?: string | null
  sender?: ChatUser | null
}

type ChatConversation = {
  id: string
  user_id: string
  assigned_admin_id?: string | null
  last_message_at?: string | null
  created_at?: string | null
  user?: ChatUser | null
  assigned_admin?: ChatUser | null
  last_message?: ChatMessage | null
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

async function chatJson(path: string, options: RequestInit = {}) {
  const token = getToken()

  const response = await fetch(`${CHAT_API_URL}${path}`, {
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

function formatDate(value?: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function conversationLabel(item?: ChatConversation | null) {
  if (!item) return "Usuario"
  return item.user?.name || item.user?.email || "Usuario"
}

function conversationSubLabel(item?: ChatConversation | null) {
  if (!item) return ""
  return item.user?.email || ""
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
    <div className="fixed inset-0 z-[90]">
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

export default function AdminChatContent({
  chatJump,
}: {
  chatJump?: AdminChatJump
}) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState("")
  const [search, setSearch] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingMessageId, setDeletingMessageId] = useState("")
  const [error, setError] = useState("")
  const [editingMessageId, setEditingMessageId] = useState("")
  const [editingContent, setEditingContent] = useState("")
  const [mobileListVisible, setMobileListVisible] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)

  const conversationsPollingRef = useRef(false)
  const messagesPollingRef = useRef(false)

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  )

  function isPageVisible() {
    if (typeof document === "undefined") return true
    return document.visibilityState === "visible"
  }

  function isDesktopViewport() {
    if (typeof window === "undefined") return false
    return window.matchMedia("(min-width: 768px)").matches
  }

  function isMessagePaneOpen() {
    return isDesktopViewport() || !mobileListVisible
  }

  async function fetchConversations(silent = false) {
    if (!silent) {
      setLoadingConversations(true)
      setError("")
    }

    try {
      const data = await chatJson("/conversations")
      const items = (data.items || []) as ChatConversation[]

      setConversations(items)
      setSelectedConversationId((current) => {
        if (!items.length) return ""
        if (current && items.some((item) => item.id === current)) return current
        return items[0].id
      })
    } catch (err: any) {
      if (!silent) {
        setError(err.message || "No se pudieron cargar las conversaciones.")
      } else {
        console.error("Admin chat polling conversations error:", err)
      }
    } finally {
      if (!silent) {
        setLoadingConversations(false)
      }
    }
  }

  async function fetchMessages(
    conversationId: string,
    options?: {
      silent?: boolean
      markRead?: boolean
    }
  ) {
    if (!conversationId) {
      setMessages([])
      return
    }

    const silent = options?.silent ?? false
    const markRead = options?.markRead ?? false

    if (!silent) {
      setLoadingMessages(true)
      setError("")
    }

    try {
      const data = await chatJson(`/conversations/${conversationId}/messages`)
      setMessages(data.items || [])

      if (markRead) {
        await chatJson(`/conversations/${conversationId}/read`, {
          method: "PATCH",
        }).catch(() => null)
      }
    } catch (err: any) {
      if (!silent) {
        setError(err.message || "No se pudieron cargar los mensajes.")
      } else {
        console.error("Admin chat polling messages error:", err)
      }
    } finally {
      if (!silent) {
        setLoadingMessages(false)
      }
    }
  }

  async function refreshChatData() {
    if (!isPageVisible()) return
    if (conversationsPollingRef.current || messagesPollingRef.current) return

    try {
      conversationsPollingRef.current = true
      await fetchConversations(true)
    } finally {
      conversationsPollingRef.current = false
    }

    if (!selectedConversationId) return

    try {
      messagesPollingRef.current = true
      await fetchMessages(selectedConversationId, {
        silent: true,
        markRead: isMessagePaneOpen(),
      })
    } finally {
      messagesPollingRef.current = false
    }
  }

  useEffect(() => {
    void fetchConversations(false)
  }, [])

  useEffect(() => {
    if (!selectedConversationId) return
    void fetchMessages(selectedConversationId, {
      silent: false,
      markRead: isMessagePaneOpen(),
    })
  }, [selectedConversationId])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshChatData()
    }, 500)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [selectedConversationId, mobileListVisible])

  useEffect(() => {
    if (!chatJump?.conversationId) return
    setSelectedConversationId(chatJump.conversationId)
    setMobileListVisible(false)
  }, [chatJump?.token])

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations

    return conversations.filter((item) => {
      const userName = conversationLabel(item).toLowerCase()
      const userEmail = conversationSubLabel(item).toLowerCase()
      const lastMessage = (item.last_message?.content || "").toLowerCase()

      return userName.includes(q) || userEmail.includes(q) || lastMessage.includes(q)
    })
  }, [conversations, search])

  function startEditMessage(message: ChatMessage) {
    if (message.is_deleted) return
    setEditingMessageId(message.id)
    setEditingContent(message.content || "")
  }

  function cancelEditMessage() {
    setEditingMessageId("")
    setEditingContent("")
  }

  async function handleSaveEditedMessage() {
    if (!editingMessageId) return

    if (!editingContent.trim()) {
      setError("El contenido no puede ir vacío.")
      return
    }

    try {
      setSavingEdit(true)
      setError("")

      await chatJson(`/messages/${editingMessageId}`, {
        method: "PATCH",
        body: JSON.stringify({
          content: editingContent.trim(),
        }),
      })

      cancelEditMessage()
      if (selectedConversationId) {
        await fetchMessages(selectedConversationId, {
          silent: false,
          markRead: true,
        })
        await fetchConversations(true)
      }
    } catch (err: any) {
      setError(err.message || "No se pudo editar el mensaje.")
    } finally {
      setSavingEdit(false)
    }
  }

  async function executeDeleteMessage(messageId: string) {
    try {
      setDeletingMessageId(messageId)
      setError("")

      await chatJson(`/messages/${messageId}`, {
        method: "DELETE",
      })

      if (editingMessageId === messageId) {
        cancelEditMessage()
      }

      if (selectedConversationId) {
        await fetchMessages(selectedConversationId, {
          silent: false,
          markRead: true,
        })
        await fetchConversations(true)
      }
    } catch (err: any) {
      setError(err.message || "No se pudo eliminar el mensaje.")
    } finally {
      setDeletingMessageId("")
    }
  }

  function handleDeleteMessage(message: ChatMessage) {
    setConfirmDialog({
      title: "Eliminar mensaje",
      description: "Se reemplazará por el texto de eliminación del administrador.",
      confirmText: "Sí, eliminar",
      tone: "danger",
      onConfirm: () => {
        setConfirmDialog(null)
        void executeDeleteMessage(message.id)
      },
    })
  }

  async function handleSendMessage() {
    if (!selectedConversationId || !newMessage.trim()) return

    try {
      setSending(true)
      setError("")

      await chatJson(`/conversations/${selectedConversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      })

      setNewMessage("")
      await fetchMessages(selectedConversationId, {
        silent: false,
        markRead: true,
      })
      await fetchConversations(true)
    } catch (err: any) {
      setError(err.message || "No se pudo enviar el mensaje.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-[calc(100vh-9rem)] bg-[#FCFAF4] rounded-2xl border border-[#E5E7EB] overflow-hidden flex min-h-0">
      <div
        className={`${mobileListVisible ? "flex" : "hidden"} md:flex w-full md:w-80 lg:w-96 bg-white border-r border-[#E5E7EB] flex-col min-h-0`}
      >
        <div className="p-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-8 text-center text-[#6B7280]">
              <div className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando conversaciones...
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8 text-center text-[#6B7280]">
              No hay conversaciones.
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  setSelectedConversationId(conversation.id)
                  setMobileListVisible(false)
                }}
                className={`w-full p-4 flex items-start gap-3 hover:bg-[#F3E7C9]/30 transition-colors border-b border-[#E5E7EB] text-left ${
                  selectedConversationId === conversation.id ? "bg-[#F3E7C9]/50" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F3E7C9]/50 flex items-center justify-center text-[#0E5A6B] shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-3">
                    <h3 className="font-semibold text-[#1F2937] truncate">{conversationLabel(conversation)}</h3>
                    <span className="text-xs text-[#6B7280] flex-shrink-0">
                      {conversation.last_message_at ? formatDate(conversation.last_message_at) : "—"}
                    </span>
                  </div>

                  <p className="text-xs text-[#6B7280] truncate">{conversationSubLabel(conversation)}</p>
                  <p className="text-sm text-[#6B7280] truncate mt-1">
                    {conversation.last_message?.content || "Sin mensajes todavía"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`${mobileListVisible ? "hidden" : "flex"} md:flex flex-1 flex-col min-w-0 min-h-0`}>
        {selectedConversation ? (
          <>
            <div className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setMobileListVisible(true)}
                className="md:hidden p-2 rounded-lg hover:bg-[#F3E7C9]/50 transition-colors -ml-2"
              >
                <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
              </button>

              <div className="w-10 h-10 rounded-xl bg-[#F3E7C9]/50 flex items-center justify-center text-[#0E5A6B] shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold text-[#1F2937] truncate">{conversationLabel(selectedConversation)}</h3>
                <p className="text-xs text-[#6B7280] truncate">{conversationSubLabel(selectedConversation)}</p>
              </div>
            </div>

            {error ? (
              <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="text-center text-[#6B7280] py-10">
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cargando mensajes...
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-[#6B7280] py-10">Todavía no hay mensajes.</div>
              ) : (
                messages.map((message) => {
                  const isAdminMessage = message.sender_role === "admin"

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAdminMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                          isAdminMessage
                            ? "bg-[#0E5A6B] text-white rounded-br-md"
                            : "bg-white border border-[#E5E7EB] text-[#1F2937] rounded-bl-md"
                        }`}
                      >
                        {editingMessageId === message.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditMessage}
                                disabled={savingEdit}
                                className="px-3 py-2 rounded-xl border border-white/20 bg-white text-[#1F2937] hover:bg-[#F3E7C9]/30 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleSaveEditedMessage()}
                                disabled={savingEdit}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B4855] text-white hover:bg-[#083640] transition-colors disabled:opacity-70"
                              >
                                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className={`text-sm leading-relaxed ${message.is_deleted ? "italic opacity-80" : ""}`}>
                              {message.content}
                            </p>

                            <div className={`text-xs mt-2 ${isAdminMessage ? "text-white/70" : "text-[#6B7280]"}`}>
                              {formatDate(message.created_at)}
                              {message.is_edited && !message.is_deleted ? " · editado" : ""}
                              {message.is_deleted ? " · eliminado" : ""}
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEditMessage(message)}
                                disabled={Boolean(message.is_deleted)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                  isAdminMessage
                                    ? "bg-white/10 hover:bg-white/20 text-white disabled:opacity-40"
                                    : "bg-[#FCFAF4] hover:bg-[#F3E7C9]/60 text-[#1F2937] disabled:opacity-40"
                                }`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(message)}
                                disabled={deletingMessageId === message.id}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                  isAdminMessage
                                    ? "bg-red-500/20 hover:bg-red-500/30 text-white"
                                    : "bg-red-50 hover:bg-red-100 text-red-700"
                                }`}
                              >
                                {deletingMessageId === message.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="bg-white border-t border-[#E5E7EB] p-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleSendMessage()}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all"
                />
                <button
                  onClick={() => void handleSendMessage()}
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-[#0E5A6B] text-white rounded-xl hover:bg-[#0E5A6B]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="w-20 h-20 bg-[#F3E7C9]/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-[#0E5A6B]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Chat de administración</h3>
              <p className="text-[#6B7280] max-w-sm">
                Selecciona una conversación desde la izquierda o abre una desde el apartado de usuarios.
              </p>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title || ""}
        description={confirmDialog?.description || ""}
        confirmText={confirmDialog?.confirmText || "Continuar"}
        tone={confirmDialog?.tone || "danger"}
        loading={Boolean(deletingMessageId)}
        onCancel={() => setConfirmDialog(null)}
        onConfirm={() => confirmDialog?.onConfirm()}
      />
    </div>
  )
}
