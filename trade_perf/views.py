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
from rest_framework.views import APIView
from rest_framework.response import Response
from . import plots
from .models import AcctStatement


class GetData(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, *args, **kwargs):
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
        daily_pnl_pos = daily_pnl[daily_pnl["rec"] >= 0]
        daily_pnl_neg = daily_pnl[daily_pnl["rec"] < 0]

        pnl_df = pd.DataFrame.from_records(
            df.filter(ordertype="Position closed").values()
        )  # "Profit/Loss of Trade"
        pnl_df.loc[:, "outcome"] = [
            "win" if x >= 0 else "loss" for x in pnl_df["realized_equity_change"]
        ]
        pnl_df.loc[:, "streak"] = (
            pnl_df["outcome"]
            .groupby((pnl_df["outcome"] != pnl_df["outcome"].shift()).cumsum())
            .cumcount()
            + 1
        )

        win_streak = pnl_df.groupby("outcome").max()["streak"]["win"]
        loss_streak = pnl_df.groupby("outcome").max()["streak"]["loss"]

        win_trades = len(pnl_df[pnl_df["outcome"] == "win"])
        loss_trades = len(pnl_df[pnl_df["outcome"] == "loss"])
        tot_trades = win_trades + loss_trades
        win_rate = win_trades / (tot_trades) * 100

        # total_fee = df[df.Type != "Profit/Loss of Trade"]["realized_equity_change"].sum()
        total_fee = (
            df.exclude(ordertype="Profit/Loss of Trade")
            .aggregate(sum=Sum("realized_equity_change"))
            .get("sum")
        )
        total_gain = pnl_df.groupby("outcome")["realized_equity_change"].agg("sum")[
            "win"
        ]
        total_loss = pnl_df.groupby("outcome")["realized_equity_change"].agg("sum")[
            "loss"
        ]
        if total_fee >= 0:
            total_gain += total_fee
        else:
            total_loss += total_fee

        max_gain_trade = pnl_df["realized_equity_change"].max()
        max_loss_trade = pnl_df["realized_equity_change"].min()
        avg_gain = total_gain / win_trades
        avg_loss = total_loss / loss_trades
        profit_factor = abs(avg_gain / avg_loss)
        expectancy_ratio = (
            float(profit_factor) * win_rate / 100 - (100 - win_rate) / 100
        )

        ## top losers and winners
        # top_df = pnl_df.groupby("details").sum()
        top_df = pnl_df.groupby("details").agg(
            {"realized_equity_change": "sum", "streak": "sum"}
        )
        top_df = top_df.sort_values("realized_equity_change").reset_index()
        # print(top_df)
        top_gain = (
            top_df[top_df["realized_equity_change"] >= 0]
            .sort_values("realized_equity_change", ascending=True)
            .reset_index(drop=True)
        )
        top_loss = (
            top_df[top_df["realized_equity_change"] < 0]
            .sort_values("realized_equity_change", ascending=False)
            .reset_index(drop=True)
        )

        # %%
        ## Most traded asset
        # most_traded = pnl_df.groupby("details").size().reset_index(name="counts")
        # most_traded = most_traded.sort_values("counts", ascending=0, ignore_index=1)

        return Response(
            {
                "start_bal": start_bal,
                "daily_pnl": daily_pnl,
                "daily_pnl_pos": daily_pnl_pos,
                "daily_pnl_neg": daily_pnl_neg,
                "pnl_df": pnl_df,
            }
        )


def index(request):

    return render(request, "trade_perf/index.html")
