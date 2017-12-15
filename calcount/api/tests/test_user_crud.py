from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from datetime import datetime


class UserCRUD(TestCase):

    """Verification of Create, Update, Read and Delete operations on Users endpoint"""

    def setUp(self):

        self.user = User.objects.create_superuser(username='admin', password='admin', email='a@test.com')
        self.user.save()
        self.client = APIClient()
        self.client.login(username='admin', password='admin')

        self.test_user = User.objects.create_user(username='tuser', password='tpassw', email='u@test.com')
        self.user.save()


    def test_get_user_list(self):

        request = self.client.get('/api/users/')
        self.assertEqual(request.status_code, 200)
        self.assertEqual(len(request.data['results']), 2)


    def test_get_user(self):

        request = self.client.get('/api/users/'+str(self.test_user.id)+'/')
        self.assertEqual(request.status_code, 200)


    def test_post_user(self):

        data = {
            'username': 'test_username',
            'password': 'test_password',
            'profile': {}
        }

        request = self.client.post('/api/users/', data, format='json')
        self.assertEqual(request.status_code, 201)

        expected_keys = ['id', 'username', 'email', 'profile', 'is_superuser']
        for key in expected_keys:
            self.assertIn(key, request.data)


    def test_patch_user(self):

        get_request = self.client.get('/api/users/'+str(self.test_user.id)+'/')
        self.assertEqual(get_request.status_code, 200)
        self.assertNotEqual(get_request.data['email'], 'user@email.com')

        data = {
            'email': 'user@email.com',
        }
        request = self.client.patch('/api/users/'+str(self.user.id)+'/', data, format='json')
        self.assertEqual(request.status_code, 200)

        self.assertEqual(request.data['email'], 'user@email.com')


    def test_patch_user_profile(self):

        get_request = self.client.get('/api/users/'+str(self.test_user.id)+'/')
        self.assertEqual(get_request.status_code, 200)
        self.assertEqual(get_request.data['profile']['is_manager'], False)

        data = {
            'profile': {'is_manager': True}
        }

        patch_request = self.client.patch('/api/users/'+str(self.user.id)+'/', data, format='json')
        self.assertEqual(patch_request.status_code, 200)
        self.assertEqual(patch_request.data['profile']['is_manager'], True)


    def test_delete_user_profile(self):

        delete_request = self.client.delete('/api/users/'+str(self.user.id)+'/')
        self.assertEqual(delete_request.status_code, 204)

        get_request = self.client.get('/api/users/'+str(self.test_user.id)+'/')
        self.assertEqual(get_request.status_code, 404)
