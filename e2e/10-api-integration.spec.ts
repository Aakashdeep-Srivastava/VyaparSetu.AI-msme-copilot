import { test, expect } from '@playwright/test';
import { API, PERSONAS } from './helpers';

test.describe('API Integration — Edge Cases & Data Integrity', () => {

  test('classify all 3 demo personas sequentially, verify dashboard aggregates', async ({ request }) => {
    // Classify all 3
    const results = [];
    for (const [key, persona] of Object.entries(PERSONAS)) {
      const text = persona.lang === 'hi' ? persona.inputHi : persona.inputEn;
      const res = await request.post(`${API}/api/catalog/classify`, {
        data: { text, language: persona.lang },
      });
      expect(res.ok()).toBeTruthy();
      results.push(await res.json());
    }

    // All 3 classified correctly
    expect(results[0].top_categories[0].category).toBe(PERSONAS.ramesh.category);
    expect(results[1].top_categories[0].category).toBe(PERSONAS.lakshmi.category);
    expect(results[2].top_categories[0].category).toBe(PERSONAS.priya.category);

    // Dashboard should reflect the new classifications
    const dashRes = await request.get(`${API}/api/admin/dashboard`);
    const dash = await dashRes.json();
    expect(dash.total_onboarded).toBeGreaterThanOrEqual(3);
    expect(dash.avg_confidence).toBeGreaterThan(0.8);
    expect(dash.band_distribution.GREEN).toBeGreaterThanOrEqual(3);
  });

  test('match + pricing for each demo category produces valid results', async ({ request }) => {
    for (const [key, persona] of Object.entries(PERSONAS)) {
      // Match
      const matchRes = await request.post(`${API}/api/match/recommend`, {
        data: {
          product_category: persona.category,
          product_description: persona.inputEn,
          location: 'India',
          language: 'en',
          business_type: key === 'priya' ? 'B2B' : 'B2C',
        },
      });
      expect(matchRes.ok()).toBeTruthy();
      const match = await matchRes.json();
      expect(match.top_platforms).toHaveLength(3);
      expect(match.top_platforms[0].platform).toBe(persona.topPlatform);

      // All scores between 0 and 1
      for (const p of match.top_platforms) {
        expect(p.score).toBeGreaterThan(0);
        expect(p.score).toBeLessThanOrEqual(1);
      }

      // Pricing
      const priceRes = await request.get(
        `${API}/api/intelligence/pricing/${encodeURIComponent(persona.category)}`
      );
      expect(priceRes.ok()).toBeTruthy();
      const price = await priceRes.json();
      expect(price.products.length).toBeGreaterThan(0);
      expect(price.demand_trends).toHaveLength(12);
      expect(price.insight).toBeTruthy();
      expect(price.insight.recommendation_en).toBeTruthy();
      expect(price.insight.recommendation_hi).toBeTruthy();
    }
  });

  test('pricing for unknown category returns empty gracefully', async ({ request }) => {
    const res = await request.get(
      `${API}/api/intelligence/pricing/${encodeURIComponent('Unknown > Category > Foo')}`
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.products).toHaveLength(0);
    expect(body.insight).toBeNull();
  });

  test('translate endpoint works', async ({ request }) => {
    const res = await request.post(`${API}/api/catalog/translate`, {
      data: {
        text: 'Hello world',
        source_lang: 'en',
        target_lang: 'hi',
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.original_text).toBe('Hello world');
    expect(body.translated_text).toBeTruthy();
  });

  test('admin override endpoint works', async ({ request }) => {
    // First classify to create a record
    const classRes = await request.post(`${API}/api/catalog/classify`, {
      data: { text: PERSONAS.ramesh.inputEn, language: 'en' },
    });
    expect(classRes.ok()).toBeTruthy();

    // Get dashboard to find the record ID
    const dashRes = await request.get(`${API}/api/admin/dashboard`);
    const dash = await dashRes.json();
    const recordId = dash.recent_classifications?.[0]?.id;

    if (recordId) {
      const overrideRes = await request.post(`${API}/api/admin/override`, {
        data: {
          record_id: recordId,
          field: 'category',
          old_value: PERSONAS.ramesh.category,
          new_value: 'Art & Craft > Metal Art > Metal Art',
          reason: 'E2E test override',
          admin_id: 'e2e_test',
        },
      });
      expect(overrideRes.ok()).toBeTruthy();
      const body = await overrideRes.json();
      expect(body.success).toBe(true);
      expect(body.audit_id).toBeTruthy();
    }
  });

  test('pricing with your_price query param', async ({ request }) => {
    const res = await request.get(
      `${API}/api/intelligence/pricing/${encodeURIComponent(PERSONAS.ramesh.category)}?your_price=450`
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.insight).toBeTruthy();
    expect(body.insight.your_price).toBe(450);
  });

  test('classification returns ONDC catalog with correct structure', async ({ request }) => {
    const res = await request.post(`${API}/api/catalog/classify`, {
      data: { text: PERSONAS.ramesh.inputHi, language: 'hi' },
    });
    const body = await res.json();

    const catalog = body.ondc_catalog;
    expect(catalog).toBeTruthy();

    // Context
    expect(catalog.context.domain).toBe('nic2004:52110');
    expect(catalog.context.action).toBe('on_search');
    expect(catalog.context.bpp_id).toBe('vyaparsetu.ai');

    // Message catalog structure
    expect(catalog.message.catalog.descriptor.name).toBeTruthy();
    expect(catalog.message.catalog.category_id).toBe(PERSONAS.ramesh.code);
    expect(catalog.message.catalog.fulfillment_id).toBe('F1');
    expect(catalog.message.catalog.price.currency).toBe('INR');
    expect(catalog.message.catalog.tags).toBeInstanceOf(Array);
  });
});
