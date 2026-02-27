'use client'

import { motion } from 'framer-motion'
import { Users, Target, Clock, TrendingUp } from 'lucide-react'

interface MetricsGridProps {
  totalOnboarded: number
  avgConfidence: number
  avgProcessingTime: number
  bandDistribution: { GREEN: number; YELLOW: number; RED: number }
}

export default function MetricsGrid({ totalOnboarded, avgConfidence, avgProcessingTime, bandDistribution }: MetricsGridProps) {
  const total = bandDistribution.GREEN + bandDistribution.YELLOW + bandDistribution.RED
  const autoRate = total > 0 ? Math.round((bandDistribution.GREEN / total) * 100) : 0

  const metrics = [
    {
      label: 'Total Onboarded',
      value: totalOnboarded.toString(),
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Avg Confidence',
      value: `${(avgConfidence * 100).toFixed(1)}%`,
      icon: Target,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Avg Processing',
      value: `${avgProcessingTime.toFixed(0)}ms`,
      icon: Clock,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Auto-Assign Rate',
      value: `${autoRate}%`,
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
        >
          <div className={`w-10 h-10 rounded-lg ${metric.color} flex items-center justify-center mb-3`}>
            <metric.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
          <p className="text-sm text-gray-500 mt-1">{metric.label}</p>
        </motion.div>
      ))}
    </div>
  )
}
