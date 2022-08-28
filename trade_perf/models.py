from django.db import models

# Create your models here.
class PriceData(models.Model):
    date = models.DateField()
    pnl = models.FloatField()
