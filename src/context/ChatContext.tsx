'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useWallet } from '@solana/wallet-adapter-react'

export interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  message: string
  created_at: string
}

interface ChatContextType {
  messages: ChatMessage[]
  sendMessage: (text: string) => Promise<void>
  senderId: string
  senderName: string
  isConnected: boolean
  username: string
  setUsername: (name: string) => void
  usernameLoaded: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

function getChatId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem('hide_chat_id')
  if (!id) {
    id = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('hide_chat_id', id)
  }
  return id
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [username, setUsernameState] = useState('')
  const [usernameLoaded, setUsernameLoaded] = useState(false)
  const chatIdRef = useRef<string>('')

  const senderId = publicKey ? publicKey.toBase58() : chatIdRef.current
  const senderName = publicKey
    ? publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4)
    : username || 'Anon'

  const setUsername = useCallback((name: string) => {
    setUsernameState(name)
    if (typeof window !== 'undefined') {
      localStorage.setItem('hide_username', name)
    }
  }, [])

  // Init chat ID + load username from localStorage / Supabase
  useEffect(() => {
    chatIdRef.current = getChatId()

    // Try local first
    const storedUsername = localStorage.getItem('hide_username')
    if (storedUsername) {
      setUsernameState(storedUsername)
      setUsernameLoaded(true)
      return
    }

    // Try fetching from Supabase
    async function loadProfile() {
      try {
        const res = await fetch(`/api/user/profile?clientId=${encodeURIComponent(chatIdRef.current)}`)
        const data = await res.json()
        if (data.profile?.username) {
          setUsernameState(data.profile.username)
          localStorage.setItem('hide_username', data.profile.username)
        }
      } catch (err) {
        console.warn('[Chat] Error loading profile:', err)
      } finally {
        setUsernameLoaded(true)
      }
    }
    loadProfile()
  }, [])

  // Load recent messages on mount
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch('/api/chat')
        const data = await res.json()
        if (data.messages) {
          setMessages(data.messages)
        }
      } catch (err) {
        console.error('[Chat] Failed to load messages:', err)
      }
    }
    loadMessages()
  }, [])

  // Subscribe to new messages via Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel('chat:global')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const msg = payload.new as ChatMessage
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          console.log('[Chat] ✅ Realtime connected')
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false)
          console.error('[Chat] ❌ Channel error')
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const currentSenderId = publicKey ? publicKey.toBase58() : chatIdRef.current
    const currentSenderName = publicKey
      ? publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4)
      : (username || 'Anon')

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentSenderId,
          senderName: currentSenderName,
          message: trimmed,
        }),
      })
    } catch (err) {
      console.error('[Chat] Failed to send message:', err)
    }
  }, [publicKey, username])

  return (
    <ChatContext.Provider value={{ messages, sendMessage, senderId, senderName, isConnected, username, setUsername, usernameLoaded }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
