from rest_framework import serializers

class SpotSearchSerializer(serializers.Serializer):
    address = serializers.CharField(required=True)
    radius = serializers.IntegerField(required=True, min_value=100, max_value=50000) 
    type = serializers.CharField(required=True)