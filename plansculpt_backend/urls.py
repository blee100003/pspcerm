from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # path('admin/', admin.site.urls), # Optional, uncomment if needed
    path('api/', include('api.urls')),
]
