from django.urls import path, include
from .views import SpotAIChatView
urlpatterns = [
    path('chat/',SpotAIChatView.as_view(), name="spot-ai-chat"),
]
