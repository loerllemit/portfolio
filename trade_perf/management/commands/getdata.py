#%%
import pandas as pd
import numpy as np
import json
from datetime import datetime
from pathlib import Path
import os

from django.core.management.base import BaseCommand, CommandError
from trade_perf.models import AcctStatement
from sqlalchemy import create_engine

#%%
class Command(BaseCommand):
    def handle(self, *args, **options):
        ios = "etoro-account-statement.xlsx"

        df = pd.read_excel(ios, sheet_name="Account Activity", engine="openpyxl")
        df = df.drop(columns=["Position ID", "Asset type", "NWA"])
        df.columns = [
            "date",
            "ordertype",
            "details",
            "amount",
            "units",
            "realized_equity_change",
            "realized_equity",
            "balance",
        ]
        df["date"] = pd.to_datetime(
            df["date"], format="%d/%m/%Y %H:%M:%S", utc=True
        ).dt.tz_convert("Asia/Manila")
        df["date"] = df["date"].dt.date
        print(df)
        engine = create_engine("sqlite:///db.sqlite3", echo=True)
        df.to_sql(
            AcctStatement._meta.db_table,
            con=engine,
            if_exists="replace",
            index=True,
            index_label="id",
        )
