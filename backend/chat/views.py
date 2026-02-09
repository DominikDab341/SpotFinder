from adrf.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework_simplejwt.authentication import JWTStatelessUserAuthentication
from django.conf import settings
import requests
from .serializers import SpotAIChatSerializer 
from google import genai 

import httpx

class SpotAIChatView(APIView):
    authentication_classes = [JWTStatelessUserAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    async def post(self, request):
        serializer = SpotAIChatSerializer(data=request.data)

        if serializer.is_valid():
            google_place_id = serializer.validated_data['google_place_id']
            user_question = serializer.validated_data['user_question']

            api_key_maps = settings.GOOGLE_MAPS_API 
            async with httpx.AsyncClient() as client:
                places_url = f"https://places.googleapis.com/v1/places/{google_place_id}"
                
                headers = {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": api_key_maps,
                    "X-Goog-FieldMask": "editorialSummary,reviews" 
                }
                #TODO: Language detection 
                params = {"languageCode": "pl"}

                try:
                    google_response = await client.get(places_url, headers=headers, params=params)
                    if google_response.status_code != 200:
                        return Response({"error": "Google Maps API error"}, status=status.HTTP_400_BAD_REQUEST)
                    place_data = google_response.json()
                except httpx.RequestError:
                    return Response({"error": "Błąd połączenia z Google Maps"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

                reviews_list = place_data.get('reviews', [])
                editorial = place_data.get('editorialSummary', {}).get('text', '')
                
                context_text = f"Opis: {editorial}\n\nOpinie:\n"
                for review in reviews_list:
                    text = review.get('text', {}).get('text', '')
                    context_text += f"- {text}\n"

                if not reviews_list and not editorial:
                    return Response({"answer": "Brak danych o opiniach."}, status=200)

                try:
                    gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
                    #TODO: Do better prompt 
                    prompt = f"Odpisz na pytanie bazując na danych:\n{context_text}\nPytanie: {user_question}"
                    
                    response = await gemini_client.aio.models.generate_content(
                        model='gemini-2.5-flash', 
                        contents=prompt
                    )
                    return Response({"answer": response.text})
                    
                except Exception:
                    return Response({"error": "Błąd AI"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)