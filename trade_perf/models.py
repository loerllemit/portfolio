from django.db import models

# Create your models here.
class PriceData(models.Model):
    date = models.DateField()
    pnl = models.DecimalField(max_digits=9, decimal_places=2)
    capital = models.DecimalField(max_digits=9, decimal_places=2)
    pct_pnl = models.DecimalField(max_digits=9, decimal_places=2)
