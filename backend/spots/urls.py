from django.urls import path
from .views import SpotsView

urlpatterns = [
    path('spots/', SpotsView.as_view(), name='spots-search'),
]