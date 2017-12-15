from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now


class UserProfile(models.Model):
    user = models.OneToOneField(User)
    expected_calories = models.IntegerField(default=2000)
    is_manager = models.BooleanField(default=False)

    def get_intake_log(self):
        return CalorieIntake.objects.get(user=self.User)

User.profile = property(lambda u: UserProfile.objects.get_or_create(user=u)[0]) 


class CalorieIntake(models.Model):
    user = models.ForeignKey(User)
    date = models.DateTimeField(default=now)
    calories = models.IntegerField()
    description = models.CharField(max_length=250)
