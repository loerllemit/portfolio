from django.contrib import admin
from django.urls import path, include
from trade_perf import views

urlpatterns = [
    path("trade", views.index, name="index"),
    path("api", views.GetData.as_view(), name="api"),
    # path("crypto_test", views.AjaxHandler.as_view(), name="crypto"),
]
