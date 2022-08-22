from django.contrib import admin
from django.urls import path, include
from asyncwait import views

urlpatterns = [path("asyncwait", views.AjaxHandler.as_view(), name="asyncwait")]
