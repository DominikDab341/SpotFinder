import { test, expect, Page, BrowserContext } from '@playwright/test';

const mockSpots = {
  places: [
    {
      googlePlaceId: 'test-place-1',
      displayName: 'Test Restaurant',
      formattedAddress: '123 Test Street',
      rating: 4.5,
      userRatingCount: 120,
      priceLevel: 'PRICE_LEVEL_MODERATE',
      spotCategory: 'food_and_drink',
      isFavorite: false,
      favoriteId: null,
    },
  ],
};

async function loginAndGoHome(page: Page, context: BrowserContext) {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 52.2297, longitude: 21.0122 });

  await page.route('**/nominatim.openstreetmap.org/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ display_name: 'Warsaw, Poland' }),
    }),
  );

  await page.route('http://127.0.0.1:8000/api/**', (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes('/api/spots/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSpots),
      });
    }
    if (url.includes('/api/favorites/') && method === 'DELETE') {
      return route.fulfill({ status: 204 });
    }
    if (url.includes('/api/favorites/')) {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1 }),
      });
    }
    if (url.includes('/api/spot-types/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }
    console.warn(`Unknown route: ${method} ${url}`);
    return route.abort();
  });

  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'fake-access-token');
    localStorage.setItem('refreshToken', 'fake-refresh-token');
  });

  await page.goto('/');
  await expect(page.locator('.spot-card').first()).toBeVisible();
  }

test.describe('SpotCard interactions', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAndGoHome(page, context);
  });

  test('should display spot details', async ({ page }) => {
    const card = page.locator('.spot-card').first();

    await expect(card.locator('.spot-title')).toHaveText('Test Restaurant');
    await expect(card.locator('.spot-detail').nth(0)).toContainText('123 Test Street');
    await expect(card.locator('.spot-detail').nth(1)).toContainText('4.5');
    await expect(card.locator('.spot-detail').nth(2)).toContainText('120');
  });

  test('should open reservation modal when clicking Reserve', async ({ page }) => {
    await page.getByRole('button', { name: 'Reserve' }).click();

    await expect(page.locator('.modal-overlay')).toBeVisible();
    await expect(page.locator('.modal-title')).toHaveText('Reservation - Test Restaurant');
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.locator('input[type="time"]')).toBeVisible();
    await expect(page.locator('.reservation-input[type="number"]')).toBeVisible();
  });

  test('should open AI chat modal when clicking Ask AI', async ({ page }) => {
    await page.getByRole('button', { name: 'Ask AI' }).click();

    await expect(page.locator('.modal-overlay')).toBeVisible();
    await expect(page.locator('.modal-title')).toHaveText('Ask AI about this Spot');
    await expect(page.locator('.chat-input')).toBeVisible();
  });

  test('should toggle favorite button after adding to favorites', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Add to favorites/ })).toBeVisible();

    await page.getByRole('button', { name: /Add to favorites/ }).click();

    await expect(page.getByRole('button', { name: /Remove from favorites/ })).toBeVisible();
  });

  test('should toggle favorite button after removing from favorites', async ({ page }) => {
    await page.getByRole('button', { name: /Add to favorites/ }).click();
    await expect(page.getByRole('button', { name: /Remove from favorites/ })).toBeVisible();

    await page.getByRole('button', { name: /Remove from favorites/ }).click();

    await expect(page.getByRole('button', { name: /Add to favorites/ })).toBeVisible();
  });
});
