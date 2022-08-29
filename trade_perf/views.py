from django.shortcuts import render
from datetime import datetime
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.db import connections
from django.contrib import messages
from django.urls import reverse
from plotly.offline import plot
import plotly.graph_objs as go
from . import plots

from .models import PriceData

# Create your views here.
def index(request):
    plot_dpnl = plots.plot_dpnl(PriceData)
    plot_tpnl = plots.plot_tpnl(PriceData)

    context = {"plot_dpnl": plot_dpnl, "plot_tpnl": plot_tpnl}
    return render(request, "trade_perf/index.html", context=context)


def render_page(request):
    data = list(PriceData.objects.values())

    return render(
        request,
        "trade_perf.html",
        {
            "date": date,
            "daily_pnl": daily_pnl,
        },
    )


def ajax_get_view(request):
    data = list(PriceData.objects.values())
    if request.headers.get("x-requested-with") == "XMLHttpRequest":
        return JsonResponse(data, safe=False)

    return render(request, "trade_perf/trade_perf.html")


# [i["date"] for i in data]

# list(map(lambda x: x["date"], data))
