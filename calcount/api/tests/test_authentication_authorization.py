from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from api.models import UserProfile, CalorieIntake

class AuthenticationAuthorization(TestCase):

    """Verification of permissions for each endpoint and user type"""

    def setUp(self):

        self.user = User.objects.create_user(username='test_user', password='passwd', email="user@testing.com")
        self.user.save()
        self.user_client = APIClient()
        self.user_client.login(username='test_user', password='passwd')

        self.manager = User.objects.create_user(username='test_manager', password='passwd', email="manage@testing.com")
        self.manager.save()
        self.manager_profile = UserProfile(user=self.manager, is_manager=True)
        self.manager_profile.save()
        self.manager_client = APIClient()
        self.manager_client.login(username='test_manager', password='passwd')

        self.superuser = User.objects.create_superuser(username='test_admin', password='passwd', email="admin@testing.com")
        self.superuser.save()
        self.superuser_client = APIClient()
        self.superuser_client.login(username='test_admin', password='passwd')

        self.user_calorie_intake = CalorieIntake(
            user = self.user,
            calories = 450,
            description = 'calorie intake'
        )
        self.user_calorie_intake.save()

        self.admin_calorie_intake = CalorieIntake(
            user = self.superuser,
            calories = 660,
            description = 'calorie intake'
        )
        self.admin_calorie_intake.save()



    def test_user_endpoint(self):

        """Verify that only managers and superusers can see users other than themselves"""

        user_request = self.user_client.get('/api/users/')
        manager_request = self.manager_client.get('/api/users/')
        superuser_request = self.superuser_client.get('/api/users/')

        self.assertEqual(user_request.status_code, 200)
        self.assertEqual(manager_request.status_code, 200)
        self.assertEqual(superuser_request.status_code, 200)

        self.assertEqual(len(user_request.data['results']), 1)
        self.assertEqual(len(manager_request.data['results']), 3)
        self.assertEqual(len(superuser_request.data['results']), 3)


    def test_calorieintake_endpoint(self):

        """Verify that only superusers can see intakes other than their own"""

        user_request = self.user_client.get('/api/calorie-intakes/')
        manager_request = self.manager_client.get('/api/calorie-intakes/')
        superuser_request = self.superuser_client.get('/api/calorie-intakes/')

        self.assertEqual(user_request.status_code, 200)
        self.assertEqual(manager_request.status_code, 200)
        self.assertEqual(superuser_request.status_code, 200)

        self.assertEqual(len(user_request.data['results']), 1)
        self.assertEqual(len(manager_request.data['results']), 0)
        self.assertEqual(len(superuser_request.data['results']), 2)

