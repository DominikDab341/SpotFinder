from django.db import models
from django.contrib.auth.models import User

class Spot(models.Model):
    google_place_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    spot_type = models.CharField(max_length=100)
    rating = models.FloatField(null=True, blank=True)
    user_rating_count = models.IntegerField(null=True, blank=True)
    price_level = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name
    
class Reservation(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]

    spot = models.ForeignKey(Spot, on_delete=models.CASCADE, related_name='reservations')
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    created_at = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    reservation_time = models.DateTimeField()
    guests = models.IntegerField(default=2)

    def __str__(self):
        return f"Reservation for {self.guests} at {self.spot.name} on {self.reservation_time}"
