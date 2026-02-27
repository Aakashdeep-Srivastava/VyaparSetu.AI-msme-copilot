import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with VyaparSetu branding', async ({ page }) => {
    // Nav logo
    await expect(page.locator('text=VyaparSetu').first()).toBeVisible();

    // Hero headline
    await expect(page.getByText('Sell smarter.')).toBeVisible();
    await expect(page.getByText('In your language.')).toBeVisible();

    // Stats
    await expect(page.getByText('6.3Cr')).toBeVisible();
    await expect(page.getByText('95%')).toBeVisible();
    await expect(page.getByText('<5 min')).toBeVisible();
  });

  test('navigation links are present', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav.getByText('Features')).toBeVisible();
    await expect(nav.getByText('Stories')).toBeVisible();
    await expect(nav.getByText('How it works')).toBeVisible();
    await expect(nav.getByText('Dashboard')).toBeVisible();
  });

  test('features section shows three AI tools', async ({ page }) => {
    await expect(page.getByText('CatalogAI')).toBeVisible();
    await expect(page.getByText('MatchMaker')).toBeVisible();
    await expect(page.getByText('PriceWise')).toBeVisible();
  });

  test('stories section shows all 3 demo personas', async ({ page }) => {
    // Persona names
    await expect(page.getByText('Ramesh Kumar').first()).toBeVisible();
    await expect(page.getByText('Lakshmi Devi').first()).toBeVisible();
    await expect(page.getByText('Priya Menon').first()).toBeVisible();

    // Platform badges
    await expect(page.getByText('Amazon Karigar (0.89)').first()).toBeVisible();
    await expect(page.getByText('Myntra (0.91)').first()).toBeVisible();
    await expect(page.getByText('IndiaMART (0.87)').first()).toBeVisible();
  });

  test('language toggle switches to Hindi', async ({ page }) => {
    // Click language toggle in nav
    const nav = page.locator('nav');
    await nav.getByText('English').click();

    // Hero switches to Hindi
    await expect(page.getByText('अपनी भाषा में।')).toBeVisible();
    await expect(page.getByText('स्मार्ट बेचें।')).toBeVisible();

    // Features section in Hindi
    await expect(page.getByText('कैटलॉग AI')).toBeVisible();
    await expect(page.getByText('मैचमेकर')).toBeVisible();
    await expect(page.getByText('प्राइसवाइज़')).toBeVisible();
  });

  test('"Try it now" navigates to /onboard', async ({ page }) => {
    await page.getByRole('link', { name: 'Try it now' }).click();
    await expect(page).toHaveURL('/onboard');
  });

  test('"Get started" nav link navigates to /onboard', async ({ page }) => {
    const nav = page.locator('nav');
    await nav.getByRole('link', { name: 'Get started' }).click();
    await expect(page).toHaveURL('/onboard');
  });

  test('"Chat" nav link navigates to /chat', async ({ page }) => {
    const nav = page.locator('nav');
    await nav.getByRole('link', { name: 'Chat' }).click();
    await expect(page).toHaveURL('/chat');
  });

  test('how it works section shows 3 steps', async ({ page }) => {
    await expect(page.getByText('Describe your products').first()).toBeVisible();
    await expect(page.getByText('Get instant classification')).toBeVisible();
    await expect(page.getByText('See your best options')).toBeVisible();
  });

  test('footer links exist', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: 'Onboard' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Chat' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  });
});
