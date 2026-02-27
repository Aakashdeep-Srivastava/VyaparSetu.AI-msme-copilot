'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDashboard, useOverride } from '@/lib/api'
import { LANGUAGES } from '@/lib/constants'
import BandPieChart from '@/components/dashboard/BandPieChart'
import MetricsGrid from '@/components/dashboard/MetricsGrid'
import Link from 'next/link'
import {
  ArrowLeft, RefreshCw, Package, Shield, Clock, Globe,
  CheckCircle, AlertTriangle, XCircle, X, FileEdit
} from 'lucide-react'

const BAND_BADGE: Record<string, { bg: string; text: string; icon: any }> = {
  GREEN: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  YELLOW: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle },
  RED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
}

const T = {
  en: {
    title: 'Admin Dashboard',
    subtitle: 'VyaparSetu AI - Classification & Matching Monitor',
    refresh: 'Refresh',
    loading: 'Loading dashboard...',
    bandDist: 'Confidence Band Distribution',
    baseline: 'Baseline vs VyaparSetu AI',
    recentClass: 'Recent Classifications',
    records: 'records',
    noData: 'No classifications yet. Start onboarding to see data here.',
    overrideTitle: 'Override Classification',
    recordId: 'Record ID',
    currentCat: 'Current Category',
    newCat: 'New Category',
    reason: 'Reason',
    cancel: 'Cancel',
    apply: 'Apply Override',
    saving: 'Saving...',
    enterCat: 'Enter corrected category',
    whyOverride: 'Why is this override needed?',
    override: 'Override',
    id: 'ID', input: 'Input', category: 'Category', confidence: 'Confidence',
    band: 'Band', hsn: 'HSN', time: 'Time', actions: 'Actions',
    metric: 'Metric', baselineCol: 'Baseline', aiCol: 'VyaparSetu AI', improvement: 'Improvement',
    rows: [
      { metric: 'Catalog Creation Time', baseline: '2-4 hours', ai: '<5 minutes', imp: '97%' },
      { metric: 'Classification Accuracy', baseline: '~60%', ai: '95%+', imp: '58%' },
      { metric: 'Matching NDCG@3', baseline: '~0.45', ai: '0.80+', imp: '78%' },
      { metric: 'Language Support', baseline: 'English only', ai: 'Hindi + English', imp: '-' },
      { metric: 'Cost per Onboarding', baseline: '₹500+', ai: '₹15', imp: '97%' },
    ],
  },
  hi: {
    title: 'एडमिन डैशबोर्ड',
    subtitle: 'व्यापारसेतु AI - वर्गीकरण और मैचिंग मॉनिटर',
    refresh: 'रिफ्रेश',
    loading: 'डैशबोर्ड लोड हो रहा है...',
    bandDist: 'कॉन्फिडेंस बैंड वितरण',
    baseline: 'बेसलाइन vs व्यापारसेतु AI',
    recentClass: 'हालिया वर्गीकरण',
    records: 'रिकॉर्ड',
    noData: 'अभी तक कोई वर्गीकरण नहीं। डेटा देखने के लिए ऑनबोर्डिंग शुरू करें।',
    overrideTitle: 'वर्गीकरण ओवरराइड',
    recordId: 'रिकॉर्ड ID',
    currentCat: 'वर्तमान श्रेणी',
    newCat: 'नई श्रेणी',
    reason: 'कारण',
    cancel: 'रद्द करें',
    apply: 'ओवरराइड लागू करें',
    saving: 'सेव हो रहा है...',
    enterCat: 'सही श्रेणी दर्ज करें',
    whyOverride: 'ओवरराइड क्यों आवश्यक है?',
    override: 'ओवरराइड',
    id: 'ID', input: 'इनपुट', category: 'श्रेणी', confidence: 'विश्वास',
    band: 'बैंड', hsn: 'HSN', time: 'समय', actions: 'कार्य',
    metric: 'मापदंड', baselineCol: 'बेसलाइन', aiCol: 'व्यापारसेतु AI', improvement: 'सुधार',
    rows: [
      { metric: 'कैटलॉग बनाने का समय', baseline: '2-4 घंटे', ai: '<5 मिनट', imp: '97%' },
      { metric: 'वर्गीकरण सटीकता', baseline: '~60%', ai: '95%+', imp: '58%' },
      { metric: 'मैचिंग NDCG@3', baseline: '~0.45', ai: '0.80+', imp: '78%' },
      { metric: 'भाषा सहायता', baseline: 'सिर्फ अंग्रेजी', ai: 'हिंदी + अंग्रेजी', imp: '-' },
      { metric: 'प्रति ऑनबोर्डिंग लागत', baseline: '₹500+', ai: '₹15', imp: '97%' },
    ],
  },
}

export default function DashboardPage() {
  const { data, isLoading, refetch } = useDashboard()
  const override = useOverride()
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const t = T[lang]
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [overrideTarget, setOverrideTarget] = useState<any>(null)
  const [overrideValue, setOverrideValue] = useState('')
  const [overrideReason, setOverrideReason] = useState('')

  const handleOverride = async () => {
    if (!overrideTarget || !overrideValue || !overrideReason) return

    try {
      await override.mutateAsync({
        record_id: overrideTarget.id,
        field: 'category',
        old_value: overrideTarget.category,
        new_value: overrideValue,
        reason: overrideReason,
      })
      setShowOverrideModal(false)
      setOverrideTarget(null)
      setOverrideValue('')
      setOverrideReason('')
      refetch()
    } catch (err) {
      console.error('Override error:', err)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#2563EB] text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t.title}
              </h1>
              <p className="text-sm text-blue-200">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {LANGUAGES[lang].label}
            </button>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {t.refresh}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading && !data ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">{t.loading}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Metrics */}
            <MetricsGrid
              totalOnboarded={data?.total_onboarded || 0}
              avgConfidence={data?.avg_confidence || 0}
              avgProcessingTime={data?.avg_processing_time_ms || 0}
              bandDistribution={data?.band_distribution || { GREEN: 0, YELLOW: 0, RED: 0 }}
            />

            {/* Charts + Table Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Band Distribution Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <h3 className="font-semibold text-gray-800 mb-4">{t.bandDist}</h3>
                <BandPieChart distribution={data?.band_distribution || { GREEN: 0, YELLOW: 0, RED: 0 }} />
              </motion.div>

              {/* Baseline Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2"
              >
                <h3 className="font-semibold text-gray-800 mb-4">{t.baseline}</h3>
                <div className="space-y-4">
                  {t.rows.map((row, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{row.metric}</p>
                      </div>
                      <div className="w-28 text-center">
                        <span className="text-sm text-red-500 bg-red-50 px-2.5 py-1 rounded-full">{row.baseline}</span>
                      </div>
                      <div className="w-28 text-center">
                        <span className="text-sm text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">{row.ai}</span>
                      </div>
                      <div className="w-16 text-right">
                        {row.imp !== '-' && (
                          <span className="text-xs font-bold text-[#2563EB]">↑{row.imp}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent Classifications Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {t.recentClass}
                </h3>
                <span className="text-xs text-gray-400">
                  {data?.recent_classifications?.length || 0} {t.records}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3 text-left">{t.id}</th>
                      <th className="px-6 py-3 text-left">{t.input}</th>
                      <th className="px-6 py-3 text-left">{t.category}</th>
                      <th className="px-6 py-3 text-center">{t.confidence}</th>
                      <th className="px-6 py-3 text-center">{t.band}</th>
                      <th className="px-6 py-3 text-center">{t.hsn}</th>
                      <th className="px-6 py-3 text-center">{t.time}</th>
                      <th className="px-6 py-3 text-center">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(data?.recent_classifications || []).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">
                          {t.noData}
                        </td>
                      </tr>
                    ) : (
                      data?.recent_classifications?.map((record: any, i: number) => {
                        const bandInfo = BAND_BADGE[record.band] || BAND_BADGE.RED
                        const BandIcon = bandInfo.icon
                        return (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 text-xs font-mono text-gray-500">{record.id}</td>
                            <td className="px-6 py-3 text-sm text-gray-700 max-w-[200px] truncate">
                              {record.text}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-700 max-w-[200px]">
                              {record.category?.split(' > ').pop() || record.category}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className="text-sm font-medium text-gray-700">
                                {(record.confidence * 100).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${bandInfo.bg} ${bandInfo.text}`}>
                                <BandIcon className="w-3 h-3" />
                                {record.band}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-center text-sm font-mono text-gray-600">
                              {record.hsn}
                            </td>
                            <td className="px-6 py-3 text-center text-xs text-gray-400">
                              {record.processing_time_ms?.toFixed(0)}ms
                            </td>
                            <td className="px-6 py-3 text-center">
                              <button
                                onClick={() => {
                                  setOverrideTarget(record)
                                  setOverrideValue(record.category)
                                  setShowOverrideModal(true)
                                }}
                                className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 mx-auto"
                              >
                                <FileEdit className="w-3 h-3" />
                                {t.override}
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md shadow-xl"
          >
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-gray-800">{t.overrideTitle}</h3>
              <button onClick={() => setShowOverrideModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.recordId}</label>
                <input
                  type="text"
                  value={overrideTarget?.id || ''}
                  disabled
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-500 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.currentCat}</label>
                <input
                  type="text"
                  value={overrideTarget?.category || ''}
                  disabled
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-500 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.newCat} *</label>
                <input
                  type="text"
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
                  placeholder={t.enterCat}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.reason} *</label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none resize-none"
                  rows={3}
                  placeholder={t.whyOverride}
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleOverride}
                disabled={!overrideValue || !overrideReason || override.isPending}
                className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
              >
                {override.isPending ? t.saving : t.apply}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
}
