'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PLATFORM_LOGOS } from '@/lib/constants'
import RadarChart from './RadarChart'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

interface PlatformCardProps {
  platform: string
  score: number
  factors: { domain: number; geography: number; capacity: number; history: number; specialization: number }
  explanation: string
  rank: number
  language: 'en' | 'hi'
}

export default function PlatformCard({ platform, score, factors, explanation, rank, language }: PlatformCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const logo = PLATFORM_LOGOS[platform] || '🏪'
  const scoreColor = score >= 0.85 ? 'text-green-600 bg-green-50' : score >= 0.7 ? 'text-blue-600 bg-blue-50' : 'text-orange-600 bg-orange-50'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.2, duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
              {logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400">#{rank + 1}</span>
                <h3 className="font-semibold text-gray-800">{platform}</h3>
              </div>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg font-bold text-lg ${scoreColor}`}>
            {score.toFixed(2)}
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-3 leading-relaxed">{explanation}</p>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-xs text-[#2563EB] font-medium mt-3 hover:underline"
        >
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showDetails ? (language === 'hi' ? 'कम देखें' : 'Show less') : (language === 'hi' ? 'स्कोर विवरण' : 'Score breakdown')}
        </button>
      </div>

      {showDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-gray-100 p-4 bg-gray-50"
        >
          <div className="flex justify-center">
            <RadarChart factors={factors} size={180} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {Object.entries(factors).map(([key, val]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-500 capitalize">{key}</span>
                <span className="font-medium text-gray-700">{(val as number).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
