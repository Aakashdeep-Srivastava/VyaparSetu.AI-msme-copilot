'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { UI_TEXT, LANGUAGES } from '@/lib/constants'
import { Package, Target, TrendingUp, Mic, ArrowRight, Plus, Minus, Globe, CheckCircle, Play } from 'lucide-react'

const BENEFITS = {
  en: [
    { title: 'Onboard in 5 minutes, not 4 hours', desc: 'MSMEs used to spend half a day filling forms manually. Now they just speak about their products and the catalog gets built automatically.' },
    { title: 'Speak in Hindi, sell everywhere', desc: 'Voice input works in Hindi and English with live transcription. No more language barriers keeping small businesses offline.' },
    { title: 'Know your market before you price', desc: 'See what similar products sell for, where demand is growing, and which regions to expand into. The kind of data only big companies had access to.' },
    { title: 'Find the right platform on the first try', desc: 'Instead of guessing which marketplace to join, our scoring engine analyzes 15+ platforms and tells you exactly where your products will do best.' },
  ],
  hi: [
    { title: '4 घंटे नहीं, 5 मिनट में ऑनबोर्ड करें', desc: 'MSMEs को पहले आधा दिन फॉर्म भरने में लगता था। अब बस अपने प्रोडक्ट के बारे में बोलें और कैटलॉग अपने आप बन जाता है।' },
    { title: 'हिंदी में बोलें, हर जगह बेचें', desc: 'वॉइस इनपुट हिंदी और अंग्रेजी में काम करता है। अब भाषा की दीवार छोटे कारोबारियों को नहीं रोकेगी।' },
    { title: 'कीमत तय करने से पहले बाज़ार को जानें', desc: 'देखें कि मिलते-जुलते प्रोडक्ट कितने में बिकते हैं, कहां डिमांड बढ़ रही है, और किन इलाकों में विस्तार करना चाहिए।' },
    { title: 'पहली बार में सही प्लेटफॉर्म चुनें', desc: 'अंदाज़े से मार्केटप्लेस चुनने के बजाय, हमारा स्कोरिंग इंजन 15+ प्लेटफॉर्म का विश्लेषण करता है।' },
  ],
}

const SCENARIOS = {
  en: [
    { name: 'Ramesh Kumar', location: 'Moradabad, UP', product: 'Brass decoratives', emoji: '🏺', platform: 'Amazon Karigar', score: '0.89', price: '₹450', badge: 'Hindi voice' },
    { name: 'Lakshmi Devi', location: 'Varanasi, UP', product: 'Banarasi silk sarees', emoji: '🧵', platform: 'Myntra', score: '0.91', price: '₹3,200', badge: 'Hindi voice' },
    { name: 'Priya Menon', location: 'Kochi, Kerala', product: 'Organic spices', emoji: '🌶️', platform: 'IndiaMART', score: '0.87', price: '₹1,200/kg', badge: 'English text' },
  ],
  hi: [
    { name: 'रमेश कुमार', location: 'मुरादाबाद, UP', product: 'पीतल सजावटी सामान', emoji: '🏺', platform: 'Amazon Karigar', score: '0.89', price: '₹450', badge: 'हिंदी वॉइस' },
    { name: 'लक्ष्मी देवी', location: 'वाराणसी, UP', product: 'बनारसी सिल्क साड़ी', emoji: '🧵', platform: 'Myntra', score: '0.91', price: '₹3,200', badge: 'हिंदी वॉइस' },
    { name: 'प्रिया मेनन', location: 'कोच्चि, केरल', product: 'ऑर्गेनिक मसाले', emoji: '🌶️', platform: 'IndiaMART', score: '0.87', price: '₹1,200/kg', badge: 'अंग्रेजी टेक्स्ट' },
  ],
}

const STEPS = {
  en: [
    { num: '01', title: 'Describe your products', desc: 'Speak or type in Hindi or English. Tell us what you make, your materials, and where you are based.', img: '🎙️' },
    { num: '02', title: 'Get instant classification', desc: 'Our system identifies the right category, generates HSN codes, and builds a marketplace-ready catalog.', img: '🧠' },
    { num: '03', title: 'See your best options', desc: 'Get matched to the top platforms for your products along with pricing benchmarks and demand trends.', img: '📊' },
  ],
  hi: [
    { num: '01', title: 'अपने प्रोडक्ट बताएं', desc: 'हिंदी या अंग्रेजी में बोलें या टाइप करें। बताएं कि आप क्या बनाते हैं, सामग्री क्या है, और कहां से हैं।', img: '🎙️' },
    { num: '02', title: 'तुरंत वर्गीकरण पाएं', desc: 'हमारा सिस्टम सही श्रेणी पहचानता है, HSN कोड बनाता है, और मार्केटप्लेस के लिए कैटलॉग तैयार करता है।', img: '🧠' },
    { num: '03', title: 'अपने सर्वश्रेष्ठ विकल्प देखें', desc: 'अपने प्रोडक्ट के लिए टॉप प्लेटफॉर्म, प्राइसिंग बेंचमार्क और डिमांड ट्रेंड पाएं।', img: '📊' },
  ],
}

/* ━━━ Animated hero showcase ━━━ */
function HeroShowcase({ lang }: { lang: 'en' | 'hi' }) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setStage((s) => (s + 1) % 4), 3500)
    return () => clearInterval(timer)
  }, [])

  const STAGE_LABELS = lang === 'en'
    ? ['Voice input', 'Classification', 'Platform match', 'Pricing intel']
    : ['वॉइस इनपुट', 'वर्गीकरण', 'प्लेटफॉर्म मैच', 'प्राइसिंग']

  const cardVariants = {
    enter: { opacity: 0, y: 20, scale: 0.97 },
    center: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -15, scale: 0.97 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="hidden lg:block relative"
    >
      {/* Stage indicator dots */}
      <div className="flex items-center gap-2 mb-4">
        {STAGE_LABELS.map((label, i) => (
          <button key={i} onClick={() => setStage(i)} className="flex items-center gap-1.5 group">
            <div className={`h-1 rounded-full transition-all duration-500 ${stage === i ? 'w-6 bg-white' : 'w-2 bg-white/25 group-hover:bg-white/40'}`} />
            {stage === i && (
              <span className="text-[10px] text-blue-200/70 font-medium">{label}</span>
            )}
          </button>
        ))}
      </div>

      <div className="relative h-[380px]">
        <AnimatePresence mode="wait">
          {/* Stage 0: Voice input */}
          {stage === 0 && (
            <motion.div key="voice" variants={cardVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
              <div className="bg-white rounded-2xl p-6 shadow-2xl h-full flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-lg">🏺</div>
                  <div>
                    <p className="text-gray-900 text-sm font-semibold">Ramesh Kumar</p>
                    <p className="text-gray-400 text-[11px]">Moradabad, UP</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-full">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-600 text-[10px] font-medium">{lang === 'en' ? 'Recording' : 'रिकॉर्डिंग'}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 mb-4 flex-1 flex flex-col justify-center">
                  <div className="flex items-end justify-center gap-1 h-10 mb-4">
                    {[0.6, 0.9, 0.4, 1, 0.7, 0.5, 0.85, 0.3, 0.75, 0.95, 0.5, 0.8, 0.65, 0.4, 0.9].map((h, i) => (
                      <motion.div key={i} className="w-1 bg-[#2563EB] rounded-full" animate={{ height: [h * 40, h * 15, h * 40] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.06 }} />
                    ))}
                  </div>
                  <motion.p className="text-gray-700 text-sm text-center italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    "Main peetal ke decorative items banata hoon..."
                  </motion.p>
                  <motion.p className="text-gray-400 text-[11px] text-center mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                    Hindi &rarr; English: "I make brass decorative items..."
                  </motion.p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#2563EB] rounded-full" animate={{ width: ['0%', '100%'] }} transition={{ duration: 3 }} />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Hindi</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stage 1: Classification */}
          {stage === 1 && (
            <motion.div key="classify" variants={cardVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
              <div className="bg-white rounded-2xl p-6 shadow-2xl h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-gray-900 text-sm font-semibold">CatalogAI</span>
                  </div>
                  <span className="text-emerald-700 text-[10px] font-semibold px-2.5 py-0.5 bg-emerald-50 rounded-full">92.3% confident</span>
                </div>
                <div className="space-y-2.5 flex-1">
                  {[
                    { cat: 'Home & Decor > Brass Decoratives', pct: 92.3, color: 'bg-emerald-500', text: 'text-gray-800', delay: 0.1 },
                    { cat: 'Candles & Holders', pct: 5.1, color: 'bg-amber-400', text: 'text-gray-500', delay: 0.3 },
                    { cat: 'Metal Art', pct: 2.6, color: 'bg-blue-400', text: 'text-gray-500', delay: 0.5 },
                  ].map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: c.delay }} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between mb-1.5">
                        <span className={`text-xs font-medium ${c.text}`}>{c.cat}</span>
                        <span className={`text-xs font-bold ${c.text}`}>{c.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div className={`h-full ${c.color} rounded-full`} initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 1, delay: c.delay + 0.2, ease: 'easeOut' }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="grid grid-cols-3 gap-2 mt-4">
                  {[{ label: 'HSN', value: '7418' }, { label: 'Material', value: 'Brass' }, { label: 'Origin', value: 'Moradabad' }].map((attr, i) => (
                    <div key={i} className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-gray-400">{attr.label}</p>
                      <p className="text-xs text-gray-900 font-semibold">{attr.value}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Stage 2: Platform matching */}
          {stage === 2 && (
            <motion.div key="match" variants={cardVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
              <div className="bg-white rounded-2xl p-6 shadow-2xl h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-600" />
                    <span className="text-gray-900 text-sm font-semibold">MatchMaker</span>
                  </div>
                  <span className="text-gray-400 text-[10px]">{lang === 'en' ? '15 platforms scored' : '15 प्लेटफॉर्म स्कोर'}</span>
                </div>
                <div className="space-y-3 flex-1">
                  {[
                    { name: 'Amazon Karigar', emoji: '🛒', score: 0.89, factors: [92, 85, 88, 91, 82], delay: 0.1 },
                    { name: 'IndiaMART', emoji: '🏭', score: 0.82, factors: [78, 90, 75, 85, 80], delay: 0.3 },
                    { name: 'ONDC Mystore', emoji: '🇮🇳', score: 0.78, factors: [75, 82, 90, 65, 78], delay: 0.5 },
                  ].map((p, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: p.delay }} className={`rounded-xl p-3.5 ${i === 0 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{p.emoji}</span>
                        <p className="text-gray-800 text-xs font-medium flex-1">{p.name}</p>
                        <span className={`text-sm font-bold ${i === 0 ? 'text-[#2563EB]' : 'text-gray-400'}`}>{p.score.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-1">
                        {p.factors.map((f, j) => (
                          <div key={j} className="flex-1">
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div className={`h-full rounded-full ${i === 0 ? 'bg-[#2563EB]' : 'bg-gray-300'}`} initial={{ width: 0 }} animate={{ width: `${f}%` }} transition={{ duration: 0.8, delay: p.delay + j * 0.08 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex items-center gap-4 mt-3 text-[9px] text-gray-400">
                  {['Domain', 'Geo', 'Capacity', 'History', 'Special'].map((f, i) => (
                    <span key={i} className="flex-1 text-center">{f}</span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Stage 3: Pricing intelligence */}
          {stage === 3 && (
            <motion.div key="price" variants={cardVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
              <div className="bg-white rounded-2xl p-6 shadow-2xl h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-900 text-sm font-semibold">PriceWise</span>
                  </div>
                  <span className="text-amber-700 text-[10px] font-semibold px-2.5 py-0.5 bg-amber-50 rounded-full">{lang === 'en' ? 'Brass Vase' : 'पीतल फूलदान'}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-gray-50 rounded-xl p-3.5 text-center">
                    <p className="text-[10px] text-gray-400 mb-1">{lang === 'en' ? 'Your price' : 'आपकी कीमत'}</p>
                    <p className="text-xl font-bold text-gray-900">₹450</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="bg-amber-50 rounded-xl p-3.5 text-center">
                    <p className="text-[10px] text-gray-400 mb-1">{lang === 'en' ? 'Market median' : 'बाज़ार औसत'}</p>
                    <p className="text-xl font-bold text-amber-600">₹490</p>
                  </motion.div>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-gray-50 rounded-xl p-4 flex-1">
                  <p className="text-[10px] text-gray-400 mb-3">{lang === 'en' ? 'Monthly demand trend' : 'मासिक मांग ट्रेंड'}</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {[30, 35, 28, 40, 38, 45, 50, 65, 80, 95, 75, 45].map((h, i) => (
                      <motion.div key={i} className={`flex-1 rounded-sm ${i >= 8 && i <= 9 ? 'bg-amber-400' : 'bg-[#2563EB]/30'}`} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[8px] text-gray-300">Jan</span>
                    <span className="text-[8px] text-gray-300">Jun</span>
                    <span className="text-[8px] text-amber-500 font-medium">Dec</span>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex gap-2 mt-3">
                  <div className="flex-1 bg-emerald-50 rounded-lg px-2.5 py-2">
                    <p className="text-emerald-700 text-[10px] font-semibold">+40% {lang === 'en' ? 'Oct-Nov' : 'अक्टू-नवं'}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{lang === 'en' ? 'Diwali spike' : 'दिवाली स्पाइक'}</p>
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-lg px-2.5 py-2">
                    <p className="text-[#2563EB] text-[10px] font-semibold">{lang === 'en' ? 'Expand South' : 'दक्षिण विस्तार'}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">23% QoQ {lang === 'en' ? 'growth' : 'वृद्धि'}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const t = UI_TEXT[lang]
  const [openBenefit, setOpenBenefit] = useState<number | null>(0)

  return (
    <main className="min-h-screen bg-white">

      {/* ━━━ Floating nav ━━━ */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/[0.06] border border-white/70">
        <div className="px-5 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-bold text-[15px] tracking-tight text-gray-900">VyaparSetu</span>
            </Link>
            {/* Nav links */}
            <div className="hidden md:flex items-center gap-6 text-[13px] text-gray-500 font-medium">
              <Link href="#features" className="hover:text-gray-900 transition-colors">{lang === 'en' ? 'Features' : 'विशेषताएं'}</Link>
              <Link href="#stories" className="hover:text-gray-900 transition-colors">{lang === 'en' ? 'Stories' : 'कहानियां'}</Link>
              <Link href="#how" className="hover:text-gray-900 transition-colors">{lang === 'en' ? 'How it works' : 'कैसे काम करता है'}</Link>
              <Link href="/dashboard" className="hover:text-gray-900 transition-colors">{lang === 'en' ? 'Dashboard' : 'डैशबोर्ड'}</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="text-[13px] text-gray-500 hover:text-gray-900 font-medium transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100/80"
            >
              <Globe className="w-3.5 h-3.5" />
              {LANGUAGES[lang].label}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/chat"
                className="px-4 py-2 text-gray-700 text-[13px] font-medium rounded-xl hover:bg-gray-100/80 transition-colors"
              >
                {lang === 'en' ? 'Chat' : 'चैट'}
              </Link>
              <Link
                href="/onboard"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#2563EB] text-white text-[13px] font-medium rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm shadow-blue-500/20"
              >
                {lang === 'en' ? 'Get started' : 'शुरू करें'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ━━━ Hero ━━━ */}
      <section className="relative overflow-hidden">
        <div
          className="relative min-h-screen flex items-center"
          style={{ background: 'linear-gradient(160deg, #1E3A8A 0%, #2563EB 45%, #3B82F6 100%)' }}
        >
          {/* Subtle radial glow */}
          <div className="absolute top-1/4 left-1/3 w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[120px]" />

          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen py-32">

              {/* Left: copy */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-bold text-white leading-[1.15] tracking-[-0.02em]">
                  {lang === 'en'
                    ? <>Sell smarter.<br />In your language.</>
                    : <>अपनी भाषा में।<br />स्मार्ट बेचें।</>}
                </h1>

                <p className="mt-7 text-[15px] sm:text-base text-blue-100/75 max-w-md leading-[1.7]">
                  {lang === 'en'
                    ? '6.3 crore MSMEs deserve the same tools that large companies use. Catalog products by voice, find the right marketplace, and price competitively.'
                    : '6.3 करोड़ MSMEs को वही टूल्स मिलने चाहिए जो बड़ी कंपनियां इस्तेमाल करती हैं। वॉइस से कैटलॉग बनाएं, सही मार्केटप्लेस खोजें और सही कीमत तय करें।'}
                </p>

                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    href="/onboard"
                    className="inline-flex items-center gap-2 px-7 py-3 bg-white text-[#1E40AF] font-semibold text-[13px] rounded-full hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/25 hover:shadow-blue-900/35"
                  >
                    <Mic className="w-4 h-4" />
                    {lang === 'en' ? 'Try it now' : 'अभी आज़माएं'}
                  </Link>
                  <Link
                    href="#how"
                    className="inline-flex items-center gap-2 px-7 py-3 text-white font-medium text-[13px] rounded-full hover:bg-white/10 transition-colors border border-white/20"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'See how it works' : 'कैसे काम करता है'}
                  </Link>
                </div>

                {/* Stats */}
                <div className="mt-14 flex gap-10">
                  {[
                    { val: '6.3Cr', label: lang === 'en' ? 'MSMEs in India' : 'भारत में MSMEs' },
                    { val: '95%', label: lang === 'en' ? 'Accuracy' : 'सटीकता' },
                    { val: '<5 min', label: lang === 'en' ? 'To onboard' : 'ऑनबोर्डिंग' },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <div className="text-2xl font-bold text-white tracking-tight">{s.val}</div>
                      <div className="text-[11px] text-blue-200/50 mt-1">{s.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right: animated pipeline showcase */}
              <HeroShowcase lang={lang} />
            </div>
          </div>

          {/* Bottom curve */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" className="w-full">
              <path d="M0 60V30C360 0 1080 0 1440 30V60H0Z" fill="white" />
            </svg>
          </div>
        </div>
      </section>

      {/* ━━━ Trusted by / social proof bar ━━━ */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-gray-300 text-[11px] font-medium tracking-wide">
            <span>{lang === 'en' ? 'Powered by' : 'इनके द्वारा संचालित'}</span>
            <span className="text-gray-400 font-semibold text-sm">AWS Bedrock</span>
            <span className="text-gray-400 font-semibold text-sm">AWS Translate</span>
            <span className="text-gray-400 font-semibold text-sm">Titan Embeddings</span>
            <span className="text-gray-400 font-semibold text-sm">ONDC</span>
          </div>
        </div>
      </section>

      {/* ━━━ Features ━━━ */}
      <section id="features" className="bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold text-[#2563EB] tracking-widest mb-3">{lang === 'en' ? 'WHAT IT DOES' : 'यह क्या करता है'}</p>
            <h2 className="text-2xl md:text-[2rem] font-bold text-gray-900 tracking-tight">
              {lang === 'en' ? 'Three tools, one platform' : 'तीन टूल्स, एक प्लेटफॉर्म'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Package,
                title: lang === 'en' ? 'CatalogAI' : 'कैटलॉग AI',
                desc: lang === 'en'
                  ? 'Speak about your products in Hindi or English. Get a marketplace-ready catalog with categories and HSN codes in seconds.'
                  : 'हिंदी या अंग्रेजी में अपने प्रोडक्ट बताएं। सेकंडों में कैटलॉग तैयार, श्रेणी और HSN कोड के साथ।',
                color: 'bg-blue-50 text-[#2563EB]',
              },
              {
                icon: Target,
                title: lang === 'en' ? 'MatchMaker' : 'मैचमेकर',
                desc: lang === 'en'
                  ? 'We score 15+ platforms on five factors and show you exactly where your products will perform best.'
                  : 'हम पांच कारकों पर 15+ प्लेटफॉर्म का मूल्यांकन करते हैं और बताते हैं कि आपके प्रोडक्ट कहां सबसे अच्छा बिकेंगे।',
                color: 'bg-violet-50 text-violet-600',
              },
              {
                icon: TrendingUp,
                title: lang === 'en' ? 'PriceWise' : 'प्राइसवाइज़',
                desc: lang === 'en'
                  ? 'See what similar products sell for, track demand trends, and discover new regions where your products are wanted.'
                  : 'देखें कि मिलते-जुलते प्रोडक्ट कितने में बिकते हैं, डिमांड ट्रेंड ट्रैक करें, और नए बाज़ार खोजें।',
                color: 'bg-amber-50 text-amber-600',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300"
              >
                <div className={`w-11 h-11 mb-5 rounded-xl ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 text-[15px] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-[13px] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Stories ━━━ */}
      <section id="stories" className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[11px] font-semibold text-[#2563EB] tracking-widest mb-3">{lang === 'en' ? 'REAL STORIES' : 'असली कहानियां'}</p>
              <h2 className="text-2xl md:text-[2rem] font-bold text-gray-900 tracking-tight">
                {lang === 'en' ? 'Built for artisans, weavers, and makers' : 'कारीगरों, बुनकरों और निर्माताओं के लिए बना'}
              </h2>
            </div>
            <Link
              href="/onboard"
              className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 text-gray-700 text-[13px] font-medium rounded-full hover:bg-gray-50 transition-colors"
            >
              {lang === 'en' ? 'Try it yourself' : 'खुद आज़माएं'}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {SCENARIOS[lang].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href="/onboard" className="group block">
                  <div className="relative bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] rounded-2xl h-56 flex items-center justify-center overflow-hidden mb-4 group-hover:shadow-lg group-hover:shadow-blue-100/60 transition-all duration-300">
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-500">{s.emoji}</span>
                    <span className="absolute top-3.5 right-3.5 px-2.5 py-1 bg-[#2563EB] text-white text-[10px] font-medium rounded-full">
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-1">{s.location}</p>
                  <h3 className="font-semibold text-gray-900 text-[15px]">{s.name}</h3>
                  <p className="text-[13px] text-gray-500 mt-1">{s.product}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[11px] bg-blue-50 text-[#2563EB] px-2.5 py-1 rounded-full font-medium">{s.platform} ({s.score})</span>
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{s.price}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Why VyaparSetu ━━━ */}
      <section className="bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[11px] font-semibold text-[#2563EB] tracking-widest mb-3">{lang === 'en' ? 'WHY VYAPARSETU' : 'व्यापारसेतु क्यों'}</p>
              <h2 className="text-2xl md:text-[2rem] font-bold text-gray-900 tracking-tight leading-snug">
                {lang === 'en'
                  ? 'Leveling the playing field for small businesses'
                  : 'छोटे कारोबारियों के लिए बराबरी का मौका'}
              </h2>
            </div>
            <div className="divide-y divide-gray-200/70">
              {BENEFITS[lang].map((b, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenBenefit(openBenefit === i ? null : i)}
                    className="w-full flex items-center justify-between py-4 text-left group"
                  >
                    <span className={`text-[13px] font-medium transition-colors ${openBenefit === i ? 'text-[#2563EB]' : 'text-gray-800 group-hover:text-[#2563EB]'}`}>
                      {b.title}
                    </span>
                    {openBenefit === i
                      ? <Minus className="w-4 h-4 text-[#2563EB] flex-shrink-0 ml-4" />
                      : <Plus className="w-4 h-4 text-gray-300 group-hover:text-[#2563EB] flex-shrink-0 ml-4" />}
                  </button>
                  {openBenefit === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-[13px] text-gray-500 leading-relaxed pb-4 pr-8"
                    >
                      {b.desc}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Banner ━━━ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex gap-4 text-5xl md:text-6xl">
            <span>🏺</span><span>🧵</span><span>🌶️</span>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              {lang === 'en' ? 'From local craft to national commerce' : 'स्थानीय शिल्प से राष्ट्रीय कॉमर्स तक'}
            </h2>
            <p className="mt-3 text-blue-100/60 text-[14px] max-w-md leading-relaxed">
              {lang === 'en'
                ? 'Brass artisans in Moradabad, silk weavers in Varanasi, spice farmers in Kerala. We help them all reach the right buyers.'
                : 'मुरादाबाद के पीतल कारीगर, वाराणसी के रेशम बुनकर, केरल के मसाला किसान। हम सभी को सही खरीदारों तक पहुंचाते हैं।'}
            </p>
          </div>
        </div>
      </section>

      {/* ━━━ How it works ━━━ */}
      <section id="how" className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold text-[#2563EB] tracking-widest mb-3">{lang === 'en' ? 'HOW IT WORKS' : 'कैसे काम करता है'}</p>
            <h2 className="text-2xl md:text-[2rem] font-bold text-gray-900 tracking-tight">
              {lang === 'en' ? 'Three steps to your first listing' : 'आपकी पहली लिस्टिंग के लिए तीन कदम'}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS[lang].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center"
              >
                <div className="bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] rounded-2xl h-44 flex items-center justify-center mb-5 group-hover:shadow-lg group-hover:shadow-blue-100/60 transition-all duration-300">
                  <span className="text-5xl">{step.img}</span>
                </div>
                <span className="text-[11px] font-bold text-[#2563EB]">{step.num}</span>
                <h3 className="font-semibold text-gray-900 text-[15px] mt-1">{step.title}</h3>
                <p className="text-[13px] text-gray-500 mt-2 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section className="bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="bg-white rounded-3xl border border-gray-100 p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-2xl md:text-[1.75rem] font-bold text-gray-900 tracking-tight leading-snug">
                {lang === 'en' ? 'Ready to get your products online?' : 'अपने प्रोडक्ट ऑनलाइन लाने के लिए तैयार?'}
              </h2>
              <p className="mt-3 text-gray-500 text-[14px] leading-relaxed">
                {lang === 'en'
                  ? 'It takes less than 5 minutes. Just speak about what you make and we handle the rest.'
                  : '5 मिनट से भी कम समय लगता है। बस बताएं कि आप क्या बनाते हैं, बाकी हम संभालेंगे।'}
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                href="/onboard"
                className="inline-flex items-center gap-2 px-7 py-3 bg-[#2563EB] text-white font-medium text-[13px] rounded-full hover:bg-[#1D4ED8] transition-colors shadow-lg shadow-blue-200/40"
              >
                <Mic className="w-4 h-4" />
                {lang === 'en' ? 'Get started' : 'शुरू करें'}
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-7 py-3 border border-gray-200 text-gray-700 font-medium text-[13px] rounded-full hover:bg-gray-50 transition-colors"
              >
                {lang === 'en' ? 'View dashboard' : 'डैशबोर्ड देखें'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Footer ━━━ */}
      <footer className="bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-gray-800">
            <div className="text-white font-semibold text-[15px]">VyaparSetu</div>
            <div className="flex gap-6 text-[13px] text-gray-500">
              <Link href="/onboard" className="hover:text-gray-300 transition-colors">{lang === 'en' ? 'Onboard' : 'ऑनबोर्ड'}</Link>
              <Link href="/chat" className="hover:text-gray-300 transition-colors">{lang === 'en' ? 'Chat' : 'चैट'}</Link>
              <Link href="/dashboard" className="hover:text-gray-300 transition-colors">{lang === 'en' ? 'Dashboard' : 'डैशबोर्ड'}</Link>
            </div>
          </div>
          <p className="text-[11px] text-gray-600 mt-6">
            {lang === 'en'
              ? 'Built by Team XphoraAI for AI for Bharat 2026. Powered by AWS.'
              : 'टीम XphoraAI द्वारा AI for Bharat 2026 के लिए निर्मित। AWS द्वारा संचालित।'}
          </p>
        </div>
      </footer>
    </main>
  )
}
