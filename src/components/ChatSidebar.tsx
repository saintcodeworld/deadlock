'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Wifi, WifiOff } from 'lucide-react'
import { useChat } from '@/context/ChatContext'

export function ChatSidebar() {
  const { messages, sendMessage, senderId, senderName, isConnected } = useChat()
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isSending) return
    setIsSending(true)
    const text = input
    setInput('')
    try {
      await sendMessage(text)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isOwnMessage = (msgSenderId: string) => {
    return msgSenderId === senderId
  }

  return (
    <>
      {/* Chat panel - always visible */}
      <div className="fixed left-0 top-[88px] bottom-0 z-50 w-80 flex flex-col bg-void/95 backdrop-blur-xl border-r border-void-border shadow-[5px_0_30px_rgba(0,0,0,0.9)] font-display">
            {/* Glitch accent line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-blood-glow opacity-50" />

            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-void-border bg-void-light/50 shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blood-glow" />
                <h2 className="text-white font-bold text-sm tracking-[0.2em] uppercase">Chat</h2>
                {isConnected ? (
                  <Wifi className="w-3 h-3 text-green-500" />
                ) : (
                  <WifiOff className="w-3 h-3 text-horror-muted" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-horror-muted uppercase tracking-wider">
                  {senderName}
                </span>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 custom-scrollbar">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-50">
                  <MessageCircle className="w-8 h-8 text-horror-muted" />
                  <p className="text-[10px] text-horror-muted font-mono uppercase tracking-widest">
                    No messages yet
                  </p>
                  <p className="text-[9px] text-horror-muted font-mono lowercase">
                    be the first to speak...
                  </p>
                </div>
              )}

              {messages.map((msg) => {
                const own = isOwnMessage(msg.sender_id)
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${own ? 'items-end' : 'items-start'}`}
                  >
                    {/* Sender name + time */}
                    <div className={`flex items-center gap-2 mb-0.5 ${own ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-[9px] font-mono tracking-wider uppercase ${
                        own ? 'text-blood-glow' : 'text-horror-accent'
                      }`}>
                        {own ? 'You' : msg.sender_name}
                      </span>
                      <span className="text-[8px] font-mono text-horror-muted">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    {/* Message bubble */}
                    <div
                      className={`max-w-[85%] px-3 py-2 text-[11px] font-mono leading-relaxed break-words ${
                        own
                          ? 'bg-blood-dark/30 border border-blood/30 text-horror-text'
                          : 'bg-void-light border border-void-border text-horror-text'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-3 py-3 border-t border-void-border bg-void-light/30 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  maxLength={500}
                  className="flex-1 bg-void border border-void-border text-horror-text text-[11px] font-mono px-3 py-2.5 placeholder:text-horror-muted/50 focus:outline-none focus:border-blood/50 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}
                  className="w-9 h-9 flex items-center justify-center border border-void-border bg-void hover:border-blood/50 hover:bg-blood-dark/20 text-horror-muted hover:text-blood-glow transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[8px] text-horror-muted/40 font-mono mt-1.5 text-center uppercase tracking-widest">
                {isConnected ? 'live' : 'connecting...'}
              </p>
            </div>
      </div>
    </>
  )
}
