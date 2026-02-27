'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClassify, useRecommend, usePricing } from '@/lib/api'
import { UI_TEXT, LANGUAGES, BAND_COLORS } from '@/lib/constants'
import ChatBubble from '@/components/chat/ChatBubble'
import VoiceRecorder from '@/components/chat/VoiceRecorder'
import CategoryCard from '@/components/catalog/CategoryCard'
import CatalogJsonViewer from '@/components/catalog/CatalogJsonViewer'
import DemandTrendChart from '@/components/dashboard/DemandTrendChart'
import PlatformCard from '@/components/match/PlatformCard'
import Link from 'next/link'
import {
  Globe, ArrowLeft, ArrowRight, Check, Mic, Package,
  Sparkles, TrendingUp, PartyPopper, BarChart3
} from 'lucide-react'

type Step = 1 | 2 | 3 | 4 | 5

const STEPS = [
  { icon: Globe, label: 'Language' },
  { icon: Mic, label: 'Describe' },
  { icon: Package, label: 'Classify' },
  { icon: Sparkles, label: 'Match' },
  { icon: Check, label: 'Done' },
]

export default function OnboardPage() {
  const [step, setStep] = useState<Step>(1)
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const t = UI_TEXT[lang]
  const [transcript, setTranscript] = useState('')
  const [classifyResult, setClassifyResult] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [matchResult, setMatchResult] = useState<any>(null)
  const [pricingResult, setPricingResult] = useState<any>(null)

  const classify = useClassify()
  const recommend = useRecommend()
  const [matchError, setMatchError] = useState(false)

  const handleSend = useCallback(async (text: string) => {
    setTranscript(text)
    setStep(3)

    try {
      const result = await classify.mutateAsync({ text, language: lang })
      setClassifyResult(result)
    } catch (err) {
      console.error('Classification error:', err)
    }
  }, [lang, classify])

  const handleFindPlatforms = useCallback(async () => {
    if (!classifyResult?.top_categories?.length) return
    setStep(4)
    setMatchError(false)

    try {
      const topCat = classifyResult.top_categories[0].category
      const matchRes = await recommend.mutateAsync({
        product_category: topCat,
        product_description: transcript,
        location: 'India',
        language: lang,
        business_type: 'B2C',
      })
      setMatchResult(matchRes)

      // Fetch pricing
      try {
        const pricingRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/intelligence/pricing/${encodeURIComponent(topCat)}`
        )
        if (pricingRes.ok) {
          setPricingResult(await pricingRes.json())
        }
      } catch {}
    } catch (err) {
      console.error('Matching error:', err)
      setMatchError(true)
    }
  }, [classifyResult, transcript, lang, recommend])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#2563EB] text-white px-4 py-3 flex items-center justify-between shadow-lg">
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
              {step <= 2 ? (lang === 'hi' ? 'ऑनलाइन' : 'Online') : t.thinking}
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

      {/* Stepper */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {STEPS.map((s, i) => {
            const stepNum = (i + 1) as Step
            const isActive = step === stepNum
            const isDone = step > stepNum
            return (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      isDone
                        ? 'bg-[#2563EB] text-white'
                        : isActive
                        ? 'bg-[#1E40AF] text-white shadow-md'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] mt-1 ${isActive ? 'text-[#2563EB] font-medium' : 'text-gray-400'}`}>
                    {lang === 'en' ? s.label : [t.step1, t.step2, t.step3, t.step4, t.step5][i]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${step > stepNum ? 'bg-[#2563EB]' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Language Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="p-6"
            >
              <div className="text-center mb-8 mt-8">
                <div className="w-20 h-20 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-10 h-10 text-[#2563EB]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {lang === 'en' ? 'Choose Your Language' : 'अपनी भाषा चुनें'}
                </h2>
                <p className="text-gray-500">
                  {lang === 'en' ? 'Select the language you\'re most comfortable with' : 'वह भाषा चुनें जिसमें आप सहज हैं'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                {(['en', 'hi'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      lang === l
                        ? 'border-[#2563EB] bg-[#2563EB]/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-4xl block mb-2">{LANGUAGES[l].flag}</span>
                    <span className="font-semibold text-gray-800">{LANGUAGES[l].label}</span>
                  </button>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors"
                >
                  {lang === 'en' ? 'Continue' : 'आगे बढ़ें'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Product Description */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col h-[calc(100vh-140px)]"
            >
              <div
                className="flex-1 overflow-y-auto px-4 py-4"
                style={{ backgroundColor: '#EFF6FF' }}
              >
                <ChatBubble
                  message={lang === 'en'
                    ? "Welcome to VyaparSetu AI! 🙏\n\nPlease describe your products. You can type or tap the microphone to speak."
                    : "व्यापारसेतु AI में आपका स्वागत है! 🙏\n\nकृपया अपने उत्पादों का वर्णन करें। आप टाइप कर सकते हैं या माइक्रोफोन पर टैप करके बोल सकते हैं।"
                  }
                  isUser={false}
                  timestamp={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                {transcript && (
                  <ChatBubble
                    message={transcript}
                    isUser={true}
                    timestamp={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                )}
              </div>
              <VoiceRecorder
                onTranscript={setTranscript}
                onSend={handleSend}
                language={lang}
                placeholder={t.chatPlaceholder}
              />
            </motion.div>
          )}

          {/* Step 3: Classification Results */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="p-6"
            >
              {classify.isPending ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">{t.classifying}</p>
                </div>
              ) : classifyResult ? (
                <div className="space-y-6">
                  {/* Input summary */}
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">{lang === 'en' ? 'Your description' : 'आपका विवरण'}</p>
                    <p className="text-gray-800 font-medium">{classifyResult.original_text}</p>
                    {classifyResult.translated_text && (
                      <p className="text-sm text-gray-500 mt-2 italic">🔤 {classifyResult.translated_text}</p>
                    )}
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#2563EB]" />
                      {lang === 'en' ? 'AI Classification Results' : 'AI वर्गीकरण परिणाम'}
                    </h3>
                    <div className="space-y-3">
                      {classifyResult.top_categories?.map((cat: any, i: number) => (
                        <CategoryCard
                          key={i}
                          category={cat.category}
                          code={cat.code}
                          confidence={cat.confidence}
                          band={cat.band}
                          rank={i}
                          isSelected={selectedCategory === i}
                          onSelect={() => setSelectedCategory(i)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <h4 className="font-medium text-gray-800 mb-3">
                      {lang === 'en' ? 'Extracted Attributes' : 'निकाले गए गुण'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(classifyResult.attributes || {}).map(([key, value]) => {
                        if (!value) return null
                        const displayValue = Array.isArray(value) ? (value as string[]).join(', ') : String(value)
                        return (
                          <div key={key} className="bg-gray-50 rounded-lg p-2.5">
                            <p className="text-[11px] text-gray-400 uppercase tracking-wider">{key.replace(/_/g, ' ')}</p>
                            <p className="text-sm font-medium text-gray-700">{displayValue}</p>
                          </div>
                        )
                      })}
                      <div className="bg-orange-50 rounded-lg p-2.5">
                        <p className="text-[11px] text-orange-400 uppercase tracking-wider">HSN Code</p>
                        <p className="text-sm font-bold text-orange-700">{classifyResult.hsn_code}</p>
                      </div>
                    </div>
                  </div>

                  {/* ONDC Catalog JSON */}
                  {classifyResult.ondc_catalog && (
                    <CatalogJsonViewer data={classifyResult.ondc_catalog} />
                  )}

                  {/* Processing time */}
                  <p className="text-xs text-gray-400 text-center">
                    Processed in {classifyResult.processing_time_ms?.toFixed(0)}ms
                  </p>

                  <div className="text-center">
                    <button
                      onClick={handleFindPlatforms}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors"
                    >
                      {lang === 'en' ? 'Find Best Platforms' : 'सर्वश्रेष्ठ प्लेटफॉर्म खोजें'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  {lang === 'en' ? 'Something went wrong. Please try again.' : 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।'}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Platform Matching + Pricing */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="p-6"
            >
              {recommend.isPending ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">{t.matching}</p>
                </div>
              ) : matchResult ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#2563EB]" />
                      {lang === 'en' ? 'Recommended Platforms' : 'अनुशंसित प्लेटफॉर्म'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {lang === 'en'
                        ? 'Based on domain match, geography, capacity, history & specialization'
                        : 'डोमेन मैच, भूगोल, क्षमता, इतिहास और विशेषज्ञता के आधार पर'}
                    </p>
                    <div className="space-y-4">
                      {matchResult.top_platforms?.map((platform: any, i: number) => (
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
                  </div>

                  {/* Pricing Intelligence */}
                  {pricingResult?.insight && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200"
                    >
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                        {lang === 'en' ? 'Price Intelligence' : 'मूल्य इंटेलिजेंस'}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{pricingResult.insight.product}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-gray-500">{lang === 'en' ? 'Your Price' : 'आपकी कीमत'}</p>
                            <p className="text-xl font-bold text-gray-800">₹{pricingResult.insight.your_price}</p>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3">
                            <p className="text-xs text-gray-500">{lang === 'en' ? 'Category Median' : 'श्रेणी औसत'}</p>
                            <p className="text-xl font-bold text-gray-800">₹{pricingResult.insight.category_median}</p>
                          </div>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">{lang === 'en' ? 'Position' : 'स्थिति'}</p>
                          <p className="text-sm font-medium text-amber-700">{pricingResult.insight.price_position}</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">{lang === 'en' ? 'Recommendation' : 'सिफारिश'}</p>
                          <p className="text-sm text-gray-700">
                            {lang === 'hi' ? pricingResult.insight.recommendation_hi : pricingResult.insight.recommendation_en}
                          </p>
                        </div>
                      </div>
                      {pricingResult.peak_season && (
                        <p className="text-xs text-amber-600 mt-3">
                          📈 {lang === 'en' ? 'Peak Season' : 'पीक सीज़न'}: {pricingResult.peak_season}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Demand Trend Chart */}
                  {pricingResult?.demand_trends?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <DemandTrendChart
                        data={pricingResult.demand_trends}
                        peakSeason={pricingResult.peak_season || ''}
                        growthYoY={pricingResult.growth_yoy || 0}
                        language={lang}
                      />
                    </motion.div>
                  )}

                  {/* Geographic Expansion Insight */}
                  {pricingResult?.geo_insight && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200"
                    >
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {lang === 'en' ? 'Geographic Expansion Opportunity' : 'भौगोलिक विस्तार का अवसर'}
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        {lang === 'hi' ? pricingResult.geo_insight.geo_insight_hi : pricingResult.geo_insight.geo_insight_en}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pricingResult.geo_insight.expansion_regions?.map((region: string, i: number) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                            📍 {region}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                          {pricingResult.geo_insight.expansion_growth} {lang === 'en' ? 'growth' : 'वृद्धि'}
                        </span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                          {pricingResult.geo_insight.demand_spike}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <p className="text-xs text-gray-400 text-center">
                    Processed in {matchResult.processing_time_ms?.toFixed(0)}ms
                  </p>

                  <div className="text-center">
                    <button
                      onClick={() => setStep(5)}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors"
                    >
                      {lang === 'en' ? 'Complete Onboarding' : 'ऑनबोर्डिंग पूरी करें'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : matchError ? (
                <div className="text-center py-20">
                  <p className="text-red-500 font-medium mb-4">
                    {lang === 'en' ? 'Failed to fetch recommendations. Please retry.' : 'सिफारिशें लोड करने में विफल। कृपया पुनः प्रयास करें।'}
                  </p>
                  <button
                    onClick={handleFindPlatforms}
                    className="px-6 py-2 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors"
                  >
                    {lang === 'en' ? 'Retry' : 'पुनः प्रयास करें'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">{t.matching}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mt-12 mb-6"
              >
                <PartyPopper className="w-12 h-12 text-[#2563EB]" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-gray-800 mb-3"
              >
                {lang === 'en' ? 'Onboarding Complete!' : 'ऑनबोर्डिंग पूर्ण!'}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-500 mb-8 max-w-md mx-auto"
              >
                {lang === 'en'
                  ? 'Your products have been cataloged and matched with the best platforms. You\'re ready to start selling!'
                  : 'आपके उत्पादों को कैटलॉग किया गया है और सर्वश्रेष्ठ प्लेटफॉर्म से मिलान किया गया है। आप बेचना शुरू करने के लिए तैयार हैं!'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-sm mx-auto mb-8"
              >
                <h3 className="font-semibold text-gray-800 mb-4">{lang === 'en' ? 'Summary' : 'सारांश'}</h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{lang === 'en' ? 'Category' : 'श्रेणी'}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {classifyResult?.top_categories?.[selectedCategory]?.category?.split(' > ').pop() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{lang === 'en' ? 'Confidence' : 'विश्वास'}</span>
                    <span className="text-sm font-medium text-[#2563EB]">
                      {classifyResult?.top_categories?.[selectedCategory]?.confidence
                        ? `${(classifyResult.top_categories[selectedCategory].confidence * 100).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">HSN</span>
                    <span className="text-sm font-medium text-gray-800">{classifyResult?.hsn_code || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{lang === 'en' ? 'Best Platform' : 'सर्वश्रेष्ठ प्लेटफॉर्म'}</span>
                    <span className="text-sm font-medium text-gray-800">{matchResult?.top_platforms?.[0]?.platform || 'N/A'}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                <Link
                  href="/onboard"
                  onClick={() => { setStep(1); setClassifyResult(null); setMatchResult(null); setPricingResult(null); setTranscript('') }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors"
                >
                  <Package className="w-4 h-4" />
                  {lang === 'en' ? 'Onboard Another' : 'एक और ऑनबोर्ड करें'}
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  {lang === 'en' ? 'View Dashboard' : 'डैशबोर्ड देखें'}
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
