from django.shortcuts import render
from adrf.views import APIView
from asgiref.sync import sync_to_async
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTStatelessUserAuthentication
from django.conf import settings
from .serializers import SpotSearchSerializer, ReservationSerializer, FavoriteSpotSerializer
from rest_framework import viewsets, generics
from .models import Reservation, FavoriteSpot
import requests
import httpx

class SpotsView(APIView):
    """
    {
        "address": "1600 Amphitheatre Parkway, Mountain View, CA",
        "radius": 1500, (meters)
        "type": "restaurant" 
    }
    """
    authentication_classes = [JWTStatelessUserAuthentication]

    async def post(self, request):
        serializer = SpotSearchSerializer(data=request.data)

        if serializer.is_valid():
            address = serializer.validated_data['address']
            radius = serializer.validated_data['radius']
            spot_type = serializer.validated_data.get('spot_type', None)
            
            api_key = settings.GOOGLE_MAPS_API
            async with httpx.AsyncClient() as client:
                geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
                geocode_params = {
                    "address": address,
                    "key": api_key
                }

                try:
                    geocode_response = await client.get(geocode_url, params=geocode_params)
                    geocode_data = geocode_response.json()

                    if geocode_data['status'] != 'OK':
                        return Response({"error": "Geocoding failed."}, status=400)

                    location = geocode_data['results'][0]['geometry']['location']
                    lat, lng = location['lat'], location['lng']
                except httpx.RequestError:
                    return Response({"error": "Błąd połączenia z Geocoding API"}, status=503)
                

                places_url = "https://places.googleapis.com/v1/places:searchNearby"
                headers = {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": api_key,
                    "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.id,places.rating,places.userRatingCount,places.priceLevel"
                }

                payload = {
                    "maxResultCount": 10,
                    "locationRestriction": {
                        "circle": {
                            "center": {
                                "latitude": lat,
                                "longitude": lng
                            },
                            "radius": radius
                        }
                    }
                }

                if spot_type:
                    payload["includedTypes"] = [spot_type]

                try:
                    places_response = await client.post(places_url, json=payload, headers=headers)
                    places_data = places_response.json()

                    @sync_to_async
                    def get_user_favorite_spots(user_id):
                        return list(FavoriteSpot.objects.filter(user_id=user_id).select_related('spot'))


                    user_favorites = await get_user_favorite_spots(request.user.id)
                    favorite_dict = {fav.spot.google_place_id: fav.id for fav in user_favorites}
                    for place in places_data.get('places', []):
                        google_id = place['id']
                        if google_id in favorite_dict:
                            place['is_favorite'] = True
                            place['favorite_id'] = favorite_dict[google_id]
                        else:
                            place['is_favorite'] = False
                            place['favorite_id'] = None
                    return Response(places_data)
                    
                except httpx.RequestError:
                    return Response({"error": "Błąd połączenia z Places API"}, status=503)
        return Response(serializer.errors, status=400)
        

class ReservationView(generics.ListCreateAPIView):
    serializer_class = ReservationSerializer

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user).order_by('-reservation_time')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)    

class FavoriteSpotViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSpotSerializer

    def get_queryset(self):
        return FavoriteSpot.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)