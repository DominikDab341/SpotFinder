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

async function loginAndOpenAIModal(page: Page, context: BrowserContext) {
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
  await page.getByRole('button', { name: 'Ask AI' }).click();
  await expect(page.locator('.modal-overlay')).toBeVisible();
}

test.describe('AI Chat Modal', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAndOpenAIModal(page, context);
  });

  test('should send user message and display it in chat', async ({ page }) => {
    await page.route('http://127.0.0.1:8000/api/chat/', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ answer: 'Mock AI response' }),
      }),
    );

    await page.getByPlaceholder('e.g. Is there parking available?').fill('Is there parking available?');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.locator('.chat-message.user')).toHaveText('Is there parking available?');
  });

  test('should display AI response after sending message', async ({ page }) => {
    await page.route('http://127.0.0.1:8000/api/chat/', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ answer: 'Yes, there is free parking available nearby.' }),
      }),
    );

    await page.getByPlaceholder('e.g. Is there parking available?').fill('Is there parking available?');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.locator('.chat-message.user')).toHaveText('Is there parking available?');
    await expect(page.locator('.chat-message.ai')).toHaveText('Yes, there is free parking available nearby.');
  });
});
