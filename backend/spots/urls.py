from django.urls import path, include
from .views import SpotsView, SpotTypesView, ReservationViewSet, FavoriteSpotViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'favorites', FavoriteSpotViewSet, basename='favorite-spots')
router.register(r'reservations', ReservationViewSet, basename='reservations')

urlpatterns = [
    path('spots/', SpotsView.as_view(), name='spots-search'),
    path('spot-types/', SpotTypesView.as_view(), name='spot-types'),
    path('', include(router.urls)),
]