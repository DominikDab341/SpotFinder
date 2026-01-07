from django.urls import path
from .views import SpotsView, ReservationView

urlpatterns = [
    path('spots/', SpotsView.as_view(), name='spots-search'),
    path('reservations/', ReservationView.as_view(), name='reservations-list-create'),
]