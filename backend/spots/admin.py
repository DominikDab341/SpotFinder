from django.contrib import admin
from .models import Spot, Reservation, FavoriteSpot


admin.site.register(Spot)
admin.site.register(Reservation)
admin.site.register(FavoriteSpot)
