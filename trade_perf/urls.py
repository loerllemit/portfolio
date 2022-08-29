from django.contrib import admin
from django.urls import path, include
from trade_perf import views

urlpatterns = [
    path("trade", views.ajax_get_view, name="trade"),
    path("trades", views.index, name="index"),
    # path("crypto_test", views.AjaxHandler.as_view(), name="crypto"),
]
