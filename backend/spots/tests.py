from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core import mail
from django.utils import timezone
from .models import Spot, Reservation, FavoriteSpot
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

User = get_user_model()

@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    TASKS={
        "default": {
            "BACKEND": "django_tasks.backends.immediate.ImmediateBackend"
        }
    }
)
class ReservationEmailTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', 
            email='test@example.com', 
            password='password'
        )
        self.spot = Spot.objects.create(
            google_place_id='testplugin',
            display_name='Test Spot',
            formatted_address='Test Address',
        )

    def test_email_sent_on_reservation(self):
        # Create reservation
        Reservation.objects.create(
            user=self.user,
            spot=self.spot,
            reservation_time=timezone.now(),
            guests=2
        )

        # Check that one message has been sent
        self.assertEqual(len(mail.outbox), 1)

        # Verify email content
        email = mail.outbox[0]
        self.assertEqual(email.subject, f"Potwierdzenie rezerwacji w {self.spot.display_name}")
        self.assertIn('test@example.com', email.to)
        self.assertIn('Dziękujemy za rezerwację', email.body)

    def test_delete_reservation(self):
        reservation = Reservation.objects.create(
            user=self.user,
            spot=self.spot,
            reservation_time=timezone.now(),
            guests=2
        )
        reservation.delete()
        self.assertEqual(Reservation.objects.count(), 0)

class SpotModelTest(TestCase):
    def test_create_spot(self):
        spot = Spot.objects.create(
            google_place_id='test_google_id_123',
            display_name='Test Spot Create',
            formatted_address='123 Test St',
            rating=4.5,
            user_rating_count=100,
            price_level=2
        )
        self.assertEqual(Spot.objects.count(), 1)
        self.assertEqual(spot.display_name, 'Test Spot Create')
        self.assertEqual(spot.rating, 4.5)

    def test_delete_spot(self):
        spot = Spot.objects.create(
            google_place_id='test_google_id_456',
            display_name='Test Spot Delete',
            formatted_address='456 Delete St',
        )
        self.assertEqual(Spot.objects.count(), 1)
        spot.delete()
        self.assertEqual(Spot.objects.count(), 0)


class FavoriteSpotAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuserfav', 
            email='testfav@example.com', 
            password='password123'
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse('favorite-spots-list')  # Defaults created by router for basename='favorite-spots'

    def test_create_favorite_spot(self):
        payload = {
            "googlePlaceId": "ChIJtest123",
            "displayName": "API Test Spot",
            "formattedAddress": "API Address 123",
            "rating": 4.8,
            "userRatingCount": 50,
            "priceLevel": 1
        }
        response = self.client.post(self.url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FavoriteSpot.objects.count(), 1)
        self.assertEqual(Spot.objects.count(), 1)
        
        fav_spot = FavoriteSpot.objects.first()
        self.assertEqual(fav_spot.user, self.user)
        self.assertEqual(fav_spot.spot.google_place_id, "ChIJtest123")
        self.assertEqual(fav_spot.spot.display_name, "API Test Spot")

    def test_remove_favorite_spot(self):
        # Create a spot and favorite it first to test deletion
        spot = Spot.objects.create(
            google_place_id='ChIJtest456',
            display_name='Delete API Spot',
            formatted_address='Delete Address 456'
        )
        fav_spot = FavoriteSpot.objects.create(user=self.user, spot=spot)
        
        self.assertEqual(FavoriteSpot.objects.count(), 1)
        
        delete_url = reverse('favorite-spots-detail', args=[fav_spot.id])
        response = self.client.delete(delete_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(FavoriteSpot.objects.count(), 0)
        # Spot itself should still exist in db, just the favorite relation is removed
        self.assertEqual(Spot.objects.count(), 1)


class SpotCategoryMappingTest(TestCase):

    def test_restaurant_maps_to_food_and_drink(self):
        from spots.utils import get_spot_category
        result = get_spot_category('restaurant')
        self.assertEqual(result, 'food_and_drink')

    def test_park_maps_to_parks_and_nature(self):
        from spots.utils import get_spot_category
        result = get_spot_category('park')
        self.assertEqual(result, 'parks_and_nature')

    def test_unknown_type_returns_none(self):
        from spots.utils import get_spot_category
        result = get_spot_category('totally_unknown_type')
        self.assertIsNone(result)

    def test_fallback_to_types_array(self):
        from spots.utils import get_spot_category
        result = get_spot_category('', ['cafe', 'food_court'])
        self.assertEqual(result, 'food_and_drink')


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    TASKS={
        "default": {
            "BACKEND": "django_tasks.backends.immediate.ImmediateBackend"
        }
    }
)
class ReservationValidationTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='reservationuser',
            email='reservation@example.com',
            password='password123'
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse('reservations-list')

    def test_create_reservation_food_and_drink_success(self):
        payload = {
            "reservationTime": "2026-04-01T18:00:00Z",
            "guests": 4,
            "googlePlaceId": "ChIJfoodtest",
            "displayName": "Test Restaurant",
            "formattedAddress": "123 Food St",
            "spotCategory": "food_and_drink"
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Reservation.objects.count(), 1)

    def test_create_reservation_non_food_rejected(self):
        payload = {
            "reservationTime": "2026-04-01T18:00:00Z",
            "guests": 2,
            "googlePlaceId": "ChIJparktest",
            "displayName": "Test Park",
            "formattedAddress": "456 Park Ave",
            "spotCategory": "parks_and_nature"
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Reservation.objects.count(), 0)

    def test_create_reservation_missing_category_rejected(self):
        payload = {
            "reservationTime": "2026-04-01T18:00:00Z",
            "guests": 2,
            "googlePlaceId": "ChIJnocattest",
            "displayName": "Test Place",
            "formattedAddress": "789 Unknown St"
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Reservation.objects.count(), 0)
