from django.contrib.auth.models import User
from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from api.models import CalorieIntake, UserProfile
from api.serializers import UserSerializer, UserProfileSerializer, CalorieIntakeSerializer, CalorieIntakePOSTSerializer



class CalorieIntakePermission(BasePermission):

    """View-level permission for CalorieIntake CRUD operations"""

    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser or (obj.user == request.user)


class UserPermission(BasePermission):

    """View-level permission for user and profile CRUD operations"""

    def has_object_permission(self, request, view, obj):
        return (request.user.is_superuser) or (request.user.is_authenticated()
                and request.user.profile.is_manager) or (obj == request.user)


class UserViewSet(viewsets.ModelViewSet):

    """API endpoint for User CRUD operations"""

    serializer_class = UserSerializer
    permission_classes = (UserPermission,)

    def get_queryset(self):
        if self.request.user.is_superuser or (self.request.user.is_authenticated()
                and self.request.user.profile.is_manager):
            return User.objects.all().order_by('-date_joined')
        else:
            return User.objects.filter(pk=self.request.user.pk).order_by('-date_joined')

    # Minimal combined endpoint for regular users
    @list_route(methods=['patch','get'], permission_classes=[IsAuthenticated])
    def me(self, request, *args, **kwargs):
        serializer = self.get_serializer(User.objects.get(pk=request.user.id))
        return Response(serializer.data)


class CalorieIntakeViewSet(viewsets.ModelViewSet):

    """API endpoint that lists calorie intake entries for the autenticated user."""

    permission_classes = (CalorieIntakePermission,)

    def get_queryset(self):
        if self.request.user.is_superuser:
            return CalorieIntake.objects.all().order_by('-date')
        else:
            return CalorieIntake.objects.filter(user=self.request.user).order_by('-date')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CalorieIntakePOSTSerializer
        else:
            return CalorieIntakeSerializer
