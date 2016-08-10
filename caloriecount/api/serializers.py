from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from api.models import CalorieIntake, UserProfile


class FlatUserSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_superuser')


class UserProfileSerializer(serializers.HyperlinkedModelSerializer):
    calorie_intakes = serializers.SerializerMethodField('get_intakes')

    class Meta:
        model = UserProfile
        fields = ('id', 'is_manager', 'expected_calories', 'calorie_intakes')
        #fields = ('id', 'is_manager', 'expected_calories', 'calorie_intakes')

    def get_intakes(self, container):
        intakes = CalorieIntake.objects.filter(user=container.user).order_by('-date')
        serializer = CalorieIntakeSerializer(instance=intakes, many=True)
        return serializer.data


class UserSerializer(serializers.HyperlinkedModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile', 'password', 'is_superuser')


    def create(self, validated_data):
        if 'profile' in validated_data:
            profile_data = validated_data.pop('profile')
        else:
            profile_data = {}

        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])

        user = User.objects.create(**validated_data)
        UserProfile.objects.create(user=user, **profile_data)
        return user


    def update(self, instance, validated_data):
        if 'profile' in validated_data:
            profile_data = validated_data.pop('profile')
        else:
            profile_data = {}
        profile = instance.profile

        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        profile.is_manager = profile_data.get(
            'is_manager',
            profile.is_manager
        )
        profile.expected_calories = profile_data.get(
            'expected_calories',
            profile.expected_calories
         )
        profile.save()

        return instance


class CalorieIntakeSerializer(serializers.HyperlinkedModelSerializer):
    user = FlatUserSerializer()

    class Meta:
        model = CalorieIntake
        fields = ('id', 'user', 'date', 'calories', 'description')


class CalorieIntakePOSTSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = CalorieIntake
        fields = ('id', 'user', 'date', 'calories', 'description')
