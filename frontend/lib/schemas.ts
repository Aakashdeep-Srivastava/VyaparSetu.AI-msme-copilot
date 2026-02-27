import { z } from 'zod'

export const ConfidenceBandSchema = z.enum(['GREEN', 'YELLOW', 'RED'])

export const CategoryResultSchema = z.object({
  category: z.string(),
  code: z.string(),
  confidence: z.number(),
  band: ConfidenceBandSchema,
})

export const ClassifyResponseSchema = z.object({
  original_text: z.string(),
  translated_text: z.string().nullable().optional(),
  language_detected: z.string(),
  top_categories: z.array(CategoryResultSchema),
  hsn_code: z.string(),
  attributes: z.record(z.any()),
  ondc_catalog: z.record(z.any()).nullable().optional(),
  processing_time_ms: z.number(),
})

export const MatchFactorSchema = z.object({
  domain: z.number(),
  geography: z.number(),
  capacity: z.number(),
  history: z.number(),
  specialization: z.number(),
})

export const PlatformMatchSchema = z.object({
  platform: z.string(),
  score: z.number(),
  factors: MatchFactorSchema,
  explanation_hi: z.string(),
  explanation_en: z.string(),
})

export const MatchResponseSchema = z.object({
  msme_profile: z.record(z.any()),
  top_platforms: z.array(PlatformMatchSchema),
  processing_time_ms: z.number(),
})

export type ClassifyResponse = z.infer<typeof ClassifyResponseSchema>
export type CategoryResult = z.infer<typeof CategoryResultSchema>
export type ConfidenceBand = z.infer<typeof ConfidenceBandSchema>
export type MatchResponse = z.infer<typeof MatchResponseSchema>
export type PlatformMatch = z.infer<typeof PlatformMatchSchema>
export type MatchFactor = z.infer<typeof MatchFactorSchema>
