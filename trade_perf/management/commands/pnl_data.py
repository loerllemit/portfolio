# To add a new cell, type '# %%'
# To add a new markdown cell, type '# %% [markdown]'
# %%
import pandas as pd
import numpy as np
import json
from datetime import datetime
from pathlib import Path
import os

from django.core.management.base import BaseCommand, CommandError
from trade_perf.models import PriceData


class Command(BaseCommand):
    def handle(self, *args, **options):

        # %%
        ios = Path(__file__).resolve().parent / "etoro-account-statement.xlsx"
        df = pd.read_excel(ios, sheet_name="Account Activity", engine="openpyxl")

        start_bal = (
            df[df["Type"] == "Deposit"]["Realized Equity Change"].sum()
            + df[df["Type"] == "Withdraw Request"]["Realized Equity Change"].sum()
        )

        df = df[(df["Type"] != "Deposit") & (df["Type"] != "Withdraw Request")]
        df["Date"] = pd.to_datetime(
            df["Date"], format="%d/%m/%Y %H:%M:%S", utc=True
        ).dt.tz_convert("Asia/Manila")
        df["date"] = df["Date"].dt.date
        df.sort_values(by=["date"], inplace=True, ignore_index=True)

        #%%
        daily_pnl = (df.groupby(["date"]).sum()).reset_index()
        daily_pnl["tot_pnl"] = daily_pnl["Realized Equity Change"].cumsum()
        daily_pnl["capital"] = start_bal + daily_pnl["tot_pnl"]
        daily_pnl["pct_pnl"] = (daily_pnl["capital"] - start_bal) / start_bal * 100

        pnl_df = df[df.Type == "Position closed"]  # "Profit/Loss of Trade"
        pnl_df.loc[:, "outcome"] = [
            "win" if x >= 0 else "loss" for x in pnl_df["Realized Equity Change"]
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

        total_fee = df[df.Type != "Profit/Loss of Trade"][
            "Realized Equity Change"
        ].sum()
        total_gain = pnl_df.groupby("outcome")["Realized Equity Change"].agg("sum")[
            "win"
        ]
        total_loss = pnl_df.groupby("outcome")["Realized Equity Change"].agg("sum")[
            "loss"
        ]

        if total_fee >= 0:
            total_gain += total_fee
        else:
            total_loss += total_fee

        max_gain_trade = pnl_df["Realized Equity Change"].max()
        max_loss_trade = pnl_df["Realized Equity Change"].min()
        avg_gain = total_gain / win_trades
        avg_loss = total_loss / loss_trades
        profit_factor = abs(avg_gain / avg_loss)
        expectancy_ratio = profit_factor * win_rate / 100 - (100 - win_rate) / 100

        # %%
        ## top losers and winners
        top_df = pnl_df.groupby("Details").sum()
        top_df = top_df.sort_values("Realized Equity Change").reset_index()
        top_gain = (
            top_df[top_df["Realized Equity Change"] >= 0]
            .sort_values("Realized Equity Change", ascending=True)
            .reset_index(drop=True)
        )
        top_loss = (
            top_df[top_df["Realized Equity Change"] < 0]
            .sort_values("Realized Equity Change", ascending=False)
            .reset_index(drop=True)
        )

        # %%
        ## Most traded asset
        most_traded = pnl_df.groupby("Details").size().reset_index(name="counts")
        most_traded = most_traded.sort_values("counts", ascending=0, ignore_index=1)

        # %%
        ## Daily pnl
        # def dailypnl():
        #     x = [str(daily_pnl.index.tolist()[i]) for i in range(len(daily_pnl.index.tolist()))]
        #     y = daily_pnl["Realized Equity Change"].round(decimals=2).tolist()
        #     return {"date": x, "daily_pnl": y}

        model_instances = [
            PriceData(
                date=record["date"],
                pnl=record["Realized Equity Change"],
            )
            for record in daily_pnl.to_dict("records")
        ]
        PriceData.objects.all().delete()
        PriceData.objects.bulk_create(model_instances)
