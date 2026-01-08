from django.urls import path, include
from .views import SpotsView, ReservationView, FavoriteSpotViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'favorites', FavoriteSpotViewSet, basename='favorite-spots')

urlpatterns = [
    path('spots/', SpotsView.as_view(), name='spots-search'),
    path('reservations/', ReservationView.as_view(), name='reservations-list-create'),
    path('', include(router.urls)),
]