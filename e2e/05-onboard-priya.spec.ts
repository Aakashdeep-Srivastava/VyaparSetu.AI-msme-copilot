import { test, expect } from '@playwright/test';
import { PERSONAS, typeAndSend, waitForClassification, waitForMatching } from './helpers';

const persona = PERSONAS.priya;

test.describe('Onboarding Flow — Priya Menon (English, Organic Spices)', () => {

  test('complete onboarding with organic spices classification', async ({ page }) => {
    await page.goto('/onboard');

    // Step 1: Continue with English
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: Type Priya's English input
    await typeAndSend(page, persona.inputEn);

    // Step 3: Classification
    await waitForClassification(page);

    // Top category: Organic Spices
    await expect(page.getByText(persona.category).first()).toBeVisible();
    await expect(page.getByText(persona.code).first()).toBeVisible();
    await expect(page.getByText('94.7%').first()).toBeVisible();
    await expect(page.getByText(persona.hsn).first()).toBeVisible();

    // Attributes — FSSAI certification and Kerala origin
    await expect(page.getByText('FSSAI').first()).toBeVisible();
    await expect(page.getByText('Kerala').first()).toBeVisible();

    // Find platforms
    await page.getByRole('button', { name: 'Find Best Platforms' }).click();

    // Step 4: Matching
    await waitForMatching(page);

    // Top platform: IndiaMART (B2B)
    await expect(page.getByRole('heading', { name: 'IndiaMART' })).toBeVisible();
    await expect(page.getByText('0.87').first()).toBeVisible();

    // Also: TradeIndia and ExportersIndia
    await expect(page.getByRole('heading', { name: 'TradeIndia' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ExportersIndia' })).toBeVisible();

    // Pricing
    await expect(page.getByText('Price Intelligence')).toBeVisible({ timeout: 10_000 });

    // Organic certification mention in recommendation
    await expect(page.getByText(/organic|Premium pricing/i).first()).toBeVisible();

    // Geographic insight
    await expect(page.getByText('Geographic Expansion Opportunity')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Delhi-NCR').first()).toBeVisible();
    await expect(page.getByText('Mumbai').first()).toBeVisible();

    // Complete
    await page.getByRole('button', { name: 'Complete Onboarding' }).click();
    await expect(page.getByText('Onboarding Complete!')).toBeVisible();
    await expect(page.getByText(persona.categoryShort).first()).toBeVisible();
    await expect(page.getByText('IndiaMART').first()).toBeVisible();
  });
});
