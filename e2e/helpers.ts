import { Page, expect } from '@playwright/test';

export const API = 'http://localhost:8000';

/** The 3 demo personas with their expected data */
export const PERSONAS = {
  ramesh: {
    name: 'Ramesh Kumar',
    inputHi: 'Main peetal ke decorative items banata hoon - flower vase, diya stand, candle holder',
    inputEn: 'I make brass decorative items - flower vase, diya stand, candle holder',
    lang: 'hi' as const,
    category: 'Home & Decor > Metalware > Brass Decoratives',
    categoryShort: 'Brass Decoratives',
    code: 'HD-MW-BD',
    hsn: '7418',
    confidence: 0.923,
    topPlatform: 'Amazon Karigar',
    platformScore: 0.89,
    pricingProduct: 'Brass Flower Vase',
    yourPrice: 450,
    categoryMedian: 490,
    peakSeason: 'Oct-Nov (Diwali)',
    expansionRegions: ['Maharashtra', 'Karnataka', 'Tamil Nadu'],
  },
  lakshmi: {
    name: 'Lakshmi Devi',
    inputHi: 'Banarasi silk saree banati hoon, zari work ke saath, shaadi ke liye',
    inputEn: 'I make Banarasi silk sarees with zari work, for weddings',
    lang: 'hi' as const,
    category: 'Fashion > Ethnic Wear > Silk Sarees',
    categoryShort: 'Silk Sarees',
    code: 'FA-EW-SS',
    hsn: '5007',
    confidence: 0.961,
    topPlatform: 'Myntra',
    platformScore: 0.91,
    pricingProduct: 'Banarasi Silk Saree (Zari Work)',
    yourPrice: 3200,
    categoryMedian: 2800,
    peakSeason: 'Oct-Feb (Wedding Season & Festivals)',
    expansionRegions: ['Gujarat', 'Rajasthan', 'Maharashtra'],
  },
  priya: {
    name: 'Priya Menon',
    inputEn: 'We produce organic black pepper and cardamom, export quality, FSSAI certified',
    inputHi: 'Hum organic kali mirch aur elaichi produce karte hain, export quality, FSSAI certified',
    lang: 'en' as const,
    category: 'Food & Beverages > Spices > Organic Spices',
    categoryShort: 'Organic Spices',
    code: 'FB-SP-OS',
    hsn: '0904',
    confidence: 0.947,
    topPlatform: 'IndiaMART',
    platformScore: 0.87,
    pricingProduct: 'Organic Black Pepper',
    yourPrice: 1200,
    categoryMedian: 950,
    peakSeason: 'Sep-Dec (Festive Season & Winter Demand)',
    expansionRegions: ['Delhi-NCR', 'Mumbai', 'Bangalore'],
  },
} as const;

export type PersonaKey = keyof typeof PERSONAS;

/** Type text into the VoiceRecorder input and send via Enter key */
export async function typeAndSend(page: Page, text: string) {
  const input = page.locator('input[type="text"]').last();
  await input.fill(text);
  await input.press('Enter');
}

/** Wait for the classification spinner to finish */
export async function waitForClassification(page: Page) {
  // Wait for spinner to disappear and results to appear
  await expect(page.getByText('AI Classification Results').or(page.getByText('AI वर्गीकरण परिणाम'))).toBeVisible({ timeout: 20_000 });
}

/** Wait for platform matching to complete */
export async function waitForMatching(page: Page) {
  await expect(page.getByText('Recommended Platforms').or(page.getByText('अनुशंसित प्लेटफॉर्म'))).toBeVisible({ timeout: 20_000 });
}
