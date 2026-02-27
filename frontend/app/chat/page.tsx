'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useClassify, useRecommend } from '@/lib/api'
import { UI_TEXT, LANGUAGES } from '@/lib/constants'
import ChatWindow, { ChatMessage } from '@/components/chat/ChatWindow'
import VoiceRecorder from '@/components/chat/VoiceRecorder'
import CategoryCard from '@/components/catalog/CategoryCard'
import CatalogJsonViewer from '@/components/catalog/CatalogJsonViewer'
import PlatformCard from '@/components/match/PlatformCard'
import Link from 'next/link'
import { ArrowLeft, Globe, Package } from 'lucide-react'

let msgId = 0
const nextId = () => String(++msgId)
const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const WELCOME = {
  en: "Welcome to VyaparSetu AI! 🙏\nDescribe your products using text or voice, and I'll classify them, find the best platforms, and provide pricing insights.",
  hi: "व्यापारसेतु AI में आपका स्वागत है! 🙏\nटेक्स्ट या वॉइस से अपने उत्पादों का वर्णन करें, और मैं उन्हें वर्गीकृत करूंगा, सर्वश्रेष्ठ प्लेटफॉर्म खोजूंगा, और मूल्य निर्धारण की जानकारी दूंगा।",
}

export default function ChatPage() {
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const t = UI_TEXT[lang]
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      text: WELCOME.en,
      isUser: false,
      timestamp: now(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [typingText, setTypingText] = useState('')

  const classify = useClassify()
  const recommend = useRecommend()

  const addMessage = useCallback((text: string, isUser: boolean, component?: React.ReactNode) => {
    setMessages((prev) => [...prev, {
      id: nextId(),
      text,
      isUser,
      timestamp: now(),
      component,
    }])
  }, [])

  const handleSend = useCallback(async (text: string) => {
    addMessage(text, true)
    setIsTyping(true)
    setTypingText(t.classifying)

    try {
      // Step 1: Classify
      const classifyRes = await classify.mutateAsync({ text, language: lang })

      // Show translation if available
      if (classifyRes.translated_text) {
        addMessage(
          `🔤 ${lang === 'en' ? 'Translation' : 'अनुवाद'}: ${classifyRes.translated_text}`,
          false
        )
      }

      // Show classification
      const classificationComponent = (
        <div className="space-y-2 max-w-[85%]">
          {classifyRes.top_categories?.map((cat: any, i: number) => (
            <CategoryCard
              key={i}
              category={cat.category}
              code={cat.code}
              confidence={cat.confidence}
              band={cat.band}
              rank={i}
              isSelected={i === 0}
            />
          ))}
          <div className="bg-white rounded-xl p-3 mt-2 shadow-sm">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(classifyRes.attributes || {}).map(([key, value]) => {
                if (!value) return null
                const displayValue = Array.isArray(value) ? (value as string[]).join(', ') : String(value)
                return (
                  <div key={key} className="bg-gray-50 rounded p-1.5">
                    <span className="text-gray-400 uppercase">{key.replace(/_/g, ' ')}</span>
                    <p className="text-gray-700 font-medium">{displayValue}</p>
                  </div>
                )
              })}
              <div className="bg-orange-50 rounded p-1.5">
                <span className="text-orange-400 uppercase">HSN Code</span>
                <p className="text-orange-700 font-bold">{classifyRes.hsn_code}</p>
              </div>
            </div>
          </div>
        </div>
      )

      addMessage(
        lang === 'en'
          ? `I've classified your products. Top category: ${classifyRes.top_categories?.[0]?.category} (${(classifyRes.top_categories?.[0]?.confidence * 100).toFixed(1)}% confidence)`
          : `मैंने आपके उत्पादों को वर्गीकृत किया है। शीर्ष श्रेणी: ${classifyRes.top_categories?.[0]?.category} (${(classifyRes.top_categories?.[0]?.confidence * 100).toFixed(1)}% विश्वास)`,
        false,
        classificationComponent
      )

      // Show ONDC JSON
      if (classifyRes.ondc_catalog) {
        addMessage(
          lang === 'en' ? 'ONDC Catalog JSON generated:' : 'ONDC कैटलॉग JSON तैयार:',
          false,
          <div className="max-w-[85%]">
            <CatalogJsonViewer data={classifyRes.ondc_catalog} />
          </div>
        )
      }

      // Step 2: Match
      setTypingText(t.matching)
      const topCat = classifyRes.top_categories?.[0]?.category
      if (topCat) {
        const matchRes = await recommend.mutateAsync({
          product_category: topCat,
          product_description: text,
          location: 'India',
          language: lang,
          business_type: 'B2C',
        })

        const matchComponent = (
          <div className="space-y-3 max-w-[85%]">
            {matchRes.top_platforms?.map((platform: any, i: number) => (
              <PlatformCard
                key={i}
                platform={platform.platform}
                score={platform.score}
                factors={platform.factors}
                explanation={lang === 'hi' ? platform.explanation_hi : platform.explanation_en}
                rank={i}
                language={lang}
              />
            ))}
          </div>
        )

        addMessage(
          lang === 'en'
            ? `Here are the top 3 platforms for your products:`
            : `आपके उत्पादों के लिए शीर्ष 3 प्लेटफॉर्म:`,
          false,
          matchComponent
        )

        // Step 3: Pricing
        setTypingText(t.analyzing)
        try {
          const pricingRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/intelligence/pricing/${encodeURIComponent(topCat)}`
          )
          if (pricingRes.ok) {
            const pricing = await pricingRes.json()
            if (pricing.insight) {
              const ins = pricing.insight
              addMessage(
                lang === 'en'
                  ? `💰 Price Intelligence:\n\n${ins.product}: ₹${ins.your_price} (${ins.price_position})\nCategory median: ₹${ins.category_median}\n\n📊 ${ins.recommendation_en}\n\n📈 Peak: ${pricing.peak_season}`
                  : `💰 मूल्य इंटेलिजेंस:\n\n${ins.product}: ₹${ins.your_price} (${ins.price_position})\nश्रेणी औसत: ₹${ins.category_median}\n\n📊 ${ins.recommendation_hi}\n\n📈 पीक: ${pricing.peak_season}`,
                false
              )
            }
            // Geographic expansion insight
            if (pricing.geo_insight) {
              const geo = pricing.geo_insight
              addMessage(
                lang === 'en'
                  ? `🗺️ Geographic Opportunity:\n\n${geo.geo_insight_en}\n\n📍 Expansion regions: ${geo.expansion_regions?.join(', ')}\n📈 Growth: ${geo.expansion_growth}`
                  : `🗺️ भौगोलिक अवसर:\n\n${geo.geo_insight_hi}\n\n📍 विस्तार क्षेत्र: ${geo.expansion_regions?.join(', ')}\n📈 वृद्धि: ${geo.expansion_growth}`,
                false
              )
            }
          }
        } catch {}
      }
    } catch (err) {
      addMessage(
        lang === 'en'
          ? 'Sorry, something went wrong. Please try again.'
          : 'क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
        false
      )
    } finally {
      setIsTyping(false)
      setTypingText('')
    }
  }, [lang, t, classify, recommend, addMessage])

  return (
    <main className="h-screen flex flex-col bg-gray-100">
      {/* WhatsApp-style header */}
      <header className="bg-[#2563EB] text-white px-4 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">{t.appName}</h1>
            <p className="text-[11px] text-blue-200">
              {isTyping ? t.thinking : (lang === 'hi' ? 'ऑनलाइन' : 'Online')}
            </p>
          </div>
        </div>
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs"
        >
          <Globe className="w-3.5 h-3.5" />
          {LANGUAGES[lang].label}
        </button>
      </header>

      {/* Chat messages */}
      <ChatWindow messages={messages} isTyping={isTyping} typingText={typingText} />

      {/* Input */}
      <div className="flex-shrink-0">
        <VoiceRecorder
          onTranscript={() => {}}
          onSend={handleSend}
          language={lang}
          placeholder={t.chatPlaceholder}
        />
      </div>
    </main>
  )
}
