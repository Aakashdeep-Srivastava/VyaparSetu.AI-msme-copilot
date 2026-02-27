'use client'

import { motion } from 'framer-motion'

interface RadarChartProps {
  factors: { domain: number; geography: number; capacity: number; history: number; specialization: number }
  size?: number
  color?: string
}

export default function RadarChart({ factors, size = 200, color = '#2563EB' }: RadarChartProps) {
  const center = size / 2
  const radius = size / 2 - 30
  const labels = ['Domain', 'Geography', 'Capacity', 'History', 'Special.']
  const values = [factors.domain, factors.geography, factors.capacity, factors.history, factors.specialization]
  const angleStep = (2 * Math.PI) / 5

  const getPoint = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2
    return {
      x: center + radius * value * Math.cos(angle),
      y: center + radius * value * Math.sin(angle),
    }
  }

  const dataPoints = values.map((v, i) => getPoint(v, i))
  const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  // Grid lines
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {gridLevels.map((level) => {
        const points = Array.from({ length: 5 }, (_, i) => getPoint(level, i))
        const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
        return <path key={level} d={d} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      })}

      {/* Axis lines */}
      {Array.from({ length: 5 }, (_, i) => {
        const p = getPoint(1, i)
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="1" />
      })}

      {/* Data polygon */}
      <motion.path
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        d={pathData}
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="2"
        style={{ transformOrigin: `${center}px ${center}px` }}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <motion.circle
          key={i}
          initial={{ r: 0 }}
          animate={{ r: 4 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          cx={p.x}
          cy={p.y}
          fill={color}
        />
      ))}

      {/* Labels */}
      {labels.map((label, i) => {
        const p = getPoint(1.2, i)
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] fill-gray-500 font-medium"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}
