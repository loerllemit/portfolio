from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("home.urls")),
    path("", include("crypto.urls")),
    path("api-auth/", include("rest_framework.urls")),
    path("", include("trade_perf.urls")),
]
