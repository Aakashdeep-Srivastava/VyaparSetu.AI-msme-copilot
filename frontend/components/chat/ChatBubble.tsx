'use client'

import { motion } from 'framer-motion'

interface ChatBubbleProps {
  message: string
  isUser: boolean
  timestamp?: string
  translatedText?: string
}

export default function ChatBubble({ message, isUser, timestamp, translatedText }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-[#DBEAFE] rounded-tr-sm'
            : 'bg-white rounded-tl-sm'
        }`}
      >
        <p className="text-[15px] text-gray-800 leading-relaxed">{message}</p>
        {translatedText && (
          <p className="text-xs text-gray-500 mt-1.5 pt-1.5 border-t border-gray-200 italic">
            {translatedText}
          </p>
        )}
        {timestamp && (
          <p className="text-[11px] text-gray-400 text-right mt-1">{timestamp}</p>
        )}
      </div>
    </motion.div>
  )
}
