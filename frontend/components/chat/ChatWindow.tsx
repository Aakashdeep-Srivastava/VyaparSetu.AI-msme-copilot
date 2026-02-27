'use client'

import { useRef, useEffect } from 'react'
import ChatBubble from './ChatBubble'

export interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: string
  translatedText?: string
  component?: React.ReactNode
}

interface ChatWindowProps {
  messages: ChatMessage[]
  isTyping?: boolean
  typingText?: string
}

export default function ChatWindow({ messages, isTyping, typingText }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d5dbd6' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundColor: '#EFF6FF',
      }}
    >
      {messages.map((msg) => (
        <div key={msg.id}>
          <ChatBubble
            message={msg.text}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
            translatedText={msg.translatedText}
          />
          {msg.component && (
            <div className="mb-3 animate-message">{msg.component}</div>
          )}
        </div>
      ))}

      {isTyping && (
        <div className="flex justify-start mb-3">
          <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-1">
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
              </div>
              {typingText && (
                <span className="text-xs text-gray-400 ml-2">{typingText}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
