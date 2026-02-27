'use client'

import { motion } from 'framer-motion'
import { BAND_COLORS } from '@/lib/constants'
import { Check } from 'lucide-react'

interface CategoryCardProps {
  category: string
  code: string
  confidence: number
  band: 'GREEN' | 'YELLOW' | 'RED'
  rank: number
  isSelected?: boolean
  onSelect?: () => void
}

export default function CategoryCard({ category, code, confidence, band, rank, isSelected, onSelect }: CategoryCardProps) {
  const colors = BAND_COLORS[band]
  const pct = Math.round(confidence * 100 * 10) / 10

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.15, duration: 0.4 }}
      onClick={onSelect}
      className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
        isSelected ? `${colors.border} bg-white shadow-md` : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              #{rank + 1}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              {band}
            </span>
          </div>
          <p className="font-medium text-gray-800 text-sm">{category}</p>
          <p className="text-xs text-gray-500 mt-0.5">Code: {code}</p>
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-6 h-6 rounded-full ${colors.bar} flex items-center justify-center`}
          >
            <Check className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>

      {/* Confidence bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Confidence</span>
          <span className={`font-semibold ${colors.text}`}>{pct}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: rank * 0.15 + 0.3, ease: 'easeOut' }}
            className={`h-full rounded-full ${colors.bar}`}
          />
        </div>
      </div>
    </motion.div>
  )
}
