from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

class UserRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register') # Zakładam, że name='register' w urls.py
        
        self.valid_payload = {
            "username": "testuser1",
            "password": "StrongPassword123!",
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User"
        }

    def test_successful_user_registration(self):
        response = self.client.post(self.register_url, self.valid_payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="testuser1").exists())
        
        user = User.objects.get(username="testuser1")
        self.assertNotEqual(user.password, "StrongPassword123!")
        self.assertTrue(user.check_password("StrongPassword123!"))

    def test_duplicate_email_registration(self):
        
        user1_response = self.client.post(self.register_url, self.valid_payload)
        self.assertEqual(user1_response.status_code, status.HTTP_201_CREATED)
        
        payload2 = self.valid_payload.copy()
        payload2["username"] = "testuser2" 
        
        user2_response = self.client.post(self.register_url, payload2)
        
        self.assertEqual(user2_response.status_code, status.HTTP_400_BAD_REQUEST)
        
        self.assertEqual(User.objects.filter(email="test@example.com").count(), 1)
