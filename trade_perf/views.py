from django.shortcuts import render
from django.http import JsonResponse
from .management.commands import pnl_data

# Create your views here.
# def render_page(request):
#     return render(request, "generic.html")


def ajax_get_view(request):

    if request.headers.get("x-requested-with") == "XMLHttpRequest":

        return JsonResponse(pnl_data.dailypnl())

    return render(request, "trade_perf.html")
