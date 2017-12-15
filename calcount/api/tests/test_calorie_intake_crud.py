# -*- coding: utf-8 -*-
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from datetime import datetime
from api.models import CalorieIntake


class CalorieIntakeCRUD(TestCase):

    """Verification of Create, Read, Update, Delete operations on Calorie Intakes endpoint"""

    def setUp(self):

        self.user = User.objects.create_superuser(username='admin', password='admin', email='a@test.com')
        self.user.save()
        self.client = APIClient()
        self.client.login(username='admin', password='admin')

        self.test_user = User.objects.create_user(username='tuser', password='tpassw', email='u@test.com')
        self.user.save()

        self.calorie_intake = CalorieIntake(
            user = self.test_user,
            calories = 450,
            description = 'calorie intake'
        )
        self.calorie_intake.save()


    def test_get_calorie_intake_list(self):

        request = self.client.get('/api/calorie-intakes/')
        self.assertEqual(request.status_code, 200)
        self.assertEqual(len(request.data['results']), 1)


    def test_get_calorie_intake(self):

        request = self.client.get('/api/calorie-intakes/'+str(self.calorie_intake.pk)+'/')
        self.assertEqual(request.status_code, 200)


    def test_post_calorie_intake(self):

        calorie_intake = {
            'user': 'http://127.0.0.1:8000/api/users/'+str(self.user.id)+'/',
            'date': datetime.now(),
            'calories': 500,
            'description': 'different description'
        }

        request = self.client.post('/api/calorie-intakes/', calorie_intake, format='json')
        self.assertEqual(request.status_code, 201)

        expected_keys = ['id', 'date', 'calories', 'description']
        for key in expected_keys:
            self.assertIn(key, request.data)


    def test_patch_calorie_intake(self):

        get_request = self.client.get('/api/calorie-intakes/'+str(self.calorie_intake.pk)+'/')
        self.assertNotEqual(get_request.data['calories'], 455)

        patch_request = self.client.patch('/api/calorie-intakes/'+str(self.calorie_intake.pk)+'/',
                                    {'calories': 455}, format='json')
        self.assertEqual(patch_request.status_code, 200)
        self.assertEqual(patch_request.data['calories'], 455)


    def test_delete_calorie_intake(self):

        request = self.client.delete('/api/calorie-intakes/'+str(self.calorie_intake.pk)+'/')
        self.assertEqual(request.status_code, 204)

        request = self.client.get('/api/calorie-intakes/'+str(self.calorie_intake.pk)+'/')
        self.assertEqual(request.status_code, 404)

