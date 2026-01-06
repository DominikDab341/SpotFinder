from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .serializers import SpotSearchSerializer
import requests

class SpotsView(APIView):
    """
    {
        "address": "1600 Amphitheatre Parkway, Mountain View, CA",
        "radius": 1500, (meters)
        "type": "restaurant" 
    }
    """
    def post(self, request):
        serializer = SpotSearchSerializer(data=request.data)

        if serializer.is_valid():
            address = serializer.validated_data['address']
            radius = serializer.validated_data['radius']
            spot_type = serializer.validated_data['type']
            
            api_key = settings.GOOGLE_MAPS_API

            geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
            geocode_params = {
                "address": address,
                "key": api_key
            }

            try:
                geocode_response = requests.get(geocode_url, params=geocode_params)
                geocode_data = geocode_response.json()

                if geocode_data['status'] != 'OK':
                    return Response({"error": "Geocoding failed."}, status=400)

                location = geocode_data['results'][0]['geometry']['location']
                lat, lng = location['lat'], location['lng']
            except requests.RequestException as e:
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
                places_response = requests.post(places_url, json=payload, headers=headers)
                places_data = places_response.json()
                return Response(places_data)
                
            except requests.exceptions.RequestException:
                return Response({"error": "Błąd połączenia z Places API"}, status=503)
        return Response(serializer.errors, status=400)