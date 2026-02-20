from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core import mail
from django.utils import timezone
from .models import Spot, Reservation

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
            name='Test Spot',
            address='Test Address',
            spot_type='restaurant'
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
        self.assertEqual(email.subject, f"Potwierdzenie rezerwacji w {self.spot.name}")
        self.assertIn('test@example.com', email.to)
        self.assertIn('Dziękujemy za rezerwację', email.body)
