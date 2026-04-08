"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Send, Search, MessageCircle } from "lucide-react"
import { chatConversations } from "@/lib/mock-data"

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [conversations, setConversations] = useState(chatConversations)

  const activeConversation = conversations.find((c) => c.id === selectedChat)

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return
    
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedChat
          ? {
              ...conv,
              messages: [
                ...conv.messages,
                {
                  id: `m${Date.now()}`,
                  sender: "user",
                  text: newMessage,
                  time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
                }
              ],
              lastMessage: newMessage,
              timestamp: "Ahora"
            }
          : conv
      )
    )
    setNewMessage("")
  }

  return (
    <div className="h-screen bg-[#FCFAF4] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Chat Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-[#E5E7EB] flex flex-col ${selectedChat ? "hidden md:flex" : "flex"}`}>
          {/* Search */}
          <div className="p-4 border-b border-[#E5E7EB]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all text-sm"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedChat(conversation.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-[#F3E7C9]/30 transition-colors border-b border-[#E5E7EB] text-left ${
                  selectedChat === conversation.id ? "bg-[#F3E7C9]/50" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Image
                    src={conversation.avatar}
                    alt={conversation.supplier}
                    width={48}
                    height={48}
                    className="rounded-xl object-cover"
                  />
                  {conversation.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0E5A6B] text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {conversation.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-[#1F2937] truncate">{conversation.supplier}</h3>
                    <span className="text-xs text-[#6B7280] flex-shrink-0">{conversation.timestamp}</span>
                  </div>
                  <p className="text-sm text-[#6B7280] truncate">{conversation.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`flex-1 flex flex-col ${selectedChat ? "flex" : "hidden md:flex"}`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 rounded-lg hover:bg-[#F3E7C9]/50 transition-colors -ml-2"
                >
                  <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
                </button>
                <Image
                  src={activeConversation.avatar}
                  alt={activeConversation.supplier}
                  width={40}
                  height={40}
                  className="rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-semibold text-[#1F2937]">{activeConversation.supplier}</h3>
                  <p className="text-xs text-[#6B7280]">En línea</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-[#0E5A6B] text-white rounded-br-md"
                          : "bg-white border border-[#E5E7EB] text-[#1F2937] rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-[#6B7280]"}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-[#E5E7EB] p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FCFAF4] text-[#1F2937] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#0E5A6B]/20 focus:border-[#0E5A6B] transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-[#0E5A6B] text-white rounded-xl hover:bg-[#0E5A6B]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="w-20 h-20 bg-[#F3E7C9]/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-[#0E5A6B]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Tus conversaciones</h3>
                <p className="text-[#6B7280] max-w-sm">
                  Selecciona una conversación para ver los mensajes o inicia una nueva desde el perfil de un proveedor.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
