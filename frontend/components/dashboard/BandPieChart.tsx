'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface BandPieChartProps {
  distribution: { GREEN: number; YELLOW: number; RED: number }
}

const COLORS = { GREEN: '#22C55E', YELLOW: '#EAB308', RED: '#EF4444' }

export default function BandPieChart({ distribution }: BandPieChartProps) {
  const data = [
    { name: 'GREEN (Auto)', value: distribution.GREEN, color: COLORS.GREEN },
    { name: 'YELLOW (Review)', value: distribution.YELLOW, color: COLORS.YELLOW },
    { name: 'RED (Manual)', value: distribution.RED, color: COLORS.RED },
  ].filter(d => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No classification data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [value, 'Count']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
