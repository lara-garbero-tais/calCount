from django.conf.urls import url, include
from rest_framework import routers
from api import urls as api_urls
from frontend import urls as frontend_urls

urlpatterns = [
	url(r'', include('frontend.urls')),
	url(r'^ajax_auth/', include('ajax_auth.urls')),
    url(r'^api/', include('api.urls'))
]
