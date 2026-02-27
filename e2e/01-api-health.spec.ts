import { test, expect } from '@playwright/test';
import { API, PERSONAS } from './helpers';

test.describe('Backend API Health & Demo Data', () => {

  test('GET /health returns healthy', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('VyaparSetu AI');
  });

  test('POST /api/catalog/classify — Ramesh brass (Hindi demo)', async ({ request }) => {
    const res = await request.post(`${API}/api/catalog/classify`, {
      data: { text: PERSONAS.ramesh.inputHi, language: 'hi' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();

    // Classification matches demo cache
    expect(body.original_text).toBe(PERSONAS.ramesh.inputHi);
    expect(body.top_categories).toHaveLength(3);
    expect(body.top_categories[0].category).toBe(PERSONAS.ramesh.category);
    expect(body.top_categories[0].code).toBe(PERSONAS.ramesh.code);
    expect(body.top_categories[0].confidence).toBeCloseTo(PERSONAS.ramesh.confidence, 2);
    expect(body.top_categories[0].band).toBe('GREEN');
    expect(body.hsn_code).toBe(PERSONAS.ramesh.hsn);

    // Attributes present
    expect(body.attributes.material).toBeTruthy();
    expect(body.attributes.origin).toBeTruthy();

    // ONDC catalog generated
    expect(body.ondc_catalog).toBeTruthy();
    expect(body.ondc_catalog.context.bpp_id).toBe('vyaparsetu.ai');

    // Processing time present
    expect(body.processing_time_ms).toBeGreaterThan(0);
  });

  test('POST /api/catalog/classify — Priya spices (English demo)', async ({ request }) => {
    const res = await request.post(`${API}/api/catalog/classify`, {
      data: { text: PERSONAS.priya.inputEn, language: 'en' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();

    expect(body.top_categories[0].category).toBe(PERSONAS.priya.category);
    expect(body.top_categories[0].confidence).toBeCloseTo(PERSONAS.priya.confidence, 2);
    expect(body.hsn_code).toBe(PERSONAS.priya.hsn);
  });

  test('POST /api/match/recommend — brass decoratives returns top 3', async ({ request }) => {
    const res = await request.post(`${API}/api/match/recommend`, {
      data: {
        product_category: PERSONAS.ramesh.category,
        product_description: PERSONAS.ramesh.inputEn,
        location: 'India',
        language: 'en',
        business_type: 'B2C',
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();

    expect(body.top_platforms).toHaveLength(3);
    expect(body.top_platforms[0].platform).toBe(PERSONAS.ramesh.topPlatform);
    expect(body.top_platforms[0].score).toBeCloseTo(PERSONAS.ramesh.platformScore, 1);

    // Each platform has all 5 factors
    for (const p of body.top_platforms) {
      expect(p.factors).toHaveProperty('domain');
      expect(p.factors).toHaveProperty('geography');
      expect(p.factors).toHaveProperty('capacity');
      expect(p.factors).toHaveProperty('history');
      expect(p.factors).toHaveProperty('specialization');
      expect(p.explanation_en).toBeTruthy();
      expect(p.explanation_hi).toBeTruthy();
    }
  });

  test('GET /api/intelligence/pricing — brass decoratives returns pricing data', async ({ request }) => {
    const res = await request.get(
      `${API}/api/intelligence/pricing/${encodeURIComponent(PERSONAS.ramesh.category)}`
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();

    expect(body.products.length).toBeGreaterThan(0);
    expect(body.demand_trends.length).toBe(12);
    expect(body.peak_season).toContain('Diwali');
    expect(body.growth_yoy).toBeGreaterThan(0);

    // Pricing insight present (demo cache)
    expect(body.insight).toBeTruthy();
    expect(body.insight.product).toBe(PERSONAS.ramesh.pricingProduct);
    expect(body.insight.your_price).toBe(PERSONAS.ramesh.yourPrice);
    expect(body.insight.category_median).toBe(PERSONAS.ramesh.categoryMedian);
    expect(body.insight.recommendation_en).toBeTruthy();
    expect(body.insight.recommendation_hi).toBeTruthy();

    // Geo insight present
    expect(body.geo_insight).toBeTruthy();
    expect(body.geo_insight.expansion_regions).toEqual(
      expect.arrayContaining(PERSONAS.ramesh.expansionRegions)
    );
  });

  test('GET /api/admin/dashboard returns metrics structure', async ({ request }) => {
    const res = await request.get(`${API}/api/admin/dashboard`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();

    expect(body).toHaveProperty('total_onboarded');
    expect(body).toHaveProperty('avg_confidence');
    expect(body).toHaveProperty('avg_processing_time_ms');
    expect(body).toHaveProperty('band_distribution');
    expect(body).toHaveProperty('recent_classifications');
    expect(body.band_distribution).toHaveProperty('GREEN');
    expect(body.band_distribution).toHaveProperty('YELLOW');
    expect(body.band_distribution).toHaveProperty('RED');
  });
});
