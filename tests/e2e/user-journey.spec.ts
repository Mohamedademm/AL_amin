import { test, expect } from '@playwright/test';

test.describe('E2E User Journey', () => {
  test('User can visit homepage, view catalog, and login', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    
    // Check if the title or an important element is visible
    await expect(page).toHaveTitle(/Al Amine|Vite \+ React/i);

    // 2. Click on Catalog
    await page.click('text=Catalogue');
    
    // Verify products are loaded (we assume at least one product card is rendered)
    await expect(page.locator('.group').first()).toBeVisible();

    // 3. Navigate to Login
    await page.click('text=Connexion');
    await expect(page.url()).toContain('/login');

    // 4. Perform Login
    await page.fill('input[type="email"]', 'client@alamine.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Verify successful login redirect to dashboard
    await expect(page.url()).toContain('/dashboard');
  });
});
