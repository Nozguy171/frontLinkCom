"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, MessageCircle, Search, Send } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:51783/api"
const CHAT_API_URL = `${API_URL}/chat`

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

function adminLabel(item?: ChatConversation | null) {
  if (!item) return "Soporte"
  return item.assigned_admin?.name || item.assigned_admin?.email || "Soporte"
}

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [search, setSearch] = useState("")
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [mobileListVisible, setMobileListVisible] = useState(true)

  const conversationsPollingRef = useRef(false)
  const messagesPollingRef = useRef(false)

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
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
        console.error("Chat polling conversations error:", err)
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
        console.error("Chat polling messages error:", err)
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

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations

    return conversations.filter((item) => {
      const adminName = adminLabel(item).toLowerCase()
      const adminEmail = (item.assigned_admin?.email || "").toLowerCase()
      const lastMessage = (item.last_message?.content || "").toLowerCase()

      return adminName.includes(q) || adminEmail.includes(q) || lastMessage.includes(q)
    })
  }, [conversations, search])

  async function handleSendMessage() {
    if (!newMessage.trim()) return

    try {
      setSending(true)
      setError("")

      if (!selectedConversationId) {
        const res = await chatJson("/conversations", {
          method: "POST",
          body: JSON.stringify({
            message: newMessage.trim(),
          }),
        })

        const conversationId = res?.conversation?.id
        setNewMessage("")
        await fetchConversations(true)

        if (conversationId) {
          setSelectedConversationId(conversationId)
          setMobileListVisible(false)
          await fetchMessages(conversationId, {
            silent: false,
            markRead: true,
          })
        }

        return
      }

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
    <div className="h-screen bg-[#FCFAF4] flex flex-col overflow-hidden">
      <header className="bg-white border-b border-[#E5E7EB] shadow-sm flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/home"
                className="p-2 rounded-xl hover:bg-[#F3E7C9]/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
              </Link>
              <span className="text-xl font-bold text-[#0E5A6B]">Chat</span>
            </div>
          </div>
        </div>
      </header>

      {error ? (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 flex-shrink-0">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      ) : null}

      <div className="flex-1 min-h-0 flex overflow-hidden w-full">
        <div
          className={`${mobileListVisible ? "flex" : "hidden md:flex"} w-full md:w-80 lg:w-96 bg-white border-r border-[#E5E7EB] flex-col min-h-0`}
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

          <div className="flex-1 min-h-0 overflow-y-auto bg-white">
            {loadingConversations ? (
              <div className="p-8 text-center text-[#6B7280]">
                <div className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando conversaciones...
                </div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="h-full flex items-center justify-center p-8 text-center text-[#6B7280]">
                Todavía no tienes conversaciones.
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
                      <h3 className="font-semibold text-[#1F2937] truncate">{adminLabel(conversation)}</h3>
                      <span className="text-xs text-[#6B7280] flex-shrink-0">
                        {conversation.last_message_at ? formatDate(conversation.last_message_at) : "—"}
                      </span>
                    </div>

                    <p className="text-xs text-[#6B7280] truncate">
                      {conversation.assigned_admin?.email || "Equipo de soporte"}
                    </p>
                    <p className="text-sm text-[#6B7280] truncate mt-1">
                      {conversation.last_message?.content || "Sin mensajes todavía"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className={`${mobileListVisible ? "hidden" : "flex"} md:flex flex-1 flex-col min-w-0 min-h-0 bg-white`}>
          {activeConversation ? (
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
                  <h3 className="font-semibold text-[#1F2937] truncate">{adminLabel(activeConversation)}</h3>
                  <p className="text-xs text-[#6B7280] truncate">
                    {activeConversation.assigned_admin?.email || "Equipo de soporte"}
                  </p>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-[#FCFAF4]">
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
                    const isUserMessage = message.sender_role === "user"

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[60%] rounded-2xl px-4 py-3 ${
                            isUserMessage
                              ? "bg-[#0E5A6B] text-white rounded-br-md"
                              : "bg-white border border-[#E5E7EB] text-[#1F2937] rounded-bl-md"
                          }`}
                        >
                          <p className={`text-sm leading-relaxed ${message.is_deleted ? "italic opacity-80" : ""}`}>
                            {message.content}
                          </p>
                          <p className={`text-xs mt-2 ${isUserMessage ? "text-white/70" : "text-[#6B7280]"}`}>
                            {formatDate(message.created_at)}
                            {message.is_edited && !message.is_deleted ? " · editado" : ""}
                            {message.is_deleted ? " · eliminado" : ""}
                          </p>
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
            <div className="flex-1 min-h-0 flex items-center justify-center bg-white">
              <div className="text-center px-4">
                <div className="w-20 h-20 bg-[#F3E7C9]/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-[#0E5A6B]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Tus conversaciones</h3>
                <p className="text-[#6B7280] max-w-sm">
                  Selecciona una conversación para ver los mensajes o envía el primero para iniciar.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
