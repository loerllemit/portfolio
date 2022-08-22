from django.contrib import admin
from django.urls import path, include
from crypto import views

urlpatterns = [path("crypto", views.AjaxHandler.as_view(), name="crypto")]
