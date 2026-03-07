from rest_framework import serializers
from .models import Reservation, Spot, FavoriteSpot
from django.db import transaction

class SpotSearchSerializer(serializers.Serializer):
    address = serializers.CharField(required=True)
    radius = serializers.IntegerField(required=True, min_value=100, max_value=50000) 
    spot_type = serializers.CharField(required=False, allow_blank=True)

class SpotDisplayMetaSerializer(serializers.ModelSerializer):
    google_place_id = serializers.CharField(source='google_place_id')
    displayName = serializers.CharField(source='display_name')
    formattedAddress = serializers.CharField(source='formatted_address')
    rating = serializers.FloatField(source='rating')
    userRatingCount = serializers.IntegerField(source='user_rating_count')
    priceLevel = serializers.IntegerField(source='price_level')

    class Meta:
        model = Spot
        fields = [
            'id', 'google_place_id', 'displayName', 'formattedAddress', 'rating', 'userRatingCount', 'priceLevel'
        ]

class SpotGetOrCreate(serializers.Serializer):
    google_place_id = serializers.CharField(write_only=True)
    displayName = serializers.CharField(write_only=True)
    formattedAddress = serializers.CharField(write_only=True)
    rating = serializers.FloatField(write_only=True, required=False, allow_null=True)
    userRatingCount = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    priceLevel = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    def get_or_create_spot(self,validated_data):
        google_id = validated_data.pop('google_place_id')
        display_name = validated_data.pop('displayName')
        formatted_address = validated_data.pop('formattedAddress')
        rating = validated_data.pop('rating', None)
        user_rating_count = validated_data.pop('userRatingCount', None)
        price_level = validated_data.pop('priceLevel', None)

        spot, created = Spot.objects.get_or_create(
            google_place_id=google_id,
            defaults={
                'display_name': display_name,
                'formatted_address': formatted_address,
                'rating': rating,
                'user_rating_count': user_rating_count,
                'price_level': price_level
            }
        )
        return spot

class ReservationSerializer(SpotGetOrCreate,serializers.ModelSerializer):
    spotDetails = SpotDisplayMetaSerializer(source='spot', read_only=True)
    reservationTime = serializers.DateTimeField(source='reservation_time')

    class Meta:
        model = Reservation
        fields = ['id', 'reservationTime', 'guests', 'status', 
            'google_place_id', 'displayName', 'formattedAddress', 'spotDetails'
        ]
        read_only_fields = ['id', 'status', 'user']
    def create(self,validated_data):
        with transaction.atomic():
            spot = self.get_or_create_spot(validated_data)

            reservation = Reservation.objects.create(
                spot=spot,
                **validated_data
            )
            
            return reservation
    

class FavoriteSpotSerializer(SpotGetOrCreate, serializers.ModelSerializer):
    spot_details = SpotDisplayMetaSerializer(source='spot', read_only=True)

    class Meta:
        model = FavoriteSpot
        fields = [
            'id', 'spot_details'
        ]

    def create(self, validated_data):  

        with transaction.atomic():
            spot = self.get_or_create_spot(validated_data)
            user = validated_data.pop('user')

            favorite_spot, created = FavoriteSpot.objects.get_or_create(
                spot=spot,
                user=user,
            )
            
            return favorite_spot