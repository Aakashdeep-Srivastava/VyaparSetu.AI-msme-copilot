'use client'

import { useState, useCallback, useRef } from 'react'
import { Mic, MicOff, Send } from 'lucide-react'

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  onSend: (text: string) => void
  language: 'en' | 'hi'
  placeholder?: string
}

export default function VoiceRecorder({ onTranscript, onSend, language, placeholder }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [text, setText] = useState('')
  const recognitionRef = useRef<any>(null)

  const startRecording = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome.')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setText(transcript)
      onTranscript(transcript)
    }

    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)

    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
  }, [language, onTranscript])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }, [])

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim())
      setText('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-[#F0F0F0]">
      <div className="flex-1 relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type a message...'}
          className="w-full px-4 py-3 rounded-full bg-white text-gray-800 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>

      {text.trim() ? (
        <button
          onClick={handleSend}
          className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all relative ${
            isRecording
              ? 'bg-red-500 text-white'
              : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
          }`}
        >
          {isRecording && (
            <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse-ring" />
          )}
          {isRecording ? <MicOff className="w-5 h-5 relative z-10" /> : <Mic className="w-5 h-5" />}
        </button>
      )}
    </div>
  )
}
