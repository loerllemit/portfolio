# Generated by Django 3.2.15 on 2022-08-29 01:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trade_perf', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pricedata',
            name='pnl',
            field=models.DecimalField(decimal_places=2, max_digits=9),
        ),
    ]
