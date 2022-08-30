# from tabulate import tabulate
from django.db.models import Sum, F, Q, Window
import pandas as pd
from django.shortcuts import render
from datetime import datetime
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.db import connections
from django.contrib import messages
from django.urls import reverse
from plotly.offline import plot
import plotly.graph_objs as go
from . import plots
from .models import AcctStatement


def index(request):
    # Get data
    start_bal = (
        AcctStatement.objects.filter(ordertype__in=["Deposit", "Withdraw Request"])
        .aggregate(sum=Sum("realized_equity_change"))
        .get("sum")
    )

    df = AcctStatement.objects.exclude(
        Q(ordertype="Deposit") | Q(ordertype="Withdraw Request")
    )

    daily_pnl = (
        df.values("date")
        .order_by("date")
        .annotate(
            rec=Sum("realized_equity_change"),  # group by date then take sum
        )
    )

    daily_pnl = pd.DataFrame.from_records(daily_pnl)
    daily_pnl["tot_pnl"] = daily_pnl["rec"].cumsum()
    daily_pnl["capital"] = start_bal + daily_pnl["tot_pnl"]
    daily_pnl["pct_pnl"] = (daily_pnl["capital"] - start_bal) / start_bal * 100

    plot_dpnl = plots.plot_dpnl(daily_pnl)
    plot_tpnl = plots.plot_tpnl(start_bal, daily_pnl)

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
