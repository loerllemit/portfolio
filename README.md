<a href="https://portfolio-5owamhfmyq-de.a.run.app"><img src="https://img.shields.io/badge/launch-homepage-yellowgreen.svg"/></a>

# Personal Portfolio

## This repository contains the source code of my personal projects

All projects are hosted in the Google Cloud Platform using Cloud Run for deploying docker containers. Docker images are stored in the Google Artifact Registry.

> **Project 1 Cryptocurrency Realtime Chart:**

This project fetches the historical data of major cryptocurrencies from the Binance websockets API.

Backend: Django \
Frontend: Javascript, TradingView Lightweight Charts

Link: https://portfolio-5owamhfmyq-de.a.run.app/crypto

> **Project 2 Trade Performance:**

This project shows my own trading performance in the US stock market using Etoro as the brokerage account. The data is downloaded from my etoro account history as excel file. The excel file is then loaded in python pandas then converted to sqlite file. Data can be queried using Django Object Relational Mapping. The plots were done using Plotly JS and Google Charts.

Backend: Django ORM, Django API, Python pandas \
Frontend: Javascript, Plotly JS, Google Charts, Bootstrap

Link: https://portfolio-5owamhfmyq-de.a.run.app/trade

> **Project 3 Stock Screener:**

This project is written in jupyter notebook file.
The code will screen all the stocks in the SP 500 index according to its relative strength with respect to the index. The stocks are further screened based on criteria introduced by Mark Minervini in his book 'Think & Trade Like a Champion'. See this [link](https://in.tradingview.com/script/88aL78Qh-TwP-Mark-Minervini-Trend-Template-Criteria/) for details. This will output a list of stocks which you can use as watchlist to trade.

Backend: Jupyter \
Source Code: https://github.com/loerllemit/US_trading

Link: https://jupyter-5owamhfmyq-de.a.run.app/lab/tree/screener_long_SP500.ipynb
