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

async function loginAndOpenReservationModal(page: Page, context: BrowserContext) {
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
    if (url.includes('/api/spot-types/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }
    console.warn(`Unhandled API request: ${method} ${url}`);
    return route.abort();
  });

  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'fake-access-token');
    localStorage.setItem('refreshToken', 'fake-refresh-token');
  });

  await page.goto('/');
  await expect(page.locator('.spot-card').first()).toBeVisible();
  await page.getByRole('button', { name: 'Reserve' }).click();
  await expect(page.locator('.modal-overlay')).toBeVisible();
}

test.describe('Reservation Modal', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAndOpenReservationModal(page, context);
  });

  test('should display reservation form', async ({ page }) => {
    const modal = page.locator('.modal-overlay');

    await expect(modal.locator('.modal-title')).toHaveText('Reservation - Test Restaurant');
    await expect(modal.locator('.reservation-input[type="date"]')).toBeVisible();
    await expect(modal.locator('.reservation-input[type="time"]')).toBeVisible();
    await expect(modal.locator('.reservation-input[type="number"]')).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Reserve' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('should close modal after successful reservation', async ({ page }) => {
    const modal = page.locator('.modal-overlay');

    await page.route('http://127.0.0.1:8000/api/reservations/', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Reservation created successfully' }),
      }),
    );

    await modal.locator('.reservation-input[type="date"]').fill('2026-12-01');
    await modal.locator('.reservation-input[type="time"]').fill('18:00');
    await modal.locator('.reservation-input[type="number"]').fill('2');
    await modal.getByRole('button', { name: 'Reserve' }).click();

    await expect(modal).not.toBeVisible();
  });

  test('should close modal when clicking Cancel', async ({ page }) => {
    const modal = page.locator('.modal-overlay');

    await modal.getByRole('button', { name: 'Cancel' }).click();

    await expect(modal).not.toBeVisible();
  });
});
