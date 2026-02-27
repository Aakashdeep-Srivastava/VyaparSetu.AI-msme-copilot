import { test, expect } from '@playwright/test';
import { API, PERSONAS } from './helpers';

test.describe('Admin Dashboard', () => {

  test.beforeEach(async ({ request }) => {
    // Seed some data by classifying a product first
    await request.post(`${API}/api/catalog/classify`, {
      data: { text: PERSONAS.ramesh.inputEn, language: 'en' },
    });
  });

  test('dashboard loads with metrics and comparison table', async ({ page }) => {
    await page.goto('/dashboard');

    // Header
    await expect(page.getByText('Admin Dashboard')).toBeVisible();

    // Wait for data to load
    await expect(page.getByText('Total Onboarded')).toBeVisible({ timeout: 10_000 });

    // Baseline comparison table visible
    await expect(page.getByText('Baseline vs VyaparSetu AI')).toBeVisible();

    // Comparison rows
    await expect(page.getByText('Catalog Creation Time')).toBeVisible();
    await expect(page.getByText('Classification Accuracy')).toBeVisible();
    await expect(page.getByText('Matching NDCG@3')).toBeVisible();
    await expect(page.getByText('Language Support')).toBeVisible();
    await expect(page.getByText('Cost per Onboarding')).toBeVisible();

    // AI values
    await expect(page.getByText('<5 minutes')).toBeVisible();
    await expect(page.getByText('95%+').first()).toBeVisible();
    await expect(page.getByText('Hindi + English')).toBeVisible();
    await expect(page.getByText('₹15')).toBeVisible();

    // Improvement percentages
    await expect(page.getByText('↑97%').first()).toBeVisible();
    await expect(page.getByText('↑78%')).toBeVisible();
  });

  test('confidence band distribution chart shows', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Confidence Band Distribution')).toBeVisible({ timeout: 10_000 });
  });

  test('recent classifications table shows records after onboarding', async ({ page, request }) => {
    // Classify all 3 demo personas to populate the table
    await request.post(`${API}/api/catalog/classify`, {
      data: { text: PERSONAS.lakshmi.inputHi, language: 'hi' },
    });
    await request.post(`${API}/api/catalog/classify`, {
      data: { text: PERSONAS.priya.inputEn, language: 'en' },
    });

    await page.goto('/dashboard');

    // Recent Classifications section
    await expect(page.getByText('Recent Classifications')).toBeVisible({ timeout: 10_000 });

    // Wait for records to appear (auto-refetch is every 5s)
    await expect(page.getByText('records').first()).toBeVisible({ timeout: 15_000 });

    // GREEN bands should be visible (all demo scenarios are GREEN)
    await expect(page.getByText('GREEN').first()).toBeVisible({ timeout: 15_000 });
  });

  test('override modal opens and has correct fields', async ({ page, request }) => {
    // Ensure at least one classification exists
    await request.post(`${API}/api/catalog/classify`, {
      data: { text: PERSONAS.ramesh.inputHi, language: 'hi' },
    });

    await page.goto('/dashboard');

    // Wait for table to load with records
    await expect(page.getByText('GREEN').first()).toBeVisible({ timeout: 15_000 });

    // Click the first Override button
    const overrideBtn = page.getByText('Override').first();
    await expect(overrideBtn).toBeVisible({ timeout: 10_000 });
    await overrideBtn.click();

    // Modal opens
    await expect(page.getByText('Override Classification')).toBeVisible();
    await expect(page.getByText('Record ID')).toBeVisible();
    await expect(page.getByText('Current Category')).toBeVisible();
    await expect(page.getByText('New Category').first()).toBeVisible();
    await expect(page.getByText('Reason').first()).toBeVisible();

    // Buttons
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apply Override' })).toBeVisible();

    // Cancel closes modal
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Override Classification')).not.toBeVisible();
  });

  test('dashboard language toggle to Hindi', async ({ page }) => {
    await page.goto('/dashboard');

    // Toggle to Hindi
    await page.getByText('English').click();

    // Hindi labels
    await expect(page.getByText('एडमिन डैशबोर्ड')).toBeVisible();
    await expect(page.getByText('बेसलाइन vs व्यापारसेतु AI')).toBeVisible();
    await expect(page.getByText('हालिया वर्गीकरण')).toBeVisible();
  });

  test('refresh button triggers data refetch', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for initial load
    await expect(page.getByText('Baseline vs VyaparSetu AI')).toBeVisible({ timeout: 10_000 });

    // Click refresh
    await page.getByRole('button', { name: 'Refresh' }).click();

    // Verify page still works
    await expect(page.getByText('Baseline vs VyaparSetu AI')).toBeVisible();
  });
});
