from django.db import models

# Create your models here.
# class PriceData(models.Model):
#     date = models.DateField()
#     pnl = models.DecimalField(max_digits=9, decimal_places=2)
#     capital = models.DecimalField(max_digits=9, decimal_places=2)
#     pct_pnl = models.DecimalField(max_digits=9, decimal_places=2)


class AcctStatement(models.Model):
    date = models.DateField()
    ordertype = models.CharField(max_length=20)
    details = models.CharField(max_length=40)
    amount = models.DecimalField(max_digits=9, decimal_places=2)
    units = models.FloatField()
    realized_equity_change = models.DecimalField(max_digits=9, decimal_places=2)
    realized_equity = models.DecimalField(max_digits=9, decimal_places=2)
    balance = models.DecimalField(max_digits=9, decimal_places=2)
