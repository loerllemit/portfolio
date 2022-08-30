#%%
from trade_perf.models import AcctStatement
from django.db.models import Sum, F, Q, Window
from tabulate import tabulate
import pandas as pd


def outtab(queryset, limit=50):
    headers = queryset[0].keys()
    rows = [x.values() for x in queryset]
    if limit is not None:
        rows = rows[:limit]
    print(tabulate(rows, headers))


queryset = AcctStatement.objects.all()
queryset = AcctStatement.objects.filter(balance__gt=5).values("balance")
[print(e.balance) for e in gg]

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
        rec=Sum("realized_equity_change"),
        # gg=Sum("realized_equity"),
    )
    # .annotate(cumrec=Sum(Sum("realized_equity_change")))
    # .annotate(gg=Sum("realized_equity"))
    # .annotate(cumrec=Window(Sum("rec")))
)

daily_pnl = pd.DataFrame.from_records(daily_pnl)

daily_pnl["tot_pnl"] = daily_pnl["rec"].cumsum()
daily_pnl["capital"] = start_bal + daily_pnl["tot_pnl"]
daily_pnl["pct_pnl"] = (daily_pnl["capital"] - start_bal) / start_bal * 100


pd.read_sql(str(daily_pnl.query), engine)
outtab(daily_pnl)


[e for e in df]
outtab(df.values())


str(daily_pnl.query)
