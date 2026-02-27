import { test, expect } from '@playwright/test';
import { PERSONAS, typeAndSend } from './helpers';

const persona = PERSONAS.ramesh;

test.describe('Chat Flow — Conversational Interface', () => {

  test('chat page loads with welcome message', async ({ page }) => {
    await page.goto('/chat');

    // Header
    await expect(page.getByText('VyaparSetu AI').first()).toBeVisible();

    // Welcome message
    await expect(page.getByText('Welcome to VyaparSetu AI!').first()).toBeVisible();

    // Input area present
    await expect(page.locator('input[type="text"]')).toBeVisible();
  });

  test('complete chat flow — classify, match, price in one conversation', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByText('Welcome to VyaparSetu AI!').first()).toBeVisible();

    // Send Ramesh's product description
    await typeAndSend(page, persona.inputHi);

    // User message appears
    await expect(page.getByText(persona.inputHi).first()).toBeVisible();

    // Wait for classification response
    await expect(page.getByText(/classified your products|वर्गीकृत/).first()).toBeVisible({ timeout: 20_000 });

    // Category card appears with demo result
    await expect(page.getByText(persona.category).first()).toBeVisible();

    // HSN code
    await expect(page.getByText(persona.hsn).first()).toBeVisible();

    // ONDC JSON message
    await expect(page.getByText(/ONDC Catalog JSON/).first()).toBeVisible({ timeout: 10_000 });

    // Platform matching results
    await expect(page.getByText(/top 3 platforms|शीर्ष 3 प्लेटफॉर्म/).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Amazon Karigar').first()).toBeVisible();

    // Pricing intelligence message
    await expect(page.getByText(/Price Intelligence|मूल्य इंटेलिजेंस/).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/₹450/).first()).toBeVisible();
    await expect(page.getByText(/₹490/).first()).toBeVisible();

    // Geographic expansion message
    await expect(page.getByText(/Geographic Opportunity|भौगोलिक अवसर/).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Maharashtra/).first()).toBeVisible();
  });

  test('chat language toggle switches UI labels', async ({ page }) => {
    await page.goto('/chat');

    // Toggle to Hindi
    await page.getByText('English').click();

    // App name changes
    await expect(page.getByText('व्यापारसेतु AI').first()).toBeVisible();
  });

  test('chat handles English demo input (Priya - spices)', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByText('Welcome to VyaparSetu AI!').first()).toBeVisible();

    const priya = PERSONAS.priya;
    await typeAndSend(page, priya.inputEn);

    // Classification
    await expect(page.getByText(/classified your products/).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(priya.category).first()).toBeVisible();

    // Platform matching
    await expect(page.getByText(/top 3 platforms/).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('IndiaMART').first()).toBeVisible();

    // Pricing
    await expect(page.getByText(/Price Intelligence/).first()).toBeVisible({ timeout: 20_000 });
  });
});
