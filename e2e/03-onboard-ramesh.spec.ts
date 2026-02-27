import { test, expect } from '@playwright/test';
import { PERSONAS, typeAndSend, waitForClassification, waitForMatching } from './helpers';

const persona = PERSONAS.ramesh;

test.describe('Onboarding Flow — Ramesh Kumar (Hindi, Brass Decoratives)', () => {

  test('complete 5-step onboarding journey', async ({ page }) => {
    await page.goto('/onboard');

    // ─── Step 1: Language Selection ───
    await expect(page.getByText('Choose Your Language')).toBeVisible();

    // Both language options visible
    await expect(page.getByText('English').first()).toBeVisible();
    await expect(page.getByText('हिंदी').first()).toBeVisible();

    // Select English and continue
    await page.getByRole('button', { name: 'Continue' }).click();

    // ─── Step 2: Describe Products ───
    await expect(page.getByText('Welcome to VyaparSetu AI!')).toBeVisible({ timeout: 5000 });

    // Type Ramesh's Hindi input (the demo cache key)
    await typeAndSend(page, persona.inputHi);

    // ─── Step 3: Classification Results ───
    await waitForClassification(page);

    // Original text shown
    await expect(page.getByText(persona.inputHi)).toBeVisible();

    // Top category with confidence
    await expect(page.getByText(persona.category).first()).toBeVisible();
    await expect(page.getByText(persona.code).first()).toBeVisible();

    // Confidence bar shows GREEN band (92.3%)
    await expect(page.getByText('92.3%').first()).toBeVisible();

    // HSN code displayed
    await expect(page.getByText(persona.hsn).first()).toBeVisible();

    // Attributes extracted
    await expect(page.getByText('Moradabad').first()).toBeVisible();

    // Processing time shown
    await expect(page.getByText(/Processed in \d+ms/).first()).toBeVisible();

    // Click "Find Best Platforms"
    await page.getByRole('button', { name: 'Find Best Platforms' }).click();

    // ─── Step 4: Platform Matching + Pricing ───
    await waitForMatching(page);

    // Top 3 platforms displayed
    await expect(page.getByRole('heading', { name: 'Amazon Karigar' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'IndiaMART' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ONDC-Mystore' })).toBeVisible();

    // Scores visible
    await expect(page.getByText('0.89').first()).toBeVisible();

    // Pricing intelligence section
    await expect(page.getByText('Price Intelligence')).toBeVisible({ timeout: 10_000 });

    // Your price vs median
    await expect(page.getByText('₹450').first()).toBeVisible();
    await expect(page.getByText('₹490').first()).toBeVisible();

    // Price position
    await expect(page.getByText(/8% below median/)).toBeVisible();

    // Recommendation text
    await expect(page.getByText(/Increase price|list on Amazon|Diwali/i).first()).toBeVisible();

    // Peak season
    await expect(page.getByText(/Diwali/).first()).toBeVisible();

    // Geographic Expansion section
    await expect(page.getByText('Geographic Expansion Opportunity')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Maharashtra').first()).toBeVisible();
    await expect(page.getByText('Karnataka').first()).toBeVisible();
    await expect(page.getByText('Tamil Nadu').first()).toBeVisible();
    await expect(page.getByText('23% QoQ').first()).toBeVisible();

    // Click "Complete Onboarding"
    await page.getByRole('button', { name: 'Complete Onboarding' }).click();

    // ─── Step 5: Success Screen ───
    await expect(page.getByText('Onboarding Complete!')).toBeVisible({ timeout: 5000 });

    // Summary card
    await expect(page.getByText(persona.categoryShort).first()).toBeVisible();
    await expect(page.getByText('92.3%').first()).toBeVisible();
    await expect(page.getByText(persona.hsn).first()).toBeVisible();
    await expect(page.getByText(persona.topPlatform).first()).toBeVisible();

    // Navigation buttons
    await expect(page.getByText('Onboard Another')).toBeVisible();
    await expect(page.getByText('View Dashboard')).toBeVisible();
  });
});
