import { test, expect } from '@playwright/test';
import { PERSONAS, typeAndSend, waitForClassification, waitForMatching } from './helpers';

const persona = PERSONAS.lakshmi;

test.describe('Onboarding Flow — Lakshmi Devi (Hindi, Silk Sarees)', () => {

  test('complete onboarding with silk saree classification', async ({ page }) => {
    await page.goto('/onboard');

    // Step 1: Continue with English (default)
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: Type Lakshmi's Hindi input
    await typeAndSend(page, persona.inputHi);

    // Step 3: Classification
    await waitForClassification(page);

    // Top category: Silk Sarees
    await expect(page.getByText(persona.category).first()).toBeVisible();
    await expect(page.getByText(persona.code).first()).toBeVisible();
    await expect(page.getByText('96.1%').first()).toBeVisible();
    await expect(page.getByText(persona.hsn).first()).toBeVisible();

    // Attributes
    await expect(page.getByText(/Silk|Banarasi/).first()).toBeVisible();
    await expect(page.getByText('Varanasi').first()).toBeVisible();

    // Find platforms
    await page.getByRole('button', { name: 'Find Best Platforms' }).click();

    // Step 4: Matching
    await waitForMatching(page);

    // Top platform: Myntra
    await expect(page.getByRole('heading', { name: 'Myntra' })).toBeVisible();
    await expect(page.getByText('0.91').first()).toBeVisible();

    // Also recommended
    await expect(page.getByRole('heading', { name: 'Amazon Karigar' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Meesho' })).toBeVisible();

    // Pricing
    await expect(page.getByText('Price Intelligence')).toBeVisible({ timeout: 10_000 });

    // Wedding season mention
    await expect(page.getByText(/Wedding Season|wedding season/).first()).toBeVisible();

    // Geographic insight
    await expect(page.getByText('Geographic Expansion Opportunity')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Gujarat').first()).toBeVisible();
    await expect(page.getByText('Rajasthan').first()).toBeVisible();

    // Complete
    await page.getByRole('button', { name: 'Complete Onboarding' }).click();
    await expect(page.getByText('Onboarding Complete!')).toBeVisible();
    await expect(page.getByText(persona.categoryShort).first()).toBeVisible();
    await expect(page.getByText('Myntra').first()).toBeVisible();
  });
});
