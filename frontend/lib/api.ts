import { useMutation, useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from './constants'

async function fetchAPI(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// Catalog
export function useClassify() {
  return useMutation({
    mutationFn: (data: { text: string; language: string }) =>
      fetchAPI('/api/catalog/classify', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}

export function useTranslate() {
  return useMutation({
    mutationFn: (data: { text: string; source_lang: string; target_lang: string }) =>
      fetchAPI('/api/catalog/translate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}

// Match
export function useRecommend() {
  return useMutation({
    mutationFn: (data: {
      product_category: string
      product_description: string
      location: string
      language: string
      business_type: string
      lat?: number
      lon?: number
    }) =>
      fetchAPI('/api/match/recommend', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}

// Intelligence
export function usePricing(category: string, enabled = false) {
  return useQuery({
    queryKey: ['pricing', category],
    queryFn: () => fetchAPI(`/api/intelligence/pricing/${encodeURIComponent(category)}`),
    enabled,
  })
}

// Admin
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchAPI('/api/admin/dashboard'),
    refetchInterval: 5000,
  })
}

export function useOverride() {
  return useMutation({
    mutationFn: (data: {
      record_id: string
      field: string
      old_value: string
      new_value: string
      reason: string
      admin_id?: string
    }) =>
      fetchAPI('/api/admin/override', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}
