import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Login to SpotFinder');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Log In');
  });

  test('should have link to register page', async ({ page }) => {
    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.locator('#username').fill('fakeuser');
    await page.locator('#password').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.auth-error-msg')).toHaveText(
      'Invalid username or password',
    );
  });

  test('should disable inputs while loading', async ({ page }) => {
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('testpass');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#username')).toBeDisabled();
    await expect(page.locator('#password')).toBeDisabled();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('should redirect to home after successful login', async ({ page }) => {
    await page.route('**/api/token/', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access: 'fake-access-token',
          refresh: 'fake-refresh-token',
        }),
      }),
    );

    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('correctpassword');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/');
  });

  test('should store tokens in localStorage after login', async ({ page }) => {
    await page.route('**/api/token/', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access: 'test-access-token',
          refresh: 'test-refresh-token',
        }),
      }),
    );

    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('correctpassword');
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('/');

    const accessToken = await page.evaluate(() =>
      localStorage.getItem('accessToken'),
    );
    const refreshToken = await page.evaluate(() =>
      localStorage.getItem('refreshToken'),
    );

    expect(accessToken).toBe('test-access-token');
    expect(refreshToken).toBe('test-refresh-token');
  });
});
