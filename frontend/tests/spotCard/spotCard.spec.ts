import { test, expect, Page } from '@playwright/test';

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

async function loginAndGoHome(page: Page, context: any) {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 52.2297, longitude: 21.0122 });

  await page.route('**/nominatim.openstreetmap.org/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ display_name: 'Warsaw, Poland' }),
    }),
  );

  await page.route('**/api/spots/', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSpots),
    }),
  );

  await page.goto('/login');
  await page.evaluate(() => {
    localStorage.setItem('accessToken', 'fake-access-token');
    localStorage.setItem('refreshToken', 'fake-refresh-token');
  });

  await page.goto('/');
  await expect(page.locator('.spot-card').first()).toBeVisible();
}

test.describe('Reservation Modal', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAndGoHome(page, context);
  });

  test('should open reservation modal when clicking Reserve', async ({ page }) => {
    await page.locator('.spot-btn-primary', { hasText: 'Reserve' }).click();

    await expect(page.locator('.modal-overlay')).toBeVisible();
    await expect(page.locator('.modal-title')).toHaveText('Reservation - Test Restaurant');
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.locator('input[type="time"]')).toBeVisible();
    await expect(page.locator('.reservation-input[type="number"]')).toBeVisible();
  });
});
