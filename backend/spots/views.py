from django.shortcuts import render
from adrf.views import APIView
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
            spot_type = serializer.validated_data['type']
            
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
                    "includedTypes": [spot_type],
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

                try:
                    places_response = await client.post(places_url, json=payload, headers=headers)
                    places_data = places_response.json()
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