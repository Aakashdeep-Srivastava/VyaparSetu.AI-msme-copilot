import { test, expect } from '@playwright/test';
import { PERSONAS, typeAndSend } from './helpers';

const persona = PERSONAS.ramesh;

test.describe('Onboarding Flow — Hindi Language Mode', () => {

  test('full onboarding in Hindi UI language', async ({ page }) => {
    await page.goto('/onboard');

    // Step 1: Switch to Hindi
    await expect(page.getByText('Choose Your Language')).toBeVisible();

    // Click Hindi language option (the button with flag)
    await page.locator('button').filter({ hasText: 'हिंदी' }).first().click();

    // UI switches to Hindi
    await expect(page.getByText('अपनी भाषा चुनें')).toBeVisible();

    // Continue button in Hindi
    await page.getByRole('button', { name: 'आगे बढ़ें' }).click();

    // Step 2: Welcome message in Hindi
    await expect(page.getByText('व्यापारसेतु AI में आपका स्वागत है!')).toBeVisible({ timeout: 5000 });

    // Type product description
    await typeAndSend(page, persona.inputHi);

    // Step 3: Classification results with Hindi labels
    await expect(page.getByText('AI वर्गीकरण परिणाम')).toBeVisible({ timeout: 20_000 });

    // Category still in English (taxonomy is English)
    await expect(page.getByText(persona.category).first()).toBeVisible();

    // Hindi label for attributes section
    await expect(page.getByText('निकाले गए गुण')).toBeVisible();

    // Click "Find Best Platforms" in Hindi
    await page.getByRole('button', { name: 'सर्वश्रेष्ठ प्लेटफॉर्म खोजें' }).click();

    // Step 4: Hindi UI labels for platforms
    await expect(page.getByText('अनुशंसित प्लेटफॉर्म')).toBeVisible({ timeout: 20_000 });

    // Platforms still shown (names in English)
    await expect(page.getByRole('heading', { name: 'Amazon Karigar' })).toBeVisible();

    // Pricing in Hindi
    await expect(page.getByText('मूल्य इंटेलिजेंस')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('आपकी कीमत')).toBeVisible();
    await expect(page.getByText('श्रेणी औसत')).toBeVisible();

    // Hindi recommendation displayed
    await expect(page.getByText(/Apni keemat|badhayein|Amazon/).first()).toBeVisible();

    // Geo insight in Hindi
    await expect(page.getByText('भौगोलिक विस्तार का अवसर')).toBeVisible({ timeout: 10_000 });

    // Complete in Hindi
    await page.getByRole('button', { name: 'ऑनबोर्डिंग पूरी करें' }).click();
    await expect(page.getByText('ऑनबोर्डिंग पूर्ण!')).toBeVisible();
  });
});
