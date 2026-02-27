import { test, expect } from '@playwright/test';
import { PERSONAS, typeAndSend, waitForClassification, waitForMatching } from './helpers';

test.describe('Cross-Page User Journey', () => {

  test('Landing → Onboard → Complete → Dashboard (full lifecycle)', async ({ page }) => {
    // ─── Start at Landing Page ───
    await page.goto('/');
    await expect(page.getByText('Sell smarter.')).toBeVisible();

    // Click "Try it now" CTA
    await page.getByRole('link', { name: 'Try it now' }).click();
    await expect(page).toHaveURL('/onboard');

    // ─── Onboarding Flow ───
    // Step 1: Language
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: Describe
    await typeAndSend(page, PERSONAS.ramesh.inputEn);

    // Step 3: Classify
    await waitForClassification(page);
    await expect(page.getByText(PERSONAS.ramesh.category).first()).toBeVisible();
    await page.getByRole('button', { name: 'Find Best Platforms' }).click();

    // Step 4: Match + Pricing
    await waitForMatching(page);
    await expect(page.getByRole('heading', { name: 'Amazon Karigar' })).toBeVisible();
    await expect(page.getByText('Price Intelligence')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Complete Onboarding' }).click();

    // Step 5: Done
    await expect(page.getByText('Onboarding Complete!')).toBeVisible();

    // ─── Navigate to Dashboard ───
    await page.getByRole('link', { name: 'View Dashboard' }).click();
    await expect(page).toHaveURL('/dashboard');

    // Dashboard should show the classification we just did
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
    await expect(page.getByText('Baseline vs VyaparSetu AI')).toBeVisible({ timeout: 10_000 });

    // Recent classifications table should have at least 1 record
    await expect(page.getByText('GREEN').first()).toBeVisible({ timeout: 15_000 });
  });

  test('Onboard Another resets the flow', async ({ page }) => {
    await page.goto('/onboard');

    // Complete a full flow
    await page.getByRole('button', { name: 'Continue' }).click();
    await typeAndSend(page, PERSONAS.priya.inputEn);
    await waitForClassification(page);
    await page.getByRole('button', { name: 'Find Best Platforms' }).click();
    await waitForMatching(page);
    await page.getByRole('button', { name: 'Complete Onboarding' }).click();
    await expect(page.getByText('Onboarding Complete!')).toBeVisible();

    // Click "Onboard Another"
    await page.getByText('Onboard Another').click();

    // Back at Step 1
    await expect(page.getByText('Choose Your Language')).toBeVisible({ timeout: 5000 });
  });

  test('back button on onboard navigates to landing', async ({ page }) => {
    await page.goto('/onboard');
    await page.locator('header a').first().click();
    await expect(page).toHaveURL('/');
  });

  test('back button on chat navigates to landing', async ({ page }) => {
    await page.goto('/chat');
    await page.locator('header a').first().click();
    await expect(page).toHaveURL('/');
  });

  test('back button on dashboard navigates to landing', async ({ page }) => {
    await page.goto('/dashboard');
    await page.locator('header a').first().click();
    await expect(page).toHaveURL('/');
  });
});
