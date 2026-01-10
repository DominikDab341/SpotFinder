from rest_framework import serializers


class SpotAIChatSerializer(serializers.Serializer):
    google_place_id = serializers.CharField(write_only=True)
    user_question = serializers.CharField(write_only=True)
