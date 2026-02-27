'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts'

interface DemandTrendChartProps {
  data: { month: string; index: number }[]
  peakSeason: string
  growthYoY: number
  language: 'en' | 'hi'
}

export default function DemandTrendChart({ data, peakSeason, growthYoY, language }: DemandTrendChartProps) {
  if (!data || data.length === 0) return null

  const maxIndex = Math.max(...data.map(d => d.index))
  const avgIndex = Math.round(data.reduce((sum, d) => sum + d.index, 0) / data.length)

  // Find peak months (index > 120)
  const peakMonths = data.filter(d => d.index > 120).map(d => d.month)
  const peakStart = peakMonths.length > 0 ? peakMonths[0] : null
  const peakEnd = peakMonths.length > 0 ? peakMonths[peakMonths.length - 1] : null

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800 text-sm">
          {language === 'en' ? 'Demand Trend (12 months)' : 'मांग रुझान (12 महीने)'}
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
            {growthYoY > 0 ? '+' : ''}{growthYoY}% YoY
          </span>
          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
            Peak: {peakSeason}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            domain={[60, maxIndex + 20]}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            formatter={(value: number) => [
              `${value} (${value > 100 ? `+${value - 100}%` : `${value - 100}%`} vs avg)`,
              language === 'en' ? 'Demand Index' : 'मांग सूचकांक'
            ]}
          />
          {/* Highlight peak season */}
          {peakStart && peakEnd && (
            <ReferenceArea
              x1={peakStart}
              x2={peakEnd}
              fill="#FF6B35"
              fillOpacity={0.08}
              stroke="#FF6B35"
              strokeOpacity={0.3}
              strokeDasharray="3 3"
            />
          )}
          {/* Average line */}
          <ReferenceLine
            y={avgIndex}
            stroke="#9ca3af"
            strokeDasharray="4 4"
            label={{ value: `Avg: ${avgIndex}`, position: 'right', fontSize: 10, fill: '#9ca3af' }}
          />
          <Area
            type="monotone"
            dataKey="index"
            stroke="#2563EB"
            strokeWidth={2.5}
            fill="url(#demandGradient)"
            dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Peak callout */}
      <div className="flex items-center justify-between mt-3 px-1">
        <p className="text-[11px] text-gray-400">
          {language === 'en'
            ? `Peak demand ${maxIndex - 100}% above average`
            : `शिखर मांग औसत से ${maxIndex - 100}% अधिक`}
        </p>
        <p className="text-[11px] text-green-600 font-medium">
          {language === 'en'
            ? `Growing ${growthYoY}% year-over-year`
            : `सालाना ${growthYoY}% बढ़ रहा है`}
        </p>
      </div>
    </div>
  )
}
