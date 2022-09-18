from django.contrib import admin
from django.urls import path, include
from home import views

urlpatterns = [
    path("", views.home, name="home"),
    path("resume", views.resume, name="resume"),
    path("screener", views.screener, name="screener"),
    path("srcode", views.srcode, name="source_code"),
]
