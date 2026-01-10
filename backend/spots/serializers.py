from rest_framework import serializers
from .models import Reservation, Spot, FavoriteSpot
from django.db import transaction

class SpotSearchSerializer(serializers.Serializer):
    address = serializers.CharField(required=True)
    radius = serializers.IntegerField(required=True, min_value=100, max_value=50000) 
    type = serializers.CharField(required=True)

class SpotDisplayMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spot
        fields = [
            'google_place_id', 'name', 'address', 'spot_type',
        ]

class SpotGetOrCreate(serializers.Serializer):
    google_place_id = serializers.CharField(write_only=True)
    name = serializers.CharField(write_only=True)
    address = serializers.CharField(write_only=True)
    spot_type = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def get_or_create_spot(self,validated_data):
        google_id = validated_data.pop('google_place_id')
        name = validated_data.pop('name')
        address = validated_data.pop('address')
        spot_type = validated_data.pop('spot_type', 'unknown')

        spot, created = Spot.objects.get_or_create(
            google_place_id=google_id,
            defaults={
                'name': name,
                'address': address,
                'spot_type': spot_type
            }
        )
        return spot

class ReservationSerializer(SpotGetOrCreate,serializers.ModelSerializer):
    spot_details = SpotDisplayMetaSerializer(source='spot', read_only=True)

    class Meta:
        model = Reservation
        fields = ['id', 'reservation_time', 'guests', 'status', 
            'google_place_id', 'name', 'address', 'spot_type', 'spot_details'
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
            'id', 'google_place_id', 'name', 'address', 'spot_type', 'spot_details'
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